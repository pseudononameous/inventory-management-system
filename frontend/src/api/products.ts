import axios from "@utils/axios";
import { API_V1 } from "@config/api";
import { list, get, post, put, del } from "@api/client";

export interface ProductPayload {
  product_code?: string;
  generic_name_id?: number | null;
  name: string;
  description?: string | null;
  unit_id: number;
  category_id: number;
  fund_cluster_id: number;
  critical_level?: number | null;
}

export interface Product {
  id: number;
  product_code: string;
  generic_name_id: number | null;
  name: string;
  description: string | null;
  unit_id: number;
  category_id: number;
  fund_cluster_id: number;
  critical_level: string | number | null;
  available_quantity?: string | number | null;
  unit?: { id: number; name: string };
  category?: { id: number; name: string };
  fund_cluster?: { id: number; name: string };
  generic_name?: { id: number; name: string } | null;
}

export interface Stock {
  id: number;
  product_id: number;
  brand_id: number | null;
  lot_no: string | null;
  running_balance: string | number;
  unit_price: string | number | null;
  expiry_date: string | null;
  product?: Product;
  brand?: { id: number; name: string } | null;
}

export const productsApi = {
  list: (params?: {
    name?: string;
    description?: string;
    category_id?: number;
    fund_cluster_id?: number;
    generic_name_id?: number;
    product_code?: string;
    page?: number;
    pageSize?: number;
    sort?: string;
    order?: string;
  }) => list<Product>("products", params),
  get: (id: number) => get<Product>(`products/${id}`),
  create: (data: ProductPayload) => post<Product>("products", data),
  update: (id: number, data: Partial<ProductPayload>) => put<Product>(`products/${id}`, data),
  delete: (id: number) => del(`products/${id}`),
  getStocks: (id: number) =>
    axios.get<{ success: boolean; data: Stock[] }>(`${API_V1}/products/${id}/stocks`),
};
