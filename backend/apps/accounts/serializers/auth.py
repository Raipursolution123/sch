from rest_framework import serializers

from apps.accounts.models import User


class UserSerializer(serializers.ModelSerializer):
    is_superadmin = serializers.BooleanField(read_only=True)

    class Meta:
        model = User
        fields = (
            "id",
            "user_id",
            "username",
            "role",
            "lang_id",
            "currency_id",
            "is_active",
            "is_superadmin",
            "created_at",
            "updated_at",
        )
        read_only_fields = fields


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)
    role = serializers.CharField(required=False, allow_blank=True)
