import { useQuery } from '@tanstack/react-query';
import { javaApi } from '@/integrations/java-api/client';
import type { AppRole } from '@/types/database';

export function useUserRole(userId: string | undefined) {
  return useQuery({
    queryKey: ['user-role', userId],
    queryFn: async () => {
      if (!userId) return null;
      const response = await javaApi.select('user_roles', {
        eq: { user_id: userId }
      });
      if (!response.success || !response.data) return null;
      const data = (response.data as any[])[0];
      return data?.role as AppRole | null;
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });
}
