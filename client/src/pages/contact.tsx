import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Phone, MapPin } from "lucide-react";

export default function Contact() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-16 max-w-3xl">
        <h1 className="text-4xl font-bold mb-6">Contact Us</h1>
        <p className="text-muted-foreground mb-8">
          Have a question or need help? We'd love to hear from you.
        </p>
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <Mail className="w-8 h-8 text-primary mx-auto mb-3" />
              <CardTitle className="text-sm mb-2">Email</CardTitle>
              <p className="text-muted-foreground text-sm">info@kotulo.co.za</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Phone className="w-8 h-8 text-primary mx-auto mb-3" />
              <CardTitle className="text-sm mb-2">Phone</CardTitle>
              <p className="text-muted-foreground text-sm">+27 66 230 5349</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <MapPin className="w-8 h-8 text-primary mx-auto mb-3" />
              <CardTitle className="text-sm mb-2">Location</CardTitle>
              <p className="text-muted-foreground text-sm">Mafikeng, North West, South Africa</p>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
}
