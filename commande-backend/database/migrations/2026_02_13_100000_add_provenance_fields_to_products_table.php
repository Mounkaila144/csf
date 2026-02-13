<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->string('supplier_company')->nullable()->after('status');
            $table->string('supplier_phone')->nullable()->after('supplier_company');
            $table->string('supplier_address')->nullable()->after('supplier_phone');
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn(['supplier_company', 'supplier_phone', 'supplier_address']);
        });
    }
};
