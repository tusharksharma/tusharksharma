const fs = require('fs');
const { google } = require('googleapis');

const REDIRECT_URI = 'http://localhost:3000/oauth/youtube/callback';

function getOAuthClient() {
  const client = new google.auth.OAuth2(
    process.env.YT_CLIENT_ID,
    process.env.YT_CLIENT_SECRET,
    REDIRECT_URI
  );
  if (process.env.YT_REFRESH_TOKEN) {
    client.setCredentials({ refresh_token: process.env.YT_REFRESH_TOKEN });
  }
  return client;
}

/**
 * Uploads a local video file as a public YouTube Short.
 * @param {string} filePath - path to the video on disk
 * @param {string} title - video title (max 100 chars)
 * @param {string} description - video description
 */
async function uploadShort(filePath, title, description) {
  if (!process.env.YT_CLIENT_ID || !process.env.YT_CLIENT_SECRET) {
    throw new Error('Missing YT_CLIENT_ID / YT_CLIENT_SECRET in .env. See README for setup.');
  }
  if (!process.env.YT_REFRESH_TOKEN) {
    throw new Error('YouTube isn\'t connected yet. Run: npm run setup:youtube');
  }

  const auth = getOAuthClient();
  const youtube = google.youtube({ version: 'v3', auth });

  const description_with_tag = description.includes('#Shorts')
    ? description
    : `${description}\n\n#Shorts`;

  const res = await youtube.videos.insert({
    part: ['snippet', 'status'],
    requestBody: {
      snippet: {
        title: title.slice(0, 100),
        description: description_with_tag,
        categoryId: '22' // People & Blogs
      },
      status: {
        privacyStatus: 'public',
        selfDeclaredMadeForKids: false
      }
    },
    media: {
      body: fs.createReadStream(filePath)
    }
  });

  return {
    platform: 'youtube',
    status: 'published',
    message: 'Live on YouTube Shorts',
    url: `https://youtube.com/shorts/${res.data.id}`
  };
}

module.exports = { getOAuthClient, uploadShort, REDIRECT_URI };
