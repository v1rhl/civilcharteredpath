/* Site content. Edit this file to update the site; no build step needed.
   Facts here were checked against the sources linked next to them in Nov 2026.
   Items marked headlineOnly come from a news headline alone: read the article before quoting figures. */

window.SITE = {
  name: "Chartered Path",
  updated: "15 November 2026"
};

/* The seven ICE attributes, with what reviewers look for and the CEng-level bar. */
window.ATTRIBUTES = [
  {
    n: 1, title: "Knowledge and understanding of engineering",
    short: "Engineering",
    look: ["Apply sound theory and judgement to real problems", "Evaluate options and choose a solution for good reasons", "Understand risk, uncertainty and the limits of your methods", "Think about the whole life of the asset"],
    ceng: "Develop solutions to complex or unfamiliar problems, and show you have introduced a new or improved technique, method or tool.",
    prompts: ["Which decision on your project needed judgement because the guidance didn't settle it?", "What did you assume, and how did you check it?", "What would you change if you designed it again?"]
  },
  {
    n: 2, title: "Leadership and management",
    short: "Leadership",
    look: ["Plan, organise and monitor work", "Lead and develop people", "Manage quality, and improve how things are done", "Adapt your style to the person and situation"],
    ceng: "Lead teams and tasks with real responsibility for outcomes, and show continuous improvement you led, not just took part in.",
    prompts: ["When did a plan go wrong, and what did you change?", "How have you helped someone else develop?", "What's the difference between quality assurance and quality control on your job?"]
  },
  {
    n: 3, title: "Commercial ability",
    short: "Commercial",
    look: ["Understand how your work is procured and paid for", "Know the contract you work under", "Prepare and track budgets and programmes", "Manage change, early warnings and claims"],
    ceng: "Control costs and budgets, not just prepare them, and use commercial judgement on contractual issues.",
    prompts: ["What contract were you working under, and what did it require of you?", "Tell us about a time your work was going over budget.", "Who carried the risk on your project, and why?"]
  },
  {
    n: 4, title: "Health, safety and welfare",
    short: "H&S",
    look: ["Know the law: HSWA 1974, CDM 2015 and the regulations you work under", "Understand your duties and everyone else's", "Apply the hierarchy of control", "Promote good practice in others"],
    ceng: "Lead on safety: show that others changed what they did because of you, and that you designed risk out rather than managing it on site.",
    prompts: ["What are your duties under CDM 2015, and who were the other duty holders?", "Give an example of eliminating a hazard through design.", "When have you stopped or challenged unsafe work?"]
  },
  {
    n: 5, title: "Sustainable development",
    short: "Sustainability",
    look: ["Carbon: PAS 2080 and the carbon reduction hierarchy", "Biodiversity net gain and nature-positive design", "Social value and the wider community", "Climate adaptation and resilience"],
    ceng: "Show decisions where sustainability changed the outcome, backed with numbers you can explain.",
    prompts: ["How did you reduce carbon on your project, and by how much?", "Did biodiversity net gain apply? What was done?", "How is climate change affecting your designs?"]
  },
  {
    n: 6, title: "Interpersonal skills and communication",
    short: "Communication",
    look: ["Write and speak clearly for different audiences", "Explain technical ideas to non-technical people", "Handle disagreement and negotiate", "Work inclusively with diverse teams"],
    ceng: "Influence decisions: show that how you communicated changed what someone else decided.",
    prompts: ["Tell us about explaining something technical to a member of the public or a client.", "Describe a disagreement with a contractor or client and how it ended.", "What have you done to make your workplace more inclusive?"]
  },
  {
    n: 7, title: "Professional commitment",
    short: "Professional",
    look: ["Know and live the ICE Code of Professional Conduct", "Plan and record CPD", "Take responsibility for your judgement and your limits", "Contribute to the profession and the public"],
    ceng: "Exercise independent judgement and accept responsibility, including for mistakes, with the public interest first.",
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
  { t: "Bring two sides of A4 for the communication task", d: "That is the limit on notes. You can't copy and paste from them, and the internet and AI tools aren't allowed. Practise writing a short technical piece by hand-drafting from your notes in the time allowed.", src: "ICE professional review guidance, June 2026", url: "https://www.ice.org.uk/media/aj2gmts3/11-jun-26-professional-review-guidance.pdf" },
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
  before: [
    { id: "map", t: "Map your evidence against the attributes", d: "List your best example for each attribute and mark the gaps. Agree with your supervisor or mentor how you'll close any gap.", w: 4, c: "var(--s-blue)" },
    { id: "draft", t: "Write the first draft of your report", d: "Write in the first person, one example per decision, and keep to ICE's word limit.", w: 8, c: "var(--accent)" },
    { id: "sce", t: "First draft with your supervisor or mentor", d: "Send it to your Supervising Civil Engineer, Delegated Engineer or mentor. Book the time in their diary before you send it.", w: 3, c: "var(--flag)" },
    { id: "revise", t: "Revise to a second draft", d: "Act on the comments. Check every number and that the report matches your CPD record and CV.", w: 3, c: "var(--accent)" },
    { id: "signoff", t: "Final read, sign-off and application", d: "Final check by your supervisor or mentor, proofread, then complete the application and supporting documents.", w: 2, c: "var(--s-violet)" }
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
  { deck: "Review format", q: "What can you take into the communication task?", a: "Up to two sides of A4 of notes. No copying and pasting from them, and no internet or AI tools." },
  { deck: "Review format", q: "What four kinds of question do reviewers ask?", a: "Factual, analytical (compare or explain), hypothetical (what would you do if) and probing (why did you decide that)." },
  { deck: "Review format", q: "Name the seven ICE attributes.", a: "1 Knowledge and understanding of engineering\n2 Leadership and management\n3 Commercial ability\n4 Health, safety and welfare\n5 Sustainable development\n6 Interpersonal skills and communication\n7 Professional commitment" },
  { deck: "Review format", q: "What extra does attribute 1 ask of a Chartered Engineer?", a: "Developing solutions to complex problems, and evidence that you introduced a new or improved technique, method or tool." },
  { deck: "Review format", q: "What extra does attribute 3 ask of a Chartered Engineer?", a: "Controlling costs and budgets, not just preparing them, and commercial judgement on contractual issues." },
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
  { deck: "H&S", q: "What is the hierarchy of control?", a: "Eliminate, reduce, isolate, control, PPE, discipline (ERIC-PD)." },
  { deck: "H&S", q: "Which sections of the Health and Safety at Work etc. Act 1974 set out the main duties?", a: "s2 employers to employees; s3 employers to others, such as the public; s7 employees. All 'so far as is reasonably practicable'." },
  { deck: "Sustainability", q: "What is the PAS 2080 carbon reduction hierarchy?", a: "Build nothing, build less, build clever, build efficiently." },
  { deck: "Sustainability", q: "What is the biodiversity net gain requirement in England?", a: "At least 10% for most planning applications, mandatory since February 2024 under the Environment Act 2021." },
  { deck: "Current affairs", q: "How much has the government committed to flood defences, and to when?", a: "At least £10.5bn to 2036, with £1.4bn in 2026/27. It cites about £8 of damage avoided per £1 spent." },
  { deck: "Current affairs", q: "Why is HS2 renegotiating its main works contracts?", a: "To move off cost-plus terms, which left risk with the client and gave weak incentives, onto terms that reward cost control. A new baseline is due in spring 2027." },
  { deck: "Current affairs", q: "What did the 2026 Autumn Budget do to carbon capture and hydrogen?", a: "Cut £700m: Acorn's £200m scrapped and £500m off hydrogen grants. £9.4bn for HyNet and the East Coast Cluster protected." }
];

/* ICE Professional Review key dates (Chartered and Incorporated), 2026-27.
   Source: https://www.ice.org.uk/join-ice/key-membership-dates (checked 15 Nov 2026).
   Add the 2027-28 dates here when ICE publishes them. */
window.ICE_DATES_SOURCE = "https://www.ice.org.uk/join-ice/key-membership-dates";
window.ICE_CYCLES = [
  { id: "2026-10", label: "October 2026 reviews", sponsors: "2026-07-10", application: "2026-07-17", review: "2026-10-05",
    window: "Online in October 2026, possibly into the first two weeks of November", inPerson: "London 5-7 Oct, Belfast 14 Oct, Manchester 26-27 Oct, Hong Kong 10-14 Oct" },
  { id: "2027-02", label: "February 2027 reviews", sponsors: "2026-10-23", application: "2026-10-30", review: "2027-02-03",
    window: "Online in February 2027, possibly into the first two weeks of March", inPerson: "London 3-5 Feb, Birmingham 16-17 Feb, Glasgow 23-24 Feb" },
  { id: "2027-06", label: "June 2027 reviews", sponsors: "2027-03-12", application: "2027-03-19", review: "2027-06-07",
    window: "Online in June 2027, possibly into the first two weeks of July", inPerson: "London 7-9 Jun, York 16-17 Jun, Cardiff 29 Jun" }
];
