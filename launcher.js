const fs = require('fs');
const path = require('path');
const { fork } = require('child_process');
const express = require('express');

const ROOT = __dirname;
const SESSIONS_DIR = path.join(ROOT, 'sessions');
const PORT = Number(process.env.PORT || 9090);
const workers = new Map();
const ipRequests = new Map();

const sharedConfigPath = path.join(ROOT, 'config.env');
if (fs.existsSync(sharedConfigPath)) {
  require('dotenv').config({ path: sharedConfigPath, override: false });
}

function hasRegisteredCredentials(authDir) {
  try {
    const creds = JSON.parse(fs.readFileSync(path.join(authDir, 'creds.json'), 'utf8'));
    return creds.registered === true;
  } catch {
    return false;
  }
}

function spawnSession(sessionKey, pairNumber = '', authDirOverride = '') {
  const sessionRoot = path.join(SESSIONS_DIR, sessionKey);
  const authDir = authDirOverride || path.join(sessionRoot, 'auth');
  fs.mkdirSync(authDir, { recursive: true });

  const child = fork(path.join(ROOT, 'index.js'), [], {
    cwd: ROOT,
    env: {
      ...process.env,
      BOT_SESSION_WORKER: '1',
      BOT_SESSION_KEY: sessionKey,
      BOT_PAIR_NUMBER: pairNumber,
      BOT_AUTH_DIR: authDir,
      ...(pairNumber ? { OWNER_NUMBER: pairNumber } : {})
    },
    stdio: ['ignore', 'inherit', 'inherit', 'ipc']
  });

  const record = {
    child,
    code: null,
    codeAt: 0,
    connected: false,
    promise: null,
    resolve: null,
    reject: null
  };

  if (pairNumber) {
    record.promise = new Promise((resolve, reject) => {
      record.resolve = resolve;
      record.reject = reject;
      record.timeout = setTimeout(() => {
        if (record.reject) record.reject(new Error('Pairing timed out. Please try again.'));
      }, 60000);
      record.timeout.unref?.();
    });
  }

  child.on('message', message => {
    if (!message || typeof message !== 'object') return;
    if (message.type === 'pairing_code') {
      record.code = message.code;
      record.codeAt = Date.now();
      if (record.resolve) {
        clearTimeout(record.timeout);
        record.resolve(message.code);
        record.resolve = null;
        record.reject = null;
      }
    } else if (message.type === 'connected') {
      record.connected = true;
      record.code = null;
      if (record.resolve) {
        clearTimeout(record.timeout);
        record.resolve(null);
        record.resolve = null;
        record.reject = null;
      }
    } else if (message.type === 'pairing_error') {
      if (record.reject) {
        clearTimeout(record.timeout);
        record.reject(new Error(message.message || 'Could not create a pairing code.'));
        record.resolve = null;
        record.reject = null;
      }
    } else if (message.type === 'logged_out') {
      record.connected = false;
    }
  });

  child.on('error', error => {
    if (record.reject) {
      clearTimeout(record.timeout);
      record.reject(error);
      record.resolve = null;
      record.reject = null;
    }
  });

  child.on('exit', () => {
    clearTimeout(record.timeout);
    if (workers.get(sessionKey) === record) workers.delete(sessionKey);
    if (record.reject) {
      record.reject(new Error('The session worker stopped before pairing finished.'));
      record.resolve = null;
      record.reject = null;
    }
  });

  workers.set(sessionKey, record);
  return record;
}

function allowPairRequest(req, res, next) {
  const now = Date.now();
  const address = req.ip || req.socket.remoteAddress || 'unknown';
  const recent = (ipRequests.get(address) || []).filter(time => now - time < 60000);
  if (recent.length >= 10) {
    return res.status(429).json({ status: 'error', message: 'Too many pairing requests. Please wait a minute and try again.' });
  }
  recent.push(now);
  ipRequests.set(address, recent);
  next();
}

const app = express();
app.disable('x-powered-by');

app.get('/', (_req, res) => res.sendFile(path.join(ROOT, 'pair.html')));
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    bot: 'MUZAMIL-XD',
    connectedSessions: [...workers.values()].filter(worker => worker.connected).length
  });
});

app.get('/code', allowPairRequest, async (req, res) => {
  const number = String(req.query.number || '').replace(/\D/g, '');
  if (!/^\d{10,15}$/.test(number)) {
    return res.status(400).json({ status: 'error', message: 'Enter a valid international phone number with country code.' });
  }

  const authDir = path.join(SESSIONS_DIR, number, 'auth');
  if (hasRegisteredCredentials(authDir)) {
    return res.status(409).json({ status: 'error', message: 'This WhatsApp number already has a saved session.' });
  }

  let worker = workers.get(number);
  if (worker?.connected) {
    return res.status(409).json({ status: 'error', message: 'This WhatsApp number is already connected.' });
  }

  if (worker?.code && Date.now() - worker.codeAt < 5 * 60 * 1000) {
    return res.json({ status: 'success', code: worker.code });
  }

  if (worker?.code && Date.now() - worker.codeAt >= 5 * 60 * 1000) {
    worker.child.kill();
    workers.delete(number);
    worker = null;
  }

  if (!worker) worker = spawnSession(number, number);

  try {
    const code = await worker.promise;
    if (!code) {
      return res.status(409).json({ status: 'error', message: 'The WhatsApp session is already connected.' });
    }
    return res.json({ status: 'success', code });
  } catch (error) {
    return res.status(503).json({ status: 'error', message: error.message });
  }
});

function restoreSavedSessions() {
  fs.mkdirSync(SESSIONS_DIR, { recursive: true });

  // Keep the old single-account auth directory usable after upgrading.
  const legacyAuthDir = SESSIONS_DIR;
  if (hasRegisteredCredentials(legacyAuthDir)) {
    spawnSession('default', '', legacyAuthDir);
  }

  for (const entry of fs.readdirSync(SESSIONS_DIR, { withFileTypes: true })) {
    if (!entry.isDirectory() || !/^\d{10,15}$/.test(entry.name)) continue;
    const authDir = path.join(SESSIONS_DIR, entry.name, 'auth');
    if (hasRegisteredCredentials(authDir) && !workers.has(entry.name)) {
      spawnSession(entry.name);
    }
  }
}

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Muzamil pairing page listening on port ${PORT}`);
  restoreSavedSessions();
});

function shutdown(signal) {
  console.log(`${signal} received; stopping session workers.`);
  for (const worker of workers.values()) worker.child.kill('SIGTERM');
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(0), 5000).unref?.();
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
