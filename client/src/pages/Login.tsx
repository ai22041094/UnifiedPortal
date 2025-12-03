import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LockKeyhole, Mail, ArrowRight } from "lucide-react";
import portalBg from "@assets/generated_images/blue_corporate_tech_background_with_city_and_network_lines.png";

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate network delay for effect
    setTimeout(() => {
      setIsLoading(false);
      setLocation("/portal");
    }, 1000);
  };

  return (
    <div className="h-screen w-full flex bg-background">
      {/* Left Side - Visuals */}
      <div className="hidden lg:flex lg:w-[60%] h-full relative overflow-hidden bg-primary/5">
         <div className="absolute inset-0 bg-primary/10 mix-blend-overlay z-10" />
        <img 
          src={portalBg} 
          alt="Login Background" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-transparent mix-blend-multiply" />
        
        <div className="absolute bottom-20 left-20 z-20 text-white max-w-xl">
          <div className="flex items-center gap-3 mb-6">
             <div className="h-10 w-10 bg-white rounded-lg flex items-center justify-center">
                <div className="h-5 w-5 bg-primary rounded-sm transform rotate-45" />
              </div>
            <span className="text-3xl font-bold tracking-tight">pcvisor</span>
          </div>
          <h1 className="text-4xl font-bold mb-4 leading-tight">
            Unified Access Control & <br/>Enterprise Management
          </h1>
          <p className="text-lg text-white/80">
            Securely manage your digital assets, services, and workforce performance from a single centralized platform.
          </p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-[40%] h-full flex items-center justify-center p-8 relative overflow-y-auto">
        {/* Mobile Logo */}
        <div className="absolute top-8 left-8 lg:hidden flex items-center gap-2">
           <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
              <div className="h-4 w-4 bg-white rounded-sm transform rotate-45" />
            </div>
          <span className="text-xl font-bold tracking-tight">pcvisor</span>
        </div>

        <Card className="w-full max-w-md border-0 shadow-none bg-transparent">
          <CardHeader className="space-y-1 px-0">
            <CardTitle className="text-2xl font-bold tracking-tight">Welcome back</CardTitle>
            <CardDescription>
              Enter your credentials to access your workspace
            </CardDescription>
          </CardHeader>
          <CardContent className="px-0">
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="email" 
                    placeholder="name@company.com" 
                    type="email" 
                    className="pl-10" 
                    required 
                    defaultValue="admin@pcvisor.com"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <a href="#" className="text-sm font-medium text-primary hover:underline">
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <LockKeyhole className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="password" 
                    type="password" 
                    className="pl-10" 
                    required 
                    defaultValue="password123"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="remember" />
                <Label htmlFor="remember" className="text-sm font-normal">Remember me for 30 days</Label>
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                {isLoading ? (
                  <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                ) : (
                  <ArrowRight className="mr-2 h-4 w-4" />
                )}
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
            
            <div className="mt-6 text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <a href="#" className="font-medium text-primary hover:underline">
                Contact Admin
              </a>
            </div>
          </CardContent>
        </Card>
        
        <footer className="absolute bottom-8 text-center text-xs text-muted-foreground w-full">
          © 2025 Hitachi Systems India Pvt Ltd. Privacy Policy
        </footer>
      </div>
    </div>
  );
}
