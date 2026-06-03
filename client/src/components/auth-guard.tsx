import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: string;
  fallbackPath?: string;
}

export function AuthGuard({ children, requiredRole, fallbackPath = "/login" }: AuthGuardProps) {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Redirect unauthenticated users
    if (!isAuthenticated) {
      setLocation(fallbackPath);
      return;
    }

    // Redirect users without required role
    const allowedRoles = requiredRole ? requiredRole.split("|") : [];
    if (requiredRole && !allowedRoles.includes(user?.role || "")) {
      // For admin panel access, don't redirect admin users - let them access admin panel
      if (requiredRole === "admin" && user?.role === "admin") {
        // Admin user trying to access admin panel - allow access
        return;
      }
      
      // For other role-based access, redirect to appropriate dashboard
      const getDashboardRoute = (role: string) => {
        switch(role) {
          case "farmer": return "/farmer-dashboard";
          case "vendor": return "/vendor";
          case "admin": return "/admin";
          case "operations": return "/operations";
          default: return "/customer-dashboard";
        }
      };

      const dashboardRoute = getDashboardRoute(user?.role || "household");
      setLocation(dashboardRoute);
      return;
    }
  }, [isAuthenticated, user, requiredRole, setLocation, fallbackPath]);

  // Show loading or access denied state
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
          <p className="text-muted-foreground mb-6">Please log in to access this page.</p>
          <Button onClick={() => setLocation(fallbackPath)}>
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  const allowedRoles = requiredRole ? requiredRole.split("|") : [];
  if (requiredRole && !allowedRoles.includes(user?.role || "")) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
          <p className="text-muted-foreground mb-6">
            {requiredRole} dashboard access required.
          </p>
          <Button onClick={() => setLocation("/")}>
            Return Home
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
