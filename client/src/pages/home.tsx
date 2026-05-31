import { useQuery } from "@tanstack/react-query";
import { Carrot, Beef, Milk, ShoppingBag, UserPlus, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ProductCard } from "@/components/product-card";
import { FarmerCard } from "@/components/farmer-card";
import { CategoryCard } from "@/components/category-card";
import { CartProvider } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import { Product, Farmer } from "@shared/schema";

function HomeContent() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { data: featuredProducts = [], isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products", "featured"]
  });

  const { data: farmers = [], isLoading: farmersLoading } = useQuery<Farmer[]>({
    queryKey: ["/api/farmers"]
  });

  // Get role-specific dashboard route
  const getDashboardRoute = (role: string) => {
    switch(role) {
      case "farmer": return "/farmer-dashboard";
      case "vendor": return "/vendor-dashboard";
      case "admin": return "/admin";
      case "operations": return "/operations";
      default: return "/customer-dashboard";
    }
  };

  // Handle dashboard button click
  const handleDashboardClick = () => {
    if (!isAuthenticated) {
      setLocation("/login");
    } else {
      const dashboardRoute = getDashboardRoute(user?.role || "household");
      setLocation(dashboardRoute);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section - Admin vs Customer */}
      <section className="bg-gradient-to-r from-primary to-accent text-primary-foreground py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                {user?.role === "admin" ? (
                  <>
                    <h1 className="text-5xl md:text-6xl font-bold leading-tight tracking-tight">
                      FarmHarvest Admin Dashboard
                    </h1>
                    <p className="text-xl leading-relaxed opacity-95 max-w-lg">
                      Manage your marketplace, approve vendors, monitor performance, and ensure smooth operations across the platform.
                    </p>
                  </>
                ) : (
                  <>
                    <h1 className="text-5xl md:text-6xl font-bold leading-tight tracking-tight">
                      Fresh From Farm to Your Table
                    </h1>
                    <p className="text-xl leading-relaxed opacity-95 max-w-lg">
                      Connect directly with South African farmers for the freshest vegetables, quality meat, and farm-fresh dairy products.
                    </p>
                  </>
                )}
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                {user?.role === "admin" ? (
                  <>
                    <Button 
                      onClick={() => setLocation("/admin")}
                      className="bg-secondary text-secondary-foreground hover:bg-secondary/90 hover:scale-105 hover:shadow-xl border-2 border-secondary/20 px-8 py-4 text-lg font-semibold shadow-lg transition-all duration-300" 
                      data-testid="button-admin-dashboard"
                    >
                      <UserPlus className="mr-2 h-5 w-5" />
                      Admin Panel
                    </Button>
                    <Button 
                      onClick={() => setLocation("/operations")}
                      className="bg-primary/20 backdrop-blur-md hover:bg-primary/30 hover:scale-105 hover:shadow-xl border-2 border-primary/50 text-primary-foreground px-8 py-4 text-lg font-semibold transition-all duration-300" 
                      data-testid="button-operations"
                    >
                      <Download className="mr-2 h-5 w-5" />
                      Operations
                    </Button>
                  </>
                ) : (
                  <>
                    <Button 
                      onClick={() => setLocation("/products")}
                      className="bg-secondary text-secondary-foreground hover:bg-secondary/90 hover:scale-105 hover:shadow-xl border-2 border-secondary/20 px-8 py-4 text-lg font-semibold shadow-lg transition-all duration-300" 
                      data-testid="button-start-shopping"
                    >
                      <ShoppingBag className="mr-2 h-5 w-5" />
                      Start Shopping
                    </Button>
                    <Button 
                      onClick={handleDashboardClick}
                      className="bg-primary/20 backdrop-blur-md hover:bg-primary/30 hover:scale-105 hover:shadow-xl border-2 border-primary/50 text-primary-foreground px-8 py-4 text-lg font-semibold transition-all duration-300" 
                      data-testid="button-marketplace-dashboard"
                    >
                      <UserPlus className="mr-2 h-5 w-5" />
                      Marketplace Dashboard
                    </Button>
                  </>
                )}
              </div>
            </div>
            <div className="relative ml-8">
              <div className="absolute inset-0 bg-gradient-to-r from-secondary/20 to-accent/20 rounded-2xl transform rotate-3"></div>
              <img 
                src={user?.role === "admin" 
                  ? "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
                  : "https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
                } 
                alt={user?.role === "admin" ? "Admin dashboard analytics" : "Fresh produce at South African market"} 
                className="relative rounded-2xl shadow-2xl w-full h-auto transform hover:scale-105 transition-transform duration-300"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section - Admin vs Customer */}
      <section className="py-16 bg-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            {user?.role === "admin" ? (
              <>
                <h2 className="text-4xl font-bold mb-4 text-card-foreground">Admin Control Center</h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Complete oversight and management tools for your marketplace operations
                </p>
              </>
            ) : (
              <>
                <h2 className="text-4xl font-bold mb-4 text-card-foreground">Comprehensive Marketplace Features</h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Everything you need for fresh farm-to-table shopping and business operations
                </p>
              </>
            )}
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {user?.role === "admin" ? (
              <>
                <CategoryCard
                  title="User Management"
                  description="Approve vendors, farmers, and monitor all user activity"
                  icon={<UserPlus className="text-white text-2xl" />}
                  productCount={0}
                  href="/admin"
                  gradientClass="bg-gradient-to-br from-primary/10 to-accent/10 backdrop-blur-md"
                  iconBgClass="bg-primary backdrop-blur-md"
                  textColorClass="text-primary backdrop-blur-md"
                />
                
                <CategoryCard
                  title="Order Monitoring"
                  description="Track all orders, revenue, and platform performance"
                  icon={<Download className="text-white text-2xl" />}
                  productCount={0}
                  href="/admin"
                  gradientClass="bg-gradient-to-br from-destructive/10 to-destructive/5 backdrop-blur-md"
                  iconBgClass="bg-destructive backdrop-blur-md"
                  textColorClass="text-destructive backdrop-blur-md"
                />
                
                <CategoryCard
                  title="System Health"
                  description="Monitor platform performance and operational metrics"
                  icon={<ShoppingBag className="text-white text-2xl" />}
                  productCount={0}
                  href="/operations"
                  gradientClass="bg-gradient-to-br from-secondary/10 to-farm-gold/10 backdrop-blur-md"
                  iconBgClass="bg-secondary backdrop-blur-md"
                  textColorClass="text-secondary backdrop-blur-md"
                />
              </>
            ) : (
              <>
                <CategoryCard
                  title="Fresh Vegetables"
                  description="Seasonal vegetables straight from the farm"
                  icon={<Carrot className="text-white text-2xl" />}
                  productCount={150}
                  href="/products/vegetables"
                  gradientClass="bg-gradient-to-br from-primary/10 to-accent/10 backdrop-blur-md"
                  iconBgClass="bg-primary backdrop-blur-md"
                  textColorClass="text-primary backdrop-blur-md"
                />
                
                <CategoryCard
                  title="Quality Meat"
                  description="Premium cuts from local farms"
                  icon={<Beef className="text-white text-2xl" />}
                  productCount={80}
                  href="/products/meat"
                  gradientClass="bg-gradient-to-br from-destructive/10 to-destructive/5 backdrop-blur-md"
                  iconBgClass="bg-destructive backdrop-blur-md"
                  textColorClass="text-destructive backdrop-blur-md"
                />
                
                <CategoryCard
                  title="Fresh Dairy"
                  description="Farm-fresh milk, cheese, and yogurt"
                  icon={<Milk className="text-white text-2xl" />}
                  productCount={45}
                  href="/products/dairy"
                  gradientClass="bg-gradient-to-br from-secondary/10 to-farm-gold/10 backdrop-blur-md"
                  iconBgClass="bg-secondary backdrop-blur-md"
                  textColorClass="text-secondary backdrop-blur-md"
                />
              </>
            )}
          </div>
          
          {/* Marketplace Features Banner */}
          <div className="mt-16 bg-gradient-to-r from-secondary/20 to-farm-gold/20 border border-border rounded-2xl p-8 shadow-lg">
            <div className="text-center">
              <h3 className="text-3xl font-bold mb-4 text-card-foreground">Multi-Role Marketplace Platform</h3>
              <p className="text-lg mb-8 text-muted-foreground max-w-3xl mx-auto">
                Experience our comprehensive farm-to-door platform with advanced B2B ordering, vendor management, 
                real-time logistics, and 60-minute delivery SLA.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                <div className="text-card-foreground">
                  <div className="text-4xl font-bold text-primary mb-2">60min</div>
                  <div className="text-sm text-muted-foreground">Delivery SLA</div>
                </div>
                <div className="text-card-foreground">
                  <div className="text-4xl font-bold text-accent mb-2">B2B</div>
                  <div className="text-sm text-muted-foreground">Bulk Ordering</div>
                </div>
                <div className="text-card-foreground">
                  <div className="text-4xl font-bold text-secondary mb-2">Hubs</div>
                  <div className="text-sm text-muted-foreground">Micro-Fulfillment</div>
                </div>
                <div className="text-card-foreground">
                  <div className="text-4xl font-bold text-farm-gold mb-2">5</div>
                  <div className="text-sm text-muted-foreground">User Types</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section - Hide for Admin */}
      {user?.role !== "admin" && (
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-12">
              <div>
                <h2 className="text-4xl font-bold text-card-foreground mb-2">Featured Products</h2>
                <p className="text-muted-foreground">Hand-picked fresh items from our trusted farmers</p>
              </div>
              <Link href="/products">
                <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground px-6 py-3" data-testid="button-view-all-products">
                  View All →
                </Button>
              </Link>
            </div>
            
            {productsLoading ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="bg-card rounded-xl shadow-sm animate-pulse border border-border">
                    <div className="w-full h-48 bg-muted rounded-t-xl"></div>
                    <div className="p-4">
                      <div className="h-4 bg-muted rounded mb-2"></div>
                      <div className="h-3 bg-muted rounded mb-2"></div>
                      <div className="h-6 bg-muted rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {featuredProducts.slice(0, 4).map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Featured Farmers Section - Hide for Admin */}
      {user?.role !== "admin" && (
        <section className="py-16 bg-card">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4 text-card-foreground">Meet Our Farmers</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Connect directly with local South African farmers who are passionate about bringing you the freshest, highest quality produce.
              </p>
            </div>
            
            {farmersLoading ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="bg-muted/50 rounded-xl p-6 animate-pulse border border-border">
                    <div className="w-20 h-20 bg-muted rounded-full mx-auto mb-4"></div>
                    <div className="h-4 bg-muted rounded mb-2"></div>
                    <div className="h-3 bg-muted rounded mb-2"></div>
                    <div className="h-8 bg-muted rounded"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {farmers.slice(0, 3).map((farmer) => (
                  <FarmerCard key={farmer.id} farmer={farmer} />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* App Promotion Section - Admin vs Customer */}
      <section className="py-16 bg-gradient-to-r from-primary to-accent text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="space-y-4">
                {user?.role === "admin" ? (
                  <>
                    <h2 className="text-4xl font-bold">Admin Mobile Management</h2>
                    <p className="text-xl leading-relaxed opacity-95 max-w-lg">
                      Manage your marketplace on the go with our admin dashboard. Monitor operations, approve applications, and track performance from anywhere.
                    </p>
                  </>
                ) : (
                  <>
                    <h2 className="text-4xl font-bold">Download Our Mobile App</h2>
                    <p className="text-xl leading-relaxed opacity-95 max-w-lg">
                      Get the Kotulo app for easier shopping, exclusive deals, and direct farmer connections. Install as a Progressive Web App for the best experience.
                    </p>
                  </>
                )}
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                {user?.role === "admin" ? (
                  <>
                    <Button className="bg-secondary text-secondary-foreground hover:bg-secondary/90 border-2 border-secondary/20 px-6 py-3 font-semibold shadow-lg hover:shadow-xl transition-all duration-300" data-testid="button-admin-panel">
                      <UserPlus className="mr-2 h-5 w-5" />
                      Admin Panel
                    </Button>
                    <Button variant="outline" className="border-2 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground hover:text-primary px-6 py-3 font-semibold backdrop-blur-sm transition-all duration-300" data-testid="button-operations-panel">
                      <Download className="mr-2 h-5 w-5" />
                      Operations
                    </Button>
                  </>
                ) : (
                  <>
                    <Button className="bg-secondary text-secondary-foreground hover:bg-secondary/90 border-2 border-secondary/20 px-6 py-3 font-semibold shadow-lg hover:shadow-xl transition-all duration-300" data-testid="button-install-app">
                      <Download className="mr-2 h-5 w-5" />
                      Install App
                    </Button>
                    <Button variant="outline" className="border-2 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground hover:text-primary px-6 py-3 font-semibold backdrop-blur-sm transition-all duration-300" data-testid="button-app-store">
                      App Store
                    </Button>
                  </>
                )}
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-secondary/20 to-accent/20 rounded-2xl transform -rotate-3"></div>
              <img 
                src={user?.role === "admin" 
                  ? "https://images.unsplash.com/photo-1559028006-8a0768b6cdb5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
                  : "https://images.unsplash.com/photo-1559028006-8a0768b6cdb5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
                } 
                alt={user?.role === "admin" ? "Admin mobile dashboard" : "Mobile app interface"} 
                className="relative rounded-2xl shadow-2xl w-full h-auto transform hover:scale-105 transition-transform duration-300"
              />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default function Home() {
  return (
    <CartProvider>
      <HomeContent />
    </CartProvider>
  );
}
