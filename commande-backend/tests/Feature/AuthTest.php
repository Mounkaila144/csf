<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    /**
     * Test user registration
     */
    public function test_user_can_register()
    {
        $userData = [
            'name' => $this->faker->name,
            'email' => $this->faker->unique()->safeEmail,
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role' => 'client'
        ];

        $response = $this->postJson('/api/auth/register', $userData);

        $response->assertStatus(201)
                ->assertJsonStructure([
                    'status',
                    'message',
                    'user' => [
                        'id',
                        'name',
                        'email',
                        'role'
                    ],
                    'token'
                ]);

        $this->assertDatabaseHas('users', [
            'email' => $userData['email'],
            'role' => 'client'
        ]);
    }

    /**
     * Test admin user registration
     */
    public function test_admin_user_can_register()
    {
        $userData = [
            'name' => $this->faker->name,
            'email' => $this->faker->unique()->safeEmail,
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role' => 'admin'
        ];

        $response = $this->postJson('/api/auth/register', $userData);

        $response->assertStatus(201);
        
        $this->assertDatabaseHas('users', [
            'email' => $userData['email'],
            'role' => 'admin'
        ]);
    }

    /**
     * Test user login
     */
    public function test_user_can_login()
    {
        $user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => Hash::make('password123'),
            'role' => 'client'
        ]);

        $loginData = [
            'email' => 'test@example.com',
            'password' => 'password123'
        ];

        $response = $this->postJson('/api/auth/login', $loginData);

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'status',
                    'message',
                    'user' => [
                        'id',
                        'name',
                        'email',
                        'role'
                    ],
                    'token'
                ])
                ->assertJson([
                    'status' => 'success',
                    'user' => [
                        'email' => 'test@example.com',
                        'role' => 'client'
                    ]
                ]);
    }

    /**
     * Test login with invalid credentials
     */
    public function test_user_cannot_login_with_invalid_credentials()
    {
        $user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => Hash::make('password123')
        ]);

        $loginData = [
            'email' => 'test@example.com',
            'password' => 'wrongpassword'
        ];

        $response = $this->postJson('/api/auth/login', $loginData);

        $response->assertStatus(401)
                ->assertJson([
                    'status' => 'error',
                    'message' => 'Invalid credentials'
                ]);
    }

    /**
     * Test user can get profile
     */
    public function test_authenticated_user_can_get_profile()
    {
        $user = User::factory()->create([
            'role' => 'client'
        ]);

        $token = auth('api')->login($user);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->getJson('/api/auth/me');

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'status',
                    'user' => [
                        'id',
                        'name',
                        'email',
                        'role'
                    ]
                ])
                ->assertJson([
                    'status' => 'success',
                    'user' => [
                        'id' => $user->id,
                        'email' => $user->email,
                        'role' => $user->role
                    ]
                ]);
    }

    /**
     * Test unauthenticated user cannot get profile
     */
    public function test_unauthenticated_user_cannot_get_profile()
    {
        $response = $this->getJson('/api/auth/me');

        $response->assertStatus(401)
                ->assertJson([
                    'status' => 'error'
                ]);
    }

    /**
     * Test user can logout
     */
    public function test_authenticated_user_can_logout()
    {
        $user = User::factory()->create();
        $token = auth('api')->login($user);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->postJson('/api/auth/logout');

        $response->assertStatus(200)
                ->assertJson([
                    'status' => 'success',
                    'message' => 'Logout successful'
                ]);
    }
}