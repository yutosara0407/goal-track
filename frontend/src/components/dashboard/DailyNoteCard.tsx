/**
 * 日次ノートカード
 * 選択中の日付に紐づく1000字以内の日記を書ける（目標ごとのメモとは別物）
 */
'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { NotebookPen } from 'lucide-react';
import toast from 'react-hot-toast';
import { notesApi } from '@/lib/api';
import { extractErrorMessage } from '@/lib/utils';
import { useLang } from '@/contexts/LangContext';

const MAX_LENGTH = 1000;

export function DailyNoteCard({ date }: { date: string }) {
  const { t } = useLang();
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ['notes', date],
    queryFn: () => notesApi.get(date),
  });

  const [body, setBody] = useState('');
  const [isDirty, setIsDirty] = useState(false);

  // 日付の切り替え・サーバーからの取得完了時に入力欄をリセットする
  useEffect(() => {
    setBody(data?.body ?? '');
    setIsDirty(false);
  }, [data?.body, date]);

  const saveMutation = useMutation({
    mutationFn: () => notesApi.save(date, body),
    onSuccess: (updated) => {
      queryClient.setQueryData(['notes', date], updated);
      setIsDirty(false);
      toast.success(t.dailyNote.saved);
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm p-4 mt-4">
      <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white mb-2.5">
        <NotebookPen size={16} className="text-indigo-500" />
        {t.dailyNote.title}
      </h3>

      <textarea
        value={body}
        onChange={(e) => {
          setBody(e.target.value);
          setIsDirty(true);
        }}
        maxLength={MAX_LENGTH}
        rows={3}
        placeholder={t.dailyNote.placeholder}
        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
      />

      <div className="flex items-center justify-between mt-2">
        <span className="text-xs text-slate-400 dark:text-slate-500 tabular-nums">
          {body.length}/{MAX_LENGTH}
        </span>
        <button
          onClick={() => saveMutation.mutate()}
          disabled={!isDirty || saveMutation.isPending}
          className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-xs font-semibold shadow-sm shadow-indigo-200/50 dark:shadow-indigo-900/30 hover:from-indigo-700 hover:to-violet-700 transition-colors disabled:opacity-40 disabled:pointer-events-none"
        >
          {t.dailyNote.save}
        </button>
      </div>
    </div>
  );
}
