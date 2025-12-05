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
        id: "portal.dashboard",
        label: "Dashboard",
        icon: LayoutDashboard,
        href: "/apps/custom-portal",
      },
    ],
  },
  {
    id: "alm",
    label: "Asset Lifecycle Management",
    items: [
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
    ],
  },
  {
    id: "service-desk",
    label: "Service Desk",
    items: [
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
    ],
  },
  {
    id: "epm",
    label: "Enterprise Performance",
    items: [
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
