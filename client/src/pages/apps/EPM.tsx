import { useRoute } from "wouter";
import AppLayout from "@/components/AppLayout";
import AccessDenied from "@/components/AccessDenied";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  Users,
  Clock,
  Activity,
  LayoutDashboard,
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
  LucideIcon,
} from "lucide-react";
import { useRBAC } from "@/lib/rbac";
import { hasAppAccess } from "@/lib/menu-config";

interface PageConfig {
  title: string;
  description: string;
  icon: LucideIcon;
}

const PAGE_CONFIGS: Record<string, PageConfig> = {
  "dashboard/overview": { title: "Overview Dashboard", description: "Get a comprehensive view of employee productivity metrics and KPIs", icon: LayoutDashboard },
  "dashboard/live-status": { title: "Live Status", description: "Monitor real-time activity and status of all employees", icon: Radio },
  "dashboard/productivity-insights": { title: "Productivity Insights", description: "Deep dive into productivity trends and patterns", icon: TrendingUp },
  "dashboard/ai-recommendations": { title: "AI Recommendations", description: "AI-powered suggestions to improve team productivity", icon: Sparkles },
  "monitoring/real-time-activity": { title: "Real-Time Activity", description: "Track live employee activities and application usage", icon: Activity },
  "monitoring/process-usage-logs": { title: "Process Usage Logs", description: "Detailed logs of application and process usage", icon: ListChecks },
  "monitoring/screen-device-state": { title: "Screen State / Device State", description: "Monitor screen and device activity states", icon: Monitor },
  "profiles/employee-list": { title: "Employee List", description: "View and manage all employee profiles", icon: Users },
  "profiles/patterns": { title: "Daily / Weekly / Monthly Patterns", description: "Analyze employee activity patterns over time", icon: Calendar },
  "profiles/ai-observations": { title: "AI-Generated Observations", description: "AI insights and observations about employee behavior", icon: Brain },
  "reports/productivity": { title: "Productivity Reports", description: "Comprehensive productivity analysis reports", icon: BarChart3 },
  "reports/app-usage": { title: "App Usage Reports", description: "Detailed application usage statistics", icon: Layers },
  "reports/activity-timeline": { title: "Activity Timeline Reports", description: "Timeline view of all activities", icon: Clock },
  "reports/sleep-wake": { title: "Sleep/Wake Reports", description: "Device sleep and wake pattern reports", icon: Moon },
  "reports/custom": { title: "Custom Reports", description: "Create and manage custom report templates", icon: FileBarChart },
  "analytics/ai-scoring": { title: "AI Productivity Scoring", description: "AI-powered productivity scoring system", icon: Gauge },
  "analytics/behavioral": { title: "Behavioral Analytics", description: "Deep behavioral pattern analysis", icon: Brain },
  "analytics/predictive": { title: "Predictive Analytics", description: "Predict future productivity trends", icon: TrendingUp },
  "analytics/anomaly-detection": { title: "Anomaly Detection", description: "Detect unusual patterns and behaviors", icon: Search },
  "integrations/api-endpoints": { title: "API Endpoints", description: "Manage and configure API endpoints", icon: Webhook },
  "integrations/integration-setup": { title: "Integration Setup", description: "Configure third-party integrations", icon: Plug },
  "integrations/api-documentation": { title: "API Documentation", description: "Swagger/OpenAPI documentation", icon: FileCode },
  "alerts/alert-rules": { title: "Alert Rules", description: "Configure alert rules and thresholds", icon: BellRing },
  "alerts/notification-history": { title: "Notification History", description: "View history of all notifications", icon: History },
  "admin-settings/app-categorization": { title: "App Categorization", description: "Categorize applications for tracking", icon: Tags },
  "admin-settings/system-configuration": { title: "System Configuration", description: "Configure system settings", icon: Settings },
  "admin-settings/device-agent": { title: "Device Agent Settings", description: "Configure device monitoring agents", icon: Cpu },
  "help/documentation": { title: "Documentation", description: "Access system documentation and guides", icon: BookOpen },
  "help/faqs": { title: "FAQs", description: "Frequently asked questions", icon: MessageCircleQuestion },
};

function OverviewDashboard() {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { label: "Active Employees", value: "247", trend: "+12 today", icon: Users, color: "text-blue-500" },
          { label: "Avg Productivity", value: "78%", trend: "+5.2%", icon: TrendingUp, color: "text-green-500" },
          { label: "Active Time", value: "6.5h", trend: "avg/day", icon: Clock, color: "text-orange-500" },
          { label: "Alerts", value: "3", trend: "pending", icon: Bell, color: "text-red-500" },
        ].map((stat) => (
          <Card key={stat.label} data-testid={`card-stat-${stat.label.toLowerCase().replace(/\s+/g, '-')}`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between gap-2 mb-4">
                <div className={`h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center ${stat.color}`}>
                  <stat.icon className="h-5 w-5" />
                </div>
                <Badge variant="secondary" className="text-xs">{stat.trend}</Badge>
              </div>
              <h3 className="text-2xl font-bold" data-testid={`text-stat-value-${stat.label.toLowerCase().replace(/\s+/g, '-')}`}>{stat.value}</h3>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
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
          <CardContent className="h-[300px] flex items-center justify-center bg-muted/10 border-2 border-dashed border-muted rounded-lg">
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

function PlaceholderPage({ config }: { config: PageConfig }) {
  const Icon = config.icon;
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Icon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle>{config.title}</CardTitle>
              <CardDescription>{config.description}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="min-h-[400px] flex items-center justify-center bg-muted/10 border-2 border-dashed border-muted rounded-lg">
          <div className="text-center">
            <Icon className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">{config.title}</h3>
            <p className="text-muted-foreground max-w-md">{config.description}</p>
            <p className="text-sm text-muted-foreground mt-4">This feature is coming soon.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function EPM() {
  const { permissions, isAdmin } = useRBAC();
  const [, params] = useRoute("/apps/epm/:rest*");
  
  if (!isAdmin && !hasAppAccess(permissions, "epm")) {
    return <AccessDenied appName="Employee Productivity Management" />;
  }

  const path = params?.rest || "";
  const pageConfig = PAGE_CONFIGS[path];

  const getPageTitle = () => {
    if (!path || path === "") return "Employee Productivity Management";
    if (pageConfig) return pageConfig.title;
    return "Employee Productivity Management";
  };

  const renderContent = () => {
    if (!path || path === "" || path === "dashboard/overview") {
      return <OverviewDashboard />;
    }
    
    if (pageConfig) {
      return <PlaceholderPage config={pageConfig} />;
    }

    return <OverviewDashboard />;
  };

  return (
    <AppLayout title={getPageTitle()} appName="EPM">
      {renderContent()}
    </AppLayout>
  );
}
