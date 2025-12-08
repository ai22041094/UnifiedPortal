import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "wouter";
import { useEffect } from "react";
import { Lock, ChevronLeft, Save, Loader2, Shield, Key, Clock, Globe, AlertTriangle } from "lucide-react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { SecuritySettings } from "@shared/schema";

const securityFormSchema = z.object({
  minPasswordLength: z.string().default("8"),
  requireUppercase: z.boolean().default(true),
  requireLowercase: z.boolean().default(true),
  requireNumbers: z.boolean().default(true),
  requireSpecialChars: z.boolean().default(true),
  passwordExpiryDays: z.string().default("90"),
  passwordHistoryCount: z.string().default("5"),
  maxLoginAttempts: z.string().default("5"),
  lockoutDurationMinutes: z.string().default("30"),
  sessionTimeoutMinutes: z.string().default("60"),
  mfaEnabled: z.boolean().default(false),
  mfaMethod: z.string().default("email"),
  ipWhitelistEnabled: z.boolean().default(false),
  ipWhitelist: z.string().optional().nullable(),
  auditLogRetentionDays: z.string().default("365"),
});

type SecurityFormValues = z.infer<typeof securityFormSchema>;

export default function SecuritySettingsPage() {
  const { toast } = useToast();

  const { data: settings, isLoading } = useQuery<SecuritySettings>({
    queryKey: ["/api/security"],
  });

  const form = useForm<SecurityFormValues>({
    resolver: zodResolver(securityFormSchema),
    defaultValues: {
      minPasswordLength: "8",
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
      passwordExpiryDays: "90",
      passwordHistoryCount: "5",
      maxLoginAttempts: "5",
      lockoutDurationMinutes: "30",
      sessionTimeoutMinutes: "60",
      mfaEnabled: false,
      mfaMethod: "email",
      ipWhitelistEnabled: false,
      ipWhitelist: "",
      auditLogRetentionDays: "365",
    },
  });

  useEffect(() => {
    if (settings) {
      form.reset({
        minPasswordLength: settings.minPasswordLength || "8",
        requireUppercase: settings.requireUppercase ?? true,
        requireLowercase: settings.requireLowercase ?? true,
        requireNumbers: settings.requireNumbers ?? true,
        requireSpecialChars: settings.requireSpecialChars ?? true,
        passwordExpiryDays: settings.passwordExpiryDays || "90",
        passwordHistoryCount: settings.passwordHistoryCount || "5",
        maxLoginAttempts: settings.maxLoginAttempts || "5",
        lockoutDurationMinutes: settings.lockoutDurationMinutes || "30",
        sessionTimeoutMinutes: settings.sessionTimeoutMinutes || "60",
        mfaEnabled: settings.mfaEnabled ?? false,
        mfaMethod: settings.mfaMethod || "email",
        ipWhitelistEnabled: settings.ipWhitelistEnabled ?? false,
        ipWhitelist: settings.ipWhitelist || "",
        auditLogRetentionDays: settings.auditLogRetentionDays || "365",
      });
    }
  }, [settings, form]);

  const updateMutation = useMutation({
    mutationFn: async (data: SecurityFormValues) => {
      return apiRequest("PATCH", "/api/security", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/security"] });
      toast({
        title: "Settings Saved",
        description: "Security settings have been updated successfully.",
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

  const onSubmit = (data: SecurityFormValues) => {
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
            <div className="h-8 w-8 bg-red-500/10 rounded-lg flex items-center justify-center">
              <Lock className="h-4 w-4 text-red-500" />
            </div>
            <span className="font-medium">Security Settings</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" data-testid="text-page-title">Security Settings</h1>
          <p className="text-muted-foreground">
            Configure password policies, authentication options, and security controls
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <Tabs defaultValue="password" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4" data-testid="tabs-security">
                <TabsTrigger value="password" data-testid="tab-password">Password Policy</TabsTrigger>
                <TabsTrigger value="authentication" data-testid="tab-authentication">Authentication</TabsTrigger>
                <TabsTrigger value="session" data-testid="tab-session">Session</TabsTrigger>
                <TabsTrigger value="advanced" data-testid="tab-advanced">Advanced</TabsTrigger>
              </TabsList>

              <TabsContent value="password" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Key className="h-5 w-5" />
                      Password Requirements
                    </CardTitle>
                    <CardDescription>
                      Define password complexity requirements for all users
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <FormField
                      control={form.control}
                      name="minPasswordLength"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Minimum Password Length</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="6" 
                              max="32" 
                              {...field} 
                              data-testid="input-min-password-length"
                            />
                          </FormControl>
                          <FormDescription>
                            Minimum number of characters required (6-32)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Separator />

                    <div className="space-y-4">
                      <h4 className="text-sm font-medium">Character Requirements</h4>
                      
                      <FormField
                        control={form.control}
                        name="requireUppercase"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between">
                            <div>
                              <FormLabel>Require Uppercase Letters</FormLabel>
                              <FormDescription>
                                Password must contain at least one uppercase letter (A-Z)
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                data-testid="switch-require-uppercase"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="requireLowercase"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between">
                            <div>
                              <FormLabel>Require Lowercase Letters</FormLabel>
                              <FormDescription>
                                Password must contain at least one lowercase letter (a-z)
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                data-testid="switch-require-lowercase"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="requireNumbers"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between">
                            <div>
                              <FormLabel>Require Numbers</FormLabel>
                              <FormDescription>
                                Password must contain at least one number (0-9)
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                data-testid="switch-require-numbers"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="requireSpecialChars"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between">
                            <div>
                              <FormLabel>Require Special Characters</FormLabel>
                              <FormDescription>
                                Password must contain at least one special character
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                data-testid="switch-require-special"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>

                    <Separator />

                    <div className="grid grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="passwordExpiryDays"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password Expiry (Days)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                min="0" 
                                max="365" 
                                {...field} 
                                data-testid="input-password-expiry"
                              />
                            </FormControl>
                            <FormDescription>
                              Days until password expires (0 = never)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="passwordHistoryCount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password History</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                min="0" 
                                max="24" 
                                {...field} 
                                data-testid="input-password-history"
                              />
                            </FormControl>
                            <FormDescription>
                              Number of previous passwords to remember
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="authentication" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Login Security
                    </CardTitle>
                    <CardDescription>
                      Configure login attempt limits and account lockout policies
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="maxLoginAttempts"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Maximum Login Attempts</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                min="1" 
                                max="10" 
                                {...field} 
                                data-testid="input-max-login-attempts"
                              />
                            </FormControl>
                            <FormDescription>
                              Failed attempts before account lockout
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="lockoutDurationMinutes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Lockout Duration (Minutes)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                min="1" 
                                max="1440" 
                                {...field} 
                                data-testid="input-lockout-duration"
                              />
                            </FormControl>
                            <FormDescription>
                              Duration of account lockout after max attempts
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h4 className="text-sm font-medium">Multi-Factor Authentication</h4>
                      
                      <FormField
                        control={form.control}
                        name="mfaEnabled"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between">
                            <div>
                              <FormLabel>Enable MFA</FormLabel>
                              <FormDescription>
                                Require multi-factor authentication for all users
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                data-testid="switch-mfa-enabled"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      {form.watch("mfaEnabled") && (
                        <FormField
                          control={form.control}
                          name="mfaMethod"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>MFA Method</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-mfa-method">
                                    <SelectValue placeholder="Select MFA method" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="email">Email OTP</SelectItem>
                                  <SelectItem value="totp">Authenticator App (TOTP)</SelectItem>
                                  <SelectItem value="sms">SMS OTP</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormDescription>
                                Choose the primary method for multi-factor authentication
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="session" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Session Management
                    </CardTitle>
                    <CardDescription>
                      Configure session timeout and idle policies
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <FormField
                      control={form.control}
                      name="sessionTimeoutMinutes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Session Timeout (Minutes)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="5" 
                              max="1440" 
                              {...field} 
                              data-testid="input-session-timeout"
                            />
                          </FormControl>
                          <FormDescription>
                            Automatically log out users after this period of inactivity
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="advanced" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="h-5 w-5" />
                      IP Whitelist
                    </CardTitle>
                    <CardDescription>
                      Restrict access to specific IP addresses
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <FormField
                      control={form.control}
                      name="ipWhitelistEnabled"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between">
                          <div>
                            <FormLabel>Enable IP Whitelist</FormLabel>
                            <FormDescription>
                              Only allow access from specified IP addresses
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              data-testid="switch-ip-whitelist"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    {form.watch("ipWhitelistEnabled") && (
                      <FormField
                        control={form.control}
                        name="ipWhitelist"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Allowed IP Addresses</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Enter IP addresses, one per line&#10;Example:&#10;192.168.1.1&#10;10.0.0.0/24"
                                className="min-h-[120px]"
                                {...field}
                                value={field.value || ""}
                                data-testid="textarea-ip-whitelist"
                              />
                            </FormControl>
                            <FormDescription>
                              Enter IP addresses or CIDR ranges, one per line
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5" />
                      Audit Log Settings
                    </CardTitle>
                    <CardDescription>
                      Configure audit log retention period
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <FormField
                      control={form.control}
                      name="auditLogRetentionDays"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Audit Log Retention (Days)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="30" 
                              max="3650" 
                              {...field} 
                              data-testid="input-audit-retention"
                            />
                          </FormControl>
                          <FormDescription>
                            Number of days to retain audit logs (30-3650)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end mt-8">
              <Button 
                type="submit" 
                disabled={updateMutation.isPending}
                data-testid="button-save-settings"
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
      </main>
    </div>
  );
}
