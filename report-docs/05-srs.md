# 5. Software requirements specification

- Purpose, intended users, definitions
- Functional requirements (FR-1… numbered): register, login, logout, add/edit/delete expense, filter/search/paginate, set budget, dashboard summary, analytics, afford check, AI insight, CSV/XML export
- Non-functional: security (OWASP, see §11), performance (p95 API < 500 ms warm), availability (free-tier caveats), usability (identical FinSight UI, responsive from 360 px), maintainability (tests, CI), privacy (AI sees aggregates only)
- Hardware requirements: any machine with 4 GB RAM for development; end users need a modern browser
- Software requirements: Node.js LTS, npm, Git, VS Code, Chrome/Firefox; Supabase, Render, Vercel, Groq accounts
- Constraints and assumptions: free tiers, single currency (₹)
