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
