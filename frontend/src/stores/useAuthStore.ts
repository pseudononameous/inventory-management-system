import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id: number;
  name: string;
  email: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  role: string | null;
  permission: string[];
  setAuth: (data: { token: string; user: User; role?: string | null; permission?: string[] }) => void;
  setUser: (data: { user?: User; role?: string | null; permission?: string[] }) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      role: null,
      permission: [],
      setAuth: (data) =>
        set({
          token: data.token,
          user: data.user,
          role: data.role ?? null,
          permission: data.permission ?? [],
        }),
      setUser: (data) =>
        set((s) => ({
          user: data.user ?? s.user,
          role: data.role !== undefined ? data.role : s.role,
          permission: data.permission ?? s.permission,
        })),
      logout: () =>
        set({ token: null, user: null, role: null, permission: [] }),
    }),
    { name: "ims-auth" }
  )
);
