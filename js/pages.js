(function () {
  "use strict";
  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function load(k, d) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }
  function save(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* storage unavailable: keep working in memory */ } }
  function copyText(text, statusEl) {
    function fallback() { var t = document.createElement("textarea"); t.value = text; document.body.appendChild(t); t.select(); try { document.execCommand("copy"); statusEl.textContent = "Copied."; } catch (e) { statusEl.textContent = "Couldn't copy. Select the plan and copy it by hand."; } t.remove(); }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(function () { statusEl.textContent = "Copied."; }, fallback); else fallback();
  }

  /* ---------- Submission planner ---------- */
  var PLAN = window.PLAN, DAY = 86400000;
  var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  function fmt(d) { return d.getDate() + " " + MONTHS[d.getMonth()] + " " + d.getFullYear(); }
  function iso(d) { return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }
  function parse(v) { if (!v) return null; var p = v.split("-"); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function addDays(d, n) { return new Date(d.getTime() + n * DAY); }
  var today = new Date(); today = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  var defaults = {}; PLAN.before.concat(PLAN.after).forEach(function (s) { defaults[s.id] = s.w; }); defaults.gap = PLAN.gapWeeks;
  var CHK = window.SUBMIT_CHECKLIST || [], chkTicks = load("cp-checklist", {});
  function chkHtml(at) {
    var list = CHK.filter(function (c) { return c.at === at; });
    if (!list.length) return "";
    return '<ul class="checklist plan-chk">' + list.map(function (c) {
      var on = !!chkTicks[c.id];
      return '<li><label class="' + (on ? "done" : "") + '"><input type="checkbox" data-chk="' + c.id + '"' + (on ? " checked" : "") + '><span class="t">' + esc(c.t) + "</span>" + (c.src ? '<span class="src">ICE</span>' : "<span></span>") + "</label></li>";
    }).join("") + "</ul>";
  }
  var saved = load("cp-plan", {});
  var weeks = Object.assign({}, defaults, saved.weeks || {});
  $("plan-submit").value = saved.submit || iso(addDays(today, 7 * 26));
  $("plan-review").value = saved.review || "";

  /* ICE review cycles: shared by the Route page and the planner */
  var CYC = window.ICE_CYCLES || [];
  var GROUPS = window.ICE_OTHER_GROUPS || [];
  var OTHER = (window.ICE_OTHER_DATES || []).map(function (d) {
    var grp = GROUPS.filter(function (x) { return x.g === d.g; })[0] || { label: d.g };
    return Object.assign({ id: d.g + "-" + d.application, label: grp.label, group: grp }, d);
  });
  var ALL = CYC.concat(OTHER);
  function opt(c, sel, text) {
    var closed = parse(c.application) < today;
    return '<option value="' + c.id + '"' + (closed ? " disabled" : "") + (c.id === sel ? " selected" : "") + ">" + esc(text) + " (apply by " + fmt(parse(c.application)) + (closed ? ", closed" : "") + ")</option>";
  }
  function cycOptions(sel) {
    var html = '<option value="">My own dates</option>' +
      '<optgroup label="Professional Review (CPR, IPR, CPRP, TPR, TRR Stage 2, CEPR)">' + CYC.map(function (c) { return opt(c, sel, c.label); }).join("") + "</optgroup>";
    GROUPS.forEach(function (grp) {
      var items = OTHER.filter(function (c) { return c.g === grp.g; });
      if (items.length) html += '<optgroup label="' + esc(grp.label) + '">' + items.map(function (c) { return opt(c, sel, grp.label + ", results by " + fmt(parse(c.result))); }).join("") + "</optgroup>";
    });
    return html;
  }
  function cycById(id) { return ALL.filter(function (c) { return c.id === id; })[0]; }
  var firstOpen = (CYC.filter(function (c) { return parse(c.application) >= today; })[0] || {}).id || "";
  var planCycle = saved.cycle !== undefined ? saved.cycle : firstOpen;
  if (planCycle && (!cycById(planCycle) || parse(cycById(planCycle).application) < today)) planCycle = firstOpen;
  $("plan-cycle").innerHTML = cycOptions(planCycle);
  function applyCycle(id) {
    planCycle = id; var c = cycById(id);
    if (c) { $("plan-submit").value = c.application; $("plan-review").value = c.review || ""; }
  }
  if (planCycle && saved.cycle === undefined) applyCycle(planCycle);
  $("plan-cycle").addEventListener("change", function () { applyCycle(this.value); renderPlan(); });
  $("plan-submit").addEventListener("input", function () { var c = cycById(planCycle); if (c && this.value !== c.application) { planCycle = ""; $("plan-cycle").value = ""; } });

  /* Route page key dates: pick a review type, then a date for it */
  $("key-dates-src").href = window.ICE_DATES_SOURCE || "#";
  var TYPES = [{ g: "pr", label: "Professional Review (CPR, IPR, CPRP, TPR, TRR Stage 2, CEPR)", desc: "The review itself, for Chartered (CPR) or Incorporated (IPR) membership and ICE's other review types. ICE uses one set of dates for all of them." }].concat(GROUPS);
  function itemsOf(g) { return g === "pr" ? CYC : OTHER.filter(function (c) { return c.g === g; }); }
  $("route-type").innerHTML = TYPES.map(function (t) { return '<option value="' + t.g + '">' + esc(t.label) + "</option>"; }).join("");
  function fillRouteDates() {
    var g = $("route-type").value, t = TYPES.filter(function (x) { return x.g === g; })[0] || {};
    $("route-type-desc").textContent = t.desc || "";
    var items = itemsOf(g), open = items.filter(function (c) { return parse(c.application) >= today; });
    var sel = (open[0] || {}).id || "";
    $("route-cycle").innerHTML = (open.length ? "" : '<option value="">No open deadlines published</option>') + items.map(function (c) { return opt(c, sel, g === "pr" ? c.label : "Results by " + fmt(parse(c.result))); }).join("");
    $("route-plan").hidden = !open.length;
    renderRouteCycle();
  }
  function renderRouteCycle() {
    var c = cycById($("route-cycle").value); if (!c) { $("route-cycle-table").innerHTML = ""; return; }
    var rows = c.group ? [["Assessment", c.label], ["Application closes", fmt(parse(c.application))]].concat(c.exam ? [["Exam", c.exam]] : []).concat([["Results issued by", fmt(parse(c.result))], ["Note", c.group.note || ""]])
      : [["Supervisor or sponsor sign-off by", fmt(parse(c.sponsors))], ["Application closes", fmt(parse(c.application))], ["Online reviews", c.window], ["In-person reviews", c.inPerson]];
    var weeksLeft = Math.round((parse(c.application) - today) / DAY / 7);
    rows.push(["Time until the application closes", weeksLeft > 0 ? weeksLeft + " weeks" : "Closed"]);
    $("route-cycle-table").innerHTML = rows.map(function (r) { return "<tr><td>" + esc(r[0]) + "</td><td>" + esc(r[1]) + "</td></tr>"; }).join("");
  }
  $("route-type").addEventListener("change", fillRouteDates);
  $("route-cycle").addEventListener("change", renderRouteCycle);
  $("route-plan").addEventListener("click", function () {
    var id = $("route-cycle").value; $("plan-cycle").value = id; applyCycle(id); renderPlan();
  });
  fillRouteDates();

  function renderDurations() {
    function row(s) { return '<div class="dur"><span class="sw" style="background:' + s.c + '"></span><label for="w-' + s.id + '">' + esc(s.t) + '</label><input type="number" min="0" max="52" step="1" id="w-' + s.id + '" data-id="' + s.id + '" value="' + weeks[s.id] + '" aria-label="' + esc(s.t) + ', weeks"></div>'; }
    $("plan-durations").innerHTML = '<div class="dur"><span class="grp">Before you submit, in weeks</span></div>' + PLAN.before.map(row).join("") +
      '<div class="dur"><span class="grp">Before your review, in weeks</span></div>' + PLAN.after.map(row).join("") +
      '<div class="dur"><span class="sw" style="background:var(--line)"></span><label for="w-gap">Submission to review, if you don\'t have a date yet</label><input type="number" min="1" max="52" step="1" id="w-gap" data-id="gap" value="' + weeks.gap + '"></div>';
  }

  var openPh = load("cp-phases", {});
  function wk(n) { return n + (n === 1 ? " wk" : " wks"); }
  function advice(s) {
    var mine = weeks[s.id], sug = defaults[s.id], before = s.id === "mock" ? " before review" : "";
    var basis = s.src ? "ICE" : "suggested";
    return { short: "(" + wk(mine) + before + (mine !== sug ? "; " + basis + " " + sug : s.src ? ", ICE guidance" : "") + ")",
      long: (mine !== sug ? "Your plan: " + wk(mine) + before + ". " : "") + (s.src ? s.src + "." : "Suggested: " + wk(sug) + before + " (our guide, not an ICE requirement).") };
  }
  function buildPlan() {
    var submit = parse($("plan-submit").value); if (!submit) return null;
    var review = parse($("plan-review").value);
    var reviewAssumed = !review; if (!review) review = addDays(submit, weeks.gap * 7);
    var items = [], end = submit;
    for (var i = PLAN.before.length - 1; i >= 0; i--) {
      var s = PLAN.before[i], start = addDays(end, -weeks[s.id] * 7);
      items.unshift({ s: s, start: start, end: end }); end = start;
    }
    PLAN.after.forEach(function (s) {
      var st = addDays(review, -weeks[s.id] * 7);
      if (s.id === "mock") st = addDays(review, -weeks[s.id] * 7), items.push({ s: s, start: st, end: addDays(st, 7) });
      else items.push({ s: s, start: st < submit ? submit : st, end: review });
    });
    return { submit: submit, review: review, reviewAssumed: reviewAssumed, items: items, startAll: items[0].start };
  }

  function renderPlan() {
    var p = buildPlan(); if (!p) { $("plan-list").innerHTML = '<li><span></span><span class="small">Enter a submission date to see your plan.</span></li>'; return; }
    var weeksLeft = Math.round((p.startAll - today) / DAY / 7);
    $("plan-summary").textContent = p.startAll < today ? "Start date has passed" : "Start in " + weeksLeft + " week" + (weeksLeft === 1 ? "" : "s");
    $("plan-summary").className = "small mono" + (p.startAll < today ? " warn" : "");
    var cyS = cycById(planCycle);
    $("ps-sum").textContent = (cyS ? cyS.label : "My own dates") + " · submit by " + fmt(parse($("plan-submit").value));

    var cyR = cycById(planCycle);
    var win = cyR && cyR.reviewWindow && !cyR.group ? [parse(cyR.reviewWindow[0]), parse(cyR.reviewWindow[1])] : null;
    var reviewKind = p.reviewAssumed ? "assumed" : cyR && cyR.review === $("plan-review").value ? "cycle" : "own";
    var lo = Math.min(p.startAll, today), hi = Math.max(p.review.getTime(), win ? win[1].getTime() : 0); var span = Math.max(hi - lo, DAY);
    function pct(d) { return ((d - lo) / span * 100).toFixed(2) + "%"; }
    var ticks = [], t = new Date(new Date(lo).getFullYear(), new Date(lo).getMonth() + 1, 1);
    var stepM = span / DAY > 400 ? 3 : span / DAY > 200 ? 2 : 1;
    while (t <= hi) { ticks.push(t); t = new Date(t.getFullYear(), t.getMonth() + stepM, 1); }
    var reviewName = reviewKind === "own" ? "Review day" : reviewKind === "cycle" ? "First in-person review" : "Review (assumed)";
    var lines =
      '<span class="g-line" style="left:' + pct(p.submit) + '" title="Submission"></span><span class="g-line review" style="left:' + pct(p.review) + '" title="' + reviewName + '"></span>' +
      (today >= lo && today <= hi ? '<span class="g-line today" style="left:' + pct(today) + '" title="Today"></span>' : "");
    var flagLeft = (p.review - lo) / span < 0.35;
    function rowHtml(it, open) {
      var ad = advice(it.s), changed = weeks[it.s.id] !== defaults[it.s.id];
      return '<div class="g-row g-child' + (open ? "" : " shut") + '"><span class="g-label" title="' + esc(it.s.t + " " + ad.short + ". " + fmt(it.start) + " to " + fmt(it.end)) + '"><span class="g-name">' + esc(it.s.t) + (changed ? ' <span class="g-dot" aria-label="duration changed from the suggestion"></span>' : "") + '</span></span><div class="g-track"><span class="g-bar" title="' + esc(fmt(it.start) + " to " + fmt(it.end)) + '" style="left:' + pct(it.start) + ";width:calc(" + pct(it.end) + " - " + pct(it.start) + ");background:" + it.s.c + '"></span>' + lines + "</div></div>";
    }
    $("plan-gantt").innerHTML = '<div class="g-row"><span></span><div class="g-axis"><span class="g-flag' + (flagLeft ? " left" : "") + '" style="left:' + pct(p.review) + '">' + esc(reviewName) + " " + fmt(p.review) + "</span></div></div>" +
      '<div class="g-row"><span></span><div class="g-axis">'  + ticks.map(function (d) { return '<span class="g-tick" style="left:' + pct(d) + '">' + MONTHS[d.getMonth()] + (d.getMonth() === 0 ? " " + d.getFullYear() : "") + "</span>"; }).join("") + "</div></div>" +
      PLAN.phases.map(function (ph) {
        var kids = p.items.filter(function (it) { return ph.steps.indexOf(it.s.id) >= 0; });
        if (!kids.length) return "";
        var st = new Date(Math.min.apply(null, kids.map(function (k) { return k.start; }))), en = new Date(Math.max.apply(null, kids.map(function (k) { return k.end; })));
        if (ph.steps.length === 1) {
          var it1 = kids[0], ad1 = advice(it1.s);
          return '<div class="g-row g-sum-row"><span class="g-label" title="' + esc(it1.s.t + " " + ad1.short + ". " + fmt(it1.start) + " to " + fmt(it1.end)) + '"><span class="g-name"><span class="caret" aria-hidden="true"></span> ' + esc(ph.t) + (weeks[it1.s.id] !== defaults[it1.s.id] ? ' <span class="g-dot" aria-label="duration changed from the suggestion"></span>' : "") + '</span><span class="g-wk">' + fmt(st).replace(/ \d{4}$/, "") + " to " + fmt(en).replace(/ \d{4}$/, "") + "</span></span>" +
            '<div class="g-track"><span class="g-sum" style="left:' + pct(st) + ";width:calc(" + pct(en) + " - " + pct(st) + ')"></span>' + lines + "</div></div>";
        }
        var open = !!openPh[ph.id];
        return '<div class="g-row g-sum-row"><button type="button" class="g-label g-toggle" data-ph="' + ph.id + '" aria-expanded="' + open + '" title="' + esc(ph.t + ": " + wk(Math.round((en - st) / DAY / 7)) + ", " + kids.length + " tasks. Click to " + (open ? "hide" : "show") + " them.") + '"><span class="g-name"><span class="caret" aria-hidden="true">' + (open ? "\u25BE" : "\u25B8") + "</span> " + esc(ph.t) + '</span><span class="g-wk">' + fmt(st).replace(/ \d{4}$/, "") + " to " + fmt(en).replace(/ \d{4}$/, "") + "</span></button>" +
          '<div class="g-track"><span class="g-sum" style="left:' + pct(st) + ";width:calc(" + pct(en) + " - " + pct(st) + ')"></span>' + lines + "</div></div>" +
          kids.map(function (it) { return rowHtml(it, open); }).join("");
      }).join("") +
      '<div class="legend"><span><span class="sw" style="background:var(--ink)"></span>Submission</span><span><span class="sw dash"></span>' + esc(reviewName) + '</span><span><span class="sw" style="background:var(--flag)"></span>Today</span></div>';

    var rows = p.items.map(function (it) { return { d: it.start, x: { t: it.s.t + " " + advice(it.s).short, at: it.s.id, name: it.s.t, c: it.s.c, past: it.end < today, k: "Stage", s: it.start, e: it.end, n: it.s.d + " " + advice(it.s).long }, html: '<li class="' + (it.end < today ? "past" : "") + '"><span class="sw" style="background:' + it.s.c + '"></span><strong>' + esc(it.s.t) + '</strong><span class="when">' + fmt(it.start) + " to " + fmt(it.end) + '</span><span class="what">' + esc(it.s.d) + ' <em class="advice">' + esc(advice(it.s).long) + "</em></span></li>", txt: fmt(it.start) + " to " + fmt(it.end) + ": " + it.s.t + " " + advice(it.s).short }; });
    var cy = cycById(planCycle);
    if (cy && cy.result) rows.push({ d: parse(cy.result), x: { t: "ICE results issued by", k: "ICE date", s: parse(cy.result), n: cy.label }, html: '<li class="milestone"><span class="sw" style="background:var(--ink)"></span><strong>ICE results issued by</strong><span class="when">' + fmt(parse(cy.result)) + '</span><span class="what">' + esc(cy.label) + ".</span></li>", txt: fmt(parse(cy.result)) + ": " + cy.label + " results (ICE)" });
    if (cy && cy.sponsors) rows.push({ d: parse(cy.sponsors), x: { t: "Supervisor or sponsor sign-off deadline", k: "ICE date", s: parse(cy.sponsors), n: "ICE's sponsors closing date for the " + cy.label + "." }, html: '<li class="milestone"><span class="sw" style="background:var(--ink)"></span><strong>Supervisor or sponsor sign-off deadline</strong><span class="when">' + fmt(parse(cy.sponsors)) + '</span><span class="what">ICE\'s sponsors closing date for the ' + esc(cy.label) + ".</span></li>", txt: fmt(parse(cy.sponsors)) + ": Sponsor sign-off deadline (ICE)" });
    rows.push({ d: p.submit, x: { at: "apply", t: "Submit your application", k: cy ? "ICE date" : "Milestone", s: p.submit, n: cy ? "Application closing date" : "Your own date" }, html: '<li class="milestone"><span class="sw" style="background:var(--ink)"></span><strong>Submit your application</strong><span class="when">' + fmt(p.submit) + "</span></li>", txt: fmt(p.submit) + ": Submit your application" });
    rows.push({ d: p.review, x: { t: "Professional review", k: p.reviewAssumed ? "Milestone (assumed)" : "Milestone", s: p.review, n: p.reviewAssumed ? "Assumed date: no review date entered." : cy && !cy.group ? "First in-person date; online dates vary." : "" }, html: '<li class="milestone"><span class="sw" style="background:var(--ink)"></span><strong>Professional review' + (p.reviewAssumed ? " (assumed date)" : cy ? " (first in-person date; online dates vary)" : "") + '</strong><span class="when">' + fmt(p.review) + "</span></li>", txt: fmt(p.review) + ": Professional review" + (p.reviewAssumed ? " (assumed)" : "") });
    rows.sort(function (a, b) { return a.d - b.d; });
    function li(x) {
      var stage = x.k === "Stage";
      var note = x.n || "";
      if (x.t === "Professional review" && win) note += (note ? " " : "") + "ICE's review window runs from " + fmt(win[0]) + " to " + fmt(win[1]) + ". Enter your own date in the form once ICE confirms it.";
      return '<li class="' + (stage ? (x.past ? "past" : "") : "milestone") + '"><span class="sw" style="background:' + (stage ? x.c : "var(--ink)") + '"></span><strong>' + esc(stage ? x.name : x.t) + '</strong><span class="when">' + fmt(x.s) + (x.e ? " to " + fmt(x.e) : "") + "</span>" +
        (note ? '<details class="more-info"><summary>Details</summary><p>' + esc(note) + "</p></details>" : "") + (x.at ? chkHtml(x.at) : "") + "</li>";
    }
    /* The visible list is rolled up by phase; exports keep every sub-stage */
    var listRows = rows.filter(function (r) { return r.x.k !== "Stage"; }).map(function (r) { return { d: r.d, html: li(r.x) }; });
    PLAN.phases.forEach(function (ph) {
      var kids = p.items.filter(function (it) { return ph.steps.indexOf(it.s.id) >= 0; }); if (!kids.length) return;
      var st = new Date(Math.min.apply(null, kids.map(function (k) { return k.start; }))), en = new Date(Math.max.apply(null, kids.map(function (k) { return k.end; })));
      var sub = '<ol class="sub-stages">' + kids.map(function (it) {
        return '<li><span class="sw" style="background:' + it.s.c + '"></span><span><strong>' + esc(it.s.t) + '</strong> <span class="when">' + fmt(it.start) + " to " + fmt(it.end) + "</span><br><span class=\"what\">" + esc(it.s.d) + " " + esc(advice(it.s).long) + "</span></span></li>";
      }).join("") + "</ol>";
      listRows.push({ d: st, html: '<li class="' + (en < today ? "past" : "") + '"><span class="sw" style="background:' + kids[0].s.c + '"></span><strong>' + esc(ph.t) + '</strong><span class="when">' + fmt(st) + " to " + fmt(en) + '</span><details class="more-info"><summary>' + kids.length + " sub-stages</summary>" + sub + "</details>" + chkHtml(ph.id) + "</li>" });
    });
    listRows.sort(function (a, b) { return a.d - b.d; });
    $("plan-list").innerHTML = listRows.map(function (r) { return r.html; }).join("");
    $("chk-count").textContent = CHK.filter(function (c) { return chkTicks[c.id]; }).length + " of " + CHK.length + " checklist items done";
    $("plan-expand").textContent = PLAN.phases.filter(function (ph) { return ph.steps.length > 1; }).every(function (ph) { return openPh[ph.id]; }) ? "Collapse all" : "Expand all";
    renderPlan.rows = rows.map(function (r) { return r.x; });
    renderPlan.route = planRouteLabel();
    $("plan-print-head").innerHTML = "<h2>My ICE chartership plan</h2><p>" + esc(renderPlan.route) + " &middot; Submit by " + fmt(p.submit) + " &middot; Review " + fmt(p.review) + (p.reviewAssumed ? " (assumed)" : "") + "</p><p class=\"small\">Made " + fmt(today) + " with Civil Chartered Path. Durations are suggestions, not ICE requirements; confirm dates at " + esc(window.ICE_DATES_SOURCE || "") + "</p>";
    renderPlan.text = "My CEng plan\n" + rows.map(function (r) { return "- " + r.txt; }).join("\n");
    save("cp-plan", { submit: $("plan-submit").value, review: $("plan-review").value, weeks: weeks, cycle: planCycle });
  }

  renderDurations();
  $("plan-form").addEventListener("input", function (e) {
    var id = e.target.dataset && e.target.dataset.id;
    if (id) { var v = parseInt(e.target.value, 10); weeks[id] = isNaN(v) ? 0 : Math.max(0, Math.min(52, v)); }
    renderPlan();
  });
  $("plan-form").addEventListener("submit", function (e) { e.preventDefault(); });
  $("plan-reset").addEventListener("click", function () { weeks = Object.assign({}, defaults); renderDurations(); renderPlan(); });
  $("plan-gantt").addEventListener("click", function (e) {
    var b = e.target.closest("[data-ph]"); if (!b) return;
    openPh[b.dataset.ph] = !openPh[b.dataset.ph]; save("cp-phases", openPh); renderPlan();
  });
  $("plan-expand").addEventListener("click", function () {
    var all = PLAN.phases.filter(function (ph) { return ph.steps.length > 1; }).every(function (ph) { return openPh[ph.id]; });
    PLAN.phases.forEach(function (ph) { openPh[ph.id] = !all; }); save("cp-phases", openPh); renderPlan();
  });
  $("plan-copy").addEventListener("click", function () { copyText(renderPlan.text || "", $("plan-copied")); });
  function planRouteLabel() {
    var c = cycById(planCycle);
    if (!c) return "My own dates";
    return c.group ? c.label + ", apply by " + fmt(parse(c.application)) : "Professional Review, " + c.label;
  }
  function download(name, type, text) {
    var blob = new Blob([text], { type: type }), a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }
  function weeksBetween(a, b) { return Math.round((b - a) / DAY / 7); }
  $("plan-csv").addEventListener("click", function () {
    var rows = renderPlan.rows || []; if (!rows.length) return;
    function cell(v) { v = String(v == null ? "" : v); return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; }
    var lines = [["My ICE chartership plan"], ["Route", renderPlan.route], ["Made", iso(today)], [],
      ["Step", "Type", "Start", "End", "Weeks", "Details"]].concat(rows.map(function (r) {
      return [r.t, r.k, iso(r.s), r.e ? iso(r.e) : "", r.e ? weeksBetween(r.s, r.e) : "", r.n || ""];
    }));
    download("chartership-plan.csv", "text/csv;charset=utf-8", "\ufeff" + lines.map(function (l) { return l.map(cell).join(","); }).join("\r\n"));
    $("plan-copied").textContent = "Downloaded chartership-plan.csv. It opens in Excel.";
  });
  $("plan-ics").addEventListener("click", function () {
    var rows = renderPlan.rows || []; if (!rows.length) return;
    function d(x) { return iso(x).replace(/-/g, ""); }
    function fold(l) { var out = []; while (l.length > 70) { out.push(l.slice(0, 70)); l = l.slice(70); } out.push(l); return out.join("\r\n "); }
    function t(v) { return String(v || "").replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n"); }
    var stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d+/, "");
    var ev = rows.map(function (r, i) {
      return ["BEGIN:VEVENT", "UID:cp-" + d(r.s) + "-" + i + "@civilcharteredpath", "DTSTAMP:" + stamp, "DTSTART;VALUE=DATE:" + d(r.s),
        "DTEND;VALUE=DATE:" + d(r.e && r.e > r.s ? r.e : addDays(r.s, 1)), "SUMMARY:" + t((r.e ? "" : "\u25C6 ") + r.t), "DESCRIPTION:" + t((r.n || "") + " (" + renderPlan.route + ")"), "END:VEVENT"].map(fold).join("\r\n");
    });
    download("chartership-plan.ics", "text/calendar;charset=utf-8", ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Civil Chartered Path//Planner//EN", "CALSCALE:GREGORIAN"].concat(ev).concat(["END:VCALENDAR"]).join("\r\n") + "\r\n");
    $("plan-copied").textContent = "Downloaded chartership-plan.ics. Open it to add the dates to your calendar.";
  });
  window.addEventListener("beforeprint", function () { Array.prototype.forEach.call(document.querySelectorAll("#plan-list details"), function (d) { d.dataset.wasOpen = d.open ? "1" : ""; d.open = true; }); });
  window.addEventListener("afterprint", function () { Array.prototype.forEach.call(document.querySelectorAll("#plan-list details"), function (d) { d.open = !!d.dataset.wasOpen; }); });
  $("plan-pdf").addEventListener("click", function () {
    var old = document.title; document.title = "chartership-plan";
    window.print(); setTimeout(function () { document.title = old; }, 1000);
  });
  renderPlan();
  /* Used by the home page welcome step to set the target cycle */
  window.CPPlan = {
    setCycle: function (id) { var c = cycById(id); if (!c) return; $("plan-cycle").value = id; applyCycle(id); renderPlan(); },
    cycle: function () { return planCycle; }
  };

  $("plan-list").addEventListener("change", function (e) { var id = e.target.dataset && e.target.dataset.chk; if (!id) return; chkTicks[id] = e.target.checked; save("cp-checklist", chkTicks); renderPlan(); });

  /* ICE forms */
  $("forms-list").innerHTML = (window.ICE_FORMS || []).map(function (f) {
    return '<li><a href="' + esc(f.url) + '" target="_blank" rel="noopener">' + esc(f.t) + "</a><span>" + esc(f.d) + "</span></li>";
  }).join("");

  /* ---------- Flashcards ---------- */
  var labels = ["Opening"].concat(window.ATTRIBUTES.map(function (a) { return a.title; })).concat(["Current affairs"]);
  var deckOf = function (a) { return a === 0 ? "Review format" : a === 8 ? "Current affairs" : a + ". " + labels[a]; };
  var CARDS = window.QUESTIONS.map(function (q, i) { return { id: "q" + i, deck: deckOf(q.a), sub: q.a > 0 && q.a < 8 ? "Attribute " + q.a + ": " + labels[q.a] : labels[q.a], q: q.q, a: q.p }; })
    .concat(window.FACT_CARDS.map(function (c, i) { return { id: "f" + i, deck: c.deck, sub: c.deck, q: c.q, a: c.a }; }));
  var DECKS0 = ["All"]; CARDS.forEach(function (c) { if (DECKS0.indexOf(c.deck) < 0) DECKS0.push(c.deck); });
  DECKS0 = ["All", "Review format"].concat(DECKS0.filter(function (d) { return /^Attribute/.test(d); }).sort()).concat(DECKS0.filter(function (d) { return d !== "All" && d !== "Review format" && !/^Attribute/.test(d); }));
  var DECKS = DECKS0, MINE = [];
  /* Decks that suit the visitor's role come straight after "All" (nothing is hidden) */
  function orderDecks() {
    var r = window.CPRole && CPRole.role();
    var sd = window.CPSectors ? CPSectors.decks() : [];
    MINE = (r ? r.decks : []).concat(sd).filter(function (d, i, arr) { return DECKS0.indexOf(d) > -1 && arr.indexOf(d) === i; });
    DECKS = ["All"].concat(MINE).concat(DECKS0.filter(function (d) { return d !== "All" && MINE.indexOf(d) < 0; }));
    var n = $("fc-role-note");
    if (n) n.innerHTML = MINE.length ? "Decks outlined in coral suit your " + (r ? "role (" + esc(r.label.toLowerCase()) + ")" + (sd.length ? " and sector" : "") : "sector") + ' and come first. <a href="#">Change on the home page</a>.' : r ? "" : 'Tip: <a href="#">set your role and sector on the home page</a> to put the decks that suit you first.';
  }
  orderDecks();
  var marks = load("cp-cards", {}), deck = "All", order = [], pos = 0, flipped = false;

  function build() {
    var list = CARDS.filter(function (c) { return (deck === "All" || c.deck === deck) && (!$("fc-only").checked || marks[c.id] !== "known"); });
    if ($("fc-shuffle").checked) { for (var i = list.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = list[i]; list[i] = list[j]; list[j] = t; } }
    order = list; pos = 0; flipped = false; renderCard();
  }
  function renderDecks() {
    $("fc-decks").innerHTML = DECKS.map(function (d) { var n = d === "All" ? CARDS.length : CARDS.filter(function (c) { return c.deck === d; }).length; return '<button type="button" aria-pressed="' + (d === deck) + '"' + (MINE.indexOf(d) > -1 ? ' class="fc-decks-mine"' : "") + ' data-d="' + esc(d) + '">' + esc(d) + '<span class="c">' + n + "</span></button>"; }).join("");
  }
  function renderCard() {
    var known = CARDS.filter(function (c) { return marks[c.id] === "known"; }).length, again = CARDS.filter(function (c) { return marks[c.id] === "review"; }).length;
    $("fc-stats").textContent = known + " known · " + again + " to review";
    var c = order[pos];
    if (!c) { $("fc-card").innerHTML = '<p class="fc-q">Nothing left in this deck.</p><p class="fc-hint">Untick "Only cards to review" or pick another deck.</p>'; return; }
    var m = marks[c.id];
    $("fc-card").innerHTML = '<div class="fc-meta"><span class="deck">' + esc(c.sub) + "</span><span>" + (m ? '<span class="pill ' + m + '">' + (m === "known" ? "Known" : "Review again") + "</span> " : "") + (pos + 1) + " / " + order.length + '</span></div><p class="fc-q">' + esc(c.q) + "</p>" +
      (flipped ? '<div class="fc-a">' + esc(c.a) + "</div>" : '<p class="fc-hint">Answer out loud, then tap the card or press Space to check.</p>');
  }
  function move(d) { if (!order.length) return; pos = (pos + d + order.length) % order.length; flipped = false; renderCard(); }
  function mark(v) { var c = order[pos]; if (!c) return; marks[c.id] = v; save("cp-cards", marks); move(1); }
  $("fc-decks").addEventListener("click", function (e) { var b = e.target.closest("button"); if (!b) return; deck = b.dataset.d; renderDecks(); build(); });
  $("fc-card").addEventListener("click", function () { flipped = !flipped; renderCard(); });
  $("fc-prev").addEventListener("click", function () { move(-1); });
  $("fc-next").addEventListener("click", function () { move(1); });
  $("fc-know").addEventListener("click", function () { mark("known"); });
  $("fc-again").addEventListener("click", function () { mark("review"); });
  $("fc-only").addEventListener("change", build);
  $("fc-shuffle").addEventListener("change", build);
  $("fc-reset").addEventListener("click", function () { marks = {}; save("cp-cards", marks); build(); });
  document.addEventListener("keydown", function (e) {
    if ($("view-flashcards").hidden || /INPUT|TEXTAREA|SELECT/.test(e.target.tagName) || (e.target.tagName === "BUTTON" && e.key === " ")) return;
    if (e.key === " ") { e.preventDefault(); flipped = !flipped; renderCard(); }
    else if (e.key === "ArrowRight") move(1); else if (e.key === "ArrowLeft") move(-1);
    else if (e.key === "k" || e.key === "K") mark("known"); else if (e.key === "r" || e.key === "R") mark("review");
  });
  renderDecks(); build();
  if (window.CPRole) CPRole.on(function () { orderDecks(); renderDecks(); });
  if (window.CPSectors) CPSectors.on(function () { orderDecks(); renderDecks(); });

  /* ---------- Latest news feed ---------- */
  var PAGE = 10, FEED = window.NEWS_FEED || { items: [] }, shown = PAGE;
  FEED.items = FEED.items.slice().sort(function (a, b) { return (b.date || "").localeCompare(a.date || ""); });
  var srcs = ["All sources"]; FEED.items.forEach(function (i) { if (srcs.indexOf(i.src) < 0) srcs.push(i.src); });
  $("feed-src").innerHTML = srcs.map(function (s) { return "<option>" + esc(s) + "</option>"; }).join("");
  $("feed-updated").textContent = FEED.generated ? "Updated " + fmt(parse(FEED.generated)) : "";
  /* Sector tags come from tools/refresh_news.py; anything untagged counts as Other */
  /* Cross-sector topics that map to a chartership attribute */
  var TOPIC_ATTR = {
    "Health and safety": [[4], "Use a prosecution or incident here to test your own site: what went wrong, which duty under CDM it touches, and what you would have done. That's evidence for"],
    "Digital and technology": [[1], "A tool or method you've used, or assessed and rejected, makes good evidence for"],
    "Materials and carbon": [[1, 5], "Choosing or trialling a lower-carbon material is evidence for"]
  };
  function tagsOf(i) { return i.tags && i.tags.length ? i.tags : ["Other"]; }
  var MYS = window.CPSectors ? CPSectors.get() : [];
  function inMine(i) { return tagsOf(i).some(function (t) { return MYS.indexOf(t) > -1; }); }
  var sector = MYS.length ? "My sectors" : "All", sectorCount = {};
  FEED.items.forEach(function (i) { tagsOf(i).forEach(function (t) { sectorCount[t] = (sectorCount[t] || 0) + 1; }); });
  var sectors = Object.keys(sectorCount).sort(function (a, b) { return a === "Other" ? 1 : b === "Other" ? -1 : sectorCount[b] - sectorCount[a]; });
  function renderSectors() {
    var mineN = FEED.items.filter(inMine).length;
    $("feed-sectors").innerHTML = ["All"].concat(MYS.length ? ["My sectors"] : []).concat(sectors).map(function (t) {
      return '<button type="button" data-sector="' + esc(t) + '" aria-pressed="' + (t === sector) + '"' + (t === "My sectors" ? ' class="my-sec" title="' + esc(MYS.join(", ")) + '"' : "") + ">" + esc(t) + ' <span class="n">' + (t === "All" ? FEED.items.length : t === "My sectors" ? mineN : sectorCount[t]) + "</span></button>";
    }).join("");
  }
  $("feed-sectors").addEventListener("click", function (e) { var b = e.target.closest("[data-sector]"); if (!b) return; sector = b.dataset.sector; shown = PAGE; renderSectors(); renderFeed(); });
  renderSectors();
  function renderFeed() {
    var s = $("feed-src").value, q = $("feed-search").value.trim().toLowerCase();
    var list = FEED.items.filter(function (i) { return (s === "All sources" || i.src === s) && (sector === "All" || (sector === "My sectors" ? inMine(i) : tagsOf(i).indexOf(sector) > -1)) && (!q || i.t.toLowerCase().indexOf(q) > -1); });
    $("feed").innerHTML = list.slice(0, shown).map(function (i) {
      return '<li><div style="display:flex;flex-direction:column;gap:2px"><span class="src">' + esc(i.src) + '</span><span class="date">' + (i.date ? fmt(parse(i.date)) : "") + '</span></div><div class="feed-item"><a href="' + esc(i.url) + '" target="_blank" rel="noopener">' + esc(i.t) + '</a><span class="tags">' + tagsOf(i).map(function (t) { return '<span class="tag">' + esc(t) + "</span>"; }).join("") + "</span></div></li>";
    }).join("") || '<li><span class="small">No headlines match.</span></li>';
    var ta = TOPIC_ATTR[sector], note = $("feed-attr");
    if (!note) { note = document.createElement("p"); note.id = "feed-attr"; note.className = "feed-attr"; $("feed").parentNode.insertBefore(note, $("feed")); }
    note.hidden = !ta;
    if (ta) note.innerHTML = ta[1] + " " + ta[0].map(function (n) { var a = window.ATTRIBUTES[n - 1]; return '<a href="#attributes-' + n + '">Attribute ' + n + ": " + esc(a.title) + "</a>"; }).join(" and ") + ".";
    var left = list.length - Math.min(shown, list.length);
    $("feed-more").hidden = left <= 0;
    $("feed-more").textContent = "Show " + Math.min(PAGE, left) + " older headline" + (Math.min(PAGE, left) === 1 ? "" : "s");
    $("feed-count").textContent = list.length ? "Showing " + Math.min(shown, list.length) + " of " + list.length + (sector !== "All" || s !== "All sources" || q ? " matching" : "") : "";
    $("feed-less").hidden = shown <= PAGE;
  }
  $("feed-src").addEventListener("change", function () { shown = PAGE; renderFeed(); });
  $("feed-search").addEventListener("input", function () { shown = PAGE; renderFeed(); });
  $("feed-more").addEventListener("click", function () { shown += PAGE; renderFeed(); });
  $("feed-less").addEventListener("click", function () { shown = PAGE; renderFeed(); $("feed").scrollIntoView({ block: "start" }); });
  renderFeed();
  if (window.CPSectors) CPSectors.on(function (l) { MYS = l; sector = MYS.length ? "My sectors" : sector === "My sectors" ? "All" : sector; shown = PAGE; renderSectors(); renderFeed(); });
})();
