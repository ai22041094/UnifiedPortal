import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/auth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import LoginPage from "@/pages/Login";
import CustomPortal from "@/pages/apps/CustomPortal";
import AssetManagement from "@/pages/apps/AssetManagement";
import ServiceDesk from "@/pages/apps/ServiceDesk";
import EPM from "@/pages/apps/EPM";

function Router() {
  return (
    <Switch>
      <Route path="/" component={LoginPage} />
      <Route path="/portal">
        <ProtectedRoute>
          <Dashboard />
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
      <Route path="/apps/alm/:rest*">
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
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
