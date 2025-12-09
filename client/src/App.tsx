import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/auth";
import { RBACProvider } from "@/lib/rbac";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import LoginPage from "@/pages/Login";
import Profile from "@/pages/Profile";
import ChangePasswordPage from "@/pages/ChangePassword";
import MfaSetup from "@/pages/MfaSetup";
import AdminConsole from "@/pages/AdminConsole";
import CustomPortal from "@/pages/apps/CustomPortal";
import AssetManagement from "@/pages/apps/AssetManagement";
import ServiceDesk from "@/pages/apps/ServiceDesk";
import EPM from "@/pages/apps/EPM";
import UserMaster from "@/pages/admin/UserMaster";
import RoleMaster from "@/pages/admin/RoleMaster";
import OrganizationSettings from "@/pages/admin/OrganizationSettings";
import NotificationSettings from "@/pages/admin/NotificationSettings";
import SecuritySettings from "@/pages/admin/SecuritySettings";
import AuditLogs from "@/pages/admin/AuditLogs";
import SystemConfig from "@/pages/admin/SystemConfig";
import DatabaseManagement from "@/pages/admin/DatabaseManagement";
import SystemMonitoring from "@/pages/admin/SystemMonitoring";

function Router() {
  return (
    <Switch>
      <Route path="/" component={LoginPage} />
      <Route path="/portal">
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      </Route>
      <Route path="/profile">
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      </Route>
      <Route path="/change-password">
        <ProtectedRoute>
          <ChangePasswordPage />
        </ProtectedRoute>
      </Route>
      <Route path="/mfa-setup">
        <ProtectedRoute>
          <MfaSetup />
        </ProtectedRoute>
      </Route>
      <Route path="/admin-console">
        <ProtectedRoute>
          <AdminConsole />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/users">
        <ProtectedRoute>
          <UserMaster />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/roles">
        <ProtectedRoute>
          <RoleMaster />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/organization">
        <ProtectedRoute>
          <OrganizationSettings />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/notifications">
        <ProtectedRoute>
          <NotificationSettings />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/security">
        <ProtectedRoute>
          <SecuritySettings />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/audit-logs">
        <ProtectedRoute>
          <AuditLogs />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/system-config">
        <ProtectedRoute>
          <SystemConfig />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/database">
        <ProtectedRoute>
          <DatabaseManagement />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/monitoring">
        <ProtectedRoute>
          <SystemMonitoring />
        </ProtectedRoute>
      </Route>
      <Route path="/apps/custom-portal">
        <ProtectedRoute>
          <CustomPortal />
        </ProtectedRoute>
      </Route>
      <Route path="/apps/alm">
        <ProtectedRoute>
          <AssetManagement />
        </ProtectedRoute>
      </Route>
      <Route path="/apps/alm/*">
        <ProtectedRoute>
          <AssetManagement />
        </ProtectedRoute>
      </Route>
      <Route path="/apps/service-desk">
        <ProtectedRoute>
          <ServiceDesk />
        </ProtectedRoute>
      </Route>
      <Route path="/apps/epm">
        <ProtectedRoute>
          <EPM />
        </ProtectedRoute>
      </Route>
      <Route path="/apps/epm/*">
        <ProtectedRoute>
          <EPM />
        </ProtectedRoute>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RBACProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </RBACProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
