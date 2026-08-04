# KVIAZ — Production Refactor Changelog

Scope: bug fixes, accessibility, SEO, performance, and code-organization
improvements only. **No layout, spacing, typography, color, or copy was
redesigned.** Every item below either fixes something objectively broken,
brings a page in line with the pattern the rest of the site already
established, or is a non-visual code-quality improvement. Anywhere a change
does touch pixels, the reason is called out explicitly.

---

## 1. Site‑breaking bugs (found only in `index.html`)

The homepage had drifted out of sync with the other five pages and shipped
with paths that do not exist on the live site.

| Before | After | Effect of the bug |
|---|---|---|
| `<link rel="stylesheet" href="/kviaz/assets/css/style.css">` | `/assets/css/style.css` | Stylesheet 404s unless the site is deployed under a `/kviaz/` sub-path. On a root deploy (as `robots.txt`/`sitemap.xml`/canonical URLs all assume), **the homepage would have loaded completely unstyled.** |
| `<script src="/kvias/assets/js/main.js">` | `/assets/js/main.js` | Typo'd path (`kvias`, not `kviaz`). Mobile nav, scroll-reveal, registry expand, footer year, and form validation would **silently not run at all** on the homepage. |
| `<link rel="apple-touch-icon" href="/kviaz/assets/icons/apple-touch-icon.png">` | `/assets/icons/apple-touch-icon.png` | Same broken `/kviaz/` prefix, and pointed at the wrong icon (see §2). |
| `<link rel="manifest" href="/kviaz/site.webmanifest">` | `/site.webmanifest` | Broken path; PWA install/manifest silently failed. |
| Logo `<img>` used a relative path `assets/logos/…` while every other asset on the page used absolute/prefixed paths | All logo references now use root‑relative `/assets/logos/…`, consistent site‑wide | Relative paths resolve differently depending on the current URL; this "worked" only by accident at the site root and would break on any URL one directory deep. |

These are functional defects, not style changes — fixing them doesn't alter
how the page looks when it *does* load correctly, only whether it loads
correctly at all.

## 2. Broken / duplicate favicon set

`assets/icons/` (only linked from `index.html`) and `assets/icons/` (linked
from every other page) both existed and disagreed:

- `assets/icons/favicon.svg` was **not a favicon** — it was the full 2454×860
  wordmark SVG (`Logo_final5_2.svg`) sitting under a favicon filename. In a
  browser tab this renders as a nearly invisible sliver.
- `assets/icons/apple-touch-icon.png` was **180×63px** — a non‑square,
  vertically‑squashed image where Apple's spec requires a 180×180 square.
  iOS would have visibly distorted this on a home‑screen bookmark.
- `assets/icons/` held the *correct*, purpose‑built set (64×64 SVG mark,
  proper 32×32 and 180×180 PNGs) — this is what five of the six pages
  already used.

**Fix:** every page (including `index.html`) now points at the single,
correct `assets/icons/` set. The broken `assets/icons/` folder was removed
entirely to eliminate the duplicate source of truth. `favicon.ico` (which
was valid — a real multi‑res `.ico` of the correct symbol) was kept and
moved into `assets/icons/` as a legacy fallback, and added to every page.

## 3. Logo/brand inconsistency across pages — real bug, not a design choice

`index.html` was the only page actually using the provided SVG wordmark.
The other five pages (`about`, `companies`, `contact`, `journal`, `404`)
rendered a **fake CSS text logo** — `KVI<span>AZ</span>` styled to
approximate the wordmark — instead of the final brand asset:

```html
<a href="/" class="nav__logo">KVI<span>AZ</span></a>
```

Per the brief ("Use the provided SVG files exactly as delivered," "Never
modify wordmark") the real, final asset should be used everywhere, not
approximated in five-sixths of the site. **Fixed:** all six pages now render
the actual `KVIAZ_Wordmark_*.svg` in both header and footer. Visually this
is extremely close to the original CSS approximation by design — same size,
weight, and position — so the layout is unaffected; the only visible
difference is the real logo's stylized "I" glyph now appears everywhere
instead of only on the homepage.

### 3a. Footer logo used the wrong color variant (contrast bug)

`index.html`'s footer used `KVIAZ_Wordmark_Black.svg` (`#000000` fill) on
the footer's dark ink background (`--color-ink`, `#14161C`) — a **black
logo on a near-black background**, effectively invisible and a clear WCAG
contrast failure. The project ships a `KVIAZ_Wordmark_White.svg` variant
specifically for this situation. **Fixed:** the footer on every page now
uses the white wordmark; the header (light background) continues to use
the black wordmark. This *is* a visible change on the homepage specifically
— from "invisible" to "legible" — which is a correctness fix, not a
redesign.

## 4. `site.webmanifest` pointed at PNGs that don't exist

```json
"src": "/assets/icons/android-chrome-192.png"   // 404
"src": "/assets/icons/android-chrome-512.png"   // 404
```

These files were never in the project. Any PWA "Add to Home Screen" flow
would have failed to show an icon. **Fixed:** generated proper 192×192 and
512×512 PNGs directly from the same `favicon.svg` symbol mark already used
for the 32×32/64×64 icons (so it's pixel-consistent with the existing
favicon, not a new asset), and pointed the manifest at real files. Also
corrected `background_color`/`theme_color` from generic placeholders
(`#FFFFFF`/`#000000`) to the actual brand tokens (`--color-paper` /
`--color-ink`), and fixed the manifest description, which described a
different, generic company.

## 5. SEO / metadata

- **Twitter Card tags were commented out on `index.html` only** — the
  homepage is the one page most likely to be shared, and it was the one
  page missing card metadata:
  ```html
  <!-- <meta name="twitter:card" content="summary_large_image"> -->
  ```
  Uncommented and enabled, matching the pattern already live on all five
  other pages.
- **Unescaped `&` in two meta attributes** (`index.html` og:title,
  `companies.html` og:description) — invalid HTML; browsers tolerate it but
  it's technically non-conforming markup and some strict parsers/crawlers
  will mis-handle it. Escaped to `&amp;`.
- **`sitemap.xml`** — added `<lastmod>` to every URL (freshness signal for
  crawlers; previously absent).
- No changes to titles, descriptions, canonical URLs, or Open Graph copy —
  these were already complete and well-written on every page.

## 6. Accessibility (WCAG AA)

- **Dead interactive control on the homepage registry teaser.** The four
  teaser rows in the "Registry" section of `index.html` carried
  `data-expand`, which the JS turns into a focusable
  `role="button"`/`aria-expanded` control — but these rows have no matching
  `.company-detail` panel to expand (that markup only exists on
  `companies.html`). The result: keyboard and screen-reader users could tab
  to a row, press Enter, hear `aria-expanded="true"`, and watch nothing
  happen — a state that actively misrepresents the control (WCAG 4.1.2).
  **Fixed** by removing `data-expand` from the non-functional teaser rows;
  they're now correctly static list items, and the CSS `cursor: pointer`
  affordance was scoped (`.registry-row[data-expand]`) so it no longer
  implies interactivity on rows that have none.
- **Registry rows on `companies.html` were not programmatically linked to
  the panels they expand.** The button and the content it reveals had no
  `aria-controls`/`id` relationship, and the collapsed panel wasn't marked
  `hidden`, so it remained in the accessibility tree even when visually
  collapsed. **Fixed:** each row now has a stable `id` and
  `aria-controls="company-detail-NNN"`; each panel has a matching `id`,
  `role="region"`, `aria-labelledby`, and an initial `hidden` attribute that
  JS now toggles in sync with `aria-expanded` (previously JS only toggled a
  CSS class).
- **Contact form fields had no programmatic link to their error
  messages.** Inputs lacked `aria-describedby`/`aria-invalid`, so a screen
  reader user landing on an invalid field after a failed submit would not
  hear *why* it's invalid. Added `aria-describedby` (pointing at each
  existing, already-present error `<p>`, now given an `id`),
  `aria-required="true"`, and JS now sets `aria-invalid` on every validation
  pass.
- **Form success confirmation** now uses `role="status"`/`aria-live="polite"`
  so assistive tech announces the confirmation reliably, in addition to the
  existing (correct) focus-move behavior.
- **Mobile nav** now closes on <kbd>Escape</kbd> (returning focus to the
  toggle button) and on an outside click — previously the only way to close
  it was re-tapping the hamburger or clicking a link.
- **Journal entries** are now wrapped in `<article>` — each is a standalone,
  independently-meaningful piece of content, which is exactly what
  `<article>` is for, and was explicitly requested in the brief's HTML
  semantics section.
- **Logo images** now carry explicit `width`/`height` attributes matching
  their real aspect ratio (2453.57 × 859.67 → 97 × 34 at the CSS-set 34px
  height), so the browser reserves the correct box before the SVG loads —
  removes a layout-shift (CLS) source that previously only existed
  implicitly through CSS.

None of the above change how anything looks. They change what a keyboard or
screen-reader user experiences, and what state is exposed to assistive
technology.

## 7. Performance

- Added `rel="preload"` for the header wordmark SVG on every page (it's
  always above the fold and part of perceived load).
- Header logo: `fetchpriority="high"` (it's effectively part of the LCP
  region). Footer logo: `loading="lazy"` (always below the fold on first
  paint) — this pairing didn't exist before because the footer logo was
  plain text on five of six pages and had no loading behavior to set.
- `main.js` now loads with `defer` instead of being a bare blocking
  `<script>` tag at the end of `<body>` — negligible today since it was
  already last in the DOM, but it's the correct, explicit signal and costs
  nothing.
- No other performance work was needed: there's no build step by design
  (see `README.md`), the stylesheet and script are already both small and
  singular, and images that exist (`og-image.png`, favicons) were already
  reasonably sized. Self-hosting the two Google Fonts requests would save a
  render-blocking third-party connection, but that's a bigger, riskier
  change (font-metric matching, licensing files to ship) that wasn't
  requested and isn't a "bug" — flagging it here as a good next step rather
  than doing it silently.

## 8. Code organization / maintainability

- **CSS:** removed `.nav__logo`/`.nav__logo span`/`.footer__brand
  .nav__logo` — dead rules for the fake text logo that no longer exists
  anywhere in the markup. Consolidated the `.logo` rule, which was
  duplicated and tacked onto the very end of the file (past the
  `Responsive` section, out of place), into the `Header` section next to
  the new `.site-logo` wrapper rule where it belongs per the file's own
  documented structure (`Tokens → Reset → … → Header/Footer → …`).
- **JS:** registry-row expand logic now looks up its target panel via
  `aria-controls` instead of relying purely on adjacent-sibling CSS, so the
  relationship is explicit in both directions (DOM query and CSS selector)
  rather than implicit in document order alone.
- **Manifest/sitemap/robots:** manifest now describes the actual company
  instead of generic placeholder copy; sitemap dates are present and
  accurate to this refactor.

## 9. Explicitly *not* changed

To be clear about what stayed untouched, on purpose:
- Colors, type scale, spacing scale, grid, and every `--color-*`/`--fs-*`/
  `--sp-*` token.
- All page copy, headings, and content.
- The "no build step, no framework" architecture described in `README.md` —
  a templating layer would remove the repeated `<head>`/header/footer
  markup, but that's an architectural change beyond "fix bugs and clean up
  code," and the README documents this as an intentional constraint of the
  project. Flagging as a good candidate for a future iteration if the
  project ever needs more than five pages.
- The contact form's client-side-only submission (already clearly
  documented in the UI and in `README.md` as a placeholder to be wired to a
  real backend before launch).

---

## File-by-file summary

| File | Changed |
|---|---|
| `index.html` | Fixed all broken `/kviaz/`/`/kvias/` paths · fixed favicon/manifest links · enabled Twitter Card meta · escaped `&` · real wordmark logo (black header / white footer) · removed dead-end `data-expand` on teaser rows · preload + priority hints · `defer` on script |
| `about.html`, `companies.html`, `contact.html`, `journal.html`, `404.html` | Real wordmark logo (black header / white footer) in place of CSS text logo · `favicon.ico` fallback + manifest link added · preload hint for logo · `defer` on script |
| `companies.html` | Registry rows wired to their detail panels (`id`/`aria-controls`/`aria-labelledby`/`hidden`) · escaped `&` in og:description |
| `contact.html` | Form fields wired with `aria-describedby`/`aria-invalid`/`aria-required` · success box `role="status"` |
| `journal.html` | Each entry wrapped in `<article>` |
| `assets/css/style.css` | Removed dead `.nav__logo` rules · consolidated `.logo`/added `.site-logo` in the Header section · scoped `cursor: pointer` to expandable rows only |
| `assets/js/main.js` | Registry expand toggles `hidden` via `aria-controls` lookup · mobile nav closes on Escape/outside click · form validation sets `aria-invalid` |
| `site.webmanifest` | Fixed icon paths, added real 192/512 icons, corrected theme colors and description |
| `sitemap.xml` | Added `lastmod` to every URL |
| `assets/icons/` | Added `android-chrome-192.png`, `android-chrome-512.png` (rendered from the existing brand SVG mark, not new artwork), `favicon.ico` (moved from the removed `assets/icons/`) |
| `assets/icons/` | Removed — broken/duplicate favicon set (stretched wordmark mis-used as a favicon, non-square apple-touch-icon) |
