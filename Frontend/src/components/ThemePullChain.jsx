import React, { useState, useEffect } from 'react'

export default function ThemePullChain() {
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'))

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'))
    })
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  const pullThemeSwitch = () => {
    const container = document.getElementById('theme-pull-chain-container')
    if (!container || container.classList.contains('pulling')) return

    // Visual click pull animation
    container.classList.add('pulling')

    // Tactile sound synthesis using Web Audio API (mechanical pull-chain click)
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext
      if (AudioCtx) {
        const ctx = new AudioCtx()
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.connect(gain)
        gain.connect(ctx.destination)

        // Light quick click sound
        osc.type = 'sine'
        osc.frequency.setValueAtTime(1000, ctx.currentTime)
        osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.08)
        gain.gain.setValueAtTime(0.05, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08)

        osc.start()
        osc.stop(ctx.currentTime + 0.08)
      }
    } catch (e) {
      // Audio context blocked or not supported
    }

    // Toggle classes at peak pull (120ms)
    setTimeout(() => {
      const html = document.documentElement
      const currentlyDark = html.classList.contains('dark')

      if (currentlyDark) {
        html.classList.remove('dark')
        html.classList.add('light')
        localStorage.setItem('theme', 'light')
        setIsDark(false)
      } else {
        html.classList.remove('light')
        html.classList.add('dark')
        localStorage.setItem('theme', 'dark')
        setIsDark(true)
      }

      // Create physical incandescent bulb room flash overlay
      const flash = document.createElement('div')
      flash.style.position = 'fixed'
      flash.style.inset = '0'
      flash.style.backgroundColor = currentlyDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.25)'
      flash.style.zIndex = '999999'
      flash.style.pointerEvents = 'none'
      flash.style.transition = 'opacity 0.25s ease-out'
      document.body.appendChild(flash)
      setTimeout(() => {
        flash.style.opacity = '0'
        setTimeout(() => flash.remove(), 250)
      }, 30)
    }, 120)

    // Snap-back spring recoil animation (180ms -> 350ms)
    setTimeout(() => {
      container.classList.remove('pulling')
      container.classList.add('releasing')
      setTimeout(() => {
        container.classList.remove('releasing')
      }, 350)
    }, 180)
  }

  return (
    <div
      id="theme-pull-chain-container"
      className="pull-chain-container fixed top-0 right-10 md:right-16 z-[9999] flex flex-col items-center select-none pointer-events-auto"
      style={{ transformOrigin: 'top center' }}
    >
      {/* Beaded cord string (repeating circles) */}
      <div
        className="w-[3px] transition-all duration-700 ease-out"
        id="theme-chain-string"
        style={{
          height: 108,
          background: 'radial-gradient(circle, #bdae95 1.5px, transparent 1.5px) repeat-y',
          backgroundSize: '3px 7px',
          filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.12))',
        }}
      ></div>

      {/* Bulb socket mount */}
      <div className="w-4 h-2.5 bg-stone-600 dark:bg-stone-800 rounded-t-sm shadow-sm transition-colors duration-500 border border-stone-500/50"></div>

      {/* Brass ring coordinate */}
      <div className="w-5 h-1.5 bg-amber-600 dark:bg-amber-700 shadow-sm transition-colors duration-500"></div>

      {/* Interactive bulb switch knob */}
      <button
        onClick={pullThemeSwitch}
        id="theme-bulb-knob"
        className="relative w-8 h-10 bg-stone-100/90 dark:bg-amber-400/90 rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.15)] flex items-center justify-center cursor-pointer transition-all duration-500 focus:outline-none -mt-0.5 border border-stone-300 dark:border-amber-300 group overflow-visible"
        aria-label="Toggle light theme"
      >
        {/* Bulb filament */}
        <div className="absolute top-2 w-3.5 h-3 border-t border-x border-stone-400/80 dark:border-amber-900/60 rounded-t-sm opacity-70 dark:opacity-40 transition-all duration-500"></div>

        {/* Inner glow core */}
        <div
          className="absolute inset-1 rounded-full opacity-0 dark:opacity-100 transition-opacity duration-500"
          style={{ background: 'radial-gradient(circle, #ffffff 0%, rgba(255,255,255,0.2) 60%, transparent 100%)' }}
        ></div>

        {/* Outer soft light bloom around the bulb in dark mode */}
        <div className="absolute -inset-10 bg-amber-400/20 dark:bg-amber-400/35 rounded-full blur-xl opacity-0 dark:opacity-100 transition-opacity duration-500 pointer-events-none scale-75 group-hover:scale-100"></div>

        {/* Subtle interactive visual hint label */}
        <span className="absolute -bottom-6 text-[8px] font-extrabold tracking-[0.2em] text-stone-400 dark:text-amber-500/80 uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          PULL
        </span>
      </button>
    </div>
  )
}

