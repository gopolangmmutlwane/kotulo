import { useQuery } from "@tanstack/react-query";
import { Carrot, Beef, Milk, ShoppingBag, UserPlus, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ProductCard } from "@/components/product-card";
import { FarmerCard } from "@/components/farmer-card";
import { CategoryCard } from "@/components/category-card";
import { CartProvider } from "@/hooks/use-cart";
import { Link } from "wouter";
import { Product, Farmer } from "@shared/schema";

function HomeContent() {
  const { data: featuredProducts = [], isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products", "featured"]
  });

  const { data: farmers = [], isLoading: farmersLoading } = useQuery<Farmer[]>({
    queryKey: ["/api/farmers"]
  });

  return (
    <div className="min-h-screen bg-stone-50">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-farm-green to-green-600 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Fresh From Farm to Your Table</h1>
              <p className="text-xl mb-6 text-green-100">
                Connect directly with South African farmers for the freshest vegetables, quality meat, and farm-fresh dairy products.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/products">
                  <Button className="bg-white text-farm-green hover:bg-gray-100 px-8 py-3 text-lg" data-testid="button-start-shopping">
                    <ShoppingBag className="mr-2 h-5 w-5" />
                    Start Shopping
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button variant="outline" className="border-white text-white hover:bg-white hover:text-farm-green px-8 py-3 text-lg" data-testid="button-marketplace-dashboard">
                    <UserPlus className="mr-2 h-5 w-5" />
                    Marketplace Dashboard
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600" 
                alt="Fresh produce at South African market" 
                className="rounded-xl shadow-2xl w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">Comprehensive Marketplace Features</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <CategoryCard
              title="Fresh Vegetables"
              description="Seasonal vegetables straight from the farm"
              icon={<Carrot className="text-white text-2xl" />}
              productCount={150}
              href="/products/vegetables"
              gradientClass="bg-gradient-to-br from-green-50 to-green-100"
              iconBgClass="bg-farm-green"
              textColorClass="text-farm-green"
            />
            
            <CategoryCard
              title="Quality Meat"
              description="Premium cuts from local farms"
              icon={<Beef className="text-white text-2xl" />}
              productCount={80}
              href="/products/meat"
              gradientClass="bg-gradient-to-br from-red-50 to-red-100"
              iconBgClass="bg-farm-red"
              textColorClass="text-farm-red"
            />
            
            <CategoryCard
              title="Fresh Dairy"
              description="Farm-fresh milk, cheese, and yogurt"
              icon={<Milk className="text-white text-2xl" />}
              productCount={45}
              href="/products/dairy"
              gradientClass="bg-gradient-to-br from-yellow-50 to-yellow-100"
              iconBgClass="bg-farm-gold"
              textColorClass="text-farm-gold"
            />
          </div>
          
          {/* Marketplace Features Banner */}
          <div className="mt-12 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl p-8">
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-4">Multi-Role Marketplace Platform</h3>
              <p className="text-lg mb-6">
                Experience our comprehensive farm-to-door platform with advanced B2B ordering, vendor management, 
                real-time logistics, and 60-minute delivery SLA.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-3xl font-bold">60min</div>
                  <div className="text-sm opacity-90">Delivery SLA</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">B2B</div>
                  <div className="text-sm opacity-90">Bulk Ordering</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">Hubs</div>
                  <div className="text-sm opacity-90">Micro-Fulfillment</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">5 Roles</div>
                  <div className="text-sm opacity-90">User Types</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Featured Products</h2>
            <Link href="/products">
              <Button variant="ghost" className="text-farm-green hover:underline" data-testid="button-view-all-products">
                View All →
              </Button>
            </Link>
          </div>
          
          {productsLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.slice(0, 4).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Farmers Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Meet Our Farmers</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Connect directly with local South African farmers who are passionate about bringing you the freshest, highest quality produce.
            </p>
          </div>
          
          {farmersLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-6 animate-pulse">
                  <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {farmers.slice(0, 3).map((farmer) => (
                <FarmerCard key={farmer.id} farmer={farmer} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* App Promotion Section */}
      <section className="py-12 bg-gradient-to-r from-farm-green to-green-600 text-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-4">Download Our Mobile App</h2>
              <p className="text-green-100 mb-6">
                Get the FarmFresh SA app for easier shopping, exclusive deals, and direct farmer connections. Install as a Progressive Web App for the best experience.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button className="bg-white text-farm-green hover:bg-gray-100 px-6 py-3" data-testid="button-install-app">
                  <Download className="mr-2 h-5 w-5" />
                  Install App
                </Button>
                <Button variant="outline" className="border-white text-white hover:bg-white hover:text-farm-green px-6 py-3" data-testid="button-app-store">
                  App Store
                </Button>
              </div>
            </div>
            <div className="text-center">
              <img 
                src="https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=500" 
                alt="Mobile app preview" 
                className="max-w-sm mx-auto rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default function Home() {
  return (
    <CartProvider>
      <HomeContent />
    </CartProvider>
  );
}
