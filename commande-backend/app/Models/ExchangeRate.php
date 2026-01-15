<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ExchangeRate extends Model
{
    use HasFactory;

    protected $fillable = [
        'from_currency',
        'to_currency',
        'rate',
        'fetched_at'
    ];

    protected $casts = [
        'rate' => 'decimal:6',
        'fetched_at' => 'datetime',
    ];

    /**
     * Obtenir le taux de change pour une paire de devises
     */
    public static function getRate(string $from, string $to): ?float
    {
        $rate = self::where('from_currency', $from)
            ->where('to_currency', $to)
            ->latest('fetched_at')
            ->first();

        return $rate ? (float) $rate->rate : null;
    }

    /**
     * Vérifier si le taux est périmé (plus de 24h)
     */
    public function isStale(): bool
    {
        return $this->fetched_at->diffInHours(now()) > 24;
    }
}
