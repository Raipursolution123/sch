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
    """Registration is managed by the legacy ERP schema/workflow."""

    permission_classes = [AllowAny]

    def post(self, request):
        return APIResponse.error(
            message="Registration is not available via this API. Use the legacy ERP workflow.",
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
        )


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
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


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return APIResponse.success(data=UserSerializer(request.user).data)


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # Legacy schema has no JWT blacklist table; client discards tokens.
        return APIResponse.success(message="Logged out successfully")
