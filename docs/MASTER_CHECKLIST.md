# School ERP — Master Implementation Checklist

**Last updated:** 2026-07-23  
**Current phase:** Phase 28 — Settings system config (Notifications / SMS / Email / Payment / Print) ✅ COMPLETE  
**Branch:** `main`

---

## Project Dashboard

| Metric | Value |
|--------|-------|
| **Overall Project Progress** | Phases 0–28 complete |
| **Current Phase** | Phase 28 — Settings system config ✅ |
| **Current Task** | Ops: prod deploy + UAT |
| **Completed Phases** | Phase 0 ✅ … Phase 28 ✅ |
| **Remaining Phases** | Ops / UAT; residual Settings (modules, custom fields, captcha, backup, etc.) |
| **Open Bugs** | 0 |
| **Backend Completion** | ~99% |
| **Frontend Completion** | ~99% |
| **API Integration Status** | Settings notification/SMS/email/payment/print APIs |
| **UI Completion Status** | Settings Soon badges cleared for Notifications, SMS, Email, Payment Methods, Print Header & Footer |
| **Testing Status** | system_config service tests + frontend typecheck + Docker verification |
| **Production Readiness** | Code-ready — pending prod deploy, UAT |
| **Technical Debt Remaining** | Residual Settings: modules, custom fields, captcha, system fields, online admission settings, sidebar menu editor, backup/restore, file types |

---

## Phase 0 — Critical Security & Production Blockers ✅ SIGNED OFF

**Signed off:** 2026-07-20

| ID | Task | Status |
|----|------|--------|
| 0.1 | Homework API `HasLegacyPrivilege` | ✅ |
| 0.2 | Finance/cyc_extensions RBAC | ✅ |
| 0.3 | `legacy_module_short_code` on lesson-plan + syllabus | ✅ |
| 0.4 | Frontend RBAC from `/auth/me` | ✅ |
| 0.5 | Route-level permission guard | ✅ |
| 0.6 | `ALLOW_REGISTRATION=false` in env examples | ✅ |
| 0.7 | `docs/RBAC.md` | ✅ |

---

## Phase 1 — Merge & Branch Stabilization

**Objective:** Land finance merge + Phase 0 security on `main` with a clean, CI-green baseline.

### Checklist

| ID | Task | Status | Notes |
|----|------|--------|-------|
| 1.1 | Commit Phase 0 security work on merge branch | ✅ Completed | `ac34a54` |
| 1.2 | Merge `merge/feature-academics-fees-into-main` → `main` | ✅ Completed | Fast-forward |
| 1.3 | Resolve conflicts / stray changes | ✅ Completed | `auth/__init__.py` restored |
| 1.4 | Run local verification (pytest + typecheck) | ✅ Completed | 7/7 + typecheck pass |
| 1.5 | Push `main` to origin | ✅ Completed | `50a754b..ac34a54` |
| 1.6 | Confirm CI green on `main` | ✅ Completed | CI run `29731137529` success |

### Acceptance Criteria

- [x] Single `main` branch contains finance + roadmap + Phase 0 security
- [x] No uncommitted work on `main`
- [x] Backend unit tests pass
- [x] Frontend typecheck passes
- [x] CI passes on pushed `main`

---

## Phase 1 — Merge & Branch Stabilization ✅ SIGNED OFF

**Signed off:** 2026-07-20

---

## Phase 2 — Backend Completion (Core Gaps) ✅ SIGNED OFF

**Signed off:** 2026-07-20  
**Objective:** Complete the highest-priority backend gaps — RBAC consistency, dead-code removal, new APIs for front-office/transport/finance.

### Task 2.1 — RBAC Category/Module Fixes ✅

| View | Old | Fixed |
|------|-----|-------|
| `admissions/api/views/online_admissions.py` | module `front_office` | `online_admission` |
| `transport/api/views/pickup_point.py` | category `routes` | `pickup_point` |
| `transport/api/views/transport_fees.py` | category `transport_fees` | `transport_fees_master` |
| `hostel/api/views/hostel.py` (RoomType) | category `hostel_room_type` | `room_type` |

- **Status:** ✅ Completed
- **Files modified:** 4 view files
- **RBAC aligned with:** `seeds/basic_seed.sql` categories
- **Regression:** All 187 tests pass

### Task 2.2 — Dead Finance Code Cleanup ✅

- Deleted `cyc_extensions/api/views/accounting.py` (duplicate of 6 split view modules)
- Deleted `cyc_extensions/api/serializers/accounting.py` (duplicate serializers)
- `urls.py` already references only split modules — no URL changes needed
- **Status:** ✅ Completed
- **Files deleted:** 2

### Task 2.3 — Front Office API Expansion ✅

New APIs following the existing enquiry pattern (APIView + service + serializer):

| Endpoint | Module | RBAC category |
|----------|--------|---------------|
| `GET/POST /front-office/visitors/` | `front_office` | `visitor_book` |
| `GET/PUT/PATCH/DELETE /front-office/visitors/<pk>/` | `front_office` | `visitor_book` |
| `GET/POST /front-office/complaints/` | `front_office` | `complaint` |
| `GET/PUT/PATCH/DELETE /front-office/complaints/<pk>/` | `front_office` | `complaint` |
| `GET/POST /front-office/postal/` | `front_office` | `postal_dispatch` |
| `GET/PUT/PATCH/DELETE /front-office/postal/<pk>/` | `front_office` | `postal_dispatch` |

- **Status:** ✅ Completed
- **Files created:** 6 (3 serializers, 3 views, 3 services)
- **Files modified:** `front_office/urls.py`
- **Backend status:** Full CRUD with service-layer validation and proper 404/400/403 handling
- **Tests:** 9 new service unit tests — all pass

### Task 2.4 — Transport: RoutePickupPoint CRUD API ✅

New API to assign/manage pickup points on routes (matching `route_pickup_point` seed category):

| Endpoint | RBAC category |
|----------|---------------|
| `GET/POST /transport/route-pickup-points/` | `route_pickup_point` |
| `GET/PUT/PATCH/DELETE /transport/route-pickup-points/<pk>/` | `route_pickup_point` |

- Duplicate-assignment guard in service
- `?route_id=` query param for filtering by route
- **Status:** ✅ Completed
- **Files created:** 3 (serializer, service, view)
- **Files modified:** `transport/urls.py`
- **Tests:** 8 new service unit tests — all pass

### Task 2.5 — Finance: GET on LedgersDetailView + Mapper Detail Endpoint ✅

- Added `GET` handler to `LedgersDetailView` (was missing — only PUT/DELETE existed)
- Added `FeeHeadMapperDetailView` with full GET/PUT/PATCH/DELETE
- Wired `finance/mapper/<pk>/` in `cyc_extensions/urls.py`
- Removed duplicate import in `ledgers.py`
- **Status:** ✅ Completed
- **Files modified:** `ledgers.py`, `fee_head_mapper.py`, `urls.py`

### Task 2.6 — Homework Serializer Hardening ✅

- Replaced `fields = "__all__"` with explicit field lists in all 4 homework serializers
- Added `read_only_fields = ["id", "created_at"]` to prevent accidental overwrites
- **Status:** ✅ Completed
- **Files modified:** `academics/api/serializers/homework.py`

### Task 2.7 — Tests ✅

- **22 new unit tests** across `front_office/tests/test_front_office_services.py` and `transport/tests/test_route_pickup_point_service.py`
- All 22 pass; no DB required (fully mocked)
- Full suite: **187 passed**, 7 pre-existing DB-env errors (unchanged from Phase 1 baseline)
- `transport/tests/__init__.py` created

### Acceptance Criteria

- [x] All Phase 2 target APIs are implemented and RBAC-consistent
- [x] RBAC categories match `seeds/basic_seed.sql`
- [x] Dead duplicate code removed
- [x] Service-layer validation in new modules
- [x] Explicit serializer fields (no `__all__`)
- [x] 22 new focused tests pass
- [x] No regression on existing 187 tests
- [x] `MASTER_CHECKLIST.md` updated

---

## Phase 3 — Frontend Integration ✅ SIGNED OFF

**Signed off:** 2026-07-20  
**Objective:** Wire Phase 2 backend APIs into the React SPA with full CRUD pages, navigation, and route guards.

### Task 3.1 — Front Office UI ✅

| Page | Route | Backend API |
|------|-------|-------------|
| Visitor Book | `/front-office/visitors` | `/front-office/visitors/` |
| Complaints | `/front-office/complaints` | `/front-office/complaints/` |
| Postal Dispatch | `/front-office/dispatch` | `/front-office/postal/` (type=dispatch) |
| Postal Receive | `/front-office/receive` | `/front-office/postal/` (type=receive) |

- Types, services, hooks, schemas, tables, form dialogs, and pages created
- Follows existing `EnquiryPage` / `ModuleListPack` pattern
- **Status:** ✅ Completed

### Task 3.2 — Transport Route Pickup Points UI ✅

| Page | Route | Backend API |
|------|-------|-------------|
| Route Pickup Points | `/transport/route-pickup-points` | `/transport/route-pickup-points/` |

- Full CRUD with route + pickup point selects
- Nav item added under Transport with `route_pickup_point` permission key
- **Status:** ✅ Completed

### Task 3.3 — Wiring & Permissions ✅

- Routes registered in `admin-routes.tsx`
- Paths added to `implemented-paths.ts` (65 total)
- API endpoints in `api-endpoints.ts`
- Query keys in `query-keys.ts`
- Transport permission resolver expanded for `pickup_point`, `route_pickup_point`, `transport_fees_master`
- **Status:** ✅ Completed

### Verification

- [x] Frontend typecheck passes
- [x] All 6 new pages reachable via nav
- [x] CRUD hooks with toast + cache invalidation
- [x] `MASTER_CHECKLIST.md` updated

---

## Phase 4 — UI/UX Polish & Cleanup ✅ SIGNED OFF

**Signed off:** 2026-07-20  
**Objective:** Improve usability, remove dead code, and fix UX gaps from the roadmap audit.

### Task 4.1 — Sidebar Coming Soon Badges ✅

- Added `comingSoon` flag on `NavItem` via `annotateNavImplementationStatus()`
- Unimplemented routes (not in `IMPLEMENTED_PATHS`) show a **Soon** badge in sidebar
- **Status:** ✅ Completed

### Task 4.2 — Approve Leave Page UX ✅

- Refactored to `ModuleListPack` with loading, error, and empty states
- Replaced `window.confirm` with `ConfirmDialog` for delete
- Added `PermissionButton` on add/edit/delete actions
- Fixed `@/hooks` import to `@hooks`
- **Status:** ✅ Completed

### Task 4.3–4.5 — Dead Code Cleanup ✅

- Removed duplicate `/fees/offline-payments` route (kept `/fees/payment-gateways`)
- Removed `offlinePayments` from `IMPLEMENTED_PATHS` (nav item now shows Coming Soon)
- Deleted orphan `TopicPage.tsx` (topics live under Lessons & Topics tab)
- Deleted unused `FEE_CATEGORIES` mock constant
- **Status:** ✅ Completed

### Task 4.6–4.7 — Finance Standardization ✅

- Added `finance` section to `api-endpoints.ts` (groups, ledgers, entries, mapper, trial balance)
- Updated `ledgers.service.ts` and `ledger-groups.service.ts` to use `API_ENDPOINTS`
- Standardized all finance imports: `@/types` → `@app-types`, `@/hooks` → `@hooks`, `@/components` → `@components`
- **Status:** ✅ Completed

### Task 4.8 & 4.10 — Page Polish ✅

- Promote Students page: added session-loading/error shell via `ModuleListPack`
- Hostel pages (buildings, rooms, room types): replaced plain `Button` with `PermissionButton`
- **Status:** ✅ Completed

### Verification

- [x] Frontend typecheck passes
- [x] Coming Soon badges visible on unimplemented nav items
- [x] No orphan TopicPage or FEE_CATEGORIES mock
- [x] Finance services use centralized API endpoints
- [x] `MASTER_CHECKLIST.md` updated

---

## Phase 5 — Performance Optimization ✅ SIGNED OFF

**Signed off:** 2026-07-20  
**Objective:** Reduce N+1 query hotspots, add reference-data caching, tune frontend React Query, verify compression.

### Task 5.1–5.2 — Backend N+1 Fixes ✅

| Hot path | Issue | Fix |
|----------|-------|-----|
| Student list (`enrich_list_page`) | `disable_reason_name()` queried per row | Batch `disable_reason_labels()` once per page |
| Fee collect roster | `get_fee_summary()` per student (3+ SQL each) | `batch_fee_totals_for_roster()` — 2 batch SQL queries + shared class fallback |
| Attendance roster | Redundant session lookup; all attendance types loaded | Cached `get_current_session()`; filter active types only; early empty return |

- **Status:** ✅ Completed
- **Files modified:** `student_selectors.py`, `student_service.py`, `student_fee_selectors.py`, `fee_collect_service.py`, `attendance_service.py`
- **Tests:** 3 new unit tests — all pass

### Task 5.3 — Frontend Lazy Routes ✅

- Converted `DashboardPage` to `lazy()` import (last non-lazy admin page)
- All 64 admin routes now code-split
- **Status:** ✅ Completed

### Task 5.4 — React Query staleTime for Reference Data ✅

- Added `constants/query-stale-times.ts` with `REFERENCE_DATA_STALE_TIME = 30 min`
- Applied to: `useClasses`, `useSections`, `useSubjects`, `useClassSections`, `useSessions`, `useActiveSession`, `useLeaveTypes`, `useFeeTypes`, `useFeeCategories`
- Global default remains 5 min in `query-client.ts`
- **Status:** ✅ Completed

### Task 5.5 — Pagination Consistency ✅

- Audited hot list endpoints — student list, session list, and all CRUD modules already use `StandardResultsSetPagination`
- Session list now paginates cached in-memory rows (small table, safe for full cache)
- **Status:** ✅ Verified — no changes required

### Task 5.6 — Redis Reference Cache ✅

- Added `common/cache/reference_cache.py` (Redis in prod, LocMem in local dev)
- Cached: current session ID, active session object, sessions list, user legacy permissions (5 min TTL)
- Cache invalidation on session create/update/activate/delete
- `user_has_privilege()` now reads from cached permission map (eliminates duplicate DB hit per check)
- **Status:** ✅ Completed
- **Files created:** `common/cache/reference_cache.py`, `common/cache/__init__.py`
- **Files modified:** `session_selectors.py`, `session_service.py`, `legacy_rbac.py`, `session.py` (view)

### Task 5.7 — gzip on nginx ✅

- Verified `gzip on` with `gzip_types` for JSON/JS/CSS/SVG in both `nginx.staging.conf` and `nginx.prod.conf`
- **Status:** ✅ Verified — already configured

### Task 5.8 — DB Index Review ✅

- Models are `managed = False` (legacy schema) — indexes applied at DB level, not via Django migrations
- Recommended composite indexes documented for DBA:
  - `student_attendences (student_session_id, date)` — attendance roster lookup
  - `student_session (session_id, class_id, section_id)` — enrollment roster queries
- Existing single-column indexes on these columns partially cover queries
- **Status:** ✅ Documented

### Verification

- [x] 5 new/updated unit tests pass (student list batch, fee batch, fee collect)
- [x] Frontend linter clean on edited files
- [x] gzip verified in staging + prod nginx configs
- [x] `MASTER_CHECKLIST.md` updated

---

## Phase 6 — Refactoring & Technical Debt ✅ SIGNED OFF

**Signed off:** 2026-07-20  
**Objective:** Reduce duplication, standardize patterns, and document architecture — no behavior changes.

### Task 6.1 — Unified Pagination Shape ✅

- Extended `StandardResultsSetPagination` to always return flat `{count, next, previous, results}` array
- Migrated 8 endpoints that nested entity keys inside `results` (classes, sections, subjects, subject groups, sessions, class sections, languages, currencies)
- Frontend `extractList()` already handles both shapes — no service changes required
- **Status:** ✅ Completed

### Task 6.2 — Shared CRUD Helpers ✅

- Added `common/views/legacy_crud_helpers.py`: `paginate_list_response()`, `validation_error_response()`
- Refactored `TransportFeesListCreateView` as reference implementation
- **Status:** ✅ Completed

### Task 6.3 — Consolidated Error Handling (Frontend) ✅

- `useApproveLeave` now uses `getApiErrorMessage` (removed manual `error.response?.data` parsing)
- Added `getApiErrorMessage` + toast to `useLessons`, `useTopics`, `useSyllabusStatus` mutations
- **Status:** ✅ Completed

### Task 6.4 — Centralized Lesson/Topic Service Exports ✅

- Added `lessonService` and `topicService` to `services/api/index.ts`
- Hooks import from `@services/api` barrel
- **Status:** ✅ Completed

### Task 6.5 — TypeScript `@/` Import Cleanup ✅

- Migrated 19 academics files (lessons, topics, syllabus-status) from `@/types`, `@/hooks`, `@/services` → project aliases
- Hooks directory: zero remaining `any` types or `@/` imports
- **Status:** ✅ Completed

### Task 6.6 — Backend Shared Error Helper ✅

- Added `common/exceptions/legacy_errors.py` — `legacy_domain_error_response()`
- Transport + hostel error handlers now delegate to shared helper
- 2 unit tests added
- **Status:** ✅ Completed

### Task 6.7 — Hostel URL Deduplication ✅

- Removed duplicate root (`""`), `buildings/` aliases from `hostel/urls.py`
- Canonical paths: `hostels/`, `rooms/`, `room-types/`, `room-beds/` (matches frontend `api-endpoints.ts`)
- **Status:** ✅ Completed

### Task 6.8 — Architecture Documentation ✅

- Created `docs/ARCHITECTURE.md` — system diagram, layer conventions, new-module checklist
- **Status:** ✅ Completed

### Task 6.9 — Contributor Guide ✅

- Created `AGENTS.md` — workflow, backend/frontend rules, testing commands
- **Status:** ✅ Completed

### Bonus — RBAC Cache Invalidation ✅

- Added `apps/accounts/signals.py` — invalidates permission cache on `RolePermission` / `StaffRole` changes
- Wired in `AccountsConfig.ready()`
- **Status:** ✅ Completed

### Verification

- [x] 4 backend tests pass (legacy errors + fee collect)
- [x] Frontend typecheck passes
- [x] No `@/` imports remaining in hooks
- [x] `MASTER_CHECKLIST.md` updated

---

## Phase 7 — Testing, QA & Production Readiness ✅ SIGNED OFF

**Signed off:** 2026-07-20  
**Objective:** Automated test depth, production ops documentation, CI gates — code-ready for release.

### Task 7.1 — API Integration Tests ✅

- Added `backend/tests/integration/` — 13 HTTP tests (auth, RBAC, fee collect roster, health)
- Tests run without MySQL locally (mocked DB-touching permission checks)
- CI runs full suite with MySQL service
- **Status:** ✅ Completed

### Task 7.2 — Frontend Vitest ✅

- Added Vitest + `@vitest/coverage-v8`, `vitest.config.ts`
- 14 unit tests: `error-message`, `legacy-permissions`, `session` utils
- `npm run test` / `test:coverage` scripts
- CI job: `frontend-test`
- **Status:** ✅ Completed

### Task 7.3 — E2E Smoke ✅

- Existing `scripts/staging-e2e-verify.sh` covers auth, SPA routes, infra (curl-based)
- Added `scripts/prod-healthcheck.sh` for post-deploy liveness/readiness
- Playwright deferred — curl smoke + integration tests cover CI gate
- **Status:** ✅ Verified existing + prod health script added

### Task 7.4–7.6 — Production Ops ✅ (documented)

- `.env.production.example` created with Sentry, TLS, backup vars
- `prod-deploy.sh`, `prod-backup.sh`, `deploy-production.yml` verified present
- **Ops pending:** first prod deploy, TLS certs, backup cron + restore drill (server-side)
- **Status:** ✅ Documented — execution is deploy-time

### Task 7.7 — Sentry ✅

- Added `sentry-sdk` to `requirements/prod.txt`
- `config/settings/production.py` already initializes when `SENTRY_DSN` set
- **Status:** ✅ Completed

### Task 7.8 — Runbook Validation ✅

- Updated `docs/PRODUCTION.md` with `prod-healthcheck.sh` usage
- Cross-referenced `.env.production.example`, staging runbook
- **Status:** ✅ Completed

### Task 7.9 — Security Review ✅

- `.env.production.example` added (no secrets in repo)
- CI Trivy scan on Docker images (CRITICAL/HIGH fail)
- `ALLOW_REGISTRATION=false` documented in all env examples
- **Status:** ✅ Completed

### Task 7.10 — UAT Checklist ✅

- Created `docs/UAT_CHECKLIST.md` — 8 sections, sign-off table
- **Ops pending:** school admin walkthrough on staging
- **Status:** ✅ Template ready

### Task 7.11 — Release v1.0.0 ✅ (draft)

- Created `docs/RELEASE_NOTES_v1.0.0.md` (draft)
- **Ops pending:** git tag after prod deploy + UAT pass
- **Status:** ✅ Draft ready

### CI Enhancements ✅

- Backend: `--cov-fail-under=25` threshold
- Frontend: new `frontend-test` job (Vitest)
- **Status:** ✅ Completed

### Verification

- [x] 13 backend integration tests pass locally
- [x] 14 frontend Vitest tests pass
- [x] Frontend typecheck passes
- [x] `MASTER_CHECKLIST.md` updated

### Ops follow-up (post sign-off)

- [ ] Run production deploy workflow
- [ ] Configure TLS + `prod-healthcheck.sh` in cron
- [ ] Schedule `prod-backup.sh` cron + one restore test
- [ ] Set `SENTRY_DSN` and verify alert
- [ ] Complete UAT checklist with school admin
- [ ] Tag `v1.0.0` and publish release notes

---

## Phase 8 — Reports Module ✅ SIGNED OFF

**Signed off:** 2026-07-20  
**Objective:** Wire the Reports nav module with real report pages using existing APIs and the `ModuleReportPack` pattern.

### Implemented report routes (8)

| Route | Page | Data source |
|-------|------|-------------|
| `/reports/students` | Student Report | Students list + class/section filters |
| `/reports/attendance` | Attendance Report | `/attendance/report/` |
| `/reports/fees` | Finance & Fees | Due fees + payment search APIs |
| `/reports/examinations` | Exam Report | Exam results roster (read-only) |
| `/reports/finance` | Income & Expense | Trial balance API |
| `/reports/hr` | HR Report | Staff directory |
| `/reports/transport` | Transport & Hostel | Routes, vehicles, hostel rooms |
| `/reports/library` | Library Report | Books catalog + issues |

### Still Coming Soon (2 report nav items)

- Inventory Reports — requires inventory module
- Homework Reports — requires homework module

### Tasks

| ID | Task | Status |
|----|------|--------|
| 8.1 | Create report pages under `features/reports/` | ✅ |
| 8.2 | Add `financeReportsService` + `useTrialBalance` hook | ✅ |
| 8.3 | Wire routes in `admin-routes.tsx` | ✅ |
| 8.4 | Add paths to `IMPLEMENTED_PATHS` (71 total routes) | ✅ |
| 8.5 | Frontend typecheck pass | ✅ |

### Verification

- [x] 8 report pages render with filters, summary KPIs, print, and CSV export
- [x] Coming Soon badges removed from implemented report nav items
- [x] Frontend typecheck passes

---

## Phase 9 — Homework UI ✅ SIGNED OFF

**Signed off:** 2026-07-21  
**Objective:** Wire the Homework nav module to existing academics homework APIs (backend-ready, frontend was Coming Soon).

### Implemented routes

| Route | Page | API |
|-------|------|-----|
| `/homework/assignments` | Homework CRUD + class/section filters | `/academics/homework/` |
| `/homework/daily` | Daily assignment CRUD | `/academics/daily-assignments/` |

### Tasks

| ID | Task | Status |
|----|------|--------|
| 9.1 | Types + `api-endpoints` + `homework.service` | ✅ |
| 9.2 | Hooks with `getApiErrorMessage` | ✅ |
| 9.3 | Homework + Daily Assignment pages (ConfirmDialog) | ✅ |
| 9.4 | Routes + `IMPLEMENTED_PATHS` + RBAC permission keys | ✅ |
| 9.5 | Frontend typecheck | ✅ |

### Notes / follow-ups

- Daily assignment form still uses raw `student_session_id` / `subject_group_subject_id` (no student picker yet).
- Homework evaluations / submit-assignments APIs remain unwired (optional Phase 9b).

---

## Phase 10 — Roles & Users ✅ SIGNED OFF

**Signed off:** 2026-07-21  
**Objective:** Wire Settings → Roles & Permissions and User Accounts to legacy `roles` / `roles_permissions` / `staff_roles` / `users`.

### Implemented routes

| Route | Page | API |
|-------|------|-----|
| `/settings/roles` | Role list + permission matrix editor | `/settings/roles/`, `/settings/roles/<id>/`, `/settings/roles/<id>/permissions/` |
| `/settings/users` | Staff login accounts + role / active toggle | `/settings/users/`, `/settings/users/<id>/`, `/settings/users/role-options/` |

### Tasks

| ID | Task | Status |
|----|------|--------|
| 10.1 | Backend RoleService + UserAccountService | ✅ |
| 10.2 | Settings API views + `HasLegacyPrivilege` (`roles`, `user_status`) | ✅ |
| 10.3 | Frontend types, endpoints, services, hooks | ✅ |
| 10.4 | Roles & Users pages + route wiring | ✅ |
| 10.5 | Unit tests + frontend typecheck | ✅ |

### Notes / follow-ups

- Superadmin role permissions are read-only (cannot be edited).
- `permission_category.short_code = roles` may be absent in older DBs; superadmin still accesses via RBAC bypass. Non-superadmin needs a matching category + `roles_permissions` row.

---

## Phase 11 — Finance Journal & Mapper ✅ SIGNED OFF

**Signed off:** 2026-07-21  
**Objective:** Wire Account Finance → Journal Entries and Account Mapper to existing `cyc_extensions` APIs.

### Implemented routes

| Route | Page | API |
|-------|------|-----|
| `/finance/entries` | Journal list / create / view / delete | `/finance/entries/`, `/finance/entry-types/` |
| `/finance/mapper` | Fee-head ↔ ledger CRUD | `/finance/mapper/` |

### Tasks

| ID | Task | Status |
|----|------|--------|
| 11.1 | Fix entry `items` serialization + cascade delete | ✅ |
| 11.2 | Types, services, hooks for entries + mapper | ✅ |
| 11.3 | Journal Entries + Fee Mapper pages | ✅ |
| 11.4 | Routes + `IMPLEMENTED_PATHS` + RBAC keys | ✅ |
| 11.5 | Frontend typecheck | ✅ |

### Notes / follow-ups

- Chart of Accounts and Finance Reports under `/finance/*` remain Coming Soon (trial balance lives under Reports).
- Next recommended product work: offline bank payments, or ops/UAT + `v1.0.0` tag.

---

## Phase 12 — Offline Bank Payments ✅ SIGNED OFF

**Signed off:** 2026-07-21  
**Objective:** Wire Fees → Offline Bank Payments to legacy `offline_fees_payments` (list / approve / reject).

### Implemented routes

| Route | Page | API |
|-------|------|-----|
| `/fees/offline-payments` | Pending/approved/rejected review + approve/reject | `/fees/offline-payments/`, `.../approve/`, `.../reject/` |

### Tasks

| ID | Task | Status |
|----|------|--------|
| 12.1 | Selector + OfflineBankPaymentService (approve posts deposit) | ✅ |
| 12.2 | API views + `HasLegacyPrivilege` (`offline_bank_payments`) | ✅ |
| 12.3 | Frontend types, service, hooks, page | ✅ |
| 12.4 | Routes + `IMPLEMENTED_PATHS` | ✅ |
| 12.5 | Unit tests + typecheck | ✅ |

### Notes / follow-ups

- Status flags: `0` pending, `1` approved, `2` rejected.
- Approve posts to `student_fees_deposite` when master + fee type IDs are present (idempotent via `offline_payment_id`).

---

## Phase 13 — Chart of Accounts ✅ SIGNED OFF

**Signed off:** 2026-07-21  
**Objective:** Wire Account Finance → Chart of Accounts as a hierarchical view of existing ledger groups + ledgers.

### Implemented routes

| Route | Page | API |
|-------|------|-----|
| `/finance/chart-of-accounts` | Group → ledger hierarchy + search | `/finance/groups/`, `/finance/ledgers/` |

### Tasks

| ID | Task | Status |
|----|------|--------|
| 13.1 | Chart builder + DataTable view | ✅ |
| 13.2 | Routes + `IMPLEMENTED_PATHS` | ✅ |
| 13.3 | Frontend typecheck + ds:audit | ✅ |

### Notes / follow-ups

- CRUD remains on Ledger Groups / Ledgers pages (linked from CoA actions).

---

## Phase 14 — Library ✅ SIGNED OFF

**Signed off:** 2026-07-21  
**Objective:** Wire Library → Book List + Issue & Return against legacy `books` / `book_issues` / `libarary_members`.

### Implemented routes

| Route | Page | API |
|-------|------|-----|
| `/library/books` | Book catalog CRUD | `/library/books/` |
| `/library/issue-return` | Issue / return + members | `/library/issues/`, `/library/members/` |

### Tasks

| ID | Task | Status |
|----|------|--------|
| 14.1 | Books + issues + members services/APIs | ✅ |
| 14.2 | Book List + Issue & Return UI | ✅ |
| 14.3 | Routes + permissions + checklist | ✅ |
| 14.4 | Unit tests + typecheck + ds:audit | ✅ |

### Notes / follow-ups

- `issue_return` seed is view-only; issue/return POST maps to `can_view` (legacy-compatible).
- Library Reports remain Coming Soon.

---

## Phase 15 — Inventory ✅ SIGNED OFF

**Signed off:** 2026-07-21  
**Objective:** Wire Inventory masters + stock + issue against legacy inventory tables.

### Implemented routes

| Route | Page | API |
|-------|------|-----|
| `/inventory/categories` | Category CRUD | `/inventory/categories/` |
| `/inventory/stores` | Store CRUD | `/inventory/stores/` |
| `/inventory/suppliers` | Supplier CRUD | `/inventory/suppliers/` |
| `/inventory/items` | Item catalog | `/inventory/items/` |
| `/inventory/stock` | Stock-in | `/inventory/stock/` |
| `/inventory/issue` | Issue / return | `/inventory/issues/` |

### Tasks

| ID | Task | Status |
|----|------|--------|
| 15.1 | Masters + items + stock/issue services/APIs | ✅ |
| 15.2 | Six inventory UI pages | ✅ |
| 15.3 | Nav RBAC keys (`store`/`supplier`) + routes | ✅ |
| 15.4 | Unit tests + typecheck + ds:audit | ✅ |

### Notes / follow-ups

- Stock-in updates `item.quantity`; issue/return adjust quantity.
- Inventory Reports remain Coming Soon.

---

## Phase 16 — Income & Expense ✅ SIGNED OFF

**Signed off:** 2026-07-21  
**Objective:** Wire Income/Expense heads + cashbook lists against legacy `income*` / `expense*` tables.

### Implemented routes

| Route | Page | API |
|-------|------|-----|
| `/income/heads` | Income head CRUD | `/income/heads/` |
| `/income/list` | Income list CRUD | `/income/` |
| `/expense/heads` | Expense head CRUD | `/expense/heads/` |
| `/expense/list` | Expense list CRUD | `/expense/` |

### Tasks

| ID | Task | Status |
|----|------|--------|
| 16.1 | Heads + income/expense services/APIs | ✅ |
| 16.2 | Four UI pages + permissions | ✅ |
| 16.3 | Routes + checklist | ✅ |
| 16.4 | Unit tests + typecheck + ds:audit | ✅ |

### Notes / follow-ups

- Soft-delete via `is_deleted='yes'`.
- Search screens / document upload / ledger posting deferred.

---

## Phase 17 — Certificates ✅ SIGNED OFF

**Signed off:** 2026-07-22  
**Objective:** Wire Certificate Templates + Generate Certificate (student HTML merge + print).

### Implemented routes

| Route | Page | API |
|-------|------|-----|
| `/certificates/templates` | Template CRUD | `/documents/certificates/` |
| `/certificates/generate` | Merge + print preview | `/documents/certificates/generate/` |

### Tasks

| ID | Task | Status |
|----|------|--------|
| 17.1 | Template CRUD + generate merge service | ✅ |
| 17.2 | Templates + Generate UI | ✅ |
| 17.3 | Nav RBAC keys (`student_certificate`) | ✅ |
| 17.4 | Unit tests + typecheck + ds:audit | ✅ |

### Notes / follow-ups

- Tokens: `[name]`, `[admission_no]`, `[class]`, `[section]`, etc. (also `{{…}}`).
- Student/Staff ID Card screens remain Coming Soon (Phase 18+).
- Next: ID cards, Download Center, or ops/UAT + `v1.0.0` tag.

---

## Phase 18 — ID Cards ✅ SIGNED OFF

**Signed off:** 2026-07-22

| ID | Task | Status |
|----|------|--------|
| 18.1 | Student/Staff ID template CRUD + generate APIs | ✅ |
| 18.2 | Templates + Generate UI (4 screens) | ✅ |
| 18.3 | Nav / `IMPLEMENTED_PATHS` + RBAC keys | ✅ |
| 18.4 | Unit tests (`test_id_card_service`) | ✅ |

### Notes

- Preview returns enabled fields + barcode; print via browser print helper.
- Binary background/logo upload deferred (path strings only).

---

## Phase 19 — Download Center ✅ SIGNED OFF

**Signed off:** 2026-07-22

| ID | Task | Status |
|----|------|--------|
| 19.1 | Content types CRUD API (`content_type`) | ✅ |
| 19.2 | Upload content list/create/delete API (`upload_content`) | ✅ |
| 19.3 | Content Types + Upload Content UI | ✅ |
| 19.4 | Nav RBAC (`content_type` vs `upload_content`) | ✅ |
| 19.5 | Unit tests (`test_download_center_service`) | ✅ |

### Notes

- Video tutorials completed in Phase 25.
- File registration is path/URL metadata (binary upload later).

---

## Phase 20 — Students Categories, Houses & Import ✅ SIGNED OFF

**Signed off:** 2026-07-22

| ID | Task | Status |
|----|------|--------|
| 20.1 | Categories API (`student_categories`) on shared `categories` table | ✅ |
| 20.2 | Houses API (`student_houses`) on `school_houses` | ✅ |
| 20.3 | Import API (`import_student`) CSV rows → `admit_student` | ✅ |
| 20.4 | Categories / Houses / Import UI + IMPLEMENTED_PATHS | ✅ |
| 20.5 | Admission dialog live category + house selects | ✅ |
| 20.6 | Unit tests (`test_student_masters`) | ✅ |

### Notes

- Fee Types keep `/fees/categories/` on the same table.
- Import uses active session enrollment; CSV class_id/section_id required.

---

## Phase 21 — Staff masters, attendance & payroll ✅ SIGNED OFF

**Signed off:** 2026-07-22

| ID | Task | Status |
|----|------|--------|
| 21.1 | Departments + Designations CRUD APIs | ✅ |
| 21.2 | Staff attendance types / roster / mark APIs | ✅ |
| 21.3 | Pay scales + payslips APIs | ✅ |
| 21.4 | Staff Attendance / Payroll / Departments / Designations UI | ✅ |
| 21.5 | Routes + IMPLEMENTED_PATHS + RBAC mappings | ✅ |
| 21.6 | Unit tests (`test_staff_masters`) | ✅ |

### Notes

- Payroll MVP: pay-scale master + generate/list/delete payslips (not full CYC increments).
- Attendance marks active staff (`is_active=1`) for a selected date.

---

## Phase 22 — Subject Attendance + Fees Master / Assign / Carry Forward ✅ SIGNED OFF

**Signed off:** 2026-07-22

| ID | Task | Status |
|----|------|--------|
| 22.1 | Subject attendance periods / roster / mark APIs | ✅ |
| 22.2 | Fees Master UI on fee_session_groups (`/fees/master`) | ✅ |
| 22.3 | Assign Fees to students (`student_fees_master`) | ✅ |
| 22.4 | Carry Forward prior balances into target session | ✅ |
| 22.5 | Routes + IMPLEMENTED_PATHS + RBAC | ✅ |
| 22.6 | Unit tests for validation paths | ✅ |

### Notes

- Subject attendance uses timetable periods for the selected weekday.
- Carry forward writes `student_fees_master` with `is_system=1` against a target Fees Master structure.

---

## Phase 23 — Examinations Templates, Front Office Phone/Purpose, Library Report ✅ SIGNED OFF

**Signed off:** 2026-07-22

| ID | Task | Status |
|----|------|--------|
| 23.1 | Admit card template CRUD (`template_admitcards`) | ✅ |
| 23.2 | Marksheet template CRUD (`template_marksheets`) | ✅ |
| 23.3 | Phone call log CRUD (`general_calls`) | ✅ |
| 23.4 | Visitor purpose CRUD (`visitors_purpose`) + visitor form select | ✅ |
| 23.5 | Library report (catalog + issues) | ✅ |
| 23.6 | Routes, IMPLEMENTED_PATHS, RBAC permissions | ✅ |
| 23.7 | Unit tests (`test_exam_fo_templates`) + frontend typecheck | ✅ |

### Notes

- Admit card model lives under `apps.documents`; marksheet under `apps.examinations`.
- Library Books + Issue/Return were already complete; report clears the remaining Library Coming Soon nav item.
- Legacy privilege categories aligned to seeds: `design_admit_card`, `design_marksheet`, `setup_font_office` (legacy typo), `phone_call_log`.

---

## Phase 24 — Communicate Email / SMS + Bulk Email ✅ SIGNED OFF

**Signed off:** 2026-07-23

| ID | Task | Status |
|----|------|--------|
| 24.1 | Message compose service writing legacy `messages` | ✅ |
| 24.2 | Email / SMS / Bulk Email APIs + RBAC (`email`, `sms`, `login_credentials_send`) | ✅ |
| 24.3 | Send Email / SMS UI + recent log | ✅ |
| 24.4 | Bulk Email to Students UI | ✅ |
| 24.5 | Nav privilege keys fixed (drop fictional `email_sms`) | ✅ |
| 24.6 | Unit tests + routes / IMPLEMENTED_PATHS | ✅ |

### Notes

- MVP queues messages with `sent=0` (audit trail). Live SMTP/SMS delivery waits on Settings email/SMS config.
- Notice Board was already complete; compose does **not** use `send_notification`.

---

## Phase 25 — Download Center Videos + Online Examinations ✅ SIGNED OFF

**Signed off:** 2026-07-23

| ID | Task | Status |
|----|------|--------|
| 25.1 | Video Tutorials CRUD API (`video_tutorial` + class sections) | ✅ |
| 25.2 | Video Tutorials UI + IMPLEMENTED_PATHS | ✅ |
| 25.3 | Question Bank CRUD API (`questions` / `question_bank`) | ✅ |
| 25.4 | Online Exam CRUD API (`onlineexam` / `online_examination`) | ✅ |
| 25.5 | Add/remove exam questions (`add_questions_in_exam`) | ✅ |
| 25.6 | Assign/view/unassign students (`online_assign_view_student`) | ✅ |
| 25.7 | Online Exam + Question Bank UI (manage questions + assign dialogs) | ✅ |
| 25.8 | Unit tests + frontend typecheck | ✅ |

### Notes

- Download Center: Content Types + Upload Content were Phase 19; Phase 25 clears Video Tutorials.
- Online Examinations admin MVP only — student take-exam, evaluation, rank generation, and online exam reports remain backlog.
- Binary video/file upload remains deferred (path/URL metadata).
- RBAC module short code for online APIs: `online_examination` (not traditional `examination`).

---

## Phase 26 — Financial Reports + Alumni ✅ SIGNED OFF

**Signed off:** 2026-07-23

| ID | Task | Status |
|----|------|--------|
| 26.1 | Trial Balance API hardened (date range, totals, closing) | ✅ |
| 26.2 | Balance Sheet + Profit & Loss APIs (`balancesheet`, `profitloss`) | ✅ |
| 26.3 | Ledger Statement + Ledger Entries + Reconciliation (`index`) | ✅ |
| 26.4 | Account Finance report pages + Reports Hub | ✅ |
| 26.5 | Manage Alumni CRUD (`manage_alumni` / `alumni_students`) | ✅ |
| 26.6 | Alumni Events CRUD (`events` / `alumni_events`) | ✅ |
| 26.7 | Alumni Report under Reports (`alumni_report`) | ✅ |
| 26.8 | Nav RBAC fix (`alumni_event` → `events`) + unit tests + typecheck | ✅ |

### Notes

- BS/P&L classify ledgers by walking `cyc_groups` to root name (Assets/Liabilities/Income/Expenses).
- Sidebar keys `ledgerstatement` / `ledgerentries` / `reconciliation` are not seeded as categories; APIs gate with `index`.
- Alumni Events privilege short_code is `events` (seed), not `alumni_event`.
- Reports → Income & Expense still shows trial balance for operational reports nav (unchanged path).

---

## Phase 27 — Reports gaps + Lead Management + Front CMS ✅ SIGNED OFF

**Signed off:** 2026-07-23

| ID | Task | Status |
|----|------|--------|
| 27.1 | Inventory Reports page (stock / items / issues) | ✅ |
| 27.2 | Homework Reports page (homework + daily assignments) | ✅ |
| 27.3 | Lead Management APIs (leads, campaigns, follow-ups, statuses, promoters, report) | ✅ |
| 27.4 | Lead Management UI (all 7 nav items) | ✅ |
| 27.5 | Front CMS APIs (events, gallery, media, notices, pages, menus, banners, settings) | ✅ |
| 27.6 | Front CMS UI (all 8 nav items) | ✅ |
| 27.7 | Nav privilege alignment + unit tests + typecheck | ✅ |

### Notes

- Reports Inventory/Homework compose existing inventory & academics APIs (no new report endpoints).
- Campaign Types uses distinct `l_source` values (no `cyc_campaign_type` table in schema).
- Promoters map to `cyc_leads_counsellor` (campaign staff assignments).
- CMS Banners use `front_cms_programs` with `type=banner`; Notices use `front_cms_pages` with `type=notice`.
- CMS Settings privilege lives under `system_settings` / `front_cms_setting`.
- Financial Reports restored as a **separate top-level sidebar module** (legacy menu `finance_reports`), sibling to Account Finance — not flattened under Account Finance / not renamed to Reports Hub.

---

## Phase 28 — Settings system config ✅ SIGNED OFF

**Signed off:** 2026-07-23  
**Objective:** Complete unfinished Settings submenus for notification templates, SMS/email gateways, payment methods, and print header/footer — preserving legacy privilege categories under `system_settings`.

| ID | Task | Status |
|----|------|--------|
| 28.1 | Notification Settings API + UI (list/filter/CRUD, channel toggles) | ✅ |
| 28.2 | SMS Config API + UI (CRUD + activate; secrets masked) | ✅ |
| 28.3 | Email Config API + UI (CRUD + activate; secrets masked) | ✅ |
| 28.4 | Payment Methods API + UI (CRUD + activate under `payment_methods`) | ✅ |
| 28.5 | Print Header & Footer API + UI (`print_header_footer`) | ✅ |
| 28.6 | Nav privilege fix (`print_header_footer`), routes, implemented-paths | ✅ |
| 28.7 | Unit tests + frontend typecheck + Docker verification | ✅ |

### Implementation details

| Submenu | Privilege | Table | Endpoints |
|---------|-----------|-------|-----------|
| Notifications | `notification_setting` | `notification_setting` | `/settings/notification-settings/` |
| SMS Config | `sms_setting` | `sms_config` | `/settings/sms-config/` (+ activate) |
| Email Config | `email_setting` | `email_config` | `/settings/email-config/` (+ activate) |
| Payment Methods | `payment_methods` | `payment_settings` | `/settings/payment-methods/` (+ activate) |
| Print Header & Footer | `print_header_footer` | `print_headerfooter` | `/settings/print-header-footer/` |

### Testing status

- Backend: `apps/settings/tests/test_system_config_services.py` — validation, not-found, active-delete guards, secret masking helpers
- Frontend: `npm run typecheck` pass (host + Docker with `NODE_OPTIONS=--max-old-space-size=768`)
- Docker: `docker compose -f docker-compose.dev.yml` — mysql/redis/backend healthy; backend pytest 16 passed; frontend serves HTTP 200 on `:5173`; health endpoint OK

### Notes

- Secrets (`authkey`, `password`, SMTP password, API keys, gateway salts) are masked on read; blank/masked values on update keep the stored secret.
- SMS uses legacy `enabled`/`disabled`; email & payment use `yes`/`no`.
- Fees → Payment Gateways remains a read-only fees-module list (`offline_bank_payments`); Settings → Payment Methods is the writable config under `system_settings`.
- Residual Settings Soon items (modules, custom fields, captcha, backup, etc.) are intentionally deferred.

---

## Roadmap Complete ✅

Phases 0–28 signed off for implemented scope. Remaining work is **operational** (prod deploy, UAT) and residual backlog (remaining Settings screens, student online exam attempt, binary uploads, etc.).
