<?php

namespace App\Models;

use App\Notifications\ResetPasswordNotification;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'username',
        'email',
        'password',
        'bio',
        'is_public',
        'share_timeline',
        'share_timeline_notes',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at'    => 'datetime',
            'password'             => 'hashed',
            'is_public'            => 'boolean',
            'share_timeline'       => 'boolean',
            'share_timeline_notes' => 'boolean',
        ];
    }

    /**
     * パスワード再設定通知を送信する（日本語・フロントエンドURL版）
     */
    public function sendPasswordResetNotification($token): void
    {
        $this->notify(new ResetPasswordNotification($token));
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

    /**
     * このユーザーがフォローしているユーザー
     */
    public function following(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'follows', 'follower_id', 'followee_id')
            ->withTimestamps();
    }

    /**
     * このユーザーをフォローしているユーザー
     */
    public function followers(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'follows', 'followee_id', 'follower_id')
            ->withTimestamps();
    }

    /**
     * 指定ユーザーをフォロー中かどうか
     */
    public function isFollowing(User $user): bool
    {
        return $this->following()->whereKey($user->id)->exists();
    }

    /**
     * このユーザーの日次ノート（1日1件、目標ごとのメモとは別物）
     */
    public function dailyNotes(): HasMany
    {
        return $this->hasMany(DailyNote::class);
    }
}
