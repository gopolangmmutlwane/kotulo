import { useState } from "react";
import { useLocation } from "wouter";
import { ShoppingCart, User, Menu, Sprout, LogOut, Bell } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { ShoppingCartDrawer } from "./shopping-cart";

const logo = "/images/logo1.png";


export function Header() {
  const [location, setLocation] = useLocation();
  const [cartOpen, setCartOpen] = useState(false);
  const { totalItems } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
  const isDeliveryPartner = (user as any)?.businessModel === "delivery_partner";

  // Fetch unread notifications for farmers and vendors
  const { data: notifications = [] } = useQuery<any[]>({
    queryKey: ["/api/notifications"],
    enabled: isAuthenticated && (user?.role === "farmer" || user?.role === "vendor"),
    refetchInterval: 30000,
  });
  const unreadCount = notifications.filter((n: any) => !n.read).length;

  // Role-based navigation
  const getNavigation = () => {
    // Admin users get different navigation (no shop)
    if (user?.role === "admin") {
      return [
        { name: "Home", href: "/", roles: ["admin"] },
        { name: "Dashboard", href: "/admin", roles: ["admin"] },
        { name: "Operations", href: "/operations", roles: ["admin"] },
      ];
    }

    const baseNav = [
      { name: "Home", href: "/", roles: ["all"] },
      { name: "Shop", href: "/products", roles: ["all"] },
    ];

    if (!isAuthenticated || !user) {
      return baseNav;
    }

    const role = user.role;
    const isApproved = user.approvalStatus === "approved";

    // Dashboard link - redirects to role-specific dashboard
    const dashboardLink = 
      role === "farmer" ? { name: "Dashboard", href: "/farmer-dashboard", roles: ["farmer"] } :
      role === "vendor" ? { name: "Dashboard", href: "/vendor", roles: ["vendor"] } :
      role === "admin" ? { name: "Dashboard", href: "/admin", roles: ["admin"] } :
      role === "operations" ? { name: "Dashboard", href: "/operations", roles: ["operations"] } :
      { name: "Dashboard", href: "/customer-dashboard", roles: ["household", "b2b"] };

    const roleNav = [];

    // Household customers
    if (role === "household") {
      roleNav.push(dashboardLink);
    }

    // B2B buyers
    if (role === "b2b") {
      roleNav.push(dashboardLink);
      roleNav.push({ name: "B2B", href: "/b2b", roles: ["b2b"] });
    }

    // Farmers
    if (role === "farmer") {
      roleNav.push(dashboardLink);
      if (isApproved) {
        roleNav.push({ name: "B2B", href: "/b2b", roles: ["farmer"] }); // To stock from other farmers
      } else {
        // Show application link for pending farmers
        roleNav.push({ name: "Application", href: "/application", roles: ["farmer"] });
      }
    }

    // Vendors
    if (role === "vendor") {
      roleNav.push(dashboardLink);
        if (isApproved && !isDeliveryPartner) {
          roleNav.push({ name: "B2B", href: "/b2b", roles: ["vendor"] }); // Only for resellers
        } else {
        // Show application link for pending vendors
        roleNav.push({ name: "Application", href: "/application", roles: ["vendor"] });
      }
    }

    // Operations staff
    if (role === "operations") {
      roleNav.push(dashboardLink);
    }

    // Admins
    if (role === "admin") {
      roleNav.push(dashboardLink);
      roleNav.push({ name: "Operations", href: "/operations", roles: ["admin"] });
    }

    return [...baseNav, ...roleNav];
  };

  const navigation = getNavigation();

  return (
    <header className="bg-card/90 backdrop-blur-md shadow-lg sticky top-0 z-50 border-b border-border">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
           {isAuthenticated && (user?.role === "farmer" || user?.role === "vendor") && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-6 w-6" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-destructive text-primary-foreground text-xs rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
                        {unreadCount}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <DropdownMenuLabel className="flex items-center justify-between">
                    <span>Notifications</span>
                    {unreadCount > 0 && (
                      <span className="text-xs text-muted-foreground">{unreadCount} unread</span>
                    )}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      No notifications yet
                    </div>
                  ) : (
                    notifications.slice(0, 5).map((n: any) => (
                      <DropdownMenuItem
                        key={n.id}
                        className={`flex flex-col items-start p-3 cursor-pointer ${!n.read ? "bg-primary/5" : ""}`}
                        onClick={async () => {
                          if (!n.read) {
                            await fetch(`/api/notifications/${n.id}/read`, { method: "PATCH", credentials: "include" });
                          }
                          setLocation(user?.role === "vendor" ? "/vendor" : "/farmer-dashboard");
                        }}
                      >
                        <p className="font-semibold text-sm">{n.title}</p>
                        <p className="text-xs text-muted-foreground">{n.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(n.createdAt).toLocaleDateString("en-ZA")} {new Date(n.createdAt).toLocaleTimeString("en-ZA")}
                        </p>
                      </DropdownMenuItem>
                    ))
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-center text-sm text-primary cursor-pointer justify-center"
                    onClick={() => setLocation(user?.role === "vendor" ? "/vendor" : "/farmer-dashboard")}
                  >
                    View All on Dashboard
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
           <button
            onClick={(e) => {
              e.preventDefault();
              setLocation("/");
            }}
            className="flex items-center cursor-pointer"
          >
              <img
              src={logo}
              alt="Kotulo logo"
              className="h-14 w-auto mr-3 rounded-full transform transition duration-300 hover:scale-110"
              />
          </button>
          </div>
          
          <nav className="hidden md:flex items-center space-x-6">
            {navigation.map((item) => (
              <button
                key={item.name}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log("Navigating to:", item.href);
                  setLocation(item.href);
                  console.log("Location set to:", item.href);
                }}
                className={`text-muted-foreground hover:text-primary font-medium transition-colors cursor-pointer ${
                  location === item.href ? 'text-primary' : ''
                }`}
                data-testid={`nav-${item.name.toLowerCase()}`}
              >
                {item.name}
              </button>
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
                    <button
                      key={item.name}
                      onClick={(e) => {
                        e.preventDefault();
                        setLocation(item.href);
                      }}
                      className="text-muted-foreground hover:text-primary font-medium block py-2 text-left cursor-pointer"
                      data-testid={`nav-mobile-${item.name.toLowerCase()}`}
                    >
                      {item.name}
                    </button>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
            
            {/* Hide cart for admin users */}
            {user?.role !== "admin" && (
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={() => setCartOpen(true)}
                data-testid="button-cart"
              >
                <ShoppingCart className="h-6 w-6" />
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-destructive text-primary-foreground text-xs rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
                    {totalItems}
                  </span>
                )}
              </Button>
            )}
            
            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden md:block">{user.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => {
                    const role = user?.role;
                    if (role === "farmer") {
                      setLocation("/farmer-dashboard");
                    } else if (role === "vendor") {
                      setLocation("/vendor");
                    } else if (role === "admin") {
                      setLocation("/admin");
                    } else if (role === "operations") {
                      setLocation("/operations");
                    } else {
                      setLocation("/customer-dashboard");
                    }
                  }}>
                    <User className="mr-2 h-4 w-4" />
                    Dashboard
                  </DropdownMenuItem>
                  {user?.role === "farmer" && user?.approvalStatus === "pending" && (
                    <DropdownMenuItem disabled className="text-secondary-foreground">
                      <span className="text-xs">Pending Approval</span>
                    </DropdownMenuItem>
                  )}
                  {user?.role === "vendor" && user?.approvalStatus === "pending" && (
                    <DropdownMenuItem disabled className="text-secondary-foreground">
                      <span className="text-xs">Pending Approval</span>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={async () => {
                      await logout();
                      setLocation("/");
                    }}
                    className="text-destructive"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                onClick={() => setLocation("/login")}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
                data-testid="button-login"
              >
                <User className="h-4 w-4 mr-2" />
                Login
              </Button>
            )}
          </div>
        </div>
      </div>

      <ShoppingCartDrawer open={cartOpen} onOpenChange={setCartOpen} />
    </header>
  );
}
