from typing import Any
from django.utils import timezone

from apps.hostel.models.hostel import Hostel
from apps.hostel.models.hostel_rooms import HostelRooms
from apps.settings.models.room_types import RoomTypes
from apps.hostel.domain.hostel_exceptions import (
    HostelNotFoundError,
    HostelValidationError,
)


class HostelService:
    def list_hostels(self):
        return Hostel.objects.all().order_by("-id")

    def get_hostel(self, hostel_id: int) -> Hostel:
        hostel = Hostel.objects.filter(id=hostel_id).first()
        if hostel is None:
            raise HostelNotFoundError("Hostel not found.")
        return hostel

    def create_hostel(self, payload: dict[str, Any]) -> Hostel:
        hostel_name = payload.get("hostel_name")
        if not hostel_name or not hostel_name.strip():
            raise HostelValidationError("Hostel name is required.")

        hostel = Hostel.objects.create(
            hostel_name=hostel_name.strip(),
            type=payload.get("type"),
            address=payload.get("address"),
            intake=payload.get("intake"),
            description=payload.get("description"),
            hostel_incharge=payload.get("hostel_incharge", ""),
            is_active=payload.get("is_active", "no"),
            meal_type=payload.get("meal_type"),
            created_at=timezone.now(),
        )
        return hostel

    def update_hostel(self, hostel_id: int, payload: dict[str, Any]) -> Hostel:
        hostel = self.get_hostel(hostel_id)

        if "hostel_name" in payload:
            hostel_name = payload["hostel_name"]
            if not hostel_name or not hostel_name.strip():
                raise HostelValidationError("Hostel name cannot be empty.")
            hostel.hostel_name = hostel_name.strip()

        if "type" in payload:
            hostel.type = payload["type"]
        if "address" in payload:
            hostel.address = payload["address"]
        if "intake" in payload:
            hostel.intake = payload["intake"]
        if "description" in payload:
            hostel.description = payload["description"]
        if "hostel_incharge" in payload:
            hostel.hostel_incharge = payload["hostel_incharge"]
        if "is_active" in payload:
            hostel.is_active = payload["is_active"]
        if "meal_type" in payload:
            hostel.meal_type = payload["meal_type"]

        hostel.save()
        return hostel

    def delete_hostel(self, hostel_id: int) -> None:
        hostel = self.get_hostel(hostel_id)
        hostel.delete()


class HostelRoomService:
    def list_rooms(self, hostel_id: int = None):
        qs = HostelRooms.objects.all().order_by("-id")
        if hostel_id is not None:
            qs = qs.filter(hostel_id=hostel_id)
        return qs

    def get_room(self, room_id: int) -> HostelRooms:
        room = HostelRooms.objects.filter(id=room_id).first()
        if room is None:
            raise HostelNotFoundError("Hostel room not found.")
        return room

    def create_room(self, payload: dict[str, Any]) -> HostelRooms:
        room_no = payload.get("room_no")
        if not room_no or not room_no.strip():
            raise HostelValidationError("Room number is required.")

        room = HostelRooms.objects.create(
            hostel_id=payload.get("hostel_id"),
            room_type_id=payload.get("room_type_id"),
            room_no=room_no.strip(),
            no_of_bed=payload.get("no_of_bed"),
            cost_per_bed=payload.get("cost_per_bed", 0.0),
            cost_term=payload.get("cost_term", ""),
            title=payload.get("title"),
            fee_title=payload.get("fee_title"),
            description=payload.get("description"),
            created_at=timezone.now(),
        )
        return room

    def update_room(self, room_id: int, payload: dict[str, Any]) -> HostelRooms:
        room = self.get_room(room_id)

        if "room_no" in payload:
            room_no = payload["room_no"]
            if not room_no or not room_no.strip():
                raise HostelValidationError("Room number cannot be empty.")
            room.room_no = room_no.strip()

        if "hostel_id" in payload:
            room.hostel_id = payload["hostel_id"]
        if "room_type_id" in payload:
            room.room_type_id = payload["room_type_id"]
        if "no_of_bed" in payload:
            room.no_of_bed = payload["no_of_bed"]
        if "cost_per_bed" in payload:
            room.cost_per_bed = payload["cost_per_bed"]
        if "cost_term" in payload:
            room.cost_term = payload["cost_term"]
        if "title" in payload:
            room.title = payload["title"]
        if "fee_title" in payload:
            room.fee_title = payload["fee_title"]
        if "description" in payload:
            room.description = payload["description"]

        room.save()
        return room

    def delete_room(self, room_id: int) -> None:
        room = self.get_room(room_id)
        room.delete()


class RoomTypeService:
    def list_room_types(self):
        return RoomTypes.objects.all().order_by("-id")

    def get_room_type(self, room_type_id: int) -> RoomTypes:
        rt = RoomTypes.objects.filter(id=room_type_id).first()
        if rt is None:
            raise HostelNotFoundError("Room type not found.")
        return rt

    def create_room_type(self, payload: dict[str, Any]) -> RoomTypes:
        room_type = payload.get("room_type")
        if not room_type or not room_type.strip():
            raise HostelValidationError("Room type is required.")

        rt = RoomTypes.objects.create(
            room_type=room_type.strip(),
            description=payload.get("description"),
            created_at=timezone.now(),
        )
        return rt

    def update_room_type(self, room_type_id: int, payload: dict[str, Any]) -> RoomTypes:
        rt = self.get_room_type(room_type_id)

        if "room_type" in payload:
            room_type = payload["room_type"]
            if not room_type or not room_type.strip():
                raise HostelValidationError("Room type cannot be empty.")
            rt.room_type = room_type.strip()

        if "description" in payload:
            rt.description = payload["description"]

        rt.updated_at = timezone.now().date()
        rt.save()
        return rt

    def delete_room_type(self, room_type_id: int) -> None:
        rt = self.get_room_type(room_type_id)
        rt.delete()


from apps.cyc_extensions.models.cyc_hostel_room_bed import CycHostelRoomBed

class HostelRoomBedService:
    def list_room_beds(self, hostel_id: int = None, room_id: int = None):
        qs = CycHostelRoomBed.objects.all().order_by("-id")
        if hostel_id is not None:
            qs = qs.filter(hostel_id=hostel_id)
        if room_id is not None:
            qs = qs.filter(room_id=room_id)
        return qs

    def get_room_bed(self, bed_id: int) -> CycHostelRoomBed:
        bed = CycHostelRoomBed.objects.filter(id=bed_id).first()
        if bed is None:
            raise HostelNotFoundError("Hostel room bed not found.")
        return bed

    def create_room_bed(self, payload: dict[str, Any]) -> CycHostelRoomBed:
        bed_code = payload.get("bed_code")
        if not bed_code or not bed_code.strip():
            raise HostelValidationError("Bed code is required.")

        bed = CycHostelRoomBed.objects.create(
            hostel_id=payload.get("hostel_id"),
            room_id=payload.get("room_id"),
            room_number=payload.get("room_number", ""),
            bed_code=bed_code.strip(),
            bed_status=payload.get("bed_status", 1),
        )
        return bed

    def update_room_bed(self, bed_id: int, payload: dict[str, Any]) -> CycHostelRoomBed:
        bed = self.get_room_bed(bed_id)

        if "bed_code" in payload:
            bed_code = payload["bed_code"]
            if not bed_code or not bed_code.strip():
                raise HostelValidationError("Bed code cannot be empty.")
            bed.bed_code = bed_code.strip()

        if "hostel_id" in payload:
            bed.hostel_id = payload["hostel_id"]
        if "room_id" in payload:
            bed.room_id = payload["room_id"]
        if "room_number" in payload:
            bed.room_number = payload["room_number"]
        if "bed_status" in payload:
            bed.bed_status = payload["bed_status"]

        bed.save()
        return bed

    def delete_room_bed(self, bed_id: int) -> None:
        bed = self.get_room_bed(bed_id)
        bed.delete()

