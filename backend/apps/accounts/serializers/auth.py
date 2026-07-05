from rest_framework import serializers

from apps.accounts.models import User


class UserSerializer(serializers.ModelSerializer):
    is_superadmin = serializers.SerializerMethodField()

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

    def get_is_superadmin(self, obj: User) -> bool:
        return obj.is_superadmin


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)
    role = serializers.CharField(required=False, allow_blank=True)


class RegisterSerializer(serializers.Serializer):
    username = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=6)
    first_name = serializers.CharField()
    last_name = serializers.CharField(required=False, allow_blank=True)
