import { create } from "zustand";

interface ProductFiltersState {
  page: number;
  name: string;
  description: string;
  productCode: string;
  categoryId: string | null;
  fundClusterId: string | null;
  genericNameId: string | null;
  setPage: (v: number) => void;
  setName: (v: string) => void;
  setDescription: (v: string) => void;
  setProductCode: (v: string) => void;
  setCategoryId: (v: string | null) => void;
  setFundClusterId: (v: string | null) => void;
  setGenericNameId: (v: string | null) => void;
  reset: () => void;
}

const initialState = {
  page: 1,
  name: "",
  description: "",
  productCode: "",
  categoryId: null as string | null,
  fundClusterId: null as string | null,
  genericNameId: null as string | null,
};

export const useProductFiltersStore = create<ProductFiltersState>((set) => ({
  ...initialState,
  setPage: (v) => set({ page: v }),
  setName: (v) => set({ name: v }),
  setDescription: (v) => set({ description: v }),
  setProductCode: (v) => set({ productCode: v }),
  setCategoryId: (v) => set({ categoryId: v }),
  setFundClusterId: (v) => set({ fundClusterId: v }),
  setGenericNameId: (v) => set({ genericNameId: v }),
  reset: () => set(initialState),
}));
