<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'partner_id',
        'payment_code_id',
        'client_id',
        'amount',
        'partner_commission',
        'status',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'partner_commission' => 'decimal:2',
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function partner()
    {
        return $this->belongsTo(Partner::class);
    }

    public function paymentCode()
    {
        return $this->belongsTo(PaymentCode::class);
    }

    public function client()
    {
        return $this->belongsTo(User::class, 'client_id');
    }
}
