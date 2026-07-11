from rest_framework import serializers


class StudentFeePaymentSerializer(serializers.Serializer):
    amount = serializers.DecimalField(max_digits=12, decimal_places=2, min_value=0.01)
    feetype_id = serializers.IntegerField(min_value=1)
    payment_mode = serializers.CharField(required=False, default="Cash", max_length=50)
    description = serializers.CharField(required=False, allow_blank=True, default="")
    date = serializers.DateField(required=False)
