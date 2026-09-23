# POST_GUIDELINES.md — AI Agent Guide for Writing TheNCTimes Articles

This document is the reference for AI agents writing new article posts for **TheNCTimes** newspaper portfolio. Read this entirely before writing any article.

---

## 1. File Location & Naming

All articles live in:
```
content/articles/<slug>.mdx
```

The filename **is** the URL slug. Use lowercase kebab-case, descriptive, no special characters:
- ✅ `client-win-40cr.mdx` → URL: `/article/client-win-40cr`
- ✅ `speaking-at-india-growth-summit.mdx`
- ❌ `Article About Client.mdx` (spaces, capitals)
- ❌ `post1.mdx` (not descriptive)

---

## 2. Frontmatter Schema

Every article must begin with YAML frontmatter between `---` markers:

```yaml
---
title: "Full Article Headline (can be long, newspaper-style)"
deck: "One sentence sub-headline that summarises the article's argument."   # optional but encouraged
kicker: "Section Label"          # Appears above headline in SMALL CAPS (e.g. "Case Study", "Recognition")
category: "Career"               # Used in sidebar: Career | Projects | Consulting | Recognition | About
date: "YYYY-MM-DD"               # ISO date of the event/publication
byline: "Desk Report — New Delhi" # Who/where. Format: "Name — City" or "Business Desk — City"
dateline: "New Delhi"            # City where article originates (shown before body text)
readtime: "4 min"                # Estimated reading time
summary:                         # 3–5 bullet points for the modal sidebar "Key Points"
  - "One sentence fact or takeaway."
  - "Another key point."
  - "A third point."
  - "Optional fourth point."
images:                          # Images shown on MAIN PAGE (article card). Optional.
  - src: "/images/filename.jpg"  # Leave src: "" for gradient placeholder
    alt: "Description for accessibility"
    caption: "Caption shown under image in modal"
    placement: "hero"            # hero | thumbnail | gallery
    variant: "ph-b"              # ph-a | ph-b | ph-c | ph-d | ph-e (gradient style if no src)
    label: "Photo: Brief label"  # Small label inside placeholder/image
videos:                          # Videos referenced in frontmatter (optional)
  - src: "https://youtube.com/watch?v=..." # YouTube URL or direct video URL. Leave "" for placeholder.
    caption: "Caption below video"
    label: "▶ Brief label"
    thumbnail: "/images/thumb.jpg" # Optional thumbnail
---
```

### Required fields:
- `title` — required
- `kicker` — required  
- `category` — required
- `date` — required (YYYY-MM-DD format)
- `byline` — required

### Optional but strongly recommended:
- `deck` — makes article cards richer
- `summary` — shown in modal sidebar "Key Points"
- `readtime` — shown in sidebar
- `dateline` — shown bold before first paragraph on article card

---

## 3. Article Body (MDX)

Write the article body **after** the closing `---` of frontmatter.

### Plain paragraphs (default)
```mdx
Write paragraphs directly as plain text. No special wrapper needed.

Each blank line starts a new paragraph. The first paragraph's first letter
gets a newspaper drop-cap style automatically.
```

### Custom Components Available

#### `<Photo>` — Insert an image anywhere in the article

```mdx
<Photo
  src="/images/my-photo.jpg"
  alt="Description of the image"
  caption="Caption text shown below the image."
  variant="ph-b"
  label="Photo: Brief label in corner"
/>
```

If `src` is empty (`src=""`), the `variant` CSS gradient placeholder (`ph-a` through `ph-e`) is used.

**Variants (gradient colours):**
| Variant | Colours |
|---------|---------|
| `ph-a`  | Warm brown/tan |
| `ph-b`  | Dark blue/slate |
| `ph-c`  | Deep red/maroon |
| `ph-d`  | Dark green/olive |
| `ph-e`  | Brown/amber |

#### `<Video>` — Embed a video

```mdx
<Video
  src="https://www.youtube.com/watch?v=VIDEO_ID"
  caption="Caption shown below the video."
  label="▶ Video title — 2:14"
  thumbnail="/images/video-thumb.jpg"
/>
```

For non-YouTube direct video files, `src` can be a path to a `.mp4` file.
If `src` is empty, a placeholder with play button is shown.

#### `<PullQuote>` — Block pull quote

```mdx
<PullQuote cite="Nikhil Chandra">
  The quote text goes here, without quotation marks.
</PullQuote>
```

Renders as a full-width italic quote with accent border and attribution.

#### `<Gallery>` — Image grid (2–3 images side by side)

```mdx
<Gallery>
  <Photo variant="ph-a" caption="2022 — First mandate" alt="Photo caption" />
  <Photo variant="ph-b" caption="2023 — Strategy pivot" alt="Photo caption" />
  <Photo variant="ph-c" caption="2024 — First cohort" alt="Photo caption" />
</Gallery>
```

Renders as a 3-column grid. Works with any combination of Photo components.

#### `<InfoBox>` — Bordered box with a header

```mdx
<InfoBox title="Engagement Snapshot">
- **Duration** — 18 months
- **Sector** — Mid-cap manufacturing
- **Result** — Revenue grew 2.8x
</InfoBox>
```

The content inside can be any Markdown (lists, bold text, etc).

---

## 4. Writing Style Guide

**Voice:** Third person, past tense for past events. Active voice. Dateline style.

**Length:** 200–600 words for the body. Not too short, not too long.

**Opening:** Should hook immediately. No "In today's world..." or fluff openers. Start with the most interesting fact.

**Dateline style:** The first sentence often starts with the dateline city in bold: `**Mumbai:** A forty-year-old retail name...`

Wait — do not add the dateline in the MDX body. It's handled automatically from the `dateline` frontmatter field on article cards. In the full article body, start directly with the first sentence.

**Drop-cap:** The first letter of the entire article body gets an automatic drop-cap via CSS. Don't do anything special for it.

**Structure:** Newspapers go most-important → context → detail. Don't bury the lead.

---

## 5. Adding an Article to the Newspaper Pages

After writing the MDX file, add the article to `content/pages.json` to make it appear on a newspaper page.

### pages.json structure:

```json
{
  "id": "p1",
  "section": "Front Page",
  "articles": [
    {
      "slug": "your-article-slug",
      "slot": { "top": 240, "left": 250, "width": 220, "height": 410 },
      "size": "xl",
      "showPhoto": true,
      "photoVariant": "ph-b",
      "photoLabel": "Photo: Brief label",
      "bodyClamp": 4,
      "crossref": "▶ About this paper, Page 4"
    }
  ]
}
```

### Article slot fields:

| Field | Type | Description |
|-------|------|-------------|
| `slug` | string | Must match the MDX filename (without `.mdx`) |
| `slot.top` | number | Pixels from top of page canvas (0–980) |
| `slot.left` | number | Pixels from left of page canvas (0–720) |
| `slot.width` | number | Width of the article block in pixels |
| `slot.height` | number | Height of the article block in pixels |
| `size` | string | Headline size: `xl` / `lg` / `md` / `sm` / `xs` / `inline` |
| `showPhoto` | boolean | Show a photo in the card (from frontmatter images[0]) |
| `photoVariant` | string | CSS gradient variant if no real image |
| `photoLabel` | string | Small label inside the photo |
| `bodyClamp` | number | How many lines of excerpt to show: 3–12 |
| `crossref` | string | Optional red cross-reference text at bottom |
| `hasBorder` | boolean | Thin border around the article block |

### Headline sizes — visual guide:

| Size | Class | Approx. font size | Best for |
|------|-------|-------------------|----------|
| `xl` | `.h-xl` | 31px | Hero/lead article |
| `lg` | `.h-lg` | 21px | Secondary story |
| `md` | `.h-md` | 16.5px | Standard article |
| `sm` | `.h-sm` | 13px | Brief/short item |
| `xs` | `.h-xs` | 11px | Note/short |
| `inline` | — | — | Single-line teaser strip |

### Page layout tips:
- Page canvas is **720px wide × 980px tall**
- Masthead on Page 1 takes ~240px height; interior pages take ~58px for the header
- Articles must **not overlap** (check top/left/width/height)
- Leave room for column rules and decorations
- Typical columns: left zone (left:20, width:220), center (left:250, width:220), right (left:480, width:220)
- Or two half-page columns: left (left:20, width:335), right (left:365, width:335)

---

## 6. Images — How to Use Real Photos

1. Place image files in `public/images/`:
   ```
   public/images/my-article-photo.jpg
   ```

2. Reference in frontmatter:
   ```yaml
   images:
     - src: "/images/my-article-photo.jpg"
       alt: "Descriptive alt text"
       caption: "Caption for the image"
       placement: "hero"
   ```

3. Reference in MDX body:
   ```mdx
   <Photo src="/images/my-article-photo.jpg" alt="Alt text" caption="Caption" />
   ```

When `src` is empty `""`, the `variant` gradient placeholder is shown automatically.

---

## 7. Video — YouTube Embedding

Paste the YouTube URL directly:
```mdx
<Video
  src="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
  caption="Video caption below."
  label="▶ Video title — duration"
/>
```

The video loads lazily — only the play button thumbnail is shown until the user clicks it.

---

## 8. Complete Example Article

```mdx
---
title: "New Partnership With Leading EdTech Firm Announced"
deck: "A new kind of engagement — focused on curriculum, not conversion."
kicker: "Partnerships"
category: "Projects"
date: "2026-07-15"
byline: "Business Desk — Bengaluru"
dateline: "Bengaluru"
readtime: "3 min"
summary:
  - "Partnership with a leading EdTech firm focused on curriculum design."
  - "Engagement began with the five-step growth diagnostic."
  - "Focus on retention, not acquisition — an unusual brief."
  - "First education sector engagement for TheNCTimes."
images:
  - src: ""
    alt: "Workshop session in Bengaluru"
    caption: "An early working session with the EdTech leadership team."
    placement: "hero"
    variant: "ph-d"
    label: "Photo: Workshop Session"
---

A leading EdTech firm approached Nikhil Chandra with an unusual brief: not how to acquire more users, but how to keep the ones they already had engaged long enough to complete a course.

<Photo variant="ph-d" label="Photo: Workshop Session" caption="An early working session with the EdTech leadership team." alt="Workshop session" />

The brief was unusual because most EdTech growth conversations are about top-of-funnel. This one started at the bottom: completion rates, re-engagement after dropout, and the specific moments in a curriculum where users systematically stopped.

<PullQuote cite="Nikhil Chandra">
Retention is a product problem, not a marketing problem. The diagnostic confirmed it within the first week.
</PullQuote>

The diagnostic, applied here as in every engagement, found the binding constraint in week two: a specific lesson format that correlated strongly with dropout, across every subject. The fix was a product change, not a campaign.

<InfoBox title="Engagement Details">
- **Sector** — EdTech / Digital Learning
- **Focus** — Course completion rates
- **Approach** — Five-step growth diagnostic
- **Finding** — Lesson format, not marketing, was the constraint
</InfoBox>

Early results from the format change were encouraging. Full engagement details will be shared once the quarter closes.
```

---

## 9. Checklist Before Publishing

- [ ] Filename is lowercase kebab-case and matches the slug you'll use in `pages.json`
- [ ] All required frontmatter fields are present (`title`, `kicker`, `category`, `date`, `byline`)
- [ ] Summary has 3–5 bullet points
- [ ] Body starts with an interesting hook (no "In today's fast-paced world...")
- [ ] Custom components are used correctly (no typos in component names)
- [ ] If using `<Photo>` or `<Video>`, either `src` is set to a real path OR `variant` is set
- [ ] Article has been added to `content/pages.json` with a valid slot that doesn't overlap existing articles
- [ ] Slot `top + height` ≤ 960 (leaves room for folio at bottom)
- [ ] Slot `left + width` ≤ 700 (leaves margins)
