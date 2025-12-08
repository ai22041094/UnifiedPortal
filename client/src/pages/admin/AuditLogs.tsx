import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "wouter";
import { format } from "date-fns";
import { 
  FileText, 
  ChevronLeft, 
  Search, 
  Filter, 
  Calendar,
  Loader2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  User,
  Shield,
  Settings,
  Database,
  Key,
  Activity,
  ChevronDown,
  Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import type { AuditLog } from "@shared/schema";

interface AuditLogResponse {
  logs: AuditLog[];
  total: number;
}

interface CategoryInfo {
  id: string;
  name: string;
}

const categoryIcons: Record<string, typeof User> = {
  auth: Key,
  user: User,
  role: Shield,
  settings: Settings,
  security: Shield,
  system: Activity,
  data: Database,
};

const statusConfig: Record<string, { icon: typeof CheckCircle; color: string; label: string }> = {
  success: { icon: CheckCircle, color: "text-green-500", label: "Success" },
  failure: { icon: XCircle, color: "text-red-500", label: "Failed" },
  warning: { icon: AlertTriangle, color: "text-yellow-500", label: "Warning" },
};

export default function AuditLogsPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [page, setPage] = useState(0);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const limit = 25;

  const { data: categories } = useQuery<{ categories: CategoryInfo[] }>({
    queryKey: ["/api/audit-logs/categories"],
  });

  const buildQueryParams = () => {
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (category && category !== "all") params.append("category", category);
    if (startDate) params.append("startDate", startDate.toISOString());
    if (endDate) params.append("endDate", endDate.toISOString());
    params.append("limit", limit.toString());
    params.append("offset", (page * limit).toString());
    return params.toString();
  };

  const { data, isLoading, refetch } = useQuery<AuditLogResponse>({
    queryKey: ["/api/audit-logs", search, category, startDate?.toISOString(), endDate?.toISOString(), page],
    queryFn: async () => {
      const response = await fetch(`/api/audit-logs?${buildQueryParams()}`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch audit logs");
      return response.json();
    },
  });

  const logs = data?.logs || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / limit);

  const handleSearch = () => {
    setPage(0);
    refetch();
  };

  const clearFilters = () => {
    setSearch("");
    setCategory("all");
    setStartDate(undefined);
    setEndDate(undefined);
    setPage(0);
  };

  const getCategoryIcon = (cat: string) => {
    const IconComponent = categoryIcons[cat] || Activity;
    return <IconComponent className="h-4 w-4" />;
  };

  const getStatusBadge = (status: string | null) => {
    const config = statusConfig[status || "success"] || statusConfig.success;
    const IconComponent = config.icon;
    return (
      <Badge variant="outline" className="gap-1">
        <IconComponent className={`h-3 w-3 ${config.color}`} />
        {config.label}
      </Badge>
    );
  };

  const formatDate = (date: string | Date | null) => {
    if (!date) return "N/A";
    return format(new Date(date), "MMM dd, yyyy HH:mm:ss");
  };

  const exportLogs = () => {
    const csvContent = [
      ["Date", "User", "Action", "Category", "Resource", "Status", "IP Address", "Details"].join(","),
      ...logs.map(log => [
        formatDate(log.createdAt),
        log.username || "System",
        log.action,
        log.category,
        log.resourceName || "-",
        log.status || "success",
        log.ipAddress || "-",
        `"${(log.details || "").replace(/"/g, '""')}"`,
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `audit-logs-${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();
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
            <div className="h-8 w-8 bg-green-500/10 rounded-lg flex items-center justify-center">
              <FileText className="h-4 w-4 text-green-500" />
            </div>
            <span className="font-medium">Audit Logs</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" data-testid="text-page-title">Audit Logs</h1>
          <p className="text-muted-foreground">
            View and search system activity and security events
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search logs..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="pl-9"
                  data-testid="input-search"
                />
              </div>

              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger data-testid="select-category">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories?.categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="justify-start" data-testid="button-start-date">
                    <Calendar className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "MMM dd, yyyy") : "Start Date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="justify-start" data-testid="button-end-date">
                    <Calendar className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "MMM dd, yyyy") : "End Date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex items-center gap-2 mt-4">
              <Button onClick={handleSearch} data-testid="button-apply-filter">
                <Search className="h-4 w-4 mr-2" />
                Apply Filter
              </Button>
              <Button variant="outline" onClick={clearFilters} data-testid="button-clear-filter">
                Clear Filters
              </Button>
              <div className="flex-1" />
              <Button variant="outline" onClick={exportLogs} data-testid="button-export">
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <div>
                <CardTitle>Activity Log</CardTitle>
                <CardDescription>
                  Showing {logs.length} of {total} entries
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No audit logs found</p>
                <p className="text-sm">Try adjusting your filters</p>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[180px]">Date/Time</TableHead>
                      <TableHead className="w-[120px]">User</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead className="w-[120px]">Category</TableHead>
                      <TableHead className="w-[100px]">Status</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map((log) => (
                      <Collapsible 
                        key={log.id} 
                        open={expandedRow === log.id}
                        onOpenChange={(open) => setExpandedRow(open ? log.id : null)}
                      >
                        <TableRow 
                          className="cursor-pointer"
                          data-testid={`row-audit-log-${log.id}`}
                        >
                          <TableCell className="text-sm text-muted-foreground">
                            {formatDate(log.createdAt)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{log.username || "System"}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{log.action}</div>
                            {log.resourceName && (
                              <div className="text-sm text-muted-foreground">
                                {log.resourceName}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="gap-1">
                              {getCategoryIcon(log.category)}
                              {log.category}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(log.status)}
                          </TableCell>
                          <TableCell>
                            <CollapsibleTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <ChevronDown className={`h-4 w-4 transition-transform ${expandedRow === log.id ? 'rotate-180' : ''}`} />
                              </Button>
                            </CollapsibleTrigger>
                          </TableCell>
                        </TableRow>
                        <CollapsibleContent asChild>
                          <TableRow className="bg-muted/30">
                            <TableCell colSpan={6}>
                              <div className="py-4 px-2 space-y-3">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                  <div>
                                    <span className="text-muted-foreground block">Resource Type</span>
                                    <span className="font-medium">{log.resourceType || "N/A"}</span>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground block">Resource ID</span>
                                    <span className="font-medium font-mono text-xs">{log.resourceId || "N/A"}</span>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground block">IP Address</span>
                                    <span className="font-medium font-mono">{log.ipAddress || "N/A"}</span>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground block">User ID</span>
                                    <span className="font-medium font-mono text-xs">{log.userId || "N/A"}</span>
                                  </div>
                                </div>
                                {log.details && (
                                  <div>
                                    <span className="text-muted-foreground block text-sm mb-1">Details</span>
                                    <p className="text-sm bg-muted/50 p-3 rounded-md">{log.details}</p>
                                  </div>
                                )}
                                {log.userAgent && (
                                  <div>
                                    <span className="text-muted-foreground block text-sm mb-1">User Agent</span>
                                    <p className="text-xs text-muted-foreground font-mono truncate">{log.userAgent}</p>
                                  </div>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        </CollapsibleContent>
                      </Collapsible>
                    ))}
                  </TableBody>
                </Table>

                {totalPages > 1 && (
                  <>
                    <Separator className="my-4" />
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        Page {page + 1} of {totalPages}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPage(Math.max(0, page - 1))}
                          disabled={page === 0}
                          data-testid="button-prev-page"
                        >
                          Previous
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                          disabled={page >= totalPages - 1}
                          data-testid="button-next-page"
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
