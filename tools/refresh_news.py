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
    ("Environment Agency", "https://www.gov.uk/government/organisations/environment-agency.atom"),
    ("Department for Transport", "https://www.gov.uk/government/organisations/department-for-transport.atom"),
    ("NISTA", "https://www.gov.uk/government/organisations/national-infrastructure-and-service-transformation-authority.atom"),
]
# A headline from a general source is kept only if it mentions one of these.
KEYWORDS = ["infrastructure", "civil", "engineer", "bridge", "tunnel", "rail", "road", "highway", "flood",
            "water", "reservoir", "dam", "nuclear", "grid", "port", "construction", "contract", "hs2",
            "net zero", "carbon", "sewer", "coastal", "geotech", "ice "]
SPECIALIST = {"NCE", "ICE", "Construction Enquirer", "Infrastructure Intelligence"}
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
    ("Flood and coastal", r"floods?|flooding|flood defences?|flood storage|flood risk|fcerm|coastal|coastline|erosion|sea walls?|sea defences?|storm surge|storms?|thames barrier|barriers?|embankments?|levees?|managed realignment|natural flood management|nfm"),
    ("Water and wastewater", r"water|sewers?|sewage|wastewater|drainage|canal|ofwat|utilities|pr24|amp8|water companies|thames water|leakage|drought|desalination"),
    ("Rail", r"rail|railways?|hs2|metro|stations?|trains?|tram|npr|crossrail"),
    ("Roads", r"roads?|highways?|motorways?|junction|m\d+|roadworks|ltc"),
    ("Energy", r"energy|grid|electricity|nuclear|smrs?|sizewell|hartlepool|heysham|hydrogen|ccus|carbon capture|interconnector|neso|power|ehv|renewables?|wind"),
    ("Aviation and ports", r"airports?|aviation|spaceport|ports?|maritime|harbour"),
    ("Tunnels and structures", r"tunnels?|tunnelling|bridges?|structural|structures?"),
    ("Materials and carbon", r"cement|concrete|materials?|net zero|carbon|decarbonis\w*|minerals"),
    ("Policy and funding", r"government|funding|budget|ministers?|ministerial|policy|regulation|regulator|white paper|treasury|barnett|gmpp|premiership|senedd|taskforce|committee|mps|cuts?|investment|pipeline"),
    ("Industry and careers", r"contractors?|framework|awards?|winners|careers?|pay gap|president|ice|productivity|ai|apprentices?|graduates?|jobs|supplier|procurement|appointed|tender"),
]
_SECTOR_RES = [(name, re.compile(r"\b(?:" + pat + r")\b", re.I)) for name, pat in SECTORS]


def tag(title):
    tags = [name for name, rx in _SECTOR_RES if rx.search(title or "")]
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
    return [{"t": " ".join(t.split()), "url": u.strip(), "src": name, "date": d.isoformat() if d else None, "tags": tag(t)}
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
    out = sorted(have.values(), key=lambda i: i["date"], reverse=True)
    for i in out:
        i["tags"] = tag(i["t"])
    ARCHIVE.write_text("/* All headlines collected so far, for the monthly briefings. Generated by tools/refresh_news.py. */\n"
                       "window.NEWS_ARCHIVE = " + json.dumps({"items": out}, ensure_ascii=False, indent=1) + ";\n", encoding="utf-8")
    print(f"Archive now holds {len(out)} headlines")


def retag_only():
    """Re-tag the headlines already in js/news-feed.js without fetching anything."""
    text = OUT.read_text(encoding="utf-8")
    header = text[:text.index("window.NEWS_FEED")]
    payload = json.loads(text[text.index("{"):text.rindex("}") + 1])
    for i in payload["items"]:
        i["tags"] = tag(i["t"])
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
            if name not in SPECIALIST and not any(k in i["t"].lower() for k in KEYWORDS):
                continue
            found[i["url"]] = i
            kept += 1
        print(f"  {name}: {kept} headlines")
    for i in found.values():  # re-tag everything, so changes to SECTORS apply to older headlines too
        i["tags"] = tag(i["t"])
    items = [i for i in found.values() if i.get("date") and dt.date.fromisoformat(i["date"]) >= cutoff]
    items.sort(key=lambda i: i["date"], reverse=True)
    payload = {"generated": dt.date.today().isoformat(), "items": items[:300]}
    write(payload, "/* Latest headlines. Generated by tools/refresh_news.py. Do not edit by hand. */\n")
    print(f"Wrote {len(items[:300])} headlines to {OUT}")
    update_archive(list(found.values()))


if __name__ == "__main__":
    main()
