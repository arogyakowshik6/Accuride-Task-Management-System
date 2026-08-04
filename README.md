# Ledger — Accuride Frontend Dev Task

A to-do planner built to the brief:

1. **User authentication and per-user to-dos** — NextAuth.js (credentials provider), passwords hashed with bcrypt. Each user only ever sees their own to-dos (enforced server-side via the session on every API route).
2. **Responsive view** — tested down to a 390px mobile viewport (list view and calendar view both reflow; see `/screenshots`).
3. **Calendar view** — a month grid showing every to-do on its due date, with prev/next navigation and a "today" highlight.
4. **View, add, update, delete** — full CRUD from the list view, including an inline edit form and a "mark done" toggle.
5. **Headless CMS** — no HyGraph project/API keys were available for this task, so data is served through `lib/dataStore.js`, a small file-backed data layer. Every function in that file (`getTodosByUser`, `createTodo`, `updateTodo`, `deleteTodo`, `findUserByEmail`, `createUser`) maps 1:1 to what a HyGraph GraphQL query/mutation would do — swapping the body of each function for a `graphql-request` call against a real HyGraph project is a drop-in change; nothing in the pages or API routes would need to change.
6. **Technologies** — Next.js (Pages Router, v13.5.6 — the last major line supporting Node 16.x) and Node 16.x (see `engines` in `package.json`).

## Running it

```bash
npm install
cp .env.local.example .env.local   # then set NEXTAUTH_SECRET to a random string
npm run dev
```

Visit `http://localhost:3000`, create an account, and start adding to-dos.

## Project structure

```
pages/
  index.js              # dashboard (list + calendar toggle)
  login.js / register.js
  api/
    register.js
    auth/[...nextauth].js
    todos/index.js       # GET (list), POST (create)
    todos/[id].js         # PUT (update), DELETE
components/
  TodoForm.js  TodoList.js  CalendarView.js
lib/
  dataStore.js            # data layer — swap for HyGraph here
data/
  db.json                 # local file-backed store (git-ignored)
```

## Notes on choices made

- **Auth**: credentials-based NextAuth with JWT sessions — no external OAuth provider needed, keeps the assessment self-contained and runnable offline.
- **Data**: a real HyGraph project wasn't provisioned for this task, so I built the data layer as a clean abstraction that already returns the same shapes a HyGraph client would, ready to be re-pointed at a live project — happy to wire that up if credentials are provided.
- **Design**: a "ledger/planner" visual direction (ink, amber, ruled paper) rather than a generic admin-dashboard look, per the layer of polish I try to bring to take-home tasks.
