const config = require('../config');
const fs = require('fs');
const path = require('path');

const settingsFile = path.join(
    process.env.BOT_DATA_DIR || path.join(__dirname, '../data'),
    'antidelete.json'
);
const defaultStatus = config.ANTI_DELETE === 'true';

function readStatus() {
    try {
        const saved = JSON.parse(fs.readFileSync(settingsFile, 'utf8'));
        return typeof saved.status === 'boolean' ? saved.status : defaultStatus;
    } catch {
        return defaultStatus;
    }
}

async function initializeAntiDeleteSettings() {
    if (!fs.existsSync(settingsFile)) {
        await writeStatus(defaultStatus);
    }
}

async function writeStatus(status) {
    fs.mkdirSync(path.dirname(settingsFile), { recursive: true });
    const temporary = `${settingsFile}.tmp`;
    fs.writeFileSync(temporary, JSON.stringify({ status: Boolean(status) }, null, 2));
    fs.renameSync(temporary, settingsFile);
}

// Small compatibility facade for callers of the former settings model.
const AntiDelDB = {
    async sync() { await initializeAntiDeleteSettings(); },
    async findByPk() { return { id: 1, status: readStatus() }; },
    async findOrCreate() { await initializeAntiDeleteSettings(); return [{ id: 1, status: readStatus() }, false]; },
    async update(values) { await writeStatus(values.status); return [1]; }
};

async function setAnti(status) {
    try {
        await initializeAntiDeleteSettings();
        await writeStatus(status);
        return true;
    } catch (error) {
        console.error('Error setting anti-delete status:', error);
        return false;
    }
}

async function getAnti() {
    try {
        await initializeAntiDeleteSettings();
        return readStatus();
    } catch (error) {
        console.error('Error getting anti-delete status:', error);
        return defaultStatus;
    }
}

async function getAllAntiDeleteSettings() {
    return [{ id: 1, status: await getAnti() }];
}

module.exports = {
    AntiDelDB,
    initializeAntiDeleteSettings,
    setAnti,
    getAnti,
    getAllAntiDeleteSettings,
};
