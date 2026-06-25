const dropzone = document.getElementById('dropzone');
const videoInput = document.getElementById('videoInput');
const dropzoneText = document.getElementById('dropzoneText');
const preview = document.getElementById('preview');
const form = document.getElementById('postForm');
const postButton = document.getElementById('postButton');
const resultsSection = document.getElementById('results');
const resultsList = document.getElementById('resultsList');

let selectedFile = null;

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

  const caption = document.getElementById('caption').value;

  const formData = new FormData();
  formData.append('video', selectedFile);
  formData.append('caption', caption);
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
