@extends('layouts.app')

@section('content')
<!-- Dedicated Admin Top Navigation Bar -->
<nav class="sticky top-0 w-full z-50 bg-white/80 dark:bg-stone-950/80 backdrop-blur-md border-b border-stone-100 dark:border-stone-800 shadow-[0_10px_40px_-15px_rgba(6,78,59,0.04)]">
    <div class="flex justify-between items-center max-w-7xl mx-auto px-6 md:px-12 h-20">
        <!-- Logo / Branding -->
        <div class="flex items-center gap-3">
            <span class="text-2xl font-extrabold tracking-[0.25em] uppercase text-emerald-900 dark:text-emerald-50">KaYa</span>
            <span class="bg-amber-500/10 text-amber-800 dark:text-amber-300 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md border border-amber-500/20">Admin</span>
        </div>

        <!-- Desktop Nav Links (Toggles) -->
        <div class="hidden md:flex items-center gap-8 font-plus-jakarta-sans text-sm tracking-wide h-full">
            <button id="navUsersBtn" onclick="switchDashboardTab('users', true)" class="font-bold text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 transition-colors flex items-center gap-2 py-2 border-b-2 border-transparent h-full">
                <span class="material-symbols-outlined text-[20px]">group</span>
                Clientele Directory
            </button>
            <button id="navOrdersBtn" onclick="switchDashboardTab('orders', true)" class="font-bold text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 transition-colors flex items-center gap-2 py-2 border-b-2 border-transparent h-full">
                <span class="material-symbols-outlined text-[20px]">payments</span>
                Orders &amp; Transactions
            </button>
            <button id="navProductsBtn" onclick="switchDashboardTab('products', true)" class="font-bold text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 transition-colors flex items-center gap-2 py-2 border-b-2 border-transparent h-full">
                <span class="material-symbols-outlined text-[20px]">inventory_2</span>
                Products Curation
            </button>
        </div>

        <!-- Right Side Actions -->
        <div class="flex items-center gap-4">
            <a href="{{ route('logout') }}" onclick="event.preventDefault(); document.getElementById('admin-logout-form').submit();" class="px-4 py-2 rounded-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 font-semibold text-xs transition-all flex items-center gap-1.5 border border-rose-500/20">
                <span class="material-symbols-outlined text-[16px]">logout</span>
                Logout
            </a>
            <form id="admin-logout-form" action="{{ route('logout') }}" method="POST" class="hidden">
                @csrf
            </form>
        </div>
    </div>
</nav>

<div class="max-w-7xl mx-auto px-6 md:px-12 py-12 min-h-screen">
    <!-- Header Area with micro-animations -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6 animate-fade-in">
        <div>
            <span class="inline-block px-3 py-1 mb-3 rounded-full bg-amber-500/10 text-amber-800 dark:text-amber-300 font-label-sm uppercase tracking-widest text-[11px] font-bold">
                <span class="inline-block w-2 h-2 rounded-full bg-amber-500 mr-1.5 animate-pulse"></span>
                Administrative Control Panel
            </span>
            <h1 class="font-display-xl text-4xl md:text-5xl text-primary leading-tight font-extrabold tracking-tight">
                Admin Dashboard
            </h1>
            <p class="font-body-md text-stone-500 max-w-xl leading-relaxed mt-2">
                A unified administrative interface to analyze user acquisitions, custom design trends, and premium order conversions.
            </p>
        </div>

        <div class="flex gap-4">
            <a href="{{ route('home') }}" class="px-5 py-3 rounded-full bg-emerald-950 dark:bg-emerald-900 text-white font-semibold text-sm hover:opacity-90 transition-all flex items-center gap-2 shadow-md">
                <span class="material-symbols-outlined text-[18px]">open_in_new</span>
                View Live Showroom
            </a>
            <button onclick="window.location.reload();" class="px-5 py-3 rounded-full border border-stone-200 dark:border-stone-850 text-stone-600 dark:text-stone-300 font-semibold text-sm hover:bg-stone-50 dark:hover:bg-stone-900 hover:border-stone-350 transition-all flex items-center gap-2 shadow-sm">
                <span class="material-symbols-outlined text-[18px]">refresh</span>
                Refresh Data
            </button>
        </div>
    </div>

    @if (session('success'))
        <div class="bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-200 px-6 py-4 rounded-2xl mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in">
            <div class="flex items-center gap-3">
                <span class="material-symbols-outlined text-emerald-700 dark:text-emerald-400 font-bold">check_circle</span>
                <span class="font-semibold text-sm">{{ session('success') }}</span>
            </div>
            <a href="{{ route('home') }}" class="px-4 py-2 bg-emerald-950 dark:bg-emerald-900 text-white hover:opacity-90 font-bold text-xs rounded-full shadow-sm flex items-center gap-1.5 transition-all self-start sm:self-auto">
                <span class="material-symbols-outlined text-[16px]">open_in_new</span>
                Go to Homepage
            </a>
        </div>
    @endif

    @if ($errors->any())
        <div class="bg-rose-500/10 border border-rose-500/20 text-rose-800 dark:text-rose-200 px-6 py-4 rounded-2xl mb-8 flex flex-col gap-1.5 animate-fade-in">
            <div class="flex items-center gap-3 font-bold text-sm">
                <span class="material-symbols-outlined text-rose-700 dark:text-rose-400">error</span>
                Please correct the following errors:
            </div>
            <ul class="list-disc list-inside text-xs font-semibold pl-8 space-y-1">
                @foreach ($errors->all() as $error)
                    <li>{{ $error }}</li>
                @endforeach
            </ul>
        </div>
    @endif

    <!-- Premium Metrics Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        <!-- Card 1: Total Users -->
        <div class="bg-white/80 dark:bg-stone-950/80 backdrop-blur-md rounded-[2rem] p-6 whisper-shadow border border-stone-100 dark:border-stone-900 transition-all hover:-translate-y-1 hover:shadow-lg group">
            <div class="flex justify-between items-start mb-4">
                <div class="p-3.5 rounded-2xl bg-emerald-500/10 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300">
                    <span class="material-symbols-outlined text-[24px]">group</span>
                </div>
                <span class="text-[11px] font-bold text-emerald-700 bg-emerald-500/10 px-2.5 py-1 rounded-full uppercase tracking-wider">
                    Total
                </span>
            </div>
            <p class="text-stone-400 text-xs font-semibold uppercase tracking-wider">Total Registered</p>
            <h3 class="font-display-xl text-3xl font-extrabold text-primary mt-1">{{ $stats['total_users'] }}</h3>
            <p class="text-stone-500 text-[11px] mt-2 flex items-center gap-1">
                <span class="material-symbols-outlined text-[14px] text-amber-500">shield_person</span>
                Including {{ $stats['total_admins'] }} administrator(s)
            </p>
        </div>

        <!-- Card 3: Placed Orders -->
        <div class="bg-white/80 dark:bg-stone-950/80 backdrop-blur-md rounded-[2rem] p-6 whisper-shadow border border-stone-100 dark:border-stone-900 transition-all hover:-translate-y-1 hover:shadow-lg group">
            <div class="flex justify-between items-start mb-4">
                <div class="p-3.5 rounded-2xl bg-amber-500/10 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300">
                    <span class="material-symbols-outlined text-[24px]">shopping_cart</span>
                </div>
                <span class="text-[11px] font-bold text-amber-700 bg-amber-500/10 px-2.5 py-1 rounded-full uppercase tracking-wider">
                    Orders
                </span>
            </div>
            <p class="text-stone-400 text-xs font-semibold uppercase tracking-wider">Active Crafts</p>
            <h3 class="font-display-xl text-3xl font-extrabold text-primary mt-1">{{ $stats['total_orders'] }}</h3>
            <p class="text-stone-500 text-[11px] mt-2 flex items-center gap-1">
                <span class="material-symbols-outlined text-[14px] text-amber-500">local_shipping</span>
                Luxury curations in production
            </p>
        </div>

        <!-- Card 4: Total Revenue -->
        <div class="bg-white/80 dark:bg-stone-950/80 backdrop-blur-md rounded-[2rem] p-6 whisper-shadow border border-stone-100 dark:border-stone-900 transition-all hover:-translate-y-1 hover:shadow-lg group">
            <div class="flex justify-between items-start mb-4">
                <div class="p-3.5 rounded-2xl bg-blue-500/10 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300">
                    <span class="material-symbols-outlined text-[24px]">payments</span>
                </div>
                <span class="text-[11px] font-bold text-blue-700 bg-blue-500/10 px-2.5 py-1 rounded-full uppercase tracking-wider">
                    Revenue
                </span>
            </div>
            <p class="text-stone-400 text-xs font-semibold uppercase tracking-wider">Net Active Value</p>
            <h3 class="font-display-xl text-3xl font-extrabold text-primary mt-1">
                ₹{{ number_format((float)$stats['total_revenue'], 2) }}
            </h3>
            <div class="text-stone-500 text-[10px] mt-3 pt-2 border-t border-stone-100 dark:border-stone-900 flex flex-col gap-1">
                <div class="flex justify-between font-bold">
                    <span class="text-emerald-700 dark:text-emerald-400 flex items-center gap-0.5">
                        <span class="material-symbols-outlined text-[12px]">trending_up</span> Gross Paid:
                    </span>
                    <span class="font-mono">₹{{ number_format((float)$stats['gross_revenue'], 2) }}</span>
                </div>
                @if($stats['cancelled_revenue'] > 0)
                <div class="flex justify-between font-bold text-rose-600 dark:text-rose-400">
                    <span class="flex items-center gap-0.5">
                        <span class="material-symbols-outlined text-[12px]">cancel</span> Cancelled/Deducted:
                    </span>
                    <span class="font-mono">-₹{{ number_format((float)$stats['cancelled_revenue'], 2) }}</span>
                </div>
                @endif
            </div>
        </div>
    </div>

    <!-- Analytics Insights Visualization -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12 animate-fade-in">
        <!-- Live status distribution -->
        <div class="lg:col-span-2 bg-white/80 dark:bg-stone-950/80 backdrop-blur-md rounded-[2.5rem] p-8 border border-stone-100 dark:border-stone-900 whisper-shadow flex flex-col justify-between">
            <div>
                <h3 class="font-headline-sm text-lg text-primary font-bold mb-1">Curation Fulfillment Insights</h3>
                <p class="text-stone-400 text-xs mb-6">Real-time breakdown of spatial orders currently undergoing wood-framing, courier transit, or final delivery.</p>
            </div>
            
            <div class="space-y-4">
                @php
                    $placedCount = $orders->where('status', 'placed')->count();
                    $procCount = $orders->where('status', 'processing')->count();
                    $shipCount = $orders->where('status', 'shipping')->count();
                    $delCount = $orders->where('status', 'delivered')->count();
                    $canCount = $orders->where('status', 'cancelled')->count();
                    $totalO = max($orders->count(), 1);
                    
                    $placedPct = ($placedCount / $totalO) * 100;
                    $procPct = ($procCount / $totalO) * 100;
                    $shipPct = ($shipCount / $totalO) * 100;
                    $delPct = ($delCount / $totalO) * 100;
                    $canPct = ($canCount / $totalO) * 100;
                @endphp
                
                <!-- Placed Bar -->
                <div>
                    <div class="flex justify-between items-center text-xs font-semibold mb-1.5">
                        <span class="text-amber-850 dark:text-amber-400 flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-amber-500"></span> Placed (Secure Queue)</span>
                        <span class="text-stone-500 font-mono">{{ $placedCount }} ({{ round($placedPct) }}%)</span>
                    </div>
                    <div class="h-2.5 w-full bg-stone-100 dark:bg-stone-900 rounded-full overflow-hidden border border-stone-200/30 dark:border-stone-850">
                        <div class="h-full bg-amber-500 rounded-full transition-all duration-1000" style="width: {{ $placedPct }}%"></div>
                    </div>
                </div>

                <!-- Processing Bar -->
                <div>
                    <div class="flex justify-between items-center text-xs font-semibold mb-1.5">
                        <span class="text-blue-800 dark:text-blue-400 flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-blue-500"></span> Processing (Wood-Framing Lab)</span>
                        <span class="text-stone-500 font-mono">{{ $procCount }} ({{ round($procPct) }}%)</span>
                    </div>
                    <div class="h-2.5 w-full bg-stone-100 dark:bg-stone-900 rounded-full overflow-hidden border border-stone-200/30 dark:border-stone-850">
                        <div class="h-full bg-blue-500 rounded-full transition-all duration-1000" style="width: {{ $procPct }}%"></div>
                    </div>
                </div>

                <!-- Shipping Bar -->
                <div>
                    <div class="flex justify-between items-center text-xs font-semibold mb-1.5">
                        <span class="text-indigo-800 dark:text-indigo-400 flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-indigo-500"></span> Shipping (In Transit)</span>
                        <span class="text-stone-500 font-mono">{{ $shipCount }} ({{ round($shipPct) }}%)</span>
                    </div>
                    <div class="h-2.5 w-full bg-stone-100 dark:bg-stone-900 rounded-full overflow-hidden border border-stone-200/30 dark:border-stone-850">
                        <div class="h-full bg-indigo-500 rounded-full transition-all duration-1000" style="width: {{ $shipPct }}%"></div>
                    </div>
                </div>

                <!-- Delivered Bar -->
                <div>
                    <div class="flex justify-between items-center text-xs font-semibold mb-1.5">
                        <span class="text-emerald-800 dark:text-emerald-400 flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-emerald-500"></span> Delivered (Arrived)</span>
                        <span class="text-stone-500 font-mono">{{ $delCount }} ({{ round($delPct) }}%)</span>
                    </div>
                    <div class="h-2.5 w-full bg-stone-100 dark:bg-stone-900 rounded-full overflow-hidden border border-stone-200/30 dark:border-stone-850">
                        <div class="h-full bg-emerald-500 rounded-full transition-all duration-1000" style="width: {{ $delPct }}%"></div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Revenue Metrics donut -->
        <div class="lg:col-span-1 bg-white/80 dark:bg-stone-950/80 backdrop-blur-md rounded-[2.5rem] p-8 border border-stone-100 dark:border-stone-900 whisper-shadow flex flex-col justify-between">
            <div>
                <h3 class="font-headline-sm text-lg text-primary font-bold mb-1">Financial Stream</h3>
                <p class="text-stone-400 text-xs mb-6">Payment distribution by purchase mode.</p>
            </div>
            
            <div class="relative w-36 h-36 mx-auto my-3 flex items-center justify-center">
                <!-- Sleek CSS-based donut chart using conic-gradient -->
                @php
                    $customRev = $orders->where('payment_status', 'paid')->where('status', '!=', 'cancelled')->whereNotNull('custom_design_id')->sum('total_price');
                    $cartRev = $orders->where('payment_status', 'paid')->where('status', '!=', 'cancelled')->whereNull('custom_design_id')->sum('total_price');
                    $cancelledRev = $orders->where('status', 'cancelled')->sum('total_price');
                    $totalSum = max($customRev + $cartRev + $cancelledRev, 1);
                    
                    $customPct = ($customRev / $totalSum) * 100;
                    $cartPct = ($cartRev / $totalSum) * 100;
                    $cancelledPct = ($cancelledRev / $totalSum) * 100;
                @endphp
                <div class="w-full h-full rounded-full border border-stone-100 dark:border-stone-900 flex items-center justify-center relative shadow-inner"
                     style="background: conic-gradient(#8b5cf6 0% {{ $customPct }}%, #10b981 {{ $customPct }}% {{ $customPct + $cartPct }}%, #f43f5e {{ $customPct + $cartPct }}% 100%);">
                    <!-- Central cutout -->
                    <div class="w-24 h-24 rounded-full bg-white dark:bg-stone-950 border border-stone-100 dark:border-stone-900 shadow-md flex flex-col items-center justify-center text-center">
                        <span class="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Net Active</span>
                        <span class="text-xs font-mono font-bold text-primary">₹{{ number_format((float)$stats['total_revenue'], 0) }}</span>
                    </div>
                </div>
            </div>
            
            <div class="space-y-2.5 pt-4 text-xs font-semibold">
                <div class="flex justify-between items-center">
                    <span class="text-purple-600 dark:text-purple-400 flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded bg-[#8b5cf6]"></span> Bespoke Visualizer</span>
                    <span class="text-stone-600 dark:text-stone-300 font-mono">₹{{ number_format($customRev, 2) }}</span>
                </div>
                <div class="flex justify-between items-center">
                    <span class="text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded bg-[#10b981]"></span> Standard Cart</span>
                    <span class="text-stone-600 dark:text-stone-300 font-mono">₹{{ number_format($cartRev, 2) }}</span>
                </div>
                @if($cancelledRev > 0)
                <div class="flex justify-between items-center">
                    <span class="text-rose-600 dark:text-rose-400 flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded bg-[#f43f5e]"></span> Cancelled Orders</span>
                    <span class="text-rose-650 dark:text-rose-400 font-mono">-₹{{ number_format($cancelledRev, 2) }}</span>
                </div>
                @endif
            </div>
        </div>
    </div>


    <!-- ═══════════════════════════════════════════════════════════════ -->
    <!-- RECENT ACTIVITY FEED -->
    <!-- ═══════════════════════════════════════════════════════════════ -->
    <div class="mb-5 flex items-center gap-2 animate-fade-in">
        <span class="material-symbols-outlined text-[20px] text-emerald-600 dark:text-emerald-400">timeline</span>
        <h3 class="font-headline-sm text-xs text-stone-400 dark:text-stone-500 font-bold uppercase tracking-widest">Live Activity Stream</h3>
        <span class="ml-auto text-[10px] font-bold text-stone-400 dark:text-stone-600 uppercase tracking-widest">Last 8 Events</span>
    </div>

    <div class="bg-white/80 dark:bg-stone-950/80 backdrop-blur-md rounded-[2.5rem] border border-stone-100 dark:border-stone-900 whisper-shadow mb-10 overflow-hidden animate-fade-in">
        @php
            $recentOrders = $orders->sortByDesc('created_at')->take(8);
            $statusConfig = [
                'placed'     => ['icon' => 'receipt_long',    'bg' => 'bg-amber-500/10 dark:bg-amber-500/15',   'text' => 'text-amber-700 dark:text-amber-300',   'badge' => 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20'],
                'processing' => ['icon' => 'precision_manufacturing', 'bg' => 'bg-blue-500/10 dark:bg-blue-500/15', 'text' => 'text-blue-700 dark:text-blue-300',     'badge' => 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20'],
                'shipping'   => ['icon' => 'local_shipping',  'bg' => 'bg-indigo-500/10 dark:bg-indigo-500/15', 'text' => 'text-indigo-700 dark:text-indigo-300', 'badge' => 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/20'],
                'delivered'  => ['icon' => 'check_circle',    'bg' => 'bg-emerald-500/10 dark:bg-emerald-500/15','text' => 'text-emerald-700 dark:text-emerald-300','badge' => 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20'],
                'cancelled'  => ['icon' => 'cancel',          'bg' => 'bg-rose-500/10 dark:bg-rose-500/15',    'text' => 'text-rose-700 dark:text-rose-300',     'badge' => 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20'],
                'pending'    => ['icon' => 'hourglass_empty', 'bg' => 'bg-stone-100 dark:bg-stone-900',         'text' => 'text-stone-500 dark:text-stone-400',   'badge' => 'bg-stone-100 text-stone-600 dark:bg-stone-900 dark:text-stone-400 border-stone-200'],
            ];
        @endphp

        @if($recentOrders->isEmpty())
            <div class="py-16 text-center">
                <span class="material-symbols-outlined text-stone-300 dark:text-stone-700 text-4xl">inbox</span>
                <p class="text-stone-400 text-xs font-semibold mt-3">No activity yet — orders will appear here as they come in.</p>
            </div>
        @else
            <div class="divide-y divide-stone-50 dark:divide-stone-900/80">
                @foreach($recentOrders as $act)
                    @php
                        $cfg = $statusConfig[$act->status] ?? $statusConfig['pending'];
                        $isCustom = !is_null($act->custom_design_id);
                        $isCancelled = $act->status === 'cancelled';
                    @endphp
                    <div class="flex items-center gap-5 px-7 py-4 hover:bg-stone-50/60 dark:hover:bg-stone-900/30 transition-colors group">
                        <!-- Status Icon -->
                        <div class="shrink-0 w-10 h-10 rounded-2xl {{ $cfg['bg'] }} {{ $cfg['text'] }} flex items-center justify-center shadow-sm">
                            <span class="material-symbols-outlined text-[20px]">{{ $cfg['icon'] }}</span>
                        </div>

                        <!-- Order Info -->
                        <div class="flex-1 min-w-0">
                            <div class="flex items-center gap-2 flex-wrap">
                                <span class="font-bold text-stone-900 dark:text-stone-100 text-sm font-mono">{{ $act->order_number }}</span>
                                @if($isCustom)
                                    <span class="inline-flex items-center gap-0.5 text-[9px] font-bold uppercase tracking-wider bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20 px-1.5 py-0.5 rounded-full">
                                        <span class="material-symbols-outlined text-[10px]">palette</span> Bespoke
                                    </span>
                                @else
                                    <span class="inline-flex items-center gap-0.5 text-[9px] font-bold uppercase tracking-wider bg-stone-100 dark:bg-stone-900 text-stone-500 border border-stone-200 dark:border-stone-800 px-1.5 py-0.5 rounded-full">
                                        <span class="material-symbols-outlined text-[10px]">shopping_cart</span> Cart
                                    </span>
                                @endif
                            </div>
                            <p class="text-stone-500 text-xs mt-0.5 truncate">
                                <span class="font-semibold text-stone-700 dark:text-stone-300">{{ $act->customer_name }}</span>
                                <span class="text-stone-400 mx-1">·</span>
                                {{ $act->customer_email }}
                            </p>
                        </div>

                        <!-- Amount -->
                        <div class="text-right shrink-0 hidden sm:block">
                            @if($isCancelled)
                                <span class="text-sm font-bold font-mono text-stone-400 line-through">₹{{ number_format($act->total_price, 2) }}</span>
                                <p class="text-[10px] text-rose-600 dark:text-rose-400 font-bold">-₹{{ number_format($act->total_price, 2) }} Lost</p>
                            @else
                                <span class="text-sm font-bold font-mono text-stone-900 dark:text-stone-100">₹{{ number_format($act->total_price, 2) }}</span>
                                <p class="text-[10px] text-stone-400 mt-0.5">{{ ucfirst($act->payment_status) }}</p>
                            @endif
                        </div>

                        <!-- Status Badge -->
                        <div class="shrink-0 hidden md:block">
                            <span class="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider border px-2.5 py-1 rounded-full {{ $cfg['badge'] }}">
                                {{ ucfirst($act->status) }}
                            </span>
                        </div>

                        <!-- Time -->
                        <div class="shrink-0 text-right hidden lg:block">
                            <span class="text-[11px] text-stone-400 font-medium">{{ $act->created_at ? $act->created_at->diffForHumans() : 'N/A' }}</span>
                        </div>

                        <!-- Quick Action: go to orders tab -->
                        <button onclick="switchDashboardTab('orders', true)" title="View in Orders Ledger"
                                class="shrink-0 p-2 rounded-xl bg-stone-50 hover:bg-stone-100 dark:bg-stone-900 dark:hover:bg-stone-800 text-stone-400 hover:text-amber-600 border border-stone-200/50 dark:border-stone-800 transition-colors opacity-0 group-hover:opacity-100">
                            <span class="material-symbols-outlined text-[16px]">arrow_forward</span>
                        </button>
                    </div>
                @endforeach
            </div>

            <!-- Footer: View All button -->
            <div class="px-7 py-4 border-t border-stone-100 dark:border-stone-900 flex items-center justify-between bg-stone-50/50 dark:bg-stone-900/20">
                <span class="text-[11px] text-stone-400 font-semibold">Showing {{ $recentOrders->count() }} most recent of {{ $stats['total_orders'] }} total orders</span>
                <button onclick="switchDashboardTab('orders', true)"
                        class="text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 transition-colors">
                    View full ledger
                    <span class="material-symbols-outlined text-[14px]">chevron_right</span>
                </button>
            </div>
        @endif
    </div>

    <!-- Tabs Navigation -->
    <div id="admin-tabs-nav" class="flex border-b border-stone-250 dark:border-stone-850 mb-8 max-w-2xl gap-6">
        <button id="tabUsersBtn" onclick="switchDashboardTab('users')" class="pb-3.5 font-bold text-sm text-amber-600 dark:text-amber-400 border-b-2 border-amber-600 dark:border-amber-400 transition-all flex items-center gap-2">
            <span class="material-symbols-outlined text-[18px]">group</span>
            Clientele Directory
        </button>
        <button id="tabOrdersBtn" onclick="switchDashboardTab('orders')" class="pb-3.5 font-bold text-sm text-stone-400 dark:text-stone-500 border-b-2 border-transparent hover:text-stone-700 hover:border-stone-350 transition-all flex items-center gap-2">
            <span class="material-symbols-outlined text-[18px]">payments</span>
            Orders &amp; Transactions
        </button>
        <button id="tabProductsBtn" onclick="switchDashboardTab('products')" class="pb-3.5 font-bold text-sm text-stone-400 dark:text-stone-500 border-b-2 border-transparent hover:text-stone-700 hover:border-stone-350 transition-all flex items-center gap-2">
            <span class="material-symbols-outlined text-[18px]">inventory_2</span>
            Products Curation
        </button>
    </div>

    <!-- Main Content Area: User list and interactive table -->
    <div class="bg-white dark:bg-stone-950 rounded-[2.5rem] p-8 whisper-shadow border border-stone-100 dark:border-stone-900 transition-all">
        <div id="panelUsers" class="animate-fade-in">
            <!-- Table Header Actions -->
        <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
            <div>
                <h2 class="font-headline-md text-xl text-primary font-bold">Registered Clientele</h2>
                <p class="text-stone-400 text-xs mt-1">Overview of registered curators, their saved spaces, and checkout counts.</p>
            </div>

            <!-- Client Filter & Search bar -->
            <div class="flex flex-col sm:flex-row gap-4 w-full lg:w-auto flex-1 justify-end">
                <!-- Live Search Box -->
                <div class="relative flex-1 max-w-sm">
                    <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 text-[20px]">search</span>
                    <input type="text" id="userSearchInput" placeholder="Search by name, email..." class="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-850 px-11 py-2.5 rounded-2xl text-xs text-primary focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/20 font-semibold transition-all">
                </div>

                <!-- Live Role Filter Chips -->
                <div class="flex bg-stone-50 dark:bg-stone-900 p-1 rounded-2xl border border-stone-200/65 dark:border-stone-850 self-start">
                    <button onclick="filterUsersByRole('user', this)" class="role-filter-btn px-4 py-2 bg-white dark:bg-stone-950 text-stone-800 dark:text-stone-100 font-semibold rounded-xl text-xs shadow-sm transition-all">
                        Users
                    </button>
                    <button onclick="filterUsersByRole('admin', this)" class="role-filter-btn px-4 py-2 text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 font-semibold rounded-xl text-xs transition-all">
                        Admins
                    </button>
                </div>
            </div>
        </div>

        <!-- Scrollable Table Wrap -->
        <div class="overflow-x-auto rounded-3xl border border-stone-100 dark:border-stone-900">
            <table class="w-full border-collapse text-left text-xs min-w-[800px]">
                <thead>
                    <tr class="bg-stone-50/75 dark:bg-stone-900/60 border-b border-stone-100 dark:border-stone-900 text-stone-400 font-semibold uppercase tracking-wider">
                        <th class="px-6 py-4">Curator Profile</th>
                        <th class="px-6 py-4">Auth Level</th>
                        <th class="px-6 py-4">Registered Date</th>
                        <th class="px-6 py-4 text-center">Room Audits</th>
                        <th class="px-6 py-4 text-center">Placed Orders</th>
                        <th class="px-6 py-4 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody id="userTableBody" class="divide-y divide-stone-50 dark:divide-stone-900">
                    @foreach($users as $user)
                    <tr class="user-row hover:bg-stone-50/40 dark:hover:bg-stone-900/20 transition-colors" 
                        data-name="{{ $user->name }}" 
                        data-email="{{ $user->email }}" 
                        data-is-admin="{{ $user->is_admin ? 'true' : 'false' }}">
                        
                        <!-- Client Profile -->
                        <td class="px-6 py-5">
                            <div class="flex items-center gap-3">
                                <div class="w-10 h-10 rounded-full bg-emerald-950 text-white flex items-center justify-center font-bold text-sm shadow-sm border border-stone-100 dark:border-stone-900">
                                    {{ substr($user->name ?? 'U', 0, 1) }}
                                </div>
                                <div>
                                    <h4 class="font-bold text-stone-900 dark:text-stone-100 text-sm flex items-center gap-1.5">
                                        {{ $user->name }}
                                        @if($user->id === auth()->id())
                                            <span class="bg-amber-500/10 text-amber-800 dark:text-amber-400 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider">You</span>
                                        @endif
                                    </h4>
                                    <p class="text-stone-400 text-xs font-medium">{{ $user->email }}</p>
                                </div>
                            </div>
                        </td>

                        <!-- Auth Level -->
                        <td class="px-6 py-5 whitespace-nowrap">
                            @if($user->is_admin)
                                <span class="inline-flex items-center gap-1 bg-amber-500/10 text-amber-800 dark:text-amber-400 px-3 py-1 rounded-full font-bold text-[10px] uppercase tracking-widest border border-amber-500/10">
                                    <span class="material-symbols-outlined text-[12px] text-amber-500 font-bold">verified_user</span>
                                    Administrator
                                </span>
                            @else
                                <span class="inline-flex items-center gap-1 bg-stone-100 dark:bg-stone-850 text-stone-600 dark:text-stone-300 px-3 py-1 rounded-full font-bold text-[10px] uppercase tracking-widest border border-transparent">
                                    <span class="material-symbols-outlined text-[12px] text-stone-400">person</span>
                                    Customer
                                </span>
                            @endif
                        </td>

                        <!-- Registered Date -->
                        <td class="px-6 py-5 text-stone-500 font-semibold whitespace-nowrap">
                            {{ $user->created_at ? $user->created_at->format('M d, Y') : 'Unknown' }}
                            <span class="block text-[10px] text-stone-400 font-medium">{{ $user->created_at ? $user->created_at->diffForHumans() : '' }}</span>
                        </td>

                        <!-- Room Audits -->
                        <td class="px-6 py-5 text-center font-bold text-stone-800 dark:text-stone-200">
                            {{ $user->room_images_count ?? 0 }}
                        </td>

                        <!-- Placed Orders -->
                        <td class="px-6 py-5 text-center whitespace-nowrap">
                            <span class="inline-flex items-center justify-center min-w-[24px] h-[24px] bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 rounded-full font-extrabold text-xs">
                                {{ $user->orders_count ?? 0 }}
                            </span>
                        </td>

                        <!-- Action Buttons -->
                        <td class="px-6 py-5 text-right whitespace-nowrap">
                            <div class="flex items-center justify-end gap-2">
                                <a href="mailto:{{ $user->email }}" title="Contact Curator" class="p-2 rounded-xl bg-stone-50 hover:bg-stone-100 dark:bg-stone-900 dark:hover:bg-stone-850 text-stone-500 hover:text-primary border border-stone-200/50 dark:border-stone-800 transition-colors">
                                    <span class="material-symbols-outlined text-[16px]">mail</span>
                                </a>
                                @if($user->id !== auth()->id())
                                    <button onclick="simulateAction('{{ $user->name }}')" title="Modify Profile Permissions" class="p-2 rounded-xl bg-stone-50 hover:bg-stone-100 dark:bg-stone-900 dark:hover:bg-stone-850 text-stone-500 hover:text-amber-600 border border-stone-200/50 dark:border-stone-800 transition-colors">
                                        <span class="material-symbols-outlined text-[16px]">manage_accounts</span>
                                    </button>
                                @endif
                            </div>
                        </td>
                    </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
        
        <!-- Live Table Empty State -->
        <div id="noUsersState" class="hidden py-20 text-center border border-dashed border-stone-200 dark:border-stone-800 rounded-3xl mt-6">
            <div class="w-16 h-16 bg-stone-100 dark:bg-stone-900 rounded-full flex items-center justify-center mb-4 mx-auto text-stone-400">
                <span class="material-symbols-outlined text-3xl">search_off</span>
            </div>
            <h4 class="font-bold text-stone-900 dark:text-stone-100 text-sm">No curators match the filter criteria</h4>
            <p class="text-stone-400 text-xs mt-1">Try resetting the filters or modifying your search term.</p>
        </div>
        </div> <!-- End panelUsers -->

        <!-- panelOrders -->
        <div id="panelOrders" class="hidden animate-fade-in">
            <!-- Orders Header Actions -->
            <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
                <div>
                    <h2 class="font-headline-md text-xl text-primary font-bold">Orders &amp; Transactions Ledger</h2>
                    <p class="text-stone-400 text-xs mt-1">Real-time ledger of completed checkouts, Razorpay IDs, and custom design parameters.</p>
                </div>

                <!-- Orders Filter & Search bar -->
                <div class="flex flex-col sm:flex-row gap-4 w-full lg:w-auto flex-1 justify-end">
                    <!-- Live Search Box for Orders -->
                    <div class="relative flex-1 max-w-sm">
                        <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 text-[20px]">search</span>
                        <input type="text" id="orderSearchInput" placeholder="Search by order#, name, payID..." class="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-850 px-11 py-2.5 rounded-2xl text-xs text-primary focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/20 font-semibold transition-all">
                    </div>

                    <!-- Live Status Filter Chips -->
                    <div class="flex bg-stone-50 dark:bg-stone-900 p-1 rounded-2xl border border-stone-200/65 dark:border-stone-850 self-start">
                        <button onclick="filterOrdersByStatus('all', this)" class="order-filter-btn px-4 py-2 bg-white dark:bg-stone-950 text-stone-800 dark:text-stone-100 font-semibold rounded-xl text-xs shadow-sm transition-all whitespace-nowrap">
                            All
                        </button>
                        <button onclick="filterOrdersByStatus('placed', this)" class="order-filter-btn px-4 py-2 text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 font-semibold rounded-xl text-xs transition-all whitespace-nowrap">
                            Placed
                        </button>
                        <button onclick="filterOrdersByStatus('processing', this)" class="order-filter-btn px-4 py-2 text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 font-semibold rounded-xl text-xs transition-all whitespace-nowrap">
                            Processing
                        </button>
                        <button onclick="filterOrdersByStatus('shipping', this)" class="order-filter-btn px-4 py-2 text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 font-semibold rounded-xl text-xs transition-all whitespace-nowrap">
                            Shipping
                        </button>
                        <button onclick="filterOrdersByStatus('delivered', this)" class="order-filter-btn px-4 py-2 text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 font-semibold rounded-xl text-xs transition-all whitespace-nowrap">
                            Delivered
                        </button>
                    </div>
                </div>
            </div>

            <!-- Orders Table -->
            <div class="overflow-x-auto rounded-3xl border border-stone-100 dark:border-stone-900">
                <table class="w-full border-collapse text-left text-xs min-w-[1000px]">
                    <thead>
                        <tr class="bg-stone-50/75 dark:bg-stone-900/60 border-b border-stone-100 dark:border-stone-900 text-stone-400 font-semibold uppercase tracking-wider">
                            <th class="px-6 py-4">Order Code &amp; Date</th>
                            <th class="px-6 py-4">Customer Contact</th>
                            <th class="px-6 py-4">Item(s) &amp; Custom Curation Specs</th>
                            <th class="px-6 py-4">Transaction Reference</th>
                            <th class="px-6 py-4">Order Value</th>
                            <th class="px-6 py-4">Lifecycle Status</th>
                        </tr>
                    </thead>
                    <tbody id="ordersTableBody" class="divide-y divide-stone-50 dark:divide-stone-900">
                        @forelse($orders as $order)
                        <tr class="order-row hover:bg-stone-50/40 dark:hover:bg-stone-900/20 transition-colors"
                            data-number="{{ $order->order_number }}"
                            data-name="{{ $order->customer_name }}"
                            data-payid="{{ $order->payment_id }}"
                            data-status="{{ $order->status }}">
                            
                            <!-- Order Code & Date -->
                            <td class="px-6 py-5 whitespace-nowrap">
                                <span class="block font-bold text-stone-900 dark:text-stone-100 text-sm font-mono">{{ $order->order_number }}</span>
                                <span class="block text-[10px] text-stone-400 font-semibold mt-1 flex items-center gap-1">
                                    <span class="material-symbols-outlined text-[12px] text-stone-500 dark:text-stone-400">calendar_today</span>
                                    {{ $order->created_at ? $order->created_at->format('M d, Y h:i A') : 'N/A' }}
                                </span>
                            </td>
                            
                            <!-- Customer Contact -->
                            <td class="px-6 py-5">
                                <div class="space-y-1">
                                    <h4 class="font-bold text-stone-900 dark:text-stone-100">{{ $order->customer_name }}</h4>
                                    <p class="text-[11px] text-stone-500 font-medium flex items-center gap-1">
                                        <span class="material-symbols-outlined text-[12px] text-stone-400">mail</span>
                                        {{ $order->customer_email }}
                                    </p>
                                    <p class="text-[11px] text-stone-500 font-medium flex items-center gap-1">
                                        <span class="material-symbols-outlined text-[12px] text-stone-400">call</span>
                                        {{ $order->customer_phone }}
                                    </p>
                                    <details class="cursor-pointer group mt-1.5">
                                        <summary class="text-[10px] font-bold text-emerald-800 dark:text-emerald-400 select-none hover:underline flex items-center gap-0.5 list-none outline-none">
                                            View Shipping Address
                                            <span class="material-symbols-outlined text-[12px] group-open:rotate-180 transition-transform">expand_more</span>
                                        </summary>
                                        <p class="text-[10px] text-stone-500 bg-stone-50 dark:bg-stone-900/60 p-2.5 rounded-xl border border-stone-200/50 dark:border-stone-850 mt-1 max-w-[200px] leading-relaxed">
                                            {{ $order->shipping_address }}
                                        </p>
                                    </details>
                                </div>
                            </td>

                            <!-- Items and Custom Specs -->
                            <td class="px-6 py-5">
                                @if($order->custom_design_id && $order->customDesign)
                                    <div class="flex items-center gap-3">
                                        <div class="w-12 h-12 rounded-xl overflow-hidden bg-stone-150 border border-stone-100 dark:border-stone-900 flex-shrink-0 flex items-center justify-center relative">
                                            @if($order->customDesign->room_image_path)
                                                <img src="{{ asset('storage/' . $order->customDesign->room_image_path) }}" class="w-full h-full object-cover">
                                            @else
                                                <span class="material-symbols-outlined text-stone-400 text-lg">image</span>
                                            @endif
                                        </div>
                                        <div class="space-y-0.5">
                                            <div class="flex items-center gap-1.5">
                                                <span class="bg-amber-500/10 text-amber-800 dark:text-amber-400 px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider">Bespoke Custom</span>
                                                <span class="text-stone-400 font-mono text-[9px]">ID: {{ $order->customDesign->id }}</span>
                                            </div>
                                            <h4 class="font-bold text-stone-900 dark:text-stone-100 text-xs mt-0.5">
                                                {{ $order->customDesign->product->name ?? 'Wall Decor Curation' }}
                                            </h4>
                                            <div class="text-[10px] text-stone-500 dark:text-stone-400 font-semibold space-x-1.5 mt-1">
                                                <span>Size: {{ $order->customDesign->design_json['size'] ?? 'A3' }}</span>
                                                <span>Frame: {{ ucfirst($order->customDesign->design_json['frame_style'] ?? 'None') }}</span>
                                            </div>
                                        </div>
                                    </div>
                                @elseif($order->cart_items && is_array($order->cart_items))
                                    <div class="space-y-2 max-w-[280px]">
                                        <div class="flex items-center gap-1.5">
                                            <span class="bg-emerald-500/10 text-emerald-800 dark:text-emerald-450 px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider">Multi-Item Cart</span>
                                            <span class="text-stone-400 dark:text-stone-300 font-semibold text-[9px]">{{ count($order->cart_items) }} unit(s)</span>
                                        </div>
                                        <div class="divide-y divide-stone-100/60 dark:divide-stone-900/50">
                                            @foreach($order->cart_items as $item)
                                            <div class="py-1 flex items-center justify-between text-[11px]">
                                                <div class="flex items-center gap-1.5 truncate max-w-[200px]">
                                                    <div class="w-6 h-6 rounded bg-stone-100 overflow-hidden flex-shrink-0">
                                                        <img src="{{ $item['image'] ?? 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=100&q=80' }}" class="w-full h-full object-cover">
                                                    </div>
                                                    <span class="font-semibold text-stone-800 dark:text-stone-200 truncate">{{ $item['name'] }}</span>
                                                    <span class="text-stone-400">x{{ $item['qty'] }}</span>
                                                </div>
                                                <span class="font-bold text-stone-600 dark:text-stone-300 font-mono text-[10px]">₹{{ number_format($item['price'] * $item['qty'], 2) }}</span>
                                            </div>
                                            @endforeach
                                        </div>
                                    </div>
                                @else
                                    <span class="text-stone-400 text-xs italic">No items detailed</span>
                                @endif
                            </td>

                            <!-- Transaction Reference -->
                            <td class="px-6 py-5 whitespace-nowrap">
                                <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/15 text-emerald-800 dark:text-emerald-400 font-bold text-[10px] uppercase tracking-wider mb-2">
                                    <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                    Secured Paid
                                </span>
                                <div class="flex items-center gap-1.5">
                                    <span class="material-symbols-outlined text-[14px] text-[#2d72d9]">payments</span>
                                    <span class="font-mono text-stone-500 font-semibold text-[10px]" title="Razorpay Reference ID">{{ $order->payment_id ?? 'Direct mandate' }}</span>
                                </div>
                            </td>

                            <!-- Order Value -->
                            <td class="px-6 py-5 whitespace-nowrap font-extrabold text-sm font-mono">
                                @if($order->status === 'cancelled')
                                    <span class="line-through text-stone-400">₹{{ number_format((float) $order->total_price, 2) }}</span>
                                    <span class="block text-[10px] text-rose-600 dark:text-rose-400 font-bold mt-1">-₹{{ number_format((float) $order->total_price, 2) }} Lost</span>
                                @else
                                    <span class="text-stone-900 dark:text-stone-100">₹{{ number_format((float) $order->total_price, 2) }}</span>
                                @endif
                            </td>

                            <!-- Lifecycle Status -->
                            <td class="px-6 py-5 whitespace-nowrap">
                                <form action="{{ route('admin.orders.update', $order->id) }}" method="POST" class="inline-block relative">
                                    @csrf
                                    @method('PATCH')
                                    <select name="status" onchange="this.form.submit()" 
                                            class="bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl px-3.5 py-2 font-semibold text-xs text-primary focus:outline-none focus:border-emerald-600/70 focus:ring-1 focus:ring-emerald-500/20 cursor-pointer shadow-sm transition-all
                                            {{ $order->status === 'placed' ? 'border-amber-400 text-amber-700 bg-amber-50/20' : '' }}
                                            {{ $order->status === 'processing' ? 'border-blue-400 text-blue-700 bg-blue-50/20' : '' }}
                                            {{ $order->status === 'shipping' ? 'border-indigo-400 text-indigo-700 bg-indigo-50/20' : '' }}
                                            {{ $order->status === 'delivered' ? 'border-emerald-500 text-emerald-700 bg-emerald-50/20' : '' }}
                                            {{ $order->status === 'cancelled' ? 'border-rose-400 text-rose-700 bg-rose-50/20' : '' }}">
                                        <option value="placed" {{ $order->status === 'placed' ? 'selected' : '' }}>Placed</option>
                                        <option value="processing" {{ $order->status === 'processing' ? 'selected' : '' }}>Processing</option>
                                        <option value="shipping" {{ $order->status === 'shipping' ? 'selected' : '' }}>Shipping</option>
                                        <option value="delivered" {{ $order->status === 'delivered' ? 'selected' : '' }}>Delivered</option>
                                        <option value="cancelled" {{ $order->status === 'cancelled' ? 'selected' : '' }}>Cancelled</option>
                                    </select>
                                </form>
                            </td>
                        </tr>
                        @empty
                        <tr>
                            <td colspan="6" class="py-16 text-center">
                                <div class="w-12 h-12 bg-stone-100 dark:bg-stone-900 rounded-full flex items-center justify-center mb-3 mx-auto text-stone-400">
                                    <span class="material-symbols-outlined text-2xl">receipt_long</span>
                                </div>
                                <h4 class="font-bold text-stone-900 dark:text-stone-100 text-xs">No transactions recorded yet</h4>
                                <p class="text-stone-400 text-[10px] mt-0.5">Purchases placed via Cart and Visualizer checkout will ledger here.</p>
                            </td>
                        </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>

            <!-- Live Orders Empty State -->
            <div id="noOrdersState" class="hidden py-20 text-center border border-dashed border-stone-200 dark:border-stone-800 rounded-3xl mt-6">
                <div class="w-16 h-16 bg-stone-100 dark:bg-stone-900 rounded-full flex items-center justify-center mb-4 mx-auto text-stone-400">
                    <span class="material-symbols-outlined text-3xl">search_off</span>
                </div>
                <h4 class="font-bold text-stone-900 dark:text-stone-100 text-sm">No ledger entries match the query</h4>
                <p class="text-stone-400 text-xs mt-1">Try resetting the filter chips or adjusting search parameters.</p>
            </div>
        </div> <!-- End panelOrders -->

        <!-- panelProducts -->
        <div id="panelProducts" class="hidden animate-fade-in">
            <!-- Products Header Actions -->
            <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
                <div>
                    <h2 class="font-headline-md text-xl text-primary font-bold">Products Curation Ledger</h2>
                    <p class="text-stone-400 text-xs mt-1">Manage active collection inventory states, physical stock levels, and store curated coordinates.</p>
                </div>

                <!-- Action Button to trigger Add Modal -->
                <div>
                    <button onclick="openAddProductModal()" class="px-6 py-3.5 rounded-full bg-emerald-950 text-white dark:bg-emerald-900 font-bold text-xs hover:opacity-90 shadow-md flex items-center gap-2 transition-all">
                        <span class="material-symbols-outlined text-[18px]">add_circle</span>
                        Add New Masterpiece
                    </button>
                </div>
            </div>

            <!-- Products Table -->
            <div class="overflow-x-auto rounded-3xl border border-stone-100 dark:border-stone-900">
                <table class="w-full border-collapse text-left text-xs min-w-[900px]">
                    <thead>
                        <tr class="bg-stone-50/75 dark:bg-stone-900/60 border-b border-stone-100 dark:border-stone-900 text-stone-400 font-semibold uppercase tracking-wider">
                            <th class="px-6 py-4">Preview</th>
                            <th class="px-6 py-4">Name &amp; Description</th>
                            <th class="px-6 py-4">Category</th>
                            <th class="px-6 py-4">Base Price (INR)</th>
                            <th class="px-6 py-4 text-center">Stock Inventory</th>
                            <th class="px-6 py-4 text-center">Store Visibility</th>
                            <th class="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-stone-50 dark:divide-stone-900">
                        @forelse($products as $prod)
                        <tr class="hover:bg-stone-50/40 dark:hover:bg-stone-900/20 transition-colors">
                            <!-- Preview Image -->
                            <td class="px-6 py-5 whitespace-nowrap">
                                <div class="w-14 h-14 rounded-2xl overflow-hidden bg-stone-100 dark:bg-stone-900 border border-stone-150 dark:border-stone-850 shadow-inner flex-shrink-0 flex items-center justify-center">
                                    <img src="{{ $prod->image_path }}" class="w-full h-full object-cover">
                                </div>
                            </td>

                            <!-- Name & Description -->
                            <td class="px-6 py-5 max-w-sm">
                                <h4 class="font-bold text-stone-900 dark:text-stone-100 text-sm mb-1">{{ $prod->name }}</h4>
                                <p class="text-stone-400 dark:text-stone-550 text-[11px] leading-relaxed line-clamp-2" title="{{ $prod->description }}">{{ $prod->description }}</p>
                            </td>

                            <!-- Category -->
                            <td class="px-6 py-5 whitespace-nowrap">
                                @php
                                    $catPills = [
                                        'Wall Decor'          => 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20',
                                        'Lighting'            => 'bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-500/20',
                                        'Soft Furnishings'    => 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20',
                                        'Decorative Accents'  => 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-500/20',
                                        'Rugs & Mats'         => 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20',
                                    ];
                                    $pillStyle = $catPills[$prod->category] ?? 'bg-stone-500/10 text-stone-700 dark:text-stone-300 border-stone-500/20';
                                @endphp
                                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border {{ $pillStyle }}">
                                    {{ $prod->category }}
                                </span>
                            </td>

                            <!-- Price -->
                            <td class="px-6 py-5 whitespace-nowrap font-mono font-bold text-stone-900 dark:text-stone-100">
                                ₹{{ number_format($prod->base_price, 2) }}
                            </td>

                            <!-- Stock toggle -->
                            <td class="px-6 py-5 text-center whitespace-nowrap">
                                <form action="{{ route('admin.products.toggle-stock', $prod->id) }}" method="POST" class="inline-block">
                                    @csrf
                                    @method('PATCH')
                                    <button type="submit" class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold text-[10px] uppercase tracking-wider transition-all border
                                        {{ $prod->in_stock 
                                            ? 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-500/20 hover:bg-emerald-500/20' 
                                            : 'bg-rose-500/10 text-rose-800 dark:text-rose-300 border-rose-500/20 hover:bg-rose-500/20' }}">
                                        <span class="material-symbols-outlined text-[14px]">
                                            {{ $prod->in_stock ? 'check_circle' : 'cancel' }}
                                        </span>
                                        {{ $prod->in_stock ? 'In Stock' : 'Out of Stock' }}
                                    </button>
                                </form>
                            </td>

                            <!-- Active toggle -->
                            <td class="px-6 py-5 text-center whitespace-nowrap">
                                <form action="{{ route('admin.products.toggle-active', $prod->id) }}" method="POST" class="inline-block">
                                    @csrf
                                    @method('PATCH')
                                    <button type="submit" class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold text-[10px] uppercase tracking-wider transition-all border
                                        {{ $prod->is_active 
                                            ? 'bg-blue-500/10 text-blue-800 dark:text-blue-300 border-blue-500/20 hover:bg-blue-500/20' 
                                            : 'bg-stone-100 dark:bg-stone-900 text-stone-550 dark:text-stone-400 border-stone-200/50 dark:border-stone-800 hover:bg-stone-200' }}">
                                        <span class="material-symbols-outlined text-[14px]">
                                            {{ $prod->is_active ? 'visibility' : 'visibility_off' }}
                                        </span>
                                        {{ $prod->is_active ? 'Visible' : 'Hidden' }}
                                    </button>
                                </form>
                            </td>

                            <!-- Delete Action -->
                            <td class="px-6 py-5 text-right whitespace-nowrap">
                                <form action="{{ route('admin.products.destroy', $prod->id) }}" method="POST" onsubmit="return confirm('Are you absolutely sure you want to permanently delete this masterpiece from the database? This action is irreversible.')" class="inline-block">
                                    @csrf
                                    @method('DELETE')
                                    <button type="submit" class="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 text-rose-600 border border-rose-200/50 dark:border-rose-900/50 transition-colors shadow-sm" title="Delete Curation">
                                        <span class="material-symbols-outlined text-[16px] flex items-center justify-center">delete</span>
                                    </button>
                                </form>
                            </td>
                        </tr>
                        @empty
                        <tr>
                            <td colspan="7" class="py-16 text-center">
                                <div class="w-12 h-12 bg-stone-100 dark:bg-stone-900 rounded-full flex items-center justify-center mb-3 mx-auto text-stone-400">
                                    <span class="material-symbols-outlined text-2xl">inventory_2</span>
                                </div>
                                <h4 class="font-bold text-stone-900 dark:text-stone-100 text-xs">No curated masterpieces registered</h4>
                                <p class="text-stone-400 text-[10px] mt-0.5">Click 'Add New Masterpiece' to begin custom catalog curation.</p>
                            </td>
                        </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>
        </div> <!-- End panelProducts -->

    </div>

    <!-- ═══════════════════════════════════════════════════════════════════════ -->
    <!-- STORE OPERATIONS COMMAND CENTRE — End-of-page live checklist           -->
    <!-- ═══════════════════════════════════════════════════════════════════════ -->
    @php
        /* ── Data snapshots for checklist ─────────────────────────── */
        $needsAction   = $orders->whereIn('status', ['placed', 'processing'])->sortBy('created_at')->values();
        $inTransit     = $orders->where('status', 'shipping')->sortByDesc('created_at')->values();
        $recentDeliv   = $orders->where('status', 'delivered')->sortByDesc('created_at')->take(5)->values();
        $outOfStock    = $products->where('in_stock', false)->values();
        $hiddenProds   = $products->where('is_active', false)->values();
    @endphp

    <div class="mt-10 mb-6 flex items-center gap-2 animate-fade-in">
        <span class="material-symbols-outlined text-[20px] text-purple-600 dark:text-purple-400">checklist_rtl</span>
        <h3 class="font-headline-sm text-xs text-stone-400 dark:text-stone-500 font-bold uppercase tracking-widest">Store Operations Command Centre</h3>
        <span class="ml-auto text-[10px] font-bold text-stone-400 dark:text-stone-600 uppercase tracking-widest">Live Status Board</span>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 pb-16 animate-fade-in">

        <!-- ① Orders Needing Attention ──────────────────────────────── -->
        <div class="bg-white/80 dark:bg-stone-950/80 backdrop-blur-md rounded-[2rem] border border-stone-100 dark:border-stone-900 whisper-shadow overflow-hidden">
            <div class="flex items-center gap-3 px-6 py-4 border-b border-stone-100 dark:border-stone-900 bg-amber-500/5 dark:bg-amber-500/10">
                <span class="material-symbols-outlined text-[20px] text-amber-600 dark:text-amber-400">pending_actions</span>
                <div class="flex-1">
                    <h4 class="font-bold text-sm text-stone-900 dark:text-stone-100">Orders Needing Action</h4>
                    <p class="text-[10px] text-stone-400">Placed or processing — move them forward</p>
                </div>
                <span class="px-2.5 py-1 rounded-full font-bold text-[10px] uppercase tracking-wider
                    {{ $needsAction->count() > 0 ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300' : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' }}">
                    {{ $needsAction->count() }}
                </span>
            </div>
            <div class="divide-y divide-stone-50 dark:divide-stone-900/60 max-h-64 overflow-y-auto">
                @forelse($needsAction as $ord)
                    @php
                        $isPlaced = $ord->status === 'placed';
                        $dotColor = $isPlaced ? 'bg-amber-400' : 'bg-blue-400';
                        $statusLabel = $isPlaced ? 'Placed — Awaiting Processing' : 'Processing — Ready to Ship';
                        $labelColor  = $isPlaced ? 'text-amber-600 dark:text-amber-400' : 'text-blue-600 dark:text-blue-400';
                    @endphp
                    <div class="flex items-start gap-4 px-6 py-3.5 hover:bg-stone-50/60 dark:hover:bg-stone-900/30 transition-colors">
                        <!-- Pulsing dot -->
                        <div class="mt-1.5 shrink-0 relative">
                            <span class="w-2.5 h-2.5 rounded-full {{ $dotColor }} block animate-pulse"></span>
                        </div>
                        <div class="flex-1 min-w-0">
                            <div class="flex items-center gap-2 flex-wrap">
                                <span class="font-bold text-xs font-mono text-stone-800 dark:text-stone-100">{{ $ord->order_number }}</span>
                                <span class="text-[9px] font-bold uppercase tracking-wider {{ $labelColor }}">{{ $statusLabel }}</span>
                            </div>
                            <p class="text-[11px] text-stone-500 mt-0.5 truncate">{{ $ord->customer_name }} · ₹{{ number_format($ord->total_price, 2) }}</p>
                            <p class="text-[10px] text-stone-400 mt-0.5">{{ $ord->created_at ? $ord->created_at->diffForHumans() : '' }}</p>
                        </div>
                        <!-- Update status form inline -->
                        <form action="{{ route('admin.orders.update', $ord->id) }}" method="POST" class="shrink-0">
                            @csrf @method('PATCH')
                            <select name="status" onchange="this.form.submit()"
                                    class="text-[10px] font-bold bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-300 rounded-xl px-2 py-1.5 cursor-pointer focus:outline-none focus:border-amber-500 transition-colors">
                                <option value="placed"     {{ $ord->status === 'placed'     ? 'selected' : '' }}>Placed</option>
                                <option value="processing" {{ $ord->status === 'processing' ? 'selected' : '' }}>Processing</option>
                                <option value="shipping"   {{ $ord->status === 'shipping'   ? 'selected' : '' }}>Shipping</option>
                                <option value="delivered"  {{ $ord->status === 'delivered'  ? 'selected' : '' }}>Delivered</option>
                                <option value="cancelled"  {{ $ord->status === 'cancelled'  ? 'selected' : '' }}>Cancelled</option>
                            </select>
                        </form>
                    </div>
                @empty
                    <div class="py-10 text-center">
                        <span class="material-symbols-outlined text-emerald-400 text-3xl">check_circle</span>
                        <p class="text-xs text-stone-400 font-semibold mt-2">All orders are up to date!</p>
                    </div>
                @endforelse
            </div>
        </div>

        <!-- ② Stock Health ──────────────────────────────────────────── -->
        <div class="bg-white/80 dark:bg-stone-950/80 backdrop-blur-md rounded-[2rem] border border-stone-100 dark:border-stone-900 whisper-shadow overflow-hidden">
            <div class="flex items-center gap-3 px-6 py-4 border-b border-stone-100 dark:border-stone-900 bg-rose-500/5 dark:bg-rose-500/10">
                <span class="material-symbols-outlined text-[20px] text-rose-600 dark:text-rose-400">inventory</span>
                <div class="flex-1">
                    <h4 class="font-bold text-sm text-stone-900 dark:text-stone-100">Stock & Visibility Status</h4>
                    <p class="text-[10px] text-stone-400">Out-of-stock or hidden products needing review</p>
                </div>
                <span class="px-2.5 py-1 rounded-full font-bold text-[10px] uppercase tracking-wider
                    {{ ($outOfStock->count() + $hiddenProds->count()) > 0 ? 'bg-rose-500/15 text-rose-700 dark:text-rose-300' : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' }}">
                    {{ $outOfStock->count() + $hiddenProds->count() }}
                </span>
            </div>
            <div class="divide-y divide-stone-50 dark:divide-stone-900/60 max-h-64 overflow-y-auto">
                @foreach($outOfStock as $p)
                    <div class="flex items-center gap-4 px-6 py-3 hover:bg-stone-50/60 dark:hover:bg-stone-900/30 transition-colors">
                        <div class="w-8 h-8 rounded-xl overflow-hidden bg-stone-100 shrink-0">
                            <img src="{{ $p->image_path }}" class="w-full h-full object-cover">
                        </div>
                        <div class="flex-1 min-w-0">
                            <p class="text-xs font-bold text-stone-800 dark:text-stone-100 truncate">{{ $p->name }}</p>
                            <p class="text-[10px] text-stone-400">{{ $p->category }}</p>
                        </div>
                        <div class="shrink-0 flex flex-col items-end gap-1">
                            <span class="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/20 px-2 py-0.5 rounded-full">
                                <span class="material-symbols-outlined text-[10px]">block</span> Out of Stock
                            </span>
                            <!-- Quick re-stock toggle -->
                            <form action="{{ route('admin.products.toggle-stock', $p->id) }}" method="POST" class="inline">
                                @csrf @method('PATCH')
                                <button type="submit" class="text-[9px] font-bold text-emerald-600 hover:underline">Mark In Stock ↗</button>
                            </form>
                        </div>
                    </div>
                @endforeach
                @foreach($hiddenProds as $p)
                    <div class="flex items-center gap-4 px-6 py-3 hover:bg-stone-50/60 dark:hover:bg-stone-900/30 transition-colors">
                        <div class="w-8 h-8 rounded-xl overflow-hidden bg-stone-100 shrink-0">
                            <img src="{{ $p->image_path }}" class="w-full h-full object-cover opacity-50">
                        </div>
                        <div class="flex-1 min-w-0">
                            <p class="text-xs font-bold text-stone-500 truncate">{{ $p->name }}</p>
                            <p class="text-[10px] text-stone-400">{{ $p->category }}</p>
                        </div>
                        <div class="shrink-0 flex flex-col items-end gap-1">
                            <span class="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider bg-stone-100 dark:bg-stone-900 text-stone-500 border border-stone-200 dark:border-stone-800 px-2 py-0.5 rounded-full">
                                <span class="material-symbols-outlined text-[10px]">visibility_off</span> Hidden
                            </span>
                            <form action="{{ route('admin.products.toggle-active', $p->id) }}" method="POST" class="inline">
                                @csrf @method('PATCH')
                                <button type="submit" class="text-[9px] font-bold text-blue-600 hover:underline">Make Visible ↗</button>
                            </form>
                        </div>
                    </div>
                @endforeach
                @if($outOfStock->isEmpty() && $hiddenProds->isEmpty())
                    <div class="py-10 text-center">
                        <span class="material-symbols-outlined text-emerald-400 text-3xl">verified</span>
                        <p class="text-xs text-stone-400 font-semibold mt-2">All products are live and in stock!</p>
                    </div>
                @endif
            </div>
        </div>

        <!-- ③ In Transit ────────────────────────────────────────────── -->
        <div class="bg-white/80 dark:bg-stone-950/80 backdrop-blur-md rounded-[2rem] border border-stone-100 dark:border-stone-900 whisper-shadow overflow-hidden">
            <div class="flex items-center gap-3 px-6 py-4 border-b border-stone-100 dark:border-stone-900 bg-indigo-500/5 dark:bg-indigo-500/10">
                <span class="material-symbols-outlined text-[20px] text-indigo-600 dark:text-indigo-400">local_shipping</span>
                <div class="flex-1">
                    <h4 class="font-bold text-sm text-stone-900 dark:text-stone-100">Orders In Transit</h4>
                    <p class="text-[10px] text-stone-400">Shipped — awaiting customer confirmation</p>
                </div>
                <span class="px-2.5 py-1 rounded-full font-bold text-[10px] uppercase tracking-wider bg-indigo-500/10 text-indigo-700 dark:text-indigo-300">
                    {{ $inTransit->count() }}
                </span>
            </div>
            <div class="divide-y divide-stone-50 dark:divide-stone-900/60 max-h-64 overflow-y-auto">
                @forelse($inTransit as $ord)
                    <div class="flex items-start gap-4 px-6 py-3.5 hover:bg-stone-50/60 dark:hover:bg-stone-900/30 transition-colors">
                        <div class="mt-1 shrink-0">
                            <span class="material-symbols-outlined text-[18px] text-indigo-500">local_shipping</span>
                        </div>
                        <div class="flex-1 min-w-0">
                            <div class="flex items-center gap-2">
                                <span class="font-bold text-xs font-mono text-stone-800 dark:text-stone-100">{{ $ord->order_number }}</span>
                            </div>
                            <p class="text-[11px] text-stone-500 mt-0.5 truncate">{{ $ord->customer_name }} · {{ $ord->customer_phone }}</p>
                            <p class="text-[10px] text-stone-400 font-mono mt-0.5">₹{{ number_format($ord->total_price, 2) }} · {{ $ord->created_at?->diffForHumans() }}</p>
                        </div>
                        <!-- Mark delivered inline -->
                        <form action="{{ route('admin.orders.update', $ord->id) }}" method="POST" class="shrink-0">
                            @csrf @method('PATCH')
                            <input type="hidden" name="status" value="delivered">
                            <button type="submit"
                                    class="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 px-3 py-1.5 rounded-full transition-all">
                                <span class="material-symbols-outlined text-[12px]">check_circle</span>
                                Mark Delivered
                            </button>
                        </form>
                    </div>
                @empty
                    <div class="py-10 text-center">
                        <span class="material-symbols-outlined text-stone-300 dark:text-stone-700 text-3xl">inbox</span>
                        <p class="text-xs text-stone-400 font-semibold mt-2">No orders currently in transit.</p>
                    </div>
                @endforelse
            </div>
        </div>

        <!-- ④ Recently Delivered ────────────────────────────────────── -->
        <div class="bg-white/80 dark:bg-stone-950/80 backdrop-blur-md rounded-[2rem] border border-stone-100 dark:border-stone-900 whisper-shadow overflow-hidden">
            <div class="flex items-center gap-3 px-6 py-4 border-b border-stone-100 dark:border-stone-900 bg-emerald-500/5 dark:bg-emerald-500/10">
                <span class="material-symbols-outlined text-[20px] text-emerald-600 dark:text-emerald-400">check_circle</span>
                <div class="flex-1">
                    <h4 class="font-bold text-sm text-stone-900 dark:text-stone-100">Recently Delivered</h4>
                    <p class="text-[10px] text-stone-400">Completed orders — successfully fulfilled</p>
                </div>
                <span class="px-2.5 py-1 rounded-full font-bold text-[10px] uppercase tracking-wider bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                    {{ $recentDeliv->count() }}
                </span>
            </div>
            <div class="divide-y divide-stone-50 dark:divide-stone-900/60 max-h-64 overflow-y-auto">
                @forelse($recentDeliv as $ord)
                    <div class="flex items-start gap-4 px-6 py-3.5 hover:bg-stone-50/60 dark:hover:bg-stone-900/30 transition-colors">
                        <!-- Delivered checkmark -->
                        <div class="mt-0.5 shrink-0 w-7 h-7 rounded-full bg-emerald-500/10 flex items-center justify-center">
                            <span class="material-symbols-outlined text-[16px] text-emerald-600 dark:text-emerald-400">done</span>
                        </div>
                        <div class="flex-1 min-w-0">
                            <div class="flex items-center gap-2 flex-wrap">
                                <span class="font-bold text-xs font-mono text-stone-800 dark:text-stone-100">{{ $ord->order_number }}</span>
                                @if($ord->custom_design_id)
                                    <span class="text-[9px] font-bold uppercase tracking-wider bg-purple-500/10 text-purple-600 dark:text-purple-300 border border-purple-500/20 px-1.5 py-0.5 rounded-full">Bespoke</span>
                                @endif
                            </div>
                            <p class="text-[11px] text-stone-500 mt-0.5 truncate">{{ $ord->customer_name }}</p>
                            <p class="text-[10px] text-stone-400 font-mono mt-0.5">₹{{ number_format($ord->total_price, 2) }} · {{ $ord->created_at?->diffForHumans() }}</p>
                        </div>
                        <span class="shrink-0 inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 px-2.5 py-1 rounded-full mt-1">
                            Delivered ✓
                        </span>
                    </div>
                @empty
                    <div class="py-10 text-center">
                        <span class="material-symbols-outlined text-stone-300 dark:text-stone-700 text-3xl">local_shipping</span>
                        <p class="text-xs text-stone-400 font-semibold mt-2">No deliveries recorded yet.</p>
                    </div>
                @endforelse
            </div>
        </div>

    </div><!-- End Operations Command Centre grid -->
</div>


<script>
    // Global filter state and DOM references
    let userRows, noUsersState, searchInput, tableBody;
    let orderRows, noOrdersState, orderSearchInput, ordersTableBody;
    let currentRoleFilter = 'user';
    let currentOrderStatusFilter = 'all';

    // Tab switching logic
    function switchDashboardTab(tab, scroll = false) {
        const uBtn = document.getElementById('tabUsersBtn');
        const oBtn = document.getElementById('tabOrdersBtn');
        const pBtn = document.getElementById('tabProductsBtn');
        const uPanel = document.getElementById('panelUsers');
        const oPanel = document.getElementById('panelOrders');
        const pPanel = document.getElementById('panelProducts');
        
        // Dedicated admin navbar buttons
        const navUBtn = document.getElementById('navUsersBtn');
        const navOBtn = document.getElementById('navOrdersBtn');
        const navPBtn = document.getElementById('navProductsBtn');
        
        // Reset all buttons to inactive styling
        [uBtn, oBtn, pBtn].forEach(btn => {
            if (btn) {
                btn.className = "pb-3.5 font-bold text-sm text-stone-400 dark:text-stone-500 border-b-2 border-transparent hover:text-stone-700 hover:border-stone-350 transition-all flex items-center gap-2";
            }
        });
        
        [navUBtn, navOBtn, navPBtn].forEach(btn => {
            if (btn) {
                btn.className = "font-bold text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 transition-colors flex items-center gap-2 py-2 border-b-2 border-transparent h-full";
            }
        });
        
        // Hide all panels
        [uPanel, oPanel, pPanel].forEach(panel => {
            if (panel) {
                panel.classList.add('hidden');
            }
        });
        
        // Activate target tab
        if (tab === 'users') {
            if (uBtn) uBtn.className = "pb-3.5 font-bold text-sm text-amber-600 dark:text-amber-400 border-b-2 border-amber-600 dark:border-amber-400 transition-all flex items-center gap-2";
            if (navUBtn) navUBtn.className = "font-bold text-amber-600 dark:text-amber-400 transition-colors flex items-center gap-2 py-2 border-b-2 border-amber-600 dark:border-amber-400 h-full";
            if (uPanel) uPanel.classList.remove('hidden');
            localStorage.setItem('admin_tab', 'users');
        } else if (tab === 'orders') {
            if (oBtn) oBtn.className = "pb-3.5 font-bold text-sm text-amber-600 dark:text-amber-400 border-b-2 border-amber-600 dark:border-amber-400 transition-all flex items-center gap-2";
            if (navOBtn) navOBtn.className = "font-bold text-amber-600 dark:text-amber-400 transition-colors flex items-center gap-2 py-2 border-b-2 border-amber-600 dark:border-amber-400 h-full";
            if (oPanel) oPanel.classList.remove('hidden');
            localStorage.setItem('admin_tab', 'orders');
        } else if (tab === 'products') {
            if (pBtn) pBtn.className = "pb-3.5 font-bold text-sm text-amber-600 dark:text-amber-400 border-b-2 border-amber-600 dark:border-amber-400 transition-all flex items-center gap-2";
            if (navPBtn) navPBtn.className = "font-bold text-amber-600 dark:text-amber-400 transition-colors flex items-center gap-2 py-2 border-b-2 border-amber-600 dark:border-amber-400 h-full";
            if (pPanel) pPanel.classList.remove('hidden');
            localStorage.setItem('admin_tab', 'products');
        }
        
        if (scroll) {
            const section = document.getElementById('admin-tabs-nav');
            if (section) {
                const yOffset = -100; // Account for h-20 (80px) sticky admin navbar with nice padding
                const y = section.getBoundingClientRect().top + window.pageYOffset + yOffset;
                window.scrollTo({ top: y, behavior: 'smooth' });
            }
        }
    }

    // Add Product Modal control
    function openAddProductModal() {
        const modal = document.getElementById('addProductModal');
        const card = document.getElementById('addProductCard');
        if (modal && card) {
            modal.classList.remove('hidden');
            setTimeout(() => {
                modal.classList.remove('opacity-0');
                card.classList.remove('scale-95');
            }, 50);
        }
    }

    function closeAddProductModal() {
        const modal = document.getElementById('addProductModal');
        const card = document.getElementById('addProductCard');
        if (modal && card) {
            modal.classList.add('opacity-0');
            card.classList.add('scale-95');
            setTimeout(() => {
                modal.classList.add('hidden');
            }, 300);
        }
    }

    // Initialize all DOM bindings after DOM content is loaded
    document.addEventListener('DOMContentLoaded', () => {
        // Query elements for Users filter
        userRows = document.querySelectorAll('.user-row');
        noUsersState = document.getElementById('noUsersState');
        searchInput = document.getElementById('userSearchInput');
        tableBody = document.getElementById('userTableBody');

        // Query elements for Orders filter
        orderSearchInput = document.getElementById('orderSearchInput');
        ordersTableBody = document.getElementById('ordersTableBody');
        orderRows = document.querySelectorAll('.order-row');
        noOrdersState = document.getElementById('noOrdersState');

        // Add Product Modal outside click binding
        const addProductModal = document.getElementById('addProductModal');
        if (addProductModal) {
            addProductModal.addEventListener('click', function(e) {
                if (e.target === this) closeAddProductModal();
            });
        }

        // Attach user search input listener
        if (searchInput) {
            searchInput.addEventListener('input', () => {
                applyFilters();
            });
        }

        // Attach order search input listener
        if (orderSearchInput) {
            orderSearchInput.addEventListener('input', () => {
                applyOrderFilters();
            });
        }

        // Restore saved tab on load
        const savedTab = localStorage.getItem('admin_tab');
        if (savedTab === 'orders') {
            switchDashboardTab('orders');
        } else if (savedTab === 'products') {
            switchDashboardTab('products');
        } else {
            switchDashboardTab('users');
        }

        // Apply default users/role filter on load
        applyFilters();
    });

    // Filtering users functions (global scope)
    function filterUsersByRole(role, btn) {
        currentRoleFilter = role;
        
        // Update styling of buttons
        document.querySelectorAll('.role-filter-btn').forEach(button => {
            button.classList.remove('bg-white', 'dark:bg-stone-950', 'text-stone-800', 'dark:text-stone-100', 'shadow-sm');
            button.classList.add('text-stone-500', 'hover:text-stone-800', 'dark:hover:text-stone-200');
        });
        
        if (btn) {
            btn.classList.add('bg-white', 'dark:bg-stone-950', 'text-stone-800', 'dark:text-stone-100', 'shadow-sm');
            btn.classList.remove('text-stone-500', 'hover:text-stone-800', 'dark:hover:text-stone-200');
        }

        applyFilters();
    }

    function applyFilters() {
        if (!searchInput || !userRows) return;
        const searchTerm = searchInput.value.trim().toLowerCase();
        let visibleCount = 0;

        userRows.forEach(row => {
            const name = (row.getAttribute('data-name') || '').toLowerCase();
            const email = (row.getAttribute('data-email') || '').toLowerCase();
            const isAdmin = row.getAttribute('data-is-admin') === 'true';

            // Role filtering conditions
            let matchesRole = false;
            if (currentRoleFilter === 'admin') {
                matchesRole = isAdmin;
            } else if (currentRoleFilter === 'user') {
                matchesRole = !isAdmin;
            }

            // Search filtering conditions
            const matchesSearch = name.includes(searchTerm) || email.includes(searchTerm);

            if (matchesRole && matchesSearch) {
                row.classList.remove('hidden');
                visibleCount++;
            } else {
                row.classList.add('hidden');
            }
        });

        // Toggle empty state
        if (noUsersState) {
            if (visibleCount === 0) {
                noUsersState.classList.remove('hidden');
                if (tableBody) tableBody.classList.add('hidden');
            } else {
                noUsersState.classList.add('hidden');
                if (tableBody) tableBody.classList.remove('hidden');
            }
        }
    }

    // Filtering orders functions (global scope)
    function filterOrdersByStatus(status, btn) {
        currentOrderStatusFilter = status;
        
        // Update styling of buttons
        document.querySelectorAll('.order-filter-btn').forEach(button => {
            button.classList.remove('bg-white', 'dark:bg-stone-950', 'text-stone-800', 'dark:text-stone-100', 'shadow-sm');
            button.classList.add('text-stone-500', 'hover:text-stone-800', 'dark:hover:text-stone-200');
        });
        
        if (btn) {
            btn.classList.add('bg-white', 'dark:bg-stone-950', 'text-stone-800', 'dark:text-stone-100', 'shadow-sm');
            btn.classList.remove('text-stone-500', 'hover:text-stone-800', 'dark:hover:text-stone-200');
        }

        applyOrderFilters();
    }

    function applyOrderFilters() {
        if (!orderSearchInput || !orderRows) return;
        const searchTerm = orderSearchInput.value.trim().toLowerCase();
        let visibleCount = 0;

        orderRows.forEach(row => {
            const orderNum = (row.getAttribute('data-number') || '').toLowerCase();
            const custName = (row.getAttribute('data-name') || '').toLowerCase();
            const payId = (row.getAttribute('data-payid') || '').toLowerCase();
            const status = (row.getAttribute('data-status') || '').toLowerCase();

            // Status filtering conditions
            let matchesStatus = false;
            if (currentOrderStatusFilter === 'all') {
                matchesStatus = true;
            } else {
                matchesStatus = (status === currentOrderStatusFilter);
            }

            // Search filtering conditions
            const matchesSearch = orderNum.includes(searchTerm) || custName.includes(searchTerm) || payId.includes(searchTerm);

            if (matchesStatus && matchesSearch) {
                row.classList.remove('hidden');
                visibleCount++;
            } else {
                row.classList.add('hidden');
            }
        });

        // Toggle empty state
        if (noOrdersState) {
            if (visibleCount === 0) {
                noOrdersState.classList.remove('hidden');
                if (ordersTableBody) ordersTableBody.classList.add('hidden');
            } else {
                noOrdersState.classList.add('hidden');
                if (ordersTableBody) ordersTableBody.classList.remove('hidden');
            }
        }
    }

    function simulateAction(name) {
        const toast = document.createElement('div');
        toast.innerHTML = `
            <div class="flex items-center gap-3">
                <span class="material-symbols-outlined text-amber-500">lock_person</span>
                <div>
                    <p class="font-bold text-xs">Access Level Modification Locked</p>
                    <p class="text-[10px] text-stone-400">Permissions for <strong>${name}</strong> are controlled by directory settings.</p>
                </div>
            </div>
        `;
        toast.className = 'fixed bottom-6 right-6 z-[999] bg-stone-950 text-white border border-stone-850 px-5 py-4 rounded-2xl shadow-2xl pointer-events-none transition-all';
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 4000);
    }
</script>

<!-- Elegant Add Product Modal overlay -->
<div id="addProductModal" class="fixed inset-0 z-50 hidden flex items-center justify-center p-4 bg-black/60 backdrop-blur-md transition-opacity duration-300 opacity-0">
    <div class="relative w-full max-w-xl bg-white dark:bg-stone-950 rounded-[2rem] border border-stone-200 dark:border-stone-900 shadow-2xl overflow-hidden p-8 md:p-10 transition-all transform scale-95 duration-300" id="addProductCard">
        <!-- Close button -->
        <button onclick="closeAddProductModal()" class="absolute top-6 right-6 p-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-900 text-stone-400 hover:text-stone-700 transition-colors">
            <span class="material-symbols-outlined text-[20px]">close</span>
        </button>

        <div class="mb-6">
            <span class="inline-block px-3 py-1 mb-2 rounded-full bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold uppercase tracking-widest">Storefront Expansion</span>
            <h3 class="text-2xl font-extrabold text-primary">Add New Masterpiece</h3>
            <p class="text-xs text-stone-400">Introduce a fresh artisan coordinates foundation ready for custom configuration.</p>
        </div>

        <form action="{{ route('admin.products.store') }}" method="POST" class="space-y-4">
            @csrf
            <!-- Name -->
            <div class="space-y-1.5">
                <label for="prod_name" class="block text-xs font-bold text-stone-500 uppercase tracking-wider">Product Name</label>
                <input type="text" name="name" id="prod_name" required placeholder="e.g. Wabi-Sabi Plaster Vase" class="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-850 px-4 py-3 rounded-xl text-xs text-primary focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/20 font-semibold transition-all">
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <!-- Category -->
                <div class="space-y-1.5">
                    <label for="prod_cat" class="block text-xs font-bold text-stone-500 uppercase tracking-wider">Category</label>
                    <select name="category" id="prod_cat" required class="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-850 px-4 py-3 rounded-xl text-xs text-primary focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/20 font-semibold transition-all cursor-pointer">
                        <option value="Wall Decor">Wall Décor</option>
                        <option value="Lighting">Lighting</option>
                        <option value="Soft Furnishings">Soft Furnishings</option>
                        <option value="Decorative Accents">Decorative Accents</option>
                        <option value="Rugs & Mats">Rugs & Mats</option>
                    </select>
                </div>

                <!-- Price -->
                <div class="space-y-1.5">
                    <label for="prod_price" class="block text-xs font-bold text-stone-500 uppercase tracking-wider">Base Price (INR)</label>
                    <input type="number" name="base_price" id="prod_price" required min="0" step="0.01" placeholder="e.g. 1599" class="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-850 px-4 py-3 rounded-xl text-xs text-primary focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/20 font-semibold transition-all">
                </div>
            </div>

            <!-- Image URL -->
            <div class="space-y-1.5">
                <label for="prod_img" class="block text-xs font-bold text-stone-500 uppercase tracking-wider">Image URL (Optional)</label>
                <input type="url" name="image_path" id="prod_img" placeholder="https://images.unsplash.com/... (Leaves empty for premium default)" class="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-850 px-4 py-3 rounded-xl text-xs text-primary focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/20 font-semibold transition-all">
            </div>

            <!-- Description -->
            <div class="space-y-1.5">
                <label for="prod_desc" class="block text-xs font-bold text-stone-500 uppercase tracking-wider">Description</label>
                <textarea name="description" id="prod_desc" required rows="3" placeholder="Describe the masterpiece's tactile quality, organic materials, and artisan finish..." class="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-850 px-4 py-3 rounded-xl text-xs text-primary focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/20 font-semibold transition-all resize-none"></textarea>
            </div>

            <!-- Submit -->
            <div class="pt-4">
                <button type="submit" class="w-full bg-emerald-950 dark:bg-emerald-900 text-white py-4 rounded-xl font-bold text-xs hover:opacity-90 shadow-lg flex justify-center items-center gap-1.5 transition-all">
                    <span class="material-symbols-outlined text-[16px]">verified</span>
                    Publish Masterpiece to Store
                </button>
            </div>
        </form>
    </div>
</div>
@endsection
