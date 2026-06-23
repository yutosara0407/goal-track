<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    const FREE_EMAIL_LIMIT    = 30;
    const PREMIUM_EMAIL_LIMIT = 100;

    protected $fillable = [
        'name',
        'email',
        'password',
        'plan',
        'email_send_count',
        'email_send_reset_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at'   => 'datetime',
            'password'            => 'hashed',
            'email_send_reset_at' => 'datetime',
        ];
    }

    public function getEmailLimit(): int
    {
        return $this->plan === 'premium' ? self::PREMIUM_EMAIL_LIMIT : self::FREE_EMAIL_LIMIT;
    }

    /** 月が変わっていたらカウントをリセットして残数を返す */
    public function refreshAndGetRemainingEmailCount(): int
    {
        $now = now();
        if (!$this->email_send_reset_at || !$this->email_send_reset_at->isSameMonth($now)) {
            $this->update([
                'email_send_count'    => 0,
                'email_send_reset_at' => $now->copy()->startOfMonth(),
            ]);
        }
        return max(0, $this->getEmailLimit() - $this->email_send_count);
    }

    /**
     * このユーザーが登録した全目標
     */
    public function goals(): HasMany
    {
        return $this->hasMany(Goal::class);
    }

    /**
     * アクティブな目標のみを返す
     */
    public function activeGoals(): HasMany
    {
        return $this->hasMany(Goal::class)->where('is_active', true);
    }
}
