import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Package,
  HeadphonesIcon,
  BarChart3,
  LogOut,
  Bell,
  Users,
  Clock,
  Activity,
  TrendingUp,
  Shield,
  Settings,
  User,
  KeyRound,
  ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/lib/auth";
import { useRBAC } from "@/lib/rbac";
import { Badge } from "@/components/ui/badge";

const apps = [
  {
    id: "custom-portal",
    title: "Custom Portal",
    description: "Enhances management, streamlines procurement, optimizes licensing.",
    icon: LayoutDashboard,
    href: "/apps/custom-portal",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  {
    id: "alm",
    title: "Asset Lifecycle Management",
    description: "IT & Non-IT ALM: Smooth Control from Requisition to Disposal",
    icon: Package,
    href: "/apps/alm",
    color: "text-indigo-500",
    bgColor: "bg-indigo-500/10",
  },
  {
    id: "service-desk",
    title: "Service Desk",
    description: "Streamlined Service Desk Solutions: Built to Evolve With Your Business",
    icon: HeadphonesIcon,
    href: "/apps/service-desk",
    color: "text-cyan-500",
    bgColor: "bg-cyan-500/10",
  },
  {
    id: "epm",
    title: "EPM",
    description: "Optimize Performance, Enhance Productivity – Smart Workforce Insights!",
    icon: BarChart3,
    href: "/apps/epm",
    color: "text-sky-500",
    bgColor: "bg-sky-500/10",
  }
];

const adminItems = [
  {
    id: "user-master",
    title: "User Master",
    description: "Manage users, assign roles and permissions",
    icon: Users,
    href: "/admin/users",
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
  },
  {
    id: "role-master",
    title: "Role Master",
    description: "Configure roles and menu access permissions",
    icon: Shield,
    href: "/admin/roles",
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
  },
];

const stats = [
  { label: "Active Users", value: "1,248", change: "+12%", icon: Users, trend: "up" },
  { label: "Open Tickets", value: "42", change: "8 urgent", icon: Activity, trend: "neutral" },
  { label: "Assets Managed", value: "3,567", change: "+18%", icon: Package, trend: "up" },
  { label: "Avg Response Time", value: "2.4h", change: "-15%", icon: Clock, trend: "down" },
];

const recentActivities = [
  { action: "New ticket created", user: "John Doe", time: "5 minutes ago", type: "ticket" },
  { action: "Asset approved", user: "Jane Smith", time: "15 minutes ago", type: "asset" },
  { action: "License renewed", user: "Mike Johnson", time: "1 hour ago", type: "license" },
  { action: "User onboarded", user: "Sarah Williams", time: "2 hours ago", type: "user" },
];

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { hasPermission, isAdmin } = useRBAC();
  const [, navigate] = useLocation();
  const userInitials = user?.username.slice(0, 2).toUpperCase() || "U";
  
  const showAdminSection = isAdmin || hasPermission("admin.user-master") || hasPermission("admin.role-master");
  const filteredAdminItems = adminItems.filter((item) => {
    if (isAdmin) return true;
    if (item.id === "user-master") return hasPermission("admin.user-master");
    if (item.id === "role-master") return hasPermission("admin.role-master");
    return false;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
              <div className="h-4 w-4 bg-white rounded-sm transform rotate-45" />
            </div>
            <span className="text-xl font-bold tracking-tight">pcvisor</span>
          </div>
          
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="relative" data-testid="button-notifications">
              <Bell className="h-5 w-5 text-muted-foreground" />
              <span className="absolute top-2 right-2 h-2 w-2 bg-destructive rounded-full" />
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-3 px-2" data-testid="button-user-menu">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-medium" data-testid="text-username">{user?.username}</p>
                    <p className="text-xs text-muted-foreground">Administrator</p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary border-2 border-primary/20">
                    {userInitials}
                  </div>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/profile")} data-testid="menu-profile">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/change-password")} data-testid="menu-change-password">
                  <KeyRound className="mr-2 h-4 w-4" />
                  Change Password
                </DropdownMenuItem>
                {(isAdmin || showAdminSection) && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate("/admin-console")} data-testid="menu-admin-console">
                      <Settings className="mr-2 h-4 w-4" />
                      Admin Console
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} data-testid="menu-logout">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-2" data-testid="text-welcome">
            Welcome back, {user?.username}!
          </h1>
          <p className="text-muted-foreground">
            Here's what's happening with your enterprise systems today.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {stats.map((stat, index) => (
            <Card key={index} className="hover-elevate">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`h-12 w-12 rounded-lg ${stat.trend === 'up' ? 'bg-green-500/10' : stat.trend === 'down' ? 'bg-blue-500/10' : 'bg-yellow-500/10'} flex items-center justify-center`}>
                    <stat.icon className={`h-6 w-6 ${stat.trend === 'up' ? 'text-green-500' : stat.trend === 'down' ? 'text-blue-500' : 'text-yellow-500'}`} />
                  </div>
                  {stat.trend === 'up' && (
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <Badge variant={stat.trend === 'up' ? 'default' : 'secondary'} className="text-xs">
                    {stat.change}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Applications */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-2"
          >
            <h2 className="text-xl font-semibold mb-4">Your Applications</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {apps.map((app) => (
                <Link key={app.id} href={app.href} data-testid={`link-app-${app.id}`}>
                  <Card className="h-full hover-elevate cursor-pointer group transition-all duration-300">
                    <CardHeader className="space-y-3">
                      <div className={`h-12 w-12 rounded-lg ${app.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                        <app.icon className={`h-6 w-6 ${app.color}`} />
                      </div>
                      <CardTitle className="text-lg">{app.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-sm">
                        {app.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            {/* Administration Section - Only visible to admins */}
            {showAdminSection && filteredAdminItems.length > 0 && (
              <>
                <h2 className="text-xl font-semibold mb-4 mt-8 flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Administration
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredAdminItems.map((item) => (
                    <Link key={item.id} href={item.href} data-testid={`link-admin-${item.id}`}>
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
                  ))}
                </div>
              </>
            )}
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
            <Card>
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {recentActivities.map((activity, index) => (
                    <div
                      key={index}
                      className="p-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Activity className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {activity.action}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {activity.user}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {activity.time}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Footer */}
        <footer className="mt-12 pt-6 border-t border-border/50 text-center text-sm text-muted-foreground">
          Hitachi Systems India Pvt Ltd © 2025. All rights reserved.
        </footer>
      </main>
    </div>
  );
}
