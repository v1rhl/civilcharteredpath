/* Tools: PMF rapid screening. Registers on window.CP_TOOLS, builds its own view, uses PMFCalc and CPExport. */
(function () {
  "use strict";
  var ID = "pmf";
  window.CP_TOOLS = (window.CP_TOOLS || []).concat([{ id: ID, label: "PMF screening", blurb: "Rapid, indicative probable maximum flood screening: a unit hydrograph from catchment inputs, your design rainfall and losses, the inflow hydrograph and level-pool routing over a spillway." }]);
  var C = window.PMFCalc, X = window.CPExport;
  var main = document.querySelector("main"); if (!main || !C) return;

  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function f(v, n) { if (typeof v !== "number") return esc(v); if (!isFinite(v)) return v > 0 ? "∞" : "–"; return v.toFixed(n == null ? 2 : n); }
  function $(id) { return document.getElementById(id); }
  var S = "#view-pmf ";

  /* ---------- styles (scoped to this view) ---------- */
  var css = document.createElement("style");
  css.textContent = [
    S + ".pm-grid{display:grid;grid-template-columns:minmax(0,380px) minmax(0,1fr);gap:16px;align-items:start}",
    "@media (max-width:960px){" + S + ".pm-grid{grid-template-columns:minmax(0,1fr)}}",
    S + ".pm-in{gap:0;padding:6px 16px}",
    S + ".pm-in details{border-top:1px solid var(--tool-line);padding:10px 0}",
    S + ".pm-in details:first-of-type{border-top:0}",
    S + ".pm-in summary{cursor:pointer;font-weight:700;font-family:var(--font-display)}",
    S + ".pm-fields{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:10px 12px;margin-top:10px}",
    S + ".pm-fields .field.wide{grid-column:1/-1}",
    S + ".field label{font-size:.84rem;line-height:1.25}",
    S + ".field input[type=number]," + S + ".field input[type=text]," + S + ".field select," + S + ".field textarea{width:100%;min-width:0}",
    S + ".field textarea{font:400 .82rem var(--font-mono);min-height:84px;padding:6px;border:1px solid var(--line);border-radius:4px;background:var(--surface);color:var(--ink)}",
    S + ".field .u{font:500 .72rem var(--font-mono);color:var(--muted)}",
    S + ".ph{display:inline-block;font:600 .66rem var(--font-mono);text-transform:uppercase;letter-spacing:.04em;padding:1px 5px;border-radius:3px;background:var(--flag-soft);color:var(--ink);border:1px solid var(--flag);margin-left:4px;vertical-align:1px}",
    S + ".chk{display:flex;gap:8px;align-items:flex-start;font-size:.88rem;grid-column:1/-1}",
    S + ".chk input{width:17px;height:17px;accent-color:var(--accent);margin-top:2px}",
    S + ".pm-case{border:1px solid var(--tool-line);border-radius:var(--radius);padding:10px;margin-top:10px;background:var(--surface)}",
    S + ".pm-case .pm-fields{margin-top:8px}",
    S + ".pm-case-h{display:flex;gap:8px;align-items:center}",
    S + ".pm-case-h input{flex:1;min-width:0;font-weight:600}",
    S + ".pm-case-h .btn{padding:4px 10px;font-size:.8rem}",
    S + ".pm-out{display:flex;flex-direction:column;gap:16px;min-width:0}",
    S + ".pm-tiles{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px}",
    S + ".pm-tile{border:1px solid var(--line);border-radius:var(--radius);padding:10px 12px;background:var(--surface)}",
    S + ".pm-tile b{display:block;font:700 1.35rem/1.1 var(--font-display);color:var(--ink);font-variant-numeric:tabular-nums}",
    S + ".pm-tile span{font-size:.78rem;color:var(--muted)}",
    S + ".pm-tile .tag{margin-top:6px;display:inline-block}",
    S + ".tag{font:600 .74rem var(--font-mono);padding:2px 6px;border-radius:4px;background:var(--accent-soft);color:var(--ink);white-space:nowrap}",
    S + ".tag.bad{background:var(--accent-2-soft);color:var(--ink)}",
    S + ".pm-fig{position:relative}",
    S + ".pm-fig svg{width:100%;height:auto;display:block}",
    S + ".pm-tip{position:absolute;pointer-events:none;background:var(--surface);border:1px solid var(--line);border-radius:6px;padding:6px 8px;font:500 .78rem var(--font-mono);color:var(--ink);box-shadow:0 2px 8px rgba(0,0,0,.12);white-space:nowrap;z-index:2}",
    S + ".pm-tip i{display:inline-block;width:10px;height:3px;border-radius:2px;margin-right:5px;vertical-align:middle}",
    S + ".pm-leg{display:flex;gap:14px;flex-wrap:wrap;font-size:.8rem;color:var(--ink);margin:4px 0 2px}",
    S + ".pm-leg i{display:inline-block;width:16px;height:3px;border-radius:2px;margin-right:6px;vertical-align:middle}",
    S + ".pm-leg i.d{height:0;border-top:2px dashed var(--muted);background:none}",
    S + ".pm-leg i.b{height:10px;width:10px}",
    S + ".pm-tools{display:flex;gap:8px;flex-wrap:wrap;align-items:center}",
    S + ".pm-tools .btn{padding:7px 12px;font-size:.88rem}",
    S + ".pm-sum{width:100%;font-size:.86rem}",
    S + ".pm-sum td," + S + ".pm-sum th{padding:6px 8px 6px 0;width:auto;font-weight:400;color:var(--ink);text-align:left}",
    S + ".pm-sum th{font-size:.74rem;color:var(--muted);font-weight:600}",
    S + ".pm-sum td.n," + S + ".pm-sum th.n{font-family:var(--font-mono);font-variant-numeric:tabular-nums;white-space:nowrap;text-align:right}",
    S + ".pm-calc{font-size:.84rem}",
    S + ".pm-calc td{padding:5px 8px 5px 0;width:auto;font-weight:400;color:var(--ink)}",
    S + ".pm-calc td.ref{font-family:var(--font-mono);color:var(--muted);white-space:nowrap}",
    S + ".pm-calc td.eq{font-family:var(--font-mono);font-size:.78rem;color:var(--muted)}",
    S + ".pm-calc td.v{font-family:var(--font-mono);text-align:right;white-space:nowrap}",
    S + ".pm-calc tr.h td{font-weight:700;font-family:var(--font-display);padding-top:16px;border-top:2px solid var(--accent)}",
    S + ".pm-calc th{text-align:left;font-size:.76rem;color:var(--muted);padding:4px 8px 4px 0}",
    S + ".pm-cs>summary{list-style:none;display:inline-flex}" + S + ".pm-cs>summary::-webkit-details-marker{display:none}",
    S + ".pm-warn{margin:0;padding-left:18px;color:var(--ink);font-size:.88rem}",
    S + ".pm-lim{margin:0;padding-left:18px;font-size:.86rem;color:var(--muted);display:flex;flex-direction:column;gap:4px}",
    "@media (max-width:520px){" + S + ".pm-calc td.eq," + S + ".pm-calc th.eq{display:none}" + S + ".pm-fields{grid-template-columns:minmax(0,1fr)}}",
    "@media print{body.on-pmf main>section:not(#view-pmf){display:none!important}body.on-pmf #view-pmf .no-print{display:none!important}}"
  ].join("\n");
  document.head.appendChild(css);

  /* ---------- view ---------- */
  var sec = document.createElement("section");
  sec.className = "view wrap"; sec.id = "view-" + ID; sec.dataset.view = ID; sec.hidden = true;
  sec.innerHTML =
    '<div class="view-head"><span class="eyebrow"><a href="#tools" style="color:inherit;text-decoration:none">Tools</a> / PMF screening</span><h2>Probable maximum flood: rapid screening</h2>' +
    '<p class="lede">A quick look at how a catchment and reservoir might respond to an extreme storm. Enter the catchment, the design rainfall and losses, and the spillway; the tool builds a unit hydrograph, convolves the net rainfall into an inflow hydrograph and routes it through the reservoir. Everything recalculates as you type.</p></div>' +
    '<div class="notice" role="note"><div><p><strong>Indicative screening only. Not a reservoir flood assessment.</strong> This tool runs a generic rainfall-runoff and routing chain from first principles. It does not implement any named published reservoir flood estimation method, and it contains none of the tabulated parameters, regional factors, rainfall depths, storm profiles or maps those methods use. Every input marked <span class="ph" style="margin:0">placeholder</span> is an illustrative value only: the real value must come from the governing guidance for the site. A flood assessment for a reservoir, including any statutory assessment, must be carried out by a suitably qualified engineer using that guidance.</p></div></div>' +
    '<div class="pm-grid">' +
      '<form class="panel tool pm-in no-print" id="pm-form" autocomplete="off" onsubmit="return false"></form>' +
      '<div class="pm-out">' +
        '<div class="panel"><div style="display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap;align-items:baseline"><h3>Result</h3>' +
          '<label class="small no-print">Show <select id="pm-case" style="padding:4px 6px"></select></label></div>' +
          '<div id="pm-warn"></div><div class="pm-tiles" id="pm-tiles"></div></div>' +
        '<div class="panel pm-fig"><h3>Hydrograph</h3><div class="pm-leg" id="pm-leg"></div><div id="pm-svg"></div><div class="pm-tip" id="pm-tip" hidden></div>' +
          '<div class="pm-tools no-print" style="margin-top:8px"><button type="button" class="btn ghost" id="pm-png">PNG</button><button type="button" class="btn ghost" id="pm-pdf">PDF (chart and working)</button><span class="small" id="pm-msg" role="status"></span></div></div>' +
        '<div class="panel"><h3>All storm cases</h3><div class="table-wrap"><table class="pm-sum" id="pm-sum"></table></div>' +
          '<p class="small">The critical case is the one with the highest peak outflow (or peak inflow when routing is off). It is critical only among the cases you entered: a real assessment tries a range of durations and seasons as its guidance directs.</p></div>' +
      '</div>' +
    '</div>' +
    '<div class="panel"><div style="display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap;align-items:baseline"><h3>Working</h3>' +
      '<div class="pm-tools no-print"><button type="button" class="btn" id="pm-xlsx">Excel (XLSX)</button><button type="button" class="btn ghost" id="pm-csv">CSV</button></div></div>' +
      '<p class="small">Every step for the case shown above, with your numbers substituted. The exports include all cases and the hydrograph ordinates.</p>' +
      '<details class="pm-cs" id="pm-cs"><summary class="btn ghost">Show the working</summary><div class="table-wrap" style="margin-top:12px"><table class="pm-calc" id="pm-calc"></table></div></details></div>' +
    '<details class="panel ref"><summary><span class="eyebrow">Method, assumptions and what is left out</span></summary><ul class="pm-lim">' +
      "<li><strong>Response time.</strong> Time of concentration by Kirpich's formula (fitted to small, steep agricultural catchments), or main stream length over a travel velocity you choose. Lag is a fraction of T_c, and the time to peak of the Δt unit hydrograph is Δt/2 + lag. Or enter T_p directly, which is what you should do when your governing guidance gives a way to estimate it.</li>" +
      "<li><strong>Unit hydrograph.</strong> Triangular, with time base T_B as a ratio of T_p. Its peak comes from volume conservation (1 mm over the catchment), and the sampled ordinates are rescaled so the volume is exact.</li>" +
      "<li><strong>Rainfall.</strong> You enter the point depth for each storm case, an areal reduction factor and a profile. The built-in profile is a generic symmetric shape where the central fraction p of the storm holds p^a of the depth; it is not any published design profile. To use a published profile, enter it as user blocks. Snowmelt, if any, is added uniformly and passes through the same losses.</li>" +
      "<li><strong>Losses.</strong> Either a constant percentage runoff applied to every block, or a curve-number cumulative loss (initial abstraction λS, then (P − I_a)² / (P − I_a + S)). Both parameters are yours to set.</li>" +
      "<li><strong>Routing.</strong> Level pool: dh/dt = (I − O(h)) / A(h), with plan area linear in head between the spillway crest and the dam crest, solved by fourth-order Runge–Kutta. The spillway is a free weir O = C L h^1.5 or your own rating table. The weir default C = 1.7 m^½/s is the ideal broad-crested value √g (2/3)^1.5; real spillways differ.</li>" +
      "<li><strong>Not included:</strong> any published reservoir flood method's parameters, rainfall depths, profiles, areal reduction or seasonal factors; critical-duration search against depth-duration data; wave freeboard and wind set-up; flow over the dam crest once it overtops; downstream submergence of the spillway; gates, draw-off works or other outlets; cascades of reservoirs; climate change allowances; and urban, lake or catchment-storage effects on the response.</li>" +
    "</ul></details>";
  main.appendChild(sec);

  /* ---------- inputs ---------- */
  var D0 = C.DEFAULTS, KEY = "cp-pmf";
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  var state = (function () { try { var s = JSON.parse(localStorage.getItem(KEY) || "null"); if (s && s.v === 1) return s.d; } catch (e) {} return null; })() || clone(D0);
  for (var k0 in D0) if (state[k0] === undefined) state[k0] = clone(D0[k0]);
  function save() { try { localStorage.setItem(KEY, JSON.stringify({ v: 1, d: state })); } catch (e) {} }

  /* [key, label, unit|"sel"|"chk"|"area", options, class, help, condition, placeholder?] */
  var G = [
    { t: "Catchment", open: true, f: [
      ["A", "Catchment area A", "km²"], ["L", "Main stream length L", "km"],
      ["S", "Representative stream slope S", "m/km", null, "", "Slope of the main stream, used by Kirpich only."],
      ["baseflow", "Baseflow Q_b", "m³/s", null, "", "Estimate from gauged data or the governing guidance.", "", 1]] },
    { t: "Unit hydrograph", open: true, f: [
      ["tpMethod", "Response time from", "sel", [["kirpich", "Kirpich T_c from L and S"], ["velocity", "Travel time L / v"], ["direct", "Enter T_p directly"]], "wide"],
      ["vel", "Mean travel velocity v", "m/s", null, "", "Judge from the channel and floodplain at extreme flows.", "velocity", 1],
      ["lagRatio", "Lag / T_c", "", null, "", "0.6 is a common rule of thumb.", "lagged", 1],
      ["tpDirect", "Time to peak T_p′", "h", null, "", "From the governing guidance or a gauged unit hydrograph, for the Δt used.", "direct"],
      ["tpFactor", "Extreme-event T_p factor", "", null, "", "Some guidance shortens the response for extreme floods. Enter its factor; 1.0 leaves T_p unchanged.", "", 1],
      ["baseRatio", "Time base ratio T_B / T_p", "", null, "", "2.67 is the NRCS triangular shape.", "", 1],
      ["dtUser", "Time step Δt (blank = auto)", "h", "text", "", "Auto uses about a quarter of the lag with an odd number of storm blocks."]] },
    { t: "Storm cases", open: true, cases: true },
    { t: "Storm profile", f: [
      ["profile", "Profile", "sel", [["peaked", "Generic symmetric (parametric)"], ["uniform", "Uniform"], ["custom", "User blocks (enter below)"]], "wide"],
      ["peak", "Peakedness exponent a", "", null, "", "Central fraction p of the storm holds p^a of the depth. 1 = uniform; smaller is more peaked.", "peaked", 1],
      ["custom", "Block depths, start to end (any units, any number)", "area", null, "wide", "Proportions only; they are scaled to the storm depth and resampled to the time step. Enter the profile your governing guidance prescribes.", "custom"]] },
    { t: "Losses", f: [
      ["lossModel", "Loss model", "sel", [["pr", "Constant percentage runoff"], ["cn", "Curve number (cumulative)"]], "wide", "The loss value for each storm case is set in the Storm cases table."],
      ["lambda", "Initial abstraction ratio λ", "", null, "", "I_a = λ S. 0.2 is the traditional value.", "cn", 1]] },
    { t: "Reservoir and spillway", f: [
      ["route", "Route the inflow through the reservoir", "chk"],
      ["A0", "Surface area at spillway crest", "ha", null, "", "", "route"], ["A1", "Surface area at dam crest level", "ha", null, "", "Blank = same as at spillway crest.", "route"],
      ["hc", "Dam crest above spillway crest", "m", null, "", "", "route"], ["h0", "Initial head above spillway crest", "m", null, "", "0 = reservoir full to the crest.", "route"],
      ["rating", "Spillway rating", "sel", [["weir", "Free weir O = C L h^1.5"], ["table", "Rating table (head, flow)"]], "wide", "", "route"],
      ["Cw", "Weir coefficient C", "m^½/s", null, "", "Use the coefficient for the actual spillway shape.", "weir", 1], ["Lw", "Crest length L_w", "m", null, "", "", "weir"],
      ["table", "Head above crest (m), flow (m³/s): one pair per line", "area", null, "wide", "", "table"]] }
  ];
  var CASECOLS = [["name", "Case"], ["D", "Duration D", "h"], ["P", "Point rainfall depth P", "mm", 1], ["arf", "Areal reduction factor", "", 1], ["loss", "", "", 1], ["snow", "Snowmelt", "mm/h", 1]];

  function fieldHtml(d) {
    var k = d[0], lab = d[1], u = d[2], opts = d[3], cls = d[4] || "", help = d[5] || "", cond = d[6] || "", ph = d[7];
    var v = state[k], ca = cond ? ' data-cond="' + cond + '"' : "", tag = ph ? '<span class="ph">placeholder</span>' : "";
    if (u === "chk") return '<label class="chk"' + ca + '><input type="checkbox" data-k="' + k + '"' + (v ? " checked" : "") + "><span>" + esc(lab) + (help ? '<br><span class="small">' + esc(help) + "</span>" : "") + "</span></label>";
    var ctl;
    if (u === "sel") ctl = '<select id="pm-' + k + '" data-k="' + k + '">' + (opts || []).map(function (o) { return '<option value="' + esc(o[0]) + '"' + (String(o[0]) === String(v) ? " selected" : "") + ">" + esc(o[1]) + "</option>"; }).join("") + "</select>";
    else if (u === "area") ctl = '<textarea id="pm-' + k + '" data-k="' + k + '" spellcheck="false">' + esc(v) + "</textarea>";
    else if (opts === "text") ctl = '<input type="text" inputmode="decimal" id="pm-' + k + '" data-k="' + k + '" value="' + esc(v) + '">';
    else ctl = '<input type="number" step="any" id="pm-' + k + '" data-k="' + k + '" value="' + esc(v) + '">';
    var unit = u && u !== "sel" && u !== "area" ? ' <span class="u">' + esc(u) + "</span>" : "";
    return '<div class="field ' + cls + '"' + ca + '><label for="pm-' + k + '">' + esc(lab) + unit + tag + "</label>" + ctl + (help ? '<span class="small">' + esc(help) + "</span>" : "") + "</div>";
  }
  function casesHtml() {
    var lossLab = state.lossModel === "cn" ? "Curve number CN" : "Percentage runoff PR %", lk = state.lossModel === "cn" ? "cn" : "pr";
    return '<p class="small" style="margin-top:8px">One row per storm: a duration, a season or other variant, and its rainfall and losses. The example rows are illustrative inputs, <strong>not PMP estimates</strong>: take the point PMP depth for each duration and season, the areal reduction factor, the losses and any snowmelt from the governing guidance for the site.</p>' +
      state.cases.map(function (cs, i) {
        return '<div class="pm-case"><div class="pm-case-h"><input type="text" data-case="' + i + '" data-ck="name" value="' + esc(cs.name) + '" aria-label="Name of case ' + (i + 1) + '"><button type="button" class="btn ghost" data-del="' + i + '" aria-label="Remove ' + esc(cs.name) + '"' + (state.cases.length < 2 ? " disabled" : "") + '>Remove</button></div><div class="pm-fields">' +
          CASECOLS.slice(1).map(function (c) {
            var key = c[0] === "loss" ? lk : c[0], lab = c[0] === "loss" ? lossLab : c[1], id = "pm-c" + i + "-" + key;
            return '<div class="field"><label for="' + id + '">' + esc(lab) + (c[2] ? ' <span class="u">' + esc(c[2]) + "</span>" : "") + (c[3] ? '<span class="ph">placeholder</span>' : "") + '</label><input type="number" step="any" id="' + id + '" data-case="' + i + '" data-ck="' + key + '" value="' + esc(cs[key]) + '"></div>';
          }).join("") + "</div></div>";
      }).join("") +
      '<button type="button" class="btn ghost" id="pm-add" style="margin-top:8px;padding:5px 10px;font-size:.84rem"' + (state.cases.length >= 8 ? " disabled" : "") + ">Add a case</button>";
  }
  function buildForm() {
    $("pm-form").innerHTML = '<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;padding:8px 0"><span class="eyebrow">Inputs</span><button type="button" class="btn ghost" id="pm-reset" style="padding:4px 10px;font-size:.82rem">Reset to worked example</button></div>' +
      G.map(function (g) {
        return "<details" + (g.open ? " open" : "") + "><summary>" + esc(g.t) + "</summary>" + (g.cases ? casesHtml() : '<div class="pm-fields">' + g.f.map(fieldHtml).join("") + "</div>") + "</details>";
      }).join("") + '<p class="small" style="padding:10px 0">Inputs are kept in this browser only.</p>';
    conds();
  }
  function conds() {
    Array.prototype.forEach.call($("pm-form").querySelectorAll("[data-cond]"), function (el) {
      var c = el.dataset.cond, on = true;
      if (c === "velocity" || c === "direct") on = state.tpMethod === c;
      else if (c === "lagged") on = state.tpMethod !== "direct";
      else if (c === "peaked" || c === "custom") on = state.profile === c;
      else if (c === "cn") on = state.lossModel === "cn";
      else if (c === "route") on = !!state.route;
      else if (c === "weir" || c === "table") on = !!state.route && state.rating === c;
      el.hidden = !on;
    });
  }
  function onInput(e) {
    var t = e.target;
    if (t.dataset.case != null) { var cs = state.cases[+t.dataset.case]; cs[t.dataset.ck] = t.dataset.ck === "name" ? t.value : t.value === "" ? "" : +t.value; }
    else if (t.dataset.k) {
      var k = t.dataset.k;
      state[k] = t.type === "checkbox" ? t.checked : t.tagName === "SELECT" || t.tagName === "TEXTAREA" || t.type === "text" ? t.value : t.value === "" ? "" : +t.value;
      if (k === "lossModel" && e.type === "change") buildForm();
      conds();
    } else return;
    save(); update();
  }
  $("pm-form").addEventListener("input", onInput);
  $("pm-form").addEventListener("change", onInput);
  $("pm-form").addEventListener("click", function (e) {
    var t = e.target;
    if (t.id === "pm-reset") { state = clone(D0); }
    else if (t.id === "pm-add") { var last = state.cases[state.cases.length - 1]; var n = clone(last); n.name = "Case " + String.fromCharCode(65 + state.cases.length); state.cases.push(n); }
    else if (t.dataset.del != null) { if (state.cases.length < 2) return; state.cases.splice(+t.dataset.del, 1); }
    else return;
    save(); buildForm(); update();
  });

  /* ---------- chart ---------- */
  var LIVE = { bg: "var(--surface)", ink: "var(--ink)", muted: "var(--muted)", grid: "var(--line)", inflow: "var(--s-blue)", outflow: "var(--accent-2)", gross: "var(--tool-line)", net: "var(--accent)", font: "IBM Plex Sans, Arial, sans-serif", mono: "IBM Plex Mono, monospace" };
  var PRINT = { bg: "#ffffff", ink: "#15233a", muted: "#5a6677", grid: "#d5dbd9", inflow: "#3f6fd1", outflow: "#b84a32", gross: "#a9cfd4", net: "#0d6b78", font: "Arial, Helvetica, sans-serif", mono: "Courier New, monospace" };
  var GEO = { W: 720, H: 430, l: 58, r: 20, t: 18, rainH: 78, gap: 26, b: 40 };

  function niceStep(max, n) { var raw = max / n, p = Math.pow(10, Math.floor(Math.log10(raw))), m = raw / p; return (m <= 1 ? 1 : m <= 2 ? 2 : m <= 2.5 ? 2.5 : m <= 5 ? 5 : 10) * p; }
  function chart(cs, P, res) {
    var g = GEO, W = g.W, H = g.H, x0 = g.l, x1 = W - g.r, rt = g.t, rb = rt + g.rainH, qt = rb + g.gap, qb = H - g.b;
    var R = cs.route, tEnd = cs.t[cs.t.length - 1] || 1;
    var qmax = Math.max.apply(null, cs.inflow); if (R) qmax = Math.max(qmax, R.Qcap * 1.05, Math.max.apply(null, R.Q));
    var qs = niceStep(qmax, 5), qTop = Math.ceil(qmax / qs) * qs || 1;
    var rmax = Math.max.apply(null, cs.gross) || 1, rs = niceStep(rmax, 2), rTop = Math.ceil(rmax / rs) * rs;
    var ts = niceStep(tEnd, 8);
    function X(t) { return x0 + (x1 - x0) * t / tEnd; }
    function YQ(q) { return qb - (qb - qt) * q / qTop; }
    function YR(v) { return rt + (rb - rt) * v / rTop; }
    var o = ['<rect x="0" y="0" width="' + W + '" height="' + H + '" style="fill:' + P.bg + '"/>'];
    /* grids */
    for (var q = 0; q <= qTop + 1e-9; q += qs) o.push('<line x1="' + x0 + '" x2="' + x1 + '" y1="' + YQ(q).toFixed(1) + '" y2="' + YQ(q).toFixed(1) + '" style="stroke:' + P.grid + ';stroke-width:' + (q === 0 ? 1 : 0.6) + '"/><text x="' + (x0 - 6) + '" y="' + (YQ(q) + 3.5).toFixed(1) + '" text-anchor="end" style="font:500 10px ' + P.mono + ';fill:' + P.muted + '">' + +q.toFixed(2) + "</text>");
    for (var v = 0; v <= rTop + 1e-9; v += rs) o.push('<line x1="' + x0 + '" x2="' + x1 + '" y1="' + YR(v).toFixed(1) + '" y2="' + YR(v).toFixed(1) + '" style="stroke:' + P.grid + ';stroke-width:' + (v === 0 ? 1 : 0.6) + '"/><text x="' + (x0 - 6) + '" y="' + (YR(v) + 3.5).toFixed(1) + '" text-anchor="end" style="font:500 10px ' + P.mono + ';fill:' + P.muted + '">' + +v.toFixed(2) + "</text>");
    for (var t = 0; t <= tEnd + 1e-9; t += ts) o.push('<text x="' + X(t).toFixed(1) + '" y="' + (qb + 15) + '" text-anchor="middle" style="font:500 10px ' + P.mono + ';fill:' + P.muted + '">' + +t.toFixed(2) + "</text>");
    o.push('<text x="' + ((x0 + x1) / 2) + '" y="' + (H - 6) + '" text-anchor="middle" style="font:500 11px ' + P.font + ';fill:' + P.muted + '">Time from start of storm (h)</text>');
    o.push('<text transform="translate(14,' + ((qt + qb) / 2) + ') rotate(-90)" text-anchor="middle" style="font:500 11px ' + P.font + ';fill:' + P.muted + '">Flow (m³/s)</text>');
    o.push('<text transform="translate(14,' + ((rt + rb) / 2) + ') rotate(-90)" text-anchor="middle" style="font:500 11px ' + P.font + ';fill:' + P.muted + '">Rain (mm/Δt)</text>');
    /* rain bars hanging from the top, 2px gap */
    var bw = Math.max(1, (X(cs.dt) - X(0)) - 2);
    cs.gross.forEach(function (gv, i) {
      var bx = X(i * cs.dt) + 1;
      o.push('<rect x="' + bx.toFixed(1) + '" y="' + rt + '" width="' + bw.toFixed(1) + '" height="' + Math.max(0, YR(gv) - rt).toFixed(1) + '" style="fill:' + P.gross + '"/>');
      o.push('<rect x="' + bx.toFixed(1) + '" y="' + rt + '" width="' + bw.toFixed(1) + '" height="' + Math.max(0, YR(cs.net[i]) - rt).toFixed(1) + '" style="fill:' + P.net + '"/>');
    });
    /* spillway capacity */
    if (R) {
      o.push('<line x1="' + x0 + '" x2="' + x1 + '" y1="' + YQ(R.Qcap).toFixed(1) + '" y2="' + YQ(R.Qcap).toFixed(1) + '" style="stroke:' + P.muted + ';stroke-width:1.5;stroke-dasharray:6 4"/>');
      o.push('<text x="' + (x1 - 4) + '" y="' + (YQ(R.Qcap) - 5).toFixed(1) + '" text-anchor="end" style="font:500 10.5px ' + P.font + ';fill:' + P.ink + '">Spillway capacity at dam crest ' + f(R.Qcap, 1) + "</text>");
    }
    function line(arr, col) { return '<polyline points="' + arr.map(function (y, i) { return X(i * cs.dt).toFixed(1) + "," + YQ(y).toFixed(1); }).join(" ") + '" style="fill:none;stroke:' + col + ';stroke-width:2;stroke-linejoin:round;stroke-linecap:round"/>'; }
    o.push(line(cs.inflow, P.inflow));
    if (R) o.push(line(R.Q, P.outflow));
    /* direct labels at peaks */
    function peakLab(t, q, txt, dy) { o.push('<circle cx="' + X(t).toFixed(1) + '" cy="' + YQ(q).toFixed(1) + '" r="4" style="fill:' + P.bg + ';stroke:' + P.ink + ';stroke-width:1.5"/><text x="' + (X(t) + 8).toFixed(1) + '" y="' + (YQ(q) + dy).toFixed(1) + '" style="font:600 10.5px ' + P.font + ';fill:' + P.ink + '">' + esc(txt) + "</text>"); }
    peakLab(cs.tin, cs.Qin, "Inflow peak " + f(cs.Qin, 1) + " at " + f(cs.tin, 2) + " h", 4);
    if (R) peakLab(R.tout, R.Qout, "Outflow peak " + f(R.Qout, 1) + " at " + f(R.tout, 2) + " h", 14);
    o.push('<g id="pm-hover"></g><rect id="pm-hit" x="' + x0 + '" y="' + rt + '" width="' + (x1 - x0) + '" height="' + (qb - rt) + '" style="fill:transparent"/>');
    void res;
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="' + esc(cs.name) + ': rainfall above, inflow' + (R ? " and routed outflow" : "") + ' hydrograph below">' + o.join("") + "</svg>";
  }
  function legendHtml(cs) {
    return '<span><i style="background:var(--s-blue)"></i>Inflow</span>' + (cs.route ? '<span><i style="background:var(--accent-2)"></i>Routed outflow</span><span><i class="d"></i>Spillway capacity</span>' : "") +
      '<span><i class="b" style="background:var(--tool-line)"></i>Gross rain</span><span><i class="b" style="background:var(--accent)"></i>Net rain</span>';
  }
  function hover(e) {
    var cs = shown(); if (!cs) return;
    var svg = $("pm-svg").querySelector("svg"), pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY;
    var p = pt.matrixTransform(svg.getScreenCTM().inverse()), g = GEO, tEnd = cs.t[cs.t.length - 1];
    var t = (p.x - g.l) / (g.W - g.r - g.l) * tEnd, i = Math.max(0, Math.min(cs.t.length - 1, Math.round(t / cs.dt)));
    var xx = g.l + (g.W - g.r - g.l) * cs.t[i] / tEnd;
    $("pm-svg").querySelector("#pm-hover").innerHTML = '<line x1="' + xx + '" x2="' + xx + '" y1="' + g.t + '" y2="' + (g.H - g.b) + '" style="stroke:var(--muted);stroke-width:1"/>';
    var rain = i < cs.gross.length ? f(cs.gross[i], 1) + " / " + f(cs.net[i], 1) + " mm" : "0";
    var tip = $("pm-tip");
    tip.innerHTML = "t = " + f(cs.t[i], 2) + " h<br><i style=\"background:var(--s-blue)\"></i>in " + f(cs.inflow[i], 1) + " m³/s" + (cs.route ? '<br><i style="background:var(--accent-2)"></i>out ' + f(cs.route.Q[i], 1) + " m³/s, h " + f(cs.route.h[i], 3) + " m" : "") + "<br>rain gross/net " + rain;
    tip.hidden = false;
    var box = $("pm-svg").getBoundingClientRect(), fig = sec.querySelector(".pm-fig").getBoundingClientRect();
    var left = e.clientX - fig.left + 14; if (left + tip.offsetWidth > fig.width - 8) left = e.clientX - fig.left - tip.offsetWidth - 14;
    tip.style.left = Math.max(4, left) + "px"; tip.style.top = (e.clientY - fig.top - 20) + "px"; void box;
  }
  function unhover() { $("pm-tip").hidden = true; var h = $("pm-svg").querySelector("#pm-hover"); if (h) h.innerHTML = ""; }
  $("pm-svg").addEventListener("mousemove", function (e) { if (e.target.id === "pm-hit") hover(e); else unhover(); });
  $("pm-svg").addEventListener("mouseleave", unhover);

  /* ---------- results ---------- */
  var last = null, sel = null;
  function shown() { return last && !last.error ? last.cases[sel == null ? last.critical : Math.min(sel, last.cases.length - 1)] : null; }
  function tile(val, unit, lab, tag) { return '<div class="pm-tile"><span>' + esc(lab) + "</span><b>" + val + ' <small style="font-size:.7em;font-weight:500">' + esc(unit) + "</small></b>" + (tag || "") + "</div>"; }
  function update() {
    var res = C.run(state); last = res;
    if (res.error) {
      $("pm-svg").innerHTML = ""; $("pm-tiles").innerHTML = ""; $("pm-sum").innerHTML = ""; $("pm-calc").innerHTML = ""; $("pm-leg").innerHTML = "";
      $("pm-warn").innerHTML = '<div class="notice" role="alert"><p>' + esc(res.error) + "</p></div>"; return;
    }
    var cur = sel == null ? res.critical : Math.min(sel, res.cases.length - 1);
    $("pm-case").innerHTML = '<option value="">Critical case (' + esc(res.cases[res.critical].name) + ")</option>" + res.cases.map(function (c, i) { return '<option value="' + i + '"' + (sel === i ? " selected" : "") + ">" + esc(c.name) + "</option>"; }).join("");
    var cs = res.cases[cur], R = cs.route;
    var warns = res.warn.concat(cs.warn);
    $("pm-warn").innerHTML = warns.length ? '<div class="notice" role="note" style="margin-bottom:10px"><ul class="pm-warn">' + warns.map(function (w) { return "<li>" + esc(w) + "</li>"; }).join("") + "</ul></div>" : "";
    var h = tile(f(cs.Qin, 1), "m³/s", "Peak inflow") + tile(f(cs.tin, 2), "h", "Time to peak inflow") + tile(f(cs.Vd / 1e6, 3), "Mm³", "Direct runoff volume") + tile(f(cs.totN, 1), "mm", "Net rainfall");
    if (R) {
      var over = R.hmax > R.hc;
      h += tile(f(R.Qout, 1), "m³/s", "Peak outflow, " + f(R.atten * 100, 0) + "% attenuation") +
        tile(f(R.hmax, 2), "m", "Max head over spillway crest", '<span class="tag' + (over ? " bad" : "") + '">' + (over ? "✕ overtops by " + f(R.hmax - R.hc, 2) + " m" : "✓ " + f(R.hc - R.hmax, 2) + " m below dam crest") + "</span>") +
        tile(f(R.Qcap, 1), "m³/s", "Spillway capacity at dam crest", '<span class="tag' + (R.Qcap < cs.Qin ? " bad" : "") + '">' + (R.Qcap < cs.Qin ? "below" : "above") + " peak inflow (" + f(R.Qcap / cs.Qin * 100, 0) + "%)</span>");
    }
    $("pm-tiles").innerHTML = h;
    $("pm-leg").innerHTML = legendHtml(cs);
    $("pm-svg").innerHTML = chart(cs, LIVE, res);
    $("pm-sum").innerHTML = '<tr><th>Case</th><th class="n">T_p h</th><th class="n">Net rain mm</th><th class="n">Peak in m³/s</th><th class="n">at h</th>' + (state.route ? '<th class="n">Peak out m³/s</th><th class="n">Max head m</th><th>Dam crest</th>' : "") + "</tr>" +
      res.cases.map(function (c, i) {
        var r = c.route;
        return "<tr><td>" + esc(c.name) + (i === res.critical ? ' <span class="tag">critical</span>' : "") + '</td><td class="n">' + f(c.Tp, 2) + '</td><td class="n">' + f(c.totN, 1) + '</td><td class="n">' + f(c.Qin, 1) + '</td><td class="n">' + f(c.tin, 2) + "</td>" +
          (r ? '<td class="n">' + f(r.Qout, 1) + '</td><td class="n">' + f(r.hmax, 3) + "</td><td>" + (r.hmax > r.hc ? '<span class="tag bad">✕ overtops</span>' : '<span class="tag">✓ clear</span>') + "</td>" : "") + "</tr>";
      }).join("");
    $("pm-calc").innerHTML = '<tr><th>Ref</th><th>Item</th><th>Symbol</th><th class="eq">Equation with your numbers</th><th style="text-align:right">Value</th><th>Unit</th></tr>' + cs.rows.map(function (r) {
      if (r.head) return '<tr class="h"><td colspan="6">' + esc(r.head) + "</td></tr>";
      return '<tr><td class="ref">' + esc(r.ref) + "</td><td>" + esc(r.desc) + '</td><td class="mono">' + esc(r.sym) + '</td><td class="eq">' + esc(r.eq) + '</td><td class="v">' + esc(r.val) + "</td><td>" + esc(r.unit) + "</td></tr>";
    }).join("");
  }
  $("pm-case").addEventListener("change", function () { sel = this.value === "" ? null : +this.value; update(); });
  $("pm-cs").addEventListener("toggle", function () { $("pm-cs").querySelector("summary").textContent = $("pm-cs").open ? "Hide the working" : "Show the working"; });
  window.addEventListener("beforeprint", function () { if (!sec.hidden) $("pm-cs").open = true; });

  /* ---------- exports ---------- */
  var DISC = "Indicative screening only. Not a reservoir flood assessment and not an implementation of any named published method. Placeholder inputs are illustrative: real values must come from the governing guidance. A reservoir flood assessment must be carried out by a suitably qualified engineer using that guidance.";
  function stamp() { var d = new Date(); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }
  function msg(t) { $("pm-msg").textContent = t; setTimeout(function () { if ($("pm-msg").textContent === t) $("pm-msg").textContent = ""; }, 4000); }
  function inputRows() {
    var out = [];
    G.forEach(function (g) {
      if (g.cases) return;
      g.f.forEach(function (d) {
        var v = state[d[0]]; if (d[2] === "sel") { var o = d[3].filter(function (x) { return String(x[0]) === String(v); })[0]; v = o ? o[1] : v; }
        out.push([g.t, d[1], v === true ? "yes" : v === false ? "no" : v, d[2] === "sel" || d[2] === "chk" || d[2] === "area" ? "" : d[2], d[7] ? "placeholder" : ""]);
      });
    });
    return out;
  }
  function caseRows() { var lk = state.lossModel === "cn" ? "cn" : "pr"; return state.cases.map(function (c) { return [c.name, c.D, c.P, c.arf, c[lk], c.snow]; }); }
  function caseHead() { return ["Case", "Duration h", "Point depth mm (placeholder)", "ARF (placeholder)", state.lossModel === "cn" ? "CN (placeholder)" : "PR % (placeholder)", "Snowmelt mm/h (placeholder)"]; }
  function sumHead() { return ["Case", "Tp h", "Net rain mm", "Peak inflow m3/s", "Time to peak h", "Direct volume m3", "Total volume m3"].concat(state.route ? ["Peak outflow m3/s", "Time of peak outflow h", "Max head m", "Dam crest above spillway m", "Spillway capacity m3/s"] : []); }
  function sumRow(s) { var a = [s.name, s.Tp, s.R, s.Qin, s.tin, s.Vd, s.Vt]; return state.route ? a.concat([s.Qout, s.tout, s.hmax, s.hc, s.Qcap]) : a; }
  function hydro(c) {
    var rows = [["t h", "Gross input mm", "Net rain mm", "Direct runoff m3/s", "Inflow m3/s"].concat(c.route ? ["Outflow m3/s", "Head over crest m"] : [])];
    c.t.forEach(function (t, i) { rows.push([+t.toFixed(4), i < c.gross.length ? +c.gross[i].toFixed(4) : 0, i < c.net.length ? +c.net[i].toFixed(4) : 0, +c.qd[i].toFixed(4), +c.inflow[i].toFixed(4)].concat(c.route ? [+c.route.Q[i].toFixed(4), +c.route.h[i].toFixed(5)] : [])); });
    return rows;
  }
  function uhRows(c) { return [["t h", "Unit hydrograph m3/s per mm"]].concat(c.uh.map(function (u, i) { return [+(i * c.dt).toFixed(4), +u.toFixed(5)]; })); }
  $("pm-csv").addEventListener("click", function () {
    if (!last || last.error) return;
    var rows = [["PMF rapid screening", stamp()], [DISC], [], ["INPUTS"], ["Group", "Input", "Value", "Unit", "Status"]].concat(inputRows()).concat([[], ["STORM CASES"], caseHead()]).concat(caseRows())
      .concat([[], ["SUMMARY"], sumHead()]).concat(last.summary.map(sumRow));
    last.cases.forEach(function (c) {
      rows = rows.concat([[], ["WORKING: " + c.name], ["Ref", "Item", "Symbol", "Equation with your numbers", "Value", "Unit"]]).concat(c.rows.map(function (r) { return r.head ? [r.head] : [r.ref, r.desc, r.sym, r.eq, r.val, r.unit]; }))
        .concat([[], ["HYDROGRAPH: " + c.name]]).concat(hydro(c));
    });
    X.csv("pmf-screening.csv", rows); msg("Downloaded pmf-screening.csv");
  });
  $("pm-xlsx").addEventListener("click", function () {
    if (!last || last.error) return;
    var b = function (v) { return { v: v, b: true }; }, bold = function (r) { return r.map(b); };
    var sheets = [{ name: "Summary", widths: [30, 10, 12, 14, 12, 16, 16, 14, 14, 12, 14, 14], rows: [[b("PMF rapid screening"), stamp()], [DISC], [], bold(sumHead())].concat(last.summary.map(function (s) { return sumRow(s).map(function (v, i) { return i && typeof v === "number" ? { v: +v.toPrecision(8), fmt: i === 5 || i === 6 ? "#,##0" : "0.000" } : v; }); })) },
      { name: "Inputs", widths: [24, 46, 30, 10, 12], rows: [bold(["Group", "Input", "Value", "Unit", "Status"])].concat(inputRows()).concat([[], bold(caseHead())]).concat(caseRows()) }];
    last.cases.forEach(function (c, i) {
      var nm = "C" + (i + 1) + " ";
      sheets.push({ name: nm + "working", widths: [7, 52, 14, 70, 14, 12], rows: [[b(c.name)], bold(["Ref", "Item", "Symbol", "Equation with your numbers", "Value", "Unit"])].concat(c.rows.map(function (r) { return r.head ? [b(r.head)] : [r.ref, r.desc, r.sym, r.eq, typeof r.raw === "number" && isFinite(r.raw) ? { v: +r.raw.toPrecision(10), fmt: "0.000" } : r.val, r.unit]; })) });
      var hy = hydro(c); hy[0] = bold(hy[0]); var uh = uhRows(c); uh[0] = bold(uh[0]);
      sheets.push({ name: nm + "hydrograph", widths: [10, 14, 12, 16, 14, 14, 16, 4, 10, 18], rows: hy.map(function (r, k) { return r.concat(k < uh.length ? [""].concat(uh[k]) : []); }) });
    });
    X.xlsx("pmf-screening.xlsx", sheets); msg("Downloaded pmf-screening.xlsx");
  });
  function exportSvg() { var holder = document.createElement("div"); holder.innerHTML = chart(shown(), PRINT, last); var s = holder.firstChild; var hit = s.querySelector("#pm-hit"); if (hit) hit.remove(); return s; }
  function legendSvgNote(cs) { return "Blue: inflow" + (cs.route ? ". Red-orange: routed outflow. Dashed: spillway capacity at dam crest" : "") + ". Bars: gross rain (light) and net rain (dark)."; }
  $("pm-png").addEventListener("click", function () {
    if (!shown()) return;
    X.svgToPng(exportSvg(), "pmf-hydrograph.png", 3).then(function () { msg("Downloaded pmf-hydrograph.png"); }, function () { msg("PNG export failed in this browser."); });
  });
  $("pm-pdf").addEventListener("click", function () {
    var cs = shown(); if (!cs) return;
    var svg = new XMLSerializer().serializeToString(exportSvg());
    var sum = "<tr>" + sumHead().map(function (x) { return "<th>" + esc(x) + "</th>"; }).join("") + "</tr>" + last.summary.map(function (s) { return "<tr>" + sumRow(s).map(function (v, i) { return '<td class="' + (i ? "n" : "") + '">' + (typeof v === "number" ? f(v, i === 5 || i === 6 ? 0 : 2) : esc(v)) + "</td>"; }).join("") + "</tr>"; }).join("");
    var calc = cs.rows.map(function (r) { return r.head ? '<tr class="h"><td colspan="6">' + esc(r.head) + "</td></tr>" : "<tr><td>" + esc(r.ref) + "</td><td>" + esc(r.desc) + "</td><td>" + esc(r.sym) + '</td><td class="eq">' + esc(r.eq) + '</td><td class="n">' + esc(r.val) + "</td><td>" + esc(r.unit) + "</td></tr>"; }).join("");
    var warns = last.warn.concat(cs.warn);
    X.printHtml("pmf-screening", '<h1>PMF rapid screening</h1><p class="d">' + esc(stamp()) + " · " + esc(cs.name) + ' · Civil Chartered Path</p><p class="disc">' + esc(DISC) + "</p>" + svg + '<p class="d">' + esc(legendSvgNote(cs)) + "</p>" +
      (warns.length ? '<ul class="w">' + warns.map(function (w) { return "<li>" + esc(w) + "</li>"; }).join("") + "</ul>" : "") +
      "<h2>All cases</h2><table>" + sum + "</table>" +
      '<h2 class="pb">Working: ' + esc(cs.name) + '</h2><table class="calc"><tr><th>Ref</th><th>Item</th><th>Symbol</th><th>Equation with your numbers</th><th>Value</th><th>Unit</th></tr>' + calc + "</table>",
      "@page{size:A4;margin:12mm}h1{font-size:18px;margin:0}h2{font-size:14px;margin:14px 0 6px}.d{color:#5a6677;margin:2px 0 6px}.disc{border:1px solid #b07a06;background:#f7edcf;padding:6px 8px;font-size:11px}.w{font-size:11px;color:#b84a32}svg{width:100%;height:auto;max-height:120mm}table{width:100%;border-collapse:collapse;font-size:10px}td,th{border-top:1px solid #d5dbd9;padding:3px 5px 3px 0;text-align:left;vertical-align:top}.n{text-align:right;font-family:'Courier New',monospace;white-space:nowrap}.eq{font-family:'Courier New',monospace;font-size:9px;color:#5a6677}tr.h td{font-weight:700;border-top:2px solid #0d6b78;padding-top:8px}.pb{page-break-before:always}");
    msg("Opening print. Choose Save as PDF.");
  });

  function syncBody() { document.body.classList.toggle("on-pmf", location.hash.split("?")[0] === "#pmf"); }
  window.addEventListener("hashchange", syncBody); syncBody();

  buildForm(); update();
  window.PMFTool = { state: function () { return state; }, result: function () { return last; } };
})();
