from rest_framework import serializers


class IncomeHeadSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    income_category = serializers.CharField(max_length=255, allow_null=True)
    description = serializers.CharField(
        max_length=255, allow_blank=True, required=False, allow_null=True
    )
    is_active = serializers.CharField(required=False, allow_null=True)
    is_deleted = serializers.CharField(read_only=True, allow_null=True)
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateField(read_only=True, allow_null=True)


class IncomeHeadCreateSerializer(serializers.Serializer):
    income_category = serializers.CharField(max_length=255)
    description = serializers.CharField(
        max_length=255, allow_blank=True, required=False, allow_null=True
    )
    is_active = serializers.CharField(required=False)


class IncomeHeadUpdateSerializer(serializers.Serializer):
    income_category = serializers.CharField(max_length=255, required=False)
    description = serializers.CharField(
        max_length=255, allow_blank=True, required=False, allow_null=True
    )
    is_active = serializers.CharField(required=False)


class ExpenseHeadSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    exp_category = serializers.CharField(max_length=50, allow_null=True)
    description = serializers.CharField(
        allow_blank=True, required=False, allow_null=True
    )
    is_active = serializers.CharField(required=False, allow_null=True)
    is_deleted = serializers.CharField(read_only=True, allow_null=True)
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateField(read_only=True, allow_null=True)


class ExpenseHeadCreateSerializer(serializers.Serializer):
    exp_category = serializers.CharField(max_length=50)
    description = serializers.CharField(
        allow_blank=True, required=False, allow_null=True
    )
    is_active = serializers.CharField(required=False)


class ExpenseHeadUpdateSerializer(serializers.Serializer):
    exp_category = serializers.CharField(max_length=50, required=False)
    description = serializers.CharField(
        allow_blank=True, required=False, allow_null=True
    )
    is_active = serializers.CharField(required=False)


class IncomeSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    income_head_id = serializers.IntegerField(allow_null=True, required=False)
    name = serializers.CharField(max_length=50, allow_null=True)
    invoice_no = serializers.CharField(
        max_length=200, allow_blank=True, required=False, allow_null=True
    )
    date = serializers.DateField(allow_null=True)
    amount = serializers.FloatField(allow_null=True)
    note = serializers.CharField(allow_blank=True, required=False, allow_null=True)
    documents = serializers.CharField(
        max_length=255, allow_blank=True, required=False, allow_null=True
    )
    is_active = serializers.CharField(required=False, allow_null=True)
    is_deleted = serializers.CharField(read_only=True, allow_null=True)
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateField(read_only=True, allow_null=True)


class IncomeCreateSerializer(serializers.Serializer):
    income_head_id = serializers.IntegerField(required=False, allow_null=True)
    name = serializers.CharField(max_length=50)
    invoice_no = serializers.CharField(
        max_length=200, allow_blank=True, required=False, allow_null=True
    )
    date = serializers.DateField(required=False)
    amount = serializers.FloatField(required=False, default=0)
    note = serializers.CharField(allow_blank=True, required=False, allow_null=True)
    documents = serializers.CharField(
        max_length=255, allow_blank=True, required=False, allow_null=True
    )
    is_active = serializers.CharField(required=False)


class IncomeUpdateSerializer(serializers.Serializer):
    income_head_id = serializers.IntegerField(required=False, allow_null=True)
    name = serializers.CharField(max_length=50, required=False)
    invoice_no = serializers.CharField(
        max_length=200, allow_blank=True, required=False, allow_null=True
    )
    date = serializers.DateField(required=False, allow_null=True)
    amount = serializers.FloatField(required=False)
    note = serializers.CharField(allow_blank=True, required=False, allow_null=True)
    documents = serializers.CharField(
        max_length=255, allow_blank=True, required=False, allow_null=True
    )
    is_active = serializers.CharField(required=False)


class ExpenseSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    exp_head_id = serializers.IntegerField(allow_null=True, required=False)
    name = serializers.CharField(max_length=50, allow_null=True)
    invoice_no = serializers.CharField(
        max_length=200, allow_blank=True, required=False, allow_null=True
    )
    date = serializers.DateField(allow_null=True)
    amount = serializers.FloatField(allow_null=True)
    note = serializers.CharField(allow_blank=True, required=False, allow_null=True)
    documents = serializers.CharField(
        max_length=255, allow_blank=True, required=False, allow_null=True
    )
    is_active = serializers.CharField(required=False, allow_null=True)
    is_deleted = serializers.CharField(read_only=True, allow_null=True)
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateField(read_only=True, allow_null=True)


class ExpenseCreateSerializer(serializers.Serializer):
    exp_head_id = serializers.IntegerField(required=False, allow_null=True)
    name = serializers.CharField(max_length=50)
    invoice_no = serializers.CharField(
        max_length=200, allow_blank=True, required=False, allow_null=True
    )
    date = serializers.DateField(required=False)
    amount = serializers.FloatField(required=False, default=0)
    note = serializers.CharField(allow_blank=True, required=False, allow_null=True)
    documents = serializers.CharField(
        max_length=255, allow_blank=True, required=False, allow_null=True
    )
    is_active = serializers.CharField(required=False)


class ExpenseUpdateSerializer(serializers.Serializer):
    exp_head_id = serializers.IntegerField(required=False, allow_null=True)
    name = serializers.CharField(max_length=50, required=False)
    invoice_no = serializers.CharField(
        max_length=200, allow_blank=True, required=False, allow_null=True
    )
    date = serializers.DateField(required=False, allow_null=True)
    amount = serializers.FloatField(required=False)
    note = serializers.CharField(allow_blank=True, required=False, allow_null=True)
    documents = serializers.CharField(
        max_length=255, allow_blank=True, required=False, allow_null=True
    )
    is_active = serializers.CharField(required=False)
