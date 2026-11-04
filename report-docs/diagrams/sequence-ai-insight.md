# Sequence: AI insight

```mermaid
sequenceDiagram
  actor U as User
  participant C as React client
  participant A as Express API
  participant D as Postgres
  participant G as Groq

  U->>C: type question, submit
  C->>A: POST /api/insights {question} + cookie
  A->>A: requireAuth, per-user rate limit, zod (≤ 300 chars)
  A->>D: aggregate this month's totals by category + budget
  D-->>A: aggregates only
  A->>G: system prompt + aggregates + question (8 s timeout)
  alt success
    G-->>A: tip
    A-->>C: 200 {answer, source: "groq"}
  else timeout / 429 / 5xx
    A->>A: build local fallback tip
    A-->>C: 200 {answer, source: "fallback"}
  end
  A->>D: INSERT chat_log (length, latency, source)
  C->>U: show answer as plain text
```
