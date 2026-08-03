# RouteWise TMS

Transport Management System — React + Vite অ্যাপ্লিকেশন।

---

## প্রজেক্ট স্ট্রাকচার

```
routewise-tms/
├── .github/
│   └── workflows/
│       ├── ci.yml             ← PR/push এ lint + build চেক
│       ├── deploy-pages.yml   ← main merge হলে GitHub Pages deploy
│       └── release.yml        ← tag push করলে GitHub Release তৈরি
├── src/
│   ├── TransportManagementApp.jsx   ← মূল অ্যাপ
│   ├── main.jsx               ← React entry point
│   └── index.css              ← Global styles + Tailwind
├── index.html
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── eslint.config.js
└── package.json
```

---

## লোকাল ডেভেলপমেন্ট

```bash
# ১. ডিপেন্ডেন্সি ইনস্টল
npm install

# ২. ডেভ সার্ভার চালু (http://localhost:5173)
npm run dev

# ৩. প্রোডাকশন বিল্ড
npm run build

# ৪. বিল্ড প্রিভিউ
npm run preview
```

---

## GitHub Actions CI/CD

### ১. `ci.yml` — Continuous Integration

**কখন চলে:** প্রতিটি `push` এবং `pull_request` এ (`main`, `develop`, `feature/**`)

| Job | কাজ |
|-----|-----|
| `install` | `npm ci` + `node_modules` cache |
| `lint` | ESLint চেক |
| `build` | Vite production build + artifact আপলোড |

```
Push/PR
  └─► install
        ├─► lint   (ESLint)
        └─► build  (Vite)  → dist artifact (7 দিন সংরক্ষিত)
```

---

### ২. `deploy-pages.yml` — GitHub Pages Deploy

**কখন চলে:** `main` branch এ merge হলে (বা manual trigger)

**সেটআপ স্টেপ:**
1. Repository → **Settings → Pages**
2. Source: **"GitHub Actions"** সিলেক্ট করো
3. (Sub-path deploy এর জন্য) **Settings → Secrets → Actions** এ যাও
4. `VITE_BASE_URL` secret যোগ করো, value: `/<repo-name>/` (যেমন `/routewise-tms/`)
5. Custom domain এর জন্য secret লাগবে না — `base: "/"` ডিফল্ট

```
Push to main
  └─► build → upload Pages artifact
        └─► deploy to GitHub Pages
              URL: https://<user>.github.io/<repo>/
```

---

### ৩. `release.yml` — Versioned Release

**কখন চলে:** version tag push করলে

```bash
# নতুন রিলিজ তৈরি করতে
git tag v1.0.0
git push origin v1.0.0
```

এটি স্বয়ংক্রিয়ভাবে:
- Production build করবে
- `dist/` ফোল্ডার zip করবে
- GitHub Release তৈরি করবে
- Changelog auto-generate করবে

---

## Repository Secrets

| Secret | কোথায় লাগে | মান |
|--------|------------|-----|
| `VITE_BASE_URL` | Pages + Release | `/routewise-tms/` (GitHub Pages sub-path) বা খালি রাখো |

**যোগ করার পথ:** Repository → Settings → Secrets and variables → Actions → New repository secret

---

## ফার্স্ট টাইম সেটআপ

```bash
# ১. এই ফোল্ডারটি একটি Git repo হিসেবে শুরু করো
git init
git add .
git commit -m "feat: initial project setup with CI/CD"

# ২. GitHub এ remote যোগ করো
git remote add origin https://github.com/<username>/routewise-tms.git

# ৩. Push করো
git push -u origin main
```

Push হলেই `ci.yml` স্বয়ংক্রিয়ভাবে চালু হবে।
