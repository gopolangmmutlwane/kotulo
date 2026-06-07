import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CreditCard, Truck, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { useCart, CartProvider } from "@/hooks/use-cart";
import { formatPrice } from "@/lib/currency";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useMutation as useQueryMutation } from "@tanstack/react-query";
import { InsertOrder } from "@shared/schema";

const checkoutSchema = z.object({
  customerName: z.string().min(2, "Name must be at least 2 characters"),
  customerEmail: z.string().email("Please enter a valid email"),
  customerPhone: z.string().min(10, "Please enter a valid phone number"),
  customerAddress: z.string().min(10, "Please enter a complete address"),
  deliveryArea: z.string().optional(),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

function CheckoutContent() {
  const [orderCompleted, setOrderCompleted] = useState(false);
  const [orderId, setOrderId] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [isRedirecting, setIsRedirecting] = useState(false);
  const { items, totalPrice, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      customerAddress: "",
      deliveryArea: "",
    },
  });

  const createOrderMutation = useMutation({
    mutationFn: async (orderData: InsertOrder) => {
      const response = await apiRequest("POST", "/api/orders", orderData);
      return response.json();
    },
    onSuccess: async (order) => {
      clearCart();
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });

      if (paymentMethod === "payfast") {
        setIsRedirecting(true);
        try {
          const res = await fetch("/api/payment/payfast/initiate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              orderId: order.id,
              amount: order.total,
              customerEmail: order.customerEmail,
              customerName: order.customerName,
            }),
          });
          const { payfastUrl, data } = await res.json();

          // Create and submit form to PayFast
          const payfastForm = document.createElement("form");
          payfastForm.method = "POST";
          payfastForm.action = payfastUrl;
          Object.entries(data).forEach(([key, value]) => {
            const input = document.createElement("input");
            input.type = "hidden";
            input.name = key;
            input.value = value as string;
            payfastForm.appendChild(input);
          });
          document.body.appendChild(payfastForm);
          payfastForm.submit();
        } catch (error) {
          setIsRedirecting(false);
          toast({ title: "Payment Error", description: "Could not initiate payment.", variant: "destructive" });
        }
      } else {
        setOrderId(order.id);
        setOrderCompleted(true);
        toast({
          title: "Order Placed Successfully!",
          description: `Order #${order.id} has been placed.`,
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Order Failed",
        description: "There was an error placing your order. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CheckoutFormData) => {
    console.log("Form submitted!", data);
    console.log("Form errors:", form.formState.errors);
    const orderData: InsertOrder = {
      items: items.map(item => ({
        productId: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        unit: item.unit,
      })),
      customerEmail: data.customerEmail,
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      deliveryAddress: `[${(data as any).deliveryArea}] ${data.customerAddress}`,
      subtotal: totalPrice.toString(),
      total: totalPrice.toString(),
      paymentMethod: paymentMethod,
    };

    createOrderMutation.mutate(orderData);
  };

  if (orderCompleted) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-md mx-auto text-center">
            <CardContent className="pt-6">
              <CheckCircle className="h-16 w-16 text-primary mx-auto mb-4" />
              <h1 className="text-2xl font-bold mb-2">Order Placed!</h1>
              <p className="text-muted-foreground mb-4">
                Your order #{orderId} has been placed successfully.
              </p>
              <p className="text-sm text-muted-foreground mb-6">
                You will receive an email confirmation shortly.
              </p>
              {!isAuthenticated && (
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-4 text-left">
                  <p className="font-semibold text-sm mb-1">Want to track your order?</p>
                  <p className="text-xs text-muted-foreground mb-3">Create a free account to view your order history and get updates.</p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => window.location.href = "/register"}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                      Create Account
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.location.href = "/login"}
                    >
                      Sign In
                    </Button>
                  </div>
                </div>
              )}
              <Button
                onClick={() => window.location.href = "/"}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                data-testid="button-continue-shopping"
              >
                Continue Shopping
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-md mx-auto text-center">
            <CardContent className="pt-6">
              <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
              <p className="text-muted-foreground mb-6">
                Add some products to your cart before checking out.
              </p>
              <Button
                onClick={() => window.location.href = "/products"}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
                data-testid="button-shop-now"
              >
                Shop Now
              </Button>
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
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>
        
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between" data-testid={`checkout-item-${item.id}`}>
                    <div className="flex items-center space-x-3">
                      <img
                        src={item.image || "/api/placeholder/50/50"}
                        alt={item.name}
                        className="w-12 h-12 rounded object-cover"
                      />
                      <div>
                        <h4 className="font-medium" data-testid={`text-checkout-item-name-${item.id}`}>{item.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {item.quantity} × {formatPrice(item.price)}/{item.unit}
                        </p>
                      </div>
                    </div>
                    <span className="font-semibold" data-testid={`text-checkout-item-total-${item.id}`}>
                      {formatPrice(parseFloat(item.price) * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
              
              <Separator className="my-4" />
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span data-testid="text-subtotal">{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery</span>
                  <span className="text-primary">Free</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span data-testid="text-checkout-total">{formatPrice(totalPrice)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit, (errors) => console.log("Validation errors:", errors))} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="deliveryArea"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Delivery Area *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select your area" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Soweto">Soweto</SelectItem>
                            <SelectItem value="Sandton">Sandton</SelectItem>
                            <SelectItem value="Midrand">Midrand</SelectItem>
                            <SelectItem value="Johannesburg North">Johannesburg North</SelectItem>
                            <SelectItem value="Johannesburg South">Johannesburg South</SelectItem>
                            <SelectItem value="East Rand">East Rand</SelectItem>
                            <SelectItem value="West Rand">West Rand</SelectItem>
                            <SelectItem value="Pretoria">Pretoria</SelectItem>
                            <SelectItem value="Centurion">Centurion</SelectItem>
                            <SelectItem value="Mafikeng">Mafikeng</SelectItem>
                            <SelectItem value="Cape Town">Cape Town</SelectItem>
                            <SelectItem value="Durban">Durban</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="customerAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Delivery Address *</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Street number, street name, suburb"
                            {...field}
                            data-testid="input-customer-address"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />                  
                  <FormField
                    control={form.control}
                    name="customerEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="your@email.com" {...field} data-testid="input-customer-email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="customerPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="+27 82 123 4567" {...field} data-testid="input-customer-phone" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="customerAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Delivery Address</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Your complete delivery address" 
                            {...field} 
                            data-testid="input-customer-address"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Separator className="my-6" />
                  
                  <div className="bg-muted p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Truck className="h-5 w-5 text-primary" />
                      <span className="font-medium">Free Delivery</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Your order will be delivered within 1-2 business days.
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <p className="font-medium">Payment Method</p>
                    <div
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${paymentMethod === "cod" ? "border-primary bg-primary/5" : "border-muted"}`}
                      onClick={() => setPaymentMethod("cod")}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-4 h-4 rounded-full border-2 ${paymentMethod === "cod" ? "border-primary bg-primary" : "border-muted-foreground"}`} />
                        <div>
                          <p className="font-medium">Cash on Delivery</p>
                          <p className="text-sm text-muted-foreground">Pay with cash when your order arrives</p>
                        </div>
                      </div>
                    </div>
                    <div
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${paymentMethod === "payfast" ? "border-primary bg-primary/5" : "border-muted opacity-60"}`}
                      onClick={() => setPaymentMethod("payfast")}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-4 h-4 rounded-full border-2 ${paymentMethod === "payfast" ? "border-primary bg-primary" : "border-muted-foreground"}`} />
                        <div>
                          <p className="font-medium">Pay Online (PayFast)</p>
                          <p className="text-sm text-muted-foreground">Credit/Debit card, EFT, SnapScan — Coming Soon</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3"
                    disabled={createOrderMutation.isPending || isRedirecting}
                    data-testid="button-place-order"
                  >
                    {isRedirecting ? (
                      "Redirecting to PayFast..."
                    ) : createOrderMutation.isPending ? (
                      "Placing Order..."
                    ) : paymentMethod === "payfast" ? (
                      <>
                        <CreditCard className="mr-2 h-5 w-5" />
                        Pay Now ({formatPrice(totalPrice)})
                      </>
                    ) : (
                      <>
                        <CreditCard className="mr-2 h-5 w-5" />
                        Place Order ({formatPrice(totalPrice)})
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default function Checkout() {
  return (
    <CartProvider>
      <CheckoutContent />
    </CartProvider>
  );
}
