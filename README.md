# KVIAZ — Corporate Website

A production-ready marketing site for KVIAZ, a fictional holding company that
creates, acquires, and operates digital businesses across publishing,
artificial intelligence, commerce, and media.

Built with semantic HTML5, vanilla CSS, and vanilla JavaScript. No frameworks,
no build step, no dependencies beyond two Google Fonts requests.

## Structure

```
kviaz/
├── index.html          Home
├── about.html           About / mandate / leadership
├── companies.html       The Registry — all 9 portfolio companies
├── journal.html         Editorial essays (expand in place, no JS required)
├── contact.html         Two contact paths + a validated inquiry form
├── 404.html             Not-found page, matches site chrome
├── robots.txt
├── sitemap.xml
├── README.md
└── assets/
    ├── css/
    │   └── style.css    Single stylesheet: tokens → reset → layout →
    │                    header/footer → components → registry → forms →
    │                    utilities → animation → responsive
    ├── js/
    │   └── main.js       Progressive enhancement: mobile nav, scroll-reveal,
    │                     registry row expand, footer year, form validation
    └── icons/
        ├── favicon.svg / favicon.png / favicon-32.png / apple-touch-icon.png
        └── og-image.png (+ og-source.svg, the editable source)
```

## Design system

- **Type**: Fraunces (display serif, used sparingly for headlines and the
  pull-quote), Inter (body/UI), IBM Plex Mono (data — the registry ledger,
  eyebrows, dates, footer). Loaded from Google Fonts in `<head>`.
- **Color**: warm paper background, near-black ink, a desaturated signal-blue
  accent for links/tags, and a muted brass/gold used only for the ledger
  index numerals and section markers. All values are CSS custom properties
  in `:root` (`assets/css/style.css`).
- **Layout**: a 12-column CSS grid (`.grid` + `grid-column: span N`) inside a
  1240px container, with a generous spacing scale (`--sp-1` … `--sp-11`).
- **Signature element**: the Registry — a ledger-style table of the nine
  companies KVIAZ holds. Row numbers are literal entry numbers (not
  decorative), and each row expands in place to a two-to-three sentence
  account of the company. Used as a teaser on Home and in full on Companies.

## Accessibility

- Landmarks: `header`, `nav[aria-label]`, `main`, `footer`.
- Skip-to-content link, visible focus rings (`:focus-visible`), and
  `aria-current="page"` on the active nav link.
- Registry rows and the mobile nav toggle are keyboard operable
  (`role="button"`, `tabindex`, `Enter`/`Space` handling) and expose
  `aria-expanded`.
- Journal entries use native `<details>/<summary>` — expand/collapse works
  with zero JavaScript.
- `prefers-reduced-motion` is respected everywhere motion is used.
- Contact form has associated `<label>` elements, inline error text, and
  focus is moved to the first invalid field or the confirmation message.

## Performance / SEO notes

- No CSS or JS frameworks; one stylesheet, one script, both small.
- Fonts are loaded with `preconnect` and `display=swap`.
- Every page ships a unique `<title>`, meta description, canonical URL,
  Open Graph tags, and Twitter Card tags.
- `index.html` includes `Organization` JSON-LD.
- `robots.txt` and `sitemap.xml` are included at the site root.
- Images are pre-rendered PNG/SVG with explicit dimensions where relevant.

## Running locally

No build step. From this folder:

```bash
python3 -m http.server 8080
# then open http://localhost:8080
```

Any static file server works equally well (e.g. `npx serve`).

## Content notes

KVIAZ, its leadership, and its nine portfolio companies (Northbound Press,
The Marginal Line, Almanac Quarterly, Aperture Labs, Fathom, Harlow & Finch,
Fieldstock, Wavelength Audio, Sixth Floor) are fictional, created for this
site. Addresses, emails, and phone numbers are placeholders and should be
replaced before any real deployment. The contact form validates client-side
only — wire `assets/js/main.js`'s submit handler to a real endpoint before
launch.

## Customizing

- Colors, type, spacing: edit the `:root` block at the top of
  `assets/css/style.css`.
- Nav/footer links: repeated at the top/bottom of each HTML file (no
  templating layer, by design, to keep this dependency-free — a static site
  generator or SSI/edge-include can be layered on top without touching the
  CSS or JS).
- Registry data: edit the `.registry-row` / `.company-detail` pairs in
  `companies.html` (and the teaser rows in `index.html`).
