import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { productsApi, type Product } from "@api/products";
import type { Meta } from "@app-types/api";

export interface UseProductsQueryParams {
  page?: number;
  pageSize?: number;
  name?: string;
  description?: string;
  product_code?: string;
  category_id?: number;
  fund_cluster_id?: number;
  generic_name_id?: number;
  sort?: string;
  order?: string;
}

export interface UseProductsQueryResult {
  data: Product[];
  meta?: Meta;
}

export function useProductsQuery(
  params: UseProductsQueryParams = {},
  enabled = true
): UseQueryResult<UseProductsQueryResult> {
  return useQuery({
    queryKey: ["products", params],
    queryFn: async () => {
      const res = await productsApi.list({
        page: params.page,
        pageSize: params.pageSize,
        name: params.name,
        description: params.description,
        product_code: params.product_code,
        category_id: params.category_id,
        fund_cluster_id: params.fund_cluster_id,
        generic_name_id: params.generic_name_id,
        sort: params.sort,
        order: params.order,
      });
      return {
        data: (res.data.data ?? []) as Product[],
        meta: res.data.meta,
      };
    },
    enabled,
  });
}
