// IndexedDB wrapper + IST time helpers. All data stays on the device.

const DB_NAME = "migraine-tracker";
const DB_VER = 1;
let _db = null;

function openDB() {
  if (_db) return Promise.resolve(_db);
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VER);
    req.onupgradeneeded = () => {
      const db = req.result;
      db.createObjectStore("entries", { keyPath: "id", autoIncrement: true });
      db.createObjectStore("periods", { keyPath: "id", autoIncrement: true });
      db.createObjectStore("hit6", { keyPath: "month" });
      db.createObjectStore("custom", { keyPath: "label" });
    };
    req.onsuccess = () => { _db = req.result; resolve(_db); };
    req.onerror = () => reject(req.error);
  });
}
function tx(store, mode, fn) {
  return openDB().then(db => new Promise((resolve, reject) => {
    const t = db.transaction(store, mode);
    const r = fn(t.objectStore(store));
    t.oncomplete = () => resolve(r && r.result);
    t.onerror = () => reject(t.error);
    t.onabort = () => reject(t.error);
  }));
}
const DB = {
  all: s => tx(s, "readonly", st => st.getAll()),
  put: (s, v) => tx(s, "readwrite", st => st.put(v)),
  del: (s, k) => tx(s, "readwrite", st => st.delete(k)),
  clear: s => tx(s, "readwrite", st => st.clear()),
};

// ---- IST helpers (UTC+05:30, independent of the phone's time zone) ----
const IST_MS = 5.5 * 3600 * 1000;
const pad = n => String(n).padStart(2, "0");
function istNow() {
  const d = new Date(Date.now() + IST_MS);
  return {
    y: d.getUTCFullYear(), m: d.getUTCMonth() + 1, d: d.getUTCDate(),
    h: d.getUTCHours(), min: d.getUTCMinutes(), s: d.getUTCSeconds(),
  };
}
function istDate() { const n = istNow(); return `${n.y}-${pad(n.m)}-${pad(n.d)}`; }
function istTime() { const n = istNow(); return `${pad(n.h)}:${pad(n.min)}`; }
function istMonth() { const n = istNow(); return `${n.y}-${pad(n.m)}`; }
function istStamp() {
  const n = istNow();
  return `${n.y}-${pad(n.m)}-${pad(n.d)}T${pad(n.h)}:${pad(n.min)}:${pad(n.s)}+05:30`;
}
function fmtTime12(t) {
  if (!t) return "";
  const [h, m] = t.split(":").map(Number);
  return `${h % 12 === 0 ? 12 : h % 12}:${pad(m)} ${h >= 12 ? "PM" : "AM"}`;
}
function fmtDate(d) {
  const [y, m, day] = d.split("-").map(Number);
  const mon = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][m - 1];
  return `${day} ${mon} ${y}`;
}
function addDays(dateStr, n) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + n));
  return `${dt.getUTCFullYear()}-${pad(dt.getUTCMonth() + 1)}-${pad(dt.getUTCDate())}`;
}
function daysInMonth(y, m) { return new Date(Date.UTC(y, m, 0)).getUTCDate(); }
