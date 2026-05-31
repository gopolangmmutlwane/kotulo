import { useEffect } from "react";
import { useRole } from "@/hooks/use-role";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Link, useLocation } from "wouter";
import { 
  ShoppingCart, 
  Building2, 
  Truck, 
  Users, 
  BarChart3, 
  Package, 
  Clock, 
  MapPin,
  Settings,
  Store
} from "lucide-react";

export default function Dashboard() {
  const { currentRole, setRole } = useRole();
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect unauthenticated users to login
  useEffect(() => {
    if (!isAuthenticated) {
      setLocation("/login");
      return;
    }
    
    // Redirect authenticated users to home page
    if (user) {
      setLocation("/");
    }
  }, [isAuthenticated, user, setLocation]);

  // Show loading or redirect state
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
          <p className="text-muted-foreground mb-6">Please log in to access the dashboard.</p>
          <Button onClick={() => setLocation("/login")}>
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  // Show role selection for authenticated users (as a fallback)
  if (user) {
    return null; // Will redirect to appropriate dashboard
  }

  const roleCards = [
    {
      role: "household",
      title: "Household Shopper",
      description: "Browse and order fresh produce for your family",
      icon: ShoppingCart,
      color: "bg-primary",
      features: ["Fresh produce catalog", "60-minute delivery", "Cart & checkout", "Order tracking"]
    },
    {
      role: "b2b",
      title: "B2B Buyer",
      description: "Bulk ordering for restaurants and supermarkets",
      icon: Building2,
      color: "bg-accent",
      features: ["Bulk ordering", "Purchase orders", "Credit terms", "Recurring orders"]
    },
    {
      role: "vendor",
      title: "Vendor/Farmer",
      description: "Manage your farm and sell to the marketplace",
      icon: Store,
      color: "bg-farm-green",
      features: ["Product management", "Inventory tracking", "Commission rates", "Sales analytics"]
    },
    {
      role: "operations",
      title: "Operations",
      description: "Manage hubs, deliveries, and logistics",
      icon: Truck,
      color: "bg-farm-brown",
      features: ["Hub management", "Delivery tracking", "Route optimization", "SLA monitoring"]
    },
    {
      role: "admin",
      title: "Admin",
      description: "Platform administration and analytics",
      icon: Users,
      color: "bg-destructive",
      features: ["User management", "Platform analytics", "Service areas", "System configuration"]
    }
  ];

  const currentRoleCard = roleCards.find(card => card.role === currentRole);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-card-foreground">Kotulo Marketplace</h1>
          <p className="text-muted-foreground">
            Comprehensive farm-to-door platform for South Africa
          </p>
        </div>

        {/* Current Role Card */}
        {currentRoleCard && (
          <Card className="mb-8 border-2 border-primary/20">
            <CardHeader>
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 ${currentRoleCard.color} rounded-lg flex items-center justify-center`}>
                  <currentRoleCard.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <span>{currentRoleCard.title}</span>
                    <Badge className="bg-primary/20 text-primary">Current Role</Badge>
                  </CardTitle>
                  <CardDescription>{currentRoleCard.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                {currentRoleCard.features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
              <div className="flex space-x-2">
                <Button asChild>
                  <Link href={currentRole === "household" ? "/products" : `/${currentRole}`}>
                    Open {currentRoleCard.title}
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Role Selection */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Switch User Role</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {roleCards.map((card) => (
              <Card 
                key={card.role} 
                className={`cursor-pointer transition-all ${
                  currentRole === card.role 
                    ? 'ring-2 ring-primary bg-primary/10' 
                    : 'hover:shadow-lg'
                }`}
                onClick={() => setRole(card.role as any)}
                data-testid={`role-card-${card.role}`}
              >
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 ${card.color} rounded-lg flex items-center justify-center`}>
                      <card.icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{card.title}</CardTitle>
                      <CardDescription>{card.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {card.features.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-2 text-sm">
                        <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full"></div>
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Platform Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6 text-center">
              <Clock className="w-8 h-8 text-primary mx-auto mb-2" />
              <h3 className="font-semibold mb-1">60-Min Delivery</h3>
              <p className="text-sm text-muted-foreground">Fast local delivery SLA</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <MapPin className="w-8 h-8 text-accent mx-auto mb-2" />
              <h3 className="font-semibold mb-1">Service Areas</h3>
              <p className="text-sm text-muted-foreground">Geo-fenced delivery zones</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <Package className="w-8 h-8 text-secondary mx-auto mb-2" />
              <h3 className="font-semibold mb-1">Micro Hubs</h3>
              <p className="text-sm text-muted-foreground">Local fulfillment centers</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <BarChart3 className="w-8 h-8 text-farm-gold mx-auto mb-2" />
              <h3 className="font-semibold mb-1">Analytics</h3>
              <p className="text-sm text-muted-foreground">Real-time insights</p>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
}