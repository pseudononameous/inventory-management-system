import axios from "@utils/axios";
import { API_V1 } from "@config/api";
import type { ListResponse, PaginatedParams, SingleResponse } from "@app-types/api";

export const list = <T>(path: string, params?: PaginatedParams) =>
  axios.get<ListResponse<T>>(`${API_V1}/${path}`, { params });

export const get = <T>(path: string) =>
  axios.get<SingleResponse<T>>(`${API_V1}/${path}`);

export const post = <T>(path: string, data: unknown) =>
  axios.post<SingleResponse<T>>(`${API_V1}/${path}`, data);

export const put = <T>(path: string, data: unknown) =>
  axios.put<SingleResponse<T>>(`${API_V1}/${path}`, data);

export const del = (path: string) => axios.delete(`${API_V1}/${path}`);
