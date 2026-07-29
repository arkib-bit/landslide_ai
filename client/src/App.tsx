import DispatchPage from "./pages/DispatchPage";
import EmergencyBroadcastPage from "@/pages/EmergencyBroadcastPage";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Layout from "@/components/layout";
import Dashboard from "@/pages/dashboard";
import MapPage from "@/pages/map";
import AlertsPage from "@/pages/alerts";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/map" component={MapPage} />
        <Route path="/alerts" component={AlertsPage} />
        <Route path="/emergency-broadcast" component={EmergencyBroadcastPage} />
        <Route path="/dispatch" component={DispatchPage} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
