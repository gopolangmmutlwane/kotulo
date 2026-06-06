import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { RoleProvider } from "@/hooks/use-role";
import { CartProvider } from "@/hooks/use-cart";
import { AuthProvider } from "@/hooks/use-auth";
import { useSessionTimeout } from "@/hooks/use-session-timeout";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Products from "@/pages/products";
import FarmerProfile from "@/pages/farmer-profile";
import Checkout from "@/pages/checkout";
import Dashboard from "@/pages/dashboard";
import CustomerDashboard from "@/pages/customer-dashboard";
import FarmerDashboard from "@/pages/farmer-dashboard";
import VendorDashboard from "@/pages/vendor-dashboard";
import Application from "@/pages/application";
import B2BOrdering from "@/pages/b2b-ordering";
import VendorPortal from "@/pages/vendor-portal";
import Operations from "@/pages/operations";
import AdminPanel from "@/pages/admin-panel";
import Login from "@/pages/login";
import Signup from "@/pages/signup";
import ForgotPassword from "@/pages/forgot-password";
import ResetPassword from "@/pages/reset-password";
import AddProduct from "@/pages/add-product";
import FarmerAnalytics from "@/pages/farmer-analytics";

function Router() {
  const [location] = useLocation();
  
  // Debug: log current location
  console.log("Current route:", location);
  
  return (
    <Switch>
      <Route path="/products/:category" component={Products} />
      <Route path="/products" component={Products} />
      <Route path="/farmers/:id" component={FarmerProfile} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/customer-dashboard" component={CustomerDashboard} />
      <Route path="/farmer-dashboard" component={FarmerDashboard} />
      <Route path="/vendor-dashboard" component={VendorDashboard} />
      <Route path="/application" component={Application} />
      <Route path="/b2b" component={B2BOrdering} />
      <Route path="/vendor" component={VendorPortal} />
      <Route path="/add-product" component={AddProduct} />
      <Route path="/add-product" component={AddProduct} />
      <Route path="/farmer-analytics" component={FarmerAnalytics} />
      <Route path="/operations" component={Operations} />
      <Route path="/admin" component={AdminPanel} />
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/reset-password" component={ResetPassword} />
      <Route path="/" component={Home} />
      <Route component={NotFound} />
    </Switch>
  );
}

function SessionTimeoutManager({ children }: { children: React.ReactNode }) {
  useSessionTimeout();
  return <>{children}</>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <SessionTimeoutManager>
            <RoleProvider>
              <CartProvider>
                <Toaster />
                <Router />
              </CartProvider>
            </RoleProvider>
          </SessionTimeoutManager>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
