<!DOCTYPE html>

<html class="light" lang="en"><head>
<script>
    // Pre-initialize dark theme to avoid flash
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
    } else {
        document.documentElement.classList.add('light');
        document.documentElement.classList.remove('dark');
    }
</script>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&amp;family=Inter:wght@400;500;600&amp;family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">
        tailwind.config = {
          darkMode: "class",
          theme: {
            extend: {
              "colors": {
                      "emerald": {
                        50: "#faf9f5",
                        100: "#f3f1e9",
                        200: "#e7e3d6",
                        300: "#d5cdbc",
                        400: "#bdae95",
                        450: "#a9987f",
                        500: "#c5a880",
                        600: "#a3875f",
                        700: "#816843",
                        800: "#18181b",
                        900: "#09090b",
                        950: "#020202"
                      },
                      "stone": {
                        50: "#fafaf9",
                        100: "#f5f5f4",
                        200: "#e7e5e4",
                        300: "#d6d3d1",
                        400: "#a8a29e",
                        450: "#8c857f",
                        500: "#78716c",
                        600: "#57534e",
                        650: "#4d4944",
                        700: "#44403c",
                        800: "#292524",
                        850: "#1c1917",
                        855: "#151312",
                        900: "#1c1917",
                        950: "#0c0a09"
                      },
                      "rose": {
                        50: "#fff1f2",
                        100: "#ffe4e6",
                        200: "#fecdd3",
                        300: "#fda4af",
                        400: "#fb7185",
                        450: "#f43f5e",
                        500: "#f43f5e",
                        600: "#e11d48",
                        700: "#be123c",
                        800: "#9f1239",
                        900: "#881337",
                        955: "#4c0519"
                      },
                      "amber": {
                        50: "#fffbeb",
                        100: "#fef3c7",
                        200: "#fde68a",
                        300: "#fcd34d",
                        400: "#fbbf24",
                        450: "#f59e0b",
                        500: "#f59e0b",
                        600: "#d97706",
                        700: "#b45309",
                        800: "#92400e",
                        850: "#853a0c",
                        900: "#78350f",
                        950: "#451a03"
                      },
                      "primary-fixed": "#e7e3d6",
                      "outline": "#71717a",
                      "inverse-surface": "#18181b",
                      "error-container": "#ffdad6",
                      "on-tertiary": "#ffffff",
                      "on-surface": "#09090b",
                      "primary": "#09090b",
                      "on-primary": "#ffffff",
                      "tertiary": "#c5a880",
                      "on-secondary-fixed": "#09090b",
                      "surface-container-low": "#faf9f5",
                      "background": "#fbfbfa",
                      "surface-container-highest": "#e7e3d6",
                      "on-tertiary-fixed-variant": "#816843",
                      "surface-variant": "#e7e3d6",
                      "surface-container-lowest": "#ffffff",
                      "on-error-container": "#93000a",
                      "on-surface-variant": "#27272a",
                      "surface-container": "#f3f1e9",
                      "on-secondary-container": "#71717a",
                      "on-primary-container": "#ffffff",
                      "on-tertiary-container": "#ffffff",
                      "surface": "#fbfbfa",
                      "on-primary-fixed-variant": "#27272a",
                      "secondary-fixed-dim": "#d5cdbc",
                      "surface-tint": "#18181b",
                      "on-secondary": "#ffffff",
                      "inverse-primary": "#d5cdbc",
                      "outline-variant": "#e7e3d6",
                      "surface-container-high": "#e7e3d6",
                      "error": "#ba1a1a",
                      "on-tertiary-fixed": "#331200",
                      "tertiary-fixed": "#ffdbca",
                      "on-secondary-fixed-variant": "#27272a",
                      "on-background": "#09090b",
                      "primary-container": "#09090b",
                      "on-primary-fixed": "#000000",
                      "secondary-fixed": "#e7e3d6",
                      "secondary-container": "#e7e3d6",
                      "primary-fixed-dim": "#e7e3d6",
                      "surface-dim": "#e7e3d6",
                      "inverse-on-surface": "#faf9f5",
                      "secondary": "#71717a",
                      "surface-bright": "#fbfbfa",
                      "on-error": "#ffffff",
                      "tertiary-container": "#c5a880",
                      "tertiary-fixed-dim": "#d5cdbc"
              },
              "borderRadius": {
                      "DEFAULT": "0.25rem",
                      "lg": "0.5rem",
                      "xl": "0.75rem",
                      "full": "9999px"
              },
              "spacing": {
                      "margin-desktop": "80px",
                      "margin-mobile": "20px",
                      "section-gap": "120px",
                      "unit": "8px",
                      "gutter": "24px",
                      "container-max": "1440px"
              },
              "fontFamily": {
                      "display-xl": ["Plus Jakarta Sans"],
                      "label-sm": ["Inter"],
                      "headline-lg": ["Plus Jakarta Sans"],
                      "headline-md": ["Plus Jakarta Sans"],
                      "body-lg": ["Inter"],
                      "body-md": ["Inter"]
              },
              "fontSize": {
                      "display-xl": ["60px", {"lineHeight": "1.1", "letterSpacing": "-0.02em", "fontWeight": "700"}],
                      "label-sm": ["12px", {"lineHeight": "1", "letterSpacing": "0.08em", "fontWeight": "600"}],
                      "headline-lg": ["40px", {"lineHeight": "1.2", "letterSpacing": "-0.01em", "fontWeight": "600"}],
                      "headline-md": ["28px", {"lineHeight": "1.3", "letterSpacing": "0em", "fontWeight": "600"}],
                      "body-lg": ["18px", {"lineHeight": "1.6", "letterSpacing": "0em", "fontWeight": "400"}],
                      "body-md": ["16px", {"lineHeight": "1.6", "letterSpacing": "0em", "fontWeight": "400"}]
              }
            },
          },
        }
    </script>
<style>
        .glass-panel {
            background: rgba(255, 255, 255, 0.8);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
        }
        .whisper-shadow {
            box-shadow: 0 20px 40px -15px rgba(0, 53, 39, 0.15);
        }
        .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        
        /* Smooth transitions for theme toggle — all elements inherit */
        *, *::before, *::after {
            transition-property: background-color, border-color, color, fill, stroke;
            transition-duration: 0.4s;
            transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        }
        /* But don't slow down transforms/opacity that need to be snappy */
        .pull-chain-container, .pull-chain-container * {
            transition-property: transform, opacity;
        }

        /* Interactive sway chain animations */
        @keyframes swayChain {
            0% { transform: rotate(0deg); }
            20% { transform: rotate(2deg); }
            40% { transform: rotate(-1.5deg); }
            60% { transform: rotate(1deg); }
            80% { transform: rotate(-0.5deg); }
            100% { transform: rotate(0deg); }
        }
        .pull-chain-container {
            animation: swayChain 6s ease-in-out infinite;
        }
        .pull-chain-container:hover {
            animation: swayChain 2.5s ease-in-out infinite;
        }
        .pull-chain-container.pulling {
            transform: translateY(35px) scaleY(0.92);
            animation: none !important;
            transition: transform 0.12s cubic-bezier(0.25, 0.46, 0.45, 0.94) !important;
        }
        .pull-chain-container.releasing {
            transform: translateY(-5px);
            animation: none !important;
            transition: transform 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.25) !important;
        }
        
        /* ════════════════════════════════════════════════════════════ */
        /* GLOBAL DARK MODE OVERRIDES                                   */
        /* ════════════════════════════════════════════════════════════ */
        .dark body {
            background-color: #09090b !important;
            color: #fafaf9 !important;
        }
        .dark .bg-background { background-color: #09090b !important; }
        .dark .bg-white      { background-color: #1c1917 !important; }
        .dark .bg-stone-50   { background-color: #0c0a09 !important; }
        .dark .bg-white\/80  { background-color: rgba(28,25,23,0.8) !important; }
        .dark .bg-white\/70  { background-color: rgba(28,25,23,0.7) !important; }
        .dark .bg-white\/50  { background-color: rgba(28,25,23,0.5) !important; }
        .dark .bg-stone-50\/50 { background-color: rgba(12,10,9,0.5) !important; }
        .dark .bg-surface-container-low     { background-color: #0c0a09 !important; }
        .dark .bg-surface-container-lowest  { background-color: #09090b !important; }

        /* Text */
        .dark .text-primary          { color: #f5f5f4 !important; }
        .dark .text-on-background    { color: #fafaf9 !important; }
        .dark .text-on-surface-variant { color: #d6d3d1 !important; }
        .dark .text-stone-900        { color: #f5f5f4 !important; }
        .dark .text-stone-800        { color: #e7e5e4 !important; }
        .dark .text-stone-700        { color: #d6d3d1 !important; }
        .dark .text-stone-600        { color: #a8a29e !important; }
        .dark .text-stone-500        { color: #a8a29e !important; }
        /* Don't override intentional muted/accent text that has explicit dark: variants */

        /* Borders */
        .dark .border-stone-100      { border-color: #292524 !important; }
        .dark .border-stone-200      { border-color: #292524 !important; }
        .dark .border-stone-200\/40  { border-color: rgba(41,37,36,0.4) !important; }
        .dark .border-stone-200\/50  { border-color: rgba(41,37,36,0.5) !important; }
        .dark .border-white\/40      { border-color: rgba(41,37,36,0.4) !important; }
        .dark .border-white\/30      { border-color: rgba(41,37,36,0.3) !important; }

        /* Shadow */
        .dark .whisper-shadow {
            box-shadow: 0 20px 40px -15px rgba(0,0,0,0.5) !important;
        }

        /* ── Form Controls ── */
        .dark input,
        .dark select,
        .dark textarea {
            background-color: #1c1917 !important;
            color: #fafaf9 !important;
            border-color: #44403c !important;
        }
        .dark input::placeholder,
        .dark textarea::placeholder {
            color: #78716c !important;
        }
        /* Focused ring retains accent */
        .dark input:focus,
        .dark select:focus,
        .dark textarea:focus {
            border-color: #d97706 !important; /* amber-600 */
            outline: none;
        }
        /* Select dropdown option text */
        .dark select option {
            background-color: #1c1917;
            color: #fafaf9;
        }

        /* ── Buttons — any button without explicit dark: classes ── */
        .dark button:not([class*="dark:"])  {
            color: inherit;
        }

        /* ── Footer ── */
        .dark footer ul li a,
        .dark footer p {
            color: #a8a29e !important;
        }
        .dark footer ul li a:hover {
            color: #6ee7b7 !important; /* emerald-300 */
        }

        /* ── Newsletter input in footer ── */
        .dark footer input[type="email"] {
            background-color: #1c1917 !important;
            border-color: #44403c !important;
            color: #fafaf9 !important;
        }
        .dark footer input[type="email"]::placeholder {
            color: #78716c !important;
        }

        /* ── Mobile drawer login border button ── */
        .dark a.border-stone-200 {
            border-color: #44403c !important;
            color: #d6d3d1 !important;
        }

        /* ── Mobile hamburger icon ── */
        .dark #mobileMenuBtn {
            color: #d6d3d1 !important;
        }

        /* ── Table cells — make sure text shows in dark ── */
        .dark td, .dark th {
            color: inherit;
        }

        /* ── Admin: selects inside tables / command centre ── */
        .dark .admin-status-select {
            background-color: #1c1917 !important;
            color: #fafaf9 !important;
            border-color: #44403c !important;
        }
    </style>
</head>
<body class="bg-background text-on-background font-body-md transition-colors duration-500">
<!-- Elegant Premium Tactile Pull-Chain Switch -->
<div id="theme-pull-chain-container" class="pull-chain-container fixed top-0 right-10 md:right-16 z-[9999] flex flex-col items-center select-none pointer-events-auto" style="transform-origin: top center;">
    <!-- Beaded cord string (repeating circles) -->
    <div class="w-[3px] transition-all duration-700 ease-out" id="theme-chain-string" style="height: 120px; background: radial-gradient(circle, #bdae95 1.5px, transparent 1.5px) repeat-y; background-size: 3px 7px; filter: drop-shadow(0 2px 2px rgba(0,0,0,0.12));"></div>
    
    <!-- Bulb socket mount -->
    <div class="w-4 h-2.5 bg-stone-600 dark:bg-stone-800 rounded-t-sm shadow-sm transition-colors duration-500 border border-stone-500/50"></div>
    <!-- Brass ring coordinate -->
    <div class="w-5 h-1.5 bg-amber-600 dark:bg-amber-700 shadow-sm transition-colors duration-500"></div>

    <!-- Interactive bulb switch knob -->
    <button onclick="pullThemeSwitch()" id="theme-bulb-knob" class="relative w-8 h-10 bg-stone-100/90 dark:bg-amber-400/90 rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.15)] flex items-center justify-center cursor-pointer transition-all duration-500 focus:outline-none -mt-0.5 border border-stone-300 dark:border-amber-300 group overflow-visible" aria-label="Toggle light theme">
        <!-- Bulb filament -->
        <div class="absolute top-2 w-3.5 h-3 border-t border-x border-stone-400/80 dark:border-amber-900/60 rounded-t-sm opacity-70 dark:opacity-40 transition-all duration-500"></div>
        <!-- Inner glow core -->
        <div class="absolute inset-1 rounded-full bg-radial-gradient from-white to-transparent opacity-0 dark:opacity-100 transition-opacity duration-500"></div>
        <!-- Outer soft light bloom around the bulb in dark mode -->
        <div class="absolute -inset-10 bg-amber-400/20 dark:bg-amber-400/30 rounded-full blur-xl opacity-0 dark:opacity-100 transition-opacity duration-500 pointer-events-none scale-75 group-hover:scale-100"></div>
        
        <!-- Subtle interactive visual hint label -->
        <span class="absolute -bottom-6 text-[8px] font-extrabold tracking-[0.2em] text-stone-400 dark:text-amber-500/80 uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-300">PULL</span>
    </button>
</div>

@if(!request()->routeIs('admin.*'))
<!-- TopNavBar -->
<nav class="sticky top-0 w-full z-50 bg-white/80 dark:bg-stone-950/80 backdrop-blur-md border-b border-stone-100 dark:border-stone-800 shadow-[0_10px_40px_-15px_rgba(6,78,59,0.04)]">
<div class="flex justify-between items-center max-w-7xl mx-auto px-6 md:px-12 h-20">
<div class="text-2xl font-extrabold tracking-[0.25em] uppercase text-emerald-900 dark:text-emerald-50"><a href="{{ route('home') }}" class="hover:opacity-80 transition-opacity">KaYa</a></div>
<div class="hidden md:flex items-center gap-8 font-plus-jakarta-sans text-sm tracking-wide">
<a class="{{ request()->routeIs('home') ? 'text-emerald-900 dark:text-emerald-400 font-semibold border-b-2 border-emerald-900 dark:border-emerald-400 pb-1' : 'text-stone-500 dark:text-stone-400 hover:text-emerald-800 dark:hover:text-emerald-200 transition-colors' }}" href="{{ route('home') }}">Home</a>
<a class="{{ request()->routeIs('products.index') ? 'text-emerald-900 dark:text-emerald-400 font-semibold border-b-2 border-emerald-900 dark:border-emerald-400 pb-1' : 'text-stone-500 dark:text-stone-400 hover:text-emerald-800 dark:hover:text-emerald-200 transition-colors' }}" href="{{ route('products.index') }}">Products</a>
<a class="{{ request()->routeIs('customize.index') ? 'text-emerald-900 dark:text-emerald-400 font-semibold border-b-2 border-emerald-900 dark:border-emerald-400 pb-1' : 'text-stone-500 dark:text-stone-400 hover:text-emerald-800 dark:hover:text-emerald-200 transition-colors' }}" href="{{ route('customize.index') }}">Customize</a>
<a class="{{ request()->routeIs('ai.designer') ? 'text-emerald-900 dark:text-emerald-400 font-semibold border-b-2 border-emerald-900 dark:border-emerald-400 pb-1' : 'text-stone-500 dark:text-stone-400 hover:text-emerald-800 dark:hover:text-emerald-200 transition-colors' }}" href="{{ route('ai.designer') }}">AI Designer</a>
</div>
<div class="flex items-center gap-4">
<!-- Cart Icon -->
<a href="{{ route('cart.index') }}" class="relative p-2 text-stone-500 hover:text-emerald-800 dark:hover:text-emerald-300 transition-colors">
    <span class="material-symbols-outlined text-[24px]">shopping_bag</span>
    <span class="cart-count-badge hidden absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-emerald-700 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 leading-none">0</span>
</a>
@auth
@if(Auth::user()->is_admin)
<a href="{{ route('admin.dashboard') }}" class="hidden md:inline {{ request()->routeIs('admin.dashboard') ? 'text-emerald-900 dark:text-emerald-400 font-semibold border-b-2 border-emerald-900 dark:border-emerald-400 pb-1' : 'text-sm font-semibold text-emerald-900 dark:text-emerald-300 hover:opacity-80 transition-opacity' }}">Admin Portal</a>
@endif
<a href="{{ route('dashboard') }}" class="hidden md:inline {{ request()->routeIs('dashboard') ? 'text-emerald-900 dark:text-emerald-400 font-semibold' : 'text-sm font-semibold text-emerald-900 dark:text-emerald-300 hover:opacity-80 transition-opacity' }}">My Orders</a>
<a href="{{ route('logout') }}" onclick="event.preventDefault(); document.getElementById('logout-form').submit();" class="hidden md:inline px-4 py-2 text-sm font-semibold text-stone-500 hover:text-rose-600 transition-colors">Logout</a>
<form id="logout-form" action="{{ route('logout') }}" method="POST" class="hidden">
    @csrf
</form>
@else
<a href="{{ route('login') }}" class="hidden md:inline px-5 py-2 text-sm font-semibold text-stone-500 hover:text-emerald-800 transition-colors">Login</a>
<a href="{{ route('register') }}" class="hidden md:inline bg-primary text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:opacity-80 transition-opacity">Sign Up</a>
@endauth
<!-- Hamburger (mobile only) -->
<button id="mobileMenuBtn" class="md:hidden p-2 text-stone-600 hover:text-emerald-800 transition-colors" onclick="toggleMobileMenu()" aria-label="Open menu">
    <span class="material-symbols-outlined text-[26px]" id="hamburgerIcon">menu</span>
</button>
</div>
</div>
</nav>

<!-- Mobile Nav Drawer -->
<div id="mobileDrawer" class="hidden md:hidden fixed inset-0 z-40" onclick="closeMobileMenu()">
    <!-- Backdrop -->
    <div class="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
    <!-- Panel -->
    <div class="absolute top-0 right-0 h-full w-72 bg-white dark:bg-stone-950 shadow-2xl flex flex-col" onclick="event.stopPropagation()">
        <div class="flex items-center justify-between px-6 py-5 border-b border-stone-100 dark:border-stone-800">
            <span class="text-xl font-extrabold tracking-[0.25em] uppercase text-emerald-900 dark:text-emerald-50">KaYa</span>
            <button onclick="closeMobileMenu()" class="p-2 text-stone-400 hover:text-stone-700 transition-colors">
                <span class="material-symbols-outlined">close</span>
            </button>
        </div>
        <nav class="flex flex-col gap-1 p-4 flex-1">
            <a href="{{ route('home') }}" class="flex items-center gap-3 px-4 py-3 rounded-xl text-stone-700 dark:text-stone-300 hover:bg-emerald-50 dark:hover:bg-stone-900 hover:text-emerald-800 font-semibold transition-colors">
                <span class="material-symbols-outlined text-[20px]">home</span> Home
            </a>
            <a href="{{ route('products.index') }}" class="flex items-center gap-3 px-4 py-3 rounded-xl text-stone-700 dark:text-stone-300 hover:bg-emerald-50 dark:hover:bg-stone-900 hover:text-emerald-800 font-semibold transition-colors">
                <span class="material-symbols-outlined text-[20px]">storefront</span> Products
            </a>
            <a href="{{ route('customize.index') }}" class="flex items-center gap-3 px-4 py-3 rounded-xl text-stone-700 dark:text-stone-300 hover:bg-emerald-50 dark:hover:bg-stone-900 hover:text-emerald-800 font-semibold transition-colors">
                <span class="material-symbols-outlined text-[20px]">design_services</span> Customize
            </a>
            <a href="{{ route('ai.designer') }}" class="flex items-center gap-3 px-4 py-3 rounded-xl text-stone-700 dark:text-stone-300 hover:bg-emerald-50 dark:hover:bg-stone-900 hover:text-emerald-800 font-semibold transition-colors">
                <span class="material-symbols-outlined text-[20px]">auto_awesome</span> AI Designer
            </a>
            <a href="{{ route('cart.index') }}" class="flex items-center gap-3 px-4 py-3 rounded-xl text-stone-700 dark:text-stone-300 hover:bg-emerald-50 dark:hover:bg-stone-900 hover:text-emerald-800 font-semibold transition-colors">
                <span class="material-symbols-outlined text-[20px]">shopping_bag</span> Cart
            </a>
            @auth
            @if(Auth::user()->is_admin)
            <a href="{{ route('admin.dashboard') }}" class="flex items-center gap-3 px-4 py-3 rounded-xl text-stone-700 dark:text-stone-300 hover:bg-emerald-50 dark:hover:bg-stone-900 hover:text-emerald-800 font-semibold transition-colors">
                <span class="material-symbols-outlined text-[20px]">shield_person</span> Admin Portal
            </a>
            @endif
            <a href="{{ route('dashboard') }}" class="flex items-center gap-3 px-4 py-3 rounded-xl text-stone-700 dark:text-stone-300 hover:bg-emerald-50 dark:hover:bg-stone-900 hover:text-emerald-800 font-semibold transition-colors">
                <span class="material-symbols-outlined text-[20px]">receipt_long</span> My Orders
            </a>
            @else
            <div class="border-t border-stone-100 dark:border-stone-800 pt-4 mt-2 flex flex-col gap-2">
                <a href="{{ route('login') }}" class="px-4 py-3 text-center rounded-xl border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 font-semibold text-sm hover:bg-stone-50 dark:hover:bg-stone-900 transition-colors">Login</a>
                <a href="{{ route('register') }}" class="px-4 py-3 text-center rounded-xl bg-emerald-950 dark:bg-amber-600 text-white font-semibold text-sm hover:opacity-90 transition-opacity">Sign Up</a>
            </div>
            @endauth
        </nav>
        @auth
        <div class="p-4 border-t border-stone-100 dark:border-stone-800">
            <form action="{{ route('logout') }}" method="POST">
                @csrf
                <button type="submit" class="w-full py-3 rounded-xl border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 font-semibold text-sm hover:bg-rose-50 dark:hover:bg-rose-950 transition-colors">Logout</button>
            </form>
        </div>
        @endauth
    </div>
</div>
@endif

@if(session('success'))
    <div class="max-w-7xl mx-auto px-6 md:px-12 mt-6" id="flash-success">
        <div class="flex items-center justify-between gap-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-200 px-6 py-4 rounded-2xl backdrop-blur-md">
            <div class="flex items-center gap-3">
                <span class="material-symbols-outlined text-emerald-600 dark:text-emerald-400">check_circle</span>
                <span class="text-sm font-semibold">{{ session('success') }}</span>
            </div>
            <button onclick="document.getElementById('flash-success').remove()" class="text-emerald-600 dark:text-emerald-400 hover:opacity-70 transition-opacity">
                <span class="material-symbols-outlined text-[18px]">close</span>
            </button>
        </div>
    </div>
@endif

@if(session('error'))
    <div class="max-w-7xl mx-auto px-6 md:px-12 mt-6" id="flash-error">
        <div class="flex items-center justify-between gap-3 bg-rose-500/10 border border-rose-500/20 text-rose-800 dark:text-rose-200 px-6 py-4 rounded-2xl backdrop-blur-md">
            <div class="flex items-center gap-3">
                <span class="material-symbols-outlined text-rose-600 dark:text-rose-400">error</span>
                <span class="text-sm font-semibold">{{ session('error') }}</span>
            </div>
            <button onclick="document.getElementById('flash-error').remove()" class="text-rose-600 dark:text-rose-400 hover:opacity-70 transition-opacity">
                <span class="material-symbols-outlined text-[18px]">close</span>
            </button>
        </div>
    </div>
@endif

<main class="min-h-screen">
    @yield('content')
</main>

@if(!request()->routeIs('admin.*'))
<!-- Footer -->
<footer class="w-full pt-20 pb-10 bg-stone-50 dark:bg-stone-950 border-t border-stone-200 dark:border-stone-800">
<div class="max-w-7xl mx-auto px-6 md:px-12">
<div class="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
<div class="col-span-1 md:col-span-1">
<div class="text-lg font-extrabold tracking-[0.2em] uppercase text-emerald-900 dark:text-emerald-50 mb-6">KaYa</div>
<p class="text-stone-500 dark:text-stone-400 font-body-md mb-6 leading-relaxed">Defining the art of personalized luxury for the modern home. Impeccable craft, innovative technology.</p>
<div class="flex gap-4">
<a class="text-stone-400 hover:text-emerald-700 transition-colors" href="#"><span class="material-symbols-outlined">public</span></a>
<a class="text-stone-400 hover:text-emerald-700 transition-colors" href="#"><span class="material-symbols-outlined">alternate_email</span></a>
<a class="text-stone-400 hover:text-emerald-700 transition-colors" href="#"><span class="material-symbols-outlined">share</span></a>
</div>
</div>
<div>
<h4 class="font-label-sm text-stone-900 dark:text-white mb-6 uppercase tracking-widest">Collections</h4>
<ul class="space-y-4 font-body-md text-stone-500 dark:text-stone-400">
<li><a class="hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors" href="{{ route('products.index') }}">Wall Gallery</a></li>
<li><a class="hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors" href="{{ route('products.index') }}">Lighting Sculptures</a></li>
<li><a class="hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors" href="{{ route('products.index') }}">Soft Goods</a></li>
<li><a class="hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors" href="{{ route('products.index') }}">New Arrivals</a></li>
</ul>
</div>
<div>
<h4 class="font-label-sm text-stone-900 dark:text-white mb-6 uppercase tracking-widest">Experience</h4>
<ul class="space-y-4 font-body-md text-stone-500 dark:text-stone-400">
<li><a class="hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors" href="{{ route('customize.index') }}">AR Visualizer</a></li>
<li><a class="hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors" href="javascript:void(0)" onclick="openAestheticQuizGlobal()">AI Curation Quiz</a></li>
<li><a class="hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors" href="{{ route('ai.designer') }}">AI Room Designer</a></li>
<li><a class="hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors" href="{{ route('products.index') }}">Bespoke Design Service</a></li>
</ul>
</div>
<div>
<h4 class="font-label-sm text-stone-900 dark:text-white mb-6 uppercase tracking-widest">Newsletter</h4>
<p class="text-stone-500 mb-4 font-body-md">Join our inner circle for exclusive design previews.</p>
<div class="flex">
<input class="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-600 px-4 py-3 rounded-l-lg w-full focus:outline-none focus:border-primary dark:focus:border-amber-500" placeholder="Email Address" type="email"/>
<button class="bg-primary dark:bg-amber-600 text-white px-4 py-3 rounded-r-lg hover:opacity-90 transition-opacity">
<span class="material-symbols-outlined">arrow_forward</span>
</button>
</div>
</div>
</div>
<div class="flex flex-col md:flex-row justify-between items-center gap-8 pt-10 border-t border-stone-200 dark:border-stone-800">
<div class="font-plus-jakarta-sans text-xs uppercase tracking-widest text-stone-400">© 2026 KaYa. The Art of Living Well.</div>
<div class="flex flex-wrap justify-center gap-8 font-plus-jakarta-sans text-xs uppercase tracking-widest">
<a class="text-stone-400 dark:text-stone-500 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors" href="#">Sustainability</a>
<a class="text-stone-400 dark:text-stone-500 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors" href="#">Shipping</a>
<a class="text-stone-400 dark:text-stone-500 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors" href="#">Returns</a>
<a class="text-stone-400 dark:text-stone-500 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors" href="#">Privacy Policy</a>
</div>
</div>
</div>
</footer>
@endif
<script>
    function toggleMobileMenu() {
        const drawer = document.getElementById('mobileDrawer');
        const icon   = document.getElementById('hamburgerIcon');
        const isHidden = drawer.classList.contains('hidden');
        if (isHidden) {
            drawer.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
            icon.textContent = 'close';
        } else {
            closeMobileMenu();
        }
    }

    function closeMobileMenu() {
        const drawer = document.getElementById('mobileDrawer');
        const icon   = document.getElementById('hamburgerIcon');
        drawer.classList.add('hidden');
        document.body.style.overflow = '';
        if (icon) icon.textContent = 'menu';
    }

    function openAestheticQuizGlobal() {
        if (typeof openAestheticQuiz === 'function') {
            openAestheticQuiz();
        } else {
            window.location.href = "/?trigger_quiz=true";
        }
    }

    // Global cart badge updater (runs on every page)
    function updateNavCartCount() {
        try {
            const cart  = JSON.parse(localStorage.getItem('kaya_cart') || '[]');
            const count = cart.reduce((s, i) => s + (i.qty || 1), 0);
            document.querySelectorAll('.cart-count-badge').forEach(el => {
                el.textContent = count;
                el.classList.toggle('hidden', count === 0);
            });
        } catch (e) {}
    }

    function addToCart(id, name, price, style, image) {
        try {
            let cart = JSON.parse(localStorage.getItem('kaya_cart') || '[]');
            const existing = cart.find(i => i.id === id);
            if (existing) {
                existing.qty += 1;
            } else {
                cart.push({ 
                    id, 
                    name, 
                    price: parseFloat(price), 
                    style: style || 'Bespoke Custom Frame', 
                    qty: 1, 
                    image: image || 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=700&q=80'
                });
            }
            localStorage.setItem('kaya_cart', JSON.stringify(cart));
            updateNavCartCount();
            // Flash feedback
            const toast = document.createElement('div');
            toast.textContent = '✓ Added to cart';
            toast.className = 'fixed bottom-6 right-6 z-[999] bg-emerald-900 text-white px-5 py-3 rounded-xl text-sm font-semibold shadow-lg pointer-events-none transition-all';
            document.body.appendChild(toast);
            setTimeout(() => toast.remove(), 2200);
        } catch(e) {}
    }

    document.addEventListener('DOMContentLoaded', updateNavCartCount);
</script>

<!-- KaYa Concierge Aesthetic Chatbot -->
@if(!request()->routeIs('admin.*'))
<div class="fixed bottom-6 right-6 z-[999] flex flex-col items-end">
    <!-- Chat Window (Hidden by default) -->
    <div id="kaya-chat-window" class="hidden w-[350px] h-[480px] bg-white/95 dark:bg-stone-950/95 border border-stone-200 dark:border-stone-850 rounded-[2rem] shadow-2xl flex flex-col overflow-hidden mb-4 transition-all duration-300 transform scale-95 opacity-0 origin-bottom-right">
        <!-- Chat Header -->
        <div class="p-5 bg-gradient-to-r from-stone-900 to-stone-950 text-white flex items-center justify-between border-b border-stone-800">
            <div class="flex items-center gap-3">
                <!-- Concierge Avatar -->
                <div class="relative w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                    <span class="material-symbols-outlined text-amber-500 text-[18px]">temp_preferences_custom</span>
                    <span class="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-stone-900"></span>
                </div>
                <div>
                    <h3 class="text-xs uppercase tracking-[0.2em] font-extrabold text-stone-100">KaYa Concierge</h3>
                    <p class="text-[9px] text-stone-400 font-medium">Bespoke Design Assistant</p>
                </div>
            </div>
            <button onclick="toggleKayaChat()" class="text-stone-400 hover:text-white transition-colors">
                <span class="material-symbols-outlined text-[20px]">close</span>
            </button>
        </div>

        <!-- Chat Messages Panel -->
        <div id="kaya-chat-messages" class="flex-1 p-5 overflow-y-auto space-y-4 text-xs scrollbar-thin">
            <!-- Greeting Message -->
            <div class="flex gap-2.5 items-start">
                <div class="w-6 h-6 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span class="material-symbols-outlined text-amber-500 text-[14px]">temp_preferences_custom</span>
                </div>
                <div class="bg-stone-50 dark:bg-stone-900 border border-stone-100 dark:border-stone-900 p-4 rounded-2xl rounded-tl-none text-stone-700 dark:text-stone-300 leading-relaxed max-w-[85%]">
                    Welcome to **KaYa**. I am your personal space harmonizer. 
                    <br><br>
                    I am trained to answer questions about why KaYa is the ultimate sanctuary for bespoke home decor, how our AI Room Harmonizer works, or guide you through your catalog selections. How can I inspire your space today?
                </div>
            </div>

            <!-- Pre-programmed FAQ chips -->
            <div class="flex flex-wrap gap-2 pt-2" id="chat-faq-chips">
                <button onclick="sendFaqQuery('Why KaYa?')" class="px-3 py-1.5 bg-stone-50 hover:bg-stone-100 dark:bg-stone-900 dark:hover:bg-stone-850 border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 rounded-xl transition-all font-semibold hover:border-amber-500/40 text-[9px]">Why KaYa?</button>
                <button onclick="sendFaqQuery('What is the Spatial Harmonizer?')" class="px-3 py-1.5 bg-stone-50 hover:bg-stone-100 dark:bg-stone-900 dark:hover:bg-stone-850 border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 rounded-xl transition-all font-semibold hover:border-amber-500/40 text-[9px]">What is the Spatial Harmonizer?</button>
                <button onclick="sendFaqQuery('How to order customizable products?')" class="px-3 py-1.5 bg-stone-50 hover:bg-stone-100 dark:bg-stone-900 dark:hover:bg-stone-850 border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 rounded-xl transition-all font-semibold hover:border-amber-500/40 text-[9px]">How do I order?</button>
                <button onclick="sendFaqQuery('Secure payment options?')" class="px-3 py-1.5 bg-stone-50 hover:bg-stone-100 dark:bg-stone-900 dark:hover:bg-stone-850 border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 rounded-xl transition-all font-semibold hover:border-amber-500/40 text-[9px]">Secure payment options?</button>
            </div>
        </div>

        <!-- Chat Input Footer -->
        <div class="p-4 bg-stone-50 dark:bg-stone-900 border-t border-stone-200 dark:border-stone-800 flex gap-2">
            <input type="text" id="kaya-chat-input" onkeypress="handleChatKey(event)" class="flex-1 bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800 px-4 py-2.5 rounded-xl text-xs text-primary focus:outline-none focus:border-amber-500/60" placeholder="Ask about KaYa, styling, custom canvas...">
            <button onclick="sendUserQuery()" class="bg-stone-900 text-white p-2.5 rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center">
                <span class="material-symbols-outlined text-[18px]">send</span>
            </button>
        </div>
    </div>

    <!-- Floating Chat Circle Toggle Button -->
    <button onclick="toggleKayaChat()" class="w-14 h-14 bg-stone-900 text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-105 transition-transform duration-300 relative group border border-amber-500/20">
        <span class="material-symbols-outlined text-[24px]">forum</span>
        <!-- Small Gilded Pulse -->
        <span class="absolute top-1 right-1 w-3 h-3 rounded-full bg-amber-500 border border-stone-900 animate-pulse"></span>
        <span class="absolute right-16 bg-stone-900 text-white font-label-sm uppercase tracking-widest text-[9px] font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-lg">KaYa Concierge</span>
    </button>
</div>
@endif

<script>
@if(!request()->routeIs('admin.*'))
    // Toggle Chat Window
    function toggleKayaChat() {
        const win = document.getElementById('kaya-chat-window');
        const isHidden = win.classList.contains('hidden');
        if (isHidden) {
            win.classList.remove('hidden');
            setTimeout(() => {
                win.classList.remove('opacity-0', 'scale-95');
            }, 50);
        } else {
            win.classList.add('opacity-0', 'scale-95');
            setTimeout(() => {
                win.classList.add('hidden');
            }, 300);
        }
    }

    function handleChatKey(e) {
        if (e.key === 'Enter') {
            sendUserQuery();
        }
    }

    function appendChatMessage(sender, text) {
        const container = document.getElementById('kaya-chat-messages');
        const msgDiv = document.createElement('div');
        msgDiv.className = 'flex gap-2.5 items-start ' + (sender === 'user' ? 'justify-end' : '');
        
        const avatarHtml = sender === 'bot' 
            ? `<div class="w-6 h-6 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center flex-shrink-0 mt-0.5"><span class="material-symbols-outlined text-amber-500 text-[14px]">temp_preferences_custom</span></div>`
            : '';
            
        const bubbleStyle = sender === 'user'
            ? 'bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl rounded-tr-none text-stone-800 dark:text-stone-200 max-w-[85%] leading-relaxed font-semibold'
            : 'bg-stone-50 dark:bg-stone-900 border border-stone-100 dark:border-stone-900 p-4 rounded-2xl rounded-tl-none text-stone-700 dark:text-stone-300 leading-relaxed max-w-[85%]';

        msgDiv.innerHTML = `
            ${avatarHtml}
            <div class="${bubbleStyle}">
                ${text}
            </div>
        `;
        
        container.appendChild(msgDiv);
        container.scrollTop = container.scrollHeight;
    }

    // AI Query Trainer & Responses
    const queryTrainer = {
        'why': 'At **KaYa**, we believe living spaces should not merely be decorated, but masterfully harmonized. Through our bespoke material selections, customizable canvas modules, and multi-modal **AI Spatial Harmonizer**, we curate pure environmental tranquility tailored exclusively to your sensory profile. We offer true quiet luxury for estates, reading zones, and styling nooks.',
        'what': 'KaYa represents the absolute frontier of quiet architectural luxury. We provide tailor-made products like custom cotton rag canvas wall arts, solid teak hexagonal mirrors, hand-knotted macrame details, and warm artisan ceramic lighting coordinates that you can design and personalize using our AI Art Spec generators.',
        'spatial': 'KaYa’s **Bespoke Spatial Harmonizer** is a multi-modal neural space planner. By uploading your room dimensions, specifying lighting configurations, and setting your aesthetic objective, our AI analyzes the coordinates and curates perfect spatial swatches, styling tips, and catalog complements in real-time.',
        'ai': 'KaYa’s **Bespoke Spatial Harmonizer** is a multi-modal neural space planner. By uploading your room dimensions, specifying lighting configurations, and setting your aesthetic objective, our AI analyzes the coordinates and curates perfect spatial swatches, styling tips, and catalog complements in real-time.',
        'order': 'Simply browse our collection in the **Products** section. Click **Customize** on any piece (like our Custom Canvas Wall Art, table lamps, or throws) to open the KaYa Design Studio. Here you can generate bespoke patterns using our integrated AI Art Spec Generator, choose sizes/finishes, and add the personalized result directly to your cart.',
        'customize': 'Simply browse our collection in the **Products** section. Click **Customize** on any piece (like our Custom Canvas Wall Art, table lamps, or throws) to open the KaYa Design Studio. Here you can generate bespoke patterns using our integrated AI Art Spec Generator, choose sizes/finishes, and add the personalized result directly to your cart.',
        'payment': 'We support fully secured transactions via Credit/Debit Cards, UPI, Google Pay, and Paytm, fully protected with 256-bit SSL encryption. All transactions are securely routed via Razorpay for ultimate peace of mind.',
        'secure': 'We support fully secured transactions via Credit/Debit Cards, UPI, Google Pay, and Paytm, fully protected with 256-bit SSL encryption. All transactions are securely routed via Razorpay for ultimate peace of mind.',
        'cart': 'To view your selected items, click the shopping bag icon in the header navbar. If you have custom pieces, you will see your generated colors, frames, and sizes loaded dynamically, ready for checkout.'
    };

    function processBotResponse(query) {
        const lower = query.toLowerCase();
        let answer = "";

        if (lower.includes('why') || lower.includes('purpose') || lower.includes('website is for') || lower.includes('reason')) {
            answer = queryTrainer['why'];
        } else if (lower.includes('what is') && (lower.includes('kaya') || lower.includes('this site'))) {
            answer = queryTrainer['what'];
        } else if (lower.includes('harmonizer') || lower.includes('spatial') || lower.includes('room designer') || lower.includes('ai planner')) {
            answer = queryTrainer['spatial'];
        } else if (lower.includes('how to') || lower.includes('order') || lower.includes('buy') || lower.includes('customize')) {
            answer = queryTrainer['order'];
        } else if (lower.includes('pay') || lower.includes('payment') || lower.includes('secure') || lower.includes('razorpay')) {
            answer = queryTrainer['payment'];
        } else if (lower.includes('cart') || lower.includes('checkout') || lower.includes('bag')) {
            answer = queryTrainer['cart'];
        } else {
            answer = `That is an interesting aesthetic perspective. Pairings of warm alabaster tones, organic oak foundations, and custom canvas pieces from KaYa will serve your estate beautifully. <br><br>Would you like to try customizing a custom frame or run coordinates through our **Bespoke Spatial Harmonizer**?`;
        }

        setTimeout(() => {
            appendChatMessage('bot', answer);
        }, 600);
    }

    function sendUserQuery() {
        const input = document.getElementById('kaya-chat-input');
        const text = input.value.trim();
        if (!text) return;
        
        // Append user query
        appendChatMessage('user', text);
        input.value = '';

        // Process chatbot response
        processBotResponse(text);
    }

    // FAQ clicks
    window.sendFaqQuery = function(faqText) {
        appendChatMessage('user', faqText);
        processBotResponse(faqText);
    };
@endif

    // Pull-chain theme switch toggle logic
    window.pullThemeSwitch = function() {
        const container = document.getElementById('theme-pull-chain-container');
        if (!container || container.classList.contains('pulling')) return;

        // Visual click pull animation
        container.classList.add('pulling');

        // Tactile sound synthesis using Web Audio API
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                const ctx = new AudioContext();
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain);
                gain.connect(ctx.destination);
                
                // Light quick click sound
                osc.type = 'sine';
                osc.frequency.setValueAtTime(1000, ctx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.08);
                gain.gain.setValueAtTime(0.05, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
                
                osc.start();
                osc.stop(ctx.currentTime + 0.08);
            }
        } catch (e) {
            // Audio context not allowed or supported
        }

        // Toggle classes on peak pull
        setTimeout(() => {
            const html = document.documentElement;
            const isDark = html.classList.contains('dark');
            
            if (isDark) {
                html.classList.remove('dark');
                html.classList.add('light');
                localStorage.setItem('theme', 'light');
            } else {
                html.classList.remove('light');
                html.classList.add('dark');
                localStorage.setItem('theme', 'dark');
            }

            // Create a physical lightning bulb click room flash overlay
            const flash = document.createElement('div');
            flash.style.position = 'fixed';
            flash.style.inset = '0';
            flash.style.backgroundColor = isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.2)';
            flash.style.zIndex = '999999';
            flash.style.pointerEvents = 'none';
            flash.style.transition = 'opacity 0.25s ease-out';
            document.body.appendChild(flash);
            setTimeout(() => {
                flash.style.opacity = '0';
                setTimeout(() => flash.remove(), 250);
            }, 30);
        }, 120);

        // Snap back spring animation
        setTimeout(() => {
            container.classList.remove('pulling');
            container.classList.add('releasing');
            setTimeout(() => {
                container.classList.remove('releasing');
            }, 350);
        }, 180);
    };
</script>
</body></html>