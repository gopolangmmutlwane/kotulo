import { Star, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { Farmer } from "@shared/schema";

interface FarmerCardProps {
  farmer: Farmer;
}

export function FarmerCard({ farmer }: FarmerCardProps) {
  const rating = parseFloat(farmer.rating || "0");
  
  return (
    <Card className="hover:shadow-lg transition-shadow" data-testid={`card-farmer-${farmer.id}`}>
      <CardContent className="p-6 text-center">
        <Avatar className="w-20 h-20 mx-auto mb-4">
          <AvatarImage src={farmer.avatar || ""} alt={farmer.name} />
          <AvatarFallback className="text-lg">
            {farmer.name.split(' ').map(n => n[0]).join('')}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex items-center justify-center mb-2">
          <h3 className="font-semibold text-lg" data-testid={`text-farmer-name-${farmer.id}`}>
            {farmer.name}
          </h3>
          {farmer.verified === 1 && (
            <Badge variant="secondary" className="ml-2 text-xs bg-green-100 text-green-700">
              Verified
            </Badge>
          )}
        </div>
        
        <p className="text-gray-600 mb-2" data-testid={`text-farmer-type-${farmer.id}`}>
          {farmer.farmType}
        </p>
        
        <p className="text-sm text-gray-500 mb-4" data-testid={`text-farmer-location-${farmer.id}`}>
          {farmer.location}, {farmer.province}
        </p>
        
        <div className="flex items-center justify-center mb-4">
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
          <span className="text-sm text-gray-600" data-testid={`text-farmer-reviews-${farmer.id}`}>
            ({farmer.reviewCount} reviews)
          </span>
        </div>
        
        {farmer.description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {farmer.description}
          </p>
        )}
        
        <Link href={`/farmers/${farmer.id}`}>
          <Button className="w-full bg-farm-green hover:bg-green-700 text-white" data-testid={`button-visit-store-${farmer.id}`}>
            <Store className="h-4 w-4 mr-2" />
            Visit Store
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
