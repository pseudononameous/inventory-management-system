import { list, get, post, put, del } from "@api/client";

export type LibraryRecord = { id: number; name: string };

function libraryApi(path: string) {
  return {
    list: (params?: { name?: string; pageSize?: number }) => list<LibraryRecord>(path, params),
    get: (id: number) => get<LibraryRecord>(`${path}/${id}`),
    create: (data: { name: string }) => post(path, data),
    update: (id: number, data: { name: string }) => put(`${path}/${id}`, data),
    delete: (id: number) => del(`${path}/${id}`),
  };
}

export const unitsApi = libraryApi("libraries/units");
export const categoriesApi = libraryApi("libraries/categories");
export const brandsApi = libraryApi("libraries/brands");
export const suppliersApi = libraryApi("libraries/suppliers");
export const divisionsApi = libraryApi("libraries/divisions");
export const departmentsApi = libraryApi("libraries/departments");
export const genericNamesApi = libraryApi("libraries/generic-names");
export const fundClustersApi = libraryApi("libraries/fund-clusters");
