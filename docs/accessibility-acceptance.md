# Accessibility acceptance

Foundation accessibility remains partially verified, not certified compliant.

Commit `2332b67` passed both CI jobs in [run 41339320226](https://github.com/khaledzrabeei-collab/diversity-pmt/actions/runs/41339320226). The selected scans reported zero violations, and the keyboard skip-link focus test passed. Local typechecking also passed. These changes have not been redeployed to hosted staging pending hosting eligibility clarification.

## Automated coverage

The authenticated Playwright suite uses pinned development dependency `@axe-core/playwright` 4.14.0. It requires no detected violations for the WCAG 2 A/AA, 2.1 A/AA and 2.2 AA rule tags on the login view at 375px and the authenticated administrator workspace at 375px and 1440px. The scanner is not imported into runtime application code.

Keyboard checks verify email/password submission, visible button focus, viewport fit and access to core controls. The workspace now offers a first-focusable skip link that becomes visible on focus and moves focus to the main landmark. Login and workspace have distinct descriptive document titles. Existing static color-pair measurements are recorded in foundation-acceptance.md.

These are selected pages/states and automated rules, not full WCAG coverage. No rules or failing elements are excluded from the selected scans. Authenticated browser traces remain disabled.

## Remaining manual review

Record browser, assistive technology/version, viewport/zoom, reviewer, date and result for each check:

- Screen reader: correct page title and landmarks, meaningful headings, form labels, password field announcement and control names.
- Error recovery: invalid login, rejected project creation and invalid invitation are discoverable; errors can be understood without color alone.
- Dynamic status: project creation and navigation announcements are understandable without duplicate or missing announcements.
- Keyboard: complete invitation/password setup, login, project creation, pagination and logout with no trap; focus remains visible and follows a meaningful order.
- Magnification/reflow: 200% text size and 400% zoom, with content and controls usable without loss or overlapping focus indicators.
- Visual settings: high contrast/forced colors, focus visibility on every background and readable non-text control boundaries.
- Remaining states: viewer/empty workspace, password setup, invitation error and setup/error pages, including manual checks for issues automated scanners cannot detect.

Record any deviation against F-09, fix it and rerun the affected checks before owner acceptance. Human screen-reader and visual review cannot be marked complete from an automated scan alone.
