<?php

namespace App\Http\Controllers;

use App\Models\CustomDesign;
use App\Models\RoomImage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;

class CustomizationController extends Controller
{
    public function saveDesign(Request $request): JsonResponse|RedirectResponse
    {
        $validated = $request->validate([
            'product_id' => ['required', 'exists:products,id'],
            'design_json' => ['required', 'json'],
            'room_image' => ['nullable', 'image', 'max:4096'],
        ]);

        $designData = json_decode($validated['design_json'], true);
        $wantsJsonResponse = $request->expectsJson() || $request->is('api/*');

        if (! is_array($designData)) {
            if ($wantsJsonResponse) {
                return response()->json(['message' => 'Invalid design payload.'], 422);
            }

            return back()
                ->withInput()
                ->withErrors(['design_json' => 'Design payload must be a valid object.']);
        }

        $roomImagePath = null;

        if ($request->hasFile('room_image')) {
            $roomImagePath = $request->file('room_image')->store('rooms', 'public');

            RoomImage::create([
                'user_id' => auth()->id(),
                'path' => $roomImagePath,
            ]);
        }

        $design = CustomDesign::create([
            'user_id' => auth()->id(),
            'product_id' => (int) $validated['product_id'],
            'design_json' => $designData,
            'room_image_path' => $roomImagePath,
            'status' => 'saved',
        ]);

        if ($wantsJsonResponse) {
            return response()->json([
                'status' => 'saved',
                'design_id' => $design->id,
                'preview_url' => route('designs.preview', $design),
            ], 201);
        }

        return redirect()
            ->route('designs.preview', $design)
            ->with('status', 'Design saved successfully.');
    }

    public function preview(CustomDesign $customDesign): View
    {
        $customDesign->load('product');

        return view('preview', [
            'design' => $customDesign,
            'product' => $customDesign->product,
        ]);
    }

    public function uploadRoomImage(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'image' => ['required', 'image', 'max:4096'],
        ]);

        $path = $request->file('image')->store('rooms', 'public');

        $roomImage = RoomImage::create([
            'user_id' => auth()->id(),
            'path' => $path,
        ]);

        return response()->json([
            'status' => 'uploaded',
            'room_image_id' => $roomImage->id,
            'image_path' => $path,
        ], 201);
    }
}
