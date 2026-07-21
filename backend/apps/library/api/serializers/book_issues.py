from rest_framework import serializers


class BookIssueSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    book_id = serializers.IntegerField()
    member_id = serializers.IntegerField(allow_null=True)
    issue_date = serializers.DateField(allow_null=True)
    duereturn_date = serializers.DateField(allow_null=True)
    return_date = serializers.DateField(allow_null=True)
    is_returned = serializers.IntegerField()
    is_active = serializers.CharField(allow_null=True, required=False)
    created_at = serializers.DateTimeField(read_only=True)
    book_title = serializers.CharField(allow_null=True, required=False)
    book_no = serializers.CharField(allow_null=True, required=False)
    library_card_no = serializers.CharField(allow_null=True, required=False)
    member_type = serializers.CharField(allow_null=True, required=False)
    member_ref_id = serializers.IntegerField(allow_null=True, required=False)


class BookIssueCreateSerializer(serializers.Serializer):
    book_id = serializers.IntegerField()
    member_id = serializers.IntegerField()
    issue_date = serializers.DateField(required=False)
    duereturn_date = serializers.DateField(required=False, allow_null=True)


class BookReturnSerializer(serializers.Serializer):
    return_date = serializers.DateField(required=False, allow_null=True)


class LibraryMemberSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    library_card_no = serializers.CharField(
        max_length=50, allow_blank=True, required=False, allow_null=True
    )
    member_type = serializers.CharField(
        max_length=50, allow_blank=True, required=False, allow_null=True
    )
    member_id = serializers.IntegerField(allow_null=True, required=False)
    is_active = serializers.CharField(max_length=10, required=False)
    created_at = serializers.DateTimeField(read_only=True)


class LibraryMemberCreateSerializer(serializers.Serializer):
    library_card_no = serializers.CharField(
        max_length=50, allow_blank=True, required=False, allow_null=True
    )
    member_type = serializers.CharField(max_length=50)
    member_id = serializers.IntegerField()
    is_active = serializers.CharField(max_length=10, required=False)
