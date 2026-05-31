import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "wouter";
import type { Order, Hub, ServiceArea } from "@shared/schema";
import { 
  Truck, 
  MapPin, 
  Package, 
  Clock, 
  CheckCircle,
  AlertTriangle,
  Navigation,
  Thermometer
} from "lucide-react";

export default function Operations() {
  const { data: orders = [], isLoading: ordersLoading } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
  });

  const { data: hubs = [], isLoading: hubsLoading } = useQuery<Hub[]>({
    queryKey: ["/api/hubs"],
  });

  const { data: serviceAreas = [], isLoading: areasLoading } = useQuery<ServiceArea[]>({
    queryKey: ["/api/service-areas"],
  });

  const activeOrders = orders.filter(o => o.status !== "delivered" && o.status !== "cancelled");
  const deliveredOrders = orders.filter(o => o.status === "delivered");
  const lateOrders = orders.filter(o => o.slaStatus === "late" || o.slaStatus === "failed");
  const onTimeOrders = orders.filter(o => o.slaStatus === "on_time" && o.status === "delivered");
  const slaRate = deliveredOrders.length > 0
    ? Math.round((onTimeOrders.length / deliveredOrders.length) * 100)
    : 0;
  const avgHubUtilization = hubs.length > 0
    ? Math.round(hubs.reduce((sum, h) => sum + ((h.currentLoad ?? 0) / (h.capacity || 1)) * 100, 0) / hubs.length)
    : 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="bg-card shadow-sm border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="outline" size="sm">← Dashboard</Button>
              </Link>
              <div className="flex items-center space-x-2">
                <Truck className="w-6 h-6 text-farm-brown" />
                <span className="font-bold text-xl">Operations Center</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline">Operations Manager</Badge>
              <Badge className="bg-farm-brown">Live Monitoring</Badge>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {/* Live Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <Truck className="w-8 h-8 text-farm-brown mx-auto mb-2" />
              <h3 className="font-semibold mb-1">Active Deliveries</h3>
              <p className="text-2xl font-bold text-farm-brown">{activeOrders.length}</p>
              <p className="text-sm text-muted-foreground">{lateOrders.length} delayed</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <Clock className="w-8 h-8 text-primary mx-auto mb-2" />
              <h3 className="font-semibold mb-1">SLA Performance</h3>
              <p className="text-2xl font-bold text-primary">{slaRate}%</p>
              <p className="text-sm text-muted-foreground">60-min deliveries</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <Package className="w-8 h-8 text-accent mx-auto mb-2" />
              <h3 className="font-semibold mb-1">Hub Capacity</h3>
              <p className="text-2xl font-bold text-accent">{avgHubUtilization}%</p>
              <p className="text-sm text-muted-foreground">Average utilization</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <CheckCircle className="w-8 h-8 text-farm-brown mx-auto mb-2" />
              <h3 className="font-semibold mb-1">Total Orders</h3>
              <p className="text-2xl font-bold text-farm-brown">{orders.length}</p>
              <p className="text-sm text-muted-foreground">{deliveredOrders.length} delivered</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="deliveries" className="space-y-8">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="deliveries" data-testid="tab-deliveries">Live Deliveries</TabsTrigger>
            <TabsTrigger value="hubs" data-testid="tab-hubs">Micro Hubs</TabsTrigger>
            <TabsTrigger value="service-areas" data-testid="tab-service-areas">Service Areas</TabsTrigger>
            <TabsTrigger value="analytics" data-testid="tab-analytics">Performance</TabsTrigger>
          </TabsList>

          {/* Live Deliveries */}
          <TabsContent value="deliveries" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Live Delivery Tracking</h2>
            </div>

            {ordersLoading ? (
              <p className="text-muted-foreground text-center py-8">Loading orders...</p>
            ) : orders.length === 0 ? (
              <Card><CardContent className="p-8 text-center">
                <p className="text-muted-foreground">No orders to display.</p>
              </CardContent></Card>
            ) : (
              <div className="space-y-4">
                {orders.map(order => {
                  const isLate = order.slaStatus === "late" || order.slaStatus === "failed";
                  const isDelivered = order.status === "delivered";
                  return (
                    <Card key={order.id}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="flex items-center space-x-2">
                              {isDelivered ? (
                                <CheckCircle className="w-5 h-5 text-primary" />
                              ) : isLate ? (
                                <AlertTriangle className="w-5 h-5 text-destructive" />
                              ) : (
                                <Navigation className="w-5 h-5" />
                              )}
                              <span>Order #{order.id.slice(0, 8).toUpperCase()}</span>
                            </CardTitle>
                            <CardDescription>{order.customerName} · {order.customerEmail}</CardDescription>
                          </div>
                          <Badge
                            variant={isDelivered ? "default" : "outline"}
                            className={isLate ? "bg-destructive/10 text-destructive" : isDelivered ? "bg-primary/10 text-primary" : "bg-secondary/20"}
                          >
                            {order.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                          <div>
                            <span className="text-muted-foreground">Total:</span>
                            <p className="font-semibold text-primary">R{parseFloat(order.total as any).toFixed(2)}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Items:</span>
                            <p className="font-semibold">{Array.isArray(order.items) ? (order.items as any[]).length : 0}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">SLA:</span>
                            <p className={`font-semibold ${isLate ? "text-destructive" : "text-primary"}`}>
                              {order.slaStatus || "on_time"}
                            </p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Placed:</span>
                            <p className="font-semibold">
                              {order.createdAt ? new Date(order.createdAt as any).toLocaleDateString() : "N/A"}
                            </p>
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <MapPin className="w-4 h-4 inline mr-1" />
                          {order.deliveryAddress}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* Micro Hubs */}
          <TabsContent value="hubs" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Micro-Fulfillment Hubs</h2>
            </div>

            {hubsLoading ? (
              <p className="text-muted-foreground text-center py-8">Loading hubs...</p>
            ) : hubs.length === 0 ? (
              <Card><CardContent className="p-8 text-center">
                <p className="text-muted-foreground">No hubs configured yet.</p>
              </CardContent></Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {hubs.map(hub => {
                  const utilization = hub.capacity ? Math.round(((hub.currentLoad ?? 0) / hub.capacity) * 100) : 0;
                  return (
                    <Card key={hub.id}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle>{hub.name}</CardTitle>
                            <CardDescription>{hub.address}</CardDescription>
                          </div>
                          <Badge className={hub.isActive ? "bg-primary/10 text-primary" : "bg-secondary/20"}>
                            {hub.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Capacity:</span>
                              <p className="font-semibold">{hub.capacity ?? "N/A"} units</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Current Load:</span>
                              <p className="font-semibold">{hub.currentLoad ?? 0} units</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Cold Storage:</span>
                              <p className="font-semibold text-accent">
                                <Thermometer className="w-4 h-4 inline mr-1" />
                                {hub.coldStorage ? "Yes" : "No"}
                              </p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Lat/Lng:</span>
                              <p className="font-semibold text-xs">{hub.latitude.toFixed(4)}, {hub.longitude.toFixed(4)}</p>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Capacity Utilization</span>
                              <span>{utilization}%</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2">
                              <div
                                className="bg-accent h-2 rounded-full"
                                style={{ width: `${utilization}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* Service Areas */}
          <TabsContent value="service-areas" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Service Areas & Geo-Fencing</h2>
            </div>

            {areasLoading ? (
              <p className="text-muted-foreground text-center py-8">Loading service areas...</p>
            ) : serviceAreas.length === 0 ? (
              <Card><CardContent className="p-8 text-center">
                <p className="text-muted-foreground">No service areas configured yet.</p>
              </CardContent></Card>
            ) : (
              <div className="space-y-4">
                {serviceAreas.map(area => {
                  const areaOrders = orders.filter(o => o.serviceAreaId === area.id);
                  return (
                    <Card key={area.id}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="flex items-center space-x-2">
                              <MapPin className="w-5 h-5" />
                              <span>{area.name}</span>
                            </CardTitle>
                          </div>
                          <Badge className={area.isActive ? "bg-primary/10 text-primary" : "bg-secondary/20"}>
                            {area.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Delivery Fee:</span>
                            <p className="font-semibold">R{parseFloat(area.deliveryFee as any || "0").toFixed(2)}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Min Order:</span>
                            <p className="font-semibold">R{parseFloat(area.minOrderValue as any || "0").toFixed(2)}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Max Delivery:</span>
                            <p className="font-semibold">{area.maxDeliveryTime ?? 60} minutes</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Orders:</span>
                            <p className="font-semibold">{areaOrders.length}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* Performance Analytics */}
          <TabsContent value="analytics" className="space-y-6">
            <h2 className="text-2xl font-bold">Performance Analytics</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>SLA Performance</CardTitle>
                  <CardDescription>60-minute delivery compliance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <p className="text-4xl font-bold text-primary">{slaRate}%</p>
                    <p className="text-muted-foreground">All time</p>
                    <div className="mt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>On-time deliveries</span>
                        <span className="text-primary">{onTimeOrders.length}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Late deliveries</span>
                        <span className="text-secondary-foreground">
                          {orders.filter(o => o.slaStatus === "late").length}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Failed deliveries</span>
                        <span className="text-destructive">
                          {orders.filter(o => o.slaStatus === "failed").length}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                  <CardDescription>Order status breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <p className="text-4xl font-bold text-accent">{orders.length}</p>
                    <p className="text-muted-foreground">Total orders</p>
                    <div className="mt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Pending</span>
                        <span>{orders.filter(o => o.status === "pending").length}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>In transit</span>
                        <span>{orders.filter(o => o.status === "in_transit").length}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Delivered</span>
                        <span className="text-primary">{deliveredOrders.length}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}