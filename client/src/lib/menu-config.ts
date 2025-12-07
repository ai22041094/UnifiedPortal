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
  ShoppingCart,
  Bot,
  CreditCard,
  Play,
  Puzzle,
  Brain,
  Trash2,
  Search,
  Leaf,
  Plug,
  Key,
  Link2,
  Upload,
  Webhook,
  Wallet,
  FileBarChart,
  Lock,
  Palette,
  BellRing,
  HardDrive,
  Globe,
  Mail,
  Compass,
  Calculator,
  CheckCircle,
  UserCog,
  ShieldCheck,
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
        id: "alm.masters",
        label: "Masters",
        icon: Database,
        children: [
          {
            id: "alm.masters.user-master",
            label: "User Master",
            icon: UserCog,
            href: "/admin/users",
          },
          {
            id: "alm.masters.role-master",
            label: "Role Master",
            icon: ShieldCheck,
            href: "/admin/roles",
          },
        ],
      },
      {
        id: "alm.lifecycle",
        label: "ALM Lifecycle",
        icon: RefreshCw,
        children: [
          {
            id: "alm.lifecycle.planning",
            label: "Planning",
            icon: ClipboardList,
            children: [
              {
                id: "alm.lifecycle.planning.needs-assessment",
                label: "Needs Assessment",
                icon: Target,
                href: "/apps/alm/planning/needs-assessment",
              },
              {
                id: "alm.lifecycle.planning.budget-planning",
                label: "Budget Planning",
                icon: DollarSign,
                href: "/apps/alm/planning/budget-planning",
              },
              {
                id: "alm.lifecycle.planning.risk-analysis",
                label: "Risk Analysis",
                icon: AlertTriangle,
                href: "/apps/alm/planning/risk-analysis",
              },
              {
                id: "alm.lifecycle.planning.success-criteria",
                label: "Success Criteria",
                icon: CheckCircle,
                href: "/apps/alm/planning/success-criteria",
              },
              {
                id: "alm.lifecycle.planning.forecasting",
                label: "Forecasting & Scenario Planning",
                icon: TrendingUp,
                href: "/apps/alm/planning/forecasting",
              },
              {
                id: "alm.lifecycle.planning.cost-estimation",
                label: "Cost Estimation Tools",
                icon: Calculator,
                href: "/apps/alm/planning/cost-estimation",
              },
              {
                id: "alm.lifecycle.planning.timeline-optimization",
                label: "Timeline Optimization",
                icon: Clock,
                href: "/apps/alm/planning/timeline-optimization",
              },
              {
                id: "alm.lifecycle.planning.strategic-alignment",
                label: "Strategic Alignment",
                icon: Compass,
                href: "/apps/alm/planning/strategic-alignment",
              },
              {
                id: "alm.lifecycle.planning.requirements",
                label: "Requirements",
                icon: FileText,
                href: "/apps/alm/planning/requirements",
              },
              {
                id: "alm.lifecycle.planning.asset-request",
                label: "Asset Request",
                icon: FileText,
                href: "/apps/alm/planning/asset-request",
              },
            ],
          },
          {
            id: "alm.lifecycle.acquisition",
            label: "Acquisition",
            icon: ShoppingCart,
            children: [
              {
                id: "alm.lifecycle.acquisition.purchase-order",
                label: "Purchase Order",
                icon: FileText,
                href: "/apps/alm/acquisition/purchase-order",
              },
              {
                id: "alm.lifecycle.acquisition.contracts",
                label: "Contracts",
                icon: FileText,
                href: "/apps/alm/acquisition/contracts",
              },
              {
                id: "alm.lifecycle.acquisition.approvals",
                label: "Approvals",
                icon: CheckCircle,
                href: "/apps/alm/acquisition/approvals",
              },
              {
                id: "alm.lifecycle.acquisition.vendor-management",
                label: "Vendor Management",
                icon: Users,
                href: "/apps/alm/acquisition/vendor-management",
              },
              {
                id: "alm.lifecycle.acquisition.automated-procurement",
                label: "Automated Procurement",
                icon: Bot,
                href: "/apps/alm/acquisition/automated-procurement",
              },
              {
                id: "alm.lifecycle.acquisition.inventory-tracking",
                label: "Real-time Inventory Tracking",
                icon: Package,
                href: "/apps/alm/acquisition/inventory-tracking",
              },
              {
                id: "alm.lifecycle.acquisition.financial-tracking",
                label: "Financial Tracking",
                icon: CreditCard,
                href: "/apps/alm/acquisition/financial-tracking",
              },
            ],
          },
          {
            id: "alm.lifecycle.operations",
            label: "Operations",
            icon: Play,
            children: [
              {
                id: "alm.lifecycle.operations.asset-register",
                label: "Asset Register",
                icon: Package,
                href: "/apps/alm/operations/asset-register",
              },
              {
                id: "alm.lifecycle.operations.inventory",
                label: "Inventory",
                icon: Package,
                href: "/apps/alm/operations/inventory",
              },
              {
                id: "alm.lifecycle.operations.lifecycle-tracking",
                label: "Lifecycle Tracking",
                icon: RefreshCw,
                href: "/apps/alm/operations/lifecycle-tracking",
              },
              {
                id: "alm.lifecycle.operations.depreciation",
                label: "Depreciation",
                icon: FileText,
                href: "/apps/alm/operations/depreciation",
              },
              {
                id: "alm.lifecycle.operations.deployment",
                label: "Seamless Deployment & Integration",
                icon: Puzzle,
                href: "/apps/alm/operations/deployment",
              },
              {
                id: "alm.lifecycle.operations.asset-assignment",
                label: "Asset Assignment & Accountability",
                icon: Users,
                href: "/apps/alm/operations/asset-assignment",
              },
              {
                id: "alm.lifecycle.operations.performance-monitoring",
                label: "Performance Monitoring",
                icon: Activity,
                href: "/apps/alm/operations/performance-monitoring",
              },
              {
                id: "alm.lifecycle.operations.strategic-reallocation",
                label: "Strategic Reallocation",
                icon: RefreshCw,
                href: "/apps/alm/operations/strategic-reallocation",
              },
            ],
          },
          {
            id: "alm.lifecycle.maintenance",
            label: "Maintenance",
            icon: Wrench,
            children: [
              {
                id: "alm.lifecycle.maintenance.scheduled",
                label: "Scheduled Maintenance",
                icon: Calendar,
                href: "/apps/alm/maintenance/scheduled",
              },
              {
                id: "alm.lifecycle.maintenance.request",
                label: "Maintenance Request",
                icon: FileText,
                href: "/apps/alm/maintenance/request",
              },
              {
                id: "alm.lifecycle.maintenance.history",
                label: "Maintenance History",
                icon: Clock,
                href: "/apps/alm/maintenance/history",
              },
              {
                id: "alm.lifecycle.maintenance.preventive",
                label: "Preventive Maintenance",
                icon: Calendar,
                href: "/apps/alm/maintenance/preventive",
              },
              {
                id: "alm.lifecycle.maintenance.predictive",
                label: "Predictive Maintenance",
                icon: Brain,
                href: "/apps/alm/maintenance/predictive",
              },
            ],
          },
          {
            id: "alm.lifecycle.decommissioning",
            label: "Decommissioning",
            icon: Trash2,
            children: [
              {
                id: "alm.lifecycle.decommissioning.asset-identification",
                label: "Asset Identification",
                icon: Search,
                href: "/apps/alm/decommissioning/asset-identification",
              },
              {
                id: "alm.lifecycle.decommissioning.secure-data-wiping",
                label: "Secure Data Wiping",
                icon: Shield,
                href: "/apps/alm/decommissioning/secure-data-wiping",
              },
              {
                id: "alm.lifecycle.decommissioning.responsible-disposal",
                label: "Environmentally Responsible Disposal",
                icon: Leaf,
                href: "/apps/alm/decommissioning/responsible-disposal",
              },
              {
                id: "alm.lifecycle.decommissioning.records-management",
                label: "Records Management",
                icon: FileText,
                href: "/apps/alm/decommissioning/records-management",
              },
            ],
          },
        ],
      },
      {
        id: "alm.integration",
        label: "Integration Ecosystem",
        icon: Plug,
        children: [
          {
            id: "alm.integration.api-management",
            label: "API Management",
            icon: Key,
            href: "/apps/alm/integration/api-management",
          },
          {
            id: "alm.integration.third-party",
            label: "Third-party Integrations",
            icon: Link2,
            href: "/apps/alm/integration/third-party",
          },
          {
            id: "alm.integration.data-import-export",
            label: "Data Import/Export",
            icon: Upload,
            href: "/apps/alm/integration/data-import-export",
          },
          {
            id: "alm.integration.webhooks",
            label: "Webhooks",
            icon: Webhook,
            href: "/apps/alm/integration/webhooks",
          },
        ],
      },
      {
        id: "alm.analytics",
        label: "Advanced Analytics & Reporting",
        icon: BarChart3,
        children: [
          {
            id: "alm.analytics.roi-analysis",
            label: "ROI Analysis",
            icon: PieChart,
            href: "/apps/alm/analytics/roi-analysis",
          },
          {
            id: "alm.analytics.utilization-tracking",
            label: "Utilization Tracking",
            icon: Activity,
            href: "/apps/alm/analytics/utilization-tracking",
          },
          {
            id: "alm.analytics.predictive-analytics",
            label: "Predictive Analytics",
            icon: LineChart,
            href: "/apps/alm/analytics/predictive-analytics",
          },
          {
            id: "alm.analytics.cost-optimization",
            label: "Cost Optimization",
            icon: Wallet,
            href: "/apps/alm/analytics/cost-optimization",
          },
          {
            id: "alm.analytics.custom-reporting",
            label: "Custom Reporting",
            icon: FileBarChart,
            href: "/apps/alm/analytics/custom-reporting",
          },
        ],
      },
      {
        id: "alm.settings",
        label: "Settings",
        icon: Settings,
        children: [
          {
            id: "alm.settings.general",
            label: "General",
            icon: Settings,
            href: "/apps/alm/settings/general",
          },
          {
            id: "alm.settings.security",
            label: "Security",
            icon: Lock,
            href: "/apps/alm/settings/security",
          },
          {
            id: "alm.settings.notifications",
            label: "Notifications",
            icon: BellRing,
            href: "/apps/alm/settings/notifications",
          },
          {
            id: "alm.settings.appearance",
            label: "Appearance",
            icon: Palette,
            href: "/apps/alm/settings/appearance",
          },
          {
            id: "alm.settings.backup",
            label: "Backup & Recovery",
            icon: HardDrive,
            href: "/apps/alm/settings/backup",
          },
          {
            id: "alm.settings.localization",
            label: "Localization",
            icon: Globe,
            href: "/apps/alm/settings/localization",
          },
          {
            id: "alm.settings.email",
            label: "Email Configuration",
            icon: Mail,
            href: "/apps/alm/settings/email",
          },
        ],
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
