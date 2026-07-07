import logging 
import datetime
import re
from django.db import transaction
from django.utils import timezone

def _validate_session_format(session_name):
    session_name_clean = str(session_name).strip()
    match = re.match(r'^(\d{4})\s*-\s*(\d{2,4})$', session_name_clean)
    if not match:
        return False, 'Session must be in format YYYY-YYYY or YYYY-YY (e.g., 2026-2027).'
    
    start_year = int(match.group(1))
    end_year_str = match.group(2)
    if len(end_year_str) == 2:
        end_year = int(str(start_year)[:2] + end_year_str)
    else:
        end_year = int(end_year_str)
        
    if end_year - start_year != 1:
        return False, 'Session not allowed.'
        
    return True, session_name_clean
    

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework import status

from .models import (
    ClassSections,
    Classes,
    Sections,
    Sessions,
    Subjects
)

from apps.students.models import StudentSession

logger = logging.getLogger(__name__)

from common.pagination.standard import StandardResultsSetPagination
from common.responses.api import APIResponse

# for GET request
class ClassSectionsListView(APIView):
    permission_classes = [AllowAny]
    def get(self, request):
        user_role = (request.user.role if request.user.is_authenticated else None)
        if not user_role:
            return Response({'status': 'error', 'message': 'Authentication required. Please login first.'}, status=status.HTTP_401_UNAUTHORIZED)
            
        active_only = request.query_params.get('active_only', 'false').lower() == 'true'
        mappings_qs = ClassSections.objects.all().order_by('id')
        if active_only:
            mappings_qs = mappings_qs.filter(is_active='yes')
            
        paginator = StandardResultsSetPagination()
        paginated_qs = paginator.paginate_queryset(mappings_qs, request, view=self)
        
        current_page = paginated_qs if paginated_qs is not None else mappings_qs
        class_ids = [m.class_id for m in current_page if m.class_id]
        section_ids = [m.section_id for m in current_page if m.section_id]
        
        classes_dict = {c.id: c.class_field for c in Classes.objects.filter(id__in=class_ids)}
        sections_dict = {s.id: s.section for s in Sections.objects.filter(id__in=section_ids)}
            
        mappings_data = []
        for m in current_page:
            mappings_data.append({
                'id': m.id,
                'class_id': m.class_id,
                'class_name': classes_dict.get(m.class_id),
                'section_id': m.section_id,
                'section_name': sections_dict.get(m.section_id),
                'is_active': m.is_active,
                'created_at': m.created_at.strftime('%Y-%m-%d %H:%M:%S') if m.created_at else None,
                'updated_at': m.updated_at.strftime('%Y-%m-%d') if m.updated_at else None
            })
            
        if paginated_qs is not None:
            return paginator.get_paginated_response({'class_sections': mappings_data})
            
        return Response({'status': 'success', 'data': {'class_sections': mappings_data}, 'message': 'Class-Section mappings retrieved successfully.'}, status=status.HTTP_200_OK)

    def post(self, request):
        user_role = (request.user.role if request.user.is_authenticated else None)
        is_admin = getattr(request.user, 'is_superadmin', False) or (user_role and str(user_role).strip().lower() in ['super admin', 'admin', 'superadmin'])
        if not is_admin:
            return Response({'status': 'error', 'message': 'Access denied. Only Super Admins or Admins can create mappings.'}, status=status.HTTP_403_FORBIDDEN)
            
        data = request.data
        class_id = data.get('class_id')
        section_id = data.get('section_id')
        is_active = data.get('is_active', 'yes')

        if not class_id or not section_id:
            return Response({'status': 'error', 'message': 'Both class_id and section_id are required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            class_id = int(class_id)
            section_id = int(section_id)
        except ValueError:
            return Response({'status': 'error', 'message': 'class_id and section_id must be integers.'}, status=status.HTTP_400_BAD_REQUEST)

        if not Classes.objects.filter(id=class_id).exists():
            return Response({'status': 'error', 'message': 'Class not found.'}, status=status.HTTP_404_NOT_FOUND)
            
        if not Sections.objects.filter(id=section_id).exists():
            return Response({'status': 'error', 'message': 'Section not found.'}, status=status.HTTP_404_NOT_FOUND)

        if ClassSections.objects.filter(class_id=class_id, section_id=section_id).exists():
            return Response({'status': 'error', 'message': 'This class and section combination already exists.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            new_mapping = ClassSections.objects.create(
                class_id=class_id,
                section_id=section_id,
                is_active=is_active,
                created_at=timezone.now()
            )
            class_obj = Classes.objects.get(id=class_id)
            section_obj = Sections.objects.get(id=section_id)
            
            logger.info(f"Class-Section mapping created by user {(request.user.username if request.user.is_authenticated else 'Unknown')}.")
            return Response({'status': 'success', 'data': {
                'id': new_mapping.id,
                'class_id': new_mapping.class_id,
                'class_name': class_obj.class_field,
                'section_id': new_mapping.section_id,
                'section_name': section_obj.section,
                'is_active': new_mapping.is_active,
                'created_at': new_mapping.created_at.strftime('%Y-%m-%d %H:%M:%S')
            }, 'message': 'Mapping created successfully.'}, status=status.HTTP_201_CREATED)
        except Exception as e:
            logger.error(f"Error creating mapping: {str(e)}")
            return Response({'status': 'error', 'message': f"Database error: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


#for post and put request
class ClassSectionsBulkAssignView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        user_role = (request.user.role if request.user.is_authenticated else None)
        is_admin = getattr(request.user, 'is_superadmin', False) or (user_role and str(user_role).strip().lower() in ['super admin', 'admin', 'superadmin'])
        if not is_admin:
            return Response({'status': 'error', 'message': 'Access denied. Only Super Admins or Admins can assign sections to classes.'}, status=status.HTTP_403_FORBIDDEN)
                    
        data = request.data
        class_id = data.get('class_id')
        section_ids = data.get('section_ids')

        if not class_id or section_ids is None:
            return Response({'status': 'error', 'message': 'Please provide class_id and section_ids list.'}, status=status.HTTP_400_BAD_REQUEST)

        if not isinstance(section_ids, list):
            return Response({'status': 'error', 'message': 'section_ids must be a list.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            class_id = int(class_id)
            section_ids = list(set([int(sid) for sid in section_ids]))
        except (ValueError, TypeError):
            return Response({'status': 'error', 'message': 'class_id and section_ids must contain valid integers.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            class_obj = Classes.objects.get(pk=class_id)
        except Classes.DoesNotExist:
            return Response({'status': 'error', 'message': 'Class not found.'}, status=status.HTTP_404_NOT_FOUND)

        sections = Sections.objects.filter(id__in=section_ids)
        if len(sections) != len(section_ids):
            return Response({'status': 'error', 'message': 'One or more provided section IDs are invalid.'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            with transaction.atomic():
                existing_mappings = ClassSections.objects.filter(class_id=class_obj.id)
                mapping_dict = {m.section_id: m for m in existing_mappings}

                # 1. Update or create new mappings
                for sec_id in section_ids:
                    if sec_id in mapping_dict:
                        m = mapping_dict[sec_id]
                        if m.is_active != 'yes':
                            m.is_active = 'yes'
                            m.updated_at = datetime.date.today()
                            m.save()
                    else:
                        sec_obj = next(s for s in sections if s.id == sec_id)
                        ClassSections.objects.create(
                            class_id=class_obj.id,
                            section_id=sec_obj.id,
                            is_active='yes',
                            created_at=timezone.now()
                        )

                # 2. Deactivate ones that were removed
                for sec_id, m in mapping_dict.items():
                    if sec_id not in section_ids:
                        active_student_sessions = StudentSession.objects.filter(
                            class_id=class_obj.id,
                            section_id=m.section_id,
                            is_active='yes'
                        ).exists()
                        if active_student_sessions:
                            sec_obj_remove = Sections.objects.get(id=m.section_id)
                            raise ValueError(f"Cannot remove section '{sec_obj_remove.section}' from class '{class_obj.class_field}' because active students are assigned to this specific mapping.")
                        
                        if m.is_active != 'no':
                            m.is_active = 'no'
                            m.updated_at = datetime.date.today()
                            m.save()

            logger.info(f"ClassSections updated for class '{class_obj.class_field}' by user {(request.user.username if request.user.is_authenticated else 'Unknown')}.")
            return Response({'status': 'success', 'message': f"Sections successfully assigned/updated for class '{class_obj.class_field}'."}, status=status.HTTP_200_OK)
        except ValueError as val_err:
            return Response({'status': 'error', 'message': str(val_err)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Error bulk assigning sections to class {class_id}: {str(e)}")
            return Response({'status': 'error', 'message': f"Database transaction error: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ClassAssignedSectionsView(APIView):
    permission_classes = [AllowAny]
    def get(self, request, class_id):
        user_role = (request.user.role if request.user.is_authenticated else None)
        if not user_role:
            return Response({'status': 'error', 'message': 'Authentication required. Please login first.'}, status=status.HTTP_401_UNAUTHORIZED)
            
        try:
            class_obj = Classes.objects.get(pk=class_id)
        except Classes.DoesNotExist:
            return Response({'status': 'error', 'message': 'Class not found.'}, status=status.HTTP_404_NOT_FOUND)

        active_only = request.query_params.get('active_only', 'true').lower() == 'true'
        mappings = ClassSections.objects.filter(class_id=class_obj.id)
        if active_only:
            mappings = mappings.filter(is_active='yes')

        paginator = StandardResultsSetPagination()
        paginated_mappings = paginator.paginate_queryset(mappings, request, view=self)

        current_page = paginated_mappings if paginated_mappings is not None else mappings
        section_ids = [m.section_id for m in current_page if m.section_id]
        sections_dict = {s.id: s.section for s in Sections.objects.filter(id__in=section_ids)}

        sections_data = []
        for m in current_page:
            if m.section_id:
                sections_data.append({
                    'mapping_id': m.id,
                    'section_id': m.section_id,
                    'section_name': sections_dict.get(m.section_id),
                    'is_active': m.is_active
                })

        if paginated_mappings is not None:
            return paginator.get_paginated_response({
                'class': class_obj.class_field,
                'assigned_sections': sections_data
            })

        return Response({'status': 'success', 'data': {
            'class': class_obj.class_field,
            'assigned_sections': sections_data
        }, 'message': 'Assigned sections retrieved successfully.'}, status=status.HTTP_200_OK)

class ClassSectionsDetailView(APIView):
    permission_classes = [AllowAny]
    def get(self, request, pk):
        user_role = (request.user.role if request.user.is_authenticated else None)
        if not user_role:
            return Response({'status': 'error', 'message': 'Authentication required. Please login first.'}, status=status.HTTP_401_UNAUTHORIZED)
            
        try:
            mapping = ClassSections.objects.get(pk=pk)
        except ClassSections.DoesNotExist:
            return Response({'status': 'error', 'message': 'Class-Section mapping not found.'}, status=status.HTTP_404_NOT_FOUND)
            
        class_obj = Classes.objects.filter(id=mapping.class_id).first() if mapping.class_id else None
        section_obj = Sections.objects.filter(id=mapping.section_id).first() if mapping.section_id else None
            
        return Response({'status': 'success', 'data': {
            'id': mapping.id,
            'class_id': mapping.class_id,
            'class_name': class_obj.class_field if class_obj else None,
            'section_id': mapping.section_id,
            'section_name': section_obj.section if section_obj else None,
            'is_active': mapping.is_active,
            'created_at': mapping.created_at.strftime('%Y-%m-%d %H:%M:%S') if mapping.created_at else None,
            'updated_at': mapping.updated_at.strftime('%Y-%m-%d') if mapping.updated_at else None
        }, 'message': 'Mapping details retrieved successfully.'}, status=status.HTTP_200_OK)

    def patch(self, request, pk):
        return self.put(request, pk)

    def put(self, request, pk):
        user_role = (request.user.role if request.user.is_authenticated else None)
        if not user_role:
            return Response({'status': 'error', 'message': 'Authentication required. Please login first.'}, status=status.HTTP_401_UNAUTHORIZED)
        is_admin = getattr(request.user, 'is_superadmin', False) or (user_role and str(user_role).strip().lower() in ['super admin', 'admin', 'superadmin'])
        if not is_admin:
            return Response({'status': 'error', 'message': 'Access denied. Only Super Admins or Admins can modify mappings.'}, status=status.HTTP_403_FORBIDDEN)
            
        try:
            mapping = ClassSections.objects.get(pk=pk)
        except ClassSections.DoesNotExist:
            return Response({'status': 'error', 'message': 'Class-Section mapping not found.'}, status=status.HTTP_404_NOT_FOUND)
            
        data = request.data
        is_active = data.get('is_active')

        if is_active is not None:
            if str(is_active).lower() not in ['yes', 'no']:
                return Response({'status': 'error', 'message': "is_active must be 'yes' or 'no'."}, status=status.HTTP_400_BAD_REQUEST)
            
            # Deactivation dependency checks
            if str(is_active).lower() == 'no' and mapping.class_id and mapping.section_id:
                active_student_sessions = StudentSession.objects.filter(
                    class_id=mapping.class_id,
                    section_id=mapping.section_id,
                    is_active='yes'
                ).exists()
                if active_student_sessions:
                    return Response({'status': 'error', 'message': f"Cannot deactivate mapping. Active students are currently assigned to this mapping."}, status=status.HTTP_400_BAD_REQUEST)
            
            mapping.is_active = str(is_active).lower()

        try:
            mapping.updated_at = datetime.date.today()
            mapping.save()
            logger.info(f"Class-Section mapping ID {pk} updated by user {(request.user.username if request.user.is_authenticated else 'Unknown')}.")
            return Response({'status': 'success', 'data': {
                'id': mapping.id,
                'is_active': mapping.is_active,
                'updated_at': mapping.updated_at.strftime('%Y-%m-%d')
            }, 'message': 'Mapping updated successfully.'}, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error updating mapping ID {pk}: {str(e)}")
            return Response({'status': 'error', 'message': f"Database error: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def delete(self, request, pk):
        user_role = (request.user.role if request.user.is_authenticated else None)
        if not user_role:
            return Response({'status': 'error', 'message': 'Authentication required. Please login first.'}, status=status.HTTP_401_UNAUTHORIZED)
        is_admin = getattr(request.user, 'is_superadmin', False) or (user_role and str(user_role).strip().lower() in ['super admin', 'admin', 'superadmin'])
        if not is_admin:
            return Response({'status': 'error', 'message': 'Access denied. Only Super Admins or Admins can delete mappings.'}, status=status.HTTP_403_FORBIDDEN)
            
        try:
            mapping = ClassSections.objects.get(pk=pk)
        except ClassSections.DoesNotExist:
            return Response({'status': 'error', 'message': 'Class-Section mapping not found.'}, status=status.HTTP_404_NOT_FOUND)
            
        if mapping.class_id and mapping.section_id:
            active_student_sessions = StudentSession.objects.filter(
                class_id=mapping.class_id,
                section_id=mapping.section_id,
                is_active='yes'
            ).exists()
            if active_student_sessions:
                return Response({'status': 'error', 'message': f"Cannot deactivate mapping. Active students are currently assigned to this mapping."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            mapping.is_active = 'no'
            mapping.updated_at = datetime.date.today()
            mapping.save()
            logger.info(f"Class-Section mapping ID {pk} deactivated.")
            return Response({'status': 'success', 'message': 'Class-Section mapping successfully deactivated.'}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'status': 'error', 'message': f"Database error: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class SectionsListCreateView(APIView):
    """List all sections (GET) or create a new section (POST)."""
    permission_classes = [AllowAny]

    def get(self, request):
        user_role = (request.user.role if request.user.is_authenticated else None)
        if not user_role:
            return APIResponse.error(
                message='Authentication required. Please login first.',
                status_code=status.HTTP_401_UNAUTHORIZED,
            )
            
        active_only = request.query_params.get('active_only', 'false').lower() == 'true'
        sections_qs = Sections.objects.all().order_by('id')
        if active_only:
            sections_qs = sections_qs.filter(is_active='yes')
        
        paginator = StandardResultsSetPagination()
        paginated_sections = paginator.paginate_queryset(sections_qs, request, view=self)
        
        sections_data = []
        for s in (paginated_sections if paginated_sections is not None else sections_qs):
            sections_data.append({
                'id': s.id,
                'section_name': s.section,
                'is_active': s.is_active,
                'created_at': s.created_at.strftime('%Y-%m-%d %H:%M:%S') if s.created_at else None,
                'updated_at': s.updated_at.strftime('%Y-%m-%d') if s.updated_at else None
            })
            
        if paginated_sections is not None:
            return paginator.get_paginated_response({'sections': sections_data})
            
        return APIResponse.success(
            data={'sections': sections_data},
            message='Sections retrieved successfully.',
        )
        
    def post(self, request):
        user_role = (request.user.role if request.user.is_authenticated else None)
        if not user_role:
            return APIResponse.error(
                message='Authentication required. Please login first.',
                status_code=status.HTTP_401_UNAUTHORIZED,
            )
        is_admin = getattr(request.user, 'is_superadmin', False) or (user_role and str(user_role).strip().lower() in ['super admin', 'admin', 'superadmin'])
        if not is_admin:
            return APIResponse.error(
                message='Access denied. Only Super Admins or Admins can create sections.',
                status_code=status.HTTP_403_FORBIDDEN,
            )

        data = request.data
        section_name = data.get('section_name')
        if not section_name or not str(section_name).strip():
            return APIResponse.error(
                message='Section name is required.',
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        section_name_clean = str(section_name).strip()
        if Sections.objects.filter(section__iexact=section_name_clean).exists():
            return APIResponse.error(
                message=f"Section '{section_name_clean}' already exists.",
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        try:
            new_section = Sections.objects.create(
                section=section_name_clean,
                is_active='yes',
                created_at=timezone.now(),
            )
            logger.info(
                f"Section '{section_name_clean}' created by user {(request.user.username if request.user.is_authenticated else 'Unknown')}."
            )
            return APIResponse.success(
                data={
                    'id': new_section.id,
                    'section_name': new_section.section,
                    'is_active': new_section.is_active,
                },
                message=f"Section '{section_name_clean}' created successfully.",
                status_code=status.HTTP_201_CREATED,
            )
        except Exception as e:
            logger.error(f"Error creating section: {str(e)}")
            return APIResponse.error(
                message=f"Database error: {str(e)}",
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class SectionsDetailView(APIView):
    """Retrieve (GET), update (PUT/PATCH), or soft-delete (DELETE) a section."""
    permission_classes = [AllowAny]

    def _get_section(self, pk):
        """Helper to fetch a section by pk or return None."""
        try:
            return Sections.objects.get(pk=pk)
        except Sections.DoesNotExist:
            return None

    def get(self, request, pk):
        user_role = (request.user.role if request.user.is_authenticated else None)
        if not user_role:
            return APIResponse.error(
                message='Authentication required. Please login first.',
                status_code=status.HTTP_401_UNAUTHORIZED,
            )

        section_obj = self._get_section(pk)
        if section_obj is None:
            return APIResponse.error(
                message='Section not found.',
                status_code=status.HTTP_404_NOT_FOUND,
            )

        return APIResponse.success(
            data={
                'id': section_obj.id,
                'section_name': section_obj.section,
                'is_active': section_obj.is_active,
                'created_at': section_obj.created_at.strftime('%Y-%m-%d %H:%M:%S') if section_obj.created_at else None,
                'updated_at': section_obj.updated_at.strftime('%Y-%m-%d') if section_obj.updated_at else None,
            },
            message='Section details retrieved successfully.',
        )

    def patch(self, request, pk):
        return self.put(request, pk)

    def put(self, request, pk):
        user_role = (request.user.role if request.user.is_authenticated else None)
        if not user_role:
            return APIResponse.error(
                message='Authentication required. Please login first.',
                status_code=status.HTTP_401_UNAUTHORIZED,
            )
        is_admin = getattr(request.user, 'is_superadmin', False) or (user_role and str(user_role).strip().lower() in ['super admin', 'admin', 'superadmin'])
        if not is_admin:
            return APIResponse.error(
                message='Access denied. Only Super Admins or Admins can modify sections.',
                status_code=status.HTTP_403_FORBIDDEN,
            )

        section_obj = self._get_section(pk)
        if section_obj is None:
            return APIResponse.error(
                message='Section not found.',
                status_code=status.HTTP_404_NOT_FOUND,
            )

        data = request.data
        section_name = data.get('section_name')
        is_active = data.get('is_active')

        if section_name is not None:
            section_name_clean = str(section_name).strip()
            if not section_name_clean:
                return APIResponse.error(
                    message='Section name cannot be empty.',
                    status_code=status.HTTP_400_BAD_REQUEST,
                )
            if Sections.objects.filter(section__iexact=section_name_clean).exclude(pk=pk).exists():
                return APIResponse.error(
                    message=f"Section '{section_name_clean}' already exists.",
                    status_code=status.HTTP_400_BAD_REQUEST,
                )
            section_obj.section = section_name_clean

        if is_active is not None:
            if str(is_active).lower() not in ['yes', 'no']:
                return APIResponse.error(
                    message="is_active must be 'yes' or 'no'.",
                    status_code=status.HTTP_400_BAD_REQUEST,
                )
            section_obj.is_active = str(is_active).lower()

        try:
            section_obj.updated_at = datetime.date.today()
            section_obj.save()
            logger.info(f"Section ID {pk} updated by user {(request.user.username if request.user.is_authenticated else 'Unknown')}.")
            return APIResponse.success(
                data={
                    'id': section_obj.id,
                    'section': section_obj.section,
                    'is_active': section_obj.is_active,
                },
                message='Section updated successfully.'
            )
        except Exception as e:
            logger.error(f"Error updating section ID {pk}: {str(e)}")
            return APIResponse.error(
                message=f"Database error: {str(e)}",
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    def delete(self, request, pk):
        user_role = (request.user.role if request.user.is_authenticated else None)
        if not user_role:
            return APIResponse.error(
                message='Authentication required. Please login first.',
                status_code=status.HTTP_401_UNAUTHORIZED,
            )
        is_admin = getattr(request.user, 'is_superadmin', False) or (user_role and str(user_role).strip().lower() in ['super admin', 'admin', 'superadmin'])
        if not is_admin:
            return APIResponse.error(
                message='Access denied. Only Super Admins or Admins can delete/deactivate sections.',
                status_code=status.HTTP_403_FORBIDDEN,
            )

        section_obj = self._get_section(pk)
        if section_obj is None:
            return APIResponse.error(
                message='Section not found.',
                status_code=status.HTTP_404_NOT_FOUND,
            )
            
        active_mappings = ClassSections.objects.filter(section_id=section_obj.id, is_active='yes').exists()
        if active_mappings:
            return APIResponse.error(
                message="Cannot deactivate section. It is currently assigned to one or more active class mappings.",
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        try:
            section_obj.is_active = 'no'
            section_obj.updated_at = datetime.date.today()
            section_obj.save()
            logger.info(f"Section ID {pk} deactivated by user {(request.user.username if request.user.is_authenticated else 'Unknown')}.")
            return APIResponse.success(message='Section successfully deactivated.')
        except Exception as e:
            logger.error(f"Error deactivating section ID {pk}: {str(e)}")
            return APIResponse.error(
                message=f"Database error: {str(e)}",
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

class SessionsListCreateView(APIView):
    """List all sessions (GET) or create a new session (POST)."""
    permission_classes = [AllowAny]

    def get(self, request):
        user_role = (request.user.role if request.user.is_authenticated else None)
        if not user_role:
            return APIResponse.error(
                message='Authentication required. Please login first.',
                status_code=status.HTTP_401_UNAUTHORIZED,
            )

        active_only = request.query_params.get('active_only', 'false').lower() == 'true'
        sessions_qs = Sessions.objects.all().order_by('id')
        if active_only:
            sessions_qs = sessions_qs.filter(is_active='yes')

        paginator = StandardResultsSetPagination()
        paginated_qs = paginator.paginate_queryset(sessions_qs, request, view=self)

        sessions_data = []
        for s in (paginated_qs if paginated_qs is not None else sessions_qs):
            sessions_data.append({
                'id': s.id,
                'session': s.session,
                'is_active': s.is_active,
                'created_at': s.created_at.strftime('%Y-%m-%d %H:%M:%S') if s.created_at else None,
                'updated_at': s.updated_at.strftime('%Y-%m-%d') if s.updated_at else None,
            })

        if paginated_qs is not None:
            return paginator.get_paginated_response({'sessions': sessions_data})

        return APIResponse.success(
            data={'sessions': sessions_data},
            message='Sessions retrieved successfully.',
        )

    def post(self, request):
        user_role = (request.user.role if request.user.is_authenticated else None)
        if not user_role:
            return APIResponse.error(
                message='Authentication required. Please login first.',
                status_code=status.HTTP_401_UNAUTHORIZED,
            )
        is_admin = getattr(request.user, 'is_superadmin', False) or (user_role and str(user_role).strip().lower() in ['super admin', 'admin', 'superadmin'])
        if not is_admin:
            return APIResponse.error(
                message='Access denied. Only Super Admins or Admins can create sessions.',
                status_code=status.HTTP_403_FORBIDDEN,
            )

        data = request.data
        session_name = data.get('session')
        if not session_name or not str(session_name).strip():
            return APIResponse.error(
                message='Session name is required.',
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        is_valid, validation_result = _validate_session_format(session_name)
        if not is_valid:
            return APIResponse.error(
                message=validation_result,
                status_code=status.HTTP_400_BAD_REQUEST,
            )
        
        session_name_clean = validation_result
        if Sessions.objects.filter(session__iexact=session_name_clean).exists():
            return APIResponse.error(
                message=f"Session '{session_name_clean}' already exists.",
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        try:
            new_session = Sessions.objects.create(
                session=session_name_clean,
                is_active='no',
                created_at=timezone.now(),
            )
            logger.info(
                f"Session '{session_name_clean}' created by user {(request.user.username if request.user.is_authenticated else 'Unknown')}."
            )
            return APIResponse.success(
                data={
                    'id': new_session.id,
                    'session': new_session.session,
                    'is_active': new_session.is_active,
                    'created_at': new_session.created_at.strftime('%Y-%m-%d %H:%M:%S') if new_session.created_at else None,
                    'updated_at': None,
                },
                message=f"Session '{session_name_clean}' created successfully.",
                status_code=status.HTTP_201_CREATED,
            )
        except Exception as e:
            logger.error(f"Error creating session: {str(e)}")
            return APIResponse.error(
                message=f"Database error: {str(e)}",
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class SessionsDetailView(APIView):
    """Retrieve (GET), update (PUT/PATCH), or soft-delete (DELETE) a session."""
    permission_classes = [AllowAny]

    def _get_session(self, pk):
        """Helper to fetch a session by pk or return None."""
        try:
            return Sessions.objects.get(pk=pk)
        except Sessions.DoesNotExist:
            return None

    def get(self, request, pk):
        user_role = (request.user.role if request.user.is_authenticated else None)
        if not user_role:
            return APIResponse.error(
                message='Authentication required. Please login first.',
                status_code=status.HTTP_401_UNAUTHORIZED,
            )

        session_obj = self._get_session(pk)
        if session_obj is None:
            return APIResponse.error(
                message='Session not found.',
                status_code=status.HTTP_404_NOT_FOUND,
            )

        return APIResponse.success(
            data={
                'id': session_obj.id,
                'session': session_obj.session,
                'is_active': session_obj.is_active,
                'created_at': session_obj.created_at.strftime('%Y-%m-%d %H:%M:%S') if session_obj.created_at else None,
                'updated_at': session_obj.updated_at.strftime('%Y-%m-%d') if session_obj.updated_at else None,
            },
            message='Session details retrieved successfully.',
        )

    def patch(self, request, pk):
        return self.put(request, pk)

    def put(self, request, pk):
        user_role = (request.user.role if request.user.is_authenticated else None)
        if not user_role:
            return APIResponse.error(
                message='Authentication required. Please login first.',
                status_code=status.HTTP_401_UNAUTHORIZED,
            )
        is_admin = getattr(request.user, 'is_superadmin', False) or (user_role and str(user_role).strip().lower() in ['super admin', 'admin', 'superadmin'])
        if not is_admin:
            return APIResponse.error(
                message='Access denied. Only Super Admins or Admins can modify sessions.',
                status_code=status.HTTP_403_FORBIDDEN,
            )

        session_obj = self._get_session(pk)
        if session_obj is None:
            return APIResponse.error(
                message='Session not found.',
                status_code=status.HTTP_404_NOT_FOUND,
            )

        data = request.data
        session_name = data.get('session')
        is_active = data.get('is_active')

        if session_name is not None:    
            session_name_clean = str(session_name).strip()
            if not session_name_clean:
                return APIResponse.error(
                    message='Session name cannot be empty.',
                    status_code=status.HTTP_400_BAD_REQUEST,
                )
                
            is_valid, validation_result = _validate_session_format(session_name_clean)
            if not is_valid:
                return APIResponse.error(
                    message=validation_result,
                    status_code=status.HTTP_400_BAD_REQUEST,
                )
            session_name_clean = validation_result
                
            if Sessions.objects.filter(session__iexact=session_name_clean).exclude(pk=pk).exists():
                return APIResponse.error(
                    message=f"Session '{session_name_clean}' already exists.",
                    status_code=status.HTTP_400_BAD_REQUEST,
                )
            session_obj.session = session_name_clean

        if is_active is not None:
            if str(is_active).lower() not in ['yes', 'no']:
                return APIResponse.error(
                    message="is_active must be 'yes' or 'no'.",
                    status_code=status.HTTP_400_BAD_REQUEST,
                )
            session_obj.is_active = str(is_active).lower()

        try:
            session_obj.updated_at = datetime.date.today()
            session_obj.save()
            logger.info(f"Session ID {pk} updated by user {(request.user.username if request.user.is_authenticated else 'Unknown')}.")
            return APIResponse.success(
                data={
                    'id': session_obj.id,
                    'session': session_obj.session,
                    'is_active': session_obj.is_active,
                    'created_at': session_obj.created_at.strftime('%Y-%m-%d %H:%M:%S') if session_obj.created_at else None,
                    'updated_at': session_obj.updated_at.strftime('%Y-%m-%d') if session_obj.updated_at else None,
                },
                message='Session updated successfully.',
            )
        except Exception as e:
            logger.error(f"Error updating session ID {pk}: {str(e)}")
            return APIResponse.error(
                message=f"Database error: {str(e)}",
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    def delete(self, request, pk):
        user_role = (request.user.role if request.user.is_authenticated else None)
        if not user_role:
            return APIResponse.error(
                message='Authentication required. Please login first.',
                status_code=status.HTTP_401_UNAUTHORIZED,
            )
        is_admin = getattr(request.user, 'is_superadmin', False) or (user_role and str(user_role).strip().lower() in ['super admin', 'admin', 'superadmin'])
        if not is_admin:
            return APIResponse.error(
                message='Access denied. Only Super Admins or Admins can delete/deactivate sessions.',
                status_code=status.HTTP_403_FORBIDDEN,
            )

        session_obj = self._get_session(pk)
        if session_obj is None:
            return APIResponse.error(
                message='Session not found.',
                status_code=status.HTTP_404_NOT_FOUND,
            )

        try:
            with transaction.atomic():
                session_id = session_obj.id
                was_active = session_obj.is_active == 'yes'
                session_obj.delete()
                
                if was_active:
                    next_session = Sessions.objects.order_by('-id').first()
                    if next_session:
                        next_session.is_active = 'yes'
                        next_session.updated_at = datetime.date.today()
                        next_session.save()
            
            logger.info(f"Session ID {session_id} deleted by user {(request.user.username if request.user.is_authenticated else 'Unknown')}.")
            return APIResponse.success(message='Session successfully deleted.')
        except Exception as e:
            logger.error(f"Error deleting session ID {pk}: {str(e)}")
            return APIResponse.error(
                message=f"Database error: {str(e)}",
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class SessionActivateView(APIView):
    """Activate a session (POST). Deactivates all other sessions atomically."""
    permission_classes = [AllowAny]

    def post(self, request, pk):
        user_role = (request.user.role if request.user.is_authenticated else None)
        if not user_role:
            return APIResponse.error(
                message='Authentication required. Please login first.',
                status_code=status.HTTP_401_UNAUTHORIZED,
            )
        is_admin = getattr(request.user, 'is_superadmin', False) or (user_role and str(user_role).strip().lower() in ['super admin', 'admin', 'superadmin'])
        if not is_admin:
            return APIResponse.error(
                message='Access denied. Only Super Admins or Admins can activate sessions.',
                status_code=status.HTTP_403_FORBIDDEN,
            )

        try:
            session_obj = Sessions.objects.get(pk=pk)
        except Sessions.DoesNotExist:
            return APIResponse.error(
                message='Session not found.',
                status_code=status.HTTP_404_NOT_FOUND,
            )

        try:
            with transaction.atomic():
                # Deactivate all sessions
                Sessions.objects.exclude(pk=pk).filter(is_active='yes').update(
                    is_active='no',
                    updated_at=datetime.date.today(),
                )
                # Activate the target session
                session_obj.is_active = 'yes'
                session_obj.updated_at = datetime.date.today()
                session_obj.save()

            logger.info(f"Session '{session_obj.session}' activated by user {(request.user.username if request.user.is_authenticated else 'Unknown')}.")
            return APIResponse.success(
                data={
                    'id': session_obj.id,
                    'session': session_obj.session,
                    'is_active': session_obj.is_active,
                    'created_at': session_obj.created_at.strftime('%Y-%m-%d %H:%M:%S') if session_obj.created_at else None,
                    'updated_at': session_obj.updated_at.strftime('%Y-%m-%d') if session_obj.updated_at else None,
                },
                message=f"Session '{session_obj.session}' is now active.",
            )
        except Exception as e:
            logger.error(f"Error activating session ID {pk}: {str(e)}")
            return APIResponse.error(
                message=f"Database error: {str(e)}",
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class ClassesListCreateView(APIView):
    """List all classes (GET) or create a new class (POST)."""
    permission_classes = [AllowAny]

    def get(self, request):
        user_role = (request.user.role if request.user.is_authenticated else None)
        if not user_role:
            return APIResponse.error(
                message='Authentication required. Please login first.',
                status_code=status.HTTP_401_UNAUTHORIZED,
            )

        active_only = request.query_params.get('active_only', 'false').lower() == 'true'
        classes_qs = Classes.objects.all().order_by('sort_order', 'id')
        if active_only:
            classes_qs = classes_qs.filter(is_active='yes')

        paginator = StandardResultsSetPagination()
        paginated_qs = paginator.paginate_queryset(classes_qs, request, view=self)

        classes_data = []
        for c in (paginated_qs if paginated_qs is not None else classes_qs):
            classes_data.append({
                'id': c.id,
                'class_name': c.class_field,
                'sort_order': c.sort_order,
                'is_hedu_program': c.is_hedu_program == 'yes' or c.is_hedu_program == 'true' or c.is_hedu_program == 'True',
                'is_active': c.is_active,
                'created_at': c.created_at.strftime('%Y-%m-%d %H:%M:%S') if c.created_at else None,
                'updated_at': c.updated_at.strftime('%Y-%m-%d') if c.updated_at else None,
            })

        if paginated_qs is not None:
            return paginator.get_paginated_response({'classes': classes_data})

        return APIResponse.success(
            data={'classes': classes_data},
            message='Classes retrieved successfully.',
        )

    def post(self, request):
        user_role = (request.user.role if request.user.is_authenticated else None)
        if not user_role:
            return APIResponse.error(
                message='Authentication required. Please login first.',
                status_code=status.HTTP_401_UNAUTHORIZED,
            )
        is_admin = getattr(request.user, 'is_superadmin', False) or (user_role and str(user_role).strip().lower() in ['super admin', 'admin', 'superadmin'])
        if not is_admin:
            return APIResponse.error(
                message='Access denied. Only Super Admins or Admins can create classes.',
                status_code=status.HTTP_403_FORBIDDEN,
            )

        data = request.data
        class_name = data.get('class_name')
        if not class_name or not str(class_name).strip():
            return APIResponse.error(
                message='Class name is required.',
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        class_name_clean = str(class_name).strip()
        if Classes.objects.filter(class_field__iexact=class_name_clean).exists():
            return APIResponse.error(
                message=f"Class '{class_name_clean}' already exists.",
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        sort_order = data.get('sort_order')
        try:
            sort_order = int(sort_order) if sort_order not in [None, ''] else 9999
        except ValueError:
            return APIResponse.error(message="sort_order must be an integer.", status_code=400)
            
        is_hedu_program_raw = data.get('is_hedu_program', '')
        is_hedu_program = 'yes' if is_hedu_program_raw is True or str(is_hedu_program_raw).lower() in ['yes', 'true', '1'] else 'no'

        try:
            new_class = Classes.objects.create(
                class_field=class_name_clean,
                sort_order=sort_order,
                is_hedu_program=is_hedu_program,
                is_active='yes',
                created_at=timezone.now(),
            )
            logger.info(
                f"Class '{class_name_clean}' created by user {(request.user.username if request.user.is_authenticated else 'Unknown')}."
            )
            return APIResponse.success(
                data={
                    'id': new_class.id,
                    'class_name': new_class.class_field,
                    'sort_order': new_class.sort_order,
                    'is_hedu_program': new_class.is_hedu_program == 'yes' or new_class.is_hedu_program == 'true' or new_class.is_hedu_program == 'True',
                    'is_active': new_class.is_active,
                },
                message=f"Class '{class_name_clean}' created successfully.",
                status_code=status.HTTP_201_CREATED,
            )
        except Exception as e:
            logger.error(f"Error creating class: {str(e)}")
            return APIResponse.error(
                message=f"Database error: {str(e)}",
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class ClassesDetailView(APIView):
    """Retrieve (GET), update (PUT/PATCH), or soft-delete (DELETE) a class."""
    permission_classes = [AllowAny]

    def _get_class(self, pk):
        try:
            return Classes.objects.get(pk=pk)
        except Classes.DoesNotExist:
            return None

    def get(self, request, pk):
        user_role = (request.user.role if request.user.is_authenticated else None)
        if not user_role:
            return APIResponse.error(
                message='Authentication required. Please login first.',
                status_code=status.HTTP_401_UNAUTHORIZED,
            )

        class_obj = self._get_class(pk)
        if class_obj is None:
            return APIResponse.error(
                message='Class not found.',
                status_code=status.HTTP_404_NOT_FOUND,
            )

        return APIResponse.success(
            data={
                'id': class_obj.id,
                'class_name': class_obj.class_field,
                'sort_order': class_obj.sort_order,
                'is_hedu_program': class_obj.is_hedu_program == 'yes' or class_obj.is_hedu_program == 'true' or class_obj.is_hedu_program == 'True',
                'is_active': class_obj.is_active,
                'created_at': class_obj.created_at.strftime('%Y-%m-%d %H:%M:%S') if class_obj.created_at else None,
                'updated_at': class_obj.updated_at.strftime('%Y-%m-%d') if class_obj.updated_at else None,
            },
            message='Class details retrieved successfully.',
        )

    def patch(self, request, pk):
        return self.put(request, pk)

    def put(self, request, pk):
        user_role = (request.user.role if request.user.is_authenticated else None)
        if not user_role:
            return APIResponse.error(
                message='Authentication required. Please login first.',
                status_code=status.HTTP_401_UNAUTHORIZED,
            )
        is_admin = getattr(request.user, 'is_superadmin', False) or (user_role and str(user_role).strip().lower() in ['super admin', 'admin', 'superadmin'])
        if not is_admin:
            return APIResponse.error(
                message='Access denied. Only Super Admins or Admins can modify classes.',
                status_code=status.HTTP_403_FORBIDDEN,
            )

        class_obj = self._get_class(pk)
        if class_obj is None:
            return APIResponse.error(
                message='Class not found.',
                status_code=status.HTTP_404_NOT_FOUND,
            )

        data = request.data
        class_name = data.get('class_name')
        is_active = data.get('is_active')
        sort_order = data.get('sort_order')
        is_hedu_program = data.get('is_hedu_program')

        if class_name is not None:
            class_name_clean = str(class_name).strip()
            if not class_name_clean:
                return APIResponse.error(
                    message='Class name cannot be empty.',
                    status_code=status.HTTP_400_BAD_REQUEST,
                )
            if Classes.objects.filter(class_field__iexact=class_name_clean).exclude(pk=pk).exists():
                return APIResponse.error(
                    message=f"Class '{class_name_clean}' already exists.",
                    status_code=status.HTTP_400_BAD_REQUEST,
                )
            class_obj.class_field = class_name_clean

        if is_active is not None:
            if str(is_active).lower() not in ['yes', 'no']:
                return APIResponse.error(
                    message="is_active must be 'yes' or 'no'.",
                    status_code=status.HTTP_400_BAD_REQUEST,
                )
            class_obj.is_active = str(is_active).lower()

        if sort_order is not None:
            try:
                class_obj.sort_order = int(sort_order) if sort_order != '' else 9999
            except ValueError:
                return APIResponse.error(message="sort_order must be an integer.", status_code=400)
            
        if is_hedu_program is not None:
            class_obj.is_hedu_program = 'yes' if is_hedu_program is True or str(is_hedu_program).lower() in ['yes', 'true', '1'] else 'no'

        try:
            class_obj.updated_at = datetime.date.today()
            class_obj.save()
            logger.info(f"Class ID {pk} updated by user {(request.user.username if request.user.is_authenticated else 'Unknown')}.")
            return APIResponse.success(message='Class updated successfully.')
        except Exception as e:
            logger.error(f"Error updating class ID {pk}: {str(e)}")
            return APIResponse.error(
                message=f"Database error: {str(e)}",
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    def delete(self, request, pk):
        user_role = (request.user.role if request.user.is_authenticated else None)
        if not user_role:
            return APIResponse.error(
                message='Authentication required. Please login first.',
                status_code=status.HTTP_401_UNAUTHORIZED,
            )
        is_admin = getattr(request.user, 'is_superadmin', False) or (user_role and str(user_role).strip().lower() in ['super admin', 'admin', 'superadmin'])
        if not is_admin:
            return APIResponse.error(
                message='Access denied. Only Super Admins or Admins can delete/deactivate classes.',
                status_code=status.HTTP_403_FORBIDDEN,
            )

        class_obj = self._get_class(pk)
        if class_obj is None:
            return APIResponse.error(
                message='Class not found.',
                status_code=status.HTTP_404_NOT_FOUND,
            )

        active_mappings = ClassSections.objects.filter(class_id=class_obj.id, is_active='yes').exists()
        if active_mappings:
            return APIResponse.error(
                message="Cannot deactivate class. It is currently assigned to one or more active sections.",
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        try:
            class_obj.is_active = 'no'
            class_obj.updated_at = datetime.date.today()
            class_obj.save()
            logger.info(f"Class ID {pk} deactivated by user {(request.user.username if request.user.is_authenticated else 'Unknown')}.")
            return APIResponse.success(message='Class successfully deactivated.')
        except Exception as e:
            logger.error(f"Error deactivating class ID {pk}: {str(e)}")
            return APIResponse.error(
                message=f"Database error: {str(e)}",
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

class SubjectsListCreateView(APIView):
    """List all subjects (GET) or create a new subject (POST)."""
    permission_classes = [AllowAny]

    def get(self, request):
        user_role = (request.user.role if request.user.is_authenticated else None)
        if not user_role:
            return APIResponse.error(
                message='Authentication required. Please login first.',
                status_code=status.HTTP_401_UNAUTHORIZED,
            )

        active_only = request.query_params.get('active_only', 'false').lower() == 'true'
        subjects_qs = Subjects.objects.all().order_by('name')
        if active_only:
            subjects_qs = subjects_qs.filter(is_active='yes')

        paginator = StandardResultsSetPagination()
        paginated_qs = paginator.paginate_queryset(subjects_qs, request, view=self)

        subjects_data = []
        for s in (paginated_qs if paginated_qs is not None else subjects_qs):
            subjects_data.append({
                'id': s.id,
                'name': s.name,
                'code': s.code,
                'type': s.type,
                'is_active': s.is_active,
                'linked_class': s.linked_class,
                'created_at': s.created_at.strftime('%Y-%m-%d %H:%M:%S') if s.created_at else None,
                'updated_at': s.updated_at.strftime('%Y-%m-%d') if s.updated_at else None,
            })

        if paginated_qs is not None:
            return paginator.get_paginated_response({'subjects': subjects_data})

        return APIResponse.success(
            data={'subjects': subjects_data},
            message='Subjects retrieved successfully.',
        )

    def post(self, request):
        user_role = (request.user.role if request.user.is_authenticated else None)
        if not user_role:
            return APIResponse.error(
                message='Authentication required. Please login first.',
                status_code=status.HTTP_401_UNAUTHORIZED,
            )
        is_admin = getattr(request.user, 'is_superadmin', False) or (user_role and str(user_role).strip().lower() in ['super admin', 'admin', 'superadmin'])
        if not is_admin:
            return APIResponse.error(
                message='Access denied. Only Super Admins or Admins can create subjects.',
                status_code=status.HTTP_403_FORBIDDEN,
            )

        data = request.data
        name = data.get('name')
        code = data.get('code')
        type_val = data.get('type')
        
        if not name or not str(name).strip():
            return APIResponse.error(message='Subject name is required.', status_code=status.HTTP_400_BAD_REQUEST)

        try:
            new_subject = Subjects.objects.create(
                name=str(name).strip(),
                code=code,
                type=type_val,
                linked_class=data.get('linked_class', ''),
                is_active=data.get('is_active', 'yes'),
                created_at=timezone.now(),
            )
            logger.info(f"Subject '{new_subject.name}' created by user {(request.user.username if request.user.is_authenticated else 'Unknown')}.")
            return APIResponse.success(
                data={
                    'id': new_subject.id,
                    'name': new_subject.name,
                    'code': new_subject.code,
                    'type': new_subject.type,
                    'is_active': new_subject.is_active,
                    'linked_class': new_subject.linked_class,
                },
                message=f"Subject '{new_subject.name}' created successfully.",
                status_code=status.HTTP_201_CREATED,
            )
        except Exception as e:
            logger.error(f"Error creating subject: {str(e)}")
            return APIResponse.error(message=f"Database error: {str(e)}", status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)

class SubjectsDetailView(APIView):
    """Retrieve (GET), update (PUT/PATCH), or soft-delete (DELETE) a subject."""
    permission_classes = [AllowAny]

    def _get_subject(self, pk):
        try:
            return Subjects.objects.get(pk=pk)
        except Subjects.DoesNotExist:
            return None

    def get(self, request, pk):
        user_role = (request.user.role if request.user.is_authenticated else None)
        if not user_role:
            return APIResponse.error(message='Authentication required.', status_code=status.HTTP_401_UNAUTHORIZED)

        subject_obj = self._get_subject(pk)
        if subject_obj is None:
            return APIResponse.error(message='Subject not found.', status_code=status.HTTP_404_NOT_FOUND)

        return APIResponse.success(
            data={
                'id': subject_obj.id,
                'name': subject_obj.name,
                'code': subject_obj.code,
                'type': subject_obj.type,
                'is_active': subject_obj.is_active,
                'linked_class': subject_obj.linked_class,
                'created_at': subject_obj.created_at.strftime('%Y-%m-%d %H:%M:%S') if subject_obj.created_at else None,
                'updated_at': subject_obj.updated_at.strftime('%Y-%m-%d') if subject_obj.updated_at else None,
            },
            message='Subject details retrieved successfully.',
        )

    def patch(self, request, pk):
        return self.put(request, pk)

    def put(self, request, pk):
        user_role = (request.user.role if request.user.is_authenticated else None)
        if not user_role:
            return APIResponse.error(message='Authentication required.', status_code=status.HTTP_401_UNAUTHORIZED)
        is_admin = getattr(request.user, 'is_superadmin', False) or (user_role and str(user_role).strip().lower() in ['super admin', 'admin', 'superadmin'])
        if not is_admin:
            return APIResponse.error(message='Access denied.', status_code=status.HTTP_403_FORBIDDEN)

        subject_obj = self._get_subject(pk)
        if subject_obj is None:
            return APIResponse.error(message='Subject not found.', status_code=status.HTTP_404_NOT_FOUND)

        data = request.data
        name = data.get('name')
        
        if name is not None:
            name_clean = str(name).strip()
            if not name_clean:
                return APIResponse.error(message='Subject name cannot be empty.', status_code=status.HTTP_400_BAD_REQUEST)
            subject_obj.name = name_clean

        if 'code' in data:
            subject_obj.code = data['code']
        if 'type' in data:
            subject_obj.type = data['type']
        if 'is_active' in data:
            subject_obj.is_active = str(data['is_active']).lower()
        if 'linked_class' in data:
            subject_obj.linked_class = data['linked_class']

        try:
            subject_obj.updated_at = datetime.date.today()
            subject_obj.save()
            logger.info(f"Subject ID {pk} updated by user {(request.user.username if request.user.is_authenticated else 'Unknown')}.")
            return APIResponse.success(message='Subject updated successfully.')
        except Exception as e:
            logger.error(f"Error updating subject ID {pk}: {str(e)}")
            return APIResponse.error(message=f"Database error: {str(e)}", status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def delete(self, request, pk):
        user_role = (request.user.role if request.user.is_authenticated else None)
        if not user_role:
            return APIResponse.error(message='Authentication required.', status_code=status.HTTP_401_UNAUTHORIZED)
        is_admin = getattr(request.user, 'is_superadmin', False) or (user_role and str(user_role).strip().lower() in ['super admin', 'admin', 'superadmin'])
        if not is_admin:
            return APIResponse.error(message='Access denied.', status_code=status.HTTP_403_FORBIDDEN)

        subject_obj = self._get_subject(pk)
        if subject_obj is None:
            return APIResponse.error(message='Subject not found.', status_code=status.HTTP_404_NOT_FOUND)

        try:
            subject_name = subject_obj.name
            subject_obj.delete()
            logger.info(f"Subject '{subject_name}' (ID {pk}) deleted by user {(request.user.username if request.user.is_authenticated else 'Unknown')}.")
            return APIResponse.success(message=f"Subject '{subject_name}' deleted successfully.")
        except Exception as e:
            logger.error(f"Error deleting subject ID {pk}: {str(e)}")
            return APIResponse.error(message=f"Database error: {str(e)}", status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)
