# Bar Raiser — Tequila Moonrise

Playtest prototype for Black Swan Games.

## One-time setup (do this once after unzipping)

```bash
npm install
```

## Deploy to GitHub Pages

Make sure you've already created a **public** GitHub repo named `bar-raiser`
and have it open. Then run these commands from inside this folder:

```bash
git init
git add .
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/bar-raiser.git
git push -u origin main
npm run deploy
```

Replace `YOUR_USERNAME` with your GitHub username.

After `npm run deploy` finishes, go to your repo on GitHub:
**Settings → Pages → Branch → select `gh-pages` → Save**

Your game will be live at:
```
https://YOUR_USERNAME.github.io/bar-raiser/
```

(Allow 1–2 minutes for GitHub to publish after the first deploy.)

## Updating the game

After making changes to `bar-raiser-hud.jsx`, just run:

```bash
npm run deploy
```

The URL stays the same.

## Local preview

To run locally before deploying:

```bash
npm run dev
```

Then open `http://localhost:5173/bar-raiser/` in your browser.
