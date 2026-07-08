# Esperance Web

Light-mode web UI for Esperance file storage. Talks to the PiDrive API
running on the Pi (`https://files.esperanceproject.org`).

## Local development

```bash
npm install
cp .env.example .env.local
npm run dev
```

Visit `http://localhost:3000` — it'll redirect to `/login`.

## Deploying to Vercel

1. Push this folder to a GitHub repo (or drag-and-drop deploy via Vercel CLI)
2. In Vercel: **New Project** → import the repo
3. Under **Environment Variables**, add:
   - `NEXT_PUBLIC_API_URL` = `https://files.esperanceproject.org`
4. Deploy

That's it — Vercel handles the build automatically since this is a
standard Next.js app.

## How it works

- `/login` — signs in against `POST /auth/login` on the Pi API, stores the
  returned JWT in `localStorage`
- `/files` — lists/uploads/downloads/deletes/renames files, all requests
  carry the JWT as a Bearer token
- No token in `localStorage` → redirected to `/login` automatically
- A 401 response from the API (expired/invalid token) also bounces back
  to `/login`

## Design system

- **Colors:** warm paper background (`#FAFAF7`), deep sage accent (`#3E6259`),
  warm rust reserved only for destructive actions (`#B54B3A`)
- **Type:** Fraunces (serif) for the wordmark/headings, Inter for UI text,
  IBM Plex Mono for file sizes/dates
- All tokens live as CSS variables in `app/globals.css` if you want to
  adjust the palette later

## Notes for employees rollout

Each employee logs in with their own email/password (created by you via
the `/auth/register` endpoint on the Pi — see the API's README). There's
no public self-signup, so accounts are admin-created only.
