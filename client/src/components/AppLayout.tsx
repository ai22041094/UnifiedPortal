import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Package,
  HeadphonesIcon,
  BarChart3,
  Home,
  Settings,
  LogOut,
  Users,
  Shield,
  AlertTriangle,
  ClipboardCheck,
  BookOpen,
  Timer,
  Search,
  RefreshCw,
  FolderKanban,
  MessagesSquare,
  Laptop,
  ChevronDown,
  ChevronRight,
  PlusCircle,
  ListChecks,
  UserCircle,
  FileText,
  MessageCircleQuestion,
  Activity,
  Target,
  Calendar,
  CheckCircle,
  TrendingUp,
  History,
  Link2,
  Tags,
  Workflow,
  Zap,
  Mail,
  Bell,
  LucideIcon,
  Database,
  UserCheck,
  Cog,
  Building2,
  MapPin,
  Briefcase,
  Key,
  Monitor,
  MessageSquare,
  GitBranch,
  Clock,
  Palmtree,
  Image,
  FileCheck,
  Layers,
  SquareStack,
  SquareCheck,
  UserPlus,
  Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { useRBAC } from "@/lib/rbac";
import ProfileDropdown from "@/components/ProfileDropdown";
import NotificationBell from "@/components/NotificationBell";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useState } from "react";

interface AppLayoutProps {
  children: ReactNode;
  title: string;
  appName: string;
}

interface NavItem {
  id: string;
  icon: LucideIcon;
  label: string;
  href?: string;
  children?: NavItem[];
}

const masterItems = [
  { id: "user-master", icon: Users, label: "User Master", href: "/admin/users", permission: "admin.user-master" },
  { id: "role-master", icon: Shield, label: "Role Master", href: "/admin/roles", permission: "admin.role-master" },
];

const dashboardsNavItems: NavItem[] = [
  { id: "overview", icon: LayoutDashboard, label: "Overview Dashboard", href: "/dashboards/overview" },
  { id: "cio", icon: Activity, label: "CIO View", href: "/dashboards/cio" },
  { id: "cfo", icon: BarChart3, label: "CFO View", href: "/dashboards/cfo" },
  { id: "coo", icon: TrendingUp, label: "COO View", href: "/dashboards/coo" },
  { id: "productivity", icon: Zap, label: "Productivity Dashboard", href: "/dashboards/productivity" },
];

const serviceDeskNavItems: NavItem[] = [
  { id: "dashboard", icon: LayoutDashboard, label: "Dashboard", href: "/apps/service-desk" },
  {
    id: "dashboards",
    icon: BarChart3,
    label: "Executive Dashboards",
    children: [
      { id: "dashboards-overview", icon: LayoutDashboard, label: "Overview Dashboard", href: "/dashboards/overview" },
      { id: "dashboards-cio", icon: Activity, label: "CIO View", href: "/dashboards/cio" },
      { id: "dashboards-cfo", icon: BarChart3, label: "CFO View", href: "/dashboards/cfo" },
      { id: "dashboards-coo", icon: TrendingUp, label: "COO View", href: "/dashboards/coo" },
      { id: "dashboards-productivity", icon: Zap, label: "Productivity Dashboard", href: "/dashboards/productivity" },
    ]
  },
  {
    id: "masters",
    icon: Database,
    label: "Masters",
    children: [
      { id: "masters-user", icon: Users, label: "User Master", href: "/admin/users" },
      { id: "masters-role", icon: Shield, label: "Role Master", href: "/admin/roles" },
    ]
  },
  { 
    id: "incidents", 
    icon: AlertTriangle, 
    label: "Incident Management",
    children: [
      { id: "incidents-create", icon: PlusCircle, label: "Create Incident", href: "/apps/service-desk/incidents/create" },
      { id: "incidents-list", icon: ListChecks, label: "All Incidents", href: "/apps/service-desk/incidents/list" },
      { id: "incidents-my", icon: UserCircle, label: "My Incidents", href: "/apps/service-desk/incidents/my-incidents" },
      { id: "incidents-critical", icon: AlertTriangle, label: "Critical Incidents", href: "/apps/service-desk/incidents/critical" },
    ]
  },
  { 
    id: "requests", 
    icon: ClipboardCheck, 
    label: "Service Requests",
    children: [
      { id: "requests-create", icon: PlusCircle, label: "New Request", href: "/apps/service-desk/requests/create" },
      { id: "requests-list", icon: ListChecks, label: "All Requests", href: "/apps/service-desk/requests/list" },
      { id: "requests-my", icon: UserCircle, label: "My Requests", href: "/apps/service-desk/requests/my-requests" },
      { id: "requests-approvals", icon: CheckCircle, label: "Pending Approvals", href: "/apps/service-desk/requests/approvals" },
    ]
  },
  { 
    id: "problems", 
    icon: Search, 
    label: "Problem Management",
    children: [
      { id: "problems-create", icon: PlusCircle, label: "Create Problem", href: "/apps/service-desk/problems/create" },
      { id: "problems-list", icon: ListChecks, label: "All Problems", href: "/apps/service-desk/problems/list" },
      { id: "problems-root-cause", icon: Target, label: "Root Cause Analysis", href: "/apps/service-desk/problems/root-cause" },
      { id: "problems-known-errors", icon: AlertTriangle, label: "Known Errors", href: "/apps/service-desk/problems/known-errors" },
    ]
  },
  { 
    id: "changes", 
    icon: RefreshCw, 
    label: "Change Management",
    children: [
      { id: "changes-create", icon: PlusCircle, label: "Create Change", href: "/apps/service-desk/changes/create" },
      { id: "changes-list", icon: ListChecks, label: "All Changes", href: "/apps/service-desk/changes/list" },
      { id: "changes-calendar", icon: Calendar, label: "Change Calendar", href: "/apps/service-desk/changes/calendar" },
      { id: "changes-approvals", icon: CheckCircle, label: "Change Approvals", href: "/apps/service-desk/changes/approvals" },
    ]
  },
  { 
    id: "queue", 
    icon: FolderKanban, 
    label: "Queue Management",
    children: [
      { id: "queue-my", icon: UserCircle, label: "My Queue", href: "/apps/service-desk/queue/my-queue" },
      { id: "queue-unassigned", icon: ListChecks, label: "Unassigned Tickets", href: "/apps/service-desk/queue/unassigned" },
      { id: "queue-escalations", icon: TrendingUp, label: "Escalations", href: "/apps/service-desk/queue/escalations" },
      { id: "queue-team", icon: Users, label: "Team Workload", href: "/apps/service-desk/queue/team-workload" },
    ]
  },
  { 
    id: "knowledge", 
    icon: BookOpen, 
    label: "Knowledge Base",
    children: [
      { id: "knowledge-articles", icon: FileText, label: "Articles", href: "/apps/service-desk/knowledge/articles" },
      { id: "knowledge-faqs", icon: MessageCircleQuestion, label: "FAQs", href: "/apps/service-desk/knowledge/faqs" },
      { id: "knowledge-search", icon: Search, label: "Search", href: "/apps/service-desk/knowledge/search" },
    ]
  },
  { 
    id: "sla", 
    icon: Timer, 
    label: "SLA Management",
    children: [
      { id: "sla-policies", icon: FileText, label: "SLA Policies", href: "/apps/service-desk/sla/policies" },
      { id: "sla-monitoring", icon: Activity, label: "SLA Monitoring", href: "/apps/service-desk/sla/monitoring" },
      { id: "sla-reports", icon: BarChart3, label: "SLA Reports", href: "/apps/service-desk/sla/reports" },
    ]
  },
  { 
    id: "chat", 
    icon: MessagesSquare, 
    label: "Live Chat",
    children: [
      { id: "chat-active", icon: MessagesSquare, label: "Active Chats", href: "/apps/service-desk/chat/active" },
      { id: "chat-history", icon: History, label: "Chat History", href: "/apps/service-desk/chat/history" },
      { id: "chat-canned", icon: FileText, label: "Canned Responses", href: "/apps/service-desk/chat/canned-responses" },
    ]
  },
  { 
    id: "assets", 
    icon: Laptop, 
    label: "Asset Integration",
    children: [
      { id: "assets-link", icon: Link2, label: "Link Assets", href: "/apps/service-desk/assets/link" },
      { id: "assets-affected", icon: Package, label: "Affected Assets", href: "/apps/service-desk/assets/affected" },
    ]
  },
  { 
    id: "reports", 
    icon: BarChart3, 
    label: "Reports",
    children: [
      { id: "reports-incidents", icon: FileText, label: "Incident Reports", href: "/apps/service-desk/reports/incidents" },
      { id: "reports-performance", icon: TrendingUp, label: "Performance Reports", href: "/apps/service-desk/reports/performance" },
      { id: "reports-trends", icon: BarChart3, label: "Trend Analysis", href: "/apps/service-desk/reports/trends" },
    ]
  },
  { 
    id: "settings", 
    icon: Settings, 
    label: "Settings",
    children: [
      { id: "settings-general", icon: Settings, label: "General Settings", href: "/apps/service-desk/settings/general" },
      { id: "settings-categories", icon: Tags, label: "Categories", href: "/apps/service-desk/settings/categories" },
      { id: "settings-priorities", icon: Zap, label: "Priority Levels", href: "/apps/service-desk/settings/priorities" },
      { id: "settings-workflows", icon: Workflow, label: "Workflows", href: "/apps/service-desk/settings/workflows" },
      { id: "settings-escalation", icon: TrendingUp, label: "Escalation Rules", href: "/apps/service-desk/settings/escalation-rules" },
      { id: "settings-email", icon: Mail, label: "Email Templates", href: "/apps/service-desk/settings/email-templates" },
      { id: "settings-notifications", icon: Bell, label: "Notifications", href: "/apps/service-desk/settings/notifications" },
    ]
  },
  {
    id: "approval-config",
    icon: CheckCircle,
    label: "Approval Configuration",
    children: [
      { id: "approval-mapping", icon: GitBranch, label: "Approval Mapping", href: "/apps/service-desk/approval-config/mapping" },
      { id: "cab-approval", icon: Users, label: "CAB Approval", href: "/apps/service-desk/approval-config/cab" },
    ]
  },
  {
    id: "raw-config",
    icon: Cog,
    label: "RAW Configuration",
    children: [
      { id: "raw-category", icon: Tags, label: "Add Category", href: "/apps/service-desk/raw-config/category" },
      { id: "raw-change-type", icon: RefreshCw, label: "Add Change Type", href: "/apps/service-desk/raw-config/change-type" },
      { id: "raw-desk-template", icon: FileText, label: "Add Desk Template", href: "/apps/service-desk/raw-config/desk-template" },
      { id: "raw-email-config", icon: Mail, label: "Add Email Config", href: "/apps/service-desk/raw-config/email-config" },
      { id: "raw-escalation-matrix", icon: TrendingUp, label: "Add Escalation Matrix", href: "/apps/service-desk/raw-config/escalation-matrix" },
      { id: "raw-org-logo", icon: Image, label: "Add Org Logo", href: "/apps/service-desk/raw-config/org-logo" },
      { id: "raw-priority", icon: Zap, label: "Add Priority", href: "/apps/service-desk/raw-config/priority" },
      { id: "raw-reason-change", icon: FileCheck, label: "Add Reason For Change", href: "/apps/service-desk/raw-config/reason-change" },
      { id: "raw-requester", icon: UserPlus, label: "Add Requester", href: "/apps/service-desk/raw-config/requester" },
      { id: "raw-resolution", icon: SquareCheck, label: "Add Resolution", href: "/apps/service-desk/raw-config/resolution" },
      { id: "raw-severity", icon: AlertTriangle, label: "Add Severity", href: "/apps/service-desk/raw-config/severity" },
      { id: "raw-sla", icon: Timer, label: "Add SLA", href: "/apps/service-desk/raw-config/sla" },
      { id: "raw-stage", icon: Layers, label: "Add Stage", href: "/apps/service-desk/raw-config/stage" },
      { id: "raw-status", icon: Activity, label: "Add Status", href: "/apps/service-desk/raw-config/status" },
      { id: "raw-sr-change-approver", icon: UserCheck, label: "SR & Change Approver", href: "/apps/service-desk/raw-config/sr-change-approver" },
    ]
  },
  {
    id: "administration",
    icon: Briefcase,
    label: "Administration",
    children: [
      { id: "admin-accounts", icon: Users, label: "Accounts", href: "/apps/service-desk/administration/accounts" },
      { id: "admin-custom-field-values", icon: SquareStack, label: "Add Custom Field Values", href: "/apps/service-desk/administration/custom-field-values" },
      { id: "admin-custom-fields", icon: PlusCircle, label: "Add Custom Fields", href: "/apps/service-desk/administration/custom-fields" },
      { id: "admin-department", icon: Building2, label: "Add Department", href: "/apps/service-desk/administration/department" },
      { id: "admin-location", icon: MapPin, label: "Add Location", href: "/apps/service-desk/administration/location" },
      { id: "admin-organization", icon: Building2, label: "Add Organization", href: "/apps/service-desk/administration/organization" },
      { id: "admin-assignment-group", icon: Users, label: "Assignment Group", href: "/apps/service-desk/administration/assignment-group" },
      { id: "admin-available-licence", icon: Key, label: "Available Licence", href: "/apps/service-desk/administration/available-licence" },
      { id: "admin-configured-desk", icon: Monitor, label: "Configured Desk", href: "/apps/service-desk/administration/configured-desk" },
      { id: "admin-desk-config", icon: Settings, label: "Desk Configuration", href: "/apps/service-desk/administration/desk-config" },
      { id: "admin-email-template", icon: Mail, label: "Email Template", href: "/apps/service-desk/administration/email-template" },
      { id: "admin-engineer-pool", icon: Wrench, label: "Engineer Pool", href: "/apps/service-desk/administration/engineer-pool" },
      { id: "admin-feedback-config", icon: MessageSquare, label: "FeedBack Configuration", href: "/apps/service-desk/administration/feedback-config" },
      { id: "admin-flow-chart", icon: GitBranch, label: "Flow Chart", href: "/apps/service-desk/administration/flow-chart" },
    ]
  },
  {
    id: "coverage-schedules",
    icon: Calendar,
    label: "Coverage Schedules",
    children: [
      { id: "coverage-add-leave", icon: Palmtree, label: "Add Leave", href: "/apps/service-desk/coverage/add-leave" },
      { id: "coverage-holidays", icon: Calendar, label: "Holidays", href: "/apps/service-desk/coverage/holidays" },
      { id: "coverage-operational-hours", icon: Clock, label: "Operational Hours", href: "/apps/service-desk/coverage/operational-hours" },
    ]
  },
];

const defaultNavItems: NavItem[] = [
  { id: "dashboard", icon: Home, label: "Dashboard", href: "#" },
  { id: "projects", icon: LayoutDashboard, label: "Projects", href: "#" },
  { id: "assets", icon: Package, label: "Assets", href: "#" },
  { id: "settings", icon: Settings, label: "Settings", href: "#" },
];

function NavMenuItem({ item, location }: { item: NavItem; location: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const hasChildren = item.children && item.children.length > 0;
  const isActive = item.href === location || item.children?.some(child => child.href === location);

  if (hasChildren) {
    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button
            variant={isActive ? "secondary" : "ghost"}
            className={cn(
              "w-full justify-between gap-3 text-muted-foreground hover:text-foreground",
              isActive && "text-primary font-medium"
            )}
            data-testid={`nav-${item.id}`}
          >
            <span className="flex items-center gap-3">
              <item.icon className="h-4 w-4" />
              {item.label}
            </span>
            {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="pl-4 space-y-1 mt-1">
          {item.children?.map((child) => (
            <Button
              key={child.id}
              variant={location === child.href ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start gap-3 text-muted-foreground hover:text-foreground text-sm",
                location === child.href && "text-primary font-medium"
              )}
              asChild
              data-testid={`nav-${child.id}`}
            >
              <Link href={child.href || "#"}>
                <child.icon className="h-3 w-3" />
                {child.label}
              </Link>
            </Button>
          ))}
        </CollapsibleContent>
      </Collapsible>
    );
  }

  return (
    <Button
      variant={location === item.href ? "secondary" : "ghost"}
      className={cn(
        "w-full justify-start gap-3 text-muted-foreground hover:text-foreground",
        location === item.href && "text-primary font-medium"
      )}
      asChild
      data-testid={`nav-${item.id}`}
    >
      <Link href={item.href || "#"}>
        <item.icon className="h-4 w-4" />
        {item.label}
      </Link>
    </Button>
  );
}

export default function AppLayout({ children, title, appName }: AppLayoutProps) {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const { hasPermission, isAdmin } = useRBAC();

  const navItems = appName === "Service Desk" ? serviceDeskNavItems : 
                   appName === "Dashboards" ? serviceDeskNavItems : defaultNavItems;

  const userInitials = user?.username.slice(0, 2).toUpperCase() || "U";
  
  const showMasterSection = isAdmin || hasPermission("admin.user-master") || hasPermission("admin.role-master");
  const filteredMasterItems = masterItems.filter((item) => {
    if (isAdmin) return true;
    return hasPermission(item.permission);
  });

  return (
    <div className="h-screen bg-background flex overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border flex flex-col fixed inset-y-0 z-50">
        <div className="p-6 flex items-center gap-2 border-b border-border/50">
          <div className="h-8 w-8 rounded bg-primary flex items-center justify-center text-primary-foreground font-bold">
            {appName.charAt(0)}
          </div>
          <span className="font-bold text-lg tracking-tight">{appName}</span>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavMenuItem key={item.id} item={item} location={location} />
          ))}
        </nav>

        <div className="p-4 border-t border-border/50 space-y-2">
          <Button variant="ghost" className="w-full justify-start gap-3" asChild>
            <Link href="/portal">
              <Home className="h-4 w-4" />
              Back to Portal
            </Link>
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-destructive hover:text-destructive/80 hover:bg-destructive/10"
            onClick={logout}
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 flex flex-col h-full overflow-hidden">
        <header className="h-16 border-b border-border/50 bg-background/80 backdrop-blur-sm flex-none top-0 z-40 px-8 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-foreground">{title}</h1>
          
          <div className="flex items-center gap-4">
            <NotificationBell />
            <ProfileDropdown />
          </div>
        </header>

        <div className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
