<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PaymentCode extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'partner_id',
        'order_id',
        'amount',
        'status',
        'expires_at',
        'validated_at',
        'validated_by',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'expires_at' => 'datetime',
        'validated_at' => 'datetime',
    ];

    // Characters excluding ambiguous ones: 0/O/1/I/L
    private static $allowedChars = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';

    public static function generateCode(): string
    {
        $chars = self::$allowedChars;
        $code = '';
        for ($i = 0; $i < 8; $i++) {
            $code .= $chars[random_int(0, strlen($chars) - 1)];
        }
        return 'CSF-' . substr($code, 0, 4) . '-' . substr($code, 4, 4);
    }

    public static function generateUniqueCode(): string
    {
        do {
            $code = self::generateCode();
        } while (self::where('code', $code)->exists());

        return $code;
    }

    public function partner()
    {
        return $this->belongsTo(Partner::class);
    }

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function validatedByUser()
    {
        return $this->belongsTo(User::class, 'validated_by');
    }

    public function payment()
    {
        return $this->hasOne(Payment::class);
    }

    public function isExpired(): bool
    {
        return $this->expires_at->isPast();
    }

    public function isPending(): bool
    {
        return $this->status === 'pending' && !$this->isExpired();
    }
}
