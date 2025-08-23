import { Minus, Plus, Trash2, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/hooks/use-cart";
import { formatPrice } from "@/lib/currency";
import { Link } from "wouter";

interface ShoppingCartDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ShoppingCartDrawer({ open, onOpenChange }: ShoppingCartDrawerProps) {
  const { items, updateQuantity, removeItem, totalPrice, clearCart } = useCart();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full max-w-md">
        <SheetHeader>
          <SheetTitle>Shopping Cart</SheetTitle>
        </SheetHeader>
        
        <div className="flex-1 overflow-y-auto py-6">
          {items.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">Your cart is empty</p>
              <Button onClick={() => onOpenChange(false)} variant="outline">
                Continue Shopping
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg" data-testid={`cart-item-${item.id}`}>
                  <img
                    src={item.image || "/api/placeholder/100/100"}
                    alt={item.name}
                    className="w-12 h-12 rounded object-cover"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium" data-testid={`text-cart-item-name-${item.id}`}>{item.name}</h4>
                    <p className="text-sm text-gray-600" data-testid={`text-cart-item-details-${item.id}`}>
                      {item.quantity} × {formatPrice(item.price)}/{item.unit}
                    </p>
                    <div className="flex items-center space-x-2 mt-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        data-testid={`button-decrease-${item.id}`}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="text-sm min-w-[20px] text-center" data-testid={`text-quantity-${item.id}`}>
                        {item.quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        data-testid={`button-increase-${item.id}`}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-red-500 hover:text-red-700"
                        onClick={() => removeItem(item.id)}
                        data-testid={`button-remove-${item.id}`}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <span className="font-semibold" data-testid={`text-cart-item-total-${item.id}`}>
                    {formatPrice(parseFloat(item.price) * item.quantity)}
                  </span>
                </div>
              ))}
              
              {items.length > 0 && (
                <div className="pt-4">
                  <Button 
                    variant="ghost" 
                    onClick={clearCart} 
                    className="w-full text-red-500 hover:text-red-700"
                    data-testid="button-clear-cart"
                  >
                    Clear Cart
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
        
        {items.length > 0 && (
          <div className="border-t pt-6">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-semibold">Total:</span>
              <span className="text-xl font-bold text-farm-green" data-testid="text-cart-total">
                {formatPrice(totalPrice)}
              </span>
            </div>
            <Link href="/checkout">
              <Button 
                className="w-full bg-farm-green hover:bg-green-700 text-white"
                onClick={() => onOpenChange(false)}
                data-testid="button-checkout"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Proceed to Checkout
              </Button>
            </Link>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
