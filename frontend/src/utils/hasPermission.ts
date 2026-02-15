import { useAuthStore } from "@stores/useAuthStore";

const ADMIN_ROLE = "super-admin";

/**
 * Hook that returns a function to check if the current user has the given permission.
 * Users with role "super-admin" bypass permission checks.
 */
export function useHasPermission() {
  const role = useAuthStore((s) => s.role);
  const permission = useAuthStore((s) => s.permission);

  return (permissionName: string): boolean => {
    if (role === ADMIN_ROLE) return true;
    return Array.isArray(permission) && permission.includes(permissionName);
  };
}
