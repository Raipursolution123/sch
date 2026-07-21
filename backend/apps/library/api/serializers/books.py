from rest_framework import serializers


class BookSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    book_title = serializers.CharField(max_length=100)
    book_no = serializers.CharField(max_length=50)
    isbn_no = serializers.CharField(max_length=100)
    subject = serializers.CharField(
        max_length=100, allow_blank=True, required=False, allow_null=True
    )
    claases = serializers.CharField(
        max_length=44, allow_blank=True, required=False, allow_null=True
    )
    category = serializers.CharField(
        max_length=255, allow_blank=True, required=False, allow_null=True
    )
    rack_no = serializers.CharField(max_length=100)
    publish = serializers.CharField(
        max_length=100, allow_blank=True, required=False, allow_null=True
    )
    author = serializers.CharField(
        max_length=100, allow_blank=True, required=False, allow_null=True
    )
    qty = serializers.IntegerField(required=False, allow_null=True)
    perunitcost = serializers.FloatField(required=False, allow_null=True)
    postdate = serializers.DateField(required=False, allow_null=True)
    description = serializers.CharField(
        allow_blank=True, required=False, allow_null=True
    )
    available = serializers.CharField(
        max_length=10, required=False, allow_null=True
    )
    is_active = serializers.CharField(
        max_length=255, required=False, allow_null=True
    )
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateField(read_only=True, allow_null=True)


class BookCreateSerializer(serializers.Serializer):
    book_title = serializers.CharField(max_length=100)
    book_no = serializers.CharField(max_length=50)
    isbn_no = serializers.CharField(max_length=100)
    rack_no = serializers.CharField(max_length=100)
    subject = serializers.CharField(
        max_length=100, allow_blank=True, required=False, allow_null=True
    )
    claases = serializers.CharField(
        max_length=44, allow_blank=True, required=False, allow_null=True
    )
    category = serializers.CharField(
        max_length=255, allow_blank=True, required=False, allow_null=True
    )
    publish = serializers.CharField(
        max_length=100, allow_blank=True, required=False, allow_null=True
    )
    author = serializers.CharField(
        max_length=100, allow_blank=True, required=False, allow_null=True
    )
    qty = serializers.IntegerField(required=False, default=1)
    perunitcost = serializers.FloatField(required=False, allow_null=True)
    postdate = serializers.DateField(required=False, allow_null=True)
    description = serializers.CharField(
        allow_blank=True, required=False, allow_null=True
    )
    available = serializers.CharField(
        max_length=10, required=False, allow_null=True
    )
    is_active = serializers.CharField(
        max_length=255, required=False, allow_null=True
    )


class BookUpdateSerializer(serializers.Serializer):
    book_title = serializers.CharField(max_length=100, required=False)
    book_no = serializers.CharField(max_length=50, required=False)
    isbn_no = serializers.CharField(max_length=100, required=False)
    rack_no = serializers.CharField(max_length=100, required=False)
    subject = serializers.CharField(
        max_length=100, allow_blank=True, required=False, allow_null=True
    )
    claases = serializers.CharField(
        max_length=44, allow_blank=True, required=False, allow_null=True
    )
    category = serializers.CharField(
        max_length=255, allow_blank=True, required=False, allow_null=True
    )
    publish = serializers.CharField(
        max_length=100, allow_blank=True, required=False, allow_null=True
    )
    author = serializers.CharField(
        max_length=100, allow_blank=True, required=False, allow_null=True
    )
    qty = serializers.IntegerField(required=False)
    perunitcost = serializers.FloatField(required=False, allow_null=True)
    postdate = serializers.DateField(required=False, allow_null=True)
    description = serializers.CharField(
        allow_blank=True, required=False, allow_null=True
    )
    available = serializers.CharField(
        max_length=10, required=False, allow_null=True
    )
    is_active = serializers.CharField(
        max_length=255, required=False, allow_null=True
    )
