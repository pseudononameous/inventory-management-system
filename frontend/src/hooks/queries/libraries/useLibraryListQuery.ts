import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import type { LibraryRecord } from "@api/libraries";

export type LibraryApi = {
  list: (params?: { name?: string; pageSize?: number }) => Promise<{ data: { data?: LibraryRecord[] } }>;
};

export function useLibraryListQuery(
  queryKey: string,
  api: LibraryApi,
  params?: { name?: string; pageSize?: number },
  enabled = true
): UseQueryResult<LibraryRecord[]> {
  return useQuery({
    queryKey: [queryKey, params],
    queryFn: async () => {
      const res = await api.list(params ?? { pageSize: 100 });
      return (res.data.data ?? []) as LibraryRecord[];
    },
    enabled,
  });
}
