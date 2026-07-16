from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from apps.hostel.api.serializers.hostel import (
    HostelSerializer,
    HostelCreateSerializer,
    HostelUpdateSerializer,
    HostelRoomSerializer,
    HostelRoomCreateSerializer,
    HostelRoomUpdateSerializer,
    RoomTypeSerializer,
    RoomTypeCreateSerializer,
    RoomTypeUpdateSerializer,
    HostelRoomBedSerializer,
    HostelRoomBedCreateSerializer,
    HostelRoomBedUpdateSerializer,
)
from apps.hostel.domain.hostel_exceptions import HostelError, HostelNotFoundError
from apps.hostel.services.hostel_service import HostelService, HostelRoomService, RoomTypeService, HostelRoomBedService
from common.pagination.standard import StandardResultsSetPagination
from common.responses.api import APIResponse
from core.permissions.legacy_privilege import HasLegacyPrivilege

MODULE = "hostel"


def hostel_error_response(exc: HostelError):
    if isinstance(exc, HostelNotFoundError):
        return APIResponse.error(
            message=exc.message, status_code=status.HTTP_404_NOT_FOUND
        )
    return APIResponse.error(
        message=exc.message, status_code=status.HTTP_400_BAD_REQUEST
    )


# --- Hostel Buildings ---
class HostelListCreateView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = "hostel"

    def get(self, request):
        service = HostelService()
        qs = service.list_hostels()
        paginator = StandardResultsSetPagination()
        page = paginator.paginate_queryset(qs, request, view=self)
        rows = list(page if page is not None else qs)
        serializer = HostelSerializer(rows, many=True)
        if page is not None:
            return paginator.get_paginated_response(serializer.data)
        return APIResponse.success(
            data=serializer.data, message="Hostels retrieved successfully."
        )

    def post(self, request):
        serializer = HostelCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return APIResponse.error(
                message="Validation failed",
                data=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST,
            )
        try:
            hostel = HostelService().create_hostel(serializer.validated_data)
            response_serializer = HostelSerializer(hostel)
            return APIResponse.success(
                data=response_serializer.data,
                message="Hostel created successfully.",
                status_code=status.HTTP_201_CREATED,
            )
        except HostelError as exc:
            return hostel_error_response(exc)


class HostelDetailView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = "hostel"

    def get(self, request, pk):
        try:
            hostel = HostelService().get_hostel(pk)
            serializer = HostelSerializer(hostel)
            return APIResponse.success(
                data=serializer.data,
                message="Hostel retrieved successfully.",
            )
        except HostelError as exc:
            return hostel_error_response(exc)

    def patch(self, request, pk):
        return self.put(request, pk)

    def put(self, request, pk):
        serializer = HostelUpdateSerializer(data=request.data, partial=True)
        if not serializer.is_valid():
            return APIResponse.error(
                message="Validation failed",
                data=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST,
            )
        try:
            hostel = HostelService().update_hostel(pk, serializer.validated_data)
            response_serializer = HostelSerializer(hostel)
            return APIResponse.success(
                data=response_serializer.data,
                message="Hostel updated successfully.",
            )
        except HostelError as exc:
            return hostel_error_response(exc)

    def delete(self, request, pk):
        try:
            HostelService().delete_hostel(pk)
            return APIResponse.success(message="Hostel deleted successfully.")
        except HostelError as exc:
            return hostel_error_response(exc)


# --- Hostel Rooms ---
class HostelRoomListCreateView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = "hostel_rooms"

    def get(self, request):
        hostel_id = request.query_params.get("hostel_id")
        if hostel_id is not None:
            try:
                hostel_id = int(hostel_id)
            except ValueError:
                hostel_id = None

        service = HostelRoomService()
        qs = service.list_rooms(hostel_id=hostel_id)
        paginator = StandardResultsSetPagination()
        page = paginator.paginate_queryset(qs, request, view=self)
        rows = list(page if page is not None else qs)
        serializer = HostelRoomSerializer(rows, many=True)
        if page is not None:
            return paginator.get_paginated_response(serializer.data)
        return APIResponse.success(
            data=serializer.data, message="Hostel rooms retrieved successfully."
        )

    def post(self, request):
        serializer = HostelRoomCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return APIResponse.error(
                message="Validation failed",
                data=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST,
            )
        try:
            room = HostelRoomService().create_room(serializer.validated_data)
            response_serializer = HostelRoomSerializer(room)
            return APIResponse.success(
                data=response_serializer.data,
                message="Hostel room created successfully.",
                status_code=status.HTTP_201_CREATED,
            )
        except HostelError as exc:
            return hostel_error_response(exc)


class HostelRoomDetailView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = "hostel_rooms"

    def get(self, request, pk):
        try:
            room = HostelRoomService().get_room(pk)
            serializer = HostelRoomSerializer(room)
            return APIResponse.success(
                data=serializer.data,
                message="Hostel room retrieved successfully.",
            )
        except HostelError as exc:
            return hostel_error_response(exc)

    def patch(self, request, pk):
        return self.put(request, pk)

    def put(self, request, pk):
        serializer = HostelRoomUpdateSerializer(data=request.data, partial=True)
        if not serializer.is_valid():
            return APIResponse.error(
                message="Validation failed",
                data=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST,
            )
        try:
            room = HostelRoomService().update_room(pk, serializer.validated_data)
            response_serializer = HostelRoomSerializer(room)
            return APIResponse.success(
                data=response_serializer.data,
                message="Hostel room updated successfully.",
            )
        except HostelError as exc:
            return hostel_error_response(exc)

    def delete(self, request, pk):
        try:
            HostelRoomService().delete_room(pk)
            return APIResponse.success(message="Hostel room deleted successfully.")
        except HostelError as exc:
            return hostel_error_response(exc)


# --- Room Types ---
class RoomTypeListCreateView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = "hostel_room_type"

    def get(self, request):
        service = RoomTypeService()
        qs = service.list_room_types()
        paginator = StandardResultsSetPagination()
        page = paginator.paginate_queryset(qs, request, view=self)
        rows = list(page if page is not None else qs)
        serializer = RoomTypeSerializer(rows, many=True)
        if page is not None:
            return paginator.get_paginated_response(serializer.data)
        return APIResponse.success(
            data=serializer.data, message="Room types retrieved successfully."
        )

    def post(self, request):
        serializer = RoomTypeCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return APIResponse.error(
                message="Validation failed",
                data=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST,
            )
        try:
            rt = RoomTypeService().create_room_type(serializer.validated_data)
            response_serializer = RoomTypeSerializer(rt)
            return APIResponse.success(
                data=response_serializer.data,
                message="Room type created successfully.",
                status_code=status.HTTP_201_CREATED,
            )
        except HostelError as exc:
            return hostel_error_response(exc)


class RoomTypeDetailView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = "hostel_room_type"

    def get(self, request, pk):
        try:
            rt = RoomTypeService().get_room_type(pk)
            serializer = RoomTypeSerializer(rt)
            return APIResponse.success(
                data=serializer.data,
                message="Room type retrieved successfully.",
            )
        except HostelError as exc:
            return hostel_error_response(exc)

    def patch(self, request, pk):
        return self.put(request, pk)

    def put(self, request, pk):
        serializer = RoomTypeUpdateSerializer(data=request.data, partial=True)
        if not serializer.is_valid():
            return APIResponse.error(
                message="Validation failed",
                data=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST,
            )
        try:
            rt = RoomTypeService().update_room_type(pk, serializer.validated_data)
            response_serializer = RoomTypeSerializer(rt)
            return APIResponse.success(
                data=response_serializer.data,
                message="Room type updated successfully.",
            )
        except HostelError as exc:
            return hostel_error_response(exc)

    def delete(self, request, pk):
        try:
            RoomTypeService().delete_room_type(pk)
            return APIResponse.success(message="Room type deleted successfully.")
        except HostelError as exc:
            return hostel_error_response(exc)


# --- Hostel Room Beds ---
class HostelRoomBedListCreateView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = "hostel"

    def get(self, request):
        hostel_id = request.query_params.get("hostel_id")
        room_id = request.query_params.get("room_id")
        try:
            hostel_id = int(hostel_id) if hostel_id is not None else None
        except ValueError:
            hostel_id = None
        try:
            room_id = int(room_id) if room_id is not None else None
        except ValueError:
            room_id = None

        service = HostelRoomBedService()
        qs = service.list_room_beds(hostel_id=hostel_id, room_id=room_id)
        paginator = StandardResultsSetPagination()
        page = paginator.paginate_queryset(qs, request, view=self)
        rows = list(page if page is not None else qs)
        serializer = HostelRoomBedSerializer(rows, many=True)
        if page is not None:
            return paginator.get_paginated_response(serializer.data)
        return APIResponse.success(
            data=serializer.data, message="Room beds retrieved successfully."
        )

    def post(self, request):
        serializer = HostelRoomBedCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return APIResponse.error(
                message="Validation failed",
                data=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST,
            )
        try:
            bed = HostelRoomBedService().create_room_bed(serializer.validated_data)
            response_serializer = HostelRoomBedSerializer(bed)
            return APIResponse.success(
                data=response_serializer.data,
                message="Room bed created successfully.",
                status_code=status.HTTP_201_CREATED,
            )
        except HostelError as exc:
            return hostel_error_response(exc)


class HostelRoomBedDetailView(APIView):
    permission_classes = [IsAuthenticated, HasLegacyPrivilege]
    legacy_module_short_code = MODULE
    legacy_permission_category = "hostel"

    def get(self, request, pk):
        try:
            bed = HostelRoomBedService().get_room_bed(pk)
            serializer = HostelRoomBedSerializer(bed)
            return APIResponse.success(
                data=serializer.data,
                message="Room bed retrieved successfully.",
            )
        except HostelError as exc:
            return hostel_error_response(exc)

    def patch(self, request, pk):
        return self.put(request, pk)

    def put(self, request, pk):
        serializer = HostelRoomBedUpdateSerializer(data=request.data, partial=True)
        if not serializer.is_valid():
            return APIResponse.error(
                message="Validation failed",
                data=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST,
            )
        try:
            bed = HostelRoomBedService().update_room_bed(pk, serializer.validated_data)
            response_serializer = HostelRoomBedSerializer(bed)
            return APIResponse.success(
                data=response_serializer.data,
                message="Room bed updated successfully.",
            )
        except HostelError as exc:
            return hostel_error_response(exc)

    def delete(self, request, pk):
        try:
            HostelRoomBedService().delete_room_bed(pk)
            return APIResponse.success(message="Room bed deleted successfully.")
        except HostelError as exc:
            return hostel_error_response(exc)

