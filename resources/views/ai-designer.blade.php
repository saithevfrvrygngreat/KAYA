@extends('layouts.app')

@section('content')
<div class="max-w-7xl mx-auto px-6 md:px-12 py-12">
    <div class="mb-10">
        <span class="inline-block px-3 py-1 mb-3 rounded-full bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 font-label-sm uppercase tracking-widest text-[11px] font-bold">✨ KaYa AI Design Suite</span>
        <h1 class="font-display-xl text-4xl md:text-5xl text-primary leading-tight">Bespoke Spatial Harmonizer</h1>
        <p class="font-body-md text-stone-500 max-w-2xl leading-relaxed mt-2">
            Empower your architectural vision. Let KaYa’s neural sensory engine decode your room dimensions, ambient lighting, and aesthetic objective to curate pure space tranquility.
        </p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        <!-- Settings Form Panel -->
        <div class="lg:col-span-4 bg-white dark:bg-stone-950 p-8 rounded-[2rem] whisper-shadow border border-stone-100 dark:border-stone-900 h-fit space-y-6">
            <h2 class="font-headline-md text-xl text-primary flex items-center gap-2">
                <span class="material-symbols-outlined text-emerald-800 animate-pulse">spatial_tracking</span>
                Spatial Diagnostics
            </h2>

            <form id="aiDesignerForm" class="space-y-6">
                @csrf
                <div class="space-y-2">
                    <label class="block text-xs uppercase tracking-widest font-semibold text-stone-400 dark:text-stone-500">Design Objective & Vibe</label>
                    <textarea id="objective" name="objective" rows="4" required class="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 px-4 py-3 rounded-xl focus:outline-none focus:border-emerald-600 transition-colors text-stone-900 dark:text-white text-sm" placeholder="e.g. I want to design a serene Japandi reading corner with warm earth tones, soft linen fabrics, and modern wooden frames..."></textarea>
                </div>

                <div class="space-y-2">
                    <label class="block text-xs uppercase tracking-widest font-semibold text-stone-400 dark:text-stone-500">Environment Template</label>
                    <select id="roomScene" name="room_scene" class="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 px-4 py-3 rounded-xl focus:outline-none focus:border-emerald-600 transition-colors text-stone-900 dark:text-white text-sm">
                        <option value="living" selected>Lounge Living Room</option>
                        <option value="bedroom">Sanctuary Bedroom</option>
                        <option value="office">Creative Studio Office</option>
                    </select>
                </div>

                <div class="space-y-2">
                    <label class="block text-xs uppercase tracking-widest font-semibold text-stone-400 dark:text-stone-500">Room Wall Photo (Optional)</label>
                    <div class="border-2 border-dashed border-stone-200 dark:border-stone-800 hover:border-emerald-800 transition-colors rounded-2xl p-4 text-center cursor-pointer relative" id="dropzone">
                        <input type="file" id="customImage" name="custom_image" accept="image/*" class="absolute inset-0 opacity-0 cursor-pointer">
                        <span class="material-symbols-outlined text-stone-300 text-4xl block mb-2" id="uploadIcon">cloud_upload</span>
                        <p class="text-xs font-semibold text-stone-500" id="uploadText">Drag & drop or click to upload wall photo</p>
                        <img id="previewThumb" class="hidden w-full max-h-[140px] object-cover rounded-xl mt-2 border border-stone-200">
                    </div>
                </div>

                <button type="submit" class="w-full bg-emerald-950 text-white px-6 py-4 rounded-xl font-bold hover:opacity-90 shadow-[0_0_20px_rgba(6,78,59,0.25)] transition-all flex justify-center items-center gap-2">
                    Analyze Space Harmony
                    <span class="material-symbols-outlined text-[20px]">auto_awesome</span>
                </button>
            </form>
        </div>

        <!-- Diagnostic Showcase & Results Panel -->
        <div class="lg:col-span-8 bg-white dark:bg-stone-950 p-8 rounded-[2rem] whisper-shadow border border-stone-100 dark:border-stone-900 min-h-[500px] flex flex-col justify-between" id="showcaseContainer">
            
            <!-- Empty State & Loading -->
            <div id="aiEmptyState" class="flex flex-col items-center justify-center text-center my-auto space-y-6">
                <div class="w-20 h-20 rounded-full bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 flex items-center justify-center">
                    <span class="material-symbols-outlined text-[42px] animate-pulse">neurology</span>
                </div>
                <div class="space-y-2">
                    <h3 class="font-headline-md text-xl text-primary font-bold">Space Harmony Scanner Offline</h3>
                    <p class="text-xs text-stone-500 max-w-sm mx-auto leading-relaxed">
                        Input your design vision, select your target environment coordinates, and click analyze to launch our spatial curation diagnostics.
                    </p>
                </div>
            </div>

            <!-- Loading Spinner State -->
            <div id="aiLoadingState" class="hidden flex flex-col items-center justify-center text-center my-auto space-y-6 py-12">
                <div class="relative w-24 h-24 flex items-center justify-center bg-emerald-500/10 text-emerald-800 rounded-full">
                    <span class="material-symbols-outlined text-[46px] animate-spin">cyclone</span>
                    <div class="absolute inset-0 border-4 border-emerald-500/30 rounded-full scale-110 animate-ping opacity-25"></div>
                </div>
                <div class="space-y-3">
                    <h4 class="text-lg font-bold text-primary" id="loadingTitle">Initiating AI Diagnostic Pipeline...</h4>
                    <div class="w-full bg-stone-100 dark:bg-stone-900 h-1.5 rounded-full overflow-hidden max-w-xs mx-auto">
                        <div class="bg-emerald-950 dark:bg-emerald-500 h-full transition-all duration-300" id="progressWidth" style="width: 15%;"></div>
                    </div>
                    <p class="text-xs font-mono text-emerald-950 dark:text-emerald-400" id="progressText">Connecting to Gemini AI Engine...</p>
                </div>
            </div>

            <!-- Diagnostics Active State (Results Screen) -->
            <div id="aiResultsState" class="hidden space-y-8">
                <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-stone-100 dark:border-stone-900 pb-6 gap-4">
                    <div>
                        <span class="inline-block px-3 py-1 mb-2 rounded-full bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold uppercase tracking-widest">Diagnostic Report Active</span>
                        <h2 class="font-headline-md text-2xl text-primary">Spatial Curation Output</h2>
                    </div>
                    <span class="flex items-center gap-1.5 text-[11px] font-bold text-emerald-800 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full">
                        <span class="material-symbols-outlined text-[14px]">bolt</span>
                        Cognitive Model Verified
                    </span>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <!-- Left: Spatial Harmony -->
                    <div class="space-y-6">
                        <div class="p-6 bg-stone-50 dark:bg-stone-900/40 rounded-3xl border border-stone-100 dark:border-stone-900/50">
                            <h3 class="text-xs uppercase tracking-widest font-bold text-stone-400 mb-4">Spatial Harmony Diagnostics</h3>
                            <div class="prose prose-sm dark:prose-invert text-stone-600 dark:text-stone-300 text-xs leading-relaxed space-y-4" id="resHarmony">
                                <!-- Harmony markdown gets rendered here -->
                            </div>
                        </div>

                        <div class="p-6 bg-stone-50 dark:bg-stone-900/40 rounded-3xl border border-stone-100 dark:border-stone-900/50">
                            <h3 class="text-xs uppercase tracking-widest font-bold text-stone-400 mb-4 font-plus-jakarta-sans">KaYa Palette Swatches</h3>
                            <div class="grid grid-cols-2 gap-3" id="resPalette">
                                <!-- Palette swatches list dynamically gets appended here -->
                            </div>
                        </div>
                    </div>

                    <!-- Right: Styling Tips & Recommended Spec Card -->
                    <div class="space-y-6">
                        <div class="p-6 bg-stone-50 dark:bg-stone-900/40 rounded-3xl border border-stone-100 dark:border-stone-900/50">
                            <h3 class="text-xs uppercase tracking-widest font-bold text-stone-400 mb-4">Space Styling Suggestions</h3>
                            <div class="prose prose-sm dark:prose-invert text-stone-600 dark:text-stone-300 text-xs leading-relaxed space-y-4" id="resStyling">
                                <!-- Styling advice markdown gets rendered here -->
                            </div>
                        </div>

                        <!-- Curation Recommendation Card -->
                        <div class="p-6 bg-emerald-950 text-white rounded-[2rem] border border-emerald-900 shadow-xl flex flex-col justify-between gap-6">
                            <div class="space-y-2">
                                <span class="inline-block px-2.5 py-0.5 rounded-full bg-emerald-500/25 text-emerald-300 text-[9px] font-bold uppercase tracking-widest">Recommended Base Product</span>
                                <h4 class="font-bold text-lg" id="recProductName">Premium Visualizer Frame</h4>
                                <p class="text-xs text-stone-300 leading-relaxed" id="recProductDesc">
                                    Bespoke tailored timber canvas layout designed by AI spatial constraints analysis.
                                </p>
                            </div>

                            <a href="#" id="recProductLink" class="w-full bg-white text-emerald-950 py-3.5 rounded-xl font-bold text-center text-xs hover:bg-stone-100 transition-colors flex justify-center items-center gap-1.5 shadow-lg">
                                Configure Spec In Visualizer
                                <span class="material-symbols-outlined text-[16px]">arrow_forward</span>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<script>
    const form = document.getElementById('aiDesignerForm');
    const dropzone = document.getElementById('dropzone');
    const customImage = document.getElementById('customImage');
    const previewThumb = document.getElementById('previewThumb');
    const uploadIcon = document.getElementById('uploadIcon');
    const uploadText = document.getElementById('uploadText');

    const aiEmptyState = document.getElementById('aiEmptyState');
    const aiLoadingState = document.getElementById('aiLoadingState');
    const aiResultsState = document.getElementById('aiResultsState');

    const loadingTitle = document.getElementById('loadingTitle');
    const progressWidth = document.getElementById('progressWidth');
    const progressText = document.getElementById('progressText');

    const resHarmony = document.getElementById('resHarmony');
    const resStyling = document.getElementById('resStyling');
    const resPalette = document.getElementById('resPalette');
    const recProductName = document.getElementById('recProductName');
    const recProductDesc = document.getElementById('recProductDesc');
    const recProductLink = document.getElementById('recProductLink');

    // Injected dynamic database products
    const rawProducts = @json($products->map(function($p) {
        return [
            'id' => $p->id,
            'name' => $p->name,
            'description' => $p->description
        ];
    }));

    // Thumbnail Preview logic
    customImage.addEventListener('change', function(e) {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = function(event) {
                previewThumb.src = event.target.result;
                previewThumb.classList.remove('hidden');
                uploadIcon.classList.add('hidden');
                uploadText.textContent = `Uploaded: ${e.target.files[0].name}`;
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    });

    // Form submission spatial diagnostis pipeline
    form.addEventListener('submit', function(e) {
        e.preventDefault();

        // 1. Enter Loading screen
        aiEmptyState.classList.add('hidden');
        aiResultsState.classList.add('hidden');
        aiLoadingState.classList.remove('hidden');

        // Progress loader log steps simulation
        const steps = [
            { t: 'Initiating AI Curation Engine...', p: 20, msg: 'Resolving gateway routes...' },
            { t: 'Uploading space assets...', p: 45, msg: 'Analysing image contrast values...' },
            { t: 'Evaluating space constraints...', p: 70, msg: 'Running multi-modal lighting diagnostics...' },
            { t: 'Finalizing space harmony palette...', p: 90, msg: 'Gemini cognitive processing concluding...' }
        ];

        let currentStep = 0;
        const logInterval = setInterval(() => {
            if (currentStep < steps.length) {
                loadingTitle.textContent = steps[currentStep].t;
                progressWidth.style.width = steps[currentStep].p + '%';
                progressText.textContent = steps[currentStep].msg;
                currentStep++;
            } else {
                clearInterval(logInterval);
            }
        }, 1100);

        // 2. Build form data payload
        const formData = new FormData(form);

        fetch("{{ route('api.ai.analyze_room') }}", {
            method: 'POST',
            body: formData,
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        })
        .then(res => res.json())
        .then(response => {
            clearInterval(logInterval);
            
            // Finish loading animation
            progressWidth.style.width = '100%';
            setTimeout(() => {
                aiLoadingState.classList.add('hidden');
                aiResultsState.classList.remove('hidden');
                renderResults(response.data);
            }, 300);
        })
        .catch(err => {
            clearInterval(logInterval);
            aiLoadingState.classList.add('hidden');
            aiEmptyState.classList.remove('hidden');
            alert('Failed to run diagnostics. Please review your connection.');
        });
    });

    function renderResults(data) {
        // Render markdown summaries into diagnostic blocks
        resHarmony.innerHTML = parseSimpleMarkdown(data.harmony_analysis);
        resStyling.innerHTML = parseSimpleMarkdown(data.styling_tips);

        // Render Color swatches
        resPalette.innerHTML = '';
        data.palette.forEach(color => {
            const swatch = document.createElement('div');
            swatch.className = 'flex items-center gap-3 p-3 bg-white dark:bg-stone-900 rounded-xl border border-stone-200/60 dark:border-stone-800 shadow-sm';
            swatch.innerHTML = `
                <span class="w-8 h-8 rounded-full border border-white/20 shadow-md block flex-shrink-0" style="background-color: ${color.hex}"></span>
                <div class="overflow-hidden">
                    <h4 class="font-bold text-xs text-primary truncate">${color.name}</h4>
                    <p class="font-mono text-[9px] text-stone-400 uppercase tracking-widest">${color.hex}</p>
                </div>
            `;
            resPalette.appendChild(swatch);
        });

        // Set Recommended base product spec
        let recommendedProduct = { id: 1, name: 'Bespoke Wall Gallery Frame', description: 'Handcrafted premium timber canvas visualizer framework.' };
        if (rawProducts && rawProducts.length > 0) {
            recommendedProduct = rawProducts[0];
        }

        recProductName.textContent = recommendedProduct.name;
        recProductDesc.textContent = recommendedProduct.description;

        // Custom config link carrying pre-populated AI swatches and styles
        const targetUrl = `/products/${recommendedProduct.id}/customize?color=${encodeURIComponent(data.recommended_frame_color)}&frame_style=${encodeURIComponent(data.recommended_frame_style)}`;
        recProductLink.href = targetUrl;
    }

    // Helper: Simple client-side Markdown parser to handle basic lists and headers safely
    function parseSimpleMarkdown(text) {
        if (!text) return '';
        let html = text;
        html = html.replace(/^### (.*$)/gim, '<h4 class="font-bold text-sm text-primary mb-2 mt-4 font-plus-jakarta-sans">$1</h4>');
        html = html.replace(/^\* (.*$)/gim, '<li class="ml-4 list-disc text-stone-500 mb-1">$1</li>');
        html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-primary">$1</strong>');
        html = html.replace(/\n\n/g, '<p class="mb-3"></p>');
        return html;
    }
</script>
@endsection
