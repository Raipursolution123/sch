from rest_framework import serializers
from apps.examinations.models.template_marksheets import TemplateMarksheets
from apps.documents.models.template_admitcards import TemplateAdmitcards


class TemplateMarksheetsSerializer(serializers.ModelSerializer):
    class Meta:
        model = TemplateMarksheets
        fields = "__all__"


class TemplateAdmitcardsSerializer(serializers.ModelSerializer):
    class Meta:
        model = TemplateAdmitcards
        fields = "__all__"
