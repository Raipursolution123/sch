from django.contrib.auth import authenticate

from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from apps.accounts.serializers import LoginSerializer, UserSerializer
from common.responses import APIResponse


class CustomTokenObtainPairView(TokenObtainPairView):
    permission_classes = [AllowAny]


class CustomTokenRefreshView(TokenRefreshView):
    permission_classes = [AllowAny]


class RegisterView(APIView):
    """Registration for admins via API."""

    permission_classes = [AllowAny]

    def post(self, request):
        from apps.accounts.serializers import RegisterSerializer

        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data["username"]
        password = serializer.validated_data["password"]
        first_name = serializer.validated_data["first_name"]
        last_name = serializer.validated_data.get("last_name", "")

        from django.utils import timezone

        from apps.accounts.services.staff_auth import ensure_staff_user_bridge
        from apps.staff.models import Staff
        from core.provisioning.school_setup import hash_staff_password

        if Staff.objects.filter(email=email).exists():
            return APIResponse.error(
                message="User with this email already exists",
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        import uuid
        now = timezone.now()
        try:
            staff = Staff.objects.create(
                employee_id=f"EMP-{uuid.uuid4().hex[:8].upper()}",
                lang_id=4,
                currency_id=1,
                name=first_name,
                surname=last_name,
                email=email,
                password=hash_staff_password(password),
                dob="2000-01-01",
                date_of_joining=now.date(),
                gender="Other",
                is_active=1,
                user_id=0,
                qualification="",
                work_exp="",
                father_name="",
                mother_name="",
                contact_no="",
                emergency_contact_no="",
                marital_status="",
                local_address="",
                permanent_address="",
                note="",
                image="",
                account_title="",
                bank_account_no="",
                bank_name="",
                ifsc_code="",
                bank_branch="",
                payscale="",
                epf_no="",
                contract_type="",
                shift="",
                location="",
                facebook="",
                twitter="",
                linkedin="",
                instagram="",
                resume="",
                joining_letter="",
                resignation_letter="",
                other_document_name="",
                other_document_file="",
                verification_code="",
            )

            user = ensure_staff_user_bridge(staff)
        except Exception as e:
            return APIResponse.error(
                message=f"Database creation error: {str(e)}",
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        refresh = RefreshToken.for_user(user)
        return APIResponse.success(
            data={
                "user": UserSerializer(user).data,
                "tokens": {
                    "access": str(refresh.access_token),
                    "refresh": str(refresh),
                },
            },
            message="Registration successful",
            status_code=status.HTTP_201_CREATED,
        )


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        try:
            serializer = LoginSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)

            user = authenticate(
                request,
                username=serializer.validated_data["username"],
                password=serializer.validated_data["password"],
                role=serializer.validated_data.get("role") or None,
            )
            if not user:
                return APIResponse.error(
                    message="Invalid credentials",
                    status_code=status.HTTP_401_UNAUTHORIZED,
                )

            if not user.is_active_user:
                return APIResponse.error(
                    message="Account is inactive",
                    status_code=status.HTTP_403_FORBIDDEN,
                )

            refresh = RefreshToken.for_user(user)
            return APIResponse.success(
                data={
                    "user": UserSerializer(user).data,
                    "tokens": {
                        "access": str(refresh.access_token),
                        "refresh": str(refresh),
                    },
                },
                message="Login successful",
            )
        except Exception:
            import traceback

            traceback.print_exc()
            raise


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return APIResponse.success(data=UserSerializer(request.user).data)


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # Legacy schema has no JWT blacklist table; client discards tokens.
        return APIResponse.success(message="Logged out successfully")
