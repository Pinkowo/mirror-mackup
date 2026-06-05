# Mirror Makeup

## What This Is

Mirror Makeup 是一個 B2C AI 試妝 web app，讓消費者在品牌簽約模特臉上自由組合化妝品（口紅、眼影、粉底），透過 FAL.ai 即時生成 AI 試妝照。這是 Mirror Mirror AI 服裝試穿平台的延伸產品，將同樣的「AI 取代棚拍」概念應用到化妝品市場。

## Core Value

消費者在 30 秒內看到「這個口紅 + 這個眼影」實際上臉的效果，而不是看色票。

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] 用戶可從簽約模特中選擇試妝對象
- [ ] 用戶可從產品目錄選擇口紅、眼影、粉底組合
- [ ] 系統透過 FAL.ai API 生成試妝結果圖
- [ ] 結果以 Before/After 形式展示
- [ ] API key 不暴露在前端
- [ ] Showcase 頁展示預生成精選作品
- [ ] 生成記錄儲存至資料庫
- [ ] 部署到 Vercel 有公開 URL

### Out of Scope

- 用戶上傳自己的臉部照片 — 一週內品質難以保證，後續 milestone
- 真實品牌授權與商業合作 — 面試 demo 用虛擬產品即可
- B2B 品牌後台 — 下一個商業擴展方向
- 即時 AR 鏡頭試妝 — 技術複雜度高，非 MVP 必需
- 用戶帳號系統 — 無需登入即可使用

## Context

- **背景**: Mirror Mirror AI 已在服裝市場驗證「AI 生成模特穿搭照」商業模式，本專案為化妝品市場延伸
- **用途**: 全端工程師面試 side project，一週完成
- **AI API**: FAL.ai `fal-ai/flux/dev/image-to-image` 或 `fal-ai/image-editing/realism`，$0.04/張
- **模特照片**: 預設 3-5 張高品質簽約模特基底照（不接受用戶上傳）
- **產品目錄**: 虛擬品牌，口紅 5 款、眼影 5 款、粉底 3 款，每款有 `prompt_description`

## Constraints

- **Timeline**: 7 天，面試前完成
- **Tech Stack**: Next.js 14 (App Router) + Vercel Postgres + FAL.ai + Vercel 部署
- **Budget**: Vercel 免費方案 + FAL.ai pay-per-use（demo 預算 < $5）
- **No Auth**: 無用戶登入，降低複雜度
- **No User Photo Upload**: 預設模特照片，品質可控

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| 預設模特而非用戶上傳 | 品質可控、工程量低，面試 demo 不會出現奇怪結果 | — Pending |
| FAL.ai 而非 ModiFace/Perfect Corp | 按次計費、無需合約、API 簡單，適合 side project | — Pending |
| FLUX-based 生成而非 Makeup Changer | Makeup Changer 只有 style preset，FLUX 可組合 prompt 實現產品對應色彩 | — Pending |
| 口紅 + 眼影（+ 粉底）三類 | 視覺效果最明顯，足以展示技術，粉底為高風險項 | — Pending |
| Next.js API routes 當 proxy | 保護 API key，同時展示全端能力 | — Pending |

---
*Last updated: 2026-06-05 after initialization*

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd:transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state
