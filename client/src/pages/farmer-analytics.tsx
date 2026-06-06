import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { TrendingUp, Package, ShoppingCart, DollarSign, ArrowLeft } from "lucide-react";

export default function FarmerAnalytics() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const { data: farmers = [] } = useQuery<any[]>({ queryKey: ["/api/farmers"] });
  const farmerProfile = farmers.find((f: any) => f.userId === user?.id);

  const { data: products = [] } = useQuery<any[]>({
    queryKey: farmerProfile ? [`/api/products?farmerId=${farmerProfile.id}`] : [],
    enabled: !!farmerProfile,
  });

  const { data: allOrders = [] } = useQuery<any[]>({ queryKey: ["/api/orders"] });

  // Filter orders that contain this farmer's products
  const myProductIds = products.map((p: any) => p.id);
  const myOrders = allOrders.filter((order: any) =>
    (order.items || []).some((item: any) => myProductIds.includes(item.productId))
  );

  // Calculate total revenue from my products
  const totalRevenue = myOrders.reduce((sum: number, order: any) => {
    const myItems = (order.items || []).filter((item: any) => myProductIds.includes(item.productId));
    const orderRevenue = myItems.reduce((s: number, item: any) => s + (parseFloat(item.price) * item.quantity), 0);
    return sum + orderRevenue;
  }, 0);

  // Best selling products
  const productSales: Record<string, { name: string; quantity: number; revenue: number }> = {};
  myOrders.forEach((order: any) => {
    (order.items || []).forEach((item: any) => {
      if (!myProductIds.includes(item.productId)) return;
      if (!productSales[item.productId]) {
        productSales[item.productId] = { name: item.name, quantity: 0, revenue: 0 };
      }
      productSales[item.productId].quantity += item.quantity;
      productSales[item.productId].revenue += parseFloat(item.price) * item.quantity;
    });
  });
  const topProducts = Object.values(productSales).sort((a, b) => b.revenue - a.revenue);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => setLocation("/farmer-dashboard")}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Sales Analytics</h1>
            <p className="text-muted-foreground">Your farm's performance overview</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold">R{totalRevenue.toFixed(2)}</p>
                </div>
                <DollarSign className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Orders</p>
                  <p className="text-2xl font-bold">{myOrders.length}</p>
                </div>
                <ShoppingCart className="w-8 h-8 text-accent" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Products</p>
                  <p className="text-2xl font-bold">{products.filter((p: any) => p.status === "approved").length}</p>
                </div>
                <Package className="w-8 h-8 text-farm-green" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Order Value</p>
                  <p className="text-2xl font-bold">R{myOrders.length > 0 ? (totalRevenue / myOrders.length).toFixed(2) : "0.00"}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-farm-gold" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Products */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Best Selling Products</CardTitle>
            <CardDescription>Your top performing products by revenue</CardDescription>
          </CardHeader>
          <CardContent>
            {topProducts.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No sales data yet</p>
            ) : (
              <div className="space-y-4">
                {topProducts.map((product, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-muted-foreground">#{index + 1}</span>
                      <div>
                        <p className="font-semibold">{product.name}</p>
                        <p className="text-sm text-muted-foreground">{product.quantity} units sold</p>
                      </div>
                    </div>
                    <p className="font-bold text-primary">R{product.revenue.toFixed(2)}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Orders containing your products</CardDescription>
          </CardHeader>
          <CardContent>
            {myOrders.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No orders yet</p>
            ) : (
              <div className="space-y-3">
                {myOrders.slice(0, 10).map((order: any) => (
                  <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-semibold">{order.customerName}</p>
                      <p className="text-sm text-muted-foreground">
                        {(order.items || []).filter((i: any) => myProductIds.includes(i.productId)).map((i: any) => `${i.name} ×${i.quantity}`).join(", ")}
                      </p>
                      <p className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleDateString("en-ZA")}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary">R{order.total}</p>
                      <span className="text-xs bg-secondary/50 px-2 py-0.5 rounded">{order.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
}