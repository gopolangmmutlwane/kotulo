import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { RoleProvider } from "@/hooks/use-role";
import { CartProvider } from "@/hooks/use-cart";
import { AuthProvider } from "@/hooks/use-auth";
import { useSessionTimeout } from "@/hooks/use-session-timeout";
import { lazy, Suspense } from "react";

const NotFound = lazy(() => import("@/pages/not-found"));
const Home = lazy(() => import("@/pages/home"));
const Products = lazy(() => import("@/pages/products"));
const FarmerProfile = lazy(() => import("@/pages/farmer-profile"));
const Checkout = lazy(() => import("@/pages/checkout"));
const Dashboard = lazy(() => import("@/pages/dashboard"));
const CustomerDashboard = lazy(() => import("@/pages/customer-dashboard"));
const FarmerDashboard = lazy(() => import("@/pages/farmer-dashboard"));
const VendorDashboard = lazy(() => import("@/pages/vendor-dashboard"));
const Application = lazy(() => import("@/pages/application"));
const B2BOrdering = lazy(() => import("@/pages/b2b-ordering"));
const VendorPortal = lazy(() => import("@/pages/vendor-portal"));
const Operations = lazy(() => import("@/pages/operations"));
const AdminPanel = lazy(() => import("@/pages/admin-panel"));
const Login = lazy(() => import("@/pages/login"));
const Signup = lazy(() => import("@/pages/signup"));
const ForgotPassword = lazy(() => import("@/pages/forgot-password"));
const ResetPassword = lazy(() => import("@/pages/reset-password"));
const AddProduct = lazy(() => import("@/pages/add-product"));
const FarmerAnalytics = lazy(() => import("@/pages/farmer-analytics"));
const PaymentSuccess = lazy(() => import("@/pages/payment-success"));
const PaymentCancelled = lazy(() => import("@/pages/payment-cancelled"));
const About = lazy(() => import("@/pages/about"));
const Contact = lazy(() => import("@/pages/contact"));
const Terms = lazy(() => import("@/pages/terms"));
const Privacy = lazy(() => import("@/pages/privacy"));
const TrackOrder = lazy(() => import("@/pages/track-order"));

function Router() {
  const [location] = useLocation();
  
  // Debug: log current location
  console.log("Current route:", location);
  
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen text-farm-green">Loading...</div>}>
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
      <Route path="/payment/success" component={PaymentSuccess} />
      <Route path="/payment/cancelled" component={PaymentCancelled} />
      <Route path="/about" component={About} />
      <Route path="/contact" component={Contact} />
      <Route path="/terms" component={Terms} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/track-order" component={TrackOrder} />
      <Route path="/operations" component={Operations} />
      <Route path="/admin" component={AdminPanel} />
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/reset-password" component={ResetPassword} />
      <Route path="/" component={Home} />
      <Route component={NotFound} />
    </Switch>
    </Suspense>
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
