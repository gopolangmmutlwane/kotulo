import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { RoleProvider } from "@/hooks/use-role";
import { CartProvider } from "@/hooks/use-cart";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Products from "@/pages/products";
import FarmerProfile from "@/pages/farmer-profile";
import Checkout from "@/pages/checkout";
import Dashboard from "@/pages/dashboard";
import B2BOrdering from "@/pages/b2b-ordering";
import VendorPortal from "@/pages/vendor-portal";
import Operations from "@/pages/operations";
import AdminPanel from "@/pages/admin-panel";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/products" component={Products} />
      <Route path="/products/:category" component={Products} />
      <Route path="/farmers/:id" component={FarmerProfile} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/b2b" component={B2BOrdering} />
      <Route path="/vendor" component={VendorPortal} />
      <Route path="/operations" component={Operations} />
      <Route path="/admin" component={AdminPanel} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <RoleProvider>
          <CartProvider>
            <Toaster />
            <Router />
          </CartProvider>
        </RoleProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
