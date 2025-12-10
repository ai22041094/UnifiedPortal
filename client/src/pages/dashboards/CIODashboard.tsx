import { motion } from "framer-motion";
import {
  Server,
  Shield,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Cloud,
  Lock,
  Cpu,
  HardDrive,
  Network,
  Database,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import AppLayout from "@/components/AppLayout";

const itMetrics = {
  infrastructureHealth: 94.5,
  securityScore: 91.2,
  cloudAdoption: 78.3,
  digitalTransformation: 65.8,
  itBudgetUtilization: 82.4,
  projectDelivery: 88.7,
};

const strategicInitiatives = [
  { id: 1, name: "Cloud Migration Phase 2", progress: 72, status: "on-track", deadline: "Q1 2026" },
  { id: 2, name: "Zero Trust Implementation", progress: 45, status: "on-track", deadline: "Q2 2026" },
  { id: 3, name: "AI/ML Platform Rollout", progress: 28, status: "at-risk", deadline: "Q3 2026" },
  { id: 4, name: "Legacy System Modernization", progress: 85, status: "on-track", deadline: "Q4 2025" },
];

const securityAlerts = [
  { id: 1, type: "critical", message: "Unusual login pattern detected", time: "2 hours ago" },
  { id: 2, type: "warning", message: "SSL certificate expiring in 30 days", time: "1 day ago" },
  { id: 3, type: "info", message: "Security patch available for deployment", time: "2 days ago" },
];

const infrastructureStats = [
  { name: "Servers", value: 245, trend: 5, icon: Server },
  { name: "Cloud Resources", value: 892, trend: 18, icon: Cloud },
  { name: "Security Policies", value: 156, trend: 12, icon: Shield },
  { name: "Network Devices", value: 1247, trend: 3, icon: Network },
];

export default function CIODashboard() {
  return (
    <AppLayout title="CIO Dashboard" appName="Service Desk">
      <div className="p-6 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {infrastructureStats.map((stat, index) => (
            <Card key={stat.name} data-testid={`card-stat-${stat.name.toLowerCase().replace(' ', '-')}`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.name}</p>
                    <h3 className="text-2xl font-bold mt-1" data-testid={`text-${stat.name.toLowerCase().replace(' ', '-')}`}>{stat.value.toLocaleString()}</h3>
                    <div className="flex items-center mt-2 gap-1">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-green-500">+{stat.trend}%</span>
                    </div>
                  </div>
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <stat.icon className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-2"
          >
            <Card data-testid="card-strategic-initiatives">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Strategic Initiatives
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {strategicInitiatives.map((initiative) => (
                    <div key={initiative.id} className="space-y-2">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <span className="font-medium" data-testid={`text-initiative-${initiative.id}`}>{initiative.name}</span>
                          <Badge variant={initiative.status === 'on-track' ? 'default' : 'destructive'} className="text-xs">
                            {initiative.status === 'on-track' ? 'On Track' : 'At Risk'}
                          </Badge>
                        </div>
                        <span className="text-sm text-muted-foreground">{initiative.deadline}</span>
                      </div>
                      <Progress value={initiative.progress} className="h-2" />
                      <p className="text-xs text-muted-foreground text-right">{initiative.progress}% complete</p>
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
            <Card data-testid="card-security-alerts">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {securityAlerts.map((alert) => (
                    <div key={alert.id} className="flex items-start gap-3 py-2 border-b last:border-0">
                      <div className={`mt-0.5 h-2 w-2 rounded-full ${
                        alert.type === 'critical' ? 'bg-red-500' :
                        alert.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm" data-testid={`text-alert-${alert.id}`}>{alert.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">{alert.time}</p>
                      </div>
                    </div>
                  ))}
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
          <Card data-testid="card-it-metrics">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cpu className="h-5 w-5" />
                Key IT Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                {Object.entries(itMetrics).map(([key, value]) => (
                  <div key={key} className="text-center">
                    <div className="text-2xl font-bold text-primary" data-testid={`text-metric-${key}`}>{value}%</div>
                    <p className="text-xs text-muted-foreground mt-1 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AppLayout>
  );
}
