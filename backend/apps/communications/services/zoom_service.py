from datetime import datetime
from django.db import connection, transaction
from django.utils import timezone
from apps.communications.models.zoom_settings import ZoomSettings
from apps.communications.models.conferences import Conferences
from apps.communications.models.conferences_history import ConferencesHistory
from apps.communications.models.conference_sections import ConferenceSections
from apps.staff.models.conference_staff import ConferenceStaff


class ZoomService:
    def get_settings(self):
        settings = ZoomSettings.objects.first()
        if not settings:
            settings = ZoomSettings.objects.create(
                id=1,
                zoom_api_key="",
                zoom_api_secret="",
                use_teacher_api=1,
                use_zoom_app=1,
                use_zoom_app_user=1,
                created_at=timezone.now()
            )
        return settings

    def save_settings(self, data):
        settings = self.get_settings()
        settings.zoom_api_key = data.get("zoom_api_key", settings.zoom_api_key)
        settings.zoom_api_secret = data.get("zoom_api_secret", settings.zoom_api_secret)
        settings.use_teacher_api = int(data.get("use_teacher_api", settings.use_teacher_api))
        settings.use_zoom_app = int(data.get("use_zoom_app", settings.use_zoom_app))
        settings.use_zoom_app_user = int(data.get("use_zoom_app_user", settings.use_zoom_app_user))
        settings.created_at = timezone.now()
        settings.save()
        return settings

    def list_classes(self, staff_id=None, session_id=None):
        query = """
            SELECT 
                c.*,
                fc.name as create_for_name, fc.surname as create_for_surname, fc.employee_id as for_create_employee_id,
                cb.name as create_by_name, cb.surname as create_by_surname, cb.employee_id as create_by_employee_id,
                rfc.name as create_for_role_name, rcb.name as create_by_role_name
            FROM conferences c
            LEFT JOIN staff fc ON fc.id = c.staff_id
            LEFT JOIN staff cb ON cb.id = c.created_id
            LEFT JOIN staff_roles sfc ON sfc.staff_id = fc.id
            LEFT JOIN roles rfc ON rfc.id = sfc.role_id
            LEFT JOIN staff_roles scb ON scb.staff_id = cb.id
            LEFT JOIN roles rcb ON rcb.id = scb.role_id
            WHERE c.purpose = 'class'
        """
        params = []
        if session_id:
            query += " AND c.session_id = %s"
            params.append(session_id)
        if staff_id:
            query += " AND c.staff_id = %s"
            params.append(staff_id)
            
        query += " ORDER BY DATE(c.date) DESC, c.date DESC"
        
        classes = Conferences.objects.raw(query, params)
        classes_list = list(classes)
        
        for c in classes_list:
            sections_query = """
                SELECT cs.id, cl.class as class_name, s.section as section_name, cs.cls_section_id
                FROM conference_sections cs
                JOIN class_sections cls ON cls.id = cs.cls_section_id
                JOIN classes cl ON cl.id = cls.class_id
                JOIN sections s ON s.id = cls.section_id
                WHERE cs.conference_id = %s
            """
            with connection.cursor() as cursor:
                cursor.execute(sections_query, [c.id])
                columns = [col[0] for col in cursor.description]
                c.sections_list = [dict(zip(columns, row)) for row in cursor.fetchall()]
                
        return classes_list

    def create_class(self, data, class_sections, created_by_staff_id, session_id):
        with transaction.atomic():
            conf = Conferences.objects.create(
                purpose="class",
                staff_id=data.get("staff_id"),
                created_id=created_by_staff_id,
                title=data.get("title"),
                date=data.get("date"),
                duration=data.get("duration"),
                password=data.get("password", ""),
                subject=data.get("subject", ""),
                session_id=session_id,
                host_video=int(data.get("host_video", 1)),
                client_video=int(data.get("client_video", 1)),
                description=data.get("description", ""),
                timezone=data.get("timezone", "UTC"),
                return_response=data.get("return_response", ""),
                api_type=data.get("api_type", "manual"),
                status=0,
                created_at=timezone.now()
            )
            for cs_id in class_sections:
                ConferenceSections.objects.create(
                    conference_id=conf.id,
                    cls_section_id=cs_id,
                    created_at=timezone.now()
                )
            return conf

    def delete_class(self, id):
        with transaction.atomic():
            ConferenceSections.objects.filter(conference_id=id).delete()
            Conferences.objects.filter(id=id).delete()

    def list_meetings(self, staff_id=None, session_id=None):
        query = """
            SELECT 
                c.*,
                fc.name as create_for_name, fc.surname as create_for_surname,
                cb.name as create_by_name, cb.surname as create_by_surname, cb.employee_id as create_by_employee_id,
                rcb.name as create_by_role_name
            FROM conferences c
            LEFT JOIN staff fc ON fc.id = c.staff_id
            LEFT JOIN staff cb ON cb.id = c.created_id
            LEFT JOIN staff_roles scb ON scb.staff_id = cb.id
            LEFT JOIN roles rcb ON rcb.id = scb.role_id
            WHERE c.purpose = 'meeting'
        """
        params = []
        if session_id:
            query += " AND c.session_id = %s"
            params.append(session_id)
        if staff_id:
            query += """ AND (c.created_id = %s OR c.id IN (SELECT conference_id FROM conference_staff WHERE staff_id = %s))"""
            params.extend([staff_id, staff_id])
            
        query += " ORDER BY DATE(c.date) DESC, c.date DESC"
        
        meetings = Conferences.objects.raw(query, params)
        meetings_list = list(meetings)
        
        for m in meetings_list:
            staff_query = """
                SELECT cs.id, s.name, s.surname, s.employee_id, r.name as role_name
                FROM conference_staff cs
                JOIN staff s ON s.id = cs.staff_id
                JOIN staff_roles sr ON sr.staff_id = s.id
                JOIN roles r ON r.id = sr.role_id
                WHERE cs.conference_id = %s
            """
            with connection.cursor() as cursor:
                cursor.execute(staff_query, [m.id])
                columns = [col[0] for col in cursor.description]
                m.staff_list = [dict(zip(columns, row)) for row in cursor.fetchall()]
                
        return meetings_list

    def create_meeting(self, data, staff_ids, created_by_staff_id, session_id):
        with transaction.atomic():
            conf = Conferences.objects.create(
                purpose="meeting",
                staff_id=data.get("staff_id"),
                created_id=created_by_staff_id,
                title=data.get("title"),
                date=data.get("date"),
                duration=data.get("duration"),
                password=data.get("password", ""),
                subject=data.get("subject", ""),
                session_id=session_id,
                host_video=int(data.get("host_video", 1)),
                client_video=int(data.get("client_video", 1)),
                description=data.get("description", ""),
                timezone=data.get("timezone", "UTC"),
                return_response=data.get("return_response", ""),
                api_type=data.get("api_type", "manual"),
                status=0,
                created_at=timezone.now()
            )
            for s_id in staff_ids:
                ConferenceStaff.objects.create(
                    conference_id=conf.id,
                    staff_id=s_id,
                    created_at=timezone.now()
                )
            return conf

    def delete_meeting(self, id):
        with transaction.atomic():
            ConferenceStaff.objects.filter(conference_id=id).delete()
            Conferences.objects.filter(id=id).delete()

    def change_status(self, conference_id, status_val):
        Conferences.objects.filter(id=conference_id).update(status=status_val)

    def add_join_history(self, conference_id, student_id=None, staff_id=None):
        if student_id:
            history, created = ConferencesHistory.objects.get_or_create(
                conference_id=conference_id,
                student_id=student_id,
                defaults={"total_hit": 1, "created_at": timezone.now()}
            )
        elif staff_id:
            history, created = ConferencesHistory.objects.get_or_create(
                conference_id=conference_id,
                staff_id=staff_id,
                defaults={"total_hit": 1, "created_at": timezone.now()}
            )
        else:
            return None

        if not created:
            history.total_hit += 1
            history.created_at = timezone.now()
            history.save()
        return history

    def get_class_report(self, class_id, section_id, session_id):
        query = """
            SELECT 
                c.*,
                cb.name as create_by_name, cb.surname as create_by_surname, cb.employee_id as create_bystaffid,
                fc.name as for_create_name, fc.surname as for_create_surname, fc.employee_id as for_creatstaffid,
                rcb.name as create_by_role_name, rfc.name as create_for_role_name,
                (
                    SELECT COUNT(*) 
                    FROM conferences_history ch
                    JOIN students s ON s.id = ch.student_id
                    JOIN student_session ss ON ss.student_id = s.id
                    WHERE ss.class_id = %s AND ss.section_id = %s AND ch.conference_id = c.id
                ) as total_viewers
            FROM conferences c
            JOIN staff cb ON cb.id = c.created_id
            JOIN staff fc ON fc.id = c.staff_id
            JOIN staff_roles scb ON scb.staff_id = cb.id
            JOIN roles rcb ON rcb.id = scb.role_id
            JOIN staff_roles sfc ON sfc.staff_id = fc.id
            JOIN roles rfc ON rfc.id = sfc.role_id
            JOIN conference_sections cs ON c.id = cs.conference_id
            JOIN class_sections cls ON cls.id = cs.cls_section_id
            WHERE c.purpose = 'class' AND c.status = 2 AND c.session_id = %s
              AND cls.class_id = %s AND cls.section_id = %s
            ORDER BY DATE(c.date) DESC, c.date DESC
        """
        classes = Conferences.objects.raw(query, [class_id, section_id, session_id, class_id, section_id])
        return list(classes)

    def get_meeting_report(self, session_id=None):
        query = """
            SELECT 
                c.*,
                cb.name as create_by_name, cb.surname as create_by_surname,
                (SELECT COUNT(*) FROM conferences_history ch WHERE ch.conference_id = c.id) as total_viewers
            FROM conferences c
            JOIN staff cb ON cb.id = c.created_id
            WHERE c.purpose = 'meeting' AND c.status = 2
        """
        params = []
        if session_id:
            query += " AND c.session_id = %s"
            params.append(session_id)
            
        query += " ORDER BY DATE(c.date) DESC, c.date DESC"
        meetings = Conferences.objects.raw(query, params)
        return list(meetings)

    def get_class_viewers(self, conference_id, class_id, section_id):
        query = """
            SELECT 
                ch.*,
                s.firstname as student_name, s.lastname as student_lastname,
                s.admission_no, s.roll_no, s.father_name
            FROM conferences_history ch
            JOIN students s ON s.id = ch.student_id
            JOIN student_session ss ON ss.student_id = s.id
            WHERE ch.conference_id = %s AND ss.class_id = %s AND ss.section_id = %s
            ORDER BY ch.id
        """
        with connection.cursor() as cursor:
            cursor.execute(query, [conference_id, class_id, section_id])
            columns = [col[0] for col in cursor.description]
            return [dict(zip(columns, row)) for row in cursor.fetchall()]

    def get_meeting_viewers(self, conference_id):
        query = """
            SELECT 
                ch.*,
                fc.name as staff_name, fc.surname as staff_surname,
                fc.employee_id, r.name as role_name
            FROM conferences_history ch
            JOIN staff fc ON fc.id = ch.staff_id
            LEFT JOIN staff_roles sr ON sr.staff_id = fc.id
            LEFT JOIN roles r ON r.id = sr.role_id
            WHERE ch.conference_id = %s
            ORDER BY ch.id
        """
        with connection.cursor() as cursor:
            cursor.execute(query, [conference_id])
            columns = [col[0] for col in cursor.description]
            return [dict(zip(columns, row)) for row in cursor.fetchall()]
