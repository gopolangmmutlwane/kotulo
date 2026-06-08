import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export default function Terms() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-16 max-w-3xl">
        <h1 className="text-4xl font-bold mb-6">Terms & Conditions</h1>
        <p className="text-muted-foreground mb-4">Last updated: {new Date().getFullYear()}</p>
        <h2 className="text-2xl font-bold mt-8 mb-4">1. Acceptance of Terms</h2>
        <p className="text-muted-foreground mb-4">By accessing and using Kotulo, you agree to be bound by these terms and conditions.</p>
        <h2 className="text-2xl font-bold mt-8 mb-4">2. Use of Platform</h2>
        <p className="text-muted-foreground mb-4">Kotulo is a marketplace connecting farmers with buyers. We do not own or control the products listed on our platform.</p>
        <h2 className="text-2xl font-bold mt-8 mb-4">3. Orders and Payments</h2>
        <p className="text-muted-foreground mb-4">All orders are subject to availability. Payments are processed securely through PayFast. Cash on delivery is available in selected areas.</p>
        <h2 className="text-2xl font-bold mt-8 mb-4">4. Delivery</h2>
        <p className="text-muted-foreground mb-4">Delivery times and fees vary by location. Kotulo is not responsible for delays caused by unforeseen circumstances.</p>
        <h2 className="text-2xl font-bold mt-8 mb-4">5. Returns and Refunds</h2>
        <p className="text-muted-foreground mb-4">If you receive damaged or incorrect products, please contact us within 24 hours for a refund or replacement.</p>
        <h2 className="text-2xl font-bold mt-8 mb-4">6. Contact</h2>
        <p className="text-muted-foreground mb-4">For any queries, contact us at info@kotulo.co.za</p>
      </div>
      <Footer />
    </div>
  );
}
