# Accuride – Frontend Dev Task

A TODO app built for the brief: user auth, responsive UI, a calendar view of TODOs, full CRUD per user, and a headless CMS backing the data.

## Design

I went with a "ticket Todo" look instead of a generic dashboard list each TODO is styled like a claim-ticket stub, dashed perforation and a rotated ink-stamp due date included.

Palette:
- Ink `#1B2430`
- Fog `#EDF0EF` (page background)
- Paper `#FBFAF7` (card background)
- Amber `#E2A63B` (accent / stamps)
- Moss `#4C7A5E` (done)
- Rust `#B4483A` (overdue)

Type: Space Grotesk for display, IBM Plex Sans for body text, IBM Plex Mono for dates and labels.

It's responsive throughout the ticket stub stacks vertically on mobile and the nav collapses into a menu.

## Stack

- **Next.js 13** (Pages Router) + **TypeScript**, pinned to a version that still works with **Node 16.x** (see the note on Node 16 below  it's a deliberate trade-off, not an oversight)
- **NextAuth.js** with the Credentials provider and JWT sessions
- **Tailwind CSS**, mobile-first
- **react-calendar** for the calendar view
- **Hygraph** (GraphQL headless CMS) as the data store for TODOs, no local fallback

## Requirements → where they're handled

| Requirement | Where |
|---|---|
| Auth, each user owns their own TODOs | `lib/authOptions.ts`, `pages/api/auth/*`, `lib/users.ts`  every todo is scoped by `userId` |
| Responsive UI | Tailwind, mobile-first, throughout; collapsible nav in `components/Navbar.tsx` |
| Calendar view of all TODOs | `pages/calendar.tsx` + `components/TodoCalendar.tsx` |
| View / add / update / delete TODOs | `pages/dashboard.tsx`, `components/TodoForm.tsx`, `components/TodoItem.tsx`, `pages/api/todos/*` |
| Headless CMS (Hygraph, required) | `lib/hygraph.ts` + `lib/todos.ts` for TODOs, `lib/hygraphUsers.ts` + `lib/users.ts` for accounts sole data store for both, no local fallback |
| Next.js + Node 16.x | `package.json` (`"engines": { "node": "16.x" }`, Next 13.5.6) |

## Getting started

Both TODOs and user accounts live in Hygraph there's no local database or JSON file anywhere in the project, and the app won't run without a Hygraph project configured.

```bash
npm install
cp .env.local.example .env.local   # fill in NEXTAUTH_SECRET, HYGRAPH_ENDPOINT, HYGRAPH_TOKEN
npm run dev
```

Then open http://localhost:3000, register an account, and start adding TODOs. Passwords are bcrypt-hashed before they're sent to Hygraph, so the plaintext password never leaves the login/register request.

## Wiring up Hygraph

1. Create a Hygraph project.
2. Add a **ToDo** model with: `title` (single line text, required), `description` (multi line text, optional), `duedate` (date, required lowercase, not camelCase), `completed` (boolean, default false), `ownerId` (single line text, required).
3. Add an **AppUser** model with: `name` (single line text, required), `email` (single line text, required, unique), `passwordHash` (single line text, required). It's called "AppUser" rather than "User" because Hygraph already has a built-in `User` type for Studio team members that's a different thing entirely and I wanted to avoid the name clash.
4. Create a **Permanent Auth Token** (Project Settings -> Permanent Auth Tokens) with Read, Create, Update, Delete, and Publish permissions on the Content API, for all models.
5. Grab your **Content API** endpoint from Project Settings -> Content API. Not the "High Performance Content API" one that one's cached and read-only, so it won't reliably reflect a mutation you just published.
6. Drop `HYGRAPH_ENDPOINT` and `HYGRAPH_TOKEN` into `.env.local`.

**Why put users in Hygraph too, and not just TODOs?** It's not really about security the passwords are bcrypt-hashed either way, so it doesn't matter much whether the hash sits in a local file or in Hygraph. It's about persistence. A local JSON file only survives if the app is running somewhere with a writable, durable filesystem. Deploy this to something serverless like Vercel and those writes don't persist between requests every user you register would just disappear. Keeping both TODOs and accounts in Hygraph sidesteps that problem completely.

I actually ran this setup  model, fields, token permissions, and the queries/mutations in `lib/hygraph.ts`  against a real Hygraph project through the API Playground before writing the code. Create, publish, read, and delete were all tested and working, so the field names here reflect what's actually in the schema rather than whatever Hygraph's docs assume by default.

One gotcha worth flagging: Hygraph content is created as a **draft** by default. Every create/update in `lib/hygraph.ts` explicitly calls `publishToDo` right after, otherwise new or edited TODOs wouldn't show up on read.

## A note on Node 16

Node 16 went end-of-life in September 2023, and current Next.js versions need Node 18.17+. Since the brief specifically asks for Node 16.x, I pinned this project to Next.js 13.5.6 the last major release that still supports it. In a real production setting I'd flag this and push to upgrade both Node and Next, but for the purposes of the brief I stuck to what was asked. Happy to redo it on a current stack if that's preferred.

## Project structure

```
lib/authOptions.ts    NextAuth config (credentials + JWT)
lib/users.ts          User data-access layer (bcrypt hashing, Hygraph only)
lib/hygraphUsers.ts   Hygraph GraphQL client for the AppUser model
lib/todos.ts          Todo data-access layer (Hygraph only)
lib/hygraph.ts        Hygraph GraphQL client for the ToDo model
pages/login.tsx, register.tsx, dashboard.tsx, calendar.tsx
pages/api/auth/*, pages/api/todos/*
components/           Navbar, TodoForm, TodoItem, TodoCalendar
```