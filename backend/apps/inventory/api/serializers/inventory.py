from rest_framework import serializers


class ItemCategorySerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    item_category = serializers.CharField(max_length=255)
    is_active = serializers.CharField(max_length=255, required=False)
    description = serializers.CharField(max_length=255, allow_blank=True, required=False)
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateField(read_only=True, allow_null=True)


class ItemCategoryCreateSerializer(serializers.Serializer):
    item_category = serializers.CharField(max_length=255)
    description = serializers.CharField(
        max_length=255, allow_blank=True, required=False, default=""
    )
    is_active = serializers.CharField(max_length=255, required=False)


class ItemCategoryUpdateSerializer(serializers.Serializer):
    item_category = serializers.CharField(max_length=255, required=False)
    description = serializers.CharField(
        max_length=255, allow_blank=True, required=False
    )
    is_active = serializers.CharField(max_length=255, required=False)


class ItemStoreSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    item_store = serializers.CharField(max_length=255)
    code = serializers.CharField(max_length=255)
    description = serializers.CharField(allow_blank=True, required=False)
    created_at = serializers.DateTimeField(read_only=True)


class ItemStoreCreateSerializer(serializers.Serializer):
    item_store = serializers.CharField(max_length=255)
    code = serializers.CharField(max_length=255)
    description = serializers.CharField(
        allow_blank=True, required=False, default=""
    )


class ItemStoreUpdateSerializer(serializers.Serializer):
    item_store = serializers.CharField(max_length=255, required=False)
    code = serializers.CharField(max_length=255, required=False)
    description = serializers.CharField(allow_blank=True, required=False)


class ItemSupplierSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    item_supplier = serializers.CharField(max_length=255)
    phone = serializers.CharField(max_length=255, allow_blank=True, required=False)
    email = serializers.CharField(max_length=255, allow_blank=True, required=False)
    address = serializers.CharField(max_length=255, allow_blank=True, required=False)
    contact_person_name = serializers.CharField(
        max_length=255, allow_blank=True, required=False
    )
    contact_person_phone = serializers.CharField(
        max_length=255, allow_blank=True, required=False
    )
    contact_person_email = serializers.CharField(
        max_length=255, allow_blank=True, required=False
    )
    description = serializers.CharField(allow_blank=True, required=False)


class ItemSupplierCreateSerializer(serializers.Serializer):
    item_supplier = serializers.CharField(max_length=255)
    phone = serializers.CharField(
        max_length=255, allow_blank=True, required=False, default=""
    )
    email = serializers.CharField(
        max_length=255, allow_blank=True, required=False, default=""
    )
    address = serializers.CharField(
        max_length=255, allow_blank=True, required=False, default=""
    )
    contact_person_name = serializers.CharField(
        max_length=255, allow_blank=True, required=False, default=""
    )
    contact_person_phone = serializers.CharField(
        max_length=255, allow_blank=True, required=False, default=""
    )
    contact_person_email = serializers.CharField(
        max_length=255, allow_blank=True, required=False, default=""
    )
    description = serializers.CharField(
        allow_blank=True, required=False, default=""
    )


class ItemSupplierUpdateSerializer(serializers.Serializer):
    item_supplier = serializers.CharField(max_length=255, required=False)
    phone = serializers.CharField(max_length=255, allow_blank=True, required=False)
    email = serializers.CharField(max_length=255, allow_blank=True, required=False)
    address = serializers.CharField(max_length=255, allow_blank=True, required=False)
    contact_person_name = serializers.CharField(
        max_length=255, allow_blank=True, required=False
    )
    contact_person_phone = serializers.CharField(
        max_length=255, allow_blank=True, required=False
    )
    contact_person_email = serializers.CharField(
        max_length=255, allow_blank=True, required=False
    )
    description = serializers.CharField(allow_blank=True, required=False)


class ItemSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    item_category_id = serializers.IntegerField(allow_null=True, required=False)
    item_store_id = serializers.IntegerField(allow_null=True, required=False)
    item_supplier_id = serializers.IntegerField(allow_null=True, required=False)
    name = serializers.CharField(max_length=255)
    unit = serializers.CharField(max_length=100)
    item_photo = serializers.CharField(
        max_length=225, allow_blank=True, required=False, allow_null=True
    )
    description = serializers.CharField(allow_blank=True, required=False)
    quantity = serializers.IntegerField()
    date = serializers.DateField(allow_null=True, required=False)
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateField(read_only=True, allow_null=True)


class ItemCreateSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=255)
    unit = serializers.CharField(max_length=100)
    item_category_id = serializers.IntegerField(required=False, allow_null=True)
    item_store_id = serializers.IntegerField(required=False, allow_null=True)
    item_supplier_id = serializers.IntegerField(required=False, allow_null=True)
    item_photo = serializers.CharField(
        max_length=225, allow_blank=True, required=False, allow_null=True
    )
    description = serializers.CharField(
        allow_blank=True, required=False, default=""
    )
    quantity = serializers.IntegerField(required=False, default=0)
    date = serializers.DateField(required=False, allow_null=True)


class ItemUpdateSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=255, required=False)
    unit = serializers.CharField(max_length=100, required=False)
    item_category_id = serializers.IntegerField(required=False, allow_null=True)
    item_store_id = serializers.IntegerField(required=False, allow_null=True)
    item_supplier_id = serializers.IntegerField(required=False, allow_null=True)
    item_photo = serializers.CharField(
        max_length=225, allow_blank=True, required=False, allow_null=True
    )
    description = serializers.CharField(allow_blank=True, required=False)
    quantity = serializers.IntegerField(required=False)
    date = serializers.DateField(required=False, allow_null=True)


class ItemStockSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    item_id = serializers.IntegerField(allow_null=True)
    supplier_id = serializers.IntegerField(allow_null=True, required=False)
    store_id = serializers.IntegerField(allow_null=True, required=False)
    symbol = serializers.CharField(max_length=10)
    quantity = serializers.IntegerField(allow_null=True)
    purchase_price = serializers.FloatField()
    date = serializers.DateField()
    attachment = serializers.CharField(
        max_length=250, allow_blank=True, required=False, allow_null=True
    )
    description = serializers.CharField(allow_blank=True, required=False)
    is_active = serializers.CharField(max_length=10, required=False, allow_null=True)
    created_at = serializers.DateTimeField(read_only=True)


class ItemStockCreateSerializer(serializers.Serializer):
    item_id = serializers.IntegerField()
    supplier_id = serializers.IntegerField(required=False, allow_null=True)
    store_id = serializers.IntegerField(required=False, allow_null=True)
    symbol = serializers.CharField(max_length=10, required=False, default="+")
    quantity = serializers.IntegerField()
    purchase_price = serializers.FloatField(required=False, default=0)
    date = serializers.DateField(required=False)
    attachment = serializers.CharField(
        max_length=250, allow_blank=True, required=False, allow_null=True
    )
    description = serializers.CharField(
        allow_blank=True, required=False, default=""
    )


class ItemIssueSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    issue_type = serializers.CharField(allow_null=True, required=False)
    issue_to = serializers.IntegerField()
    issue_by = serializers.IntegerField(allow_null=True, required=False)
    issue_date = serializers.DateField(allow_null=True)
    return_date = serializers.DateField(allow_null=True)
    item_category_id = serializers.IntegerField(allow_null=True, required=False)
    item_id = serializers.IntegerField(allow_null=True)
    quantity = serializers.IntegerField()
    issue_category = serializers.CharField()
    note = serializers.CharField(allow_blank=True, required=False)
    is_returned = serializers.IntegerField()
    created_at = serializers.DateTimeField(read_only=True)
    is_active = serializers.CharField(allow_null=True, required=False)


class ItemIssueCreateSerializer(serializers.Serializer):
    item_id = serializers.IntegerField()
    issue_to = serializers.IntegerField()
    quantity = serializers.IntegerField()
    issue_type = serializers.CharField(required=False, allow_blank=True)
    issue_by = serializers.IntegerField(required=False, allow_null=True)
    issue_date = serializers.DateField(required=False)
    item_category_id = serializers.IntegerField(required=False, allow_null=True)
    issue_category = serializers.CharField(required=False, allow_blank=True)
    note = serializers.CharField(required=False, allow_blank=True, default="")


class ItemIssueReturnSerializer(serializers.Serializer):
    return_date = serializers.DateField(required=False, allow_null=True)
