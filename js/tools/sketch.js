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
  var NOTE = "NOT TO SCALE. This sketch is indicative only and must not be used for construction.";
  var COLORS = [["#15233a", "Black"], ["#b84a32", "Red"], ["#0d6b78", "Teal"], ["#3f6fd1", "Blue"], ["#2e7d32", "Green"], ["#b07a06", "Amber"], ["#7a7f87", "Grey"]];
  var WIDTHS = [[1, "Hairline"], [2, "Fine"], [4, "Medium"], [7, "Heavy"], [14, "Marker"]];
  var LINES = [["solid", "Solid"], ["dashed", "Dashed"], ["dashdot", "Dash-dot"], ["dotted", "Dotted"], ["centre", "Centreline"]];
  var PATS = [["diag", "Diagonal"], ["cross", "Cross-hatch"], ["concrete", "Concrete"], ["earth", "Soil / earth"], ["steel", "Steel"], ["solid", "Solid tint"]];
  var SEG = { member: 1, line: 1, udl: 1, dim: 1 }, PTS = { stroke: 1, hatch: 1 };
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
    roller: '<path d="M12 5l-6 9h12z"/><circle cx="9" cy="17" r="1.6"/><circle cx="15" cy="17" r="1.6"/><path d="M4 20h16"/>',
    fixed: '<path d="M6 4v16" stroke-width="2.4"/><path d="M6 7L3 10M6 12l-3 3M6 17l-3 3"/><path d="M6 12h14"/>',
    pload: '<path d="M12 3v15"/><path d="M7 13l5 5 5-5"/>',
    udl: '<path d="M3 5h18M5 5v12M12 5v12M19 5v12"/><path d="M3 15l2 2 2-2M10 15l2 2 2-2M17 15l2 2 2-2"/>',
    moment: '<path d="M17 16A6.5 6.5 0 1 1 18 9"/><path d="M18 4v5h-5"/>',
    dim: '<path d="M3 12h18M3 7v10M21 7v10"/><path d="M6 10l-3 2 3 2M18 10l3 2-3 2"/>'
  };
  var TOOLS = {
    free: [["select", "Select"], ["pen", "Pen"], ["line", "Line"], ["eraser", "Eraser"], ["hatch", "Hatch"], ["text", "Text"], ["leader", "Leader"]],
    struct: [["select", "Select"], ["member", "Member"], ["pin", "Pin"], ["roller", "Roller"], ["fixed", "Fixed"], ["pload", "Point load"], ["udl", "UDL"], ["moment", "Moment"], ["dim", "Dimension"], ["hatch", "Hatch"], ["text", "Text"], ["leader", "Leader"]]
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
    dim: "Drag between two points to dimension them. The length comes from the grid scale unless you type your own."
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
  function snapPt(p, opts) {
    var d = doc(); opts = opts || {};
    if (mode !== "struct" || !d.snap || opts.free) return { x: r1(p.x), y: r1(p.y) };
    var best = null, bd = 12 * Math.max(k, 1);
    d.items.forEach(function (it) {
      if (!SEG[it.type] || it.id === opts.skip) return;
      segPts(it).forEach(function (q) { var dd = dist(p, q); if (dd < bd) { bd = dd; best = q; } });
    });
    if (best) return { x: best.x, y: best.y };
    return { x: Math.round(p.x / GRID) * GRID, y: Math.round(p.y / GRID) * GRID };
  }
  function snapDelta(v) { return mode === "struct" && doc().snap ? Math.round(v / GRID) * GRID : r1(v); }

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
  function arrow(x1, y1, x2, y2, c, w, s) { var L = Math.hypot(x2 - x1, y2 - y1) || 1, ux = (x2 - x1) / L, uy = (y2 - y1) / L; s = s || 12; return ln(x1, y1, x2 - ux * s * 0.8, y2 - uy * s * 0.8, c, w) + head(x2, y2, ux, uy, c, s); }
  function txt(x, y, s, c, sz, anchor, extra) { return '<text x="' + r1(x) + '" y="' + r1(y) + '" font-family="' + FONT + '" font-size="' + (sz || 14) + '" fill="' + c + '" text-anchor="' + (anchor || "start") + '"' + (extra || "") + ">" + esc(s) + "</text>"; }
  function smooth(pts) {
    if (!pts.length) return "";
    if (pts.length === 1) return "M" + pts[0][0] + " " + pts[0][1] + "l0.01 0";
    var d = "M" + pts[0][0] + " " + pts[0][1];
    for (var i = 1; i < pts.length - 1; i++) { var a = pts[i], b = pts[i + 1]; d += "Q" + a[0] + " " + a[1] + " " + r1((a[0] + b[0]) / 2) + " " + r1((a[1] + b[1]) / 2); }
    var l = pts[pts.length - 1]; return d + "L" + l[0] + " " + l[1];
  }
  function hpath(it) { return poly(it.pts) + (it.holes || []).map(poly).join(""); }
  function poly(pts) { return "M" + pts.map(function (p) { return p[0] + " " + p[1]; }).join("L") + "Z"; }
  function patId(pat, c) { return "hp-" + pat + "-" + c.replace(/[^0-9a-z]/gi, ""); }
  function patDef(pat, c) {
    var id = patId(pat, c), L = function (d, w) { return '<path d="' + d + '" stroke="' + c + '" stroke-width="' + (w || 1) + '" fill="none" stroke-linecap="round"/>'; }, body, s;
    if (pat === "diag") { s = 14; body = L("M0 14L14 0M-4 4L4 -4M10 18L18 10"); }
    else if (pat === "cross") { s = 14; body = L("M0 14L14 0M-4 4L4 -4M10 18L18 10M0 0L14 14M-4 10L4 18M10 -4L18 4"); }
    else if (pat === "steel") { s = 6; body = L("M0 6L6 0M-2 2L2 -2M4 8L8 4", 0.9); }
    else if (pat === "earth") { s = 40; body = L("M3 17l9-9M8 19l9-9M13 21l9-9M23 37l9-9M28 39l9-9", 1.1) + '<circle cx="30" cy="10" r="1.3" fill="' + c + '"/><circle cx="8" cy="33" r="1.3" fill="' + c + '"/><circle cx="36" cy="20" r="1" fill="' + c + '"/>'; }
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
        return '<path d="' + hpath(it) + '" fill-rule="evenodd" fill="url(#' + patId(it.pat, c) + ')" stroke="' + (it.outline ? it.oc || c : "none") + '" stroke-width="' + (it.w || 2) + '" stroke-linejoin="round"' + (it.outline ? dash(it.ls, it.w || 2) : "") + "/>";
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
        return o + txt(lx, ly, lab, c, it.fs || 14, "middle", ' transform="rotate(' + r1(ang) + " " + r1(lx) + " " + r1(ly) + ')"');
      case "text":
        var sz = it.size || 18, ls = String(it.text || "").split("\n");
        return '<text font-family="' + FONT + '" font-size="' + sz + '" fill="' + c + '"' + (it.bold ? ' font-weight="bold"' : "") + ">" + ls.map(function (l, j) { return '<tspan x="' + it.x + '" y="' + r1(it.y + sz * 0.85 + j * sz * 1.25) + '">' + (esc(l) || " ") + "</tspan>"; }).join("") + "</text>";
      case "leader":
        var b = leaderBox(it), A = anchorOf(it), cx = it.bx, cy = it.by, ddx = A.x - cx, ddy = A.y - cy, f = Math.min(Math.abs(ddx) > 0.01 ? (b.w / 2) / Math.abs(ddx) : 1e9, Math.abs(ddy) > 0.01 ? (b.h / 2) / Math.abs(ddy) : 1e9);
        if (it.nobox) { var ex = A.x < b.x ? b.x - 3 : A.x > b.x + b.w ? b.x + b.w + 3 : null; if (ex !== null) o += arrow(ex, cy, A.x, A.y, c, 1.2, 10); b.lines.forEach(function (l, j) { o += txt(b.x + 9, b.y + 6 + b.sz * 1.3 * j + b.sz, l, c, b.sz); }); return o; }
        if (f < 1) o += arrow(cx + ddx * f, cy + ddy * f, A.x, A.y, c, 1.5, 11);
        o += '<rect x="' + r1(b.x) + '" y="' + r1(b.y) + '" width="' + r1(b.w) + '" height="' + r1(b.h) + '" rx="3" fill="#fff" stroke="' + c + '" stroke-width="1.5"/>';
        b.lines.forEach(function (l, j) { o += txt(b.x + 9, b.y + 6 + b.sz * 1.3 * j + b.sz, l, c, b.sz); });
        return o;
    }
    return "";
  }
  function dimAuto(it) { var L = Math.hypot(it.x2 - it.x1, it.y2 - it.y1) / GRID * (doc().scale || 0.2); return (Math.round(L * 100) / 100) + " m"; }
  function hit(it) {
    var w = Math.max(16 * k, 10), T = 'stroke="transparent" fill="none" pointer-events="stroke" stroke-linecap="round" stroke-width="';
    switch (it.type) {
      case "stroke": return '<path d="' + smooth(it.pts) + '" ' + T + Math.max(w, it.w + 8) + '"/>';
      case "line": case "member": return '<line x1="' + it.x1 + '" y1="' + it.y1 + '" x2="' + it.x2 + '" y2="' + it.y2 + '" ' + T + Math.max(w, it.w + 8) + '"/>';
      case "udl": var n = norm(it), sd = it.side === -1 ? -1 : 1; return '<path d="M' + r1(it.x1 + n.nx * sd * 8) + " " + r1(it.y1 + n.ny * sd * 8) + "L" + r1(it.x2 + n.nx * sd * 8) + " " + r1(it.y2 + n.ny * sd * 8) + "L" + r1(it.x2 + n.nx * sd * 42) + " " + r1(it.y2 + n.ny * sd * 42) + "L" + r1(it.x1 + n.nx * sd * 42) + " " + r1(it.y1 + n.ny * sd * 42) + 'Z" fill="transparent" pointer-events="all"/>';
      case "dim": var dn = norm(it), off = it.o == null ? 30 : it.o; return '<line x1="' + r1(it.x1 + dn.nx * off) + '" y1="' + r1(it.y1 + dn.ny * off) + '" x2="' + r1(it.x2 + dn.nx * off) + '" y2="' + r1(it.y2 + dn.ny * off) + '" ' + T + w + '"/>';
      case "hatch": return '<path d="' + hpath(it) + '" fill-rule="evenodd" fill="transparent" pointer-events="all"/>';
      case "leader": var A = anchorOf(it); return '<line x1="' + it.bx + '" y1="' + it.by + '" x2="' + A.x + '" y2="' + A.y + '" ' + T + w + '"/>';
      case "text": return "";
      case "pload": var a = (it.ang == null ? 90 : it.ang) * Math.PI / 180; return '<line x1="' + it.x + '" y1="' + it.y + '" x2="' + r1(it.x - Math.cos(a) * 72) + '" y2="' + r1(it.y - Math.sin(a) * 72) + '" ' + T + Math.max(w, 18) + '"/>';
      default: return '<circle cx="' + it.x + '" cy="' + it.y + '" r="' + Math.max(26, w) + '" fill="transparent" pointer-events="all"/>';
    }
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
        '<label class="sr-only" for="sk-fmt">Export format</label><select id="sk-fmt"><option value="png">PNG image</option><option value="jpeg">JPEG image</option><option value="svg">SVG drawing</option><option value="pdf">PDF, this sheet</option><option value="pdfall">PDF, all sheets</option></select><button type="button" class="btn" id="sk-export">Export</button></div>' +
    "</div>" +
    '<div class="sk-toolrow"><div class="sk-tools" id="sk-tools" role="toolbar" aria-label="Drawing tools"></div>' +
      '<label class="sr-only" for="sk-tpl">Insert a typical detail</label><select id="sk-tpl" class="sk-tpl"></select></div>' +
    '<div class="sk-style">' +
      '<div class="sk-group"><span class="sk-lab">Colour</span><div class="sk-swatches" id="sk-swatches"></div><label class="sk-pick" title="Pick any colour"><span class="sr-only">Custom colour</span><input type="color" id="sk-color"></label></div>' +
      '<div class="sk-group"><span class="sk-lab">Weight</span><div class="sk-chips" id="sk-widths"></div></div>' +
      '<div class="sk-group"><label class="sk-lab" for="sk-ls">Line</label><select id="sk-ls">' + LINES.map(function (l) { return '<option value="' + l[0] + '">' + l[1] + "</option>"; }).join("") + "</select></div>" +
      '<div class="sk-group"><label class="sk-lab" for="sk-fs">Text</label><select id="sk-fs">' + [8, 10, 12, 14, 16, 18, 24, 32].map(function (v) { return '<option value="' + v + '">' + v + "</option>"; }).join("") + "</select></div>" +
      '<div class="sk-group"><label class="sk-lab" for="sk-pat">Hatch</label><select id="sk-pat">' + PATS.map(function (l) { return '<option value="' + l[0] + '">' + l[1] + "</option>"; }).join("") + "</select>" +
        '<label class="sr-only" for="sk-hby">Hatch by</label><select id="sk-hby"><option value="pick">Click inside an area</option><option value="shape">Draw a shape</option></select></div>' +
    "</div>" +
    '<div class="sk-style sk-sheetopts">' +
      '<div class="sk-seg sk-seg-sm" role="group" aria-label="Paper size"><button type="button" data-paper="A4">A4</button><button type="button" data-paper="A3">A3</button></div>' +
      '<div class="sk-seg sk-seg-sm" role="group" aria-label="Orientation"><button type="button" data-orient="land">Landscape</button><button type="button" data-orient="port">Portrait</button></div>' +
      '<label class="sk-check"><input type="checkbox" id="sk-showframe"> Frame</label>' +
      '<label class="sk-check">Title block <select id="sk-tbs"><option value="small">Small</option><option value="medium">Medium</option><option value="large">Large</option><option value="off">Off</option></select></label>' +
      '<label class="sk-check"><input type="checkbox" id="sk-rev"> Revisions</label><button type="button" class="sk-btn" id="sk-addrev">Add revision</button>' +
      '<label class="sk-check"><input type="checkbox" id="sk-grid"> Grid</label>' +
      '<label class="sk-check" data-only="struct"><input type="checkbox" id="sk-snap"> Snap</label>' +
      '<label class="sk-check" data-only="struct">Grid square = <input type="number" id="sk-scale" min="0.01" step="0.05" style="width:5.5em"> m</label>' +
      '<span class="sk-layers"><span class="sk-lab">Layers</span>' +
        '<label class="sk-check"><input type="checkbox" id="sk-show-draw"> Drawing</label><label class="sk-check"><input type="checkbox" id="sk-lock-draw"> Lock drawing</label>' +
        '<label class="sk-check"><input type="checkbox" id="sk-show-under"> Underlay</label><label class="sk-check"><input type="checkbox" id="sk-lock-under"> Lock underlay</label>' +
        '<button type="button" class="sk-btn" id="sk-img-btn">Add image to trace</button><input type="file" id="sk-img" accept="image/*" hidden></span>' +
    "</div>" +
    "</div>" +
    '<div class="sk-tabs" id="sk-tabs" role="tablist" aria-label="Sheets"></div>' +
    '<div class="sk-stage" id="sk-stage">' +
      '<svg id="sk-svg" xmlns="' + NS + '" role="img" aria-label="Sketch sheet"><defs id="sk-defs"></defs><rect id="sk-bg" fill="#fff"/><g id="sk-under"></g><g id="sk-gridg"></g><g id="sk-content"></g><g id="sk-frame"></g><g id="sk-live"></g><g id="sk-ui"></g></svg>' +
      '<input type="text" id="sk-tb-edit" class="sk-tb-edit" hidden aria-label="Title block field">' +
      '<div class="sk-drop" id="sk-drop" hidden>Drop the image to trace over it</div>' +
    "</div>" +
    '<div class="sk-props" id="sk-props" aria-live="polite"></div>' +
    '<p class="small sk-status" id="sk-status" role="status"></p>';

  var svg = $("sk-svg"), gDefs = $("sk-defs"), gUnder = $("sk-under"), gGrid = $("sk-gridg"), gContent = $("sk-content"), gFrame = $("sk-frame"), gLive = $("sk-live"), gUI = $("sk-ui"), stage = $("sk-stage");
  function status(msg) { $("sk-status").textContent = msg || ""; }

  /* ---------- Rendering ---------- */
  function contentStr(forExport) {
    var d = doc(), pats = {}, s = "";
    d.items.forEach(function (it) {
      if (it.type === "hatch") pats[patId(it.pat, it.c)] = patDef(it.pat, it.c);
      s += forExport ? draw(it) : '<g data-id="' + it.id + '"' + (isOn(it) ? ' class="sk-on"' : "") + '><g class="v">' + draw(it) + "</g>" + (locked(it) ? "" : hit(it)) + "</g>";
    });
    return { s: s, defs: Object.keys(pats).map(function (p) { return pats[p]; }).join("") };
  }
  function gridDefs() {
    return '<pattern id="sk-g1" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M20 0H0V20" fill="none" stroke="#e1e8e7" stroke-width="0.8"/></pattern>' +
      '<pattern id="sk-g5" width="100" height="100" patternUnits="userSpaceOnUse"><rect width="100" height="100" fill="url(#sk-g1)"/><path d="M100 0H0V100" fill="none" stroke="#c9d4d3" stroke-width="1"/></pattern>';
  }
  function gridStr() { var g = geo().inner; return '<rect x="' + g.x + '" y="' + g.y + '" width="' + g.w + '" height="' + g.h + '" fill="url(#sk-g5)"/>'; }
  function tbGet(key) { var d = doc(), m = /^r\.(\d+)\.(\w+)$/.exec(key); if (m) return ((d.revs || [])[+m[1]] || {})[m[2]] || ""; if (key === "note") return d.tb.note == null ? NOTE : d.tb.note; if (key === "scale") return d.tb.scale == null ? "NTS" : d.tb.scale; return d.tb[key] || ""; }
  function tbSet(key, v) { var d = doc(), m = /^r\.(\d+)\.(\w+)$/.exec(key); if (m) { d.revs = d.revs || []; while (d.revs.length <= +m[1]) d.revs.push({ rev: "", date: "", desc: "", by: "" }); d.revs[+m[1]][m[2]] = v; } else d.tb[key] = v; }
  function frameStr(forExport) {
    var G = geo(), d = doc(), c = "#15233a", o = "";
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
  function fitSheet() {
    var G = geo(), top = document.querySelector(".topbar"), th = top ? top.offsetHeight : 0, hh = window.innerWidth > 760 ? $("sk-head").offsetHeight : 0;
    app.style.setProperty("--sk-top", th + "px");
    var avail = window.innerHeight - th - hh - $("sk-tabs").offsetHeight - 36;
    svg.style.maxWidth = Math.max(320, avail * G.W / G.H) + "px";
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
          if (it.type === "hatch" && !it.seed) it.pts.forEach(function (q, i) { o += hnd("v" + i, q[0], q[1]); });
          if (it.type === "leader") { var A = anchorOf(it); o += hnd("anc", A.x, A.y); }
        }
      }
    }
    gUI.innerHTML = o;
  }
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
  function renderTools() {
    $("sk-tools").innerHTML = TOOLS[mode].map(function (t) { return '<button type="button" class="sk-tool" data-tool="' + t[0] + '" aria-pressed="' + (tool[mode] === t[0]) + '" title="' + esc(HINTS[t[0]]) + '">' + iconSvg(t[0]) + "<span>" + t[1] + "</span></button>"; }).join("");
    Array.prototype.forEach.call(app.querySelectorAll("[data-mode]"), function (b) { b.setAttribute("aria-pressed", b.dataset.mode === mode); });
    Array.prototype.forEach.call(app.querySelectorAll("[data-only]"), function (el) { el.hidden = el.dataset.only !== mode; });
    stage.dataset.tool = tool[mode];
  }
  $("sk-swatches").innerHTML = COLORS.map(function (c) { return '<button type="button" class="sk-sw" data-color="' + c[0] + '" style="background:' + c[0] + '" title="' + c[1] + '" aria-label="' + c[1] + '"></button>'; }).join("");
  $("sk-widths").innerHTML = WIDTHS.map(function (w) { return '<button type="button" class="sk-chip" data-w="' + w[0] + '" title="' + w[1] + '" aria-label="' + w[1] + '"><i style="height:' + Math.min(w[0], 10) + 'px"></i></button>'; }).join("");
  function syncControls() {
    var d = doc();
    Array.prototype.forEach.call(app.querySelectorAll("[data-color]"), function (b) { b.setAttribute("aria-pressed", b.dataset.color === style.c); });
    Array.prototype.forEach.call(app.querySelectorAll("[data-w]"), function (b) { b.setAttribute("aria-pressed", +b.dataset.w === style.w); });
    Array.prototype.forEach.call(app.querySelectorAll("[data-orient]"), function (b) { b.setAttribute("aria-pressed", b.dataset.orient === d.orient); });
    $("sk-color").value = style.c; $("sk-ls").value = style.ls; $("sk-pat").value = style.pat;
    $("sk-grid").checked = d.grid; $("sk-snap").checked = d.snap; $("sk-scale").value = d.scale;
    $("sk-show-draw").checked = d.showDraw; $("sk-lock-draw").checked = d.lockDraw; $("sk-show-under").checked = d.showUnder; $("sk-lock-under").checked = d.lockUnder;
    Array.prototype.forEach.call(app.querySelectorAll("[data-paper]"), function (b) { b.setAttribute("aria-pressed", b.dataset.paper === (d.paper || "A4")); });
    $("sk-showframe").checked = d.frame !== false; $("sk-tbs").value = d.tbs || "medium"; $("sk-rev").checked = !!d.showRev; $("sk-addrev").hidden = !d.showRev || geo().tb.off; $("sk-fs").value = style.fs;
    $("sk-tabs").innerHTML = S.sheets.map(function (s, i) {
      var on = i === S.cur;
      return '<span class="sk-tab' + (on ? " on" : "") + '"><button type="button" role="tab" data-sheet="' + i + '" aria-selected="' + on + '" title="' + esc(s.tb.title || "") + '">' + esc(s.tb.ref || "Sheet " + (i + 1)) + (s.tb.title ? '<small>' + esc(s.tb.title.length > 22 ? s.tb.title.slice(0, 21) + "…" : s.tb.title) + "</small>" : "") + "</button>" +
        (on && S.sheets.length > 1 ? '<button type="button" class="sk-tabx" id="sk-del" aria-label="Delete this sheet" title="Delete this sheet">×</button>' : "") + "</span>";
    }).join("") + '<button type="button" class="sk-tabadd" id="sk-new" title="New sheet">+ New sheet</button>';
    $("sk-undo").disabled = !H().u.length; $("sk-redo").disabled = !H().r.length;
  }
  function setMode(m) { mode = m; S.mode = m; pend = null; sel = null; persist(); renderTools(); renderAll(); renderLive(); renderProps(); }
  function setTool(t) { if (pend && t !== "hatch") finishHatch(); tool[mode] = t; renderTools(); if (t !== "select") sel = null; renderUI(); renderProps(); }

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
    if (b.dataset.tool) return setTool(b.dataset.tool);
    if (b.dataset.color) { style.c = b.dataset.color; restyle(function (it) { it.c = style.c; }); syncControls(); return; }
    if (b.dataset.w) { style.w = +b.dataset.w; restyle(function (it) { if ("w" in it) it.w = style.w; }); syncControls(); return; }
    if (b.dataset.paper) { if ((doc().paper || "A4") !== b.dataset.paper) setOrient(null, b.dataset.paper); return; }
    if (b.dataset.orient) { if (doc().orient !== b.dataset.orient) setOrient(b.dataset.orient); return; }
  });
  $("sk-fs").addEventListener("change", function () { style.fs = +this.value; restyle(function (it) { if (it.type === "text") it.size = style.fs; else if (it.type === "leader" || it.label != null || it.type === "dim") it.fs = style.fs; }); renderProps(); });
  $("sk-color").addEventListener("input", function () { style.c = this.value; syncControls(); });
  $("sk-color").addEventListener("change", function () { style.c = this.value; restyle(function (it) { it.c = style.c; }); });
  $("sk-ls").addEventListener("change", function () { style.ls = this.value; restyle(function (it) { if (it.type === "stroke" || it.type === "line" || it.type === "member" || it.type === "hatch") it.ls = style.ls; }); });
  $("sk-pat").addEventListener("change", function () { style.pat = this.value; if (tool[mode] !== "hatch" && !(sel && byId(sel.id) && byId(sel.id).type === "hatch")) setTool("hatch"); restyle(function (it) { if (it.type === "hatch") it.pat = style.pat; }); renderProps(); });
  function opt(id, key, after) { $(id).addEventListener("change", function () { doc()[key] = this.type === "checkbox" ? this.checked : +this.value || doc()[key]; persist(); if (after) after(); renderAll(); }); }
  opt("sk-showframe", "frame"); 
  $("sk-tbs").addEventListener("change", function () { begin(); doc().tbs = this.value; commit(); });
  $("sk-rev").addEventListener("change", function () { begin(); var d = doc(); d.showRev = this.checked; if (d.showRev && !(d.revs && d.revs.length)) d.revs = [{ rev: "P01", date: today(), desc: "First issue", by: "" }]; commit(); });
  $("sk-addrev").addEventListener("click", function () {
    var d = doc(), last = (d.revs || []).slice(-1)[0], m = last && /^([A-Za-z]*)(\d+)$/.exec(last.rev || ""), nr = m ? m[1] + ("0" + (+m[2] + 1)).slice(-Math.max(2, m[2].length)) : "";
    begin(); d.revs = (d.revs || []).concat([{ rev: nr, date: today(), desc: "", by: last ? last.by : "" }]); commit(); setTimeout(function () { openTB("r." + (d.revs.length - 1) + ".desc"); }, 0);
  });
  opt("sk-grid", "grid"); opt("sk-snap", "snap"); opt("sk-scale", "scale");
  opt("sk-show-draw", "showDraw"); opt("sk-lock-draw", "lockDraw", function () { sel = null; renderProps(); });
  opt("sk-show-under", "showUnder", function () { underKey = ""; if (sel && sel.k === "img") { sel = null; renderProps(); } });
  opt("sk-lock-under", "lockUnder", function () { if (sel && sel.k === "img") { sel = null; renderProps(); } });
  $("sk-undo").addEventListener("click", undo); $("sk-redo").addEventListener("click", redo);
  $("sk-clear").addEventListener("click", function () { if (!doc().items.length) return; begin(); doc().items = doc().items.filter(function (it) { return it.lock; }); sel = null; commit(); renderProps(); status("Cleared the drawing (locked items kept). Undo brings it back."); });

  /* ---------- Sheets ---------- */
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
  var ROT_TYPES = { support: 90, pload: 45 };
  function renderProps() {
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
          '<button type="button" class="sk-btn" data-act="dup" title="Ctrl+D">Duplicate</button><button type="button" class="sk-btn" data-act="glock">Lock</button><button type="button" class="sk-btn danger" data-act="gdel">Delete</button>');
      return;
    }
    if (!it) { p.innerHTML = '<span class="small">' + esc(HINTS[tool[mode]] || "") + "</span>"; return; }
    var NAMES = { stroke: "Pen stroke", line: "Line", member: "Member", support: "Support", pload: "Point load", udl: "Distributed load", moment: "Moment", dim: "Dimension", text: "Text", leader: "Leader note", hatch: "Hatched area" };
    var h = '<span class="sk-lab">' + NAMES[it.type] + "</span>";
    if (locked(it)) {
      h += '<span class="small">' + (doc().lockDraw ? "The drawing is locked. Untick \"Lock drawing\" to change it." : "Locked in place.") + "</span>";
      if (it.lock && !doc().lockDraw) h += '<button type="button" class="sk-btn" data-act="unlock">Unlock</button>';
      p.innerHTML = h; return;
    }
    if (it.type === "support") h += '<select id="skp-kind" aria-label="Support type"><option value="pin">Pinned</option><option value="roller">Roller</option><option value="fixed">Fixed</option></select>';
    if (it.type === "text" || it.type === "leader") h += '<textarea id="skp-text" rows="2" aria-label="Text">' + esc(it.text) + "</textarea>";
    if (it.type === "text") h += '<select id="skp-size" aria-label="Text size">' + [12, 14, 18, 24, 32, 44].map(function (s) { return '<option value="' + s + '"' + ((it.size || 18) === s ? " selected" : "") + ">" + s + " pt</option>"; }).join("") + '</select><label class="sk-check"><input type="checkbox" id="skp-bold"' + (it.bold ? " checked" : "") + "> Bold</label>";
    if (it.type === "pload" || it.type === "udl" || it.type === "moment" || it.type === "dim") h += '<input type="text" id="skp-label" value="' + esc(it.label || "") + '" placeholder="' + (it.type === "dim" ? esc(dimAuto(it)) : "Value") + '" aria-label="Label" style="width:9em">';
    if (ROT_TYPES[it.type]) h += '<button type="button" class="sk-btn" data-act="rot">Rotate</button>';
    if (it.type === "udl" || it.type === "dim") h += '<button type="button" class="sk-btn" data-act="flip">Flip side</button>';
    if (it.type === "moment") h += '<button type="button" class="sk-btn" data-act="dir">Reverse</button>';
    if (it.type === "hatch") h += '<select id="skp-pat" aria-label="Hatch pattern">' + PATS.map(function (x) { return '<option value="' + x[0] + '"' + (it.pat === x[0] ? " selected" : "") + ">" + x[1] + "</option>"; }).join("") + '</select><label class="sk-check"><input type="checkbox" id="skp-outline"' + (it.outline ? " checked" : "") + "> Outline</label>";
    if (it.type === "leader") h += '<label class="sk-check"><input type="checkbox" id="skp-box"' + (it.nobox ? "" : " checked") + "> Box</label>";
    if (it.type === "leader" && it.att) h += '<button type="button" class="sk-btn" data-act="detach">Detach arrow</button>';
    h += '<button type="button" class="sk-btn" data-act="dup" title="Ctrl+D">Duplicate</button><button type="button" class="sk-btn" data-act="lock" title="Stop this item being moved by accident">Lock</button><button type="button" class="sk-btn danger" data-act="del">Delete</button>';
    p.innerHTML = h;
    if ($("skp-kind")) $("skp-kind").value = it.kind;
  }
  function liveEdit(id, fn) {
    var el = $(id); if (!el) return;
    el.addEventListener("focus", begin);
    el.addEventListener("input", function () { var it = byId(sel.id); if (!it) return; fn(it, el); renderContent(); });
    el.addEventListener("change", function () { var it = byId(sel.id); if (!it) return; fn(it, el); commit(); });
    el.addEventListener("blur", function () { if (before !== null) commit(); });
  }
  var propsEl = $("sk-props");
  new MutationObserver(function () {
    liveEdit("skp-text", function (it, el) { it.text = el.value; });
    liveEdit("skp-label", function (it, el) { it.label = el.value; });
    liveEdit("skp-size", function (it, el) { it.size = +el.value; });
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
    else if (a === "flip") { if (it.type === "udl") it.side = it.side === -1 ? 1 : -1; else it.o = -(it.o == null ? 30 : it.o); }
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
  function base(type, extra) { var o = { id: newId(), type: type, c: style.c }; if (/^(leader|pload|udl|moment|dim)$/.test(type)) o.fs = style.fs; for (var p in extra) o[p] = extra[p]; return o; }
  function addItem(it) { begin(); doc().items.push(it); commit(); return it; }
  function constrain(a, p) { var dx = p.x - a.x, dy = p.y - a.y, ang = Math.round(Math.atan2(dy, dx) / (Math.PI / 4)) * (Math.PI / 4), L = Math.hypot(dx, dy); return { x: r1(a.x + Math.cos(ang) * L), y: r1(a.y + Math.sin(ang) * L) }; }
  function finishHatch() {
    if (!pend) return; var pts = pend.pts; pend = null; renderLive();
    if (pts.length >= 3) { var it = addItem(base("hatch", { pts: pts, pat: style.pat, outline: true, w: Math.min(style.w, 4), ls: style.ls })); selectAfterCreate(it); }
  }
  function selectAfterCreate(it) { sel = { k: "item", id: it.id }; renderContent(); renderProps(); }

  svg.addEventListener("pointerdown", function (e) {
    if (e.button !== 0) return;
    measureK();
    var p = world(e), d = doc(), t = tool[mode];
    var tbc = e.target.closest("[data-tb]"); if (tbc && !pend) { e.preventDefault(); openTB(tbc.dataset.tb); return; }
    if (tbKey) closeTB(true);
    try { svg.setPointerCapture(e.pointerId); } catch (er) {}
    e.preventDefault();
    var h = e.target.closest("[data-h]");
    if (h && h.dataset.h !== "first" && sel) {
      begin();
      if (sel.k === "img") { var im = imgById(sel.id); drag = { type: "ih", h: h.dataset.h, orig: clone(im), d0: Math.hypot(p.x - im.x, p.y - im.y) || 1 }; }
      else drag = { type: "h", h: h.dataset.h, orig: clone(byId(sel.id)) };
      return;
    }
    if (t === "select") {
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
    if (t === "hatch") {
      var sp = snapPt(p);
      if (pend) {
        if (pend.pts.length >= 3 && dist(sp, { x: pend.pts[0][0], y: pend.pts[0][1] }) < 14 * Math.max(k, 1)) { finishHatch(); return; }
        var last = pend.pts[pend.pts.length - 1]; if (dist(sp, { x: last[0], y: last[1] }) > 2) pend.pts.push([sp.x, sp.y]); renderLive(); return;
      }
      drag = { type: "hatch0", start: sp, raw: { x: p.x, y: p.y } }; return;
    }
    if (t === "member" || t === "line" || t === "udl" || t === "dim") {
      var a = snapPt(p), ex = { x1: a.x, y1: a.y, x2: a.x, y2: a.y };
      if (t !== "udl" && t !== "dim") { ex.w = t === "member" ? Math.max(style.w, 4) : style.w; ex.ls = style.ls; }
      if (t === "udl") ex.label = "10 kN/m";
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
  function focusText() { setTimeout(function () { var el = $("skp-text"); if (el) { el.focus({ preventScroll: true }); el.select(); } }, 0); }
  function eraseAt(e) { var it = itemAt(e); if (it && !locked(it)) { removeItem(it.id); renderContent(); } }

  window.addEventListener("pointermove", function (e) {
    if (pend && !drag) { var sp = snapPt(world(e)); pend.cur = sp; renderLive(); return; }
    if (!drag) return;
    var p = world(e), it;
    switch (drag.type) {
      case "pen":
        var evs = e.getCoalescedEvents ? e.getCoalescedEvents() : [e]; if (!evs.length) evs = [e];
        evs.forEach(function (ev) { var q = world(ev), l = drag.item.pts[drag.item.pts.length - 1]; if (Math.hypot(q.x - l[0], q.y - l[1]) > 1.5 * Math.max(k, 0.5)) drag.item.pts.push([r1(q.x), r1(q.y)]); });
        drag.el.innerHTML = draw(drag.item); return;
      case "erase": eraseAt(e); return;
      case "seg":
        var b = snapPt(p); if (e.shiftKey) b = constrain(drag.a, b);
        drag.temp.x2 = b.x; drag.temp.y2 = b.y; renderLive(); return;
      case "hatch0": if (dist(p, drag.start) > 8 * Math.max(k, 1)) drag.type = "hatchR";
      /* falls through */
      case "hatchR":
        if (drag.type !== "hatchR") return;
        var c = snapPt(p), s = drag.start; drag.temp = base("hatch", { pts: [[s.x, s.y], [c.x, s.y], [c.x, c.y], [s.x, c.y]], pat: style.pat, outline: true, w: Math.min(style.w, 4), ls: style.ls }); renderLive(); return;
      case "leader": if (dist(p, drag.start) > 10) { drag.temp.bx = r1(p.x); drag.temp.by = r1(p.y); drag.moved = true; } renderLive(); return;
      case "marquee": drag.cur = p; var m0 = drag.start, wq = Math.abs(p.x - m0.x), hq = Math.abs(p.y - m0.y);
        gLive.innerHTML = '<rect x="' + r1(Math.min(p.x, m0.x)) + '" y="' + r1(Math.min(p.y, m0.y)) + '" width="' + r1(wq) + '" height="' + r1(hq) + '" class="sk-marq"/>'; return;
      case "gmove":
        var gdx = snapDelta(p.x - drag.start.x), gdy = snapDelta(p.y - drag.start.y); drag.orig.forEach(function (o) { replaceItem(shifted(o, gdx, gdy)); }); renderContent(); return;
      case "move":
        var n = shifted(drag.orig, snapDelta(p.x - drag.start.x), snapDelta(p.y - drag.start.y)); replaceItem(n); renderContent(); return;
      case "h":
        it = clone(drag.orig); var hh = drag.h;
        if (hh === "p1" || hh === "p2") { var q = snapPt(p, { skip: it.id }); var other = hh === "p1" ? { x: it.x2, y: it.y2 } : { x: it.x1, y: it.y1 }; if (e.shiftKey) q = constrain(other, q); it[hh === "p1" ? "x1" : "x2"] = q.x; it[hh === "p1" ? "y1" : "y2"] = q.y; }
        else if (hh === "off") { var nn = norm(it); it.o = r1((p.x - it.x1) * nn.nx + (p.y - it.y1) * nn.ny); }
        else if (hh === "anc") { var tg = itemAt(e, it.id); it.att = makeAttach(tg, p); var ap = tg ? p : snapPt(p); it.ax = r1(ap.x); it.ay = r1(ap.y); if (!tg) it.att = null; }
        else if (hh[0] === "v") { var qv = snapPt(p); it.pts[+hh.slice(1)] = [qv.x, qv.y]; }
        replaceItem(it); renderContent(); return;
      case "imove": var im = imgById(drag.orig.id); im.x = r1(drag.orig.x + p.x - drag.start.x); im.y = r1(drag.orig.y + p.y - drag.start.y); updImg(im); renderUI(); return;
      case "ih":
        var im2 = imgById(sel.id), o = drag.orig;
        if (drag.h === "isc") { var f = Math.max(0.05, Math.hypot(p.x - o.x, p.y - o.y) / Math.hypot(o.w / 2, o.h / 2)); im2.w = o.w * f; im2.h = o.h * f; }
        else { var ang = Math.atan2(p.y - o.y, p.x - o.x) * 180 / Math.PI + 90; if (e.shiftKey) ang = Math.round(ang / 15) * 15; im2.rot = r1(((ang % 360) + 360) % 360); }
        updImg(im2); renderUI(); return;
    }
  });
  window.addEventListener("pointerup", function () {
    if (!drag) return; var d = drag; drag = null;
    switch (d.type) {
      case "pen": d.el.remove(); addItem(d.item); return;
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
    if (pend) { e.preventDefault(); finishHatch(); return; }
    var g = e.target.closest("[data-id]"); if (g) { var it = byId(g.dataset.id); if (it && (it.type === "text" || it.type === "leader") && !locked(it)) { selectItem(it); focusText(); } }
  });

  document.addEventListener("keydown", function (e) {
    if (view.hidden) return;
    var tag = (e.target.tagName || "").toLowerCase(); if (tag === "input" || tag === "textarea" || tag === "select") return;
    var mod = e.ctrlKey || e.metaKey;
    if (mod && e.key.toLowerCase() === "z") { e.preventDefault(); if (e.shiftKey) redo(); else undo(); return; }
    if (mod && e.key.toLowerCase() === "y") { e.preventDefault(); redo(); return; }
    if (e.key === "Enter" && pend) { e.preventDefault(); finishHatch(); return; }
    if (e.key === "Escape") { if (pend) { pend = null; renderLive(); } else selectItem(null); return; }
    if (mod && e.key.toLowerCase() === "a") { e.preventDefault(); if (!doc().showDraw) return; setTool("select"); setSel(doc().items.filter(function (x) { return !locked(x); })); return; }
    if (mod && e.key.toLowerCase() === "c") { if (copySel()) e.preventDefault(); return; }
    if (mod && e.key.toLowerCase() === "x") { if (copySel()) { e.preventDefault(); begin(); deleteSel(); commit(); renderProps(); } return; }
    if (mod && e.key.toLowerCase() === "v") { if (clip) { e.preventDefault(); pasteN++; paste(clip, GRID * pasteN); } return; }
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
  function addImageFile(file) {
    if (!file || !/^image\//.test(file.type)) { status("That file isn't an image."); return; }
    var fr = new FileReader();
    fr.onload = function () {
      var img = new Image();
      img.onload = function () {
        var max = 1600, sc = Math.min(1, max / Math.max(img.width, img.height)), cw = Math.round(img.width * sc), ch = Math.round(img.height * sc);
        var cv = document.createElement("canvas"); cv.width = cw; cv.height = ch; var cx = cv.getContext("2d"); cx.fillStyle = "#fff"; cx.fillRect(0, 0, cw, ch); cx.drawImage(img, 0, 0, cw, ch);
        var src = cv.toDataURL("image/jpeg", 0.85), G = geo(), f = Math.min(G.inner.w * 0.8 / cw, G.inner.h * 0.8 / ch);
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
  stage.addEventListener("dragover", function (e) { if (e.dataTransfer && Array.prototype.indexOf.call(e.dataTransfer.types, "Files") > -1) { e.preventDefault(); $("sk-drop").hidden = false; } });
  stage.addEventListener("dragleave", function (e) { if (!stage.contains(e.relatedTarget)) $("sk-drop").hidden = true; });
  stage.addEventListener("drop", function (e) { e.preventDefault(); $("sk-drop").hidden = true; var f = e.dataTransfer.files[0]; if (f) addImageFile(f); });

  /* ---------- Export ---------- */
  function exportSvg() {
    var d = doc(), G = geo(), c = contentStr(true);
    return '<svg xmlns="' + NS + '" xmlns:xlink="http://www.w3.org/1999/xlink" width="' + G.W + '" height="' + G.H + '" viewBox="0 0 ' + G.W + " " + G.H + '">' +
      "<defs>" + (d.grid ? gridDefs() : "") + c.defs + "</defs>" + '<rect width="' + G.W + '" height="' + G.H + '" fill="#fff"/>' +
      (d.showUnder ? underStr() : "") + (d.grid ? gridStr() : "") + (d.showDraw ? c.s : "") + frameStr(true) + "</svg>";
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
    status("Preparing your export…");
    if (f === "png" || f === "jpeg") raster(exportSvg(), G.W, G.H, 2, "image/" + f, 0.92, function (b) { if (!b) return fail(); status(""); download(b, fname(f === "jpeg" ? "jpg" : "png")); });
    else exportPdf(f === "pdfall", function (b) { if (!b) return fail(); status(f === "pdfall" ? S.sheets.length + " sheets saved as one PDF, one A4 page each." : ""); download(b, fname("pdf", f === "pdfall")); });
  });

  /* ---------- Pick-point hatch ----------
     Rasterises the lines and strokes (thickened by a small gap tolerance), flood-fills from the clicked point
     inside the drawing frame, then traces the filled region back into outline loops. Loops inside the region
     (islands) become holes. The hatch remembers the point and the items that bound it, and is traced again
     whenever one of those items changes. */
  var hatchBy = "pick", GAP = 4; /* 4 units = 1 mm on the printed sheet */
  $("sk-hby").addEventListener("change", function () { hatchBy = this.value; pend = null; renderLive(); setTool("hatch"); });
  function bndCandidates() { return doc().items.filter(function (it) { return it.type === "stroke" || it.type === "line" || it.type === "member" || (it.type === "hatch" && it.outline && !it.seed); }); }
  function strokeItem(cx, it) {
    cx.lineWidth = (it.w || 2) + 2 * GAP; cx.beginPath();
    if (it.type === "stroke" || it.type === "hatch") {
      var loops = [it.pts].concat(it.holes || []);
      loops.forEach(function (pts) { pts.forEach(function (q, i) { if (i) cx.lineTo(q[0], q[1]); else cx.moveTo(q[0], q[1]); }); if (it.type === "hatch") cx.closePath(); if (pts.length === 1) cx.lineTo(pts[0][0] + 0.01, pts[0][1]); });
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
      var segs = it.type === "stroke" ? it.pts : it.type === "hatch" ? it.pts.concat([it.pts[0]]) : [[it.x1, it.y1], [it.x2, it.y2]], d = (it.w || 2) / 2 + 1;
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
  window.CPSketch = { importDetail: importDetail, exportSvg: exportSvg, toPng: toPng, exportPdf: exportPdf, insertTemplate: insertTemplate, state: function () { return S; }, setMode: setMode, setTool: setTool, render: function () { underKey = ""; renderAll(); renderProps(); } };

  window.addEventListener("resize", function () { if (!view.hidden) { renderAll(); if (tbKey) closeTB(true); } });
  /* On opening, scroll so the toolbars sit at the top of the window with the sheet below them. */
  function toTop() { var top = document.querySelector(".topbar"), th = top ? top.offsetHeight : 0; window.scrollTo(0, Math.max(0, app.getBoundingClientRect().top + window.scrollY - th - 8)); }
  new MutationObserver(function () { if (!view.hidden) setTimeout(function () { renderAll(); if (window.innerWidth > 760) toTop(); }, 30); }).observe(view, { attributes: true, attributeFilter: ["hidden"] });
  renderTools(); renderAll(); renderProps();
})();
