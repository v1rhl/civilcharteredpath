/* Site diary: a site visit record built around photos pinned to a plan.
   - A visit holds the header details, one or more plans (an image, or a PDF page rendered with pdf.js),
     and numbered photos. Each photo can be pinned on a plan with a direction-of-view arrow, marked up
     (arrows, boxes, rings, freehand, text) and given a commentary. Plans can be marked up the same way.
   - Everything is kept on this device in IndexedDB (falling back to memory if that's blocked). Nothing is uploaded.
     pdf.js and jsPDF are fetched from cdnjs the first time they're needed; the files themselves never leave the browser.
   - A visit exports to a single .json file (images inlined) and imports back, and to a PDF report via jsPDF,
     or the browser's print dialog if jsPDF can't load. */
(function () {
  "use strict";
  window.CP_TOOLS = (window.CP_TOOLS || []).concat([{ id: "site-diary", label: "Site diary", blurb: "Record a site visit on your phone: photos pinned to the plan with the direction you were looking, marked up with arrows, boxes and notes, and a PDF visit report. Kept on your device." }]);

  var root = document.getElementById("view-site-diary"), app = document.getElementById("sd-app");
  if (!root || !app) return;

  /* ---------- small helpers ---------- */
  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function today() { var d = new Date(); return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
  function hhmm(t) { var d = new Date(t || Date.now()); return pad(d.getHours()) + ":" + pad(d.getMinutes()); }
  function fmtDate(s) { if (!s) return ""; var p = s.split("-"); var d = new Date(+p[0], +p[1] - 1, +p[2]); return isNaN(d) ? s : d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" }); }
  function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function slug(s) { return String(s || "visit").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "visit"; }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function r1(v) { return Math.round(v * 10) / 10; }
  function loadImg(src) { return new Promise(function (ok, fail) { var i = new Image(); i.onload = function () { ok(i); }; i.onerror = function () { fail(new Error("image")); }; i.src = src; }); }
  function canvas(w, h) { var c = document.createElement("canvas"); c.width = Math.max(1, Math.round(w)); c.height = Math.max(1, Math.round(h)); return c; }
  function toBlob(c, type, q) { return new Promise(function (ok, fail) { c.toBlob(function (b) { if (b) ok(b); else fail(new Error("encode")); }, type, q); }); }
  function download(name, blob) { if (window.CPExport) return window.CPExport.download(name, blob.type, blob); var a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000); }
  var loadedScripts = {};
  function loadScript(src) {
    if (!loadedScripts[src]) loadedScripts[src] = new Promise(function (ok, fail) { var s = document.createElement("script"); s.src = src; s.onload = ok; s.onerror = function () { delete loadedScripts[src]; fail(new Error("load")); }; document.head.appendChild(s); });
    return loadedScripts[src];
  }
  var PDFJS = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js", PDFJS_WORKER = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
  var JSPDF = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";

  /* ---------- storage: IndexedDB, memory if it's unavailable ---------- */
  var dbP = null, MEM = null;
  function db() {
    if (!dbP) dbP = new Promise(function (ok) {
      var settled = false;
      function done(d) { if (settled) return; settled = true; if (!d) MEM = { visits: {}, blobs: {} }; ok(d); }
      try {
        var r = indexedDB.open("cp-site-diary", 1);
        r.onupgradeneeded = function () { var d = r.result; if (!d.objectStoreNames.contains("visits")) d.createObjectStore("visits", { keyPath: "id" }); if (!d.objectStoreNames.contains("blobs")) d.createObjectStore("blobs", { keyPath: "id" }); };
        r.onsuccess = function () { done(r.result); };
        r.onerror = function () { done(null); };
        setTimeout(function () { done(null); }, 4000);
      } catch (e) { done(null); }
    });
    return dbP;
  }
  function op(sn, mode, idb, mem) {
    return db().then(function (d) {
      if (!d) return mem(MEM[sn]);
      return new Promise(function (ok, fail) {
        var t = d.transaction(sn, mode), out, rq = idb(t.objectStore(sn));
        rq.onsuccess = function () { out = rq.result; };
        t.oncomplete = function () { ok(out); };
        t.onerror = t.onabort = function () { fail(t.error || new Error("storage")); };
      });
    });
  }
  function dbPut(sn, o) { return op(sn, "readwrite", function (s) { return s.put(o); }, function (m) { m[o.id] = o; }); }
  function dbGet(sn, id) { return op(sn, "readonly", function (s) { return s.get(id); }, function (m) { return m[id]; }); }
  function dbAll(sn) { return op(sn, "readonly", function (s) { return s.getAll(); }, function (m) { return Object.keys(m).map(function (k) { return m[k]; }); }); }
  function dbDel(sn, id) { return op(sn, "readwrite", function (s) { return s.delete(id); }, function (m) { delete m[id]; }); }

  /* Images are stored as ArrayBuffers (Safari has been unreliable with Blobs in IndexedDB) and served as object URLs. */
  var URLS = {};
  function putBlob(blob) {
    var id = uid();
    return blob.arrayBuffer().then(function (buf) { return dbPut("blobs", { id: id, type: blob.type, data: buf }); }).then(function () { URLS[id] = URL.createObjectURL(blob); return id; });
  }
  function getBlob(id) { return dbGet("blobs", id).then(function (r) { return r ? new Blob([r.data], { type: r.type }) : null; }); }
  function ensureUrls(v) {
    var ids = v.photos.map(function (p) { return p.b; }).concat(v.plans.map(function (p) { return p.b; })).filter(function (id) { return !URLS[id]; });
    return Promise.all(ids.map(function (id) { return getBlob(id).then(function (b) { if (b) URLS[id] = URL.createObjectURL(b); }); }));
  }
  function src(id) { return URLS[id] || ""; }
  var persistAsked = false;
  function askPersist() { if (persistAsked) return; persistAsked = true; try { if (navigator.storage && navigator.storage.persist) navigator.storage.persist(); } catch (e) {} }

  /* ---------- state ---------- */
  var V = null;          /* the open visit */
  var LIST = [];         /* [{id, site, date, updated}] */
  var ui = { tab: "details", plan: null, sel: null, placing: null };
  var saveT = null;
  function blankVisit() {
    return { id: uid(), created: Date.now(), updated: Date.now(), site: "", ref: "", date: today(), time: hhmm(), timeOut: "", by: lsGet("cp-site-diary-by") || "",
      weather: "", temp: "", present: "", purpose: "", notes: "", actions: "", plans: [], photos: [] };
  }
  function touch() { if (!V) return; V.updated = Date.now(); clearTimeout(saveT); saveT = setTimeout(saveNow, 400); }
  function saveNow() {
    clearTimeout(saveT); saveT = null; if (!V) return Promise.resolve();
    var copy = JSON.parse(JSON.stringify(V));
    var e = LIST.filter(function (x) { return x.id === V.id; })[0];
    if (e) { e.site = V.site; e.date = V.date; e.updated = V.updated; } else LIST.push({ id: V.id, site: V.site, date: V.date, updated: V.updated });
    return dbPut("visits", copy).catch(function (err) { status("Couldn't save in this browser" + (err && err.name === "QuotaExceededError" ? ": it's out of space. Save a visit file and delete old visits." : ".")); });
  }
  window.addEventListener("pagehide", function () { if (saveT) saveNow(); });
  document.addEventListener("visibilitychange", function () { if (document.hidden && saveT) saveNow(); });
  function photoById(id) { return V ? V.photos.filter(function (p) { return p.id === id; })[0] : null; }
  function planById(id) { return V ? V.plans.filter(function (p) { return p.id === id; })[0] : null; }
  function num(ph) { return V.photos.indexOf(ph) + 1; }
  function curPlan() { var p = planById(ui.plan); if (!p && V && V.plans.length) { p = V.plans[0]; ui.plan = p.id; } return p || null; }

  /* ---------- drawing: markup and pins, as SVG and on canvas (the two must agree) ---------- */
  var COLORS = [["#e0312b", "Red"], ["#f5c518", "Yellow"], ["#1e6fd9", "Blue"], ["#ffffff", "White"], ["#111111", "Black"]];
  var SW = { 1: 1.3, 2: 2.6, 3: 4.2 }, TS = { 1: 10, 2: 15, 3: 23 };
  function unit(W, H) { return Math.max(W, H) / 400; }
  function halo(c) { return c === "#111111" ? "rgba(255,255,255,0.75)" : "rgba(0,0,0,0.45)"; }
  function headPts(m, sw, u) {
    var dx = m.x2 - m.x1, dy = m.y2 - m.y1, L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L, hl = Math.min(L * 0.6, Math.max(sw * 4.2, u * 11)), hw = hl * 0.55;
    var bx = m.x2 - ux * hl, by = m.y2 - uy * hl;
    return { bx: bx, by: by, pts: [[m.x2, m.y2], [bx - uy * hw, by + ux * hw], [bx + uy * hw, by - ux * hw]] };
  }
  function markSvg(m, i, W, H, hitW) {
    var u = unit(W, H), sw = SW[m.s || 2] * u, c = m.c, hw = sw + u * 1.6, body = "", hit = "", geo = "";
    if (m.t === "arrow") { var hp = headPts(m, sw, u); geo = 'M' + r1(m.x1) + " " + r1(m.y1) + "L" + r1(hp.bx) + " " + r1(hp.by); var tri = hp.pts.map(function (p) { return r1(p[0]) + "," + r1(p[1]); }).join(" ");
      body = '<path d="' + geo + '" stroke="' + halo(c) + '" stroke-width="' + r1(hw) + '" fill="none" stroke-linecap="round"/><polygon points="' + tri + '" fill="' + halo(c) + '" stroke="' + halo(c) + '" stroke-width="' + r1(u * 1.6) + '" stroke-linejoin="round"/>' +
        '<path d="' + geo + '" stroke="' + c + '" stroke-width="' + r1(sw) + '" fill="none" stroke-linecap="round"/><polygon points="' + tri + '" fill="' + c + '"/>';
      geo = "M" + r1(m.x1) + " " + r1(m.y1) + "L" + r1(m.x2) + " " + r1(m.y2); }
    else if (m.t === "box" || m.t === "ell") {
      var x = Math.min(m.x1, m.x2), y = Math.min(m.y1, m.y2), w = Math.abs(m.x2 - m.x1), h = Math.abs(m.y2 - m.y1);
      var shape = m.t === "box" ? function (st, s) { return '<rect x="' + r1(x) + '" y="' + r1(y) + '" width="' + r1(w) + '" height="' + r1(h) + '" rx="' + r1(u * 1.5) + '" fill="none" stroke="' + st + '" stroke-width="' + r1(s) + '"/>'; }
        : function (st, s) { return '<ellipse cx="' + r1(x + w / 2) + '" cy="' + r1(y + h / 2) + '" rx="' + r1(w / 2) + '" ry="' + r1(h / 2) + '" fill="none" stroke="' + st + '" stroke-width="' + r1(s) + '"/>'; };
      body = shape(halo(c), hw) + shape(c, sw); hit = shape("rgba(0,0,0,0)", hitW || sw * 3);
    }
    else if (m.t === "pen") { var pts = ""; for (var k = 0; k < m.p.length; k += 2) pts += (k ? " " : "") + r1(m.p[k]) + "," + r1(m.p[k + 1]);
      var pl = function (st, s) { return '<polyline points="' + pts + '" fill="none" stroke="' + st + '" stroke-width="' + r1(s) + '" stroke-linecap="round" stroke-linejoin="round"/>'; };
      body = pl(halo(c), hw) + pl(c, sw); hit = pl("rgba(0,0,0,0)", hitW || sw * 3); }
    else if (m.t === "text") { var fs = TS[m.s || 2] * u, lines = String(m.text || "").split("\n");
      var tsp = lines.map(function (l, j) { return '<tspan x="' + r1(m.x1) + '" dy="' + (j ? "1.2em" : "0") + '">' + esc(l || " ") + "</tspan>"; }).join("");
      body = '<text x="' + r1(m.x1) + '" y="' + r1(m.y1) + '" font-family="Arial,Helvetica,sans-serif" font-weight="700" font-size="' + r1(fs) + '" fill="' + c + '" stroke="' + halo(c) + '" stroke-width="' + r1(fs * 0.16) + '" paint-order="stroke" stroke-linejoin="round" dominant-baseline="hanging">' + tsp + "</text>"; }
    if (geo) hit = '<path d="' + geo + '" stroke="rgba(0,0,0,0)" stroke-width="' + r1(hitW || sw * 3) + '" fill="none"/>';
    return '<g data-m="' + i + '">' + hit + body + "</g>";
  }
  function marksSvg(marks, W, H, hitW) { return (marks || []).map(function (m, i) { return markSvg(m, i, W, H, hitW); }).join(""); }
  function drawMarks(g, marks, W, H) {
    var u = unit(W, H);
    (marks || []).forEach(function (m) {
      var sw = SW[m.s || 2] * u, hw = sw + u * 1.6, c = m.c;
      g.lineCap = "round"; g.lineJoin = "round";
      function strokeTwice(path) { g.strokeStyle = halo(c); g.lineWidth = hw; path(); g.stroke(); g.strokeStyle = c; g.lineWidth = sw; path(); g.stroke(); }
      if (m.t === "arrow") { var hp = headPts(m, sw, u);
        strokeTwice(function () { g.beginPath(); g.moveTo(m.x1, m.y1); g.lineTo(hp.bx, hp.by); });
        [[halo(c), u * 1.6], [c, 0]].forEach(function (s) { g.beginPath(); hp.pts.forEach(function (p, j) { j ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]); }); g.closePath(); g.fillStyle = s[0]; g.fill(); if (s[1]) { g.strokeStyle = s[0]; g.lineWidth = s[1]; g.stroke(); } }); }
      else if (m.t === "box" || m.t === "ell") { var x = Math.min(m.x1, m.x2), y = Math.min(m.y1, m.y2), w = Math.abs(m.x2 - m.x1), h = Math.abs(m.y2 - m.y1);
        strokeTwice(function () { g.beginPath(); if (m.t === "box") { if (g.roundRect) g.roundRect(x, y, w, h, u * 1.5); else g.rect(x, y, w, h); } else g.ellipse(x + w / 2, y + h / 2, Math.max(w / 2, 0.1), Math.max(h / 2, 0.1), 0, 0, Math.PI * 2); }); }
      else if (m.t === "pen") strokeTwice(function () { g.beginPath(); for (var k = 0; k < m.p.length; k += 2) k ? g.lineTo(m.p[k], m.p[k + 1]) : g.moveTo(m.p[k], m.p[k + 1]); });
      else if (m.t === "text") { var fs = TS[m.s || 2] * u; g.font = "700 " + fs + "px Arial, Helvetica, sans-serif"; g.textBaseline = "top";
        String(m.text || "").split("\n").forEach(function (l, j) { var y = m.y1 + j * fs * 1.2; g.strokeStyle = halo(c); g.lineWidth = fs * 0.16; g.strokeText(l, m.x1, y); g.fillStyle = c; g.fillText(l, m.x1, y); }); }
    });
  }
  /* Pin: numbered disc at the camera position, arrow and a 56 degree wedge showing the direction of view.
     dir is degrees clockwise from the top of the sheet. */
  var PIN = "#b84a32";
  function pinGeom(pin, r) {
    var a = pin.dir * Math.PI / 180, sx = Math.sin(a), sy = -Math.cos(a), R = r * 3.6, half = 28 * Math.PI / 180;
    return { a: a, sx: sx, sy: sy, R: R, p1: [pin.x + R * Math.sin(a - half), pin.y - R * Math.cos(a - half)], p2: [pin.x + R * Math.sin(a + half), pin.y - R * Math.cos(a + half)],
      s: [pin.x + sx * r * 1.05, pin.y + sy * r * 1.05], tip: [pin.x + sx * r * 3.1, pin.y + sy * r * 3.1] };
  }
  function pinSvg(ph, n, r, sel) {
    var p = ph.pin, G = pinGeom(p, r), hl = r * 0.95, hw = r * 0.55, bx = G.tip[0] - G.sx * hl, by = G.tip[1] - G.sy * hl;
    var tri = [[G.tip[0], G.tip[1]], [bx + G.sy * hw, by - G.sx * hw], [bx - G.sy * hw, by + G.sx * hw]].map(function (q) { return r1(q[0]) + "," + r1(q[1]); }).join(" ");
    var out = '<g class="sd-pin' + (sel ? " sel" : "") + '" data-pin="' + ph.id + '">' +
      '<path d="M' + r1(p.x) + " " + r1(p.y) + "L" + r1(G.p1[0]) + " " + r1(G.p1[1]) + "A" + r1(G.R) + " " + r1(G.R) + " 0 0 1 " + r1(G.p2[0]) + " " + r1(G.p2[1]) + 'Z" fill="' + PIN + '" fill-opacity="0.2" stroke="' + PIN + '" stroke-opacity="0.55" stroke-width="' + r1(r * 0.1) + '" pointer-events="none"/>' +
      '<line x1="' + r1(G.s[0]) + '" y1="' + r1(G.s[1]) + '" x2="' + r1(bx) + '" y2="' + r1(by) + '" stroke="#fff" stroke-width="' + r1(r * 0.5) + '" stroke-linecap="round"/>' +
      '<line x1="' + r1(G.s[0]) + '" y1="' + r1(G.s[1]) + '" x2="' + r1(bx) + '" y2="' + r1(by) + '" stroke="' + PIN + '" stroke-width="' + r1(r * 0.28) + '" stroke-linecap="round"/>' +
      '<polygon points="' + tri + '" fill="' + PIN + '" stroke="#fff" stroke-width="' + r1(r * 0.12) + '" stroke-linejoin="round"/>' +
      (sel ? '<circle cx="' + r1(p.x) + '" cy="' + r1(p.y) + '" r="' + r1(r * 1.5) + '" fill="none" stroke="#0d6b78" stroke-width="' + r1(r * 0.2) + '" stroke-dasharray="' + r1(r * 0.5) + " " + r1(r * 0.35) + '"/>' : "") +
      '<circle cx="' + r1(p.x) + '" cy="' + r1(p.y) + '" r="' + r1(r) + '" fill="' + PIN + '" stroke="#fff" stroke-width="' + r1(r * 0.18) + '"/>' +
      '<text x="' + r1(p.x) + '" y="' + r1(p.y) + '" text-anchor="middle" dominant-baseline="central" font-family="Arial,Helvetica,sans-serif" font-weight="700" font-size="' + r1(r * (n > 9 ? 0.95 : 1.15)) + '" fill="#fff">' + n + "</text>";
    if (sel) {
      var hx = p.x + G.sx * r * 4.4, hy = p.y + G.sy * r * 4.4;
      out += '<g data-rot="' + ph.id + '" class="sd-rot"><circle cx="' + r1(hx) + '" cy="' + r1(hy) + '" r="' + r1(r * 1.7) + '" fill="rgba(0,0,0,0)"/>' +
        '<circle cx="' + r1(hx) + '" cy="' + r1(hy) + '" r="' + r1(r * 0.78) + '" fill="#fff" stroke="#0d6b78" stroke-width="' + r1(r * 0.24) + '"/>' +
        '<path d="M' + r1(hx - r * 0.34) + " " + r1(hy) + "A" + r1(r * 0.34) + " " + r1(r * 0.34) + " 0 1 1 " + r1(hx) + " " + r1(hy + r * 0.34) + '" fill="none" stroke="#0d6b78" stroke-width="' + r1(r * 0.14) + '"/></g>';
    }
    return out + "</g>";
  }
  function drawPin(g, ph, n, r) {
    var p = ph.pin, G = pinGeom(p, r), hl = r * 0.95, hw = r * 0.55, bx = G.tip[0] - G.sx * hl, by = G.tip[1] - G.sy * hl;
    g.save();
    g.beginPath(); g.moveTo(p.x, p.y); g.lineTo(G.p1[0], G.p1[1]); g.arc(p.x, p.y, G.R, G.a - Math.PI / 2 - 28 * Math.PI / 180, G.a - Math.PI / 2 + 28 * Math.PI / 180); g.closePath();
    g.fillStyle = "rgba(184,74,50,0.2)"; g.fill(); g.strokeStyle = "rgba(184,74,50,0.55)"; g.lineWidth = r * 0.1; g.stroke();
    g.lineCap = "round"; g.beginPath(); g.moveTo(G.s[0], G.s[1]); g.lineTo(bx, by); g.strokeStyle = "#fff"; g.lineWidth = r * 0.5; g.stroke(); g.strokeStyle = PIN; g.lineWidth = r * 0.28; g.stroke();
    g.beginPath(); g.moveTo(G.tip[0], G.tip[1]); g.lineTo(bx + G.sy * hw, by - G.sx * hw); g.lineTo(bx - G.sy * hw, by + G.sx * hw); g.closePath(); g.fillStyle = PIN; g.fill(); g.strokeStyle = "#fff"; g.lineWidth = r * 0.12; g.lineJoin = "round"; g.stroke();
    g.beginPath(); g.arc(p.x, p.y, r, 0, Math.PI * 2); g.fillStyle = PIN; g.fill(); g.strokeStyle = "#fff"; g.lineWidth = r * 0.18; g.stroke();
    g.fillStyle = "#fff"; g.font = "700 " + r * (n > 9 ? 0.95 : 1.15) + "px Arial, Helvetica, sans-serif"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(String(n), p.x, p.y + r * 0.04);
    g.restore();
  }
  function pinsOn(plan) { return V.photos.filter(function (ph) { return ph.pin && ph.pin.plan === plan.id; }); }
  function exportR(plan) { return Math.max(plan.w, plan.h) / 80; }
  /* A static picture: photo or plan with its markup (and pins), as inline SVG for thumbnails and the report preview. */
  function staticSvg(item, withPins, cls) {
    var body = '<image href="' + src(item.b) + '" x="0" y="0" width="' + item.w + '" height="' + item.h + '" preserveAspectRatio="none"/>' + marksSvg(item.marks, item.w, item.h);
    if (withPins) body += pinsOn(item).map(function (ph) { return pinSvg(ph, num(ph), exportR(item), false); }).join("");
    return '<svg class="' + (cls || "") + '" viewBox="0 0 ' + item.w + " " + item.h + '" xmlns="http://www.w3.org/2000/svg" role="img" preserveAspectRatio="xMidYMid meet">' + body + "</svg>";
  }
  function compose(item, withPins, maxPx) {
    return loadImg(src(item.b)).then(function (img) {
      var k = Math.min(1, maxPx / Math.max(item.w, item.h)), c = canvas(item.w * k, item.h * k), g = c.getContext("2d");
      g.fillStyle = "#fff"; g.fillRect(0, 0, c.width, c.height); g.scale(c.width / item.w, c.height / item.h);
      g.drawImage(img, 0, 0, item.w, item.h); drawMarks(g, item.marks, item.w, item.h);
      if (withPins) pinsOn(item).forEach(function (ph) { drawPin(g, ph, num(ph), exportR(item)); });
      return c;
    });
  }

  /* ---------- zoomable SVG viewport: wheel and pinch zoom, single-pointer gestures passed to the owner ---------- */
  function Viewport(svg, onChange, h) {
    var vp = { x: 0, y: 0, w: 100, h: 100, W: 100, H: 100 }, ptrs = {}, pinch = null, single = null;
    function asp() { var r = svg.getBoundingClientRect(); return r.width > 4 && r.height > 4 ? r.height / r.width : vp.H / vp.W; }
    function apply() { svg.setAttribute("viewBox", vp.x + " " + vp.y + " " + vp.w + " " + vp.h); if (onChange) onChange(); }
    function limits() { var a = asp(), max = Math.max(vp.W, vp.H / a) * 1.5, min = Math.max(vp.W, vp.H) / 30; return [min, max]; }
    vp.fit = function (W, H) { if (W) { vp.W = W; vp.H = H; } var a = asp(), w = vp.W, hh = w * a; if (hh < vp.H) { hh = vp.H; w = hh / a; } w *= 1.03; hh *= 1.03; vp.x = (vp.W - w) / 2; vp.y = (vp.H - hh) / 2; vp.w = w; vp.h = hh; apply(); };
    vp.resize = function () { var cx = vp.x + vp.w / 2, cy = vp.y + vp.h / 2; vp.h = vp.w * asp(); vp.x = cx - vp.w / 2; vp.y = cy - vp.h / 2; apply(); };
    vp.pt = function (e) { var r = svg.getBoundingClientRect(); return { x: vp.x + (e.clientX - r.left) / r.width * vp.w, y: vp.y + (e.clientY - r.top) / r.height * vp.h }; };
    vp.scale = function () { var r = svg.getBoundingClientRect(); return (r.width || 1) / vp.w; };
    vp.zoomAt = function (k, cx, cy) { var L = limits(), nw = clamp(vp.w / k, L[0], L[1]); k = vp.w / nw; vp.x = cx - (cx - vp.x) / k; vp.y = cy - (cy - vp.y) / k; vp.w = nw; vp.h = nw * asp(); apply(); };
    vp.zoomBy = function (k) { vp.zoomAt(k, vp.x + vp.w / 2, vp.y + vp.h / 2); };
    vp.panBy = function (dx, dy) { var s = vp.scale(); vp.x -= dx / s; vp.y -= dy / s; apply(); };
    svg.addEventListener("wheel", function (e) { e.preventDefault(); var p = vp.pt(e); vp.zoomAt(Math.pow(1.0018, -e.deltaY * (e.deltaMode === 1 ? 30 : 1)), p.x, p.y); }, { passive: false });
    function pair() { var ids = Object.keys(ptrs); return [ptrs[ids[0]], ptrs[ids[1]]]; }
    svg.addEventListener("pointerdown", function (e) {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      try { svg.setPointerCapture(e.pointerId); } catch (x) {}
      ptrs[e.pointerId] = { x: e.clientX, y: e.clientY };
      var n = Object.keys(ptrs).length;
      if (n === 2) {
        if (single) { if (h.cancel) h.cancel(); single = null; }
        var q = pair(), r = svg.getBoundingClientRect(), mx = (q[0].x + q[1].x) / 2, my = (q[0].y + q[1].y) / 2;
        pinch = { d0: Math.hypot(q[0].x - q[1].x, q[0].y - q[1].y) || 1, w0: vp.w, p0: { x: vp.x + (mx - r.left) / r.width * vp.w, y: vp.y + (my - r.top) / r.height * vp.h } };
      } else if (n === 1) { single = { id: e.pointerId, x: e.clientX, y: e.clientY, moved: false }; h.down(e, vp.pt(e)); }
      e.preventDefault();
    });
    svg.addEventListener("pointermove", function (e) {
      if (!ptrs[e.pointerId]) { if (h.hover) h.hover(e); return; }
      ptrs[e.pointerId] = { x: e.clientX, y: e.clientY };
      if (pinch && Object.keys(ptrs).length >= 2) {
        var q = pair(), r = svg.getBoundingClientRect(), d = Math.hypot(q[0].x - q[1].x, q[0].y - q[1].y), mx = (q[0].x + q[1].x) / 2, my = (q[0].y + q[1].y) / 2, L = limits();
        var nw = clamp(pinch.w0 * pinch.d0 / (d || 1), L[0], L[1]); vp.w = nw; vp.h = nw * asp();
        vp.x = pinch.p0.x - (mx - r.left) / r.width * nw; vp.y = pinch.p0.y - (my - r.top) / r.height * vp.h; apply(); return;
      }
      if (single && single.id === e.pointerId) { if (!single.moved && Math.hypot(e.clientX - single.x, e.clientY - single.y) > 6) single.moved = true; h.move(e, vp.pt(e), single); }
    });
    function end(e) {
      if (!ptrs[e.pointerId]) return;
      delete ptrs[e.pointerId];
      if (pinch) { if (Object.keys(ptrs).length < 2) pinch = null; return; }
      if (single && single.id === e.pointerId) { var s = single; single = null; if (e.type === "pointercancel") { if (h.cancel) h.cancel(); } else h.up(e, vp.pt(e), !s.moved); }
    }
    svg.addEventListener("pointerup", end); svg.addEventListener("pointercancel", end);
    return vp;
  }

  /* ---------- the page shell ---------- */
  var ICON = {
    select: '<path d="M6 3l12 9-5.5 1.2L16 20l-2.6 1.2-3-6.6L6 18z"/>',
    arrow: '<path d="M4 20L18 6M10 5h9v9" fill="none"/>',
    box: '<rect x="4" y="6" width="16" height="12" rx="1.5" fill="none"/>',
    ell: '<ellipse cx="12" cy="12" rx="8.5" ry="6.5" fill="none"/>',
    pen: '<path d="M3 17c3-6 5 2 8-3s4-7 7-6 2 6-1 9" fill="none"/>',
    text: '<path d="M5 6V4h14v2M12 4v16M9 20h6" fill="none"/>',
    undo: '<path d="M9 7L4 12l5 5M4 12h10a6 6 0 010 12" fill="none" transform="translate(0 -3)"/>',
    trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" fill="none"/>',
    cam: '<path d="M4 8h3l2-3h6l2 3h3v11H4z" fill="none"/><circle cx="12" cy="13" r="3.5" fill="none"/>'
  };
  function ico(k) { return '<svg viewBox="0 0 24 24" aria-hidden="true" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" fill="currentColor">' + ICON[k] + "</svg>"; }
  var TOOLS = [["select", "Select"], ["arrow", "Arrow"], ["box", "Box"], ["ell", "Ring"], ["pen", "Draw"], ["text", "Text"]];
  var LOCAL_NOTE = "Your photos, plans and notes stay in this browser on this device. Nothing is uploaded. Save a visit file to back a visit up or move it to another device; clearing this site's data in your browser deletes it.";

  app.innerHTML =
    '<div class="sd-bar">' +
      '<label class="sd-vis"><span class="sd-lab">Visit</span><select id="sd-visit" aria-label="Open a saved visit"></select></label>' +
      '<div class="sd-bar-btns">' +
        '<button type="button" class="sd-btn" id="sd-new">New visit</button>' +
        '<button type="button" class="sd-btn" id="sd-save">Save visit file</button>' +
        '<button type="button" class="sd-btn" id="sd-open">Open visit file</button>' +
        '<button type="button" class="sd-btn danger" id="sd-del">Delete visit</button>' +
      "</div>" +
    "</div>" +
    '<p class="small sd-local">' + esc(LOCAL_NOTE) + ' <span id="sd-usage"></span></p>' +
    '<div id="sd-main" hidden>' +
      '<nav class="sd-tabs" role="tablist" aria-label="Visit sections">' +
        '<button type="button" role="tab" data-tab="details">Details</button>' +
        '<button type="button" role="tab" data-tab="plan">Plan</button>' +
        '<button type="button" class="sd-shoot" id="sd-shoot" aria-label="Take a photo">' + ico("cam") + "<span>Photo</span></button>" +
        '<button type="button" role="tab" data-tab="photos">Photos <span class="sd-count" id="sd-count"></span></button>' +
        '<button type="button" role="tab" data-tab="report">Report</button>' +
      "</nav>" +
      '<p class="small sd-status" id="sd-status" aria-live="polite"></p>' +
      '<div class="sd-pane" id="sd-pane-details" role="tabpanel"></div>' +
      '<div class="sd-pane" id="sd-pane-plan" role="tabpanel" hidden></div>' +
      '<div class="sd-pane" id="sd-pane-photos" role="tabpanel" hidden></div>' +
      '<div class="sd-pane" id="sd-pane-report" role="tabpanel" hidden></div>' +
    "</div>" +
    '<div class="panel tool sd-empty" id="sd-empty" hidden>' +
      "<h3>Start a site visit</h3>" +
      "<p>Fill in who was there and the weather, load the drawing you're working from, then take photos as you walk round. Pin each photo where you stood with an arrow for the way you were facing, mark it up, and add a comment. The report puts it all in one PDF.</p>" +
      '<div class="sd-row"><button type="button" class="btn" id="sd-start">Start a visit</button><button type="button" class="btn ghost" id="sd-open2">Open a visit file</button></div>' +
    "</div>" +
    '<input type="file" id="sd-in-cam" accept="image/*" capture="environment" hidden>' +
    '<input type="file" id="sd-in-photos" accept="image/*" multiple hidden>' +
    '<input type="file" id="sd-in-plan" accept="image/*,application/pdf,.pdf" hidden>' +
    '<input type="file" id="sd-in-visit" accept=".json,application/json" hidden>' +
    /* markup editor */
    '<div class="sd-modal sd-ed" id="sd-ed" hidden role="dialog" aria-modal="true" aria-labelledby="sd-ed-title">' +
      '<div class="sd-ed-top">' +
        '<button type="button" class="sd-btn sd-done" id="sd-ed-done">Done</button>' +
        '<strong id="sd-ed-title"></strong>' +
        '<span class="sd-ed-nav"><button type="button" class="sd-btn" id="sd-ed-prev" aria-label="Previous photo">&#8249;</button><button type="button" class="sd-btn" id="sd-ed-next" aria-label="Next photo">&#8250;</button></span>' +
      "</div>" +
      '<div class="sd-ed-body">' +
        '<div class="sd-stage sd-ed-stage" id="sd-ed-stage"><svg id="sd-ed-svg" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none"><image id="sd-ed-img" x="0" y="0" preserveAspectRatio="none"/><g id="sd-ed-marks"></g><g id="sd-ed-sel"></g></svg>' +
          '<div class="sd-zoom"><button type="button" data-z="out" aria-label="Zoom out">&minus;</button><button type="button" data-z="fit" aria-label="Fit to screen">Fit</button><button type="button" data-z="in" aria-label="Zoom in">+</button></div></div>' +
        '<div class="sd-ed-side">' +
          '<div class="sd-tools" role="toolbar" aria-label="Markup tools">' + TOOLS.map(function (t) { return '<button type="button" class="sd-tool" data-tool="' + t[0] + '" aria-pressed="false">' + ico(t[0]) + "<span>" + t[1] + "</span></button>"; }).join("") +
            '<button type="button" class="sd-tool" id="sd-ed-undo" disabled>' + ico("undo") + "<span>Undo</span></button>" +
            '<button type="button" class="sd-tool" id="sd-ed-rm" disabled>' + ico("trash") + "<span>Delete</span></button></div>" +
          '<div class="sd-style"><span class="sd-swatches" role="group" aria-label="Colour">' + COLORS.map(function (c) { return '<button type="button" class="sd-sw" data-c="' + c[0] + '" style="background:' + c[0] + '" aria-label="' + c[1] + '" aria-pressed="false"></button>'; }).join("") + "</span>" +
            '<span class="sd-sizes" role="group" aria-label="Line and text size">' + [1, 2, 3].map(function (s) { return '<button type="button" class="sd-size" data-s="' + s + '" aria-pressed="false" aria-label="' + ["Thin", "Medium", "Thick"][s - 1] + '"><i style="height:' + [2, 4, 7][s - 1] + 'px"></i></button>'; }).join("") + "</span></div>" +
          '<label class="field" id="sd-ed-textwrap" hidden><span class="sd-lab">Label text</span><textarea id="sd-ed-text" rows="2"></textarea></label>' +
          '<p class="small sd-ed-hint" id="sd-ed-hint"></p>' +
          '<div id="sd-ed-photo" class="sd-ed-photo">' +
            '<label class="field"><span class="sd-lab">Commentary</span><textarea id="sd-ed-note" rows="4" placeholder="What does this show? Anything that needs doing, and by whom?"></textarea></label>' +
            '<p class="small" id="sd-ed-meta"></p>' +
            '<div class="sd-row"><button type="button" class="sd-btn" id="sd-ed-place">Pin on plan</button><button type="button" class="sd-btn danger" id="sd-ed-delph">Delete photo</button></div>' +
          "</div>" +
        "</div>" +
      "</div>" +
    "</div>" +
    /* PDF page picker */
    '<div class="sd-modal sd-pick" id="sd-pick" hidden role="dialog" aria-modal="true" aria-labelledby="sd-pick-title">' +
      '<div class="sd-pick-box panel">' +
        '<div class="sd-row" style="justify-content:space-between"><h3 id="sd-pick-title" style="margin:0">Pick the page to use as the plan</h3><button type="button" class="sd-btn" id="sd-pick-x">Cancel</button></div>' +
        '<div class="sd-row"><label class="sd-lab" for="sd-pick-n">Page</label><input type="number" id="sd-pick-n" min="1" value="1" style="width:6em"><button type="button" class="btn" id="sd-pick-go">Use this page</button><span class="small" id="sd-pick-of"></span></div>' +
        '<div class="sd-pages" id="sd-pages"></div>' +
      "</div>" +
    "</div>";

  function status(t) { var s = $("sd-status"); if (s) s.textContent = t || ""; }
  function usage() {
    try { if (navigator.storage && navigator.storage.estimate) navigator.storage.estimate().then(function (e) { var mb = (e.usage || 0) / 1048576; $("sd-usage").textContent = mb >= 1 ? "About " + (mb < 10 ? mb.toFixed(1) : Math.round(mb)) + " MB used in this browser." : ""; }); } catch (e) {}
  }

  /* ---------- visit list ---------- */
  function visitLabel(x) { return (x.site || "Untitled visit") + (x.date ? " · " + fmtDate(x.date) : ""); }
  function renderList() {
    LIST.sort(function (a, b) { return (b.date || "").localeCompare(a.date || "") || b.updated - a.updated; });
    $("sd-visit").innerHTML = LIST.length ? LIST.map(function (x) { return '<option value="' + x.id + '"' + (V && x.id === V.id ? " selected" : "") + ">" + esc(visitLabel(x)) + "</option>"; }).join("") : "<option>No visits yet</option>";
    $("sd-visit").disabled = !LIST.length;
    ["sd-save", "sd-del"].forEach(function (id) { $(id).disabled = !V; });
  }
  function openVisit(v) {
    if (saveT) saveNow();
    V = v; ui = { tab: ui.tab || "details", plan: v && v.plans[0] ? v.plans[0].id : null, sel: null, placing: null };
    if (!V) { $("sd-main").hidden = true; $("sd-empty").hidden = false; renderList(); return Promise.resolve(); }
    lsSet("cp-site-diary-last", V.id);
    return ensureUrls(V).then(function () { $("sd-main").hidden = false; $("sd-empty").hidden = true; renderList(); renderDetails(); showTab(ui.tab); usage(); });
  }
  function newVisit() {
    var v = blankVisit(); V = null;
    LIST.push({ id: v.id, site: v.site, date: v.date, updated: v.updated });
    ui.tab = "details";
    return openVisit(v).then(function () { saveNow(); var f = $("sd-f-site"); if (f) f.focus(); status("New visit started. It saves as you go."); });
  }
  $("sd-new").addEventListener("click", newVisit);
  $("sd-start").addEventListener("click", newVisit);
  $("sd-visit").addEventListener("change", function () { var id = this.value; if (saveT) saveNow(); dbGet("visits", id).then(function (v) { if (v) openVisit(v); }); });
  $("sd-del").addEventListener("click", function () {
    if (!V) return;
    if (!window.confirm("Delete \"" + visitLabel(V) + "\" and all its photos from this device? This can't be undone. Save a visit file first if you might need it.")) return;
    var gone = V; clearTimeout(saveT); saveT = null;
    Promise.all([dbDel("visits", gone.id)].concat(gone.photos.concat(gone.plans).map(function (x) { if (URLS[x.b]) { URL.revokeObjectURL(URLS[x.b]); delete URLS[x.b]; } return dbDel("blobs", x.b); }))).then(function () {
      LIST = LIST.filter(function (x) { return x.id !== gone.id; }); V = null; renderList();
      var next = LIST[0]; (next ? dbGet("visits", next.id) : Promise.resolve(null)).then(function (v) { openVisit(v || null); status("Visit deleted."); usage(); });
    });
  });

  /* ---------- tabs ---------- */
  function showTab(t) {
    ui.tab = t;
    Array.prototype.forEach.call(app.querySelectorAll(".sd-tabs [data-tab]"), function (b) { var on = b.dataset.tab === t; b.setAttribute("aria-selected", on ? "true" : "false"); });
    ["details", "plan", "photos", "report"].forEach(function (k) { $("sd-pane-" + k).hidden = k !== t; });
    $("sd-count").textContent = V && V.photos.length ? V.photos.length : "";
    if (t === "plan") renderPlan();
    if (t === "photos") renderPhotos();
    if (t === "report") { renderReport(); loadScript(JSPDF).catch(function () {}); }
  }
  app.querySelector(".sd-tabs").addEventListener("click", function (e) { var b = e.target.closest("[data-tab]"); if (b) { showTab(b.dataset.tab); if (window.innerWidth <= 760) { var tb = document.querySelector(".topbar"), top = $("sd-status").getBoundingClientRect().top + window.scrollY - (tb ? tb.offsetHeight : 60) - 8; window.scrollTo(0, Math.max(0, top)); } } });
  $("sd-shoot").addEventListener("click", function () { $("sd-in-cam").click(); });

  /* ---------- details ---------- */
  var FIELDS = [
    ["site", "Site or project", "text", "e.g. Riverside outfall, Chainage 1+200"], ["ref", "Visit reference", "text", "e.g. SV-014"],
    ["date", "Date", "date"], ["time", "Arrived", "time"], ["timeOut", "Left", "time"], ["by", "Recorded by", "text", "Your name"],
    ["weather", "Weather", "text", "e.g. Overcast, light rain"], ["temp", "Temperature (°C)", "number", ""],
    ["present", "Who was present", "area", "One per line, with their company and role"],
    ["purpose", "Purpose of the visit", "area", "e.g. Inspect formation before blinding; progress check"],
    ["notes", "Observations and general notes", "area", "Progress, ground conditions, workmanship, safety, anything you saw"],
    ["actions", "Actions arising", "area", "Who does what, by when"]
  ];
  function renderDetails() {
    $("sd-pane-details").innerHTML = '<form class="panel tool sd-form" id="sd-form" autocomplete="off">' + FIELDS.map(function (f) {
      var id = "sd-f-" + f[0], v = esc(V[f[0]]), inp = f[2] === "area" ? '<textarea id="' + id + '" data-k="' + f[0] + '" rows="' + (f[0] === "notes" ? 5 : 3) + '" placeholder="' + esc(f[3]) + '">' + v + "</textarea>"
        : '<input id="' + id + '" data-k="' + f[0] + '" type="' + f[2] + '" value="' + v + '"' + (f[3] ? ' placeholder="' + esc(f[3]) + '"' : "") + (f[0] === "weather" ? ' list="sd-weather"' : "") + (f[2] === "number" ? ' inputmode="decimal" step="any"' : "") + ">";
      return '<div class="field sd-f-' + f[0] + (f[2] === "area" ? " wide" : "") + '"><label for="' + id + '">' + f[1] + "</label>" + inp + "</div>";
    }).join("") + '<datalist id="sd-weather">' + ["Dry and sunny", "Dry, overcast", "Light rain", "Heavy rain", "Showers", "Windy", "Frost", "Snow", "Fog"].map(function (w) { return '<option value="' + w + '">'; }).join("") + "</datalist>" +
      '<p class="small wide" style="margin:0">Saved as you type.</p></form>';
  }
  $("sd-pane-details").addEventListener("input", function (e) {
    var k = e.target.dataset && e.target.dataset.k; if (!k || !V) return;
    V[k] = e.target.value; touch();
    if (k === "by") lsSet("cp-site-diary-by", V.by);
    if (k === "site" || k === "date") { var x = LIST.filter(function (l) { return l.id === V.id; })[0]; if (x) { x.site = V.site; x.date = V.date; } renderList(); }
  });

  /* ---------- adding photos ---------- */
  function shrink(file, max, type, q) {
    var u = URL.createObjectURL(file);
    return loadImg(u).then(function (img) {
      var w = img.naturalWidth, h = img.naturalHeight, k = Math.min(1, max / Math.max(w, h)), c = canvas(w * k, h * k), g = c.getContext("2d");
      g.fillStyle = "#fff"; g.fillRect(0, 0, c.width, c.height); g.drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(u);
      return toBlob(c, type, q).then(function (b) { return { blob: b, w: c.width, h: c.height }; });
    }, function (e) { URL.revokeObjectURL(u); throw e; });
  }
  function addPhotos(files, fromCamera) {
    files = Array.prototype.slice.call(files || []).filter(function (f) { return /^image\//.test(f.type) || /\.(jpe?g|png|webp|gif|heic|heif)$/i.test(f.name); });
    if (!files.length || !V) return;
    files.sort(function (a, b) { return (a.lastModified || 0) - (b.lastModified || 0); });
    status(files.length > 1 ? "Adding " + files.length + " photos…" : "Adding photo…");
    var added = [], failed = 0, chain = Promise.resolve();
    files.forEach(function (f) {
      chain = chain.then(function () {
        return shrink(f, 2000, "image/jpeg", 0.85).then(function (r) { return putBlob(r.blob).then(function (b) {
          var ph = { id: uid(), b: b, w: r.w, h: r.h, at: fromCamera ? Date.now() : (f.lastModified || Date.now()), name: f.name || "", note: "", marks: [], pin: null };
          V.photos.push(ph); added.push(ph);
        }); }).catch(function () { failed++; });
      });
    });
    return chain.then(function () {
      askPersist(); return saveNow();
    }).then(function () {
      usage(); $("sd-count").textContent = V.photos.length || "";
      var msg = added.length ? (added.length === 1 ? "Photo " + num(added[0]) + " added." : added.length + " photos added.") : "";
      if (failed) msg += " " + failed + " file" + (failed > 1 ? "s" : "") + " couldn't be read as an image" + (failed > 1 ? "s" : "") + " in this browser.";
      if (added.length === 1 && curPlan()) {
        ui.sel = added[0].id; ui.placing = added[0].id; showTab("plan");
        msg += " Tap the plan where you were standing, or pick it later.";
      } else showTab("photos");
      status(msg.trim());
    });
  }
  $("sd-in-cam").addEventListener("change", function () { addPhotos(this.files, true); this.value = ""; });
  $("sd-in-photos").addEventListener("change", function () { addPhotos(this.files, false); this.value = ""; });

  /* ---------- photos pane ---------- */
  function pinText(ph) { if (!ph.pin) return "Not pinned on a plan"; var p = planById(ph.pin.plan); return "On " + (p ? p.name : "plan") + ", facing " + Math.round(ph.pin.dir) + "°"; }
  function renderPhotos() {
    var pane = $("sd-pane-photos"), n = V.photos.length, pinned = V.photos.filter(function (p) { return p.pin; }).length;
    pane.innerHTML = '<div class="sd-row sd-acts"><button type="button" class="btn sd-coarse" data-act="cam">' + ico("cam") + " Take photo</button>" +
      '<button type="button" class="btn ghost" data-act="add">Add photos from device</button>' +
      '<span class="small">' + (n ? n + " photo" + (n > 1 ? "s" : "") + ", " + pinned + " pinned on a plan" : "") + "</span></div>" +
      (n ? '<div class="sd-grid">' + V.photos.map(function (ph, i) {
        return '<button type="button" class="sd-card" data-ph="' + ph.id + '"><span class="sd-thumb">' + staticSvg(ph, false) + '<span class="sd-num">' + (i + 1) + "</span></span>" +
          '<span class="sd-cap"><b>Photo ' + (i + 1) + "</b> <span class=\"mono\">" + hhmm(ph.at) + '</span><span class="sd-pinned' + (ph.pin ? "" : " no") + '">' + esc(pinText(ph)) + "</span>" +
          (ph.note ? '<span class="sd-note">' + esc(ph.note) + "</span>" : '<span class="sd-note none">No commentary yet</span>') + "</span></button>";
      }).join("") + "</div>"
        : '<div class="panel sd-none"><p>No photos yet. Take one with your camera, or add photos already on this device. They\'re resized to 2000 pixels on the long side to save space, and stay on this device.</p></div>');
  }
  $("sd-pane-photos").addEventListener("click", function (e) {
    var a = e.target.closest("[data-act]"); if (a) { $(a.dataset.act === "cam" ? "sd-in-cam" : "sd-in-photos").click(); return; }
    var c = e.target.closest("[data-ph]"); if (c) openEditor("photo", photoById(c.dataset.ph));
  });

  /* ---------- plans ---------- */
  function addPlanFile(f) {
    if (!f || !V) return;
    var isPdf = /pdf$/i.test(f.type) || /\.pdf$/i.test(f.name), base = (f.name || "Plan").replace(/\.[a-z0-9]+$/i, "");
    var job;
    if (isPdf) {
      status("Opening the PDF…");
      job = Promise.all([loadScript(PDFJS), f.arrayBuffer()]).then(function (x) {
        var lib = window.pdfjsLib; lib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER;
        return lib.getDocument({ data: new Uint8Array(x[1]) }).promise;
      }, function (e) { if (e && e.message === "load") throw new Error("The PDF reader couldn't load. Check your connection, or load the plan as an image instead."); throw e; }).then(function (doc) {
        return (doc.numPages > 1 ? pickPage(doc) : Promise.resolve(1)).then(function (n) {
          status("Rendering page " + n + "…");
          return renderPdfPage(doc, n, 3200).then(function (c) { return toBlob(c, "image/png").then(function (b) { return { blob: b, w: c.width, h: c.height, name: base + (doc.numPages > 1 ? " (page " + n + ")" : ""), from: "PDF page " + n }; }); });
        });
      });
    } else {
      status("Loading the plan…");
      job = shrink(f, 3600, /png$/i.test(f.type) ? "image/png" : "image/jpeg", 0.9).then(function (r) { r.name = base; r.from = "image"; return r; });
    }
    job.then(function (r) { return putBlob(r.blob).then(function (b) {
      var p = { id: uid(), b: b, w: r.w, h: r.h, name: r.name, from: r.from, marks: [] };
      V.plans.push(p); ui.plan = p.id; askPersist(); return saveNow().then(function () { usage(); showTab("plan"); status("Plan loaded. Pick a photo below, then tap the plan where it was taken."); });
    }); }).catch(function (e) { if (e && e.message === "cancel") { status(""); return; } status(e && e.message && e.message.length > 12 ? e.message : "Couldn't read that file as a plan. Try a PDF, JPEG or PNG."); });
  }
  $("sd-in-plan").addEventListener("change", function () { addPlanFile(this.files[0]); this.value = ""; });
  function renderPdfPage(doc, n, maxPx) {
    return doc.getPage(n).then(function (pg) {
      var v1 = pg.getViewport({ scale: 1 }), k = maxPx / Math.max(v1.width, v1.height), vp = pg.getViewport({ scale: k }), c = canvas(vp.width, vp.height), g = c.getContext("2d");
      g.fillStyle = "#fff"; g.fillRect(0, 0, c.width, c.height);
      return pg.render({ canvasContext: g, viewport: vp }).promise.then(function () { return c; });
    });
  }
  function pickPage(doc) {
    return new Promise(function (ok, fail) {
      var m = $("sd-pick"), grid = $("sd-pages"), alive = true, N = doc.numPages;
      $("sd-pick-n").max = N; $("sd-pick-n").value = 1; $("sd-pick-of").textContent = "of " + N;
      grid.innerHTML = ""; m.hidden = false; lockScroll(true);
      function close() { alive = false; m.hidden = true; lockScroll(false); $("sd-pick-go").onclick = $("sd-pick-x").onclick = grid.onclick = null; }
      $("sd-pick-go").onclick = function () { var n = clamp(parseInt($("sd-pick-n").value, 10) || 1, 1, N); close(); ok(n); };
      $("sd-pick-x").onclick = function () { close(); fail(new Error("cancel")); };
      grid.onclick = function (e) { var b = e.target.closest("[data-n]"); if (b) { close(); ok(+b.dataset.n); } };
      var shown = Math.min(N, 40), i = 0;
      (function next() {
        if (!alive || i >= shown) return; var n = ++i;
        renderPdfPage(doc, n, 220).then(function (c) { if (!alive) return; var b = document.createElement("button"); b.type = "button"; b.className = "sd-page"; b.dataset.n = n; c.setAttribute("aria-hidden", "true"); b.appendChild(c); var s = document.createElement("span"); s.textContent = "Page " + n; b.appendChild(s); grid.appendChild(b); next(); }, next);
      })();
    });
  }

  /* ---------- plan pane ---------- */
  var PV = null, planDrag = null;
  function renderPlan() {
    var pane = $("sd-pane-plan"), plan = curPlan();
    if (!plan) {
      pane.innerHTML = '<div class="panel tool sd-none"><h3>Load a plan</h3><p>Use the drawing you\'re working from: a PDF (pick the page) or a photo or screenshot of the plan. You\'ll pin each photo on it with an arrow for the direction you were looking. The file stays on this device.</p>' +
        '<div class="sd-row"><button type="button" class="btn" data-act="plan">Load a plan</button></div></div>';
      PV = null; return;
    }
    pane.innerHTML =
      '<div class="sd-row sd-plan-bar">' +
        (V.plans.length > 1 ? '<label class="sd-vis"><span class="sd-lab">Plan</span><select id="sd-plan-sel">' + V.plans.map(function (p) { return '<option value="' + p.id + '"' + (p.id === plan.id ? " selected" : "") + ">" + esc(p.name) + "</option>"; }).join("") + "</select></label>" : '<strong class="sd-plan-name">' + esc(plan.name) + "</strong>") +
        '<span class="sd-bar-btns"><button type="button" class="sd-btn" data-act="markup">Mark up plan</button><button type="button" class="sd-btn" data-act="plan">Add another plan</button><button type="button" class="sd-btn danger" data-act="rmplan">Remove plan</button></span>' +
      "</div>" +
      '<p class="small sd-hint" id="sd-plan-hint" aria-live="polite"></p>' +
      '<div class="sd-stage sd-plan-stage"><svg id="sd-plan-svg" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" aria-label="Plan with photo positions"><image href="' + src(plan.b) + '" x="0" y="0" width="' + plan.w + '" height="' + plan.h + '" preserveAspectRatio="none"/><g id="sd-plan-marks">' + marksSvg(plan.marks, plan.w, plan.h) + '</g><g id="sd-plan-pins"></g></svg>' +
        '<div class="sd-zoom"><button type="button" data-z="out" aria-label="Zoom out">&minus;</button><button type="button" data-z="fit" aria-label="Fit plan to screen">Fit</button><button type="button" data-z="in" aria-label="Zoom in">+</button></div></div>' +
      '<div class="sd-pinbar" id="sd-pinbar"></div>' +
      '<div class="sd-strip-head"><span class="sd-lab">Photos</span><span class="small">Pick a photo, then tap the plan where you stood. Drag the round handle to turn the arrow. Pinch or scroll to zoom.</span></div>' +
      '<div class="sd-strip" id="sd-strip"></div>';
    var svg = $("sd-plan-svg");
    PV = Viewport(svg, drawPins, planGestures);
    requestAnimationFrame(function () { PV.fit(plan.w, plan.h); if (ui.sel) centreOn(photoById(ui.sel)); if (ui.placing && window.innerWidth <= 760) svg.parentNode.scrollIntoView({ block: "center" }); });
    renderStrip(); renderPinbar(); planHint();
  }
  function centreOn(ph) { if (!PV || !ph || !ph.pin || ph.pin.plan !== ui.plan) return; PV.x = ph.pin.x - PV.w / 2; PV.y = ph.pin.y - PV.h / 2; PV.resize(); }
  function drawPins() {
    var g = $("sd-plan-pins"), plan = curPlan(); if (!g || !plan || !PV) return;
    var r = 14 / PV.scale();
    g.innerHTML = pinsOn(plan).map(function (ph) { return pinSvg(ph, num(ph), r, ph.id === ui.sel); }).join("");
  }
  function planHint() {
    var h = $("sd-plan-hint"); if (!h) return; var ph = photoById(ui.placing);
    h.textContent = ph ? "Tap the plan where photo " + num(ph) + " was taken from." : ui.sel && photoById(ui.sel) && photoById(ui.sel).pin ? "Drag the marker to move it, or the round handle to turn the arrow." : "";
    h.classList.toggle("on", !!ph);
  }
  function renderStrip() {
    var s = $("sd-strip"); if (!s) return; var plan = curPlan();
    s.innerHTML = V.photos.length ? V.photos.map(function (ph, i) {
      var where = !ph.pin ? "not pinned" : ph.pin.plan === plan.id ? "pinned" : "other plan";
      return '<button type="button" class="sd-chip' + (ph.id === ui.sel ? " sel" : "") + (ph.pin ? "" : " unpinned") + '" data-ph="' + ph.id + '" aria-pressed="' + (ph.id === ui.sel) + '" aria-label="Photo ' + (i + 1) + ", " + where + '">' +
        '<img src="' + src(ph.b) + '" alt="" loading="lazy"><span class="sd-num">' + (i + 1) + "</span>" + (ph.pin ? "" : '<span class="sd-flag">not pinned</span>') + "</button>";
    }).join("") + '<button type="button" class="sd-chip sd-chip-add" data-act="cam">' + ico("cam") + "<span>Take photo</span></button>"
      : '<p class="small" style="margin:0">No photos yet. <button type="button" class="linkish sd-linkbtn" data-act="cam">Take one</button> or <button type="button" class="linkish sd-linkbtn" data-act="add">add from this device</button>.</p>';
  }
  function renderPinbar() {
    var b = $("sd-pinbar"); if (!b) return; var ph = photoById(ui.sel);
    if (!ph) { b.innerHTML = ""; b.hidden = true; return; }
    b.hidden = false;
    var on = ph.pin && ph.pin.plan === ui.plan;
    b.innerHTML = '<img src="' + src(ph.b) + '" alt="">' +
      '<div class="sd-pinbar-txt"><b>Photo ' + num(ph) + "</b> <span class=\"mono small\">" + hhmm(ph.at) + "</span><br><span class=\"small\">" + esc(ph.pin ? pinText(ph) : "Tap the plan to pin it") + "</span></div>" +
      '<div class="sd-bar-btns">' + (on ? '<button type="button" class="sd-btn" data-rot="-15" aria-label="Turn 15 degrees anticlockwise">&#10226; 15°</button><button type="button" class="sd-btn" data-rot="15" aria-label="Turn 15 degrees clockwise">15° &#10227;</button>' : "") +
      '<button type="button" class="sd-btn" data-act="edit">Mark up</button>' + (ph.pin ? '<button type="button" class="sd-btn" data-act="unpin">Unpin</button>' : "") + "</div>";
  }
  function selectPhoto(id, arm) {
    ui.sel = id; var ph = photoById(id);
    ui.placing = arm && ph && !ph.pin ? id : null;
    if (ph && ph.pin && ph.pin.plan !== ui.plan) { ui.plan = ph.pin.plan; renderPlan(); return; }
    drawPins(); renderStrip(); renderPinbar(); planHint();
  }
  var planGestures = {
    down: function (e, p) {
      var t = e.target, rot = t.closest && t.closest("[data-rot]"), pin = t.closest && t.closest("[data-pin]");
      if (rot) planDrag = { k: "rot", ph: photoById(rot.getAttribute("data-rot")) };
      else if (pin) { var ph = photoById(pin.getAttribute("data-pin")); planDrag = { k: "move", ph: ph, ox: p.x - ph.pin.x, oy: p.y - ph.pin.y, was: ui.sel }; if (ui.sel !== ph.id) { ui.placing = null; ui.sel = ph.id; drawPins(); renderStrip(); renderPinbar(); planHint(); } }
      else planDrag = { k: "pan", lx: e.clientX, ly: e.clientY };
    },
    move: function (e, p, s) {
      if (!planDrag) return; var plan = curPlan();
      if (planDrag.k === "rot") { var ph = planDrag.ph, a = Math.atan2(p.x - ph.pin.x, -(p.y - ph.pin.y)) * 180 / Math.PI; ph.pin.dir = (Math.round(a / 5) * 5 + 360) % 360; planDrag.changed = true; drawPins(); renderPinbar(); }
      else if (planDrag.k === "move" && s.moved) { planDrag.ph.pin.x = clamp(p.x - planDrag.ox, 0, plan.w); planDrag.ph.pin.y = clamp(p.y - planDrag.oy, 0, plan.h); planDrag.changed = true; drawPins(); }
      else if (planDrag.k === "pan" && s.moved) { PV.panBy(e.clientX - planDrag.lx, e.clientY - planDrag.ly); planDrag.lx = e.clientX; planDrag.ly = e.clientY; }
    },
    up: function (e, p, tap) {
      var d = planDrag; planDrag = null; if (!d) return; var plan = curPlan();
      if (d.changed) { touch(); renderStrip(); renderPinbar(); }
      if (d.k === "pan" && tap) {
        var ph = photoById(ui.placing);
        if (ph && p.x >= 0 && p.y >= 0 && p.x <= plan.w && p.y <= plan.h) {
          ph.pin = { plan: plan.id, x: p.x, y: p.y, dir: 0 }; ui.placing = null; ui.sel = ph.id; touch();
          drawPins(); renderStrip(); renderPinbar(); planHint();
          var nxt = V.photos.filter(function (q) { return !q.pin; })[0];
          status("Photo " + num(ph) + " pinned. Drag the round handle to point the arrow the way you were looking." + (nxt ? " Photo " + num(nxt) + " isn't pinned yet." : ""));
        } else if (!ph) { ui.sel = null; drawPins(); renderStrip(); renderPinbar(); planHint(); }
      }
    },
    cancel: function () { if (planDrag && planDrag.changed) touch(); planDrag = null; }
  };
  $("sd-pane-plan").addEventListener("click", function (e) {
    var z = e.target.closest("[data-z]"); if (z && PV) { var p = curPlan(); if (z.dataset.z === "fit") PV.fit(p.w, p.h); else PV.zoomBy(z.dataset.z === "in" ? 1.5 : 1 / 1.5); return; }
    var a = e.target.closest("[data-act]");
    if (a) {
      var act = a.dataset.act, ph = photoById(ui.sel);
      if (act === "plan") $("sd-in-plan").click();
      else if (act === "cam") $("sd-in-cam").click();
      else if (act === "add") $("sd-in-photos").click();
      else if (act === "markup") openEditor("plan", curPlan());
      else if (act === "edit" && ph) openEditor("photo", ph);
      else if (act === "unpin" && ph) { ph.pin = null; ui.placing = ph.id; touch(); drawPins(); renderStrip(); renderPinbar(); planHint(); }
      else if (act === "rmplan") {
        var plan = curPlan(), n = pinsOn(plan).length;
        if (!window.confirm("Remove the plan \"" + plan.name + "\" from this visit?" + (n ? " " + n + " photo" + (n > 1 ? "s" : "") + " pinned on it will be unpinned." : "") + " The photos themselves are kept.")) return;
        pinsOn(plan).forEach(function (q) { q.pin = null; });
        V.plans = V.plans.filter(function (q) { return q !== plan; }); dbDel("blobs", plan.b); ui.plan = V.plans[0] ? V.plans[0].id : null; touch(); renderPlan(); usage();
      }
      return;
    }
    var r = e.target.closest("[data-rot]"); if (r && r.tagName === "BUTTON") { var q = photoById(ui.sel); if (q && q.pin) { q.pin.dir = (q.pin.dir + +r.dataset.rot + 360) % 360; touch(); drawPins(); renderPinbar(); renderStrip(); } return; }
    var c = e.target.closest(".sd-strip [data-ph]"); if (c) { var id = c.dataset.ph; selectPhoto(id, true); var ph2 = photoById(id); if (ph2 && ph2.pin) centreOn(ph2); }
  });
  $("sd-pane-plan").addEventListener("change", function (e) { if (e.target.id === "sd-plan-sel") { ui.plan = e.target.value; ui.placing = null; renderPlan(); } });
  window.addEventListener("resize", function () { if (PV && ui.tab === "plan" && !$("sd-pane-plan").hidden) PV.resize(); if (ED.vp && !$("sd-ed").hidden) ED.vp.resize(); });

  /* ---------- markup editor (photos and plans) ---------- */
  var ED = { kind: null, item: null, tool: "arrow", c: COLORS[0][0], s: 2, sel: -1, undo: [], vp: null, draw: null };
  function lockScroll(on) { document.documentElement.classList.toggle("sd-locked", on); }
  function openEditor(kind, item) {
    if (!item) return;
    ED.kind = kind; ED.item = item; ED.sel = -1; ED.undo = []; ED.draw = null;
    var m = $("sd-ed"); m.hidden = false; lockScroll(true);
    $("sd-ed-img").setAttribute("href", src(item.b)); $("sd-ed-img").setAttribute("width", item.w); $("sd-ed-img").setAttribute("height", item.h);
    $("sd-ed-photo").hidden = kind !== "photo";
    $("sd-ed-prev").hidden = $("sd-ed-next").hidden = kind !== "photo";
    if (kind === "photo") {
      var i = V.photos.indexOf(item);
      $("sd-ed-title").textContent = "Photo " + (i + 1) + " of " + V.photos.length;
      $("sd-ed-prev").disabled = i <= 0; $("sd-ed-next").disabled = i >= V.photos.length - 1;
      $("sd-ed-note").value = item.note || "";
      $("sd-ed-meta").textContent = "Taken " + hhmm(item.at) + ". " + pinText(item) + ".";
      $("sd-ed-place").textContent = item.pin ? "Show on plan" : "Pin on plan";
      $("sd-ed-place").disabled = !V.plans.length; $("sd-ed-place").title = V.plans.length ? "" : "Load a plan first";
    } else $("sd-ed-title").textContent = "Mark up " + item.name;
    if (!ED.vp) ED.vp = Viewport($("sd-ed-svg"), edRender, edGestures);
    setTool(ED.tool); setStyleUi();
    requestAnimationFrame(function () { ED.vp.fit(item.w, item.h); });
    edRender();
    $("sd-ed-done").focus({ preventScroll: true });
  }
  function closeEditor() {
    if (ED.kind === "photo") saveNote();
    pruneEmptyText();
    $("sd-ed").hidden = true; lockScroll(false); touch();
    var k = ED.kind; ED.item = null; ED.kind = null;
    if (ui.tab === "photos") renderPhotos(); else if (ui.tab === "plan") { if (k === "plan") renderPlan(); else { drawPins(); renderStrip(); renderPinbar(); } }
  }
  function saveNote() { if (ED.item && ED.kind === "photo") { ED.item.note = $("sd-ed-note").value; touch(); } }
  function pruneEmptyText() { if (!ED.item) return; var before = ED.item.marks.length; ED.item.marks = ED.item.marks.filter(function (m) { return m.t !== "text" || String(m.text || "").trim(); }); if (before !== ED.item.marks.length) { ED.sel = -1; touch(); } }
  $("sd-ed-done").addEventListener("click", closeEditor);
  document.addEventListener("keydown", function (e) {
    if ($("sd-ed").hidden) return;
    var typing = /^(TEXTAREA|INPUT)$/.test(document.activeElement && document.activeElement.tagName);
    if (e.key === "Escape") { if (ED.sel >= 0) { pruneEmptyText(); ED.sel = -1; edRender(); } else closeEditor(); }
    else if (!typing && (e.key === "Delete" || e.key === "Backspace") && ED.sel >= 0) { e.preventDefault(); removeSel(); }
    else if (!typing && (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") { e.preventDefault(); undo(); }
  });
  function step(d) { saveNote(); pruneEmptyText(); var i = V.photos.indexOf(ED.item) + d; if (i >= 0 && i < V.photos.length) openEditor("photo", V.photos[i]); }
  $("sd-ed-prev").addEventListener("click", function () { step(-1); });
  $("sd-ed-next").addEventListener("click", function () { step(1); });
  $("sd-ed-note").addEventListener("input", saveNote);
  $("sd-ed-place").addEventListener("click", function () {
    var ph = ED.item; closeEditor(); ui.sel = ph.id; ui.placing = ph.pin ? null : ph.id; if (ph.pin) ui.plan = ph.pin.plan;
    showTab("plan"); if (!ph.pin) status("Tap the plan where photo " + num(ph) + " was taken from.");
  });
  $("sd-ed-delph").addEventListener("click", function () {
    var ph = ED.item; if (!window.confirm("Delete photo " + num(ph) + " and its markup? Photos after it are renumbered.")) return;
    var i = V.photos.indexOf(ph); V.photos.splice(i, 1); dbDel("blobs", ph.b); if (ui.sel === ph.id) ui.sel = null;
    touch(); usage();
    if (V.photos.length) openEditor("photo", V.photos[Math.min(i, V.photos.length - 1)]); else closeEditor();
    status("Photo deleted.");
  });
  function setTool(t) {
    ED.tool = t; if (t !== "select") { pruneEmptyText(); ED.sel = -1; }
    Array.prototype.forEach.call($("sd-ed").querySelectorAll("[data-tool]"), function (b) { b.setAttribute("aria-pressed", b.dataset.tool === t ? "true" : "false"); });
    $("sd-ed-stage").dataset.tool = t;
    $("sd-ed-hint").textContent = { select: "Tap a markup to change or move it. Drag empty space to pan; pinch or scroll to zoom.", arrow: "Drag from the tail to the point.", box: "Drag across what you want to box.", ell: "Drag across what you want to ring.", pen: "Draw with your finger, pen or mouse. Use two fingers to zoom.", text: "Tap where the label goes, then type it." }[t];
    if (ED.item) edRender();
  }
  function setStyleUi() {
    var m = ED.sel >= 0 ? ED.item.marks[ED.sel] : null, c = m ? m.c : ED.c, s = m ? m.s : ED.s;
    Array.prototype.forEach.call($("sd-ed").querySelectorAll(".sd-sw"), function (b) { b.setAttribute("aria-pressed", b.dataset.c === c ? "true" : "false"); });
    Array.prototype.forEach.call($("sd-ed").querySelectorAll(".sd-size"), function (b) { b.setAttribute("aria-pressed", +b.dataset.s === s ? "true" : "false"); });
    var isText = m && m.t === "text"; $("sd-ed-textwrap").hidden = !isText; if (isText && document.activeElement !== $("sd-ed-text")) $("sd-ed-text").value = m.text;
    $("sd-ed-rm").disabled = !m; $("sd-ed-undo").disabled = !ED.undo.length;
  }
  $("sd-ed").querySelector(".sd-tools").addEventListener("click", function (e) {
    var b = e.target.closest("[data-tool]"); if (b) { setTool(b.dataset.tool); setStyleUi(); return; }
    if (e.target.closest("#sd-ed-undo")) undo(); else if (e.target.closest("#sd-ed-rm")) removeSel();
  });
  $("sd-ed").querySelector(".sd-style").addEventListener("click", function (e) {
    var sw = e.target.closest("[data-c]"), sz = e.target.closest("[data-s]"), m = ED.sel >= 0 ? ED.item.marks[ED.sel] : null;
    if (sw) { if (m) { snap(); m.c = sw.dataset.c; touch(); } else ED.c = sw.dataset.c; }
    if (sz) { if (m) { snap(); m.s = +sz.dataset.s; touch(); } else ED.s = +sz.dataset.s; }
    if (sw || sz) { edRender(); setStyleUi(); }
  });
  $("sd-ed-text").addEventListener("focus", function () { if (ED.sel >= 0) snap(); });
  $("sd-ed-text").addEventListener("input", function () { var m = ED.item.marks[ED.sel]; if (m && m.t === "text") { m.text = this.value; touch(); edRender(); } });
  function snap() { ED.undo.push(JSON.stringify(ED.item.marks)); if (ED.undo.length > 60) ED.undo.shift(); $("sd-ed-undo").disabled = false; }
  function undo() { if (!ED.undo.length) return; ED.item.marks = JSON.parse(ED.undo.pop()); ED.sel = -1; touch(); edRender(); setStyleUi(); }
  function removeSel() { if (ED.sel < 0) return; snap(); ED.item.marks.splice(ED.sel, 1); ED.sel = -1; touch(); edRender(); setStyleUi(); }
  $("sd-ed-stage").addEventListener("click", function (e) { var z = e.target.closest("[data-z]"); if (!z) return; if (z.dataset.z === "fit") ED.vp.fit(ED.item.w, ED.item.h); else ED.vp.zoomBy(z.dataset.z === "in" ? 1.5 : 1 / 1.5); });
  function edRender() {
    if (!ED.item) return; var it = ED.item, sc = ED.vp ? ED.vp.scale() : 1;
    $("sd-ed-marks").innerHTML = marksSvg(it.marks, it.w, it.h, 22 / sc);
    var sg = $("sd-ed-sel"); sg.innerHTML = "";
    if (ED.sel >= 0) { var el = $("sd-ed-marks").querySelector('[data-m="' + ED.sel + '"]'); if (el) { try { var bb = el.getBBox(), pd = 6 / sc;
      sg.innerHTML = '<rect x="' + (bb.x - pd) + '" y="' + (bb.y - pd) + '" width="' + (bb.width + pd * 2) + '" height="' + (bb.height + pd * 2) + '" fill="none" stroke="#0d6b78" stroke-width="' + 2 / sc + '" stroke-dasharray="' + 6 / sc + " " + 4 / sc + '"/>'; } catch (x) {} } }
  }
  function moveMark(m, dx, dy) { if (m.t === "pen") { for (var k = 0; k < m.p.length; k += 2) { m.p[k] += dx; m.p[k + 1] += dy; } } else { m.x1 += dx; m.y1 += dy; if (m.x2 != null) { m.x2 += dx; m.y2 += dy; } } }
  var edGestures = {
    down: function (e, p) {
      var it = ED.item, t = ED.tool, c = ED.c, s = ED.s; if (!it) return;
      if (t === "select") {
        var g = e.target.closest && e.target.closest("[data-m]");
        if (g) { var i = +g.getAttribute("data-m"); if (ED.sel !== i) pruneEmptyText(); ED.sel = i; ED.draw = { k: "move", last: p, snapped: false }; edRender(); setStyleUi(); }
        else { ED.draw = { k: "pan", lx: e.clientX, ly: e.clientY }; }
        return;
      }
      if (t === "text") { ED.draw = { k: "text" }; return; }
      var m = t === "pen" ? { t: "pen", c: c, s: s, p: [p.x, p.y] } : { t: t, c: c, s: s, x1: p.x, y1: p.y, x2: p.x, y2: p.y };
      ED.draw = { k: "new", m: m, before: JSON.stringify(it.marks) }; it.marks.push(m); edRender();
    },
    move: function (e, p, s) {
      var d = ED.draw; if (!d) return; var it = ED.item;
      if (d.k === "pan") { if (s.moved) { ED.vp.panBy(e.clientX - d.lx, e.clientY - d.ly); d.lx = e.clientX; d.ly = e.clientY; } return; }
      if (d.k === "move") { if (!s.moved) return; if (!d.snapped) { snap(); d.snapped = true; } moveMark(it.marks[ED.sel], p.x - d.last.x, p.y - d.last.y); d.last = p; edRender(); return; }
      if (d.k === "new") {
        var m = d.m;
        if (m.t === "pen") { var L = m.p.length, tol = 2 / ED.vp.scale(); if (Math.hypot(p.x - m.p[L - 2], p.y - m.p[L - 1]) > tol) m.p.push(p.x, p.y); }
        else { m.x2 = p.x; m.y2 = p.y; }
        edRender();
      }
    },
    up: function (e, p, tap) {
      var d = ED.draw; ED.draw = null; if (!d) return; var it = ED.item;
      if (d.k === "move" && d.snapped) touch();
      if (d.k === "pan" && tap && ED.sel >= 0) { pruneEmptyText(); ED.sel = -1; edRender(); setStyleUi(); }
      if (d.k === "text" && tap) {
        snap(); it.marks.push({ t: "text", c: ED.c, s: ED.s, x1: p.x, y1: p.y, text: "Label" }); ED.sel = it.marks.length - 1;
        ED.tool = "select"; setTool("select"); ED.sel = it.marks.length - 1; touch(); edRender(); setStyleUi();
        var ta = $("sd-ed-text"); ta.value = "Label"; ta.focus(); ta.select();
      }
      if (d.k === "new") {
        var m = d.m, small = 4 / ED.vp.scale();
        var tiny = m.t === "pen" ? m.p.length < 4 : Math.hypot(m.x2 - m.x1, m.y2 - m.y1) < small * 2;
        if (tiny) { it.marks.pop(); }
        else { ED.undo.push(d.before); $("sd-ed-undo").disabled = false; if (m.t === "pen") m.p = m.p.map(r1); touch(); }
        edRender();
      }
    },
    cancel: function () { var d = ED.draw; ED.draw = null; if (d && d.k === "new") { ED.item.marks.pop(); edRender(); } }
  };

  /* ---------- report ---------- */
  function kvRows() {
    var t = V.time ? V.time + (V.timeOut ? " to " + V.timeOut : "") : V.timeOut ? "Left " + V.timeOut : "";
    return [["Site", V.site], ["Reference", V.ref], ["Date", fmtDate(V.date)], ["Time on site", t], ["Recorded by", V.by],
      ["Weather", [V.weather, V.temp !== "" && V.temp != null ? V.temp + " °C" : ""].filter(Boolean).join(", ")], ["Present", V.present]].filter(function (r) { return String(r[1] || "").trim(); });
  }
  function reportHtml() {
    var h = '<header class="sd-r-head"><p class="sd-r-eyebrow">Site visit record</p><h2>' + esc(V.site || "Untitled visit") + "</h2>" +
      '<table class="sd-r-kv">' + kvRows().map(function (r) { return "<tr><th>" + r[0] + "</th><td>" + esc(r[1]) + "</td></tr>"; }).join("") + "</table></header>";
    [["Purpose of the visit", V.purpose], ["Observations and general notes", V.notes], ["Actions arising", V.actions]].forEach(function (s) { if (String(s[1] || "").trim()) h += '<section class="sd-r-sec"><h3>' + s[0] + '</h3><p class="sd-r-pre">' + esc(s[1]) + "</p></section>"; });
    V.plans.forEach(function (p) {
      h += '<figure class="sd-r-fig sd-r-plan">' + staticSvg(p, true) + "<figcaption><strong>Plan: " + esc(p.name) + "</strong> Numbered markers show where each photo was taken from; the arrow and shaded wedge show the direction of view.</figcaption></figure>";
    });
    if (V.photos.length) h += '<h3 class="sd-r-h">Photos</h3>';
    V.photos.forEach(function (ph, i) {
      h += '<figure class="sd-r-fig">' + staticSvg(ph, false) + "<figcaption><strong>Photo " + (i + 1) + "</strong> <span>" + hhmm(ph.at) + (ph.pin ? " · " + esc(pinText(ph)) : "") + "</span>" + (ph.note ? '<p class="sd-r-pre">' + esc(ph.note) + "</p>" : "") + "</figcaption></figure>";
    });
    if (!V.plans.length && !V.photos.length && !kvRows().length) h += '<p class="small">Nothing in this visit yet.</p>';
    return h;
  }
  var REPORT_CSS = ".sd-r-eyebrow{font:600 10px Arial,sans-serif;letter-spacing:.08em;text-transform:uppercase;color:#b84a32;margin:0}.sd-r-head h2{margin:2px 0 10px;font:700 22px Arial,sans-serif}" +
    ".sd-r-kv{border-collapse:collapse;width:100%;margin-bottom:12px}.sd-r-kv th{text-align:left;width:28%;font-weight:600;color:#5a6677;padding:4px 8px 4px 0;vertical-align:top;border-top:1px solid #d5dbd9}.sd-r-kv td{padding:4px 0;white-space:pre-wrap;border-top:1px solid #d5dbd9}" +
    ".sd-r-sec h3,.sd-r-h{font:700 14px Arial,sans-serif;margin:14px 0 4px}.sd-r-pre{white-space:pre-wrap;margin:0}" +
    ".sd-r-fig{margin:14px 0;break-inside:avoid;page-break-inside:avoid}.sd-r-fig svg{display:block;width:100%;height:auto;max-height:150mm;border:1px solid #d5dbd9;background:#fff}.sd-r-fig figcaption{margin-top:6px}.sd-r-fig figcaption span{color:#5a6677}";
  function renderReport() {
    var pane = $("sd-pane-report");
    pane.innerHTML = '<div class="sd-row sd-acts"><button type="button" class="btn" id="sd-pdf">Download PDF report</button><button type="button" class="btn ghost" id="sd-print">Print</button><span class="small" id="sd-rep-status" aria-live="polite"></span></div>' +
      '<p class="small">An A4 report: the visit details and notes, each plan with the photo positions, then every photo with its markup and commentary. It\'s made in your browser.</p>' +
      '<div class="sd-paper"><style>' + REPORT_CSS.replace(/\.sd-r/g, "#view-site-diary .sd-r") + "</style>" + reportHtml() + "</div>";
  }
  $("sd-pane-report").addEventListener("click", function (e) {
    if (e.target.closest("#sd-print")) { if (window.CPExport) window.CPExport.printHtml("Site visit " + (V.site || "") + " " + (V.date || ""), reportHtml(), "body{padding:0 4mm}" + REPORT_CSS + "@page{size:A4;margin:14mm}"); return; }
    if (e.target.closest("#sd-pdf")) makePdf();
  });
  function pdfSafe(s) {
    return String(s == null ? "" : s).replace(/[‘’‚′]/g, "'").replace(/[“”„″]/g, '"').replace(/[–—−]/g, "-").replace(/…/g, "...").replace(/ /g, " ").replace(/[^\n\x20-\x7E -ÿ]/g, "?");
  }
  function makePdf() {
    var st = $("sd-rep-status"), btn = $("sd-pdf"); st.textContent = "Making the PDF…"; btn.disabled = true;
    loadScript(JSPDF).then(function () {
      var Pdf = window.jspdf.jsPDF, doc = new Pdf({ unit: "mm", format: "a4", compress: true }), M = 14, PW = 210, PH = 297, y = M, CW = PW - 2 * M;
      var title = pdfSafe((V.site || "Untitled visit") + (V.date ? " · " + fmtDate(V.date) : "")).replace(/·/g, "-");
      function newPage(orient) { doc.addPage("a4", orient || "portrait"); y = M + 4; }
      function pw() { return doc.internal.pageSize.getWidth(); }
      function ph() { return doc.internal.pageSize.getHeight(); }
      function need(h) { if (y + h > ph() - M - 6) newPage(); }
      function para(text, size, style, color) {
        doc.setFont("helvetica", style || "normal"); doc.setFontSize(size || 10); doc.setTextColor.apply(doc, color || [21, 35, 58]);
        var lines = doc.splitTextToSize(pdfSafe(text), CW), lh = (size || 10) * 0.42;
        lines.forEach(function (l) { need(lh); doc.text(l, M, y + lh * 0.8); y += lh; });
      }
      // header
      doc.setFont("helvetica", "bold"); doc.setFontSize(9); doc.setTextColor(184, 74, 50); doc.text("SITE VISIT RECORD", M, y + 3); y += 6;
      para(V.site || "Untitled visit", 18, "bold"); y += 3;
      kvRows().filter(function (r) { return r[0] !== "Site"; }).forEach(function (r) {
        doc.setFontSize(10); var lines = doc.splitTextToSize(pdfSafe(r[1]), CW - 40), h = lines.length * 4.4 + 2.2; need(h);
        doc.setDrawColor(213, 219, 217); doc.line(M, y, M + CW, y);
        doc.setFont("helvetica", "bold"); doc.setTextColor(90, 102, 119); doc.text(r[0], M, y + 4.6);
        doc.setFont("helvetica", "normal"); doc.setTextColor(21, 35, 58); doc.text(lines, M + 40, y + 4.6); y += h;
      });
      doc.line(M, y, M + CW, y); y += 4;
      [["Purpose of the visit", V.purpose], ["Observations and general notes", V.notes], ["Actions arising", V.actions]].forEach(function (s) {
        if (!String(s[1] || "").trim()) return; need(14); para(s[0], 12, "bold"); y += 1; para(s[1], 10); y += 4;
      });
      var jobs = Promise.resolve();
      V.plans.forEach(function (p) {
        jobs = jobs.then(function () { st.textContent = "Adding plan " + p.name + "…"; return compose(p, true, 3000); }).then(function (c) {
          var land = p.w > p.h * 1.15; newPage(land ? "landscape" : "portrait");
          var W = pw() - 2 * M, H = ph() - 2 * M - 34, k = Math.min(W / p.w, H / p.h), w = p.w * k, h = p.h * k;
          CW = W; para("Plan: " + p.name, 12, "bold"); y += 1;
          doc.addImage(c.toDataURL("image/jpeg", 0.9), "JPEG", M + (W - w) / 2, y, w, h); doc.setDrawColor(213, 219, 217); doc.rect(M + (W - w) / 2, y, w, h); y += h + 3;
          para("Numbered markers show where each photo was taken from. The arrow and shaded wedge show the direction of view.", 9, "normal", [90, 102, 119]);
          CW = PW - 2 * M;
        });
      });
      V.photos.forEach(function (ph0, i) {
        jobs = jobs.then(function () { st.textContent = "Adding photo " + (i + 1) + " of " + V.photos.length + "…"; return compose(ph0, false, 1800); }).then(function (c) {
          if (i === 0) { newPage(); doc.setFont("helvetica", "bold"); doc.setFontSize(14); doc.setTextColor(21, 35, 58); doc.text("Photos", M, y + 4); y += 9; }
          doc.setFontSize(10); var note = ph0.note ? doc.splitTextToSize(pdfSafe(ph0.note), CW) : [];
          var maxH = 95, k = Math.min(CW / ph0.w, maxH / ph0.h), w = ph0.w * k, h = ph0.h * k, block = h + 9 + Math.min(note.length, 8) * 4.4;
          need(block);
          doc.addImage(c.toDataURL("image/jpeg", 0.85), "JPEG", M, y, w, h); y += h + 5;
          doc.setFont("helvetica", "bold"); doc.setFontSize(11); doc.setTextColor(21, 35, 58); doc.text("Photo " + (i + 1), M, y);
          doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(90, 102, 119); doc.text(pdfSafe(hhmm(ph0.at) + (ph0.pin ? "  |  " + pinText(ph0).replace("°", " deg") : "  |  Not pinned on a plan")), M + 19, y); y += 1.5;
          if (note.length) para(ph0.note, 10);
          y += 7;
        });
      });
      return jobs.then(function () {
        var n = doc.getNumberOfPages();
        for (var p = 1; p <= n; p++) {
          doc.setPage(p); var W = pw(), H = ph();
          doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(120, 130, 145);
          doc.text(title, M, H - 7); doc.text("Page " + p + " of " + n, W - M, H - 7, { align: "right" });
        }
        download("site-visit-" + slug(V.site) + "-" + (V.date || today()) + ".pdf", doc.output("blob"));
        st.textContent = "PDF saved (" + n + " page" + (n > 1 ? "s" : "") + ").";
      });
    }).catch(function (e) {
      st.textContent = e && e.message === "load" ? "Couldn't load the PDF maker. Check your connection, or use Print and choose Save as PDF." : "Couldn't make the PDF: " + ((e && e.message) || "unknown error") + ".";
    }).then(function () { btn.disabled = false; });
  }

  /* ---------- visit files ---------- */
  function blobToDataUrl(b) { return new Promise(function (ok, fail) { var r = new FileReader(); r.onload = function () { ok(r.result); }; r.onerror = fail; r.readAsDataURL(b); }); }
  $("sd-save").addEventListener("click", function () {
    if (!V) return; saveNow(); status("Packing the visit file…");
    var items = V.photos.concat(V.plans), files = {};
    Promise.all(items.map(function (x) { return getBlob(x.b).then(function (b) { return b ? blobToDataUrl(b) : null; }).then(function (d) { if (d) files[x.b] = d; }); })).then(function () {
      var out = JSON.stringify({ format: "cp-site-visit", version: 1, saved: new Date().toISOString(), visit: V, files: files });
      download("site-visit-" + slug(V.site) + "-" + (V.date || today()) + ".json", new Blob([out], { type: "application/json" }));
      status("Visit file saved (" + (out.length / 1048576).toFixed(1) + " MB). Open it here or on another device with Open visit file.");
    }).catch(function () { status("Couldn't pack the visit file."); });
  });
  function openFile() { $("sd-in-visit").click(); }
  $("sd-open").addEventListener("click", openFile); $("sd-open2").addEventListener("click", openFile);
  $("sd-in-visit").addEventListener("change", function () {
    var f = this.files[0]; this.value = ""; if (!f) return; status("Opening the visit file…");
    f.text().then(function (t) {
      var d = JSON.parse(t); if (!d || d.format !== "cp-site-visit" || !d.visit) throw new Error("format");
      var v = d.visit, map = {};
      v.id = uid(); v.photos = (v.photos || []).filter(function (p) { return p && p.b; }); v.plans = (v.plans || []).filter(function (p) { return p && p.b; });
      FIELDS.forEach(function (fl) { if (v[fl[0]] == null) v[fl[0]] = ""; });
      var all = v.photos.concat(v.plans);
      return Promise.all(all.map(function (x) {
        var du = d.files && d.files[x.b]; if (!du) return null;
        return fetch(du).then(function (r) { return r.blob(); }).then(putBlob).then(function (id) { map[x.b] = id; });
      })).then(function () {
        v.photos = v.photos.filter(function (p) { return map[p.b]; }); v.plans = v.plans.filter(function (p) { return map[p.b]; });
        all.forEach(function (x) { if (map[x.b]) x.b = map[x.b]; x.marks = x.marks || []; });
        v.photos.forEach(function (p) { if (p.pin && !v.plans.some(function (q) { return q.id === p.pin.plan; })) p.pin = null; });
        V = null; LIST.push({ id: v.id, site: v.site, date: v.date, updated: v.updated || Date.now() });
        return openVisit(v).then(saveNow).then(function () { status("Opened \"" + visitLabel(v) + "\" with " + v.photos.length + " photo" + (v.photos.length === 1 ? "" : "s") + ". It's now saved on this device too."); askPersist(); });
      });
    }).catch(function (e) { status(e && e.message === "format" ? "That isn't a site diary visit file." : "Couldn't open that file. Is it a visit file saved from this tool?"); });
  });

  /* ---------- start ---------- */
  dbAll("visits").then(function (vs) {
    LIST = (vs || []).map(function (v) { return { id: v.id, site: v.site, date: v.date, updated: v.updated || 0 }; });
    var last = lsGet("cp-site-diary-last"), pick = (vs || []).filter(function (v) { return v.id === last; })[0] || (vs || []).sort(function (a, b) { return (b.updated || 0) - (a.updated || 0); })[0];
    if (MEM) status("This browser won't let the site store files, so this visit lasts until you close the page. Save a visit file to keep it.");
    return openVisit(pick || null);
  }).catch(function () { openVisit(null); });

  window.CPSiteDiary = { visit: function () { return V; }, open: openEditor, tab: showTab };
})();
