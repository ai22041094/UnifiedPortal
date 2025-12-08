import { config } from "dotenv";
config();

import { storage } from "../server/storage";
import { hashPassword } from "../server/auth";
import { db } from "../server/db";
import { users } from "../shared/schema";
import { eq } from "drizzle-orm";

interface RoleDefinition {
  name: string;
  description: string;
  permissions: string[];
}

const predefinedRoles: RoleDefinition[] = [
  // Administration Roles
  {
    name: "System Administrator",
    description: "Full system access with all administrative privileges",
    permissions: ["*"],
  },
  {
    name: "User Manager",
    description: "Manage users and basic role assignments",
    permissions: ["admin.user-master", "admin.role-master"],
  },

  // EPM Roles
  {
    name: "EPM Administrator",
    description: "Full access to Employee Productivity Management module",
    permissions: [
      "epm.access", "epm.dashboard", "epm.dashboard.overview", "epm.dashboard.live-status",
      "epm.dashboard.productivity-insights", "epm.dashboard.ai-recommendations",
      "epm.monitoring", "epm.monitoring.real-time-activity", "epm.monitoring.process-usage-logs",
      "epm.monitoring.screen-device-state", "epm.profiles", "epm.profiles.employee-list",
      "epm.profiles.employee-detail", "epm.profiles.employee-detail.patterns",
      "epm.profiles.employee-detail.ai-observations", "epm.reports", "epm.reports.productivity",
      "epm.reports.app-usage", "epm.reports.activity-timeline", "epm.reports.sleep-wake",
      "epm.reports.custom", "epm.analytics", "epm.analytics.ai-scoring", "epm.analytics.behavioral",
      "epm.analytics.predictive", "epm.analytics.anomaly-detection", "epm.integrations",
      "epm.integrations.api-keys", "epm.integrations.api-endpoints", "epm.integrations.integration-setup",
      "epm.integrations.api-documentation", "epm.alerts", "epm.alerts.alert-rules",
      "epm.alerts.notification-history", "epm.admin-settings", "epm.admin-settings.app-categorization",
      "epm.admin-settings.system-configuration", "epm.admin-settings.device-agent",
      "epm.help", "epm.help.documentation", "epm.help.faqs",
      "epm.masters", "epm.masters.user-master", "epm.masters.role-master",
    ],
  },
  {
    name: "EPM Viewer",
    description: "Read-only access to EPM dashboards and reports",
    permissions: [
      "epm.access", "epm.dashboard", "epm.dashboard.overview", "epm.dashboard.live-status",
      "epm.dashboard.productivity-insights", "epm.profiles", "epm.profiles.employee-list",
      "epm.reports", "epm.reports.productivity", "epm.reports.app-usage", "epm.reports.activity-timeline",
      "epm.help", "epm.help.documentation", "epm.help.faqs",
    ],
  },

  // ALM Roles
  {
    name: "ALM Administrator",
    description: "Full access to Asset Lifecycle Management module",
    permissions: [
      "alm.access", "alm.dashboard", "alm.masters", "alm.masters.user-master", "alm.masters.role-master",
      "alm.lifecycle", "alm.lifecycle.planning", "alm.lifecycle.planning.needs-assessment",
      "alm.lifecycle.planning.budget-planning", "alm.lifecycle.planning.risk-analysis",
      "alm.lifecycle.planning.success-criteria", "alm.lifecycle.planning.forecasting",
      "alm.lifecycle.planning.cost-estimation", "alm.lifecycle.planning.timeline-optimization",
      "alm.lifecycle.planning.strategic-alignment", "alm.lifecycle.planning.requirements",
      "alm.lifecycle.planning.asset-request", "alm.lifecycle.acquisition",
      "alm.lifecycle.acquisition.purchase-order", "alm.lifecycle.acquisition.contracts",
      "alm.lifecycle.acquisition.approvals", "alm.lifecycle.acquisition.vendor-management",
      "alm.lifecycle.acquisition.automated-procurement", "alm.lifecycle.acquisition.inventory-tracking",
      "alm.lifecycle.acquisition.financial-tracking", "alm.lifecycle.operations",
      "alm.lifecycle.operations.asset-register", "alm.lifecycle.operations.inventory",
      "alm.lifecycle.operations.lifecycle-tracking", "alm.lifecycle.operations.depreciation",
      "alm.lifecycle.operations.deployment", "alm.lifecycle.operations.asset-assignment",
      "alm.lifecycle.operations.performance-monitoring", "alm.lifecycle.operations.strategic-reallocation",
      "alm.lifecycle.maintenance", "alm.lifecycle.maintenance.scheduled",
      "alm.lifecycle.maintenance.request", "alm.lifecycle.maintenance.history",
      "alm.lifecycle.maintenance.preventive", "alm.lifecycle.maintenance.predictive",
      "alm.lifecycle.decommissioning", "alm.lifecycle.decommissioning.asset-identification",
      "alm.lifecycle.decommissioning.secure-data-wiping", "alm.lifecycle.decommissioning.responsible-disposal",
      "alm.lifecycle.decommissioning.records-management", "alm.integration",
      "alm.integration.api-management", "alm.integration.third-party",
      "alm.integration.data-import-export", "alm.integration.webhooks",
      "alm.analytics", "alm.analytics.roi-analysis", "alm.analytics.utilization-tracking",
      "alm.analytics.predictive-analytics", "alm.analytics.cost-optimization",
      "alm.analytics.custom-reporting", "alm.settings", "alm.settings.general",
      "alm.settings.security", "alm.settings.notifications", "alm.settings.appearance",
      "alm.settings.backup", "alm.settings.localization", "alm.settings.email",
    ],
  },
  {
    name: "ALM Operator",
    description: "Operational access to ALM - manage assets and maintenance",
    permissions: [
      "alm.access", "alm.dashboard", "alm.lifecycle.operations",
      "alm.lifecycle.operations.asset-register", "alm.lifecycle.operations.inventory",
      "alm.lifecycle.operations.lifecycle-tracking", "alm.lifecycle.operations.asset-assignment",
      "alm.lifecycle.operations.performance-monitoring", "alm.lifecycle.maintenance",
      "alm.lifecycle.maintenance.scheduled", "alm.lifecycle.maintenance.request",
      "alm.lifecycle.maintenance.history", "alm.analytics", "alm.analytics.utilization-tracking",
    ],
  },

  // Service Desk Roles
  {
    name: "Service Desk Administrator",
    description: "Full access to Service Desk module",
    permissions: [
      "sd.access", "sd.dashboard", "sd.masters", "sd.masters.user-master", "sd.masters.role-master",
      "sd.incidents", "sd.incidents.create", "sd.incidents.list", "sd.incidents.my-incidents",
      "sd.incidents.critical", "sd.requests", "sd.requests.create", "sd.requests.list",
      "sd.requests.my-requests", "sd.requests.approvals", "sd.knowledge", "sd.knowledge.articles",
      "sd.knowledge.faqs", "sd.knowledge.search", "sd.sla", "sd.sla.policies",
      "sd.sla.monitoring", "sd.sla.reports", "sd.reports", "sd.reports.incidents",
      "sd.reports.performance", "sd.reports.satisfaction", "sd.settings", "sd.settings.general",
      "sd.settings.email", "sd.settings.categories", "sd.settings.priorities",
      "sd.changes", "sd.changes.create", "sd.changes.list", "sd.changes.calendar",
      "sd.changes.approvals", "sd.problems", "sd.problems.create", "sd.problems.list",
      "sd.problems.root-cause", "sd.portal", "sd.portal.submit-ticket",
      "sd.portal.my-tickets", "sd.portal.announcements",
    ],
  },
  {
    name: "Service Desk Agent",
    description: "Handle tickets and requests in Service Desk",
    permissions: [
      "sd.access", "sd.dashboard", "sd.incidents", "sd.incidents.create", "sd.incidents.list",
      "sd.incidents.my-incidents", "sd.incidents.critical", "sd.requests", "sd.requests.create",
      "sd.requests.list", "sd.requests.my-requests", "sd.knowledge", "sd.knowledge.articles",
      "sd.knowledge.faqs", "sd.knowledge.search", "sd.sla", "sd.sla.monitoring",
      "sd.changes", "sd.changes.list", "sd.problems", "sd.problems.list",
    ],
  },

  // Portal Roles
  {
    name: "Portal Administrator",
    description: "Full access to Custom Portal configuration and management",
    permissions: [
      "portal.access", "portal.dashboard", "portal.configuration",
      "portal.widgets", "portal.themes", "portal.users", "portal.analytics",
    ],
  },
  {
    name: "Portal User",
    description: "Basic access to Custom Portal features",
    permissions: ["portal.access", "portal.dashboard"],
  },
];

async function seedAdminUser() {
  const adminUsername = "admin";
  const adminPassword = "P@ssw0rd@123";

  try {
    const existingUser = await storage.getUserByUsername(adminUsername);
    
    if (existingUser) {
      if (!existingUser.isSystem) {
        await db
          .update(users)
          .set({ isSystem: true, updatedAt: new Date() })
          .where(eq(users.id, existingUser.id));
        console.log("  [UPDATE] Admin user updated to system user");
      } else {
        console.log("  [SKIP] Admin system user already exists");
      }
      return { created: false, username: adminUsername };
    }

    const hashedPassword = await hashPassword(adminPassword);
    
    await db.insert(users).values({
      username: adminUsername,
      password: hashedPassword,
      fullName: "System Administrator",
      isActive: true,
      isSystem: true,
    });

    console.log("  [CREATE] Admin system user created");
    console.log(`           Username: ${adminUsername}`);
    console.log(`           Password: ${adminPassword}`);
    return { created: true, username: adminUsername, password: adminPassword };
  } catch (error) {
    console.error("  [ERROR] Failed to create admin user:", error);
    throw error;
  }
}

async function seedRoles() {
  let created = 0;
  let skipped = 0;
  
  for (const roleData of predefinedRoles) {
    try {
      const existingRole = await storage.getRoleByName(roleData.name);
      
      if (existingRole) {
        console.log(`  [SKIP] Role "${roleData.name}" already exists`);
        skipped++;
        continue;
      }
      
      await storage.createRole({
        name: roleData.name,
        description: roleData.description,
        permissions: roleData.permissions,
        isActive: true,
      });
      
      console.log(`  [CREATE] Role "${roleData.name}"`);
      created++;
    } catch (error) {
      console.error(`  [ERROR] Failed to create role "${roleData.name}":`, error);
    }
  }
  
  return { created, skipped, total: predefinedRoles.length };
}

async function seed() {
  console.log("==========================================");
  console.log("  pcvisor Database Seeder");
  console.log("==========================================\n");

  try {
    // Step 1: Seed Admin User
    console.log("[1/2] Seeding admin user...\n");
    const adminResult = await seedAdminUser();

    // Step 2: Seed Roles
    console.log("\n[2/2] Seeding predefined roles...\n");
    const rolesResult = await seedRoles();

    // Summary
    console.log("\n==========================================");
    console.log("  Seeding Complete!");
    console.log("==========================================");
    console.log(`  Admin User: ${adminResult.username}`);
    console.log(`  Roles Created: ${rolesResult.created}`);
    console.log(`  Roles Skipped: ${rolesResult.skipped}`);
    console.log(`  Total Roles: ${rolesResult.total}`);
    console.log("==========================================\n");
    
    process.exit(0);
  } catch (error) {
    console.error("\nSeeding failed:", error);
    process.exit(1);
  }
}

seed();
