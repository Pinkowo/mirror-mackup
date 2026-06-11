'use client'

import { Handle, Position } from '@xyflow/react'
import Image from 'next/image'

interface ProductNodeData {
  name: string
  brand: string
  imageUrl: string | null
  colorHex: string
  colorHexes: string | null
  selected: boolean
  onSelect: (id: string) => void
  productId: string
  category: string
}

export function ProductNode({ data }: { data: ProductNodeData }) {
  const colors: string[] = data.colorHexes ? JSON.parse(data.colorHexes) : [data.colorHex]

  return (
    <div
      onClick={() => data.onSelect(data.productId)}
      className={`flex items-center gap-2 px-2.5 py-2 rounded-xl border cursor-pointer transition-all duration-150 w-44 ${
        data.selected
          ? 'border-rose-500 bg-zinc-800 shadow-[0_0_12px_rgba(251,113,133,0.25)]'
          : 'border-zinc-700 bg-zinc-900 hover:border-zinc-500'
      }`}
    >
      <Handle type="source" position={Position.Left} className="opacity-0 pointer-events-none" />
      <Handle type="source" position={Position.Right} className="opacity-0 pointer-events-none" />
      <Handle type="source" position={Position.Top} className="opacity-0 pointer-events-none" />
      <Handle type="source" position={Position.Bottom} className="opacity-0 pointer-events-none" />

      <div className="w-9 h-9 rounded-lg overflow-hidden flex-shrink-0 bg-zinc-800">
        {data.imageUrl ? (
          <Image src={data.imageUrl} alt={data.name} width={36} height={36} className="w-full h-full object-cover" unoptimized />
        ) : (
          <div className="w-full h-full" style={{ backgroundColor: colors[0] }} />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-white truncate leading-tight">{data.name}</p>
        <p className="text-xs text-zinc-500 truncate">{data.brand}</p>
      </div>

      <div className="flex-shrink-0">
        {colors.length > 1 ? (
          <div className="flex overflow-hidden rounded border border-white/10" style={{ width: 20, height: 20 }}>
            {colors.slice(0, 6).map((c, i) => (
              <div key={i} style={{ backgroundColor: c, flex: 1 }} />
            ))}
          </div>
        ) : (
          <div className="w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: colors[0] }} />
        )}
      </div>
    </div>
  )
}
