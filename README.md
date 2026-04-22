# ISTE Society Website

This project has been migrated to a full-stack Next.js app while preserving the same public website, protected author panel, session-based authentication, audit history, uploads, and backup/restore flow.

## Stack

- Next.js App Router
- React
- Local development fallback: SQLite (`node:sqlite` on Node 24+) and filesystem storage
- Vercel production path: Postgres and Vercel Blob

## Run Locally

```bash
cd "/Users/ritikchawla/Desktop/ISTE WEBSITE"
npm install
npm run dev
```

Open:

- `http://localhost:3000`

For a production check:

```bash
npm run build
npm start
```

## Author Login

Default bootstrap credentials:

- UID: `24BCS10191`
- Password: `ISTE@1609`

You can override them with environment variables:

```bash
ISTE_AUTHOR_UID="your-admin-uid" ISTE_AUTHOR_PASSWORD="your-strong-password" npm run dev
```

If you are deploying behind HTTPS, also set:

```bash
COOKIE_SECURE=1
```

## Features

- PBKDF2 password hashing with salt
- Session cookie authentication
- Local SQLite fallback for development
- Postgres support for Vercel deployment
- Vercel Blob support for poster uploads and logical backups
- Draft and published status for events and recruitment
- Edit, delete, and publish controls in the author panel
- Audit log tracking for admin actions
- Database backup creation from the dashboard
- Database restore from the dashboard with automatic safety backup
- Event poster upload support
- Legacy `.html` URLs redirected to their Next.js routes

## Data and Storage

Local development still keeps using the existing project folders:

- `data/` for the SQLite database
- `uploads/` for event posters
- `backups/` for database backup files
- `assets/` for branding images

When `DATABASE_URL` is set, the app switches to Postgres automatically.

When `BLOB_READ_WRITE_TOKEN` is set, uploaded posters and dashboard backups switch to Vercel Blob automatically.

## Vercel Deployment

The app is now wired for a Vercel-safe deployment model.

Required Vercel environment variables:

- `DATABASE_URL` for your managed Postgres database
- `BLOB_READ_WRITE_TOKEN` for Vercel Blob
- `ISTE_AUTHOR_UID`
- `ISTE_AUTHOR_PASSWORD`
- `COOKIE_SECURE=1`

Recommended setup steps:

```bash
cp .env.example .env.local
npm install
npm run migrate:vercel
npm run build
```

The migration script reads the current `data/iste.db`, copies records into Postgres, and uploads existing poster files to Vercel Blob when `BLOB_READ_WRITE_TOKEN` is present.

After that:

1. Push the project to GitHub.
2. Import the repo into Vercel.
3. Set the Node.js version to `24.x`.
4. Add the same environment variables in Vercel Project Settings.
5. Deploy.

Backup behavior on Vercel:

- Event posters are stored as public Blob URLs
- Dashboard backups are stored as private JSON snapshots in Blob
- Restore uses those logical snapshots to rebuild the live database safely
