import AppLayout from "@/components/AppLayout";
import AccessDenied from "@/components/AccessDenied";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Users, Clock, Target } from "lucide-react";
import { useRBAC } from "@/lib/rbac";
import { hasAppAccess } from "@/lib/menu-config";

export default function EPM() {
  const { permissions, isAdmin } = useRBAC();
  
  if (!isAdmin && !hasAppAccess(permissions, "epm")) {
    return <AccessDenied appName="Enterprise Performance Management" />;
  }

  return (
    <AppLayout title="Enterprise Performance Management" appName="EPM">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { label: "Productivity", value: "94%", trend: "+2.5%", icon: TrendingUp },
          { label: "Active Workforce", value: "1,240", trend: "Stable", icon: Users },
          { label: "Avg. Response Time", value: "1.2h", trend: "-15%", icon: Clock },
          { label: "Goal Completion", value: "87%", trend: "+5%", icon: Target },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <stat.icon className="h-5 w-5" />
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${stat.trend.startsWith('+') || stat.trend === 'Stable' || stat.trend.startsWith('-') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {stat.trend}
                </span>
              </div>
              <h3 className="text-2xl font-bold">{stat.value}</h3>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Performance Analytics</CardTitle>
          </CardHeader>
          <CardContent className="h-[400px] flex items-center justify-center bg-muted/10 border-2 border-dashed border-muted rounded-lg m-6">
            <p className="text-muted-foreground">Performance Graph Visualization</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Team Leaders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-gray-200" />
                  <div className="flex-1">
                    <p className="font-medium text-sm">Team Member {i}</p>
                    <div className="w-full h-2 bg-muted rounded-full mt-1 overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: `${Math.random() * 40 + 60}%` }} />
                    </div>
                  </div>
                  <span className="text-xs font-bold">{Math.floor(Math.random() * 20 + 80)}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
