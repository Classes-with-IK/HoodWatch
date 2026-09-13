# HoodWatch

A community safety coordination platform. Residents report incidents, patrol
officers walk shifts and log checkpoints, admins broadcast zone alerts.
Built against the Community Watch & Neighborhood Safety API.

## Live API

```
Base:   https://1-community-watch-api.vercel.app/api/v1
Docs:   https://1-community-watch-api.vercel.app/docs
Spec:   https://1-community-watch-api.vercel.app/openapi.json
```

## Auth

Uses the httpOnly session cookie the API sets on register and login
(`community_watch_token`), not a bearer token. `src/lib/api.js` sends
`credentials: "include"` on every request; there's no token stored or read
on the client. `AuthContext` calls `GET /auth/me` once on load to restore
the session if the cookie is present.

## Roles

- **resident** — report incidents, comment, upvote/confirm, view alerts and
  patrol activity for their zone, edit their profile.
- **patrol_officer** — everything above, plus start/checkpoint/end a patrol
  shift and update an incident's status.
- **admin** — everything above, plus a control room and alert broadcasting.

Role-gated UI (status updates, alert broadcast, patrol controls, the admin
dashboard) only renders for the matching role. The API enforces permissions
server-side regardless.

## Registration and login

Registration is shared: `/register` has a Resident / Patrol officer / Admin
picker and routes into `/dashboard` or `/admin` based on the role chosen.

Login is split:

- **`/login`** — residents and patrol officers, with a link out to
  `/admin/login`.
- **`/admin/login`** — dark "control room" styling. Same `/auth/login`
  endpoint, but a non-admin account gets logged out immediately and told to
  use the main login instead.

## Admin control room

- **`/admin`** — stats, a needs-attention queue of freshly reported
  incidents, active patrols, and the alert broadcast form.
- Needs-attention supports bulk triage — select several reports and mark
  them reviewing or dismissed at once.
- Not zone-scoped: admins see activity across the whole community, not
  just their own zone.
- Sidebar "Home" points admins at `/admin` instead of the resident
  dashboard, and a small "Admin" badge shows in the header and sidebar.

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

Every color is a CSS custom property (`bg`, `surface`, `ink`, `muted`,
`border`, `primary`, and the severity colors), with dark equivalents in a
`.dark` override block in `src/index.css`. Toggle lives in the header, the
auth pages, and Settings → Appearance. Preference persists to
`localStorage` and falls back to the OS setting on first visit.

The admin login page keeps its dark styling regardless of the toggle —
that's a fixed design choice for that page, not tied to the site-wide
theme.

## Design

One accent color (a deep emerald) for actions; status/priority/severity
use their own consistent palette across the whole app, always paired with
a label and icon so nothing depends on color alone. Newsreader for
headlines, Inter for body text. Cards use a subtle two-tier shadow for
depth. Desktop sidebar collapses to a 76px icon rail and expands on hover.

## Running locally

```bash
npm install
npm run dev
```

## Implemented

- Landing page with live stats, how-it-works, and role breakdown
- Register, login, logout, session persistence
- Protected routing, plus a separate admin login and route
- Resident dashboard with zone alerts, stats, recent incidents
- Admin control room with bulk triage
- Incident feed with search and filters (status/category/priority/zone),
  deep-linkable via URL params
- Incident detail with status timeline, comments, upvotes, officer
  assignment, ownership-safe delete
- Report form with controlled category/priority enums and validation
- Safety alerts with zone/severity filters and broadcast form
- Patrol shifts — start/checkpoint/end for officers, read-only for residents
- Profile view/edit
- Responsive from 375px up
- Light and dark mode

## Known limitations

- No password-change or account-deletion endpoint, so Settings only shows
  account info and sign-out.
- `GET /public/stats` doesn't return a `recentPublicNotices` field despite
  early assumptions — the landing page only uses the `overview` block.
- Cookie auth needs the browser to accept the cross-site cookie between
  this frontend's origin and the API's. Standard for modern browsers with
  proper `SameSite=None; Secure` config, but worth checking first if auth
  ever misbehaves in one specific browser or an in-app webview.
