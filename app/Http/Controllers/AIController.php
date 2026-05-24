<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Throwable;

class AIController extends Controller
{
    public function recommend(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'image' => ['required', 'string'],
        ]);

        $fallback = [
            'style' => 'modern',
            'suggestions' => ['wall frame', 'lamp'],
            'source' => 'fallback',
        ];

        $endpoint = config('services.ai.recommendation_url');

        if (! $endpoint) {
            return response()->json($fallback);
        }

        try {
            $response = Http::timeout(10)->post($endpoint, [
                'image' => $validated['image'],
            ]);

            if ($response->successful()) {
                return response()->json($response->json());
            }
        } catch (Throwable) {
            //
        }

        return response()->json($fallback);
    }
}
