import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";

interface CategoryCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  productCount: number;
  href: string;
  gradientClass: string;
  iconBgClass: string;
  textColorClass: string;
}

export function CategoryCard({
  title,
  description,
  icon,
  productCount,
  href,
  gradientClass,
  iconBgClass,
  textColorClass,
}: CategoryCardProps) {
  const [, setLocation] = useLocation();

  return (
    <Card 
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log("Category card clicked, navigating to:", href);
        setLocation(href);
        console.log("Location set to:", href);
      }}
      className={`${gradientClass} hover:shadow-lg transition-shadow cursor-pointer h-full`} 
      data-testid={`card-category-${title.toLowerCase().replace(' ', '-')}`}
    >
      <CardContent className="p-6 text-center h-full flex flex-col justify-between">
        <div>
          <div className={`w-16 h-16 ${iconBgClass} rounded-full flex items-center justify-center mx-auto mb-4`}>
            {icon}
          </div>
          <h3 className="text-xl font-semibold mb-2">{title}</h3>
          <p className="text-muted-foreground mb-4">{description}</p>
        </div>
        <span className={`${textColorClass} font-medium flex items-center justify-center`}>
          {productCount}+ Products <ArrowRight className="ml-1 h-4 w-4" />
        </span>
      </CardContent>
    </Card>
  );
}
