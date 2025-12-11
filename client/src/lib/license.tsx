import { createContext, useContext, ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "./auth";

export type LicenseModule = "CUSTOM_PORTAL" | "ASSET_MANAGEMENT" | "SERVICE_DESK" | "EPM";

interface LicenseInfo {
  licenseKey: string | null;
  tenantId: string | null;
  modules: LicenseModule[];
  expiry: string | null;
  lastValidationStatus: string;
  validationMessage: string | null;
}

interface LicenseContextType {
  license: LicenseInfo | null;
  isLoading: boolean;
  hasModule: (module: LicenseModule) => boolean;
  isLicenseValid: boolean;
  isExpired: boolean;
}

const LicenseContext = createContext<LicenseContextType>({
  license: null,
  isLoading: true,
  hasModule: () => false,
  isLicenseValid: false,
  isExpired: false,
});

export function LicenseProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  const { data: license, isLoading } = useQuery<LicenseInfo>({
    queryKey: ["/api/license-status"],
    enabled: !!user,
  });

  const isLicenseValid = 
    license !== null && 
    license?.licenseKey !== null && 
    license?.licenseKey !== "" &&
    license?.lastValidationStatus === "OK";

  const isExpired = license?.expiry 
    ? new Date(license.expiry) < new Date() 
    : true;

  const hasModule = (module: LicenseModule): boolean => {
    if (user?.isSystem) return true;
    if (!isLicenseValid || isExpired) return false;
    return license?.modules?.includes(module) ?? false;
  };

  return (
    <LicenseContext.Provider value={{ 
      license: license ?? null, 
      isLoading, 
      hasModule, 
      isLicenseValid, 
      isExpired 
    }}>
      {children}
    </LicenseContext.Provider>
  );
}

export function useLicense() {
  return useContext(LicenseContext);
}
