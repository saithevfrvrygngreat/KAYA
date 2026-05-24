@extends('layouts.app')

@section('content')

<!-- Custom Styles for Slideshow Zoom -->
<style>
    @keyframes kenburns {
        0% {
            transform: scale(1);
        }
        100% {
            transform: scale(1.07);
        }
    }
    .zoom-active {
        animation: kenburns 6000ms forwards ease-in-out;
    }
</style>

<!-- Hero Section -->
<section class="relative h-[720px] flex items-center overflow-hidden">
    <!-- Auto-Flowing Animated Background Slideshow -->
    <div class="absolute inset-0 z-0 overflow-hidden" id="hero-slider">
        <!-- Slide 1 (Active) -->
        <div class="absolute inset-0 opacity-100 transition-opacity duration-1000 ease-in-out transform scale-100" style="background-image: url('https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1600&q=80'); background-size: cover; background-position: center;"></div>
        <!-- Slide 2 -->
        <div class="absolute inset-0 opacity-0 transition-opacity duration-1000 ease-in-out transform scale-100" style="background-image: url('https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1600&q=80'); background-size: cover; background-position: center;"></div>
        <!-- Slide 3 -->
        <div class="absolute inset-0 opacity-0 transition-opacity duration-1000 ease-in-out transform scale-100" style="background-image: url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80'); background-size: cover; background-position: center;"></div>
        <!-- Slide 4 -->
        <div class="absolute inset-0 opacity-0 transition-opacity duration-1000 ease-in-out transform scale-100" style="background-image: url('https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1600&q=80'); background-size: cover; background-position: center;"></div>

        <!-- Sleek Gradients and Ambient Tints -->
        <div class="absolute inset-0 bg-gradient-to-r from-[#fbfbfa]/95 via-[#fbfbfa]/65 to-transparent dark:from-stone-950/95 dark:via-stone-950/65 z-10"></div>
        <div class="absolute inset-0 bg-stone-900/5 z-10"></div>
    </div>

    <div class="relative z-10 max-w-7xl mx-auto px-6 md:px-12 w-full">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <!-- Left Content Column -->
            <div class="lg:col-span-7 space-y-6">
                <span class="inline-block px-4 py-1.5 bg-primary/5 text-primary font-label-sm rounded-full tracking-widest text-[10px] uppercase font-bold">Sensory Architectural Curation</span>
                <h1 class="font-display-xl text-display-xl text-primary leading-[1.05] tracking-tight">Bespoke Spaces.<br>Infinite Harmony.</h1>
                <p class="font-body-lg text-body-lg text-on-surface-variant max-w-xl leading-relaxed">
                    Curation at the frontier of sensory luxury. Program your living space with masterfully tailored canvas collections, high-end materials, and AI-curated lighting.
                </p>
                <div class="flex flex-wrap gap-4 pt-4">
                    <a href="#products" class="bg-primary text-white px-8 py-4 rounded-xl font-bold text-sm shadow-md hover:opacity-90 transition-all flex items-center gap-2 w-max">
                        Start Customizing
                        <span class="material-symbols-outlined text-[18px]">arrow_forward</span>
                    </a>
                    <a href="{{ route('ai.designer') }}" class="border border-stone-300 text-primary px-8 py-4 rounded-xl font-bold text-sm hover:bg-stone-50 transition-all flex items-center gap-2">
                        AI Room Designer
                        <span class="material-symbols-outlined text-[18px]">auto_awesome</span>
                    </a>
                </div>
            </div>

            <!-- Right: Beautiful Interactive Showcase Window / Arch Flipboard -->
            <div class="hidden lg:block lg:col-span-5 relative">
                <!-- Outer floating shadow ring -->
                <div class="absolute -inset-4 bg-gradient-to-tr from-emerald-500/10 to-transparent rounded-[3rem] blur-3xl opacity-60"></div>
                
                <div class="relative max-w-[340px] mx-auto space-y-4">
                    <!-- Elegant Arched Window -->
                    <div class="relative rounded-t-full border border-stone-200/80 bg-white/70 dark:bg-stone-900/70 backdrop-blur-md p-3 shadow-2xl overflow-hidden aspect-[4/5.2]">
                        <div class="relative w-full h-full rounded-t-full overflow-hidden" id="showcase-window">
                            <!-- Showcase Slide 1 (Active) -->
                            <div class="absolute inset-0 opacity-100 transition-all duration-1000 ease-in-out transform scale-100" style="background-image: url('https://images.unsplash.com/photo-1631679706909-1844bbd07221?auto=format&fit=crop&w=600&q=80'); background-size: cover; background-position: center;" data-index="01" data-title="Artisan Ceramic Lamp"></div>
                            <!-- Showcase Slide 2 -->
                            <div class="absolute inset-0 opacity-0 transition-all duration-1000 ease-in-out transform scale-95" style="background-image: url('https://images.unsplash.com/photo-1580136579312-94651dfd596d?auto=format&fit=crop&w=600&q=80'); background-size: cover; background-position: center;" data-index="02" data-title="Custom Abstract Plaster Art"></div>
                            <!-- Showcase Slide 3 -->
                            <div class="absolute inset-0 opacity-0 transition-all duration-1000 ease-in-out transform scale-95" style="background-image: url('https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=600&q=80'); background-size: cover; background-position: center;" data-index="03" data-title="Bespoke Solid Oak Styling Tray"></div>
                        </div>
                    </div>

                    <!-- Floating luxury subtitle badge below the window -->
                    <div class="bg-white/80 dark:bg-stone-950/80 backdrop-blur-md border border-stone-200/50 dark:border-stone-800/80 rounded-2xl px-6 py-4 flex justify-between items-center shadow-lg transform -translate-y-2 hover:scale-[1.02] transition-transform">
                        <div>
                            <p class="text-[9px] uppercase tracking-[0.25em] text-stone-400 font-bold">KaYa Live Curation</p>
                            <h4 class="text-xs font-extrabold text-primary uppercase tracking-wide mt-1" id="showcase-title">Artisan Ceramic Lamp</h4>
                        </div>
                        <span class="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 tracking-widest font-mono" id="showcase-index">NO. 01</span>
                    </div>
                </div>
            </div>
            
        </div>
    </div>
</section>

<!-- Featured Customizable Products with Auto-Flowing Ambient Backdrop -->
<section id="products" class="relative py-section-gap overflow-hidden">
    <!-- Auto-Flowing Animated Background Slideshow for Masterpiece Collection -->
    <div class="absolute inset-0 z-0 overflow-hidden" id="products-bg-slider">
        <!-- Slide 1 (Active) — Luxury living room with artisan decor -->
        <div class="absolute inset-0 opacity-100 transition-opacity duration-[1500ms] ease-in-out" style="background-image: radial-gradient(at 0% 0%, rgba(245,245,240, 0.85) 0, transparent 55%), radial-gradient(at 100% 100%, rgba(197,168,128, 0.12) 0, transparent 55%), url('https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1600&q=80'); background-size: cover; background-position: center; filter: blur(6px) opacity(0.35);"></div>
        <!-- Slide 2 — Bespoke ceramics and warm interior styling -->
        <div class="absolute inset-0 opacity-0 transition-opacity duration-[1500ms] ease-in-out" style="background-image: radial-gradient(at 100% 0%, rgba(240,235,225, 0.85) 0, transparent 55%), radial-gradient(at 0% 100%, rgba(197,168,128, 0.12) 0, transparent 55%), url('https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1600&q=80'); background-size: cover; background-position: center; filter: blur(6px) opacity(0.35);"></div>
        <!-- Slide 3 — Elegant Japandi / minimal bedroom sanctuary -->
        <div class="absolute inset-0 opacity-0 transition-opacity duration-[1500ms] ease-in-out" style="background-image: radial-gradient(at 50% 50%, rgba(250,249,245, 0.9) 0, transparent 100%), url('https://images.unsplash.com/photo-1615529182904-14819c35db37?auto=format&fit=crop&w=1600&q=80'); background-size: cover; background-position: center; filter: blur(6px) opacity(0.35);"></div>
    </div>
    <!-- Clean Gilded Mask Gradient overlay to blend perfectly with Alabaster surfaces -->
    <div class="absolute inset-0 bg-gradient-to-b from-[#fbfbfa] via-[#fbfbfa]/90 to-[#fbfbfa] dark:from-stone-950 dark:via-stone-950/90 dark:to-stone-950 z-10"></div>

    <div class="relative z-20 max-w-7xl mx-auto px-6 md:px-12">
        <div class="flex justify-between items-end mb-16">
            <div>
                <h2 class="font-headline-lg text-headline-lg text-primary mb-4">The Masterpiece Collection</h2>
                <p class="text-on-surface-variant max-w-md font-body-md">Sustainably handcrafted foundations ready for your bespoke configurations. Designed to elevate, engineered to inspire.</p>
            </div>
            <a href="{{ route('products.index') }}" class="hidden md:inline-flex items-center gap-2 text-sm font-semibold text-stone-500 hover:text-emerald-800 transition-colors">
                View All <span class="material-symbols-outlined text-[18px]">arrow_forward</span>
            </a>
        </div>
        
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            @forelse ($products->take(6) as $product)
                <div class="group relative bg-white/80 dark:bg-stone-900/80 backdrop-blur-md rounded-xl overflow-hidden whisper-shadow transition-transform duration-500 hover:-translate-y-2 flex flex-col h-full border border-stone-200/40">
                    <div class="aspect-[4/3] overflow-hidden bg-stone-100 relative shrink-0">
                        @php
                            $productImage = $product->image_path ?? 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=700&q=80';
                            $catLabel = $product->category ?? 'Home Décor';
                        @endphp
                        <span class="absolute top-3 left-3 z-10 px-2.5 py-0.5 bg-white/95 text-stone-700 rounded-full text-[9px] font-bold uppercase tracking-wider shadow-sm">{{ $catLabel }}</span>
                        <img class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" src="{{ $productImage }}" alt="{{ $product->name }}" />
                        
                        @if (!$product->in_stock)
                            <div class="absolute inset-0 bg-stone-900/40 backdrop-blur-[2px] z-20 flex items-center justify-center transition-all duration-300">
                                <span class="px-4 py-2 border border-white/20 bg-white/10 backdrop-blur-md text-white font-label-sm text-[11px] uppercase tracking-[0.2em] rounded-md shadow-lg">
                                    Crafting Soon
                                </span>
                            </div>
                        @endif
                    </div>
                    <div class="p-8 flex flex-col flex-1 justify-between">
                        <div>
                            <div class="flex justify-between items-start mb-2 gap-2">
                                <h3 class="font-headline-md text-[20px] text-primary leading-snug">{{ $product->name }}</h3>
                                <span class="text-on-surface-variant font-body-md shrink-0">INR {{ number_format((float) $product->base_price, 2) }}</span>
                            </div>
                            <p class="text-on-surface-variant font-body-md mb-6 line-clamp-2">{{ $product->description }}</p>
                        </div>
                        <div class="space-y-2 mt-auto">
                            @if ($product->in_stock)
                                <button type="button" onclick="addToCart('{{ $product->id }}', '{{ addslashes($product->name) }}', '{{ $product->base_price }}', 'Signature Collective', '{{ $productImage }}')" class="w-full py-3 rounded-lg border-[1.5px] border-stone-300 dark:border-stone-700 text-stone-600 dark:text-stone-300 font-semibold hover:bg-stone-50 dark:hover:bg-stone-800 hover:text-emerald-800 dark:hover:text-white transition-all flex justify-center items-center gap-2 text-sm">
                                    <span class="material-symbols-outlined text-[18px]">shopping_bag</span>
                                    Add to Cart
                                </button>
                                <a href="{{ route('products.customize', $product) }}" class="w-full py-3 rounded-lg border-[1.5px] border-primary-container dark:border-stone-300 text-primary-container dark:text-stone-200 font-semibold hover:bg-primary-container dark:hover:bg-white hover:text-white dark:hover:text-stone-950 transition-all flex justify-center items-center gap-2 text-sm">
                                    <span class="material-symbols-outlined text-[20px]">auto_fix</span>
                                    Customize
                                </a>
                            @else
                                <button type="button" disabled class="w-full py-3 rounded-lg border-[1.5px] border-stone-300 dark:border-stone-800 text-stone-400 bg-stone-50 dark:bg-stone-900/50 font-semibold cursor-not-allowed flex justify-center items-center gap-2 text-sm opacity-60">
                                    <span class="material-symbols-outlined text-[18px]">block</span>
                                    Out of Stock
                                </button>
                                <button type="button" disabled class="w-full py-3 rounded-lg border-[1.5px] border-stone-300 dark:border-stone-800 text-stone-400 bg-stone-50 dark:bg-stone-900/50 font-semibold cursor-not-allowed flex justify-center items-center gap-2 text-sm opacity-60">
                                    <span class="material-symbols-outlined text-[20px]">auto_fix</span>
                                    Unavailable
                                </button>
                            @endif
                        </div>
                    </div>
                </div>
            @empty
                <div class='col-span-full text-center py-10'>
                    <h3 class='text-xl font-bold mb-2'>No products found</h3>
                    <p>Run database seeding to load sample products.</p>
                </div>
            @endforelse
        </div>

        <div class="mt-16 text-center">
            <a href="{{ route('products.index') }}" class="inline-flex items-center gap-2 px-8 py-4 bg-emerald-950 text-white rounded-full font-semibold hover:bg-emerald-900 transition-colors shadow-lg group">
                View All Collections
                <span class="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">arrow_right_alt</span>
            </a>
        </div>
    </div>
</section>

<!-- ═══════════════════════════════ SHOP BY ROOM ══════════════════════════════ -->
<section class="py-section-gap bg-stone-50 dark:bg-stone-950">
    <div class="max-w-7xl mx-auto px-6 md:px-12">
        <div class="text-center mb-12">
            <span class="inline-block px-3 py-1 mb-3 rounded-full bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 text-[11px] font-bold uppercase tracking-widest">Room by Room</span>
            <h2 class="font-headline-lg text-3xl md:text-4xl text-primary mb-3">Architectural Sanctuary</h2>
            <p class="text-stone-500 max-w-md mx-auto font-body-md">Discover flawless bespoke coordinates tailored to cultivate quiet luxury in every zone of your estate.</p>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            @php
                $rooms = [
                    ['name' => 'Living Room',   'icon' => 'chair',       'count' => '12 Pieces', 'img' => 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=600&q=80',     'color' => 'from-emerald-900/80'],
                    ['name' => 'Bedroom',        'icon' => 'bed',         'count' => '9 Pieces',  'img' => 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=600&q=80',    'color' => 'from-stone-900/80'],
                    ['name' => 'Study & Office', 'icon' => 'laptop_mac',  'count' => '7 Pieces',  'img' => 'https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?auto=format&fit=crop&w=600&q=80',    'color' => 'from-stone-800/80'],
                    ['name' => 'Dining Room',    'icon' => 'restaurant',  'count' => '8 Pieces',  'img' => 'https://images.unsplash.com/photo-1617806118233-18e1db207f62?auto=format&fit=crop&w=600&q=80',    'color' => 'from-amber-900/80'],
                    ['name' => 'Entryway',       'icon' => 'door_front',  'count' => '6 Pieces',  'img' => 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=600&q=80',    'color' => 'from-zinc-900/80'],
                    ['name' => 'Outdoor & Balcony','icon'=>'deck',        'count' => '5 Pieces',  'img' => 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=600&q=80',    'color' => 'from-green-900/80'],
                ];
            @endphp
            @foreach ($rooms as $room)
            <a href="{{ route('products.index') }}?room={{ urlencode($room['name']) }}" class="group relative overflow-hidden rounded-[1.5rem] aspect-[4/3] block">
                <img src="{{ $room['img'] }}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="{{ $room['name'] }}">
                <div class="absolute inset-0 bg-gradient-to-t {{ $room['color'] }} to-transparent"></div>
                <div class="absolute bottom-0 left-0 p-5 flex items-end justify-between w-full">
                    <div>
                        <div class="flex items-center gap-1.5 mb-1">
                            <span class="material-symbols-outlined text-white text-[18px]">{{ $room['icon'] }}</span>
                            <h3 class="text-white font-bold text-sm md:text-base">{{ $room['name'] }}</h3>
                        </div>
                        <span class="text-white/70 text-[10px] font-semibold uppercase tracking-wider">{{ $room['count'] }}</span>
                    </div>
                    <span class="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:bg-white/40 transition-colors">
                        <span class="material-symbols-outlined text-white text-[16px]">arrow_forward</span>
                    </span>
                </div>
            </a>
            @endforeach
        </div>
    </div>
</section>

<!-- ═══════════════════════════════ DECOR STYLES ══════════════════════════════ -->
<section class="py-section-gap max-w-7xl mx-auto px-6 md:px-12">
    <div class="text-center mb-12">
        <span class="inline-block px-3 py-1 mb-3 rounded-full bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 text-[11px] font-bold uppercase tracking-widest">Design Personalities</span>
        <h2 class="font-headline-lg text-3xl md:text-4xl text-primary mb-3">Browse by Decor Style</h2>
        <p class="text-stone-500 max-w-md mx-auto font-body-md">Every home has a personality. Find yours and shop a curated set built around it.</p>
    </div>

    <div class="grid grid-cols-2 md:grid-cols-4 gap-5">
        @php
            $styles = [
                ['name' => 'Minimalist',    'desc' => 'Clean lines · Neutral palette · Intentional',   'img' => 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=500&q=80', 'accent' => 'bg-stone-900'],
                ['name' => 'Bohemian',      'desc' => 'Earthy warmth · Layered textures · Free-spirit', 'img' => 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=500&q=80', 'accent' => 'bg-amber-800'],
                ['name' => 'Japandi',       'desc' => 'Nordic calm · Japanese wabi-sabi · Harmony',    'img' => 'https://images.unsplash.com/photo-1615529182904-14819c35db37?auto=format&fit=crop&w=500&q=80', 'accent' => 'bg-stone-600'],
                ['name' => 'Modern Luxury', 'desc' => 'Gold accents · Bold drama · Statement pieces',  'img' => 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=500&q=80', 'accent' => 'bg-yellow-800'],
            ];
        @endphp
        @foreach ($styles as $style)
        <a href="{{ route('products.index') }}?style={{ urlencode($style['name']) }}" class="group relative overflow-hidden rounded-[1.5rem] block">
            <div class="aspect-[3/4] overflow-hidden">
                <img src="{{ $style['img'] }}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="{{ $style['name'] }}">
                <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent"></div>
            </div>
            <div class="absolute bottom-0 left-0 right-0 p-5">
                <span class="inline-block w-3 h-3 rounded-full {{ $style['accent'] }} mb-2"></span>
                <h3 class="text-white font-bold text-base mb-0.5">{{ $style['name'] }}</h3>
                <p class="text-white/70 text-[10px] leading-relaxed">{{ $style['desc'] }}</p>
                <span class="inline-flex items-center gap-1 mt-2 text-white/80 text-[10px] font-semibold group-hover:gap-2 transition-all">
                    Shop Style <span class="material-symbols-outlined text-[12px]">arrow_forward</span>
                </span>
            </div>
        </a>
        @endforeach
    </div>
</section>

<!-- ═══════════════════════════════ HOW IT WORKS ══════════════════════════════ -->
<section class="py-section-gap bg-emerald-950 overflow-hidden">
    <div class="max-w-7xl mx-auto px-6 md:px-12 text-center">
        <span class="inline-block px-3 py-1 mb-4 rounded-full bg-white/10 text-emerald-300 text-[11px] font-bold uppercase tracking-widest">The Process</span>
        <h2 class="font-headline-lg text-3xl md:text-4xl text-white mb-3">Transform Your Home in 3 Steps</h2>
        <p class="text-white/60 max-w-md mx-auto mb-14 font-body-md">From inspiration to delivery — personalise any piece and see it in your room before you buy.</p>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            @php
                $steps = [
                    ['num' => '01', 'icon' => 'auto_awesome',  'title' => 'Take the Style Quiz',        'desc' => 'Answer 3 quick questions about your style, room, and colour mood. Our AI builds your unique decor profile.'],
                    ['num' => '02', 'icon' => 'brush',         'title' => 'Personalise Your Piece',     'desc' => 'Choose any product and customise colours, text, patterns, and materials. See changes live in the Room Visualizer.'],
                    ['num' => '03', 'icon' => 'local_shipping', 'title' => 'Delivered to Your Door',    'desc' => 'Place your order and our artisans handcraft your bespoke piece. Free delivery in 3-5 business days.'],
                ];
            @endphp
            @foreach ($steps as $i => $step)
            <div class="relative flex flex-col items-center text-center p-8 bg-white/5 rounded-3xl border border-white/10 hover:bg-white/10 transition-colors">
                <div class="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white text-[11px] font-black">{{ $step['num'] }}</div>
                <div class="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-5 mt-3">
                    <span class="material-symbols-outlined text-white text-[32px]">{{ $step['icon'] }}</span>
                </div>
                <h3 class="text-white font-bold text-lg mb-3">{{ $step['title'] }}</h3>
                <p class="text-white/60 text-sm leading-relaxed">{{ $step['desc'] }}</p>
            </div>
            @endforeach
        </div>

        <div class="mt-12 flex flex-wrap justify-center gap-4">
            <a href="{{ route('products.index') }}" class="border border-white/30 text-white px-8 py-4 rounded-xl font-bold hover:bg-white/10 transition-all flex items-center gap-2">
                Browse All Products
                <span class="material-symbols-outlined">explore</span>
            </a>
        </div>
    </div>
</section>

<!-- Innovation Highlights -->
<section class="py-section-gap bg-surface-container-low overflow-hidden">
    <div class="max-w-7xl mx-auto px-6 md:px-12">
        <div class="text-center mb-20">
            <h2 class="font-headline-lg text-headline-lg text-primary mb-4">The Future of Living</h2>
            <p class="text-on-surface-variant max-w-xl mx-auto font-body-lg">Technology that doesn't just display products, but imagines them in the context of your life.</p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div class="space-y-12">
                <div class="p-8 bg-white/50 backdrop-blur-sm rounded-2xl border border-white/40 whisper-shadow transition-all hover:bg-white/80">
                    <div class="w-14 h-14 bg-primary-fixed rounded-xl flex items-center justify-center text-primary mb-6">
                        <span class="material-symbols-outlined text-[32px]">view_in_ar</span>
                    </div>
                    <h3 class="font-headline-md text-primary mb-3">AR Live Preview</h3>
                    <p class="text-on-surface-variant font-body-md mb-6">Eliminate the guesswork. Using advanced spatial computing, visualize your customized pieces in your exact room layout with millimeter precision.</p>
                    <a class="inline-flex items-center gap-2 font-semibold text-primary hover:gap-4 transition-all" href="{{ route('products.index') }}">
                        Explore Collection
                        <span class="material-symbols-outlined">arrow_forward</span>
                    </a>
                </div>
                <div class="p-8 bg-white/50 backdrop-blur-sm rounded-2xl border border-white/40 whisper-shadow transition-all hover:bg-white/80">
                    <div class="w-14 h-14 bg-tertiary-fixed rounded-xl flex items-center justify-center text-tertiary mb-6">
                        <span class="material-symbols-outlined text-[32px]">auto_awesome</span>
                    </div>
                    <h3 class="font-headline-md text-primary mb-3">AI-Powered Curation</h3>
                    <p class="text-on-surface-variant font-body-md mb-6">Our neural design engine analyzes your aesthetic preferences and uploaded room photos to suggest the perfect balance of color, light, and form.</p>
                    <a class="inline-flex items-center gap-2 font-semibold text-primary hover:gap-4 transition-all" href="{{ route('ai.designer') }}">
                        Try AI Designer
                        <span class="material-symbols-outlined">arrow_forward</span>
                    </a>
                </div>
            </div>
            <div class="relative">
                <div class="relative z-10 rounded-[2rem] overflow-hidden shadow-2xl">
                    <img class="w-full aspect-square object-cover" data-alt="A smartphone screen displaying a sophisticated augmented reality application. The phone is held in front of an empty modern living room corner, where a digital 3D model of a luxury emerald chair appears perfectly placed and scaled. The lighting of the digital object matches the natural light of the room, creating a seamless and high-tech visualization experience." src="https://lh3.googleusercontent.com/aida-public/AB6AXuAdUWI5KJ4KF4r6Hvs9_iUM7iFdl7iMoOfp7AwEp2r2LU0obDfyabTUKGvDHzvoX95wtyzi860C63rwiSLaYx6e1l7aATmWRsWVipkroMswczukYslOSfNmaOdMOm-jNJTyWoG6l82m8LPFN8B_UMt58DqcLix8NsCgMnVxai0Ymw2ZII2Dw2D1ITAjXcMwDG9Qgl0z_GJlEzeQ25EcemISYglhsatl2Ss7RUj1yoQDGE-xeBiaELq4Cij7REQ0UJ5yC7L5FsThUHdf"/>
                    <!-- AR Overlay UI Mockup -->
                    <div class="absolute inset-x-6 bottom-6 glass-panel rounded-2xl p-6 border border-white/30">
                        <div class="flex items-center gap-4 mb-4">
                            <div class="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white">
                                <span class="material-symbols-outlined text-[20px]">view_in_ar</span>
                            </div>
                            <div>
                                <p class="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant">AR Mode Active</p>
                                <p class="text-sm font-semibold text-primary">Placing: Bespoke Velvet Armchair</p>
                            </div>
                        </div>
                        <div class="flex gap-2">
                            <div class="h-1 bg-primary w-full rounded-full"></div>
                            <div class="h-1 bg-stone-300 w-full rounded-full"></div>
                            <div class="h-1 bg-stone-300 w-full rounded-full"></div>
                        </div>
                    </div>
                </div>
                <!-- Floating Decorative Elements -->
                <div class="absolute -top-10 -right-10 w-40 h-40 bg-primary-fixed/30 blur-3xl -z-10"></div>
                <div class="absolute -bottom-10 -left-10 w-40 h-40 bg-tertiary-fixed/30 blur-3xl -z-10"></div>
            </div>
        </div>
    </div>
</section>

<!-- Personalization Prompt CTA -->
<section class="py-section-gap">
    <div class="max-w-7xl mx-auto px-6 md:px-12">
        <div class="bg-primary p-12 md:p-20 rounded-[2.5rem] relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-10">
            <div class="absolute top-0 right-0 w-1/2 h-full opacity-20 pointer-events-none">
                <div class="absolute inset-0 bg-gradient-to-l from-emerald-400/30 to-transparent"></div>
            </div>
            <div class="relative z-10 max-w-xl text-center md:text-left">
                <h2 class="font-headline-lg text-headline-lg text-white mb-6">Ready to reveal your space's potential?</h2>
                <p class="text-white/80 font-body-lg mb-8">Take our 3-minute aesthetic discovery quiz to unlock personalized collections tailored to your lifestyle.</p>
                <button onclick="openAestheticQuiz()" class="bg-white text-primary px-10 py-5 rounded-[10px] font-semibold text-body-md shadow-xl hover:scale-105 transition-all">
                    Take Aesthetic Discovery Quiz
                </button>
            </div>
            <div class="relative z-10 grid grid-cols-2 gap-4">
                <div class="w-32 h-32 md:w-40 md:h-40 rounded-2xl overflow-hidden bg-stone-200 rotate-3">
                    <img class="w-full h-full object-cover" data-alt="A close-up shot of luxurious textured fabrics in shades of emerald, forest green, and gold. Soft natural lighting captures the fine details of the weave and the high-end quality of the materials, emphasizing a sense of tactile luxury and comfort." src="https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=300&q=80"/>
                </div>
                <div class="w-32 h-32 md:w-40 md:h-40 rounded-2xl overflow-hidden bg-stone-200 -rotate-6 translate-y-8">
                    <img class="w-full h-full object-cover" data-alt="A minimalist white ceramic vase containing a single eucalyptus branch, set against a warm champagne-colored backdrop. The clean composition and soft lighting create a peaceful and sophisticated mood, consistent with the brand's 'Art of Living Well' philosophy." src="https://images.unsplash.com/photo-1615876234886-fd9a39fda97f?auto=format&fit=crop&w=300&q=80"/>
                </div>
            </div>
        </div>
    </div>
</section>

<!-- 3-Step Aesthetic Discovery Quiz Modal -->
<div id="quizModal" class="fixed inset-0 z-50 hidden flex items-center justify-center p-4 bg-black/60 backdrop-blur-md transition-opacity duration-300 opacity-0">
    <div class="relative w-full max-w-2xl bg-white dark:bg-stone-950 rounded-[2rem] border border-stone-200 dark:border-stone-900 shadow-2xl overflow-hidden p-8 md:p-12 transition-all transform scale-95 duration-300" id="quizCard">
        <button onclick="closeAestheticQuiz()" class="absolute top-6 right-6 p-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-900 text-stone-400 hover:text-stone-700 transition-colors">
            <span class="material-symbols-outlined text-[20px]">close</span>
        </button>
        <div id="quizContent">

            <!-- Step 1: Style -->
            <div id="quizStep1" class="quiz-step space-y-6">
                <div>
                    <span class="inline-block px-3 py-1 mb-2 rounded-full bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold uppercase tracking-widest">Question 1 of 3</span>
                    <h3 class="text-2xl md:text-3xl font-extrabold text-primary">What's your interior style?</h3>
                    <p class="text-xs text-stone-400">Choose the aesthetic that resonates with your living philosophy.</p>
                </div>
                <div class="grid grid-cols-2 gap-3">
                    <button onclick="selectStyle('minimalist','Minimal Serenity','#1c1917','black')" class="group relative overflow-hidden rounded-2xl border-2 border-stone-200 hover:border-emerald-600 transition-all text-left">
                        <img src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=400&q=80" class="w-full h-28 object-cover group-hover:scale-105 transition-transform duration-500">
                        <div class="p-3"><h4 class="font-bold text-primary text-sm">Minimalist</h4><p class="text-[10px] text-stone-400">Clean lines, silent spaces</p></div>
                    </button>
                    <button onclick="selectStyle('bohemian','Bohemian Spirit','#78350f','oak')" class="group relative overflow-hidden rounded-2xl border-2 border-stone-200 hover:border-emerald-600 transition-all text-left">
                        <img src="https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=400&q=80" class="w-full h-28 object-cover group-hover:scale-105 transition-transform duration-500">
                        <div class="p-3"><h4 class="font-bold text-primary text-sm">Bohemian</h4><p class="text-[10px] text-stone-400">Warm, earthy & layered</p></div>
                    </button>
                    <button onclick="selectStyle('japandi','Japandi Zen','#a8a29e','none')" class="group relative overflow-hidden rounded-2xl border-2 border-stone-200 hover:border-emerald-600 transition-all text-left">
                        <img src="https://images.unsplash.com/photo-1615529182904-14819c35db37?auto=format&fit=crop&w=400&q=80" class="w-full h-28 object-cover group-hover:scale-105 transition-transform duration-500">
                        <div class="p-3"><h4 class="font-bold text-primary text-sm">Japandi</h4><p class="text-[10px] text-stone-400">Nordic-Japanese harmony</p></div>
                    </button>
                    <button onclick="selectStyle('luxe','Modern Luxury','#d4af37','gold')" class="group relative overflow-hidden rounded-2xl border-2 border-stone-200 hover:border-emerald-600 transition-all text-left">
                        <img src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=400&q=80" class="w-full h-28 object-cover group-hover:scale-105 transition-transform duration-500 brightness-75">
                        <div class="p-3"><h4 class="font-bold text-primary text-sm">Modern Luxury</h4><p class="text-[10px] text-stone-400">Gold, drama & bespoke</p></div>
                    </button>
                </div>
            </div>

            <!-- Step 2: Room -->
            <div id="quizStep2" class="quiz-step hidden space-y-6">
                <div>
                    <span class="inline-block px-3 py-1 mb-2 rounded-full bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold uppercase tracking-widest">Question 2 of 3</span>
                    <h3 class="text-2xl md:text-3xl font-extrabold text-primary">Your primary room?</h3>
                    <p class="text-xs text-stone-400">Where will this curated piece hang?</p>
                </div>
                <div class="grid grid-cols-2 gap-3">
                    <button onclick="selectRoom('living')" class="text-left p-4 rounded-2xl border border-stone-200 hover:border-emerald-600 hover:bg-emerald-50 transition-all flex items-center gap-3">
                        <span class="material-symbols-outlined text-emerald-800 text-2xl">chair</span>
                        <div><h4 class="font-bold text-primary text-sm">Living Room</h4><p class="text-[10px] text-stone-400">Above sofas & fireplaces</p></div>
                    </button>
                    <button onclick="selectRoom('bedroom')" class="text-left p-4 rounded-2xl border border-stone-200 hover:border-emerald-600 hover:bg-emerald-50 transition-all flex items-center gap-3">
                        <span class="material-symbols-outlined text-emerald-800 text-2xl">bed</span>
                        <div><h4 class="font-bold text-primary text-sm">Bedroom</h4><p class="text-[10px] text-stone-400">Sanctuary wall art</p></div>
                    </button>
                    <button onclick="selectRoom('office')" class="text-left p-4 rounded-2xl border border-stone-200 hover:border-emerald-600 hover:bg-emerald-50 transition-all flex items-center gap-3">
                        <span class="material-symbols-outlined text-emerald-800 text-2xl">laptop_mac</span>
                        <div><h4 class="font-bold text-primary text-sm">Study / Office</h4><p class="text-[10px] text-stone-400">Creative inspiration</p></div>
                    </button>
                    <button onclick="selectRoom('dining')" class="text-left p-4 rounded-2xl border border-stone-200 hover:border-emerald-600 hover:bg-emerald-50 transition-all flex items-center gap-3">
                        <span class="material-symbols-outlined text-emerald-800 text-2xl">restaurant</span>
                        <div><h4 class="font-bold text-primary text-sm">Dining Room</h4><p class="text-[10px] text-stone-400">Elegant gathering space</p></div>
                    </button>
                </div>
            </div>

            <!-- Step 3: Color Mood -->
            <div id="quizStep3" class="quiz-step hidden space-y-6">
                <div>
                    <span class="inline-block px-3 py-1 mb-2 rounded-full bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold uppercase tracking-widest">Question 3 of 3</span>
                    <h3 class="text-2xl md:text-3xl font-extrabold text-primary">Color mood?</h3>
                    <p class="text-xs text-stone-400">Select the palette that best describes your emotional energy.</p>
                </div>
                <div class="grid grid-cols-2 gap-3">
                    <button onclick="selectColor('#78350f','Earth Tones')" class="text-left p-4 rounded-2xl border border-stone-200 hover:border-emerald-600 transition-all flex items-center gap-4">
                        <div class="flex gap-1"><span class="w-6 h-6 rounded-full bg-[#78350f]"></span><span class="w-6 h-6 rounded-full bg-[#a16207]"></span><span class="w-6 h-6 rounded-full bg-[#d97706]"></span></div>
                        <div><h4 class="font-bold text-primary text-sm">Earth Tones</h4><p class="text-[10px] text-stone-400">Amber, ochre & terracotta</p></div>
                    </button>
                    <button onclick="selectColor('#1c1917','Monochrome')" class="text-left p-4 rounded-2xl border border-stone-200 hover:border-emerald-600 transition-all flex items-center gap-4">
                        <div class="flex gap-1"><span class="w-6 h-6 rounded-full bg-[#1c1917]"></span><span class="w-6 h-6 rounded-full bg-[#78716c]"></span><span class="w-6 h-6 rounded-full bg-[#e7e5e4]"></span></div>
                        <div><h4 class="font-bold text-primary text-sm">Monochrome</h4><p class="text-[10px] text-stone-400">Timeless black & white</p></div>
                    </button>
                    <button onclick="selectColor('#7c3aed','Bold & Vibrant')" class="text-left p-4 rounded-2xl border border-stone-200 hover:border-emerald-600 transition-all flex items-center gap-4">
                        <div class="flex gap-1"><span class="w-6 h-6 rounded-full bg-[#7c3aed]"></span><span class="w-6 h-6 rounded-full bg-[#0ea5e9]"></span><span class="w-6 h-6 rounded-full bg-[#f43f5e]"></span></div>
                        <div><h4 class="font-bold text-primary text-sm">Bold & Vibrant</h4><p class="text-[10px] text-stone-400">Electric & expressive</p></div>
                    </button>
                    <button onclick="selectColor('#fef3c7','Pastels')" class="text-left p-4 rounded-2xl border border-stone-200 hover:border-emerald-600 transition-all flex items-center gap-4">
                        <div class="flex gap-1"><span class="w-6 h-6 rounded-full bg-[#fef3c7]"></span><span class="w-6 h-6 rounded-full bg-[#fbcfe8]"></span><span class="w-6 h-6 rounded-full bg-[#a7f3d0]"></span></div>
                        <div><h4 class="font-bold text-primary text-sm">Pastels</h4><p class="text-[10px] text-stone-400">Soft, dreamy & airy</p></div>
                    </button>
                </div>
            </div>

            <!-- Step 4: Spinner -->
            <div id="quizStep4" class="quiz-step hidden text-center py-10 space-y-6">
                <div class="relative w-24 h-24 mx-auto flex items-center justify-center bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 rounded-full">
                    <span class="material-symbols-outlined text-[42px] animate-spin">schema</span>
                    <div class="absolute inset-0 border-[3px] border-emerald-500/30 rounded-full scale-110 animate-ping opacity-25"></div>
                </div>
                <div class="space-y-2">
                    <h4 class="text-xl font-bold text-primary">Running KaYa Curation AI...</h4>
                    <p class="text-xs text-stone-400">Matching your aesthetic profile to our collection...</p>
                </div>
                <div class="w-full bg-stone-200 dark:bg-stone-800 h-2 rounded-full overflow-hidden max-w-xs mx-auto">
                    <div class="bg-emerald-950 h-full transition-all duration-100" id="quizBarWidth" style="width: 0%;"></div>
                </div>
                <div class="text-xs font-bold text-emerald-950 dark:text-emerald-400" id="quizProgressNum">0% ANALYZED</div>
            </div>

            <!-- Step 5: Results -->
            <div id="quizStep5" class="quiz-step hidden space-y-6">
                <div class="text-center space-y-2">
                    <span class="inline-block px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold uppercase tracking-widest">Your KaYa Profile</span>
                    <h3 class="text-2xl md:text-3xl font-extrabold text-primary" id="resAuraProfile">Modern Emerald Sanctuary</h3>
                    <p class="text-xs text-stone-400">Based on your selections, here's your perfect curation:</p>
                </div>
                <div class="bg-stone-50 dark:bg-stone-900 rounded-2xl p-5 border border-stone-100 dark:border-stone-800">
                    <div class="flex flex-col sm:flex-row items-center gap-5 bg-white dark:bg-stone-950 p-4 rounded-xl border border-stone-100 dark:border-stone-900 whisper-shadow">
                        <img class="w-20 h-20 rounded-xl object-cover" id="resProductImg" src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=200&q=80">
                        <div class="flex-1 text-center sm:text-left">
                            <h5 class="font-bold text-primary" id="resProductName">Premium Visualizer Frame</h5>
                            <p class="text-xs text-stone-400 mt-1" id="resProductDesc">Bespoke customized sizing.</p>
                        </div>
                        <a href="#" id="resProductLink" class="bg-emerald-950 text-white px-5 py-3 rounded-xl text-xs font-bold hover:opacity-90 flex items-center gap-1.5 whitespace-nowrap">
                            Customize
                            <span class="material-symbols-outlined text-[16px]">arrow_forward</span>
                        </a>
                    </div>
                </div>
                <div class="flex justify-center">
                    <button onclick="retakeQuiz()" class="text-xs text-stone-400 hover:text-emerald-800 underline font-semibold">Retake Discovery Quiz</button>
                </div>
            </div>
        </div>
    </div>
</div>
</div>

<script>
    const dynamicProducts = @json($products->map(fn($p) => ['id' => $p->id, 'name' => $p->name, 'description' => $p->description]));

    let quizStyle = 'minimalist', quizStyleColor = '#1c1917', quizStyleFrame = 'black';
    let quizRoom  = 'living';
    let quizColor = '#064e3b', quizProfileName = 'Modern Sanctuary';

    function openAestheticQuiz() {
        const modal = document.getElementById('quizModal');
        const card  = document.getElementById('quizCard');
        modal.classList.remove('hidden');
        setTimeout(() => { modal.classList.remove('opacity-0'); card.classList.remove('scale-95'); }, 50);
        document.querySelectorAll('.quiz-step').forEach(s => s.classList.add('hidden'));
        document.getElementById('quizStep1').classList.remove('hidden');
    }

    function closeAestheticQuiz() {
        const modal = document.getElementById('quizModal');
        const card  = document.getElementById('quizCard');
        modal.classList.add('opacity-0'); card.classList.add('scale-95');
        setTimeout(() => modal.classList.add('hidden'), 300);
    }

    function selectStyle(style, name, color, frame) {
        quizStyle = style; quizStyleColor = color; quizStyleFrame = frame;
        quizProfileName = name;
        document.getElementById('quizStep1').classList.add('hidden');
        document.getElementById('quizStep2').classList.remove('hidden');
    }

    function selectRoom(room) {
        quizRoom = room;
        document.getElementById('quizStep2').classList.add('hidden');
        document.getElementById('quizStep3').classList.remove('hidden');
    }

    function selectColor(color, mood) {
        quizColor = color;
        quizProfileName = mood + ' × ' + quizProfileName;
        document.getElementById('quizStep3').classList.add('hidden');
        document.getElementById('quizStep4').classList.remove('hidden');
        // Progress animation
        const bar = document.getElementById('quizBarWidth');
        const txt = document.getElementById('quizProgressNum');
        let p = 0;
        const iv = setInterval(() => {
            p += 4; bar.style.width = p + '%'; txt.textContent = p + '% ANALYZED';
            if (p >= 100) { clearInterval(iv); setTimeout(revealCurationResults, 400); }
        }, 80);
    }

    function revealCurationResults() {
        document.getElementById('quizStep4').classList.add('hidden');
        document.getElementById('quizStep5').classList.remove('hidden');
        document.getElementById('resAuraProfile').textContent = quizProfileName;

        // Pick product based on style
        const styleIndex = { minimalist: 0, bohemian: 1, japandi: 2, luxe: 0 };
        const idx = styleIndex[quizStyle] || 0;
        const product = dynamicProducts[idx] || dynamicProducts[0] || { id: 1, name: 'Bespoke Wall Frame', description: 'Premium handcrafted mounting.' };

        document.getElementById('resProductName').textContent = product.name;
        document.getElementById('resProductDesc').textContent = product.description;

        const roomImgs = {
            living: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=200&q=80',
            bedroom: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=200&q=80',
            office:  'https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?auto=format&fit=crop&w=200&q=80',
            dining:  'https://images.unsplash.com/photo-1617806118233-18e1db207f62?auto=format&fit=crop&w=200&q=80'
        };
        document.getElementById('resProductImg').src = roomImgs[quizRoom] || roomImgs.living;
        document.getElementById('resProductLink').href = `/products/${product.id}/customize?color=${encodeURIComponent(quizStyleColor)}&frame_style=${quizStyleFrame}`;

        // Save to localStorage
        localStorage.setItem('aura_quiz', JSON.stringify({ style: quizStyle, room: quizRoom, color: quizColor, profile: quizProfileName }));
    }

    function retakeQuiz() {
        document.querySelectorAll('.quiz-step').forEach(s => s.classList.add('hidden'));
        document.getElementById('quizStep1').classList.remove('hidden');
        document.getElementById('quizBarWidth').style.width = '0%';
        document.getElementById('quizProgressNum').textContent = '0% ANALYZED';
    }

    window.addEventListener('DOMContentLoaded', () => {
        if (new URLSearchParams(window.location.search).get('trigger_quiz') === 'true') openAestheticQuiz();

        // Hero Background Slideshow Controller (Flip-Flops and Flows Automatically)
        const slides = document.querySelectorAll('#hero-slider > div[style*="background-image"]');
        if (slides.length > 0) {
            let currentSlide = 0;
            slides[currentSlide].classList.add('zoom-active');

            setInterval(() => {
                // Remove active states from the current slide
                slides[currentSlide].classList.remove('opacity-100', 'zoom-active');
                slides[currentSlide].classList.add('opacity-0');

                // Advance to the next slide in sequence
                currentSlide = (currentSlide + 1) % slides.length;

                // Make the next slide active and trigger smooth Zoom animation
                slides[currentSlide].classList.remove('opacity-0');
                slides[currentSlide].classList.add('opacity-100', 'zoom-active');
            }, 5000);
        }

        // KaYa Live Curation Window Flipboard Controller
        const showcaseSlides = document.querySelectorAll('#showcase-window > div');
        const showcaseTitle = document.getElementById('showcase-title');
        const showcaseIndex = document.getElementById('showcase-index');
        
        if (showcaseSlides.length > 0) {
            let currentShowcase = 0;
            setInterval(() => {
                // Hide current slide
                showcaseSlides[currentShowcase].classList.remove('opacity-100', 'scale-100');
                showcaseSlides[currentShowcase].classList.add('opacity-0', 'scale-95');
                
                // Next
                currentShowcase = (currentShowcase + 1) % showcaseSlides.length;
                
                // Show next
                showcaseSlides[currentShowcase].classList.remove('opacity-0', 'scale-95');
                showcaseSlides[currentShowcase].classList.add('opacity-100', 'scale-100');
                
                // Update text meta
                const title = showcaseSlides[currentShowcase].getAttribute('data-title');
                const idx = showcaseSlides[currentShowcase].getAttribute('data-index');
                if (showcaseTitle) showcaseTitle.textContent = title;
                if (showcaseIndex) showcaseIndex.textContent = `NO. ${idx}`;
            }, 4000);
        }

        // Masterpiece Collection Background Slideshow Controller (Flip-Flops and Flows Automatically)
        const productsSlides = document.querySelectorAll('#products-bg-slider > div');
        if (productsSlides.length > 0) {
            let currentProdSlide = 0;
            setInterval(() => {
                // Hide current slide
                productsSlides[currentProdSlide].classList.remove('opacity-100');
                productsSlides[currentProdSlide].classList.add('opacity-0');
                
                // Next
                currentProdSlide = (currentProdSlide + 1) % productsSlides.length;
                
                // Show next
                productsSlides[currentProdSlide].classList.remove('opacity-0');
                productsSlides[currentProdSlide].classList.add('opacity-100');
            }, 7000);
        }
    });
</script>

@endsection
