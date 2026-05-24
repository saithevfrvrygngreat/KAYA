<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminPortalTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test that guest users are redirected to login.
     */
    public function test_guest_user_is_redirected_to_login(): void
    {
        $response = $this->get('/admin');

        $response->assertRedirect('/login');
    }

    /**
     * Test that normal users are denied access to the admin portal.
     */
    public function test_normal_user_is_denied_access_to_admin_portal(): void
    {
        $user = User::factory()->create([
            'is_admin' => false,
        ]);

        $response = $this->actingAs($user)->get('/admin');

        $response->assertRedirect('/');
        $response->assertSessionHas('error', 'Access denied. You do not have administrative privileges.');
    }

    /**
     * Test that admin users can access the admin portal dashboard.
     */
    public function test_admin_user_can_access_admin_portal(): void
    {
        $admin = User::factory()->create([
            'is_admin' => true,
        ]);

        $response = $this->actingAs($admin)->get('/admin');

        $response->assertStatus(200);
        $response->assertViewIs('admin.dashboard');
        $response->assertSee('Admin Dashboard');
        $response->assertSee('Registered Clientele');
    }

    /**
     * Test that admin credentials redirect to admin portal on login.
     */
    public function test_admin_credentials_redirect_to_admin_portal_on_login(): void
    {
        $admin = User::factory()->create([
            'email' => 'admin_test@example.com',
            'password' => bcrypt('password123'),
            'is_admin' => true,
        ]);

        $response = $this->post('/login', [
            'email' => 'admin_test@example.com',
            'password' => 'password123',
        ]);

        $response->assertRedirect('/admin');
        $response->assertSessionHas('success', 'Welcome to the Admin Control Panel!');
    }

    /**
     * Test that user registration fails when password lacks an uppercase letter.
     */
    public function test_registration_fails_without_uppercase_password(): void
    {
        $response = $this->post('/register', [
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'password' => 'securepass123!',
            'password_confirmation' => 'securepass123!',
        ]);

        $response->assertSessionHasErrors('password');
    }

    /**
     * Test that user registration fails when password lacks a special character.
     */
    public function test_registration_fails_without_special_character_password(): void
    {
        $response = $this->post('/register', [
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'password' => 'Securepass123',
            'password_confirmation' => 'Securepass123',
        ]);

        $response->assertSessionHasErrors('password');
    }

    /**
     * Test that user registration passes when password is valid.
     */
    public function test_registration_passes_with_secure_password(): void
    {
        $response = $this->post('/register', [
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'password' => 'Securepass123!',
            'password_confirmation' => 'Securepass123!',
        ]);

        $response->assertRedirect('/');
        $this->assertDatabaseHas('users', [
            'email' => 'john@example.com',
        ]);
    }

    /**
     * Test that an admin user can delete a product curation.
     */
    public function test_admin_user_can_delete_product(): void
    {
        $admin = User::factory()->create([
            'is_admin' => true,
        ]);

        $product = \App\Models\Product::create([
            'name' => 'Temporary Painting Art',
            'category' => 'Wall Decor',
            'description' => 'A temporary piece of art.',
            'base_price' => 1200,
            'image_path' => 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38',
            'is_active' => true,
            'in_stock' => true,
        ]);

        $response = $this->actingAs($admin)->delete("/admin/products/{$product->id}");

        $response->assertRedirect();
        $response->assertSessionHas('success');
        $this->assertDatabaseMissing('products', [
            'id' => $product->id,
        ]);
    }

    /**
     * Test that a non-admin user is blocked from deleting a product curation.
     */
    public function test_non_admin_user_cannot_delete_product(): void
    {
        $user = User::factory()->create([
            'is_admin' => false,
        ]);

        $product = \App\Models\Product::create([
            'name' => 'Protected Sculpture Piece',
            'category' => 'Decorative Accents',
            'description' => 'A protected sculpture.',
            'base_price' => 2400,
            'image_path' => 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38',
            'is_active' => true,
            'in_stock' => true,
        ]);

        $response = $this->actingAs($user)->delete("/admin/products/{$product->id}");

        $response->assertRedirect('/');
        $this->assertDatabaseHas('products', [
            'id' => $product->id,
        ]);
    }
}
