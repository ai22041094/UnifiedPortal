import { useState, useMemo } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { useRBAC } from "@/lib/rbac";
import { cn } from "@/lib/utils";
import { hasAppAccess } from "@/lib/menu-config";
import AccessDenied from "@/components/AccessDenied";
import ProfileDropdown from "@/components/ProfileDropdown";
import NotificationBell from "@/components/NotificationBell";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
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
  Plus,
  Copy,
  Download,
  Trash2,
  Key,
  Code,
  CheckCircle2,
  AlertCircle,
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
      { id: "epm.integrations.api-keys", title: "API Keys", icon: Key, href: "/apps/epm/integrations/api-keys" },
      { id: "epm.integrations.api-endpoints", title: "Ingested Data", icon: Database, href: "/apps/epm/integrations/api-endpoints" },
      { id: "epm.integrations.integration-setup", title: "Integration Setup", icon: Plug, href: "/apps/epm/integrations/integration-setup" },
      { id: "epm.integrations.api-documentation", title: "API Documentation", icon: FileCode, href: "/apps/epm/integrations/api-documentation" },
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

interface DashboardStatsData {
  activeEmployees: number;
  activeEmployeesToday: number;
  avgProductivity: number;
  productivityTrend: number;
  activeTimeHours: number;
  activeTimeTrend: number;
  alerts: number;
  topPerformers: { agentGuid: string; productivityScore: number; activeHours: number }[];
  weeklyTrends: { day: string; productivity: number; activeHours: number }[];
}

function DashboardContent() {
  const [, navigate] = useLocation();
  const { data: stats, isLoading } = useQuery<DashboardStatsData>({
    queryKey: ["/api/epm/dashboard-stats"],
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const statCards = [
    { 
      label: "Active Employees", 
      value: stats?.activeEmployees?.toString() || "0", 
      trend: `+${stats?.activeEmployeesToday || 0} today`, 
      icon: Users, 
      color: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" 
    },
    { 
      label: "Avg Productivity", 
      value: `${stats?.avgProductivity || 0}%`, 
      trend: `${stats?.productivityTrend && stats.productivityTrend >= 0 ? '+' : ''}${stats?.productivityTrend || 0}%`, 
      icon: TrendingUp, 
      color: "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400" 
    },
    { 
      label: "Active Time", 
      value: `${stats?.activeTimeHours || 0}h`, 
      trend: "avg/day", 
      icon: Clock, 
      color: "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400" 
    },
    { 
      label: "Alerts", 
      value: stats?.alerts?.toString() || "0", 
      trend: "pending", 
      icon: Bell, 
      color: "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400" 
    },
  ];

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat) => (
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
          <CardContent>
            <div className="space-y-4">
              {stats?.weeklyTrends?.map((day) => (
                <div key={day.day} className="space-y-2">
                  <div className="flex items-center justify-between gap-4">
                    <span className="font-medium text-sm w-12">{day.day}</span>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Active: {day.activeHours}h</span>
                      <span>Productivity: {day.productivity}%</span>
                    </div>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary transition-all" style={{ width: `${day.productivity}%` }} />
                  </div>
                </div>
              ))}
              {(!stats?.weeklyTrends || stats.weeklyTrends.length === 0) && (
                <div className="text-center py-8 text-muted-foreground">
                  <LineChart className="h-12 w-12 mx-auto mb-2" />
                  <p>No productivity data available yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Performers</CardTitle>
            <CardDescription>Highest productivity scores this week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.topPerformers?.map((performer, i) => (
                <div key={performer.agentGuid} className="flex items-center gap-4" data-testid={`row-employee-${i + 1}`}>
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">Agent {performer.agentGuid.slice(0, 8)}...</p>
                    <div className="w-full h-2 bg-muted rounded-full mt-1 overflow-hidden">
                      <div className="h-full bg-primary transition-all" style={{ width: `${performer.productivityScore}%` }} />
                    </div>
                  </div>
                  <span className="text-xs font-bold text-muted-foreground">{performer.productivityScore}%</span>
                </div>
              ))}
              {(!stats?.topPerformers || stats.topPerformers.length === 0) && (
                <div className="text-center py-4 text-muted-foreground text-sm">
                  No performance data available yet
                </div>
              )}
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
              {stats?.alerts && stats.alerts > 0 ? (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50" data-testid="alert-item-0">
                  <Bell className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{stats.alerts} device(s) with extended sleep duration detected</span>
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground text-sm">
                  No alerts at this time
                </div>
              )}
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
              <Button variant="outline" className="justify-start gap-2" onClick={() => navigate("/apps/epm/reports/productivity")} data-testid="button-generate-report">
                <FileText className="h-4 w-4" />
                Generate Report
              </Button>
              <Button variant="outline" className="justify-start gap-2" onClick={() => navigate("/apps/epm/profiles/employee-list")} data-testid="button-view-employees">
                <Users className="h-4 w-4" />
                View Employees
              </Button>
              <Button variant="outline" className="justify-start gap-2" onClick={() => navigate("/apps/epm/alerts/alert-rules")} data-testid="button-configure-alerts">
                <BellRing className="h-4 w-4" />
                Configure Alerts
              </Button>
              <Button variant="outline" className="justify-start gap-2" onClick={() => navigate("/apps/epm/dashboard/ai-recommendations")} data-testid="button-ai-insights">
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

interface ApiKeyData {
  id: string;
  name: string;
  lastFour: string;
  createdAt: string;
  lastUsedAt: string | null;
  expiresAt: string | null;
}

const createApiKeySchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
});

interface PublicOrgSettings {
  organizationName: string;
  logoUrl: string | null;
  tagline: string | null;
  copyrightText: string | null;
}

function ApiKeysContent() {
  const { toast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newKeyData, setNewKeyData] = useState<{ key: string; name: string } | null>(null);

  const form = useForm<z.infer<typeof createApiKeySchema>>({
    resolver: zodResolver(createApiKeySchema),
    defaultValues: { name: "" },
  });

  const { data: orgSettings } = useQuery<PublicOrgSettings>({
    queryKey: ["/api/organization/public"],
  });

  const organizationName = orgSettings?.organizationName || "pcvisor";

  const { data: apiKeys, isLoading } = useQuery<ApiKeyData[]>({
    queryKey: ["/api/epm/api-keys"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: { name: string }) => {
      const res = await apiRequest("POST", "/api/epm/api-keys", data);
      return res.json();
    },
    onSuccess: (data) => {
      setNewKeyData({ key: data.key, name: data.name });
      queryClient.invalidateQueries({ queryKey: ["/api/epm/api-keys"] });
      form.reset();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create API key", variant: "destructive" });
    },
  });

  const revokeMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/epm/api-keys/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/epm/api-keys"] });
      toast({ title: "Success", description: "API key revoked successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to revoke API key", variant: "destructive" });
    },
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied", description: "API key copied to clipboard" });
  };

  const downloadKey = (key: string, name: string) => {
    const orgNameSlug = organizationName.toLowerCase().replace(/\s+/g, "-");
    const blob = new Blob([`API Key Name: ${name}\nAPI Key: ${key}\n\nKeep this key secure. It will not be shown again.`], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${orgNameSlug}-api-key-${name.toLowerCase().replace(/\s+/g, "-")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const onSubmit = (data: z.infer<typeof createApiKeySchema>) => {
    createMutation.mutate(data);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">API Keys</h2>
          <p className="text-muted-foreground">Manage API keys for external integrations</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={(open) => { setIsCreateOpen(open); if (!open) setNewKeyData(null); }}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-api-key">
              <Plus className="h-4 w-4 mr-2" />
              Create API Key
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{newKeyData ? "API Key Created" : "Create New API Key"}</DialogTitle>
              <DialogDescription>
                {newKeyData ? "Save this key securely. It will not be shown again." : "Enter a name to identify this API key."}
              </DialogDescription>
            </DialogHeader>
            {newKeyData ? (
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm font-medium mb-2">Your API Key:</p>
                  <code className="text-xs break-all block bg-background p-2 rounded" data-testid="text-new-api-key">{newKeyData.key}</code>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => copyToClipboard(newKeyData.key)} className="flex-1" data-testid="button-copy-api-key">
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                  <Button onClick={() => downloadKey(newKeyData.key, newKeyData.name)} variant="outline" className="flex-1" data-testid="button-download-api-key">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
                <Button onClick={() => { setIsCreateOpen(false); setNewKeyData(null); }} variant="secondary" className="w-full">
                  Done
                </Button>
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Key Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Production Agent" {...field} data-testid="input-api-key-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={createMutation.isPending} data-testid="button-submit-create-key">
                    {createMutation.isPending ? "Creating..." : "Create Key"}
                  </Button>
                </form>
              </Form>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : !apiKeys?.length ? (
            <div className="p-12 text-center">
              <Key className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No API Keys</h3>
              <p className="text-muted-foreground">Create your first API key to get started with external integrations.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Key</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Last Used</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {apiKeys.map((key) => (
                  <TableRow key={key.id} data-testid={`row-api-key-${key.id}`}>
                    <TableCell className="font-medium">{key.name}</TableCell>
                    <TableCell><code className="text-xs bg-muted px-2 py-1 rounded">pcv_...{key.lastFour}</code></TableCell>
                    <TableCell>{format(new Date(key.createdAt), "MMM d, yyyy")}</TableCell>
                    <TableCell>{key.lastUsedAt ? format(new Date(key.lastUsedAt), "MMM d, yyyy HH:mm") : "Never"}</TableCell>
                    <TableCell className="text-right">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" data-testid={`button-revoke-key-${key.id}`}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Revoke API Key?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently revoke the API key "{key.name}". Any integrations using this key will stop working.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => revokeMutation.mutate(key.id)}>Revoke</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

interface ProcessDetailsData {
  id: number;
  taskGuid: string;
  agentGuid: string | null;
  processId: string | null;
  processName: string | null;
  mainWindowTitle: string | null;
  startTime: string | null;
  eventDt: string | null;
  idleStatus: boolean | null;
  urlName: string | null;
  urlDomain: string | null;
  lapsedTime: string | null;
  tag1: string | null;
  tag2: string | null;
}

interface SleepEventData {
  id: number;
  agentGuid: string;
  wakeTime: string;
  sleepTime: string;
  duration: string;
  reason: string | null;
  uploadStatus: string | null;
}

function ProcessDetailsTab() {
  const { data: processDetails, isLoading } = useQuery<ProcessDetailsData[]>({
    queryKey: ["/api/epm/process-details"],
  });

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        {[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
      </div>
    );
  }

  if (!processDetails?.length) {
    return (
      <div className="p-12 text-center">
        <Database className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">No Process Data Yet</h3>
        <p className="text-muted-foreground">No process details have been ingested yet. Use the external API to send data.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Process</TableHead>
            <TableHead>Window Title</TableHead>
            <TableHead>Agent ID</TableHead>
            <TableHead>URL/Domain</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Tags</TableHead>
            <TableHead>Event Time</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {processDetails.map((item) => (
            <TableRow key={item.taskGuid} data-testid={`row-process-${item.taskGuid}`}>
              <TableCell>
                <div className="font-medium">{item.processName || "-"}</div>
                <div className="text-xs text-muted-foreground">{item.processId || "-"}</div>
              </TableCell>
              <TableCell className="max-w-[200px] truncate" title={item.mainWindowTitle || ""}>
                {item.mainWindowTitle || "-"}
              </TableCell>
              <TableCell>
                <code className="text-xs bg-muted px-2 py-1 rounded">{item.agentGuid || "-"}</code>
              </TableCell>
              <TableCell>
                <div className="text-sm">{item.urlDomain || "-"}</div>
              </TableCell>
              <TableCell>
                <Badge variant={item.idleStatus ? "secondary" : "default"}>
                  {item.idleStatus ? "Idle" : "Active"}
                </Badge>
              </TableCell>
              <TableCell>{item.lapsedTime ? `${item.lapsedTime}s` : "-"}</TableCell>
              <TableCell>
                <div className="flex gap-1 flex-wrap">
                  {item.tag1 && <Badge variant="outline" className="text-xs">{item.tag1}</Badge>}
                  {item.tag2 && <Badge variant="outline" className="text-xs">{item.tag2}</Badge>}
                </div>
              </TableCell>
              <TableCell>
                {item.eventDt ? format(new Date(item.eventDt), "MMM d, yyyy HH:mm") : "-"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function SleepEventsTab() {
  const { data: sleepEvents, isLoading } = useQuery<SleepEventData[]>({
    queryKey: ["/api/epm/sleep-events"],
  });

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        {[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
      </div>
    );
  }

  if (!sleepEvents?.length) {
    return (
      <div className="p-12 text-center">
        <Moon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">No Sleep Data Yet</h3>
        <p className="text-muted-foreground">No sleep events have been ingested yet. Use the external API to send data.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Agent ID</TableHead>
            <TableHead>Sleep Time</TableHead>
            <TableHead>Wake Time</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Reason</TableHead>
            <TableHead>Upload Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sleepEvents.map((item) => (
            <TableRow key={item.id} data-testid={`row-sleep-${item.id}`}>
              <TableCell>
                <code className="text-xs bg-muted px-2 py-1 rounded">{item.agentGuid}</code>
              </TableCell>
              <TableCell>
                {item.sleepTime ? format(new Date(item.sleepTime), "MMM d, yyyy HH:mm") : "-"}
              </TableCell>
              <TableCell>
                {item.wakeTime ? format(new Date(item.wakeTime), "MMM d, yyyy HH:mm") : "-"}
              </TableCell>
              <TableCell>
                <Badge variant="secondary">{item.duration || "-"}</Badge>
              </TableCell>
              <TableCell>{item.reason || "-"}</TableCell>
              <TableCell>
                <Badge variant={item.uploadStatus === "uploaded" ? "default" : "outline"}>
                  {item.uploadStatus || "pending"}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function IngestedDataContent() {
  const [activeTab, setActiveTab] = useState<"process" | "sleep">("process");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Ingested Data</h2>
        <p className="text-muted-foreground">View data received from external agents</p>
      </div>

      <div className="flex gap-2 border-b border-border">
        <Button
          variant="ghost"
          className={cn(
            "rounded-none border-b-2 px-4 py-2",
            activeTab === "process" 
              ? "border-primary text-foreground" 
              : "border-transparent text-muted-foreground"
          )}
          onClick={() => setActiveTab("process")}
          data-testid="tab-process-data"
        >
          <Activity className="h-4 w-4 mr-2" />
          Process Data
        </Button>
        <Button
          variant="ghost"
          className={cn(
            "rounded-none border-b-2 px-4 py-2",
            activeTab === "sleep" 
              ? "border-primary text-foreground" 
              : "border-transparent text-muted-foreground"
          )}
          onClick={() => setActiveTab("sleep")}
          data-testid="tab-sleep-data"
        >
          <Moon className="h-4 w-4 mr-2" />
          Sleep Data
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {activeTab === "process" ? <ProcessDetailsTab /> : <SleepEventsTab />}
        </CardContent>
      </Card>
    </div>
  );
}

function ApiDocumentationContent() {
  const { toast } = useToast();
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied", description: "Copied to clipboard" });
  };

  const samplePayload = `{
  "taskguid": "384a0be4-64c1-4c17-b635-420a51bc58ca",
  "agentGuid": "340367429854671",
  "ProcessId": "chrome.exe",
  "ProcessName": "Google Chrome",
  "MainWindowTitle": "Dashboard - PCVisor",
  "StartTime": "16 July 2025 11:58:38",
  "Eventdt": "16 July 2025 11:58:38",
  "IdleStatus": 0,
  "Urlname": "https://example.com/page",
  "UrlDomain": "example.com",
  "TimeLapsed": 120,
  "tag1": "Internet",
  "Tag2": "Productivity"
}`;

  const curlExample = `curl -X POST "${baseUrl}/api/external/epm/process-details" \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -d '${samplePayload.replace(/\n/g, "\\n").replace(/'/g, "\\'")}'`;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold">API Documentation</h2>
        <p className="text-muted-foreground">Learn how to integrate external systems with PCVisor EPM</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Webhook className="h-5 w-5" />
            Process Details Ingestion API
          </CardTitle>
          <CardDescription>Send process activity data from external agents to PCVisor</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <h4 className="font-medium">Endpoint</h4>
            <div className="flex items-center gap-2">
              <Badge>POST</Badge>
              <code className="flex-1 bg-muted px-3 py-2 rounded text-sm" data-testid="text-api-endpoint">
                {baseUrl}/api/external/epm/process-details
              </code>
              <Button variant="ghost" size="icon" onClick={() => copyToClipboard(`${baseUrl}/api/external/epm/process-details`)} data-testid="button-copy-endpoint">
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">Authentication</h4>
            <p className="text-sm text-muted-foreground">Include your API key in the request headers:</p>
            <div className="bg-muted p-3 rounded">
              <code className="text-sm">x-api-key: YOUR_API_KEY</code>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">Request Headers</h4>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Header</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Required</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell><code>Content-Type</code></TableCell>
                  <TableCell><code>application/json</code></TableCell>
                  <TableCell><Badge variant="secondary">Required</Badge></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>x-api-key</code></TableCell>
                  <TableCell>Your API key</TableCell>
                  <TableCell><Badge variant="secondary">Required</Badge></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">Request Body</h4>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Field</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  { field: "taskguid", type: "string", desc: "Unique identifier for this task (required)" },
                  { field: "agentGuid", type: "string", desc: "Agent/device identifier" },
                  { field: "ProcessId", type: "string", desc: "Process executable name" },
                  { field: "ProcessName", type: "string", desc: "Display name of the process" },
                  { field: "MainWindowTitle", type: "string", desc: "Active window title" },
                  { field: "StartTime", type: "string", desc: "Process start time (format: DD Month YYYY HH:MM:SS)" },
                  { field: "Eventdt", type: "string", desc: "Event timestamp" },
                  { field: "IdleStatus", type: "number|boolean", desc: "0/false = active, 1/true = idle" },
                  { field: "Urlname", type: "string", desc: "Full URL if browser-based" },
                  { field: "UrlDomain", type: "string", desc: "Domain name extracted from URL" },
                  { field: "TimeLapsed", type: "number", desc: "Time spent in seconds" },
                  { field: "tag1", type: "string", desc: "Category tag" },
                  { field: "Tag2", type: "string", desc: "Secondary tag" },
                ].map((row) => (
                  <TableRow key={row.field}>
                    <TableCell><code>{row.field}</code></TableCell>
                    <TableCell><code className="text-xs">{row.type}</code></TableCell>
                    <TableCell className="text-sm">{row.desc}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Sample Request</h4>
              <Button variant="ghost" size="sm" onClick={() => copyToClipboard(samplePayload)} data-testid="button-copy-sample">
                <Copy className="h-4 w-4 mr-2" />
                Copy JSON
              </Button>
            </div>
            <pre className="bg-muted p-4 rounded text-xs overflow-x-auto" data-testid="text-sample-payload">
              {samplePayload}
            </pre>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">Response</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span className="font-medium text-sm">Success (201)</span>
                </div>
                <pre className="bg-muted p-3 rounded text-xs">
{`{
  "message": "Process details ingested successfully",
  "taskGuid": "384a0be4-..."
}`}
                </pre>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-destructive" />
                  <span className="font-medium text-sm">Error (401/400)</span>
                </div>
                <pre className="bg-muted p-3 rounded text-xs">
{`{
  "message": "Invalid API key"
}`}
                </pre>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">cURL Example</h4>
              <Button variant="ghost" size="sm" onClick={() => copyToClipboard(curlExample)} data-testid="button-copy-curl">
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
            </div>
            <pre className="bg-muted p-4 rounded text-xs overflow-x-auto whitespace-pre-wrap">
              {curlExample}
            </pre>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Moon className="h-5 w-5" />
            Sleep Event Details Ingestion API
          </CardTitle>
          <CardDescription>Send sleep/wake event data from laptop agents to PCVisor</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <h4 className="font-medium">Endpoint</h4>
            <div className="flex items-center gap-2">
              <Badge>POST</Badge>
              <code className="flex-1 bg-muted px-3 py-2 rounded text-sm" data-testid="text-sleep-api-endpoint">
                {baseUrl}/api/external/epm/sleep-events
              </code>
              <Button variant="ghost" size="icon" onClick={() => copyToClipboard(`${baseUrl}/api/external/epm/sleep-events`)} data-testid="button-copy-sleep-endpoint">
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">Authentication</h4>
            <p className="text-sm text-muted-foreground">Include your API key in the request headers:</p>
            <div className="bg-muted p-3 rounded">
              <code className="text-sm">x-api-key: YOUR_API_KEY</code>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">Request Body</h4>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Field</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  { field: "data", type: "array", desc: "Array of sleep event records (required)" },
                  { field: "data[].AgentGuid", type: "string", desc: "Agent/device identifier (required)" },
                  { field: "data[].WakeTime", type: "string", desc: "Wake timestamp (format: YYYY-MM-DD HH:MM:SS) (required)" },
                  { field: "data[].SleepTime", type: "string", desc: "Sleep timestamp (format: YYYY-MM-DD HH:MM:SS) (required)" },
                  { field: "data[].Duration", type: "string", desc: "Duration of sleep (e.g., 0:07:35) (required)" },
                  { field: "data[].Reason", type: "string", desc: "Reason for sleep (e.g., Thermal Zone, User Initiated)" },
                  { field: "data[].UploadStatus", type: "string", desc: "Upload status indicator" },
                ].map((row) => (
                  <TableRow key={row.field}>
                    <TableCell><code>{row.field}</code></TableCell>
                    <TableCell><code className="text-xs">{row.type}</code></TableCell>
                    <TableCell className="text-sm">{row.desc}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Sample Request</h4>
              <Button variant="ghost" size="sm" onClick={() => copyToClipboard(`{
  "data": [
    {
      "AgentGuid": "340367429854671",
      "WakeTime": "2025-11-20 20:23:56",
      "SleepTime": "2025-11-20 20:16:21",
      "Duration": "0:07:35",
      "Reason": "Thermal Zone",
      "UploadStatus": ""
    }
  ]
}`)} data-testid="button-copy-sleep-sample">
                <Copy className="h-4 w-4 mr-2" />
                Copy JSON
              </Button>
            </div>
            <pre className="bg-muted p-4 rounded text-xs overflow-x-auto" data-testid="text-sleep-sample-payload">
{`{
  "data": [
    {
      "AgentGuid": "340367429854671",
      "WakeTime": "2025-11-20 20:23:56",
      "SleepTime": "2025-11-20 20:16:21",
      "Duration": "0:07:35",
      "Reason": "Thermal Zone",
      "UploadStatus": ""
    }
  ]
}`}
            </pre>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">Response</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span className="font-medium text-sm">Success (201)</span>
                </div>
                <pre className="bg-muted p-3 rounded text-xs">
{`{
  "message": "Sleep event details ingested successfully",
  "count": 1
}`}
                </pre>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-destructive" />
                  <span className="font-medium text-sm">Error (401/400)</span>
                </div>
                <pre className="bg-muted p-3 rounded text-xs">
{`{
  "message": "Invalid API key"
}`}
                </pre>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">cURL Example</h4>
              <Button variant="ghost" size="sm" onClick={() => copyToClipboard(`curl -X POST "${baseUrl}/api/external/epm/sleep-events" \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -d '{"data":[{"AgentGuid":"340367429854671","WakeTime":"2025-11-20 20:23:56","SleepTime":"2025-11-20 20:16:21","Duration":"0:07:35","Reason":"Thermal Zone","UploadStatus":""}]}'`)} data-testid="button-copy-sleep-curl">
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
            </div>
            <pre className="bg-muted p-4 rounded text-xs overflow-x-auto whitespace-pre-wrap">
{`curl -X POST "${baseUrl}/api/external/epm/sleep-events" \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -d '{"data":[{"AgentGuid":"340367429854671","WakeTime":"2025-11-20 20:23:56","SleepTime":"2025-11-20 20:16:21","Duration":"0:07:35","Reason":"Thermal Zone","UploadStatus":""}]}'`}
            </pre>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-3 text-sm">
            <li>Navigate to <strong>Integrations &amp; API</strong> &gt; <strong>API Keys</strong> to create an API key</li>
            <li>Copy or download your API key securely (it will only be shown once)</li>
            <li>Configure your agent or external system to send data to the endpoints above</li>
            <li>Include the <code className="bg-muted px-1 rounded">x-api-key</code> header with every request</li>
            <li>Monitor data ingestion in the Ingested Data section</li>
          </ol>
        </CardContent>
      </Card>
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
              <NotificationBell />
              <ProfileDropdown />
            </div>
          </header>

          <main className="flex-1 p-6 overflow-y-auto">
            <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
              {isDashboard ? (
                <DashboardContent />
              ) : location === "/apps/epm/integrations/api-keys" ? (
                <ApiKeysContent />
              ) : location === "/apps/epm/integrations/api-endpoints" ? (
                <IngestedDataContent />
              ) : location === "/apps/epm/integrations/api-documentation" ? (
                <ApiDocumentationContent />
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
