import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { useRBAC } from "@/lib/rbac";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, KeyRound, LogOut, ChevronDown } from "lucide-react";

interface ProfileDropdownProps {
  showUsername?: boolean;
}

export default function ProfileDropdown({ showUsername = false }: ProfileDropdownProps) {
  const { user, logout } = useAuth();
  const { hasPermission, isAdmin } = useRBAC();
  const [, navigate] = useLocation();
  
  const userInitials = user?.username.slice(0, 2).toUpperCase() || "U";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-3 px-2" data-testid="button-user-menu">
          {showUsername && (
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium" data-testid="text-username">{user?.username}</p>
              <p className="text-xs text-muted-foreground">
                {user?.fullName || "User"}
              </p>
            </div>
          )}
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary border-2 border-primary/20">
            {userInitials}
          </div>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate("/profile")} data-testid="menu-profile">
          <User className="mr-2 h-4 w-4" />
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate("/change-password")} data-testid="menu-change-password">
          <KeyRound className="mr-2 h-4 w-4" />
          Change Password
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logout} data-testid="menu-logout">
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
