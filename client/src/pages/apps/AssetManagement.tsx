import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Laptop, Monitor, Smartphone, Printer } from "lucide-react";

export default function AssetManagement() {
  return (
    <AppLayout title="Asset Lifecycle Management" appName="ALM">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[
          { icon: Laptop, label: "Laptops", count: 450, color: "bg-blue-100 text-blue-600" },
          { icon: Monitor, label: "Monitors", count: 820, color: "bg-purple-100 text-purple-600" },
          { icon: Smartphone, label: "Mobiles", count: 120, color: "bg-green-100 text-green-600" },
          { icon: Printer, label: "Printers", count: 45, color: "bg-orange-100 text-orange-600" },
        ].map((item) => (
          <Card key={item.label} className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">{item.label}</p>
                <h3 className="text-3xl font-bold">{item.count}</h3>
              </div>
              <div className={`h-12 w-12 rounded-xl ${item.color} flex items-center justify-center`}>
                <item.icon className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Asset Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center bg-muted/20 rounded-md mx-6 mb-6">
            <p className="text-muted-foreground">Chart Visualization Placeholder</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Renewals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-red-500" />
                    <div>
                      <p className="font-medium">Microsoft Office 365 E3</p>
                      <p className="text-xs text-muted-foreground">Expires in 12 days</p>
                    </div>
                  </div>
                  <span className="text-sm font-mono">$12,400</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
