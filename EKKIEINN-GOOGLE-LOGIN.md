# EkkiEinn.is — Google Login Integration

## Overview
Add Google OAuth login/registration alongside the existing email/password auth.
This makes signup easier and helps with gender detection (Google profiles often contain given names).

## Requirements

### NextAuth Google Provider
- Add `GoogleProvider` to the existing NextAuth configuration
- Keep existing `CredentialsProvider` — Google is ADDITIONAL, not a replacement
- On first Google login, auto-create user account:
  - `email` from Google profile
  - `name` from Google profile (given_name + family_name)
  - `password` can be null for Google-only users
  - Run existing gender detection logic on the name
  - Set `emailVerified: true` automatically
- On subsequent Google logins, match by email and log in
- If user already exists with that email (email/password), link Google account — do NOT create duplicate

### Google OAuth Credentials
- Stored in `.env`:
  - `GOOGLE_CLIENT_ID=...`
  - `GOOGLE_CLIENT_SECRET=...`
- Redirect URI: `https://ekkieinn.is/api/auth/callback/google`

### UI Changes

#### Login page (`/innskraning`)
- Add "Skrá inn með Google" button ABOVE the existing email/password form
- Google official styling (white bg, Google "G" logo)
- Divider "eða" between Google button and email form

#### Registration page (`/nyskraning`)
- Add "Nýskrá með Google" button ABOVE the existing form
- Same Google styling, divider "eða"
- When registering via Google, skip email/password fields — name and email come from Google
- Still run gender detection on the name

### Gender Detection
- Extract `given_name` from Google profile on first login
- Run SAME gender detection logic already used in registration
- Save detected gender to user record

### Prisma Schema
- Check if `Account` and `Session` models exist for NextAuth adapter
- If not, add them (NextAuth Prisma adapter pattern)
- Add optional `provider` field to User if needed
- password field must be optional (nullable) for Google-only users

## DO NOT
- Remove or change existing email/password login
- Break existing user sessions
- Change any other functionality
