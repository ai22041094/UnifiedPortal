import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Users,
  Shield,
  Settings,
  Building,
  FileText,
  Bell,
  Lock,
  Database,
  Activity
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useRBAC } from "@/lib/rbac";

const adminMenuItems = [
  {
    id: "user-management",
    title: "User Management",
    description: "Create, edit, and manage user accounts",
    icon: Users,
    href: "/admin/users",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    permission: "admin.user-master",
    available: true,
  },
  {
    id: "role-management",
    title: "Role Management",
    description: "Configure roles and permissions",
    icon: Shield,
    href: "/admin/roles",
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    permission: "admin.role-master",
    available: true,
  },
  {
    id: "organization",
    title: "Organization Settings",
    description: "Manage organization details and branding",
    icon: Building,
    href: "/admin/organization",
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
    permission: "admin.organization",
    available: true,
  },
  {
    id: "audit-logs",
    title: "Audit Logs",
    description: "View system activity and audit trails",
    icon: FileText,
    href: "#",
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    permission: "admin.audit-logs",
    available: false,
  },
  {
    id: "notifications",
    title: "Notification Settings",
    description: "Configure system notifications and alerts",
    icon: Bell,
    href: "#",
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10",
    permission: "admin.notifications",
    available: false,
  },
  {
    id: "security",
    title: "Security Settings",
    description: "Manage password policies and security options",
    icon: Lock,
    href: "#",
    color: "text-red-500",
    bgColor: "bg-red-500/10",
    permission: "admin.security",
    available: false,
  },
  {
    id: "system-config",
    title: "System Configuration",
    description: "Configure system-wide settings",
    icon: Settings,
    href: "#",
    color: "text-indigo-500",
    bgColor: "bg-indigo-500/10",
    permission: "admin.system",
    available: false,
  },
  {
    id: "database",
    title: "Database Management",
    description: "Backup, restore, and manage database",
    icon: Database,
    href: "#",
    color: "text-cyan-500",
    bgColor: "bg-cyan-500/10",
    permission: "admin.database",
    available: false,
  },
  {
    id: "monitoring",
    title: "System Monitoring",
    description: "Monitor system health and performance",
    icon: Activity,
    href: "#",
    color: "text-pink-500",
    bgColor: "bg-pink-500/10",
    permission: "admin.monitoring",
    available: false,
  },
];

export default function AdminConsole() {
  const [, navigate] = useLocation();
  const { hasPermission, isAdmin } = useRBAC();

  const filteredMenuItems = adminMenuItems.filter((item) => {
    if (isAdmin) return true;
    return hasPermission(item.permission);
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-6 h-16 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/portal")} data-testid="button-back">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
              <div className="h-4 w-4 bg-white rounded-sm transform rotate-45" />
            </div>
            <span className="text-xl font-bold tracking-tight">pcvisor</span>
          </div>
          <span className="text-muted-foreground">|</span>
          <span className="font-medium">Admin Console</span>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-2">Administration Console</h1>
          <p className="text-muted-foreground">
            Manage users, roles, and system-wide settings
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredMenuItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 + index * 0.05 }}
            >
              {item.available ? (
                <Link href={item.href} data-testid={`link-admin-${item.id}`}>
                  <Card className="h-full hover-elevate cursor-pointer group transition-all duration-300">
                    <CardHeader className="space-y-3">
                      <div className={`h-12 w-12 rounded-lg ${item.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                        <item.icon className={`h-6 w-6 ${item.color}`} />
                      </div>
                      <CardTitle className="text-lg">{item.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-sm">
                        {item.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                </Link>
              ) : (
                <Card className="h-full opacity-50 cursor-not-allowed" data-testid={`card-admin-${item.id}-disabled`}>
                  <CardHeader className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className={`h-12 w-12 rounded-lg ${item.bgColor} flex items-center justify-center`}>
                        <item.icon className={`h-6 w-6 ${item.color}`} />
                      </div>
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">Coming Soon</span>
                    </div>
                    <CardTitle className="text-lg">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-sm">
                      {item.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          ))}
        </motion.div>

        {filteredMenuItems.length === 0 && (
          <div className="text-center py-12">
            <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Access</h3>
            <p className="text-muted-foreground">
              You don't have permission to access any admin features.
            </p>
            <Button onClick={() => navigate("/portal")} className="mt-4" data-testid="button-go-back">
              Go Back to Dashboard
            </Button>
          </div>
        )}

        <footer className="mt-12 pt-6 border-t border-border/50 text-center text-sm text-muted-foreground">
          Hitachi Systems India Pvt Ltd © 2025. All rights reserved.
        </footer>
      </main>
    </div>
  );
}
