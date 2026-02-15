import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "@stores/useAuthStore";

const ADMIN_ROLE = "super-admin";

interface RestrictedRouteProps {
  permission: string;
  children: ReactNode;
  fallbackTo?: string;
}

/**
 * Renders children only if the user has the given permission or is super-admin.
 * Otherwise redirects to fallbackTo (default: /settings/users).
 */
export default function RestrictedRoute({
  permission,
  children,
  fallbackTo = "/settings/users",
}: RestrictedRouteProps) {
  const role = useAuthStore((s) => s.role);
  const permissions = useAuthStore((s) => s.permission);

  const hasAccess =
    role === ADMIN_ROLE || (Array.isArray(permissions) && permissions.includes(permission));

  if (!hasAccess) {
    return <Navigate to={fallbackTo} replace />;
  }

  return <>{children}</>;
}
