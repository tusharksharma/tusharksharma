// One-time setup: run `npm run setup:tiktok`, log in and approve access in the
// browser tab that opens, and your tokens get saved into .env automatically.
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const http = require('http');
const url = require('url');
const crypto = require('crypto');
const axios = require('axios');
const open = require('open');
const { updateEnvFile } = require('../lib/env-util');

const PORT = 3000;
// TikTok rejects localhost redirect URIs, so OAuth must use a public HTTPS URL.
// We register a bridge page on the (domain-verified) site that forwards the
// auth code back to this local server. The local listener path is unchanged;
// only the redirect_uri sent to TikTok differs. Override via TIKTOK_REDIRECT_URI.
const REDIRECT_URI =
  process.env.TIKTOK_REDIRECT_URI || 'https://thesplitplate.com/oauth/tiktok/callback';
const { TIKTOK_CLIENT_KEY, TIKTOK_CLIENT_SECRET } = process.env;

if (!TIKTOK_CLIENT_KEY || !TIKTOK_CLIENT_SECRET) {
  console.error(
    'Missing TIKTOK_CLIENT_KEY / TIKTOK_CLIENT_SECRET.\n' +
    'Create an app at developers.tiktok.com with the Content Posting API product enabled,\n' +
    'add http://localhost:3000/oauth/tiktok/callback as a redirect URI, then paste the\n' +
    'client key/secret into your .env file before running this again.'
  );
  process.exit(1);
}

const state = crypto.randomBytes(8).toString('hex');
const authUrl =
  'https://www.tiktok.com/v2/auth/authorize/?' +
  new URLSearchParams({
    client_key: TIKTOK_CLIENT_KEY,
    scope: 'video.publish,video.upload',
    response_type: 'code',
    redirect_uri: REDIRECT_URI,
    state
  }).toString();

const server = http.createServer(async (req, res) => {
  const parsed = url.parse(req.url, true);

  if (parsed.pathname !== '/oauth/tiktok/callback') {
    res.end('Waiting for TikTok authorization in the other tab...');
    return;
  }

  if (parsed.query.state !== state) {
    res.end('State mismatch — close this tab and run npm run setup:tiktok again.');
    server.close();
    return;
  }

  const code = parsed.query.code;
  if (!code) {
    res.end('No authorization code received. Close this tab and try again.');
    server.close();
    return;
  }

  try {
    const tokenRes = await axios.post(
      'https://open.tiktokapis.com/v2/oauth/token/',
      new URLSearchParams({
        client_key: TIKTOK_CLIENT_KEY,
        client_secret: TIKTOK_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
        redirect_uri: REDIRECT_URI
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    const { access_token, refresh_token } = tokenRes.data;
    updateEnvFile({ TIKTOK_ACCESS_TOKEN: access_token, TIKTOK_REFRESH_TOKEN: refresh_token });

    res.end('TikTok connected! You can close this tab and head back to the terminal.');
    console.log('Saved TikTok tokens to .env. TikTok is connected.');
    console.log(
      '\nReminder: until your TikTok developer app passes their content audit, ' +
      'uploads from this tool will land as private (SELF_ONLY). See the README ' +
      'for details on applying for the audit.'
    );
  } catch (err) {
    console.error(err.response ? err.response.data : err.message);
    res.end('Something went wrong exchanging the code — check the terminal for details.');
  } finally {
    server.close();
  }
});

server.listen(PORT, () => {
  console.log('Opening your browser to connect your TikTok account...');
  console.log('If it doesn\'t open automatically, visit this URL:\n' + authUrl);
  open(authUrl);
});
