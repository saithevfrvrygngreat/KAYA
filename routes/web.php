<?php

use App\Http\Controllers\CustomizationController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\AiCurationController;
use App\Http\Controllers\AdminController;
use Illuminate\Support\Facades\Route;

Route::get('/', [ProductController::class, 'index'])->name('home');
Route::get('/products', [ProductController::class, 'products'])->name('products.index');
Route::get('/customize', [ProductController::class, 'customizeGeneral'])->name('customize.index');
Route::get('/login', [AuthController::class, 'login'])->name('login');
Route::post('/login', [AuthController::class, 'authenticate']);
Route::get('/register', [AuthController::class, 'register'])->name('register');
Route::post('/register', [AuthController::class, 'store']);
Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

Route::get('/products/{product}/customize', [ProductController::class, 'customize'])->name('products.customize');

Route::post('/designs', [CustomizationController::class, 'saveDesign'])->name('designs.save');
Route::get('/designs/{customDesign}/preview', [CustomizationController::class, 'preview'])->name('designs.preview');

// Cart (localStorage-driven, no auth needed for browsing)
Route::get('/cart', fn() => view('cart'))->name('cart.index');

// Aura AI Spatial Design & Visualizer Curation Routes
Route::get('/ai-designer', [AiCurationController::class, 'index'])->name('ai.designer');
Route::post('/api/ai/generate-art', [AiCurationController::class, 'generateArtSpec'])->name('api.ai.generate_art');
Route::post('/api/ai/analyze-room', [AiCurationController::class, 'analyzeRoom'])->name('api.ai.analyze_room');

// Auth-protected routes
Route::middleware('auth')->group(function () {
    Route::post('/orders', [OrderController::class, 'store'])->name('orders.store');
    Route::get('/orders/{order}', [OrderController::class, 'show'])->name('orders.show');
    Route::get('/dashboard', [OrderController::class, 'index'])->name('dashboard');
    Route::post('/cart/checkout', [OrderController::class, 'cartCheckout'])->name('cart.checkout');
});

// Admin-only routes
Route::middleware(['auth', 'admin'])->group(function () {
    Route::get('/admin', [AdminController::class, 'index'])->name('admin.dashboard');
    Route::patch('/admin/orders/{order}/status', [AdminController::class, 'updateOrderStatus'])->name('admin.orders.update');
    Route::post('/admin/products', [AdminController::class, 'storeProduct'])->name('admin.products.store');
    Route::patch('/admin/products/{product}/toggle-stock', [AdminController::class, 'toggleProductStock'])->name('admin.products.toggle-stock');
    Route::patch('/admin/products/{product}/toggle-active', [AdminController::class, 'toggleProductActive'])->name('admin.products.toggle-active');
    Route::delete('/admin/products/{product}', [AdminController::class, 'destroyProduct'])->name('admin.products.destroy');
});
