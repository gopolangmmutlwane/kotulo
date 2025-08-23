import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Search, ShoppingCart, User, Menu, Sprout } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useCart } from "@/hooks/use-cart";
import { ShoppingCartDrawer } from "./shopping-cart";

export function Header() {
  const [location] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [cartOpen, setCartOpen] = useState(false);
  const { totalItems } = useCart();

  const navigation = [
    { name: "Home", href: "/" },
    { name: "Shop", href: "/products" },
    { name: "Dashboard", href: "/dashboard" },
    { name: "B2B", href: "/b2b" },
    { name: "Vendor", href: "/vendor" },
    { name: "Operations", href: "/operations" },
    { name: "Admin", href: "/admin" },
  ];

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="text-2xl font-bold text-farm-green">
                <Sprout className="h-8 w-8 inline mr-2" />
                FarmFresh SA
              </div>
            </Link>
          </div>
          
          <nav className="hidden md:flex items-center space-x-6">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`text-gray-700 hover:text-farm-green font-medium transition-colors ${
                  location === item.href ? 'text-farm-green' : ''
                }`}
                data-testid={`nav-${item.name.toLowerCase()}`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="flex items-center space-x-4">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden" data-testid="button-mobile-menu">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <div className="flex flex-col space-y-4 mt-4">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="text-gray-700 hover:text-farm-green font-medium block py-2"
                      data-testid={`nav-mobile-${item.name.toLowerCase()}`}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
            
            <div className="hidden md:flex items-center bg-gray-100 rounded-lg px-4 py-2 min-w-64">
              <Search className="h-4 w-4 text-gray-400 mr-2" />
              <Input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none flex-1 p-0"
                data-testid="input-search"
              />
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => setCartOpen(true)}
              data-testid="button-cart"
            >
              <ShoppingCart className="h-6 w-6" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-farm-red text-white text-xs rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
                  {totalItems}
                </span>
              )}
            </Button>
            
            <Button className="bg-farm-green hover:bg-green-700 text-white" data-testid="button-login">
              <User className="h-4 w-4 mr-2" />
              Login
            </Button>
          </div>
        </div>
      </div>

      <ShoppingCartDrawer open={cartOpen} onOpenChange={setCartOpen} />
    </header>
  );
}
