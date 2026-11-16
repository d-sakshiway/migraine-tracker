// Doctor report (HTML, printed to PDF by the browser) + CSV export and legend.

const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

function countBy(list) {
  const m = {};
  list.forEach(x => { m[x] = (m[x] || 0) + 1; });
  return Object.entries(m).sort((a, b) => b[1] - a[1]);
}
function yesList(e) {
  return QUESTIONS.filter(q => e[q.k]).map(q => q.label.replace(/^Did you /, "").replace(/\?$/, ""));
}

function buildReportHTML(entries, periods, hit6s, from, to) {
  const inRange = d => d >= from && d <= to;
  const es = entries.filter(e => inRange(e.date)).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  const days = new Set(es.map(e => e.date));
  const avg = es.length ? (es.reduce((a, e) => a + e.pain, 0) / es.length).toFixed(1) : "-";
  const max = es.length ? Math.max(...es.map(e => e.pain)) : "-";
  const medDays = new Set(es.filter(e => e.medName).map(e => e.date)).size;
  const topSym = countBy(es.flatMap(e => e.symptoms || [])).slice(0, 8);
  const topTrig = countBy(es.flatMap(e => e.triggers || [])).slice(0, 8);
  const bands = [1, 2, 3, 4].map(b => `${BAND_NAMES[b]}: ${es.filter(e => painBand(e.pain) === b).length}`).join(" &nbsp;|&nbsp; ");
  const ps = periods.filter(p => p.start <= to && (p.end || p.start) >= from).sort((a, b) => a.start.localeCompare(b.start));
  const hs = hit6s.filter(h => h.month >= from.slice(0, 7) && h.month <= to.slice(0, 7)).sort((a, b) => a.month.localeCompare(b.month));
  const generated = istStamp().replace("T", " ").replace("+05:30", " IST");

  const allSyms = SYMPTOM_GROUPS.flatMap(g => g.items).filter(i => i.d);

  return `<div class="report">
  <h1>Migraine diary report</h1>
  <div>Period covered: <b>${fmtDate(from)}</b> to <b>${fmtDate(to)}</b><br>
  <span class="muted">Generated ${esc(generated)}. All times are in Indian Standard Time (IST). Pain ratings are self-reported.</span></div>

  <h2>Summary</h2>
  <table>
    <tr><th>Entries logged</th><td>${es.length}</td><th>Days with a migraine entry</th><td>${days.size}</td></tr>
    <tr><th>Average pain (1-10)</th><td>${avg}</td><th>Highest pain</th><td>${max}</td></tr>
    <tr><th>Days medication was taken</th><td>${medDays}</td><th>Pain bands</th><td>${bands}</td></tr>
    <tr><th>Most common symptoms</th><td colspan="3">${topSym.length ? topSym.map(([k, v]) => `${esc(k)} (${v})`).join(", ") : "-"}</td></tr>
    <tr><th>Most common triggers noted</th><td colspan="3">${topTrig.length ? topTrig.map(([k, v]) => `${esc(k)} (${v})`).join(", ") : "-"}</td></tr>
  </table>

  <h2>Periods in this range</h2>
  ${ps.length ? `<table><tr><th>Start</th><th>End</th></tr>${ps.map(p => `<tr><td>${fmtDate(p.start)}</td><td>${p.end ? fmtDate(p.end) : "ongoing / not recorded"}</td></tr>`).join("")}</table>` : "<div class='muted'>None recorded.</div>"}

  <h2>Monthly HIT-6 scores</h2>
  ${hs.length ? `<table><tr><th>Month</th><th>Score (36-78)</th><th>Impact</th></tr>${hs.map(h => `<tr><td>${esc(h.month)}</td><td>${h.score}</td><td>${esc(h.category)}</td></tr>`).join("")}</table>
  <div class="muted">Higher score = more impact of headaches on daily life. 49 or less: little/no impact; 50-55: some; 56-59: substantial; 60+: severe.</div>` : "<div class='muted'>No check-ins in this range.</div>"}

  <h2>Entries</h2>
  ${es.length ? `<table>
    <tr><th>Date</th><th>Start</th><th>Pain</th><th>Symptoms</th><th>Triggers</th><th>Also that day</th><th>Medication</th><th>Note</th></tr>
    ${es.map(e => `<tr>
      <td>${fmtDate(e.date)}</td>
      <td>${fmtTime12(e.time)}${e.endTime ? " to " + fmtTime12(e.endTime) : ""}</td>
      <td><span class="sw" style="background:${painColor(e.pain)}"></span>${e.pain}</td>
      <td>${esc((e.symptoms || []).join(", "))}</td>
      <td>${esc((e.triggers || []).join(", "))}</td>
      <td>${esc(yesList(e).join("; "))}</td>
      <td>${esc(e.medName || "")}${e.medName && e.medHelped !== null && e.medHelped !== undefined ? (e.medHelped ? " (helped)" : " (did not help)") : ""}</td>
      <td>${esc(e.note || "")}</td></tr>`).join("")}
  </table>` : "<div class='muted'>No entries in this range.</div>"}

  <h2>Key: how to read this report</h2>
  <b>Pain scale (Numeric Rating Scale, 1-10), with the patient's own wording</b>
  <table><tr><th>#</th><th>Meaning</th></tr>
  ${PAIN.map(p => `<tr><td><span class="sw" style="background:${painColor(p.n)}"></span>${p.n}</td><td>${esc(p.t)}</td></tr>`).join("")}</table>
  <div class="muted">Bands: ${[1, 2, 3, 4].map(b => BAND_NAMES[b]).join("; ")}.</div>
  <br><b>Symptom labels that need explaining</b>
  <table><tr><th>Label</th><th>Meaning</th></tr>
  ${allSyms.map(s => `<tr><td>${esc(s.l)}</td><td>${esc(s.d)}</td></tr>`).join("")}</table>
  <br><b>"Also that day" items</b>
  <table><tr><th>Item</th><th>Meaning</th></tr>
  ${QUESTIONS.map(q => `<tr><td>${esc(q.label.replace(/^Did you /, "").replace(/\?$/, ""))}</td><td>${esc(q.key)}</td></tr>`).join("")}</table>
  </div>`;
}

// ---- CSV ----
function csvCell(v) {
  const s = String(v ?? "");
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}
function toCsv(rows) { return rows.map(r => r.map(csvCell).join(",")).join("\r\n"); }

function buildEntriesCsv(entries) {
  const head = ["id", "date", "start_time", "end_time", "pain_1_to_10", "symptoms", "triggers",
    ...QUESTIONS.map(q => q.k), "medication", "medication_helped", "note", "saved_at_ist"];
  const rows = entries.slice().sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time)).map(e => [
    e.id, e.date, e.time, e.endTime || "", e.pain, (e.symptoms || []).join("; "), (e.triggers || []).join("; "),
    ...QUESTIONS.map(q => (e[q.k] ? "yes" : "no")),
    e.medName || "", e.medHelped === true ? "yes" : e.medHelped === false ? "no" : "", e.note || "", e.savedAt || "",
  ]);
  return "﻿" + toCsv([head, ...rows]);
}

function buildLegendCsv() {
  const rows = [["column", "meaning"],
    ["id", "Entry number in the app"],
    ["date / start_time / end_time", "Date (YYYY-MM-DD) and 24-hour times in Indian Standard Time (IST). end_time is optional."],
    ["pain_1_to_10", "Self-rated pain on a 1-10 numeric scale (see pain rows below)"],
    ["symptoms / triggers", "Items ticked, separated by semicolons"],
    ...QUESTIONS.map(q => [q.k, `yes/no: ${q.key}`]),
    ["medication / medication_helped", "Medication name taken, and whether it helped"],
    ["note", "Free text note"],
    ["saved_at_ist", "When the entry was saved (IST)"],
    ["", ""],
    ["PAIN SCALE", "Patient's own wording"],
    ...PAIN.map(p => [String(p.n), p.t]),
    ["", ""],
    ["SYMPTOM LABEL", "Meaning"],
    ...SYMPTOM_GROUPS.flatMap(g => g.items).filter(i => i.d).map(i => [i.l, i.d]),
  ];
  return "﻿" + toCsv(rows);
}
