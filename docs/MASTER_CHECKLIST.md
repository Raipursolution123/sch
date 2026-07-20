# School ERP — Master Implementation Checklist

**Last updated:** 2026-07-20  
**Current phase:** Phase 1 — Merge & Branch Stabilization  
**Branch:** `main` (post-merge)

---

## Project Dashboard

| Metric | Value |
|--------|-------|
| **Overall Project Progress** | 18% |
| **Current Phase** | Phase 1 |
| **Current Task** | Merge finance branch + Phase 0 security to `main` |
| **Completed Phases** | Phase 0 ✅ |
| **Remaining Phases** | 1 (in progress), 2–7 |
| **Open Bugs** | 0 |
| **Backend Completion** | ~58% |
| **Frontend Completion** | ~45% |
| **API Integration Status** | Core spine + finance partial |
| **UI Completion Status** | 59 real routes / ~145 nav items |
| **Testing Status** | Unit + typecheck pass |
| **Production Readiness** | Not ready — Phases 1–7 remain |
| **Technical Debt Remaining** | CI lint scope, model-only apps, ~90 Coming Soon pages |

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
| 1.1 | Commit Phase 0 security work on merge branch | 🔄 In Progress | |
| 1.2 | Merge `merge/feature-academics-fees-into-main` → `main` | ❌ Not Started | |
| 1.3 | Resolve conflicts / stray changes | ❌ Not Started | |
| 1.4 | Run local verification (pytest + typecheck) | ❌ Not Started | |
| 1.5 | Push `main` to origin | ❌ Not Started | |
| 1.6 | Confirm CI green on `main` | ❌ Not Started | |

### Acceptance Criteria

- [ ] Single `main` branch contains finance + roadmap + Phase 0 security
- [ ] No uncommitted work on `main`
- [ ] Backend unit tests pass
- [ ] Frontend typecheck passes
- [ ] CI passes on pushed `main`

---

## Phases 2–7

**Status:** ❌ Not Started

---

## Next Recommended Task

Complete Phase 1 merge commit, push `main`, verify CI.
