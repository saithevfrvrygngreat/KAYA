<?php

namespace App\Http\Controllers;

use App\Models\CustomDesign;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\View\View;

class OrderController extends Controller
{
    public function index(): View
    {
        $orders = Order::with('customDesign.product')
            ->where('user_id', auth()->id())
            ->orderBy('created_at', 'desc')
            ->get();

        return view('dashboard', compact('orders'));
    }

    public function store(Request $request): JsonResponse|RedirectResponse
    {
        $wantsJsonResponse = $request->expectsJson() || $request->is('api/*');

        $validated = $request->validate([
            'custom_design_id' => ['required', 'exists:custom_designs,id'],
            'shipping_address' => ['required', 'string', 'max:1000'],
            'customer_name'    => ['required', 'string', 'max:255'],
            'customer_phone'   => ['required', 'string', 'max:20'],
            'customer_email'   => ['required', 'email', 'max:255'],
            'payment_id'       => ['required', 'string'],
        ]);

        $design = CustomDesign::with('product')->findOrFail($validated['custom_design_id']);

        if (! $design->product) {
            if (! $wantsJsonResponse) {
                return back()->withErrors(['custom_design_id' => 'Selected design has no product linked.']);
            }
            return response()->json(['message' => 'Design product not found.'], 422);
        }

        $order = Order::create([
            'user_id'          => auth()->id(),
            'custom_design_id' => $design->id,
            'order_number'     => $this->generateOrderNumber(),
            'total_price'      => $design->product->base_price * 1.18, // Total price including 18% GST
            'status'           => 'placed',
            'shipping_address' => $validated['shipping_address'],
            'customer_name'    => $validated['customer_name'],
            'customer_phone'   => $validated['customer_phone'],
            'customer_email'   => $validated['customer_email'],
            'cart_items'       => null,
            'payment_id'       => $validated['payment_id'],
            'payment_status'   => 'paid',
            'placed_at'        => now(),
        ]);

        if ($wantsJsonResponse) {
            return response()->json([
                'status'       => 'placed',
                'order_id'     => $order->id,
                'order_number' => $order->order_number,
            ], 201);
        }

        return redirect()
            ->route('orders.show', $order)
            ->with('status', 'Payment confirmed! Your order has been placed successfully.');
    }

    public function show(Order $order): View
    {
        abort_if(auth()->id() && $order->user_id && $order->user_id !== auth()->id(), 403);
        $order->load('customDesign.product');

        return view('order-confirmation', [
            'order'   => $order,
            'design'  => $order->customDesign,
            'product' => $order->customDesign?->product,
        ]);
    }

    /**
     * Cart quick-checkout — no CustomDesign required.
     */
    public function cartCheckout(Request $request): RedirectResponse
    {
        $request->validate([
            'cart_items'       => ['required', 'string'],
            'total_price'      => ['required', 'numeric', 'min:0'],
            'shipping_address' => ['required', 'string', 'max:1000'],
            'customer_name'    => ['required', 'string', 'max:255'],
            'customer_phone'   => ['required', 'string', 'max:20'],
            'customer_email'   => ['required', 'email', 'max:255'],
            'payment_id'       => ['required', 'string'],
        ]);

        $order = Order::create([
            'user_id'          => auth()->id(),
            'custom_design_id' => null,
            'order_number'     => $this->generateOrderNumber(),
            'total_price'      => $request->input('total_price'),
            'status'           => 'placed',
            'shipping_address' => $request->input('shipping_address'),
            'customer_name'    => $request->input('customer_name'),
            'customer_phone'   => $request->input('customer_phone'),
            'customer_email'   => $request->input('customer_email'),
            'cart_items'       => json_decode($request->input('cart_items'), true),
            'payment_id'       => $request->input('payment_id'),
            'payment_status'   => 'paid',
            'placed_at'        => now(),
        ]);

        return redirect()
            ->route('orders.show', $order)
            ->with('status', 'Payment confirmed! Your order has been placed successfully.');
    }

    private function generateOrderNumber(): string
    {
        return 'ORD-'.now()->format('Ymd').'-'.Str::upper(Str::random(6));
    }
}
