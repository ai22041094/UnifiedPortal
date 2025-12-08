import { Link } from "wouter";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  LayoutDashboard,
  Package,
  HeadphonesIcon,
  BarChart3,
  ArrowRight,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
    color: "text-blue-500"
  },
  {
    id: "alm",
    title: "Asset Lifecycle Management",
    description: "IT & Non-IT ALM: Smooth Control from Requisition to Disposal",
    icon: Package,
    href: "/apps/alm",
    color: "text-indigo-500"
  },
  {
    id: "service-desk",
    title: "Service Desk",
    description: "Streamlined Service Desk Solutions: Built to Evolve With Your Business",
    icon: HeadphonesIcon,
    href: "/apps/service-desk",
    color: "text-cyan-500"
  },
  {
    id: "epm",
    title: "EPM",
    description: "Optimize Performance, Enhance Productivity - Smart Workforce Insights!",
    icon: BarChart3,
    href: "/apps/epm",
    color: "text-sky-500"
  }
];

export default function Portal() {
  const { data: orgSettings, isLoading: orgLoading } = useQuery<PublicOrgSettings>({
    queryKey: ["/api/organization/public"],
  });

  const organizationName = orgSettings?.organizationName || "pcvisor";
  const logoUrl = orgSettings?.logoUrl;
  const copyrightText = orgSettings?.copyrightText || `Hitachi Systems India Pvt Ltd © ${new Date().getFullYear()}. All rights reserved.`;

  const renderLogo = () => {
    if (logoUrl) {
      return (
        <div className="flex items-center gap-2 mb-6">
          <img 
            src={logoUrl} 
            alt={organizationName} 
            className="h-8 max-w-[180px] object-contain"
            data-testid="img-portal-logo"
          />
        </div>
      );
    }
    
    return (
      <div className="flex items-center gap-2 mb-6">
        <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
          <div className="h-4 w-4 bg-white rounded-sm transform rotate-45" />
        </div>
        <span className="text-xl font-bold tracking-tight">{organizationName}</span>
      </div>
    );
  };

  return (
    <div className="h-screen w-full bg-background flex">
      {/* Left Content */}
      <div className="w-full lg:w-[55%] h-full flex flex-col p-8 lg:p-16 relative z-10 overflow-y-auto">
        <div className="max-w-2xl mx-auto w-full space-y-8 my-auto">
          <div className="space-y-2">
            {renderLogo()}
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-primary font-medium text-lg mb-2">Easily Access All Your Tools in One Place..</h2>
              <h1 className="text-4xl lg:text-5xl font-bold text-foreground tracking-tight leading-[1.1]">
                Welcome to the Unified Software Access Portal
              </h1>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
            {apps.map((app, index) => (
              <motion.div
                key={app.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
              >
                <Card className="h-full hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/20 group cursor-pointer bg-white/50 backdrop-blur-sm">
                  <CardHeader className="space-y-4">
                    <div className={`h-12 w-12 rounded-full bg-primary/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 ${app.color}`}>
                      <app.icon className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-xl">{app.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base leading-relaxed">
                      {app.description}
                    </CardDescription>
                  </CardContent>
                  <CardFooter>
                    <Link href={app.href}>
                      <Button variant="ghost" className="w-full justify-between group-hover:text-primary hover:bg-primary/5">
                        OPEN
                        <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>

          <footer className="pt-12 text-sm text-muted-foreground" data-testid="text-portal-copyright">
            {copyrightText}
          </footer>
        </div>
      </div>

      {/* Right Background */}
      <div className="hidden lg:block absolute top-0 right-0 w-[55%] h-full z-0">
        <div className="absolute inset-0 bg-primary/10 mix-blend-overlay z-10" />
        <img 
          src={portalBg} 
          alt="Background" 
          className="w-full h-full object-cover"
        />
        {/* Curved Clip Path */}
        <div 
          className="absolute inset-0 bg-background"
          style={{
            clipPath: "polygon(0 0, 100% 0, 100% 100%, 20% 100%, 0 0)",
            transform: "translateX(-1px) scaleX(-1)",
            background: "linear-gradient(90deg, hsl(var(--background)) 0%, transparent 100%)"
          }} 
        />
         <div 
          className="absolute top-0 left-0 w-full h-full bg-white"
          style={{
             clipPath: "ellipse(70% 130% at 0% 50%)",
             transform: "scaleX(-1)"
          }}
        ></div>
      </div>
    </div>
  );
}
