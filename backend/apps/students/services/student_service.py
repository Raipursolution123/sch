import logging
from typing import Any

from django.db import transaction

from apps.accounts.models import User
from apps.accounts.services.legacy_password import hash_legacy_password
from apps.academics.models import Classes, Sections
from apps.students.domain.student_exceptions import (
    StudentConflictError,
    StudentNotFoundError,
    StudentValidationError,
)
from apps.students.models.student_session import StudentSession
from apps.students.models.students import Students
from apps.students.selectors import student_selectors as selectors

logger = logging.getLogger(__name__)

ADMISSION_FIELDS = frozenset(
    {
        "admission_no",
        "admission_date",
        "roll_no",
        "firstname",
        "middlename",
        "lastname",
        "gender",
        "mobileno",
        "email",
        "state",
        "city",
        "pincode",
        "religion",
        "cast",
        "dob",
        "is_active",
        "father_name",
        "father_phone",
        "father_occupation",
        "mother_name",
        "mother_phone",
        "mother_occupation",
        "guardian_name",
        "guardian_relation",
        "guardian_phone",
        "guardian_occupation",
        "guardian_address",
        "guardian_email",
        "guardian_is",
        "current_address",
        "permanent_address",
        "blood_group",
        "school_house_id",
        "hostel_room_id",
        "room_bed_id",
        "adhar_no",
        "samagra_id",
        "bank_account_no",
        "bank_name",
        "ifsc_code",
        "previous_school",
        "height",
        "weight",
        "measurement_date",
        "note",
        "rte",
        "category_id",
        "class_id",
        "section_id",
    }
)


class StudentService:
    def list_students(self, *, status: str = "active"):
        return selectors.list_students_qs(status=status)

    def get_student(self, student_id: int) -> dict[str, Any]:
        student = selectors.get_student_by_id(student_id)
        if student is None:
            raise StudentNotFoundError()

        active_session = selectors.get_active_session()
        class_id = section_id = None
        class_name = section_name = None
        if active_session:
            enrollment = selectors.get_enrollment_for_session(
                student.id, active_session.id
            )
            if enrollment:
                class_id = enrollment.class_id
                section_id = enrollment.section_id
                class_name, section_name = selectors.resolve_class_section_names(
                    class_id, section_id
                )

        return selectors.student_detail(
            student,
            class_id=class_id,
            section_id=section_id,
            class_name=class_name,
            section_name=section_name,
        )

    def admit_student(self, payload: dict[str, Any]) -> dict[str, Any]:
        admission_no = str(payload.get("admission_no", "")).strip()
        if not admission_no:
            raise StudentValidationError("Admission number is required.")
        if Students.objects.filter(admission_no__iexact=admission_no).exists():
            raise StudentConflictError(
                "A student with this admission number already exists."
            )

        active_session = selectors.get_active_session()
        if active_session is None:
            raise StudentValidationError("No active academic session found.")

        class_id = payload.get("class_id")
        section_id = payload.get("section_id")
        school_class, section = self._resolve_class_section(class_id, section_id)
        self._assert_class_section_assigned(school_class.id, section.id)

        with transaction.atomic():
            student = self._create_student_record(payload, admission_no)
            parent_user = self._ensure_portal_users(student)
            student.parent_id = parent_user.id
            student.save(update_fields=["parent_id"])

            StudentSession.objects.create(
                session_id=active_session.id,
                student_id=student.id,
                class_id=school_class.id,
                section_id=section.id,
                is_alumni=0,
                created_at=selectors.now_datetime(),
            )

        logger.info(
            "Student admitted id=%s admission_no=%s class=%s section=%s",
            student.id,
            admission_no,
            school_class.id,
            section.id,
        )
        return selectors.student_detail(
            student,
            class_id=school_class.id,
            section_id=section.id,
            class_name=school_class.class_field,
            section_name=section.section,
        )

    def update_student(
        self, student_id: int, payload: dict[str, Any]
    ) -> dict[str, Any]:
        student = selectors.get_student_by_id(student_id)
        if student is None:
            raise StudentNotFoundError()

        if "admission_no" in payload:
            admission_no = str(payload.get("admission_no", "")).strip()
            if (
                admission_no
                and Students.objects.exclude(id=student_id)
                .filter(admission_no__iexact=admission_no)
                .exists()
            ):
                raise StudentConflictError(
                    "A student with this admission number already exists."
                )

        active_session = selectors.get_active_session()
        if active_session is None:
            raise StudentValidationError("No active academic session found.")

        class_id = payload.get("class_id") if "class_id" in payload else None
        section_id = payload.get("section_id") if "section_id" in payload else None
        school_class = section = None
        if class_id is not None or section_id is not None:
            school_class, section = self._resolve_class_section(class_id, section_id)
            self._assert_class_section_assigned(school_class.id, section.id)

        with transaction.atomic():
            self._apply_student_fields(student, payload)
            if not student.parent_id and (
                student.father_name or student.mother_name or student.guardian_name
            ):
                parent_user = self._create_parent_user(student)
                student.parent_id = parent_user.id

            student.updated_at = selectors.today_date()
            student.save()

            enrollment = selectors.get_enrollment_for_session(
                student.id, active_session.id
            )
            if enrollment:
                if school_class is not None:
                    enrollment.class_id = school_class.id
                if section is not None:
                    enrollment.section_id = section.id
                enrollment.save()
            elif school_class is not None and section is not None:
                enrollment = StudentSession.objects.create(
                    session_id=active_session.id,
                    student_id=student.id,
                    class_id=school_class.id,
                    section_id=section.id,
                    is_alumni=0,
                    created_at=selectors.now_datetime(),
                )

            resolved_class_id = (
                school_class.id
                if school_class
                else (enrollment.class_id if enrollment else None)
            )
            resolved_section_id = (
                section.id
                if section
                else (enrollment.section_id if enrollment else None)
            )
            class_name, section_name = selectors.resolve_class_section_names(
                resolved_class_id, resolved_section_id
            )

        return selectors.student_detail(
            student,
            class_id=resolved_class_id,
            section_id=resolved_section_id,
            class_name=class_name,
            section_name=section_name,
        )

    def disable_student(self, student_id: int, payload: dict[str, Any]) -> None:
        student = selectors.get_student_by_id(student_id)
        if student is None:
            raise StudentNotFoundError()

        if student.is_active != "yes":
            raise StudentValidationError("Student is already disabled.")

        reason_id = payload.get("disable_reason_id")
        if not reason_id:
            raise StudentValidationError("Disable reason is required.")

        reason = selectors.get_disable_reason_by_id(int(reason_id))
        if reason is None:
            raise StudentValidationError("Selected disable reason is not valid.")

        dis_note = str(payload.get("dis_note", "")).strip()

        with transaction.atomic():
            student.is_active = "no"
            student.dis_reason = reason.id
            student.dis_note = dis_note
            student.disable_at = selectors.today_date()
            student.updated_at = selectors.today_date()
            student.save(
                update_fields=[
                    "is_active",
                    "dis_reason",
                    "dis_note",
                    "disable_at",
                    "updated_at",
                ]
            )

            User.objects.filter(
                user_id=student.id, role__in=["student", "parent"]
            ).update(is_active="no")

        logger.info(
            "Student disabled id=%s reason_id=%s", student_id, reason.id
        )

    def list_disable_reasons(self) -> list[dict[str, Any]]:
        return selectors.list_disable_reasons()

    @staticmethod
    def enrich_list_page(students) -> list[dict[str, Any]]:
        student_ids = [s.id for s in students]
        active_session = selectors.get_active_session()
        session_map: dict[int, StudentSession] = {}
        if active_session and student_ids:
            session_map = selectors.enrollments_for_students(
                active_session.id, student_ids
            )

        class_ids = [ss.class_id for ss in session_map.values() if ss.class_id]
        section_ids = [ss.section_id for ss in session_map.values() if ss.section_id]
        classes_dict = selectors.class_labels(class_ids)
        sections_dict = selectors.section_labels(section_ids)

        rows: list[dict[str, Any]] = []
        for student in students:
            enrollment = session_map.get(student.id)
            class_id = enrollment.class_id if enrollment else None
            section_id = enrollment.section_id if enrollment else None
            rows.append(
                selectors.student_list_item(
                    student,
                    class_id=class_id,
                    section_id=section_id,
                    class_name=classes_dict.get(class_id) if class_id else None,
                    section_name=sections_dict.get(section_id) if section_id else None,
                )
            )
        return rows

    def _resolve_class_section(self, class_id, section_id):
        if not class_id or not section_id:
            raise StudentValidationError("Class and section are required.")

        school_class = Classes.objects.filter(id=class_id, is_active="yes").first()
        if school_class is None:
            raise StudentValidationError("Selected class is not available.")

        section = Sections.objects.filter(id=section_id, is_active="yes").first()
        if section is None:
            raise StudentValidationError("Selected section is not available.")

        return school_class, section

    @staticmethod
    def _assert_class_section_assigned(class_id: int, section_id: int) -> None:
        if not selectors.class_section_mapping_active(class_id, section_id):
            raise StudentValidationError(
                "Selected section is not assigned to the chosen class."
            )

    def _create_student_record(
        self, payload: dict[str, Any], admission_no: str
    ) -> Students:
        permanent_address = payload.get("permanent_address")
        if permanent_address is None and payload.get("current_address"):
            permanent_address = str(payload.get("current_address", "")).strip() or None

        return Students.objects.create(
            parent_id=0,
            admission_no=admission_no,
            roll_no=payload.get("roll_no") if payload.get("roll_no") else None,
            admission_date=payload.get("admission_date") or None,
            firstname=str(payload.get("firstname", "")).strip(),
            middlename=(
                str(payload.get("middlename", "")).strip()
                if payload.get("middlename")
                else None
            ),
            lastname=str(payload.get("lastname", "")).strip(),
            gender=(
                str(payload.get("gender", "")).strip()
                if payload.get("gender")
                else None
            ),
            mobileno=(
                str(payload.get("mobileno", "")).strip()
                if payload.get("mobileno")
                else None
            ),
            email=(
                str(payload.get("email", "")).strip() if payload.get("email") else None
            ),
            state=(
                str(payload.get("state", "")).strip() if payload.get("state") else None
            ),
            city=str(payload.get("city", "")).strip() if payload.get("city") else None,
            pincode=(
                str(payload.get("pincode", "")).strip()
                if payload.get("pincode")
                else None
            ),
            religion=(
                str(payload.get("religion", "")).strip()
                if payload.get("religion")
                else None
            ),
            cast=str(payload.get("cast", "")).strip() if payload.get("cast") else None,
            dob=payload.get("dob") or None,
            is_active=payload.get("is_active", "yes"),
            category_id=(
                str(payload.get("category_id", "")).strip()
                if payload.get("category_id")
                else None
            ),
            father_name=(
                str(payload.get("father_name", "")).strip()
                if payload.get("father_name")
                else None
            ),
            father_phone=(
                str(payload.get("father_phone", "")).strip()
                if payload.get("father_phone")
                else None
            ),
            father_occupation=(
                str(payload.get("father_occupation", "")).strip()
                if payload.get("father_occupation")
                else None
            ),
            mother_name=(
                str(payload.get("mother_name", "")).strip()
                if payload.get("mother_name")
                else None
            ),
            mother_phone=(
                str(payload.get("mother_phone", "")).strip()
                if payload.get("mother_phone")
                else None
            ),
            mother_occupation=(
                str(payload.get("mother_occupation", "")).strip()
                if payload.get("mother_occupation")
                else None
            ),
            guardian_name=(
                str(payload.get("guardian_name", "")).strip()
                if payload.get("guardian_name")
                else None
            ),
            guardian_relation=(
                str(payload.get("guardian_relation", "")).strip()
                if payload.get("guardian_relation")
                else None
            ),
            guardian_phone=(
                str(payload.get("guardian_phone", "")).strip()
                if payload.get("guardian_phone")
                else None
            ),
            guardian_occupation=(
                str(payload.get("guardian_occupation", "")).strip()
                if payload.get("guardian_occupation")
                else ""
            ),
            guardian_address=(
                str(payload.get("guardian_address", "")).strip()
                if payload.get("guardian_address")
                else None
            ),
            guardian_email=(
                str(payload.get("guardian_email", "")).strip()
                if payload.get("guardian_email")
                else None
            ),
            guardian_is=str(payload.get("guardian_is", "father")).strip(),
            current_address=(
                str(payload.get("current_address", "")).strip()
                if payload.get("current_address")
                else None
            ),
            permanent_address=permanent_address,
            blood_group=(
                str(payload.get("blood_group", "")).strip()
                if payload.get("blood_group")
                else ""
            ),
            school_house_id=(
                int(payload.get("school_house_id"))
                if payload.get("school_house_id")
                else None
            ),
            hostel_room_id=(
                int(payload.get("hostel_room_id"))
                if payload.get("hostel_room_id")
                else 0
            ),
            room_bed_id=(
                int(payload.get("room_bed_id")) if payload.get("room_bed_id") else 0
            ),
            adhar_no=(
                str(payload.get("adhar_no", "")).strip()
                if payload.get("adhar_no")
                else None
            ),
            samagra_id=(
                str(payload.get("samagra_id", "")).strip()
                if payload.get("samagra_id")
                else None
            ),
            bank_account_no=(
                str(payload.get("bank_account_no", "")).strip()
                if payload.get("bank_account_no")
                else None
            ),
            bank_name=(
                str(payload.get("bank_name", "")).strip()
                if payload.get("bank_name")
                else None
            ),
            ifsc_code=(
                str(payload.get("ifsc_code", "")).strip()
                if payload.get("ifsc_code")
                else None
            ),
            previous_school=(
                str(payload.get("previous_school", "")).strip()
                if payload.get("previous_school")
                else None
            ),
            height=(
                str(payload.get("height", "")).strip() if payload.get("height") else ""
            ),
            weight=(
                str(payload.get("weight", "")).strip() if payload.get("weight") else ""
            ),
            measurement_date=payload.get("measurement_date") or None,
            note=str(payload.get("note", "")).strip() if payload.get("note") else None,
            rte=payload.get("rte", "No"),
            created_at=selectors.now_datetime(),
            dis_reason=0,
            dis_note="",
            father_pic="",
            mother_pic="",
            guardian_pic="",
        )

    def _apply_student_fields(self, student: Students, payload: dict[str, Any]) -> None:
        if "admission_no" in payload:
            student.admission_no = str(payload.get("admission_no", "")).strip()
        if "roll_no" in payload:
            student.roll_no = payload.get("roll_no")
        if "admission_date" in payload:
            student.admission_date = payload.get("admission_date") or None
        if "firstname" in payload:
            student.firstname = str(payload.get("firstname", "")).strip()
        if "middlename" in payload:
            student.middlename = (
                str(payload.get("middlename", "")).strip()
                if payload.get("middlename")
                else None
            )
        if "lastname" in payload:
            student.lastname = str(payload.get("lastname", "")).strip()
        if "gender" in payload:
            student.gender = payload.get("gender")
        if "mobileno" in payload:
            student.mobileno = (
                str(payload.get("mobileno", "")).strip()
                if payload.get("mobileno")
                else None
            )
        if "email" in payload:
            student.email = (
                str(payload.get("email", "")).strip() if payload.get("email") else None
            )
        if "state" in payload:
            student.state = (
                str(payload.get("state", "")).strip() if payload.get("state") else None
            )
        if "city" in payload:
            student.city = (
                str(payload.get("city", "")).strip() if payload.get("city") else None
            )
        if "pincode" in payload:
            student.pincode = (
                str(payload.get("pincode", "")).strip()
                if payload.get("pincode")
                else None
            )
        if "religion" in payload:
            student.religion = (
                str(payload.get("religion", "")).strip()
                if payload.get("religion")
                else None
            )
        if "cast" in payload:
            student.cast = (
                str(payload.get("cast", "")).strip() if payload.get("cast") else None
            )
        if "dob" in payload:
            student.dob = payload.get("dob") or None
        if "is_active" in payload:
            student.is_active = payload.get("is_active")
        if "category_id" in payload:
            student.category_id = (
                str(payload.get("category_id", "")).strip()
                if payload.get("category_id")
                else None
            )
        if "father_name" in payload:
            student.father_name = (
                str(payload.get("father_name", "")).strip()
                if payload.get("father_name")
                else None
            )
        if "father_phone" in payload:
            student.father_phone = (
                str(payload.get("father_phone", "")).strip()
                if payload.get("father_phone")
                else None
            )
        if "father_occupation" in payload:
            student.father_occupation = (
                str(payload.get("father_occupation", "")).strip()
                if payload.get("father_occupation")
                else None
            )
        if "mother_name" in payload:
            student.mother_name = (
                str(payload.get("mother_name", "")).strip()
                if payload.get("mother_name")
                else None
            )
        if "mother_phone" in payload:
            student.mother_phone = (
                str(payload.get("mother_phone", "")).strip()
                if payload.get("mother_phone")
                else None
            )
        if "mother_occupation" in payload:
            student.mother_occupation = (
                str(payload.get("mother_occupation", "")).strip()
                if payload.get("mother_occupation")
                else None
            )
        if "guardian_name" in payload:
            student.guardian_name = (
                str(payload.get("guardian_name", "")).strip()
                if payload.get("guardian_name")
                else None
            )
        if "guardian_relation" in payload:
            student.guardian_relation = (
                str(payload.get("guardian_relation", "")).strip()
                if payload.get("guardian_relation")
                else None
            )
        if "guardian_phone" in payload:
            student.guardian_phone = (
                str(payload.get("guardian_phone", "")).strip()
                if payload.get("guardian_phone")
                else None
            )
        if "guardian_occupation" in payload:
            student.guardian_occupation = (
                str(payload.get("guardian_occupation", "")).strip()
                if payload.get("guardian_occupation")
                else ""
            )
        if "guardian_address" in payload:
            student.guardian_address = (
                str(payload.get("guardian_address", "")).strip()
                if payload.get("guardian_address")
                else None
            )
        if "guardian_email" in payload:
            student.guardian_email = (
                str(payload.get("guardian_email", "")).strip()
                if payload.get("guardian_email")
                else None
            )
        if "guardian_is" in payload:
            student.guardian_is = (
                str(payload.get("guardian_is", "")).strip() or "father"
            )
        if "current_address" in payload:
            student.current_address = (
                str(payload.get("current_address", "")).strip()
                if payload.get("current_address")
                else None
            )
        if "permanent_address" in payload:
            student.permanent_address = (
                str(payload.get("permanent_address", "")).strip()
                if payload.get("permanent_address")
                else None
            )
        elif "current_address" in payload:
            student.permanent_address = (
                str(payload.get("current_address", "")).strip()
                if payload.get("current_address")
                else None
            )
        if "blood_group" in payload:
            student.blood_group = (
                str(payload.get("blood_group", "")).strip()
                if payload.get("blood_group")
                else ""
            )
        if "school_house_id" in payload:
            student.school_house_id = (
                int(payload.get("school_house_id"))
                if payload.get("school_house_id")
                else None
            )
        if "hostel_room_id" in payload:
            student.hostel_room_id = (
                int(payload.get("hostel_room_id"))
                if payload.get("hostel_room_id")
                else 0
            )
        if "room_bed_id" in payload:
            student.room_bed_id = (
                int(payload.get("room_bed_id")) if payload.get("room_bed_id") else 0
            )
        if "adhar_no" in payload:
            student.adhar_no = (
                str(payload.get("adhar_no", "")).strip()
                if payload.get("adhar_no")
                else None
            )
        if "samagra_id" in payload:
            student.samagra_id = (
                str(payload.get("samagra_id", "")).strip()
                if payload.get("samagra_id")
                else None
            )
        if "bank_account_no" in payload:
            student.bank_account_no = (
                str(payload.get("bank_account_no", "")).strip()
                if payload.get("bank_account_no")
                else None
            )
        if "bank_name" in payload:
            student.bank_name = (
                str(payload.get("bank_name", "")).strip()
                if payload.get("bank_name")
                else None
            )
        if "ifsc_code" in payload:
            student.ifsc_code = (
                str(payload.get("ifsc_code", "")).strip()
                if payload.get("ifsc_code")
                else None
            )
        if "previous_school" in payload:
            student.previous_school = (
                str(payload.get("previous_school", "")).strip()
                if payload.get("previous_school")
                else None
            )
        if "height" in payload:
            student.height = (
                str(payload.get("height", "")).strip() if payload.get("height") else ""
            )
        if "weight" in payload:
            student.weight = (
                str(payload.get("weight", "")).strip() if payload.get("weight") else ""
            )
        if "measurement_date" in payload:
            student.measurement_date = payload.get("measurement_date") or None
        if "note" in payload:
            student.note = (
                str(payload.get("note", "")).strip() if payload.get("note") else None
            )
        if "rte" in payload:
            student.rte = payload.get("rte")

    def _ensure_portal_users(self, student: Students) -> User:
        password = hash_legacy_password(
            student.mobileno if student.mobileno else "123456"
        )
        now = selectors.now_datetime()

        User.objects.create(
            user_id=student.id,
            username=f"std{student.id}",
            password=password,
            childs="",
            role="student",
            lang_id=4,
            currency_id=1,
            is_active="yes",
            created_at=now,
            verification_code="",
        )
        return self._create_parent_user(student, password=password, created_at=now)

    @staticmethod
    def _create_parent_user(
        student: Students,
        *,
        password: str | None = None,
        created_at=None,
    ) -> User:
        return User.objects.create(
            user_id=student.id,
            username=f"parent{student.id}",
            password=password
            or hash_legacy_password(student.mobileno if student.mobileno else "123456"),
            childs=str(student.id),
            role="parent",
            lang_id=4,
            currency_id=1,
            is_active="yes",
            created_at=created_at or selectors.now_datetime(),
            verification_code="",
        )
