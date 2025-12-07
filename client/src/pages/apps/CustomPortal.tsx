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
  Key,
  CheckCircle,
  FileText,
  RefreshCw,
  ShieldCheck,
  ClipboardList,
  PlusCircle,
  UserCircle,
  History,
  Wallet,
  PieChart,
  DollarSign,
  BarChart3,
  Building2,
  ListChecks,
  TrendingUp,
  Activity,
  LineChart,
  FileBarChart,
  Settings,
  Tags,
  Bell,
  Home,
  LogOut,
  Construction,
  Database,
  UserCog,
  Workflow,
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
    id: "portal.dashboard",
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/apps/custom-portal",
  },
  {
    id: "portal.masters",
    title: "Masters",
    icon: Database,
    children: [
      { id: "portal.masters.user-master", title: "User Master", icon: UserCog, href: "/admin/users" },
      { id: "portal.masters.role-master", title: "Role Master", icon: ShieldCheck, href: "/admin/roles" },
    ],
  },
  {
    id: "portal.licenses",
    title: "License Management",
    icon: Key,
    children: [
      { id: "portal.licenses.active", title: "Active Licenses", icon: CheckCircle, href: "/apps/custom-portal/licenses/active" },
      { id: "portal.licenses.requests", title: "License Requests", icon: FileText, href: "/apps/custom-portal/licenses/requests" },
      { id: "portal.licenses.renewals", title: "Renewals", icon: RefreshCw, href: "/apps/custom-portal/licenses/renewals" },
      { id: "portal.licenses.compliance", title: "Compliance", icon: ShieldCheck, href: "/apps/custom-portal/licenses/compliance" },
    ],
  },
  {
    id: "portal.requisitions",
    title: "Requisitions",
    icon: ClipboardList,
    children: [
      { id: "portal.requisitions.new", title: "New Requisition", icon: PlusCircle, href: "/apps/custom-portal/requisitions/new" },
      { id: "portal.requisitions.my-requests", title: "My Requests", icon: UserCircle, href: "/apps/custom-portal/requisitions/my-requests" },
      { id: "portal.requisitions.approvals", title: "Pending Approvals", icon: CheckCircle, href: "/apps/custom-portal/requisitions/approvals" },
      { id: "portal.requisitions.history", title: "History", icon: History, href: "/apps/custom-portal/requisitions/history" },
    ],
  },
  {
    id: "portal.spend",
    title: "Spend Management",
    icon: Wallet,
    children: [
      { id: "portal.spend.overview", title: "Spend Overview", icon: PieChart, href: "/apps/custom-portal/spend/overview" },
      { id: "portal.spend.budgets", title: "Budgets", icon: DollarSign, href: "/apps/custom-portal/spend/budgets" },
      { id: "portal.spend.reports", title: "Spend Reports", icon: BarChart3, href: "/apps/custom-portal/spend/reports" },
    ],
  },
  {
    id: "portal.vendors",
    title: "Vendor Management",
    icon: Building2,
    children: [
      { id: "portal.vendors.list", title: "Vendor List", icon: ListChecks, href: "/apps/custom-portal/vendors/list" },
      { id: "portal.vendors.contracts", title: "Contracts", icon: FileText, href: "/apps/custom-portal/vendors/contracts" },
      { id: "portal.vendors.performance", title: "Performance", icon: TrendingUp, href: "/apps/custom-portal/vendors/performance" },
    ],
  },
  {
    id: "portal.reports",
    title: "Reports",
    icon: BarChart3,
    children: [
      { id: "portal.reports.usage", title: "Usage Reports", icon: Activity, href: "/apps/custom-portal/reports/usage" },
      { id: "portal.reports.cost-analysis", title: "Cost Analysis", icon: LineChart, href: "/apps/custom-portal/reports/cost-analysis" },
      { id: "portal.reports.custom", title: "Custom Reports", icon: FileBarChart, href: "/apps/custom-portal/reports/custom" },
    ],
  },
  {
    id: "portal.settings",
    title: "Settings",
    icon: Settings,
    children: [
      { id: "portal.settings.general", title: "General Settings", icon: Settings, href: "/apps/custom-portal/settings/general" },
      { id: "portal.settings.categories", title: "Categories", icon: Tags, href: "/apps/custom-portal/settings/categories" },
      { id: "portal.settings.workflows", title: "Approval Workflows", icon: Workflow, href: "/apps/custom-portal/settings/workflows" },
      { id: "portal.settings.notifications", title: "Notifications", icon: Bell, href: "/apps/custom-portal/settings/notifications" },
    ],
  },
];

function PageComingSoon({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
      <div className="text-center space-y-4">
        <div className="h-20 w-20 mx-auto rounded-full bg-muted flex items-center justify-center">
          <Construction className="h-10 w-10 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-semibold text-foreground">{title}</h2>
        <p className="text-muted-foreground max-w-md">
          This page is coming soon. We're working hard to bring you this feature.
        </p>
      </div>
    </div>
  );
}

function DashboardContent() {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card data-testid="card-stat-licenses">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Licenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" data-testid="text-count-licenses">1,248</div>
            <p className="text-xs text-green-500 dark:text-green-400 mt-1">+12% from last month</p>
          </CardContent>
        </Card>
        <Card data-testid="card-stat-requests">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" data-testid="text-count-requests">42</div>
            <p className="text-xs text-yellow-500 dark:text-yellow-400 mt-1">Requires attention</p>
          </CardContent>
        </Card>
        <Card data-testid="card-stat-spend">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Spend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" data-testid="text-count-spend">$48.2k</div>
            <p className="text-xs text-muted-foreground mt-1">Current fiscal year</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <h2 className="text-lg font-semibold">Recent Requisitions</h2>
        <Button data-testid="button-new-requisition">
          <PlusCircle className="h-4 w-4 mr-2" />
          New Requisition
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {[
              { id: 1001, name: "Software License Request - Adobe CC", requester: "John Doe", time: "2 hours ago", status: "Pending Approval" },
              { id: 1002, name: "Hardware Request - MacBook Pro", requester: "Jane Smith", time: "5 hours ago", status: "Approved" },
              { id: 1003, name: "Software License Request - Figma", requester: "Mike Johnson", time: "1 day ago", status: "Pending Approval" },
              { id: 1004, name: "Cloud Service - AWS Credits", requester: "Sarah Wilson", time: "2 days ago", status: "In Review" },
              { id: 1005, name: "Software License Request - Slack", requester: "Tom Brown", time: "3 days ago", status: "Completed" },
            ].map((item) => (
              <div key={item.id} className="p-4 flex flex-wrap items-center justify-between gap-4 hover:bg-muted/50 transition-colors" data-testid={`row-requisition-${item.id}`}>
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                    #{item.id}
                  </div>
                  <div>
                    <h3 className="font-medium">{item.name}</h3>
                    <p className="text-sm text-muted-foreground">Requested by {item.requester} - {item.time}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={cn(
                    "px-3 py-1 rounded-full text-xs font-medium",
                    item.status === "Pending Approval" && "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300",
                    item.status === "Approved" && "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300",
                    item.status === "In Review" && "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300",
                    item.status === "Completed" && "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300",
                  )}>
                    {item.status}
                  </span>
                  <Button variant="outline" size="sm" data-testid={`button-view-${item.id}`}>View</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
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
  if (path === '/apps/custom-portal') return 'Dashboard';
  
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

export default function CustomPortal() {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const { hasPermission, isAdmin, permissions } = useRBAC();
  const userInitials = user?.username.slice(0, 2).toUpperCase() || "U";
  
  if (!isAdmin && !hasAppAccess(permissions, "portal")) {
    return <AccessDenied appName="Custom Portal" />;
  }
  
  const isDashboard = location === "/apps/custom-portal";
  const pageTitle = getPageTitle(location);

  const excludedParentPermissions = ['portal', 'portal.access', 'portal.dashboard'];
  
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
        if (item.id === "portal.dashboard") return item;
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
                P
              </div>
              <span className="font-bold text-lg tracking-tight">Portal</span>
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
                <PageComingSoon title={pageTitle} />
              )}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
