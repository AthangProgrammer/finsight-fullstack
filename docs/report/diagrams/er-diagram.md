# ER diagram (draft, finalised in Phase 3)

## PostgreSQL (Supabase)

```mermaid
erDiagram
  USERS ||--o{ EXPENSES : records
  USERS ||--o| BUDGETS : sets
  CATEGORIES ||--o{ EXPENSES : classifies

  USERS {
    int id PK
    varchar username UK
    varchar password_hash
    int failed_logins
    timestamptz locked_until
    int token_version
    timestamptz created_at
  }
  CATEGORIES {
    int id PK
    varchar name UK
  }
  EXPENSES {
    int id PK
    int user_id FK
    int category_id FK
    varchar description
    numeric amount
    date spent_on
    timestamptz created_at
    timestamptz updated_at
  }
  BUDGETS {
    int id PK
    int user_id FK
    numeric monthly_amount
  }
```

## MongoDB (Atlas): collections in database `finsight`

`userId` holds the Postgres `users.id` value. It is a reference only; MongoDB doesn't enforce foreign keys.

```mermaid
erDiagram
  CHAT_LOGS {
    ObjectId _id PK
    int userId
    int questionChars
    int latencyMs
    string source "groq or fallback"
    string model
    date createdAt
  }
  AUDIT_LOGS {
    ObjectId _id PK
    string event "register, login.success, login.failure, login.locked, logout"
    int userId "optional"
    string ip
    string userAgent
    date createdAt "TTL 90 days"
  }
```
