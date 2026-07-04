<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * パスワード再設定メール
 * リンク先はフロントエンドの再設定画面（SPA）を指す
 */
class ResetPasswordNotification extends Notification
{
    use Queueable;

    public function __construct(
        public string $token,
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $url = rtrim(config('app.frontend_url'), '/')
            . '/reset-password?token=' . $this->token
            . '&email=' . urlencode($notifiable->getEmailForPasswordReset());

        $expire = config('auth.passwords.users.expire');

        return (new MailMessage)
            ->subject('【GoalTrack】パスワード再設定のご案内')
            ->greeting("{$notifiable->name} さん")
            ->line('パスワード再設定のリクエストを受け付けました。以下のボタンから新しいパスワードを設定してください。')
            ->action('パスワードを再設定する', $url)
            ->line("このリンクの有効期限は {$expire} 分です。")
            ->line('このメールに心当たりがない場合は、操作は不要です。パスワードは変更されません。')
            ->salutation('GoalTrack');
    }
}
