import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useLocation } from "wouter";
import { Key, ChevronLeft, Save, Loader2, CheckCircle, AlertCircle, Clock, Package, Globe, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
  lastValidatedAt: string | null;
  lastValidationStatus: string;
  validationMessage: string | null;
}

interface LicenseServerUrlInfo {
  configured: boolean;
  url: string | null;
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

function getStatusBadge(status: string) {
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
      return response;
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/license"] });
      queryClient.invalidateQueries({ queryKey: ["/api/license-status"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      form.reset();
      toast({
        title: "License Updated",
        description: data.message || "License has been validated and saved successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Validation Failed",
        description: error.message || "Failed to validate license key",
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
                See the documentation for details.
              </p>
            </CardContent>
          </Card>

          <Card data-testid="card-license-status">
            <CardHeader>
              <CardTitle className="flex items-center justify-between gap-2">
                <span>Current License Status</span>
                {license && getStatusBadge(license.lastValidationStatus)}
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
              <CardTitle>Update License</CardTitle>
              <CardDescription>
                Enter a new license key to update your module access. The key will be validated with the license server.
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
                          Paste the complete license key provided by your administrator
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={updateLicenseMutation.isPending}
                      data-testid="button-validate-license"
                    >
                      {updateLicenseMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Validating...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Validate & Save
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
