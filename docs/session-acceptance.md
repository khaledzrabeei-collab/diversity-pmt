# Session acceptance evidence

The authenticated browser suite targets only the guarded disposable loopback Supabase instance. CI changes its local JWT lifetime from 3600 to 120 seconds before starting that instance; the tracked configuration and hosted Auth settings retain their existing lifetime. The test fails if the issued token is not short-lived, rather than waiting against an unintended environment.

## Real expiry and refresh

The test signs in, confirms an assigned project is visible, reads only the expiry claim from the session cookie in test memory, and waits past the real signed token's expiration without mocking time. It reloads the protected workspace, requires the same authorized project to remain visible, and requires an increased token expiry in the updated cookie. Tokens are not printed or uploaded; authenticated traces remain disabled.

## Account suspension

A separate synthetic account signs in successfully. The test operator suspends it for 24 hours through Supabase Admin, then requires the existing browser session to return to login on reload. A subsequent password login must fail with the generic application error. The real owner account is never used or changed.

## Scope

The first expiry run (41337890138) used a 60-second lifetime and failed with refresh-token reuse errors. Inspection of the installed Auth SDK confirmed its 90-second early-refresh margin. The corrected fixture uses 120 seconds so a newly issued token is outside that margin. Eleven browser cases, including suspension, passed in that initial run; expiry acceptance requires the corrected run to pass.

These checks supplement passing logout across tabs, project-assignment revocation, account deletion and browser-context isolation tests. They do not establish CDN/cache isolation on hosted infrastructure, immediate removal of already-rendered content from an idle page, or revocation behavior for every direct API with an already-issued JWT. Full hosted security acceptance remains separate.

## Verified result

Both CI jobs passed for commit 732c56e in [run 41338520126](https://github.com/khaledzrabeei-collab/diversity-pmt/actions/runs/41338520126). Real expiry/refresh and suspended-session rejection passed alongside the existing browser checks and application-data restore rehearsal. This closes the disposable-environment expiry and suspension checks; hosted cache validation and production acceptance remain open. No hosted configuration or application deployment changed.
