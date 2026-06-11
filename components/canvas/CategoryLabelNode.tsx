'use client'

interface CategoryLabelNodeData {
  label: string
}

export function CategoryLabelNode({ data }: { data: CategoryLabelNodeData }) {
  return (
    <div className="text-xs font-bold tracking-widest text-zinc-500 uppercase pointer-events-none select-none">
      {data.label}
    </div>
  )
}
