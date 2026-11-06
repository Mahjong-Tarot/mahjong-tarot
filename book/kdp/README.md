# The Mahjong Mirror: Amazon KDP upload kit

Build everything from the manuscript in one go:

```bash
python3 book/build.py && python3 book/kdp/build_kdp.py
```

Outputs land in `book/kdp/out/` (git-ignored; rebuild any time):

| File | Upload where |
|---|---|
| `interior-6x9-bw.pdf` | Paperback > Manuscript (if you pick **Black & white interior**) |
| `interior-6x9-color.pdf` | Paperback > Manuscript (if you pick **Standard color interior**) |
| `cover-6x9.pdf` | Paperback > Cover > "Upload a cover you already have" |
| `the-mahjong-mirror.epub` | Kindle eBook > Manuscript |
| `kindle-cover.jpg` | Kindle eBook > Cover (1600 x 2560) |

Requires Chrome, poppler (`pdftotext`, `pdfinfo`), `dwebp`, `ffmpeg`. Fonts are static OFL instances of the brand fonts (Fraunces, Inter) in `fonts/`, plus two tiny Noto subsets for the six Chinese characters and the ✦ ornament.

## Paperback settings

- **Trim**: 6 x 9 in. **Bleed**: No bleed. **Cover finish**: Matte.
- **Paper**: White. **Interior**: Black & white is recommended (cheapest print cost; red accents print as slate grey). Pick Standard color only if you want the red on the page, and use the color PDF. Both PDFs paginate identically (194 pages), so the same cover works for either.
- **Page count**: 194. The cover spine (0.437 in) is sized for this. If the text changes, rebuild: the spine resizes itself.
- **ISBN**: take KDP's free ISBN, paste it into `ISBN_PRINT` in `build_kdp.py`, rebuild, upload. It then appears on the copyright page. KDP prints the barcode itself; the back cover keeps the lower-right corner clear for it.

## Kindle settings

- Upload the EPUB (validated with EPUBCheck 5.2.1: 0 errors, 0 warnings).
- Diagrams are rasterized to PNG; card art and section art are embedded images.
- Kindle uses its own TOC (Prologue through About Bill Hajdu, with sections and chapters nested).

## Listing metadata (both formats)

**Title**: The Mahjong Mirror
**Subtitle**: Your Path to Wiser Decisions
**Author**: Bill Hajdu

**Description**

> You do not need to know how to play Mahjong. You need an open mind, and the willingness to look at your life from new angles.
>
> For more than thirty-five years, Bill Hajdu has used a thirteen-card Mahjong spread to help people make the decisions that shape their lives. In *The Mahjong Mirror* he lays out the framework behind those readings: four angles of reflection that turn a confusing choice into a clear one.
>
> - **The Central Theme**: the one force shaping everything else
> - **Know Thyself**: who you are, what is happening now, and what you really want
> - **The Opposition**: what stands in your way, and how to move past it
> - **The Future**: the year ahead, and the long view
>
> Methodical, practical, and grounded in observable patterns, this is a book for anyone standing at a crossroads who wants a wiser way to decide.

**Keywords** (7 slots): mahjong tarot · Chinese astrology · mahjong cards fortune telling · decision making framework · divination for beginners · Chinese divination · self-reflection guide

**Categories**: Body, Mind & Spirit > Divination > Fortune Telling · Body, Mind & Spirit > Astrology > Eastern · Self-Help > Personal Growth > General

## Before you publish

- **Back-cover copy and the description above were drafted from the book.** Bill should approve them.
- **AI disclosure**: answer **No** for texts, images and translations. The book used AI for editing only, and KDP only asks about AI-generated content, not AI-assisted editing.
- **Order a proof copy** before going live; check the red/grey contrast on paper if you choose B&W.

## What the build fixed in the source text

The manuscript is text extracted from a PDF. `build.py` now repairs, for both this kit and the web edition (`book.html`):
paragraphs merged across every page break (form feeds), real hyphens deleted at line ends ("decisionmaking"), bullet and numbered lists split into one-line fragments, multi-line headings and appendix subtitles broken into paragraphs, headings lost before page numbers, dialogue rendered as centered epigraphs, epigraph attributions run into the quote, Kangxi-radical lookalikes in the Chinese terms, em/en dashes, and straight quotes. A short table of exact-text repairs (`2b. EDITORIAL REPAIRS`) covers the few spots heuristics can't.
