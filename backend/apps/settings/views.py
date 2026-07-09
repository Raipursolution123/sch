import logging
import datetime
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework import status
from common.pagination.standard import StandardResultsSetPagination
from common.responses.api import APIResponse
from .models.languages import Languages
from .models.currencies import Currencies
from .models.sch_settings import SchSettings

logger = logging.getLogger(__name__)

class LanguagesListCreateView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        user_role = (request.user.role if request.user.is_authenticated else None)
        if not user_role:
            return APIResponse.error(
                message='Authentication required. Please login first.',
                status_code=status.HTTP_401_UNAUTHORIZED,
            )

        active_only = request.query_params.get('active_only', 'false').lower() == 'true'
        languages_qs = Languages.objects.filter(is_deleted='no').order_by('language')
        if active_only:
            languages_qs = languages_qs.filter(is_active='yes')

        paginator = StandardResultsSetPagination()
        paginated_qs = paginator.paginate_queryset(languages_qs, request, view=self)

        if paginated_qs is not None:
            pass

        languages_data = []
        for l in paginated_qs or languages_qs:
            languages_data.append({
                'id': l.id,
                'language': l.language,
                'short_code': l.short_code,
                'country_code': l.country_code,
                'is_rtl': l.is_rtl,
                'is_active': l.is_active,
                'is_deleted': l.is_deleted,
                'created_at': l.created_at.strftime('%Y-%m-%d %H:%M:%S') if l.created_at else None,
                'updated_at': l.updated_at.strftime('%Y-%m-%d') if l.updated_at else None,
            })

        if paginated_qs is not None:
            return paginator.get_paginated_response({'languages': languages_data})

        return APIResponse.success(
            data={'languages': languages_data},
            message='Languages retrieved successfully.',
        )

    def post(self, request):
        user_role = (request.user.role if request.user.is_authenticated else None)
        if not user_role:
            return APIResponse.error(
                message='Authentication required. Please login first.',
                status_code=status.HTTP_401_UNAUTHORIZED,
            )
        is_admin = getattr(request.user, 'is_superadmin', False) or (user_role and str(user_role).strip().lower() in ['super admin', 'admin', 'superadmin', 'staff'])
        if not is_admin:
            return APIResponse.error(
                message='Access denied. Only Super Admins, Admins, or Staff can create languages.',
                status_code=status.HTTP_403_FORBIDDEN,
            )

        data = request.data
        language = data.get('language')
        short_code = data.get('short_code')
        country_code = data.get('country_code')
        is_rtl = data.get('is_rtl', 0)

        if not language or not short_code or not country_code:
            return APIResponse.error(
                message='Language, short_code, and country_code are required.',
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        try:
            is_rtl = int(is_rtl)
        except ValueError:
            return APIResponse.error(
                message='is_rtl must be an integer.',
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        if Languages.objects.filter(language__iexact=str(language).strip(), is_deleted='no').exists():
            return APIResponse.error(
                message=f"Language '{language}' already exists.",
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        try:
            new_language = Languages.objects.create(
                language=str(language).strip(),
                short_code=str(short_code).strip(),
                country_code=str(country_code).strip(),
                is_rtl=is_rtl,
                is_active='no',
                is_deleted='no',
                created_at=timezone.now(),
            )
            logger.info(
                f"Language '{new_language.language}' created by user {(request.user.username if request.user.is_authenticated else 'Unknown')}."
            )
            return APIResponse.success(
                data={
                    'id': new_language.id,
                    'language': new_language.language,
                    'short_code': new_language.short_code,
                    'country_code': new_language.country_code,
                    'is_rtl': new_language.is_rtl,
                    'is_active': new_language.is_active,
                    'created_at': new_language.created_at.strftime('%Y-%m-%d %H:%M:%S') if new_language.created_at else None,
                    'updated_at': None,
                },
                message=f"Language '{new_language.language}' created successfully.",
                status_code=status.HTTP_201_CREATED,
            )
        except Exception as e:
            logger.error(f"Error creating language: {str(e)}")
            return APIResponse.error(
                message=f"Database error: {str(e)}",
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class LanguagesDetailView(APIView):
    permission_classes = [AllowAny]

    def _get_language(self, pk):
        try:
            return Languages.objects.get(pk=pk, is_deleted='no')
        except Languages.DoesNotExist:
            return None

    def get(self, request, pk):
        user_role = (request.user.role if request.user.is_authenticated else None)
        if not user_role:
            return APIResponse.error(
                message='Authentication required. Please login first.',
                status_code=status.HTTP_401_UNAUTHORIZED,
            )

        language_obj = self._get_language(pk)
        if language_obj is None:
            return APIResponse.error(
                message='Language not found.',
                status_code=status.HTTP_404_NOT_FOUND,
            )

        return APIResponse.success(
            data={
                'id': language_obj.id,
                'language': language_obj.language,
                'short_code': language_obj.short_code,
                'country_code': language_obj.country_code,
                'is_rtl': language_obj.is_rtl,
                'is_active': language_obj.is_active,
                'is_deleted': language_obj.is_deleted,
                'created_at': language_obj.created_at.strftime('%Y-%m-%d %H:%M:%S') if language_obj.created_at else None,
                'updated_at': language_obj.updated_at.strftime('%Y-%m-%d') if language_obj.updated_at else None,
            },
            message='Language details retrieved successfully.',
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
        is_admin = getattr(request.user, 'is_superadmin', False) or (user_role and str(user_role).strip().lower() in ['super admin', 'admin', 'superadmin', 'staff'])
        if not is_admin:
            return APIResponse.error(
                message='Access denied. Only Super Admins, Admins, or Staff can modify languages.',
                status_code=status.HTTP_403_FORBIDDEN,
            )

        language_obj = self._get_language(pk)
        if language_obj is None:
            return APIResponse.error(
                message='Language not found.',
                status_code=status.HTTP_404_NOT_FOUND,
            )

        data = request.data
        language_name = data.get('language')
        short_code = data.get('short_code')
        country_code = data.get('country_code')
        is_rtl = data.get('is_rtl')
        is_active = data.get('is_active')

        if language_name is not None:
            language_name_clean = str(language_name).strip()
            if not language_name_clean:
                return APIResponse.error(
                    message='Language name cannot be empty.',
                    status_code=status.HTTP_400_BAD_REQUEST,
                )
            if Languages.objects.filter(language__iexact=language_name_clean, is_deleted='no').exclude(pk=pk).exists():
                return APIResponse.error(
                    message=f"Language '{language_name_clean}' already exists.",
                    status_code=status.HTTP_400_BAD_REQUEST,
                )
            language_obj.language = language_name_clean

        if short_code is not None:
            language_obj.short_code = str(short_code).strip()
        
        if country_code is not None:
            language_obj.country_code = str(country_code).strip()

        if is_rtl is not None:
            try:
                language_obj.is_rtl = int(is_rtl)
            except ValueError:
                return APIResponse.error(
                    message='is_rtl must be an integer.',
                    status_code=status.HTTP_400_BAD_REQUEST,
                )

        if is_active is not None:
            if str(is_active).lower() not in ['yes', 'no']:
                return APIResponse.error(
                    message="is_active must be 'yes' or 'no'.",
                    status_code=status.HTTP_400_BAD_REQUEST,
                )
            language_obj.is_active = str(is_active).lower()

        try:
            language_obj.updated_at = datetime.date.today()
            language_obj.save()
            logger.info(f"Language ID {pk} updated by user {(request.user.username if request.user.is_authenticated else 'Unknown')}.")
            return APIResponse.success(
                data={
                    'id': language_obj.id,
                    'language': language_obj.language,
                    'short_code': language_obj.short_code,
                    'country_code': language_obj.country_code,
                    'is_rtl': language_obj.is_rtl,
                    'is_active': language_obj.is_active,
                    'created_at': language_obj.created_at.strftime('%Y-%m-%d %H:%M:%S') if language_obj.created_at else None,
                    'updated_at': language_obj.updated_at.strftime('%Y-%m-%d') if language_obj.updated_at else None,
                },
                message='Language updated successfully.',
            )
        except Exception as e:
            logger.error(f"Error updating language ID {pk}: {str(e)}")
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
        is_admin = getattr(request.user, 'is_superadmin', False) or (user_role and str(user_role).strip().lower() in ['super admin', 'admin', 'superadmin', 'staff'])
        if not is_admin:
            return APIResponse.error(
                message='Access denied. Only Super Admins, Admins, or Staff can delete languages.',
                status_code=status.HTTP_403_FORBIDDEN,
            )

        language_obj = self._get_language(pk)
        if language_obj is None:
            return APIResponse.error(
                message='Language not found.',
                status_code=status.HTTP_404_NOT_FOUND,
            )

        if language_obj.is_active == 'yes':
            return APIResponse.error(
                message='Cannot delete an active language. Deactivate it first.',
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        try:
            language_obj.is_deleted = 'yes'
            language_obj.updated_at = datetime.date.today()
            language_obj.save()
            logger.info(f"Language ID {pk} soft-deleted by user {(request.user.username if request.user.is_authenticated else 'Unknown')}.")
            return APIResponse.success(message='Language successfully deleted.')
        except Exception as e:
            logger.error(f"Error deleting language ID {pk}: {str(e)}")
            return APIResponse.error(
                message=f"Database error: {str(e)}",
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class CurrenciesListCreateView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        try:
            user_role = (request.user.role if request.user.is_authenticated else None)
            if not user_role:
                return APIResponse.error(
                    message='Authentication required. Please login first.',
                    status_code=status.HTTP_401_UNAUTHORIZED,
                )

            currencies_qs = Currencies.objects.all().order_by('name')
            active_only = request.query_params.get('active_only', 'false').lower() == 'true'
            if active_only:
                currencies_qs = currencies_qs.filter(is_active=1)

            paginator = StandardResultsSetPagination()
            paginated_qs = paginator.paginate_queryset(currencies_qs, request, view=self)

            currencies_data = []
            for c in paginated_qs or currencies_qs:
                currencies_data.append({
                    'id': c.id,
                    'name': c.name,
                    'short_name': c.short_name,
                    'symbol': c.symbol,
                    'base_price': c.base_price,
                    'is_active': c.is_active,
                    'created_at': c.created_at.strftime('%Y-%m-%d %H:%M:%S') if c.created_at else None,
                })

            if paginated_qs is not None:
                return paginator.get_paginated_response({'currencies': currencies_data})

            return APIResponse.success(
                data={'currencies': currencies_data},
                message='Currencies retrieved successfully.',
            )
        except Exception as e:
            return APIResponse.error(
                message=f"Backend Error: {str(e)}",
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
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
                message='Access denied. Only Super Admins or Admins can create currencies.',
                status_code=status.HTTP_403_FORBIDDEN,
            )

        data = request.data
        name = data.get('name')
        short_name = data.get('short_name')
        symbol = data.get('symbol')
        base_price = data.get('base_price', '1')
        is_active = data.get('is_active', 0)

        if not name or not short_name or not symbol:
            return APIResponse.error(
                message='Name, short_name, and symbol are required.',
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        try:
            is_active = int(is_active)
        except ValueError:
            return APIResponse.error(
                message='is_active must be an integer.',
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        if Currencies.objects.filter(name__iexact=str(name).strip()).exists():
            return APIResponse.error(
                message=f"Currency '{name}' already exists.",
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        try:
            new_currency = Currencies.objects.create(
                name=str(name).strip(),
                short_name=str(short_name).strip(),
                symbol=str(symbol).strip(),
                base_price=str(base_price).strip(),
                is_active=is_active,
                created_at=timezone.now(),
            )
            logger.info(f"Currency '{new_currency.name}' created by user {(request.user.username if request.user.is_authenticated else 'Unknown')}.")
            return APIResponse.success(
                data={
                    'id': new_currency.id,
                    'name': new_currency.name,
                    'short_name': new_currency.short_name,
                    'symbol': new_currency.symbol,
                    'base_price': new_currency.base_price,
                    'is_active': new_currency.is_active,
                    'created_at': new_currency.created_at.strftime('%Y-%m-%d %H:%M:%S') if new_currency.created_at else None,
                },
                message=f"Currency '{new_currency.name}' created successfully.",
                status_code=status.HTTP_201_CREATED,
            )
        except Exception as e:
            logger.error(f"Error creating currency: {str(e)}")
            return APIResponse.error(
                message=f"Database error: {str(e)}",
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

class CurrenciesDetailView(APIView):
    permission_classes = [AllowAny]

    def _get_currency(self, pk):
        try:
            return Currencies.objects.get(pk=pk)
        except Currencies.DoesNotExist:
            return None

    def get(self, request, pk):
        user_role = (request.user.role if request.user.is_authenticated else None)
        if not user_role:
            return APIResponse.error(
                message='Authentication required.',
                status_code=status.HTTP_401_UNAUTHORIZED,
            )

        currency_obj = self._get_currency(pk)
        if not currency_obj:
            return APIResponse.error(
                message='Currency not found.',
                status_code=status.HTTP_404_NOT_FOUND,
            )

        return APIResponse.success(
            data={
                'id': currency_obj.id,
                'name': currency_obj.name,
                'short_name': currency_obj.short_name,
                'symbol': currency_obj.symbol,
                'base_price': currency_obj.base_price,
                'is_active': currency_obj.is_active,
                'created_at': currency_obj.created_at.strftime('%Y-%m-%d %H:%M:%S') if currency_obj.created_at else None,
            },
            message='Currency retrieved successfully.',
        )

    def put(self, request, pk):
        return self.patch(request, pk)

    def patch(self, request, pk):
        user_role = (request.user.role if request.user.is_authenticated else None)
        if not user_role:
            return APIResponse.error(
                message='Authentication required.',
                status_code=status.HTTP_401_UNAUTHORIZED,
            )
        is_admin = getattr(request.user, 'is_superadmin', False) or (user_role and str(user_role).strip().lower() in ['super admin', 'admin', 'superadmin'])
        if not is_admin:
            return APIResponse.error(
                message='Access denied.',
                status_code=status.HTTP_403_FORBIDDEN,
            )

        currency_obj = self._get_currency(pk)
        if not currency_obj:
            return APIResponse.error(
                message='Currency not found.',
                status_code=status.HTTP_404_NOT_FOUND,
            )

        data = request.data
        name = data.get('name')
        short_name = data.get('short_name')
        symbol = data.get('symbol')
        base_price = data.get('base_price')
        is_active = data.get('is_active')

        if name is not None:
            name_clean = str(name).strip()
            if Currencies.objects.filter(name__iexact=name_clean).exclude(pk=pk).exists():
                return APIResponse.error(
                    message=f"Currency '{name_clean}' already exists.",
                    status_code=status.HTTP_400_BAD_REQUEST,
                )
            currency_obj.name = name_clean
        
        if short_name is not None:
            currency_obj.short_name = str(short_name).strip()
        if symbol is not None:
            currency_obj.symbol = str(symbol).strip()
        if base_price is not None:
            currency_obj.base_price = str(base_price).strip()
            
        if is_active is not None:
            try:
                currency_obj.is_active = int(is_active)
            except ValueError:
                return APIResponse.error(
                    message='is_active must be an integer.',
                    status_code=status.HTTP_400_BAD_REQUEST,
                )

        try:
            currency_obj.save()
            logger.info(f"Currency ID {pk} updated by user {(request.user.username if request.user.is_authenticated else 'Unknown')}.")
            return APIResponse.success(
                data={
                    'id': currency_obj.id,
                    'name': currency_obj.name,
                    'short_name': currency_obj.short_name,
                    'symbol': currency_obj.symbol,
                    'base_price': currency_obj.base_price,
                    'is_active': currency_obj.is_active,
                    'created_at': currency_obj.created_at.strftime('%Y-%m-%d %H:%M:%S') if currency_obj.created_at else None,
                },
                message='Currency updated successfully.',
            )
        except Exception as e:
            logger.error(f"Error updating currency {pk}: {str(e)}")
            return APIResponse.error(
                message=f"Database error: {str(e)}",
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    def delete(self, request, pk):
        user_role = (request.user.role if request.user.is_authenticated else None)
        if not user_role:
            return APIResponse.error(
                message='Authentication required.',
                status_code=status.HTTP_401_UNAUTHORIZED,
            )
        is_admin = getattr(request.user, 'is_superadmin', False) or (user_role and str(user_role).strip().lower() in ['super admin', 'admin', 'superadmin'])
        if not is_admin:
            return APIResponse.error(
                message='Access denied.',
                status_code=status.HTTP_403_FORBIDDEN,
            )

        currency_obj = self._get_currency(pk)
        if not currency_obj:
            return APIResponse.error(
                message='Currency not found.',
                status_code=status.HTTP_404_NOT_FOUND,
            )

        try:
            currency_name = currency_obj.name
            currency_obj.delete()
            logger.info(f"Currency '{currency_name}' (ID: {pk}) HARD-DELETED by user {(request.user.username if request.user.is_authenticated else 'Unknown')}.")
            return APIResponse.success(
                data=None,
                message='Currency deleted successfully.',
            )
        except Exception as e:
            logger.error(f"Error deleting currency {pk}: {str(e)}")
            return APIResponse.error(
                message=f"Database error: {str(e)}",
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class CurrenciesActivateView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, pk):
        user_role = (request.user.role if request.user.is_authenticated else None)
        if not user_role:
            return APIResponse.error(
                message='Authentication required.',
                status_code=status.HTTP_401_UNAUTHORIZED,
            )
        is_admin = getattr(request.user, 'is_superadmin', False) or (user_role and str(user_role).strip().lower() in ['super admin', 'admin', 'superadmin'])
        if not is_admin:
            return APIResponse.error(
                message='Access denied.',
                status_code=status.HTTP_403_FORBIDDEN,
            )

        try:
            target_currency = Currencies.objects.get(pk=pk)
        except Currencies.DoesNotExist:
            return APIResponse.error(
                message='Currency not found.',      
                status_code=status.HTTP_404_NOT_FOUND,
            )

        try:
            Currencies.objects.all().update(is_active=0)
            target_currency.is_active = 1
            target_currency.save()

            logger.info(f"Currency ID {pk} activated by user {(request.user.username if request.user.is_authenticated else 'Unknown')}.")
            return APIResponse.success(
                data={
                    'id': target_currency.id,
                    'name': target_currency.name,
                    'short_name': target_currency.short_name,
                    'symbol': target_currency.symbol,
                    'base_price': target_currency.base_price,
                    'is_active': target_currency.is_active,
                    'created_at': target_currency.created_at.strftime('%Y-%m-%d %H:%M:%S') if target_currency.created_at else None,
                },
                message='Currency activated successfully.',
            )
        except Exception as e:
            logger.error(f"Error activating currency {pk}: {str(e)}")
            return APIResponse.error(
                message=f"Database error: {str(e)}",
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class GeneralSettingsView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        try:
            user_role = (request.user.role if request.user.is_authenticated else None)
            if not user_role:
                return APIResponse.error(
                    message='Authentication required.',
                    status_code=status.HTTP_401_UNAUTHORIZED,
                )

            # Get the first record, create if doesn't exist (assuming single row settings)
            settings = SchSettings.objects.first()
            if not settings:
                settings = SchSettings.objects.create(
                    id=1,
                    created_at=timezone.now()
                )

            data = {
                'id': settings.id,
                'name': settings.name or '',
                'email': settings.email or '',
                'phone': settings.phone or '',
                'address': settings.address or '',
                'dise_code': settings.dise_code or '',
                'timezone': settings.timezone or 'UTC',
                'date_format': settings.date_format or 'd-m-Y',
                'time_format': settings.time_format or '12-hour',
                'start_month': settings.start_month or 'April',
                'start_week': settings.start_week or 'Monday',
                'day_off': settings.day_off or '',
                'is_rtl': settings.is_rtl or 'disabled',
                'attendence_type': settings.attendence_type or 0,
                'low_attendance_limit': settings.low_attendance_limit or 0,
                'class_teacher': settings.class_teacher or 'disabled',
                'currency': settings.currency or '',
                'currency_symbol': settings.currency_symbol or '',
                'currency_place': settings.currency_place or 'before_number',
                'collect_back_date_fees': settings.collect_back_date_fees or 0,
                'fee_due_days': settings.fee_due_days or 0,
                'is_duplicate_fees_invoice': str(settings.is_duplicate_fees_invoice) if settings.is_duplicate_fees_invoice is not None else '0',
                'maintenance_mode': settings.maintenance_mode or 0,
                'lock_grace_period': settings.lock_grace_period or 0,
                'student_panel_login': settings.student_panel_login or 0,
                'parent_panel_login': settings.parent_panel_login or 0,
            }

            return APIResponse.success(
                data=data,
                message='General settings retrieved successfully.',
            )
        except Exception as e:
            return APIResponse.error(
                message=f"Backend Error: {str(e)}",
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    def patch(self, request):
        try:
            user_role = (request.user.role if request.user.is_authenticated else None)
            if not user_role:
                return APIResponse.error(
                    message='Authentication required.',
                    status_code=status.HTTP_401_UNAUTHORIZED,
                )
            is_admin = getattr(request.user, 'is_superadmin', False) or (user_role and str(user_role).strip().lower() in ['super admin', 'admin', 'superadmin'])
            if not is_admin:
                return APIResponse.error(
                    message='Access denied. Only Super Admins or Admins can update general settings.',
                    status_code=status.HTTP_403_FORBIDDEN,
                )

            settings = SchSettings.objects.first()
            if not settings:
                settings = SchSettings.objects.create(
                    id=1,
                    created_at=timezone.now()
                )

            data = request.data
            logger.info(f"PATCH /api/v1/settings/general/ received data: {data}")
            
            # School Profile
            if 'name' in data: settings.name = data['name']
            if 'email' in data: settings.email = data['email']
            if 'phone' in data: settings.phone = data['phone']
            if 'address' in data: settings.address = data['address']
            if 'dise_code' in data: settings.dise_code = data['dise_code']
            
            # Regional
            if 'timezone' in data: settings.timezone = data['timezone']
            if 'date_format' in data: settings.date_format = data['date_format']
            if 'time_format' in data: settings.time_format = data['time_format']
            if 'start_month' in data: settings.start_month = data['start_month']
            if 'start_week' in data: settings.start_week = data['start_week']
            if 'day_off' in data: settings.day_off = data['day_off']
            if 'is_rtl' in data: settings.is_rtl = data['is_rtl']
            
            # Attendance
            if 'attendence_type' in data: settings.attendence_type = data['attendence_type']
            if 'low_attendance_limit' in data: settings.low_attendance_limit = data['low_attendance_limit']
            if 'class_teacher' in data: settings.class_teacher = data['class_teacher']
            
            # Fees
            if 'currency' in data: settings.currency = data['currency']
            if 'currency_symbol' in data: settings.currency_symbol = data['currency_symbol']
            if 'currency_place' in data: settings.currency_place = data['currency_place']
            if 'collect_back_date_fees' in data: settings.collect_back_date_fees = data['collect_back_date_fees']
            if 'fee_due_days' in data: settings.fee_due_days = data['fee_due_days']
            if 'is_duplicate_fees_invoice' in data: settings.is_duplicate_fees_invoice = data['is_duplicate_fees_invoice']
            
            # Maintenance
            if 'maintenance_mode' in data: settings.maintenance_mode = data['maintenance_mode']
            if 'lock_grace_period' in data: settings.lock_grace_period = data['lock_grace_period']
            if 'student_panel_login' in data: settings.student_panel_login = data['student_panel_login']
            if 'parent_panel_login' in data: settings.parent_panel_login = data['parent_panel_login']

            settings.updated_at = timezone.now()
            settings.save()

            response_data = {
                'id': settings.id,
                'name': settings.name or '',
                'email': settings.email or '',
                'phone': settings.phone or '',
                'address': settings.address or '',
                'dise_code': settings.dise_code or '',
                'timezone': settings.timezone or 'UTC',
                'date_format': settings.date_format or 'd-m-Y',
                'time_format': settings.time_format or '12-hour',
                'start_month': settings.start_month or 'April',
                'start_week': settings.start_week or 'Monday',
                'day_off': settings.day_off or '',
                'is_rtl': settings.is_rtl or 'disabled',
                'attendence_type': settings.attendence_type or 0,
                'low_attendance_limit': settings.low_attendance_limit or 0,
                'class_teacher': settings.class_teacher or 'disabled',
                'currency': settings.currency or '',
                'currency_symbol': settings.currency_symbol or '',
                'currency_place': settings.currency_place or 'before_number',
                'collect_back_date_fees': settings.collect_back_date_fees or 0,
                'fee_due_days': settings.fee_due_days or 0,
                'is_duplicate_fees_invoice': str(settings.is_duplicate_fees_invoice) if settings.is_duplicate_fees_invoice is not None else '0',
                'maintenance_mode': settings.maintenance_mode or 0,
                'lock_grace_period': settings.lock_grace_period or 0,
                'student_panel_login': settings.student_panel_login or 0,
                'parent_panel_login': settings.parent_panel_login or 0,
            }

            return APIResponse.success(
                data=response_data,
                message='General settings updated successfully.',
            )
        except Exception as e:
            logger.error(f"Error updating general settings: {str(e)}")
            return APIResponse.error(
                message=f"Backend Error: {str(e)}",
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
