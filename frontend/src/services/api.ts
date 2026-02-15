import axios from "@utils/axios";
import { API_V1 } from "@config/api";

type PaginatedParams = { page?: number; pageSize?: number } & Record<string, string | number | boolean | undefined>;
type Meta = { current_page: number; last_page: number; per_page: number; total: number };
type ListResponse<T> = { success: boolean; data: T[]; meta?: Meta };

const list = <T>(path: string, params?: PaginatedParams) =>
  axios.get<ListResponse<T>>(`${API_V1}/${path}`, { params });
const get = <T>(path: string) => axios.get<{ success: boolean; data: T }>(`${API_V1}/${path}`);
const post = <T>(path: string, data: unknown) =>
  axios.post<{ success: boolean; data: T }>(`${API_V1}/${path}`, data);
const put = <T>(path: string, data: unknown) =>
  axios.put<{ success: boolean; data?: T }>(`${API_V1}/${path}`, data);
const del = (path: string) => axios.delete(`${API_V1}/${path}`);

function libraryApi(path: string) {
  return {
    list: (params?: { name?: string; pageSize?: number }) => list<{ id: number; name: string }>(path, params),
    get: (id: number) => get<{ id: number; name: string }>(`${path}/${id}`),
    create: (data: { name: string }) => post(`${path}`, data),
    update: (id: number, data: { name: string }) => put(`${path}/${id}`, data),
    delete: (id: number) => del(`${path}/${id}`),
  };
}

export interface DashboardStats {
  product_count: number;
  category_count: number;
  low_stock_count: number;
  purchase_order_count?: number;
  requisition_count?: number;
  inspection_count?: number;
  dispense_count?: number;
  total_stock_value?: number;
  product_per_category: { total: number; name: string }[];
  product_per_fund_cluster: { total: number; name: string }[];
}

export const dashboardApi = {
  getStats: () =>
    axios.get<{ success: boolean; data: DashboardStats }>(`${API_V1}/dashboard`),
};

export const authApi = {
  login: (email: string, password: string) =>
    axios.post<{
      success: boolean;
      data: { user: unknown; token: string; role: string | null; permission: string[] };
    }>(`${API_V1}/auth/login`, { email, password }),
  logout: () => axios.post(`${API_V1}/auth/logout`),
  user: () =>
    axios.get<{
      success: boolean;
      data: { user: unknown; role: string | null; permission: string[] };
    }>(`${API_V1}/auth/user`),
  changePassword: (
    password: string,
    new_password: string,
    new_password_confirmation: string
  ) =>
    axios.put(`${API_V1}/auth/change-password`, {
      password,
      new_password,
      new_password_confirmation,
    }),
};

export const unitsApi = libraryApi("libraries/units");
export const categoriesApi = libraryApi("libraries/categories");
export const brandsApi = libraryApi("libraries/brands");
export const suppliersApi = libraryApi("libraries/suppliers");
export const divisionsApi = libraryApi("libraries/divisions");
export const departmentsApi = libraryApi("libraries/departments");
export const genericNamesApi = libraryApi("libraries/generic-names");
export const fundClustersApi = libraryApi("libraries/fund-clusters");

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
  }) => axios.get<ListResponse<Product>>(`${API_V1}/products`, { params }),
  get: (id: number) => get<Product>(`products/${id}`),
  create: (data: ProductPayload) => post<Product>(`products`, data),
  update: (id: number, data: Partial<ProductPayload>) => put<Product>(`products/${id}`, data),
  delete: (id: number) => del(`products/${id}`),
  getStocks: (id: number) =>
    axios.get<{ success: boolean; data: Stock[] }>(`${API_V1}/products/${id}/stocks`),
};

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
    axios.get<ListResponse<Stock & { product?: Product; brand?: { id: number; name: string } | null }>>(
      `${API_V1}/requisitions/stocks/warehouse`,
      { params }
    ),
};

export interface User {
  id: number;
  name: string;
  email: string;
  role_id?: number | null;
  role_name?: string | null;
}

export const usersApi = {
  list: (params?: {
    name?: string;
    email?: string;
    role_id?: number;
    page?: number;
    pageSize?: number;
    sort?: string;
    order?: string;
  }) => axios.get<ListResponse<User>>(`${API_V1}/users`, { params }),
  get: (id: number) => get<User>(`users/${id}`),
  create: (data: { name: string; email: string; password: string; password_confirmation: string; role_id?: number | null }) =>
    post<User>(`users`, data),
  update: (id: number, data: { name?: string; email?: string; password?: string; password_confirmation?: string; role_id?: number | null }) =>
    put<User>(`users/${id}`, data),
  delete: (id: number) => del(`users/${id}`),
};

export const rolesApi = {
  list: (params?: { pageSize?: number }) =>
    axios.get<{ success: boolean; data: { id: number; name: string }[] }>(`${API_V1}/roles`, { params }),
  permissions: () =>
    axios.get<{ success: boolean; data: string[] }>(`${API_V1}/roles/permissions`),
  get: (id: number) =>
    axios.get<{ success: boolean; data: { role: { id: number; name: string }; permissions: string[] } }>(`${API_V1}/roles/${id}`),
  create: (data: { name: string; permissions?: string[] }) =>
    post<{ id: number; name: string }>(`roles`, data),
  update: (id: number, data: { name: string; permissions?: string[] }) =>
    put(`roles/${id}`, data),
  delete: (id: number) => del(`roles/${id}`),
};

export interface PurchaseOrder {
  id: number;
  po_date: string;
  po_number: string;
  remarks: string | null;
  supplier_id: number;
  supplier?: { id: number; name: string };
}

export const purchaseOrdersApi = {
  list: (params?: { po_number?: string; po_date?: string; supplier_id?: number; inspection_id?: number; page?: number; pageSize?: number }) =>
    list<PurchaseOrder>("purchase-orders", params),
  get: (id: number) => get<PurchaseOrder>(`purchase-orders/${id}`),
  create: (data: { po_date: string; po_number: string; remarks?: string; supplier_id: number }) =>
    post<PurchaseOrder>("purchase-orders", data),
  update: (id: number, data: { po_date: string; po_number: string; remarks?: string; supplier_id: number }) =>
    put<PurchaseOrder>(`purchase-orders/${id}`, data),
  delete: (id: number) => del(`purchase-orders/${id}`),
};

export interface Inspection {
  id: number;
  iar_no: string;
  for_warehouse: boolean;
  is_forward: boolean;
  remarks: string | null;
  delivery?: { id: number; supplier?: { id: number; name: string }; delivery_date: string };
  purchase_order?: PurchaseOrder | null;
}

export const inspectionsApi = {
  list: (params?: { iar_no?: string; for_warehouse?: boolean; supplier_id?: number; is_forward?: boolean; page?: number; pageSize?: number }) =>
    list<Inspection>("inspections", params),
  toForward: (params?: { iar_no?: string; supplier_id?: number; page?: number; pageSize?: number }) =>
    axios.get<ListResponse<Inspection>>(`${API_V1}/inspections/to-forward`, { params }),
  forwarded: (params?: { iar_no?: string; supplier_id?: number; page?: number; pageSize?: number }) =>
    axios.get<ListResponse<Inspection>>(`${API_V1}/inspections/forwarded`, { params }),
  search: (params?: { iar_no?: string; po_number?: string; dr_number?: string; page?: number; pageSize?: number }) =>
    list<Inspection>("inspections/search", params),
  get: (id: number) =>
    axios.get<{ success: boolean; data: { inspection: Inspection; total_amount: number } }>(`${API_V1}/inspections/${id}`),
  getByIAR: (iarNo: string) =>
    axios.get<{ success: boolean; data: { inspection: Inspection; total_amount: number } }>(`${API_V1}/inspections/iar/${encodeURIComponent(iarNo)}`),
  create: (data: { iar_no: string; supplier_id: number; delivery_date: string; invoice_date?: string; dr_number?: string; invoice_number?: string; purchase_order_id?: number; for_warehouse?: boolean; remarks?: string }) =>
    post<Inspection>("inspections", data),
  update: (id: number, data: { iar_no?: string; remarks?: string }) =>
    put(`inspections/${id}`, data),
  updateDetails: (id: number, data: { inspector_name?: string; inspector_designation?: string; inspector_department_id?: number; inspected_date?: string; acceptor_name?: string; acceptor_designation?: string; acceptor_department_id?: number; accepted_date?: string }) =>
    put(`inspections/${id}/details`, data),
  updateRemarks: (id: number, remarks: string) =>
    put(`inspections/${id}/remarks`, { remarks }),
  delete: (id: number) => del(`inspections/${id}`),
  submit: (id: number) => post(`inspections/${id}/submit`, {}),
  getDeliveryItems: (id: number, params?: { page?: number; pageSize?: number }) =>
    list<DeliveryItem>(`inspections/${id}/delivery/items`, params),
  addDeliveryItem: (inspectionId: number, data: { product_id: number; brand_id?: number; lot_no?: string; quantity: number; unit_price: number; expiry_date?: string }) =>
    post(`inspections/${inspectionId}/delivery/items`, data),
  updateDeliveryItem: (id: number, data: { quantity: number; unit_price: number }) =>
    put(`inspections/delivery/items/${id}`, data),
  deleteDeliveryItem: (id: number) => del(`inspections/delivery/items/${id}`),
};

export interface DeliveryItem {
  id: number;
  product_id: number;
  brand_id: number | null;
  lot_no: string | null;
  quantity: number;
  unit_price: number;
  expiry_date: string | null;
  product?: Product & { unit?: { id: number; name: string } };
  brand?: { id: number; name: string } | null;
}

export interface Dispense {
  id: number;
  requisition_id: number;
  dispense_code: string;
  is_dispense: boolean;
  receive_by: string | null;
  dispense_at: string | null;
  requisition?: Requisition;
}

export const dispensesApi = {
  list: (params?: { dispense_code?: string; ris_no?: string; is_dispense?: number; page?: number; pageSize?: number }) =>
    list<Dispense>("dispenses", params),
  forDispense: (params?: { search?: string; page?: number; pageSize?: number }) =>
    axios.get<ListResponse<Dispense>>(`${API_V1}/dispenses/for-dispense`, { params }),
  dispensed: (params?: { search?: string; page?: number; pageSize?: number }) =>
    axios.get<ListResponse<Dispense>>(`${API_V1}/dispenses/dispensed`, { params }),
  get: (id: number) =>
    axios.get<{ success: boolean; data: Dispense }>(`${API_V1}/dispenses/${id}`),
  getByCode: (code: string) =>
    axios.get<{ success: boolean; data: Dispense }>(`${API_V1}/dispenses/code/${encodeURIComponent(code)}`),
  getItems: (id: number, params?: { page?: number; pageSize?: number }) =>
    list<DispenseItem>(`dispenses/${id}/items`, params),
  confirm: (id: number, data: { receive_by: string; dispense_at: string }) =>
    post(`dispenses/${id}/confirm`, data),
};

export interface DispenseItem {
  id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  product?: Product & { unit?: { id: number; name: string } };
}

export const systemLogsApi = {
  list: (params?: { subject?: string; event?: string; causer?: string; code?: string; page?: number; pageSize?: number }) =>
    axios.get<ListResponse<ActivityLog>>(`${API_V1}/settings/system-logs`, { params }),
};

export interface ActivityLog {
  id: number;
  log_name: string | null;
  description: string;
  subject_type: string | null;
  subject_id: number | null;
  causer_type: string | null;
  causer_id: number | null;
  properties: Record<string, unknown>;
  created_at: string;
  causer?: { id: number; name: string } | null;
}
