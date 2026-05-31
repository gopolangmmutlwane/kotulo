import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { AuthGuard } from "@/components/auth-guard";
import { Link, useLocation } from "wouter";
import { 
  Package, 
  TrendingUp,
  DollarSign,
  ShoppingCart,
  AlertCircle,
  CheckCircle2,
  Store
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import type { Product } from "@shared/schema";

export default function VendorDashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  // Check if user is approved
  const isPending = user?.approvalStatus === "pending";
  const isApproved = user?.approvalStatus === "approved";

  // Get vendor's products (vendors can have products from multiple farmers)
  const { data: allProducts = [] } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  // For now, show all products - in future, filter by vendor's farmer relationships
  const vendorProducts = allProducts;

  return (
    <AuthGuard requiredRole="vendor">
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          {isPending ? (
            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <AlertCircle className="w-8 h-8 text-secondary-foreground" />
                  <CardTitle>Account Pending Approval</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Your vendor account is pending admin approval. Complete your application to submit it for review.
                </p>
                <ul className="list-disc list-inside space-y-2 mb-4">
                  <li>Submit business registration and documents</li>
                  <li>Provide business description and address</li>
                  <li>Upload required licenses</li>
                </ul>
                <div className="flex space-x-2">
                  <Button 
                    onClick={() => setLocation("/application")}
                    className="bg-primary hover:bg-primary/90"
                  >
                    Complete Application
                  </Button>
                  <Button variant="outline" onClick={() => setLocation("/")}>
                    Return Home
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-4">
                  You'll receive an email notification once your account has been reviewed.
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Vendor dashboard content */}
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-card-foreground">Vendor Dashboard</h1>
                <p className="text-muted-foreground">Manage your products and track sales performance</p>
              </div>
              
              {/* Dashboard content will go here */}
              <Card>
                <CardHeader>
                  <CardTitle>Welcome to Your Vendor Dashboard</CardTitle>
                  <CardDescription>Your vendor management interface</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Vendor dashboard features coming soon...</p>
                </CardContent>
              </Card>
            </>
          )}
        </div>
        <Footer />
      </div>
    </AuthGuard>
  );
}
