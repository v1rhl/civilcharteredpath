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

  /* Home cards */
  var homeCards = [
    ["The route", "Six stages from graduate member to CEng MICE, and where people usually get stuck.", "route"],
    ["The seven attributes", "What reviewers look for under each one, and the chartered-level bar.", "attributes"],
    ["Review day", "Practical advice on the presentation, interview and communication task.", "review"],
    ["Practice questions", Q.length + " questions reviewers ask, with what a good answer covers.", "questions"],
    ["Reference", "NEC4 timescales, CDM duty holders, CPD themes and ICE Presidents.", "reference"],
    ["Submission planner", "Enter your deadline and get a dated plan worked back from it.", "planner"],
    ["Flashcards", "Revise the attributes, review format, contracts, H&S and current affairs.", "flashcards"],
    ["Report check", "Coming soon: paste a section of your report and get feedback against the attributes.", "check"],
    ["Latest news", "Headlines from NCE, ICE and other sources, plus a weekly briefing.", "news"],
    ["Community", "A forum and mock review partners. Opening soon.", "community"]
  ];
  $("home-cards").innerHTML = homeCards.map(function (c) {
    return '<div class="panel"><h3>' + esc(c[0]) + "</h3><p>" + esc(c[1]) + '</p><a class="more" href="#' + c[2] + '">Open</a></div>';
  }).join("");
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
  function renderAttr() {
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
    store("cp-last", v);
    window.scrollTo(0, 0);
  }
  window.addEventListener("hashchange", route);
  route();
})();
