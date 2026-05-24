<?php

use App\Http\Controllers\AIController;
use App\Http\Controllers\CustomizationController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\ProductController;
use Illuminate\Support\Facades\Route;

Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{product}', [ProductController::class, 'show']);

Route::post('/designs', [CustomizationController::class, 'saveDesign']);
Route::post('/room-images', [CustomizationController::class, 'uploadRoomImage']);

Route::post('/ai/recommend', [AIController::class, 'recommend']);
Route::post('/orders', [OrderController::class, 'store']);
