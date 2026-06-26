# Final ER Landscape

**Generated:** 2026-06-25 14:28 UTC
**Scope:** Domain-level entity landscape (280 tables across 23 domains)

## Domain map

```mermaid
flowchart TB
    accounts["accounts<br/>11 tables"]
    students["students<br/>21 tables"]
    academics["academics<br/>22 tables"]
    staff["staff<br/>16 tables"]
    attendance["attendance<br/>1 tables"]
    fees["fees<br/>16 tables"]
    examinations["examinations<br/>45 tables"]
    library["library<br/>3 tables"]
    transport["transport<br/>6 tables"]
    hostel["hostel<br/>2 tables"]
    admissions["admissions<br/>4 tables"]
    lms["lms<br/>14 tables"]
    settings["settings<br/>18 tables"]
    communications["communications<br/>21 tables"]
    cms["cms<br/>9 tables"]
    inventory["inventory<br/>6 tables"]
    frontoffice["front_office<br/>7 tables"]
    documents["documents<br/>4 tables"]
    shared["shared<br/>7 tables"]
    alumni["alumni<br/>2 tables"]
    hr["hr<br/>2 tables"]
    cycextensions["cyc_extensions<br/>35 tables"]
    system["system<br/>8 tables"]

    examinations -->|18 FKs| academics
    examinations -->|10 FKs| students
    communications -->|10 FKs| staff
    academics -->|10 FKs| staff
    students -->|6 FKs| fees
    communications -->|5 FKs| students
    shared -->|5 FKs| staff
    academics -->|5 FKs| students
    fees -->|5 FKs| academics
    students -->|4 FKs| attendance
    students -->|4 FKs| academics
    students -->|4 FKs| transport
    communications -->|3 FKs| academics
    shared -->|3 FKs| academics
    frontoffice -->|3 FKs| staff
    fees -->|3 FKs| students
    admissions -->|3 FKs| settings
    alumni -->|2 FKs| academics
    staff -->|2 FKs| communications
    shared -->|2 FKs| accounts
    lms -->|2 FKs| students
    inventory -->|2 FKs| staff
    lms -->|2 FKs| staff
    hr -->|2 FKs| staff
    settings -->|2 FKs| accounts
    staff -->|2 FKs| hr
    alumni -->|1 FKs| students
    frontoffice -->|1 FKs| academics
    cms -->|1 FKs| accounts
    shared -->|1 FKs| frontoffice
    fees -->|1 FKs| admissions
    hostel -->|1 FKs| settings
    accounts -->|1 FKs| communications
    fees -->|1 FKs| staff
    admissions -->|1 FKs| academics
    admissions -->|1 FKs| hostel
    lms -->|1 FKs| academics
    examinations -->|1 FKs| staff
    shared -->|1 FKs| students
    accounts -->|1 FKs| staff
```

## Hub domains

| Domain | Outbound FKs | Inbound FKs | Role |
|--------|-------------|-------------|------|
| accounts | 3 | 5 | Module |
| students | 21 | 28 | Reference hub |
| academics | 15 | 40 | Reference hub |
| staff | 4 | 38 | Reference hub |
| attendance | 0 | 4 | Module |
| fees | 10 | 6 | Module |
| examinations | 29 | 0 | Module |
| library | 0 | 0 | Module |
| transport | 1 | 4 | Module |
| hostel | 1 | 2 | Module |
| admissions | 5 | 1 | Module |
| lms | 5 | 1 | Module |
| settings | 2 | 4 | Module |
| communications | 18 | 3 | Module |
| cms | 1 | 0 | Module |
| inventory | 2 | 0 | Module |
| front_office | 5 | 1 | Module |
| documents | 0 | 1 | Module |
| shared | 13 | 0 | Module |
| alumni | 3 | 0 | Module |
| hr | 2 | 2 | Module |
| cyc_extensions | 0 | 0 | Module |
| system | 0 | 0 | Module |

## Domain clusters

- **Identity & access:** accounts, settings (partial)
- **Academic core:** academics, students, staff, attendance
- **Financial:** fees, students (student_fees*), cyc_extensions (ledgers)
- **Assessment:** examinations, lms (quizzes)
- **Operations:** transport, hostel, library, inventory, front_office
- **Engagement:** communications, cms, alumni, admissions
- **Extensions:** cyc_extensions (35 custom tables)
- **Platform:** system, shared, documents