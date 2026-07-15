from rest_framework import serializers


# ---------------------------------------------------------
# Lesson Serializers
# ---------------------------------------------------------
class LessonSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    session_id = serializers.IntegerField()
    subject_group_subject_id = serializers.IntegerField()
    subject_group_class_sections_id = serializers.IntegerField()
    name = serializers.CharField(max_length=255)
    created_at = serializers.DateTimeField()
    
    subject_name = serializers.SerializerMethodField()
    subject_group_name = serializers.SerializerMethodField()
    class_section_name = serializers.SerializerMethodField()
    
    subject_group_id = serializers.SerializerMethodField()
    subject_id = serializers.SerializerMethodField()
    class_section_id = serializers.SerializerMethodField()

    def get_subject_group_id(self, obj):
        from apps.academics.models.subject_group_subjects import SubjectGroupSubjects
        sgs = SubjectGroupSubjects.objects.filter(id=obj.subject_group_subject_id).first()
        return sgs.subject_group_id if sgs else None

    def get_subject_id(self, obj):
        from apps.academics.models.subject_group_subjects import SubjectGroupSubjects
        sgs = SubjectGroupSubjects.objects.filter(id=obj.subject_group_subject_id).first()
        return sgs.subject_id if sgs else None

    def get_class_section_id(self, obj):
        from apps.academics.models.subject_group_class_sections import SubjectGroupClassSections
        sgcs = SubjectGroupClassSections.objects.filter(id=obj.subject_group_class_sections_id).first()
        return sgcs.class_section_id if sgcs else None

    def get_subject_name(self, obj):
        from apps.academics.models.subject_group_subjects import SubjectGroupSubjects
        from apps.academics.models.subjects import Subjects
        sgs = SubjectGroupSubjects.objects.filter(id=obj.subject_group_subject_id).first()
        if not sgs: return None
        subject = Subjects.objects.filter(id=sgs.subject_id).first()
        return subject.name if subject else None

    def get_subject_group_name(self, obj):
        from apps.academics.models.subject_group_subjects import SubjectGroupSubjects
        from apps.academics.models.subject_groups import SubjectGroups
        sgs = SubjectGroupSubjects.objects.filter(id=obj.subject_group_subject_id).first()
        if not sgs: return None
        group = SubjectGroups.objects.filter(id=sgs.subject_group_id).first()
        return group.name if group else None

    def get_class_section_name(self, obj):
        from apps.academics.models.subject_group_class_sections import SubjectGroupClassSections
        from apps.academics.models.class_sections import ClassSections
        from apps.academics.models.classes import Classes
        from apps.academics.models.sections import Sections
        sgcs = SubjectGroupClassSections.objects.filter(id=obj.subject_group_class_sections_id).first()
        if not sgcs: return None
        cs = ClassSections.objects.filter(id=sgcs.class_section_id).first()
        if not cs: return None
        c = Classes.objects.filter(id=cs.class_id).first()
        s = Sections.objects.filter(id=cs.section_id).first()
        if c and s:
            return f"{c.class_field} - {s.section}"
        return None


class LessonCreateSerializer(serializers.Serializer):
    session_id = serializers.IntegerField(required=True)
    subject_group_id = serializers.IntegerField(required=True)
    subject_id = serializers.IntegerField(required=True)
    class_section_id = serializers.IntegerField(required=True)
    name = serializers.CharField(max_length=255, required=True)


class LessonUpdateSerializer(serializers.Serializer):
    session_id = serializers.IntegerField(required=False)
    subject_group_id = serializers.IntegerField(required=False)
    subject_id = serializers.IntegerField(required=False)
    class_section_id = serializers.IntegerField(required=False)
    name = serializers.CharField(max_length=255, required=False)


# ---------------------------------------------------------
# Topic Serializers
# ---------------------------------------------------------
class TopicSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    session_id = serializers.IntegerField()
    lesson_id = serializers.IntegerField()
    name = serializers.CharField(max_length=255)
    status = serializers.IntegerField()
    complete_date = serializers.DateField(allow_null=True)
    created_at = serializers.DateTimeField()

    subject_name = serializers.SerializerMethodField()
    subject_group_name = serializers.SerializerMethodField()
    class_section_name = serializers.SerializerMethodField()
    lesson_name = serializers.SerializerMethodField()
    subject_group_id = serializers.SerializerMethodField()
    subject_id = serializers.SerializerMethodField()
    class_section_id = serializers.SerializerMethodField()

    def _get_parent_lesson(self, obj):
        if not hasattr(self, '_lesson_cache'):
            self._lesson_cache = {}
        if obj.lesson_id not in self._lesson_cache:
            from apps.academics.models.lesson import Lesson
            self._lesson_cache[obj.lesson_id] = Lesson.objects.filter(id=obj.lesson_id).first()
        return self._lesson_cache[obj.lesson_id]

    def get_subject_name(self, obj):
        lesson = self._get_parent_lesson(obj)
        if not lesson: return None
        from apps.academics.models.subject_group_subjects import SubjectGroupSubjects
        from apps.academics.models.subjects import Subjects
        sgs = SubjectGroupSubjects.objects.filter(id=lesson.subject_group_subject_id).first()
        if not sgs: return None
        subject = Subjects.objects.filter(id=sgs.subject_id).first()
        return subject.name if subject else None

    def get_lesson_name(self, obj):
        lesson = self._get_parent_lesson(obj)
        return lesson.name if lesson else None

    def get_subject_group_name(self, obj):
        lesson = self._get_parent_lesson(obj)
        if not lesson: return None
        from apps.academics.models.subject_group_subjects import SubjectGroupSubjects
        from apps.academics.models.subject_groups import SubjectGroups
        sgs = SubjectGroupSubjects.objects.filter(id=lesson.subject_group_subject_id).first()
        if not sgs: return None
        group = SubjectGroups.objects.filter(id=sgs.subject_group_id).first()
        return group.name if group else None

    def get_class_section_name(self, obj):
        lesson = self._get_parent_lesson(obj)
        if not lesson: return None
        from apps.academics.models.subject_group_class_sections import SubjectGroupClassSections
        from apps.academics.models.class_sections import ClassSections
        from apps.academics.models.classes import Classes
        from apps.academics.models.sections import Sections
        sgcs = SubjectGroupClassSections.objects.filter(id=lesson.subject_group_class_sections_id).first()
        if not sgcs: return None
        cs = ClassSections.objects.filter(id=sgcs.class_section_id).first()
        if not cs: return None
        c = Classes.objects.filter(id=cs.class_id).first()
        s = Sections.objects.filter(id=cs.section_id).first()
        if c and s:
            return f"{c.class_field} - {s.section}"
        return None

    def get_subject_group_id(self, obj):
        lesson = self._get_parent_lesson(obj)
        if not lesson: return None
        from apps.academics.models.subject_group_subjects import SubjectGroupSubjects
        sgs = SubjectGroupSubjects.objects.filter(id=lesson.subject_group_subject_id).first()
        return sgs.subject_group_id if sgs else None

    def get_subject_id(self, obj):
        lesson = self._get_parent_lesson(obj)
        if not lesson: return None
        from apps.academics.models.subject_group_subjects import SubjectGroupSubjects
        sgs = SubjectGroupSubjects.objects.filter(id=lesson.subject_group_subject_id).first()
        return sgs.subject_id if sgs else None

    def get_class_section_id(self, obj):
        lesson = self._get_parent_lesson(obj)
        if not lesson: return None
        from apps.academics.models.subject_group_class_sections import SubjectGroupClassSections
        sgcs = SubjectGroupClassSections.objects.filter(id=lesson.subject_group_class_sections_id).first()
        return sgcs.class_section_id if sgcs else None

class TopicCreateSerializer(serializers.Serializer):
    session_id = serializers.IntegerField(required=True)
    lesson_id = serializers.IntegerField(required=True)
    name = serializers.CharField(max_length=255, required=True)
    status = serializers.IntegerField(required=False, default=0)
    complete_date = serializers.DateField(required=False, allow_null=True)


class TopicUpdateSerializer(serializers.Serializer):
    session_id = serializers.IntegerField(required=False)
    lesson_id = serializers.IntegerField(required=False)
    name = serializers.CharField(max_length=255, required=False)
    status = serializers.IntegerField(required=False)
    complete_date = serializers.DateField(required=False, allow_null=True)


# ---------------------------------------------------------
# Subject Syllabus Serializers
# ---------------------------------------------------------
class SubjectSyllabusSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    topic_id = serializers.IntegerField()
    topic_name = serializers.SerializerMethodField()
    lesson_id = serializers.SerializerMethodField()
    class_section_id = serializers.SerializerMethodField()
    subject_id = serializers.SerializerMethodField()
    subject_group_id = serializers.SerializerMethodField()
    session_id = serializers.IntegerField()
    created_by = serializers.IntegerField()
    created_for = serializers.IntegerField()
    date = serializers.DateField()
    time_from = serializers.CharField(max_length=255)
    time_to = serializers.CharField(max_length=255)
    presentation = serializers.CharField(allow_blank=True, allow_null=True)
    attachment = serializers.CharField(allow_blank=True, allow_null=True)
    lacture_youtube_url = serializers.CharField(max_length=255, allow_blank=True, allow_null=True)
    lacture_video = serializers.CharField(max_length=255, allow_blank=True, allow_null=True)
    sub_topic = serializers.CharField(allow_blank=True, allow_null=True)
    teaching_method = serializers.CharField(allow_blank=True, allow_null=True)
    general_objectives = serializers.CharField(allow_blank=True, allow_null=True)
    previous_knowledge = serializers.CharField(allow_blank=True, allow_null=True)
    comprehensive_questions = serializers.CharField(allow_blank=True, allow_null=True)
    status = serializers.IntegerField()
    created_at = serializers.DateTimeField()

    def get_topic_name(self, obj):
        from apps.academics.models.topic import Topic
        topic = Topic.objects.filter(id=obj.topic_id).first()
        return topic.name if topic else None

    def _get_parent_lesson(self, obj):
        from apps.academics.models.topic import Topic
        from apps.academics.models.lesson import Lesson
        topic = Topic.objects.filter(id=obj.topic_id).first()
        if not topic: return None
        return Lesson.objects.filter(id=topic.lesson_id).first()

    def get_lesson_id(self, obj):
        lesson = self._get_parent_lesson(obj)
        return lesson.id if lesson else None

    def get_class_section_id(self, obj):
        lesson = self._get_parent_lesson(obj)
        if not lesson: return None
        from apps.academics.models.subject_group_class_sections import SubjectGroupClassSections
        sgcs = SubjectGroupClassSections.objects.filter(id=lesson.subject_group_class_sections_id).first()
        return sgcs.class_section_id if sgcs else None

    def get_subject_id(self, obj):
        lesson = self._get_parent_lesson(obj)
        if not lesson: return None
        from apps.academics.models.subject_group_subjects import SubjectGroupSubjects
        sgs = SubjectGroupSubjects.objects.filter(id=lesson.subject_group_subject_id).first()
        return sgs.subject_id if sgs else None

    def get_subject_group_id(self, obj):
        lesson = self._get_parent_lesson(obj)
        if not lesson: return None
        from apps.academics.models.subject_group_subjects import SubjectGroupSubjects
        sgs = SubjectGroupSubjects.objects.filter(id=lesson.subject_group_subject_id).first()
        return sgs.subject_group_id if sgs else None


class SubjectSyllabusCreateSerializer(serializers.Serializer):
    topic_id = serializers.IntegerField(required=True)
    session_id = serializers.IntegerField(required=True)
    created_by = serializers.IntegerField(required=True)
    created_for = serializers.IntegerField(required=True)
    date = serializers.DateField(required=True)
    time_from = serializers.CharField(max_length=255, required=False, allow_blank=True)
    time_to = serializers.CharField(max_length=255, required=False, allow_blank=True)
    presentation = serializers.CharField(required=False, allow_blank=True)
    attachment = serializers.CharField(required=False, allow_blank=True)
    lacture_youtube_url = serializers.CharField(max_length=255, required=False, allow_blank=True)
    lacture_video = serializers.CharField(max_length=255, required=False, allow_blank=True)
    sub_topic = serializers.CharField(required=False, allow_blank=True)
    teaching_method = serializers.CharField(required=False, allow_blank=True)
    general_objectives = serializers.CharField(required=False, allow_blank=True)
    previous_knowledge = serializers.CharField(required=False, allow_blank=True)
    comprehensive_questions = serializers.CharField(required=False, allow_blank=True)
    status = serializers.IntegerField(required=False, default=0)


class SubjectSyllabusUpdateSerializer(serializers.Serializer):
    topic_id = serializers.IntegerField(required=False)
    session_id = serializers.IntegerField(required=False)
    created_by = serializers.IntegerField(required=False)
    created_for = serializers.IntegerField(required=False)
    date = serializers.DateField(required=False)
    time_from = serializers.CharField(max_length=255, required=False, allow_blank=True)
    time_to = serializers.CharField(max_length=255, required=False, allow_blank=True)
    presentation = serializers.CharField(required=False, allow_blank=True)
    attachment = serializers.CharField(required=False, allow_blank=True)
    lacture_youtube_url = serializers.CharField(max_length=255, required=False, allow_blank=True)
    lacture_video = serializers.CharField(max_length=255, required=False, allow_blank=True)
    sub_topic = serializers.CharField(required=False, allow_blank=True)
    teaching_method = serializers.CharField(required=False, allow_blank=True)
    general_objectives = serializers.CharField(required=False, allow_blank=True)
    previous_knowledge = serializers.CharField(required=False, allow_blank=True)
    comprehensive_questions = serializers.CharField(required=False, allow_blank=True)
    status = serializers.IntegerField(required=False)


# ---------------------------------------------------------
# Lesson Plan Forum Serializers
# ---------------------------------------------------------
class LessonPlanForumSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    subject_syllabus_id = serializers.IntegerField()
    type = serializers.CharField(max_length=20)
    staff_id = serializers.IntegerField(allow_null=True)
    student_id = serializers.IntegerField(allow_null=True)
    message = serializers.CharField()
    created_date = serializers.DateTimeField(allow_null=True)


class LessonPlanForumCreateSerializer(serializers.Serializer):
    type = serializers.CharField(max_length=20, required=True)
    staff_id = serializers.IntegerField(required=False, allow_null=True)
    student_id = serializers.IntegerField(required=False, allow_null=True)
    message = serializers.CharField(required=True)
