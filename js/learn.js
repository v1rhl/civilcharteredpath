/* Civil Chartered Path: the Learning tab (#learning overview, #nec4, #cdm, #learn-theory).
   Everything here is our own explanation, written for engineers preparing for ICE professional review.
   It does not quote the NEC4 contracts, the CDM Regulations or HSE's L153, and it is not a substitute for reading them.
   Where an answer depends on the contract option, the Contract Data, Z clauses or the project, the text says so. */
(function () {
  "use strict";
  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function load(k, d) { try { var v = localStorage.getItem(k); return v == null ? d : v; } catch (e) { return d; } }
  function save(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* storage unavailable: keep working in memory */ } }
  function ext(url, label) { return '<a href="' + url + '" target="_blank" rel="noopener">' + label + "</a>"; }
  function ul(items) { return "<ul>" + items.map(function (x) { return "<li>" + x + "</li>"; }).join("") + "</ul>"; }
  function kn(items) {
    return '<div class="kn-list">' + items.map(function (x) {
      return "<details><summary><strong>" + x[0] + "</strong>" + (x[1] ? ' <span class="small">' + x[1] + "</span>" : "") + "</summary>" + x[2] + "</details>";
    }).join("") + "</div>";
  }
  function sec(id, title, intro, body, cls) {
    return '<section class="panel lr-sec' + (cls ? " " + cls : "") + '" id="' + id + '"><h3>' + title + "</h3>" + (intro ? "<p>" + intro + "</p>" : "") + body + "</section>";
  }
  function table(head, rows) {
    return '<div class="table-wrap"><table class="lr-table"><thead><tr>' + head.map(function (h) { return "<th>" + h + "</th>"; }).join("") + "</tr></thead><tbody>" +
      rows.map(function (r) { return "<tr>" + r.map(function (c, i) { return (i ? "<td>" : '<th scope="row">') + c + (i ? "</td>" : "</th>"); }).join("") + "</tr>"; }).join("") + "</tbody></table></div>";
  }
  function quiz(items) {
    return '<div class="qlist">' + items.map(function (x, i) {
      return '<details class="q"><summary><span class="tag">Q' + (i + 1) + '</span><span class="qt">' + x[0] + '</span><span class="chev">›</span></summary><div class="pointer">' + x[1] + "</div></details>";
    }).join("") + "</div>";
  }
  function asks(items) { return '<ul class="lr-asks">' + items.map(function (x) { return "<li><strong>" + x[0] + "</strong><span>" + x[1] + "</span></li>"; }).join("") + "</ul>"; }
  function toc(items) {
    return '<nav class="lr-toc" aria-label="On this page"><span class="small">On this page</span>' + items.map(function (x) { return '<button type="button" data-jump="' + x[0] + '">' + x[1] + "</button>"; }).join("") + "</nav>";
  }
  function note(html) { return '<div class="lr-note" role="note"><strong>A learning summary, not the source.</strong> ' + html + "</div>"; }
  function jumpable(root) {
    root.addEventListener("click", function (e) {
      var b = e.target.closest("button[data-jump]"); if (!b) return;
      var t = $(b.dataset.jump); if (!t) return;
      t.scrollIntoView({ behavior: "smooth", block: "start" });
      var d = t.querySelector("details:not([open])"); if (t.tagName === "DETAILS" && !t.open) t.open = true; void d;
    });
  }
  /* Chip switchers: buttons with data-k inside a .chips-row, one panel redrawn on click */
  function chips(group, list, current) {
    return '<div class="chips-row" role="group" aria-label="' + group + '">' + list.map(function (x) {
      return '<button type="button" data-k="' + x.id + '" aria-pressed="' + (x.id === current) + '">' + esc(x.label) + "</button>";
    }).join("") + "</div>";
  }
  function wireChips(row, onPick) {
    row.addEventListener("click", function (e) {
      var b = e.target.closest("button[data-k]"); if (!b) return;
      Array.prototype.forEach.call(row.querySelectorAll("button[data-k]"), function (x) { x.setAttribute("aria-pressed", String(x === b)); });
      onPick(b.dataset.k);
    });
  }

  /* =====================================================================
     NEC4
     ===================================================================== */
  var NEC_LINKS = {
    nec: ext("https://www.neccontract.com/", "NEC (neccontract.com)"),
    prog: ext("https://www.neccontract.com/news/why-an-up-to-date-accepted-programme-is-essential-for-success", "NEC on the Accepted Programme"),
    ceca: ext("https://www.ceca.co.uk/wp-content/uploads/2022/01/CECA-NEC4-Bulletin-No.13-Notifying-early-warnings-and-notifying-compensation-events-January-2022.pdf", "CECA NEC4 Bulletin 13 (early warnings and compensation events)"),
    jct: ext("https://www.jctltd.co.uk/", "JCT (jctltd.co.uk)"),
    dbw: ext("https://www.designingbuildings.co.uk/wiki/About", "Designing Buildings Wiki")
  };

  var OPTIONS = [
    { id: "A", label: "A: priced, activity schedule", pos: 8,
      what: "The Contractor prices a list of activities that together make up the works. The total is effectively a lump sum, broken into activities that are paid when they are complete.",
      pay: "Paid for each activity once it is finished, not for the cost actually spent.",
      risk: "The Contractor carries most of the cost risk: if the work costs more than its prices, it absorbs the difference unless the cause is a compensation event. The Client gets price certainty but pays for it through the Contractor's risk pricing.",
      when: "Scope that is well defined at tender, with low expected change. Common on smaller or repeat work.",
      watch: "The activity schedule must match the programme, and a poorly split schedule hurts cash flow. Compensation events are still assessed on forecast Defined Cost, so cost records still matter." },
    { id: "B", label: "B: priced, bill of quantities", pos: 27,
      what: "The Contractor prices rates against a bill of quantities prepared for the Client. The Contractor is paid the rates for the quantities actually done.",
      pay: "Remeasured: quantity of work done times the bill rate.",
      risk: "The Contractor carries the risk that its rates are too low; the Client carries the risk that quantities grow. Mistakes in the bill are the Client's problem and can be compensation events.",
      when: "Traditional design-by-client civils where the design is complete enough to measure. Familiar to anyone used to ICE Conditions or CESMM.",
      watch: "The method of measurement named in the contract governs the bill. Option B adds its own compensation events tied to the bill, so read that option's clauses." },
    { id: "C", label: "C: target, activity schedule", pos: 46,
      what: "The Contractor tenders a target price (as an activity schedule) and is paid its actual Defined Cost plus Fee as the job goes. At the end, the final cost is compared with the target and the difference is shared.",
      pay: "Defined Cost plus Fee, then a pain/gain adjustment at the end.",
      risk: "Shared. The share ranges and percentages in the Contract Data decide who carries how much of an overrun or saving. Compensation events move the target as well as the dates.",
      when: "Projects with uncertainty or a wish to collaborate on cost, such as many water, rail and highways frameworks.",
      watch: "Needs open-book cost records, auditing and good cost control on both sides. Disallowed Cost is a frequent source of argument." },
    { id: "D", label: "D: target, bill of quantities", pos: 60,
      what: "As Option C, but the target is built from a bill of quantities and is remeasured as quantities change.",
      pay: "Defined Cost plus Fee, with the target adjusted for remeasurement and compensation events, then pain/gain.",
      risk: "Shared through the pain/gain shares, with the Client also carrying quantity changes through the remeasured target.",
      when: "Less common in practice than Option C. Suits work with a measurable design but uncertain quantities.",
      watch: "You manage both the bill and actual cost, so the admin is heavier than either B or C alone." },
    { id: "E", label: "E: cost reimbursable", pos: 92,
      what: "The Contractor is paid its Defined Cost plus Fee, with no target.",
      pay: "Defined Cost plus Fee.",
      risk: "The Client carries almost all the cost risk. The Contractor's main risk is costs being disallowed.",
      when: "Emergency or very uncertain work, early works, or where scope can't be defined in time.",
      watch: "There is little built-in incentive to save, so the Client needs strong cost monitoring. Forecasts still matter." },
    { id: "F", label: "F: management contract", pos: 78,
      what: "A management contractor runs the project and lets the work in packages to subcontractors, doing little or none of the construction itself.",
      pay: "The subcontract costs (as Defined Cost) plus the management contractor's Fee, with its own management costs often priced separately.",
      risk: "The Client carries most of the cost risk of the subcontract packages; the management contractor's risk is mostly in its own management cost and fee.",
      when: "Large, complex or fast-track projects where design runs alongside construction.",
      watch: "Rare on typical civils jobs. Check exactly what the management contractor priced, because that varies." }
  ];

  var NEC_ROLES = [
    { id: "client", label: "Client",
      who: "The organisation paying for the works. NEC4 uses 'Client' where NEC3 said 'Employer'.",
      does: ["Gives the Contractor access to the site and anything the contract says it will provide, by the dates on the Accepted Programme.", "Pays the amounts the Project Manager certifies.", "Appoints the Project Manager and Supervisor and can replace them, after telling the Contractor.", "Otherwise acts mostly through the Project Manager, not directly."],
      trap: "Client staff asking for extras directly on site. That isn't an instruction under the contract. The change needs to come from the Project Manager (or someone the PM has delegated to, in the contract's communication form) to be a compensation event." },
    { id: "pm", label: "Project Manager",
      who: "Appointed by the Client to manage the contract for the Client. Can be in-house or a consultant. Unlike the Engineer under the old ICE Conditions, the PM isn't set up as an independent certifier; it acts for the Client, but must still follow the contract's procedures and assess fairly.",
      does: ["Instructs changes to the Scope, and stops or starts work.", "Accepts or rejects programmes, with reasons the contract allows.", "Gives early warnings, keeps the Early Warning Register and runs early warning meetings.", "Notifies compensation events arising from its own instructions, replies to the Contractor's notifications, accepts quotations or makes its own assessment.", "Assesses the amount due at each assessment date and certifies payment and Completion.", "Can delegate any of its actions, after telling the Contractor."],
      trap: "Missing a reply deadline. In several places NEC4 treats silence as acceptance once the Contractor has chased, and a late reply can itself be a compensation event." },
    { id: "sup", label: "Supervisor",
      who: "Appointed by the Client to look after quality: tests, inspections and Defects.",
      does: ["Carries out tests and inspections set out in the Scope.", "Notifies Defects and can instruct the Contractor to search for one.", "Issues the Defects Certificate at the end of the defects period."],
      trap: "The Supervisor can't change the Scope, accept a programme or agree a price. If a Supervisor's comment amounts to a change, get it confirmed by the PM. A search that finds no Defect may be a compensation event." },
    { id: "con", label: "Contractor",
      who: "The organisation that Provides the Works in line with the Scope.",
      does: ["Does the work, including any design the Scope gives it.", "Submits programmes for acceptance and keeps them up to date.", "Gives early warnings and attends early warning meetings.", "Notifies compensation events and submits quotations on time.", "Keeps the records the contract needs, especially on cost-based options.", "Corrects Defects."],
      trap: "Waiting for the PM to notify a compensation event that the Contractor should notify itself, then running out of time. Also acting on verbal requests that never become a proper instruction." },
    { id: "adj", label: "Adjudicator",
      who: "An independent person named in the contract (or appointed later) to decide disputes under the dispute resolution option (W1, W2 or W3).",
      does: ["Decides disputes referred within the W option's procedure, usually quickly.", "The decision binds the parties unless and until a tribunal (court or arbitrator) revises it.", "NEC4 adds a Senior Representatives stage to try to settle disputes first, and W3 sets up a Dispute Avoidance Board instead. Which applies depends on the option chosen and whether the UK Construction Act applies."],
      trap: "Each W option has its own steps and timescales. Read yours as soon as a disagreement looks likely, not when it's already a dispute." }
  ];

  var CE_STEPS = [
    ["Something happens", "Or is about to. Usually there's an early warning first. If it comes from the PM's own instruction or a changed decision, the PM should notify it as a compensation event at the time."],
    ["Contractor notifies", "For anything the PM hasn't notified, the Contractor notifies within <b>8 weeks</b> of becoming aware of it. Miss that and, in most cases, the right to more time or money is lost."],
    ["PM replies", "The PM decides whether it is a compensation event, normally within <b>1 week</b> (longer if agreed). If it is, the PM instructs a quotation. If the PM says nothing, the Contractor can chase, and continued silence for a further period (2 weeks in the NEC4 core text) counts as acceptance."],
    ["Contractor quotes", "Within <b>3 weeks</b> of the instruction: the change to the Prices and any delay to Completion or Key Dates, with the working and a revised programme if planned Completion moves."],
    ["PM responds", "Within <b>2 weeks</b>: accept it, ask for a revised quotation with reasons, or make its own assessment. Silence after a chasing notice leads to deemed acceptance again."],
    ["Implemented", "Once accepted or assessed, the Prices, Completion Date and Key Dates change. The assessment isn't revisited later just because the forecast turned out wrong."]
  ];

  var NEC_TIMES = [
    ["Early warning", "Contractor and PM", "As soon as either becomes aware", "A later compensation event can be assessed as if the warning had been given, so avoidable cost isn't paid"],
    ["First Early Warning Register", "PM", "Within 1 week of the starting date", "Risk management starts late, and the register and meetings are what the PM and Contractor are meant to work from"],
    ["First early warning meeting", "PM (Contractor attends)", "Within 2 weeks of the starting date", "As above"],
    ["Notify a compensation event", "Contractor", "Within 8 weeks of becoming aware", "Usually no change to the Prices or dates. Exceptions apply where the PM should have notified it"],
    ["Reply to a compensation event notification", "PM", "1 week, or longer if agreed", "Contractor can chase; continued silence counts as acceptance"],
    ["Quotation", "Contractor", "3 weeks from the PM's instruction", "PM can make its own assessment instead"],
    ["Reply to a quotation", "PM", "2 weeks", "Contractor can chase; continued silence counts as acceptance"],
    ["Accept or reject a programme", "PM", "2 weeks", "NEC4 lets the Contractor chase, after which the programme can be treated as accepted"],
    ["Any other reply", "Whoever must reply", "The 'period for reply' in the Contract Data", "A late reply by the PM or Supervisor can be a compensation event"]
  ];

  var NEC_INSTR = [
    ["Change the Scope", "Project Manager", "Not the Client's site team, not the Supervisor"],
    ["Stop or not start work", "Project Manager", ""],
    ["Accept a programme, quotation or design", "Project Manager", ""],
    ["Search for a Defect", "Supervisor", "If no Defect is found, it may be a compensation event"],
    ["Notify a Defect", "Supervisor or Contractor", "Either can notify"],
    ["Give an early warning", "Project Manager or Contractor", ""],
    ["Act for the PM", "Anyone the PM delegates to", "Only after the PM has told the Contractor"],
    ["A verbal 'just do it' in a meeting", "Nobody, yet", "Communications must be in the form the contract requires; get it confirmed through the agreed system"]
  ];

  var NEC_JCT = [
    ["Approach", "A management tool: procedures to deal with problems as they happen, and a duty to work in mutual trust and co-operation", "A more traditional allocation of rights and remedies, often dealt with after the event"],
    ["Language", "Short sentences, present tense, capitalised defined terms", "More conventional legal drafting"],
    ["Who runs it", "Project Manager and Supervisor", "Architect or Contract Administrator, often with a quantity surveyor and clerk of works"],
    ["Change", "One compensation event deals with both time and money, assessed mostly on forecast cost before the work is done", "Variations are valued separately from extensions of time (relevant events) and loss and expense (relevant matters), often after the work"],
    ["Programme", "Central: accepted, updated, and used to assess delay", "Usually required, but generally doesn't carry the same contractual weight"],
    ["Risk", "Early warnings, a register and meetings are built in", "No equivalent formal process in the standard forms"],
    ["Time bars", "Strict: the 8-week compensation event notice", "Notices are required, but the standard forms generally don't bar claims in the same way. Amended forms often add one, so check"],
    ["Pricing routes", "One contract with six main options", "A different form for each route (for example, standard building, design and build, intermediate, minor works)"],
    ["Where you'll see it", "Most UK public infrastructure: highways, rail, water, flood defence", "Most UK building work"]
  ];

  function optionView(o) {
    return '<div class="lr-opt"><div class="lr-scale" aria-hidden="true"><span class="lr-scale-l">Contractor carries more cost risk</span><span class="lr-scale-r">Client carries more</span>' +
      '<div class="lr-track">' + OPTIONS.map(function (x) { return '<i class="' + (x.id === o.id ? "on" : "") + '" style="left:' + x.pos + '%">' + x.id + "</i>"; }).join("") + "</div></div>" +
      "<h4>Option " + o.id + "</h4><p>" + o.what + "</p>" +
      "<dl class=\"lr-dl\"><dt>How it's paid</dt><dd>" + o.pay + "</dd><dt>Who carries the risk</dt><dd>" + o.risk + "</dd><dt>When you see it</dt><dd>" + o.when + "</dd><dt>Watch out for</dt><dd>" + o.watch + "</dd></dl>" +
      '<p class="small">The scale is a rough guide, not a measure. The real split depends on the Contract Data, share ranges, secondary options and any Z clauses.</p></div>';
  }
  function roleView(r) {
    return '<div class="lr-role"><p class="lr-who">' + r.who + "</p><h4>What they do</h4>" + ul(r.does) + '<div class="lr-trap"><span class="eyebrow">Where people get caught out</span><p>' + r.trap + "</p></div></div>";
  }

  function renderNec() {
    var root = $("nec4-body"); if (!root) return;
    var opt = load("cp-nec-opt", "C"), role = load("cp-nec-role", "pm");
    if (!OPTIONS.some(function (o) { return o.id === opt; })) opt = "C";
    if (!NEC_ROLES.some(function (o) { return o.id === role; })) role = "pm";
    root.innerHTML =
      note("This page explains NEC4 in our own words to help you revise. It doesn't reproduce the contract and it isn't legal advice. What actually applies on your job is set by your contract: the main option, the Contract Data, the Scope, the secondary options and any Z clauses, plus whichever amendment of NEC4 it uses. Read the contract itself (from " + NEC_LINKS.nec + ") and ask your commercial team. Timescales below are the NEC4 core defaults and can be changed by your contract.") +
      toc([["nec-why", "Why it matters"], ["nec-family", "The NEC4 family"], ["nec-options", "Options A to F"], ["nec-roles", "Roles"], ["nec-structure", "How it's built"], ["nec-prog", "Programme"], ["nec-ew", "Early warning"], ["nec-ce", "Compensation events"], ["nec-ewce", "EW vs CE"], ["nec-cost", "Cost and payment"], ["nec-instr", "Who instructs what"], ["nec-times", "Deadlines"], ["nec-jct", "NEC vs JCT"], ["nec-review", "At review"], ["nec-test", "Test yourself"], ["nec-read", "Read the source"]]) +

      sec("nec-why", "Why it matters for chartership", "Commercial understanding sits in " + '<a href="#attributes-3">Attribute 3</a>' + ". Reviewers don't expect you to be a quantity surveyor, but they do expect you to know which contract your project used, what that meant for risk, and how change was handled. Most candidates on infrastructure work have used NEC, so it comes up often.",
        ul(["Name the contract and main option on your project, and say what that meant for who carried cost risk.", "Describe a real change: who spotted it, whether there was an early warning, how it became (or didn't become) a compensation event, and the outcome.", "Show you understand your own part in the process, even if you weren't the PM. Designers create early warnings and compensation events too, for example through late information or design changes."])) +

      sec("nec-family", "The NEC4 family", "NEC4 was published in 2017 and has had amendments since, so check which edition and amendment your contract uses. All the contracts share the same style and core ideas; the one you'll meet most is the ECC.",
        kn([
          ["ECC: Engineering and Construction Contract", "the main one", "<p>For engineering and construction work of any size, with or without Contractor design. Everything else on this page is about the ECC unless it says otherwise.</p>"],
          ["ECSC: Engineering and Construction Short Contract", "simpler work", "<p>A cut-down version for straightforward, lower-risk work. Fewer procedures and options.</p>"],
          ["ECS and ECSS: the subcontracts", "back-to-back", "<p>Subcontract versions of the ECC and short contract, so a main contractor can pass the same procedures down the chain. If you've seen 'ECS' in a list, it usually means the subcontract.</p>"],
          ["PSC: Professional Service Contract", "consultants", "<p>Used to appoint designers, project managers and other consultants. If you work for a consultancy, your own appointment may well be a PSC. It uses a smaller set of main options than the ECC, so check which one applies.</p>"],
          ["TSC: Term Service Contract", "maintenance over time", "<p>For services delivered over a period rather than a single project, such as highway or asset maintenance. Work is often ordered as task orders.</p>"],
          ["Supply Contract", "goods", "<p>For buying high-value plant and materials, such as pumps or switchgear, with a short version for simpler purchases.</p>"],
          ["Others", "", "<p>Alliance, framework, design build and operate, and the contract used to appoint an adjudicator. You're less likely to be asked about these, but know that they exist.</p>"]
        ])) +

      sec("nec-options", "The main options A to F", "Every ECC has exactly one main option. It decides how the Contractor is paid and therefore who carries the cost risk. Pick one to see what it means.",
        chips("Main option", OPTIONS.map(function (o) { return { id: o.id, label: o.label }; }), opt) + '<div id="nec-opt-view">' + optionView(OPTIONS.filter(function (o) { return o.id === opt; })[0]) + "</div>", "tool") +

      sec("nec-roles", "The spirit of the contract, and who does what", "Two ideas run through the whole contract. First, the Client, Contractor, Project Manager and Supervisor must act as the contract says. Second, they must act in a spirit of mutual trust and co-operation. NEC4 states these as separate obligations. The second doesn't override the detailed procedures, but it shapes how they're used: raise problems early, share information, and don't sit on a deadline to catch the other side out.",
        chips("Role", NEC_ROLES, role) + '<div id="nec-role-view">' + roleView(NEC_ROLES.filter(function (r) { return r.id === role; })[0]) + "</div>", "tool") +

      sec("nec-structure", "How an ECC is put together", "The contract you sign is assembled from parts. Knowing the parts helps you find the answer to any question quickly.",
        kn([
          ["Core clauses", "the same in every ECC", "<p>Nine sections, in this order: general matters (including communications and early warning), the Contractor's main responsibilities, time (including the programme), quality management (tests and Defects), payment, compensation events, title, liabilities and insurance, and termination.</p>"],
          ["Main option clauses", "one of A to F", "<p>Add to and change the core clauses for that payment method, for example how the Price for Work Done to Date is worked out and how compensation events are assessed.</p>"],
          ["Dispute resolution option", "W1, W2 or W3", "<p>Which one depends on whether the UK Construction Act applies to the contract and whether a Dispute Avoidance Board is wanted.</p>"],
          ["Secondary options", "X and Y(UK) clauses", "<p>Optional extras chosen by the Client, such as price adjustment for inflation (X1), sectional completion (X5), delay damages (X7), Contractor's design liability (X15), retention (X16), limitation of liability (X18), and the UK-specific options for project bank accounts, the Construction Act and third-party rights. Your contract lists which are included.</p>"],
          ["Z clauses", "bespoke amendments", "<p>Additional conditions written for the project or by the Client's organisation. They can change anything, including shifting risk or adding time bars, and they're where most of the surprises are. Always ask whether there are Z clauses and read them. Heavy amendment can undermine the balance and clarity the standard form is designed for, which is a good point to make at review.</p>"],
          ["Contract Data", "the project-specific facts", "<p>Part one is filled in by the Client and part two by the Contractor: dates, the period for reply, assessment interval, fee percentage, share ranges, insurance levels and more. Many answers to 'how long do we have?' are here, not in the clauses.</p>"],
          ["Scope and Site Information", "what and where", "<p>The Scope describes the works and any constraints on how they're done. NEC4 calls it the Scope; NEC3 called it the Works Information. Site Information describes the site and its surroundings, and matters when assessing physical conditions.</p>"]
        ])) +

      sec("nec-prog", "The programme and the Accepted Programme", "Under NEC the programme is a contract management tool, not just a planning document. The Accepted Programme is the one the PM has most recently accepted (or the one named in the Contract Data). Delay from compensation events is measured against it, so an out-of-date Accepted Programme makes every assessment harder. See " + NEC_LINKS.prog + ".",
        ul(["<b>What it must show.</b> The contract lists the content required: key dates, planned Completion, the order and timing of the work, float, time risk allowances, what the Contractor needs from others and when, and more. Read that clause rather than relying on a summary.",
          "<b>Acceptance.</b> The PM accepts it or gives reasons for not accepting it within 2 weeks. The contract limits the reasons the PM can give, for example that the plan isn't practicable or doesn't show what the contract requires. NEC4 added a way for the Contractor to chase a PM who doesn't respond, after which the programme can be treated as accepted. Check the exact steps in your version.",
          "<b>No programme, less money.</b> If no programme is identified in the Contract Data, part of the payment can be held back until the Contractor submits a first programme.",
          "<b>Revisions.</b> The Contractor submits revised programmes at the interval set in the Contract Data, or when the PM instructs. A quotation that delays planned Completion should come with a revised programme.",
          "<b>Float.</b> Delay is measured by how far planned Completion moves. Float within the programme can absorb delay; time between planned Completion and the Completion Date (terminal float) stays with the Contractor. Time risk allowances belong to the Contractor too.",
          "<b>Completion Date versus planned Completion.</b> The Completion Date is the contractual date. Planned Completion is when the Contractor plans to finish, which may be earlier. Accepting a programme doesn't change the Completion Date; only a compensation event does."])) +

      sec("nec-ew", "Early warning", "Early warning is how NEC tries to deal with problems while they're still cheap to fix.",
        ul(["<b>Who and when.</b> The Contractor and the PM each give an early warning as soon as they become aware of something that could increase the Prices, delay Completion or a Key Date, or impair how the finished works perform. The Contractor can usually also warn of other matters set out in the contract.",
          "<b>The Early Warning Register.</b> NEC4's name for what NEC3 called the risk register. The PM issues the first one within 1 week of the starting date, listing the matters in the Contract Data, and keeps it up to date.",
          "<b>Meetings.</b> The first early warning meeting is within 2 weeks of the starting date, then at the interval in the Contract Data. Others, such as designers or subcontractors, can be invited if both agree. The point is to decide actions and who owns them, not to argue about who pays.",
          "<b>The sanction.</b> If the Contractor didn't give a warning that an experienced contractor could have given, the PM can say so, and the resulting compensation event is assessed as if the warning had been given. In practice that means avoidable cost isn't paid.",
          "<b>For a designer.</b> You may not give early warnings yourself, but late drawings, unexpected ground conditions or a design clash are all early-warning material. Tell whoever does give them."])) +

      sec("nec-ce", "Compensation events", "A compensation event is something the Client carries the risk of, which entitles the Contractor to more time, more money, or both (and sometimes less). The core list includes, among others: the PM changing the Scope; the Client not providing access, information or things on time; the PM or Supervisor not replying in time; physical conditions an experienced contractor would have judged too unlikely to allow for; exceptional weather measured against the contract's benchmark; and events neither party could prevent. Each main option adds a few of its own. The exact list is in the contract.",
        '<ol class="lr-steps">' + CE_STEPS.map(function (s) { return "<li><strong>" + s[0] + "</strong><span>" + s[1] + "</span></li>"; }).join("") + "</ol>" +
        "<h4>How they're assessed</h4>" +
        ul(["<b>Cost:</b> the effect on Defined Cost, plus the Fee on that cost. Work already done uses actual cost; work not yet done uses a forecast. Rates or lump sums can be used instead if both agree.",
          "<b>Risk in the forecast:</b> the forecast includes an allowance for risks the Contractor carries that have a significant chance of happening.",
          "<b>Time:</b> the delay is how far planned Completion moves on the Accepted Programme current at the time. Float can absorb some or all of it.",
          "<b>Once only:</b> an accepted or assessed compensation event isn't reopened later because actual cost turned out different. That's why getting the forecast right matters.",
          "<b>Proposed instructions:</b> the PM can ask for a quotation for a change before deciding whether to make it, which is useful when the cost could change the decision."]) +
        '<p class="small">How a compensation event changes what\'s paid varies by option. In A and B it changes the Prices; in C and D it also changes the target; in E and F it mainly affects forecasting. Check your option.</p>') +

      sec("nec-ewce", "Early warning or compensation event?", "The two are linked but they are different things. A common review answer gets them mixed up.",
        table(["", "Early warning", "Compensation event"], [
          ["Purpose", "Spot a problem early and decide how to reduce its effect", "Change the Prices and dates for something that is the Client's risk"],
          ["Who gives it", "Contractor or PM", "PM for its own instructions and decisions; otherwise the Contractor"],
          ["Does it change the money or time?", "No, not by itself", "Yes, once it's implemented"],
          ["Whose risk?", "Anyone's: it covers the Contractor's own risks too", "Only matters the contract makes the Client's risk"],
          ["Deadline", "As soon as you're aware", "8 weeks for the Contractor"],
          ["If you miss it", "A later compensation event may be assessed as if you'd warned", "Usually lose the right to more time or money"]
        ]) + '<p class="small">An early warning doesn\'t count as notifying a compensation event. If something is both, give the early warning and notify the compensation event separately.</p>') +

      sec("nec-cost", "Defined Cost, the Fee and payment", "",
        kn([
          ["Defined Cost", "what the contract counts as cost", "<p>The Contractor's cost, built up only from the components the contract lists: people, equipment, plant and materials, subcontractors, charges, manufacture and fabrication, design and insurance. Options A and B use a shorter version of that list when assessing compensation events. In C, D, E and F it's also how the Contractor is paid as it goes.</p>"],
          ["Disallowed Cost", "cost the PM can refuse", "<p>On the cost-based options, the PM can exclude cost that isn't properly justified, for example cost without records, cost of correcting Defects in some circumstances, cost caused by not giving an early warning, or resources that weren't used for the works. The full list is in the option clauses.</p>"],
          ["The Fee", "overheads and profit", "<p>The Contractor tenders a fee percentage. It's added to Defined Cost to cover everything not in Defined Cost, such as head office overhead and profit. NEC4 uses a single fee percentage.</p>"],
          ["Assessment dates", "the payment cycle", "<p>The PM assesses the amount due at each assessment date, at the interval set in the Contract Data, taking account of the Contractor's application. The amount due is broadly the Price for Work Done to Date, plus other amounts the contract allows, less amounts already paid or retained. What counts as the Price for Work Done to Date depends on the option: completed activities in A, measured quantities in B, Defined Cost plus Fee in C, D and E.</p>"],
          ["Certification and payment", "check the dates", "<p>The core text gives a week to certify after the assessment date and a longer period to pay. In the UK, the secondary option for the Construction Act and the Contract Data usually set the due date, the final date for payment and the notice rules. Check your contract rather than relying on the core default.</p>"],
          ["Pain/gain (C and D)", "sharing over or under target", "<p>At the end, the Price for Work Done to Date is compared with the total of the Prices (the target). The difference is shared in the proportions set in the Contract Data share ranges. Compensation events adjust the target, which is why they matter even on a cost-reimbursed option.</p>"]
        ])) +

      sec("nec-instr", "Who can instruct what", "Engineers get caught out here more than anywhere. The rule of thumb: if it changes what's being built or how, it comes from the Project Manager, in the form the contract requires.",
        table(["Action", "Who", "Note"], NEC_INSTR)) +

      sec("nec-times", "Deadlines and what happens if you miss them", "These are the NEC4 core defaults. Your contract can change any of them, through the Contract Data or Z clauses, and the PM and Contractor can sometimes agree to extend a period before it ends.",
        table(["What", "Who", "When", "If it's missed"], NEC_TIMES) +
        '<p class="small">How strictly the 8-week bar applies has been argued in the courts. Treat it as strict, and get commercial or legal advice if a claim depends on it. See also ' + NEC_LINKS.ceca + ".</p>") +

      sec("nec-jct", "NEC compared with JCT", "You might be asked why a project used NEC rather than JCT, or how they differ. The difference is as much about culture as mechanism.",
        table(["", "NEC4", "JCT"], NEC_JCT) +
        '<p class="small">JCT has its own editions and many variants, and both families are often heavily amended. Read the one you are working under. See ' + NEC_LINKS.jct + ".</p>") +

      sec("nec-review", "What a reviewer might ask", "Answer from your own project. If you weren't involved in a step, say who was and what you contributed.",
        asks([["Which contract and option did your project use, and why?", "Link the choice to the risk: how well defined was the scope, and who was best placed to manage the uncertainty?"],
          ["Tell us about a compensation event you were involved in.", "What happened, who notified it and when, how it was quoted and assessed, and what you learned. Mention the early warning if there was one."],
          ["What's the difference between an early warning and a compensation event?", "Purpose, who gives it, whether it changes time or money, and the deadlines."],
          ["A client's representative asks you on site for an extra. What do you do?", "Explain it isn't an instruction under the contract, raise it with the PM, give an early warning if it could affect cost or time, and record it."],
          ["How did the programme help you manage the job?", "Accepted Programme, revisions, how delay was measured, float."],
          ["How does a target cost contract encourage collaboration?", "Shared pain/gain, open book, joint risk reduction through early warnings. Also its weaknesses: admin, disputes over Disallowed Cost."],
          ["What would you do if you'd missed a contract deadline?", "Be honest about the consequence, tell your manager straight away, and explain what you'd change. Ethics and Attribute 3 both come in here."]])) +

      sec("nec-test", "Test yourself", "Try to answer out loud before you open each one. Then " + '<a href="#flashcards">revise the Contracts deck in Flashcards</a>' + ".",
        quiz([
          ["Under Option A, the work costs more than the Contractor priced. Who pays the extra?", "The Contractor, unless the extra cost comes from a compensation event. That's the point of a priced contract: the Client buys price certainty."],
          ["Under Option C, the final cost is below the target. What happens?", "The saving is shared between Client and Contractor in the proportions set by the share ranges in the Contract Data."],
          ["The Supervisor asks for a thicker blinding layer than the drawings show. Is that a compensation event?", "Not as it stands. The Supervisor can't change the Scope. The Contractor should ask the PM for an instruction; if the PM instructs it, that change to the Scope is normally a compensation event."],
          ["The Contractor first became aware of a problem 10 weeks ago and has just notified it. What happens?", "In most cases it's out of time and the Prices and dates don't change. The exception is where the event was one the PM should have notified, such as the PM's own instruction. Check the contract and any Z clauses."],
          ["Does giving an early warning protect the Contractor's right to a compensation event?", "No. They're separate. The compensation event still has to be notified within the deadline."],
          ["The PM hasn't replied to a quotation for three weeks. What can the Contractor do?", "Notify the PM of the failure to reply. If the PM still doesn't reply within the further period, the quotation is treated as accepted."],
          ["How is delay from a compensation event measured?", "By how much planned Completion moves on the Accepted Programme current at the time. Float can absorb it; the Contractor's time risk allowances and terminal float are protected."],
          ["What are Z clauses and why do they matter?", "Bespoke amendments added for the project or by the Client. They can move risk or add deadlines, so you have to read them; they're often where the surprises are."],
          ["Name two differences between NEC and JCT in how change is handled.", "NEC deals with time and money together in one compensation event, assessed mostly on forecast cost before the work. JCT typically values variations separately from extensions of time and loss and expense, often after the event. NEC also has strict notification deadlines and a formal early warning process."]
        ])) +

      sec("nec-read", "Read the source", "This page is a starting point. Before your review, read the real documents.",
        ul([NEC_LINKS.nec + ": the NEC4 contracts and their user guides. They're paid, but your employer very likely has them.",
          "Your own project's contract: Contract Data, Scope and any Z clauses. Ask the commercial or project team.",
          NEC_LINKS.ceca + ": short bulletins on NEC4 procedure from the Civil Engineering Contractors Association.",
          NEC_LINKS.jct + " for JCT, if your work is in building.",
          NEC_LINKS.dbw + " for quick plain-English primers.",
          "The " + '<a href="#cheat-sheet">Cheat sheet</a>' + " has NEC4 timescales you can add to your notes."]), "ref");

    jumpable(root);
    wireChips(root.querySelector("#nec-options .chips-row"), function (k) { save("cp-nec-opt", k); $("nec-opt-view").innerHTML = optionView(OPTIONS.filter(function (o) { return o.id === k; })[0]); });
    wireChips(root.querySelector("#nec-roles .chips-row"), function (k) { save("cp-nec-role", k); $("nec-role-view").innerHTML = roleView(NEC_ROLES.filter(function (r) { return r.id === k; })[0]); });
  }

  /* =====================================================================
     CDM 2015
     ===================================================================== */
  var CDM_LINKS = {
    regs: ext("https://www.legislation.gov.uk/uksi/2015/51/contents", "The CDM Regulations 2015 (legislation.gov.uk)"),
    l153: ext("https://www.hse.gov.uk/pubns/books/l153.htm", "HSE L153: Managing health and safety in construction"),
    faq: ext("https://www.hse.gov.uk/construction/cdm/faq/", "HSE's CDM 2015 FAQs"),
    notif: ext("https://www.hse.gov.uk/construction/cdm/faq/notifications.htm", "HSE on notification"),
    citb: ext("https://www.citb.co.uk/about-citb/partnerships-and-initiatives/construction-design-and-management-cdm-regulations/cdm-regulations", "CITB industry guides for each duty holder"),
    mhswr: ext("https://www.legislation.gov.uk/uksi/1999/3242/schedule/1", "Management of Health and Safety at Work Regulations 1999, Schedule 1"),
    ni: ext("https://www.legislation.gov.uk/nisr/2016/146/contents", "CDM Regulations (Northern Ireland) 2016")
  };

  /* Each role: who, when (one contractor / more than one), duties, documents, catch, ask, example. */
  var CDM_ROLES = [
    { id: "client", label: "Client",
      who: "Any organisation or person for whom a construction project is carried out as part of a business: developers, local authorities, utilities, Network Rail, a school, a shop owner. Public bodies and charities count. Every project has one.",
      one: "Still has all the core client duties, but there's no Principal Designer or Principal Contractor to appoint and no health and safety file is needed.",
      multi: "Must also appoint a Principal Designer and a Principal Contractor in writing, early enough for them to do the job. If it doesn't, it carries their duties itself.",
      duties: ["Make suitable arrangements for managing the project so that it's safe, including enough time and resources, and keep them under review.",
        "Provide pre-construction information to every designer and contractor, as early as possible.",
        "Check that a construction phase plan is in place before construction starts.",
        "Make sure welfare facilities are provided on site.",
        "Notify HSE if the project is notifiable (see the F10 section).",
        "Take reasonable steps to check that the people it appoints have the skills, knowledge and experience, and that the Principal Designer and Principal Contractor are doing their jobs.",
        "Keep the health and safety file at the end, make it available, and pass it on if it sells the asset."],
      docs: ["Pre-construction information (provides)", "F10 notification (submits)", "Construction phase plan (checks exists)", "Health and safety file (keeps)"],
      catch: ["Thinking that appointing a Principal Designer hands over the client's own duties. It doesn't: the client keeps its duties and can get help with them.", "Appointing the Principal Designer after the important design decisions are made, so the role becomes a review at the end.", "Squeezing the programme or budget. Allowing enough time and resources is itself a client duty.", "Treating pre-construction information as a document dump, not a selection of what designers and contractors actually need."],
      ask: "Who was the client on your project, and how did they meet their duties? What did you do when information you needed, such as a services or asbestos survey, wasn't provided?",
      example: "A water company upgrading a pumping station holds old drawings, the existing health and safety file and an asbestos survey. Getting those to the designers early is its pre-construction information duty." },
    { id: "domestic", label: "Domestic client",
      who: "Someone having work done on their own home, or a family member's home, that isn't in connection with a business. A landlord or developer isn't a domestic client.",
      one: "The client duties pass automatically to the contractor.",
      multi: "The client duties pass automatically to the Principal Contractor, unless the domestic client agrees in writing that the Principal Designer takes them on. If the domestic client doesn't appoint a Principal Designer or Principal Contractor, the designer in control of the pre-construction phase and the contractor in control of the construction phase take those roles.",
      duties: ["In practice, none that they have to carry out themselves: the duties still exist but are carried out by others.", "The domestic client can choose to have the Principal Designer take on the client duties, by written agreement."],
      docs: ["None directly: whoever takes the client duties provides the pre-construction information and, if needed, the F10"],
      catch: ["Designers and contractors forgetting that the client duties still exist and now fall on them.", "Assuming a homeowner who runs a business from home is always a domestic client. It depends on whether the work is connected with the business."],
      ask: "If you designed an extension for a homeowner, who held the client duties and what did that mean for you?",
      example: "A basement extension with a designer and two contractors: the Principal Contractor carries the client duties unless the Principal Designer has agreed in writing to do so." },
    { id: "pd", label: "Principal Designer",
      who: "A designer appointed by the client to control the pre-construction phase on a project with more than one contractor. It can be an organisation or a person, and it must be a designer with control over the pre-construction phase, not just a health and safety adviser.",
      one: "Not needed. There's no Principal Designer on a single-contractor project.",
      multi: "Must be appointed. The pre-construction phase isn't only 'before site': any design work during construction is part of it, so the role often continues to the end.",
      duties: ["Plan, manage, monitor and coordinate health and safety in the pre-construction phase, taking account of the general principles of prevention.",
        "Help identify foreseeable risks and make sure they're eliminated, reduced or controlled through design.",
        "Make sure designers meet their duties and that everyone involved in pre-construction cooperates.",
        "Help the client put together pre-construction information, and pass it to designers and contractors.",
        "Liaise with the Principal Contractor and share information that affects the construction phase plan.",
        "Prepare the health and safety file, keep it up to date, and hand it to the client at the end (or to the Principal Contractor if its appointment ends first)."],
      docs: ["Pre-construction information (helps compile and pass on)", "Health and safety file (prepares)", "Construction phase plan (gives information for it)"],
      catch: ["Confusing the CDM Principal Designer with the Principal Designer under the Building Regulations, introduced by the Building Safety Act in England. They're different roles with different duties. One organisation can hold both, but it needs to be appointed to each.", "Reviewing designs only at the end, when it's too late to change them.", "Leaving the health and safety file to the last month."],
      ask: "Who was Principal Designer on your project and how did they coordinate the designers? How were residual risks recorded and passed on?",
      example: "On a highway scheme with separate drainage, structures and lighting designers, the Principal Designer runs joint design risk reviews, so maintenance access and buried services are considered once across all three disciplines." },
    { id: "designer", label: "Designer",
      who: "Anyone who prepares or changes a design, or tells someone else to. That includes engineers, architects, temporary works designers, contractors who design, people who write specifications, and clients who insist on a particular detail. Most chartership candidates are designers under CDM.",
      one: "Same duties. With no Principal Designer, the designer works directly with the client and contractor.",
      multi: "Same duties, plus cooperating with the Principal Designer and giving it information for the health and safety file.",
      duties: ["Don't start design work unless the client knows its duties under CDM. In practice, tell them.",
        "When designing, take account of the general principles of prevention and the pre-construction information.",
        "Eliminate foreseeable risks, so far as reasonably practicable, to the people who build, maintain, clean, use as a workplace, or later demolish the structure.",
        "Where a risk can't be eliminated, reduce or control it through the design.",
        "Give clear information about significant risks that remain to the Principal Designer, other designers and contractors.",
        "Cooperate with other designers and the Principal Designer, and provide information for the health and safety file."],
      docs: ["Residual risk information (on drawings or a short register)", "Information for the health and safety file", "Uses pre-construction information"],
      catch: ["Long generic risk registers that list obvious hazards ('working at height') and hide the unusual ones a contractor actually needs to know.", "Thinking only about construction, and forgetting maintenance, cleaning, replacement and demolition.", "Assuming the contractor's method statement will deal with it, when a design choice could remove the risk.", "Forgetting the sequence: is the structure stable at every stage of construction?"],
      ask: "Give an example where you eliminated or reduced a risk through your design. What risk was left, and how did you tell the contractor?",
      example: "Moving a manhole out of the carriageway and into the verge removes traffic management for every future inspection. Specifying precast chamber units cuts the time people spend in a deep excavation." },
    { id: "pc", label: "Principal Contractor",
      who: "A contractor appointed by the client to control the construction phase on a project with more than one contractor.",
      one: "Not needed. On a single-contractor project, the contractor does the equivalent jobs itself (see Contractor).",
      multi: "Must be appointed before the construction phase starts.",
      duties: ["Plan, manage, monitor and coordinate the construction phase, taking account of the general principles of prevention.",
        "Prepare the construction phase plan before construction starts, and keep it up to date as the work changes.",
        "Organise cooperation between contractors and coordinate their work, including their interfaces.",
        "Make sure everyone gets a suitable site induction.",
        "Take reasonable steps to stop unauthorised people getting onto site.",
        "Make sure welfare facilities are in place throughout.",
        "Consult and engage with workers on health and safety.",
        "Liaise with the Principal Designer and give it information for the health and safety file."],
      docs: ["Construction phase plan (prepares and updates)", "Information for the health and safety file (provides)", "F10 notice displayed on site, where the project is notifiable"],
      catch: ["A construction phase plan copied from the last job, not specific to this site and its risks.", "Not updating the plan when the work or sequence changes.", "Poor control of interfaces between subcontractors, where many incidents happen."],
      ask: "How was the construction phase plan developed and kept current? How were subcontractors' method statements checked and coordinated?",
      example: "On a culvert replacement, the Principal Contractor's plan sets out the over-pumping arrangements, working near water, excavation support and how the civils and M&E subcontractors share the compound." },
    { id: "contractor", label: "Contractor",
      who: "Anyone who carries out, manages or controls construction work: main contractors, subcontractors, self-employed tradespeople, and clients who use their own staff to build.",
      one: "Takes on extra duties: it must prepare a construction phase plan itself, and make sure of inductions, site security and welfare.",
      multi: "Works under the Principal Contractor's coordination: follows its directions and the construction phase plan.",
      duties: ["Don't start work unless the client knows its CDM duties.",
        "Plan, manage and monitor the work under its control so that it's safe.",
        "Give workers the supervision, instructions and information they need, including a site induction.",
        "Only appoint people with the right skills, knowledge, training and experience.",
        "Provide welfare for its own workers.",
        "Cooperate with others and give the Principal Contractor (or client) the information it needs.",
        "If it does any design, it's also a designer and has those duties too."],
      docs: ["Construction phase plan (prepares it on a single-contractor job; follows it on a multi-contractor job)", "Information for the health and safety file"],
      catch: ["Assuming a small single-contractor job doesn't need a construction phase plan. It does; it can be short.", "Contractor-designed elements (temporary works, connections, drainage details) where the contractor forgets it's also a designer."],
      ask: "On a small job with only one contractor, who prepared the construction phase plan and how was it kept proportionate?",
      example: "A single contractor resurfacing a car park still needs a short construction phase plan covering traffic management, plant movements and buried services." },
    { id: "worker", label: "Worker",
      who: "Anyone working for or under the control of a contractor on a construction site, including site engineers, supervisors and operatives.",
      one: "Same duties.",
      multi: "Same duties.",
      duties: ["Don't carry out work without the skills, knowledge, training and experience for it, unless being trained under proper supervision.",
        "Cooperate with others on site.",
        "Report anything you see that is likely to put yourself or others at risk.",
        "Take part in consultation on health and safety.",
        "The general duties of the Health and Safety at Work Act also apply: take reasonable care of yourself and others."],
      docs: ["Site induction", "Method statements and briefings for your work"],
      catch: ["Thinking CDM duties are only for managers.", "Not reporting near misses, which are the cheapest warnings a site gets."],
      ask: "How were workers involved in health and safety on your site? Tell us about a time someone raised a concern, or you did.",
      example: "A site engineer setting out near an open excavation notices the edge protection has been moved and reports it before carrying on." }
  ];

  var GPP = [
    ["Avoid", "Remove the risk altogether if you can."],
    ["Assess", "Evaluate the risks that can't be avoided."],
    ["Tackle at source", "Deal with the cause, not just the symptoms."],
    ["Fit the work to people", "Design workplaces, equipment and methods around people, reducing monotonous or repetitive work."],
    ["Use technical progress", "Take advantage of better methods and equipment as they become available."],
    ["Substitute", "Replace something dangerous with something less dangerous or not dangerous."],
    ["Plan prevention as a whole", "Have a coherent policy covering technology, organisation, working conditions, relationships and the environment."],
    ["Collective first", "Prefer measures that protect everyone (such as edge protection) over individual ones (such as harnesses)."],
    ["Instruct", "Give workers suitable instructions."]
  ];

  var DESIGN_EX = [
    ["Manholes and chambers", "Locate them out of the carriageway; keep depths down where hydraulics allow; specify precast units with safe lifting points."],
    ["Headwalls and outfalls", "Design safe access for inspection and clearing debris, with handrails or a low-level platform rather than relying on working over water."],
    ["Retaining walls and excavations", "Choose a form that reduces deep open excavation (for example, sheet piles left in place) and consider stability at each construction stage."],
    ["Bridges and structures", "Design for inspection: access to bearings, joints and drainage without needing specialist access each time. Allow for bearing replacement and jacking."],
    ["Precast and steel", "Specify fabricated units that are lifted and connected at ground level or with collective protection, and show the erection sequence."],
    ["Buried services", "Route new services away from where future digging is likely, and record locations accurately for the health and safety file."],
    ["Materials", "Specify materials that avoid hazardous substances or heavy manual handling (for example, lighter kerb units or ones designed for mechanical laying)."]
  ];

  function roleCard(r, proj) {
    return '<div class="lr-role"><p class="lr-who">' + r.who + "</p>" +
      '<div class="lr-when"><span class="eyebrow">' + (proj === "one" ? "On a project with one contractor" : "On a project with more than one contractor") + "</span><p>" + (proj === "one" ? r.one : r.multi) + "</p></div>" +
      "<h4>Duties in practice</h4>" + ul(r.duties) +
      "<h4>Documents</h4><div class=\"lr-docs\">" + r.docs.map(function (d) { return "<span>" + d + "</span>"; }).join("") + "</div>" +
      '<div class="lr-trap"><span class="eyebrow">Where people get caught out</span>' + ul(r.catch) + "</div>" +
      '<div class="lr-2"><div><h4>A reviewer might ask</h4><p>' + r.ask + "</p></div><div><h4>A civils example</h4><p>" + r.example + "</p></div></div></div>";
  }

  function notifiable(days, peak, pd) {
    var a = days > 30 && peak > 20, b = pd > 500;
    return { yes: a || b, a: a, b: b };
  }

  function renderCdm() {
    var root = $("cdm-body"); if (!root) return;
    var role = load("cp-cdm-role", "designer"), proj = load("cp-cdm-proj", "multi");
    if (!CDM_ROLES.some(function (r) { return r.id === role; })) role = "designer";
    if (proj !== "one" && proj !== "multi") proj = "multi";
    var cur = function () { return CDM_ROLES.filter(function (r) { return r.id === role; })[0]; };
    root.innerHTML =
      note("This page explains the Construction (Design and Management) Regulations 2015 in our own words to help you revise. It doesn't reproduce the Regulations or HSE's guidance and it isn't legal advice. Read " + CDM_LINKS.regs + " and " + CDM_LINKS.l153 + " (free), and follow your employer's procedures. CDM 2015 applies in Great Britain; Northern Ireland has its own, very similar, " + CDM_LINKS.ni + ".") +
      toc([["cdm-why", "Why it matters"], ["cdm-roles", "Duties by role"], ["cdm-split", "One or more contractors"], ["cdm-docs", "Key documents"], ["cdm-f10", "F10 notification"], ["cdm-gpp", "Principles of prevention"], ["cdm-design", "Designing out risk"], ["cdm-related", "Related law"], ["cdm-review", "At review"], ["cdm-test", "Test yourself"], ["cdm-read", "Read the source"]]) +

      sec("cdm-why", "Why it matters for chartership", "Health and safety is " + '<a href="#attributes-4">Attribute 4</a>' + ", and reviewers treat it seriously: a weak answer here can hold back an otherwise good review. They want to know you understand your own duties, can name the other duty holders on your project, and have changed something because of CDM, not just filled in a form.",
        ul(["Know your own role under CDM on each project you describe. Most candidates are designers; site-based candidates are also workers and may act for a contractor.", "Have a real example of eliminating or reducing a risk through design, and of passing on information about a risk that remained.", "Know who the client, Principal Designer and Principal Contractor were, and how you worked with them."])) +

      sec("cdm-roles", "Duties by role", "CDM gives duties to six kinds of duty holder, plus special rules for domestic clients. One organisation can hold more than one role (a design and build contractor is often both a designer and the Principal Contractor). Pick a role, then pick the kind of project.",
        chips("Duty holder", CDM_ROLES, role) +
        '<div class="lr-proj"><span class="small">Project:</span>' + chips("Number of contractors", [{ id: "one", label: "One contractor" }, { id: "multi", label: "More than one contractor" }], proj) + "</div>" +
        '<div id="cdm-role-view" aria-live="polite">' + roleCard(cur(), proj) + "</div>" +
        '<p class="small">The general duties apply to everyone: only take on a role you have the skills, knowledge and experience for (and, for an organisation, the capability), cooperate with others, and report what puts people at risk.</p>', "tool") +

      sec("cdm-split", "One contractor or more than one", "The number of contractors, not the size or length of the project, decides whether a Principal Designer and Principal Contractor are needed. 'More than one' includes subcontractors, and it's whether more than one is reasonably foreseeable at the outset that counts.",
        table(["", "One contractor", "More than one contractor"], [
          ["Principal Designer", "Not needed", "Client appoints in writing, as early as possible in design"],
          ["Principal Contractor", "Not needed", "Client appoints in writing, before construction starts"],
          ["Construction phase plan", "Needed: the contractor prepares it", "Needed: the Principal Contractor prepares it"],
          ["Health and safety file", "Not needed", "Needed: the Principal Designer prepares it, the client keeps it"],
          ["Pre-construction information", "Needed", "Needed"],
          ["F10 notification", "If the thresholds are met", "If the thresholds are met"],
          ["Domestic client's duties go to", "The contractor", "The Principal Contractor (or the Principal Designer, by written agreement)"]
        ])) +

      sec("cdm-docs", "The three key documents", "Each document has a job. Keep them proportionate: a short document that says what matters is worth more than a long one nobody reads.",
        '<div class="lr-cards">' +
        [["Pre-construction information", "Tells designers and contractors what they need to know about the site, any existing structure and the client's requirements, so they can plan and price safely.", "The client provides it; on a multi-contractor project the Principal Designer helps gather it and passes it on.", "As early as possible, to designers and to contractors who are bidding or appointed.", "Existing drawings and the previous health and safety file, ground and contamination information, buried and overhead services, asbestos surveys, site constraints and neighbours, and the client's own requirements for how the project is run.", "Arriving late, or as a box of everything with nothing highlighted."],
          ["Construction phase plan", "Sets out how health and safety will be managed during construction: the arrangements, site rules and specific measures for higher-risk work.", "The Principal Contractor, or the contractor on a single-contractor project.", "Drawn up before the construction phase starts and kept up to date as the work changes.", "Management arrangements, site rules, how the site is secured, welfare, and specific measures for the higher-risk activities on this site. CDM picks out particular kinds of high-risk work in a schedule, such as work in deep excavations, near water, near overhead power lines, involving explosives, or lifting heavy prefabricated components.", "A generic copy from the last job that doesn't mention this site's risks."],
          ["Health and safety file", "Holds the information someone will need to do future construction, maintenance, cleaning, refurbishment or demolition safely.", "The Principal Designer prepares it, with information from designers and the Principal Contractor; the client keeps it.", "Built up during the project and handed to the client at the end. Only needed on projects with more than one contractor.", "Residual hazards and how they're dealt with, key structural principles and safe working loads, hazardous materials left in place, locations of services, how to access and maintain plant and structures, and anything unusual about demolition.", "Stuffing it with every O&M manual and certificate, so the useful information is lost."]
        ].map(function (d) {
          return '<div class="lr-card"><h4>' + d[0] + "</h4><p>" + d[1] + '</p><dl class="lr-dl"><dt>Who</dt><dd>' + d[2] + "</dd><dt>When</dt><dd>" + d[3] + "</dd><dt>What goes in</dt><dd>" + d[4] + "</dd><dt>Common mistake</dt><dd>" + d[5] + "</dd></dl></div>";
        }).join("") + "</div>") +

      sec("cdm-f10", "F10: notifying HSE", "Some projects must be notified to HSE before construction starts, using the online F10 form. See " + CDM_LINKS.notif + ".",
        ul(["<b>The thresholds.</b> A project is notifiable if the construction work is expected either to last more than 30 working days and have more than 20 workers on site at the same time at any point, or to exceed 500 person-days of work.",
          "<b>Who.</b> The client, though it can ask someone else (often the Principal Designer) to submit it. For a domestic client, the duty passes on as described above.",
          "<b>When.</b> As soon as practicable before construction starts, and updated if the details change.",
          "<b>On site.</b> The notice should be displayed where workers can read it, usually in the site office.",
          "<b>What it doesn't decide.</b> Notification doesn't decide whether a Principal Designer and Principal Contractor are needed; the number of contractors does. A big job with one contractor can be notifiable with no Principal Designer; a small job with two contractors needs both appointments."]) +
        '<div class="tool-box lr-f10"><h4>Is it notifiable? A quick check</h4><div class="lr-f10-in">' +
        '<label>Working days on site<input type="number" min="0" id="f10-days" value="40" inputmode="numeric"></label>' +
        '<label>Most workers on site at once<input type="number" min="0" id="f10-peak" value="12" inputmode="numeric"></label>' +
        '<label>Total person-days<input type="number" min="0" id="f10-pd" value="380" inputmode="numeric"></label>' +
        '<label>Contractors<select id="f10-con"><option value="1">One</option><option value="2" selected>More than one</option></select></label>' +
        '</div><p id="f10-out" aria-live="polite"></p><p class="small">A learning aid using the thresholds as we\'ve summarised them. Check real projects against HSE\'s guidance.</p></div>') +

      sec("cdm-gpp", "The general principles of prevention", "CDM requires duty holders to take these into account. They come from the Management of Health and Safety at Work Regulations 1999, not from CDM itself, so they apply to every employer. In our own words:",
        '<ol class="lr-gpp">' + GPP.map(function (g) { return "<li><strong>" + g[0] + "</strong><span>" + g[1] + "</span></li>"; }).join("") + "</ol>" +
        '<p class="small">Read the originals in ' + CDM_LINKS.mhswr + ". They line up with the hierarchy of control you'll probably be asked about: eliminate, substitute, engineering controls, administrative controls, and personal protective equipment last.</p>") +

      sec("cdm-design", "The designer's part: eliminating and reducing risk", "Designers have the most influence at the lowest cost, because changing a drawing is cheaper than changing a site. 'So far as reasonably practicable' means weighing the risk against the time, cost and difficulty of avoiding it. You don't have to remove every risk, but you can't ignore one just because removing it is inconvenient.",
        '<div class="lr-eric">' + [["E", "Eliminate", "Change the design so the hazard isn't there."], ["R", "Reduce", "If you can't remove it, make it less likely or less severe."], ["I", "Inform", "Tell others about the significant risks that remain."], ["C", "Control", "Show how the remaining risk should be managed, where that's a design matter."]].map(function (x) { return '<div><b>' + x[0] + "</b><strong>" + x[1] + "</strong><span>" + x[2] + "</span></div>"; }).join("") + "</div>" +
        '<p class="small">ERIC is industry shorthand, not wording from the Regulations.</p>' +
        "<h4>Civils examples</h4>" + table(["Element", "What a designer can do"], DESIGN_EX) +
        "<h4>Recording it</h4>" +
        ul(["CDM doesn't require a 'designer's risk assessment' in any particular format. What it needs is that the right people get useful information about significant risks.",
          "Focus on risks that are unusual, not obvious, or that a competent contractor wouldn't expect. Leave out the generic ones everybody already manages.",
          "Put information where it'll be used: notes on the drawing beside the element are often better than a separate register nobody opens.",
          "Think through the whole life: construction, maintenance, cleaning, use as a workplace, and eventual demolition."])) +

      sec("cdm-related", "Related law and roles", "",
        kn([
          ["Health and Safety at Work etc. Act 1974", "the parent Act", "<p>CDM is made under it. Its general duties on employers, the self-employed and employees apply alongside CDM.</p>"],
          ["Building Safety Act 2022 and the Building Regulations Principal Designer", "England", "<p>Building Regulations now have their own dutyholder roles, including a Principal Designer and Principal Contractor for compliance with the Building Regulations. These are separate from the CDM roles even though the names are the same. Know which one someone means.</p>"],
          ["Temporary works", "BS 5975", "<p>Temporary works designers are designers under CDM. BS 5975 sets out the industry's procedure for managing temporary works, including the temporary works coordinator.</p>"],
          ["Northern Ireland", "CDM (NI) 2016", "<p>Close to the GB regulations, enforced by HSENI. Check which applies to your project.</p>"]
        ])) +

      sec("cdm-review", "What a reviewer might ask", "Answer from your own work. Name the duty holders, say what you did, and say what changed because of it.",
        asks([["What was your role under CDM on this project, and what did that mean you had to do?", "Name the role, the duties that went with it, and an action you took."],
          ["Give an example of a hazard you designed out.", "The hazard, the option you chose and why, what it cost, and what risk was left."],
          ["Who was the Principal Designer, and how did you work with them?", "Design reviews, information flow, and the health and safety file."],
          ["Was the project notifiable? Who notified it?", "The thresholds, the client's duty, and that notification doesn't decide the appointments."],
          ["What goes into a health and safety file, and who will use it?", "Information for future work on the asset, not every document from the job."],
          ["What would you do if you saw unsafe work on site that wasn't yours to supervise?", "Stop or challenge it if it's dangerous, report it, and follow it up. Link to the ICE Code of Conduct."],
          ["How did you make sure residual risks reached the contractor?", "Drawing notes, a short register, briefings, and checking they'd been understood."]])) +

      sec("cdm-test", "Test yourself", "Try to answer out loud before you open each one. Then " + '<a href="#flashcards">revise the H&amp;S deck in Flashcards</a>' + ".",
        quiz([
          ["A project has one contractor and will take 80 working days with 25 people on site at peak. Is a Principal Designer needed? Is it notifiable?", "No Principal Designer or Principal Contractor, because there's only one contractor. It is notifiable, because it lasts more than 30 working days with more than 20 workers at once."],
          ["The client appoints a Principal Designer. Does the client still have duties?", "Yes. The client keeps its own duties; the Principal Designer has separate ones."],
          ["Who prepares the construction phase plan on a single-contractor project?", "The contractor."],
          ["Is a health and safety file needed on a single-contractor project?", "No. It's only required where there's more than one contractor."],
          ["You're a contractor's engineer designing a temporary works platform. Are you a designer under CDM?", "Yes. Anyone who prepares or changes a design is a designer, including temporary works designers and contractors who design."],
          ["A homeowner has a two-storey extension built by a builder and an electrician. Who carries the client duties?", "The Principal Contractor (here, likely the builder), unless the homeowner has agreed in writing that the Principal Designer takes them."],
          ["What does 'so far as reasonably practicable' mean for a designer?", "Weighing the risk against the time, cost and difficulty of removing it. You must act unless the effort is grossly out of proportion to the risk."],
          ["Name four of the general principles of prevention.", "Any four of: avoid risks, assess the rest, tackle them at source, fit the work to the person, use technical progress, substitute the dangerous with the less dangerous, have a coherent prevention policy, put collective protection before individual, and give proper instructions."],
          ["What should go into the health and safety file for a new culvert?", "What someone will need for future work: as-built details, residual hazards (such as confined space access), design loads, materials, and how to inspect, clear and maintain it safely. Not every certificate from the job."]
        ])) +

      sec("cdm-read", "Read the source", "This page is a starting point. Before your review, read the real documents.",
        ul([CDM_LINKS.regs + ": the Regulations themselves.",
          CDM_LINKS.l153 + ": HSE's guidance on the Regulations. Free, and the one to read first.",
          CDM_LINKS.citb + ": short, free industry guides written for each duty holder.",
          CDM_LINKS.faq + ", including " + CDM_LINKS.notif + ".",
          CDM_LINKS.mhswr + " for the general principles of prevention.",
          "Your employer's CDM procedures and the documents on your own project."]), "ref");

    jumpable(root);
    var rows = root.querySelectorAll("#cdm-roles .chips-row");
    function draw() { $("cdm-role-view").innerHTML = roleCard(cur(), proj); }
    wireChips(rows[0], function (k) { role = k; save("cp-cdm-role", k); draw(); });
    wireChips(rows[1], function (k) { proj = k; save("cp-cdm-proj", k); draw(); });

    function f10() {
      var d = +$("f10-days").value || 0, p = +$("f10-peak").value || 0, pd = +$("f10-pd").value || 0, c = $("f10-con").value === "2";
      var r = notifiable(d, p, pd);
      var why = r.a && r.b ? "it lasts more than 30 working days with more than 20 workers at once, and it exceeds 500 person-days" : r.a ? "it lasts more than 30 working days with more than 20 workers at once" : r.b ? "it exceeds 500 person-days" : "it doesn't meet either threshold";
      $("f10-out").innerHTML = "<strong>" + (r.yes ? "Notifiable" : "Not notifiable") + "</strong>: " + why + ". " +
        (c ? "With more than one contractor, the client must appoint a Principal Designer and a Principal Contractor, whether or not it's notifiable." : "With one contractor, no Principal Designer or Principal Contractor is needed, whether or not it's notifiable.");
    }
    ["f10-days", "f10-peak", "f10-pd", "f10-con"].forEach(function (id) { $(id).addEventListener("input", f10); $(id).addEventListener("change", f10); });
    f10();
  }


  /* =====================================================================
     How engineers learn (#learn-theory)
     Named models are attributed to their authors and described in our own words.
     ===================================================================== */
  var LT_LINKS = {
    cpd: ext("https://www.ice.org.uk/download-centre/continuing-professional-development-cpd-guidance", "ICE CPD guidance")
  };
  var DREYFUS = [
    ["Novice", "Follows rules and checklists without much sense of when they don't apply.", "A graduate checking a pipe size against a design chart step by step."],
    ["Advanced beginner", "Starts to recognise recurring situations from experience, but still treats every factor as equally important.", "Notices that shallow cover keeps coming up on estate roads, but can't yet say which constraint drives the design."],
    ["Competent", "Plans deliberately, chooses what matters, and feels responsible for the outcome.", "Sets out the design approach for a small scheme and owns the result."],
    ["Proficient", "Sees the whole situation quickly and knows what's important, but still works out the response.", "Spots straight away that the outfall level will control the whole network."],
    ["Expert", "Acts on a deep, intuitive grasp of the situation and steps back to analyse only when something is unusual.", "Knows from experience which ground investigations will pay off on a site like this."]
  ];
  var KOLB = [
    ["Do", "Have an experience", "Your drainage model shows flooding at a junction you'd assumed was fine."],
    ["Review", "Look back at what happened", "You trace it to a tailwater level you'd taken from an old survey without checking."],
    ["Conclude", "Work out the general lesson", "Boundary conditions drive the result, and inherited data needs a date and a source before you use it."],
    ["Plan", "Decide what you'll do differently, and try it", "On the next model you list every boundary condition with its source, and ask the client for current levels first."]
  ];
  var GIBBS = [
    ["What happened?", "The facts, briefly."],
    ["What were you thinking and feeling?", "Honestly. It explains your decisions at the time."],
    ["What went well and what didn't?", "Both. A review that only lists problems isn't balanced."],
    ["Why?", "The analysis: what caused it, using what you know or have since read."],
    ["What else could you have done?", "The conclusion, including what you'd do in another situation."],
    ["What will you do next time?", "A specific action you can check later."]
  ];

  function ltRefl() {
    function v(id) { var e = $(id); return e ? e.value.trim() : ""; }
    var parts = [["What happened", v("lt-what")], ["What I learned", v("lt-learn")], ["What I did differently", v("lt-change")], ["Attribute", v("lt-attr")], ["Evidence", v("lt-ev")]];
    var any = parts.some(function (p) { return p[1]; });
    return any ? parts.filter(function (p) { return p[1]; }).map(function (p) { return p[0] + ": " + p[1]; }).join("\n") : "";
  }

  function renderLearning() {
    var root = $("theory-body"); if (!root) return;
    root.innerHTML =
      note("This page draws on well-known models of how adults learn, described in our own words and credited to their authors. They're useful ways of thinking, not rules, and some are better supported by evidence than others. For what ICE expects, read " + LT_LINKS.cpd + " and the " + '<a href="#attributes">attributes</a>' + ".") +
      toc([["lt-why", "Why it matters"], ["lt-comp", "How competence grows"], ["lt-cycle", "The learning cycle"], ["lt-reflect", "Reflective practice"], ["lt-plan", "Plan and record it"], ["lt-stick", "Revision that sticks"], ["lt-review", "At review"], ["lt-read", "Read more"]]) +

      sec("lt-why", "Why it matters for chartership", "Chartership is a judgement about whether you can work competently on your own, and whether you'll keep developing once you're there. Reviewers can't watch you work, so they listen for how you learn: from mistakes, from feedback, and from other people. The ICE Code of Conduct also expects you to keep developing and to keep a record of your development planning.",
        ul(["Your report, CPD record and development action plan should tell the same story: you spotted gaps, did something about them, and can show the result.", "At interview, 'what did you learn from that?' is one of the most common follow-up questions. A good answer is specific and shows a change in what you do.", "Reflection isn't a separate task. It's the habit that turns a year of experience into a year of development, rather than the same month twelve times."])) +

      sec("lt-comp", "How competence grows", "Stuart and Hubert Dreyfus described skill as moving through five stages, from following rules to acting on experience. The useful point for chartership is that each step depends on real experience and feedback, not just more knowledge. ICE is looking for someone who works competently and is moving beyond it in their own area.",
        table(["Stage", "What it looks like", "A civils example"], DREYFUS) +
        "<h4>Where learning comes from</h4>" +
        ul(["<b>Doing the work.</b> Most development happens on the job, especially on stretching tasks with some responsibility.",
          "<b>Other people.</b> Feedback, checking, mentoring, and watching how experienced engineers handle a problem.",
          "<b>Formal learning.</b> Courses, reading and institution events give you the framework to make sense of experience.",
          "The '70:20:10' split often quoted for these three comes from research at the Center for Creative Leadership. Treat it as a rough reminder that most learning happens at work, not a measured ratio."])) +

      sec("lt-cycle", "The learning cycle", "David Kolb described learning from experience as a cycle with four stages. You can enter it anywhere, but you only really learn if you go all the way round. Many engineers have the experience and skip the rest, which is why the same problems come back.",
        '<ol class="lr-steps lt-cycle">' + KOLB.map(function (k) { return "<li><strong>" + k[0] + ": " + k[1] + "</strong><span>" + k[2] + "</span></li>"; }).join("") + "</ol>" +
        '<p class="small">Kolb also proposed learning styles based on the cycle. The cycle is widely used; the idea that you should be taught in your preferred style has weak evidence behind it, so don\'t lean on it.</p>') +

      sec("lt-reflect", "Reflective practice", "Donald Schön distinguished between reflecting in action (adjusting while you're doing something, like changing your approach mid-meeting) and reflecting on action (looking back afterwards). Both matter: the first is judgement in the moment, the second is how you improve it.",
        "<h4>A structure for writing it up</h4><p>Graham Gibbs set out a reflective cycle that works well for CPD entries and report examples. In short:</p>" +
        '<ol class="lr-gpp">' + GIBBS.map(function (g) { return "<li><strong>" + g[0] + "</strong><span>" + g[1] + "</span></li>"; }).join("") + "</ol>" +
        "<h4>Good reflection is</h4>" +
        ul(["<b>Specific:</b> one event, with enough detail that someone else could picture it.", "<b>Honest:</b> including your own part in what went wrong.", "<b>Analytical:</b> why it happened, not just what happened.", "<b>Forward-looking:</b> ends with something you'll do differently, and later you can show you did it."]) +
        '<div class="tool-box lt-builder"><h4>Draft a reflection</h4><p class="small">Fill in what you can, then copy it into your CPD record. Nothing leaves your browser.</p>' +
        '<label>What happened?<textarea id="lt-what" rows="2" placeholder="The tailwater level in my drainage model came from a 2009 survey I hadn\'t checked."></textarea></label>' +
        '<label>What did you learn, and why did it happen?<textarea id="lt-learn" rows="2" placeholder="Boundary conditions control the result; I treated inherited data as current."></textarea></label>' +
        '<label>What do you do differently now?<textarea id="lt-change" rows="2" placeholder="I list every boundary condition with its date and source, and check them with the client first."></textarea></label>' +
        '<div class="lt-row"><label>Attribute<select id="lt-attr"><option value="">Choose</option><option>1. Knowledge and understanding</option><option>2. Technical and practical application</option><option>3. Management and leadership</option><option>4. Health, safety and welfare</option><option>5. Sustainable development</option><option>6. Communication and interpersonal skills</option><option>7. Professional commitment</option></select></label>' +
        '<label>Evidence<input type="text" id="lt-ev" placeholder="Model check sheet, revision B"></label></div>' +
        '<pre id="lt-out" class="lt-out" aria-live="polite"></pre><div><button type="button" class="btn ghost" id="lt-copy">Copy</button> <span class="small" id="lt-st" aria-live="polite"></span></div></div>', "tool") +

      sec("lt-plan", "From reflection to a plan and a record", "Reflection is only useful if it changes what you do. The development action plan is where you decide what to work on, and the CPD record is where you show you did it.",
        kn([
          ["Development action plan", "what you'll work on", "<p>Look at the seven attributes and your own experience, and pick the gaps that matter most. For each one, write an objective you can check: what you'll be able to do, how you'll get there, and by when. George Doran's SMART idea (specific, measurable, assignable, realistic, time-related) is a decent test. Agree it with your supervisor or mentor and revisit it a few times a year.</p>"],
          ["Choosing activities", "a mix, mostly at work", "<p>Ask to take on the task that fills the gap, get someone to check your work and give feedback, then add a course or reading to back it up. ICE also has mandatory CPD themes to cover over a rolling three years; see the " + '<a href="#flashcards">Professional flashcards</a>' + ".</p>"],
          ["The CPD record", "what you did and what changed", "<p>For each entry: what you did, why (which gap or attribute), what you learned, and how you've used it. The last part is the one most often missing and the one reviewers care about. Record as you go; reconstructing a year from memory produces vague entries.</p>"],
          ["Linking it up", "one story", "<p>Your best report examples should appear in your CPD record as learning, and your development plan should show where you went next. Reviewers notice when the three documents don't agree.</p>"]
        ])) +

      sec("lt-stick", "Revision that sticks", "For the knowledge side of review preparation, a few findings from learning research are worth using.",
        ul(["<b>Test yourself rather than re-reading.</b> Trying to recall something strengthens memory far more than reading it again. That's what the " + '<a href="#flashcards">flashcards</a>' + " and the self-tests on these pages are for.",
          "<b>Spread it out.</b> Short sessions over weeks beat one long session. Hermann Ebbinghaus showed how quickly we forget without review; spacing your revision works with that.",
          "<b>Mix topics.</b> Switching between contracts, health and safety and technical questions feels harder but trains you to recognise which kind of question you've been asked.",
          "<b>Explain out loud.</b> Answering in your own words, as you will at interview, shows you quickly what you don't really understand.",
          "<b>Practise deliberately.</b> Anders Ericsson's work on expert performance stresses focused practice on your weak spots with feedback. A mock review with honest feedback is exactly that."])) +

      sec("lt-review", "What a reviewer is looking for", "When a reviewer asks how you learned from something, they're testing whether you can reflect, take responsibility and change. Compare these two answers to 'tell us about a mistake':",
        '<div class="levels"><div><span class="eyebrow">Weaker</span><p>"There was an issue with the levels on one of our drawings, which the contractor picked up. We fixed it and the team now checks levels more carefully."</p><p class="small">Vague, uses "we", and no sign of a personal change.</p></div>' +
        '<div><span class="eyebrow">Stronger</span><p>"I issued a drainage long section with an outfall level I\'d taken from an old survey. The contractor queried it before construction. I found the cause, told my checker and the PM, and reissued within two days. Since then I record the source and date of every boundary level, and I\'ve added that to our team\'s check sheet. On my next scheme it caught an out-of-date level before issue."</p><p class="small">Specific, owns it, explains the cause, shows a lasting change and evidence that it worked.</p></div></div>' +
        asks([["What did you learn from that?", "A specific lesson, why it happened, and what you now do differently."],
          ["What would you do differently if you did it again?", "A real alternative, not 'nothing'."],
          ["How do you keep your knowledge up to date?", "Your development plan, CPD and how you choose what to learn."],
          ["How have you helped others develop?", "Mentoring, checking, briefings, sharing a lesson learned."],
          ["Where are you still developing?", "An honest gap and your plan for it. Claiming none is a red flag."]])) +

      sec("lt-read", "Read more", "The original works are worth knowing by name; you don't need to read them all.",
        ul([LT_LINKS.cpd + " and the ICE Code of Professional Conduct: what ICE expects of your development and records.",
          "David Kolb, <i>Experiential Learning</i> (1984): the learning cycle.",
          "Graham Gibbs, <i>Learning by Doing</i> (1988): the reflective cycle.",
          "Donald Schön, <i>The Reflective Practitioner</i> (1983): reflection in and on action.",
          "Stuart and Hubert Dreyfus's model of skill acquisition (1980s).",
          "K. Anders Ericsson's research on deliberate practice."]), "ref");

    jumpable(root);
    function upd() { $("lt-out").textContent = ltRefl() || "Your reflection will appear here."; }
    ["lt-what", "lt-learn", "lt-change", "lt-attr", "lt-ev"].forEach(function (id) {
      var e = $(id), key = "cp-" + id; try { var sv = localStorage.getItem(key); if (sv) e.value = sv; } catch (x) { /* ignore */ }
      e.addEventListener("input", function () { save(key, e.value); upd(); }); e.addEventListener("change", function () { save(key, e.value); upd(); });
    });
    upd();
    $("lt-copy").addEventListener("click", function () {
      var t = ltRefl(), st = $("lt-st"); if (!t) { st.textContent = "Nothing to copy yet."; return; }
      function fb() { var a = document.createElement("textarea"); a.value = t; document.body.appendChild(a); a.select(); try { document.execCommand("copy"); st.textContent = "Copied."; } catch (e) { st.textContent = "Couldn't copy. Select the text and copy it by hand."; } a.remove(); }
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(function () { st.textContent = "Copied."; }, fb); else fb();
    });
  }

  /* Hub: the Learn tab's landing page */
  function renderHub() {
    var root = $("learn-hub"); if (!root) return;
    root.innerHTML = [["nec4", "NEC4 contracts", "The ECC, options A to F, early warnings, compensation events, the programme, and how NEC differs from JCT."],
      ["cdm", "CDM 2015 by role", "Every duty holder's duties, switchable by role and project type, plus the key documents, F10 and designing out risk."],
      ["learn-theory", "How engineers learn", "The learning cycle, reflective practice, and turning experience into a development plan and CPD record."]]
      .map(function (x) { return '<a class="panel learn-card" href="#' + x[0] + '"><h3>' + x[1] + "</h3><p>" + x[2] + '</p><span class="more">Open</span></a>'; }).join("");
  }

  renderHub();
  renderNec();
  renderCdm();
  renderLearning();
})();
