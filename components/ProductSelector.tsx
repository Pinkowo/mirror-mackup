'use client'

import { useEffect, useState } from 'react'
import { ProductChip } from './ProductChip'

interface Product {
  id: string
  name: string
  brand: string
  category: string
  colorHex: string
  price: number
}

const CATEGORIES = [
  { key: 'lipstick', label: 'Lip' },
  { key: 'eyeshadow', label: 'Eye' },
  { key: 'foundation', label: 'Base' },
]

interface ProductSelectorProps {
  selectedIds: string[]
  onToggle: (id: string, category: string) => void
}

export function ProductSelector({ selectedIds, onToggle }: ProductSelectorProps) {
  const [products, setProducts] = useState<Record<string, Product[]>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all(
      CATEGORIES.map((c) =>
        fetch(`/api/products?category=${c.key}`)
          .then((r) => r.json())
          .then((data) => ({ key: c.key, data }))
      )
    ).then((results) => {
      const map: Record<string, Product[]> = {}
      results.forEach(({ key, data }) => { map[key] = data })
      setProducts(map)
      setLoading(false)
    })
  }, [])

  if (loading) {
    return <div className="h-32 bg-neutral-50 rounded-xl animate-pulse" />
  }

  return (
    <div className="space-y-4">
      {CATEGORIES.map((cat) => (
        <div key={cat.key}>
          <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2">
            {cat.label}
          </p>
          <div className="grid grid-cols-2 gap-2">
            {(products[cat.key] || []).map((product) => (
              <ProductChip
                key={product.id}
                product={product}
                selected={selectedIds.includes(product.id)}
                onSelect={(id) => onToggle(id, cat.key)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
