# MindBridge Student Profile - five test cases

Test-design practice by Polina Zheltoshtan, based on scenarios and reference examples from a guided software testing course. MindBridge is a fictional learning portal. These cases are authored, not executed.

## Shared fields and conventions

- Use a dedicated learner account, authenticated on the profile edit page with no unsaved changes.
- Baseline: First name = Grace; Last name = Hopper; Bio = Learning software testing.; Weekly Digest Emails = selected; default avatar.
- Each case starts independently from this baseline. Restore it after the case using the application's supported reset controls.
- Test files are included in the ZIP: fixtures/profile_valid.png is a 316-byte PNG showing a blue-and-gold square; fixtures/profile_invalid.txt is a 62-byte plain-text file.
- Course fields: Issue Type = Test; Priority = Medium; Labels = student-profile, sc10. TC-SP IDs identify this exercise, not Jira issues.
- Environment: the reference page is /profile/edit. Confirm the lab base URL and build before execution. No execution results are assigned to this revision.

## Requirement traceability

| Case | Rule covered from the exercise |
| --- | --- |
| TC-SP-01 | First name, last name and bio can be edited and persist after saving. |
| TC-SP-02 | A PNG or JPEG profile photo under the stated 2 MB limit can be saved. |
| TC-SP-03 | First name is required; an empty value must not replace the saved name. |
| TC-SP-04 | Unsupported photo file types are rejected. |
| TC-SP-05 | Weekly Digest Emails preference persists after saving. |

Open questions before execution: confirm the photo-validation trigger and the exact byte boundary intended by 2 MB. The supplied photo files are well below either common interpretation of that limit. The expected message meaning is specified; exact wording is not prescribed. Requirement links must refer to this exercise's rules rather than reused IDs from a different course task.

## TC-SP-01 - Edit profile information

**Goal:** Save changes to first name, last name and bio, then verify persistence.

**Precondition:** The shared baseline is restored and the profile edit page is open.

| # | Step | Test Data | Expected Result |
| --- | --- | --- | --- |
| 1 | Replace First name. | Ada | First name displays Ada. |
| 2 | Replace Last name. | Lovelace | Last name displays Lovelace. |
| 3 | Replace Bio. | Lifelong learner exploring data analytics. | Bio displays the entered text. |
| 4 | Select Save changes. | - | A visible confirmation reports that the profile was saved. |
| 5 | Reload the profile edit page. | - | First name, last name and bio retain all three new values. |

## TC-SP-02 - Save a valid profile photo

**Goal:** Save a supported image and verify that it remains the profile photo after reload.

**Precondition:** The shared baseline is restored; the default avatar is shown and the valid fixture is available locally.

| # | Step | Test Data | Expected Result |
| --- | --- | --- | --- |
| 1 | Use Upload Photo to choose and confirm the valid file. | fixtures/profile_valid.png | The application accepts the selection and identifies the selected image through a filename or preview. |
| 2 | Select Save changes. | - | A visible confirmation reports a successful save. |
| 3 | Reload the profile edit page. | - | The saved avatar shows the fixture's blue-and-gold square. |

## TC-SP-03 - Reject an empty first name

**Goal:** Reject an empty required field without overwriting the saved name.

**Precondition:** The shared baseline is restored; First name is Grace and the other fields are valid.

| # | Step | Test Data | Expected Result |
| --- | --- | --- | --- |
| 1 | Clear First name. | Empty string; zero characters, not spaces. | First name contains no text. |
| 2 | Select Save changes. | - | A visible validation message identifies First name as required. |
| 3 | Reload the profile edit page. | - | First name is still Grace; the empty value was not saved. |

## TC-SP-04 - Reject an unsupported photo file

**Goal:** Reject a text file without changing the saved profile photo.

**Precondition:** The shared baseline is restored; the default avatar is shown and the invalid fixture is available locally. Its size is below the limit, isolating file-type validation.

| # | Step | Test Data | Expected Result |
| --- | --- | --- | --- |
| 1 | Use Upload Photo to choose and confirm the unsupported file. | fixtures/profile_invalid.txt | A visible validation message identifies the file type as unsupported. |
| 2 | Reload the profile edit page. | - | The default avatar remains; the text file did not replace the saved photo. |

**Execution note:** Selection-time validation follows the course example and needs requirement confirmation. If the native file chooser prevents selection, mark this application-validation case Blocked. If the agreed requirement validates on Save, update the trigger before running the case.

## TC-SP-05 - Save notification preferences

**Goal:** Disable Weekly Digest Emails and verify that the preference persists.

**Precondition:** The shared baseline is restored; Weekly Digest Emails is selected and all profile fields are valid.

| # | Step | Test Data | Expected Result |
| --- | --- | --- | --- |
| 1 | Deselect Weekly Digest Emails. | Disabled | The checkbox is unselected. |
| 2 | Select Save changes. | - | A visible confirmation reports a successful save. |
| 3 | Reload the profile edit page. | - | Weekly Digest Emails remains unselected. |

This case covers saving the preference. Email delivery is outside its scope.

## Scope and sources

This is a five-scenario coursework sample: three positive cases and two negative cases. It is not complete coverage of the profile feature. Oversized uploads, exact size boundaries, whitespace-only names and re-enabling notifications are possible extensions after confirming requirements.

The scenarios and reference examples came from the course's Test_Scenarios.md, Gold_Standard_Test_Case.md, Gold_Standard_Description.txt and the Write 5 Test Cases in Zephyr activity. This portfolio edition presents the authored cases with concise steps, independent setup and bundled fixtures. It does not claim a completed Jira import or test execution.
