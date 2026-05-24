@extends('layouts.app')

@section('content')
<div class="max-w-7xl mx-auto px-6 md:px-12 py-12">
    <!-- Catalog Header -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
        <div>
            <span class="inline-block px-3 py-1 mb-3 rounded-full bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 font-label-sm uppercase tracking-widest text-[11px] font-bold">Luxury Showroom</span>
            <h1 class="font-display-xl text-4xl md:text-5xl text-primary leading-tight">The Decor Collection</h1>
            <p class="font-body-md text-stone-500 max-w-md leading-relaxed mt-2">
                Curated home décor pieces designed for personal expression — from wall art to rugs, lighting to soft furnishings.
            </p>
        </div>

        <!-- Filter Categories -->
        <div class="flex flex-wrap gap-2">
            <button onclick="filterCategory('all')" id="btn-cat-all" class="cat-btn px-5 py-2.5 rounded-full text-xs font-semibold bg-emerald-950 text-white shadow-md transition-all">All Décor</button>
            <button onclick="filterCategory('Wall Decor')" id="btn-cat-wall" class="cat-btn px-5 py-2.5 rounded-full text-xs font-semibold bg-stone-50 dark:bg-stone-900 text-stone-500 hover:text-emerald-800 border border-stone-200/60 dark:border-stone-800 transition-all">Wall Décor</button>
            <button onclick="filterCategory('Lighting')" id="btn-cat-lighting" class="cat-btn px-5 py-2.5 rounded-full text-xs font-semibold bg-stone-50 dark:bg-stone-900 text-stone-500 hover:text-emerald-800 border border-stone-200/60 dark:border-stone-800 transition-all">Lighting</button>
            <button onclick="filterCategory('Soft Furnishings')" id="btn-cat-soft" class="cat-btn px-5 py-2.5 rounded-full text-xs font-semibold bg-stone-50 dark:bg-stone-900 text-stone-500 hover:text-emerald-800 border border-stone-200/60 dark:border-stone-800 transition-all">Soft Furnishings</button>
            <button onclick="filterCategory('Decorative Accents')" id="btn-cat-accents" class="cat-btn px-5 py-2.5 rounded-full text-xs font-semibold bg-stone-50 dark:bg-stone-900 text-stone-500 hover:text-emerald-800 border border-stone-200/60 dark:border-stone-800 transition-all">Accents</button>
            <button onclick="filterCategory('Rugs & Mats')" id="btn-cat-rugs" class="cat-btn px-5 py-2.5 rounded-full text-xs font-semibold bg-stone-50 dark:bg-stone-900 text-stone-500 hover:text-emerald-800 border border-stone-200/60 dark:border-stone-800 transition-all">Rugs & Mats</button>
        </div>
    </div>

    @if(!empty($activeRoom) || !empty($activeStyle))
    <div class="mb-8 flex items-center gap-3 px-5 py-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
        <span class="material-symbols-outlined text-emerald-700 text-[20px]">filter_list</span>
        <span class="text-sm font-semibold text-emerald-800">
            @if(!empty($activeRoom)) Showing collection for: <strong>{{ $activeRoom }}</strong>
            @elseif(!empty($activeStyle)) Curated for style: <strong>{{ $activeStyle }}</strong>
            @endif
        </span>
        <a href="{{ route('products.index') }}" class="ml-auto text-xs font-bold text-stone-400 hover:text-rose-500 transition-colors flex items-center gap-1">
            <span class="material-symbols-outlined text-[14px]">close</span> Clear Filter
        </a>
    </div>
    @endif

    <!-- Product Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8" id="catalogGrid">
        @forelse ($products as $product)
            @php
                $cat = $product->category ?? 'Wall Decor';
                $imageUrl = $product->image_path ?? 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=700&q=80';

                // Category display metadata
                $catMeta = [
                    'Wall Decor'          => ['badge' => 'Wall Décor',       'icon' => 'imagesmode',   'material' => 'Premium Canvas / Solid Timber'],
                    'Lighting'            => ['badge' => 'Lighting',           'icon' => 'light_mode',   'material' => 'Ceramic / Rattan / Brass'],
                    'Soft Furnishings'    => ['badge' => 'Soft Furnishings',   'icon' => 'weekend',      'material' => 'Organic Linen / Belgian Flax'],
                    'Decorative Accents'  => ['badge' => 'Decorative Accents', 'icon' => 'potted_plant', 'material' => 'Hand-thrown Stoneware / Soy Wax'],
                    'Rugs & Mats'         => ['badge' => 'Rugs & Mats',        'icon' => 'crop_square',  'material' => 'Hand-braided Jute / Cotton Dhurrie'],
                ];
                $meta     = $catMeta[$cat] ?? $catMeta['Wall Decor'];
                $badge    = $meta['badge'];
                $icon     = $meta['icon'];
                $material = $meta['material'];
            @endphp

            <div class="product-card group relative bg-white dark:bg-stone-950 rounded-[2rem] overflow-hidden whisper-shadow border border-stone-100 dark:border-stone-900 transition-all duration-500 hover:-translate-y-2 flex flex-col h-full"
                 data-category="{{ $cat }}">

                <!-- Thumbnail - aspect-[4/3] keeps images proportionate without cropping -->
                <div class="aspect-[4/3] overflow-hidden bg-stone-100 dark:bg-stone-900 relative shrink-0">
                    <span class="absolute top-4 left-4 z-10 px-3 py-1 bg-white/95 dark:bg-stone-900/95 text-stone-900 dark:text-white rounded-full font-label-sm text-[9px] uppercase tracking-wider font-bold shadow-md flex items-center gap-1">
                        <span class="material-symbols-outlined text-[12px] text-emerald-700">{{ $icon }}</span>
                        {{ $badge }}
                    </span>
                    <img class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" src="{{ $imageUrl }}" alt="{{ $product->name }}" />
                    
                    @if (!$product->in_stock)
                        <div class="absolute inset-0 bg-stone-900/40 backdrop-blur-[2px] z-20 flex items-center justify-center transition-all duration-300">
                            <span class="px-4 py-2 border border-white/20 bg-white/10 backdrop-blur-md text-white font-label-sm text-[11px] uppercase tracking-[0.2em] rounded-md shadow-lg">
                                Crafting Soon
                            </span>
                        </div>
                    @endif
                </div>

                <!-- Info -->
                <div class="p-6 flex flex-col flex-1 justify-between">
                    <div>
                        <div class="flex justify-between items-start mb-2 gap-2">
                            <h3 class="font-headline-md text-base text-stone-900 dark:text-white font-bold leading-tight mr-2">{{ $product->name }}</h3>
                            <span class="text-emerald-900 dark:text-emerald-400 font-bold text-sm whitespace-nowrap shrink-0">₹{{ number_format((float) $product->base_price, 0) }}</span>
                        </div>
                        <p class="text-stone-400 text-[11px] mb-1 font-semibold uppercase tracking-wider">{{ $material }}</p>
                        <p class="text-stone-500 text-xs leading-relaxed mb-5 line-clamp-2">{{ $product->description }}</p>
                    </div>

                    <div class="space-y-2 mt-auto">
                        <div class="grid grid-cols-2 gap-2">
                            <button type="button"
                                onclick="openProductQuickView('{{ $product->id }}', '{{ addslashes($product->name) }}', '{{ addslashes($product->description) }}', '{{ $imageUrl }}', '{{ number_format((float) $product->base_price, 0) }}', '{{ $material }}', '{{ $cat }}', {{ $product->in_stock ? 'true' : 'false' }})"
                                class="py-2.5 rounded-xl bg-stone-50 dark:bg-stone-900 text-stone-600 dark:text-stone-300 font-semibold hover:bg-stone-100 text-xs transition-colors flex justify-center items-center gap-1">
                                <span class="material-symbols-outlined text-[15px]">visibility</span>
                                Quick View
                            </button>
                            @if ($product->in_stock)
                                <button type="button"
                                    onclick="addToCart('{{ $product->id }}', '{{ addslashes($product->name) }}', '{{ $product->base_price }}', '{{ $badge }}', '{{ $imageUrl }}')"
                                    class="py-2.5 rounded-xl bg-stone-50 dark:bg-stone-900 text-stone-600 hover:bg-emerald-50 hover:text-emerald-800 font-semibold text-xs transition-colors flex justify-center items-center gap-1 border border-stone-200/60">
                                    <span class="material-symbols-outlined text-[15px]">shopping_bag</span>
                                    Add to Cart
                                </button>
                            @else
                                <button type="button" disabled
                                    class="py-2.5 rounded-xl bg-stone-100 dark:bg-stone-900/50 text-stone-400 font-semibold text-xs flex justify-center items-center gap-1 border border-stone-200/40 cursor-not-allowed opacity-60">
                                    <span class="material-symbols-outlined text-[15px]">block</span>
                                    Out of Stock
                                </button>
                            @endif
                        </div>
                    </div>
                </div>
            </div>
        @empty
            <div class="col-span-full text-center py-16 space-y-4">
                <span class="material-symbols-outlined text-stone-300 text-5xl">inventory_2</span>
                <h3 class="font-headline-md text-lg text-primary font-bold">No collections active</h3>
                <p class="text-xs text-stone-500">Run <code>php artisan db:seed</code> to initialize sample products.</p>
            </div>
        @endforelse
    </div>
</div>

<!-- Quick View Modal -->
<div id="quickViewModal" class="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-md flex items-center justify-center p-6 opacity-0 hidden transition-opacity duration-300">
    <div id="quickViewCard" class="bg-white dark:bg-stone-950 w-full max-w-4xl rounded-[2.5rem] overflow-hidden whisper-shadow border border-stone-100 dark:border-stone-900 scale-95 transition-transform duration-300 flex flex-col md:flex-row max-h-[90vh] overflow-y-auto">
        <div class="md:w-1/2 bg-stone-50 dark:bg-stone-900/50 relative">
            <img id="qvImage" class="w-full h-full object-cover max-h-[320px] md:max-h-full" src="" alt="Quick View">
            <button onclick="closeProductQuickView()" class="absolute top-4 left-4 w-10 h-10 rounded-full bg-white/90 dark:bg-stone-900/90 text-stone-700 flex items-center justify-center hover:bg-stone-100 transition-colors shadow-md md:hidden">
                <span class="material-symbols-outlined">close</span>
            </button>
        </div>
        <div class="md:w-1/2 p-8 md:p-10 flex flex-col justify-between overflow-y-auto space-y-6">
            <div class="space-y-4">
                <div class="flex justify-between items-start">
                    <div>
                        <span id="qvCategory" class="inline-block px-2.5 py-0.5 mb-2 rounded-full bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 text-[9px] font-bold uppercase tracking-wider">Category</span>
                        <h2 id="qvName" class="font-headline-md text-2xl text-primary font-bold leading-tight">Product Name</h2>
                    </div>
                    <button onclick="closeProductQuickView()" class="hidden md:flex w-10 h-10 rounded-full bg-stone-50 dark:bg-stone-900 text-stone-500 items-center justify-center hover:bg-stone-100 transition-colors">
                        <span class="material-symbols-outlined">close</span>
                    </button>
                </div>
                <div class="space-y-2">
                    <span id="qvPrice" class="text-2xl font-extrabold text-emerald-900 dark:text-emerald-400 block">₹0</span>
                    <p id="qvDesc" class="text-stone-500 text-xs leading-relaxed"></p>
                </div>
                <div class="border-t border-stone-100 dark:border-stone-900 pt-4 space-y-3 text-xs font-semibold text-stone-600 dark:text-stone-400">
                    <div class="flex justify-between"><span class="text-stone-400">Materials</span><span id="qvMaterial" class="text-primary truncate max-w-[200px]"></span></div>
                    <div class="flex justify-between"><span class="text-stone-400">Personalisation</span><span class="text-emerald-800 dark:text-emerald-400 bg-emerald-500/15 px-2.5 py-0.5 rounded-full font-bold text-[9px] uppercase tracking-widest">AI Curation Active</span></div>
                    <div class="flex justify-between"><span class="text-stone-400">Delivery</span><span class="text-primary">Free · 3-5 Business Days</span></div>
                </div>
            </div>
            <div class="pt-4 border-t border-stone-100 dark:border-stone-900 space-y-3">
                <button id="qvCartBtn" class="w-full bg-emerald-950 text-white py-3.5 rounded-xl font-bold text-xs hover:opacity-90 transition-opacity flex justify-center items-center gap-1.5 shadow-lg">
                    <span class="material-symbols-outlined text-[16px]">shopping_bag</span>
                    Add to Cart
                </button>
            </div>
        </div>
    </div>
</div>

<script>
    // Category filter
    function filterCategory(cat) {
        document.querySelectorAll('.cat-btn').forEach(btn => {
            btn.className = 'cat-btn px-5 py-2.5 rounded-full text-xs font-semibold bg-stone-50 dark:bg-stone-900 text-stone-500 hover:text-emerald-800 border border-stone-200/60 dark:border-stone-800 transition-all';
        });
        const ids = { 'all': 'btn-cat-all', 'Wall Decor': 'btn-cat-wall', 'Lighting': 'btn-cat-lighting', 'Soft Furnishings': 'btn-cat-soft', 'Decorative Accents': 'btn-cat-accents', 'Rugs & Mats': 'btn-cat-rugs' };
        const activeId = ids[cat] || 'btn-cat-all';
        const activeBtn = document.getElementById(activeId);
        if (activeBtn) activeBtn.className = 'cat-btn px-5 py-2.5 rounded-full text-xs font-semibold bg-emerald-950 text-white shadow-md transition-all';

        document.querySelectorAll('.product-card').forEach(card => {
            const cardCat = card.getAttribute('data-category');
            const show = cat === 'all' || cardCat === cat;
            if (show) {
                card.style.display = 'block';
                setTimeout(() => { card.style.opacity = '1'; card.style.transform = 'translateY(0)'; }, 50);
            } else {
                card.style.opacity = '0'; card.style.transform = 'translateY(15px)';
                setTimeout(() => { card.style.display = 'none'; }, 300);
            }
        });
    }

    // Quick View modal
    let qvCurrentId, qvCurrentName, qvCurrentPrice, qvCurrentBadge;

    function openProductQuickView(id, name, desc, img, price, material, category, inStock) {
        qvCurrentId = id; qvCurrentName = name; qvCurrentPrice = price; qvCurrentBadge = category;
        const modal = document.getElementById('quickViewModal');
        const card  = document.getElementById('quickViewCard');
        document.getElementById('qvImage').src       = img;
        document.getElementById('qvName').textContent = name;
        document.getElementById('qvDesc').textContent = desc;
        document.getElementById('qvPrice').textContent = '₹' + price;
        document.getElementById('qvMaterial').textContent = material;
        document.getElementById('qvCategory').textContent = category;
        
        const cartBtn = document.getElementById('qvCartBtn');
        if (inStock) {
            cartBtn.disabled = false;
            cartBtn.innerHTML = `<span class="material-symbols-outlined text-[16px]">shopping_bag</span> Add to Cart`;
            cartBtn.className = "w-full bg-emerald-950 text-white py-3.5 rounded-xl font-bold text-xs hover:opacity-90 transition-opacity flex justify-center items-center gap-1.5 shadow-lg cursor-pointer";
            cartBtn.onclick = () => {
                addToCart(id, name, price.replace(/,/g, ''), category, img);
                closeProductQuickView();
            };
        } else {
            cartBtn.disabled = true;
            cartBtn.innerHTML = `<span class="material-symbols-outlined text-[16px]">block</span> Crafting Soon (Out of Stock)`;
            cartBtn.className = "w-full bg-stone-200 dark:bg-stone-900 text-stone-400 dark:text-stone-500 py-3.5 rounded-xl font-bold text-xs flex justify-center items-center gap-1.5 opacity-60 cursor-not-allowed pointer-events-none";
            cartBtn.onclick = null;
        }

        modal.classList.remove('hidden');
        setTimeout(() => { modal.classList.remove('opacity-0'); card.classList.remove('scale-95'); }, 50);
    }

    function closeProductQuickView() {
        const modal = document.getElementById('quickViewModal');
        const card  = document.getElementById('quickViewCard');
        modal.classList.add('opacity-0'); card.classList.add('scale-95');
        setTimeout(() => modal.classList.add('hidden'), 300);
    }

    document.getElementById('quickViewModal').addEventListener('click', function(e) {
        if (e.target === this) closeProductQuickView();
    });
</script>
@endsection
