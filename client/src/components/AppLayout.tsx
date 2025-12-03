import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Package,
  HeadphonesIcon,
  BarChart3,
  Home,
  Settings,
  LogOut,
  Bell
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface AppLayoutProps {
  children: ReactNode;
  title: string;
  appName: string;
}

export default function AppLayout({ children, title, appName }: AppLayoutProps) {
  const [location] = useLocation();

  const navItems = [
    { icon: Home, label: "Dashboard", href: `/apps/${appName.toLowerCase().replace(/\s/g, '-')}` },
    { icon: LayoutDashboard, label: "Projects", href: "#" },
    { icon: Package, label: "Assets", href: "#" },
    { icon: Settings, label: "Settings", href: "#" },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border flex flex-col fixed inset-y-0 z-50">
        <div className="p-6 flex items-center gap-2 border-b border-border/50">
          <div className="h-8 w-8 rounded bg-primary flex items-center justify-center text-primary-foreground font-bold">
            {appName.charAt(0)}
          </div>
          <span className="font-bold text-lg tracking-tight">{appName}</span>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Button
              key={item.label}
              variant={location === item.href ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start gap-3 text-muted-foreground hover:text-foreground",
                location === item.href && "text-primary font-medium"
              )}
              asChild
            >
              <Link href={item.href}>
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            </Button>
          ))}
        </nav>

        <div className="p-4 border-t border-border/50">
          <Button variant="ghost" className="w-full justify-start gap-3 text-destructive hover:text-destructive/80 hover:bg-destructive/10" asChild>
            <Link href="/">
              <LogOut className="h-4 w-4" />
              Back to Portal
            </Link>
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 flex flex-col min-h-screen">
        <header className="h-16 border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-40 px-8 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-foreground">{title}</h1>
          
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5 text-muted-foreground" />
              <span className="absolute top-2 right-2 h-2 w-2 bg-destructive rounded-full" />
            </Button>
            <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-sm font-medium">
              JD
            </div>
          </div>
        </header>

        <div className="flex-1 p-8">
          <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
