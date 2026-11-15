(function () {
  "use strict";
  var S = window.SITE, A = window.ATTRIBUTES, R = window.ROUTE, T = window.TIPS,
      Q = window.QUESTIONS, REF = window.REFERENCE, N = window.NEWS,
      EX = window.EXAMPLE_THREADS, CATS = window.FORUM_CATEGORIES;

  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function ext(url, text) { return '<a href="' + esc(url) + '" target="_blank" rel="noopener">' + esc(text) + "</a>"; }
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
    ["Latest news", "Headlines from NCE, ICE and other sources, plus a weekly briefing.", "news"]
  ];
  $("home-cards").innerHTML = homeCards.map(function (c) {
    return '<a class="panel home-card" href="#' + c[2] + '">' + icon(c[2]) + "<h3>" + esc(c[0]) + "</h3><p>" + esc(c[1]) + '</p><span class="more">Open</span></a>';
  }).join("");

  /* Seven attributes wheel */
  (function () {
    var short = ["Engineering", "Management and leadership", "Commercial", "Health, safety and welfare", "Sustainable development", "Communication", "Professional commitment"];
    var cx = 230, cy = 150, r = 100, out = "";
    var pts = short.map(function (_, i) { var a = -Math.PI / 2 + i * 2 * Math.PI / 7; return [cx + r * Math.cos(a), cy + r * Math.sin(a), a]; });
    out += '<polygon points="' + pts.map(function (p) { return p[0].toFixed(1) + "," + p[1].toFixed(1); }).join(" ") + '" fill="none" stroke-dasharray="3 3" style="stroke:var(--line)"/>';
    pts.forEach(function (p) { out += '<line x1="' + cx + '" y1="' + cy + '" x2="' + p[0].toFixed(1) + '" y2="' + p[1].toFixed(1) + '" style="stroke:var(--line)"/>'; });
    out += '<circle cx="' + cx + '" cy="' + cy + '" r="34" style="fill:var(--accent)"/><text x="' + cx + '" y="' + (cy - 2) + '" text-anchor="middle" font-weight="700" font-size="15" style="fill:var(--accent-ink)">CEng</text><text x="' + cx + '" y="' + (cy + 13) + '" text-anchor="middle" font-size="9" style="fill:var(--accent-ink)">MICE</text>';
    pts.forEach(function (p, i) {
      var t = (window.ATTRIBUTES[i] || {}).title || short[i];
      var lx = cx + (r + 26) * Math.cos(p[2]), ly = cy + (r + 26) * Math.sin(p[2]);
      var anchor = Math.abs(Math.cos(p[2])) < 0.2 ? "middle" : Math.cos(p[2]) > 0 ? "start" : "end";
      out += '<a href="#attributes" data-attr="' + i + '"><title>' + esc(t) + '</title><circle cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '" r="15" stroke-width="2" style="fill:var(--surface);stroke:var(--accent)"/><text x="' + p[0].toFixed(1) + '" y="' + (p[1] + 4.5).toFixed(1) + '" text-anchor="middle" font-weight="700" font-size="13" style="fill:var(--accent)">' + (i + 1) + "</text>" +
        '<text class="wl" x="' + lx.toFixed(1) + '" y="' + (ly + 4).toFixed(1) + '" text-anchor="' + anchor + '" font-size="11" style="fill:var(--ink)">' + esc(short[i]) + "</text></a>";
    });
    $("home-wheel").innerHTML = out;
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
      '<div class="levels"><div><span class="eyebrow">IEng must show</span><ul>' + x.ieng.map(function (l) { return "<li>" + esc(l) + "</li>"; }).join("") + '</ul></div><div class="ceng"><span class="eyebrow" style="color:var(--accent)">CEng also adds</span><ul>' + x.ceng.map(function (l) { return "<li>" + esc(l) + "</li>"; }).join("") + "</ul></div></div>" +
      '<p class="small">Quoted from ' + ext(src, "ICE professional review guidance") + ", Appendix A, " + esc(x.page) + ", and " + ext(uk.url, "UK-SPEC") + ".</p></div>" +
      '<div class="panel" style="gap:14px"><div style="display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap;align-items:baseline"><div><span class="eyebrow">Example answers</span><h3 style="margin-top:4px">&ldquo;' + esc(x.q) + '&rdquo;</h3></div><span class="flag">Illustrative</span></div>' +
      '<p class="small">These answers are written for this site to show the difference between levels. They are not real candidates\' words, and the projects and figures are made up.</p>' +
      '<div class="ladder">' + x.answers.map(function (r) { return '<div class="rung ' + r.g + '"><span class="grade">' + GR[r.g] + '</span><p class="ans">' + esc(r.a) + '</p><p class="why"><strong>Why:</strong> ' + esc(r.why) + "</p></div>"; }).join("") + "</div></div>";
  }
  function renderAttr() {
    setTimeout(renderExamples, 0);
    $("attr-tabs").innerHTML = A.map(function (a, i) {
      return '<button type="button" role="tab" id="attr-tab-' + i + '" aria-selected="' + (i === attrIdx) + '" data-i="' + i + '"><span class="n">' + a.n + "</span>" + esc(a.short) + "</button>";
    }).join("");
    var a = A[attrIdx];
    $("attr-detail").innerHTML =
      '<div class="panel" style="gap:18px"><div><span class="eyebrow">Attribute ' + a.n + "</span><h3 style=\"font-size:1.4rem;margin-top:4px\">" + esc(a.title) + "</h3></div>" +
      '<div class="attr-detail"><div style="display:flex;flex-direction:column;gap:8px"><span class="eyebrow">Good evidence covers</span><ul>' +
      a.look.map(function (l) { return "<li>" + esc(l) + "</li>"; }).join("") + "</ul></div>" +
      '<div class="bar"><span class="eyebrow">The chartered bar</span><p style="margin-top:4px">' + esc(a.ceng) + "</p></div></div>" +
      '<div style="display:flex;flex-direction:column;gap:8px"><span class="eyebrow">Test your own examples</span><ul style="margin:0;padding-left:1.1em;display:flex;flex-direction:column;gap:4px">' +
      a.prompts.map(function (p) { return "<li>" + esc(p) + "</li>"; }).join("") + "</ul></div>" +
      '<a class="more" href="#questions" data-attr="' + (attrIdx + 1) + '">Practice questions for this attribute</a></div>';
  }
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

  /* Tips */
  $("tips").innerHTML = T.map(function (t, i) {
    return '<div class="panel tip"><span class="num">' + String(i + 1).padStart(2, "0") + '</span><div style="display:flex;flex-direction:column;gap:6px;min-width:0"><h3>' + esc(t.t) + "</h3><p>" + esc(t.d) + '</p><span class="src">Source: ' + ext(t.url, t.src) + "</span></div></div>";
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

  /* Reference */
  $("ref-list").innerHTML = REF.map(function (r) {
    return '<div class="panel"><h3>' + esc(r.t) + '</h3><div class="table-wrap"><table><tbody>' +
      r.rows.map(function (row) { return "<tr><td>" + esc(row[0]) + "</td><td>" + esc(row[1]) + "</td></tr>"; }).join("") +
      '</tbody></table></div><p class="small">' + esc(r.note) + "</p>" +
      '<p class="small">' + r.links.map(function (l) { return ext(l[1], l[0]); }).join(" · ") + "</p></div>";
  }).join("");

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

  /* Routing on the hash */
  var views = ["home", "route", "attributes", "planner", "flashcards", "review", "questions", "news", "check", "reference", "community"];
  function route() {
    var v = (location.hash || "#home").slice(1);
    if (views.indexOf(v) < 0) v = "home";
    views.forEach(function (name) { $("view-" + name).hidden = name !== v; });
    Array.prototype.forEach.call(document.querySelectorAll("#nav a"), function (a) {
      if (a.getAttribute("href") === "#" + v) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
    });
    var withSources = ["route", "attributes", "review", "reference"].indexOf(v) > -1;
    document.body.classList.toggle("with-sources", withSources);
    $("sources").hidden = !withSources;
    store("cp-last", v);
    window.scrollTo(0, 0);
  }
  window.addEventListener("hashchange", route);
  route();
})();
