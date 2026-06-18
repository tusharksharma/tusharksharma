// One-time setup: run `npm run setup:youtube`, approve access in the browser
// tab that opens, and a refresh token gets saved into your .env automatically.
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const http = require('http');
const url = require('url');
const { google } = require('googleapis');
const open = require('open');
const { updateEnvFile } = require('../lib/env-util');

const PORT = 3000;
const REDIRECT_URI = `http://localhost:${PORT}/oauth/youtube/callback`;

if (!process.env.YT_CLIENT_ID || !process.env.YT_CLIENT_SECRET) {
  console.error(
    'Missing YT_CLIENT_ID / YT_CLIENT_SECRET.\n' +
    'Create them in the Google Cloud Console (OAuth client, type "Desktop app" or "Web app"\n' +
    'with http://localhost:3000/oauth/youtube/callback as an authorized redirect URI),\n' +
    'then paste them into your .env file before running this again.'
  );
  process.exit(1);
}

const oAuth2Client = new google.auth.OAuth2(
  process.env.YT_CLIENT_ID,
  process.env.YT_CLIENT_SECRET,
  REDIRECT_URI
);

const authUrl = oAuth2Client.generateAuthUrl({
  access_type: 'offline',
  prompt: 'consent',
  scope: ['https://www.googleapis.com/auth/youtube.upload']
});

const server = http.createServer(async (req, res) => {
  const parsed = url.parse(req.url, true);

  if (parsed.pathname !== '/oauth/youtube/callback') {
    res.end('Waiting for YouTube authorization in the other tab...');
    return;
  }

  const code = parsed.query.code;
  if (!code) {
    res.end('No authorization code received. Close this tab and try again.');
    server.close();
    return;
  }

  try {
    const { tokens } = await oAuth2Client.getToken(code);
    if (!tokens.refresh_token) {
      res.end(
        'Google didn\'t return a refresh token (this happens if you\'ve already granted ' +
        'this app access before). Revoke access at https://myaccount.google.com/permissions ' +
        'and run npm run setup:youtube again.'
      );
      console.log('No refresh token returned. See message in the browser tab for next steps.');
    } else {
      updateEnvFile({ YT_REFRESH_TOKEN: tokens.refresh_token });
      res.end('YouTube connected! You can close this tab and head back to the terminal.');
      console.log('Saved YT_REFRESH_TOKEN to .env. YouTube is connected.');
    }
  } catch (err) {
    console.error(err.message);
    res.end('Something went wrong exchanging the code — check the terminal for details.');
  } finally {
    server.close();
  }
});

server.listen(PORT, () => {
  console.log('Opening your browser to connect your YouTube channel...');
  console.log('If it doesn\'t open automatically, visit this URL:\n' + authUrl);
  open(authUrl);
});
