# Content beyond syllabus

This covers the 10-mark "Content beyond syllabus presentation" rubric item. The other two CA rubric items are:
- a MOOC certificate of 4 weeks or more (10 marks), which each member does individually, outside this repo;
- "Creating proof of concept" (10 marks), which is the deployed app itself.

For the presentation, pick 3 or 4 topics, with one slide each and a live demo or screenshot. A ✅ marks a recommended pick.

| ✅ | Topic | What we built | Why it's beyond the syllabus | Demo | Phase |
|---|---|---|---|---|---|
| ✅ | **OWASP Top 10:2025 security hardening** | Access-control scoping, RLS deny-all, helmet + CSP, lockout, rate limits, log redaction, NoSQL-injection guards, CSRF reasoning | The syllabus covers only JWT and bcrypt; this is a full control set driven by a threat model | Three attacks live: an IDOR attempt gets a 404, brute force triggers the lockout, and an XSS payload renders as text | 4, 8 |
| ✅ | **Automated testing** | Jest + Supertest for the API, Vitest + React Testing Library for the UI | Testing isn't part of the six modules | Run the test suite and walk through the IDOR test | 8 |
| ✅ | **CI/CD with GitHub Actions** | Lint, tests and `npm audit` on every PR; branch protection; Dependabot; auto-deploy to Vercel and Render on merge | The syllabus covers deployment basics only | A PR blocked by a failing check | 9 |
| ✅ | **LLM integration done safely (Groq)** | The API key stays on the server; the model only sees aggregate figures; the system prompt resists prompt injection; timeout, per-user limit and fallback | Not in the syllabus, and it shows privacy by design | Ask a normal question, then try an injection | 7 |
| | **Polyglot persistence (SQL + NoSQL)** | Postgres for relational data, MongoDB for append-only logs with TTL expiry, both in one `database/` workspace package | The syllabus teaches both databases separately; choosing each for the job it suits is a design decision | The same user's expenses in Postgres and their audit trail in Atlas | 3 |
| | **Monorepo with npm workspaces** | Three workspaces (`frontend`, `backend`, `database`) sharing one lockfile | Code organisation and package boundaries | `npm ls` showing `@finsight/database` linked into the backend | 1 |
| | **Playwright visual regression** | Screenshot diffs of the old Next.js app and the new Vite app for each route | Browser automation and visual testing | The two screenshots side by side, plus the diff image | 6, 8 |
| | **Rate limiting and account lockout** | `express-rate-limit` plus a DB-backed exponential backoff | Abuse-prevention design | A loop of logins hits 429 / locked | 4 |
| | **Security headers** | helmet on the API; Vercel headers on the SPA | HTTP security headers and CSP | securityheaders.com grade before and after | 8, 9 |
| | **Row Level Security in Postgres** | RLS enabled; `anon` and `authenticated` revoked | Authorization enforced in the database itself | A request with the anon key is denied | 3 |
| | **Streaming exports** | CSV and XML streamed from the database with backpressure | Streams used in production code, beyond the syllabus demo | A 100k-row export with a flat memory graph | 5 |
| | **Structured logging** | pino JSON logs with request ids and redaction | Observability | Search Render's logs by request id | 2 |
