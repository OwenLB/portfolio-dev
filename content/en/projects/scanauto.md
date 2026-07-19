---
order: 3
title: 'ScanAuto'
type: "Web app"
description: "AI-powered used-vehicle analysis SaaS — multi-step Claude pipeline with SSE streaming, Supabase auth, BYOK encryption, and a Chrome extension."
git: [ "Git Repository", "https://github.com/OwenLB/scanauto" ]
web: [ "Visit app", "https://scanauto.netlify.app" ]
stack: [
  "React",
  "Tailwind CSS",
  "Django",
  "Claude API",
  "Supabase",
  "Firecrawl",
  "Chrome Extension MV3"
]
updated: '2026-07-17'
---

**Knowing in under 60 seconds whether a used-car listing is honest or a trap** — a tool born from my own buyer's frustration, turning a leboncoin URL into a full analysis report.

## What's the context behind ScanAuto?

ScanAuto is a full-stack SaaS application that generates comprehensive analysis reports for used-vehicle listings (cars and motorcycles). The user pastes a leboncoin URL or raw text and receives within 60 seconds: a global score, engine reliability analysis, 5-year cost projection, and a data-backed negotiation strategy. The project started as a personal need: while searching for my own used car, I realised private buyers have no tooling to quickly assess whether a listing is honest or a trap.

## What's the tech stack?

- **React 18 + Vite** — SPA with hash-based routing (no server required), lazy-loaded pages, `useReducer` for analysis state management. Vite was chosen for its fast dev server and straightforward config compared to CRA.
- **Tailwind CSS 3 + CSS variables** — Monochrome color system defined as CSS variables (`--bg`, `--surface`, `--accent`…), dark/light switchable without JavaScript. Typography: Space Grotesk (display) + Inter (body).
- **Django 4.2 + DRF** — Stateless backend: no local database (`DATABASES = {}`), no migrations. Deliberate choice for a backend focused purely on API orchestration.
- **Supabase** — JWT auth + PostgreSQL with RLS (Row-Level Security). Every table filters on `user_id = auth.uid()` at the database layer — user isolation without application-level logic.
- **Anthropic Claude API (anthropic==0.40.0)** — Haiku 4.5 for fast/simpler steps (extraction, negotiation, practical info), Sonnet 4.6 for analytical depth (scoring, maintenance costs). Ephemeral prompt caching on all system prompts.
- **Firecrawl** — Markdown extraction from listing URLs. Handles anti-bot protections without manual HTML parsing; the resulting Markdown is injected directly into Claude.
- **Gunicorn** — 2 workers, 4 threads, 300s timeout for long SSE streams.
- **Chrome Extension MV3** — Content script on leboncoin.fr, side panel, service worker. No build step — plain JavaScript.

## Notable Technical Points

- **5-step pipeline with Python parallelism**: R1 (extraction) → R2+R5 in parallel via `threading.Thread` + `Queue` (scoring + practical info) → R3 (maintenance costs) → R4 (negotiation). Python's GIL doesn't block network I/O: the gain is real (~30% reduction in total pipeline time).

- **Server-side computations before any LLM call**: `km_per_year`, `vehicle_age`, `market_positioning_percentage`, kilometer projections at 2 and 5 years — all computed in Python and injected as immutable facts into the prompts. Eliminates LLM arithmetic errors on financially critical values.

- **Progressive SSE streaming**: each completed step emits an `event: r1|r2|…|complete` via SSE. The frontend dispatches each event into a reducer and reveals report sections incrementally. The user watches the report build in real time without waiting for the full pipeline.

- **Context slimming for R3 and R4**: these steps receive only the relevant fields from R1/R2 (not the full JSON), preventing token bloat on Sonnet. The savings are approximately 30–40% of input tokens on those two calls.

- **Encrypted BYOK (Bring Your Own Key)**: users' Anthropic keys are encrypted server-side with Fernet (Python `cryptography` lib), decrypted in memory only at call time. The backend never persists the key in plaintext; users keep full control over their quotas.

- **Chrome Extension MV3 — JSON-LD extraction**: the content script parses `@type:Vehicle` JSON-LD on leboncoin.fr first (reliable structured data), with 4 DOM fallback strategies for fields absent from JSON-LD (criteria, photos, description). Data flows through `chrome.storage.session` to the side panel, then to the app via URL prefill (`#/?prefill=<JSON>`).

- **Graceful degradation**: R3 and R4 can fail (timeout, API error) without blocking the report. The frontend displays a localized error state on the affected section; all previously completed sections remain visible.

## What I Built / Learned

The core challenge was designing the orchestration pipeline: managing step dependencies, controlled parallelism, timeouts, and partial error propagation — all while maintaining smooth client-side streaming. This forced me to treat each prompt as a contractual interface: strict inputs, schematized JSON outputs, explicit business rules to prevent hallucinations on financial data.

---

## Diagrams

### Global Architecture

![Global Architecture](/diagrams/scanauto/01-architecture-globale.svg)

---

### Analysis Pipeline (Sequence)

![Analysis Pipeline](/diagrams/scanauto/02-pipeline-sequence.svg)

---

### Chrome Extension → App Flow

![Chrome Extension Flow](/diagrams/scanauto/03-extension-chrome-flow.svg)

---

### Model Selection per Step

![Model Selection](/diagrams/scanauto/04-model-selection.svg)

---

### AI Pipeline Dependencies

The analysis runs on 5 Claude calls chained and partially parallelised. Step dependencies are strict: each call only receives data from the steps it actually depends on.

Before any LLM call, the server pre-computes `km/year`, `vehicle age`, and `listing age` — injected as immutable facts to prevent arithmetic errors on the model side.

**R1 — Extraction (Haiku 4.5)** — First call, no dependencies. The raw listing is sent as-is. Claude extracts structured data: vehicle identification, mileage, options, seller signals, missing information.

**R2 + R5 — Scoring & Practical Info (Sonnet 4.6 + Haiku 4.5, parallel)** — Both depend on R1 only. As soon as R1 completes, both calls fire simultaneously via independent Python threads. R2 computes the overall score, market positioning, and engine reliability analysis. R5 handles regulatory info in parallel: Crit'Air, registration, insurance estimate, fuel consumption.

**R3 — Costs & Warnings (Sonnet 4.6)** — Depends on R1 + R2. Receives a slimmed context (relevant fields only, not full JSONs) to limit token usage on Sonnet. Produces upcoming repairs, 5-year cost projection, and a model-specific inspection checklist.

**R4 — Negotiation (Haiku 4.5)** — Last call, minimal context: vehicle identity (R1), price and seller signals (R2), risk summary (R3), and the server-computed `market_positioning_percentage`. Generates a justified target price, a neutral seller message, and a depreciation projection at 2 and 5 years.

Each result is streamed via SSE as soon as it's ready — the report builds progressively on the frontend. If R3 or R4 fail, the report still renders with a localised error state on the affected section.

![AI Pipeline](/diagrams/scanauto/05-pipeline-ia.svg)

---

### BYOK Security Architecture

![BYOK Security](/diagrams/scanauto/06-byok-security.svg)
