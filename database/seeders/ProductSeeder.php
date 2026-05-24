<?php

namespace Database\Seeders;

use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        // Cleanly wipe the table to remove any duplicate, obsolete, or non-category products from old runs
        \Illuminate\Support\Facades\Schema::disableForeignKeyConstraints();
        Product::query()->truncate();
        \Illuminate\Support\Facades\Schema::enableForeignKeyConstraints();

        $products = [
            // ─── Wall Decor ───────────────────────────────────────────────
            [
                'name'        => 'Custom Canvas Wall Art',
                'description' => 'AI-generated personalized canvas print with your chosen palette, quote, and abstract composition. Printed on premium 400gsm cotton rag.',
                'category'    => 'Wall Decor',
                'base_price'  => 2199.00,
                'image_path'  => 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?auto=format&fit=crop&w=700&q=80',
                'is_active'   => true,
            ],
            [
                'name'        => 'Personalized Wooden Wall Frame',
                'description' => 'Handcrafted solid wood frame with your custom text, initials, or a special date. Available in Oak, Walnut, and Ebony finishes.',
                'category'    => 'Wall Decor',
                'base_price'  => 1499.00,
                'image_path'  => 'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?auto=format&fit=crop&w=700&q=80',
                'is_active'   => true,
            ],
            [
                'name'        => 'Hexagonal Wooden Wall Mirror',
                'description' => 'A geometric statement mirror in hand-finished teak. Clusters beautifully into a gallery wall arrangement.',
                'category'    => 'Wall Decor',
                'base_price'  => 2799.00,
                'image_path'  => 'https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=700&q=80',
                'is_active'   => true,
            ],
            [
                'name'        => 'Macramé Wall Hanging',
                'description' => 'Hand-knotted from natural cotton rope. Customizable in width, fringe length, and accent bead color. Bohemian & Japandi ready.',
                'category'    => 'Wall Decor',
                'base_price'  => 1299.00,
                'image_path'  => 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=700&q=80',
                'is_active'   => true,
            ],

            // ─── Lighting ─────────────────────────────────────────────────
            [
                'name'        => 'Artisan Table Lamp',
                'description' => 'Sculpted ceramic base with a linen drum shade. Available in 6 glaze colors to match your room palette. Warm 2700K Edison bulb included.',
                'category'    => 'Lighting',
                'base_price'  => 3499.00,
                'image_path'  => 'https://images.unsplash.com/photo-1540932239986-30128078f3c5?auto=format&fit=crop&w=700&q=80',
                'is_active'   => true,
            ],
            [
                'name'        => 'Rattan Pendant Shade',
                'description' => 'Hand-woven rattan pendant that casts stunning dappled light patterns. Ideal above dining tables and reading nooks.',
                'category'    => 'Lighting',
                'base_price'  => 2199.00,
                'image_path'  => 'https://images.unsplash.com/photo-1513506003901-1e6a35703549?auto=format&fit=crop&w=700&q=80',
                'is_active'   => true,
            ],
            [
                'name'        => 'Bohemian Fairy String Lights',
                'description' => 'Warm-white micro-LED string lights on copper wire, 5 metres. Perfect for headboards, shelves, and balcony draping.',
                'category'    => 'Lighting',
                'base_price'  => 899.00,
                'image_path'  => 'https://bonito.in/wp-content/uploads/2024/06/Untitled-design-2024-06-11T172212.556.jpg',
                'is_active'   => true,
            ],

            // ─── Soft Furnishings ─────────────────────────────────────────
            [
                'name'        => 'Personalized Throw Pillow',
                'description' => 'Custom monogram or quote embroidered on 100% organic Belgian linen. Stone-washed for a lived-in luxury feel. 45 × 45 cm.',
                'category'    => 'Soft Furnishings',
                'base_price'  => 899.00,
                'image_path'  => 'https://images.unsplash.com/photo-1616627983046-b8001fffef83?auto=format&fit=crop&w=700&q=80',
                'is_active'   => true,
            ],
            [
                'name'        => 'Custom Cushion Cover Set (2)',
                'description' => 'Pair of cushion covers in coordinating prints. Choose from our AI-curated fabric palettes — Japandi, Boho, or Minimalist.',
                'category'    => 'Soft Furnishings',
                'base_price'  => 1199.00,
                'image_path'  => 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=700&q=80',
                'is_active'   => true,
            ],
            [
                'name'        => 'Handwoven Knit Throw Blanket',
                'description' => 'Chunky-knit merino-blend throw in your chosen colorway. Drapes beautifully over sofas and armchairs for a cosy, editorial look.',
                'category'    => 'Soft Furnishings',
                'base_price'  => 2499.00,
                'image_path'  => 'https://images.unsplash.com/photo-1601195853995-c56bae4d4e7a?auto=format&fit=crop&w=700&q=80',
                'is_active'   => true,
            ],

            // ─── Decorative Accents ───────────────────────────────────────
            [
                'name'        => 'Ceramic Bud Vase Set (3)',
                'description' => 'A trio of hand-thrown stoneware vases in graduated heights. Each set is unique — glazed in earthy matte finishes that complement any palette.',
                'category'    => 'Decorative Accents',
                'base_price'  => 1199.00,
                'image_path'  => 'https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?auto=format&fit=crop&w=700&q=80',
                'is_active'   => true,
            ],
            [
                'name'        => 'Luxury Soy Scented Candle',
                'description' => 'Hand-poured soy wax in a reusable ceramic pot. Choose from 8 signature scents: Vetiver & Cedar, White Tea, Jasmine Noir, and more.',
                'category'    => 'Decorative Accents',
                'base_price'  => 699.00,
                'image_path'  => 'https://images.unsplash.com/photo-1602874801006-9a83ec649977?auto=format&fit=crop&w=700&q=80',
                'is_active'   => true,
            ],
            [
                'name'        => 'Woven Seagrass Storage Tray',
                'description' => 'Natural seagrass tray with leather handles. Perfect as a coffee table centrepiece, catch-all, or plant display plinth.',
                'category'    => 'Decorative Accents',
                'base_price'  => 1099.00,
                'image_path'  => 'https://images.unsplash.com/photo-1566041510639-8d95a2490bfb?auto=format&fit=crop&w=700&q=80',
                'is_active'   => true,
            ],

            // ─── Rugs & Mats ──────────────────────────────────────────────
            [
                'name'        => 'Natural Jute Area Rug',
                'description' => 'Hand-braided jute rug with a dense, durable weave. Earthy, natural texture grounds any room. Custom sizes from 3×5 to 8×10 ft.',
                'category'    => 'Rugs & Mats',
                'base_price'  => 4999.00,
                'image_path'  => 'https://images.unsplash.com/photo-1575318634028-6a0cfcb60c59?auto=format&fit=crop&w=700&q=80',
                'is_active'   => true,
            ],
            [
                'name'        => 'Geometric Dhurrie Rug',
                'description' => 'Flatweave cotton dhurrie in bold or subtle geometric patterns. Reversible, easy-clean, and available in 12 colorways.',
                'category'    => 'Rugs & Mats',
                'base_price'  => 5499.00,
                'image_path'  => 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=700&q=80',
                'is_active'   => true,
            ],
        ];

        foreach ($products as $productData) {
            Product::query()->updateOrCreate(
                ['name' => $productData['name']],
                $productData,
            );
        }
    }
}
