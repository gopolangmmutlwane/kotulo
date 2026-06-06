import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ProductCard } from "@/components/product-card";
import type { Product, Farmer, Order } from "@shared/schema";
import { 
  Building2, 
  FileText, 
  Calendar, 
  CreditCard, 
  Truck, 
  Package,
  TrendingUp,
  Clock,
  DollarSign
} from "lucide-react";

export default function B2BOrdering() {
  const [orderType, setOrderType] = useState("one_time");
  const { user } = useAuth();
  const isVendor = user?.role === "vendor";
  const isB2B = user?.role === "b2b";
  const isFarmer = user?.role === "farmer";
  const isPending = user?.approvalStatus === "pending";

  // Get all products (for vendors to stock from farmers)
  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  // Get farmers (for vendor view)
  const { data: farmers = [] } = useQuery<Farmer[]>({
    queryKey: ["/api/farmers"],
  });

  // Get orders for B2B/vendor purchase history
  const { data: orders = [] } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
  });

  // Filter products by farmer for vendor view - only show bulk or both
  const farmerProducts = products.filter(p => 
    (p as any).listingType === "bulk" || (p as any).listingType === "both" || !(p as any).listingType
  );

  const totalSpend = orders.reduce((sum, o) => sum + parseFloat((o.total as any) || "0"), 0);

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground mb-4">Please log in to access this page</p>
              <Button onClick={() => window.location.href = "/login"}>Login</Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  if (!isVendor && !isB2B && !isFarmer) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground mb-4">This page is only available for B2B buyers and vendors</p>
              <Button onClick={() => window.location.href = "/dashboard"}>Go to Dashboard</Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  if (isPending) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <Building2 className="w-8 h-8 text-secondary-foreground" />
                <CardTitle>Account Pending Approval</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Your account is pending admin approval. Complete your application to get access to bulk ordering and wholesale pricing.
              </p>
              <ul className="list-disc list-inside space-y-2 mb-4">
                <li>Submit business registration documents</li>
                <li>Provide business description and address</li>
                <li>Set up payment terms and credit limit</li>
              </ul>
              <div className="flex space-x-2">
                <Button onClick={() => window.location.href = "/application"} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  Complete Application
                </Button>
                <Button variant="outline" onClick={() => window.location.href = "/"}>
                  Return Home
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                You'll be notified once your account has been reviewed and approved.
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
          <h1 className="text-3xl font-bold mb-2">
            {isVendor || isFarmer? "Stock from Farmers" : "B2B Ordering Portal"}
          </h1>
          <p className="text-muted-foreground">
            {isVendor 
              ? "Browse and purchase products from farmers to stock your inventory"
              : "Bulk ordering for restaurants and supermarkets"}
          </p>
        </div>

        <Tabs defaultValue="catalog" className="space-y-8">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="catalog" data-testid="tab-catalog">
              {isVendor ? "Farmer Products" : "Product Catalog"}
            </TabsTrigger>
            <TabsTrigger value="orders" data-testid="tab-orders">Purchase Orders</TabsTrigger>
            <TabsTrigger value="recurring" data-testid="tab-recurring">Recurring Orders</TabsTrigger>
            <TabsTrigger value="invoices" data-testid="tab-invoices">Invoices</TabsTrigger>
          </TabsList>

          {/* Product Catalog / Farmer Products */}
          <TabsContent value="catalog" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">
                {isVendor ? "Available Products from Farmers" : "Bulk Product Catalog"}
              </h2>
              <Button data-testid="button-create-order">Create Purchase Order</Button>
            </div>

            {isVendor ? (
              // Vendor view: Show products from all farmers
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {farmerProducts.map((product) => {
                    const farmer = farmers.find(f => f.id === product.farmerId);
                    return (
                      <Card key={product.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-lg">{product.name}</CardTitle>
                              <CardDescription>
                                From: {farmer?.name || "Unknown Farmer"}
                              </CardDescription>
                            </div>
                            <Badge variant="secondary">Wholesale</Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-muted-foreground">Wholesale Price:</span>
                                <p className="font-semibold text-primary">
                                  R {parseFloat(product.wholesalePrice as any || product.retailPrice as any).toFixed(2)}/{product.unit}
                                </p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Retail Price:</span>
                                <p className="font-semibold line-through">
                                  R {parseFloat(product.retailPrice as any).toFixed(2)}/{product.unit}
                                </p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Min Order:</span>
                                <p className="font-semibold">{product.minOrderQty} {product.unit}</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Category:</span>
                                <p className="font-semibold capitalize">{product.category}</p>
                              </div>
                            </div>
                            {product.image && (
                              <img 
                                src={product.image} 
                                alt={product.name}
                                className="w-full h-32 object-cover rounded"
                              />
                            )}
                            <div className="flex space-x-2">
                              <Input 
                                type="number" 
                                placeholder={`Qty (${product.unit})`} 
                                min={product.minOrderQty || undefined}
                                data-testid={`input-quantity-${product.id}`}
                              />
                              <Button 
                                size="sm" 
                                className="bg-primary hover:bg-primary/90 text-primary-foreground"
                                data-testid={`button-add-${product.id}`}
                              >
                                Add to Order
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
                {farmerProducts.length === 0 && (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <p className="text-muted-foreground">No products available from farmers at the moment.</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              // B2B view: Real product catalog
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => {
                    const farmer = farmers.find(f => f.id === product.farmerId);
                    return (
                      <Card key={product.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-lg">{product.name}</CardTitle>
                              <CardDescription>
                                {farmer?.name || "Unknown Farm"} · {product.category}
                              </CardDescription>
                            </div>
                            <Badge variant="secondary">Wholesale</Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-muted-foreground">Retail Price:</span>
                                <p className="font-semibold line-through">
                                  R{parseFloat(product.retailPrice as any).toFixed(2)}/{product.unit}
                                </p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Wholesale Price:</span>
                                <p className="font-semibold text-primary">
                                  R{parseFloat(product.wholesalePrice as any || product.retailPrice as any).toFixed(2)}/{product.unit}
                                </p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Min Order:</span>
                                <p className="font-semibold">{product.minOrderQty} {product.unit}</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Organic:</span>
                                <p className="font-semibold">{product.organic ? "Yes" : "No"}</p>
                              </div>
                            </div>
                            {product.image && (
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-32 object-cover rounded"
                              />
                            )}
                            <div className="flex space-x-2">
                              <Input
                                type="number"
                                placeholder={`Qty (${product.unit})`}
                                min={product.minOrderQty || undefined}
                                data-testid={`input-quantity-${product.id}`}
                              />
                              <Button
                                size="sm"
                                data-testid={`button-add-${product.id}`}
                              >
                                Add to Order
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
                {products.length === 0 && (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <p className="text-muted-foreground">No products available for bulk ordering at the moment.</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </TabsContent>

          {/* Purchase Orders */}
          <TabsContent value="orders" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Purchase Orders</h2>
            </div>

            {orders.length === 0 ? (
              <Card><CardContent className="p-8 text-center">
                <p className="text-muted-foreground">No purchase orders yet.</p>
              </CardContent></Card>
            ) : (
              <div className="space-y-4">
                {orders.map(order => (
                  <Card key={order.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="flex items-center space-x-2">
                            <FileText className="w-5 h-5" />
                            <span>Order #{order.id.slice(0, 8).toUpperCase()}</span>
                          </CardTitle>
                          <CardDescription>{order.customerName} · {order.customerEmail}</CardDescription>
                        </div>
                        <Badge
                          variant="outline"
                          className={
                            order.status === "delivered"
                              ? "bg-primary/10 text-primary"
                              : order.status === "pending"
                              ? "bg-secondary/30 text-secondary-foreground"
                              : "bg-accent/20"
                          }
                        >
                          {order.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Total Amount:</span>
                          <p className="font-semibold">R{parseFloat(order.total as any).toFixed(2)}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Placed:</span>
                          <p className="font-semibold">
                            {order.createdAt ? new Date(order.createdAt as any).toLocaleDateString() : "N/A"}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Payment:</span>
                          <p className="font-semibold">{order.paymentMethod || "N/A"}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Items:</span>
                          <p className="font-semibold">
                            {Array.isArray(order.items) ? (order.items as any[]).length : 0} products
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Recurring Orders */}
          <TabsContent value="recurring" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Recurring Orders</h2>
              <Button data-testid="button-setup-recurring">Setup Recurring Order</Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5" />
                  <span>Weekly Produce Order</span>
                </CardTitle>
                <CardDescription>Automated weekly delivery every Monday</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                  <div>
                    <span className="text-muted-foreground">Frequency:</span>
                    <p className="font-semibold">Weekly (Mondays)</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Average Amount:</span>
                    <p className="font-semibold">R12,500.00</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Next Delivery:</span>
                    <p className="font-semibold">March 25, 2024</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Items:</span>
                    <p className="font-semibold">15 products</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline" data-testid="button-modify-recurring">Modify Order</Button>
                  <Button size="sm" variant="outline" data-testid="button-pause-recurring">Pause Schedule</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Invoices */}
          <TabsContent value="invoices" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Invoices & Billing</h2>
            </div>

            {/* Account Summary from real orders */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Card>
                <CardContent className="p-6 text-center">
                  <Package className="w-8 h-8 text-accent mx-auto mb-2" />
                  <h3 className="font-semibold mb-1">Total Orders</h3>
                  <p className="text-2xl font-bold text-accent">{orders.length}</p>
                  <p className="text-sm text-muted-foreground">All time</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <DollarSign className="w-8 h-8 text-primary mx-auto mb-2" />
                  <h3 className="font-semibold mb-1">Total Spend</h3>
                  <p className="text-2xl font-bold text-primary">
                    R{totalSpend.toLocaleString("en-ZA", { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-sm text-muted-foreground">All time</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <TrendingUp className="w-8 h-8 text-farm-brown mx-auto mb-2" />
                  <h3 className="font-semibold mb-1">Avg Order Value</h3>
                  <p className="text-2xl font-bold text-farm-brown">
                    R{orders.length > 0 ? (totalSpend / orders.length).toFixed(2) : "0.00"}
                  </p>
                  <p className="text-sm text-muted-foreground">Per order</p>
                </CardContent>
              </Card>
            </div>

            {orders.length === 0 ? (
              <Card><CardContent className="p-8 text-center">
                <p className="text-muted-foreground">No invoices yet.</p>
              </CardContent></Card>
            ) : (
              <div className="space-y-4">
                {orders.map(order => (
                  <Card key={order.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>Invoice #{order.id.slice(0, 8).toUpperCase()}</CardTitle>
                          <CardDescription>{order.customerName} · {order.deliveryAddress?.slice(0, 40)}</CardDescription>
                        </div>
                        <Badge
                          variant="outline"
                          className={
                            order.paymentStatus === "paid"
                              ? "bg-primary/10 text-primary"
                              : "bg-destructive/10 text-destructive"
                          }
                        >
                          {order.paymentStatus || "pending"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Amount:</span>
                          <p className="font-semibold">R{parseFloat(order.total as any).toFixed(2)}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Date:</span>
                          <p className="font-semibold">
                            {order.createdAt ? new Date(order.createdAt as any).toLocaleDateString() : "N/A"}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Payment Method:</span>
                          <p className="font-semibold">{order.paymentMethod || "N/A"}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Order Status:</span>
                          <p className="font-semibold">{order.status}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}