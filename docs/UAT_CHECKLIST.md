# UAT Checklist — School ERP v1.0

**Environment:** Staging (`https://school.raipursolutions.com`) or production dry-run  
**Tester role:** School admin / front-office staff  
**Sign-off date:** _______________  
**Tester name:** _______________

Mark each item **Pass / Fail / N/A** and note blockers in the Remarks column.

---

## 1. Authentication & Access

| # | Scenario | Pass | Fail | N/A | Remarks |
|---|----------|:----:|:----:|:---:|---------|
| 1.1 | Login with valid staff credentials | | | | |
| 1.2 | Login fails with wrong password | | | | |
| 1.3 | Logout clears session; protected routes redirect to login | | | | |
| 1.4 | User without permission sees denied state (not blank crash) | | | | |
| 1.5 | Registration endpoint disabled in production/staging | | | | |

---

## 2. Academics Setup

| # | Scenario | Pass | Fail | N/A | Remarks |
|---|----------|:----:|:----:|:---:|---------|
| 2.1 | View / switch active academic session | | | | |
| 2.2 | Create or edit class | | | | |
| 2.3 | Create or edit section | | | | |
| 2.4 | Assign class–section mapping | | | | |
| 2.5 | Subject and subject group CRUD | | | | |

---

## 3. Student Lifecycle

| # | Scenario | Pass | Fail | N/A | Remarks |
|---|----------|:----:|:----:|:---:|---------|
| 3.1 | List students (paginated) | | | | |
| 3.2 | Admit new student with class/section | | | | |
| 3.3 | View student profile | | | | |
| 3.4 | Disable student with reason | | | | |
| 3.5 | Promote students to next session | | | | |

---

## 4. Fees

| # | Scenario | Pass | Fail | N/A | Remarks |
|---|----------|:----:|:----:|:---:|---------|
| 4.1 | Fee types and fee groups configured | | | | |
| 4.2 | Assign fees to class | | | | |
| 4.3 | Fee collect roster loads for class/section | | | | |
| 4.4 | Record a fee payment | | | | |
| 4.5 | Due fees search returns expected students | | | | |

---

## 5. Attendance & Leave

| # | Scenario | Pass | Fail | N/A | Remarks |
|---|----------|:----:|:----:|:---:|---------|
| 5.1 | Mark attendance roster for class/date | | | | |
| 5.2 | Save attendance marks | | | | |
| 5.3 | Approve leave list loads; approve/reject works | | | | |

---

## 6. Front Office

| # | Scenario | Pass | Fail | N/A | Remarks |
|---|----------|:----:|:----:|:---:|---------|
| 6.1 | Visitor book CRUD | | | | |
| 6.2 | Complaints CRUD | | | | |
| 6.3 | Postal dispatch / receive CRUD | | | | |
| 6.4 | Enquiry list and create | | | | |

---

## 7. Transport & Hostel

| # | Scenario | Pass | Fail | N/A | Remarks |
|---|----------|:----:|:----:|:---:|---------|
| 7.1 | Transport routes, vehicles, pickup points | | | | |
| 7.2 | Route pickup point assignment | | | | |
| 7.3 | Hostel buildings, rooms, room types | | | | |

---

## 8. Operations & Non-Functional

| # | Scenario | Pass | Fail | N/A | Remarks |
|---|----------|:----:|:----:|:---:|---------|
| 8.1 | HTTPS certificate valid; no mixed-content warnings | | | | |
| 8.2 | `/health/` and `/health/ready/` return OK after deploy | | | | |
| 8.3 | Page load acceptable on school network (< 3s dashboard) | | | | |
| 8.4 | Backup script run; restore verified once | | | | |
| 8.5 | Sentry (or logs) capture a test error | | | | |

---

## Sign-off

| Role | Name | Signature | Date |
|------|------|-----------|------|
| School admin | | | |
| Tech lead | | | |

**UAT result:** ☐ Approved for release &nbsp; ☐ Blocked — see remarks

**Open P0/P1 bugs at sign-off:** _______________
