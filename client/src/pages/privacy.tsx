import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-16 max-w-3xl">
        <h1 className="text-4xl font-bold mb-6">Privacy Policy</h1>
        <p className="text-muted-foreground mb-4">Last updated: {new Date().getFullYear()}</p>
        <h2 className="text-2xl font-bold mt-8 mb-4">1. Information We Collect</h2>
        <p className="text-muted-foreground mb-4">We collect information you provide when creating an account or placing an order, including your name, email address, phone number and delivery address.</p>
        <h2 className="text-2xl font-bold mt-8 mb-4">2. How We Use Your Information</h2>
        <p className="text-muted-foreground mb-4">We use your information to process orders, deliver products, send order updates and improve our services.</p>
        <h2 className="text-2xl font-bold mt-8 mb-4">3. Information Sharing</h2>
        <p className="text-muted-foreground mb-4">We share your delivery details with our vendor partners only to fulfill your orders. We do not sell your personal information to third parties.</p>
        <h2 className="text-2xl font-bold mt-8 mb-4">4. Data Security</h2>
        <p className="text-muted-foreground mb-4">We use industry-standard security measures to protect your personal information. Payments are processed securely through PayFast.</p>
        <h2 className="text-2xl font-bold mt-8 mb-4">5. Contact</h2>
        <p className="text-muted-foreground mb-4">For privacy concerns, contact us at info@kotulo.co.za</p>
      </div>
      <Footer />
    </div>
  );
}
