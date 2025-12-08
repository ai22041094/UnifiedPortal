import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "wouter";
import { useEffect, useState, useCallback } from "react";
import { Bell, ChevronLeft, Save, Loader2, Mail, MessageSquare, AlertTriangle, Smartphone, BellRing, Trash2, CheckCircle, XCircle, Key, Copy, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { NotificationSettings } from "@shared/schema";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

interface PushSubscriptionInfo {
  id: string;
  endpoint: string;
  createdAt: string;
  userAgent: string | null;
}

interface VapidStatus {
  configured: boolean;
  publicKey: string | null;
  subject: string;
  hasPrivateKey: boolean;
}

interface GeneratedVapidKeys {
  publicKey: string;
  privateKey: string;
  instructions: string;
}

const notificationFormSchema = z.object({
  emailNotificationsEnabled: z.boolean().default(true),
  smtpHost: z.string().max(255).optional().nullable(),
  smtpPort: z.string().max(10).optional().nullable(),
  smtpUsername: z.string().max(255).optional().nullable(),
  smtpPassword: z.string().max(255).optional().nullable(),
  smtpFromEmail: z.string().email("Invalid email").optional().nullable().or(z.literal("")),
  smtpFromName: z.string().max(100).optional().nullable(),
  smtpSecure: z.boolean().default(true),
  inAppNotificationsEnabled: z.boolean().default(true),
  pushNotificationsEnabled: z.boolean().default(false),
  notifyOnUserCreated: z.boolean().default(true),
  notifyOnUserDeleted: z.boolean().default(true),
  notifyOnPasswordChange: z.boolean().default(true),
  notifyOnLoginFailure: z.boolean().default(false),
  notifyOnRoleChange: z.boolean().default(true),
  adminEmailRecipients: z.string().max(1000).optional().nullable(),
});

type NotificationFormValues = z.infer<typeof notificationFormSchema>;

export default function NotificationSettingsPage() {
  const { toast } = useToast();
  const [pushSupported, setPushSupported] = useState(false);
  const [pushSubscribed, setPushSubscribed] = useState(false);
  const [pushLoading, setPushLoading] = useState(false);
  const [swRegistration, setSwRegistration] = useState<ServiceWorkerRegistration | null>(null);

  const { data: settings, isLoading } = useQuery<NotificationSettings>({
    queryKey: ["/api/notifications"],
  });

  const { data: vapidKey } = useQuery<{ publicKey: string }>({
    queryKey: ["/api/push/vapid-public-key"],
  });

  const { data: pushSubscriptions, refetch: refetchSubscriptions } = useQuery<PushSubscriptionInfo[]>({
    queryKey: ["/api/push/subscriptions"],
  });

  const { data: vapidStatus, isLoading: vapidStatusLoading } = useQuery<VapidStatus>({
    queryKey: ["/api/push/vapid-status"],
  });

  const [generatedKeys, setGeneratedKeys] = useState<GeneratedVapidKeys | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const checkPushSubscription = useCallback(async () => {
    if (!swRegistration) return;
    try {
      const subscription = await swRegistration.pushManager.getSubscription();
      setPushSubscribed(!!subscription);
    } catch (error) {
      console.error("Error checking push subscription:", error);
    }
  }, [swRegistration]);

  useEffect(() => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      setPushSupported(true);
      navigator.serviceWorker.register("/sw.js").then((registration) => {
        setSwRegistration(registration);
      }).catch((error) => {
        console.error("Service worker registration failed:", error);
      });
    }
  }, []);

  useEffect(() => {
    if (swRegistration) {
      checkPushSubscription();
    }
  }, [swRegistration, checkPushSubscription]);

  const subscribeToPush = async () => {
    if (!swRegistration || !vapidKey) {
      toast({
        title: "Error",
        description: "Push notifications are not configured",
        variant: "destructive",
      });
      return;
    }

    setPushLoading(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        toast({
          title: "Permission Denied",
          description: "Please allow notifications in your browser settings",
          variant: "destructive",
        });
        return;
      }

      const subscription = await swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey.publicKey),
      });

      await apiRequest("POST", "/api/push/subscribe", { subscription });
      setPushSubscribed(true);
      refetchSubscriptions();
      toast({
        title: "Subscribed",
        description: "You are now subscribed to push notifications",
      });
    } catch (error) {
      console.error("Error subscribing to push:", error);
      toast({
        title: "Error",
        description: "Failed to subscribe to push notifications",
        variant: "destructive",
      });
    } finally {
      setPushLoading(false);
    }
  };

  const unsubscribeFromPush = async () => {
    if (!swRegistration) return;

    setPushLoading(true);
    try {
      const subscription = await swRegistration.pushManager.getSubscription();
      if (subscription) {
        await apiRequest("POST", "/api/push/unsubscribe", { endpoint: subscription.endpoint });
        await subscription.unsubscribe();
      }
      setPushSubscribed(false);
      refetchSubscriptions();
      toast({
        title: "Unsubscribed",
        description: "You have been unsubscribed from push notifications",
      });
    } catch (error) {
      console.error("Error unsubscribing from push:", error);
      toast({
        title: "Error",
        description: "Failed to unsubscribe from push notifications",
        variant: "destructive",
      });
    } finally {
      setPushLoading(false);
    }
  };

  const testPushMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/push/test", {});
    },
    onSuccess: () => {
      toast({
        title: "Test Sent",
        description: "A test push notification has been sent to your devices",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send test notification",
        variant: "destructive",
      });
    },
  });

  const generateVapidKeysMutation = useMutation({
    mutationFn: async (): Promise<GeneratedVapidKeys> => {
      const response = await apiRequest("POST", "/api/push/generate-vapid-keys", {});
      return response.json();
    },
    onSuccess: (data) => {
      setGeneratedKeys(data);
      toast({
        title: "VAPID Keys Generated",
        description: "Copy the keys below and add them as environment variables.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to generate VAPID keys",
        variant: "destructive",
      });
    },
  });

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
      toast({
        title: "Copied",
        description: `${field} copied to clipboard`,
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const form = useForm<NotificationFormValues>({
    resolver: zodResolver(notificationFormSchema),
    defaultValues: {
      emailNotificationsEnabled: true,
      smtpHost: "",
      smtpPort: "587",
      smtpUsername: "",
      smtpPassword: "",
      smtpFromEmail: "",
      smtpFromName: "",
      smtpSecure: true,
      inAppNotificationsEnabled: true,
      pushNotificationsEnabled: false,
      notifyOnUserCreated: true,
      notifyOnUserDeleted: true,
      notifyOnPasswordChange: true,
      notifyOnLoginFailure: false,
      notifyOnRoleChange: true,
      adminEmailRecipients: "",
    },
  });

  useEffect(() => {
    if (settings) {
      form.reset({
        emailNotificationsEnabled: settings.emailNotificationsEnabled ?? true,
        smtpHost: settings.smtpHost ?? "",
        smtpPort: settings.smtpPort ?? "587",
        smtpUsername: settings.smtpUsername ?? "",
        smtpPassword: settings.smtpPassword ?? "",
        smtpFromEmail: settings.smtpFromEmail ?? "",
        smtpFromName: settings.smtpFromName ?? "",
        smtpSecure: settings.smtpSecure ?? true,
        inAppNotificationsEnabled: settings.inAppNotificationsEnabled ?? true,
        pushNotificationsEnabled: settings.pushNotificationsEnabled ?? false,
        notifyOnUserCreated: settings.notifyOnUserCreated ?? true,
        notifyOnUserDeleted: settings.notifyOnUserDeleted ?? true,
        notifyOnPasswordChange: settings.notifyOnPasswordChange ?? true,
        notifyOnLoginFailure: settings.notifyOnLoginFailure ?? false,
        notifyOnRoleChange: settings.notifyOnRoleChange ?? true,
        adminEmailRecipients: settings.adminEmailRecipients ?? "",
      });
    }
  }, [settings, form]);

  const updateMutation = useMutation({
    mutationFn: async (data: NotificationFormValues) => {
      return apiRequest("PATCH", "/api/notifications", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      toast({
        title: "Settings Saved",
        description: "Notification settings have been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save settings",
        variant: "destructive",
      });
    },
  });

  const testEmailMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/notifications/test-email", {});
    },
    onSuccess: () => {
      toast({
        title: "Test Email",
        description: "Test email functionality will be available after email service integration.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send test email",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: NotificationFormValues) => {
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
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/admin-console">
              <Button variant="ghost" size="icon" data-testid="button-back">
                <ChevronLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-500/10">
                <Bell className="h-6 w-6 text-yellow-500" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold" data-testid="text-page-title">Notification Settings</h1>
                <p className="text-sm text-muted-foreground">Configure system notifications and alerts</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs defaultValue="email" className="space-y-6">
              <TabsList className="grid w-full max-w-lg grid-cols-4">
                <TabsTrigger value="email" data-testid="tab-email">
                  <Mail className="h-4 w-4 mr-2" />
                  Email
                </TabsTrigger>
                <TabsTrigger value="push" data-testid="tab-push">
                  <Smartphone className="h-4 w-4 mr-2" />
                  Push
                </TabsTrigger>
                <TabsTrigger value="notifications" data-testid="tab-notifications">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Channels
                </TabsTrigger>
                <TabsTrigger value="events" data-testid="tab-events">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Events
                </TabsTrigger>
              </TabsList>

              <TabsContent value="email" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Email Configuration</CardTitle>
                    <CardDescription>
                      Configure SMTP settings for sending email notifications
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <FormField
                      control={form.control}
                      name="emailNotificationsEnabled"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Enable Email Notifications</FormLabel>
                            <FormDescription>
                              Send system notifications via email
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              data-testid="switch-email-enabled"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <Separator />

                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="smtpHost"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>SMTP Host</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="smtp.example.com"
                                {...field}
                                value={field.value ?? ""}
                                data-testid="input-smtp-host"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="smtpPort"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>SMTP Port</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="587"
                                {...field}
                                value={field.value ?? ""}
                                data-testid="input-smtp-port"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="smtpUsername"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>SMTP Username</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="username"
                                {...field}
                                value={field.value ?? ""}
                                data-testid="input-smtp-username"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="smtpPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>SMTP Password</FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder="********"
                                {...field}
                                value={field.value ?? ""}
                                data-testid="input-smtp-password"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="smtpFromEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>From Email</FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                placeholder="noreply@example.com"
                                {...field}
                                value={field.value ?? ""}
                                data-testid="input-smtp-from-email"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="smtpFromName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>From Name</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="System Notifications"
                                {...field}
                                value={field.value ?? ""}
                                data-testid="input-smtp-from-name"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="smtpSecure"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Use TLS/SSL</FormLabel>
                            <FormDescription>
                              Enable secure connection for SMTP
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              data-testid="switch-smtp-secure"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="adminEmailRecipients"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Admin Email Recipients</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="admin@example.com, admin2@example.com"
                              {...field}
                              value={field.value ?? ""}
                              data-testid="input-admin-recipients"
                            />
                          </FormControl>
                          <FormDescription>
                            Comma-separated list of email addresses for admin notifications
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => testEmailMutation.mutate()}
                        disabled={testEmailMutation.isPending}
                        data-testid="button-test-email"
                      >
                        {testEmailMutation.isPending ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Mail className="h-4 w-4 mr-2" />
                        )}
                        Send Test Email
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="push" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Key className="h-5 w-5" />
                      VAPID Configuration
                    </CardTitle>
                    <CardDescription>
                      VAPID keys are required for sending push notifications. Configure your keys below.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {vapidStatusLoading ? (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Loading VAPID configuration...</span>
                      </div>
                    ) : vapidStatus?.configured ? (
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                          <CheckCircle className="h-5 w-5 text-green-500" />
                          <div>
                            <p className="font-medium text-green-700 dark:text-green-400">VAPID Keys Configured</p>
                            <p className="text-sm text-muted-foreground">Push notifications are ready to use</p>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Public Key</p>
                          <div className="flex items-center gap-2">
                            <code className="flex-1 p-2 rounded bg-muted text-xs break-all">
                              {vapidStatus.publicKey}
                            </code>
                            <Button
                              type="button"
                              size="icon"
                              variant="outline"
                              onClick={() => copyToClipboard(vapidStatus.publicKey || "", "Public Key")}
                              data-testid="button-copy-public-key"
                            >
                              {copiedField === "Public Key" ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span>Private Key: Configured (hidden for security)</span>
                        </div>
                        
                        <div className="text-sm text-muted-foreground">
                          <strong>Subject:</strong> {vapidStatus.subject}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                          <AlertTriangle className="h-5 w-5 text-yellow-500" />
                          <div>
                            <p className="font-medium text-yellow-700 dark:text-yellow-400">VAPID Keys Not Configured</p>
                            <p className="text-sm text-muted-foreground">
                              Generate VAPID keys below, then add them as environment variables.
                            </p>
                          </div>
                        </div>

                        <Button
                          type="button"
                          onClick={() => generateVapidKeysMutation.mutate()}
                          disabled={generateVapidKeysMutation.isPending}
                          data-testid="button-generate-vapid"
                        >
                          {generateVapidKeysMutation.isPending ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <RefreshCw className="h-4 w-4 mr-2" />
                          )}
                          Generate VAPID Keys
                        </Button>

                        {generatedKeys && (
                          <div className="space-y-4 p-4 rounded-lg border bg-card">
                            <p className="text-sm font-medium">Generated VAPID Keys</p>
                            <p className="text-sm text-muted-foreground">{generatedKeys.instructions}</p>
                            
                            <div className="space-y-2">
                              <p className="text-xs font-medium text-muted-foreground">VAPID_PUBLIC_KEY</p>
                              <div className="flex items-center gap-2">
                                <code className="flex-1 p-2 rounded bg-muted text-xs break-all">
                                  {generatedKeys.publicKey}
                                </code>
                                <Button
                                  type="button"
                                  size="icon"
                                  variant="outline"
                                  onClick={() => copyToClipboard(generatedKeys.publicKey, "Public Key")}
                                  data-testid="button-copy-generated-public"
                                >
                                  {copiedField === "Public Key" ? (
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                  ) : (
                                    <Copy className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <p className="text-xs font-medium text-muted-foreground">VAPID_PRIVATE_KEY</p>
                              <div className="flex items-center gap-2">
                                <code className="flex-1 p-2 rounded bg-muted text-xs break-all">
                                  {generatedKeys.privateKey}
                                </code>
                                <Button
                                  type="button"
                                  size="icon"
                                  variant="outline"
                                  onClick={() => copyToClipboard(generatedKeys.privateKey, "Private Key")}
                                  data-testid="button-copy-generated-private"
                                >
                                  {copiedField === "Private Key" ? (
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                  ) : (
                                    <Copy className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Push Notifications</CardTitle>
                    <CardDescription>
                      Enable browser push notifications to receive alerts even when the app is closed
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {!pushSupported ? (
                      <div className="flex items-center gap-3 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                        <XCircle className="h-5 w-5 text-yellow-500" />
                        <div>
                          <p className="font-medium text-yellow-700 dark:text-yellow-400">Push notifications not supported</p>
                          <p className="text-sm text-muted-foreground">Your browser does not support push notifications</p>
                        </div>
                      </div>
                    ) : !vapidStatus?.configured ? (
                      <div className="flex items-center gap-3 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                        <AlertTriangle className="h-5 w-5 text-yellow-500" />
                        <div>
                          <p className="font-medium text-yellow-700 dark:text-yellow-400">VAPID keys required</p>
                          <p className="text-sm text-muted-foreground">Configure VAPID keys above to enable push notifications</p>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="text-base font-medium">Push Notifications for this Device</span>
                              {pushSubscribed ? (
                                <Badge variant="default" className="bg-green-500">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Enabled
                                </Badge>
                              ) : (
                                <Badge variant="secondary">
                                  Disabled
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {pushSubscribed
                                ? "You will receive push notifications on this device"
                                : "Enable to receive notifications when the app is closed"}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            {pushSubscribed ? (
                              <Button
                                type="button"
                                variant="outline"
                                onClick={unsubscribeFromPush}
                                disabled={pushLoading}
                                data-testid="button-unsubscribe-push"
                              >
                                {pushLoading ? (
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4 mr-2" />
                                )}
                                Unsubscribe
                              </Button>
                            ) : (
                              <Button
                                type="button"
                                onClick={subscribeToPush}
                                disabled={pushLoading}
                                data-testid="button-subscribe-push"
                              >
                                {pushLoading ? (
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                  <BellRing className="h-4 w-4 mr-2" />
                                )}
                                Enable Push Notifications
                              </Button>
                            )}
                          </div>
                        </div>

                        {pushSubscribed && (
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => testPushMutation.mutate()}
                              disabled={testPushMutation.isPending}
                              data-testid="button-test-push"
                            >
                              {testPushMutation.isPending ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              ) : (
                                <Bell className="h-4 w-4 mr-2" />
                              )}
                              Send Test Notification
                            </Button>
                          </div>
                        )}

                        <Separator />

                        <div className="space-y-4">
                          <h4 className="text-sm font-medium">Your Active Subscriptions</h4>
                          {pushSubscriptions && pushSubscriptions.length > 0 ? (
                            <div className="space-y-2">
                              {pushSubscriptions.map((sub) => (
                                <div
                                  key={sub.id}
                                  className="flex items-center justify-between rounded-lg border p-3"
                                  data-testid={`push-subscription-${sub.id}`}
                                >
                                  <div className="space-y-1">
                                    <p className="text-sm font-medium">
                                      {sub.userAgent?.includes("Chrome")
                                        ? "Chrome"
                                        : sub.userAgent?.includes("Firefox")
                                        ? "Firefox"
                                        : sub.userAgent?.includes("Safari")
                                        ? "Safari"
                                        : "Browser"}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      Subscribed {new Date(sub.createdAt).toLocaleDateString()}
                                    </p>
                                  </div>
                                  <Badge variant="outline">Active</Badge>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground">No active subscriptions</p>
                          )}
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="notifications" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Notification Channels</CardTitle>
                    <CardDescription>
                      Configure which notification channels are enabled
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="inAppNotificationsEnabled"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">In-App Notifications</FormLabel>
                            <FormDescription>
                              Show notifications within the application
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              data-testid="switch-in-app"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="events" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Event Notifications</CardTitle>
                    <CardDescription>
                      Choose which events should trigger notifications
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="notifyOnUserCreated"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">User Created</FormLabel>
                            <FormDescription>
                              Notify when a new user account is created
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              data-testid="switch-user-created"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="notifyOnUserDeleted"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">User Deleted</FormLabel>
                            <FormDescription>
                              Notify when a user account is deleted
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              data-testid="switch-user-deleted"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="notifyOnPasswordChange"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Password Changed</FormLabel>
                            <FormDescription>
                              Notify when a user changes their password
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              data-testid="switch-password-change"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="notifyOnLoginFailure"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Login Failure</FormLabel>
                            <FormDescription>
                              Notify on failed login attempts
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              data-testid="switch-login-failure"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="notifyOnRoleChange"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Role Changed</FormLabel>
                            <FormDescription>
                              Notify when a user's role is changed
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              data-testid="switch-role-change"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-4">
              <Link href="/admin-console">
                <Button variant="outline" data-testid="button-cancel">Cancel</Button>
              </Link>
              <Button
                type="submit"
                disabled={updateMutation.isPending}
                data-testid="button-save"
              >
                {updateMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save Settings
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
