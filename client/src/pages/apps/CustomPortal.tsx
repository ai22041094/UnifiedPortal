import AppLayout from "@/components/AppLayout";
import AccessDenied from "@/components/AccessDenied";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useRBAC } from "@/lib/rbac";
import { hasAppAccess } from "@/lib/menu-config";

export default function CustomPortal() {
  const { permissions, isAdmin } = useRBAC();
  
  if (!isAdmin && !hasAppAccess(permissions, "portal")) {
    return <AccessDenied appName="Custom Portal" />;
  }

  return (
    <AppLayout title="Custom Portal Dashboard" appName="Custom Portal">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Licenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">1,248</div>
            <p className="text-xs text-green-500 mt-1">+12% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">42</div>
            <p className="text-xs text-yellow-500 mt-1">Requires attention</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Spend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">$48.2k</div>
            <p className="text-xs text-muted-foreground mt-1">Current fiscal year</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold">Recent Requisitions</h2>
        <Button>
          <PlusCircle className="h-4 w-4 mr-2" />
          New Requisition
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                    #{1000 + i}
                  </div>
                  <div>
                    <h3 className="font-medium">Software License Request - Adobe CC</h3>
                    <p className="text-sm text-muted-foreground">Requested by John Doe • 2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs font-medium">
                    Pending Approval
                  </span>
                  <Button variant="outline" size="sm">View</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </AppLayout>
  );
}
