# Migraine Tracker

A private migraine diary that runs as an installable web app (PWA). All data is stored on the device in the browser's IndexedDB; nothing is sent anywhere.

## Features
- Quick entry: NRS pain scale (1-10), alarm-style start time, symptoms, triggers, daily yes/no questions, medication, note
- Calendar with period range and pain-colored migraine days
- Monthly HIT-6 check-in
- Doctor report (save as PDF), CSV export with legend, JSON backup and restore
- Light, dark or system theme; all times in IST

## Run locally
    python3 -m http.server 8000
Then open http://localhost:8000 (service workers need localhost or HTTPS).

## Deploy
Static site, no build step. Connect the repo to Netlify (or Cloudflare Pages) with publish directory `.` and no build command.
Bump `CACHE` in `sw.js` whenever you change app files so installed copies update.
