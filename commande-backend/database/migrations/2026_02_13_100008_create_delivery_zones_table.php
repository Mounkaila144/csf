<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('delivery_zones', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->foreignId('city_id')->constrained()->onDelete('cascade');
            $table->decimal('base_price', 12, 2)->default(0);
            $table->decimal('price_per_kg', 12, 2)->default(0);
            $table->decimal('price_per_m3', 12, 2)->default(0);
            $table->decimal('max_weight_kg', 8, 2)->default(100);
            $table->decimal('max_volume_m3', 8, 2)->default(10);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('delivery_zones');
    }
};
