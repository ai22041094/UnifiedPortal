import { storage } from "./storage";
import type { LicenseInfo, LicenseModule, LicenseServerResponse, LicenseActivationResponse, SafeUser } from "@shared/schema";
import { LICENSE_MODULES, licenseServerResponseSchema, licenseActivationResponseSchema } from "@shared/schema";
import type { Request, Response, NextFunction } from "express";
import { getMachineFingerprint } from "./licensing/fingerprint";
import { validateLocalLicense, getLocalLicenseStatusMessage } from "./licensing/licenseValidator";

const LICENSE_SERVER_URL = process.env.LICENSE_SERVER_URL || "";

export async function getCurrentLicense(): Promise<LicenseInfo | null> {
  const license = await storage.getLicenseInfo();
  return license || null;
}

export function isLicensePresent(license: LicenseInfo | null): boolean {
  return license !== null && 
         license.licenseToken !== null && 
         license.licenseToken !== "" &&
         license.lastValidationStatus === "OK";
}

export function isLicenseExpired(license: LicenseInfo | null): boolean {
  if (!license || !license.expiry) {
    return true;
  }
  return new Date(license.expiry) < new Date();
}

export function hasModule(license: LicenseInfo | null, moduleKey: LicenseModule): boolean {
  if (!license || !license.modules) {
    return false;
  }
  return (license.modules as LicenseModule[]).includes(moduleKey);
}

export function isMasterAdmin(user: SafeUser | undefined): boolean {
  return user?.isSystem === true;
}

export async function activateLicenseWithServer(licenseKey: string): Promise<{
  success: boolean;
  data?: LicenseActivationResponse;
  error?: string;
}> {
  if (!LICENSE_SERVER_URL) {
    return { 
      success: false, 
      error: "License server URL not configured" 
    };
  }

  try {
    const hardwareId = getMachineFingerprint();
    
    const response = await fetch(`${LICENSE_SERVER_URL}/api/licenses/activate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ licenseKey, hardwareId }),
    });

    if (!response.ok) {
      return { 
        success: false, 
        error: `License server returned status ${response.status}` 
      };
    }

    const rawData = await response.json();
    console.log("[License] Raw activation response from server:", JSON.stringify(rawData, null, 2));
    const parsed = licenseActivationResponseSchema.safeParse(rawData);
    
    if (!parsed.success) {
      console.log("[License] Schema validation failed:", JSON.stringify(parsed.error.errors, null, 2));
      return { 
        success: false, 
        error: "Invalid response from license server" 
      };
    }

    return { success: true, data: parsed.data };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to contact license server" 
    };
  }
}

export async function validateLicenseWithServer(licenseKey: string): Promise<{
  success: boolean;
  data?: LicenseServerResponse;
  error?: string;
}> {
  if (!LICENSE_SERVER_URL) {
    return { 
      success: false, 
      error: "License server URL not configured" 
    };
  }

  try {
    const response = await fetch(`${LICENSE_SERVER_URL}/api/licenses/validate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ licenseKey }),
    });

    if (!response.ok) {
      return { 
        success: false, 
        error: `License server returned status ${response.status}` 
      };
    }

    const rawData = await response.json();
    const parsed = licenseServerResponseSchema.safeParse(rawData);
    
    if (!parsed.success) {
      return { 
        success: false, 
        error: "Invalid response from license server" 
      };
    }

    return { success: true, data: parsed.data };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to contact license server" 
    };
  }
}

export async function saveLicenseFromActivation(
  licenseKey: string,
  activationResponse: LicenseActivationResponse
): Promise<LicenseInfo> {
  if (activationResponse.activated && activationResponse.payload) {
    const validModules = activationResponse.payload.modules.filter(
      (m): m is LicenseModule => LICENSE_MODULES.includes(m as LicenseModule)
    );

    const hardwareId = activationResponse.payload.hardwareId || getMachineFingerprint();

    return await storage.updateLicenseInfo({
      licenseKey,
      licenseToken: activationResponse.token || licenseKey,
      tenantId: activationResponse.payload.tenantId,
      hardwareId: hardwareId,
      modules: validModules,
      expiry: new Date(activationResponse.payload.expiry),
      lastValidationStatus: "OK",
      validationMessage: "License activated and bound to this machine",
    });
  } else {
    const existingLicense = await getCurrentLicense();
    
    if (existingLicense && existingLicense.lastValidationStatus === "OK") {
      return existingLicense;
    }

    return await storage.updateLicenseInfo({
      licenseKey: null,
      licenseToken: null,
      tenantId: null,
      hardwareId: null,
      modules: [],
      expiry: null,
      lastValidationStatus: "INVALID",
      validationMessage: `License activation failed: ${activationResponse.reason || "Unknown error"}`,
    });
  }
}

export async function saveLicenseFromValidation(
  licenseKey: string,
  serverResponse: LicenseServerResponse
): Promise<LicenseInfo> {
  if (serverResponse.valid && serverResponse.reason === "OK" && serverResponse.payload) {
    const validModules = serverResponse.payload.modules.filter(
      (m): m is LicenseModule => LICENSE_MODULES.includes(m as LicenseModule)
    );

    return await storage.updateLicenseInfo({
      licenseKey,
      tenantId: serverResponse.payload.tenantId,
      modules: validModules,
      expiry: new Date(serverResponse.payload.expiry),
      lastValidationStatus: "OK",
      validationMessage: "License validated successfully",
    });
  } else {
    const statusMap: Record<string, "EXPIRED" | "INVALID" | "NONE"> = {
      "EXPIRED": "EXPIRED",
      "INVALID_SIGNATURE": "INVALID",
      "MALFORMED": "INVALID",
      "NOT_FOUND": "INVALID",
    };

    const status = statusMap[serverResponse.reason] || "INVALID";
    
    const existingLicense = await getCurrentLicense();
    
    if (existingLicense && existingLicense.lastValidationStatus === "OK") {
      return existingLicense;
    }

    return await storage.updateLicenseInfo({
      licenseKey: null,
      tenantId: null,
      modules: [],
      expiry: null,
      lastValidationStatus: status,
      validationMessage: `License validation failed: ${serverResponse.reason}`,
    });
  }
}

export function requireModuleAccess(moduleKey: LicenseModule) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as SafeUser | undefined;
    
    if (isMasterAdmin(user)) {
      return next();
    }

    const localStatus = await validateLocalLicense();

    if (!localStatus.ok) {
      return res.status(403).json({ 
        message: getLocalLicenseStatusMessage(localStatus.reason)
      });
    }

    if (!localStatus.payload.modules.includes(moduleKey)) {
      return res.status(403).json({ 
        message: `Module "${moduleKey}" is not licensed. Contact administrator.` 
      });
    }

    next();
  };
}

export function requireMasterAdmin(req: Request, res: Response, next: NextFunction) {
  const user = req.user as SafeUser | undefined;
  
  if (!user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  if (!isMasterAdmin(user)) {
    return res.status(403).json({ message: "Access denied. Master admin required." });
  }
  
  next();
}

export async function checkLicenseForLogin(user: SafeUser): Promise<{
  allowed: boolean;
  message?: string;
}> {
  if (isMasterAdmin(user)) {
    return { allowed: true };
  }

  const localStatus = await validateLocalLicense();

  if (!localStatus.ok) {
    return { 
      allowed: false, 
      message: getLocalLicenseStatusMessage(localStatus.reason)
    };
  }

  return { allowed: true };
}

export function getAvailableModules(user: SafeUser, license: LicenseInfo | null): LicenseModule[] {
  if (isMasterAdmin(user)) {
    return [...LICENSE_MODULES];
  }

  if (!isLicensePresent(license) || isLicenseExpired(license)) {
    return [];
  }

  return (license?.modules as LicenseModule[]) || [];
}

export { getMachineFingerprint };
