import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import ProductImageWithFallback from '../components/ProductImageWithFallback'

const categoryBadgeMeta = {
  'Lighting': { label: 'LIGHTING', icon: 'light_mode', iconColor: 'text-amber-400' },
  'Wall Decor': { label: 'WALL DÉCOR', icon: 'imagesmode', iconColor: 'text-amber-400' },
  'Soft Furnishings': { label: 'SOFT FURNISHINGS', icon: 'weekend', iconColor: 'text-amber-400' },
  'Decorative Accents': { label: 'DECORATIVE ACCENTS', icon: 'potted_plant', iconColor: 'text-amber-400' },
  'Rugs & Mats': { label: 'RUGS & MATS', icon: 'crop_square', iconColor: 'text-amber-400' },
}

export default function HomePage() {
  const { isAdmin } = useAuth()
  const [products, setProducts] = useState([])
  const [searchParams] = useSearchParams()

  // Slideshow states
  const [heroSlide, setHeroSlide] = useState(0)
  const [showcaseSlide, setShowcaseSlide] = useState(0)
  const [bgSlide, setBgSlide] = useState(0)

  // Quiz Modal State
  const [quizOpen, setQuizOpen] = useState(false)
  const [quizStep, setQuizStep] = useState(1)
  const [quizStyle, setQuizStyle] = useState('minimalist')
  const [quizStyleColor, setQuizStyleColor] = useState('#1c1917')
  const [quizStyleFrame, setQuizStyleFrame] = useState('black')
  const [quizProfileName, setQuizProfileName] = useState('Modern Sanctuary')
  const [quizRoom, setQuizRoom] = useState('living')
  const [quizColor, setQuizColor] = useState('#064e3b')
  const [quizProgress, setQuizProgress] = useState(0)

  // Fetch products
  useEffect(() => {
    api.get('/products')
      .then((res) => setProducts(res.data.data || []))
      .catch((err) => console.error('Error fetching products:', err))
  }, [])

  // Auto-open quiz if url has ?trigger_quiz=true
  useEffect(() => {
    if (searchParams.get('trigger_quiz') === 'true') {
      openQuiz()
    }
  }, [searchParams])

  // Hero background slider interval
  useEffect(() => {
    const timer = setInterval(() => {
      setHeroSlide((prev) => (prev + 1) % 4)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  // Arched window showcase flipboard interval
  useEffect(() => {
    const timer = setInterval(() => {
      setShowcaseSlide((prev) => (prev + 1) % 3)
    }, 4000)
    return () => clearInterval(timer)
  }, [])

  // Products section background slider interval
  useEffect(() => {
    const timer = setInterval(() => {
      setBgSlide((prev) => (prev + 1) % 3)
    }, 7000)
    return () => clearInterval(timer)
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

      // Toast (positioned below navbar, supports dark/light mode)
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

  // Quiz methods
  const openQuiz = () => {
    setQuizStep(1)
    setQuizProgress(0)
    setQuizOpen(true)
  }

  const closeQuiz = () => {
    setQuizOpen(false)
  }

  const handleSelectStyle = (style, name, color, frame) => {
    setQuizStyle(style)
    setQuizStyleColor(color)
    setQuizStyleFrame(frame)
    setQuizProfileName(name)
    setQuizStep(2)
  }

  const handleSelectRoom = (room) => {
    setQuizRoom(room)
    setQuizStep(3)
  }

  const handleSelectColor = (color, mood) => {
    setQuizColor(color)
    const combinedProfile = mood + ' × ' + quizProfileName
    setQuizProfileName(combinedProfile)
    setQuizStep(4)

    // Progress animation
    let p = 0
    const iv = setInterval(() => {
      p += 4
      setQuizProgress(p)
      if (p >= 100) {
        clearInterval(iv)
        setTimeout(() => {
          setQuizStep(5)
          localStorage.setItem(
            'aura_quiz',
            JSON.stringify({
              style: quizStyle,
              room: quizRoom,
              color,
              profile: combinedProfile
            })
          )
        }, 400)
      }
    }, 80)
  }

  const showcaseItems = [
    {
      index: '01',
      title: 'Artisan Ceramic Lamp',
      image: 'https://images.unsplash.com/photo-1631679706909-1844bbd07221?auto=format&fit=crop&w=600&q=80'
    },
    {
      index: '02',
      title: 'Custom Abstract Plaster Art',
      image: 'https://images.unsplash.com/photo-1580136579312-94651dfd596d?auto=format&fit=crop&w=600&q=80'
    },
    {
      index: '03',
      title: 'Bespoke Solid Oak Styling Tray',
      image: 'https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=600&q=80'
    }
  ]

  const heroImages = [
    'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1600&q=80',
    'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1600&q=80',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80',
    'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1600&q=80'
  ]

  const styles = [
    { name: 'Minimalist', desc: 'Clean lines · Neutral palette · Intentional', img: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=500&q=80', accent: 'bg-stone-900' },
    { name: 'Bohemian', desc: 'Earthy warmth · Layered textures · Free-spirit', img: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=500&q=80', accent: 'bg-amber-800' },
    { name: 'Japandi', desc: 'Nordic calm · Japanese wabi-sabi · Harmony', img: 'https://images.unsplash.com/photo-1615529182904-14819c35db37?auto=format&fit=crop&w=500&q=80', accent: 'bg-stone-600' },
    { name: 'Modern Luxury', desc: 'Gold accents · Bold drama · Statement pieces', img: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=500&q=80', accent: 'bg-yellow-800' }
  ]

  // Curated product for quiz results
  const styleIndex = { minimalist: 0, bohemian: 1, japandi: 2, luxe: 0 }
  const recommendedProduct = products[styleIndex[quizStyle] || 0] || products[0] || {
    id: '1',
    name: 'Bespoke Wall Frame',
    description: 'Premium handcrafted mounting.'
  }

  const roomImgs = {
    living: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=200&q=80',
    bedroom: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=200&q=80',
    office: 'https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?auto=format&fit=crop&w=200&q=80',
    dining: 'https://images.unsplash.com/photo-1617806118233-18e1db207f62?auto=format&fit=crop&w=200&q=80'
  }

  return (
    <div>
      {/* Hero Section */}
      <section className="relative h-[648px] flex items-center overflow-hidden">
        {/* Background Slideshow */}
        <div className="absolute inset-0 z-0 overflow-hidden" id="hero-slider">
          {heroImages.map((src, idx) => (
            <div
              key={idx}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out transform ${
                heroSlide === idx ? 'opacity-100 zoom-active' : 'opacity-0 scale-100'
              }`}
              style={{
                backgroundImage: `url('${src}')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-r from-[#fbfbfa]/95 via-[#fbfbfa]/65 to-transparent dark:from-stone-950/95 dark:via-stone-950/65 z-10"></div>
          <div className="absolute inset-0 bg-stone-900/5 z-10"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-6">
              <h1 className="font-display-xl text-display-xl text-primary leading-[1.05] tracking-tight">
                Bespoke Spaces.
                <br />
                Infinite Harmony.
              </h1>
              <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl leading-relaxed">
                Curation at the frontier of sensory luxury. Program your living space with masterfully tailored canvas
                collections, high-end materials, and AI-curated lighting.
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <a
                  href="#products"
                  className="bg-primary dark:bg-white text-white dark:text-stone-950 px-8 py-4 rounded-xl font-bold text-sm shadow-md hover:opacity-90 dark:hover:bg-stone-200 transition-all flex items-center gap-2 w-max"
                >
                  Start Customizing
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </a>
                <Link
                  to="/ai-designer"
                  className="bg-[#c8c9c7] hover:bg-[#bcbebc] border border-[#b5b6b4] text-stone-900 dark:bg-stone-900/80 dark:border-stone-700 dark:text-stone-200 dark:hover:bg-stone-800 px-8 py-4 rounded-xl font-bold text-sm shadow-sm transition-all flex items-center gap-2"
                >
                  AI Room Designer
                  <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
                </Link>
              </div>
            </div>

            {/* Right: Showcase Window / Arch Flipboard */}
            <div className="hidden lg:block lg:col-span-5 relative">
              <div className="absolute -inset-4 bg-gradient-to-tr from-emerald-500/10 to-transparent rounded-[3rem] blur-3xl opacity-60"></div>
              <div className="relative max-w-[340px] mx-auto space-y-4">
                <div className="relative rounded-t-full border border-stone-200/80 bg-white/70 dark:bg-stone-900/70 backdrop-blur-md p-3 shadow-2xl overflow-hidden aspect-[4/5.2]">
                  <div className="relative w-full h-full rounded-t-full overflow-hidden" id="showcase-window">
                    {showcaseItems.map((item, idx) => (
                      <div
                        key={idx}
                        className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
                          showcaseSlide === idx ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                        }`}
                        style={{
                          backgroundImage: `url('${item.image}')`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center'
                        }}
                      />
                    ))}
                  </div>
                </div>

                <div className="bg-white/80 dark:bg-stone-950/80 backdrop-blur-md border border-stone-200/50 dark:border-stone-800/80 rounded-2xl px-6 py-4 flex justify-between items-center shadow-lg transform -translate-y-2 hover:scale-[1.02] transition-transform">
                  <div>
                    <p className="text-[9px] uppercase tracking-[0.25em] text-stone-400 font-bold">KaYa Live Curation</p>
                    <h4 className="text-xs font-extrabold text-primary uppercase tracking-wide mt-1">
                      {showcaseItems[showcaseSlide].title}
                    </h4>
                  </div>
                  <span className="text-xs font-extrabold text-emerald-600 dark:text-white tracking-widest font-mono">
                    NO. {showcaseItems[showcaseSlide].index}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Customizable Products */}
      <section id="products" className="relative py-section-gap overflow-hidden">
        <div className="absolute inset-0 z-0 overflow-hidden" id="products-bg-slider">
          {[
            'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1600&q=80',
            'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1600&q=80',
            'https://images.unsplash.com/photo-1615529182904-14819c35db37?auto=format&fit=crop&w=1600&q=80'
          ].map((src, idx) => (
            <div
              key={idx}
              className={`absolute inset-0 transition-opacity duration-[1500ms] ease-in-out ${
                bgSlide === idx ? 'opacity-100' : 'opacity-0'
              }`}
              style={{
                backgroundImage: `radial-gradient(at 0% 0%, rgba(245,245,240, 0.85) 0, transparent 55%), radial-gradient(at 100% 100%, rgba(197,168,128, 0.12) 0, transparent 55%), url('${src}')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                filter: 'blur(6px) opacity(0.35)'
              }}
            />
          ))}
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#fbfbfa] via-[#fbfbfa]/90 to-[#fbfbfa] dark:from-stone-950 dark:via-stone-950/90 dark:to-stone-950 z-10"></div>

        <div className="relative z-20 max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex justify-between items-end mb-16">
            <div>
              <h2 className="font-headline-lg text-headline-lg text-primary mb-4">The Masterpiece Collection</h2>
              <p className="text-on-surface-variant max-w-md font-body-md">
                Sustainably handcrafted foundations ready for your bespoke configurations. Designed to elevate, engineered
                to inspire.
              </p>
            </div>
            <Link
              to="/products"
              className="hidden md:inline-flex items-center gap-2 text-sm font-semibold text-stone-500 hover:text-emerald-800 dark:hover:text-white transition-colors"
            >
              View All <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.slice(0, 6).map((product) => {
              const productImage =
                product.image_path ||
                'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=700&q=80'
              const cat = product.category || 'Home Décor'
              const badgeMeta = categoryBadgeMeta[cat] || {
                label: cat.toUpperCase(),
                icon: 'auto_awesome',
                iconColor: 'text-amber-400'
              }

              return (
                <div
                  key={product.id || product._id}
                  className="group relative bg-white/80 dark:bg-stone-900/80 backdrop-blur-md rounded-xl overflow-hidden whisper-shadow transition-transform duration-500 hover:-translate-y-2 flex flex-col h-full border border-stone-200/40"
                >
                  <div className="aspect-[4/3] overflow-hidden bg-stone-100 relative shrink-0">
                    <span className="absolute top-3 left-3 z-10 inline-flex items-center gap-1.5 px-3 py-1 bg-stone-950/85 dark:bg-black/85 backdrop-blur-md border border-white/10 rounded-full shadow-lg">
                      <span className={`material-symbols-outlined text-[13px] ${badgeMeta.iconColor}`}>
                        {badgeMeta.icon}
                      </span>
                      <span className="text-[9px] font-extrabold uppercase tracking-wider text-white">
                        {badgeMeta.label}
                      </span>
                    </span>
                    <ProductImageWithFallback
                      src={productImage}
                      alt={product.name}
                      name={product.name}
                      description={product.description}
                      category={badgeMeta.label}
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
                  <div className="p-8 flex flex-col flex-1 justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-2 gap-2">
                        <h3 className="font-headline-md text-[20px] text-primary leading-snug">{product.name}</h3>
                        <span className="text-on-surface-variant font-body-md shrink-0">
                          INR {Number(product.base_price).toFixed(2)}
                        </span>
                      </div>
                      <p className="text-on-surface-variant font-body-md mb-6 line-clamp-2">{product.description}</p>
                    </div>
                    <div className="space-y-2 mt-auto">
                      {product.in_stock ? (
                        <>
                          {!isAdmin && (
                            <button
                              type="button"
                              onClick={() =>
                                addToCart(
                                  product.id || product._id,
                                  product.name,
                                  product.base_price,
                                  'Signature Collective',
                                  productImage
                                )
                              }
                              className="w-full py-3 rounded-lg border-[1.5px] border-stone-300 dark:border-stone-700 text-stone-600 dark:text-stone-300 font-semibold hover:bg-black dark:hover:bg-black hover:text-white dark:hover:text-white hover:border-black dark:hover:border-black transition-all duration-200 flex justify-center items-center gap-2 text-sm cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-[18px]">shopping_bag</span>
                              Add to Cart
                            </button>
                          )}
                          <Link
                            to={`/products/${product.id || product._id}/customize`}
                            className="w-full py-3 rounded-lg border-[1.5px] border-primary-container dark:border-stone-300 text-primary-container dark:text-stone-200 font-semibold hover:bg-primary-container dark:hover:bg-white hover:text-white dark:hover:text-stone-950 transition-all flex justify-center items-center gap-2 text-sm"
                          >
                            <span className="material-symbols-outlined text-[20px]">auto_fix</span>
                            Customize
                          </Link>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            disabled
                            className="w-full py-3 rounded-lg border-[1.5px] border-stone-300 dark:border-stone-800 text-stone-400 bg-stone-50 dark:bg-stone-900/50 font-semibold cursor-not-allowed flex justify-center items-center gap-2 text-sm opacity-60"
                          >
                            <span className="material-symbols-outlined text-[18px]">block</span>
                            Out of Stock
                          </button>
                          <button
                            type="button"
                            disabled
                            className="w-full py-3 rounded-lg border-[1.5px] border-stone-300 dark:border-stone-800 text-stone-400 bg-stone-50 dark:bg-stone-900/50 font-semibold cursor-not-allowed flex justify-center items-center gap-2 text-sm opacity-60"
                          >
                            <span className="material-symbols-outlined text-[20px]">auto_fix</span>
                            Unavailable
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="mt-16 text-center">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-950 dark:bg-white text-white dark:text-stone-950 rounded-full font-semibold hover:bg-emerald-900 dark:hover:bg-stone-200 transition-colors shadow-lg group"
            >
              View All Collections
              <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">
                arrow_right_alt
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-section-gap bg-emerald-950 dark:bg-stone-900/90 border-y border-transparent dark:border-stone-800 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 md:px-12 text-center">
          <span className="inline-block px-3 py-1 mb-4 rounded-full bg-white/10 text-emerald-300 text-[11px] font-bold uppercase tracking-widest">
            The Process
          </span>
          <h2 className="font-headline-lg text-3xl md:text-4xl text-white mb-3">Transform Your Home in 3 Steps</h2>
          <p className="text-white/60 max-w-md mx-auto mb-14 font-body-md">
            From inspiration to delivery — personalise any piece and see it in your room before you buy.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                num: '01',
                icon: 'auto_awesome',
                title: 'Take the Style Quiz',
                desc: 'Answer 3 quick questions about your style, room, and colour mood. Our AI builds your unique decor profile.'
              },
              {
                num: '02',
                icon: 'brush',
                title: 'Personalise Your Piece',
                desc: 'Choose any product and customise colours, text, patterns, and materials. See changes live in the Room Visualizer.'
              },
              {
                num: '03',
                icon: 'local_shipping',
                title: 'Delivered to Your Door',
                desc: 'Place your order and our artisans handcraft your bespoke piece. Free delivery in 3-5 business days.'
              }
            ].map((step) => (
              <div
                key={step.num}
                className="relative flex flex-col items-center text-center p-8 bg-white/5 rounded-3xl border border-white/10 hover:bg-white/10 transition-colors"
              >
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white text-[11px] font-black">
                  {step.num}
                </div>
                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-5 mt-3">
                  <span className="material-symbols-outlined text-white text-[32px]">{step.icon}</span>
                </div>
                <h3 className="text-white font-bold text-lg mb-3">{step.title}</h3>
                <p className="text-white/60 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 flex flex-wrap justify-center gap-4">
            <Link
              to="/products"
              className="border border-white/30 text-white px-8 py-4 rounded-xl font-bold hover:bg-white/10 transition-all flex items-center gap-2"
            >
              Browse All Products
              <span className="material-symbols-outlined">explore</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Innovation Highlights */}
      <section className="py-section-gap bg-surface-container-low overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center mb-20">
            <h2 className="font-headline-lg text-headline-lg text-primary mb-4">The Future of Living</h2>
            <p className="text-on-surface-variant max-w-xl mx-auto font-body-lg">
              Technology that doesn't just display products, but imagines them in the context of your life.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-12">
              <div className="p-8 bg-white/50 backdrop-blur-sm rounded-2xl border border-white/40 whisper-shadow transition-all hover:bg-white/80">
                <div className="w-14 h-14 bg-primary-fixed rounded-xl flex items-center justify-center text-primary mb-6">
                  <span className="material-symbols-outlined text-[32px]">view_in_ar</span>
                </div>
                <h3 className="font-headline-md text-primary mb-3">AR Live Preview</h3>
                <p className="text-on-surface-variant font-body-md mb-6">
                  Eliminate the guesswork. Using advanced spatial computing, visualize your customized pieces in your exact
                  room layout with millimeter precision.
                </p>
                <Link
                  className="inline-flex items-center gap-2 font-semibold text-primary dark:text-white hover:gap-4 transition-all"
                  to="/products"
                >
                  Explore Collection
                  <span className="material-symbols-outlined">arrow_forward</span>
                </Link>
              </div>
              <div className="p-8 bg-white/50 backdrop-blur-sm rounded-2xl border border-white/40 whisper-shadow transition-all hover:bg-white/80">
                <div className="w-14 h-14 bg-tertiary-fixed rounded-xl flex items-center justify-center text-tertiary mb-6">
                  <span className="material-symbols-outlined text-[32px]">auto_awesome</span>
                </div>
                <h3 className="font-headline-md text-primary mb-3">AI-Powered Curation</h3>
                <p className="text-on-surface-variant font-body-md mb-6">
                  Our neural design engine analyzes your aesthetic preferences and uploaded room photos to suggest the
                  perfect balance of color, light, and form.
                </p>
                <Link
                  className="inline-flex items-center gap-2 font-semibold text-primary dark:text-white hover:gap-4 transition-all"
                  to="/ai-designer"
                >
                  Try AI Designer
                  <span className="material-symbols-outlined">arrow_forward</span>
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="relative z-10 rounded-[2rem] overflow-hidden shadow-2xl">
                <img
                  className="w-full aspect-square object-cover"
                  alt="AR Live Mockup"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAdUWI5KJ4KF4r6Hvs9_iUM7iFdl7iMoOfp7AwEp2r2LU0obDfyabTUKGvDHzvoX95wtyzi860C63rwiSLaYx6e1l7aATmWRsWVipkroMswczukYslOSfNmaOdMOm-jNJTyWoG6l82m8LPFN8B_UMt58DqcLix8NsCgMnVxai0Ymw2ZII2Dw2D1ITAjXcMwDG9Qgl0z_GJlEzeQ25EcemISYglhsatl2Ss7RUj1yoQDGE-xeBiaELq4Cij7REQ0UJ5yC7L5FsThUHdf"
                />
                <div className="absolute inset-x-6 bottom-6 glass-panel rounded-2xl p-6 border border-white/30">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white">
                      <span className="material-symbols-outlined text-[20px]">view_in_ar</span>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant">AR Mode Active</p>
                      <p className="text-sm font-semibold text-primary">Placing: Bespoke Velvet Armchair</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="h-1 bg-primary w-full rounded-full"></div>
                    <div className="h-1 bg-stone-300 w-full rounded-full"></div>
                    <div className="h-1 bg-stone-300 w-full rounded-full"></div>
                  </div>
                </div>
              </div>
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary-fixed/30 blur-3xl -z-10"></div>
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-tertiary-fixed/30 blur-3xl -z-10"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Personalization Prompt CTA */}
      <section className="py-section-gap">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="bg-primary dark:bg-stone-900 border border-transparent dark:border-stone-800 p-12 md:p-20 rounded-[2.5rem] relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-10 shadow-2xl">
            <div className="absolute top-0 right-0 w-1/2 h-full opacity-20 pointer-events-none">
              <div className="absolute inset-0 bg-gradient-to-l from-emerald-400/30 to-transparent"></div>
            </div>
            <div className="relative z-10 max-w-xl text-center md:text-left">
              <h2 className="font-headline-lg text-headline-lg text-white mb-6">Ready to reveal your space's potential?</h2>
              <p className="text-white/80 font-body-lg mb-8">
                Take our 3-minute aesthetic discovery quiz to unlock personalized collections tailored to your lifestyle.
              </p>
              <button
                onClick={openQuiz}
                className="bg-white dark:bg-white text-primary dark:text-stone-950 px-10 py-5 rounded-[10px] font-semibold text-body-md shadow-xl hover:scale-105 hover:bg-stone-100 dark:hover:bg-stone-200 transition-all"
              >
                Take Aesthetic Discovery Quiz
              </button>
            </div>
            <div className="relative z-10 grid grid-cols-2 gap-4">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl overflow-hidden bg-stone-200 rotate-3">
                <img
                  className="w-full h-full object-cover"
                  src="https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=300&q=80"
                  alt="Fabrics"
                />
              </div>
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl overflow-hidden bg-stone-200 -rotate-6 translate-y-8">
                <img
                  className="w-full h-full object-cover"
                  src="https://images.unsplash.com/photo-1615876234886-fd9a39fda97f?auto=format&fit=crop&w=300&q=80"
                  alt="Ceramic vase"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3-Step Aesthetic Discovery Quiz Modal */}
      {quizOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md transition-opacity duration-300">
          <div className="relative w-full max-w-2xl bg-white dark:bg-stone-950 rounded-[2rem] border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden p-8 md:p-12 transition-all">
            <button
              onClick={closeQuiz}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>

            {/* Step 1: Style */}
            {quizStep === 1 && (
              <div className="space-y-6">
                <div>
                  <span className="inline-block px-3 py-1 mb-2 rounded-full bg-emerald-500/10 dark:bg-white/10 text-emerald-800 dark:text-white text-[10px] font-bold uppercase tracking-widest">
                    Question 1 of 3
                  </span>
                  <h3 className="text-2xl md:text-3xl font-extrabold text-primary">What's your interior style?</h3>
                  <p className="text-xs text-stone-400">Choose the aesthetic that resonates with your living philosophy.</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { style: 'minimalist', name: 'Minimal Serenity', color: '#1c1917', frame: 'black', title: 'Minimalist', sub: 'Clean lines, silent spaces', img: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=400&q=80' },
                    { style: 'bohemian', name: 'Bohemian Spirit', color: '#78350f', frame: 'oak', title: 'Bohemian', sub: 'Warm, earthy & layered', img: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=400&q=80' },
                    { style: 'japandi', name: 'Japandi Zen', color: '#a8a29e', frame: 'none', title: 'Japandi', sub: 'Nordic-Japanese harmony', img: 'https://images.unsplash.com/photo-1615529182904-14819c35db37?auto=format&fit=crop&w=400&q=80' },
                    { style: 'luxe', name: 'Modern Luxury', color: '#d4af37', frame: 'gold', title: 'Modern Luxury', sub: 'Gold, drama & bespoke', img: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=400&q=80', darkImg: true }
                  ].map((card) => {
                    const isSelected = quizStyle === card.style;
                    return (
                      <button
                        key={card.style}
                        onClick={() => handleSelectStyle(card.style, card.name, card.color, card.frame)}
                        className={`group relative overflow-hidden rounded-2xl border-2 transition-all text-left cursor-pointer ${
                          isSelected
                            ? 'border-emerald-800 dark:border-white ring-2 ring-emerald-800/20 dark:ring-white/20'
                            : 'border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/60 hover:border-emerald-800 dark:hover:border-white hover:bg-stone-100 dark:hover:bg-stone-800/80'
                        }`}
                      >
                        <img
                          src={card.img}
                          className={`w-full h-28 object-cover group-hover:scale-105 transition-transform duration-500 ${card.darkImg ? 'brightness-75' : ''}`}
                          alt={card.title}
                        />
                        <div className="p-3">
                          <h4 className="font-bold text-stone-900 dark:text-stone-100 text-sm">{card.title}</h4>
                          <p className="text-[10px] text-stone-500 dark:text-stone-400">{card.sub}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 2: Room */}
            {quizStep === 2 && (
              <div className="space-y-6">
                <div>
                  <span className="inline-block px-3 py-1 mb-2 rounded-full bg-emerald-500/10 dark:bg-white/10 text-emerald-800 dark:text-white text-[10px] font-bold uppercase tracking-widest">
                    Question 2 of 3
                  </span>
                  <h3 className="text-2xl md:text-3xl font-extrabold text-primary">Your primary room?</h3>
                  <p className="text-xs text-stone-400">Where will this curated piece hang?</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { room: 'living', icon: 'chair', title: 'Living Room', sub: 'Above sofas & fireplaces' },
                    { room: 'bedroom', icon: 'bed', title: 'Bedroom', sub: 'Sanctuary wall art' },
                    { room: 'office', icon: 'laptop_mac', title: 'Study / Office', sub: 'Creative inspiration' },
                    { room: 'dining', icon: 'restaurant', title: 'Dining Room', sub: 'Elegant gathering space' }
                  ].map((item) => {
                    const isSelected = quizRoom === item.room;
                    return (
                      <button
                        key={item.room}
                        onClick={() => handleSelectRoom(item.room)}
                        className={`text-left p-4 rounded-2xl border-2 transition-all flex items-center gap-3.5 group cursor-pointer ${
                          isSelected
                            ? 'border-emerald-900 bg-emerald-950 text-white dark:border-white dark:bg-stone-800 dark:text-white shadow-md'
                            : 'border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/60 hover:border-emerald-800 dark:hover:border-white hover:bg-stone-100 dark:hover:bg-stone-800/80 text-stone-900 dark:text-stone-100'
                        }`}
                      >
                        <span className={`material-symbols-outlined text-2xl group-hover:scale-110 transition-transform ${
                          isSelected ? 'text-white dark:text-white' : 'text-emerald-800 dark:text-white'
                        }`}>{item.icon}</span>
                        <div>
                          <h4 className={`font-bold text-sm ${
                            isSelected ? 'text-white dark:text-white' : 'text-stone-900 dark:text-stone-100'
                          }`}>{item.title}</h4>
                          <p className={`text-[10px] ${
                            isSelected ? 'text-stone-300 dark:text-stone-300' : 'text-stone-500 dark:text-stone-400'
                          }`}>{item.sub}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 3: Color Mood */}
            {quizStep === 3 && (
              <div className="space-y-6">
                <div>
                  <span className="inline-block px-3 py-1 mb-2 rounded-full bg-emerald-500/10 dark:bg-white/10 text-emerald-800 dark:text-white text-[10px] font-bold uppercase tracking-widest">
                    Question 3 of 3
                  </span>
                  <h3 className="text-2xl md:text-3xl font-extrabold text-primary">Color mood?</h3>
                  <p className="text-xs text-stone-400">Select the palette that best describes your emotional energy.</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { color: '#78350f', title: 'Earth Tones', sub: 'Amber, ochre & terracotta', dots: ['#78350f', '#a16207', '#d97706'] },
                    { color: '#1c1917', title: 'Monochrome', sub: 'Timeless black & white', dots: ['#1c1917', '#78716c', '#e7e5e4'] },
                    { color: '#7c3aed', title: 'Bold & Vibrant', sub: 'Electric & expressive', dots: ['#7c3aed', '#0ea5e9', '#f43f5e'] },
                    { color: '#fef3c7', title: 'Pastels', sub: 'Soft, dreamy & airy', dots: ['#fef3c7', '#fbcfe8', '#a7f3d0'] }
                  ].map((item) => {
                    const isSelected = quizColor === item.color;
                    return (
                      <button
                        key={item.title}
                        onClick={() => handleSelectColor(item.color, item.title)}
                        className={`text-left p-4 rounded-2xl border-2 transition-all flex items-center gap-4 group cursor-pointer ${
                          isSelected
                            ? 'border-emerald-900 bg-emerald-950 text-white dark:border-white dark:bg-stone-800 dark:text-white shadow-md'
                            : 'border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/60 hover:border-emerald-800 dark:hover:border-white hover:bg-stone-100 dark:hover:bg-stone-800/80 text-stone-900 dark:text-stone-100'
                        }`}
                      >
                        <div className="flex -space-x-1.5 flex-shrink-0">
                          {item.dots.map((dot, i) => (
                            <span key={i} className="w-5 h-5 rounded-full border-2 border-white dark:border-stone-900 shadow-xs" style={{ backgroundColor: dot }} />
                          ))}
                        </div>
                        <div>
                          <h4 className={`font-bold text-sm ${isSelected ? 'text-white dark:text-white' : 'text-stone-900 dark:text-stone-100'}`}>{item.title}</h4>
                          <p className={`text-[10px] ${isSelected ? 'text-stone-300 dark:text-stone-300' : 'text-stone-500 dark:text-stone-400'}`}>{item.sub}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 4: Progress Bar */}
            {quizStep === 4 && (
              <div className="text-center py-10 space-y-6">
                <div className="relative w-24 h-24 mx-auto flex items-center justify-center bg-emerald-500/10 dark:bg-white/10 text-emerald-800 dark:text-white rounded-full">
                  <span className="material-symbols-outlined text-[42px] animate-spin">schema</span>
                  <div className="absolute inset-0 border-[3px] border-emerald-500/30 dark:border-white/30 rounded-full scale-110 animate-ping opacity-25"></div>
                </div>
                <div className="space-y-2">
                  <h4 className="text-xl font-bold text-primary">Running KaYa Curation AI...</h4>
                  <p className="text-xs text-stone-400">Matching your aesthetic profile to our collection...</p>
                </div>
                <div className="w-full bg-stone-200 dark:bg-stone-800 h-2 rounded-full overflow-hidden max-w-xs mx-auto">
                  <div className="bg-emerald-950 dark:bg-white h-full transition-all duration-100" style={{ width: `${quizProgress}%` }}></div>
                </div>
                <div className="text-xs font-bold text-emerald-950 dark:text-white">{quizProgress}% ANALYZED</div>
              </div>
            )}

            {/* Step 5: Results */}
            {quizStep === 5 && (
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/10 dark:bg-white/10 text-emerald-800 dark:text-white text-[10px] font-bold uppercase tracking-widest">
                    Your KaYa Profile
                  </span>
                  <h3 className="text-2xl md:text-3xl font-extrabold text-primary">{quizProfileName}</h3>
                  <p className="text-xs text-stone-400">Based on your selections, here's your perfect curation:</p>
                </div>
                <div className="bg-stone-50 dark:bg-stone-900 rounded-2xl p-5 border border-stone-100 dark:border-stone-800">
                  <div className="flex flex-col sm:flex-row items-center gap-5 bg-white dark:bg-stone-950 p-4 rounded-xl border border-stone-100 dark:border-stone-900 whisper-shadow">
                    <img
                      className="w-20 h-20 rounded-xl object-cover"
                      src={roomImgs[quizRoom] || roomImgs.living}
                      alt="Recommended Product"
                    />
                    <div className="flex-1 text-center sm:text-left">
                      <h5 className="font-bold text-primary">{recommendedProduct.name}</h5>
                      <p className="text-xs text-stone-400 mt-1">{recommendedProduct.description}</p>
                    </div>
                    <Link
                      to={`/products/${recommendedProduct.id || recommendedProduct._id}/customize?color=${encodeURIComponent(
                        quizStyleColor
                      )}&frame_style=${quizStyleFrame}`}
                      onClick={closeQuiz}
                      className="bg-emerald-950 dark:bg-white text-white dark:text-stone-950 px-5 py-3 rounded-xl text-xs font-bold hover:bg-emerald-900 dark:hover:bg-stone-200 transition-colors flex items-center gap-1.5 whitespace-nowrap shadow-md"
                    >
                      Customize
                      <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </Link>
                  </div>
                </div>
                <div className="flex justify-center">
                  <button
                    onClick={() => {
                      setQuizStep(1)
                      setQuizProgress(0)
                    }}
                    className="text-xs text-stone-400 hover:text-emerald-800 dark:hover:text-white underline font-semibold transition-colors"
                  >
                    Retake Discovery Quiz
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

