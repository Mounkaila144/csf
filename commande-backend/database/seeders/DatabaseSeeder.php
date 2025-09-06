<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Seed 300 catégories, 300 sous-catégories, 300 produits
        $this->call([
            CategorySeeder::class,
            SubcategorySeeder::class,
            ProductSeeder::class,
        ]);
    }
}
