# Roadmap: Mirror Makeup

**Phases:** 3 | **Requirements:** 15 | **Mode:** Vertical MVP

## Overview

| # | Phase | Goal | Requirements | Success Criteria |
|---|-------|------|--------------|------------------|
| 1 | Foundation | Set up the full technical skeleton — Next.js project, database schema with seed data, model/product browsing UI, and FAL.ai API proxy | MOD-01, MOD-02, PROD-01, PROD-02, PROD-03, PROD-04, INFRA-01, INFRA-02 | 4 |
| 2 | Core Generation Flow | Wire the try-on generation pipeline end-to-end so a user can select a model + products, trigger AI generation, and see a status-tracked result | GEN-01, GEN-02, GEN-03, GEN-04, GEN-05 | 4 |
| 3 | Display & Polish | Add Before/After slider result display, populate the Showcase page with pre-generated looks, and ship to Vercel with a public URL | DISP-01, DISP-02 | 3 |

## Phase Details

### Phase 1: Foundation
**Goal:** As a 消費者, I want to 選擇模特和產品組合以準備試妝, so that 我可以找到想試的產品組合，準備進行 AI 試妝.
**Mode:** mvp
**Days:** 1–2
**Requirements:** MOD-01, MOD-02, PROD-01, PROD-02, PROD-03, PROD-04, INFRA-01, INFRA-02
**Success Criteria:**
1. Visiting the app shows ≥ 3 model cards, each displaying the model's name and skin-tone label (fair / medium / deep).
2. Users can browse lipstick (≥ 5), eyeshadow (≥ 5), and foundation (≥ 3) product listings, each showing name, brand, shade code, and a color swatch.
3. The database contains Model, Product, and Generation tables and is reachable from the Next.js app.
4. A POST to `/api/generate` returns a valid response (or queued job ID) without exposing the FAL.ai key in any network request.

---

### Phase 2: Core Generation Flow
**Goal:** Deliver the full try-on interaction loop — a user selects a model and product combination, clicks "Generate Look", and sees a polling-tracked result within 30 seconds.
**Mode:** mvp
**Days:** 3–4
**Requirements:** GEN-01, GEN-02, GEN-03, GEN-04, GEN-05
**Success Criteria:**
1. Clicking "Generate Look" after selecting a model and at least one product triggers AI generation and shows a loading indicator; a result image or a clear error message appears within 30 seconds.
2. The FAL.ai API key does not appear in any frontend bundle or browser network request at any point.
3. Every generation attempt creates a database record containing model_id, product_ids, result_url, and status.
4. The frontend polls `/api/generate/[id]` every 2 seconds and automatically updates the UI when the status transitions to done or error.

---

### Phase 3: Display & Polish
**Goal:** Complete the user-facing experience with an interactive Before/After comparison slider and a Showcase page of pre-generated looks, then deploy the finished app to Vercel.
**Mode:** mvp
**Days:** 5–7
**Requirements:** DISP-01, DISP-02
**Success Criteria:**
1. After a generation completes, users can drag a slider to compare the original model photo against the AI try-on result side by side.
2. The Showcase page displays ≥ 6 pre-generated high-quality looks without requiring any user interaction to trigger generation.
3. The app is live at a public Vercel URL accessible from any browser.

---
*Roadmap created: 2026-06-05*
