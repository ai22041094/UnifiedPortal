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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard,
  ChevronRight,
  TrendingUp,
  Users,
  Clock,
  Activity,
  Radio,
  Sparkles,
  Eye,
  Monitor,
  ListChecks,
  UserCircle,
  Calendar,
  Brain,
  FileText,
  BarChart3,
  Layers,
  Moon,
  FileBarChart,
  LineChart,
  Gauge,
  Search,
  Plug,
  Webhook,
  FileCode,
  Bell,
  BellRing,
  History,
  Settings,
  Tags,
  Cpu,
  HelpCircle,
  BookOpen,
  MessageCircleQuestion,
  Home,
  LogOut,
  Construction,
  Database,
  UserCog,
  ShieldCheck,
  UserCheck,
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
    id: "epm.dashboard",
    title: "Dashboard",
    icon: LayoutDashboard,
    children: [
      { id: "epm.dashboard.overview", title: "Overview Dashboard", icon: LayoutDashboard, href: "/apps/epm" },
      { id: "epm.dashboard.live-status", title: "Live Status", icon: Radio, href: "/apps/epm/dashboard/live-status" },
      { id: "epm.dashboard.productivity-insights", title: "Productivity Insights", icon: TrendingUp, href: "/apps/epm/dashboard/productivity-insights" },
      { id: "epm.dashboard.ai-recommendations", title: "AI Recommendations", icon: Sparkles, href: "/apps/epm/dashboard/ai-recommendations" },
    ],
  },
  {
    id: "epm.monitoring",
    title: "Employee Monitoring",
    icon: Eye,
    children: [
      { id: "epm.monitoring.real-time-activity", title: "Real-Time Activity", icon: Activity, href: "/apps/epm/monitoring/real-time-activity" },
      { id: "epm.monitoring.process-usage-logs", title: "Process Usage Logs", icon: ListChecks, href: "/apps/epm/monitoring/process-usage-logs" },
      { id: "epm.monitoring.screen-device-state", title: "Screen State / Device State", icon: Monitor, href: "/apps/epm/monitoring/screen-device-state" },
    ],
  },
  {
    id: "epm.profiles",
    title: "Employee Profiles",
    icon: UserCircle,
    children: [
      { id: "epm.profiles.employee-list", title: "Employee List", icon: Users, href: "/apps/epm/profiles/employee-list" },
      {
        id: "epm.profiles.employee-detail",
        title: "Employee Detail View",
        icon: UserCheck,
        children: [
          { id: "epm.profiles.employee-detail.patterns", title: "Daily / Weekly / Monthly Patterns", icon: Calendar, href: "/apps/epm/profiles/patterns" },
          { id: "epm.profiles.employee-detail.ai-observations", title: "AI-Generated Observations", icon: Brain, href: "/apps/epm/profiles/ai-observations" },
        ],
      },
    ],
  },
  {
    id: "epm.reports",
    title: "Reports",
    icon: FileText,
    children: [
      { id: "epm.reports.productivity", title: "Productivity Reports", icon: BarChart3, href: "/apps/epm/reports/productivity" },
      { id: "epm.reports.app-usage", title: "App Usage Reports", icon: Layers, href: "/apps/epm/reports/app-usage" },
      { id: "epm.reports.activity-timeline", title: "Activity Timeline Reports", icon: Clock, href: "/apps/epm/reports/activity-timeline" },
      { id: "epm.reports.sleep-wake", title: "Sleep/Wake Reports", icon: Moon, href: "/apps/epm/reports/sleep-wake" },
      { id: "epm.reports.custom", title: "Custom Reports", icon: FileBarChart, href: "/apps/epm/reports/custom" },
    ],
  },
  {
    id: "epm.analytics",
    title: "Advanced Analytics",
    icon: LineChart,
    children: [
      { id: "epm.analytics.ai-scoring", title: "AI Productivity Scoring", icon: Gauge, href: "/apps/epm/analytics/ai-scoring" },
      { id: "epm.analytics.behavioral", title: "Behavioral Analytics", icon: Brain, href: "/apps/epm/analytics/behavioral" },
      { id: "epm.analytics.predictive", title: "Predictive Analytics", icon: TrendingUp, href: "/apps/epm/analytics/predictive" },
      { id: "epm.analytics.anomaly-detection", title: "Anomaly Detection", icon: Search, href: "/apps/epm/analytics/anomaly-detection" },
    ],
  },
  {
    id: "epm.integrations",
    title: "Integrations & API",
    icon: Plug,
    children: [
      { id: "epm.integrations.api-endpoints", title: "API Endpoints", icon: Webhook, href: "/apps/epm/integrations/api-endpoints" },
      { id: "epm.integrations.integration-setup", title: "Integration Setup", icon: Plug, href: "/apps/epm/integrations/integration-setup" },
      { id: "epm.integrations.api-documentation", title: "API Documentation (Swagger/OpenAPI)", icon: FileCode, href: "/apps/epm/integrations/api-documentation" },
    ],
  },
  {
    id: "epm.alerts",
    title: "Alerts & Notifications",
    icon: Bell,
    children: [
      { id: "epm.alerts.alert-rules", title: "Alert Rules", icon: BellRing, href: "/apps/epm/alerts/alert-rules" },
      { id: "epm.alerts.notification-history", title: "Notification History", icon: History, href: "/apps/epm/alerts/notification-history" },
    ],
  },
  {
    id: "epm.admin-settings",
    title: "Admin Settings",
    icon: Settings,
    children: [
      { id: "epm.admin-settings.app-categorization", title: "App Categorization", icon: Tags, href: "/apps/epm/admin-settings/app-categorization" },
      { id: "epm.admin-settings.system-configuration", title: "System Configuration", icon: Settings, href: "/apps/epm/admin-settings/system-configuration" },
      { id: "epm.admin-settings.device-agent", title: "Device Agent Settings", icon: Cpu, href: "/apps/epm/admin-settings/device-agent" },
    ],
  },
  {
    id: "epm.help",
    title: "Help & Support",
    icon: HelpCircle,
    children: [
      { id: "epm.help.documentation", title: "Documentation", icon: BookOpen, href: "/apps/epm/help/documentation" },
      { id: "epm.help.faqs", title: "FAQs", icon: MessageCircleQuestion, href: "/apps/epm/help/faqs" },
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
          { label: "Active Employees", value: "247", trend: "+12 today", icon: Users, color: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" },
          { label: "Avg Productivity", value: "78%", trend: "+5.2%", icon: TrendingUp, color: "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400" },
          { label: "Active Time", value: "6.5h", trend: "avg/day", icon: Clock, color: "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400" },
          { label: "Alerts", value: "3", trend: "pending", icon: Bell, color: "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400" },
        ].map((stat) => (
          <Card key={stat.label} data-testid={`card-stat-${stat.label.toLowerCase().replace(/\s+/g, '-')}`}>
            <CardContent className="p-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">{stat.label}</p>
                <h3 className="text-3xl font-bold" data-testid={`text-stat-value-${stat.label.toLowerCase().replace(/\s+/g, '-')}`}>{stat.value}</h3>
                <Badge variant="secondary" className="mt-1 text-xs">{stat.trend}</Badge>
              </div>
              <div className={`h-12 w-12 rounded-xl ${stat.color} flex items-center justify-center`}>
                <stat.icon className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Productivity Overview</CardTitle>
            <CardDescription>Team productivity trends over the last 7 days</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center bg-muted/20 rounded-md">
            <div className="text-center">
              <LineChart className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground">Productivity Graph Visualization</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Performers</CardTitle>
            <CardDescription>Highest productivity scores today</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4" data-testid={`row-employee-${i}`}>
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold">
                    {i}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">Employee {i}</p>
                    <div className="w-full h-2 bg-muted rounded-full mt-1 overflow-hidden">
                      <div className="h-full bg-primary transition-all" style={{ width: `${100 - i * 5}%` }} />
                    </div>
                  </div>
                  <span className="text-xs font-bold text-muted-foreground">{100 - i * 5}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Recent Alerts</CardTitle>
            <CardDescription>Latest system notifications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { type: "warning", message: "Low activity detected for 3 employees" },
                { type: "info", message: "Weekly report ready for review" },
                { type: "success", message: "Team productivity goal achieved" },
              ].map((alert, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50" data-testid={`alert-item-${i}`}>
                  <Bell className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{alert.message}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="justify-start gap-2" data-testid="button-generate-report">
                <FileText className="h-4 w-4" />
                Generate Report
              </Button>
              <Button variant="outline" className="justify-start gap-2" data-testid="button-view-employees">
                <Users className="h-4 w-4" />
                View Employees
              </Button>
              <Button variant="outline" className="justify-start gap-2" data-testid="button-configure-alerts">
                <BellRing className="h-4 w-4" />
                Configure Alerts
              </Button>
              <Button variant="outline" className="justify-start gap-2" data-testid="button-ai-insights">
                <Sparkles className="h-4 w-4" />
                AI Insights
              </Button>
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
  if (path === '/apps/epm') return 'Overview Dashboard';
  
  const findMenuItem = (items: MenuItem[]): string | null => {
    for (const item of items) {
      if (item.href === path) {
        return item.title;
      }
      if (item.children) {
        const found = findMenuItem(item.children);
        if (found) return found;
      }
    }
    return null;
  };
  
  return findMenuItem(menuItems) || 'Page';
}

export default function EPM() {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const { hasPermission, isAdmin, permissions } = useRBAC();
  const userInitials = user?.username.slice(0, 2).toUpperCase() || "U";
  
  if (!isAdmin && !hasAppAccess(permissions, "epm")) {
    return <AccessDenied appName="Employee Productivity Management" />;
  }
  
  const isDashboard = location === "/apps/epm";
  const pageTitle = getPageTitle(location);

  const excludedParentPermissions = ['epm', 'epm.access', 'epm.dashboard'];
  
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
        if (item.id === "epm.dashboard") return item;
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
                E
              </div>
              <span className="font-bold text-lg tracking-tight">EPM</span>
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
