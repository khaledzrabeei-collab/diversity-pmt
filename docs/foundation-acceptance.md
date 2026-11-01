# Foundation acceptance status

Status: protected staging candidate. Production release and business-module acceptance remain open.

## Confirmed evidence

- Owner explicitly confirmed: sign out, sign back in using the chosen password, and the created project remains visible.
- Read-only hosted checks found one confirmed/sign-in account, one administrator, one project and its creation audit event.
- CI evidence and exact tested revisions are recorded in verification.md and staging-rollout.md. Coverage includes compilation, unit tests, actual PostgreSQL authorization, invitation/password setup, rejected signup, viewer restrictions, assignment revocation, logout across tabs, cache headers and mobile/keyboard checks.
- Hosted smoke checks verified health, login, no-store/no-referrer headers and unauthenticated workspace redirection.
- Hardening commit `0e113b2` passed CI run 41332190740. Its additive indexes were applied to staging and the three missing-index advisor findings cleared. Hosted Auth now matches the application's 12-character password minimum; post-change checks confirmed the account, administrator membership and project remain present.
- Source exports remain private and unchanged; no financial/indicator calculations or source-data import has been implemented.

## Outstanding acceptance items

| Item | Required evidence/decision |
|---|---|
| F-03b session behavior | Real token expiry/refresh, suspended-account behavior and hosted cache isolation beyond response headers |
| F-08 operational readiness | Disposable application-data restore passed (recovery-rehearsal.md); complete hosted recovery, rollback rehearsal, approved recovery objectives, configured GitHub environment reviewers/secrets and tested automated release path remain open |
| F-09 accessibility | Full visual/contrast and screen-reader review; existing keyboard/viewport tests are partial evidence |
| Hosted password security | Leaked-password protection is disabled and needs a plan/security decision; no paid upgrade authorized |
| Email delivery | Custom SMTP or approved manual invitation delivery; default free email provider rejected custom templates |
| Access model | Owner approval of organization/project role mapping and migration differences D-02/D-03 |
| Domain/source decisions | Approved original workbooks, unresolved targets/units/budget differences, provenance and migration mappings before module work |

The owner's successful login review is recorded as evidence for F-03/F-07 and the staging smoke-test portion of F-08 only. It is not a blanket approval, formula approval, authorization to import original data, or production sign-off.

Stage 2 source intake and subsequent modules remain deferred under the original foundation-only scope. Their acceptance gates are defined in testing.md and implementation-plan.md.

## Free-plan development follow-up

Development continues without paid upgrades. No business modules or hosted user changes are included in this follow-up. Vercel Hobby eligibility for organizational use remains unresolved; do not infer eligibility from nonprofit status or treat a staging deployment as approval for operational hosting.

The browser suite now includes isolated browser contexts accessing the same workspace route and rejection of an existing session after its disposable account is deleted. This is local production-build coverage, not proof of hosted cache behavior, suspended-account handling or real token expiry.

Both CI jobs passed for final commit `fac11c8` in [run 41336200229](https://github.com/khaledzrabeei-collab/diversity-pmt/actions/runs/41336200229), including the added session test and contrast changes. Local typecheck also passed. The contrast changes are committed but not redeployed to hosted staging while hosting eligibility remains unresolved. No paid services were enabled.

Static sRGB contrast review found muted text on paper at 4.41:1, planned labels at 3.69:1, module numbers at 3.81:1 and focus outlines on white at 2.53:1. Corrected text uses #526762: paper 5.60:1, white 6.04:1, module background 5.86:1. Focus uses #9a6215: white 5.08:1 and paper 4.71:1. These measurements cover the identified solid-color pairs only; full visual and screen-reader review remains open.
