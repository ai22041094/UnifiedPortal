import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "wouter";
import { Building, ChevronLeft, Save, Loader2 } from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { OrganizationSettings } from "@shared/schema";

const organizationFormSchema = z.object({
  organizationName: z.string().min(1, "Organization name is required").max(100),
  tagline: z.string().max(200).optional().nullable(),
  website: z.string().url("Invalid URL").optional().nullable().or(z.literal("")),
  email: z.string().email("Invalid email").optional().nullable().or(z.literal("")),
  phone: z.string().max(20).optional().nullable(),
  address: z.string().max(500).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  state: z.string().max(100).optional().nullable(),
  country: z.string().max(100).optional().nullable(),
  postalCode: z.string().max(20).optional().nullable(),
  logoUrl: z.string().optional().nullable(),
  faviconUrl: z.string().optional().nullable(),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid color format").optional().nullable().or(z.literal("")),
  secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid color format").optional().nullable().or(z.literal("")),
  footerText: z.string().max(500).optional().nullable(),
  copyrightText: z.string().max(200).optional().nullable(),
});

type OrganizationFormValues = z.infer<typeof organizationFormSchema>;

export default function OrganizationSettingsPage() {
  const { toast } = useToast();

  const { data: settings, isLoading } = useQuery<OrganizationSettings>({
    queryKey: ["/api/organization"],
  });

  const form = useForm<OrganizationFormValues>({
    resolver: zodResolver(organizationFormSchema),
    defaultValues: {
      organizationName: "pcvisor",
      tagline: "",
      website: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      country: "",
      postalCode: "",
      logoUrl: "",
      faviconUrl: "",
      primaryColor: "#0066FF",
      secondaryColor: "#6366F1",
      footerText: "",
      copyrightText: "",
    },
    values: settings ? {
      organizationName: settings.organizationName || "pcvisor",
      tagline: settings.tagline || "",
      website: settings.website || "",
      email: settings.email || "",
      phone: settings.phone || "",
      address: settings.address || "",
      city: settings.city || "",
      state: settings.state || "",
      country: settings.country || "",
      postalCode: settings.postalCode || "",
      logoUrl: settings.logoUrl || "",
      faviconUrl: settings.faviconUrl || "",
      primaryColor: settings.primaryColor || "#0066FF",
      secondaryColor: settings.secondaryColor || "#6366F1",
      footerText: settings.footerText || "",
      copyrightText: settings.copyrightText || "",
    } : undefined,
  });

  const updateMutation = useMutation({
    mutationFn: async (data: OrganizationFormValues) => {
      const cleanData = Object.fromEntries(
        Object.entries(data).map(([key, value]) => [key, value === "" ? null : value])
      );
      const response = await apiRequest("PATCH", "/api/organization", cleanData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/organization"] });
      toast({
        title: "Settings Updated",
        description: "Organization settings have been saved successfully.",
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

  const onSubmit = (data: OrganizationFormValues) => {
    updateMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-6 h-16 flex items-center gap-4">
          <Link href="/admin-console" data-testid="link-back">
            <Button variant="ghost" size="icon">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-orange-500/10 rounded-lg flex items-center justify-center">
              <Building className="h-4 w-4 text-orange-500" />
            </div>
            <span className="font-medium">Organization Settings</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold" data-testid="text-page-title">Organization Settings</h1>
          <p className="text-muted-foreground mt-1">
            Manage your organization details and branding
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="details" data-testid="tab-details">Details</TabsTrigger>
                <TabsTrigger value="branding" data-testid="tab-branding">Branding</TabsTrigger>
                <TabsTrigger value="footer" data-testid="tab-footer">Footer</TabsTrigger>
              </TabsList>

              <TabsContent value="details">
                <Card>
                  <CardHeader>
                    <CardTitle>Organization Details</CardTitle>
                    <CardDescription>Basic information about your organization</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="organizationName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Organization Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="Your Organization" {...field} data-testid="input-org-name" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="tagline"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tagline</FormLabel>
                            <FormControl>
                              <Input placeholder="Your company tagline" {...field} value={field.value || ""} data-testid="input-tagline" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <Separator />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="website"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Website</FormLabel>
                            <FormControl>
                              <Input placeholder="https://example.com" {...field} value={field.value || ""} data-testid="input-website" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Contact Email</FormLabel>
                            <FormControl>
                              <Input placeholder="contact@example.com" {...field} value={field.value || ""} data-testid="input-email" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone</FormLabel>
                            <FormControl>
                              <Input placeholder="+1 (555) 123-4567" {...field} value={field.value || ""} data-testid="input-phone" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <Separator />

                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Street address" {...field} value={field.value || ""} data-testid="input-address" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City</FormLabel>
                            <FormControl>
                              <Input placeholder="City" {...field} value={field.value || ""} data-testid="input-city" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="state"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>State/Province</FormLabel>
                            <FormControl>
                              <Input placeholder="State" {...field} value={field.value || ""} data-testid="input-state" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="country"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Country</FormLabel>
                            <FormControl>
                              <Input placeholder="Country" {...field} value={field.value || ""} data-testid="input-country" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="postalCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Postal Code</FormLabel>
                            <FormControl>
                              <Input placeholder="12345" {...field} value={field.value || ""} data-testid="input-postal" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="branding">
                <Card>
                  <CardHeader>
                    <CardTitle>Branding</CardTitle>
                    <CardDescription>Customize your organization's visual identity</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="logoUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Logo URL</FormLabel>
                            <FormControl>
                              <Input placeholder="https://example.com/logo.png" {...field} value={field.value || ""} data-testid="input-logo-url" />
                            </FormControl>
                            <FormDescription>URL to your organization's logo</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="faviconUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Favicon URL</FormLabel>
                            <FormControl>
                              <Input placeholder="https://example.com/favicon.ico" {...field} value={field.value || ""} data-testid="input-favicon-url" />
                            </FormControl>
                            <FormDescription>URL to your browser tab icon</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <Separator />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="primaryColor"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Primary Color</FormLabel>
                            <div className="flex gap-2">
                              <FormControl>
                                <Input placeholder="#0066FF" {...field} value={field.value || ""} data-testid="input-primary-color" />
                              </FormControl>
                              <div
                                className="w-10 h-10 rounded-md border"
                                style={{ backgroundColor: field.value || "#0066FF" }}
                              />
                            </div>
                            <FormDescription>Main brand color (hex format)</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="secondaryColor"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Secondary Color</FormLabel>
                            <div className="flex gap-2">
                              <FormControl>
                                <Input placeholder="#6366F1" {...field} value={field.value || ""} data-testid="input-secondary-color" />
                              </FormControl>
                              <div
                                className="w-10 h-10 rounded-md border"
                                style={{ backgroundColor: field.value || "#6366F1" }}
                              />
                            </div>
                            <FormDescription>Secondary brand color (hex format)</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="footer">
                <Card>
                  <CardHeader>
                    <CardTitle>Footer Settings</CardTitle>
                    <CardDescription>Customize footer text displayed across the application</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <FormField
                      control={form.control}
                      name="footerText"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Footer Text</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Additional footer information..." {...field} value={field.value || ""} data-testid="input-footer-text" />
                          </FormControl>
                          <FormDescription>Optional text displayed in the footer</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="copyrightText"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Copyright Text</FormLabel>
                          <FormControl>
                            <Input placeholder="Company Name © 2025. All rights reserved." {...field} value={field.value || ""} data-testid="input-copyright" />
                          </FormControl>
                          <FormDescription>Copyright notice displayed in footers</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-4">
              <Link href="/admin-console">
                <Button type="button" variant="outline" data-testid="button-cancel">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={updateMutation.isPending} data-testid="button-save">
                {updateMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save Changes
              </Button>
            </div>
          </form>
        </Form>

        <footer className="mt-12 pt-6 border-t border-border/50 text-center text-sm text-muted-foreground">
          Hitachi Systems India Pvt Ltd © 2025. All rights reserved.
        </footer>
      </main>
    </div>
  );
}
