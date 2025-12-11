import { useLocation } from "wouter";
import { Key, AlertTriangle, ArrowRight, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useLicense, type LicenseModule } from "@/lib/license";
import { useAuth } from "@/lib/auth";
import { Spinner } from "@/components/ui/spinner";

interface LicenseGateProps {
  module: LicenseModule;
  moduleName: string;
  children: React.ReactNode;
}

const MODULE_DESCRIPTIONS: Record<LicenseModule, string> = {
  CUSTOM_PORTAL: "Custom Portal provides a centralized hub for managing licenses, requisitions, vendors, and organizational assets.",
  ASSET_MANAGEMENT: "Asset Lifecycle Management enables comprehensive tracking and management of hardware and software assets.",
  SERVICE_DESK: "Service Desk provides IT service management capabilities including incident and request management.",
  EPM: "Endpoint Management offers real-time monitoring and productivity insights for your workforce.",
};

export function LicenseGate({ module, moduleName, children }: LicenseGateProps) {
  const { user } = useAuth();
  const { license, isLoading, hasModule, isLicenseValid, isExpired } = useLicense();
  const [, setLocation] = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Spinner className="size-8" />
      </div>
    );
  }

  if (user?.isSystem) {
    return <>{children}</>;
  }

  if (!isLicenseValid) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-lg w-full" data-testid="card-license-required">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Key className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">License Required</CardTitle>
            <CardDescription className="text-base">
              Please insert your license key to access {moduleName}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-sm text-muted-foreground text-center">
              {MODULE_DESCRIPTIONS[module]}
            </p>
            <div className="bg-muted/50 rounded-lg p-4 text-center">
              <p className="text-sm text-muted-foreground">
                Contact your administrator to obtain a valid license key, or if you are the administrator, go to License Manager to activate your license.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <Button 
                onClick={() => setLocation("/admin/license")} 
                className="w-full"
                data-testid="button-go-to-license"
              >
                <Key className="mr-2 h-4 w-4" />
                Go to License Manager
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setLocation("/portal")}
                className="w-full"
                data-testid="button-back-to-portal"
              >
                <Home className="mr-2 h-4 w-4" />
                Back to Portal
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isExpired) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-lg w-full" data-testid="card-license-expired">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto h-16 w-16 bg-destructive/10 rounded-full flex items-center justify-center">
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
            <CardTitle className="text-2xl">License Expired</CardTitle>
            <CardDescription className="text-base">
              Your license has expired. Please renew to continue using {moduleName}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-muted/50 rounded-lg p-4 text-center">
              <p className="text-sm text-muted-foreground">
                License expired on: {license?.expiry ? new Date(license.expiry).toLocaleDateString() : "Unknown"}
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <Button 
                onClick={() => setLocation("/admin/license")} 
                className="w-full"
                data-testid="button-renew-license"
              >
                <Key className="mr-2 h-4 w-4" />
                Renew License
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setLocation("/portal")}
                className="w-full"
                data-testid="button-back-to-portal"
              >
                <Home className="mr-2 h-4 w-4" />
                Back to Portal
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!hasModule(module)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-lg w-full" data-testid="card-module-not-licensed">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto h-16 w-16 bg-amber-500/10 rounded-full flex items-center justify-center">
              <AlertTriangle className="h-8 w-8 text-amber-500" />
            </div>
            <CardTitle className="text-2xl">Module Not Licensed</CardTitle>
            <CardDescription className="text-base">
              Your current license does not include access to {moduleName}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-sm text-muted-foreground text-center">
              {MODULE_DESCRIPTIONS[module]}
            </p>
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-sm text-muted-foreground text-center">
                Your license includes: {license?.modules?.length ? license.modules.join(", ") : "No modules"}
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <Button 
                onClick={() => setLocation("/admin/license")} 
                className="w-full"
                data-testid="button-upgrade-license"
              >
                <Key className="mr-2 h-4 w-4" />
                Upgrade License
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setLocation("/portal")}
                className="w-full"
                data-testid="button-back-to-portal"
              >
                <Home className="mr-2 h-4 w-4" />
                Back to Portal
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
