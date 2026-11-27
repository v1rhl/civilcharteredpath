(function () {
  "use strict";
  var S = window.SITE, A = window.ATTRIBUTES, R = window.ROUTE, T = window.TIPS,
      Q = window.QUESTIONS, REF = window.REFERENCE, N = window.NEWS,
      EX = window.EXAMPLE_THREADS, CATS = window.FORUM_CATEGORIES;

  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function ext(url, text) { return '<a href="' + esc(url) + '" target="_blank" rel="noopener">' + esc(text) + "</a>"; }

  /* Level the visitor is aiming for: IEng or CEng. Remembered in this browser; CEng by default. */
  var LEVEL = (function () { try { return localStorage.getItem("cp-level") === "ieng" ? "ieng" : "ceng"; } catch (e) { return "ceng"; } })();
  var levelHooks = [];
  function lvName(l) { return (l || LEVEL) === "ieng" ? "IEng MICE" : "CEng MICE"; }
  function drawLevelPickers() {
    Array.prototype.forEach.call(document.querySelectorAll(".level-pick"), function (el) {
      el.innerHTML = '<span class="lp-label">Aiming for</span>' + ["ieng", "ceng"].map(function (l) {
        return '<button type="button" data-level="' + l + '" aria-pressed="' + (l === LEVEL) + '">' + (l === "ieng" ? "IEng" : "CEng") + "</button>";
      }).join("");
    });
    Array.prototype.forEach.call(document.querySelectorAll('[data-lv="title"]'), function (el) { el.textContent = lvName(); });
    document.documentElement.setAttribute("data-level", LEVEL);
    Array.prototype.forEach.call(document.querySelectorAll('[data-lv="rv"]'), function (el) { el.textContent = LEVEL === "ieng" ? "Incorporated" : "Chartered"; });
    var wc = document.querySelector('[data-lv="wheel-copy"]');
    if (wc) wc.textContent = LEVEL === "ieng"
      ? "ICE reviewers check your evidence against seven attributes. For IEng, you show you can maintain and manage current technology: managing teams and quality, applying sound methods and independent judgement. Pick one to see the IEng bar and graded example answers."
      : "ICE reviewers check your evidence against seven attributes. For CEng, each one asks for more than the IEng level: leading rather than assisting, improving rather than applying. Pick one to see the CEng bar and graded example answers.";
  }
  function setLevel(l) {
    LEVEL = l === "ieng" ? "ieng" : "ceng";
    try { localStorage.setItem("cp-level", LEVEL); } catch (e) {}
    drawLevelPickers(); levelHooks.forEach(function (f) { f(); });
  }
  document.addEventListener("click", function (e) { var b = e.target.closest("button[data-level]"); if (b) setLevel(b.dataset.level); });
  drawLevelPickers();
  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }

  $("updated").textContent = S.updated;

  /* Light / dark mode: follows the system until the visitor picks one */
  var root = document.documentElement, mq = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;
  function isDark() { var t = root.getAttribute("data-theme"); return t ? t === "dark" : !!(mq && mq.matches); }
  function syncToggle() {
    var d = isDark(), b = $("theme-toggle");
    root.classList.toggle("is-dark", d);
    var next = d ? "light" : "dark";
    b.setAttribute("aria-label", "Switch to " + next + " mode"); b.title = "Switch to " + next + " mode";
    b.querySelector(".tt-label").textContent = d ? "Light" : "Dark";
  }
  $("theme-toggle").addEventListener("click", function () {
    var t = isDark() ? "light" : "dark";
    root.setAttribute("data-theme", t); store("cp-theme", t); syncToggle();
  });
  if (mq && mq.addEventListener) mq.addEventListener("change", syncToggle);
  syncToggle();

  /* Home cards, each with a small line drawing */
  var ICONS = {
    route: '<path d="M3 19h18"/><path d="M4 16c4-1 6-4 9-7s5-4 7-5"/><circle cx="4" cy="16" r="1.6"/><circle cx="12" cy="10" r="1.6"/><circle cx="20" cy="4" r="1.6"/>',
    attributes: '<path d="M12 3l7.8 3.8 1.9 8.4-5.4 6.8H8.7l-5.4-6.8 1.9-8.4z"/><circle cx="12" cy="12" r="2.2"/>',
    review: '<rect x="3" y="4" width="18" height="11" rx="1.5"/><path d="M8 20h8M12 15v5"/><path d="M7 11l3-3 2 2 4-4"/>',
    questions: '<path d="M4 5h16v11H9l-5 4z"/><path d="M10 9a2 2 0 1 1 2.8 1.8c-.5.3-.8.7-.8 1.2"/><path d="M12 14.2h.01"/>',
    reference: '<path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z"/><path d="M5 17a3 3 0 0 1 3-3h11"/><path d="M9 8h6"/>',
    planner: '<rect x="3" y="4" width="18" height="16" rx="1.5"/><path d="M6 9h6M9 13h7M13 17h5"/>',
    flashcards: '<rect x="7" y="3" width="14" height="11" rx="1.5"/><path d="M4 7v11a2 2 0 0 0 2 2h11"/>',
    check: '<path d="M6 3h9l4 4v14H6z"/><path d="M15 3v4h4"/><path d="M9 14l2 2 4-4"/>',
    news: '<rect x="3" y="5" width="15" height="15" rx="1.5"/><path d="M18 9h3v9a2 2 0 0 1-2 2"/><path d="M6 9h9M6 13h9M6 17h6"/>'
  };
  function icon(k) { return '<svg class="card-icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" style="stroke:var(--accent)">' + (ICONS[k] || "") + "</svg>"; }
  var homeCards = [
    ["The route", "Six stages from graduate member to CEng MICE, and where people usually get stuck.", "route"],
    ["Review day", "Practical advice on the presentation, interview and communication task.", "review"],
    ["Practice questions", Q.length + " questions reviewers ask, with what a good answer covers.", "questions"],
    ["Submission planner", "Enter your deadline and get a dated plan worked back from it, with PDF, Excel and calendar downloads.", "planner"],
    ["Flashcards", "Revise the attributes, the Code of Conduct, ICE history, contracts, H&S and current affairs.", "flashcards"],
    ["Latest news", "Headlines from NCE, ICE and other sources, plus a monthly briefing by sector.", "news"]
  ];
  if ($("home-cards")) $("home-cards").innerHTML = homeCards.map(function (c) {
    return '<a class="panel home-card" href="#' + c[2] + '">' + icon(c[2]) + "<h3>" + esc(c[0]) + "</h3><p>" + esc(c[1]) + '</p><span class="more">Open</span></a>';
  }).join("");

  /* ---------- Home: one-stop shop ---------- */
  function hload(k, d) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }
  function hsave(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  var MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  function pd(v) { var p = v.split("-"); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function fd(d) { return d.getDate() + " " + MON[d.getMonth()] + " " + d.getFullYear(); }
  var now = new Date(); now = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  /* Next open ICE deadline (or the visitor's chosen cycle) */
  function drawDeadline() {
    var open = (window.ICE_CYCLES || []).filter(function (x) { return pd(x.application) >= now; });
    var mine = window.CPPlan && CPPlan.cycle(), c = open.filter(function (x) { return x.id === mine; })[0] || open[0], isMine = c && c.id === mine && open.length > 1;
    if (!c) { $("home-deadline").innerHTML = '<span class="eyebrow">Next ICE deadline</span><p>ICE hasn\'t published the next review dates yet.</p><a class="more" href="' + esc(window.ICE_DATES_SOURCE || "#") + '" target="_blank" rel="noopener">Check ICE key dates</a>'; return; }
    var days = Math.round((pd(c.application) - now) / 864e5), wks = Math.floor(days / 7), rem = days % 7;
    $("home-deadline").innerHTML = '<span class="eyebrow">Next ICE application deadline</span>' +
      '<div class="big">' + wks + '<small>week' + (wks === 1 ? "" : "s") + (rem ? " " + rem + " day" + (rem === 1 ? "" : "s") : "") + " to go</small></div>" +
      '<strong>' + esc(c.label) + " (Professional Review)</strong>" +
      "<dl><dt>Sponsors sign off by</dt><dd>" + fd(pd(c.sponsors)) + "</dd><dt>Application closes</dt><dd>" + fd(pd(c.application)) + "</dd><dt>In-person reviews from</dt><dd>" + fd(pd(c.review)) + "</dd></dl>" +
      '<div style="display:flex;gap:8px;flex-wrap:wrap"><a class="btn" href="#planner">Plan back from this date</a><a class="btn ghost" href="#route">Other ICE dates</a></div>';
    if (isMine) $("home-deadline").querySelector(".eyebrow").textContent = "Your target: application deadline";
  }
  drawDeadline();

  /* Welcome step: route, role and target cycle. Shown until answered or skipped; never required. */
  (function () {
    var el = $("welcome"); if (!el) return;
    var state = store("cp-welcome"), editing = !state, compact = !state && window.matchMedia && window.matchMedia("(max-width: 700px)").matches;
    var open = (window.ICE_CYCLES || []).filter(function (x) { return pd(x.application) >= now; }).slice(0, 4);
    var pick = { level: store("cp-level") ? LEVEL : "", role: window.CPRole ? CPRole.get() : "", cycle: store("cp-wl-cycle") || "" };
    function secs() { return window.CPSectors ? CPSectors.get() : []; }
    function opts(name, items) {
      return '<div class="wl-opts" role="group" aria-label="' + esc(name) + '">' + items.map(function (it) {
        return '<button type="button" data-wk="' + it[0] + '" data-wv="' + esc(it[1]) + '" aria-pressed="' + (pick[it[0]] === it[1]) + '">' + it[2] + "</button>";
      }).join("") + "</div>";
    }
    function draw() {
      if (!editing) {
        var r = window.CPRole && CPRole.role(), cy = window.CPPlan && CPPlan.cycle(), c = store("cp-wl-cycle") === cy ? open.filter(function (x) { return x.id === cy; })[0] : null;
        if (store("cp-welcome") === "skipped" && !r && !secs().length) { el.innerHTML = '<div class="wl-summary"><span>Using the defaults (' + (LEVEL === "ieng" ? "IEng" : "CEng") + ', no role)</span><button type="button" class="linkish" id="wl-change">Set the site up for you</button></div>'; return; }
        el.innerHTML = '<div class="wl-summary"><span>Set up for</span><span class="chip">' + (LEVEL === "ieng" ? "IEng" : "CEng") + "</span>" +
          (r ? '<span class="chip r">' + esc(r.label) + "</span>" : "") + secs().map(function (x) { return '<span class="chip s">' + esc(CPSectors.label(x)) + "</span>"; }).join("") + (c ? '<span class="chip">' + esc(c.label) + "</span>" : "") +
          '<button type="button" class="linkish" id="wl-change">Change</button></div>';
        return;
      }
      var R = window.ROLES || [];
      if (compact) { el.innerHTML = '<button type="button" class="btn ghost wl-open" id="wl-open">Personalise the site in 4 taps</button>'; return; }
      el.innerHTML = '<div class="wl-card"><div class="wl-head"><strong>Set the site up for you</strong><span class="small muted">Four quick questions, all optional. Saved in this browser only.</span></div>' +
        '<div class="wl-q"><span><span class="n">1</span>Which route are you on?</span>' + opts("Route", [["level", "ceng", "Chartered (CEng)"], ["level", "ieng", "Incorporated (IEng)"]]) + '<a class="small" href="#route">Not sure? Compare the routes</a></div>' +
        '<div class="wl-q"><span><span class="n">2</span>What\'s your role?</span>' + opts("Role", R.map(function (x) { return ["role", x.id, esc(x.label)]; })) + "</div>" +
        '<div class="wl-q"><span><span class="n">3</span>When do you want your review?</span>' + opts("Review cycle", open.map(function (c) { return ["cycle", c.id, esc(c.label) + "<small>apply by " + fd(pd(c.application)) + "</small>"]; }).concat([["cycle", "later", "Not decided yet"]])) + "</div>" +
        '<div class="wl-q"><span><span class="n">4</span>Your sector? <span class="small muted" style="font-weight:400">Pick any that apply</span></span><div class="wl-opts" role="group" aria-label="Sector">' +
          (window.SECTORS || []).map(function (x) { return '<button type="button" data-ws="' + esc(x.id) + '" aria-pressed="' + (secs().indexOf(x.id) > -1) + '">' + esc(x.label) + "</button>"; }).join("") +
          '<button type="button" data-ws="" aria-pressed="' + (!secs().length) + '">General or mixed</button></div></div>' +
        '<div class="wl-actions"><button type="button" class="btn" id="wl-done">Done</button><button type="button" class="linkish" id="wl-skip" style="margin-left:0">Skip for now</button></div>' +
        '<p class="small muted" style="margin:0">This tailors the attributes, review day timings, planner, news, cheat sheet and flashcards. Nothing is hidden, and you can change it any time.</p></div>';
    }
    el.addEventListener("click", function (e) {
      var sb = e.target.closest("[data-ws]");
      if (sb) {
        var id = sb.dataset.ws, cur = secs();
        if (!id) cur = []; else if (cur.indexOf(id) > -1) cur.splice(cur.indexOf(id), 1); else cur.push(id);
        CPSectors.set(cur); draw(); var fb = el.querySelector('[data-ws="' + id + '"]'); if (fb) fb.focus(); return;
      }
      var b = e.target.closest("[data-wk]");
      if (b) {
        var k = b.dataset.wk, v = b.dataset.wv; pick[k] = v;
        if (k === "level") setLevel(v);
        if (k === "role" && window.CPRole) CPRole.set(v);
        if (k === "cycle") { store("cp-wl-cycle", v); if (v !== "later" && window.CPPlan) { CPPlan.setCycle(v); drawDeadline(); } }
        draw(); var nb = el.querySelector('[data-wk="' + k + '"][data-wv="' + v + '"]'); if (nb) nb.focus();
        return;
      }
      if (e.target.closest("#wl-done")) { store("cp-welcome", "done"); if (!store("cp-level")) setLevel(LEVEL); editing = false; draw(); var c = $("wl-change"); if (c) c.focus(); return; }
      if (e.target.closest("#wl-open")) { compact = false; draw(); var f1 = el.querySelector("[data-wk]"); if (f1) f1.focus(); return; }
      if (e.target.closest("#wl-skip")) { store("cp-welcome", "skipped"); editing = false; draw(); return; }
      if (e.target.closest("#wl-change")) { editing = true; pick.level = LEVEL; pick.role = window.CPRole ? CPRole.get() : ""; pick.cycle = store("cp-wl-cycle") || ""; draw(); var f = el.querySelector("[data-wk]"); if (f) f.focus(); }
    });
    levelHooks.push(function () { if (!editing) draw(); });
    if (window.CPRole) CPRole.on(function () { if (!editing) draw(); });
    draw();
  })();

  /* Start here: next steps by stage (this site's suggestions) */
  var STAGES = [
    { id: "deciding", t: "Thinking about it", steps: [
      ["Understand the route", "The six stages from graduate member to CEng MICE, and how long they usually take.", "#route", "See the route"],
      ["Learn the seven attributes", "What reviewers look for, and how CEng differs from IEng, with graded example answers.", "#attributes", "Explore the attributes"],
      ["Talk to your supervisor or mentor", "Agree how you'll complete your IPD and when you might aim to apply. ICE's forms and guidance are linked in the planner.", "#planner", "ICE forms and guidance"] ] },
    { id: "evidence", t: "Building my evidence", steps: [
      ["Map your experience to the attributes", "Find your best example for each attribute and spot the gaps early.", "#attributes", "Check the attributes"],
      ["Keep your CPD current", "Cover ICE's three mandatory themes and record what you learned.", "#flashcards", "Revise with flashcards"],
      ["Follow the industry", "Reviewers expect current awareness. Ten minutes a week is enough.", "#news", "Read this week's news"] ] },
    { id: "writing", t: "Writing my report", steps: [
      ["Pick your deadline and plan back", "The planner dates every stage from ICE's deadline, with PDF and calendar downloads.", "#planner", "Open the planner"],
      ["Write to the attributes", "Use 'I', give numbers, and show judgement. Compare your draft with the graded examples.", "#attributes", "See example answers"],
      ["Line up sign-off", "Sponsors, MDO meeting and IPD completion take weeks. Tick them off in the submission checklist.", "#planner", "Submission checklist"] ] },
    { id: "review", t: "My review is booked", steps: [
      ["Know the format", "Presentation, interview and the written communication task: ICE's rules and our advice.", "#review", "Review day guide"],
      ["Practise questions out loud", "The questions reviewers ask, with what a good answer covers.", "#questions", "Practice questions"],
      ["Revise little and often", "Code of Conduct, H&S, contracts, sustainability and current affairs.", "#flashcards", "Flashcards"] ] }
  ];
  /* Line icons for the journey track: survey level, blocks of evidence, report, review panel, finished bridge */
  var JICON = [
    '<path d="M12 9V4M8 3h8M12 9l-6 12M12 9l6 12M9 15h6"/>',
    '<path d="M4 14h7v6H4zM13 14h7v6h-7zM8.5 7h7v6h-7z"/>',
    '<path d="M6 3h9l4 4v14H6zM15 3v4h4M9 11h7M9 15h7M9 19h4"/>',
    '<path d="M3 4h18v11H3zM12 15v5M8 20h8M7 11l3-3 3 2 4-4"/>',
    '<path d="M2 19h20M4 19v-6M20 19v-6M4 13q8-9 16 0M8 19v-4.5M12 19v-6M16 19v-4.5"/>'
  ];
  var stage = hload("cp-stage", "deciding");
  if (!STAGES.some(function (x) { return x.id === stage; })) stage = "deciding";
  function renderStage() {
    var cur = 0; STAGES.forEach(function (x, i) { if (x.id === stage) cur = i; });
    $("stage-tabs").innerHTML = STAGES.map(function (x, i) {
      var st = i < cur ? "done" : i === cur ? "now" : i === cur + 1 ? "next" : "later";
      return '<button type="button" role="tab" class="j-' + st + '" data-stage="' + x.id + '" aria-selected="' + (i === cur) + '"><svg viewBox="0 0 24 24" aria-hidden="true">' + JICON[i] + "</svg><span>" + esc(x.t) + "</span>" +
        (st === "now" ? '<em>You are here</em>' : st === "next" ? "<em>Next</em>" : "") + "</button>";
    }).join("") + '<a class="j-goal" href="#route"><svg viewBox="0 0 24 24" aria-hidden="true">' + JICON[4] + "</svg><span>Chartered</span><em>The goal</em></a>";
    var st = STAGES.filter(function (x) { return x.id === stage; })[0];
    $("stage-steps").innerHTML = st.steps.map(function (k) { return "<li><strong>" + esc(k[0]) + "</strong><p>" + esc(k[1]) + '</p><a href="' + k[2] + '">' + esc(k[3]) + " &rarr;</a></li>"; }).join("");
  }
  $("stage-tabs").addEventListener("click", function (e) { var b = e.target.closest("[data-stage]"); if (!b) return; stage = b.dataset.stage; hsave("cp-stage", stage); renderStage(); });
  renderStage();
  $("go-start").addEventListener("click", function (e) { e.preventDefault(); $("start-here").scrollIntoView({ behavior: "smooth", block: "start" }); });

  /* Your progress, from what this browser has saved */
  function renderProgress() {
    var plan = hload("cp-plan", {}), ticks = hload("cp-checklist", {}), marks = hload("cp-cards", {});
    var chkTotal = (window.SUBMIT_CHECKLIST || []).length, chkDone = (window.SUBMIT_CHECKLIST || []).filter(function (c) { return ticks[c.id]; }).length;
    var cardTotal = (window.QUESTIONS || []).length + (window.FACT_CARDS || []).length, known = Object.keys(marks).filter(function (k) { return marks[k] === "known"; }).length;
    function tile(href, lbl, val, pct, hint) {
      return '<a class="panel" href="' + href + '"><span class="lbl">' + lbl + '</span><span class="val">' + val + "</span>" + (pct != null ? '<span class="bar"><span style="width:' + Math.round(pct * 100) + '%"></span></span>' : "") + '<span class="hint">' + hint + "</span></a>";
    }
    $("home-progress").innerHTML =
      tile("#planner", "Your plan", plan.submit ? "Submit by " + fd(pd(plan.submit)) : "Not set yet", null, plan.submit ? "Open the planner to see this week's stage." : "Pick an ICE deadline and get a dated plan.") +
      tile("#planner", "Submission checklist", chkDone + " of " + chkTotal + " done", chkTotal ? chkDone / chkTotal : 0, chkDone ? "Keep going." : "Tick items off as you get them in place.") +
      tile("#flashcards", "Flashcards", known + " of " + cardTotal + " known", cardTotal ? known / cardTotal : 0, "Saved in this browser only.");
  }
  renderProgress();
  window.addEventListener("hashchange", function () { if (location.hash === "" || location.hash === "#home") renderProgress(); });

  /* A flashcard to try */
  var POOL = (window.FACT_CARDS || []).map(function (c) { return { deck: c.deck, q: c.q, a: c.a }; });
  var cur = null, shown = false;
  function nextCard() { cur = POOL[Math.floor(Math.random() * POOL.length)]; shown = false; drawCard(); }
  function drawCard() {
    if (!cur) return;
    $("home-card").innerHTML = '<span class="deck">' + esc(cur.deck) + '</span><span class="q">' + esc(cur.q) + "</span>" + (shown ? '<span class="a">' + esc(cur.a) + "</span>" : "") + '<span class="hint">' + (shown ? "Tap for the question only" : "Tap to see the answer") + "</span>";
  }
  $("home-card").addEventListener("click", function () { shown = !shown; drawCard(); });
  $("home-card-next").addEventListener("click", nextCard);
  if (POOL.length) nextCard();

  /* Seven attributes wheel */
  (function () {
    if (!$("home-wheel")) return;
    var short = ["Engineering", "Management and leadership", "Commercial", "Health, safety and welfare", "Sustainable development", "Communication", "Professional commitment"];
    var cx = 230, cy = 150, r = 100, out = "";
    var pts = short.map(function (_, i) { var a = -Math.PI / 2 + i * 2 * Math.PI / 7; return [cx + r * Math.cos(a), cy + r * Math.sin(a), a]; });
    out += '<polygon points="' + pts.map(function (p) { return p[0].toFixed(1) + "," + p[1].toFixed(1); }).join(" ") + '" fill="none" stroke-dasharray="3 3" style="stroke:var(--line)"/>';
    pts.forEach(function (p) { out += '<line x1="' + cx + '" y1="' + cy + '" x2="' + p[0].toFixed(1) + '" y2="' + p[1].toFixed(1) + '" style="stroke:var(--line)"/>'; });
    out += '<circle cx="' + cx + '" cy="' + cy + '" r="34" style="fill:var(--accent)"/><text x="' + cx + '" y="' + (cy - 2) + '" text-anchor="middle" font-weight="700" font-size="15" style="fill:var(--accent-ink)" id="wheel-level">' + (LEVEL === "ieng" ? "IEng" : "CEng") + '</text><text x="' + cx + '" y="' + (cy + 13) + '" text-anchor="middle" font-size="9" style="fill:var(--accent-ink)">MICE</text>';
    pts.forEach(function (p, i) {
      var t = (window.ATTRIBUTES[i] || {}).title || short[i];
      var lx = cx + (r + 26) * Math.cos(p[2]), ly = cy + (r + 26) * Math.sin(p[2]);
      var anchor = Math.abs(Math.cos(p[2])) < 0.2 ? "middle" : Math.cos(p[2]) > 0 ? "start" : "end";
      out += '<a href="#attributes" data-attr="' + i + '"><title>' + esc(t) + '</title><circle cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '" r="15" stroke-width="2" style="fill:var(--surface);stroke:var(--accent)"/><text x="' + p[0].toFixed(1) + '" y="' + (p[1] + 4.5).toFixed(1) + '" text-anchor="middle" font-weight="700" font-size="13" style="fill:var(--accent)">' + (i + 1) + "</text>" +
        '<text class="wl" x="' + lx.toFixed(1) + '" y="' + (ly + 4).toFixed(1) + '" text-anchor="' + anchor + '" font-size="11" style="fill:var(--ink)">' + esc(short[i]) + "</text></a>";
    });
    $("home-wheel").innerHTML = out;
    levelHooks.push(function () { var t = document.getElementById("wheel-level"); if (t) t.textContent = LEVEL === "ieng" ? "IEng" : "CEng"; });
    $("home-wheel-key").innerHTML = (window.ATTRIBUTES || []).map(function (a) { return "<li>" + esc(a.title) + "</li>"; }).join("");
  })();

  var latest = N[0];
  $("home-news").innerHTML = '<p class="small mono">' + esc(latest.week) + "</p>" + latest.items.slice(0, 3).map(function (i) {
    return '<div><strong>' + ext(i.url, i.t) + "</strong></div>";
  }).join("");

  /* Route */
  $("route-list").innerHTML = R.map(function (s, i) {
    var ch = i + "+000";
    return '<li><span class="ch">CH ' + ch + '</span><span class="rail"><span class="dot"></span></span><div class="body"><h3>' + esc(s.t) + "</h3><p>" + esc(s.d) + "</p></div></li>";
  }).join("");

  /* Attributes */
  var attrIdx = 0;
  var GR = { weak: "Weak", ok: "OK, but thin", good: "Good: IEng level", excellent: "Excellent: CEng level" };
  function renderExamples() {
    var x = (window.ATTR_EXAMPLES || [])[attrIdx]; if (!x) { $("attr-examples").innerHTML = ""; return; }
    var src = window.ICE_GUIDANCE_URL, uk = window.UKSPEC || {};
    $("attr-examples").innerHTML =
      '<div class="panel" style="gap:14px"><div><span class="eyebrow">IEng or CEng?</span><h3 style="margin-top:4px">What ICE asks for at each level</h3></div>' +
      '<p>ICE\'s guidance lists what Incorporated candidates must show, then adds "And ..." requirements for Chartered candidates. UK-SPEC sums up the difference: Incorporated Engineers <em>' + esc((uk.ieng || "").replace(/\.$/, "").toLowerCase()) + '</em>; Chartered Engineers <em>' + esc((uk.ceng || "").replace(/\.$/, "").toLowerCase()) + "</em>.</p>" +
      (function () {
        var ie = x.ieng.map(function (l) { return "<li>" + esc(l) + "</li>"; }).join(""), ce = x.ceng.map(function (l) { return "<li>" + esc(l) + "</li>"; }).join("");
        return LEVEL === "ieng"
          ? '<div class="levels"><div class="mine"><span class="eyebrow" style="color:var(--accent)">Your level: IEng must show</span><ul>' + ie + '</ul></div><div class="other"><span class="eyebrow">The step up: CEng also adds</span><ul>' + ce + "</ul></div></div>"
          : '<div class="levels"><div class="other"><span class="eyebrow">The baseline: IEng must show (CEng too)</span><ul>' + ie + '</ul></div><div class="mine"><span class="eyebrow" style="color:var(--accent)">Your level: CEng also adds</span><ul>' + ce + "</ul></div></div>";
      })() +
      '<p class="small">Quoted from ' + ext(src, "ICE professional review guidance") + ", Appendix A, " + esc(x.page) + ", and " + ext(uk.url, "UK-SPEC") + ".</p></div>" +
      '<div class="panel" style="gap:14px"><div style="display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap;align-items:baseline"><div><span class="eyebrow">Example answers</span><h3 style="margin-top:4px">&ldquo;' + esc(x.q) + '&rdquo;</h3></div><span class="flag">Illustrative</span></div>' +
      '<p class="small">These answers are written for this site to show the difference between levels. They are not real candidates\' words, and the projects and figures are made up.</p>' +
      '<div class="ladder">' + x.answers.map(function (r) { var tgt = (LEVEL === "ieng" && r.g === "good") || (LEVEL === "ceng" && r.g === "excellent"); return '<div class="rung ' + r.g + (tgt ? " is-target" : "") + '"><span class="grade">' + GR[r.g] + (tgt ? '<span class="target">Your target</span>' : "") + '</span><p class="ans">' + esc(r.a) + '</p><p class="why"><strong>Why:</strong> ' + esc(r.why) + "</p></div>"; }).join("") + "</div></div>";
  }
  levelHooks.push(function () { renderAttr(); });
  function renderAttr() {
    setTimeout(renderExamples, 0);
    $("attr-tabs").innerHTML = A.map(function (a, i) {
      var rl = window.CPRole && CPRole.role(), wk = rl && rl.weak.indexOf(a.n) > -1;
      return '<button type="button" role="tab" id="attr-tab-' + i + '" aria-selected="' + (i === attrIdx) + '" data-i="' + i + '"><span class="n">' + a.n + "</span>" + esc(a.short) + (wk ? '<span class="weak-dot" title="Often harder to evidence as a ' + esc(rl.short.toLowerCase()) + '"></span><span class="sr-only"> (often harder to evidence in your role)</span>' : "") + "</button>";
    }).join("");
    var a = A[attrIdx];
    $("attr-detail").innerHTML =
      '<div class="panel" style="gap:18px"><div><span class="eyebrow">Attribute ' + a.n + "</span><h3 style=\"font-size:1.4rem;margin-top:4px\">" + esc(a.title) + "</h3></div>" +
      '<div class="attr-detail"><div style="display:flex;flex-direction:column;gap:8px"><span class="eyebrow">Good evidence covers</span><ul>' +
      a.look.map(function (l) { return "<li>" + esc(l) + "</li>"; }).join("") + "</ul></div>" +
      (LEVEL === "ieng"
        ? '<div class="bar"><span class="eyebrow">The IEng bar</span><ul style="margin-top:4px">' + ((window.ATTR_EXAMPLES || [])[attrIdx] || { ieng: [] }).ieng.map(function (l) { return "<li>" + esc(l) + "</li>"; }).join("") + '</ul><p class="small" style="margin-top:6px">For CEng, ICE adds more: see the comparison below.</p></div></div>'
        : '<div class="bar"><span class="eyebrow">The chartered bar</span><p style="margin-top:4px">' + esc(a.ceng) + "</p></div></div>") +
      '<div style="display:flex;flex-direction:column;gap:8px"><span class="eyebrow">Test your own examples</span><ul style="margin:0;padding-left:1.1em;display:flex;flex-direction:column;gap:4px">' +
      a.prompts.map(function (p) { return "<li>" + esc(p) + "</li>"; }).join("") + "</ul></div>" +
      roleBox(a) +
      '<a class="more" href="#questions" data-attr="' + (attrIdx + 1) + '">Practice questions for this attribute</a></div>';
    renderRolePanel();
  }
  /* Role-tailored advice (our judgement, not ICE guidance) */
  function roleBox(a) {
    var r = window.CPRole && CPRole.role();
    if (!r || r.id === "other") return "";
    var weak = r.weak.indexOf(a.n) > -1, ev = r.evidence[a.n], tips = r.build[a.n] || [];
    return '<div class="role-box' + (weak ? " is-weak" : "") + '"><h4>' + (weak ? "Often harder to evidence as a " : "As a ") + esc(r.short.toLowerCase()) + "</h4>" +
      (ev ? "<p>" + esc(ev) + "</p>" : "") +
      (tips.length ? '<span class="eyebrow" style="color:var(--accent-2)">Ways to get the experience</span><ul>' + tips.map(function (t) { return "<li>" + esc(t) + "</li>"; }).join("") + "</ul>" : "") +
      '<p class="small">Our judgement from how roles usually work, not ICE guidance. Your own job may differ.</p></div>';
  }
  function renderRolePanel() {
    var el = $("role-panel"); if (!el) return;
    var r = window.CPRole && CPRole.role(), R = window.ROLES || [];
    var head = '<div class="rp-head"><div><span class="eyebrow">Your role</span><h3 style="margin-top:4px">' +
      (r && r.id !== "other" ? "What a " + esc(r.short.toLowerCase()) + " often finds harder to evidence" : r ? "A mix of roles" : "Tailor this page to your role") + '</h3></div><span class="flag">Our judgement</span></div>';
    var body;
    if (!r) body = "<p>Pick your role and each attribute will show what good evidence looks like from your seat, plus the attributes people in your role often struggle to evidence and practical ways to get that experience.</p>";
    else if (r.id === "other") body = "<p>With a mixed role, check yourself against every attribute. Commercial ability, health and safety and sustainability are the ones candidates most often find thin. The table below shows each role's view.</p>";
    else body = "<p>" + esc(r.label) + " roles usually give plenty of evidence for some attributes and less for others. Start early on the ones marked here: experience takes months to build, and thin attributes are a common reason for a deferral.</p>" +
      '<ul class="weak-chips">' + r.weak.map(function (n) { var a = A[n - 1]; return '<li><button type="button" data-goattr="' + (n - 1) + '">' + n + ". " + esc(a.short) + "</button></li>"; }).join("") + "</ul>";
    var tips = '<details class="role-compare"><summary>General ways to fill a gap</summary><ul style="margin:6px 0 0;padding-left:1.1em">' + (window.ROLE_TIPS || []).map(function (t) { return "<li>" + esc(t) + "</li>"; }).join("") + "</ul></details>";
    var table = '<details class="role-compare"><summary>Compare every role</summary><table><thead><tr><th>Role</th><th>Often harder to evidence</th></tr></thead><tbody>' +
      R.filter(function (x) { return x.id !== "other"; }).map(function (x) { return '<tr' + (r && r.id === x.id ? ' class="is-mine"' : "") + '><td><button type="button" class="linkish" data-role-view="' + x.id + '">' + esc(x.label) + "</button></td><td>" + x.weak.map(function (n) { return n + ". " + esc(A[n - 1].short); }).join(", ") + "</td></tr>"; }).join("") +
      '</tbody></table><p class="small" style="margin-top:6px">Choosing a role in the table switches this page to that role\'s view.</p></details>';
    el.innerHTML = head + '<div class="role-pick" role="group" aria-label="What\'s your role?"></div>' + body + tips + table;
    if (window.CPRole) CPRole.draw();
  }
  $("role-panel").addEventListener("click", function (e) {
    var g = e.target.closest("[data-goattr]"); if (g) { attrIdx = +g.dataset.goattr; renderAttr(); var t = $("attr-tab-" + attrIdx); if (t) t.focus(); return; }
    var v = e.target.closest("[data-role-view]"); if (v) CPRole.set(v.dataset.roleView);
  });
  if (window.CPRole) CPRole.on(function () { renderAttr(); });
  function goAttr(i) { if (i >= 0 && i < A.length && i !== attrIdx) { attrIdx = i; renderAttr(); } }
  $("attr-tabs").addEventListener("click", function (e) {
    var b = e.target.closest("button"); if (!b) return;
    attrIdx = +b.dataset.i; renderAttr();
    var t = $("attr-tab-" + attrIdx); if (t) t.focus();
  });
  $("attr-detail").addEventListener("click", function (e) {
    var l = e.target.closest("[data-attr]"); if (l) { $("q-filter").value = l.dataset.attr; renderQ(); }
  });
  renderAttr();
  if (window.matchMedia && window.matchMedia("(max-width: 1000px)").matches) $("sources-box").open = false;
  if (window.matchMedia && window.matchMedia("(max-width: 1200px)").matches) $("ice-res-box").open = false;
  /* Planner settings live in the right pane on wide screens, above the plan otherwise */
  var wideMq = window.matchMedia ? window.matchMedia("(min-width: 1201px)") : null;
  function placeSettings() {
    var ps = $("plan-settings"), aside = $("sources"), planner = document.querySelector("#view-planner .planner");
    if (!ps || !aside || !planner) return;
    if (wideMq && wideMq.matches) { if (ps.parentNode !== aside) aside.insertBefore(ps, aside.firstChild); ps.hidden = !document.body.classList.contains("on-planner"); }
    else { if (ps.parentNode !== planner) planner.insertBefore(ps, planner.firstChild); ps.hidden = false; }
  }
  if (wideMq) { if (wideMq.addEventListener) wideMq.addEventListener("change", placeSettings); else if (wideMq.addListener) wideMq.addListener(placeSettings); }

  /* Tips, each with a small line drawing */
  var TIP_ICONS = [
    '<rect x="5" y="3" width="11" height="15" rx="1.2"/><rect x="8" y="6" width="11" height="15" rx="1.2"/><path d="M11 11h5M11 14h5M11 17h3"/>',
    '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l3 2M9 2h6"/>',
    '<path d="M4 5h16v11H9l-5 4z"/><path d="M10 9a2 2 0 1 1 2.8 1.8c-.5.3-.8.7-.8 1.2"/><path d="M12 14.2h.01"/>',
    '<path d="M3 20h18"/><path d="M5 20v-6l7-8 7 8v6"/><path d="M15 4l5 5-9 9H6v-5z" transform="translate(0 0)" opacity="0"/><path d="M9 20v-5h6v5"/>',
    '<circle cx="8" cy="8" r="3"/><circle cx="16" cy="8" r="3"/><path d="M3 19c0-3 2-5 5-5s5 2 5 5M11 19c0-3 2-5 5-5s5 2 5 5"/>',
    '<circle cx="12" cy="7" r="3.5"/><path d="M5 21c0-4 3-7 7-7s7 3 7 7"/>',
    '<path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z"/><path d="M5 17a3 3 0 0 1 3-3h11"/><path d="M9 8h6"/>',
    '<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-4 10.5c.8.8 1 1.5 1 2.5h6c0-1 .2-1.7 1-2.5A6 6 0 0 0 12 3z"/>'
  ];
  function tipIcon(i) { return '<svg class="tip-ill" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" style="stroke:var(--accent)">' + (TIP_ICONS[i] || TIP_ICONS[2]) + "</svg>"; }
  /* Tips */
  if ($("tips")) $("tips").innerHTML = T.map(function (t, i) {
    return '<div class="panel tip">' + tipIcon(i) + '<div style="display:flex;flex-direction:column;gap:6px;min-width:0"><h3>' + esc(t.t) + "</h3><p>" + esc(t.d) + '</p><span class="src">Source: ' + ext(t.url, t.src) + "</span></div></div>";
  }).join("");

  /* Questions */
  var labels = ["Opening"].concat(A.map(function (a) { return a.n + " " + a.short; })).concat(["Current affairs"]);
  $("q-filter").innerHTML = '<option value="all">All</option>' + labels.map(function (l, i) { return '<option value="' + i + '">' + esc(l) + "</option>"; }).join("");
  function renderQ() {
    var f = $("q-filter").value, s = $("q-search").value.trim().toLowerCase();
    var list = Q.filter(function (q) {
      return (f === "all" || String(q.a) === f) && (!s || (q.q + " " + q.p).toLowerCase().indexOf(s) > -1);
    });
    $("q-count").textContent = list.length + " of " + Q.length;
    $("qlist").innerHTML = list.length ? list.map(function (q) {
      return '<details class="q"><summary><span class="tag">' + esc(labels[q.a]) + '</span><span class="qt">' + esc(q.q) + '</span><span class="chev" aria-hidden="true">&rsaquo;</span></summary><p class="pointer">' + esc(q.p) + "</p></details>";
    }).join("") : '<p class="small">No questions match. Try another attribute or search term.</p>';
  }
  $("q-filter").addEventListener("change", renderQ);
  $("q-search").addEventListener("input", renderQ);
  renderQ();

  /* News */
  $("news-list").innerHTML = N.map(function (w) {
    return '<div class="week"><div class="week-head"><h3 style="font-size:1.3rem">' + esc(w.week) + '</h3></div><div class="grid">' +
      w.items.map(function (i) {
        return '<div class="panel news-item"><div style="display:flex;gap:6px;flex-wrap:wrap"><span class="chip">' + esc(i.tag) + "</span>" + (i.headlineOnly ? '<span class="flag">Headline only</span>' : "") +
          "</div><h3>" + ext(i.url, i.t) + "</h3><p>" + esc(i.d) + "</p></div>";
      }).join("") + '</div><div class="bar"><span class="eyebrow">Using it in your review</span><p style="margin-top:4px">' + esc(w.angle) + "</p></div></div>";
  }).join("");

  /* Monthly briefing: the month's headlines grouped by sector (no generated summaries) */
  (function () {
    var seen = {}, all = [];
    ((window.NEWS_ARCHIVE || {}).items || []).concat(((window.NEWS_FEED || {}).items) || []).forEach(function (i) { if (i.date && !seen[i.url]) { seen[i.url] = 1; all.push(i); } });
    var MN = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    var months = []; all.forEach(function (i) { var m = i.date.slice(0, 7); if (months.indexOf(m) < 0) months.push(m); });
    var perMonth = {}; all.forEach(function (i) { var m = i.date.slice(0, 7); perMonth[m] = (perMonth[m] || 0) + 1; });
    months = months.filter(function (m) { return perMonth[m] >= 3; }); /* skip months with only a stray older story */
    months.sort().reverse();
    var cur = months[0], openSec = {};
    function label(m) { return MN[+m.slice(5, 7) - 1] + " " + m.slice(0, 4); }
    function draw() {
      $("month-pick").innerHTML = months.map(function (m) { return '<button type="button" data-m="' + m + '" aria-pressed="' + (m === cur) + '">' + label(m) + "</button>"; }).join("");
      var list = all.filter(function (i) { return i.date.slice(0, 7) === cur; }).sort(function (a, b) { return b.date.localeCompare(a.date); });
      var by = {}; list.forEach(function (i) { (i.tags && i.tags.length ? i.tags : ["Other"]).forEach(function (t) { (by[t] = by[t] || []).push(i); }); });
      var secs = Object.keys(by).sort(function (a, b) { return a === "Other" ? 1 : b === "Other" ? -1 : by[b].length - by[a].length; });
      var partial = cur === months[0] && window.NEWS_FEED && window.NEWS_FEED.generated && window.NEWS_FEED.generated.slice(0, 7) === cur;
      $("month-body").innerHTML = '<p class="month-lead"><strong>' + label(cur) + ":</strong> " + list.length + " stor" + (list.length === 1 ? "y" : "ies") + " across " + secs.length + " sectors" + (partial ? ", so far this month" : "") + ". A story can appear under more than one sector.</p>" +
        secs.map(function (sec) {
          var items = by[sec], open = openSec[cur + sec], show = open ? items : items.slice(0, 5);
          return '<section class="month-sec"><h4>' + esc(sec) + '<span class="n">' + items.length + "</span></h4><ul>" + show.map(function (i) {
            var d = i.date.split("-"); return '<li><span class="meta">' + (+d[2]) + " " + MN[+d[1] - 1].slice(0, 3) + " · " + esc(i.src) + "</span>" + ext(i.url, i.t) + "</li>";
          }).join("") + "</ul>" + (items.length > 5 ? '<button type="button" class="more-btn" data-sec="' + esc(sec) + '">' + (open ? "Show fewer" : "Show all " + items.length) + "</button>" : "") + "</section>";
        }).join("");
    }
    $("month-pick").addEventListener("click", function (e) { var b = e.target.closest("[data-m]"); if (!b) return; cur = b.dataset.m; draw(); });
    $("month-body").addEventListener("click", function (e) { var b = e.target.closest("[data-sec]"); if (!b) return; var k = cur + b.dataset.sec; openSec[k] = !openSec[k]; draw(); });
    if (cur) draw(); else $("monthly").hidden = true;
  })();

  /* Cheat sheet: talking points from the latest news weeks */
  (function () {
    var weeks = (window.NEWS || []).slice(0, 2);
    function drawTalk() {
      var items = [], mine = window.CPSectors ? CPSectors.get() : [];
      if (mine.length) ((window.NEWS_FEED || {}).items || []).slice().sort(function (a, b) { return a.date < b.date ? 1 : -1; }).forEach(function (it) {
        if (items.length < 3 && (it.tags || []).some(function (t) { return mine.indexOf(t) > -1; })) items.push({ tag: CPSectors.label((it.tags || []).filter(function (t) { return mine.indexOf(t) > -1; })[0]), url: it.url, t: it.t });
      });
      weeks.forEach(function (w) { w.items.forEach(function (it) { if (items.length < 6 && !items.some(function (x) { return x.url === it.url; })) items.push(it); }); });
      $("cs-news").innerHTML = items.map(function (it) { return "<li><strong>" + esc(it.tag) + ":</strong> " + ext(it.url, it.t) + "</li>"; }).join("");
    }
    drawTalk(); if (window.CPSectors) CPSectors.on(drawTalk);
    if (weeks[0]) $("cs-angle").innerHTML = "<strong>Angle:</strong> " + esc(weeks[0].angle);
    $("cs-print").addEventListener("click", function () { window.print(); });
    /* Export as communication task notes: a clean A4 document in a hidden frame, measured before it prints */
    function notesDoc() {
      var size = +$("cs-notes-size").value, src = document.querySelector("#view-cheat-sheet .cs").cloneNode(true);
      Array.prototype.forEach.call(src.querySelectorAll(".cs-off, .cs-empty, .cs-role, .cs-src, .no-print, textarea, " + (LEVEL === "ieng" ? ".only-ceng" : ".only-ieng")), function (el) { el.parentNode.removeChild(el); });
      Array.prototype.forEach.call(src.querySelectorAll("[hidden]"), function (el) { el.parentNode.removeChild(el); });
      var css = "@page{size:A4 portrait;margin:12mm}html,body{margin:0;padding:0;background:#fff}body{font-family:Arial,Helvetica,sans-serif;color:#111;font-size:" + size + "pt;line-height:1.25}" +
        ".cs{columns:2;column-gap:6mm;width:186mm}.cs-block{break-inside:avoid;border:1px solid #9aa;border-radius:2px;padding:2mm 3mm;margin:0 0 3mm}" +
        "h3{margin:0 0 1mm;font-size:" + (size + 1) + "pt;color:#0b5560}dl{display:grid;grid-template-columns:max-content minmax(0,1fr);gap:0.5mm 2.5mm;margin:0}dt{font-weight:700}dd{margin:0}" +
        "ol,ul{margin:0;padding-left:4.5mm}p{margin:1mm 0 0}a{color:inherit;text-decoration:none}.cs-note-print{display:block;white-space:pre-wrap}.cs-key{font-size:" + size + "pt}" +
        ".measure .cs{height:271mm;column-fill:auto}";
      return '<!doctype html><html lang="en-GB"><head><meta charset="utf-8"><title>Communication task reference notes</title><style>' + css + "</style></head><body>" + src.outerHTML + "</body></html>";
    }
    var frame = null;
    function withFrame(cb) {
      if (frame) document.body.removeChild(frame);
      frame = document.createElement("iframe"); frame.setAttribute("aria-hidden", "true"); frame.tabIndex = -1;
      frame.style.cssText = "position:absolute;left:-10000px;top:0;width:210mm;height:297mm;border:0;visibility:hidden";
      document.body.appendChild(frame);
      var d = frame.contentWindow.document; d.open(); d.write(notesDoc()); d.close();
      setTimeout(function () { cb(frame.contentWindow, d); }, 50);
    }
    function sidesIn(d) {
      d.body.classList.add("measure"); var cs = d.querySelector(".cs"), w = cs.getBoundingClientRect().width, g = 6 * 96 / 25.4;
      var cols = Math.max(1, Math.round((cs.scrollWidth + g) / ((w - g) / 2 + g))); d.body.classList.remove("measure");
      return Math.ceil(cols / 2);
    }
    function report(n) {
      var el = $("cs-notes-fit"); el.className = "small" + (n > 2 ? " cs-notes-fit-bad" : "");
      el.textContent = n > 2 ? "Too long: about " + n + " sides. Turn off sections or shorten your notes under Customise, or pick a smaller size." : "Fits on " + n + " side" + (n === 1 ? "" : "s") + " of A4.";
    }
    function notesCheck() { withFrame(function (w, d) { report(sidesIn(d)); }); }
    $("cs-notes-size").addEventListener("change", notesCheck);
    $("cs-notes-btn").addEventListener("click", function () {
      withFrame(function (w, d) { var n = sidesIn(d); report(n); if (n > 2) return; w.focus(); w.print(); });
    });
    window.CPNotesCheck = notesCheck; window.CPNotesDoc = notesDoc;
    function drawCsRole() {
      var r = window.CPRole && CPRole.role(), blk = document.querySelector('[data-cs="role"]');
      if (!r || r.id === "other") {
        $("cs-role-body").innerHTML = '<p class="small no-print">' + (r ? "With a mixed role, be ready on every attribute; commercial, H&amp;S and sustainability are most often thin." : "Pick your role above to add the attributes your role often finds harder, and what to have ready.") + "</p>";
        blk.classList.add("cs-empty"); $("cs-role-line").hidden = true; return;
      }
      blk.classList.remove("cs-empty");
      var ln = $("cs-role-line"); ln.hidden = false; ln.innerHTML = "<strong>" + esc(r.short) + ":</strong> have strong examples ready for " + r.weak.map(function (n) { return esc(A[n - 1].short); }).join(", ").replace(/, ([^,]*)$/, " and $1") + ", often thin in your role.";
      $("cs-role-body").innerHTML = "<p><strong>" + esc(r.label) + ":</strong> expect probing on " + r.weak.map(function (n) { return n + ". " + esc(A[n - 1].short); }).join(", ").replace(/, ([^,]*)$/, " and $1") + ".</p><ul>" +
        r.weak.map(function (n) { return "<li><strong>" + esc(A[n - 1].short) + ":</strong> " + esc(r.evidence[n].split(/[.:] /)[0].replace(/\.$/, "")) + ".</li>"; }).join("") + "</ul>";
    }
    drawCsRole(); if (window.CPRole) CPRole.on(drawCsRole);
    /* Customisable: section choice, order and own notes, saved in this browser */
    var wrap = document.querySelector("#view-cheat-sheet .cs");
    var blocks = {}; Array.prototype.forEach.call(wrap.querySelectorAll("[data-cs]"), function (b) { blocks[b.dataset.cs] = b; });
    var NAMES = { examples: "My project examples", facts: "Facts I keep forgetting" };
    Object.keys(blocks).forEach(function (k) { if (!NAMES[k]) NAMES[k] = blocks[k].querySelector("h3").textContent; });
    var DEFAULT = Object.keys(blocks).filter(function (k) { return k !== "examples" && k !== "facts"; }).concat(["examples", "facts"]);
    var cs = store("cp-cs"); try { cs = cs ? JSON.parse(cs) : null; } catch (e) { cs = null; }
    if (!cs || !cs.order) cs = { order: DEFAULT.slice(), off: {}, notes: {} };
    DEFAULT.forEach(function (k) { if (cs.order.indexOf(k) < 0) cs.order.push(k); });
    cs.order = cs.order.filter(function (k) { return blocks[k]; });
    function saveCs() { store("cp-cs", JSON.stringify(cs)); }
    function applyCs() {
      cs.order.forEach(function (k) { wrap.appendChild(blocks[k]); blocks[k].classList.toggle("cs-off", !!cs.off[k]); });
      ["examples", "facts"].forEach(function (k) {
        var v = cs.notes[k] || ""; var ta = blocks[k].querySelector("textarea");
        if (document.activeElement !== ta) ta.value = v;
        blocks[k].querySelector(".cs-note-print").textContent = v; blocks[k].classList.toggle("cs-empty", !v.trim());
      });
      $("cs-pick").innerHTML = cs.order.map(function (k, i) {
        return '<li><label><input type="checkbox" data-k="' + k + '"' + (cs.off[k] ? "" : " checked") + "> " + esc(NAMES[k]) + '</label><button type="button" data-up="' + i + '" aria-label="Move ' + esc(NAMES[k]) + ' up"' + (i === 0 ? " disabled" : "") + '>&uarr;</button><button type="button" data-down="' + i + '" aria-label="Move ' + esc(NAMES[k]) + ' down"' + (i === cs.order.length - 1 ? " disabled" : "") + ">&darr;</button></li>";
      }).join("");
      var on = cs.order.filter(function (k) { return !cs.off[k]; }).length;
      $("cs-fit").textContent = on + " of " + cs.order.length + " sections shown. Use Print to check it still fits one page.";
      if (window.CPNotesCheck) setTimeout(window.CPNotesCheck, 0);
    }
    $("cs-pick").addEventListener("change", function (e) { var k = e.target.dataset.k; if (!k) return; cs.off[k] = !e.target.checked; saveCs(); applyCs(); });
    $("cs-pick").addEventListener("click", function (e) {
      var b = e.target.closest("button"); if (!b) return;
      var i = +(b.dataset.up || b.dataset.down), j = b.dataset.up !== undefined ? i - 1 : i + 1;
      if (j < 0 || j >= cs.order.length) return;
      var tmp = cs.order[i]; cs.order[i] = cs.order[j]; cs.order[j] = tmp; saveCs(); applyCs();
      var nb = $("cs-pick").querySelector('[data-' + (b.dataset.up !== undefined ? "up" : "down") + '="' + j + '"]'); if (nb && !nb.disabled) nb.focus();
    });
    wrap.addEventListener("input", function (e) { var k = e.target.dataset && e.target.dataset.note; if (!k) return; cs.notes[k] = e.target.value; saveCs(); applyCs(); });
    $("cs-reset").addEventListener("click", function () { cs = { order: DEFAULT.slice(), off: {}, notes: cs.notes }; saveCs(); applyCs(); });
    applyCs();
  })();

  /* Presentation plan: saved in this browser */
  (function () {
    var box = $("pres-plan"); if (!box) return;
    var d = store("cp-pres"); try { d = d ? JSON.parse(d) : {}; } catch (e) { d = {}; }
    Array.prototype.forEach.call(box.querySelectorAll("[data-pk]"), function (el) { el.value = d[el.dataset.pk] || ""; });
    var t;
    box.addEventListener("input", function (e) { var k = e.target.dataset.pk; if (!k) return; d[k] = e.target.value; store("cp-pres", JSON.stringify(d)); clearTimeout(t); $("pres-saved").textContent = "Saved in this browser."; t = setTimeout(function () { $("pres-saved").textContent = ""; }, 2000); });
    $("pres-clear").addEventListener("click", function () { d = {}; store("cp-pres", "{}"); Array.prototype.forEach.call(box.querySelectorAll("[data-pk]"), function (el) { el.value = ""; }); $("pres-saved").textContent = "Cleared."; });
  })();

  /* Community (design only: posting disabled until a forum service is connected) */
  var catSel = -1;
  function renderForum() {
    $("cats").innerHTML = '<button type="button" aria-pressed="' + (catSel === -1) + '" data-i="-1"><strong>All categories</strong></button>' +
      CATS.map(function (c, i) { return '<button type="button" aria-pressed="' + (catSel === i) + '" data-i="' + i + '"><strong>' + esc(c.t) + "</strong><span>" + esc(c.d) + "</span></button>"; }).join("");
    var name = catSel === -1 ? null : CATS[catSel].t;
    var list = EX.filter(function (t) { return !name || name.indexOf(t.cat) > -1 || t.cat.indexOf(name) > -1; });
    $("thread-head").textContent = name ? name : "Example threads";
    $("threads").innerHTML = list.length ? list.map(function (t) {
      return '<li><div style="display:flex;flex-direction:column;gap:2px;min-width:0"><span class="meta">' + esc(t.cat) + "</span><strong>" + esc(t.t) + '</strong></div><span class="small mono">' + t.replies + " replies</span></li>";
    }).join("") : '<li><span class="small">No example threads in this category yet.</span></li>';
  }
  $("cats").addEventListener("click", function (e) { var b = e.target.closest("button"); if (!b) return; catSel = +b.dataset.i; renderForum(); });
  $("compose").addEventListener("submit", function (e) { e.preventDefault(); });
  renderForum();

  /* Tools: each tool script (js/tools/<id>.js, loaded before this file) registers itself in window.CP_TOOLS as
     { id, label, blurb } and supplies its own <section id="view-<id>">. The Tools nav item, its dropdown, the
     subnav and the #tools hub are all built from that list, so adding a tool never needs a change here. */
  var TOOLS = (window.CP_TOOLS || []).filter(function (t) { return t && t.id && $("view-" + t.id); });
  var toolIds = TOOLS.map(function (t) { return t.id; });
  (function () {
    var hub = $("tools-hub"), navA = document.querySelector('#nav a[href="#tools"]');
    if (navA) navA.dataset.group = ["tools"].concat(toolIds).join(" ");
    if (hub) hub.innerHTML = TOOLS.length ? TOOLS.map(function (t) {
      return '<a class="panel tool tool-card" href="#' + esc(t.id) + '"><h3>' + esc(t.label) + "</h3>" + (t.blurb ? "<p>" + esc(t.blurb) + "</p>" : "") + '<span class="more">Open ' + esc(t.label.toLowerCase()) + "</span></a>";
    }).join("") : '<p class="small">No tools yet.</p>';
  })();

  /* Routing on the hash */
  var views = ["home", "route", "careers", "resources", "attributes", "planner", "flashcards", "review", "presentation", "questions", "news", "check", "cheat-sheet", "community", "tools"].concat(toolIds);
  function route() {
    var v = (location.hash || "#home").slice(1).split("?")[0]; /* tools may pass parameters, e.g. #pipeflow?Q=12 */
    if (v === "reference") { v = "cheat-sheet"; history.replaceState(null, "", "#cheat-sheet"); }
    var am = /^attributes-([1-7])$/.exec(v); if (am) { v = "attributes"; goAttr(+am[1] - 1); }
    if (views.indexOf(v) < 0) v = "home";
    document.body.classList.toggle("on-cheat", v === "cheat-sheet");
    views.forEach(function (name) { $("view-" + name).hidden = name !== v; });
    Array.prototype.forEach.call(document.querySelectorAll("#nav a"), function (a) {
      if ((a.dataset.group || "").split(" ").indexOf(v) > -1) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
    });
    var SUB = { planner: [["planner", "Planner"], ["route", "The route"], ["careers", "Careers"], ["resources", "Resources"]], review: [["review", "Overview"], ["presentation", "Presentation tips"], ["flashcards", "Flashcards"], ["questions", "Practice questions"], ["cheat-sheet", "Cheat sheet"]],
      tools: [["tools", "All tools"]].concat(TOOLS.map(function (t) { return [t.id, t.label]; })) };
    var grp = ["planner", "route", "careers", "resources"].indexOf(v) > -1 ? "planner" : ["review", "presentation", "flashcards", "questions", "cheat-sheet"].indexOf(v) > -1 ? "review" : (v === "tools" || toolIds.indexOf(v) > -1) ? "tools" : "";
    $("subnav").hidden = !grp;
    $("subnav").innerHTML = grp ? SUB[grp].map(function (x) { return '<a href="#' + x[0] + '"' + (x[0] === v ? ' aria-current="page"' : "") + ">" + x[1] + "</a>"; }).join("") : "";
    var withSources = ["route", "attributes", "review", "presentation", "cheat-sheet", "planner"].indexOf(v) > -1;
    document.body.classList.toggle("on-planner", v === "planner");
    $("sources-box").hidden = v === "planner"; $("ice-res-box").hidden = v !== "planner";
    placeSettings();
    $("sources").setAttribute("aria-label", v === "planner" ? "ICE resources" : "Official sources");
    document.body.classList.toggle("with-sources", withSources);
    $("sources").hidden = !withSources;
    store("cp-last", v);
    window.scrollTo(0, 0);
  }
  window.addEventListener("hashchange", route);

  /* Dropdown menus on the top nav. Tap a section to open its list; tap it again (or pick an item) to go. */
  var MENUS = {
    planner: [["planner", "Planner"], ["route", "The route"], ["careers", "Careers"], ["resources", "Technical resources"]],
    attributes: [["attributes", "All seven attributes"]].concat(A.map(function (a, i) { return ["attributes-" + (i + 1), a.n + ". " + a.title]; })),
    review: [["review", "Overview"], ["presentation", "Presentation tips"], ["flashcards", "Revision flashcards"], ["questions", "Practice questions"], ["cheat-sheet", "Cheat sheet"]],
    tools: [["tools", "All tools"]].concat(TOOLS.map(function (t) { return [t.id, t.label]; }))
  };
  var nav = $("nav"), menu = document.createElement("div"), openFor = null;
  menu.id = "navmenu"; menu.className = "navmenu"; menu.hidden = true;
  nav.parentNode.appendChild(menu);
  Array.prototype.forEach.call(nav.querySelectorAll("a"), function (a) {
    var key = a.getAttribute("href").slice(1);
    if (MENUS[key]) { a.dataset.menu = key; a.setAttribute("aria-haspopup", "true"); a.setAttribute("aria-expanded", "false"); a.setAttribute("aria-controls", "navmenu"); }
  });
  function closeMenu() { if (!openFor) return; openFor.setAttribute("aria-expanded", "false"); openFor = null; menu.hidden = true; }
  function openMenu(a) {
    closeMenu(); openFor = a; a.setAttribute("aria-expanded", "true");
    var here = location.hash.slice(1).split("?")[0] || "home";
    menu.innerHTML = '<ul role="list">' + MENUS[a.dataset.menu].map(function (x) { return '<li><a href="#' + x[0] + '"' + (x[0] === here ? ' aria-current="page"' : "") + ">" + esc(x[1]) + "</a></li>"; }).join("") + "</ul>";
    menu.hidden = false;
    var bar = menu.parentNode.getBoundingClientRect(), r = a.getBoundingClientRect();
    if (window.innerWidth > 760) { menu.style.left = Math.max(8, Math.min(r.left - bar.left, bar.width - menu.offsetWidth - 8)) + "px"; menu.style.top = (r.bottom - bar.top + 4) + "px"; }
    else { menu.style.left = ""; menu.style.top = (r.bottom - bar.top + 4) + "px"; }
    var f = menu.querySelector("a"); if (f && document.activeElement === a && a.dataset.kbd) f.focus();
  }
  nav.addEventListener("click", function (e) {
    var a = e.target.closest("a[data-menu]"); if (!a) { closeMenu(); return; }
    if (openFor === a) { closeMenu(); return; } /* second tap: follow the link */
    e.preventDefault(); a.dataset.kbd = e.detail === 0 ? "1" : ""; openMenu(a);
  });
  menu.addEventListener("click", function (e) { var l = e.target.closest("a"); if (!l) return; closeMenu(); if (l.getAttribute("href") === location.hash) route(); });
  document.addEventListener("click", function (e) { if (openFor && !e.target.closest("#nav") && !e.target.closest("#navmenu")) closeMenu(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && openFor) { var a = openFor; closeMenu(); a.focus(); } });
  window.addEventListener("resize", closeMenu);
  window.addEventListener("hashchange", closeMenu);
  route();
})();
