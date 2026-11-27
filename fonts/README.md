# Fonts

Self-hosted so the site makes no calls to Google Fonts. Both families are under the SIL Open Font License 1.1;
the licence text sits beside each family as `OFL.txt` and must stay with the font files.

| Family | Files | Used for |
|---|---|---|
| Palanquin (Pria Ravichandran) | `palanquin/Palanquin-{Regular,Medium,SemiBold,Bold}.woff2` | Body text, headings, buttons |
| PT Sans Caption (ParaType) | `pt-sans-caption/PTSansCaption-{Regular,Bold}.woff2` | Small labels, chips, table and title-block text (`--font-label`) |

Palanquin is subset to Latin (the original also covers Devanagari) and converted to WOFF2, which takes each file
from about 500 KB to under 30 KB. It has no Reserved Font Name, so the subset keeps the name. PT Sans Caption is
converted to WOFF2 with its glyph data unchanged, because "PT Sans" is a Reserved Font Name and a subset would have
to be renamed. The fallback stack is Arial, then Helvetica Neue, then the system sans-serif.
