@extends('layouts.app')

@section('content')
<div class="max-w-3xl mx-auto px-6 py-16">
    <div class="bg-white dark:bg-stone-950 p-8 md:p-12 rounded-[2.5rem] border border-stone-100 dark:border-stone-900 whisper-shadow text-center space-y-8">
        
        <!-- Animated Check Circle -->
        <div class="relative w-24 h-24 mx-auto flex items-center justify-center bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 rounded-full">
            <span class="material-symbols-outlined text-[52px] animate-pulse">check_circle</span>
            <div class="absolute inset-0 border-[3px] border-emerald-500/30 rounded-full scale-110 animate-ping opacity-25"></div>
        </div>

        <div class="space-y-3">
            <span class="inline-block px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 font-label-sm uppercase tracking-widest text-[11px] font-bold">KaYa Order Placed</span>
            <h1 class="font-display-xl text-3xl md:text-4xl text-primary leading-tight font-extrabold">Thank You For Your Curation</h1>
            <p class="font-body-md text-stone-500 max-w-lg mx-auto leading-relaxed">
                Your custom styling selection has been submitted to our design laboratory. Our master craftsmen are preparing your bespoke frame.
            </p>
        </div>

        <!-- Order details block -->
        <div class="bg-stone-50 dark:bg-stone-900/40 rounded-3xl p-6 border border-stone-100 dark:border-stone-900/50 max-w-md mx-auto text-left space-y-4 text-sm font-semibold">
            <div class="flex justify-between py-1 border-b border-stone-200/50 dark:border-stone-800/30">
                <span class="text-stone-400">Order Number</span>
                <span class="text-primary font-mono text-emerald-950 dark:text-emerald-400">{{ $order->order_number }}</span>
            </div>
            
            <div class="flex justify-between py-1 border-b border-stone-200/50 dark:border-stone-800/30">
                <span class="text-stone-400">Customer Name</span>
                <span class="text-primary">{{ $order->customer_name }}</span>
            </div>

            <div class="flex justify-between py-1 border-b border-stone-200/50 dark:border-stone-800/30">
                <span class="text-stone-400">Secure Payment ID</span>
                <span class="text-primary font-mono text-xs flex items-center gap-1">
                    <span class="material-symbols-outlined text-[13px] text-emerald-700">lock</span>
                    {{ $order->payment_id }}
                </span>
            </div>

            @if ($product)
                <div class="flex justify-between py-1 border-b border-stone-200/50 dark:border-stone-800/30">
                    <span class="text-stone-400">Custom Frame Base</span>
                    <span class="text-primary">{{ $product->name }}</span>
                </div>
            @endif

            @if ($design)
                <div class="flex justify-between py-1 border-b border-stone-200/50 dark:border-stone-800/30">
                    <span class="text-stone-400">Curation Signature ID</span>
                    <span class="text-primary font-mono text-xs">{{ $design->id }}</span>
                </div>
            @endif

            @if ($order->cart_items && is_array($order->cart_items))
                <div class="py-1 border-b border-stone-200/50 dark:border-stone-800/30">
                    <span class="text-stone-400 block mb-2">Purchased Selection</span>
                    <div class="space-y-2.5">
                        @foreach ($order->cart_items as $item)
                            <div class="flex items-center justify-between text-xs font-semibold">
                                <div class="flex items-center gap-2">
                                    <div class="w-8 h-8 rounded bg-stone-100 dark:bg-stone-850 overflow-hidden flex-shrink-0">
                                        <img src="{{ $item['image'] ?? 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=100&q=80' }}" class="w-full h-full object-cover">
                                    </div>
                                    <span class="text-stone-700 dark:text-stone-300">{{ $item['name'] }} <small class="text-stone-400">x{{ $item['qty'] }}</small></span>
                                </div>
                                <span class="text-stone-800 dark:text-stone-200">INR {{ number_format((float) $item['price'] * $item['qty'], 2) }}</span>
                            </div>
                        @endforeach
                    </div>
                </div>
            @endif

            <div class="flex justify-between py-1 border-b border-stone-200/50 dark:border-stone-800/30">
                <span class="text-stone-400">Status</span>
                <span class="text-emerald-800 dark:text-emerald-300 uppercase tracking-widest text-[10px] font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full">{{ $order->status }}</span>
            </div>

            <div class="flex justify-between pt-2">
                <span class="text-stone-400">Total Charged</span>
                <span class="text-lg font-bold text-emerald-900 dark:text-emerald-400">INR {{ number_format((float) $order->total_price, 2) }}</span>
            </div>
        </div>


        <!-- Crafting/Production Milestones tracking -->
        <div class="max-w-md mx-auto space-y-4 text-left pt-4">
            <h3 class="text-xs uppercase tracking-widest font-semibold text-stone-400">Next Steps</h3>
            <div class="relative pl-8 space-y-6 before:absolute before:left-3 before:top-1.5 before:bottom-1.5 before:w-[2px] before:bg-emerald-500/30">
                <div class="relative">
                    <span class="absolute left-[-26px] top-0.5 w-4 h-4 bg-emerald-700 rounded-full flex items-center justify-center text-[10px] text-white">✓</span>
                    <h4 class="text-sm font-bold text-primary">Curation Secured</h4>
                    <p class="text-xs text-stone-400">Specifications logged and colors mixed in laboratory.</p>
                </div>
                <div class="relative">
                    <span class="absolute left-[-26px] top-0.5 w-4 h-4 bg-stone-300 dark:bg-stone-800 rounded-full flex items-center justify-center text-[10px] text-stone-500">2</span>
                    <h4 class="text-sm font-bold text-primary">Crafting & Mounting</h4>
                    <p class="text-xs text-stone-400">Premium wood moulding cut to size and passpartout border matting applied.</p>
                </div>
                <div class="relative">
                    <span class="absolute left-[-26px] top-0.5 w-4 h-4 bg-stone-300 dark:bg-stone-800 rounded-full flex items-center justify-center text-[10px] text-stone-500">3</span>
                    <h4 class="text-sm font-bold text-primary">Dispatch Curation</h4>
                    <p class="text-xs text-stone-400">Secure padding pack and shipping label applied. Courier tracking email sent.</p>
                </div>
            </div>
        </div>

        <!-- Actions -->
        <div class="flex flex-col sm:flex-row justify-center items-center gap-4 pt-6">
            <a href="{{ route('home') }}" class="w-full sm:w-auto bg-emerald-950 text-white px-8 py-4 rounded-xl font-semibold hover:opacity-90 transition-all flex justify-center items-center gap-2">
                Continue Shopping
                <span class="material-symbols-outlined text-[20px]">explore</span>
            </a>
            @if ($design)
                <a href="{{ route('designs.preview', $design) }}" class="w-full sm:w-auto border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 px-8 py-4 rounded-xl font-semibold hover:bg-stone-50 dark:hover:bg-stone-900 transition-all flex justify-center items-center gap-2">
                    Review Saved Canvas
                    <span class="material-symbols-outlined text-[20px]">palette</span>
                </a>
            @endif
        </div>
    </div>
</div>
@endsection
