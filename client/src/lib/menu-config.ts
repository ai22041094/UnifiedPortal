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
  Package,
  RefreshCw,
  ClipboardList,
  Target,
  DollarSign,
  CheckCircle,
  Calculator,
  Compass,
  ShoppingCart,
  Bot,
  CreditCard,
  Play,
  Puzzle,
  Wrench,
  Trash2,
  Leaf,
  Link2,
  Upload,
  Wallet,
  Lock,
  Palette,
  HardDrive,
  Globe,
  Mail,
  Ticket,
  MessagesSquare,
  FolderKanban,
  Workflow,
  ClipboardCheck,
  Timer,
  Building2,
  PlusCircle,
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
            id: "epm.integrations.api-keys",
            label: "API Keys",
            icon: Key,
            href: "/apps/epm/integrations/api-keys",
          },
          {
            id: "epm.integrations.api-endpoints",
            label: "Ingested Data",
            icon: Database,
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
            label: "API Documentation",
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
              { id: "alm.lifecycle.planning.needs-assessment", label: "Needs Assessment", icon: Target, href: "/apps/alm/planning/needs-assessment" },
              { id: "alm.lifecycle.planning.budget-planning", label: "Budget Planning", icon: DollarSign, href: "/apps/alm/planning/budget-planning" },
              { id: "alm.lifecycle.planning.risk-analysis", label: "Risk Analysis", icon: AlertTriangle, href: "/apps/alm/planning/risk-analysis" },
              { id: "alm.lifecycle.planning.success-criteria", label: "Success Criteria", icon: CheckCircle, href: "/apps/alm/planning/success-criteria" },
              { id: "alm.lifecycle.planning.forecasting", label: "Forecasting & Scenario Planning", icon: TrendingUp, href: "/apps/alm/planning/forecasting" },
              { id: "alm.lifecycle.planning.cost-estimation", label: "Cost Estimation Tools", icon: Calculator, href: "/apps/alm/planning/cost-estimation" },
              { id: "alm.lifecycle.planning.timeline-optimization", label: "Timeline Optimization", icon: Clock, href: "/apps/alm/planning/timeline-optimization" },
              { id: "alm.lifecycle.planning.strategic-alignment", label: "Strategic Alignment", icon: Compass, href: "/apps/alm/planning/strategic-alignment" },
              { id: "alm.lifecycle.planning.requirements", label: "Requirements", icon: FileText, href: "/apps/alm/planning/requirements" },
              { id: "alm.lifecycle.planning.asset-request", label: "Asset Request", icon: FileText, href: "/apps/alm/planning/asset-request" },
            ],
          },
          {
            id: "alm.lifecycle.acquisition",
            label: "Acquisition",
            icon: ShoppingCart,
            children: [
              { id: "alm.lifecycle.acquisition.purchase-order", label: "Purchase Order", icon: FileText, href: "/apps/alm/acquisition/purchase-order" },
              { id: "alm.lifecycle.acquisition.contracts", label: "Contracts", icon: FileText, href: "/apps/alm/acquisition/contracts" },
              { id: "alm.lifecycle.acquisition.approvals", label: "Approvals", icon: CheckCircle, href: "/apps/alm/acquisition/approvals" },
              { id: "alm.lifecycle.acquisition.vendor-management", label: "Vendor Management", icon: Users, href: "/apps/alm/acquisition/vendor-management" },
              { id: "alm.lifecycle.acquisition.automated-procurement", label: "Automated Procurement", icon: Bot, href: "/apps/alm/acquisition/automated-procurement" },
              { id: "alm.lifecycle.acquisition.inventory-tracking", label: "Real-time Inventory Tracking", icon: Package, href: "/apps/alm/acquisition/inventory-tracking" },
              { id: "alm.lifecycle.acquisition.financial-tracking", label: "Financial Tracking", icon: CreditCard, href: "/apps/alm/acquisition/financial-tracking" },
            ],
          },
          {
            id: "alm.lifecycle.operations",
            label: "Operations",
            icon: Play,
            children: [
              { id: "alm.lifecycle.operations.asset-register", label: "Asset Register", icon: Package, href: "/apps/alm/operations/asset-register" },
              { id: "alm.lifecycle.operations.inventory", label: "Inventory", icon: Package, href: "/apps/alm/operations/inventory" },
              { id: "alm.lifecycle.operations.lifecycle-tracking", label: "Lifecycle Tracking", icon: RefreshCw, href: "/apps/alm/operations/lifecycle-tracking" },
              { id: "alm.lifecycle.operations.depreciation", label: "Depreciation", icon: FileText, href: "/apps/alm/operations/depreciation" },
              { id: "alm.lifecycle.operations.deployment", label: "Seamless Deployment & Integration", icon: Puzzle, href: "/apps/alm/operations/deployment" },
              { id: "alm.lifecycle.operations.asset-assignment", label: "Asset Assignment & Accountability", icon: Users, href: "/apps/alm/operations/asset-assignment" },
              { id: "alm.lifecycle.operations.performance-monitoring", label: "Performance Monitoring", icon: Activity, href: "/apps/alm/operations/performance-monitoring" },
              { id: "alm.lifecycle.operations.strategic-reallocation", label: "Strategic Reallocation", icon: RefreshCw, href: "/apps/alm/operations/strategic-reallocation" },
            ],
          },
          {
            id: "alm.lifecycle.maintenance",
            label: "Maintenance",
            icon: Wrench,
            children: [
              { id: "alm.lifecycle.maintenance.scheduled", label: "Scheduled Maintenance", icon: Calendar, href: "/apps/alm/maintenance/scheduled" },
              { id: "alm.lifecycle.maintenance.request", label: "Maintenance Request", icon: FileText, href: "/apps/alm/maintenance/request" },
              { id: "alm.lifecycle.maintenance.history", label: "Maintenance History", icon: Clock, href: "/apps/alm/maintenance/history" },
              { id: "alm.lifecycle.maintenance.preventive", label: "Preventive Maintenance", icon: Calendar, href: "/apps/alm/maintenance/preventive" },
              { id: "alm.lifecycle.maintenance.predictive", label: "Predictive Maintenance", icon: Brain, href: "/apps/alm/maintenance/predictive" },
            ],
          },
          {
            id: "alm.lifecycle.decommissioning",
            label: "Decommissioning",
            icon: Trash2,
            children: [
              { id: "alm.lifecycle.decommissioning.asset-identification", label: "Asset Identification", icon: Search, href: "/apps/alm/decommissioning/asset-identification" },
              { id: "alm.lifecycle.decommissioning.secure-data-wiping", label: "Secure Data Wiping", icon: Shield, href: "/apps/alm/decommissioning/secure-data-wiping" },
              { id: "alm.lifecycle.decommissioning.responsible-disposal", label: "Environmentally Responsible Disposal", icon: Leaf, href: "/apps/alm/decommissioning/responsible-disposal" },
              { id: "alm.lifecycle.decommissioning.records-management", label: "Records Management", icon: FileText, href: "/apps/alm/decommissioning/records-management" },
            ],
          },
        ],
      },
      {
        id: "alm.integration",
        label: "Integration Ecosystem",
        icon: Plug,
        children: [
          { id: "alm.integration.api-management", label: "API Management", icon: Key, href: "/apps/alm/integration/api-management" },
          { id: "alm.integration.third-party", label: "Third-party Integrations", icon: Link2, href: "/apps/alm/integration/third-party" },
          { id: "alm.integration.data-import-export", label: "Data Import/Export", icon: Upload, href: "/apps/alm/integration/data-import-export" },
          { id: "alm.integration.webhooks", label: "Webhooks", icon: Webhook, href: "/apps/alm/integration/webhooks" },
        ],
      },
      {
        id: "alm.analytics",
        label: "Advanced Analytics & Reporting",
        icon: BarChart3,
        children: [
          { id: "alm.analytics.roi-analysis", label: "ROI Analysis", icon: PieChart, href: "/apps/alm/analytics/roi-analysis" },
          { id: "alm.analytics.utilization-tracking", label: "Utilization Tracking", icon: Activity, href: "/apps/alm/analytics/utilization-tracking" },
          { id: "alm.analytics.predictive-analytics", label: "Predictive Analytics", icon: LineChart, href: "/apps/alm/analytics/predictive-analytics" },
          { id: "alm.analytics.cost-optimization", label: "Cost Optimization", icon: Wallet, href: "/apps/alm/analytics/cost-optimization" },
          { id: "alm.analytics.custom-reporting", label: "Custom Reporting", icon: FileBarChart, href: "/apps/alm/analytics/custom-reporting" },
        ],
      },
      {
        id: "alm.settings",
        label: "Settings",
        icon: Settings,
        children: [
          { id: "alm.settings.general", label: "General", icon: Settings, href: "/apps/alm/settings/general" },
          { id: "alm.settings.security", label: "Security", icon: Lock, href: "/apps/alm/settings/security" },
          { id: "alm.settings.notifications", label: "Notifications", icon: BellRing, href: "/apps/alm/settings/notifications" },
          { id: "alm.settings.appearance", label: "Appearance", icon: Palette, href: "/apps/alm/settings/appearance" },
          { id: "alm.settings.backup", label: "Backup & Recovery", icon: HardDrive, href: "/apps/alm/settings/backup" },
          { id: "alm.settings.localization", label: "Localization", icon: Globe, href: "/apps/alm/settings/localization" },
          { id: "alm.settings.email", label: "Email Configuration", icon: Mail, href: "/apps/alm/settings/email" },
        ],
      },
    ],
  },
  {
    id: "sd",
    label: "Service Desk",
    items: [
      {
        id: "sd.access",
        label: "Access Service Desk",
        icon: Ticket,
        href: "/apps/service-desk",
      },
      {
        id: "sd.dashboard",
        label: "Dashboard",
        icon: LayoutDashboard,
        href: "/apps/service-desk",
      },
      {
        id: "sd.masters",
        label: "Masters",
        icon: Database,
        children: [
          {
            id: "sd.masters.user-master",
            label: "User Master",
            icon: UserCog,
            href: "/admin/users",
          },
          {
            id: "sd.masters.role-master",
            label: "Role Master",
            icon: ShieldCheck,
            href: "/admin/roles",
          },
        ],
      },
      {
        id: "sd.incidents",
        label: "Incident Management",
        icon: AlertTriangle,
        children: [
          { id: "sd.incidents.create", label: "Create Incident", icon: PlusCircle, href: "/apps/service-desk/incidents/create" },
          { id: "sd.incidents.list", label: "All Incidents", icon: ListChecks, href: "/apps/service-desk/incidents/list" },
          { id: "sd.incidents.my-incidents", label: "My Incidents", icon: UserCircle, href: "/apps/service-desk/incidents/my-incidents" },
          { id: "sd.incidents.critical", label: "Critical Incidents", icon: AlertTriangle, href: "/apps/service-desk/incidents/critical" },
        ],
      },
      {
        id: "sd.requests",
        label: "Service Requests",
        icon: ClipboardCheck,
        children: [
          { id: "sd.requests.create", label: "New Request", icon: PlusCircle, href: "/apps/service-desk/requests/create" },
          { id: "sd.requests.list", label: "All Requests", icon: ListChecks, href: "/apps/service-desk/requests/list" },
          { id: "sd.requests.my-requests", label: "My Requests", icon: UserCircle, href: "/apps/service-desk/requests/my-requests" },
          { id: "sd.requests.approvals", label: "Pending Approvals", icon: CheckCircle, href: "/apps/service-desk/requests/approvals" },
        ],
      },
      {
        id: "sd.knowledge",
        label: "Knowledge Base",
        icon: BookOpen,
        children: [
          { id: "sd.knowledge.articles", label: "Articles", icon: FileText, href: "/apps/service-desk/knowledge/articles" },
          { id: "sd.knowledge.faqs", label: "FAQs", icon: MessageCircleQuestion, href: "/apps/service-desk/knowledge/faqs" },
          { id: "sd.knowledge.search", label: "Search", icon: Search, href: "/apps/service-desk/knowledge/search" },
        ],
      },
      {
        id: "sd.sla",
        label: "SLA Management",
        icon: Timer,
        children: [
          { id: "sd.sla.policies", label: "SLA Policies", icon: FileText, href: "/apps/service-desk/sla/policies" },
          { id: "sd.sla.monitoring", label: "SLA Monitoring", icon: Activity, href: "/apps/service-desk/sla/monitoring" },
          { id: "sd.sla.reports", label: "SLA Reports", icon: BarChart3, href: "/apps/service-desk/sla/reports" },
        ],
      },
      {
        id: "sd.reports",
        label: "Reports",
        icon: BarChart3,
        children: [
          { id: "sd.reports.incidents", label: "Incident Reports", icon: FileBarChart, href: "/apps/service-desk/reports/incidents" },
          { id: "sd.reports.performance", label: "Performance Reports", icon: TrendingUp, href: "/apps/service-desk/reports/performance" },
          { id: "sd.reports.trends", label: "Trend Analysis", icon: LineChart, href: "/apps/service-desk/reports/trends" },
        ],
      },
      {
        id: "sd.settings",
        label: "Settings",
        icon: Settings,
        children: [
          { id: "sd.settings.general", label: "General Settings", icon: Settings, href: "/apps/service-desk/settings/general" },
          { id: "sd.settings.categories", label: "Categories", icon: Tags, href: "/apps/service-desk/settings/categories" },
          { id: "sd.settings.workflows", label: "Workflows", icon: Workflow, href: "/apps/service-desk/settings/workflows" },
          { id: "sd.settings.notifications", label: "Notifications", icon: Bell, href: "/apps/service-desk/settings/notifications" },
        ],
      },
    ],
  },
  {
    id: "portal",
    label: "Custom Portal",
    items: [
      {
        id: "portal.access",
        label: "Access Custom Portal",
        icon: Building2,
        href: "/apps/custom-portal",
      },
      {
        id: "portal.dashboard",
        label: "Dashboard",
        icon: LayoutDashboard,
        href: "/apps/custom-portal",
      },
      {
        id: "portal.masters",
        label: "Masters",
        icon: Database,
        children: [
          {
            id: "portal.masters.user-master",
            label: "User Master",
            icon: UserCog,
            href: "/admin/users",
          },
          {
            id: "portal.masters.role-master",
            label: "Role Master",
            icon: ShieldCheck,
            href: "/admin/roles",
          },
        ],
      },
      {
        id: "portal.licenses",
        label: "License Management",
        icon: Key,
        children: [
          { id: "portal.licenses.active", label: "Active Licenses", icon: CheckCircle, href: "/apps/custom-portal/licenses/active" },
          { id: "portal.licenses.requests", label: "License Requests", icon: FileText, href: "/apps/custom-portal/licenses/requests" },
          { id: "portal.licenses.renewals", label: "Renewals", icon: RefreshCw, href: "/apps/custom-portal/licenses/renewals" },
          { id: "portal.licenses.compliance", label: "Compliance", icon: ShieldCheck, href: "/apps/custom-portal/licenses/compliance" },
        ],
      },
      {
        id: "portal.requisitions",
        label: "Requisitions",
        icon: ClipboardList,
        children: [
          { id: "portal.requisitions.new", label: "New Requisition", icon: PlusCircle, href: "/apps/custom-portal/requisitions/new" },
          { id: "portal.requisitions.my-requests", label: "My Requests", icon: UserCircle, href: "/apps/custom-portal/requisitions/my-requests" },
          { id: "portal.requisitions.approvals", label: "Pending Approvals", icon: CheckCircle, href: "/apps/custom-portal/requisitions/approvals" },
          { id: "portal.requisitions.history", label: "History", icon: History, href: "/apps/custom-portal/requisitions/history" },
        ],
      },
      {
        id: "portal.spend",
        label: "Spend Management",
        icon: Wallet,
        children: [
          { id: "portal.spend.overview", label: "Spend Overview", icon: PieChart, href: "/apps/custom-portal/spend/overview" },
          { id: "portal.spend.budgets", label: "Budgets", icon: DollarSign, href: "/apps/custom-portal/spend/budgets" },
          { id: "portal.spend.reports", label: "Spend Reports", icon: BarChart3, href: "/apps/custom-portal/spend/reports" },
        ],
      },
      {
        id: "portal.vendors",
        label: "Vendor Management",
        icon: Building2,
        children: [
          { id: "portal.vendors.list", label: "Vendor List", icon: ListChecks, href: "/apps/custom-portal/vendors/list" },
          { id: "portal.vendors.contracts", label: "Contracts", icon: FileText, href: "/apps/custom-portal/vendors/contracts" },
          { id: "portal.vendors.performance", label: "Performance", icon: TrendingUp, href: "/apps/custom-portal/vendors/performance" },
        ],
      },
      {
        id: "portal.reports",
        label: "Reports",
        icon: BarChart3,
        children: [
          { id: "portal.reports.usage", label: "Usage Reports", icon: Activity, href: "/apps/custom-portal/reports/usage" },
          { id: "portal.reports.cost-analysis", label: "Cost Analysis", icon: LineChart, href: "/apps/custom-portal/reports/cost-analysis" },
          { id: "portal.reports.custom", label: "Custom Reports", icon: FileBarChart, href: "/apps/custom-portal/reports/custom" },
        ],
      },
      {
        id: "portal.settings",
        label: "Settings",
        icon: Settings,
        children: [
          { id: "portal.settings.general", label: "General Settings", icon: Settings, href: "/apps/custom-portal/settings/general" },
          { id: "portal.settings.categories", label: "Categories", icon: Tags, href: "/apps/custom-portal/settings/categories" },
          { id: "portal.settings.workflows", label: "Approval Workflows", icon: Workflow, href: "/apps/custom-portal/settings/workflows" },
          { id: "portal.settings.notifications", label: "Notifications", icon: Bell, href: "/apps/custom-portal/settings/notifications" },
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
