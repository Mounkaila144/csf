<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\Product;
use App\Models\Subcategory;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Product>
 */
class ProductFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var class-string
     */
    protected $model = Product::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $price = $this->faker->randomFloat(2, 5, 500);
        $images = [
            $this->faker->imageUrl(640, 480, 'products', true),
        ];

        return [
            'name' => $this->faker->words(3, true),
            'description' => $this->faker->paragraph(),
            'price' => $price,
            'images' => 'storage/images/1757155956_MdTQpvzTwZ.jpeg',
            'stock' => $this->faker->numberBetween(0, 500),
            'category_id' => Category::factory(),
            'subcategory_id' => null, // peut être défini via state/forSubcategory
            'is_active' => $this->faker->boolean(85),
            'status' => $this->faker->randomElements(['best_seller', 'new', 'on_sale'], $this->faker->numberBetween(0, 2)),
        ];
    }

    /**
     * Attach to a specific category.
     */
    public function forCategory(Category $category): static
    {
        return $this->state(fn (array $attributes) => [
            'category_id' => $category->id,
        ]);
    }

    /**
     * Attach to a specific subcategory (and its category).
     */
    public function forSubcategory(Subcategory $subcategory): static
    {
        return $this->state(fn (array $attributes) => [
            'subcategory_id' => $subcategory->id,
            'category_id' => $subcategory->category_id,
        ]);
    }
}

