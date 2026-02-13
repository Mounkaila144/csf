<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class City extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'code',
        'country',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function neighborhoods()
    {
        return $this->hasMany(Neighborhood::class);
    }

    public function partners()
    {
        return $this->hasMany(Partner::class);
    }

    public function deliveryZones()
    {
        return $this->hasMany(DeliveryZone::class);
    }
}
