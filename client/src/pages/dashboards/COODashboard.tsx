import { motion } from "framer-motion";
import {
  Activity,
  Users,
  Clock,
  Target,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  AlertTriangle,
  Workflow,
  Gauge,
  Timer,
  BarChart3,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import AppLayout from "@/components/AppLayout";

const operationalMetrics = {
  operationalEfficiency: 92.4,
  processCompliance: 96.8,
  slaAdherence: 98.2,
  resourceUtilization: 85.7,
};

const departmentPerformance = [
  { name: "IT Operations", efficiency: 94, sla: 98.5, tickets: 156, resolved: 142 },
  { name: "Human Resources", efficiency: 91, sla: 97.2, tickets: 89, resolved: 82 },
  { name: "Finance", efficiency: 96, sla: 99.1, tickets: 45, resolved: 44 },
  { name: "Facilities", efficiency: 88, sla: 95.8, tickets: 78, resolved: 68 },
  { name: "Procurement", efficiency: 90, sla: 96.5, tickets: 62, resolved: 56 },
];

const pendingApprovals = [
  { id: 1, type: "Budget Request", department: "IT", amount: "$45,000", priority: "high", age: "2 days" },
  { id: 2, type: "Vendor Contract", department: "Procurement", amount: "$125,000", priority: "medium", age: "5 days" },
  { id: 3, type: "Hiring Request", department: "HR", amount: "-", priority: "high", age: "1 day" },
  { id: 4, type: "Equipment Purchase", department: "Facilities", amount: "$12,500", priority: "low", age: "7 days" },
];

const kpiCards = [
  { name: "Operational Efficiency", value: 92.4, target: 90, unit: "%", trend: 3.2, icon: Gauge },
  { name: "Process Compliance", value: 96.8, target: 95, unit: "%", trend: 1.8, icon: CheckCircle },
  { name: "SLA Adherence", value: 98.2, target: 97, unit: "%", trend: 0.5, icon: Timer },
  { name: "Resource Utilization", value: 85.7, target: 85, unit: "%", trend: 2.1, icon: Users },
];

export default function COODashboard() {
  return (
    <AppLayout title="COO Dashboard" appName="Service Desk">
      <div className="p-6 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {kpiCards.map((kpi, index) => (
            <Card key={kpi.name} data-testid={`card-kpi-${index}`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{kpi.name}</p>
                    <h3 className="text-2xl font-bold mt-1" data-testid={`text-kpi-${index}`}>{kpi.value}{kpi.unit}</h3>
                    <div className="flex items-center mt-2 gap-1">
                      {kpi.value >= kpi.target ? (
                        <>
                          <TrendingUp className="h-4 w-4 text-green-500" />
                          <span className="text-sm text-green-500">+{kpi.trend}%</span>
                        </>
                      ) : (
                        <>
                          <TrendingDown className="h-4 w-4 text-red-500" />
                          <span className="text-sm text-red-500">-{kpi.trend}%</span>
                        </>
                      )}
                      <span className="text-xs text-muted-foreground ml-2">Target: {kpi.target}%</span>
                    </div>
                  </div>
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <kpi.icon className="h-6 w-6 text-primary" />
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
            <Card data-testid="card-department-performance">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Department Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {departmentPerformance.map((dept) => (
                    <div key={dept.name} className="space-y-2">
                      <div className="flex items-center justify-between gap-4">
                        <span className="font-medium text-sm" data-testid={`text-dept-${dept.name.toLowerCase().replace(' ', '-')}`}>{dept.name}</span>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-muted-foreground">SLA: {dept.sla}%</span>
                          <Badge variant={dept.efficiency >= 90 ? "default" : "secondary"}>
                            {dept.resolved}/{dept.tickets} resolved
                          </Badge>
                        </div>
                      </div>
                      <Progress value={dept.efficiency} className="h-2" />
                      <p className="text-xs text-muted-foreground text-right">{dept.efficiency}% efficiency</p>
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
            <Card data-testid="card-pending-approvals">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Pending Approvals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingApprovals.map((approval) => (
                    <div key={approval.id} className="flex items-center justify-between gap-4 py-3 border-b last:border-0">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm" data-testid={`text-approval-${approval.id}`}>{approval.type}</span>
                          <Badge 
                            variant={
                              approval.priority === 'high' ? 'destructive' : 
                              approval.priority === 'medium' ? 'default' : 'secondary'
                            }
                            className="text-xs"
                          >
                            {approval.priority}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {approval.department} {approval.amount !== '-' && `- ${approval.amount}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {approval.age}
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
          <Card data-testid="card-process-overview">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Workflow className="h-5 w-5" />
                Process Health Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center p-4 rounded-lg bg-green-50 dark:bg-green-900/20">
                  <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400" data-testid="text-processes-healthy">24</div>
                  <p className="text-xs text-muted-foreground">Healthy Processes</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
                  <AlertTriangle className="h-8 w-8 text-yellow-600 dark:text-yellow-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400" data-testid="text-processes-warning">3</div>
                  <p className="text-xs text-muted-foreground">Needs Attention</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                  <Activity className="h-8 w-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400" data-testid="text-processes-active">156</div>
                  <p className="text-xs text-muted-foreground">Active Workflows</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                  <Target className="h-8 w-8 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400" data-testid="text-processes-completed">1,247</div>
                  <p className="text-xs text-muted-foreground">Completed This Month</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AppLayout>
  );
}
