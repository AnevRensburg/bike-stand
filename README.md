# MTB / eMTB Bike Stand

Single-product site for the bike stand, with an order form that opens WhatsApp. Built from the
Miamora site's structure (Angular 22, standalone components, signals, prerendered static HTML).

- `src/app/core/site.ts`: price, special (`SPECIAL`, set to `null` to hide it), courier,
  WhatsApp number, email, address and the footer copyright name.
- `src/app/pages/home/`: the page (special banner, hero, description + "Works great for",
  video + photos, order section, contact, footer).
- `src/app/shared/order-form/`: name, number, optional email, quantity, courier or collect,
  message. Submitting opens `wa.me/<number>?text=…`, with an email fallback link.
- `images-src/` → `npm run images` → `public/images/` (AVIF + WebP, OG image, favicons).

Node is installed with nvm: `export PATH=~/.nvm/versions/node/v24.22.0/bin:$PATH`.

- `npm start`: dev server on http://localhost:4200 (use `npx ng serve --port 4300` if Miamora is
  running)
- `npm run build`: production build into `dist/bike-stand/browser`

Push to `main` → `.github/workflows/deploy.yml` builds and deploys to GitHub Pages at
https://anevrensburg.github.io/bike-stand/ (the production build uses `baseHref: /bike-stand/`,
so image paths are relative). The old 2023 static site is in git history before this commit.
