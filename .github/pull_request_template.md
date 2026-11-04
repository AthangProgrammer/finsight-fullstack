## What

<!-- One or two sentences. Link the phase/task from docs/planning/IMPLEMENTATION_PLAN.md -->

## Why

## How to test

- [ ] `npm test -w <workspace>` passes for every workspace touched (frontend / backend / database)
- [ ] Ran it locally and checked the behaviour

## Checklist

- [ ] Branch is `name/topic`, commits follow Conventional Commits
- [ ] Input validation on any new/changed route
- [ ] No secrets, tokens or `.env` files committed
- [ ] Every DB query touching user data is scoped to `req.user.id`
- [ ] Storage code stays in `database/`, HTTP code in `backend/`
- [ ] UI still matches FinSight (screenshot attached if UI changed)
- [ ] `docs/planning/SYLLABUS_MAPPING.md` updated if this covers a syllabus topic
