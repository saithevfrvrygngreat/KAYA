@extends('layouts.app')

@section('content')
<div class="max-w-7xl mx-auto px-6 md:px-12 py-10">
    <div class="mb-8">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
                <span class="inline-block px-3 py-1 mb-2 rounded-full bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 font-label-sm uppercase tracking-widest text-[11px]">Step 3 of 3</span>
                <h1 class="font-headline-lg text-4xl text-primary leading-tight">Review Your Custom Decor</h1>
            </div>
            <a class="inline-flex items-center gap-2 text-stone-500 hover:text-emerald-800 transition-colors font-semibold text-sm" href="{{ route('products.customize', $product->id) }}">
                <span class="material-symbols-outlined text-[18px]">edit</span>
                Re-customize Design
            </a>
        </div>
    </div>

    @if (session('status'))
        <div class="bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-200 px-6 py-4 rounded-2xl mb-8 flex items-center gap-3">
            <span class="material-symbols-outlined text-emerald-800">check_circle</span>
            <span class="font-semibold">{{ session('status') }}</span>
        </div>
    @endif

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <!-- Live Mockup Curation Showcase -->
        <div class="lg:col-span-8 bg-white dark:bg-stone-950 p-8 rounded-3xl whisper-shadow border border-stone-100 dark:border-stone-900">
            <h2 class="font-headline-md text-xl text-primary mb-6">Visualizer Integration</h2>
            
            <div class="relative rounded-2xl overflow-hidden border border-stone-200 dark:border-stone-800 bg-stone-100 whisper-shadow mb-6">
                <canvas id="previewCanvas" width="760" height="490" class="w-full h-auto block"></canvas>
            </div>

            @if ($design->room_image_path)
                <div class="mt-8 space-y-4">
                    <h3 class="font-headline-sm text-sm uppercase tracking-widest text-stone-400 font-semibold">Your Room Wall Preview</h3>
                    <div class="rounded-2xl overflow-hidden border border-stone-200 dark:border-stone-800 whisper-shadow">
                        <img class="w-full h-auto max-h-[300px] object-cover" src="{{ asset('storage/'.$design->room_image_path) }}" alt="Uploaded room preview">
                    </div>
                </div>
            @endif
        </div>

        <!-- Order Placement Panel -->
        <div class="lg:col-span-4 bg-white dark:bg-stone-950 p-8 rounded-3xl whisper-shadow border border-stone-100 dark:border-stone-900 flex flex-col justify-between">
            <div class="space-y-6">
                <h2 class="font-headline-md text-xl text-primary border-b border-stone-100 dark:border-stone-900 pb-4">Order Specifications</h2>
                
                <div class="space-y-4 text-sm font-medium">
                    <div class="flex justify-between py-1.5 border-b border-stone-50 dark:border-stone-900/50">
                        <span class="text-stone-400">Design Signature ID</span>
                        <span class="text-primary font-mono text-xs">{{ $design->id }}</span>
                    </div>
                    <div class="flex justify-between py-1.5 border-b border-stone-50 dark:border-stone-900/50">
                        <span class="text-stone-400">Selected Base</span>
                        <span class="text-primary">{{ $product->name }}</span>
                    </div>
                    <div class="flex justify-between py-1.5 border-b border-stone-50 dark:border-stone-900/50">
                        <span class="text-stone-400">Curation Status</span>
                        <span class="text-emerald-800 font-bold uppercase tracking-wider text-[10px] bg-emerald-500/10 px-2 py-0.5 rounded-full">{{ $design->status }}</span>
                    </div>
                    <div class="flex justify-between py-1.5 border-b border-stone-50 dark:border-stone-900/50">
                        <span class="text-stone-400">Dimensions Standard</span>
                        <span id="labelSize" class="text-primary font-bold">A3</span>
                    </div>
                    <div class="flex justify-between py-1.5 border-b border-stone-50 dark:border-stone-900/50">
                        <span class="text-stone-400">Frame Moulding</span>
                        <span id="labelFrame" class="text-primary font-bold capitalize">-</span>
                    </div>
                    <div class="flex justify-between pt-4">
                        <span class="text-stone-400 text-base">Total Cost (incl. GST)</span>
                        <span class="text-xl font-extrabold text-emerald-900 dark:text-emerald-400">INR {{ number_format((float) $product->base_price, 2) }}</span>
                    </div>
                </div>

                <form id="bespokeCheckoutForm" method="POST" action="{{ route('orders.store') }}" class="space-y-4 pt-6 border-t border-stone-100 dark:border-stone-900">
                    @csrf
                    <input type="hidden" name="custom_design_id" value="{{ $design->id }}">
                    <input type="hidden" name="payment_id" id="checkoutPaymentId" value="">
                    
                    <div class="grid grid-cols-2 gap-3">
                        <div class="space-y-1.5">
                            <label class="block text-[10px] uppercase tracking-widest font-semibold text-stone-400 dark:text-stone-500">Full Name</label>
                            <input name="customer_name" required type="text" placeholder="Arjun Sharma" value="{{ auth()->user()->name ?? '' }}"
                                   class="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-emerald-600 transition-colors text-stone-900 dark:text-white text-xs font-semibold">
                        </div>
                        <div class="space-y-1.5">
                            <label class="block text-[10px] uppercase tracking-widest font-semibold text-stone-400 dark:text-stone-500">Phone</label>
                            <input name="customer_phone" required type="tel" placeholder="+91 98765 43210"
                                   class="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-emerald-600 transition-colors text-stone-900 dark:text-white text-xs font-semibold">
                        </div>
                    </div>

                    <div class="space-y-1.5">
                        <label class="block text-[10px] uppercase tracking-widest font-semibold text-stone-400 dark:text-stone-500">Email Address</label>
                        <input name="customer_email" required type="email" placeholder="arjun@example.com" value="{{ auth()->user()->email ?? '' }}"
                               class="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-emerald-600 transition-colors text-stone-900 dark:text-white text-xs font-semibold">
                    </div>

                    <div class="space-y-1.5">
                        <label for="shippingAddress" class="block text-[10px] uppercase tracking-widest font-semibold text-stone-400 dark:text-stone-500">Shipping Destination</label>
                        <textarea id="shippingAddress" name="shipping_address" rows="3" required class="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-emerald-600 transition-colors text-stone-900 dark:text-white text-xs resize-none font-semibold" placeholder="Enter your full street address, landmark and pin code..."></textarea>
                    </div>

                    <button type="button" onclick="startRazorpayPayment()" class="w-full bg-[#2d72d9] text-white px-6 py-3.5 rounded-xl font-semibold hover:bg-[#2561c0] shadow-lg transition-all flex justify-center items-center gap-2 text-xs">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M7.5 3L4 14.5H9.5L8 21L20 9.5H14L17.5 3H7.5Z" fill="white"/></svg>
                        Pay securely with Razorpay
                    </button>
                    <p class="text-center text-[10px] text-stone-400 mt-1">UPI · Cards · Netbanking · Wallets</p>
                </form>
            </div>

            <div class="mt-8 border-t border-stone-100 dark:border-stone-900 pt-6">
                <div class="flex items-start gap-3">
                    <span class="material-symbols-outlined text-amber-600">verified_user</span>
                    <p class="text-[11px] text-stone-400 leading-relaxed">
                        Secure transaction processed. Handcrafted at our central design studio. Estimated delivery: 3-5 business days.
                    </p>
                </div>
            </div>
        </div>
    </div>
</div>

<script>
    const PRODUCT_NAME = @json($product->name);
    const design = @json($design->design_json ?? []);
    const canvas = document.getElementById('previewCanvas');
    const context = canvas.getContext('2d');

    const color = design.color || '#064e3b';
    const text = design.text || 'Bespoke Elegance';
    const size = design.size || 'A3';
    const font = design.font || 'sans-serif';
    const fontSize = Number(design.font_size || 34);
    const frameStyle = design.frame_style || 'black';

    // Update Specification Labels in the side card
    document.getElementById('labelSize').textContent = size;
    document.getElementById('labelFrame').textContent = frameStyle === 'none' ? 'Borderless' : frameStyle;

    let productBaseImage = null;
    let roomImgLoaded = false;
    let productImgLoaded = false;

    function checkAndDraw() {
        if (roomImgLoaded && productImgLoaded) drawPreview();
    }

    // Load Product Base Image
    const baseImageUrl = "{{ $product->image_path }}";
    if (baseImageUrl) {
        const pImg = new Image();
        pImg.onload = () => {
            productBaseImage = pImg;
            productImgLoaded = true;
            checkAndDraw();
        };
        pImg.onerror = () => {
            productImgLoaded = true;
            checkAndDraw();
        };
        pImg.src = baseImageUrl;
    } else {
        productImgLoaded = true;
    }

    // Redraw the realistic frame on a high-res Mockup or Uploaded Image
    const roomImg = new Image();
    roomImg.onload = () => {
        roomImgLoaded = true;
        checkAndDraw();
    };
    roomImg.onerror = () => {
        const defaultBackdrop = 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80';
        if (roomImg.src !== defaultBackdrop) {
            console.warn("Failed to load custom backdrop. Falling back to default mockup.");
            roomImg.src = defaultBackdrop;
        }
    };
    
    const uploadedRoomImagePath = "{{ $design->room_image_path ? asset('storage/'.$design->room_image_path) : '' }}";
    let backdropSrc = 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80';
    if (uploadedRoomImagePath) {
        backdropSrc = uploadedRoomImagePath;
    } else if (design.backdrop === 'bedroom') {
        backdropSrc = 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1200&q=80';
    } else if (design.backdrop === 'office') {
        backdropSrc = 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80';
    }

    roomImg.src = backdropSrc;
    let activeAiArtSpec = design.ai_art_spec || null;
    let generatedAiImage = null;

    if (activeAiArtSpec && activeAiArtSpec.synthesized_image_base64) {
        const aiImg = new Image();
        aiImg.onload = () => { generatedAiImage = aiImg; checkAndDraw(); };
        aiImg.src = activeAiArtSpec.synthesized_image_base64;
    }

    function hexToRgba(hex, alpha = 1) {
        let r = 0, g = 0, b = 0;
        if (hex && hex.startsWith('#')) {
            let h = hex.replace('#', '');
            if (h.length === 3) {
                r = parseInt(h[0] + h[0], 16);
                g = parseInt(h[1] + h[1], 16);
                b = parseInt(h[2] + h[2], 16);
            } else if (h.length === 6) {
                r = parseInt(h.substring(0, 2), 16);
                g = parseInt(h.substring(2, 4), 16);
                b = parseInt(h.substring(4, 6), 16);
            }
        }
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    function drawRoundedRect(ctx, x, y, width, height, radius) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
    }

    function drawBespokeLighting(ctx, fX, fY, fWidth, fHeight, design) {
        const isPendant = PRODUCT_NAME.includes('Pendant');
        const isFairyLights = PRODUCT_NAME.includes('Fairy') || PRODUCT_NAME.includes('String');

        if (isFairyLights) {
            ctx.save();
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.lineWidth = 1.5;

            ctx.beginPath();
            ctx.moveTo(fX, fY + fHeight * 0.25);
            ctx.bezierCurveTo(
                fX + fWidth * 0.25, fY + fHeight * 0.65,
                fX + fWidth * 0.75, fY + fHeight * 0.65,
                fX + fWidth, fY + fHeight * 0.25
            );
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(fX, fY + fHeight * 0.45);
            ctx.bezierCurveTo(
                fX + fWidth * 0.25, fY + fHeight * 0.85,
                fX + fWidth * 0.75, fY + fHeight * 0.85,
                fX + fWidth, fY + fHeight * 0.45
            );
            ctx.stroke();

            const drawBulbs = (startY, midY, endY) => {
                for (let t = 0; t <= 1; t += 0.08) {
                    const x = (1-t)*(1-t)*fX + 2*(1-t)*t*(fX + fWidth*0.5) + t*t*(fX + fWidth);
                    const y = (1-t)*(1-t)*startY + 2*(1-t)*t*midY + t*t*endY;

                    const glow = ctx.createRadialGradient(x, y, 1, x, y, 16);
                    glow.addColorStop(0, '#ffffff');
                    glow.addColorStop(0.2, '#fef3c7');
                    glow.addColorStop(0.5, hexToRgba(color, 0.65));
                    glow.addColorStop(1, 'rgba(0,0,0,0)');

                    ctx.fillStyle = glow;
                    ctx.beginPath();
                    ctx.arc(x, y, 16, 0, Math.PI * 2);
                    ctx.fill();
                }
            };

            drawBulbs(fY + fHeight * 0.25, fY + fHeight * 0.65, fY + fHeight * 0.25);
            drawBulbs(fY + fHeight * 0.45, fY + fHeight * 0.85, fY + fHeight * 0.45);
            ctx.restore();

        } else if (isPendant) {
            ctx.save();
            ctx.strokeStyle = '#292524';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.moveTo(fX + fWidth/2, 0);
            ctx.lineTo(fX + fWidth/2, fY + fHeight * 0.25);
            ctx.stroke();

            const glowGrad = ctx.createRadialGradient(
                fX + fWidth / 2, fY + fHeight * 0.55,
                10,
                fX + fWidth / 2, fY + fHeight * 0.55,
                140
            );
            glowGrad.addColorStop(0, 'rgba(255, 253, 230, 0.9)');
            glowGrad.addColorStop(0.3, hexToRgba(design.color, 0.5));
            glowGrad.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = glowGrad;
            ctx.beginPath();
            ctx.arc(fX + fWidth / 2, fY + fHeight * 0.55, 140, 0, Math.PI * 2);
            ctx.fill();

            ctx.shadowColor = 'rgba(0,0,0,0.3)';
            ctx.shadowBlur = 12;
            ctx.shadowOffsetY = 6;

            ctx.beginPath();
            ctx.moveTo(fX + fWidth * 0.35, fY + fHeight * 0.25);
            ctx.quadraticCurveTo(fX + fWidth * 0.15, fY + fHeight * 0.55, fX + fWidth * 0.15, fY + fHeight * 0.7);
            ctx.lineTo(fX + fWidth * 0.85, fY + fHeight * 0.7);
            ctx.quadraticCurveTo(fX + fWidth * 0.85, fY + fHeight * 0.55, fX + fWidth * 0.65, fY + fHeight * 0.25);
            ctx.closePath();

            ctx.save();
            ctx.clip();
            if (generatedAiImage) {
                ctx.drawImage(generatedAiImage, fX + fWidth * 0.15, fY + fHeight * 0.25, fWidth * 0.7, fHeight * 0.45);
            } else {
                ctx.fillStyle = design.color;
                ctx.fill();

                ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
                ctx.lineWidth = 1.5;
                for (let o = -50; o <= 100; o += 12) {
                    ctx.beginPath();
                    ctx.moveTo(fX + o, fY);
                    ctx.lineTo(fX + o + 100, fY + fHeight);
                    ctx.stroke();
                    ctx.beginPath();
                    ctx.moveTo(fX + fWidth - o, fY);
                    ctx.lineTo(fX + fWidth - o - 100, fY + fHeight);
                    ctx.stroke();
                }
            }
            ctx.restore();

            const baseColor = design.frame_style === 'gold' ? '#d4af37' : (design.frame_style === 'oak' ? '#8c6239' : '#1c1917');
            ctx.fillStyle = baseColor;
            ctx.fillRect(fX + fWidth * 0.15, fY + fHeight * 0.7, fWidth * 0.7, 6);
            ctx.restore();

        } else {
            ctx.save();
            const glowGrad = ctx.createRadialGradient(
                fX + fWidth / 2, fY + fHeight * 0.35,
                15,
                fX + fWidth / 2, fY + fHeight * 0.35,
                140
            );
            glowGrad.addColorStop(0, 'rgba(255, 253, 230, 0.85)');
            glowGrad.addColorStop(0.3, hexToRgba(design.color, 0.45));
            glowGrad.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = glowGrad;
            ctx.beginPath();
            ctx.arc(fX + fWidth / 2, fY + fHeight * 0.35, 140, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();

            ctx.save();
            ctx.shadowColor = 'rgba(0,0,0,0.15)';
            ctx.shadowBlur = 4;
            ctx.shadowOffsetY = 2;
            const baseColor = design.frame_style === 'gold' ? '#d4af37' : (design.frame_style === 'oak' ? '#8c6239' : '#1c1917');
            ctx.fillStyle = baseColor;
            ctx.fillRect(fX + fWidth / 2 - 6, fY + fHeight * 0.45, 12, fHeight * 0.45);
            ctx.beginPath();
            ctx.ellipse(fX + fWidth / 2, fY + fHeight * 0.9, 45, 12, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();

            ctx.save();
            ctx.shadowColor = 'rgba(0,0,0,0.25)';
            ctx.shadowBlur = 10;
            ctx.shadowOffsetX = 3;
            ctx.shadowOffsetY = 6;
            ctx.beginPath();
            ctx.moveTo(fX + fWidth * 0.28, fY + fHeight * 0.15);
            ctx.lineTo(fX + fWidth * 0.72, fY + fHeight * 0.15);
            ctx.lineTo(fX + fWidth * 0.9, fY + fHeight * 0.5);
            ctx.lineTo(fX + fWidth * 0.1, fY + fHeight * 0.5);
            ctx.closePath();

            ctx.save();
            ctx.clip();
            if (generatedAiImage) {
                ctx.drawImage(generatedAiImage, fX + fWidth * 0.1, fY + fHeight * 0.15, fWidth * 0.8, fHeight * 0.35);
            } else {
                ctx.fillStyle = design.color;
                ctx.fill();
            }
            ctx.restore();
            ctx.restore();
        }
    }

    function drawBespokeSoftFurnishing(ctx, fX, fY, fWidth, fHeight, design) {
        const isBlanket = PRODUCT_NAME.includes('Blanket') || PRODUCT_NAME.includes('Throw');

        if (isBlanket) {
            ctx.save();
            ctx.shadowColor = 'rgba(0,0,0,0.2)';
            ctx.shadowBlur = 14;
            ctx.shadowOffsetX = 3;
            ctx.shadowOffsetY = 6;

            ctx.fillStyle = design.color;
            ctx.beginPath();
            ctx.moveTo(fX + fWidth * 0.1, fY + fHeight * 0.15);
            ctx.quadraticCurveTo(fX + fWidth * 0.3, fY + fHeight * 0.05, fX + fWidth * 0.5, fY + fHeight * 0.2);
            ctx.quadraticCurveTo(fX + fWidth * 0.7, fY + fHeight * 0.35, fX + fWidth * 0.9, fY + fHeight * 0.15);
            ctx.lineTo(fX + fWidth * 0.85, fY + fHeight * 0.85);
            ctx.quadraticCurveTo(fX + fWidth * 0.5, fY + fHeight * 0.95, fX + fWidth * 0.15, fY + fHeight * 0.8);
            ctx.closePath();
            ctx.fill();

            ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
            if (design.color === '#fef3c7') ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
            ctx.lineWidth = 3;
            for (let o = 15; o < fWidth - 15; o += 12) {
                ctx.beginPath();
                ctx.moveTo(fX + o, fY + fHeight * 0.2);
                ctx.quadraticCurveTo(fX + o + 10, fY + fHeight * 0.5, fX + o, fY + fHeight * 0.85);
                ctx.stroke();
            }
            ctx.restore();
        } else {
            ctx.save();
            ctx.shadowColor = 'rgba(0,0,0,0.3)';
            ctx.shadowBlur = 18;
            ctx.shadowOffsetX = 4;
            ctx.shadowOffsetY = 8;

            let pillowGrad = ctx.createRadialGradient(
                fX + fWidth * 0.4, fY + fHeight * 0.4,
                10,
                fX + fWidth / 2, fY + fHeight / 2,
                fWidth * 0.7
            );
            pillowGrad.addColorStop(0, '#ffffff');
            pillowGrad.addColorStop(0.2, design.color);
            pillowGrad.addColorStop(1, hexToRgba(design.color, 0.9));

            ctx.fillStyle = pillowGrad;
            drawRoundedRect(ctx, fX, fY, fWidth, fHeight, 36);
            ctx.fill();
            ctx.restore();

            if (generatedAiImage) {
                ctx.save();
                drawRoundedRect(ctx, fX + 4, fY + 4, fWidth - 8, fHeight - 8, 32);
                ctx.clip();
                ctx.globalAlpha = 0.85;
                ctx.drawImage(generatedAiImage, fX + 4, fY + 4, fWidth - 8, fHeight - 8);
                ctx.restore();
            }

            ctx.save();
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
            if (design.color === '#fef3c7') ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
            ctx.lineWidth = 1.5;
            ctx.setLineDash([5, 4]);
            drawRoundedRect(ctx, fX + 12, fY + 12, fWidth - 24, fHeight - 24, 28);
            ctx.stroke();
            ctx.restore();
        }
    }

    function drawBespokeRug(ctx, fX, fY, fWidth, fHeight, design) {
        ctx.save();
        ctx.shadowColor = 'rgba(0,0,0,0.22)';
        ctx.shadowBlur = 8;
        ctx.shadowOffsetY = 3;
        ctx.beginPath();
        ctx.moveTo(fX + fWidth * 0.16, fY);
        ctx.lineTo(fX + fWidth * 0.84, fY);
        ctx.lineTo(fX + fWidth, fY + fHeight);
        ctx.lineTo(fX, fY + fHeight);
        ctx.closePath();
        ctx.save();
        ctx.clip();
        if (generatedAiImage) {
            ctx.drawImage(generatedAiImage, fX, fY, fWidth, fHeight);
        } else {
            ctx.fillStyle = design.color;
            ctx.fill();
        }
        ctx.restore();
        ctx.restore();

        ctx.save();
        ctx.strokeStyle = 'rgba(255,255,255,0.4)';
        if (design.color === '#fef3c7') ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(fX + fWidth * 0.18, fY + 6);
        ctx.lineTo(fX + fWidth * 0.82, fY + 6);
        ctx.lineTo(fX + fWidth - 12, fY + fHeight - 8);
        ctx.lineTo(fX + 12, fY + fHeight - 8);
        ctx.closePath();
        ctx.stroke();
        ctx.restore();

        ctx.save();
        ctx.strokeStyle = 'rgba(245,245,240,0.7)';
        ctx.lineWidth = 2.5;
        for (let y = fY; y <= fY + fHeight; y += 4) {
            const pct = (y - fY) / fHeight;
            const x = fX + (fWidth * 0.16) * (1 - pct);
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x - 8, y);
            ctx.stroke();
        }
        for (let y = fY; y <= fY + fHeight; y += 4) {
            const pct = (y - fY) / fHeight;
            const x = fX + fWidth * 0.84 + (fWidth * 0.16) * pct;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + 8, y);
            ctx.stroke();
        }
        ctx.restore();
    }

    function drawBespokeAccent(ctx, fX, fY, fWidth, fHeight, design) {
        const isCandle = PRODUCT_NAME.includes('Candle');
        const isTray = PRODUCT_NAME.includes('Tray');

        if (isCandle) {
            ctx.save();
            ctx.shadowColor = 'rgba(0,0,0,0.18)';
            ctx.shadowBlur = 8;
            ctx.shadowOffsetY = 4;

            const flameGlow = ctx.createRadialGradient(
                fX + fWidth/2, fY + fHeight * 0.25, 2,
                fX + fWidth/2, fY + fHeight * 0.25, 50
            );
            flameGlow.addColorStop(0, 'rgba(255, 190, 60, 0.95)');
            flameGlow.addColorStop(0.3, 'rgba(255, 120, 20, 0.45)');
            flameGlow.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = flameGlow;
            ctx.beginPath();
            ctx.arc(fX + fWidth/2, fY + fHeight * 0.25, 50, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#fff9e6';
            ctx.beginPath();
            ctx.moveTo(fX + fWidth/2, fY + fHeight * 0.32);
            ctx.quadraticCurveTo(fX + fWidth/2 - 6, fY + fHeight * 0.23, fX + fWidth/2, fY + fHeight * 0.14);
            ctx.quadraticCurveTo(fX + fWidth/2 + 6, fY + fHeight * 0.23, fX + fWidth/2, fY + fHeight * 0.32);
            ctx.fill();

            ctx.strokeStyle = '#1c1917';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.moveTo(fX + fWidth/2, fY + fHeight * 0.38);
            ctx.lineTo(fX + fWidth/2, fY + fHeight * 0.32);
            ctx.stroke();

            let jarGrad = ctx.createLinearGradient(fX, fY, fX + fWidth, fY);
            jarGrad.addColorStop(0, hexToRgba(design.color, 0.9));
            jarGrad.addColorStop(0.3, '#ffffff');
            jarGrad.addColorStop(0.5, design.color);
            jarGrad.addColorStop(1, hexToRgba(design.color, 0.95));

            ctx.fillStyle = jarGrad;
            drawRoundedRect(ctx, fX + fWidth * 0.15, fY + fHeight * 0.38, fWidth * 0.7, fHeight * 0.55, 12);
            ctx.fill();

            ctx.fillStyle = '#fcfbf7';
            ctx.fillRect(fX + fWidth * 0.25, fY + fHeight * 0.5, fWidth * 0.5, fHeight * 0.3);
            ctx.strokeStyle = 'rgba(0,0,0,0.15)';
            ctx.strokeRect(fX + fWidth * 0.25, fY + fHeight * 0.5, fWidth * 0.5, fHeight * 0.3);

            ctx.fillStyle = '#292524';
            ctx.font = 'bold 11px serif';
            ctx.textAlign = 'center';
            ctx.fillText("HAVEN", fX + fWidth/2, fY + fHeight * 0.62);
            ctx.font = '7px sans-serif';
            ctx.fillText("SOY WAX", fX + fWidth/2, fY + fHeight * 0.72);

            ctx.restore();

        } else if (isTray) {
            ctx.save();
            ctx.shadowColor = 'rgba(0,0,0,0.22)';
            ctx.shadowBlur = 10;
            ctx.shadowOffsetY = 6;

            let trayColor = design.color;
            ctx.fillStyle = trayColor;
            ctx.beginPath();
            ctx.ellipse(fX + fWidth/2, fY + fHeight * 0.6, fWidth * 0.45, fHeight * 0.25, 0, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = 'rgba(255,255,255,0.25)';
            ctx.lineWidth = 1.5;
            for (let r = 10; r < fWidth * 0.4; r += 12) {
                ctx.beginPath();
                ctx.ellipse(fX + fWidth/2, fY + fHeight * 0.6, r, r * 0.5, 0, 0, Math.PI * 2);
                ctx.stroke();
            }

            ctx.fillStyle = design.frame_style === 'oak' ? '#8c6239' : '#292524';
            ctx.fillRect(fX + fWidth * 0.05, fY + fHeight * 0.55, 12, fHeight * 0.1);
            ctx.fillRect(fX + fWidth * 0.88, fY + fHeight * 0.55, 12, fHeight * 0.1);

            ctx.restore();
        } else {
            ctx.save();
            ctx.shadowColor = 'rgba(0,0,0,0.25)';
            ctx.shadowBlur = 12;
            ctx.shadowOffsetX = 4;
            ctx.shadowOffsetY = 8;

            let glazeGrad = ctx.createLinearGradient(fX, fY, fX + fWidth, fY);
            glazeGrad.addColorStop(0, hexToRgba(design.color, 0.85));
            glazeGrad.addColorStop(0.26, '#ffffff');
            glazeGrad.addColorStop(0.45, design.color);
            glazeGrad.addColorStop(1, hexToRgba(design.color, 0.9));

            ctx.beginPath();
            ctx.moveTo(fX + fWidth * 0.38, fY + fHeight * 0.08);
            ctx.lineTo(fX + fWidth * 0.62, fY + fHeight * 0.08);
            ctx.lineTo(fX + fWidth * 0.58, fY + fHeight * 0.28);
            ctx.bezierCurveTo(
                fX + fWidth * 0.95, fY + fHeight * 0.45,
                fX + fWidth * 0.92, fY + fHeight * 0.85,
                fX + fWidth * 0.68, fY + fHeight * 0.94
            );
            ctx.lineTo(fX + fWidth * 0.32, fY + fHeight * 0.94);
            ctx.bezierCurveTo(
                fX + fWidth * 0.08, fY + fHeight * 0.85,
                fX + fWidth * 0.05, fY + fHeight * 0.45,
                fX + fWidth * 0.42, fY + fHeight * 0.28
            );
            ctx.closePath();

            ctx.save();
            ctx.clip();
            if (generatedAiImage) {
                ctx.drawImage(generatedAiImage, fX, fY, fWidth, fHeight);
                ctx.fillStyle = glazeGrad;
                ctx.globalAlpha = 0.45;
                ctx.fill();
            } else {
                ctx.fillStyle = glazeGrad;
                ctx.fill();
            }
            ctx.restore();
            ctx.restore();

            const ringColor = design.frame_style === 'gold' ? '#d4af37' : '#1c1917';
            ctx.fillStyle = ringColor;
            ctx.fillRect(fX + fWidth * 0.38, fY + fHeight * 0.05, fWidth * 0.24, 6);
            ctx.fillRect(fX + fWidth * 0.32, fY + fHeight * 0.94, fWidth * 0.36, 6);
        }
    }

    function drawBespokeWallDecor(ctx, fX, fY, fWidth, fHeight, design) {
        const isMirror = PRODUCT_NAME.includes('Mirror');
        const isMacrame = PRODUCT_NAME.includes('Macramé') || PRODUCT_NAME.includes('Hanging');

        if (isMirror) {
            ctx.save();
            ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
            ctx.shadowBlur = 18;
            ctx.shadowOffsetX = 8;
            ctx.shadowOffsetY = 12;

            const drawHex = (x, y, w, h) => {
                ctx.beginPath();
                ctx.moveTo(x + w/2, y);
                ctx.lineTo(x + w, y + h * 0.25);
                ctx.lineTo(x + w, y + h * 0.75);
                ctx.lineTo(x + w/2, y + h);
                ctx.lineTo(x, y + h * 0.75);
                ctx.lineTo(x, y + h * 0.25);
                ctx.closePath();
            };

            let frameColor = '#1c1917';
            if (design.frame_style === 'oak') frameColor = '#b58c5c';
            else if (design.frame_style === 'gold') frameColor = '#d4af37';
            ctx.fillStyle = frameColor;
            drawHex(fX, fY, fWidth, fHeight);
            ctx.fill();

            ctx.save();
            const borderSize = 16;
            drawHex(fX + borderSize, fY + borderSize, fWidth - borderSize*2, fHeight - borderSize*2);
            ctx.clip();

            const mirrorGrad = ctx.createRadialGradient(
                fX + fWidth/2, fY + fHeight/2, 10,
                fX + fWidth/2, fY + fHeight/2, fWidth * 0.6
            );
            mirrorGrad.addColorStop(0, '#eef2f3');
            mirrorGrad.addColorStop(0.5, '#cfd9df');
            mirrorGrad.addColorStop(1, '#a6b8c7');
            ctx.fillStyle = mirrorGrad;
            ctx.fill();

            ctx.strokeStyle = 'rgba(255,255,255,0.45)';
            ctx.lineWidth = 12;
            ctx.beginPath();
            ctx.moveTo(fX + fWidth * 0.2, fY + fHeight * 0.2);
            ctx.lineTo(fX + fWidth * 0.8, fY + fHeight * 0.8);
            ctx.stroke();

            ctx.strokeStyle = 'rgba(255,255,255,0.25)';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(fX + fWidth * 0.3, fY + fHeight * 0.15);
            ctx.lineTo(fX + fWidth * 0.9, fY + fHeight * 0.75);
            ctx.stroke();

            ctx.restore();
            ctx.restore();

        } else if (isMacrame) {
            ctx.save();
            ctx.shadowColor = 'rgba(0,0,0,0.22)';
            ctx.shadowBlur = 10;
            ctx.shadowOffsetY = 6;

            ctx.strokeStyle = '#a8a29e';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(fX + fWidth/2, fY + fHeight * 0.05);
            ctx.lineTo(fX + fWidth * 0.1, fY + fHeight * 0.2);
            ctx.lineTo(fX + fWidth * 0.9, fY + fHeight * 0.2);
            ctx.closePath();
            ctx.stroke();

            const woodColor = design.frame_style === 'oak' ? '#8c6239' : (design.frame_style === 'gold' ? '#d4af37' : '#292524');
            ctx.fillStyle = woodColor;
            ctx.fillRect(fX + fWidth * 0.05, fY + fHeight * 0.18, fWidth * 0.9, 10);

            ctx.strokeStyle = '#e7e5e4';
            if (design.color !== '#fafaf9') ctx.strokeStyle = hexToRgba(design.color, 0.95);

            ctx.lineWidth = 3;
            for (let x = fX + fWidth * 0.15; x <= fX + fWidth * 0.85; x += 12) {
                ctx.beginPath();
                ctx.moveTo(x, fY + fHeight * 0.2);
                ctx.lineTo(x, fY + fHeight * 0.65);
                ctx.stroke();
            }

            ctx.lineWidth = 1.5;
            for (let y = fY + fHeight * 0.25; y <= fY + fHeight * 0.55; y += 15) {
                ctx.beginPath();
                ctx.moveTo(fX + fWidth * 0.15, y);
                ctx.lineTo(fX + fWidth * 0.85, y + 20);
                ctx.moveTo(fX + fWidth * 0.85, y);
                ctx.lineTo(fX + fWidth * 0.15, y + 20);
                ctx.stroke();
            }

            ctx.lineWidth = 2.5;
            for (let x = fX + fWidth * 0.15; x <= fX + fWidth * 0.85; x += 6) {
                const pct = Math.abs((x - (fX + fWidth/2)) / (fWidth * 0.35));
                const length = fHeight * 0.45 - (pct * fHeight * 0.18);

                ctx.beginPath();
                ctx.moveTo(x, fY + fHeight * 0.5);
                ctx.lineTo(x, fY + fHeight * 0.5 + length);
                ctx.stroke();
            }
            ctx.restore();

        } else {
            if (design.frame_style !== 'none') {
                ctx.save();
                ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
                ctx.shadowBlur = 24;
                ctx.shadowOffsetX = 12;
                ctx.shadowOffsetY = 16;
                ctx.fillStyle = '#000000';
                ctx.fillRect(fX, fY, fWidth, fHeight);
                ctx.restore();
            }

            let frameColor = '#1c1917';
            if (design.frame_style === 'oak') {
                frameColor = '#b58c5c';
            } else if (design.frame_style === 'gold') {
                frameColor = '#d4af37';
            }

            if (design.frame_style !== 'none') {
                ctx.fillStyle = frameColor;
                ctx.fillRect(fX, fY, fWidth, fHeight);

                ctx.strokeStyle = 'rgba(255,255,255,0.15)';
                ctx.lineWidth = 2;
                ctx.strokeRect(fX + 2, fY + 2, fWidth - 4, fHeight - 4);
                ctx.strokeStyle = 'rgba(0,0,0,0.3)';
                ctx.strokeRect(fX + 12, fY + 12, fWidth - 24, fHeight - 24);
            }

            const borderPadding = design.frame_style !== 'none' ? 18 : 0;
            const passWidth = fWidth - (borderPadding * 2);
            const passHeight = fHeight - (borderPadding * 2);
            const passX = fX + borderPadding;
            const passY = fY + borderPadding;

            ctx.fillStyle = '#fafaf9';
            ctx.fillRect(passX, passY, passWidth, passHeight);

            const artworkPadding = 24;
            const artWidth = passWidth - (artworkPadding * 2);
            const artHeight = passHeight - (artworkPadding * 2);
            const artX = passX + artworkPadding;
            const artY = passY + artworkPadding;

            ctx.save();
            ctx.shadowColor = 'rgba(0,0,0,0.12)';
            ctx.shadowBlur = 6;
            ctx.shadowOffsetX = 2;
            ctx.shadowOffsetY = 3;

            if (generatedAiImage) {
                ctx.drawImage(generatedAiImage, artX, artY, artWidth, artHeight);
            } else if (activeAiArtSpec) {
                const artGrad = ctx.createLinearGradient(artX, artY, artX + artWidth, artY + artHeight);
                artGrad.addColorStop(0, activeAiArtSpec.gradient_start || '#faf9f6');
                artGrad.addColorStop(1, activeAiArtSpec.gradient_end || '#e5e5e0');
                ctx.fillStyle = artGrad;
                ctx.fillRect(artX, artY, artWidth, artHeight);

                ctx.fillStyle = activeAiArtSpec.shape_color || design.color;
                const pX = artX + (artWidth / 2);
                const pY = artY + (artHeight / 2);

                if (activeAiArtSpec.primary_shape === 'circle') {
                    ctx.beginPath();
                    ctx.arc(pX, pY, artWidth * 0.35, 0, Math.PI * 2);
                    ctx.fill();
                } else if (activeAiArtSpec.primary_shape === 'arch') {
                    ctx.beginPath();
                    ctx.moveTo(pX - 50, pY - 20);
                    ctx.arc(pX, pY - 20, 50, Math.PI, 0);
                    ctx.lineTo(pX - 50, pY + 60);
                    ctx.lineTo(pX + 50, pY + 60);
                    ctx.closePath();
                    ctx.fill();
                } else if (activeAiArtSpec.primary_shape === 'sun') {
                    ctx.beginPath();
                    ctx.arc(pX, pY + 40, 60, Math.PI, 0);
                    ctx.fill();
                    ctx.strokeStyle = activeAiArtSpec.shape_color || '#d4af37';
                    ctx.lineWidth = 3;
                    for (let a = 0; a <= Math.PI; a += Math.PI / 8) {
                        const dx = Math.cos(a + Math.PI) * 90;
                        const dy = Math.sin(a + Math.PI) * 90;
                        ctx.beginPath();
                        ctx.moveTo(pX, pY + 40);
                        ctx.lineTo(pX + dx, pY + 40 + dy);
                        ctx.stroke();
                    }
                } else if (activeAiArtSpec.primary_shape === 'mountain') {
                    ctx.beginPath();
                    ctx.moveTo(artX, artY + artHeight);
                    ctx.lineTo(pX - 30, artY + 50);
                    ctx.lineTo(pX + 60, artY + artHeight);
                    ctx.fill();

                    ctx.fillStyle = 'rgba(0,0,0,0.15)';
                    ctx.beginPath();
                    ctx.moveTo(pX - 30, artY + 50);
                    ctx.lineTo(pX - 30, artY + artHeight);
                    ctx.lineTo(pX + 60, artY + artHeight);
                    ctx.fill();
                } else if (activeAiArtSpec.primary_shape === 'stripes') {
                    ctx.lineWidth = 14;
                    ctx.strokeStyle = activeAiArtSpec.shape_color || '#d4af37';
                    for (let o = -50; o <= 50; o += 25) {
                        ctx.beginPath();
                        ctx.moveTo(pX + o, artY + 10);
                        ctx.lineTo(pX + o, artY + artHeight - 10);
                        ctx.stroke();
                    }
                }

                if (Array.isArray(activeAiArtSpec.accent_shapes)) {
                    activeAiArtSpec.accent_shapes.forEach(accent => {
                        ctx.fillStyle = accent.color || '#fff';
                        const ax = artX + (artWidth * (accent.x_pct / 100));
                        const ay = artY + (artHeight * (accent.y_pct / 100));
                        const as = (accent.size / 100) * artWidth;

                        ctx.beginPath();
                        if (accent.shape === 'circle') {
                            ctx.arc(ax, ay, as, 0, Math.PI * 2);
                            ctx.fill();
                        } else if (accent.shape === 'arch') {
                            ctx.moveTo(ax - as, ay + as);
                            ctx.lineTo(ax - as, ay);
                            ctx.arc(ax, ay, as, Math.PI, 0);
                            ctx.lineTo(ax + as, ay + as);
                            ctx.fill();
                        }
                    });
                }
            } else {
                if (productBaseImage) {
                    ctx.drawImage(productBaseImage, artX, artY, artWidth, artHeight);
                } else {
                    ctx.fillStyle = design.color;
                    ctx.fillRect(artX, artY, artWidth, artHeight);
                }
            }
            ctx.restore();
        }
    }

    function drawPreview() {
        const width = canvas.width;
        const height = canvas.height;

        context.clearRect(0, 0, width, height);
        context.drawImage(roomImg, 0, 0, width, height);

        const PRODUCT_CATEGORY = design.product_category || 'Wall Decor';
        const fWidth = design.frame_w || 280;
        const fHeight = design.frame_h || 360;
        const fX = design.offset_x !== undefined ? design.offset_x : (width - fWidth) / 2;
        const fY = design.offset_y !== undefined ? design.offset_y : 80;

        if (PRODUCT_CATEGORY === 'Lighting') {
            drawBespokeLighting(context, fX, fY, fWidth, fHeight, design);
        } else if (PRODUCT_CATEGORY === 'Soft Furnishings') {
            drawBespokeSoftFurnishing(context, fX, fY, fWidth, fHeight, design);
        } else if (PRODUCT_CATEGORY === 'Rugs & Mats') {
            drawBespokeRug(context, fX, fY, fWidth, fHeight, design);
        } else if (PRODUCT_CATEGORY === 'Decorative Accents') {
            drawBespokeAccent(context, fX, fY, fWidth, fHeight, design);
        } else {
            drawBespokeWallDecor(context, fX, fY, fWidth, fHeight, design);
        };

        // Dimension indicators
        const rY = fY + fHeight + 20;
        context.strokeStyle = 'rgba(255,255,255,0.6)';
        context.lineWidth = 1;
        context.beginPath();
        context.moveTo(fX, rY);
        context.lineTo(fX + fWidth, rY);
        context.stroke();
        context.beginPath();
        context.moveTo(fX, rY - 6);
        context.lineTo(fX, rY + 6);
        context.moveTo(fX + fWidth, rY - 6);
        context.lineTo(fX + fWidth, rY + 6);
        context.stroke();


    }

    let upiTimerInterval = null;

    function openRazorpay() {
        const total = parseFloat("{{ $product->base_price * 1.18 }}");
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
        const form = document.getElementById('bespokeCheckoutForm');
        
        // Validate delivery details HTML5 constraints
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }
        
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
                closeRazorpay();
                // Post checkout form
                document.getElementById('bespokeCheckoutForm').submit();
            }, 1500);
        }, 1500);
    }
</script>

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
                        <input type="text" id="rzpUpiId" value="customer@upi" placeholder="name@upi" class="w-full bg-stone-50 dark:bg-stone-855 border border-stone-200 dark:border-stone-800 rounded-xl px-4 py-3 text-xs text-stone-900 dark:text-white font-semibold focus:outline-none focus:border-[#2d72d9]">
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

@endsection
