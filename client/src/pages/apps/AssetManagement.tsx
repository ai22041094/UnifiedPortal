import { useState, useMemo } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { useRBAC } from "@/lib/rbac";
import { cn } from "@/lib/utils";
import { hasAppAccess } from "@/lib/menu-config";
import AccessDenied from "@/components/AccessDenied";
import ProfileDropdown from "@/components/ProfileDropdown";
import NotificationBell from "@/components/NotificationBell";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LayoutDashboard,
  ChevronRight,
  ClipboardList,
  Target,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Calculator,
  Clock,
  Compass,
  ShoppingCart,
  Users,
  Bot,
  Package,
  CreditCard,
  Play,
  Puzzle,
  Activity,
  RefreshCw,
  Wrench,
  Calendar,
  Brain,
  Trash2,
  Search,
  Shield,
  Leaf,
  FileText,
  Plug,
  Key,
  Link2,
  Upload,
  Webhook,
  BarChart3,
  PieChart,
  LineChart,
  Wallet,
  FileBarChart,
  Home,
  LogOut,
  Bell,
  Laptop,
  Monitor,
  Smartphone,
  Printer,
  Construction,
  Settings,
  Database,
  UserCog,
  ShieldCheck,
  Lock,
  Palette,
  BellRing,
  HardDrive,
  Globe,
  Mail,
} from "lucide-react";

interface MenuItem {
  id: string;
  title: string;
  icon: any;
  href?: string;
  children?: MenuItem[];
}

const menuItems: MenuItem[] = [
  {
    id: "alm.dashboard",
    title: "Dashboard",
    icon: LayoutDashboard,
    children: [
      { id: "alm.dashboard.overview", title: "Overview", icon: LayoutDashboard, href: "/apps/alm" },
      { id: "alm.dashboard.hardware", title: "Hardware Assets", icon: Monitor, href: "/apps/alm/dashboard/hardware" },
      { id: "alm.dashboard.software", title: "Software Assets", icon: Package, href: "/apps/alm/dashboard/software" },
      { id: "alm.dashboard.cio", title: "CIO View", icon: Brain, href: "/apps/alm/dashboard/cio" },
      { id: "alm.dashboard.cfo", title: "CFO View", icon: DollarSign, href: "/apps/alm/dashboard/cfo" },
      { id: "alm.dashboard.coo", title: "COO View", icon: Activity, href: "/apps/alm/dashboard/coo" },
    ],
  },
  {
    id: "alm.masters",
    title: "Masters",
    icon: Database,
    children: [
      { id: "alm.masters.user-master", title: "User Master", icon: UserCog, href: "/admin/users" },
      { id: "alm.masters.role-master", title: "Role Master", icon: ShieldCheck, href: "/admin/roles" },
    ],
  },
  {
    id: "alm.lifecycle",
    title: "ALM Lifecycle",
    icon: RefreshCw,
    children: [
      {
        id: "alm.lifecycle.planning",
        title: "Planning",
        icon: ClipboardList,
        children: [
          { id: "alm.lifecycle.planning.needs-assessment", title: "Needs Assessment", icon: Target, href: "/apps/alm/planning/needs-assessment" },
          { id: "alm.lifecycle.planning.budget-planning", title: "Budget Planning", icon: DollarSign, href: "/apps/alm/planning/budget-planning" },
          { id: "alm.lifecycle.planning.risk-analysis", title: "Risk Analysis", icon: AlertTriangle, href: "/apps/alm/planning/risk-analysis" },
          { id: "alm.lifecycle.planning.success-criteria", title: "Success Criteria", icon: CheckCircle, href: "/apps/alm/planning/success-criteria" },
          { id: "alm.lifecycle.planning.forecasting", title: "Forecasting & Scenario Planning", icon: TrendingUp, href: "/apps/alm/planning/forecasting" },
          { id: "alm.lifecycle.planning.cost-estimation", title: "Cost Estimation Tools", icon: Calculator, href: "/apps/alm/planning/cost-estimation" },
          { id: "alm.lifecycle.planning.timeline-optimization", title: "Timeline Optimization", icon: Clock, href: "/apps/alm/planning/timeline-optimization" },
          { id: "alm.lifecycle.planning.strategic-alignment", title: "Strategic Alignment", icon: Compass, href: "/apps/alm/planning/strategic-alignment" },
          { id: "alm.lifecycle.planning.requirements", title: "Requirements", icon: FileText, href: "/apps/alm/planning/requirements" },
          { id: "alm.lifecycle.planning.asset-request", title: "Asset Request", icon: FileText, href: "/apps/alm/planning/asset-request" },
        ],
      },
      {
        id: "alm.lifecycle.acquisition",
        title: "Acquisition",
        icon: ShoppingCart,
        children: [
          { id: "alm.lifecycle.acquisition.purchase-order", title: "Purchase Order", icon: FileText, href: "/apps/alm/acquisition/purchase-order" },
          { id: "alm.lifecycle.acquisition.contracts", title: "Contracts", icon: FileText, href: "/apps/alm/acquisition/contracts" },
          { id: "alm.lifecycle.acquisition.approvals", title: "Approvals", icon: CheckCircle, href: "/apps/alm/acquisition/approvals" },
          { id: "alm.lifecycle.acquisition.vendor-management", title: "Vendor Management", icon: Users, href: "/apps/alm/acquisition/vendor-management" },
          { id: "alm.lifecycle.acquisition.automated-procurement", title: "Automated Procurement", icon: Bot, href: "/apps/alm/acquisition/automated-procurement" },
          { id: "alm.lifecycle.acquisition.inventory-tracking", title: "Real-time Inventory Tracking", icon: Package, href: "/apps/alm/acquisition/inventory-tracking" },
          { id: "alm.lifecycle.acquisition.financial-tracking", title: "Financial Tracking", icon: CreditCard, href: "/apps/alm/acquisition/financial-tracking" },
        ],
      },
      {
        id: "alm.lifecycle.operations",
        title: "Operations",
        icon: Play,
        children: [
          { id: "alm.lifecycle.operations.asset-register", title: "Asset Register", icon: Package, href: "/apps/alm/operations/asset-register" },
          { id: "alm.lifecycle.operations.inventory", title: "Inventory", icon: Package, href: "/apps/alm/operations/inventory" },
          { id: "alm.lifecycle.operations.lifecycle-tracking", title: "Lifecycle Tracking", icon: RefreshCw, href: "/apps/alm/operations/lifecycle-tracking" },
          { id: "alm.lifecycle.operations.depreciation", title: "Depreciation", icon: FileText, href: "/apps/alm/operations/depreciation" },
          { id: "alm.lifecycle.operations.deployment", title: "Seamless Deployment & Integration", icon: Puzzle, href: "/apps/alm/operations/deployment" },
          { id: "alm.lifecycle.operations.asset-assignment", title: "Asset Assignment & Accountability", icon: Users, href: "/apps/alm/operations/asset-assignment" },
          { id: "alm.lifecycle.operations.performance-monitoring", title: "Performance Monitoring", icon: Activity, href: "/apps/alm/operations/performance-monitoring" },
          { id: "alm.lifecycle.operations.strategic-reallocation", title: "Strategic Reallocation", icon: RefreshCw, href: "/apps/alm/operations/strategic-reallocation" },
        ],
      },
      {
        id: "alm.lifecycle.maintenance",
        title: "Maintenance",
        icon: Wrench,
        children: [
          { id: "alm.lifecycle.maintenance.scheduled", title: "Scheduled Maintenance", icon: Calendar, href: "/apps/alm/maintenance/scheduled" },
          { id: "alm.lifecycle.maintenance.request", title: "Maintenance Request", icon: FileText, href: "/apps/alm/maintenance/request" },
          { id: "alm.lifecycle.maintenance.history", title: "Maintenance History", icon: Clock, href: "/apps/alm/maintenance/history" },
          { id: "alm.lifecycle.maintenance.preventive", title: "Preventive Maintenance", icon: Calendar, href: "/apps/alm/maintenance/preventive" },
          { id: "alm.lifecycle.maintenance.predictive", title: "Predictive Maintenance", icon: Brain, href: "/apps/alm/maintenance/predictive" },
        ],
      },
      {
        id: "alm.lifecycle.decommissioning",
        title: "Decommissioning",
        icon: Trash2,
        children: [
          { id: "alm.lifecycle.decommissioning.asset-identification", title: "Asset Identification", icon: Search, href: "/apps/alm/decommissioning/asset-identification" },
          { id: "alm.lifecycle.decommissioning.secure-data-wiping", title: "Secure Data Wiping", icon: Shield, href: "/apps/alm/decommissioning/secure-data-wiping" },
          { id: "alm.lifecycle.decommissioning.responsible-disposal", title: "Environmentally Responsible Disposal", icon: Leaf, href: "/apps/alm/decommissioning/responsible-disposal" },
          { id: "alm.lifecycle.decommissioning.records-management", title: "Records Management", icon: FileText, href: "/apps/alm/decommissioning/records-management" },
        ],
      },
    ],
  },
  {
    id: "alm.integration",
    title: "Integration Ecosystem",
    icon: Plug,
    children: [
      { id: "alm.integration.api-management", title: "API Management", icon: Key, href: "/apps/alm/integration/api-management" },
      { id: "alm.integration.third-party", title: "Third-party Integrations", icon: Link2, href: "/apps/alm/integration/third-party" },
      { id: "alm.integration.data-import-export", title: "Data Import/Export", icon: Upload, href: "/apps/alm/integration/data-import-export" },
      { id: "alm.integration.webhooks", title: "Webhooks", icon: Webhook, href: "/apps/alm/integration/webhooks" },
    ],
  },
  {
    id: "alm.analytics",
    title: "Advanced Analytics & Reporting",
    icon: BarChart3,
    children: [
      { id: "alm.analytics.roi-analysis", title: "ROI Analysis", icon: PieChart, href: "/apps/alm/analytics/roi-analysis" },
      { id: "alm.analytics.utilization-tracking", title: "Utilization Tracking", icon: Activity, href: "/apps/alm/analytics/utilization-tracking" },
      { id: "alm.analytics.predictive-analytics", title: "Predictive Analytics", icon: LineChart, href: "/apps/alm/analytics/predictive-analytics" },
      { id: "alm.analytics.cost-optimization", title: "Cost Optimization", icon: Wallet, href: "/apps/alm/analytics/cost-optimization" },
      { id: "alm.analytics.custom-reporting", title: "Custom Reporting", icon: FileBarChart, href: "/apps/alm/analytics/custom-reporting" },
    ],
  },
  {
    id: "alm.settings",
    title: "Settings",
    icon: Settings,
    children: [
      { id: "alm.settings.general", title: "General", icon: Settings, href: "/apps/alm/settings/general" },
      { id: "alm.settings.security", title: "Security", icon: Lock, href: "/apps/alm/settings/security" },
      { id: "alm.settings.notifications", title: "Notifications", icon: BellRing, href: "/apps/alm/settings/notifications" },
      { id: "alm.settings.appearance", title: "Appearance", icon: Palette, href: "/apps/alm/settings/appearance" },
      { id: "alm.settings.backup", title: "Backup & Recovery", icon: HardDrive, href: "/apps/alm/settings/backup" },
      { id: "alm.settings.localization", title: "Localization", icon: Globe, href: "/apps/alm/settings/localization" },
      { id: "alm.settings.email", title: "Email Configuration", icon: Mail, href: "/apps/alm/settings/email" },
    ],
  },
];

function PageInProgress({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
      <div className="text-center space-y-4">
        <div className="h-20 w-20 mx-auto rounded-full bg-muted flex items-center justify-center">
          <Construction className="h-10 w-10 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-semibold text-foreground">{title}</h2>
        <p className="text-muted-foreground max-w-md">
          This page is currently under development. Check back soon for updates.
        </p>
      </div>
    </div>
  );
}

function KPICard({ icon: Icon, label, value, subValue, trend, trendUp, color }: {
  icon: any;
  label: string;
  value: string | number;
  subValue?: string;
  trend?: string;
  trendUp?: boolean;
  color: string;
}) {
  return (
    <Card data-testid={`card-kpi-${label.toLowerCase().replace(/\s+/g, '-')}`}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground mb-1">{label}</p>
            <h3 className="text-2xl font-bold" data-testid={`text-kpi-${label.toLowerCase().replace(/\s+/g, '-')}`}>{value}</h3>
            {subValue && <p className="text-xs text-muted-foreground mt-1">{subValue}</p>}
            {trend && (
              <div className={cn("flex items-center gap-1 text-xs mt-2", trendUp ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400")}>
                <TrendingUp className={cn("h-3 w-3", !trendUp && "rotate-180")} />
                <span>{trend}</span>
              </div>
            )}
          </div>
          <div className={`h-11 w-11 rounded-xl ${color} flex items-center justify-center flex-shrink-0`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function OverviewDashboard() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard icon={Package} label="Total Assets" value="2,847" subValue="Hardware & Software" trend="+12% from last month" trendUp={true} color="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" />
        <KPICard icon={CheckCircle} label="Compliance Rate" value="94.2%" subValue="License compliance" trend="+2.4% improvement" trendUp={true} color="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400" />
        <KPICard icon={DollarSign} label="Total Asset Value" value="$4.2M" subValue="Current book value" trend="-8% depreciation" trendUp={false} color="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400" />
        <KPICard icon={AlertTriangle} label="Critical Alerts" value="23" subValue="Requires attention" trend="-15% from last week" trendUp={true} color="bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard icon={Laptop} label="Hardware Assets" value="1,435" subValue="Active devices" color="bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400" />
        <KPICard icon={Package} label="Software Licenses" value="1,412" subValue="Active licenses" color="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400" />
        <KPICard icon={Activity} label="Utilization Rate" value="78.5%" subValue="Avg. asset usage" color="bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400" />
        <KPICard icon={Wrench} label="Pending Maintenance" value="47" subValue="Scheduled tasks" color="bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
            <CardTitle className="text-base font-semibold">Asset Distribution by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { category: "Laptops & Desktops", count: 850, percentage: 60, color: "bg-blue-500" },
                { category: "Monitors & Displays", count: 420, percentage: 29, color: "bg-purple-500" },
                { category: "Mobile Devices", count: 120, percentage: 8, color: "bg-green-500" },
                { category: "Peripherals", count: 45, percentage: 3, color: "bg-orange-500" },
              ].map((item, i) => (
                <div key={i} className="space-y-2" data-testid={`row-distribution-${i}`}>
                  <div className="flex items-center justify-between gap-4 text-sm">
                    <span className="font-medium">{item.category}</span>
                    <span className="text-muted-foreground">{item.count} assets ({item.percentage}%)</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className={cn("h-full rounded-full transition-all", item.color)} style={{ width: `${item.percentage}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Asset Health Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { status: "Healthy", count: 1180, color: "bg-green-500", textColor: "text-green-600 dark:text-green-400" },
                { status: "Warning", count: 198, color: "bg-yellow-500", textColor: "text-yellow-600 dark:text-yellow-400" },
                { status: "Critical", count: 45, color: "bg-red-500", textColor: "text-red-600 dark:text-red-400" },
                { status: "Unknown", count: 12, color: "bg-gray-400", textColor: "text-gray-600 dark:text-gray-400" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between gap-4 p-3 border rounded-lg" data-testid={`row-health-${i}`}>
                  <div className="flex items-center gap-3">
                    <div className={cn("h-3 w-3 rounded-full", item.color)} />
                    <span className="font-medium">{item.status}</span>
                  </div>
                  <span className={cn("font-semibold", item.textColor)}>{item.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Upcoming Renewals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { name: "Microsoft 365 E3", type: "Software", days: 12, cost: "$12,400" },
                { name: "Adobe Creative Cloud", type: "Software", days: 18, cost: "$8,200" },
                { name: "Cisco Meraki License", type: "Network", days: 25, cost: "$5,600" },
                { name: "VMware vSphere", type: "Infrastructure", days: 32, cost: "$15,800" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between gap-4 p-3 border rounded-lg" data-testid={`row-renewal-${i}`}>
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={cn("h-2 w-2 rounded-full flex-shrink-0", item.days <= 14 ? "bg-red-500" : item.days <= 21 ? "bg-yellow-500" : "bg-green-500")} />
                    <div className="min-w-0">
                      <p className="font-medium truncate">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.type} - Expires in {item.days} days</p>
                    </div>
                  </div>
                  <span className="text-sm font-mono flex-shrink-0">{item.cost}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Recent Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { action: "New laptop assigned", user: "John Smith", time: "2 hours ago", icon: Laptop },
                { action: "Software license renewed", user: "System", time: "4 hours ago", icon: Package },
                { action: "Asset decommissioned", user: "IT Admin", time: "Yesterday", icon: Trash2 },
                { action: "Maintenance completed", user: "Tech Support", time: "2 days ago", icon: Wrench },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-3 border rounded-lg" data-testid={`row-activity-${i}`}>
                  <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                    <item.icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{item.action}</p>
                    <p className="text-xs text-muted-foreground">{item.user} - {item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function HardwareAssetDashboard() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard icon={Laptop} label="Total Hardware" value="1,435" subValue="Active devices" trend="+5% from last month" trendUp={true} color="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" />
        <KPICard icon={CheckCircle} label="In Service" value="1,312" subValue="91.4% of total" color="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400" />
        <KPICard icon={Wrench} label="Under Maintenance" value="78" subValue="5.4% of total" color="bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400" />
        <KPICard icon={Trash2} label="End of Life" value="45" subValue="Scheduled for disposal" color="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <KPICard icon={Laptop} label="Laptops" value="520" color="bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400" />
        <KPICard icon={Monitor} label="Desktops" value="330" color="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400" />
        <KPICard icon={Monitor} label="Monitors" value="420" color="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400" />
        <KPICard icon={Smartphone} label="Mobile Devices" value="120" color="bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400" />
        <KPICard icon={Printer} label="Printers" value="45" color="bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
            <CardTitle className="text-base font-semibold">Hardware Lifecycle Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { stage: "New (0-1 years)", count: 380, percentage: 26, color: "bg-green-500" },
                { stage: "Active (1-3 years)", count: 620, percentage: 43, color: "bg-blue-500" },
                { stage: "Aging (3-5 years)", count: 320, percentage: 22, color: "bg-yellow-500" },
                { stage: "End of Life (5+ years)", count: 115, percentage: 8, color: "bg-red-500" },
              ].map((item, i) => (
                <div key={i} className="space-y-2" data-testid={`row-lifecycle-${i}`}>
                  <div className="flex items-center justify-between gap-4 text-sm">
                    <span className="font-medium">{item.stage}</span>
                    <span className="text-muted-foreground">{item.count} devices ({item.percentage}%)</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className={cn("h-full rounded-full transition-all", item.color)} style={{ width: `${item.percentage}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Warranty Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { status: "Active Warranty", count: 892, percentage: 62, color: "bg-green-500", textColor: "text-green-600 dark:text-green-400" },
                { status: "Expiring Soon", count: 187, percentage: 13, color: "bg-yellow-500", textColor: "text-yellow-600 dark:text-yellow-400" },
                { status: "Expired", count: 298, percentage: 21, color: "bg-red-500", textColor: "text-red-600 dark:text-red-400" },
                { status: "No Warranty", count: 58, percentage: 4, color: "bg-gray-400", textColor: "text-gray-600 dark:text-gray-400" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between gap-4 p-3 border rounded-lg" data-testid={`row-warranty-${i}`}>
                  <div className="flex items-center gap-3">
                    <div className={cn("h-3 w-3 rounded-full", item.color)} />
                    <span className="font-medium text-sm">{item.status}</span>
                  </div>
                  <span className={cn("font-semibold text-sm", item.textColor)}>{item.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Top Vendors by Asset Count</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { vendor: "Dell Technologies", count: 480, percentage: 33 },
                { vendor: "HP Inc.", count: 320, percentage: 22 },
                { vendor: "Lenovo", count: 290, percentage: 20 },
                { vendor: "Apple", count: 185, percentage: 13 },
                { vendor: "Others", count: 160, percentage: 11 },
              ].map((item, i) => (
                <div key={i} className="space-y-2" data-testid={`row-vendor-${i}`}>
                  <div className="flex items-center justify-between gap-4 text-sm">
                    <span className="font-medium">{item.vendor}</span>
                    <span className="text-muted-foreground">{item.count} ({item.percentage}%)</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${item.percentage}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Upcoming Warranty Expirations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { asset: "Dell Latitude 5540", serial: "DL5540-2847", days: 15 },
                { asset: "HP EliteBook 840", serial: "HP840-1923", days: 22 },
                { asset: "Lenovo ThinkPad X1", serial: "LN-X1-4521", days: 30 },
                { asset: "Apple MacBook Pro", serial: "MBP-2024-892", days: 45 },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between gap-4 p-3 border rounded-lg" data-testid={`row-warranty-exp-${i}`}>
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={cn("h-2 w-2 rounded-full flex-shrink-0", item.days <= 20 ? "bg-red-500" : item.days <= 30 ? "bg-yellow-500" : "bg-green-500")} />
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{item.asset}</p>
                      <p className="text-xs text-muted-foreground">{item.serial}</p>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground flex-shrink-0">{item.days} days</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Asset Location</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { location: "Headquarters", count: 620 },
                { location: "Branch Office A", count: 340 },
                { location: "Branch Office B", count: 285 },
                { location: "Remote Workers", count: 190 },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between gap-4 p-3 border rounded-lg" data-testid={`row-location-${i}`}>
                  <span className="font-medium text-sm">{item.location}</span>
                  <span className="text-sm text-muted-foreground">{item.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Maintenance Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { type: "Scheduled This Week", count: 23, color: "text-blue-600 dark:text-blue-400" },
                { type: "Overdue", count: 8, color: "text-red-600 dark:text-red-400" },
                { type: "Completed This Month", count: 156, color: "text-green-600 dark:text-green-400" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between gap-4 p-3 border rounded-lg" data-testid={`row-maintenance-${i}`}>
                  <span className="font-medium text-sm">{item.type}</span>
                  <span className={cn("font-semibold text-sm", item.color)}>{item.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Depreciation Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { label: "Original Value", value: "$2.8M", color: "text-foreground" },
                { label: "Current Book Value", value: "$1.9M", color: "text-blue-600 dark:text-blue-400" },
                { label: "Total Depreciation", value: "$0.9M", color: "text-orange-600 dark:text-orange-400" },
                { label: "Avg Depreciation Rate", value: "15%/year", color: "text-muted-foreground" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between gap-4 p-3 border rounded-lg" data-testid={`row-depreciation-${i}`}>
                  <span className="text-sm text-muted-foreground">{item.label}</span>
                  <span className={cn("font-semibold text-sm", item.color)}>{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function SoftwareAssetDashboard() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard icon={Package} label="Total Licenses" value="1,412" subValue="Across all vendors" trend="+8% from last month" trendUp={true} color="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400" />
        <KPICard icon={CheckCircle} label="Compliance Rate" value="94.2%" subValue="License compliance" trend="+2.4% improvement" trendUp={true} color="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400" />
        <KPICard icon={DollarSign} label="Annual Spend" value="$2.1M" subValue="Software licensing" trend="+12% YoY" trendUp={false} color="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400" />
        <KPICard icon={AlertTriangle} label="Compliance Risks" value="47" subValue="Potential violations" trend="-18% from last week" trendUp={true} color="bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard icon={Users} label="Active Users" value="1,245" subValue="Using software" color="bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400" />
        <KPICard icon={Package} label="Unused Licenses" value="167" subValue="Optimization opportunity" color="bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400" />
        <KPICard icon={RefreshCw} label="Auto-Renewals" value="89" subValue="Next 90 days" color="bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400" />
        <KPICard icon={Shield} label="Security Patches" value="12" subValue="Pending updates" color="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
            <CardTitle className="text-base font-semibold">License Utilization by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { category: "Productivity Suite", used: 890, total: 950, percentage: 94 },
                { category: "Development Tools", used: 145, total: 200, percentage: 73 },
                { category: "Security Software", used: 1200, total: 1200, percentage: 100 },
                { category: "Collaboration Tools", used: 780, total: 850, percentage: 92 },
                { category: "Design Software", used: 42, total: 75, percentage: 56 },
              ].map((item, i) => (
                <div key={i} className="space-y-2" data-testid={`row-utilization-${i}`}>
                  <div className="flex items-center justify-between gap-4 text-sm">
                    <span className="font-medium">{item.category}</span>
                    <span className="text-muted-foreground">{item.used}/{item.total} ({item.percentage}%)</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className={cn("h-full rounded-full transition-all", item.percentage >= 90 ? "bg-green-500" : item.percentage >= 70 ? "bg-blue-500" : "bg-yellow-500")} style={{ width: `${item.percentage}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">License Type Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { type: "Perpetual", count: 420, percentage: 30, color: "bg-blue-500" },
                { type: "Subscription", count: 756, percentage: 54, color: "bg-green-500" },
                { type: "Open Source", count: 168, percentage: 12, color: "bg-purple-500" },
                { type: "Freeware", count: 68, percentage: 5, color: "bg-gray-400" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between gap-4 p-3 border rounded-lg" data-testid={`row-license-type-${i}`}>
                  <div className="flex items-center gap-3">
                    <div className={cn("h-3 w-3 rounded-full", item.color)} />
                    <span className="font-medium text-sm">{item.type}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{item.count} ({item.percentage}%)</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Top Software by Spend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { software: "Microsoft 365 E3", spend: "$580,000", licenses: 950, trend: "+5%" },
                { software: "Salesforce CRM", spend: "$420,000", licenses: 320, trend: "+12%" },
                { software: "Adobe Creative Cloud", spend: "$185,000", licenses: 75, trend: "-3%" },
                { software: "Atlassian Suite", spend: "$145,000", licenses: 200, trend: "+8%" },
                { software: "Slack Enterprise", spend: "$98,000", licenses: 850, trend: "+15%" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between gap-4 p-3 border rounded-lg" data-testid={`row-spend-${i}`}>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{item.software}</p>
                    <p className="text-xs text-muted-foreground">{item.licenses} licenses</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-semibold text-sm">{item.spend}</p>
                    <p className={cn("text-xs", item.trend.startsWith('+') ? "text-red-500" : "text-green-500")}>{item.trend} YoY</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Upcoming License Renewals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { software: "Microsoft 365 E3", renewalDate: "Jan 15, 2025", cost: "$580,000", days: 38 },
                { software: "Adobe Creative Cloud", renewalDate: "Feb 1, 2025", cost: "$185,000", days: 55 },
                { software: "Atlassian Suite", renewalDate: "Feb 15, 2025", cost: "$145,000", days: 69 },
                { software: "Zoom Enterprise", renewalDate: "Mar 1, 2025", cost: "$52,000", days: 83 },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between gap-4 p-3 border rounded-lg" data-testid={`row-sw-renewal-${i}`}>
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={cn("h-2 w-2 rounded-full flex-shrink-0", item.days <= 30 ? "bg-red-500" : item.days <= 60 ? "bg-yellow-500" : "bg-green-500")} />
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{item.software}</p>
                      <p className="text-xs text-muted-foreground">{item.renewalDate}</p>
                    </div>
                  </div>
                  <span className="text-sm font-mono flex-shrink-0">{item.cost}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Compliance Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { alert: "Over-deployed licenses", count: 3, severity: "high" },
                { alert: "Expired licenses in use", count: 7, severity: "critical" },
                { alert: "Unlicensed software", count: 12, severity: "medium" },
                { alert: "Audit pending", count: 2, severity: "low" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between gap-4 p-3 border rounded-lg" data-testid={`row-compliance-${i}`}>
                  <div className="flex items-center gap-3">
                    <div className={cn("h-2 w-2 rounded-full", item.severity === "critical" ? "bg-red-600" : item.severity === "high" ? "bg-red-500" : item.severity === "medium" ? "bg-yellow-500" : "bg-blue-500")} />
                    <span className="font-medium text-sm">{item.alert}</span>
                  </div>
                  <span className={cn("font-semibold text-sm", item.severity === "critical" || item.severity === "high" ? "text-red-600 dark:text-red-400" : item.severity === "medium" ? "text-yellow-600 dark:text-yellow-400" : "text-blue-600 dark:text-blue-400")}>{item.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Version Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { version: "Latest Version", count: 892, color: "text-green-600 dark:text-green-400" },
                { version: "One Version Behind", count: 345, color: "text-yellow-600 dark:text-yellow-400" },
                { version: "Outdated (2+ versions)", count: 123, color: "text-orange-600 dark:text-orange-400" },
                { version: "End of Support", count: 52, color: "text-red-600 dark:text-red-400" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between gap-4 p-3 border rounded-lg" data-testid={`row-version-${i}`}>
                  <span className="font-medium text-sm">{item.version}</span>
                  <span className={cn("font-semibold text-sm", item.color)}>{item.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Cost Optimization</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { label: "Potential Savings", value: "$156,000", color: "text-green-600 dark:text-green-400" },
                { label: "Unused Licenses Cost", value: "$89,000", color: "text-orange-600 dark:text-orange-400" },
                { label: "Duplicate Software", value: "$42,000", color: "text-yellow-600 dark:text-yellow-400" },
                { label: "Over-provisioned", value: "$25,000", color: "text-red-600 dark:text-red-400" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between gap-4 p-3 border rounded-lg" data-testid={`row-cost-opt-${i}`}>
                  <span className="text-sm text-muted-foreground">{item.label}</span>
                  <span className={cn("font-semibold text-sm", item.color)}>{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function CIODashboard() {
  return (
    <div className="space-y-6">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-foreground">Strategic IT Asset Overview</h2>
        <p className="text-sm text-muted-foreground">Enterprise-wide asset intelligence for strategic decision making</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard icon={Package} label="IT Asset Portfolio" value="$6.3M" subValue="Total asset value" trend="+8% YoY growth" trendUp={true} color="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" />
        <KPICard icon={Target} label="Digital Maturity Score" value="78/100" subValue="Industry avg: 65" trend="+12 pts from Q3" trendUp={true} color="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400" />
        <KPICard icon={Shield} label="Security Posture" value="94%" subValue="Compliance score" trend="+3% improvement" trendUp={true} color="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400" />
        <KPICard icon={TrendingUp} label="Innovation Index" value="82%" subValue="Modern tech adoption" trend="+15% vs last year" trendUp={true} color="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
            <CardTitle className="text-base font-semibold">Strategic Technology Roadmap Alignment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { initiative: "Cloud Migration", progress: 72, status: "On Track", budget: "$1.2M" },
                { initiative: "Zero Trust Security", progress: 45, status: "In Progress", budget: "$850K" },
                { initiative: "AI/ML Integration", progress: 28, status: "Planning", budget: "$650K" },
                { initiative: "Legacy Modernization", progress: 85, status: "Near Complete", budget: "$2.1M" },
              ].map((item, i) => (
                <div key={i} className="space-y-2 p-3 border rounded-lg" data-testid={`row-initiative-${i}`}>
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className="font-medium">{item.initiative}</span>
                      <span className={cn("text-xs px-2 py-0.5 rounded-full", item.status === "On Track" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : item.status === "Near Complete" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" : item.status === "In Progress" ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" : "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400")}>{item.status}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{item.budget}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${item.progress}%` }} />
                    </div>
                    <span className="text-sm font-medium w-10">{item.progress}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Technology Stack Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { stack: "Infrastructure", health: 92, color: "text-green-600 dark:text-green-400" },
                { stack: "Applications", health: 88, color: "text-green-600 dark:text-green-400" },
                { stack: "Data & Analytics", health: 76, color: "text-yellow-600 dark:text-yellow-400" },
                { stack: "Security", health: 94, color: "text-green-600 dark:text-green-400" },
                { stack: "Integration", health: 71, color: "text-yellow-600 dark:text-yellow-400" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between gap-4 p-3 border rounded-lg" data-testid={`row-stack-${i}`}>
                  <span className="font-medium text-sm">{item.stack}</span>
                  <span className={cn("font-semibold text-sm", item.color)}>{item.health}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Digital Transformation KPIs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { kpi: "Cloud Adoption Rate", current: "68%", target: "85%", trend: "+12%" },
                { kpi: "Automation Coverage", current: "45%", target: "70%", trend: "+8%" },
                { kpi: "API Integration Score", current: "72%", target: "90%", trend: "+5%" },
                { kpi: "Employee Digital Fluency", current: "76%", target: "85%", trend: "+10%" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between gap-4 p-3 border rounded-lg" data-testid={`row-kpi-${i}`}>
                  <span className="font-medium text-sm">{item.kpi}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-sm">{item.current} / {item.target}</span>
                    <span className="text-xs text-green-600 dark:text-green-400">{item.trend}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Risk & Compliance Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { category: "Cyber Security Risks", count: 3, level: "Low", color: "text-green-600 dark:text-green-400" },
                { category: "Compliance Gaps", count: 7, level: "Medium", color: "text-yellow-600 dark:text-yellow-400" },
                { category: "Vendor Dependencies", count: 12, level: "Medium", color: "text-yellow-600 dark:text-yellow-400" },
                { category: "Technical Debt Items", count: 28, level: "High", color: "text-orange-600 dark:text-orange-400" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between gap-4 p-3 border rounded-lg" data-testid={`row-risk-${i}`}>
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-sm">{item.category}</span>
                    <span className={cn("text-xs px-2 py-0.5 rounded-full", item.level === "Low" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : item.level === "Medium" ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" : "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400")}>{item.level}</span>
                  </div>
                  <span className={cn("font-semibold text-sm", item.color)}>{item.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function CFODashboard() {
  return (
    <div className="space-y-6">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-foreground">Financial Asset Intelligence</h2>
        <p className="text-sm text-muted-foreground">Comprehensive financial view of IT asset investments and returns</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard icon={DollarSign} label="Total IT Investment" value="$6.3M" subValue="Current fiscal year" trend="+12% YoY" trendUp={false} color="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" />
        <KPICard icon={TrendingUp} label="ROI on IT Assets" value="142%" subValue="3-year average" trend="+18% improvement" trendUp={true} color="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400" />
        <KPICard icon={Wallet} label="Cost Savings" value="$1.2M" subValue="YTD optimization" trend="+25% vs target" trendUp={true} color="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400" />
        <KPICard icon={AlertTriangle} label="Budget Variance" value="-3.2%" subValue="Under budget" trend="Favorable" trendUp={true} color="bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
            <CardTitle className="text-base font-semibold">IT Spend by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { category: "Hardware & Infrastructure", budget: "$2.1M", spent: "$1.8M", percentage: 86, variance: "-$300K" },
                { category: "Software & Licenses", budget: "$2.4M", spent: "$2.2M", percentage: 92, variance: "-$200K" },
                { category: "Cloud Services", budget: "$1.2M", spent: "$1.15M", percentage: 96, variance: "-$50K" },
                { category: "Maintenance & Support", budget: "$600K", spent: "$580K", percentage: 97, variance: "-$20K" },
              ].map((item, i) => (
                <div key={i} className="space-y-2 p-3 border rounded-lg" data-testid={`row-spend-cat-${i}`}>
                  <div className="flex items-center justify-between gap-4">
                    <span className="font-medium">{item.category}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground">{item.spent} / {item.budget}</span>
                      <span className="text-sm text-green-600 dark:text-green-400">{item.variance}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div className={cn("h-full rounded-full transition-all", item.percentage > 95 ? "bg-yellow-500" : "bg-green-500")} style={{ width: `${item.percentage}%` }} />
                    </div>
                    <span className="text-sm font-medium w-10">{item.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Asset Depreciation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { label: "Total Original Cost", value: "$8.4M", color: "text-foreground" },
                { label: "Accumulated Depreciation", value: "$2.1M", color: "text-orange-600 dark:text-orange-400" },
                { label: "Current Book Value", value: "$6.3M", color: "text-blue-600 dark:text-blue-400" },
                { label: "Annual Depreciation", value: "$840K", color: "text-muted-foreground" },
                { label: "Avg Asset Life", value: "4.2 years", color: "text-muted-foreground" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between gap-4 p-3 border rounded-lg" data-testid={`row-depr-${i}`}>
                  <span className="text-sm text-muted-foreground">{item.label}</span>
                  <span className={cn("font-semibold text-sm", item.color)}>{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Cost Optimization Opportunities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { opportunity: "Unused Software Licenses", potential: "$156,000", action: "License reclamation" },
                { opportunity: "Redundant Cloud Services", potential: "$89,000", action: "Consolidation" },
                { opportunity: "End-of-Life Hardware", potential: "$120,000", action: "Trade-in program" },
                { opportunity: "Contract Renegotiation", potential: "$245,000", action: "Vendor negotiation" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between gap-4 p-3 border rounded-lg" data-testid={`row-opportunity-${i}`}>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{item.opportunity}</p>
                    <p className="text-xs text-muted-foreground">{item.action}</p>
                  </div>
                  <span className="font-semibold text-sm text-green-600 dark:text-green-400 flex-shrink-0">{item.potential}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-900/30">
              <div className="flex items-center justify-between gap-4">
                <span className="font-semibold text-sm">Total Potential Savings</span>
                <span className="font-bold text-lg text-green-600 dark:text-green-400">$610,000</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Upcoming Financial Commitments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { commitment: "Microsoft EA Renewal", date: "Q1 2025", amount: "$580,000", type: "Subscription" },
                { commitment: "Hardware Refresh Cycle", date: "Q2 2025", amount: "$1.2M", type: "CapEx" },
                { commitment: "Cloud Infrastructure", date: "Monthly", amount: "$95,000/mo", type: "OpEx" },
                { commitment: "Security Tools Renewal", date: "Q3 2025", amount: "$320,000", type: "Subscription" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between gap-4 p-3 border rounded-lg" data-testid={`row-commitment-${i}`}>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{item.commitment}</p>
                    <p className="text-xs text-muted-foreground">{item.date} - {item.type}</p>
                  </div>
                  <span className="font-semibold text-sm flex-shrink-0">{item.amount}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">CapEx vs OpEx Split</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-4 text-sm">
                  <span className="font-medium">Capital Expenditure</span>
                  <span className="text-muted-foreground">$2.8M (44%)</span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-blue-500" style={{ width: "44%" }} />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-4 text-sm">
                  <span className="font-medium">Operating Expenditure</span>
                  <span className="text-muted-foreground">$3.5M (56%)</span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-green-500" style={{ width: "56%" }} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Budget Forecast</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { quarter: "Q1 2025", forecast: "$1.6M", status: "Approved" },
                { quarter: "Q2 2025", forecast: "$1.8M", status: "Pending" },
                { quarter: "Q3 2025", forecast: "$1.5M", status: "Draft" },
                { quarter: "Q4 2025", forecast: "$1.4M", status: "Draft" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between gap-4 p-3 border rounded-lg" data-testid={`row-forecast-${i}`}>
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-sm">{item.quarter}</span>
                    <span className={cn("text-xs px-2 py-0.5 rounded-full", item.status === "Approved" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : item.status === "Pending" ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" : "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400")}>{item.status}</span>
                  </div>
                  <span className="font-semibold text-sm">{item.forecast}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Vendor Spend Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { vendor: "Microsoft", spend: "$1.4M", percentage: 22 },
                { vendor: "Dell", spend: "$980K", percentage: 16 },
                { vendor: "AWS", spend: "$720K", percentage: 11 },
                { vendor: "Salesforce", spend: "$420K", percentage: 7 },
                { vendor: "Others", spend: "$2.8M", percentage: 44 },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between gap-4 p-2" data-testid={`row-vendor-spend-${i}`}>
                  <span className="font-medium text-sm">{item.vendor}</span>
                  <span className="text-sm text-muted-foreground">{item.spend} ({item.percentage}%)</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function COODashboard() {
  return (
    <div className="space-y-6">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-foreground">Operational Excellence Dashboard</h2>
        <p className="text-sm text-muted-foreground">Real-time operational metrics and asset performance insights</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard icon={Activity} label="Asset Utilization" value="78.5%" subValue="Avg. across all assets" trend="+5.2% vs target" trendUp={true} color="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" />
        <KPICard icon={Clock} label="Avg. Deployment Time" value="2.4 days" subValue="New asset setup" trend="-18% improvement" trendUp={true} color="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400" />
        <KPICard icon={CheckCircle} label="SLA Compliance" value="98.2%" subValue="Service delivery" trend="+1.2% from Q3" trendUp={true} color="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400" />
        <KPICard icon={Wrench} label="Maintenance Efficiency" value="94%" subValue="On-time completion" trend="+8% improvement" trendUp={true} color="bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
            <CardTitle className="text-base font-semibold">Asset Utilization by Department</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { department: "Engineering", utilization: 92, assets: 380, efficiency: "High" },
                { department: "Sales & Marketing", utilization: 85, assets: 220, efficiency: "High" },
                { department: "Finance", utilization: 78, assets: 145, efficiency: "Medium" },
                { department: "HR & Admin", utilization: 65, assets: 95, efficiency: "Medium" },
                { department: "IT Operations", utilization: 88, assets: 180, efficiency: "High" },
              ].map((item, i) => (
                <div key={i} className="space-y-2" data-testid={`row-dept-util-${i}`}>
                  <div className="flex items-center justify-between gap-4 text-sm">
                    <div className="flex items-center gap-3">
                      <span className="font-medium">{item.department}</span>
                      <span className={cn("text-xs px-2 py-0.5 rounded-full", item.efficiency === "High" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400")}>{item.efficiency}</span>
                    </div>
                    <span className="text-muted-foreground">{item.assets} assets - {item.utilization}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className={cn("h-full rounded-full transition-all", item.utilization >= 80 ? "bg-green-500" : item.utilization >= 60 ? "bg-yellow-500" : "bg-red-500")} style={{ width: `${item.utilization}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Operational Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { metric: "Mean Time to Deploy", value: "2.4 days", trend: "-18%", trendUp: true },
                { metric: "Mean Time to Repair", value: "4.2 hours", trend: "-12%", trendUp: true },
                { metric: "First Call Resolution", value: "72%", trend: "+5%", trendUp: true },
                { metric: "Asset Downtime", value: "0.8%", trend: "-0.3%", trendUp: true },
                { metric: "Ticket Response Time", value: "45 min", trend: "-15%", trendUp: true },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between gap-4 p-3 border rounded-lg" data-testid={`row-op-metric-${i}`}>
                  <span className="font-medium text-sm">{item.metric}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">{item.value}</span>
                    <span className={cn("text-xs", item.trendUp ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400")}>{item.trend}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Active Work Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { type: "New Deployments", count: 24, priority: "Normal", status: "In Progress" },
                { type: "Maintenance Tasks", count: 18, priority: "Normal", status: "Scheduled" },
                { type: "Repair Requests", count: 8, priority: "High", status: "Urgent" },
                { type: "Asset Transfers", count: 12, priority: "Normal", status: "Pending" },
                { type: "Decommissioning", count: 6, priority: "Low", status: "Queued" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between gap-4 p-3 border rounded-lg" data-testid={`row-work-order-${i}`}>
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="font-medium text-sm truncate">{item.type}</span>
                    <span className={cn("text-xs px-2 py-0.5 rounded-full flex-shrink-0", item.priority === "High" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" : item.priority === "Normal" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" : "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400")}>{item.priority}</span>
                  </div>
                  <span className="font-semibold text-sm flex-shrink-0">{item.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Service Level Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { sla: "Critical Incidents (4 hrs)", met: 98, target: 95 },
                { sla: "High Priority (8 hrs)", met: 96, target: 90 },
                { sla: "Normal Requests (24 hrs)", met: 94, target: 85 },
                { sla: "Low Priority (48 hrs)", met: 99, target: 80 },
              ].map((item, i) => (
                <div key={i} className="space-y-2" data-testid={`row-sla-${i}`}>
                  <div className="flex items-center justify-between gap-4 text-sm">
                    <span className="font-medium">{item.sla}</span>
                    <span className={cn("font-semibold", item.met >= item.target ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400")}>{item.met}%</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className={cn("h-full rounded-full transition-all", item.met >= item.target ? "bg-green-500" : "bg-red-500")} style={{ width: `${item.met}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Asset Health Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { status: "Optimal Performance", count: 1180, percentage: 82, color: "bg-green-500" },
                { status: "Minor Issues", count: 198, percentage: 14, color: "bg-yellow-500" },
                { status: "Needs Attention", count: 45, percentage: 3, color: "bg-orange-500" },
                { status: "Critical", count: 12, percentage: 1, color: "bg-red-500" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between gap-4 p-3 border rounded-lg" data-testid={`row-health-overview-${i}`}>
                  <div className="flex items-center gap-3">
                    <div className={cn("h-3 w-3 rounded-full", item.color)} />
                    <span className="font-medium text-sm">{item.status}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{item.count} ({item.percentage}%)</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Inventory Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { item: "Laptops (Ready)", count: 45, status: "Adequate" },
                { item: "Monitors (Ready)", count: 28, status: "Low" },
                { item: "Keyboards/Mice", count: 120, status: "Adequate" },
                { item: "Network Equipment", count: 15, status: "Adequate" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between gap-4 p-3 border rounded-lg" data-testid={`row-inventory-${i}`}>
                  <span className="font-medium text-sm">{item.item}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">{item.count}</span>
                    <span className={cn("text-xs px-2 py-0.5 rounded-full", item.status === "Adequate" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400")}>{item.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Resource Allocation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { resource: "IT Support Staff", allocated: 12, utilized: 10, percentage: 83 },
                { resource: "Deployment Team", allocated: 6, utilized: 5, percentage: 83 },
                { resource: "Maintenance Techs", allocated: 8, utilized: 7, percentage: 88 },
              ].map((item, i) => (
                <div key={i} className="space-y-2 p-3 border rounded-lg" data-testid={`row-resource-${i}`}>
                  <div className="flex items-center justify-between gap-4 text-sm">
                    <span className="font-medium">{item.resource}</span>
                    <span className="text-muted-foreground">{item.utilized}/{item.allocated}</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${item.percentage}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function NestedMenuItem({ item, level = 0, currentPath }: { item: MenuItem; level?: number; currentPath: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const hasChildren = item.children && item.children.length > 0;
  const isActive = item.href === currentPath;

  if (hasChildren) {
    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <SidebarMenuItem>
          <CollapsibleTrigger asChild>
            <SidebarMenuButton data-testid={`button-menu-${item.id}`}>
              <item.icon className="h-4 w-4" />
              <span>{item.title}</span>
              <ChevronRight className={cn(
                "ml-auto h-4 w-4 transition-transform",
                isOpen && "rotate-90"
              )} />
            </SidebarMenuButton>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <SidebarMenuSub>
              {item.children!.map((child) => (
                <NestedMenuItem
                  key={child.id}
                  item={child}
                  level={level + 1}
                  currentPath={currentPath}
                />
              ))}
            </SidebarMenuSub>
          </CollapsibleContent>
        </SidebarMenuItem>
      </Collapsible>
    );
  }

  return (
    <SidebarMenuSubItem>
      <SidebarMenuSubButton asChild isActive={isActive} data-testid={`link-menu-${item.id}`}>
        <Link href={item.href || "#"}>
          <item.icon className="h-4 w-4" />
          <span>{item.title}</span>
        </Link>
      </SidebarMenuSubButton>
    </SidebarMenuSubItem>
  );
}

function TopLevelMenuItem({ item, currentPath }: { item: MenuItem; currentPath: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const hasChildren = item.children && item.children.length > 0;
  const isActive = item.href === currentPath;

  if (hasChildren) {
    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <SidebarMenuItem>
          <CollapsibleTrigger asChild>
            <SidebarMenuButton data-testid={`button-menu-${item.id}`}>
              <item.icon className="h-4 w-4" />
              <span>{item.title}</span>
              <ChevronRight className={cn(
                "ml-auto h-4 w-4 transition-transform",
                isOpen && "rotate-90"
              )} />
            </SidebarMenuButton>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <SidebarMenuSub>
              {item.children!.map((child) => (
                <NestedMenuItem
                  key={child.id}
                  item={child}
                  level={1}
                  currentPath={currentPath}
                />
              ))}
            </SidebarMenuSub>
          </CollapsibleContent>
        </SidebarMenuItem>
      </Collapsible>
    );
  }

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={isActive} data-testid={`link-menu-${item.id}`}>
        <Link href={item.href || "#"}>
          <item.icon className="h-4 w-4" />
          <span>{item.title}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

function getPageTitle(path: string): string {
  const pathSegments = path.split('/').filter(Boolean);
  
  if (path === '/apps/alm') return 'Dashboard';
  
  const findMenuItem = (items: MenuItem[], segments: string[]): string | null => {
    for (const item of items) {
      if (item.href === path) {
        return item.title;
      }
      if (item.children) {
        const found = findMenuItem(item.children, segments);
        if (found) return found;
      }
    }
    return null;
  };
  
  return findMenuItem(menuItems, pathSegments) || 'Page';
}

export default function AssetManagement() {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const { hasPermission, isAdmin, permissions } = useRBAC();
  const userInitials = user?.username.slice(0, 2).toUpperCase() || "U";
  
  if (!isAdmin && !hasAppAccess(permissions, "alm")) {
    return <AccessDenied appName="Asset Lifecycle Management" />;
  }
  
  const pageTitle = getPageTitle(location);

  const excludedParentPermissions = ['alm', 'alm.access', 'alm.dashboard'];
  
  const checkPermissionWithHierarchy = (permissionId: string): boolean => {
    if (hasPermission(permissionId)) return true;
    
    const parts = permissionId.split('.');
    for (let i = parts.length - 1; i >= 2; i--) {
      const parentPermission = parts.slice(0, i).join('.');
      if (!excludedParentPermissions.includes(parentPermission) && permissions.includes(parentPermission)) {
        return true;
      }
    }
    return false;
  };

  const filterMenuItems = (items: MenuItem[]): MenuItem[] => {
    return items
      .map((item) => {
        if (item.id === "alm.dashboard") return item;
        if (isAdmin) return item;
        
        if (item.children) {
          const filteredChildren = filterMenuItems(item.children);
          if (filteredChildren.length === 0) return null;
          return { ...item, children: filteredChildren };
        }
        
        if (checkPermissionWithHierarchy(item.id)) return item;
        return null;
      })
      .filter(Boolean) as MenuItem[];
  };

  const filteredMenuItems = useMemo(() => filterMenuItems(menuItems), [hasPermission, isAdmin, permissions]);

  const sidebarStyle = {
    "--sidebar-width": "18rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={sidebarStyle as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <Sidebar>
          <SidebarHeader className="border-b border-border/50">
            <div className="flex items-center gap-2 px-2 py-2">
              <div className="h-8 w-8 rounded bg-primary flex items-center justify-center text-primary-foreground font-bold">
                A
              </div>
              <span className="font-bold text-lg tracking-tight">ALM</span>
            </div>
          </SidebarHeader>
          
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Navigation</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {filteredMenuItems.map((item) => (
                    <TopLevelMenuItem
                      key={item.id}
                      item={item}
                      currentPath={location}
                    />
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t border-border/50">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild data-testid="link-back-to-portal">
                  <Link href="/portal">
                    <Home className="h-4 w-4" />
                    <span>Back to Portal</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={logout}
                  className="text-destructive hover:text-destructive"
                  data-testid="button-logout"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="h-16 border-b border-border/50 bg-background/80 backdrop-blur-sm flex-none px-6 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              <h1 className="text-xl font-semibold text-foreground">{pageTitle}</h1>
            </div>
            
            <div className="flex items-center gap-4">
              <NotificationBell />
              <ProfileDropdown />
            </div>
          </header>

          <main className="flex-1 p-6 overflow-y-auto">
            <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
              {location === "/apps/alm" && <OverviewDashboard />}
              {location === "/apps/alm/dashboard/hardware" && <HardwareAssetDashboard />}
              {location === "/apps/alm/dashboard/software" && <SoftwareAssetDashboard />}
              {location === "/apps/alm/dashboard/cio" && <CIODashboard />}
              {location === "/apps/alm/dashboard/cfo" && <CFODashboard />}
              {location === "/apps/alm/dashboard/coo" && <COODashboard />}
              {!["/apps/alm", "/apps/alm/dashboard/hardware", "/apps/alm/dashboard/software", "/apps/alm/dashboard/cio", "/apps/alm/dashboard/cfo", "/apps/alm/dashboard/coo"].includes(location) && (
                <PageInProgress title={pageTitle} />
              )}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
