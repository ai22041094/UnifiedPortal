import {
  LayoutDashboard,
  Users,
  Shield,
  Settings,
  FileText,
  Clock,
  AlertTriangle,
  LucideIcon,
  TrendingUp,
  Activity,
  PieChart,
  LineChart,
  HelpCircle,
  Gauge,
  UserCheck,
  Brain,
  Plug,
  Key,
  BellRing,
  Eye,
  Monitor,
  UserCircle,
  Calendar,
  BarChart3,
  Zap,
  FileBarChart,
  ListChecks,
  Search,
  Laptop,
  Moon,
  Sparkles,
  BookOpen,
  MessageCircleQuestion,
  Layers,
  Webhook,
  FileCode,
  Bell,
  History,
  Tags,
  Cpu,
  Radio,
  UserCog,
  ShieldCheck,
  Database,
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
    id: "epm",
    label: "Employee Productivity Management",
    items: [
      {
        id: "epm.access",
        label: "Access EPM",
        icon: Activity,
        href: "/apps/epm",
      },
      {
        id: "epm.dashboard",
        label: "Dashboard",
        icon: LayoutDashboard,
        children: [
          {
            id: "epm.dashboard.overview",
            label: "Overview Dashboard",
            icon: LayoutDashboard,
            href: "/apps/epm/dashboard/overview",
          },
          {
            id: "epm.dashboard.live-status",
            label: "Live Status",
            icon: Radio,
            href: "/apps/epm/dashboard/live-status",
          },
          {
            id: "epm.dashboard.productivity-insights",
            label: "Productivity Insights",
            icon: TrendingUp,
            href: "/apps/epm/dashboard/productivity-insights",
          },
          {
            id: "epm.dashboard.ai-recommendations",
            label: "AI Recommendations",
            icon: Sparkles,
            href: "/apps/epm/dashboard/ai-recommendations",
          },
        ],
      },
      {
        id: "epm.monitoring",
        label: "Employee Monitoring",
        icon: Eye,
        children: [
          {
            id: "epm.monitoring.real-time-activity",
            label: "Real-Time Activity",
            icon: Activity,
            href: "/apps/epm/monitoring/real-time-activity",
          },
          {
            id: "epm.monitoring.process-usage-logs",
            label: "Process Usage Logs",
            icon: ListChecks,
            href: "/apps/epm/monitoring/process-usage-logs",
          },
          {
            id: "epm.monitoring.screen-device-state",
            label: "Screen State / Device State",
            icon: Monitor,
            href: "/apps/epm/monitoring/screen-device-state",
          },
        ],
      },
      {
        id: "epm.profiles",
        label: "Employee Profiles",
        icon: UserCircle,
        children: [
          {
            id: "epm.profiles.employee-list",
            label: "Employee List",
            icon: Users,
            href: "/apps/epm/profiles/employee-list",
          },
          {
            id: "epm.profiles.employee-detail",
            label: "Employee Detail View",
            icon: UserCheck,
            children: [
              {
                id: "epm.profiles.employee-detail.patterns",
                label: "Daily / Weekly / Monthly Patterns",
                icon: Calendar,
                href: "/apps/epm/profiles/patterns",
              },
              {
                id: "epm.profiles.employee-detail.ai-observations",
                label: "AI-Generated Observations",
                icon: Brain,
                href: "/apps/epm/profiles/ai-observations",
              },
            ],
          },
        ],
      },
      {
        id: "epm.reports",
        label: "Reports",
        icon: FileText,
        children: [
          {
            id: "epm.reports.productivity",
            label: "Productivity Reports",
            icon: BarChart3,
            href: "/apps/epm/reports/productivity",
          },
          {
            id: "epm.reports.app-usage",
            label: "App Usage Reports",
            icon: Layers,
            href: "/apps/epm/reports/app-usage",
          },
          {
            id: "epm.reports.activity-timeline",
            label: "Activity Timeline Reports",
            icon: Clock,
            href: "/apps/epm/reports/activity-timeline",
          },
          {
            id: "epm.reports.sleep-wake",
            label: "Sleep/Wake Reports",
            icon: Moon,
            href: "/apps/epm/reports/sleep-wake",
          },
          {
            id: "epm.reports.custom",
            label: "Custom Reports",
            icon: FileBarChart,
            href: "/apps/epm/reports/custom",
          },
        ],
      },
      {
        id: "epm.analytics",
        label: "Advanced Analytics",
        icon: LineChart,
        children: [
          {
            id: "epm.analytics.ai-scoring",
            label: "AI Productivity Scoring",
            icon: Gauge,
            href: "/apps/epm/analytics/ai-scoring",
          },
          {
            id: "epm.analytics.behavioral",
            label: "Behavioral Analytics",
            icon: Brain,
            href: "/apps/epm/analytics/behavioral",
          },
          {
            id: "epm.analytics.predictive",
            label: "Predictive Analytics",
            icon: TrendingUp,
            href: "/apps/epm/analytics/predictive",
          },
          {
            id: "epm.analytics.anomaly-detection",
            label: "Anomaly Detection",
            icon: Search,
            href: "/apps/epm/analytics/anomaly-detection",
          },
        ],
      },
      {
        id: "epm.integrations",
        label: "Integrations & API",
        icon: Plug,
        children: [
          {
            id: "epm.integrations.api-endpoints",
            label: "API Endpoints",
            icon: Webhook,
            href: "/apps/epm/integrations/api-endpoints",
          },
          {
            id: "epm.integrations.integration-setup",
            label: "Integration Setup",
            icon: Plug,
            href: "/apps/epm/integrations/integration-setup",
          },
          {
            id: "epm.integrations.api-documentation",
            label: "API Documentation (Swagger/OpenAPI)",
            icon: FileCode,
            href: "/apps/epm/integrations/api-documentation",
          },
        ],
      },
      {
        id: "epm.alerts",
        label: "Alerts & Notifications",
        icon: Bell,
        children: [
          {
            id: "epm.alerts.alert-rules",
            label: "Alert Rules",
            icon: BellRing,
            href: "/apps/epm/alerts/alert-rules",
          },
          {
            id: "epm.alerts.notification-history",
            label: "Notification History",
            icon: History,
            href: "/apps/epm/alerts/notification-history",
          },
        ],
      },
      {
        id: "epm.admin-settings",
        label: "Admin Settings",
        icon: Settings,
        children: [
          {
            id: "epm.admin-settings.app-categorization",
            label: "App Categorization",
            icon: Tags,
            href: "/apps/epm/admin-settings/app-categorization",
          },
          {
            id: "epm.admin-settings.system-configuration",
            label: "System Configuration",
            icon: Settings,
            href: "/apps/epm/admin-settings/system-configuration",
          },
          {
            id: "epm.admin-settings.device-agent",
            label: "Device Agent Settings",
            icon: Cpu,
            href: "/apps/epm/admin-settings/device-agent",
          },
        ],
      },
      {
        id: "epm.help",
        label: "Help & Support",
        icon: HelpCircle,
        children: [
          {
            id: "epm.help.documentation",
            label: "Documentation",
            icon: BookOpen,
            href: "/apps/epm/help/documentation",
          },
          {
            id: "epm.help.faqs",
            label: "FAQs",
            icon: MessageCircleQuestion,
            href: "/apps/epm/help/faqs",
          },
        ],
      },
      {
        id: "epm.masters",
        label: "Masters",
        icon: Database,
        children: [
          {
            id: "epm.masters.user-master",
            label: "User Master",
            icon: UserCog,
            href: "/admin/users",
          },
          {
            id: "epm.masters.role-master",
            label: "Role Master",
            icon: ShieldCheck,
            href: "/admin/roles",
          },
        ],
      },
    ],
  },
];

export function hasAppAccess(permissions: string[], appId: string): boolean {
  if (!permissions || permissions.length === 0) return false;
  return permissions.some(
    (permission) =>
      permission === appId ||
      permission.startsWith(`${appId}.`) ||
      appId.startsWith(`${permission}.`)
  );
}

function findMenuItem(items: MenuItem[], id: string): MenuItem | undefined {
  for (const item of items) {
    if (item.id === id) return item;
    if (item.children) {
      const found = findMenuItem(item.children, id);
      if (found) return found;
    }
  }
  return undefined;
}

export function getPermissionLabel(permissionId: string): string {
  for (const group of MENU_ITEMS) {
    const item = findMenuItem(group.items, permissionId);
    if (item) return item.label;
  }
  return permissionId;
}
