// Migraine Tracker: UI + logic. Data lives only in this browser (IndexedDB).

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const state = { tab: "log", editing: null, cal: { y: istNow().y, m: istNow().m }, selDate: null };
let form = null, startPicker = null, endPicker = null, endActive = false;

/* ---------- theme / toast ---------- */
function getTheme() { try { return localStorage.getItem("theme") || "system"; } catch { return "system"; } }
function setTheme(t) {
  document.documentElement.dataset.theme = t;
  try { localStorage.setItem("theme", t); } catch {}
}
let toastTimer = null;
function toast(msg, actionLabel, fn) {
  const t = $("#toast");
  t.innerHTML = `<span>${esc(msg)}</span>${actionLabel ? `<button>${esc(actionLabel)}</button>` : ""}`;
  t.hidden = false;
  if (actionLabel) $("button", t).onclick = () => { t.hidden = true; fn && fn(); };
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { t.hidden = true; }, actionLabel ? 6000 : 2500);
}
function download(name, text, type) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([text], { type }));
  a.download = name;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 3000);
}

/* ---------- tabs ---------- */
function showTab(tab) {
  state.tab = tab;
  $$("#tabs button").forEach(b => b.classList.toggle("active", b.dataset.tab === tab));
  ["log", "cal", "more"].forEach(t => { $("#view-" + t).hidden = t !== tab; });
  if (tab === "cal") renderCalendar();
  if (tab === "more") renderMore();
  if (tab === "log") requestAnimationFrame(() => { startPicker && startPicker.restore(); endPicker && endActive && endPicker.restore(); });
  window.scrollTo(0, 0);
}

/* ---------- time wheel ---------- */
const WH = 44;
function makeWheel(items) {
  const d = document.createElement("div");
  d.className = "wheel";
  d.innerHTML = '<div class="pad"></div>' + items.map(i => `<div class="wi">${i}</div>`).join("") + '<div class="pad"></div>';
  d.setIdx = i => { d.scrollTop = i * WH; };
  d.getIdx = () => Math.max(0, Math.min(items.length - 1, Math.round(d.scrollTop / WH)));
  return d;
}
function makePicker(host, time) {
  const st = { h: 0, m: 0, ap: 0 };
  const apply = t => { const [H, M] = t.split(":").map(Number); st.h = ((H % 12) || 12) - 1; st.m = M; st.ap = H >= 12 ? 1 : 0; };
  apply(time);
  const defs = [["h", Array.from({ length: 12 }, (_, i) => i + 1)], ["m", Array.from({ length: 60 }, (_, i) => pad(i))], ["ap", ["AM", "PM"]]];
  const ws = defs.map(([k, items]) => {
    const w = makeWheel(items); w.k = k;
    w.addEventListener("scroll", () => { st[k] = w.getIdx(); });
    return w;
  });
  const box = w => {
    const b = document.createElement("div"); b.className = "wheel-box"; b.append(w);
    const band = document.createElement("div"); band.className = "wheel-band"; b.append(band); return b;
  };
  const colon = document.createElement("span"); colon.className = "colon"; colon.textContent = ":";
  host.innerHTML = "";
  host.append(box(ws[0]), colon, box(ws[1]), box(ws[2]));
  const restore = () => ws.forEach(w => w.setIdx(st[w.k]));
  return {
    restore,
    get: () => pad(((st.h + 1) % 12) + (st.ap ? 12 : 0)) + ":" + pad(st.m),
    setTime: t => { apply(t); restore(); },
  };
}

/* ---------- Log tab ---------- */
async function renderLog(entry) {
  const v = $("#view-log");
  const custom = (await DB.all("custom")).map(c => c.label).sort();
  const hit6s = await DB.all("hit6");
  const showBanner = istNow().d >= 28 && !hit6s.some(h => h.month === istMonth()) && !entry;
  state.editing = entry || null;
  form = {
    pain: entry ? entry.pain : null,
    symptoms: new Set(entry ? entry.symptoms : []),
    triggers: new Set(entry ? entry.triggers : []),
    q: {},
    medHelped: entry && entry.medHelped !== undefined ? entry.medHelped : null,
  };
  QUESTIONS.forEach(q => { form.q[q.k] = !!(entry && entry[q.k]); });
  endActive = !!(entry && entry.endTime);

  const chip = (l, on, attr) => `<button type="button" class="chip${on ? " on" : ""}" ${attr}="${esc(l)}">${esc(l)}</button>`;
  const groups = SYMPTOM_GROUPS.map(g => ({ name: g.name, labels: g.items.map(i => i.l) }));
  groups.push({ name: "My symptoms", labels: custom, custom: true });

  v.innerHTML = `
    <h1>${entry ? "Edit entry" : "New entry"}</h1>
    ${showBanner ? `<div class="banner"><b>Monthly check-in due</b><div class="muted">It's near the end of the month. Take 1 minute to do your HIT-6 check-in.</div>
      <div class="row"><button class="btn small" id="go-hit6">Start check-in</button></div></div>` : ""}
    <h2>Pain level</h2>
    <div class="pain-list">${PAIN.map(p => `
      <button type="button" class="pain-row${form.pain === p.n ? " sel" : ""}" data-pain="${p.n}">
        <span class="num" style="background:${painColor(p.n)}">${p.n}</span><span class="txt">${esc(p.t)}</span></button>`).join("")}</div>

    <h2>When did it start?</h2>
    <input type="date" id="f-date" value="${entry ? entry.date : istDate()}">
    <div class="time-wrap" id="w-start"></div>
    <button type="button" class="link" id="add-end" ${endActive ? "hidden" : ""}>+ add end time</button>
    <div id="end-box" ${endActive ? "" : "hidden"}>
      <div class="muted" style="margin-top:6px">Ended at</div>
      <div class="time-wrap" id="w-end"></div>
      <button type="button" class="link" id="rm-end">remove end time</button>
    </div>

    <h2>Symptoms</h2>
    ${groups.map(g => `<details class="sec" data-group="${esc(g.name)}"><summary><span>${esc(g.name)}<span class="count"></span></span></summary>
      <div class="inner"><div class="chips">${g.labels.map(l => chip(l, form.symptoms.has(l), "data-sym")).join("")}</div>
      ${g.custom ? `<div class="row" style="margin-top:10px"><input type="text" id="f-custom" placeholder="Add your own symptom"><button type="button" class="btn small secondary" id="add-custom">Add</button></div>` : ""}
      </div></details>`).join("")}

    <details class="sec" id="sec-day"><summary><span>Today's details<span class="count"></span></span></summary><div class="inner">
      ${QUESTIONS.map(q => `<label class="check"><input type="checkbox" data-q="${q.k}" ${form.q[q.k] ? "checked" : ""}>
        <span>${esc(q.label)}${q.help ? `<small>${esc(q.help)}</small>` : ""}</span></label>`).join("")}
      <div class="group-name">Possible triggers</div>
      <div class="chips">${TRIGGERS.map(t => chip(t, form.triggers.has(t), "data-trig")).join("")}</div>
    </div></details>

    <details class="sec" id="sec-med" ${entry && entry.medName ? "open" : ""}><summary><span>Medication</span></summary><div class="inner">
      <input type="text" id="f-med" placeholder="Medication name" value="${esc(entry ? entry.medName : "")}">
      <div class="seg">${chip("Helped", form.medHelped === true, "data-med")}${chip("Did not help", form.medHelped === false, "data-med")}</div>
    </div></details>

    <h2>Note</h2>
    <textarea id="f-note" placeholder="Anything else worth remembering">${esc(entry ? entry.note : "")}</textarea>
    <div style="height:12px"></div>
    <button class="btn" id="save">${entry ? "Save changes" : "Save entry"}</button>
    ${entry ? `<div style="height:8px"></div><button class="btn secondary" id="cancel-edit">Cancel</button>` : ""}
  `;

  startPicker = makePicker($("#w-start"), entry ? entry.time : istTime());
  endPicker = makePicker($("#w-end"), entry && entry.endTime ? entry.endTime : istTime());
  requestAnimationFrame(() => { startPicker.restore(); if (endActive) endPicker.restore(); });
  updateCounts();
}

function updateCounts() {
  $$("#view-log details[data-group]").forEach(d => {
    const n = $$("[data-sym].on", d).length;
    $(".count", d).textContent = n ? ` (${n})` : "";
  });
  const sd = $("#sec-day");
  if (sd) {
    const n = Object.values(form.q).filter(Boolean).length + form.triggers.size;
    $(".count", sd).textContent = n ? ` (${n})` : "";
  }
}

$("#view-log").addEventListener("click", async ev => {
  const t = ev.target.closest("button");
  if (!t) return;
  if (t.dataset.pain) {
    form.pain = Number(t.dataset.pain);
    $$(".pain-row").forEach(r => r.classList.toggle("sel", r.dataset.pain === t.dataset.pain));
  } else if (t.dataset.sym !== undefined) {
    const on = t.classList.toggle("on");
    on ? form.symptoms.add(t.dataset.sym) : form.symptoms.delete(t.dataset.sym);
    updateCounts();
  } else if (t.dataset.trig !== undefined) {
    const on = t.classList.toggle("on");
    on ? form.triggers.add(t.dataset.trig) : form.triggers.delete(t.dataset.trig);
    updateCounts();
  } else if (t.dataset.med !== undefined) {
    const val = t.dataset.med === "Helped";
    form.medHelped = form.medHelped === val ? null : val;
    $$("[data-med]").forEach(b => b.classList.toggle("on", (b.dataset.med === "Helped") === form.medHelped && form.medHelped !== null));
  } else if (t.id === "add-end") {
    endActive = true; t.hidden = true; $("#end-box").hidden = false;
    requestAnimationFrame(() => endPicker.restore());
  } else if (t.id === "rm-end") {
    endActive = false; $("#end-box").hidden = true; $("#add-end").hidden = false;
  } else if (t.id === "add-custom") {
    const inp = $("#f-custom"); const label = inp.value.trim();
    if (!label) return;
    await DB.put("custom", { label });
    inp.value = "";
    form.symptoms.add(label);
    const c = document.createElement("button");
    c.type = "button"; c.className = "chip on"; c.dataset.sym = label; c.textContent = label;
    $("details[data-group='My symptoms'] .chips").append(c);
    updateCounts();
  } else if (t.id === "go-hit6") {
    openPage("Monthly check-in", pageHit6);
  } else if (t.id === "cancel-edit") {
    state.editing = null; renderLog(); showTab("cal");
  } else if (t.id === "save") {
    saveEntry();
  }
});
$("#view-log").addEventListener("change", ev => {
  const q = ev.target.dataset && ev.target.dataset.q;
  if (q) { form.q[q] = ev.target.checked; updateCounts(); }
});

async function saveEntry() {
  if (!form.pain) { toast("Pick a pain level first"); return; }
  const medName = $("#f-med").value.trim();
  const old = state.editing;
  const e = {
    pain: form.pain,
    date: $("#f-date").value || istDate(),
    time: startPicker.get(),
    endTime: endActive ? endPicker.get() : "",
    symptoms: [...form.symptoms],
    triggers: [...form.triggers],
    ...form.q,
    medName,
    medHelped: medName ? form.medHelped : null,
    note: $("#f-note").value.trim(),
    savedAt: old ? old.savedAt : istStamp(),
  };
  if (old) { e.id = old.id; e.updatedAt = istStamp(); }
  await DB.put("entries", e);
  toast(`Saved at ${fmtTime12(istTime())} IST`);
  state.selDate = e.date;
  const wasEditing = !!old;
  await renderLog();
  if (wasEditing) showTab("cal"); else window.scrollTo(0, 0);
}

/* ---------- entry cards / delete / edit ---------- */
function entryCard(e, actions = true) {
  const yes = QUESTIONS.filter(q => e[q.k]).map(q => q.label.replace(/^Did you /, "").replace(/\?$/, ""));
  const lines = [];
  if (e.symptoms && e.symptoms.length) lines.push(esc(e.symptoms.join(", ")));
  if (e.triggers && e.triggers.length) lines.push("Triggers: " + esc(e.triggers.join(", ")));
  if (yes.length) lines.push(esc(yes.join("; ")));
  if (e.medName) lines.push("Medication: " + esc(e.medName) + (e.medHelped === true ? " (helped)" : e.medHelped === false ? " (did not help)" : ""));
  if (e.note) lines.push("Note: " + esc(e.note));
  return `<div class="card entry"><div class="top">
    <div class="badge" style="background:${painColor(e.pain)}">${e.pain}</div>
    <div class="grow"><b>${fmtDate(e.date)}, ${fmtTime12(e.time)}</b>${e.endTime ? " to " + fmtTime12(e.endTime) : ""}</div></div>
    <div class="meta">${lines.map(l => `<div>${l}</div>`).join("")}<div>Saved ${esc((e.savedAt || "").replace("T", " ").replace("+05:30", " IST"))}</div></div>
    ${actions ? `<div class="actions"><button class="btn small secondary" data-edit="${e.id}">Edit</button><button class="btn small danger" data-del="${e.id}">Delete</button></div>` : ""}
  </div>`;
}
document.addEventListener("click", async ev => {
  const b = ev.target.closest("[data-edit],[data-del]");
  if (!b) return;
  const id = Number(b.dataset.edit || b.dataset.del);
  if (b.dataset.edit) {
    const e = (await DB.all("entries")).find(x => x.id === id);
    if (!e) return;
    closeAllPages();
    showTab("log");
    await renderLog(e);
  } else {
    const e = (await DB.all("entries")).find(x => x.id === id);
    if (!e) return;
    await DB.del("entries", id);
    refreshView();
    toast("Entry deleted", "Undo", async () => { await DB.put("entries", e); refreshView(); });
  }
});
function refreshView() {
  if (pageStack.length) drawPage();
  else if (state.tab === "cal") renderCalendar();
}

/* ---------- Calendar tab ---------- */
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
async function renderCalendar() {
  const v = $("#view-cal");
  const { y, m } = state.cal;
  const [entries, periods] = await Promise.all([DB.all("entries"), DB.all("periods")]);
  const maxPain = {};
  entries.forEach(e => { maxPain[e.date] = Math.max(maxPain[e.date] || 0, e.pain); });
  const inPeriod = d => periods.some(p => p.start <= d && d <= (p.end || p.start));
  const lead = (new Date(Date.UTC(y, m - 1, 1)).getUTCDay() + 6) % 7;
  const dim = daysInMonth(y, m);
  const today = istDate();
  let cells = "";
  for (let i = 0; i < lead; i++) cells += '<div class="day blank"></div>';
  for (let d = 1; d <= dim; d++) {
    const ds = `${y}-${pad(m)}-${pad(d)}`;
    const cls = ["day", inPeriod(ds) ? "period" : "", ds === today ? "today" : "", ds === state.selDate ? "selected" : ""].join(" ");
    cells += `<button class="${cls}" data-d="${ds}">${d}${maxPain[ds] ? `<span class="dot" style="background:${painColor(maxPain[ds])}"></span>` : ""}</button>`;
  }
  const dayEntries = state.selDate ? entries.filter(e => e.date === state.selDate).sort((a, b) => a.time.localeCompare(b.time)) : [];
  v.innerHTML = `
    <div class="row"><h1 class="grow">Calendar</h1><button class="btn small secondary" id="all-rec">All records</button></div>
    <div class="cal-head"><button id="prev">‹</button><b>${MONTHS[m - 1]} ${y}</b><button id="next">›</button></div>
    <div class="cal-grid">${["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(d => `<div class="cal-dow">${d}</div>`).join("")}${cells}</div>
    <div class="legend"><span><i class="sq"></i>Period</span>
      ${[1, 2, 3, 4].map(b => `<span><i style="background:${BAND_COLORS[b]}"></i>${BAND_NAMES[b]}</span>`).join("")}</div>
    <div style="height:14px"></div>
    ${state.selDate ? `<h2>${fmtDate(state.selDate)} <span style="text-transform:none;letter-spacing:0;font-weight:400">(tap the day again to hide)</span></h2>${dayEntries.length ? dayEntries.map(e => entryCard(e)).join("") : '<div class="muted">No entries this day.</div>'}` : '<div class="muted">Tap a day to see its entries.</div>'}
  `;
}
$("#view-cal").addEventListener("click", ev => {
  const b = ev.target.closest("button");
  if (!b) return;
  if (b.id === "prev" || b.id === "next") {
    const c = state.cal; const delta = b.id === "prev" ? -1 : 1;
    let mm = c.m + delta, yy = c.y;
    if (mm < 1) { mm = 12; yy--; } if (mm > 12) { mm = 1; yy++; }
    state.cal = { y: yy, m: mm }; renderCalendar();
  } else if (b.dataset.d) { state.selDate = state.selDate === b.dataset.d ? null : b.dataset.d; renderCalendar(); }
  else if (b.id === "all-rec") openPage("All records", pageRecords);
});

/* ---------- More tab ---------- */
function renderMore() {
  const t = getTheme();
  $("#view-more").innerHTML = `
    <h1>More</h1>
    <button class="menu-btn" data-go="period">Enter period</button>
    <button class="menu-btn" data-go="hit6">Monthly HIT-6 check-in</button>
    <button class="menu-btn" data-go="insights">Insights</button>
    <button class="menu-btn" data-go="export">Export and doctor report</button>
    <h2>Theme</h2>
    <div class="seg3">${["light", "dark", "system"].map(x => `<button data-theme="${x}" class="${t === x ? "on" : ""}">${x[0].toUpperCase() + x.slice(1)}</button>`).join("")}</div>
    <p class="muted" style="margin-top:24px">All data is stored only on this phone. Export a backup now and then.</p>`;
}
$("#view-more").addEventListener("click", ev => {
  const b = ev.target.closest("button");
  if (!b) return;
  if (b.dataset.theme) { setTheme(b.dataset.theme); renderMore(); }
  else if (b.dataset.go === "period") openPage("Enter period", pagePeriods);
  else if (b.dataset.go === "hit6") openPage("Monthly check-in", pageHit6);
  else if (b.dataset.go === "insights") openPage("Insights", pageInsights);
  else if (b.dataset.go === "export") openPage("Export", pageExport);
});

/* ---------- pages (overlay with back stack) ---------- */
const pageStack = [];
function openPage(title, render) {
  pageStack.push({ title, render });
  history.pushState({ p: pageStack.length }, "");
  drawPage();
}
function drawPage() {
  const p = $("#page");
  const top = pageStack[pageStack.length - 1];
  if (!top) {
    p.hidden = true; document.body.style.overflow = "";
    if (state.tab === "cal") renderCalendar();
    if (state.tab === "more") renderMore();
    return;
  }
  const scroll = p.scrollTop;
  p.hidden = false; document.body.style.overflow = "hidden";
  p.innerHTML = `<div class="page-in"><div class="page-head noprint"><button id="pg-back">‹ Back</button><h1>${esc(top.title)}</h1></div><div id="pg-body"></div></div>`;
  $("#pg-back").onclick = () => history.back();
  Promise.resolve(top.render($("#pg-body"))).then(() => { p.scrollTop = scroll; });
}
window.addEventListener("popstate", () => { if (pageStack.length) { pageStack.pop(); drawPage(); } });
function closeAllPages() { if (pageStack.length) { const n = pageStack.length; pageStack.length = 0; history.go(-n); drawPage(); } }

async function pageRecords(body) {
  const es = (await DB.all("entries")).sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time));
  if (!es.length) { body.innerHTML = '<p class="muted">No entries yet.</p>'; return; }
  let html = "", cur = "";
  es.forEach(e => {
    const mo = e.date.slice(0, 7);
    if (mo !== cur) { cur = mo; html += `<h2>${MONTHS[Number(mo.slice(5)) - 1]} ${mo.slice(0, 4)}</h2>`; }
    html += entryCard(e);
  });
  body.innerHTML = html;
}

async function pagePeriods(body) {
  const ps = (await DB.all("periods")).sort((a, b) => b.start.localeCompare(a.start));
  body.innerHTML = `
    <div class="card">
      <label>Period start</label><input type="date" id="p-s" value="${istDate()}">
      <label>Period end (leave empty if it hasn't ended yet)</label><input type="date" id="p-e">
      <div style="height:12px"></div><button class="btn" id="p-add">Save period</button>
    </div>
    <h2>Saved periods</h2>
    ${ps.length ? ps.map(p => `<div class="card row"><div class="grow">${fmtDate(p.start)} to ${p.end ? fmtDate(p.end) : "ongoing"}</div>
      <button class="btn small danger" data-pdel="${p.id}">Delete</button></div>`).join("") : '<div class="muted">None yet.</div>'}`;
  $("#p-add").onclick = async () => {
    const s = $("#p-s").value, e = $("#p-e").value;
    if (!s) { toast("Pick a start date"); return; }
    if (e && e < s) { toast("End date is before start date"); return; }
    await DB.put("periods", { start: s, end: e || "" });
    toast("Period saved"); drawPage();
  };
  $$("[data-pdel]", body).forEach(b => b.onclick = async () => {
    if (!confirm("Delete this period?")) return;
    await DB.del("periods", Number(b.dataset.pdel)); drawPage();
  });
}

async function pageHit6(body) {
  const all = (await DB.all("hit6")).sort((a, b) => b.month.localeCompare(a.month));
  const month = istMonth();
  const existing = all.find(h => h.month === month);
  body.innerHTML = `
    <p class="muted">Pick the answer that fits best over the past 4 weeks.</p>
    <label>Month</label><input type="month" id="h-month" value="${month}">
    <div style="height:12px"></div>
    ${HIT6_QUESTIONS.map((q, i) => `<div class="hit-q card"><p>${i + 1}. ${esc(q)}</p>
      <div class="chips">${HIT6_OPTIONS.map(o => `<button type="button" class="chip${existing && existing.answers[i] === o.v ? " on" : ""}" data-hq="${i}" data-v="${o.v}">${o.t}</button>`).join("")}</div></div>`).join("")}
    <button class="btn" id="h-save">${existing ? "Update check-in" : "Save check-in"}</button>
    <h2>Past scores</h2>
    ${all.length ? all.map(h => `<div class="stat"><span>${esc(h.month)}</span><span>${h.score} (${esc(h.category)})</span></div>`).join("") : '<div class="muted">None yet.</div>'}
    <p class="muted">Wording is a paraphrase written for this app, not the official HIT-6 text.</p>`;
  const answers = existing ? existing.answers.slice() : Array(6).fill(null);
  $$("[data-hq]", body).forEach(b => b.onclick = () => {
    const i = Number(b.dataset.hq); answers[i] = Number(b.dataset.v);
    $$(`[data-hq="${i}"]`, body).forEach(x => x.classList.toggle("on", x === b));
  });
  $("#h-save").onclick = async () => {
    if (answers.some(a => a === null)) { toast("Answer all 6 questions"); return; }
    const score = hit6Score(answers);
    await DB.put("hit6", { month: $("#h-month").value || month, answers, score, category: hit6Category(score), savedAt: istStamp() });
    toast(`Saved: score ${score}, ${hit6Category(score)}`);
    drawPage();
    if (confirm("Check-in saved. Export a backup of your data now?")) openPage("Export", pageExport);
  };
}

async function pageInsights(body) {
  const [es, ps] = await Promise.all([DB.all("entries"), DB.all("periods")]);
  if (!es.length) { body.innerHTML = '<p class="muted">Not enough data yet. Insights appear after you log some entries.</p>'; return; }
  const n = es.length;
  const pct = x => `${x} (${Math.round(100 * x / n)}%)`;
  const near = e => ps.some(p => e.date >= addDays(p.start, -2) && e.date <= (p.end || addDays(p.start, 6)));
  const days = new Set(es.map(e => e.date)).size;
  const avg = (es.reduce((a, e) => a + e.pain, 0) / n).toFixed(1);
  const row = (a, b) => `<div class="stat"><span>${a}</span><span>${b}</span></div>`;
  const byMonth = {};
  es.filter(e => e.medName).forEach(e => { (byMonth[e.date.slice(0, 7)] ||= new Set()).add(e.date); });
  const medMonths = Object.entries(byMonth).sort().slice(-6);
  body.innerHTML = `
    <div class="card">${row("Entries", n)}${row("Days with an entry", days)}${row("Average pain", avg)}
      ${row("During, or within 2 days before, a period", ps.length ? pct(es.filter(near).length) : "no periods recorded")}</div>
    <h2>Seen on days of entries</h2>
    <div class="card">${QUESTIONS.filter(q => q.k !== "sleepRecorded").map(q => row(esc(q.label.replace(/^Did you /, "").replace(/\?$/, "")), pct(es.filter(e => e[q.k]).length))).join("")}</div>
    <h2>Top triggers</h2>
    <div class="card">${countBy(es.flatMap(e => e.triggers || [])).slice(0, 6).map(([k, v]) => row(esc(k), pct(v))).join("") || '<div class="muted">None noted yet.</div>'}</div>
    <h2>Top symptoms</h2>
    <div class="card">${countBy(es.flatMap(e => e.symptoms || [])).slice(0, 8).map(([k, v]) => row(esc(k), pct(v))).join("") || '<div class="muted">None yet.</div>'}</div>
    <h2>Medication days per month</h2>
    <div class="card">${medMonths.length ? medMonths.map(([m, s]) => row(m, s.size + " days")).join("") : '<div class="muted">No medication logged yet.</div>'}</div>
    <p class="muted">These are counts from your own entries. They show what appeared together, not what caused what. Taking pain medication on 10 or more days a month is worth raising with your doctor.</p>`;
}

async function pageExport(body) {
  const today = istDate();
  body.innerHTML = `
    <h2>Date range</h2>
    <div class="row"><div class="grow"><label>From</label><input type="date" id="x-from" value="${addDays(today, -90)}"></div>
    <div class="grow"><label>To</label><input type="date" id="x-to" value="${today}"></div></div>
    <div class="chips" style="margin:10px 0">
      <button class="chip" data-r="30">1 month</button><button class="chip" data-r="90">3 months</button>
      <button class="chip" data-r="180">6 months</button><button class="chip" data-r="all">All time</button></div>
    <button class="btn" id="x-report">Doctor report (PDF)</button>
    <div style="height:8px"></div>
    <button class="btn secondary" id="x-csv">Download CSV (with legend)</button>
    <h2>Backup and restore</h2>
    <button class="btn secondary" id="x-json">Download full backup (JSON)</button>
    <div style="height:8px"></div>
    <button class="btn secondary" id="x-import">Restore from backup file</button>
    <input type="file" id="x-file" accept=".json,application/json" hidden>
    <p class="muted">The CSV and report use the date range above. The JSON backup always includes everything.</p>`;
  const range = () => ({ from: $("#x-from").value || "0000-01-01", to: $("#x-to").value || today });
  $$("[data-r]", body).forEach(b => b.onclick = async () => {
    if (b.dataset.r === "all") {
      const es = await DB.all("entries");
      $("#x-from").value = es.length ? es.map(e => e.date).sort()[0] : addDays(today, -365);
    } else $("#x-from").value = addDays(today, -Number(b.dataset.r));
    $("#x-to").value = today;
  });
  $("#x-report").onclick = async () => {
    const { from, to } = range();
    const [es, ps, hs] = await Promise.all([DB.all("entries"), DB.all("periods"), DB.all("hit6")]);
    const html = buildReportHTML(es, ps, hs, from, to);
    openPage("Doctor report", body2 => {
      body2.innerHTML = `<div class="noprint"><button class="btn" id="print">Save as PDF</button>
        <p class="muted">In the print window, choose "Save as PDF" as the destination.</p></div>${html}`;
      $("#print").onclick = () => window.print();
    });
  };
  $("#x-csv").onclick = async () => {
    const { from, to } = range();
    const es = (await DB.all("entries")).filter(e => e.date >= from && e.date <= to);
    download(`migraine-entries-${from}_to_${to}.csv`, buildEntriesCsv(es), "text/csv");
    setTimeout(() => download("migraine-csv-legend.csv", buildLegendCsv(), "text/csv"), 600);
  };
  $("#x-json").onclick = async () => {
    const data = {
      app: "migraine-tracker", version: 1, exportedAt: istStamp(),
      entries: await DB.all("entries"), periods: await DB.all("periods"),
      hit6: await DB.all("hit6"), custom: await DB.all("custom"),
    };
    download(`migraine-backup-${today}.json`, JSON.stringify(data, null, 1), "application/json");
  };
  $("#x-import").onclick = () => $("#x-file").click();
  $("#x-file").onchange = async ev => {
    const f = ev.target.files[0]; if (!f) return;
    try {
      const data = JSON.parse(await f.text());
      if (data.app !== "migraine-tracker") throw new Error("Not a Migraine Tracker backup");
      if (!confirm(`Restore ${data.entries.length} entries? Records with the same ID will be overwritten.`)) return;
      for (const s of ["entries", "periods", "hit6", "custom"]) for (const r of data[s] || []) await DB.put(s, r);
      toast("Backup restored");
    } catch (err) { toast("Could not read that file: " + err.message); }
  };
}

/* ---------- init ---------- */
$("#tabs").addEventListener("click", ev => {
  const b = ev.target.closest("button"); if (b) showTab(b.dataset.tab);
});
(async function init() {
  setTheme(getTheme());
  if (/netlify\.app$/.test(location.hostname)) document.documentElement.classList.add("on-netlify");
  if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});
  if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(() => {});
  await renderLog();
})();
