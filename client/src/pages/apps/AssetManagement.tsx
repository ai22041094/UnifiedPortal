import { useState, useMemo } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { useRBAC } from "@/lib/rbac";
import { cn } from "@/lib/utils";
import { hasAppAccess } from "@/lib/menu-config";
import AccessDenied from "@/components/AccessDenied";
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
    href: "/apps/alm",
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

function DashboardContent() {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[
          { icon: Laptop, label: "Laptops", count: 450, color: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" },
          { icon: Monitor, label: "Monitors", count: 820, color: "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400" },
          { icon: Smartphone, label: "Mobiles", count: 120, color: "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400" },
          { icon: Printer, label: "Printers", count: 45, color: "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400" },
        ].map((item) => (
          <Card key={item.label} data-testid={`card-stat-${item.label.toLowerCase()}`}>
            <CardContent className="p-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">{item.label}</p>
                <h3 className="text-3xl font-bold" data-testid={`text-count-${item.label.toLowerCase()}`}>{item.count}</h3>
              </div>
              <div className={`h-12 w-12 rounded-xl ${item.color} flex items-center justify-center`}>
                <item.icon className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Asset Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center bg-muted/20 rounded-md mx-6 mb-6">
            <p className="text-muted-foreground">Chart Visualization Placeholder</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Renewals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: "Microsoft Office 365 E3", days: 12, cost: "$12,400" },
                { name: "Adobe Creative Cloud", days: 18, cost: "$8,200" },
                { name: "Slack Enterprise", days: 25, cost: "$5,600" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between gap-4 p-3 border rounded-lg" data-testid={`row-renewal-${i}`}>
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "h-2 w-2 rounded-full",
                      item.days <= 14 ? "bg-red-500" : item.days <= 21 ? "bg-yellow-500" : "bg-green-500"
                    )} />
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground">Expires in {item.days} days</p>
                    </div>
                  </div>
                  <span className="text-sm font-mono">{item.cost}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
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
  
  const isDashboard = location === "/apps/alm";
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
              <Button variant="ghost" size="icon" className="relative" data-testid="button-notifications">
                <Bell className="h-5 w-5 text-muted-foreground" />
                <span className="absolute top-2 right-2 h-2 w-2 bg-destructive rounded-full" />
              </Button>
              <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-sm font-medium" data-testid="text-user-initials">
                {userInitials}
              </div>
            </div>
          </header>

          <main className="flex-1 p-6 overflow-y-auto">
            <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
              {isDashboard ? (
                <DashboardContent />
              ) : (
                <PageInProgress title={pageTitle} />
              )}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
