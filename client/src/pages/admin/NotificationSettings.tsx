import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "wouter";
import { useEffect } from "react";
import { Bell, ChevronLeft, Save, Loader2, Mail, MessageSquare, AlertTriangle } from "lucide-react";
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
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { NotificationSettings } from "@shared/schema";

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

  const { data: settings, isLoading } = useQuery<NotificationSettings>({
    queryKey: ["/api/notifications"],
  });

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
              <TabsList className="grid w-full max-w-md grid-cols-3">
                <TabsTrigger value="email" data-testid="tab-email">
                  <Mail className="h-4 w-4 mr-2" />
                  Email
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

                    <FormField
                      control={form.control}
                      name="pushNotificationsEnabled"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Push Notifications</FormLabel>
                            <FormDescription>
                              Send browser push notifications (requires additional setup)
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              data-testid="switch-push"
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
