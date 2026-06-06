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
        <div className="absolute inset-0 bg-neutral-200 flex items-center justify-center text-neutral-400 text-sm z-0">
          {model.name}
        </div>
        <Image
          src={model.imageUrl}
          alt={model.name}
          fill
          className="object-cover relative z-10"
          onError={(e) => {
            e.currentTarget.style.display = 'none'
          }}
        />
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
