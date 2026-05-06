# Project context: Employee Attendance Portal (assignment)

This file is the **canonical reference** for what this codebase must do.
Before suggesting or making any change, verify it against this spec.
Anything that contradicts this spec is wrong, regardless of how the code
currently behaves.

---

## Assignment spec (verbatim)

**Stack** — React.js frontend, Node.js backend, PostgreSQL database, Sequelize ORM.
**Duration** — 3 days.

### 1. Overview

A web-based Employee Attendance Portal for a company with three roles —
Employee, Manager, HR — each with distinct capabilities and access
levels. The application handles attendance logging, leave management with
an approval workflow, and role-based permission control. Focus is on a
well-architected, secure fullstack application that reflects real-world
business logic.

### 2. User Roles

**2.1 Employee.** Mark own attendance, view own timesheet, apply for
leave, track status of own leave requests. Cannot view other employees'
data or take any action on leave requests.

**2.2 Manager.** All Employee capabilities plus: view attendance of
employees under them; approve or reject leave requests submitted by
their reportees with a remark. Cannot manage other managers or access
HR-level functions.

**2.3 HR.** Broadest access. View attendance org-wide; manage user
accounts (create, deactivate, assign roles, assign reporting manager);
configure leave types; view all leave requests regardless of status.
**HR does not participate in the leave approval workflow** — that
responsibility lies with the Manager.

### 3. Tech Stack (mandatory)

- **3.1 Frontend** — React.js with client-side routing. Any component
  library. Role-based rendering on the frontend (menus, pages, actions
  visible only to permitted users).
- **3.2 Backend** — Node.js, RESTful conventions. Every protected route
  validates the session token and verifies appropriate role/permissions
  before processing. **Role checks must be enforced server-side** —
  frontend-only is not acceptable.
- **3.3 Database** — PostgreSQL. **Sequelize as ORM.** Schema reflects
  relationships between users, roles, teams, attendance, leave requests.
  **Include migration files in the submission.**
- **3.4 Auth** — Login with username + password. Server issues a session
  token on success. **Token must expire after 15 minutes of inactivity
  — hard requirement.** Expired/missing tokens rejected server-side;
  frontend redirects to login page.

### 4. Permission matrix (enforced at API level)

| Action | Employee | Manager | HR |
|---|:-:|:-:|:-:|
| View own attendance | ✓ | ✓ | ✓ |
| Check in / Check out | ✓ | ✓ | ✗ |
| Apply for leave | ✓ | ✓ | ✗ |
| View own leave requests | ✓ | ✓ | ✓ |
| View team attendance | ✗ | ✓ | ✓ |
| Approve / Reject leave | ✗ | ✓ | ✗ |
| View all leave requests | ✗ | ✗ | ✓ |
| Create / Deactivate users | ✗ | ✗ | ✓ |
| Assign roles & managers | ✗ | ✗ | ✓ |
| Configure leave types | ✗ | ✗ | ✓ |
| View organization attendance | ✗ | ✗ | ✓ |

Restricted actions return appropriate HTTP errors.

### 5. Application Pages

- **5.1 Login Page.** Single login page for all roles. Identifies role
  post-authentication and redirects to appropriate landing page.
- **5.2 Check-in / Check-out Page.** Employees + Managers. Mark check-in
  and check-out for the day. Current status for the day clearly shown.
  **Cannot check in more than once per calendar day.**
- **5.3 Timesheet Page.** All roles. Own attendance history with date,
  check-in time, check-out time, total hours worked. Managers
  additionally have a view for employees reporting to them.
- **5.4 Apply Leave Page.** Employees + Managers. Form: leave type, start
  date, end date, reason. Lists past requests with status
  (Pending / Approved / Rejected) and the manager's remark.
- **5.5 Leave Approval Page.** Managers only. Lists pending leave
  requests from reportees. Approve or reject with **mandatory remark**.
- **5.6 User Management Page.** HR only. List all users. Create users
  (assign role Employee or Manager, assign reporting manager), deactivate
  accounts. **Deactivated users cannot log in.**
- **5.7 Leave Configuration Page.** HR only. Define and manage leave
  types — name + annual quota. Changes reflect across the system.

### 6. Leave Approval Workflow (maker-checker)

- Employee submits → request is created in **Pending** state.
- Request appears in the assigned Manager's Leave Approval page.
- Manager approves or rejects, **providing a remark in both cases**.
- Status updates to Approved or Rejected; remark stored and visible.
- Employee **cannot cancel or modify** once acted upon by manager.
- **Manager cannot approve or reject their own leave** — their requests
  follow the same workflow and must be handled by HR or a designated
  authority.

### 7. Constraints & Assumptions (hard)

- Session tokens expire after **15 minutes of inactivity**. Hard requirement.
- All permission checks **enforced server-side**. Frontend-only is insufficient.
- An employee or manager can only check in **once per calendar day**.
- A manager cannot act on their own leave requests.

### 8. Submission

- `README.md` — setup, env vars, DB creation, migrations, both servers.
- `frontend.zip` — complete React frontend source.
- `backend.zip` — complete Node backend source **including all Sequelize migrations**.
- `database.sql` — script that creates all tables AND seeds initial data,
  including at least one user of each role.

---

## How this codebase realises the spec (high-level map)

| Spec | Implementation |
|---|---|
| 3.4 sliding 15-min expiry | `backend/src/middleware/auth.middleware.ts` updates `lastActivityAt` on every request |
| 3.4 frontend redirect on 401 | `frontend/src/store/api.ts` baseQuery wrapper |
| 4 permission matrix | RBAC tables (`roles`, `permissions`, `role_permissions`); typed `PERMISSIONS` const at `backend/src/auth/permissions.ts` mirrored at `frontend/src/auth/permissions.ts`; `requirePermission` middleware |
| 5.x pages | `frontend/src/pages/{Login, Home, Attendance, Timesheet, ApplyLeave, LeaveApproval, UserManagement, LeaveTypes}.tsx` |
| 5.6 deactivate | UserManagement row action with confirmation; backend `PATCH /api/users/:id` `{ isActive: false }` |
| 6 maker-checker | Mandatory remark via Zod `min(1)`; status pending by default; `Cannot cancel after manager has acted` (409); manager-can't-self-approve check |
| 6 HR handles Manager leave | Parent-role rule (employee→manager→hr) routes Manager leaves to HR; CASL row-level rule `requester.parentId === actor.id` constrains HR to Manager leaves only |
| 7 once-per-day check-in | DB `UNIQUE(user_id, date)` + service-level pre-check |
| 7 manager cannot self-approve | Service-level `requester.id === actor.id` throw |

---

## Working agreements

- **Spec wins.** If existing code conflicts with this spec, the code is
  the bug. Fix the code, do not edit this spec.
- **Server-side first.** Every business rule lives on the backend. The
  frontend mirrors permissions for UX (CASL `<Can>`, `RequirePermission`
  routes) but is never the only enforcement.
- **No band-aids.** When the data shape changes, update the backend, the
  API, and the frontend together — don't paper over a mismatch in a
  controller.
- **Permissions are typed.** All permission strings flow from the
  `PERMISSIONS` const. Adding a new one means: backend `permissions.ts`
  → frontend `permissions.ts` → seeder `PERMISSIONS` array →
  `ROLE_PERMISSIONS` mapping → route gate → ability rule.
- **Migrations + seeders are reproducible.** `make db-reset` must always
  produce a working seeded DB (3 users, 12 permissions, 3 leave types).
- **Comments**: only WHY, one line max. Defaults to no comment.
