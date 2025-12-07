import AppLayout from "@/components/AppLayout";
import AccessDenied from "@/components/AccessDenied";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRBAC } from "@/lib/rbac";
import { hasAppAccess } from "@/lib/menu-config";

export default function ServiceDesk() {
  const { permissions, isAdmin } = useRBAC();
  
  if (!isAdmin && !hasAppAccess(permissions, "sd")) {
    return <AccessDenied appName="Service Desk" />;
  }

  return (
    <AppLayout title="Service Desk Dashboard" appName="Service Desk">
      <div className="flex gap-4 mb-8">
        <Button size="lg" className="shadow-lg shadow-primary/20">
          Create New Ticket
        </Button>
        <Button variant="outline" size="lg">
          View My Tickets
        </Button>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Recent Incidents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { title: "Email server connectivity issue", priority: "High", status: "Open", id: "INC-2024-001" },
              { title: "VPN access denied for remote users", priority: "Critical", status: "In Progress", id: "INC-2024-002" },
              { title: "Printer on 2nd floor jamming", priority: "Low", status: "Resolved", id: "INC-2024-003" },
              { title: "Software installation request - VS Code", priority: "Medium", status: "Open", id: "SR-2024-045" },
            ].map((ticket) => (
              <div key={ticket.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors group cursor-pointer">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-muted-foreground">{ticket.id}</span>
                    <h4 className="font-medium group-hover:text-primary transition-colors">{ticket.title}</h4>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant={ticket.priority === "Critical" ? "destructive" : "secondary"}>
                      {ticket.priority}
                    </Badge>
                    <Badge variant="outline">{ticket.status}</Badge>
                  </div>
                </div>
                <Button variant="ghost" size="sm">View Details</Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </AppLayout>
  );
}
