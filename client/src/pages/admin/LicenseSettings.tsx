import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useLocation } from "wouter";
import { Key, ChevronLeft, Save, Loader2, CheckCircle, AlertCircle, Clock, Package, Globe, AlertTriangle, Cpu, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";
import { format } from "date-fns";

interface LicenseInfo {
  licenseKey: string | null;
  tenantId: string | null;
  modules: string[];
  expiry: string | null;
  hardwareId: string | null;
  currentHardwareId: string;
  hardwareMatch: boolean | null;
  lastValidatedAt: string | null;
  lastValidationStatus: string;
  validationMessage: string | null;
}

interface LicenseServerUrlInfo {
  configured: boolean;
  url: string | null;
}

interface ActivationResponse {
  ok: boolean;
  reason?: string;
  message: string;
  payload?: {
    tenantId: string;
    modules: string[];
    expiry: string;
    hardwareId: string;
    publicIp?: string;
  };
  license?: {
    tenantId: string;
    modules: string[];
    expiry: string;
    hardwareId: string;
    lastValidationStatus: string;
  };
}

const licenseFormSchema = z.object({
  licenseKey: z.string().min(1, "License key is required"),
});

type LicenseFormValues = z.infer<typeof licenseFormSchema>;

const MODULE_LABELS: Record<string, string> = {
  CUSTOM_PORTAL: "Custom Portal",
  ASSET_MANAGEMENT: "Asset Lifecycle Management",
  SERVICE_DESK: "Service Desk",
  EPM: "Endpoint Management",
};

function getStatusBadge(status: string, hardwareMatch: boolean | null) {
  if (status === "OK" && hardwareMatch === false) {
    return <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"><AlertTriangle className="w-3 h-3 mr-1" />Hardware Mismatch</Badge>;
  }
  
  switch (status) {
    case "OK":
      return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"><CheckCircle className="w-3 h-3 mr-1" />Valid</Badge>;
    case "EXPIRED":
      return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"><AlertCircle className="w-3 h-3 mr-1" />Expired</Badge>;
    case "INVALID":
      return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"><AlertCircle className="w-3 h-3 mr-1" />Invalid</Badge>;
    default:
      return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />No License</Badge>;
  }
}

export default function LicenseSettings() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const { data: license, isLoading } = useQuery<LicenseInfo>({
    queryKey: ["/api/admin/license"],
  });

  const { data: licenseServerUrl } = useQuery<LicenseServerUrlInfo>({
    queryKey: ["/api/admin/license-server-url"],
  });

  const form = useForm<LicenseFormValues>({
    resolver: zodResolver(licenseFormSchema),
    defaultValues: {
      licenseKey: "",
    },
  });

  const updateLicenseMutation = useMutation({
    mutationFn: async (data: LicenseFormValues) => {
      const response = await apiRequest("POST", "/api/admin/license", data);
      return await response.json() as ActivationResponse;
    },
    onSuccess: (data: ActivationResponse) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/license"] });
      queryClient.invalidateQueries({ queryKey: ["/api/license-status"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      form.reset();
      
      if (data.ok) {
        toast({
          title: "License Activated",
          description: data.message || "License has been activated and bound to this machine.",
        });
      } else {
        toast({
          title: "Activation Failed",
          description: data.reason || data.message || "Failed to activate license",
          variant: "destructive",
        });
      }
    },
    onError: (error: any) => {
      const errorData = error?.data || error;
      toast({
        title: "Activation Failed",
        description: errorData?.reason || errorData?.message || error.message || "Failed to activate license key",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: LicenseFormValues) => {
    updateLicenseMutation.mutate(data);
  };

  if (!user?.isSystem) {
    setLocation("/portal");
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" asChild data-testid="button-back">
            <Link href="/admin-console">
              <ChevronLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Key className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold">License Management</h1>
              <p className="text-sm text-muted-foreground">
                Manage your application license and module access
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-6">
          <Card data-testid="card-license-server-url">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                License Server URL
              </CardTitle>
              <CardDescription>
                The license server URL is configured in the environment variables
              </CardDescription>
            </CardHeader>
            <CardContent>
              {licenseServerUrl?.configured ? (
                <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
                  <code className="text-sm font-mono flex-1" data-testid="text-license-server-url">
                    {licenseServerUrl.url}
                  </code>
                  <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Configured
                  </Badge>
                </div>
              ) : (
                <div className="flex items-center gap-2 p-3 bg-destructive/10 rounded-md">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  <span className="text-sm text-destructive" data-testid="text-license-server-not-configured">
                    License server URL is not configured
                  </span>
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-3">
                To update, set the <code className="bg-muted px-1 py-0.5 rounded">LICENSE_SERVER_URL</code> environment variable.
              </p>
            </CardContent>
          </Card>

          <Card data-testid="card-machine-info">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cpu className="h-5 w-5" />
                Machine Information
              </CardTitle>
              <CardDescription>
                Hardware fingerprint used for license binding
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Current Machine ID</p>
                  <code className="text-sm font-mono" data-testid="text-current-hardware-id">
                    {license?.currentHardwareId || "Unknown"}
                  </code>
                </div>
                {license?.hardwareId && (
                  <div>
                    <p className="text-sm text-muted-foreground">Licensed Machine ID</p>
                    <div className="flex items-center gap-2">
                      <code className="text-sm font-mono" data-testid="text-licensed-hardware-id">
                        {license.hardwareId}
                      </code>
                      {license.hardwareMatch === true && (
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          <Shield className="w-3 h-3 mr-1" />
                          Match
                        </Badge>
                      )}
                      {license.hardwareMatch === false && (
                        <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          Mismatch
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </div>
              {license?.hardwareMatch === false && (
                <div className="p-3 bg-destructive/10 rounded-md">
                  <p className="text-sm text-destructive flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    License is bound to a different machine. Please re-activate if you have available activations.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card data-testid="card-license-status">
            <CardHeader>
              <CardTitle className="flex items-center justify-between gap-2">
                <span>Current License Status</span>
                {license && getStatusBadge(license.lastValidationStatus, license.hardwareMatch)}
              </CardTitle>
              <CardDescription>
                View your current license information and enabled modules
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {license?.lastValidationStatus === "NONE" || !license?.tenantId ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Key className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">No License Configured</p>
                  <p className="text-sm">Enter a license key below to activate your modules</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Tenant ID</p>
                      <p className="font-medium" data-testid="text-tenant-id">{license.tenantId}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">License Key</p>
                      <p className="font-mono text-sm" data-testid="text-license-key">{license.licenseKey || "Not configured"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Expiry Date</p>
                      <p className="font-medium" data-testid="text-expiry">
                        {license.expiry ? format(new Date(license.expiry), "PPP") : "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Last Validated</p>
                      <p className="font-medium" data-testid="text-last-validated">
                        {license.lastValidatedAt ? format(new Date(license.lastValidatedAt), "PPp") : "Never"}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <p className="text-sm text-muted-foreground mb-3">Licensed Modules</p>
                    <div className="flex flex-wrap gap-2" data-testid="container-modules">
                      {license.modules && license.modules.length > 0 ? (
                        license.modules.map((module) => (
                          <Badge key={module} variant="secondary" className="flex items-center gap-1">
                            <Package className="w-3 h-3" />
                            {MODULE_LABELS[module] || module}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-muted-foreground text-sm">No modules licensed</p>
                      )}
                    </div>
                  </div>

                  {license.validationMessage && (
                    <>
                      <Separator />
                      <div>
                        <p className="text-sm text-muted-foreground">Validation Message</p>
                        <p className="text-sm" data-testid="text-validation-message">{license.validationMessage}</p>
                      </div>
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card data-testid="card-update-license">
            <CardHeader>
              <CardTitle>Activate License</CardTitle>
              <CardDescription>
                Enter a license key to activate. The license will be bound to this machine's hardware ID.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="licenseKey"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>License Key</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter your license key..."
                            className="font-mono text-sm min-h-[100px]"
                            data-testid="input-license-key"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Paste the complete license key provided by your administrator. This will bind the license to this machine.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={updateLicenseMutation.isPending}
                      data-testid="button-activate-license"
                    >
                      {updateLicenseMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Activating...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Activate License
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
