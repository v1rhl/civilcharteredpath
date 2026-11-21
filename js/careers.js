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
    cw: { name: "Carrington West, 2026 Salary Ranges: Highway Engineers (permanent; average is the mode)", date: "2026", kind: "Recruiter", url: "https://www.carringtonwest.com/" },
    svy: { name: "2024 Civil Engineering Salary Survey (public online form, UK responses only)", date: "2024", kind: "Self-reported", url: "https://docs.google.com/spreadsheets/d/1442pGzO66N9cZeTwyXh-5q8hzjNnnpZ74q6ViHYh0OM/edit?gid=298969764" },
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
      helps: ["Consultant or contractor experience makes you a better client. Some bodies mostly promote from within, though: one Reddit account says Network Rail rarely hires seniors from outside without a railway background, so joining earlier can be easier.", "Asset management qualifications (IAM certificate or diploma).", "Pay bands are usually published on the advert, so you can compare before applying."]
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
  /* Carrington West 2026, highways only: [title, min, max, mode, chartered row?] */
  var CW = [
    ["Graduate", 27000, 32000, 28500], ["Graduate (MEng)", 28000, 32000, 28500], ["Assistant", 32000, 38000, 35000], ["Engineer", 37000, 44000, 40000],
    ["Senior", 45000, 53000, 49000], ["Senior, chartered", 47000, 58000, 54000, 1], ["Principal", 55000, 62000, 58000], ["Principal, chartered", 58000, 68000, 63000, 1],
    ["Associate", 65000, 75000, 70000], ["Associate, chartered", 66000, 80000, 73000, 1], ["Associate director", 75000, 85000, 80000], ["Technical director", 75000, 90000, 82000], ["Director", 95000, 120000, 110000]
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
      '<h4>What the 2024 survey says (54 UK engineers)</h4><ul>' +
      "<li><strong>Bonus:</strong> 21 of 54 got one. The median was £2,000, about 5% of salary.</li>" +
      "<li><strong>Overtime:</strong> 30 of 54 aren\'t paid for it. 11 get straight time and 9 get time and a half, mostly in site and contractor roles.</li>" +
      "<li><strong>Hours:</strong> the median is 40 a week, and 14 of 53 work more than 40.</li>" +
      "<li><strong>Leave:</strong> the median is 28 days, from a question that mixed holiday and sick leave, so it isn't exact.</li>" +
      "<li><strong>Working from home:</strong> most work from home 2 or 3 days a week. 9 never do, mostly site staff.</li>" +
      "<li><strong>Company vehicle:</strong> 11 of 54 have one.</li></ul>" +
      '<p class="small">' + cite("svy") + ". The survey didn\'t ask about pension in a way that fits the UK.</p>" +
      '<p class="small">On Reddit, people mention car allowances of £1–4k, bonuses of 10–15% at senior level in contracting and renewables, £28k a year in subsistence for one contractor working away from home (2024), and a 10% pension match plus mileage for a contractor sub-agent (Jul 2026). One water company role came with a £6k car allowance and a 10% bonus (Sep 2026).</p>' +
      '<h4>What the pattern looks like</h4><ul>' +
      '<li><strong>Client side</strong>: the pension is usually the big difference. A defined benefit scheme like the Environment Agency\'s, with 19% from the employer, is worth far more than a 5–10% matched scheme.</li>' +
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

  /* 2024 survey, UK rows only: our own count from the public responses. */
  var SURVEY = [
    ["0–2 years", 15, "£30–33k", "£31k"],
    ["3–5 years", 13, "£34–40k", "£37.3k"],
    ["6–9 years", 12, "£47–61k", "£48.8k"],
    ["10+ years", 14, "£57–75k", "£62.5k"]
  ];
  /* Reddit (r/civilengineering, r/UKJobs), pasted to us in Nov 2026. UK only: US, Australia and cost-of-living arguments left out. No usernames.
     Dates are when the thread was posted; replies can be a little later. "C" marks chartership. */
  var TL = [
    ["Building structures, the North", "early 2024", ["Y0 £25k", "Y4 £34k", "Y6 £41k", "C", "Y8 £49k", "Y10 £64k"]],
    ["Drainage and highways, London, never changed employer", "early 2024", ["Y1 £29k", "Y2 £31k", "Y3 £33k", "Y3.5 £37k", "Y4 £42k (senior)"]],
    ["Bridges", "early 2024", ["Y0 £27k", "Y1 £28.5k", "Y2 £31.4k", "Y3 £36.3k (engineer)"]],
    ["Tunnelling, contractor, outside London", "early 2024", ["Year in industry £35k", "Y0 £45k", "Y1 £48k", "Y2 £64k"]],
    ["Power and energy, consultancy", "early 2024", ["Y0 £27.5k", "Y1 £30k", "Y2 £37.5k (moved)", "Y2.5 £40.5k"]],
    ["Water, then power", "early 2024", ["Y0 £29k", "Y1 £30.8k", "Y2 £32.5k", "Y2.5 £40k + £4k car + bonus (moved to power)"]],
    ["Site civil engineer, not chartered", "early 2024", ["Y0 £22k", "Y7 £38k", "Y8 £45k (moved)", "Y14 £93k (technical director)"]],
    ["South of England", "2024", ["Y0 £20k", "Y3 £30k", "Y5.5 £50k", "Y11.5 £85k"]],
    ["Not chartered", "2024–25", ["Y0 £25.5k", "Y8 £71k + 15% bonus"]],
    ["Water pipelines", "2025", ["Y0 £31k", "Y0.5 £33.5k", "Y1.5 £36k + £1–2k car allowance"]],
    ["Contractor, later design manager, chartered", "early 2024", ["Year in industry £23k", "Graduate (MSc) £35k incl. car allowance", "Engineer £46k", "Senior design coordinator £51k", "Design manager £68k"]],
    ["Degree apprentice, consultancy", "2026", ["Age 19 £18k", "Age 22 £33k", "On graduating £38k"]],
    ["Outside London", "2026", ["Y0 £27k", "Y2 £32k", "Y3 £35k", "Y4 £42k"]],
    ["Technician", "Sep 2026", ["Start £15k", "Y6 £29k", "£35k (moved)", "Y12 £41k"]],
    ["London project manager", "Nov 2026", ["Y4 £38.5k", "£55k (moved)"]]
  ];
  /* Single engineer accounts from the 2026 threads: [years, base £k, employer type, chartered, region, date, note].
     Employer type: con consultancy, ctr contractor, cli client, utility or developer, "" not given. Chartered: y, n, "" not given. */
  var ACC = [
    [4, 32, "", "", "", "Nov 2026", "asking whether they're underpaid; friends on £40–45k"],
    [5, 49, "", "n", "London", "Nov 2026", "£42k before moving employer"],
    [4.5, 50, "", "", "the North", "Nov 2026", "structural"],
    [4, 55, "", "", "London", "Nov 2026", "project manager, MAPM; £38.5k before moving"],
    [5, 65, "con", "", "", "Nov 2026", "civil and energy consultancy, quoted as £60–70k"],
    [7, 42, "", "", "", "Nov 2026", ""],
    [8, 55, "", "y", "London", "Jul 2026", "water design engineer"],
    [16, 53, "cli", "y", "", "Jul 2026", "water process design engineer"],
    [12, 48, "", "", "", "Jul 2026", "rail, IEng"],
    [10, 36, "con", "n", "", "Jul 2026", "highways at a large consultancy, 5 of those years as a technician; told no rise until chartered"],
    [7, 42, "con", "n", "", "Jul 2026", ""],
    [10, 54, "", "", "", "Jul 2026", "senior civils designer, HND, fully remote"],
    [6, 65, "cli", "y", "", "Jul 2026", "rail"],
    [15, 70, "", "", "", "Jul 2026", "rail"],
    [10, 70, "cli", "", "", "Jul 2026", "energy; £44k at a consultancy before moving"],
    [5, 39, "con", "", "", "Jul 2026", "design"],
    [22, 78, "con", "n", "", "Jul 2026", "water and flood"],
    [8, 48, "con", "y", "", "Jul 2026", "senior engineer"],
    [5, 51, "", "", "North Wales", "Jul 2026", "structural"],
    [5, 35, "", "", "", "Jul 2026", "highways designer, apprenticeship route"],
    [8, 50, "cli", "n", "", "Jul 2026", "design manager, after 4 years as a technician and 4 as an engineer"],
    [8, 41, "con", "", "", "Jul 2026", "apprenticeship route; since offered £48k as a senior"],
    [10, 58, "con", "", "Birmingham", "Jul 2026", "associate at a small consultancy, 45–50 hours a week"],
    [9, 51, "", "", "", "Jul 2026", "highways, good benefits"],
    [10, 43, "", "", "", "Jul 2026", "senior highways engineer"],
    [4, 36, "con", "", "", "Jul 2026", "bridges, with private health and a good pension"],
    [8, 44, "", "", "North West", "Jul 2026", "drainage, 3 years as an engineer after 5 as a technician"],
    [20, 60, "", "y", "South Coast", "Jul 2026", "flood and drainage; has since gone self-employed"],
    [7, 44, "con", "n", "", "Jul 2026", "large consultancy"]
  ];
  /* Technicians and CAD, kept apart from engineers. */
  var TECH = [
    ["Sep 2026", "Scotland, ground modelling, about 20 years: £65k + £5k bonus + £8k car allowance + private health."],
    ["Sep 2026", "North West, about 20 years: £58k + £4k bonus."],
    ["Sep 2026", "Principal technician, 12 years: £54k."],
    ["Sep 2026", "5 years: £47k."],
    ["Sep 2026", "Rail technician: £27k, then £42k."],
    ["Sep 2026", "South West, 9 years: £37k."],
    ["Sep 2026", "EngTech, 8 years: £26.5k."],
    ["Sep 2026", "Small-firm technician, 8 years, on £34k, moved to a water company checking drainage adoption (S104) designs: £60k + £6k car allowance + 10% bonus, working from home."],
    ["2026", "CAD team in a northern civils department: new graduate £28k, 5 years £50k, senior £60k. Engineers in the same firm reach £38–40k at about 4 years."]
  ];
  /* Pay bands commenters quoted for a whole grade ladder. */
  var BANDS = [
    ["Consultancy, Humber", "Nov 2026", "Graduate £35k · mid-level £40–55k · senior £55–65k · lead £65k+, plus car allowance"],
    ["Consultancy, one commenter's area", "2026", "Principal £45–55k · associate £55–65k · technical director £65–75k"],
    ["Senior engineer at about 4 years, a recruiter", "Nov 2026", "London £45–48k · South £42–45k · North and Midlands £38–42k"],
    ["Consultancy hiring manager", "Nov 2026", "About £37k before chartership, low £40s after"],
    ["Graduate offers quoted", "Nov 2026", "£31.5k · about £32k · £35k"],
    ["Housebuilding", "Oct 2026", "Assistant £28–36k · engineer £36–55k · senior £55–70k, each with bonus and car"],
    ["Technicians", "Sep 2026", "Junior £25k · technician £35k · senior £45k, ceiling about £50–60k"],
    ["Contract designers", "Jul 2026", "About £500 a day"]
  ];
  /* Real but unrepresentative: shown, not counted. */
  var OUT = [
    ["£135k", "Jul 2026", "Energy, 17 years, chartered, project delivery lead. Others in the thread called it rare."],
    ["£200k tax-free", "Jul 2026", "Saudi Arabia, 30 years. Overseas pay, not a UK salary."],
    ["£120k", "Oct 2026", "Claimed for a site engineer. Other commenters doubted it."],
    ["£400 a day", "2025", "Self-employed setting-out engineer, 3 years. Another commenter says £50–100k a year is more realistic after travel, kit and gaps between contracts."]
  ];
  var REDDIT = [
    ["2026", "Outside London: their firm gives a rise every 6 months for the first 3 years, then only a further rise and a small bonus on chartering. Moving jobs is where people step up."],
    ["2026", "Before chartership, 5 to 6 years in, £32–40k is the norm. Once chartered, it depends on the work you win and deliver."],
    ["2026", "Principal engineer, chartered: £65k."],
    ["2026", "£54k, fully remote for 5 years at a global renewables consultancy, designing onshore and offshore wind, solar and battery storage, and now data centres."],
    ["2026", "Network Rail, outside London: asset engineers £43k, seniors £55k, and the same for track maintenance and signalling engineers. You wouldn't normally join at senior level from outside, and would struggle without a railway background."],
    ["2026", "Rail consultancy design engineer, about a year from chartership: £38.9k."],
    ["Jul 2026", "Water design engineer who moved to a utility, home-based in the Midlands: £50k to £70k."],
    ["Jul 2026", "Contractor sub-agent, South Coast, 4 years, master's degree: £60k total package, plus mileage and a 10% pension match."],
    ["Jul 2026", "Tier 1 and 2 contractors pay their designers 10–20% more than consultancies, according to one commenter."],
    ["Jul 2026", "North of England: £60k + £5–10k bonus."],
    ["Sep 2026", "Public-sector highways assistant project manager: £37.5k with 35 days' leave."],
    ["early 2024", "Offshore wind, working for a developer, 10 years, chartered: £75k + 15% bonus. Moved from bridges and oil and gas via an onshore wind consultancy."],
    ["early 2024", "Contractor, 11 years, not chartered: £67k + 10% bonus + £28k subsistence for working away from home."],
    ["early 2024", "Highways, 5 years: about £38k."],
    ["early 2024", "North West: the going rate for a consultancy senior engineer is about £35–40k."],
    ["early 2024", "Principal contractor, Birmingham: started on £30k, £35k after a year including car allowance."],
    ["early 2024", "Graduate offers at one large consultancy varied by division: around 2015–17, nuclear and power paid £30k + £2.5k joining bonus + £2.5k chartership bonus, while infrastructure paid £23k."],
    ["2023", "London consultancy, civil engineer not yet senior, EngTech MICE, part-time degree, moved employer twice: about £46k. Replies said another £10k plus bonus and car allowance was possible by moving."]
  ];

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

  function med(a) { a = a.slice().sort(function (x, y) { return x - y; }); var n = a.length; return n % 2 ? a[(n - 1) / 2] : (a[n / 2 - 1] + a[n / 2]) / 2; }
  function kk(n) { return "£" + (Math.round(n * 10) / 10) + "k"; }
  function accBands() {
    return [["4–5 years", 4, 5.9], ["6–9 years", 6, 9.9], ["10–15 years", 10, 15.9], ["16+ years", 16, 99]].map(function (b) {
      var v = ACC.filter(function (a) { return a[0] >= b[1] && a[0] <= b[2]; }).map(function (a) { return a[1]; });
      return [b[0], v.length, kk(Math.min.apply(null, v)) + "–" + kk(Math.max.apply(null, v)), kk(med(v))];
    });
  }
  function bySide(t) { var v = ACC.filter(function (a) { return a[0] >= 6 && a[2] === t; }).map(function (a) { return a[1]; }); return [kk(med(v)), v.length]; }
  function accText(a) {
    var t = { con: "consultancy", ctr: "contractor", cli: "client side" }[a[2]], c = { y: "chartered", n: "not chartered" }[a[3]];
    return [a[0] + " years", t, c, a[4]].filter(Boolean).join(", ") + ": £" + a[1] + "k" + (a[6] ? " (" + a[6] + ")" : "") + ".";
  }
  function themes() {
    var con = bySide("con"), cli = bySide("cli");
    return [
      ["Moving employer is where the money is",
        "The biggest single rises in these threads nearly all come with a change of employer, often £7–25k in one go. People who stay describe small yearly rises and a one-off bump when they charter.",
        [["Nov 2026", "London, 5 years, not chartered: £42k to £49k by moving."], ["Nov 2026", "London project manager, 4 years: £38.5k to £55k by moving."], ["Jul 2026", "Water design engineer: £50k to £70k moving to a utility."], ["Jul 2026", "Consultancy engineer, 10 years: £44k to £70k base moving to an energy client."], ["Sep 2026", "Technician, 8 years: £34k to £60k plus car allowance and bonus moving to a water company."], ["early 2024", "Site engineer: £38k to £45k on moving at year 8, then £93k as a technical director by year 14."]],
        [["early 2024", "A London engineer who never moved reached £42k at 4 years and felt underpaid."], ["2026", "One firm gives rises every 6 months for 3 years, then only a small rise on chartering."]]],
      ["Client, utility and developer side pays more than consultancy",
        "Among engineers with 6 or more years who said who they work for, the client-side median is " + cli[0] + " (" + cli[1] + " people) against " + con[0] + " in consultancy (" + con[1] + " people). Small numbers, but each single jump of £20k or more in these threads was a move to a client, utility or developer. Commenters blame consultancies competing on fees. It isn't universal: client roles in the public sector and water can pay less.",
        [["Jul 2026", "Rail, client side, chartered, 6 years: £65k."], ["Jul 2026", "Energy client, 10 years: £70k base, from £44k at a consultancy."], ["Jul 2026", "Utility design reviewer: £70k, from £50k."], ["early 2024", "Offshore wind developer, chartered, 10 years: £75k + 15% bonus."]],
        [["Jul 2026", "Water process design engineer, client side, chartered, 16 years: £53k."], ["Sep 2026", "Public-sector highways assistant project manager: £37.5k, but with 35 days' leave."]]],
      ["Chartership matters less to pay than people expect",
        "Plenty of engineers without chartership report principal or associate pay, and the recruiter data above puts the chartered uplift at only 4–10% in highways. Where it bites is in consultancies that tie promotion to it. It opens grades rather than adding a fixed amount.",
        [["Jul 2026", "Not chartered, 22 years, consultancy: £78k."], ["2024–25", "Not chartered, 8 years: £71k + 15% bonus."], ["early 2024", "Contractor, not chartered, 11 years: £67k + 10% bonus + £28k subsistence."], ["Jul 2026", "Client-side design manager, not chartered, 8 years: £50k."], ["Jul 2026", "Several commenters say non-chartered principals and associate directors are common where they work."]],
        [["Jul 2026", "Highways at a large consultancy, 10 years: £36k, told there's no rise until chartered."], ["Nov 2026", "A consultancy hiring manager: about £37k before chartership, low £40s after."], ["Jul 2026", "Chartered isn't a guarantee either: chartered seniors report £48k at 8 years and £53k at 16."]]],
      ["Contracting pays more, and asks more",
        "Contractors and housebuilders are said to pay 10–20% more than consultancies, often with a car, bonus and better pension match. The trade is longer hours, site work and moving around. Energy, power, transmission, utilities and water were the sectors most often named as best paid (Oct 2026).",
        [["Jul 2026", "Contractor sub-agent, South Coast, 4 years: £60k package, plus mileage and a 10% pension match."], ["early 2024", "Tunnelling contractor: £64k by year 2."], ["Oct 2026", "Housebuilding: engineer £36–55k, senior £55–70k, each with bonus and car."], ["Jul 2026", "Contract designers: about £500 a day."]],
        []],
      ["Technicians and CAD can match engineers, up to a point",
        "Experienced technicians report £54–65k, more than many engineers of the same age, and in one firm CAD staff out-earn engineers at 5 years. But the spread is wide (£26.5k at 8 years at the bottom), and one commenter puts the ceiling at about £50–60k. Moving into a checking or reviewing role at a utility is one way past it.",
        TECH, []],
      ["Titles have inflated, so compare years and work, not titles",
        "One commenter says principal used to mean about 8 years' experience and associate about 12, and now sees 5 and 6–7 (Nov 2026). So one title covers a wide range: principals on £45–55k in one area and £65k elsewhere; seniors on £35–40k in the North West against £45–48k in London. Six figures usually means director level. One commenter puts top chartered engineers at £85–100k (Jul 2026), close to the £95–120k Carrington West gives highways directors.",
        [], []],
      ["Graduate pay has kept pace with prices, but no more",
        "One large consultancy offered infrastructure graduates £23k around 2015–17. Offers quoted in 2026 are £31.5–35k, and the 2024 survey median for 0–2 years is £31k. Prices rose by roughly 40% over that time (our rough figure from CPI), so in real terms starting pay is about flat.",
        [], []]
    ];
  }
  function drawReddit() {
    var ev = function (l) { return l.map(function (e) { return "<li>" + esc(e[1]) + ' <span class="small">(' + esc(e[0]) + ")</span></li>"; }).join(""); };
    return '<h4>What engineers said on Reddit</h4>' +
      '<p class="small">Seven r/civilengineering and r/UKJobs threads on UK pay, posted between 2023 and November 2026, plus comments shared with us in November 2026. Every figure carries the date it was posted. These are individual accounts, not a sample: people who post are not typical, and older figures will be lower than today\'s. Accounts from the US, Australia and elsewhere, and arguments about cost of living, are left out.</p>' +
      '<div class="rd-box"><h5>Engineers\' pay by experience, as reported in 2026</h5>' +
      '<table class="car-tbl"><thead><tr><th>Experience</th><th>Accounts</th><th>Range</th><th>Median</th></tr></thead><tbody>' +
      accBands().map(function (r) { return "<tr><td>" + r[0] + "</td><td>" + r[1] + "</td><td>" + r[2] + "</td><td><strong>" + r[3] + "</strong></td></tr>"; }).join("") + "</tbody></table>" +
      '<p class="small">Base salary from ' + ACC.length + ' engineers who gave both their pay and their years of experience. Technicians, total-package figures and the outliers below are kept out. The 4–5 year median sits well above the 2024 survey\'s (£37.3k), probably because several London and energy accounts fall in that band; from 6 years on the two roughly agree.</p></div>' +
      "<h4>What the accounts point to</h4>" +
      '<div class="rd-themes">' + themes().map(function (t) {
        var n = t[2].length + t[3].length;
        return '<section class="rd-th"><h5>' + esc(t[0]) + "</h5><p>" + esc(t[1]) + "</p>" +
          (n ? '<details class="car-more"><summary>The accounts (' + n + ")</summary>" + (t[2].length ? '<ul class="car-quotes">' + ev(t[2]) + "</ul>" : "") +
            (t[3].length ? '<p class="small rd-but">Pointing the other way</p><ul class="car-quotes">' + ev(t[3]) + "</ul>" : "") + "</details>" : "") + "</section>";
      }).join("") + "</div>" +
      '<div class="rd-out"><h5>Outliers, shown but not counted</h5><ul>' + OUT.map(function (o) { return "<li><strong>" + esc(o[0]) + "</strong> " + esc(o[2]) + ' <span class="small">(' + esc(o[1]) + ")</span></li>"; }).join("") + "</ul></div>" +
      '<details class="car-more"><summary>Pay ladders commenters quoted (' + BANDS.length + ")</summary>" +
      '<table class="car-tbl rd-bands"><tbody>' + BANDS.map(function (b) { return "<tr><td><strong>" + esc(b[0]) + '</strong><br><span class="small">' + esc(b[1]) + "</span></td><td>" + esc(b[2]) + "</td></tr>"; }).join("") + "</tbody></table>" +
      '<p class="small">One commenter warns that recruiters can overstate what you could earn to win their fee. That applies to the recruiter bands on this page too.</p></details>' +
      '<details class="car-more"><summary>Pay over time, as people reported it (' + TL.length + ")</summary>" +
      '<ul class="tl-list">' + TL.map(function (t) { return '<li><div class="tl-h"><strong>' + esc(t[0]) + '</strong><span class="small">' + esc(t[1]) + '</span></div><div class="tl-steps">' + t[2].map(function (x) { return x === "C" ? '<span class="tl-c">Chartered</span>' : "<span>" + esc(x) + "</span>"; }).join("") + "</div></li>"; }).join("") + "</ul></details>" +
      '<details class="car-more"><summary>Every account (' + (ACC.length + TECH.length + REDDIT.length) + ")</summary>" +
      '<p class="small rd-but">Engineers, 2026 threads</p><ul class="car-quotes">' + ACC.map(function (a) { return "<li>" + esc(accText(a)) + ' <span class="small">(' + a[5] + ")</span></li>"; }).join("") + "</ul>" +
      '<p class="small rd-but">Technicians and CAD</p><ul class="car-quotes">' + ev(TECH) + "</ul>" +
      '<p class="small rd-but">Other comments</p><ul class="car-quotes">' + ev(REDDIT) + "</ul></details>" +
      '<p class="small">We couldn\'t read Glassdoor directly because it blocks automated access.</p>';
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
      "<h4>Highways, with and without chartership</h4>" +
      '<table class="car-tbl"><thead><tr><th>Highways grade</th><th>Range</th><th>Typical</th></tr></thead><tbody>' +
      CW.map(function (r) { return "<tr" + (r[4] ? ' class="cw-ch"' : "") + "><td>" + esc(r[0]) + "</td><td>" + k(r[1]) + "–" + k(r[2]) + "</td><td>" + k(r[3]) + "</td></tr>"; }).join("") + "</tbody></table>" +
      '<p class="small">' + cite("cw") + '. Highways only. The guide says pay can be higher on large national infrastructure schemes.</p>' +
      "<p><strong>What chartership adds:</strong> in this guide, the typical chartered salary is £5k higher at senior grade (+10%), £5k higher at principal (+9%) and £3k higher at associate (+4%). That is well below the 15–25% another recruiter claims without a source. In the 2024 survey below, the gap is wider (£65k against £50.8k), but the chartered group there also has more experience. In our view, chartership's bigger effect is on which grades you can reach at all.</p>";
    var rp = $("car-reported"); if (rp) rp.innerHTML =
      '<table class="car-tbl"><thead><tr><th>What</th><th>Figure</th><th>Based on</th><th>Source</th></tr></thead><tbody>' +
      REPORTED.map(function (r) { return "<tr><td>" + esc(r[0]) + "</td><td>" + esc(r[1]) + "</td><td>" + esc(r[2]) + "</td><td>" + cite(r[3]) + "</td></tr>"; }).join("") + "</tbody></table>" +
      '<p><strong>Where these disagree with the published figures:</strong> self-reported pay runs lower. PayScale\'s senior engineer median (£45k) sits at the bottom of the recruiter\'s senior band (£45–62k) and well under the ONS median for all civil engineers (£52.5k). Its chartered average (£46k) is also below the ONS median. Our guess at why, which isn\'t measured: people who fill in these sites are often early in their career or checking whether they\'re underpaid. Treat them as a floor rather than the norm.</p>' +
      "<h4>2024 salary survey: 54 UK engineers</h4>" +
      "<p>An open online survey with about 1,880 responses, mostly from the US. We used only the 62 from the UK. From those we set aside one salary that looks like a typing error (£450k for 2 years' experience), one self-employed director, and six apprentices and trainees (£19–27k). That leaves 54 people. " + cite("svy") + "</p>" +
      '<table class="car-tbl"><thead><tr><th>Experience</th><th>People</th><th>Middle half</th><th>Median</th></tr></thead><tbody>' +
      SURVEY.map(function (r) { return "<tr><td>" + esc(r[0]) + "</td><td>" + r[1] + "</td><td>" + esc(r[2]) + "</td><td><strong>" + esc(r[3]) + "</strong></td></tr>"; }).join("") + "</tbody></table>" +
      "<p><strong>Chartered or not:</strong> among people with 6 or more years' experience, the 12 chartered engineers had a median of £65k and the 14 who weren't chartered had £50.8k. Chartered people also tended to have more experience, so not all of that gap is down to chartership. London had only 5 responses, too few to compare with the rest of the UK.</p>" +
      drawReddit();
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
