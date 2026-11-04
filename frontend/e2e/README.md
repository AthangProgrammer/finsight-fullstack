# Visual regression

`baseline/` holds screenshots of the original FinSight (Next.js) at 1440x900 and 390x844 for login, register and every page. `current/` is the same flow against this app; `diff/` is the pixel diff. Both apps run against `mock-api.mjs`, which serves one frozen dataset (`fixtures/`, the demo user's current month).

1. `MOCK_PORT=4100 npm run e2e:mock -w frontend`
2. This app: `API_URL=http://localhost:4100 npx vite --port 5174` in `frontend/`.
3. `TARGET=current BASE_URL=http://localhost:5174 npm run e2e:capture -w frontend`
4. `npm run e2e:compare -w frontend` (threshold 6% per screenshot, `DIFF_THRESHOLD` to override).

To regenerate the baseline, run a copy of the original app with `API_URL=http://127.0.0.1:4100`, then `LEGACY=1 TARGET=baseline BASE_URL=http://localhost:3000 npm run e2e:capture -w frontend`.

Reviewed differences, all intentional:
- The budget ring follows the percentage used; the original's ring is static.
- Transactions rows have an Edit button, which shifts the table columns.
