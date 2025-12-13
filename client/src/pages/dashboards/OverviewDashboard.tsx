import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  Users,
  AppWindow,
  Globe,
  Activity,
  TrendingUp,
  Clock,
  Monitor,
  BarChart3,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import AppLayout from "@/components/AppLayout";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface EpmOverviewStats {
  totalAgents: number;
  activeAgents: number;
  totalApps: number;
  totalUrls: number;
  avgProductivity: number;
  totalActiveHours: number;
  topApps: { name: string; usageTime: number; usageCount: number }[];
  topUrls: { domain: string; visitCount: number; urlCount: number }[];
  activityByHour: { hour: number; count: number }[];
  productivityTrend: { day: string; productivity: number }[];
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16', '#f97316', '#6366f1'];

export default function OverviewDashboard() {
  const { data: stats, isLoading } = useQuery<EpmOverviewStats>({
    queryKey: ["/api/epm/overview-stats"],
  });

  if (isLoading) {
    return (
      <AppLayout title="EPM Overview Dashboard" appName="EPM">
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} data-testid={`card-skeleton-${i}`}>
                <CardContent className="p-6">
                  <div className="animate-pulse space-y-3">
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                    <div className="h-8 bg-muted rounded w-3/4"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </AppLayout>
    );
  }

  const kpiCards = [
    {
      title: "Total Agents",
      value: stats?.totalAgents || 0,
      subValue: `${stats?.activeAgents || 0} active today`,
      icon: Users,
      color: "blue",
    },
    {
      title: "Applications Tracked",
      value: stats?.totalApps || 0,
      subValue: "Unique applications",
      icon: AppWindow,
      color: "green",
    },
    {
      title: "Websites Tracked",
      value: stats?.totalUrls || 0,
      subValue: "Unique domains",
      icon: Globe,
      color: "purple",
    },
    {
      title: "Avg Productivity",
      value: `${stats?.avgProductivity || 0}%`,
      subValue: `${stats?.totalActiveHours || 0}h total active time`,
      icon: Activity,
      color: "orange",
    },
  ];

  return (
    <AppLayout title="EPM Overview Dashboard" appName="EPM">
      <div className="p-6 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {kpiCards.map((card, index) => (
            <Card key={card.title} data-testid={`card-kpi-${index}`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-muted-foreground">{card.title}</p>
                    <h3 className="text-2xl font-bold mt-1" data-testid={`text-kpi-value-${index}`}>
                      {typeof card.value === 'number' ? card.value.toLocaleString() : card.value}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">{card.subValue}</p>
                  </div>
                  <div className={`h-12 w-12 rounded-xl flex-shrink-0 flex items-center justify-center ${
                    card.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/30' :
                    card.color === 'green' ? 'bg-green-100 dark:bg-green-900/30' :
                    card.color === 'purple' ? 'bg-purple-100 dark:bg-purple-900/30' :
                    'bg-orange-100 dark:bg-orange-900/30'
                  }`}>
                    <card.icon className={`h-6 w-6 ${
                      card.color === 'blue' ? 'text-blue-600 dark:text-blue-400' :
                      card.color === 'green' ? 'text-green-600 dark:text-green-400' :
                      card.color === 'purple' ? 'text-purple-600 dark:text-purple-400' :
                      'text-orange-600 dark:text-orange-400'
                    }`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card data-testid="card-top-apps">
              <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                <CardTitle className="flex items-center gap-2">
                  <AppWindow className="h-5 w-5" />
                  Top 10 Applications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats?.topApps?.slice(0, 10).map((app, index) => (
                    <div key={app.name} className="space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <span className="text-xs text-muted-foreground w-4">{index + 1}.</span>
                          <span className="text-sm truncate" data-testid={`text-app-name-${index}`}>{app.name}</span>
                        </div>
                        <span className="text-xs text-muted-foreground flex-shrink-0">{app.usageTime} min</span>
                      </div>
                      <Progress 
                        value={stats?.topApps?.[0] ? (app.usageTime / stats.topApps[0].usageTime) * 100 : 0} 
                        className="h-1.5"
                      />
                    </div>
                  ))}
                  {(!stats?.topApps || stats.topApps.length === 0) && (
                    <p className="text-sm text-muted-foreground text-center py-4">No application data available</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card data-testid="card-top-urls">
              <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Top 10 Websites
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats?.topUrls?.slice(0, 10).map((url, index) => (
                    <div key={url.domain} className="space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <span className="text-xs text-muted-foreground w-4">{index + 1}.</span>
                          <span className="text-sm truncate" data-testid={`text-url-domain-${index}`}>{url.domain}</span>
                        </div>
                        <span className="text-xs text-muted-foreground flex-shrink-0">{url.visitCount} visits</span>
                      </div>
                      <Progress 
                        value={stats?.topUrls?.[0] ? (url.visitCount / stats.topUrls[0].visitCount) * 100 : 0} 
                        className="h-1.5"
                      />
                    </div>
                  ))}
                  {(!stats?.topUrls || stats.topUrls.length === 0) && (
                    <p className="text-sm text-muted-foreground text-center py-4">No website data available</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card data-testid="card-productivity-trend">
              <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Productivity Trend (Last 7 Days)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={stats?.productivityTrend || []}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="day" className="text-xs" />
                      <YAxis domain={[0, 100]} className="text-xs" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                        formatter={(value: number) => [`${value}%`, 'Productivity']}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="productivity" 
                        stroke="#3b82f6" 
                        strokeWidth={2}
                        dot={{ fill: '#3b82f6', strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card data-testid="card-activity-by-hour">
              <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Activity by Hour
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats?.activityByHour || []}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis 
                        dataKey="hour" 
                        className="text-xs"
                        tickFormatter={(value) => `${value}:00`}
                      />
                      <YAxis className="text-xs" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                        formatter={(value: number) => [value, 'Events']}
                        labelFormatter={(label) => `${label}:00`}
                      />
                      <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Card data-testid="card-app-distribution">
              <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Application Usage Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats?.topApps?.slice(0, 5) || []}
                        dataKey="usageTime"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label={({ name, percent }) => `${name.substring(0, 10)}... ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {stats?.topApps?.slice(0, 5).map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                        formatter={(value: number) => [`${value} min`, 'Usage Time']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <Card data-testid="card-website-distribution">
              <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="h-5 w-5" />
                  Website Visit Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats?.topUrls?.slice(0, 5) || []} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis type="number" className="text-xs" />
                      <YAxis 
                        type="category" 
                        dataKey="domain" 
                        className="text-xs"
                        width={100}
                        tickFormatter={(value) => value.length > 15 ? `${value.substring(0, 15)}...` : value}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                        formatter={(value: number) => [value, 'Visits']}
                      />
                      <Bar dataKey="visitCount" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </AppLayout>
  );
}
