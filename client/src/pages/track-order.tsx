import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Package, Truck, CheckCircle, Clock, XCircle } from "lucide-react";

export default function TrackOrder() {
  const [email, setEmail] = useState("");
  const [orderId, setOrderId] = useState(
    new URLSearchParams(window.location.search).get("orderId") || ""
  );
  const [searched, setSearched] = useState(false);

  const { data: orders = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/orders"],
    enabled: searched,
  });

  const foundOrder = orders.find(o =>
    o.id.slice(0, 8).toUpperCase() === orderId.toUpperCase() &&
    o.customerEmail.toLowerCase() === email.toLowerCase()
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "delivered": return <CheckCircle className="w-6 h-6 text-primary" />;
      case "out_for_delivery": return <Truck className="w-6 h-6 text-accent" />;
      case "cancelled": return <XCircle className="w-6 h-6 text-destructive" />;
      default: return <Clock className="w-6 h-6 text-muted-foreground" />;
    }
  };

  const getStatusSteps = (status: string) => {
    const steps = [
      { key: "pending", label: "Order Placed" },
      { key: "confirmed", label: "Confirmed" },
      { key: "preparing", label: "Preparing" },
      { key: "out_for_delivery", label: "Out for Delivery" },
      { key: "delivered", label: "Delivered" },
    ];
    const currentIndex = steps.findIndex(s => s.key === status);
    return steps.map((step, index) => ({
      ...step,
      completed: index <= currentIndex,
      active: index === currentIndex,
    }));
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-16 max-w-2xl">
        <div className="text-center mb-8">
          <Package className="w-12 h-12 text-primary mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2">Track Your Order</h1>
          <p className="text-muted-foreground">Enter your order ID and email to track your order</p>
        </div>

        <Card className="mb-6">
          <CardContent className="p-6 space-y-4">
            <div>
              <Label htmlFor="orderId">Order ID *</Label>
              <Input
                id="orderId"
                value={orderId}
                onChange={e => setOrderId(e.target.value)}
                placeholder="e.g. 14F57020"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="mt-1"
              />
            </div>
            <Button
              onClick={() => setSearched(true)}
              disabled={!orderId || !email || isLoading}
              className="w-full bg-primary hover:bg-primary/90"
            >
              {isLoading ? "Searching..." : "Track Order"}
            </Button>
          </CardContent>
        </Card>

        {searched && !isLoading && !foundOrder && (
          <Card>
            <CardContent className="p-8 text-center">
              <XCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
              <p className="font-semibold mb-2">Order not found</p>
              <p className="text-sm text-muted-foreground">
                Please check your Order ID and email address and try again.
              </p>
            </CardContent>
          </Card>
        )}

        {foundOrder && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Order #{foundOrder.id.slice(0, 8).toUpperCase()}</CardTitle>
                  <CardDescription>
                    Placed on {new Date(foundOrder.createdAt).toLocaleDateString("en-ZA")}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(foundOrder.status)}
                  <span className="font-medium capitalize">{foundOrder.status?.replace(/_/g, " ")}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Progress Steps */}
              {foundOrder.status !== "cancelled" && (
                <div className="flex items-center justify-between">
                  {getStatusSteps(foundOrder.status).map((step, index, arr) => (
                    <div key={step.key} className="flex items-center flex-1">
                      <div className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                          step.completed ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                        }`}>
                          {step.completed ? "✓" : index + 1}
                        </div>
                        <p className="text-xs text-center mt-1 w-16">{step.label}</p>
                      </div>
                      {index < arr.length - 1 && (
                        <div className={`flex-1 h-1 mx-1 mb-5 ${step.completed ? "bg-primary" : "bg-muted"}`} />
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Items */}
              <div>
                <p className="font-medium mb-3">Items Ordered:</p>
                <div className="space-y-2">
                  {(foundOrder.items || []).map((item: any, i: number) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{item.name} × {item.quantity} {item.unit}</span>
                      <span className="font-medium">R{(parseFloat(item.price) * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total and delivery */}
              <div className="border-t pt-4">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-primary">R{parseFloat(foundOrder.total).toFixed(2)}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Delivery to: {foundOrder.deliveryAddress}
                </p>
                <p className="text-sm text-muted-foreground">
                  Payment: {foundOrder.paymentMethod === "cod" ? "Cash on Delivery" : "PayFast"}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      <Footer />
    </div>
  );
}