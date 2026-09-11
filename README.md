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

This project authenticates with the `community_watch_token` httpOnly session
cookie rather than a bearer JWT. Every request goes through a single fetch
wrapper (`src/lib/api.js`) that sends `credentials: "include"` and attaches
no token manually — the browser handles the cookie, and the server is the
only thing that ever reads it.

**Why cookie over bearer:** no token to store, serialize, or accidentally
leak into `localStorage`; the session survives a hard refresh for free
because the browser keeps sending the cookie; and it matches how a real
same-origin production app would ship this. The tradeoff is that this
approach assumes same-site requests — a mobile or cross-domain client would
need the bearer flow instead.

On load, `AuthContext` calls `GET /auth/me`. If it succeeds, the session is
restored; if not, the user is treated as signed out. No user state is ever
assumed, cached across reloads, or faked.

## Roles implemented

All three roles from the brief are implemented:

- **resident** — report incidents, comment, upvote/confirm, view alerts and
  patrol activity for their zone, edit their profile.
- **patrol_officer** — everything above, plus start/checkpoint/end a patrol
  shift and update an incident's status (`PATCH /incidents/{id}/status`).
- **admin** — everything above, plus broadcast a safety alert
  (`POST /alerts`).

Role-gated UI (the patrol status control, the alert broadcast form, patrol
start/checkpoint/end) only renders for the matching role — the API is still
the source of truth and is expected to reject anything the frontend missed.

## Structure

```
src/
  auth/          AuthContext, ProtectedRoute
  lib/           api.js (fetch wrapper), format.js (dates, labels)
  layouts/       Layout (sidebar + header shell)
  pages/         Home, Login, Register, Dashboard, Incidents,
                 IncidentDetail, ReportIncident, Alerts, Patrols,
                 Profile, Settings, NotFound
  components/    IncidentCard, AlertCard, StatusBadge, PriorityBadge,
                 SeverityBadge, StatusTimeline, CommentList, Modal,
                 EmptyState, LoadingState, ErrorState, Sidebar,
                 MobileSidebar, Header
```

## Design

Colour carries meaning consistently everywhere — the same palette maps to
status, priority, and alert severity across the feed, the detail page, and
the dashboard, and every state also has a label and icon so nothing depends
on colour alone. One accent (`--color-primary`, a deep green) is reserved
for actions; severity colours never double as buttons.

Type pairs a quiet Inter body with Newsreader for headlines, aiming for a
calm, editorial feel rather than a generic SaaS dashboard.

## Running locally

```bash
npm install
npm run dev
```

## What's implemented

- [x] Public landing page with live `/public/stats`
- [x] Register, login, logout, session persistence via `/auth/me`
- [x] Protected routing
- [x] Resident dashboard (zone alert banner, live stats, recent incidents)
- [x] Incident feed — search, status/category/priority/zone filters, clear
      filters, loading/empty/error states
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
