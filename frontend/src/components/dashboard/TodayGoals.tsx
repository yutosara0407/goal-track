/**
 * 今日の目標チェックリストコンポーネント
 * ダッシュボードの中心機能 - 今日達成すべき目標を一覧表示してチェックできる
 */
'use client';

import { useState } from 'react';
import { CheckCircle2, Circle, ChevronRight, Flame } from 'lucide-react';
import { cn, formatStreak, todayString } from '@/lib/utils';
import { useDayCompletions, useToggleCompletion } from '@/hooks/useCompletions';
import { CardSkeleton } from '@/components/ui/LoadingSkeleton';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { DayCompletionItem } from '@/types';

interface NoteModalProps {
  item: DayCompletionItem;
  onClose: () => void;
  onSave: (note: string) => void;
}

/** メモ入力モーダル */
function NoteModal({ item, onClose, onSave }: NoteModalProps) {
  const [note, setNote] = useState(item.note || '');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/60 dark:shadow-black/40 p-5 w-full max-w-sm animate-slide-up">
        <h3 className="font-semibold text-slate-900 dark:text-white mb-3">
          {item.goal.title} のメモ
        </h3>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="今日の感想や気づきを記録..."
          className="w-full h-24 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
          maxLength={300}
          autoFocus
        />
        <p className="text-xs text-slate-400 text-right mb-3">{note.length}/300</p>
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            キャンセル
          </button>
          <button
            onClick={() => onSave(note)}
            className="flex-1 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm font-medium hover:from-indigo-700 hover:to-violet-700 transition-colors"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
}

export function TodayGoals() {
  const today = todayString();
  const { data, isLoading, error } = useDayCompletions(today);
  const toggleMutation = useToggleCompletion();
  const [noteTarget, setNoteTarget] = useState<DayCompletionItem | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => <CardSkeleton key={i} />)}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm p-6 text-center text-slate-500">
        <p>データの取得に失敗しました</p>
      </div>
    );
  }

  if (!data || data.items.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm p-8 text-center">
        <div className="text-5xl mb-4">🎯</div>
        <p className="text-slate-600 dark:text-slate-400 font-medium">目標がまだ登録されていません</p>
        <p className="text-sm text-slate-400 mt-1">
          <a href="/goals" className="text-indigo-600 hover:underline">目標管理</a>から最初の目標を追加しましょう
        </p>
      </div>
    );
  }

  const handleToggle = (item: DayCompletionItem) => {
    toggleMutation.mutate({
      goal_id: item.goal.id,
      date: today,
      completed: !item.completed,
    });
  };

  const handleSaveNote = (note: string) => {
    if (!noteTarget) return;
    toggleMutation.mutate({
      goal_id: noteTarget.goal.id,
      date: today,
      completed: noteTarget.completed,
      note,
    });
    setNoteTarget(null);
  };

  return (
    <>
      {/* 全体達成率サマリー */}
      <div className="bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-900/20 dark:to-violet-900/20 rounded-3xl p-4 border border-indigo-100 dark:border-indigo-800/30 mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            今日の進捗
          </span>
          <span className="text-sm font-bold text-slate-900 dark:text-white">
            {data.items.filter((i) => i.completed).length}/{data.items.length} 完了
          </span>
        </div>
        <ProgressBar value={data.completion_rate} size="md" showLabel />
      </div>

      {/* 目標チェックリスト */}
      <div className="space-y-2">
        {data.items.map((item) => (
          <div
            key={item.goal.id}
            className={cn(
              'bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4 transition-all duration-200',
              item.completed && 'opacity-70'
            )}
          >
            {/* チェックボタン */}
            <button
              onClick={() => handleToggle(item)}
              disabled={toggleMutation.isPending}
              className="flex-shrink-0 transition-all duration-200 hover:scale-110 active:scale-95 focus:outline-none"
              aria-label={`${item.goal.title}を${item.completed ? '未達成に' : '達成済みに'}する`}
            >
              {item.completed ? (
                <CheckCircle2
                  size={26}
                  style={{ color: item.goal.color }}
                  className="drop-shadow-sm"
                />
              ) : (
                <Circle
                  size={26}
                  className="text-slate-300 dark:text-slate-600"
                />
              )}
            </button>

            {/* 目標情報 */}
            <div className="flex-1 min-w-0">
              <p
                className={cn(
                  'text-sm font-medium text-slate-900 dark:text-slate-100 truncate',
                  item.completed && 'line-through text-slate-400 dark:text-slate-500'
                )}
              >
                {item.goal.title}
              </p>
              {item.note && (
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 truncate">
                  💬 {item.note}
                </p>
              )}
            </div>

            {/* カラーバッジ */}
            <div
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: item.goal.color }}
            />

            {/* メモボタン */}
            <button
              onClick={() => setNoteTarget(item)}
              className="flex-shrink-0 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="メモを追加"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* メモモーダル */}
      {noteTarget && (
        <NoteModal
          item={noteTarget}
          onClose={() => setNoteTarget(null)}
          onSave={handleSaveNote}
        />
      )}
    </>
  );
}
