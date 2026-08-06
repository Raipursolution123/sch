from datetime import datetime
from typing import Any, Dict, List
from django.db import transaction
from django.utils import timezone

from apps.students.models.student_behaviour import StudentBehaviour
from apps.students.models.student_incidents import StudentIncidents
from apps.students.models.student_incident_comments import StudentIncidentComments
from apps.settings.models.behaviour_settings import BehaviourSettings
from apps.students.models.students import Students
from apps.students.models.student_session import StudentSession
from apps.academics.models import Classes, Sections, Sessions
from apps.staff.models import Staff
from common.exceptions.legacy_errors import legacy_domain_error_response


class StudentBehaviourService:
    @transaction.atomic
    def list_incidents(self) -> List[StudentBehaviour]:
        return list(StudentBehaviour.objects.all().order_by("-id"))

    @transaction.atomic
    def get_incident(self, id: int) -> StudentBehaviour:
        try:
            return StudentBehaviour.objects.get(id=id)
        except StudentBehaviour.DoesNotExist:
            raise ValueError("Incident not found.")

    @transaction.atomic
    def create_incident(self, payload: Dict[str, Any]) -> StudentBehaviour:
        incident = StudentBehaviour(
            title=payload["title"],
            point=payload["point"],
            description=payload.get("description", ""),
            created_at=timezone.now(),
        )
        incident.save()
        return incident

    @transaction.atomic
    def update_incident(self, id: int, payload: Dict[str, Any]) -> StudentBehaviour:
        incident = self.get_incident(id)
        if "title" in payload:
            incident.title = payload["title"]
        if "point" in payload:
            incident.point = payload["point"]
        if "description" in payload:
            incident.description = payload["description"]
        incident.save()
        return incident

    @transaction.atomic
    def delete_incident(self, id: int) -> None:
        incident = self.get_incident(id)
        # Delete related student incident records Cascade-style
        StudentIncidents.objects.filter(incident_id=id).delete()
        incident.delete()

    @transaction.atomic
    def list_assigned_incidents(self, class_id: int = None, section_id: int = None, session_id: int = None) -> List[Dict[str, Any]]:
        # Query assigned incidents and resolve student/class/section/incident details
        qs = StudentIncidents.objects.all()
        if session_id:
            qs = qs.filter(session_id=session_id)
            
        incident_ids = [r.incident_id for r in qs]
        student_ids = [r.student_id for r in qs]

        incidents_map = {i.id: i for i in StudentBehaviour.objects.filter(id__in=incident_ids)}
        
        # Filter by class and section if provided
        student_sessions = StudentSession.objects.filter(student_id__in=student_ids)
        if session_id:
            student_sessions = student_sessions.filter(session_id=session_id)
        if class_id:
            student_sessions = student_sessions.filter(class_id=class_id)
        if section_id:
            student_sessions = student_sessions.filter(section_id=section_id)
            
        allowed_student_ids = set(ss.student_id for ss in student_sessions)
        ss_map = {ss.student_id: ss for ss in student_sessions}

        # Fetch student objects
        students_map = {s.id: s for s in Students.objects.filter(id__in=allowed_student_ids)}
        
        # Classes & Sections names
        class_ids = [ss.class_id for ss in student_sessions]
        section_ids = [ss.section_id for ss in student_sessions]
        classes_map = {c.id: c.class_field for c in Classes.objects.filter(id__in=class_ids)}
        sections_map = {s.id: s.section for s in Sections.objects.filter(id__in=section_ids)}

        # Staff map (assign_by)
        staff_ids = [r.assign_by for r in qs]
        staff_map = {s.id: f"{s.name} {s.surname}".strip() for s in Staff.objects.filter(id__in=staff_ids)}

        results = []
        for row in qs.order_by("-id"):
            if row.student_id not in allowed_student_ids:
                continue
            
            student = students_map.get(row.student_id)
            if not student:
                continue
                
            ss = ss_map.get(row.student_id)
            incident = incidents_map.get(row.incident_id)
            if not incident:
                continue

            results.append({
                "id": row.id,
                "session_id": row.session_id,
                "student_id": row.student_id,
                "student_name": f"{student.firstname} {student.lastname}".strip(),
                "admission_no": student.admission_no,
                "class_name": classes_map.get(ss.class_id, ""),
                "section_name": sections_map.get(ss.section_id, ""),
                "incident_id": row.incident_id,
                "incident_title": incident.title,
                "incident_description": incident.description,
                "incident_point": incident.point,
                "assign_by_name": staff_map.get(row.assign_by, "Staff"),
                "created_at": row.created_at,
            })
            
        return results

    @transaction.atomic
    def assign_incident(self, payload: Dict[str, Any], assign_by_id: int, session_id: int) -> StudentIncidents:
        # Check if student exists
        try:
            student = Students.objects.get(id=payload["student_id"])
        except Students.DoesNotExist:
            raise ValueError("Student not found.")

        # Check if incident exists
        try:
            incident = StudentBehaviour.objects.get(id=payload["incident_id"])
        except StudentBehaviour.DoesNotExist:
            raise ValueError("Incident not found.")

        record = StudentIncidents(
            session_id=session_id,
            student_id=student.id,
            incident_id=incident.id,
            assign_by=assign_by_id,
            created_at=timezone.now(),
        )
        record.save()
        return record

    @transaction.atomic
    def list_incident_comments(self, student_incident_id: int) -> List[Dict[str, Any]]:
        comments = StudentIncidentComments.objects.filter(student_incident_id=student_incident_id).order_by("id")
        
        staff_ids = [c.staff_id for c in comments if c.staff_id]
        student_ids = [c.student_id for c in comments if c.student_id]
        
        staff_map = {s.id: f"{s.name} {s.surname}".strip() for s in Staff.objects.filter(id__in=staff_ids)}
        students_map = {s.id: f"{s.firstname} {s.lastname}".strip() for s in Students.objects.filter(id__in=student_ids)}
        
        results = []
        for c in comments:
            results.append({
                "id": c.id,
                "student_incident_id": c.student_incident_id,
                "comment": c.comment,
                "type": c.type,
                "staff_id": c.staff_id,
                "student_id": c.student_id,
                "staff_name": staff_map.get(c.staff_id, "") if c.staff_id else "",
                "student_name": students_map.get(c.student_id, "") if c.student_id else "",
                "created_date": c.created_date,
            })
        return results

    @transaction.atomic
    def add_comment(self, payload: Dict[str, Any], staff_id: int = None, student_id: int = None) -> StudentIncidentComments:
        comment = StudentIncidentComments(
            student_incident_id=payload["student_incident_id"],
            comment=payload["comment"],
            type=payload["type"],
            staff_id=staff_id or 0,
            student_id=student_id or 0,
            created_date=timezone.now(),
        )
        comment.save()
        return comment

    @transaction.atomic
    def delete_comment(self, comment_id: int) -> None:
        try:
            c = StudentIncidentComments.objects.get(id=comment_id)
            c.delete()
        except StudentIncidentComments.DoesNotExist:
            raise ValueError("Comment not found.")

    @transaction.atomic
    def get_setting(self) -> BehaviourSettings:
        setting = BehaviourSettings.objects.all().first()
        if not setting:
            # Create a default settings row if it does not exist
            setting = BehaviourSettings(comment_option="[]", created_at=timezone.now())
            setting.save()
        return setting

    @transaction.atomic
    def update_setting(self, payload: Dict[str, Any]) -> BehaviourSettings:
        setting = self.get_setting()
        setting.comment_option = payload["comment_option"]
        setting.save()
        return setting
