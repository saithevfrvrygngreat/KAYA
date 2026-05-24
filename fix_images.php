<?php

use Illuminate\Support\Facades\DB;

// Use the curated URL for fairy string lights image
DB::table('products')
    ->where('name', 'Bohemian Fairy String Lights')
    ->update([
        'image_path' => 'https://bonito.in/wp-content/uploads/2024/06/Untitled-design-2024-06-11T172212.556.jpg',
        'updated_at' => now(),
    ]);

$p = DB::table('products')->where('name', 'Bohemian Fairy String Lights')->first();
echo "Updated: " . $p->name . PHP_EOL;
echo "Image:   " . $p->image_path . PHP_EOL;
