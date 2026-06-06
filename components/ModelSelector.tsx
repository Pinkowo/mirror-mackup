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
