const dropzone = document.getElementById('dropzone');
const videoInput = document.getElementById('videoInput');
const dropzoneText = document.getElementById('dropzoneText');
const preview = document.getElementById('preview');
const form = document.getElementById('postForm');
const postButton = document.getElementById('postButton');
const resultsSection = document.getElementById('results');
const resultsList = document.getElementById('resultsList');
const captionEl = document.getElementById('caption');

let selectedFile = null;

// ---- Brand tagging: base caption -> per-platform captions ----
const PLATFORM_FIELD = { youtube: 'yt', instagram: 'ig', tiktok: 'tt' };
let brandMap = {}; // slug -> { name, yt, ig, tt }

// Mirrors lib/brands.js expandCaption so the boxes match what's posted.
function expandCaption(caption, platform) {
  if (!caption) return caption;
  const field = PLATFORM_FIELD[platform];
  return caption
    .replace(/\{([a-z0-9]+)\}/gi, (match, slug) => {
      const brand = brandMap[slug.toLowerCase()];
      if (!brand) return slug;
      const handle = field && brand[field];
      return handle || brand.name;
    })
    .replace(/ {2,}/g, ' ')
    .trim();
}

// Each platform: the textarea, char count, reset button, and a "dirty" flag
// (true once the user hand-edits it — then base changes stop overwriting it).
const PLATFORMS = [
  { key: 'youtube', box: 'capYoutube', count: 'countYoutube', reset: 'resetYoutube' },
  { key: 'instagram', box: 'capInstagram', count: 'countInstagram', reset: 'resetInstagram' },
  { key: 'tiktok', box: 'capTiktok', count: 'countTiktok', reset: 'resetTiktok' }
];
const dirty = { youtube: false, instagram: false, tiktok: false };

function el(id) { return document.getElementById(id); }

function refreshOne(p) {
  const box = el(p.box);
  if (!dirty[p.key]) box.value = expandCaption(captionEl.value, p.key);
  el(p.count).textContent = box.value.length;
  el(p.reset).hidden = !dirty[p.key];
}

function syncBoxes() {
  PLATFORMS.forEach(refreshOne);
}

PLATFORMS.forEach((p) => {
  el(p.box).addEventListener('input', () => {
    dirty[p.key] = true;
    el(p.count).textContent = el(p.box).value.length;
    el(p.reset).hidden = false;
  });
  el(p.reset).addEventListener('click', () => {
    dirty[p.key] = false;
    refreshOne(p);
  });
});

captionEl.addEventListener('input', syncBoxes);

async function loadBrands() {
  try {
    const res = await fetch('/api/brands');
    const data = await res.json();
    const list = document.getElementById('brandList');
    for (const b of data.brands || []) {
      brandMap[b.slug] = b;
      const tag = document.createElement('span');
      tag.className = 'brand-chip';
      tag.textContent = `{${b.slug}}`;
      tag.title = `${b.name} — ${b.platforms.join(', ') || 'name only'}`;
      tag.addEventListener('click', () => {
        const start = captionEl.selectionStart ?? captionEl.value.length;
        const end = captionEl.selectionEnd ?? captionEl.value.length;
        const token = `{${b.slug}}`;
        captionEl.value = captionEl.value.slice(0, start) + token + captionEl.value.slice(end);
        const pos = start + token.length;
        captionEl.focus();
        captionEl.setSelectionRange(pos, pos);
        syncBoxes();
      });
      list.appendChild(tag);
    }
  } catch {
    // Non-fatal — brand tags still work when typed manually.
  }
}

function setFile(file) {
  if (!file || !file.type.startsWith('video/')) return;
  selectedFile = file;
  preview.src = URL.createObjectURL(file);
  preview.hidden = false;
  dropzoneText.textContent = file.name;
}

videoInput.addEventListener('change', () => setFile(videoInput.files[0]));

dropzone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropzone.classList.add('dragover');
});

dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));

dropzone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropzone.classList.remove('dragover');
  setFile(e.dataTransfer.files[0]);
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  if (!selectedFile) {
    alert('Drop in a video first.');
    return;
  }

  const platforms = Array.from(form.querySelectorAll('input[name="platform"]:checked')).map(
    (input) => input.value
  );

  if (platforms.length === 0) {
    alert('Pick at least one platform.');
    return;
  }

  const formData = new FormData();
  formData.append('video', selectedFile);
  formData.append('caption', captionEl.value);
  formData.append('captionYoutube', el('capYoutube').value);
  formData.append('captionInstagram', el('capInstagram').value);
  formData.append('captionTiktok', el('capTiktok').value);
  formData.append('platforms', JSON.stringify(platforms));

  postButton.disabled = true;
  postButton.textContent = 'Posting...';
  resultsSection.hidden = true;
  resultsList.innerHTML = '';

  try {
    const res = await fetch('/api/post', { method: 'POST', body: formData });
    const data = await res.json();
    renderResults(data.results || [{ platform: 'request', status: 'error', message: data.error }]);
  } catch (err) {
    renderResults([{ platform: 'request', status: 'error', message: err.message }]);
  } finally {
    postButton.disabled = false;
    postButton.textContent = 'Post everywhere';
  }
});

function renderResults(results) {
  resultsSection.hidden = false;
  for (const result of results) {
    const li = document.createElement('li');
    const cssClass =
      result.status === 'published'
        ? 'ok'
        : result.status === 'published_private'
        ? 'warn'
        : 'error';
    li.className = cssClass;

    const name = document.createElement('span');
    name.className = 'platform-name';
    name.textContent = result.platform;
    li.appendChild(name);

    const message = document.createElement('span');
    message.textContent = result.message || (result.status === 'error' ? 'Something went wrong' : '');
    li.appendChild(message);

    if (result.url) {
      const link = document.createElement('a');
      link.href = result.url;
      link.target = '_blank';
      link.textContent = 'Open post';
      li.appendChild(link);
    }

    resultsList.appendChild(li);
  }
}

loadBrands();
syncBoxes();
