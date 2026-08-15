# Sarva Investor Intelligence Room

Standalone, access-controlled investor data room for Sarva. This project is intentionally separate from Sarva's production application.

## What is included

- Premium Sarva-branded investor dashboard
- 11-section diligence library
- Company overview, product, traction, market, business model, financials, team, legal, technology/IP, customer/vendor proof, and recognition/network
- Internal fundraising intelligence area for investor CRM, opportunities, and activity
- Server-side email allowlist + shared access code
- HttpOnly 8-hour session cookie
- Read-only Google Drive adapter
- Responsive desktop/mobile interface
- Search across the diligence structure

## Recommended Google Drive structure

Create one dedicated folder named `SARVA — INVESTOR DATA ROOM` and add:

```text
01 — Company Overview
02 — Product
03 — Traction
04 — Market
05 — Business Model
06 — Financials
07 — Team
08 — Legal & Corporate
09 — Technology & IP
10 — Customer & Vendor Proof
11 — Recognition & Network
```

Keep the investor CRM, outreach notes, passed investors, private fundraising strategy, and founder-only material outside the Drive folder shared with investors.

## Local setup

```bash
cd sarva-dataroom
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

## Access control

Set these deployment environment variables:

- `DATA_ROOM_ALLOWED_EMAILS` — comma-separated approved email addresses. Add Dipseka and approved advisors only.
- `DATA_ROOM_ACCESS_CODE` — private shared access code.
- `DATA_ROOM_SESSION_TOKEN` — long random secret used as the server-side session value.

Do not commit real credentials.

## Google Drive connection

1. Create a Google Cloud service account dedicated to this data room.
2. Enable the Google Drive API.
3. Share only the `SARVA — INVESTOR DATA ROOM` folder with the service account email as Viewer.
4. Set `GOOGLE_DRIVE_CLIENT_EMAIL`, `GOOGLE_DRIVE_PRIVATE_KEY`, and `GOOGLE_DRIVE_ROOT_FOLDER_ID` in the deployment environment.
5. The app's `/api/drive` endpoint then lists the root folder; pass `?folderId=...` to list a child folder.

The Drive scope is `drive.readonly`; the website cannot modify or delete your Drive documents.

## Deployment

This folder can be deployed as an independent Vercel project with the Root Directory set to `sarva-dataroom`.

Suggested final URL: `investors.sarvabazaar.com`.

## Security note

The current personal `FarhanAzim-sarva/Farhan` repository is public. This project therefore contains no confidential documents, approved-email list, access code, session secret, or Google credentials. All sensitive values belong in Vercel/environment settings and all diligence documents remain in the private Google Drive folder.

For maximum confidentiality, move this folder into a dedicated **private** personal GitHub repository before production deployment.
