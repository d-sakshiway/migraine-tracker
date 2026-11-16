# Migraine Tracker

A private, personal migraine diary that runs as an installable web app (PWA) on your phone. Everything is stored on your own device. There is no account, no server database and no tracking.

**Live app:** https://mymigraine.netlify.app
**Source code:** https://github.com/d-sakshiway/migraine-tracker

---

## Contents
1. [What it does](#what-it-does)
2. [Install on Android](#install-on-android)
3. [How to use it (FAQ)](#how-to-use-it-faq)
4. [Glossary: what the labels mean](#glossary-what-the-labels-mean)
5. [Pain scale](#pain-scale)
6. [Calendar colours](#calendar-colours)
7. [HIT-6 monthly check-in](#hit-6-monthly-check-in)
8. [Doctor report and exports](#doctor-report-and-exports)
9. [Your data and privacy](#your-data-and-privacy)
10. [Known limitations](#known-limitations)
11. [For developers](#for-developers)

---

## What it does
- **Log an entry in a few taps:** pain level (1-10), start time, symptoms, triggers, a few yes/no questions, medication and a note. You can log several entries per day, or none.
- **Calendar:** shows migraine days (coloured by how bad they were) and period days.
- **Periods:** a separate page (More > Enter period) to record period start and end dates.
- **Insights:** simple patterns from your entries, under More.
- **Monthly HIT-6 check-in:** a short questionnaire doctors use to measure how much headaches affect your life.
- **Doctor report:** pick any date range and save a PDF to show your doctor, with a key explaining every label.
- **Export and backup:** CSV (with a legend file), and a JSON backup you can restore later.
- **Themes:** light, dark, or follow the phone.
- **Works offline** once opened, because the app files are cached.

## Install on Android
1. Open https://mymigraine.netlify.app in **Chrome**.
2. Tap the three-dot menu, then **Install app** (or **Add to Home screen**).
3. Open it from the home screen icon like any other app.

A PWA (progressive web app) is a website that can be installed like an app. It is not on the Play Store and needs no download.

## How to use it (FAQ)

**How do I log a migraine?**
On the **Log** tab: pick a pain number, set the start time with the scrolling wheels, open the sections you need (symptoms, triggers, daily questions, medication), add a note if you like, then save. Sections are collapsed to keep the screen clean. The number next to a section name shows how many items you ticked.

**Do I have to fill everything in?**
No. Only the pain number is needed. Everything else is optional.

**Can I log more than one entry in a day?**
Yes. Each attack or change in pain can be its own entry. Days with no entries are fine too.

**Is there an end time?**
It is optional. Switch it on only if you want to record when the pain ended.

**What are the yes/no questions for?**
They capture things that often relate to migraines (sleep, hunger, travel, heavy lifting, exercise). See the [glossary](#glossary-what-the-labels-mean) for exactly what each one means.

**How do I edit or delete an entry?**
Find it under the **Calendar** tab (tap a day, or use the **All records** button at the top). Use Edit or Delete on the entry. After deleting you get an **Undo** option for a few seconds.

**How do I see a day's entries on the calendar?**
Tap a day to open its entries. Tap the same day again to hide them.

**How do I record my period?**
**More > Enter period**. Add a start date, and an end date when it finishes. The dates appear as a baby-pink range on the calendar.

**What is the HIT-6 reminder on the home screen?**
On the 28th to 31st of a month, if you haven't done that month's check-in, a banner offers it. You can also do it any time from **More**.

**How do I get a report for my doctor?**
**More > Export and doctor report**, choose the date range, and open the doctor report. Then use your browser's print option and choose **Save as PDF**. The report ends with a key that explains the pain scale and any label that needs explaining.

**How do I back up my data?**
**More > Export and doctor report**, in the Backup and restore section. It downloads a JSON file. Keep it somewhere safe (email it to yourself, put it in Drive).

**How do I move to a new phone or restore data?**
Install the app on the new phone, go to **More > Export and doctor report > Restore from backup file** and choose your JSON file. Records with the same ID are overwritten.

**I changed the web address, where did my data go?**
Data is tied to the exact web address. A different address (for example moving from Netlify to GitHub Pages) starts empty. Export a backup first, then restore it at the new address.

**Clearing browser data erased my entries.**
Clearing site data or uninstalling the app can delete the on-device database. Take regular backups.

**What time zone is used?**
Always IST (Indian Standard Time, UTC+05:30), regardless of the phone's time zone. Times are shown in 12-hour format in the app and stored in 24-hour format in exports.

**The app looks out of date after an update.**
Close it fully and reopen it with a connection. The app checks for new files each time it loads online.

**Why is there a "Powered by Netlify" badge?**
Netlify's free plan adds it. On the Netlify address the bottom tab bar is lifted so the badge doesn't cover it.

## Glossary: what the labels mean
These are personal shorthand labels. The same text appears in the doctor report key.

**Symptoms**
| Label | Meaning |
|---|---|
| Whole head | Pain across the entire head |
| Left side head / Right side head / Back of head / Forehead / Top of head | Where on the head the pain is |
| Forehead pressure | A heavy, pressing feeling on the forehead that does not go away |
| Side nerve pain (L) / (R) | Pain along the nerve running from the side of the head, through the ear, down to the throat, on the left or right side |
| Aura | Visual zigzags, flashing lights or blind spots before or during the attack |
| Sudden heat/flushing | A sudden wave of heat or flushing, like a hot flash |
| Emotionally drained | Annoyed, close to tears, or emotionally done |
| Pre-attack yawning/cravings | Yawning or food cravings before the pain starts (the "prodrome" phase) |

Other labels (such as Neck stiffness, Left arm pain, Tense jaw, Nausea) mean what they say. Symptoms are grouped into: Head and face; Neck, shoulders and arms; Sensory; Body; Mind and mood; Other.

**Triggers:** Stress, Skipped meal, Long screen time, Strong smell, Weather change, Alcohol, Caffeine, Poor sleep. These are things you suspect set off the attack. They are your own notes, not a diagnosis.

**Yes/no questions** (shortened in the doctor report and CSV)
| Question | What it means |
|---|---|
| Record your sleep | Whether sleep was recorded that day (for example in a health app) |
| Sleep extra | Naps, or sleeping more than the night's sleep |
| Pain because of hunger | Pain you attribute to hunger or a missed meal |
| Travel outside town | Recent travel outside your home town |
| Lift anything heavy | A laptop counts. Anything around 1 L of water or heavier counts |
| Walk or work out | Any walk or workout that day |
| Stopped you from doing things | The attack stopped you from doing normal activities |

In the CSV these appear as columns named `sleepRecorded`, `extraSleep`, `hungerPain`, `travelled`, `heavyLift`, `workout`, `stopped`, each with `yes` or `no`.

**Medication:** the name of what you took, plus whether it helped.

## Pain scale
The app uses the **Numeric Rating Scale (NRS), 1 to 10**, a standard way to rate pain. The short descriptions next to each number are written in the app owner's own words to make choosing easier, and are not an official clinical wording.

| # | Description |
|---|---|
| 1 | Barely there, I'd forget it if I were busy |
| 2 | Mild ache, easy to ignore |
| 3 | Noticeable but doesn't stop me doing anything |
| 4 | Distracting, I can still work or function |
| 5 | Hard to ignore, concentration is suffering |
| 6 | Need to slow down, light or sound makes it worse |
| 7 | Can't work properly, I want to lie down in the dark |
| 8 | Severe, struggling to talk or think, usually with nausea |
| 9 | Intense, can barely move, nothing helps |
| 10 | Worst pain imaginable, I'd go to the ER |

You can change this wording in `config.js`.

## Calendar colours
Pain numbers are grouped into four bands:

| Band | Pain | Colour |
|---|---|---|
| Mild | 1-3 | Yellow |
| Moderate | 4-6 | Orange |
| Severe | 7-8 | Muted red |
| Very severe | 9-10 | Deep red |

- A calendar day shows **one dot for the highest pain logged that day**, even if there were several entries.
- **Baby pink** background = period days.
- A grey outline marks today, and a blue outline marks the selected day.
- Selected symptom/trigger chips turn **light yellow**.

## HIT-6 monthly check-in
HIT-6 (Headache Impact Test) is a 6-question form that rates how much headaches affect daily life.
- Each answer is Never / Rarely / Sometimes / Very often / Always, worth 6 / 8 / 10 / 11 / 13 points.
- Total score ranges from **36 to 78**. Higher means more impact.
- Categories: **49 or less** little or no impact, **50-55** some, **56-59** substantial, **60 or more** severe.
- The question wording in this app is a **paraphrase**, not the official text, and has not been checked against HIT-6 licensing. For a formal assessment, your doctor should use the official form. The score here is a personal trend indicator.

## Doctor report and exports
All under **More > Export and doctor report**:
- **Doctor report (PDF):** summary (entry count, average and highest pain, medication days, common symptoms and triggers), periods, HIT-6 scores, a table of entries, and a key explaining the pain scale, symptom labels and yes/no items. Choose your own date range.
- **CSV:** one row per entry, plus a separate **legend file** that explains every column, the pain scale and the symptom labels. Opens in Excel or Google Sheets.
- **JSON backup:** a complete copy of all data for restoring later.

All times in reports are in IST.

## Your data and privacy
- Data lives in the browser's IndexedDB on your phone. It is never uploaded.
- The only network use is loading the app files from Netlify when you open it.
- There is no login, so anyone who unlocks your phone and opens the app can see the data.
- Because data is local, it is not synced between devices. Use backup and restore to move it.
- This app is a personal diary. It does not give medical advice or diagnose anything.

## Known limitations
- The app was built and checked without a browser on the developer machine, so look-and-feel issues are found by testing on the phone.
- On the Netlify free plan a "Powered by Netlify" badge appears at the bottom. The tab bar is lifted by 59px on `*.netlify.app` to stay clear of it. GitHub Pages (`https://d-sakshiway.github.io/migraine-tracker/`) would avoid the badge, but starts with an empty database.
- "All records" lists days without collapse. Calendar days can be collapsed.
- Pain and symptom wording and the report key are drafts. Review them in `config.js` before giving a report to a doctor.

## For developers
Plain HTML, CSS and JavaScript. No build step, no dependencies.

| File | Purpose |
|---|---|
| `index.html` | App shell |
| `app.js` | UI and logic: tabs, log form, time wheel, calendar, pages, backup and restore |
| `config.js` | Pain scale text and colours, symptoms, triggers, yes/no questions. Edit wording here |
| `hit6.js` | HIT-6 questions, scoring and categories |
| `db.js` | IndexedDB wrapper (stores: entries, periods, hit6, custom) and IST date/time helpers |
| `report.js` | Doctor report HTML, CSV and legend |
| `styles.css` | Styling, themes, Netlify badge workaround |
| `sw.js` | Service worker (network first, offline fallback) |
| `manifest.json`, `icons/` | PWA install info and icons |
| `fonts/` | Self-hosted Nunito font (SIL Open Font License, see `fonts/OFL.txt`) |

**Run locally**

    python3 -m http.server 8000

Then open http://localhost:8000. Service workers need localhost or HTTPS.

**Deploy:** connect the repo to Netlify (or Cloudflare Pages) with no build command and publish directory `.`. Pushing to `main` redeploys.

**After changing app files**, bump `CACHE` in `sw.js` (currently `migraine-v8`) so installed copies update. If you add files, add them to the `FILES` list there too.
