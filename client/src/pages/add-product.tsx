import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { useAuth } from "@/hooks/use-auth";
import { AuthGuard } from "@/components/auth-guard";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Package, 
  Image as ImageIcon,
  DollarSign,
  X,
  CheckCircle
} from "lucide-react";

function AddProductContent() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "vegetables",
    price: "",
    unit: "kg",
    minOrderQty: 1,
    stockQuantity: 0,
    image: ""
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Get categories for dropdown
  const categories = [
    { value: "vegetables", label: "Vegetables" },
    { value: "meat", label: "Meat" },
    { value: "dairy", label: "Dairy" },
    { value: "fruits", label: "Fruits" },
    { value: "grains", label: "Grains" }
  ];

  const units = [
    { value: "kg", label: "Kilograms (kg)" },
    { value: "g", label: "Grams (g)" },
    { value: "units", label: "Individual Units" },
    { value: "liters", label: "Liters (L)" },
    { value: "dozens", label: "Dozens" }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

 const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      const formDataUpload = new FormData();
      formDataUpload.append('image', file);
      
      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formDataUpload,
        credentials: 'include',
      });
      
      const data = await response.json();
      const imageUrl = data.filePath;
      
      setImagePreview(imageUrl);
      setFormData(prev => ({ ...prev, image: imageUrl }));
    } catch (error) {
      console.error('Image upload error:', error);
    }
  };

  const addProductMutation = useMutation({
    mutationFn: async () => {
      const farmers = await fetch("/api/farmers").then(r => r.json());
      const farmerProfile = farmers.find((f: any) => f.userId === user?.id);
      const farmerId = farmerProfile?.id || user?.id || null;

      const productData = {
        farmerId,
        name: formData.name,
        description: formData.description,
        category: formData.category,
        retailPrice: formData.price,
        wholesalePrice: (parseFloat(formData.price) * 0.85).toFixed(2),
        unit: formData.unit,
        minOrderQty: Number(formData.minOrderQty),
        image: formData.image || null,
        isActive: true,
        featured: false,
        organic: false,
        substitutes: [],
      };
      const res = await apiRequest("POST", "/api/products", productData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({ title: "Product Added", description: "Your product has been listed successfully" });
      setFormData({ name: "", description: "", category: "vegetables", price: "", unit: "kg", minOrderQty: 1, stockQuantity: 0, image: "" });
      setImagePreview(null);
      setLocation("/farmer-dashboard");
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to add product", variant: "destructive" });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price) {
      toast({ title: "Missing Fields", description: "Please fill in all required fields", variant: "destructive" });
      return;
    }
    addProductMutation.mutate();
  };

  const clearImage = () => {
    setImagePreview(null);
    setFormData(prev => ({ ...prev, image: "" }));
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <AuthGuard requiredRole="farmer|vendor">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-6">
                <Package className="w-8 h-8 text-primary" />
                <div>
                  <h1 className="text-3xl font-bold text-card-foreground">Add New Product</h1>
                  <p className="text-muted-foreground">
                    List your farm-fresh products for customers to discover and purchase
                  </p>
                </div>
              </div>
            </div>

            {/* Form */}
            <Card>
              <CardHeader>
                <CardTitle>Product Information</CardTitle>
                <CardDescription>
                  Fill in the details for your product. All fields marked with * are required.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Left Column */}
                    <div className="space-y-6">
                      {/* Product Name */}
                      <div>
                        <Label htmlFor="name">Product Name *</Label>
                        <Input
                          id="name"
                          name="name"
                          type="text"
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="e.g., Organic Tomatoes"
                          required
                          className="w-full"
                        />
                      </div>

                      {/* Description */}
                      <div>
                        <Label htmlFor="description">Description *</Label>
                        <Textarea
                          id="description"
                          name="description"
                          value={formData.description}
                          onChange={handleInputChange}
                          placeholder="Describe your product - quality, origin, growing methods..."
                          rows={4}
                          required
                          className="w-full"
                        />
                      </div>

                      {/* Category */}
                      <div>
                        <Label htmlFor="category">Category *</Label>
                        <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category.value} value={category.value}>
                                {category.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                      {/* Price */}
                      <div>
                        <Label htmlFor="price">Price per Unit (R) *</Label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                          <Input
                            id="price"
                            name="price"
                            type="number"
                            value={formData.price}
                            onChange={handleInputChange}
                            placeholder="25.00"
                            step="0.01"
                            min="0"
                            required
                            className="w-full pl-10"
                          />
                        </div>
                      </div>

                      {/* Unit */}
                      <div>
                        <Label htmlFor="unit">Unit Type *</Label>
                        <Select value={formData.unit} onValueChange={(value) => setFormData(prev => ({ ...prev, unit: value }))}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select unit type" />
                          </SelectTrigger>
                          <SelectContent>
                            {units.map((unit) => (
                              <SelectItem key={unit.value} value={unit.value}>
                                {unit.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Min Order Quantity */}
                      <div>
                        <Label htmlFor="minOrderQty">Minimum Order Quantity *</Label>
                        <Input
                          id="minOrderQty"
                          name="minOrderQty"
                          type="number"
                          value={formData.minOrderQty}
                          onChange={handleInputChange}
                          placeholder="1"
                          min="1"
                          required
                          className="w-full"
                        />
                      </div>

                      {/* Stock Quantity */}
                      <div>
                        <Label htmlFor="stockQuantity">Available Stock</Label>
                        <Input
                          id="stockQuantity"
                          name="stockQuantity"
                          type="number"
                          value={formData.stockQuantity}
                          onChange={handleInputChange}
                          placeholder="100"
                          min="0"
                          className="w-full"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Product Image */}
                  <div className="space-y-4">
                    <Label htmlFor="image">Product Image</Label>
                    <div className="flex items-center gap-6">
                      <div className="flex-1">
                        <label htmlFor="image" className="border-2 border-dashed border-muted-foreground/20 rounded-lg p-6 text-center cursor-pointer block">
                          {imagePreview ? (
                            <div className="space-y-4">
                              <img 
                                src={imagePreview} 
                                alt="Product preview" 
                                className="max-h-48 mx-auto rounded-lg shadow-md"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={clearImage}
                                className="mt-4"
                              >
                                <X className="w-4 h-4 mr-2" />
                                Remove Image
                              </Button>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              <ImageIcon className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                              <p className="text-sm text-muted-foreground">
                                Click to upload product image
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Recommended: 800x600px, max 5MB
                              </p>
                            </div>
                          )}
                        </label>
                        <Input
                          id="image"
                          name="image"
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Submit Buttons */}
                  <div className="flex justify-between pt-6 border-t">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setLocation("/vendor-portal")}
                      className="px-6"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={addProductMutation.isPending}
                      className="px-6 bg-primary hover:bg-primary/90"
                    >
                      {addProductMutation.isPending ? (
                        <>
                          <div className="w-4 h-4 mr-2 border-2 border-primary-foreground border-t-transparent animate-spin rounded-full" />
                          Adding Product...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Add Product
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </AuthGuard>
      
      <Footer />
    </div>
  );
}

export default function AddProduct() {
  return <AddProductContent />;
}
