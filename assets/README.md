# /assets

Drop these files here before the site goes live:

## Required

- **`farhan-azim-resume.pdf`** — your resume PDF.
  Several "Resume (PDF)" buttons in the site link to `assets/farhan-azim-resume.pdf`.
  If you keep your resume under a different filename, do a global find-and-replace
  in `index.html` to update the path.

## Optional

- **`farhan.jpg`** — headshot (referenced from the old site).
  The current design doesn't render an image by default for an editorial feel,
  but if you want one back, add an `<img src="assets/farhan.jpg">` inside the
  `.hero` block in `index.html`.

- **`og-card.png`** — 1200×630 social preview image (for LinkedIn / Twitter shares).
  If you add it, also add this line to the `<head>` of `index.html`:
  `<meta property="og:image" content="https://farhanazim-sarva.github.io/Farhan/assets/og-card.png" />`

That's it.
