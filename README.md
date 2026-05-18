# Automated Invoice Generator for Freelancers

Smart invoice generator: enter client details and services, download a professional PDF invoice.

**Stack:** Next.js · Python · FastAPI · ReportLab · Vercel

## Project structure

```
invoice-generator/
├── frontend/          # Next.js UI (Vercel)
├── backend/           # FastAPI + ReportLab PDF API
└── vercel.json        # Routes /api/* → Python, /* → Next.js
```

## Run locally

### 1. Python API (terminal 1)

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
.venv/bin/uvicorn main:app --reload --port 8000
```

Use the venv’s `uvicorn` (or activate the venv first). If you see `No module named 'reportlab'`, you’re on system Python — run `pip install -r requirements.txt` again after `source .venv/bin/activate`.

### 2. Next.js app (terminal 2)

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The frontend proxies `/api/*` to the Python server in development.

## Deploy to Vercel

**Option A — Vercel website (recommended)**

1. Push this project to GitHub.
2. Go to [vercel.com/new](https://vercel.com/new) and import the repo.
3. Leave **Root Directory** empty (repo root, where `vercel.json` is).
4. Click **Deploy**. Your live URL will look like `https://your-project.vercel.app`.

**Option B — Vercel CLI**

```bash
cd invoice-generator
npx vercel login
npx vercel --prod
```

**Local dev env:** copy `frontend/.env.local.example` to `frontend/.env.local` so the UI talks to Python on port 8000. Do not set `NEXT_PUBLIC_API_URL` on Vercel (production uses `/api/generate` → Python automatically).

## API

`POST /api/generate` — JSON body with client, business, invoice meta, and `services` array (`description`, `qty`, `rate`). Returns a PDF file.
