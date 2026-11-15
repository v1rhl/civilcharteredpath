/* Civil Chartered Path: the visitor's role (consultant, contractor, client ...).
   Our own judgement about where each role usually finds evidence harder: not ICE guidance.
   Remembered in this browser (cp-role). Nothing is hidden by the choice; it only changes what comes first. */
(function () {
  "use strict";

  var ROLES = [
    {
      id: "designer", label: "Consultant or designer", short: "Consultant",
      blurb: "Design, advice and studies for a client, often at a consultancy.",
      weak: [3, 4],
      decks: ["Consultancy appointments", "Design standards", "Commercial and delivery", "Site supervision"],
      evidence: {
        1: "Design decisions you made and why: options compared, calculations you owned, and how you checked the result. Add what you learned from seeing it built.",
        2: "Leading a work package or a small design team, briefing and checking others' work, and improving a design or checking process.",
        3: "More than fee tracking: your appointment (PSC, ACE, bespoke), forecasting and change control, and how your design choices changed construction cost and programme.",
        4: "CDM designer duties in practice: hazards you designed out, residual risks you passed on clearly, and what you did when you saw something on site.",
        5: "Carbon and whole-life choices in your design, with numbers, and how you persuaded the client to take the lower-carbon option.",
        6: "Explaining technical advice to clients, the public or contractors, and handling a disagreement over the design.",
        7: "Knowing the limits of your competence, asking for checks, and putting public safety ahead of the client's or your firm's wishes."
      },
      build: {
        3: [
          "Ask to own the fee forecast and change control for one work package, not just book time to it.",
          "Volunteer on a bid: the fee build-up, risk register and programme teach you how jobs are won and priced.",
          "Learn the construction contract on your own project (the ECC option, how compensation events are valued) and ask to sit in on a valuation or CE assessment.",
          "Ask for a spell as assistant Project Manager or NEC Supervisor on a scheme you designed."
        ],
        4: [
          "Get to site with a purpose: check a detail you designed is buildable, attend a temporary works briefing, walk the job with the site manager.",
          "Ask for a short secondment to a contractor or resident engineer team, even a few weeks.",
          "Lead the designer's risk assessment workshop on your next scheme and follow one residual risk through to site.",
          "Take a site safety course (such as SSSTS) and read CROSS reports in your field."
        ]
      }
    },
    {
      id: "contractor", label: "Contractor", short: "Contractor",
      blurb: "Building, temporary works and site delivery, on the contractor's side.",
      weak: [1, 5],
      decks: ["Contracts", "Site supervision", "H&S", "Commercial and delivery"],
      evidence: {
        1: "Technical decisions you made, not just ones you built: temporary works design or checks, alternative methods, solving a site problem with analysis, and why your solution was right.",
        2: "Running a section or a gang, planning and sequencing work, developing people, and improving quality or productivity on site.",
        3: "Usually a strength: your contract option, valuations, compensation events, cost and programme control. Show your own decisions and numbers.",
        4: "Usually a strength: RAMS you wrote, lifting or temporary works you controlled, when you stopped work, and how you improved the safety culture.",
        5: "Beyond waste skips: carbon you measured and cut, materials you substituted, reuse, social value and biodiversity you delivered on site.",
        6: "Briefings, dealing with residents and the client's team, and resolving disagreements with subcontractors or the designer.",
        7: "Standing up for safety and quality under programme pressure, knowing when to call in the designer, and your CPD."
      },
      build: {
        1: [
          "Take on temporary works design or design checking (with a competent checker), or step up to Temporary Works Coordinator.",
          "Own a technical query or value engineering proposal end to end, including the calculations, not just passing it to the designer.",
          "Ask for a secondment to your design team, a design and build partner's office, or the estimating team on an alternative design at tender.",
          "Write up the engineering reasoning behind a method you chose: options, loads, risks and why you rejected the others."
        ],
        5: [
          "Volunteer to measure carbon on your job (PAS 2080 asks contractors to report it) and propose one change that cuts it.",
          "Lead a materials or reuse initiative: recycled aggregate, cement replacement, cut and fill balance.",
          "Get involved in the project's social value or biodiversity commitments and own one of them."
        ]
      }
    },
    {
      id: "client", label: "Client or asset owner", short: "Client side",
      blurb: "Asset management, sponsoring or commissioning work for an owner or operator.",
      weak: [1, 4],
      decks: ["Contracts", "Commercial and delivery", "Leadership and EDI", "Ethics and judgement"],
      evidence: {
        1: "Your own engineering judgement, not just managing consultants: a technical review you did yourself, an assessment you carried out, or a decision where you challenged the designer's approach.",
        2: "Leading a programme or portfolio, setting direction for consultants and contractors, and improving how your organisation delivers.",
        3: "Often a strength: business cases, procurement choices, managing contracts as client or Project Manager, and value for money.",
        4: "Client duties under CDM 2015 in practice (appointments, pre-construction information, checking arrangements), plus operational safety on your assets.",
        5: "Setting carbon and sustainability requirements, whole-life decisions about assets, and adapting them to climate change.",
        6: "Communicating with the public, regulators and your board, and handling competing stakeholder demands.",
        7: "Acting in the public interest when budgets are tight, and being honest about asset risks."
      },
      build: {
        1: [
          "Do the technical review of a consultant's design yourself, with your own check calculations, and record where you disagreed and why.",
          "Carry out an in-house assessment or inspection (condition, capacity, flood risk) rather than commissioning it.",
          "Ask for a secondment to your delivery partner's design or site team.",
          "Lead the technical part of an option appraisal and own the recommendation."
        ],
        4: [
          "Spend time on site with your delivery partners and attend their safety meetings, inspections and incident reviews.",
          "Lead a CDM client duty properly: write the pre-construction information or check the construction phase plan.",
          "Get involved in operational safety on your assets: confined space entry, working near water, isolation and permits."
        ]
      }
    },
    {
      id: "public", label: "Regulator or public body", short: "Public body",
      blurb: "Local authority, government agency or regulator, including in-house engineering teams.",
      weak: [3, 4],
      decks: ["Commercial and delivery", "Contracts", "Design standards", "Ethics and judgement"],
      evidence: {
        1: "Engineering judgement in your decisions: technical assessments, consent or approval decisions you made, and in-house designs if your team does them.",
        2: "Leading a team or programme, influencing other organisations without authority over them, and improving processes.",
        3: "Public money and value for money: funding bids, business cases, procurement and contract management. Show your own decisions, not just the process.",
        4: "Your organisation's duties as client or regulator, enforcement or approvals with a safety angle, and what you saw and did on site.",
        5: "Policy and decisions that change outcomes: flood resilience, carbon, biodiversity and how you balanced them against cost.",
        6: "Explaining decisions to the public, councillors and developers, and handling objections.",
        7: "Impartiality, acting in the public interest, and handling pressure from developers or politics."
      },
      build: {
        3: [
          "Ask to manage a contract or framework call-off yourself, including payments and change.",
          "Lead or write part of a funding bid or business case, with the costs and benefits.",
          "Shadow your commercial or procurement team through one tender, from strategy to award."
        ],
        4: [
          "Get to site on schemes you fund, approve or regulate, and attend the contractor's safety briefings.",
          "Take ownership of a CDM client role for a council scheme.",
          "If you inspect or enforce, write up one case where safety drove your decision."
        ]
      }
    },
    {
      id: "academic", label: "Academic or research", short: "Academic",
      blurb: "University, research or teaching, with or without industry work.",
      weak: [1, 3, 4],
      decks: ["Site supervision", "Commercial and delivery", "H&S", "Ethics and judgement"],
      evidence: {
        1: "Applying engineering to real problems: industry projects, consultancy through your university, or research that changed practice. Reviewers want practical application, not just theory.",
        2: "Leading a research group or project, supervising students and staff, and managing programmes and deadlines.",
        3: "Grant budgets, bids and contracts with industry partners count, if you show your own cost and programme decisions.",
        4: "Lab, field and site safety you were responsible for: risk assessments, supervising others, and safety in fieldwork.",
        5: "Research or practice that improves sustainability, and how you put it into use.",
        6: "Teaching, papers, talks to industry and the public, and explaining research to non-specialists.",
        7: "Research ethics, integrity, the public interest and your own development."
      },
      build: {
        1: [
          "Look for an industry secondment, a knowledge transfer partnership, or paid consultancy through your university on a real scheme.",
          "Work with an industry partner to apply your research on a live project, and record the engineering decisions you made.",
          "Spend time on site with a contractor or client partner."
        ],
        3: [
          "Own the budget and contract for a grant or industry-funded project, including changes.",
          "Join an industry partner's bid or tender to see how work is priced and won."
        ],
        4: [
          "Take responsibility for lab or fieldwork risk assessments and supervision, and write up a case where you improved safety.",
          "Do a site safety course and spend time on an industry site."
        ]
      }
    },
    {
      id: "other", label: "Other or mixed", short: "Mixed",
      blurb: "A mix of roles, or something else.",
      weak: [],
      decks: [],
      evidence: {},
      build: {}
    }
  ];

  var GENERAL_TIPS = [
    "Ask your Supervising Civil Engineer or delegated engineer to help plan experience against the attributes you're light on.",
    "Your ICE Membership Development Officer can advise on gaps and how others have filled them.",
    "Be specific in what you ask your manager for: one task, one project, a set number of weeks. That's easier to say yes to than 'more experience'.",
    "Write up new experience as you go, in the attribute's terms, so it's ready for your report."
  ];

  var ROLE = (function () { try { var r = localStorage.getItem("cp-role"); return ROLES.some(function (x) { return x.id === r; }) ? r : ""; } catch (e) { return ""; } })();
  var hooks = [];
  function byId(id) { for (var i = 0; i < ROLES.length; i++) if (ROLES[i].id === id) return ROLES[i]; return null; }
  function draw() {
    Array.prototype.forEach.call(document.querySelectorAll(".role-pick"), function (el) {
      el.innerHTML = '<span class="lp-label">Your role</span>' + ROLES.map(function (r) {
        return '<button type="button" data-role="' + r.id + '" aria-pressed="' + (r.id === ROLE) + '" title="' + r.blurb + '">' + r.label + "</button>";
      }).join("") + (ROLE ? '<button type="button" class="role-clear" data-role="">Clear</button>' : "");
    });
    if (ROLE) document.documentElement.setAttribute("data-role", ROLE); else document.documentElement.removeAttribute("data-role");
    Array.prototype.forEach.call(document.querySelectorAll("[data-role-name]"), function (el) { var r = byId(ROLE); el.textContent = r ? r.label.toLowerCase() : ""; });
  }
  function set(id) {
    ROLE = byId(id) ? id : "";
    try { if (ROLE) localStorage.setItem("cp-role", ROLE); else localStorage.removeItem("cp-role"); } catch (e) {}
    draw(); hooks.forEach(function (f) { try { f(ROLE); } catch (e) {} });
  }
  document.addEventListener("click", function (e) { var b = e.target.closest(".role-pick [data-role]"); if (b) set(b.dataset.role); });

  window.ROLES = ROLES;
  window.ROLE_TIPS = GENERAL_TIPS;
  window.CPRole = {
    get: function () { return ROLE; },
    role: function () { return byId(ROLE); },
    byId: byId,
    set: set,
    on: function (f) { hooks.push(f); },
    draw: draw
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", draw); else draw();
})();
