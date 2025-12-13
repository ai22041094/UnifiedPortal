import { storage } from "../storage";
import { getMachineFingerprint } from "./fingerprint";
import type { LicensePayload, LocalLicenseStatus, LicenseInfo } from "@shared/schema";
import crypto from "crypto";

const LICENSE_SECRET = process.env.LICENSE_SECRET || "default-license-secret-change-in-production";

export function verifyLicenseToken(token: string): LicensePayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 2) {
      return null;
    }

    const [payloadBase64, signatureBase64] = parts;
    
    const expectedSignature = crypto
      .createHmac("sha256", LICENSE_SECRET)
      .update(payloadBase64)
      .digest("base64url");

    if (signatureBase64 !== expectedSignature) {
      return null;
    }

    const payloadJson = Buffer.from(payloadBase64, "base64url").toString("utf-8");
    const payload = JSON.parse(payloadJson) as LicensePayload;

    return payload;
  } catch (error) {
    console.error("[License] Failed to verify token:", error);
    return null;
  }
}

export async function validateLocalLicense(): Promise<LocalLicenseStatus> {
  try {
    const licenseInfo = await storage.getLicenseInfo();
    
    if (!licenseInfo || !licenseInfo.licenseToken) {
      return { ok: false, reason: "NO_LICENSE" };
    }

    // Check if the license status is OK (activated successfully via server)
    if (licenseInfo.lastValidationStatus === "OK") {
      // Validate expiry
      if (licenseInfo.expiry && new Date(licenseInfo.expiry) < new Date()) {
        return { ok: false, reason: "EXPIRED" };
      }

      // Validate hardware ID match
      const currentFingerprint = getMachineFingerprint();
      if (licenseInfo.hardwareId && licenseInfo.hardwareId !== currentFingerprint) {
        return { ok: false, reason: "HARDWARE_MISMATCH" };
      }

      // Build payload from stored license info
      const payload: LicensePayload = {
        tenantId: licenseInfo.tenantId || "",
        modules: (licenseInfo.modules as string[]) || [],
        expiry: licenseInfo.expiry?.toISOString() || "",
        hardwareId: licenseInfo.hardwareId || currentFingerprint,
      };

      return { ok: true, payload };
    }

    // Try to verify using signed token (legacy approach)
    const payload = verifyLicenseToken(licenseInfo.licenseToken);
    
    if (!payload) {
      return { ok: false, reason: "INVALID" };
    }

    const expiryDate = new Date(payload.expiry);
    if (expiryDate < new Date()) {
      return { ok: false, reason: "EXPIRED" };
    }

    const currentFingerprint = getMachineFingerprint();
    if (payload.hardwareId !== currentFingerprint) {
      return { ok: false, reason: "HARDWARE_MISMATCH" };
    }

    return { ok: true, payload };
  } catch (error) {
    console.error("[License] Local validation error:", error);
    return { ok: false, reason: "INVALID" };
  }
}

export function getLocalLicenseStatusMessage(reason: "NO_LICENSE" | "INVALID" | "EXPIRED" | "HARDWARE_MISMATCH"): string {
  const messages: Record<string, string> = {
    NO_LICENSE: "License missing or invalid. Contact administrator.",
    INVALID: "License is invalid. Contact administrator.",
    EXPIRED: "License has expired. Contact administrator.",
    HARDWARE_MISMATCH: "License is bound to a different machine.",
  };
  
  return messages[reason] || "License error. Contact administrator.";
}

export async function getLicenseInfoWithLocalValidation(): Promise<{
  license: LicenseInfo | null;
  localStatus: LocalLicenseStatus;
}> {
  const license = await storage.getLicenseInfo() || null;
  const localStatus = await validateLocalLicense();
  
  return { license, localStatus };
}
