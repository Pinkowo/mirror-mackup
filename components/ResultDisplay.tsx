'use client'

import { useEffect, useState } from 'react'
import { BeforeAfterSlider } from './BeforeAfterSlider'

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
    const interval = setInterval(poll, 2000)
    const timer = setInterval(() => setElapsed((e) => e + 1), 1000)

    return () => { clearInterval(interval); clearInterval(timer) }
  }, [generationId, onDone])

  if (!generation || generation.status === 'processing') {
    return (
      <div className="text-center py-12">
        <div className="inline-block w-12 h-12 border-2 border-zinc-700 border-t-rose-400 rounded-full animate-spin mb-5" />
        <p className="text-base text-zinc-200 font-semibold">Creating your look...</p>
        <p className="text-sm text-zinc-500 mt-2">{elapsed}s elapsed</p>
      </div>
    )
  }

  if (generation.status === 'error') {
    return (
      <div className="text-center py-10 text-rose-400">
        <p className="text-base font-semibold">Generation failed</p>
        <p className="text-sm text-zinc-500 mt-1">Please try again</p>
      </div>
    )
  }

  if (generation.status === 'done' && generation.resultUrl) {
    return (
      <div className="space-y-3">
        <p className="text-sm font-semibold text-zinc-400 uppercase tracking-wide text-center">
          ← Drag to Compare →
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

  return null
}
