<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'price',
        'images',
        'stock',
        'category_id',
        'subcategory_id',
        'is_active',
        'status'
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'images' => 'array',
        'is_active' => 'boolean',
        'status' => 'array'
    ];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function subcategory()
    {
        return $this->belongsTo(Subcategory::class);
    }

    public function isInStock()
    {
        return $this->stock > 0;
    }

    public function decrementStock($quantity = 1)
    {
        if ($this->stock >= $quantity) {
            $this->decrement('stock', $quantity);
            return true;
        }
        return false;
    }

    public function hasStatus($status)
    {
        return in_array($status, $this->status ?? []);
    }

    public function isBestSeller()
    {
        return $this->hasStatus('best_seller');
    }

    public function isNew()
    {
        return $this->hasStatus('new');
    }

    public function isOnSale()
    {
        return $this->hasStatus('on_sale');
    }

    public function addStatus($status)
    {
        $statuses = $this->status ?? [];
        if (!in_array($status, $statuses)) {
            $statuses[] = $status;
            $this->status = $statuses;
        }
        return $this;
    }

    public function removeStatus($status)
    {
        $statuses = $this->status ?? [];
        $this->status = array_values(array_filter($statuses, function($s) use ($status) {
            return $s !== $status;
        }));
        return $this;
    }
}
