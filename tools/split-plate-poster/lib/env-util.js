const fs = require('fs');
const path = require('path');

const ENV_PATH = path.join(__dirname, '..', '.env');

/**
 * Updates one or more keys in the .env file, preserving everything else.
 * Creates the key if it doesn't exist yet.
 * @param {Object} updates - e.g. { YT_REFRESH_TOKEN: 'abc123' }
 */
function updateEnvFile(updates) {
  let contents = fs.existsSync(ENV_PATH) ? fs.readFileSync(ENV_PATH, 'utf8') : '';

  for (const [key, value] of Object.entries(updates)) {
    const line = `${key}=${value}`;
    const pattern = new RegExp(`^${key}=.*$`, 'm');
    if (pattern.test(contents)) {
      contents = contents.replace(pattern, line);
    } else {
      contents += (contents.endsWith('\n') || contents === '' ? '' : '\n') + line + '\n';
    }
    // Keep the running process in sync too, so we don't need a restart.
    process.env[key] = value;
  }

  fs.writeFileSync(ENV_PATH, contents);
}

module.exports = { updateEnvFile, ENV_PATH };
