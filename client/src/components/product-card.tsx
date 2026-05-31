import { useState } from "react";
import { Heart, Plus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/hooks/use-cart";
import { formatPriceWithUnit } from "@/lib/currency";
import { Product } from "@shared/schema";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const { addItem } = useCart();

  const handleAddToCart = async () => {
    setIsAdding(true);
    addItem({
      id: product.id,
      name: product.name,
      price: product.retailPrice,
      unit: product.unit,
      image: product.image || undefined,
      farmerId: product.farmerId,
    });
    
    setTimeout(() => setIsAdding(false), 1000);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'vegetables':
        return 'bg-primary/10 text-primary';
      case 'meat':
        return 'bg-destructive/10 text-destructive';
      case 'dairy':
        return 'bg-secondary/50 text-secondary-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow" data-testid={`card-product-${product.id}`}>
      <div className="relative">
        <img
          src={product.image || "/api/placeholder/400/300"}
          alt={product.name}
          className="w-full h-48 object-cover"
        />
        <Button
          variant="ghost"
          size="icon"
          className={`absolute top-2 right-2 ${
            isWishlisted ? 'text-destructive' : 'text-muted-foreground hover:text-destructive'
          }`}
          onClick={() => setIsWishlisted(!isWishlisted)}
          data-testid={`button-wishlist-${product.id}`}
        >
          <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-current' : ''}`} />
        </Button>
      </div>
      
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <Badge className={getCategoryColor(product.category)}>
            {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
          </Badge>
          {product.organic && (
            <Badge variant="outline" className="text-primary border-primary">
              Organic
            </Badge>
          )}
        </div>
        
        <h3 className="font-semibold mb-1" data-testid={`text-product-name-${product.id}`}>
          {product.name}
        </h3>
        
        <p className="text-sm text-muted-foreground mb-2 line-clamp-2" data-testid={`text-product-description-${product.id}`}>
          {product.description}
        </p>
        
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-farm-green" data-testid={`text-product-price-${product.id}`}>
            {formatPriceWithUnit(product.retailPrice, product.unit)}
          </span>
          
          <Button
            onClick={handleAddToCart}
            disabled={isAdding}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
            size="sm"
            data-testid={`button-add-to-cart-${product.id}`}
          >
            {isAdding ? (
              <>
                <Check className="h-4 w-4 mr-1" />
                Added
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-1" />
                Add
              </>
            )}
          </Button>
        </div>
        
        {/* Stock tracking will be handled by product lots in the enhanced system */}
      </CardContent>
    </Card>
  );
}
