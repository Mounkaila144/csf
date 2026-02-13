<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Quote extends Model
{
    use HasFactory;

    protected $fillable = [
        'reference',
        'user_id',
        'delivery_zone_id',
        'items',
        'subtotal_products',
        'total_weight_kg',
        'total_volume_m3',
        'delivery_cost',
        'total_amount',
        'status',
        'expires_at',
        'notes',
    ];

    protected $casts = [
        'items' => 'array',
        'subtotal_products' => 'decimal:2',
        'total_weight_kg' => 'decimal:2',
        'total_volume_m3' => 'decimal:4',
        'delivery_cost' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'expires_at' => 'datetime',
    ];

    public static function generateReference(): string
    {
        return 'DEV-' . strtoupper(substr(md5(uniqid()), 0, 8));
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function deliveryZone()
    {
        return $this->belongsTo(DeliveryZone::class);
    }

    public function isExpired(): bool
    {
        return $this->expires_at->isPast();
    }
}
