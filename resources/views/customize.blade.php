@extends('layouts.app')

@section('content')
<div class="max-w-7xl mx-auto px-6 md:px-12 py-10">
    <div class="mb-8">
        <a class="inline-flex items-center gap-2 text-stone-500 hover:text-emerald-800 transition-colors font-semibold text-sm mb-4" href="{{ route('products.index') }}">
            <span class="material-symbols-outlined text-[18px]">arrow_back</span>
            Back to Collection
        </a>
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <span class="inline-block px-3 py-1 mb-2 rounded-full bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 font-label-sm uppercase tracking-widest text-[11px] font-bold">Step 2 of 3</span>
                <h1 class="font-display-xl text-4xl text-primary leading-tight">{{ $product->name }}</h1>
            </div>
            <div class="bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 px-6 py-3 rounded-2xl">
                <span class="text-xs uppercase tracking-widest font-semibold text-stone-400 block">Base Price</span>
                <span class="text-xl font-bold text-emerald-900 dark:text-emerald-400">INR {{ number_format((float) $product->base_price, 2) }}</span>
            </div>
        </div>
    </div>

    @if ($errors->any())
        <div class="bg-rose-500/10 border border-rose-500/20 text-rose-800 dark:text-rose-200 px-6 py-4 rounded-2xl mb-8">
            <div class="flex items-center gap-2 font-bold mb-2">
                <span class="material-symbols-outlined">error</span>
                <span>Please fix the following validation errors:</span>
            </div>
            <ul class="list-disc pl-6 space-y-1 text-sm font-medium">
                @foreach ($errors->all() as $error)
                    <li>{{ $error }}</li>
                @endforeach
            </ul>
        </div>
    @endif

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <!-- Visualizer Settings Card -->
        <div class="lg:col-span-4 bg-white dark:bg-stone-950 p-8 rounded-3xl whisper-shadow border border-stone-100 dark:border-stone-900 space-y-6 h-fit">
            <h2 class="font-headline-md text-xl text-primary">Visualizer Controls</h2>
            
            <!-- AI Vector Art Spec Generator Prompt Section -->
            <div class="p-5 bg-gradient-to-br from-emerald-950 to-emerald-900 text-white rounded-2xl border border-emerald-800/40 space-y-3">
                <div class="flex items-center gap-2">
                    <span class="material-symbols-outlined text-emerald-300 animate-pulse">auto_awesome</span>
                    <h3 class="text-xs uppercase tracking-widest font-bold text-emerald-200">AI Wall Art Spec Generator</h3>
                </div>
                <p class="text-[11px] text-stone-300 leading-relaxed">
                    Type an abstract design prompt, and let Gemini AI create premium vector layouts, matching color palettes, and typographic accents instantly!
                </p>
                <div class="flex gap-2">
                    <input type="text" id="aiArtPrompt" class="flex-1 bg-white/10 border border-white/20 px-3 py-2.5 rounded-xl text-xs text-white placeholder-white/40 focus:outline-none focus:border-emerald-300" placeholder="e.g. bohemian abstract sun sunset...">
                    <button type="button" onclick="generateAiArt()" class="bg-emerald-500 text-emerald-950 px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-emerald-400 transition-colors whitespace-nowrap">
                        Generate
                    </button>
                </div>
            </div>
            
            <!-- AI Text Feedback Display -->
            <div id="aiTextFeedback" class="hidden p-5 bg-stone-50 dark:bg-stone-900 border border-emerald-500/30 rounded-2xl space-y-3">
                <div class="flex items-center gap-2">
                    <span class="material-symbols-outlined text-emerald-600 text-[18px]">psychology</span>
                    <h3 class="text-xs uppercase tracking-widest font-bold text-emerald-800 dark:text-emerald-400">Design Rationale</h3>
                </div>
                <div class="text-sm text-stone-600 dark:text-stone-400 space-y-2">
                    <p><strong class="text-stone-800 dark:text-stone-200">Palette:</strong> <span id="fbPalette"></span></p>
                    <p><strong class="text-stone-800 dark:text-stone-200">Layout:</strong> <span id="fbLayout"></span></p>
                    <p><strong class="text-stone-800 dark:text-stone-200">Typography:</strong> <span id="fbTypo"></span></p>
                </div>
            </div>

            <!-- Always visible diagnostics -->
            <div id="aiDiagnostics" class="text-[10px] font-mono border border-emerald-500/30 p-3 rounded-xl bg-stone-50 dark:bg-stone-900 text-stone-400 space-y-1">
                <p class="font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest text-[9px] mb-1">Execution Diagnostics Log:</p>
                <div id="diagLogs" class="max-h-32 overflow-y-auto space-y-1 leading-normal">
                    <p class="text-stone-500">[System] Diagnostics initialized.</p>
                </div>
            </div>

            <form id="designForm" method="POST" action="{{ route('designs.save') }}" enctype="multipart/form-data" class="space-y-6">
                @csrf
                <input type="hidden" name="product_id" value="{{ $product->id }}">
                <input type="hidden" name="design_json" id="designJson">


                <div class="space-y-2">
                    <label class="block text-xs uppercase tracking-widest font-semibold text-stone-400 dark:text-stone-500">Color Profile</label>
                    <div class="flex items-center gap-3">
                        <input id="designColor" type="color" value="#064e3b" class="w-14 h-12 bg-transparent border-0 cursor-pointer rounded-xl p-0">
                        <div class="flex-1 flex gap-1.5 flex-wrap">
                            <button type="button" onclick="setPresetColor('#064e3b')" class="w-7 h-7 rounded-full border border-white/20 shadow-md animate-hover" style="background-color: #064e3b;"></button>
                            <button type="button" onclick="setPresetColor('#78350f')" class="w-7 h-7 rounded-full border border-white/20 shadow-md animate-hover" style="background-color: #78350f;"></button>
                            <button type="button" onclick="setPresetColor('#1e3a8a')" class="w-7 h-7 rounded-full border border-white/20 shadow-md animate-hover" style="background-color: #1e3a8a;"></button>
                            <button type="button" onclick="setPresetColor('#1c1917')" class="w-7 h-7 rounded-full border border-white/20 shadow-md animate-hover" style="background-color: #1c1917;"></button>
                            <button type="button" onclick="setPresetColor('#fef3c7')" class="w-7 h-7 rounded-full border border-white/20 shadow-md animate-hover" style="background-color: #fef3c7;"></button>
                        </div>
                    </div>
                </div>

                <div class="space-y-2">
                    <label class="block text-xs uppercase tracking-widest font-semibold text-stone-400 dark:text-stone-500">Canvas Dimensions</label>
                    <select id="designSize" class="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 px-4 py-3 rounded-xl focus:outline-none focus:border-emerald-600 transition-colors text-stone-900 dark:text-white">
                        <option value="A4">A4 (Small / 21 × 29.7 cm)</option>
                        <option value="A3" selected>A3 (Medium / 29.7 × 42 cm)</option>
                        <option value="A2">A2 (Large / 42 × 59.4 cm)</option>
                    </select>
                </div>

                <div class="space-y-2">
                    <div class="flex justify-between items-center text-xs uppercase tracking-widest font-semibold text-stone-400 dark:text-stone-500">
                        <span>Interactive Decor Scale</span>
                        <span id="productScaleDisplay">100%</span>
                    </div>
                    <input id="productScale" name="product_scale" type="range" min="50" max="150" value="100" class="w-full h-1 bg-stone-200 dark:bg-stone-800 rounded-lg appearance-none cursor-pointer accent-emerald-800">
                </div>


                <div class="space-y-2">
                    <label class="block text-xs uppercase tracking-widest font-semibold text-stone-400 dark:text-stone-500">Frame Moulding</label>
                    <select id="frameStyle" class="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 px-4 py-3 rounded-xl focus:outline-none focus:border-emerald-600 transition-colors text-stone-900 dark:text-white">
                        <option value="black" selected>Charcoal Ash (Deep Black)</option>
                        <option value="oak">Raw Oak (Warm Natural)</option>
                        <option value="gold">Bespoke Gold (Metallic Brass)</option>
                        <option value="none">Borderless Canvas Wrap</option>
                    </select>
                </div>

                <div class="space-y-2">
                    <label class="block text-xs uppercase tracking-widest font-semibold text-stone-400 dark:text-stone-500">Room Scene Backdrop</label>
                    <div class="grid grid-cols-3 gap-2">
                        <button type="button" onclick="setBackdrop('living')" id="btn-back-living" class="backdrop-btn px-3 py-2 rounded-xl text-xs font-semibold bg-emerald-950 text-white border border-emerald-800 transition-all">Living Room</button>
                        <button type="button" onclick="setBackdrop('bedroom')" id="btn-back-bedroom" class="backdrop-btn px-3 py-2 rounded-xl text-xs font-semibold bg-stone-50 dark:bg-stone-900 text-stone-500 border border-stone-200 dark:border-stone-800 transition-all">Bedroom</button>
                        <button type="button" onclick="setBackdrop('office')" id="btn-back-office" class="backdrop-btn px-3 py-2 rounded-xl text-xs font-semibold bg-stone-50 dark:bg-stone-900 text-stone-500 border border-stone-200 dark:border-stone-800 transition-all">Study Office</button>
                    </div>
                </div>

                <div class="space-y-2">
                    <label class="block text-xs uppercase tracking-widest font-semibold text-stone-400 dark:text-stone-500">Upload Room Overlay</label>
                    <input id="roomImage" name="room_image" type="file" accept="image/*" class="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-950 file:text-white hover:file:opacity-90 cursor-pointer">
                </div>

                <button type="submit" class="w-full bg-emerald-900 text-white px-6 py-4 rounded-xl font-semibold hover:bg-emerald-800 shadow-[0_0_20px_rgba(6,78,59,0.3)] transition-all flex justify-center items-center gap-2 mt-4">
                    Save Design & Preview
                    <span class="material-symbols-outlined text-[20px]">design_services</span>
                </button>
            </form>
        </div>

        <!-- Canvas Showcase Card -->
        <div class="lg:col-span-8 lg:sticky lg:top-6 bg-white dark:bg-stone-950 p-8 rounded-3xl whisper-shadow border border-stone-100 dark:border-stone-900 flex flex-col gap-6 h-fit">
            <div>
                <div class="flex justify-between items-center mb-6">
                    <h2 class="font-headline-md text-xl text-primary">Room Visualizer</h2>
                    <span class="flex items-center gap-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full">
                        <span class="w-2 h-2 rounded-full bg-emerald-600 animate-ping"></span>
                        Real-time Rendering
                    </span>
                </div>
                
                <div class="relative rounded-2xl overflow-hidden border border-stone-200 dark:border-stone-800 bg-stone-100 whisper-shadow">
                    <canvas id="designCanvas" width="760" height="490" class="w-full h-auto block cursor-grab active:cursor-grabbing"></canvas>
                    <div class="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-black/50 text-white text-[10px] font-semibold px-3 py-1.5 rounded-full backdrop-blur-sm pointer-events-none">
                        <span class="material-symbols-outlined text-[14px]">open_with</span>
                        Drag to reposition frame
                    </div>
                    
                    <!-- Client-side Custom Prompt Loading Status Overlay -->
                    <div id="canvasLoader" class="absolute inset-0 bg-emerald-950/80 backdrop-blur-md flex flex-col items-center justify-center text-center text-white hidden space-y-4">
                        <span class="material-symbols-outlined text-[48px] animate-spin text-emerald-300">schema</span>
                        <div>
                            <h4 class="font-bold text-base" id="canvasLoaderTitle">Connecting to Gemini API...</h4>
                            <p class="text-xs text-stone-300 mt-1 font-mono" id="canvasLoaderMsg">Drafting vector design layers...</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="mt-6 flex flex-col sm:flex-row items-center gap-4 bg-stone-50 dark:bg-stone-900/50 p-4 rounded-2xl border border-stone-100 dark:border-stone-800">
                <span class="material-symbols-outlined text-emerald-800 text-3xl">info</span>
                <p class="text-xs text-stone-500 leading-relaxed">
                    <strong>Pro Visualizer Active:</strong> This visualizer places your customized moulding frame and passpartout design dynamically in space. Click **Generate AI Art** to create programmatic vector paintings live inside the frame mouldings!
                </p>
            </div>
        </div>
    </div>
</div>

<script>
    const form = document.getElementById('designForm');
    const designInput = document.getElementById('designJson');
    const colorInput = document.getElementById('designColor');
    const sizeInput = document.getElementById('designSize');
    const scaleInput = document.getElementById('productScale');
    const scaleDisplay = document.getElementById('productScaleDisplay');
    const frameStyleInput = document.getElementById('frameStyle');
    const canvas = document.getElementById('designCanvas');
    const context = canvas.getContext('2d');
    const PRODUCT_NAME = "{{ $product->name }}";

    const canvasLoader = document.getElementById('canvasLoader');
    const canvasLoaderTitle = document.getElementById('canvasLoaderTitle');
    const canvasLoaderMsg = document.getElementById('canvasLoaderMsg');

    // Preload beautiful Living Room / Bedroom / Office Mockups
    const backdrops = {
        living: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80',
        bedroom: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1200&q=80',
        office: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80'
    };

    let activeBackdropKey = 'living';
    const loadedImages = {};
    
    // Diagnostics logger helper function
    function addDiagLog(msg, colorClass = 'text-stone-400 dark:text-stone-500') {
        const logsDiv = document.getElementById('diagLogs');
        if (logsDiv) {
            const p = document.createElement('p');
            p.className = colorClass;
            p.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`;
            logsDiv.appendChild(p);
            logsDiv.scrollTop = logsDiv.scrollHeight;
        }
    }
    
    // Global Console Error Listener to print exactly why image loading fails!
    const _originalConsoleError = console.error;
    console.error = function(...args) {
        const errMsg = args.join(' ');
        addDiagLog("Console Error: " + errMsg, 'text-rose-500 font-bold font-mono');
        _originalConsoleError.apply(console, args);
    };
    window.addEventListener('error', function(e) {
        if (e.target && (e.target.tagName === 'IMG' || e.target instanceof HTMLImageElement)) {
            addDiagLog("Resource Error: Failed to load image from: " + e.target.src.substring(0, 70) + "...", 'text-amber-500 font-semibold font-mono');
        } else {
            addDiagLog("Runtime Exception: " + e.message + " at " + e.filename + ":" + e.lineno, 'text-rose-500 font-bold font-mono');
        }
    }, true);

    // Dynamic generated AI vector artwork specification memory
    let activeAiArtSpec = null;
    let generatedAiImage = null;

    // Preload product base image to show as the starting artwork in the visualizer frame
    const productBaseImageUrl = "{{ $product->image_path }}";
    let productBaseImage = null;

    function preloadBackdrops() {
        addDiagLog("Starting to preload backdrops...", 'text-stone-400');
        // Load mockups
        Object.entries(backdrops).forEach(([key, url]) => {
            const img = new Image();
            // Remove crossOrigin='anonymous' to prevent CORS block on Unsplash images
            img.onload = () => {
                addDiagLog(`Backdrop ${key} loaded successfully.`, 'text-emerald-400 font-mono');
                loadedImages[key] = img;
                if (key === activeBackdropKey) {
                    addDiagLog(`Rendering canvas with active backdrop: ${key}`, 'text-emerald-400 font-mono');
                    renderCanvas();
                }
            };
            img.onerror = () => {
                addDiagLog(`Warning: Failed to load backdrop ${key} from Unsplash.`, 'text-amber-500 font-mono');
            };
            img.src = url;
        });

        // Load product base image
        if (productBaseImageUrl) {
            addDiagLog("Loading product base image...", 'text-stone-400');
            const pImg = new Image();
            pImg.crossOrigin = 'anonymous';
            pImg.onload = () => {
                addDiagLog("Product base image loaded.", 'text-emerald-400 font-mono');
                productBaseImage = pImg;
                renderCanvas();
            };
            pImg.onerror = () => {
                addDiagLog("Warning: Failed to load product base image.", 'text-amber-500 font-mono');
            };
            pImg.src = productBaseImageUrl;
        }
    }

    function setBackdrop(key) {
        activeBackdropKey = key;
        
        document.querySelectorAll('.backdrop-btn').forEach(btn => {
            btn.className = 'backdrop-btn px-3 py-2 rounded-xl text-xs font-semibold bg-stone-50 dark:bg-stone-900 text-stone-500 border border-stone-200 dark:border-stone-800 transition-all';
        });

        const activeBtn = document.getElementById(`btn-back-${key}`);
        if (activeBtn) {
            activeBtn.className = 'backdrop-btn px-3 py-2 rounded-xl text-xs font-semibold bg-emerald-950 text-white border border-emerald-800 transition-all';
        }

        renderCanvas();
    }

    function setPresetColor(hex) {
        colorInput.value = hex;
        syncAndRender();
    }

    // Call AI Art Generation Endpoint
    function generateAiArt() {
        const promptInput = document.getElementById('aiArtPrompt');
        if (!promptInput.value.trim()) {
            alert('Please enter a creative design theme prompt first.');
            return;
        }

        // Clear previous diagnostic logs
        const diagLogs = document.getElementById('diagLogs');
        if (diagLogs) diagLogs.innerHTML = '';
        addDiagLog("AI Generation requested for prompt: '" + promptInput.value.trim() + "'", 'text-stone-300 font-semibold');

        // Show canvas overlay loaders
        canvasLoader.classList.remove('hidden');
        canvasLoaderTitle.textContent = 'Launching AI Curation...';
        canvasLoaderMsg.textContent = 'Connecting to Gemini API key...';

        const stages = [
            'Interpreting abstract color harmonies...',
            'Drafting dynamic geometric layers...',
            'Selecting frame mouldings configurations...',
            'Blending text accents...'
        ];
        let idx = 0;
        const progressInterval = setInterval(() => {
            if (idx < stages.length) {
                canvasLoaderMsg.textContent = stages[idx];
                idx++;
            }
        }, 1200);

        addDiagLog("Fetching programmatic spec from Gemini API...", 'text-emerald-500/80');

        fetch("{{ route('api.ai.generate_art') }}", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': '{{ csrf_token() }}',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ prompt: promptInput.value.trim() })
        })
        .then(async res => {
            const response = await res.json();
            if (!res.ok || response.status === 'error') {
                throw new Error(response.message || 'API Error');
            }
            return response;
        })
        .then(response => {
            clearInterval(progressInterval);

            const spec = response.data;
            activeAiArtSpec = spec;
            addDiagLog("Gemini Spec successfully parsed! Palette: " + (spec.palette_name || 'N/A'), 'text-emerald-400 font-bold');

            // Pre-populate controls with Gemini recommended parameters
            if (typeof textInput !== 'undefined' && textInput) {
                textInput.value = spec.typography || 'KaYa Art';
            }
            if (colorInput) {
                colorInput.value = spec.shape_color || '#d4af37';
            }
            if (typeof fontInput !== 'undefined' && fontInput) {
                fontInput.value = spec.curated_font || 'serif';
            }
            
            if (spec.curated_frame && spec.curated_frame !== 'none' && frameStyleInput) {
                frameStyleInput.value = spec.curated_frame;
            }

            // Populate Text Feedback block
            if(spec.palette_name) {
                document.getElementById('aiTextFeedback').classList.remove('hidden');
                document.getElementById('fbPalette').textContent = spec.palette_name;
                document.getElementById('fbLayout').textContent = spec.layout_description || 'Minimalist geometric layers.';
                document.getElementById('fbTypo').textContent = spec.typography_recommendation || 'Premium elegant styling.';
            }

            // Let's also launch the real-time AI image synthesizer using Pollinations AI!
            canvasLoaderTitle.textContent = 'Synthesizing AI Artwork...';
            canvasLoaderMsg.textContent = 'Generating custom design pixels via Neural Network...';

            addDiagLog("Initializing Pollinations AI image synthesizer...", 'text-sky-500/80');
            const aiImg = new Image();
            aiImg.crossOrigin = 'anonymous';
            aiImg.onload = () => {
                addDiagLog(`Success! AI image preloaded successfully. Size: ${aiImg.width}x${aiImg.height}`, 'text-emerald-400 font-semibold');
                generatedAiImage = aiImg;
                canvasLoader.classList.add('hidden');
                syncAndRender();
            };
            aiImg.onerror = (err) => {
                addDiagLog("Error: Pollinations AI preloading failed. Falling back to vector spec.", 'text-rose-400 font-semibold');
                console.error("AI preloading error details:", err);
                canvasLoader.classList.add('hidden');
                syncAndRender();
            };
            if (spec.synthesized_image_base64) {
                addDiagLog("Using server-side pre-fetched Base64 AI Image! CORS bypassed successfully.", 'text-sky-400 font-bold');
                aiImg.src = spec.synthesized_image_base64;
            } else {
                const randomSeed = Math.floor(Math.random() * 1000000);
                const synthesizedUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(promptInput.value.trim() + " premium interior wallpaper decor art")}?width=800&height=1000&nologo=true&seed=${randomSeed}`;
                addDiagLog("Server proxy missed. Falling back to direct client-side Pollinations URL...", 'text-amber-500/80');
                aiImg.src = synthesizedUrl;
            }
        })
        .catch(err => {
            clearInterval(progressInterval);
            canvasLoader.classList.add('hidden');
            addDiagLog("API Catch Error: " + err.message, 'text-rose-500 font-bold');
            alert('AI Generation Error: ' + err.message);
        });
    }

    function collectDesignData() {
        return {
            color: colorInput.value,
            size: sizeInput.value,
            scale: Number(scaleInput.value),
            frame_style: frameStyleInput.value,
            ai_art_spec: activeAiArtSpec, // Store AI spec structure alongside design JSON payload
            backdrop: activeBackdropKey,
            offset_x: typeof frameOffsetX !== 'undefined' ? frameOffsetX : undefined,
            offset_y: typeof frameOffsetY !== 'undefined' ? frameOffsetY : undefined,
            frame_w: typeof FRAME_W !== 'undefined' ? FRAME_W : undefined,
            frame_h: typeof FRAME_H !== 'undefined' ? FRAME_H : undefined,
            product_category: typeof PRODUCT_CATEGORY !== 'undefined' ? PRODUCT_CATEGORY : undefined
        };
    }

    // === DRAGGABLE FRAME STATE (must be declared before renderCanvas) ===
    const PRODUCT_CATEGORY = "{{ $product->category ?? 'Wall Decor' }}";
    let BASE_W = 280;
    let BASE_H = 360;

    if (PRODUCT_CATEGORY === 'Lighting') {
        BASE_W = 160;
        BASE_H = 240;
    } else if (PRODUCT_CATEGORY === 'Soft Furnishings') {
        BASE_W = 180;
        BASE_H = 180;
    } else if (PRODUCT_CATEGORY === 'Rugs & Mats') {
        BASE_W = 340;
        BASE_H = 150;
    } else if (PRODUCT_CATEGORY === 'Decorative Accents') {
        BASE_W = 130;
        BASE_H = 220;
    }

    let FRAME_W = BASE_W;
    let FRAME_H = BASE_H;
    let frameOffsetX = (760 - FRAME_W) / 2;
    let frameOffsetY = (PRODUCT_CATEGORY === 'Rugs & Mats') ? 310 : 120;
    let isDragging = false, dragSX, dragSY, dragOX, dragOY;

    function hexToRgba(hex, alpha) {
        let r = 6, g = 78, b = 59;
        if (hex && hex.startsWith('#')) {
            const h = hex.replace('#', '');
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
            // Draw beautiful cozy fairy string lights draped in room!
            ctx.save();
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.lineWidth = 1.5;

            // Wire 1
            ctx.beginPath();
            ctx.moveTo(fX, fY + fHeight * 0.25);
            ctx.bezierCurveTo(
                fX + fWidth * 0.25, fY + fHeight * 0.65,
                fX + fWidth * 0.75, fY + fHeight * 0.65,
                fX + fWidth, fY + fHeight * 0.25
            );
            ctx.stroke();

            // Wire 2
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
                    glow.addColorStop(0.5, hexToRgba(design.color, 0.65));
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
            // Draw a hanging Rattan Pendant Shade!
            ctx.save();

            // Suspension cord from ceiling
            ctx.strokeStyle = '#292524';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.moveTo(fX + fWidth/2, 0);
            ctx.lineTo(fX + fWidth/2, fY + fHeight * 0.25);
            ctx.stroke();

            // Warm bottom light glow
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

            // Pendant shade body
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

                // Cross-hatch rattan pattern
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

            // Bottom trim ring
            const baseColor = design.frame_style === 'gold' ? '#d4af37' : (design.frame_style === 'oak' ? '#8c6239' : '#1c1917');
            ctx.fillStyle = baseColor;
            ctx.fillRect(fX + fWidth * 0.15, fY + fHeight * 0.7, fWidth * 0.7, 6);
            ctx.restore();

        } else {
            // Default Table Lamp
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
            // Draw a cozy draped chunky knit throw blanket!
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

            // Chunky Rib Knit textures
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
            // Pillow / Cushion
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
        // Perspective Area Rug
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

        // Weaving border
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

        // Tassel fringes
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
            // Draw a realistic premium burning Soy Scented Candle!
            ctx.save();
            ctx.shadowColor = 'rgba(0,0,0,0.18)';
            ctx.shadowBlur = 8;
            ctx.shadowOffsetY = 4;

            // Flame glow
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

            // Wick and active flame
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

            // Amber/Ceramic Jar body
            let jarGrad = ctx.createLinearGradient(fX, fY, fX + fWidth, fY);
            jarGrad.addColorStop(0, hexToRgba(design.color, 0.9));
            jarGrad.addColorStop(0.3, '#ffffff');
            jarGrad.addColorStop(0.5, design.color);
            jarGrad.addColorStop(1, hexToRgba(design.color, 0.95));

            ctx.fillStyle = jarGrad;
            drawRoundedRect(ctx, fX + fWidth * 0.15, fY + fHeight * 0.38, fWidth * 0.7, fHeight * 0.55, 12);
            ctx.fill();

            // Custom elegant label
            ctx.fillStyle = '#fcfbf7';
            ctx.fillRect(fX + fWidth * 0.25, fY + fHeight * 0.5, fWidth * 0.5, fHeight * 0.3);
            ctx.strokeStyle = 'rgba(0,0,0,0.15)';
            ctx.strokeRect(fX + fWidth * 0.25, fY + fHeight * 0.5, fWidth * 0.5, fHeight * 0.3);

            ctx.fillStyle = '#292524';
            ctx.font = 'bold 11px serif';
            ctx.textAlign = 'center';
            ctx.fillText("KAYA", fX + fWidth/2, fY + fHeight * 0.62);
            ctx.font = '7px sans-serif';
            ctx.fillText("SOY WAX", fX + fWidth/2, fY + fHeight * 0.72);

            ctx.restore();

        } else if (isTray) {
            // Draw a beautiful handwoven Seagrass Tray!
            ctx.save();
            ctx.shadowColor = 'rgba(0,0,0,0.22)';
            ctx.shadowBlur = 10;
            ctx.shadowOffsetY = 6;

            // Flat woven ellipse tray
            let trayColor = design.color;
            ctx.fillStyle = trayColor;
            ctx.beginPath();
            ctx.ellipse(fX + fWidth/2, fY + fHeight * 0.6, fWidth * 0.45, fHeight * 0.25, 0, 0, Math.PI * 2);
            ctx.fill();

            // Weave patterns
            ctx.strokeStyle = 'rgba(255,255,255,0.25)';
            ctx.lineWidth = 1.5;
            for (let r = 10; r < fWidth * 0.4; r += 12) {
                ctx.beginPath();
                ctx.ellipse(fX + fWidth/2, fY + fHeight * 0.6, r, r * 0.5, 0, 0, Math.PI * 2);
                ctx.stroke();
            }

            // Leather handles
            ctx.fillStyle = design.frame_style === 'oak' ? '#8c6239' : '#292524';
            ctx.fillRect(fX + fWidth * 0.05, fY + fHeight * 0.55, 12, fHeight * 0.1);
            ctx.fillRect(fX + fWidth * 0.88, fY + fHeight * 0.55, 12, fHeight * 0.1);

            ctx.restore();
        } else {
            // Vase Set (3)
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
            // Draw realistic Hexagonal Wall Mirror!
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

            // Outer wooden hexagon frame
            let frameColor = '#1c1917';
            if (design.frame_style === 'oak') frameColor = '#b58c5c';
            else if (design.frame_style === 'gold') frameColor = '#d4af37';
            ctx.fillStyle = frameColor;
            drawHex(fX, fY, fWidth, fHeight);
            ctx.fill();

            // Specular reflection mirror bounds
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

            // Gloss sheen specular line
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
            // Draw a gorgeous Japandi/Boho Woven Cotton Macrame!
            ctx.save();
            ctx.shadowColor = 'rgba(0,0,0,0.22)';
            ctx.shadowBlur = 10;
            ctx.shadowOffsetY = 6;

            // Hanger wire
            ctx.strokeStyle = '#a8a29e';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(fX + fWidth/2, fY + fHeight * 0.05);
            ctx.lineTo(fX + fWidth * 0.1, fY + fHeight * 0.2);
            ctx.lineTo(fX + fWidth * 0.9, fY + fHeight * 0.2);
            ctx.closePath();
            ctx.stroke();

            // Dowel branch
            const woodColor = design.frame_style === 'oak' ? '#8c6239' : (design.frame_style === 'gold' ? '#d4af37' : '#292524');
            ctx.fillStyle = woodColor;
            ctx.fillRect(fX + fWidth * 0.05, fY + fHeight * 0.18, fWidth * 0.9, 10);

            // Natural organic off-white cords
            ctx.strokeStyle = '#e7e5e4';
            if (design.color !== '#fafaf9') ctx.strokeStyle = hexToRgba(design.color, 0.95);

            ctx.lineWidth = 3;
            for (let x = fX + fWidth * 0.15; x <= fX + fWidth * 0.85; x += 12) {
                ctx.beginPath();
                ctx.moveTo(x, fY + fHeight * 0.2);
                ctx.lineTo(x, fY + fHeight * 0.65);
                ctx.stroke();
            }

            // Cross knit details
            ctx.lineWidth = 1.5;
            for (let y = fY + fHeight * 0.25; y <= fY + fHeight * 0.55; y += 15) {
                ctx.beginPath();
                ctx.moveTo(fX + fWidth * 0.15, y);
                ctx.lineTo(fX + fWidth * 0.85, y + 20);
                ctx.moveTo(fX + fWidth * 0.85, y);
                ctx.lineTo(fX + fWidth * 0.15, y + 20);
                ctx.stroke();
            }

            // Fringes in V-shape
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
            // Standard Framed Art Canvas
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

    function renderCanvas() {
        const design = collectDesignData();
        const width = canvas.width;
        const height = canvas.height;

        context.clearRect(0, 0, width, height);

        // 1. Draw scene backdrop mockup uploader or fallback solid
        const roomImg = loadedImages[activeBackdropKey];
        if (roomImg) {
            context.drawImage(roomImg, 0, 0, width, height);
        } else {
            const gradient = context.createLinearGradient(0, 0, width, height);
            gradient.addColorStop(0, '#f5f5f4');
            gradient.addColorStop(1, '#e7e5e4');
            context.fillStyle = gradient;
            context.fillRect(0, 0, width, height);
        }

        // Dynamically compute product scale factors based on Interactive Decor Scale slider
        const scaleFactor = (design.scale || 100) / 100;
        FRAME_W = BASE_W * scaleFactor;
        FRAME_H = BASE_H * scaleFactor;

        // 2. Draggable coordinates
        const fWidth = FRAME_W;
        const fHeight = FRAME_H;
        const fX = frameOffsetX;
        const fY = frameOffsetY;

        // 3. Draw category specific customized product visualizer overlay
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
        }

        // Ruler dimensions line guides
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

    function syncAndRender() {
        const data = collectDesignData();
        designInput.value = JSON.stringify(data);
        scaleDisplay.textContent = `${scaleInput.value}%`;
        renderCanvas();
    }

    // Dynamic Room Upload file logic
    const roomImageInput = document.getElementById('roomImage');
    roomImageInput.addEventListener('change', function(e) {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = function(event) {
                const img = new Image();
                img.onload = () => {
                    addDiagLog("Local room overlay uploaded and preloaded successfully.", "text-emerald-400 font-bold");
                    loadedImages['uploaded'] = img;
                    setBackdrop('uploaded');
                };
                img.onerror = (err) => {
                    addDiagLog("Error preloading uploaded room photo: " + (err.message || "Unknown error"), "text-rose-500 font-bold");
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    });

    // === DRAGGABLE FRAME EVENTS ===
    function canvasMouse(e) {
        const r  = canvas.getBoundingClientRect();
        const sx = canvas.width  / r.width;
        const sy = canvas.height / r.height;
        return { x: (e.clientX - r.left) * sx, y: (e.clientY - r.top) * sy };
    }
    function inFrame(mx, my) {
        return mx >= frameOffsetX && mx <= frameOffsetX + FRAME_W &&
               my >= frameOffsetY && my <= frameOffsetY + FRAME_H;
    }

    canvas.addEventListener('mousedown', e => {
        const { x, y } = canvasMouse(e);
        if (inFrame(x, y)) {
            isDragging = true; dragSX = x; dragSY = y;
            dragOX = frameOffsetX; dragOY = frameOffsetY;
        }
    });
    canvas.addEventListener('mousemove', e => {
        const { x, y } = canvasMouse(e);
        canvas.style.cursor = inFrame(x, y) ? 'grab' : 'default';
        if (!isDragging) return;
        canvas.style.cursor = 'grabbing';
        frameOffsetX = Math.max(0, Math.min(760 - FRAME_W, dragOX + x - dragSX));
        frameOffsetY = Math.max(0, Math.min(490 - FRAME_H, dragOY + y - dragSY));
        renderCanvas();
    });
    canvas.addEventListener('mouseup',    () => { isDragging = false; });
    canvas.addEventListener('mouseleave', () => { isDragging = false; });

    [colorInput, sizeInput, scaleInput, frameStyleInput].forEach((element) => {
        if (element) element.addEventListener('input', syncAndRender);
    });

    form.addEventListener('submit', syncAndRender);
    
    // Parse query string parameters on load (e.g. from AI Curation results redirects)
    function initializeCustomizer() {
        addDiagLog("Initializing customizer scripts...", 'text-stone-300 font-semibold');
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has('color') && colorInput) {
            colorInput.value = urlParams.get('color');
        }
        if (urlParams.has('frame_style') && frameStyleInput) {
            frameStyleInput.value = urlParams.get('frame_style');
        }
        
        preloadBackdrops();
        syncAndRender();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeCustomizer);
    } else {
        initializeCustomizer();
    }
</script>
@endsection
