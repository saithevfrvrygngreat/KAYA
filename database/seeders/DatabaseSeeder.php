<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call(ProductSeeder::class);

        // Seed Admin User
        User::query()->firstOrCreate(
            ['email' => 'Nandinigottipati2004@gmail.com'],
            [
                'name' => 'Nandini Gottipati',
                'password' => \Illuminate\Support\Facades\Hash::make('Nandhini@2004'),
                'is_admin' => true,
            ]
        );

        // Seed Normal User
        User::query()->firstOrCreate(
            ['email' => 'test@example.com'],
            [
                'name' => 'Test User',
                'password' => \Illuminate\Support\Facades\Hash::make('password'),
                'is_admin' => false,
            ],
        );
    }
}
