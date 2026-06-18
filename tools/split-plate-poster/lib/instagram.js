const fs = require('fs');
const axios = require('axios');

const API_VERSION = 'v21.0';
// Instagram-login tokens (IGAA…) are only valid against graph.instagram.com,
// not graph.facebook.com. (The resumable-upload host below stays rupload.facebook.com.)
const GRAPH_BASE = `https://graph.instagram.com/${API_VERSION}`;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Uploads a local video file as an Instagram Reel.
 * @param {string} filePath - path to the video on disk
 * @param {string} caption - the Reel caption
 */
async function uploadReel(filePath, caption) {
  const { IG_ACCESS_TOKEN, IG_USER_ID } = process.env;
  if (!IG_ACCESS_TOKEN || !IG_USER_ID) {
    throw new Error('Missing IG_ACCESS_TOKEN / IG_USER_ID in .env. See README for setup.');
  }

  const fileSize = fs.statSync(filePath).size;

  // Step 1: create a resumable-upload container for a Reel.
  const createRes = await axios.post(`${GRAPH_BASE}/${IG_USER_ID}/media`, null, {
    params: {
      media_type: 'REELS',
      upload_type: 'resumable',
      caption,
      access_token: IG_ACCESS_TOKEN
    }
  });

  const containerId = createRes.data.id;
  const uploadUri =
    createRes.data.uri || `https://rupload.facebook.com/ig-api-upload/${API_VERSION}/${containerId}`;

  // Step 2: upload the raw video bytes to that container.
  const fileBuffer = fs.readFileSync(filePath);
  await axios.post(uploadUri, fileBuffer, {
    headers: {
      Authorization: `OAuth ${IG_ACCESS_TOKEN}`,
      offset: '0',
      file_size: String(fileSize),
      'Content-Type': 'application/octet-stream'
    },
    maxBodyLength: Infinity,
    maxContentLength: Infinity
  });

  // Step 3: poll until Instagram has finished processing the video.
  let statusCode = 'IN_PROGRESS';
  let attempts = 0;
  while (statusCode === 'IN_PROGRESS' && attempts < 20) {
    await sleep(6000);
    const statusRes = await axios.get(`${GRAPH_BASE}/${containerId}`, {
      params: { fields: 'status_code', access_token: IG_ACCESS_TOKEN }
    });
    statusCode = statusRes.data.status_code;
    attempts += 1;
  }

  if (statusCode !== 'FINISHED') {
    throw new Error(`Instagram never finished processing the video (last status: ${statusCode}).`);
  }

  // Step 4: publish the container as a live Reel.
  const publishRes = await axios.post(`${GRAPH_BASE}/${IG_USER_ID}/media_publish`, null, {
    params: { creation_id: containerId, access_token: IG_ACCESS_TOKEN }
  });
  const mediaId = publishRes.data.id;

  // Step 5: look up the real permalink for that published media.
  let permalink = null;
  try {
    const permalinkRes = await axios.get(`${GRAPH_BASE}/${mediaId}`, {
      params: { fields: 'permalink', access_token: IG_ACCESS_TOKEN }
    });
    permalink = permalinkRes.data.permalink;
  } catch {
    // Not fatal — the Reel is published either way, we just don't have a link to show.
  }

  return {
    platform: 'instagram',
    status: 'published',
    message: 'Live on Instagram Reels',
    url: permalink
  };
}

module.exports = { uploadReel };
