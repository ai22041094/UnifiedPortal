import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "wouter";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Pencil,
  Trash2,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { MENU_ITEMS, getPermissionLabel, type MenuItem } from "@/lib/menu-config";
import type { Role } from "@shared/schema";

const roleFormSchema = z.object({
  name: z.string().min(2, "Role name must be at least 2 characters"),
  description: z.string().optional().or(z.literal("")),
  permissions: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
});

type RoleFormValues = z.infer<typeof roleFormSchema>;

function MenuItemCheckbox({
  item,
  selectedPermissions,
  onToggleMultiple,
  level = 0,
}: {
  item: MenuItem;
  selectedPermissions: string[];
  onToggleMultiple: (idsToAdd: string[], idsToRemove: string[]) => void;
  level?: number;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const hasChildren = item.children && item.children.length > 0;
  
  const getAllDescendantIds = (menuItem: MenuItem): string[] => {
    const ids: string[] = [];
    if (menuItem.children) {
      menuItem.children.forEach((child) => {
        ids.push(child.id);
        ids.push(...getAllDescendantIds(child));
      });
    }
    return ids;
  };

  const childIds = hasChildren ? getAllDescendantIds(item) : [];
  const allIds = [item.id, ...childIds];
  const selectedCount = allIds.filter((id) => selectedPermissions.includes(id)).length;
  const isChecked = selectedCount === allIds.length;
  const isIndeterminate = selectedCount > 0 && selectedCount < allIds.length;
  
  const handleToggle = () => {
    if (isChecked || isIndeterminate) {
      onToggleMultiple([], allIds);
    } else {
      onToggleMultiple(allIds, []);
    }
  };

  if (hasChildren) {
    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div
          className="flex items-center gap-2 py-1.5"
          style={{ paddingLeft: `${level * 20}px` }}
        >
          <Checkbox
            checked={isIndeterminate ? "indeterminate" : isChecked}
            onCheckedChange={handleToggle}
            data-testid={`checkbox-permission-${item.id}`}
          />
          <CollapsibleTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-1 text-sm hover:text-foreground text-muted-foreground"
              data-testid={`toggle-${item.id}`}
            >
              {isOpen ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
              <span className="font-medium text-foreground">{item.label}</span>
            </button>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent>
          {item.children?.map((child) => (
            <MenuItemCheckbox
              key={child.id}
              item={child}
              selectedPermissions={selectedPermissions}
              onToggleMultiple={onToggleMultiple}
              level={level + 1}
            />
          ))}
        </CollapsibleContent>
      </Collapsible>
    );
  }

  return (
    <div
      className="flex items-center gap-2 py-1.5"
      style={{ paddingLeft: `${level * 20 + 24}px` }}
    >
      <Checkbox
        checked={selectedPermissions.includes(item.id)}
        onCheckedChange={() => {
          if (selectedPermissions.includes(item.id)) {
            onToggleMultiple([], [item.id]);
          } else {
            onToggleMultiple([item.id], []);
          }
        }}
        data-testid={`checkbox-permission-${item.id}`}
      />
      <span className="text-sm">{item.label}</span>
    </div>
  );
}

function MenuGroupSection({
  groupId,
  groupLabel,
  items,
  selectedPermissions,
  onToggleMultiple,
}: {
  groupId: string;
  groupLabel: string;
  items: MenuItem[];
  selectedPermissions: string[];
  onToggleMultiple: (idsToAdd: string[], idsToRemove: string[]) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const getAllItemIds = (menuItems: MenuItem[]): string[] => {
    const ids: string[] = [];
    menuItems.forEach((item) => {
      ids.push(item.id);
      if (item.children) {
        ids.push(...getAllItemIds(item.children));
      }
    });
    return ids;
  };

  const allIds = getAllItemIds(items);
  const selectedCount = allIds.filter((id) => selectedPermissions.includes(id)).length;
  const allSelected = selectedCount === allIds.length && allIds.length > 0;
  const isIndeterminate = selectedCount > 0 && selectedCount < allIds.length;

  const handleGroupToggle = () => {
    if (allSelected || isIndeterminate) {
      onToggleMultiple([], allIds);
    } else {
      onToggleMultiple(allIds, []);
    }
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="border-b last:border-b-0">
      <div className="flex items-center gap-2 px-3 py-2.5 bg-muted/30">
        <Checkbox
          checked={isIndeterminate ? "indeterminate" : allSelected}
          onCheckedChange={handleGroupToggle}
          data-testid={`checkbox-group-${groupId}`}
        />
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className="flex items-center justify-between flex-1 text-left"
            data-testid={`toggle-group-${groupId}`}
          >
            <span className="font-medium text-sm">{groupLabel}</span>
            {isOpen ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent className="px-3 py-2 bg-background">
        {items.map((item) => (
          <MenuItemCheckbox
            key={item.id}
            item={item}
            selectedPermissions={selectedPermissions}
            onToggleMultiple={onToggleMultiple}
          />
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
}

function PermissionsTreeView({
  selectedPermissions,
  onToggleMultiple,
}: {
  selectedPermissions: string[];
  onToggleMultiple: (idsToAdd: string[], idsToRemove: string[]) => void;
}) {
  return (
    <div className="border rounded-md overflow-hidden">
      <ScrollArea className="h-80">
        {MENU_ITEMS.map((group) => (
          <MenuGroupSection
            key={group.id}
            groupId={group.id}
            groupLabel={group.label}
            items={group.items}
            selectedPermissions={selectedPermissions}
            onToggleMultiple={onToggleMultiple}
          />
        ))}
      </ScrollArea>
    </div>
  );
}

function RoleCard({
  role,
  onEdit,
  onDelete,
}: {
  role: Role;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const permissions = (role.permissions as string[]) || [];
  const displayCount = 3;
  const displayPermissions = permissions.slice(0, displayCount);
  const remainingCount = permissions.length - displayCount;

  return (
    <Card className="relative" data-testid={`card-role-${role.id}`}>
      <CardHeader className="pb-2 flex flex-row items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <CardTitle className="text-base truncate">{role.name}</CardTitle>
          <CardDescription className="text-xs mt-1 line-clamp-2">
            {role.description || "No description"}
          </CardDescription>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={onEdit}
            data-testid={`button-edit-role-${role.id}`}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-destructive"
            onClick={onDelete}
            data-testid={`button-delete-role-${role.id}`}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex flex-wrap gap-1.5">
          {displayPermissions.map((perm) => (
            <Badge key={perm} variant="secondary" className="text-xs">
              {getPermissionLabel(perm)}
            </Badge>
          ))}
          {remainingCount > 0 && (
            <Badge variant="outline" className="text-xs">
              +{remainingCount} more
            </Badge>
          )}
          {permissions.length === 0 && (
            <span className="text-xs text-muted-foreground">No permissions assigned</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function RoleMaster() {
  const { toast } = useToast();
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [deletingRole, setDeletingRole] = useState<Role | null>(null);

  const { data: roles = [], isLoading } = useQuery<Role[]>({
    queryKey: ["/api/roles"],
  });

  const createForm = useForm<RoleFormValues>({
    resolver: zodResolver(roleFormSchema),
    defaultValues: {
      name: "",
      description: "",
      permissions: [],
      isActive: true,
    },
  });

  const editForm = useForm<RoleFormValues>({
    resolver: zodResolver(roleFormSchema),
    defaultValues: {
      name: "",
      description: "",
      permissions: [],
      isActive: true,
    },
  });

  const selectedPermissions = createForm.watch("permissions") || [];

  const createMutation = useMutation({
    mutationFn: async (data: RoleFormValues) => {
      return apiRequest("POST", "/api/roles", {
        ...data,
        description: data.description || null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/roles"] });
      createForm.reset();
      toast({ title: "Role created successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to create role", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: RoleFormValues }) => {
      return apiRequest("PATCH", `/api/roles/${id}`, {
        ...data,
        description: data.description || null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/roles"] });
      setEditingRole(null);
      toast({ title: "Role updated successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update role", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/roles/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/roles"] });
      setDeletingRole(null);
      toast({ title: "Role deleted successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to delete role", description: error.message, variant: "destructive" });
    },
  });

  const openEditDialog = (role: Role) => {
    setEditingRole(role);
    editForm.reset({
      name: role.name,
      description: role.description || "",
      permissions: (role.permissions as string[]) || [],
      isActive: role.isActive ?? true,
    });
  };

  const handleToggleMultiple = (idsToAdd: string[], idsToRemove: string[]) => {
    const current = new Set(selectedPermissions);
    idsToRemove.forEach((id) => current.delete(id));
    idsToAdd.forEach((id) => current.add(id));
    createForm.setValue("permissions", Array.from(current));
  };

  const editSelectedPermissions = editForm.watch("permissions") || [];
  
  const handleEditToggleMultiple = (idsToAdd: string[], idsToRemove: string[]) => {
    const current = new Set(editSelectedPermissions);
    idsToRemove.forEach((id) => current.delete(id));
    idsToAdd.forEach((id) => current.add(id));
    editForm.setValue("permissions", Array.from(current));
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold">Create User Roles</h1>
          </div>
          <Button variant="outline" asChild>
            <Link href="/portal" data-testid="link-back-portal">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
        <p className="container mx-auto px-6 pb-4 text-sm text-muted-foreground">
          Define custom roles by selecting pages and functionalities
        </p>
      </header>

      <main className="container mx-auto px-6 py-6">
        <div className="grid lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>Create New Role</CardTitle>
                <CardDescription>
                  Define role name and select accessible pages
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...createForm}>
                  <form
                    onSubmit={createForm.handleSubmit((data) => createMutation.mutate(data))}
                    className="space-y-6"
                  >
                    <FormField
                      control={createForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Role Name *</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="e.g., Expense Approver"
                              data-testid="input-create-rolename"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={createForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder="e.g., Can approve expense claims"
                              rows={2}
                              data-testid="input-create-description"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Assign Pages & Functionalities</Label>
                        <span className="text-sm text-muted-foreground">
                          {selectedPermissions.length} selected
                        </span>
                      </div>
                      <PermissionsTreeView
                        selectedPermissions={selectedPermissions}
                        onToggleMultiple={handleToggleMultiple}
                      />
                    </div>

                    <FormField
                      control={createForm.control}
                      name="isActive"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between">
                          <FormLabel>Active Status</FormLabel>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              data-testid="switch-create-active"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      disabled={createMutation.isPending}
                      data-testid="button-create-role"
                    >
                      {createMutation.isPending ? "Creating..." : "Create Role"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <div className="sticky top-28">
              <div className="mb-4">
                <h2 className="text-lg font-semibold">Custom Roles</h2>
                <p className="text-sm text-muted-foreground">Roles you've created</p>
              </div>

              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                </div>
              ) : (
                <ScrollArea className="h-[calc(100vh-220px)]">
                  <div className="space-y-3 pr-4">
                    {roles.length === 0 ? (
                      <Card>
                        <CardContent className="py-8 text-center text-muted-foreground">
                          No roles created yet
                        </CardContent>
                      </Card>
                    ) : (
                      roles.map((role) => (
                        <RoleCard
                          key={role.id}
                          role={role}
                          onEdit={() => openEditDialog(role)}
                          onDelete={() => setDeletingRole(role)}
                        />
                      ))
                    )}
                  </div>
                </ScrollArea>
              )}
            </div>
          </div>
        </div>
      </main>

      <Dialog open={!!editingRole} onOpenChange={() => setEditingRole(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Role</DialogTitle>
            <DialogDescription>
              Update the role details and permissions
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form
              onSubmit={editForm.handleSubmit((data) =>
                editingRole && updateMutation.mutate({ id: editingRole.id, data })
              )}
              className="space-y-6"
            >
              <FormField
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role Name *</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-edit-rolename" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={2} data-testid="input-edit-description" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Assign Pages & Functionalities</Label>
                  <span className="text-sm text-muted-foreground">
                    {editSelectedPermissions.length} selected
                  </span>
                </div>
                <PermissionsTreeView
                  selectedPermissions={editSelectedPermissions}
                  onToggleMultiple={handleEditToggleMultiple}
                />
              </div>

              <FormField
                control={editForm.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between">
                    <FormLabel>Active Status</FormLabel>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        data-testid="switch-edit-active"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditingRole(null)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updateMutation.isPending} data-testid="button-submit-edit">
                  {updateMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deletingRole} onOpenChange={() => setDeletingRole(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Role</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete role "{deletingRole?.name}"? This action cannot be undone.
              Users assigned to this role will lose their permissions.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingRole && deleteMutation.mutate(deletingRole.id)}
              className="bg-destructive text-destructive-foreground"
              data-testid="button-confirm-delete"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
