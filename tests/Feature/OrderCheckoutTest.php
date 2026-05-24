<?php

namespace Tests\Feature;

use App\Models\CustomDesign;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OrderCheckoutTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test standard cart checkout generates order correctly.
     */
    public function test_standard_cart_checkout_saves_order(): void
    {
        $user = User::factory()->create();
        
        $cartItems = [
            [
                'id' => 1,
                'name' => 'The Masterpiece Panel',
                'price' => 15000.00,
                'qty' => 1,
                'image' => 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=700&q=80',
                'style' => 'Modern Oakwood Moulding'
            ]
        ];

        $response = $this->actingAs($user)->post('/cart/checkout', [
            'cart_items'       => json_encode($cartItems),
            'total_price'      => 17700.00, // 15000 + 18% GST
            'shipping_address' => '123 Luxury Villa, Jubilee Hills, Hyderabad',
            'customer_name'    => 'Arjun Sharma',
            'customer_phone'   => '+91 98765 43210',
            'customer_email'   => 'arjun@example.com',
            'payment_id'       => 'pay_test12345abcde',
        ]);

        $this->assertDatabaseHas('orders', [
            'user_id'          => $user->id,
            'custom_design_id' => null,
            'total_price'      => 17700.00,
            'status'           => 'placed',
            'customer_name'    => 'Arjun Sharma',
            'customer_phone'   => '+91 98765 43210',
            'customer_email'   => 'arjun@example.com',
            'payment_id'       => 'pay_test12345abcde',
            'payment_status'   => 'paid',
        ]);

        $order = Order::first();
        $this->assertNotNull($order);
        $this->assertEquals($cartItems, $order->cart_items);

        $response->assertRedirect(route('orders.show', $order));
        $response->assertSessionHas('status', 'Payment confirmed! Your order has been placed successfully.');
    }

    /**
     * Test bespoke design visualizer checkout saves order correctly.
     */
    public function test_bespoke_design_checkout_saves_order(): void
    {
        $user = User::factory()->create();

        $product = Product::create([
            'name'        => 'Custom Wall Panel',
            'description' => 'Bespoke custom wall art',
            'category'    => 'custom',
            'base_price'  => 10000.00,
            'image_path'  => 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=700&q=80',
            'is_active'   => true,
        ]);

        $design = CustomDesign::create([
            'user_id'            => $user->id,
            'product_id'         => $product->id,
            'design_json'        => [
                'color'       => '#064e3b',
                'text'        => 'Aesthetic Solitude',
                'size'        => 'A2',
                'font'        => 'sans-serif',
                'font_size'   => 36,
                'frame_style' => 'gold'
            ],
            'preview_image_path' => null,
            'room_image_path'    => null,
            'status'             => 'saved',
        ]);

        $response = $this->actingAs($user)->post('/orders', [
            'custom_design_id' => $design->id,
            'shipping_address' => 'Flat 405, Prestige Apartments, Whitefield, Bengaluru',
            'customer_name'    => 'Priya Patel',
            'customer_phone'   => '+91 87654 32109',
            'customer_email'   => 'priya@example.com',
            'payment_id'       => 'pay_custom98765xyz',
        ]);

        $this->assertDatabaseHas('orders', [
            'user_id'          => $user->id,
            'custom_design_id' => $design->id,
            'total_price'      => 11800.00, // 10000 * 1.18
            'status'           => 'placed',
            'customer_name'    => 'Priya Patel',
            'customer_phone'   => '+91 87654 32109',
            'customer_email'   => 'priya@example.com',
            'payment_id'       => 'pay_custom98765xyz',
            'payment_status'   => 'paid',
        ]);

        $order = Order::first();
        $this->assertNotNull($order);
        $response->assertRedirect(route('orders.show', $order));
    }

    /**
     * Test order confirmation screen displays accurate information.
     */
    public function test_user_can_view_order_confirmation(): void
    {
        $user = User::factory()->create();
        
        $order = Order::create([
            'user_id'          => $user->id,
            'custom_design_id' => null,
            'order_number'     => 'ORD-20260520-XYZABC',
            'total_price'      => 5900.00,
            'status'           => 'placed',
            'shipping_address' => 'Chennai Marina Road, Chennai',
            'customer_name'    => 'Karthik Raja',
            'customer_phone'   => '+91 99999 88888',
            'customer_email'   => 'karthik@example.com',
            'cart_items'       => [
                [
                    'name' => 'Minimalist Canvas Frame',
                    'price' => 5000.00,
                    'qty' => 1,
                    'style' => 'Borderless'
                ]
            ],
            'payment_id'       => 'pay_xyz777',
            'payment_status'   => 'paid',
            'placed_at'        => now(),
        ]);

        $response = $this->actingAs($user)->get(route('orders.show', $order));

        $response->assertStatus(200);
        $response->assertSee('ORD-20260520-XYZABC');
        $response->assertSee('Karthik Raja');
        $response->assertSee('Minimalist Canvas Frame');
        $response->assertSee('pay_xyz777');
    }

    /**
     * Test administrative operator can patch order status.
     */
    public function test_admin_can_update_order_status(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $user = User::factory()->create(['is_admin' => false]);

        $order = Order::create([
            'user_id'          => $user->id,
            'custom_design_id' => null,
            'order_number'     => 'ORD-20260520-MNOJKL',
            'total_price'      => 4500.00,
            'status'           => 'placed',
            'shipping_address' => 'Marine Drive, Mumbai',
            'customer_name'    => 'Rahul Mehta',
            'customer_phone'   => '+91 77777 66666',
            'customer_email'   => 'rahul@example.com',
            'payment_id'       => 'pay_rahul123',
            'payment_status'   => 'paid',
            'placed_at'        => now(),
        ]);

        // Standard user cannot change status
        $response = $this->actingAs($user)->patch("/admin/orders/{$order->id}/status", [
            'status' => 'processing',
        ]);
        $response->assertRedirect('/');
        $this->assertEquals('placed', $order->fresh()->status);

        // Admin user can change status
        $response = $this->actingAs($admin)->patch("/admin/orders/{$order->id}/status", [
            'status' => 'shipping',
        ]);

        $response->assertRedirect();
        $this->assertEquals('shipping', $order->fresh()->status);
    }

    /**
     * Test standard user can access dashboard and view their orders and statuses.
     */
    public function test_user_can_access_dashboard_with_mixed_orders(): void
    {
        $user = User::factory()->create();

        // 1. Create standard cart order
        $order1 = Order::create([
            'user_id'          => $user->id,
            'custom_design_id' => null,
            'order_number'     => 'ORD-DASH-1111',
            'total_price'      => 7500.00,
            'status'           => 'placed',
            'shipping_address' => 'Gachibowli, Hyderabad',
            'customer_name'    => $user->name,
            'customer_phone'   => '+91 99999 88888',
            'customer_email'   => $user->email,
            'cart_items'       => [
                [
                    'name' => 'Artisan Ceramic Lamp',
                    'price' => 5000.00,
                    'qty' => 1,
                    'style' => 'Warm Alabaster'
                ]
            ],
            'payment_id'       => 'pay_dash111',
            'payment_status'   => 'paid',
            'placed_at'        => now(),
        ]);

        // 2. Create bespoke customization order
        $product = Product::create([
            'name'        => 'Masterpiece Panel',
            'description' => 'Aesthetic Panel description',
            'category'    => 'custom',
            'base_price'  => 12000.00,
            'image_path'  => 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=700&q=80',
            'is_active'   => true,
        ]);

        $design = CustomDesign::create([
            'user_id'            => $user->id,
            'product_id'         => $product->id,
            'design_json'        => [
                'color'       => '#064e3b',
                'text'        => 'Infinite Silence',
                'size'        => 'A3',
                'font'        => 'Outfit',
                'font_size'   => 40,
                'frame_style' => 'gold'
            ],
            'preview_image_path' => null,
            'room_image_path'    => null,
            'status'             => 'saved',
        ]);

        $order2 = Order::create([
            'user_id'          => $user->id,
            'custom_design_id' => $design->id,
            'order_number'     => 'ORD-DASH-2222',
            'total_price'      => 14160.00, // 12000 * 1.18
            'status'           => 'delivered',
            'shipping_address' => 'Indiranagar, Bengaluru',
            'customer_name'    => $user->name,
            'customer_phone'   => '+91 88888 77777',
            'customer_email'   => $user->email,
            'cart_items'       => null,
            'payment_id'       => 'pay_dash222',
            'payment_status'   => 'paid',
            'placed_at'        => now(),
        ]);

        $response = $this->actingAs($user)->get('/dashboard');

        $response->assertStatus(200);
        
        // Assert seeing standard cart order elements
        $response->assertSee('ORD-DASH-1111');
        $response->assertSee('Artisan Ceramic Lamp');
        
        // Assert seeing bespoke custom order elements
        $response->assertSee('ORD-DASH-2222');
        $response->assertSee('Masterpiece Panel');
        
        // Assert seeing statuses
        $response->assertSee('placed');
        $response->assertSee('delivered');
    }

    /**
     * Test that cancelled orders amount difference is correctly calculated and visible in admin stats.
     */
    public function test_cancelled_orders_amount_difference_is_reflected_in_admin_stats(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $user = User::factory()->create(['is_admin' => false]);

        // Create a paid order
        $orderPaid = Order::create([
            'user_id'          => $user->id,
            'order_number'     => 'ORD-STATS-PAID',
            'total_price'      => 1000.00,
            'status'           => 'placed',
            'shipping_address' => 'Test Address 1',
            'customer_name'    => 'Test User 1',
            'customer_phone'   => '1234567890',
            'customer_email'   => 'user1@example.com',
            'payment_id'       => 'pay_paid_123',
            'payment_status'   => 'paid',
            'placed_at'        => now(),
        ]);

        // Create a cancelled order
        $orderCancelled = Order::create([
            'user_id'          => $user->id,
            'order_number'     => 'ORD-STATS-CANC',
            'total_price'      => 500.00,
            'status'           => 'cancelled',
            'shipping_address' => 'Test Address 2',
            'customer_name'    => 'Test User 2',
            'customer_phone'   => '0987654321',
            'customer_email'   => 'user2@example.com',
            'payment_id'       => 'pay_canc_456',
            'payment_status'   => 'paid',
            'placed_at'        => now(),
        ]);

        $response = $this->actingAs($admin)->get('/admin');

        $response->assertStatus(200);

        // Check if stats are passed down correctly to the view
        $stats = $response->viewData('stats');
        $this->assertNotNull($stats);

        // total_revenue should exclude cancelled orders (1000)
        $this->assertEquals(1000.00, $stats['total_revenue']);
        
        // gross_revenue should include all paid orders (1000 + 500 = 1500)
        $this->assertEquals(1500.00, $stats['gross_revenue']);
        
        // cancelled_revenue should equal the cancelled orders total (500)
        $this->assertEquals(500.00, $stats['cancelled_revenue']);

        // Assert that the HTML reflects the Net, Gross and Cancelled difference correctly
        $response->assertSee('Net Active Value');
        $response->assertSee('Gross Paid:');
        $response->assertSee('Cancelled/Deducted:');
        $response->assertSee('₹1,000.00');
        $response->assertSee('₹1,500.00');
        $response->assertSee('-₹500.00');
    }
}

