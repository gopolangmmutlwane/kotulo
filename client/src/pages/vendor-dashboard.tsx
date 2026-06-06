import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { AuthGuard } from "@/components/auth-guard";
import {
  Package, TrendingUp, DollarSign, ShoppingCart,
  AlertCircle, CheckCircle2, Truck, Phone, MapPin,
  ToggleLeft, ToggleRight, Eye, X, Check
} from "lucide-react";

export default function VendorDashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const isPending = user?.approvalStatus === "pending";
  const isApproved = user?.approvalStatus === "approved";
  const isDeliveryPartner = (user as any)?.businessModel === "delivery_partner";
  const isReseller = (user as any)?.businessModel === "reseller" || !(user as any)?.businessModel;

  // Fetch all orders
  const { data: allOrders = [] } = useQuery<any[]>({
    queryKey: ["/api/orders"],
    enabled: isApproved,
    refetchInterval: 30000,
  });

  // Fetch all products
  const { data: allProducts = [] } = useQuery<any[]>({
    queryKey: ["/api/products"],
    enabled: isApproved,
  });

  // For delivery partners — show pending orders in their area
  const pendingOrders = allOrders.filter(o => o.status === "pending");
  const myAcceptedOrders = allOrders.filter(o =>
    (o as any).vendorId === user?.id && o.status !== "delivered" && o.status !== "cancelled"
  );

  // Toggle online status
  const toggleOnlineMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("PATCH", `/api/users/${user?.id}`, {
        isOnline: !(user as any).isOnline
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({ title: (user as any).isOnline ? "You are now Offline" : "You are now Online" });
    },
  });

  // Accept order
  const acceptOrderMutation = useMutation({
    mutationFn: async (orderId: string) => {
      const res = await apiRequest("PATCH", `/api/orders/${orderId}/status`, {
        status: "confirmed",
        vendorId: user?.id,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({ title: "Order Accepted!", description: "Customer details are now visible." });
      setSelectedOrder(null);
    },
  });

  // Reject order
  const rejectOrderMutation = useMutation({
    mutationFn: async (orderId: string) => {
      const res = await apiRequest("PATCH", `/api/orders/${orderId}/status`, { status: "pending" });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({ title: "Order Rejected" });
      setSelectedOrder(null);
    },
  });

  // Update order status
  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      const res = await apiRequest("PATCH", `/api/orders/${orderId}/status`, { status });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({ title: "Order status updated!" });
    },
  });

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
                  Your vendor account is pending admin approval.
                </p>
                <div className="flex space-x-2">
                  <Button onClick={() => setLocation("/application")} className="bg-primary hover:bg-primary/90">
                    Complete Application
                  </Button>
                  <Button variant="outline" onClick={() => setLocation("/")}>Return Home</Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-3xl font-bold">Vendor Dashboard</h1>
                  <p className="text-muted-foreground">
                    {isDeliveryPartner ? "Delivery Partner" : "Reseller"} • {(user as any)?.serviceArea || "No area set"}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className="bg-primary/10 text-primary">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Approved
                  </Badge>
                  {isDeliveryPartner && (
                    <Button
                      variant="outline"
                      onClick={() => toggleOnlineMutation.mutate()}
                      className={`gap-2 ${(user as any)?.isOnline ? "border-primary text-primary" : ""}`}
                    >
                      {(user as any)?.isOnline ? (
                        <><ToggleRight className="w-5 h-5" /> Online</>
                      ) : (
                        <><ToggleLeft className="w-5 h-5" /> Offline</>
                      )}
                    </Button>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Orders</p>
                        <p className="text-2xl font-bold">{allOrders.length}</p>
                      </div>
                      <ShoppingCart className="w-8 h-8 text-primary" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Pending Orders</p>
                        <p className="text-2xl font-bold">{pendingOrders.length}</p>
                      </div>
                      <Package className="w-8 h-8 text-accent" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Active Deliveries</p>
                        <p className="text-2xl font-bold">{myAcceptedOrders.length}</p>
                      </div>
                      <Truck className="w-8 h-8 text-farm-green" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Revenue</p>
                        <p className="text-2xl font-bold">
                          R{allOrders.filter(o => o.status === "delivered")
                            .reduce((sum, o) => sum + parseFloat(o.total || "0"), 0).toFixed(2)}
                        </p>
                      </div>
                      <DollarSign className="w-8 h-8 text-farm-gold" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Delivery Partner View */}
              {isDeliveryPartner && (
                <>
                  {/* Incoming Orders */}
                  <Card className="mb-6">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Package className="w-5 h-5" />
                        Incoming Orders
                        {pendingOrders.length > 0 && (
                          <span className="bg-destructive text-destructive-foreground text-xs rounded-full px-2 py-0.5">
                            {pendingOrders.length}
                          </span>
                        )}
                      </CardTitle>
                      <CardDescription>New orders waiting to be accepted</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {pendingOrders.length === 0 ? (
                        <p className="text-muted-foreground text-center py-8">No incoming orders right now</p>
                      ) : (
                        <div className="space-y-3">
                          {pendingOrders.map((order: any) => (
                            <div key={order.id} className="border rounded-lg p-4 hover:bg-muted/30 transition-colors">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-semibold">Order #{order.id.slice(0, 8)}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {(order.items || []).map((i: any) => `${i.name} ×${i.quantity}`).join(", ")}
                                  </p>
                                  <p className="text-sm font-medium text-primary">R{parseFloat(order.total).toFixed(2)}</p>
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setSelectedOrder(order)}
                                  >
                                    <Eye className="w-4 h-4 mr-1" />
                                    View
                                  </Button>
                                  <Button
                                    size="sm"
                                    className="bg-primary hover:bg-primary/90 gap-1"
                                    onClick={() => acceptOrderMutation.mutate(order.id)}
                                    disabled={acceptOrderMutation.isPending}
                                  >
                                    <Check className="w-4 h-4" />
                                    Accept
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => rejectOrderMutation.mutate(order.id)}
                                    disabled={rejectOrderMutation.isPending}
                                  >
                                    <X className="w-4 h-4" />
                                    Reject
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Active Deliveries */}
                  <Card className="mb-6">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Truck className="w-5 h-5" />
                        Active Deliveries
                      </CardTitle>
                      <CardDescription>Orders you have accepted</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {myAcceptedOrders.length === 0 ? (
                        <p className="text-muted-foreground text-center py-8">No active deliveries</p>
                      ) : (
                        <div className="space-y-3">
                          {myAcceptedOrders.map((order: any) => (
                            <div key={order.id} className="border rounded-lg p-4">
                              <div className="flex items-center justify-between mb-3">
                                <div>
                                  <p className="font-semibold">Order #{order.id.slice(0, 8)}</p>
                                  <Badge variant="secondary">{order.status?.replace(/_/g, " ")}</Badge>
                                </div>
                                <p className="font-bold text-primary">R{parseFloat(order.total).toFixed(2)}</p>
                              </div>
                              {/* Customer Details */}
                              <div className="bg-muted/30 rounded-lg p-3 mb-3 space-y-2">
                                <p className="text-sm font-medium">Customer Details:</p>
                                <div className="flex items-center gap-2 text-sm">
                                  <Phone className="w-4 h-4 text-primary" />
                                  <span>{order.customerName} — {order.customerPhone}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                  <MapPin className="w-4 h-4 text-primary" />
                                  <span>{order.deliveryAddress}</span>
                                </div>
                              </div>
                              {/* Items */}
                              <div className="space-y-1 mb-3">
                                {(order.items || []).map((item: any, i: number) => (
                                  <p key={i} className="text-sm text-muted-foreground">
                                    {item.name} × {item.quantity} {item.unit}
                                  </p>
                                ))}
                              </div>
                              {/* Status Update Buttons */}
                              <div className="flex gap-2">
                                {order.status === "confirmed" && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => updateStatusMutation.mutate({ orderId: order.id, status: "preparing" })}
                                  >
                                    Mark Preparing
                                  </Button>
                                )}
                                {order.status === "preparing" && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => updateStatusMutation.mutate({ orderId: order.id, status: "out_for_delivery" })}
                                  >
                                    Out for Delivery
                                  </Button>
                                )}
                                {order.status === "out_for_delivery" && (
                                  <Button
                                    size="sm"
                                    className="bg-primary hover:bg-primary/90"
                                    onClick={() => updateStatusMutation.mutate({ orderId: order.id, status: "delivered" })}
                                  >
                                    Mark Delivered
                                  </Button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </>
              )}

              {/* Reseller View */}
              {isReseller && (
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>Stock from Farmers</CardTitle>
                    <CardDescription>Browse and purchase products to resell</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button onClick={() => setLocation("/b2b")} className="bg-primary hover:bg-primary/90">
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Browse Farmer Products
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Order Preview Dialog */}
              {selectedOrder && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                  <Card className="max-w-md w-full">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>Order #{selectedOrder.id.slice(0, 8)}</CardTitle>
                        <Button variant="ghost" size="sm" onClick={() => setSelectedOrder(null)}>
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="font-medium mb-2">Items:</p>
                        {(selectedOrder.items || []).map((item: any, i: number) => (
                          <p key={i} className="text-sm text-muted-foreground">
                            {item.name} × {item.quantity} {item.unit} — R{(parseFloat(item.price) * item.quantity).toFixed(2)}
                          </p>
                        ))}
                      </div>
                      <div className="border-t pt-3">
                        <p className="font-bold text-primary text-lg">Total: R{parseFloat(selectedOrder.total).toFixed(2)}</p>
                        <p className="text-sm text-muted-foreground">
                          Payment: {selectedOrder.paymentMethod === "cod" ? "Cash on Delivery" : "PayFast"}
                        </p>
                      </div>
                      <p className="text-sm text-muted-foreground italic">
                        Customer details will be shown after you accept this order.
                      </p>
                      <div className="flex gap-2">
                        <Button
                          className="flex-1 bg-primary hover:bg-primary/90"
                          onClick={() => acceptOrderMutation.mutate(selectedOrder.id)}
                          disabled={acceptOrderMutation.isPending}
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Accept Order
                        </Button>
                        <Button
                          variant="destructive"
                          className="flex-1"
                          onClick={() => rejectOrderMutation.mutate(selectedOrder.id)}
                          disabled={rejectOrderMutation.isPending}
                        >
                          <X className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </>
          )}
        </div>
        <Footer />
      </div>
    </AuthGuard>
  );
}