<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('quotes', function (Blueprint $table) {
            $table->id();
            $table->string('reference')->unique();
            $table->unsignedBigInteger('user_id')->nullable();
            $table->foreignId('delivery_zone_id')->constrained();
            $table->json('items');
            $table->decimal('subtotal_products', 12, 2);
            $table->decimal('total_weight_kg', 8, 2)->default(0);
            $table->decimal('total_volume_m3', 8, 4)->default(0);
            $table->decimal('delivery_cost', 12, 2);
            $table->decimal('total_amount', 12, 2);
            $table->enum('status', ['draft', 'sent', 'accepted', 'expired'])->default('draft');
            $table->timestamp('expires_at');
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('quotes');
    }
};
