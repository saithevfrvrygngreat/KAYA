const fetch = require('node-fetch');
const Product = require('../models/Product');

// Generates dynamic, algorithmic fallback art specs matching prompt aesthetics
function generateAlgorithmicArtSpec(prompt) {
  const p = (prompt || '').toLowerCase();

  let gradient_start = '#fdfc47';
  let gradient_end = '#240b36';
  let primary_shape = 'sun';
  let shape_color = '#d4af37';
  let typography = 'Solitude & Light';
  let curated_font = 'serif';
  let curated_frame = 'oak';
  let palette_name = 'Warm Bohemian Solstice';
  let layout_description = 'Dynamic solar geometric balance with layered organic arches.';
  let typography_recommendation = 'Classic editorial serif font chosen to complement natural wood tones.';

  if (p.includes('minimal') || p.includes('modern') || p.includes('clean') || p.includes('white')) {
    gradient_start = '#faf9f6';
    gradient_end = '#e5e5e0';
    primary_shape = 'arch';
    shape_color = '#1c1917';
    typography = 'Silence & Space';
    curated_font = 'sans-serif';
    curated_frame = 'black';
    palette_name = 'Nordic Alabaster & Carbon';
    layout_description = 'High-contrast monochromatic study with architectural negative space.';
    typography_recommendation = 'Swiss grotesque sans-serif provides crisp modern structure.';
  } else if (p.includes('emerald') || p.includes('green') || p.includes('nature') || p.includes('botanical') || p.includes('forest')) {
    gradient_start = '#064e3b';
    gradient_end = '#022c22';
    primary_shape = 'circle';
    shape_color = '#d4af37';
    typography = 'Royal Sanctuary';
    curated_font = 'fantasy';
    curated_frame = 'gold';
    palette_name = 'Botanical Velvet & Gilded Brass';
    layout_description = 'Submerged deep forest emerald background crowned with a celestial gold disk.';
    typography_recommendation = 'Flourished display serif enhances the regal sanctuary ambience.';
  } else if (p.includes('ocean') || p.includes('blue') || p.includes('sea') || p.includes('water')) {
    gradient_start = '#0f172a';
    gradient_end = '#1e3a8a';
    primary_shape = 'arch';
    shape_color = '#38bdf8';
    typography = 'Abyssal Horizon';
    curated_font = 'sans-serif';
    curated_frame = 'black';
    palette_name = 'Midnight Indigo & Cerulean';
    layout_description = 'Cascading maritime wave arches set against an atmospheric dark gradient.';
    typography_recommendation = 'Clean geometric sans anchors the expansive oceanic depth.';
  } else if (p.includes('terracotta') || p.includes('earth') || p.includes('warm') || p.includes('desert') || p.includes('sunset')) {
    gradient_start = '#7c2d12';
    gradient_end = '#c2410c';
    primary_shape = 'mountain';
    shape_color = '#fed7aa';
    typography = 'Terra Sola';
    curated_font = 'serif';
    curated_frame = 'oak';
    palette_name = 'Desert Clay & Sunbaked Ochre';
    layout_description = 'Textured clay landscape with stylized geometric ridges.';
    typography_recommendation = 'Hand-carved rustic serif echoes artisanal pottery aesthetics.';
  }

  return {
    gradient_start,
    gradient_end,
    primary_shape,
    shape_color,
    accent_shapes: [
      { shape: 'circle', x_pct: Math.floor(Math.random() * 40 + 20), y_pct: Math.floor(Math.random() * 30 + 20), size: 18, color: '#d4af37' },
      { shape: 'stripes', x_pct: 50, y_pct: 75, size: 55, color: shape_color }
    ],
    typography,
    curated_font,
    curated_frame,
    palette_name,
    layout_description,
    typography_recommendation
  };
}

// POST /api/ai/generate-art
const generateArtSpec = async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt || prompt.trim().length === 0) {
      return res.status(422).json({ message: 'Prompt is required.' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    let specData = null;

    // 1. If Gemini API key is provided, attempt LLM generation
    if (apiKey && apiKey.trim().length > 0) {
      const models = ['gemini-2.0-flash', 'gemini-1.5-flash'];
      const systemInstruction = "You are a professional abstract graphic design engine for luxury canvas prints. You generate design specs in valid JSON format ONLY. Do not wrap JSON in Markdown code block quotes. Response must start and end with curly brackets. IMPORTANT: Be highly creative, dynamic, and extremely random with your color palettes, shape selections, and layout placements every single time you are called. Never output the same design twice.";
      const promptMessage = `Analyze this visual art design prompt: '${prompt}'. Generate a highly unique, unpredictable, and beautiful minimalist canvas print graphic design structure. Ensure the colors and shapes are drastically different from standard defaults. Respond ONLY with a valid flat JSON block with keys: 'gradient_start' (hex color), 'gradient_end' (hex color), 'primary_shape' (one of: 'circle', 'arch', 'sun', 'mountain', 'stripes'), 'shape_color' (hex color), 'accent_shapes' (array of 1 to 3 objects with keys: 'shape', 'x_pct' (0-100), 'y_pct' (0-100), 'size' (10-50), 'color'), 'typography' (an elegant 2-4 word artistic quote matching the theme), 'curated_font' (one of: 'serif', 'sans-serif', 'fantasy', 'monospace'), 'curated_frame' (one of: 'gold', 'oak', 'black', 'none'), 'palette_name' (a creative name for the color scheme), 'layout_description' (a 2-sentence description of the visual layout and why it works), 'typography_recommendation' (a 1-sentence explanation of why the font was chosen).`;

      for (const model of models) {
        try {
          const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: systemInstruction + '\n\n' + promptMessage }] }],
              generationConfig: { responseMimeType: 'application/json', temperature: 1.2 }
            }),
            timeout: 8000
          });

          if (geminiRes.ok) {
            const geminiData = await geminiRes.json();
            const rawText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || '';
            const cleanedText = rawText.replace(/```(?:json)?|```/g, '').trim();
            specData = JSON.parse(cleanedText);
            if (specData && typeof specData === 'object') break;
          }
        } catch (err) {
          console.warn(`Gemini model ${model} failed, trying fallback:`, err.message);
        }
      }
    }

    // 2. If Gemini was not configured or call failed, use high-fidelity algorithmic spec
    if (!specData) {
      specData = generateAlgorithmicArtSpec(prompt);
    }

    // 3. Synthesize realistic photo preview via Pollinations AI
    try {
      const seed = Math.floor(Math.random() * 900000 + 100000);
      const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt + ' luxury interior aesthetic wall art canvas decor')}?width=800&height=1000&nologo=true&seed=${seed}`;
      const imgRes = await fetch(pollinationsUrl, { timeout: 12000 });
      if (imgRes.ok) {
        const buffer = await imgRes.buffer();
        specData.synthesized_image_base64 = 'data:image/jpeg;base64,' + buffer.toString('base64');
      }
    } catch (imgErr) {
      console.warn('Pollinations photo preview unavailable, using vector canvas rendering:', imgErr.message);
    }

    return res.json({
      status: 'success',
      source: apiKey ? 'gemini_ai' : 'curation_engine',
      data: specData
    });
  } catch (err) {
    console.error('Generate art spec error:', err);
    return res.json({
      status: 'success',
      source: 'curation_engine_safe',
      data: generateAlgorithmicArtSpec(req.body?.prompt || 'minimalist')
    });
  }
};

// POST /api/ai/analyze-room
const analyzeRoom = async (req, res) => {
  try {
    const { objective, room_scene } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!objective || !room_scene) {
      return res.status(422).json({ message: 'Objective and room scene are required.' });
    }

    const fallbacks = {
      living: {
        space_harmony_score: 94,
        architectural_style: 'Warm Japandi & Organic Modernism',
        lighting_profile: 'Ambient 2700K Warm Glow with Soft Diffused Daylight',
        recommended_materials: ['Textured Belgian Linen', 'Solid Teak Wood', 'Matte Ceramic', 'Hand-Braided Jute'],
        palette: [
          { name: 'Botanical Emerald', hex: '#064e3b' },
          { name: 'Warm Ochre', hex: '#b58c5c' },
          { name: 'Champagne Sand', hex: '#fef3c7' },
          { name: 'Charcoal Ash', hex: '#1c1917' }
        ],
        curator_notes: `Based on your vision "${objective}", we balanced organic minimalist proportions with tactile soft furnishings. For this living room context, custom canvas wall art paired with ceramic bud accents will ground the room effortlessly.`,
        suggested_product: 'Custom Canvas Wall Art',
        recommended_frame_color: '#064e3b',
        recommended_frame_style: 'oak'
      },
      bedroom: {
        space_harmony_score: 96,
        architectural_style: 'Serene Minimalist Sanctuary',
        lighting_profile: 'Low Glare Indirect Warm Glow (2400K) with Evening Dimming',
        recommended_materials: ['Stone-Washed Linen', 'Natural Oak', 'Himalayan Wool', 'Frosted Glass'],
        palette: [
          { name: 'Champagne Sand', hex: '#fef3c7' },
          { name: 'Earthy Terracotta', hex: '#78350f' },
          { name: 'Sage Haze', hex: '#80bea6' },
          { name: 'Slate Cloud', hex: '#dee9fc' }
        ],
        curator_notes: `For your sanctuary bedroom vision "${objective}", we calibrated low visual noise and gentle symmetry. Dual oak frames positioned above the headboard harmonize seamlessly with warm ambient light.`,
        suggested_product: 'Personalized Wooden Wall Frame',
        recommended_frame_color: '#fef3c7',
        recommended_frame_style: 'oak'
      },
      office: {
        space_harmony_score: 91,
        architectural_style: 'Contemporary Scandinavian Studio',
        lighting_profile: 'Targeted High-CRI Task Lighting with Ambient Fill',
        recommended_materials: ['Brushed Brass', 'Aniline Leather', 'Matte Black Aluminum', 'Fluted Teak'],
        palette: [
          { name: 'Deep Navy', hex: '#1e3a8a' },
          { name: 'Brass Gold', hex: '#d4af37' },
          { name: 'Charcoal Ash', hex: '#1c1917' },
          { name: 'Pure Linen', hex: '#fafaf9' }
        ],
        curator_notes: `Tailoring to your creative workspace objective "${objective}", we introduced high-contrast geometric grounding to sharpen focus while preserving acoustic warmth.`,
        suggested_product: 'Hexagonal Wooden Wall Mirror',
        recommended_frame_color: '#1e3a8a',
        recommended_frame_style: 'gold'
      }
    };

    let report = fallbacks[room_scene] || fallbacks.living;

    // If Gemini API key is configured, query Gemini with prompt and optional uploaded room photo
    if (apiKey && apiKey.trim().length > 0) {
      try {
        const parts = [];
        if (req.file) {
          const fs = require('fs');
          const imageData = fs.readFileSync(req.file.path).toString('base64');
          parts.push({ inline_data: { mime_type: req.file.mimetype, data: imageData } });
        }

        const promptInstruction = `You are KaYa's Master Spatial Harmonizer & Interior Architect. Analyze this interior decor request:
Objective: "${objective}"
Target Environment: "${room_scene}"
${req.file ? 'A photo of the physical room wall is attached.' : ''}

Respond with a valid JSON object ONLY containing:
- 'space_harmony_score' (number between 85 and 99)
- 'architectural_style' (string, e.g. "Warm Japandi & Organic Modernism")
- 'lighting_profile' (string describing ambient color temperature and light quality)
- 'recommended_materials' (array of 4 material strings)
- 'palette' (array of 4 objects with 'name' and 'hex' hex color code)
- 'curator_notes' (2-3 sentences of bespoke interior advice tailored specifically to the user's objective)
- 'suggested_product' (one recommended luxury item: e.g. "Custom Canvas Wall Art", "Personalized Wooden Wall Frame", "Artisan Table Lamp", "Hexagonal Wooden Wall Mirror")
- 'recommended_frame_color' (hex color code)
- 'recommended_frame_style' (one of: 'gold', 'oak', 'black', 'none')`;

        parts.push({ text: promptInstruction });

        const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts }],
            generationConfig: { responseMimeType: 'application/json' }
          }),
          timeout: 10000
        });

        if (geminiRes.ok) {
          const geminiData = await geminiRes.json();
          const rawText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || '';
          const cleanedText = rawText.replace(/```(?:json)?|```/g, '').trim();
          const parsed = JSON.parse(cleanedText);
          if (parsed && parsed.space_harmony_score) {
            report = parsed;
          }
        }
      } catch (geminiErr) {
        console.warn('Gemini room analysis error, falling back to curated harmony report:', geminiErr.message);
      }
    }

    return res.json({
      status: 'success',
      source: apiKey ? 'gemini_ai_spatial' : 'curator_spatial_engine',
      data: report
    });
  } catch (err) {
    console.error('Analyze room error:', err);
    res.status(500).json({ message: 'Room analysis failed.' });
  }
};

module.exports = { generateArtSpec, analyzeRoom };
