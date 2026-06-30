# EkkiEinn.is — Admin User Management Panel

## Goal
Upgrade the admin user list (`/admin/notendur` or wherever the user table lives) into a full user management panel where admins can view details, see user posts, edit info, and reset passwords.

## Current State
- Admin page shows a table: Netfang, Gælunafn, Staðfest, Staða, Hlutverk, Vista
- No way to click on a user for details
- No way to see a user's posts/threads
- No way to edit user information
- No way to send/reset password

## Requirements

### 1. Clickable User Rows
- Each user row in the table must be clickable
- Clicking opens a **user detail panel/page** (can be a slide-out panel or a dedicated page like `/admin/notendur/[id]`)

### 2. User Detail View
Show ALL information about the user:
- **Netfang** (email)
- **Nafn** (display name / gælunafn)  
- **Hlutverk** (role: ADMIN / USER)
- **Staða** (status: Samþykkt / Bíður / Hafnað)
- **Staðfest** (email verified: Já/Nei)
- **Skráði sig** (registration date)
- **Síðast innskráður** (last login date — add field to User model if missing)
- **Fjöldi pósta** (number of posts/threads by this user)
- **IP tala** (if tracked)

### 3. User's Posts/Threads
- Below the user info, show a **list of all posts/threads** created by this user
- Each post should show: title, category, date, status (visible/hidden)
- Clicking a post opens it (or links to it)
- Admin can hide/unhide posts directly from this view

### 4. Edit User Information
Admin must be able to edit:
- **Nafn** (display name)
- **Hlutverk** (role) — dropdown: USER / ADMIN
- **Staða** (status) — dropdown: Samþykkt / Bíður / Hafnað
- **Staðfest** (verified) — toggle
- Save button to persist changes

### 5. Reset/Send New Password
- Button: **"Senda nýtt lykilorð"**
- Generates a new random password
- Sends email to the user with the new password
- Shows confirmation to admin: "Nýtt lykilorð sent á [email]"
- Alternative: "Send password reset link" that sends a link to set new password

### 6. Delete User
- Button: **"Eyða notanda"** with confirmation dialog
- "Ertu viss? Þetta eyðir notandanum og öllum póstum hans."
- Deletes user and optionally their posts (or marks posts as [Eytt notandi])

## UI Style
- Match existing admin dark theme (same as current admin pages)
- Gold accents for buttons, consistent with site branding
- Mobile-friendly — must work on phone screens
- Table should be sortable by columns (name, date, status, role)

## Database Changes (if needed)
- Add `lastLoginAt` field to User model if not present
- Ensure User → Thread/Post relation is queryable

## API Endpoints Needed
- `GET /api/admin/users` — list all users with counts
- `GET /api/admin/users/[id]` — single user with all their posts
- `PATCH /api/admin/users/[id]` — update user info
- `POST /api/admin/users/[id]/reset-password` — reset and send new password
- `DELETE /api/admin/users/[id]` — delete user

## Important
- Only ADMIN role users can access these endpoints
- All changes must be logged (console.log at minimum)
- Do NOT break existing functionality
- Use existing Prisma schema patterns from the codebase
- Email for password reset must use the existing email.ts sendmail transport
