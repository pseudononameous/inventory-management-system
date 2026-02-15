export type PaginatedParams = { page?: number; pageSize?: number } & Record<string, string | number | boolean | undefined>;

export interface Meta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface ListResponse<T> {
  success: boolean;
  data: T[];
  meta?: Meta;
}

export interface SingleResponse<T> {
  success: boolean;
  data: T;
}
