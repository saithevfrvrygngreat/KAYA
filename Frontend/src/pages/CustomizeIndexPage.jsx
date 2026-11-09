import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import ProductImageWithFallback from '../components/ProductImageWithFallback'

export default function CustomizeIndexPage() {
  const [products, setProducts] = useState([])
  const [activeCategory, setActiveCategory] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/products')
      .then((res) => setProducts(res.data.data || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  const filteredProducts = products.filter((p) => {
    if (activeCategory === 'all') return true
    return p.category === activeCategory
  })

  const catIcons = {
    'Wall Decor': { icon: 'imagesmode', color: 'text-violet-600', bg: 'bg-violet-50 dark:bg-violet-950/40 border-violet-200/50 dark:border-violet-800/50' },
    'Lighting': { icon: 'light_mode', color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200/50 dark:border-amber-800/50' },
    'Soft Furnishings': { icon: 'weekend', color: 'text-sky-600', bg: 'bg-sky-50 dark:bg-sky-950/40 border-sky-200/50 dark:border-sky-800/50' },
    'Decorative Accents': { icon: 'potted_plant', color: 'text-emerald-600 dark:text-white', bg: 'bg-emerald-50 dark:bg-stone-900 border-emerald-200/50 dark:border-stone-800' },
    'Rugs & Mats': { icon: 'crop_square', color: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-950/40 border-rose-200/50 dark:border-rose-800/50' }
  }

  const categoryPills = [
    { key: 'all', label: 'All Pieces' },
    { key: 'Wall Decor', label: 'Wall Décor' },
    { key: 'Lighting', label: 'Lighting' },
    { key: 'Soft Furnishings', label: 'Soft Goods' },
    { key: 'Decorative Accents', label: 'Accents' },
    { key: 'Rugs & Mats', label: 'Rugs' }
  ]

  return (
    <div>
      {/* Hero / Workflow Header */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-950 via-emerald-900 to-stone-900 text-white">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-emerald-700/20 -translate-y-1/2 translate-x-1/3 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-amber-900/20 translate-y-1/2 -translate-x-1/4 blur-3xl pointer-events-none"></div>

        <div className="relative max-w-7xl mx-auto px-6 md:px-12 py-20 md:py-28">
          <div className="max-w-4xl">
            <h1 className="font-display-xl text-4xl md:text-5xl lg:text-6xl leading-tight font-bold mb-5 text-white">
              Design Your
              <br />
              <span className="text-emerald-300">Perfect Space</span>
            </h1>
            <p className="text-emerald-100/70 text-base md:text-lg leading-relaxed max-w-2xl mb-8">
              Choose a base piece, then our AI-powered canvas lets you customise every detail — colours, textures,
              patterns, and more — before it's handcrafted to order.
            </p>

            {/* How Personalisation Works — Compact 3-Step Flow */}
            <div className="mt-8 pt-2">
              <div className="mb-4">
                <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight mb-1">
                  How Personalisation Works
                </h2>
                <p className="text-emerald-100/70 text-xs">Three simple steps to your one-of-a-kind piece</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                {[
                  ['looks_one', 'Choose a Base Product', 'Browse the collection below and select any piece to open the Live Studio.'],
                  ['looks_two', 'Customise with AI', 'Use our AI-powered canvas to adjust colours, textures, and scales in real time.'],
                  ['looks_3', 'Handcrafted & Delivered', 'Your unique design is handcrafted by our artisans and delivered free within 3–5 business days.']
                ].map(([icon, title, desc]) => (
                  <div
                    key={title}
                    className="flex flex-col items-center text-center p-4 bg-white text-stone-900 rounded-2xl border border-stone-100 shadow-md transition-transform hover:-translate-y-0.5"
                  >
                    <div className="w-9 h-9 rounded-xl bg-black text-white flex items-center justify-center mb-2.5 shadow-sm">
                      <span className="material-symbols-outlined text-[19px] text-white">{icon}</span>
                    </div>
                    <h3 className="font-bold text-stone-900 text-xs md:text-sm mb-1">{title}</h3>
                    <p className="text-stone-500 text-[11px] leading-relaxed">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Step 1 — Choose Your Canvas */}
      <section className="py-16 md:py-20 max-w-7xl mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-3 rounded-full bg-amber-500/10 text-amber-800 dark:text-amber-300 text-[11px] font-bold uppercase tracking-widest border border-amber-500/20">
              <span className="material-symbols-outlined text-[12px]">looks_one</span>
              Step 1 of 3
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-emerald-950 dark:text-white font-display-xl leading-tight">
              Choose Your Canvas
            </h2>
            <p className="text-stone-500 dark:text-stone-400 mt-2 max-w-md text-sm leading-relaxed">
              Select any piece below to open the Live Personalisation Canvas and begin crafting your unique design.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {categoryPills.map((cat) => {
              const isSelected = activeCategory === cat.key
              return (
                <button
                  key={cat.key}
                  onClick={() => setActiveCategory(cat.key)}
                  className={`cf-btn px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                    isSelected
                      ? 'bg-emerald-950 dark:bg-white text-white dark:text-stone-950 shadow'
                      : 'bg-stone-50 dark:bg-stone-900 text-stone-500 hover:text-emerald-800 dark:hover:text-white border border-stone-200/60 dark:border-stone-800'
                  }`}
                >
                  {cat.label}
                </button>
              )
            })}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="col-span-full text-center py-20 space-y-4">
            <span className="material-symbols-outlined text-stone-300 text-6xl">design_services</span>
            <h3 className="font-bold text-xl text-stone-800 dark:text-white">No products available</h3>
            <p className="text-stone-400 text-sm">Please check back later or seed the database.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8" id="customizeGrid">
            {filteredProducts.map((product) => {
              const cat = product.category || 'Wall Decor'
              const imgUrl =
                product.image_path ||
                'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=700&q=80'
              const ci = catIcons[cat] || catIcons['Wall Decor']

              return (
                <div
                  key={product.id || product._id}
                  className="customize-card group flex flex-col bg-white dark:bg-stone-950 rounded-3xl overflow-hidden border border-stone-100 dark:border-stone-800 whisper-shadow transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_30px_60px_-15px_rgba(6,78,59,0.2)]"
                  data-category={cat}
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-stone-100 dark:bg-stone-900 shrink-0">
                    <ProductImageWithFallback
                      src={imgUrl}
                      alt={product.name}
                      name={product.name}
                      description={product.description}
                      category={cat}
                      aspectRatio="aspect-[4/3]"
                      className="group-hover:scale-105 transition-transform duration-700"
                    />

                    {product.in_stock ? (
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-5">
                        <span className="text-white text-xs font-semibold flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[16px]">touch_app</span>
                          Click to personalise
                        </span>
                      </div>
                    ) : (
                      <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-[2px] z-20 flex items-center justify-center transition-all duration-300">
                        <span className="px-4 py-2 border border-white/20 bg-white/10 backdrop-blur-md text-white font-label-sm text-[11px] uppercase tracking-[0.2em] rounded-md shadow-lg">
                          Crafting Soon
                        </span>
                      </div>
                    )}

                    <span
                      className={`absolute top-3 left-3 inline-flex items-center gap-1 px-2.5 py-1 bg-white/95 dark:bg-stone-900/95 rounded-full shadow-sm border text-[9px] font-bold uppercase tracking-wider ${ci.bg}`}
                    >
                      <span className={`material-symbols-outlined ${ci.color} text-[11px]`}>{ci.icon}</span>
                      <span className="text-stone-700 dark:text-stone-300">{cat}</span>
                    </span>
                  </div>

                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <h3 className="font-bold text-stone-900 dark:text-white text-base leading-snug">{product.name}</h3>
                      <span className="text-emerald-900 dark:text-white font-extrabold text-sm whitespace-nowrap shrink-0">
                        ₹{Number(product.base_price).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <p className="text-stone-400 text-xs leading-relaxed mb-5 line-clamp-2 flex-1">{product.description}</p>

                    {product.in_stock ? (
                      <Link
                        to={`/products/${product.id || product._id}/customize`}
                        className="w-full py-3.5 rounded-2xl bg-emerald-950 dark:bg-white text-white dark:text-stone-950 font-bold text-xs hover:bg-emerald-800 dark:hover:bg-stone-200 transition-all duration-200 flex justify-center items-center gap-2 shadow-[0_4px_12px_rgba(6,78,59,0.25)] group-hover:shadow-[0_6px_20px_rgba(6,78,59,0.35)]"
                      >
                        <span className="material-symbols-outlined text-[18px]">brush</span>
                        Start Personalising
                      </Link>
                    ) : (
                      <button
                        type="button"
                        disabled
                        className="w-full py-3.5 rounded-2xl bg-stone-100 dark:bg-stone-900/50 text-stone-400 font-bold text-xs cursor-not-allowed opacity-60 flex justify-center items-center gap-2 border border-stone-200/40"
                      >
                        <span className="material-symbols-outlined text-[18px]">block</span>
                        Temporarily Unavailable
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* End Products Catalog Section */}
    </div>
  )
}

