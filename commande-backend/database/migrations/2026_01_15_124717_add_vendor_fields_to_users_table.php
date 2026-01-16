<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Modifier l'enum role pour ajouter 'vendor'
        DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('admin', 'client', 'vendor') DEFAULT 'client'");

        // 2. Ajouter les colonnes spécifiques aux vendeurs
        Schema::table('users', function (Blueprint $table) {
            // Statut d'approbation pour les vendeurs
            $table->enum('vendor_status', ['pending', 'approved', 'rejected', 'suspended'])->nullable()->after('role');

            // Informations de la boutique
            $table->string('shop_name')->nullable()->after('vendor_status');
            $table->text('shop_description')->nullable()->after('shop_name');
            $table->string('shop_logo')->nullable()->after('shop_description');
            $table->string('phone')->nullable()->after('shop_logo');
            $table->text('address')->nullable()->after('phone');

            // Informations administratives
            $table->timestamp('approved_at')->nullable()->after('address');
            $table->unsignedBigInteger('approved_by')->nullable()->after('approved_at');
            $table->text('rejection_reason')->nullable()->after('approved_by');

            // Index
            $table->index('vendor_status');
            $table->index('role');

            // Clé étrangère pour approved_by (référence à un admin)
            $table->foreign('approved_by')->references('id')->on('users')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Supprimer la clé étrangère
            $table->dropForeign(['approved_by']);

            // Supprimer les colonnes
            $table->dropColumn([
                'vendor_status',
                'shop_name',
                'shop_description',
                'shop_logo',
                'phone',
                'address',
                'approved_at',
                'approved_by',
                'rejection_reason'
            ]);
        });

        // Rétablir l'enum original
        DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('admin', 'client') DEFAULT 'client'");
    }
};
