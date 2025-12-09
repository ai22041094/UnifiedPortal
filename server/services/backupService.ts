import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { storage } from "../storage";
import type { BackupSchedule } from "@shared/schema";

const execAsync = promisify(exec);

const BACKUP_DIR = path.join(process.cwd(), "backups");

if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

export interface BackupResult {
  success: boolean;
  filePath?: string;
  fileSize?: string;
  checksum?: string;
  error?: string;
}

function parseCronExpression(cronExpression: string): { next: Date; description: string } {
  const parts = cronExpression.split(" ");
  const now = new Date();
  
  if (parts.length !== 5) {
    return { next: new Date(now.getTime() + 24 * 60 * 60 * 1000), description: "Daily" };
  }

  const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;
  
  let description = "Custom schedule";
  if (minute === "0" && hour === "0" && dayOfMonth === "*" && month === "*" && dayOfWeek === "*") {
    description = "Daily at midnight";
  } else if (minute === "0" && hour === "0" && dayOfMonth === "*" && month === "*" && dayOfWeek === "0") {
    description = "Weekly on Sunday";
  } else if (minute === "0" && hour === "0" && dayOfMonth === "1" && month === "*" && dayOfWeek === "*") {
    description = "Monthly on the 1st";
  }

  const nextRun = new Date(now);
  nextRun.setSeconds(0);
  nextRun.setMilliseconds(0);

  if (minute !== "*") {
    nextRun.setMinutes(parseInt(minute, 10));
  }
  if (hour !== "*") {
    nextRun.setHours(parseInt(hour, 10));
  }

  if (nextRun <= now) {
    nextRun.setDate(nextRun.getDate() + 1);
  }

  return { next: nextRun, description };
}

export async function createBackup(userId?: string, scheduleId?: string): Promise<BackupResult> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filename = `backup_${timestamp}.sql`;
  const filePath = path.join(BACKUP_DIR, filename);

  const backupRecord = await storage.createDatabaseBackup({
    name: `Backup ${timestamp}`,
    type: scheduleId ? "scheduled" : "manual",
    status: "in_progress",
    createdByUserId: userId || null,
    scheduleId: scheduleId || null,
  });

  try {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error("DATABASE_URL not configured");
    }

    const { stdout, stderr } = await execAsync(`pg_dump "${databaseUrl}" > "${filePath}"`);
    
    if (stderr && !stderr.includes("warning")) {
      throw new Error(stderr);
    }

    const stats = fs.statSync(filePath);
    const fileSize = `${(stats.size / 1024).toFixed(2)} KB`;

    const fileBuffer = fs.readFileSync(filePath);
    const checksum = crypto.createHash("sha256").update(fileBuffer).digest("hex");

    await storage.updateDatabaseBackup(backupRecord.id, {
      status: "completed",
      filePath: filePath,
      fileSize: fileSize,
      checksum: checksum,
    });

    await storage.createAuditLog({
      userId: userId || null,
      action: "Database Backup Created",
      category: "system",
      resourceType: "backup",
      resourceId: backupRecord.id,
      resourceName: filename,
      details: `Backup created successfully. Size: ${fileSize}`,
      status: "success",
    });

    return {
      success: true,
      filePath,
      fileSize,
      checksum,
    };
  } catch (error: any) {
    const errorMessage = error.message || "Unknown error during backup";

    await storage.updateDatabaseBackup(backupRecord.id, {
      status: "failed",
      errorMessage: errorMessage,
    });

    await storage.createAuditLog({
      userId: userId || null,
      action: "Database Backup Failed",
      category: "system",
      resourceType: "backup",
      resourceId: backupRecord.id,
      details: errorMessage,
      status: "failure",
    });

    return {
      success: false,
      error: errorMessage,
    };
  }
}

export async function deleteBackupFile(filePath: string): Promise<boolean> {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error("Failed to delete backup file:", error);
    return false;
  }
}

export async function getBackupFileContent(filePath: string): Promise<Buffer | null> {
  try {
    if (fs.existsSync(filePath)) {
      return fs.readFileSync(filePath);
    }
    return null;
  } catch (error) {
    console.error("Failed to read backup file:", error);
    return null;
  }
}

export function calculateNextRun(cronExpression: string): Date {
  const { next } = parseCronExpression(cronExpression);
  return next;
}

export function getCronDescription(cronExpression: string): string {
  const { description } = parseCronExpression(cronExpression);
  return description;
}

const scheduledJobs = new Map<string, NodeJS.Timeout>();

export async function initializeScheduler(): Promise<void> {
  const activeSchedules = await storage.getActiveBackupSchedules();
  
  for (const schedule of activeSchedules) {
    scheduleBackupJob(schedule);
  }
  
  console.log(`Initialized ${activeSchedules.length} backup schedules`);
}

export function scheduleBackupJob(schedule: BackupSchedule): void {
  if (scheduledJobs.has(schedule.id)) {
    clearTimeout(scheduledJobs.get(schedule.id)!);
  }

  if (!schedule.isActive) {
    return;
  }

  const nextRun = calculateNextRun(schedule.cronExpression);
  const delay = nextRun.getTime() - Date.now();

  if (delay > 0) {
    const timeout = setTimeout(async () => {
      try {
        await createBackup(schedule.createdByUserId || undefined, schedule.id);
        
        await storage.updateBackupSchedule(schedule.id, {
          lastRunAt: new Date(),
          nextRunAt: calculateNextRun(schedule.cronExpression),
        });

        const updatedSchedule = await storage.getBackupSchedule(schedule.id);
        if (updatedSchedule && updatedSchedule.isActive) {
          scheduleBackupJob(updatedSchedule);
        }
      } catch (error) {
        console.error(`Scheduled backup failed for schedule ${schedule.id}:`, error);
      }
    }, delay);

    scheduledJobs.set(schedule.id, timeout);
  }
}

export function cancelScheduledJob(scheduleId: string): void {
  if (scheduledJobs.has(scheduleId)) {
    clearTimeout(scheduledJobs.get(scheduleId)!);
    scheduledJobs.delete(scheduleId);
  }
}

export async function cleanupOldBackups(retentionDays: number): Promise<number> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

  const backups = await storage.getAllDatabaseBackups(1000);
  let deletedCount = 0;

  for (const backup of backups) {
    if (backup.requestedAt && new Date(backup.requestedAt) < cutoffDate) {
      if (backup.filePath) {
        await deleteBackupFile(backup.filePath);
      }
      await storage.deleteDatabaseBackup(backup.id);
      deletedCount++;
    }
  }

  return deletedCount;
}
