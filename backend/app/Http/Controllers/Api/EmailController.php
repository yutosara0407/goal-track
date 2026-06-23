<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EmailController extends Controller
{
    /**
     * 現在のメール送信状況を返す
     * 月が変わっていた場合はカウントを自動リセットする
     */
    public function status(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $remaining = $user->refreshAndGetRemainingEmailCount();
        $limit     = $user->getEmailLimit();

        return response()->json([
            'plan'      => $user->plan,
            'limit'     => $limit,
            'used'      => $user->email_send_count,
            'remaining' => $remaining,
            'reset_at'  => now()->endOfMonth()->format('Y-m-d'),
        ]);
    }
}
