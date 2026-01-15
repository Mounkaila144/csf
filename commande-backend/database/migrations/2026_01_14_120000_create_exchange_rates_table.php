<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('exchange_rates', function (Blueprint $table) {
            $table->id();
            $table->string('from_currency', 3); // RMB/CNY
            $table->string('to_currency', 3);   // XOF
            $table->decimal('rate', 16, 6);     // Taux de change avec 6 décimales
            $table->timestamp('fetched_at');    // Quand le taux a été récupéré
            $table->timestamps();

            // Index pour optimiser les requêtes
            $table->unique(['from_currency', 'to_currency']);
            $table->index('fetched_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('exchange_rates');
    }
};
