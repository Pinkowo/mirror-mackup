# Requirements: Mirror Makeup

**Defined:** 2026-06-05
**Core Value:** 消費者在 30 秒內看到「這個口紅 + 這個眼影」實際上臉的效果

## v1 Requirements

### Models

- [ ] **MOD-01**: 用戶可瀏覽並選擇 ≥ 3 張簽約模特基底照
- [ ] **MOD-02**: 每張模特顯示名稱、膚色標記（fair / medium / deep）

### Products

- [ ] **PROD-01**: 用戶可從口紅分類中選擇一個產品（≥ 5 款）
- [ ] **PROD-02**: 用戶可從眼影分類中選擇一個產品（≥ 5 款）
- [ ] **PROD-03**: 用戶可從粉底分類中選擇一個產品（≥ 3 款）
- [ ] **PROD-04**: 每個產品顯示名稱、品牌、色號、色塊預覽

### Generation

- [ ] **GEN-01**: 用戶點擊「Generate Look」後，≤ 30 秒內出現結果或明確錯誤訊息
- [ ] **GEN-02**: 系統組合選定產品的 prompt_description，透過 `/api/generate` proxy 呼叫 FAL.ai
- [ ] **GEN-03**: API key 不出現在任何前端 bundle 或 network request
- [ ] **GEN-04**: 每次生成記錄（model_id, product_ids, result_url, status）寫入資料庫
- [ ] **GEN-05**: 前端每 2 秒輪詢 `/api/generate/[id]` 直到 done 或 error

### Display

- [ ] **DISP-01**: 生成結果以 Before/After slider 展示（可拖動對比）
- [ ] **DISP-02**: Showcase 首頁展示 ≥ 6 張預生成高品質結果

### Infrastructure

- [ ] **INFRA-01**: 部署至 Vercel，有公開可存取的 URL
- [ ] **INFRA-02**: 資料庫（Vercel Postgres 或 Neon）儲存 Model / Product / Generation 三張資料表

## v2 Requirements

### User Experience

- **UX-01**: 用戶上傳自己的臉部照片試妝
- **UX-02**: 用戶帳號 + 歷史生成記錄頁面
- **UX-03**: 即時 AR 鏡頭試妝

### Business

- **BIZ-01**: B2B 品牌後台（品牌商管理模特、產品、生成配額）
- **BIZ-02**: 真實品牌產品授權整合
- **BIZ-03**: 電商購物車、結帳流程

## Out of Scope

| Feature | Reason |
|---------|--------|
| 用戶上傳臉部照片 | 品質不穩定，一週 demo 無法保證效果 |
| 真實品牌授權 | 面試 demo 用虛擬品牌即可 |
| B2B 後台 | 下一個 milestone |
| AR 鏡頭 | 技術複雜度超出一週範圍 |
| 用戶登入 | 無需帳號系統，降低複雜度 |
| 金流 | 非 MVP 功能 |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| MOD-01 | Phase 1 | Pending |
| MOD-02 | Phase 1 | Pending |
| PROD-01 | Phase 1 | Pending |
| PROD-02 | Phase 1 | Pending |
| PROD-03 | Phase 1 | Pending |
| PROD-04 | Phase 1 | Pending |
| INFRA-01 | Phase 1 | Pending |
| INFRA-02 | Phase 1 | Pending |
| GEN-01 | Phase 2 | Pending |
| GEN-02 | Phase 2 | Pending |
| GEN-03 | Phase 2 | Pending |
| GEN-04 | Phase 2 | Pending |
| GEN-05 | Phase 2 | Pending |
| DISP-01 | Phase 3 | Pending |
| DISP-02 | Phase 3 | Pending |

**Coverage:**
- v1 requirements: 15 total
- Mapped to phases: 15
- Unmapped: 0 ✓

---
*Requirements defined: 2026-06-05*
*Last updated: 2026-06-05 after initial definition*
