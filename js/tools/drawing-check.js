/* Drawing check: a tickable pre-issue checklist for engineering drawings.
   Written from general drawing-office practice for UK civils and drainage work.
   It does not reproduce or claim conformance with any published standard; the
   user's own office standard and project information requirements come first.
   Ticks, N/A marks, drawing details and the user's own items are kept in this
   browser only (localStorage key "cp-dwgcheck"). */
(function () {
  "use strict";

  window.CP_TOOLS = (window.CP_TOOLS || []).concat([{
    id: "drawing-check",
    label: "Drawing checklist",
    blurb: "Tick through a drawing before it goes out for review or issue: title block, scale, labels, dimensions, notes, legend and revisions."
  }]);

  /* o: true marks a convention that varies by organisation or project. */
  var GROUPS = [
    { id: "tb", title: "Title block, numbering and status", items: [
      ["tb1", "Correct title block and sheet size for the project"],
      ["tb2", "Project name, client and project number correct"],
      ["tb3", "Drawing title present, describes what is shown and matches the drawing register"],
      ["tb4", "Drawing number follows the project numbering format and matches the register", 1],
      ["tb5", "Sheet number correct, including \"sheet x of y\" and the total in the set"],
      ["tb6", "Project stage shown and correct for this issue", 1],
      ["tb7", "Status or suitability code matches the stage and the purpose of issue", 1],
      ["tb8", "Revision code follows the project convention (preliminary or contract)", 1],
      ["tb9", "Revision table updated: revision, date, description and initials"],
      ["tb10", "Drawn, checked and approved boxes filled, by different people where required"],
      ["tb11", "Scale stated in the title block with its sheet size, e.g. 1:500 at A1"],
      ["tb12", "Key plan or location plan present and highlights the area shown"]
    ]},
    { id: "sc", title: "Scale, orientation and coordinates", items: [
      ["sc1", "Scale bar present and correct for the stated scale and sheet size"],
      ["sc2", "Every view, section and detail has its own scale, or says NTS"],
      ["sc3", "\"Do not scale\" note included where your office uses one", 1],
      ["sc4", "North arrow on every plan, pointing the right way"],
      ["sc5", "North arrow agrees between plans in the set"],
      ["sc6", "Coordinates on a named grid, e.g. OS National Grid"],
      ["sc7", "Levels stated as metres AOD, or another datum that is named"],
      ["sc8", "Grid ticks or coordinates labelled where they are shown"],
      ["sc9", "Viewports not rescaled or panned by accident since the last issue"]
    ]},
    { id: "bi", title: "Base information", items: [
      ["bi1", "Topographical survey is the latest version, with its source and date noted"],
      ["bi2", "Survey datum and grid agree with the design"],
      ["bi3", "Existing services shown, with their source and a note on accuracy"],
      ["bi4", "Existing and proposed clearly distinguished"],
      ["bi5", "Site or red line boundary shown correctly"],
      ["bi6", "Linked references and models current; none missing or unloaded"],
      ["bi7", "Third-party information credited, with its limitations noted"]
    ]},
    { id: "ge", title: "Geometry, levels and design content", items: [
      ["ge1", "Design matches the latest calculations or model"],
      ["ge2", "Pipe sizes, materials, gradients and flow directions shown"],
      ["ge3", "Cover and invert levels agree with long sections and schedules"],
      ["ge4", "Levels, gradients and invert levels consistent with each other"],
      ["ge5", "Manhole and chamber references unique and the same on plan, section and schedule"],
      ["ge6", "Gradient arrows point downhill and fall labels agree with levels"],
      ["ge7", "Clearances to other services and structures checked"],
      ["ge8", "Proposed levels tie in to existing levels at the boundaries"],
      ["ge9", "Setting-out information complete and unambiguous"],
      ["ge10", "Chainages and setting-out coordinates agree with the alignment or schedule"],
      ["ge11", "Consistent with other disciplines' current drawings"]
    ]},
    { id: "an", title: "Annotation and labelling", items: [
      ["an1", "Spelling checked, including the title block and notes"],
      ["an2", "Terms and abbreviations consistent; abbreviations defined"],
      ["an3", "Every element that needs a label has one"],
      ["an4", "Each leader arrow points to the item its label describes"],
      ["an5", "Leaders end on the item, without crossing each other or dimension lines"],
      ["an6", "Labels clear of linework, hatching and other text"],
      ["an7", "Text height legible at the printed scale", 1],
      ["an8", "Units stated, e.g. dimensions in mm and levels in m"],
      ["an9", "Decimal places consistent for levels, chainages and coordinates"],
      ["an10", "Draft text removed: TBC, XX, \"check\", personal notes"]
    ]},
    { id: "lg", title: "Legend and symbols", items: [
      ["lg1", "Legend present where symbols, line types or hatches are used"],
      ["lg2", "Every symbol, line type and hatch on the drawing is in the legend"],
      ["lg3", "Nothing in the legend is unused or left from another drawing"],
      ["lg4", "Legend entries look the same as they do on the drawing"],
      ["lg5", "Legend consistent across sheets in the set"]
    ]},
    { id: "di", title: "Dimensions", items: [
      ["di1", "Every dimension needed to build or set out is given"],
      ["di2", "No duplicate dimensions that could conflict"],
      ["di3", "Dimension values match the geometry (no overridden text)"],
      ["di4", "Dimensions taken from clear grid lines, datums or setting-out points"],
      ["di5", "Dimension arrows or ticks end on the right line"],
      ["di6", "Dimension text legible at the printed scale"],
      ["di7", "Critical dimensions checked against calculations"]
    ]},
    { id: "lw", title: "Line work, layers and hatching", items: [
      ["lw1", "Line types correct, e.g. existing, proposed, hidden and centre lines", 1],
      ["lw2", "Line weights separate proposed, existing and background"],
      ["lw3", "Dashed lines read as dashed at the plotted scale"],
      ["lw4", "Layers follow the naming standard; nothing on the wrong layer", 1],
      ["lw5", "No construction or working layers left visible"],
      ["lw6", "Hatch patterns correct for each material"],
      ["lw7", "Hatching does not hide text or dimensions"],
      ["lw8", "Still legible printed in black and white"],
      ["lw9", "No stray objects or duplicate lines"],
      ["lw10", "Superseded information deleted, not just hidden"]
    ]},
    { id: "nt", title: "Notes and cross-references", items: [
      ["nt1", "Notes numbered in order, with no gaps or duplicates"],
      ["nt2", "Every numbered note is referred to on the drawing, or applies generally"],
      ["nt3", "Every note reference on the drawing points to a note that exists"],
      ["nt4", "Notes are specific to this drawing; none left from a template or old job"],
      ["nt5", "Section and detail markers point to views that exist"],
      ["nt6", "Section markers cut in the right place and look the right way"],
      ["nt7", "References to other drawings use the right number and revision"],
      ["nt8", "Referenced drawings show the item they are referred to for"],
      ["nt9", "Standard and typical details referenced are included in the issue"],
      ["nt10", "Match lines and continuation references agree between adjacent sheets"],
      ["nt11", "Specifications and standards referenced by correct title and current edition"],
      ["nt12", "Assumptions, exclusions and outstanding items noted"],
      ["nt13", "Hold points and information still to come clearly marked", 1],
      ["nt14", "Residual risks and health and safety information included where relevant", 1]
    ]},
    { id: "qa", title: "QA, revisions and issue", items: [
      ["qa1", "Self-check complete before passing for checking"],
      ["qa2", "Independent check by someone competent to check it"],
      ["qa3", "Check comments answered and closed, with a record kept"],
      ["qa4", "Changes clouded and tagged with the new revision"],
      ["qa5", "Revision description matches what actually changed"],
      ["qa6", "Old revision clouds removed per your office convention", 1],
      ["qa7", "Checked as a print or PDF at issue size: nothing clipped, clashing or off the sheet"],
      ["qa8", "File name and format match the drawing number, revision and issue register", 1],
      ["qa9", "Drawing register and transmittal updated"],
      ["qa10", "Issued through document control with the right status", 1]
    ]}
  ];

  var FIELDS = [
    ["project", "Project"], ["number", "Drawing number"], ["title", "Drawing title"],
    ["rev", "Revision"], ["stage", "Stage / status"], ["checker", "Checked by"], ["date", "Date"]
  ];

  var KEY = "cp-dwgcheck";
  var $ = function (id) { return document.getElementById(id); };
  var root = $("view-drawing-check");
  if (!root) return;

  function blank() { return { v: 1, marks: {}, info: {}, custom: [] }; }
  function load() {
    try {
      var s = JSON.parse(localStorage.getItem(KEY) || "null");
      if (s && s.v === 1) { s.marks = s.marks || {}; s.info = s.info || {}; s.custom = s.custom || []; return s; }
    } catch (e) {}
    return blank();
  }
  var state = load();
  function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {} }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }

  function allGroups() {
    var g = GROUPS.slice();
    g.push({ id: "own", title: "Your office's checks", own: true, items: state.custom.map(function (c) { return [c.id, c.t]; }) });
    return g;
  }

  function itemHtml(it, own) {
    var m = state.marks[it[0]] || "";
    return '<li class="dc-item' + (m === "y" ? " done" : m === "na" ? " na" : "") + '" data-id="' + it[0] + '">' +
      '<label><input type="checkbox" ' + (m === "y" ? "checked " : "") + (m === "na" ? "disabled " : "") + '><span class="t">' + esc(it[1]) +
      (it[2] ? ' <span class="dc-office" title="Varies by organisation: follow your office standard">office std</span>' : "") + "</span></label>" +
      '<button type="button" class="dc-na no-print" aria-pressed="' + (m === "na") + '" aria-label="Not applicable: ' + esc(it[1]) + '">N/A</button>' +
      (own ? '<button type="button" class="dc-del no-print" aria-label="Remove ' + esc(it[1]) + '">&times;</button>' : "") +
      '<span class="dc-pmark" aria-hidden="true">' + (m === "y" ? "&#9745;" : m === "na" ? "N/A" : "&#9744;") + "</span></li>";
  }

  function count(g) {
    var done = 0, na = 0;
    g.items.forEach(function (it) { var m = state.marks[it[0]]; if (m === "y") done++; else if (m === "na") na++; });
    return { done: done, na: na, total: g.items.length };
  }

  function render() {
    var gs = allGroups();
    $("dc-groups").innerHTML = gs.map(function (g, gi) {
      var c = count(g);
      return '<section class="panel dc-group' + (g.own && !g.items.length ? " dc-empty" : "") + '" data-g="' + g.id + '">' +
        '<h3><span class="dc-n">' + (gi + 1) + '</span> ' + esc(g.title) + ' <span class="dc-c small mono">' + c.done + "/" + (c.total - c.na) + "</span></h3>" +
        (g.own ? '<p class="small no-print">Add anything your employer or project standard asks for that isn\'t covered above. Saved in this browser.</p>' : "") +
        '<ul class="dc-list">' + g.items.map(function (it) { return itemHtml(it, g.own); }).join("") + "</ul>" +
        (g.own ? '<form class="dc-add no-print" id="dc-add"><input id="dc-new" type="text" maxlength="200" placeholder="e.g. Drawing approved by the client\'s engineer" aria-label="New check"><button class="btn ghost" type="submit">Add</button></form>' : "") +
        "</section>";
    }).join("");
    summary();
  }

  function summary() {
    var done = 0, na = 0, total = 0;
    allGroups().forEach(function (g) { var c = count(g); done += c.done; na += c.na; total += c.total; });
    var need = total - na, pct = need ? Math.round(100 * done / need) : 0;
    $("dc-summary").textContent = done + " of " + need + " checks done" + (na ? " (" + na + " marked N/A)" : "") + (need && done === need ? ". Ready to issue." : "");
    $("dc-bar").style.width = pct + "%";
    $("dc-progress").setAttribute("aria-valuenow", pct);
    Array.prototype.forEach.call(document.querySelectorAll("#dc-groups .dc-group"), function (sec) {
      var g = allGroups().filter(function (x) { return x.id === sec.dataset.g; })[0], c = count(g);
      sec.querySelector(".dc-c").textContent = c.done + "/" + (c.total - c.na);
      sec.classList.toggle("dc-complete", c.total > 0 && c.done === c.total - c.na);
    });
  }

  function setMark(li, m) {
    var id = li.dataset.id;
    if (m) state.marks[id] = m; else delete state.marks[id];
    save();
    var box = li.querySelector("input");
    box.checked = m === "y"; box.disabled = m === "na";
    li.classList.toggle("done", m === "y"); li.classList.toggle("na", m === "na");
    li.querySelector(".dc-na").setAttribute("aria-pressed", String(m === "na"));
    li.querySelector(".dc-pmark").innerHTML = m === "y" ? "&#9745;" : m === "na" ? "N/A" : "&#9744;";
    summary();
  }

  $("dc-groups").addEventListener("change", function (e) {
    if (e.target.type !== "checkbox") return;
    setMark(e.target.closest("li"), e.target.checked ? "y" : "");
  });
  $("dc-groups").addEventListener("click", function (e) {
    var b = e.target.closest("button"); if (!b) return;
    var li = b.closest("li");
    if (b.classList.contains("dc-na")) setMark(li, state.marks[li.dataset.id] === "na" ? "" : "na");
    else if (b.classList.contains("dc-del")) {
      state.custom = state.custom.filter(function (c) { return c.id !== li.dataset.id; });
      delete state.marks[li.dataset.id]; save(); render();
    }
  });
  $("dc-groups").addEventListener("submit", function (e) {
    if (e.target.id !== "dc-add") return;
    e.preventDefault();
    var v = $("dc-new").value.trim(); if (!v) return;
    state.custom.push({ id: "u" + Date.now().toString(36), t: v }); save(); render();
    $("dc-new").focus();
  });

  /* Drawing details */
  $("dc-info").innerHTML = FIELDS.map(function (f) {
    return '<label class="dc-field"><span class="small">' + f[1] + '</span><input type="' + (f[0] === "date" ? "date" : "text") + '" data-f="' + f[0] + '" value="' + esc(state.info[f[0]] || "") + '" maxlength="120"></label>';
  }).join("");
  $("dc-info").addEventListener("input", function (e) {
    var f = e.target.dataset.f; if (!f) return;
    state.info[f] = e.target.value; save(); printInfo();
  });
  function printInfo() {
    $("dc-pinfo").innerHTML = FIELDS.map(function (f) { return "<div><dt>" + f[1] + "</dt><dd>" + (esc(state.info[f[0]] || "") || "&nbsp;") + "</dd></div>"; }).join("");
  }

  /* Reset asks for a second press instead of a browser dialog. */
  var armed = null;
  $("dc-reset").addEventListener("click", function () {
    var b = this;
    if (!armed) {
      b.textContent = "Press again to clear ticks"; b.classList.add("dc-armed");
      armed = setTimeout(function () { armed = null; b.textContent = "Reset ticks"; b.classList.remove("dc-armed"); }, 4000);
      return;
    }
    clearTimeout(armed); armed = null; b.textContent = "Reset ticks"; b.classList.remove("dc-armed");
    state.marks = {};
    if ($("dc-reset-info").checked) { state.info = {}; Array.prototype.forEach.call(document.querySelectorAll("#dc-info input"), function (i) { i.value = ""; }); printInfo(); }
    save(); render();
  });
  $("dc-print").addEventListener("click", function () { window.print(); });

  render(); printInfo();

  /* Body class for print styles; and, until site.js lists this view from
     CP_TOOLS, show the section ourselves when the hash asks for it. */
  function sync() {
    var on = location.hash === "#drawing-check";
    document.body.classList.toggle("on-dwgcheck", on);
    if (on && root.hidden) {
      Array.prototype.forEach.call(document.querySelectorAll("section.view"), function (s) { s.hidden = s !== root; });
      window.scrollTo(0, 0);
    }
  }
  window.addEventListener("hashchange", function () { setTimeout(sync, 0); });
  window.addEventListener("load", function () { setTimeout(sync, 0); });
})();
