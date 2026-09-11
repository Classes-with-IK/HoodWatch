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

## Auth style: JWT bearer, stored in localStorage

This project authenticates with a bearer JWT rather than the httpOnly
session cookie — the API supports both at once, and bearer avoids the
cross-site cookie issues that come from the frontend and API living on
different domains (Netlify/Vercel vs. the API's own Vercel deployment).

A single fetch wrapper (`src/lib/api.js`) reads the token from
`localStorage` and attaches `Authorization: Bearer <token>` on every
request. On any `401`, it clears the stored token and calls a registered
handler so `AuthContext` can sign the user out — the raw backend error text
never reaches the screen; the person just sees "Your session has ended.
Please sign in again."

**Tradeoff worth knowing:** a token in `localStorage` is readable by any
script running on the page, so it's more exposed to XSS than an httpOnly
cookie would be. Reasonable for a portfolio project; a production app
handling real user data would want the cookie flow (or short-lived tokens
with rotation) instead.

On load, `AuthContext` checks for a stored token and, if present, calls
`GET /auth/me` to restore the session. No user state is ever assumed,
cached across reloads, or faked.

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

## Admin control room

Admins get a separate area from the resident/officer experience:

- **`/admin/login`** — a distinct sign-in screen (dark "control room"
  styling). It calls the same `POST /auth/login` endpoint — there's no
  separate backend auth flow for admins — but if the returned user's role
  isn't `admin`, the token is never stored and the person is told to use
  the main login instead.
- **`/admin`** — live stats, a "needs attention" queue of freshly reported
  incidents, active patrol shifts, and the alert broadcast form. Guarded by
  `AdminRoute`, which redirects to `/admin/login` if signed out, or
  `/dashboard` if signed in as anything other than admin.

Signing in as an admin through the *regular* `/login` still works and lands
on `/admin` directly. Patrol officers keep broadcasting alerts from the
regular `/alerts` page — `AlertBroadcastForm` is shared between the two so
that logic only exists once.

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

- [x] Landing page — hero, live `/public/stats`, how-it-works, role
      breakdown
- [x] Register, login, logout, session persistence via a stored bearer token
- [x] Protected routing, plus a separate admin-only route/login
- [x] Resident dashboard (zone alert banner, live stats, recent incidents)
- [x] Admin control room — overview stats, needs-attention queue, active
      patrols, alert broadcast
- [x] Incident feed — search, status/category/priority/zone filters
      (deep-linkable via URL params), loading/empty/error states
- [x] Incident detail — status timeline, comments, upvote/confirm,
      ownership-safe delete
- [x] Report incident — controlled category/priority enums, validation
- [x] Safety alerts — zone/severity filters, severity-distinct styling,
      expired-alert handling, admin/officer broadcast form
- [x] Patrol shifts — start/checkpoint/end for officers, read-only shift
      history for residents
- [x] Profile — view and edit via `/auth/me` + `PATCH /auth/me`
- [x] Responsive from 375px through desktop

## Known limitations

- The API does not expose a password-change or account-deletion endpoint,
  so Settings only surfaces account info and sign-out.
- `GET /public/stats` does not return a `recentPublicNotices` field in its
  documented response shape — the landing page relies on the `overview`
  block only.
- A localStorage-held bearer token is more exposed to XSS than an httpOnly
  cookie; see the auth section above.
