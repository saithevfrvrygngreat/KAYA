<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;

class ProductController extends Controller
{
    public function index(Request $request): View|JsonResponse
    {
        $products = Product::query()
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        if ($request->expectsJson() || $request->is('api/*')) {
            return response()->json(['data' => $products]);
        }

        return view('home', compact('products'));
    }

    public function products(Request $request): View
    {
        $products = Product::query()
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        $activeRoom  = $request->query('room');
        $activeStyle = $request->query('style');

        return view('products', compact('products', 'activeRoom', 'activeStyle'));
    }

    public function customizeGeneral(Request $request): View
    {
        $products = Product::query()
            ->where('is_active', true)
            ->orderBy('name')
            ->get();
        return view('customize_index', compact('products'));
    }

    public function customize(Product $product): View|\Illuminate\Http\RedirectResponse
    {
        if (!$product->in_stock) {
            return redirect()->route('products.index')->with('error', 'This masterpiece is currently out of stock and cannot be customized at this time.');
        }
        return view('customize', compact('product'));
    }

    public function show(Product $product): JsonResponse
    {
        return response()->json(['data' => $product]);
    }
}
