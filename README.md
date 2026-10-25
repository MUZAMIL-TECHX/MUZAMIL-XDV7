# Muzamil-XD

## Run

Use Node.js 20.19 or newer:

```sh
npm install
npm start
```

Expose the port assigned by your host (the app uses `PORT`, with `9090` as its local default). Open the deployment URL to use the **Pair & Run** page. Enter a number you own in international format, then enter the displayed code in WhatsApp under **Settings → Linked Devices → Link a Device**.

The bot retries temporary WhatsApp disconnects with increasing delays and the launcher restarts a session worker if it exits unexpectedly. There is no fixed account-count limit in the app; the number of concurrent sessions depends on the memory and storage available to the host. No host or WhatsApp connection can be guaranteed to stay online forever, and a WhatsApp logout still requires pairing again.

### Railway persistent storage

Railway's container filesystem is temporary unless a Volume is attached. To keep linked-device sessions through redeploys:

1. Attach a Railway Volume to the service at `/data`.
2. Add the service variable `SESSIONS_DIR=/data/sessions`.
3. Redeploy, then pair the WhatsApp numbers again once if their existing sessions were stored only on the old container.

The launcher stores auth and per-account data under this directory. Without the Volume, Railway restarts may discard the session files.

## Per-account storage

Each linked number has its own directory under `SESSIONS_DIR/` (defaults to `sessions/`) containing auth files, JSON config, JSON data, and writable account settings. Bot configuration is saved in `<SESSIONS_DIR>/<number>/data/config.json`; list-style settings such as sudo and ban lists are stored in that session's `assets/` directory. The bot does not use MongoDB, Firebase, SQLite, or another database server.

Auth files grant access to the linked WhatsApp account. Keep the `sessions/` directory private, persistent, and out of shared/public archives.

## Pair command

The web pairing page works without an extra setting. To use `.pair` / `.pair2` from inside WhatsApp, set `PAIRING_API_URL` to this deployment's public base URL (for example, `https://your-app.example.com`). Pairing requests are rate-limited.

## Notes

- Set `MENU_IMAGE_URL` to a publicly accessible image URL; menu messages use the configured URL.
- The `.news` command needs `NEWS_API_KEY` in your deployment's secret manager; no API key is bundled in this ZIP.
- No `assist` / `assistant` folder was included in the supplied Muzamil archive.
- The shipped account credentials were excluded from this source package. Pair the number again after installing this ZIP.
