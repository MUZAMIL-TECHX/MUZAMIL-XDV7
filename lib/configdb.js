const fs = require('fs');
const path = require('path');

const configFile = path.join(
  process.env.BOT_DATA_DIR || path.join(__dirname, 'data'),
  'config.json'
);

function readConfig() {
  try {
    const value = JSON.parse(fs.readFileSync(configFile, 'utf8'));
    return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  } catch {
    return {};
  }
}

function writeConfig(value) {
  fs.mkdirSync(path.dirname(configFile), { recursive: true });
  const temporary = `${configFile}.tmp`;
  fs.writeFileSync(temporary, JSON.stringify(value, null, 2));
  fs.renameSync(temporary, configFile);
}

module.exports = {
  getConfig: (key) => {
    const config = readConfig();
    return Object.prototype.hasOwnProperty.call(config, key) ? config[key] : null;
  },
  setConfig: (key, value) => {
    const config = readConfig();
    config[key] = value;
    writeConfig(config);
    try {
      const runtimeConfig = require('../config');
      if (Object.prototype.hasOwnProperty.call(runtimeConfig, key)) runtimeConfig[key] = value;
    } catch {
      // The config module may still be loading on first startup.
    }
    return value;
  },
  getAllConfig: () => {
    return readConfig();
  }
};

