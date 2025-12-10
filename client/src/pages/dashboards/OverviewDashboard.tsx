import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  Package,
  Ticket,
  TrendingUp,
  TrendingDown,
  Activity,
  Clock,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import AppLayout from "@/components/AppLayout";

interface DashboardStats {
  totalUsers: number;
  activeAssets: number;
  openTickets: number;
  productivity: number;
  usersTrend: number;
  assetsTrend: number;
  ticketsTrend: number;
  productivityTrend: number;
}

const stats: DashboardStats = {
  totalUsers: 1247,
  activeAssets: 3842,
  openTickets: 156,
  productivity: 87.5,
  usersTrend: 12.5,
  assetsTrend: 8.2,
  ticketsTrend: -15.3,
  productivityTrend: 5.7,
};

const recentActivities = [
  { id: 1, type: "user", action: "New user registered", time: "5 min ago", status: "success" },
  { id: 2, type: "asset", action: "Asset deployed to IT dept", time: "15 min ago", status: "success" },
  { id: 3, type: "ticket", action: "Critical ticket resolved", time: "32 min ago", status: "success" },
  { id: 4, type: "alert", action: "Security alert triggered", time: "1 hour ago", status: "warning" },
  { id: 5, type: "user", action: "Password reset requested", time: "2 hours ago", status: "info" },
];

const systemHealth = [
  { name: "API Server", status: "healthy", uptime: "99.9%" },
  { name: "Database", status: "healthy", uptime: "99.8%" },
  { name: "File Storage", status: "healthy", uptime: "99.7%" },
  { name: "Email Service", status: "warning", uptime: "98.5%" },
];

export default function OverviewDashboard() {
  return (
    <AppLayout title="Overview Dashboard" appName="Service Desk">
      <div className="p-6 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <Card data-testid="card-stat-users">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                  <h3 className="text-2xl font-bold mt-1" data-testid="text-total-users">{stats.totalUsers.toLocaleString()}</h3>
                  <div className="flex items-center mt-2 gap-1">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-500">+{stats.usersTrend}%</span>
                  </div>
                </div>
                <div className="h-12 w-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-stat-assets">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Assets</p>
                  <h3 className="text-2xl font-bold mt-1" data-testid="text-active-assets">{stats.activeAssets.toLocaleString()}</h3>
                  <div className="flex items-center mt-2 gap-1">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-500">+{stats.assetsTrend}%</span>
                  </div>
                </div>
                <div className="h-12 w-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                  <Package className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-stat-tickets">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Open Tickets</p>
                  <h3 className="text-2xl font-bold mt-1" data-testid="text-open-tickets">{stats.openTickets}</h3>
                  <div className="flex items-center mt-2 gap-1">
                    <TrendingDown className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-500">{stats.ticketsTrend}%</span>
                  </div>
                </div>
                <div className="h-12 w-12 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                  <Ticket className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-stat-productivity">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Productivity Score</p>
                  <h3 className="text-2xl font-bold mt-1" data-testid="text-productivity">{stats.productivity}%</h3>
                  <div className="flex items-center mt-2 gap-1">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-500">+{stats.productivityTrend}%</span>
                  </div>
                </div>
                <div className="h-12 w-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <Activity className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card data-testid="card-recent-activity">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between gap-4 py-2 border-b last:border-0">
                      <div className="flex items-center gap-3">
                        <div className={`h-2 w-2 rounded-full ${
                          activity.status === 'success' ? 'bg-green-500' :
                          activity.status === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                        }`} />
                        <span className="text-sm" data-testid={`text-activity-${activity.id}`}>{activity.action}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{activity.time}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card data-testid="card-system-health">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  System Health
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {systemHealth.map((system) => (
                    <div key={system.name} className="flex items-center justify-between gap-4 py-2 border-b last:border-0">
                      <div className="flex items-center gap-3">
                        {system.status === 'healthy' ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-yellow-500" />
                        )}
                        <span className="text-sm" data-testid={`text-system-${system.name.toLowerCase().replace(' ', '-')}`}>{system.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={system.status === 'healthy' ? 'default' : 'secondary'} className="text-xs">
                          {system.uptime}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </AppLayout>
  );
}
