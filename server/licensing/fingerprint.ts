import os from "os";
import fs from "fs";
import path from "path";
import crypto from "crypto";

const LICENSE_INSTANCE_FILE = process.env.LICENSE_INSTANCE_FILE || "/var/lib/myapp/license-instance-id";
const FALLBACK_INSTANCE_FILE = path.join(process.cwd(), ".license-instance-id");

let cachedInstanceId: string | null = null;

function getInstanceId(): string {
  if (cachedInstanceId) {
    return cachedInstanceId;
  }

  const filesToTry = [LICENSE_INSTANCE_FILE, FALLBACK_INSTANCE_FILE];

  for (const filePath of filesToTry) {
    try {
      if (fs.existsSync(filePath)) {
        cachedInstanceId = fs.readFileSync(filePath, "utf-8").trim();
        return cachedInstanceId;
      }
    } catch {
    }
  }

  const instanceId = crypto.randomUUID();

  for (const filePath of filesToTry) {
    try {
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(filePath, instanceId, "utf-8");
      console.log(`[License] Created instance ID file at ${filePath}`);
      cachedInstanceId = instanceId;
      return instanceId;
    } catch (error) {
      console.warn(`[License] Could not write to ${filePath}: ${error}`);
    }
  }

  console.warn("[License] Could not persist instance ID to any location. Using in-memory fallback.");
  cachedInstanceId = instanceId;
  return instanceId;
}

function getNonInternalMacAddresses(): string[] {
  const interfaces = os.networkInterfaces();
  const macs: string[] = [];
  
  for (const [, addrs] of Object.entries(interfaces)) {
    if (!addrs) continue;
    for (const addr of addrs) {
      if (!addr.internal && addr.mac && addr.mac !== "00:00:00:00:00:00") {
        macs.push(addr.mac);
      }
    }
  }
  
  return macs.sort();
}

function getCpuModels(): string[] {
  const cpus = os.cpus();
  const uniqueModels = new Set(cpus.map(cpu => cpu.model));
  return Array.from(uniqueModels).sort();
}

export function getMachineFingerprint(): string {
  const fingerprintData = {
    platform: os.platform(),
    arch: os.arch(),
    hostname: os.hostname(),
    cpuModels: getCpuModels(),
    macAddresses: getNonInternalMacAddresses(),
    instanceId: getInstanceId(),
  };

  const jsonString = JSON.stringify(fingerprintData, Object.keys(fingerprintData).sort());
  
  return crypto.createHash("sha256").update(jsonString).digest("hex");
}

export function getMachineFingerprintDetails(): {
  fingerprint: string;
  platform: string;
  arch: string;
  hostname: string;
  instanceId: string;
} {
  const instanceId = getInstanceId();
  const fingerprint = getMachineFingerprint();
  
  return {
    fingerprint,
    platform: os.platform(),
    arch: os.arch(),
    hostname: os.hostname(),
    instanceId,
  };
}
