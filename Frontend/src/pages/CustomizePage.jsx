import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom'
import api from '../services/api'

export const PRODUCT_CUTOUT_MAP = {
  'Artisan Table Lamp': '/images/masterpiece/cutouts/product_lamp_cutout.png',
  'Artisan Ceramic Table Lamp': '/images/masterpiece/cutouts/product_lamp_cutout.png',
  'Woven Rattan Pendant Lamp': '/images/masterpiece/cutouts/product_pendant_cutout.png',
  'Rattan Pendant Shade': '/images/masterpiece/cutouts/product_pendant_cutout.png',
  'Bohemian Fairy String Lights': '/images/masterpiece/cutouts/fairy_string_lights_cutout.png',
  'Personalized Throw Pillow': '/images/masterpiece/cutouts/product_pillow_cutout.png',
  'Custom Cushion Cover Set (2)': '/images/masterpiece/cutouts/product_cushions_cutout.png',
  'Handwoven Knit Throw Blanket': '/images/masterpiece/cutouts/product_blanket_cutout.png',
  'Ceramic Bud Vase Set (3)': '/images/masterpiece/cutouts/product_vase_cutout.png',
  'Luxury Soy Scented Candle': '/images/masterpiece/cutouts/product_candle_cutout.png',
  'Woven Seagrass Storage Tray': '/images/masterpiece/cutouts/product_tray_cutout.png',
  'Woven Raffia Tray with Leather Handles': '/images/masterpiece/cutouts/product_tray_cutout.png',
  'Natural Jute Area Rug': '/images/masterpiece/cutouts/product_jute_rug_cutout.png',
  'Geometric Dhurrie Rug': '/images/masterpiece/cutouts/product_dhurrie_rug_cutout.png',
  'Hexagonal Wooden Wall Mirror': '/images/masterpiece/cutouts/product_mirror_cutout.png',
  'Macramé Wall Hanging': '/images/masterpiece/cutouts/product_macrame_cutout.png',
  'Custom Canvas Wall Art': '/images/masterpiece/cutouts/product_canvas_cutout.png',
  'Personalized Wooden Wall Frame': '/images/masterpiece/cutouts/product_frame_cutout.png'
}

export const getProductCutoutPath = (prod) => {
  if (!prod) return null
  if (PRODUCT_CUTOUT_MAP[prod.name]) return PRODUCT_CUTOUT_MAP[prod.name]
  const n = (prod.name || '').toLowerCase()
  if (n.includes('lamp')) return '/images/masterpiece/cutouts/product_lamp_cutout.png'
  if (n.includes('pendant')) return '/images/masterpiece/cutouts/product_pendant_cutout.png'
  if (n.includes('fairy') || n.includes('string')) return '/images/masterpiece/cutouts/fairy_string_lights_cutout.png'
  if (n.includes('pillow')) return '/images/masterpiece/cutouts/product_pillow_cutout.png'
  if (n.includes('cushion')) return '/images/masterpiece/cutouts/product_cushions_cutout.png'
  if (n.includes('blanket')) return '/images/masterpiece/cutouts/product_blanket_cutout.png'
  if (n.includes('vase')) return '/images/masterpiece/cutouts/product_vase_cutout.png'
  if (n.includes('candle')) return '/images/masterpiece/cutouts/product_candle_cutout.png'
  if (n.includes('tray') || n.includes('raffia')) return '/images/masterpiece/cutouts/product_tray_cutout.png'
  if (n.includes('jute')) return '/images/masterpiece/cutouts/product_jute_rug_cutout.png'
  if (n.includes('dhurrie')) return '/images/masterpiece/cutouts/product_dhurrie_rug_cutout.png'
  if (n.includes('mirror')) return '/images/masterpiece/cutouts/product_mirror_cutout.png'
  if (n.includes('macram')) return '/images/masterpiece/cutouts/product_macrame_cutout.png'
  if (n.includes('canvas')) return '/images/masterpiece/cutouts/product_canvas_cutout.png'
  if (n.includes('frame')) return '/images/masterpiece/cutouts/product_frame_cutout.png'
  return prod.image_path
}

export default function CustomizePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)

  // Controls
  const [color, setColor] = useState(searchParams.get('color') || '#064e3b')
  const [size, setSize] = useState('A3')
  const [customWidth, setCustomWidth] = useState(40)
  const [customHeight, setCustomHeight] = useState(50)
  const [scale, setScale] = useState(100)
  const [frameStyle, setFrameStyle] = useState(searchParams.get('frame_style') || 'black')
  const [activeBackdrop, setActiveBackdrop] = useState('living')
  const [roomImageFile, setRoomImageFile] = useState(null)

  // AI Spec and Synthesized Image
  const [aiPrompt, setAiPrompt] = useState('')
  const [activeAiArtSpec, setActiveAiArtSpec] = useState(null)
  const [generatedAiImage, setGeneratedAiImage] = useState(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [loaderTitle, setLoaderTitle] = useState('')
  const [loaderMsg, setLoaderMsg] = useState('')
  const [diagLogs, setDiagLogs] = useState(['[System] Diagnostics initialized.'])

  // Canvas ref
  const canvasRef = useRef(null)

  // Dragging state
  const dragRef = useRef({
    isDragging: false,
    dragSX: 0,
    dragSY: 0,
    dragOX: 0,
    dragOY: 0,
    offsetX: 240,
    offsetY: 70,
    frameW: 260,
    frameH: 368
  })

  // Preloaded images cache
  const imagesCacheRef = useRef({})
  const productBaseImageRef = useRef(null)
  const productRef = useRef(null)

  const addDiagLog = (msg) => {
    const time = new Date().toLocaleTimeString()
    setDiagLogs((prev) => [...prev.slice(-30), `[${time}] ${msg}`])
  }

  // Fetch product
  useEffect(() => {
    api.get(`/products/${id}`)
      .then((res) => {
        const prod = res.data.data
        if (!prod.in_stock) {
          navigate('/customize', {
            state: {
              flash: {
                type: 'error',
                message: 'This masterpiece is currently out of stock and cannot be customized at this time.'
              }
            }
          })
          return
        }
        productRef.current = prod
        setProduct(prod)

        // Set initial frame offset
        if (prod.category === 'Rugs & Mats') {
          dragRef.current.offsetY = 310
        } else if (prod.name?.includes('Pendant')) {
          dragRef.current.offsetY = 90
          dragRef.current.offsetX = 265
        } else if (prod.name?.includes('Fairy') || prod.name?.includes('String')) {
          dragRef.current.offsetY = 35
          dragRef.current.offsetX = 175
        } else if (prod.name?.includes('Tray') || prod.name?.includes('tray') || prod.name?.includes('raffia')) {
          dragRef.current.offsetY = 280
          dragRef.current.offsetX = 225
        } else if (prod.name?.includes('Lamp') || prod.name?.includes('lamp')) {
          dragRef.current.offsetY = 175
          dragRef.current.offsetX = 285
        } else if (prod.name?.includes('Vase')) {
          dragRef.current.offsetY = 220
          dragRef.current.offsetX = 230
        }

        // Preload base product image (using clean cutout for customization visualizer)
        const cutoutPath = getProductCutoutPath(prod)
        if (cutoutPath) {
          const img = new Image()
          if (cutoutPath.startsWith('http')) {
            img.crossOrigin = 'anonymous'
          }
          img.onload = () => {
            productBaseImageRef.current = img
            renderCanvas()
          }
          img.src = cutoutPath
        }
      })
      .catch((err) => {
        console.error(err)
        navigate('/customize')
      })
      .finally(() => setLoading(false))
  }, [id])

  // Preload backdrops
  useEffect(() => {
    const backdrops = {
      living: '/images/masterpiece/bg_slideshow_one.png',
      bedroom: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1200&q=80',
      office: '/images/masterpiece/study_office_backdrop.jpg'
    }

    Object.entries(backdrops).forEach(([key, url]) => {
      const img = new Image()
      img.onload = () => {
        imagesCacheRef.current[key] = img
        if (key === activeBackdrop) renderCanvas()
      }
      img.src = url
    })
  }, [])

  // Re-render canvas whenever state changes
  useEffect(() => {
    if (product) renderCanvas()
  }, [color, size, customWidth, customHeight, scale, frameStyle, activeBackdrop, product, activeAiArtSpec, generatedAiImage])

  // Canvas drawing routines
  const hexToRgba = (hex, alpha) => {
    let r = 6,
      g = 78,
      b = 59
    if (hex && hex.startsWith('#')) {
      const h = hex.replace('#', '')
      if (h.length === 3) {
        r = parseInt(h[0] + h[0], 16)
        g = parseInt(h[1] + h[1], 16)
        b = parseInt(h[2] + h[2], 16)
      } else if (h.length === 6) {
        r = parseInt(h.substring(0, 2), 16)
        g = parseInt(h.substring(2, 4), 16)
        b = parseInt(h.substring(4, 6), 16)
      }
    }
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
  }

  const drawRoundedRect = (ctx, x, y, width, height, radius) => {
    ctx.beginPath()
    ctx.moveTo(x + radius, y)
    ctx.lineTo(x + width - radius, y)
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
    ctx.lineTo(x + width, y + height - radius)
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
    ctx.lineTo(x + radius, y + height)
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
    ctx.lineTo(x, y + radius)
    ctx.quadraticCurveTo(x, y, x + radius, y)
    ctx.closePath()
  }

  const drawBespokeLighting = (ctx, fX, fY, fWidth, fHeight) => {
    const name = product?.name || ''
    const isPendant = name.includes('Pendant')
    const isFairyLights = name.includes('Fairy') || name.includes('String')

    if (isFairyLights) {
      ctx.save()
      const cx = fX + fWidth / 2
      const cy = fY + fHeight / 2

      // Ambient warm fairy light glow across the wall
      const fairyGlow = ctx.createRadialGradient(cx, cy, 25, cx, cy, fWidth * 0.65)
      fairyGlow.addColorStop(0, 'rgba(255, 248, 220, 0.45)')
      fairyGlow.addColorStop(0.35, 'rgba(255, 215, 120, 0.2)')
      fairyGlow.addColorStop(0.7, 'rgba(255, 190, 80, 0.08)')
      fairyGlow.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = fairyGlow
      ctx.fillRect(fX - 40, fY - 40, fWidth + 80, fHeight + 80)

      if (productBaseImageRef.current) {
        ctx.save()
        // Radiant warm ambient border lighting around the glowing bulbs
        ctx.shadowColor = 'rgba(255, 235, 165, 0.95)'
        ctx.shadowBlur = 20
        ctx.drawImage(productBaseImageRef.current, fX, fY, fWidth, fHeight)
        ctx.restore()

        if (color && color !== '#064e3b' && color !== '#fef3c7') {
          ctx.save()
          ctx.globalCompositeOperation = 'screen'
          ctx.fillStyle = hexToRgba(color, 0.28)
          ctx.fillRect(fX, fY, fWidth, fHeight)
          ctx.restore()
        }
      } else {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)'
        ctx.lineWidth = 1.8
        ctx.beginPath()
        ctx.moveTo(fX, fY + fHeight * 0.25)
        ctx.bezierCurveTo(fX + fWidth * 0.25, fY + fHeight * 0.65, fX + fWidth * 0.75, fY + fHeight * 0.65, fX + fWidth, fY + fHeight * 0.25)
        ctx.stroke()
      }
      ctx.restore()
    } else if (isPendant) {
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

      if (productBaseImageRef.current) {
        ctx.save()
        ctx.shadowColor = 'rgba(255, 240, 200, 0.6)'
        ctx.shadowBlur = 20
        ctx.drawImage(productBaseImageRef.current, fX, fY, fWidth, fHeight)
        ctx.restore()

        if (generatedAiImage) {
          ctx.save()
          ctx.globalAlpha = 0.5
          ctx.drawImage(generatedAiImage, fX + fWidth * 0.15, fY + fHeight * 0.2, fWidth * 0.7, fHeight * 0.6)
          ctx.restore()
        } else if (color && color !== '#064e3b') {
          ctx.save()
          ctx.globalCompositeOperation = 'multiply'
          ctx.fillStyle = hexToRgba(color, 0.25)
          ctx.fillRect(fX, fY, fWidth, fHeight)
          ctx.restore()
        }
      } else {
        ctx.fillStyle = color
        ctx.fillRect(fX, fY, fWidth, fHeight)
      }
      ctx.restore()
    } else {
      // Table lamp - exactly matching the second image with border lighting and no photo background
      ctx.save()
      const cx = fX + fWidth / 2

      // Ambient warm border lighting glow
      const glowGrad = ctx.createRadialGradient(cx, fY + fHeight * 0.22, 15, cx, fY + fHeight * 0.22, fWidth * 0.95)
      glowGrad.addColorStop(0, 'rgba(255, 253, 230, 0.95)')
      glowGrad.addColorStop(0.3, hexToRgba(color, 0.55))
      glowGrad.addColorStop(0.7, hexToRgba(color, 0.14))
      glowGrad.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = glowGrad
      ctx.beginPath()
      ctx.arc(cx, fY + fHeight * 0.22, fWidth * 0.95, 0, Math.PI * 2)
      ctx.fill()

      // Soft contact drop shadow on table/surface
      ctx.save()
      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)'
      ctx.beginPath()
      ctx.ellipse(cx, fY + fHeight - 4, fWidth * 0.28, 9, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()

      // Subtle illuminated border lighting rim around lamp
      ctx.save()
      ctx.shadowColor = 'rgba(255, 240, 190, 0.5)'
      ctx.shadowBlur = 18

      // Draw the isolated cutout lamp
      if (productBaseImageRef.current) {
        ctx.drawImage(productBaseImageRef.current, fX, fY, fWidth, fHeight)
      }
      ctx.restore()

      // If AI Art generated or custom color selected, apply elegant subtle tint to lamp shade area
      if (generatedAiImage) {
        ctx.save()
        ctx.globalAlpha = 0.58
        ctx.drawImage(generatedAiImage, fX + fWidth * 0.03, fY + fHeight * 0.02, fWidth * 0.94, fHeight * 0.44)
        ctx.restore()
      } else if (color && color !== '#064e3b' && color !== '#1c1917') {
        ctx.save()
        ctx.globalCompositeOperation = 'multiply'
        ctx.fillStyle = hexToRgba(color, 0.25)
        ctx.fillRect(fX + fWidth * 0.03, fY + fHeight * 0.02, fWidth * 0.94, fHeight * 0.44)
        ctx.restore()
      }
      ctx.restore()
    }
  }

  const drawBespokeSoftFurnishing = (ctx, fX, fY, fWidth, fHeight) => {
    ctx.save()
    // Soft room contact drop shadow & ambient border lighting
    ctx.shadowColor = 'rgba(0, 0, 0, 0.35)'
    ctx.shadowBlur = 22
    ctx.shadowOffsetX = 6
    ctx.shadowOffsetY = 12

    if (productBaseImageRef.current) {
      const img = productBaseImageRef.current
      let drawW = fWidth
      let drawH = fHeight
      if (img.width && img.height) {
        const aspect = img.width / img.height
        if (fWidth / fHeight > aspect) {
          drawW = Math.round(fHeight * aspect)
        } else {
          drawH = Math.round(fWidth / aspect)
        }
      }
      ctx.drawImage(img, fX, fY, drawW, drawH)

      if (generatedAiImage) {
        ctx.save()
        ctx.globalAlpha = 0.65
        ctx.drawImage(generatedAiImage, fX + drawW * 0.12, fY + drawH * 0.12, drawW * 0.76, drawH * 0.76)
        ctx.restore()
      } else if (color && color !== '#064e3b') {
        ctx.save()
        ctx.globalCompositeOperation = 'multiply'
        ctx.fillStyle = hexToRgba(color, 0.28)
        ctx.fillRect(fX, fY, drawW, drawH)
        ctx.restore()
      }
    } else {
      let pillowGrad = ctx.createRadialGradient(
        fX + fWidth * 0.4,
        fY + fHeight * 0.4,
        10,
        fX + fWidth / 2,
        fY + fHeight / 2,
        fWidth * 0.7
      )
      pillowGrad.addColorStop(0, '#ffffff')
      pillowGrad.addColorStop(0.2, color)
      pillowGrad.addColorStop(1, hexToRgba(color, 0.9))
      ctx.fillStyle = pillowGrad
      drawRoundedRect(ctx, fX, fY, fWidth, fHeight, 36)
      ctx.fill()
    }
    ctx.restore()
  }

  const drawBespokeRug = (ctx, fX, fY, fWidth, fHeight) => {
    ctx.save()
    // Soft floor drop shadow & ambient border rim
    ctx.shadowColor = 'rgba(0, 0, 0, 0.32)'
    ctx.shadowBlur = 18
    ctx.shadowOffsetY = 10

    if (productBaseImageRef.current) {
      const img = productBaseImageRef.current
      let drawW = fWidth
      let drawH = fHeight
      if (img.width && img.height) {
        const aspect = img.width / img.height
        if (fWidth / fHeight > aspect) {
          drawW = Math.round(fHeight * aspect)
        } else {
          drawH = Math.round(fWidth / aspect)
        }
      }
      ctx.drawImage(img, fX, fY, drawW, drawH)

      if (generatedAiImage) {
        ctx.save()
        ctx.globalAlpha = 0.55
        ctx.drawImage(generatedAiImage, fX + drawW * 0.1, fY + drawH * 0.1, drawW * 0.8, drawH * 0.8)
        ctx.restore()
      } else if (color && color !== '#064e3b') {
        ctx.save()
        ctx.globalCompositeOperation = 'multiply'
        ctx.fillStyle = hexToRgba(color, 0.25)
        ctx.fillRect(fX, fY, drawW, drawH)
        ctx.restore()
      }
    } else {
      ctx.beginPath()
      ctx.moveTo(fX + fWidth * 0.16, fY)
      ctx.lineTo(fX + fWidth * 0.84, fY)
      ctx.lineTo(fX + fWidth, fY + fHeight)
      ctx.lineTo(fX, fY + fHeight)
      ctx.closePath()
      ctx.save()
      ctx.clip()
      ctx.fillStyle = color
      ctx.fill()
      ctx.restore()
    }
    ctx.restore()
  }

  const drawBespokeAccent = (ctx, fX, fY, fWidth, fHeight) => {
    ctx.save()
    // Soft surface contact shadow & ambient rim lighting
    ctx.shadowColor = 'rgba(0, 0, 0, 0.35)'
    ctx.shadowBlur = 22
    ctx.shadowOffsetX = 5
    ctx.shadowOffsetY = 10

    if (productBaseImageRef.current) {
      const img = productBaseImageRef.current
      let drawW = fWidth
      let drawH = fHeight
      if (img.width && img.height) {
        const aspect = img.width / img.height
        if (fWidth / fHeight > aspect) {
          drawW = Math.round(fHeight * aspect)
        } else {
          drawH = Math.round(fWidth / aspect)
        }
      }
      const drawX = fX
      const drawY = fY

      // Surface drop shadow under bases
      ctx.save()
      ctx.fillStyle = 'rgba(0, 0, 0, 0.28)'
      ctx.beginPath()
      ctx.ellipse(drawX + drawW / 2, drawY + drawH - 4, drawW * 0.44, 8, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()

      ctx.drawImage(img, drawX, drawY, drawW, drawH)

      if (generatedAiImage) {
        ctx.save()
        const prodName = ((productRef.current || product)?.name || '').toLowerCase()
        const isTray = prodName.includes('tray') || prodName.includes('raffia')
        if (isTray) {
          ctx.globalAlpha = 0.62
          ctx.drawImage(generatedAiImage, drawX + drawW * 0.2, drawY + drawH * 0.36, drawW * 0.6, drawH * 0.44)
        } else {
          ctx.globalAlpha = 0.5
          ctx.drawImage(generatedAiImage, drawX + drawW * 0.15, drawY + drawH * 0.15, drawW * 0.7, drawH * 0.7)
        }
        ctx.restore()
      } else if (color && color !== '#064e3b') {
        ctx.save()
        ctx.globalCompositeOperation = 'multiply'
        ctx.fillStyle = hexToRgba(color, 0.22)
        ctx.fillRect(drawX, drawY, drawW, drawH)
        ctx.restore()
      }
    } else {
      let glazeGrad = ctx.createLinearGradient(fX, fY, fX + fWidth, fY)
      glazeGrad.addColorStop(0, hexToRgba(color, 0.85))
      glazeGrad.addColorStop(0.26, '#ffffff')
      glazeGrad.addColorStop(0.45, color)
      glazeGrad.addColorStop(1, hexToRgba(color, 0.9))

      ctx.beginPath()
      ctx.moveTo(fX + fWidth * 0.38, fY + fHeight * 0.08)
      ctx.lineTo(fX + fWidth * 0.62, fY + fHeight * 0.08)
      ctx.lineTo(fX + fWidth * 0.58, fY + fHeight * 0.28)
      ctx.bezierCurveTo(
        fX + fWidth * 0.95, fY + fHeight * 0.45,
        fX + fWidth * 0.92, fY + fHeight * 0.85,
        fX + fWidth * 0.68, fY + fHeight * 0.94
      )
      ctx.lineTo(fX + fWidth * 0.32, fY + fHeight * 0.94)
      ctx.bezierCurveTo(
        fX + fWidth * 0.08, fY + fHeight * 0.85,
        fX + fWidth * 0.05, fY + fHeight * 0.45,
        fX + fWidth * 0.42, fY + fHeight * 0.28
      )
      ctx.closePath()
      ctx.save()
      ctx.clip()
      ctx.fillStyle = glazeGrad
      ctx.fill()
      ctx.restore()
    }
    ctx.restore()
  }

  const drawFrameMoulding = (ctx, fX, fY, fWidth, fHeight, style) => {
    if (style === 'none') {
      // 3D Borderless Gallery-Wrapped Canvas
      ctx.save()
      ctx.shadowColor = 'rgba(0, 0, 0, 0.45)'
      ctx.shadowBlur = 24
      ctx.shadowOffsetX = 10
      ctx.shadowOffsetY = 16
      ctx.fillStyle = '#1c1917'
      ctx.fillRect(fX, fY, fWidth, fHeight)
      ctx.restore()

      // Right-side and bottom 3D canvas wrap edges
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

      return { artX: fX, artY: fY, artWidth: fWidth, artHeight: fHeight, isBorderless: true }
    }

    const mWidth = 24
    const matWidth = 22

    // 1. Deep Wall Drop Shadow
    ctx.save()
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'
    ctx.shadowBlur = 26
    ctx.shadowOffsetX = 10
    ctx.shadowOffsetY = 16
    ctx.fillStyle = '#000000'
    ctx.fillRect(fX, fY, fWidth, fHeight)
    ctx.restore()

    // 2. 4-Piece Mitred Joinery Moulding with directional lighting
    ctx.save()
    const finishes = {
      black: {
        top: '#333336',
        left: '#262629',
        bottom: '#0c0c0e',
        right: '#161618',
        lip: '#44444a'
      },
      oak: {
        top: '#cfa06a',
        left: '#bd8852',
        bottom: '#7b4c20',
        right: '#945f2e',
        lip: '#e5b882'
      },
      gold: {
        top: '#f9e8a2',
        left: '#e3be5b',
        bottom: '#9a751b',
        right: '#b8902b',
        lip: '#fff4be'
      },
      white: {
        top: '#ffffff',
        left: '#f4f4f6',
        bottom: '#d1d1d6',
        right: '#e2e2e7',
        lip: '#ffffff'
      }
    }

    const finish = finishes[style] || finishes.black

    // TOP MOULDING (Trapezoid)
    ctx.beginPath()
    ctx.moveTo(fX, fY)
    ctx.lineTo(fX + fWidth, fY)
    ctx.lineTo(fX + fWidth - mWidth, fY + mWidth)
    ctx.lineTo(fX + mWidth, fY + mWidth)
    ctx.closePath()
    const topGrad = ctx.createLinearGradient(fX, fY, fX, fY + mWidth)
    topGrad.addColorStop(0, finish.top)
    topGrad.addColorStop(1, finish.left)
    ctx.fillStyle = topGrad
    ctx.fill()

    // BOTTOM MOULDING (Trapezoid)
    ctx.beginPath()
    ctx.moveTo(fX, fY + fHeight)
    ctx.lineTo(fX + fWidth, fY + fHeight)
    ctx.lineTo(fX + fWidth - mWidth, fY + fHeight - mWidth)
    ctx.lineTo(fX + mWidth, fY + fHeight - mWidth)
    ctx.closePath()
    const botGrad = ctx.createLinearGradient(fX, fY + fHeight, fX, fY + fHeight - mWidth)
    botGrad.addColorStop(0, finish.bottom)
    botGrad.addColorStop(1, finish.right)
    ctx.fillStyle = botGrad
    ctx.fill()

    // LEFT MOULDING (Trapezoid)
    ctx.beginPath()
    ctx.moveTo(fX, fY)
    ctx.lineTo(fX + mWidth, fY + mWidth)
    ctx.lineTo(fX + mWidth, fY + fHeight - mWidth)
    ctx.lineTo(fX, fY + fHeight)
    ctx.closePath()
    const leftGrad = ctx.createLinearGradient(fX, fY, fX + mWidth, fY)
    leftGrad.addColorStop(0, finish.left)
    leftGrad.addColorStop(1, finish.top)
    ctx.fillStyle = leftGrad
    ctx.fill()

    // RIGHT MOULDING (Trapezoid)
    ctx.beginPath()
    ctx.moveTo(fX + fWidth, fY)
    ctx.lineTo(fX + fWidth, fY + fHeight)
    ctx.lineTo(fX + fWidth - mWidth, fY + fHeight - mWidth)
    ctx.lineTo(fX + fWidth - mWidth, fY + mWidth)
    ctx.closePath()
    const rightGrad = ctx.createLinearGradient(fX + fWidth, fY, fX + fWidth - mWidth, fY)
    rightGrad.addColorStop(0, finish.right)
    rightGrad.addColorStop(1, finish.bottom)
    ctx.fillStyle = rightGrad
    ctx.fill()

    // 45° Mitre Corner Join Seams
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)'
    ctx.lineWidth = 1.2
    ctx.beginPath()
    ctx.moveTo(fX, fY)
    ctx.lineTo(fX + mWidth, fY + mWidth)
    ctx.moveTo(fX + fWidth, fY)
    ctx.lineTo(fX + fWidth - mWidth, fY + mWidth)
    ctx.moveTo(fX + fWidth, fY + fHeight)
    ctx.lineTo(fX + fWidth - mWidth, fY + fHeight - mWidth)
    ctx.moveTo(fX, fY + fHeight)
    ctx.lineTo(fX + mWidth, fY + fHeight - mWidth)
    ctx.stroke()

    // Inner Moulding Beaded Lip
    ctx.strokeStyle = finish.lip
    ctx.lineWidth = 1.5
    ctx.strokeRect(fX + mWidth - 1, fY + mWidth - 1, fWidth - 2 * mWidth + 2, fHeight - 2 * mWidth + 2)

    // Outer Edge Specular Rim
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)'
    ctx.lineWidth = 1
    ctx.strokeRect(fX + 1, fY + 1, fWidth - 2, fHeight - 2)
    ctx.restore()

    // 3. Archival Museum Passpartout Mat Board
    const matX = fX + mWidth
    const matY = fY + mWidth
    const matW = fWidth - 2 * mWidth
    const matH = fHeight - 2 * mWidth

    ctx.save()
    ctx.fillStyle = '#faf8f5' // Museum warm white
    ctx.fillRect(matX, matY, matW, matH)

    // Inner Bevel Cut onto Artwork
    const artX = matX + matWidth
    const artY = matY + matWidth
    const artW = matW - 2 * matWidth
    const artH = matH - 2 * matWidth

    // Mat bevel inner shadow
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.25)'
    ctx.lineWidth = 1.5
    ctx.strokeRect(artX, artY, artW, artH)

    // Mat white core highlight
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)'
    ctx.lineWidth = 1
    ctx.strokeRect(artX + 1, artY + 1, artW - 2, artH - 2)
    ctx.restore()

    return { artX, artY, artWidth: artW, artHeight: artH, isBorderless: false }
  }

  const drawBespokeWallDecor = (ctx, fX, fY, fWidth, fHeight) => {
    const isMacrame = product?.name?.includes('Macram')
    if (isMacrame) {
      ctx.save()
      ctx.shadowColor = 'rgba(0, 0, 0, 0.42)'
      ctx.shadowBlur = 24
      ctx.shadowOffsetX = 8
      ctx.shadowOffsetY = 14
      if (productBaseImageRef.current) {
        ctx.drawImage(productBaseImageRef.current, fX, fY, fWidth, fHeight)
      }
      ctx.restore()
      return
    }

    const isMirror = product?.name?.includes('Mirror')
    if (isMirror) {
      ctx.save()
      ctx.shadowColor = 'rgba(0, 0, 0, 0.42)'
      ctx.shadowBlur = 24
      ctx.shadowOffsetX = 8
      ctx.shadowOffsetY = 16
      if (productBaseImageRef.current) {
        ctx.drawImage(productBaseImageRef.current, fX, fY, fWidth, fHeight)
      }
      ctx.restore()
      return
    }

    const currentProd = productRef.current || product
    const name = (currentProd?.name || '').toLowerCase()

    // Canvas items: render pure artwork cutout without artificial moulding borders per user instruction
    if (name.includes('canvas')) {
      if (productBaseImageRef.current) {
        ctx.save()
        ctx.shadowColor = 'rgba(0, 0, 0, 0.42)'
        ctx.shadowBlur = 24
        ctx.shadowOffsetX = 8
        ctx.shadowOffsetY = 16
        ctx.drawImage(productBaseImageRef.current, fX, fY, fWidth, fHeight)
        ctx.restore()

        if (generatedAiImage) {
          ctx.save()
          ctx.globalAlpha = 0.55
          ctx.drawImage(generatedAiImage, fX + fWidth * 0.06, fY + fHeight * 0.06, fWidth * 0.88, fHeight * 0.88)
          ctx.restore()
        }
      }
      return
    }

    // Wooden wall frame: render realistic walnut frame cutout directly with museum mat
    if (productBaseImageRef.current) {
      ctx.save()
      ctx.shadowColor = 'rgba(0, 0, 0, 0.42)'
      ctx.shadowBlur = 24
      ctx.shadowOffsetX = 8
      ctx.shadowOffsetY = 16
      ctx.drawImage(productBaseImageRef.current, fX, fY, fWidth, fHeight)
      ctx.restore()

      if (generatedAiImage) {
        ctx.save()
        // Mount customized AI artwork precisely within the inner mat opening
        const matX = fX + fWidth * 0.155
        const matY = fY + fHeight * 0.138
        const matW = fWidth * 0.69
        const matH = fHeight * 0.724
        ctx.drawImage(generatedAiImage, matX, matY, matW, matH)
        ctx.restore()
      }
      return
    }

    const { artX, artY, artWidth, artHeight } = drawFrameMoulding(ctx, fX, fY, fWidth, fHeight, frameStyle)

    ctx.save()
    if (generatedAiImage) {
      ctx.drawImage(generatedAiImage, artX, artY, artWidth, artHeight)
    } else if (activeAiArtSpec) {
      const artGrad = ctx.createLinearGradient(artX, artY, artX + artWidth, artY + artHeight)
      artGrad.addColorStop(0, activeAiArtSpec.gradient_start || '#faf9f6')
      artGrad.addColorStop(1, activeAiArtSpec.gradient_end || '#e5e5e0')
      ctx.fillStyle = artGrad
      ctx.fillRect(artX, artY, artWidth, artHeight)

      ctx.fillStyle = activeAiArtSpec.shape_color || color
      const pX = artX + artWidth / 2
      const pY = artY + artHeight / 2

      if (activeAiArtSpec.primary_shape === 'circle') {
        ctx.beginPath()
        ctx.arc(pX, pY, artWidth * 0.35, 0, Math.PI * 2)
        ctx.fill()
      } else if (activeAiArtSpec.primary_shape === 'arch') {
        ctx.beginPath()
        ctx.moveTo(pX - 50, pY - 20)
        ctx.arc(pX, pY - 20, 50, Math.PI, 0)
        ctx.lineTo(pX - 50, pY + 60)
        ctx.lineTo(pX + 50, pY + 60)
        ctx.closePath()
        ctx.fill()
      } else if (activeAiArtSpec.primary_shape === 'sun') {
        ctx.beginPath()
        ctx.arc(pX, pY + 40, 60, Math.PI, 0)
        ctx.fill()
      } else {
        ctx.beginPath()
        ctx.arc(pX, pY, artWidth * 0.3, 0, Math.PI * 2)
        ctx.fill()
      }
    } else if (productBaseImageRef.current) {
      ctx.drawImage(productBaseImageRef.current, artX, artY, artWidth, artHeight)
    } else {
      ctx.fillStyle = color
      ctx.fillRect(artX, artY, artWidth, artHeight)
    }
    ctx.restore()
  }

  const getDimensionSpec = (sizeKey, cat) => {
    switch (sizeKey) {
      case 'A4':
        return { widthCm: 21.0, heightCm: 29.7, baseW: 195, baseH: 276, label: '21.0 × 29.7 cm (A4)' }
      case 'A3':
        return { widthCm: 29.7, heightCm: 42.0, baseW: 260, baseH: 368, label: '29.7 × 42.0 cm (A3)' }
      case 'A2':
        return { widthCm: 42.0, heightCm: 59.4, baseW: 330, baseH: 467, label: '42.0 × 59.4 cm (A2)' }
      case 'Square':
        return { widthCm: 40.0, heightCm: 40.0, baseW: 280, baseH: 280, label: '40.0 × 40.0 cm (Square)' }
      case 'Panoramic':
        return { widthCm: 60.0, heightCm: 30.0, baseW: 420, baseH: 210, label: '60.0 × 30.0 cm (Panoramic)' }
      case 'Custom': {
        const wCm = Math.max(15, Math.min(150, Number(customWidth) || 40))
        const hCm = Math.max(15, Math.min(150, Number(customHeight) || 50))
        const scaleByW = 500 / wCm
        const scaleByH = 420 / hCm
        const pxPerCm = Math.min(scaleByW, scaleByH, 8.8)
        const baseW = Math.round(wCm * pxPerCm)
        const baseH = Math.round(hCm * pxPerCm)
        return { widthCm: wCm, heightCm: hCm, baseW, baseH, label: `${wCm} × ${hCm} cm (Custom)` }
      }
      default: {
        let wCm = 29.7
        let hCm = 42.0
        let baseW = 260
        let baseH = 368

        if (cat === 'Lighting') {
          if (product?.name?.includes('Pendant')) {
            if (sizeKey === 'A4') { wCm = 35; hCm = 40; baseW = 180; baseH = 204 }
            else if (sizeKey === 'A2') { wCm = 55; hCm = 62; baseW = 280; baseH = 317 }
            else { wCm = 45; hCm = 51; baseW = 230; baseH = 260 }
          } else if (product?.name?.includes('Fairy') || product?.name?.includes('String')) {
            if (sizeKey === 'A4') { wCm = 90; hCm = 62; baseW = 330; baseH = 229 }
            else if (sizeKey === 'A2') { wCm = 150; hCm = 104; baseW = 550; baseH = 382 }
            else { wCm = 120; hCm = 83; baseW = 440; baseH = 305 }
          } else if (sizeKey === 'A4') { wCm = 25; hCm = 40; baseW = 142; baseH = 230 }
          else if (sizeKey === 'A2') { wCm = 40; hCm = 65; baseW = 230; baseH = 372 }
          else { wCm = 32; hCm = 52; baseW = 185; baseH = 300 }
        } else if (cat === 'Soft Furnishings') {
          if (product?.name?.includes('Cushion')) {
            if (sizeKey === 'A4') { wCm = 50; hCm = 35; baseW = 230; baseH = 155 }
            else if (sizeKey === 'A2') { wCm = 80; hCm = 55; baseW = 360; baseH = 243 }
            else { wCm = 65; hCm = 45; baseW = 295; baseH = 199 }
          } else if (product?.name?.includes('Pillow')) {
            if (sizeKey === 'A4') { wCm = 40; hCm = 36; baseW = 180; baseH = 162 }
            else if (sizeKey === 'A2') { wCm = 60; hCm = 54; baseW = 270; baseH = 243 }
            else { wCm = 50; hCm = 45; baseW = 225; baseH = 202 }
          } else if (product?.name?.includes('Blanket')) {
            if (sizeKey === 'A4') { wCm = 100; hCm = 92; baseW = 220; baseH = 204 }
            else if (sizeKey === 'A2') { wCm = 160; hCm = 148; baseW = 340; baseH = 315 }
            else { wCm = 130; hCm = 120; baseW = 280; baseH = 259 }
          } else if (sizeKey === 'A4') { wCm = 35; hCm = 35; baseW = 150; baseH = 150 }
          else if (sizeKey === 'A2') { wCm = 55; hCm = 55; baseW = 230; baseH = 230 }
          else { wCm = 45; hCm = 45; baseW = 190; baseH = 190 }
        } else if (cat === 'Rugs & Mats') {
          if (product?.name?.includes('Dhurrie')) {
            if (sizeKey === 'A4') { wCm = 90; hCm = 60; baseW = 270; baseH = 180 }
            else if (sizeKey === 'A2') { wCm = 180; hCm = 120; baseW = 450; baseH = 300 }
            else { wCm = 140; hCm = 95; baseW = 360; baseH = 240 }
          } else if (product?.name?.includes('Jute')) {
            if (sizeKey === 'A4') { wCm = 100; hCm = 52; baseW = 280; baseH = 147 }
            else if (sizeKey === 'A2') { wCm = 180; hCm = 95; baseW = 440; baseH = 231 }
            else { wCm = 150; hCm = 80; baseW = 380; baseH = 200 }
          } else {
            if (sizeKey === 'A4') { wCm = 60; hCm = 180; baseW = 260; baseH = 110 }
            else if (sizeKey === 'A2') { wCm = 150; hCm = 240; baseW = 420; baseH = 200 }
            else { wCm = 120; hCm = 180; baseW = 340; baseH = 160 }
          }
        } else if (cat === 'Decorative Accents') {
          if (product?.name?.includes('Tray') || product?.name?.includes('tray') || product?.name?.includes('raffia')) {
            if (sizeKey === 'A4') { wCm = 35; hCm = 14; baseW = 240; baseH = 97 }
            else if (sizeKey === 'A2') { wCm = 55; hCm = 22; baseW = 380; baseH = 153 }
            else { wCm = 45; hCm = 18; baseW = 310; baseH = 125 }
          } else if (product?.name?.includes('Vase')) {
            if (sizeKey === 'A4') { wCm = 24; hCm = 16; baseW = 210; baseH = 140 }
            else if (sizeKey === 'A2') { wCm = 42; hCm = 28; baseW = 360; baseH = 240 }
            else { wCm = 33; hCm = 22; baseW = 285; baseH = 190 }
          } else if (product?.name?.includes('Candle')) {
            if (sizeKey === 'A4') { wCm = 18; hCm = 15; baseW = 160; baseH = 132 }
            else if (sizeKey === 'A2') { wCm = 30; hCm = 25; baseW = 260; baseH = 215 }
            else { wCm = 24; hCm = 20; baseW = 210; baseH = 173 }
          } else {
            if (sizeKey === 'A4') { wCm = 15; hCm = 25; baseW = 105; baseH = 175 }
            else if (sizeKey === 'A2') { wCm = 30; hCm = 45; baseW = 165; baseH = 275 }
            else { wCm = 22; hCm = 35; baseW = 135; baseH = 225 }
          }
        }
        return { widthCm: wCm, heightCm: hCm, baseW, baseH, label: `${wCm} × ${hCm} cm` }
      }
    }
  }

  const renderCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const currentProd = productRef.current || product
    if (!currentProd) return

    const ctx = canvas.getContext('2d')
    const width = canvas.width
    const height = canvas.height

    ctx.clearRect(0, 0, width, height)

    // 1. Draw backdrop
    const roomImg = imagesCacheRef.current[activeBackdrop]
    if (roomImg) {
      ctx.drawImage(roomImg, 0, 0, width, height)
    } else {
      const gradient = ctx.createLinearGradient(0, 0, width, height)
      gradient.addColorStop(0, '#f5f5f4')
      gradient.addColorStop(1, '#e7e5e4')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, width, height)
    }

    const cat = currentProd.category || ''
    const name = (currentProd.name || '').toLowerCase()

    const dimSpec = getDimensionSpec(size, cat)
    const scaleFactor = (scale || 100) / 100
    const fWidth = Math.round(dimSpec.baseW * scaleFactor)
    const fHeight = Math.round(dimSpec.baseH * scaleFactor)

    dragRef.current.frameW = fWidth
    dragRef.current.frameH = fHeight

    // Allow complete free movement across canvas without artificial clamping
    dragRef.current.offsetX = Math.max(-fWidth + 30, Math.min(width - 30, dragRef.current.offsetX))
    dragRef.current.offsetY = Math.max(-fHeight + 30, Math.min(height - 30, dragRef.current.offsetY))

    const fX = dragRef.current.offsetX
    const fY = dragRef.current.offsetY

    // 2. Draw category specific decor
    if (cat === 'Lighting' || name.includes('lamp') || name.includes('pendant') || name.includes('fairy') || name.includes('string')) {
      drawBespokeLighting(ctx, fX, fY, fWidth, fHeight)
    } else if (cat === 'Soft Furnishings' || name.includes('pillow') || name.includes('cushion') || name.includes('blanket')) {
      drawBespokeSoftFurnishing(ctx, fX, fY, fWidth, fHeight)
    } else if (cat === 'Rugs & Mats' || name.includes('rug') || name.includes('dhurrie') || name.includes('jute')) {
      drawBespokeRug(ctx, fX, fY, fWidth, fHeight)
    } else if (cat === 'Decorative Accents' || name.includes('vase') || name.includes('candle') || name.includes('tray')) {
      drawBespokeAccent(ctx, fX, fY, fWidth, fHeight)
    } else if (cat === 'Wall Decor') {
      drawBespokeWallDecor(ctx, fX, fY, fWidth, fHeight)
    } else {
      drawBespokeAccent(ctx, fX, fY, fWidth, fHeight)
    }
  }

  // Mouse handlers for dragging
  const getCanvasMouse = (e) => {
    const canvas = canvasRef.current
    const r = canvas.getBoundingClientRect()
    const sx = canvas.width / r.width
    const sy = canvas.height / r.height
    return { x: (e.clientX - r.left) * sx, y: (e.clientY - r.top) * sy }
  }

  const handleMouseDown = (e) => {
    const { x, y } = getCanvasMouse(e)
    const { offsetX, offsetY, frameW, frameH } = dragRef.current
    const w = frameW || 260
    const h = frameH || 368
    const pad = 30
    if (x >= offsetX - pad && x <= offsetX + w + pad && y >= offsetY - pad && y <= offsetY + h + pad) {
      dragRef.current.isDragging = true
      dragRef.current.dragSX = x
      dragRef.current.dragSY = y
      dragRef.current.dragOX = offsetX
      dragRef.current.dragOY = offsetY
    }
  }

  const handleMouseMove = (e) => {
    if (!dragRef.current.isDragging) return
    const { x, y } = getCanvasMouse(e)
    const { dragSX, dragSY, dragOX, dragOY, frameW, frameH } = dragRef.current
    const w = frameW || 260
    const h = frameH || 368
    // Unrestricted drag limits: product can move all the way to the top, bottom, and sides
    dragRef.current.offsetX = Math.max(-w + 30, Math.min(760 - 30, dragOX + x - dragSX))
    dragRef.current.offsetY = Math.max(-h + 30, Math.min(490 - 30, dragOY + y - dragSY))
    renderCanvas()
  }

  const handleMouseUp = () => {
    dragRef.current.isDragging = false
  }

  // Generate AI art
  const handleGenerateAiArt = async () => {
    if (!aiPrompt.trim()) {
      alert('Please enter a creative design theme prompt first.')
      return
    }

    setAiLoading(true)
    setLoaderTitle('Launching AI Curation...')
    setLoaderMsg('Connecting to Gemini API...')
    addDiagLog(`AI Generation requested: "${aiPrompt.trim()}"`)

    try {
      const res = await api.post('/ai/generate-art', { prompt: aiPrompt.trim() })
      const spec = res.data.data
      setActiveAiArtSpec(spec)
      addDiagLog(`Gemini Spec parsed. Palette: ${spec.palette_name || 'N/A'}`)

      if (spec.shape_color) setColor(spec.shape_color)
      if (spec.curated_frame && spec.curated_frame !== 'none') setFrameStyle(spec.curated_frame)

      if (spec.synthesized_image_base64) {
        addDiagLog('Loading Base64 AI synthesized image...')
        const img = new Image()
        img.onload = () => {
          setGeneratedAiImage(img)
          setAiLoading(false)
          addDiagLog('AI Image successfully mounted on canvas.')
        }
        img.src = spec.synthesized_image_base64
      } else {
        setAiLoading(false)
      }
    } catch (err) {
      setAiLoading(false)
      addDiagLog(`AI Error: ${err.message}`)
      alert('AI Generation error: ' + (err.response?.data?.message || err.message))
    }
  }

  // Handle local room image upload
  const handleRoomImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setRoomImageFile(file)
      const reader = new FileReader()
      reader.onload = (event) => {
        const img = new Image()
        img.onload = () => {
          imagesCacheRef.current['uploaded'] = img
          setActiveBackdrop('uploaded')
          addDiagLog('Room photo loaded.')
        }
        img.src = event.target.result
      }
      reader.readAsDataURL(file)
    }
  }

  // Save Design
  const handleSaveDesign = async (e) => {
    e.preventDefault()

    const designPayload = {
      color,
      size,
      scale,
      frame_style: frameStyle,
      ai_art_spec: activeAiArtSpec,
      backdrop: activeBackdrop,
      offset_x: dragRef.current.offsetX,
      offset_y: dragRef.current.offsetY,
      frame_w: dragRef.current.frameW,
      frame_h: dragRef.current.frameH,
      custom_width_cm: customWidth,
      custom_height_cm: customHeight,
      product_category: product?.category
    }

    const formData = new FormData()
    formData.append('product_id', product._id || product.id)
    formData.append('design_json', JSON.stringify(designPayload))
    if (roomImageFile) {
      formData.append('room_image', roomImageFile)
    }

    try {
      const res = await api.post('/designs', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      navigate(`/designs/${res.data.design_id}/preview`)
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save design.')
    }
  }

  if (loading || !product) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-10">
      <div className="mb-8">
        <Link
          to="/customize"
          className="inline-flex items-center gap-2 text-stone-500 hover:text-emerald-800 dark:hover:text-white transition-colors font-semibold text-sm mb-4"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Back to Collection
        </Link>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <span className="inline-block px-3 py-1 mb-2 rounded-full bg-emerald-500/10 dark:bg-white/10 text-emerald-800 dark:text-white font-label-sm uppercase tracking-widest text-[11px] font-bold">
              Step 2 of 3
            </span>
            <h1 className="font-display-xl text-4xl text-primary leading-tight">{product.name}</h1>
          </div>
          <div className="bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 px-6 py-3 rounded-2xl">
            <span className="text-xs uppercase tracking-widest font-semibold text-stone-400 block">Base Price</span>
            <span className="text-xl font-bold text-emerald-900 dark:text-white">
              INR {Number(product.base_price).toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Visualizer Settings Controls */}
        <div className="lg:col-span-4 bg-white dark:bg-stone-950 p-8 rounded-3xl whisper-shadow border border-stone-100 dark:border-stone-900 space-y-6 h-fit">
          <h2 className="font-headline-md text-xl text-primary">Visualizer Controls</h2>

          {/* AI Vector Art Spec Generator Prompt */}
          <div className="p-5 bg-gradient-to-br from-emerald-950 to-emerald-900 dark:from-stone-900 dark:to-stone-950 text-white rounded-2xl border border-emerald-800/40 dark:border-stone-800 space-y-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-300 dark:text-white animate-pulse">auto_awesome</span>
              <h3 className="text-xs uppercase tracking-widest font-bold text-emerald-200 dark:text-white">
                AI Wall Art Spec Generator
              </h3>
            </div>
            <p className="text-[11px] text-stone-300 leading-relaxed">
              Type an abstract design prompt, and let Gemini AI create premium vector layouts, matching color palettes,
              and typographic accents instantly!
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleGenerateAiArt()}
                className="flex-1 bg-white/10 border border-white/20 px-3 py-2.5 rounded-xl text-xs text-white placeholder-white/40 focus:outline-none focus:border-emerald-300 dark:focus:border-white"
                placeholder="e.g. bohemian abstract sun sunset..."
              />
              <button
                type="button"
                onClick={handleGenerateAiArt}
                className="bg-emerald-500 dark:bg-white text-emerald-950 dark:text-stone-950 px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-emerald-400 dark:hover:bg-stone-200 transition-colors whitespace-nowrap"
              >
                Generate
              </button>
            </div>
          </div>

          {/* AI Text Feedback */}
          {activeAiArtSpec && activeAiArtSpec.palette_name && (
            <div className="p-5 bg-stone-50 dark:bg-stone-900 border border-emerald-500/30 dark:border-stone-800 rounded-2xl space-y-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-600 dark:text-white text-[18px]">psychology</span>
                <h3 className="text-xs uppercase tracking-widest font-bold text-emerald-800 dark:text-white">
                  Design Rationale
                </h3>
              </div>
              <div className="text-sm text-stone-600 dark:text-stone-400 space-y-2">
                <p>
                  <strong className="text-stone-800 dark:text-stone-200">Palette:</strong>{' '}
                  {activeAiArtSpec.palette_name}
                </p>
                <p>
                  <strong className="text-stone-800 dark:text-stone-200">Layout:</strong>{' '}
                  {activeAiArtSpec.layout_description || 'Minimalist geometric layers.'}
                </p>
                <p>
                  <strong className="text-stone-800 dark:text-stone-200">Typography:</strong>{' '}
                  {activeAiArtSpec.typography_recommendation || 'Premium elegant styling.'}
                </p>
              </div>
            </div>
          )}

          {/* Diagnostics Log */}
          <div className="text-[10px] font-mono border border-emerald-500/30 dark:border-stone-800 p-3 rounded-xl bg-stone-50 dark:bg-stone-900 text-stone-400 space-y-1">
            <p className="font-bold text-emerald-600 dark:text-white uppercase tracking-widest text-[9px] mb-1">
              Execution Diagnostics Log:
            </p>
            <div className="max-h-32 overflow-y-auto space-y-1 leading-normal">
              {diagLogs.map((log, i) => (
                <p key={i}>{log}</p>
              ))}
            </div>
          </div>

          <form onSubmit={handleSaveDesign} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-xs uppercase tracking-widest font-semibold text-stone-400 dark:text-stone-500">
                Color Profile
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-14 h-12 bg-transparent border-0 cursor-pointer rounded-xl p-0"
                />
                <div className="flex-1 flex gap-1.5 flex-wrap">
                  {['#064e3b', '#78350f', '#1e3a8a', '#1c1917', '#fef3c7'].map((hex) => (
                    <button
                      key={hex}
                      type="button"
                      onClick={() => setColor(hex)}
                      className="w-7 h-7 rounded-full border border-white/20 shadow-md"
                      style={{ backgroundColor: hex }}
                    />
                  ))}
                </div>
              </div>
            </div>


            <div className="space-y-2.5">
              <div className="flex justify-between items-center text-xs uppercase tracking-widest font-semibold text-stone-500 dark:text-stone-400">
                <span>Interactive Decor Scale</span>
                <span className="font-bold text-xs px-2.5 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-white border border-stone-200 dark:border-stone-700">
                  {scale}%
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setScale((prev) => Math.max(10, prev - 5))}
                  className="w-7 h-7 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 flex items-center justify-center font-bold text-sm border border-stone-200 dark:border-stone-700 transition-colors shrink-0"
                  title="Decrease scale by 5%"
                >
                  −
                </button>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={scale}
                  onChange={(e) => setScale(Number(e.target.value))}
                  className="luxury-range w-full cursor-pointer"
                />
                <button
                  type="button"
                  onClick={() => setScale((prev) => Math.min(100, prev + 5))}
                  className="w-7 h-7 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 flex items-center justify-center font-bold text-sm border border-stone-200 dark:border-stone-700 transition-colors shrink-0"
                  title="Increase scale by 5%"
                >
                  +
                </button>
              </div>
              <div className="flex items-center justify-between gap-1.5 pt-0.5">
                {[25, 50, 75, 100].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setScale(preset)}
                    className={`flex-1 py-1 rounded-md text-[10px] font-bold border transition-colors ${
                      scale === preset
                        ? 'bg-emerald-950 text-white border-emerald-950 dark:bg-white dark:text-stone-950 dark:border-white'
                        : 'bg-stone-50 dark:bg-stone-900 text-stone-600 dark:text-stone-400 border-stone-200 dark:border-stone-800 hover:bg-stone-100 dark:hover:bg-stone-800'
                    }`}
                  >
                    {preset}%
                  </button>
                ))}
              </div>
            </div>

            {product?.category === 'Wall Decor' && (
              <div className="space-y-2">
                <label className="block text-xs uppercase tracking-widest font-semibold text-stone-400 dark:text-stone-500">
                  Frame Moulding
                </label>
                <select
                  value={frameStyle}
                  onChange={(e) => setFrameStyle(e.target.value)}
                  className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 px-4 py-3 rounded-xl focus:outline-none focus:border-emerald-600 dark:focus:border-white transition-colors text-stone-900 dark:text-white"
                >
                  <option value="black">Charcoal Ash (Deep Black)</option>
                  <option value="oak">Raw Oak (Warm Natural)</option>
                  <option value="gold">Bespoke Gold (Metallic Brass)</option>
                  <option value="white">Gallery White (Satin Lacquer)</option>
                  <option value="none">Borderless Canvas Wrap</option>
                </select>
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-xs uppercase tracking-widest font-semibold text-stone-400 dark:text-stone-500">
                Room Scene Backdrop
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  ['living', 'Living Room'],
                  ['bedroom', 'Bedroom'],
                  ['office', 'Study Office']
                ].map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setActiveBackdrop(key)}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                      activeBackdrop === key
                        ? 'bg-emerald-950 dark:bg-white text-white dark:text-stone-950 border border-emerald-800 dark:border-white'
                        : 'bg-stone-50 dark:bg-stone-900 text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 border border-stone-200 dark:border-stone-800'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs uppercase tracking-widest font-semibold text-stone-400 dark:text-stone-500">
                Upload Room Overlay
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleRoomImageChange}
                className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-950 dark:file:bg-white file:text-white dark:file:text-stone-950 hover:file:opacity-90 cursor-pointer"
              />
            </div>



            <button
              type="submit"
              className="w-full bg-emerald-900 dark:bg-white dark:text-stone-950 text-white px-6 py-4 rounded-xl font-semibold hover:bg-emerald-800 dark:hover:bg-stone-200 shadow-[0_0_20px_rgba(6,78,59,0.3)] transition-all flex justify-center items-center gap-2 mt-4"
            >
              Save Design & Preview
              <span className="material-symbols-outlined text-[20px]">design_services</span>
            </button>
          </form>
        </div>

        {/* Canvas Showcase Card */}
        <div className="lg:col-span-8 lg:sticky lg:top-6 bg-white dark:bg-stone-950 p-8 rounded-3xl whisper-shadow border border-stone-100 dark:border-stone-900 flex flex-col gap-6 h-fit">
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-headline-md text-xl text-primary">Room Visualizer</h2>
              <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 dark:text-white bg-emerald-500/10 dark:bg-white/10 px-3 py-1 rounded-full">
                <span className="w-2 h-2 rounded-full bg-emerald-600 dark:bg-white animate-ping"></span>
                Real-time Rendering
              </span>
            </div>

            <div className="relative rounded-2xl overflow-hidden border border-stone-200 dark:border-stone-800 bg-stone-100 whisper-shadow">
              <canvas
                ref={canvasRef}
                width={760}
                height={490}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                className="w-full h-auto block cursor-grab active:cursor-grabbing"
              />

              {/* Loader overlay */}
              {aiLoading && (
                <div className="absolute inset-0 bg-emerald-950/80 backdrop-blur-md flex flex-col items-center justify-center text-center text-white space-y-4">
                  <span className="material-symbols-outlined text-[48px] animate-spin text-emerald-300">schema</span>
                  <div>
                    <h4 className="font-bold text-base">{loaderTitle}</h4>
                    <p className="text-xs text-stone-300 mt-1 font-mono">{loaderMsg}</p>
                  </div>
                </div>
              )}
            </div>
          </div>


        </div>
      </div>
    </div>
  )
}

