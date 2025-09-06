<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;
use App\Models\Subcategory;

class SubcategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categoryIds = Category::query()->pluck('id');

        if ($categoryIds->isEmpty()) {
            // S'assure qu'il existe des catégories si on lance ce seeder isolément
            Category::factory()->count(300)->create();
            $categoryIds = Category::query()->pluck('id');
        }

        // Crée exactement 300 sous-catégories rattachées à des catégories aléatoires
        Subcategory::factory()
            ->count(300)
            ->state(fn () => [
                'category_id' => $categoryIds->random(),
            ])
            ->create();
    }
}

