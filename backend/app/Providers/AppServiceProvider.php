<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use App\Models\Goal;
use App\Policies\GoalPolicy;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Gate::policy(Goal::class, GoalPolicy::class);

        // 認証系エンドポイントのブルートフォース対策
        // 数値型throttle（throttle:5,1）はゲストだとIP単位で全ルート共有のカウンターになるため、
        // エンドポイントごとに独立したキーを持つ名前付きリミッターを定義する
        RateLimiter::for('login', function (Request $request) {
            return Limit::perMinute(5)->by('login:' . $request->ip());
        });

        RateLimiter::for('register', function (Request $request) {
            return Limit::perMinute(5)->by('register:' . $request->ip());
        });

        RateLimiter::for('password-email', function (Request $request) {
            return Limit::perMinute(3)->by('pw-email:' . $request->ip());
        });

        RateLimiter::for('password-reset', function (Request $request) {
            return Limit::perMinute(5)->by('pw-reset:' . $request->ip());
        });
    }
}
