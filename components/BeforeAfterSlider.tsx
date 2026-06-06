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
      <Image src={afterUrl} alt={afterLabel} fill className="object-cover" />

      <div
        className="absolute inset-0 overflow-hidden"
        style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
      >
        <Image src={beforeUrl} alt={beforeLabel} fill className="object-cover" />
      </div>

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

      <span className="absolute bottom-3 left-3 text-xs font-semibold text-white bg-black/40 px-2 py-1 rounded-full backdrop-blur-sm">
        {beforeLabel}
      </span>
      <span className="absolute bottom-3 right-3 text-xs font-semibold text-white bg-black/40 px-2 py-1 rounded-full backdrop-blur-sm">
        {afterLabel}
      </span>
    </div>
  )
}
