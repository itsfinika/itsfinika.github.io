# MindBridge registration - exploratory session notes

Polina Zheltoshtan's recorded observations from a guided course lab using MindBridge, a fictional learning portal. This portfolio edition separates four behaviours described in the original three findings. It adds no new execution results.

## Session context

- Date: 31 August 2026.
- Duration: approximately 9 minutes of recorded execution, within a 15-minute course charter.
- Lab address: http://localhost:3000. This is a local test environment, not a public demo.
- Charter: explore registration input validation and state changes.
- Approach: repeated input/submission, interruption through browser Back, and whitespace-only input.
- Evidence available: written session notes. Browser, OS, build identifier and screenshots are not recorded in the supplied material. The observations below describe the visible UI, not database or network verification.

## Duplicate email rejected

| Field | Observation |
| --- | --- |
| Action | Attempted registration with the already registered email learner.lab+01@example.com. |
| Expected | Reject the existing email with a clear message. |
| Observed | The application displayed Email already registered. |
| Result | Behaviour matched the exercise expectation. No defect confirmed. |

## Rapid submission response

| Field | Observation |
| --- | --- |
| Action | Completed registration with learner.lab+02@example.com and selected Create account several times rapidly. |
| Expected | Create no more than one account and complete without a server failure. |
| Observed | The Dashboard opened. No duplicate account or server error was visible in the UI. |
| Limitation | The notes do not record the click count, request count or stored account count. Duplicate creation and server-side errors were not independently ruled out. |

## Password state after browser Back

| Field | Observation |
| --- | --- |
| Action | Entered a valid password at Step 2, continued to Step 3, then used browser Back. |
| Expected | The password remains available on returning to Step 2, as specified by the course exercise. |
| Observed | The entered password value was retained. |
| Result | Behaviour matched this exercise's expectation. No defect confirmed. |

## Whitespace-only name rejected

| Field | Observation |
| --- | --- |
| Action | Entered three spaces in Name at Step 3 and selected Create account. |
| Expected | Reject a whitespace-only name and block registration. |
| Observed | Registration was blocked with Name must be at least 2 characters. |
| Result | Invalid input was rejected. No defect confirmed. |

## Session outcome

No defects were confirmed in this short session. Duplicate-email rejection, browser Back state and whitespace validation matched the exercise expectations. Rapid submission reached the Dashboard, but its server-side outcome needs further evidence.

## Follow-up checks

1. Record the lab build, browser, OS and reset state before a new run.
2. Repeat rapid submission with a defined click count and network throttling. Capture requests and responses; verify the stored account count if the lab provides access.
3. Compare the lab version with the course's known-defect reference and record the result of a fresh run separately.

## Course context

The exercise supplied a charter, heuristics and a known-defect solution key. Its duplicate-registration, password-loss and whitespace-name defects were not reproduced in the recorded session. A different lab build is a possible explanation, not a confirmed cause. The original notes contain the course self-assessment; this edition focuses on actions, observations and limits of the evidence.
