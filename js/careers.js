/* Civil Chartered Path: Careers page. Paths, levels, pay and packages.
   Level descriptions and path advice are our own summary of how UK civil engineering careers usually work, not ICE guidance.
   Every pay or benefit figure carries its source and date. Nothing here is invented: if we couldn't source it, it's left out. */
(function () {
  "use strict";
  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function k(n) { return "£" + (n / 1000).toFixed(n % 1000 ? 1 : 0).replace(/\.0$/, "") + "k"; }

  /* ---------- Sources ---------- */
  var S = {
    ons: { name: "ONS Annual Survey of Hours and Earnings, Table 14, 2026 provisional (April 2026 pay, full-time employees)", date: "Oct 2026", kind: "Official", url: "https://www.ons.gov.uk/employmentandlabourmarket/peopleinwork/earningsandworkinghours/datasets/occupation4digitsoc2010ashetable14" },
    onsJF: { name: "ONS ASHE 2026 provisional, civil engineers (SOC 2121), as tabulated by jobfacts.uk", date: "Nov 2026", kind: "Official", url: "https://jobfacts.uk/jobs/civil-engineers/" },
    onsPP: { name: "ONS ASHE 2026 provisional by occupation, as tabulated by PayPrecise", date: "Nov 2026", kind: "Official", url: "https://payprecision.co.uk/salaries/by-occupation/" },
    je: { name: "JustEng Recruitment, Civil engineer salary guide (placements, ONS and ICE surveys; no sample size given)", date: "Apr 2026", kind: "Recruiter", url: "https://justeng.co.uk/civil-engineer-salary-uk" },
    icer: { name: "ICE Recruit, How much do civil engineers earn? (no survey or sample named)", date: "Feb 2025", kind: "Recruiter", url: "https://www.icerecruit.com/article/how-much-do-civil-engineers-earn-" },
    hays24: { name: "Hays UK Salary & Recruiting Trends 2024, Construction & Property (data gathered in 2023)", date: "2023 data", kind: "Recruiter", url: "https://architecturaltechnology.com/static/f0512fe6-874e-4272-b2c6b7b01b6d7880/hays-construction-property-salary-guide-2024.pdf" },
    hays26: { name: "Hays, Highest construction and property salary increases (2026 guide, over 1,000 employers and employees)", date: "2026", kind: "Recruiter", url: "https://www.hays.co.uk/market-insights/article/highest-construction-and-property-salary-increases" },
    psGrad: { name: "PayScale, Graduate Civil Engineer, UK", date: "Aug 2026", kind: "Self-reported", url: "https://www.payscale.com/research/UK/Job=Graduate_Civil_Engineer/Salary" },
    psSen: { name: "PayScale, Senior Civil Engineer, UK", date: "Mar 2026", kind: "Self-reported", url: "https://www.payscale.com/research/UK/Job=Senior_Civil_Engineer/Salary" },
    psMice: { name: "PayScale, Chartered Civil Engineer (MICE), UK", date: "Oct 2025", kind: "Self-reported", url: "https://www.payscale.com/research/UK/Certification=Chartered_Civil_Engineer%3A_MICE_(Institution_of_Civil_Engineers)/Salary" },
    lv: { name: "Levels.fyi, Civil Engineer, United Kingdom", date: "Oct 2026", kind: "Self-reported", url: "https://www.levels.fyi/t/civil-engineer/locations/united-kingdom" },
    indeed: { name: "Indeed UK, Civil engineer salaries (from job adverts in the last 36 months)", date: "Oct 2026", kind: "Advertised", url: "https://uk.indeed.com/career/civil-engineer/salaries" }
  };
  function cite(id) { var s = S[id]; return '<a class="cite" href="' + s.url + '" target="_blank" rel="noopener" title="' + esc(s.name) + '">' + esc(s.kind === "Official" ? "ONS" : s.name.split(",")[0]) + ", " + esc(s.date) + "</a>"; }

  /* ---------- Paths and levels (our summary) ---------- */
  var PATHS = [
    {
      id: "technical", label: "Technical expert", roles: ["designer", "academic"],
      blurb: "Stay close to the engineering and become the person others come to for answers. Chartership matters most here: it's often expected before senior or principal grade.",
      levels: [
        ["Graduate engineer", "0–2 yrs", "Calculations, drawings and models under supervision. Learning the codes and checking your own work."],
        ["Engineer", "2–5 yrs", "Owns design tasks end to end, checks juniors' work, starts dealing with clients and contractors directly. Usually working towards CEng or IEng."],
        ["Senior engineer", "5–10 yrs", "Leads the design of a package or small scheme, signs off others' calculations, manages a small team and its fee. Often chartered by now."],
        ["Principal engineer", "10–15 yrs", "Technical lead on large or unusual schemes, approves design approaches, mentors and represents the firm with clients."],
        ["Associate or technical director", "15+ yrs", "Sets technical standards for a team or region, is the named expert on difficult problems, wins work on reputation. Some go on to a fellowship (FICE) or a panel role."]
      ],
      pay: [["Civil engineers, all grades (median)", 52456, "onsPP"], ["Engineering project managers and project engineers (median)", 53959, "onsPP"]],
      helps: ["CEng (or IEng first) as early as you can: it's the usual gate to senior and principal grades.", "A specialism people seek out, such as geotechnics, hydraulics, dams or tunnels. Some come with their own registers, such as the reservoir panels.", "Papers, talks and code committee work, which are how people come to know you as the expert."]
    },
    {
      id: "delivery", label: "Project or construction manager", roles: ["contractor"],
      blurb: "Run jobs: time, cost, people and risk. Contractors grow this through site roles; consultancies and clients through project and programme management.",
      levels: [
        ["Graduate or site engineer", "0–2 yrs", "Setting out, supervising works, temporary works checks, records and quality. Learning the contract on the ground."],
        ["Section engineer", "2–5 yrs", "Runs a section of a job: its programme, subcontractors, safety and quality."],
        ["Senior or project engineer", "5–8 yrs", "Leads the engineering on a whole project, and works with the commercial team on change and valuations."],
        ["Project manager", "8–12 yrs", "Accountable for a project's delivery, budget and safety, and its relationship with the client. Holds the contract role (such as NEC Project Manager on the client side)."],
        ["Contracts manager or project director", "12+ yrs", "Runs several projects or one major one, with profit and loss responsibility. Senior ones run a region or a framework."]
      ],
      pay: [["Construction project managers (median, all experience)", 49319, "onsPP"], ["Production managers and directors in construction (median)", 59994, "onsPP"]],
      hays: [["Project Manager, London", "80–90k", "87k"], ["Project Manager, South East", "65–80k", "75k"], ["Project Manager, North West", "60–70k", "62k"], ["Contract Manager, London", "80–100k", "90k"], ["Senior Engineer (on site), London", "57–67k", "63k"], ["Engineer (on site), South East", "35–45k", "45k"]],
      helps: ["Site time and a section of your own early on.", "SMSTS and the NEC Project Manager or Supervisor accreditation.", "APM qualifications (PMQ, then Chartered Project Professional) sit alongside CEng and many firms value both."]
    },
    {
      id: "commercial", label: "Commercial", roles: [],
      blurb: "Money and contracts: valuations, change, cost reporting and final accounts. Engineers who move across bring an advantage, because they understand what the work actually involves.",
      levels: [
        ["Assistant QS", "0–3 yrs", "Measurement, subcontractor payments and cost records."],
        ["Quantity surveyor", "3–6 yrs", "Runs the commercial side of a project: applications, valuations and change."],
        ["Senior QS", "6–10 yrs", "Several projects or one large one, including compensation events, forecasting and disputes."],
        ["Commercial manager", "10+ yrs", "Profit, risk and contract strategy for a project or region. Leads final accounts and negotiations."],
        ["Commercial director", "15+ yrs", "The firm's commercial position across a business unit, from bids through to claims."]
      ],
      pay: [["Quantity surveyors (median, all experience)", 52492, "onsPP"], ["Estimators, valuers and assessors (median)", 41372, "onsPP"]],
      hays: [["Assistant QS, London", "40–50k", "45k"], ["Intermediate QS, London", "60–75k", "65k"], ["Senior QS, London", "80–95k", "85k"], ["Commercial Manager, London", "95–135k", "120k"], ["Commercial Manager (QS), East Midlands", "68–80k", "75k"], ["Estimator, London", "65–80k", "75k"], ["Senior Estimator, London", "80–99k", "90k"]],
      helps: ["Your attribute 3 evidence (commercial ability) is the bridge. Own the change and valuation work on your project.", "NEC contract knowledge, and a part-time QS or commercial management course.", "RICS (APC) or CICES membership if you move across fully. Some keep CEng as well."]
    },
    {
      id: "bd", label: "Business development or sales", roles: [],
      blurb: "Winning work: bids, client relationships and frameworks at consultancies and contractors, or technical sales at product and software suppliers.",
      levels: [
        ["Bid engineer or coordinator", "0–4 yrs", "Writes technical sections of bids, pulls together CVs, case studies and programmes."],
        ["Bid manager or estimator", "4–8 yrs", "Runs bids end to end: the win strategy, pricing inputs, the bid team and the deadlines."],
        ["Business development manager", "6–12 yrs", "Owns client relationships and a pipeline of work in a sector, and positions the firm for frameworks."],
        ["Account or sector director", "12+ yrs", "Responsible for a key client or sector's revenue and growth. Often a former engineer with a strong technical name."]
      ],
      pay: [["Sales accounts and business development managers, all industries (median)", 58743, "onsPP"], ["Business sales executives, all industries (median)", 41694, "onsPP"]],
      helps: ["Volunteer on bids now: it's also strong attribute 3 and 6 evidence.", "Technical credibility: chartership helps clients trust you.", "APMP bid and proposal certification, if you go into bid management."]
    },
    {
      id: "client", label: "Client or asset management", roles: ["client", "public"],
      blurb: "Own the network: water companies, Environment Agency, National Highways, Network Rail, councils. Deciding what gets built and looking after it for decades.",
      levels: [
        ["Graduate or assistant engineer", "0–3 yrs", "Inspections, asset data, supporting project sponsors and reviewing consultants' work."],
        ["Asset or project engineer", "3–6 yrs", "Runs schemes through the client's approval process and manages consultants and contractors."],
        ["Senior engineer or project manager", "6–10 yrs", "Leads a programme of schemes, holds the budget and signs off designs and risk."],
        ["Asset manager or programme manager", "10+ yrs", "Sets investment plans and priorities for an asset class or region, and the regulatory submissions."],
        ["Head of or director", "15+ yrs", "Strategy, regulators and the board. Statutory roles, such as reservoir panel engineers, sit alongside this path."]
      ],
      pay: [["Civil engineers, all employers (median)", 52456, "onsPP"]],
      helps: ["Consultant or contractor experience first makes you a better client. Many move across at engineer or senior level.", "Asset management qualifications (IAM certificate or diploma).", "Pay bands are usually published on the advert, so you can compare before applying."]
    }
  ];

  /* ---------- Pay by grade (published) ---------- */
  var GRADES = [
    ["Graduate", "0–2 yrs", "£24–30k", "£28–36k"],
    ["Engineer", "2–5 yrs", "£32–45k", "£38–52k"],
    ["Senior engineer", "5–10 yrs", "£45–62k", "£54–74k"],
    ["Principal engineer", "10–15 yrs", "£62–82k", "£72–96k"],
    ["Technical director or director", "15+ yrs", "£82–115k+", "£96–135k+"]
  ];
  var ONS_DIST = { p10: 33200, p25: 41300, med: 52500, p75: 69400, p80: 74200 };
  var ONS_REGION = [["Scotland", 59000], ["London", 57900], ["North West", 56300], ["South East", 53500], ["South West", 50600], ["Yorkshire and the Humber", 49200]];

  /* ---------- Self-reported and advertised ---------- */
  var REPORTED = [
    ["Graduate civil engineer", "Median £29k (10th–90th percentile £25–32k)", "111 profiles", "psGrad"],
    ["Senior civil engineer", "Median £45k (10th–90th percentile £36–62k)", "86 profiles", "psSen"],
    ["Chartered civil engineer (MICE)", "Average £46k", "98 responses", "psMice"],
    ["Civil engineer, total pay including bonus", "Median £42.6k (25th–75th £31.8–53.4k)", "31 submissions", "lv"],
    ["Civil engineer, advertised salaries", "Average £44.8k (London £52.4k, Bristol £49.6k, Manchester £47.0k)", "3,300 adverts", "indeed"]
  ];


  /* ---------- Packages ---------- */
  var PKG_SRC = {
    tpr: ["The Pensions Regulator, auto-enrolment contributions", "rates from Apr 2019", "https://www.thepensionsregulator.gov.uk/employers/contributions-funding.aspx"],
    hol: ["GOV.UK, Holiday entitlement", "Nov 2026", "https://www.gov.uk/holiday-entitlement-rights"],
    arupB: ["Bright Network, Arup benefits", "no date", "https://www.brightnetwork.co.uk/employer-advice/arup-benefits-wellbeing-support-for-every-stage-of-your-career/"],
    atk: ["AtkinsRéalis, Your benefits", "no date", "https://yourrewarduk.atkinsrealis.com/your-benefits"],
    cos: ["Costain, Employee benefits", "no date", "https://costain.com/careers/employee-benefits"],
    kier: ["Kier, Benefits", "no date", "https://jobs.kier.co.uk/benefits/"],
    srm: ["Employee Benefits, Sir Robert McAlpine", "no date", "https://employeebenefits.co.uk/the-benefits-offered-by-sir-robert-mcalpine"],
    bb: ["Balfour Beatty, Benefits brochure", "no date", "https://balfourbeatty.com/redirects/balfour-beatty-benefits-brochure"],
    ea: ["Environment Agency, Why join us", "Jan 2026", "https://environmentagencycareers.co.uk/why-join-us/"],
    eaJob: ["Environment Agency, FCRM Supervising Engineer advert", "Jun 2026", "https://environmentagencycareers.co.uk/jobs/fcrm-supervising-engineer-reservoir-safety-reform-34642/"],
    nh: ["National Highways, Miles More brochure", "no date", "https://nationalhighways.co.uk/media/qasjvnqg/miles-more-brochure.pdf"],
    nr: ["Network Rail, Assistant Engineer advert", "closed", "https://careers.networkrail.co.uk/jobs/job/Assistant-Engineer/3043"],
    nr2: ["Network Rail, Senior Design Engineer advert", "2024, closed", "https://careers.networkrail.co.uk/jobs/job/Senior-Design-Engineer-Track/2986"]
  };
  function pc(id) { var s = PKG_SRC[id]; return '<a class="cite" href="' + s[2] + '" target="_blank" rel="noopener">' + esc(s[0]) + ", " + esc(s[1]) + "</a>"; }
  var EMP = [
    ["Consultancy", "Arup", "25 days + public holidays", "Company scheme, % not published", "Profit share for permanent staff; private medical; chartership supported", "arupB"],
    ["Consultancy", "AtkinsRéalis", "25 days + 8 bank holidays; buy up to 15, sell up to 5", "Defined contribution, % not published", "Car or car allowance for some roles; Bupa medical; share plan", "atk"],
    ["Contractor", "Costain", "25 days + birthday; buy up to 5", "Matched up to 10%", "Company car or car allowance; discretionary bonus; institute fee paid; private healthcare", "cos"],
    ["Contractor", "Kier", "Base not published; buy up to 5", "Matched, % not published", "Car allowance by role; one membership fee paid; £1,000 bonus on chartering; hybrid where possible", "kier"],
    ["Contractor", "Sir Robert McAlpine", "25 rising to 30 over 5 years; trade up to 5", "Defined contribution, matched, % not published", "Car allowance by level; private medical for all; chartership support", "srm"],
    ["Contractor", "Balfour Beatty", "Buy up to 5 (to a 30-day cap)", "Not published", "Optional private medical", "bb"],
    ["Client", "Environment Agency", "25 days (27 on a 2026 engineer advert) + bank holidays; flexitime up to 18 more days", "LGPS defined benefit: employer pays 19%, you pay 5.5–12.5%", "One professional fee paid; hybrid where possible. 2026 Supervising Engineer advert: £54,940–£64,576", "ea"],
    ["Client", "National Highways", "26 rising to 31 + bank holidays; buy or sell up to 37 hours", "“Generous contributions”, % not published", "Performance-related pay; hybrid by role", "nh"],
    ["Client", "Network Rail", "28 days + bank holidays; buy or sell", "Defined benefit on one advert, “a range of schemes” on another", "75% off season tickets. Assistant engineer advert: £30–34k", "nr"]
  ];
  function drawPkg() {
    var el = $("car-pkg"); if (!el) return;
    el.innerHTML =
      '<p>Compare offers on the whole package, not the base salary. The legal minimum is <strong>28 days</strong> including bank holidays ' + pc("hol") + ' and <strong>3%</strong> employer pension (8% in total) ' + pc("tpr") + '. Most employers below give well over that.</p>' +
      '<div class="emp-grid">' + EMP.map(function (e) { return '<div class="emp"><div class="emp-h"><strong>' + esc(e[1]) + '</strong><span class="chip">' + esc(e[0]) + '</span></div><dl><dt>Leave</dt><dd>' + esc(e[2]) + "</dd><dt>Pension</dt><dd>" + esc(e[3]) + "</dd><dt>Other</dt><dd>" + esc(e[4]) + '</dd></dl><span class="small">' + pc(e[5]) + "</span></div>"; }).join("") + "</div>" +
      '<p class="small">From each employer\'s own careers pages, read in Nov 2026. Most pages carry no date and give no pension percentage, so we\'ve left those blank rather than guess. Bonus amounts, car allowance amounts and overtime rules weren\'t published by any of them.</p>' +
      '<h4>What the pattern looks like</h4><ul>' +
      '<li><strong>Client side</strong> : the pension is usually the big difference. A defined benefit scheme like the Environment Agency\'s, with 19% from the employer, is worth far more than a 5–10% matched scheme.</li>' +
      '<li><strong>Contractors</strong> are the ones most likely to add a car or car allowance, because the job moves between sites.</li>' +
      '<li><strong>Consultancies</strong> tend to offer profit share and buying extra holiday rather than a car.</li>' +
      '<li>Overtime is rarely paid at professional grades anywhere; ask how hours and time off in lieu work before you accept.</li></ul>' +
      '<p class="small">The pattern is our reading of the employer pages above, not a survey.</p>' +
      calc();
    wireCalc();
  }

  /* Package calculator. The two offers start with example figures, clearly marked. */
  var FIELDS = [["base", "Base salary (£)", 1000], ["pen", "Employer pension (%)", 0.5], ["bonus", "Typical bonus (%)", 0.5], ["car", "Car allowance (£ a year)", 500], ["leave", "Leave days, excluding bank holidays", 1]];
  var DEF = { a: { base: 55000, pen: 19, bonus: 0, car: 0, leave: 27 }, b: { base: 60000, pen: 6, bonus: 5, car: 4000, leave: 25 } };
  function load() { try { var v = JSON.parse(localStorage.getItem("cp-pkg") || "null"); if (v && v.a && v.b) return v; } catch (e) {} return JSON.parse(JSON.stringify(DEF)); }
  var PK = load();
  function calc() {
    function col(o, t) { return '<fieldset class="pk-col"><legend>' + t + "</legend>" + FIELDS.map(function (f) { return '<label class="field"><span>' + f[1] + '</span><input type="number" inputmode="decimal" min="0" step="' + f[2] + '" data-o="' + o + '" data-f="' + f[0] + '" value="' + PK[o][f[0]] + '"></label>'; }).join("") + "</fieldset>"; }
    return '<details class="car-more" id="pk-wrap" open><summary>Compare two offers</summary><p class="small">Starts with example figures (offer A is shaped like a client-side role with a public-sector pension). Replace them with your own. Saved only in this browser.</p>' +
      '<div class="pk-grid">' + col("a", "Offer A") + col("b", "Offer B") + "</div>" + '<div id="pk-out" role="status"></div></details>';
  }
  function value(o) { var base = +o.base || 0, day = base / 260; return { cash: base + base * (+o.bonus || 0) / 100 + (+o.car || 0), pen: base * (+o.pen || 0) / 100, leave: ((+o.leave || 0) - 25) * day }; }
  function out() {
    var a = value(PK.a), b = value(PK.b), ta = a.cash + a.pen + a.leave, tb = b.cash + b.pen + b.leave;
    function row(t, x, y) { return "<tr><td>" + t + "</td><td>" + k(Math.round(x)) + "</td><td>" + k(Math.round(y)) + "</td></tr>"; }
    var d = Math.round(Math.abs(ta - tb)), win = ta > tb ? "A" : "B";
    $("pk-out").innerHTML = '<table class="car-tbl"><thead><tr><th></th><th>Offer A</th><th>Offer B</th></tr></thead><tbody>' +
      row("Cash (base, bonus, car)", a.cash, b.cash) + row("Employer pension", a.pen, b.pen) + row("Leave above 25 days, at your day rate", a.leave, b.leave) +
      '<tr class="pk-tot">' + "<td>Package value</td><td>" + k(Math.round(ta)) + "</td><td>" + k(Math.round(tb)) + "</td></tr></tbody></table>" +
      (d < 500 ? "<p>The two are about the same overall.</p>" : "<p>Offer " + win + " is worth about <strong>" + k(d) + "</strong> a year more" + ((win === "A") !== (+PK.a.base > +PK.b.base) && +PK.a.base !== +PK.b.base ? ", even though its base salary is lower." : ".") + "</p>") +
      '<p class="small">Before tax, and ignoring bonuses that may not be paid. A defined benefit pension is worth more than its employer percentage suggests, because the scheme takes the investment risk. Bonus and car allowances are usually taxed; employer pension contributions usually aren\'t.</p>';
  }
  function wireCalc() {
    var w = $("pk-wrap"); if (!w) return;
    w.addEventListener("input", function (e) { var i = e.target.closest("input[data-o]"); if (!i) return; PK[i.dataset.o][i.dataset.f] = i.value; try { localStorage.setItem("cp-pkg", JSON.stringify(PK)); } catch (x) {} out(); });
    out();
  }
  window.CPCareersPkg = drawPkg;

  window.CPCareers = { PATHS: PATHS, S: S };

  /* ---------- Render ---------- */
  var sel = null;
  function pathFor(role) { for (var i = 0; i < PATHS.length; i++) if (PATHS[i].roles.indexOf(role) > -1) return PATHS[i].id; return "technical"; }
  function current() { var r = window.CPRole ? CPRole.get() : ""; return sel || pathFor(r); }

  function drawPath() {
    var el = $("car-path"); if (!el) return;
    var id = current(), p = PATHS.filter(function (x) { return x.id === id; })[0];
    var r = window.CPRole && CPRole.role();
    Array.prototype.forEach.call(document.querySelectorAll("#car-paths button"), function (b) { b.setAttribute("aria-pressed", String(b.dataset.path === id)); });
    var note = !sel && r && r.id !== "other" ? '<p class="small">Showing the usual path for a ' + esc(r.short.toLowerCase()) + ". Pick another above to compare.</p>" : "";
    var pay = p.pay.map(function (x) { return "<li><strong>" + k(x[1]) + "</strong> " + esc(x[0]) + ' <span class="small">' + cite(x[2]) + "</span></li>"; }).join("");
    var hays = p.hays ? '<details class="car-more"><summary>Recruiter ranges by job title (Hays, 2023 data)</summary><table class="car-tbl"><thead><tr><th>Job title</th><th>Range</th><th>Typical</th></tr></thead><tbody>' +
      p.hays.map(function (h) { return "<tr><td>" + esc(h[0]) + "</td><td>£" + esc(h[1]) + "</td><td>£" + esc(h[2]) + "</td></tr>"; }).join("") +
      '</tbody></table><p class="small">' + cite("hays24") + '. Hays says pay in construction rose about 3% a year since, so these are now low. ' + cite("hays26") + "</p></details>" : "";
    el.innerHTML = note + "<p>" + esc(p.blurb) + "</p>" +
      '<ol class="car-ladder">' + p.levels.map(function (l) { return '<li><div class="cl-h"><strong>' + esc(l[0]) + '</strong><span class="mono small">' + esc(l[1]) + "</span></div><p>" + esc(l[2]) + "</p></li>"; }).join("") + "</ol>" +
      '<p class="small">Titles and years are typical, not rules. Firms name grades differently, and the years are our rough guide.</p>' +
      '<h4>Pay on this path</h4><ul class="car-pay">' + pay + "</ul>" +
      '<p class="small">ONS medians cover every experience level in the occupation, so read them as the middle of the whole ladder, not a starting salary.</p>' + hays +
      "<h4>What helps you get there</h4><ul>" + p.helps.map(function (h) { return "<li>" + esc(h) + "</li>"; }).join("") + "</ul>";
  }

  function onsBar() {
    var d = ONS_DIST, lo = 25000, hi = 80000, W = 320;
    function x(v) { return Math.round((v - lo) / (hi - lo) * W); }
    return '<svg class="car-bar" viewBox="0 0 ' + (W + 20) + ' 64" role="img" aria-label="Civil engineers\' pay: 10th percentile £33.2k, quarter £41.3k, median £52.5k, three-quarters £69.4k">' +
      '<g transform="translate(10,0)"><line x1="' + x(d.p10) + '" x2="' + x(d.p80) + '" y1="24" y2="24" class="cb-w"/>' +
      '<rect x="' + x(d.p25) + '" y="14" width="' + (x(d.p75) - x(d.p25)) + '" height="20" rx="3" class="cb-box"/>' +
      '<line x1="' + x(d.med) + '" x2="' + x(d.med) + '" y1="10" y2="38" class="cb-med"/>' +
      [["p10", "£33k"], ["p25", "£41k"], ["med", "£52.5k"], ["p75", "£69k"], ["p80", "£74k"]].map(function (t, i) { return '<text x="' + x(d[t[0]]) + '" y="' + (i % 2 ? 56 : 50) + '" text-anchor="middle">' + t[1] + "</text>"; }).join("") +
      "</g></svg>" + '<p class="small">Bottom 10%, quarter, median, three-quarters and top 20% of full-time civil engineers. ONS doesn\'t publish the top 10% for this group.</p>';
  }

  function drawStatic() {
    var g = $("car-grades"); if (g) g.innerHTML =
      "<p>The middle UK civil engineer earns <strong>£52.5k</strong>, up from £45.5k in 2023. " + cite("onsJF") + "</p>" + onsBar() +
      '<details class="car-more"><summary>By region (ONS medians)</summary><table class="car-tbl"><tbody>' + ONS_REGION.map(function (r) { return "<tr><td>" + esc(r[0]) + "</td><td>" + k(r[1]) + "</td></tr>"; }).join("") +
      '</tbody></table><p class="small">ONS flags these regional samples as small. Other regions aren\'t published. ' + cite("onsJF") + "</p></details>" +
      "<h4>By grade, from a recruiter</h4>" +
      '<table class="car-tbl"><thead><tr><th>Grade</th><th>Typical years</th><th>UK</th><th>London</th></tr></thead><tbody>' +
      GRADES.map(function (r) { return "<tr><td>" + esc(r[0]) + "</td><td>" + esc(r[1]) + "</td><td>" + esc(r[2]) + "</td><td>" + esc(r[3]) + "</td></tr>"; }).join("") + "</tbody></table>" +
      '<p class="small">' + cite("je") + '. No official source publishes pay by grade. ICE Recruit gives similar bands (graduate £25–30k, senior £50–70k, principal or chartered £70–90k), bonuses of 5–15% and contract rates of £200–500 a day. ' + cite("icer") + "</p>" +
      '<p class="small">On chartership: JustEng says CEng adds 15–25% over non-chartered peers with the same experience, but gives no source for it. We couldn\'t find an official figure.</p>';
    var rp = $("car-reported"); if (rp) rp.innerHTML =
      '<table class="car-tbl"><thead><tr><th>What</th><th>Figure</th><th>Based on</th><th>Source</th></tr></thead><tbody>' +
      REPORTED.map(function (r) { return "<tr><td>" + esc(r[0]) + "</td><td>" + esc(r[1]) + "</td><td>" + esc(r[2]) + "</td><td>" + cite(r[3]) + "</td></tr>"; }).join("") + "</tbody></table>" +
      '<p><strong>Where these disagree with the published figures:</strong> self-reported pay runs lower. PayScale\'s senior engineer median (£45k) sits at the bottom of the recruiter\'s senior band (£45–62k) and well under the ONS median for all civil engineers (£52.5k). Its chartered average (£46k) is also below the ONS median. Our guess at why, which isn\'t measured: people who fill in these sites are often early in their career or checking whether they\'re underpaid. Treat them as a floor rather than the norm.</p>' +
      '<p class="small">We couldn\'t read Glassdoor or Reddit: both block automated access, so nothing from them is included. If you find a useful thread, send it and we\'ll add it with its date.</p>';
  }

  function init() {
    if (!$("view-careers")) return;
    $("car-paths").innerHTML = PATHS.map(function (p) { return '<button type="button" data-path="' + p.id + '" aria-pressed="false">' + esc(p.label) + "</button>"; }).join("");
    $("car-paths").addEventListener("click", function (e) { var b = e.target.closest("button[data-path]"); if (!b) return; sel = b.dataset.path; drawPath(); });
    drawStatic(); drawPath();
    if (window.CPRole) CPRole.on(function () { sel = null; drawPath(); });
    if (window.CPCareersPkg) window.CPCareersPkg();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
