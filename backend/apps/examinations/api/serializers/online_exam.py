from rest_framework import serializers


class QuestionBankSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    staff_id = serializers.IntegerField(allow_null=True)
    subject_id = serializers.IntegerField(allow_null=True)
    lesson_id = serializers.IntegerField(allow_null=True)
    lesson_name = serializers.CharField(allow_blank=True, allow_null=True)
    question_type = serializers.CharField()
    level = serializers.CharField()
    class_id = serializers.IntegerField()
    section_id = serializers.IntegerField(allow_null=True)
    class_section_id = serializers.IntegerField(allow_null=True)
    question_parts = serializers.CharField(allow_blank=True, allow_null=True)
    question = serializers.CharField(allow_blank=True, allow_null=True)
    opt_a = serializers.CharField(allow_blank=True, allow_null=True)
    opt_b = serializers.CharField(allow_blank=True, allow_null=True)
    opt_c = serializers.CharField(allow_blank=True, allow_null=True)
    opt_d = serializers.CharField(allow_blank=True, allow_null=True)
    opt_e = serializers.CharField(allow_blank=True, allow_null=True)
    correct = serializers.CharField(allow_blank=True, allow_null=True)
    qscore = serializers.IntegerField(allow_null=True)
    descriptive_word_limit = serializers.IntegerField()
    created_at = serializers.DateTimeField(allow_null=True)
    updated_at = serializers.DateField(allow_null=True)
    qpart_1 = serializers.IntegerField()
    qpart_2 = serializers.IntegerField()
    qpart_3 = serializers.IntegerField()
    qpart_4 = serializers.IntegerField()
    qpart_5 = serializers.IntegerField()
    is_it_offline = serializers.IntegerField()


class QuestionBankWriteSerializer(serializers.Serializer):
    class_id = serializers.IntegerField()
    question_type = serializers.CharField(max_length=100)
    question = serializers.CharField()
    level = serializers.CharField(required=False, default="low", max_length=10)
    subject_id = serializers.IntegerField(required=False, allow_null=True)
    lesson_id = serializers.IntegerField(required=False, allow_null=True)
    lesson_name = serializers.CharField(
        required=False, allow_blank=True, allow_null=True, default=""
    )
    section_id = serializers.IntegerField(required=False, allow_null=True)
    class_section_id = serializers.IntegerField(required=False, allow_null=True)
    question_parts = serializers.CharField(
        required=False, allow_blank=True, allow_null=True, default=""
    )
    opt_a = serializers.CharField(required=False, allow_blank=True, default="")
    opt_b = serializers.CharField(required=False, allow_blank=True, default="")
    opt_c = serializers.CharField(required=False, allow_blank=True, default="")
    opt_d = serializers.CharField(required=False, allow_blank=True, default="")
    opt_e = serializers.CharField(required=False, allow_blank=True, default="")
    correct = serializers.CharField(required=False, allow_blank=True, default="")
    qscore = serializers.IntegerField(required=False, default=1)
    descriptive_word_limit = serializers.IntegerField(required=False, default=0)
    qpart_1 = serializers.IntegerField(required=False, default=0)
    qpart_2 = serializers.IntegerField(required=False, default=0)
    qpart_3 = serializers.IntegerField(required=False, default=0)
    qpart_4 = serializers.IntegerField(required=False, default=0)
    qpart_5 = serializers.IntegerField(required=False, default=0)
    is_it_offline = serializers.IntegerField(required=False, default=0)


class QuestionBankUpdateSerializer(QuestionBankWriteSerializer):
    class_id = serializers.IntegerField(required=False)
    question_type = serializers.CharField(required=False, max_length=100)
    question = serializers.CharField(required=False)


class OnlineExamSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    session_id = serializers.IntegerField(allow_null=True)
    exam = serializers.CharField(allow_blank=True, allow_null=True)
    attempt = serializers.IntegerField()
    exam_from = serializers.DateTimeField(allow_null=True)
    exam_to = serializers.DateTimeField(allow_null=True)
    is_quiz = serializers.IntegerField()
    auto_publish_date = serializers.DateTimeField(allow_null=True)
    time_from = serializers.CharField(allow_null=True)
    time_to = serializers.CharField(allow_null=True)
    duration = serializers.CharField(allow_null=True)
    passing_percentage = serializers.CharField()
    description = serializers.CharField(allow_blank=True, allow_null=True)
    publish_result = serializers.IntegerField()
    answer_word_count = serializers.IntegerField()
    is_active = serializers.CharField(allow_null=True)
    is_marks_display = serializers.IntegerField()
    is_neg_marking = serializers.IntegerField()
    is_random_question = serializers.IntegerField()
    is_rank_generated = serializers.IntegerField()
    publish_exam_notification = serializers.IntegerField()
    publish_result_notification = serializers.IntegerField()
    created_at = serializers.DateTimeField(allow_null=True)
    updated_at = serializers.DateField(allow_null=True)
    question_count = serializers.IntegerField(required=False)
    student_count = serializers.IntegerField(required=False)


class OnlineExamWriteSerializer(serializers.Serializer):
    session_id = serializers.IntegerField()
    exam = serializers.CharField()
    attempt = serializers.IntegerField(required=False, default=1)
    exam_from = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    exam_to = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    is_quiz = serializers.IntegerField(required=False, default=0)
    auto_publish_date = serializers.CharField(
        required=False, allow_blank=True, allow_null=True
    )
    time_from = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    time_to = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    duration = serializers.CharField(required=False, default="01:00:00")
    passing_percentage = serializers.CharField(required=False, default="0")
    description = serializers.CharField(
        required=False, allow_blank=True, allow_null=True, default=""
    )
    publish_result = serializers.IntegerField(required=False, default=0)
    answer_word_count = serializers.IntegerField(required=False, default=-1)
    is_active = serializers.CharField(required=False, default="1")
    is_marks_display = serializers.IntegerField(required=False, default=0)
    is_neg_marking = serializers.IntegerField(required=False, default=0)
    is_random_question = serializers.IntegerField(required=False, default=0)
    is_rank_generated = serializers.IntegerField(required=False, default=0)
    publish_exam_notification = serializers.IntegerField(required=False, default=0)
    publish_result_notification = serializers.IntegerField(required=False, default=0)


class OnlineExamUpdateSerializer(OnlineExamWriteSerializer):
    session_id = serializers.IntegerField(required=False)
    exam = serializers.CharField(required=False)


class OnlineExamQuestionAddSerializer(serializers.Serializer):
    questions = serializers.ListField(child=serializers.DictField(), allow_empty=False)


class OnlineExamAssignSerializer(serializers.Serializer):
    student_session_ids = serializers.ListField(
        child=serializers.IntegerField(), allow_empty=False
    )
