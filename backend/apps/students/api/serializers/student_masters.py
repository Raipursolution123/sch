from rest_framework import serializers


class StudentCategorySerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    name = serializers.CharField()
    is_active = serializers.CharField(allow_blank=True)
    created_at = serializers.CharField(allow_null=True, required=False)


class StudentCategoryCreateSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=100)
    is_active = serializers.CharField(required=False, default="yes")


class StudentCategoryUpdateSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=100, required=False)
    is_active = serializers.CharField(required=False)


class StudentHouseSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    house_name = serializers.CharField()
    description = serializers.CharField(allow_blank=True)
    house_incharge = serializers.IntegerField(allow_null=True, required=False)
    house_president = serializers.IntegerField(allow_null=True, required=False)
    is_active = serializers.CharField(allow_blank=True)


class StudentHouseCreateSerializer(serializers.Serializer):
    house_name = serializers.CharField(max_length=200)
    description = serializers.CharField(
        max_length=400, required=False, allow_blank=True, default=""
    )
    house_incharge = serializers.IntegerField(required=False, allow_null=True)
    house_president = serializers.IntegerField(required=False, allow_null=True)
    is_active = serializers.CharField(required=False, default="yes")


class StudentHouseUpdateSerializer(serializers.Serializer):
    house_name = serializers.CharField(max_length=200, required=False)
    description = serializers.CharField(
        max_length=400, required=False, allow_blank=True
    )
    house_incharge = serializers.IntegerField(required=False, allow_null=True)
    house_president = serializers.IntegerField(required=False, allow_null=True)
    is_active = serializers.CharField(required=False)


class StudentImportRequestSerializer(serializers.Serializer):
    rows = serializers.ListField(
        child=serializers.DictField(),
        allow_empty=False,
        min_length=1,
    )
