import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { format } from "date-fns";
import {
  Database,
  ChevronLeft,
  Download,
  Trash2,
  Plus,
  Play,
  Clock,
  Settings,
  Terminal,
  Loader2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Calendar,
  HardDrive,
  RefreshCw,
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { DatabaseBackup, BackupSchedule, QueryExecutionLog, DatabaseSettings } from "@shared/schema";

const statusConfig: Record<string, { color: string; icon: typeof CheckCircle }> = {
  completed: { color: "text-green-500", icon: CheckCircle },
  success: { color: "text-green-500", icon: CheckCircle },
  failed: { color: "text-red-500", icon: XCircle },
  pending: { color: "text-yellow-500", icon: Clock },
  in_progress: { color: "text-blue-500", icon: Loader2 },
};

const cronPresets = [
  { label: "Every hour", value: "0 * * * *" },
  { label: "Every 6 hours", value: "0 */6 * * *" },
  { label: "Daily at midnight", value: "0 0 * * *" },
  { label: "Daily at 2 AM", value: "0 2 * * *" },
  { label: "Weekly (Sunday)", value: "0 0 * * 0" },
  { label: "Monthly (1st)", value: "0 0 1 * *" },
];

export default function DatabaseManagement() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("backups");
  
  const [showCreateBackup, setShowCreateBackup] = useState(false);
  const [backupName, setBackupName] = useState("");
  
  const [showCreateSchedule, setShowCreateSchedule] = useState(false);
  const [scheduleName, setScheduleName] = useState("");
  const [cronExpression, setCronExpression] = useState("0 2 * * *");
  const [scheduleTimezone, setScheduleTimezone] = useState("UTC");
  const [retentionDays, setRetentionDays] = useState("30");
  
  const [deleteBackupId, setDeleteBackupId] = useState<string | null>(null);
  const [deleteScheduleId, setDeleteScheduleId] = useState<string | null>(null);
  
  const [sqlQuery, setSqlQuery] = useState("");
  const [queryResult, setQueryResult] = useState<{ columns: string[]; rows: Record<string, unknown>[] } | null>(null);
  const [queryError, setQueryError] = useState<string | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { data: backups, isLoading: loadingBackups } = useQuery<{ backups: DatabaseBackup[] }>({
    queryKey: ["/api/db/backups"],
  });

  const { data: schedules, isLoading: loadingSchedules } = useQuery<{ schedules: BackupSchedule[] }>({
    queryKey: ["/api/db/schedules"],
  });

  const { data: queryLogs, isLoading: loadingLogs } = useQuery<{ logs: QueryExecutionLog[] }>({
    queryKey: ["/api/db/query-logs"],
  });

  const { data: settings } = useQuery<{ settings: DatabaseSettings | null }>({
    queryKey: ["/api/db/settings"],
  });

  const { data: timezones } = useQuery<{ timezones: string[] }>({
    queryKey: ["/api/db/timezones"],
  });

  const createBackupMutation = useMutation({
    mutationFn: async (name: string) => {
      const res = await apiRequest("POST", "/api/db/backups", { name });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/db/backups"] });
      setShowCreateBackup(false);
      setBackupName("");
      toast({ title: "Backup started", description: "Database backup is being created." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteBackupMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/db/backups/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/db/backups"] });
      setDeleteBackupId(null);
      toast({ title: "Backup deleted", description: "Backup has been removed." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const createScheduleMutation = useMutation({
    mutationFn: async (data: { name: string; cronExpression: string; timezone: string; retentionDays: string }) => {
      const res = await apiRequest("POST", "/api/db/schedules", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/db/schedules"] });
      setShowCreateSchedule(false);
      setScheduleName("");
      setCronExpression("0 2 * * *");
      setRetentionDays("30");
      toast({ title: "Schedule created", description: "Backup schedule has been created." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const toggleScheduleMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const res = await apiRequest("PATCH", `/api/db/schedules/${id}`, { isActive });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/db/schedules"] });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteScheduleMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/db/schedules/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/db/schedules"] });
      setDeleteScheduleId(null);
      toast({ title: "Schedule deleted", description: "Schedule has been removed." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const executeQueryMutation = useMutation({
    mutationFn: async (data: { query: string; confirmDelete?: string }) => {
      const res = await apiRequest("POST", "/api/db/query", data);
      return res.json();
    },
    onSuccess: (data: { columns?: string[]; rows?: Record<string, unknown>[]; message?: string; rowsAffected?: number }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/db/query-logs"] });
      setShowDeleteConfirm(false);
      setDeleteConfirmText("");
      if (data.columns && data.rows) {
        setQueryResult({ columns: data.columns, rows: data.rows });
        setQueryError(null);
      } else {
        setQueryResult(null);
        setQueryError(null);
        toast({ 
          title: "Query executed", 
          description: data.message || `Rows affected: ${data.rowsAffected}` 
        });
      }
    },
    onError: (error: Error) => {
      setQueryResult(null);
      setQueryError(error.message);
    },
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (data: Partial<DatabaseSettings>) => {
      const res = await apiRequest("PATCH", "/api/db/settings", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/db/settings"] });
      toast({ title: "Settings saved", description: "Database settings have been updated." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleExecuteQuery = () => {
    const trimmedQuery = sqlQuery.trim().toUpperCase();
    if (trimmedQuery.startsWith("DELETE")) {
      setShowDeleteConfirm(true);
    } else {
      executeQueryMutation.mutate({ query: sqlQuery });
    }
  };

  const handleConfirmDelete = () => {
    if (deleteConfirmText.toLowerCase() === "delete") {
      executeQueryMutation.mutate({ query: sqlQuery, confirmDelete: deleteConfirmText });
    }
  };

  const formatDate = (date: string | Date | null) => {
    if (!date) return "N/A";
    return format(new Date(date), "MMM dd, yyyy HH:mm");
  };

  const formatFileSize = (size: string | null) => {
    if (!size) return "N/A";
    const bytes = parseInt(size);
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getStatusBadge = (status: string | null) => {
    const config = statusConfig[status || "pending"] || statusConfig.pending;
    const IconComponent = config.icon;
    return (
      <Badge variant="outline" className="gap-1">
        <IconComponent className={`h-3 w-3 ${config.color} ${status === "in_progress" ? "animate-spin" : ""}`} />
        {status?.replace("_", " ") || "Pending"}
      </Badge>
    );
  };

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
            <div className="h-8 w-8 bg-purple-500/10 rounded-lg flex items-center justify-center">
              <Database className="h-4 w-4 text-purple-500" />
            </div>
            <span className="font-medium">Database Management</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" data-testid="text-page-title">Database Management</h1>
          <p className="text-muted-foreground">
            Manage backups, schedules, execute queries, and configure database settings
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
            <TabsTrigger value="backups" className="gap-2" data-testid="tab-backups">
              <HardDrive className="h-4 w-4" />
              Backups
            </TabsTrigger>
            <TabsTrigger value="schedules" className="gap-2" data-testid="tab-schedules">
              <Calendar className="h-4 w-4" />
              Schedules
            </TabsTrigger>
            <TabsTrigger value="query" className="gap-2" data-testid="tab-query">
              <Terminal className="h-4 w-4" />
              Query Console
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2" data-testid="tab-settings">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="backups" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <HardDrive className="h-5 w-5" />
                      Database Backups
                    </CardTitle>
                    <CardDescription>
                      Create and manage database backups
                    </CardDescription>
                  </div>
                  <Button onClick={() => setShowCreateBackup(true)} data-testid="button-create-backup">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Backup
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {loadingBackups ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : !backups?.backups?.length ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <HardDrive className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No backups found</p>
                    <p className="text-sm">Create your first backup to get started</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Size</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {backups.backups.map((backup) => (
                        <TableRow key={backup.id} data-testid={`row-backup-${backup.id}`}>
                          <TableCell className="font-medium">{backup.name}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {backup.type === "scheduled" ? <Clock className="h-3 w-3 mr-1" /> : null}
                              {backup.type}
                            </Badge>
                          </TableCell>
                          <TableCell>{getStatusBadge(backup.status)}</TableCell>
                          <TableCell>{formatFileSize(backup.fileSize)}</TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {formatDate(backup.requestedAt)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              {backup.status === "completed" && backup.filePath && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  asChild
                                  data-testid={`button-download-${backup.id}`}
                                >
                                  <a href={`/api/db/backups/${backup.id}/download`} download>
                                    <Download className="h-4 w-4" />
                                  </a>
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setDeleteBackupId(backup.id)}
                                data-testid={`button-delete-backup-${backup.id}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="schedules" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Backup Schedules
                    </CardTitle>
                    <CardDescription>
                      Configure automated backup schedules
                    </CardDescription>
                  </div>
                  <Button onClick={() => setShowCreateSchedule(true)} data-testid="button-create-schedule">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Schedule
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {loadingSchedules ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : !schedules?.schedules?.length ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No schedules configured</p>
                    <p className="text-sm">Create a schedule for automated backups</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Schedule</TableHead>
                        <TableHead>Timezone</TableHead>
                        <TableHead>Retention</TableHead>
                        <TableHead>Next Run</TableHead>
                        <TableHead>Active</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {schedules.schedules.map((schedule) => (
                        <TableRow key={schedule.id} data-testid={`row-schedule-${schedule.id}`}>
                          <TableCell className="font-medium">{schedule.name}</TableCell>
                          <TableCell>
                            <code className="text-xs bg-muted px-2 py-1 rounded">
                              {schedule.cronExpression}
                            </code>
                          </TableCell>
                          <TableCell className="text-sm">{schedule.timezone}</TableCell>
                          <TableCell>{schedule.retentionDays} days</TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {formatDate(schedule.nextRunAt)}
                          </TableCell>
                          <TableCell>
                            <Switch
                              checked={schedule.isActive ?? false}
                              onCheckedChange={(checked) =>
                                toggleScheduleMutation.mutate({ id: schedule.id, isActive: checked })
                              }
                              data-testid={`switch-schedule-active-${schedule.id}`}
                            />
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeleteScheduleId(schedule.id)}
                              data-testid={`button-delete-schedule-${schedule.id}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="query" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Terminal className="h-5 w-5" />
                    SQL Query Console
                  </CardTitle>
                  <CardDescription>
                    Execute SQL queries against the database. DROP, TRUNCATE, and ALTER statements are blocked.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    placeholder="Enter your SQL query here..."
                    value={sqlQuery}
                    onChange={(e) => setSqlQuery(e.target.value)}
                    className="font-mono min-h-[150px]"
                    data-testid="textarea-query"
                  />
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={handleExecuteQuery}
                      disabled={!sqlQuery.trim() || executeQueryMutation.isPending}
                      data-testid="button-execute-query"
                    >
                      {executeQueryMutation.isPending ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Play className="h-4 w-4 mr-2" />
                      )}
                      Execute
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSqlQuery("");
                        setQueryResult(null);
                        setQueryError(null);
                      }}
                      data-testid="button-clear-query"
                    >
                      Clear
                    </Button>
                  </div>

                  {queryError && (
                    <div className="bg-destructive/10 border border-destructive/20 rounded-md p-4">
                      <div className="flex items-start gap-2">
                        <XCircle className="h-5 w-5 text-destructive mt-0.5" />
                        <div>
                          <p className="font-medium text-destructive">Query Error</p>
                          <p className="text-sm text-muted-foreground">{queryError}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {queryResult && (
                    <div className="border rounded-md overflow-hidden">
                      <div className="bg-muted/50 px-4 py-2 border-b">
                        <p className="text-sm font-medium">
                          Results: {queryResult.rows.length} row(s)
                        </p>
                      </div>
                      <div className="overflow-x-auto max-h-[300px]">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              {queryResult.columns.map((col) => (
                                <TableHead key={col}>{col}</TableHead>
                              ))}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {queryResult.rows.map((row, i) => (
                              <TableRow key={i}>
                                {queryResult.columns.map((col) => (
                                  <TableCell key={col} className="font-mono text-xs">
                                    {String(row[col] ?? "null")}
                                  </TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Query History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loadingLogs ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : !queryLogs?.logs?.length ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      No queries executed yet
                    </p>
                  ) : (
                    <div className="space-y-3 max-h-[400px] overflow-y-auto">
                      {queryLogs.logs.slice(0, 20).map((log) => (
                        <div
                          key={log.id}
                          className="border rounded-md p-3 space-y-2 hover-elevate cursor-pointer"
                          onClick={() => setSqlQuery(log.query)}
                          data-testid={`log-item-${log.id}`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <Badge variant="outline" className="text-xs">
                              {log.queryType}
                            </Badge>
                            {getStatusBadge(log.status)}
                          </div>
                          <p className="text-xs font-mono truncate text-muted-foreground">
                            {log.query.slice(0, 50)}...
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(log.executedAt)}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Database Settings
                </CardTitle>
                <CardDescription>
                  Configure database timezone and other settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Database Timezone</Label>
                    <Select
                      value={settings?.settings?.timezone || "UTC"}
                      onValueChange={(value) =>
                        updateSettingsMutation.mutate({ timezone: value })
                      }
                    >
                      <SelectTrigger id="timezone" data-testid="select-timezone">
                        <SelectValue placeholder="Select timezone" />
                      </SelectTrigger>
                      <SelectContent>
                        {timezones?.timezones?.map((tz) => (
                          <SelectItem key={tz} value={tz}>
                            {tz}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Timezone used for scheduled backups and timestamps
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="retention">Default Backup Retention (days)</Label>
                    <Input
                      id="retention"
                      type="number"
                      value={settings?.settings?.backupRetentionDays || "30"}
                      onChange={(e) =>
                        updateSettingsMutation.mutate({ backupRetentionDays: e.target.value })
                      }
                      data-testid="input-retention"
                    />
                    <p className="text-xs text-muted-foreground">
                      Number of days to keep backups before automatic cleanup
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="max-execution">Max Query Execution Time (seconds)</Label>
                    <Input
                      id="max-execution"
                      type="number"
                      value={settings?.settings?.maxQueryExecutionTime || "30"}
                      onChange={(e) =>
                        updateSettingsMutation.mutate({ maxQueryExecutionTime: e.target.value })
                      }
                      data-testid="input-max-execution"
                    />
                    <p className="text-xs text-muted-foreground">
                      Maximum allowed execution time for queries
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Dialog open={showCreateBackup} onOpenChange={setShowCreateBackup}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Database Backup</DialogTitle>
            <DialogDescription>
              Create an on-demand backup of the database
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="backup-name">Backup Name</Label>
              <Input
                id="backup-name"
                placeholder="e.g., Pre-deployment backup"
                value={backupName}
                onChange={(e) => setBackupName(e.target.value)}
                data-testid="input-backup-name"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateBackup(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => createBackupMutation.mutate(backupName)}
              disabled={!backupName.trim() || createBackupMutation.isPending}
              data-testid="button-confirm-backup"
            >
              {createBackupMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Create Backup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showCreateSchedule} onOpenChange={setShowCreateSchedule}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Backup Schedule</DialogTitle>
            <DialogDescription>
              Configure an automated backup schedule
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="schedule-name">Schedule Name</Label>
              <Input
                id="schedule-name"
                placeholder="e.g., Daily backup"
                value={scheduleName}
                onChange={(e) => setScheduleName(e.target.value)}
                data-testid="input-schedule-name"
              />
            </div>
            <div className="space-y-2">
              <Label>Schedule Preset</Label>
              <Select onValueChange={(value) => setCronExpression(value)}>
                <SelectTrigger data-testid="select-cron-preset">
                  <SelectValue placeholder="Select a preset" />
                </SelectTrigger>
                <SelectContent>
                  {cronPresets.map((preset) => (
                    <SelectItem key={preset.value} value={preset.value}>
                      {preset.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cron">Cron Expression</Label>
              <Input
                id="cron"
                placeholder="0 2 * * *"
                value={cronExpression}
                onChange={(e) => setCronExpression(e.target.value)}
                className="font-mono"
                data-testid="input-cron"
              />
              <p className="text-xs text-muted-foreground">
                Format: minute hour day month weekday
              </p>
            </div>
            <div className="space-y-2">
              <Label>Timezone</Label>
              <Select value={scheduleTimezone} onValueChange={setScheduleTimezone}>
                <SelectTrigger data-testid="select-schedule-timezone">
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                  {timezones?.timezones?.map((tz) => (
                    <SelectItem key={tz} value={tz}>
                      {tz}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="schedule-retention">Retention (days)</Label>
              <Input
                id="schedule-retention"
                type="number"
                value={retentionDays}
                onChange={(e) => setRetentionDays(e.target.value)}
                data-testid="input-schedule-retention"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateSchedule(false)}>
              Cancel
            </Button>
            <Button
              onClick={() =>
                createScheduleMutation.mutate({
                  name: scheduleName,
                  cronExpression,
                  timezone: scheduleTimezone,
                  retentionDays,
                })
              }
              disabled={!scheduleName.trim() || !cronExpression.trim() || createScheduleMutation.isPending}
              data-testid="button-confirm-schedule"
            >
              {createScheduleMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Create Schedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteBackupId} onOpenChange={() => setDeleteBackupId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Backup</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this backup? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteBackupId && deleteBackupMutation.mutate(deleteBackupId)}
              className="bg-destructive text-destructive-foreground"
              data-testid="button-confirm-delete-backup"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!deleteScheduleId} onOpenChange={() => setDeleteScheduleId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Schedule</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this backup schedule? Scheduled backups will stop running.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteScheduleId && deleteScheduleMutation.mutate(deleteScheduleId)}
              className="bg-destructive text-destructive-foreground"
              data-testid="button-confirm-delete-schedule"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Confirm DELETE Operation
            </DialogTitle>
            <DialogDescription>
              You are about to execute a DELETE query. This operation cannot be undone.
              Type "delete" to confirm.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="bg-muted/50 rounded-md p-3 font-mono text-sm mb-4 overflow-x-auto">
              {sqlQuery}
            </div>
            <Input
              placeholder='Type "delete" to confirm'
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              data-testid="input-delete-confirm"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={deleteConfirmText.toLowerCase() !== "delete" || executeQueryMutation.isPending}
              data-testid="button-confirm-delete-query"
            >
              {executeQueryMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Execute DELETE
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
