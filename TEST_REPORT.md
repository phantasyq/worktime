# Work Time v3.1.1 — QA report

Date: 2026-10-17

## Automated checks

- `node --check app.js` — passed.
- `node --check production-calendar.js` — passed.
- `node --check sw.js` — passed.
- `node --test tests/*.cjs` — 17/17 passed.
- HTML audit — 73 IDs, no duplicate IDs.
- Local asset audit — all 5 local script/style/manifest paths exist.
- CSS parser audit (`tinycss2`) — 0 parse errors.

## Covered behavior

- Russian production calendar fallback and published transfer dates for 2024–2027, including May 1, 2025, May 11 and Dec 31, 2026, and working Saturday Feb 20, 2027.
- Online calendar response validation and local cache fallback.
- No manual holiday/workday inputs.
- Access token is restored from the current tab's `sessionStorage`; it is not saved in `localStorage`.
- Reload auto-resume uses a valid session token without relying on local storage flags.
- Stale browser-local spreadsheet IDs are checked against current-user ownership before reuse.
- Sheet writes are atomic; template sheet that the user intentionally emptied is not rewritten on every load.
- Google connection errors are not reported as successful data sync.

## Not tested end-to-end here

The published app has not been run against the owner's live Google OAuth project and a real Google account in this environment. After publishing, verify OAuth, table creation/reuse, the first write, reload within the token lifetime, and backup/restore on GitHub Pages.
