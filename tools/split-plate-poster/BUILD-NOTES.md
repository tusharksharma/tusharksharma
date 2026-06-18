# Split Plate Poster — Build Notes

A local Node/Express tool that posts one vertical video to **YouTube Shorts**,
**Instagram Reels**, and **TikTok** from a single page — with **per-platform
captions** and **brand `@handle` auto-tagging**. Runs entirely on your own
machine; tokens live in a local `.env` and never leave it.

These notes capture everything needed to rebuild it on a fresh system,
**including the non-obvious gotchas** we hit for each platform.

---

## Quick start

```bash
cd tools/split-plate-poster
npm install
cp .env.example .env          # then fill in credentials (see below)
npm run setup:youtube         # one-time browser OAuth → writes YT_REFRESH_TOKEN
npm run setup:tiktok          # one-time browser OAuth → writes TikTok tokens
npm start                     # → http://localhost:3000
```

Instagram needs no `setup:*` step — its token is generated in the Meta dashboard.

---

## Architecture

| File | Role |
|------|------|
| `server.js` | Express server. Serves `public/`, exposes `GET /api/brands` and `POST /api/post` (multipart: video + per-platform captions). Fans out to the three lib modules. |
| `lib/youtube.js` | `googleapis`; uploads a public YouTube Short. |
| `lib/instagram.js` | Instagram Graph API via **graph.instagram.com**; resumable Reel upload + publish. |
| `lib/tiktok.js` | TikTok Content Posting API; chunked `FILE_UPLOAD`; defaults to `SELF_ONLY`. |
| `lib/brands.js` | Brand `{slug}` → per-platform handle map + `expandCaption()`. |
| `lib/env-util.js` | Persists OAuth tokens back into `.env`. |
| `auth/youtube-setup.js`, `auth/tiktok-setup.js` | One-time OAuth connect flows. |
| `public/` | Single-page UI: base caption + 3 editable per-platform caption boxes + brand chips. |

### Posting model
You write **one base caption** (with optional `{slug}` brand tokens). The UI shows
**three editable boxes** — YouTube / Instagram / TikTok — each pre-filled by
expanding the base for that platform, and individually editable. On submit, each
selected platform receives **its own** caption.

---

## Credentials & the gotchas that matter

### YouTube (easiest)
1. Google Cloud Console → new project → enable **YouTube Data API v3**.
2. **OAuth client** (type: Web application), redirect URI
   `http://localhost:3000/oauth/youtube/callback`.
3. OAuth consent screen: leave in **Testing**, add yourself as a **Test user**
   (otherwise the connect is blocked with "access denied").
4. `.env`: `YT_CLIENT_ID`, `YT_CLIENT_SECRET`. `npm run setup:youtube` writes `YT_REFRESH_TOKEN`.
- ✅ Google **allows** `localhost` redirect URIs. Posts go live + public immediately.

### Instagram (the graph-domain gotcha)
1. Meta app (developers.facebook.com) → use case **"Manage messaging & content on
   Instagram"** → **API setup with Instagram login**.
2. Account must be **Business/Creator**. Add yourself as an **Instagram Tester**
   and accept the invite — the in-app menu is flaky; the reliable accept path is
   the web: `https://www.instagram.com/accounts/manage_access/`.
3. Add the **`instagram_business_content_publish`** permission (needed to post Reels).
4. Generate a **long-lived access token** → `IG_ACCESS_TOKEN`; the **Instagram user
   ID** (the `17841…` number) → `IG_USER_ID`.
- ⚠️ **GOTCHA:** Instagram-login tokens (they start with `IGAA…`) are **only valid
  against `graph.instagram.com`**, *not* `graph.facebook.com` (the latter returns
  `Invalid OAuth access token`). `lib/instagram.js` therefore targets
  `graph.instagram.com`. Sanity-check a token with:
  `GET https://graph.instagram.com/v21.0/me?fields=user_id,username` and
  `POST https://graph.instagram.com/v21.0/<IG_USER_ID>/content_publishing_limit`.
- Token is long-lived but not permanent — regenerate every ~60 days.

### TikTok (the hard one)
1. developers.tiktok.com → app with **Content Posting API** (toggle **Direct Post**
   ON) and **Login Kit**. Scopes: **`video.publish`**, **`video.upload`**.
2. `.env`: `TIKTOK_CLIENT_KEY`, `TIKTOK_CLIENT_SECRET`. `npm run setup:tiktok`
   writes `TIKTOK_ACCESS_TOKEN` + `TIKTOK_REFRESH_TOKEN`.
- ⚠️ **GOTCHA 1 — no localhost redirects.** TikTok rejects `http://localhost` redirect
  URIs ("redirect_uri ... localhost is not supported"). Workaround: a **public HTTPS
  bridge page** hosted on your verified domain that forwards the OAuth result back to
  the local server. Ours lives at `https://thesplitplate.com/oauth/tiktok/callback`
  (see the site's `public/oauth/tiktok/callback/index.html`) and forwards
  `?code&state` to `http://localhost:3000/oauth/tiktok/callback`. The setup script
  uses `TIKTOK_REDIRECT_URI` (defaults to that bridge) for the OAuth `redirect_uri`;
  the local listener path is unchanged.
- ⚠️ **GOTCHA 2 — domain verification.** The redirect domain must be verified. Use a
  **URL-prefix** property + **signature file** hosted at the site root
  (`tiktok<random>.txt`). (The "Domain" property type needs a DNS TXT record instead.)
- ⚠️ **GOTCHA 3 — private only.** An **unaudited** TikTok app can only post
  `SELF_ONLY` (private). Public posting needs TikTok's content audit, which their
  guidelines say they **won't approve** for "a tool to upload content to accounts you
  manage." So the tool defaults `privacy_level=SELF_ONLY`; you flip posts to public in
  the TikTok app by hand. (Set `TIKTOK_PRIVACY_LEVEL=PUBLIC_TO_EVERYONE` only if your
  app is ever audited.)
- For testing without review, use a **Sandbox**: it has its own client key/secret and
  needs your TikTok account added as a **Target user**. Sandbox `creator_info` even
  exposes `PUBLIC_TO_EVERYONE`, useful for recording a review demo.
- Access token expires in 24h; refreshed automatically via the refresh token (365-day life).

---

## Supporting pages (in the recipes-site repo, served on thesplitplate.com)

These exist to satisfy the platform requirements above:

- `/privacy`, `/terms` — required URLs for TikTok app registration. (`src/pages/PrivacyPage.jsx`, `TermsPage.jsx`)
- `/<tiktok-verification>.txt` — domain ownership signature file (`public/` root).
- `/oauth/tiktok/callback` — the OAuth bridge page (`public/oauth/tiktok/callback/index.html`).
- `/studio` — a password-gated **manual** caption composer that mirrors the poster's
  per-platform caption logic (`src/pages/StudioPage.jsx`, `src/data/brandHandles.js`)
  for composing-and-hand-pasting from any device.

---

## Environment variables (`.env`)

```
YT_CLIENT_ID=            # Google Cloud OAuth client
YT_CLIENT_SECRET=
YT_REFRESH_TOKEN=        # auto-written by setup:youtube

IG_ACCESS_TOKEN=         # Meta long-lived Instagram-login token (IGAA…)
IG_USER_ID=              # Instagram user id (17841…)

TIKTOK_CLIENT_KEY=
TIKTOK_CLIENT_SECRET=
TIKTOK_ACCESS_TOKEN=     # auto-written by setup:tiktok
TIKTOK_REFRESH_TOKEN=    # auto-written by setup:tiktok

PORT=3000
# Optional:
# TIKTOK_REDIRECT_URI=https://thesplitplate.com/oauth/tiktok/callback
# TIKTOK_PRIVACY_LEVEL=PUBLIC_TO_EVERYONE   # only if the TikTok app is audited
```

> `.env` is gitignored and must never be committed — it holds live tokens, and this
> repo is public.

---

## Brand tagging

Write `{slug}` tokens in a caption (e.g. `made with {raos} marinara`). At post time
each platform's caption resolves the token to that platform's handle. Map lives in
`lib/brands.js` (and `src/data/brandHandles.js` for `/studio`). Fallbacks ensure a
**fake `@` is never posted**:

- brand known + handle for that platform → `@handle`
- brand known + handle missing for that platform → brand's plain name
- token not in the map → the slug text, unbraced

Add YouTube handles / new brands by editing the `BRANDS` object in both files.
