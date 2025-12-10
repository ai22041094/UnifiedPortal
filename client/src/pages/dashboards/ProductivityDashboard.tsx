import { motion } from "framer-motion";
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
import AppLayout from "@/components/AppLayout";

const productivityMetrics = {
  overallScore: 87.5,
  activeTime: 6.8,
  focusTime: 4.2,
  meetingTime: 1.8,
  breakTime: 0.8,
  averageScore: 82.3,
};

const topPerformers = [
  { id: 1, name: "Engineering Team", score: 94.2, trend: 5.3, members: 24 },
  { id: 2, name: "Product Team", score: 91.8, trend: 3.7, members: 12 },
  { id: 3, name: "Design Team", score: 89.5, trend: 2.1, members: 8 },
  { id: 4, name: "Marketing Team", score: 86.3, trend: -1.2, members: 15 },
  { id: 5, name: "Sales Team", score: 84.7, trend: 4.5, members: 32 },
];

const weeklyTrends = [
  { day: "Mon", productivity: 85, focus: 4.5, meetings: 2.1 },
  { day: "Tue", productivity: 88, focus: 4.8, meetings: 1.8 },
  { day: "Wed", productivity: 82, focus: 3.9, meetings: 2.5 },
  { day: "Thu", productivity: 91, focus: 5.2, meetings: 1.5 },
  { day: "Fri", productivity: 79, focus: 3.5, meetings: 2.8 },
];

const productivityCards = [
  { name: "Productivity Score", value: 87.5, unit: "%", trend: 4.2, icon: Zap, color: "green" },
  { name: "Active Hours", value: 6.8, unit: "hrs", trend: 0.5, icon: Clock, color: "blue" },
  { name: "Focus Time", value: 4.2, unit: "hrs", trend: 0.8, icon: Target, color: "purple" },
  { name: "Meeting Time", value: 1.8, unit: "hrs", trend: -0.3, icon: Users, color: "orange" },
];

const insights = [
  { id: 1, type: "positive", message: "Team productivity increased by 12% this week", icon: TrendingUp },
  { id: 2, type: "positive", message: "Focus time improved across all departments", icon: Target },
  { id: 3, type: "warning", message: "Meeting overload detected in Sales team", icon: Users },
  { id: 4, type: "info", message: "Peak productivity hours: 9 AM - 11 AM", icon: Clock },
];

export default function ProductivityDashboard() {
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
                  Top Performing Teams
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topPerformers.map((team, index) => (
                    <div key={team.id} className="flex items-center justify-between gap-4 py-2 border-b last:border-0">
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
                          <span className="font-medium text-sm" data-testid={`text-team-${team.id}`}>{team.name}</span>
                          <p className="text-xs text-muted-foreground">{team.members} members</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold">{team.score}%</span>
                        <div className={`flex items-center gap-0.5 text-xs ${
                          team.trend >= 0 ? 'text-green-500' : 'text-red-500'
                        }`}>
                          {team.trend >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                          {Math.abs(team.trend)}%
                        </div>
                      </div>
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
            <Card data-testid="card-weekly-trends">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Weekly Productivity Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {weeklyTrends.map((day) => (
                    <div key={day.day} className="space-y-2">
                      <div className="flex items-center justify-between gap-4">
                        <span className="font-medium text-sm w-12" data-testid={`text-day-${day.day.toLowerCase()}`}>{day.day}</span>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>Focus: {day.focus}h</span>
                          <span>Meetings: {day.meetings}h</span>
                        </div>
                      </div>
                      <Progress value={day.productivity} className="h-2" />
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
                Daily Time Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center p-4 rounded-lg bg-primary/10">
                  <Monitor className="h-8 w-8 text-primary mx-auto mb-2" />
                  <div className="text-2xl font-bold" data-testid="text-active-time">{productivityMetrics.activeTime}h</div>
                  <p className="text-xs text-muted-foreground">Active Time</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-purple-100 dark:bg-purple-900/20">
                  <Target className="h-8 w-8 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400" data-testid="text-focus-time">{productivityMetrics.focusTime}h</div>
                  <p className="text-xs text-muted-foreground">Focus Time</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-orange-100 dark:bg-orange-900/20">
                  <Users className="h-8 w-8 text-orange-600 dark:text-orange-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-orange-600 dark:text-orange-400" data-testid="text-meeting-time">{productivityMetrics.meetingTime}h</div>
                  <p className="text-xs text-muted-foreground">Meeting Time</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-green-100 dark:bg-green-900/20">
                  <Coffee className="h-8 w-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400" data-testid="text-break-time">{productivityMetrics.breakTime}h</div>
                  <p className="text-xs text-muted-foreground">Break Time</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AppLayout>
  );
}
