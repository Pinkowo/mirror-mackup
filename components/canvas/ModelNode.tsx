'use client'

import { Handle, Position } from '@xyflow/react'
import Image from 'next/image'

interface ModelNodeData {
  name: string
  imageUrl: string
  skinTone: string
  canGenerate: boolean
  generating: boolean
  onGenerate: () => void
}

export function ModelNode({ data }: { data: ModelNodeData }) {
  return (
    <div className="relative flex flex-col items-center w-44 rounded-2xl overflow-hidden border-2 border-rose-500 bg-zinc-950 shadow-[0_0_30px_rgba(251,113,133,0.3)]">
      <Handle type="target" position={Position.Left} className="opacity-0 pointer-events-none" />
      <Handle type="target" position={Position.Right} className="opacity-0 pointer-events-none" />
      <Handle type="target" position={Position.Top} className="opacity-0 pointer-events-none" />
      <Handle type="target" position={Position.Bottom} className="opacity-0 pointer-events-none" />

      <div className="w-full aspect-[3/4] relative bg-zinc-900">
        <Image
          src={data.imageUrl}
          alt={data.name}
          fill
          className="object-cover"
          unoptimized
        />
      </div>

      <div className="w-full px-3 py-2 text-center">
        <p className="text-sm font-semibold text-white">{data.name}</p>
        <p className="text-xs text-zinc-500 mb-2">{data.skinTone}</p>

        <button
          onClick={data.onGenerate}
          disabled={!data.canGenerate}
          className={`w-full py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
            data.generating
              ? 'bg-zinc-800 text-zinc-400 cursor-not-allowed'
              : data.canGenerate
              ? 'bg-rose-500 hover:bg-rose-400 text-white shadow-lg shadow-rose-900/50'
              : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
          }`}
        >
          {data.generating ? '✦ Generating...' : '✦ Generate Look'}
        </button>
      </div>
    </div>
  )
}
