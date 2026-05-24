@extends('layouts.app')

@section('content')

{{-- ═══ Hero / Workflow Header ════════════════════════════════════════════ --}}
<section class="relative overflow-hidden bg-gradient-to-br from-emerald-950 via-emerald-900 to-stone-900 text-white">
    {{-- Decorative blobs --}}
    <div class="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-emerald-700/20 -translate-y-1/2 translate-x-1/3 blur-3xl pointer-events-none"></div>
    <div class="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-amber-900/20 translate-y-1/2 -translate-x-1/4 blur-3xl pointer-events-none"></div>

    <div class="relative max-w-7xl mx-auto px-6 md:px-12 py-20 md:py-28">
        <div class="flex flex-col lg:flex-row items-start lg:items-center gap-12">

            {{-- Left: Copy --}}
            <div class="flex-1">
                <div class="inline-flex items-center gap-2 px-4 py-1.5 mb-6 rounded-full bg-emerald-400/15 border border-emerald-400/30 text-emerald-300 font-semibold text-xs uppercase tracking-widest">
                    <span class="material-symbols-outlined text-[14px]">design_services</span>
                    Personalisation Studio
                </div>
                <h1 class="font-display-xl text-4xl md:text-5xl lg:text-6xl leading-tight font-bold mb-5 text-white">
                    Design Your<br>
                    <span class="text-emerald-300">Perfect Space</span>
                </h1>
                <p class="text-emerald-100/70 text-base md:text-lg leading-relaxed max-w-lg mb-8">
                    Choose a base piece, then our AI-powered canvas lets you customise every detail — colours, textures, patterns, and more — before it's handcrafted to order.
                </p>

                {{-- 3-step flow --}}
                <div class="flex flex-col sm:flex-row gap-4">
                    <div class="flex items-center gap-3">
                        <div class="w-9 h-9 rounded-full bg-emerald-400/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 font-bold text-sm shrink-0">1</div>
                        <span class="text-emerald-100/80 text-sm font-medium">Pick a product</span>
                    </div>
                    <div class="hidden sm:flex items-center text-emerald-600/60 mx-1">
                        <span class="material-symbols-outlined text-[18px]">arrow_forward</span>
                    </div>
                    <div class="flex items-center gap-3">
                        <div class="w-9 h-9 rounded-full bg-emerald-400/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 font-bold text-sm shrink-0">2</div>
                        <span class="text-emerald-100/80 text-sm font-medium">Customise on canvas</span>
                    </div>
                    <div class="hidden sm:flex items-center text-emerald-600/60 mx-1">
                        <span class="material-symbols-outlined text-[18px]">arrow_forward</span>
                    </div>
                    <div class="flex items-center gap-3">
                        <div class="w-9 h-9 rounded-full bg-emerald-400/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 font-bold text-sm shrink-0">3</div>
                        <span class="text-emerald-100/80 text-sm font-medium">Handcrafted & delivered</span>
                    </div>
                </div>
            </div>

            {{-- Right: Feature chips --}}
            <div class="flex-shrink-0 grid grid-cols-2 gap-3 max-w-xs">
                @foreach([
                    ['auto_awesome',   'AI-Powered Design'],
                    ['palette',        '50+ Colour Palettes'],
                    ['texture',        'Custom Textures'],
                    ['local_shipping', 'Free Delivery'],
                    ['verified',       'Handcrafted Quality'],
                    ['undo',           '30-Day Returns'],
                ] as [$icon, $label])
                <div class="flex items-center gap-2.5 bg-white/5 border border-white/10 rounded-xl px-4 py-3 backdrop-blur-sm">
                    <span class="material-symbols-outlined text-emerald-300 text-[18px]">{{ $icon }}</span>
                    <span class="text-white/80 text-xs font-semibold leading-tight">{{ $label }}</span>
                </div>
                @endforeach
            </div>
        </div>
    </div>
</section>

{{-- ═══ Step 1 — Choose Your Canvas ════════════════════════════════════════ --}}
<section class="py-16 md:py-20 max-w-7xl mx-auto px-6 md:px-12">

    {{-- Section header --}}
    <div class="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
        <div>
            <div class="inline-flex items-center gap-2 px-3 py-1 mb-3 rounded-full bg-amber-500/10 text-amber-800 dark:text-amber-300 text-[11px] font-bold uppercase tracking-widest border border-amber-500/20">
                <span class="material-symbols-outlined text-[12px]">looks_one</span>
                Step 1 of 3
            </div>
            <h2 class="text-3xl md:text-4xl font-bold text-emerald-950 dark:text-white font-display-xl leading-tight">Choose Your Canvas</h2>
            <p class="text-stone-500 dark:text-stone-400 mt-2 max-w-md text-sm leading-relaxed">
                Select any piece below to open the Live Personalisation Canvas and begin crafting your unique design.
            </p>
        </div>

        {{-- Category filter pills --}}
        <div class="flex flex-wrap gap-2">
            <button onclick="filterCat('all')" id="cf-all"
                class="cf-btn active-cf px-4 py-2 rounded-full text-xs font-semibold bg-emerald-950 text-white shadow transition-all">
                All Pieces
            </button>
            @foreach([
                ['Wall Decor',         'cf-wall',    'Wall Décor'],
                ['Lighting',           'cf-light',   'Lighting'],
                ['Soft Furnishings',   'cf-soft',    'Soft Goods'],
                ['Decorative Accents', 'cf-accent',  'Accents'],
                ['Rugs & Mats',        'cf-rugs',    'Rugs'],
            ] as [$val, $id, $label])
            <button onclick="filterCat('{{ $val }}')" id="{{ $id }}"
                class="cf-btn px-4 py-2 rounded-full text-xs font-semibold bg-stone-50 dark:bg-stone-900 text-stone-500 hover:text-emerald-800 border border-stone-200/60 dark:border-stone-800 transition-all">
                {{ $label }}
            </button>
            @endforeach
        </div>
    </div>

    {{-- Product grid --}}
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8" id="customizeGrid">
        @forelse ($products as $product)
            @php
                $cat      = $product->category ?? 'Wall Decor';
                $imgUrl   = $product->image_path
                    ?? 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=700&q=80';

                $catIcons = [
                    'Wall Decor'         => ['icon' => 'imagesmode',   'color' => 'text-violet-600',  'bg' => 'bg-violet-50  border-violet-200/50'],
                    'Lighting'           => ['icon' => 'light_mode',   'color' => 'text-amber-600',   'bg' => 'bg-amber-50   border-amber-200/50'],
                    'Soft Furnishings'   => ['icon' => 'weekend',      'color' => 'text-sky-600',     'bg' => 'bg-sky-50     border-sky-200/50'],
                    'Decorative Accents' => ['icon' => 'potted_plant', 'color' => 'text-emerald-600', 'bg' => 'bg-emerald-50 border-emerald-200/50'],
                    'Rugs & Mats'        => ['icon' => 'crop_square',  'color' => 'text-rose-600',    'bg' => 'bg-rose-50    border-rose-200/50'],
                ];
                $ci = $catIcons[$cat] ?? $catIcons['Wall Decor'];
            @endphp

            <div class="customize-card group flex flex-col bg-white dark:bg-stone-950 rounded-3xl overflow-hidden
                        border border-stone-100 dark:border-stone-800 whisper-shadow
                        transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_30px_60px_-15px_rgba(6,78,59,0.2)]"
                 data-category="{{ $cat }}">

                {{-- Image with overlay --}}
                <div class="relative aspect-[4/3] overflow-hidden bg-stone-100 dark:bg-stone-900 shrink-0">
                    <img class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                         src="{{ $imgUrl }}" alt="{{ $product->name }}" loading="lazy">

                    @if ($product->in_stock)
                        {{-- Dark gradient overlay on hover --}}
                        <div class="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent
                                    opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-5">
                            <span class="text-white text-xs font-semibold flex items-center gap-1.5">
                                <span class="material-symbols-outlined text-[16px]">touch_app</span>
                                Click to personalise
                            </span>
                        </div>
                    @else
                        {{-- Quiet luxury out-of-stock overlay --}}
                        <div class="absolute inset-0 bg-stone-900/40 backdrop-blur-[2px] z-20 flex items-center justify-center transition-all duration-300">
                            <span class="px-4 py-2 border border-white/20 bg-white/10 backdrop-blur-md text-white font-label-sm text-[11px] uppercase tracking-[0.2em] rounded-md shadow-lg">
                                Crafting Soon
                            </span>
                        </div>
                    @endif

                    {{-- Category badge --}}
                    <span class="absolute top-3 left-3 inline-flex items-center gap-1 px-2.5 py-1
                                 bg-white/95 dark:bg-stone-900/95 rounded-full shadow-sm border
                                 text-[9px] font-bold uppercase tracking-wider {{ $ci['bg'] }}">
                        <span class="material-symbols-outlined {{ $ci['color'] }} text-[11px]">{{ $ci['icon'] }}</span>
                        <span class="text-stone-700 dark:text-stone-300">{{ $cat }}</span>
                    </span>

                    {{-- Customisable badge --}}
                    <span class="absolute top-3 right-3 inline-flex items-center gap-1 px-2.5 py-1
                                 bg-emerald-900/90 text-emerald-200 rounded-full text-[9px] font-bold uppercase tracking-wider">
                        <span class="material-symbols-outlined text-[11px]">auto_awesome</span>
                        AI Ready
                    </span>
                </div>

                {{-- Info --}}
                <div class="p-6 flex flex-col flex-1">
                    <div class="flex justify-between items-start gap-2 mb-2">
                        <h3 class="font-bold text-stone-900 dark:text-white text-base leading-snug">{{ $product->name }}</h3>
                        <span class="text-emerald-900 dark:text-emerald-400 font-extrabold text-sm whitespace-nowrap shrink-0">
                            ₹{{ number_format((float) $product->base_price, 0) }}
                        </span>
                    </div>
                    <p class="text-stone-400 text-xs leading-relaxed mb-5 line-clamp-2 flex-1">{{ $product->description }}</p>

                    {{-- Customisation options preview --}}
                    <div class="flex items-center gap-2 mb-5 flex-wrap">
                        @foreach(['Colour', 'Texture', 'Pattern', 'Size'] as $opt)
                        <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10
                                     text-emerald-800 dark:text-emerald-300 text-[9px] font-semibold uppercase tracking-wider">
                            <span class="material-symbols-outlined text-[10px]">check_circle</span>
                            {{ $opt }}
                        </span>
                        @endforeach
                    </div>

                    {{-- CTA --}}
                    @if ($product->in_stock)
                        <a href="{{ route('products.customize', $product) }}"
                           class="w-full py-3.5 rounded-2xl bg-emerald-950 text-white font-bold text-xs
                                  hover:bg-emerald-800 transition-all duration-200
                                  flex justify-center items-center gap-2 shadow-[0_4px_12px_rgba(6,78,59,0.25)]
                                  group-hover:shadow-[0_6px_20px_rgba(6,78,59,0.35)]">
                            <span class="material-symbols-outlined text-[18px]">brush</span>
                            Start Personalising
                        </a>
                    @else
                        <button type="button" disabled
                           class="w-full py-3.5 rounded-2xl bg-stone-100 dark:bg-stone-900/50 text-stone-400 font-bold text-xs
                                  cursor-not-allowed opacity-60 flex justify-center items-center gap-2 border border-stone-200/40">
                            <span class="material-symbols-outlined text-[18px]">block</span>
                            Temporarily Unavailable
                        </button>
                    @endif
                </div>
            </div>
        @empty
            <div class="col-span-full text-center py-20 space-y-4">
                <span class="material-symbols-outlined text-stone-300 text-6xl">design_services</span>
                <h3 class="font-bold text-xl text-stone-800 dark:text-white">No products available</h3>
                <p class="text-stone-400 text-sm">Run <code class="bg-stone-100 dark:bg-stone-800 px-2 py-0.5 rounded text-xs">php artisan db:seed</code> to load products.</p>
            </div>
        @endforelse
    </div>
</section>

{{-- ═══ How It Works ════════════════════════════════════════════════════════ --}}
<section class="bg-stone-50 dark:bg-stone-900/50 border-t border-stone-100 dark:border-stone-800 py-16 md:py-20">
    <div class="max-w-7xl mx-auto px-6 md:px-12">
        <div class="text-center mb-12">
            <h2 class="text-2xl md:text-3xl font-bold text-emerald-950 dark:text-white mb-2">How Personalisation Works</h2>
            <p class="text-stone-500 text-sm">Three simple steps to your one-of-a-kind piece</p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            @foreach([
                ['looks_one',  'Choose a Base Product',      'Browse the canvas above and select any product to open the Live Design Studio.'],
                ['looks_two',  'Customise with AI',          'Use our AI-powered canvas to adjust colours, patterns, textures, and more in real time.'],
                ['looks_3',    'Handcrafted & Delivered',    'Your unique design is handcrafted by our artisans and delivered free within 3–5 business days.'],
            ] as [$icon, $title, $desc])
            <div class="flex flex-col items-center text-center p-8 bg-white dark:bg-stone-950 rounded-3xl border border-stone-100 dark:border-stone-800 whisper-shadow">
                <div class="w-14 h-14 rounded-2xl bg-emerald-950 flex items-center justify-center mb-5">
                    <span class="material-symbols-outlined text-emerald-300 text-[26px]">{{ $icon }}</span>
                </div>
                <h3 class="font-bold text-stone-900 dark:text-white text-base mb-2">{{ $title }}</h3>
                <p class="text-stone-400 text-xs leading-relaxed">{{ $desc }}</p>
            </div>
            @endforeach
        </div>
    </div>
</section>

<script>
    function filterCat(cat) {
        // Update button styles
        document.querySelectorAll('.cf-btn').forEach(btn => {
            btn.className = 'cf-btn px-4 py-2 rounded-full text-xs font-semibold bg-stone-50 dark:bg-stone-900 text-stone-500 hover:text-emerald-800 border border-stone-200/60 dark:border-stone-800 transition-all';
        });
        const ids = {
            'all': 'cf-all', 'Wall Decor': 'cf-wall', 'Lighting': 'cf-light',
            'Soft Furnishings': 'cf-soft', 'Decorative Accents': 'cf-accent', 'Rugs & Mats': 'cf-rugs'
        };
        const activeBtn = document.getElementById(ids[cat] || 'cf-all');
        if (activeBtn) activeBtn.className = 'cf-btn active-cf px-4 py-2 rounded-full text-xs font-semibold bg-emerald-950 text-white shadow transition-all';

        // Filter cards
        document.querySelectorAll('.customize-card').forEach(card => {
            const show = cat === 'all' || card.dataset.category === cat;
            if (show) {
                card.style.display = 'flex';
                setTimeout(() => { card.style.opacity = '1'; card.style.transform = ''; }, 30);
            } else {
                card.style.opacity = '0';
                setTimeout(() => { card.style.display = 'none'; }, 280);
            }
        });
    }
</script>
@endsection
