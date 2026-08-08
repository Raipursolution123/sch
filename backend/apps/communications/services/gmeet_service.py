from datetime import datetime
from django.db import connection, transaction
from django.utils import timezone
from apps.communications.models.gmeet import Gmeet
from apps.communications.models.gmeet_settings import GmeetSettings
from apps.communications.models.gmeet_history import GmeetHistory
from apps.communications.models.gmeet_sections import GmeetSections
from apps.staff.models.gmeet_staff import GmeetStaff
from apps.staff.models.staff import Staff
from apps.academics.models.class_sections import ClassSections
from apps.academics.models.classes import Classes
from apps.academics.models.sections import Sections


class GmeetService:
    def get_settings(self):
        settings = GmeetSettings.objects.first()
        if not settings:
            settings = GmeetSettings.objects.create(
                id=1,
                api_key="",
                api_secret="",
                use_api=0,
                created_at=timezone.now()
            )
        return settings

    def save_settings(self, data):
        settings = self.get_settings()
        settings.api_key = data.get("api_key", settings.api_key)
        settings.api_secret = data.get("api_secret", settings.api_secret)
        settings.use_api = int(data.get("use_api", settings.use_api))
        settings.created_at = timezone.now()
        settings.save()
        return settings

    def list_classes(self, staff_id=None, session_id=None):
        # We can perform a raw query to fetch classes with creators and assignees
        # matching CI: getByStaff
        query = """
            SELECT 
                g.*,
                fc.name as create_for_name, fc.surname as create_for_surname, fc.employee_id as for_create_employee_id,
                cb.name as create_by_name, cb.surname as create_by_surname, cb.employee_id as create_by_employee_id,
                rfc.name as create_for_role_name, rcb.name as create_by_role_name
            FROM gmeet g
            LEFT JOIN staff fc ON fc.id = g.staff_id
            LEFT JOIN staff cb ON cb.id = g.created_id
            LEFT JOIN staff_roles sfc ON sfc.staff_id = fc.id
            LEFT JOIN roles rfc ON rfc.id = sfc.role_id
            LEFT JOIN staff_roles scb ON scb.staff_id = cb.id
            LEFT JOIN roles rcb ON rcb.id = scb.role_id
            WHERE g.purpose = 'class'
        """
        params = []
        if session_id:
            query += " AND g.session_id = %s"
            params.append(session_id)
        if staff_id:
            query += " AND g.staff_id = %s"
            params.append(staff_id)
            
        query += " ORDER BY DATE(g.date) DESC, g.date DESC"
        
        classes = Gmeet.objects.raw(query, params)
        classes_list = list(classes)
        
        # Load sections for each class
        for c in classes_list:
            sections_query = """
                SELECT gs.id, c.class as class_name, s.section as section_name, gs.cls_section_id
                FROM gmeet_sections gs
                JOIN class_sections cs ON cs.id = gs.cls_section_id
                JOIN classes c ON c.id = cs.class_id
                JOIN sections s ON s.id = cs.section_id
                WHERE gs.gmeet_id = %s
            """
            with connection.cursor() as cursor:
                cursor.execute(sections_query, [c.id])
                columns = [col[0] for col in cursor.description]
                c.sections_list = [dict(zip(columns, row)) for row in cursor.fetchall()]
                
        return classes_list

    def create_class(self, data, class_sections, created_by_staff_id, session_id):
        with transaction.atomic():
            gmeet = Gmeet.objects.create(
                purpose="class",
                staff_id=data.get("staff_id"),
                created_id=created_by_staff_id,
                title=data.get("title"),
                date=data.get("date"),
                type=data.get("type", "manual"),
                api_data=data.get("api_data"),
                duration=data.get("duration"),
                subject=data.get("subject", ""),
                url=data.get("url"),
                session_id=session_id,
                description=data.get("description", ""),
                timezone=data.get("timezone", "UTC"),
                status=0,
                created_at=timezone.now()
            )
            for cs_id in class_sections:
                GmeetSections.objects.create(
                    gmeet_id=gmeet.id,
                    cls_section_id=cs_id,
                    created_at=timezone.now()
                )
            return gmeet

    def delete_class(self, id):
        with transaction.atomic():
            GmeetSections.objects.filter(gmeet_id=id).delete()
            Gmeet.objects.filter(id=id).delete()

    def list_meetings(self, staff_id=None, session_id=None):
        query = """
            SELECT 
                g.*,
                fc.name as create_for_name, fc.surname as create_for_surname,
                cb.name as create_by_name, cb.surname as create_by_surname, cb.employee_id as create_by_employee_id,
                rcb.name as create_by_role_name
            FROM gmeet g
            LEFT JOIN staff fc ON fc.id = g.staff_id
            LEFT JOIN staff cb ON cb.id = g.created_id
            LEFT JOIN staff_roles scb ON scb.staff_id = cb.id
            LEFT JOIN roles rcb ON rcb.id = scb.role_id
            WHERE g.purpose = 'meeting'
        """
        params = []
        if session_id:
            query += " AND g.session_id = %s"
            params.append(session_id)
        if staff_id:
            query += """ AND (g.created_id = %s OR g.id IN (SELECT gmeet_id FROM gmeet_staff WHERE staff_id = %s))"""
            params.extend([staff_id, staff_id])
            
        query += " ORDER BY DATE(g.date) DESC, g.date DESC"
        
        meetings = Gmeet.objects.raw(query, params)
        meetings_list = list(meetings)
        
        # Load staff list for each meeting
        for m in meetings_list:
            staff_query = """
                SELECT gs.id, s.name, s.surname, s.employee_id, r.name as role_name
                FROM gmeet_staff gs
                JOIN staff s ON s.id = gs.staff_id
                JOIN staff_roles sr ON sr.staff_id = s.id
                JOIN roles r ON r.id = sr.role_id
                WHERE gs.gmeet_id = %s
            """
            with connection.cursor() as cursor:
                cursor.execute(staff_query, [m.id])
                columns = [col[0] for col in cursor.description]
                m.staff_list = [dict(zip(columns, row)) for row in cursor.fetchall()]
                
        return meetings_list

    def create_meeting(self, data, staff_ids, created_by_staff_id, session_id):
        with transaction.atomic():
            gmeet = Gmeet.objects.create(
                purpose="meeting",
                staff_id=data.get("staff_id"),
                created_id=created_by_staff_id,
                title=data.get("title"),
                date=data.get("date"),
                type=data.get("type", "manual"),
                api_data=data.get("api_data"),
                duration=data.get("duration"),
                subject=data.get("subject", ""),
                url=data.get("url"),
                session_id=session_id,
                description=data.get("description", ""),
                timezone=data.get("timezone", "UTC"),
                status=0,
                created_at=timezone.now()
            )
            for s_id in staff_ids:
                GmeetStaff.objects.create(
                    gmeet_id=gmeet.id,
                    staff_id=s_id,
                    created_at=timezone.now()
                )
            return gmeet

    def delete_meeting(self, id):
        with transaction.atomic():
            GmeetStaff.objects.filter(gmeet_id=id).delete()
            Gmeet.objects.filter(id=id).delete()

    def change_status(self, gmeet_id, status_val):
        Gmeet.objects.filter(id=gmeet_id).update(status=status_val)

    def add_join_history(self, gmeet_id, student_id=None, staff_id=None):
        if student_id:
            history, created = GmeetHistory.objects.get_or_create(
                gmeet_id=gmeet_id,
                student_id=student_id,
                defaults={"total_hit": 1, "created_at": timezone.now()}
            )
        elif staff_id:
            history, created = GmeetHistory.objects.get_or_create(
                gmeet_id=gmeet_id,
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
                g.*,
                cb.name as create_by_name, cb.surname as create_by_surname, cb.employee_id as create_bystaffid,
                fc.name as for_create_name, fc.surname as for_create_surname, fc.employee_id as for_creatstaffid,
                rcb.name as create_by_role_name, rfc.name as create_for_role_name,
                (
                    SELECT COUNT(*) 
                    FROM gmeet_history gh
                    JOIN students s ON s.id = gh.student_id
                    JOIN student_session ss ON ss.student_id = s.id
                    WHERE ss.class_id = %s AND ss.section_id = %s AND gh.gmeet_id = g.id
                ) as total_viewers
            FROM gmeet g
            JOIN staff cb ON cb.id = g.created_id
            JOIN staff fc ON fc.id = g.staff_id
            JOIN staff_roles scb ON scb.staff_id = cb.id
            JOIN roles rcb ON rcb.id = scb.role_id
            JOIN staff_roles sfc ON sfc.staff_id = fc.id
            JOIN roles rfc ON rfc.id = sfc.role_id
            JOIN gmeet_sections gs ON g.id = gs.gmeet_id
            JOIN class_sections cs ON cs.id = gs.cls_section_id
            WHERE g.purpose = 'class' AND g.status = 2 AND g.session_id = %s
              AND cs.class_id = %s AND cs.section_id = %s
            ORDER BY DATE(g.date) DESC, g.date DESC
        """
        classes = Gmeet.objects.raw(query, [class_id, section_id, session_id, class_id, section_id])
        return list(classes)

    def get_meeting_report(self, session_id=None):
        query = """
            SELECT 
                g.*,
                cb.name as create_by_name, cb.surname as create_by_surname,
                (SELECT COUNT(*) FROM gmeet_history gh WHERE gh.gmeet_id = g.id) as total_viewers
            FROM gmeet g
            JOIN staff cb ON cb.id = g.created_id
            WHERE g.purpose = 'meeting' AND g.status = 2
        """
        params = []
        if session_id:
            query += " AND g.session_id = %s"
            params.append(session_id)
            
        query += " ORDER BY DATE(g.date) DESC, g.date DESC"
        meetings = Gmeet.objects.raw(query, params)
        return list(meetings)

    def get_class_viewers(self, gmeet_id, class_id, section_id):
        query = """
            SELECT 
                gh.*,
                s.firstname as student_name, s.lastname as student_lastname,
                s.admission_no, s.roll_no, s.father_name
            FROM gmeet_history gh
            JOIN students s ON s.id = gh.student_id
            JOIN student_session ss ON ss.student_id = s.id
            WHERE gh.gmeet_id = %s AND ss.class_id = %s AND ss.section_id = %s
            ORDER BY gh.id
        """
        with connection.cursor() as cursor:
            cursor.execute(query, [gmeet_id, class_id, section_id])
            columns = [col[0] for col in cursor.description]
            return [dict(zip(columns, row)) for row in cursor.fetchall()]

    def get_meeting_viewers(self, gmeet_id):
        query = """
            SELECT 
                gh.*,
                fc.name as staff_name, fc.surname as staff_surname,
                fc.employee_id, r.name as role_name
            FROM gmeet_history gh
            JOIN staff fc ON fc.id = gh.staff_id
            LEFT JOIN staff_roles sr ON sr.staff_id = fc.id
            LEFT JOIN roles r ON r.id = sr.role_id
            WHERE gh.gmeet_id = %s
            ORDER BY gh.id
        """
        with connection.cursor() as cursor:
            cursor.execute(query, [gmeet_id])
            columns = [col[0] for col in cursor.description]
            return [dict(zip(columns, row)) for row in cursor.fetchall()]
