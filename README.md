# Employee Attendance Portal

A web-based portal for marking attendance, applying for leave, and managing
the leave-approval workflow across three roles (Employee, Manager, HR).

## Tech stack

| Layer | Choice |
|---|---|
| Frontend | React 19 + Vite 8 + TypeScript + Tailwind CSS + Radix UI (shadcn/ui) + React Router 7 + Redux Toolkit (RTK Query, fetch-based) + CASL |
| Backend  | Node 22 + Express 5 + TypeScript + Sequelize 6 + Zod + Pino + bcrypt + CASL |
| Database | PostgreSQL 16 |
| Auth     | Stateful session token (UUID), 15-min sliding inactivity expiry |
| Authorization | Single CASL ability matrix shared by backend middleware and frontend menu/page guards |
| Tooling  | Docker Compose v2 (`develop.watch`), Makefile for daily commands |

## Prerequisites

- Docker Desktop (or any Docker engine + Compose v2)
- `make`
- That's it. Node, Postgres, and all build tools run inside containers.

## Quickstart

From the project root, on a fresh clone:

```bash
cp backend/.env.example  backend/.env
cp frontend/.env.example frontend/.env

make db-reset       # one-shot: wipes volumes, builds images, migrates, seeds
make up             # start everything in watch mode
```

Open the app at **http://localhost:5173**.

The backend is at http://localhost:3000 (mainly for direct API testing).

## Default test logins

Created by the seeder. Password for all three is **`password123`**.

| Username   | Role      | Reports to |
|------------|-----------|------------|
| `hr1`      | HR        | —          |
| `manager1` | Manager   | hr1        |
| `employee1`| Employee  | manager1   |

You can create more users from the **User Management** page when logged in as HR.

## Permission matrix (assignment Section 4)

Reproduced verbatim from the spec:

| Action                       | Employee | Manager | HR |
|------------------------------|:-:|:-:|:-:|
| View own attendance          | ✓ | ✓ | ✓ |
| Check in / Check out         | ✓ | ✓ | ✗ |
| Apply for leave              | ✓ | ✓ | ✗ |
| View own leave requests      | ✓ | ✓ | ✓ |
| View team attendance         | ✗ | ✓ | ✓ |
| Approve / Reject leave       | ✗ | ✓ | ✗ |
| View all leave requests      | ✗ | ✗ | ✓ |
| Create / Deactivate users    | ✗ | ✗ | ✓ |
| Assign roles & managers      | ✗ | ✗ | ✓ |
| Configure leave types        | ✗ | ✗ | ✓ |
| View organization attendance | ✗ | ✗ | ✓ |

### Implementation: how each spec row maps to a permission

| Spec row | Permission | Granted to |
|---|---|---|
| View own attendance | `attendance:read:own` | E, M, HR |
| Check in / Check out | `attendance:write` | E, M |
| Apply for leave | `leave:apply` | E, M |
| View own leave requests | `leave:read:own` | E, M, HR |
| View team attendance | `attendance:read:team` | M, HR |
| Approve / Reject leave | `leave:approve` | M (+ HR for Manager leaves only — see §6 note) |
| View all leave requests | `leave:read:all` | HR |
| Create / Deactivate users + Assign roles & managers | `user:manage` | HR |
| Configure leave types | `leave_type:manage` | HR |
| View organization attendance | `attendance:read:all` | HR |

Two additional internal permissions back spec mechanics that aren't
standalone matrix rows:

| Internal permission | Granted to | Why it exists |
|---|---|---|
| `leave:cancel:own` | E, M | Backs the §6 maker-checker rule (cancel allowed only while pending) |
| `leave:read:pending` | M, HR | Drives the Leave Approval page's pending queue |

**§6 carve-out (Manager's own leave is handled by HR).** The matrix above
shows HR ✗ for Approve/Reject — that's the *default* path. Section 6
states "A manager cannot approve or reject their own leave requests. Their
requests follow the same workflow and must be handled by HR or a designated
authority." To honor this, HR also holds `leave:approve`, but the
row-level CASL rule `requester.parentId === actor.id` plus the parent-role
typing (Manager.parent = HR) restricts HR's reach to Manager leaves only.
HR cannot approve an Employee's leave.

### How authorization is wired

- Routes use `requirePermission('...')` for action gates.
- CASL builds `can(...)` rules from the user's permission array, then layers
  on row-level conditions (`parent_id`, `status`, etc.) that aren't grant-able.
- The frontend receives `permissions: string[]` on `/api/auth/me` and uses
  the same CASL mirror for menu / button visibility.

Add a new permission by inserting a row in `permissions`, mapping it in
`role_permissions`, and referencing it from the route + abilities.

## Daily commands (Makefile)

```bash
make up                # start stack with file-watch + hot reload
make up-detached       # same, but detached
make down              # stop containers (keeps Postgres volume)
make reset             # stop AND wipe volumes
make logs              # tail all service logs

make migrate           # apply pending Sequelize migrations
make migrate-undo      # roll back last migration
make seed              # run all seeders
make db-reset          # reset volume + build + migrate + seed (full rebuild)
make db-export         # dump current DB to ./database.sql

make shell-backend     # sh into backend container
make shell-frontend    # sh into frontend container
make shell-db          # psql inside Postgres container

make zip               # produce backend.zip, frontend.zip, database.sql
```

## Project layout

```
my-app/
├── compose.yml                 # Docker Compose v2 with develop.watch
├── Makefile                    # daily commands
├── README.md
├── backend/
│   ├── Dockerfile              # node:22-alpine, BuildKit cache mount
│   ├── .env                    # Postgres + DATABASE_URL + PORT
│   ├── package.json
│   └── src/
│       ├── server.ts           # boot: validate env, connect DB, listen
│       ├── app.ts              # Express setup + middleware
│       ├── config/
│       │   ├── env.ts          # Zod validation of process.env at boot
│       │   ├── db.ts           # Sequelize instance from env.DATABASE_URL
│       │   └── sequelize.cjs   # CommonJS config for sequelize-cli
│       ├── enums/
│       │   ├── UserRole.ts     # `as const` + helpers
│       │   └── LeaveStatus.ts
│       ├── constants/auth.ts   # SALT_ROUNDS, SESSION_TTL_MS
│       ├── auth/
│       │   ├── abilities.ts    # CASL — built from a user's permission set
│       │   └── permissions.ts  # PERMISSIONS const (single source of truth)
│       ├── middleware/
│       │   ├── auth.middleware.ts        # session lookup + sliding expiry
│       │   ├── authorize.middleware.ts   # requireAbility, requirePermission
│       │   ├── error.middleware.ts       # global error → JSON
│       │   ├── rate-limit.middleware.ts  # login brute-force protection
│       │   └── validate.middleware.ts    # Zod request body validation
│       ├── models/             # User, Role, Permission, Session, Attendance, LeaveType, LeaveRequest + associations
│       ├── modules/            # auth, attendance, leaves, users, leave-types
│       ├── migrations/         # 6 reversible migrations (roles+permissions, users, leave_types, leave_requests, attendance, sessions)
│       ├── seeders/            # roles+permissions, leave types, one user of each role
│       ├── types/express.d.ts  # augment Request with user + ability
│       └── utils/              # logger, http-error
└── frontend/
    ├── Dockerfile
    ├── .env                    # VITE_API_URL
    ├── package.json
    └── src/
        ├── main.tsx            # providers (Redux store, Router, Auth)
        ├── App.tsx             # route table with permission guards
        ├── index.css           # Tailwind entry
        ├── enums/              # mirrors backend (UserRole, LeaveStatus)
        ├── types/api.ts        # response shapes (AuthUser, Role, ...)
        ├── lib/
        │   ├── dates.ts        # formatting helpers
        │   ├── runMutation.ts  # RTK Query trigger wrapper (toast + boolean)
        │   ├── sessionFlash.ts # constant key for the login flash channel
        │   └── utils.ts        # cn() — tailwind className helper
        ├── auth/
        │   ├── abilities.ts        # CASL mirror — same rules as backend
        │   ├── permissions.ts      # PERMISSIONS const (mirrors backend)
        │   ├── AuthContext.tsx     # provider + useAuth hook
        │   ├── RequireAuth.tsx     # route guard (any authenticated)
        │   └── RequirePermission.tsx  # route guard (specific permission)
        ├── store/              # Redux Toolkit + RTK Query API slices
        │   ├── api.ts          # fetchBaseQuery + 401 → flash + redirect wrapper
        │   ├── auth.api.ts, attendance.api.ts, leaves.api.ts,
        │   │   users.api.ts, leaveTypes.api.ts
        │   ├── hooks.ts, index.ts
        ├── components/
        │   ├── Layout.tsx      # top bar + sidebar + ability-driven nav
        │   └── ui/             # shadcn/ui components (Radix primitives)
        └── pages/              # Login, Home, Attendance, Timesheet,
                                #   ApplyLeave, LeaveApproval,
                                #   UserManagement, LeaveTypes
```

## API summary

Routes annotated with `[<permission>]` are gated server-side via the
`requirePermission` middleware. `[auth]` requires only a valid session.

```
POST   /api/auth/login              {username,password} → {user}
                                    user = { id, username,
                                             role: { id, name },
                                             permissions: string[] }
POST   /api/auth/logout             [auth] → 204
GET    /api/auth/me                 [auth] → user (same shape as above)

GET    /api/attendance/today        [auth] → today's record (or null)
POST   /api/attendance/check-in     [attendance:write]
POST   /api/attendance/check-out    [attendance:write]
GET    /api/attendance/me           [auth] → own history (with hoursWorked)
GET    /api/attendance/team         [attendance:read:team] → reportees' history
GET    /api/attendance/all          [attendance:read:all] → org-wide

POST   /api/leaves                  [leave:apply] {leaveTypeId,startDate,endDate,reason}
GET    /api/leaves/me               [auth] → own
GET    /api/leaves/pending          [leave:read:pending] → requests from your direct reports (scoped by parent_id)
GET    /api/leaves/all              [leave:read:all] → all
POST   /api/leaves/:id/approve      [leave:approve] {remark}
POST   /api/leaves/:id/reject       [leave:approve] {remark}
DELETE /api/leaves/:id              [leave:cancel:own & pending] → 204

GET    /api/users                   [user:manage] → User[]
                                    User = { id, username,
                                             role: { id, name },
                                             parentId, isActive,
                                             createdAt, updatedAt }
POST   /api/users                   [user:manage] {username,password,role,parentId?} → 201 User
PATCH  /api/users/:id               [user:manage] {role?, parentId?, isActive?} → User

GET    /api/leave-types             [auth] → list
POST   /api/leave-types             [leave_type:manage] {name, annualQuota} → 201
PATCH  /api/leave-types/:id         [leave_type:manage]
DELETE /api/leave-types/:id         [leave_type:manage] → 204

GET    /health                      → {status:"ok"}
```

## Environment variables

Both `.env` files are gitignored. Templates are committed as `.env.example`
on each side — copy them once before the first run (see Quickstart).

`backend/.env` — required. The Zod schema in `src/config/env.ts` validates
these at boot and exits with a clear error if any are missing/invalid.

```
POSTGRES_USER=app_user
POSTGRES_PASSWORD=app_password
POSTGRES_DB=app_db
DATABASE_URL=postgres://app_user:app_password@postgres:5432/app_db
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

`frontend/.env`:

```
VITE_API_URL=http://localhost:3000
```

## Authentication & session expiry

- Login (`POST /api/auth/login`) creates a server-side session row keyed by an
  opaque UUID. The token is delivered as an **httpOnly cookie** (`Secure` in
  prod, `SameSite=Lax`); the frontend never touches it directly. RTK Query
  uses `credentials: 'include'` so the cookie is sent automatically.
- Every authenticated request looks up the session, rejects it if
  `now() - last_activity_at > 15 min`, otherwise updates `last_activity_at`.
  This is a true **sliding inactivity** expiry, per spec Section 3.4.
- Logout (`POST /api/auth/logout`) deletes the session row and clears the cookie.
- The frontend's RTK Query baseQuery wrapper (`store/api.ts`) catches any 401,
  stashes a "Session expired" flash message in `sessionStorage`, and redirects
  to `/login` where the Login page reads and displays it.
- The `/api/auth/login` endpoint is rate-limited to **10 attempts per 15 min per IP**
  (returns 429 with the standard IETF `RateLimit-*` headers).

## Workflow specifics

- **Once-per-day check-in** is enforced by a `UNIQUE(user_id, date)` constraint on
  the `attendance` table plus a service-level pre-check for a friendly 409.
- **Mandatory remark** on approve/reject is enforced by Zod (`min(1)`).
- **Manager cannot act on own leave** is enforced by both CASL (`userId: { $ne: user.id }`)
  and a service-level check.
- **Approval is uniform across roles**: a Manager or HR can act on a leave
  request only when `requester.parent_id === actor.id`. The same query works
  for both — Manager sees Employees' leaves, HR sees Managers' leaves —
  because the parent-role rule (validated in `users.service.validateParent`)
  guarantees who can be whose parent. The Leave Approval page (spec §5.5
  wording: "Available to Managers only") is therefore also reachable by HR;
  without that, manager leaves would have no UI path to be acted on (spec §6).
- **Annual leave quota** is enforced server-side on `POST /api/leaves`: the
  service sums Pending + Approved days for the requesting user / leave type
  in the current calendar year and rejects (400) if `used + requested > quota`.
- **Cancel-while-pending** for the requester is supported via `DELETE /api/leaves/:id`,
  guarded by status === 'pending'.

## Schema note: team hierarchy

The spec mentions "teams" in its schema discussion. This codebase models the
team relationship via a single self-referential `users.parent_id` foreign key
rather than a separate `teams` table. The same column expresses two
relationships, with the child's role determining what kind of parent is valid:

| Child role | Valid parent | Where enforced |
|---|---|---|
| Employee | Manager | `users.service.validateParent` |
| Manager  | HR      | `users.service.validateParent` |
| HR       | NULL    | `users.service.validateParent` |

This unifies team queries: `WHERE parent_id = :actor.id` returns the right
rows for both Manager (sees Employees) and HR (sees Managers).

### Where the rule is enforced

Role-typing for `parent_id` is enforced in TypeScript at
`backend/src/modules/users/users.service.ts:validateParent`. It's the
single source of truth — called from `create()` and from `update()`
whenever role or parentId changes, and throws `HttpError(400, ...)` on
any violation.

The DB provides the FK constraint and `users_parent_id_idx` (Postgres
doesn't auto-index FK child columns), but the role-pair rule itself is
not enforced at the database. Anything that bypasses the service layer
(raw SQL, future seeders that skip validation) can produce inconsistent
rows — keep that in mind if you ever script direct DB writes.

## Submission deliverables

```bash
make zip
# Produces:
#   backend.zip
#   frontend.zip
#   database.sql        (CREATE TABLE + INSERT seeds)
```

## Notes / known limitations

- This is a single-machine dev setup; no TLS, no production deploy config.
- No automated tests; manual smoke testing covered every cell of the matrix.
- No pagination on listings (works at 3 users / a few hundred records).
- `tsx watch` is used for backend hot-reload; for production you'd compile via `tsc` and run `node dist/server.js`.
