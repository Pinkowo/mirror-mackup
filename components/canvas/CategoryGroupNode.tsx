'use client'

interface CategoryGroupNodeData {
  label: string
}

export function CategoryGroupNode({ data }: { data: CategoryGroupNodeData }) {
  return (
    <div className="w-full h-full rounded-2xl border border-zinc-700/70 bg-zinc-900/30 backdrop-blur-sm relative cursor-grab active:cursor-grabbing">
      <span className="absolute top-2.5 left-3.5 text-xs font-bold tracking-widest text-zinc-500 uppercase select-none pointer-events-none">
        {data.label}
      </span>
    </div>
  )
}
