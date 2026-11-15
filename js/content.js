/* Site content. Edit this file to update the site; no build step needed.
   Facts here were checked against the sources linked next to them in Nov 2026.
   Items marked headlineOnly come from a news headline alone: read the article before quoting figures. */

window.SITE = {
  name: "Civil Chartered Path",
  updated: "15 November 2026"
};

/* The seven ICE attributes, with what reviewers look for and the CEng-level bar. */
window.ATTRIBUTES = [
  {
    n: 1, title: "Understanding and practical application of engineering",
    short: "Engineering",
    look: ["Apply sound theory and judgement to real problems", "Evaluate options and choose a solution for good reasons", "Understand risk, uncertainty and the limits of your methods", "Think about the whole life of the asset"],
    ceng: "Define the requirements, risks and opportunities yourself, design and implement the solution, and show you have introduced a new or improved technique or technology.",
    prompts: ["Which decision on your project needed judgement because the guidance didn't settle it?", "What did you assume, and how did you check it?", "What would you change if you designed it again?"]
  },
  {
    n: 2, title: "Management and leadership",
    short: "Leadership",
    look: ["Plan, organise and monitor work", "Lead and develop people", "Manage quality, and improve how things are done", "Adapt your style to the person and situation"],
    ceng: "Organise, direct and control tasks and resources, develop others, know the limits of your competence, and show continuous quality improvement you led.",
    prompts: ["When did a plan go wrong, and what did you change?", "How have you helped someone else develop?", "What's the difference between quality assurance and quality control on your job?"]
  },
  {
    n: 3, title: "Commercial ability",
    short: "Commercial",
    look: ["Understand how your work is procured and paid for", "Know the contract you work under", "Prepare and track budgets and programmes", "Manage change, early warnings and claims"],
    ceng: "Control the costs and budget of a significant task or project, and show sound judgement on statutory, contractual and commercial issues.",
    prompts: ["What contract were you working under, and what did it require of you?", "Tell us about a time your work was going over budget.", "Who carried the risk on your project, and why?"]
  },
  {
    n: 4, title: "Health, safety and welfare",
    short: "H&S",
    look: ["Know the law: HSWA 1974, CDM 2015 and the regulations you work under", "Understand your duties and everyone else's", "Apply the hierarchy of control", "Promote good practice in others"],
    ceng: "Show leadership by promoting good practice and improvements in health, safety and welfare, so others change what they do because of you.",
    prompts: ["What are your duties under CDM 2015, and who were the other duty holders?", "Give an example of eliminating a hazard through design.", "When have you stopped or challenged unsafe work?"]
  },
  {
    n: 5, title: "Sustainable development",
    short: "Sustainability",
    look: ["Carbon: PAS 2080 and the carbon reduction hierarchy", "Biodiversity net gain and nature-positive design", "Social value and the wider community", "Climate adaptation and resilience"],
    ceng: "Take a responsible role in improvements that reduce resource demand over the whole project life cycle, backed with numbers you can explain.",
    prompts: ["How did you reduce carbon on your project, and by how much?", "Did biodiversity net gain apply? What was done?", "How is climate change affecting your designs?"]
  },
  {
    n: 6, title: "Interpersonal skills and communication",
    short: "Communication",
    look: ["Write and speak clearly for different audiences", "Explain technical ideas to non-technical people", "Handle disagreement and negotiate", "Work inclusively with diverse teams"],
    ceng: "Communicate new concepts and ideas to technical and non-technical stakeholders, and proactively manage diversity and inclusion.",
    prompts: ["Tell us about explaining something technical to a member of the public or a client.", "Describe a disagreement with a contractor or client and how it ended.", "What have you done to make your workplace more inclusive?"]
  },
  {
    n: 7, title: "Professional commitment",
    short: "Professional",
    look: ["Know and live the ICE Code of Professional Conduct", "Plan and record CPD", "Take responsibility for your judgement and your limits", "Contribute to the profession and the public"],
    ceng: "Exercise sound, holistic, independent judgement and accept responsibility, with the public interest first.",
    prompts: ["Which rule of the Code matters most to you, and why?", "What would you do if asked to sign off work outside your competence?", "Have you used AI in your work or submission, and how did you stay accountable?"]
  }
];

/* Stages of the CEng route. Kept general: always check the current ICE guidance for forms, limits and fees. */
window.ROUTE = [
  { t: "Join ICE", d: "Become a graduate member. An accredited MEng, or a BEng plus further learning, meets the academic base for CEng. Without one, ask ICE about an individual assessment of your learning." },
  { t: "Initial Professional Development", d: "Build experience against the seven attributes. On an ICE-approved training scheme you're guided by a Supervising Civil Engineer; on the individual route you work with a mentor. Keep a development action plan and a CPD record from day one." },
  { t: "Check you're ready", d: "Map your evidence against every attribute and find the gaps early. Your supervisor or mentor should agree you're ready. Many candidates take a year or more of targeted experience to close a gap such as budget control." },
  { t: "Apply", d: "Submit your professional review report, CV, CPD record and development plan with your application. Write in the first person: reviewers assess what you did, not what the team did." },
  { t: "Professional review", d: "A presentation on your report, an interview with two reviewers, and a written communication task. Reviewers probe each attribute with factual, analytical, hypothetical and probing questions." },
  { t: "Result", d: "If you pass you can use CEng MICE. If not, you get feedback on which attributes fell short, which tells you exactly what to work on before you reapply." }
];

/* Review-day advice, each with its source. */
window.TIPS = [
  { t: "Bring two sides of A4 for the communication task", d: "That is the limit on notes, paper or on screen, in a normal readable font size. You can't copy and paste from them, and the internet and AI tools aren't allowed. Practise writing a short piece from your notes in the time allowed, typed, with no internet.", src: "ICE professional review guidance, June 2026", url: "https://www.ice.org.uk/media/aj2gmts3/11-jun-26-professional-review-guidance.pdf" },
  { t: "Aim for 13 minutes, not 15", d: "Reviewers may stop your presentation at 15 minutes. Leave a margin for nerves and the odd question.", src: "ICE professional review guidance, June 2026", url: "https://www.ice.org.uk/media/aj2gmts3/11-jun-26-professional-review-guidance.pdf" },
  { t: "Expect four kinds of question", d: "Factual (what is it?), analytical (compare, explain why), hypothetical (what would you do if?) and probing (why did you decide that?). Practise all four, not just the facts.", src: "ICE reviewer skills blog", url: "https://www.ice.org.uk/news-views-insights/inside-infrastructure/top-skills-every-professional-reviewer-needs" },
  { t: "Be ready to sketch", d: "A quick cross-section, section through a structure or long section of a channel often explains your decision faster than words. Practise two or three sketches of your own project.", src: "Civil Engineering Mentor", url: "https://www.civilengineeringmentor.com/professional-review-day" },
  { t: "Book a mock review", d: "Every source recommends at least one, ideally with someone who isn't your supervisor. Ask your regional ICE team or a recently chartered colleague.", src: "ICE candidate tips blog", url: "https://ice.org.uk/news-views-insights/inside-infrastructure/tips-to-help-you-pass-your-professional-review" },
  { t: "Say I, not we", d: "Reviewers need to see your judgement and your responsibility. Be clear what the team did and what you decided.", src: "Elliot Cooke, March 2026", url: "https://elliotcooke.co.uk/pass-ice-professional-review-tips/" },
  { t: "Know everything in your own report", d: "Every number and every claim is fair game. If a figure in your report is wrong, say so and give the right one before they find it.", src: "ICE candidate tips blog", url: "https://ice.org.uk/news-views-insights/inside-infrastructure/tips-to-help-you-pass-your-professional-review" },
  { t: "If you don't know, say so", d: "Say what you do know, what you'd need to find out and how you'd find a safe answer. Bluffing is worse than a gap.", src: "Civil Engineered for Success", url: "https://www.civilengineeredforsuccess.co.uk/interview" }
];

/* Practice questions by attribute. Pointers are generic: fit your own projects to them. */
window.QUESTIONS = [
  { a: 0, q: "Talk us through your career so far.", p: "Two minutes, chronological, ending on why you're ready for CEng now. Name your responsibility at each stage." },
  { a: 0, q: "What's the difference between a Chartered and an Incorporated Engineer?", p: "IEng applies and manages existing technology. CEng develops solutions to complex problems, introduces new or improved techniques and takes responsibility. Give one example of your own." },
  { a: 1, q: "Walk us through your most significant engineering decision.", p: "Context, options, how you assessed them, what you chose and why, how you checked it, and what you'd do differently." },
  { a: 1, q: "Give an example of introducing a new or improved technique.", p: "Before, what you changed, who uses it now, what it saved, and how you checked it gave the right answers." },
  { a: 1, q: "What were the limitations of your design or assessment?", p: "Be specific: data you didn't have, simplified methods, assumed parameters. Say how each could change the answer and what would reduce the uncertainty." },
  { a: 1, q: "How did you get independent assurance on your work?", p: "Your company's check, review and approve process, specialist reviews, sense checks against simple hand calculations." },
  { a: 2, q: "What's the difference between management and leadership?", p: "Management plans and controls resources; leadership sets direction and motivates people. Name your own style and when it didn't work." },
  { a: 2, q: "What do you do if someone in your team is underperforming?", p: "Find out why first, agree clear expectations and support, check in, and escalate if it continues." },
  { a: 2, q: "What's the difference between QA and QC?", p: "QA is the process that prevents errors (checking, design reviews, decision logs). QC inspects the output against the specification." },
  { a: 3, q: "What are the main procurement routes, and when would you use each?", p: "Traditional, design and build, early contractor involvement, management contracting, frameworks and alliancing. Who holds design risk in each." },
  { a: 3, q: "Explain the NEC4 ECC main options.", p: "A priced activity schedule, B bill of quantities, C and D target cost with pain/gain share, E cost reimbursable, F management. Who carries risk in each." },
  { a: 3, q: "Walk us through the NEC4 compensation event process.", p: "See the timescales on the Reference page. Know the 8-week time bar and the deemed acceptance mechanism." },
  { a: 3, q: "What's included in an hourly charge-out rate?", p: "Salary, on-costs (NI, pension), overheads (office, IT, insurance, training), non-chargeable time, and profit. People forget profit." },
  { a: 3, q: "What do you do when a job is going over budget?", p: "Spot it early (hours against progress), find the cause, tell the PM. Client change means an early warning and compensation event; your own overrun means re-sequencing or agreeing scope." },
  { a: 4, q: "What are the duty holders under CDM 2015, and when is a project notifiable?", p: "Client, Principal Designer, Designer, Principal Contractor, Contractor, Worker. Notifiable when it lasts over 30 working days with more than 20 workers at once, or exceeds 500 person-days. The client notifies HSE (F10)." },
  { a: 4, q: "What are your duties as a designer under CDM 2015?", p: "Eliminate, reduce or control foreseeable risks; provide information on residual risks; cooperate; provide information for the health and safety file." },
  { a: 4, q: "What's the difference between a hazard and a risk?", p: "A hazard can cause harm; risk combines how likely and how severe the harm is. Then the hierarchy of control: eliminate, reduce, isolate, control, PPE, discipline." },
  { a: 4, q: "What does the HSE do?", p: "Regulates, inspects, investigates and enforces through improvement and prohibition notices and prosecution. Publishes ACOPs such as L153 for CDM." },
  { a: 4, q: "Tell us about a CROSS report you've read.", p: "Pick one relevant to your field: what failed and the lesson for your own work." },
  { a: 5, q: "What is PAS 2080 and how would you apply it?", p: "Carbon management in infrastructure (2023 version): whole-life carbon, value chain roles, and the hierarchy build nothing, build less, build clever, build efficiently." },
  { a: 5, q: "Did biodiversity net gain apply to your project?", p: "Mandatory 10% for most planning applications in England since February 2024 under the Environment Act 2021. Know how it's measured." },
  { a: 5, q: "Which UN Sustainable Development Goals does your work contribute to?", p: "Pick two or three that genuinely fit, and say how." },
  { a: 6, q: "Give an example of explaining a technical idea to a non-technical person.", p: "Who they were, what they needed to decide, how you changed your message, and what they decided as a result." },
  { a: 6, q: "How have you helped make your workplace more inclusive?", p: "A specific action, not a training course. The 2026 Code asks for a fair and inclusive workplace." },
  { a: 7, q: "What are the main principles of the ICE Code of Professional Conduct?", p: "The 2026 Code, in force from 24 March 2026, has six rules: integrity, competence, public interest and safety, the environment, CPD and developing others, and raising concerns. It adds AI accountability and disclosure." },
  { a: 7, q: "What would you do if asked to sign off work you weren't competent to judge?", p: "Decline, say why, find the right person. Hold the line if pressured: competence is a Code rule." },
  { a: 7, q: "What would you do if you found a mistake in your own company's design?", p: "Raise it promptly through the formal route, get it fixed, record it. Public safety comes before reputation." },
  { a: 7, q: "Have you used AI in preparing your submission?", p: "Answer honestly. The 2026 Code says accountability can't be delegated to AI and asks you to disclose your use. Make sure you can explain every sentence of your report." },
  { a: 7, q: "What are your development goals after chartership?", p: "Specific, linked to your gaps and career direction, and say how ICE can support them." },
  { a: 8, q: "Who is the ICE President and what is their theme?", p: "Julie Wood (from November 2026): connected, outcome-focused thinking; smarter delivery; social mobility. See Current affairs." },
  { a: 8, q: "What are the biggest challenges facing UK infrastructure?", p: "Stop-start pipelines, funding squeezed by defence, grid capacity, water sector reform, climate resilience and skills. Have one fact and one view on each." },
  { a: 8, q: "Have you read a recent NCE article? What did you think?", p: "Read one in full that relates to your work. One fact, one view, one link to your own experience." }
];

/* Reference cards. Sources are linked; general-knowledge items say so. */
window.REFERENCE = [
  {
    t: "NEC4 key timescales",
    rows: [
      ["Early warning", "As soon as either party becomes aware"],
      ["First early warning register", "Within 1 week of the starting date"],
      ["First early warning meeting", "Within 2 weeks of the starting date"],
      ["Notify a compensation event", "Within 8 weeks of becoming aware, or the right is lost"],
      ["PM replies to CE notification", "Within 1 week; deemed a CE 2 weeks after a reminder"],
      ["Contractor's quotation", "Within 3 weeks of instruction"],
      ["PM replies to quotation", "Within 2 weeks; deemed accepted 2 weeks after a reminder"],
      ["PM accepts or rejects a programme", "Within 2 weeks"]
    ],
    note: "From CECA NEC4 bulletins. Check clause numbers against the contract itself.",
    links: [["CECA Bulletin 13", "https://www.ceca.co.uk/wp-content/uploads/2022/01/CECA-NEC4-Bulletin-No.13-Notifying-early-warnings-and-notifying-compensation-events-January-2022.pdf"]]
  },
  {
    t: "CDM 2015 duty holders",
    rows: [
      ["Client", "Makes suitable arrangements, appoints PD and PC in writing, provides pre-construction information, notifies HSE"],
      ["Principal Designer", "Plans, manages and coordinates H&S in the pre-construction phase; prepares the H&S file"],
      ["Designer", "Eliminates, reduces or controls foreseeable risks; passes on residual risk information"],
      ["Principal Contractor", "Plans, manages and monitors the construction phase; construction phase plan; site induction and welfare"],
      ["Contractor", "Plans, manages and monitors their own work"],
      ["Worker", "Cooperates, reports hazards, follows the plan"]
    ],
    note: "General knowledge. Read HSE's L153 guidance before quoting.",
    links: [["HSE: CDM 2015 (L153)", "https://www.hse.gov.uk/pubns/books/l153.htm"]]
  },
  {
    t: "ICE mandatory CPD themes (from 2026)",
    rows: [
      ["Ethics and professional behaviours", "Including the Code of Professional Conduct"],
      ["Safety and risk management", ""],
      ["Sustainable development", "Including decarbonisation and nature-positive solutions"],
      ["How often", "At least one theme a year, all three over a rolling three years"]
    ],
    note: "Applies to all professionally qualified members, so to you once chartered. A good frame for 'How do you keep up to date?'",
    links: [["ICE announcement", "https://ice.org.uk/news-views-insights/latest-news/ice-introduces-mandatory-cpd-themes"]]
  },
  {
    t: "ICE Presidents",
    rows: [
      ["2026-27: Julie Wood", "Mott MacDonald. Connected outcomes, smarter delivery, social mobility"],
      ["2025-26: David Porter", "Dept for Infrastructure NI. 'You, me and ICE'"],
      ["2024-25: Jim Hall", "University of Oxford. Infrastructure strategies for a sustainable future"]
    ],
    note: "Expect a question on the current President's theme.",
    links: [["Julie Wood confirmed as President", "https://www.ice.org.uk/news-views-insights/latest-news/julie-wood-confirmed-as-ice-president-2026-2027"]]
  }
];

/* Current affairs, condensed from weekly NCE digests. Newest first. */
window.NEWS = [
  {
    week: "2 to 9 November 2026",
    items: [
      { tag: "Profession", t: "New ICE President sets out her agenda", d: "Julie Wood's inaugural address on 3 November set three priorities: connected, outcome-focused thinking; smarter delivery ('stop accepting reinvention as normal'); and social mobility across careers.", url: "https://www.highwaysindustry.com/julie-wood-ice-president/" },
      { tag: "Energy", t: "Budget cuts £700m from carbon capture and hydrogen", d: "Acorn's £200m commitment scrapped and hydrogen grants cut by £500m; £9.4bn for HyNet and the East Coast Cluster protected. Future projects will lean on loans and equity rather than grants.", url: "https://www.thechemicalengineer.com/news/uk-budget-2026-government-deals-blow-to-ccus-and-hydrogen-as-funding-cut-by-700m/" },
      { tag: "Water", t: "MPs push for the water regulation plan by December", d: "Pressure to confirm reforms including a single regulator with a chief engineer.", url: "https://www.newcivilengineer.com/latest/mps-call-for-government-to-publish-plan-for-overhauling-water-regulation-by-december-06-11-2026/", headlineOnly: true },
      { tag: "Resilience", t: "AI-enabled ransomware on critical infrastructure 'highly likely'", d: "Cyber risk to operational technology now belongs in a safety and risk answer.", url: "https://www.newcivilengineer.com/latest/highly-likely-ai-will-be-used-in-ransomware-attack-on-uk-critical-infrastructure-03-11-2026/", headlineOnly: true }
    ],
    angle: "'What do you think of the President's theme?' is a common question. Have one example of reusing a proven approach instead of reinventing it, one of owning an outcome beyond your own package, and one of supporting someone else's development."
  },
  {
    week: "26 October to 2 November 2026",
    items: [
      { tag: "Policy", t: "Autumn Budget 2026", d: "£20.4bn more for the National Wealth Fund and British Business Bank; defence up £14bn; mayors to keep 100% of business rates by the end of the decade; fiscal headroom about £15bn. No specific figures found for roads, rail or water.", url: "https://moneyweek.com/economy/news/live/autumn-budget-2026" },
      { tag: "Nuclear", t: "Sizewell C financing called a 'terrible deal'", d: "The Public Accounts Committee says costs could approach £48bn, with bill payers paying £9.8bn before 2040 under the regulated asset base (RAB) model.", url: "https://newcivilengineer.com/latest/financing-structure-for-sizewell-c-a-terrible-deal-public-accounts-committee-28-10-2026" },
      { tag: "Roads", t: "CIHT calls for rolling five-year funding for local roads maintenance", d: "Another call for funding certainty over one-off pots.", url: "https://www.newcivilengineer.com/latest/ciht-urges-adoption-a-rolling-five%E2%80%91year-funding-model-for-local-highway-maintenance-27-10-2026/", headlineOnly: true }
    ],
    angle: "RAB financing lowers the cost of capital by having consumers pay during construction, but shifts overrun risk onto bill payers. Compare it with Thames Tideway and link it to who bears risk on a regulated asset."
  },
  {
    week: "19 to 26 October 2026",
    items: [
      { tag: "Water", t: "£3.6bn Windermere sewage scheme proposed", d: "United Utilities proposes a tunnel and up to 138km of new sewers, taking sewage to one new treatment works off the lake, with about £1.90 of benefit per £1.", url: "https://www.newcivilengineer.com/latest/3-6bn-windermere-scheme-proposes-138km-of-new-sewers-and-wastewater-tunnel-22-10-2026/" },
      { tag: "Energy", t: "Microsoft leaves the UK's largest AI data centre plan", d: "The grid connection at Loughton, Essex slipped from 2027 to the early 2030s; more than 300 data centres are queuing for connections.", url: "https://www.techradar.com/pro/microsoft-ditches-residency-plans-at-uks-largest-data-center-over-power-supply-concerns" },
      { tag: "Materials", t: "Reduced-carbon calcined clay cement to launch", d: "Lower-clinker concrete is something a designer or site engineer can actually specify.", url: "https://newcivilengineer.com/latest/reduced-carbon-footprint-calcined-clay-cement-to-be-launched-20-10-2026", headlineOnly: true }
    ],
    angle: "Windermere is a textbook option appraisal: incremental fixes against a system-wide solution, bill payers against the environment, and public pressure driving the decision."
  },
  {
    week: "14 to 19 October 2026",
    items: [
      { tag: "Water", t: "Thames Water asks creditors for £2.4bn more", d: "It says it will otherwise run out of cash by early 2027. Creditors later backed extending its emergency funding into autumn 2027; ownership is still undecided.", url: "https://www.watermagazine.co.uk/2026/10/19/efra-chair-urges-decisive-action-over-thames-waters-future/" },
      { tag: "Rail", t: "GBR rolling stock and infrastructure strategy", d: "Trains, depots and infrastructure to be planned as one system, with standard 'fleet families' and electrification and battery trains for decarbonisation.", url: "https://www.newcivilengineer.com/latest/gbrs-rolling-stock-and-infrastructure-strategy-to-support-electrification-and-accessibility-19-10-2026/" },
      { tag: "Industry", t: "Local jobs and spending make up 97% of construction social value", d: "Invites a view on whether we measure the right things.", url: "https://www.newcivilengineer.com/latest/local-jobs-and-spending-generate-97-of-construction-social-value-15-10-2026/", headlineOnly: true }
    ],
    angle: "Thames Water is the go-to example of asset under-investment and regulatory failure. Have a view on the engineer's role: asset condition data, whole-life investment cases and a chief engineer in the regulator."
  },
  {
    week: "Mid-July to 14 October 2026",
    items: [
      { tag: "Resilience", t: "£10.5bn for flood defences and a new taskforce", d: "At least £10.5bn to 2036, £1.4bn in 2026/27, and a Flood and Drought Resilience Taskforce. The government cites about £8 of damage avoided per £1 spent.", url: "https://www.gov.uk/government/news/new-taskforce-to-boost-britains-resilience-to-flooding-and-drought" },
      { tag: "Major projects", t: "HS2 moves contracts off cost-plus", d: "Two of the four main civils joint ventures moved to terms that reward cost control. A new baseline is due in spring 2027.", url: "https://www.ianvisits.co.uk/articles/hs2-renegotiates-major-construction-deals-to-rein-in-spiralling-costs-91521/" },
      { tag: "Major projects", t: "Government major projects: whole-life cost exceeds benefits", d: "189 projects at £924bn whole-life cost against £604bn of monetised benefits; 34 rated Red.", url: "https://www.highwaysmagazine.co.uk/news/dft/nista-govt-major-projects-rated-unachievable" },
      { tag: "Roads", t: "Up to 24 local road schemes cancelled", d: "Following DfT's review of its Major Road Network and Large Local Majors programmes.", url: "https://www.constructionenquirer.com/2026/10/14/roads-axe-hits-24-projects-across-england/" },
      { tag: "Profession", t: "ICE introduces mandatory CPD themes", d: "Ethics, safety and risk, and sustainable development: all three over a rolling three years.", url: "https://ice.org.uk/news-views-insights/latest-news/ice-introduces-mandatory-cpd-themes" }
    ],
    angle: "Political churn and spending trade-offs hurt project certainty, skills retention and supply-chain investment. If your own project faced a funding pause or re-scope, link it here."
  }
];

/* Example forum threads, shown until a real forum is connected. Clearly labelled as examples on the page. */
window.EXAMPLE_THREADS = [
  { cat: "Report writing", t: "How did you show 'controlling a budget' when you're not the PM?", replies: 0 },
  { cat: "Review day", t: "Communication task: how did you use your two sides of A4?", replies: 0 },
  { cat: "Mock reviews", t: "Looking for a mock review partner, water sector, March review", replies: 0 },
  { cat: "Attributes", t: "Examples of a 'new or improved technique' that reviewers accepted", replies: 0 },
  { cat: "Contracts", t: "NEC4 Option C vs E: which questions came up for you?", replies: 0 }
];

window.FORUM_CATEGORIES = [
  { t: "Introductions", d: "Say hello: your discipline, your route and when you're aiming to review." },
  { t: "Report writing", d: "Structure, word count, evidencing each attribute, first-person writing." },
  { t: "Review day", d: "Presentation, interview and communication task: what came up and how it went." },
  { t: "Mock reviews and study partners", d: "Find someone to practise with, by sector and review date." },
  { t: "Current affairs", d: "Discuss the week's industry news and how it might come up in a review." }
];

/* Planner stages. weeks are defaults the visitor can change.
   before: stages counted back from the submission date (listed in time order).
   after: stages counted back from the review date. */
window.PLAN = {
  gapWeeks: 12,
  phases: [
    { id: "ipd", t: "Complete and sign off IPD online", steps: ["ipdrec", "ipdsign"] },
    { id: "report", t: "Write your report", steps: ["map", "draft", "sce", "revise"] },
    { id: "signoff", t: "Sign off and submit", steps: ["final", "sponsors"] },
    { id: "prep", t: "Prepare for review day", steps: ["revision", "pres", "mock"] }
  ],
  before: [
    { id: "ipdrec", t: "Finish your IPD record online", d: "Bring your Initial Professional Development record up to date online, with your training record or other IPD evidence, your CPD record, development action plan and a draft CV. Get your supervisor or mentor to sign off their part.", w: 2, c: "var(--s-violet)" },
    { id: "ipdsign", t: "IPD and CPD sign-off with your MDO", d: "Your regional ICE Membership Development Officer (or Membership Manager or ICE representative) reviews and signs off your IPD and CPD. ICE says to allow 8 weeks for its staff to complete IPD, so contact your regional team (ice.org.uk/nearyou) early.", w: 8, src: "ICE guidance: allow 8 weeks", c: "var(--s-violet)" },
    { id: "map", t: "Map your evidence", d: "List your best example for each attribute and mark the gaps. Agree with your supervisor or mentor how you'll close any gap.", w: 4, c: "var(--s-blue)" },
    { id: "draft", t: "First draft", d: "Write in the first person, one example per decision, within ICE's word limit.", w: 8, c: "var(--accent)" },
    { id: "sce", t: "Supervisor or mentor review", d: "Send the draft to your Supervising Civil Engineer, Delegated Engineer or mentor. Book their time before you send it.", w: 3, c: "var(--flag)" },
    { id: "revise", t: "Revise and final check", d: "Act on the comments. Check every number, the word count, and that the report matches your CPD record and CV.", w: 3, c: "var(--accent)" },
    { id: "final", t: "Supervisor sign-off of your report", d: "Final sign-off of your report by your supervisor or mentor.", w: 1, c: "var(--flag)" },
    { id: "sponsors", t: "Sponsor statements and upload", d: "Your two sponsors upload their statements by ICE's sponsor deadline. Then finish the application form and upload your application.", w: 1, c: "var(--flag)" }
  ],
  after: [
    { id: "revision", t: "Revise topics and current affairs", d: "Flashcards, the Code of Conduct, the contract you work under, CDM, and the news. Little and often.", w: 10, c: "var(--s-blue)" },
    { id: "pres", t: "Prepare your presentation", d: "Build it from your report, then rehearse to about 13 minutes.", w: 6, c: "var(--accent)" },
    { id: "mock", t: "Mock review", d: "A full run-through with someone who isn't your supervisor: presentation, questions and a timed communication task.", w: 3, c: "var(--flag)" }
  ]
};

/* Fact cards for the flashcard page, in addition to the practice questions. */
window.FACT_CARDS = [
  { deck: "Review format", q: "What are the three parts of the professional review?", a: "A presentation on your report, an interview with two reviewers, and a written communication task." },
  { deck: "Review format", q: "How long should your presentation run?", a: "Plan for about 13 minutes. Reviewers may stop you at 15." },
  { deck: "Review format", q: "What can you take into the communication task?", a: "Two sides of A4 of reference notes, as paper or on screen, in the font size you use at work and easily readable if printed. No copying and pasting from them, and no internet or AI tools (ICE guidance p. 27)." },
  { deck: "Review format", q: "How long are the presentation and interview together?", a: "Up to 75 minutes for a Chartered review, 60 for Incorporated (ICE guidance p. 13)." },
  { deck: "Review format", q: "How long is the Chartered communication task, and what's the format?", a: "90 minutes, after the interview. Choose one of two scenarios on current industry issues, written in a given style such as a blog post. Upload within 15 minutes of the end." },
  { deck: "Review format", q: "What should the presentation cover, according to ICE?", a: "One aspect of your report, expanded. Not all the attributes, and not a summary of your CV or report." },
  { deck: "Review format", q: "When do you get your result, and how long do you have to appeal?", a: "By email no later than 6 weeks after the review. An appeal must reach ICE within two months of the date on the result letter." },
  { deck: "Review format", q: "What four kinds of question do reviewers ask?", a: "Factual, analytical (compare or explain), hypothetical (what would you do if) and probing (why did you decide that)." },
  { deck: "Review format", q: "Name the seven ICE attributes.", a: "1 Understanding and practical application of engineering\n2 Management and leadership\n3 Commercial ability\n4 Health, safety and welfare\n5 Sustainable development\n6 Interpersonal skills and communication\n7 Professional commitment" },
  { deck: "Review format", q: "What extra does attribute 1 ask of a Chartered Engineer?", a: "Taking an active role in defining requirements, risks and opportunities; designing and implementing solutions; and engaging in the creation or introduction of new or improved techniques and technology." },
  { deck: "Review format", q: "What extra does attribute 3 ask of a Chartered Engineer?", a: "Controlling the costs and budget of a significant task or project, and sound judgement on statutory, contractual and commercial issues. IEng candidates also control budgets, for engineering tasks." },
  { deck: "Review format", q: "How does UK-SPEC distinguish Incorporated from Chartered Engineers?", a: "IEng: maintains and manages applications of current and developing technology.\nCEng: develops solutions to engineering problems using new or existing technologies, through innovation, creativity and change." },
  { deck: "Professional", q: "When did the current ICE Code of Professional Conduct come into force?", a: "24 March 2026. It adds that accountability can't be delegated to AI and that you should disclose your use of it." },
  { deck: "Professional", q: "What are ICE's three mandatory CPD themes?", a: "Ethics and professional behaviours; safety and risk management; sustainable development. At least one a year, all three over a rolling three years." },
  { deck: "Professional", q: "Who is ICE President for 2026-27, and what are her priorities?", a: "Julie Wood. Connected, outcome-focused thinking; smarter delivery; social mobility across careers." },
  { deck: "Contracts", q: "NEC4: how long does the Contractor have to notify a compensation event?", a: "8 weeks from becoming aware, or the right is lost (unless the event arises from a PM instruction or notification)." },
  { deck: "Contracts", q: "NEC4: how long for a quotation, and for the PM's reply?", a: "Quotation within 3 weeks of instruction. PM replies within 2 weeks; deemed accepted 2 weeks after a reminder." },
  { deck: "Contracts", q: "NEC4: when is the first early warning register and meeting due?", a: "Register within 1 week of the starting date; first meeting within 2 weeks." },
  { deck: "Contracts", q: "NEC4: how long does the PM have to accept a programme?", a: "2 weeks." },
  { deck: "Contracts", q: "Name the NEC4 ECC main options.", a: "A priced with activity schedule\nB priced with bill of quantities\nC target with activity schedule\nD target with bill of quantities\nE cost reimbursable\nF management contract" },
  { deck: "Contracts", q: "What does a missed early warning cost the Contractor?", a: "The compensation event is assessed as if the warning had been given, so avoidable cost isn't paid." },
  { deck: "Contracts", q: "What is RAB financing, and who carries the risk?", a: "A regulated asset base lets the owner recover costs from bill payers during construction, lowering the cost of capital. Overrun risk shifts towards bill payers. Thames Tideway and Sizewell C use it." },
  { deck: "H&S", q: "CDM 2015: when is a project notifiable to HSE?", a: "When construction lasts more than 30 working days with more than 20 workers at any one time, or exceeds 500 person-days. The client notifies (F10)." },
  { deck: "H&S", q: "Name the CDM 2015 duty holders.", a: "Client, Principal Designer, Designer, Principal Contractor, Contractor, Worker." },
  { deck: "H&S", q: "What is HSE's hierarchy of risk control?", a: "1 Elimination, 2 Substitution, 3 Engineering controls, 4 Administrative controls, 5 PPE. PPE comes last, only once the others have been tried. (Many sites teach the longer ERIC-PD version.)" },
  { deck: "H&S", q: "Which sections of the Health and Safety at Work etc. Act 1974 set out the main duties?", a: "s2 employers to employees; s3 employers to others, such as the public; s7 employees. All 'so far as is reasonably practicable'." },
  { deck: "Sustainability", q: "What is the PAS 2080 carbon reduction hierarchy?", a: "PAS 2080:2023 uses Avoid, Switch, Improve. You'll also hear the older wording: build nothing, build less, build clever, build efficiently. The biggest savings come earliest, at the 'avoid' stage." },
  { deck: "Sustainability", q: "What is the biodiversity net gain requirement in England?", a: "At least a 10% increase in biodiversity value relative to the site before development. It applies to planning applications made on or after 12 February 2024, under the Town and Country Planning Act 1990 as amended by the Environment Act 2021." },
  { deck: "Current affairs", q: "How much has the government committed to flood defences, and to when?", a: "At least £10.5bn to 2036, with £1.4bn in 2026/27. It cites about £8 of damage avoided per £1 spent." },
  { deck: "Current affairs", q: "Why is HS2 renegotiating its main works contracts?", a: "To move off cost-plus terms, which left risk with the client and gave weak incentives, onto terms that reward cost control. A new baseline is due in spring 2027." },
  { deck: "Current affairs", q: "What did the 2026 Autumn Budget do to carbon capture and hydrogen?", a: "Cut £700m: Acorn's £200m scrapped and £500m off hydrogen grants. £9.4bn for HyNet and the East Coast Cluster protected." }
,
  /* ICE Code of Professional Conduct, as modified 24 March 2026.
     Source: https://www.ice.org.uk/media/usdi4cre/ice-code-of-professional-conduct-apr-26.pdf
     Scenario answers are illustrative, written for this site and grounded in the rules quoted. */
  { deck: "Code of Conduct", q: "Rule 1 of the ICE Code: what does it require?", a: "Discharge your professional duties with integrity and uphold the reputation and standing of ICE and the profession. Guidance covers conflicts of interest, respect without bias, confidentiality and AI." },
  { deck: "Code of Conduct", q: "Rule 2 of the ICE Code: what does it require?", a: "Undertake only work you are competent to do. Anyone interpreting AI outputs must understand the tools' limitations and risks." },
  { deck: "Code of Conduct", q: "Rule 3 of the ICE Code: what does it require?", a: "Full regard for the public interest, particularly health and safety, and the wellbeing of future generations." },
  { deck: "Code of Conduct", q: "Rule 4 of the ICE Code: what does it require?", a: "Full regard for the environment and the sustainable management of natural resources: take all reasonable steps to minimise environmental harm over a project's lifetime." },
  { deck: "Code of Conduct", q: "Rule 5 of the ICE Code: what does it require?", a: "Keep developing your knowledge, skills and competence, and give reasonable help to the education, training and CPD of others. Keep records of your development planning." },
  { deck: "Code of Conduct", q: "Rule 6 of the ICE Code: what must you promptly tell ICE about?", a: "A criminal conviction or adverse civil judgement related to the Code; losing membership of another body through discipline; bankruptcy or disqualification as a director or trustee; and a significant breach of the Code by another member you believe in good faith has happened." },
  { deck: "Code of Conduct", q: "Rule 6: what else does it ask of you beyond notifying ICE?", a: "Raise genuine concerns with your employer or the relevant authority where whistle-blowing law protects you, support colleagues who raise concerns in good faith, and engage fully with any disciplinary process against you." },
  { deck: "Code of Conduct", q: "What does the 2026 Code say about AI?", a: "Accountability can't be delegated to AI. Disclose the level of your AI use, understand the tools' limits if you interpret their outputs, and make sure any use is justified, proportionate to risk and in the public interest." },
  { deck: "Code of Conduct", q: "What was new in the 2026 Code, according to ICE?", a: "First redesign since 2008; clearer guidance on raising concerns; all members must give the environment full regard; bullying and harassment named for the first time; coverage of disruptive technologies such as AI." },
  { deck: "Code of Conduct", q: "Scenario: your manager asks you to sign off a design check outside your expertise because the deadline is tomorrow. What do you do?", a: "Decline to sign (Rule 2: only work you're competent to do). Explain why, propose a competent checker or a short delay, and record the conversation. Mention the safety risk (Rule 3) if it applies." },
  { deck: "Code of Conduct", q: "Scenario: on site you see an unsafe excavation with workers in it. It isn't your package. What do you do?", a: "Act now: stop the work or get it stopped through the site team, because Rule 3 covers everyone engaged in the project. Then report it through the proper channel and follow up. 'Not my package' isn't a defence." },
  { deck: "Code of Conduct", q: "Scenario: a supplier offers you tickets to a big match while you're assessing their tender. What do you do?", a: "Decline and tell your manager. It creates at least a perceived conflict of interest, which Rule 1's guidance says to avoid, or declare where it can't be avoided. Follow your employer's gifts policy." },
  { deck: "Code of Conduct", q: "Scenario: you used an AI tool to draft part of a design note. What does the Code expect?", a: "You stay accountable for every word and number. Check the output, understand the tool's limits, and disclose the level of AI use (Rule 1 guidance)." },
  { deck: "Code of Conduct", q: "Scenario: a colleague raises a safety concern and the team starts freezing them out. What's your duty?", a: "Support them (Rule 6f) and don't ignore the behaviour: the Code names bullying and harassment, and asks you not to conceal wrongdoing. Raise it with your manager or HR." },
  /* ICE history. Source: https://www.ice.org.uk/about-ice/our-history and
     https://www.ice.org.uk/about-us/our-organisation/royal-charter (checked 15 Nov 2026). */
  { deck: "ICE history", q: "When and where was ICE founded?", a: "1818, by a small group of young engineers meeting in a London coffee shop. ICE describes itself as the world's first professional engineering body." },
  { deck: "ICE history", q: "Who was ICE's first president, and when was he appointed?", a: "Thomas Telford, appointed in 1820." },
  { deck: "ICE history", q: "What was Thomas Telford's nickname, and why?", a: "'The Colossus of Roads'. He built over 1,000 miles of roads in his lifetime." },
  { deck: "ICE history", q: "What does ICE call Telford's most important role for the Institution?", a: "Securing ICE's Royal Charter, in 1828." },
  { deck: "ICE history", q: "When was ICE's charter updated, and when did the current Charter and By-laws take effect?", a: "Updated by Queen Elizabeth II in 1975. The current Royal Charter and By-laws took effect on 30 October 2023." },
  { deck: "ICE history", q: "Name four engineers whose papers are in ICE's archives.", a: "James Brindley, John Smeaton, Thomas Telford and the Rennies. The archives also hold material on Brunel's Thames Tunnel and the Panama Canal." },
  { deck: "ICE history", q: "Roughly how many members does ICE have today?", a: "Over 95,000 members around the world." },
  /* H&S additions. Sources: HSE CDM 2015 summary (hse.gov.uk/construction/cdm/2015/summary.htm),
     Health and Safety at Work etc. Act 1974 (legislation.gov.uk), HSE temporary works page,
     HSE hierarchy of risk controls, IStructE Building Safety Act gateways page, CROSS-UK.
     Scenario answers are illustrative advice written for this site. */
  { deck: "H&S", q: "HSWA 1974 s2: what is the employer's general duty?", a: "\"To ensure, so far as is reasonably practicable, the health, safety and welfare at work of all his employees.\"" },
  { deck: "H&S", q: "HSWA 1974 s3: who else does the employer owe a duty to?", a: "People not in their employment, such as the public, who may be affected by how the employer conducts its undertaking, so far as is reasonably practicable." },
  { deck: "H&S", q: "CDM 2015: when is a Principal Designer and Principal Contractor needed, and who appoints them?", a: "On projects with more than one contractor. The client appoints both." },
  { deck: "H&S", q: "CDM 2015: what is the Principal Designer's main duty?", a: "Plan, manage, monitor and coordinate health and safety in the pre-construction phase, and give relevant information to other duty holders." },
  { deck: "H&S", q: "CDM 2015: what is the Principal Contractor's main duty?", a: "Plan, manage, monitor and coordinate health and safety in the construction phase, including preparing the construction phase plan." },
  { deck: "H&S", q: "CDM 2015: what must a designer do?", a: "Eliminate, reduce or control foreseeable risks that may arise during construction and the maintenance and use of the asset, and provide information on the risks that remain." },
  { deck: "H&S", q: "CDM 2015: what happens to a domestic client's duties?", a: "They normally transfer to the contractor (one contractor) or the principal contractor (more than one)." },
  { deck: "H&S", q: "Is there a specific law on managing temporary works?", a: "No. HSE says there are no specific legal requirements, but recommends appointing a Temporary Works Coordinator with authority to stop work. BS 5975-1:2024 covers management procedures." },
  { deck: "H&S", q: "What does a Temporary Works Coordinator do?", a: "Makes sure temporary works designs are prepared, checked and correctly erected on site. HSE says they should be formally appointed, with authority to stop work that isn't satisfactory." },
  { deck: "H&S", q: "Building Safety Act 2022: what are the three gateways for higher-risk buildings?", a: "Gateway 1 at planning. Gateway 2 before building work starts: approval from the Building Safety Regulator. Gateway 3 at completion: approval before the building is registered and occupied. 2 and 3 are stop/go points." },
  { deck: "H&S", q: "What is CROSS-UK?", a: "Collaborative Reporting for Safer Structures: a confidential, voluntary scheme for built environment professionals to report fire and structural safety concerns. Reports are anonymised and published as lessons." },
  { deck: "H&S", q: "Scenario: you find an excavation support that doesn't match the temporary works design. What do you do?", a: "Stop work in the area and keep people out. Tell the Temporary Works Coordinator straight away, get the design checked, and don't restart until it's put right and signed off. Record it, and report it as a near miss." },
  { deck: "H&S", q: "Scenario: your design leaves a risk you can't design out. What do you do?", a: "Reduce it as far as you can, then record the residual risk clearly on the drawings or risk register so the contractor and Principal Designer know about it. Don't assume someone else will spot it." },
  { deck: "H&S", q: "Scenario: the reviewer asks what you personally did to improve safety. How do you answer?", a: "Give one real example in the first person: the hazard, what you changed (design, sequence, method), the hierarchy level it sits at, and the result. Avoid 'we followed the RAMS'." },
  /* Contracts and procurement additions. Sources: NEC articles on ECC pricing and risk allocation
     (neccontract.com), JCT (jctltd.co.uk), FIDIC (fidic.org), the UK Construction Playbook (gov.uk).
     "Judgement" cards are illustrative advice written for this site. */
  { deck: "Contracts", q: "NEC4 Option A: who carries the cost risk?", a: "The Contractor. It's NEC's lump-sum contract: if the work costs more than the activity prices, the Contractor can't recover the extra (unless it's a compensation event)." },
  { deck: "Contracts", q: "NEC4 Option B: what risk does the Client keep?", a: "Quantity risk. The Contractor is paid rates for the quantities actually done, so if quantities grow, the Client pays." },
  { deck: "Contracts", q: "NEC4 Options C and D: how does the pain/gain share work?", a: "The Contractor is paid Defined Cost plus Fee. At the end, the final cost is compared with the target; the over- or under-run is shared in the proportions set in the Contract Data." },
  { deck: "Contracts", q: "NEC4 Option E: who carries the efficiency risk?", a: "The Client. It pays actual cost plus fee ('cost plus'), so the Contractor has little incentive to save." },
  { deck: "Contracts", q: "NEC4: what do secondary options X1, X2 and X7 do?", a: "X1 price adjustment for inflation (inflation risk to the Client). X2 changes in the law. X7 delay damages." },
  { deck: "Contracts", q: "What are JCT's best-known contracts?", a: "Standard Building Contract, Design and Build Contract and Minor Works Building Contract. JCT is mostly used for building work in the UK." },
  { deck: "Contracts", q: "FIDIC Red Book vs Yellow Book?", a: "Red Book: Construction Contract (the Employer designs). Yellow Book: Plant and Design-Build Contract (the Contractor designs). FIDIC forms are widely used internationally." },
  { deck: "Contracts", q: "What is the Construction Playbook?", a: "UK government policy and guidance on how public works are assessed, procured and delivered, including early supplier engagement, frameworks and longer-term contracts." },
  { deck: "Contracts", q: "Judgement: when would you choose NEC4 Option A over Option C?", a: "Option A when the scope is well defined and stable, so the Contractor can price the risk. Option C when scope or ground risk is uncertain and you want to share it, with the Client accepting more cost-management effort." },
  { deck: "Contracts", q: "Judgement: when does a cost-reimbursable contract (Option E) make sense?", a: "When the work can't be defined well enough to price, such as emergency or investigative work, and speed matters more than cost certainty. The Client needs strong cost control." },
  { deck: "Contracts", q: "Judgement: traditional procurement vs design and build?", a: "Traditional: the Client keeps control of design and gets competitive prices on a complete design, but it's slower and design risk stays with the Client. Design and build: one point of responsibility and earlier start, but less design control and contractors price the design risk." },
  { deck: "Contracts", q: "Judgement: why bring in a contractor early (ECI or two-stage)?", a: "To use construction knowledge on buildability, sequencing and risk before the design is fixed. The trade-off is less price competition at the second stage, so you need open-book pricing." },
  { deck: "Contracts", q: "Judgement: what are frameworks good for?", a: "Repeat work over several years: a pool of pre-qualified suppliers, faster call-off, and continuous improvement across schemes. The downside is less competition and the effort of managing the framework well." },
  /* Sustainability additions. Sources: Climate Change Act 2008 s.1 (legislation.gov.uk, as enacted and amended),
     UK 2035 NDC (gov.uk, January 2025), PAS 2080:2023 (BSI), gov.uk biodiversity net gain guidance,
     UN SDGs (sdgs.un.org). "How would you answer" cards are illustrative advice written for this site. */
  { deck: "Sustainability", q: "What does the Climate Change Act 2008 require by 2050?", a: "UK net emissions at least 100% lower than the 1990 baseline (net zero). The Act originally said at least 80%; it was amended in June 2019." },
  { deck: "Sustainability", q: "What is the UK's 2035 climate target under the Paris Agreement?", a: "Its Nationally Determined Contribution: cut all greenhouse gas emissions by at least 81% by 2035, compared with 1990 levels (published January 2025)." },
  { deck: "Sustainability", q: "What is PAS 2080:2023?", a: "BSI's specification for carbon management in buildings and infrastructure. The 2023 edition (in force 31 March 2023) replaced the 2016 version and widened it from infrastructure to the whole built environment." },
  { deck: "Sustainability", q: "Who are the value chain members in PAS 2080?", a: "Asset owners and managers, designers, constructors, and product and material suppliers. Each has defined carbon management responsibilities." },
  { deck: "Sustainability", q: "What is capital carbon in PAS 2080?", a: "Emissions (and removals) from creating an asset and from its end-of-life treatment. PAS 2080 recognises 'embodied carbon' and 'upfront carbon' as established related terms." },
  { deck: "Sustainability", q: "Capital carbon vs operational carbon vs whole life carbon?", a: "Capital: building it and its end of life. Operational: running and maintaining it in use, such as energy for pumps or lighting. Whole life: both together over the asset's life. Early design decisions drive the biggest share." },
  { deck: "Sustainability", q: "What is whole life costing, and why does it matter for sustainability?", a: "Comparing options on their total cost over the asset's life (build, operate, maintain, replace, dispose), not just capital cost. Cheaper to build is often dearer to run; the same logic applies to carbon." },
  { deck: "Sustainability", q: "Mitigation vs adaptation?", a: "Mitigation cuts emissions to limit climate change. Adaptation makes assets resilient to the climate that's coming: higher flows, sea level rise, heat. Civil engineers need both, and a good answer gives an example of each." },
  { deck: "Sustainability", q: "What does a circular economy mean on a civils project?", a: "Keeping materials in use at their highest value: reusing existing structures, designing for disassembly, reusing excavated material on site, specifying recycled content, and reducing waste at source." },
  { deck: "Sustainability", q: "How many UN Sustainable Development Goals are there, and when were they adopted?", a: "17, adopted by all UN member states in 2015 as part of the 2030 Agenda." },
  { deck: "Sustainability", q: "How would you answer: 'What did you personally do to reduce carbon on your project?'", a: "One specific decision, in the first person: the options you compared, the carbon (and cost) of each, what you chose and why, and where it sits on the avoid-switch-improve hierarchy. Give a number if you have one." },
  { deck: "Sustainability", q: "How would you answer: 'What does net zero mean for your work?'", a: "Define it briefly (UK law, 2050), then bring it to your own work: how carbon is measured on your projects, a decision it changed, and what you'd do differently next time. Reviewers want the link to your practice, not the definition." },
  { deck: "Sustainability", q: "How would you answer: 'How do you balance cost, programme and sustainability?'", a: "Show a real trade-off: the options, how you weighed them (whole life cost and carbon, not just capital), who you consulted, and the decision. Admit what you gave up. Judgement, not slogans." }
  /* Consultancy appointments. Sources: neccontract.com (PSC, PSSC, FAQ on PI and liability), ACE press release and FAQs, FIDIC,
     RIBA, legislation.gov.uk (SGSA 1982 s13, Limitation Act 1980), ARB PI guidance, CMS (MT Hojgaard), Gatehouse Law and Fenwick Elliott
     (West v Ian Finlay), V&E (Abbey Healthcare), Pinsent Masons (BSA s135), Beale & Co (caps). Judgement cards are illustrative advice. */,
  { deck: "Consultancy appointments", q: "What is the NEC4 Professional Service Contract (PSC) for?", a: "Appointing consultants: designers, project managers, supervisors and other professional services. For smaller, simpler appointments NEC4 also has the Professional Service Short Contract (PSSC)." },
  { deck: "Consultancy appointments", q: "NEC4 PSC: what are the main payment options?", a: "A priced contract with activity schedule (paid tendered rates); C target contract; E cost reimbursable. Under C and E the consultant is paid Defined Cost plus a fee percentage. NEC3's Option G (term contract) was dropped in NEC4." },
  { deck: "Consultancy appointments", q: "NEC4 PSC: what standard of care does the consultant owe?", a: "\"The skill and care normally used by professionals providing services similar to the service.\" A skill and care duty, not fitness for purpose. Check the clause number in the contract you work under." },
  { deck: "Consultancy appointments", q: "NEC4 PSC: what do X18 and the liability cap do?", a: "The Contract Data sets a cap on the consultant's total liability (with some excluded matters). X18 adds limits on specific types of liability. NEC notes the consultant is still liable above its PI cover unless the contract caps it." },
  { deck: "Consultancy appointments", q: "NEC4 PSC: name three secondary options a consultant often meets.", a: "X10 information modelling (BIM); X18 limitation of liability; X8 undertakings such as collateral warranties to the Client or others." },
  { deck: "Consultancy appointments", q: "What is the ACE Professional Services Agreement?", a: "ACE's standard appointment for consultants, launched March 2017. It replaced ACE Agreements 1 and 3, works across all UK jurisdictions, includes a form of warranty, and is drafted so the risk split is insurable under PI." },
  { deck: "Consultancy appointments", q: "What is the FIDIC White Book?", a: "FIDIC's Client/Consultant Model Services Agreement, widely used internationally. Current edition: 5th, 2017." },
  { deck: "Consultancy appointments", q: "Which standard appointment forms do architects use?", a: "RIBA Professional Services Contracts (Standard, Concise, Domestic). RIBA issued 2024 editions to replace the 2020 ones, updated for the building safety regime." },
  { deck: "Consultancy appointments", q: "Reasonable skill and care vs fitness for purpose?", a: "Skill and care: you must do what a competent professional would; a bad outcome isn't a breach if you weren't negligent. Fitness for purpose: the result must work as intended, whether or not you were careful. Supply of Goods and Services Act 1982 s13 implies reasonable care and skill into business service contracts." },
  { deck: "Consultancy appointments", q: "Why do consultants resist fitness for purpose obligations?", a: "PI insurance responds to negligence, so a fitness-for-purpose promise can be breached without negligence and is generally uninsured. That leaves the firm carrying the risk itself." },
  { deck: "Consultancy appointments", q: "What is the Bolam test?", a: "A professional isn't negligent if they acted in line with a practice accepted as proper by a responsible body of their profession, even if others would have acted differently (from Bolam, 1957). Courts apply it to engineers too." },
  { deck: "Consultancy appointments", q: "What did MT Højgaard v E.ON (Supreme Court, 2017) decide?", a: "Wind turbine foundations failed. The technical requirements asked for a 20-year design life, which the Court read as a fitness-for-purpose obligation. Following the design standard (which contained an error) was only a minimum and no defence." },
  { deck: "Consultancy appointments", q: "How does PI insurance usually work?", a: "On a claims-made basis: the policy in force when the claim is made responds, not when the work was done. Cover is 'each and every claim' or 'in the aggregate' (one pot per year). Firms keep run-off cover after a job, often at least six years." },
  { deck: "Consultancy appointments", q: "What does a net contribution clause do?", a: "Limits a consultant's liability to the share it's just and reasonable for it to pay, given others' responsibility. Without one, joint and several liability can leave it paying 100% if the contractor is insolvent. Upheld in West v Ian Finlay & Associates (Court of Appeal, 2014)." },
  { deck: "Consultancy appointments", q: "Collateral warranty vs third party rights?", a: "A collateral warranty is a separate contract giving a funder, tenant or purchaser rights against you. The Contracts (Rights of Third Parties) Act 1999 can do the same within the appointment, without separate documents, but is often excluded." },
  { deck: "Consultancy appointments", q: "Can you adjudicate a dispute under a collateral warranty?", a: "Usually not as of right. In Abbey Healthcare v Simply Construct (Supreme Court, 2024) most collateral warranties were held not to be 'construction contracts' under the Construction Act, unless they contain a distinct obligation to build." },
  { deck: "Consultancy appointments", q: "How long can a client sue you after the work?", a: "Simple contract: 6 years (Limitation Act 1980 s5). Deed: 12 years (s8). Tort: generally 6 years. The Building Safety Act 2022 extended Defective Premises Act claims to 15 years, or 30 years retrospectively." },
  { deck: "Consultancy appointments", q: "How are consultants' liability caps usually set?", a: "A fixed sum, a multiple of the fee, or linked to the PI cover required. A cap far below the PI level the client demands risks being unreasonable under the Unfair Contract Terms Act." },
  { deck: "Consultancy appointments", q: "Judgement: the client adds work to your scope by email. What do you do?", a: "Don't just absorb it. Check it against your appointment's scope, tell your manager, and notify it as a change under the contract (a compensation event under the NEC4 PSC) before doing much work. Record the fee and programme effect. Scope creep without a contract change is the classic consultancy loss." },
  { deck: "Consultancy appointments", q: "Judgement: a client asks you to warrant the design will 'be fit for purpose'. How do you respond?", a: "Flag it to your manager and the firm's legal or insurance contact. Explain that it's probably uninsured under PI, and offer reasonable skill and care with clearly defined performance requirements instead. Don't sign it yourself." },
  { deck: "Consultancy appointments", q: "Judgement: you're asked to sign a collateral warranty for a funder. What do you check?", a: "That it mirrors (and doesn't exceed) your appointment: same standard of care, same liability cap and net contribution clause, PI requirements you can meet, and limits on assignment. Get it reviewed before signing." }
  /* Design standards. Sources: JRC Eurocodes pages, BSI Knowledge, DCLG 2010 withdrawal letter, legislation.gov.uk (Building Act 1984 s7),
     gov.uk Approved Documents, DMRB GG 101 and CG 300 (standardsforhighways.co.uk), Network Rail standards catalogue, RSSB, CIHT,
     HSE (BS 5975 Table 1), gov.uk higher-risk building criteria, ICE (CROSS-UK). Judgement cards are illustrative advice. */,
  { deck: "Design standards", q: "How many Eurocodes are there, and what does each cover?", a: "Ten. EN 1990 basis of design; 1991 actions; 1992 concrete; 1993 steel; 1994 composite; 1995 timber; 1996 masonry; 1997 geotechnical; 1998 earthquake; 1999 aluminium." },
  { deck: "Design standards", q: "What are a National Annex and an NDP?", a: "A Nationally Determined Parameter is a choice the Eurocode leaves to each country, such as safety factors, climatic data or which procedure to use. The National Annex sets the UK's choices. Always design to the BS EN with its UK National Annex." },
  { deck: "Design standards", q: "What is NCCI, and give a UK example.", a: "Non-Contradictory Complementary Information: guidance that supports a Eurocode without contradicting it. Example: PD 6687-1, BSI's background paper to the UK National Annexes for Eurocode 2." },
  { deck: "Design standards", q: "What happened to BS 5950, BS 8110 and the other old British design codes?", a: "BSI withdrew British standards that conflicted with the Eurocodes on 31 March 2010. They're still on sale but no longer maintained, so they don't reflect current knowledge." },
  { deck: "Design standards", q: "Are the Eurocodes still used in the UK after Brexit?", a: "Yes. BSI stayed a full member of CEN and CENELEC, so the UK still adopts Eurocodes as BS EN standards with UK National Annexes." },
  { deck: "Design standards", q: "What are the second-generation Eurocodes, and when do they take over?", a: "A revised set, adding an 11th code (EN 19100, structural glass). National publication is due by 30 September 2027; BSI will withdraw the first generation on 30 March 2028. IStructE advises against mixing generations on one design." },
  { deck: "Design standards", q: "Are British Standards legally binding?", a: "Not on their own. BSI: standards are voluntary, regulations are mandatory. A standard becomes binding when regulations reference it, or when a contract or client calls it up." },
  { deck: "Design standards", q: "What status do Approved Documents have?", a: "Statutory guidance on meeting the Building Regulations. Under the Building Act 1984 s7, following one can be relied on as evidence of compliance and departing from one as evidence of breach, but you can comply another way. Approved Document A covers structure." },
  { deck: "Design standards", q: "What is the DMRB, and where does it apply?", a: "The Design Manual for Roads and Bridges, published by National Highways with Transport Scotland, the Welsh Government and DfI Northern Ireland. It applies to motorways and all-purpose trunk roads; other highway authorities may adopt it." },
  { deck: "Design standards", q: "DMRB: what is a departure from standard?", a: "Varying or waiving a 'shall' requirement. It must be approved by the Overseeing Organisation before the design is finalised. Not following a 'should' needs a recorded justification and a safety risk assessment instead. Legislation can never be departed from (GG 101)." },
  { deck: "Design standards", q: "Network Rail standards: what are the levels, and how do you depart from one?", a: "NR/L1 policy, NR/L2 specifications and processes, NR/L3 work instructions: all mandatory. NR/GN guidance notes aren't. To depart from a company standard you need an approved 'variation'. For a Railway Group Standard (RSSB), you apply for a 'deviation'." },
  { deck: "Design standards", q: "What are Manual for Streets and Manual for Streets 2?", a: "DfT's 2007 guidance on residential streets, and the 2010 companion extending it to busier urban streets. They prioritise place and pedestrians over traffic. An update is being finalised; until it's published, both remain in use." },
  { deck: "Design standards", q: "Which document wins when standards conflict?", a: "No single official hierarchy exists. As a principle: legislation always applies; then the client's or sector's mandatory standards called up in the contract (DMRB, Network Rail); then codes such as the Eurocodes with their National Annex; then guidance. Raise conflicts with the client and record the decision." },
  { deck: "Design standards", q: "CG 300 (highway structures): what are the check categories?", a: "Cat 0 and 1: simple, no departures; another engineer, who may be in the design team. Cat 2: everything else; a checker in the same organisation but independent of the design team. Cat 3: complex structures; a separate organisation. Checkers build their own models. Check the current CG 300 for span limits." },
  { deck: "Design standards", q: "What is an Approval in Principle (AIP)?", a: "Under CG 300, the document recording the agreed basis and criteria for designing or assessing a highway structure, agreed with the Technical Approval Authority before detailed design. Valid for three years. Not needed for Cat 0; may be waived for Cat 1." },
  { deck: "Design standards", q: "BS 5975: what are the temporary works design check categories?", a: "Cat 0 standard solutions (checked by another member of the site or design team); Cat 1 simple (another member of the design team); Cat 2 more complex (someone not involved in the design); Cat 3 complex or innovative (another organisation)." },
  { deck: "Design standards", q: "What is a higher-risk building, and who regulates it?", a: "In England: at least 18 m or 7 storeys with at least two residential units. Regulated by the Building Safety Regulator, which became a standalone body sponsored by MHCLG in 2026, separate from HSE." },
  { deck: "Design standards", q: "What is CROSS-UK's role now?", a: "Confidential reporting on structural and fire safety, run by ICE and IStructE. The Building Safety Regulator has named it the official voluntary occurrence reporting system until at least 2028." },
  { deck: "Design standards", q: "Judgement: your situation isn't covered by the standard. What do you do?", a: "Go back to first principles and the standard's intent. Look for authoritative guidance (NCCI, research, sector guides), state your assumptions, use sensitivity checks, and get it reviewed independently. Agree the approach with the client or approval authority and record it. Know the limits of your competence." },
  { deck: "Design standards", q: "Judgement: the client wants something that needs a departure from standard. How do you handle it?", a: "Check whether it's a 'shall' (formal departure) or a 'should' (justify and record). Prepare the case: why, the risks, the mitigation and the evidence. Submit it through the client's departures process before finalising the design, and don't build it until it's approved." },
  { deck: "Design standards", q: "Judgement: a reviewer asks how you knew your design was right. How do you answer?", a: "Name the governing standard and National Annex, the client standard, how you checked (category, independent model or hand check), and the sense checks you did. Mention any departures and who approved them." },
  { deck: "Design standards", q: "Judgement: you spot an error in a published design standard. What do you do?", a: "Don't just follow it: MT Højgaard showed compliance with a flawed standard is no defence where the contract asks for more. Design to the correct engineering, tell your manager and the client, and report it to the standard's owner." },
  // ----- Generic cards added Nov 2026 (reservoirs, flood, site, commercial, people, ethics) -----
  { deck: "Reservoir safety", q: "What is the Reservoirs Act 1975 for, and who does what under it?", a: "It protects people from the escape of water from large raised reservoirs. The undertaker (owner or operator) is responsible for safety. Qualified panel engineers do the technical roles: a Construction Engineer for new or altered reservoirs, an Inspecting Engineer for periodic inspections (Section 10) and a Supervising Engineer in between (Section 12). The Environment Agency enforces it in England." },
  { deck: "Reservoir safety", q: "What is a 'large raised reservoir', and who regulates reservoirs in each UK nation?", a: "In England, a reservoir designed to hold, or capable of holding, at least 25,000 m3 above natural ground level, regulated by the Environment Agency. Wales lowered the threshold to 10,000 m3 (Natural Resources Wales). Scotland has the Reservoirs (Scotland) Act 2011 (SEPA) and Northern Ireland the Reservoirs Act (Northern Ireland) 2015 (DfI)." },
  { deck: "Reservoir safety", q: "What is a high-risk reservoir designation?", a: "In England the Environment Agency designates a large raised reservoir as high-risk if an uncontrolled release of water could endanger human life. It's about consequence, not condition. High-risk reservoirs need a Supervising Engineer and Section 10 inspections." },
  { deck: "Reservoir safety", q: "How are panel engineers appointed, and what panels are there?", a: "Since 2022 the panels are joint for England and Wales, with appointments made by the Secretary of State and Welsh Ministers on the recommendation of ICE's Reservoirs Committee, for a fixed term. Panels: All Reservoirs Panel, Non-impounding Reservoirs Panel, Service Reservoirs Panel and Supervising Engineers Panel. Acting in a statutory role without the appointment isn't allowed." },
  { deck: "Reservoir safety", q: "What does an Inspecting Engineer do under Section 10?", a: "Inspects the reservoir at intervals of no more than 10 years, or sooner if recommended. The report can set 'measures to be taken in the interests of safety' (MIOS) with deadlines, which the undertaker must carry out, plus maintenance matters and things for the Supervising Engineer to watch. The Inspecting Engineer must be independent of the undertaker." },
  { deck: "Reservoir safety", q: "What does a Supervising Engineer do under Section 12?", a: "Supervises the reservoir between inspections, gives the undertaker a written statement at least once every 12 months, visits at least once a year (often twice, per Environment Agency guidance), watches the matters listed in the last inspection report, checks safety measures and maintenance are being done, and can recommend an earlier Section 10 inspection." },
  { deck: "Reservoir safety", q: "What are the undertaker's main duties?", a: "Register the reservoir, appoint a Supervising Engineer and commission inspections (if high-risk), carry out measures in the interests of safety by their deadlines, keep the records required under Section 11 for high-risk reservoirs (water levels, leakage, settlement, works and so on), have an on-site flood plan, and report incidents to the enforcement authority. Failing to carry out a safety measure is an offence." },
  { deck: "Reservoir safety", q: "What happens when a reservoir is built or altered?", a: "The undertaker appoints a Construction Engineer from the All Reservoirs Panel (Section 6). They supervise the work and issue a preliminary certificate before first filling and a final certificate once satisfied with its performance (Section 7). Changes affecting safety go through them." },
  { deck: "Reservoir safety", q: "Does the Act cover flood storage and service reservoirs?", a: "It depends on capacity above natural ground level, not what the reservoir usually holds. A normally dry flood storage reservoir can be a large raised reservoir, and it's harder to supervise because defects may only show when it fills. Some raised service reservoirs qualify, which is why there's a Service Reservoirs Panel." },
  { deck: "Reservoir safety", q: "What happened at Toddbrook, and why does it matter?", a: "On 1 August 2019 part of the concrete spillway at Toddbrook Reservoir failed in a flood and Whaley Bridge was evacuated. Professor David Balmforth's independent review (Part A, 2020) pointed to the spillway's design and condition, maintenance and the quality of inspections. A wider review (Part B, 2021) was accepted by government in 2022 and led to the Reservoir Safety Reform Programme." },
  { deck: "Reservoir safety", q: "What's the difference between a dam's Category A to D and its high-risk designation?", a: "Both are based on consequence. The category comes from ICE's Floods and Reservoir Safety (4th ed., 2015) and is chosen by the panel engineer to set the design flood: A (lives in a community at risk) uses the PMF, D (no loss of life, very limited damage) a 150-year flood; check the book's table before quoting the others. High-risk is a legal designation made by the regulator under the Act." },
  { deck: "Reservoir safety", q: "What is RARS?", a: "Risk Assessment for Reservoir Safety Management: Environment Agency guidance on a tiered, risk-based approach. Tier 1 is a simple screening of failure modes and consequences, Tier 2 looks in more detail at modes such as overtopping, internal erosion and instability, and Tier 3 is a detailed quantitative assessment. Used to prioritise investment beyond the legal minimum." },
  { deck: "Reservoir safety", q: "What emergency planning is in place for reservoirs?", a: "The Flood Plan (Reservoirs Emergency Planning) Direction 2021 requires undertakers of all large raised reservoirs in England, high-risk or not, to have an on-site flood plan (triggers, contacts, drawdown, access, warnings). The Environment Agency publishes reservoir flood maps from breach modelling, and Local Resilience Forums plan the off-site response such as evacuation." },
  { deck: "Reservoir safety", q: "How is reservoir regulation in England changing?", a: "Defra and the Environment Agency's Reservoir Safety Reform Programme (first published April 2025) proposes a hazard-based classification, a safety management system for undertakers, bringing reservoirs of 10,000 to 25,000 m3 into scope in England, and a stronger regulator role. Wales has joined. A public consultation is expected; check gov.uk for the latest." },
  { deck: "Reservoir safety", q: "Why does drawdown capacity matter?", a: "Being able to lower the water quickly takes load off a dam in an emergency such as heavy seepage, slope movement or spillway damage. Toddbrook showed many reservoirs couldn't, so pumps had to be brought in. The Environment Agency's Guide to drawdown capacity for reservoir safety and emergency planning (published 2021) gives target lowering rates, and outlets need operating regularly to prove they work." },
  { deck: "Reservoir safety", q: "A reservoir is below the 25,000 m3 threshold. Does it have no safety obligations?", a: "No. It isn't regulated under the Act in England, but the owner still has duties under general law (negligence, health and safety law, CDM during works), and engineers still owe a duty of care. Good practice is to apply reservoir safety principles in proportion to the risk." },
  { deck: "Reservoir safety", q: "Routine surveillance, a statutory inspection and an engineering investigation: what's the difference?", a: "Surveillance: frequent visual checks and monitoring by the undertaker's staff, overseen by the Supervising Engineer. Statutory inspection: the Section 10 inspection by an independent Inspecting Engineer. Investigation: a targeted study of one concern (ground investigation, seepage, spillway capacity), often recommended by one of the others." },
  { deck: "Reservoir safety", q: "How do compliance, risk assessment and emergency planning fit together?", a: "Compliance with the Act is the legal minimum. Risk assessment finds and ranks risks beyond that, by likelihood and consequence, to prioritise spending. Emergency planning manages what's left if failure starts. Breach modelling feeds both the risk assessment and the plans." },
  { deck: "Reservoir safety", q: "How does climate change affect reservoir safety?", a: "More intense rainfall raises design floods and spillway demand. Drought cracks clay cores and crests, which can start internal erosion when the reservoir refills. Bigger swings in water level load the slopes. Flood assessments now need to allow for climate change." },
  { deck: "Reservoir safety", q: "How would you prioritise limited funding across several reservoirs?", a: "Statutory safety measures first. Then rank by risk (likelihood times consequence) and risk reduction per pound. Use interim measures, such as a lower operating level or more monitoring, where full works must wait. Record the reasoning." },
  { deck: "Reservoir safety", q: "Scenario: there's turbid seepage, but the operator says it's always been like that. What do you do?", a: "Treat it as serious until proven otherwise, because cloudy seepage means soil is being carried out. Record, measure and sample it, explain the risk plainly, tell the Supervising Engineer at once and increase monitoring. Don't accept 'it's always been like that' without evidence, and escalate if nothing happens." },
  { deck: "Reservoir safety", q: "Scenario: you find a defect that could affect safety, but you aren't the statutory engineer. What are your responsibilities?", a: "Report it promptly, with evidence, to the undertaker and the Supervising Engineer (or the Construction Engineer during works). Don't claim authority you don't have, and don't sit on it. Follow up until it's dealt with. The ICE Code expects you to put public safety first and report concerns." },
  { deck: "Reservoir safety", q: "Scenario: an operator won't act on your safety advice. What do you do?", a: "Repeat it in writing with the consequence and a deadline, escalate within your organisation and to the Supervising Engineer, and remember that statutory safety measures can be enforced by the regulator. Don't let it drop: public safety comes first." },
  { deck: "Reservoir safety", q: "Scenario: you're asked to act as Supervising Engineer before you're on the panel. What do you do?", a: "Decline. The role must be held by an engineer appointed to the Supervising Engineers Panel. Offer to support a panel engineer instead, which also builds the experience you need to apply." },
  { deck: "Reservoir safety", q: "How do you communicate an urgent reservoir safety concern without under- or overstating it?", a: "Facts first (what you saw and measured, where), what it could lead to, how urgent it is, what you recommend now, and what you don't know yet. Plain words, in writing, and confirm it's been understood." },
  { deck: "Reservoir safety", q: "What evidence would you want before closing out a reservoir defect?", a: "An understanding of the cause, a completed and checked repair (or stable behaviour over time, including at high water), monitoring within trigger levels, no recurrence at inspection, and agreement from the responsible panel engineer." },

  { deck: "Dams and hydraulics", q: "What types of dam are there, and what does the UK stock mostly look like?", a: "Embankment (homogeneous, zoned with a clay core, rockfill), concrete gravity, arch, buttress and masonry. Most UK large raised reservoirs are old earth embankments, many Victorian with puddle clay cores and little filtering or drainage, so internal erosion and spillway capacity are common concerns." },
  { deck: "Dams and hydraulics", q: "Internal erosion, piping and overtopping: what's the difference?", a: "Internal erosion: seepage carries soil particles out through or under the dam. Piping is one form, where erosion works back from the exit to form a pipe. Overtopping: water flows over the crest because the spillway or freeboard isn't enough, eroding the downstream face. Internal erosion develops over time; overtopping happens in a flood." },
  { deck: "Dams and hydraulics", q: "What do filters, transition zones and drainage blankets do?", a: "A filter stops soil particles moving while letting water pass (sized to the base soil). A transition zone grades between very different materials so neither migrates into the other. A drainage blanket collects seepage under the downstream shoulder, lowering pore pressure in the slope." },
  { deck: "Dams and hydraulics", q: "Zoned vs homogeneous embankment?", a: "Homogeneous: one low-permeability fill, relies on flat slopes and toe drains; common for small dams and flood basins. Zoned: a low-permeability core with stronger, more permeable shoulders and filters between zones, allowing steeper slopes and better seepage control." },
  { deck: "Dams and hydraulics", q: "What is freeboard, and how is crest level set?", a: "Freeboard is the height between a water level and the crest. Crest level = top water level + flood surcharge (the design flood routed through the spillway) + wave allowance (wind set-up and run-up) + an allowance for settlement. Floods and Reservoir Safety gives the method." },
  { deck: "Dams and hydraulics", q: "Service, auxiliary and emergency spillways: what's the difference?", a: "Service spillway: passes frequent floods, usually concrete. Auxiliary: used in larger, rarer floods, often grassed or reinforced grass and allowed some damage. Emergency: only for extreme events, such as a fuse plug." },
  { deck: "Dams and hydraulics", q: "What can go wrong with a spillway?", a: "Blockage by debris, uplift under slabs through open joints (Toddbrook 2019, Oroville 2017), cavitation at high velocity, erosion at the toe, walls overtopped, and on grassed spillways, poor turf or a weak layer beneath." },
  { deck: "Dams and hydraulics", q: "How do you work out the design flood for a reservoir?", a: "Set the dam category from the consequences of a breach (Floods and Reservoir Safety), which fixes the design and safety check floods. Estimate inflow hydrographs (FEH methods, or PMF methods for Category A), allow for climate change, then route them through the reservoir to get peak outflow and water level." },
  { deck: "Dams and hydraulics", q: "How does flood routing through a reservoir work?", a: "Continuity: inflow minus outflow equals change in storage. Step through time using the stage-storage curve and the spillway's stage-discharge curve. Attenuation depends on the storage area and the spillway rating: more storage and a narrower spillway mean a lower, later peak." },
  { deck: "Dams and hydraulics", q: "Spillway capacity vs flood routing?", a: "Capacity is how much the spillway can pass at a given water level (its rating curve). Routing is how storage reduces the inflow peak, giving the actual outflow and peak level. Routing says what the spillway must pass; capacity says whether it can." },
  { deck: "Dams and hydraulics", q: "Sub- and supercritical flow, hydraulic jumps and cavitation: explain.", a: "Froude number Fr = V / sqrt(gD). Subcritical (Fr < 1) is deep and slow; supercritical (Fr > 1) is shallow and fast, as on a chute. A hydraulic jump is where supercritical flow becomes subcritical, losing energy. Cavitation is where high velocity drops pressure below vapour pressure and collapsing bubbles pit the concrete." },
  { deck: "Dams and hydraulics", q: "What governs the choice of stilling basin?", a: "Incoming Froude number and velocity, discharge, tailwater levels, space, cost and debris. USBR basin types are chosen by Froude number. It must work across the full range of flows, not just the design flood." },
  { deck: "Dams and hydraulics", q: "What happens if tailwater rises downstream of a spillway?", a: "It can drown the hydraulic jump, which is usually fine for dissipating energy, but if it submerges the crest it cuts spillway capacity and raises the reservoir level. Too little tailwater lets the jump sweep out of the basin and scour." },
  { deck: "Dams and hydraulics", q: "What if a spillway turns out to be undersized?", a: "Report it to the panel engineer, as it may become a safety measure. Options: widen or lower the crest, add an auxiliary or labyrinth spillway, raise the crest or add a wave wall, add a reinforced-grass overflow, lower the top water level, increase drawdown capacity. Compare on safety, cost, carbon and operation." },
  { deck: "Dams and hydraulics", q: "How do blockage and debris affect a spillway or outlet?", a: "They cut flow area and raise upstream water level, can throw flow onto walls and block screens and culverts. Design for it (screen spacing, clear spans, access), assume partial blockage in assessments, and maintain." },
  { deck: "Dams and hydraulics", q: "What load cases do you check for embankment slope stability?", a: "End of construction (undrained), steady seepage at top water level (drained), rapid drawdown for the upstream slope, and occasionally seismic. Usually limit equilibrium methods (Bishop, Morgenstern-Price) against target factors of safety from guidance." },
  { deck: "Dams and hydraulics", q: "Why is rapid drawdown critical for the upstream slope?", a: "The reservoir water supports the upstream face. Lower it fast and that support goes, but pore pressures in low-permeability fill stay high, so strength drops while the driving forces remain. That's why drawdown rates are limited." },
  { deck: "Dams and hydraulics", q: "Effective stress and pore pressure: why do they matter?", a: "Effective stress = total stress minus pore water pressure (Terzaghi), and effective stress controls strength: shear strength = c' + (sigma - u) tan phi'. Higher pore pressure means lower strength, which is why seepage, rapid drawdown and poor drainage reduce stability." },
  { deck: "Dams and hydraulics", q: "Drained vs undrained analysis?", a: "Undrained: short term, load applied faster than pore pressure can dissipate (clay during construction or rapid drawdown), using undrained strength cu. Drained: long term, pore pressures in equilibrium, using c' and phi'. Check both for clay embankments." },
  { deck: "Dams and hydraulics", q: "Bearing capacity failure vs slope failure?", a: "Bearing failure: the ground under a load shears because the load exceeds its strength. Slope failure: a mass of soil slides along a slip surface under its own weight and loads. Higher groundwater reduces effective stress and so makes both more likely." },
  { deck: "Dams and hydraulics", q: "How do you assess and control seepage through or under an embankment?", a: "Assess with permeability from ground investigation, flow nets or seepage software, the phreatic surface and exit gradients, and field data (piezometers, weirs, wet areas). Control with cut-offs (clay, sheet pile, slurry wall, grout curtain), upstream blankets, filters, toe drains and relief wells." },
  { deck: "Dams and hydraulics", q: "How is a dam breach modelled, and what is it used for?", a: "Estimate breach size and timing (empirical methods), build the breach hydrograph and route it downstream with a 2D model to map depth, velocity and hazard. Used for flood maps, the high-risk designation, the dam category, risk assessment and flood plans." },
  { deck: "Dams and hydraulics", q: "Why are trees and burrowing animals a problem on embankments?", a: "Roots open seepage paths, can pull out in a storm and leave voids as they rot. Burrows shorten the seepage path and can start internal erosion. Grass is the preferred cover. Badger setts are protected, so work on them needs a Natural England licence." },
  { deck: "Dams and hydraulics", q: "What instruments monitor a dam, and what do they measure?", a: "Piezometers: pore water pressure. V-notch weirs or flow meters: seepage flow. Settlement monuments and survey: crest movement. Inclinometers: lateral movement. Water level gauges. Sometimes InSAR, temperature or turbidity sensors. Each should have trigger levels and actions." },
  { deck: "Dams and hydraulics", q: "How do you tell a real change in monitoring data from error or seasonal variation?", a: "Check the instrument and reading (datum, calibration, who read it), repeat it, compare with nearby instruments, reservoir level and rainfall, look at the long-term seasonal pattern, and look on site for physical signs. Trends matter more than single readings." },
  { deck: "Dams and hydraulics", q: "What do you look for when inspecting an embankment dam?", a: "Crest: settlement, cracks, ruts. Upstream face: wave erosion, slips, protection. Downstream: wet areas, seepage, boils, slips, burrows, trees. Toe drains: flow and clarity. Spillway: blockage, cracks, joints, erosion. Outlets: valves working, leaks. Plus instruments and records." },
  { deck: "Dams and hydraulics", q: "Seepage has increased suddenly. What do you check?", a: "Reservoir level and rainfall, instrument checks, whether it's turbid, new wet areas or sinkholes, pore pressures, recent works or burrows. Tell the Supervising Engineer. If it's cloudy or still rising, treat it as urgent and consider drawdown." },
  { deck: "Dams and hydraulics", q: "Defect, potential failure mode and risk: what's the difference?", a: "A defect is something wrong with the asset (a crack). A potential failure mode is a way the dam could fail (internal erosion through that crack). Risk is likelihood times consequence. A defect matters if it feeds a failure mode." },
  { deck: "Dams and hydraulics", q: "What should trigger escalation to the Supervising Engineer or an emergency response?", a: "Turbid or rapidly rising seepage, new slips or cracks, sinkholes, readings past trigger levels, spillway damage, risk of overtopping, outlet failure. If failure looks possible, follow the on-site flood plan and call the undertaker, regulator and emergency services." },
  { deck: "Dams and hydraulics", q: "What limits how fast a reservoir can be drawn down?", a: "Outlet and pump capacity, upstream slope stability, downstream channel capacity and flooding, inflows still arriving, environmental limits (silt, oxygen) and the condition of the valves. Agree a staged rate with monitoring and hold points." },
  { deck: "Dams and hydraulics", q: "What if a reservoir can't be drawn down fast enough in an incident?", a: "Bring in pumps or siphons, open all outlets, divert inflows, protect the crest and low spots, step up monitoring, follow the on-site flood plan, alert the regulator and resilience partners, and prepare downstream warning. Afterwards, recommend permanent drawdown capacity." },
  { deck: "Dams and hydraulics", q: "How do you assess a dam with no design or construction records?", a: "Search archives (owner, regulator, past inspection reports, old maps), inspect and survey, investigate the ground to find materials and core, install instruments, back-analyse from how it has performed, and be conservative where uncertain." },
  { deck: "Dams and hydraulics", q: "Which references come up most for UK reservoirs and flood storage?", a: "ICE Floods and Reservoir Safety (4th ed., 2015) for design floods and freeboard; CIRIA R116 Design of reinforced grass waterways for grassed spillways; USBR Design of Small Dams for spillways and stilling basins; Environment Agency guidance on RARS and on drawdown capacity." },

  { deck: "Flood and water", q: "What do AEP and return period mean?", a: "Annual exceedance probability is the chance a flood of that size is equalled or exceeded in any one year. Return period is roughly 1/AEP: 1% AEP is about a 1 in 100 year flood, 0.5% about 1 in 200." },
  { deck: "Flood and water", q: "What's the chance of a 1% AEP flood happening during a 100-year design life?", a: "P = 1 - (1 - AEP)^n. For 1% over 100 years that's about 63%; over 50 years about 39%. A '1 in 100 year' flood is more likely than not over a long asset life." },
  { deck: "Flood and water", q: "What are the main UK flood estimation methods?", a: "The Flood Estimation Handbook (FEH): the statistical method (QMED plus a growth curve from pooled gauges) for peak flows, and the ReFH2 rainfall-runoff model for hydrographs, using FEH rainfall. Small catchments need extra care." },
  { deck: "Flood and water", q: "How does flood storage work?", a: "It holds water upstream to cut the peak flow downstream. On-line storage sits on the river behind a throttle (orifice, vortex control); off-line storage takes water out of the river over a weir and returns it later. Performance depends on volume, the throttle and the timing of the flood." },
  { deck: "Flood and water", q: "Who are the risk management authorities for flooding in England?", a: "Under the Flood and Water Management Act 2010: the Environment Agency (main rivers, sea, reservoirs and a strategic overview), lead local flood authorities (surface water, groundwater, ordinary watercourses), district councils, internal drainage boards, water and sewerage companies, and highway authorities." },
  { deck: "Flood and water", q: "What permits do you need for works on or near a watercourse?", a: "Main river: a flood risk activity permit from the Environment Agency, usually for work within 8 m of the river (16 m if tidal). Ordinary watercourse: consent from the lead local flood authority or internal drainage board under the Land Drainage Act 1991. Check for other consents such as abstraction or protected species." },
  { deck: "Flood and water", q: "What are the SuDS principles?", a: "The CIRIA SuDS Manual (C753) has four pillars: water quantity, water quality, amenity and biodiversity. Use a management train from source control through conveyance to storage, and limit discharge towards greenfield runoff rates." },
  { deck: "Flood and water", q: "Which hydraulic principles should you be able to explain?", a: "Continuity (Q = VA), energy and Bernoulli, Manning's equation for open channels, critical depth and Froude number, hydraulic jumps, and weir and orifice equations." },
  { deck: "Flood and water", q: "What are AMPs and price reviews?", a: "Asset Management Periods are 5-year water company investment cycles, set by Ofwat price reviews. PR24 set AMP8 (2025 to 2030), the largest so far, with big programmes on storm overflows, resilience and new water resources." },
  { deck: "Flood and water", q: "How are flood schemes in England appraised and funded?", a: "Appraisal follows the HM Treasury Green Book and Environment Agency FCERM guidance: options compared on present value costs and benefits (discounting, optimism bias), with the five-case business model. Grant in aid comes through the partnership funding rules, often topped up by local contributions." },
  { deck: "Flood and water", q: "How do you allow for climate change in a long-life asset?", a: "Use the Environment Agency peak flow or rainfall allowances for the right epoch and catchment, test the upper end, build in room to adapt (space to raise a crest or add storage), and plan monitoring and review points." },
  { deck: "Flood and water", q: "How do you assess and explain residual flood risk?", a: "Test events above the design standard, find the exceedance routes and consequences, and compare with the current situation. Tell people plainly that the scheme reduces but doesn't remove risk, show what happens in bigger floods and what they should do, and avoid false reassurance." },
  { deck: "Flood and water", q: "What is natural flood management?", a: "Slowing and storing water in the catchment (leaky barriers, woodland, wetlands, soil management) to cut peaks and add habitat. It works well alongside hard defences, but its effect is less certain in large floods." },
  { deck: "Flood and water", q: "How do you avoid moving flood risk from one community to another?", a: "Model downstream effects, limit pass-forward flows to what the downstream channel can take, avoid raising levels elsewhere, and agree residual impacts with the people and authorities affected." },
  { deck: "Flood and water", q: "What replaced Sewers for Adoption?", a: "Since April 2020 new sewers in England are adopted under the Water UK Code for Adoption, with the Design and Construction Guidance (DCG) setting the technical standards." },
  { deck: "Flood and water", q: "Earth embankment or concrete structure: how do you compare them?", a: "Earth: lower embodied carbon if fill is won on site, tolerates settlement, can be grassed, but a bigger footprint and vulnerable to overtopping and internal erosion. Concrete: compact and resists overtopping, but higher carbon and needs good foundations. Compare on safety, carbon, cost, land and maintenance." },

  { deck: "Site supervision", q: "How do you make sure construction follows the design intent?", a: "Understand why the design is as it is (talk to the designer), check drawings, specification and inspection and test plans before work starts, inspect at hold points, review test results, attend key activities and raise anything that doesn't match promptly." },
  { deck: "Site supervision", q: "What is an inspection and test plan, and how do hold and witness points work?", a: "An ITP lists each activity, the checks and tests, frequency, acceptance criteria, records and who inspects. At a hold point work must stop until the named person releases it. At a witness point they're told in advance and may attend, but work can go on." },
  { deck: "Site supervision", q: "What do you do if ground conditions differ from the investigation?", a: "Stop affected work if needed, record it, tell the designer and project manager. The designer assesses the effect on the design. Under NEC the contractor may notify a compensation event for physical conditions." },
  { deck: "Site supervision", q: "How is earthworks compaction checked?", a: "Against the specification, either a method specification (layer thickness, plant, passes) or an end-product one (density, air voids, strength). Tests include nuclear density gauge, sand replacement, moisture content and undrained shear strength. Clay must be placed at the specified moisture content." },
  { deck: "Site supervision", q: "What are the risks of building an embankment in bad weather?", a: "Wet: clay too wet to compact, rutting, softening and poor bonding between layers. Dry: desiccation cracking and dust. Frost: frozen material. The result can be weak, permeable layers, so protect the surface and stop when conditions are outside the specification." },
  { deck: "Site supervision", q: "How does cold or hot weather affect concrete?", a: "Cold: don't place on frozen ground, protect it until it gains strength, extend striking times. Hot: faster setting and plastic shrinkage cracking, so control the mix temperature, place quickly and cure well (cover, keep damp)." },
  { deck: "Site supervision", q: "The contractor proposes a design change to save time. What do you do?", a: "Ask for it in writing. Send it to the designer to check against design intent, safety, durability and the specification. Check the contractual and programme effects. Nothing changes on site until it's formally accepted." },
  { deck: "Site supervision", q: "How do you handle a non-conformance?", a: "Record it with evidence. Under NEC the Supervisor notifies a Defect. Agree corrective action and timescale, have the designer approve the fix where it matters, re-inspect, and close it out on the record." },
  { deck: "Site supervision", q: "When should work stop and the designer be consulted?", a: "When safety is at risk, when work doesn't match the design and the effect isn't obvious, when site conditions differ from assumptions, when a hold point can't be released, or when a change to materials or method is proposed." },
  { deck: "Site supervision", q: "What should you record after a site inspection?", a: "Date, time, weather, who attended, areas inspected, observations with photos and locations, measurements, comparison with last time, defects and actions with owners and deadlines, and your name." },
  { deck: "Site supervision", q: "Design verification vs construction quality assurance? And QA vs QC?", a: "Design verification checks the design is right (calculations, independent check). Construction QA checks the work matches the design (ITPs, inspection, tests). QA is the system that prevents errors (procedures, checks, approvals, often to ISO 9001); QC is inspecting and testing outputs to find them." },
  { deck: "Site supervision", q: "The contractor disputes your technical instruction. What do you do?", a: "Under NEC the Supervisor doesn't instruct: you notify Defects, and the Project Manager instructs. Explain the requirement with evidence (specification, drawings, photos), listen to their view, get the designer's input if it's technical, and escalate through the PM." },
  { deck: "Site supervision", q: "The contractor proposes a cheaper material during construction. What do you do?", a: "Check it against design intent, specification, durability, compatibility and safety, ask for test data and certificates, refer it to the designer, and handle any saving formally under the contract." },
  { deck: "Site supervision", q: "What is the MCHW?", a: "The Manual of Contract Documents for Highway Works. Volume 1 is the Specification for Highway Works, arranged in numbered Series, such as 500 drainage, 600 earthworks and 1700 structural concrete. Often used on non-highway civils jobs too." },
  { deck: "Site supervision", q: "How do you assess an existing concrete structure?", a: "Visual inspection and crack mapping, cover meter, half-cell potential, chloride and carbonation tests for corrosion risk, cores for strength, then assess capacity with the measured condition. Repair the cause, not just the symptom." },

  { deck: "Commercial and delivery", q: "NEC vs JCT: what's the difference?", a: "NEC: plain language, mutual trust and co-operation, active management by a Project Manager, early warnings and compensation events with time limits, and an Accepted Programme. Common in civils and the public sector. JCT: more traditional, contract administrator and architect roles, relevant events and variations. Common in building." },
  { deck: "Commercial and delivery", q: "What contracts are in the NEC4 family?", a: "ECC (works), ECSC (short works), PSC and PSSC (professional services), TSC (term service), Supply, Design Build and Operate, and the Alliance Contract, plus the Dispute Resolution Service Contract." },
  { deck: "Commercial and delivery", q: "How does the Construction Act affect payment and disputes?", a: "The Housing Grants, Construction and Regeneration Act 1996 (amended 2009) gives a right to interim payments, requires payment and pay less notices, lets an unpaid party suspend work, bans pay-when-paid, and gives a right to adjudication with a decision in 28 days." },
  { deck: "Commercial and delivery", q: "Early warning vs compensation event?", a: "An early warning is notice of something that could affect price, time or quality, given as soon as you know, so it can be managed jointly. A compensation event is a defined event in the contract that may change the price and completion date if it happens." },
  { deck: "Commercial and delivery", q: "How do you manage scope change and scope creep?", a: "Start with a clear scope, assumptions and exclusions. Track requests against it, flag changes as soon as they appear, and raise an early warning or change request before doing the work. Agree the cost and time effect, and keep the client informed." },
  { deck: "Commercial and delivery", q: "What is a risk register for?", a: "Recording each risk (cause, event, effect), its likelihood and impact, owner, mitigation, cost and time allowance and status. It's reviewed regularly so risks are managed, not just listed." },
  { deck: "Commercial and delivery", q: "Risk allowance vs contingency?", a: "A risk allowance is money or time set aside for specific identified risks, based on their likelihood and impact. Contingency is a general sum for things you can't foresee. Both should be visible and controlled." },
  { deck: "Commercial and delivery", q: "Fee, cost, revenue and profit: what's the difference?", a: "Fee: what you charge the client. Cost: what it costs your firm to deliver (staff time, overheads, expenses, subconsultants). Revenue: fee earned and invoiced. Profit (margin): revenue minus cost." },
  { deck: "Commercial and delivery", q: "What goes into an hourly charge-out rate?", a: "Salary, on-costs (employer's NI, pension, benefits), overheads (office, IT, software, insurance, training, management), an allowance for non-chargeable time, and profit." },
  { deck: "Commercial and delivery", q: "How do you build a realistic programme and fee estimate?", a: "Break the work into tasks, get hours from each discipline, check against similar past jobs, include reviews, checking, project management and meetings, add risk and expenses, and list your assumptions and exclusions." },
  { deck: "Commercial and delivery", q: "A job is heading over budget. What do you do?", a: "Spot it early by comparing time booked with progress. Find the cause and tell the project manager. If the client changed the scope, raise it formally. If it's your own overrun, look for ways to recover (re-sequence, right level of staff) and forecast honestly." },
  { deck: "Commercial and delivery", q: "You realise you've badly underestimated the effort. What do you do?", a: "Tell the project manager straight away with a revised estimate and reasons. Separate genuine changes from your own error, look for ways to recover, and agree with the client how to proceed before the money runs out." },
  { deck: "Commercial and delivery", q: "How do you assess the commercial impact of a design change?", a: "Extra design and checking time, effects on construction cost and programme, knock-on effects on other disciplines, approvals and permits, risk, and maintenance and whole-life cost." },
  { deck: "Commercial and delivery", q: "How do you judge whether a value engineering change is worthwhile?", a: "Does it still meet the function, safety, design life and standards? Look at whole-life cost and carbon, not just the capital saving, and the effect on maintenance, programme and risk." },
  { deck: "Commercial and delivery", q: "Scenario: the safest solution is over the client's budget. What do you do?", a: "Don't compromise safety. Explain the risks of cheaper options, look for safe alternatives that cost less, consider phasing, and help the client look for extra funding. Record the advice." },
  { deck: "Commercial and delivery", q: "Scenario: the client wants to cut a safety-related element, such as a debris screen, to save money. What do you do?", a: "Assess what it protects against (blockage, flooding, access) and the consequence of losing it, explain this clearly in writing, offer cheaper ways to get the same protection, and don't sign off a design you believe is unsafe." },
  { deck: "Commercial and delivery", q: "How do you manage subconsultants' fees?", a: "Clear scope and deliverables, competitive quotes, agree fee and programme up front, track invoices against progress, manage changes formally, and include them in your own forecasts." },
  { deck: "Commercial and delivery", q: "Contractual obligation vs statutory duty?", a: "A contractual obligation is agreed between the parties and owed to them (scope, programme, fee). A statutory duty is imposed by law and can't be contracted out of, such as duties under CDM 2015 or the Reservoirs Act." },
  { deck: "Commercial and delivery", q: "Why check designs independently and record assumptions?", a: "An independent check catches errors the designer can't see and gives assurance, especially for higher-risk work. Recorded assumptions, limitations and exclusions tell the next person what the design relies on, so they don't use it wrongly." },
  { deck: "Commercial and delivery", q: "Client's design vs contractor's design: who is responsible?", a: "Under traditional procurement the client's designer is responsible for the design and the contractor builds to it. Under design and build, or a contractor's design portion, the contractor is responsible for that design, usually to reasonable skill and care unless the contract says more." },
  { deck: "Commercial and delivery", q: "What is Spon's, and how is it used?", a: "Spon's Civil Engineering and Highway Works Price Book: annual unit rates for labour, plant and materials. Used for early cost estimates, then add preliminaries, risk, optimism bias and inflation." },
  { deck: "Commercial and delivery", q: "How do utility diversions work under NRSWA?", a: "Under the New Roads and Street Works Act 1991 and its diversionary works code: C2 is the initial enquiry for records, C3 a budget estimate, C4 a detailed design and firm quote, and then the order. Allow plenty of time, as diversions often drive programmes." },
  { deck: "Commercial and delivery", q: "How does ISO 19650 file naming and status work?", a: "The UK National Annex names files by fields: Project-Originator-Volume-Level-Type-Role-Number. Suitability codes show status in the common data environment, such as S1 for coordination, S2 for information and S3 for review and comment, with A codes once authorised and published." },

  { deck: "Leadership and EDI", q: "Management vs leadership?", a: "Management plans, organises and controls resources to deliver. Leadership sets direction and motivates people. You need both. Be ready to name your own style and give a real example." },
  { deck: "Leadership and EDI", q: "What do you do if someone in your team is underperforming?", a: "Find out why first (workload, unclear brief, something personal). Agree clear expectations and support, check in regularly, and escalate to their line manager if it continues." },
  { deck: "Leadership and EDI", q: "How do you delegate and check work?", a: "Give a clear brief with purpose, inputs, deadline and standard. Check in early, review against the brief, and sense-check the numbers yourself." },
  { deck: "Leadership and EDI", q: "How do you lead without line management responsibility?", a: "Influence through clarity, expertise and relationships: agree goals and deadlines, explain why, make it easy for people to help, credit their input, and escalate to their managers if priorities clash." },
  { deck: "Leadership and EDI", q: "How do you manage competing priorities?", a: "List the deadlines and what happens if each slips, agree priorities with the project managers and client, protect safety-critical and contractual dates first, flag clashes early and ask for resource." },
  { deck: "Leadership and EDI", q: "A colleague has produced work you think is unsafe. What do you do?", a: "Don't let it be issued. Talk to them first, explain the concern and evidence, and check you've understood. If it isn't resolved, raise it with the project manager or technical lead, and record it." },
  { deck: "Leadership and EDI", q: "How would you supervise a graduate on a calculation you've never done yourself?", a: "Learn the method first, agree the approach and references together, set check points, compare with a simple hand calculation, and get a specialist to review. Be honest about the limits of your own knowledge." },
  { deck: "Leadership and EDI", q: "Why does equality, diversity and inclusion matter in civil engineering?", a: "Diverse teams make better decisions, a fair workplace attracts and keeps people, and infrastructure has to serve everyone. There's also a legal duty under the Equality Act 2010, and the ICE Code expects you to support a fair and inclusive workplace." },
  { deck: "Leadership and EDI", q: "Equality vs equity, and diversity vs inclusion?", a: "Equality is treating people fairly and giving equal opportunity. Equity is giving different support so people can reach the same opportunities. Diversity is the mix of people; inclusion is whether they're heard and can take part." },
  { deck: "Leadership and EDI", q: "What are the nine protected characteristics under the Equality Act 2010?", a: "Age, disability, gender reassignment, marriage and civil partnership, pregnancy and maternity, race, religion or belief, sex, and sexual orientation." },
  { deck: "Leadership and EDI", q: "What is unconscious bias, and how can it affect engineering?", a: "Automatic assumptions we aren't aware of. In recruitment: favouring people like ourselves. In design: assuming a 'typical' user. In meetings: giving more weight to confident voices. Counter it with structured processes and checking assumptions." },
  { deck: "Leadership and EDI", q: "How do you make sure quieter people contribute?", a: "Share agendas early, ask people by name, use round-robins or written input, follow up one to one, give credit, and schedule around time zones and working patterns." },
  { deck: "Leadership and EDI", q: "Scenario: a colleague makes a discriminatory remark. What do you do?", a: "Don't ignore it. Address it proportionately and safely, support the person affected without assuming what they want, and follow your organisation's reporting procedure." },
  { deck: "Leadership and EDI", q: "Scenario: you see bullying or harassment on site. What do you do?", a: "Intervene if it's safe, support the person, report it through the employer's or contractor's procedure, record what you saw, and make sure it's followed up." },
  { deck: "Leadership and EDI", q: "Scenario: a junior colleague says they're being left out of important meetings. What do you do?", a: "Listen and take it seriously, find out the facts, agree with them what they'd like to happen, raise it with the project manager or their line manager, and check back that it's changed." },
  { deck: "Leadership and EDI", q: "How do you make reports and public consultations accessible?", a: "Plain-language summaries, visuals and maps, translations and accessible formats, online and in-person options at different times, accessible venues, and reaching out to groups who don't usually take part." },
  { deck: "Leadership and EDI", q: "How do you lead a team with different communication styles or cultures?", a: "Agree how the team will communicate, write decisions down, check understanding, respect working patterns and time zones, and adapt your own style." },
  { deck: "Leadership and EDI", q: "How can inclusive design shape a flood scheme or public space?", a: "Safe, step-free access, gentle slopes and handrails, clear signs, flood warnings that reach everyone (including disabled, elderly and non-English-speaking residents), and designing for maintenance teams as well as the public." },
  { deck: "Leadership and EDI", q: "How can projects avoid hitting disadvantaged communities hardest?", a: "Look at who benefits and who bears the impacts (disruption, land take, residual risk), engage early with hard-to-reach groups, use an equality impact assessment, and share benefits fairly." },

  { deck: "H&S", q: "Hazard vs risk?", a: "A hazard is something with the potential to cause harm. Risk is the likelihood of that harm happening combined with how severe it would be. ERIC-PD (eliminate, reduce, isolate, control, PPE, discipline) is a common way to remember the control order." },
  { deck: "H&S", q: "What does HSE do?", a: "It's Great Britain's regulator for workplace health and safety. It inspects, investigates and enforces through improvement and prohibition notices and prosecution, and recovers its costs through Fee for Intervention when it finds a material breach." },
  { deck: "H&S", q: "Which regulations sit under the Health and Safety at Work Act?", a: "Among others: Management of Health and Safety at Work Regulations 1999, CDM 2015, Work at Height Regulations 2005, Confined Spaces Regulations 1997, COSHH 2002, LOLER and PUWER 1998, RIDDOR 2013 and the Electricity at Work Regulations 1989." },
  { deck: "H&S", q: "How would you plan a confined space entry?", a: "Under the Confined Spaces Regulations 1997: avoid entry if you can. If not, use a safe system of work with competent people, a permit, gas monitoring, ventilation, communication, and an emergency rescue plan with equipment ready before anyone goes in." },
  { deck: "H&S", q: "When must an incident be reported under RIDDOR?", a: "Deaths and specified injuries (such as fractures and amputations), injuries keeping someone off normal work for over 7 days, certain occupational diseases, and dangerous occurrences such as structural collapses. The responsible person reports to HSE within set time limits." },
  { deck: "H&S", q: "What do you do after a near miss or reportable incident?", a: "Make the area safe and help anyone hurt, preserve evidence, report through the site system and to HSE if RIDDOR applies, investigate the root cause, share the lessons and update controls." },
  { deck: "H&S", q: "How do you find root causes rather than blame someone?", a: "Ask why repeatedly, look at the system (planning, method, training, supervision, equipment, design, time pressure), interview without blame, and fix the conditions that made the error likely." },
  { deck: "H&S", q: "What does COSHH require?", a: "The Control of Substances Hazardous to Health Regulations 2002: assess the risk, prevent or control exposure using the hierarchy of control, respect workplace exposure limits (EH40), maintain and monitor controls, provide health surveillance where needed, and train people. On civils sites think silica dust, cement, fuels and contaminated ground." },
  { deck: "H&S", q: "How do you manage work near water?", a: "Avoid it where you can. Otherwise: risk assessment, lifejackets, throw lines and rescue equipment, no lone working, barriers, and watching weather and flows, including upstream releases." },
  { deck: "H&S", q: "What precautions are needed near spillways, culverts or outlet pipes?", a: "Isolate and lock off valves and gates, prove the isolation, confirm no planned releases, watch weather and water levels, and never enter a pipe or culvert without a confined space permit. Sudden water releases are a stored-energy hazard." },
  { deck: "H&S", q: "What are the main risks near slopes, edges and heavy plant?", a: "Falls from edges and structures, slope or excavation collapse, plant overturning on slopes or soft ground, and people struck by moving plant. Edge protection, exclusion zones, banksmen and planned routes control them." },
  { deck: "H&S", q: "Site conditions have changed since the risk assessment. What do you do?", a: "Stop and reassess. Update the risk assessment and method statement, brief everyone, and restart only when the controls fit the new conditions." },
  { deck: "H&S", q: "What do you do if you see an unsafe act on site?", a: "If danger is immediate, stop it safely. Speak to the person and their supervisor, explain why, make sure it's put right, and report it through the contractor's system." },
  { deck: "H&S", q: "Scenario: the project manager tells you to carry on despite a safety concern. What do you do?", a: "Don't carry on. Explain the risk and what would make it safe, put it in writing, and escalate to the safety lead or senior management. Programme never overrides safety." },
  { deck: "H&S", q: "How do you balance programme pressure against safety?", a: "Safety isn't traded. Look for safe ways to recover time (re-sequence, more resource, a different method), plan ahead so pressure doesn't build, and raise programme risks early." },
  { deck: "H&S", q: "Scenario: the contractor says your safety measures cost too much. What do you do?", a: "Explain the risk and the legal duty, look at other controls that give the same protection, record the discussion, and escalate if they still won't act." },
  { deck: "H&S", q: "What should a designer's risk register contain?", a: "Each significant hazard, who's at risk, what the design did to eliminate or reduce it, the residual risk, and how that's communicated to the contractor and maintainer (on drawings, not buried in a report)." },
  { deck: "H&S", q: "What are the pre-construction information and the health and safety file?", a: "Pre-construction information is what the client provides so designers and contractors can plan safely (existing services, ground conditions, hazards). The health and safety file is kept after completion with the information needed to maintain, alter or demolish the asset safely." },
  { deck: "H&S", q: "Can one organisation be both Principal Designer and Principal Contractor?", a: "Yes, under CDM 2015, if it is competent for both roles and the client appoints it to both in writing. It's common on design and build and framework jobs. Both sets of duties still apply." },

  { deck: "Sustainability", q: "What are the whole-life carbon stages?", a: "From BS EN 15978 and PAS 2080: A1 to A5 product and construction (materials, transport, building it), B use and maintenance (including operational energy and water), C end of life, and D benefits beyond the life, such as reuse." },
  { deck: "Sustainability", q: "How do you balance carbon reduction with safety and durability?", a: "Never cut a safety margin to save carbon. Among safe options, prefer the lower-carbon one (site-won fill, recycled materials, less concrete). Durability saves carbon over the asset's life. Record the trade-off." },
  { deck: "Sustainability", q: "How can you reduce imported materials and excavation?", a: "Balance cut and fill on site, stabilise marginal fill instead of replacing it, use recycled aggregates, and optimise the geometry to reduce earthworks." },
  { deck: "Sustainability", q: "How do you manage environmental risks during construction?", a: "A construction environmental management plan: silt and pollution control near water, spill kits, refuelling away from watercourses, ecology watching briefs and exclusion zones, and waste and noise controls." },
  { deck: "Sustainability", q: "How do you define sustainable development?", a: "Development that meets the needs of the present without compromising future generations' ability to meet theirs (Brundtland, 1987). In practice: balancing environmental, social and economic outcomes over the whole life of an asset." },
  { deck: "Sustainability", q: "A lower-carbon option is less certain to perform long term. What do you do?", a: "Quantify the uncertainty, test sensitivity, consider trials or monitoring, design in a fallback, and weigh the risk against the carbon saving. If it's safety-critical, uncertainty counts against it." },
  { deck: "Sustainability", q: "What is the civil engineer's role in climate change?", a: "Adapt infrastructure to more extreme floods, heat and drought, cut carbon in what we build, design assets that can adapt, and advise clients honestly about residual risk." },
  { deck: "Sustainability", q: "Which wildlife laws come up most on civils sites?", a: "The Wildlife and Countryside Act 1981 (nesting birds, listed species, invasive plants such as Japanese knotweed), the Conservation of Habitats and Species Regulations 2017 (European protected species such as great crested newts and bats), and the Protection of Badgers Act 1992. Work affecting them may need a licence." },

  { deck: "Ethics and judgement", q: "Scenario: your manager asks you to conceal a design error. What do you do?", a: "Refuse. Explain why (public safety, honesty, the ICE Code), report it through the proper route (technical director, whistleblowing policy), and make sure the error is put right." },
  { deck: "Ethics and judgement", q: "You find a significant mistake in a calculation or drawing your team has issued. What do you do?", a: "Tell your manager and the people who received it straight away, find out whether it's been built or relied on, correct and reissue it with the change marked, and record what happened and why. Public safety comes before reputation." },
  { deck: "Ethics and judgement", q: "Your firm designed the scheme and also supervises its construction. Is that a conflict?", a: "It can be, because there's no independent eye on the design. Manage it by holding your own firm's errors to the same standard as the contractor's, raising them openly, and using independent checks where the risk is high." },
  { deck: "Ethics and judgement", q: "Scenario: your employer's commercial interests conflict with public safety. What do you do?", a: "Public safety comes first. Raise it internally, document it, escalate to senior technical leadership, and if it still isn't resolved use whistleblowing routes or tell the regulator." },
  { deck: "Ethics and judgement", q: "Scenario: a client wants you to play down a safety concern. What do you do?", a: "Refuse. Explain the risk and consequences, put the concern in writing, escalate within your organisation and, if needed, to the regulator or statutory engineer." },
  { deck: "Ethics and judgement", q: "Scenario: you suspect inspection records have been falsified. What do you do?", a: "Don't confront anyone aggressively or touch the evidence. Record what you saw, report it to your manager or through the whistleblowing policy, and to the client or regulator if safety is involved." },
  { deck: "Ethics and judgement", q: "Scenario: a colleague takes credit for your work. What do you do?", a: "Raise it calmly with them first, then with your manager if needed, with evidence. Focus on getting the record right rather than blame." },
  { deck: "Ethics and judgement", q: "You disagree with a senior or statutory engineer's recommendation. What do you do?", a: "Discuss it with them, with your evidence, and understand their reasoning. Ask for a second opinion if it matters. Accept their decision where it's theirs to make, but record your view, and escalate if you believe safety is at risk." },
  { deck: "Ethics and judgement", q: "What are the risks of relying on AI for engineering calculations?", a: "Plausible but wrong answers, hidden assumptions, outdated standards, no audit trail, confidentiality breaches and deskilling. Under the 2026 ICE Code accountability can't be handed to AI, so check outputs independently and disclose your use." },
  { deck: "Ethics and judgement", q: "Have you used AI in preparing your submission? How should you answer?", a: "Honestly. The 2026 Code expects you to disclose your use of AI and to remain accountable for the work. Say what you used it for, how you checked it, and that the experience and judgement are your own." },
  { deck: "Ethics and judgement", q: "How should safety be balanced against the cost of maintaining ageing assets?", a: "Risk must be brought to a tolerable level and then reduced as low as reasonably practicable (ALARP). Above that, use risk-based prioritisation, whole-life cost and interim measures. Be open about what's being accepted." },
  { deck: "Ethics and judgement", q: "What does ethical leadership look like under commercial pressure?", a: "Being honest about cost and programme, not cutting safety or quality, raising changes openly, protecting your team from unreasonable pressure, and setting the example yourself." },
  { deck: "Ethics and judgement", q: "How can engineers build public trust?", a: "Be open about risk, cost and uncertainty, engage early and listen, explain decisions in plain language, admit and fix mistakes, and deliver what was promised." },
  { deck: "Ethics and judgement", q: "How do you recognise the limits of your competence?", a: "Ask: have I done similar work, do I understand the standards and failure modes, can I check the result independently, and is it within my authority? If not, get specialist input. Safety-critical work outside your field needs a specialist check." },
  { deck: "Ethics and judgement", q: "What does chartership mean for your professional accountability?", a: "You're personally accountable for your judgement and the work you sign, to the public, client and profession, and bound by the ICE Code. You're expected to work independently on complex problems, lead others and know when to seek help." },
  { deck: "Ethics and judgement", q: "What would you do if you couldn't answer a technical question at your review?", a: "Be honest. Say what you do know, what information you'd need, and how you'd find a safe, evidence-based answer. Don't bluff." },
  { deck: "Ethics and judgement", q: "How do you decide whether more investigation is needed before you advise?", a: "Ask whether the uncertainty could change the decision or the safety outcome. If it could and the consequence is high, investigate or recommend interim measures. If not, proceed and state your assumptions." },
  { deck: "Ethics and judgement", q: "What is a sensitivity analysis, and when would you use one?", a: "Changing inputs to see how much the result moves. Use it when inputs are uncertain, the answer is close to a threshold, or a decision depends on it." },
  { deck: "Ethics and judgement", q: "How do you check a model or calculation result is reasonable?", a: "Compare with a hand calculation or simple method, similar past projects and physical intuition. Check inputs against source data, units, boundary conditions and mass balance. Get an independent check for anything safety-critical." },
  { deck: "Ethics and judgement", q: "When would you use a simple calculation instead of a numerical model?", a: "For screening, early options and sense-checks, when the data doesn't justify a complex model, or when the simple method is conservative and still passes." },
  { deck: "Ethics and judgement", q: "Two accepted methods give very different answers. What do you do?", a: "Find out why: different assumptions, inputs, applicability or a mistake. Decide which suits the site better, use the more conservative one if safety depends on it, and record the reasoning." },
  { deck: "Ethics and judgement", q: "How do you explain a correct but very uncertain result to a client?", a: "Give the best estimate and the range, explain in plain language what drives the uncertainty and what it means for their decision, and what would reduce it." },
  { deck: "Ethics and judgement", q: "How would you approach a problem type you've never assessed before?", a: "Read the guidance and case histories, talk to experienced colleagues, start with simple methods, get a specialist review, and be clear about the limits of your work." },
  { deck: "Ethics and judgement", q: "How do you answer 'What's the biggest mistake you've made?'", a: "Pick a real one with a clear lesson. Say what happened, what you did about it, what you changed afterwards, and how you've applied that since. Don't choose one that suggests poor judgement on safety." },
  { deck: "Ethics and judgement", q: "How do you answer 'Which area of your competence needs most development?'", a: "Be honest and specific: name the area (often commercial or people leadership), the evidence you have so far, and the concrete steps you're taking to grow it." },
  { deck: "Ethics and judgement", q: "How do you plan your CPD?", a: "A development action plan linked to the ICE attributes and your gaps, agreed with your line manager or mentor, mixing courses, institution events, reading and experience on the job, and reviewed each year." },
  { deck: "Ethics and judgement", q: "Have you read a recent NCE article? How should you prepare?", a: "Pick one relevant to your field, read it in full, and be ready to say what it was about, why it matters, and what you'd take from it for your own work." }
];

/* ICE Professional Review key dates, 2026-27. One table covers CPR, IPR, CPRP, TPR, TRR (Stage 2) and CEPR.
   Source: https://www.ice.org.uk/join-ice/key-membership-dates (checked 15 Nov 2026).
   Add the 2027-28 dates here when ICE publishes them. */
window.ICE_DATES_SOURCE = "https://www.ice.org.uk/join-ice/key-membership-dates";
window.ICE_CYCLES = [
  { id: "2026-10", label: "October 2026 reviews", sponsors: "2026-07-10", application: "2026-07-17", review: "2026-10-05", reviewWindow: ["2026-10-01", "2026-11-14"],
    window: "Online in October 2026, possibly into the first two weeks of November", inPerson: "London 5-7 Oct, Belfast 14 Oct, Manchester 26-27 Oct, Hong Kong 10-14 Oct" },
  { id: "2027-02", label: "February 2027 reviews", sponsors: "2026-10-23", application: "2026-10-30", review: "2027-02-03", reviewWindow: ["2027-02-01", "2027-03-14"],
    window: "Online in February 2027, possibly into the first two weeks of March", inPerson: "London 3-5 Feb, Birmingham 16-17 Feb, Glasgow 23-24 Feb" },
  { id: "2027-06", label: "June 2027 reviews", sponsors: "2027-03-12", application: "2027-03-19", review: "2027-06-07", reviewWindow: ["2027-06-01", "2027-07-14"],
    window: "Online in June 2027, possibly into the first two weeks of July", inPerson: "London 7-9 Jun, York 16-17 Jun, Cardiff 29 Jun" }
];

/* Other ICE deadlines on the same key dates page (checked 15 Nov 2026). Only published dates: nothing projected. */
window.ICE_OTHER_GROUPS = [
  { g: "trr", label: "Technical Report Route, Stage 1", note: "ICE doesn't list separate Stage 2 dates. Check this result date if you're aiming at a particular Stage 2 deadline.", desc: "Stage 1 of the Technical Report Route. Stage 2 is a Professional Review, so its dates are under Professional Review." },
  { g: "ela", label: "Experiential Learning Assessment", note: "Closing dates cover new applications and resubmissions.", desc: "ICE's assessment of learning gained through experience. Check ICE's guidance to see whether it applies to you." },
  { g: "aa", label: "Academic Assessment", note: "ICE hasn't published dates after 9 November 2026.", desc: "For candidates who don't have the qualifications to apply for a grade automatically." },
  { g: "ca", label: "Career Appraisal", note: "Assessed monthly. ICE hasn't published dates after 11 November 2026.", desc: "Assessed once a month. ICE accepts a Career Appraisal decision letter as one form of evidence that you have completed your IPD." },
  { g: "fle", label: "ICE Further Learning Exam", note: "Technical submission upload by 11 September 2026; results published 3 February 2027.", desc: "An online exam with a technical submission. Check ICE's guidance to see whether it applies to you." }
];
window.ICE_OTHER_DATES = [
  { g: "trr", application: "2026-11-27", result: "2027-01-29" },
  { g: "trr", application: "2027-03-26", result: "2027-07-16" },
  { g: "trr", application: "2027-06-25", result: "2027-08-27" },
  { g: "trr", application: "2027-11-26", result: "2028-01-28" },
  { g: "trr", application: "2028-03-24", result: "2028-07-14" },
  { g: "trr", application: "2028-06-23", result: "2028-08-25" },
  { g: "ela", application: "2026-08-10", result: "2026-10-02" },
  { g: "ela", application: "2026-10-12", result: "2026-12-04" },
  { g: "ela", application: "2026-12-07", result: "2027-02-05" },
  { g: "aa", application: "2026-08-17", result: "2026-10-07" },
  { g: "aa", application: "2026-09-28", result: "2026-11-18" },
  { g: "aa", application: "2026-11-09", result: "2027-01-20" },
  { g: "ca", application: "2026-08-05", result: "2026-09-25" },
  { g: "ca", application: "2026-09-09", result: "2026-11-04" },
  { g: "ca", application: "2026-10-07", result: "2026-11-27" },
  { g: "ca", application: "2026-11-11", result: "2027-01-15" },
  { g: "fle", application: "2026-08-17", result: "2027-02-03", exam: "13 October 2026 (online, UK time)" }
];

/* IEng and CEng requirements per attribute, quoted from ICE's professional review guidance
   (Version 3 Revision 14, 11 June 2026, Appendix A: IPR pp. 17-18, CPR pp. 19-21).
   CEng repeats the IEng requirements and adds the "And ..." clauses quoted here. */
window.ICE_GUIDANCE_URL = "https://www.ice.org.uk/media/aj2gmts3/11-jun-26-professional-review-guidance.pdf";
window.UKSPEC = {
  url: "https://www.engc.org.uk/our-role-as-regulator/setting-standards/uk-spec-professional-engineering-competence-and-commitment/",
  ieng: "Maintains and manages applications of current and developing technology.",
  ceng: "Develops solutions to engineering problems using new or existing technologies, through innovation, creativity and change."
};

/* Illustrative example answers. Fictional scenarios written for this site: not real candidates' words. */
window.ATTR_EXAMPLES = [
  {
    ice: "Understanding and practical application of engineering", page: "p. 17 and p. 19",
    ieng: ["Solve engineering problems using a sound theoretical approach, based on evidence, and contribute to continuous improvement", "Exercise sound independent engineering judgement"],
    ceng: ["And engage in the creation and/or introduction of new, advancing or improved techniques and technology", "And take an active role in the identification and definition of requirements, challenges, risks, and opportunities", "And undertake the design, development and implementation of engineering solutions"],
    q: "Tell us about a technical decision you made where the standard approach didn't fit.",
    answers: [
      { g: "weak", a: "We had to design a retaining wall and the ground was quite poor, so the team decided to use sheet piles. The design was checked and it all worked out fine on site.", why: "'We' and 'the team' hide the candidate. No options, no reasoning, no evidence. A reviewer learns nothing about their judgement." },
      { g: "ok", a: "I designed a retaining wall where the ground investigation showed soft clay. I chose sheet piles because they were quicker to install than a gravity wall, and I checked the design to Eurocode 7.", why: "Uses 'I' and names a standard, but there's one option and one reason. It doesn't show judgement or what made the problem hard." },
      { g: "good", a: "I compared a gravity wall, an embedded sheet pile wall and a king post wall for a 3 m retained height in soft clay. I ran the sheet pile design in our software, checked it by hand with a simple limit equilibrium calculation, and chose sheet piles because they avoided a deep excavation next to a live road. I recorded the decision in the design log and the checker accepted it.", why: "IEng level: a sound, evidence-based solution with options, a check and independent judgement. It applies existing methods well but doesn't change them." },
      { g: "excellent", a: "The ground investigation showed softer clay than our standard design assumed, so I defined the real constraints first: a live road, a 2-week possession and a tight carbon budget. I compared three wall types and recommended a reused sheet pile section, which met the loads with a 20% lower carbon figure. Because our in-house spreadsheet couldn't model staged excavation, I built and verified a staged check against hand calculations and a software run. The team now uses it on similar walls, and I briefed two graduates on its limits.", why: "CEng level: identifies and defines the requirements and risks, designs and implements the solution, and introduces an improved technique that others now use, with numbers." }
    ]
  },
  {
    ice: "Management and leadership", page: "p. 17 and p. 19",
    ieng: ["Manage teams or technical specialisms", "Assist others to meet changing technical and managerial needs", "Manage quality processes and contribute to quality improvements"],
    ceng: ["And manage (organise, direct and control), programme or schedule, tasks and resources", "And lead or influence teams / technical specialisms, understanding the limits of their skills and knowledge", "And develop others to meet changing technical and managerial needs", "And demonstrate continuous quality improvement and promote best practice"],
    q: "Tell us about a time a piece of work was slipping behind programme. What did you do?",
    answers: [
      { g: "weak", a: "The drawings were running late, so we all worked extra hours and got them out on time in the end.", why: "No diagnosis, no decision, no leadership. Working harder isn't management, and 'we' hides the candidate's role." },
      { g: "ok", a: "I noticed the drawing package was a week behind, so I told the project manager and we agreed to push the issue date back.", why: "Spots the problem and escalates it, which is the minimum. It doesn't show managing people, resources or quality." },
      { g: "good", a: "I led a team of three on a drainage design package. When the survey arrived late, I re-sequenced the work so the layouts that didn't depend on the survey went first, moved a technician onto drawing checks, and held a short daily catch-up for a fortnight. We issued two days late instead of two weeks, with no comments from the checker.", why: "IEng level: manages a team and its quality process, with a clear result. The step to CEng is wider direction of resources and developing people." },
      { g: "excellent", a: "As package lead for four engineers across two offices, I saw from our earned-value tracking that we'd slip three weeks. I re-planned the critical path, agreed a reduced first issue with the client so construction could start on time, and asked a senior colleague to cover the structural checks I wasn't competent to sign off. I paired a graduate with a technician so she learned the drawing standards and could run checks herself. Afterwards I added a survey-dependency check to our project start-up template, which the team now uses.", why: "CEng level: organises, directs and controls programme and resources, knows the limits of their competence, develops someone, and leaves a lasting quality improvement." }
    ]
  },
  {
    ice: "Commercial ability", page: "p. 17 and p. 19",
    ieng: ["Manage, prepare and control costs/budgets of engineering tasks or projects", "Use sound knowledge of statutory and commercial frameworks within their own area of responsibility"],
    ceng: ["And manage, prepare and control costs/budgets of a significant engineering task or project", "And demonstrate sound judgement on statutory, contractual and commercial issues in relation to own area of responsibility"],
    q: "Give an example of controlling a budget.",
    answers: [
      { g: "weak", a: "The project was delivered within budget. I always keep an eye on costs.", why: "A claim with no figure and no action. Reviewers hear this often and will probe until there's nothing left." },
      { g: "ok", a: "I prepared the fee estimate for a small design job, about £25k, and tracked hours each month. We finished close to budget.", why: "Shows preparing and tracking, but not what was controlled or decided when it went off track." },
      { g: "good", a: "I prepared and ran the £60k fee for a culvert replacement design. Each fortnight I compared hours booked against progress. When the ecology surveys doubled, I showed the project manager the forecast overrun and the reason, and we raised it as a change with the client, which they approved. We finished at £61k against a revised £68k budget.", why: "IEng level: prepares and controls a task budget with real numbers, and uses the commercial framework correctly within their own area." },
      { g: "excellent", a: "I controlled the £400k design budget on a flood scheme under an NEC4 professional services contract (Option E). By month three, my forecast showed a £35k overrun from extra modelling the client had asked for informally. I judged that it was a change in scope, gave an early warning, and prepared the compensation event quotation, which was accepted. I also cut £15k by re-using an existing hydraulic model instead of building a new one. We finished at £395k, and I now set clear scope assumptions at the start of each job.", why: "CEng level: controls a significant budget, and shows judgement on a contractual issue under the contract actually used." }
    ]
  },
  {
    ice: "Health, safety and welfare", page: "p. 17 and p. 20",
    ieng: ["Demonstrate a sound knowledge of legislation, hazards and safe systems of work", "Manage risks", "Manage health, safety and welfare within their own area of responsibility", "Contribute to improvements in health, safety and welfare"],
    ceng: ["And demonstrate leadership by promoting good practice and improvements in health, safety and welfare"],
    q: "How have you managed health and safety risks through your design?",
    answers: [
      { g: "weak", a: "Safety is our number one priority. I always follow the company's procedures and wear the right PPE on site.", why: "A slogan. PPE is the bottom of the hierarchy of control, and nothing here is about design or the candidate's own duties." },
      { g: "ok", a: "As a designer under CDM 2015 I completed the designer's risk assessment and added safety notes to the drawings.", why: "Correct duty holder and process, but no example of a risk being reduced, or how." },
      { g: "good", a: "As designer under CDM 2015 I changed an outfall from an in-situ headwall in a 3 m excavation next to a footpath to a precast unit lifted in from the bank. That removed work in a deep excavation and cut time on site from two weeks to two days. I recorded the residual risks, the lift and the edge protection on the drawings and in the pre-construction information.", why: "IEng level: knows the law and their duties, and manages a real risk in their own area by designing it out." },
      { g: "excellent", a: "On a culvert design I replaced confined space entry for future maintenance with a removable grille and an access chamber at ground level, so the asset can be cleared from the surface. I then wrote a one-page note on designing out confined space entry for our team's design checklist, presented it at our safety stand-down, and two other schemes have used it since. I also challenged a contractor's temporary works proposal that left an unprotected edge, and it was changed before work started.", why: "CEng level: everything above, plus leadership that changed what others do. That's the 'promoting good practice and improvements' clause." }
    ]
  },
  {
    ice: "Sustainable development", page: "p. 18 and p. 20",
    ieng: ["Understand the principles of sustainable development and apply them in work", "Manage engineering activities that contribute to sustainable development and the United Nations Sustainable Development Goals (UNSDGs)"],
    ceng: ["And take a professional and responsible role in improvements that support sustainable development and reduce resource demand, set in the context of a whole project life cycle"],
    q: "How did you reduce carbon or resource use on your project?",
    answers: [
      { g: "weak", a: "Sustainability was really important on the project and we tried to be as green as possible.", why: "No action, no number, no decision. It could be from any report." },
      { g: "ok", a: "I specified concrete with GGBS to reduce embodied carbon, which is better for the environment.", why: "A real action, but no figure, no comparison and no sense of the whole life." },
      { g: "good", a: "I balanced the cut and fill on an attenuation basin so no material left site. That avoided around 900 lorry movements, and I calculated about 120 tCO2e saved using our carbon tool. It also supports SDG 13 on climate action.", why: "IEng level: applies the principles in their own work and quantifies the result." },
      { g: "excellent", a: "Following PAS 2080's 'build nothing, build less' steps, I first asked whether a new culvert was needed at all. A condition survey showed the existing one could be relined, which cut embodied carbon by about 70% and avoided a road closure. Over the 60-year life I set out a maintenance regime in the health and safety file so the liner is inspected and not replaced early. I presented the comparison to the client's board, and they now ask for a reline option on every culvert scheme.", why: "CEng level: drives an improvement that reduces resource demand over the whole life cycle, and influences the client's future decisions." }
    ]
  },
  {
    ice: "Interpersonal skills and communication", page: "p. 18 and p. 20",
    ieng: ["Communicate well with others at all levels including effective use of English orally and in writing", "Discuss ideas and plans competently and with confidence", "Demonstrate effective personal and social skills", "Demonstrate awareness of diversity and inclusion"],
    ceng: ["And communicate new concepts and ideas to technical and non-technical stakeholders", "And proactively manage diversity and inclusion"],
    q: "Tell us about explaining something technical to a non-technical audience.",
    answers: [
      { g: "weak", a: "I'm a good communicator and I get on well with everyone, including clients and the public.", why: "Self-description with no example. Reviewers need evidence, not adjectives." },
      { g: "ok", a: "I went to a public drop-in event and answered residents' questions about the flood scheme.", why: "Attendance, not communication. What did they ask, and what changed because of the answer?" },
      { g: "good", a: "At a public drop-in, residents worried that a flood storage area would leave standing water next to a playground. I used a simple cross-section and a photo of a similar site to show it would only fill about once in 30 years and drain within a day. Several residents who'd objected said they were reassured, and there were no objections on that point at planning.", why: "IEng level: communicates clearly at all levels and with confidence, with a result." },
      { g: "excellent", a: "The client's councillors needed to choose between two schemes, and the appraisal was full of BCRs and return periods. I rewrote it as 'how many homes are protected, how often, for how much', with one map per option. That was a new way of presenting it for them. They chose the higher-cost option because they could see it protected a care home. I also set up our team's meetings with colleagues in another country to suit their working hours and shared notes afterwards, so they weren't left out of decisions.", why: "CEng level: communicates a new concept to non-technical decision-makers so it changes their decision, and proactively manages inclusion in the team." }
    ]
  },
  {
    ice: "Professional commitment", page: "p. 18 and pp. 20-21",
    ieng: ["Understand and comply with the ICE Code of Conduct", "Understand the ethical issues that may arise in their role and exercise responsibilities in an ethical manner", "Plan, carry out and record Continuing Professional Development", "Identify the limits of their personal knowledge and skills", "Engage with ICE activities"],
    ceng: ["Carry out their responsibilities in an ethical manner", "And exercise sound holistic independent judgement and accept responsibility"],
    q: "Tell us about a time you made a mistake, or found one. What did you do?",
    answers: [
      { g: "weak", a: "I can't think of a real mistake. I'm very careful and always check my work.", why: "Reviewers don't believe it, and it suggests the candidate can't reflect. Everyone has an example." },
      { g: "ok", a: "I once sent a drawing with the wrong revision. My checker spotted it and I reissued it the same day.", why: "Honest, but trivial, and the checker found it. It doesn't show judgement or responsibility." },
      { g: "good", a: "I found that a level on one of my drawings was 300 mm out after it had gone to the contractor. I told my manager straight away, issued a corrected drawing with a note explaining the change, and checked the other drawings in the set. I now check levels against the survey before every issue.", why: "IEng level: acts ethically, knows their limits, puts it right and learns from it." },
      { g: "excellent", a: "While reviewing a colleague's design I found the overflow had been sized for the wrong return period, which could have flooded properties. It was our firm's error and the client hadn't noticed. I raised it with the project director the same day, recommended we tell the client openly, and led the redesign. It cost us two weeks of unpaid time, but the Code puts the public interest first. I also proposed adding the design standard to our check sheet, which the team adopted.", why: "CEng level: holistic, independent judgement, putting public safety ahead of commercial interest, and accepting responsibility for the outcome." }
    ]
  }
];

/* Submission checklist. Items marked ICE come from ICE's Professional Review guidance
   (v3 r14, 11 June 2026, pp. 10-12 and Appendix B pp. 22-23); the others are this site's suggestions. */
window.SUBMIT_CHECKLIST = [
  { id: "guidance", at: "ipd", t: "Read the current Professional Review guidance", src: "ICE" },
  { id: "ipd", at: "ipd", t: "IPD formally complete, or equivalent evidence ready (for example a Training Agreement completion form, mentor-supported training completion form, or Career Appraisal decision letter)", src: "ICE" },
  { id: "ipd8", at: "ipd", t: "Allowed 8 weeks for ICE staff to complete your IPD before the application deadline", src: "ICE" },
  { id: "mdo", at: "ipd", t: "IPD signed off online, including your regional MDO's sign-off of your IPD and CPD" },
  { id: "schedule", at: "ipd", t: "Made a schedule of your and your sponsors' actions and deadlines", src: "ICE" },
  { id: "sponsors", at: "report", t: "Talked to your two proposed sponsors about your plans", src: "ICE" },
  { id: "cv", at: "ipd", t: "CV drafted", src: "ICE" },
  { id: "dap", at: "ipd", t: "Development action plan with objectives for the next 12 months", src: "ICE" },
  { id: "cpd", at: "ipd", t: "CPD record up to date, covering ICE's three mandatory CPD themes" },
  { id: "report", at: "report", t: "Report finished, within the word limit, and signed off by your supervisor or mentor" },
  { id: "statements", at: "signoff", t: "Both sponsors have uploaded their statements to ICE's sponsor portal by the sponsor deadline", src: "ICE" },
  { id: "form", at: "apply", t: "Application form completed" },
  { id: "upload", at: "apply", t: "Application uploaded through ICE's Professional Reviews upload portal before the closing date" }
];

/* ICE forms and documents. Each link checked on 15 Nov 2026. */
window.ICE_FORMS = [
  { t: "Professional Review application form", d: "For the Chartered and Incorporated Professional Review.", url: "https://www.ice.org.uk/download-centre/professional-review-application-form" },
  { t: "Sponsor's statement of support", d: "Completed by each of your sponsors.", url: "https://www.ice.org.uk/download-centre/sponsors-statement-of-support" },
  { t: "Professional Review guidance (PDF)", d: "Version 3 Revision 14, 11 June 2026.", url: "https://www.ice.org.uk/media/aj2gmts3/11-jun-26-professional-review-guidance.pdf" },
  { t: "Chartered Professional Review progressive guidance", d: "For MICE and IEng MICE members moving to CEng.", url: "https://www.ice.org.uk/download-centre/chartered-professional-review-progressive-guidance" },
  { t: "CPD guidance", d: "ICE's guide to continuing professional development.", url: "https://www.ice.org.uk/download-centre/continuing-professional-development-cpd-guidance" },
  { t: "Career Appraisal guidance", d: "If you're using a Career Appraisal as IPD evidence.", url: "https://www.ice.org.uk/download-centre/career-appraisal-guidance" },
  { t: "Incorporated and Chartered review resources", d: "ICE's preparation videos and resources.", url: "https://www.ice.org.uk/your-career/professional-qualification-support/professional-review-preparation/incorporated-and-chartered-professional-review-resources" },
  { t: "Key membership dates", d: "Application and sponsor deadlines.", url: "https://www.ice.org.uk/join-ice/key-membership-dates" },
  { t: "Professional Reviews upload portal", d: "Where you upload your submission.", url: "https://reviews.ice.org.uk/upload/UploadApplication" }
];
