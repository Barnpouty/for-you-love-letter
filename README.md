# For You — Love Letters (website)

A bilingual (English / Português) landing experience for the ebook **For You — A Collection of Love Letters for Every Occasion**, built with Flask and vanilla HTML/CSS/JS, ready for Vercel.

Visitors choose a feeling, an envelope opens and the matching letter rises out of it, two illustrated characters respond, and every purchase button sends them to the EscalePay checkout for the language they are reading in.

---

## 1. Project structure

```
for-you-love-letters/
├── app.py                     Flask app (routes, language detection, SEO routes)
├── requirements.txt           Python dependencies (Flask only)
├── vercel.json                Vercel build + routing config
├── .env.example               Optional environment variables
├── config/
│   └── settings.py            ★ Checkout URLs, site URL, asset version
├── content/
│   ├── en.json                ★ All English text (letters, buttons, sections)
│   └── pt.json                ★ All Portuguese text
├── templates/
│   ├── base.html              <head>: SEO, Open Graph, Twitter, JSON-LD, fonts
│   ├── index.html             The page (all sections)
│   ├── 404.html
│   └── partials/avatars.html  ★ The SVG avatar pair (one macro, used 3×)
└── static/
    ├── css/main.css           ★ Colours, type, layout, envelope, wall, book
    ├── css/avatars.css        Avatar poses (pure CSS transforms)
    ├── js/main.js             Entry point (ES module)
    ├── js/modules/
    │   ├── avatars.js         Pose controller
    │   ├── moments.js         "What does your heart need today?"
    │   ├── letter-dialog.js   Letter preview dialog
    │   ├── chrome.js          Header, language switch, sticky CTA
    │   └── motion.js          Entrances, hero/final avatar choreography, book tilt
    ├── images/illustrations/  The ebook's painted objects (transparent WebP)
    ├── images/pages/          Cover, page previews (teaser pages are pre-blurred)
    ├── images/og-image.jpg    Social sharing image (1200×630)
    ├── models/                Optional future .glb files (not required)
    └── favicon.svg
```

★ = the files you'll most likely edit.

---

## 2. Run it locally

Requires **Python 3.9+**.

1. **Download / clone** the project and open a terminal in its folder:
   ```bash
   cd for-you-love-letters
   ```
2. **Create a virtual environment**
   ```bash
   python -m venv .venv
   ```
3. **Activate it**
   - macOS / Linux: `source .venv/bin/activate`
   - Windows (PowerShell): `.venv\Scripts\Activate.ps1`
   - Windows (cmd): `.venv\Scripts\activate.bat`
4. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```
5. **Run Flask**
   ```bash
   python app.py
   ```
   (or `flask --app app run --debug`)
6. **Open** <http://127.0.0.1:5000>
   - `/en` — English, `/pt` — Portuguese
   - `/` — picks the visitor's language (saved choice → browser language → English)

> Content JSON is cached per process. After editing `content/*.json`, restart the server (debug mode restarts automatically on `.py` changes, not JSON).

---

## 3. Put it on GitHub

1. Create an empty repository on <https://github.com/new> (e.g. `for-you-love-letters`). Don't add a README there.
2. In the project folder:
   ```bash
   git init
   git add .
   git commit -m "For You — love letters website"
   git branch -M main
   git remote add origin https://github.com/<your-username>/for-you-love-letters.git
   git push -u origin main
   ```

---

## 4. Deploy on Vercel

1. Sign in at <https://vercel.com> (use "Continue with GitHub").
2. Click **Add New… → Project**, find your repository and click **Import**.
3. **Configure project**
   - Framework Preset: **Other** (Vercel reads `vercel.json`)
   - Root Directory: the folder containing `app.py` (leave as `./` if it's the repo root)
   - Build / Output settings: leave empty
4. **Python runtime:** nothing to configure. `vercel.json` uses `@vercel/python`, which installs `requirements.txt` automatically.
5. **Environment variables** (optional — everything works without them), under *Settings → Environment Variables*:
   | Name | Example | Purpose |
   |---|---|---|
   | `SITE_URL` | `https://foryouletters.com` | Canonical, Open Graph and sitemap links. Without it, the current domain is used. |
   | `CHECKOUT_URL_EN` | `https://checkout.escalepay.com/2859029` | Override English checkout |
   | `CHECKOUT_URL_PT` | `https://checkout.escalepay.com/5931168` | Override Portuguese checkout |
   | `ASSET_VERSION` | `1.0.1` | Bump after replacing CSS/JS/images |
6. Click **Deploy**. Every future `git push` to `main` redeploys automatically.
7. **Verify** on the `.vercel.app` URL:
   - `/en` and `/pt` load, with styles and illustrations
   - Click every "Get the Love Letters" button on `/en` → lands on `checkout.escalepay.com/2859029`
   - Same on `/pt` → `checkout.escalepay.com/5931168`
   - `/checkout/en` and `/checkout/pt` redirect correctly
   - `/robots.txt`, `/sitemap.xml` and `/health` respond
   - Paste the URL into a messaging app to see the share preview

---

## 5. Custom domain (later)

1. In Vercel: **Project → Settings → Domains → Add**, enter `yourdomain.com` (and `www.yourdomain.com`).
2. Vercel shows the DNS records to add at your registrar — usually an **A record** for the root domain and a **CNAME** for `www`. Add them and wait for verification (minutes to a few hours). HTTPS is issued automatically.
3. Set `SITE_URL=https://yourdomain.com` in Environment Variables and redeploy, so canonical/OG/sitemap use the real domain.

---

## 6. Updating the website

| To change… | Edit |
|---|---|
| **Any text** (headlines, buttons, sections, footer) | `content/en.json` and `content/pt.json` — same keys in both |
| **Letter titles, excerpts, moods** | the `letters` and `moods` arrays in the same JSON files |
| **Checkout links** | `config/settings.py` → `CHECKOUT_URLS` (or the env vars above). This is the only place they're defined; every button reads from it. |
| **Colours** | `static/css/main.css` → `:root` tokens (`--terracotta`, `--paper`, `--olive`, `--wine`, `--sage`) |
| **Fonts** | the Google Fonts `<link>` in `templates/base.html` + `--serif` / `--sans` in `main.css` |
| **Images** | replace files in `static/images/…` keeping the same names, then bump `ASSET_VERSION` |
| **Letter illustrations** | `static/images/illustrations/l01.webp` … `l16.webp` (transparent WebP, ~320px) — the `image` field in each letter points to these |
| **Page previews** | `static/images/pages/` (`letter-01-760.webp` etc. are intentionally blurred below the first lines) |
| **Avatars** (colours, clothes, hair) | `templates/partials/avatars.html` (gradients at the top, shapes below) |
| **Avatar poses / timing** | `static/css/avatars.css` (poses) and `static/js/modules/motion.js` / `moments.js` (when they happen) |
| **Which pose / atmosphere a letter triggers** | each letter's `pose` (`comfort`, `embrace`, `uplift`, `joy`, `calm`, `reading`) and `atmosphere` (`quiet`, `calm`, `warm`, `romantic`, `bright`, `morning`, `night`, `faith`) in the JSON |
| **Testimonials** | add real ones to `testimonials.items` as `{ "quote": "…", "name": "…", "context": "…" }`. The section only appears when the list isn't empty. |
| **Social image** | `static/images/og-image.jpg` (1200×630) |

### Adding a third language
1. Copy `content/en.json` to e.g. `content/fr.json` and translate it.
2. Add `"fr"` to `LANGUAGES` and a `CHECKOUT_URLS["fr"]` entry in `config/settings.py`.
3. Add an `FR` link to the language switch in `templates/index.html`.

---

## 7. How it works (short version)

- **Language** is part of the URL (`/en`, `/pt`), rendered on the server, so search engines index both and every link works without JavaScript. Switching saves a `lang` cookie so `/` remembers the choice.
- **Checkout**: `settings.checkout_url(lang)` is injected into every `[data-checkout]` link at render time. No URL is repeated in templates or JS. Clicks also fire a `checkout:click` browser event (and `begin_checkout` to `dataLayer` if Google Tag Manager is present) for analytics.
- **Avatars**: inline SVG with separately pivoting heads, arms and legs. Poses are CSS classes, so motion runs on the GPU and costs no extra downloads.
- **Performance**: no JS frameworks or animation libraries; total images ≈ 650 KB, lazy-loaded below the fold; `prefers-reduced-motion` turns all choreography into instant state changes.
