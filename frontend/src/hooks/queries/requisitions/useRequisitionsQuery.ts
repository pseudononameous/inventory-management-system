import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { requisitionsApi, type Requisition } from "@api/requisitions";

export interface UseRequisitionsQueryParams {
  pageSize?: number;
  is_for_dispense?: number;
  is_dispense?: number;
  ris_no?: string;
  department_id?: number;
  requested_by?: string;
  designation?: string;
}

export function useRequisitionsQuery(
  params: UseRequisitionsQueryParams = {},
  enabled = true
): UseQueryResult<Requisition[]> {
  return useQuery({
    queryKey: ["requisitions", params],
    queryFn: async () => {
      const res = await requisitionsApi.list(params);
      return (res.data.data ?? []) as Requisition[];
    },
    enabled,
  });
}
