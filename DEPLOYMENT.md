# Deploying the Admin Frontend (e.g. Vercel)

## Fixing 404 NOT_FOUND and login errors

If you see **404: NOT_FOUND** and cannot log in on the hosted site, the frontend is calling the wrong API URL (it was defaulting to the frontend’s own URL).

### 1. Set the backend API URL

Set the **admin backend** base URL in your host’s environment variables.

**On Vercel**

1. Open your project → **Settings** → **Environment Variables**.
2. Add:
   - **Name:** `VITE_API_URL`
   - **Value:** your admin API base URL (no trailing slash), e.g. `https://your-admin-api.vercel.app` or `https://api.sendcoins.com/admin`
3. Redeploy so the new variable is applied.

The frontend uses this for all API calls (login, refresh, `/auth/admin/*`, etc.). If `VITE_API_URL` is missing in production, requests go to the same origin and you get 404 NOT_FOUND.

### 2. SPA routing

`vercel.json` is set up so all routes are rewritten to `index.html`. Direct visits to `/login`, `/dashboard`, etc. should load the app correctly.

### 3. Backend

Ensure the **sendcoins-admin** NestJS backend is deployed and that its URL is exactly what you set as `VITE_API_URL`. The frontend expects endpoints like:

- `POST /auth/admin/login`
- `POST /auth/admin/refresh`
- `GET /auth/admin/me`
- etc.
