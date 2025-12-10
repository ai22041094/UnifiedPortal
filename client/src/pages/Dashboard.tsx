import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  LayoutDashboard,
  Package,
  HeadphonesIcon,
  BarChart3,
  LogOut,
  Settings,
  User,
  KeyRound,
  ChevronDown,
  ArrowRight,
  Shield,
  Zap,
  Globe,
} from "lucide-react";
import NotificationBell from "@/components/NotificationBell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import portalBg from "@assets/generated_images/blue_corporate_tech_background_with_city_and_network_lines.png";

interface PublicOrgSettings {
  organizationName: string;
  tagline: string | null;
  logoUrl: string | null;
  faviconUrl: string | null;
  primaryColor: string | null;
  secondaryColor: string | null;
  footerText: string | null;
  copyrightText: string | null;
}

const apps = [
  {
    id: "custom-portal",
    title: "Custom Portal",
    description: "Enhances management, streamlines procurement, optimizes licensing.",
    icon: LayoutDashboard,
    href: "/apps/custom-portal",
    gradient: "from-blue-500 to-blue-600",
  },
  {
    id: "alm",
    title: "Asset Lifecycle Management",
    description: "IT & Non-IT ALM: Smooth Control from Requisition to Disposal",
    icon: Package,
    href: "/apps/alm",
    gradient: "from-indigo-500 to-indigo-600",
  },
  {
    id: "service-desk",
    title: "Service Desk",
    description: "Streamlined Service Desk Solutions: Built to Evolve With Your Business",
    icon: HeadphonesIcon,
    href: "/apps/service-desk",
    gradient: "from-cyan-500 to-cyan-600",
  },
  {
    id: "epm",
    title: "EPM",
    description: "Optimize Performance, Enhance Productivity – Smart Workforce Insights!",
    icon: BarChart3,
    href: "/apps/epm",
    gradient: "from-sky-500 to-sky-600",
  }
];

const features = [
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "Role-based access control and audit logging"
  },
  {
    icon: Zap,
    title: "Real-time Analytics",
    description: "Live dashboards and performance metrics"
  },
  {
    icon: Globe,
    title: "Unified Platform",
    description: "All your enterprise tools in one place"
  }
];

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { hasPermission, isAdmin } = useRBAC();
  const [, navigate] = useLocation();
  const userInitials = user?.username.slice(0, 2).toUpperCase() || "U";
  
  const showAdminSection = isAdmin || hasPermission("admin.user-master") || hasPermission("admin.role-master");

  const { data: orgSettings } = useQuery<PublicOrgSettings>({
    queryKey: ["/api/organization/public"],
  });

  const organizationName = orgSettings?.organizationName || "pcvisor";
  const logoUrl = orgSettings?.logoUrl;
  const copyrightText = orgSettings?.copyrightText || `Hitachi Systems India Pvt Ltd © ${new Date().getFullYear()}. All rights reserved.`;

  const renderLogo = () => {
    if (logoUrl) {
      return (
        <div className="flex items-center gap-3">
          <img 
            src={logoUrl} 
            alt={organizationName} 
            className="h-8 max-w-[160px] object-contain"
            data-testid="img-dashboard-logo"
          />
        </div>
      );
    }
    
    return (
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 bg-white rounded-lg flex items-center justify-center">
          <div className="h-4 w-4 bg-primary rounded-sm transform rotate-45" />
        </div>
        <span className="text-xl font-bold tracking-tight text-white">{organizationName}</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Header Section - Matching Login Page Style */}
      <div className="relative overflow-hidden">
        {/* Background Image with Gradient Overlay */}
        <div className="absolute inset-0">
          <img 
            src={portalBg} 
            alt="Dashboard Background" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/80 to-primary/70" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
        </div>

        {/* Header Navigation */}
        <header className="relative z-10">
          <div className="container mx-auto px-6 h-16 flex items-center justify-between gap-4">
            {renderLogo()}
            
            <div className="flex items-center gap-4">
              <NotificationBell />
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-3 px-2 text-white" data-testid="button-user-menu">
                    <div className="text-right hidden sm:block">
                      <p className="text-sm font-medium text-white" data-testid="text-username">{user?.username}</p>
                      <p className="text-xs text-white/70">Administrator</p>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center text-sm font-semibold text-white border-2 border-white/30">
                      {userInitials}
                    </div>
                    <ChevronDown className="h-4 w-4 text-white/70" />
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

        {/* Welcome Section */}
        <div className="relative z-10 container mx-auto px-6 py-12 pb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl font-bold mb-3 text-white" data-testid="text-welcome">
              Welcome back, {user?.username}
            </h1>
            <p className="text-lg text-white/80 max-w-xl">
              Access your enterprise applications and manage your digital assets from a single unified platform.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-6 -mt-12 relative z-20 pb-8">
        {/* Applications Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-12"
        >
          <h2 className="text-xl font-semibold mb-6 text-foreground">Your Applications</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {apps.map((app, index) => (
              <motion.div
                key={app.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 + index * 0.05 }}
              >
                <Link href={app.href} data-testid={`link-app-${app.id}`}>
                  <Card className="h-full hover-elevate cursor-pointer group overflow-visible">
                    <CardContent className="p-6">
                      <div className={`h-14 w-14 rounded-xl bg-gradient-to-br ${app.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                        <app.icon className="h-7 w-7 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                        {app.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {app.description}
                      </p>
                      <div className="flex items-center text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                        Open App
                        <ArrowRight className="ml-1 h-4 w-4" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Features Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-12"
        >
          <div className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 rounded-2xl p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">Enterprise-Grade Platform</h2>
              <p className="text-muted-foreground">Built for security, scalability, and performance</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                  className="text-center"
                >
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-1">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <h2 className="text-xl font-semibold mb-6">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button 
              variant="outline" 
              className="h-auto py-4 flex-col gap-2"
              onClick={() => navigate("/profile")}
              data-testid="button-quick-profile"
            >
              <User className="h-5 w-5" />
              <span className="text-sm">My Profile</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto py-4 flex-col gap-2"
              onClick={() => navigate("/change-password")}
              data-testid="button-quick-password"
            >
              <KeyRound className="h-5 w-5" />
              <span className="text-sm">Change Password</span>
            </Button>
            {showAdminSection && (
              <Button 
                variant="outline" 
                className="h-auto py-4 flex-col gap-2"
                onClick={() => navigate("/admin-console")}
                data-testid="button-quick-admin"
              >
                <Settings className="h-5 w-5" />
                <span className="text-sm">Admin Console</span>
              </Button>
            )}
            <Button 
              variant="outline" 
              className="h-auto py-4 flex-col gap-2 text-destructive hover:text-destructive"
              onClick={logout}
              data-testid="button-quick-logout"
            >
              <LogOut className="h-5 w-5" />
              <span className="text-sm">Logout</span>
            </Button>
          </div>
        </motion.div>

        {/* Footer */}
        <footer className="mt-12 pt-6 border-t border-border/50 text-center text-sm text-muted-foreground" data-testid="text-dashboard-copyright">
          {copyrightText}
        </footer>
      </main>
    </div>
  );
}
