'use client'

import { useState } from 'react'
import { ModelSelector } from '@/components/ModelSelector'
import { ProductSelector } from '@/components/ProductSelector'
import { ResultDisplay } from '@/components/ResultDisplay'
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
      setCategorySelections((prev) => { const n = { ...prev }; delete n[category]; return n })
      setSelectedProductIds((prev) => prev.filter((p) => p !== id))
    } else {
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
        <section>
          <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide mb-3">
            1 · Choose a model
          </h2>
          <ModelSelector selectedId={selectedModelId} onSelect={setSelectedModelId} />
        </section>

        <section>
          <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide mb-3">
            2 · Build your look
          </h2>
          <ProductSelector selectedIds={selectedProductIds} onToggle={handleProductToggle} />
        </section>

        <button
          onClick={handleGenerate}
          disabled={!canGenerate}
          className={`w-full py-4 rounded-2xl font-semibold text-base transition-all duration-200 ${
            canGenerate
              ? 'bg-rose-400 hover:bg-rose-500 text-white shadow-lg shadow-rose-100'
              : 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
          }`}
        >
          {generating ? 'Generating...' : 'Generate Look'}
        </button>

        {error && (
          <p className="text-center text-sm text-red-500">{error}</p>
        )}

        {generationId && !error && (
          <ResultDisplay generationId={generationId} onDone={() => setGenerating(false)} />
        )}
      </div>
    </div>
  )
}
