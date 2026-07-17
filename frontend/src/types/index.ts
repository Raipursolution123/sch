export type { User, AuthTokens, LoginPayload, RegisterPayload, AuthResponse } from './auth';
export type { ApiSuccessResponse, ApiErrorResponse, PaginatedResponse } from './api';
export type {
  AcademicSession,
  ActiveFlag,
  CreateSessionPayload,
  UpdateSessionPayload,
} from './settings/session';
export type {
  GeneralSettings,
  GeneralSettingsTab,
  GeneralSettingsUpdatePayload,
  RtlMode,
} from './settings/general';

export type {
  TransportFeeMaster,
  CreateTransportFeeMasterPayload,
  UpdateTransportFeeMasterPayload,
  PickupPoint,
  CreatePickupPointPayload,
  UpdatePickupPointPayload,
  TransportRoute,
  CreateTransportRoutePayload,
  UpdateTransportRoutePayload,
  Vehicle,
  CreateVehiclePayload,
  UpdateVehiclePayload,
  VehicleRouteAssignment,
  CreateVehicleRouteAssignmentPayload,
  UpdateVehicleRouteAssignmentPayload,
  StudentTransportPickupPoint,
  StudentTransportAssignment,
  UpdateStudentTransportPayload,
} from './transport';
export type { Enquiry, CreateEnquiryPayload, UpdateEnquiryPayload } from './front-office/enquiry';
export type {
  OnlineAdmission,
  CreateOnlineAdmissionPayload,
  UpdateOnlineAdmissionPayload,
  ConvertOnlineAdmissionPayload,
  ConvertOnlineAdmissionResult,
} from './admissions/online-admission';
export type {
  Hostel,
  CreateHostelPayload,
  UpdateHostelPayload,
  HostelRoom,
  CreateHostelRoomPayload,
  UpdateHostelRoomPayload,
  RoomType,
  CreateRoomTypePayload,
  UpdateRoomTypePayload,
} from './hostel';
export type { CbseExam, CreateCbseExamPayload } from './examinations/cbse-exam';
export type { PaymentGateway } from './fees/payment-gateway';
export type { Notice, CreateNoticePayload, UpdateNoticePayload } from './communications/notice';
