const fs = require('fs');
const axios = require('axios');
const { updateEnvFile } = require('./env-util');

const API_BASE = 'https://open.tiktokapis.com/v2';
// 64MB — TikTok's max chunk size. Files at or under this size upload in one chunk.
const MAX_CHUNK = 64 * 1024 * 1024;

async function refreshAccessToken() {
  const { TIKTOK_CLIENT_KEY, TIKTOK_CLIENT_SECRET, TIKTOK_REFRESH_TOKEN } = process.env;
  if (!TIKTOK_CLIENT_KEY || !TIKTOK_CLIENT_SECRET || !TIKTOK_REFRESH_TOKEN) {
    throw new Error('TikTok isn\'t connected yet. Run: npm run setup:tiktok');
  }

  const res = await axios.post(
    `${API_BASE}/oauth/token/`,
    new URLSearchParams({
      client_key: TIKTOK_CLIENT_KEY,
      client_secret: TIKTOK_CLIENT_SECRET,
      grant_type: 'refresh_token',
      refresh_token: TIKTOK_REFRESH_TOKEN
    }),
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  );

  const { access_token, refresh_token } = res.data;
  // TikTok issues a new refresh token on every refresh — save both or the next run breaks.
  updateEnvFile({ TIKTOK_ACCESS_TOKEN: access_token, TIKTOK_REFRESH_TOKEN: refresh_token });
  return access_token;
}

/**
 * Uploads a local video file to TikTok.
 *
 * Important: unless your TikTok developer app has been through TikTok's content
 * audit, posts can only land as SELF_ONLY (private to you). You'll need to open
 * the TikTok app and change visibility to Public yourself after each upload.
 * See the README for why, and how to apply for the audit.
 */
async function uploadVideo(filePath, caption) {
  const accessToken = await refreshAccessToken();
  const fileSize = fs.statSync(filePath).size;
  const chunkSize = Math.min(fileSize, MAX_CHUNK);
  const totalChunks = Math.max(1, Math.ceil(fileSize / chunkSize));

  const initRes = await axios.post(
    `${API_BASE}/post/publish/video/init/`,
    {
      post_info: {
        title: caption.slice(0, 2200),
        privacy_level: process.env.TIKTOK_PRIVACY_LEVEL || 'SELF_ONLY',
        disable_duet: false,
        disable_comment: false,
        disable_stitch: false
      },
      source_info: {
        source: 'FILE_UPLOAD',
        video_size: fileSize,
        chunk_size: chunkSize,
        total_chunk_count: totalChunks
      }
    },
    { headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' } }
  );

  if (initRes.data.error && initRes.data.error.code !== 'ok') {
    throw new Error(`TikTok rejected the upload: ${initRes.data.error.message}`);
  }

  const { publish_id, upload_url } = initRes.data.data;

  // Upload each chunk in sequence with the right byte range.
  const fd = fs.openSync(filePath, 'r');
  try {
    for (let i = 0; i < totalChunks; i++) {
      const start = i * chunkSize;
      const end = Math.min(start + chunkSize, fileSize) - 1;
      const length = end - start + 1;
      const buffer = Buffer.alloc(length);
      fs.readSync(fd, buffer, 0, length, start);

      await axios.put(upload_url, buffer, {
        headers: {
          'Content-Type': 'video/mp4',
          'Content-Length': length,
          'Content-Range': `bytes ${start}-${end}/${fileSize}`
        },
        maxBodyLength: Infinity,
        maxContentLength: Infinity
      });
    }
  } finally {
    fs.closeSync(fd);
  }

  const isPrivate = (process.env.TIKTOK_PRIVACY_LEVEL || 'SELF_ONLY') === 'SELF_ONLY';

  return {
    platform: 'tiktok',
    status: isPrivate ? 'published_private' : 'published',
    message: isPrivate
      ? 'Uploaded, but private (SELF_ONLY) — open the TikTok app to publish it publicly'
      : 'Published to TikTok',
    publishId: publish_id
  };
}

module.exports = { uploadVideo, refreshAccessToken };
