# Apurva Sinha · Portfolio

Personal portfolio for Apurva Sinha, Social Media & Brand Manager.

Built as a pure static site with Three.js (loaded from CDN). No build step, no dependencies to install. Vercel serves it as-is.

## Structure

```
.
├── index.html        # page markup
├── css/style.css     # design system + all styles
├── js/scene.js       # Three.js hero (particle wave + shapes)
├── js/main.js        # nav, cursor, reveals, counters
└── vercel.json       # optional Vercel config
```

## Run locally

Because the site uses ES modules, open it through a local server (not by double-clicking the file):

```bash
# any of these works
npx serve .
# or
python3 -m http.server 3000
```

Then open http://localhost:3000

## Deploy: GitHub + Vercel

1. Create a new GitHub repo (for example `apurva-portfolio`).
2. Push these files:

```bash
git init
git add .
git commit -m "Portfolio v1"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/apurva-portfolio.git
git push -u origin main
```

3. Go to vercel.com, click **Add New > Project**, and import the repo.
4. Framework preset: **Other**. Leave build command and output directory empty.
5. Click **Deploy**. Done.

Every push to `main` will auto-deploy.

## Customizing

- Colors and fonts live at the top of `css/style.css` in the `:root` block.
- Hero particle colors are set near the top of `js/scene.js`.
- All copy is plain HTML in `index.html`.
