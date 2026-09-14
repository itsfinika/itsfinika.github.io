# MindBridge - smoke plan and regression reference

I prepared this smoke plan as a guided exercise for the fictional MindBridge portal. I refined the setup and expected outcomes for the ten smoke checks. The separate 50-item regression inventory comes from the course and is included as reference material. These files contain no execution results or evidence of an import into a test-management tool.

## Smoke setup

Each smoke check is independent. Restore its required account/session state before starting; do not depend on the previous row. The fixture aliases below describe data to prepare or confirm in the lab, not records claimed to exist already. Keep working credentials outside public files.

| Fixture | Required state |
| --- | --- |
| LEARNER | A registered learner whose profile name is known, with COURSE not yet in the enrollment list. |
| COURSE | A published course with a known ID and title containing Testing. Record both values before execution. |
| HISTORY | A learner with known enrollment and mock-payment entries. Record the expected entries and enrolled courses. |

Confirm the lab URL and build. The course example uses http://localhost:3000. For login checks start signed out; for protected pages sign in with the named fixture. Remove newly added selections and restore the original session state after each check.

## Scope and decisions

The smoke sample covers availability, authentication, course navigation/search, adding a course and dashboard access. It does not cover a complete mock-payment flow. For a release affecting checkout/payment, add that critical path before relying on this pack for a release decision.

These are proposed checks with expected outcomes, not Pass/Fail records. The 50 reference priorities come from the course dataset; they are not presented as a new risk assessment. A release-specific selection needs the change scope, likely failures and their impact.

## Reference questions

| Reference IDs | Point to confirm before execution |
| --- | --- |
| REG-002, REG-003, REG-004 | The source calls these Login checks while describing new-password rules. Confirm whether they belong to registration, password change or authentication. |
| REG-007 | Confirm whether more than three search keywords is an actual rule or just example data. |
| REG-049 | Confirm the role matrix before assuming admins are denied student-only routes. Include student-to-admin restrictions where required. |
| REG-034, REG-035; SMK-008 | Confirm the distinction between enrolled courses and Grades. The smoke case checks known enrolled-course data without prescribing an unconfirmed section label. |

## File IDs and source

REG-001 through REG-050 retain the order, areas, titles and priorities of the course inventory. They correspond to its original TC-001 through TC-050. SMK-001 through SMK-010 identify the smoke CSV rows separately, so the same ID cannot mean different checks. Student Profile keeps its separate TC-SP IDs.

The CSV files contain planned checks and reference material, not execution results.
