# 7. ER diagram and database schema

> Report on hold; skeleton only.

- Diagram: diagrams/er-diagram.md
- Table-by-table schema: columns, types, constraints (PK, FK, UNIQUE, CHECK), indexes
- Why NUMERIC for money and DATE for spent_on
- Row Level Security: enabled, no policies, anon/authenticated revoked; why
- Migrations and seeders list
- MongoDB collections (chat_logs, audit_logs): document shape, indexes, 90-day TTL, why logs live in MongoDB and expenses in Postgres
