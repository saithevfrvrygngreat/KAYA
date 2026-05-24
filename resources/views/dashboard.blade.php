@extends('layouts.app')

@section('content')
<div class="max-w-7xl mx-auto px-6 md:px-12 py-12 min-h-screen">
    
    <div class="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
        <div>
            <span class="inline-block px-3 py-1 mb-3 rounded-full bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 font-label-sm uppercase tracking-widest text-[11px] font-bold">My Orders</span>
            <h1 class="font-display-xl text-4xl md:text-5xl text-primary leading-tight">Your Order Ledger</h1>
            <p class="font-body-md text-stone-500 max-w-md leading-relaxed mt-2">
                A definitive archive of your premium spatial specifications, active crafting milestones, and secure transaction receipts.
            </p>
        </div>
        
        <div class="flex gap-4">
            <a href="{{ route('products.index') }}" class="px-6 py-3 rounded-full border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-300 font-semibold text-sm hover:bg-stone-50 dark:hover:bg-stone-900 transition-colors">
                Browse Collection
            </a>
            <a href="{{ route('ai.designer') }}" class="px-6 py-3 rounded-full bg-emerald-950 text-white font-semibold text-sm hover:opacity-90 shadow-md flex items-center gap-2 transition-opacity">
                <span class="material-symbols-outlined text-[18px]">auto_awesome</span>
                New Space Analysis
            </a>
        </div>
    </div>

    @if($orders->isEmpty())
        <div class="bg-stone-50 dark:bg-stone-900/50 rounded-3xl p-12 text-center border border-stone-100 dark:border-stone-800 flex flex-col items-center justify-center">
            <div class="w-24 h-24 bg-white dark:bg-stone-950 rounded-full flex items-center justify-center mb-6 shadow-sm border border-stone-100 dark:border-stone-800">
                <span class="material-symbols-outlined text-stone-300 text-4xl">receipt_long</span>
            </div>
            <h3 class="font-headline-md text-xl text-primary font-bold mb-2">Order History is Empty</h3>
            <p class="text-stone-500 text-sm max-w-sm">You haven't initiated any curation orders yet. Begin by analyzing your space or exploring the showroom.</p>
        </div>
    @else
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <!-- Order List -->
            <div class="lg:col-span-2 space-y-6">
                @foreach($orders as $order)
                <div class="bg-white dark:bg-stone-950 rounded-[2rem] p-6 whisper-shadow border border-stone-100 dark:border-stone-900 flex flex-col sm:flex-row gap-6 transition-all hover:-translate-y-1">
                    @if($order->custom_design_id && $order->customDesign)
                        <!-- Bespoke Custom Design Thumbnail -->
                        <div class="w-full sm:w-40 h-40 rounded-2xl bg-stone-100 dark:bg-stone-900 overflow-hidden flex-shrink-0 relative">
                            <img class="w-full h-full object-cover" src="{{ $order->customDesign->room_image_path ? asset('storage/'.$order->customDesign->room_image_path) : 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=400&q=80' }}" onerror="this.src='https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=400&q=80'" alt="Design Preview">
                        </div>
                    @else
                        <!-- Standard Cart Thumbnail (first item's image) -->
                        @php
                            $firstItemImage = 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=400&q=80';
                            if ($order->cart_items && is_array($order->cart_items) && count($order->cart_items) > 0) {
                                $firstItemImage = $order->cart_items[0]['image'] ?? $firstItemImage;
                            }
                        @endphp
                        <div class="w-full sm:w-40 h-40 rounded-2xl bg-stone-100 dark:bg-stone-900 overflow-hidden flex-shrink-0 relative flex items-center justify-center border border-stone-100 dark:border-stone-850">
                            <img class="w-full h-full object-cover" src="{{ $firstItemImage }}" onerror="this.src='https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=400&q=80'" alt="Product Image">
                        </div>
                    @endif
                    
                    <!-- Details -->
                    <div class="flex-1 flex flex-col justify-between">
                        <div>
                            <div class="flex justify-between items-start mb-2">
                                <div>
                                    <span class="text-[10px] uppercase tracking-widest font-bold text-stone-400 block mb-1">Order {{ $order->order_number }}</span>
                                    @if($order->custom_design_id && $order->customDesign)
                                        <h3 class="font-headline-sm text-lg text-primary font-bold">{{ $order->customDesign->product->name ?? 'Bespoke Custom Curation' }}</h3>
                                    @else
                                        @php
                                            $itemNames = [];
                                            if ($order->cart_items && is_array($order->cart_items)) {
                                                foreach ($order->cart_items as $item) {
                                                    $itemNames[] = $item['name'];
                                                }
                                            }
                                            $title = count($itemNames) > 0 ? implode(', ', $itemNames) : 'Premium Curation Selection';
                                        @endphp
                                        <h3 class="font-headline-sm text-lg text-primary font-bold truncate max-w-[280px]" title="{{ $title }}">{{ $title }}</h3>
                                    @endif
                                </div>
                                <span class="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border
                                    {{ $order->status === 'placed' ? 'bg-amber-500/10 text-amber-800 dark:text-amber-400 border-amber-500/10' : '' }}
                                    {{ $order->status === 'processing' ? 'bg-blue-500/10 text-blue-800 dark:text-blue-400 border-blue-500/10' : '' }}
                                    {{ $order->status === 'shipping' ? 'bg-indigo-500/10 text-indigo-800 dark:text-indigo-400 border-indigo-500/10' : '' }}
                                    {{ $order->status === 'delivered' ? 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 border-emerald-500/10' : '' }}
                                    {{ $order->status === 'cancelled' ? 'bg-rose-500/10 text-rose-800 dark:text-rose-400 border-rose-500/10' : '' }}
                                ">
                                    {{ $order->status }}
                                </span>
                            </div>
                            
                            @if($order->custom_design_id && $order->customDesign)
                                <p class="text-stone-500 text-xs mt-2 line-clamp-2">
                                    @if($order->customDesign->design_json && isset($order->customDesign->design_json['ai_art_spec']))
                                        <span class="inline-flex items-center gap-1 text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider mb-1"><span class="material-symbols-outlined text-[12px]">auto_awesome</span> AI Generated Vector Spec</span><br>
                                    @endif
                                    Base Color: {{ $order->customDesign->design_json['color'] ?? 'Standard' }} | Frame: {{ $order->customDesign->design_json['frame_style'] ?? 'None' }}
                                </p>
                            @else
                                <div class="text-stone-500 text-xs mt-2">
                                    <span class="inline-flex items-center gap-1 text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider mb-1">
                                        <span class="material-symbols-outlined text-[12px]">shopping_cart</span> Multi-Item Selection
                                    </span>
                                    <div class="flex flex-wrap gap-1 mt-1">
                                        @if($order->cart_items && is_array($order->cart_items))
                                            @foreach($order->cart_items as $item)
                                                <span class="inline-block bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-850 px-2.5 py-1 rounded-xl text-[10px] text-stone-650 dark:text-stone-300 font-semibold">
                                                    {{ $item['name'] }} (x{{ $item['qty'] }})
                                                </span>
                                            @endforeach
                                        @endif
                                    </div>
                                </div>
                            @endif
                        </div>
                        
                        <div class="flex flex-col gap-4 mt-4 pt-4 border-t border-stone-100 dark:border-stone-900/50">
                            <div class="flex flex-wrap justify-between items-center gap-4">
                                <div>
                                    <span class="text-[10px] uppercase tracking-widest font-semibold text-stone-400 block">Total Investment</span>
                                    @if($order->status === 'cancelled')
                                        <span class="line-through text-stone-400 font-bold text-sm font-mono">INR {{ number_format((float)$order->total_price, 2) }}</span>
                                        <span class="block text-[10px] text-rose-600 dark:text-rose-400 font-bold mt-0.5">Cancelled &amp; Voided</span>
                                    @else
                                        <span class="text-emerald-900 dark:text-emerald-400 font-bold text-sm font-mono">INR {{ number_format((float)$order->total_price, 2) }}</span>
                                    @endif
                                </div>
                                <div class="flex items-center gap-3">
                                    <button onclick="toggleOrderDetails('order-details-{{ $order->id }}', this)" class="px-4 py-2 rounded-xl bg-stone-50 dark:bg-stone-900 text-xs font-bold text-stone-700 dark:text-stone-300 hover:bg-emerald-500/10 hover:text-emerald-800 dark:hover:text-emerald-300 transition-all flex items-center gap-1.5 border border-stone-200/50 dark:border-stone-850">
                                        <span>Show Details</span>
                                        <span class="material-symbols-outlined text-[16px] transition-transform duration-300">expand_more</span>
                                    </button>
                                    <a href="{{ route('orders.show', $order->id) }}" class="px-4 py-2 rounded-xl border border-stone-200 dark:border-stone-800 text-xs font-semibold text-stone-600 dark:text-stone-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:bg-stone-50 dark:hover:bg-stone-900 transition-all flex items-center gap-1">
                                        Invoice <span class="material-symbols-outlined text-[14px]">arrow_forward</span>
                                    </a>
                                </div>
                            </div>

                            <!-- Expandable Order Details Panel -->
                            <div id="order-details-{{ $order->id }}" class="hidden pt-6 border-t border-stone-100 dark:border-stone-900 space-y-6">
                                <!-- Progress Tracking Milestones -->
                                <div class="space-y-3">
                                    <h4 class="text-xs uppercase tracking-widest font-bold text-emerald-800 dark:text-emerald-400 flex items-center gap-1.5">
                                        <span class="material-symbols-outlined text-[16px]">local_shipping</span> Production & Delivery Milestones
                                    </h4>
                                    <div class="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-1">
                                        <!-- Placed -->
                                        <div class="flex items-center gap-3 p-3.5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-500/20">
                                            <span class="w-7 h-7 rounded-full bg-emerald-750 text-white flex items-center justify-center text-xs font-bold shrink-0">✓</span>
                                            <div>
                                                <p class="text-xs font-bold text-emerald-950 dark:text-emerald-300">Placed</p>
                                                <p class="text-[9px] text-emerald-700 dark:text-emerald-400/85">Order Secured</p>
                                            </div>
                                        </div>
                                        <!-- Processing -->
                                        @php
                                            $isProc = in_array($order->status, ['processing', 'shipping', 'delivered']);
                                        @endphp
                                        <div class="flex items-center gap-3 p-3.5 rounded-2xl border transition-colors duration-300
                                            {{ $isProc ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-500/20' : 'bg-stone-50 dark:bg-stone-900/50 border-stone-100 dark:border-stone-850' }}">
                                            @if($isProc)
                                                <span class="w-7 h-7 rounded-full bg-emerald-750 text-white flex items-center justify-center text-xs font-bold shrink-0">✓</span>
                                            @else
                                                <span class="w-7 h-7 rounded-full bg-stone-200 dark:bg-stone-850 text-stone-500 flex items-center justify-center text-xs font-bold shrink-0">2</span>
                                            @endif
                                            <div>
                                                <p class="text-xs font-bold {{ $isProc ? 'text-emerald-950 dark:text-emerald-300' : 'text-stone-855 dark:text-stone-400' }}">Processing</p>
                                                <p class="text-[9px] text-stone-400">Crafting & Mounting</p>
                                            </div>
                                        </div>
                                        <!-- Shipping -->
                                        @php
                                            $isShip = in_array($order->status, ['shipping', 'delivered']);
                                        @endphp
                                        <div class="flex items-center gap-3 p-3.5 rounded-2xl border transition-colors duration-300
                                            {{ $isShip ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-500/20' : 'bg-stone-50 dark:bg-stone-900/50 border-stone-100 dark:border-stone-850' }}">
                                            @if($isShip)
                                                <span class="w-7 h-7 rounded-full bg-emerald-750 text-white flex items-center justify-center text-xs font-bold shrink-0">✓</span>
                                            @else
                                                <span class="w-7 h-7 rounded-full bg-stone-200 dark:bg-stone-850 text-stone-500 flex items-center justify-center text-xs font-bold shrink-0">3</span>
                                            @endif
                                            <div>
                                                <p class="text-xs font-bold {{ $isShip ? 'text-emerald-950 dark:text-emerald-300' : 'text-stone-855 dark:text-stone-400' }}">Shipping</p>
                                                <p class="text-[9px] text-stone-400">In Transit</p>
                                            </div>
                                        </div>
                                        <!-- Delivered -->
                                        @php
                                            $isDel = $order->status === 'delivered';
                                            $isCan = $order->status === 'cancelled';
                                        @endphp
                                        <div class="flex items-center gap-3 p-3.5 rounded-2xl border transition-colors duration-300
                                            {{ $isDel ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-500/20' : ($isCan ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-500/20' : 'bg-stone-50 dark:bg-stone-900/50 border-stone-100 dark:border-stone-850') }}">
                                            @if($isDel)
                                                <span class="w-7 h-7 rounded-full bg-emerald-750 text-white flex items-center justify-center text-xs font-bold shrink-0">✓</span>
                                            @elseif($isCan)
                                                <span class="w-7 h-7 rounded-full bg-rose-700 text-white flex items-center justify-center text-xs font-bold shrink-0">✕</span>
                                            @else
                                                <span class="w-7 h-7 rounded-full bg-stone-200 dark:bg-stone-850 text-stone-500 flex items-center justify-center text-xs font-bold shrink-0">4</span>
                                            @endif
                                            <div>
                                                <p class="text-xs font-bold
                                                    {{ $isDel ? 'text-emerald-950 dark:text-emerald-300' : ($isCan ? 'text-rose-950 dark:text-rose-300' : 'text-stone-855 dark:text-stone-400') }}">
                                                    {{ $isCan ? 'Cancelled' : 'Delivered' }}
                                                </p>
                                                <p class="text-[9px] text-stone-400">
                                                    {{ $isCan ? 'Order Voided' : 'Handed Over' }}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Customer details and shipping address side-by-side -->
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                                    <!-- Contact Info -->
                                    <div class="bg-stone-50 dark:bg-stone-900/30 p-5 rounded-[1.5rem] border border-stone-100 dark:border-stone-850 space-y-2.5 text-xs">
                                        <h5 class="text-stone-400 uppercase tracking-wider text-[10px] font-bold">Customer Contact</h5>
                                        <div class="flex justify-between py-1 border-b border-stone-200/30 dark:border-stone-800/30">
                                            <span class="text-stone-500 dark:text-stone-400 font-semibold">Name</span>
                                            <span class="text-primary font-bold">{{ $order->customer_name }}</span>
                                        </div>
                                        <div class="flex justify-between py-1 border-b border-stone-200/30 dark:border-stone-800/30">
                                            <span class="text-stone-500 dark:text-stone-400 font-semibold">Phone</span>
                                            <span class="text-primary font-mono font-bold">{{ $order->customer_phone }}</span>
                                        </div>
                                        <div class="flex justify-between py-1 border-b border-stone-200/30 dark:border-stone-800/30">
                                            <span class="text-stone-500 dark:text-stone-400 font-semibold">Email</span>
                                            <span class="text-primary font-semibold text-stone-750 dark:text-stone-300">{{ $order->customer_email }}</span>
                                        </div>
                                    </div>

                                    <!-- Shipping Address -->
                                    <div class="bg-stone-50 dark:bg-stone-900/30 p-5 rounded-[1.5rem] border border-stone-100 dark:border-stone-850 flex flex-col justify-between text-xs">
                                        <div>
                                            <h5 class="text-stone-400 uppercase tracking-wider text-[10px] font-bold mb-2">Delivery Address</h5>
                                            <p class="text-stone-600 dark:text-stone-300 font-semibold leading-relaxed">{{ $order->shipping_address }}</p>
                                        </div>
                                        <div class="mt-4 pt-3 border-t border-stone-200/30 dark:border-stone-800/30 flex justify-between items-center text-[9px] uppercase tracking-wider font-bold text-stone-400">
                                            <span>Premium Shipping</span>
                                            <span class="text-emerald-700 dark:text-emerald-400">Fully Insured</span>
                                        </div>
                                    </div>
                                </div>

                                <!-- Transaction Detail Block -->
                                <div class="bg-stone-50 dark:bg-stone-900/30 p-5 rounded-[1.5rem] border border-stone-100 dark:border-stone-850 space-y-3 text-xs">
                                    <h5 class="text-stone-400 uppercase tracking-wider text-[10px] font-bold">Transaction Ledger</h5>
                                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div>
                                            <span class="text-stone-500 block mb-0.5">Razorpay Payment ID</span>
                                            <span class="text-primary font-mono font-bold text-[11px] flex items-center gap-1">
                                                <span class="material-symbols-outlined text-[13px] text-emerald-700">lock</span>
                                                {{ $order->payment_id }}
                                            </span>
                                        </div>
                                        <div>
                                            <span class="text-stone-500 block mb-0.5">Payment Status</span>
                                            <span class="text-emerald-700 dark:text-emerald-400 uppercase font-bold text-[9px] tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 inline-block border border-emerald-500/20">
                                                {{ $order->payment_status ?? 'paid' }}
                                            </span>
                                        </div>
                                        <div>
                                            <span class="text-stone-500 block mb-0.5">Date Placed</span>
                                            <span class="text-primary font-semibold text-stone-700 dark:text-stone-300">{{ $order->created_at->format('d M Y, h:i A') }}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                @endforeach
            </div>
            
            <!-- Account Summary Sidebar -->
            <div class="lg:col-span-1">
                <div class="bg-stone-50 dark:bg-stone-900/50 rounded-[2.5rem] p-8 border border-stone-100 dark:border-stone-800 sticky top-8">
                    <h3 class="font-headline-sm text-lg text-primary font-bold mb-6">Profile Summary</h3>
                    
                    <div class="space-y-4 mb-8">
                        <div class="flex items-center gap-4">
                            <div class="w-12 h-12 rounded-full bg-emerald-950 text-white flex items-center justify-center font-bold text-lg">
                                {{ substr(auth()->user()->name ?? 'User', 0, 1) }}
                            </div>
                            <div>
                                <p class="font-bold text-stone-900 dark:text-white text-sm">{{ auth()->user()->name ?? 'Guest User' }}</p>
                                <p class="text-stone-500 text-xs">{{ auth()->user()->email ?? 'guest@example.com' }}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="space-y-3 pt-6 border-t border-stone-200 dark:border-stone-800">
                        <div class="flex justify-between items-center text-sm">
                            <span class="text-stone-500">Total Curations</span>
                            <span class="font-bold text-primary">{{ $orders->count() }}</span>
                        </div>
                        <div class="flex justify-between items-center text-sm">
                            <span class="text-stone-500">Active Crafts</span>
                            <span class="font-bold text-primary">{{ $orders->where('status', 'placed')->count() }}</span>
                        </div>
                        <div class="flex justify-between items-center text-sm">
                            <span class="text-stone-500">Member Since</span>
                            <span class="font-bold text-primary">{{ auth()->user()->created_at->format('M Y') ?? 'Today' }}</span>
                        </div>
                    </div>
                    
                    <form action="{{ route('logout') }}" method="POST" class="mt-8">
                        @csrf
                        <button type="submit" class="w-full py-3 rounded-xl border border-rose-200 text-rose-600 font-semibold text-xs hover:bg-rose-50 transition-colors">
                            Secure Logout
                        </button>
                    </form>
                </div>
            </div>
        </div>
    @endif
</div>

<script>
    function toggleOrderDetails(id, btn) {
        const details = document.getElementById(id);
        const icon = btn.querySelector('.material-symbols-outlined');
        const textSpan = btn.querySelector('span:first-child');
        
        if (details.classList.contains('hidden')) {
            details.classList.remove('hidden');
            if (icon) icon.style.transform = 'rotate(180deg)';
            if (textSpan) textSpan.innerText = 'Hide Details';
        } else {
            details.classList.add('hidden');
            if (icon) icon.style.transform = 'rotate(0deg)';
            if (textSpan) textSpan.innerText = 'Show Details';
        }
    }
</script>
@endsection
