import { Star, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Link, useLocation } from "wouter";
import { Farmer } from "@shared/schema";

interface FarmerCardProps {
  farmer: Farmer;
}

export function FarmerCard({ farmer }: FarmerCardProps) {
  const rating = parseFloat(farmer.rating || "0");
  const [, setLocation] = useLocation();
  
  return (
    <Card className="hover:shadow-lg transition-shadow" data-testid={`card-farmer-${farmer.id}`}>
      <CardContent className="p-6 text-center">
        <Avatar className="w-24 h-24 mx-auto mb-4 ring-2 ring-border shadow-md">
          <AvatarImage 
            src={farmer.avatar || ""} 
            alt={farmer.name}
            className="object-cover scale-100"
          />
          <AvatarFallback className="text-lg">
            {farmer.name.split(' ').map(n => n[0]).join('')}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex items-center justify-center mb-2">
          <h3 className="font-semibold text-lg" data-testid={`text-farmer-name-${farmer.id}`}>
            {farmer.name}
          </h3>
          {farmer.verified && (
            <Badge variant="secondary" className="ml-2 text-xs bg-primary/10 text-primary">
              Verified
            </Badge>
          )}
        </div>
        
        <p className="text-muted-foreground mb-2" data-testid={`text-farmer-type-${farmer.id}`}>
          {farmer.farmType}
        </p>
        
        <p className="text-sm text-muted-foreground mb-4" data-testid={`text-farmer-location-${farmer.id}`}>
          {farmer.location}, {farmer.province}
        </p>
        
        <div className="flex items-center justify-center mb-4">
          <div className="flex text-secondary-foreground mr-2">
            {Array.from({ length: 5 }, (_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  i < Math.floor(rating) ? 'fill-current' : 'stroke-current fill-transparent'
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-muted-foreground" data-testid={`text-farmer-reviews-${farmer.id}`}>
            ({farmer.reviewCount} reviews)
          </span>
        </div>
        
        {farmer.description && (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {farmer.description}
          </p>
        )}
        
        <Button 
          onClick={() => setLocation(`/farmers/${farmer.id}`)}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" 
          data-testid={`button-visit-store-${farmer.id}`}
        >
          <Store className="h-4 w-4 mr-2" />
          Visit Store
        </Button>
      </CardContent>
    </Card>
  );
}
