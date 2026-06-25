require('dotenv').config();

const path = require('path');
const fs = require('fs');
const express = require('express');
const multer = require('multer');

const youtube = require('./lib/youtube');
const instagram = require('./lib/instagram');
const tiktok = require('./lib/tiktok');

const app = express();
const PORT = process.env.PORT || 3000;

const upload = multer({
  dest: path.join(__dirname, 'uploads'),
  limits: { fileSize: 1024 * 1024 * 1024 } // 1GB
});

app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/post', upload.single('video'), async (req, res) => {
  const file = req.file;
  const { caption = '', title = '', platforms = '[]' } = req.body;

  if (!file) {
    return res.status(400).json({ error: 'No video file received.' });
  }

  let selectedPlatforms;
  try {
    selectedPlatforms = JSON.parse(platforms);
  } catch {
    selectedPlatforms = [];
  }

  // One caption goes to every selected platform.
  const finalTitle = title.trim() || caption.trim().split('\n')[0].slice(0, 100) || 'Split Plate';

  const jobs = [];
  if (selectedPlatforms.includes('youtube')) {
    jobs.push(
      youtube
        .uploadShort(file.path, finalTitle, caption)
        .catch((err) => ({ platform: 'youtube', status: 'error', message: errorMessage(err) }))
    );
  }
  if (selectedPlatforms.includes('instagram')) {
    jobs.push(
      instagram
        .uploadReel(file.path, caption)
        .catch((err) => ({ platform: 'instagram', status: 'error', message: errorMessage(err) }))
    );
  }
  if (selectedPlatforms.includes('tiktok')) {
    jobs.push(
      tiktok
        .uploadVideo(file.path, caption)
        .catch((err) => ({ platform: 'tiktok', status: 'error', message: errorMessage(err) }))
    );
  }

  const results = await Promise.all(jobs);

  // Clean up the temp upload regardless of outcome.
  fs.unlink(file.path, () => {});

  res.json({ results });
});

function errorMessage(err) {
  if (err.response && err.response.data) {
    const data = err.response.data;
    return data.error?.message || data.error_description || JSON.stringify(data);
  }
  return err.message || 'Unknown error';
}

app.listen(PORT, () => {
  console.log(`Split Plate Poster running at http://localhost:${PORT}`);
});
