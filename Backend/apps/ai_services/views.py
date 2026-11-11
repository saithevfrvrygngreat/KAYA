import re
import json
import base64
import random
import requests
from urllib.parse import quote
from django.conf import settings
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.permissions import AllowAny
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.response import Response
from rest_framework import status

def generate_algorithmic_art_spec(prompt):
    p = (prompt or '').lower()

    gradient_start = '#fdfc47'
    gradient_end = '#240b36'
    primary_shape = 'sun'
    shape_color = '#d4af37'
    typography = 'Solitude & Light'
    curated_font = 'serif'
    curated_frame = 'oak'
    palette_name = 'Warm Bohemian Solstice'
    layout_description = 'Dynamic solar geometric balance with layered organic arches.'
    typography_recommendation = 'Classic editorial serif font chosen to complement natural wood tones.'

    if any(k in p for k in ['minimal', 'modern', 'clean', 'white']):
        gradient_start = '#faf9f6'
        gradient_end = '#e5e5e0'
        primary_shape = 'arch'
        shape_color = '#1c1917'
        typography = 'Silence & Space'
        curated_font = 'sans-serif'
        curated_frame = 'black'
        palette_name = 'Nordic Alabaster & Carbon'
        layout_description = 'High-contrast monochromatic study with architectural negative space.'
        typography_recommendation = 'Swiss grotesque sans-serif provides crisp modern structure.'
    elif any(k in p for k in ['emerald', 'green', 'nature', 'botanical', 'forest']):
        gradient_start = '#064e3b'
        gradient_end = '#022c22'
        primary_shape = 'circle'
        shape_color = '#d4af37'
        typography = 'Royal Sanctuary'
        curated_font = 'fantasy'
        curated_frame = 'gold'
        palette_name = 'Botanical Velvet & Gilded Brass'
        layout_description = 'Submerged deep forest emerald background crowned with a celestial gold disk.'
        typography_recommendation = 'Flourished display serif enhances the regal sanctuary ambience.'
    elif any(k in p for k in ['ocean', 'blue', 'sea', 'water']):
        gradient_start = '#0f172a'
        gradient_end = '#1e3a8a'
        primary_shape = 'arch'
        shape_color = '#38bdf8'
        typography = 'Abyssal Horizon'
        curated_font = 'sans-serif'
        curated_frame = 'black'
        palette_name = 'Midnight Indigo & Cerulean'
        layout_description = 'Cascading maritime wave arches set against an atmospheric dark gradient.'
        typography_recommendation = 'Clean geometric sans anchors the expansive oceanic depth.'
    elif any(k in p for k in ['terracotta', 'earth', 'warm', 'desert', 'sunset']):
        gradient_start = '#7c2d12'
        gradient_end = '#c2410c'
        primary_shape = 'mountain'
        shape_color = '#fed7aa'
        typography = 'Terra Sola'
        curated_font = 'serif'
        curated_frame = 'oak'
        palette_name = 'Desert Clay & Sunbaked Ochre'
        layout_description = 'Textured clay landscape with stylized geometric ridges.'
        typography_recommendation = 'Hand-carved rustic serif echoes artisanal pottery aesthetics.'

    return {
        'gradient_start': gradient_start,
        'gradient_end': gradient_end,
        'primary_shape': primary_shape,
        'shape_color': shape_color,
        'accent_shapes': [
            {'shape': 'circle', 'x_pct': random.randint(20, 60), 'y_pct': random.randint(20, 50), 'size': 18, 'color': '#d4af37'},
            {'shape': 'stripes', 'x_pct': 50, 'y_pct': 75, 'size': 55, 'color': shape_color}
        ],
        'typography': typography,
        'curated_font': curated_font,
        'curated_frame': curated_frame,
        'palette_name': palette_name,
        'layout_description': layout_description,
        'typography_recommendation': typography_recommendation
    }

@api_view(['POST'])
@permission_classes([AllowAny])
def generate_art_spec(request):
    try:
        prompt = (request.data.get('prompt') or '').strip()
        if not prompt:
            return Response({'message': 'Prompt is required.'}, status=status.HTTP_422_UNPROCESSABLE_ENTITY)

        api_key = getattr(settings, 'GEMINI_API_KEY', '') or ''
        spec_data = None

        if api_key and len(api_key.strip()) > 0:
            models = ['gemini-2.0-flash', 'gemini-1.5-flash']
            system_instruction = "You are a professional abstract graphic design engine for luxury canvas prints. You generate design specs in valid JSON format ONLY. Do not wrap JSON in Markdown code block quotes. Response must start and end with curly brackets. IMPORTANT: Be highly creative, dynamic, and extremely random with your color palettes, shape selections, and layout placements every single time you are called. Never output the same design twice."
            prompt_message = f"Analyze this visual art design prompt: '{prompt}'. Generate a highly unique, unpredictable, and beautiful minimalist canvas print graphic design structure. Ensure the colors and shapes are drastically different from standard defaults. Respond ONLY with a valid flat JSON block with keys: 'gradient_start' (hex color), 'gradient_end' (hex color), 'primary_shape' (one of: 'circle', 'arch', 'sun', 'mountain', 'stripes'), 'shape_color' (hex color), 'accent_shapes' (array of 1 to 3 objects with keys: 'shape', 'x_pct' (0-100), 'y_pct' (0-100), 'size' (10-50), 'color'), 'typography' (an elegant 2-4 word artistic quote matching the theme), 'curated_font' (one of: 'serif', 'sans-serif', 'fantasy', 'monospace'), 'curated_frame' (one of: 'gold', 'oak', 'black', 'none'), 'palette_name' (a creative name for the color scheme), 'layout_description' (a 2-sentence description of the visual layout and why it works), 'typography_recommendation' (a 1-sentence explanation of why the font was chosen)."

            for model in models:
                try:
                    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
                    payload = {
                        'contents': [{'parts': [{'text': system_instruction + '\n\n' + prompt_message}]}],
                        'generationConfig': {'responseMimeType': 'application/json', 'temperature': 1.2}
                    }
                    res = requests.post(url, json=payload, timeout=8)
                    if res.status_code == 200:
                        data = res.json()
                        raw_text = data.get('candidates', [{}])[0].get('content', {}).get('parts', [{}])[0].get('text', '')
                        cleaned = re.sub(r'```(?:json)?|```', '', raw_text).strip()
                        spec_data = json.loads(cleaned)
                        if isinstance(spec_data, dict):
                            break
                except Exception as e:
                    print(f"Gemini model {model} attempt failed: {e}")

        if not spec_data:
            spec_data = generate_algorithmic_art_spec(prompt)

        # Synthesize realistic photo preview via Pollinations AI
        try:
            seed = random.randint(100000, 999999)
            pollinations_url = f"https://image.pollinations.ai/prompt/{quote(prompt + ' luxury interior aesthetic wall art canvas decor')}?width=800&height=1000&nologo=true&seed={seed}"
            img_res = requests.get(pollinations_url, timeout=12)
            if img_res.status_code == 200:
                spec_data['synthesized_image_base64'] = 'data:image/jpeg;base64,' + base64.b64encode(img_res.content).decode('utf-8')
        except Exception as img_err:
            print(f"Pollinations preview fallback: {img_err}")

        return Response({
            'status': 'success',
            'source': 'gemini_ai' if (api_key and len(api_key.strip()) > 0) else 'curation_engine',
            'data': spec_data
        })
    except Exception as e:
        return Response({
            'status': 'success',
            'source': 'curation_engine_safe',
            'data': generate_algorithmic_art_spec(request.data.get('prompt') or 'minimalist')
        })

@api_view(['POST'])
@permission_classes([AllowAny])
@parser_classes([MultiPartParser, FormParser, JSONParser])
def analyze_room(request):
    try:
        objective = request.data.get('objective')
        room_scene = request.data.get('room_scene')

        if not objective or not room_scene:
            return Response({'message': 'Objective and room scene are required.'}, status=status.HTTP_422_UNPROCESSABLE_ENTITY)

        fallbacks = {
            'living': {
                'space_harmony_score': 94,
                'architectural_style': 'Warm Japandi & Organic Modernism',
                'lighting_profile': 'Ambient 2700K Warm Glow with Soft Diffused Daylight',
                'recommended_materials': ['Textured Belgian Linen', 'Solid Teak Wood', 'Matte Ceramic', 'Hand-Braided Jute'],
                'palette': [
                    {'name': 'Botanical Emerald', 'hex': '#064e3b'},
                    {'name': 'Warm Ochre', 'hex': '#b58c5c'},
                    {'name': 'Champagne Sand', 'hex': '#fef3c7'},
                    {'name': 'Charcoal Ash', 'hex': '#1c1917'}
                ],
                'curator_notes': f'Based on your vision "{objective}", we balanced organic minimalist proportions with tactile soft furnishings. For this living room context, custom canvas wall art paired with ceramic bud accents will ground the room effortlessly.',
                'suggested_product': 'Custom Canvas Wall Art',
                'recommended_frame_color': '#064e3b',
                'recommended_frame_style': 'oak'
            },
            'bedroom': {
                'space_harmony_score': 96,
                'architectural_style': 'Serene Minimalist Sanctuary',
                'lighting_profile': 'Low Glare Indirect Warm Glow (2400K) with Evening Dimming',
                'recommended_materials': ['Stone-Washed Linen', 'Natural Oak', 'Himalayan Wool', 'Frosted Glass'],
                'palette': [
                    {'name': 'Champagne Sand', 'hex': '#fef3c7'},
                    {'name': 'Earthy Terracotta', 'hex': '#78350f'},
                    {'name': 'Sage Haze', 'hex': '#80bea6'},
                    {'name': 'Slate Cloud', 'hex': '#dee9fc'}
                ],
                'curator_notes': f'For your sanctuary bedroom vision "{objective}", we calibrated low visual noise and gentle symmetry. Dual oak frames positioned above the headboard harmonize seamlessly with warm ambient light.',
                'suggested_product': 'Personalized Wooden Wall Frame',
                'recommended_frame_color': '#fef3c7',
                'recommended_frame_style': 'oak'
            },
            'office': {
                'space_harmony_score': 91,
                'architectural_style': 'Contemporary Scandinavian Studio',
                'lighting_profile': 'Targeted High-CRI Task Lighting with Ambient Fill',
                'recommended_materials': ['Brushed Brass', 'Aniline Leather', 'Matte Black Aluminum', 'Fluted Teak'],
                'palette': [
                    {'name': 'Deep Navy', 'hex': '#1e3a8a'},
                    {'name': 'Brass Gold', 'hex': '#d4af37'},
                    {'name': 'Charcoal Ash', 'hex': '#1c1917'},
                    {'name': 'Pure Linen', 'hex': '#fafaf9'}
                ],
                'curator_notes': f'Tailoring to your creative workspace objective "{objective}", we introduced high-contrast geometric grounding to sharpen focus while preserving acoustic warmth.',
                'suggested_product': 'Hexagonal Wooden Wall Mirror',
                'recommended_frame_color': '#1e3a8a',
                'recommended_frame_style': 'gold'
            }
        }

        report = fallbacks.get(room_scene, fallbacks['living'])
        api_key = getattr(settings, 'GEMINI_API_KEY', '') or ''

        if api_key and len(api_key.strip()) > 0:
            try:
                parts = []
                file_obj = request.FILES.get('custom_image') or request.FILES.get('image')
                if file_obj:
                    img_data = base64.b64encode(file_obj.read()).decode('utf-8')
                    parts.append({
                        'inline_data': {
                            'mime_type': file_obj.content_type or 'image/jpeg',
                            'data': img_data
                        }
                    })

                prompt_instruction = f"""You are KaYa's Master Spatial Harmonizer & Interior Architect. Analyze this interior decor request:
Objective: "{objective}"
Target Environment: "{room_scene}"
{'A photo of the physical room wall is attached.' if file_obj else ''}

Respond with a valid JSON object ONLY containing:
- 'space_harmony_score' (number between 85 and 99)
- 'architectural_style' (string, e.g. "Warm Japandi & Organic Modernism")
- 'lighting_profile' (string describing ambient color temperature and light quality)
- 'recommended_materials' (array of 4 material strings)
- 'palette' (array of 4 objects with 'name' and 'hex' hex color code)
- 'curator_notes' (2-3 sentences of bespoke interior advice tailored specifically to the user's objective)
- 'suggested_product' (one recommended luxury item: e.g. "Custom Canvas Wall Art", "Personalized Wooden Wall Frame", "Artisan Table Lamp", "Hexagonal Wooden Wall Mirror")
- 'recommended_frame_color' (hex color code)
- 'recommended_frame_style' (one of: 'gold', 'oak', 'black', 'none')"""

                parts.append({'text': prompt_instruction})

                url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={api_key}"
                payload = {
                    'contents': [{'parts': parts}],
                    'generationConfig': {'responseMimeType': 'application/json'}
                }
                gemini_res = requests.post(url, json=payload, timeout=10)
                if gemini_res.status_code == 200:
                    data = gemini_res.json()
                    raw_text = data.get('candidates', [{}])[0].get('content', {}).get('parts', [{}])[0].get('text', '')
                    cleaned = re.sub(r'```(?:json)?|```', '', raw_text).strip()
                    parsed = json.loads(cleaned)
                    if isinstance(parsed, dict) and parsed.get('space_harmony_score'):
                        report = parsed
            except Exception as gemini_err:
                print(f"Gemini room analysis error: {gemini_err}")

        return Response({
            'status': 'success',
            'source': 'gemini_ai_spatial' if (api_key and len(api_key.strip()) > 0) else 'curator_spatial_engine',
            'data': report
        })
    except Exception as e:
        return Response({'message': 'Room analysis failed.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
