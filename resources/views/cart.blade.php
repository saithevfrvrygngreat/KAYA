@extends('layouts.app')

@section('content')
<div class="max-w-7xl mx-auto px-6 md:px-12 py-12 min-h-screen">

    <!-- Header -->
    <div class="mb-10">
        <span class="inline-block px-3 py-1 mb-3 rounded-full bg-emerald-500/10 text-emerald-800 text-[11px] font-bold uppercase tracking-widest">Your Selection</span>
        <h1 class="font-display-xl text-4xl md:text-5xl text-primary leading-tight">Your Cart</h1>
        <p class="text-stone-500 mt-2 text-sm">Review your items and complete your bespoke order.</p>
    </div>

    <div id="cartEmpty" class="hidden flex flex-col items-center justify-center py-24 text-center space-y-6">
        <div class="w-24 h-24 bg-stone-50 rounded-full flex items-center justify-center border border-stone-100">
            <span class="material-symbols-outlined text-stone-300 text-4xl">shopping_bag</span>
        </div>
        <h3 class="text-xl font-bold text-primary">Your cart is empty</h3>
        <p class="text-stone-500 text-sm max-w-xs">Browse our collection and add pieces to your cart to start your curation.</p>
        <a href="{{ route('products.index') }}" class="bg-emerald-950 text-white px-8 py-4 rounded-xl font-semibold hover:opacity-90 transition-all flex items-center gap-2">
            Browse Collection
            <span class="material-symbols-outlined text-[18px]">explore</span>
        </a>
    </div>

    <div id="cartContent" class="hidden grid grid-cols-1 lg:grid-cols-12 gap-10">

        <!-- Cart Items -->
        <div class="lg:col-span-7 space-y-4" id="cartItemsList"></div>

        <!-- Order Summary + Checkout -->
        <div class="lg:col-span-5 space-y-6">
            <!-- Summary card -->
            <div class="bg-white rounded-3xl p-8 border border-stone-100 whisper-shadow space-y-4">
                <h2 class="font-headline-md text-xl text-primary border-b border-stone-100 pb-4">Order Summary</h2>
                <div class="space-y-3 text-sm font-medium">
                    <div class="flex justify-between text-stone-500">
                        <span>Subtotal</span>
                        <span id="summarySubtotal">INR 0.00</span>
                    </div>
                    <div class="flex justify-between text-stone-500">
                        <span>GST (18%)</span>
                        <span id="summaryGST">INR 0.00</span>
                    </div>
                    <div class="flex justify-between text-stone-500">
                        <span>Delivery</span>
                        <span class="text-emerald-700 font-bold">FREE</span>
                    </div>
                    <div class="flex justify-between text-lg font-extrabold text-emerald-900 pt-4 border-t border-stone-100">
                        <span>Total</span>
                        <span id="summaryTotal">INR 0.00</span>
                    </div>
                </div>
                @auth
                <button onclick="openCheckout()" class="w-full bg-emerald-950 text-white py-4 rounded-xl font-bold hover:opacity-90 transition-all flex justify-center items-center gap-2 shadow-[0_0_20px_rgba(6,78,59,0.25)]">
                    Proceed to Checkout
                    <span class="material-symbols-outlined text-[18px]">arrow_forward</span>
                </button>
                @else
                <a href="{{ route('login', ['redirect' => route('cart.index')]) }}" class="w-full bg-emerald-950 text-white py-4 rounded-xl font-bold hover:opacity-90 transition-all flex justify-center items-center justify-center gap-2 shadow-[0_0_20px_rgba(6,78,59,0.25)] text-center block">
                    Login to Checkout
                    <span class="material-symbols-outlined text-[18px]">login</span>
                </a>
                @endauth
            </div>

            <!-- Trust badges -->
            <div class="bg-stone-50 rounded-2xl p-6 border border-stone-100 space-y-3">
                <div class="flex items-center gap-3 text-xs text-stone-500">
                    <span class="material-symbols-outlined text-emerald-700 text-[18px]">verified_user</span>
                    <span>256-bit SSL encrypted secure checkout</span>
                </div>
                <div class="flex items-center gap-3 text-xs text-stone-500">
                    <span class="material-symbols-outlined text-emerald-700 text-[18px]">local_shipping</span>
                    <span>Free delivery — 3-5 business days</span>
                </div>
                <div class="flex items-center gap-3 text-xs text-stone-500">
                    <span class="material-symbols-outlined text-emerald-700 text-[18px]">replay</span>
                    <span>30-day hassle-free returns</span>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Checkout Modal -->
<div id="checkoutModal" class="fixed inset-0 z-50 hidden flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
    <div class="w-full max-w-xl bg-white dark:bg-stone-950 rounded-[2rem] border border-stone-100 dark:border-stone-900 shadow-2xl overflow-hidden animate-scale-up">
        <!-- Header -->
        <div class="bg-emerald-950 px-8 py-6 flex items-center justify-between">
            <div>
                <p class="text-emerald-300 text-[10px] uppercase tracking-widest font-bold">Secure Checkout</p>
                <h3 class="text-white font-bold text-xl">Delivery Details</h3>
            </div>
            <button onclick="closeCheckout()" class="text-white/60 hover:text-white transition-colors">
                <span class="material-symbols-outlined">close</span>
            </button>
        </div>

        <!-- Form -->
        <form id="checkoutForm" action="{{ route('cart.checkout') }}" method="POST" class="p-8 space-y-5">
            @csrf
            <input type="hidden" name="cart_items" id="checkoutCartItems" value="">
            <input type="hidden" name="total_price" id="checkoutTotalPrice" value="0">
            <input type="hidden" name="payment_id" id="checkoutPaymentId" value="">

            <div class="grid grid-cols-2 gap-4">
                <div class="space-y-1.5">
                    <label class="text-xs uppercase tracking-widest font-semibold text-stone-400">Full Name</label>
                    <input name="customer_name" required type="text" placeholder="Arjun Sharma" value="{{ auth()->user()->name ?? '' }}"
                           class="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 px-4 py-3 rounded-xl focus:outline-none focus:border-emerald-600 transition-colors text-sm">
                </div>
                <div class="space-y-1.5">
                    <label class="text-xs uppercase tracking-widest font-semibold text-stone-400">Phone</label>
                    <input name="customer_phone" required type="tel" placeholder="+91 98765 43210"
                           class="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 px-4 py-3 rounded-xl focus:outline-none focus:border-emerald-600 transition-colors text-sm">
                </div>
            </div>

            <div class="space-y-1.5">
                <label class="text-xs uppercase tracking-widest font-semibold text-stone-400">Email Address</label>
                <input name="customer_email" required type="email" placeholder="arjun@example.com" value="{{ auth()->user()->email ?? '' }}"
                       class="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 px-4 py-3 rounded-xl focus:outline-none focus:border-emerald-600 transition-colors text-sm">
            </div>

            <div class="space-y-1.5">
                <label class="text-xs uppercase tracking-widest font-semibold text-stone-400">Shipping Address</label>
                <textarea name="shipping_address" required rows="3" placeholder="Flat 4B, Prestige Heights, MG Road, Bengaluru — 560001"
                          class="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 px-4 py-3 rounded-xl focus:outline-none focus:border-emerald-600 transition-colors text-sm resize-none"></textarea>
            </div>

            <div class="pt-2">
                <button type="button" onclick="startRazorpayPayment()" class="w-full flex items-center justify-center gap-3 bg-[#2d72d9] text-white py-4 rounded-xl font-bold hover:bg-[#2561c0] transition-colors shadow-lg">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M7.5 3L4 14.5H9.5L8 21L20 9.5H14L17.5 3H7.5Z" fill="white"/>
                    </svg>
                    Pay Securely with Razorpay
                </button>
                <p class="text-center text-[10px] text-stone-400 mt-2">Official Sandbox checkout with UPI, Credit Cards, Netbanking</p>
            </div>
        </form>
    </div>
</div>

<!-- Razorpay Dynamic Sandbox Modal -->
<div id="razorpayModal" class="fixed inset-0 z-[60] hidden flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-sm">
    <div class="w-full max-w-md bg-white dark:bg-stone-900 rounded-3xl overflow-hidden shadow-2xl border border-stone-100 dark:border-stone-800 flex flex-col font-sans select-none animate-scale-up">
        <!-- Razorpay Header -->
        <div class="bg-[#121c2c] px-6 py-5 flex items-center justify-between border-b border-stone-800">
            <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg bg-[#2d72d9] flex items-center justify-center text-white font-black shadow-sm">
                    R
                </div>
                <div>
                    <h3 class="text-white font-extrabold text-sm tracking-wide">Razorpay Checkout</h3>
                    <p class="text-stone-400 text-[10px] uppercase font-bold tracking-wider">KaYa Curation Covenants</p>
                </div>
            </div>
            <button onclick="closeRazorpay()" class="text-stone-400 hover:text-white transition-colors">
                <span class="material-symbols-outlined text-[20px]">close</span>
            </button>
        </div>

        <!-- Sandbox Warning Banner -->
        <div class="bg-amber-500/10 border-b border-amber-500/20 px-6 py-2 flex items-center gap-2">
            <span class="material-symbols-outlined text-amber-500 text-[14px] font-bold">terminal</span>
            <span class="text-[10px] text-amber-700 dark:text-amber-300 font-bold uppercase tracking-wider">Test Mode — No Real Money Deducted</span>
        </div>

        <!-- Dynamic Content Body -->
        <div class="p-6 flex-1 flex flex-col" id="rzpBody">
            <!-- State 1: Select Payment Methods -->
            <div id="rzpStateSelect" class="space-y-5">
                <div class="text-center py-2">
                    <p class="text-[10px] text-stone-400 uppercase tracking-widest font-bold">Transaction Value</p>
                    <p class="text-3xl font-extrabold text-stone-900 dark:text-white mt-1" id="razorpayAmount">INR 0.00</p>
                </div>

                <p class="text-xs font-bold text-stone-400 uppercase tracking-wider border-b border-stone-100 dark:border-stone-800 pb-2">Select Payment Method</p>

                <!-- Method List -->
                <div class="space-y-2">
                    <!-- Cards Option -->
                    <button onclick="switchRzpSubState('card')" class="w-full flex items-center justify-between p-4 rounded-2xl border border-stone-200 dark:border-stone-800 hover:border-[#2d72d9] hover:bg-stone-50 dark:hover:bg-stone-850 transition-all text-left">
                        <div class="flex items-center gap-3">
                            <span class="material-symbols-outlined text-[#2d72d9]">credit_card</span>
                            <div>
                                <p class="text-xs font-bold text-stone-800 dark:text-stone-200">Credit / Debit Card</p>
                                <p class="text-[10px] text-stone-400 font-medium">Visa, Mastercard, RuPay</p>
                            </div>
                        </div>
                        <span class="material-symbols-outlined text-stone-400 text-[16px]">chevron_right</span>
                    </button>

                    <!-- UPI Option -->
                    <button onclick="switchRzpSubState('upi')" class="w-full flex items-center justify-between p-4 rounded-2xl border border-stone-200 dark:border-stone-800 hover:border-[#2d72d9] hover:bg-stone-50 dark:hover:bg-stone-850 transition-all text-left">
                        <div class="flex items-center gap-3">
                            <span class="material-symbols-outlined text-emerald-600">qr_code_2</span>
                            <div>
                                <p class="text-xs font-bold text-stone-800 dark:text-stone-200">UPI / QR Code</p>
                                <p class="text-[10px] text-stone-400 font-medium">Google Pay, PhonePe, Paytm, BHIM</p>
                            </div>
                        </div>
                        <span class="material-symbols-outlined text-stone-400 text-[16px]">chevron_right</span>
                    </button>

                    <!-- Netbanking Option -->
                    <button onclick="switchRzpSubState('netbanking')" class="w-full flex items-center justify-between p-4 rounded-2xl border border-stone-200 dark:border-stone-800 hover:border-[#2d72d9] hover:bg-stone-50 dark:hover:bg-stone-850 transition-all text-left">
                        <div class="flex items-center gap-3">
                            <span class="material-symbols-outlined text-purple-600">account_balance</span>
                            <div>
                                <p class="text-xs font-bold text-stone-800 dark:text-stone-200">Netbanking</p>
                                <p class="text-[10px] text-stone-400 font-medium">SBI, HDFC, ICICI, Axis Bank</p>
                            </div>
                        </div>
                        <span class="material-symbols-outlined text-stone-400 text-[16px]">chevron_right</span>
                    </button>
                </div>
            </div>

            <!-- State 2: Card details input -->
            <div id="rzpStateCard" class="hidden space-y-4">
                <button onclick="switchRzpSubState('select')" class="inline-flex items-center gap-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 text-xs font-semibold mb-2">
                    <span class="material-symbols-outlined text-[16px]">arrow_back</span> Back to payment choices
                </button>

                <div class="space-y-1">
                    <label class="text-[10px] uppercase font-bold text-stone-400">Cardholder Name</label>
                    <input type="text" id="rzpCardName" placeholder="ARJUN SHARMA" class="w-full bg-stone-50 dark:bg-stone-850 border border-stone-200 dark:border-stone-800 rounded-xl px-4 py-2.5 text-xs text-stone-900 dark:text-white focus:outline-none focus:border-[#2d72d9]">
                </div>

                <div class="space-y-1">
                    <label class="text-[10px] uppercase font-bold text-stone-400">Card Number</label>
                    <div class="relative">
                        <input type="text" id="rzpCardNo" maxlength="19" placeholder="4111 1111 1111 1111" class="w-full bg-stone-50 dark:bg-stone-850 border border-stone-200 dark:border-stone-800 rounded-xl px-4 py-2.5 text-xs text-stone-900 dark:text-white focus:outline-none focus:border-[#2d72d9]">
                        <span class="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 text-[18px]">credit_card</span>
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div class="space-y-1">
                        <label class="text-[10px] uppercase font-bold text-stone-400">Expiry Date</label>
                        <input type="text" id="rzpCardExpiry" placeholder="12/28" class="w-full bg-stone-50 dark:bg-stone-850 border border-stone-200 dark:border-stone-800 rounded-xl px-4 py-2.5 text-xs text-stone-900 dark:text-white focus:outline-none focus:border-[#2d72d9]">
                    </div>
                    <div class="space-y-1">
                        <label class="text-[10px] uppercase font-bold text-stone-400">CVV</label>
                        <input type="password" id="rzpCardCvv" maxlength="3" placeholder="•••" class="w-full bg-stone-50 dark:bg-stone-850 border border-stone-200 dark:border-stone-800 rounded-xl px-4 py-2.5 text-xs text-stone-900 dark:text-white focus:outline-none focus:border-[#2d72d9]">
                    </div>
                </div>

                <button onclick="processRzpCardSubmit()" class="w-full mt-4 bg-[#2d72d9] text-white py-3 rounded-xl font-bold hover:bg-[#2561c0] transition-colors flex items-center justify-center gap-2">
                    <span class="material-symbols-outlined text-[18px]">lock</span>
                    Pay &amp; Authenticate
                </button>
            </div>

            <!-- State 3: UPI Input and Awaiting -->
            <div id="rzpStateUpi" class="hidden space-y-4">
                <button onclick="switchRzpSubState('select')" class="inline-flex items-center gap-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 text-xs font-semibold mb-2">
                    <span class="material-symbols-outlined text-[16px]">arrow_back</span> Back to payment choices
                </button>

                <div id="upiFormView" class="space-y-4">
                    <div class="space-y-1">
                        <label class="text-[10px] uppercase font-bold text-stone-400">Enter UPI ID</label>
                        <input type="text" id="rzpUpiId" value="customer@upi" placeholder="name@upi" class="w-full bg-stone-50 dark:bg-stone-850 border border-stone-200 dark:border-stone-800 rounded-xl px-4 py-3 text-xs text-stone-900 dark:text-white font-semibold focus:outline-none focus:border-[#2d72d9]">
                    </div>

                    <div class="flex justify-center gap-3 py-1">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/UPI-Logo-vector.svg/200px-UPI-Logo-vector.svg.png" class="h-6 object-contain filter grayscale hover:grayscale-0 transition-all" alt="UPI">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Paytm_Logo_%28standalone%29.svg/200px-Paytm_Logo_%28standalone%29.svg.png" class="h-6 object-contain filter grayscale hover:grayscale-0 transition-all" alt="Paytm">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Google_Pay_Logo.svg/200px-Google_Pay_Logo.svg.png" class="h-6 object-contain filter grayscale hover:grayscale-0 transition-all" alt="GPay">
                    </div>

                    <button onclick="triggerRzpUpiAwaiting()" class="w-full bg-[#2d72d9] text-white py-3.5 rounded-xl font-bold hover:bg-[#2561c0] transition-colors flex items-center justify-center gap-2">
                        <span class="material-symbols-outlined text-[18px]">bolt</span>
                        Initiate UPI Curation Covenants
                    </button>
                </div>

                <div id="upiAwaitingView" class="hidden flex flex-col items-center justify-center py-6 text-center space-y-4">
                    <div class="w-12 h-12 border-4 border-[#2d72d9] border-t-transparent rounded-full animate-spin"></div>
                    <div>
                        <h4 class="text-xs font-bold text-stone-800 dark:text-white">Awaiting Mobile Authentication</h4>
                        <p class="text-[10px] text-stone-400 mt-1 max-w-[240px]">We have sent a checkout request to your UPI App. Please approve the sandbox collection.</p>
                    </div>

                    <div class="bg-stone-50 dark:bg-stone-850 border border-stone-200 dark:border-stone-800 rounded-xl px-4 py-2 text-[10px] font-mono font-bold text-stone-500">
                        Remaining: <span id="upiTimer">01:59</span>
                    </div>

                    <button onclick="triggerRzpSuccessfulCheckout('UPI')" class="w-full bg-emerald-700 text-white py-2.5 rounded-xl font-bold hover:bg-emerald-800 transition-colors text-xs">
                        Approve Sandbox Transaction
                    </button>
                </div>
            </div>

            <!-- State 4: Netbanking list -->
            <div id="rzpStateNetbanking" class="hidden space-y-4">
                <button onclick="switchRzpSubState('select')" class="inline-flex items-center gap-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 text-xs font-semibold mb-2">
                    <span class="material-symbols-outlined text-[16px]">arrow_back</span> Back to payment choices
                </button>

                <p class="text-[10px] uppercase font-bold text-stone-400">Popular Banks</p>

                <div class="grid grid-cols-2 gap-2">
                    <button onclick="triggerRzpBankSimulation('State Bank of India')" class="flex items-center gap-2 p-3 rounded-xl border border-stone-200 dark:border-stone-800 text-left hover:border-[#2d72d9] hover:bg-stone-50 dark:hover:bg-stone-850">
                        <span class="w-3.5 h-3.5 rounded-full bg-sky-500 flex-shrink-0"></span>
                        <span class="text-[10px] font-bold text-stone-700 dark:text-stone-300">SBI</span>
                    </button>
                    <button onclick="triggerRzpBankSimulation('HDFC Bank')" class="flex items-center gap-2 p-3 rounded-xl border border-stone-200 dark:border-stone-800 text-left hover:border-[#2d72d9] hover:bg-stone-50 dark:hover:bg-stone-850">
                        <span class="w-3.5 h-3.5 rounded-full bg-blue-900 flex-shrink-0"></span>
                        <span class="text-[10px] font-bold text-stone-700 dark:text-stone-300">HDFC</span>
                    </button>
                    <button onclick="triggerRzpBankSimulation('ICICI Bank')" class="flex items-center gap-2 p-3 rounded-xl border border-stone-200 dark:border-stone-800 text-left hover:border-[#2d72d9] hover:bg-stone-50 dark:hover:bg-stone-850">
                        <span class="w-3.5 h-3.5 rounded-full bg-orange-700 flex-shrink-0"></span>
                        <span class="text-[10px] font-bold text-stone-700 dark:text-stone-300">ICICI</span>
                    </button>
                    <button onclick="triggerRzpBankSimulation('Axis Bank')" class="flex items-center gap-2 p-3 rounded-xl border border-stone-200 dark:border-stone-800 text-left hover:border-[#2d72d9] hover:bg-stone-50 dark:hover:bg-stone-850">
                        <span class="w-3.5 h-3.5 rounded-full bg-burgundy-900 bg-red-900 flex-shrink-0"></span>
                        <span class="text-[10px] font-bold text-stone-700 dark:text-stone-300">Axis</span>
                    </button>
                </div>
            </div>

            <!-- State 5: Netbanking Simulation approval -->
            <div id="rzpStateBankRedirect" class="hidden flex flex-col items-center justify-center py-6 text-center space-y-5">
                <span class="material-symbols-outlined text-[44px] text-amber-500 animate-bounce">security</span>
                <div>
                    <h4 class="text-xs font-bold text-stone-800 dark:text-white" id="rzpBankSimName">SBI Bank Sandbox</h4>
                    <p class="text-[10px] text-stone-400 mt-1 max-w-[240px]">This is a simulated secure bank gateway. Please authorize the payment check.</p>
                </div>

                <div class="flex gap-3 w-full max-w-[280px]">
                    <button onclick="switchRzpSubState('select')" class="flex-1 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-300 py-2.5 rounded-xl font-bold text-xs">
                        Decline
                    </button>
                    <button onclick="triggerRzpSuccessfulCheckout('Netbanking')" class="flex-1 bg-[#2d72d9] hover:bg-[#2561c0] text-white py-2.5 rounded-xl font-bold text-xs">
                        Approve Sandbox
                    </button>
                </div>
            </div>

            <!-- State 6: OTP 3D secure page -->
            <div id="rzpStateOtp" class="hidden space-y-4 text-center">
                <div class="flex justify-center mb-1">
                    <span class="material-symbols-outlined text-[#2d72d9] text-[36px] animate-pulse">lock_person</span>
                </div>
                <div>
                    <h4 class="text-xs font-bold text-stone-800 dark:text-white">3D Secure Card Verification</h4>
                    <p class="text-[10px] text-stone-400 mt-1">We have sent a verification code to your registered mobile. Enter OTP: <strong class="text-stone-900 dark:text-white">123456</strong></p>
                </div>

                <div class="max-w-[180px] mx-auto">
                    <input type="text" id="rzpOtpInput" maxlength="6" placeholder="••••••" class="w-full tracking-[1.5em] text-center font-bold bg-stone-50 dark:bg-stone-850 border border-stone-200 dark:border-stone-800 rounded-xl px-3 py-3 text-xs text-stone-900 dark:text-white focus:outline-none focus:border-[#2d72d9]">
                </div>

                <button onclick="verifyRzpOtpAndConfirm()" class="w-full bg-emerald-700 text-white py-3 rounded-xl font-bold hover:bg-emerald-800 transition-colors flex items-center justify-center gap-2">
                    <span class="material-symbols-outlined text-[18px]">verified</span>
                    Verify OTP &amp; Complete Checkout
                </button>
            </div>

            <!-- State 7: Ultimate payment processing loaders -->
            <div id="rzpStateProcessing" class="hidden flex flex-col items-center justify-center py-10 text-center space-y-4">
                <div class="w-14 h-14 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin flex items-center justify-center"></div>
                <div>
                    <h4 class="text-xs font-bold text-stone-800 dark:text-white">Processing Razorpay Transaction</h4>
                    <p class="text-[10px] text-stone-400 mt-1">Securing network protocols. Generating unique signature hashes...</p>
                </div>
            </div>

            <!-- State 8: Absolute success overlay animation -->
            <div id="rzpStateSuccess" class="hidden flex flex-col items-center justify-center py-10 text-center space-y-4">
                <div class="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500 text-emerald-600 flex items-center justify-center shadow-lg animate-scale-up">
                    <span class="material-symbols-outlined text-[40px] font-black">check</span>
                </div>
                <div>
                    <h4 class="text-sm font-bold text-stone-900 dark:text-white">Checkout Completed!</h4>
                    <p class="text-[10px] text-stone-400 mt-1" id="rzpSuccessSubtext">UPI Transaction Recorded.</p>
                </div>
            </div>
        </div>
    </div>
</div>

<script>
const CART_KEY = 'kaya_cart';

function getCart() {
    try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
    catch { return []; }
}
function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function renderCart() {
    const cart = getCart();
    const empty   = document.getElementById('cartEmpty');
    const content = document.getElementById('cartContent');
    const list    = document.getElementById('cartItemsList');

    if (cart.length === 0) {
        empty.classList.remove('hidden');
        content.classList.add('hidden');
        return;
    }
    empty.classList.add('hidden');
    content.classList.remove('hidden');

    const fallbackImage = 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=700&q=80';

    list.innerHTML = cart.map((item, idx) => `
        <div class="bg-white rounded-[2rem] p-6 border border-stone-100 whisper-shadow flex gap-5 transition-all hover:-translate-y-1">
            <div class="w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 bg-stone-100">
                <img src="${item.image || fallbackImage}" class="w-full h-full object-cover" alt="${item.name}">
            </div>
            <div class="flex-1 flex flex-col justify-between">
                <div>
                    <h3 class="font-bold text-primary text-sm">${item.name}</h3>
                    <p class="text-xs text-stone-400 mt-0.5">${item.style || 'Bespoke Custom Frame'}</p>
                    <span class="inline-block mt-1.5 px-2 py-0.5 bg-emerald-500/10 text-emerald-800 text-[9px] font-bold uppercase tracking-wider rounded-full">Artisan Craft</span>
                </div>
                <div class="flex items-center justify-between mt-3">
                    <div class="flex items-center gap-3 bg-stone-50 border border-stone-200 rounded-xl px-3 py-1.5">
                        <button onclick="updateQty(${idx}, -1)" class="text-stone-400 hover:text-emerald-800 transition-colors font-bold text-lg leading-none">−</button>
                        <span class="text-sm font-bold text-primary min-w-[20px] text-center">${item.qty}</span>
                        <button onclick="updateQty(${idx}, +1)" class="text-stone-400 hover:text-emerald-800 transition-colors font-bold text-lg leading-none">+</button>
                    </div>
                    <div class="flex items-center gap-4">
                        <span class="font-extrabold text-emerald-900 text-sm">INR ${(item.price * item.qty).toLocaleString('en-IN', {minimumFractionDigits: 2})}</span>
                        <button onclick="removeItem(${idx})" class="text-stone-300 hover:text-rose-500 transition-colors">
                            <span class="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');

    updateSummary(cart);
}

function updateSummary(cart) {
    const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
    const gst      = subtotal * 0.18;
    const total    = subtotal + gst;

    document.getElementById('summarySubtotal').textContent = 'INR ' + subtotal.toLocaleString('en-IN', {minimumFractionDigits: 2});
    document.getElementById('summaryGST').textContent      = 'INR ' + gst.toLocaleString('en-IN', {minimumFractionDigits: 2});
    document.getElementById('summaryTotal').textContent    = 'INR ' + total.toLocaleString('en-IN', {minimumFractionDigits: 2});
}

function updateQty(idx, delta) {
    const cart = getCart();
    cart[idx].qty = Math.max(1, cart[idx].qty + delta);
    saveCart(cart);
    renderCart();
}

function removeItem(idx) {
    const cart = getCart();
    cart.splice(idx, 1);
    saveCart(cart);
    renderCart();
    updateNavCartCount();
}

function updateNavCartCount() {
    const count = getCart().reduce((s, i) => s + i.qty, 0);
    document.querySelectorAll('.cart-count-badge').forEach(el => {
        el.textContent = count;
        el.classList.toggle('hidden', count === 0);
    });
}

function openCheckout() {
    const cart = getCart();
    if (!cart.length) return;
    const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
    const total    = subtotal * 1.18;

    document.getElementById('checkoutCartItems').value  = JSON.stringify(cart);
    document.getElementById('checkoutTotalPrice').value = total.toFixed(2);

    document.getElementById('checkoutModal').classList.remove('hidden');
}

function closeCheckout() {
    document.getElementById('checkoutModal').classList.add('hidden');
}

let upiTimerInterval = null;

function openRazorpay() {
    const total = parseFloat(document.getElementById('checkoutTotalPrice').value || 0);
    document.getElementById('razorpayAmount').textContent = 'INR ' + total.toLocaleString('en-IN', {minimumFractionDigits: 2});
    document.getElementById('razorpayModal').classList.remove('hidden');
}

function closeRazorpay() {
    if (upiTimerInterval) {
        clearInterval(upiTimerInterval);
        upiTimerInterval = null;
    }
    document.getElementById('razorpayModal').classList.add('hidden');
}

function startRazorpayPayment() {
    const form = document.getElementById('checkoutForm');
    
    // Validate delivery details HTML5 constraints
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    closeCheckout();
    openRazorpay();
    switchRzpSubState('select');
}

function switchRzpSubState(state) {
    if (upiTimerInterval) {
        clearInterval(upiTimerInterval);
        upiTimerInterval = null;
    }
    
    const states = ['Select', 'Card', 'Upi', 'Netbanking', 'BankRedirect', 'Otp', 'Processing', 'Success'];
    states.forEach(s => {
        const el = document.getElementById('rzpState' + s);
        if (el) el.classList.add('hidden');
    });
    
    const targetId = 'rzpState' + state.charAt(0).toUpperCase() + state.slice(1);
    const target = document.getElementById(targetId);
    if (target) {
        target.classList.remove('hidden');
    }
    
    if (state === 'upi') {
        document.getElementById('upiFormView').classList.remove('hidden');
        document.getElementById('upiAwaitingView').classList.add('hidden');
    }
}

function processRzpCardSubmit() {
    const cardholder = document.getElementById('rzpCardName').value.trim();
    const cardno = document.getElementById('rzpCardNo').value.trim();
    const expiry = document.getElementById('rzpCardExpiry').value.trim();
    const cvv = document.getElementById('rzpCardCvv').value.trim();
    
    if (!cardholder || !cardno || !expiry || !cvv) {
        alert('Please fill in all card credentials to proceed with simulated bank authorization.');
        return;
    }
    
    switchRzpSubState('otp');
}

function verifyRzpOtpAndConfirm() {
    const otpInput = document.getElementById('rzpOtpInput').value.trim();
    if (otpInput !== '123456') {
        alert('Verification failed. Use simulated sandbox credentials (OTP: 123456).');
        return;
    }
    triggerRzpSuccessfulCheckout('Card');
}

function triggerRzpUpiAwaiting() {
    const upiId = document.getElementById('rzpUpiId').value.trim();
    if (!upiId) {
        alert('Please provide your UPI ID to register simulated mandate.');
        return;
    }
    
    document.getElementById('upiFormView').classList.add('hidden');
    document.getElementById('upiAwaitingView').classList.remove('hidden');
    
    let secondsLeft = 119;
    const timerSpan = document.getElementById('upiTimer');
    
    if (upiTimerInterval) clearInterval(upiTimerInterval);
    
    upiTimerInterval = setInterval(() => {
        const mins = Math.floor(secondsLeft / 60);
        const secs = secondsLeft % 60;
        timerSpan.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        
        secondsLeft--;
        if (secondsLeft < 0) {
            clearInterval(upiTimerInterval);
            alert('Sandbox checkout request expired. Please re-initiate.');
            switchRzpSubState('upi');
        }
    }, 1000);
}

function triggerRzpBankSimulation(bankName) {
    document.getElementById('rzpBankSimName').textContent = bankName + ' Sandbox Gateway';
    switchRzpSubState('bankRedirect');
}

function triggerRzpSuccessfulCheckout(paymentMethod) {
    if (upiTimerInterval) {
        clearInterval(upiTimerInterval);
        upiTimerInterval = null;
    }
    
    switchRzpSubState('processing');
    
    setTimeout(() => {
        switchRzpSubState('success');
        document.getElementById('rzpSuccessSubtext').textContent = `${paymentMethod} transaction verified and recorded successfully.`;
        
        // Generate random mock payment id
        const payId = 'pay_' + Math.random().toString(36).substring(2, 11) + Math.random().toString(36).substring(2, 7);
        document.getElementById('checkoutPaymentId').value = payId;
        
        setTimeout(() => {
            // Empty local storage cart
            localStorage.removeItem('kaya_cart');
            closeRazorpay();
            
            // Post checkout form
            document.getElementById('checkoutForm').submit();
        }, 1500);
    }, 1500);
}

document.addEventListener('DOMContentLoaded', () => {
    renderCart();
    updateNavCartCount();
});
</script>
@endsection
