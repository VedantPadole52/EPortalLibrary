
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import CitizenLogin from "@/pages/CitizenLogin";
import CitizenRegister from "@/pages/CitizenRegister";
import AdminLogin from "@/pages/AdminLogin";
import CitizenDashboard from "@/pages/CitizenDashboard";
import AdminDashboard from "@/pages/AdminDashboard";
import ReadingHistory from "@/pages/ReadingHistory";
import AdminBookManager from "@/pages/AdminBookManager";
import AdminUsers from "@/pages/AdminUsers";
import AdminCategories from "@/pages/AdminCategories";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={CitizenLogin} />
      <Route path="/register" component={CitizenRegister} />
      <Route path="/portal/admin-access" component={AdminLogin} />
      <Route path="/citizen/dashboard" component={CitizenDashboard} />
      <Route path="/citizen/reading-history" component={ReadingHistory} />
      <Route path="/admin/dashboard" component={AdminDashboard} />
      <Route path="/admin/books" component={AdminBookManager} />
      <Route path="/admin/users" component={AdminUsers} />
      <Route path="/admin/categories" component={AdminCategories} />
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
