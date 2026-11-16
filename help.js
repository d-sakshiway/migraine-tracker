// In-app "How to use" guide (opened from the More tab). Glossary text comes from config.js.
const HELP_FAQ = [
  ["How do I log a migraine?", "On the Log tab, pick a pain number, set the start time with the scrolling wheels, open any sections you need (symptoms, triggers, daily questions, medication), add a note if you like, then save. The number beside a section name shows how many items you ticked."],
  ["Do I have to fill everything in?", "No. Only the pain number is needed. Everything else is optional."],
  ["Can I log more than one entry in a day?", "Yes. Each attack or change in pain can be its own entry. Days with no entries are fine too."],
  ["Is there an end time?", "It is optional. Switch it on only if you want to record when the pain ended."],
  ["How do I edit or delete an entry?", "Tap a day on the Calendar tab (tap it again to hide), or use the All records button at the top of the Calendar. Use Edit or Delete on the entry. After deleting you get an Undo option for a few seconds."],
  ["What do the calendar colours mean?", "Each day shows one dot for the highest pain logged that day: yellow 1-3, orange 4-6, muted red 7-8, deep red 9-10. Baby pink background means period days."],
  ["How do I record my period?", "More, then Enter period. Add a start date, and an end date when it finishes."],
  ["What is the monthly check-in (HIT-6)?", "A 6-question form that rates how much headaches affected your daily life that month. Score 36 to 78, higher means more impact: 49 or less little or none, 50-55 some, 56-59 substantial, 60 or more severe. A reminder shows on the home screen on the 28th to 31st. The wording is a paraphrase, not the official form, so treat the score as a personal trend."],
  ["How do I get a report for my doctor?", "More, then Export and doctor report. Pick the date range and open the report, then use Save as PDF. The report ends with a key explaining the pain scale and the labels."],
  ["How do I back up or move my data?", "More, then Export and doctor report, then Backup and restore. Download the backup file and keep it safe. On a new phone or address, use Restore from backup file."],
  ["Where is my data stored?", "Only on this phone, in the browser. Nothing is uploaded and there is no login. Clearing browser data or uninstalling the app can erase it, so back up now and then. A different web address starts with empty data."],
  ["What time zone is used?", "Always IST (UTC+05:30), whatever the phone's time zone is."],
];

async function pageHelp(body) {
  const glossary = SYMPTOM_GROUPS.flatMap(g => g.items).filter(i => i.d);
  body.innerHTML = `
    <p class="muted">A quick guide to using this migraine diary. It works offline and keeps all data on your phone.</p>
    <button class="btn secondary noprint" id="help-pdf">Save this guide as PDF</button>
    <div class="report" style="margin-top:14px">
      <h2 style="margin-top:8px">Install on Android</h2>
      <p>Open the app link in Chrome, tap the three-dot menu, then Install app (or Add to Home screen).</p>
      <h2>Questions and answers</h2>
      ${HELP_FAQ.map(([q, a]) => `<details class="sec"><summary>${esc(q)}</summary><div class="inner">${esc(a)}</div></details>`).join("")}
      <h2>Pain scale (1-10)</h2>
      <table><tr><th>#</th><th>Meaning</th></tr>
      ${PAIN.map(p => `<tr><td><span class="sw" style="background:${painColor(p.n)}"></span>${p.n}</td><td>${esc(p.t)}</td></tr>`).join("")}</table>
      <h2>Labels that need explaining</h2>
      <table><tr><th>Label</th><th>Meaning</th></tr>
      ${glossary.map(s => `<tr><td>${esc(s.l)}</td><td>${esc(s.d)}</td></tr>`).join("")}</table>
      <h2>Yes/no questions</h2>
      <table><tr><th>Question</th><th>Meaning</th></tr>
      ${QUESTIONS.map(q => `<tr><td>${esc(q.label)}</td><td>${esc(q.key)}</td></tr>`).join("")}</table>
      <p class="muted" style="margin-top:14px">This app is a personal diary. It does not give medical advice or diagnose anything.</p>
    </div>`;
  body.querySelector("#help-pdf").onclick = () => {
    body.querySelectorAll("details").forEach(d => { d.open = true; });
    window.print();
  };
}
