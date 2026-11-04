# Use-case diagram

Mermaid has no native use-case diagram; this flowchart stands in. Redraw in draw.io for the report if the guide prefers UML notation.

```mermaid
flowchart LR
  V([Visitor])
  U([Registered user])
  G([Groq service])
  subgraph System[Expense Tracker]
    UC1(Register)
    UC2(Log in / log out)
    UC3(Add / edit / delete expense)
    UC4(Search, filter, paginate expenses)
    UC5(Set monthly budget)
    UC6(View dashboard and analytics)
    UC7(Check "Can I afford this?")
    UC8(Ask AI for a tip)
    UC9(Export CSV / XML)
  end
  V --- UC1
  V --- UC2
  U --- UC2 & UC3 & UC4 & UC5 & UC6 & UC7 & UC8 & UC9
  UC8 --- G
```
