import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { useLocation } from "wouter";
import {
  Package,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  AlertCircle,
  CheckCircle2,
  Pencil,
  Trash2,
  Save,
  X,
  Image as ImageIcon
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Product, Farmer } from "@shared/schema";

const CATEGORIES = [
  { value: "vegetables", label: "Vegetables" },
  { value: "meat", label: "Meat" },
  { value: "dairy", label: "Dairy" },
  { value: "fruits", label: "Fruits" },
  { value: "grains", label: "Grains" },
];

const UNITS = [
  { value: "kg", label: "Kilograms (kg)" },
  { value: "g", label: "Grams (g)" },
  { value: "units", label: "Individual Units" },
  { value: "liters", label: "Liters (L)" },
  { value: "dozens", label: "Dozens" },
];

export default function FarmerDashboard() {
    const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    category: "vegetables",
    price: "",
    unit: "kg",
    minOrderQty: 1,
    image: "",
    listingType: "both",
  });
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const openEdit = (product: Product) => {
    setEditingProduct(product);
    setEditForm({
      name: product.name,
      description: product.description || "",
      category: product.category,
      price: String(product.retailPrice),
      unit: product.unit || "kg",
      minOrderQty: product.minOrderQty || 1,
      image: product.image || "",
      listingType: (product as any).listingType || "both",
    });
    setEditImagePreview(product.image || null);
  };

  const handleEditImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const fd = new FormData();
      fd.append("image", file);
      const res = await fetch("/api/upload/image", { method: "POST", body: fd, credentials: "include" });
      const data = await res.json();
      setEditImagePreview(data.filePath);
      setEditForm(prev => ({ ...prev, image: data.filePath }));
    } catch {
      toast({ title: "Upload failed", description: "Could not upload image", variant: "destructive" });
    }
  };

  const updateProductMutation = useMutation({
    mutationFn: async () => {
      if (!editingProduct) return;
      const payload = {
        name: editForm.name,
        description: editForm.description,
        category: editForm.category,
        retailPrice: editForm.price,
        wholesalePrice: (parseFloat(editForm.price) * 0.85).toFixed(2),
        unit: editForm.unit,
        minOrderQty: Number(editForm.minOrderQty),
        image: editForm.image || null,
        listingType: editForm.listingType,
      };
      const res = await apiRequest("PATCH", `/api/products/${editingProduct.id}`, payload);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      if (farmerProfile) {
        queryClient.invalidateQueries({ queryKey: [`/api/products?farmerId=${farmerProfile.id}`] });
      }
      toast({ title: "Product updated", description: "Your changes have been saved." });
      setEditingProduct(null);
    },
    onError: () => {
      toast({ title: "Update failed", description: "Could not save changes.", variant: "destructive" });
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (productId: string) => {
      await apiRequest("DELETE", `/api/products/${productId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      if (farmerProfile) {
        queryClient.invalidateQueries({ queryKey: [`/api/products?farmerId=${farmerProfile.id}`] });
      }
      toast({ title: "Product deleted", description: "The product has been removed." });
      setDeleteConfirmId(null);
    },
    onError: () => {
      toast({ title: "Delete failed", description: "Could not delete product.", variant: "destructive" });
    },
  });

  // Authentication and role guard
  useEffect(() => {
    if (!isAuthenticated) {
      setLocation("/login");
      return;
    }
    
    if (user && user.role !== "farmer") {
      // Redirect non-farmers to appropriate dashboard
      if (user.role === "vendor") {
        setLocation("/vendor-dashboard");
      } else if (user.role === "admin") {
        setLocation("/admin");
      } else if (user.role === "operations") {
        setLocation("/operations");
      } else {
        setLocation("/customer-dashboard");
      }
      return;
    }
  }, [isAuthenticated, user, setLocation]);

  // Show loading state
  if (!isAuthenticated || (user && user.role !== "farmer")) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
          <p className="text-muted-foreground mb-6">Farmer dashboard access required.</p>
          <Button onClick={() => setLocation("/")}>
            Return Home
          </Button>
        </div>
      </div>
    );
  }

  // Check if user is approved
  const isPending = user?.approvalStatus === "pending";
  const isApproved = user?.approvalStatus === "approved";

  // Get farmer profile
  const { data: farmers = [] } = useQuery<Farmer[]>({
    queryKey: ["/api/farmers"],
  });
  
  const farmerProfile = farmers.find(f => f.userId === user?.id);

  // Get farmer's products
  const { data: products = [] } = useQuery<Product[]>({
    queryKey: farmerProfile ? [`/api/products?farmerId=${farmerProfile.id}`] : [],
    enabled: !!farmerProfile,
  });

  // Get notifications
  const { data: notifications = [] } = useQuery<any[]>({
    queryKey: ["/api/notifications"],
    enabled: isAuthenticated,
    refetchInterval: 30000, // refresh every 30 seconds
  });

  const unreadNotifications = notifications.filter(n => !n.read);

  const markReadMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("PATCH", `/api/notifications/${id}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
  });

  if (isPending) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <AlertCircle className="w-8 h-8 text-secondary-foreground" />
                <CardTitle>Account Pending Approval</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Your farmer account is pending admin approval. Complete your application to submit it for review.
              </p>
              <ul className="list-disc list-inside space-y-2 mb-4">
                <li>Submit business registration and documents</li>
                <li>Provide business description and address</li>
                <li>Upload required certifications</li>
              </ul>
              <div className="flex space-x-2">
                <Button 
                  onClick={() => setLocation("/application")}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  Complete Application
                </Button>
                <Button variant="outline" onClick={() => setLocation("/")}>
                  Return Home
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                You'll receive an email notification once your account has been reviewed.
              </p>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  if (!isApproved) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Account Not Approved</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Your account has not been approved. Please contact support for assistance.
              </p>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Farmer Dashboard</h1>
              <p className="text-muted-foreground">Manage your farm and products</p>
            </div>
            <Badge className="bg-primary/10 text-primary">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Approved
            </Badge>
          </div>
        </div>

        {/* Notifications */}
        {unreadNotifications.length > 0 && (
          <Card className="border-l-4 border-l-primary mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs font-bold">
                  {unreadNotifications.length}
                </span>
                New Orders
              </CardTitle>
              <CardDescription>Customers have ordered your products</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {unreadNotifications.map((n: any) => (
                  <div key={n.id} className="flex items-center justify-between p-3 bg-primary/5 rounded-lg border border-primary/20">
                    <div>
                      <p className="font-semibold text-sm">{n.title}</p>
                      <p className="text-sm text-muted-foreground">{n.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(n.createdAt).toLocaleDateString("en-ZA")} {new Date(n.createdAt).toLocaleTimeString("en-ZA")}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => markReadMutation.mutate(n.id)}
                    >
                      Mark Read
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Products</p>
                  <p className="text-2xl font-bold">{products.length}</p>
                </div>
                <Package className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Products</p>
                  <p className="text-2xl font-bold">{products.filter(p => (p as any).status === "approved").length}</p>
                </div>
                <CheckCircle2 className="w-8 h-8 text-accent" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Featured</p>
                  <p className="text-2xl font-bold">{products.filter(p => p.featured).length}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-farm-brown" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Rating</p>
                  <p className="text-2xl font-bold">{farmerProfile?.rating || "0"}</p>
                </div>
                <DollarSign className="w-8 h-8 text-farm-gold" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setLocation("/add-product")}>
            <CardContent className="p-6 text-center">
              <Package className="w-8 h-8 text-farm-green mx-auto mb-2" />
              <h3 className="font-semibold">Manage Products</h3>
              <p className="text-sm text-muted-foreground">Add or edit products</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setLocation("/farmer-dashboard")}>
            <CardContent className="p-6 text-center">
              <TrendingUp className="w-8 h-8 text-primary mx-auto mb-2" />
              <h3 className="font-semibold">View Analytics</h3>
              <p className="text-sm text-muted-foreground">Sales and performance</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setLocation("/b2b")}>
            <CardContent className="p-6 text-center">
              <ShoppingCart className="w-8 h-8 text-accent mx-auto mb-2" />
              <h3 className="font-semibold">Stock from Farmers</h3>
              <p className="text-sm text-muted-foreground">Purchase from other farmers</p>
            </CardContent>
          </Card>
        </div>

        {/* Products List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Your Products</CardTitle>
                <CardDescription>Manage your product listings</CardDescription>
              </div>
              <Button onClick={() => setLocation("/add-product")} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                Add Product
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {products.length === 0 ? (
              <div className="text-center py-8">
                <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No products yet</p>
                <Button onClick={() => setLocation("/add-product")} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  Add Your First Product
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {products.map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors">
                    <div className="flex items-center space-x-4">
                      {product.image ? (
                        <img src={product.image} alt={product.name} className="w-16 h-16 object-cover rounded-lg border" />
                      ) : (
                        <div className="w-16 h-16 rounded-lg border bg-muted flex items-center justify-center">
                          <Package className="w-6 h-6 text-muted-foreground" />
                        </div>
                      )}
                      <div>
                        <p className="font-semibold">{product.name}</p>
                        <p className="text-sm text-muted-foreground capitalize">{product.category}</p>
                        <p className="text-sm font-medium text-primary">R {parseFloat(product.retailPrice as any).toFixed(2)} / {product.unit}</p>
                        {(product as any).status === "rejected" && (
                          <p className="text-xs text-destructive mt-1">Rejected — edit and resubmit for review</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {product.featured && <Badge variant="outline">Featured</Badge>}
                      <Badge variant={
                        (product as any).status === "approved" ? "default" : 
                        (product as any).status === "rejected" ? "destructive" : "secondary"
                      }>
                        {(product as any).status === "approved" ? "Active" : 
                          (product as any).status === "rejected" ? "Rejected" : "Pending Approval"}
                      </Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEdit(product)}
                        className="gap-1"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => setDeleteConfirmId(product.id)}
                        className="gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <Footer />

      {/* Edit Product Dialog */}
      <Dialog open={!!editingProduct} onOpenChange={(open) => !open && setEditingProduct(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>
              Update your product details. Changes will be saved and may require re-approval.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="edit-name">Product Name *</Label>
                <Input
                  id="edit-name"
                  value={editForm.name}
                  onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="e.g., Organic Tomatoes"
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={editForm.description}
                  onChange={e => setEditForm(p => ({ ...p, description: e.target.value }))}
                  placeholder="Describe your product..."
                  rows={3}
                />
              </div>
              <div>
                <Label>Category *</Label>
                <Select value={editForm.category} onValueChange={v => setEditForm(p => ({ ...p, category: v }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Unit Type *</Label>
                <Select value={editForm.unit} onValueChange={v => setEditForm(p => ({ ...p, unit: v }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {UNITS.map(u => <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Label>Available For *</Label>
                <Select value={editForm.listingType} onValueChange={v => setEditForm(p => ({ ...p, listingType: v }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="both">Everyone (Household & Bulk)</SelectItem>
                    <SelectItem value="household">Household Buyers Only</SelectItem>
                    <SelectItem value="bulk">Bulk Buyers Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-price">Price per Unit (R) *</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="edit-price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={editForm.price}
                    onChange={e => setEditForm(p => ({ ...p, price: e.target.value }))}
                    className="pl-10"
                    placeholder="25.00"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="edit-moq">Minimum Order Qty *</Label>
                <Input
                  id="edit-moq"
                  type="number"
                  min="1"
                  value={editForm.minOrderQty}
                  onChange={e => setEditForm(p => ({ ...p, minOrderQty: Number(e.target.value) }))}
                />
              </div>
            </div>
            <div>
              <Label>Product Image</Label>
              <div className="mt-1.5">
                <label htmlFor="edit-image" className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center cursor-pointer block hover:border-primary/50 transition-colors">
                  {editImagePreview ? (
                    <div className="flex items-center gap-4">
                      <img src={editImagePreview} alt="preview" className="w-20 h-20 object-cover rounded-lg border" />
                      <div className="text-left">
                        <p className="text-sm font-medium">Image selected</p>
                        <p className="text-xs text-muted-foreground">Click to replace</p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="ml-auto"
                        onClick={e => { e.preventDefault(); setEditImagePreview(null); setEditForm(p => ({ ...p, image: "" })); }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="py-4 space-y-2">
                      <ImageIcon className="w-8 h-8 text-muted-foreground mx-auto" />
                      <p className="text-sm text-muted-foreground">Click to upload product image</p>
                      <p className="text-xs text-muted-foreground">PNG, JPG, WEBP — max 5MB</p>
                    </div>
                  )}
                </label>
                <Input id="edit-image" type="file" accept="image/*" onChange={handleEditImageChange} className="hidden" />
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setEditingProduct(null)}>Cancel</Button>
            <Button
              onClick={() => updateProductMutation.mutate()}
              disabled={updateProductMutation.isPending || !editForm.name || !editForm.price}
              className="bg-primary hover:bg-primary/90 gap-2"
            >
              {updateProductMutation.isPending ? (
                <><div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent animate-spin rounded-full" /> Saving...</>
              ) : (
                <><Save className="w-4 h-4" /> Save Changes</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirmId} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this product? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>Cancel</Button>
            <Button
              variant="destructive"
              disabled={deleteProductMutation.isPending}
              onClick={() => deleteConfirmId && deleteProductMutation.mutate(deleteConfirmId)}
            >
              {deleteProductMutation.isPending ? "Deleting..." : "Delete Product"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
