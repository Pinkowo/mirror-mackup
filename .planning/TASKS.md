# Mirror Makeup — Autonomous Task Runner

## 規則（每個排程 agent 必須讀這段）

1. 找第一個 `[ ]` 的 task，執行它，改成 `[x]`
2. **執行前先召喚 task 標注的 skill**（用 Skill tool）
3. 執行完必須 `git add -A && git commit -m "feat: T0X description"`
4. 若遇到 blocker，append 到 `.planning/BLOCKERS.md`，然後跳到下一個 task
5. **一次只做一個 task，完成後停止**
6. Working directory 永遠是 `/Users/pink/Desktop/Projects/mirror-mackup`

## Skill 說明

| Skill | 何時用 |
|-------|--------|
| `andrej-karpathy-skills:karpathy-guidelines` | 每次開始前，提醒不要過度工程化 |
| `gsd:quick` | 單一明確任務（大部分 task） |
| `careful` | 任何會刪除或覆蓋現有檔案的操作 |
| `land-and-deploy` | T14 部署設定 |

## 環境變數位置

`.env.local`（如果不存在就建立）：
```
FAL_KEY=mock
DATABASE_URL="file:./dev.db"
```

---

## Task List

- [x] T00 — Project initialized (Next.js not yet, only planning files exist)
- [x] T01 — Next.js 14 project init
- [ ] T02 — Prisma schema + SQLite setup
- [ ] T03 — Seed data script
- [ ] T04 — API routes: /api/models + /api/products
- [ ] T05 — Model selection UI
- [ ] T06 — Product catalog UI
- [ ] T07 — POST /api/generate (mock mode)
- [ ] T08 — GET /api/generate/[id] (polling)
- [ ] T09 — Try-on page: model + product selection + generate button
- [ ] T10 — Polling logic + loading state + error handling
- [ ] T11 — Before/After slider component
- [ ] T12 — Showcase page
- [ ] T13 — UI polish + RWD
- [ ] T14 — Vercel deploy config + env example

---

## Task Details

### T01 — Next.js 14 project init
**Skill:** `andrej-karpathy-skills:karpathy-guidelines` 然後 `gsd:quick`

Working dir: `/Users/pink/Desktop/Projects/mirror-mackup`

Run:
```bash
npx create-next-app@14 . --typescript --tailwind --eslint --app --no-src-dir --import-alias "@/*" --yes
```

If it asks about existing files (CLAUDE.md, SPEC.md etc), answer yes to continue / keep existing files.

After init, create `.env.local`:
```
FAL_KEY=mock
DATABASE_URL="file:./dev.db"
```

Commit message: `feat: T01 Next.js 14 init with TypeScript + Tailwind`

---

### T02 — Prisma schema + SQLite setup
**Skill:** `careful`（會寫入 schema）然後 `gsd:quick`

```bash
npm install prisma @prisma/client
npx prisma init --datasource-provider sqlite
```

Replace contents of `prisma/schema.prisma` with:
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model Model {
  id          String       @id @default(cuid())
  name        String
  imageUrl    String
  skinTone    String
  description String       @default("")
  generations Generation[]
  createdAt   DateTime     @default(now())
}

model Product {
  id                String   @id @default(cuid())
  name              String
  brand             String
  category          String
  colorHex          String
  price             Float    @default(0)
  promptDescription String
  createdAt         DateTime @default(now())
}

model Generation {
  id         String   @id @default(cuid())
  modelId    String
  model      Model    @relation(fields: [modelId], references: [id])
  productIds String
  prompt     String
  resultUrl  String?
  status     String   @default("pending")
  createdAt  DateTime @default(now())
}
```

Then:
```bash
npx prisma generate
npx prisma db push
```

Create `lib/prisma.ts`:
```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

Commit message: `feat: T02 Prisma schema with SQLite`

---

### T03 — Seed data script
**Skill:** `gsd:quick`

Create `prisma/seed.ts`:

```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Clear existing data
  await prisma.generation.deleteMany()
  await prisma.product.deleteMany()
  await prisma.model.deleteMany()

  // Models — placeholder images (user will replace these)
  // Image format: JPG or WebP, portrait 4:5 ratio (e.g. 800×1000px)
  // Replace these files in public/models/ folder
  await prisma.model.createMany({
    data: [
      {
        id: 'model-1',
        name: 'Aria',
        imageUrl: '/models/model-1.jpg',
        skinTone: 'fair',
        description: 'Fair skin, versatile look',
      },
      {
        id: 'model-2',
        name: 'Maya',
        imageUrl: '/models/model-2.jpg',
        skinTone: 'medium',
        description: 'Medium skin, warm undertones',
      },
      {
        id: 'model-3',
        name: 'Zara',
        imageUrl: '/models/model-3.jpg',
        skinTone: 'deep',
        description: 'Deep skin, cool undertones',
      },
    ],
  })

  // Lipsticks
  await prisma.product.createMany({
    data: [
      {
        id: 'lip-1',
        name: 'Ruby Kiss',
        brand: 'MirrorLab',
        category: 'lipstick',
        colorHex: '#C41E3A',
        price: 28,
        promptDescription: 'bold ruby red satin lipstick, classic red lip',
      },
      {
        id: 'lip-2',
        name: 'Nude Velvet',
        brand: 'MirrorLab',
        category: 'lipstick',
        colorHex: '#C4956A',
        price: 26,
        promptDescription: 'soft nude beige matte lipstick, natural everyday lip color',
      },
      {
        id: 'lip-3',
        name: 'Berry Crush',
        brand: 'MirrorLab',
        category: 'lipstick',
        colorHex: '#8B1A4A',
        price: 28,
        promptDescription: 'deep berry plum glossy lipstick, rich jewel tone lip',
      },
      {
        id: 'lip-4',
        name: 'Coral Reef',
        brand: 'MirrorLab',
        category: 'lipstick',
        colorHex: '#FF6B6B',
        price: 26,
        promptDescription: 'vibrant coral orange-red lipstick, fresh summer lip color',
      },
      {
        id: 'lip-5',
        name: 'Rose Petal',
        brand: 'MirrorLab',
        category: 'lipstick',
        colorHex: '#E8A0B0',
        price: 24,
        promptDescription: 'delicate soft pink rose lipstick, feminine and romantic lip',
      },
    ],
  })

  // Eyeshadows
  await prisma.product.createMany({
    data: [
      {
        id: 'eye-1',
        name: 'Smoky Noir',
        brand: 'MirrorLab',
        category: 'eyeshadow',
        colorHex: '#1C1C1E',
        price: 38,
        promptDescription: 'dramatic smoky black eyeshadow, intense dark smoky eye look',
      },
      {
        id: 'eye-2',
        name: 'Bronze Goddess',
        brand: 'MirrorLab',
        category: 'eyeshadow',
        colorHex: '#CD7F32',
        price: 36,
        promptDescription: 'warm bronze copper metallic eyeshadow, shimmery golden bronze eye',
      },
      {
        id: 'eye-3',
        name: 'Rose Gold Dream',
        brand: 'MirrorLab',
        category: 'eyeshadow',
        colorHex: '#B76E79',
        price: 36,
        promptDescription: 'rose gold pink shimmer eyeshadow, soft glowy romantic eye look',
      },
      {
        id: 'eye-4',
        name: 'Ocean Depth',
        brand: 'MirrorLab',
        category: 'eyeshadow',
        colorHex: '#1B4F72',
        price: 38,
        promptDescription: 'deep navy blue matte eyeshadow, dramatic navy blue eye look',
      },
      {
        id: 'eye-5',
        name: 'Earth & Stone',
        brand: 'MirrorLab',
        category: 'eyeshadow',
        colorHex: '#8B6914',
        price: 34,
        promptDescription: 'natural warm brown taupe eyeshadow, everyday neutral eye look',
      },
    ],
  })

  // Foundations
  await prisma.product.createMany({
    data: [
      {
        id: 'found-1',
        name: 'Porcelain Veil',
        brand: 'MirrorLab',
        category: 'foundation',
        colorHex: '#F5E6D3',
        price: 48,
        promptDescription: 'light porcelain foundation, flawless fair skin with natural finish',
      },
      {
        id: 'found-2',
        name: 'Golden Hour',
        brand: 'MirrorLab',
        category: 'foundation',
        colorHex: '#C68642',
        price: 48,
        promptDescription: 'medium golden beige foundation, warm natural skin with dewy finish',
      },
      {
        id: 'found-3',
        name: 'Mahogany Glow',
        brand: 'MirrorLab',
        category: 'foundation',
        colorHex: '#7B3F00',
        price: 48,
        promptDescription: 'deep rich mahogany foundation, luminous deep skin with satin finish',
      },
    ],
  })

  console.log('✓ Seed complete: 3 models, 5 lipsticks, 5 eyeshadows, 3 foundations')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
```

Add to `package.json` (under "scripts" or add "prisma" section):
```json
"prisma": {
  "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
}
```

Install ts-node:
```bash
npm install -D ts-node
```

Run seed:
```bash
npx prisma db seed
```

Also create `public/models/` directory with placeholder files:
```bash
mkdir -p public/models
```

Create a placeholder SVG for each model (user will replace with real photos):
Write `public/models/model-1.jpg` placeholder notice file at `public/models/README.md`:
```markdown
# Model Photos

Replace these files with actual portrait photos:

- `model-1.jpg` — Aria (fair skin) — portrait, 4:5 ratio, min 800×1000px, JPG or WebP
- `model-2.jpg` — Maya (medium skin) — portrait, 4:5 ratio, min 800×1000px, JPG or WebP  
- `model-3.jpg` — Zara (deep skin) — portrait, 4:5 ratio, min 800×1000px, JPG or WebP

Keep filenames exactly as above. After replacing, run `/gsd:quick` to regenerate showcase images.
```

For the placeholder images themselves, create simple colored placeholder PNGs using Next.js image placeholder approach. In the seed, imageUrl is `/models/model-X.jpg` — if the file doesn't exist, Next.js Image will show a broken image, which is fine for now.

Commit message: `feat: T03 seed data (3 models + 13 products)`

---

### T04 — API routes: /api/models + /api/products
**Skill:** `gsd:quick`

Create `app/api/models/route.ts`:
```typescript
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const models = await prisma.model.findMany({
      orderBy: { name: 'asc' },
    })
    return NextResponse.json(models)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch models' }, { status: 500 })
  }
}
```

Create `app/api/products/route.ts`:
```typescript
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')

  try {
    const products = await prisma.product.findMany({
      where: category ? { category } : undefined,
      orderBy: { name: 'asc' },
    })
    return NextResponse.json(products)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}
```

Commit message: `feat: T04 API routes for models and products`

---

### T05 — Model selection UI
**Skill:** `gsd:quick`

Create `components/ModelCard.tsx`:
```typescript
'use client'

import Image from 'next/image'

interface Model {
  id: string
  name: string
  imageUrl: string
  skinTone: string
  description: string
}

interface ModelCardProps {
  model: Model
  selected: boolean
  onSelect: (id: string) => void
}

export function ModelCard({ model, selected, onSelect }: ModelCardProps) {
  return (
    <button
      onClick={() => onSelect(model.id)}
      className={`relative rounded-2xl overflow-hidden border-2 transition-all duration-200 ${
        selected
          ? 'border-rose-400 shadow-lg shadow-rose-100 scale-[1.02]'
          : 'border-transparent hover:border-rose-200'
      }`}
    >
      <div className="relative aspect-[4/5] bg-neutral-100">
        <Image
          src={model.imageUrl}
          alt={model.name}
          fill
          className="object-cover"
          onError={(e) => {
            // fallback to placeholder color if image missing
            e.currentTarget.style.display = 'none'
          }}
        />
        <div className="absolute inset-0 bg-neutral-200 flex items-center justify-center text-neutral-400 text-sm">
          {model.name}
        </div>
      </div>
      <div className="p-3 bg-white text-left">
        <p className="font-medium text-sm text-neutral-900">{model.name}</p>
        <p className="text-xs text-neutral-500 capitalize">{model.skinTone} skin</p>
      </div>
      {selected && (
        <div className="absolute top-2 right-2 w-6 h-6 bg-rose-400 rounded-full flex items-center justify-center">
          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
      )}
    </button>
  )
}
```

Create `components/ModelSelector.tsx`:
```typescript
'use client'

import { useEffect, useState } from 'react'
import { ModelCard } from './ModelCard'

interface Model {
  id: string
  name: string
  imageUrl: string
  skinTone: string
  description: string
}

interface ModelSelectorProps {
  selectedId: string | null
  onSelect: (id: string) => void
}

export function ModelSelector({ selectedId, onSelect }: ModelSelectorProps) {
  const [models, setModels] = useState<Model[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/models')
      .then((r) => r.json())
      .then((data) => { setModels(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-3 gap-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="aspect-[4/5] rounded-2xl bg-neutral-100 animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-3 gap-3">
      {models.map((model) => (
        <ModelCard
          key={model.id}
          model={model}
          selected={selectedId === model.id}
          onSelect={onSelect}
        />
      ))}
    </div>
  )
}
```

Commit message: `feat: T05 model selection UI components`

---

### T06 — Product catalog UI
**Skill:** `gsd:quick`

Create `components/ProductChip.tsx`:
```typescript
'use client'

interface Product {
  id: string
  name: string
  brand: string
  category: string
  colorHex: string
  price: number
}

interface ProductChipProps {
  product: Product
  selected: boolean
  onSelect: (id: string) => void
}

export function ProductChip({ product, selected, onSelect }: ProductChipProps) {
  return (
    <button
      onClick={() => onSelect(product.id)}
      className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-left transition-all duration-150 ${
        selected
          ? 'border-rose-400 bg-rose-50 shadow-sm'
          : 'border-neutral-200 hover:border-neutral-300 bg-white'
      }`}
    >
      <div
        className="w-5 h-5 rounded-full flex-shrink-0 border border-black/10"
        style={{ backgroundColor: product.colorHex }}
      />
      <div className="min-w-0">
        <p className="text-sm font-medium text-neutral-900 truncate">{product.name}</p>
        <p className="text-xs text-neutral-400">{product.brand}</p>
      </div>
    </button>
  )
}
```

Create `components/ProductSelector.tsx`:
```typescript
'use client'

import { useEffect, useState } from 'react'
import { ProductChip } from './ProductChip'

interface Product {
  id: string
  name: string
  brand: string
  category: string
  colorHex: string
  price: number
}

const CATEGORIES = [
  { key: 'lipstick', label: '💄 Lip' },
  { key: 'eyeshadow', label: '👁 Eye' },
  { key: 'foundation', label: '✨ Base' },
]

interface ProductSelectorProps {
  selectedIds: string[]
  onToggle: (id: string, category: string) => void
}

export function ProductSelector({ selectedIds, onToggle }: ProductSelectorProps) {
  const [products, setProducts] = useState<Record<string, Product[]>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all(
      CATEGORIES.map((c) =>
        fetch(`/api/products?category=${c.key}`)
          .then((r) => r.json())
          .then((data) => ({ key: c.key, data }))
      )
    ).then((results) => {
      const map: Record<string, Product[]> = {}
      results.forEach(({ key, data }) => { map[key] = data })
      setProducts(map)
      setLoading(false)
    })
  }, [])

  if (loading) {
    return <div className="h-32 bg-neutral-50 rounded-xl animate-pulse" />
  }

  return (
    <div className="space-y-4">
      {CATEGORIES.map((cat) => (
        <div key={cat.key}>
          <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2">
            {cat.label}
          </p>
          <div className="grid grid-cols-2 gap-2">
            {(products[cat.key] || []).map((product) => (
              <ProductChip
                key={product.id}
                product={product}
                selected={selectedIds.includes(product.id)}
                onSelect={(id) => onToggle(id, cat.key)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
```

Commit message: `feat: T06 product catalog UI with category tabs`

---

### T07 — POST /api/generate (mock mode)
**Skill:** `gsd:quick`

Create `lib/fal.ts`:
```typescript
export function buildMakeupPrompt(productDescriptions: string[]): string {
  const makeupList = productDescriptions.join(', ')
  return `Professional beauty portrait of a model wearing ${makeupList}. High-end cosmetics photography, studio lighting, sharp focus, photorealistic, 8k quality.`
}

export async function generateMakeup(
  imageUrl: string,
  prompt: string
): Promise<{ imageUrl: string; requestId: string }> {
  const apiKey = process.env.FAL_KEY

  // Mock mode
  if (!apiKey || apiKey === 'mock') {
    await new Promise((resolve) => setTimeout(resolve, 3000)) // simulate delay
    return {
      imageUrl: 'https://picsum.photos/seed/makeup-result/800/1000',
      requestId: `mock-${Date.now()}`,
    }
  }

  // Real FAL.ai call (when key is provided)
  const { fal } = await import('@fal-ai/client')
  fal.config({ credentials: apiKey })

  const result = await fal.subscribe('fal-ai/image-editing/realism', {
    input: {
      image_url: imageUrl,
      prompt,
      negative_prompt: 'cartoon, illustration, deformed, unrealistic skin, bad makeup, blurry',
    },
  })

  return {
    imageUrl: (result.data as { images: { url: string }[] }).images[0].url,
    requestId: result.requestId,
  }
}
```

Create `app/api/generate/route.ts`:
```typescript
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { buildMakeupPrompt, generateMakeup } from '@/lib/fal'

export async function POST(request: Request) {
  try {
    const { modelId, productIds } = await request.json()

    if (!modelId || !productIds?.length) {
      return NextResponse.json({ error: 'modelId and productIds required' }, { status: 400 })
    }

    const model = await prisma.model.findUnique({ where: { id: modelId } })
    if (!model) {
      return NextResponse.json({ error: 'Model not found' }, { status: 404 })
    }

    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    })

    const prompt = buildMakeupPrompt(products.map((p) => p.promptDescription))

    // Create generation record
    const generation = await prisma.generation.create({
      data: {
        modelId,
        productIds: JSON.stringify(productIds),
        prompt,
        status: 'processing',
      },
    })

    // Fire and forget — update status when done
    generateMakeup(model.imageUrl, prompt)
      .then(async ({ imageUrl }) => {
        await prisma.generation.update({
          where: { id: generation.id },
          data: { status: 'done', resultUrl: imageUrl },
        })
      })
      .catch(async () => {
        await prisma.generation.update({
          where: { id: generation.id },
          data: { status: 'error' },
        })
      })

    return NextResponse.json({ generationId: generation.id })
  } catch (error) {
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 })
  }
}
```

Commit message: `feat: T07 POST /api/generate with mock FAL.ai`

---

### T08 — GET /api/generate/[id] (polling)
**Skill:** `gsd:quick`

Create `app/api/generate/[id]/route.ts`:
```typescript
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const generation = await prisma.generation.findUnique({
      where: { id: params.id },
      include: { model: true },
    })

    if (!generation) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    return NextResponse.json({
      id: generation.id,
      status: generation.status,
      resultUrl: generation.resultUrl,
      modelImageUrl: generation.model.imageUrl,
      createdAt: generation.createdAt,
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch generation' }, { status: 500 })
  }
}
```

Commit message: `feat: T08 GET /api/generate/[id] polling endpoint`

---

### T09 — Try-on page: model + product selection + generate button
**Skill:** `superpowers:writing-plans` 先規劃，再 `gsd:quick` 執行

Create `app/try-on/page.tsx`:
```typescript
'use client'

import { useState } from 'react'
import { ModelSelector } from '@/components/ModelSelector'
import { ProductSelector } from '@/components/ProductSelector'
import Link from 'next/link'

export default function TryOnPage() {
  const [selectedModelId, setSelectedModelId] = useState<string | null>(null)
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([])
  const [categorySelections, setCategorySelections] = useState<Record<string, string>>({})
  const [generationId, setGenerationId] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleProductToggle(id: string, category: string) {
    const currentInCategory = categorySelections[category]
    if (currentInCategory === id) {
      // Deselect
      setCategorySelections((prev) => { const n = { ...prev }; delete n[category]; return n })
      setSelectedProductIds((prev) => prev.filter((p) => p !== id))
    } else {
      // Replace selection in this category
      setCategorySelections((prev) => ({ ...prev, [category]: id }))
      setSelectedProductIds((prev) => [
        ...prev.filter((p) => p !== currentInCategory),
        id,
      ])
    }
  }

  async function handleGenerate() {
    if (!selectedModelId || selectedProductIds.length === 0) return
    setGenerating(true)
    setError(null)
    setGenerationId(null)

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ modelId: selectedModelId, productIds: selectedProductIds }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setGenerationId(data.generationId)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Generation failed')
      setGenerating(false)
    }
  }

  const canGenerate = selectedModelId && selectedProductIds.length > 0 && !generating

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="bg-white border-b border-neutral-100 px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-sm text-neutral-500 hover:text-neutral-800">← Showcase</Link>
        <h1 className="text-lg font-semibold text-neutral-900">Try It On</h1>
        <div className="w-16" />
      </header>

      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Step 1 */}
        <section>
          <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide mb-3">
            1 · Choose a model
          </h2>
          <ModelSelector selectedId={selectedModelId} onSelect={setSelectedModelId} />
        </section>

        {/* Step 2 */}
        <section>
          <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide mb-3">
            2 · Build your look
          </h2>
          <ProductSelector selectedIds={selectedProductIds} onToggle={handleProductToggle} />
        </section>

        {/* Generate */}
        <button
          onClick={handleGenerate}
          disabled={!canGenerate}
          className={`w-full py-4 rounded-2xl font-semibold text-base transition-all duration-200 ${
            canGenerate
              ? 'bg-rose-400 hover:bg-rose-500 text-white shadow-lg shadow-rose-100'
              : 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
          }`}
        >
          {generating ? 'Generating...' : 'Generate Look ✨'}
        </button>

        {error && (
          <p className="text-center text-sm text-red-500">{error}</p>
        )}

        {generationId && !error && (
          <ResultPoller generationId={generationId} onDone={() => setGenerating(false)} />
        )}
      </div>
    </div>
  )
}

// Inline result poller component (will be replaced in T10 with full version)
function ResultPoller({ generationId, onDone }: { generationId: string; onDone: () => void }) {
  return (
    <div className="text-center py-8">
      <div className="inline-block w-8 h-8 border-2 border-rose-300 border-t-rose-500 rounded-full animate-spin mb-3" />
      <p className="text-sm text-neutral-500">Creating your look...</p>
      <p className="text-xs text-neutral-400 mt-1">ID: {generationId}</p>
    </div>
  )
}
```

Commit message: `feat: T09 try-on page with model and product selection`

---

### T10 — Polling logic + loading state + error handling + result display
**Skill:** `gsd:quick`

Create `components/ResultDisplay.tsx`:
```typescript
'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

interface Generation {
  id: string
  status: string
  resultUrl: string | null
  modelImageUrl: string
}

interface ResultDisplayProps {
  generationId: string
  onDone?: () => void
}

export function ResultDisplay({ generationId, onDone }: ResultDisplayProps) {
  const [generation, setGeneration] = useState<Generation | null>(null)
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    let interval: NodeJS.Timeout
    let timer: NodeJS.Timeout

    const poll = async () => {
      try {
        const res = await fetch(`/api/generate/${generationId}`)
        const data = await res.json()
        setGeneration(data)

        if (data.status === 'done' || data.status === 'error') {
          clearInterval(interval)
          clearInterval(timer)
          onDone?.()
        }
      } catch {}
    }

    poll()
    interval = setInterval(poll, 2000)
    timer = setInterval(() => setElapsed((e) => e + 1), 1000)

    return () => { clearInterval(interval); clearInterval(timer) }
  }, [generationId, onDone])

  if (!generation || generation.status === 'processing') {
    return (
      <div className="text-center py-10">
        <div className="inline-block w-10 h-10 border-2 border-rose-200 border-t-rose-400 rounded-full animate-spin mb-4" />
        <p className="text-sm text-neutral-600 font-medium">Creating your look...</p>
        <p className="text-xs text-neutral-400 mt-1">{elapsed}s elapsed</p>
      </div>
    )
  }

  if (generation.status === 'error') {
    return (
      <div className="text-center py-8 text-red-500">
        <p className="text-sm font-medium">Generation failed</p>
        <p className="text-xs text-neutral-400 mt-1">Please try again</p>
      </div>
    )
  }

  if (generation.status === 'done' && generation.resultUrl) {
    return (
      <div className="space-y-3">
        <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide text-center">
          Your Look ✨
        </p>
        <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-neutral-100">
          <Image
            src={generation.resultUrl}
            alt="Generated makeup look"
            fill
            className="object-cover"
          />
        </div>
      </div>
    )
  }

  return null
}
```

Update `app/try-on/page.tsx` to use `ResultDisplay` — replace the inline `ResultPoller` with:
```typescript
import { ResultDisplay } from '@/components/ResultDisplay'

// Replace the ResultPoller component and its usage:
{generationId && !error && (
  <ResultDisplay generationId={generationId} onDone={() => setGenerating(false)} />
)}
```

Remove the inline `ResultPoller` function from the file.

Commit message: `feat: T10 polling logic and result display with Before/After`

---

### T11 — Before/After slider component
**Skill:** `gsd:quick`

Create `components/BeforeAfterSlider.tsx`:
```typescript
'use client'

import Image from 'next/image'
import { useRef, useState, useCallback } from 'react'

interface BeforeAfterSliderProps {
  beforeUrl: string
  afterUrl: string
  beforeLabel?: string
  afterLabel?: string
}

export function BeforeAfterSlider({
  beforeUrl,
  afterUrl,
  beforeLabel = 'Before',
  afterLabel = 'After',
}: BeforeAfterSliderProps) {
  const [position, setPosition] = useState(50)
  const containerRef = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)

  const updatePosition = useCallback((clientX: number) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width))
    setPosition((x / rect.width) * 100)
  }, [])

  return (
    <div
      ref={containerRef}
      className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-neutral-100 select-none cursor-ew-resize"
      onMouseMove={(e) => { if (dragging.current) updatePosition(e.clientX) }}
      onMouseDown={(e) => { dragging.current = true; updatePosition(e.clientX) }}
      onMouseUp={() => { dragging.current = false }}
      onMouseLeave={() => { dragging.current = false }}
      onTouchMove={(e) => updatePosition(e.touches[0].clientX)}
      onTouchStart={(e) => updatePosition(e.touches[0].clientX)}
    >
      {/* After image (full) */}
      <Image src={afterUrl} alt={afterLabel} fill className="object-cover" />

      {/* Before image (clipped) */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
      >
        <Image src={beforeUrl} alt={beforeLabel} fill className="object-cover" />
      </div>

      {/* Divider */}
      <div
        className="absolute inset-y-0 w-0.5 bg-white shadow-lg"
        style={{ left: `${position}%` }}
      >
        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
          <svg className="w-4 h-4 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l-3 3 3 3M16 9l3 3-3 3" />
          </svg>
        </div>
      </div>

      {/* Labels */}
      <span className="absolute bottom-3 left-3 text-xs font-semibold text-white bg-black/40 px-2 py-1 rounded-full backdrop-blur-sm">
        {beforeLabel}
      </span>
      <span className="absolute bottom-3 right-3 text-xs font-semibold text-white bg-black/40 px-2 py-1 rounded-full backdrop-blur-sm">
        {afterLabel}
      </span>
    </div>
  )
}
```

Update `components/ResultDisplay.tsx` to use `BeforeAfterSlider` when result is done:
Replace the result display section with:
```typescript
import { BeforeAfterSlider } from './BeforeAfterSlider'

// In the done case:
if (generation.status === 'done' && generation.resultUrl) {
  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide text-center">
        Drag to Compare ✨
      </p>
      <BeforeAfterSlider
        beforeUrl={generation.modelImageUrl}
        afterUrl={generation.resultUrl}
        beforeLabel="Original"
        afterLabel="With Makeup"
      />
    </div>
  )
}
```

Commit message: `feat: T11 Before/After drag slider component`

---

### T12 — Showcase page
**Skill:** `gsd:quick`

Update `app/page.tsx`:
```typescript
import Link from 'next/link'
import Image from 'next/image'
import { prisma } from '@/lib/prisma'

// Showcase items — mix of real generations and placeholder combinations
const SHOWCASE_ITEMS = [
  {
    id: 'sc-1',
    modelName: 'Aria',
    look: 'Ruby Kiss + Smoky Noir',
    imageUrl: 'https://picsum.photos/seed/sc1/800/1000',
    modelImageUrl: '/models/model-1.jpg',
  },
  {
    id: 'sc-2',
    modelName: 'Maya',
    look: 'Coral Reef + Bronze Goddess',
    imageUrl: 'https://picsum.photos/seed/sc2/800/1000',
    modelImageUrl: '/models/model-2.jpg',
  },
  {
    id: 'sc-3',
    modelName: 'Zara',
    look: 'Berry Crush + Ocean Depth',
    imageUrl: 'https://picsum.photos/seed/sc3/800/1000',
    modelImageUrl: '/models/model-3.jpg',
  },
  {
    id: 'sc-4',
    modelName: 'Aria',
    look: 'Rose Petal + Rose Gold Dream',
    imageUrl: 'https://picsum.photos/seed/sc4/800/1000',
    modelImageUrl: '/models/model-1.jpg',
  },
  {
    id: 'sc-5',
    modelName: 'Maya',
    look: 'Nude Velvet + Earth & Stone',
    imageUrl: 'https://picsum.photos/seed/sc5/800/1000',
    modelImageUrl: '/models/model-2.jpg',
  },
  {
    id: 'sc-6',
    modelName: 'Zara',
    look: 'Ruby Kiss + Bronze Goddess',
    imageUrl: 'https://picsum.photos/seed/sc6/800/1000',
    modelImageUrl: '/models/model-3.jpg',
  },
]

export default function ShowcasePage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Hero */}
      <header className="bg-white border-b border-neutral-100 px-4 pt-12 pb-8 text-center">
        <p className="text-xs font-semibold tracking-widest text-rose-400 uppercase mb-2">
          Mirror Makeup
        </p>
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">
          AI Beauty Try-On
        </h1>
        <p className="text-neutral-500 text-sm max-w-xs mx-auto">
          See exactly how products look on real models — before you buy.
        </p>
        <Link
          href="/try-on"
          className="inline-block mt-6 px-8 py-3 bg-rose-400 hover:bg-rose-500 text-white font-semibold rounded-full shadow-lg shadow-rose-100 transition-all duration-200"
        >
          Try It On →
        </Link>
      </header>

      {/* Showcase grid */}
      <main className="max-w-2xl mx-auto px-4 py-8">
        <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide mb-4">
          Featured Looks
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {SHOWCASE_ITEMS.map((item) => (
            <div key={item.id} className="rounded-2xl overflow-hidden bg-white shadow-sm">
              <div className="relative aspect-[4/5] bg-neutral-100">
                <Image
                  src={item.imageUrl}
                  alt={`${item.modelName} — ${item.look}`}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-3">
                <p className="text-sm font-medium text-neutral-900">{item.modelName}</p>
                <p className="text-xs text-neutral-400 mt-0.5">{item.look}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/try-on"
            className="inline-block px-8 py-3 border-2 border-rose-200 text-rose-500 font-semibold rounded-full hover:bg-rose-50 transition-all duration-200"
          >
            Create Your Own Look →
          </Link>
        </div>
      </main>
    </div>
  )
}
```

Commit message: `feat: T12 showcase homepage with featured looks grid`

---

### T13 — UI polish + RWD
**Skill:** `design-review`（找視覺問題）然後 `gsd:quick` 修正

Update `app/layout.tsx` to set metadata and font:
```typescript
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Mirror Makeup — AI Beauty Try-On',
  description: 'See exactly how makeup products look on real models before you buy.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
  )
}
```

Update `app/globals.css` — keep Tailwind directives, add:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-neutral-50 text-neutral-900;
  }
}
```

Update `next.config.js` to allow external image domains:
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
      {
        protocol: 'https',
        hostname: 'fal.media',
      },
      {
        protocol: 'https',
        hostname: '*.fal.ai',
      },
    ],
  },
}

module.exports = nextConfig
```

Verify `npm run build` passes (fix any TypeScript errors found).

Commit message: `feat: T13 UI polish, metadata, image domain config`

---

### T14 — Vercel deploy config + env example
**Skill:** `land-and-deploy`（部署流程）

Create `.env.local.example`:
```bash
# FAL.ai API key — get from https://fal.ai/dashboard
FAL_KEY=your_fal_api_key_here

# Database
# Local development: SQLite (no setup needed)
DATABASE_URL="file:./dev.db"

# Production on Vercel: use Vercel Postgres
# DATABASE_URL="postgresql://..."
# DIRECT_URL="postgresql://..."
```

Create `vercel.json`:
```json
{
  "buildCommand": "prisma generate && next build",
  "installCommand": "npm install"
}
```

Update `package.json` scripts to add:
```json
"postinstall": "prisma generate"
```

Create `.planning/BLOCKERS.md` if it doesn't exist, and add:
```markdown
# Blockers — waiting for user

## B01 — FAL.ai API key
**Status:** Waiting
**Action needed:** Add real FAL_KEY to .env.local (get from https://fal.ai/dashboard)
Currently running in mock mode (returns picsum placeholder images)

## B02 — Model photos
**Status:** Waiting  
**Action needed:** Replace placeholder files in `public/models/`:
- `public/models/model-1.jpg` — Aria (fair skin tone)
- `public/models/model-2.jpg` — Maya (medium skin tone)
- `public/models/model-3.jpg` — Zara (deep skin tone)

**Format:** JPG or WebP, portrait orientation, 4:5 ratio (e.g. 800×1000px), minimum 800px wide

## B03 — Vercel Postgres (for production deploy)
**Status:** Waiting
**Action needed:** 
1. Create project at vercel.com
2. Add Vercel Postgres database
3. Copy DATABASE_URL and DIRECT_URL to Vercel environment variables
4. Run: `npx prisma migrate deploy`

## B04 — Vercel deployment
**Status:** Waiting
**Action needed:** Run `vercel --prod` or connect GitHub repo in Vercel dashboard
```

Run final build check:
```bash
npm run build
```

Commit message: `feat: T14 Vercel config and blocker documentation`

---

## Status

Last updated: (updated by each agent run)
Completed tasks: 0/14
```
