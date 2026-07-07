import logging
from django.db import transaction, connection
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny

from apps.fees.models.fee_groups import FeeGroups
from apps.fees.models.feetype import Feetype
from apps.fees.models.fee_session_groups import FeeSessionGroups
from apps.fees.models.fee_groups_feetype import FeeGroupsFeetype
from apps.academics.models import Classes, Sessions
from common.pagination.standard import StandardResultsSetPagination
from common.responses.api import APIResponse

logger = logging.getLogger(__name__)


def safe_date_str(value, fmt='%Y-%m-%dT%H:%M:%SZ'):
    if value is None:
        return None
    if isinstance(value, str):
        return value
    try:
        return value.strftime(fmt)
    except Exception:
        return str(value)

class DebugDBView(APIView):
    permission_classes = [AllowAny]
    def get(self, request):
        res = {}
        try:
            with connection.cursor() as cursor:
                res['assignments'] = []
                cursor.execute("SELECT * FROM fee_session_groups")
                rows = cursor.fetchall()
                if rows:
                    cols = [c[0] for c in cursor.description]
                    res['assignments'] = [dict(zip(cols, r)) for r in rows]
                
                res['lines'] = []
                cursor.execute("SELECT * FROM fee_groups_feetype")
                rows = cursor.fetchall()
                if rows:
                    cols = [c[0] for c in cursor.description]
                    res['lines'] = [dict(zip(cols, r)) for r in rows]

                res['student_fees_master'] = []
                cursor.execute("SELECT * FROM student_fees_master")
                rows = cursor.fetchall()
                res['student_session'] = []
                cursor.execute("SELECT * FROM student_session")
                rows = cursor.fetchall()
                if rows:
                    cols = [c[0] for c in cursor.description]
                    res['student_session'] = [dict(zip(cols, r)) for r in rows]
        except Exception as e:
            res['error'] = str(e)
        return APIResponse.success(data=res)






# ──────────────────────────────────────────────────────────────
# Fee Categories  (table: categories, NO MODEL as requested)
# ──────────────────────────────────────────────────────────────

def dictfetchall(cursor):
    "Return all rows from a cursor as a dict"
    columns = [col[0] for col in cursor.description]
    return [
        dict(zip(columns, row))
        for row in cursor.fetchall()
    ]

def _get_category_data(cat_dict):
    return {
        'id': cat_dict.get('id'),
        'name': cat_dict.get('category') or '',
        'is_active': cat_dict.get('is_active'),
        'created_at': safe_date_str(cat_dict.get('created_at')),
    }


class FeeCategoriesListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        with connection.cursor() as cursor:
            cursor.execute("SELECT * FROM categories ORDER BY category")
            rows = dictfetchall(cursor)

        paginator = StandardResultsSetPagination()
        paginated_rows = paginator.paginate_queryset(rows, request, view=self)

        current_page = paginated_rows if paginated_rows is not None else rows
        data = [_get_category_data(c) for c in current_page]

        if paginated_rows is not None:
            return paginator.get_paginated_response(data)

        return APIResponse.success(data=data, message='Fee categories retrieved successfully.')

    def post(self, request):
        data = request.data
        name = data.get('name', '').strip()

        if not name:
            return APIResponse.error(message='Category name is required.')

        with connection.cursor() as cursor:
            cursor.execute("SELECT id FROM categories WHERE LOWER(category) = LOWER(%s)", [name])
            if cursor.fetchone():
                return APIResponse.error(message='A category with this name already exists.')
            
            is_active = data.get('is_active', 'no')
            cursor.execute("INSERT INTO categories (category, is_active, created_at) VALUES (%s, %s, %s)", [name, is_active, timezone.now()])
            new_id = cursor.lastrowid
            
            cursor.execute("SELECT * FROM categories WHERE id = %s", [new_id])
            new_row = dictfetchall(cursor)[0]

        return APIResponse.success(data=_get_category_data(new_row), message='Fee category created successfully.')


class FeeCategoryDetailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, pk):
        with connection.cursor() as cursor:
            cursor.execute("SELECT * FROM categories WHERE id = %s", [pk])
            rows = dictfetchall(cursor)
        
        if not rows:
            return APIResponse.error(message='Fee category not found.', status_code=404)
        
        return APIResponse.success(data=_get_category_data(rows[0]), message='Fee category retrieved successfully.')

    def patch(self, request, pk):
        with connection.cursor() as cursor:
            cursor.execute("SELECT * FROM categories WHERE id = %s", [pk])
            rows = dictfetchall(cursor)
            
            if not rows:
                return APIResponse.error(message='Fee category not found.', status_code=404)
                
            data = request.data
            updates = []
            params = []
            
            if 'name' in data:
                name = data['name'].strip()
                if not name:
                    return APIResponse.error(message='Category name cannot be empty.')
                
                cursor.execute("SELECT id FROM categories WHERE LOWER(category) = LOWER(%s) AND id != %s", [name, pk])
                if cursor.fetchone():
                    return APIResponse.error(message='A category with this name already exists.')
                
                updates.append("category = %s")
                params.append(name)
                
            if 'is_active' in data:
                updates.append("is_active = %s")
                params.append(data['is_active'])
                
            if updates:
                updates.append("updated_at = %s")
                params.append(timezone.now().date())
                
                params.append(pk)
                query = f"UPDATE categories SET {', '.join(updates)} WHERE id = %s"
                cursor.execute(query, params)
                
            cursor.execute("SELECT * FROM categories WHERE id = %s", [pk])
            updated_row = dictfetchall(cursor)[0]
            
        return APIResponse.success(data=_get_category_data(updated_row), message='Fee category updated successfully.')

    def delete(self, request, pk):
        with connection.cursor() as cursor:
            cursor.execute("SELECT * FROM categories WHERE id = %s", [pk])
            rows = dictfetchall(cursor)
            
            if not rows:
                return APIResponse.error(message='Fee category not found.', status_code=404)
                
            cat = rows[0]
            if cat.get('is_active') == 'yes':
                return APIResponse.error(message='Deactivate the category before deleting.')
                
            if Feetype.objects.filter(feecategory_id=pk).exists():
                return APIResponse.error(message='Cannot delete a category that has fee types assigned to it.')
                
            cursor.execute("DELETE FROM categories WHERE id = %s", [pk])
            
        return APIResponse.success(message='Fee category deleted successfully.')


# ──────────────────────────────────────────────────────────────
# Fee Groups
# ──────────────────────────────────────────────────────────────

def _get_fee_group_data(group):
    return {
        'id': group.id,
        'name': group.name,
        'description': group.description,
        'is_system': group.is_system,
        'is_active': group.is_active,
        'created_at': safe_date_str(group.created_at),
    }


class FeeGroupsListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        groups_qs = FeeGroups.objects.all().order_by('name')

        paginator = StandardResultsSetPagination()
        paginated_qs = paginator.paginate_queryset(groups_qs, request, view=self)

        current_page = paginated_qs if paginated_qs is not None else groups_qs
        data = [_get_fee_group_data(g) for g in current_page]

        if paginated_qs is not None:
            return paginator.get_paginated_response(data)

        return APIResponse.success(data=data, message='Fee groups retrieved successfully.')

    def post(self, request):
        data = request.data
        name = data.get('name', '').strip()

        if not name:
            return APIResponse.error(message='Fee group name is required.')

        if FeeGroups.objects.filter(name__iexact=name).exists():
            return APIResponse.error(message='A fee group with this name already exists.')

        try:
            group = FeeGroups.objects.create(
                name=name,
                description=data.get('description', '').strip() if data.get('description') else None,
                is_system=0,
                is_active=data.get('is_active', 'no'),
                created_at=timezone.now()
            )
            return APIResponse.success(data=_get_fee_group_data(group), message='Fee group created successfully.')
        except Exception as e:
            logger.error(f"Error creating fee group: {e}")
            return APIResponse.error(message='Failed to create fee group.')


class FeeGroupDetailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, pk):
        group = FeeGroups.objects.filter(id=pk).first()
        if not group:
            return APIResponse.error(message='Fee group not found.', status_code=404)
        return APIResponse.success(data=_get_fee_group_data(group), message='Fee group retrieved successfully.')

    def patch(self, request, pk):
        group = FeeGroups.objects.filter(id=pk).first()
        if not group:
            return APIResponse.error(message='Fee group not found.', status_code=404)

        data = request.data
        if 'name' in data:
            name = data['name'].strip()
            if not name:
                return APIResponse.error(message='Fee group name cannot be empty.')
            if FeeGroups.objects.exclude(id=pk).filter(name__iexact=name).exists():
                return APIResponse.error(message='A fee group with this name already exists.')
            group.name = name

        if 'description' in data:
            desc = data['description']
            group.description = desc.strip() if desc else None

        if 'is_active' in data:
            group.is_active = data['is_active']

        try:
            group.save()
            return APIResponse.success(data=_get_fee_group_data(group), message='Fee group updated successfully.')
        except Exception as e:
            logger.error(f"Error updating fee group: {e}")
            return APIResponse.error(message='Failed to update fee group.')

    def delete(self, request, pk):
        group = FeeGroups.objects.filter(id=pk).first()
        if not group:
            return APIResponse.error(message='Fee group not found.', status_code=404)

        if group.is_active == 'yes':
            return APIResponse.error(message='Deactivate the fee group before deleting.')

        if group.is_system:
            return APIResponse.error(message='Cannot delete a system fee group.')

        try:
            group.delete()
            return APIResponse.success(message='Fee group deleted successfully.')
        except Exception as e:
            logger.error(f"Error deleting fee group: {e}")
            return APIResponse.error(message='Failed to delete fee group.')


# ──────────────────────────────────────────────────────────────
# Fee Types  (model: Feetype, table: feetype)
#   Fields: id, is_system, feecategory_id, type (name), code,
#           is_active, description, created_at, updated_at
# ──────────────────────────────────────────────────────────────

def _get_categories_map():
    with connection.cursor() as cursor:
        cursor.execute("SELECT id, category FROM categories")
        return {row[0]: row[1] for row in cursor.fetchall()}

def _get_fee_type_data(ft, category_map=None):
    if category_map is None:
        category_map = {}
    return {
        'id': ft.id,
        'code': ft.code or '',
        'name': ft.type or '',
        'feecategory_id': ft.feecategory_id,
        'category_name': category_map.get(ft.feecategory_id),
        'description': ft.description,
        'is_active': ft.is_active,
        'created_at': safe_date_str(ft.created_at),
        'updated_at': safe_date_str(ft.updated_at, '%Y-%m-%d'),
    }


class FeeTypesListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        qs = Feetype.objects.all().order_by('type')

        paginator = StandardResultsSetPagination()
        paginated_qs = paginator.paginate_queryset(qs, request, view=self)

        current_page = paginated_qs if paginated_qs is not None else qs
        
        category_map = _get_categories_map()
        data = [_get_fee_type_data(ft, category_map) for ft in current_page]

        if paginated_qs is not None:
            return paginator.get_paginated_response(data)

        return APIResponse.success(data=data, message='Fee types retrieved successfully.')

    def post(self, request):
        data = request.data
        name = data.get('name', '').strip()
        code = data.get('code', '').strip().upper()

        if not name:
            return APIResponse.error(message='Fee type name is required.')
        if not code:
            return APIResponse.error(message='Fee type code is required.')

        if Feetype.objects.filter(code__iexact=code).exists():
            return APIResponse.error(message='A fee type with this code already exists.')

        try:
            ft = Feetype.objects.create(
                type=name,
                code=code,
                feecategory_id=data.get('feecategory_id'),
                description=data.get('description', '').strip() if data.get('description') else None,
                is_active=data.get('is_active', 'no'),
                is_system=0,
                created_at=timezone.now()
            )
            category_map = _get_categories_map()
            return APIResponse.success(data=_get_fee_type_data(ft, category_map), message='Fee type created successfully.')
        except Exception as e:
            logger.error(f"Error creating fee type: {e}")
            return APIResponse.error(message='Failed to create fee type.')


class FeeTypeDetailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, pk):
        ft = Feetype.objects.filter(id=pk).first()
        if not ft:
            return APIResponse.error(message='Fee type not found.', status_code=404)
        category_map = _get_categories_map()
        return APIResponse.success(data=_get_fee_type_data(ft, category_map), message='Fee type retrieved successfully.')

    def patch(self, request, pk):
        ft = Feetype.objects.filter(id=pk).first()
        if not ft:
            return APIResponse.error(message='Fee type not found.', status_code=404)

        data = request.data
        if 'code' in data:
            code = data['code'].strip().upper()
            if not code:
                return APIResponse.error(message='Fee type code cannot be empty.')
            if Feetype.objects.exclude(id=pk).filter(code__iexact=code).exists():
                return APIResponse.error(message='A fee type with this code already exists.')
            ft.code = code

        if 'name' in data:
            name = data['name'].strip()
            if not name:
                return APIResponse.error(message='Fee type name cannot be empty.')
            ft.type = name

        if 'description' in data:
            desc = data['description']
            ft.description = desc.strip() if desc else None

        if 'feecategory_id' in data:
            ft.feecategory_id = data['feecategory_id']

        if 'is_active' in data:
            ft.is_active = data['is_active']

        try:
            ft.updated_at = timezone.now().date()
            ft.save()
            category_map = _get_categories_map()
            return APIResponse.success(data=_get_fee_type_data(ft, category_map), message='Fee type updated successfully.')
        except Exception as e:
            logger.error(f"Error updating fee type: {e}")
            return APIResponse.error(message='Failed to update fee type.')

    def delete(self, request, pk):
        ft = Feetype.objects.filter(id=pk).first()
        if not ft:
            return APIResponse.error(message='Fee type not found.', status_code=404)

        if ft.is_active == 'yes':
            return APIResponse.error(message='Deactivate the fee type before deleting.')

        try:
            ft.delete()
            return APIResponse.success(message='Fee type deleted successfully.')
        except Exception as e:
            logger.error(f"Error deleting fee type: {e}")
            return APIResponse.error(message='Failed to delete fee type.')


# ──────────────────────────────────────────────────────────────
# Fee Assignments
#   Header: FeeSessionGroups (fee_session_groups table)
#     Fields: id, fee_groups_id, session_id, class_id, is_active, created_at
#   Lines:  FeeGroupsFeetype (fee_groups_feetype table)
#     Fields: id, parent_id, fee_session_group_id, fee_groups_id,
#             feetype_id, session_id, class_id, amount, fine_type,
#             due_date, fine_percentage, fine_amount, collection_type,
#             is_active, created_at
# ──────────────────────────────────────────────────────────────

def _build_assignment_response(fsg):
    """Build enriched assignment dict from a FeeSessionGroups row."""
    lines_qs = FeeGroupsFeetype.objects.filter(fee_session_group_id=fsg.id).order_by('id')

    # Look up related names
    fee_group = FeeGroups.objects.filter(id=fsg.fee_groups_id).first()
    school_class = Classes.objects.filter(id=fsg.class_id).first()
    session = Sessions.objects.filter(id=fsg.session_id).first()

    # Build fee type lookup for line items
    feetype_ids = [line.feetype_id for line in lines_qs]
    feetypes = {ft.id: ft for ft in Feetype.objects.filter(id__in=feetype_ids)}

    lines = []
    total_amount = 0
    for line in lines_qs:
        ft = feetypes.get(line.feetype_id)
        amt = float(line.amount) if line.amount else 0
        lines.append({
            'id': line.id,
            'feetype_id': line.feetype_id,
            'feetype_code': ft.code if ft else '—',
            'feetype_name': ft.type if ft else 'Unknown',
            'amount': amt,
            'due_date': safe_date_str(line.due_date, '%Y-%m-%d'),
        })
        total_amount += amt

    return {
        'id': fsg.id,
        'class_id': fsg.class_id,
        'class_name': school_class.class_field if school_class else '—',
        'fee_group_id': fsg.fee_groups_id,
        'fee_group_name': fee_group.name if fee_group else '—',
        'session_id': fsg.session_id,
        'session_name': session.session if session else '—',
        'lines': lines,
        'total_amount': total_amount,
        'is_active': fsg.is_active,
        'created_at': safe_date_str(fsg.created_at),
        'updated_at': None,
    }


class FeeAssignmentsListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        qs = FeeSessionGroups.objects.all().order_by('id')

        paginator = StandardResultsSetPagination()
        paginated_qs = paginator.paginate_queryset(qs, request, view=self)

        current_page = paginated_qs if paginated_qs is not None else qs
        data = [_build_assignment_response(fsg) for fsg in current_page]

        if paginated_qs is not None:
            return paginator.get_paginated_response(data)

        return APIResponse.success(data=data, message='Fee assignments retrieved successfully.')

    def post(self, request):
        data = request.data

        class_id = data.get('class_id')
        fee_group_id = data.get('fee_group_id')
        session_id = data.get('session_id')
        lines = data.get('lines', [])
        is_active = data.get('is_active', 'no')

        if not class_id or not fee_group_id or not session_id:
            return APIResponse.error(message='Class, fee group, and session are required.')

        if not lines:
            return APIResponse.error(message='Add at least one fee line.')

        try:
            with transaction.atomic():
                fsg = FeeSessionGroups.objects.create(
                    fee_groups_id=fee_group_id,
                    class_id=class_id,
                    session_id=session_id,
                    is_active=is_active,
                    created_at=timezone.now()
                )

                for line in lines:
                    FeeGroupsFeetype.objects.create(
                        parent_id=0,
                        fee_session_group_id=fsg.id,
                        fee_groups_id=fee_group_id,
                        feetype_id=line.get('feetype_id'),
                        session_id=session_id,
                        class_id=class_id,
                        amount=line.get('amount', 0),
                        due_date=line.get('due_date') if line.get('due_date') else None,
                        fine_type='none',
                        fine_percentage=0,
                        fine_amount=0,
                        collection_type=0,
                        is_active=is_active,
                        created_at=timezone.now()
                    )

                return APIResponse.success(
                    data=_build_assignment_response(fsg),
                    message='Fee assignment created successfully.'
                )
        except Exception as e:
            logger.error(f"Error creating fee assignment: {e}")
            return APIResponse.error(message=f'Failed to create fee assignment: {str(e)}')


class FeeAssignmentDetailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, pk):
        fsg = FeeSessionGroups.objects.filter(id=pk).first()
        if not fsg:
            return APIResponse.error(message='Fee assignment not found.', status_code=404)
        return APIResponse.success(
            data=_build_assignment_response(fsg),
            message='Fee assignment retrieved successfully.'
        )

    def patch(self, request, pk):
        fsg = FeeSessionGroups.objects.filter(id=pk).first()
        if not fsg:
            return APIResponse.error(message='Fee assignment not found.', status_code=404)

        data = request.data
        class_id = data.get('class_id', fsg.class_id)
        fee_group_id = data.get('fee_group_id', fsg.fee_groups_id)
        session_id = data.get('session_id', fsg.session_id)
        lines = data.get('lines')
        is_active = data.get('is_active', fsg.is_active)

        try:
            with transaction.atomic():
                fsg.class_id = class_id
                fsg.fee_groups_id = fee_group_id
                fsg.session_id = session_id
                fsg.is_active = is_active
                fsg.save()

                # Replace lines if provided
                if lines is not None:
                    FeeGroupsFeetype.objects.filter(fee_session_group_id=fsg.id).delete()
                    for line in lines:
                        FeeGroupsFeetype.objects.create(
                            parent_id=0,
                            fee_session_group_id=fsg.id,
                            fee_groups_id=fee_group_id,
                            feetype_id=line.get('feetype_id'),
                            session_id=session_id,
                            class_id=class_id,
                            amount=line.get('amount', 0),
                            due_date=line.get('due_date') if line.get('due_date') else None,
                            fine_type='none',
                            fine_percentage=0,
                            fine_amount=0,
                            collection_type=0,
                            is_active=is_active,
                            created_at=timezone.now()
                        )

                return APIResponse.success(
                    data=_build_assignment_response(fsg),
                    message='Fee assignment updated successfully.'
                )
        except Exception as e:
            logger.error(f"Error updating fee assignment: {e}")
            return APIResponse.error(message=f'Failed to update fee assignment: {str(e)}')

    def delete(self, request, pk):
        fsg = FeeSessionGroups.objects.filter(id=pk).first()
        if not fsg:
            return APIResponse.error(message='Fee assignment not found.', status_code=404)

        if fsg.is_active == 'yes':
            return APIResponse.error(message='Deactivate the assignment before deleting.')

        try:
            with transaction.atomic():
                FeeGroupsFeetype.objects.filter(fee_session_group_id=fsg.id).delete()
                fsg.delete()
            return APIResponse.success(message='Fee assignment deleted successfully.')
        except Exception as e:
            logger.error(f"Error deleting fee assignment: {e}")
            return APIResponse.error(message='Failed to delete fee assignment.')
