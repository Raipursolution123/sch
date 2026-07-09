# Design System Changelog

Enterprise School ERP UI — Wise-inspired visual DNA, productivity-first.

## 0.6.1 — Phase 6 completion: remaining modules + RBAC

### Added
- **`ModuleSettingsPack`** — tabbed settings shell with page header (General Settings)
- **`academics.manage`** permission for classes, sections, subjects, and class-section CRUD

### Migrated
- General Settings page + all tab forms (`FormSelectField`, `PermissionButton`, unsaved-changes guard)
- `FeeAssignmentFormDialog` → `EntityFormDialog` with line-item field array
- `StaffDocumentUploadDialog` → `EntityFormDialog` + `FormFileField`
- Fee module table row actions → `fees.manage`
- Academics module page actions + table row actions → `academics.manage`
- Auth/marketing/error pages → design tokens (`HomePage`, `AuthLayout`, `NotFoundPage`)

### Fixed
- `FormTimeFieldProps` lint (`no-empty-object-type`)
- **DataTable layout** — intrinsic-width columns (`w-max min-w-full`), horizontal scroll viewport, removed spacer/sticky column hacks; column bounds via `minWidth`/`maxWidth` meta only

---

## 0.6.0 — Phase 6: Workflow packs + governance

### Added
- **Workflow packs** (`src/workflow-packs/`): composable module layouts
  - `ModuleListPack` — list screens with DataTable
  - `ModuleMarkGridPack` — attendance-style filter + grid
  - `ModuleReportPack` — reports with print/CSV
  - `ModuleProfilePack` — tabbed entity profiles
  - `ModuleSettingsPack` — tabbed settings configuration
- **Pack registry** cataloguing P0/P1 school workflows
- **Governance**: `DESIGN_SYSTEM_BAN_LIST`, `CONTRIBUTION_RFC_CHECKLIST`, `ds:audit` script
- **CI**: design system audit step in frontend lint job

### Migrated to packs
- Students list → `ModuleListPack`
- Student profile → `ModuleProfilePack`
- Mark attendance → `ModuleMarkGridPack`
- Attendance report → `ModuleReportPack`
- Fee assign → `ModuleListPack`

---

## 0.5.0 — Phase 5: RBAC + workflows + notifications

- `PermissionButton`, `PermissionGate`, `FieldAccess`
- Exam publication approval (`ExamApprovalPanel`)
- Notification center drawer from AppShell bell
- Role → permission map (`ROLE_PERMISSIONS`)

## 0.4.0 — Phase 4: Dashboard + reports kit

- `ReportHeader`, `ReportFilterBar`, `ReportSummaryGrid`, `ReportPrintShell`
- `ChartPanel` for dashboard charts
- Attendance report print + CSV export

## 0.3.0 — Phase 3: Enterprise DataTable

- TanStack Table integration, density toggle, sticky columns
- Migrated Students, Staff, Sessions, Classes, Sections

## 0.2.0 — Phase 2: Forms + feedback

- `FormField`, `FormSection`, `EntityFormDialog`
- RHF + Zod field wrappers, unsaved changes guard

## 0.1.0 — Phase 1: AppShell

- Collapsible sidebar, breadcrumbs, module switcher, top bar

## 0.0.1 — Phase 0: Tokens + theme

- `tokens.css`, themed shadcn primitives, `design-rules.ts`
