import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { LockKeyhole, User, ArrowRight, Loader2, Shield, ArrowLeft } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
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

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [mfaRequired, setMfaRequired] = useState(false);
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);
  const [mfaCode, setMfaCode] = useState("");
  const { login, verifyMfa } = useAuth();
  const { toast } = useToast();

  const { data: orgSettings } = useQuery<PublicOrgSettings>({
    queryKey: ["/api/organization/public"],
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await login(username, password);
      if (result?.requiresMfa && result.userId) {
        setMfaRequired(true);
        setPendingUserId(result.userId);
      }
    } catch (error) {
      toast({
        title: "Login Failed",
        description: error instanceof Error ? error.message : "Invalid credentials",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMfaVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingUserId || mfaCode.length !== 6) return;

    setIsLoading(true);
    try {
      await verifyMfa(pendingUserId, mfaCode);
    } catch (error) {
      toast({
        title: "Verification Failed",
        description: error instanceof Error ? error.message : "Invalid code",
        variant: "destructive",
      });
      setMfaCode("");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    setMfaRequired(false);
    setPendingUserId(null);
    setMfaCode("");
    setPassword("");
  };

  const organizationName = orgSettings?.organizationName || "pcvisor";
  const tagline = orgSettings?.tagline || "Unified Access Control & Enterprise Management";
  const logoUrl = orgSettings?.logoUrl;
  const copyrightText = orgSettings?.copyrightText || `Hitachi Systems India Pvt Ltd © ${new Date().getFullYear()}. All rights reserved.`;

  const renderLogo = (size: "large" | "small") => {
    const dimensions = size === "large" ? { outer: "h-10 w-10", inner: "h-5 w-5" } : { outer: "h-8 w-8", inner: "h-4 w-4" };
    const textSize = size === "large" ? "text-3xl" : "text-xl";
    
    if (logoUrl) {
      return (
        <div className="flex items-center gap-3">
          <img 
            src={logoUrl} 
            alt={organizationName} 
            className={size === "large" ? "h-10 max-w-[200px] object-contain" : "h-8 max-w-[160px] object-contain"}
            data-testid={`img-logo-${size}`}
          />
        </div>
      );
    }
    
    return (
      <div className="flex items-center gap-3">
        <div className={`${dimensions.outer} bg-white rounded-lg flex items-center justify-center`}>
          <div className={`${dimensions.inner} bg-primary rounded-sm transform rotate-45`} />
        </div>
        <span className={`${textSize} font-bold tracking-tight`}>{organizationName}</span>
      </div>
    );
  };

  const renderMfaForm = () => (
    <Card className="w-full max-w-md border-0 shadow-none bg-transparent">
      <CardHeader className="space-y-1 px-0">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <Shield className="h-6 w-6 text-primary" />
          </div>
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight" data-testid="text-mfa-title">
          Two-Factor Authentication
        </CardTitle>
        <CardDescription data-testid="text-mfa-description">
          Enter the 6-digit code from your authenticator app
        </CardDescription>
      </CardHeader>
      <CardContent className="px-0">
        <form onSubmit={handleMfaVerify} className="space-y-6">
          <div className="flex justify-center">
            <InputOTP
              maxLength={6}
              value={mfaCode}
              onChange={(value) => setMfaCode(value)}
              data-testid="input-mfa-code"
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            size="lg" 
            disabled={isLoading || mfaCode.length !== 6}
            data-testid="button-verify-mfa"
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Shield className="mr-2 h-4 w-4" />
            )}
            {isLoading ? "Verifying..." : "Verify"}
          </Button>

          <Button
            type="button"
            variant="ghost"
            className="w-full"
            onClick={handleBackToLogin}
            data-testid="button-back-to-login"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to login
          </Button>
        </form>
      </CardContent>
    </Card>
  );

  const renderLoginForm = () => (
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
            <Label htmlFor="username">Username</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="username"
                placeholder="Enter your username"
                type="text"
                className="pl-10"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                data-testid="input-username"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <LockKeyhole className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                className="pl-10"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                data-testid="input-password"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox id="remember" data-testid="checkbox-remember" />
            <Label htmlFor="remember" className="text-sm font-normal">Remember me for 30 days</Label>
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={isLoading} data-testid="button-login">
            {isLoading ? (
              <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
            ) : (
              <ArrowRight className="mr-2 h-4 w-4" />
            )}
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );

  return (
    <div className="h-screen w-full flex bg-background">
      <div className="hidden lg:flex lg:w-[60%] h-full relative overflow-hidden bg-primary/5">
         <div className="absolute inset-0 bg-primary/10 mix-blend-overlay z-10" />
        <img 
          src={portalBg} 
          alt="Login Background" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-transparent mix-blend-multiply" />
        
        <div className="absolute bottom-20 left-20 z-20 text-white max-w-xl">
          <div className="mb-6">
            {renderLogo("large")}
          </div>
          <h1 className="text-4xl font-bold mb-4 leading-tight">
            {tagline.includes("&") ? (
              <>
                {tagline.split("&")[0].trim()} & <br/>{tagline.split("&")[1]?.trim()}
              </>
            ) : tagline}
          </h1>
          <p className="text-lg text-white/80">
            Securely manage your digital assets, services, and workforce performance from a single centralized platform.
          </p>
        </div>
      </div>

      <div className="w-full lg:w-[40%] h-full flex items-center justify-center p-8 relative overflow-y-auto">
        <div className="absolute top-8 left-8 lg:hidden">
          {logoUrl ? (
            <img 
              src={logoUrl} 
              alt={organizationName} 
              className="h-8 max-w-[160px] object-contain"
              data-testid="img-logo-mobile"
            />
          ) : (
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
                <div className="h-4 w-4 bg-white rounded-sm transform rotate-45" />
              </div>
              <span className="text-xl font-bold tracking-tight">{organizationName}</span>
            </div>
          )}
        </div>

        {mfaRequired ? renderMfaForm() : renderLoginForm()}
        
        <footer className="absolute bottom-8 text-center text-xs text-muted-foreground w-full" data-testid="text-copyright">
          {copyrightText}
        </footer>
      </div>
    </div>
  );
}
