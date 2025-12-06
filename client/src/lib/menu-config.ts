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
  FolderTree,
  TrendingUp,
  Target,
  Calendar,
  ClipboardList,
  BookOpen,
  Database,
  Activity,
  Briefcase,
  PieChart,
  ListChecks,
  Truck,
  DollarSign,
  Archive,
  Link,
  LineChart,
  HelpCircle,
  RefreshCw,
  FileSearch,
  CheckSquare,
  Gauge,
  UserCheck,
  UsersRound,
} from "lucide-react";

export interface MenuItem {
  id: string;
  label: string;
  icon: LucideIcon;
  href?: string;
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
        id: "portal.reports",
        label: "Reports",
        icon: BarChart3,
        children: [
          {
            id: "portal.reports.summary",
            label: "Summary Report",
            icon: PieChart,
            href: "/apps/custom-portal/reports/summary",
          },
          {
            id: "portal.reports.detailed",
            label: "Detailed Report",
            icon: FileSearch,
            href: "/apps/custom-portal/reports/detailed",
          },
          {
            id: "portal.reports.analytics",
            label: "Analytics",
            icon: LineChart,
            href: "/apps/custom-portal/reports/analytics",
          },
        ],
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
        id: "alm.planning",
        label: "Planning",
        icon: FolderTree,
        children: [
          {
            id: "alm.planning.budget",
            label: "Budget Planning",
            icon: DollarSign,
            href: "/apps/alm/planning/budget",
          },
          {
            id: "alm.planning.forecast",
            label: "Forecast",
            icon: TrendingUp,
            href: "/apps/alm/planning/forecast",
          },
          {
            id: "alm.planning.requirements",
            label: "Requirements",
            icon: ClipboardList,
            href: "/apps/alm/planning/requirements",
          },
        ],
      },
      {
        id: "alm.acquisition",
        label: "Acquisition",
        icon: Truck,
        children: [
          {
            id: "alm.acquisition.purchase",
            label: "Purchase Orders",
            icon: FileText,
            href: "/apps/alm/acquisition/purchase",
          },
          {
            id: "alm.acquisition.vendors",
            label: "Vendor Management",
            icon: Building,
            href: "/apps/alm/acquisition/vendors",
          },
          {
            id: "alm.acquisition.contracts",
            label: "Contracts",
            icon: FileText,
            href: "/apps/alm/acquisition/contracts",
          },
        ],
      },
      {
        id: "alm.operations",
        label: "Operations",
        icon: Settings,
        children: [
          {
            id: "alm.ops-asset-register",
            label: "Asset Register",
            icon: Database,
            href: "/apps/alm/operations/asset-register",
          },
          {
            id: "alm.ops-inventory",
            label: "Inventory",
            icon: Boxes,
            href: "/apps/alm/operations/inventory",
          },
          {
            id: "alm.ops-lifecycle",
            label: "Lifecycle Tracking",
            icon: RefreshCw,
            href: "/apps/alm/operations/lifecycle-tracking",
          },
          {
            id: "alm.ops-depreciation",
            label: "Depreciation",
            icon: TrendingUp,
            href: "/apps/alm/operations/depreciation",
          },
        ],
      },
      {
        id: "alm.maintenance",
        label: "Maintenance",
        icon: Wrench,
        children: [
          {
            id: "alm.maintenance.scheduled",
            label: "Scheduled Maintenance",
            icon: Calendar,
            href: "/apps/alm/maintenance/scheduled",
          },
          {
            id: "alm.maintenance.requests",
            label: "Maintenance Requests",
            icon: ClipboardList,
            href: "/apps/alm/maintenance/requests",
          },
          {
            id: "alm.maintenance.history",
            label: "Maintenance History",
            icon: Clock,
            href: "/apps/alm/maintenance/history",
          },
        ],
      },
      {
        id: "alm.decommissioning",
        label: "Decommissioning",
        icon: Archive,
        children: [
          {
            id: "alm.decommissioning.disposal",
            label: "Disposal",
            icon: Archive,
            href: "/apps/alm/decommissioning/disposal",
          },
          {
            id: "alm.decommissioning.retirement",
            label: "Retirement",
            icon: CheckSquare,
            href: "/apps/alm/decommissioning/retirement",
          },
        ],
      },
      {
        id: "alm.integration",
        label: "Integration Ecosystem",
        icon: Link,
        href: "/apps/alm/integration",
      },
      {
        id: "alm.analytics",
        label: "Advanced Analytics",
        icon: BarChart3,
        children: [
          {
            id: "alm.analytics.dashboard",
            label: "Analytics Dashboard",
            icon: Gauge,
            href: "/apps/alm/analytics/dashboard",
          },
          {
            id: "alm.analytics.reports",
            label: "Custom Reports",
            icon: FileSearch,
            href: "/apps/alm/analytics/reports",
          },
          {
            id: "alm.analytics.trends",
            label: "Trend Analysis",
            icon: LineChart,
            href: "/apps/alm/analytics/trends",
          },
        ],
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
        children: [
          {
            id: "sd.tickets.all",
            label: "All Tickets",
            icon: ListChecks,
            href: "/apps/service-desk/tickets/all",
          },
          {
            id: "sd.tickets.my",
            label: "My Tickets",
            icon: ClipboardList,
            href: "/apps/service-desk/tickets/my",
          },
          {
            id: "sd.tickets.assigned",
            label: "Assigned to Me",
            icon: UserCheck,
            href: "/apps/service-desk/tickets/assigned",
          },
        ],
      },
      {
        id: "sd.incidents",
        label: "Incidents",
        icon: AlertTriangle,
        children: [
          {
            id: "sd.incidents.active",
            label: "Active Incidents",
            icon: AlertTriangle,
            href: "/apps/service-desk/incidents/active",
          },
          {
            id: "sd.incidents.resolved",
            label: "Resolved Incidents",
            icon: CheckSquare,
            href: "/apps/service-desk/incidents/resolved",
          },
        ],
      },
      {
        id: "sd.problems",
        label: "Problems",
        icon: HelpCircle,
        href: "/apps/service-desk/problems",
      },
      {
        id: "sd.changes",
        label: "Change Management",
        icon: RefreshCw,
        children: [
          {
            id: "sd.changes.requests",
            label: "Change Requests",
            icon: FileText,
            href: "/apps/service-desk/changes/requests",
          },
          {
            id: "sd.changes.approvals",
            label: "Pending Approvals",
            icon: CheckSquare,
            href: "/apps/service-desk/changes/approvals",
          },
          {
            id: "sd.changes.calendar",
            label: "Change Calendar",
            icon: Calendar,
            href: "/apps/service-desk/changes/calendar",
          },
        ],
      },
      {
        id: "sd.knowledge",
        label: "Knowledge Base",
        icon: BookOpen,
        children: [
          {
            id: "sd.knowledge.articles",
            label: "Articles",
            icon: FileText,
            href: "/apps/service-desk/knowledge/articles",
          },
          {
            id: "sd.knowledge.faq",
            label: "FAQ",
            icon: HelpCircle,
            href: "/apps/service-desk/knowledge/faq",
          },
        ],
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
        children: [
          {
            id: "sd.reports.performance",
            label: "Performance Reports",
            icon: Gauge,
            href: "/apps/service-desk/reports/performance",
          },
          {
            id: "sd.reports.sla",
            label: "SLA Reports",
            icon: Clock,
            href: "/apps/service-desk/reports/sla",
          },
          {
            id: "sd.reports.trends",
            label: "Trend Analysis",
            icon: LineChart,
            href: "/apps/service-desk/reports/trends",
          },
        ],
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
        id: "epm.goals",
        label: "Goal Setting",
        icon: Target,
        children: [
          {
            id: "epm.goals.individual",
            label: "Individual Goals",
            icon: UserCheck,
            href: "/apps/epm/goals/individual",
          },
          {
            id: "epm.goals.team",
            label: "Team Goals",
            icon: UsersRound,
            href: "/apps/epm/goals/team",
          },
          {
            id: "epm.goals.organization",
            label: "Organization Goals",
            icon: Building,
            href: "/apps/epm/goals/organization",
          },
        ],
      },
      {
        id: "epm.reviews",
        label: "Performance Reviews",
        icon: ClipboardList,
        children: [
          {
            id: "epm.reviews.pending",
            label: "Pending Reviews",
            icon: Clock,
            href: "/apps/epm/reviews/pending",
          },
          {
            id: "epm.reviews.completed",
            label: "Completed Reviews",
            icon: CheckSquare,
            href: "/apps/epm/reviews/completed",
          },
          {
            id: "epm.reviews.history",
            label: "Review History",
            icon: Calendar,
            href: "/apps/epm/reviews/history",
          },
        ],
      },
      {
        id: "epm.kpi",
        label: "KPI Management",
        icon: Gauge,
        children: [
          {
            id: "epm.kpi.definitions",
            label: "KPI Definitions",
            icon: Settings,
            href: "/apps/epm/kpi/definitions",
          },
          {
            id: "epm.kpi.tracking",
            label: "KPI Tracking",
            icon: Activity,
            href: "/apps/epm/kpi/tracking",
          },
        ],
      },
      {
        id: "epm.analytics",
        label: "Analytics",
        icon: LineChart,
        children: [
          {
            id: "epm.analytics.dashboard",
            label: "Analytics Dashboard",
            icon: PieChart,
            href: "/apps/epm/analytics/dashboard",
          },
          {
            id: "epm.analytics.reports",
            label: "Custom Reports",
            icon: FileSearch,
            href: "/apps/epm/analytics/reports",
          },
        ],
      },
      {
        id: "epm.workforce",
        label: "Workforce Planning",
        icon: UsersRound,
        children: [
          {
            id: "epm.workforce.capacity",
            label: "Capacity Planning",
            icon: Users,
            href: "/apps/epm/workforce/capacity",
          },
          {
            id: "epm.workforce.skills",
            label: "Skills Matrix",
            icon: ListChecks,
            href: "/apps/epm/workforce/skills",
          },
          {
            id: "epm.workforce.training",
            label: "Training Plans",
            icon: BookOpen,
            href: "/apps/epm/workforce/training",
          },
        ],
      },
      {
        id: "epm.reports",
        label: "Reports",
        icon: BarChart3,
        children: [
          {
            id: "epm.reports.summary",
            label: "Summary Reports",
            icon: FileText,
            href: "/apps/epm/reports/summary",
          },
          {
            id: "epm.reports.detailed",
            label: "Detailed Reports",
            icon: FileSearch,
            href: "/apps/epm/reports/detailed",
          },
        ],
      },
    ],
  },
];

export function getAllMenuItemIds(): string[] {
  const ids: string[] = [];
  
  function collectIds(items: MenuItem[]) {
    items.forEach((item) => {
      ids.push(item.id);
      if (item.children) {
        collectIds(item.children);
      }
    });
  }
  
  MENU_ITEMS.forEach((group) => {
    collectIds(group.items);
  });
  
  return ids;
}

export function getMenuItemById(id: string): MenuItem | undefined {
  function findItem(items: MenuItem[]): MenuItem | undefined {
    for (const item of items) {
      if (item.id === id) return item;
      if (item.children) {
        const child = findItem(item.children);
        if (child) return child;
      }
    }
    return undefined;
  }
  
  for (const group of MENU_ITEMS) {
    const item = findItem(group.items);
    if (item) return item;
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

export function getPermissionLabel(permissionId: string): string {
  const item = getMenuItemById(permissionId);
  return item?.label || permissionId;
}
