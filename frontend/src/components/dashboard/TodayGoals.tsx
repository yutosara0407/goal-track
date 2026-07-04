'use client';

import { useState } from 'react';
import { CheckCircle2, Circle, XCircle, ChevronRight, Target, MessageSquare } from 'lucide-react';
import { cn, todayString } from '@/lib/utils';
import { useDayCompletions, useToggleCompletion, useRemoveCompletion } from '@/hooks/useCompletions';
import { CardSkeleton } from '@/components/ui/LoadingSkeleton';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { DayCompletionItem } from '@/types';
import { useLang } from '@/contexts/LangContext';

interface NoteModalProps {
  item: DayCompletionItem;
  onClose: () => void;
  onSave: (note: string) => void;
  memoTitle: string;
  memoPlaceholder: string;
  memoSave: string;
  memoCancel: string;
}

function NoteModal({ item, onClose, onSave, memoTitle, memoPlaceholder, memoSave, memoCancel }: NoteModalProps) {
  const [note, setNote] = useState(item.note || '');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/60 dark:shadow-black/40 p-5 w-full max-w-sm animate-slide-up">
        <h3 className="font-semibold text-slate-900 dark:text-white mb-3">
          {memoTitle}
        </h3>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder={memoPlaceholder}
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
            {memoCancel}
          </button>
          <button
            onClick={() => onSave(note)}
            className="flex-1 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm font-medium hover:from-indigo-700 hover:to-violet-700 transition-colors"
          >
            {memoSave}
          </button>
        </div>
      </div>
    </div>
  );
}

export function TodayGoals({ date }: { date?: string }) {
  // 表示・記録対象の日付（省略時は今日）。過去日の記録付けにも使う
  const targetDate = date || todayString();
  const { data, isLoading, error } = useDayCompletions(targetDate);
  const toggleMutation = useToggleCompletion();
  const removeMutation = useRemoveCompletion();
  const [noteTarget, setNoteTarget] = useState<DayCompletionItem | null>(null);
  const { t } = useLang();

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
        <p>{t.completion.fetchError}</p>
      </div>
    );
  }

  if (!data || data.items.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm p-8 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 mb-4">
          <Target size={26} className="text-indigo-500" />
        </div>
        <p className="text-slate-600 dark:text-slate-400 font-medium">{t.completion.noGoals}</p>
        <p className="text-sm text-slate-400 mt-1">
          <a href="/goals" className="text-indigo-600 hover:underline">{t.completion.noGoalsLinkText}</a>
          {t.completion.noGoalsDesc}
        </p>
      </div>
    );
  }

  const handleClick = (item: DayCompletionItem) => {
    if (item.completion_id === null) {
      // 未記録 → 達成
      toggleMutation.mutate({ goal_id: item.goal.id, date: targetDate, completed: true });
    } else if (item.completed) {
      // 達成 → 未達成
      toggleMutation.mutate({ goal_id: item.goal.id, date: targetDate, completed: false });
    } else {
      // 未達成 → 未記録（削除）
      removeMutation.mutate({ id: item.completion_id!, goal_id: item.goal.id, date: targetDate });
    }
  };

  const handleSaveNote = (note: string) => {
    if (!noteTarget) return;
    toggleMutation.mutate({
      goal_id: noteTarget.goal.id,
      date: targetDate,
      completed: noteTarget.completed,
      note,
    });
    setNoteTarget(null);
  };

  const isPending = toggleMutation.isPending || removeMutation.isPending;

  return (
    <>
      {/* 全体達成率サマリー */}
      <div className="bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-900/20 dark:to-violet-900/20 rounded-3xl p-4 border border-indigo-100 dark:border-indigo-800/30 mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {t.dashboard.todayProgress}
          </span>
          <span className="text-sm font-bold text-slate-900 dark:text-white">
            {t.dashboard.completedOf(
              data.items.filter((i) => i.completed).length,
              data.items.length
            )}
          </span>
        </div>
        <ProgressBar value={data.completion_rate} size="md" showLabel />
      </div>

      {/* 目標チェックリスト */}
      <div className="space-y-2">
        {data.items.map((item) => {
          const isTracked = item.completion_id !== null;
          const isDone = isTracked && item.completed;
          const isFailed = isTracked && !item.completed;

          return (
            <div
              key={item.goal.id}
              className={cn(
                'bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4 transition-all duration-200',
                isDone && 'opacity-70'
              )}
            >
              {/* チェックボタン（3状態サイクル） */}
              <button
                onClick={() => handleClick(item)}
                disabled={isPending}
                className="flex-shrink-0 transition-all duration-200 hover:scale-110 active:scale-95 focus:outline-none"
                aria-label={
                  item.completion_id === null
                    ? t.completion.markDone
                    : item.completed
                    ? t.completion.markFailed
                    : t.completion.unmark
                }
              >
                {isDone ? (
                  <CheckCircle2
                    size={26}
                    style={{ color: item.goal.color }}
                    className="drop-shadow-sm"
                  />
                ) : isFailed ? (
                  <XCircle
                    size={26}
                    className="text-red-400 dark:text-red-500 drop-shadow-sm"
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
                    isDone && 'line-through text-slate-400 dark:text-slate-500'
                  )}
                >
                  {item.goal.title}
                </p>
                {item.note && (
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 truncate">
                    <MessageSquare size={11} className="inline shrink-0 -mt-0.5 mr-1" />{item.note}
                  </p>
                )}
              </div>

              {/* ステータスバッジ */}
              {isTracked && (
                <span
                  className={cn(
                    'text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0',
                    isDone
                      ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'
                      : 'bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400'
                  )}
                >
                  {isDone ? t.completion.done : t.completion.failed}
                </span>
              )}

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
          );
        })}
      </div>

      {/* メモモーダル */}
      {noteTarget && (
        <NoteModal
          item={noteTarget}
          onClose={() => setNoteTarget(null)}
          onSave={handleSaveNote}
          memoTitle={t.completion.memoTitle(noteTarget.goal.title)}
          memoPlaceholder={t.completion.memoPlaceholder}
          memoSave={t.completion.memoSave}
          memoCancel={t.completion.memoCancel}
        />
      )}
    </>
  );
}
