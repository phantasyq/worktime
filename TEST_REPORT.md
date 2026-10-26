# Test report — Work Time v3.2.0

## Automated checks
- `node --check app.js`: PASS
- `node --check production-calendar.js`: PASS
- `node --check sw.js`: PASS
- `node --test tests/*.cjs`: 22 passed, 0 failed
- CSS parsing with tinycss2: validated separately during build

## Coverage added in this release
- HTTP/HTTPS URL normalization and linkification.
- HTML escaping and refusal to emit `javascript:` anchors.
- Schema appends `taskUrl`/template `url` and ranges extend to J/C columns.
- URL fields in template and record modals; templates pass links to new records.
- Inline Jira state persistence and incomplete-Jira day highlight.
- Existing calendar/OAuth/session and spreadsheet atomic-write tests remain passing.

## Manual verification still needed
The static test environment has no authenticated access to the owner's Google Cloud project. After publishing, verify one real sign-in, read, create, edit, and inline Jira flag update against the user's personal spreadsheet.

## v3.2.0 verification
- node --check app.js / production-calendar.js / sw.js: PASS
- node --test tests/*.cjs: 22 passed, 0 failed
- tinycss2 CSS parse: 382 top-level rules, 0 parse errors
- static HTML check: 73 IDs, no duplicates; all local asset references present
- Browser-based OAuth/Google Sheets end-to-end: not run; requires live Google authentication.
