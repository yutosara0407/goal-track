'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { GOAL_COLORS } from '@/lib/utils';
import { Goal, GoalFormData } from '@/types';
import { useLang } from '@/contexts/LangContext';

const goalSchema = z.object({
  title: z
    .string()
    .min(1, 'タイトルを入力してください')
    .max(100, 'タイトルは100文字以内で入力してください'),
  description: z
    .string()
    .max(500, '説明は500文字以内で入力してください')
    .optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, '有効なカラーコードを選択してください'),
});

interface GoalFormProps {
  goal?: Goal;
  onSubmit: (data: GoalFormData) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function GoalForm({ goal, onSubmit, onCancel, isSubmitting = false }: GoalFormProps) {
  const isEditing = !!goal;
  const { t } = useLang();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<GoalFormData>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      title: goal?.title || '',
      description: goal?.description || '',
      color: goal?.color || '#6366f1',
    },
  });

  const selectedColor = watch('color');

  useEffect(() => {
    reset({
      title: goal?.title || '',
      description: goal?.description || '',
      color: goal?.color || '#6366f1',
    });
  }, [goal, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* タイトル */}
      <div>
        <label htmlFor="goal-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          {t.goals.formTitle} <span className="text-danger-500">*</span>
        </label>
        <input
          id="goal-title"
          type="text"
          placeholder={t.goals.formTitlePlaceholder}
          {...register('title')}
          className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          aria-invalid={!!errors.title}
          autoFocus
        />
        {errors.title && (
          <p className="mt-1.5 text-xs text-danger-500" role="alert">{errors.title.message}</p>
        )}
      </div>

      {/* 説明 */}
      <div>
        <label htmlFor="goal-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          {t.goals.formDesc}
        </label>
        <textarea
          id="goal-description"
          placeholder={t.goals.formDescPlaceholder}
          {...register('description')}
          rows={3}
          className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
          aria-invalid={!!errors.description}
        />
        {errors.description && (
          <p className="mt-1.5 text-xs text-danger-500" role="alert">{errors.description.message}</p>
        )}
      </div>

      {/* カラー選択 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t.goals.formColor}
        </label>
        <div className="flex flex-wrap gap-2">
          {GOAL_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => setValue('color', color, { shouldValidate: true })}
              className="w-7 h-7 rounded-full transition-all duration-150 hover:scale-110 focus:outline-none"
              style={{ backgroundColor: color }}
              aria-label={`カラー ${color} を選択`}
              aria-pressed={selectedColor === color}
            >
              {selectedColor === color && (
                <span className="flex items-center justify-center w-full h-full">
                  <svg
                    viewBox="0 0 16 16"
                    fill="none"
                    className="w-3.5 h-3.5"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M3 8l3.5 3.5L13 5"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="mt-3 flex items-center gap-2">
          <div
            className="w-5 h-5 rounded-md"
            style={{ backgroundColor: selectedColor }}
          />
          <span className="text-xs text-gray-400 font-mono">{selectedColor}</span>
        </div>
      </div>

      {/* アクションボタン */}
      <div className="flex gap-2 pt-2">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          className="flex-1"
        >
          {t.goals.cancel}
        </Button>
        <Button
          type="submit"
          className="flex-1"
          isLoading={isSubmitting}
        >
          {isEditing ? t.goals.submitEdit : t.goals.submitCreate}
        </Button>
      </div>
    </form>
  );
}
