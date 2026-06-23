'use client';

import { useQuery } from '@tanstack/react-query';
import { emailApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth';

export function useEmailStatus() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const query = useQuery({
    queryKey: ['email-status'],
    queryFn: emailApi.status,
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5, // 5分キャッシュ
  });

  return query;
}
