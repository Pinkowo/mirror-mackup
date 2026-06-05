---
spec_issue_number:
spec_issue_url:
spec_filed_at: 2026-06-05T23:49:56Z
spec_branch: unknown
spec_plan_mode: inactive
spec_executed: false
spec_worktree_path:
---

# Mirror Makeup — AI 化妝品試妝平台 MVP

## Context

Mirror Mirror AI 已在服裝市場驗證「AI 生成模特穿搭照」的商業模式，服務客戶為服裝品牌商。化妝品市場面臨相同痛點：每個產品色號組合需要獨立棚拍，成本高、週期長。本 MVP 以 B2C 消費者端切入，驗證「AI 試妝照生成」核心技術的可行性，作為延伸業務的技術 proof-of-concept。

## Current State

全新專案，無既有程式碼庫。技術棧尚未初始化。

面試背景：此為 Mirror Mirror AI 全端工程師職位面試前的 side project，一週完成。

## Proposed Change

建立一個 B2C 試妝 web app，讓用戶在品牌簽約模特臉上，自由組合口紅、眼影、粉底，透過 FAL.ai API 即時生成 AI 試妝照，並以 Before/After 方式展示結果。

### Implementation Details

**技術棧**
- Framework: Next.js 14 (App Router)
- 部署: Vercel（免費方案）
- 資料庫: Vercel Postgres 或 Neon（免費方案）
- ORM: Prisma
- AI API: FAL.ai — `fal-ai/flux/dev/image-to-image` 或 `fal-ai/image-editing/realism`
- API key 保護: Next.js API routes 作為 proxy，key 存 Vercel 環境變數

**資料模型**

```sql
Model {
  id          String   @id
  name        String
  image_url   String
  skin_tone   String   -- e.g. "fair", "medium", "deep"
  description String
}

Product {
  id                  String   @id
  name                String
  brand               String
  category            String   -- "lipstick" | "eyeshadow" | "foundation"
  color_hex           String   -- e.g. "#C4273E"
  price               Float
  prompt_description  String   -- e.g. "bright coral-red satin lipstick"
}

Generation {
  id          String   @id @default(cuid())
  model_id    String
  product_ids String[] -- array of selected product IDs
  prompt      String   -- composed prompt sent to FAL.ai
  result_url  String?
  status      String   -- "pending" | "processing" | "done" | "error"
  created_at  DateTime @default(now())
}
```

**API 端點**

| Method | Path | 說明 |
|--------|------|------|
| GET | `/api/models` | 回傳所有簽約模特 |
| GET | `/api/products?category=lipstick` | 回傳產品目錄，可按類別篩選 |
| POST | `/api/generate` | 接收 `{ model_id, product_ids[] }`，建立 Generation 記錄，呼叫 FAL.ai，回傳 `{ generation_id }` |
| GET | `/api/generate/[id]` | 輪詢生成狀態，回傳 `{ status, result_url }` |

**Prompt 組合邏輯（`/api/generate`）**

```
"Professional beauty portrait of a model wearing [product.prompt_description for each selected product], 
high-end cosmetics photography, studio lighting, sharp focus, photorealistic"
```

加上 negative prompt：`"cartoon, illustration, deformed, unrealistic skin, bad makeup"`

**前端頁面結構**

```
/                  Showcase 頁（預生成精選結果 grid）
/try-on            試妝互動頁
  ├── Step 1: 選模特（3-5 張卡片）
  ├── Step 2: 選產品（口紅/眼影/粉底各一個）
  ├── Step 3: 生成按鈕 + loading 狀態
  └── Step 4: Before/After slider 結果展示
```

**生成流程（前端）**

1. 用戶完成選擇後點「Generate Look」
2. POST `/api/generate` → 取得 `generation_id`
3. 每 2 秒 GET `/api/generate/[id]`
4. status 變 `done` → 顯示 Before/After slider
5. status 變 `error` → 顯示錯誤訊息 + 重試按鈕

## Acceptance Criteria

1. 用戶可從 ≥ 3 張模特中選擇一張
2. 用戶可從口紅、眼影、粉底各選至少 3 個產品
3. 點擊「Generate Look」後，≤ 30 秒出現結果圖或明確錯誤訊息
4. 結果以 Before/After slider 展示，可拖動對比
5. 任何前端 bundle 或 network request 中不含 FAL.ai API key
6. Showcase 首頁展示 ≥ 6 張預生成的高品質結果
7. 部署至 Vercel，有公開可存取的 URL
8. 每次生成記錄（model_id, product_ids, result_url, status）寫入資料庫
9. `/api/generate/[id]` 可查詢歷史生成結果

## Testing Plan

| Layer | What | Count |
|-------|------|-------|
| Unit | prompt 組合函式，確認不同產品組合產生正確 prompt | +3 |
| Integration | POST /api/generate → DB 寫入 → FAL.ai 呼叫 → status 更新 | +2 |
| E2E (manual) | 完整流程：選模特 → 選產品 → 生成 → 看結果 | demo script |

## Rollback Plan

純前端 + Vercel 部署，rollback = 重新部署上一個 commit。資料庫只儲存生成記錄，無用戶資料，無需資料遷移回滾。

## Effort Estimate

| 項目 | 時間 |
|------|------|
| Day 1: 專案初始化、DB schema、seed data（模特 + 產品） | 1 天 |
| Day 2: FAL.ai 串接、prompt 工程、/api/generate 完成 | 1 天 |
| Day 3: 試妝 UI（模特選擇 + 產品目錄） | 1 天 |
| Day 4: Before/After slider、輪詢邏輯、錯誤處理 | 1 天 |
| Day 5: Showcase 頁、預生成 8 張精選圖 | 1 天 |
| Day 6: UI 打磨、RWD、Vercel 部署 | 1 天 |
| Day 7: Buffer — demo script、壓力測試、面試準備 | 1 天 |
總計：7 天

## Files Reference

| 路徑 | 內容 |
|------|------|
| `prisma/schema.prisma` | Model / Product / Generation schema |
| `app/api/generate/route.ts` | POST handler，FAL.ai proxy |
| `app/api/generate/[id]/route.ts` | GET handler，輪詢結果 |
| `app/api/models/route.ts` | GET 模特列表 |
| `app/api/products/route.ts` | GET 產品目錄 |
| `app/try-on/page.tsx` | 試妝互動頁主體 |
| `app/page.tsx` | Showcase 首頁 |
| `lib/fal.ts` | FAL.ai client wrapper + prompt 組合邏輯 |
| `prisma/seed.ts` | 模特 + 產品 seed data |

## Out of Scope

- 用戶上傳自己的臉部照片
- 真實品牌授權或商業合作
- 金流、購物車、結帳
- B2B 品牌後台管理介面
- 即時 AR 鏡頭試妝
- 用戶帳號、登入、歷史記錄頁面

## Related

- Mirror Mirror AI 原始服裝試穿產品（商業模式參考）
- FAL.ai image-editing API：https://fal.ai/models/fal-ai/image-editing/realism/api
