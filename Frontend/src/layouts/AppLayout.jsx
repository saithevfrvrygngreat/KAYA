import { useState, useEffect, useCallback } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import KayaConcierge from '../components/KayaConcierge'
import ThemePullChain from '../components/ThemePullChain'

function updateNavCartCount() {
  try {
    const cart = JSON.parse(localStorage.getItem('kaya_cart') || '[]')
    return cart.reduce((s, i) => s + (i.qty || 1), 0)
  } catch { return 0 }
}

export default function AppLayout() {
  const { user, logout, isAdmin } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [cartCount, setCartCount] = useState(updateNavCartCount())
  const [flash, setFlash] = useState(null)

  // Scroll smoothly to top on every route change
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [location.pathname])

  // Update cart count whenever location changes or storage changes
  useEffect(() => {
    setCartCount(updateNavCartCount())
    const handler = () => setCartCount(updateNavCartCount())
    window.addEventListener('kaya_cart_updated', handler)
    window.addEventListener('storage', handler)
    return () => { window.removeEventListener('kaya_cart_updated', handler); window.removeEventListener('storage', handler) }
  }, [location.pathname])

  // Flash message from navigation state
  useEffect(() => {
    if (location.state?.flash) {
      setFlash(location.state.flash)
      window.history.replaceState({}, document.title)
    }
  }, [location.state])

  // Automatically dismiss flash pop up after exactly 1.5 seconds (1500ms)
  useEffect(() => {
    if (flash) {
      const t = setTimeout(() => setFlash(null), 1500)
      return () => clearTimeout(t)
    }
  }, [flash])

  const isActive = (path) => location.pathname === path

  const handleLogout = () => {
    logout()
    setMobileOpen(false)
    setFlash({ type: 'success', message: 'Logged out successfully!' })
    navigate('/', { replace: true, state: { flash: { type: 'success', message: 'Logged out successfully!' } } })
  }

  return (
    <div className="bg-background text-on-background font-body-md transition-colors duration-500">
      {/* Interactive Tactile Pull-chain Theme Switch */}
      <ThemePullChain />

      {/* Navbar - Fixed firmly to top-0 to guarantee 0px gap during scrolling */}
      <nav className="fixed top-0 left-0 right-0 w-full z-50 bg-white/80 dark:bg-stone-950/80 backdrop-blur-md border-b border-stone-100 dark:border-stone-800 shadow-[0_10px_40px_-15px_rgba(6,78,59,0.04)]">
        <div className="flex justify-between items-center max-w-7xl mx-auto px-6 md:px-12 h-20">
          <div className="flex items-center gap-3">
            <Link to="/" className="text-2xl font-extrabold tracking-[0.25em] uppercase text-emerald-900 dark:text-white hover:opacity-80 transition-opacity">
              KaYa
            </Link>
            {isAdmin && (
              <span className="bg-stone-100 dark:bg-white/10 text-stone-900 dark:text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-md border border-stone-200 dark:border-white/20">
                Admin
              </span>
            )}
          </div>
          <div className="hidden md:flex items-center gap-8 font-plus-jakarta-sans text-sm tracking-wide">
            {[['/', 'Home'], ['/products', 'Products'], ['/customize', 'Customize'], ['/ai-designer', 'AI Designer']].map(([path, label]) => (
              <Link key={path} to={path} className={isActive(path) ? 'text-emerald-900 dark:text-white font-semibold border-b-2 border-emerald-900 dark:border-white pb-1' : 'text-stone-500 dark:text-stone-400 hover:text-emerald-800 dark:hover:text-white transition-colors'}>{label}</Link>
            ))}
          </div>
          <div className="flex items-center gap-3.5">
            {/* Cart option is strictly hidden for administrators */}
            {!isAdmin && (
              <Link to="/cart" className="relative p-2 text-stone-500 hover:text-emerald-800 dark:hover:text-white transition-colors" title="Shopping Cart">
                <span className="material-symbols-outlined text-[24px]">shopping_bag</span>
                {cartCount > 0 && <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-emerald-700 dark:bg-white dark:text-stone-950 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 leading-none">{cartCount}</span>}
              </Link>
            )}
            {user ? (
              <>
                {isAdmin && (
                  <Link
                    to="/admin"
                    className={`hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                      isActive('/admin')
                        ? 'bg-stone-100 dark:bg-white/10 text-stone-900 dark:text-white border border-stone-200 dark:border-white/20'
                        : 'text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-900'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px] text-stone-700 dark:text-white">admin_panel_settings</span>
                    <span>Admin Portal</span>
                  </Link>
                )}
                {!isAdmin && (
                  <Link to="/dashboard" className="hidden md:inline-flex items-center gap-2 text-sm font-semibold text-emerald-900 dark:text-white hover:opacity-80 transition-opacity">
                    {user.profile_image ? (
                      <img src={user.profile_image} alt={user.name} className="w-7 h-7 rounded-full object-cover border border-emerald-500/40 dark:border-white/30 shadow-sm" />
                    ) : (
                      <span className="w-7 h-7 rounded-full bg-emerald-950 dark:bg-stone-800 text-white flex items-center justify-center text-xs font-bold">
                        {user.name?.charAt(0).toUpperCase()}
                      </span>
                    )}
                    <span>Profile &amp; Orders</span>
                  </Link>
                )}
                {isAdmin && (
                  <div className="hidden md:flex items-center gap-2 pl-1">
                    {user.profile_image ? (
                      <img src={user.profile_image} alt={user.name} className="w-7 h-7 rounded-full object-cover border border-stone-200 dark:border-white/30 shadow-sm" />
                    ) : (
                      <span className="w-7 h-7 rounded-full bg-stone-900 dark:bg-white text-white dark:text-stone-950 flex items-center justify-center text-xs font-bold">
                        {user.name?.charAt(0).toUpperCase() || 'A'}
                      </span>
                    )}
                    <span className="text-xs font-semibold text-stone-900 dark:text-white max-w-[120px] truncate">{user.name || 'Admin'}</span>
                  </div>
                )}
                <button onClick={handleLogout} className="hidden md:inline px-3 py-1.5 text-xs font-semibold text-stone-500 hover:text-rose-600 transition-colors">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="hidden md:inline px-5 py-2 text-sm font-semibold text-stone-500 hover:text-emerald-800 dark:hover:text-white transition-colors">Login</Link>
                <Link to="/register" className="hidden md:inline bg-primary dark:bg-white text-white dark:text-stone-950 px-6 py-2.5 rounded-lg text-sm font-semibold hover:opacity-80 dark:hover:bg-stone-200 transition-all">Sign Up</Link>
              </>
            )}
            <button id="mobileMenuBtn" className="md:hidden p-2 text-stone-600 dark:text-stone-300 hover:text-emerald-800 dark:hover:text-white transition-colors" onClick={() => setMobileOpen(v => !v)} aria-label="Open menu">
              <span className="material-symbols-outlined text-[26px]">{mobileOpen ? 'close' : 'menu'}</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40" onClick={() => setMobileOpen(false)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
          <div className="absolute top-0 right-0 h-full w-72 bg-white dark:bg-stone-950 shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-5 border-b border-stone-100 dark:border-stone-800">
              <span className="text-xl font-extrabold tracking-[0.25em] uppercase text-emerald-900 dark:text-white">KaYa</span>
              <button onClick={() => setMobileOpen(false)} className="p-2 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors"><span className="material-symbols-outlined">close</span></button>
            </div>
            <nav className="flex flex-col gap-1 p-4 flex-1">
              {[
                ['/', 'home', 'Home'],
                ['/products', 'storefront', 'Products'],
                ['/customize', 'design_services', 'Customize'],
                ['/ai-designer', 'auto_awesome', 'AI Designer'],
                ...(!isAdmin ? [['/cart', 'shopping_bag', 'Cart']] : [])
              ].map(([path, icon, label]) => (
                <Link key={path} to={path} onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-stone-700 dark:text-stone-300 hover:bg-emerald-50 dark:hover:bg-stone-900 hover:text-emerald-800 dark:hover:text-white font-semibold transition-colors">
                  <span className="material-symbols-outlined text-[20px]">{icon}</span> {label}
                </Link>
              ))}
              {user ? (
                <>
                  {isAdmin ? (
                    <Link to="/admin" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-stone-900 dark:text-white bg-stone-100 dark:bg-white/10 border border-stone-200 dark:border-white/20 font-bold transition-colors"><span className="material-symbols-outlined text-[20px] text-stone-700 dark:text-white">shield_person</span> Admin Portal</Link>
                  ) : (
                    <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-stone-700 dark:text-stone-300 hover:bg-emerald-50 dark:hover:bg-stone-900 hover:text-emerald-800 dark:hover:text-white font-semibold transition-colors">
                      {user.profile_image ? (
                        <img src={user.profile_image} alt={user.name} className="w-6 h-6 rounded-full object-cover border border-emerald-500/40 dark:border-white/40" />
                      ) : (
                        <span className="material-symbols-outlined text-[20px]">account_circle</span>
                      )}
                      My Profile &amp; Orders
                    </Link>
                  )}
                </>
              ) : (
                <div className="border-t border-stone-100 dark:border-stone-800 pt-4 mt-2 flex flex-col gap-2">
                  <Link to="/login" onClick={() => setMobileOpen(false)} className="px-4 py-3 text-center rounded-xl border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 font-semibold text-sm hover:bg-stone-50 dark:hover:bg-stone-900 transition-colors">Login</Link>
                  <Link to="/register" onClick={() => setMobileOpen(false)} className="px-4 py-3 text-center rounded-xl bg-emerald-950 dark:bg-white text-white dark:text-stone-950 font-semibold text-sm hover:opacity-90 transition-opacity">Sign Up</Link>
                </div>
              )}
            </nav>
            {user && (
              <div className="p-4 border-t border-stone-100 dark:border-stone-800">
                <button onClick={handleLogout} className="w-full py-3 rounded-xl border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 font-semibold text-sm hover:bg-rose-50 dark:hover:bg-rose-950 transition-colors">Logout</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Floating overlay flash notification (positioned below navbar, supports dark/light mode) */}
      {flash && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[99999] w-[92%] max-w-md pointer-events-auto transition-all animate-fade-in shadow-2xl">
          <div
            className={`flex items-center justify-between gap-3 px-5 py-3.5 rounded-2xl backdrop-blur-xl border transition-colors duration-300 ${
              flash.type === 'success'
                ? 'bg-white/95 dark:bg-stone-900/95 border-emerald-600/30 dark:border-white/20 text-stone-900 dark:text-white shadow-[0_10px_35px_rgba(16,185,129,0.18)] dark:shadow-[0_10px_35px_rgba(0,0,0,0.5)]'
                : 'bg-white/95 dark:bg-rose-950/95 border-rose-500/30 dark:border-rose-500/30 text-stone-900 dark:text-rose-100 shadow-[0_10px_35px_rgba(244,63,94,0.18)] dark:shadow-[0_10px_35px_rgba(159,18,57,0.45)]'
            }`}
          >
            <div className="flex items-center gap-3">
              <span
                className={`material-symbols-outlined text-[22px] font-bold ${
                  flash.type === 'success' ? 'text-emerald-600 dark:text-white' : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {flash.type === 'success' ? 'check_circle' : 'error'}
              </span>
              <span className="text-sm font-semibold tracking-wide">{flash.message}</span>
            </div>
            <button
              onClick={() => setFlash(null)}
              className="text-stone-400 hover:text-stone-700 dark:text-stone-300 dark:hover:text-white transition-colors p-1"
              aria-label="Dismiss notification"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
        </div>
      )}

      <main className="min-h-screen pt-20">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="w-full pt-20 pb-10 bg-stone-50 dark:bg-stone-950 border-t border-stone-200 dark:border-stone-800">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
              <div className="col-span-1">
                <div className="text-lg font-extrabold tracking-[0.2em] uppercase text-emerald-900 dark:text-white mb-6">KaYa</div>
                <p className="text-stone-500 dark:text-stone-400 font-body-md mb-6 leading-relaxed">Defining the art of personalized luxury for the modern home. Impeccable craft, innovative technology.</p>
                <div className="flex gap-4">
                  {['public', 'alternate_email', 'share'].map(icon => (
                    <a key={icon} href="#" className="text-stone-400 hover:text-emerald-700 dark:hover:text-white transition-colors"><span className="material-symbols-outlined">{icon}</span></a>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-label-sm text-stone-900 dark:text-white mb-6 uppercase tracking-widest">Collections</h4>
                <ul className="space-y-4 font-body-md text-stone-500 dark:text-stone-400">
                  {['Wall Gallery', 'Lighting Sculptures', 'Soft Goods', 'New Arrivals'].map(item => (
                    <li key={item}><Link to="/products" className="hover:text-emerald-700 dark:hover:text-white transition-colors">{item}</Link></li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-label-sm text-stone-900 dark:text-white mb-6 uppercase tracking-widest">Experience</h4>
                <ul className="space-y-4 font-body-md text-stone-500 dark:text-stone-400">
                  <li><Link to="/customize" className="hover:text-emerald-700 dark:hover:text-white transition-colors">AR Visualizer</Link></li>
                  <li><a href="#" className="hover:text-emerald-700 dark:hover:text-white transition-colors">AI Curation Quiz</a></li>
                  <li><Link to="/ai-designer" className="hover:text-emerald-700 dark:hover:text-white transition-colors">AI Room Designer</Link></li>
                  <li><Link to="/products" className="hover:text-emerald-700 dark:hover:text-white transition-colors">Bespoke Design Service</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-label-sm text-stone-900 dark:text-white mb-6 uppercase tracking-widest">Newsletter</h4>
                <p className="text-stone-500 mb-4 font-body-md">Join our inner circle for exclusive design previews.</p>
                <div className="flex">
                  <input className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-600 px-4 py-3 rounded-l-lg w-full focus:outline-none focus:border-primary dark:focus:border-white" placeholder="Email Address" type="email" />
                  <button className="bg-primary dark:bg-white text-white dark:text-stone-950 px-4 py-3 rounded-r-lg hover:opacity-90 dark:hover:bg-stone-200 transition-colors"><span className="material-symbols-outlined">arrow_forward</span></button>
                </div>
              </div>
            </div>
            <div className="flex flex-col md:flex-row justify-between items-center gap-8 pt-10 border-t border-stone-200 dark:border-stone-800">
              <div className="font-plus-jakarta-sans text-xs uppercase tracking-widest text-stone-400">© 2026 KaYa. The Art of Living Well.</div>
              <div className="flex flex-wrap justify-center gap-8 font-plus-jakarta-sans text-xs uppercase tracking-widest">
                {['Sustainability', 'Shipping', 'Returns', 'Privacy Policy'].map(l => (
                  <a key={l} href="#" className="text-stone-400 dark:text-stone-500 hover:text-emerald-700 dark:hover:text-white transition-colors">{l}</a>
                ))}
              </div>
            </div>
          </div>
        </footer>

      {/* KaYa Concierge Chatbot */}
      <KayaConcierge />
    </div>
  )
}

