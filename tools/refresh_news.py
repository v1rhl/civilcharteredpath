#!/usr/bin/env python3
"""Refresh the Latest headlines list on the News page.

Reads the RSS/Atom feeds listed in FEEDS, keeps civil-engineering headlines from the
last 60 days, and writes js/news-feed.js. Only headlines, dates and links are kept:
the page links out to the original articles.

Run it from the site folder:   python3 tools/refresh_news.py
Re-tag the current list without fetching:   python3 tools/refresh_news.py --retag
Needs only the Python standard library. Respects each site's robots.txt and skips any
feed it isn't allowed to read.
"""
import datetime as dt
import email.utils
import json
import pathlib
import re
import sys
import urllib.request
import urllib.robotparser
import xml.etree.ElementTree as ET

# Feed URLs change. If one stops working, the script says so and carries on.
FEEDS = [
    ("NCE", "https://www.newcivilengineer.com/feed/"),
    ("ICE", "https://www.ice.org.uk/rss/news"),
    ("Construction Enquirer", "https://www.constructionenquirer.com/feed/"),
    ("Infrastructure Intelligence", "https://www.infrastructure-intelligence.com/rss.xml"),
    ("The Engineer", "https://www.theengineer.co.uk/rss"),
    # GOV.UK: news and press releases only (the news-and-communications search feed), never the whole-organisation
    # feeds, which are mostly statutory notices, statistics releases and guidance updates.
    ("Environment Agency", "https://www.gov.uk/search/news-and-communications.atom?organisations%5B%5D=environment-agency"),
    ("Department for Transport", "https://www.gov.uk/search/news-and-communications.atom?organisations%5B%5D=department-for-transport"),
    ("NISTA", "https://www.gov.uk/search/news-and-communications.atom?organisations%5B%5D=national-infrastructure-and-service-transformation-authority"),
    # Reservoirs and flood defence. GOV.UK search feeds only filter on single-word keywords.
    ("Environment Agency", "https://www.gov.uk/search/news-and-communications.atom?keywords=flood&organisations%5B%5D=environment-agency"),
    ("GOV.UK", "https://www.gov.uk/search/news-and-communications.atom?keywords=reservoir"),
    ("GOV.UK", "https://www.gov.uk/search/news-and-communications.atom?keywords=dam"),
    ("Environment Agency blog", "https://environmentagency.blog.gov.uk/feed/"),
    ("Defra", "https://www.gov.uk/search/news-and-communications.atom?organisations%5B%5D=department-for-environment-food-rural-affairs"),
    ("The Construction Index", "https://www.theconstructionindex.co.uk/news/rss"),
    # Health and safety: HSE press releases tagged construction, and the Building Safety Regulator.
    ("HSE", "https://press.hse.gov.uk/tag/construction/feed/"),
    ("Building Safety Regulator", "https://www.gov.uk/search/news-and-communications.atom?organisations%5B%5D=building-safety-regulator"),
    # Checked Nov 2026 and left out: Water Industry Journal (robots.txt disallows /feed/); SEPA, Natural Resources Wales,
    # British Dam Society, CIWEM, Utility Week, Water Magazine and WWT had no readable feed. Add them if that changes.
]
# What the News page is for: keeping up with the industry well enough to discuss it at a review.
# Two filters run on every headline, old and new:
#  1. Not news: GOV.UK publication types and statutory notices (permit applications, abstraction
#     notices, statistics releases, guidance, tenders and contract awards for one site). Dropped from every source.
#  2. Off topic: sources that aren't civil engineering specialists must mention an infrastructure term,
#     matched as a whole word (so "port" no longer matches "export" or "passport").
NOT_NEWS = re.compile(
    r"^(notice|guidance|research|transparency data|accredited official statistics|official statistics|national statistics|"
    r"statistics|foi release|form|decision|corporate report|correspondence|impact assessment|aaib report|maib report|"
    r"statutory guidance|regulation|closed consultation|consultation outcome|independent report|promotional material|"
    r"tender|contract award|contract notice|prior information notice)\s*:"
    r"|permit application|application made to|environmental permit|abstract water|abstraction licen[cs]e|"
    r"planning application|consultation notice|transport and works act order|compulsory purchase order|traffic regulation order|"
    r"\bEPR/|\bNPS/", re.I)
OFF_TOPIC = re.compile(
    r"\b(?:export\w*|import\w*|food|drink|horses?|animals?|livestock|birds|ungulates|fisheries|fishing|pets?|"
    r"radioactivity in food|brexit|tariffs?)\b", re.I)
INFRA = re.compile(
    r"\b(?:infrastructure|civil engineer\w*|engineers?|engineering|bridges?|viaducts?|tunnels?|tunnelling|railways?|rail|"
    r"roads?|highways?|motorways?|flood\w*|reservoirs?|dams?|spillways?|nuclear|grid|ports|harbours?|hs2|sewers?|sewage|"
    r"wastewater|drainage|coastal|coast|geotechnical|drought|embankments?|erosion|pumping stations?|sea defences?|"
    r"flood defences?|water (?:supply|supplies|resources|compan(?:y|ies)|industry|infrastructure|resilience|investment|bills?)|"
    r"thames water|ofwat|building safety|cdm|concrete|cement|timber|steel|asphalt|bim|digital twins?|"
    r"major projects?|megaprojects?|framework|substations?|pylons?|transmission|interconnectors?|wind farms?|"
    r"airports?|runways?|metro|trams?|trains?|stations?|canals?|dredging|treatment works|jett(?:y|ies)|quays?|docks?|"
    r"defences?|rock armour|waste plant|energy from waste|incinerators?|pollution|(?:thames|southern|anglian|wessex|united|yorkshire|"
    r"northumbrian|welsh|severn trent|south west|affinity|portsmouth|bristol|scottish) water|transporter bridge)\b", re.I)
# Sources that only publish civil engineering, construction-safety or infrastructure news: no topic check needed.
SPECIALIST = {"NCE", "ICE", "Infrastructure Intelligence", "HSE", "Building Safety Regulator"}


# GOV.UK titles a publication with its type ("Guidance: ...", "Accredited official statistics: ..."); press releases
# and news stories carry none. The GOV.UK feeds above are news-only already; this catches anything that slips through.
GOVUK_PUB = re.compile(r"^(?:policy paper|open consultation|call for evidence|collection|detailed guide|map|data|"
                       r"html|promotional material|case study|statistical data set|official statistics announcement)\s*:", re.I)
GOVUK = {"Environment Agency", "Department for Transport", "NISTA", "GOV.UK", "Defra", "Building Safety Regulator"}


def relevant(title, src):
    t = title or ""
    if src in GOVUK and GOVUK_PUB.search(t):
        return False
    if NOT_NEWS.search(t) or OFF_TOPIC.search(t):
        return False
    return src in SPECIALIST or bool(INFRA.search(t))


AGENT = "CharteredPathNews/1.0 (headline list)"
DAYS = 60
OUT = pathlib.Path(__file__).resolve().parent.parent / "js" / "news-feed.js"
# Every headline ever collected, kept so the monthly briefings on the News page survive the 60-day window.
ARCHIVE = pathlib.Path(__file__).resolve().parent.parent / "js" / "news-archive.js"

ATOM = "{http://www.w3.org/2005/Atom}"

# Sector tags, matched on whole words in the headline. A headline can have several.
# Anything that matches none is tagged "Other", so nothing is hidden by the filter.
SECTORS = [
    ("Reservoirs and dams", r"reservoirs?|dams?|spillways?|impounding|reservoirs act|toddbrook|havant thicket|sesro|abingdon reservoir|fens reservoir|lincolnshire reservoir"),
    ("Flood and coastal", r"floods?|flooding|flood defences?|flood storage|flood risk|fcerm|coastal|coastline|erosion|sea walls?|sea defences?|defences?|rock defence|rock armour|groynes?|storm surge|storms?|thames barrier|tidal barriers?|flood barriers?|embankments?|levees?|managed realignment|natural flood management|nfm"),
    ("Water and wastewater", r"water|sewers?|sewage|wastewater|drainage|canal|ofwat|utilities|pr24|amp8|water companies|thames water|leakage|drought|desalination"),
    ("Rail", r"rail|railways?|hs2|metro|stations?|trains?|tram|npr|crossrail"),
    ("Roads", r"roads?|highways?|motorways?|junction|m\d+|roadworks|ltc"),
    ("Energy", r"energy|grid|electricity|nuclear|smrs?|sizewell|hartlepool|heysham|hydrogen|ccus|carbon capture|interconnector|neso|power|ehv|renewables?|wind|pylons?|substations?"),
    ("Aviation and ports", r"airports?|aviation|spaceport|ports?|maritime|harbours?|jett(?:y|ies)|quays?"),
    ("Tunnels and structures", r"tunnels?|tunnelling|bridges?|structural|structures?"),
    # Topics that cut across sectors. Health and safety maps to Attribute 4; digital and materials to Attributes 1 and 5.
    ("Materials and carbon", r"cement|concrete|materials?|net zero|carbon|low-carbon|decarbonis\w*|minerals|timber|mass timber|clt|glulam|steel|rebar|asphalt|aggregates?|recycled|recycling|reuse|re-use|circular|geopolymers?|graphene|hempcrete|composites?|frp|3d-printed|biochar|embodied"),
    ("Digital and technology", r"digital|digital twins?|bim|ai|artificial intelligence|machine learning|data(?!\s*cent\w*)|drones?|uavs?|robots?|robotic\w*|automation|automated|autonomous|sensors?|lidar|software|3d|modular|offsite|off-site|innovation|innovative|technology|technologies|satellite|smart|cyber|computational|exoskeletons?|scanning|virtual reality|vr|ar"),
    ("Health and safety", r"safety|unsafe|hse|fatal|fatality|fatalities|killed|death|deaths|died|dies|injured|injury|injuries|accident|accidents|collapsed?|collapses|crushed|cdm|asbestos|silica|wellbeing|well-being|mental health|suicide|grenfell|near miss|hazards?|hazardous|scaffold\w*|falls? from height|trench|electrocuted|crash|crashes|derail\w*|building safety regulator|bsr"),
    ("Policy and funding", r"government|funding|budget|ministers?|ministerial|policy|regulation|regulator|white paper|treasury|barnett|gmpp|premiership|senedd|taskforce|committee|mps|cuts?|investment|pipeline"),
    ("Industry and careers", r"contractors?|framework|awards?|winners|careers?|pay gap|president|ice|productivity|apprentices?|graduates?|jobs|supplier|procurement|appointed|tender"),
]
_SECTOR_RES = [(name, re.compile(r"\b(?:" + pat + r")\b", re.I)) for name, pat in SECTORS]


# Everything from these sources is a health and safety story, whatever the headline says.
SAFETY_SOURCES = {"HSE", "Building Safety Regulator"}


def tag(title, src=None):
    tags = [name for name, rx in _SECTOR_RES if rx.search(title or "")]
    if src in SAFETY_SOURCES and "Health and safety" not in tags:
        tags.append("Health and safety")
    return tags or ["Other"]



def allowed(url):
    root = "/".join(url.split("/")[:3])
    rp = urllib.robotparser.RobotFileParser(root + "/robots.txt")
    try:
        rp.read()
    except Exception:
        return True  # no readable robots.txt
    return rp.can_fetch(AGENT, url)


def parse_date(text):
    if not text:
        return None
    text = text.strip()
    try:
        return email.utils.parsedate_to_datetime(text).date()
    except Exception:
        pass
    try:
        return dt.date.fromisoformat(text[:10])
    except Exception:
        return None


def read_feed(name, url):
    if not allowed(url):
        print(f"  skipped {name}: robots.txt doesn't allow it")
        return []
    req = urllib.request.Request(url, headers={"User-Agent": AGENT})
    with urllib.request.urlopen(req, timeout=20) as r:
        root = ET.fromstring(r.read())
    items = []
    for it in root.iter("item"):  # RSS
        items.append((it.findtext("title"), it.findtext("link"), parse_date(it.findtext("pubDate"))))
    for it in root.iter(ATOM + "entry"):  # Atom
        link = it.find(ATOM + "link")
        items.append((it.findtext(ATOM + "title"), link.get("href") if link is not None else None,
                      parse_date(it.findtext(ATOM + "updated") or it.findtext(ATOM + "published"))))
    return [{"t": " ".join(t.split()), "url": u.strip(), "src": name, "date": d.isoformat() if d else None, "tags": tag(t, name)}
            for t, u, d in items if t and u]


def write(payload, header):
    OUT.write_text(header + "window.NEWS_FEED = " + json.dumps(payload, ensure_ascii=False, indent=1) + ";\n", encoding="utf-8")


def update_archive(items):
    """Merge headlines into js/news-archive.js (deduplicated by link, re-tagged)."""
    have = {}
    if ARCHIVE.exists():
        text = ARCHIVE.read_text(encoding="utf-8")
        try:
            have = {i["url"]: i for i in json.loads(text[text.index("{"):text.rindex("}") + 1])["items"]}
        except Exception:
            have = {}
    for i in items:
        if i.get("date"):
            have[i["url"]] = i
    gone = [i for i in have.values() if not relevant(i["t"], i.get("src"))]
    out = sorted((i for i in have.values() if relevant(i["t"], i.get("src"))), key=lambda i: i["date"], reverse=True)
    if gone:
        print(f"Removed {len(gone)} archived headlines that aren't news or aren't on topic")
    for i in out:
        i["tags"] = tag(i["t"], i.get("src"))
    ARCHIVE.write_text("/* All headlines collected so far, for the monthly briefings. Generated by tools/refresh_news.py. */\n"
                       "window.NEWS_ARCHIVE = " + json.dumps({"items": out}, ensure_ascii=False, indent=1) + ";\n", encoding="utf-8")
    print(f"Archive now holds {len(out)} headlines")


def retag_only():
    """Re-tag the headlines already in js/news-feed.js without fetching anything."""
    text = OUT.read_text(encoding="utf-8")
    header = text[:text.index("window.NEWS_FEED")]
    payload = json.loads(text[text.index("{"):text.rindex("}") + 1])
    payload["items"] = [i for i in payload["items"] if relevant(i["t"], i.get("src"))]
    for i in payload["items"]:
        i["tags"] = tag(i["t"], i.get("src"))
    write(payload, header)
    print(f"Re-tagged {len(payload['items'])} headlines in {OUT}")
    update_archive(payload["items"])


def main():
    if "--retag" in sys.argv:
        return retag_only()
    cutoff = dt.date.today() - dt.timedelta(days=DAYS)
    old = {}
    if OUT.exists():  # keep earlier headlines, so a feed that fails today doesn't empty the page
        text = OUT.read_text(encoding="utf-8")
        try:
            old = {i["url"]: i for i in json.loads(text[text.index("{"):text.rindex("}") + 1])["items"]}
        except Exception:
            old = {}
    found = dict(old)
    for name, url in FEEDS:
        try:
            items = read_feed(name, url)
        except Exception as e:
            print(f"  couldn't read {name}: {e}")
            continue
        kept = 0
        for i in items:
            if not relevant(i["t"], name):
                continue
            found[i["url"]] = i
            kept += 1
        print(f"  {name}: {kept} headlines")
    found = {u: i for u, i in found.items() if relevant(i["t"], i.get("src"))}  # filters apply to older headlines too
    for i in found.values():  # re-tag everything, so changes to SECTORS apply to older headlines too
        i["tags"] = tag(i["t"], i.get("src"))
    items = [i for i in found.values() if i.get("date") and dt.date.fromisoformat(i["date"]) >= cutoff]
    items.sort(key=lambda i: i["date"], reverse=True)
    payload = {"generated": dt.date.today().isoformat(), "items": items[:300]}
    write(payload, "/* Latest headlines. Generated by tools/refresh_news.py. Do not edit by hand. */\n")
    print(f"Wrote {len(items[:300])} headlines to {OUT}")
    update_archive(list(found.values()))


if __name__ == "__main__":
    main()
