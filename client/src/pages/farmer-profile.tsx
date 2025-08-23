import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { MapPin, Star, Shield, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ProductCard } from "@/components/product-card";
import { CartProvider } from "@/hooks/use-cart";
import { Farmer, Product } from "@shared/schema";

function FarmerProfileContent() {
  const [match, params] = useRoute("/farmers/:id");
  const farmerId = params?.id;

  const { data: farmer, isLoading: farmerLoading } = useQuery<Farmer>({
    queryKey: ["/api/farmers", farmerId],
    enabled: !!farmerId,
  });

  const { data: products = [], isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products", `?farmerId=${farmerId}`],
    enabled: !!farmerId,
  });

  if (!match) {
    return <div>Farmer not found</div>;
  }

  if (farmerLoading) {
    return (
      <div className="min-h-screen bg-stone-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="bg-white rounded-xl p-8 mb-8">
              <div className="flex items-center space-x-6 mb-6">
                <div className="w-24 h-24 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-8 bg-gray-200 rounded mb-2 w-64"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2 w-48"></div>
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!farmer) {
    return (
      <div className="min-h-screen bg-stone-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Farmer not found</h1>
            <Button onClick={() => window.history.back()}>Go Back</Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const rating = parseFloat(farmer.rating || "0");

  return (
    <div className="min-h-screen bg-stone-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Farmer Profile Header */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
              <Avatar className="w-24 h-24">
                <AvatarImage src={farmer.avatar || ""} alt={farmer.name} />
                <AvatarFallback className="text-2xl">
                  {farmer.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <CardTitle className="text-2xl" data-testid="text-farmer-name">{farmer.name}</CardTitle>
                  {farmer.verified === 1 && (
                    <Badge className="bg-green-100 text-green-700">
                      <Shield className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
                
                <p className="text-lg text-gray-600 mb-2" data-testid="text-farmer-type">{farmer.farmType}</p>
                
                <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                  <span className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    {farmer.location}, {farmer.province}
                  </span>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <div className="flex text-yellow-400 mr-2">
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.floor(rating) ? 'fill-current' : 'stroke-current fill-transparent'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">
                      {rating.toFixed(1)} ({farmer.reviewCount} reviews)
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col space-y-2">
                {farmer.phone && (
                  <Button variant="outline" size="sm" data-testid="button-contact-phone">
                    <Phone className="w-4 h-4 mr-2" />
                    {farmer.phone}
                  </Button>
                )}
                {farmer.email && (
                  <Button variant="outline" size="sm" data-testid="button-contact-email">
                    <Mail className="w-4 h-4 mr-2" />
                    Contact
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          {farmer.description && (
            <CardContent>
              <p className="text-gray-600" data-testid="text-farmer-description">
                {farmer.description}
              </p>
            </CardContent>
          )}
        </Card>

        {/* Products Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6">Products from {farmer.name}</h2>
          
          {productsLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl shadow-sm animate-pulse">
                  <div className="w-full h-48 bg-gray-200 rounded-t-xl"></div>
                  <div className="p-4">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded mb-2"></div>
                    <div className="h-6 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg">
              <p className="text-gray-500">This farmer hasn't listed any products yet.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default function FarmerProfile() {
  return (
    <CartProvider>
      <FarmerProfileContent />
    </CartProvider>
  );
}
