<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\View\View;

class AiCurationController extends Controller
{
    /**
     * Launch the Aura AI Interior Designer Suite
     */
    public function index(): View
    {
        $products = Product::where('is_active', true)->get();
        return view('ai-designer', compact('products'));
    }

    /**
     * Generate customized abstract art specs using Gemini AI
     */
    public function generateArtSpec(Request $request): JsonResponse
    {
        $request->validate([
            'prompt' => ['required', 'string', 'max:255'],
        ]);

        $prompt = $request->input('prompt');
        $apiKey = env('GEMINI_API_KEY');

        // Fallback specs in case Gemini API is not configured or fails
        $fallbacks = [
            'bohemian' => [
                'gradient_start' => '#fdfc47',
                'gradient_end' => '#240b36',
                'primary_shape' => 'sun',
                'shape_color' => '#d4af37',
                'accent_shapes' => [
                    ['shape' => 'circle', 'x_pct' => 30, 'y_pct' => 40, 'size' => 15, 'color' => '#b58c5c'],
                    ['shape' => 'stripes', 'x_pct' => 50, 'y_pct' => 70, 'size' => 60, 'color' => '#78350f']
                ],
                'typography' => 'Solitude & Light',
                'curated_font' => 'serif',
                'curated_frame' => 'oak'
            ],
            'minimal' => [
                'gradient_start' => '#faf9f6',
                'gradient_end' => '#e5e5e0',
                'primary_shape' => 'arch',
                'shape_color' => '#1c1917',
                'accent_shapes' => [
                    ['shape' => 'circle', 'x_pct' => 70, 'y_pct' => 30, 'size' => 20, 'color' => '#d4af37']
                ],
                'typography' => 'Silence',
                'curated_font' => 'sans-serif',
                'curated_frame' => 'black'
            ],
            'emerald' => [
                'gradient_start' => '#064e3b',
                'gradient_end' => '#022c22',
                'primary_shape' => 'circle',
                'shape_color' => '#f5f5f4',
                'accent_shapes' => [
                    ['shape' => 'arch', 'x_pct' => 50, 'y_pct' => 60, 'size' => 45, 'color' => '#d4af37']
                ],
                'typography' => 'Royal Sanctuary',
                'curated_font' => 'fantasy',
                'curated_frame' => 'gold'
            ]
        ];

        // Determine which fallback matches the prompt keywords
        $lowerPrompt = strtolower($prompt);
        $selectedFallback = $fallbacks['minimal'];
        if (str_contains($lowerPrompt, 'boho') || str_contains($lowerPrompt, 'bohemian') || str_contains($lowerPrompt, 'sun') || str_contains($lowerPrompt, 'earth')) {
            $selectedFallback = $fallbacks['bohemian'];
        } elseif (str_contains($lowerPrompt, 'emerald') || str_contains($lowerPrompt, 'green') || str_contains($lowerPrompt, 'velvet') || str_contains($lowerPrompt, 'luxury')) {
            $selectedFallback = $fallbacks['emerald'];
        }

        if (empty($apiKey)) {
            Log::error('Gemini API Key missing. Cannot generate AI design.');
            return response()->json([
                'status' => 'error',
                'message' => 'GEMINI_API_KEY is not configured in the .env file. Please add your key to use the AI Generator.'
            ], 400);
        }

        try {
            $systemInstruction = "You are a professional abstract graphic design engine for luxury canvas prints. You generate design specs in valid JSON format ONLY. Do not wrap JSON in Markdown code block quotes (e.g. do not use ```json). Response must start and end with curly brackets. IMPORTANT: Be highly creative, dynamic, and extremely random with your color palettes, shape selections, and layout placements every single time you are called. Never output the same design twice.";
            
            $promptMessage = "Analyze this visual art design prompt: '{$prompt}'. Generate a highly unique, unpredictable, and beautiful minimalist canvas print graphic design structure. Ensure the colors and shapes are drastically different from standard defaults. Respond ONLY with a valid flat JSON block with keys: 'gradient_start' (hex color), 'gradient_end' (hex color), 'primary_shape' (one of: 'circle', 'arch', 'sun', 'mountain', 'stripes'), 'shape_color' (hex color), 'accent_shapes' (array of 1 to 3 objects with keys: 'shape', 'x_pct' (0-100), 'y_pct' (0-100), 'size' (10-50), 'color'), 'typography' (an elegant 2-4 word artistic quote matching the theme), 'curated_font' (one of: 'serif', 'sans-serif', 'fantasy', 'monospace'), 'curated_frame' (one of: 'gold', 'oak', 'black', 'none'), 'palette_name' (a creative name for the color scheme), 'layout_description' (a 2-sentence description of the visual layout and why it works), 'typography_recommendation' (a 1-sentence explanation of why the font was chosen).";

            $response = Http::withHeaders([
                'Content-Type' => 'application/json'
            ])->post("https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key={$apiKey}", [
                'contents' => [
                    [
                        'parts' => [
                            ['text' => $systemInstruction . "\n\n" . $promptMessage]
                        ]
                    ]
                ],
                'generationConfig' => [
                    'responseMimeType' => 'application/json',
                    'temperature' => 1.5,
                    'topK' => 40,
                    'topP' => 0.95
                ]
            ]);

            if ($response->successful()) {
                $rawText = $response->json('candidates.0.content.parts.0.text');
                // Sanitize any occasional raw markdown blocks
                $cleanedText = preg_replace('/```(?:json)?|```/', '', $rawText);
                $specData = json_decode(trim($cleanedText), true);

                if (is_array($specData)) {
                    // Server-side proxy for the synthesized AI image to completely bypass browser CORS limitations!
                    try {
                        $seed = rand(100000, 999999);
                        $pollinationsUrl = "https://image.pollinations.ai/prompt/" . rawurlencode($prompt . " premium interior wallpaper decor art") . "?width=800&height=1000&nologo=true&seed=" . $seed;
                        
                        $imageResponse = Http::timeout(15)->get($pollinationsUrl);
                        if ($imageResponse->successful()) {
                            $base64Image = base64_encode($imageResponse->body());
                            $specData['synthesized_image_base64'] = "data:image/jpeg;base64," . $base64Image;
                        } else {
                            Log::warning("Server-side Pollinations pre-fetch returned status: " . $imageResponse->status());
                        }
                    } catch (\Exception $imgEx) {
                        Log::error("Server-side Pollinations pre-fetch exception: " . $imgEx->getMessage());
                    }

                    return response()->json([
                        'status' => 'success',
                        'source' => 'gemini_ai',
                        'data' => $specData
                    ]);
                }
            }

            Log::error('Gemini Art Spec call failed or returned invalid JSON structure, serving fallback specs.', [
                'status' => $response->status(),
                'body' => $response->body()
            ]);
        } catch (\Exception $e) {
            Log::error('Exception in Gemini Art Spec Curation: ' . $e->getMessage());
        }

        // Fetch Pollinations image for fallback spec too!
        try {
            $seed = rand(100000, 999999);
            $pollinationsUrl = "https://image.pollinations.ai/prompt/" . rawurlencode($prompt . " premium interior wallpaper decor art") . "?width=800&height=1000&nologo=true&seed=" . $seed;
            
            $imageResponse = Http::timeout(15)->get($pollinationsUrl);
            if ($imageResponse->successful()) {
                $base64Image = base64_encode($imageResponse->body());
                $selectedFallback['synthesized_image_base64'] = "data:image/jpeg;base64," . $base64Image;
            }
        } catch (\Exception $imgEx) {
            Log::error("Server-side Pollinations fallback fetch exception: " . $imgEx->getMessage());
        }

        return response()->json([
            'status' => 'success',
            'source' => 'curation_engine_fallback_error',
            'data' => $selectedFallback
        ]);
    }

    /**
     * Run multi-modal Gemini space diagnostics
     */
    public function analyzeRoom(Request $request): JsonResponse
    {
        $request->validate([
            'objective' => ['required', 'string', 'max:255'],
            'room_scene' => ['required', 'string'],
            'custom_image' => ['nullable', 'image', 'max:4096']
        ]);

        $objective = $request->input('objective');
        $scene = $request->input('room_scene');
        $apiKey = env('GEMINI_API_KEY');

        // High quality fallback reports depending on target scenes
        $fallbacks = [
            'living' => [
                'harmony_analysis' => "### Spatial Diagnostics: Living Room Lounge\n\nYour living room features a bright, sun-drenched configuration with high exposure. The existing walls present a neutral alabaster base. The key visual challenge is creating a focal anchor above low-profile seating to ground the gaze.\n\n* **Lighting Assessment:** Excellent soft natural light. High glare potential during mid-day suggests warm wood or golden metallic mouldings to diffuse light scattering.\n* **Symmetry Ratio:** 82% aligned. Balanced but requires structural wall art placements.",
                'styling_tips' => "### Aura Styling Recommendations\n\n1. **Wall Art Placement:** Center a premium, large **A2 Oak wood frame** approximately 12 inches above the velvet sofa backrest.\n2. **Textile Accentuation:** Blend emerald velvet scatter cushions with rustic amber throws to tie the botanical energies together.\n3. **Foliage Integration:** Place a tall, broad-leaf Fiddle Leaf Fig or Monstera in an earthy terracotta pot in the empty corner.",
                'palette' => [
                    ['name' => 'Botanical Emerald', 'hex' => '#064e3b'],
                    ['name' => 'Warm Ochre', 'hex' => '#b58c5c'],
                    ['name' => 'Champagne Sand', 'hex' => '#fef3c7'],
                    ['name' => 'Charcoal Ash', 'hex' => '#1c1917']
                ],
                'recommended_frame_color' => '#064e3b',
                'recommended_frame_style' => 'oak'
            ],
            'bedroom' => [
                'harmony_analysis' => "### Spatial Diagnostics: Sanctuary Bedroom\n\nThis sanctuary bedroom context focuses heavily on calming symmetry and low visual noise. Soft indirect light scatter is present, pointing to pastel alabasters and neutral textures.\n\n* **Lighting Assessment:** Warm and cozy warm lighting. Low blue-spectrum exposure allows highly tranquil colors to pop without feeling abrasive.\n* **Symmetry Ratio:** 90% aligned. Highly harmonious layout.",
                'styling_tips' => "### Aura Styling Recommendations\n\n1. **Wall Art Placement:** Position dual A3 oak or borderless frames symmetrically above the headboard.\n2. **Linen Selection:** Introduce stone-washed champagne linen sheet sets to echo the warmth of the frame borders.\n3. **Illumination:** Soft diffused bedside lamps with amber warm bulbs (2700K) to highlight frame texture details.",
                'palette' => [
                    ['name' => 'Champagne Sand', 'hex' => '#fef3c7'],
                    ['name' => 'Earthy Terracotta', 'hex' => '#78350f'],
                    ['name' => 'Sage Haze', 'hex' => '#80bea6'],
                    ['name' => 'Slate Cloud', 'hex' => '#dee9fc']
                ],
                'recommended_frame_color' => '#fef3c7',
                'recommended_frame_style' => 'none'
            ],
            'office' => [
                'harmony_analysis' => "### Spatial Diagnostics: Creative Office\n\nYour home study currently operates under sharp task lighting. It lacks deep geometric accents, which can lead to fatigue. Adding a crisp high-contrast focal print stimulates spatial activity and creativity.\n\n* **Lighting Assessment:** Bright desktop LED exposure. High-contrast frames prevent details from getting washed out under direct beam exposure.\n* **Symmetry Ratio:** 75% aligned. Dynamic and modern asymmetric space.",
                'styling_tips' => "### Aura Styling Recommendations\n\n1. **Wall Art Placement:** An asymmetric golden brass A2 frame hung adjacent to the secondary work desk.\n2. **Desk Elements:** Steel-finish desktop organizers, brass lighting fixtures, and leather desk pads matching the primary colors.\n3. **Vertical Accents:** Minimalist wall shelves featuring architectural models or high-end ceramics.",
                'palette' => [
                    ['name' => 'Deep Navy', 'hex' => '#1e3a8a'],
                    ['name' => 'Brass Gold', 'hex' => '#d4af37'],
                    ['name' => 'Charcoal Ash', 'hex' => '#1c1917'],
                    ['name' => 'Pure Linen', 'hex' => '#fafaf9']
                ],
                'recommended_frame_color' => '#1e3a8a',
                'recommended_frame_style' => 'gold'
            ]
        ];

        $selectedFallback = $fallbacks[$scene] ?? $fallbacks['living'];

        if (empty($apiKey)) {
            Log::error('Gemini API Key missing. Cannot analyze room.');
            return response()->json([
                'status' => 'error',
                'message' => 'GEMINI_API_KEY is not configured in the .env file. Please add your key to use the AI Room Designer.'
            ], 400);
        }

        try {
            $systemInstruction = "You are an expert high-end spatial computing AI interior designer for 'Aura Decor'. You analyze room environments and prompts to output spatial diagnostic reports in raw JSON format ONLY. Do not use Markdown block code wraps around the JSON.";

            // Gather base64 image data if present
            $imageData = null;
            $mimeType = null;
            if ($request->hasFile('custom_image')) {
                $file = $request->file('custom_image');
                $imageData = base64_encode(file_get_contents($file->path()));
                $mimeType = $file->getMimeType();
            }

            $promptMessage = "The user wants to style their space with this design objective: '{$objective}'. Target scene is '{$scene}'. Provide an expert spatial analysis. You MUST respond ONLY with a valid JSON block containing: 'harmony_analysis' (detailed spatial review in markdown), 'styling_tips' (textile, layout & element suggestions in markdown), 'palette' (array of 4 color objects matching the style, with keys: 'name', 'hex'), 'recommended_frame_color' (hex color), 'recommended_frame_style' (one of: 'gold', 'oak', 'black', 'none').";

            $contentsParts = [];
            
            // If custom image is uploaded, send it as an inline_data part to Gemini 1.5/3 multimodal endpoint
            if ($imageData && $mimeType) {
                $contentsParts[] = [
                    'inline_data' => [
                        'mime_type' => $mimeType,
                        'data' => $imageData
                    ]
                ];
            }
            
            $contentsParts[] = ['text' => $promptMessage];

            $response = Http::withHeaders([
                'Content-Type' => 'application/json'
            ])->post("https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key={$apiKey}", [
                'contents' => [
                    [
                        'parts' => $contentsParts
                    ]
                ],
                'generationConfig' => [
                    'responseMimeType' => 'application/json'
                ]
            ]);

            if ($response->successful()) {
                $rawText = $response->json('candidates.0.content.parts.0.text');
                $cleanedText = preg_replace('/```(?:json)?|```/', '', $rawText);
                $specData = json_decode(trim($cleanedText), true);

                if (is_array($specData)) {
                    return response()->json([
                        'status' => 'success',
                        'source' => 'gemini_ai_spatial',
                        'data' => $specData
                    ]);
                }
            }

            Log::error('Gemini Room Analysis call failed, serving fallbacks.', [
                'status' => $response->status(),
                'body' => $response->body()
            ]);
        } catch (\Exception $e) {
            Log::error('Exception in Gemini Spatial Diagnostics: ' . $e->getMessage());
        }

        return response()->json([
            'status' => 'success',
            'source' => 'spatial_engine_fallback_error',
            'data' => $selectedFallback
        ]);
    }
}
