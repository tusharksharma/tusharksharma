require('dotenv').config();

const path = require('path');
const fs = require('fs');
const express = require('express');
const multer = require('multer');

const youtube = require('./lib/youtube');
const instagram = require('./lib/instagram');
const tiktok = require('./lib/tiktok');
const { BRANDS, expandCaption } = require('./lib/brands');

const app = express();
const PORT = process.env.PORT || 3000;

const upload = multer({
  dest: path.join(__dirname, 'uploads'),
  limits: { fileSize: 1024 * 1024 * 1024 } // 1GB
});

app.use(express.static(path.join(__dirname, 'public')));

// Brand token reference for the UI (slug + display name + which platforms have a handle).
app.get('/api/brands', (req, res) => {
  const list = Object.entries(BRANDS).map(([slug, b]) => ({
    slug,
    name: b.name,
    yt: b.yt || null,
    ig: b.ig || null,
    tt: b.tt || null,
    platforms: ['yt', 'ig', 'tt'].filter((f) => b[f])
  }));
  res.json({ brands: list });
});

app.post('/api/post', upload.single('video'), async (req, res) => {
  const file = req.file;
  const {
    caption = '',
    title = '',
    captionYoutube,
    captionInstagram,
    captionTiktok,
    platforms = '[]'
  } = req.body;

  if (!file) {
    return res.status(400).json({ error: 'No video file received.' });
  }

  let selectedPlatforms;
  try {
    selectedPlatforms = JSON.parse(platforms);
  } catch {
    selectedPlatforms = [];
  }

  // Each platform posts its OWN caption. Prefer the per-platform text sent by the
  // UI (where the user may have hand-edited it); fall back to expanding the base
  // caption's {slug} brand tokens for that platform if no override was provided.
  const captionFor = (platform, override) =>
    (override != null && override !== '') ? override : expandCaption(caption, platform);

  const ytCaption = captionFor('youtube', captionYoutube);
  // YouTube title: explicit field, else the caption's first line, capped at 100.
  const ytTitle = (title.trim() || ytCaption.split('\n')[0].trim().slice(0, 100) || 'Split Plate');

  const jobs = [];
  if (selectedPlatforms.includes('youtube')) {
    jobs.push(
      youtube
        .uploadShort(file.path, ytTitle, ytCaption)
        .catch((err) => ({ platform: 'youtube', status: 'error', message: errorMessage(err) }))
    );
  }
  if (selectedPlatforms.includes('instagram')) {
    jobs.push(
      instagram
        .uploadReel(file.path, captionFor('instagram', captionInstagram))
        .catch((err) => ({ platform: 'instagram', status: 'error', message: errorMessage(err) }))
    );
  }
  if (selectedPlatforms.includes('tiktok')) {
    jobs.push(
      tiktok
        .uploadVideo(file.path, captionFor('tiktok', captionTiktok))
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
