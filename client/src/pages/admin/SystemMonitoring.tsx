import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import {
  Activity,
  ChevronLeft,
  Cpu,
  HardDrive,
  Server,
  Clock,
  MemoryStick,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Loader2,
  Monitor
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface SystemMetrics {
  cpu: {
    usage: number;
    cores: number;
    model: string;
  };
  memory: {
    total: number;
    used: number;
    free: number;
    percent: number;
  };
  disk: {
    total: number;
    used: number;
    free: number;
    percent: number;
  };
  uptime: number;
  process: {
    heapUsed: number;
    heapTotal: number;
    rss: number;
    external: number;
  };
  node: {
    version: string;
    platform: string;
    arch: string;
  };
  system: {
    hostname: string;
    platform: string;
    arch: string;
    release: string;
  };
  timestamp: string;
}

interface HealthStatus {
  status: "healthy" | "warning" | "critical";
  issues: string[];
  checks: {
    memory: string;
    cpu: string;
    uptime: string;
  };
  timestamp: string;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);
  
  return parts.join(" ");
}

function getProgressColor(percent: number): string {
  if (percent >= 90) return "bg-red-500";
  if (percent >= 75) return "bg-yellow-500";
  return "bg-green-500";
}

function getStatusIcon(status: string) {
  switch (status) {
    case "healthy":
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    case "warning":
      return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    case "critical":
      return <XCircle className="h-5 w-5 text-red-500" />;
    default:
      return <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />;
  }
}

function getStatusBadge(status: string) {
  switch (status) {
    case "healthy":
      return <Badge variant="outline" className="gap-1 text-green-600 border-green-600"><CheckCircle className="h-3 w-3" /> Healthy</Badge>;
    case "warning":
      return <Badge variant="outline" className="gap-1 text-yellow-600 border-yellow-600"><AlertTriangle className="h-3 w-3" /> Warning</Badge>;
    case "critical":
      return <Badge variant="outline" className="gap-1 text-red-600 border-red-600"><XCircle className="h-3 w-3" /> Critical</Badge>;
    default:
      return <Badge variant="outline" className="gap-1"><Loader2 className="h-3 w-3 animate-spin" /> Loading</Badge>;
  }
}

export default function SystemMonitoring() {
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval] = useState(5000);

  const { data: metricsData, isLoading: loadingMetrics, refetch: refetchMetrics } = useQuery<SystemMetrics>({
    queryKey: ["/api/admin/system/metrics"],
    refetchInterval: autoRefresh ? refreshInterval : false,
  });

  const { data: healthData, isLoading: loadingHealth, refetch: refetchHealth } = useQuery<HealthStatus>({
    queryKey: ["/api/admin/system/health"],
    refetchInterval: autoRefresh ? refreshInterval : false,
  });

  const handleManualRefresh = () => {
    refetchMetrics();
    refetchHealth();
  };

  const isLoading = loadingMetrics || loadingHealth;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-6 h-16 flex items-center gap-4">
          <Link href="/admin-console">
            <Button variant="ghost" size="icon" data-testid="button-back">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-pink-500/10 rounded-lg flex items-center justify-center">
              <Activity className="h-4 w-4 text-pink-500" />
            </div>
            <span className="font-medium">System Monitoring</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2" data-testid="text-page-title">System Monitoring</h1>
            <p className="text-muted-foreground">
              Monitor system health, performance metrics, and resource usage
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Switch
                id="auto-refresh"
                checked={autoRefresh}
                onCheckedChange={setAutoRefresh}
                data-testid="switch-auto-refresh"
              />
              <Label htmlFor="auto-refresh" className="text-sm">Auto-refresh</Label>
            </div>
            <Button variant="outline" size="sm" onClick={handleManualRefresh} disabled={isLoading} data-testid="button-refresh">
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Health Status */}
        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                {healthData ? getStatusIcon(healthData.status) : <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />}
              </div>
              <div>
                <CardTitle className="text-lg">System Health</CardTitle>
                <CardDescription>Overall system status</CardDescription>
              </div>
            </div>
            {healthData && getStatusBadge(healthData.status)}
          </CardHeader>
          {healthData && healthData.issues.length > 0 && (
            <CardContent>
              <div className="space-y-2">
                {healthData.issues.map((issue, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    {issue}
                  </div>
                ))}
              </div>
            </CardContent>
          )}
        </Card>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {/* CPU Usage */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
              <Cpu className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loadingMetrics ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : metricsData ? (
                <div className="space-y-3">
                  <div className="flex items-end justify-between gap-2">
                    <span className="text-2xl font-bold" data-testid="text-cpu-usage">{metricsData.cpu.usage}%</span>
                    <span className="text-sm text-muted-foreground">{metricsData.cpu.cores} cores</span>
                  </div>
                  <Progress 
                    value={metricsData.cpu.usage} 
                    className="h-2"
                    data-testid="progress-cpu"
                  />
                  <p className="text-xs text-muted-foreground truncate" title={metricsData.cpu.model}>
                    {metricsData.cpu.model}
                  </p>
                </div>
              ) : (
                <p className="text-muted-foreground">No data available</p>
              )}
            </CardContent>
          </Card>

          {/* Memory Usage */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
              <MemoryStick className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loadingMetrics ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : metricsData ? (
                <div className="space-y-3">
                  <div className="flex items-end justify-between gap-2">
                    <span className="text-2xl font-bold" data-testid="text-memory-usage">{metricsData.memory.percent}%</span>
                    <span className="text-sm text-muted-foreground">{formatBytes(metricsData.memory.total)}</span>
                  </div>
                  <Progress 
                    value={metricsData.memory.percent} 
                    className="h-2"
                    data-testid="progress-memory"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Used: {formatBytes(metricsData.memory.used)}</span>
                    <span>Free: {formatBytes(metricsData.memory.free)}</span>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">No data available</p>
              )}
            </CardContent>
          </Card>

          {/* Disk Usage */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Disk Usage</CardTitle>
              <HardDrive className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loadingMetrics ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : metricsData ? (
                <div className="space-y-3">
                  <div className="flex items-end justify-between gap-2">
                    <span className="text-2xl font-bold" data-testid="text-disk-usage">{metricsData.disk.percent}%</span>
                    <span className="text-sm text-muted-foreground">{formatBytes(metricsData.disk.total)}</span>
                  </div>
                  <Progress 
                    value={metricsData.disk.percent} 
                    className="h-2"
                    data-testid="progress-disk"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Used: {formatBytes(metricsData.disk.used)}</span>
                    <span>Free: {formatBytes(metricsData.disk.free)}</span>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">No data available</p>
              )}
            </CardContent>
          </Card>

          {/* System Uptime */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loadingMetrics ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : metricsData ? (
                <div className="space-y-2">
                  <span className="text-2xl font-bold" data-testid="text-uptime">{formatUptime(metricsData.uptime)}</span>
                  <p className="text-xs text-muted-foreground">
                    Since system boot
                  </p>
                </div>
              ) : (
                <p className="text-muted-foreground">No data available</p>
              )}
            </CardContent>
          </Card>

          {/* Node.js Info */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Node.js</CardTitle>
              <Server className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loadingMetrics ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : metricsData ? (
                <div className="space-y-2">
                  <span className="text-2xl font-bold" data-testid="text-node-version">{metricsData.node.version}</span>
                  <p className="text-xs text-muted-foreground">
                    {metricsData.node.platform} / {metricsData.node.arch}
                  </p>
                </div>
              ) : (
                <p className="text-muted-foreground">No data available</p>
              )}
            </CardContent>
          </Card>

          {/* Platform Info */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Platform</CardTitle>
              <Monitor className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loadingMetrics ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : metricsData ? (
                <div className="space-y-2">
                  <span className="text-lg font-bold" data-testid="text-hostname">{metricsData.system.hostname}</span>
                  <p className="text-xs text-muted-foreground">
                    {metricsData.system.platform} {metricsData.system.arch}
                  </p>
                  <p className="text-xs text-muted-foreground truncate" title={metricsData.system.release}>
                    {metricsData.system.release}
                  </p>
                </div>
              ) : (
                <p className="text-muted-foreground">No data available</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Process Memory */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <Activity className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <CardTitle className="text-lg">Process Memory</CardTitle>
                <CardDescription>Node.js process memory allocation</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loadingMetrics ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : metricsData ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Heap Used</p>
                  <p className="text-lg font-semibold" data-testid="text-heap-used">{formatBytes(metricsData.process.heapUsed)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Heap Total</p>
                  <p className="text-lg font-semibold" data-testid="text-heap-total">{formatBytes(metricsData.process.heapTotal)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">RSS</p>
                  <p className="text-lg font-semibold" data-testid="text-rss">{formatBytes(metricsData.process.rss)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">External</p>
                  <p className="text-lg font-semibold" data-testid="text-external">{formatBytes(metricsData.process.external)}</p>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">No data available</p>
            )}
          </CardContent>
        </Card>

        {/* Last Updated */}
        {metricsData && (
          <div className="mt-6 text-center text-sm text-muted-foreground" data-testid="text-last-updated">
            Last updated: {new Date(metricsData.timestamp).toLocaleString()}
          </div>
        )}
      </main>
    </div>
  );
}
