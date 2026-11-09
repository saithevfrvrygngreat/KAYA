import { useState, useEffect, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import { getProductCutoutPath } from './CustomizePage'

function hexToRgba(hex, alpha) {
  if (!hex || typeof hex !== 'string') return `rgba(234, 179, 8, ${alpha})`
  let c = hex.replace('#', '')
  if (c.length === 3) c = c.split('').map(x => x + x).join('')
  const num = parseInt(c, 16)
  if (isNaN(num)) return `rgba(234, 179, 8, ${alpha})`
  return `rgba(${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}, ${alpha})`
}

export default function DesignPreviewPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [design, setDesign] = useState(null)
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)

  const formatUserShippingAddress = (u) => {
    if (!u) return '';
    const parts = [];
    if (u.address) parts.push(u.address.trim());
    if (u.city && (!u.address || !u.address.toLowerCase().includes(u.city.toLowerCase()))) {
      parts.push(u.city.trim());
    }
    if (u.state && (!u.address || !u.address.toLowerCase().includes(u.state.toLowerCase()))) {
      parts.push(u.state.trim());
    }
    if (u.postal_code && (!u.address || !u.address.includes(u.postal_code))) {
      parts.push(u.postal_code.trim());
    }
    return parts.filter(Boolean).join(', ');
  };

  // Checkout form
  const [customerName, setCustomerName] = useState(user?.name || '')
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '')
  const [customerEmail, setCustomerEmail] = useState(user?.email || '')
  const [shippingAddress, setShippingAddress] = useState(formatUserShippingAddress(user) || '')
  const [submitting, setSubmitting] = useState(false)

  // Razorpay modal state
  const [rzpOpen, setRzpOpen] = useState(false)
  const [rzpState, setRzpState] = useState('select') // select, card, upi, netbanking, bankRedirect, otp, processing, success
  const [rzpCardName, setRzpCardName] = useState('')
  const [rzpCardNo, setRzpCardNo] = useState('')
  const [rzpCardExpiry, setRzpCardExpiry] = useState('')
  const [rzpCardCvv, setRzpCardCvv] = useState('')
  const [rzpOtp, setRzpOtp] = useState('')
  const [upiId, setUpiId] = useState('customer@upi')
  const [upiSeconds, setUpiSeconds] = useState(119)
  const [selectedBank, setSelectedBank] = useState('')
  const [successMethod, setSuccessMethod] = useState('')

  const canvasRef = useRef(null)
  const timerRef = useRef(null)

  useEffect(() => {
    api.get(`/designs/${id}`)
      .then((res) => {
        const d = res.data.data
        setDesign(d)
        setProduct(d.product)
      })
      .catch((err) => {
        console.error(err)
        navigate('/products')
      })
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    if (user) {
      if (!customerName && user.name) setCustomerName(user.name)
      if (!customerEmail && user.email) setCustomerEmail(user.email)
      if (!customerPhone && user.phone) setCustomerPhone(user.phone)
      if (!shippingAddress) {
        const fullAddr = formatUserShippingAddress(user)
        if (fullAddr) setShippingAddress(fullAddr)
      }
    }
  }, [user])

  // Canvas drawing
  useEffect(() => {
    if (!design || !product) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const width = canvas.width
    const height = canvas.height

    const d = design.design_json || {}
    const color = d.color || '#064e3b'
    const frameStyle = d.frame_style || 'black'
    const cat = d.product_category || product.category || 'Wall Decor'
    let fWidth = d.frame_w
    let fHeight = d.frame_h
    if (!fWidth || !fHeight) {
      if (d.size === 'A4') { fWidth = 195; fHeight = 276 }
      else if (d.size === 'A2') { fWidth = 330; fHeight = 467 }
      else if (d.size === 'Square') { fWidth = 280; fHeight = 280 }
      else if (d.size === 'Panoramic') { fWidth = 420; fHeight = 210 }
      else { fWidth = 260; fHeight = 368 }
    }
    const fX = d.offset_x !== undefined ? d.offset_x : (width - fWidth) / 2
    const fY = d.offset_y !== undefined ? d.offset_y : 80

    const drawCanvas = (bgImg, aiImg, prodImg) => {
      ctx.clearRect(0, 0, width, height)
      if (bgImg) {
        ctx.drawImage(bgImg, 0, 0, width, height)
      } else {
        ctx.fillStyle = '#f5f5f4'
        ctx.fillRect(0, 0, width, height)
      }

      // Draw Wall Decor (most common) or generic frame
      if (cat === 'Wall Decor') {
        const isCanvas = (product?.name || '').toLowerCase().includes('canvas')
        const isMirror = (product?.name || '').toLowerCase().includes('mirror')
        const isMacrame = (product?.name || '').toLowerCase().includes('macram')
        const isFrame = (product?.name || '').toLowerCase().includes('frame')
        if ((isCanvas || isMirror || isMacrame || isFrame) && prodImg) {
          ctx.save()
          ctx.shadowColor = 'rgba(0, 0, 0, 0.42)'
          ctx.shadowBlur = 24
          ctx.shadowOffsetX = 8
          ctx.shadowOffsetY = 16
          ctx.drawImage(prodImg, fX, fY, fWidth, fHeight)
          ctx.restore()
          if (aiImg) {
            ctx.save()
            const matX = fX + fWidth * (isFrame ? 0.155 : 0.06)
            const matY = fY + fHeight * (isFrame ? 0.138 : 0.06)
            const matW = fWidth * (isFrame ? 0.69 : 0.88)
            const matH = fHeight * (isFrame ? 0.724 : 0.88)
            ctx.drawImage(aiImg, matX, matY, matW, matH)
            ctx.restore()
          }
          return
        }

        let artX = fX
        let artY = fY
        let artW = fWidth
        let artH = fHeight

        if (frameStyle === 'none') {
          // 3D Borderless Gallery-Wrapped Canvas
          ctx.save()
          ctx.shadowColor = 'rgba(0, 0, 0, 0.45)'
          ctx.shadowBlur = 24
          ctx.shadowOffsetX = 10
          ctx.shadowOffsetY = 16
          ctx.fillStyle = '#1c1917'
          ctx.fillRect(fX, fY, fWidth, fHeight)
          ctx.restore()

          // Right & bottom wrap edge
          ctx.save()
          ctx.fillStyle = 'rgba(0, 0, 0, 0.38)'
          ctx.beginPath()
          ctx.moveTo(fX + fWidth, fY + 6)
          ctx.lineTo(fX + fWidth + 7, fY + 11)
          ctx.lineTo(fX + fWidth + 7, fY + fHeight + 8)
          ctx.lineTo(fX + fWidth, fY + fHeight)
          ctx.closePath()
          ctx.fill()

          ctx.fillStyle = 'rgba(0, 0, 0, 0.48)'
          ctx.beginPath()
          ctx.moveTo(fX + 7, fY + fHeight)
          ctx.lineTo(fX + fWidth, fY + fHeight)
          ctx.lineTo(fX + fWidth + 7, fY + fHeight + 8)
          ctx.lineTo(fX + 11, fY + fHeight + 8)
          ctx.closePath()
          ctx.fill()
          ctx.restore()
        } else {
          const mWidth = 24
          const matWidth = 22

          // Deep Wall Drop Shadow
          ctx.save()
          ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'
          ctx.shadowBlur = 26
          ctx.shadowOffsetX = 10
          ctx.shadowOffsetY = 16
          ctx.fillStyle = '#000000'
          ctx.fillRect(fX, fY, fWidth, fHeight)
          ctx.restore()

          // Mitred Frame Moulding
          ctx.save()
          const finishes = {
            black: { top: '#333336', left: '#262629', bottom: '#0c0c0e', right: '#161618', lip: '#44444a' },
            oak: { top: '#cfa06a', left: '#bd8852', bottom: '#7b4c20', right: '#945f2e', lip: '#e5b882' },
            gold: { top: '#f9e8a2', left: '#e3be5b', bottom: '#9a751b', right: '#b8902b', lip: '#fff4be' },
            white: { top: '#ffffff', left: '#f4f4f6', bottom: '#d1d1d6', right: '#e2e2e7', lip: '#ffffff' }
          }
          const finish = finishes[frameStyle] || finishes.black

          // Top
          ctx.beginPath()
          ctx.moveTo(fX, fY)
          ctx.lineTo(fX + fWidth, fY)
          ctx.lineTo(fX + fWidth - mWidth, fY + mWidth)
          ctx.lineTo(fX + mWidth, fY + mWidth)
          ctx.closePath()
          ctx.fillStyle = finish.top
          ctx.fill()

          // Bottom
          ctx.beginPath()
          ctx.moveTo(fX, fY + fHeight)
          ctx.lineTo(fX + fWidth, fY + fHeight)
          ctx.lineTo(fX + fWidth - mWidth, fY + fHeight - mWidth)
          ctx.lineTo(fX + mWidth, fY + fHeight - mWidth)
          ctx.closePath()
          ctx.fillStyle = finish.bottom
          ctx.fill()

          // Left
          ctx.beginPath()
          ctx.moveTo(fX, fY)
          ctx.lineTo(fX + mWidth, fY + mWidth)
          ctx.lineTo(fX + mWidth, fY + fHeight - mWidth)
          ctx.lineTo(fX, fY + fHeight)
          ctx.closePath()
          ctx.fillStyle = finish.left
          ctx.fill()

          // Right
          ctx.beginPath()
          ctx.moveTo(fX + fWidth, fY)
          ctx.lineTo(fX + fWidth, fY + fHeight)
          ctx.lineTo(fX + fWidth - mWidth, fY + fHeight - mWidth)
          ctx.lineTo(fX + fWidth - mWidth, fY + mWidth)
          ctx.closePath()
          ctx.fillStyle = finish.right
          ctx.fill()

          // Mitre joints
          ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)'
          ctx.lineWidth = 1.2
          ctx.beginPath()
          ctx.moveTo(fX, fY); ctx.lineTo(fX + mWidth, fY + mWidth)
          ctx.moveTo(fX + fWidth, fY); ctx.lineTo(fX + fWidth - mWidth, fY + mWidth)
          ctx.moveTo(fX + fWidth, fY + fHeight); ctx.lineTo(fX + fWidth - mWidth, fY + fHeight - mWidth)
          ctx.moveTo(fX, fY + fHeight); ctx.lineTo(fX + mWidth, fY + fHeight - mWidth)
          ctx.stroke()

          // Inner Beaded Lip
          ctx.strokeStyle = finish.lip
          ctx.lineWidth = 1.5
          ctx.strokeRect(fX + mWidth - 1, fY + mWidth - 1, fWidth - 2 * mWidth + 2, fHeight - 2 * mWidth + 2)
          ctx.restore()

          // Archival Passpartout Mat
          const matX = fX + mWidth
          const matY = fY + mWidth
          const matW = fWidth - 2 * mWidth
          const matH = fHeight - 2 * mWidth
          ctx.fillStyle = '#faf8f5'
          ctx.fillRect(matX, matY, matW, matH)

          artX = matX + matWidth
          artY = matY + matWidth
          artW = matW - 2 * matWidth
          artH = matH - 2 * matWidth

          ctx.strokeStyle = 'rgba(0, 0, 0, 0.25)'
          ctx.lineWidth = 1.5
          ctx.strokeRect(artX, artY, artW, artH)
        }

        if (aiImg) {
          ctx.drawImage(aiImg, artX, artY, artW, artH)
        } else if (prodImg) {
          ctx.drawImage(prodImg, artX, artY, artW, artH)
        } else {
          ctx.fillStyle = color
          ctx.fillRect(artX, artY, artW, artH)
        }
      } else {
        // Categories: Soft Furnishings, Rugs, Lighting, Decorative Accents
        const pName = (design?.product_id?.name || '').toLowerCase()
        const isPendant = pName.includes('pendant')
        const isTableLamp = pName.includes('lamp') && !isPendant
        const isFairyLights = pName.includes('fairy') || pName.includes('string')
        if (isPendant) {
          ctx.save()
          const cx = fX + fWidth / 2
          // Ceiling cord
          ctx.strokeStyle = '#292524'
          ctx.lineWidth = 2.5
          ctx.beginPath()
          ctx.moveTo(cx, 0)
          ctx.lineTo(cx, fY + 10)
          ctx.stroke()

          // Ambient warm light glow
          const glowGrad = ctx.createRadialGradient(cx, fY + fHeight * 0.55, 15, cx, fY + fHeight * 0.55, fWidth * 0.85)
          glowGrad.addColorStop(0, 'rgba(255, 253, 230, 0.95)')
          glowGrad.addColorStop(0.3, hexToRgba(color, 0.5))
          glowGrad.addColorStop(0.7, hexToRgba(color, 0.12))
          glowGrad.addColorStop(1, 'rgba(0,0,0,0)')
          ctx.fillStyle = glowGrad
          ctx.beginPath()
          ctx.arc(cx, fY + fHeight * 0.55, fWidth * 0.85, 0, Math.PI * 2)
          ctx.fill()
          ctx.restore()
        } else if (isTableLamp) {
          ctx.save()
          const cx = fX + fWidth / 2
          // Ambient warm light glow behind drum shade
          const glowGrad = ctx.createRadialGradient(cx, fY + fHeight * 0.22, 15, cx, fY + fHeight * 0.22, fWidth * 0.85)
          glowGrad.addColorStop(0, 'rgba(255, 253, 230, 0.95)')
          glowGrad.addColorStop(0.3, hexToRgba(color, 0.55))
          glowGrad.addColorStop(0.7, hexToRgba(color, 0.14))
          glowGrad.addColorStop(1, 'rgba(0,0,0,0)')
          ctx.fillStyle = glowGrad
          ctx.beginPath()
          ctx.arc(cx, fY + fHeight * 0.22, fWidth * 0.85, 0, Math.PI * 2)
          ctx.fill()
          ctx.restore()
        } else if (isFairyLights) {
          ctx.save()
          const cx = fX + fWidth / 2
          const cy = fY + fHeight / 2
          const fairyGlow = ctx.createRadialGradient(cx, cy, 25, cx, cy, fWidth * 0.65)
          fairyGlow.addColorStop(0, 'rgba(255, 248, 220, 0.45)')
          fairyGlow.addColorStop(0.35, 'rgba(255, 215, 120, 0.2)')
          fairyGlow.addColorStop(0.7, 'rgba(255, 190, 80, 0.08)')
          fairyGlow.addColorStop(1, 'rgba(0,0,0,0)')
          ctx.fillStyle = fairyGlow
          ctx.fillRect(fX - 40, fY - 40, fWidth + 80, fHeight + 80)
          ctx.restore()
        }

        ctx.save()
        ctx.shadowColor = 'rgba(0,0,0,0.35)'
        ctx.shadowBlur = 20
        ctx.shadowOffsetX = 4
        ctx.shadowOffsetY = 8

        if (prodImg) {
          ctx.drawImage(prodImg, fX, fY, fWidth, fHeight)

          if (color && color !== '#064e3b') {
            ctx.fillStyle = color
            ctx.globalCompositeOperation = 'multiply'
            ctx.globalAlpha = 0.28
            ctx.fillRect(fX, fY, fWidth, fHeight)
          }

          if (aiImg) {
            const pName = (design?.product_id?.name || '').toLowerCase()
            const isTray = pName.includes('tray') || pName.includes('raffia')
            ctx.globalAlpha = 0.62
            if (isTray) {
              ctx.drawImage(aiImg, fX + fWidth * 0.2, fY + fHeight * 0.36, fWidth * 0.6, fHeight * 0.44)
            } else if (isTableLamp) {
              ctx.drawImage(aiImg, fX + fWidth * 0.03, fY + fHeight * 0.02, fWidth * 0.94, fHeight * 0.44)
            } else {
              ctx.drawImage(aiImg, fX + fWidth * 0.15, fY + fHeight * 0.15, fWidth * 0.7, fHeight * 0.7)
            }
          }
        } else {
          ctx.fillStyle = color
          ctx.fillRect(fX, fY, fWidth, fHeight)
          if (aiImg) ctx.drawImage(aiImg, fX, fY, fWidth, fHeight)
        }
        ctx.restore()
      }


    }

    // Load backdrop
    const backdrops = {
      living: '/images/masterpiece/bg_slideshow_one.png',
      bedroom: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1200&q=80',
      office: '/images/masterpiece/study_office_backdrop.jpg'
    }

    let bgSrc = backdrops[d.backdrop] || backdrops.living
    if (design.room_image_path) bgSrc = `/uploads/${design.room_image_path}`

    const bgImage = new Image()
    bgImage.onload = () => {
      let prodImage = null
      const loadNext = () => {
        if (d.ai_art_spec?.synthesized_image_base64) {
          const aiImage = new Image()
          aiImage.onload = () => drawCanvas(bgImage, aiImage, prodImage)
          aiImage.src = d.ai_art_spec.synthesized_image_base64
        } else {
          drawCanvas(bgImage, null, prodImage)
        }
      }

      const cutoutSrc = getProductCutoutPath(product) || product?.image_path
      if (cutoutSrc) {
        prodImage = new Image()
        if (cutoutSrc.startsWith('http')) prodImage.crossOrigin = 'anonymous'
        prodImage.onload = () => loadNext()
        prodImage.onerror = () => { prodImage = null; loadNext(); }
        prodImage.src = cutoutSrc
      } else {
        loadNext()
      }
    }
    bgImage.src = bgSrc
  }, [design, product])

  // Razorpay simulated timer
  useEffect(() => {
    if (rzpState === 'upi') {
      setUpiSeconds(119)
      timerRef.current = setInterval(() => {
        setUpiSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [rzpState])

  const openCheckout = () => {
    if (!customerName || !customerPhone || !customerEmail || !shippingAddress) {
      alert('Please fill in all delivery details first.')
      return
    }
    setRzpState('select')
    setRzpOpen(true)
  }

  const completePaymentAndPlaceOrder = async (payMethod) => {
    setRzpState('processing')
    setTimeout(async () => {
      setRzpState('success')
      setSuccessMethod(payMethod)
      const payId = 'pay_' + Math.random().toString(36).substring(2, 11)

      setTimeout(async () => {
        setRzpOpen(false)
        setSubmitting(true)
        try {
          const res = await api.post('/orders', {
            custom_design_id: design._id || design.id,
            shipping_address: shippingAddress,
            customer_name: customerName,
            customer_phone: customerPhone,
            customer_email: customerEmail,
            payment_id: payId
          })
          navigate(`/orders/${res.data.order_id || res.data.data._id}`)
        } catch (err) {
          alert(err.response?.data?.message || 'Failed to place order.')
          setSubmitting(false)
        }
      }, 1500)
    }, 1500)
  }

  if (loading || !design || !product) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
      </div>
    )
  }

  const d = design.design_json || {}
  const totalPrice = product.base_price * 1.18

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-10">
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="inline-block px-3 py-1 mb-2 rounded-full bg-emerald-500/10 dark:bg-white/10 text-emerald-800 dark:text-white font-label-sm uppercase tracking-widest text-[11px]">
              Step 3 of 3
            </span>
            <h1 className="font-headline-lg text-4xl text-primary leading-tight">Review Your Custom Decor</h1>
          </div>
          <Link
            className="inline-flex items-center gap-2 text-stone-500 hover:text-emerald-800 dark:hover:text-white transition-colors font-semibold text-sm"
            to={`/products/${product._id || product.id}/customize`}
          >
            <span className="material-symbols-outlined text-[18px]">edit</span>
            Re-customize Design
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Live Mockup Curation Showcase */}
        <div className="lg:col-span-8 bg-white dark:bg-stone-950 p-8 rounded-3xl whisper-shadow border border-stone-100 dark:border-stone-900">
          <h2 className="font-headline-md text-xl text-primary mb-6">Visualizer Integration</h2>
          <div className="relative rounded-2xl overflow-hidden border border-stone-200 dark:border-stone-800 bg-stone-100 whisper-shadow mb-6">
            <canvas ref={canvasRef} width="760" height="490" className="w-full h-auto block" />
          </div>

          {design.room_image_path && (
            <div className="mt-8 space-y-4">
              <h3 className="font-headline-sm text-sm uppercase tracking-widest text-stone-400 font-semibold">
                Your Room Wall Preview
              </h3>
              <div className="rounded-2xl overflow-hidden border border-stone-200 dark:border-stone-800 whisper-shadow">
                <img
                  className="w-full h-auto max-h-[300px] object-cover"
                  src={`/uploads/${design.room_image_path}`}
                  alt="Uploaded room preview"
                />
              </div>
            </div>
          )}
        </div>

        {/* Order Placement Panel */}
        <div className="lg:col-span-4 bg-white dark:bg-stone-950 p-8 rounded-3xl whisper-shadow border border-stone-100 dark:border-stone-900 flex flex-col justify-between">
          <div className="space-y-6">
            <h2 className="font-headline-md text-xl text-primary border-b border-stone-100 dark:border-stone-900 pb-4">
              Order Specifications
            </h2>

            <div className="space-y-4 text-sm font-medium">
              <div className="flex justify-between py-1.5 border-b border-stone-50 dark:border-stone-900/50">
                <span className="text-stone-400">Design Signature ID</span>
                <span className="text-primary font-mono text-xs">{design._id || design.id}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-stone-50 dark:border-stone-900/50">
                <span className="text-stone-400">Selected Base</span>
                <span className="text-primary">{product.name}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-stone-50 dark:border-stone-900/50">
                <span className="text-stone-400">Curation Status</span>
                <span className="text-emerald-800 dark:text-white font-bold uppercase tracking-wider text-[10px] bg-emerald-500/10 dark:bg-white/10 px-2 py-0.5 rounded-full">
                  {design.status}
                </span>
              </div>
              <div className="flex justify-between pt-4">
                <span className="text-stone-400 text-base">Total Cost (incl. GST)</span>
                <span className="text-xl font-extrabold text-emerald-900 dark:text-white">
                  INR {Number(totalPrice).toFixed(2)}
                </span>
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                openCheckout()
              }}
              className="space-y-4 pt-6 border-t border-stone-100 dark:border-stone-900"
            >
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-[10px] uppercase tracking-widest font-semibold text-stone-400 dark:text-stone-500">
                    Full Name
                  </label>
                  <input
                    name="customer_name"
                    required
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Arjun Sharma"
                    className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-emerald-600 dark:focus:border-white transition-colors text-stone-900 dark:text-white text-xs font-semibold"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[10px] uppercase tracking-widest font-semibold text-stone-400 dark:text-stone-500">
                    Phone
                  </label>
                  <input
                    name="customer_phone"
                    required
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-emerald-600 dark:focus:border-white transition-colors text-stone-900 dark:text-white text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] uppercase tracking-widest font-semibold text-stone-400 dark:text-stone-500">
                  Email Address
                </label>
                <input
                  name="customer_email"
                  required
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="arjun@example.com"
                  className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-emerald-600 dark:focus:border-white transition-colors text-stone-900 dark:text-white text-xs font-semibold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] uppercase tracking-widest font-semibold text-stone-400 dark:text-stone-500">
                  Shipping Destination
                </label>
                <textarea
                  name="shipping_address"
                  rows="3"
                  required
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-emerald-600 dark:focus:border-white transition-colors text-stone-900 dark:text-white text-xs resize-none font-semibold"
                  placeholder="Enter your full street address, landmark and pin code..."
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#2d72d9] text-white px-6 py-3.5 rounded-xl font-semibold hover:bg-[#2561c0] shadow-lg transition-all flex justify-center items-center gap-2 text-xs disabled:opacity-50"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M7.5 3L4 14.5H9.5L8 21L20 9.5H14L17.5 3H7.5Z" fill="white" />
                </svg>
                Pay securely with Razorpay
              </button>
              <p className="text-center text-[10px] text-stone-400 mt-1">UPI · Cards · Netbanking · Wallets</p>
            </form>
          </div>

          <div className="mt-8 border-t border-stone-100 dark:border-stone-900 pt-6">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-amber-600">verified_user</span>
              <p className="text-[11px] text-stone-400 leading-relaxed">
                Secure transaction processed. Handcrafted at our central design studio. Estimated delivery: 3-5 business
                days.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Razorpay Sandbox Modal */}
      {rzpOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-stone-900 rounded-3xl overflow-hidden shadow-2xl border border-stone-100 dark:border-stone-800 flex flex-col font-sans select-none">
            {/* Header */}
            <div className="bg-[#121c2c] px-6 py-5 flex items-center justify-between border-b border-stone-800">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#2d72d9] flex items-center justify-center text-white font-black shadow-sm">
                  R
                </div>
                <div>
                  <h3 className="text-white font-extrabold text-sm tracking-wide">Razorpay Checkout</h3>
                  <p className="text-stone-400 text-[10px] uppercase font-bold tracking-wider">KaYa Curation Covenants</p>
                </div>
              </div>
              <button onClick={() => setRzpOpen(false)} className="text-stone-400 hover:text-white transition-colors">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Test Mode Warning */}
            <div className="bg-amber-500/10 border-b border-amber-500/20 px-6 py-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-amber-500 text-[14px] font-bold">terminal</span>
              <span className="text-[10px] text-amber-700 dark:text-amber-300 font-bold uppercase tracking-wider">
                Test Mode — No Real Money Deducted
              </span>
            </div>

            {/* Body */}
            <div className="p-6 flex-1 flex flex-col">
              {rzpState === 'select' && (
                <div className="space-y-5">
                  <div className="text-center py-2">
                    <p className="text-[10px] text-stone-400 uppercase tracking-widest font-bold">Transaction Value</p>
                    <p className="text-3xl font-extrabold text-stone-900 dark:text-white mt-1">
                      INR {Number(totalPrice).toFixed(2)}
                    </p>
                  </div>
                  <p className="text-xs font-bold text-stone-400 uppercase tracking-wider border-b border-stone-100 dark:border-stone-800 pb-2">
                    Select Payment Method
                  </p>
                  <div className="space-y-2">
                    <button
                      onClick={() => setRzpState('card')}
                      className="w-full flex items-center justify-between p-4 rounded-2xl border border-stone-200 dark:border-stone-800 hover:border-[#2d72d9] hover:bg-stone-50 dark:hover:bg-stone-850 transition-all text-left"
                    >
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-[#2d72d9]">credit_card</span>
                        <div>
                          <p className="text-xs font-bold text-stone-800 dark:text-stone-200">Credit / Debit Card</p>
                          <p className="text-[10px] text-stone-400 font-medium">Visa, Mastercard, RuPay</p>
                        </div>
                      </div>
                      <span className="material-symbols-outlined text-stone-400 text-[16px]">chevron_right</span>
                    </button>
                    <button
                      onClick={() => setRzpState('upi')}
                      className="w-full flex items-center justify-between p-4 rounded-2xl border border-stone-200 dark:border-stone-800 hover:border-[#2d72d9] hover:bg-stone-50 dark:hover:bg-stone-850 transition-all text-left"
                    >
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-emerald-600">qr_code_2</span>
                        <div>
                          <p className="text-xs font-bold text-stone-800 dark:text-stone-200">UPI / QR Code</p>
                          <p className="text-[10px] text-stone-400 font-medium">Google Pay, PhonePe, Paytm, BHIM</p>
                        </div>
                      </div>
                      <span className="material-symbols-outlined text-stone-400 text-[16px]">chevron_right</span>
                    </button>
                    <button
                      onClick={() => setRzpState('netbanking')}
                      className="w-full flex items-center justify-between p-4 rounded-2xl border border-stone-200 dark:border-stone-800 hover:border-[#2d72d9] hover:bg-stone-50 dark:hover:bg-stone-850 transition-all text-left"
                    >
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-purple-600">account_balance</span>
                        <div>
                          <p className="text-xs font-bold text-stone-800 dark:text-stone-200">Netbanking</p>
                          <p className="text-[10px] text-stone-400 font-medium">SBI, HDFC, ICICI, Axis Bank</p>
                        </div>
                      </div>
                      <span className="material-symbols-outlined text-stone-400 text-[16px]">chevron_right</span>
                    </button>
                  </div>
                </div>
              )}

              {rzpState === 'card' && (
                <div className="space-y-4">
                  <button
                    onClick={() => setRzpState('select')}
                    className="inline-flex items-center gap-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 text-xs font-semibold mb-2"
                  >
                    <span className="material-symbols-outlined text-[16px]">arrow_back</span> Back to payment choices
                  </button>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-stone-400">Cardholder Name</label>
                    <input
                      type="text"
                      value={rzpCardName}
                      onChange={(e) => setRzpCardName(e.target.value)}
                      placeholder="ARJUN SHARMA"
                      className="w-full bg-stone-50 dark:bg-stone-850 border border-stone-200 dark:border-stone-800 rounded-xl px-4 py-2.5 text-xs text-stone-900 dark:text-white focus:outline-none focus:border-[#2d72d9]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-stone-400">Card Number</label>
                    <input
                      type="text"
                      maxLength="19"
                      value={rzpCardNo}
                      onChange={(e) => setRzpCardNo(e.target.value)}
                      placeholder="4111 1111 1111 1111"
                      className="w-full bg-stone-50 dark:bg-stone-850 border border-stone-200 dark:border-stone-800 rounded-xl px-4 py-2.5 text-xs text-stone-900 dark:text-white focus:outline-none focus:border-[#2d72d9]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-stone-400">Expiry Date</label>
                      <input
                        type="text"
                        value={rzpCardExpiry}
                        onChange={(e) => setRzpCardExpiry(e.target.value)}
                        placeholder="12/28"
                        className="w-full bg-stone-50 dark:bg-stone-850 border border-stone-200 dark:border-stone-800 rounded-xl px-4 py-2.5 text-xs text-stone-900 dark:text-white focus:outline-none focus:border-[#2d72d9]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-stone-400">CVV</label>
                      <input
                        type="password"
                        maxLength="3"
                        value={rzpCardCvv}
                        onChange={(e) => setRzpCardCvv(e.target.value)}
                        placeholder="•••"
                        className="w-full bg-stone-50 dark:bg-stone-850 border border-stone-200 dark:border-stone-800 rounded-xl px-4 py-2.5 text-xs text-stone-900 dark:text-white focus:outline-none focus:border-[#2d72d9]"
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => setRzpState('otp')}
                    className="w-full mt-4 bg-[#2d72d9] text-white py-3 rounded-xl font-bold hover:bg-[#2561c0] transition-colors flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[18px]">lock</span>
                    Pay &amp; Authenticate
                  </button>
                </div>
              )}

              {rzpState === 'otp' && (
                <div className="space-y-4 text-center">
                  <div className="flex justify-center mb-1">
                    <span className="material-symbols-outlined text-[#2d72d9] text-[36px] animate-pulse">lock_person</span>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-stone-800 dark:text-white">3D Secure Card Verification</h4>
                    <p className="text-[10px] text-stone-400 mt-1">
                      Enter sandbox test OTP: <strong className="text-stone-900 dark:text-white">123456</strong>
                    </p>
                  </div>
                  <div className="max-w-[180px] mx-auto">
                    <input
                      type="text"
                      maxLength="6"
                      value={rzpOtp}
                      onChange={(e) => setRzpOtp(e.target.value)}
                      placeholder="••••••"
                      className="w-full tracking-[1.5em] text-center font-bold bg-stone-50 dark:bg-stone-850 border border-stone-200 dark:border-stone-800 rounded-xl px-3 py-3 text-xs text-stone-900 dark:text-white focus:outline-none focus:border-[#2d72d9]"
                    />
                  </div>
                  <button
                    onClick={() => completePaymentAndPlaceOrder('Card')}
                    className="w-full bg-emerald-700 text-white py-3 rounded-xl font-bold hover:bg-emerald-800 transition-colors flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[18px]">verified</span>
                    Verify OTP &amp; Complete Checkout
                  </button>
                </div>
              )}

              {rzpState === 'upi' && (
                <div className="space-y-4 text-center">
                  <button
                    onClick={() => setRzpState('select')}
                    className="inline-flex items-center gap-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 text-xs font-semibold mb-2 self-start"
                  >
                    <span className="material-symbols-outlined text-[16px]">arrow_back</span> Back
                  </button>
                  <div className="space-y-1 text-left">
                    <label className="text-[10px] uppercase font-bold text-stone-400">Enter UPI ID</label>
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      className="w-full bg-stone-50 dark:bg-stone-855 border border-stone-200 dark:border-stone-800 rounded-xl px-4 py-3 text-xs text-stone-900 dark:text-white font-semibold focus:outline-none focus:border-[#2d72d9]"
                    />
                  </div>
                  <div className="bg-stone-50 dark:bg-stone-850 border border-stone-200 dark:border-stone-800 rounded-xl px-4 py-2 text-[10px] font-mono font-bold text-stone-500">
                    Remaining:{' '}
                    <span>
                      {Math.floor(upiSeconds / 60)
                        .toString()
                        .padStart(2, '0')}
                      :{(upiSeconds % 60).toString().padStart(2, '0')}
                    </span>
                  </div>
                  <button
                    onClick={() => completePaymentAndPlaceOrder('UPI')}
                    className="w-full bg-emerald-700 text-white py-2.5 rounded-xl font-bold hover:bg-emerald-800 transition-colors text-xs"
                  >
                    Approve Sandbox Transaction
                  </button>
                </div>
              )}

              {rzpState === 'netbanking' && (
                <div className="space-y-4">
                  <button
                    onClick={() => setRzpState('select')}
                    className="inline-flex items-center gap-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 text-xs font-semibold mb-2"
                  >
                    <span className="material-symbols-outlined text-[16px]">arrow_back</span> Back
                  </button>
                  <p className="text-[10px] uppercase font-bold text-stone-400">Popular Banks</p>
                  <div className="grid grid-cols-2 gap-2">
                    {['SBI', 'HDFC', 'ICICI', 'Axis'].map((b) => (
                      <button
                        key={b}
                        onClick={() => {
                          setSelectedBank(b)
                          setRzpState('bankRedirect')
                        }}
                        className="flex items-center gap-2 p-3 rounded-xl border border-stone-200 dark:border-stone-800 text-left hover:border-[#2d72d9]"
                      >
                        <span className="w-3.5 h-3.5 rounded-full bg-sky-500 flex-shrink-0"></span>
                        <span className="text-[10px] font-bold text-stone-700 dark:text-stone-300">{b}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {rzpState === 'bankRedirect' && (
                <div className="flex flex-col items-center justify-center py-6 text-center space-y-5">
                  <span className="material-symbols-outlined text-[44px] text-amber-500 animate-bounce">security</span>
                  <div>
                    <h4 className="text-xs font-bold text-stone-800 dark:text-white">{selectedBank} Sandbox</h4>
                    <p className="text-[10px] text-stone-400 mt-1">This is a simulated secure bank gateway.</p>
                  </div>
                  <button
                    onClick={() => completePaymentAndPlaceOrder('Netbanking')}
                    className="bg-[#2d72d9] text-white py-2.5 px-6 rounded-xl font-bold text-xs"
                  >
                    Approve Sandbox
                  </button>
                </div>
              )}

              {rzpState === 'processing' && (
                <div className="flex flex-col items-center justify-center py-10 text-center space-y-4">
                  <div className="w-14 h-14 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin"></div>
                  <div>
                    <h4 className="text-xs font-bold text-stone-800 dark:text-white">Processing Razorpay Transaction</h4>
                    <p className="text-[10px] text-stone-400 mt-1">Securing network protocols...</p>
                  </div>
                </div>
              )}

              {rzpState === 'success' && (
                <div className="flex flex-col items-center justify-center py-10 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500 text-emerald-600 flex items-center justify-center shadow-lg">
                    <span className="material-symbols-outlined text-[40px] font-black">check</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-stone-900 dark:text-white">Checkout Completed!</h4>
                    <p className="text-[10px] text-stone-400 mt-1">{successMethod} Transaction Recorded.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

