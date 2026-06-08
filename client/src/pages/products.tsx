import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { Filter, Search } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ProductCard } from "@/components/product-card";
import { CartProvider } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { Product } from "@shared/schema";

function ProductsContent() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const params = useParams();
  const category = params.category;
  
  // Redirect admin users away from products page
  useEffect(() => {
    if (user?.role === "admin") {
      setLocation("/admin");
      return;
    }
  }, [user, setLocation]);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [activeCategory, setActiveCategory] = useState(category || "all");
  const [priceFilter, setPriceFilter] = useState("all");

  const CATEGORIES = [
    { value: "all", label: "🛒 All" },
    { value: "vegetables", label: "🥬 Vegetables" },
    { value: "fruits", label: "🍎 Fruits" },
    { value: "meat", label: "🥩 Meat" },
    { value: "dairy", label: "🥛 Dairy" },
    { value: "grains", label: "🌾 Grains" },
    { value: "farming_supplies", label: "🚜 Farming Supplies" },
    { value: "kotulo_merch", label: "🛍️ Kotulo Merch" },
    { value: "other", label: "📦 Other" },
  ];
  
  const apiUrl = category ? `/api/products?category=${category}` : "/api/products";
  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: [apiUrl]
  });

  const filteredProducts = products
    .filter(product =>
      (product as any).listingType === "household" || (product as any).listingType === "both" || !(product as any).listingType
    )
    .filter(product =>
      activeCategory === "all" || product.category === activeCategory
    )
    .filter(product =>
      searchQuery === "" ||
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter(product => {
      const price = parseFloat(product.retailPrice as any);
      if (priceFilter === "under50") return price < 50;
      if (priceFilter === "50to200") return price >= 50 && price <= 200;
      if (priceFilter === "over200") return price > 200;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return parseFloat(a.retailPrice) - parseFloat(b.retailPrice);
        case "price-high":
          return parseFloat(b.retailPrice) - parseFloat(a.retailPrice);
        case "name":
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

  const getPageTitle = () => {
    if (category) {
      return category.charAt(0).toUpperCase() + category.slice(1);
    }
    return "All Products";
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{getPageTitle()}</h1>
          <p className="text-muted-foreground">
            {category 
              ? `Fresh ${category} from South African farmers`
              : "Browse our complete collection of fresh produce"}
          </p>
        </div>

        {/* Category Tabs */}
        <div className="mb-6 overflow-x-auto">
          <Tabs value={activeCategory} onValueChange={setActiveCategory}>
            <TabsList className="flex w-max gap-1 h-auto p-1">
              {CATEGORIES.map(cat => (
                <TabsTrigger
                  key={cat.value}
                  value={cat.value}
                  className="whitespace-nowrap px-4 py-2 text-sm"
                >
                  {cat.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Filters and Search */}
        <div className="bg-card rounded-lg p-6 mb-8 shadow-sm border border-border">
          <div className="grid md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  data-testid="input-product-search"
                />
              </div>
            </div>
            
            <div>
              <Select value={sortBy} onValueChange={setSortBy} data-testid="select-sort">
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Select value={priceFilter} onValueChange={setPriceFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Price Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Prices</SelectItem>
                  <SelectItem value="under50">Under R50</SelectItem>
                  <SelectItem value="50to200">R50 - R200</SelectItem>
                  <SelectItem value="over200">Over R200</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        {/* Results */}
        <div className="mb-4">
          <p className="text-muted-foreground">
            {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
          </p>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-card rounded-xl shadow-sm animate-pulse border border-border">
                <div className="w-full h-48 bg-muted rounded-t-xl"></div>
                <div className="p-4">
                  <div className="h-4 bg-muted rounded mb-2"></div>
                  <div className="h-3 bg-muted rounded mb-2"></div>
                  <div className="h-6 bg-muted rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No products found</p>
            <Button 
              variant="outline" 
              onClick={() => setSearchQuery("")}
              data-testid="button-clear-search"
            >
              Clear Search
            </Button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

export default function Products() {
  return (
    <CartProvider>
      <ProductsContent />
    </CartProvider>
  );
}
