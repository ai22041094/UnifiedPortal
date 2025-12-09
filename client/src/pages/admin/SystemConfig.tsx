import { useQuery, useMutation } from "@tanstack/react-query";
import { useEffect } from "react";
import { Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Settings, 
  ChevronLeft, 
  Loader2,
  Globe,
  Shield,
  Database,
  Webhook,
  AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { SystemConfig } from "@shared/schema";

const systemConfigSchema = z.object({
  applicationName: z.string().min(1).max(100),
  applicationUrl: z.string().url().optional().or(z.literal("")),
  timezone: z.string(),
  dateFormat: z.string(),
  timeFormat: z.string(),
  language: z.string(),
  maintenanceMode: z.boolean(),
  maintenanceMessage: z.string().optional(),
  maxFileUploadSize: z.string(),
  allowedFileTypes: z.string(),
  dataRetentionDays: z.string(),
  enableApiAccess: z.boolean(),
  apiRateLimit: z.string(),
  enableWebhooks: z.boolean(),
  webhookUrl: z.string().url().optional().or(z.literal("")),
  webhookSecret: z.string().optional(),
});

type SystemConfigFormValues = z.infer<typeof systemConfigSchema>;

export default function SystemConfigPage() {
  const { toast } = useToast();

  const { data: config, isLoading } = useQuery<SystemConfig>({
    queryKey: ["/api/system-config"],
  });

  const form = useForm<SystemConfigFormValues>({
    resolver: zodResolver(systemConfigSchema),
    defaultValues: {
      applicationName: "PCVisor",
      applicationUrl: "",
      timezone: "Asia/Kolkata",
      dateFormat: "DD/MM/YYYY",
      timeFormat: "HH:mm:ss",
      language: "en",
      maintenanceMode: false,
      maintenanceMessage: "",
      maxFileUploadSize: "10",
      allowedFileTypes: "pdf,doc,docx,xls,xlsx,png,jpg,jpeg",
      dataRetentionDays: "365",
      enableApiAccess: true,
      apiRateLimit: "1000",
      enableWebhooks: false,
      webhookUrl: "",
      webhookSecret: "",
    },
  });

  useEffect(() => {
    if (config) {
      form.reset({
        applicationName: config.applicationName || "PCVisor",
        applicationUrl: config.applicationUrl || "",
        timezone: config.timezone || "Asia/Kolkata",
        dateFormat: config.dateFormat || "DD/MM/YYYY",
        timeFormat: config.timeFormat || "HH:mm:ss",
        language: config.language || "en",
        maintenanceMode: config.maintenanceMode ?? false,
        maintenanceMessage: config.maintenanceMessage || "",
        maxFileUploadSize: config.maxFileUploadSize || "10",
        allowedFileTypes: config.allowedFileTypes || "pdf,doc,docx,xls,xlsx,png,jpg,jpeg",
        dataRetentionDays: config.dataRetentionDays || "365",
        enableApiAccess: config.enableApiAccess ?? true,
        apiRateLimit: config.apiRateLimit || "1000",
        enableWebhooks: config.enableWebhooks ?? false,
        webhookUrl: config.webhookUrl || "",
        webhookSecret: config.webhookSecret || "",
      });
    }
  }, [config, form]);

  const updateMutation = useMutation({
    mutationFn: async (data: SystemConfigFormValues) => {
      const response = await apiRequest("PATCH", "/api/system-config", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/system-config"] });
      toast({
        title: "Settings saved",
        description: "System configuration has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update settings",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: SystemConfigFormValues) => {
    updateMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-6 h-16 flex items-center gap-4">
          <Link href="/admin-console">
            <Button variant="ghost" size="icon" data-testid="button-back">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-indigo-500/10 rounded-lg flex items-center justify-center">
              <Settings className="h-4 w-4 text-indigo-500" />
            </div>
            <span className="font-medium">System Configuration</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" data-testid="text-page-title">System Configuration</h1>
          <p className="text-muted-foreground">
            Configure application settings, storage, and API integrations. For email and notification settings, use the <Link href="/admin-console/notifications" className="text-primary underline">Notification Settings</Link> page.
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <Tabs defaultValue="general" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3" data-testid="tabs-config">
                <TabsTrigger value="general" data-testid="tab-general">General</TabsTrigger>
                <TabsTrigger value="storage" data-testid="tab-storage">Storage</TabsTrigger>
                <TabsTrigger value="api" data-testid="tab-api">API & Webhooks</TabsTrigger>
              </TabsList>

              <TabsContent value="general" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="h-5 w-5" />
                      Application Settings
                    </CardTitle>
                    <CardDescription>Configure general application settings</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="applicationName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Application Name</FormLabel>
                            <FormControl>
                              <Input {...field} data-testid="input-app-name" />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="applicationUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Application URL</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="https://example.com" data-testid="input-app-url" />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="timezone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Timezone</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-timezone">
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Asia/Kolkata">Asia/Kolkata (IST)</SelectItem>
                                <SelectItem value="Asia/Tokyo">Asia/Tokyo (JST)</SelectItem>
                                <SelectItem value="UTC">UTC</SelectItem>
                                <SelectItem value="America/New_York">America/New_York (EST)</SelectItem>
                                <SelectItem value="Europe/London">Europe/London (GMT)</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="dateFormat"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Date Format</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-date-format">
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                                <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                                <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="language"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Language</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-language">
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="en">English</SelectItem>
                                <SelectItem value="hi">Hindi</SelectItem>
                                <SelectItem value="ja">Japanese</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-yellow-500" />
                      Maintenance Mode
                    </CardTitle>
                    <CardDescription>Enable maintenance mode to prevent user access</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="maintenanceMode"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Enable Maintenance Mode</FormLabel>
                            <FormDescription>
                              When enabled, users will see a maintenance message
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              data-testid="switch-maintenance"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="maintenanceMessage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Maintenance Message</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder="We are currently undergoing scheduled maintenance..."
                              data-testid="input-maintenance-message"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="storage" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Database className="h-5 w-5" />
                      Storage Settings
                    </CardTitle>
                    <CardDescription>Configure file storage and data retention</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="maxFileUploadSize"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Max File Upload Size (MB)</FormLabel>
                            <FormControl>
                              <Input {...field} type="number" data-testid="input-max-file-size" />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="dataRetentionDays"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Data Retention (Days)</FormLabel>
                            <FormControl>
                              <Input {...field} type="number" data-testid="input-data-retention" />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="allowedFileTypes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Allowed File Types</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="pdf,doc,docx,xls,xlsx,png,jpg,jpeg" data-testid="input-allowed-file-types" />
                          </FormControl>
                          <FormDescription>Comma-separated list of allowed file extensions</FormDescription>
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="api" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      API Access
                    </CardTitle>
                    <CardDescription>Configure API access and rate limiting</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="enableApiAccess"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Enable API Access</FormLabel>
                            <FormDescription>Allow external API access</FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              data-testid="switch-api-access"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="apiRateLimit"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>API Rate Limit (requests/hour)</FormLabel>
                          <FormControl>
                            <Input {...field} type="number" data-testid="input-api-rate-limit" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Webhook className="h-5 w-5" />
                      Webhooks
                    </CardTitle>
                    <CardDescription>Configure webhook integrations</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="enableWebhooks"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Enable Webhooks</FormLabel>
                            <FormDescription>Send events to external services</FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              data-testid="switch-webhooks"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="webhookUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Webhook URL</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="https://example.com/webhook" data-testid="input-webhook-url" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="webhookSecret"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Webhook Secret</FormLabel>
                          <FormControl>
                            <Input {...field} type="password" data-testid="input-webhook-secret" />
                          </FormControl>
                          <FormDescription>Used to sign webhook payloads</FormDescription>
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end mt-6">
              <Button type="submit" disabled={updateMutation.isPending} data-testid="button-save">
                {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </div>
          </form>
        </Form>
      </main>
    </div>
  );
}
