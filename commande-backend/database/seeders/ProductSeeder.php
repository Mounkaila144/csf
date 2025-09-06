<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;
use App\Models\Product;
use App\Models\Subcategory;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categoryIds = Category::query()->pluck('id');
        if ($categoryIds->isEmpty()) {
            Category::factory()->count(300)->create();
            $categoryIds = Category::query()->pluck('id');
        }

        // S'assure qu'il y a des sous-catégories disponibles pour le rattachement
        if (!Subcategory::query()->exists()) {
            Subcategory::factory()->count(300)->state(fn () => [
                'category_id' => $categoryIds->random(),
            ])->create();
        }

        // Précharger les sous-catégories groupées par catégorie
        $subcategoriesByCategory = Subcategory::query()
            ->get(['id', 'category_id'])
            ->groupBy('category_id');

        // Crée exactement 300 produits
        Product::factory()
            ->count(300)
            ->state(function () use ($categoryIds, $subcategoriesByCategory) {
                $categoryId = $categoryIds->random();
                $subId = null;
                if (isset($subcategoriesByCategory[$categoryId]) && $subcategoriesByCategory[$categoryId]->isNotEmpty()) {
                    $subId = $subcategoriesByCategory[$categoryId]->random()->id;
                }
                return [
                    'category_id' => $categoryId,
                    'subcategory_id' => $subId,
                ];
            })
            ->create();
    }
}

