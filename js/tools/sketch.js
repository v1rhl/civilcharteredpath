/* Sketch pad: freehand sketches and beam/frame diagrams on an A4 sketch sheet with a title block.
   One sheet, two tool sets (freehand and structured). Everything is kept in this browser (localStorage);
   images added as an underlay are never uploaded anywhere. Drawn as SVG so it exports cleanly to SVG and PNG. */
(function () {
  "use strict";
  window.CP_TOOLS = (window.CP_TOOLS || []).concat([{ id: "sketch", label: "Sketch pad", blurb: "Freehand sketches and beam and frame diagrams on an A4 sheet with a title block, typical details to start from, and PNG, JPEG, SVG or PDF export." }]);
  var view = document.getElementById("view-sketch"); if (!view) return;
  var NS = "http://www.w3.org/2000/svg", GRID = 20, FONT = "Arial, Helvetica, sans-serif", KEY = "cp-sketch";
  /* A4 at 4 units per mm, so a grid square of 20 units is 5 mm on the printed sheet. */
  /* Paper at 4 units per mm, landscape [width, height]; portrait swaps them. */
  var PAPER = { A4: [1188, 840], A3: [1680, 1188] }, PT = { A4: [841.89, 595.28], A3: [1190.55, 841.89] };
  var TBS = { small: 0.75, medium: 0.9, large: 1.1 };
  var NOTE_SC = "Indicative only. Check all dimensions on site. Not for construction.";
  var NOTE = "NOT TO SCALE. This sketch is indicative only and must not be used for construction.";
  var COLORS = [["#15233a", "Black"], ["#b84a32", "Red"], ["#0d6b78", "Teal"], ["#3f6fd1", "Blue"], ["#2e7d32", "Green"], ["#b07a06", "Amber"], ["#7a7f87", "Grey"]];
  var WIDTHS = [[1, "Hairline"], [2, "Fine"], [4, "Medium"], [7, "Heavy"], [14, "Marker"]];
  var LINES = [["solid", "Solid"], ["dashed", "Dashed"], ["dashdot", "Dash-dot"], ["dotted", "Dotted"], ["centre", "Centreline"]];
  var PATS = [["diag", "Diagonal"], ["cross", "Cross-hatch"], ["concrete", "Concrete"], ["earth", "Soil / earth"], ["steel", "Steel"], ["granular", "Granular stone"], ["sand", "Sand"], ["solid", "Solid tint"]];
  var SEG = { member: 1, line: 1, udl: 1, dim: 1, arrow: 1, rect: 1, circle: 1, section: 1, brk: 1, cloud: 1, slope: 1 }, PTS = { stroke: 1, hatch: 1, poly: 1 };
  /* Tools placed by dragging from one point to another */
  var DRAG2 = { member: 1, line: 1, udl: 1, dim: 1, arrow: 1, rect: 1, circle: 1, section: 1, brk: 1, cloud: 1, slope: 1 };
  var IC = {
    select: '<path d="M6 3l12 9-5.5 1L10 19z"/>',
    pen: '<path d="M4 20l4-1L19 8l-3-3L5 16z"/><path d="M14 7l3 3"/>',
    line: '<path d="M4 20L20 4"/><circle cx="4" cy="20" r="1.5"/><circle cx="20" cy="4" r="1.5"/>',
    eraser: '<path d="M9 20h11"/><path d="M4 15l9-9 6 6-8 8H9z"/><path d="M8 11l6 6"/>',
    text: '<path d="M5 7V5h14v2M12 5v14M9 19h6"/>',
    leader: '<rect x="11" y="3" width="10" height="7" rx="1"/><path d="M11 10L4 19"/><path d="M4 19l1-4M4 19l4-1"/>',
    hatch: '<rect x="4" y="4" width="16" height="16"/><path d="M4 12l8-8M4 20L20 4M12 20l8-8"/>',
    member: '<path d="M3 12h18" stroke-width="3"/>',
    pin: '<path d="M12 6l-6 10h12z"/><path d="M4 19h16"/>',
    xform: '<path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5"/><path d="M12 8v8M8 12h8"/>',
    inset: '<circle cx="10" cy="10" r="6"/><path d="M14.5 14.5L21 21M10 7.5v5M7.5 10h5"/>',
    image: '<rect x="3" y="5" width="18" height="14" rx="1"/><circle cx="9" cy="10" r="1.8"/><path d="M3 17l5-5 4 4 3-3 6 6"/>',
    roller: '<path d="M12 5l-6 9h12z"/><circle cx="9" cy="17" r="1.6"/><circle cx="15" cy="17" r="1.6"/><path d="M4 20h16"/>',
    fixed: '<path d="M6 4v16" stroke-width="2.4"/><path d="M6 7L3 10M6 12l-3 3M6 17l-3 3"/><path d="M6 12h14"/>',
    pload: '<path d="M12 3v15"/><path d="M7 13l5 5 5-5"/>',
    udl: '<path d="M3 5h18M5 5v12M12 5v12M19 5v12"/><path d="M3 15l2 2 2-2M10 15l2 2 2-2M17 15l2 2 2-2"/>',
    moment: '<path d="M17 16A6.5 6.5 0 1 1 18 9"/><path d="M18 4v5h-5"/>',
    dim: '<path d="M3 12h18M3 7v10M21 7v10"/><path d="M6 10l-3 2 3 2M18 10l3 2-3 2"/>',
    arrow: '<path d="M4 20L19 5"/><path d="M11 5h8v8"/>',
    rect: '<rect x="4" y="6" width="16" height="12" rx="1"/>',
    circle: '<circle cx="12" cy="12" r="8"/>',
    poly: '<path d="M5 18l2-11 8-3 5 9-6 7z"/>',
    section: '<path d="M4 12h16" stroke-dasharray="4 2 1 2"/><path d="M4 12v-6M20 12v-6M4 6l2 2M4 6L2 8M20 6l2 2M20 6l-2 2"/>',
    north: '<path d="M12 3l5 16-5-4-5 4z"/><path d="M12 3v12"/>',
    brk: '<path d="M2 12h7l1.5-5 3 10 1.5-5h7"/>',
    cloud: '<path d="M6 8a2 2 0 0 1 4 0a2 2 0 0 1 4 0a2 2 0 0 1 4 0a2 2 0 0 1 0 4a2 2 0 0 1 0 4a2 2 0 0 1-4 0a2 2 0 0 1-4 0a2 2 0 0 1-4 0a2 2 0 0 1 0-4a2 2 0 0 1 0-4z"/>',
    slope: '<path d="M3 6h18"/><path d="M4 6v12M8 6v5M12 6v12M16 6v5M20 6v12"/>',
    wl: '<path d="M7 5h10l-5 7z"/><path d="M5 15h14M8 18h8M10.5 21h3"/>'
  };
  var TOOLS = {
    free: [["select", "Select"], ["xform", "Move/resize"], ["pen", "Pen"], ["eraser", "Eraser"], ["hatch", "Hatch"], ["text", "Text"], ["leader", "Leader"], ["dim", "Dimension"]],
    struct: [["select", "Select"], ["xform", "Move/resize"], ["member", "Member"], ["pin", "Pin"], ["roller", "Roller"], ["fixed", "Fixed"], ["pload", "Point load"], ["udl", "UDL"], ["moment", "Moment"], ["dim", "Dimension"], ["hatch", "Hatch"], ["text", "Text"], ["leader", "Leader"], ["eraser", "Eraser"]],
    shapes: [["line", "Line"], ["arrow", "Arrow"], ["rect", "Rectangle"], ["circle", "Circle"], ["poly", "Polygon"], ["section", "Section"], ["north", "North"], ["brk", "Break line"], ["cloud", "Rev cloud"], ["slope", "Slope"], ["wl", "Water level"], ["image", "Image"], ["inset", "Detail window"]]
  };
  var HINTS = {
    select: "Click to select, drag a box to select several, Shift or Ctrl click to add or remove. Drag to move, Delete removes, Ctrl+C / Ctrl+V copy and paste, Ctrl+D duplicates, Ctrl+A selects all, Esc clears.",
    pen: "Draw freehand. Ctrl+Z undoes the last stroke.",
    line: "Drag to draw a straight line. Hold Shift to keep it horizontal, vertical or at 45°.",
    eraser: "Drag over anything to rub it out. Locked items are left alone.",
    hatch: "Click inside any area enclosed by lines or strokes to hatch it (small gaps are bridged, shapes inside are left clear). Or drag for a rectangle. Switch to \"Draw a shape\" to click points round your own outline.",
    text: "Click where the text should go, then type in the box below the sheet.",
    leader: "Press on the point you're labelling and drag to where the note box should sit. Start on a member or symbol and the arrow stays attached to it.",
    member: "Drag to draw a beam or column. Ends snap to the grid and to the ends of other members.",
    pin: "Click to place a pinned support. Use Rotate to turn it.",
    roller: "Click to place a roller support. Use Rotate to turn it.",
    fixed: "Click to place a fixed support. Rotate it to make a wall for a cantilever.",
    pload: "Click where the load acts. Set its value and direction below.",
    udl: "Drag along the member to place a distributed load. Set its value below.",
    moment: "Click to place an applied moment. Reverse it below.",
    dim: "Drag between two points to dimension them. The length is measured for you; type your own text below to override it.",
    arrow: "Drag from the tail to the point. Arrowhead size is in the panel below once it's drawn.",
    rect: "Drag from one corner to the opposite corner.",
    circle: "Press on the centre and drag out to the radius.",
    poly: "Click each corner, then click the first point again (or press Enter, or double-click) to close the shape.",
    section: "Drag along the line of the cut. Arrows show the viewing direction; Flip side turns them round and you can set the letter.",
    north: "Click to place a north arrow. Drag its round handle to turn it to any angle, or type the angle below.",
    brk: "Drag where the break line should run; the zigzag goes in the middle.",
    cloud: "Drag a box round the change to draw a revision cloud.",
    slope: "Drag along the top of the slope. The ticks point down the slope; Flip side if they're the wrong way.",
    xform: "Click or box-select items, then drag them to move, or drag a corner handle to resize them all together (Shift to stretch). Works on typical details and groups too.",
    inset: "Drag a box round the part of the drawing or map to enlarge. A detail window at a larger scale is added: move it with Select, resize it from its square handle, and drag its round handle to change what it shows.",
    image: "Add a picture or screenshot to the drawing. You can also paste a screenshot straight in with Ctrl+V.",
    wl: "Click on the water line to place a water level marker, then type the level below."
  };

  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
  function r1(v) { return Math.round(v * 10) / 10; }
  function dist(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function today() { return new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }); }
  function pad(n) { return (n < 10 ? "0" : "") + n; }

  /* ---------- Storage ---------- */
  function blankSheet(n, from) {
    return { orient: from ? from.orient : "land", tb: { project: from ? from.tb.project : "", ref: "SK-" + pad(n), title: "", date: today() },
      items: [], under: [], seq: 1, grid: true, snap: true, scale: 0.2, showUnder: true, lockUnder: false, showDraw: true, lockDraw: false };
  }
  function loadStore() {
    try { var s = JSON.parse(localStorage.getItem(KEY)); if (s && s.sheets && s.sheets.length) return s; } catch (e) {}
    return { v: 1, cur: 0, mode: "free", sheets: [blankSheet(1)] };
  }
  var S = loadStore();
  if (!S.sheets[S.cur]) S.cur = 0;
  function doc() { return S.sheets[S.cur]; }
  var saveWarned = false;
  function persist() {
    try { localStorage.setItem(KEY, JSON.stringify(S)); saveWarned = false; }
    catch (e) { if (!saveWarned) status("This browser's storage is full, so the latest changes aren't saved. Remove an image or a sheet, or export your work."); saveWarned = true; }
  }

  /* ---------- State ---------- */
  var mode = S.mode === "struct" ? "struct" : "free";
  var tool = { free: "pen", struct: "member" };
  var style = { c: COLORS[0][0], w: 2, ls: "solid", pat: "diag", fs: 14 };
  var sel = null; /* {k:"item"|"img", id} */
  var drag = null, pend = null, before = null, k = 1;
  var hist = {}; function H() { var id = S.cur; return hist[id] || (hist[id] = { u: [], r: [] }); }

  function byId(id) { var a = doc().items; for (var i = 0; i < a.length; i++) if (a[i].id === id) return a[i]; return null; }
  function imgById(id) { var a = doc().under; for (var i = 0; i < a.length; i++) if (a[i].id === id) return a[i]; return null; }
  function newId(p) { var d = doc(); return (p || "i") + (d.seq++); }

  /* ---------- Undo ---------- */
  function snap() { var d = doc(); return JSON.stringify({ items: d.items, under: d.under, tb: d.tb, orient: d.orient }); }
  function begin() { if (before === null) before = snap(); }
  function commit() {
    syncLeaders(); reHatch();
    var now = snap(), h = H();
    if (before !== null && now !== before) { h.u.push(before); if (h.u.length > 60) h.u.shift(); h.r = []; }
    before = null; persist(); renderAll();
  }
  function restore(str) { var o = JSON.parse(str), d = doc(); d.items = o.items; d.under = o.under; d.tb = o.tb; d.orient = o.orient; }
  function undo() { var h = H(); if (!h.u.length) return; h.r.push(snap()); restore(h.u.pop()); sel = null; pend = null; persist(); renderAll(); renderProps(); }
  function redo() { var h = H(); if (!h.r.length) return; h.u.push(snap()); restore(h.r.pop()); sel = null; persist(); renderAll(); renderProps(); }

  /* ---------- Geometry ---------- */
  function size() { var p = PAPER[doc().paper] || PAPER.A4; return doc().orient === "port" ? [p[1], p[0]] : [p[0], p[1]]; }
  /* Sheet geometry: the frame, the title block (sized small/medium/large or off) and the revision box above it. */
  function geo() {
    var d = doc(), s = size(), W = s[0], Hh = s[1], m = d.frame === false ? 20 : 40, inner = { x: m, y: m, w: W - 2 * m, h: Hh - 2 * m };
    var k2 = TBS[d.tbs || "medium"], G = { W: W, H: Hh, inner: inner, m: m };
    if (!k2) { G.tb = { x: W - m, y: Hh - m, w: 0, h: 0, off: true }; return G; }
    var tw0 = 480 * k2, rh = 30 * k2, nh = 32 * k2, th = 3 * rh + nh, rr = 18 * k2, nrev = d.showRev ? 1 + Math.max(1, (d.revs || []).length) : 0, rvh = nrev * rr;
    G.k = k2; G.rh = rh; G.nh = nh; G.rr = rr;
    G.tbBlock = { x: W - m - tw0, y: Hh - m - th, w: tw0, h: th };
    G.rev = nrev ? { x: W - m - tw0, y: Hh - m - th - rvh, w: tw0, h: rvh } : null;
    G.tb = { x: W - m - tw0, y: Hh - m - th - rvh, w: tw0, h: th + rvh };
    return G;
  }
  function segPts(it) { return [{ x: it.x1, y: it.y1 }, { x: it.x2, y: it.y2 }]; }
  function norm(it) { var dx = it.x2 - it.x1, dy = it.y2 - it.y1, L = Math.hypot(dx, dy) || 1; return { dx: dx / L, dy: dy / L, nx: dy / L, ny: -dx / L, L: L }; }
  /* ---------- Snapping ----------
     Grid plus object snaps. Object snaps look only at items near the pointer, and the
     snapped point is marked with a small glyph so you can see what it caught. Hold Alt to draw free. */
  var SNAPS = [["grid", "Grid"], ["end", "Endpoint"], ["mid", "Midpoint"], ["cen", "Centre"], ["int", "Intersection"], ["perp", "Perpendicular"], ["tan", "Tangent"], ["par", "Parallel"], ["near", "On a line (coincident)"]];
  if (!S.snaps) { S.snaps = {}; SNAPS.forEach(function (x) { S.snaps[x[0]] = x[0] !== "near"; }); }
  var noSnap = false, snapHit = null;
  function snapGeom(skip) { /* segments, circles and key points of every snappable item */
    var segs = [], circs = [], pts = [];
    doc().items.forEach(function (it) {
      if (it.id === skip || it.type === "text" || it.type === "leader" || (it.type === "hatch" && it.seed)) return;
      var add = function (a, b) { segs.push({ a: { x: a[0], y: a[1] }, b: { x: b[0], y: b[1] }, id: it.id }); };
      if (it.type === "circle") { circs.push({ c: { x: it.x1, y: it.y1 }, r: Math.hypot(it.x2 - it.x1, it.y2 - it.y1), id: it.id }); return; }
      if (it.type === "rect") { var o = outlineOf(it); for (var i = 0; i < 4; i++) add(o[i], o[i + 1]); pts.push({ x: (it.x1 + it.x2) / 2, y: (it.y1 + it.y2) / 2, k: "cen" }); return; }
      if (it.type === "poly" || (it.type === "hatch" && !it.seed)) { var q = it.pts.concat([it.pts[0]]); for (var j = 0; j < q.length - 1; j++) add(q[j], q[j + 1]); return; }
      if (it.type === "stroke") { pts.push({ x: it.pts[0][0], y: it.pts[0][1], k: "end" }, { x: it.pts[it.pts.length - 1][0], y: it.pts[it.pts.length - 1][1], k: "end" }); return; }
      if (SEG[it.type]) { if (it.type !== "cloud") add([it.x1, it.y1], [it.x2, it.y2]); return; }
      if (it.x != null) pts.push({ x: it.x, y: it.y, k: "end" });
    });
    return { segs: segs, circs: circs, pts: pts };
  }
  function footOn(s, p, clampIt) { var dx = s.b.x - s.a.x, dy = s.b.y - s.a.y, L2 = dx * dx + dy * dy || 1, t = ((p.x - s.a.x) * dx + (p.y - s.a.y) * dy) / L2; if (clampIt) t = Math.max(0, Math.min(1, t)); return { x: s.a.x + dx * t, y: s.a.y + dy * t, t: t }; }
  function segX(s1, s2) {
    var d1x = s1.b.x - s1.a.x, d1y = s1.b.y - s1.a.y, d2x = s2.b.x - s2.a.x, d2y = s2.b.y - s2.a.y, den = d1x * d2y - d1y * d2x; if (Math.abs(den) < 1e-9) return null;
    var t = ((s2.a.x - s1.a.x) * d2y - (s2.a.y - s1.a.y) * d2x) / den, u = ((s2.a.x - s1.a.x) * d1y - (s2.a.y - s1.a.y) * d1x) / den;
    return t > -1e-6 && t < 1 + 1e-6 && u > -1e-6 && u < 1 + 1e-6 ? [{ x: s1.a.x + d1x * t, y: s1.a.y + d1y * t }] : null;
  }
  function segCirc(s, c) {
    var dx = s.b.x - s.a.x, dy = s.b.y - s.a.y, fx = s.a.x - c.c.x, fy = s.a.y - c.c.y, A = dx * dx + dy * dy, B = 2 * (fx * dx + fy * dy), C = fx * fx + fy * fy - c.r * c.r, D = B * B - 4 * A * C, o = [];
    if (D < 0 || !A) return o; D = Math.sqrt(D);
    [(-B - D) / (2 * A), (-B + D) / (2 * A)].forEach(function (t) { if (t >= 0 && t <= 1) o.push({ x: s.a.x + dx * t, y: s.a.y + dy * t }); }); return o;
  }
  function circCirc(c1, c2) {
    var dx = c2.c.x - c1.c.x, dy = c2.c.y - c1.c.y, d = Math.hypot(dx, dy); if (!d || d > c1.r + c2.r || d < Math.abs(c1.r - c2.r)) return [];
    var a = (c1.r * c1.r - c2.r * c2.r + d * d) / (2 * d), h = Math.sqrt(Math.max(0, c1.r * c1.r - a * a)), mx = c1.c.x + dx * a / d, my = c1.c.y + dy * a / d;
    return [{ x: mx + h * dy / d, y: my - h * dx / d }, { x: mx - h * dy / d, y: my + h * dx / d }];
  }
  function snapPt(p, opts) {
    var d = doc(), on = S.snaps; opts = opts || {}; snapHit = null;
    if (!d.snap || opts.free || noSnap) { showSnap(); return { x: r1(p.x), y: r1(p.y) }; }
    var tol = 12 * Math.max(k, 1), G = snapGeom(opts.skip), from = opts.from || (drag && drag.a) || (pend && pend.pts.length ? { x: pend.pts[pend.pts.length - 1][0], y: pend.pts[pend.pts.length - 1][1] } : null);
    var best = null, bd = tol;
    function cand(q, kind, ref, pri) { var dd = dist(p, q) - (pri || 0); if (dd < bd) { bd = dd; best = { x: q.x, y: q.y, k: kind, ref: ref }; } }
    var nearS = G.segs.filter(function (sg) { return dist(p, footOn(sg, p, true)) < tol * 1.5; }), nearC = G.circs.filter(function (c) { return Math.abs(dist(p, c.c) - c.r) < tol * 1.5 || dist(p, c.c) < tol; });
    /* point snaps win over line snaps, so give them a little priority */
    if (on.end) { G.segs.forEach(function (sg) { cand(sg.a, "end", null, 3); cand(sg.b, "end", null, 3); }); G.pts.forEach(function (q) { if (q.k === "end") cand(q, "end", null, 3); }); G.circs.forEach(function (c) { [[1, 0], [0, 1], [-1, 0], [0, -1]].forEach(function (v) { cand({ x: c.c.x + c.r * v[0], y: c.c.y + c.r * v[1] }, "end", null, 2); }); }); }
    if (on.mid) G.segs.forEach(function (sg) { cand({ x: (sg.a.x + sg.b.x) / 2, y: (sg.a.y + sg.b.y) / 2 }, "mid", null, 3); });
    if (on.cen) { G.circs.forEach(function (c) { cand(c.c, "cen", null, 3); }); G.pts.forEach(function (q) { if (q.k === "cen") cand(q, "cen", null, 3); }); }
    if (on.int) {
      for (var i = 0; i < nearS.length; i++) { for (var j = i + 1; j < nearS.length; j++) (segX(nearS[i], nearS[j]) || []).forEach(function (q) { cand(q, "int", null, 3); }); nearC.forEach(function (c) { segCirc(nearS[i], c).forEach(function (q) { cand(q, "int", null, 3); }); }); }
      for (i = 0; i < nearC.length; i++) for (j = i + 1; j < nearC.length; j++) circCirc(nearC[i], nearC[j]).forEach(function (q) { cand(q, "int", null, 3); });
    }
    if (from && !best) {
      if (on.perp) { nearS.forEach(function (sg) { var f = footOn(sg, from, false); if (f.t > -0.001 && f.t < 1.001 && dist(f, from) > 2) cand(f, "perp", sg, 1); }); nearC.forEach(function (c) { var dd = dist(from, c.c); if (dd > 1) [1, -1].forEach(function (sn) { cand({ x: c.c.x + (from.x - c.c.x) / dd * c.r * sn, y: c.c.y + (from.y - c.c.y) / dd * c.r * sn }, "perp", null, 1); }); }); }
      if (on.tan) nearC.forEach(function (c) { var dx = from.x - c.c.x, dy = from.y - c.c.y, dd = Math.hypot(dx, dy); if (dd <= c.r) return; var a0 = Math.atan2(dy, dx), b = Math.acos(c.r / dd); [a0 + b, a0 - b].forEach(function (a) { cand({ x: c.c.x + c.r * Math.cos(a), y: c.c.y + c.r * Math.sin(a) }, "tan", null, 1); }); });
    }
    if (on.near && !best) { nearS.forEach(function (sg) { cand(footOn(sg, p, true), "near", sg); }); nearC.forEach(function (c) { var dd = dist(p, c.c); if (dd > 1) cand({ x: c.c.x + (p.x - c.c.x) / dd * c.r, y: c.c.y + (p.y - c.c.y) / dd * c.r }, "near"); }); }
    if (from && on.par && !best && dist(p, from) > tol) { /* keep the new line parallel to an existing one */
      var ang = Math.atan2(p.y - from.y, p.x - from.x), L = dist(p, from), pb = null, pd = 2.5 * Math.PI / 180;
      G.segs.forEach(function (sg) { var a2 = Math.atan2(sg.b.y - sg.a.y, sg.b.x - sg.a.x), df = Math.abs(((ang - a2) % Math.PI + 1.5 * Math.PI) % Math.PI - Math.PI / 2); if (df < pd && (a2 * 180 / Math.PI) % 90) { pd = df; pb = sg; } });
      if (pb) { var u = { x: pb.b.x - pb.a.x, y: pb.b.y - pb.a.y }, uL = Math.hypot(u.x, u.y), dot = ((p.x - from.x) * u.x + (p.y - from.y) * u.y) / uL; best = { x: from.x + u.x / uL * dot, y: from.y + u.y / uL * dot, k: "par", ref: pb }; }
    }
    if (!best && on.grid) best = { x: Math.round(p.x / GRID) * GRID, y: Math.round(p.y / GRID) * GRID, k: "grid" };
    if (!best) { showSnap(); return { x: r1(p.x), y: r1(p.y) }; }
    snapHit = best.k === "grid" ? null : best; showSnap();
    return { x: r1(best.x), y: r1(best.y) };
  }
  function showSnap() {
    var g = $("sk-snapg"); if (!g) return; var h = snapHit; if (!h) { g.innerHTML = ""; return; }
    var r = 7 * Math.max(k, 1), x = h.x, y = h.y, a = ' fill="none" stroke="#d9480f" stroke-width="1.6" vector-effect="non-scaling-stroke"', o = "";
    var gl = {
      end: '<rect x="' + r1(x - r) + '" y="' + r1(y - r) + '" width="' + r1(2 * r) + '" height="' + r1(2 * r) + '"' + a + "/>",
      mid: '<path d="M' + r1(x) + " " + r1(y - r) + "L" + r1(x + r) + " " + r1(y + r * 0.8) + "L" + r1(x - r) + " " + r1(y + r * 0.8) + 'Z"' + a + "/>",
      cen: '<circle cx="' + r1(x) + '" cy="' + r1(y) + '" r="' + r1(r) + '"' + a + '/><path d="M' + r1(x - r / 3) + " " + r1(y) + "h" + r1(r / 1.5) + "M" + r1(x) + " " + r1(y - r / 3) + "v" + r1(r / 1.5) + '"' + a + "/>",
      int: '<path d="M' + r1(x - r) + " " + r1(y - r) + "L" + r1(x + r) + " " + r1(y + r) + "M" + r1(x + r) + " " + r1(y - r) + "L" + r1(x - r) + " " + r1(y + r) + '"' + a + "/>",
      perp: '<path d="M' + r1(x - r) + " " + r1(y - r) + "V" + r1(y + r) + "H" + r1(x + r) + "M" + r1(x - r) + " " + r1(y) + "H" + r1(x) + "V" + r1(y + r) + '"' + a + "/>",
      tan: '<circle cx="' + r1(x) + '" cy="' + r1(y + r * 0.2) + '" r="' + r1(r * 0.7) + '"' + a + '/><path d="M' + r1(x - r) + " " + r1(y - r * 0.5) + "H" + r1(x + r) + '"' + a + "/>",
      near: '<path d="M' + r1(x - r) + " " + r1(y - r) + "H" + r1(x + r) + "L" + r1(x - r) + " " + r1(y + r) + "H" + r1(x + r) + 'Z"' + a + "/>",
      par: '<path d="M' + r1(x - r) + " " + r1(y + r * 0.6) + "L" + r1(x - r * 0.2) + " " + r1(y - r * 0.6) + "M" + r1(x + r * 0.2) + " " + r1(y + r * 0.6) + "L" + r1(x + r) + " " + r1(y - r * 0.6) + '"' + a + "/>"
    };
    if (h.ref) o += '<line x1="' + r1(h.ref.a.x) + '" y1="' + r1(h.ref.a.y) + '" x2="' + r1(h.ref.b.x) + '" y2="' + r1(h.ref.b.y) + '" stroke="#d9480f" stroke-width="1" stroke-dasharray="4 3" vector-effect="non-scaling-stroke" opacity="0.7"/>';
    var names = { end: "Endpoint", mid: "Midpoint", cen: "Centre", int: "Intersection", perp: "Perpendicular", tan: "Tangent", near: "On line", par: "Parallel" };
    o += gl[h.k] + '<text x="' + r1(x + r * 1.4) + '" y="' + r1(y - r * 1.2) + '" font-family="' + FONT + '" font-size="' + r1(10 * Math.max(k, 1)) + '" fill="#d9480f">' + names[h.k] + "</text>";
    g.innerHTML = o;
  }
  function snapDelta(v) { return doc().snap && S.snaps.grid && !noSnap ? Math.round(v / GRID) * GRID : r1(v); }
  window.addEventListener("pointermove", function (e) { noSnap = e.altKey; }, true);
  window.addEventListener("pointerdown", function (e) { noSnap = e.altKey; }, true);

  /* ---------- Drawing helpers ---------- */
  var mctx = document.createElement("canvas").getContext("2d");
  function tw(s, sz, bold) { mctx.font = (bold ? "bold " : "") + sz + "px Arial, Helvetica, sans-serif"; return mctx.measureText(s).width; }
  function dash(ls, w) {
    var b = Math.max(w, 1.5);
    var d = { dashed: [5, 3], dashdot: [8, 3, 0.01, 3], dotted: [0.01, 2.4], centre: [14, 3, 3, 3] }[ls];
    return d ? ' stroke-dasharray="' + d.map(function (v) { return r1(v * b); }).join(" ") + '"' : "";
  }
  function ln(x1, y1, x2, y2, c, w, ls) { return '<line x1="' + r1(x1) + '" y1="' + r1(y1) + '" x2="' + r1(x2) + '" y2="' + r1(y2) + '" stroke="' + c + '" stroke-width="' + w + '" stroke-linecap="round"' + dash(ls, w) + "/>"; }
  function head(tx, ty, ux, uy, c, s) { /* arrowhead with its tip at (tx,ty), pointing along (ux,uy) */
    s = s || 12; var bx = tx - ux * s, by = ty - uy * s, px = -uy * s * 0.42, py = ux * s * 0.42;
    return '<path d="M' + r1(tx) + " " + r1(ty) + "L" + r1(bx + px) + " " + r1(by + py) + "L" + r1(bx - px) + " " + r1(by - py) + 'Z" fill="' + c + '"/>';
  }
  function ldrEnd(x1, y1, x2, y2, c, ah, w, def) {
    if (ah === 0) return ln(x1, y1, x2, y2, c, w);
    if (ah === -1) return ln(x1, y1, x2, y2, c, w) + '<circle cx="' + r1(x2) + '" cy="' + r1(y2) + '" r="3.2" fill="' + c + '"/>';
    return arrow(x1, y1, x2, y2, c, w, ah || def || 11);
  }
  function cloudPath(it) {
    var x1 = Math.min(it.x1, it.x2), x2 = Math.max(it.x1, it.x2), y1 = Math.min(it.y1, it.y2), y2 = Math.max(it.y1, it.y2), C = [[x1, y1], [x2, y1], [x2, y2], [x1, y2]], d = "M" + x1 + " " + y1;
    for (var i = 0; i < 4; i++) {
      var a = C[i], b = C[(i + 1) % 4], L = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.max(1, Math.round(L / 22)), r = L / n / 2 + 0.01;
      for (var j = 1; j <= n; j++) d += "A" + r1(r) + " " + r1(r) + " 0 0 1 " + r1(a[0] + (b[0] - a[0]) * j / n) + " " + r1(a[1] + (b[1] - a[1]) * j / n);
    }
    return d;
  }
  function arrow(x1, y1, x2, y2, c, w, s) { var L = Math.hypot(x2 - x1, y2 - y1) || 1, ux = (x2 - x1) / L, uy = (y2 - y1) / L; s = s || 12; return ln(x1, y1, x2 - ux * s * 0.8, y2 - uy * s * 0.8, c, w) + head(x2, y2, ux, uy, c, s); }
  function r3(v) { return Math.round(v * 1000) / 1000; }
  function txt(x, y, s, c, sz, anchor, extra) { return '<text x="' + r1(x) + '" y="' + r1(y) + '" font-family="' + FONT + '" font-size="' + (sz || 14) + '" fill="' + c + '" text-anchor="' + (anchor || "start") + '"' + (extra || "") + ">" + esc(s) + "</text>"; }
  function smooth(pts) {
    if (!pts.length) return "";
    if (pts.length === 1) return "M" + pts[0][0] + " " + pts[0][1] + "l0.01 0";
    var d = "M" + pts[0][0] + " " + pts[0][1];
    for (var i = 1; i < pts.length - 1; i++) { var a = pts[i], b = pts[i + 1]; d += "Q" + a[0] + " " + a[1] + " " + r1((a[0] + b[0]) / 2) + " " + r1((a[1] + b[1]) / 2); }
    var l = pts[pts.length - 1]; return d + "L" + l[0] + " " + l[1];
  }
  function hpath(it) { return poly(it.pts) + (it.holes || []).map(poly).join(""); }
  function opath(pts) { return "M" + pts.map(function (p) { return p[0] + " " + p[1]; }).join("L"); }
  function poly(pts) { return "M" + pts.map(function (p) { return p[0] + " " + p[1]; }).join("L") + "Z"; }
  function patId(pat, c, sc) { return "hp-" + pat + "-" + c.replace(/[^0-9a-z]/gi, "") + (sc && sc !== 1 ? "-s" + String(sc).replace(".", "_") : ""); }
  function patDef(pat, c, sc) { var d0 = patDef0(pat, c); return sc && sc !== 1 ? d0.replace('<pattern id="' + patId(pat, c) + '"', '<pattern id="' + patId(pat, c, sc) + '" patternTransform="scale(' + sc + ')"') : d0; }
  function patDef0(pat, c) {
    var id = patId(pat, c), L = function (d, w) { return '<path d="' + d + '" stroke="' + c + '" stroke-width="' + (w || 1) + '" fill="none" stroke-linecap="round"/>'; }, body, s;
    if (pat === "diag") { s = 14; body = L("M0 14L14 0M-4 4L4 -4M10 18L18 10"); }
    else if (pat === "cross") { s = 14; body = L("M0 14L14 0M-4 4L4 -4M10 18L18 10M0 0L14 14M-4 10L4 18M10 -4L18 4"); }
    else if (pat === "steel") { s = 6; body = L("M0 6L6 0M-2 2L2 -2M4 8L8 4", 0.9); }
    else if (pat === "earth") { s = 40; body = L("M3 17l9-9M8 19l9-9M13 21l9-9M23 37l9-9M28 39l9-9", 1.1) + '<circle cx="30" cy="10" r="1.3" fill="' + c + '"/><circle cx="8" cy="33" r="1.3" fill="' + c + '"/><circle cx="36" cy="20" r="1" fill="' + c + '"/>'; }
    else if (pat === "granular") { /* rounded stones of mixed sizes */
      s = 44; body = [[8, 9, 5, 3.6, 20], [24, 6, 4, 3, -15], [37, 12, 4.5, 3.4, 40], [14, 24, 4, 3.2, 70], [30, 26, 5.5, 3.8, -30], [6, 37, 4.2, 3, 10], [21, 38, 3.6, 2.8, 55], [38, 36, 4, 3.2, -60]].map(function (e) { return '<ellipse cx="' + e[0] + '" cy="' + e[1] + '" rx="' + e[2] + '" ry="' + e[3] + '" transform="rotate(' + e[4] + " " + e[0] + " " + e[1] + ')" fill="none" stroke="' + c + '" stroke-width="0.9"/>'; }).join("");
    } else if (pat === "sand") { /* fine stipple */
      s = 24; body = '<g fill="' + c + '">' + [[2, 3], [9, 1], [16, 5], [21, 2], [5, 10], [13, 9], [19, 12], [1, 16], [8, 17], [15, 15], [22, 19], [4, 22], [11, 21], [18, 22]].map(function (q) { return '<circle cx="' + q[0] + '" cy="' + q[1] + '" r="0.75"/>'; }).join("") + "</g>";
    }
    else if (pat === "concrete") {
      s = 48; body = '<g fill="' + c + '">' + [[6, 8], [30, 5], [42, 20], [18, 26], [8, 41], [34, 38], [24, 14], [44, 44]].map(function (p) { return '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="1.2"/>'; }).join("") + "</g>" +
        L("M12 14l6 -3 1 6zM36 28l7 1 -4 5zM20 38l5 -4 2 6z", 1);
    } else { return '<pattern id="' + id + '" width="10" height="10" patternUnits="userSpaceOnUse"><rect width="10" height="10" fill="' + c + '" fill-opacity="0.22"/></pattern>'; }
    return '<pattern id="' + id + '" width="' + s + '" height="' + s + '" patternUnits="userSpaceOnUse">' + body + "</pattern>";
  }

  /* Where a leader's arrow points: follows the thing it's attached to. */
  function anchorOf(it) {
    var a = it.att, t = a && byId(a.id);
    if (t) {
      if (SEG[t.type]) return { x: t.x1 + (t.x2 - t.x1) * a.t, y: t.y1 + (t.y2 - t.y1) * a.t };
      if (PTS[t.type] && t.pts.length) return { x: t.pts[0][0] + a.dx, y: t.pts[0][1] + a.dy };
      if ("x" in t) return { x: t.x + a.dx, y: t.y + a.dy };
    }
    return { x: it.ax, y: it.ay };
  }
  function makeAttach(t, p) {
    if (!t || t.type === "leader") return null;
    if (SEG[t.type]) { var n = norm(t), tt = ((p.x - t.x1) * n.dx + (p.y - t.y1) * n.dy) / n.L; return { id: t.id, t: Math.max(0, Math.min(1, tt)) }; }
    if (PTS[t.type]) return { id: t.id, dx: p.x - t.pts[0][0], dy: p.y - t.pts[0][1] };
    return { id: t.id, dx: p.x - t.x, dy: p.y - t.y };
  }
  function syncLeaders() { doc().items.forEach(function (it) { if (it.type === "leader") { var a = anchorOf(it); it.ax = r1(a.x); it.ay = r1(a.y); if (it.att && !byId(it.att.id)) it.att = null; } }); }
  function leaderBox(it) {
    var lines = String(it.text || "").split("\n"), sz = it.fs || 14, w = 0;
    lines.forEach(function (l) { w = Math.max(w, tw(l, sz)); });
    var W = Math.max(w, 20) + 18, Hh = lines.length * sz * 1.3 + 12;
    return { x: it.bx - W / 2, y: it.by - Hh / 2, w: W, h: Hh, lines: lines, sz: sz };
  }

  /* ---------- Items ---------- */
  function draw(it) {
    var c = it.c || "#15233a", o = "", i;
    switch (it.type) {
      case "stroke": return '<path d="' + smooth(it.pts) + '" fill="none" stroke="' + c + '" stroke-width="' + it.w + '" stroke-linecap="round" stroke-linejoin="round"' + dash(it.ls, it.w) + "/>";
      case "line": case "member": return ln(it.x1, it.y1, it.x2, it.y2, c, it.w, it.ls);
      case "hatch":
        return '<path d="' + hpath(it) + '" fill-rule="evenodd" fill="url(#' + patId(it.pat, c, it.ps) + ')" stroke="' + (it.outline ? it.oc || c : "none") + '" stroke-width="' + (it.w || 2) + '" stroke-linejoin="round"' + (it.outline ? dash(it.ls, it.w || 2) : "") + "/>";
      case "support":
        o = '<g transform="translate(' + it.x + " " + it.y + ") rotate(" + (it.rot || 0) + ')" stroke="' + c + '" fill="none" stroke-linecap="round" stroke-linejoin="round">';
        var ground = function (y) { var g = '<path d="M-24 ' + y + "H24"; for (i = -18; i <= 24; i += 8) g += "M" + i + " " + y + "l-7 8"; return g + '" stroke-width="1.6"/>'; };
        if (it.kind === "fixed") o += '<path d="M-26 0H26" stroke-width="3.5"/>' + ground(0).replace('M-24 0H24', "M-24 0");
        else if (it.kind === "roller") o += '<path d="M0 0L-14 17H14Z" stroke-width="2" fill="#fff"/><circle cx="-7" cy="22" r="5" stroke-width="1.8" fill="#fff"/><circle cx="7" cy="22" r="5" stroke-width="1.8" fill="#fff"/>' + ground(27) + '<circle r="3.2" fill="#fff" stroke-width="1.8"/>';
        else o += '<path d="M0 0L-15 25H15Z" stroke-width="2" fill="#fff"/>' + ground(25) + '<circle r="3.2" fill="#fff" stroke-width="1.8"/>';
        return o + "</g>";
      case "pload":
        var a = (it.ang == null ? 90 : it.ang) * Math.PI / 180, ux = Math.cos(a), uy = Math.sin(a), Lp = 72, tx = it.x - ux * Lp, ty = it.y - uy * Lp;
        o = arrow(tx, ty, it.x, it.y, c, 2.5, 14);
        if (it.label) o += txt(tx - ux * 12, ty - uy * 12 + 5, it.label, c, it.fs || 15, Math.abs(ux) < 0.3 ? "middle" : ux > 0 ? "end" : "start", ' font-weight="bold"');
        return o;
      case "udl":
        var n = norm(it), sd = it.side === -1 ? -1 : 1, nx = n.nx * sd, ny = n.ny * sd, hh = 40, cnt = Math.max(2, Math.round(n.L / 30) + 1);
        o = ln(it.x1 + nx * hh, it.y1 + ny * hh, it.x2 + nx * hh, it.y2 + ny * hh, c, 2);
        for (i = 0; i < cnt; i++) { var t = i / (cnt - 1), px = it.x1 + (it.x2 - it.x1) * t, py = it.y1 + (it.y2 - it.y1) * t; o += arrow(px + nx * hh, py + ny * hh, px, py, c, 1.5, 9); }
        if (it.label) { var mx = (it.x1 + it.x2) / 2 + nx * (hh + 16), my = (it.y1 + it.y2) / 2 + ny * (hh + 16) + 5; o += txt(mx, my, it.label, c, it.fs || 15, "middle", ' font-weight="bold"'); }
        return o;
      case "moment":
        var R = 24, cw = it.dir !== "ccw", t0 = (cw ? 135 : 45) * Math.PI / 180, t1 = (cw ? 405 : -225) * Math.PI / 180;
        var sx = it.x + R * Math.cos(t0), sy = it.y + R * Math.sin(t0), ex = it.x + R * Math.cos(t1), ey = it.y + R * Math.sin(t1);
        var tux = cw ? -Math.sin(t1) : Math.sin(t1), tuy = cw ? Math.cos(t1) : -Math.cos(t1);
        o = '<path d="M' + r1(sx) + " " + r1(sy) + "A" + R + " " + R + " 0 1 " + (cw ? 1 : 0) + " " + r1(ex - tux * 8) + " " + r1(ey - tuy * 8) + '" fill="none" stroke="' + c + '" stroke-width="2.5"/>' + head(ex + tux * 3, ey + tuy * 3, tux, tuy, c, 13) + '<circle cx="' + it.x + '" cy="' + it.y + '" r="2.5" fill="' + c + '"/>';
        if (it.label) o += txt(it.x + R + 10, it.y - R + 2, it.label, c, it.fs || 15, "start", ' font-weight="bold"');
        return o;
      case "dim":
        var dn = norm(it), off = it.o == null ? 30 : it.o, sg = off >= 0 ? 1 : -1, ax1 = it.x1 + dn.nx * off, ay1 = it.y1 + dn.ny * off, ax2 = it.x2 + dn.nx * off, ay2 = it.y2 + dn.ny * off;
        o = ln(it.x1 + dn.nx * sg * 5, it.y1 + dn.ny * sg * 5, ax1 + dn.nx * sg * 8, ay1 + dn.ny * sg * 8, c, 1) + ln(it.x2 + dn.nx * sg * 5, it.y2 + dn.ny * sg * 5, ax2 + dn.nx * sg * 8, ay2 + dn.ny * sg * 8, c, 1);
        o += ln(ax1, ay1, ax2, ay2, c, 1.2) + head(ax1, ay1, -dn.dx, -dn.dy, c, 11) + head(ax2, ay2, dn.dx, dn.dy, c, 11);
        var lab = it.label || dimAuto(it), ang = Math.atan2(dn.dy, dn.dx) * 180 / Math.PI; if (ang > 90.5 || ang < -89.5) ang += 180;
        var ar = ang * Math.PI / 180, upx = Math.sin(ar), upy = -Math.cos(ar), side = (dn.nx * sg * upx + dn.ny * sg * upy) > 0;
        var gap = side ? 7 : 19, lx = (ax1 + ax2) / 2 + dn.nx * sg * gap, ly = (ay1 + ay2) / 2 + dn.ny * sg * gap;
        var dfs = it.fs || 14, msk = it.mask ? '<rect x="' + r1(lx - tw(lab, dfs) / 2 - 3) + '" y="' + r1(ly - dfs * 0.85) + '" width="' + r1(tw(lab, dfs) + 6) + '" height="' + r1(dfs * 1.1) + '" fill="#fff" transform="rotate(' + r1(ang) + " " + r1(lx) + " " + r1(ly) + ')"/>' : "";
        return o + msk + txt(lx, ly, lab, c, dfs, "middle", ' transform="rotate(' + r1(ang) + " " + r1(lx) + " " + r1(ly) + ')"');
      case "inset": return insetFrame(it);
      case "image": return '<image href="' + it.src + '" x="' + it.x + '" y="' + it.y + '" width="' + it.w + '" height="' + it.h + '" preserveAspectRatio="none"/>' + (it.border ? '<rect x="' + it.x + '" y="' + it.y + '" width="' + it.w + '" height="' + it.h + '" fill="none" stroke="' + c + '" stroke-width="1.5"/>' : "");
      case "text":
        var sz = it.size || 18, ls = String(it.text || "").split("\n"), mw = 0;
        if (it.mask) ls.forEach(function (l) { mw = Math.max(mw, tw(l, sz, it.bold)); });
        return (it.mask ? '<rect x="' + r1(it.x - 4) + '" y="' + r1(it.y - 2) + '" width="' + r1(mw + 8) + '" height="' + r1(ls.length * sz * 1.25 + 4) + '" fill="#fff"/>' : "") + '<text font-family="' + FONT + '" font-size="' + sz + '" fill="' + c + '"' + (it.bold ? ' font-weight="bold"' : "") + ">" + ls.map(function (l, j) { return '<tspan x="' + it.x + '" y="' + r1(it.y + sz * 0.85 + j * sz * 1.25) + '">' + (esc(l) || " ") + "</tspan>"; }).join("") + "</text>";
      case "arrow": return arrow(it.x1, it.y1, it.x2, it.y2, c, it.w, it.ah || Math.max(11, it.w * 4)).replace("<line ", "<line" + dash(it.ls, it.w) + " ");
      case "rect": return '<rect x="' + Math.min(it.x1, it.x2) + '" y="' + Math.min(it.y1, it.y2) + '" width="' + r1(Math.abs(it.x2 - it.x1)) + '" height="' + r1(Math.abs(it.y2 - it.y1)) + '" fill="' + (it.fill ? "#fff" : "none") + '" stroke="' + c + '" stroke-width="' + it.w + '" stroke-linejoin="round"' + dash(it.ls, it.w) + "/>";
      case "circle": return '<circle cx="' + it.x1 + '" cy="' + it.y1 + '" r="' + r1(Math.hypot(it.x2 - it.x1, it.y2 - it.y1)) + '" fill="none" stroke="' + c + '" stroke-width="' + it.w + '"' + dash(it.ls, it.w) + "/>";
      case "poly": return '<path d="' + (it.open ? opath(it.pts) : poly(it.pts)) + '" fill="none" stroke="' + c + '" stroke-width="' + it.w + '" stroke-linejoin="round"' + dash(it.ls, it.w) + "/>";
      case "cloud": return '<path d="' + cloudPath(it) + '" fill="none" stroke="' + c + '" stroke-width="' + (it.w || 2) + '" stroke-linejoin="round"/>';
      case "brk":
        var bn = norm(it), mx2 = (it.x1 + it.x2) / 2, my2 = (it.y1 + it.y2) / 2, zz = [[it.x1 - bn.dx * 8, it.y1 - bn.dy * 8], [mx2 - bn.dx * 9, my2 - bn.dy * 9], [mx2 - bn.dx * 4 + bn.nx * 16, my2 - bn.dy * 4 + bn.ny * 16], [mx2 + bn.dx * 4 - bn.nx * 16, my2 + bn.dy * 4 - bn.ny * 16], [mx2 + bn.dx * 9, my2 + bn.dy * 9], [it.x2 + bn.dx * 8, it.y2 + bn.dy * 8]];
        return '<path d="M' + zz.map(function (q) { return r1(q[0]) + " " + r1(q[1]); }).join("L") + '" fill="none" stroke="' + c + '" stroke-width="' + (it.w || 1.5) + '" stroke-linejoin="round"/>';
      case "slope":
        var sn = norm(it), sd2 = it.side === -1 ? -1 : 1, sc2 = it.s || 1, step = 12 * sc2, cnt2 = Math.floor(sn.L / step), sl = ln(it.x1, it.y1, it.x2, it.y2, c, 1.8);
        for (i = 0; i <= cnt2; i++) { var tx2 = it.x1 + sn.dx * step * i, ty2 = it.y1 + sn.dy * step * i, tl = (i % 2 ? 14 : 36) * sc2; sl += ln(tx2, ty2, tx2 + sn.nx * sd2 * tl, ty2 + sn.ny * sd2 * tl, c, 1.1); }
        return sl;
      case "section":
        var cn = norm(it), cs = it.side === -1 ? -1 : 1, ar = 28, lab2 = it.label || "A", fz = it.fs || 20;
        o = ln(it.x1, it.y1, it.x2, it.y2, c, 1.2, "centre") + ln(it.x1, it.y1, it.x1 + cn.dx * 26, it.y1 + cn.dy * 26, c, 4) + ln(it.x2, it.y2, it.x2 - cn.dx * 26, it.y2 - cn.dy * 26, c, 4);
        [[it.x1, it.y1], [it.x2, it.y2]].forEach(function (q) {
          o += arrow(q[0], q[1], q[0] + cn.nx * cs * ar, q[1] + cn.ny * cs * ar, c, 2, 12);
          o += txt(q[0] + cn.nx * cs * (ar + 14) , q[1] + cn.ny * cs * (ar + 14) + fz * 0.35, lab2, c, fz, "middle", ' font-weight="bold"');
        });
        return o;
      case "north":
        var ns = it.s || 1;
        return '<g transform="translate(' + it.x + " " + it.y + ") rotate(" + (it.rot || 0) + ") scale(" + ns + ')"><circle r="24" fill="none" stroke="' + c + '" stroke-width="1.4"/><path d="M0 -30L11 14L0 5L-11 14Z" fill="#fff" stroke="' + c + '" stroke-width="1.6" stroke-linejoin="round"/><path d="M0 -30L0 5L-11 14Z" fill="' + c + '"/>' + txt(0, -36, "N", c, 16, "middle", ' font-weight="bold"') + "</g>";
      case "wl":
        var ws = it.s || 1;
        o = '<g transform="translate(' + it.x + " " + it.y + ") scale(" + ws + ')" stroke="' + c + '" fill="none" stroke-linecap="round"><path d="M-9 -15H9L0 0Z" stroke-width="1.6" stroke-linejoin="round"/><path d="M-12 5H12M-7 10H7M-3 15H3" stroke-width="1.6"/></g>';
        if (it.label) o += txt(it.x + 15 * ws, it.y - 4 * ws, it.label, c, it.fs || 14, "start");
        return o;
      case "leader":
        var b = leaderBox(it), A = anchorOf(it), cx = it.bx, cy = it.by, ddx = A.x - cx, ddy = A.y - cy, f = Math.min(Math.abs(ddx) > 0.01 ? (b.w / 2) / Math.abs(ddx) : 1e9, Math.abs(ddy) > 0.01 ? (b.h / 2) / Math.abs(ddy) : 1e9);
        if (it.nobox) { if (it.mask) o += '<rect x="' + r1(b.x + 5) + '" y="' + r1(b.y + 4) + '" width="' + r1(b.w - 8) + '" height="' + r1(b.h - 6) + '" fill="#fff"/>'; var ex = A.x < b.x ? b.x - 3 : A.x > b.x + b.w ? b.x + b.w + 3 : null; if (ex !== null) o += ldrEnd(ex, cy, A.x, A.y, c, it.ah, 1.2, 10); b.lines.forEach(function (l, j) { o += txt(b.x + 9, b.y + 6 + b.sz * 1.3 * j + b.sz, l, c, b.sz); }); return o; }
        if (f < 1) o += ldrEnd(cx + ddx * f, cy + ddy * f, A.x, A.y, c, it.ah, 1.5);
        o += '<rect x="' + r1(b.x) + '" y="' + r1(b.y) + '" width="' + r1(b.w) + '" height="' + r1(b.h) + '" rx="3" fill="#fff" stroke="' + c + '" stroke-width="1.5"/>';
        b.lines.forEach(function (l, j) { o += txt(b.x + 9, b.y + 6 + b.sz * 1.3 * j + b.sz, l, c, b.sz); });
        return o;
    }
    return "";
  }
  /* Drawing scale: with 1:N set, one sheet unit (0.25 mm on paper) is 0.25·N mm on the ground. */
  /* Extra map layers. Natural England publishes its open data as ArcGIS feature services; BGS publishes the
     1:50k geology as a WMS; OS Open Rivers is only a download from OS, so the live option is a 2017 copy
     hosted by the Catchment Based Approach (CaBA), and you can load your own GeoJSON instead. */
  var NE = "https://services.arcgis.com/JJzESW51TqeY9uat/ArcGIS/rest/services/";
  var MAPL = [
    { id: "bgsb", name: "BGS bedrock", kind: "wms", url: "https://map.bgs.ac.uk/arcgis/services/BGS_Detailed_Geology/MapServer/WMSServer", layer: "BGS.50k.Bedrock", rest: "https://map.bgs.ac.uk/arcgis/rest/services/BGS_Detailed_Geology/MapServer/4", src: "BGS Geology 50k WMS", attr: "Geology: contains British Geological Survey materials © UKRI" },
    { id: "bgss", name: "BGS superficial", kind: "wms", url: "https://map.bgs.ac.uk/arcgis/services/BGS_Detailed_Geology/MapServer/WMSServer", layer: "BGS.50k.Superficial.deposits", rest: "https://map.bgs.ac.uk/arcgis/rest/services/BGS_Detailed_Geology/MapServer/3", src: "BGS Geology 50k WMS", attr: "Geology: contains British Geological Survey materials © UKRI" },
    { id: "sssi", name: "SSSI", kind: "fs", url: NE + "SSSI_England/FeatureServer/0", src: "Natural England, Sites of Special Scientific Interest", stroke: "#b84a32", fill: "#b84a32", fo: 0.12, dash: "6 3", attr: "Contains Natural England data © Natural England" },
    { id: "awi", name: "Ancient woodland", kind: "fs", url: NE + "Ancient_Woodland_England/FeatureServer/0", src: "Natural England, Ancient Woodland Inventory", stroke: "#2e7d32", fill: "#2e7d32", fo: 0.15, attr: "Contains Natural England data © Natural England" },
    { id: "phi", name: "Priority habitats", kind: "fs", url: NE + "Priority_Habitats_Inventory_England/FeatureServer/0", src: "Natural England, Priority Habitats Inventory", stroke: "#7a9a2b", fill: "#9bbf3b", fo: 0.12, attr: "Contains Natural England data © Natural England" },
    { id: "rivers", name: "OS Open Rivers (2017 copy)", kind: "fs", url: "https://services3.arcgis.com/Bb8lfThdhugyc4G3/ArcGIS/rest/services/OSOpenRiversCaBA2017/FeatureServer/0", src: "OS Open Rivers 2017, hosted by the Catchment Based Approach (CaBA). OS publishes the current version only as a download.", stroke: "#3f6fd1", line: true, attr: "Contains OS data © Crown copyright and database right" }
  ];
  var SCALES = [1, 2, 5, 10, 20, 25, 50, 100, 200, 250, 500, 1000, 1250, 2000, 2500, 5000, 10000];
  function toM(u) { var N = doc().dscale; return N ? u / 4 * N / 1000 : u / GRID * (doc().scale || 0.2); }
  function fromM(m) { var N = doc().dscale; return N ? m * 1000 / N * 4 : m / (doc().scale || 0.2) * GRID; }
  function fmtM(m) { var a = Math.abs(m); return a >= 1 || !doc().dscale ? (Math.round(m * 100) / 100) + " m" : Math.round(m * 1000) + " mm"; }
  function measured() { return !!doc().dscale || mode === "struct"; }
  function loopsOf(it) { if (it.type === "circle") return null; if (it.type === "rect" || it.type === "cloud") { var o = outlineOf({ type: "rect", x1: it.x1, y1: it.y1, x2: it.x2, y2: it.y2 }); return [o.slice(0, 4)]; } return [it.pts].concat(it.holes || []); }
  function shoelace(L) { var a = 0; for (var i = 0; i < L.length; i++) { var p = L[i], q = L[(i + 1) % L.length]; a += p[0] * q[1] - q[0] * p[1]; } return Math.abs(a / 2); }
  function areaOf(it) { if (it.type === "circle") { var R = Math.hypot(it.x2 - it.x1, it.y2 - it.y1); return Math.PI * R * R; } var ls = loopsOf(it); return Math.max(0, shoelace(ls[0]) - ls.slice(1).reduce(function (s2, L) { return s2 + shoelace(L); }, 0)); }
  function perimOf(it) { if (it.type === "circle") return 2 * Math.PI * Math.hypot(it.x2 - it.x1, it.y2 - it.y1); return loopsOf(it).reduce(function (s2, L) { for (var i = 0; i < L.length; i++) { var p = L[i], q = L[(i + 1) % L.length]; s2 += Math.hypot(q[0] - p[0], q[1] - p[1]); } return s2; }, 0); }
  function centroidOf(it) { if (it.type === "circle") return { x: it.x1, y: it.y1 }; var L = loopsOf(it)[0], x = 0, y = 0; L.forEach(function (q) { x += q[0]; y += q[1]; }); return { x: x / L.length, y: y / L.length }; }
  function fmtArea(u2) { var m1 = toM(1), a = u2 * m1 * m1; return a >= 10000 ? (Math.round(a / 100) / 100) + " ha (" + Math.round(a).toLocaleString("en-GB") + " m²)" : a >= 100 ? Math.round(a).toLocaleString("en-GB") + " m²" : (Math.round(a * 100) / 100) + " m²"; }
  function dimAuto(it) { var m = toM(Math.hypot(it.x2 - it.x1, it.y2 - it.y1)); return it.unit === "mm" ? Math.round(m * 1000) + "" : it.unit === "m" ? (Math.round(m * 1000) / 1000) + " m" : fmtM(m); }
  function hit(it) {
    var w = Math.max(16 * k, 10), T = 'stroke="transparent" fill="none" pointer-events="stroke" stroke-linecap="round" stroke-width="';
    switch (it.type) {
      case "stroke": return '<path d="' + smooth(it.pts) + '" ' + T + Math.max(w, it.w + 8) + '"/>';
      case "rect": case "cloud": var rx1 = Math.min(it.x1, it.x2), ry1 = Math.min(it.y1, it.y2); return '<rect x="' + rx1 + '" y="' + ry1 + '" width="' + r1(Math.abs(it.x2 - it.x1)) + '" height="' + r1(Math.abs(it.y2 - it.y1)) + '" ' + T + Math.max(w, (it.w || 2) + 8) + '"/>';
      case "circle": return '<circle cx="' + it.x1 + '" cy="' + it.y1 + '" r="' + r1(Math.hypot(it.x2 - it.x1, it.y2 - it.y1)) + '" ' + T + Math.max(w, it.w + 8) + '"/>';
      case "poly": return '<path d="' + (it.open ? opath(it.pts) : poly(it.pts)) + '" ' + T + Math.max(w, it.w + 8) + '"/>';
      case "slope": var sn = norm(it), sd = it.side === -1 ? -1 : 1, hl = 36 * (it.s || 1); return '<path d="M' + it.x1 + " " + it.y1 + "L" + it.x2 + " " + it.y2 + "L" + r1(it.x2 + sn.nx * sd * hl) + " " + r1(it.y2 + sn.ny * sd * hl) + "L" + r1(it.x1 + sn.nx * sd * hl) + " " + r1(it.y1 + sn.ny * sd * hl) + 'Z" fill="transparent" pointer-events="all"/>';
      case "arrow": case "section": case "brk":
      case "line": case "member": return '<line x1="' + it.x1 + '" y1="' + it.y1 + '" x2="' + it.x2 + '" y2="' + it.y2 + '" ' + T + Math.max(w, it.w + 8) + '"/>';
      case "udl": var n = norm(it), sd = it.side === -1 ? -1 : 1; return '<path d="M' + r1(it.x1 + n.nx * sd * 8) + " " + r1(it.y1 + n.ny * sd * 8) + "L" + r1(it.x2 + n.nx * sd * 8) + " " + r1(it.y2 + n.ny * sd * 8) + "L" + r1(it.x2 + n.nx * sd * 42) + " " + r1(it.y2 + n.ny * sd * 42) + "L" + r1(it.x1 + n.nx * sd * 42) + " " + r1(it.y1 + n.ny * sd * 42) + 'Z" fill="transparent" pointer-events="all"/>';
      case "dim": var dn = norm(it), off = it.o == null ? 30 : it.o; return '<line x1="' + r1(it.x1 + dn.nx * off) + '" y1="' + r1(it.y1 + dn.ny * off) + '" x2="' + r1(it.x2 + dn.nx * off) + '" y2="' + r1(it.y2 + dn.ny * off) + '" ' + T + w + '"/>';
      case "hatch": return '<path d="' + hpath(it) + '" fill-rule="evenodd" fill="transparent" pointer-events="all"/>';
      case "leader": var A = anchorOf(it); return '<line x1="' + it.bx + '" y1="' + it.by + '" x2="' + A.x + '" y2="' + A.y + '" ' + T + w + '"/>';
      case "text": return "";
      case "inset": return '<rect x="' + it.x + '" y="' + it.y + '" width="' + it.w + '" height="' + it.h + '" fill="transparent" pointer-events="all"/>';
      case "pload": var a = (it.ang == null ? 90 : it.ang) * Math.PI / 180; return '<line x1="' + it.x + '" y1="' + it.y + '" x2="' + r1(it.x - Math.cos(a) * 72) + '" y2="' + r1(it.y - Math.sin(a) * 72) + '" ' + T + Math.max(w, 18) + '"/>';
      default: return '<circle cx="' + it.x + '" cy="' + it.y + '" r="' + Math.max(26, w) + '" fill="transparent" pointer-events="all"/>';
    }
  }
  /* Detail windows: a framed view of the drawing and map at a larger scale. The enlarged copy is drawn
     outside the item's own group, so selecting and moving the window works on its frame alone. */
  function insetScale(it) { var N = doc().dscale; return N ? "1:" + Math.round(N / (it.k || 2)) : "×" + (it.k || 2); }
  function insetFrame(it) {
    var c = it.c || "#15233a";
    return '<rect x="' + it.x + '" y="' + it.y + '" width="' + it.w + '" height="' + it.h + '" fill="none" stroke="' + c + '" stroke-width="2"/>' +
      txt(it.x, it.y + it.h + 20, "DETAIL " + (it.label || "1") + "  (" + insetScale(it) + ")", c, 14, "start", ' font-weight="bold"');
  }
  function insetBody(it) {
    var d = doc(), k2 = it.k || 2, cx = it.x + it.w / 2, cy = it.y + it.h / 2, cid = "ic-" + it.id, inner = "", c = it.c || "#15233a";
    d.items.forEach(function (o) { if (o.type !== "inset") inner += draw(o); });
    var sw = it.w / k2, sh = it.h / k2, o2 = "";
    if (!it.nosrc) o2 += '<rect x="' + r1(it.sx - sw / 2) + '" y="' + r1(it.sy - sh / 2) + '" width="' + r1(sw) + '" height="' + r1(sh) + '" fill="none" stroke="' + c + '" stroke-width="1.2" stroke-dasharray="8 5"/>' + txt(it.sx - sw / 2, it.sy - sh / 2 - 6, it.label || "1", c, 13, "start", ' font-weight="bold"');
    return o2 + '<clipPath id="' + cid + '"><rect x="' + it.x + '" y="' + it.y + '" width="' + it.w + '" height="' + it.h + '"/></clipPath><rect x="' + it.x + '" y="' + it.y + '" width="' + it.w + '" height="' + it.h + '" fill="#fff"/>' +
      '<g clip-path="url(#' + cid + ')"><g transform="translate(' + r1(cx) + " " + r1(cy) + ") scale(" + r3(k2) + ") translate(" + r1(-it.sx) + " " + r1(-it.sy) + ')">' + (it.map !== false && d.map && d.map.show !== false ? '<use href="#sk-mapg"/>' : "") + inner + "</g></g>";
  }
  function makeInset(a, b) {
    var d = doc(), I = geo().inner, bw = Math.abs(b.x - a.x), bh = Math.abs(b.y - a.y);
    if (bw < 12 || bh < 12) { status("Drag a box round the part you want to enlarge."); return; }
    var k2 = 2; if (d.dscale) { var tg = SCALES.filter(function (n) { return n <= d.dscale / 2; }).pop(); k2 = tg ? d.dscale / tg : 2; }
    var w = bw * k2, h = bh * k2, f = Math.min(1, I.w * 0.45 / w, I.h * 0.45 / h); w = r1(w * f); h = r1(h * f);
    var scx = r1((a.x + b.x) / 2), scy = r1((a.y + b.y) / 2), best = null, bd = -1;
    [[I.x + 24, I.y + 24], [I.x + I.w - w - 24, I.y + 24], [I.x + 24, I.y + I.h - h - 60], [I.x + I.w - w - 24, I.y + I.h - h - 60]].forEach(function (q) { var dd = Math.hypot(q[0] + w / 2 - scx, q[1] + h / 2 - scy); if (dd > bd) { bd = dd; best = q; } });
    var n = d.items.filter(function (x) { return x.type === "inset"; }).length + 1;
    var it = addItem(base("inset", { x: r1(best[0]), y: r1(best[1]), w: w, h: h, sx: scx, sy: scy, k: k2, label: String(n), c: "#15233a" }));
    selectAfterCreate(it);
    status("Detail " + n + " added at " + insetScale(it) + (f < 1 ? ", trimmed to fit the sheet" : "") + ". Move it with Select; change its scale above.");
  }
  function shifted(o, dx, dy) {
    var n = clone(o);
    var sh = function (p) { return [r1(p[0] + dx), r1(p[1] + dy)]; };
    if (n.pts) n.pts = n.pts.map(sh);
    if (n.holes) n.holes = n.holes.map(function (h) { return h.map(sh); });
    if (n.seed) n.seed = { x: n.seed.x + dx, y: n.seed.y + dy };
    if ("x1" in n) { n.x1 += dx; n.y1 += dy; n.x2 += dx; n.y2 += dy; }
    if (n.type === "leader") { n.bx += dx; n.by += dy; if (!n.att) { n.ax += dx; n.ay += dy; } }
    else if ("x" in n) { n.x += dx; n.y += dy; }
    return n;
  }
  /* Scale an item about a point. Text, symbols and arrowheads grow with the geometric mean of the factors. */
  function scaleItem(o, ax, ay, fx, fy) {
    var n = clone(o), m = Math.sqrt(fx * fy), P = function (q) { return [r1(ax + (q[0] - ax) * fx), r1(ay + (q[1] - ay) * fy)]; };
    if (n.pts) n.pts = n.pts.map(P); if (n.holes) n.holes = n.holes.map(function (h) { return h.map(P); });
    if (n.seed) { var sd = P([n.seed.x, n.seed.y]); n.seed = { x: sd[0], y: sd[1] }; }
    if ("x1" in n) { var a = P([n.x1, n.y1]), b = P([n.x2, n.y2]); n.x1 = a[0]; n.y1 = a[1]; n.x2 = b[0]; n.y2 = b[1]; }
    if (n.type === "leader") { var bb = P([n.bx, n.by]); n.bx = bb[0]; n.by = bb[1]; if (!n.att) { var aa = P([n.ax, n.ay]); n.ax = aa[0]; n.ay = aa[1]; } }
    else if ("x" in n) { var xy = P([n.x, n.y]); n.x = xy[0]; n.y = xy[1]; }
    if (n.type === "image" || n.type === "inset") { n.w = r1(n.w * fx); n.h = r1(n.h * fy); }
    if (n.type === "text") n.size = Math.max(4, r1((n.size || 18) * m));
    if (n.fs) n.fs = Math.max(4, r1(n.fs * m));
    if (n.s != null || /^(north|wl|slope)$/.test(n.type)) n.s = r1((n.s || 1) * m * 100) / 100;
    if (n.type === "dim" && n.o != null) n.o = r1(n.o * m);
    return n;
  }
  function replaceItem(n) { var a = doc().items; for (var i = 0; i < a.length; i++) if (a[i].id === n.id) { a[i] = n; return; } }
  function removeItem(id) { syncLeaders(); doc().items = doc().items.filter(function (it) { return it.id !== id; }); }
  function locked(it) { return !!(it && (it.lock || doc().lockDraw)); }
  function groupItems(g) { return doc().items.filter(function (it) { return it.g === g; }); }
  function isOn(it) { return sel && ((sel.k === "item" && sel.id === it.id) || (sel.k === "group" && it.g === sel.g) || (sel.k === "multi" && sel.ids.indexOf(it.id) > -1)); }
  /* Selection: one item, a template group, several items (multi), or an underlay image. */
  function selList() {
    if (!sel) return [];
    if (sel.k === "group") return groupItems(sel.g);
    if (sel.k === "multi") return sel.ids.map(byId).filter(Boolean);
    if (sel.k === "item") { var i = byId(sel.id); return i ? [i] : []; }
    return [];
  }
  function isSet() { return sel && (sel.k === "group" || sel.k === "multi"); }
  /* Turns a list of items into the simplest selection; picking any part of a template group takes the whole group. */
  function setSel(list) {
    var ids = [], seen = {};
    list.forEach(function (it) { (it.g ? groupItems(it.g) : [it]).forEach(function (x) { if (!seen[x.id]) { seen[x.id] = 1; ids.push(x.id); } }); });
    if (!ids.length) sel = null;
    else if (ids.length === 1) sel = { k: "item", id: ids[0] };
    else { var g0 = byId(ids[0]).g; sel = g0 && ids.every(function (id) { return byId(id).g === g0; }) && groupItems(g0).length === ids.length ? { k: "group", g: g0 } : { k: "multi", ids: ids }; }
    renderContent(); renderProps();
  }
  var clip = null, pasteN = 0;
  function copySel() { var l = selList(); if (!l.length) return false; syncLeaders(); clip = clone(l); pasteN = 0; status(l.length + (l.length === 1 ? " item" : " items") + " copied. Ctrl+V pastes."); return true; }
  function paste(list, off) {
    if (!list || !list.length) return;
    var map = {}, gmap = {}, out = [];
    begin();
    list.forEach(function (o) { map[o.id] = newId(); if (o.g && !gmap[o.g]) gmap[o.g] = newId("g"); });
    list.forEach(function (o) {
      var n = shifted(o, off, off); n.id = map[o.id]; n.lock = false;
      if (n.g) n.g = gmap[n.g];
      if (n.type === "leader" && n.att) { if (map[n.att.id]) n.att.id = map[n.att.id]; else { n.att = null; n.ax = o.ax + off; n.ay = o.ay + off; } }
      doc().items.push(n); out.push(n);
    });
    commit(); setTool("select"); setSel(out);
  }

  /* ---------- Build the page ---------- */
  function iconSvg(name) { return '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" style="stroke:currentColor">' + IC[name] + "</svg>"; }
  var app = $("sk-app");
  app.innerHTML =
    '<div class="sk-head" id="sk-head"><div class="sk-top">' +
      '<div class="sk-seg" role="group" aria-label="Mode"><button type="button" data-mode="free">Freehand</button><button type="button" data-mode="struct">Beam and frame diagram</button></div>' +

      '<div class="sk-actions"><button type="button" class="sk-btn" id="sk-undo" title="Undo (Ctrl+Z)">Undo</button><button type="button" class="sk-btn" id="sk-redo" title="Redo (Ctrl+Y)">Redo</button>' +
        '<button type="button" class="sk-btn" id="sk-clear">Clear</button>' +
        '<label class="sr-only" for="sk-fmt">Export format</label><select id="sk-fmt"><option value="png">PNG image</option><option value="jpeg">JPEG image</option><option value="svg">SVG drawing</option><option value="pdf">PDF, this sheet</option><option value="pdfall">PDF, all sheets</option><option value="dxf">DXF for CAD, this sheet</option></select><button type="button" class="btn" id="sk-export">Export</button></div>' +
    "</div>" +
    '<div class="sk-toolrow"><div class="sk-tools" id="sk-tools" role="toolbar" aria-label="Drawing tools"></div><div class="sk-tools sk-tools2" id="sk-tools2" role="toolbar" aria-label="Shapes and symbols"></div>' +
      '<label class="sk-check" id="sk-ermode" hidden>Erase <select id="sk-erm"><option value="whole">Whole item</option><option value="part">Part of a line</option></select></label>' +
      '<label class="sr-only" for="sk-tpl">Insert a typical detail</label><select id="sk-tpl" class="sk-tpl"></select></div>' +
    '<div class="sk-style">' +
      '<div class="sk-group"><span class="sk-lab">Colour</span><div class="sk-swatches" id="sk-swatches"></div><label class="sk-pick" title="Pick any colour"><span class="sr-only">Custom colour</span><input type="color" id="sk-color"></label></div>' +
      '<div class="sk-group" data-ctx="line"><span class="sk-lab">Weight</span><div class="sk-chips" id="sk-widths"></div></div>' +
      '<div class="sk-group" data-ctx="line"><label class="sk-lab" for="sk-ls">Line</label><select id="sk-ls">' + LINES.map(function (l) { return '<option value="' + l[0] + '">' + l[1] + "</option>"; }).join("") + "</select></div>" +
      '<div class="sk-group" data-ctx="text"><label class="sk-lab" for="sk-fs">Text</label><select id="sk-fs">' + [8, 10, 12, 14, 16, 18, 24, 32].map(function (v) { return '<option value="' + v + '">' + v + "</option>"; }).join("") + "</select></div>" +
      '<div class="sk-group" data-ctx="hatch"><label class="sk-lab" for="sk-pat">Hatch</label><select id="sk-pat">' + PATS.map(function (l) { return '<option value="' + l[0] + '">' + l[1] + "</option>"; }).join("") + "</select>" +
        '<label class="sr-only" for="sk-hsc">Hatch scale</label><select id="sk-hsc" title="Hatch pattern scale">' + [0.1, 0.25, 0.5, 0.75, 1, 1.5, 2, 3, 4].map(function (v) { return '<option value="' + v + '">×' + v + "</option>"; }).join("") + "</select>" +
        '<label class="sr-only" for="sk-hby">Hatch by</label><select id="sk-hby"><option value="pick">Click inside an area</option><option value="shape">Draw a shape</option></select></div>' +
      '<p class="small" id="sk-ctxhint" hidden>Pick a drawing tool or select something to see its line, text and hatch options.</p>' +
    "</div>" +
    '<div class="sk-style sk-sheetopts">' +
      '<div class="sk-seg sk-seg-sm" role="group" aria-label="Paper size"><button type="button" data-paper="A4">A4</button><button type="button" data-paper="A3">A3</button></div>' +
      '<div class="sk-seg sk-seg-sm" role="group" aria-label="Orientation"><button type="button" data-orient="land">Landscape</button><button type="button" data-orient="port">Portrait</button></div>' +
      '<label class="sk-check"><input type="checkbox" id="sk-showframe"> Frame</label>' +
      '<label class="sk-check">Title block <select id="sk-tbs"><option value="small">Small</option><option value="medium">Medium</option><option value="large">Large</option><option value="off">Off</option></select></label>' +
      '<label class="sk-check"><input type="checkbox" id="sk-rev"> Revisions</label><button type="button" class="sk-btn" id="sk-addrev">Add revision</button><button type="button" class="sk-btn" id="sk-delrev" title="Remove the last revision row">Remove last</button>' +
      '<label class="sk-check">Watermark <select id="sk-wm"><option value="">None</option><option>DRAFT</option><option>NOT FOR CONSTRUCTION</option><option>PRELIMINARY</option><option>FOR INFORMATION</option><option value="*">Your own text…</option></select></label><input type="text" id="sk-wmtext" placeholder="Watermark text" hidden style="width:12em">' +
      '<label class="sk-check"><input type="checkbox" id="sk-grid"> Grid</label>' +
      '<label class="sk-check">Scale <select id="sk-dscale"><option value="0">Not to scale</option>' + SCALES.map(function (n) { return '<option value="' + n + '">1:' + n + "</option>"; }).join("") + '</select></label><span class="small" id="sk-gridinfo"></span><label class="sk-check" id="sk-sbar-l"><input type="checkbox" id="sk-sbar"> Scale bar</label>' +
      '<label class="sk-check" id="sk-gsq">Grid square = <input type="number" id="sk-scale" min="0.01" step="0.05" style="width:5.5em"> m</label>' +
      '<span class="sk-snapwrap"><label class="sk-check"><input type="checkbox" id="sk-snap"> Snap</label><details class="sk-snapmenu"><summary>Snaps</summary><div>' +
        SNAPS.map(function (x) { return '<label class="sk-check"><input type="checkbox" data-snap="' + x[0] + '"> ' + x[1] + "</label>"; }).join("") + '<p class="small">Hold Alt to draw without snapping.</p></div></details></span>' +
      '<span class="sk-layers"><span class="sk-lab">Layers</span>' +
        '<label class="sk-check"><input type="checkbox" id="sk-show-draw"> Drawing</label><label class="sk-check"><input type="checkbox" id="sk-lock-draw"> Lock drawing</label>' +
        '<label class="sk-check"><input type="checkbox" id="sk-show-under"> Underlay</label><label class="sk-check"><input type="checkbox" id="sk-lock-under"> Lock underlay</label>' +
        '<button type="button" class="sk-btn" id="sk-img-btn">Add image to trace</button><input type="file" id="sk-img" accept="image/*" hidden><input type="file" id="sk-img2" accept="image/*" hidden>' +
        '<label class="sk-check" id="sk-mapshow-l" hidden><input type="checkbox" id="sk-mapshow"> Map</label><button type="button" class="sk-btn" id="sk-map-btn" aria-expanded="false">Map and contours</button></span>' +
    "</div>" +
    '<div class="sk-mappanel" id="sk-mappanel" hidden>' +
      '<div class="sk-maprow"><label class="sk-check sk-wide">Location <input type="text" id="sk-maploc" placeholder="Postcode, grid ref (SK 012 813), E, N or lat, long"></label>' +
        '<button type="button" class="btn" id="sk-mapgo">Place or recentre map</button><button type="button" class="sk-btn" id="sk-mapgeo">Use my location</button><button type="button" class="sk-btn danger" id="sk-mapdel">Remove map</button></div>' +
      '<div class="sk-maprow"><button type="button" class="sk-btn" id="sk-mappan" aria-pressed="false" title="Drag on the sheet to move the map under the drawing">Move map</button><button type="button" class="sk-btn" id="sk-mapbox" aria-pressed="false" title="Drag a box on the sheet to limit the map to it">Draw map area</button><button type="button" class="sk-btn" id="sk-mapall">Whole sheet</button></div>' +
      '<div class="sk-maprow"><label class="sk-check"><input type="checkbox" id="sk-maposm" checked> OpenStreetMap</label><label class="sk-check">Fade <input type="range" id="sk-mapop" min="0.15" max="1" step="0.05" value="0.55"></label><label class="sk-check"><input type="checkbox" id="sk-mapgrey" checked> Greyscale</label></div>' +
      '<div class="sk-maprow"><label class="sk-check"><input type="checkbox" id="sk-mapcont" checked> Contours</label><label class="sk-check">every <select id="sk-mapiv">' + [0.1, 0.25, 0.5, 1, 2, 5, 10].map(function (v) { return '<option value="' + v + '"' + (v === 0.5 ? " selected" : "") + ">" + v + " m</option>"; }).join("") + "</select></label>" +
        '<label class="sk-check">Fade <input type="range" id="sk-mapcop" min="0.15" max="1" step="0.05" value="1"></label>' +
        '<button type="button" class="sk-btn" id="sk-mapea" title="Fetch the EA 1 m LiDAR DTM for the map area (England only)">EA LiDAR</button><button type="button" class="sk-btn" id="sk-mapfile-b" title="Load a terrain grid you have downloaded, e.g. from the EA survey portal">Load LiDAR file</button><input type="file" id="sk-mapfile" accept=".asc,.txt,.tif,.tiff" hidden></div>' +
      '<div class="sk-maprow"><span class="sk-lab">From the terrain</span><button type="button" class="sk-btn" id="sk-mapsect" aria-pressed="false" title="Drag a line on the map to draw a ground section from the LiDAR">Draw section</button><button type="button" class="sk-btn" id="sk-mapcatch" aria-pressed="false" title="Click a ditch, stream or low point to outline the land that drains to it">Find catchment</button><button type="button" class="sk-btn" id="sk-mapfall" title="Arrows showing which way the ground falls, with gradients">Fall arrows</button></div>' +
      '<div class="sk-maprow sk-maplayers"><span class="sk-lab">Layers</span>' + MAPL.map(function (L) { return '<label class="sk-check" title="' + esc(L.src) + '"><input type="checkbox" data-ml="' + L.id + '"> ' + L.name + "</label>"; }).join("") +
        '<label class="sk-check sk-wide">ArcGIS layer URL <input type="url" id="sk-mlurl" placeholder="https://…/FeatureServer/0"></label><button type="button" class="sk-btn" id="sk-mladd">Add layer</button><button type="button" class="sk-btn" id="sk-mlgj-b">Load GeoJSON</button><input type="file" id="sk-mlgj" accept=".geojson,.json" hidden></div>' +
      '<div id="sk-mlextra" class="sk-maprow"></div>' +
      '<div class="sk-maprow"><label class="sk-check"><input type="checkbox" id="sk-mapleg"> Legend for the layers</label><label class="sk-check">at <select id="sk-maplegpos"><option value="br">bottom right</option><option value="bl">bottom left</option><option value="tr">top right</option><option value="tl">top left</option></select></label></div>' +
      '<p class="small">Grid north up, centred on the drawing frame (or the map area you draw) at the drawing scale. Map tiles come from OpenStreetMap, terrain from the Environment Agency, postcodes from postcodes.io, geology from BGS and designations from Natural England, so the location is sent to them. <strong>EA LiDAR covers England only.</strong> Files you load stay in this browser. Contours, designations and geology are indicative: check them against the source before relying on them. © OpenStreetMap contributors (ODbL). LiDAR © Environment Agency, OGL. Contains Natural England data © Natural England, OGL. Contains British Geological Survey materials © UKRI, OGL. Contains OS data © Crown copyright and database right, OGL.</p>' +
    "</div>" +
    "</div>" +
    '<div class="sk-tabs" id="sk-tabs" role="tablist" aria-label="Sheets"></div>' +
    '<div class="sk-stage" id="sk-stage">' +
      '<svg id="sk-svg" xmlns="' + NS + '" role="img" aria-label="Sketch sheet"><defs id="sk-defs"></defs><rect id="sk-bg" fill="#fff"/><g id="sk-mapg" pointer-events="none"></g><g id="sk-under"></g><g id="sk-gridg"></g><g id="sk-content"></g><g id="sk-frame"></g><g id="sk-live"></g><g id="sk-ui"></g><g id="sk-snapg" pointer-events="none"></g></svg>' +
      '<input type="text" id="sk-tb-edit" class="sk-tb-edit" spellcheck="true" lang="en-GB" hidden aria-label="Title block field">' +
      '<div class="sk-drop" id="sk-drop" hidden>Drop the image to trace over it</div>' +
    "</div>" +
    '<div class="sk-props" id="sk-props" aria-live="polite"></div>' +
    '<p class="small sk-status" id="sk-status" role="status"></p>';

  var svg = $("sk-svg"), gDefs = $("sk-defs"), gUnder = $("sk-under"), gGrid = $("sk-gridg"), gContent = $("sk-content"), gFrame = $("sk-frame"), gLive = $("sk-live"), gUI = $("sk-ui"), stage = $("sk-stage");
  /* Layout: tools and options in a side bar, the sheet in the main column with its action bar and
     properties above it, so the drawing sits at the top of the screen without scrolling. */
  (function () {
    function mk(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html) e.innerHTML = html; return e; }
    function sec(name, title, open, nodes) { var dd = mk("details", "sk-sec"); dd.dataset.sec = name; var st = null; try { st = localStorage.getItem("cp-sketch-sec-" + name); } catch (e) {} dd.open = st == null ? open : st === "1"; dd.appendChild(mk("summary", "", title)); nodes.forEach(function (n) { if (n) dd.appendChild(n); }); dd.addEventListener("toggle", function () { try { localStorage.setItem("cp-sketch-sec-" + name, dd.open ? "1" : "0"); } catch (e) {} if (window.innerWidth > 1000) fitSheet(); }); return dd; }
    var head = $("sk-head"), top = head.querySelector(".sk-top"), modes = top.querySelector(".sk-seg"), toolrow = head.querySelector(".sk-toolrow"), styleEl = head.querySelector(".sk-style:not(.sk-sheetopts)"), sheet = head.querySelector(".sk-sheetopts"), layers = sheet.querySelector(".sk-layers"), mp = $("sk-mappanel");
    var side = mk("aside", "sk-side"); side.id = "sk-side"; side.setAttribute("aria-label", "Tools and options");
    side.appendChild(modes); side.appendChild(toolrow);
    side.appendChild(sec("style", "Style", true, [styleEl]));
    side.appendChild(sec("sheet", "Sheet", true, [sheet]));
    side.appendChild(sec("layers", "Layers and map", false, [layers, mp]));
    var main = mk("div", "sk-main"); main.id = "sk-main";
    top.insertAdjacentHTML("beforeend", '<button type="button" class="sk-btn" id="sk-full" title="Full screen (F)" aria-pressed="false">Full screen</button>');
    top.querySelector(".sk-actions").appendChild($("sk-full"));
    [top, $("sk-props"), $("sk-tabs"), $("sk-stage"), $("sk-status")].forEach(function (n) { main.appendChild(n); });
    var lay = mk("div", "sk-layout"); lay.appendChild(side); lay.appendChild(main);
    head.remove(); app.innerHTML = ""; app.appendChild(lay);
    top.id = "sk-head"; /* the bar above the sheet: kept in view on wide screens */
  })();
  function status(msg) { $("sk-status").textContent = msg || ""; }

  /* ---------- Rendering ---------- */
  function contentStr(forExport) {
    var d = doc(), pats = {}, s = "";
    d.items.forEach(function (it) {
      if (it.type === "hatch") pats[patId(it.pat, it.c, it.ps)] = patDef(it.pat, it.c, it.ps);
      if (it.type === "inset") s += forExport ? insetBody(it) : '<g pointer-events="none">' + insetBody(it) + "</g>";
      s += forExport ? draw(it) : '<g data-id="' + it.id + '"' + (isOn(it) ? ' class="sk-on"' : "") + '><g class="v">' + draw(it) + "</g>" + (locked(it) ? "" : hit(it)) + "</g>";
    });
    return { s: s, defs: Object.keys(pats).map(function (p) { return pats[p]; }).join("") };
  }
  function gridDefs() {
    return '<pattern id="sk-g1" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M20 0H0V20" fill="none" stroke="#e1e8e7" stroke-width="0.8"/></pattern>' +
      '<pattern id="sk-g5" width="100" height="100" patternUnits="userSpaceOnUse"><rect width="100" height="100" fill="url(#sk-g1)"/><path d="M100 0H0V100" fill="none" stroke="#c9d4d3" stroke-width="1"/></pattern>';
  }
  function gridStr() { var g = geo().inner; return '<rect x="' + g.x + '" y="' + g.y + '" width="' + g.w + '" height="' + g.h + '" fill="url(#sk-g5)"/>'; }
  function tbGet(key) { var d = doc(), m = /^r\.(\d+)\.(\w+)$/.exec(key); if (m) return ((d.revs || [])[+m[1]] || {})[m[2]] || ""; if (key === "note") return d.tb.note == null ? (d.dscale ? NOTE_SC : NOTE) : d.tb.note; if (key === "scale") return d.tb.scale == null ? (d.dscale ? "1:" + d.dscale + " at " + (d.paper || "A4") : "NTS") : d.tb.scale; return d.tb[key] || ""; }
  function tbSet(key, v) { var d = doc(), m = /^r\.(\d+)\.(\w+)$/.exec(key); if (m) { d.revs = d.revs || []; while (d.revs.length <= +m[1]) d.revs.push({ rev: "", date: "", desc: "", by: "" }); d.revs[+m[1]][m[2]] = v; } else d.tb[key] = v; }
  /* Scale bar: a round length of about 60 to 100 mm on paper, in alternate black and white blocks. */
  function scaleBar(G, d) {
    var mPerU = d.dscale / 4000, target = 320 * mPerU, p10 = Math.pow(10, Math.floor(Math.log10(target))), L = [1, 2, 5, 10].map(function (x) { return x * p10; }).filter(function (x) { return x <= target * 1.25; }).pop() || p10;
    var n = /^[15]/.test(String(L / p10)) ? 5 : 4, seg = L / n / mPerU, x0 = G.inner.x + 16, y0 = G.inner.y + G.inner.h - (d.map ? 34 : 22), c = "#15233a", o = '<g class="sk-sbar">';
    for (var i = 0; i < n; i++) o += '<rect x="' + r1(x0 + i * seg) + '" y="' + y0 + '" width="' + r1(seg) + '" height="6" fill="' + (i % 2 ? "#fff" : c) + '" stroke="' + c + '" stroke-width="0.8"/>';
    var lab = function (v) { return v >= 1000 ? v / 1000 + " km" : v >= 1 ? +v.toFixed(2) + " m" : Math.round(v * 1000) + " mm"; };
    o += txt(x0, y0 - 4, "0", c, 9, "middle") + txt(x0 + n * seg / 2, y0 - 4, lab(L / 2), c, 9, "middle") + txt(x0 + n * seg, y0 - 4, lab(L), c, 9, "middle") + txt(x0 + n * seg + 10, y0 + 6, "1:" + d.dscale + " at " + (d.paper || "A4"), "#5a6677", 8.5, "start");
    return o + "</g>";
  }
  function frameStr(forExport) {
    var G = geo(), d = doc(), c = "#15233a", o = "";
    if (d.wm) { /* watermark: big, pale and diagonal across the drawing area */
      var wi = G.inner, wcx = wi.x + wi.w / 2, wcy = wi.y + wi.h / 2, wang = -Math.atan2(wi.h, wi.w) * 180 / Math.PI, wlen = Math.hypot(wi.w, wi.h) * 0.8, wsz = Math.min(wi.h * 0.22, wlen / Math.max(4, d.wm.length * 0.62));
      o += '<g class="sk-wm" opacity="0.13" pointer-events="none" transform="rotate(' + r1(wang) + " " + r1(wcx) + " " + r1(wcy) + ')">' + txt(wcx, wcy + wsz * 0.35, d.wm, "#7a1f1f", r1(wsz), "middle", ' font-weight="bold" letter-spacing="2"') + "</g>";
    }
    if (d.dscale && d.sbar !== false) o += scaleBar(G, d);
    if (d.frame !== false) o += '<rect x="' + G.inner.x + '" y="' + G.inner.y + '" width="' + G.inner.w + '" height="' + G.inner.h + '" fill="none" stroke="' + c + '" stroke-width="2"/>';
    if (G.tb.off) return o;
    var K = G.k, t = G.tbBlock, rh = G.rh, lw = Math.max(1, 1.6 * K);
    function cell(key, label, x, y, w, h, sz, bold, ph) {
      var v = tbGet(key), shown = v, maxw = w - 12 * K;
      while (shown && tw(shown, sz, bold) > maxw) shown = shown.slice(0, -2) + "…";
      var g = '<g data-tb="' + key + '"' + (forExport ? "" : ' class="sk-tbcell"') + ">" + (forExport ? "" : '<rect x="' + r1(x) + '" y="' + r1(y) + '" width="' + r1(w) + '" height="' + r1(h) + '" fill="transparent"/>');
      if (label) g += txt(x + 5 * K, y + 10 * K, label, "#5a6677", r1(7.5 * K), "start", ' letter-spacing="0.6"');
      if (v) g += txt(x + 5 * K, y + h - 7 * K, shown, c, r1(sz), "start", bold ? ' font-weight="bold"' : "");
      else if (!forExport && ph) g += txt(x + 5 * K, y + h - 7 * K, ph, "#a3adb8", r1(11 * K), "start", ' font-style="italic"');
      return g + "</g>";
    }
    o += '<rect x="' + r1(t.x) + '" y="' + r1(t.y) + '" width="' + r1(t.w) + '" height="' + r1(t.h) + '" fill="#fff" stroke="' + c + '" stroke-width="' + lw + '"/>';
    for (var i = 1; i <= 3; i++) o += ln(t.x, t.y + i * rh, t.x + t.w, t.y + i * rh, c, 0.8);
    var c1 = t.w * 0.36, c2 = t.w * 0.28;
    o += ln(t.x + c1, t.y + 2 * rh, t.x + c1, t.y + 3 * rh, c, 0.8) + ln(t.x + c1 + c2, t.y + 2 * rh, t.x + c1 + c2, t.y + 3 * rh, c, 0.8);
    o += cell("project", "PROJECT", t.x, t.y, t.w, rh, 13 * K, false, "Click to add project name");
    o += cell("title", "SKETCH TITLE", t.x, t.y + rh, t.w, rh, 14 * K, true, "Click to add a title");
    o += cell("ref", "SKETCH NO.", t.x, t.y + 2 * rh, c1, rh, 13 * K, false, "Number");
    o += cell("scale", "SCALE", t.x + c1, t.y + 2 * rh, c2, rh, 13 * K, false, "Scale");
    o += cell("date", "DATE", t.x + c1 + c2, t.y + 2 * rh, t.w - c1 - c2, rh, 13 * K, false, "Date");
    /* disclaimer: wraps onto two lines */
    var nv = tbGet("note"), nsz = 9 * K, words = nv.split(/\s+/), lines = [""], ny = t.y + 3 * rh;
    words.forEach(function (w) { var tr = lines[lines.length - 1] ? lines[lines.length - 1] + " " + w : w; if (tw(tr, nsz, false) > t.w - 12 * K && lines[lines.length - 1]) lines.push(w); else lines[lines.length - 1] = tr; });
    lines = lines.slice(0, 2);
    o += '<g data-tb="note"' + (forExport ? "" : ' class="sk-tbcell"') + ">" + (forExport ? "" : '<rect x="' + r1(t.x) + '" y="' + r1(ny) + '" width="' + r1(t.w) + '" height="' + r1(G.nh) + '" fill="transparent"/>') +
      (nv ? lines.map(function (l, j) { var bold = j === 0 && /^NOT TO SCALE/i.test(l); return txt(t.x + 5 * K, ny + 13 * K + j * 11.5 * K, l, c, r1(nsz), "start", bold ? ' font-weight="bold"' : ""); }).join("") : forExport ? "" : txt(t.x + 5 * K, ny + 18 * K, "Click to add a note or disclaimer", "#a3adb8", r1(10 * K), "start", ' font-style="italic"')) + "</g>";
    if (G.rev) {
      var R = G.rev, rr = G.rr, cols = [["rev", "REV", 0.12], ["date", "DATE", 0.22], ["desc", "DESCRIPTION", 0.5], ["by", "BY", 0.16]], revs = d.revs && d.revs.length ? d.revs : [{}];
      o += '<rect x="' + r1(R.x) + '" y="' + r1(R.y) + '" width="' + r1(R.w) + '" height="' + r1(R.h) + '" fill="#fff" stroke="' + c + '" stroke-width="' + lw + '"/>';
      var x = R.x;
      cols.forEach(function (cl, ci) {
        var w = R.w * cl[2];
        if (ci) o += ln(x, R.y, x, R.y + R.h, c, 0.8);
        o += txt(x + 4 * K, R.y + rr - 5 * K, cl[1], "#5a6677", r1(7.5 * K), "start", ' letter-spacing="0.6"');
        revs.forEach(function (rv, ri) { o += cell("r." + ri + "." + cl[0], "", x, R.y + rr * (ri + 1), w, rr, 10 * K, false, ri === 0 && ci === 0 ? "+" : ""); });
        x += w;
      });
      for (var j = 1; j <= revs.length; j++) o += ln(R.x, R.y + j * rr, R.x + R.w, R.y + j * rr, c, 0.8);
    }
    return o;
  }
  function underStr() {
    return doc().under.map(function (im) {
      return '<g data-uid="' + im.id + '" transform="translate(' + im.x + " " + im.y + ") rotate(" + (im.rot || 0) + ')" opacity="' + (im.op == null ? 0.5 : im.op) + '"><image href="' + im.src + '" x="' + r1(-im.w / 2) + '" y="' + r1(-im.h / 2) + '" width="' + r1(im.w) + '" height="' + r1(im.h) + '" preserveAspectRatio="none"/></g>';
    }).join("");
  }
  /* Keep the whole sheet in view under the sticky toolbars on a desktop screen. */
  /* keep the sketch pad fixed in the window on wide screens while it is the page on show */
  function lockPage() {
    var on = !view.hidden && window.innerWidth > 1000 && !isFull(), h = document.documentElement, was = h.classList.contains("sk-lock");
    if (on !== was) h.classList.toggle("sk-lock", on);
    if (on) pinTop();
  }
  function pinTop() { /* the sketch pad's top sits just under the site bar */
    var tb = document.querySelector(".topbar"), th = tb ? tb.offsetHeight : 0, y = Math.max(0, Math.round(app.getBoundingClientRect().top + window.scrollY - th - 8));
    if (Math.abs(window.scrollY - y) > 1) window.scrollTo(0, y);
  }
  window.addEventListener("scroll", function () { if (document.documentElement.classList.contains("sk-lock")) pinTop(); });
  new MutationObserver(function () { lockPage(); if (!view.hidden) setTimeout(fitSheet, 0); }).observe(view, { attributes: true, attributeFilter: ["hidden"] });
  function fitSheet() {
    lockPage();
    var G = geo(), full = isFull(), top = full ? null : document.querySelector(".topbar"), th = top ? top.offsetHeight : 0, wide = window.innerWidth > 1000, hh = wide ? $("sk-head").offsetHeight + $("sk-props").offsetHeight + 16 : window.innerWidth > 760 ? $("sk-head").offsetHeight : 0;
    app.style.setProperty("--sk-top", th + "px");
    var avail = window.innerHeight - th - hh - $("sk-tabs").offsetHeight - (full ? 24 : 36);
    svg.style.maxWidth = Math.max(320, avail * G.W / G.H) + "px";
    var mn = $("sk-main"); if (document.documentElement.classList.contains("sk-lock") && mn) { var over = mn.scrollHeight - mn.clientHeight; if (over > 0) svg.style.maxWidth = Math.max(320, (avail - over - 2) * G.W / G.H) + "px"; }
  }
  function measureK() { var w = svg.getBoundingClientRect().width; k = w ? geo().W / w : 1; }
  var underKey = "";
  function renderAll() {
    var d = doc(), G = geo();
    svg.setAttribute("viewBox", "0 0 " + G.W + " " + G.H); fitSheet();
    stage.classList.toggle("port", d.orient === "port");
    $("sk-bg").setAttribute("width", G.W); $("sk-bg").setAttribute("height", G.H);
    measureK();
    var uk = d.under.map(function (im) { return im.id + im.src.length; }).join() + d.showUnder;
    if (uk !== underKey) { gUnder.innerHTML = d.showUnder ? underStr() : ""; underKey = uk; } else d.under.forEach(updImg);
    gUnder.style.pointerEvents = d.lockUnder ? "none" : "";
    var mk = mapKey(); if (mk !== mapKeyV) { $("sk-mapg").innerHTML = mapStr(false); mapKeyV = mk; if (d.map && d.map.leg && !mapPanning) updateBgsLegend(); }
    gGrid.innerHTML = d.grid ? gridStr() : "";
    renderContent();
    gFrame.innerHTML = frameStr(false);
    syncControls();
  }
  function renderContent() {
    var d = doc(), c = contentStr(false);
    gDefs.innerHTML = gridDefs() + c.defs;
    gContent.innerHTML = d.showDraw ? c.s : "";
    renderUI();
  }
  function updImg(im) {
    var g = gUnder.querySelector('[data-uid="' + im.id + '"]'); if (!g) return;
    g.setAttribute("transform", "translate(" + im.x + " " + im.y + ") rotate(" + (im.rot || 0) + ")"); g.setAttribute("opacity", im.op == null ? 0.5 : im.op);
    var i = g.firstChild; i.setAttribute("x", r1(-im.w / 2)); i.setAttribute("y", r1(-im.h / 2)); i.setAttribute("width", r1(im.w)); i.setAttribute("height", r1(im.h));
  }
  function hnd(name, x, y, shape) {
    var r = Math.max(7 * k, 6);
    return shape === "sq" ? '<rect data-h="' + name + '" x="' + r1(x - r) + '" y="' + r1(y - r) + '" width="' + r1(2 * r) + '" height="' + r1(2 * r) + '" class="sk-h"/>' : '<circle data-h="' + name + '" cx="' + r1(x) + '" cy="' + r1(y) + '" r="' + r1(r) + '" class="sk-h"/>';
  }
  function renderUI() {
    var o = "", sw = 1.5; /* screen px: these outlines use non-scaling strokes */
    if (sel && sel.k === "img") {
      var im = imgById(sel.id);
      if (im) {
        var a = (im.rot || 0) * Math.PI / 180, ca = Math.cos(a), sa = Math.sin(a), cr = function (x, y) { return { x: im.x + x * ca - y * sa, y: im.y + x * sa + y * ca }; };
        var c4 = [cr(-im.w / 2, -im.h / 2), cr(im.w / 2, -im.h / 2), cr(im.w / 2, im.h / 2), cr(-im.w / 2, im.h / 2)], top = cr(0, -im.h / 2 - 34 * Math.max(k, 1)), tm = cr(0, -im.h / 2);
        o += '<path d="M' + c4.map(function (p) { return r1(p.x) + " " + r1(p.y); }).join("L") + 'Z" class="sk-sel" stroke-width="' + sw + '"/>';
        if (!doc().lockUnder) o += '<line x1="' + r1(tm.x) + '" y1="' + r1(tm.y) + '" x2="' + r1(top.x) + '" y2="' + r1(top.y) + '" class="sk-sel" stroke-width="' + sw + '"/>' + hnd("irot", top.x, top.y) + hnd("isc", c4[2].x, c4[2].y, "sq");
      }
    } else if (isSet()) {
      var bx = null, gl = selList(), anyLock = gl.some(locked);
      gl.forEach(function (gi) { var e2 = gContent.querySelector('[data-id="' + gi.id + '"] .v'); if (!e2) return; try { var b2 = e2.getBBox(); if (!b2.width && !b2.height) return; if (!bx) bx = { x1: b2.x, y1: b2.y, x2: b2.x + b2.width, y2: b2.y + b2.height }; else { bx.x1 = Math.min(bx.x1, b2.x); bx.y1 = Math.min(bx.y1, b2.y); bx.x2 = Math.max(bx.x2, b2.x + b2.width); bx.y2 = Math.max(bx.y2, b2.y + b2.height); } } catch (er) {} });
      if (bx) { var pg = 8 * Math.max(k, 1); o += '<rect x="' + r1(bx.x1 - pg) + '" y="' + r1(bx.y1 - pg) + '" width="' + r1(bx.x2 - bx.x1 + 2 * pg) + '" height="' + r1(bx.y2 - bx.y1 + 2 * pg) + '" class="sk-sel' + (sel.k === "group" ? " grp" : "") + (anyLock ? " lk" : "") + '" stroke-width="' + sw + '"/>'; }
    } else if (sel) {
      var it = byId(sel.id), el = gContent.querySelector('[data-id="' + sel.id + '"] .v');
      if (it && el) {
        var bb; try { bb = el.getBBox(); } catch (e) { bb = null; }
        if (bb) { var p = 6 * Math.max(k, 1); o += '<rect x="' + r1(bb.x - p) + '" y="' + r1(bb.y - p) + '" width="' + r1(bb.width + 2 * p) + '" height="' + r1(bb.height + 2 * p) + '" class="sk-sel' + (locked(it) ? " lk" : "") + '" stroke-width="' + sw + '"/>'; }
        if (!locked(it)) {
          if (SEG[it.type]) { o += hnd("p1", it.x1, it.y1) + hnd("p2", it.x2, it.y2); if (it.type === "dim") { var n = norm(it), off = it.o == null ? 30 : it.o; o += hnd("off", (it.x1 + it.x2) / 2 + n.nx * off, (it.y1 + it.y2) / 2 + n.ny * off, "sq"); } }
          if ((it.type === "hatch" && !it.seed) || it.type === "poly") it.pts.forEach(function (q, i) { o += hnd("v" + i, q[0], q[1]); });
          if (it.type === "leader") { var A = anchorOf(it); o += hnd("anc", A.x, A.y); }
          if (it.type === "north") { var nr = (it.rot || 0) * Math.PI / 180, nL = 58 * (it.s || 1), hx = it.x + Math.sin(nr) * nL, hy = it.y - Math.cos(nr) * nL; o += '<line x1="' + it.x + '" y1="' + it.y + '" x2="' + r1(hx) + '" y2="' + r1(hy) + '" class="sk-sel" stroke-width="1"/>' + hnd("nrot", hx, hy); }
          if (it.type === "image" || it.type === "inset") o += hnd("isz", it.x + it.w, it.y + it.h, "sq");
          if (it.type === "inset") o += '<line x1="' + r1(it.x + it.w / 2) + '" y1="' + r1(it.y + it.h / 2) + '" x2="' + it.sx + '" y2="' + it.sy + '" class="sk-sel" stroke-width="1"/>' + hnd("isrc", it.sx, it.sy);
        }
      }
    }
    xbox = null;
    if (tool[mode] === "xform" && sel && sel.k !== "img") {
      var xl = selList(); if (xl.length && !xl.some(locked)) {
        var xb = null; xl.forEach(function (gi) { var e3 = gContent.querySelector('[data-id="' + gi.id + '"] .v'); if (!e3) return; try { var b3 = e3.getBBox(); if (!xb) xb = { x1: b3.x, y1: b3.y, x2: b3.x + b3.width, y2: b3.y + b3.height }; else { xb.x1 = Math.min(xb.x1, b3.x); xb.y1 = Math.min(xb.y1, b3.y); xb.x2 = Math.max(xb.x2, b3.x + b3.width); xb.y2 = Math.max(xb.y2, b3.y + b3.height); } } catch (er) {} });
        if (xb && xb.x2 - xb.x1 + xb.y2 - xb.y1 > 2) {
          xbox = xb; o = o.replace(/<(circle|rect) data-h="(?!xs)[^"]*"[^>]*\/>/g, "");
          o += '<rect x="' + r1(xb.x1) + '" y="' + r1(xb.y1) + '" width="' + r1(xb.x2 - xb.x1) + '" height="' + r1(xb.y2 - xb.y1) + '" class="sk-sel" stroke-width="1.5"/>';
          [[xb.x1, xb.y1], [xb.x2, xb.y1], [xb.x2, xb.y2], [xb.x1, xb.y2]].forEach(function (q, i) { o += hnd("xs" + i, q[0], q[1], "sq"); });
        }
      }
    }
    gUI.innerHTML = o;
  }
  var xbox = null;
  function renderLive() {
    var o = "";
    if (pend && pend.pts.length) {
      var pts = pend.pts.concat(pend.cur ? [[pend.cur.x, pend.cur.y]] : []);
      o += '<path d="M' + pts.map(function (p) { return p[0] + " " + p[1]; }).join("L") + '" fill="' + style.c + '" fill-opacity="0.08" stroke="' + style.c + '" stroke-width="' + r1(1.5 * Math.max(k, 1)) + '" stroke-dasharray="6 4"/>';
      o += hnd("first", pend.pts[0][0], pend.pts[0][1]);
    }
    if (drag && drag.temp) o += draw(drag.temp);
    gLive.innerHTML = o;
  }

  /* ---------- Toolbar ---------- */
  /* Show only the style options that matter for the active tool or the selected items. */
  var CTX_TOOL = { line: /^(pen|line|arrow|rect|circle|poly|member|brk|cloud|hatch)$/, text: /^(text|leader|dim|udl|pload|moment|section|wl)$/, hatch: /^hatch$/ };
  var CTX_TYPE = { line: /^(stroke|line|arrow|rect|circle|poly|member|brk|cloud|hatch)$/, text: /^(text|leader|dim|udl|pload|moment|section|wl)$/, hatch: /^hatch$/ };
  function updateCtx() {
    var t = tool[mode], l = sel && sel.k !== "img" ? selList() : [], any = false;
    Array.prototype.forEach.call(app.querySelectorAll("[data-ctx]"), function (el) {
      var c = el.dataset.ctx, on = CTX_TOOL[c].test(t) || l.some(function (it) { return CTX_TYPE[c].test(it.type); }); el.hidden = !on; if (on) any = true;
    });
    var hint = $("sk-ctxhint"); if (hint) hint.hidden = any;
  }
  function renderTools() {
    var tb = function (t) { return '<button type="button" class="sk-tool" data-tool="' + t[0] + '" aria-pressed="' + (tool[mode] === t[0]) + '" title="' + esc(HINTS[t[0]]) + '">' + iconSvg(t[0]) + "<span>" + t[1] + "</span></button>"; };
    $("sk-tools").innerHTML = TOOLS[mode].map(tb).join("");
    $("sk-tools2").innerHTML = TOOLS.shapes.map(tb).join("");
    $("sk-ermode").hidden = tool[mode] !== "eraser";
    Array.prototype.forEach.call(app.querySelectorAll("[data-mode]"), function (b) { b.setAttribute("aria-pressed", b.dataset.mode === mode); });
    Array.prototype.forEach.call(app.querySelectorAll("[data-only]"), function (el) { el.hidden = el.dataset.only !== mode; });
    stage.dataset.tool = tool[mode];
    updateCtx();
  }
  $("sk-swatches").innerHTML = COLORS.map(function (c) { return '<button type="button" class="sk-sw" data-color="' + c[0] + '" style="background:' + c[0] + '" title="' + c[1] + '" aria-label="' + c[1] + '"></button>'; }).join("");
  $("sk-widths").innerHTML = WIDTHS.map(function (w) { return '<button type="button" class="sk-chip" data-w="' + w[0] + '" title="' + w[1] + '" aria-label="' + w[1] + '"><i style="height:' + Math.min(w[0], 10) + 'px"></i></button>'; }).join("");
  function syncControls() {
    var d = doc();
    Array.prototype.forEach.call(app.querySelectorAll("[data-color]"), function (b) { b.setAttribute("aria-pressed", b.dataset.color === style.c); });
    Array.prototype.forEach.call(app.querySelectorAll("[data-w]"), function (b) { b.setAttribute("aria-pressed", +b.dataset.w === style.w); });
    Array.prototype.forEach.call(app.querySelectorAll("[data-orient]"), function (b) { b.setAttribute("aria-pressed", b.dataset.orient === d.orient); });
    $("sk-color").value = style.c; $("sk-ls").value = style.ls; $("sk-pat").value = style.pat;
    $("sk-grid").checked = d.grid; $("sk-snap").checked = d.snap; $("sk-scale").value = d.scale; $("sk-dscale").value = d.dscale || 0; $("sk-sbar-l").hidden = !d.dscale; $("sk-sbar").checked = d.sbar !== false;
    $("sk-gsq").hidden = !!d.dscale || mode !== "struct"; $("sk-mapshow-l").hidden = !d.map; if (d.map) { $("sk-mapshow").checked = d.map.show !== false; $("sk-mapleg").checked = !!d.map.leg; $("sk-maplegpos").value = d.map.legpos || "br"; $("sk-maposm").checked = d.map.osm !== false; $("sk-mapcont").checked = d.map.cont !== false; $("sk-mapgrey").checked = d.map.grey !== false; $("sk-mapop").value = d.map.op || 0.55; $("sk-mapcop").value = d.map.cop || 1; }
    renderMapExtra();
    Array.prototype.forEach.call(app.querySelectorAll("[data-ml]"), function (c) { c.checked = !!(d.map && d.map.on && d.map.on[c.dataset.ml]); }); $("sk-gridinfo").textContent = d.dscale ? "grid " + fmtM(toM(GRID)) : "";
    Array.prototype.forEach.call(app.querySelectorAll("[data-snap]"), function (c) { c.checked = !!S.snaps[c.dataset.snap]; c.disabled = !d.snap; });
    $("sk-show-draw").checked = d.showDraw; $("sk-lock-draw").checked = d.lockDraw; $("sk-show-under").checked = d.showUnder; $("sk-lock-under").checked = d.lockUnder;
    Array.prototype.forEach.call(app.querySelectorAll("[data-paper]"), function (b) { b.setAttribute("aria-pressed", b.dataset.paper === (d.paper || "A4")); });
    $("sk-showframe").checked = d.frame !== false; $("sk-tbs").value = d.tbs || "medium"; $("sk-rev").checked = !!d.showRev; $("sk-addrev").hidden = !d.showRev || geo().tb.off; $("sk-delrev").hidden = $("sk-addrev").hidden || !(d.revs && d.revs.length > 1); $("sk-fs").value = style.fs; $("sk-hsc").value = style.hsc || 1;
    $("sk-wm").value = d.wmc ? "*" : (d.wm || ""); $("sk-wmtext").hidden = !d.wmc; if (d.wmc && document.activeElement !== $("sk-wmtext")) $("sk-wmtext").value = d.wm || "";
    $("sk-tabs").innerHTML = S.sheets.map(function (s, i) {
      var on = i === S.cur;
      return '<span class="sk-tab' + (on ? " on" : "") + '" draggable="true" data-si="' + i + '"><button type="button" role="tab" data-sheet="' + i + '" aria-selected="' + on + '" title="' + esc(s.tb.title || "") + '">' + esc(s.tb.ref || "Sheet " + (i + 1)) + (s.tb.title ? '<small>' + esc(s.tb.title.length > 22 ? s.tb.title.slice(0, 21) + "…" : s.tb.title) + "</small>" : "") + "</button>" +
        (on && S.sheets.length > 1 ? '<button type="button" class="sk-tabx" id="sk-del" aria-label="Delete this sheet" title="Delete this sheet">×</button>' : "") + "</span>";
    }).join("") + '<button type="button" class="sk-tabadd" id="sk-new" title="New sheet">+ New sheet</button>';
    $("sk-undo").disabled = !H().u.length; $("sk-redo").disabled = !H().r.length;
  }
  function setMode(m) { mode = m; S.mode = m; pend = null; sel = null; persist(); renderTools(); renderAll(); renderLive(); renderProps(); }
  function setTool(t) { if (mapMode) setMapMode(mapMode); if (pend && pend.poly && t !== "poly") finishPoly(); else if (pend && !pend.poly && t !== "hatch") finishHatch(); tool[mode] = t; snapHit = null; showSnap(); renderTools(); if (t !== "select" && t !== "xform") sel = null; renderUI(); renderProps(); }

  /* Turning the sheet keeps everything on it, shifted so it stays centred on the new sheet. */
  function setOrient(o, paper) {
    var d = doc(), s0 = size(); begin(); if (o) d.orient = o; if (paper) d.paper = paper; var s1 = size();
    var dx = Math.round((s1[0] - s0[0]) / 2 / GRID) * GRID, dy = Math.round((s1[1] - s0[1]) / 2 / GRID) * GRID;
    d.items = d.items.map(function (it) { var n = shifted(it, dx, dy); if (n.type === "leader" && n.att) { n.ax += dx; n.ay += dy; } return n; });
    d.under.forEach(function (im) { im.x += dx; im.y += dy; });
    commit();
  }
  /* Applying a colour, weight, line type or pattern also restyles the selected item. */
  function restyle(fn) { var l = selList().filter(function (it) { return !locked(it); }); if (!l.length) return; begin(); l.forEach(fn); commit(); }
  app.addEventListener("click", function (e) {
    var b = e.target.closest("button"); if (!b || !app.contains(b)) return;
    if (b.dataset.mode) return setMode(b.dataset.mode);
    if (b.dataset.tool === "image") { $("sk-img2").click(); return; }
    if (b.dataset.tool) return setTool(b.dataset.tool);
    if (b.dataset.color) { style.c = b.dataset.color; restyle(function (it) { it.c = style.c; }); syncControls(); return; }
    if (b.dataset.w) { style.w = +b.dataset.w; restyle(function (it) { if ("w" in it) it.w = style.w; }); syncControls(); return; }
    if (b.dataset.paper) { if ((doc().paper || "A4") !== b.dataset.paper) setOrient(null, b.dataset.paper); return; }
    if (b.dataset.orient) { if (doc().orient !== b.dataset.orient) setOrient(b.dataset.orient); return; }
  });
  $("sk-fs").addEventListener("change", function () { style.fs = +this.value; restyle(function (it) { if (it.type === "text") it.size = style.fs; else if (it.type === "leader" || it.label != null || it.type === "dim") keepTL(it, function (x) { x.fs = style.fs; }); }); renderProps(); });
  $("sk-hsc").addEventListener("change", function () { style.hsc = +this.value; restyle(function (it) { if (it.type === "hatch") it.ps = style.hsc; }); renderProps(); });
  $("sk-wm").addEventListener("change", function () { var v = this.value; $("sk-wmtext").hidden = v !== "*"; begin(); doc().wm = v === "*" ? ($("sk-wmtext").value || "COPY") : v; doc().wmc = v === "*"; commit(); if (v === "*") $("sk-wmtext").focus({ preventScroll: true }); });
  $("sk-wmtext").addEventListener("input", function () { doc().wm = this.value; persist(); renderAll(); });
  $("sk-color").addEventListener("input", function () { style.c = this.value; syncControls(); });
  $("sk-color").addEventListener("change", function () { style.c = this.value; restyle(function (it) { it.c = style.c; }); });
  $("sk-ls").addEventListener("change", function () { style.ls = this.value; restyle(function (it) { if (/^(stroke|line|member|hatch|arrow|rect|circle|poly)$/.test(it.type)) it.ls = style.ls; }); });
  $("sk-pat").addEventListener("change", function () { style.pat = this.value; if (tool[mode] !== "hatch" && !(sel && byId(sel.id) && byId(sel.id).type === "hatch")) setTool("hatch"); restyle(function (it) { if (it.type === "hatch") it.pat = style.pat; }); renderProps(); });
  function opt(id, key, after) { $(id).addEventListener("change", function () { doc()[key] = this.type === "checkbox" ? this.checked : +this.value || doc()[key]; persist(); if (after) after(); renderAll(); }); }
  opt("sk-showframe", "frame"); 
  $("sk-tbs").addEventListener("change", function () { begin(); doc().tbs = this.value; commit(); });
  $("sk-rev").addEventListener("change", function () { begin(); var d = doc(); d.showRev = this.checked; if (d.showRev && !(d.revs && d.revs.length)) d.revs = [{ rev: "P01", date: today(), desc: "First issue", by: "" }]; commit(); });
  $("sk-delrev").addEventListener("click", function () { var d = doc(); if (!d.revs || d.revs.length < 2) return; begin(); var r0 = d.revs.pop(); commit(); status("Removed revision " + (r0.rev || "") + ". Undo brings it back."); });
  $("sk-addrev").addEventListener("click", function () {
    var d = doc(), last = (d.revs || []).slice(-1)[0], m = last && /^([A-Za-z]*)(\d+)$/.exec(last.rev || ""), nr = m ? m[1] + ("0" + (+m[2] + 1)).slice(-Math.max(2, m[2].length)) : "";
    begin(); d.revs = (d.revs || []).concat([{ rev: nr, date: today(), desc: "", by: last ? last.by : "" }]); commit(); setTimeout(function () { openTB("r." + (d.revs.length - 1) + ".desc"); }, 0);
  });
  $("sk-sbar").addEventListener("change", function () { begin(); doc().sbar = this.checked; commit(); });
  opt("sk-grid", "grid"); opt("sk-snap", "snap", syncControls); opt("sk-scale", "scale");
  $("sk-dscale").addEventListener("change", function () { begin(); var d = doc(); d.dscale = +this.value || 0; commit(); syncControls(); renderProps(); status(d.dscale ? "Drawing at 1:" + d.dscale + " on " + (d.paper || "A4") + ". One grid square is " + fmtM(toM(GRID)) + ". Dimensions and lengths now read true." : "Not to scale."); });
  app.addEventListener("change", function (e) { var c = e.target; if (c.dataset && c.dataset.snap) { S.snaps[c.dataset.snap] = c.checked; persist(); } });
  opt("sk-show-draw", "showDraw"); opt("sk-lock-draw", "lockDraw", function () { sel = null; renderProps(); });
  opt("sk-show-under", "showUnder", function () { underKey = ""; if (sel && sel.k === "img") { sel = null; renderProps(); } });
  opt("sk-lock-under", "lockUnder", function () { if (sel && sel.k === "img") { sel = null; renderProps(); } });
  $("sk-undo").addEventListener("click", undo); $("sk-redo").addEventListener("click", redo);
  $("sk-clear").addEventListener("click", function () { if (!doc().items.length) return; begin(); doc().items = doc().items.filter(function (it) { return it.lock; }); sel = null; commit(); renderProps(); status("Cleared the drawing (locked items kept). Undo brings it back."); });

  /* ---------- Sheets ---------- */
  var dragSheet = null;
  $("sk-tabs").addEventListener("dragstart", function (e) { var t = e.target.closest("[data-si]"); if (!t) return; dragSheet = +t.dataset.si; e.dataTransfer.effectAllowed = "move"; try { e.dataTransfer.setData("text/plain", "sheet"); } catch (er) {} t.classList.add("dragging"); });
  $("sk-tabs").addEventListener("dragover", function (e) { if (dragSheet === null) return; var t = e.target.closest("[data-si]"); if (!t) return; e.preventDefault(); Array.prototype.forEach.call($("sk-tabs").querySelectorAll(".dropl,.dropr"), function (x) { x.classList.remove("dropl", "dropr"); }); var r = t.getBoundingClientRect(); t.classList.add(e.clientX < r.left + r.width / 2 ? "dropl" : "dropr"); });
  $("sk-tabs").addEventListener("dragend", function () { dragSheet = null; syncControls(); });
  $("sk-tabs").addEventListener("drop", function (e) {
    var t = e.target.closest("[data-si]"); if (dragSheet === null || !t) return; e.preventDefault();
    var to = +t.dataset.si, r = t.getBoundingClientRect(); if (e.clientX >= r.left + r.width / 2) to++; var from = dragSheet; dragSheet = null; if (to > from) to--;
    if (to === from) { syncControls(); return; }
    var curSheet = S.sheets[S.cur], mv = S.sheets.splice(from, 1)[0]; S.sheets.splice(to, 0, mv); S.cur = S.sheets.indexOf(curSheet); hist = {}; persist(); syncControls();
  });
  $("sk-tabs").addEventListener("click", function (e) {
    var b = e.target.closest("button"); if (!b) return;
    if (tbKey) closeTB(true);
    if (b.dataset.sheet) { S.cur = +b.dataset.sheet; sel = null; pend = null; underKey = ""; persist(); renderAll(); renderProps(); return; }
    if (b.id === "sk-new") { var n = blankSheet(S.sheets.length + 1, doc()); n.paper = doc().paper; n.frame = doc().frame; n.tbs = doc().tbs; S.sheets.push(n); S.cur = S.sheets.length - 1; sel = null; underKey = ""; persist(); renderAll(); renderProps(); status("New sheet " + doc().tb.ref + " added."); return; }
    if (b.id === "sk-del") {
      if (S.sheets.length < 2) return;
      if (!window.confirm("Delete sheet " + (doc().tb.ref || "") + "? This can't be undone.")) return;
      S.sheets.splice(S.cur, 1); hist = {}; S.cur = Math.max(0, S.cur - 1); sel = null; underKey = ""; persist(); renderAll(); renderProps();
    }
  });

  /* ---------- Properties bar ---------- */
  var ROT_TYPES = { support: 90, pload: 45, north: 45 };
  function renderProps() { updateCtx(); renderProps0(); }
  function renderProps0() {
    var p = $("sk-props"), it = sel && sel.k === "item" ? byId(sel.id) : null, im = sel && sel.k === "img" ? imgById(sel.id) : null;
    if (im) {
      p.innerHTML = '<span class="sk-lab">Image</span><label class="sk-check">Opacity <input type="range" id="skp-op" min="0.1" max="1" step="0.05" value="' + (im.op == null ? 0.5 : im.op) + '"></label>' +
        '<button type="button" class="sk-btn" data-act="irot90">Rotate 90°</button><button type="button" class="sk-btn" data-act="ireset">Straighten</button><button type="button" class="sk-btn danger" data-act="del">Remove image</button>' +
        '<span class="small">Drag to move, the square handle to scale, the round one to rotate. Tick "Lock underlay" when it is in place.</span>';
      return;
    }
    if (isSet()) {
      var gl = selList(), lk = gl.some(locked), grp = sel.k === "group";
      p.innerHTML = '<span class="sk-lab">' + (grp ? "Group" : gl.length + " selected") + '</span><span class="small">' + (grp ? gl.length + " parts, moving together. " : "") +
        (lk ? (doc().lockDraw ? "The drawing is locked." : "Some of these are locked.") : grp ? "Click a part again to edit just that part." : "Drag any of them to move them all. Colour, weight and line type apply to all of them.") + "</span>" +
        (lk ? (doc().lockDraw ? "" : '<button type="button" class="sk-btn" data-act="gunlock">Unlock</button>') :
          (grp ? '<button type="button" class="sk-btn" data-act="ungroup">Ungroup</button>' : '<button type="button" class="sk-btn" data-act="group">Group</button>') +
          ORDER_BTNS + '<button type="button" class="sk-btn" data-act="dup" title="Ctrl+D">Duplicate</button><button type="button" class="sk-btn" data-act="glock">Lock</button><button type="button" class="sk-btn danger" data-act="gdel">Delete</button>');
      return;
    }
    if (!it) { p.innerHTML = '<span class="small">' + esc(HINTS[tool[mode]] || "") + "</span>"; return; }
    updateCtx();
    var NAMES = { inset: "Detail window", image: "Image", arrow: "Arrow", rect: "Rectangle", circle: "Circle", poly: "Polygon", cloud: "Revision cloud", brk: "Break line", slope: "Slope marker", section: "Section marker", north: "North arrow", wl: "Water level", stroke: "Pen stroke", line: "Line", member: "Member", support: "Support", pload: "Point load", udl: "Distributed load", moment: "Moment", dim: "Dimension", text: "Text", leader: "Leader note", hatch: "Hatched area" };
    var h = '<span class="sk-lab">' + NAMES[it.type] + "</span>";
    if (locked(it)) {
      h += '<span class="small">' + (doc().lockDraw ? "The drawing is locked. Untick \"Lock drawing\" to change it." : "Locked in place.") + "</span>";
      if (it.lock && !doc().lockDraw) h += '<button type="button" class="sk-btn" data-act="unlock">Unlock</button>';
      p.innerHTML = h; return;
    }
    if (it.type === "support") h += '<select id="skp-kind" aria-label="Support type"><option value="pin">Pinned</option><option value="roller">Roller</option><option value="fixed">Fixed</option></select>';
    if (it.type === "text" || it.type === "leader") h += '<textarea id="skp-text" rows="2" aria-label="Text" spellcheck="true" lang="en-GB">' + esc(it.text) + "</textarea>";
    if (it.type === "text") h += '<select id="skp-size" aria-label="Text size">' + [12, 14, 18, 24, 32, 44].map(function (s) { return '<option value="' + s + '"' + ((it.size || 18) === s ? " selected" : "") + ">" + s + " pt</option>"; }).join("") + '</select><label class="sk-check"><input type="checkbox" id="skp-bold"' + (it.bold ? " checked" : "") + "> Bold</label>";
    if (measured() && /^(line|member|arrow|dim|section|slope|brk)$/.test(it.type)) h += '<label class="sk-check">Length <input type="number" id="skp-len" step="0.01" min="0" style="width:6.5em" value="' + r3(toM(Math.hypot(it.x2 - it.x1, it.y2 - it.y1))) + '"> m</label>';
    if (measured() && (it.type === "rect" || it.type === "cloud")) h += '<label class="sk-check">W <input type="number" id="skp-rw" step="0.01" min="0" style="width:6em" value="' + r3(toM(Math.abs(it.x2 - it.x1))) + '"></label><label class="sk-check">H <input type="number" id="skp-rh" step="0.01" min="0" style="width:6em" value="' + r3(toM(Math.abs(it.y2 - it.y1))) + '"> m</label>';
    if (measured() && it.type === "circle") h += '<label class="sk-check">Radius <input type="number" id="skp-rad" step="0.01" min="0" style="width:6em" value="' + r3(toM(Math.hypot(it.x2 - it.x1, it.y2 - it.y1))) + '"> m</label>';
    if (it.type === "section" || it.type === "wl") h += '<input type="text" id="skp-label" spellcheck="true" lang="en-GB" value="' + esc(it.label || "") + '" aria-label="Label" style="width:' + (it.type === "wl" ? 11 : 4) + 'em">';
    if (it.type === "slope" || it.type === "north" || it.type === "wl") h += '<label class="sk-check">Size <select id="skp-s">' + [0.5, 0.75, 1, 1.5, 2, 3].map(function (v) { return '<option value="' + v + '"' + ((it.s || 1) === v ? " selected" : "") + ">×" + v + "</option>"; }).join("") + "</select></label>";
    if (it.type === "section" || it.type === "slope") h += '<button type="button" class="sk-btn" data-act="flip">Flip side</button>';
    if (it.type === "leader" || it.type === "arrow") h += '<label class="sk-check">Arrowhead <select id="skp-ah">' + (it.type === "leader" ? [[0, "None"], [-1, "Dot"], [7, "Small"], [11, "Medium"], [16, "Large"]] : [[8, "Small"], [11, "Medium"], [16, "Large"], [22, "Extra large"]]).map(function (x) { var cur = it.ah == null ? (it.type === "leader" ? 11 : 11) : it.ah; return '<option value="' + x[0] + '"' + (cur === x[0] ? " selected" : "") + ">" + x[1] + "</option>"; }).join("") + "</select></label>";
    if (it.type === "pload" || it.type === "udl" || it.type === "moment" || it.type === "dim") h += '<input type="text" id="skp-label" spellcheck="true" lang="en-GB" value="' + esc(it.label || "") + '" placeholder="' + (it.type === "dim" ? esc(dimAuto(it)) : "Value") + '" aria-label="Label" style="width:9em">';
    if (it.type === "north") h += '<label class="sk-check">Angle <input type="number" id="skp-nrot" min="0" max="359" step="1" style="width:4.5em" value="' + (it.rot || 0) + '">°</label>';
    if (ROT_TYPES[it.type]) h += '<button type="button" class="sk-btn" data-act="rot">Rotate' + (it.type === "north" ? " 45°" : "") + "</button>";
    if (it.type === "udl" || it.type === "dim") h += '<button type="button" class="sk-btn" data-act="flip">Flip side</button>';
    if (it.type === "moment") h += '<button type="button" class="sk-btn" data-act="dir">Reverse</button>';
    if (it.type === "hatch") h += '<select id="skp-pat" aria-label="Hatch pattern">' + PATS.map(function (x) { return '<option value="' + x[0] + '"' + (it.pat === x[0] ? " selected" : "") + ">" + x[1] + "</option>"; }).join("") + '</select><label class="sk-check"><input type="checkbox" id="skp-outline"' + (it.outline ? " checked" : "") + "> Outline</label>" +
      '<label class="sk-check">Scale <select id="skp-hsc">' + [0.1, 0.25, 0.5, 0.75, 1, 1.5, 2, 3, 4].map(function (v) { return '<option value="' + v + '"' + ((it.ps || 1) === v ? " selected" : "") + ">×" + v + "</option>"; }).join("") + "</select></label>";
    if (it.type === "leader") h += '<label class="sk-check"><input type="checkbox" id="skp-box"' + (it.nobox ? "" : " checked") + "> Box</label>";
    if (it.type === "leader" && it.att) h += '<button type="button" class="sk-btn" data-act="detach">Detach arrow</button>';
    if (it.type === "text" || it.type === "dim" || (it.type === "leader" && it.nobox)) h += '<label class="sk-check"><input type="checkbox" id="skp-mask"' + (it.mask ? " checked" : "") + "> Mask behind</label>";
    if (it.type === "dim") h += '<label class="sk-check">Units <select id="skp-unit"><option value="">Auto</option><option value="m"' + (it.unit === "m" ? " selected" : "") + '>m</option><option value="mm"' + (it.unit === "mm" ? " selected" : "") + ">mm</option></select></label>";
    if (it.type === "rect") h += '<label class="sk-check"><input type="checkbox" id="skp-rfill"' + (it.fill ? " checked" : "") + "> White fill</label>";
    if (it.type === "inset") {
      var N0 = doc().dscale, ks = N0 ? SCALES.filter(function (n) { return n < N0; }).map(function (n) { return [N0 / n, "1:" + n]; }) : [1.5, 2, 3, 4, 5, 10].map(function (v) { return [v, "×" + v]; });
      if (!ks.some(function (q) { return Math.abs(q[0] - it.k) < 1e-6; })) ks.push([it.k, insetScale(it)]);
      h += '<label class="sk-check">Detail <input type="text" id="skp-ilabel" size="4" value="' + esc(it.label || "") + '"></label><label class="sk-check">Scale <select id="skp-ik">' + ks.map(function (q) { return '<option value="' + q[0] + '"' + (Math.abs(q[0] - it.k) < 1e-6 ? " selected" : "") + ">" + q[1] + "</option>"; }).join("") + "</select></label>" +
        '<label class="sk-check"><input type="checkbox" id="skp-isrc"' + (it.nosrc ? "" : " checked") + '> Mark the area on the drawing</label><label class="sk-check"><input type="checkbox" id="skp-imap"' + (it.map === false ? "" : " checked") + "> Show map</label>";
    }
    if (it.type === "image") h += '<label class="sk-check"><input type="checkbox" id="skp-border"' + (it.border ? " checked" : "") + "> Border</label>";
    if (measured() && /^(rect|circle|poly|cloud|hatch)$/.test(it.type) && !it.open) { var A0 = areaOf(it); h += '<span class="small sk-area">Area ' + fmtArea(A0) + ", perimeter " + fmtM(toM(perimOf(it))) + '</span><button type="button" class="sk-btn" data-act="mklabel">Label area</button>'; }
    h += ORDER_BTNS + '<button type="button" class="sk-btn" data-act="dup" title="Ctrl+D">Duplicate</button><button type="button" class="sk-btn" data-act="lock" title="Stop this item being moved by accident">Lock</button><button type="button" class="sk-btn danger" data-act="del">Delete</button>';
    p.innerHTML = h;
    if ($("skp-kind")) $("skp-kind").value = it.kind;
  }
  /* A leader's note box grows to the right and down when its text changes, rather than from its centre. */
  function keepTL(it, fn) { if (it.type !== "leader") return fn(it); var b0 = leaderBox(it); fn(it); var b1 = leaderBox(it); it.bx = r1(it.bx + (b1.w - b0.w) / 2); it.by = r1(it.by + (b1.h - b0.h) / 2); }
  /* Drawing order: later items draw on top. Pick-point hatches can be moved too. */
  function orderSel(how) {
    var l = selList().filter(function (it) { return !locked(it); }); if (!l.length) return;
    var a = doc().items, ids = {}; l.forEach(function (x) { ids[x.id] = 1; }); begin();
    if (how === "front" || how === "back") { var pick = a.filter(function (x) { return ids[x.id]; }), rest = a.filter(function (x) { return !ids[x.id]; }); doc().items = how === "front" ? rest.concat(pick) : pick.concat(rest); }
    else if (how === "fwd") { for (var i = a.length - 2; i >= 0; i--) if (ids[a[i].id] && !ids[a[i + 1].id]) { var t = a[i]; a[i] = a[i + 1]; a[i + 1] = t; } }
    else { for (var j = 1; j < a.length; j++) if (ids[a[j].id] && !ids[a[j - 1].id]) { var t2 = a[j]; a[j] = a[j - 1]; a[j - 1] = t2; } }
    commit(); status({ front: "Brought to the front.", back: "Sent to the back.", fwd: "Brought forward.", bwd: "Sent backward." }[how]);
  }
  var ORDER_BTNS = '<span class="sk-order" role="group" aria-label="Order"><button type="button" class="sk-btn" data-act="o-front" title="Bring to front (Ctrl+Shift+])">To front</button><button type="button" class="sk-btn" data-act="o-fwd" title="Bring forward (Ctrl+])">Forward</button><button type="button" class="sk-btn" data-act="o-bwd" title="Send backward (Ctrl+[)">Backward</button><button type="button" class="sk-btn" data-act="o-back" title="Send to back (Ctrl+Shift+[)">To back</button></span>';
  function liveEdit(id, fn) {
    var el = $(id); if (!el) return;
    el.addEventListener("focus", begin);
    el.addEventListener("input", function () { var it = byId(sel.id); if (!it) return; keepTL(it, function (x) { fn(x, el); }); renderContent(); });
    el.addEventListener("change", function () { var it = byId(sel.id); if (!it) return; keepTL(it, function (x) { fn(x, el); }); commit(); });
    el.addEventListener("blur", function () { if (before !== null) commit(); });
  }
  var propsEl = $("sk-props");
  new MutationObserver(function () {
    liveEdit("skp-text", function (it, el) { it.text = el.value; });
    liveEdit("skp-label", function (it, el) { it.label = el.value; });
    liveEdit("skp-size", function (it, el) { it.size = +el.value; });
    liveEdit("skp-s", function (it, el) { it.s = +el.value; });
    liveEdit("skp-mask", function (it, el) { it.mask = el.checked; });
    liveEdit("skp-unit", function (it, el) { it.unit = el.value || undefined; });
    liveEdit("skp-border", function (it, el) { it.border = el.checked; });
    liveEdit("skp-nrot", function (it, el) { var v = parseFloat(el.value); if (isFinite(v)) it.rot = ((Math.round(v) % 360) + 360) % 360; });
    liveEdit("skp-rfill", function (it, el) { it.fill = el.checked; });
    liveEdit("skp-ilabel", function (it, el) { it.label = el.value; });
    liveEdit("skp-ik", function (it, el) { it.k = +el.value; });
    liveEdit("skp-isrc", function (it, el) { it.nosrc = !el.checked; });
    liveEdit("skp-imap", function (it, el) { it.map = el.checked; });
    liveEdit("skp-len", function (it, el) { var v = parseFloat(el.value); if (!(v > 0)) return; var n = norm(it), L = fromM(v); it.x2 = r1(it.x1 + n.dx * L); it.y2 = r1(it.y1 + n.dy * L); });
    liveEdit("skp-rw", function (it, el) { var v = parseFloat(el.value); if (!(v > 0)) return; it.x2 = r1(it.x1 + (it.x2 >= it.x1 ? 1 : -1) * fromM(v)); });
    liveEdit("skp-rh", function (it, el) { var v = parseFloat(el.value); if (!(v > 0)) return; it.y2 = r1(it.y1 + (it.y2 >= it.y1 ? 1 : -1) * fromM(v)); });
    liveEdit("skp-rad", function (it, el) { var v = parseFloat(el.value); if (!(v > 0)) return; var n = norm(it), L = fromM(v); it.x2 = r1(it.x1 + n.dx * L); it.y2 = r1(it.y1 + n.dy * L); });
    liveEdit("skp-ah", function (it, el) { it.ah = +el.value; });
    liveEdit("skp-hsc", function (it, el) { it.ps = +el.value; });
    liveEdit("skp-bold", function (it, el) { it.bold = el.checked; });
    liveEdit("skp-kind", function (it, el) { it.kind = el.value; });
    liveEdit("skp-pat", function (it, el) { it.pat = el.value; });
    liveEdit("skp-outline", function (it, el) { it.outline = el.checked; });
    liveEdit("skp-box", function (it, el) { it.nobox = !el.checked; });
    var op = $("skp-op");
    if (op) { op.addEventListener("pointerdown", begin); op.addEventListener("focus", begin); op.addEventListener("input", function () { var im = imgById(sel.id); im.op = +op.value; updImg(im); }); op.addEventListener("change", commit); }
  }).observe(propsEl, { childList: true });
  propsEl.addEventListener("click", function (e) {
    var b = e.target.closest("[data-act]"); if (!b || !sel) return; var a = b.dataset.act;
    if (/^o-/.test(a)) { orderSel(a.slice(2)); return; }
    if (a === "mklabel") { var it0 = byId(sel.id); if (!it0) return; var ar = areaOf(it0), c0 = centroidOf(it0); var tl = addItem(base("text", { x: r1(c0.x - 30), y: r1(c0.y - 9), text: fmtArea(ar), size: Math.max(style.fs, 12), mask: true })); selectItem(tl); return; }
    if (sel.k === "img") {
      var im = imgById(sel.id); if (!im) return; begin();
      if (a === "irot90") im.rot = ((im.rot || 0) + 90) % 360; else if (a === "ireset") im.rot = 0; else if (a === "del") { doc().under = doc().under.filter(function (x) { return x.id !== im.id; }); sel = null; }
      commit(); renderProps(); return;
    }
    if (isSet()) {
      var gl = selList(), ids = gl.map(function (x) { return x.id; });
      if (a === "dup") { syncLeaders(); paste(clone(gl), GRID); return; }
      begin();
      if (a === "ungroup") { gl.forEach(function (x) { delete x.g; }); sel = { k: "multi", ids: ids }; }
      else if (a === "group") { var ng = newId("g"); gl.forEach(function (x) { x.g = ng; }); sel = { k: "group", g: ng }; }
      else if (a === "glock") gl.forEach(function (x) { x.lock = true; });
      else if (a === "gunlock") gl.forEach(function (x) { x.lock = false; });
      else if (a === "gdel") { deleteSel(); }
      commit(); renderProps(); return;
    }
    var it = byId(sel.id); if (!it) return;
    if (a === "dup") { syncLeaders(); paste([clone(it)], GRID); return; }
    begin();
    if (a === "rot") it[it.type === "pload" ? "ang" : "rot"] = (((it.type === "pload" ? (it.ang == null ? 90 : it.ang) : (it.rot || 0)) + ROT_TYPES[it.type]) % 360);
    else if (a === "flip") { if (it.type === "udl" || it.type === "section" || it.type === "slope") it.side = it.side === -1 ? 1 : -1; else it.o = -(it.o == null ? 30 : it.o); }
    else if (a === "dir") it.dir = it.dir === "ccw" ? "cw" : "ccw";
    else if (a === "detach") it.att = null;
    else if (a === "lock") it.lock = true;
    else if (a === "unlock") it.lock = false;
    else if (a === "del") { removeItem(it.id); sel = null; }
    commit(); renderProps();
  });

  /* ---------- Title block editing in place ---------- */
  var tbEdit = $("sk-tb-edit"), tbKey = null;
  function openTB(key) {
    var cell = gFrame.querySelector('[data-tb="' + key + '"] rect'); if (!cell) return;
    var r = cell.getBoundingClientRect(), sr = stage.getBoundingClientRect();
    tbKey = key; tbEdit.hidden = false;
    tbEdit.style.left = (r.left - sr.left) + "px"; tbEdit.style.top = (r.top - sr.top) + "px"; tbEdit.style.width = r.width + "px"; tbEdit.style.height = r.height + "px";
    tbEdit.value = tbGet(key); tbEdit.placeholder = { project: "Project name", title: "Sketch title", ref: "e.g. SK-01", date: "e.g. " + today(), scale: "e.g. NTS or 1:100 at A3", note: "Disclaimer, e.g. NOT TO SCALE" }[key] || "";
    tbEdit.style.fontSize = Math.max(12, Math.min(15, r.height * 0.45)) + "px";
    begin(); tbEdit.focus({ preventScroll: true }); tbEdit.select();
  }
  function closeTB(keep) {
    if (!tbKey) return; var key = tbKey; tbKey = null; tbEdit.hidden = true;
    if (keep) tbSet(key, tbEdit.value.trim());
    commit();
  }
  tbEdit.addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); closeTB(true); } else if (e.key === "Escape") { e.preventDefault(); closeTB(false); } else if (e.key === "Tab") { e.preventDefault(); var order = Array.prototype.map.call(gFrame.querySelectorAll("[data-tb]"), function (g) { return g.dataset.tb; }), nx = order[(order.indexOf(tbKey) + (e.shiftKey ? order.length - 1 : 1)) % order.length]; closeTB(true); openTB(nx); } });
  tbEdit.addEventListener("blur", function () { closeTB(true); });

  /* ---------- Pointer handling ---------- */
  function world(e) { var pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY; var m = svg.getScreenCTM(); if (!m) return { x: 0, y: 0 }; var q = pt.matrixTransform(m.inverse()); return { x: q.x, y: q.y }; }
  function itemAt(e, skip) {
    var els = document.elementsFromPoint(e.clientX, e.clientY);
    for (var i = 0; i < els.length; i++) { var g = els[i].closest && els[i].closest("[data-id]"); if (g && svg.contains(g) && g.dataset.id !== skip) return byId(g.dataset.id); }
    return null;
  }
  /* Items lying wholly inside a dragged box; locked items are left out. */
  function inBox(a, b) {
    var x1 = Math.min(a.x, b.x), y1 = Math.min(a.y, b.y), x2 = Math.max(a.x, b.x), y2 = Math.max(a.y, b.y);
    if (!doc().showDraw) return [];
    return doc().items.filter(function (it) {
      if (locked(it)) return false;
      var el = gContent.querySelector('[data-id="' + it.id + '"] .v'); if (!el) return false;
      try { var bb = el.getBBox(); return bb.x >= x1 && bb.y >= y1 && bb.x + bb.width <= x2 && bb.y + bb.height <= y2; } catch (er) { return false; }
    });
  }
  function deleteSel() { var l = selList().filter(function (x) { return !locked(x); }), ids = l.map(function (x) { return x.id; }); syncLeaders(); doc().items = doc().items.filter(function (x) { return ids.indexOf(x.id) < 0; }); sel = null; }
  function selectItem(it) { sel = it ? { k: "item", id: it.id } : null; renderContent(); renderProps(); }
  function base(type, extra) { var o = { id: newId(), type: type, c: style.c }; if (/^(leader|pload|udl|moment|dim)$/.test(type)) o.fs = style.fs; if (type === "hatch" && style.hsc && style.hsc !== 1) o.ps = style.hsc; for (var p in extra) o[p] = extra[p]; return o; }
  function addItem(it) { begin(); doc().items.push(it); commit(); return it; }
  function constrain(a, p) { var dx = p.x - a.x, dy = p.y - a.y, ang = Math.round(Math.atan2(dy, dx) / (Math.PI / 4)) * (Math.PI / 4), L = Math.hypot(dx, dy); return { x: r1(a.x + Math.cos(ang) * L), y: r1(a.y + Math.sin(ang) * L) }; }
  function nextSectionLetter() { var used = doc().items.filter(function (x) { return x.type === "section"; }).map(function (x) { return x.label; }), L = "ABCDEFGHJKLMNPQRSTUVWXYZ"; for (var i = 0; i < L.length; i++) if (used.indexOf(L[i]) < 0) return L[i]; return "A"; }
  function finishPoly() { if (!pend) return; var pts = pend.pts; pend = null; renderLive(); if (pts.length >= 3) selectAfterCreate(addItem(base("poly", { pts: pts, w: style.w, ls: style.ls }))); }
  function finishHatch() {
    if (!pend) return; var pts = pend.pts; pend = null; renderLive();
    if (pts.length >= 3) { var it = addItem(base("hatch", { pts: pts, pat: style.pat, outline: true, w: Math.min(style.w, 4), ls: style.ls })); selectAfterCreate(it); }
  }
  function selectAfterCreate(it) { sel = { k: "item", id: it.id }; renderContent(); renderProps(); }

  svg.addEventListener("pointerdown", function (e) {
    if (e.button !== 0) return;
    measureK();
    var p = world(e), d = doc(), t = tool[mode];
    if (mapMode && d.map) { e.preventDefault(); try { svg.setPointerCapture(e.pointerId); } catch (er) {} if (mapMode === "catch") { setMapMode("catch"); findCatchment(p); return; } drag = mapMode === "pan" ? { type: "mappan", start: p, e0: d.map.e, n0: d.map.n } : mapMode === "sect" ? { type: "mapsect", start: p } : { type: "mapbox", start: p }; return; }
    var tbc = e.target.closest("[data-tb]"); if (tbc && !pend) { e.preventDefault(); openTB(tbc.dataset.tb); return; }
    if (tbKey) closeTB(true);
    try { svg.setPointerCapture(e.pointerId); } catch (er) {}
    e.preventDefault();
    var h = e.target.closest("[data-h]");
    if (h && /^xs\d$/.test(h.dataset.h) && sel && xbox) { begin(); var ci = +h.dataset.h[2], cx0 = ci === 0 || ci === 3 ? xbox.x2 : xbox.x1, cy0 = ci < 2 ? xbox.y2 : xbox.y1; drag = { type: "xs", orig: clone(selList()), ax: cx0, ay: cy0, cx: ci === 0 || ci === 3 ? xbox.x1 : xbox.x2, cy: ci < 2 ? xbox.y1 : xbox.y2 }; return; }
    if (h && h.dataset.h !== "first" && sel) {
      begin();
      if (sel.k === "img") { var im = imgById(sel.id); drag = { type: "ih", h: h.dataset.h, orig: clone(im), d0: Math.hypot(p.x - im.x, p.y - im.y) || 1 }; }
      else drag = { type: "h", h: h.dataset.h, orig: clone(byId(sel.id)) };
      return;
    }
    if (t === "select" || t === "xform") {
      var g = e.target.closest("[data-id]"), u = e.target.closest("[data-uid]");
      var add = e.shiftKey || e.ctrlKey || e.metaKey;
      if (g && d.showDraw && add) { /* Shift or Ctrl click adds or removes an item (or its whole group) */
        var ti = byId(g.dataset.id); if (locked(ti) && !locked(selList()[0])) { status("That item is locked."); return; }
        var unit = ti.g ? groupItems(ti.g) : [ti], curL = selList(), inSel = unit.every(function (x) { return curL.indexOf(x) > -1; });
        setSel(inSel ? curL.filter(function (x) { return unit.indexOf(x) < 0; }) : curL.concat(unit)); return;
      }
      if (g && d.showDraw && sel && sel.k === "multi" && sel.ids.indexOf(g.dataset.id) > -1) {
        var ml = selList(); if (!ml.some(locked)) { begin(); drag = { type: "gmove", orig: clone(ml), start: p }; } return;
      }
      if (g && d.showDraw) {
        var it = byId(g.dataset.id), cur = sel && sel.k === "item" ? byId(sel.id) : null;
        if (it.g && !(sel && sel.k === "group" && sel.g === it.g) && !(cur && cur.g === it.g)) {
          sel = { k: "group", g: it.g }; renderContent(); renderProps();
          var gl = groupItems(it.g); if (!gl.some(locked)) { begin(); drag = { type: "gmove", orig: clone(gl), start: p }; }
          return;
        }
        selectItem(it); if (!locked(it)) { begin(); drag = { type: "move", orig: clone(it), start: p }; } return;
      }
      if (!u || add) { if (!add) { sel = null; renderContent(); renderProps(); } drag = { type: "marquee", start: p, add: add, base: add ? selList() : [] }; return; }
      if (u && d.showUnder && !d.lockUnder) { sel = { k: "img", id: u.dataset.uid }; renderUI(); renderProps(); begin(); drag = { type: "imove", orig: clone(imgById(u.dataset.uid)), start: p }; return; }
      selectItem(null); return;
    }
    if (!d.showDraw) { status("The drawing layer is hidden. Tick \"Drawing\" under Layers to draw."); return; }
    status("");
    if (t === "pen") { drag = { type: "pen", item: base("stroke", { pts: [[r1(p.x), r1(p.y)]], w: style.w, ls: style.ls }) }; drag.el = document.createElementNS(NS, "g"); gLive.appendChild(drag.el); drag.el.innerHTML = draw(drag.item); return; }
    if (t === "eraser") { begin(); drag = { type: "erase" }; eraseAt(e); return; }
    if (t === "inset") { drag = { type: "inset0", start: p }; return; }
    if (t === "hatch") {
      var sp = snapPt(p);
      if (pend) {
        if (pend.pts.length >= 3 && dist(sp, { x: pend.pts[0][0], y: pend.pts[0][1] }) < 14 * Math.max(k, 1)) { finishHatch(); return; }
        var last = pend.pts[pend.pts.length - 1]; if (dist(sp, { x: last[0], y: last[1] }) > 2) pend.pts.push([sp.x, sp.y]); renderLive(); return;
      }
      drag = { type: "hatch0", start: sp, raw: { x: p.x, y: p.y } }; return;
    }
    if (t === "poly") {
      var pp = snapPt(p);
      if (pend && pend.poly) {
        if (pend.pts.length >= 3 && dist(pp, { x: pend.pts[0][0], y: pend.pts[0][1] }) < 14 * Math.max(k, 1)) { finishPoly(); return; }
        var lp = pend.pts[pend.pts.length - 1]; if (dist(pp, { x: lp[0], y: lp[1] }) > 2) pend.pts.push([pp.x, pp.y]); renderLive(); return;
      }
      pend = { pts: [[pp.x, pp.y]], cur: pp, poly: true }; renderLive(); return;
    }
    if (t === "north" || t === "wl") { var qn = snapPt(p, { free: t === "wl" ? false : true }); var sn = addItem(base(t, t === "north" ? { x: qn.x, y: qn.y, rot: 0, s: 1 } : { x: qn.x, y: qn.y, s: 1, label: "WL ___ m AOD" })); selectAfterCreate(sn); if (t === "wl") setTimeout(function () { var el = $("skp-label"); if (el) { el.focus({ preventScroll: true }); el.select(); } }, 0); else { begin(); drag = { type: "move", orig: clone(sn), start: p }; } return; }
    if (DRAG2[t]) {
      var a = snapPt(p), ex = { x1: a.x, y1: a.y, x2: a.x, y2: a.y };
      if (t !== "udl" && t !== "dim" && t !== "section" && t !== "slope") { ex.w = t === "member" ? Math.max(style.w, 4) : t === "brk" || t === "cloud" ? Math.min(style.w, 2) : style.w; ex.ls = style.ls; }
      if (t === "udl") ex.label = "10 kN/m";
      if (t === "section") ex.label = nextSectionLetter();
      drag = { type: "seg", temp: base(t, ex), a: a }; renderLive(); return;
    }
    if (t === "pin" || t === "roller" || t === "fixed") { var q = snapPt(p); var s = addItem(base("support", { kind: t, x: q.x, y: q.y, rot: t === "fixed" ? 90 : 0 })); selectAfterCreate(s); begin(); drag = { type: "move", orig: clone(s), start: p }; return; }
    if (t === "pload" || t === "moment") { var q2 = snapPt(p); var s2 = addItem(base(t, t === "pload" ? { x: q2.x, y: q2.y, ang: 90, label: "20 kN" } : { x: q2.x, y: q2.y, dir: "cw", label: "15 kNm" })); selectAfterCreate(s2); begin(); drag = { type: "move", orig: clone(s2), start: p }; return; }
    if (t === "text") { var q3 = snapPt(p, { free: true }); var s3 = addItem(base("text", { x: q3.x, y: q3.y, text: "Text", size: Math.max(style.fs, 12) })); selectAfterCreate(s3); focusText(); return; }
    if (t === "leader") {
      var target = itemAt(e), ap = target ? { x: r1(p.x), y: r1(p.y) } : snapPt(p);
      var ld = base("leader", { ax: ap.x, ay: ap.y, bx: r1(ap.x + 90), by: r1(ap.y - 70), text: "Note", att: makeAttach(target, ap) });
      drag = { type: "leader", temp: ld, start: p }; renderLive(); return;
    }
  });
  var SNAP_TOOLS = { line: 1, arrow: 1, rect: 1, circle: 1, poly: 1, member: 1, dim: 1, udl: 1, section: 1, brk: 1, slope: 1, cloud: 1, pin: 1, roller: 1, fixed: 1, pload: 1, moment: 1, wl: 1, hatch: 1, leader: 1 };
  /* while drawing to scale, the status line reads out the true length */
  function lenStatus(a, b, type) {
    if (!measured() || !a) return; var A = a.x != null ? a : { x: a[0], y: a[1] }, dx = b.x - A.x, dy = b.y - A.y;
    if (type === "rect" || type === "cloud") status("Width " + fmtM(toM(Math.abs(dx))) + " × height " + fmtM(toM(Math.abs(dy))));
    else if (type === "circle") status("Radius " + fmtM(toM(Math.hypot(dx, dy))));
    else status("Length " + fmtM(toM(Math.hypot(dx, dy))) + ", angle " + Math.round(((-Math.atan2(dy, dx) * 180 / Math.PI) + 360) % 360) + "°");
  }
  function focusText() { setTimeout(function () { var el = $("skp-text"); if (el) { el.focus({ preventScroll: true }); el.select(); } }, 0); }
  function eraseAt(e) {
    var it = itemAt(e); if (!it || locked(it)) { if ($("sk-erm").value === "part") partErase(world(e)); return; }
    if ($("sk-erm").value === "part" && /^(stroke|line|member|arrow)$/.test(it.type)) { partErase(world(e)); return; }
    removeItem(it.id); renderContent();
  }
  /* Rub out just the bit of a line or pen stroke under the eraser, splitting it in two if need be. */
  function partErase(p) {
    var R = 8 * Math.max(k, 1), items = doc().items, changed = false, out = [];
    items.forEach(function (it) {
      if (locked(it) || !/^(stroke|line|member|arrow)$/.test(it.type)) { out.push(it); return; }
      var pts = it.type === "stroke" ? it.pts : [[it.x1, it.y1], [it.x2, it.y2]], dense = [], i;
      for (i = 0; i < pts.length; i++) {
        var a = pts[i], b = pts[i + 1]; dense.push(a); if (!b) break;
        var L = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.floor(L / 2);
        for (var j = 1; j < n; j++) dense.push([r1(a[0] + (b[0] - a[0]) * j / n), r1(a[1] + (b[1] - a[1]) * j / n)]);
      }
      if (!dense.some(function (q) { return Math.hypot(q[0] - p.x, q[1] - p.y) < R; })) { out.push(it); return; }
      changed = true;
      var runs = [], cur = [];
      dense.forEach(function (q) { if (Math.hypot(q[0] - p.x, q[1] - p.y) < R) { if (cur.length) runs.push(cur); cur = []; } else cur.push(q); });
      if (cur.length) runs.push(cur);
      runs = runs.filter(function (r) { return r.length > 1 && Math.hypot(r[r.length - 1][0] - r[0][0], r[r.length - 1][1] - r[0][1]) > 3; });
      runs.forEach(function (r, ri) {
        var n2 = clone(it); if (ri) n2.id = newId();
        if (it.type === "stroke") { n2.pts = r.filter(function (q, qi) { return qi === 0 || qi === r.length - 1 || qi % 2 === 0; }); }
        else {
          n2.x1 = r[0][0]; n2.y1 = r[0][1]; n2.x2 = r[r.length - 1][0]; n2.y2 = r[r.length - 1][1];
          /* an arrow keeps its head only on the piece that still reaches the tip */
          if (it.type === "arrow" && Math.hypot(n2.x2 - it.x2, n2.y2 - it.y2) > 1) { n2.type = "line"; delete n2.ah; }
        }
        out.push(n2);
      });
    });
    if (changed) { doc().items = out; syncLeaders(); renderContent(); }
  }

  window.addEventListener("pointermove", function (e) {
    if (pend && !drag) { var sp = snapPt(world(e)); pend.cur = sp; renderLive(); lenStatus(pend.pts[pend.pts.length - 1], sp); return; }
    if (!drag) { if (e.target.closest && e.target.closest("#sk-svg") && SNAP_TOOLS[tool[mode]]) snapPt(world(e)); else if (snapHit) { snapHit = null; showSnap(); } return; }
    var p = world(e), it;
    switch (drag.type) {
      case "pen":
        var evs = e.getCoalescedEvents ? e.getCoalescedEvents() : [e]; if (!evs.length) evs = [e];
        evs.forEach(function (ev) { var q = world(ev), l = drag.item.pts[drag.item.pts.length - 1]; if (Math.hypot(q.x - l[0], q.y - l[1]) > 1.5 * Math.max(k, 0.5)) drag.item.pts.push([r1(q.x), r1(q.y)]); });
        drag.el.innerHTML = draw(drag.item); return;
      case "erase": eraseAt(e); return;
      case "seg":
        var b = snapPt(p); if (e.shiftKey) b = constrain(drag.a, b);
        drag.temp.x2 = b.x; drag.temp.y2 = b.y; renderLive(); lenStatus(drag.a, b, drag.temp.type); return;
      case "hatch0": if (dist(p, drag.start) > 8 * Math.max(k, 1)) drag.type = "hatchR";
      /* falls through */
      case "hatchR":
        if (drag.type !== "hatchR") return;
        var c = snapPt(p), s = drag.start; drag.temp = base("hatch", { pts: [[s.x, s.y], [c.x, s.y], [c.x, c.y], [s.x, c.y]], pat: style.pat, outline: true, w: Math.min(style.w, 4), ls: style.ls }); renderLive(); return;
      case "leader": if (dist(p, drag.start) > 10) { drag.temp.bx = r1(p.x); drag.temp.by = r1(p.y); drag.moved = true; } renderLive(); return;
      case "marquee": drag.cur = p; var m0 = drag.start, wq = Math.abs(p.x - m0.x), hq = Math.abs(p.y - m0.y);
        gLive.innerHTML = '<rect x="' + r1(Math.min(p.x, m0.x)) + '" y="' + r1(Math.min(p.y, m0.y)) + '" width="' + r1(wq) + '" height="' + r1(hq) + '" class="sk-marq" fill="rgba(11,79,108,0.06)" stroke="#0b4f6c" stroke-width="1" stroke-dasharray="5 4" vector-effect="non-scaling-stroke"/>'; return;
      case "gmove":
        var gdx = snapDelta(p.x - drag.start.x), gdy = snapDelta(p.y - drag.start.y); drag.orig.forEach(function (o) { replaceItem(shifted(o, gdx, gdy)); }); renderContent(); return;
      case "move":
        var n = shifted(drag.orig, snapDelta(p.x - drag.start.x), snapDelta(p.y - drag.start.y)); replaceItem(n); renderContent(); return;
      case "h":
        it = clone(drag.orig); var hh = drag.h;
        if (hh === "p1" || hh === "p2") { var q = snapPt(p, { skip: it.id }); var other = hh === "p1" ? { x: it.x2, y: it.y2 } : { x: it.x1, y: it.y1 }; if (e.shiftKey) q = constrain(other, q); it[hh === "p1" ? "x1" : "x2"] = q.x; it[hh === "p1" ? "y1" : "y2"] = q.y; }
        else if (hh === "off") { var nn = norm(it); it.o = r1((p.x - it.x1) * nn.nx + (p.y - it.y1) * nn.ny); }
        else if (hh === "anc") { var tg = itemAt(e, it.id); it.att = makeAttach(tg, p); var ap = tg ? p : snapPt(p); it.ax = r1(ap.x); it.ay = r1(ap.y); if (!tg) it.att = null; }
        else if (hh === "isz" && it.type === "inset") { it.w = r1(Math.max(40, p.x - it.x)); it.h = r1(Math.max(40, p.y - it.y)); }
        else if (hh === "nrot") { var na = Math.atan2(p.x - it.x, -(p.y - it.y)) * 180 / Math.PI, nst = e.shiftKey ? 15 : 1; it.rot = ((Math.round(na / nst) * nst) % 360 + 360) % 360; status("North arrow at " + it.rot + "°" + (e.shiftKey ? "" : ". Hold Shift to step by 15°.")); }
        else if (hh === "isrc") { it.sx = r1(p.x); it.sy = r1(p.y); }
        else if (hh === "isz") { var ar0 = drag.orig.h / drag.orig.w, nw = Math.max(10, p.x - it.x); it.w = r1(nw); it.h = r1(e.shiftKey ? Math.max(10, p.y - it.y) : nw * ar0); }
        else if (hh[0] === "v") { var qv = snapPt(p); it.pts[+hh.slice(1)] = [qv.x, qv.y]; }
        replaceItem(it); renderContent(); return;
      case "xs":
        var fx = (p.x - drag.ax) / ((drag.cx - drag.ax) || 1), fy = (p.y - drag.ay) / ((drag.cy - drag.ay) || 1);
        if (!e.shiftKey) { var uf = Math.max(0.05, (fx + fy) / 2); fx = fy = uf; } else { fx = Math.max(0.05, fx); fy = Math.max(0.05, fy); }
        drag.orig.forEach(function (o) { replaceItem(scaleItem(o, drag.ax, drag.ay, fx, fy)); }); renderContent(); status("Scale ×" + (+fx.toFixed(2)) + (fx !== fy ? " by ×" + (+fy.toFixed(2)) : "")); return;
      case "mappan": mapPanning = true; var mf = mapFrame(), mpm = doc().map; mpm.e = Math.round(drag.e0 - (p.x - drag.start.x) * mf.mu); mpm.n = Math.round(drag.n0 + (p.y - drag.start.y) * mf.mu); renderAll(); return;
      case "inset0": case "mapsect":
        drag.cur = p; gLive.innerHTML = drag.type === "inset0" ? '<rect x="' + r1(Math.min(p.x, drag.start.x)) + '" y="' + r1(Math.min(p.y, drag.start.y)) + '" width="' + r1(Math.abs(p.x - drag.start.x)) + '" height="' + r1(Math.abs(p.y - drag.start.y)) + '" fill="rgba(11,79,108,0.06)" stroke="#0b4f6c" stroke-dasharray="6 4" vector-effect="non-scaling-stroke"/>' : ln(drag.start.x, drag.start.y, p.x, p.y, "#b84a32", 2, "dashed");
        if (drag.type === "mapsect") status("Section " + fmtM(toM(dist(drag.start, p))) + " long. Let go to draw it.");
        return;
      case "mapbox": drag.cur = p; gLive.innerHTML = '<rect x="' + r1(Math.min(p.x, drag.start.x)) + '" y="' + r1(Math.min(p.y, drag.start.y)) + '" width="' + r1(Math.abs(p.x - drag.start.x)) + '" height="' + r1(Math.abs(p.y - drag.start.y)) + '" fill="rgba(11,79,108,0.06)" stroke="#0b4f6c" stroke-dasharray="6 4" vector-effect="non-scaling-stroke"/>'; return;
      case "imove": var im = imgById(drag.orig.id); im.x = r1(drag.orig.x + p.x - drag.start.x); im.y = r1(drag.orig.y + p.y - drag.start.y); updImg(im); renderUI(); return;
      case "ih":
        var im2 = imgById(sel.id), o = drag.orig;
        if (drag.h === "isc") {
          /* scale about the top-left corner so that corner stays put */
          var ra = (o.rot || 0) * Math.PI / 180, rc = Math.cos(ra), rs = Math.sin(ra), tlx = o.x - (o.w / 2) * rc + (o.h / 2) * rs, tly = o.y - (o.w / 2) * rs - (o.h / 2) * rc;
          var f = Math.max(0.05, Math.hypot(p.x - tlx, p.y - tly) / Math.hypot(o.w, o.h)); im2.w = o.w * f; im2.h = o.h * f;
          im2.x = r1(tlx + (im2.w / 2) * rc - (im2.h / 2) * rs); im2.y = r1(tly + (im2.w / 2) * rs + (im2.h / 2) * rc);
        }
        else { var ang = Math.atan2(p.y - o.y, p.x - o.x) * 180 / Math.PI + 90; if (e.shiftKey) ang = Math.round(ang / 15) * 15; im2.rot = r1(((ang % 360) + 360) % 360); }
        updImg(im2); renderUI(); return;
    }
  });
  window.addEventListener("pointerup", function () {
    if (snapHit) { snapHit = null; showSnap(); }
    if (!drag) return; var d = drag; drag = null;
    switch (d.type) {
      case "pen": d.el.remove(); addItem(d.item); return;
      case "mappan": mapPanning = false; mapKeyV = ""; renderAll(); persist(); afterMapMove(); mapStatus("Map moved to " + doc().map.e + ", " + doc().map.n + "."); return;
      case "inset0": gLive.innerHTML = ""; if (d.cur) makeInset(d.start, d.cur); return;
      case "mapsect": gLive.innerHTML = ""; setMapMode("sect"); if (d.cur && dist(d.cur, d.start) > 20) { var sa = d.start, sb = d.cur; getFine(function (g) { makeSection(sa, sb, g); }); } else mapStatus("Drag a line across the map for the section."); return;
      case "mapbox": gLive.innerHTML = ""; if (d.cur && Math.abs(d.cur.x - d.start.x) > 20 && Math.abs(d.cur.y - d.start.y) > 20) { doc().map.box = [r1(d.start.x), r1(d.start.y), r1(d.cur.x), r1(d.cur.y)]; persist(); renderAll(); afterMapMove(); } setMapMode("box"); return;
      case "marquee": gLive.innerHTML = ""; if (d.cur && Math.abs(d.cur.x - d.start.x) + Math.abs(d.cur.y - d.start.y) > 4) setSel(d.base.concat(inBox(d.start, d.cur))); else if (!d.add) setSel([]); return;
      case "seg": renderLive(); if (Math.hypot(d.temp.x2 - d.temp.x1, d.temp.y2 - d.temp.y1) < 6) return; var it = addItem(d.temp); if (it.type !== "line") selectAfterCreate(it); if (it.type === "udl" || it.type === "dim") setTimeout(function () { var el = $("skp-label"); if (el) el.focus({ preventScroll: true }); }, 0); return;
      case "hatch0":
        if (hatchBy === "pick") { pickHatch(d.raw || d.start); return; }
        pend = { pts: [[d.start.x, d.start.y]], cur: d.start }; renderLive(); return;
      case "hatchR": renderLive(); var w = Math.abs(d.temp.pts[2][0] - d.temp.pts[0][0]), h = Math.abs(d.temp.pts[2][1] - d.temp.pts[0][1]); if (w > 4 && h > 4) selectAfterCreate(addItem(d.temp)); return;
      case "leader": renderLive(); selectAfterCreate(addItem(d.temp)); focusText(); return;
      default: commit(); renderProps();
    }
  });
  window.addEventListener("pointercancel", function () { if (drag && drag.el) drag.el.remove(); drag = null; renderLive(); if (before !== null) commit(); });
  svg.addEventListener("dblclick", function (e) {
    if (pend) { e.preventDefault(); if (pend.poly) finishPoly(); else finishHatch(); return; }
    var g = e.target.closest("[data-id]"); if (g) { var it = byId(g.dataset.id); if (it && (it.type === "text" || it.type === "leader") && !locked(it)) { selectItem(it); focusText(); } }
  });

  document.addEventListener("keydown", function (e) {
    if (view.hidden) return;
    var tag = (e.target.tagName || "").toLowerCase(); if (tag === "input" || tag === "textarea" || tag === "select") return;
    var mod = e.ctrlKey || e.metaKey;
    if (mod && e.key.toLowerCase() === "z") { e.preventDefault(); if (e.shiftKey) redo(); else undo(); return; }
    if (mod && e.key.toLowerCase() === "y") { e.preventDefault(); redo(); return; }
    if (e.key === "Enter" && pend) { e.preventDefault(); if (pend.poly) finishPoly(); else finishHatch(); return; }
    if ((e.key === "f" || e.key === "F") && !mod && !e.altKey) { e.preventDefault(); setFull(!isFull()); return; }
    if (e.key === "Escape" && app.classList.contains("sk-full") && !pend && !sel) { setFull(false); return; }
    if (e.key === "Escape" && mapMode) { setMapMode(mapMode); mapStatus(""); return; }
    if (e.key === "Escape") { if (pend) { pend = null; renderLive(); } else selectItem(null); return; }
    if (mod && e.key.toLowerCase() === "a") { e.preventDefault(); if (!doc().showDraw) return; setTool("select"); setSel(doc().items.filter(function (x) { return !locked(x); })); return; }
    if (mod && e.key.toLowerCase() === "c") { if (copySel()) e.preventDefault(); return; }
    if (mod && e.key.toLowerCase() === "x") { if (copySel()) { e.preventDefault(); begin(); deleteSel(); commit(); renderProps(); } return; }
    if (mod && e.key.toLowerCase() === "v") return; /* handled by the paste event, which can also carry a screenshot */
    if (mod && (e.key === "]" || e.key === "[")) { e.preventDefault(); orderSel(e.key === "]" ? (e.shiftKey ? "front" : "fwd") : (e.shiftKey ? "back" : "bwd")); return; }
    if (mod && e.key.toLowerCase() === "d") { var dl = selList(); if (dl.length) { e.preventDefault(); syncLeaders(); paste(clone(dl), GRID); } return; }
    if (sel && sel.k !== "img" && /^Arrow/.test(e.key)) { /* nudge the selection */
      var nl = selList(); if (!nl.length || nl.some(locked)) return; e.preventDefault();
      var st = (e.shiftKey ? 5 : 1) * (mode === "struct" && doc().snap ? GRID : 4), ddx = e.key === "ArrowLeft" ? -st : e.key === "ArrowRight" ? st : 0, ddy = e.key === "ArrowUp" ? -st : e.key === "ArrowDown" ? st : 0;
      begin(); nl.forEach(function (o) { replaceItem(shifted(o, ddx, ddy)); }); commit(); return;
    }
    if ((e.key === "Delete" || e.key === "Backspace") && sel) {
      e.preventDefault(); begin();
      if (sel.k === "img") { if (!doc().lockUnder) doc().under = doc().under.filter(function (x) { return x.id !== sel.id; }); sel = null; }
      else deleteSel();
      commit(); renderProps();
    }
  });

  /* ---------- Image underlay ---------- */
  function addImageFile(file, asItem) {
    if (!file || !/^image\//.test(file.type)) { status("That file isn't an image."); return; }
    var fr = new FileReader();
    fr.onload = function () {
      var img = new Image();
      img.onload = function () {
        var max = 1600, sc = Math.min(1, max / Math.max(img.width, img.height)), cw = Math.round(img.width * sc), ch = Math.round(img.height * sc);
        var cv = document.createElement("canvas"); cv.width = cw; cv.height = ch; var cx = cv.getContext("2d"); cx.fillStyle = "#fff"; cx.fillRect(0, 0, cw, ch); cx.drawImage(img, 0, 0, cw, ch);
        var src = cv.toDataURL("image/jpeg", 0.85), G = geo(), f;
        if (asItem) { /* a picture or screenshot placed on the drawing like any other item */
          if (/png/.test(file.type) && cw * ch < 1.2e6) { var png = cv.toDataURL("image/png"); if (png.length < src.length * 1.6) src = png; }
          f = Math.min(G.inner.w * 0.45 / cw, G.inner.h * 0.45 / ch);
          var ni = base("image", { src: src, x: r1(G.inner.x + G.inner.w / 2 - cw * f / 2), y: r1(G.inner.y + G.inner.h / 2 - ch * f / 2), w: r1(cw * f), h: r1(ch * f) });
          addItem(ni); setTool("select"); selectItem(ni); status("Image added to the drawing. Drag to move it and the square handle to resize (Shift to stretch). It stays in this browser."); return;
        }
        f = Math.min(G.inner.w * 0.8 / cw, G.inner.h * 0.8 / ch);
        var im = { id: newId("u"), src: src, x: r1(G.inner.x + G.inner.w / 2), y: r1(G.inner.y + G.inner.h / 2), w: r1(cw * f), h: r1(ch * f), rot: 0, op: 0.5 };
        begin(); doc().under.push(im); doc().showUnder = true; doc().lockUnder = false; commit();
        setTool("select"); sel = { k: "img", id: im.id }; renderUI(); renderProps();
        status("Image added behind the drawing. It stays in this browser and isn't uploaded.");
      };
      img.onerror = function () { status("Couldn't read that image."); };
      img.src = fr.result;
    };
    fr.readAsDataURL(file);
  }
  $("sk-img-btn").addEventListener("click", function () { $("sk-img").click(); });
  $("sk-img").addEventListener("change", function () { if (this.files[0]) addImageFile(this.files[0]); this.value = ""; });
  $("sk-img2").addEventListener("change", function () { if (this.files[0]) addImageFile(this.files[0], true); this.value = ""; });
  /* paste: a copied screenshot or picture becomes an image item; otherwise items copied in the sketch pad */
  document.addEventListener("paste", function (e) {
    if (view.hidden) return; var tag = (e.target.tagName || "").toLowerCase(); if (tag === "input" || tag === "textarea") return;
    var fl = e.clipboardData && Array.prototype.filter.call(e.clipboardData.items || [], function (x) { return x.kind === "file" && /^image\//.test(x.type); })[0];
    if (fl) { e.preventDefault(); addImageFile(fl.getAsFile(), true); return; }
    if (clip) { e.preventDefault(); pasteN++; paste(clip, GRID * pasteN); }
  });
  stage.addEventListener("dragover", function (e) { if (e.dataTransfer && Array.prototype.indexOf.call(e.dataTransfer.types, "Files") > -1) { e.preventDefault(); $("sk-drop").hidden = false; } });
  stage.addEventListener("dragleave", function (e) { if (!stage.contains(e.relatedTarget)) $("sk-drop").hidden = true; });
  stage.addEventListener("drop", function (e) { e.preventDefault(); $("sk-drop").hidden = true; var f = e.dataTransfer.files[0]; if (f) addImageFile(f); });

  /* ---------- Export ---------- */
  function exportSvg() {
    var d = doc(), G = geo(), c = contentStr(true);
    return '<svg xmlns="' + NS + '" xmlns:xlink="http://www.w3.org/1999/xlink" width="' + G.W + '" height="' + G.H + '" viewBox="0 0 ' + G.W + " " + G.H + '">' +
      "<defs>" + (d.grid ? gridDefs() : "") + c.defs + "</defs>" + '<rect width="' + G.W + '" height="' + G.H + '" fill="#fff"/>' +
      '<g id="sk-mapg">' + mapStr(true) + "</g>" + (d.showUnder ? underStr() : "") + (d.grid ? gridStr() : "") + (d.showDraw ? c.s : "") + frameStr(true) + "</svg>";
  }
  function onSheet(i, fn) { var keep = S.cur; S.cur = i; try { return fn(); } finally { S.cur = keep; } }
  function fname(ext, all) { var t = doc().tb, s = all ? (t.project || "sketches") : [t.ref, t.title].filter(Boolean).join(" "); s = s.replace(/[^\w\- ]+/g, "").trim().replace(/\s+/g, "-"); return (s || "sketch") + "." + ext; }
  function download(blob, name) { var a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(a.href); }, 4000); }
  /* Draws an exported sheet onto a canvas at the given scale, then hands back a blob of the chosen type. */
  function raster(svgStr, W, Hh, sc, type, q, cb) {
    var img = new Image(), url = URL.createObjectURL(new Blob([svgStr], { type: "image/svg+xml" }));
    img.onload = function () { var cv = document.createElement("canvas"); cv.width = Math.round(W * sc); cv.height = Math.round(Hh * sc); var cx = cv.getContext("2d"); cx.fillStyle = "#fff"; cx.fillRect(0, 0, cv.width, cv.height); cx.drawImage(img, 0, 0, cv.width, cv.height); URL.revokeObjectURL(url); cv.toBlob(function (b) { cb(b, cv.width, cv.height); }, type, q); };
    img.onerror = function () { URL.revokeObjectURL(url); cb(null); };
    img.src = url;
  }
  function toPng(cb) { var G = geo(); raster(exportSvg(), G.W, G.H, 2, "image/png", undefined, cb); }
  /* A minimal PDF writer: one A4 page per sheet, each page a full-bleed JPEG of the sheet. No library needed. */
  function buildPdf(pages) {
    var enc = function (str) { var u = new Uint8Array(str.length); for (var i = 0; i < str.length; i++) u[i] = str.charCodeAt(i) & 255; return u; };
    var chunks = [], offs = [], len = 0, n = 2 + pages.length * 3;
    function push(u) { chunks.push(u); len += u.length; }
    function obj(i, body, stream) { offs[i] = len; push(enc(i + " 0 obj\n" + body + (stream ? "\nstream\n" : "\nendobj\n"))); if (stream) { push(stream); push(enc("\nendstream\nendobj\n")); } }
    push(enc("%PDF-1.4\n%\xE2\xE3\xCF\xD3\n"));
    obj(1, "<< /Type /Catalog /Pages 2 0 R >>");
    obj(2, "<< /Type /Pages /Count " + pages.length + " /Kids [" + pages.map(function (p, i) { return (3 + i * 3) + " 0 R"; }).join(" ") + "] >>");
    pages.forEach(function (p, i) {
      var po = 3 + i * 3, co = po + 1, io = po + 2, cs = "q " + p.ptW + " 0 0 " + p.ptH + " 0 0 cm /Im0 Do Q";
      obj(po, "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 " + p.ptW + " " + p.ptH + "] /Resources << /XObject << /Im0 " + io + " 0 R >> >> /Contents " + co + " 0 R >>");
      obj(co, "<< /Length " + cs.length + " >>", enc(cs));
      obj(io, "<< /Type /XObject /Subtype /Image /Width " + p.w + " /Height " + p.h + " /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length " + p.bytes.length + " >>", p.bytes);
    });
    var xref = len, x = "xref\n0 " + (n + 1) + "\n0000000000 65535 f \n";
    for (var i = 1; i <= n; i++) x += ("000000000" + offs[i]).slice(-10) + " 00000 n \n";
    push(enc(x + "trailer\n<< /Size " + (n + 1) + " /Root 1 0 R >>\nstartxref\n" + xref + "\n%%EOF\n"));
    return new Blob(chunks, { type: "application/pdf" });
  }
  function exportPdf(all, cb) {
    var idx = all ? S.sheets.map(function (s, i) { return i; }) : [S.cur];
    var jobs = idx.map(function (i) { return onSheet(i, function () { var G = geo(); return { svg: exportSvg(), W: G.W, H: G.H, land: doc().orient !== "port", pt: PT[doc().paper] || PT.A4 }; }); });
    var pages = [], j = 0;
    (function next() {
      if (j >= jobs.length) { cb(buildPdf(pages)); return; }
      var jb = jobs[j++];
      raster(jb.svg, jb.W, jb.H, 2.5, "image/jpeg", 0.92, function (b, w, h) {
        if (!b) { cb(null); return; }
        b.arrayBuffer().then(function (ab) { pages.push({ bytes: new Uint8Array(ab), w: w, h: h, ptW: jb.pt[jb.land ? 0 : 1], ptH: jb.pt[jb.land ? 1 : 0] }); next(); });
      });
    })();
  }
  $("sk-export").addEventListener("click", function () {
    var f = $("sk-fmt").value, G = geo(), fail = function () { status("Couldn't export in this browser. Try SVG instead."); };
    if (f === "svg") return download(new Blob([exportSvg()], { type: "image/svg+xml" }), fname("svg"));
    if (f === "dxf") { try { var dx = exportDxf(); download(new Blob([dx.text], { type: "application/dxf" }), fname("dxf")); status(dx.note); } catch (er) { status("Couldn't build the DXF: " + er.message); } return; }
    status("Preparing your export…"); exportSvg(); var miss = mapMissing;
    if (miss) setTimeout(function () { status(miss + " map tile" + (miss > 1 ? "s hadn't" : " hadn't") + " finished loading, so they're blank in this export. Wait a moment and export again."); }, 1500);
    if (f === "png" || f === "jpeg") raster(exportSvg(), G.W, G.H, 2, "image/" + f, 0.92, function (b) { if (!b) return fail(); status(""); download(b, fname(f === "jpeg" ? "jpg" : "png")); });
    else exportPdf(f === "pdfall", function (b) { if (!b) return fail(); status(f === "pdfall" ? S.sheets.length + " sheets saved as one PDF, one A4 page each." : ""); download(b, fname("pdf", f === "pdfall")); });
  });

  /* ---------- Map backdrop: OpenStreetMap tiles and EA LiDAR contours ----------
     The sheet is laid out in British National Grid, grid north up, with the centre of the drawing frame
     at the chosen point and the drawing scale setting metres per sheet unit. OSM tiles (Web Mercator) are
     placed with one affine transform worked out at the centre, which is accurate to well under a pixel
     across a sheet. Contours are traced from an EA 1 m LiDAR DTM grid fetched for the sheet's extent
     (the same service the catchment tool uses) and stored in metres, so they follow scale changes. */
  var mapKeyV = "", tileCache = {}, tilePending = {};
  function RO() { return window.Runoff; }
  function mapFrame() { var d = doc(), G = geo(), mu = (d.dscale || 0) / 4000; return { cx: G.inner.x + G.inner.w / 2, cy: G.inner.y + G.inner.h / 2, mu: mu, inner: G.inner }; }
  function mapKey() { var d = doc(), m = d.map; return m ? [m.e, m.n, d.dscale, d.paper, d.orient, d.tbs, m.show, m.osm, m.cont, m.op, m.cop, m.grey, m.box, m.c ? m.c.lines.length + ":" + m.c.iv + ":" + m.c.oe : "", JSON.stringify(m.on || {}), Object.keys(m.L || {}).map(function (k2) { return k2 + (m.L[k2].f || []).length; }).join(), m.leg, m.legpos, legVer].join("|") : ""; }
  /* contours and vector layers are stored in metres from their own origin, so the map can move under them */
  function cOff(m, c) { return [(c.oe == null ? m.e : c.oe) - m.e, (c.on == null ? m.n : c.on) - m.n]; }
  function mapLayers() { return MAPL.concat(doc().map && doc().map.extra || []); }
  function layerAttr(m) { var seen = {}, out = []; mapLayers().forEach(function (L) { if (m.on && m.on[L.id] && L.attr && !seen[L.attr]) { seen[L.attr] = 1; out.push(L.attr); } }); return out; }
  function mapClipM() { /* the map area in BNG metres */
    var d = doc(), m = d.map, F = mapFrame(), I = m.box ? { x: Math.min(m.box[0], m.box[2]), y: Math.min(m.box[1], m.box[3]), w: Math.abs(m.box[2] - m.box[0]), h: Math.abs(m.box[3] - m.box[1]) } : F.inner;
    return { x0: m.e + (I.x - F.cx) * F.mu, x1: m.e + (I.x + I.w - F.cx) * F.mu, y0: m.n - (I.y + I.h - F.cy) * F.mu, y1: m.n - (I.y - F.cy) * F.mu, I: I };
  }
  function mapLayersStr(m, F, I, forExport) {
    var o = ""; if (!m.on) return o; m.L = m.L || {};
    mapLayers().forEach(function (L) {
      if (!m.on[L.id]) return;
      if (L.kind === "wms") {
        if (mapPanning) return; /* fetched again when the drag ends */
        /* BGS draws the 1:50k geology only at 1:25,000 or smaller, so ask for no more than about 6 m per pixel */
        var url = wmsUrl(L);
        var src = tileCache[url] || (forExport ? "" : url); if (!forExport) cacheTile(url); if (!src) { mapMissing++; return; }
        o += '<image href="' + esc(src) + '" x="' + r1(I.x) + '" y="' + r1(I.y) + '" width="' + r1(I.w) + '" height="' + r1(I.h) + '" preserveAspectRatio="none" opacity="' + (m.lop || 0.6) + '"/>';
        return;
      }
      var lay = m.L[L.id]; if (!lay || !lay.f) return; var oO = cOff(m, lay), P = function (q) { return r1(F.cx + (q[0] + oO[0]) / F.mu) + " " + r1(F.cy - (q[1] + oO[1]) / F.mu); };
      o += '<g fill="' + (L.line ? "none" : L.fill || "#3f6fd1") + '" fill-opacity="' + (L.fo || 0.12) + '" fill-rule="evenodd" stroke="' + (L.stroke || "#3f6fd1") + '" stroke-width="' + (L.line ? 1.6 : 1.1) + '"' + (L.dash ? ' stroke-dasharray="' + L.dash + '"' : "") + ' stroke-linejoin="round">';
      lay.f.forEach(function (f) { o += '<path d="' + f.r.map(function (rg) { return "M" + rg.map(P).join("L") + (L.line ? "" : "Z"); }).join("") + '"/>'; });
      o += "</g>";
      lay.f.forEach(function (f) { if (f.n && !L.line && f.r[0].length > 3) { var c = f.r[0].reduce(function (a, q) { return [a[0] + q[0] / f.r[0].length, a[1] + q[1] / f.r[0].length]; }, [0, 0]), xy = P(c).split(" "); o += txt(+xy[0], +xy[1], f.n.length > 40 ? f.n.slice(0, 39) + "…" : f.n, L.stroke || "#333", 8.5, "middle", ' stroke="#fff" stroke-width="2.5" paint-order="stroke"'); } });
    });
    return o;
  }
  /* ArcGIS feature service query for the map area, in British National Grid, simplified to the drawing scale */
  function fetchLayer(L) {
    var d = doc(), m = d.map; if (!m || !d.dscale) return; var C = mapClipM(), F = mapFrame();
    var url = L.url + "/query?where=1%3D1&geometry=" + [C.x0, C.y0, C.x1, C.y1].map(function (v) { return Math.round(v); }).join(",") + "&geometryType=esriGeometryEnvelope&inSR=27700&spatialRel=esriSpatialRelIntersects&outFields=*&returnGeometry=true&outSR=27700&maxAllowableOffset=" + (+(F.mu * 0.8).toFixed(2)) + "&geometryPrecision=1&resultRecordCount=2000&f=json";
    mapStatus("Fetching " + L.name + "…"); var sheet = d;
    fetch(url).then(function (r) { if (!r.ok) throw new Error("the service answered " + r.status); return r.json(); }).then(function (j) {
      if (j.error) throw new Error(j.error.message || "the service refused the request");
      var nameF = null; (j.fields || []).some(function (f) { if (/^(name|.*_name|sssi_name|name1)$/i.test(f.name) && f.type === "esriFieldTypeString") { nameF = f.name; return true; } return false; });
      var feats = (j.features || []).map(function (f) { var g = f.geometry || {}, rings = g.rings || g.paths || []; return { n: nameF ? f.attributes[nameF] : null, r: rings.map(function (rg) { return rg.map(function (q) { return [Math.round((q[0] - m.e) * 10) / 10, Math.round((q[1] - m.n) * 10) / 10]; }); }) }; }).filter(function (f) { return f.r.length; });
      if (!sheet.map) return; sheet.map.L = sheet.map.L || {}; sheet.map.L[L.id] = { f: feats, oe: m.e, on: m.n }; persist(); renderAll();
      mapStatus(feats.length ? feats.length + " " + L.name + " feature" + (feats.length > 1 ? "s" : "") + " in the map area." + (j.exceededTransferLimit ? " There are more than this; zoom in to see them all." : "") : "No " + L.name + " in the map area.");
    }).catch(function (err) { mapStatus("Couldn't fetch " + L.name + ": " + err.message + "."); });
  }
  function refreshLayers() { var m = doc().map; if (!m || !m.on) return; mapLayers().forEach(function (L) { if (m.on[L.id] && L.kind !== "wms" && !L.local) fetchLayer(L); }); }
  function merc(lat, lon, z) { var n = 256 * Math.pow(2, z), la = lat * Math.PI / 180; return [(lon + 180) / 360 * n, (1 - Math.log(Math.tan(la) + 1 / Math.cos(la)) / Math.PI) / 2 * n]; }
  function cacheTile(url) {
    if (tileCache[url] || tilePending[url] || !window.fetch) return; tilePending[url] = 1;
    fetch(url).then(function (r) { if (!r.ok) throw 0; return r.blob(); }).then(function (b) { var fr = new FileReader(); fr.onload = function () { tileCache[url] = fr.result; }; fr.readAsDataURL(b); }).catch(function () {}).then(function () { delete tilePending[url]; });
  }
  var mapMissing = 0;
  function mapStr(forExport) {
    var d = doc(), m = d.map; mapMissing = 0; if (!m || m.show === false || !d.dscale || !RO()) return "";
    var F = mapFrame(), I = m.box ? { x: Math.min(m.box[0], m.box[2]), y: Math.min(m.box[1], m.box[3]), w: Math.abs(m.box[2] - m.box[0]), h: Math.abs(m.box[3] - m.box[1]) } : F.inner, o = '<clipPath id="sk-mapclipg' + (forExport ? "x" : "") + '"><rect x="' + I.x + '" y="' + I.y + '" width="' + I.w + '" height="' + I.h + '"/></clipPath><g clip-path="url(#sk-mapclipg' + (forExport ? "x" : "") + ')">';
    if (m.osm !== false) {
      var ll = RO().bngToWgs(m.e, m.n), z = Math.round(Math.log2(156543.034 * Math.cos(ll.lat * Math.PI / 180) / (F.mu * 1.2))); z = Math.max(8, Math.min(19, z));
      var p1 = RO().bngToWgs(m.e + 200, m.n), p2 = RO().bngToWgs(m.e, m.n + 200), m0 = merc(ll.lat, ll.lon, z), m1 = merc(p1.lat, p1.lon, z), m2 = merc(p2.lat, p2.lon, z);
      var a1 = [m1[0] - m0[0], m1[1] - m0[1]], a2 = [m2[0] - m0[0], m2[1] - m0[1]], det = a1[0] * a2[1] - a2[0] * a1[1], s2 = 200 / F.mu;
      /* world = A · mercator + t, with A taking a1 to (s2, 0) and a2 to (0, -s2) */
      var iv = [[a2[1] / det, -a2[0] / det], [-a1[1] / det, a1[0] / det]], A = [[s2 * iv[0][0], s2 * iv[0][1]], [-s2 * iv[1][0], -s2 * iv[1][1]]];
      var tx = F.cx - (A[0][0] * m0[0] + A[0][1] * m0[1]), ty = F.cy - (A[1][0] * m0[0] + A[1][1] * m0[1]);
      var dA = A[0][0] * A[1][1] - A[0][1] * A[1][0], inv = function (x, y) { x -= tx; y -= ty; return [(A[1][1] * x - A[0][1] * y) / dA, (-A[1][0] * x + A[0][0] * y) / dA]; };
      var cs = [inv(I.x, I.y), inv(I.x + I.w, I.y), inv(I.x, I.y + I.h), inv(I.x + I.w, I.y + I.h)], X0 = Infinity, Y0 = Infinity, X1 = -Infinity, Y1 = -Infinity;
      cs.forEach(function (c) { X0 = Math.min(X0, c[0]); X1 = Math.max(X1, c[0]); Y0 = Math.min(Y0, c[1]); Y1 = Math.max(Y1, c[1]); });
      /* tile positions go in relative to a local origin: browsers lose precision on huge coordinates */
      var Ox = Math.floor(m0[0]), Oy = Math.floor(m0[1]), ltx = tx + A[0][0] * Ox + A[0][1] * Oy, lty = ty + A[1][0] * Ox + A[1][1] * Oy;
      var t0x = Math.floor(X0 / 256), t1x = Math.floor(X1 / 256), t0y = Math.floor(Y0 / 256), t1y = Math.floor(Y1 / 256);
      if ((t1x - t0x + 1) * (t1y - t0y + 1) <= 120) {
        o += '<filter id="sk-mapfx' + (forExport ? "x" : "") + '"><feColorMatrix type="saturate" values="0"/></filter><g opacity="' + (m.op || 0.55) + '"' + (m.grey !== false ? ' filter="url(#sk-mapfx' + (forExport ? "x" : "") + ')"' : "") + ' transform="matrix(' + [A[0][0], A[1][0], A[0][1], A[1][1], ltx, lty].map(function (v) { return +v.toFixed(6); }).join(" ") + ')">';
        for (var X = t0x; X <= t1x; X++) for (var Y = t0y; Y <= t1y; Y++) {
          var url = "https://tile.openstreetmap.org/" + z + "/" + X + "/" + Y + ".png", src = tileCache[url] || (forExport ? "" : url);
          if (!forExport) cacheTile(url); if (!src) { mapMissing++; continue; }
          o += '<image href="' + src + '" x="' + (X * 256 - Ox) + '" y="' + (Y * 256 - Oy) + '" width="256.6" height="256.6" preserveAspectRatio="none"/>';
        }
        o += "</g>";
      }
    }
    o += mapLayersStr(m, F, I, forExport);
    if (m.cont !== false && m.c && m.c.lines.length) {
      var cO = cOff(m, m.c), W2 = function (q) { return r1(F.cx + (q[0] + cO[0]) / F.mu) + " " + r1(F.cy - (q[1] + cO[1]) / F.mu); }, idx = m.c.iv * 5, lab = "";
      o += '<g opacity="' + (m.cop || 1) + '"><g fill="none" stroke="#8a5a2b" stroke-linejoin="round">';
      m.c.lines.forEach(function (l) {
        var major = Math.abs(l.z / idx - Math.round(l.z / idx)) < 1e-6;
        o += '<path d="M' + l.p.map(W2).join("L") + '" stroke-width="' + (major ? 1.3 : 0.6) + '"/>';
        if (major && l.p.length > 4) { var q = l.p[Math.floor(l.p.length / 2)], q2 = l.p[Math.floor(l.p.length / 2) + 1], x = F.cx + (q[0] + cO[0]) / F.mu, y = F.cy - (q[1] + cO[1]) / F.mu, ang = Math.atan2(-(q2[1] - q[1]), q2[0] - q[0]) * 180 / Math.PI; if (ang > 90) ang -= 180; if (ang < -90) ang += 180;
          lab += '<text x="' + r1(x) + '" y="' + r1(y + 3) + '" transform="rotate(' + r1(ang) + " " + r1(x) + " " + r1(y) + ')" font-family="' + FONT + '" font-size="9" fill="#8a5a2b" text-anchor="middle" stroke="#fff" stroke-width="3" paint-order="stroke">' + (+l.z.toFixed(2)) + "</text>"; }
      });
      o += "</g>" + lab + "</g>";
    }
    var attr = [m.osm !== false ? "Map © OpenStreetMap contributors" : "", m.cont !== false && m.c ? "Contours " + m.c.iv + " m from " + (m.c.src || "EA LiDAR DTM © Environment Agency (OGL)") + ", indicative" : ""].concat(layerAttr(m)).filter(Boolean).join(" · ");
    if (m.box) o += '<rect x="' + r1(I.x) + '" y="' + r1(I.y) + '" width="' + r1(I.w) + '" height="' + r1(I.h) + '" fill="none" stroke="#15233a" stroke-width="1.2"/>';
    if (m.leg) o += legendStr(m, I, forExport);
    if (attr) o += txt(I.x + 6, I.y + I.h - 6, attr, "#5a6677", 8, "start", ' stroke="#fff" stroke-width="3" paint-order="stroke"');
    return o + "</g>";
  }
  /* ---------- Map legend ----------
     One entry per layer that is switched on. Vector layers use the colours they're drawn in. For BGS
     geology the units actually showing are found by matching the colours in the fetched map image to
     the BGS service's own renderer (its published key), and listed by their BGS LEX-RCS codes. */
  var bgsRend = {}, bgsUnits = {}, legVer = 0;
  function legendStr(m, I, forExport) {
    var rows = [], fs = 10, sw = 22;
    if (m.cont !== false && m.c && m.c.lines.length) rows.push({ kind: "line", c: "#8a5a2b", w: 1.3, t: "Contour, every " + m.c.iv + " m (m AOD)" });
    mapLayers().forEach(function (L) {
      if (!m.on || !m.on[L.id]) return;
      if (L.kind === "wms") {
        var u = bgsUnits[L.id];
        var nm = L.name.replace(/^BGS /, ""); rows.push({ kind: "head", t: nm.charAt(0).toUpperCase() + nm.slice(1) + " geology (BGS 1:50,000)" });
        if (u && u.key === mapClipKey(L)) {
          if (!u.list.length) rows.push({ kind: "note", t: "No mapped units in this area" + (doc().dscale < 25000 ? " (BGS shows it only at 1:25,000 or smaller)" : "") });
          u.list.slice(0, 14).forEach(function (q) { rows.push({ kind: "fill", c: q.c, fo: m.lop || 0.6, t: q.labels.slice(0, 3).join(", ") + (q.labels.length > 3 ? " …" : "") }); });
          if (u.list.length > 14) rows.push({ kind: "note", t: "+ " + (u.list.length - 14) + " more units" });
          if (u.list.length) rows.push({ kind: "note", t: "Codes are BGS LEX-RCS: look them up in the BGS Lexicon" });
        } else rows.push({ kind: "note", t: u && u.err ? "Key unavailable: " + u.err : "Reading the BGS key…" });
        return;
      }
      rows.push(L.line ? { kind: "line", c: L.stroke || "#3f6fd1", w: 1.6, t: L.name } : { kind: "fill", c: L.fill || "#3f6fd1", fo: L.fo || 0.12, st: L.stroke, dash: L.dash, t: L.name });
    });
    if (!rows.length) return "";
    var w = 0; rows.forEach(function (r) { w = Math.max(w, tw(r.t, r.kind === "head" ? fs + 0.5 : r.kind === "note" ? fs - 1.5 : fs, r.kind === "head") + (r.kind === "head" || r.kind === "note" ? 0 : sw + 8)); });
    var lh = 15, W = Math.min(I.w - 20, w + 20), H = 26 + rows.length * lh, pos = m.legpos || "br";
    var x = pos[1] === "l" ? I.x + 10 : I.x + I.w - W - 10, y = pos[0] === "t" ? I.y + 10 : I.y + I.h - H - 22;
    var TB = geo().tb; if (pos === "br" && doc().frame !== false && !TB.off && x + W > TB.x && y + H > TB.y) y = Math.max(I.y + 10, TB.y - H - 10); /* keep clear of the title block */
    var o = '<g><rect x="' + r1(x) + '" y="' + r1(y) + '" width="' + r1(W) + '" height="' + r1(H) + '" fill="#fff" fill-opacity="0.94" stroke="#15233a" stroke-width="1"/>' + txt(x + 10, y + 16, "LEGEND", "#15233a", fs + 1, "start", ' font-weight="bold"');
    rows.forEach(function (r, i) {
      var yy = y + 24 + i * lh, tx = x + 10;
      if (r.kind === "line") o += '<line x1="' + r1(tx) + '" y1="' + r1(yy + lh / 2) + '" x2="' + r1(tx + sw) + '" y2="' + r1(yy + lh / 2) + '" stroke="' + r.c + '" stroke-width="' + r.w + '"/>';
      if (r.kind === "fill") o += '<rect x="' + r1(tx) + '" y="' + r1(yy + 2) + '" width="' + sw + '" height="' + (lh - 5) + '" fill="' + r.c + '" fill-opacity="' + r.fo + '" stroke="' + (r.st || r.c) + '" stroke-width="' + (r.st ? 1.1 : 0.4) + '"' + (r.dash ? ' stroke-dasharray="' + r.dash + '"' : "") + "/>";
      if (r.kind === "line" || r.kind === "fill") tx += sw + 8;
      o += txt(tx, yy + lh / 2 + 3.5, r.t, r.kind === "note" ? "#5a6677" : "#15233a", r.kind === "head" ? fs + 0.5 : r.kind === "note" ? fs - 1.5 : fs, "start", r.kind === "head" ? ' font-weight="bold"' : r.kind === "note" ? ' font-style="italic"' : "");
    });
    return o + "</g>";
  }
  function wmsUrl(L) { var C = mapClipM(), I = C.I, px = Math.max(2, Math.min(2048, Math.round((C.x1 - C.x0) / 6))), py = Math.max(2, Math.round(px * I.h / I.w)); return L.url + "?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&LAYERS=" + encodeURIComponent(L.layer) + "&STYLES=&CRS=EPSG:27700&BBOX=" + [C.x0, C.y0, C.x1, C.y1].map(function (v) { return Math.round(v); }).join(",") + "&WIDTH=" + px + "&HEIGHT=" + py + "&FORMAT=image/png&TRANSPARENT=TRUE"; }
  function mapClipKey(L) { return wmsUrl(L); }
  /* Find which BGS units are on the map: colours in the WMS image matched to the service renderer. */
  function updateBgsLegend() {
    var m = doc().map; if (!m || !m.leg || !m.on) return;
    mapLayers().forEach(function (L) {
      if (L.kind !== "wms" || !m.on[L.id] || !L.rest) return;
      var key = mapClipKey(L), u = bgsUnits[L.id]; if (u && (u.key === key || u.busy === key)) return;
      bgsUnits[L.id] = { busy: key };
      var fail = function (er) { bgsUnits[L.id] = { key: "", err: er }; legVer++; mapKeyV = ""; renderAll(); };
      var rend = bgsRend[L.id] ? Promise.resolve(bgsRend[L.id]) : fetch(L.rest + "?f=json").then(function (r) { if (!r.ok) throw new Error("BGS answered " + r.status); return r.json(); }).then(function (j) {
        var infos = (j.drawingInfo && j.drawingInfo.renderer && j.drawingInfo.renderer.uniqueValueInfos) || []; if (!infos.length) throw new Error("no key in the BGS service");
        return (bgsRend[L.id] = infos.map(function (v) { var c = v.symbol && v.symbol.color || [0, 0, 0, 0]; return { label: v.label || String(v.value), rgb: [c[0], c[1], c[2]] }; }));
      });
      var img = new Promise(function (res, rej) {
        var tries = 0, wait = function () { if (tileCache[key]) return res(tileCache[key]); if (++tries > 60) return rej(new Error("the geology map didn't load")); cacheTile(key); setTimeout(wait, 500); }; wait();
      }).then(function (src) { return new Promise(function (res, rej) { var im = new Image(); im.onload = function () { res(im); }; im.onerror = function () { rej(new Error("couldn't read the geology map")); }; im.src = src; }); });
      Promise.all([rend, img]).then(function (r) {
        var R = r[0], im = r[1], cv = document.createElement("canvas"); cv.width = im.naturalWidth; cv.height = im.naturalHeight;
        var cx = cv.getContext("2d"); cx.drawImage(im, 0, 0); var px = cx.getImageData(0, 0, cv.width, cv.height).data, cnt = {}, tot = 0;
        for (var i = 0; i < px.length; i += 4) { if (px[i + 3] < 250) continue; tot++; var k = (px[i] << 16) | (px[i + 1] << 8) | px[i + 2]; cnt[k] = (cnt[k] || 0) + 1; }
        var list = [];
        Object.keys(cnt).sort(function (a, b) { return cnt[b] - cnt[a]; }).forEach(function (k) {
          if (cnt[k] < Math.max(12, tot * 0.002)) return; var rr = (k >> 16) & 255, gg = (k >> 8) & 255, bb = k & 255, labs = [];
          R.forEach(function (q) { if (Math.abs(q.rgb[0] - rr) + Math.abs(q.rgb[1] - gg) + Math.abs(q.rgb[2] - bb) <= 6 && labs.indexOf(q.label) < 0) labs.push(q.label); });
          if (labs.length) list.push({ c: "rgb(" + rr + "," + gg + "," + bb + ")", labels: labs, n: cnt[k] });
        });
        if (mapClipKey(L) !== key) return; bgsUnits[L.id] = { key: key, list: list }; legVer++; mapKeyV = ""; renderAll();
      }).catch(function (er) { fail(er.message || "couldn't read the BGS key"); });
    });
  }
  /* marching squares over the terrain grid, joined into polylines and simplified */
  function traceContours(g, iv, e0, n0) {
    var mn = Infinity, mx = -Infinity, i, j; for (i = 0; i < g.z.length; i++) { var v = g.z[i]; if (v === v) { if (v < mn) mn = v; if (v > mx) mx = v; } }
    if (!(mx >= mn)) return null;
    while ((mx - mn) / iv > 150) iv = iv < 1 ? iv * 2 : iv < 5 ? 5 : iv * 2;
    var nx = g.nx, ny = g.ny, out = [], X = function (ii) { return g.x0 + (ii + 0.5) * g.cell - e0; }, Y = function (jj) { return g.y0 + (ny - jj - 0.5) * g.cell - n0; };
    for (var L = Math.ceil(mn / iv) * iv; L <= mx; L += iv) {
      var segs = {}, ends = [];
      var key = function (p) { return Math.round(p[0] * 100) + "," + Math.round(p[1] * 100); };
      for (j = 0; j < ny - 1; j++) for (i = 0; i < nx - 1; i++) {
        var a = g.z[j * nx + i], b = g.z[j * nx + i + 1], c = g.z[(j + 1) * nx + i + 1], dd = g.z[(j + 1) * nx + i];
        if (a !== a || b !== b || c !== c || dd !== dd) continue;
        var cse = (a > L ? 8 : 0) | (b > L ? 4 : 0) | (c > L ? 2 : 0) | (dd > L ? 1 : 0); if (!cse || cse === 15) continue;
        var t = function (p, q) { return (L - p) / (q - p); };
        var eT = [X(i) + t(a, b) * g.cell, Y(j)], eR = [X(i + 1), Y(j) - t(b, c) * g.cell], eB = [X(i) + t(dd, c) * g.cell, Y(j + 1)], eL = [X(i), Y(j) - t(a, dd) * g.cell];
        var S2 = { 1: [[eL, eB]], 2: [[eB, eR]], 3: [[eL, eR]], 4: [[eT, eR]], 5: [[eL, eT], [eB, eR]], 6: [[eT, eB]], 7: [[eL, eT]], 8: [[eL, eT]], 9: [[eT, eB]], 10: [[eT, eR], [eL, eB]], 11: [[eT, eR]], 12: [[eL, eR]], 13: [[eB, eR]], 14: [[eL, eB]] }[cse];
        S2.forEach(function (sg) { var k1 = key(sg[0]), k2 = key(sg[1]); (segs[k1] || (segs[k1] = [])).push([k2, sg[1], sg[0]]); (segs[k2] || (segs[k2] = [])).push([k1, sg[0], sg[1]]); });
      }
      /* join */
      var used = {};
      var take = function (k1) { var l = segs[k1]; if (!l) return null; while (l.length) { var s3 = l.pop(); var id = k1 < s3[0] ? k1 + "|" + s3[0] : s3[0] + "|" + k1; if (!used[id]) { used[id] = 1; return s3; } } return null; };
      Object.keys(segs).forEach(function (k0) {
        var first;
        while ((first = take(k0))) {
          var line = [first[2], first[1]], kk = first[0], nxt2;
          while ((nxt2 = take(kk))) { line.push(nxt2[1]); kk = nxt2[0]; }
          kk = k0; var back = [];
          while ((nxt2 = take(kk))) { back.push(nxt2[1]); kk = nxt2[0]; }
          line = back.reverse().concat(line);
          if (line.length > 2) out.push({ z: +L.toFixed(3), p: dpS(line, g.cell * 0.35).map(function (q) { return [Math.round(q[0] * 100) / 100, Math.round(q[1] * 100) / 100]; }) });
        }
      });
    }
    return { iv: iv, lines: out, oe: e0, on: n0 };
  }
  function dpS(P, eps) {
    if (P.length < 3) return P;
    if (Math.hypot(P[0][0] - P[P.length - 1][0], P[0][1] - P[P.length - 1][1]) < 1e-6) { /* closed loop: simplify each half */
      var far = 0, fd = -1; P.forEach(function (q, i) { var d2 = Math.hypot(q[0] - P[0][0], q[1] - P[0][1]); if (d2 > fd) { fd = d2; far = i; } });
      if (far > 0 && far < P.length - 1) return dpS(P.slice(0, far + 1), eps).concat(dpS(P.slice(far), eps).slice(1));
    } var keep = new Uint8Array(P.length), st = [[0, P.length - 1]]; keep[0] = keep[P.length - 1] = 1;
    while (st.length) { var r = st.pop(), a = P[r[0]], b = P[r[1]], dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1e-9, md = 0, mi = -1;
      for (var i = r[0] + 1; i < r[1]; i++) { var dd = Math.abs((P[i][0] - a[0]) * dy - (P[i][1] - a[1]) * dx) / L; if (dd > md) { md = dd; mi = i; } }
      if (md > eps) { keep[mi] = 1; st.push([r[0], mi], [mi, r[1]]); } }
    return P.filter(function (q, i) { return keep[i]; });
  }
  function parseLoc(t) {
    var m = /^\s*(-?\d{1,2}\.\d+)\s*,\s*(-?\d{1,3}\.\d+)\s*$/.exec(t || "");
    if (m && +m[1] > 49 && +m[1] < 61) return RO().wgsToBng(+m[1], +m[2]);
    return RO().parseLocation(t);
  }
  function mapStatus(msg) { status(msg); }
  $("sk-map-btn").addEventListener("click", function () { var pn = $("sk-mappanel"); pn.hidden = !pn.hidden; this.setAttribute("aria-expanded", !pn.hidden); if (!pn.hidden) { var m = doc().map; if (m && !$("sk-maploc").value) $("sk-maploc").value = Math.round(m.e) + ", " + Math.round(m.n); fitSheet(); } });
  $("sk-mapgeo").addEventListener("click", function () {
    if (!navigator.geolocation || !RO()) { mapStatus("This browser can't share its location. Type a grid reference instead."); return; }
    mapStatus("Finding your location…");
    navigator.geolocation.getCurrentPosition(function (pos) { var b = RO().wgsToBng(pos.coords.latitude, pos.coords.longitude); $("sk-maploc").value = Math.round(b.e) + ", " + Math.round(b.n); mapStatus(""); }, function () { mapStatus("Couldn't get your location. Type a grid reference instead."); });
  });
  function mapSet(fn) { var m = doc().map; if (!m) return; fn(m); persist(); renderAll(); }
  $("sk-maposm").addEventListener("change", function () { var v = this.checked; mapSet(function (m) { m.osm = v; }); });
  $("sk-mapleg").addEventListener("change", function () { var v = this.checked; mapSet(function (m) { m.leg = v; }); });
  $("sk-maplegpos").addEventListener("change", function () { var v = this.value; mapSet(function (m) { m.legpos = v; }); });
  $("sk-mapgrey").addEventListener("change", function () { var v = this.checked; mapSet(function (m) { m.grey = v; }); });
  $("sk-mapop").addEventListener("input", function () { var v = +this.value; mapSet(function (m) { m.op = v; }); });
  $("sk-mapcont").addEventListener("change", function () { var v = this.checked; mapSet(function (m) { m.cont = v; }); if (v && doc().map && !doc().map.c) fetchContours(); });
  $("sk-mapcop").addEventListener("input", function () { var v = +this.value; mapSet(function (m) { m.cop = v; }); });
  $("sk-mapea").addEventListener("click", function () { if (!doc().map) { mapStatus("Place the map first."); return; } fetchContours(); });
  $("sk-mapfile-b").addEventListener("click", function () { $("sk-mapfile").click(); });
  $("sk-mapfile").addEventListener("change", function () { var f = this.files[0]; this.value = ""; if (f) loadTerrainFile(f); });
  app.addEventListener("change", function (e) {
    var id = e.target.dataset && e.target.dataset.ml; if (!id) return; var m = doc().map; if (!m) { e.target.checked = false; mapStatus("Place the map first."); return; }
    m.on = m.on || {}; m.on[id] = e.target.checked; persist(); renderAll();
    var L = mapLayers().filter(function (x) { return x.id === id; })[0]; if (e.target.checked && L && L.kind === "fs" && !L.local) fetchLayer(L);
  });
  $("sk-mladd").addEventListener("click", function () {
    var u = ($("sk-mlurl").value || "").trim().replace(/\/query.*$/, "").replace(/\/+$/, ""), m = doc().map;
    if (!m) { mapStatus("Place the map first."); return; }
    if (!/^https:\/\/[^\s]+\/(FeatureServer|MapServer)\/\d+$/i.test(u)) { mapStatus("Paste an ArcGIS layer address ending in /FeatureServer/0 or /MapServer/0 (with the layer number). Natural England's open data pages give one under \"I want to use this\" > \"View API resources\"."); return; }
    var L = { id: "x" + Date.now().toString(36), name: u.split("/").slice(-3, -2)[0].replace(/_/g, " "), kind: "fs", url: u, src: u, stroke: "#6a3fa0", fill: "#6a3fa0", fo: 0.1, attr: "Layer: " + u.split("/")[2] };
    m.extra = (m.extra || []).concat([L]); m.on = m.on || {}; m.on[L.id] = true; persist(); renderMapExtra(); fetchLayer(L); $("sk-mlurl").value = "";
  });
  $("sk-mlgj-b").addEventListener("click", function () { $("sk-mlgj").click(); });
  $("sk-mlgj").addEventListener("change", function () { var f = this.files[0]; this.value = ""; if (f) f.text().then(loadGeoJson).catch(function (er) { mapStatus("Couldn't read that file: " + er.message); }); });
  function loadGeoJson(t) {
    var m = doc().map; if (!m) { mapStatus("Place the map first."); return; }
    var j = JSON.parse(t), feats = [], ll = null;
    function conv(q) { if (ll === null) ll = Math.abs(q[0]) <= 180 && Math.abs(q[1]) <= 90; var b = ll ? RO().wgsToBng(q[1], q[0]) : { e: q[0], n: q[1] }; return [Math.round((b.e - m.e) * 10) / 10, Math.round((b.n - m.n) * 10) / 10]; }
    var line = false;
    (j.features || [j]).forEach(function (f) {
      var g = f.geometry || f, nm = f.properties ? f.properties.name || f.properties.NAME || f.properties.name1 || null : null, cs = g.coordinates; if (!cs) return;
      var add = function (rings) { feats.push({ n: nm, r: rings.map(function (rg) { return rg.map(conv); }) }); };
      if (g.type === "Polygon") add(cs); else if (g.type === "MultiPolygon") cs.forEach(add); else if (g.type === "LineString") { line = true; add([cs]); } else if (g.type === "MultiLineString") { line = true; add(cs); }
    });
    if (!feats.length) { mapStatus("No lines or areas found in that GeoJSON."); return; }
    if (feats.length > 5000) feats = feats.slice(0, 5000);
    var L = { id: "g" + Date.now().toString(36), name: "GeoJSON layer", kind: "fs", local: true, line: line, stroke: line ? "#3f6fd1" : "#6a3fa0", fill: "#6a3fa0", fo: 0.1, src: "Loaded from a file", attr: "" };
    m.extra = (m.extra || []).concat([L]); m.on = m.on || {}; m.on[L.id] = true; m.L = m.L || {}; m.L[L.id] = { f: feats, oe: m.e, on: m.n }; persist(); renderMapExtra(); renderAll();
    mapStatus(feats.length + " features loaded" + (ll ? " (converted from lat/long)" : " (read as British National Grid)") + ". Add an attribution in a note if the data needs one.");
  }
  function renderMapExtra() { var m = doc().map, ex = m && m.extra || []; $("sk-mlextra").innerHTML = ex.map(function (L) { return '<label class="sk-check" title="' + esc(L.src) + '"><input type="checkbox" data-ml="' + L.id + '"' + (m.on && m.on[L.id] ? " checked" : "") + "> " + esc(L.name) + '</label><button type="button" class="sk-btn danger" data-mlx="' + L.id + '" aria-label="Remove layer">×</button>'; }).join(""); }
  $("sk-mlextra").addEventListener("click", function (e) { var b = e.target.closest("[data-mlx]"); if (!b) return; var m = doc().map, id = b.dataset.mlx; m.extra = m.extra.filter(function (x) { return x.id !== id; }); if (m.L) delete m.L[id]; if (m.on) delete m.on[id]; persist(); renderMapExtra(); renderAll(); });
  /* contours from a terrain file: ESRI ASCII grid, or GeoTIFF read with geotiff.js (loaded on first use) */
  function loadTerrainFile(f) {
    var iv = +$("sk-mapiv").value;
    mapStatus("Reading " + f.name + "…");
    var done = function (g) {
      if (g.x0 < 0 || g.x0 > 800000 || g.y0 < 0 || g.y0 > 1400000) { mapStatus("That grid isn't in British National Grid (EPSG:27700) metres, so it can't be placed. Reproject it first, e.g. in QGIS."); return; }
      var d = doc(), ce = g.x0 + g.nx * g.cell / 2, cn = g.y0 + g.ny * g.cell / 2, placed = !!d.map;
      if (!d.map) {
        var G = geo(), need = Math.max(g.nx * g.cell / (G.inner.w / 4000), g.ny * g.cell / (G.inner.h / 4000)); d.dscale = SCALES.filter(function (n) { return n >= need; })[0] || 10000;
        d.map = { e: Math.round(ce), n: Math.round(cn), osm: $("sk-maposm").checked, cont: true, op: +$("sk-mapop").value, grey: true, show: true };
      }
      var m = d.map, C = mapClipM(), g2 = cropGrid(g, C.x0, C.y0, C.x1, C.y1);
      if (!g2) { mapStatus("That terrain grid doesn't overlap the map area. Recentre the map on " + Math.round(ce) + ", " + Math.round(cn) + " or remove the map and load the file again."); return; }
      var c = traceContours(g2, iv, m.e, m.n);
      if (!c) { mapStatus("The grid has no values in the map area."); return; }
      var Wd = C.x1 - C.x0, Hd = C.y1 - C.y0; terrain = { sheet: d, fine: g2, wide: cropGrid(g, C.x0 - Wd, C.y0 - Hd, C.x1 + Wd, C.y1 + Hd) || g2, file: true };
      c.src = f.name; m.c = c; m.cont = true; m.csrc = "file"; persist(); syncControls(); renderAll(); renderProps();
      mapStatus(c.lines.length + " contours every " + c.iv + " m from " + f.name + " (" + g.cell + " m cells)" + (placed ? "." : ", with the map placed over it at 1:" + d.dscale + "."));
    };
    if (/\.tiff?$/i.test(f.name)) {
      loadGeoTiff(function (ok) {
        if (!ok) { mapStatus("Couldn't load the GeoTIFF reader. Check your connection, or convert the file to .asc."); return; }
        f.arrayBuffer().then(function (buf) { return window.GeoTIFF.fromArrayBuffer(buf); }).then(function (tf) { return tf.getImage(); }).then(function (img) {
          var w = img.getWidth(), h = img.getHeight(), o = img.getOrigin(), r = img.getResolution(), st = Math.max(1, Math.ceil(Math.sqrt(w * h / 2.5e6))), nw = Math.floor(w / st), nh = Math.floor(h / st), nod = img.getGDALNoData();
          return img.readRasters({ samples: [0], interleave: true, width: nw, height: nh }).then(function (rs) {
            var z = new Float32Array(nw * nh); for (var i = 0; i < z.length; i++) { var v = rs[i]; z[i] = (nod != null && v === nod) || !isFinite(v) || v < -1000 ? NaN : v; }
            var cell = Math.abs(r[0]) * w / nw; done({ nx: nw, ny: nh, x0: o[0], y0: o[1] - Math.abs(r[1]) * h, cell: cell, z: z });
          });
        }).catch(function (er) { mapStatus("Couldn't read that GeoTIFF: " + er.message); });
      });
    } else f.text().then(function (t) { done(RO().parseAsc(t)); }).catch(function (er) { mapStatus("Couldn't read that grid: " + er.message); });
  }
  var gtState = 0, gtWait = [];
  function loadGeoTiff(cb) {
    if (window.GeoTIFF) return cb(true); gtWait.push(cb); if (gtState) return; gtState = 1;
    var sc = document.createElement("script"); sc.src = "https://cdn.jsdelivr.net/npm/geotiff@2.1.3/dist-browser/geotiff.js";
    sc.onload = function () { gtWait.splice(0).forEach(function (f) { f(!!window.GeoTIFF); }); gtState = 0; }; sc.onerror = function () { gtWait.splice(0).forEach(function (f) { f(false); }); gtState = 0; };
    document.head.appendChild(sc);
  }
  function cropGrid(g, x0, y0, x1, y1) {
    var i0 = Math.max(0, Math.floor((x0 - g.x0) / g.cell) - 1), i1 = Math.min(g.nx - 1, Math.ceil((x1 - g.x0) / g.cell) + 1);
    var top = g.y0 + g.ny * g.cell, j0 = Math.max(0, Math.floor((top - y1) / g.cell) - 1), j1 = Math.min(g.ny - 1, Math.ceil((top - y0) / g.cell) + 1);
    if (i1 - i0 < 2 || j1 - j0 < 2) return null;
    var st = Math.max(1, Math.ceil(Math.sqrt((i1 - i0 + 1) * (j1 - j0 + 1) / 400000))), nx = Math.floor((i1 - i0) / st) + 1, ny = Math.floor((j1 - j0) / st) + 1, z = new Float32Array(nx * ny);
    for (var j = 0; j < ny; j++) for (var i = 0; i < nx; i++) z[j * nx + i] = g.z[(j0 + j * st) * g.nx + i0 + i * st];
    return { nx: nx, ny: ny, cell: g.cell * st, x0: g.x0 + i0 * g.cell, y0: top - (j0 + ny * st) * g.cell, z: z };
  }
  /* moving the map and limiting it to an area are done by dragging on the sheet */
  var mapMode = null, mapPanning = false;
  function setMapMode(mm) { mapMode = mapMode === mm ? null : mm; $("sk-mappan").setAttribute("aria-pressed", mapMode === "pan"); $("sk-mapbox").setAttribute("aria-pressed", mapMode === "box"); $("sk-mapsect").setAttribute("aria-pressed", mapMode === "sect"); $("sk-mapcatch").setAttribute("aria-pressed", mapMode === "catch"); stage.dataset.map = mapMode || ""; if (mapMode === "sect" || mapMode === "catch") mapStatus(mapMode === "sect" ? "Drag a line across the map where you want the ground section." : "Click on a ditch, stream or low point. The land that drains to it is outlined. It can take a few seconds."); else if (mapMode) mapStatus(mapMode === "pan" ? "Drag on the sheet to move the map. Your drawing stays where it is. Click Move map again to finish." : "Drag a box on the sheet for the map area."); }
  $("sk-mappan").addEventListener("click", function () { if (!doc().map) { mapStatus("Place the map first."); return; } setMapMode("pan"); });
  $("sk-mapbox").addEventListener("click", function () { if (!doc().map) { mapStatus("Place the map first."); return; } setMapMode("box"); });
  $("sk-mapall").addEventListener("click", function () { var m = doc().map; if (!m) return; delete m.box; persist(); renderAll(); afterMapMove(); });
  function afterMapMove() { var m = doc().map; if (!m) return; if (m.cont !== false && m.csrc !== "file") fetchContours(); refreshLayers(); }
  $("sk-mapiv").addEventListener("change", function () { if (doc().map && doc().map.cont !== false) fetchContours(); });
  $("sk-mapshow").addEventListener("change", function () { var v = this.checked; mapSet(function (m) { m.show = v; }); });
  $("sk-mapdel").addEventListener("click", function () { if (!doc().map) return; delete doc().map; persist(); renderAll(); mapStatus("Map removed."); });
  $("sk-mapgo").addEventListener("click", function () {
    if (!RO()) { mapStatus("The map helpers didn't load. Reload the page and try again."); return; }
    var raw = $("sk-maploc").value, pc = /^\s*([A-Za-z]{1,2}\d[A-Za-z\d]?)\s*(\d[A-Za-z]{2})\s*$/.exec(raw);
    if (pc) {
      mapStatus("Looking up " + raw.toUpperCase() + "…");
      fetch("https://api.postcodes.io/postcodes/" + encodeURIComponent(pc[1] + pc[2])).then(function (r) { return r.json(); }).then(function (j) {
        if (!j.result || j.result.eastings == null) throw new Error(j.error || "postcode not found");
        $("sk-maploc").value = j.result.postcode + " (" + j.result.eastings + ", " + j.result.northings + ")"; placeMap({ e: j.result.eastings, n: j.result.northings });
      }).catch(function (er) { mapStatus("Couldn't find that postcode: " + er.message + ". Try a grid reference instead."); });
      return;
    }
    var mm2 = /\((\d{5,6}), (\d{5,7})\)\s*$/.exec(raw); placeMap(mm2 ? { e: +mm2[1], n: +mm2[2] } : parseLoc(raw));
  });
  function placeMap(c) {
    if (!c || !(c.e > 0 && c.e < 700000 && c.n > 0 && c.n < 1300000)) { mapStatus("That location wasn't understood. Try a grid reference like SK 012 813, eastings and northings like 401200, 381300, or a latitude and longitude."); return; }
    var d = doc(), auto = !d.dscale; if (auto) d.dscale = 500;
    if (d.map) { /* recentre: keep layers, area and settings; file contours stay put on the ground */
      d.map.e = Math.round(c.e); d.map.n = Math.round(c.n);
    } else d.map = { e: Math.round(c.e), n: Math.round(c.n), osm: $("sk-maposm").checked, cont: $("sk-mapcont").checked, op: +$("sk-mapop").value, grey: $("sk-mapgrey").checked, show: true };
    persist(); renderAll(); renderProps();
    mapStatus((auto ? "The sketch was not to scale, so it is now 1:500; change the scale to zoom the map. " : "") + "Map centred on " + d.map.e + ", " + d.map.n + ".");
    if (d.map.cont !== false) { if (d.map.csrc !== "file") fetchContours(); } refreshLayers();
  }
  function fetchContours(cb) {
    var d = doc(), m = d.map, F = mapFrame(); if (!m || !d.dscale) return;
    var CM = mapClipM(), Wm = CM.x1 - CM.x0, Hm = CM.y1 - CM.y0, mcx = (CM.x0 + CM.x1) / 2, mcy = (CM.y0 + CM.y1) / 2;
    if (Math.max(Wm, Hm) > 6000) { mapStatus("The sheet covers more than 6 km at this scale, too much LiDAR to fetch. Pick a larger scale (smaller number) for contours."); return; }
    var cell = Math.max(1, Math.ceil(Math.max(Wm, Hm) / 300)), x0 = Math.floor(mcx - Wm / 2 - cell), y0 = Math.floor(mcy - Hm / 2 - cell), nx = Math.ceil((Wm + 2 * cell) / cell), ny = Math.ceil((Hm + 2 * cell) / cell);
    var R = RO(), url = R.EA_WCS + "?service=WCS&version=2.0.1&request=GetCoverage&coverageId=" + R.EA_COVERAGE + "&subset=E(" + x0 + "," + (x0 + nx * cell) + ")&subset=N(" + y0 + "," + (y0 + ny * cell) + ")&scaleSize=i(" + nx + "),j(" + ny + ")&format=text%2Fplain";
    var iv = +$("sk-mapiv").value, sheet = d, key = m.e + "," + m.n;
    mapStatus("Fetching LiDAR terrain from the Environment Agency (" + nx + " × " + ny + " cells at " + cell + " m)…");
    fetch(url).then(function (r) { if (!r.ok) throw new Error("the EA service answered " + r.status); return r.text(); }).then(function (t) {
      var g = R.parseWcsText(t), c = traceContours(g, iv, m.e, m.n);
      if (!sheet.map || sheet.map.e + "," + sheet.map.n !== key) return;
      terrain = { sheet: sheet, fine: g, wide: terrain && terrain.sheet === sheet && !terrain.file ? terrain.wide : null };
      if (cb) cb(g);
      if (!c) { mapStatus("No LiDAR came back for this spot. The EA's LiDAR covers England only, and has a few gaps."); return; }
      c.src = "EA LiDAR DTM © Environment Agency (OGL)"; sheet.map.c = c; sheet.map.csrc = "ea"; persist(); renderAll();
      mapStatus(c.lines.length + " contour lines every " + c.iv + " m" + (c.iv !== iv ? " (widened from " + iv + " m: the ground is steep here)" : "") + ", from the EA's LiDAR terrain model.");
    }).catch(function (err) { mapStatus("Couldn't fetch LiDAR: " + err.message + ". The EA service may be busy; try again. LiDAR covers England only."); });
  }

  /* ---------- From the terrain: sections, catchments and fall arrows ----------
     The last terrain grid is kept in memory (not saved): "fine" is the one the contours came from,
     "wide" a larger, coarser one fetched round a clicked point for catchments. */
  var terrain = null;
  function w2bng(p) { var m = doc().map, F = mapFrame(); return { e: m.e + (p.x - F.cx) * F.mu, n: m.n - (p.y - F.cy) * F.mu }; }
  function bng2w(e, n) { var m = doc().map, F = mapFrame(); return { x: F.cx + (e - m.e) / F.mu, y: F.cy - (n - m.n) / F.mu }; }
  function zAt(g, E, N) { /* bilinear, NaN off the grid or in a gap */
    var top = g.y0 + g.ny * g.cell, fx = (E - g.x0) / g.cell - 0.5, fy = (top - N) / g.cell - 0.5, i = Math.floor(fx), j = Math.floor(fy);
    if (i < 0 || j < 0 || i >= g.nx - 1 || j >= g.ny - 1) return NaN;
    var tx = fx - i, ty = fy - j, z = g.z, n = g.nx, a = z[j * n + i], b = z[j * n + i + 1], c = z[(j + 1) * n + i], d = z[(j + 1) * n + i + 1];
    return (a * (1 - tx) + b * tx) * (1 - ty) + (c * (1 - tx) + d * tx) * ty;
  }
  function niceStep(range, n) { var t = range / Math.max(1, n), L = [0.05, 0.1, 0.2, 0.25, 0.5, 1, 2, 2.5, 5, 10, 20, 25, 50, 100, 200, 250, 500, 1000, 2000, 5000]; for (var i = 0; i < L.length; i++) if (L[i] >= t) return L[i]; return 10000; }
  function getFine(cb) {
    var d = doc(); if (!d.map) { mapStatus("Place the map first."); return; }
    if (terrain && terrain.sheet === d && terrain.fine) return cb(terrain.fine);
    if (d.map.csrc === "file") { mapStatus("Load your LiDAR file again: files aren't kept once the page reloads."); return; }
    fetchContours(cb);
  }
  function getWide(c, cb) {
    var d = doc();
    if (terrain && terrain.sheet === d && terrain.file) return cb(terrain.wide);
    var w = terrain && terrain.sheet === d && terrain.wide;
    if (w) { var fx = (c.e - w.x0) / (w.nx * w.cell), fy = (c.n - w.y0) / (w.ny * w.cell); if (fx > 0.25 && fx < 0.75 && fy > 0.25 && fy < 0.75) return cb(w); }
    var CM = mapClipM(), ext = Math.max(800, Math.min(5000, 3 * Math.max(CM.x1 - CM.x0, CM.y1 - CM.y0))), cell = Math.max(1, Math.ceil(ext / 450)), n = Math.ceil(ext / cell), x0 = Math.round(c.e - n * cell / 2), y0 = Math.round(c.n - n * cell / 2);
    var R = RO(), url = R.EA_WCS + "?service=WCS&version=2.0.1&request=GetCoverage&coverageId=" + R.EA_COVERAGE + "&subset=E(" + x0 + "," + (x0 + n * cell) + ")&subset=N(" + y0 + "," + (y0 + n * cell) + ")&scaleSize=i(" + n + "),j(" + n + ")&format=text%2Fplain";
    mapStatus("Fetching " + (n * cell / 1000).toFixed(1) + " km of LiDAR round that point from the Environment Agency (" + cell + " m cells)…");
    fetch(url).then(function (r) { if (!r.ok) throw new Error("the EA service answered " + r.status); return r.text(); }).then(function (t) {
      var g = R.parseWcsText(t); terrain = { sheet: d, fine: terrain && terrain.sheet === d ? terrain.fine : null, wide: g }; cb(g);
    }).catch(function (er) { mapStatus("Couldn't fetch LiDAR: " + er.message + ". The EA's LiDAR covers England only."); });
  }
  function terrainSrc() { var m = doc().map; return m && m.csrc === "file" && m.c && m.c.src ? m.c.src : "EA LiDAR DTM © Environment Agency (OGL)"; }

  /* A ground section along a line drawn on the map: horizontal at the drawing scale (or smaller, to fit),
     vertical exaggerated so the relief reads, with chainage and level rows. */
  function makeSection(A, B, g) {
    var d = doc(); if (!d.map || !g) return;
    var a = w2bng(A), b = w2bng(B), Lm = Math.hypot(b.e - a.e, b.n - a.n), nS = Math.max(20, Math.min(400, Math.round(Lm / (g.cell / 2)))), pr = [], i;
    var zf = function (ch) { var t = ch / Lm; return zAt(g, a.e + (b.e - a.e) * t, a.n + (b.n - a.n) * t); };
    for (i = 0; i <= nS; i++) pr.push([Lm * i / nS, zf(Lm * i / nS)]);
    var zs = pr.map(function (q) { return q[1]; }).filter(function (z) { return z === z; });
    if (zs.length < 2) { mapStatus("There's no terrain along that line. Fetch EA LiDAR or load a LiDAR file that covers it."); return; }
    var zmn = Math.min.apply(null, zs), zmx = Math.max.apply(null, zs), I = geo().inner, N = d.dscale || 500;
    var Hs = N; if (Lm * 4000 / Hs > I.w * 0.75) Hs = SCALES.filter(function (n) { return Lm * 4000 / n <= I.w * 0.75; })[0] || 10000;
    var R = Math.max(zmx - zmn, 0.5), Vs = SCALES.filter(function (n) { return R * 4000 / n <= 160; })[0] || Hs; if (Vs > Hs) Vs = Hs;
    var hu = 4000 / Hs, vu = 4000 / Vs, ls = niceStep(R, Math.max(2, Math.floor(R * vu / 24))), datum = Math.floor((zmn - ls * 0.5) / ls) * ls, ztop = Math.ceil((zmx + ls * 0.2) / ls) * ls;
    var W = Lm * hu, Hh = (ztop - datum) * vu, x0 = I.x + (I.w - W) / 2 + 50, yb = r1((A.y + B.y) / 2 < I.y + I.h / 2 ? I.y + I.h - 130 : I.y + 50 + Hh); /* on the other half of the sheet from the line */
    var X = function (ch) { return r1(x0 + ch * hu); }, Y = function (z) { return r1(yb - (z - datum) * vu); };
    var gid = "sec" + Date.now().toString(36), C = "#15233a", G2 = "#8a94a6", out = [], lab = nextSectionLetter();
    var add = function (type, ex) { ex.g = gid; if (!ex.c) ex.c = C; out.push(base(type, ex)); };
    var addT = function (x, y, t, sz, ex) { ex = ex || {}; ex.x = r1(x); ex.y = r1(y); ex.text = t; ex.size = sz; add("text", ex); };
    add("rect", { x1: r1(X(0) - 150), y1: r1(Y(ztop) - 24), x2: r1(X(Lm) + 24), y2: r1(yb + 90), w: 1, ls: "solid", c: "#c9d1dc", fill: true });
    var run = [], flush = function () { if (run.length > 1) add("poly", { pts: run, open: true, w: 4, ls: "solid" }); run = []; };
    pr.forEach(function (q) { if (q[1] === q[1]) run.push([X(q[0]), Y(q[1])]); else flush(); }); flush();
    add("line", { x1: X(0), y1: yb, x2: X(Lm), y2: yb, w: 1, ls: "solid" });
    add("line", { x1: X(0), y1: yb, x2: X(0), y2: Y(ztop), w: 1, ls: "solid" });
    for (var z = datum + ls; z <= ztop + 1e-6; z += ls) { var zl = z.toFixed(ls < 1 ? 2 : 1); add("line", { x1: X(0) - 8, y1: Y(z), x2: X(0), y2: Y(z), w: 1, ls: "solid" }); addT(X(0) - 12 - tw(zl, 11), Y(z) - 5, zl, 11); }
    var cs = niceStep(Lm, Math.max(2, Math.floor(W / 70)));
    for (var ch = 0; ch <= Lm + 1e-6; ch += cs) {
      var zc = zf(ch), cl = ch.toFixed(cs < 1 ? 1 : 0), zt = zc === zc ? zc.toFixed(2) : "–";
      add("line", { x1: X(ch), y1: yb, x2: X(ch), y2: yb + 6, w: 1, ls: "solid" });
      if (zc === zc && ch > 0) add("line", { x1: X(ch), y1: Y(zc), x2: X(ch), y2: yb, w: 1, ls: "dotted", c: G2 });
      addT(X(ch) - tw(cl, 10) / 2, yb + 10, cl, 10); addT(X(ch) - tw(zt, 10) / 2, yb + 28, zt, 10);
    }
    addT(X(0) - 30 - tw("Chainage (m)", 10), yb + 10, "Chainage (m)", 10); addT(X(0) - 30 - tw("Ground (m AOD)", 10), yb + 28, "Ground (m AOD)", 10);
    var ve = Hs / Vs;
    addT(X(0), yb + 50, "SECTION " + lab + "–" + lab, 16, { bold: true });
    addT(X(0), yb + 72, "Ground from " + terrainSrc() + ". Horizontal 1:" + Hs + ", vertical 1:" + Vs + (ve > 1 ? " (×" + (Math.round(ve * 10) / 10) + ")" : "") + ". Datum " + datum.toFixed(2) + " m AOD. Indicative only.", 10);
    var mk = base("section", { x1: r1(A.x), y1: r1(A.y), x2: r1(B.x), y2: r1(B.y), label: lab });
    begin(); d.items.push(mk); out.forEach(function (x) { d.items.push(x); }); commit(); persist();
    setSel(out);
    mapStatus("Section " + lab + "–" + lab + " drawn: " + Math.round(Lm) + " m long, ground from " + zmn.toFixed(2) + " to " + zmx.toFixed(2) + " m AOD" + (zs.length < pr.length ? ", with gaps where there's no LiDAR" : "") + ". It's selected, so drag it where you want it.");
  }

  function clipRect(P, x0, y0, x1, y1) { /* Sutherland–Hodgman against an axis-aligned box */
    [[0, x0, 1], [0, x1, -1], [1, y0, 1], [1, y1, -1]].forEach(function (E) {
      var a = E[0], v = E[1], sg = E[2], out = [], ins = function (q) { return (q[a] - v) * sg >= 0; };
      for (var i = 0; i < P.length; i++) {
        var cur = P[i], prev = P[(i + P.length - 1) % P.length], ci = ins(cur), pi = ins(prev);
        if (ci !== pi) { var t = (v - prev[a]) / (cur[a] - prev[a]), q = [prev[0] + (cur[0] - prev[0]) * t, prev[1] + (cur[1] - prev[1]) * t]; out.push([r1(q[0]), r1(q[1])]); }
        if (ci) out.push(cur);
      }
      P = out;
    });
    return P;
  }
  /* The land draining to a clicked point, from a depression-filled D8 flow model of the LiDAR. */
  function findCatchment(p) {
    var d = doc(); if (!d.map) return; var c = w2bng(p);
    getWide(c, function (g) {
      if (doc() !== d || !d.map) return;
      var R = RO(), top = g.y0 + g.ny * g.cell, i = Math.floor((c.e - g.x0) / g.cell), j = Math.floor((top - c.n) / g.cell);
      if (i < 0 || j < 0 || i >= g.nx || j >= g.ny || isNaN(g.z[j * g.nx + i])) { mapStatus("There's no terrain at that point. EA LiDAR covers England only."); return; }
      mapStatus("Working out where the water goes…");
      setTimeout(function () {
        if (!g.an) g.an = R.analyse(g);
        var outlet = R.snap(g, g.an, j * g.nx + i, Math.max(2, Math.round(10 / g.cell))), cat = R.catchment(g, g.an, outlet);
        if (cat.cells < 4) { mapStatus("Hardly any land drains to that point. Click on the line of a ditch or stream, or the lowest point of a hollow."); return; }
        var nx = g.nx + 2, ny = g.ny + 2, z = new Float32Array(nx * ny).fill(-0.5);
        for (var jj = 0; jj < g.ny; jj++) for (var ii = 0; ii < g.nx; ii++) if (cat.mask[jj * g.nx + ii]) z[(jj + 1) * nx + ii + 1] = 0.5;
        var tc = traceContours({ nx: nx, ny: ny, cell: g.cell, x0: g.x0 - g.cell, y0: g.y0 - g.cell, z: z }, 1, 0, 0);
        var loops = (tc ? tc.lines : []).map(function (l) { return l.p.map(function (q) { var w = bng2w(q[0], q[1]); return [r1(w.x), r1(w.y)]; }); }).filter(function (l) { return l.length > 3; });
        if (!loops.length) { mapStatus("Couldn't outline that catchment."); return; }
        var CI = mapClipM().I, inI = function (q) { return q[0] >= CI.x && q[0] <= CI.x + CI.w && q[1] >= CI.y && q[1] <= CI.y + CI.h; };
        loops = loops.map(function (l) { return clipRect(l, CI.x, CI.y, CI.x + CI.w, CI.y + CI.h); }).filter(function (l) { return l.length > 2; });
        if (!loops.length) { mapStatus("That catchment lies outside the map area."); return; }
        loops.sort(function (a2, b2) { return shoelace(b2) - shoelace(a2); });
        var gid = "cat" + Date.now().toString(36), B = "#3f6fd1", out = [], cell2 = function (k2) { var w = bng2w(g.x0 + (k2 % g.nx + 0.5) * g.cell, top - (Math.floor(k2 / g.nx) + 0.5) * g.cell); return [r1(w.x), r1(w.y)]; };
        out.push(base("hatch", { pts: loops[0], holes: loops.slice(1), pat: "diag", ps: 2, outline: true, w: 2, ls: "dashed", c: B, g: gid }));
        var fp = dpS(cat.path.map(cell2).filter(inI), Math.max(1, g.cell / mapFrame().mu * 0.6));
        if (fp.length > 1) {
          out.push(base("poly", { pts: fp, open: true, w: 2, ls: "solid", c: "#0d6b78", g: gid }));
          var q1 = fp[fp.length - 2], q2 = fp[fp.length - 1]; out.push(base("arrow", { x1: q1[0], y1: q1[1], x2: q2[0], y2: q2[1], w: 2, ls: "solid", c: "#0d6b78", g: gid }));
        }
        var A = cat.area, fall = cat.zTop - cat.zOut, at = A >= 10000 ? (A / 10000).toFixed(2) + " ha" : Math.round(A) + " m²";
        var tl = ["Catchment " + at + " (" + (A / 1e6).toFixed(3) + " km²)", "Longest flow path " + Math.round(cat.L) + " m, fall " + fall.toFixed(1) + " m" + (fall > 0.05 ? " (1:" + Math.round(cat.L / fall) + ")" : "")];
        var cx = 0, cy = 0; loops[0].forEach(function (q) { cx += q[0]; cy += q[1]; }); cx /= loops[0].length; cy /= loops[0].length;
        var twm = Math.max(tw(tl[0], 12), tw(tl[1], 12));
        out.push(base("text", { x: r1(cx - twm / 2), y: r1(cy - 15), text: tl.join("\n"), size: 12, mask: true, c: "#15233a", g: gid }));
        begin(); out.forEach(function (x) { d.items.push(x); }); commit(); persist(); setSel(out);
        mapStatus("Catchment of " + at + " found from " + g.cell + " m LiDAR cells; the click was moved onto the nearest flow line. " + (cat.touchesEdge ? "It runs off the edge of the terrain fetched, so the real catchment is bigger: pick a smaller drawing scale (a larger number) and try again, or load a larger LiDAR file. " : "") + "Indicative only: drains, culverts and buildings aren't in the terrain model, so check it on site.");
      }, 30);
    });
  }

  /* Arrows pointing down the steepest fall across the map area, labelled with the gradient. */
  function fallArrows(g) {
    var d = doc(); if (!d.map) return;
    var F = mapFrame(), I = mapClipM().I, sp = 120, hm = Math.max(g.cell * 2, sp * F.mu / 4), out = [], gid = "fa" + Date.now().toString(36), C = "#0d6b78";
    for (var y = I.y + sp / 2; y < I.y + I.h; y += sp) for (var x = I.x + sp / 2; x < I.x + I.w; x += sp) {
      var c = w2bng({ x: x, y: y }), zx1 = zAt(g, c.e - hm, c.n), zx2 = zAt(g, c.e + hm, c.n), zy1 = zAt(g, c.e, c.n - hm), zy2 = zAt(g, c.e, c.n + hm);
      if (!(zx1 === zx1 && zx2 === zx2 && zy1 === zy1 && zy2 === zy2)) continue;
      var gx = (zx2 - zx1) / (2 * hm), gy = (zy2 - zy1) / (2 * hm), s = Math.hypot(gx, gy); if (s < 0.002) continue;
      var ux = -gx / s, uy = gy / s, L = 28, n = 1 / s, lab = "1:" + (n < 10 ? (Math.round(n * 10) / 10) : Math.round(n));
      out.push(base("arrow", { x1: r1(x - ux * L), y1: r1(y - uy * L), x2: r1(x + ux * L), y2: r1(y + uy * L), w: 1.5, ls: "solid", c: C, g: gid }));
      out.push(base("text", { x: r1(x - uy * 14 - tw(lab, 10) / 2), y: r1(y + ux * 14 - 5), text: lab, size: 10, mask: true, c: C, g: gid }));
    }
    if (!out.length) { mapStatus("The ground in the map area is flat (flatter than 1:500) or has no terrain."); return; }
    begin(); out.forEach(function (it) { d.items.push(it); }); commit(); persist(); setSel(out);
    mapStatus(out.length / 2 + " fall arrows added, pointing downhill and labelled with the gradient over about " + Math.round(2 * hm) + " m. They're grouped: select one to move or delete them all.");
  }
  $("sk-mapsect").addEventListener("click", function () { if (!doc().map) { mapStatus("Place the map first."); return; } setMapMode("sect"); });
  $("sk-mapcatch").addEventListener("click", function () { if (!doc().map) { mapStatus("Place the map first."); return; } if (!doc().dscale) { mapStatus("Set a drawing scale first."); return; } setMapMode("catch"); });
  $("sk-mapfall").addEventListener("click", function () { if (!doc().map) { mapStatus("Place the map first."); return; } getFine(fallArrows); });

  /* ---------- DXF export ----------
     Writes an AutoCAD R12 (AC1009) ASCII DXF, which every CAD package reads. Each item is drawn to a
     hidden SVG and its lines, shapes and text are read back with their transforms applied, so symbols
     come out exactly as on screen. Units are millimetres: real-world mm at the drawing scale, or paper
     mm when the sketch is not to scale. Layers follow the kind of item; colours map to the nearest
     AutoCAD colour; line types are carried. Hatches are written as their boundary plus pattern lines. */
  var DXF_LAYER = { stroke: "SK-SKETCH", line: "SK-LINES", arrow: "SK-LINES", rect: "SK-LINES", circle: "SK-LINES", poly: "SK-LINES", brk: "SK-LINES",
    cloud: "SK-REVISION", member: "SK-STRUCTURE", support: "SK-STRUCTURE", pload: "SK-LOADS", udl: "SK-LOADS", moment: "SK-LOADS", dim: "SK-DIMS",
    text: "SK-TEXT", leader: "SK-NOTES", hatch: "SK-HATCH", section: "SK-SYMBOLS", north: "SK-SYMBOLS", slope: "SK-SYMBOLS", wl: "SK-SYMBOLS" };
  var DXF_LT = { dashed: "DASHED", dashdot: "DASHDOT", dotted: "DOTTED", centre: "CENTER" };
  function aci(col) {
    var m = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(col || ""), rgb = /rgba?\((\d+),\s*(\d+),\s*(\d+)/.exec(col || ""), r, g, b;
    if (m) { r = parseInt(m[1], 16); g = parseInt(m[2], 16); b = parseInt(m[3], 16); } else if (rgb) { r = +rgb[1]; g = +rgb[2]; b = +rgb[3]; } else return 256;
    var mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 510, sat = mx === mn ? 0 : (mx - mn) / (255 - Math.abs(mx + mn - 255));
    if (sat < 0.25 || mx - mn < 40) return l > 0.75 ? 9 : l > 0.35 ? 8 : 7;
    var h = mx === r ? ((g - b) / (mx - mn) + 6) % 6 : mx === g ? (b - r) / (mx - mn) + 2 : (r - g) / (mx - mn) + 4; h *= 60;
    return h < 18 || h >= 330 ? 1 : h < 48 ? 30 : h < 70 ? 2 : h < 165 ? 3 : h < 200 ? 4 : h < 260 ? 5 : 6;
  }
  function dxfText(t) { return String(t).replace(/[^\x20-\x7e]/g, function (ch) { return "\\U+" + ("000" + ch.charCodeAt(0).toString(16).toUpperCase()).slice(-4); }); }
  function exportDxf() {
    var d = doc(), G = geo(), N = d.dscale || 1, f = 0.25 * N, out = [], n = 0, ext = [1e9, 1e9, -1e9, -1e9];
    function X(x) { return x * f; } function Y(y) { return (G.H - y) * f; }
    function num(v) { return (Math.round(v * 1e4) / 1e4).toString(); }
    function pair(code, x, y) { var px = X(x), py = Y(y); ext[0] = Math.min(ext[0], px); ext[1] = Math.min(ext[1], py); ext[2] = Math.max(ext[2], px); ext[3] = Math.max(ext[3], py); out.push(code, num(px), code + 10, num(py), code + 20, "0"); }
    function head0(type, L, col, lt) { out.push("0", type, "8", L); if (lt) out.push("6", lt); if (col !== 256) out.push("62", String(col)); n++; }
    function line(a, b, L, col, lt) { head0("LINE", L, col, lt); pair(10, a[0], a[1]); pair(11, b[0], b[1]); }
    function pline(pts, closed, L, col, lt, elev) {
      if (pts.length < 2) return; if (pts.length === 2 && !closed && elev == null) return line(pts[0], pts[1], L, col, lt);
      head0("POLYLINE", L, col, lt); out.push("66", "1", "70", closed ? "1" : "0", "10", "0", "20", "0", "30", elev == null ? "0" : num(elev * 1000));
      pts.forEach(function (q) { out.push("0", "VERTEX", "8", L); pair(10, q[0], q[1]); }); out.push("0", "SEQEND", "8", L);
    }
    function solid(pts, L, col) { head0("SOLID", L, col); var q = pts.length === 3 ? [pts[0], pts[1], pts[2], pts[2]] : [pts[0], pts[1], pts[3], pts[2]]; q.forEach(function (v, i) { pair(10 + i, v[0], v[1]); }); }
    function circle(c, r, L, col) { head0("CIRCLE", L, col); pair(10, c[0], c[1]); out.push("40", num(r * f)); }
    function text(p, h, s2, rot, just, L, col) {
      head0("TEXT", L, col); pair(10, p[0], p[1]); out.push("40", num(h * f), "1", dxfText(s2)); if (rot) out.push("50", num(rot));
      if (just) { out.push("72", String(just)); pair(11, p[0], p[1]); }
    }
    /* walk an SVG fragment drawn into a hidden sheet-sized SVG */
    var host = document.createElementNS(NS, "svg"); host.setAttribute("viewBox", "0 0 " + G.W + " " + G.H); host.setAttribute("width", G.W); host.setAttribute("height", G.H);
    host.style.cssText = "position:absolute;left:-100000px;top:0;visibility:hidden"; document.body.appendChild(host);
    function walk(markup, L0, ls) {
      host.innerHTML = markup;
      Array.prototype.forEach.call(host.querySelectorAll("line,rect,circle,path,polygon,polyline,text"), function (el) {
        var L = el.closest(".sk-wm") ? "SK-WATERMARK" : L0, cs = getComputedStyle(el), st = cs.stroke, fl = cs.fill, hasS = st && st !== "none", hasF = fl && fl !== "none" && !/url\(/.test(fl);
        var col = aci(hasS ? st : fl), white = !hasS && hasF && aci(fl) === 9 && /255, 255, 255/.test(fl);
        if (white) return; if (L === "SK-WATERMARK") col = 9;
        var M = el.getCTM(), T = function (x, y) { return [M.a * x + M.c * y + M.e, M.b * x + M.d * y + M.f]; }, sc = Math.sqrt(Math.abs(M.a * M.d - M.b * M.c));
        var da = el.getAttribute("stroke-dasharray"), lt = da ? (DXF_LT[ls] || "CENTER") : null, tag = el.tagName.toLowerCase(), A = function (k2) { return +el.getAttribute(k2) || 0; };
        if (tag === "text") {
          var fs = parseFloat(el.getAttribute("font-size")) || 14, an = el.getAttribute("text-anchor"), rot = -Math.atan2(M.b, M.a) * 180 / Math.PI;
          text(T(A("x"), A("y")), fs * 0.72 * sc, el.textContent, Math.abs(rot) > 0.01 ? rot : 0, an === "middle" ? 1 : an === "end" ? 2 : 0, L, col); return;
        }
        if (tag === "line") { line(T(A("x1"), A("y1")), T(A("x2"), A("y2")), L, col, lt); return; }
        if (tag === "circle") { var r = A("r") * sc; if (r > 0) circle(T(A("cx"), A("cy")), r, L, col); return; }
        if (tag === "rect") { var x = A("x"), y = A("y"), w = A("width"), h = A("height"); if (!w || !h) return; pline([T(x, y), T(x + w, y), T(x + w, y + h), T(x, y + h)], true, L, col, lt); return; }
        var dd = tag === "path" ? el.getAttribute("d") || "" : "M" + (el.getAttribute("points") || "") + (tag === "polygon" ? "Z" : "");
        var loops = [];
        if (/[ACQSTacqst]/.test(dd)) { /* curves: sample along the path */
          var tl = el.getTotalLength(), steps = Math.max(8, Math.ceil(tl / 3)), pts = [];
          for (var i = 0; i <= steps; i++) { var q = el.getPointAtLength(tl * i / steps); pts.push(T(q.x, q.y)); }
          loops.push({ pts: pts, closed: /[Zz]\s*$/.test(dd) });
        } else {
          var tok = dd.match(/[MLHVZmlhvz]|-?[\d.]+(?:e-?\d+)?/g) || [], cur = null, cx2 = 0, cy2 = 0, cmd = "M", sx = 0, sy = 0;
          for (var j = 0; j < tok.length;) {
            var t2 = tok[j]; if (/[A-Za-z]/.test(t2)) { cmd = t2; j++; if (cmd === "Z" || cmd === "z") { if (cur) { cur.closed = true; } cx2 = sx; cy2 = sy; cur = null; } continue; }
            var rel = cmd === cmd.toLowerCase(), C = cmd.toUpperCase();
            if (C === "H") { cx2 = (rel ? cx2 : 0) + +tok[j++]; } else if (C === "V") { cy2 = (rel ? cy2 : 0) + +tok[j++]; } else { cx2 = (rel ? cx2 : 0) + +tok[j++]; cy2 = (rel ? cy2 : 0) + +tok[j++]; }
            if (C === "M" || !cur) { cur = { pts: [], closed: false }; loops.push(cur); sx = cx2; sy = cy2; if (C === "M") cmd = rel ? "l" : "L"; }
            cur.pts.push(T(cx2, cy2));
          }
        }
        loops.forEach(function (lp) {
          if (hasF && !hasS && lp.pts.length >= 3 && lp.pts.length <= 4) solid(lp.pts, L, col);
          else pline(lp.pts, lp.closed || (hasF && !hasS), L, col, lt);
        });
      });
    }
    /* hatch pattern lines: parallel lines clipped to the hatch loops (even-odd) */
    var HP = { diag: [[-45, 14]], cross: [[-45, 14], [45, 14]], steel: [[-45, 6]], earth: [[-45, 10]] };
    function hatchLines(it, L, col) {
      var spec = HP[it.pat]; if (!spec) return; var loops = [it.pts].concat(it.holes || []), ps = it.ps || 1;
      spec.forEach(function (sp) {
        var a = sp[0] * Math.PI / 180, ca = Math.cos(a), sa = Math.sin(a), gap = sp[1] / Math.SQRT2 * ps;
        var rot = loops.map(function (lp) { return lp.map(function (q) { return [q[0] * ca + q[1] * sa, -q[0] * sa + q[1] * ca]; }); });
        var y0 = 1e9, y1 = -1e9; rot.forEach(function (lp) { lp.forEach(function (q) { y0 = Math.min(y0, q[1]); y1 = Math.max(y1, q[1]); }); });
        for (var yy = Math.ceil(y0 / gap) * gap; yy <= y1; yy += gap) {
          var xs = [];
          rot.forEach(function (lp) { for (var i = 0; i < lp.length; i++) { var p1 = lp[i], p2 = lp[(i + 1) % lp.length]; if ((p1[1] <= yy) !== (p2[1] <= yy)) xs.push(p1[0] + (yy - p1[1]) / (p2[1] - p1[1]) * (p2[0] - p1[0])); } });
          xs.sort(function (u, v) { return u - v; });
          for (var k2 = 0; k2 + 1 < xs.length; k2 += 2) line([xs[k2] * ca - yy * sa, xs[k2] * sa + yy * ca], [xs[k2 + 1] * ca - yy * sa, xs[k2 + 1] * sa + yy * ca], L, col);
        }
      });
    }
    var layers = {}, skipped = 0, insetSkipped = 0;
    try {
      if (d.showDraw) d.items.forEach(function (it) {
        var L = DXF_LAYER[it.type] || "SK-OTHER", col = aci(it.c || "#15233a"); layers[L] = 1;
        if (it.type === "hatch") {
          [it.pts].concat(it.holes || []).forEach(function (lp) { if (it.outline) pline(lp, true, L, col, DXF_LT[it.ls]); else pline(lp, true, "SK-HATCH-BOUNDARY", col); });
          if (!it.outline) layers["SK-HATCH-BOUNDARY"] = 1;
          hatchLines(it, L, col); if (!HP[it.pat]) skipped++;
          return;
        }
        if (it.type === "inset") { insetSkipped++; layers["SK-DETAILS"] = 1; walk(insetFrame(it), "SK-DETAILS"); return; }
        walk(draw(it), L, it.ls);
      });
      if (d.map && d.map.show !== false && d.map.cont !== false && d.map.c && d.dscale) {
        var MF = mapFrame(); layers["SK-CONTOURS"] = 1;
        var dO = cOff(d.map, d.map.c); d.map.c.lines.forEach(function (l) { pline(l.p.map(function (q) { return [MF.cx + (q[0] + dO[0]) / MF.mu, MF.cy - (q[1] + dO[1]) / MF.mu]; }), false, "SK-CONTOURS", 34, null, l.z); });
        if (d.map.on) mapLayers().forEach(function (L) { var lay = d.map.L && d.map.L[L.id]; if (!d.map.on[L.id] || !lay || !lay.f) return; var lo = cOff(d.map, lay), LN = "SK-MAP-" + L.id.toUpperCase(); layers[LN] = 1; lay.f.forEach(function (f) { f.r.forEach(function (rg) { pline(rg.map(function (q) { return [MF.cx + (q[0] + lo[0]) / MF.mu, MF.cy - (q[1] + lo[1]) / MF.mu]; }), !L.line, LN, aci(L.stroke)); }); }); });
      }
      walk(frameStr(true), "SK-FRAME"); layers["SK-FRAME"] = 1; if (d.wm) layers["SK-WATERMARK"] = 1;
    } finally { host.remove(); }
    /* the file */
    var LT = [["CONTINUOUS", "Solid line", []], ["DASHED", "Dashed __ __ __", [5, -3]], ["DASHDOT", "Dash dot __ . __ .", [8, -3, 0, -3]], ["DOTTED", "Dotted . . . .", [0, -2.4]], ["CENTER", "Centre ____ _ ____", [14, -3, 3, -3]]];
    var hd = ["0", "SECTION", "2", "HEADER", "9", "$ACADVER", "1", "AC1009", "9", "$INSBASE", "10", "0", "20", "0", "30", "0",
      "9", "$EXTMIN", "10", num(ext[0]), "20", num(ext[1]), "30", "0", "9", "$EXTMAX", "10", num(ext[2]), "20", num(ext[3]), "30", "0",
      "9", "$LIMMIN", "10", "0", "20", "0", "9", "$LIMMAX", "10", num(G.W * f), "20", num(G.H * f), "9", "$LTSCALE", "40", num(N * 1.5), "9", "$INSUNITS", "70", "4", "0", "ENDSEC"];
    var tb = ["0", "SECTION", "2", "TABLES", "0", "TABLE", "2", "LTYPE", "70", String(LT.length)];
    LT.forEach(function (l) { tb.push("0", "LTYPE", "2", l[0], "70", "0", "3", l[1], "72", "65", "73", String(l[2].length), "40", num(l[2].reduce(function (a, b) { return a + Math.abs(b); }, 0))); l[2].forEach(function (v) { tb.push("49", num(v)); }); });
    tb.push("0", "ENDTAB", "0", "TABLE", "2", "LAYER", "70", String(Object.keys(layers).length + 1), "0", "LAYER", "2", "0", "70", "0", "62", "7", "6", "CONTINUOUS");
    Object.keys(layers).forEach(function (L) { tb.push("0", "LAYER", "2", L, "70", "0", "62", L === "SK-WATERMARK" ? "9" : L === "SK-HATCH" || L === "SK-HATCH-BOUNDARY" ? "8" : "7", "6", "CONTINUOUS"); });
    tb.push("0", "ENDTAB", "0", "TABLE", "2", "STYLE", "70", "1", "0", "STYLE", "2", "STANDARD", "70", "0", "40", "0", "41", "1", "50", "0", "71", "0", "42", "2.5", "3", "txt", "4", "", "0", "ENDTAB", "0", "ENDSEC");
    var all = hd.concat(tb, ["0", "SECTION", "2", "ENTITIES"], out, ["0", "ENDSEC", "0", "EOF"]);
    var note = (d.map && d.map.osm !== false ? "The OpenStreetMap backdrop isn't included in the DXF. " : "") + "DXF saved: " + n + " objects on " + Object.keys(layers).length + " layers, in millimetres " + (d.dscale ? "at true size (1:" + N + ")." : "at paper size (the sketch is not to scale).") + " Line weights, images and the underlay aren't included." + (insetSkipped ? " Detail windows go in as their frame and title only." : "") + (skipped ? " Concrete, sand, granular and solid hatches come out as their boundary only." : "");
    return { text: all.join("\r\n") + "\r\n", note: note, count: n };
  }

  /* ---------- Pick-point hatch ----------
     Rasterises the lines and strokes (thickened by a small gap tolerance), flood-fills from the clicked point
     inside the drawing frame, then traces the filled region back into outline loops. Loops inside the region
     (islands) become holes. The hatch remembers the point and the items that bound it, and is traced again
     whenever one of those items changes. */
  var hatchBy = "pick", GAP = 4; /* 4 units = 1 mm on the printed sheet */
  $("sk-hby").addEventListener("change", function () { hatchBy = this.value; pend = null; renderLive(); setTool("hatch"); });
  /* Each item's outline as polylines, for working out which items bound a hatch. */
  function outlineOf(it) {
    if (it.type === "rect") { var a = Math.min(it.x1, it.x2), b = Math.min(it.y1, it.y2), c = Math.max(it.x1, it.x2), d = Math.max(it.y1, it.y2); return [[a, b], [c, b], [c, d], [a, d], [a, b]]; }
    if (it.type === "circle") { var R = Math.hypot(it.x2 - it.x1, it.y2 - it.y1), o = [], n = Math.max(16, Math.ceil(R / 4)); for (var i = 0; i <= n; i++) o.push([it.x1 + R * Math.cos(i / n * 2 * Math.PI), it.y1 + R * Math.sin(i / n * 2 * Math.PI)]); return o; }
    if (it.type === "stroke") return it.pts;
    if (it.type === "hatch" || it.type === "poly") return it.pts.concat([it.pts[0]]);
    return [[it.x1, it.y1], [it.x2, it.y2]];
  }
  function bndCandidates() { return doc().items.filter(function (it) { return /^(stroke|line|member|rect|circle|poly|arrow)$/.test(it.type) || (it.type === "hatch" && it.outline && !it.seed); }); }
  function strokeItem(cx, it) {
    cx.lineWidth = (it.w || 2) + 2 * GAP; cx.beginPath();
    if (it.type === "rect") { cx.rect(Math.min(it.x1, it.x2), Math.min(it.y1, it.y2), Math.abs(it.x2 - it.x1), Math.abs(it.y2 - it.y1)); }
    else if (it.type === "circle") { cx.arc(it.x1, it.y1, Math.hypot(it.x2 - it.x1, it.y2 - it.y1), 0, Math.PI * 2); }
    else if (it.type === "stroke" || it.type === "hatch" || it.type === "poly") {
      var loops = [it.pts].concat(it.holes || []);
      loops.forEach(function (pts) { pts.forEach(function (q, i) { if (i) cx.lineTo(q[0], q[1]); else cx.moveTo(q[0], q[1]); }); if (it.type !== "stroke") cx.closePath(); if (pts.length === 1) cx.lineTo(pts[0][0] + 0.01, pts[0][1]); });
    } else { cx.moveTo(it.x1, it.y1); cx.lineTo(it.x2, it.y2); }
    cx.stroke();
  }
  function traceRegion(seed) {
    var G = geo(), W = G.W, Hh = G.H, cv = document.createElement("canvas"); cv.width = W; cv.height = Hh;
    var cx = cv.getContext("2d"); cx.lineCap = "round"; cx.lineJoin = "round"; cx.strokeStyle = "#000";
    var cands = bndCandidates(); cands.forEach(function (it) { strokeItem(cx, it); });
    var px = cx.getImageData(0, 0, W, Hh).data, wall = new Uint8Array(W * Hh), i;
    for (i = 0; i < W * Hh; i++) wall[i] = px[i * 4 + 3] > 40 ? 1 : 0;
    var x0 = Math.ceil(G.inner.x), y0 = Math.ceil(G.inner.y), x1 = Math.floor(G.inner.x + G.inner.w) - 1, y1 = Math.floor(G.inner.y + G.inner.h) - 1;
    var sx = Math.round(seed.x), sy = Math.round(seed.y);
    if (sx < x0 || sx > x1 || sy < y0 || sy > y1) return { err: "Click inside the drawing frame." };
    if (wall[sy * W + sx]) return { err: "That's on a line. Click inside the area you want hatched." };
    /* scanline flood fill */
    var fill = new Uint8Array(W * Hh), stack = [sx, sy], open = false, count = 0;
    while (stack.length) {
      var y = stack.pop(), x = stack.pop(), xl = x, xr = x;
      if (fill[y * W + x]) continue;
      while (xl > x0 && !wall[y * W + xl - 1] && !fill[y * W + xl - 1]) xl--;
      while (xr < x1 && !wall[y * W + xr + 1] && !fill[y * W + xr + 1]) xr++;
      if (xl === x0 || xr === x1 || y === y0 || y === y1) { open = true; break; }
      for (var xx = xl; xx <= xr; xx++) {
        fill[y * W + xx] = 1; count++;
        if (!wall[(y - 1) * W + xx] && !fill[(y - 1) * W + xx]) stack.push(xx, y - 1);
        if (!wall[(y + 1) * W + xx] && !fill[(y + 1) * W + xx]) stack.push(xx, y + 1);
      }
    }
    if (open) return { err: "That area isn't closed, so the hatch would spill across the sheet. Close the gap (gaps under about 2 mm are bridged) or drag a rectangle instead." };
    if (count < 30) return { err: "That area is too small to hatch." };
    /* grow the region back out to the line centres, which also closes the bridged gaps */
    var r = GAP + 1, tmp = new Uint8Array(W * Hh), grown = new Uint8Array(W * Hh), yy;
    for (yy = 0; yy < Hh; yy++) { var run = -1e9; for (xx = 0; xx < W; xx++) { if (fill[yy * W + xx]) run = xx; if (xx - run <= r) tmp[yy * W + xx] = 1; } run = 1e9; for (xx = W - 1; xx >= 0; xx--) { if (fill[yy * W + xx]) run = xx; if (run - xx <= r) tmp[yy * W + xx] = 1; } }
    for (xx = 0; xx < W; xx++) { var rn = -1e9; for (yy = 0; yy < Hh; yy++) { if (tmp[yy * W + xx]) rn = yy; if (yy - rn <= r) grown[yy * W + xx] = 1; } rn = 1e9; for (yy = Hh - 1; yy >= 0; yy--) { if (tmp[yy * W + xx]) rn = yy; if (rn - yy <= r) grown[yy * W + xx] = 1; } }
    /* which items bound it: any sample along an item that the grown region reaches */
    var bids = cands.filter(function (it) {
      var segs = outlineOf(it), d = (it.w || 2) / 2 + 1;
      for (var j = 0; j < segs.length; j++) {
        var a = segs[j], b = segs[j + 1] || a, n = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / 3));
        for (var t = 0; t <= n; t++) { var qx = Math.round(a[0] + (b[0] - a[0]) * t / n), qy = Math.round(a[1] + (b[1] - a[1]) * t / n);
          for (var o = -d; o <= d; o += d) { var ix = Math.min(W - 1, Math.max(0, qx + Math.round(o))), iy = Math.min(Hh - 1, Math.max(0, qy)); if (grown[iy * W + ix]) return true; ix = Math.min(W - 1, Math.max(0, qx)); iy = Math.min(Hh - 1, Math.max(0, qy + Math.round(o))); if (grown[iy * W + ix]) return true; } }
        if (!segs[j + 1]) break;
      }
      return false;
    }).map(function (it) { return it.id; });
    return { loops: contours(grown, W, Hh), bids: bids };
  }
  /* Pixel-edge contour tracing, then straight runs merged and the outline simplified. */
  function contours(m, W, Hh) {
    var nxt = {}, x, y, W1 = W + 1;
    function add(ax, ay, bx, by) { var k1 = ay * W1 + ax; (nxt[k1] || (nxt[k1] = [])).push(by * W1 + bx); }
    for (y = 1; y < Hh - 1; y++) for (x = 1; x < W - 1; x++) {
      if (!m[y * W + x]) continue;
      if (!m[(y - 1) * W + x]) add(x, y, x + 1, y);
      if (!m[y * W + x + 1]) add(x + 1, y, x + 1, y + 1);
      if (!m[(y + 1) * W + x]) add(x + 1, y + 1, x, y + 1);
      if (!m[y * W + x - 1]) add(x, y + 1, x, y);
    }
    var loops = [];
    Object.keys(nxt).forEach(function (sk) {
      var start = +sk;
      while (nxt[start] && nxt[start].length) {
        var loop = [], cur = start, guard = 0;
        do { loop.push([cur % W1, Math.floor(cur / W1)]); var l = nxt[cur]; var nk = l.pop(); if (!l.length) delete nxt[cur]; cur = nk; } while (cur !== start && nxt[cur] && ++guard < 2e6);
        if (loop.length > 3) loops.push(loop);
      }
    });
    function area(L) { var a = 0; for (var i = 0; i < L.length; i++) { var p = L[i], q = L[(i + 1) % L.length]; a += p[0] * q[1] - q[0] * p[1]; } return Math.abs(a / 2); }
    function dp(P, eps) {
      if (P.length < 3) return P;
      var a = P[0], b = P[P.length - 1], dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1, md = 0, mi = 0;
      for (var i = 1; i < P.length - 1; i++) { var d = L > 1e-9 ? Math.abs(dy * P[i][0] - dx * P[i][1] + b[0] * a[1] - b[1] * a[0]) / L : Math.hypot(P[i][0] - a[0], P[i][1] - a[1]); if (d > md) { md = d; mi = i; } }
      if (md <= eps) return [a, b];
      return dp(P.slice(0, mi + 1), eps).slice(0, -1).concat(dp(P.slice(mi), eps));
    }
    return loops.filter(function (L) { return area(L) > 12; }).map(function (L) {
      var far = 0, fd = 0; L.forEach(function (p, i) { var d = Math.hypot(p[0] - L[0][0], p[1] - L[0][1]); if (d > fd) { fd = d; far = i; } });
      var s1 = dp(L.slice(0, far + 1), 0.9), s2 = dp(L.slice(far).concat([L[0]]), 0.9);
      return s1.slice(0, -1).concat(s2.slice(0, -1));
    }).sort(function (a, b) { return area(b) - area(a); });
  }
  function sigOf(ids) { var s = ids.map(function (id) { var it = byId(id); return it ? JSON.stringify([it.pts, it.holes, it.x1, it.y1, it.x2, it.y2, it.w]) : "x"; }).join("|"), h = 5381; for (var i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0; return String(h); }
  function pickHatch(p) {
    var t0 = Date.now(), r = traceRegion(p);
    if (r.err) { status(r.err); return; }
    var it = base("hatch", { pts: r.loops[0], holes: r.loops.slice(1), pat: style.pat, outline: false, w: Math.min(style.w, 4), ls: style.ls, seed: { x: r1(p.x), y: r1(p.y) }, bids: r.bids, sig: sigOf(r.bids) });
    begin(); doc().items.unshift(it); commit(); selectAfterCreate(it); /* picked hatches sit under the lines that bound them */
    status("Hatched " + (r.loops.length > 1 ? "the area, leaving " + (r.loops.length - 1) + (r.loops.length === 2 ? " island" : " islands") + " clear" : "the area") + ". It follows its boundary if you edit those lines." + (Date.now() - t0 > 1500 ? "" : ""));
  }
  /* Called on every commit: re-trace any picked hatch whose boundary items have changed. */
  function reHatch() {
    var warn = false;
    doc().items.forEach(function (it) {
      if (it.type !== "hatch" || !it.seed || !it.bids) return;
      var sg = sigOf(it.bids); if (sg === it.sig) return;
      var r = traceRegion(it.seed);
      if (r.err) { it.sig = sg; warn = true; return; }
      it.pts = r.loops[0]; it.holes = r.loops.slice(1); it.bids = r.bids; it.sig = sigOf(r.bids);
    });
    if (warn) status("A hatch kept its last shape because its boundary is no longer closed.");
  }

  /* ---------- Typical details ---------- */
  var TPL = window.CPSketchTemplates || [];
  (function () {
    var groups = [], o = '<option value="">Insert typical detail…</option>';
    TPL.forEach(function (t) { if (groups.indexOf(t.group) < 0) groups.push(t.group); });
    groups.forEach(function (g) { o += '<optgroup label="' + esc(g) + '">' + TPL.map(function (t, i) { return t.group === g ? '<option value="' + i + '">' + esc(t.name) + "</option>" : ""; }).join("") + "</optgroup>"; });
    $("sk-tpl").innerHTML = o;
  })();
  function buildTemplate(t) {
    var items = [], K = "#15233a", GREY = "#7a7f87";
    function add(type, o) { o.type = type; o.c = o.c || K; items.push(o); return o; }
    function wOf(o, d) { return o && o.w != null ? o.w : d; }
    var T = {
      L: function (x1, y1, x2, y2, o) { o = o || {}; return add("line", { x1: x1, y1: y1, x2: x2, y2: y2, w: wOf(o, 2), ls: o.ls || "solid", c: o.c }); },
      PL: function (pts, o) { for (var i = 1; i < pts.length; i++) T.L(pts[i - 1][0], pts[i - 1][1], pts[i][0], pts[i][1], o); },
      R: function (x1, y1, x2, y2) { return [[x1, y1], [x2, y1], [x2, y2], [x1, y2]]; },
      H: function (pts, pat, o) { o = o || {}; return add("hatch", { pts: pts, pat: pat, outline: o.outline !== false, w: wOf(o, 1.6), ls: o.ls || "solid", c: o.c || GREY, oc: o.oc || K }); },
      circ: function (cx, cy, r, n) { var p = []; n = n || 36; for (var i = 0; i < n; i++) { var a = i / n * Math.PI * 2; p.push([r1(cx + r * Math.cos(a)), r1(cy + r * Math.sin(a))]); } return p; },
      C: function (cx, cy, r, pat, o) { return T.H(T.circ(cx, cy, r), pat || "solid", o); },
      X: function (x, y, text, size, bold, c) { return add("text", { x: x, y: y, text: text, size: size || 14, bold: !!bold, c: c }); },
      N: function (ax, ay, tx, ty, text, right) { var w = 0; String(text).split("\n").forEach(function (l) { w = Math.max(w, tw(l, 14)); }); var W = w + 18, bx = right ? tx - W / 2 : tx + W / 2; return add("leader", { ax: ax, ay: ay, bx: r1(bx), by: ty, text: text, nobox: true }); },
      D: function (x1, y1, x2, y2, off, label) { return add("dim", { x1: x1, y1: y1, x2: x2, y2: y2, o: off, label: label || "" }); },
      B: function (x1, y1, x2, y2) { return add("member", { x1: x1, y1: y1, x2: x2, y2: y2, w: 4, ls: "solid" }); },
      S: function (kind, x, y, rot) { return add("support", { kind: kind, x: x, y: y, rot: rot || 0 }); },
      F: function (x, y, ang, label) { return add("pload", { x: x, y: y, ang: ang, label: label }); },
      U: function (x1, y1, x2, y2, label, side) { return add("udl", { x1: x1, y1: y1, x2: x2, y2: y2, label: label, side: side || 1 }); },
      M: function (x, y, dir, label) { return add("moment", { x: x, y: y, dir: dir, label: label }); }
    };
    t.build(T);
    return items;
  }
  function insertTemplate(i) {
    var t = TPL[i]; if (!t) return;
    var items = buildTemplate(t), G = geo(), g = newId("g");
    var xs = [], ys = [];
    items.forEach(function (it) {
      if (it.pts) it.pts.forEach(function (p) { xs.push(p[0]); ys.push(p[1]); });
      if ("x1" in it) { xs.push(it.x1, it.x2); ys.push(it.y1, it.y2); }
      if ("x" in it) { xs.push(it.x); ys.push(it.y); }
      if (it.type === "leader") { xs.push(it.ax, it.bx); ys.push(it.ay, it.by); }
    });
    var mx = (Math.min.apply(null, xs) + Math.max.apply(null, xs)) / 2, my = (Math.min.apply(null, ys) + Math.max.apply(null, ys)) / 2;
    var area = { x: G.inner.x, y: G.inner.y, w: G.inner.w, h: G.inner.h - G.tb.h };
    var dx = Math.round((area.x + area.w / 2 - mx) / GRID) * GRID, dy = Math.round((area.y + area.h / 2 - my) / GRID) * GRID;
    begin();
    items.forEach(function (it) { var n = shifted(it, dx, dy); n.id = newId(); n.g = g; doc().items.push(n); });
    commit();
    setTool("select"); sel = { k: "group", g: g }; renderContent(); renderProps();
    status(t.name + " added as an indicative sketch. Click a part twice to edit its label, or Ungroup it. Check it against the governing standard before you rely on it.");
  }
  $("sk-tpl").addEventListener("change", function () { var v = this.value; this.value = ""; if (v !== "") insertTemplate(+v); });

  /* Other tools (for example the manhole generator) can send a finished SVG detail here.
     It lands on the underlay layer as an image, sized from its viewBox in paper millimetres. */
  function importDetail(o) {
    if (!o || !o.svg) return false;
    var m = /viewBox="\s*([-\d.]+)[\s,]+([-\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/.exec(o.svg), G = geo();
    var wmm = m ? +m[3] : 200, hmm = m ? +m[4] : 150, w = wmm * 4, h = hmm * 4, ah = G.inner.h - G.tb.h, f = Math.min(1, G.inner.w * 0.94 / w, ah * 0.94 / h);
    var svgStr = /xmlns=/.test(o.svg) ? o.svg : o.svg.replace("<svg", '<svg xmlns="' + NS + '"');
    var src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgStr)));
    var im = { id: newId("u"), src: src, x: r1(G.inner.x + G.inner.w / 2), y: r1(G.inner.y + ah / 2), w: r1(w * f), h: r1(h * f), rot: 0, op: 1, from: o.source || "" };
    begin(); doc().under.push(im); doc().showUnder = true; doc().lockUnder = false;
    if (o.title && !doc().tb.title) doc().tb.title = String(o.title);
    commit();
    if (location.hash !== "#sketch") location.hash = "#sketch";
    tool[mode] = "select"; renderTools(); sel = { k: "img", id: im.id }; renderUI(); renderProps();
    status((o.title || "Detail") + " added to sheet " + (doc().tb.ref || "") + (f < 1 ? ", scaled to fit the sheet" : o.scale ? " (" + o.scale + ")" : "") + ". Tick \"Lock underlay\" to draw over it.");
    return true;
  }

  /* For tests and the example sheet */
  window.CPSketch = { importDetail: importDetail, exportSvg: exportSvg, exportDxf: exportDxf, toPng: toPng, exportPdf: exportPdf, insertTemplate: insertTemplate, state: function () { return S; }, setMode: setMode, setTool: setTool, render: function () { underKey = ""; renderAll(); renderProps(); } };

  window.addEventListener("resize", function () { if (!view.hidden) { renderAll(); if (tbKey) closeTB(true); } });
  /* On opening, scroll so the toolbars sit at the top of the window with the sheet below them. */
  function isFull() { return document.fullscreenElement === app || app.classList.contains("sk-full"); }
  function setFull(on) {
    if (on) { if (app.requestFullscreen) app.requestFullscreen().catch(function () { app.classList.add("sk-full"); afterFull(); }); else { app.classList.add("sk-full"); afterFull(); } }
    else { if (document.fullscreenElement) document.exitFullscreen(); app.classList.remove("sk-full"); afterFull(); }
  }
  function afterFull() { var f = isFull(); $("sk-full").setAttribute("aria-pressed", f); $("sk-full").textContent = f ? "Exit full screen" : "Full screen"; app.style.setProperty("--sk-top", f ? "0px" : ((document.querySelector(".topbar") || {}).offsetHeight || 0) + "px"); setTimeout(function () { renderAll(); measureK(); renderUI(); }, 60); }
  $("sk-full").addEventListener("click", function () { setFull(!isFull()); });
  document.addEventListener("fullscreenchange", afterFull);
  function toTop() { var top = document.querySelector(".topbar"), th = top ? top.offsetHeight : 0; window.scrollTo(0, Math.max(0, app.getBoundingClientRect().top + window.scrollY - th - 8)); }
  new MutationObserver(function () { if (!view.hidden) setTimeout(function () { renderAll(); if (window.innerWidth > 760) toTop(); }, 30); }).observe(view, { attributes: true, attributeFilter: ["hidden"] });
  renderTools(); renderAll(); renderProps();
})();
