<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Order;
use App\Models\CustomDesign;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\View\View;
use Illuminate\Http\RedirectResponse;

class AdminController extends Controller
{
    public function index(): View
    {
        $users = User::query()
            ->withCount(['orders', 'customDesigns', 'roomImages'])
            ->orderBy('created_at', 'desc')
            ->get();

        $orders = Order::with(['user', 'customDesign.product'])
            ->orderBy('created_at', 'desc')
            ->get();

        $designs = CustomDesign::with(['user', 'product'])
            ->orderBy('created_at', 'desc')
            ->get();

        $products = Product::orderBy('category')->orderBy('name')->get();

        // Calculate statistics
        $stats = [
            'total_users' => $users->count(),
            'total_admins' => $users->where('is_admin', true)->count(),
            'total_orders' => $orders->count(),
            'total_designs' => $designs->count(),
            'total_revenue' => $orders->where('payment_status', 'paid')->where('status', '!=', 'cancelled')->sum('total_price'),
            'gross_revenue' => $orders->where('payment_status', 'paid')->sum('total_price'),
            'cancelled_revenue' => $orders->where('status', 'cancelled')->sum('total_price'),
        ];

        return view('admin.dashboard', compact('users', 'orders', 'designs', 'stats', 'products'));
    }

    public function updateOrderStatus(Order $order, Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'status' => ['required', 'string', 'in:placed,processing,shipping,delivered,cancelled'],
        ]);

        $order->update([
            'status' => $validated['status'],
        ]);

        return back()->with('success', "Order {$order->order_number} status updated to '" . ucfirst($validated['status']) . "' successfully!");
    }

    public function storeProduct(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:products,name'],
            'category' => ['required', 'string', 'in:Wall Decor,Lighting,Soft Furnishings,Decorative Accents,Rugs & Mats'],
            'description' => ['required', 'string'],
            'base_price' => ['required', 'numeric', 'min:0'],
            'image_path' => ['nullable', 'url', 'max:1000'],
        ]);

        // Default to a premium Unsplash image if image_path is left empty
        $defaultImages = [
            'Wall Decor' => 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=700&q=80',
            'Lighting' => 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=700&q=80',
            'Soft Furnishings' => 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=700&q=80',
            'Decorative Accents' => 'https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?auto=format&fit=crop&w=700&q=80',
            'Rugs & Mats' => 'https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=700&q=80',
        ];

        $imagePath = $validated['image_path'] ?: ($defaultImages[$validated['category']] ?? $defaultImages['Wall Decor']);

        Product::create([
            'name' => $validated['name'],
            'category' => $validated['category'],
            'description' => $validated['description'],
            'base_price' => $validated['base_price'],
            'image_path' => $imagePath,
            'is_active' => true,
            'in_stock' => true,
        ]);

        return back()->with('success', "New masterpiece curation '{$validated['name']}' added successfully!");
    }

    public function toggleProductStock(Product $product): RedirectResponse
    {
        $product->update([
            'in_stock' => !$product->in_stock,
        ]);

        $status = $product->in_stock ? 'In Stock' : 'Out of Stock';
        return back()->with('success', "Masterpiece '{$product->name}' is now marked as {$status}!");
    }

    public function toggleProductActive(Product $product): RedirectResponse
    {
        $product->update([
            'is_active' => !$product->is_active,
        ]);

        $status = $product->is_active ? 'Visible (Active)' : 'Hidden (Inactive)';
        return back()->with('success', "Masterpiece '{$product->name}' visibility is now {$status}!");
    }

    public function destroyProduct(Product $product): RedirectResponse
    {
        $name = $product->name;
        $product->delete();

        return back()->with('success', "Masterpiece curation '{$name}' has been completely deleted and removed from all lists!");
    }
}
