'use client'

import Image from 'next/image'

interface Product {
  id: string
  name: string
  brand: string
  category: string
  colorHex: string
  colorHexes: string | null
  imageUrl: string | null
  price: number
}

interface ProductChipProps {
  product: Product
  selected: boolean
  onSelect: (id: string) => void
}

export function ProductChip({ product, selected, onSelect }: ProductChipProps) {
  const colors: string[] = product.colorHexes
    ? JSON.parse(product.colorHexes)
    : [product.colorHex]

  return (
    <button
      onClick={() => onSelect(product.id)}
      className={`flex items-center gap-2.5 px-2.5 py-2 rounded-xl border text-left transition-all duration-150 w-full ${
        selected
          ? 'border-rose-400 bg-rose-50 shadow-sm'
          : 'border-neutral-200 hover:border-neutral-300 bg-white'
      }`}
    >
      {/* Product image */}
      <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-neutral-100">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            width={40}
            height={40}
            className="w-full h-full object-cover"
            unoptimized
          />
        ) : (
          <div className="w-full h-full" style={{ backgroundColor: colors[0] }} />
        )}
      </div>

      {/* Name + brand */}
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-neutral-900 truncate leading-tight">{product.name}</p>
        <p className="text-xs text-neutral-400 truncate">{product.brand}</p>
      </div>

      {/* Color swatches */}
      <div className="flex-shrink-0">
        {colors.length > 1 ? (
          <div className="flex overflow-hidden rounded border border-black/10" style={{ width: 24, height: 24 }}>
            {colors.slice(0, 6).map((c, i) => (
              <div key={i} style={{ backgroundColor: c, flex: 1 }} />
            ))}
          </div>
        ) : (
          <div
            className="w-5 h-5 rounded-full border border-black/10"
            style={{ backgroundColor: colors[0] }}
          />
        )}
      </div>
    </button>
  )
}
