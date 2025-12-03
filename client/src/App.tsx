import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Portal from "@/pages/Portal";
import LoginPage from "@/pages/Login";
import CustomPortal from "@/pages/apps/CustomPortal";
import AssetManagement from "@/pages/apps/AssetManagement";
import ServiceDesk from "@/pages/apps/ServiceDesk";
import EPM from "@/pages/apps/EPM";

function Router() {
  return (
    <Switch>
      <Route path="/" component={LoginPage} />
      <Route path="/portal" component={Portal} />
      <Route path="/apps/custom-portal" component={CustomPortal} />
      <Route path="/apps/alm" component={AssetManagement} />
      <Route path="/apps/service-desk" component={ServiceDesk} />
      <Route path="/apps/epm" component={EPM} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
