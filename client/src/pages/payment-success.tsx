import { useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export default function PaymentSuccess() {
  const [, setLocation] = useLocation();
  const orderId = new URLSearchParams(window.location.search).get("orderId");

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto text-center">
          <CardContent className="pt-6">
            <CheckCircle className="h-16 w-16 text-primary mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Payment Successful!</h1>
            <p className="text-muted-foreground mb-2">
              Your payment has been confirmed.
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              Order #{orderId?.slice(0, 8)} is now being prepared.
            </p>
            <Button
              onClick={() => setLocation("/")}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
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