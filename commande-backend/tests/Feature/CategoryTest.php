<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Category;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class CategoryTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    /**
     * Test admin can create a category
     */
    public function test_admin_can_create_category()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $token = auth('api')->login($admin);

        $categoryData = [
            'name' => $this->faker->word,
            'description' => $this->faker->sentence,
            'is_active' => true
        ];

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->postJson('/api/admin/categories', $categoryData);

        $response->assertStatus(201)
                ->assertJsonStructure([
                    'status',
                    'message',
                    'data' => [
                        'id',
                        'name',
                        'description',
                        'is_active',
                        'created_at',
                        'updated_at'
                    ]
                ]);

        $this->assertDatabaseHas('categories', [
            'name' => $categoryData['name'],
            'description' => $categoryData['description'],
            'is_active' => true
        ]);
    }

    /**
     * Test client cannot create a category
     */
    public function test_client_cannot_create_category()
    {
        $client = User::factory()->create(['role' => 'client']);
        $token = auth('api')->login($client);

        $categoryData = [
            'name' => $this->faker->word,
            'description' => $this->faker->sentence,
            'is_active' => true
        ];

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->postJson('/api/admin/categories', $categoryData);

        $response->assertStatus(403)
                ->assertJson([
                    'status' => 'error',
                    'message' => 'Access denied. Insufficient permissions.'
                ]);
    }

    /**
     * Test unauthenticated user cannot create a category
     */
    public function test_unauthenticated_user_cannot_create_category()
    {
        $categoryData = [
            'name' => $this->faker->word,
            'description' => $this->faker->sentence,
            'is_active' => true
        ];

        $response = $this->postJson('/api/admin/categories', $categoryData);

        $response->assertStatus(401)
                ->assertJson([
                    'status' => 'error',
                    'message' => 'Unauthorized'
                ]);
    }

    /**
     * Test admin can get categories
     */
    public function test_admin_can_get_categories()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $token = auth('api')->login($admin);

        // Create some test categories
        Category::factory()->count(3)->create();

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->getJson('/api/admin/categories');

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'status',
                    'data'
                ]);
    }

    /**
     * Test public can get categories without authentication
     */
    public function test_public_can_get_categories()
    {
        Category::factory()->count(3)->create();

        $response = $this->getJson('/api/categories');

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'status',
                    'data'
                ]);
    }

    /**
     * Test admin can update a category
     */
    public function test_admin_can_update_category()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $token = auth('api')->login($admin);
        
        $category = Category::factory()->create([
            'name' => 'Old Name',
            'description' => 'Old Description',
            'is_active' => true
        ]);

        $updateData = [
            'name' => 'New Name',
            'description' => 'New Description',
            'is_active' => false
        ];

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->putJson("/api/admin/categories/{$category->id}", $updateData);

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'status',
                    'message',
                    'data' => [
                        'id',
                        'name',
                        'description',
                        'is_active'
                    ]
                ]);

        $this->assertDatabaseHas('categories', [
            'id' => $category->id,
            'name' => 'New Name',
            'description' => 'New Description',
            'is_active' => false
        ]);
    }

    /**
     * Test admin can delete a category
     */
    public function test_admin_can_delete_category()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $token = auth('api')->login($admin);
        
        $category = Category::factory()->create();

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->deleteJson("/api/admin/categories/{$category->id}");

        $response->assertStatus(200);

        $this->assertDatabaseMissing('categories', [
            'id' => $category->id
        ]);
    }

    /**
     * Test category creation validation
     */
    public function test_category_creation_requires_name()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $token = auth('api')->login($admin);

        $categoryData = [
            'description' => $this->faker->sentence,
            'is_active' => true
        ];

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->postJson('/api/admin/categories', $categoryData);

        $response->assertStatus(400)
                ->assertJsonValidationErrors(['name']);
    }

    /**
     * Test category status must be valid
     */
    public function test_category_status_must_be_valid()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $token = auth('api')->login($admin);

        $categoryData = [
            'name' => $this->faker->word,
            'description' => $this->faker->sentence,
            'is_active' => 'invalid_boolean'
        ];

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->postJson('/api/admin/categories', $categoryData);

        $response->assertStatus(400)
                ->assertJsonValidationErrors(['is_active']);
    }
}