import Link from 'next/link'
import Image from 'next/image'

const SHOWCASE_ITEMS = [
  { id: 'sc-1', modelName: 'Aria', look: 'Ruby Kiss + Smoky Noir', imageUrl: '/models/model-1.jpg', priority: true },
  { id: 'sc-2', modelName: 'Maya', look: 'Coral Reef + Bronze Goddess', imageUrl: 'https://picsum.photos/seed/maya-coral/800/1000', priority: true },
  { id: 'sc-3', modelName: 'Zara', look: 'Berry Crush + Ocean Depth', imageUrl: 'https://picsum.photos/seed/zara-berry/800/1000', priority: false },
  { id: 'sc-4', modelName: 'Aria', look: 'Rose Petal + Rose Gold Dream', imageUrl: '/models/model-1.jpg', priority: false },
  { id: 'sc-5', modelName: 'Maya', look: 'Nude Velvet + Earth & Stone', imageUrl: 'https://picsum.photos/seed/maya-nude/800/1000', priority: false },
  { id: 'sc-6', modelName: 'Zara', look: 'Ruby Kiss + Bronze Goddess', imageUrl: 'https://picsum.photos/seed/zara-ruby/800/1000', priority: false },
]

export default function ShowcasePage() {
  return (
    <div className="min-h-screen bg-black">
      <header className="border-b border-zinc-900 px-4 pt-12 pb-8 text-center">
        <p className="text-xs font-semibold tracking-widest text-rose-400 uppercase mb-2">Mirror Makeup</p>
        <h1 className="text-3xl font-bold text-white mb-2">AI Beauty Try-On</h1>
        <p className="text-zinc-500 text-sm max-w-xs mx-auto">
          See exactly how products look on real models — before you buy.
        </p>
        <Link
          href="/try-on"
          className="inline-block mt-6 px-8 py-3 bg-rose-500 hover:bg-rose-400 text-white font-semibold rounded-full shadow-lg shadow-rose-900/50 transition-all duration-200"
        >
          Try It On →
        </Link>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <h2 className="text-xs font-semibold text-zinc-600 uppercase tracking-widest mb-4">Featured Looks</h2>
        <div className="grid grid-cols-2 gap-3">
          {SHOWCASE_ITEMS.map((item) => (
            <div key={item.id} className="rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800">
              <div className="relative aspect-[4/5] bg-zinc-800">
                <Image src={item.imageUrl} alt={`${item.modelName} — ${item.look}`} fill sizes="(max-width: 672px) 50vw, 336px" priority={item.priority} className="object-cover" />
              </div>
              <div className="p-3">
                <p className="text-sm font-medium text-white">{item.modelName}</p>
                <p className="text-xs text-zinc-500 mt-0.5">{item.look}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/try-on"
            className="inline-block px-8 py-3 border border-rose-500/50 text-rose-400 font-semibold rounded-full hover:bg-rose-500/10 transition-all duration-200"
          >
            Create Your Own Look →
          </Link>
        </div>
      </main>
    </div>
  )
}
