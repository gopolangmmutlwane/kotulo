import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export default function PaymentCancelled() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto text-center">
          <CardContent className="pt-6">
            <XCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Payment Cancelled</h1>
            <p className="text-muted-foreground mb-6">
              Your payment was cancelled. Your order has not been placed.
            </p>
            <div className="space-y-2">
              <Button
                onClick={() => setLocation("/checkout")}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Try Again
              </Button>
              <Button
                variant="outline"
                onClick={() => setLocation("/")}
                className="w-full"
              >
                Continue Shopping
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
}