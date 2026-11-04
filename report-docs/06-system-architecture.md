# 6. System architecture

- Diagram: diagrams/architecture.md
- Layers: React SPA (Vercel) → Vercel rewrite → Express API (Render) → Postgres (Supabase); Groq as an external service
- Request lifecycle: browser → DNS → TLS → static assets → `/api` call → middleware chain → route → Sequelize → response
- Why the rewrite (same-site cookie) and why Groq is server-only
- How a browser works (syllabus M1.1), using our app as the example
- Folder structure of client/ and server/
