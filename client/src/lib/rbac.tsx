import { createContext, useContext, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "./auth";

interface PermissionsResponse {
  permissions: string[];
  isAdmin: boolean;
  roleName: string | null;
}

interface RBACContextType {
  permissions: string[];
  hasPermission: (permissionId: string) => boolean;
  hasAnyPermission: (permissionIds: string[]) => boolean;
  hasAllPermissions: (permissionIds: string[]) => boolean;
  isAdmin: boolean;
  isLoading: boolean;
}

const RBACContext = createContext<RBACContextType>({
  permissions: [],
  hasPermission: () => false,
  hasAnyPermission: () => false,
  hasAllPermissions: () => false,
  isAdmin: false,
  isLoading: true,
});

export function RBACProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoading: authLoading } = useAuth();

  const { data: permissionsData, isLoading: permissionsLoading } = useQuery<PermissionsResponse>({
    queryKey: ["/api/auth/permissions"],
    enabled: !!user,
  });

  const value = useMemo(() => {
    const permissions = permissionsData?.permissions || [];
    const isAdmin = permissionsData?.isAdmin || user?.username === "admin";

    return {
      permissions,
      hasPermission: (permissionId: string) => {
        if (isAdmin) return true;
        if (permissions.includes("*")) return true;
        return permissions.includes(permissionId);
      },
      hasAnyPermission: (permissionIds: string[]) => {
        if (isAdmin) return true;
        if (permissions.includes("*")) return true;
        return permissionIds.some((id) => permissions.includes(id));
      },
      hasAllPermissions: (permissionIds: string[]) => {
        if (isAdmin) return true;
        if (permissions.includes("*")) return true;
        return permissionIds.every((id) => permissions.includes(id));
      },
      isAdmin: isAdmin || false,
      isLoading: authLoading || permissionsLoading,
    };
  }, [user, permissionsData, authLoading, permissionsLoading]);

  return <RBACContext.Provider value={value}>{children}</RBACContext.Provider>;
}

export function useRBAC() {
  return useContext(RBACContext);
}

export function usePermission(permissionId: string) {
  const { hasPermission, isLoading } = useRBAC();
  return { hasAccess: hasPermission(permissionId), isLoading };
}
