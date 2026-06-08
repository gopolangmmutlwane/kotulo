import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export default function About() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-16 max-w-3xl">
        <h1 className="text-4xl font-bold mb-6">About Kotulo</h1>
        <p className="text-muted-foreground mb-4">
          Kotulo is a South African farm-to-table marketplace connecting local farmers directly with households, restaurants, and businesses. Our mission is to make fresh, quality produce accessible to everyone while helping farmers grow their businesses.
        </p>
        <p className="text-muted-foreground mb-4">
          Founded with a vision to keep street vendors off the streets and into a digital marketplace, Kotulo empowers small-scale farmers in North West province and beyond to reach customers across South Africa.
        </p>
        <h2 className="text-2xl font-bold mt-8 mb-4">Our Mission</h2>
        <p className="text-muted-foreground mb-4">
          To connect South African farmers with consumers for fresh, quality produce delivered straight from the farm — eliminating middlemen and ensuring farmers get fair prices for their produce.
        </p>
        <h2 className="text-2xl font-bold mt-8 mb-4">What We Offer</h2>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
          <li>Fresh fruits, vegetables, meat and dairy products</li>
          <li>Direct farm-to-table delivery</li>
          <li>B2B bulk ordering for restaurants and supermarkets</li>
          <li>A platform for farmers to grow their businesses</li>
          <li>Reliable delivery partners across South Africa</li>
        </ul>
      </div>
      <Footer />
    </div>
  );
}
