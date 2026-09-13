# HoodWatch

A community safety coordination platform. Residents report incidents, patrol
officers walk shifts and log checkpoints, admins broadcast zone alerts —
built against the Community Watch & Neighborhood Safety API.

## Live API

```
Base:   https://1-community-watch-api.vercel.app/api/v1
Docs:   https://1-community-watch-api.vercel.app/docs
Spec:   https://1-community-watch-api.vercel.app/openapi.json
```

## Auth style: httpOnly cookie

This project authenticates with the httpOnly session cookie the API sets
automatically on register and login (`community_watch_token`) — not a
bearer token. `src/lib/api.js` sends `credentials: "include"` on every
request and never touches a token at all: no `localStorage`, no
`Authorization` header, nothing to read or store client-side. The browser
handles attaching the cookie on its own.

This wasn't the original choice — an earlier version of this project tried
bearer-JWT-in-localStorage instead, on the theory that it would sidestep
cross-site cookie issues between the frontend and API's separate domains.
It didn't: the API's OpenAPI spec documents that register/login "return a
JWT" but never specifies the response shape or the key it comes back
under, so every attempt to extract it was a guess, and every guess that
turned out wrong surfaced as a confusing "invalid session" error at some
point downstream. The cookie has no such ambiguity — the server sets it,
the browser stores and sends it, and there's nothing for the frontend to
get wrong.

`AuthContext` calls `GET /auth/me` once on app load; if the browser is
holding a valid cookie, the session is restored, and if not, the person is
just treated as logged out — no assumed, cached, or faked user state
either way. Auth state changes only in two places: a successful
login/register sets it, and that one-time check clears it if the cookie
turned out to be missing or invalid. A `401` from any other call (loading
incidents, alerts, etc.) doesn't touch the session — it's just an error
that page's own loading/error state handles, same as any other failed
request.

## Roles implemented

All three roles from the brief are implemented:

- **resident** — report incidents, comment, upvote/confirm, view alerts and
  patrol activity for their zone, edit their profile.
- **patrol_officer** — everything above, plus start/checkpoint/end a patrol
  shift and update an incident's status (`PATCH /incidents/{id}/status`).
- **admin** — everything above, plus a dedicated control room and broadcast
  alerts (`POST /alerts`).

Role-gated UI (the patrol status control, the alert broadcast form, patrol
start/checkpoint/end, the admin control room) only renders for the matching
role — the API is still the source of truth and is expected to reject
anything the frontend missed.

## Registration and login

Registration is shared: `/register` has a Resident / Patrol officer / Admin
picker, and creates the account with whichever role is selected, routing
into `/admin` or `/dashboard` accordingly.

Login is split by audience:

- **`/login`** — residents and patrol officers. Also links out to
  `/admin/login` for admins.
- **`/admin/login`** — a distinct sign-in screen (dark "control room"
  styling). It calls the same `POST /auth/login` endpoint — there's no
  separate backend auth flow for admins — but if the returned user's role
  isn't `admin`, the session is immediately logged out again and the
  person is told to use the main login instead.

## Admin control room

- **`/admin`** — live stats, a "needs attention" queue of freshly reported
  incidents, active patrol shifts, and the alert broadcast form. Guarded by
  `AdminRoute`, which redirects to `/admin/login` if signed out, or
  `/dashboard` if signed in as anything other than admin.
- The needs-attention queue supports bulk triage: select multiple reports
  and mark them "under review" or "dismissed" in one action.
- The dashboard and its incident/alert widgets are **not** zone-scoped for
  admins — residents and officers see their own zone by default, but an
  admin sees the whole community, since oversight is the point.

Signing in as an admin through the *regular* `/login` still works and lands
on `/admin` directly. Patrol officers keep broadcasting alerts from the
regular `/alerts` page — `AlertBroadcastForm` is shared between the two so
that logic only exists once.

Admin's sidebar "Home" points at `/admin` rather than the resident-style
`/dashboard`, so there's one clear home per role instead of two competing
ones. A small "Admin" badge shows next to the name in the header and the
sidebar's account card as a reminder of which mode you're in while
browsing the pages that are otherwise identical across roles (incidents,
alerts, patrols, profile).

## Structure

```
src/
  auth/          AuthContext, ProtectedRoute, AdminRoute
  lib/           api.js (fetch wrapper), format.js (dates, labels)
  layouts/       Layout (sidebar + header shell)
  pages/         Home, Login, Register, AdminLogin, Dashboard,
                 AdminDashboard, Incidents, IncidentDetail, ReportIncident,
                 Alerts, Patrols, Profile, Settings, NotFound
  components/    IncidentCard, AlertCard, AlertBroadcastForm, StatusBadge,
                 PriorityBadge, SeverityBadge, StatusTimeline, CommentList,
                 Modal, EmptyState, LoadingState, ErrorState, Sidebar,
                 MobileSidebar, Header
```

## Dark mode

Every semantic color (`bg`, `surface`, `ink`, `muted`, `border`, `primary`,
and each severity color) is a CSS custom property, and components are
built entirely on those tokens rather than raw hex values — so a single
`.dark { ... }` override block in `src/index.css` re-themes the whole app.

- Toggle lives in the app header, the landing/login/register pages, and
  Settings → Appearance.
- Preference persists to `localStorage` and falls back to the OS setting
  on first visit; a small inline script in `index.html` applies the class
  before first paint so there's no flash of the wrong theme.
- The admin control-room login (`/admin/login`) is intentionally a fixed
  dark "terminal" aesthetic regardless of the site-wide toggle — that's a
  deliberate design choice, not an oversight.

## Design

Colour carries meaning consistently everywhere — the same palette maps to
status, priority, and alert severity across the feed, the detail page, and
the dashboard, and every state also has a label and icon so nothing depends
on colour alone. One accent (`--color-primary`, a deep emerald) is reserved
for actions; severity colours never double as buttons.

Type pairs a quiet Inter body with Newsreader for headlines, aiming for a
calm, editorial feel rather than a generic SaaS dashboard. Cards carry a
subtle two-tier shadow (`shadow-card` / `shadow-card-hover`) for depth
without going heavy-handed on it.

The desktop sidebar collapses to a 76px icon rail and expands to full width
on hover; the mobile drawer is unaffected.

## Running locally

```bash
npm install
npm run dev
```

## What's implemented

- [x] Landing page — standalone (no app sidebar), just a logo and
      sign in/sign up, hero, live `/public/stats`, how-it-works, role
      breakdown
- [x] Register, login, logout, session persistence via the httpOnly cookie
- [x] Protected routing, plus a separate admin-only login and route
- [x] Resident dashboard (zone alert banner, live stats, recent incidents)
- [x] Admin control room — overview stats, needs-attention queue, active
      patrols, alert broadcast
- [x] Incident feed — search, status/category/priority/zone filters
      (deep-linkable via URL params), loading/empty/error states
- [x] Incident detail — status timeline, comments, upvote/confirm,
      officer assignment for admins/officers, ownership-safe delete
- [x] Report incident — controlled category/priority enums, validation
- [x] Safety alerts — zone/severity filters, severity-distinct styling,
      expired-alert handling, admin/officer broadcast form
- [x] Patrol shifts — start/checkpoint/end for officers, read-only shift
      history for residents
- [x] Profile — view and edit via `/auth/me` + `PATCH /auth/me`
- [x] Responsive from 375px through desktop
- [x] Light and dark mode, toggleable, persisted, applied everywhere

## Known limitations

- The API does not expose a password-change or account-deletion endpoint,
  so Settings only surfaces account info and sign-out.
- `GET /public/stats` does not return a `recentPublicNotices` field in its
  documented response shape — the landing page relies on the `overview`
  block only.
- Cookie auth assumes the browser accepts the cross-site cookie between
  this frontend's origin and the API's (`SameSite=None; Secure` on the
  server's side). This is standard for modern browsers when set up
  correctly, but if you ever see auth fail specifically in one browser or
  in an in-app webview, that's the first thing to check.
