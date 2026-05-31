import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Link, useLocation } from "wouter";
import { 
  ShoppingCart, 
  Package, 
  Clock, 
  MapPin,
  TrendingUp,
  Heart
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import type { Order } from "@shared/schema";

export default function CustomerDashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const { data: orders = [], isLoading: ordersLoading } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
  });

  const recentOrders = orders.slice(0, 5);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name}!</h1>
          <p className="text-muted-foreground">Manage your orders and shopping</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setLocation("/products")}>
            <CardContent className="p-6 text-center">
              <ShoppingCart className="w-8 h-8 text-farm-green mx-auto mb-2" />
              <h3 className="font-semibold">Shop Now</h3>
              <p className="text-sm text-muted-foreground">Browse products</p>
            </CardContent>
          </Card>
          
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setLocation("/products")}>
            <CardContent className="p-6 text-center">
              <Heart className="w-8 h-8 text-destructive mx-auto mb-2" />
              <h3 className="font-semibold">Favorites</h3>
              <p className="text-sm text-muted-foreground">Saved items</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <Package className="w-8 h-8 text-primary mx-auto mb-2" />
              <h3 className="font-semibold">{orders.length}</h3>
              <p className="text-sm text-muted-foreground">Total Orders</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <Clock className="w-8 h-8 text-farm-brown mx-auto mb-2" />
              <h3 className="font-semibold">60 min</h3>
              <p className="text-sm text-muted-foreground">Delivery SLA</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Orders */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Your latest purchases</CardDescription>
          </CardHeader>
          <CardContent>
            {ordersLoading ? (
              <div className="text-center py-8">Loading orders...</div>
            ) : recentOrders.length === 0 ? (
              <div className="text-center py-8">
                <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No orders yet</p>
                <Button onClick={() => setLocation("/products")} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  Start Shopping
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-semibold">Order #{order.id.slice(0, 8)}</p>
                      <p className="text-sm text-muted-foreground">{order.customerEmail}</p>
                      <p className="text-xs text-muted-foreground">{new Date(order.createdAt as any).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">R {parseFloat(order.total as any).toFixed(2)}</p>
                      <span className={`text-xs px-2 py-1 rounded ${
                        order.status === "delivered" ? "bg-primary/10 text-primary" :
                        order.status === "pending" ? "bg-secondary/50 text-secondary-foreground" :
                        "bg-accent/10 text-accent"
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Featured Products */}
        <Card>
          <CardHeader>
            <CardTitle>Continue Shopping</CardTitle>
            <CardDescription>Discover fresh produce</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button 
                variant="outline" 
                className="h-auto p-4 flex flex-col items-start"
                onClick={() => setLocation("/products/vegetables")}
              >
                <span className="font-semibold mb-1">Fresh Vegetables</span>
                <span className="text-sm text-muted-foreground">Browse vegetables</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-auto p-4 flex flex-col items-start"
                onClick={() => setLocation("/products/meat")}
              >
                <span className="font-semibold mb-1">Quality Meat</span>
                <span className="text-sm text-muted-foreground">Browse meat products</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-auto p-4 flex flex-col items-start"
                onClick={() => setLocation("/products/dairy")}
              >
                <span className="font-semibold mb-1">Fresh Dairy</span>
                <span className="text-sm text-muted-foreground">Browse dairy products</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
}

