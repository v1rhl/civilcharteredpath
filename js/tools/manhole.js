/* Manhole detail generator.
   Builds a dimensioned section and plan of a manhole from the user's own inputs, with a calculation sheet
   (quantities and geometric checks) that exports to CSV, or XLSX with live formulas.
   Everything is calculated from first principles. Values that would normally come from a standard, a specification
   or a manufacturer are user-editable inputs with a labelled default: the tool does not reproduce or claim
   compliance with any standard. */
(function () {
  "use strict";
  window.CP_TOOLS = (window.CP_TOOLS || []).concat([{ id: "manhole", label: "Manhole detail", blurb: "Section, plan and quantities for a manhole from your levels, pipes and chamber size, with geometric checks. Exports to PDF, PNG, CSV and XLSX." }]);

  var root = document.getElementById("view-manhole");
  if (!root) return;
  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  var KEY = "cp-manhole";

  /* ---------- Inputs ----------
     std: true marks a default the user should set from their governing document or manufacturer's data. */
  var MATS = [["concrete", "Concrete", 1.22], ["clay", "Vitrified clay", 1.18], ["pvc", "PVC-U solid wall", 1.07], ["pe", "PE/PP twin wall", 1.14], ["di", "Ductile iron", 1.1], ["other", "Other", 1.15]];
  function matName(m) { for (var i = 0; i < MATS.length; i++) if (MATS[i][0] === m) return MATS[i][1]; return m; }
  function matFactor(m) { for (var i = 0; i < MATS.length; i++) if (MATS[i][0] === m) return MATS[i][2]; return 1.15; }
  var BEDS = {
    gbed: { l: "Granular bed only", frac: 0, mat: "Granular" },
    ghalf: { l: "Granular bed and sidefill to half the pipe", frac: 0.5, mat: "Granular" },
    gsur: { l: "Granular surround over the crown", frac: 1, mat: "Granular" },
    chaunch: { l: "Concrete bed and haunch to half the pipe", frac: 0.5, mat: "Concrete" },
    csur: { l: "Concrete surround over the crown", frac: 1, mat: "Concrete" }
  };
  var GROUPS = [
    ["drawing", "Drawing"], ["levels", "Cover level and outlet pipe"], ["pipes", "Incoming pipes"], ["chamber", "Chamber"], ["bench", "Benching"],
    ["top", "Cover, frame and slabs"], ["surround", "Concrete surround"], ["bedding", "Pipe bedding"], ["exc", "Excavation"], ["rules", "Checks and access: your project rules"]
  ];
  var INPUTS = [
    { id: "ref", g: "drawing", l: "Manhole reference", t: "txt", d: "S1" },
    { id: "project", g: "drawing", l: "Project or location", t: "txt", d: "Worked example" },
    { id: "cl", g: "levels", l: "Cover level", u: "m", d: 25.000, st: 0.005 },
    { id: "out_il", g: "levels", l: "Outlet invert level", u: "m", d: 22.150, st: 0.005 },
    { id: "out_dn", g: "levels", l: "Outlet nominal bore (DN)", u: "mm", d: 300, st: 25 },
    { id: "out_mat", g: "levels", l: "Outlet material", t: "sel", o: MATS, d: "concrete" },
    { id: "out_od", g: "levels", l: "Outlet outside diameter", u: "mm", d: "", auto: true, std: true, n: "Leave blank to use an indicative ratio for the material. Enter the manufacturer's figure." },
    { id: "shape", g: "chamber", l: "Chamber shape", t: "sel", o: [["circ", "Circular"], ["rect", "Rectangular"]], d: "circ" },
    { id: "d_int", g: "chamber", l: "Internal diameter", u: "mm", d: 1200, st: 50, show: function (s) { return s.shape === "circ"; } },
    { id: "l_int", g: "chamber", l: "Internal length (along the outlet)", u: "mm", d: 1200, st: 50, show: function (s) { return s.shape === "rect"; } },
    { id: "w_int", g: "chamber", l: "Internal width", u: "mm", d: 1000, st: 50, show: function (s) { return s.shape === "rect"; } },
    { id: "t_wall", g: "chamber", l: "Wall thickness", u: "mm", d: 100, st: 5, std: true, n: "From the ring or wall design." },
    { id: "build", g: "chamber", l: "Wall construction", t: "sel", o: [["precast", "Precast rings"], ["insitu", "In-situ concrete"], ["masonry", "Masonry"]], d: "precast" },
    { id: "rings", g: "chamber", l: "Ring heights available", u: "mm", t: "txt", d: "1000, 750, 500, 250", std: true, n: "Comma separated, from your supplier.", show: function (s) { return s.build === "precast"; } },
    { id: "t_base", g: "chamber", l: "Base thickness below outlet invert", u: "mm", d: 225, st: 25, std: true },
    { id: "base_proj", g: "chamber", l: "Base projection beyond wall or surround", u: "mm", d: 150, st: 25 },
    { id: "t_blind", g: "chamber", l: "Blinding thickness", u: "mm", d: 75, st: 25 },
    { id: "bench_r", g: "bench", l: "Benching height at channel edge ÷ outlet DN", u: "×", d: 1.0, st: 0.05, std: true, n: "1.0 puts the channel edge at the outlet soffit." },
    { id: "bench_fall", g: "bench", l: "Benching crossfall, 1 in", u: "", d: 12, st: 1, std: true },
    { id: "bench_min", g: "bench", l: "Minimum benching width each side", u: "mm", d: 150, st: 25, std: true },
    { id: "cover_cls", g: "top", l: "Cover and frame", t: "txt", d: "Loading class to specification", n: "Text for the drawing only." },
    { id: "open_l", g: "top", l: "Clear opening length", u: "mm", d: 600, st: 25, std: true },
    { id: "open_w", g: "top", l: "Clear opening width", u: "mm", d: 600, st: 25, std: true },
    { id: "frame_d", g: "top", l: "Frame depth", u: "mm", d: 150, st: 5, std: true },
    { id: "adj_h", g: "top", l: "Adjustment courses height", u: "mm", d: 150, st: 25, std: true },
    { id: "t_slab", g: "top", l: "Cover slab thickness", u: "mm", d: 150, st: 25, std: true },
    { id: "shaft", g: "top", l: "Reducing slab and access shaft", t: "chk", d: false },
    { id: "shaft_d", g: "top", l: "Shaft internal diameter", u: "mm", d: 900, st: 50, show: function (s) { return s.shaft; } },
    { id: "h_work", g: "top", l: "Headroom from benching to reducing slab", u: "mm", d: 2000, st: 50, std: true, show: function (s) { return s.shaft; } },
    { id: "t_red", g: "top", l: "Reducing slab thickness", u: "mm", d: 200, st: 25, std: true, show: function (s) { return s.shaft; } },
    { id: "sur_on", g: "surround", l: "Concrete surround to the chamber", t: "chk", d: true },
    { id: "sur_t", g: "surround", l: "Surround thickness", u: "mm", d: 150, st: 25, std: true, show: function (s) { return s.sur_on; } },
    { id: "sur_h", g: "surround", l: "Surround height above invert (0 = full height)", u: "mm", d: 0, st: 50, show: function (s) { return s.sur_on; } },
    { id: "sur_grade", g: "surround", l: "Surround concrete", t: "txt", d: "Grade to specification", show: function (s) { return s.sur_on; } },
    { id: "bed_type", g: "bedding", l: "Bedding arrangement", t: "sel", o: Object.keys(BEDS).map(function (k) { return [k, BEDS[k].l]; }), d: "ghalf", n: "Choose what the design specifies. This sets the shape only; thicknesses are below." },
    { id: "bed_below", g: "bedding", l: "Bed thickness under the barrel", u: "mm", d: 100, st: 25, std: true },
    { id: "bed_over", g: "bedding", l: "Cover over the crown (surround types)", u: "mm", d: 150, st: 25, std: true },
    { id: "bed_clear", g: "bedding", l: "Trench clearance each side of the pipe", u: "mm", d: 150, st: 25, std: true },
    { id: "bed_len", g: "bedding", l: "Length of each pipe in the quantities", u: "m", d: 1.0, st: 0.5, n: "Pipe run inside the excavation, or to the first joint." },
    { id: "ws", g: "exc", l: "Working space each side", u: "mm", d: 300, st: 50 },
    { id: "batter", g: "exc", l: "Side batter, horizontal per 1 vertical (0 = supported vertical sides)", u: "", d: 0, st: 0.1 },
    { id: "bulk", g: "exc", l: "Bulking factor for spoil", u: "×", d: 1.25, st: 0.05, std: true },
    { id: "clr_min", g: "rules", l: "Minimum clear gap between pipe openings", u: "mm", d: 150, st: 25, std: true },
    { id: "clr_top", g: "rules", l: "Minimum gap from pipe crown to slab soffit", u: "mm", d: 150, st: 25, std: true },
    { id: "drop_max", g: "rules", l: "Largest drop before a backdrop or ramp", u: "m", d: 0.6, st: 0.05, std: true },
    { id: "deep_thr", g: "rules", l: "Depth that triggers a size and safety review", u: "m", d: 3.0, st: 0.5, std: true },
    { id: "landing_int", g: "rules", l: "Maximum climb between rest platforms", u: "m", d: 6.0, st: 0.5, std: true },
    { id: "headroom_min", g: "rules", l: "Minimum headroom above benching for entry", u: "mm", d: 1800, st: 50, std: true },
    { id: "access", g: "rules", l: "Access", t: "sel", o: [["auto", "Steps, or ladder past the depth below"], ["steps", "Step irons"], ["ladder", "Ladder"], ["none", "None (no entry)"]], d: "auto" },
    { id: "ladder_thr", g: "rules", l: "Depth above which a ladder is used", u: "m", d: 3.0, st: 0.5, std: true, show: function (s) { return s.access === "auto"; } },
    { id: "step_sp", g: "rules", l: "Step spacing", u: "mm", d: 300, st: 25, std: true, show: function (s) { return s.access !== "none"; } },
    { id: "step_top", g: "rules", l: "Top step below cover level", u: "mm", d: 450, st: 25, std: true, show: function (s) { return s.access !== "none"; } },
    { id: "step_bot", g: "rules", l: "Lowest step above benching, at least", u: "mm", d: 300, st: 25, std: true, show: function (s) { return s.access !== "none"; } },
    { id: "acc_ang", g: "rules", l: "Steps or ladder position in plan", u: "°", d: 270, st: 15, n: "Angle anticlockwise from the outlet, like the pipes." }
  ];
  var BYID = {}; INPUTS.forEach(function (d) { BYID[d.id] = d; });
  function defaults() {
    var s = {}; INPUTS.forEach(function (d) { s[d.id] = d.d; });
    s.pipes = [
      { name: "Main", il: 22.225, dn: 225, od: "", mat: "clay", ang: 180 },
      { name: "Branch", il: 22.600, dn: 150, od: "", mat: "pvc", ang: 90 }
    ];
    return s;
  }
  function load() { try { var v = JSON.parse(localStorage.getItem(KEY)); if (v && v.pipes) { var d = defaults(); for (var k in d) if (!(k in v)) v[k] = d[k]; return v; } } catch (e) { /* use defaults */ } return defaults(); }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* storage unavailable */ } }
  var S = load();

  function num(v, d) { var n = parseFloat(v); return isFinite(n) ? n : (d || 0); }
  function od(dn, odv, mat) { var n = parseFloat(odv); return isFinite(n) && n > 0 ? n : Math.round(dn * matFactor(mat) / 5) * 5; }

  /* ---------- Calculation model ----------
     Each row's formula is written once in spreadsheet syntax. The page evaluates it in JavaScript and the XLSX export
     writes it as a live Excel formula, so what you see is what the spreadsheet calculates. */
  var F = {
    PI: function () { return Math.PI; }, MAX: Math.max, MIN: Math.min, SQRT: Math.sqrt, ABS: Math.abs, ACOS: Math.acos,
    IF: function (c, a, b) { return c ? a : b; }, AND: function () { return Array.prototype.every.call(arguments, Boolean); }, OR: function () { return Array.prototype.some.call(arguments, Boolean); },
    ROUNDUP: function (x, n) { var m = Math.pow(10, n); return Math.ceil(x * m - 1e-9) / m; }, ROUNDDOWN: function (x, n) { var m = Math.pow(10, n); return Math.floor(x * m + 1e-9) / m; }
  };
  function translate(expr, onId, onFn, caret) {
    return expr.replace(/("[^"]*")|([A-Za-z_][A-Za-z0-9_]*)(\s*\()?|(\^)/g, function (m, str, id, paren, c) {
      if (str) return str; if (c) return caret; if (paren) return onFn(id) + "("; return onId(id);
    });
  }
  function evalExpr(expr, V) {
    var js = translate(expr, function (id) { if (!(id in V)) throw new Error("Unknown " + id); return "V." + id; }, function (fn) { return "F." + fn; }, "**");
    try { return new Function("V", "F", "return (" + js + ");")(V, F); } catch (e) { return NaN; }
  }

  function buildRows(s) {
    var R = [];
    function sec(t) { R.push({ k: "sec", label: t }); }
    function inp(id, label, unit, v, note) { R.push({ k: "in", id: id, label: label, unit: unit, v: v, note: note }); }
    function txt(id, label, v) { R.push({ k: "txt", id: id, label: label, v: v }); }
    function calc(id, label, unit, f, dp, note) { R.push({ k: "calc", id: id, label: label, unit: unit, f: f, dp: dp, note: note }); }
    function val(id, label, unit, fn, dp, note) { R.push({ k: "val", id: id, label: label, unit: unit, fn: fn, dp: dp, note: note }); }
    function chk(id, label, f, detail, why) { R.push({ k: "chk", id: id, label: label, f: f, detail: detail, why: why }); }
    var circ = s.shape === "circ" ? 1 : 0, sh = s.shaft ? 1 : 0;
    var outOd = od(num(s.out_dn), s.out_od, s.out_mat);

    sec("Inputs");
    txt("ref", "Manhole reference", s.ref); txt("project", "Project or location", s.project);
    inp("circ", "Circular chamber (1) or rectangular (0)", "", circ);
    INPUTS.forEach(function (d) {
      if (d.t === "txt" || d.t === "sel" || d.g === "drawing") return;
      if (d.id === "out_od") { inp("out_od", "Outlet outside diameter", "mm", outOd, s.out_od === "" ? "Indicative ratio for " + matName(s.out_mat) + ": enter manufacturer's figure" : "As entered"); return; }
      var v = d.t === "chk" ? (s[d.id] ? 1 : 0) : num(s[d.id]);
      inp(d.id, d.l, d.u || "", v, d.std ? "Default: set from your governing document or supplier" : "");
    });
    inp("bed_frac", "Bedding height up the pipe ÷ outside diameter", "×", BEDS[s.bed_type].frac, BEDS[s.bed_type].l);
    s.pipes.forEach(function (p, i) {
      var k = "p" + (i + 1), lab = "Pipe " + (i + 1) + (p.name ? " (" + p.name + ")" : "");
      inp(k + "_il", lab + " invert level", "m", num(p.il));
      inp(k + "_dn", lab + " nominal bore", "mm", num(p.dn));
      inp(k + "_od", lab + " outside diameter", "mm", od(num(p.dn), p.od, p.mat), p.od === "" ? "Indicative ratio for " + matName(p.mat) + ": enter manufacturer's figure" : "As entered");
      inp(k + "_ang", lab + " plan angle from the outlet", "°", num(p.ang));
    });

    sec("Chamber geometry");
    calc("lx_int", "Internal size along the outlet", "mm", "IF(circ,d_int,l_int)", 0);
    calc("wy_int", "Internal size across the outlet", "mm", "IF(circ,d_int,w_int)", 0);
    calc("lx_ext", "External size along the outlet", "mm", "lx_int+2*t_wall", 0);
    calc("wy_ext", "External size across the outlet", "mm", "wy_int+2*t_wall", 0);
    calc("a_int", "Internal plan area", "m²", "IF(circ,PI()*d_int^2/4,l_int*w_int)/10^6", 3);
    calc("a_ext", "External plan area", "m²", "IF(circ,PI()*lx_ext^2/4,lx_ext*wy_ext)/10^6", 3);
    calc("sur_eff", "Surround thickness used", "mm", "sur_on*sur_t", 0);
    calc("lx_sur", "Size over the surround", "mm", "lx_ext+2*sur_eff", 0);
    calc("wy_sur", "Width over the surround", "mm", "wy_ext+2*sur_eff", 0);
    calc("a_sur", "Plan area over the surround", "m²", "IF(circ,PI()*lx_sur^2/4,lx_sur*wy_sur)/10^6", 3);
    calc("lx_base", "Base size", "mm", "lx_sur+2*base_proj", 0);
    calc("wy_base", "Base width", "mm", "wy_sur+2*base_proj", 0);
    calc("a_base", "Base plan area", "m²", "IF(circ,PI()*lx_base^2/4,lx_base*wy_base)/10^6", 3);
    calc("a_open", "Clear opening area", "m²", "open_l*open_w/10^6", 3);
    calc("sh_ext", "Shaft external diameter", "mm", "shaft*(shaft_d+2*t_wall)", 0);
    calc("a_sh_int", "Shaft internal area", "m²", "shaft*PI()*shaft_d^2/4/10^6", 3);
    calc("a_sh_ext", "Shaft external area", "m²", "PI()*sh_ext^2/4/10^6", 3);

    sec("Levels");
    calc("out_soffit", "Outlet soffit", "m", "out_il+out_dn/1000", 3);
    calc("bench_top", "Benching level at channel edge", "m", "out_il+bench_r*out_dn/1000", 3);
    calc("bench_w", "Benching width each side of the channel", "mm", "(wy_int-out_dn)/2", 0, "Straight channel on the chamber centreline");
    calc("bench_rise", "Benching rise from channel edge to wall", "mm", "bench_w/bench_fall", 0);
    calc("depth", "Chamber depth, cover level to outlet invert", "m", "cl-out_il", 3);
    calc("slab_top", "Top of cover slab", "m", "cl-(frame_d+adj_h)/1000", 3);
    calc("slab_soffit", "Underside of cover slab", "m", "slab_top-t_slab/1000", 3);
    calc("red_soffit", "Underside of the slab over the chamber", "m", "IF(shaft,bench_top+h_work/1000,slab_soffit)", 3, s.shaft ? "Reducing slab set by your headroom" : "Cover slab");
    calc("red_top", "Top of the slab over the chamber", "m", "IF(shaft,red_soffit+t_red/1000,slab_soffit)", 3);
    calc("ch_h", "Chamber wall height, outlet invert to slab soffit", "m", "red_soffit-out_il", 3, "Walls taken as seated at outlet invert level");
    calc("shaft_h", "Shaft wall height", "m", "IF(shaft,slab_soffit-red_top,0)", 3);
    calc("headroom", "Headroom from benching to slab soffit", "m", "red_soffit-bench_top", 3);
    calc("form", "Underside of base", "m", "out_il-t_base/1000", 3);
    calc("exc_form", "Excavation formation level", "m", "form-t_blind/1000", 3);
    calc("exc_depth", "Excavation depth from cover level", "m", "cl-exc_form", 3, "Ground taken as cover level");

    sec("Excavation");
    calc("ex_lx", "Pit length at formation", "mm", "lx_base+2*ws", 0, "Rectangular pit");
    calc("ex_wy", "Pit width at formation", "mm", "wy_base+2*ws", 0);
    calc("ex_lx_top", "Pit length at ground", "mm", "ex_lx+2*batter*exc_depth*1000", 0);
    calc("ex_wy_top", "Pit width at ground", "mm", "ex_wy+2*batter*exc_depth*1000", 0);
    calc("ex_a_bot", "Pit area at formation", "m²", "ex_lx*ex_wy/10^6", 3);
    calc("ex_a_top", "Pit area at ground", "m²", "ex_lx_top*ex_wy_top/10^6", 3);
    calc("ex_a_mid", "Pit area at mid-depth", "m²", "(ex_lx+ex_lx_top)*(ex_wy+ex_wy_top)/4/10^6", 3);
    calc("v_exc", "Excavation volume (prismoidal)", "m³", "exc_depth/6*(ex_a_bot+4*ex_a_mid+ex_a_top)", 2);
    calc("v_spoil", "Spoil volume after bulking", "m³", "v_exc*bulk", 2);

    sec("Concrete and materials");
    calc("v_blind", "Blinding over the pit floor", "m³", "ex_a_bot*t_blind/1000", 3);
    calc("v_base", "Base slab", "m³", "a_base*t_base/1000", 3);
    calc("v_bench", "Benching inside the chamber, less the channel", "m³", "MAX(a_int*bench_r*out_dn/1000+(a_int-out_dn*lx_int/10^6)*bench_rise/2000-lx_int/1000*(PI()*out_dn^2/8+out_dn*(bench_r*out_dn-out_dn/2))/10^6,0)", 3, "Half-round channel with vertical sides up to the benching");
    calc("sur_ht", "Surround height", "m", "IF(sur_h>0,MIN(sur_h/1000,red_top-out_il),red_top-out_il)", 3);
    calc("v_sur", "Concrete surround", "m³", "sur_on*(a_sur-a_ext)*sur_ht", 3, "Pipe openings not deducted");
    calc("v_walls", "Chamber and shaft walls", "m³", "(a_ext-a_int)*ch_h+(a_sh_ext-a_sh_int)*shaft_h", 3, s.build === "precast" ? "Precast units: for weight and checking" : "");
    calc("v_red", "Reducing slab", "m³", "shaft*(a_ext-a_sh_int)*t_red/1000", 3);
    calc("v_slab", "Cover slab", "m³", "(IF(shaft,a_sh_ext,a_ext)-a_open)*t_slab/1000", 3);
    calc("v_insitu", "In-situ concrete: blinding, base, benching and surround", "m³", "v_blind+v_base+v_bench+v_sur", 2);
    calc("v_struct", "Volume taken up by the structure in the pit", "m³", "v_blind+v_base+a_ext*(red_top-out_il)+a_sh_ext*shaft_h+IF(shaft,a_sh_ext,a_ext)*t_slab/1000+v_sur", 2, "Frame and adjustment zone left as backfill or surfacing");
    calc("v_backfill", "Backfill around the chamber", "m³", "MAX(v_exc-v_struct,0)", 2);

    sec("Pipe bedding (" + BEDS[s.bed_type].mat.toLowerCase() + ")");
    var bedIds = [];
    [["o", "Outlet", "out_od"]].concat(s.pipes.map(function (p, i) { return ["p" + (i + 1), "Pipe " + (i + 1), "p" + (i + 1) + "_od"]; })).forEach(function (q) {
      var k = q[0], o = q[2], h = "MIN(bed_frac," + 1 + ")*" + o, r = o + "/2";
      calc(k + "_bw", q[1] + " trench width", "mm", o + "+2*bed_clear", 0);
      calc(k + "_ba", q[1] + " bedding area per metre", "m²", "(" + k + "_bw*(bed_below+" + h + ")-IF(bed_frac>0," + r + "^2*ACOS((" + r + "-" + h + ")/(" + r + "))-(" + r + "-" + h + ")*SQRT(MAX(2*" + r + "*" + h + "-(" + h + ")^2,0)),0)+IF(bed_frac>=1," + k + "_bw*bed_over,0))/10^6", 3, "Bed + sidefill, less the pipe below that height");
      calc(k + "_bv", q[1] + " bedding volume", "m³", k + "_ba*bed_len", 3);
      bedIds.push(k + "_bv");
    });
    calc("v_bed", "Total bedding, " + BEDS[s.bed_type].mat.toLowerCase(), "m³", bedIds.join("+"), 3);

    sec("Access");
    calc("climb", "Climb from cover level to benching", "m", "cl-bench_top", 3);
    var mode = s.access === "auto" ? null : s.access;
    val("acc_mode", "Access provision", "", function (V) { var m = mode || (V.depth > V.ladder_thr ? "ladder" : "steps"); return { steps: "Step irons", ladder: "Ladder", none: "None" }[m]; }, null, s.access === "auto" ? "Ladder when depth exceeds your threshold" : "As chosen");
    calc("n_steps", "Number of steps or ladder rungs", "no.", "IF(climb*1000>step_top+step_bot,ROUNDDOWN((climb*1000-step_top-step_bot)/step_sp,0)+1,0)", 0);
    calc("n_land", "Rest platforms needed", "no.", "IF(depth>landing_int,ROUNDUP(depth/landing_int,0)-1,0)", 0);
    val("ring_stack", s.build === "precast" ? "Ring stack (from your available heights)" : "Wall height to build", "", function (V) { return ringStack(V.ch_h * 1000 - 0.5, s); }, null);
    if (s.shaft && s.build === "precast") val("shaft_stack", "Shaft ring stack", "", function (V) { return ringStack(V.shaft_h * 1000 - 0.5, s); }, null);

    sec("Geometric checks");
    chk("ck_depth_pos", "Room for the chamber below the cover slab", 'IF(ch_h>0,"OK","FAIL")', function (V) { return "Wall height " + mm(V.ch_h * 1000) + " mm"; }, "The frame, adjustment and slab take up more than the depth to the outlet. Reduce them or deepen the outlet.");
    chk("ck_bench", "Benching width each side", 'IF(bench_w>=bench_min,"OK","CHECK")', function (V) { return mm(V.bench_w) + " mm against your " + mm(V.bench_min) + " mm"; }, "Increase the chamber size or check the benching requirement.");
    var pipeList = [["o", "Outlet", "out"]].concat(s.pipes.map(function (p, i) { return ["p" + (i + 1), "Pipe " + (i + 1) + (p.name ? " " + p.name : ""), "p" + (i + 1)]; }));
    pipeList.forEach(function (q) {
      var k = q[2];
      chk("ck_" + q[0] + "_crown", q[1] + ": crown below the slab", 'IF(' + k + "_il+(" + k + "_dn+" + k + '_od)/2000+clr_top/1000<=red_soffit,"OK","FAIL")', function (V) { return "Gap " + mm((V.red_soffit - V[k + "_il"] - (V[k + "_dn"] + V[k + "_od"]) / 2000) * 1000) + " mm against your " + mm(V.clr_top) + " mm"; }, "The pipe would cut into the slab. Lower the pipe, raise the slab or add a shaft.");
      chk("ck_" + q[0] + "_fit", q[1] + ": opening fits the wall", 'IF(' + k + '_od+2*clr_min<=MIN(lx_int,wy_int),"OK","FAIL")', function (V) { return mm(V[k + "_od"]) + " mm OD in a " + mm(Math.min(V.lx_int, V.wy_int)) + " mm chamber"; }, "Use a larger chamber for this pipe.");
    });
    s.pipes.forEach(function (p, i) {
      var k = "p" + (i + 1), lab = "Pipe " + (i + 1) + (p.name ? " " + p.name : "");
      chk("ck_" + k + "_back", lab + ": invert not below the outlet", 'IF(' + k + '_il>=out_il,"OK","FAIL")', function (V) { return "IL " + lv(V[k + "_il"]) + " against outlet " + lv(V.out_il); }, "The pipe would fall backwards into the chamber. Re-check levels.");
      chk("ck_" + k + "_soffit", lab + ": soffit not below the outlet soffit", 'IF(' + k + "_il+" + k + '_dn/1000>=out_soffit-0.0005,"OK","CHECK")', function (V) { return "Soffit " + lv(V[k + "_il"] + V[k + "_dn"] / 1000) + " against " + lv(V.out_soffit); }, "Incoming pipe soffit below the outlet soffit can surcharge the incoming pipe. Check against your design rules.");
      chk("ck_" + k + "_drop", lab + ": drop to the outlet invert", 'IF(' + k + '_il-out_il>drop_max,"CHECK","OK")', function (V) { return "Drop " + mm((V[k + "_il"] - V.out_il) * 1000) + " mm against your " + mm(V.drop_max * 1000) + " mm"; }, "Consider a backdrop or ramp to your specification.");
      chk("ck_" + k + "_land", lab + ": discharges at or below benching", 'IF(' + k + '_il<=bench_top+0.0005,"OK","CHECK")', function (V) { return "IL " + lv(V[k + "_il"]) + " against benching " + lv(V.bench_top); }, "The pipe enters above the benching, so flow drops onto it. Consider a ramp or raising the benching locally.");
    });
    chk("ck_open", "Access opening fits inside the chamber or shaft", 'IF(OR(circ,shaft),IF(SQRT(open_l^2+open_w^2)<=IF(shaft,shaft_d,d_int),"OK","FAIL"),IF(AND(open_l<=l_int,open_w<=w_int),"OK","FAIL"))', function (V) { return "Opening " + mm(V.open_l) + " × " + mm(V.open_w) + " mm"; }, "The opening is larger than the space below it.");
    if (s.shaft) chk("ck_shaft_h", "Depth for the reducing slab and shaft", 'IF(shaft_h>=0,"OK","FAIL")', function (V) { return "Shaft height " + mm(V.shaft_h * 1000) + " mm"; }, "The reducing slab would be above the cover slab. Reduce the headroom or drop the shaft.");
    if (s.shaft) chk("ck_shaft", "Shaft sits on the reducing slab", 'IF(sh_ext<=MIN(lx_int,wy_int),"OK","FAIL")', function (V) { return "Shaft " + mm(V.sh_ext) + " mm external on a " + mm(Math.min(V.lx_int, V.wy_int)) + " mm chamber"; }, "The shaft is wider than the chamber opening it sits over.");
    chk("ck_headroom", "Headroom above benching", 'IF(headroom*1000>=headroom_min,"OK","CHECK")', function (V) { return mm(V.headroom * 1000) + " mm against your " + mm(V.headroom_min) + " mm"; }, "Below your entry headroom. Check the access arrangement (for example a shallower, non-entry chamber).");
    chk("ck_deep", "Depth against your review threshold", 'IF(depth>deep_thr,"CHECK","OK")', function (V) { return lv(V.depth) + " m against your " + V.deep_thr + " m"; }, "Review chamber size, rest platforms, the access method and confined-space provisions against your governing documents.");
    chk("ck_land", "Rest platforms", 'IF(n_land>0,"CHECK","OK")', function (V) { return V.n_land + " needed at your " + V.landing_int + " m interval"; }, "Rest platforms are not drawn. Add them to the detail.");
    if (s.sur_on) chk("ck_sur", "Surround reaches above the highest pipe", 'IF(sur_ht>=MAX(' + pipeList.map(function (q) { return q[2] + "_il+" + q[2] + "_od/1000"; }).join(",") + ')-out_il,"OK","CHECK")', function (V) { return "Surround to " + lv(V.out_il + V.sur_ht); }, "Some pipe connections are above the surround. Check this is intended.");
    R.push({ k: "pairs" });
    return R;
  }
  function mm(x) { return isFinite(x) ? Math.round(x).toLocaleString("en-GB") : "–"; }
  function lv(x) { return isFinite(x) ? x.toFixed(3) : "–"; }

  function ringStack(h, s) {
    if (!(h > 0)) return "None";
    if (s.build !== "precast") return mm(h) + " mm " + (s.build === "masonry" ? "masonry" : "in-situ");
    var hs = String(s.rings).split(/[,\s]+/).map(Number).filter(function (x) { return x > 0; }).sort(function (a, b) { return b - a; });
    if (!hs.length) return "No ring heights entered";
    var left = h, parts = [];
    hs.forEach(function (r) { var n = Math.floor((left + 0.5) / r); if (n > 0) { parts.push(n + " × " + r); left -= n * r; } });
    left = Math.round(left);
    return (parts.join(" + ") || "none") + (left > 0 ? " + " + left + " mm make-up" : "");
  }

  /* Openings around the inside face, in plan. Angle 0 is the outlet; angles run anticlockwise. */
  function openings(V, s) {
    var list = [{ k: "out", name: "Outlet", ang: 0 }].concat(s.pipes.map(function (p, i) { return { k: "p" + (i + 1), name: "Pipe " + (i + 1), ang: num(p.ang) }; }));
    var a = V.lx_int / 2, b = V.wy_int / 2;
    list.forEach(function (o) {
      o.il = V[o.k + "_il"]; o.dn = V[o.k + "_dn"]; o.od = V[o.k + "_od"];
      o.lo = o.il - (o.od - o.dn) / 2000; o.hi = o.il + (o.dn + o.od) / 2000;
      var t = o.ang * Math.PI / 180, c = Math.cos(t), sn = Math.sin(t);
      if (s.shape === "circ") { o.x = a * c; o.y = a * sn; o.s = a * (((t % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)); }
      else {
        var r = Math.min(Math.abs(c) > 1e-9 ? a / Math.abs(c) : 1e12, Math.abs(sn) > 1e-9 ? b / Math.abs(sn) : 1e12);
        o.x = r * c; o.y = r * sn;
        if (Math.abs(o.x - a) < 1e-6) o.s = o.y + b; else if (Math.abs(o.y - b) < 1e-6) o.s = 2 * b + (a - o.x);
        else if (Math.abs(o.x + a) < 1e-6) o.s = 2 * b + 2 * a + (b - o.y); else o.s = 4 * b + 2 * a + (o.x + a);
      }
    });
    var P = s.shape === "circ" ? 2 * Math.PI * a : 4 * (a + b), pairs = [];
    for (var i = 0; i < list.length; i++) for (var j = i + 1; j < list.length; j++) {
      var p = list[i], q = list[j], d = Math.abs(p.s - q.s); d = Math.min(d, P - d);
      var gap = d - (p.od + q.od) / 2, over = p.lo < q.hi + V.clr_min / 1000 && q.lo < p.hi + V.clr_min / 1000;
      pairs.push({ a: p, b: q, gap: gap, over: over, ok: !over || gap >= V.clr_min });
    }
    return { list: list, pairs: pairs };
  }

  function evaluate(s) {
    var R = buildRows(s), V = {};
    R.forEach(function (r) {
      if (r.k === "in") V[r.id] = r.v;
      else if (r.k === "calc") { r.v = evalExpr(r.f, V); V[r.id] = r.v; }
    });
    R.forEach(function (r) {
      if (r.k === "val") { r.v = r.fn(V); V[r.id] = r.v; }
      else if (r.k === "chk") { r.v = evalExpr(r.f, V); r.d = r.detail(V); }
    });
    var op = openings(V, s);
    return { R: R, V: V, op: op };
  }

  /* ---------- Form ---------- */
  function fieldHtml(d) {
    var v = S[d.id], id = "mh-" + d.id, std = d.std ? ' <span class="mh-std" title="Default value: set it from your governing document or supplier">default</span>' : "";
    var note = d.n ? '<span class="small">' + esc(d.n) + "</span>" : "";
    if (d.t === "chk") return '<label class="mh-chk"><input type="checkbox" id="' + id + '" data-k="' + d.id + '"' + (v ? " checked" : "") + "> " + esc(d.l) + "</label>";
    var ctl;
    if (d.t === "sel") ctl = '<select id="' + id + '" data-k="' + d.id + '">' + d.o.map(function (o) { return '<option value="' + o[0] + '"' + (o[0] === v ? " selected" : "") + ">" + esc(o[1]) + "</option>"; }).join("") + "</select>";
    else if (d.t === "txt") ctl = '<input type="text" id="' + id + '" data-k="' + d.id + '" value="' + esc(v) + '">';
    else ctl = '<input type="number" inputmode="decimal" id="' + id + '" data-k="' + d.id + '" value="' + esc(v) + '" step="' + (d.st || "any") + '"' + (d.auto ? ' placeholder="auto"' : "") + ">";
    return '<div class="field" data-f="' + d.id + '"><label for="' + id + '">' + esc(d.l) + (d.u ? ' <span class="mh-u">' + esc(d.u) + "</span>" : "") + std + "</label>" + ctl + note + "</div>";
  }
  function pipeRows() {
    return S.pipes.map(function (p, i) {
      function f(k, lab, type, extra) { return '<label><span>' + lab + '</span><input type="' + type + '" data-p="' + i + '" data-pk="' + k + '" value="' + esc(p[k]) + '"' + (extra || "") + "></label>"; }
      return '<fieldset class="mh-pipe"><legend>Pipe ' + (i + 1) + '</legend>' +
        f("name", "Name", "text") + f("il", "Invert level (m)", "number", ' step="0.005"') + f("dn", "DN (mm)", "number", ' step="25"') +
        f("od", "OD (mm)", "number", ' placeholder="auto"') +
        '<label><span>Material</span><select data-p="' + i + '" data-pk="mat">' + MATS.map(function (m) { return '<option value="' + m[0] + '"' + (m[0] === p.mat ? " selected" : "") + ">" + m[1] + "</option>"; }).join("") + "</select></label>" +
        f("ang", "Plan angle (°)", "number", ' step="15"') +
        '<button type="button" class="mh-x" data-del="' + i + '" aria-label="Remove pipe ' + (i + 1) + '">Remove</button></fieldset>';
    }).join("") + '<p class="small">Angle is measured anticlockwise in plan from the outlet: 180° is straight through, 90° enters from the left of the flow.</p><button type="button" class="btn ghost" id="mh-add">Add incoming pipe</button>';
  }
  function renderForm() {
    $("mh-form").innerHTML = GROUPS.map(function (g, gi) {
      var body = g[0] === "pipes" ? '<div id="mh-pipes">' + pipeRows() + "</div>" : INPUTS.filter(function (d) { return d.g === g[0]; }).map(fieldHtml).join("");
      return '<details class="mh-group"' + (gi < 4 ? " open" : "") + "><summary>" + esc(g[1]) + "</summary><div class=\"mh-fields\">" + body + "</div></details>";
    }).join("") + '<button type="button" class="btn ghost" id="mh-reset">Reset to the worked example</button>';
    applyShow();
  }
  function applyShow() { INPUTS.forEach(function (d) { if (!d.show) return; var el = root.querySelector('[data-f="' + d.id + '"]'); if (el) el.hidden = !d.show(S); }); }

  var timer = null;
  function changed(rerenderPipes) { save(); applyShow(); if (rerenderPipes) $("mh-pipes").innerHTML = pipeRows(); clearTimeout(timer); timer = setTimeout(update, 60); }
  $("mh-form").addEventListener("input", function (e) {
    var t = e.target;
    if (t.dataset.k) { var d = BYID[t.dataset.k]; S[d.id] = d.t === "chk" ? t.checked : (d.t === "num" || !d.t) ? (t.value === "" && d.auto ? "" : t.value === "" ? "" : parseFloat(t.value)) : t.value; changed(); }
    else if (t.dataset.pk) { var p = S.pipes[+t.dataset.p], k = t.dataset.pk; p[k] = (k === "name" || k === "mat") ? t.value : (t.value === "" ? "" : parseFloat(t.value)); changed(); }
  });
  $("mh-form").addEventListener("change", function (e) { if (e.target.dataset.k || e.target.dataset.pk) $("mh-form").dispatchEvent(new Event("input", { bubbles: true })); });
  $("mh-form").addEventListener("click", function (e) {
    var t = e.target;
    if (t.id === "mh-add") { var last = S.pipes[S.pipes.length - 1]; S.pipes.push({ name: "", il: last ? last.il : num(S.out_il) + 0.05, dn: 150, od: "", mat: "pvc", ang: S.pipes.length % 2 ? 270 : 135 }); changed(true); }
    else if (t.dataset.del != null) { S.pipes.splice(+t.dataset.del, 1); changed(true); }
    else if (t.id === "mh-reset") { S = defaults(); save(); renderForm(); update(); }
  });
  $("mh-form").addEventListener("submit", function (e) { e.preventDefault(); });

  /* ---------- Drawing ----------
     One A3 landscape sheet in paper millimetres: section A-A on the left, plan top right, channel detail and
     title block bottom right. Black on white so it prints and exports the same in either theme. */
  var SCALES = [5, 10, 20, 25, 50, 100, 200];
  function niceScale(need) { for (var i = 0; i < SCALES.length; i++) if (1 / SCALES[i] <= need) return SCALES[i]; return 500; }
  function f1(x) { return Math.round(x * 100) / 100; }
  var INK = "#111", MUTE = "#555", RED = "#b3261e";
  var DEFS = '<defs>' +
    '<pattern id="mhc" patternUnits="userSpaceOnUse" width="5" height="5"><rect width="5" height="5" fill="#f1f1ee"/><circle cx="1" cy="1.2" r="0.28" fill="#555"/><circle cx="3.4" cy="3.1" r="0.22" fill="#555"/><path d="M2.6 0.8l0.7 0.9h-1.3z M0.8 3.6l0.6 0.8h-1.1z" fill="none" stroke="#555" stroke-width="0.15"/></pattern>' +
    '<pattern id="mhp" patternUnits="userSpaceOnUse" width="2" height="2" patternTransform="rotate(45)"><rect width="2" height="2" fill="#fff"/><path d="M0 0V2" stroke="#444" stroke-width="0.18"/></pattern>' +
    '<pattern id="mhg" patternUnits="userSpaceOnUse" width="3" height="3"><rect width="3" height="3" fill="#fbf8f0"/><circle cx="0.8" cy="0.8" r="0.45" fill="none" stroke="#777" stroke-width="0.15"/><circle cx="2.3" cy="2.1" r="0.35" fill="none" stroke="#777" stroke-width="0.15"/></pattern>' +
    '<pattern id="mhs" patternUnits="userSpaceOnUse" width="3" height="3" patternTransform="rotate(45)"><path d="M0 0V3" stroke="#999" stroke-width="0.15"/></pattern>' +
    '<pattern id="mhb" patternUnits="userSpaceOnUse" width="3" height="1.6"><rect width="3" height="1.6" fill="#fff"/><path d="M0 0.8H3M1.5 0V0.8M0 0.8V1.6" stroke="#666" stroke-width="0.15"/></pattern>' +
    '<marker id="mha" viewBox="0 0 6 6" refX="5.5" refY="3" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0L6 3L0 6z" fill="#111"/></marker>' +
    '<marker id="mht" viewBox="0 0 6 6" refX="3" refY="3" markerWidth="4" markerHeight="4" orient="auto"><path d="M1 5L5 1" stroke="#111" stroke-width="1"/></marker>' +
    "</defs>";

  function drawing(E) {
    var V = E.V, s = S, op = E.op, out = [];
    var layers = { hatch: [], outline: [], hidden: [], dims: [], text: [] };
    function L(name, str) { layers[name].push(str); }
    function rect(layer, x, y, w, h, fill, extra) { if (w < 0) { x += w; w = -w; } if (h < 0) { y += h; h = -h; } L(layer, '<rect x="' + f1(x) + '" y="' + f1(y) + '" width="' + f1(w) + '" height="' + f1(h) + '" fill="' + (fill || "none") + '"' + (extra || ' stroke="' + INK + '" stroke-width="0.35"') + "/>"); }
    function line(layer, x1, y1, x2, y2, extra) { L(layer, '<path d="M' + f1(x1) + " " + f1(y1) + "L" + f1(x2) + " " + f1(y2) + '"' + (extra || ' stroke="' + INK + '" stroke-width="0.35"') + "/>"); }
    function text(x, y, str, size, anchor, extra) { L("text", '<text x="' + f1(x) + '" y="' + f1(y) + '" font-size="' + (size || 2.2) + '" text-anchor="' + (anchor || "start") + '"' + (extra || "") + ">" + esc(str) + "</text>"); }
    function leader(x1, y1, x2, y2, str, anchor) { if (anchor === "end") x2 = Math.max(x2, 13 + String(str).length * 1.05); else x2 = Math.min(x2, 409 - String(str).length * 1.05); L("dims", '<path d="M' + f1(x1) + " " + f1(y1) + "L" + f1(x2) + " " + f1(y2) + '" stroke="' + INK + '" stroke-width="0.18" fill="none" marker-start="url(#mha)"/>'); text(x2 + (anchor === "end" ? -0.8 : 0.8), y2 + 0.8, str, 2.1, anchor || "start"); }
    var narrow = 0;
    function hdim(x1, x2, y, str, below) { if (Math.abs(x2 - x1) < 0.3) return; if (Math.abs(x2 - x1) < String(str).length * 1.1 + 1) { y += 0; var ty = y + 3 + (narrow++) * 2.6; L("dims", '<path d="M' + f1(x1) + " " + f1(y) + "H" + f1(x2) + '" stroke="' + INK + '" stroke-width="0.18" marker-start="url(#mht)" marker-end="url(#mht)"/><path d="M' + f1(x1) + " " + f1(y - 1.5) + "v3M" + f1(x2) + " " + f1(y - 1.5) + 'v3M' + f1((x1 + x2) / 2) + " " + f1(y) + "V" + f1(ty - 1.8) + '" stroke="' + INK + '" stroke-width="0.12"/>'); text((x1 + x2) / 2, ty, str, 1.9, "middle"); return; } L("dims", '<path d="M' + f1(x1) + " " + f1(y) + "H" + f1(x2) + '" stroke="' + INK + '" stroke-width="0.18" marker-start="url(#mht)" marker-end="url(#mht)"/><path d="M' + f1(x1) + " " + f1(y - 1.5) + "v3M" + f1(x2) + " " + f1(y - 1.5) + 'v3" stroke="' + INK + '" stroke-width="0.18"/>'); text((x1 + x2) / 2, y + (below ? 3 : -0.8), str, 2, "middle"); }
    function vdim(x, y1, y2, str, left) { if (Math.abs(y2 - y1) < 0.3) return; L("dims", '<path d="M' + f1(x) + " " + f1(y1) + "V" + f1(y2) + '" stroke="' + INK + '" stroke-width="0.18" marker-start="url(#mht)" marker-end="url(#mht)"/><path d="M' + f1(x - 1.5) + " " + f1(y1) + "h3M" + f1(x - 1.5) + " " + f1(y2) + 'h3" stroke="' + INK + '" stroke-width="0.18"/>'); L("text", '<text font-size="2" text-anchor="middle" transform="translate(' + f1(x + (left ? -0.9 : 2.3)) + " " + f1((y1 + y2) / 2) + ') rotate(-90)">' + esc(str) + "</text>"); }
    function level(x, y, str, left) { L("dims", '<path d="M' + f1(x) + " " + f1(y) + "l-1.2 -1.6h2.4z" + '" fill="none" stroke="' + INK + '" stroke-width="0.2"/><path d="M' + f1(x - 3) + " " + f1(y) + "H" + f1(x + (left ? -9 : 9)) + '" stroke="' + INK + '" stroke-width="0.18"/>'); text(x + (left ? -1.5 : 1.5), y - 2, str, 2, left ? "end" : "start"); }

    /* --- Section A-A --- */
    var halfW = Math.max(V.ex_lx_top / 2, V.lx_base / 2 + 900), z0 = V.exc_form - 0.25, z1 = V.cl + 0.25;
    var secBox = { x: 14, y: 22, w: 236, h: 232 };
    var sc = niceScale(Math.min(secBox.w / (2 * halfW + 900), secBox.h / ((z1 - z0) * 1000)));
    var k = 1 / sc, cx = secBox.x + secBox.w / 2 + 8, top = secBox.y + 10 + Math.max(0, (secBox.h - 34 - (z1 - z0) * 1000 * k) / 2);
    function X(x) { return cx + x * k; } function Y(z) { return top + (z1 - z) * 1000 * k; }
    var wallIn = V.lx_int / 2, wallOut = V.lx_ext / 2, surOut = V.lx_sur / 2, baseOut = V.lx_base / 2;
    // ground and excavation
    var exB = V.ex_lx / 2, exT = V.ex_lx_top / 2;
    rect("hatch", X(-halfW - 300), Y(V.cl), (halfW + 300 - exT) * k, 6, "url(#mhs)", ' stroke="none"');
    rect("hatch", X(exT), Y(V.cl), (halfW + 300 - exT) * k, 6, "url(#mhs)", ' stroke="none"');
    line("outline", X(-halfW - 300), Y(V.cl), X(-exT), Y(V.cl)); line("outline", X(exT), Y(V.cl), X(halfW + 300), Y(V.cl));
    L("hidden", '<path d="M' + f1(X(-exT)) + " " + f1(Y(V.cl)) + "L" + f1(X(-exB)) + " " + f1(Y(V.exc_form)) + "H" + f1(X(exB)) + "L" + f1(X(exT)) + " " + f1(Y(V.cl)) + '" fill="none" stroke="' + MUTE + '" stroke-width="0.3" stroke-dasharray="2 1"/>');
    // blinding and base
    rect("hatch", X(-exB), Y(V.form), 2 * exB * k, V.t_blind * k, "url(#mhc)", ' stroke="' + INK + '" stroke-width="0.25" opacity="0.8"');
    rect("hatch", X(-baseOut), Y(V.out_il), 2 * baseOut * k, V.t_base * k, "url(#mhc)");
    // surround
    if (s.sur_on) { [-1, 1].forEach(function (sg) { rect("hatch", X(sg > 0 ? wallOut : -surOut), Y(V.out_il + V.sur_ht), (surOut - wallOut) * k, V.sur_ht * 1000 * k, "url(#mhc)"); }); }
    // benching beyond the cut
    var bW = (V.wy_int - V.out_dn) / 2;
    L("hatch", '<path d="M' + f1(X(-wallIn)) + " " + f1(Y(V.out_il)) + "V" + f1(Y(V.bench_top + V.bench_rise / 1000)) + "H" + f1(X(wallIn)) + "V" + f1(Y(V.out_il)) + 'z" fill="url(#mhc)" opacity="0.45" stroke="none"/>');
    line("outline", X(-wallIn), Y(V.bench_top + V.bench_rise / 1000), X(wallIn), Y(V.bench_top + V.bench_rise / 1000), ' stroke="' + INK + '" stroke-width="0.2"');
    line("outline", X(-wallIn), Y(V.bench_top), X(wallIn), Y(V.bench_top), ' stroke="' + MUTE + '" stroke-width="0.2" stroke-dasharray="1.2 0.8"');
    line("outline", X(-wallIn), Y(V.out_il), X(wallIn), Y(V.out_il), ' stroke="' + INK + '" stroke-width="0.5"');
    // walls and ring joints
    var wallFill = s.build === "masonry" ? "url(#mhb)" : s.build === "precast" ? "url(#mhp)" : "url(#mhc)";
    [-1, 1].forEach(function (sg) { rect("hatch", X(sg > 0 ? wallIn : -wallOut), Y(V.red_soffit), (wallOut - wallIn) * k, V.ch_h * 1000 * k, wallFill); });
    if (s.build === "precast") {
      var hs = String(s.rings).split(/[,\s]+/).map(Number).filter(function (x) { return x > 0; }).sort(function (a, b) { return b - a; }), z = V.out_il, left = V.ch_h * 1000;
      hs.forEach(function (r) { while (left + 0.5 >= r) { z += r / 1000; left -= r; if (z < V.red_soffit - 0.001) [-1, 1].forEach(function (sg) { line("outline", X(sg * wallIn), Y(z), X(sg * wallOut), Y(z), ' stroke="' + INK + '" stroke-width="0.5"'); }); } });
    }
    // slabs and shaft
    var slabHalf = s.shaft ? V.sh_ext / 2 : wallOut, openHalf = s.open_l / 2;
    if (s.shaft) {
      var shIn = s.shaft_d / 2;
      [-1, 1].forEach(function (sg) {
        rect("hatch", X(sg > 0 ? shIn : -wallOut), Y(V.red_top), (wallOut - shIn) * k, s.t_red * k, "url(#mhc)");
        rect("hatch", X(sg > 0 ? shIn : -V.sh_ext / 2), Y(V.slab_soffit), (V.sh_ext / 2 - shIn) * k, V.shaft_h * 1000 * k, wallFill);
      });
    }
    [-1, 1].forEach(function (sg) { rect("hatch", X(sg > 0 ? openHalf : -slabHalf), Y(V.slab_top), (slabHalf - openHalf) * k, s.t_slab * k, "url(#mhc)"); });
    // adjustment courses and frame
    var adjW = 110;
    [-1, 1].forEach(function (sg) {
      rect("hatch", X(sg > 0 ? openHalf : -openHalf - adjW), Y(V.cl - s.frame_d / 1000), adjW * k, s.adj_h * k, "url(#mhb)");
      L("outline", '<path d="M' + f1(X(sg * openHalf)) + " " + f1(Y(V.cl)) + "V" + f1(Y(V.cl - s.frame_d / 1000)) + "H" + f1(X(sg * (openHalf + adjW + 40))) + "V" + f1(Y(V.cl - s.frame_d / 1000 + 0.012)) + "H" + f1(X(sg * (openHalf + 12))) + "V" + f1(Y(V.cl)) + '" fill="#bbb" stroke="' + INK + '" stroke-width="0.3"/>');
    });
    rect("outline", X(-openHalf), Y(V.cl), 2 * openHalf * k, Math.max(0.8, 40 * k), "#888");
    // pipes through the section, plus openings seen on the far wall
    function pipeStub(o, dir) {
      var xa = dir > 0 ? (s.shape === "circ" ? wallIn : wallIn) : -wallIn, xb = dir * (exB + 500);
      var t = (o.od - o.dn) / 2, h = Math.min(BEDS[s.bed_type].frac, 1) * o.od;
      var bedTop = o.il - t / 1000 + (h + (BEDS[s.bed_type].frac >= 1 ? s.bed_over : 0)) / 1000, bedBot = o.il - t / 1000 - s.bed_below / 1000;
      var xs = dir > 0 ? surOut : -surOut;
      rect("hatch", X(Math.min(xs, xb)), Y(bedTop), Math.abs(xb - xs) * k, (bedTop - bedBot) * 1000 * k, BEDS[s.bed_type].mat === "Concrete" ? "url(#mhc)" : "url(#mhg)", ' stroke="' + MUTE + '" stroke-width="0.2"');
      rect("outline", X(Math.min(xa, xb)), Y(o.hi), Math.abs(xb - xa) * k, (o.hi - o.lo) * 1000 * k, "#fff");
      line("outline", X(xa), Y(o.il), X(xb), Y(o.il), ' stroke="' + INK + '" stroke-width="0.25"');
      line("outline", X(xa), Y(o.il + o.dn / 1000), X(xb), Y(o.il + o.dn / 1000), ' stroke="' + INK + '" stroke-width="0.25"');
      L("outline", '<path d="M' + f1(X(xb)) + " " + f1(Y(o.hi) - 1) + "l1.2 " + f1((o.hi - o.lo) * 1000 * k / 2 + 1) + "l-1.2 " + f1((o.hi - o.lo) * 1000 * k / 2 + 1) + '" fill="none" stroke="' + INK + '" stroke-width="0.25"/>');
    }
    op.list.forEach(function (o) {
      var t = o.ang * Math.PI / 180, c = Math.cos(t), sn = Math.sin(t);
      if (o.k === "out") pipeStub(o, 1);
      else if (c < -0.7) pipeStub(o, -1);
      else {
        var r = o.od / 2 * k, rr = o.dn / 2 * k, px = X(o.x), py = Y(o.il + o.dn / 2000);
        var dash = sn > 0 ? "" : ' stroke-dasharray="1.2 0.8"';
        L(sn > 0 ? "outline" : "hidden", '<circle cx="' + f1(px) + '" cy="' + f1(py) + '" r="' + f1(r) + '" fill="#fff" stroke="' + INK + '" stroke-width="0.3"' + dash + '/><circle cx="' + f1(px) + '" cy="' + f1(py) + '" r="' + f1(rr) + '" fill="none" stroke="' + INK + '" stroke-width="0.2"' + dash + "/>");
      }
    });
    // access: steps or ladder drawn on the left inner wall (rotated into the section)
    var mode = E.R.filter(function (r) { return r.id === "acc_mode"; })[0].v;
    if (mode !== "None" && V.n_steps > 0) {
      for (var i = 0; i < V.n_steps; i++) {
        var zs = V.cl - (s.step_top + i * s.step_sp) / 1000;
        var xw = zs > V.red_top && s.shaft ? -s.shaft_d / 2 : -wallIn;
        if (mode === "Ladder") line("outline", X(xw + 150), Y(zs), X(xw + 150 + 400), Y(zs), ' stroke="' + INK + '" stroke-width="0.3"');
        else L("outline", '<path d="M' + f1(X(xw)) + " " + f1(Y(zs)) + "h" + f1(Math.max(1, 120 * k)) + "v" + f1(Math.max(0.6, 25 * k)) + '" fill="none" stroke="' + INK + '" stroke-width="0.35"/>');
      }
      if (mode === "Ladder") { var zt = V.cl - s.step_top / 1000, zb = V.cl - (s.step_top + (V.n_steps - 1) * s.step_sp) / 1000; [150, 550].forEach(function (dx) { var xw2 = s.shaft ? -s.shaft_d / 2 : -wallIn; line("outline", X(xw2 + dx), Y(zt + 0.3), X(xw2 + dx), Y(zb - 0.1), ' stroke="' + INK + '" stroke-width="0.35"'); }); }
    }
    // dimensions and levels
    var xr = X(Math.max(exT, exB + 500)) + 4, xl = X(-Math.max(exT, exB + 500)) - 4;
    level(xr + 18, Y(V.cl), "CL " + lv(V.cl));
    level(xr + 18, Y(V.slab_top), "Slab " + lv(V.slab_top));
    if (s.shaft) level(xr + 18, Y(V.red_top), "Red. slab " + lv(V.red_top));
    level(xr + 18, Y(V.bench_top), "Benching " + lv(V.bench_top));
    level(xr + 18, Y(V.out_il), "Outlet IL " + lv(V.out_il));
    level(xr + 18, Y(V.exc_form), "Formation " + lv(V.exc_form));
    vdim(xr + 6, Y(V.cl), Y(V.out_il), "Depth " + mm(V.depth * 1000));
    vdim(xr, Y(V.red_soffit), Y(V.out_il), mm(V.ch_h * 1000));
    vdim(xr, Y(V.out_il), Y(V.form), mm(s.t_base));
    var lastY = -99; op.list.filter(function (o) { return o.k !== "out"; }).sort(function (a, b) { return b.il - a.il; }).forEach(function (o) { var y = Math.max(Y(o.il), lastY + 3.2); lastY = y; level(xl - 6, y, "P" + o.k.slice(1) + " IL " + lv(o.il), true); });
    var yb = Y(V.exc_form) + 7;
    hdim(X(-wallIn), X(wallIn), yb, (s.shape === "circ" ? "Ø" : "") + mm(V.lx_int) + " internal", true);
    hdim(X(wallIn), X(wallOut), yb + 6, mm(s.t_wall), true);
    if (s.sur_on) hdim(X(wallOut), X(surOut), yb + 6, mm(s.sur_t), true);
    hdim(X(surOut), X(baseOut), yb + 6, mm(s.base_proj), true);
    hdim(X(baseOut), X(exB), yb + 6, mm(s.ws) + " ws", true);
    // labels
    var lx = X(-exT) - 4;
    leader(X(-openHalf - 50), Y(V.cl) + 0.6, lx - 22, Y(V.cl) - 9, "Cover and frame: " + s.cover_cls, "end");
    leader(X(-openHalf - adjW / 2), Y(V.cl - (s.frame_d + s.adj_h / 2) / 1000), lx - 22, Y(V.cl) - 4, "Adjustment courses " + mm(s.adj_h), "end");
    leader(X(-slabHalf + 60), Y(V.slab_top - s.t_slab / 2000), lx - 22, Y(V.cl) + 1, "Cover slab " + mm(s.t_slab), "end");
    var midWall = (V.out_il + V.red_soffit) / 2;
    leader(X(-(wallIn + wallOut) / 2), Y(midWall + 0.15), lx - 22, Y(midWall) - 10, (s.build === "precast" ? "Precast rings " : s.build === "masonry" ? "Masonry walls " : "In-situ walls ") + mm(s.t_wall) + " thk", "end");
    if (s.sur_on) leader(X(-(wallOut + surOut) / 2), Y(midWall - 0.2), lx - 22, Y(midWall) - 4, "Concrete surround " + mm(s.sur_t) + " thk", "end");
    leader(X(-wallIn * 0.6), Y(V.bench_top + V.bench_rise / 2000), lx - 22, Y(midWall) + 3, "Benching 1:" + s.bench_fall + " (beyond)", "end");
    leader(X(-baseOut + 80), Y(V.out_il - s.t_base / 2000), lx - 22, Y(V.form) + 8, "Base " + mm(s.t_base) + " thk", "end");
    leader(X(-exB + 120), Y(V.form - s.t_blind / 2000), lx - 22, Y(V.form) + 13, "Blinding " + mm(s.t_blind), "end");
    var oo = op.list[0];
    leader(X(exB + 200), Y(oo.hi), X(exB + 200) + 6, Y(oo.hi) - 13, "Outlet DN" + oo.dn + " " + matName(s.out_mat), "start");
    text(X(exB + 200) + 6.8, Y(oo.hi) - 8.6, BEDS[s.bed_type].l, 1.9, "start");
    text(X(0), secBox.y + 2, "SECTION A–A", 3.2, "middle", ' font-weight="700"');
    text(X(0), secBox.y + 5.6, "Scale 1:" + sc + " at A3", 2, "middle");

    /* --- Plan --- */
    var plBox = { x: 266, y: 20, w: 140, h: 138 };
    var pR = Math.max(V.ex_lx_top, V.ex_wy_top) / 2 + 700;
    var ps = niceScale(Math.min(plBox.w, plBox.h - 16) / (2 * pR)), pk = 1 / ps;
    var pcx = plBox.x + plBox.w / 2, pcy = plBox.y + 12 + (plBox.h - 12) / 2;
    function PX(x) { return pcx + x * pk; } function PY(y) { return pcy - y * pk; }
    text(pcx, plBox.y + 2, "PLAN", 3.2, "middle", ' font-weight="700"');
    text(pcx, plBox.y + 5.6, "Scale 1:" + ps + " at A3 · cover and slab omitted", 2, "middle");
    L("hidden", '<rect x="' + f1(PX(-V.ex_lx_top / 2)) + '" y="' + f1(PY(V.ex_wy_top / 2)) + '" width="' + f1(V.ex_lx_top * pk) + '" height="' + f1(V.ex_wy_top * pk) + '" fill="none" stroke="' + MUTE + '" stroke-width="0.25" stroke-dasharray="2 1"/>');
    if (s.batter > 0) L("hidden", '<rect x="' + f1(PX(-V.ex_lx / 2)) + '" y="' + f1(PY(V.ex_wy / 2)) + '" width="' + f1(V.ex_lx * pk) + '" height="' + f1(V.ex_wy * pk) + '" fill="none" stroke="' + MUTE + '" stroke-width="0.2" stroke-dasharray="1 1"/>');
    function shape(w, h, fill, extra) {
      if (s.shape === "circ") return '<circle cx="' + f1(pcx) + '" cy="' + f1(pcy) + '" r="' + f1(w / 2 * pk) + '" fill="' + fill + '"' + extra + "/>";
      return '<rect x="' + f1(PX(-w / 2)) + '" y="' + f1(PY(h / 2)) + '" width="' + f1(w * pk) + '" height="' + f1(h * pk) + '" fill="' + fill + '"' + extra + "/>";
    }
    L("hidden", shape(V.lx_base, V.wy_base, "none", ' stroke="' + MUTE + '" stroke-width="0.25" stroke-dasharray="3 1 0.5 1"'));
    if (s.sur_on) L("hatch", shape(V.lx_sur, V.wy_sur, "url(#mhc)", ' stroke="' + INK + '" stroke-width="0.25"'));
    L("hatch", shape(V.lx_ext, V.wy_ext, wallFill, ' stroke="' + INK + '" stroke-width="0.35"'));
    L("hatch", shape(V.lx_int, V.wy_int, "#fff", ' stroke="' + INK + '" stroke-width="0.35"'));
    // pipes, channels, flow arrows
    var CH = [];
    op.list.forEach(function (o) {
      var t = o.ang * Math.PI / 180, c = Math.cos(t), sn = Math.sin(t), nx = -sn, ny = c, L1 = Math.hypot(o.x, o.y), L2 = Math.max(V.ex_lx_top, V.ex_wy_top) / 2 + 500;
      [o.od / 2, -o.od / 2].forEach(function (off) { line("outline", PX(o.x + nx * off), PY(o.y + ny * off), PX(c * L2 + nx * off), PY(sn * L2 + ny * off), ' stroke="' + INK + '" stroke-width="0.3"'); });
      var ax1 = c * (L2 - 50), ay1 = sn * (L2 - 50), ax2 = c * (L1 + 150), ay2 = sn * (L1 + 150);
      if (o.k === "out") { var tmp = [ax1, ay1]; ax1 = ax2; ay1 = ay2; ax2 = tmp[0]; ay2 = tmp[1]; }
      L("dims", '<path d="M' + f1(PX(ax1)) + " " + f1(PY(ay1)) + "L" + f1(PX(ax2)) + " " + f1(PY(ay2)) + '" stroke="' + INK + '" stroke-width="0.25" marker-end="url(#mha)"/>');
      var lx2 = c * (L2 + 80), ly2 = sn * (L2 + 80);
      var anc = c > 0.3 ? "start" : c < -0.3 ? "end" : "middle";
      text(PX(lx2), PY(ly2) + (sn > 0.3 ? -1 : sn < -0.3 ? 3 : 0.8), (o.k === "out" ? "Outlet" : "P" + o.k.slice(1)) + " DN" + o.dn, 2, anc);
      if (o.k !== "out") CH.push('<path d="M' + f1(PX(o.x)) + " " + f1(PY(o.y)) + "Q" + f1(pcx) + " " + f1(pcy) + " " + f1(PX(V.lx_int / 2 * (s.shape === "circ" ? 1 : 1))) + " " + f1(pcy) + '" fill="none" stroke="' + INK + '" stroke-width="' + f1(Math.max(0.3, o.dn * pk)) + '" stroke-opacity="0.18"/>');
    });
    L("outline", CH.join(""));
    L("outline", '<path d="M' + f1(PX(-V.lx_int / 2)) + " " + f1(PY(V.out_dn / 2)) + "H" + f1(PX(V.lx_int / 2)) + "M" + f1(PX(-V.lx_int / 2)) + " " + f1(PY(-V.out_dn / 2)) + "H" + f1(PX(V.lx_int / 2)) + '" stroke="' + INK + '" stroke-width="0.25" stroke-dasharray="1.5 0.8"/>');
    // opening, shaft, steps
    if (s.shaft) L("hidden", '<circle cx="' + f1(pcx) + '" cy="' + f1(pcy) + '" r="' + f1(s.shaft_d / 2 * pk) + '" fill="none" stroke="' + INK + '" stroke-width="0.25" stroke-dasharray="2 1"/>');
    L("hidden", '<rect x="' + f1(PX(-s.open_l / 2)) + '" y="' + f1(PY(s.open_w / 2)) + '" width="' + f1(s.open_l * pk) + '" height="' + f1(s.open_w * pk) + '" fill="none" stroke="' + INK + '" stroke-width="0.25" stroke-dasharray="2 1"/>');
    if (mode !== "None") {
      var at = num(s.acc_ang) * Math.PI / 180, aR = (s.shaft ? s.shaft_d / 2 : V.lx_int / 2) - 80;
      if (s.shape === "rect" && !s.shaft) { var ac = Math.cos(at), asn = Math.sin(at); aR = Math.min(Math.abs(ac) > 1e-6 ? V.lx_int / 2 / Math.abs(ac) : 1e9, Math.abs(asn) > 1e-6 ? V.wy_int / 2 / Math.abs(asn) : 1e9) - 80; }
      var ax = Math.cos(at) * aR, ay = Math.sin(at) * aR, tx = -Math.sin(at), ty = Math.cos(at);
      L("outline", '<path d="M' + f1(PX(ax + tx * 170)) + " " + f1(PY(ay + ty * 170)) + "L" + f1(PX(ax - tx * 170)) + " " + f1(PY(ay - ty * 170)) + '" stroke="' + RED + '" stroke-width="0.8"/>');
      text(PX(ax * 0.6), PY(ay * 0.6) + 0.8, mode === "Ladder" ? "Ladder" : "Steps", 1.9, "middle", ' fill="' + RED + '"');
    }
    // section line A-A
    var sa = Math.max(V.ex_lx_top / 2 + 300, 0);
    L("dims", '<path d="M' + f1(PX(-sa)) + " " + f1(pcy) + "H" + f1(PX(-sa + 250)) + "M" + f1(PX(sa - 250)) + " " + f1(pcy) + "H" + f1(PX(sa)) + '" stroke="' + INK + '" stroke-width="0.5"/><path d="M' + f1(PX(-sa)) + " " + f1(pcy) + "v-4" + '" stroke="' + INK + '" stroke-width="0.3" marker-end="url(#mha)"/><path d="M' + f1(PX(sa)) + " " + f1(pcy) + 'v-4" stroke="' + INK + '" stroke-width="0.3" marker-end="url(#mha)"/>');
    text(PX(-sa) - 1, pcy + 3, "A", 2.6, "end", ' font-weight="700"'); text(PX(sa) + 1, pcy + 3, "A", 2.6, "start", ' font-weight="700"');
    text(pcx, PY(-V.ex_wy_top / 2) + 4, (s.shape === "circ" ? "Ø" + mm(V.lx_int) : mm(V.lx_int) + " × " + mm(V.wy_int)) + " internal · opening " + mm(s.open_l) + " × " + mm(s.open_w), 2, "middle");

    /* --- Channel detail (across the flow) --- */
    var dBox = { x: 266, y: 162, w: 140, h: 50 };
    var dHalf = V.wy_ext / 2 + 50, dDepth = (V.bench_r * V.out_dn + V.bench_rise + s.t_base + 120);
    var ds = niceScale(Math.min(dBox.w / (2 * dHalf), (dBox.h - 12) / dDepth)), dk = 1 / ds, dcx = dBox.x + dBox.w / 2, dTop = dBox.y + 10;
    function DX(x) { return dcx + x * dk; } function DY(z) { return dTop + (V.bench_r * V.out_dn + V.bench_rise + 40 - z) * dk; }
    text(dcx, dBox.y + 2, "CHANNEL AND BENCHING, ACROSS THE FLOW", 2.6, "middle", ' font-weight="700"');
    text(dcx, dBox.y + 5.4, "Scale 1:" + ds + " · heights above outlet invert", 2, "middle");
    var r0 = V.out_dn / 2, hb = V.bench_r * V.out_dn, wIn = V.wy_int / 2, rise = V.bench_rise;
    var arc = "M" + f1(DX(-r0)) + " " + f1(DY(hb)) + "V" + f1(DY(r0)) + "A" + f1(r0 * dk) + " " + f1(r0 * dk) + " 0 0 0 " + f1(DX(r0)) + " " + f1(DY(r0)) + "V" + f1(DY(hb));
    L("hatch", '<path d="M' + f1(DX(-wIn)) + " " + f1(DY(-s.t_base)) + "V" + f1(DY(hb + rise)) + "L" + f1(DX(-r0)) + " " + f1(DY(hb)) + arc.replace(/^M[^V]+/, "") + "L" + f1(DX(wIn)) + " " + f1(DY(hb + rise)) + "V" + f1(DY(-s.t_base)) + 'z" fill="url(#mhc)" stroke="' + INK + '" stroke-width="0.35"/>');
    [-1, 1].forEach(function (sg) { rect("hatch", DX(sg > 0 ? wIn : -V.wy_ext / 2), DY(hb + rise + 150), s.t_wall * dk, (hb + rise + 150 + s.t_base) * dk, wallFill); });
    hdim(DX(r0), DX(wIn), DY(hb + rise) - 4, mm(bW));
    hdim(DX(-r0), DX(r0), DY(-s.t_base) + 4, "DN" + mm(V.out_dn), true);
    vdim(DX(-wIn) - 9, DY(hb), DY(0), mm(hb), true);
    text(DX(-wIn / 2), DY(hb + rise) - 1.2, "1:" + s.bench_fall, 2, "middle");

    /* --- Title block and notes --- */
    var tb = { x: 266, y: 216, w: 140, h: 67 };
    L("outline", '<rect x="' + tb.x + '" y="' + tb.y + '" width="' + tb.w + '" height="' + tb.h + '" fill="#fff" stroke="' + INK + '" stroke-width="0.5"/><path d="M' + tb.x + " " + (tb.y + 30) + "h" + tb.w + "M" + tb.x + " " + (tb.y + 44) + "h" + tb.w + "M" + (tb.x + 70) + " " + (tb.y + 44) + "v" + (tb.h - 44) + '" stroke="' + INK + '" stroke-width="0.3"/>');
    var notes = ["Dimensions in mm, levels in m. Ground taken as cover level.", "Generated from the user's inputs; defaults marked in the calc sheet", "must be set from the governing documents and suppliers' data.", "Not checked against any standard. Rest platforms, backdrops and", "pipe joints near the chamber are not drawn.", "Openings checked: " + E.op.pairs.length + " pairs; see the calc sheet."];
    text(tb.x + 2, tb.y + 4, "NOTES", 2.2, "start", ' font-weight="700"');
    notes.forEach(function (n, i) { text(tb.x + 2, tb.y + 8 + i * 3.6, n, 1.95); });
    text(tb.x + 2, tb.y + 36, "Manhole " + s.ref + ": section and plan", 3.4, "start", ' font-weight="700"');
    text(tb.x + 2, tb.y + 41, s.project, 2.3);
    var today = new Date();
    [["Scale", "As shown at A3"], ["Date", today.getDate() + "/" + (today.getMonth() + 1) + "/" + today.getFullYear()], ["Status", "Sketch for checking"]].forEach(function (r, i) { text(tb.x + 2, tb.y + 50 + i * 5.5, r[0], 1.9, "start", ' fill="' + MUTE + '"'); text(tb.x + 16, tb.y + 50 + i * 5.5, r[1], 2.3); });
    text(tb.x + 72, tb.y + 50, "Manhole detail generator", 2.3, "start", ' font-weight="700"');
    text(tb.x + 72, tb.y + 55, "Civil Chartered Path", 2.1);
    var bad = E.R.filter(function (r) { return r.k === "chk" && r.v !== "OK"; }).length + E.op.pairs.filter(function (p) { return !p.ok; }).length;
    text(tb.x + 72, tb.y + 61, bad ? bad + " check" + (bad > 1 ? "s" : "") + " flagged" : "All checks OK", 2.3, "start", ' font-weight="700" fill="' + (bad ? RED : "#1b6b2a") + '"');

    var body = '<rect x="0" y="0" width="420" height="297" fill="#fff"/><rect x="8" y="8" width="404" height="281" fill="none" stroke="' + INK + '" stroke-width="0.6"/>' +
      ["hatch", "hidden", "outline", "dims", "text"].map(function (n) { return '<g data-layer="' + n + '">' + layers[n].join("") + "</g>"; }).join("");
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 297" width="420mm" height="297mm" font-family="Arial, Helvetica, sans-serif" fill="' + INK + '" role="img" aria-label="Manhole ' + esc(s.ref) + ' section and plan">' + DEFS + body + "</svg>";
  }

  /* ---------- Calc sheet ---------- */
  function fmt(r) {
    if (typeof r.v === "string") return r.v;
    if (r.v == null || !isFinite(r.v)) return "–";
    var dp = r.dp != null ? r.dp : (r.unit === "m" ? 3 : r.unit === "mm" || r.unit === "°" ? 0 : 3);
    return Number(r.v).toLocaleString("en-GB", { minimumFractionDigits: dp, maximumFractionDigits: dp });
  }
  function pairsRows(E) {
    return E.op.pairs.map(function (p) {
      return { label: "Gap between " + p.a.name + " and " + p.b.name + " openings", v: p.over ? Math.round(p.gap) : null, status: p.ok ? "OK" : "CHECK",
        detail: p.over ? mm(p.gap) + " mm along the inside face, against your " + mm(E.V.clr_min) + " mm" : "Openings are separated vertically" };
    });
  }
  function renderCalc(E) {
    var html = "", R = E.R;
    R.forEach(function (r) {
      if (r.k === "sec") html += '<tr class="mh-sec"><th colspan="5">' + esc(r.label) + "</th></tr>";
      else if (r.k === "chk") html += '<tr class="mh-ck mh-' + String(r.v).toLowerCase() + '"><td class="mono">' + r.id + "</td><td>" + esc(r.label) + '</td><td><span class="mh-pill">' + esc(r.v) + '</span></td><td></td><td>' + esc(r.d) + (r.v !== "OK" ? '<br><span class="mh-why">' + esc(r.why) + "</span>" : "") + "</td></tr>";
      else if (r.k === "pairs") pairsRows(E).forEach(function (p, i) { html += '<tr class="mh-ck mh-' + p.status.toLowerCase() + '"><td class="mono">ck_gap' + (i + 1) + "</td><td>" + esc(p.label) + '</td><td><span class="mh-pill">' + p.status + "</span></td><td></td><td>" + esc(p.detail) + (p.status !== "OK" ? '<br><span class="mh-why">Move the pipe round the chamber or use a larger chamber.</span>' : "") + "</td></tr>"; });
      else html += "<tr" + (r.k === "in" || r.k === "txt" ? ' class="mh-in"' : "") + '><td class="mono">' + r.id + "</td><td>" + esc(r.label) + '</td><td class="mono mh-v">' + esc(fmt(r)) + "</td><td>" + esc(r.unit || "") + '</td><td class="small">' + (r.f ? '<code>' + esc(r.f) + "</code>" + (r.note ? "<br>" : "") : "") + esc(r.note || "") + "</td></tr>";
    });
    $("mh-calc-body").innerHTML = html;
    var flagged = R.filter(function (r) { return r.k === "chk" && r.v !== "OK"; }).map(function (r) { return { s: r.v, l: r.label, d: r.d, w: r.why }; })
      .concat(pairsRows(E).filter(function (p) { return p.status !== "OK"; }).map(function (p) { return { s: p.status, l: p.label, d: p.detail, w: "Move the pipe round the chamber or use a larger chamber." }; }));
    var V = E.V;
    $("mh-summary").innerHTML =
      '<div class="mh-stats">' + [["Depth to outlet", lv(V.depth) + " m"], ["Excavation", fmt({ v: V.v_exc, dp: 2 }) + " m³"], ["In-situ concrete", fmt({ v: V.v_insitu, dp: 2 }) + " m³"], ["Backfill", fmt({ v: V.v_backfill, dp: 2 }) + " m³"], ["Bedding", fmt({ v: V.v_bed, dp: 2 }) + " m³"], ["Access", R.filter(function (r) { return r.id === "acc_mode"; })[0].v + (V.n_steps && R.filter(function (r) { return r.id === "acc_mode"; })[0].v !== "None" ? " × " + V.n_steps : "")]].map(function (x) { return '<div><span class="small">' + x[0] + '</span><strong class="mono">' + esc(x[1]) + "</strong></div>"; }).join("") + "</div>" +
      (flagged.length ? '<ul class="mh-flags">' + flagged.map(function (f) { return '<li class="mh-' + f.s.toLowerCase() + '"><span class="mh-pill">' + f.s + "</span><div><strong>" + esc(f.l) + "</strong> " + esc(f.d) + '<br><span class="small">' + esc(f.w) + "</span></div></li>"; }).join("") + "</ul>"
        : '<p class="mh-allok"><span class="mh-pill">OK</span> All geometric checks pass against your inputs.</p>');
  }

  /* ---------- Exports ---------- */
  function download(name, blob) { var a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000); }
  function fname(ext) { return ("manhole-" + String(S.ref || "detail").replace(/[^A-Za-z0-9_-]+/g, "-") + "." + ext).toLowerCase(); }
  function tableRows(E) {
    var out = [["Ref", "Description", "Value", "Unit", "Formula or basis"]];
    E.R.forEach(function (r) {
      if (r.k === "sec") out.push(["", r.label.toUpperCase(), "", "", ""]);
      else if (r.k === "chk") out.push([r.id, r.label, r.v, "", r.d + (r.v !== "OK" ? ". " + r.why : "")]);
      else if (r.k === "pairs") pairsRows(E).forEach(function (p, i) { out.push(["ck_gap" + (i + 1), p.label, p.status, "", p.detail]); });
      else out.push([r.id, r.label, typeof r.v === "number" ? +(+r.v).toFixed(r.k === "in" ? 6 : (r.dp != null ? r.dp + 1 : 4)) : r.v, r.unit || "", (r.f ? r.f + (r.note ? ". " : "") : "") + (r.note || "")]);
    });
    return out;
  }
  function toCsv(E) {
    return tableRows(E).map(function (r) { return r.map(function (c) { c = c == null ? "" : String(c); return /[",\n]/.test(c) ? '"' + c.replace(/"/g, '""') + '"' : c; }).join(","); }).join("\r\n");
  }

  /* Minimal XLSX writer (stored zip, no compression) so the calc sheet keeps live formulas without a library. */
  var CRC = (function () { var t = []; for (var n = 0; n < 256; n++) { var c = n; for (var k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
  function crc32(b) { var c = 0xFFFFFFFF; for (var i = 0; i < b.length; i++) c = CRC[(c ^ b[i]) & 0xFF] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; }
  function zip(files) {
    var enc = new TextEncoder(), parts = [], central = [], off = 0;
    function u16(v) { return [v & 255, (v >>> 8) & 255]; } function u32(v) { return [v & 255, (v >>> 8) & 255, (v >>> 16) & 255, (v >>> 24) & 255]; }
    files.forEach(function (f) {
      var name = enc.encode(f[0]), data = enc.encode(f[1]), crc = crc32(data);
      var head = [].concat(u32(0x04034b50), u16(20), u16(0), u16(0), u16(0), u16(0x21), u32(crc), u32(data.length), u32(data.length), u16(name.length), u16(0));
      parts.push(new Uint8Array(head), name, data);
      central.push(new Uint8Array([].concat(u32(0x02014b50), u16(20), u16(20), u16(0), u16(0), u16(0), u16(0x21), u32(crc), u32(data.length), u32(data.length), u16(name.length), u16(0), u16(0), u16(0), u16(0), u32(0), u32(off))), name);
      off += head.length + name.length + data.length;
    });
    var csize = central.reduce(function (a, b) { return a + b.length; }, 0);
    var end = new Uint8Array([].concat(u32(0x06054b50), u16(0), u16(0), u16(files.length), u16(files.length), u32(csize), u32(off), u16(0)));
    return new Blob(parts.concat(central, [end]), { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  }
  function xmlEsc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function toXlsx(E) {
    var rows = [], rowOf = {};
    rows.push([{ s: "Manhole " + S.ref + " calculation sheet: " + S.project, b: 1 }]);
    rows.push([{ s: "Values in column C recalculate from the inputs. Inputs marked default must be set from your governing documents and suppliers' data. Not checked against any standard." }]);
    rows.push([{ s: "Ref", b: 1 }, { s: "Description", b: 1 }, { s: "Value", b: 1 }, { s: "Unit", b: 1 }, { s: "Formula or basis", b: 1 }]);
    E.R.forEach(function (r) {
      if (r.k === "sec") { rows.push([{ s: "" }, { s: r.label, b: 1 }]); return; }
      if (r.k === "pairs") { pairsRows(E).forEach(function (p, i) { rows.push([{ s: "ck_gap" + (i + 1) }, { s: p.label }, { s: p.status }, { s: "" }, { s: p.detail + " (computed by the tool from plan geometry)" }]); }); return; }
      rowOf[r.id] = rows.length + 1;
      var cell;
      if (r.k === "in") cell = { n: r.v };
      else if (r.k === "txt" || r.k === "val") cell = { s: r.v };
      else cell = { f: r.f, v: r.v };
      rows.push([{ s: r.id }, { s: r.label }, cell, { s: r.unit || "" }, { s: r.k === "chk" ? r.d + (r.v !== "OK" ? ". " + r.why : "") : (r.f ? r.f + (r.note ? ". " : "") : "") + (r.note || "") + (r.k === "val" ? "Computed by the tool" : "") }]);
    });
    function ref(id) { if (!rowOf[id]) throw new Error("No row for " + id); return "$C$" + rowOf[id]; }
    var COLS = "ABCDE";
    var sheet = rows.map(function (row, ri) {
      return '<row r="' + (ri + 1) + '">' + row.map(function (c, ci) {
        var a = COLS[ci] + (ri + 1), st = c.b ? ' s="1"' : "";
        if (c.f != null) {
          var f = translate(c.f, ref, function (fn) { return fn; }, "^");
          var str = typeof c.v === "string";
          return '<c r="' + a + '"' + (str ? ' t="str"' : "") + "><f>" + xmlEsc(f) + "</f>" + (c.v != null && (str || isFinite(c.v)) ? "<v>" + xmlEsc(c.v) + "</v>" : "") + "</c>";
        }
        if (c.n != null && isFinite(c.n)) return '<c r="' + a + '"' + st + "><v>" + c.n + "</v></c>";
        return '<c r="' + a + '" t="inlineStr"' + st + "><is><t>" + xmlEsc(c.s == null ? "" : c.s) + "</t></is></c>";
      }).join("") + "</row>";
    }).join("");
    var files = [
      ["[Content_Types].xml", '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>'],
      ["_rels/.rels", '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>'],
      ["xl/workbook.xml", '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Manhole calc" sheetId="1" r:id="rId1"/></sheets><calcPr calcId="191029" fullCalcOnLoad="1"/></workbook>'],
      ["xl/_rels/workbook.xml.rels", '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>'],
      ["xl/styles.xml", '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font></fonts><fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills><borders count="1"><border/></borders><cellStyleXfs count="1"><xf/></cellStyleXfs><cellXfs count="2"><xf fontId="0"/><xf fontId="1" applyFont="1"/></cellXfs></styleSheet>'],
      ["xl/worksheets/sheet1.xml", '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><cols><col min="1" max="1" width="14" customWidth="1"/><col min="2" max="2" width="52" customWidth="1"/><col min="3" max="3" width="16" customWidth="1"/><col min="4" max="4" width="7" customWidth="1"/><col min="5" max="5" width="80" customWidth="1"/></cols><sheetData>' + sheet + "</sheetData></worksheet>"]
    ];
    return zip(files);
  }

  function svgToCanvas(svg, scale) {
    return new Promise(function (ok, fail) {
      var img = new Image(), url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
      img.onload = function () { var c = document.createElement("canvas"); c.width = 420 * scale; c.height = 297 * scale; var g = c.getContext("2d"); g.fillStyle = "#fff"; g.fillRect(0, 0, c.width, c.height); g.drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(url); ok(c); };
      img.onerror = function () { URL.revokeObjectURL(url); fail(new Error("render")); };
      img.src = url;
    });
  }
  var JSPDF = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js", jsPdfP = null;
  function loadJsPdf() {
    if (!jsPdfP) jsPdfP = new Promise(function (ok, fail) { var sc = document.createElement("script"); sc.src = JSPDF; sc.onload = function () { ok(window.jspdf.jsPDF); }; sc.onerror = function () { jsPdfP = null; fail(new Error("load")); }; document.head.appendChild(sc); });
    return jsPdfP;
  }
  function toPdf(E, svg) {
    return Promise.all([loadJsPdf(), svgToCanvas(svg, 7)]).then(function (x) {
      var Pdf = x[0], c = x[1], doc = new Pdf({ orientation: "landscape", unit: "mm", format: "a3" });
      doc.addImage(c.toDataURL("image/jpeg", 0.92), "JPEG", 0, 0, 420, 297);
      // calc sheet pages
      var rows = tableRows(E), y = 0, W = [24, 120, 30, 14, 212];
      function page() { doc.addPage("a3", "landscape"); doc.setFontSize(12); doc.setFont("helvetica", "bold"); doc.text("Manhole " + S.ref + " calculation sheet: " + S.project, 12, 14); doc.setFontSize(8); doc.setFont("helvetica", "normal"); doc.text("Defaults must be set from your governing documents and suppliers' data. Not checked against any standard.", 12, 19); y = 27; }
      page();
      rows.forEach(function (r, i) {
        var bold = i === 0 || (r[0] === "" && r[1]);
        var lines = doc.splitTextToSize(String(r[4] || ""), W[4] - 2), h = Math.max(1, lines.length) * 3.6 + 1;
        if (y + h > 285) page();
        doc.setFont("helvetica", bold ? "bold" : "normal");
        var cx = 12;
        [r[0], r[1], r[2], r[3]].forEach(function (c, j) { var t = doc.splitTextToSize(String(c == null ? "" : c), W[j] - 2)[0] || ""; if (j === 2 && (c === "FAIL" || c === "CHECK")) doc.setTextColor(179, 38, 30); doc.text(t, cx, y); doc.setTextColor(0, 0, 0); cx += W[j]; });
        doc.setFont("helvetica", "normal"); doc.text(lines, cx, y);
        doc.setDrawColor(220); doc.line(12, y + h - 3, 408, y + h - 3);
        y += h;
      });
      return doc.output("blob");
    });
  }

  function setStatus(t) { $("mh-status").textContent = t; }
  var current = null;
  $("mh-png").addEventListener("click", function () { setStatus("Making PNG…"); svgToCanvas(current.svg, 8).then(function (c) { c.toBlob(function (b) { download(fname("png"), b); setStatus("PNG saved."); }); }, function () { setStatus("Couldn't render the PNG in this browser."); }); });
  $("mh-svgdl").addEventListener("click", function () { download(fname("svg"), new Blob([current.svg], { type: "image/svg+xml" })); setStatus("SVG saved."); });
  $("mh-pdf").addEventListener("click", function () { setStatus("Making PDF…"); toPdf(current.E, current.svg).then(function (b) { download(fname("pdf"), b); setStatus("PDF saved: drawing on page 1, calc sheet after."); }, function () { setStatus("Couldn't load the PDF library. Check your connection, or use PNG."); }); });
  $("mh-csv").addEventListener("click", function () { download(fname("csv"), new Blob(["﻿" + toCsv(current.E)], { type: "text/csv" })); setStatus("CSV saved."); });
  $("mh-xlsx").addEventListener("click", function () { try { download(fname("xlsx"), toXlsx(current.E)); setStatus("XLSX saved, with live formulas."); } catch (e) { setStatus("Couldn't build the XLSX: " + e.message); } });
  $("mh-sketch").addEventListener("click", function () {
    var ok = window.CPSketch && window.CPSketch.importDetail && window.CPSketch.importDetail({ svg: current.svg, title: "MH " + S.ref + " section and plan", scale: "As shown at A3", source: "manhole" });
    setStatus(ok ? "Sent to the sketch sheet." : "The sketch tool didn't accept the detail.");
  });

  function update() {
    var E = evaluate(S), svg = drawing(E);
    current = { E: E, svg: svg };
    $("mh-svg").innerHTML = svg;
    renderCalc(E);
    $("mh-sketch").hidden = !(window.CPSketch && window.CPSketch.importDetail);
  }
  renderForm();
  update();
  window.addEventListener("load", function () { $("mh-sketch").hidden = !(window.CPSketch && window.CPSketch.importDetail); });
  window.CPManhole = { state: function () { return S; }, refresh: function () { save(); renderForm(); update(); }, evaluate: function () { return evaluate(S); }, svg: function () { return current && current.svg; }, xlsx: function () { return toXlsx(current.E); }, csv: function () { return toCsv(current.E); } };
})();
