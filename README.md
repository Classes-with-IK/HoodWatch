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
request. Auth state is only ever touched in two places: a successful
login/register sets it, and the one-time `/auth/me` check on app load
quietly clears the token if it's no longer valid — no global "you've been
logged out" interceptor watching every request. A `401` on any other call
(loading incidents, alerts, etc.) is just an error that page's own
loading/error state handles, the same as any other failed request; it
doesn't tear down the session.

Since the API's docs don't pin down the exact key the JWT comes back under,
`extractToken()` checks common key names (`token`, `accessToken`, `jwt`,
etc.) across the top-level response and a few likely wrapper objects, then
falls back to scanning the payload for anything shaped like a JWT
(three dot-separated base64url segments). This is what register/login/admin
login all use to pull the session out of whatever shape the response
actually is.

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
  isn't `admin`, the token is never stored and the person is told to use
  the main login instead.

## Admin control room

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

- [x] Landing page — standalone (no app sidebar), just a logo and
      sign in/sign up, hero, live `/public/stats`, how-it-works, role
      breakdown
- [x] Register, login, logout, session persistence via a stored bearer token
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

## Known limitations

- The API does not expose a password-change or account-deletion endpoint,
  so Settings only surfaces account info and sign-out.
- `GET /public/stats` does not return a `recentPublicNotices` field in its
  documented response shape — the landing page relies on the `overview`
  block only.
- A localStorage-held bearer token is more exposed to XSS than an httpOnly
  cookie; see the auth section above.
