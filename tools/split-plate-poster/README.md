# Split Plate Poster

A small local tool: drop in a video, write a caption, hit one button, and it
posts to YouTube Shorts, Instagram Reels, and TikTok at the same time.

It runs entirely on your own computer — nothing is sent to a third-party
service. You connect each platform once (via that platform's own login), and
after that you just run `npm start` whenever you want to post.

## Before you start

You'll need three things from three different developer consoles. None of
this costs money, but it takes about 30–45 minutes total the first time
through. Do them in this order — Google is the quickest win, TikTok takes the
longest because of the review queue.

### 1. YouTube (Google Cloud Console)

1. Go to [console.cloud.google.com](https://console.cloud.google.com) and create a project (any name).
2. In **APIs & Services → Library**, search for "YouTube Data API v3" and enable it.
3. In **APIs & Services → Credentials**, click **Create Credentials → OAuth client ID**.
   - Application type: **Web application**
   - Authorized redirect URI: `http://localhost:3000/oauth/youtube/callback`
4. Copy the **Client ID** and **Client Secret** into your `.env` file as `YT_CLIENT_ID` and `YT_CLIENT_SECRET`.
5. On the **OAuth consent screen**, you can leave the app in **Testing** mode — since you're only ever authorizing your own channel, you never need to submit it for Google's verification.

### 2. Instagram (Meta for Developers)

Your Instagram account needs to be a **Business or Creator account** (Settings → Account type → Switch to professional account, in the Instagram app).

1. Go to [developers.facebook.com](https://developers.facebook.com), create a Meta app, and add the **Instagram** product to it.
2. Go to **Instagram → API setup with Instagram login**.
3. Under **App roles → Roles**, add yourself as an **Instagram Tester**, then accept the invite from inside the Instagram app (Settings → Website permissions → Apps and websites → Tester invites).
4. Back in the developer dashboard, generate a **long-lived access token** for your account.
5. Paste that token into `.env` as `IG_ACCESS_TOKEN`.
6. Find your **Instagram User ID** (shown alongside the token, or via the Graph API Explorer) and paste it into `.env` as `IG_USER_ID`.

Because this app only ever touches your own account, it stays in Meta's
"Standard Access" / development mode — no app review needed.

One thing to maintain: the access token is long-lived but not permanent —
plan to regenerate it from the same dashboard page every couple of months.

### 3. TikTok (TikTok for Developers) — read this part carefully

1. Go to [developers.tiktok.com](https://developers.tiktok.com) and create an app with the **Content Posting API** product enabled.
2. Add `http://localhost:3000/oauth/tiktok/callback` as a redirect URI.
3. Copy the **Client Key** and **Client Secret** into `.env` as `TIKTOK_CLIENT_KEY` and `TIKTOK_CLIENT_SECRET`.

**The catch:** TikTok only lets unaudited apps post videos as **private**
(visible to you only). To post publicly through the API, your app has to pass
TikTok's content audit — and TikTok's own guidelines explicitly list "a tool
to help upload content to accounts you or your team manage" as a use case
they won't approve for that audit. In practice, that means this tool can
upload the video for you, but you'll still need to open the TikTok app
afterward and flip the post from private to public yourself. It still saves
you the trim/caption/upload steps — just not the very last tap.

If TikTok ever changes this for your account, set `TIKTOK_PRIVACY_LEVEL=PUBLIC_TO_EVERYONE`
in your `.env` and the tool will request public posting directly.

## Setup

```bash
npm install
cp .env.example .env
```

Fill in the YouTube and TikTok client credentials and the Instagram token/user ID as described above, then connect each account:

```bash
npm run setup:youtube   # opens a browser tab, approve access, done
npm run setup:tiktok    # same idea
```

(Instagram doesn't need this step — its token was generated directly in the Meta dashboard.)

## Running it

```bash
npm start
```

Then open [http://localhost:3000](http://localhost:3000), drop in a video, write your caption, pick which platforms to post to, and hit **Post everywhere**.

## Good to know

- **Video format:** vertical 9:16, MP4, under 60 seconds is the safest bet across all three platforms.
- **YouTube:** posts go live immediately and publicly. `#Shorts` gets added to the description automatically if it's not already there.
- **Instagram:** posts as a Reel. Processing can take 30 seconds to a couple of minutes before it's confirmed live — the tool waits for that automatically.
- **TikTok:** lands as private until you flip it to public in-app (see above). Tokens expire after 24 hours; the tool refreshes them automatically using the saved refresh token, so you shouldn't need to re-run `npm run setup:tiktok` unless TikTok asks you to re-authorize (refresh tokens last 365 days).
- **Captions:** the same caption is sent to all three platforms. YouTube also gets a separate, shorter title (taken from the start of the caption).
- Nothing here handles scheduling — it posts the moment you click the button. That was a deliberate choice to keep this simple; happy to add a "post at a specific time" option later if it'd help.

## If something breaks

The results panel will show the actual error message from whichever platform
failed — that's almost always more useful than guessing. Common ones:

- **"isn't connected yet"** → you skipped one of the `npm run setup:*` steps, or a `.env` value is missing.
- **TikTok "spam_risk" or similar errors** → TikTok throttles accounts that post the same content repeatedly while testing; wait a bit between attempts.
- **Instagram "media not ready"** → very rare, usually means the video file is unusually large; try a shorter clip.
