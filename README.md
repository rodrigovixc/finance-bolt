# Bolt Finance

Personal finance tracker built around the thing most trackers get wrong: **credit card
installments**. A purchase split into 12x is not one expense in one month, it is twelve
commitments across twelve future months, and your real balance depends on knowing that.

React + TypeScript on the front, Supabase (Postgres) on the back, with Row Level
Security doing the authorization instead of the application code.

## Why installments are the hard part

In Brazil most card purchases are split (`parcelado`). A tracker that records a 1,200
purchase as a single expense in March tells you nothing useful about April. This one
stores the installment plan on the transaction:

```ts
installments?: {
  total: number;     // 12
  current: number;   // 3  → third of twelve
}
```

so the dashboard can answer "what is already committed for next month" instead of only
"what did I spend last month".

Recurring transactions are modelled separately (`is_recurring`, `recurrence_period`,
`recurrence_end_date`), because a subscription and a split purchase behave differently:
one has no end, the other has exactly N occurrences.

## Data model

```
cards ──────┐
            ├──→ transactions ←── categories
income_types ┘
```

| Table | Holds |
|---|---|
| `cards` | Bank, last four digits, statement due date |
| `categories` | User defined, with colour and icon |
| `income_types` | Salary, freelance, and so on |
| `transactions` | Income or expense, optionally tied to a card, category or income type, optionally installment or recurring |

## Authorization lives in the database

Every table has RLS enabled **and forced**:

```sql
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions FORCE ROW LEVEL SECURITY;
```

`FORCE` is the part that matters. Without it the table owner bypasses its own policies.
With it, ownership rules apply to every role, so the front end cannot read another
user's rows even if a query is written wrong. The isolation is not in the client.

`src/utils/checkRLS.ts` verifies from the client that the policies are actually in
force, so a misconfigured environment fails loudly instead of leaking quietly.

## Stack

| Layer | Tech |
|---|---|
| Front end | React 18, TypeScript, Vite, Tailwind |
| Charts | Recharts |
| Backend, auth, database | Supabase (Postgres + RLS) |
| Dates | date-fns |
| E2E tests | Cypress |

## Tests

End to end with Cypress, covering the flows where a bug costs money:

```bash
npx cypress run
```

| Spec | Covers |
|---|---|
| `auth.cy.ts` | Sign up, sign in, session |
| `cards.cy.ts` | Card CRUD |
| `income-types.cy.ts` | Income type CRUD |
| `transactions.cy.ts` | Transactions, including installments |
| `dashboard.cy.ts` | Aggregates and charts |

## Running locally

```bash
npm install
```

Create a Supabase project, then apply everything in `supabase/migrations/` in filename
order. `20240315000001_enable_rls.sql` is not optional: without it the tables are open.

Create a `.env` with the project credentials from Project Settings → API:

```env
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

Then:

```bash
npm run dev     # http://localhost:5173
```

## Scope

Personal project. One user per account, no shared budgets, no bank import. The focus was
getting installments and authorization right rather than breadth of features.

## License

MIT. See [LICENSE](LICENSE).
