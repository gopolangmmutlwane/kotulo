import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { AuthGuard } from "@/components/auth-guard";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Product, Order, Farmer } from "@shared/schema";
import { 
  Store, 
  Package, 
  TrendingUp, 
  DollarSign, 
  Truck, 
  Star,
  Plus,
  Eye,
  Edit,
  BarChart3,
  Trash2
} from "lucide-react";

export default function VendorPortal() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: allProducts = [], isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { data: orders = [], isLoading: ordersLoading } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
  });

  const { data: farmers = [] } = useQuery<Farmer[]>({
    queryKey: ["/api/farmers"],
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (productId: string) => {
      const res = await apiRequest("DELETE", `/api/products/${productId}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({ title: "Product Deleted", description: "Product removed successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to delete product", variant: "destructive" });
    },
  });

  const totalRevenue = orders.reduce((sum, o) => sum + parseFloat((o.total as any) || '0'), 0);
  const activeProducts = allProducts.filter(p => p.isActive).length;

  return (
    <AuthGuard requiredRole="vendor">
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <Store className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Vendor Portal</h1>
              <p className="text-muted-foreground">{user?.businessName || user?.name}</p>
            </div>
          </div>
          <Badge className="bg-primary text-primary-foreground">Vendor</Badge>
        </div>

        {/* Dashboard Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <DollarSign className="w-8 h-8 text-primary mx-auto mb-2" />
              <h3 className="font-semibold mb-1">Total Revenue</h3>
              <p className="text-2xl font-bold text-primary">R{totalRevenue.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</p>
              <p className="text-sm text-muted-foreground">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <Package className="w-8 h-8 text-accent mx-auto mb-2" />
              <h3 className="font-semibold mb-1">Active Products</h3>
              <p className="text-2xl font-bold text-accent">{activeProducts}</p>
              <p className="text-sm text-muted-foreground">{allProducts.length} total</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <TrendingUp className="w-8 h-8 text-secondary mx-auto mb-2" />
              <h3 className="font-semibold mb-1">Total Orders</h3>
              <p className="text-2xl font-bold text-secondary">{orders.length}</p>
              <p className="text-sm text-muted-foreground">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <Star className="w-8 h-8 text-secondary-foreground mx-auto mb-2" />
              <h3 className="font-semibold mb-1">Farmers</h3>
              <p className="text-2xl font-bold text-secondary-foreground">{farmers.length}</p>
              <p className="text-sm text-muted-foreground">Available suppliers</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="products" className="space-y-8">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="products" data-testid="tab-products">Products</TabsTrigger>
            <TabsTrigger value="inventory" data-testid="tab-inventory">Inventory</TabsTrigger>
            <TabsTrigger value="orders" data-testid="tab-orders">Orders</TabsTrigger>
            <TabsTrigger value="analytics" data-testid="tab-analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings" data-testid="tab-settings">Settings</TabsTrigger>
          </TabsList>

          {/* Product Management */}
          <TabsContent value="products" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Product Catalog</h2>
              <Button onClick={() => setLocation("/add-product")} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Button>
            </div>

            {productsLoading ? (
              <p className="text-muted-foreground text-center py-8">Loading products...</p>
            ) : allProducts.length === 0 ? (
              <Card><CardContent className="p-8 text-center">
                <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No products listed yet</p>
                <Button onClick={() => setLocation("/add-product")} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Plus className="w-4 h-4 mr-2" />Add First Product
                </Button>
              </CardContent></Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {allProducts.map(product => {
                  const farmer = farmers.find(f => f.id === product.farmerId);
                  return (
                    <Card key={product.id}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">{product.name}</CardTitle>
                            <CardDescription>{farmer?.name || 'Unknown Farmer'} · {product.category}</CardDescription>
                          </div>
                          <Badge variant={product.isActive ? "default" : "secondary"}>
                            {product.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {product.image && (
                            <img src={product.image} alt={product.name} className="w-full h-32 object-cover rounded" />
                          )}
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <span className="text-muted-foreground">Retail:</span>
                              <p className="font-semibold">R{parseFloat(product.retailPrice as any).toFixed(2)}/{product.unit}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Wholesale:</span>
                              <p className="font-semibold">R{parseFloat(product.wholesalePrice as any || product.retailPrice as any).toFixed(2)}/{product.unit}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Min Order:</span>
                              <p className="font-semibold">{product.minOrderQty} {product.unit}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Organic:</span>
                              <p className="font-semibold">{product.organic ? '✅ Yes' : '❌ No'}</p>
                            </div>
                          </div>
                          <div className="flex space-x-2 pt-2">
                            <Button size="sm" variant="outline" onClick={() => setLocation(`/farmers/${product.farmerId}`)}>
                              <Eye className="w-4 h-4 mr-1" />View
                            </Button>
                            <Button
                              size="sm" variant="destructive"
                              onClick={() => { if (confirm(`Delete ${product.name}?`)) deleteProductMutation.mutate(product.id); }}
                              disabled={deleteProductMutation.isPending}
                            >
                              <Trash2 className="w-4 h-4 mr-1" />Delete
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* Inventory - show product list with shelf life */}
          <TabsContent value="inventory" className="space-y-6">
            <h2 className="text-2xl font-bold">Inventory Overview</h2>
            {allProducts.length === 0 ? (
              <Card><CardContent className="p-8 text-center">
                <p className="text-muted-foreground">No inventory yet. Add products first.</p>
              </CardContent></Card>
            ) : (
              <div className="space-y-4">
                {allProducts.map(product => (
                  <Card key={product.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Package className="w-5 h-5" />
                        <span>{product.name}</span>
                      </CardTitle>
                      <CardDescription>{product.category} · Min order: {product.minOrderQty} {product.unit}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Retail Price:</span>
                          <p className="font-semibold">R{parseFloat(product.retailPrice as any).toFixed(2)}/{product.unit}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Shelf Life:</span>
                          <p className="font-semibold">{product.shelfLifeDays ? `${product.shelfLifeDays} days` : 'N/A'}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Temperature:</span>
                          <p className="font-semibold">{product.temperatureRange || 'Ambient'}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Status:</span>
                          <Badge variant={product.isActive ? "default" : "secondary"}>{product.isActive ? 'Active' : 'Inactive'}</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Order Management */}
          <TabsContent value="orders" className="space-y-6">
            <h2 className="text-2xl font-bold">Orders</h2>
            {ordersLoading ? (
              <p className="text-muted-foreground text-center py-8">Loading orders...</p>
            ) : orders.length === 0 ? (
              <Card><CardContent className="p-8 text-center">
                <p className="text-muted-foreground">No orders yet.</p>
              </CardContent></Card>
            ) : (
              <div className="space-y-4">
                {orders.map(order => (
                  <Card key={order.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>Order #{order.id.slice(0, 8).toUpperCase()}</CardTitle>
                          <CardDescription>{order.customerName} · {order.customerEmail}</CardDescription>
                        </div>
                        <Badge variant={order.status === 'delivered' ? 'default' : order.status === 'pending' ? 'secondary' : 'outline'}>
                          {order.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Total:</span>
                          <p className="font-semibold text-primary">R{parseFloat(order.total as any).toFixed(2)}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Items:</span>
                          <p className="font-semibold">{Array.isArray(order.items) ? (order.items as any[]).length : 0}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Placed:</span>
                          <p className="font-semibold">{order.createdAt ? new Date(order.createdAt as any).toLocaleDateString() : 'N/A'}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Address:</span>
                          <p className="font-semibold text-xs">{order.deliveryAddress?.slice(0, 30)}...</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Analytics */}
          <TabsContent value="analytics" className="space-y-6">
            <h2 className="text-2xl font-bold">Sales Analytics</h2>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5" />
                  <span>Performance Overview</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-primary">R{totalRevenue.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</p>
                    <p className="text-muted-foreground">Total Revenue</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-accent">{orders.length}</p>
                    <p className="text-muted-foreground">Total Orders</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-secondary">
                      R{orders.length > 0 ? (totalRevenue / orders.length).toFixed(2) : '0.00'}
                    </p>
                    <p className="text-muted-foreground">Avg Order Value</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings */}
          <TabsContent value="settings" className="space-y-6">
            <h2 className="text-2xl font-bold">Account Settings</h2>
            <Card>
              <CardHeader>
                <CardTitle>Profile</CardTitle>
                <CardDescription>Your vendor account information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Name:</span>
                    <p className="font-semibold">{user?.name}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Email:</span>
                    <p className="font-semibold">{user?.email}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Business:</span>
                    <p className="font-semibold">{user?.businessName || 'Not set'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Approval Status:</span>
                    <Badge variant={user?.approvalStatus === 'approved' ? 'default' : 'secondary'}>
                      {user?.approvalStatus}
                    </Badge>
                  </div>
                </div>
                <Button onClick={() => setLocation('/application')} variant="outline">
                  Update Application
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
    </div>
    </AuthGuard>
  );
}