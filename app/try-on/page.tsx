'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  ReactFlow,
  Node,
  Edge,
  useNodesState,
  useEdgesState,
  Background,
  BackgroundVariant,
  MarkerType,
  NodeTypes,
  useReactFlow,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import Link from 'next/link'
import { ModelNode } from '@/components/canvas/ModelNode'
import { ProductNode } from '@/components/canvas/ProductNode'
import { CategoryGroupNode } from '@/components/canvas/CategoryGroupNode'
import { ResultDisplay } from '@/components/ResultDisplay'

interface Product {
  id: string; name: string; brand: string; category: string
  colorHex: string; colorHexes: string | null; imageUrl: string | null; price: number
}
interface Model {
  id: string; name: string; imageUrl: string; skinTone: string; description: string
}

const MODEL_ID = 'model-node'
const CARD_W = 176
const CARD_H = 64
const GAP_X = 12
const GAP_Y = 10
const GROUP_PADDING = 14
const GROUP_LABEL_H = 30

// Bounding box for a category cluster
function groupBounds(count: number, cols: number) {
  const rows = Math.ceil(count / cols)
  const w = cols * CARD_W + (cols - 1) * GAP_X + GROUP_PADDING * 2
  const h = rows * CARD_H + (rows - 1) * GAP_Y + GROUP_LABEL_H + GROUP_PADDING * 2
  return { w, h, rows }
}

// Category layout: cluster center (cx, cy) and label
const LAYOUT: Record<string, { cx: number; cy: number; label: string; cols?: number }> = {
  lipstick:   { cx: 760,   cy: -120,  label: 'LIP',       cols: 2 },
  eyeshadow:  { cx: 1320,  cy: 80,    label: 'EYE SHADOW', cols: 2 },
  eyeliner:   { cx: 1460,  cy: 400,   label: 'EYELINER',  cols: 2 },
  blush:      { cx: 1300,  cy: 700,   label: 'BLUSH',     cols: 2 },
  contour:    { cx: 760,   cy: 860,   label: 'CONTOUR',   cols: 2 },
  mascara:    { cx: 200,   cy: 700,   label: 'MASCARA',   cols: 2 },
  foundation: { cx: 60,    cy: 400,   label: 'BASE',      cols: 2 },
}

function FitViewOnLoad({ ready }: { ready: boolean }) {
  const { fitView } = useReactFlow()
  const fittedRef = useRef(false)
  useEffect(() => {
    if (ready && !fittedRef.current) {
      fittedRef.current = true
      setTimeout(() => fitView({ padding: 0.12, duration: 600 }), 200)
    }
  }, [ready, fitView])
  return null
}

const nodeTypes: NodeTypes = {
  model: ModelNode as unknown as NodeTypes[string],
  product: ProductNode as unknown as NodeTypes[string],
  categoryGroup: CategoryGroupNode as unknown as NodeTypes[string],
}

export default function TryOnPage() {
  const [model, setModel] = useState<Model | null>(null)
  const [products, setProducts] = useState<Record<string, Product[]>>({})
  const [selectedByCategory, setSelectedByCategory] = useState<Record<string, string>>({})
  const [generationId, setGenerationId] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)
  const [showResult, setShowResult] = useState(false)

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])

  const handleGenerateRef = useRef<() => Promise<void>>(async () => {})

  // Fetch model and products
  useEffect(() => {
    fetch('/api/models').then(r => r.json()).then((data: Model[]) => setModel(data[0] ?? null))
    Promise.all(
      Object.keys(LAYOUT).map(cat =>
        fetch(`/api/products?category=${cat}`).then(r => r.json()).then(data => ({ cat, data }))
      )
    ).then(results => {
      const map: Record<string, Product[]> = {}
      results.forEach(({ cat, data }) => { map[cat] = data })
      setProducts(map)
    })
  }, [])

  const selectedProductIds = Object.values(selectedByCategory)

  const selectedProductsList = Object.entries(selectedByCategory).map(([cat, id]) =>
    products[cat]?.find(p => p.id === id)
  ).filter((p): p is Product => p !== undefined)

  // Build nodes whenever model or products change
  useEffect(() => {
    if (!model) return
    const newNodes: Node[] = []

    // Model node at center
    newNodes.push({
      id: MODEL_ID,
      type: 'model',
      position: { x: 680, y: 230 },
      data: {
        name: model.name,
        imageUrl: model.imageUrl,
        skinTone: model.description,
        canGenerate: false,
        generating: false,
        onGenerate: () => handleGenerateRef.current(),
      },
      draggable: false,
    })

    // Group nodes first (must precede their children in the array)
    Object.entries(LAYOUT).forEach(([cat, layout]) => {
      const catProducts = products[cat] ?? []
      if (!catProducts.length) return
      const cols = layout.cols ?? 2
      const { w, h } = groupBounds(catProducts.length, cols)
      newNodes.push({
        id: `group-${cat}`,
        type: 'categoryGroup',
        position: { x: layout.cx - w / 2, y: layout.cy - h / 2 },
        style: { width: w, height: h },
        data: { label: layout.label },
        selectable: false,
        zIndex: 0,
      })
    })

    // Product nodes with positions relative to their group
    Object.entries(LAYOUT).forEach(([cat, layout]) => {
      const catProducts = products[cat] ?? []
      if (!catProducts.length) return
      const cols = layout.cols ?? 2
      catProducts.forEach((product, i) => {
        const col = i % cols
        const row = Math.floor(i / cols)
        newNodes.push({
          id: product.id,
          type: 'product',
          position: {
            x: col * (CARD_W + GAP_X) + GROUP_PADDING,
            y: row * (CARD_H + GAP_Y) + GROUP_LABEL_H + GROUP_PADDING,
          },
          parentId: `group-${cat}`,
          data: {
            productId: product.id,
            name: product.name,
            brand: product.brand,
            imageUrl: product.imageUrl,
            colorHex: product.colorHex,
            colorHexes: product.colorHexes,
            category: cat,
            selected: false,
            onSelect: handleProductSelect,
          },
          zIndex: 1,
        })
      })
    })

    setNodes(newNodes)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [model, products])

  // Update only data fields when selection or generating state changes — preserves dragged positions
  useEffect(() => {
    setNodes(prev => prev.map(node => {
      if (node.id === MODEL_ID) {
        return {
          ...node,
          data: {
            ...(node.data as object),
            canGenerate: selectedProductIds.length > 0 && !generating,
            generating,
          },
        }
      }
      if (node.type === 'product') {
        const d = node.data as { category: string; productId: string }
        return {
          ...node,
          data: {
            ...(node.data as object),
            selected: selectedByCategory[d.category] === d.productId,
          },
        }
      }
      return node
    }))
  }, [selectedByCategory, generating, selectedProductIds.length])

  // Sync edges with selection
  useEffect(() => {
    const newEdges: Edge[] = Object.entries(selectedByCategory).map(([, productId]) => ({
      id: `edge-${productId}`,
      source: productId,
      target: MODEL_ID,
      animated: true,
      style: { stroke: '#fb7185', strokeWidth: 1.5 },
      markerEnd: { type: MarkerType.Arrow, color: '#fb7185' },
    }))
    setEdges(newEdges)
  }, [selectedByCategory, setEdges])

  const handleProductSelect = useCallback((id: string) => {
    setSelectedByCategory(prev => {
      // Find category for this product
      const cat = Object.entries(products).find(([, prods]) => prods.some(p => p.id === id))?.[0]
      if (!cat) return prev
      if (prev[cat] === id) {
        const next = { ...prev }; delete next[cat]; return next
      }
      return { ...prev, [cat]: id }
    })
  }, [products])

  async function handleGenerate() {
    if (!model || selectedProductIds.length === 0) return
    setGenerating(true)
    setGenerationId(null)
    setShowResult(false)
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ modelId: model.id, productIds: selectedProductIds }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setGenerationId(data.generationId)
      setShowResult(true)
    } catch {
      setGenerating(false)
    }
  }
  handleGenerateRef.current = handleGenerate

  return (
    <div className="w-screen h-screen bg-black flex flex-col">
      {/* Header */}
      <header className="flex-shrink-0 flex items-center justify-between px-6 py-3 border-b border-zinc-900 bg-black/80 backdrop-blur z-10">
        <Link href="/" className="text-xs text-zinc-500 hover:text-white transition-colors">← Mirror Makeup</Link>
        <p className="text-sm font-semibold tracking-wide text-white">Try It On</p>
        <p className="text-xs text-zinc-600">Drag · Click to select · Generate</p>
      </header>

      {/* Canvas */}
      <div className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          defaultViewport={{ x: 360, y: 210, zoom: 0.5 }}
          minZoom={0.3}
          maxZoom={1.5}
          colorMode="dark"
          proOptions={{ hideAttribution: true }}
        >
          <Background variant={BackgroundVariant.Dots} gap={28} size={1} color="#222" />
          <FitViewOnLoad ready={Object.keys(products).length > 0} />
        </ReactFlow>

        {/* Result overlay */}
        {showResult && generationId && (
          <div className="absolute inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center z-20 p-6">
            <div className="w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden">
              {/* Header */}
              <div className="flex justify-between items-center px-6 py-4 border-b border-zinc-800">
                <div>
                  <p className="text-xl font-bold text-white">Your Look</p>
                  <p className="text-sm text-zinc-400">{selectedProductIds.length} product{selectedProductIds.length !== 1 ? 's' : ''} applied</p>
                </div>
                <button
                  onClick={() => { setShowResult(false); setGenerating(false) }}
                  className="text-zinc-400 hover:text-white text-3xl leading-none"
                >×</button>
              </div>

              {/* Body */}
              <div className="flex gap-6 p-6">
                <div className="flex-1 min-w-0">
                  <ResultDisplay generationId={generationId} onDone={() => setGenerating(false)} />
                </div>

                {selectedProductsList.length > 0 && (
                  <div className="w-52 flex-shrink-0">
                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">Products Used</p>
                    <div className="space-y-3">
                      {selectedProductsList.map(product => {
                        const colors: string[] = product.colorHexes ? JSON.parse(product.colorHexes) : [product.colorHex]
                        return (
                          <div key={product.id} className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-xl overflow-hidden flex-shrink-0 bg-zinc-800">
                              {product.imageUrl ? (
                                <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" /> // eslint-disable-line @next/next/no-img-element
                              ) : (
                                <div className="w-full h-full" style={{ backgroundColor: colors[0] }} />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-white truncate leading-tight">{product.name}</p>
                              <p className="text-xs text-zinc-500 truncate">{product.brand}</p>
                              <div className="flex gap-0.5 mt-1">
                                {colors.slice(0, 6).map((c, i) => (
                                  <div key={i} className="w-3 h-3 rounded-full border border-white/10" style={{ backgroundColor: c }} />
                                ))}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
