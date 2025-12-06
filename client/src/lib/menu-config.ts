import {
  LayoutDashboard,
  Users,
  Shield,
  Package,
  HeadphonesIcon,
  BarChart3,
  Settings,
  FileText,
  Boxes,
  Clock,
  Wrench,
  AlertTriangle,
  Building,
  LucideIcon,
} from "lucide-react";

export interface MenuItem {
  id: string;
  label: string;
  icon: LucideIcon;
  href: string;
  parentId?: string;
  children?: MenuItem[];
}

export interface MenuGroup {
  id: string;
  label: string;
  items: MenuItem[];
}

export const MENU_ITEMS: MenuGroup[] = [
  {
    id: "administration",
    label: "Administration",
    items: [
      {
        id: "admin.user-master",
        label: "User Master",
        icon: Users,
        href: "/admin/users",
      },
      {
        id: "admin.role-master",
        label: "Role Master",
        icon: Shield,
        href: "/admin/roles",
      },
    ],
  },
  {
    id: "custom-portal",
    label: "Custom Portal",
    items: [
      {
        id: "portal.access",
        label: "Access Custom Portal",
        icon: LayoutDashboard,
        href: "/apps/custom-portal",
      },
      {
        id: "portal.dashboard",
        label: "Dashboard",
        icon: LayoutDashboard,
        href: "/apps/custom-portal",
      },
      {
        id: "portal.projects",
        label: "Projects",
        icon: Package,
        href: "/apps/custom-portal/projects",
      },
      {
        id: "portal.requisitions",
        label: "Requisitions",
        icon: FileText,
        href: "/apps/custom-portal/requisitions",
      },
      {
        id: "portal.settings",
        label: "Settings",
        icon: Settings,
        href: "/apps/custom-portal/settings",
      },
    ],
  },
  {
    id: "alm",
    label: "Asset Lifecycle Management",
    items: [
      {
        id: "alm.access",
        label: "Access ALM",
        icon: Package,
        href: "/apps/alm",
      },
      {
        id: "alm.dashboard",
        label: "Dashboard",
        icon: LayoutDashboard,
        href: "/apps/alm",
      },
      {
        id: "alm.assets",
        label: "Asset Register",
        icon: Package,
        href: "/apps/alm/assets",
      },
      {
        id: "alm.inventory",
        label: "Inventory",
        icon: Boxes,
        href: "/apps/alm/inventory",
      },
      {
        id: "alm.lifecycle",
        label: "Lifecycle Tracking",
        icon: Clock,
        href: "/apps/alm/lifecycle",
      },
      {
        id: "alm.maintenance",
        label: "Maintenance",
        icon: Wrench,
        href: "/apps/alm/maintenance",
      },
      {
        id: "alm.depreciation",
        label: "Depreciation",
        icon: FileText,
        href: "/apps/alm/depreciation",
      },
      {
        id: "alm.planning",
        label: "Planning",
        icon: FileText,
        href: "/apps/alm/planning",
      },
      {
        id: "alm.acquisition",
        label: "Acquisition",
        icon: Package,
        href: "/apps/alm/acquisition",
      },
      {
        id: "alm.operations",
        label: "Operations",
        icon: Settings,
        href: "/apps/alm/operations",
      },
      {
        id: "alm.decommissioning",
        label: "Decommissioning",
        icon: FileText,
        href: "/apps/alm/decommissioning",
      },
      {
        id: "alm.integration",
        label: "Integration Ecosystem",
        icon: Package,
        href: "/apps/alm/integration",
      },
      {
        id: "alm.analytics",
        label: "Advanced Analytics",
        icon: BarChart3,
        href: "/apps/alm/analytics",
      },
      {
        id: "alm.settings",
        label: "Settings",
        icon: Settings,
        href: "/apps/alm/settings",
      },
    ],
  },
  {
    id: "service-desk",
    label: "Service Desk",
    items: [
      {
        id: "sd.access",
        label: "Access Service Desk",
        icon: HeadphonesIcon,
        href: "/apps/service-desk",
      },
      {
        id: "sd.dashboard",
        label: "Dashboard",
        icon: LayoutDashboard,
        href: "/apps/service-desk",
      },
      {
        id: "sd.tickets",
        label: "Tickets",
        icon: HeadphonesIcon,
        href: "/apps/service-desk/tickets",
      },
      {
        id: "sd.incidents",
        label: "Incidents",
        icon: AlertTriangle,
        href: "/apps/service-desk/incidents",
      },
      {
        id: "sd.problems",
        label: "Problems",
        icon: AlertTriangle,
        href: "/apps/service-desk/problems",
      },
      {
        id: "sd.changes",
        label: "Change Management",
        icon: FileText,
        href: "/apps/service-desk/changes",
      },
      {
        id: "sd.knowledge",
        label: "Knowledge Base",
        icon: FileText,
        href: "/apps/service-desk/knowledge",
      },
      {
        id: "sd.sla",
        label: "SLA Management",
        icon: Clock,
        href: "/apps/service-desk/sla",
      },
      {
        id: "sd.reports",
        label: "Reports",
        icon: BarChart3,
        href: "/apps/service-desk/reports",
      },
    ],
  },
  {
    id: "epm",
    label: "Enterprise Performance",
    items: [
      {
        id: "epm.access",
        label: "Access EPM",
        icon: BarChart3,
        href: "/apps/epm",
      },
      {
        id: "epm.dashboard",
        label: "Dashboard",
        icon: LayoutDashboard,
        href: "/apps/epm",
      },
      {
        id: "epm.reports",
        label: "Reports",
        icon: BarChart3,
        href: "/apps/epm/reports",
      },
      {
        id: "epm.kpi",
        label: "KPI Management",
        icon: Settings,
        href: "/apps/epm/kpi",
      },
      {
        id: "epm.goals",
        label: "Goal Setting",
        icon: FileText,
        href: "/apps/epm/goals",
      },
      {
        id: "epm.reviews",
        label: "Performance Reviews",
        icon: Users,
        href: "/apps/epm/reviews",
      },
      {
        id: "epm.analytics",
        label: "Analytics",
        icon: BarChart3,
        href: "/apps/epm/analytics",
      },
      {
        id: "epm.workforce",
        label: "Workforce Planning",
        icon: Users,
        href: "/apps/epm/workforce",
      },
    ],
  },
];

export function getAllMenuItemIds(): string[] {
  const ids: string[] = [];
  MENU_ITEMS.forEach((group) => {
    group.items.forEach((item) => {
      ids.push(item.id);
      if (item.children) {
        item.children.forEach((child) => ids.push(child.id));
      }
    });
  });
  return ids;
}

export function getMenuItemById(id: string): MenuItem | undefined {
  for (const group of MENU_ITEMS) {
    for (const item of group.items) {
      if (item.id === id) return item;
      if (item.children) {
        const child = item.children.find((c) => c.id === id);
        if (child) return child;
      }
    }
  }
  return undefined;
}

export function hasAppAccess(permissions: string[], appPrefix: string): boolean {
  if (permissions.includes("*")) return true;
  return permissions.some((p) => p.startsWith(`${appPrefix}.`));
}

export function getAppAccessPermission(appId: string): string {
  switch (appId) {
    case "custom-portal":
      return "portal.access";
    case "alm":
      return "alm.access";
    case "service-desk":
      return "sd.access";
    case "epm":
      return "epm.access";
    default:
      return "";
  }
}
