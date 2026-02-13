<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DeliveryZone extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'city_id',
        'base_price',
        'price_per_kg',
        'price_per_m3',
        'max_weight_kg',
        'max_volume_m3',
        'is_active',
    ];

    protected $casts = [
        'base_price' => 'decimal:2',
        'price_per_kg' => 'decimal:2',
        'price_per_m3' => 'decimal:2',
        'max_weight_kg' => 'decimal:2',
        'max_volume_m3' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    public function city()
    {
        return $this->belongsTo(City::class);
    }

    public function quotes()
    {
        return $this->hasMany(Quote::class);
    }

    public function calculateDeliveryCost(float $weightKg, float $volumeM3): float
    {
        $costByWeight = $weightKg * $this->price_per_kg;
        $costByVolume = $volumeM3 * $this->price_per_m3;

        return $this->base_price + max($costByWeight, $costByVolume);
    }
}
