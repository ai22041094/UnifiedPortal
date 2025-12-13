import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  TrendingUp,
  TrendingDown,
  Users,
  Clock,
  Zap,
  Target,
  Award,
  Calendar,
  BarChart3,
  Activity,
  Monitor,
  Coffee,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import AppLayout from "@/components/AppLayout";

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

export default function ProductivityDashboard() {
  const { data: stats, isLoading } = useQuery<DashboardStatsData>({
    queryKey: ["/api/epm/dashboard-stats"],
  });

  const productivityCards = [
    { name: "Productivity Score", value: stats?.avgProductivity || 0, unit: "%", trend: stats?.productivityTrend || 0, icon: Zap, color: "green" },
    { name: "Active Hours", value: stats?.activeTimeHours || 0, unit: "hrs", trend: stats?.activeTimeTrend || 0, icon: Clock, color: "blue" },
    { name: "Active Agents", value: stats?.activeEmployees || 0, unit: "", trend: stats?.activeEmployeesToday || 0, icon: Target, color: "purple" },
    { name: "Alerts", value: stats?.alerts || 0, unit: "", trend: 0, icon: Users, color: "orange" },
  ];

  const insights = stats ? [
    { id: 1, type: stats.productivityTrend >= 0 ? "positive" : "warning", message: `Team productivity ${stats.productivityTrend >= 0 ? 'increased' : 'decreased'} by ${Math.abs(stats.productivityTrend)}% this week`, icon: stats.productivityTrend >= 0 ? TrendingUp : TrendingDown },
    { id: 2, type: "info", message: `${stats.activeEmployees} total agents tracked`, icon: Target },
    { id: 3, type: stats.alerts > 0 ? "warning" : "positive", message: stats.alerts > 0 ? `${stats.alerts} extended sleep events detected` : "No alerts - all systems normal", icon: Users },
    { id: 4, type: "info", message: `Average active time: ${stats.activeTimeHours}h per day`, icon: Clock },
  ] : [];

  if (isLoading) {
    return (
      <AppLayout title="Productivity Dashboard" appName="Service Desk">
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Productivity Dashboard" appName="Service Desk">
      <div className="p-6 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {productivityCards.map((card, index) => (
            <Card key={card.name} data-testid={`card-productivity-${index}`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{card.name}</p>
                    <h3 className="text-2xl font-bold mt-1" data-testid={`text-productivity-${index}`}>
                      {card.value}{card.unit}
                    </h3>
                    <div className="flex items-center mt-2 gap-1">
                      {card.trend >= 0 ? (
                        <>
                          <TrendingUp className="h-4 w-4 text-green-500" />
                          <span className="text-sm text-green-500">+{card.trend}{card.unit === '%' ? '%' : ''}</span>
                        </>
                      ) : (
                        <>
                          <TrendingDown className="h-4 w-4 text-red-500" />
                          <span className="text-sm text-red-500">{card.trend}{card.unit === '%' ? '%' : ''}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className={`h-12 w-12 rounded-xl bg-${card.color}-100 dark:bg-${card.color}-900/30 flex items-center justify-center`}>
                    <card.icon className={`h-6 w-6 text-${card.color}-600 dark:text-${card.color}-400`} />
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
            <Card data-testid="card-top-performers">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Top Performing Agents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats?.topPerformers?.map((agent, index) => (
                    <div key={agent.agentGuid} className="flex items-center justify-between gap-4 py-2 border-b last:border-0">
                      <div className="flex items-center gap-3">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          index === 0 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                          index === 1 ? 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' :
                          index === 2 ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                          'bg-muted text-muted-foreground'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <span className="font-medium text-sm" data-testid={`text-agent-${index}`}>Agent {agent.agentGuid.slice(0, 8)}...</span>
                          <p className="text-xs text-muted-foreground">{agent.activeHours}h active</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold">{agent.productivityScore}%</span>
                      </div>
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
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card data-testid="card-weekly-trends">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Weekly Productivity Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats?.weeklyTrends?.map((day) => (
                    <div key={day.day} className="space-y-2">
                      <div className="flex items-center justify-between gap-4">
                        <span className="font-medium text-sm w-12" data-testid={`text-day-${day.day.toLowerCase()}`}>{day.day}</span>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>Active: {day.activeHours}h</span>
                          <span>Productivity: {day.productivity}%</span>
                        </div>
                      </div>
                      <Progress value={day.productivity} className="h-2" />
                    </div>
                  ))}
                  {(!stats?.weeklyTrends || stats.weeklyTrends.length === 0) && (
                    <div className="text-center py-4 text-muted-foreground text-sm">
                      No weekly data available yet
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card data-testid="card-insights">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Productivity Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {insights.map((insight) => (
                  <div 
                    key={insight.id} 
                    className={`flex items-center gap-3 p-4 rounded-lg ${
                      insight.type === 'positive' ? 'bg-green-50 dark:bg-green-900/20' :
                      insight.type === 'warning' ? 'bg-yellow-50 dark:bg-yellow-900/20' :
                      'bg-blue-50 dark:bg-blue-900/20'
                    }`}
                  >
                    <insight.icon className={`h-5 w-5 ${
                      insight.type === 'positive' ? 'text-green-600 dark:text-green-400' :
                      insight.type === 'warning' ? 'text-yellow-600 dark:text-yellow-400' :
                      'text-blue-600 dark:text-blue-400'
                    }`} />
                    <span className="text-sm" data-testid={`text-insight-${insight.id}`}>{insight.message}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card data-testid="card-time-distribution">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Summary Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center p-4 rounded-lg bg-primary/10">
                  <Monitor className="h-8 w-8 text-primary mx-auto mb-2" />
                  <div className="text-2xl font-bold" data-testid="text-active-time">{stats?.activeTimeHours || 0}h</div>
                  <p className="text-xs text-muted-foreground">Avg Active Time/Day</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-purple-100 dark:bg-purple-900/20">
                  <Target className="h-8 w-8 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400" data-testid="text-productivity">{stats?.avgProductivity || 0}%</div>
                  <p className="text-xs text-muted-foreground">Productivity Score</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-orange-100 dark:bg-orange-900/20">
                  <Users className="h-8 w-8 text-orange-600 dark:text-orange-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-orange-600 dark:text-orange-400" data-testid="text-agents">{stats?.activeEmployees || 0}</div>
                  <p className="text-xs text-muted-foreground">Total Agents</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-green-100 dark:bg-green-900/20">
                  <Activity className="h-8 w-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400" data-testid="text-today">{stats?.activeEmployeesToday || 0}</div>
                  <p className="text-xs text-muted-foreground">Active Today</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AppLayout>
  );
}
