import axios from "@utils/axios";
import { API_V1 } from "@config/api";
import { list, post, put, del } from "@api/client";
import type { Product, Stock } from "@api/products";

export interface Requisition {
  id: number;
  department_id: number;
  ris_no: string;
  with_inspection: boolean;
  is_for_dispense?: boolean;
  requested_by: string;
  designation: string;
  purpose: string | null;
  department?: { id: number; name: string };
}

export interface RequisitionItem {
  id: number;
  requisition_id: number;
  stock_id: number;
  product_id: number;
  brand_id: number | null;
  lot_no: string | null;
  quantity: string | number;
  unit_price: string | number | null;
  expiry_date: string | null;
  product?: Product & { unit?: { id: number; name: string } };
  brand?: { id: number; name: string } | null;
}

export const requisitionsApi = {
  list: (params?: {
    ris_no?: string;
    department_id?: number;
    requested_by?: string;
    designation?: string;
    search?: string;
    page?: number;
    pageSize?: number;
    sort?: string;
    order?: string;
    is_for_dispense?: number;
    is_dispense?: number;
  }) => list<Requisition>("requisitions", params),
  get: (id: number) =>
    axios.get<{
      success: boolean;
      data: { requisition: Requisition; requisition_items: RequisitionItem[] };
    }>(`${API_V1}/requisitions/${id}`),
  create: (data: {
    ris_no: string;
    department_id: number;
    requested_by: string;
    designation: string;
    purpose: string;
    with_inspection: boolean;
  }) => post<Requisition>("requisitions", data),
  update: (id: number, data: Partial<{ ris_no: string; department_id: number; requested_by: string; designation: string; purpose?: string; with_inspection: boolean }>) =>
    put(`requisitions/${id}`, data),
  delete: (id: number) => del(`requisitions/${id}`),
  getItems: (requisitionId: number, params?: { page?: number; pageSize?: number; search?: string }) =>
    list<RequisitionItem>(`requisitions/${requisitionId}/items`, params),
  addItem: (requisitionId: number, data: { stock_id: number; quantity: number }) =>
    post<RequisitionItem>(`requisitions/${requisitionId}/items`, data),
  updateItem: (requisitionItemId: number, data: { quantity?: number; unit_price?: number }) =>
    put(`requisitions/requisition-items/${requisitionItemId}`, data),
  deleteItem: (requisitionItemId: number) => del(`requisitions/requisition-items/${requisitionItemId}`),
  changeStep: (id: number) => post(`requisitions/${id}/change-step`, {}),
  markAsForDispense: (id: number) => put(`requisitions/${id}/mark-for-dispense`, {}),
  dispense: (id: number) => post<{ id: number; requisition_id: number; dispense_code: string }>(`requisitions/${id}/dispense`, {}),
  warehouseStocks: (params?: {
    search?: string;
    category_id?: number;
    fund_cluster_id?: number;
    generic_name_id?: number;
    page?: number;
    pageSize?: number;
  }) =>
    axios.get<{ success: boolean; data: (Stock & { product?: Product; brand?: { id: number; name: string } | null })[] }>(
      `${API_V1}/requisitions/stocks/warehouse`,
      { params }
    ),
};
