import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Link, useLocation } from "wouter";
import { 
  Package, 
  TrendingUp,
  DollarSign,
  ShoppingCart,
  AlertCircle,
  CheckCircle2
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import type { Product, Farmer } from "@shared/schema";

export default function FarmerDashboard() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  // Authentication and role guard
  useEffect(() => {
    if (!isAuthenticated) {
      setLocation("/login");
      return;
    }
    
    if (user && user.role !== "farmer") {
      // Redirect non-farmers to appropriate dashboard
      if (user.role === "vendor") {
        setLocation("/vendor-dashboard");
      } else if (user.role === "admin") {
        setLocation("/admin");
      } else if (user.role === "operations") {
        setLocation("/operations");
      } else {
        setLocation("/customer-dashboard");
      }
      return;
    }
  }, [isAuthenticated, user, setLocation]);

  // Show loading state
  if (!isAuthenticated || (user && user.role !== "farmer")) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
          <p className="text-muted-foreground mb-6">Farmer dashboard access required.</p>
          <Button onClick={() => setLocation("/")}>
            Return Home
          </Button>
        </div>
      </div>
    );
  }

  // Check if user is approved
  const isPending = user?.approvalStatus === "pending";
  const isApproved = user?.approvalStatus === "approved";

  // Get farmer profile
  const { data: farmers = [] } = useQuery<Farmer[]>({
    queryKey: ["/api/farmers"],
  });
  
  const farmerProfile = farmers.find(f => f.userId === user?.id);

  // Get farmer's products
  const { data: products = [] } = useQuery<Product[]>({
    queryKey: farmerProfile ? [`/api/products?farmerId=${farmerProfile.id}`] : [],
    enabled: !!farmerProfile,
  });

  if (isPending) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <AlertCircle className="w-8 h-8 text-secondary-foreground" />
                <CardTitle>Account Pending Approval</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Your farmer account is pending admin approval. Complete your application to submit it for review.
              </p>
              <ul className="list-disc list-inside space-y-2 mb-4">
                <li>Submit business registration and documents</li>
                <li>Provide business description and address</li>
                <li>Upload required certifications</li>
              </ul>
              <div className="flex space-x-2">
                <Button 
                  onClick={() => setLocation("/application")}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
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
        </div>
        <Footer />
      </div>
    );
  }

  if (!isApproved) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Account Not Approved</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Your account has not been approved. Please contact support for assistance.
              </p>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Farmer Dashboard</h1>
              <p className="text-muted-foreground">Manage your farm and products</p>
            </div>
            <Badge className="bg-primary/10 text-primary">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Approved
            </Badge>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Products</p>
                  <p className="text-2xl font-bold">{products.length}</p>
                </div>
                <Package className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Products</p>
                  <p className="text-2xl font-bold">{products.filter(p => (p as any).status === "approved").length}</p>
                </div>
                <CheckCircle2 className="w-8 h-8 text-accent" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Featured</p>
                  <p className="text-2xl font-bold">{products.filter(p => p.featured).length}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-farm-brown" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Rating</p>
                  <p className="text-2xl font-bold">{farmerProfile?.rating || "0"}</p>
                </div>
                <DollarSign className="w-8 h-8 text-farm-gold" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setLocation("/vendor")}>
            <CardContent className="p-6 text-center">
              <Package className="w-8 h-8 text-farm-green mx-auto mb-2" />
              <h3 className="font-semibold">Manage Products</h3>
              <p className="text-sm text-muted-foreground">Add or edit products</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setLocation("/vendor")}>
            <CardContent className="p-6 text-center">
              <TrendingUp className="w-8 h-8 text-primary mx-auto mb-2" />
              <h3 className="font-semibold">View Analytics</h3>
              <p className="text-sm text-muted-foreground">Sales and performance</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setLocation("/b2b")}>
            <CardContent className="p-6 text-center">
              <ShoppingCart className="w-8 h-8 text-accent mx-auto mb-2" />
              <h3 className="font-semibold">Stock from Farmers</h3>
              <p className="text-sm text-muted-foreground">Purchase from other farmers</p>
            </CardContent>
          </Card>
        </div>

        {/* Products List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Your Products</CardTitle>
                <CardDescription>Manage your product listings</CardDescription>
              </div>
              <Button onClick={() => setLocation("/add-product")} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                Add Product
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {products.length === 0 ? (
              <div className="text-center py-8">
                <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No products yet</p>
                <Button onClick={() => setLocation("/add-product")} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  Add Your First Product
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {products.slice(0, 5).map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      {product.image && (
                        <img src={product.image} alt={product.name} className="w-16 h-16 object-cover rounded" />
                      )}
                      <div>
                        <p className="font-semibold">{product.name}</p>
                        <p className="text-sm text-muted-foreground">{product.category}</p>
                        <p className="text-xs text-muted-foreground">R {parseFloat(product.retailPrice as any).toFixed(2)}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {product.featured && <Badge>Featured</Badge>}
                      <Badge variant={
                        (product as any).status === "approved" ? "default" : 
                        (product as any).status === "rejected" ? "destructive" : "secondary"
                      }>
                        {(product as any).status === "approved" ? "Active" : 
                          (product as any).status === "rejected" ? "Rejected" : "Pending Approval"}
                      </Badge>
                    </div>
                  </div>
                ))}
                {products.length > 5 && (
                  <Button variant="outline" className="w-full" onClick={() => setLocation("/vendor")}>
                    View All Products
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
}

