/* Tools: retaining wall first-pass check. Registers on window.CP_TOOLS, builds its own view, uses RWCalc and CPExport. */
(function () {
  "use strict";
  var ID = "retaining-wall";
  window.CP_TOOLS = (window.CP_TOOLS || []).concat([{ id: ID, label: "Retaining wall", blurb: "First-pass check of a cantilever or gravity wall: earth pressures, overturning, sliding, bearing and indicative reinforcement, with a live section and a full calc sheet." }]);
  var C = window.RWCalc, X = window.CPExport;
  var main = document.querySelector("main"); if (!main || !C) return;

  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function f(v, n) { if (typeof v !== "number") return esc(v); if (!isFinite(v)) return v > 0 ? "∞" : "–"; return v.toFixed(n == null ? 2 : n); }

  /* ---------- styles (scoped to this view) ---------- */
  var css = document.createElement("style");
  css.textContent = [
    "#view-retaining-wall .rw-grid{display:grid;grid-template-columns:minmax(0,360px) minmax(0,1fr);gap:16px;align-items:start}",
    "@media (max-width:900px){#view-retaining-wall .rw-grid{grid-template-columns:minmax(0,1fr)}}",
    "#view-retaining-wall .rw-in{gap:0;padding:6px 16px}",
    "#view-retaining-wall .rw-in details{border-top:1px solid var(--tool-line);padding:10px 0}",
    "#view-retaining-wall .rw-in details:first-of-type{border-top:0}",
    "#view-retaining-wall .rw-in summary{cursor:pointer;font-weight:700;font-family:var(--font-display)}",
    "#view-retaining-wall .rw-fields{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:10px 12px;margin-top:10px}",
    "#view-retaining-wall .rw-fields .field.wide{grid-column:1/-1}",
    "#view-retaining-wall .field label{font-size:.84rem;line-height:1.25}",
    "#view-retaining-wall .field input[type=number],#view-retaining-wall .field input[type=text],#view-retaining-wall .field select{width:100%;min-width:0}",
    "#view-retaining-wall .field .u{font:500 .72rem var(--font-mono);color:var(--muted)}",
    "#view-retaining-wall .chk{display:flex;gap:8px;align-items:flex-start;font-size:.88rem;grid-column:1/-1}",
    "#view-retaining-wall .chk input{width:17px;height:17px;accent-color:var(--accent);margin-top:2px}",
    "#view-retaining-wall .rw-pf{width:100%;font-size:.8rem;margin-top:8px}",
    "#view-retaining-wall .rw-pf td,#view-retaining-wall .rw-pf th{padding:3px 4px 3px 0;border-top:1px solid var(--tool-line);width:auto;font-weight:400;color:var(--ink);text-align:left;vertical-align:middle}",
    "#view-retaining-wall .rw-pf th{font-weight:600;font-size:.74rem}",
    "#view-retaining-wall .rw-pf input{width:100%;min-width:44px;padding:4px 5px;font:400 .82rem var(--font-mono);border:1px solid var(--line);border-radius:4px;background:var(--surface);color:var(--ink)}",
    "#view-retaining-wall .rw-out{display:flex;flex-direction:column;gap:16px;min-width:0}",
    "#view-retaining-wall .rw-fig svg{width:100%;height:auto;display:block}",
    "#view-retaining-wall .rw-tools{display:flex;gap:8px;flex-wrap:wrap;align-items:center}",
    "#view-retaining-wall .rw-tools .btn{padding:7px 12px;font-size:.88rem}",
    "#view-retaining-wall .rw-sum{width:100%;font-size:.88rem}",
    "#view-retaining-wall .rw-sum td{padding:6px 8px 6px 0;width:auto;font-weight:400;color:var(--ink)}",
    "#view-retaining-wall .rw-sum td.n{font-family:var(--font-mono);font-variant-numeric:tabular-nums;white-space:nowrap;text-align:right}",
    "#view-retaining-wall .rw-sum tr.grp td{font-weight:700;color:var(--muted);font-size:.78rem;text-transform:uppercase;letter-spacing:.05em;padding-top:12px}",
    "#view-retaining-wall .bar{position:relative;height:8px;border-radius:4px;background:var(--line);min-width:60px}",
    "#view-retaining-wall .bar i{position:absolute;left:0;top:0;bottom:0;border-radius:4px;background:var(--accent)}",
    "#view-retaining-wall .bar.bad i{background:var(--accent-2)}",
    "#view-retaining-wall .tag{font:600 .74rem var(--font-mono);padding:2px 6px;border-radius:4px;background:var(--accent-soft);color:var(--accent);white-space:nowrap}",
    "#view-retaining-wall .tag.bad{background:var(--accent-2-soft);color:var(--accent-2)}",
    "#view-retaining-wall .rw-calc{font-size:.84rem}",
    "#view-retaining-wall .rw-calc td{padding:5px 8px 5px 0;width:auto;font-weight:400;color:var(--ink)}",
    "#view-retaining-wall .rw-calc td.ref{font-family:var(--font-mono);color:var(--muted);white-space:nowrap}",
    "#view-retaining-wall .rw-calc td.eq{font-family:var(--font-mono);font-size:.78rem;color:var(--muted)}",
    "#view-retaining-wall .rw-calc td.v{font-family:var(--font-mono);text-align:right;white-space:nowrap}",
    "#view-retaining-wall .rw-calc tr.h td{font-weight:700;font-family:var(--font-display);padding-top:16px;border-top:2px solid var(--accent)}",
    "#view-retaining-wall .rw-calc th{text-align:left;font-size:.76rem;color:var(--muted);padding:4px 8px 4px 0}",
    "#view-retaining-wall .rw-cs>summary{list-style:none;display:inline-flex}#view-retaining-wall .rw-cs>summary::-webkit-details-marker{display:none}#view-retaining-wall .rw-cs[open]>summary{margin-bottom:4px}",
    "#view-retaining-wall .rw-warn{margin:0;padding-left:18px;color:var(--ink);font-size:.88rem}",
    "#view-retaining-wall .rw-lim{margin:0;padding-left:18px;font-size:.86rem;color:var(--muted);display:flex;flex-direction:column;gap:4px}",
    "@media (max-width:520px){#view-retaining-wall .rw-calc td.eq{display:none}#view-retaining-wall .rw-calc th.eq{display:none}}",
    "@media print{body.on-rw main>section:not(#view-retaining-wall){display:none!important}body.on-rw #view-retaining-wall .no-print{display:none!important}}"
  ].join("\n");
  document.head.appendChild(css);

  /* ---------- view ---------- */
  var sec = document.createElement("section");
  sec.className = "view wrap"; sec.id = "view-" + ID; sec.dataset.view = ID; sec.hidden = true;
  sec.innerHTML =
    '<div class="view-head"><span class="eyebrow"><a href="#tools" style="color:inherit;text-decoration:none">Tools</a> / Retaining wall</span><h2>Retaining wall first-pass check</h2>' +
    '<p class="lede">Size a cantilever (T or L) or mass concrete gravity wall and sanity-check it: earth pressures, overturning, sliding, bearing and indicative stem and base reinforcement. The section and the calculation sheet update as you type.</p></div>' +
    '<div class="notice" role="note"><div><p><strong>Indicative only. Not a design to build from.</strong> This is a first-pass tool for checking a scheme. It works from first principles with your inputs and the assumptions listed below it. The partial factors, limits and material values are editable placeholders, not values taken from any standard: check every one against your governing document (for example your design code, its national annex and the project geotechnical report), and have the design done and checked by a competent engineer. Results are not a statement of compliance with any code.</p></div></div>' +
    '<div class="rw-grid">' +
      '<form class="panel tool rw-in no-print" id="rw-form" autocomplete="off" onsubmit="return false"></form>' +
      '<div class="rw-out">' +
        '<div class="panel rw-fig"><div style="display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap;align-items:baseline"><h3>Section</h3>' +
          '<label class="small no-print">Pressures shown for <select id="rw-show" style="padding:4px 6px"></select></label></div>' +
          '<div id="rw-svg"></div>' +
          '<div class="rw-tools no-print"><button type="button" class="btn ghost" id="rw-png">PNG</button><button type="button" class="btn ghost" id="rw-pdf">PDF (section and calcs)</button><span class="small" id="rw-msg" role="status"></span></div></div>' +
        '<div class="panel"><h3>Checks</h3><div id="rw-warn"></div><div class="table-wrap"><table class="rw-sum" id="rw-sum"></table></div>' +
          '<p class="small">Ratio is resistance over action; utilisation is the required value over the ratio (or the value over its limit), so anything over 100% needs a closer look.</p></div>' +
      '</div>' +
    '</div>' +
    '<div class="panel"><div style="display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap;align-items:baseline"><h3>Calculation sheet</h3>' +
      '<div class="rw-tools no-print"><button type="button" class="btn" id="rw-xlsx">Excel (XLSX)</button><button type="button" class="btn ghost" id="rw-csv">CSV</button></div></div>' +
      '<p class="small">Every input, equation and intermediate value behind the checks, numbered so you can follow it by hand.</p>' +
      '<details class="rw-cs" id="rw-cs"><summary class="btn ghost" style="align-self:flex-start">Show the calculation sheet</summary><div class="table-wrap" style="margin-top:12px"><table class="rw-calc" id="rw-calc"></table></div></details></div>' +
    '<details class="panel ref"><summary><span class="eyebrow">Assumptions and what is left out</span></summary><ul class="rw-lim">' +
      "<li>Plane strain, per metre run. Earth pressure acts on a vertical virtual back through the end of the heel; the soil above the heel (and on any stem batter or slope wedge) counts as part of the wall.</li>" +
      "<li>Active pressure by Coulomb's wedge for a vertical back. Rankine sets the wall friction equal to the slope angle, which gives Rankine's sloping-backfill value. At rest uses 1 − sin φ′ for level ground. Cohesion reduces pressure by 2c′√K and any tension is set to zero; with δ above zero this is an approximation.</li>" +
      "<li>Partial factors multiply earth and water effects (γ_G,unf), permanent weights (γ_G,fav or γ_G,unf), surcharge (γ_Q) and divide soil strengths (γ_φ′ applied to tan φ′, γ_c′, γ_cu). Each set runs two vertical-load cases: weights favourable without heel surcharge (overturning, sliding, bearing case A) and weights unfavourable with heel surcharge (bearing case B).</li>" +
      "<li>Bearing resistance is an indicative strip-footing formula on the effective width B′ = B − 2e, with Meyerhof's inclination factors and no depth, shape or ground-slope factors. Use your own allowable bearing pressure from the ground investigation for the serviceability check.</li>" +
      "<li>Water is hydrostatic on each side with linear uplift under the base; seepage, rapid drawdown and water in a tension crack are not modelled. Front water does not change passive pressure.</li>" +
      "<li>Not included: compaction-induced pressures, line and strip loads, seismic loads, global (slip circle) stability, settlement, frost, heave, shear key, thermal and shrinkage steel, crack width, bar anchorage and laps, concrete shear resistance (enter your own value to compare), and durability cover. These need checking separately.</li>" +
      "<li>Bending moments are taken at the faces of the stem and shear at the face (not at d from it). Reinforcement uses a rectangular stress block from equilibrium, b = 1 m, single layer of tension steel.</li>" +
    "</ul></details>";
  main.appendChild(sec);
  function $(id) { return document.getElementById(id); }

  /* ---------- inputs ---------- */
  var D0 = C.DEFAULTS, KEY = "cp-rw";
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  var state = (function () { try { var s = JSON.parse(localStorage.getItem(KEY) || "null"); if (s && s.v === 1) return s.d; } catch (e) {} return null; })() || clone(D0);
  for (var k0 in D0) if (state[k0] === undefined) state[k0] = clone(D0[k0]);
  function save() { try { localStorage.setItem(KEY, JSON.stringify({ v: 1, d: state })); } catch (e) {} }

  var PRESETS = {
    T: { toe: 0.8, tTop: 0.3, tBot: 0.35, heel: 1.9, batter: "back", structSet: 1 },
    L: { toe: 0, tTop: 0.3, tBot: 0.35, heel: 2.4, batter: "back", structSet: 1 },
    gravity: { toe: 0.3, tTop: 0.6, tBot: 1.8, heel: 0.3, batter: "front", structSet: 0 }
  };
  var CONC = [["C25/30", 25], ["C28/35", 28], ["C30/37", 30], ["C32/40", 32], ["C35/45", 35], ["C40/50", 40]];
  var G = [
    { t: "Wall type and geometry", open: true, f: [
      ["wallType", "Wall type", "sel", [["T", "Cantilever, T (toe and heel)"], ["L", "Cantilever, L (no toe)"], ["gravity", "Mass concrete gravity"]], "wide"],
      ["H", "Retained height H", "m"], ["dt", "Soil over toe d_t", "m"], ["D", "Base thickness D", "m"], ["toe", "Toe length a", "m"],
      ["tTop", "Stem thickness, top t_t", "m"], ["tBot", "Stem thickness, base t_b", "m"], ["heel", "Heel length b", "m"], ["beta", "Backfill slope β", "°"],
      ["batter", "Stem batter (when t_b > t_t)", "sel", [["back", "Back face battered, front vertical"], ["front", "Front face battered, back vertical"]], "wide"]] },
    { t: "Retained soil", f: [["gam", "Bulk unit weight γ", "kN/m³"], ["gamSat", "Saturated unit weight γ_sat", "kN/m³"], ["phi", "Friction angle φ′", "°"], ["c", "Cohesion c′", "kPa"]] },
    { t: "Founding soil", f: [
      ["founding", "Founding condition", "sel", [["drained", "Drained (φ′, c′)"], ["undrained", "Undrained (c_u)"]], "wide"],
      ["gamF", "Unit weight γ_f", "kN/m³"], ["phiF", "Friction angle φ′_f", "°", null, "", "Used for base friction, passive and drained bearing."], ["cF", "Cohesion c′_f", "kPa", null, "", "", "drained"], ["cuF", "Undrained strength c_u", "kPa", null, "", "", "undrained"],
      ["kb", "Base friction ratio k_b", "", null, "", "tan δ_b = k_b tan φ′_f. Placeholder 1.0 for cast-in-place concrete: check.", "drained"],
      ["adhesion", "Count base adhesion c′_f B′ in sliding", "chk", null, "", "", "drained"],
      ["qAllow", "Allowable bearing pressure", "kPa", null, "", "Placeholder. Get this from your ground investigation."],
      ["nGamma", "N_γ expression", "sel", [["2(Nq-1)tan", "2(N_q − 1) tan φ′"], ["2(Nq+1)tan", "2(N_q + 1) tan φ′"], ["1.5(Nq-1)tan", "1.5(N_q − 1) tan φ′"]], "wide", "Several published forms exist. Pick the one your governing document uses.", "drained"]] },
    { t: "Surcharge and water", f: [
      ["q", "Surcharge on retained side q", "kPa"], ["gamC", "Concrete unit weight", "kN/m³"],
      ["water", "Water", "sel", [["none", "Drained backfill, no water pressure"], ["wt", "Water table behind the wall"]], "wide"],
      ["zw", "Water depth below top of stem z_w", "m", null, "", "", "wt"], ["hwf", "Water in front, above underside of base", "m", null, "", "", "wt"], ["gamW", "Water unit weight γ_w", "kN/m³", null, "", "", "wt"]] },
    { t: "Earth pressure", f: [
      ["basis", "Pressure state", "sel", [["active", "Active (wall can move)"], ["atrest", "At rest (wall restrained)"]], "wide"],
      ["method", "Active method", "sel", [["rankine", "Rankine (δ = β on virtual back)"], ["coulomb", "Coulomb with wall friction δ"]], "wide", "", "active"],
      ["deltaRatio", "Wall friction ratio δ/φ′", "", null, "", "Placeholder: check your governing document.", "coulomb"],
      ["Kover", "Override K (blank = calculate)", "", "text"],
      ["toeSoil", "Count soil over toe as stabilising", "chk"],
      ["passive", "Count passive resistance at the toe", "chk", null, "", "Often ignored, because the soil in front may be dug away."],
      ["hp", "Passive depth h_p", "m", null, "", "", "passive"], ["mob", "Passive mobilisation factor", "", null, "", "Fraction of full passive counted.", "passive"]] },
    { t: "Partial factors and limits", pf: true },
    { t: "Concrete and reinforcement", f: [
      ["structSet", "Structural design uses", "sel", null, "wide"],
      ["fck", "Concrete f_ck", "sel", CONC.map(function (c) { return [c[1], c[0]]; }), "", "", "rc"], ["fyk", "Steel f_yk", "MPa", null, "", "", "rc"],
      ["gc", "γ_c concrete", "", null, "", "", "rc"], ["gs", "γ_s steel", "", null, "", "", "rc"], ["acc", "α_cc", "", null, "", "", "rc"], ["eta", "η (block strength)", "", null, "", "", "rc"], ["lam", "λ (block depth)", "", null, "", "", "rc"],
      ["zMax", "Max lever arm z/d", "", null, "", "", "rc"], ["xdLim", "Max x/d", "", null, "", "", "rc"], ["cover", "Cover to bars", "mm", null, "", "", "rc"], ["rhoMin", "Min steel % of b d", "%", null, "", "", "rc"],
      ["vRdc", "Concrete shear resistance v_Rd,c (blank = skip)", "MPa", "text", "wide", "Work this out from your governing document and enter it to compare.", "rc"],
      ["fctAllow", "Allowable flexural tension", "MPa", null, "", "0 means no tension allowed at the stem joint.", "gravity"]],
      note: "Every default in this group is a placeholder. Check each value against your governing document." }
  ];
  var PF = [["gGunf", "γ_G unfavourable (earth, water)"], ["gGfav", "γ_G favourable (weights)"], ["gQ", "γ_Q surcharge"], ["gPhi", "γ_φ′ on tan φ′"], ["gC", "γ_c′"], ["gCu", "γ_cu"], ["gRh", "γ_R sliding"], ["gRv", "γ_R bearing"],
    ["reqOT", "Required overturning ratio"], ["reqSL", "Required sliding ratio"], ["reqBR", "Required bearing ratio"], ["eLim", "Max e/B"]];

  function fieldHtml(d) {
    var k = d[0], lab = d[1], u = d[2], opts = d[3], cls = d[4] || "", help = d[5] || "", cond = d[6] || "";
    var v = state[k], ca = cond ? ' data-cond="' + cond + '"' : "";
    if (u === "chk") return '<label class="chk"' + ca + '><input type="checkbox" data-k="' + k + '"' + (v ? " checked" : "") + "><span>" + esc(lab) + (help ? '<br><span class="small">' + esc(help) + "</span>" : "") + "</span></label>";
    var ctl;
    if (u === "sel") ctl = '<select id="rw-' + k + '" data-k="' + k + '">' + (opts || []).map(function (o) { return '<option value="' + esc(o[0]) + '"' + (String(o[0]) === String(v) ? " selected" : "") + ">" + esc(o[1]) + "</option>"; }).join("") + "</select>";
    else if (opts === "text") ctl = '<input type="text" inputmode="decimal" id="rw-' + k + '" data-k="' + k + '" value="' + esc(v) + '">';
    else ctl = '<input type="number" step="any" id="rw-' + k + '" data-k="' + k + '" value="' + esc(v) + '">';
    return '<div class="field ' + cls + '"' + ca + '><label for="rw-' + k + '">' + esc(lab) + (u && u !== "sel" ? ' <span class="u">' + esc(u) + "</span>" : "") + "</label>" + ctl + (help ? '<span class="small">' + esc(help) + "</span>" : "") + "</div>";
  }
  function pfHtml() {
    return '<p class="small" style="margin-top:8px">Three combinations run side by side. The defaults are placeholders, labelled by what they factor, not taken from a standard: replace them with the factors and design approach in your governing document.</p>' +
      '<div class="table-wrap"><table class="rw-pf"><tr><th></th>' + state.sets.map(function (s, i) { return '<th><input type="text" data-set="' + i + '" data-sk="name" value="' + esc(s.name) + '" aria-label="Name of combination ' + (i + 1) + '"></th>'; }).join("") + "</tr>" +
      PF.map(function (p) { return "<tr><td>" + esc(p[1]) + "</td>" + state.sets.map(function (s, i) { return '<td><input type="number" step="any" data-set="' + i + '" data-sk="' + p[0] + '" value="' + esc(+(+s[p[0]]).toFixed(4)) + '" aria-label="' + esc(p[1] + ", " + s.name) + '"></td>'; }).join("") + "</tr>"; }).join("") +
      "</table></div>";
  }
  function buildForm() {
    G[6].f[0][3] = state.sets.map(function (s, i) { return [i, s.name]; });
    $("rw-form").innerHTML = '<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;padding:8px 0"><span class="eyebrow">Inputs</span><button type="button" class="linkish btn ghost" id="rw-reset" style="padding:4px 10px;font-size:.82rem">Reset to worked example</button></div>' +
      G.map(function (g) {
        return "<details" + (g.open ? " open" : "") + "><summary>" + esc(g.t) + "</summary>" + (g.pf ? pfHtml() : '<div class="rw-fields">' + g.f.map(fieldHtml).join("") + "</div>" + (g.note ? '<p class="small" style="margin-top:8px">' + esc(g.note) + "</p>" : "")) + "</details>";
      }).join("") + '<p class="small" style="padding:10px 0">Inputs are kept in this browser only.</p>';
    conds();
  }
  function conds() {
    Array.prototype.forEach.call($("rw-form").querySelectorAll("[data-cond]"), function (el) {
      var c = el.dataset.cond, on = true;
      if (c === "drained" || c === "undrained") on = state.founding === c;
      else if (c === "wt") on = state.water === "wt";
      else if (c === "active") on = state.basis === "active";
      else if (c === "coulomb") on = state.basis === "active" && state.method === "coulomb";
      else if (c === "passive") on = !!state.passive;
      else if (c === "rc") on = state.wallType !== "gravity";
      else if (c === "gravity") on = state.wallType === "gravity";
      el.hidden = !on;
    });
  }
  $("rw-form").addEventListener("input", onInput);
  $("rw-form").addEventListener("change", onInput);
  function onInput(e) {
    var t = e.target;
    if (t.dataset.set != null) { var s = state.sets[+t.dataset.set]; s[t.dataset.sk] = t.dataset.sk === "name" ? t.value : t.value; if (t.dataset.sk === "name" && e.type === "change") buildForm(); }
    else if (t.dataset.k) {
      var k = t.dataset.k;
      state[k] = t.type === "checkbox" ? t.checked : t.tagName === "SELECT" && !/^(wallType|founding|water|basis|method|nGamma|batter)$/.test(k) ? +t.value : t.value;
      if (k === "wallType" && e.type === "change") {
        var p = PRESETS[state.wallType]; for (var pk in p) state[pk] = p[pk];
        if (state.wallType === "gravity") { state.method = "coulomb"; }
        buildForm();
      }
      conds();
    }
    save(); update();
  }
  $("rw-form").addEventListener("click", function (e) {
    if (e.target.id !== "rw-reset") return;
    state = clone(D0); save(); buildForm(); update();
  });

  /* ---------- drawing ---------- */
  var LIVE = { conc: "var(--tool-bg)", concLine: "var(--ink)", soil: "var(--ref-bg)", soilLine: "var(--ref-line)", found: "var(--paper)", ink: "var(--ink)", muted: "var(--muted)", accent: "var(--accent)", acc2: "var(--accent-2)", water: "var(--s-blue)", bg: "var(--surface)", font: "Palanquin, Arial, sans-serif", mono: "PT Sans Caption, Arial, sans-serif" };
  var PRINT = { conc: "#e4eef0", concLine: "#15233a", soil: "#f3ecdb", soilLine: "#cdbf9c", found: "#eef0ec", ink: "#15233a", muted: "#5a6677", accent: "#0d6b78", acc2: "#b84a32", water: "#3f6fd1", bg: "#ffffff", font: "Arial, Helvetica, sans-serif", mono: "Courier New, monospace" };

  function draw(res, P, showIdx) {
    var I = res.inputs, g = res.geom, B = g.B, D = I.D, xs = I.toe, xb = I.toe + I.tBot;
    var W = 720, Hpx = 580, padL = 118, padR = 190, padT = 64, padB = 138;
    var ext = 0.9, wx0 = -Math.max(0.6, ext), wx1 = B + ext, wy0 = -0.5, wy1 = g.Ht + 0.3;
    var sc = Math.min((W - padL - padR) / (wx1 - wx0), (Hpx - padT - padB) / (wy1 - wy0));
    var drawW = (wx1 - wx0) * sc, drawH = (wy1 - wy0) * sc;
    function X(x) { return padL + (x - wx0) * sc; }
    function Y(y) { return padT + (wy1 - y) * sc; }
    function pts(a) { return a.map(function (p) { return X(p[0]).toFixed(1) + "," + Y(p[1]).toFixed(1); }).join(" "); }
    var o = [], t = Math.tan(I.beta * Math.PI / 180);
    var ysurf = function (x) { return g.yTop + Math.max(0, x - g.xbt) * t; };
    o.push('<defs><pattern id="rw-hatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="8" style="stroke:' + P.soilLine + ';stroke-width:1"/></pattern>' +
      '<marker id="rw-ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" style="fill:' + P.ink + '"/></marker>' +
      '<marker id="rw-ar2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" style="fill:' + P.acc2 + '"/></marker></defs>');
    o.push('<rect x="0" y="0" width="' + W + '" height="' + Hpx + '" style="fill:' + P.bg + '"/>');
    /* founding soil */
    o.push('<rect x="' + X(wx0) + '" y="' + Y(0) + '" width="' + (X(wx1) - X(wx0)) + '" height="' + (Y(wy0) - Y(0)) + '" style="fill:' + P.found + '"/>');
    /* retained soil */
    var rs = [[xb, D], [g.xbt, g.yTop], [wx1, ysurf(wx1)], [wx1, 0], [B, 0], [B, D]];
    o.push('<polygon points="' + pts(rs) + '" style="fill:' + P.soil + '"/><polygon points="' + pts(rs) + '" style="fill:url(#rw-hatch);opacity:.6"/>');
    /* front soil */
    var xg = xs + (g.xft - xs) * I.dt / g.hs, fs = [[wx0, 0], [0, 0], [0, D], [xs, D], [xg, D + I.dt], [wx0, D + I.dt]];
    if (I.dt > 0) o.push('<polygon points="' + pts(fs) + '" style="fill:' + P.soil + '"/><polygon points="' + pts(fs) + '" style="fill:url(#rw-hatch);opacity:.6"/>');
    /* ground lines */
    o.push('<polyline points="' + pts([[g.xbt, g.yTop], [wx1, ysurf(wx1)]]) + '" style="fill:none;stroke:' + P.ink + ';stroke-width:1.5"/>');
    o.push('<polyline points="' + pts([[wx0, D + I.dt], [xg, D + I.dt]]) + '" style="fill:none;stroke:' + P.ink + ';stroke-width:1.5"/>');
    o.push('<line x1="' + X(wx0) + '" y1="' + Y(0) + '" x2="' + X(wx1) + '" y2="' + Y(0) + '" style="stroke:' + P.muted + ';stroke-width:.8;stroke-dasharray:2 3"/>');
    /* concrete */
    var conc = [[0, 0], [B, 0], [B, D], [xb, D], [g.xbt, g.yTop], [g.xft, g.yTop], [xs, D], [0, D]];
    o.push('<polygon points="' + pts(conc) + '" style="fill:' + P.conc + ';stroke:' + P.concLine + ';stroke-width:1.6;stroke-linejoin:round"/>');
    /* virtual back */
    o.push('<line x1="' + X(B) + '" y1="' + Y(0) + '" x2="' + X(B) + '" y2="' + Y(g.Ht) + '" style="stroke:' + P.acc2 + ';stroke-width:1;stroke-dasharray:6 4"/>');
    o.push('<text transform="translate(' + (X(B) - 4) + ',' + Y(g.Ht * 0.55) + ') rotate(-90)" text-anchor="middle" style="font:600 10px ' + P.font + ';fill:' + P.acc2 + '">virtual back</text>');
    /* surcharge arrows */
    if (I.q > 0) {
      var n = Math.max(3, Math.round((wx1 - g.xbt) / 0.35));
      for (var i = 0; i <= n; i++) { var ax = g.xbt + (wx1 - g.xbt) * i / n, ay = ysurf(ax); o.push('<line x1="' + X(ax) + '" y1="' + (Y(ay) - 22) + '" x2="' + X(ax) + '" y2="' + (Y(ay) - 2) + '" style="stroke:' + P.acc2 + ';stroke-width:1.2" marker-end="url(#rw-ar2)"/>'); }
      o.push('<line x1="' + X(g.xbt) + '" y1="' + (Y(g.yTop) - 22) + '" x2="' + X(wx1) + '" y2="' + (Y(ysurf(wx1)) - 22) + '" style="stroke:' + P.acc2 + ';stroke-width:1.2"/>');
      o.push('<text x="' + X(g.xbt) + '" y="' + (Y(g.yTop) - 28) + '" style="font:600 11px ' + P.font + ';fill:' + P.acc2 + '">q = ' + f(I.q, 1) + ' kPa</text>');
    }
    /* water */
    if (g.hasW) {
      var wl = Math.min(g.yw, g.yTop);
      o.push('<line x1="' + X(xb) + '" y1="' + Y(wl) + '" x2="' + X(wx1) + '" y2="' + Y(wl) + '" style="stroke:' + P.water + ';stroke-width:1.4;stroke-dasharray:8 3"/>');
      var wx = (B + wx1) / 2; o.push('<path d="M' + (X(wx) - 6) + "," + (Y(wl) - 9) + "h12l-6,8z" + '" style="fill:' + P.water + '"/>');
      if (g.hwf > 0) { o.push('<line x1="' + X(wx0) + '" y1="' + Y(g.hwf) + '" x2="' + X(0) + '" y2="' + Y(g.hwf) + '" style="stroke:' + P.water + ';stroke-width:1.4;stroke-dasharray:8 3"/>'); }
    }
    /* dimensions */
    function dimH(x1, x2, y, label, off) {
      var yy = Y(y) + off; o.push('<line x1="' + X(x1) + '" y1="' + yy + '" x2="' + X(x2) + '" y2="' + yy + '" style="stroke:' + P.ink + ';stroke-width:.8" marker-start="url(#rw-ar)" marker-end="url(#rw-ar)"/>');
      [x1, x2].forEach(function (x) { o.push('<line x1="' + X(x) + '" y1="' + (Y(y) + (off > 0 ? 3 : -3)) + '" x2="' + X(x) + '" y2="' + (yy + (off > 0 ? 4 : -4)) + '" style="stroke:' + P.muted + ';stroke-width:.6"/>'); });
      o.push('<text x="' + ((X(x1) + X(x2)) / 2) + '" y="' + (yy + (off > 0 ? 13 : -5)) + '" text-anchor="middle" style="font:500 10.5px ' + P.mono + ';fill:' + P.ink + '">' + esc(label) + "</text>");
    }
    function dimV(y1, y2, x, label, off) {
      var xx = X(x) + off; o.push('<line x1="' + xx + '" y1="' + Y(y1) + '" x2="' + xx + '" y2="' + Y(y2) + '" style="stroke:' + P.ink + ';stroke-width:.8" marker-start="url(#rw-ar)" marker-end="url(#rw-ar)"/>');
      [y1, y2].forEach(function (y) { o.push('<line x1="' + (X(x) + (off > 0 ? 3 : -3)) + '" y1="' + Y(y) + '" x2="' + (xx + (off > 0 ? 4 : -4)) + '" y2="' + Y(y) + '" style="stroke:' + P.muted + ';stroke-width:.6"/>'); });
      var ty = (Y(y1) + Y(y2)) / 2; o.push('<text x="' + (xx + (off > 0 ? 5 : -5)) + '" y="' + (ty + 3) + '" text-anchor="' + (off > 0 ? "start" : "end") + '" style="font:500 10.5px ' + P.mono + ';fill:' + P.ink + '">' + esc(label) + "</text>");
    }
    var m = function (v) { return (v * 1000).toFixed(0); };
    if (I.toe > 0) dimH(0, xs, 0, "a " + m(I.toe), 22);
    dimH(xs, xb, 0, "t_b " + m(I.tBot), I.toe > 0 ? 22 : 22);
    if (I.heel > 0) dimH(xb, B, 0, "b " + m(I.heel), 22);
    dimH(0, B, 0, "B " + m(B), 44);
    dimH(g.xft, g.xbt, g.yTop, "t_t " + m(I.tTop), -14 - (I.q > 0 ? 30 : 0));
    var xl = Math.min(0, wx0 + 0.05);
    dimV(0, D, xl, "D " + m(D), -10);
    if (I.dt > 0) dimV(D, D + I.dt, xl, "d_t " + m(I.dt), -10);
    dimV(D + I.dt, g.yTop, xl, "H " + m(I.H), -10);
    dimV(D, g.yTop, xl, "h_s " + m(g.hs), -62);
    /* pressure diagram on the virtual back */
    var cb = res.combos[showIdx] || res.combos[0];
    if (cb && !cb.error) {
      var ed = cb.ed, pmax = 0; ed.segs.forEach(function (s) { pmax = Math.max(pmax, s.p1, s.p2); });
      var uw = g.hasW ? I.gamW * g.hwb * cb.set.gGunf : 0; pmax = Math.max(pmax, uw, 1);
      var pw = Math.min(150, padR - 60) / pmax, x0 = X(wx1) + 30;
      var poly = [[x0, Y(g.Ht)]]; ed.segs.forEach(function (s) { poly.push([x0 + s.p1 * pw, Y(g.Ht - s.z1)], [x0 + s.p2 * pw, Y(g.Ht - s.z2)]); }); poly.push([x0, Y(0)]);
      o.push('<polygon points="' + poly.map(function (p) { return p[0].toFixed(1) + "," + p[1].toFixed(1); }).join(" ") + '" style="fill:' + P.acc2 + ';fill-opacity:.16;stroke:' + P.acc2 + ';stroke-width:1.2"/>');
      if (g.hasW && g.hwb > 0) o.push('<polygon points="' + [[x0, Y(g.hwb)], [x0 + uw * pw, Y(0)], [x0, Y(0)]].map(function (p) { return p[0].toFixed(1) + "," + p[1].toFixed(1); }).join(" ") + '" style="fill:' + P.water + ';fill-opacity:.18;stroke:' + P.water + ';stroke-width:1"/>');
      o.push('<line x1="' + x0 + '" y1="' + Y(g.Ht) + '" x2="' + x0 + '" y2="' + Y(0) + '" style="stroke:' + P.ink + ';stroke-width:1"/>');
      o.push('<text x="' + x0 + '" y="' + (Y(g.Ht) - 22) + '" style="font:700 10.5px ' + P.font + ';fill:' + P.ink + '">Horizontal pressure</text><text x="' + x0 + '" y="' + (Y(g.Ht) - 9) + '" style="font:500 10px ' + P.font + ';fill:' + P.muted + '">' + esc(cb.name) + "</text>");
      o.push('<text x="' + (x0 + ed.ptop * pw + 4) + '" y="' + (Y(g.Ht) + 11) + '" style="font:500 10px ' + P.mono + ';fill:' + P.acc2 + '">' + f(ed.ptop, 1) + "</text>");
      o.push('<text x="' + (x0 + ed.pbot * pw + 4) + '" y="' + (Y(0) - 3) + '" style="font:500 10px ' + P.mono + ';fill:' + P.acc2 + '">' + f(ed.pbot, 1) + " kPa</text>");
      if (g.hasW && g.hwb > 0) o.push('<text x="' + (x0 + uw * pw + 4) + '" y="' + (Y(0) + 11) + '" style="font:500 10px ' + P.mono + ';fill:' + P.water + '">u ' + f(uw, 1) + "</text>");
      /* thrust arrow */
      o.push('<line x1="' + (x0 + 70) + '" y1="' + Y(cb.yP) + '" x2="' + (x0 + 2) + '" y2="' + Y(cb.yP) + '" style="stroke:' + P.ink + ';stroke-width:1.6" marker-end="url(#rw-ar)"/>');
      o.push('<text x="' + (x0 + 72) + '" y="' + (Y(cb.yP) + 4) + '" style="font:600 10.5px ' + P.mono + ';fill:' + P.ink + '">P_h ' + f(cb.Pah, 1) + "</text>");
      /* bearing pressure under the base: worst case of the two */
      var bi = cb.bear[0].qmax >= cb.bear[1].qmax ? 0 : 1, cp = cb.bear[bi].cp;
      if (!cp.fail) {
        var bs = Math.min(46 / Math.max(cp.qmax, 1), 1), yb = Y(0), N = 40, bp = [[X(0), yb]];
        for (var j = 0; j <= N; j++) { var x = B * j / N; bp.push([X(x), yb + cp.at(x) * bs]); }
        bp.push([X(B), yb]);
        o.push('<polygon points="' + bp.map(function (p) { return p[0].toFixed(1) + "," + (p[1] + 72).toFixed(1); }).join(" ") + '" style="fill:' + P.accent + ';fill-opacity:.15;stroke:' + P.accent + ';stroke-width:1.2"/>');
        o.push('<line x1="' + X(0) + '" y1="' + (yb + 72) + '" x2="' + X(B) + '" y2="' + (yb + 72) + '" style="stroke:' + P.ink + ';stroke-width:1"/>');
        o.push('<text x="' + (X(0) - 4) + '" y="' + (yb + 72 + cp.qToe * bs + 4) + '" text-anchor="end" style="font:500 10px ' + P.mono + ';fill:' + P.accent + '">' + f(cp.qToe, 1) + "</text>");
        o.push('<text x="' + (X(B) + 4) + '" y="' + (yb + 72 + cp.qHeel * bs + 4) + '" style="font:500 10px ' + P.mono + ';fill:' + P.accent + '">' + f(cp.qHeel, 1) + " kPa</text>");
        o.push('<text x="' + (X(B) + 4) + '" y="' + (yb + 68) + '" style="font:600 10px ' + P.font + ';fill:' + P.muted + '">bearing, case ' + (bi ? "B" : "A") + "</text>");
        var xr = cb.cases[bi].xbar; o.push('<line x1="' + X(xr) + '" y1="' + (yb - 30) + '" x2="' + X(xr) + '" y2="' + (yb - 2) + '" style="stroke:' + P.accent + ';stroke-width:1.6" marker-end="url(#rw-ar)"/><text x="' + (X(xr) + 4) + '" y="' + (yb - 22) + '" style="font:600 10px ' + P.mono + ';fill:' + P.accent + '">V, e = ' + f(cb.bear[bi].e, 3) + "</text>");
      }
    }
    var title = (I.wallType === "gravity" ? "Mass concrete gravity wall" : I.wallType === "L" ? "Cantilever L wall" : "Cantilever T wall") + ", dimensions in mm";
    o.push('<text x="12" y="20" style="font:700 12px ' + P.font + ';fill:' + P.ink + '">' + esc(title) + '</text><text x="12" y="36" style="font:500 10px ' + P.font + ';fill:' + P.muted + '">Indicative only. Not for construction.</text>');
    void drawW; void drawH;
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + W + " " + Hpx + '" role="img" aria-label="Retaining wall section with dimensions, earth pressure and bearing pressure">' + o.join("") + "</svg>";
  }

  /* ---------- results ---------- */
  var last = null;
  function update() {
    var res = C.run(state); last = res;
    if (res.error) { $("rw-svg").innerHTML = '<p class="small">' + esc(res.error) + "</p>"; $("rw-sum").innerHTML = ""; $("rw-calc").innerHTML = ""; return; }
    var sel = $("rw-show"), cur = sel.value === "" ? 0 : +sel.value;
    sel.innerHTML = res.combos.map(function (c, i) { return '<option value="' + i + '"' + (i === cur ? " selected" : "") + ">" + esc(c.name) + "</option>"; }).join("");
    $("rw-svg").innerHTML = draw(res, LIVE, cur);
    var warns = res.warn.slice(); res.combos.forEach(function (c) { if (c.error) warns.push(c.name + ": " + c.error); });
    $("rw-warn").innerHTML = warns.length ? '<div class="notice" role="note"><ul class="rw-warn">' + warns.map(function (w) { return "<li>" + esc(w) + "</li>"; }).join("") + "</ul></div>" : "";
    var grp = "", h = "";
    res.summary.forEach(function (s) {
      if (s.name !== grp) { grp = s.name; h += '<tr class="grp"><td colspan="4">' + esc(grp) + "</td></tr>"; }
      var u = s.util, bad = !(u <= 1), pct = isFinite(u) ? Math.min(100, u * 100) : 100;
      var val = s.value == null ? "" : s.lower ? f(s.value, s.unit === "kPa" ? 1 : 3) + " ≤ " + f(s.req, s.unit === "kPa" ? 0 : 3) + (s.unit ? " " + s.unit : "") : f(s.value, 2) + " ≥ " + f(s.req, 2);
      h += "<tr><td>" + esc(s.label) + '</td><td class="n">' + val + '</td><td style="width:22%"><div class="bar' + (bad ? " bad" : "") + '"><i style="width:' + pct + '%"></i></div></td><td class="n"><span class="tag' + (bad ? " bad" : "") + '">' + (isFinite(u) ? Math.round(u * 100) + "%" : "fail") + "</span></td></tr>";
    });
    $("rw-sum").innerHTML = h;
    $("rw-calc").innerHTML = '<tr><th>Ref</th><th>Item</th><th>Symbol</th><th class="eq">Equation or basis</th><th style="text-align:right">Value</th><th>Unit</th></tr>' + res.rows.map(function (r) {
      if (r.head) return '<tr class="h"><td colspan="6">' + esc(r.head) + "</td></tr>";
      return '<tr><td class="ref">' + esc(r.ref) + "</td><td>" + esc(r.desc) + '</td><td class="mono">' + esc(r.sym) + '</td><td class="eq">' + esc(r.eq) + '</td><td class="v">' + esc(r.val) + "</td><td>" + esc(r.unit) + "</td></tr>";
    }).join("");
  }
  $("rw-show").addEventListener("change", function () { update(); });
  $("rw-cs").addEventListener("toggle", function () { $("rw-cs").querySelector("summary").textContent = $("rw-cs").open ? "Hide the calculation sheet" : "Show the calculation sheet"; });
  window.addEventListener("beforeprint", function () { if (!sec.hidden) $("rw-cs").open = true; });

  /* ---------- exports ---------- */
  function inputRows() {
    var out = [];
    G.forEach(function (g) {
      if (g.pf) return;
      g.f.forEach(function (d) { var v = state[d[0]]; if (d[2] === "sel" && d[3]) { var o = d[3].filter(function (x) { return String(x[0]) === String(v); })[0]; v = o ? o[1] : v; } out.push([g.t, d[1], v === true ? "yes" : v === false ? "no" : v, d[2] === "sel" || d[2] === "chk" ? "" : d[2]]); });
    });
    PF.forEach(function (p) { out.push(["Partial factors and limits", p[1]].concat(state.sets.map(function (s) { return +s[p[0]]; }))); });
    return out;
  }
  var DISC = "Indicative first-pass check only. Not a design to build from. Partial factors, limits and material values are user inputs: check them against the governing document. Not a statement of code compliance.";
  function stamp() { var d = new Date(); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }
  function msg(t) { $("rw-msg").textContent = t; setTimeout(function () { if ($("rw-msg").textContent === t) $("rw-msg").textContent = ""; }, 4000); }
  $("rw-csv").addEventListener("click", function () {
    if (!last || last.error) return;
    var rows = [["Retaining wall first-pass check", stamp()], [DISC], [], ["INPUTS"], ["Group", "Input", "Value", "Unit"]].concat(inputRows()).concat([[], ["CALCULATION"], ["Ref", "Item", "Symbol", "Equation or basis", "Value", "Unit"]])
      .concat(last.rows.map(function (r) { return r.head ? [r.head] : [r.ref, r.desc, r.sym, r.eq, r.val, r.unit]; }))
      .concat([[], ["CHECKS"], ["Combination", "Check", "Value", "Required or limit", "Utilisation %"]]).concat(last.summary.map(function (s) { return [s.name, s.label, s.value == null ? "" : +(+s.value).toFixed(4), s.req == null ? "" : s.req, isFinite(s.util) ? Math.round(s.util * 100) : "fail"]; }));
    X.csv("retaining-wall-check.csv", rows); msg("Downloaded retaining-wall-check.csv");
  });
  $("rw-xlsx").addEventListener("click", function () {
    if (!last || last.error) return;
    var b = function (v) { return { v: v, b: true }; };
    var sum = [[b("Retaining wall first-pass check"), stamp()], [DISC], [], [b("Combination"), b("Check"), b("Value"), b("Required or limit"), b("Utilisation")]]
      .concat(last.summary.map(function (s) { return [s.name, s.label, s.value == null ? "" : { v: +(+s.value).toFixed(4), fmt: "0.000" }, s.req == null ? "" : { v: +(+s.req).toFixed(4), fmt: "0.000" }, isFinite(s.util) ? { v: s.util, fmt: "0%" } : "fail"]; }));
    var inp = [[b("Group"), b("Input"), b("Value"), b("Unit")]].concat(inputRows());
    inp.splice(inp.length - PF.length, 0, [], [b("Partial factors"), b("Factor")].concat(state.sets.map(function (s) { return b(s.name); })));
    var calc = [[b("Ref"), b("Item"), b("Symbol"), b("Equation or basis"), b("Value"), b("Unit")]].concat(last.rows.map(function (r) {
      return r.head ? [b(r.head)] : [r.ref, r.desc, r.sym, r.eq, typeof r.raw === "number" && isFinite(r.raw) ? { v: +r.raw.toPrecision(10), fmt: "0.000" } : r.val, r.unit];
    }));
    X.xlsx("retaining-wall-check.xlsx", [{ name: "Checks", rows: sum, widths: [26, 44, 12, 16, 12] }, { name: "Inputs", rows: inp, widths: [26, 40, 18, 18, 18] }, { name: "Calculation", rows: calc, widths: [8, 52, 18, 70, 14, 8] }]);
    msg("Downloaded retaining-wall-check.xlsx");
  });
  function exportSvg() { var holder = document.createElement("div"); holder.innerHTML = draw(last, PRINT, +$("rw-show").value || 0); return holder.firstChild; }
  $("rw-png").addEventListener("click", function () {
    if (!last || last.error) return;
    X.svgToPng(exportSvg(), "retaining-wall-section.png", 3).then(function () { msg("Downloaded retaining-wall-section.png"); }, function () { msg("PNG export failed in this browser."); });
  });
  $("rw-pdf").addEventListener("click", function () {
    if (!last || last.error) return;
    var svg = new XMLSerializer().serializeToString(exportSvg());
    var sum = last.summary.map(function (s) { return "<tr><td>" + esc(s.name) + "</td><td>" + esc(s.label) + '</td><td class="n">' + (s.value == null ? "" : f(s.value, 3)) + '</td><td class="n">' + (s.req == null ? "" : f(s.req, 3)) + '</td><td class="n">' + (isFinite(s.util) ? Math.round(s.util * 100) + "%" : "fail") + "</td></tr>"; }).join("");
    var calc = last.rows.map(function (r) { return r.head ? '<tr class="h"><td colspan="6">' + esc(r.head) + "</td></tr>" : "<tr><td>" + esc(r.ref) + "</td><td>" + esc(r.desc) + "</td><td>" + esc(r.sym) + '</td><td class="eq">' + esc(r.eq) + '</td><td class="n">' + esc(r.val) + "</td><td>" + esc(r.unit) + "</td></tr>"; }).join("");
    X.printHtml("retaining-wall-check", '<h1>Retaining wall first-pass check</h1><p class="d">' + esc(stamp()) + " · Civil Chartered Path</p><p class=\"disc\">" + esc(DISC) + "</p>" + svg +
      "<h2>Checks</h2><table><tr><th>Combination</th><th>Check</th><th>Value</th><th>Required / limit</th><th>Utilisation</th></tr>" + sum + "</table>" +
      '<h2 class="pb">Calculation sheet</h2><table class="calc"><tr><th>Ref</th><th>Item</th><th>Symbol</th><th>Equation or basis</th><th>Value</th><th>Unit</th></tr>' + calc + "</table>",
      "@page{size:A4;margin:12mm}h1{font-size:18px;margin:0}h2{font-size:14px;margin:14px 0 6px}.d{color:#5a6677;margin:2px 0 6px}.disc{border:1px solid #b07a06;background:#f7edcf;padding:6px 8px;font-size:11px}svg{width:100%;height:auto;max-height:150mm}table{width:100%;border-collapse:collapse;font-size:10px}td,th{border-top:1px solid #d5dbd9;padding:3px 5px 3px 0;text-align:left;vertical-align:top}.n{text-align:right;font-family:Courier New,monospace}.eq{font-family:Courier New,monospace;font-size:9px;color:#5a6677}tr.h td{font-weight:bold;border-top:1.5px solid #0d6b78;padding-top:8px}.pb{page-break-before:always}tr{page-break-inside:avoid}");
    msg("Opening print. Choose Save as PDF.");
  });

  buildForm(); update();
  window.RWTool = { state: function () { return state; }, result: function () { return last; } };
})();
