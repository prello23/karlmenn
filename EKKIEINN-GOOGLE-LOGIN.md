# EkkiEinn.is — Google Login Integration

## Overview
Add Google OAuth login/registration alongside the existing email/password auth.
This makes signup easier and helps with gender detection (Google profiles often contain given names that map well to Icelandic gender databases).

## Requirements

### NextAuth Google Provider
- Add `GoogleProvider` to the existing NextAuth configuration
- Keep existing `CredentialsProvider` — Google is an ADDITIONAL option, not a replacement
- On first Google login, auto-create user account:
  - `email` from Google profile
  - `name` from Google profile (given_name + family_name)
  - `password` can be null for Google-only users
  - Run the existing gender detection logic on the name (same as registration)
  - Set `emailVerified: true` automatically (Google already verified it)
- On subsequent Google logins, match by email and log in
- If a user already exists with that email (registered via email/password), link the Google account to the existing user — do NOT create a duplicate

### Google OAuth Credentials
- **Using existing Google Cloud project "Ferdakerfi" OAuth client** (shared with bakvaktin.is)
- Authorized JavaScript origins: `https://ekkieinn.is` ✅ ADDED
- Authorized redirect URIs: `https://ekkieinn.is/api/auth/callback/google` ✅ ADDED
- **Credentials already added to `.env`** — read `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` from `.env`
- DO NOT hardcode the credentials in source code

### UI Changes

#### Login page (`/innskraning`)
- Add "Skrá inn með Google" button ABOVE the existing email/password form
- Use Google's official colors (white background, Google "G" logo)
- Add a divider line with "eða" between Google button and email form
- Button text: "Skrá inn með Google"

#### Registration page (`/nyskraning`)
- Add "Nýskrá með Google" button ABOVE the existing registration form
- Same Google styling
- Divider "eða" between Google button and manual form
- Button text: "Nýskrá með Google"
- When user registers via Google, skip the email/password fields — name and email come from Google
- Still run gender detection on the name

### Gender Detection
- When a user signs in via Google for the first time, extract `given_name` from the Google profile
- Run the SAME gender detection logic already used in registration (the Icelandic name-based system)
- Save the detected gender to the user record

### Security
- Ensure CSRF protection works with NextAuth Google flow
- Do NOT expose Google client secret in frontend code

## Technical Notes
- ekkieinn.is uses Next.js 15 + NextAuth + Prisma (SQLite)
- The existing auth config is in the NextAuth route handler
- The Prisma schema has a `User` model — may need to add `provider` field or use NextAuth's built-in Account model
- Check if Prisma schema already has `Account` and `Session` models for NextAuth adapter; if not, add them

## DO NOT
- Remove or change existing email/password login
- Break existing user sessions
- Change any other functionality
