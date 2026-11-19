# Content review checklist

All Hindi and Marathi text in this build is a first draft written by the team.
Before any pilot with seniors, each item below must be reviewed and signed off.

| Content | File | Reviewer (Hindi) | Reviewer (Marathi) | Date |
|---|---|---|---|---|
| UI strings | `src/i18n/strings.ts` | | | |
| Rule titles and explanations | `src/engine/rules.ts` | | | |
| Drill scripts and feedback | `src/content/drills.ts` | | | |
| Helpline names and descriptions | `src/content/helplines.ts` | | | |

## Checks for every string

- Simple words a 70-year-old first-time smartphone user understands.
- No blame or fear without an action ("do this" not just "danger").
- Never says or implies "safe" about a message.
- Marathi is natural Marathi, not translated Hindi.

## Facts to re-verify before each release

- Every helpline number, URL and hours in `src/content/helplines.ts` (update `lastVerified`).
- RBI liability wording and the 1 Jan 2027 switch date in `src/content/helplines.ts` / `strings.ts`.
- Rule sources and `reviewBy` dates in `src/engine/rules.ts`.
