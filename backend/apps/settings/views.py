import datetime
import logging

from django.utils import timezone

from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView

from common.pagination.standard import StandardResultsSetPagination
from common.responses.api import APIResponse
from common.text_encoding import repair_utf8_cp1252_mojibake

from .models.currencies import Currencies
from .models.languages import Languages

logger = logging.getLogger(__name__)


def _currency_payload(currency) -> dict:
    return {
        "id": currency.id,
        "name": currency.name,
        "short_name": currency.short_name,
        "symbol": repair_utf8_cp1252_mojibake(currency.symbol),
        "base_price": currency.base_price,
        "is_active": currency.is_active,
        "created_at": (
            currency.created_at.strftime("%Y-%m-%d %H:%M:%S")
            if currency.created_at
            else None
        ),
    }


class LanguagesListCreateView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        user_role = request.user.role if request.user.is_authenticated else None
        if not user_role:
            return APIResponse.error(
                message="Authentication required. Please login first.",
                status_code=status.HTTP_401_UNAUTHORIZED,
            )

        active_only = request.query_params.get("active_only", "false").lower() == "true"
        languages_qs = Languages.objects.filter(is_deleted="no").order_by("language")
        if active_only:
            languages_qs = languages_qs.filter(is_active="yes")

        paginator = StandardResultsSetPagination()
        paginated_qs = paginator.paginate_queryset(languages_qs, request, view=self)

        if paginated_qs is not None:
            pass

        languages_data = []
        for l in paginated_qs or languages_qs:
            languages_data.append(
                {
                    "id": l.id,
                    "language": l.language,
                    "short_code": l.short_code,
                    "country_code": l.country_code,
                    "is_rtl": l.is_rtl,
                    "is_active": l.is_active,
                    "is_deleted": l.is_deleted,
                    "created_at": (
                        l.created_at.strftime("%Y-%m-%d %H:%M:%S")
                        if l.created_at
                        else None
                    ),
                    "updated_at": (
                        l.updated_at.strftime("%Y-%m-%d") if l.updated_at else None
                    ),
                }
            )

        if paginated_qs is not None:
            return paginator.get_paginated_response({"languages": languages_data})

        return APIResponse.success(
            data={"languages": languages_data},
            message="Languages retrieved successfully.",
        )

    def post(self, request):
        user_role = request.user.role if request.user.is_authenticated else None
        if not user_role:
            return APIResponse.error(
                message="Authentication required. Please login first.",
                status_code=status.HTTP_401_UNAUTHORIZED,
            )
        is_admin = getattr(request.user, "is_superadmin", False) or (
            user_role
            and str(user_role).strip().lower()
            in ["super admin", "admin", "superadmin", "staff"]
        )
        if not is_admin:
            return APIResponse.error(
                message="Access denied. Only Super Admins, Admins, or Staff can create languages.",
                status_code=status.HTTP_403_FORBIDDEN,
            )

        data = request.data
        language = data.get("language")
        short_code = data.get("short_code")
        country_code = data.get("country_code")
        is_rtl = data.get("is_rtl", 0)

        if not language or not short_code or not country_code:
            return APIResponse.error(
                message="Language, short_code, and country_code are required.",
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        try:
            is_rtl = int(is_rtl)
        except ValueError:
            return APIResponse.error(
                message="is_rtl must be an integer.",
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        if Languages.objects.filter(
            language__iexact=str(language).strip(), is_deleted="no"
        ).exists():
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
                is_active="no",
                is_deleted="no",
                created_at=timezone.now(),
            )
            logger.info(
                f"Language '{new_language.language}' created by user {(request.user.username if request.user.is_authenticated else 'Unknown')}."
            )
            return APIResponse.success(
                data={
                    "id": new_language.id,
                    "language": new_language.language,
                    "short_code": new_language.short_code,
                    "country_code": new_language.country_code,
                    "is_rtl": new_language.is_rtl,
                    "is_active": new_language.is_active,
                    "created_at": (
                        new_language.created_at.strftime("%Y-%m-%d %H:%M:%S")
                        if new_language.created_at
                        else None
                    ),
                    "updated_at": None,
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
            return Languages.objects.get(pk=pk, is_deleted="no")
        except Languages.DoesNotExist:
            return None

    def get(self, request, pk):
        user_role = request.user.role if request.user.is_authenticated else None
        if not user_role:
            return APIResponse.error(
                message="Authentication required. Please login first.",
                status_code=status.HTTP_401_UNAUTHORIZED,
            )

        language_obj = self._get_language(pk)
        if language_obj is None:
            return APIResponse.error(
                message="Language not found.",
                status_code=status.HTTP_404_NOT_FOUND,
            )

        return APIResponse.success(
            data={
                "id": language_obj.id,
                "language": language_obj.language,
                "short_code": language_obj.short_code,
                "country_code": language_obj.country_code,
                "is_rtl": language_obj.is_rtl,
                "is_active": language_obj.is_active,
                "is_deleted": language_obj.is_deleted,
                "created_at": (
                    language_obj.created_at.strftime("%Y-%m-%d %H:%M:%S")
                    if language_obj.created_at
                    else None
                ),
                "updated_at": (
                    language_obj.updated_at.strftime("%Y-%m-%d")
                    if language_obj.updated_at
                    else None
                ),
            },
            message="Language details retrieved successfully.",
        )

    def patch(self, request, pk):
        return self.put(request, pk)

    def put(self, request, pk):
        user_role = request.user.role if request.user.is_authenticated else None
        if not user_role:
            return APIResponse.error(
                message="Authentication required. Please login first.",
                status_code=status.HTTP_401_UNAUTHORIZED,
            )
        is_admin = getattr(request.user, "is_superadmin", False) or (
            user_role
            and str(user_role).strip().lower()
            in ["super admin", "admin", "superadmin", "staff"]
        )
        if not is_admin:
            return APIResponse.error(
                message="Access denied. Only Super Admins, Admins, or Staff can modify languages.",
                status_code=status.HTTP_403_FORBIDDEN,
            )

        language_obj = self._get_language(pk)
        if language_obj is None:
            return APIResponse.error(
                message="Language not found.",
                status_code=status.HTTP_404_NOT_FOUND,
            )

        data = request.data
        language_name = data.get("language")
        short_code = data.get("short_code")
        country_code = data.get("country_code")
        is_rtl = data.get("is_rtl")
        is_active = data.get("is_active")

        if language_name is not None:
            language_name_clean = str(language_name).strip()
            if not language_name_clean:
                return APIResponse.error(
                    message="Language name cannot be empty.",
                    status_code=status.HTTP_400_BAD_REQUEST,
                )
            if (
                Languages.objects.filter(
                    language__iexact=language_name_clean, is_deleted="no"
                )
                .exclude(pk=pk)
                .exists()
            ):
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
                    message="is_rtl must be an integer.",
                    status_code=status.HTTP_400_BAD_REQUEST,
                )

        if is_active is not None:
            if str(is_active).lower() not in ["yes", "no"]:
                return APIResponse.error(
                    message="is_active must be 'yes' or 'no'.",
                    status_code=status.HTTP_400_BAD_REQUEST,
                )
            language_obj.is_active = str(is_active).lower()

        try:
            language_obj.updated_at = datetime.date.today()
            language_obj.save()
            logger.info(
                f"Language ID {pk} updated by user {(request.user.username if request.user.is_authenticated else 'Unknown')}."
            )
            return APIResponse.success(
                data={
                    "id": language_obj.id,
                    "language": language_obj.language,
                    "short_code": language_obj.short_code,
                    "country_code": language_obj.country_code,
                    "is_rtl": language_obj.is_rtl,
                    "is_active": language_obj.is_active,
                    "created_at": (
                        language_obj.created_at.strftime("%Y-%m-%d %H:%M:%S")
                        if language_obj.created_at
                        else None
                    ),
                    "updated_at": (
                        language_obj.updated_at.strftime("%Y-%m-%d")
                        if language_obj.updated_at
                        else None
                    ),
                },
                message="Language updated successfully.",
            )
        except Exception as e:
            logger.error(f"Error updating language ID {pk}: {str(e)}")
            return APIResponse.error(
                message=f"Database error: {str(e)}",
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    def delete(self, request, pk):
        user_role = request.user.role if request.user.is_authenticated else None
        if not user_role:
            return APIResponse.error(
                message="Authentication required. Please login first.",
                status_code=status.HTTP_401_UNAUTHORIZED,
            )
        is_admin = getattr(request.user, "is_superadmin", False) or (
            user_role
            and str(user_role).strip().lower()
            in ["super admin", "admin", "superadmin", "staff"]
        )
        if not is_admin:
            return APIResponse.error(
                message="Access denied. Only Super Admins, Admins, or Staff can delete languages.",
                status_code=status.HTTP_403_FORBIDDEN,
            )

        language_obj = self._get_language(pk)
        if language_obj is None:
            return APIResponse.error(
                message="Language not found.",
                status_code=status.HTTP_404_NOT_FOUND,
            )

        if language_obj.is_active == "yes":
            return APIResponse.error(
                message="Cannot delete an active language. Deactivate it first.",
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        try:
            language_obj.is_deleted = "yes"
            language_obj.updated_at = datetime.date.today()
            language_obj.save()
            logger.info(
                f"Language ID {pk} soft-deleted by user {(request.user.username if request.user.is_authenticated else 'Unknown')}."
            )
            return APIResponse.success(message="Language successfully deleted.")
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
            user_role = request.user.role if request.user.is_authenticated else None
            if not user_role:
                return APIResponse.error(
                    message="Authentication required. Please login first.",
                    status_code=status.HTTP_401_UNAUTHORIZED,
                )

            currencies_qs = Currencies.objects.all().order_by("name")
            active_only = (
                request.query_params.get("active_only", "false").lower() == "true"
            )
            if active_only:
                currencies_qs = currencies_qs.filter(is_active=1)

            paginator = StandardResultsSetPagination()
            paginated_qs = paginator.paginate_queryset(
                currencies_qs, request, view=self
            )

            currencies_data = [
                _currency_payload(c) for c in (paginated_qs or currencies_qs)
            ]

            if paginated_qs is not None:
                return paginator.get_paginated_response({"currencies": currencies_data})

            return APIResponse.success(
                data={"currencies": currencies_data},
                message="Currencies retrieved successfully.",
            )
        except Exception as e:
            return APIResponse.error(
                message=f"Backend Error: {str(e)}",
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    def post(self, request):
        user_role = request.user.role if request.user.is_authenticated else None
        if not user_role:
            return APIResponse.error(
                message="Authentication required. Please login first.",
                status_code=status.HTTP_401_UNAUTHORIZED,
            )
        is_admin = getattr(request.user, "is_superadmin", False) or (
            user_role
            and str(user_role).strip().lower()
            in ["super admin", "admin", "superadmin", "staff"]
        )
        if not is_admin:
            return APIResponse.error(
                message="Access denied. Only Super Admins, Admins, or Staff can create currencies.",
                status_code=status.HTTP_403_FORBIDDEN,
            )

        data = request.data
        name = data.get("name")
        short_name = data.get("short_name")
        symbol = data.get("symbol")
        base_price = data.get("base_price", "1")
        is_active = data.get("is_active", 0)

        if not name or not short_name or not symbol:
            return APIResponse.error(
                message="Name, short_name, and symbol are required.",
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        try:
            is_active = int(is_active)
        except ValueError:
            return APIResponse.error(
                message="is_active must be an integer.",
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
                symbol=repair_utf8_cp1252_mojibake(str(symbol).strip()),
                base_price=str(base_price).strip(),
                is_active=is_active,
                created_at=timezone.now(),
            )
            logger.info(
                f"Currency '{new_currency.name}' created by user {(request.user.username if request.user.is_authenticated else 'Unknown')}."
            )
            return APIResponse.success(
                data=_currency_payload(new_currency),
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
        user_role = request.user.role if request.user.is_authenticated else None
        if not user_role:
            return APIResponse.error(
                message="Authentication required.",
                status_code=status.HTTP_401_UNAUTHORIZED,
            )

        currency_obj = self._get_currency(pk)
        if not currency_obj:
            return APIResponse.error(
                message="Currency not found.",
                status_code=status.HTTP_404_NOT_FOUND,
            )

        return APIResponse.success(
            data=_currency_payload(currency_obj),
            message="Currency retrieved successfully.",
        )

    def put(self, request, pk):
        return self.patch(request, pk)

    def patch(self, request, pk):
        user_role = request.user.role if request.user.is_authenticated else None
        if not user_role:
            return APIResponse.error(
                message="Authentication required.",
                status_code=status.HTTP_401_UNAUTHORIZED,
            )
        is_admin = getattr(request.user, "is_superadmin", False) or (
            user_role
            and str(user_role).strip().lower()
            in ["super admin", "admin", "superadmin", "staff"]
        )
        if not is_admin:
            return APIResponse.error(
                message="Access denied. Only Super Admins, Admins, or Staff can modify currencies.",
                status_code=status.HTTP_403_FORBIDDEN,
            )

        currency_obj = self._get_currency(pk)
        if not currency_obj:
            return APIResponse.error(
                message="Currency not found.",
                status_code=status.HTTP_404_NOT_FOUND,
            )

        data = request.data
        name = data.get("name")
        short_name = data.get("short_name")
        symbol = data.get("symbol")
        base_price = data.get("base_price")
        is_active = data.get("is_active")

        if name is not None:
            name_clean = str(name).strip()
            if (
                Currencies.objects.filter(name__iexact=name_clean)
                .exclude(pk=pk)
                .exists()
            ):
                return APIResponse.error(
                    message=f"Currency '{name_clean}' already exists.",
                    status_code=status.HTTP_400_BAD_REQUEST,
                )
            currency_obj.name = name_clean

        if short_name is not None:
            currency_obj.short_name = str(short_name).strip()
        if symbol is not None:
            currency_obj.symbol = repair_utf8_cp1252_mojibake(str(symbol).strip())
        if base_price is not None:
            currency_obj.base_price = str(base_price).strip()

        if is_active is not None:
            try:
                currency_obj.is_active = int(is_active)
            except ValueError:
                return APIResponse.error(
                    message="is_active must be an integer.",
                    status_code=status.HTTP_400_BAD_REQUEST,
                )

        try:
            currency_obj.save()
            logger.info(
                f"Currency ID {pk} updated by user {(request.user.username if request.user.is_authenticated else 'Unknown')}."
            )
            return APIResponse.success(
                data=_currency_payload(currency_obj),
                message="Currency updated successfully.",
            )
        except Exception as e:
            logger.error(f"Error updating currency {pk}: {str(e)}")
            return APIResponse.error(
                message=f"Database error: {str(e)}",
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    def delete(self, request, pk):
        user_role = request.user.role if request.user.is_authenticated else None
        if not user_role:
            return APIResponse.error(
                message="Authentication required.",
                status_code=status.HTTP_401_UNAUTHORIZED,
            )
        is_admin = getattr(request.user, "is_superadmin", False) or (
            user_role
            and str(user_role).strip().lower()
            in ["super admin", "admin", "superadmin", "staff"]
        )
        if not is_admin:
            return APIResponse.error(
                message="Access denied. Only Super Admins, Admins, or Staff can delete currencies.",
                status_code=status.HTTP_403_FORBIDDEN,
            )

        currency_obj = self._get_currency(pk)
        if not currency_obj:
            return APIResponse.error(
                message="Currency not found.",
                status_code=status.HTTP_404_NOT_FOUND,
            )

        try:
            currency_name = currency_obj.name
            currency_obj.delete()
            logger.info(
                f"Currency '{currency_name}' (ID: {pk}) HARD-DELETED by user {(request.user.username if request.user.is_authenticated else 'Unknown')}."
            )
            return APIResponse.success(
                data=None,
                message="Currency deleted successfully.",
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
        user_role = request.user.role if request.user.is_authenticated else None
        if not user_role:
            return APIResponse.error(
                message="Authentication required.",
                status_code=status.HTTP_401_UNAUTHORIZED,
            )
        is_admin = getattr(request.user, "is_superadmin", False) or (
            user_role
            and str(user_role).strip().lower()
            in ["super admin", "admin", "superadmin", "staff"]
        )
        if not is_admin:
            return APIResponse.error(
                message="Access denied. Only Super Admins, Admins, or Staff can activate currencies.",
                status_code=status.HTTP_403_FORBIDDEN,
            )

        try:
            target_currency = Currencies.objects.get(pk=pk)
        except Currencies.DoesNotExist:
            return APIResponse.error(
                message="Currency not found.",
                status_code=status.HTTP_404_NOT_FOUND,
            )

        try:
            Currencies.objects.all().update(is_active=0)
            target_currency.is_active = 1
            target_currency.save()

            logger.info(
                f"Currency ID {pk} activated by user {(request.user.username if request.user.is_authenticated else 'Unknown')}."
            )
            return APIResponse.success(
                data=_currency_payload(target_currency),
                message="Currency activated successfully.",
            )
        except Exception as e:
            logger.error(f"Error activating currency {pk}: {str(e)}")
            return APIResponse.error(
                message=f"Database error: {str(e)}",
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
