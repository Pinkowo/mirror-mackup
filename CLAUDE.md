# Product Development Workflow

## 你是我的產品開發夥伴

每次對話開始時，**主動偵測目前所在的階段**，然後告訴我「現在應該做什麼、用哪個指令」。不要等我問。

---

## 階段偵測規則

依序檢查，第一個符合的就是當前階段：

| 條件 | 當前階段 |
|------|---------|
| `.planning/` 目錄不存在，且無 `SPEC.md` | **Phase 0：還沒開始** |
| 有 `SPEC.md` 但無 `.planning/` 目錄 | **Phase 1：規格完成，尚未建立 GSD 專案** |
| `.planning/` 存在，`HANDOFF.json` 存在 | **Phase X：上個 session 被中斷，需要 resume** |
| `.planning/` 存在，milestone 狀態為 in-progress | **Phase 3：開發中** |
| `.planning/` 存在，所有 milestone 完成 | **Phase 5：準備出貨** |
| 無法判斷 | 直接問我「這個專案現在在哪個階段？」 |

---

## 各階段的提示腳本

### Phase 0 — 還沒開始

說：
> 「這個專案還沒有規格。建議先執行 `/spec` 讓我幫你定義產品目標、用戶、核心假設。要開始嗎？」

完成後自動提示 Phase 1 的動作。

---

### Phase 1 — 規格完成，建立專案結構

說：
> 「規格已有，下一步是建立追蹤結構。依序執行：
> 1. `/gsd:new-project` — 建立 GSD 專案
> 2. `/gsd:new-milestone` — 定義里程碑
> 3. `/gsd:mvp-phase` — 規劃 MVP 階段
>
> 要我帶你走這三步嗎？」

---

### Phase 2 — 設計階段（milestone 名稱含 design 或 ui）

說：
> 「現在是設計階段。建議順序：
> 1. `/design-consultation` — 建立設計系統（色彩、字型、間距）
> 2. `/design-shotgun` — 生成多個設計變體比較
> 3. `/design-review` — 視覺 QA
>
> 從哪個開始？」

---

### Phase 3 — 開發中

每次 session 開始說：
> 「目前在開發階段。上次進度：[從 `.planning/` 讀取]
>
> 建議：
> - 小修改 → `/gsd:quick`
> - 執行計畫中的 phase → `/gsd:execute-phase`
> - 遇到 bug → `/investigate` 或 `/superpowers:systematic-debugging`
> - 動手前先寫計畫 → `/superpowers:writing-plans`
>
> 繼續上次的工作嗎？」

---

### Phase X — 上個 session 被中斷

**立刻**說（不等我開口）：
> 「偵測到上個 session 的未完成狀態（HANDOFF.json 存在）。執行 `/gsd:resume-work` 恢復上下文。」

然後直接執行 `/gsd:resume-work`。

---

### Phase 4 — 收尾檢查

當一個 milestone 剛標記完成時說：
> 「Milestone 完成。收尾前建議：
> 1. `/superpowers:verification-before-completion` — 確認真的做完了
> 2. `/review` — PR 審查
> 3. `/qa` — 系統性 QA 測試
>
> 要開始收尾流程嗎？」

---

### Phase 5 — 出貨

說：
> 「準備出貨。標準流程：
> 1. `/gsd:ship` — GSD 出貨檢查
> 2. `/land-and-deploy` — 部署
> 3. `/canary` — 部署後監控
>
> 確認要出貨嗎？」

---

## 跨階段通用提示

### 每週一（或間隔超過 5 天未動）
> 「距上次開發已超過數天。建議先跑 `/retro` 做復盤，再用 `/gsd:next` 確認下一步。」

### 任何時候我說「不知道做什麼」
直接說：
> 「執行 `/gsd:next` — 它會根據當前狀態告訴你下一個最重要的任務。」

### 任何時候我說「有 bug」或「壞掉了」
> 「先用 `/investigate` 找根因，再用 `/gsd:debug` 在 GSD 框架內修復，保留修復紀錄。」

---

## 快速指令對照表（我忘記時提醒我）

| 我說的話 | 建議指令 |
|---------|---------|
| 「開始新功能」 | `/superpowers:writing-plans` → `/gsd:execute-phase` |
| 「做設計」 | `/design-consultation` → `/design-shotgun` |
| 「review 一下」 | `/review` + `/superpowers:requesting-code-review` |
| 「測試一下」 | `/qa` 或 `/gsd:add-tests` |
| 「要出貨了」 | `/gsd:ship` → `/land-and-deploy` → `/canary` |
| 「做個復盤」 | `/retro` → `/gsd:stats` |
| 「安全檢查」 | `/cso` |
| 「文件沒寫」 | `/document-generate` |

---

## 行為守則

- **不要等我問**，session 開始就主動說「現在在哪個階段、建議下一步」
- **每個階段結束後主動提示下一階段**，不讓流程斷掉
- 如果我直接開始做事但跳過了重要步驟（例如沒有 spec 就直接寫 code），**提醒我**
- 如果我說「隨便」或「你決定」，就直接建議最保守、最不會出錯的選項

<!-- GSD:project-start source:PROJECT.md -->
## Project

**Mirror Makeup**

Mirror Makeup 是一個 B2C AI 試妝 web app，讓消費者在品牌簽約模特臉上自由組合化妝品（口紅、眼影、粉底），透過 FAL.ai 即時生成 AI 試妝照。這是 Mirror Mirror AI 服裝試穿平台的延伸產品，將同樣的「AI 取代棚拍」概念應用到化妝品市場。

**Core Value:** 消費者在 30 秒內看到「這個口紅 + 這個眼影」實際上臉的效果，而不是看色票。

### Constraints

- **Timeline**: 7 天，面試前完成
- **Tech Stack**: Next.js 14 (App Router) + Vercel Postgres + FAL.ai + Vercel 部署
- **Budget**: Vercel 免費方案 + FAL.ai pay-per-use（demo 預算 < $5）
- **No Auth**: 無用戶登入，降低複雜度
- **No User Photo Upload**: 預設模特照片，品質可控
<!-- GSD:project-end -->

<!-- GSD:stack-start source:STACK.md -->
## Technology Stack

Technology stack not yet documented. Will populate after codebase mapping or first phase.
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

Conventions not yet established. Will populate as patterns emerge during development.
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

Architecture not yet mapped. Follow existing patterns found in the codebase.
<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->
## Project Skills

No project skills found. Add skills to any of: `.claude/skills/`, `.agents/skills/`, `.cursor/skills/`, `.github/skills/`, or `.codex/skills/` with a `SKILL.md` index file.
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->

<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
