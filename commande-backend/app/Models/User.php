<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Tymon\JWTAuth\Contracts\JWTSubject;

class User extends Authenticatable implements JWTSubject
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'vendor_status',
        'shop_name',
        'shop_description',
        'shop_logo',
        'phone',
        'address',
        'approved_at',
        'approved_by',
        'rejection_reason',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'approved_at' => 'datetime',
    ];

    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    public function getJWTCustomClaims()
    {
        return [];
    }

    public function isAdmin()
    {
        return $this->role === 'admin';
    }

    public function isClient()
    {
        return $this->role === 'client';
    }

    public function isVendor()
    {
        return $this->role === 'vendor';
    }

    public function isPartner()
    {
        return $this->role === 'partner';
    }

    public function isApprovedVendor()
    {
        return $this->isVendor() && $this->vendor_status === 'approved';
    }

    public function isPendingVendor()
    {
        return $this->isVendor() && $this->vendor_status === 'pending';
    }

    public function isRejectedVendor()
    {
        return $this->isVendor() && $this->vendor_status === 'rejected';
    }

    public function isSuspendedVendor()
    {
        return $this->isVendor() && $this->vendor_status === 'suspended';
    }

    // Relations
    public function products()
    {
        return $this->hasMany(Product::class, 'vendor_id');
    }

    public function categories()
    {
        return $this->hasMany(Category::class, 'vendor_id');
    }

    public function subcategories()
    {
        return $this->hasMany(Subcategory::class, 'vendor_id');
    }

    public function approvedBy()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function approvedVendors()
    {
        return $this->hasMany(User::class, 'approved_by');
    }

    public function partner()
    {
        return $this->hasOne(Partner::class);
    }

    public function orders()
    {
        return $this->hasMany(Order::class);
    }
}
