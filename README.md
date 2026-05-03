# Farhan Azim Aurronoy — Portfolio (FAA Terminal v3.0)

A single-file, dependency-free portfolio site. Hosted on GitHub Pages at
[farhanazim-sarva.github.io/Farhan](https://farhanazim-sarva.github.io/Farhan/).

Aesthetic: Bloomberg terminal × editorial finance magazine. Dark theme,
warm amber accent, Fraunces serif + JetBrains Mono.

> **v3 update (May 2026):** Switched accent from electric lime to warm amber
> for better readability at scale. Body type bumped slightly. Mint green
> retained as a complementary indicator for charts.

---

## What's in this build

```
.
├── index.html                       # Main portfolio (single file)
├── 404.html                         # Custom not-found page
├── dashboards/
│   └── rates-analysis.html          # Power BI-style dashboard mockup
├── assets/
│   ├── README.md                    # What to drop in here
│   ├── farhan-azim-resume.pdf       # ← ADD YOUR RESUME PDF here
│   └── farhan.jpg                   # ← (optional) headshot
└── README.md                        # this file
```

### Features

- **Live ticker** of career wins + USAII speaker tag
- **Editorial hero** with three-line display headline
- **Featured speaker callout** with real talk title:
  *"AI Made Simple: Foundations for the Next Generation"*
- **Impact dashboard** — annotated SVG line chart + weighted skill stack
- **Inline dashboard preview** linking to a full mockup page
- **Experience tape** — Sarva, Pension Boards, Qi Meta, Colton Alexander, ONE Bank
- **Case files** — Fin-Lingo, Fraud Detection, Bangladesh Inequality research, Sarva
- **Press & Speaking** section with featured USAII talk + speaking timeline
- **Education**, **Awards**, **Contact**
- **`⌘K` command palette** — keyboard-driven navigation
- Custom **404 page**
- Dedicated **dashboard mockup** at `/dashboards/rates-analysis.html`

---

## Deploy: push to GitHub

You'll need to do this part yourself — I (Claude) can't push to your repo.

### Option A — replace your existing GitHub Pages site

Assuming your repo is `farhanazim-sarva.github.io/Farhan` and it's served from the `main` branch root:

```bash
# 1. Clone (or pull latest) your repo
git clone https://github.com/farhanazim-sarva/Farhan.git
cd Farhan

# 2. Back up the old version (optional but smart)
git checkout -b backup/v1
git push -u origin backup/v1
git checkout main

# 3. Replace with the new files
# Delete old files (or move them aside), then drop in:
#   index.html
#   404.html
#   dashboards/rates-analysis.html
#   assets/farhan-azim-resume.pdf  ← add your real resume
#   assets/README.md

# 4. Stage, commit, push
git add .
git commit -m "Redesign: FAA Terminal v2.0 — editorial finance aesthetic, dashboard preview, ⌘K palette, USAII speaker callout"
git push origin main
```

GitHub Pages will rebuild automatically. Refresh the live URL in 30–60 seconds.

### Option B — preview locally first

```bash
cd /path/to/the/site
python3 -m http.server 8000
# Open http://localhost:8000 in your browser
```

This serves the site locally — no deploy until you `git push`.

---

## Things you must do before going live

1. **Drop in your resume PDF** at `assets/farhan-azim-resume.pdf`. Several
   buttons in the site link to it. Without this, those links 404.

2. *(Optional)* Drop a headshot at `assets/farhan.jpg` if you want one
   re-introduced. The current design intentionally omits one for editorial cleanliness,
   but you can easily add an `<img>` block in the hero.

3. **Verify the USAII details** in two places — the hero callout and the press
   section. Both use:
   - Track: *Global Perspectives & Foundations*
   - Title: *"AI Made Simple: Foundations for the Next Generation"*
   - Role: *Founder & CFO, Sarva*

   If the date or any detail changes, update those strings.

4. **Sanity check on your phone.** The site is responsive but real-world phone
   testing always surfaces something.

---

## Editing tips

- All styles are in a single `<style>` block at the top of `index.html`.
- All CSS variables (colors, fonts) are at the very top in `:root{}`. Change the
  `--accent` color (currently `#d4ff3d`) and the whole site re-themes.
- The ticker text is duplicated for seamless scrolling — if you change one
  group, change the other to match.
- Charts are inline SVG paths — easy to tweak by hand or replace with real data.

---

## Tech notes

- **No build step.** No npm, no bundler. Drop in and serve.
- **No frameworks.** Vanilla HTML + CSS + ~80 lines of JS for the palette + reveals.
- **Fonts** loaded from Google Fonts CDN (Fraunces + JetBrains Mono + Inter).
- **One external network call** (the font CSS). Everything else inline.
- **Accessibility:** semantic landmarks, keyboard-navigable command palette,
  visible focus, sufficient contrast on all body copy.

Built May 2026.
