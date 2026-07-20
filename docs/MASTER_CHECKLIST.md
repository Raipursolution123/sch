# School ERP — Master Implementation Checklist

**Last updated:** 2026-07-20  
**Current phase:** Phase 1 — Merge & Branch Stabilization  
**Branch:** `main` @ `ac34a54`

---

## Project Dashboard

| Metric | Value |
|--------|-------|
| **Overall Project Progress** | 20% |
| **Current Phase** | Phase 1 (verification) |
| **Current Task** | Confirm CI green on `main` |
| **Completed Phases** | Phase 0 ✅ |
| **Remaining Phases** | 1 (sign-off pending), 2–7 |
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
| 1.1 | Commit Phase 0 security work on merge branch | ✅ Completed | `ac34a54` |
| 1.2 | Merge `merge/feature-academics-fees-into-main` → `main` | ✅ Completed | Fast-forward |
| 1.3 | Resolve conflicts / stray changes | ✅ Completed | `auth/__init__.py` restored |
| 1.4 | Run local verification (pytest + typecheck) | ✅ Completed | 7/7 + typecheck pass |
| 1.5 | Push `main` to origin | ✅ Completed | `50a754b..ac34a54` |
| 1.6 | Confirm CI green on `main` | 🔄 In Progress | Awaiting GitHub Actions |

### Acceptance Criteria

- [x] Single `main` branch contains finance + roadmap + Phase 0 security
- [x] No uncommitted work on `main`
- [x] Backend unit tests pass
- [x] Frontend typecheck passes
- [ ] CI passes on pushed `main`

---

## Phases 2–7

**Status:** ❌ Not Started

---

## Next Recommended Task

Complete Phase 1 merge commit, push `main`, verify CI.
