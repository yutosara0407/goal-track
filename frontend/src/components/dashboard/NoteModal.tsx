'use client';

import { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { DayCompletionItem } from '@/types';

interface NoteModalProps {
  item: DayCompletionItem;
  onClose: () => void;
  onSave: (note: string) => void;
}

export function NoteModal({ item, onClose, onSave }: NoteModalProps) {
  const [note, setNote] = useState(item.note || '');

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative w-full max-w-sm card p-5 animate-slide-up shadow-xl">
        {/* ヘッダー */}
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: `${item.goal.color}20` }}
          >
            <MessageSquare size={15} style={{ color: item.goal.color }} />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-gray-400 dark:text-gray-500">メモを追加</p>
            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{item.goal.title}</p>
          </div>
        </div>

        {/* テキストエリア */}
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="今日の感想や気づきを記録..."
          className="input-base h-24 resize-none mb-1"
          maxLength={300}
          autoFocus
        />
        <p className="text-xs text-gray-400 text-right mb-4">{note.length}/300</p>

        {/* ボタン */}
        <div className="flex gap-2">
          <Button variant="secondary" onClick={onClose} className="flex-1">
            キャンセル
          </Button>
          <Button onClick={() => onSave(note)} className="flex-1">
            保存する
          </Button>
        </div>
      </div>
    </div>
  );
}
