import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import ProductImageWithFallback from '../components/ProductImageWithFallback'

const catMeta = {
  'Wall Decor': { badge: 'Wall Décor', icon: 'imagesmode', material: 'Premium Canvas / Solid Timber' },
  'Lighting': { badge: 'Lighting', icon: 'light_mode', material: 'Ceramic / Rattan / Brass' },
  'Soft Furnishings': { badge: 'Soft Furnishings', icon: 'weekend', material: 'Organic Linen / Belgian Flax' },
  'Decorative Accents': { badge: 'Decorative Accents', icon: 'potted_plant', material: 'Hand-thrown Stoneware / Soy Wax' },
  'Rugs & Mats': { badge: 'Rugs & Mats', icon: 'crop_square', material: 'Hand-braided Jute / Cotton Dhurrie' }
}

// Curated room mappings for Architectural Sanctuary
const ROOM_COLLECTIONS = {
  'Living Room': [
    'Custom Canvas Wall Art',
    'Personalized Wooden Wall Frame',
    'Hexagonal Wooden Wall Mirror',
    'Macramé Wall Hanging',
    'Artisan Table Lamp',
    'Bohemian Fairy String Lights',
    'Personalized Throw Pillow',
    'Custom Cushion Cover Set (2)',
    'Handwoven Knit Throw Blanket',
    'Ceramic Bud Vase Set (3)',
    'Luxury Soy Scented Candle',
    'Woven Seagrass Storage Tray',
    'Natural Jute Area Rug',
    'Geometric Dhurrie Rug'
  ],
  'Bedroom': [
    'Personalized Throw Pillow',
    'Custom Cushion Cover Set (2)',
    'Handwoven Knit Throw Blanket',
    'Artisan Table Lamp',
    'Bohemian Fairy String Lights',
    'Macramé Wall Hanging',
    'Custom Canvas Wall Art',
    'Personalized Wooden Wall Frame',
    'Luxury Soy Scented Candle',
    'Ceramic Bud Vase Set (3)',
    'Geometric Dhurrie Rug',
    'Natural Jute Area Rug'
  ],
  'Study & Office': [
    'Artisan Table Lamp',
    'Custom Canvas Wall Art',
    'Hexagonal Wooden Wall Mirror',
    'Personalized Wooden Wall Frame',
    'Woven Seagrass Storage Tray',
    'Luxury Soy Scented Candle',
    'Ceramic Bud Vase Set (3)',
    'Geometric Dhurrie Rug'
  ],
  'Dining Room': [
    'Rattan Pendant Shade',
    'Ceramic Bud Vase Set (3)',
    'Woven Seagrass Storage Tray',
    'Luxury Soy Scented Candle',
    'Hexagonal Wooden Wall Mirror',
    'Custom Canvas Wall Art',
    'Natural Jute Area Rug',
    'Geometric Dhurrie Rug'
  ],
  'Entryway': [
    'Hexagonal Wooden Wall Mirror',
    'Personalized Wooden Wall Frame',
    'Woven Seagrass Storage Tray',
    'Artisan Table Lamp',
    'Ceramic Bud Vase Set (3)',
    'Luxury Soy Scented Candle',
    'Natural Jute Area Rug'
  ],
  'Outdoor & Balcony': [
    'Rattan Pendant Shade',
    'Bohemian Fairy String Lights',
    'Handwoven Knit Throw Blanket',
    'Custom Cushion Cover Set (2)',
    'Natural Jute Area Rug',
    'Woven Seagrass Storage Tray',
    'Ceramic Bud Vase Set (3)'
  ]
}

// Curated style mappings for Design Personalities
const STYLE_COLLECTIONS = {
  'Minimalist': [
    'Custom Canvas Wall Art',
    'Hexagonal Wooden Wall Mirror',
    'Personalized Wooden Wall Frame',
    'Artisan Table Lamp',
    'Ceramic Bud Vase Set (3)',
    'Natural Jute Area Rug',
    'Luxury Soy Scented Candle'
  ],
  'Bohemian': [
    'Macramé Wall Hanging',
    'Bohemian Fairy String Lights',
    'Rattan Pendant Shade',
    'Custom Cushion Cover Set (2)',
    'Handwoven Knit Throw Blanket',
    'Geometric Dhurrie Rug',
    'Woven Seagrass Storage Tray'
  ],
  'Japandi': [
    'Artisan Table Lamp',
    'Ceramic Bud Vase Set (3)',
    'Natural Jute Area Rug',
    'Handwoven Knit Throw Blanket',
    'Macramé Wall Hanging',
    'Hexagonal Wooden Wall Mirror',
    'Luxury Soy Scented Candle'
  ],
  'Modern Luxury': [
    'Custom Canvas Wall Art',
    'Personalized Wooden Wall Frame',
    'Hexagonal Wooden Wall Mirror',
    'Luxury Soy Scented Candle',
    'Geometric Dhurrie Rug',
    'Artisan Table Lamp',
    'Woven Seagrass Storage Tray'
  ]
}

const normalizeRoom = (r) => {
  if (!r) return ''
  const lower = r.toLowerCase().trim()
  if (lower.includes('study') || lower.includes('office')) return 'Study & Office'
  if (lower.includes('dining')) return 'Dining Room'
  if (lower.includes('living')) return 'Living Room'
  if (lower.includes('bed')) return 'Bedroom'
  if (lower.includes('entry') || lower.includes('foyer')) return 'Entryway'
  if (lower.includes('outdoor') || lower.includes('balcony')) return 'Outdoor & Balcony'
  return r
}

export default function ProductsPage() {
  const { isAdmin } = useAuth()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('all')
  const [searchParams] = useSearchParams()

  const activeRoom = searchParams.get('room')
  const activeStyle = searchParams.get('style')

  // Quick View State
  const [quickViewProduct, setQuickViewProduct] = useState(null)

  useEffect(() => {
    api.get('/products')
      .then((res) => {
        setProducts(res.data.data || [])
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  const addToCart = (id, name, price, style, image) => {
    try {
      let cart = JSON.parse(localStorage.getItem('kaya_cart') || '[]')
      const existing = cart.find((i) => i.id === id)
      if (existing) {
        existing.qty += 1
      } else {
        cart.push({
          id,
          name,
          price: parseFloat(price),
          style: style || 'Signature Collective',
          qty: 1,
          image: image || 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=700&q=80'
        })
      }
      localStorage.setItem('kaya_cart', JSON.stringify(cart))
      window.dispatchEvent(new Event('kaya_cart_updated'))

      const toast = document.createElement('div')
      toast.textContent = '✓ Added to cart'
      toast.className =
        'fixed top-24 left-1/2 -translate-x-1/2 z-[99999] bg-white/95 dark:bg-stone-900/95 text-stone-900 dark:text-white border border-emerald-600/30 dark:border-white/20 px-6 py-3.5 rounded-2xl text-sm font-semibold shadow-[0_10px_35px_rgba(16,185,129,0.18)] dark:shadow-[0_10px_35px_rgba(0,0,0,0.5)] pointer-events-none transition-all backdrop-blur-xl animate-fade-in'
      document.body.appendChild(toast)
      setTimeout(() => toast.remove(), 1500)
    } catch (e) {
      console.error(e)
    }
  }

  const normalizedActiveRoom = normalizeRoom(activeRoom)

  const filteredProducts = products.filter((p) => {
    // 1. Room filter (from Architectural Sanctuary)
    if (normalizedActiveRoom && ROOM_COLLECTIONS[normalizedActiveRoom]) {
      const allowedNames = ROOM_COLLECTIONS[normalizedActiveRoom]
      const matchesRoom = allowedNames.some(
        (name) => name.toLowerCase().trim() === p.name.toLowerCase().trim()
      )
      if (!matchesRoom) return false
    }

    // 2. Style filter (from Design Personalities)
    if (activeStyle && STYLE_COLLECTIONS[activeStyle]) {
      const allowedStyleNames = STYLE_COLLECTIONS[activeStyle]
      const matchesStyle = allowedStyleNames.some(
        (name) => name.toLowerCase().trim() === p.name.toLowerCase().trim()
      )
      if (!matchesStyle) return false
    }

    // 3. Category tabs filter
    if (activeCategory === 'all') return true
    return p.category === activeCategory
  })

  const categories = [
    { key: 'all', label: 'All Décor' },
    { key: 'Wall Decor', label: 'Wall Décor' },
    { key: 'Lighting', label: 'Lighting' },
    { key: 'Soft Furnishings', label: 'Soft Furnishings' },
    { key: 'Decorative Accents', label: 'Accents' },
    { key: 'Rugs & Mats', label: 'Rugs & Mats' }
  ]

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-12">
      {/* Catalog Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
        <div>
          <span className="inline-block px-3 py-1 mb-3 rounded-full bg-emerald-500/10 dark:bg-white/10 text-emerald-800 dark:text-white font-label-sm uppercase tracking-widest text-[11px] font-bold">
            {normalizedActiveRoom
              ? `Architectural Sanctuary · ${normalizedActiveRoom}`
              : activeStyle
              ? `Design Personality · ${activeStyle}`
              : 'Luxury Showroom'}
          </span>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="font-display-xl text-4xl md:text-5xl text-primary leading-tight">
              {normalizedActiveRoom
                ? `${normalizedActiveRoom} Collection`
                : activeStyle
                ? `${activeStyle} Collection`
                : 'The Decor Collection'}
            </h1>
            {(activeRoom || activeStyle) && (
              <Link
                to="/products"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-stone-100 dark:bg-stone-850 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/60 dark:hover:text-rose-400 text-stone-500 transition-colors border border-stone-200/80 dark:border-stone-800"
                title="View all collections without filter"
              >
                <span className="material-symbols-outlined text-[14px]">close</span>
                Show All Décor
              </Link>
            )}
          </div>
          <p className="font-body-md text-stone-500 max-w-md leading-relaxed mt-2">
            {normalizedActiveRoom
              ? `Curated home décor coordinates specifically tailored for your ${normalizedActiveRoom.toLowerCase()} estate sanctuary.`
              : activeStyle
              ? `Curated home décor pieces embodying the ${activeStyle.toLowerCase()} aesthetic.`
              : 'Curated home décor pieces designed for personal expression — from wall art to rugs, lighting to soft furnishings.'}
          </p>
        </div>

        {/* Filter Categories */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => {
            const isSelected = activeCategory === cat.key
            return (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`cat-btn px-5 py-2.5 rounded-full text-xs font-semibold transition-all ${
                  isSelected
                    ? 'bg-emerald-950 dark:bg-white text-white dark:text-stone-950 shadow-md'
                    : 'bg-stone-50 dark:bg-stone-900 text-stone-500 hover:text-emerald-800 dark:hover:text-white border border-stone-200/60 dark:border-stone-800'
                }`}
              >
                {cat.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="col-span-full text-center py-16 space-y-4">
          <span className="material-symbols-outlined text-stone-300 text-5xl">inventory_2</span>
          <h3 className="font-headline-md text-lg text-primary font-bold">
            No {activeCategory !== 'all' ? activeCategory : ''} pieces in this collection
          </h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            Try choosing a different category or reset your collection filter to view all available luxury furnishings.
          </p>
          <div className="flex justify-center gap-3 pt-2">
            {activeCategory !== 'all' && (
              <button
                onClick={() => setActiveCategory('all')}
                className="px-5 py-2.5 rounded-full bg-emerald-950 dark:bg-white text-white dark:text-stone-950 text-xs font-semibold hover:opacity-90 transition-opacity"
              >
                View All {normalizedActiveRoom || 'Pieces'}
              </button>
            )}
            {(activeRoom || activeStyle) && (
              <Link
                to="/products"
                className="px-5 py-2.5 rounded-full border border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 text-xs font-semibold hover:bg-stone-50 dark:hover:bg-stone-900 transition-colors"
              >
                Reset Collection Filter
              </Link>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8" id="catalogGrid">
          {filteredProducts.map((product) => {
            const cat = product.category || 'Wall Decor'
            const imageUrl =
              product.image_path ||
              'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=700&q=80'
            const meta = catMeta[cat] || catMeta['Wall Decor']
            const badge = meta.badge
            const icon = meta.icon
            const material = meta.material

            return (
              <div
                key={product.id || product._id}
                className="product-card group relative bg-white dark:bg-stone-950 rounded-[2rem] overflow-hidden whisper-shadow border border-stone-100 dark:border-stone-900 transition-all duration-500 hover:-translate-y-2 flex flex-col h-full"
                data-category={cat}
              >
                <div className="aspect-[4/3] overflow-hidden bg-stone-100 dark:bg-stone-900 relative shrink-0">
                  <span className="absolute top-4 left-4 z-10 px-3 py-1 bg-white/95 dark:bg-stone-900/95 text-stone-900 dark:text-white rounded-full font-label-sm text-[9px] uppercase tracking-wider font-bold shadow-md flex items-center gap-1">
                    <span className="material-symbols-outlined text-[12px] text-emerald-700">{icon}</span>
                    {badge}
                  </span>
                  <ProductImageWithFallback
                    src={imageUrl}
                    alt={product.name}
                    name={product.name}
                    description={product.description}
                    category={cat}
                    aspectRatio="aspect-[4/3]"
                    className="group-hover:scale-105 transition-transform duration-700"
                  />

                  {!product.in_stock && (
                    <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-[2px] z-20 flex items-center justify-center transition-all duration-300">
                      <span className="px-4 py-2 border border-white/20 bg-white/10 backdrop-blur-md text-white font-label-sm text-[11px] uppercase tracking-[0.2em] rounded-md shadow-lg">
                        Crafting Soon
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-6 flex flex-col flex-1 justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2 gap-2">
                      <h3 className="font-headline-md text-base text-stone-900 dark:text-white font-bold leading-tight mr-2">
                        {product.name}
                      </h3>
                      <span className="text-emerald-900 dark:text-white font-bold text-sm whitespace-nowrap shrink-0">
                        ₹{Number(product.base_price).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <p className="text-stone-400 text-[11px] mb-1 font-semibold uppercase tracking-wider">{material}</p>
                    <p className="text-stone-500 text-xs leading-relaxed mb-5 line-clamp-2">{product.description}</p>
                  </div>

                  <div className="space-y-2 mt-auto">
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setQuickViewProduct({
                            ...product,
                            imageUrl,
                            material,
                            badge
                          })
                        }
                        className="py-2.5 rounded-xl bg-stone-50 dark:bg-stone-900 text-stone-700 dark:text-stone-300 font-semibold border border-stone-200/70 dark:border-stone-800 hover:bg-black hover:text-white hover:border-black dark:hover:bg-black dark:hover:text-white dark:hover:border-black text-xs transition-all duration-200 flex justify-center items-center gap-1 cursor-pointer shadow-sm"
                      >
                        <span className="material-symbols-outlined text-[15px] transition-colors">visibility</span>
                        Quick View
                      </button>

                      {!isAdmin ? (
                        product.in_stock ? (
                          <button
                            type="button"
                            onClick={() => addToCart(product.id || product._id, product.name, product.base_price, badge, imageUrl)}
                            className="py-2.5 rounded-xl bg-stone-50 dark:bg-stone-900 text-stone-700 dark:text-stone-300 font-semibold border border-stone-200/70 dark:border-stone-800 hover:bg-black hover:text-white hover:border-black dark:hover:bg-black dark:hover:text-white dark:hover:border-black text-xs transition-all duration-200 flex justify-center items-center gap-1 cursor-pointer shadow-sm"
                          >
                            <span className="material-symbols-outlined text-[15px] transition-colors">shopping_bag</span>
                            Add to Cart
                          </button>
                        ) : (
                          <button
                            type="button"
                            disabled
                            className="py-2.5 rounded-xl bg-stone-100 dark:bg-stone-900/50 text-stone-400 font-semibold text-xs flex justify-center items-center gap-1 border border-stone-200/40 cursor-not-allowed opacity-60"
                          >
                            <span className="material-symbols-outlined text-[15px]">block</span>
                            Out of Stock
                          </button>
                        )
                      ) : (
                        <Link
                          to="/admin"
                          className="py-2.5 rounded-xl bg-amber-500/10 text-amber-800 dark:text-amber-300 font-bold text-xs flex justify-center items-center gap-1 border border-amber-500/20 hover:bg-amber-500/20 transition-colors"
                        >
                          <span className="material-symbols-outlined text-[15px]">admin_panel_settings</span>
                          Manage
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Quick View Modal */}
      {quickViewProduct && (
        <div
          className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-md flex items-center justify-center p-6 transition-opacity duration-300"
          onClick={() => setQuickViewProduct(null)}
        >
          <div
            className="bg-white dark:bg-stone-950 w-full max-w-4xl rounded-[2.5rem] overflow-hidden whisper-shadow border border-stone-100 dark:border-stone-900 transition-transform duration-300 flex flex-col md:flex-row max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="md:w-1/2 bg-stone-50 dark:bg-stone-900/50 relative">
              <img
                className="w-full h-full object-cover max-h-[320px] md:max-h-full"
                src={quickViewProduct.imageUrl}
                alt={quickViewProduct.name}
              />
              <button
                onClick={() => setQuickViewProduct(null)}
                className="absolute top-4 left-4 w-10 h-10 rounded-full bg-white/90 dark:bg-stone-900/90 text-stone-700 dark:text-stone-300 flex items-center justify-center hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors shadow-md md:hidden"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="md:w-1/2 p-8 md:p-10 flex flex-col justify-between overflow-y-auto space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="inline-block px-2.5 py-0.5 mb-2 rounded-full bg-emerald-500/10 dark:bg-white/10 text-emerald-800 dark:text-white text-[9px] font-bold uppercase tracking-wider">
                      {quickViewProduct.category}
                    </span>
                    <h2 className="font-headline-md text-2xl text-primary font-bold leading-tight">
                      {quickViewProduct.name}
                    </h2>
                  </div>
                  <button
                    onClick={() => setQuickViewProduct(null)}
                    className="hidden md:flex w-10 h-10 rounded-full bg-stone-50 dark:bg-stone-900 text-stone-500 dark:text-stone-400 items-center justify-center hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                  >
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>
                <div className="space-y-2">
                  <span className="text-2xl font-extrabold text-emerald-900 dark:text-white block">
                    ₹{Number(quickViewProduct.base_price).toLocaleString('en-IN')}
                  </span>
                  <p className="text-stone-500 text-xs leading-relaxed">{quickViewProduct.description}</p>
                </div>
                <div className="border-t border-stone-100 dark:border-stone-900 pt-4 space-y-3 text-xs font-semibold text-stone-600 dark:text-stone-400">
                  <div className="flex justify-between">
                    <span className="text-stone-400">Materials</span>
                    <span className="text-primary truncate max-w-[200px]">{quickViewProduct.material}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-400">Personalisation</span>
                    <span className="text-emerald-800 dark:text-white bg-emerald-500/15 dark:bg-white/10 px-2.5 py-0.5 rounded-full font-bold text-[9px] uppercase tracking-widest">
                      AI Curation Active
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-400">Delivery</span>
                    <span className="text-primary">Free · 3-5 Business Days</span>
                  </div>
                </div>
              </div>
              <div className="pt-4 border-t border-stone-100 dark:border-stone-900 space-y-3">
                {!isAdmin ? (
                  quickViewProduct.in_stock ? (
                    <button
                      onClick={() => {
                        addToCart(
                          quickViewProduct.id || quickViewProduct._id,
                          quickViewProduct.name,
                          quickViewProduct.base_price,
                          quickViewProduct.badge,
                          quickViewProduct.imageUrl
                        )
                        setQuickViewProduct(null)
                      }}
                      className="w-full bg-emerald-950 dark:bg-white text-white dark:text-stone-950 py-3.5 rounded-xl font-bold text-xs hover:bg-black hover:text-white dark:hover:bg-stone-200 dark:hover:text-black transition-all duration-200 flex justify-center items-center gap-1.5 shadow-lg cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">shopping_bag</span>
                      Add to Cart
                    </button>
                  ) : (
                    <button
                      disabled
                      className="w-full bg-stone-200 dark:bg-stone-900 text-stone-400 dark:text-stone-500 py-3.5 rounded-xl font-bold text-xs flex justify-center items-center gap-1.5 opacity-60 cursor-not-allowed pointer-events-none"
                    >
                      <span className="material-symbols-outlined text-[16px]">block</span> Crafting Soon (Out of Stock)
                    </button>
                  )
                ) : (
                  <Link
                    to="/admin"
                    onClick={() => setQuickViewProduct(null)}
                    className="w-full bg-amber-500/10 text-amber-800 dark:text-amber-300 py-3.5 rounded-xl font-bold text-xs hover:bg-amber-500/20 transition-colors flex justify-center items-center gap-1.5 border border-amber-500/20"
                  >
                    <span className="material-symbols-outlined text-[16px]">admin_panel_settings</span>
                    Admin Control Panel
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

