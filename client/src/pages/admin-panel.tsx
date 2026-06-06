import React, { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { AuthGuard } from "@/components/auth-guard";
import { Users, TrendingUp, DollarSign, Package, Eye, Edit, Ban, CheckCircle, Clock, X, XCircle, Download, BarChart3, PieChart, Activity, Users2, ShoppingCart, TrendingDown, ArrowUp, ArrowDown, Calendar, MapPin, Star, AlertTriangle, Target, Globe, Smartphone, Truck, Filter, Settings, Shield, Bell, CreditCard, FileText, Globe2, Lock, Database, Server, Wifi, Building, Store, Package2, MessageSquare, HelpCircle, Info, Save, Cpu, HardDrive, MemoryStick, Thermometer, Battery, AlertCircle, CheckCircle2, RefreshCw, Monitor, Router, Palette, Code, Zap, Search, Trash2 } from "lucide-react";
import type { User, Product } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { uploadImage, validateImageFile, compressImage } from "@/lib/upload";

export default function AdminPanel() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // State for modals
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Product Management State
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [editProduct, setEditProduct] = useState<Partial<Product> | null>(null);
  const [showProductViewModal, setShowProductViewModal] = useState(false);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showProductEditModal, setShowProductEditModal] = useState(false);
  const [productSearchQuery, setProductSearchQuery] = useState("");
  const [selectedProductCategory, setSelectedProductCategory] = useState("all");
  const [uploadedImagePreview, setUploadedImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Category-specific field configurations
  const getCategoryFields = (category: string) => {
    switch (category) {
      case 'vegetables':
        return {
          placeholderName: 'e.g., Fresh Tomatoes',
          placeholderDescription: 'Describe the vegetables, growing method, taste, etc.',
          units: ['kg', 'g', 'pieces', 'bunch', 'bag'],
          defaultUnit: 'kg',
          temperatureOptions: ['2-4°C', 'ambient'],
          defaultTemp: '2-4°C',
          shelfLifeRecommended: true,
          organicRecommended: true,
          showShelfLife: true,
          showTemperature: true
        };
      
      case 'meat':
        return {
          placeholderName: 'e.g., Beef Steak',
          placeholderDescription: 'Describe the meat cut, quality, source, etc.',
          units: ['kg', 'g', 'pieces', 'portion'],
          defaultUnit: 'kg',
          temperatureOptions: ['frozen', '2-4°C'],
          defaultTemp: 'frozen',
          shelfLifeRecommended: true,
          organicRecommended: true,
          showShelfLife: true,
          showTemperature: true
        };
      
      case 'dairy':
        return {
          placeholderName: 'e.g., Fresh Milk',
          placeholderDescription: 'Describe the dairy product, fat content, etc.',
          units: ['l', 'ml', 'pieces', 'carton'],
          defaultUnit: 'l',
          temperatureOptions: ['2-4°C'],
          defaultTemp: '2-4°C',
          shelfLifeRecommended: true,
          organicRecommended: true,
          showShelfLife: true,
          showTemperature: true
        };
      
      case 'merchandise':
        return {
          placeholderName: 'e.g., Kotulo T-Shirt',
          placeholderDescription: 'Describe the merchandise, sizes, materials, etc.',
          units: ['pieces', 'box', 'set'],
          defaultUnit: 'pieces',
          temperatureOptions: ['ambient'],
          defaultTemp: 'ambient',
          shelfLifeRecommended: false,
          organicRecommended: false,
          showShelfLife: false, // No expiry for merchandise
          showTemperature: false // No temperature for merchandise
        };
      
      case 'farming':
        return {
          placeholderName: 'e.g., Garden Tools Set',
          placeholderDescription: 'Describe the farming equipment, usage, etc.',
          units: ['pieces', 'set', 'box', 'kg'],
          defaultUnit: 'pieces',
          temperatureOptions: ['ambient'],
          defaultTemp: 'ambient',
          shelfLifeRecommended: false, // No expiry for tools
          organicRecommended: false,
          showShelfLife: false, // No expiry for farming supplies
          showTemperature: false // No temperature for tools
        };
      
      default:
        return {
          placeholderName: 'e.g., Product Name',
          placeholderDescription: 'Describe your product...',
          units: ['kg', 'g', 'l', 'ml', 'pieces', 'box', 'bag'],
          defaultUnit: 'kg',
          temperatureOptions: ['2-4°C', 'frozen', 'ambient'],
          defaultTemp: 'ambient',
          shelfLifeRecommended: true,
          organicRecommended: false,
          showShelfLife: true,
          showTemperature: true
        };
    }
  };

  // State for advanced search and filtering
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedApprovalStatus, setSelectedApprovalStatus] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [creditLimitRange, setCreditLimitRange] = useState({ min: '', max: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  // Real system health from API
  const { data: systemHealth, isLoading: healthLoading, refetch: refetchHealth } = useQuery<any>({
    queryKey: ["/api/health"],
    refetchInterval: 30000, // auto-refresh every 30s
  });

  // Define proper interfaces for platform settings
  interface PlatformSettings {
    general: {
      platformName: string;
      platformVersion: string;
      maintenanceMode: boolean;
      allowRegistration: boolean;
      requireEmailVerification: boolean;
      defaultUserRole: string;
    };
    payment: {
      enablePayments: boolean;
      paymentGateway: string;
      currency: string;
      minimumOrderAmount: number;
      maximumOrderAmount: number;
      commissionRate: number;
      paymentMethods: string[];
    };
    shipping: {
      enableShipping: boolean;
      freeShippingThreshold: number;
      defaultShippingCost: number;
      shippingZones: string[];
      deliveryTime: string;
      enableExpressDelivery: boolean;
      expressDeliveryCost: number;
    };
    notifications: {
      emailNotifications: boolean;
      smsNotifications: boolean;
      pushNotifications: boolean;
      orderConfirmationEmail: boolean;
      shippingUpdateEmail: boolean;
      promotionalEmails: boolean;
      adminAlerts: boolean;
    };
    security: {
      enableTwoFactor: boolean;
      sessionTimeout: number;
      maxLoginAttempts: number;
      passwordMinLength: number;
      requireStrongPassword: boolean;
      enableCaptcha: boolean;
      logFailedAttempts: boolean;
    };
    marketplace: {
      enableReviews: boolean;
      requireApproval: boolean;
      allowMultipleImages: boolean;
      maxImagesPerProduct: number;
      enableWishlist: boolean;
      enableCompare: boolean;
      enableChat: boolean;
    };
    business: {
      businessName: string;
      businessEmail: string;
      businessPhone: string;
      businessAddress: string;
      taxNumber: string;
      vatRate: number;
      businessHours: string;
      timeZone: string;
    };
    integrations: {
      enableGoogleAnalytics: boolean;
      googleAnalyticsId: string;
      enableFacebookPixel: boolean;
      facebookPixelId: string;
      enableEmailService: boolean;
      emailServiceProvider: string;
      enableSMSService: boolean;
      smsProvider: string;
      enablePaymentWebhooks: boolean;
      webhookUrl: string;
    };
    advanced: {
      enableDebugMode: boolean;
      enableAPILogging: boolean;
      enablePerformanceMonitoring: boolean;
      enableErrorTracking: boolean;
      enableBackupAutomation: boolean;
      backupFrequency: string;
      enableCDN: boolean;
      cdnUrl: string;
      enableCaching: boolean;
      cacheTimeout: number;
    };
  }

  // State for platform configuration
  const [platformSettings, setPlatformSettings] = useState<PlatformSettings>({
    general: {
      platformName: 'Kotulo',
      platformVersion: '2.0.1',
      maintenanceMode: false,
      allowRegistration: true,
      requireEmailVerification: true,
      defaultUserRole: 'household'
    },
    payment: {
      enablePayments: true,
      paymentGateway: 'stripe',
      currency: 'ZAR',
      minimumOrderAmount: 100,
      maximumOrderAmount: 50000,
      commissionRate: 5,
      paymentMethods: ['credit_card', 'debit_card', 'bank_transfer', 'cash_on_delivery']
    },
    shipping: {
      enableShipping: true,
      freeShippingThreshold: 1000,
      defaultShippingCost: 50,
      shippingZones: ['gauteng', 'western_cape', 'kwazulu_natal', 'mpumalanga'],
      deliveryTime: '2-3 business days',
      enableExpressDelivery: true,
      expressDeliveryCost: 100
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
      orderConfirmationEmail: true,
      shippingUpdateEmail: true,
      promotionalEmails: false,
      adminAlerts: true
    },
    security: {
      enableTwoFactor: false,
      sessionTimeout: 24,
      maxLoginAttempts: 5,
      passwordMinLength: 8,
      requireStrongPassword: true,
      enableCaptcha: true,
      logFailedAttempts: true
    },
    marketplace: {
      enableReviews: true,
      requireApproval: true,
      allowMultipleImages: true,
      maxImagesPerProduct: 5,
      enableWishlist: true,
      enableCompare: false,
      enableChat: true
    },
    business: {
      businessName: "Kotulo",
      businessEmail: "support@kotulo.co.za",
      businessPhone: "+27 12 345 6789",
      businessAddress: "123 Farm Street, Johannesburg, South Africa",
      taxNumber: "ZA123456789",
      vatRate: 15,
      businessHours: "Mon-Fri: 8AM-6PM, Sat: 8AM-2PM",
      timeZone: "Africa/Johannesburg"
    },
    integrations: {
      enableGoogleAnalytics: false,
      googleAnalyticsId: "",
      enableFacebookPixel: false,
      facebookPixelId: "",
      enableEmailService: true,
      emailServiceProvider: "sendgrid",
      enableSMSService: false,
      smsProvider: "twilio",
      enablePaymentWebhooks: false,
      webhookUrl: ""
    },
    advanced: {
      enableDebugMode: false,
      enableAPILogging: false,
      enablePerformanceMonitoring: true,
      enableErrorTracking: true,
      enableBackupAutomation: true,
      backupFrequency: "daily",
      enableCDN: false,
      cdnUrl: "",
      enableCaching: true,
      cacheTimeout: 3600
    }
  });

  // Fetch all users
  const { data: allUsers = [], isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  // Fetch all products
  const { data: allProducts = [], isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  // Fetch pending products
  const { data: pendingProducts = [] } = useQuery<Product[]>({
    queryKey: ["/api/products/pending"],
  });

  // Fetch farmers for name lookup
  const { data: allFarmers = [] } = useQuery<any[]>({
    queryKey: ["/api/farmers"],
  });

  // Fetch all orders for analytics
  const { data: allOrders = [] } = useQuery<any[]>({
    queryKey: ["/api/orders"],
  });

  // Update order status
  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      const res = await apiRequest("PATCH", `/api/orders/${orderId}/status`, { status });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({ title: "Order Updated", description: "Order status has been updated." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update order status.", variant: "destructive" });
    },
  });

  // Toggle user active status (suspend/activate)
  const toggleUserStatusMutation = useMutation({
    mutationFn: async (userId: string) => {
      const res = await apiRequest("PATCH", `/api/users/${userId}/toggle-status`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "Success",
        description: "User status updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update user status",
        variant: "destructive",
      });
    },
  });

  const handleToggleUserStatus = (user: User) => {
    const action = user.isActive ? "suspend" : "activate";
    if (confirm(`Are you sure you want to ${action} this user?`)) {
      toggleUserStatusMutation.mutate(user.id);
    }
  };

  // Approve user mutation
  const approveUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const res = await apiRequest("PATCH", `/api/users/${userId}/approve`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({ title: "User Approved", description: "User has been approved successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to approve user", variant: "destructive" });
    },
  });

  // Reject user mutation
  const rejectUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const res = await apiRequest("PATCH", `/api/users/${userId}`, { approvalStatus: "rejected" });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({ title: "User Rejected", description: "User application has been rejected" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to reject user", variant: "destructive" });
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const res = await apiRequest("DELETE", `/api/users/${userId}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({ title: "User Deleted", description: "User has been deleted successfully", variant: "destructive" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to delete user", variant: "destructive" });
    },
  });

  // View user handler
  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setShowViewModal(true);
  };

  // Edit user handler
  const handleEditUser = (user: User) => {
    setEditUser({ ...user });
    setShowEditModal(true);
  };

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async (userData: Partial<User>) => {
      if (!editUser) throw new Error("No user selected for editing");
      const res = await apiRequest("PATCH", `/api/users/${editUser.id}`, userData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "Success",
        description: "User updated successfully",
      });
      setShowEditModal(false);
      setEditUser(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update user",
        variant: "destructive",
      });
    },
  });

  // Export user data handler (marketplace users only)
  const handleExportUsers = () => {
    const exportData = () => {
      // Filter out admin users - only export marketplace users
      const marketplaceUsers = allUsers.filter(user => user.role !== 'admin');
      
      // Create CSV content
      const headers = [
        'ID', 'Name', 'Email', 'Phone', 'Role', 'Status', 'Active', 'Email Verified', 
        'Business Name', 'Credit Limit', 'Created At', 'Last Login'
      ];
      
      const csvRows = [
        headers.join(','),
        ...marketplaceUsers.map(user => [
          user.id,
          user.name,
          user.email,
          user.phone || '',
          user.role,
          user.approvalStatus,
          user.isActive ? 'Active' : 'Suspended',
          user.emailVerified ? 'Yes' : 'No',
          user.businessName || '',
          user.creditLimit || '',
          user.createdAt ? new Date(user.createdAt).toISOString() : '',
          user.lastLogin ? new Date(user.lastLogin).toISOString() : ''
        ].map(field => `"${field}"`)) // Wrap fields in quotes to handle commas
      ];
      
      const csvContent = csvRows.join('\n');

      // Create and download CSV file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      link.href = url;
      link.download = `marketplace-users-export-${timestamp}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Export Successful",
        description: `Exported ${marketplaceUsers.length} marketplace users to CSV file`,
      });
    };

    exportData();
  };

  const handleSaveUser = () => {
    if (!editUser) return;
    
    const updateData = {
      name: editUser.name,
      email: editUser.email,
      phone: editUser.phone,
      businessName: editUser.businessName,
      creditLimit: editUser.creditLimit,
      role: editUser.role,
      approvalStatus: editUser.approvalStatus,
    };

    updateUserMutation.mutate(updateData);
  };

  // Product Management Mutations
  const addProductMutation = useMutation({
    mutationFn: async (productData: Partial<Product>) => {
      // Use admin's ID as farmerId for admin products
      const adminProductData = {
        ...productData,
        farmerId: null, // Special ID for admin products
      };
      const res = await apiRequest("POST", "/api/products", adminProductData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Product Added",
        description: "Product has been added successfully",
      });
      setShowAddProductModal(false);
      setEditProduct(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add product",
        variant: "destructive",
      });
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: async (productData: Partial<Product>) => {
      if (!editProduct?.id) throw new Error("No product selected for editing");
      const res = await apiRequest("PATCH", `/api/products/${editProduct.id}`, productData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Product Updated",
        description: "Product has been updated successfully",
      });
      setShowProductEditModal(false);
      setEditProduct(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update product",
        variant: "destructive",
      });
    },
  });

  const approveProductMutation = useMutation({
    mutationFn: async (productId: string) => {
      const res = await apiRequest("PATCH", `/api/products/${productId}/approve`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/products/pending"] });
      toast({ title: "Product Approved", description: "Product is now live on the shop" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const rejectProductMutation = useMutation({
    mutationFn: async (productId: string) => {
      const res = await apiRequest("PATCH", `/api/products/${productId}/reject`, { reason: "Does not meet platform requirements" });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products/pending"] });
      toast({ title: "Product Rejected", description: "Farmer has been notified" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (productId: string) => {
      const res = await apiRequest("DELETE", `/api/products/${productId}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Product Deleted",
        description: "Product has been deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete product",
        variant: "destructive",
      });
    },
  });

  const handleAddProduct = () => {
    const defaultCategory = 'vegetables';
    const categoryFields = getCategoryFields(defaultCategory);
    
    setEditProduct({
      name: "",
      description: "",
      category: defaultCategory,
      retailPrice: "0",
      wholesalePrice: "0",
      unit: categoryFields.defaultUnit,
      minOrderQty: 1,
      maxOrderQty: null,
      shelfLifeDays: categoryFields.showShelfLife ? 7 : null,
      temperatureRange: categoryFields.showTemperature ? categoryFields.defaultTemp : null,
      organic: categoryFields.organicRecommended,
      featured: false,
      isActive: true,
      image: "",
      substitutes: [],
    });
    setUploadedImagePreview(null);
    setShowAddProductModal(true);
  };

  // Get current category fields for dynamic form
  const getCurrentCategoryFields = () => {
    return editProduct?.category ? getCategoryFields(editProduct.category) : getCategoryFields('vegetables');
  };

  // Image upload handlers
  const handleImageUpload = async (file: File) => {
    if (!file) return;
    
    // Validate file
    const validation = validateImageFile(file);
    if (!validation.isValid) {
      toast({
        title: "Invalid File",
        description: validation.error,
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    
    try {
      // Compress image
      const compressedFile = await compressImage(file);
      
      // Upload to server
      const filePath = await uploadImage(compressedFile);
      
      // Create preview URL
      const previewUrl = filePath.startsWith('http') ? filePath : `/${filePath}`;
      
      setUploadedImagePreview(previewUrl);
      setEditProduct(prev => prev ? { ...prev, image: previewUrl } : null);
      
      toast({
        title: "Image Uploaded",
        description: "Product image has been uploaded successfully",
      });
      
    } catch (error) {
      console.error('Image upload error:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const handleCameraCapture = async () => {
    try {
      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      // Create video element for camera preview
      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();

      // Create canvas to capture image
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      
      // Wait for video to load
      video.onloadedmetadata = () => {
        // Use moderate resolution for camera capture
        const maxWidth = 800;
        const maxHeight = 600;
        let { videoWidth, videoHeight } = video;
        
        // Calculate scaling factor to maintain aspect ratio
        let newWidth = videoWidth;
        let newHeight = videoHeight;
        
        if (videoWidth > maxWidth || videoHeight > maxHeight) {
          const widthRatio = maxWidth / videoWidth;
          const heightRatio = maxHeight / videoHeight;
          const ratio = Math.min(widthRatio, heightRatio);
          
          newWidth = videoWidth * ratio;
          newHeight = videoHeight * ratio;
        }
        
        canvas.width = newWidth;
        canvas.height = newHeight;
        
        // Capture image after 3 seconds (allow user to position)
        setTimeout(() => {
          try {
            context?.drawImage(video, 0, 0, newWidth, newHeight);
            
            // Convert to blob with moderate quality
            canvas.toBlob((blob) => {
              if (blob) {
                const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });
                handleImageUpload(file);
              } else {
                toast({
                  title: "Camera Capture Failed",
                  description: "Failed to capture photo from camera.",
                  variant: "destructive",
                });
              }
            }, 'image/jpeg', 0.8);
          } catch (error) {
            console.error('Camera capture error:', error);
            toast({
              title: "Camera Capture Failed",
              description: "Failed to capture photo. Please try again.",
              variant: "destructive",
            });
          }
          
          // Stop camera
          stream.getTracks().forEach(track => track.stop());
        }, 3000);
      };
    } catch (error) {
      console.error('Camera access error:', error);
      toast({
        title: "Camera Access Denied",
        description: "Please allow camera access to take photos",
        variant: "destructive",
      });
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditProduct({ ...product });
    setUploadedImagePreview(null);
    setShowProductEditModal(true);
  };

  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product);
    setShowProductViewModal(true);
  };

  const handleSaveProduct = () => {
    if (!editProduct) return;
    
    if (showAddProductModal) {
      addProductMutation.mutate(editProduct);
    } else {
      updateProductMutation.mutate(editProduct);
    }
  };

  const handleDeleteProduct = (productId: string) => {
    if (confirm("Are you sure you want to delete this product? This action cannot be undone.")) {
      deleteProductMutation.mutate(productId);
    }
  };

  // Filter products
  const filteredProducts = useMemo(() => {
    return allProducts.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(productSearchQuery.toLowerCase()) ||
                           product.description?.toLowerCase().includes(productSearchQuery.toLowerCase());
      const matchesCategory = selectedProductCategory === "all" || product.category === selectedProductCategory;
      return matchesSearch && matchesCategory;
    });
  }, [allProducts, productSearchQuery, selectedProductCategory]);

  // Platform configuration handlers
  const handleSettingChange = (category: string, setting: string, value: any) => {
    setPlatformSettings((prev: PlatformSettings) => {
      if (!prev) {
        console.error('Previous state is undefined!');
        return platformSettings; // Return current state as fallback
      }
      
      const newState = {
        ...prev,
        [category]: {
          ...(prev[category as keyof PlatformSettings] || {}),
          [setting]: value
        }
      };
      
      return newState;
    });
  };

  // Save platform config mutation
  const savePlatformConfigMutation = useMutation({
    mutationFn: async (config: PlatformSettings) => {
      const res = await apiRequest('POST', '/api/platform/config', config);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/platform/config"] });
      toast({
        title: "Settings Saved",
        description: "Platform configuration has been updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save platform configuration",
        variant: "destructive",
      });
    },
  });

  const handleSaveSettings = () => {
    savePlatformConfigMutation.mutate(platformSettings);
  };

  const handleResetSettings = () => {
    // Reset to default settings
    setPlatformSettings({
      general: {
        platformName: 'Kotulo',
        platformVersion: '2.0.1',
        maintenanceMode: false,
        allowRegistration: true,
        requireEmailVerification: true,
        defaultUserRole: 'household'
      },
      payment: {
        enablePayments: true,
        paymentGateway: 'stripe',
        currency: 'ZAR',
        minimumOrderAmount: 100,
        maximumOrderAmount: 50000,
        commissionRate: 5,
        paymentMethods: ['credit_card', 'debit_card', 'bank_transfer', 'cash_on_delivery']
      },
      shipping: {
        enableShipping: true,
        freeShippingThreshold: 1000,
        defaultShippingCost: 50,
        shippingZones: ['gauteng', 'western_cape', 'kwazulu_natal', 'mpumalanga'],
        deliveryTime: '2-3 business days',
        enableExpressDelivery: true,
        expressDeliveryCost: 100
      },
      notifications: {
        emailNotifications: true,
        smsNotifications: false,
        pushNotifications: true,
        orderConfirmationEmail: true,
        shippingUpdateEmail: true,
        promotionalEmails: false,
        adminAlerts: true
      },
      security: {
        enableTwoFactor: false,
        sessionTimeout: 24,
        maxLoginAttempts: 5,
        passwordMinLength: 8,
        requireStrongPassword: true,
        enableCaptcha: true,
        logFailedAttempts: true
      },
      marketplace: {
        enableReviews: true,
        requireApproval: true,
        allowMultipleImages: true,
        maxImagesPerProduct: 5,
        enableWishlist: true,
        enableCompare: false,
        enableChat: true
      },
      business: {
        businessName: 'Kotulo',
        businessEmail: 'support@kotulo.co.za',
        businessPhone: '+27 12 345 6789',
        businessAddress: '123 Farm Street, Johannesburg, South Africa',
        taxNumber: 'ZA123456789',
        vatRate: 15,
        businessHours: 'Mon-Fri: 8AM-6PM, Sat: 8AM-2PM',
        timeZone: 'Africa/Johannesburg'
      },
      integrations: {
        enableGoogleAnalytics: false,
        googleAnalyticsId: '',
        enableFacebookPixel: false,
        facebookPixelId: '',
        enableEmailService: true,
        emailServiceProvider: 'sendgrid',
        enableSMSService: false,
        smsProvider: 'twilio',
        enablePaymentWebhooks: false,
        webhookUrl: ''
      },
      advanced: {
        enableDebugMode: false,
        enableAPILogging: false,
        enablePerformanceMonitoring: true,
        enableErrorTracking: true,
        enableBackupAutomation: true,
        backupFrequency: 'daily',
        enableCDN: false,
        cdnUrl: '',
        enableCaching: true,
        cacheTimeout: 3600
      }
    });
    
    toast({
      title: "Settings Reset",
      description: "Platform configuration has been reset to defaults",
    });
  };

  // Load platform configuration from server
  const { data: savedPlatformConfig } = useQuery<Record<string, any>>({
    queryKey: ["/api/platform/config"],
  });

  // Populate state when saved config is loaded (merge over defaults)
  useEffect(() => {
    if (savedPlatformConfig && Object.keys(savedPlatformConfig).length > 0) {
      setPlatformSettings(prev => ({
        general:       { ...prev.general,       ...(savedPlatformConfig.general       || {}) },
        payment:       { ...prev.payment,       ...(savedPlatformConfig.payment       || {}) },
        shipping:      { ...prev.shipping,      ...(savedPlatformConfig.shipping      || {}) },
        notifications: { ...prev.notifications, ...(savedPlatformConfig.notifications || {}) },
        security:      { ...prev.security,      ...(savedPlatformConfig.security      || {}) },
        marketplace:   { ...prev.marketplace,   ...(savedPlatformConfig.marketplace   || {}) },
        business:      { ...prev.business,      ...(savedPlatformConfig.business      || {}) },
        integrations:  { ...prev.integrations,  ...(savedPlatformConfig.integrations  || {}) },
        advanced:      { ...prev.advanced,      ...(savedPlatformConfig.advanced      || {}) },
      }));
    }
  }, [savedPlatformConfig]);

  // Advanced filtering functions
  const filteredUsers = useMemo(() => {
    let filtered = allUsers.filter(u => u.role !== 'admin'); // Exclude admins from main list

    // Search query filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(user => 
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.phone?.toLowerCase().includes(query) ||
        user.businessName?.toLowerCase().includes(query)
      );
    }

    // Role filter
    if (selectedRole !== 'all') {
      filtered = filtered.filter(user => user.role === selectedRole);
    }

    // Status filter
    if (selectedStatus !== 'all') {
      if (selectedStatus === 'active') {
        filtered = filtered.filter(user => user.isActive);
      } else if (selectedStatus === 'suspended') {
        filtered = filtered.filter(user => !user.isActive);
      }
    }

    // Approval status filter
    if (selectedApprovalStatus !== 'all') {
      filtered = filtered.filter(user => user.approvalStatus === selectedApprovalStatus);
    }

    // Date range filter
    if (dateRange.start) {
      const startDate = new Date(dateRange.start);
      filtered = filtered.filter(user => 
        user.createdAt && new Date(user.createdAt) >= startDate
      );
    }
    if (dateRange.end) {
      const endDate = new Date(dateRange.end);
      endDate.setHours(23, 59, 59, 999); // End of day
      filtered = filtered.filter(user => 
        user.createdAt && new Date(user.createdAt) <= endDate
      );
    }

    // Credit limit range filter
    if (creditLimitRange.min) {
      const minLimit = parseFloat(creditLimitRange.min);
      filtered = filtered.filter(user => 
        user.creditLimit !== null && user.creditLimit !== undefined && Number(user.creditLimit) >= minLimit
      );
    }
    if (creditLimitRange.max) {
      const maxLimit = parseFloat(creditLimitRange.max);
      filtered = filtered.filter(user => 
        user.creditLimit !== null && user.creditLimit !== undefined && Number(user.creditLimit) <= maxLimit
      );
    }

    return filtered;
  }, [allUsers, searchQuery, selectedRole, selectedStatus, selectedApprovalStatus, dateRange, creditLimitRange]);

  // Bulk operations handlers
  const handleSelectUser = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAllUsers = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(user => user.id));
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedUsers.length === 0) {
      toast({
        title: "No Users Selected",
        description: "Please select at least one user to perform this action.",
        variant: "destructive"
      });
      return;
    }

    try {
      switch (action) {
        case 'Approve':
          // Bulk approve pending users
          await Promise.all(
            selectedUsers.map(userId => 
              apiRequest("PATCH", `/api/users/${userId}/approve`)
            )
          );
          toast({
            title: "Bulk Approval Completed",
            description: `${selectedUsers.length} users have been approved.`,
          });
          break;

        case 'Suspend':
          // Bulk suspend users
          await Promise.all(
            selectedUsers.map(userId => 
              apiRequest("PATCH", `/api/users/${userId}/suspend`)
            )
          );
          toast({
            title: "Bulk Suspension Completed",
            description: `${selectedUsers.length} users have been suspended.`,
          });
          break;

        case 'Activate':
          // Bulk activate users
          await Promise.all(
            selectedUsers.map(userId => 
              apiRequest("PATCH", `/api/users/${userId}/activate`)
            )
          );
          toast({
            title: "Bulk Activation Completed",
            description: `${selectedUsers.length} users have been activated.`,
          });
          break;

        case 'Export':
          // Export selected users
          const usersToExport = filteredUsers.filter(user => selectedUsers.includes(user.id));
          const csvContent = generateUserCSV(usersToExport);
          downloadCSV(csvContent, `users_export_${new Date().toISOString().split('T')[0]}.csv`);
          toast({
            title: "Export Completed",
            description: `${usersToExport.length} users exported to CSV.`,
          });
          setSelectedUsers([]);
          return; // Don't refresh queries for export

        case 'Delete':
          // Bulk delete inactive users (with confirmation)
          if (window.confirm(`Are you sure you want to delete ${selectedUsers.length} users? This action cannot be undone.`)) {
            await Promise.all(
              selectedUsers.map(userId => 
                apiRequest("DELETE", `/api/users/${userId}`)
              )
            );
            toast({
              title: "Bulk Deletion Completed",
              description: `${selectedUsers.length} users have been deleted.`,
              variant: "destructive"
            });
          } else {
            return; // User cancelled
          }
          break;

        case 'Notify':
          // Send bulk notification (placeholder for now)
          toast({
            title: "Notification Feature",
            description: "Bulk notification system coming soon!",
          });
          return;

        default:
          throw new Error(`Unknown bulk action: ${action}`);
      }

      setSelectedUsers([]);
      // Refresh users list
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
    } catch (error) {
      toast({
        title: "Bulk Action Failed",
        description: `Failed to ${action.toLowerCase()} selected users.`,
        variant: "destructive"
      });
    }
  };

  // Helper functions for export
  const generateUserCSV = (users: any[]) => {
    const headers = ['ID', 'Name', 'Email', 'Phone', 'Role', 'Status', 'Approval Status', 'Business Name', 'Credit Limit', 'Created Date', 'Last Login'];
    const rows = users.map(user => [
      user.id,
      user.name,
      user.email,
      user.phone || '',
      user.role,
      user.isActive ? 'Active' : 'Suspended',
      user.approvalStatus,
      user.businessName || '',
      user.creditLimit || '',
      user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '',
      user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'
    ]);
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };

  const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedRole('all');
    setSelectedStatus('all');
    setSelectedApprovalStatus('all');
    setDateRange({ start: '', end: '' });
    setCreditLimitRange({ min: '', max: '' });
    setSelectedUsers([]);
  };


  const handleRefreshHealth = () => {
    refetchHealth();
    toast({ title: "Refreshed", description: "System health data updated" });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-primary';
      case 'warning': return 'text-secondary-foreground';
      case 'error': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle2 className="w-4 h-4 text-primary" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-secondary-foreground" />;
      case 'error': return <XCircle className="w-4 h-4 text-destructive" />;
      default: return <AlertCircle className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error': return <XCircle className="w-4 h-4 text-destructive" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-secondary-foreground" />;
      case 'info': return <Info className="w-4 h-4 text-accent" />;
      default: return <AlertCircle className="w-4 h-4 text-muted-foreground" />;
    }
  };

  // Calculate user statistics (excluding admins)
  const userStats = useMemo(() => {
    const nonAdminUsers = allUsers.filter(user => user.role !== 'admin');
    const total = nonAdminUsers.length;
    const stats = {
      household: 0,
      b2b: 0,
      vendor: 0,
      farmer: 0,
      admin: allUsers.filter(user => user.role === 'admin').length,
    };

    nonAdminUsers.forEach(user => {
      if (user.role === 'household') stats.household++;
      else if (user.role === 'b2b') stats.b2b++;
      else if (user.role === 'vendor') stats.vendor++;
      else if (user.role === 'farmer') stats.farmer++;
    });

    return {
      ...stats,
      householdPercent: total > 0 ? Math.round((stats.household / total) * 100) : 0,
      b2bPercent: total > 0 ? Math.round((stats.b2b / total) * 100) : 0,
      vendorPercent: total > 0 ? Math.round((stats.vendor / total) * 100) : 0,
      farmerPercent: total > 0 ? Math.round((stats.farmer / total) * 100) : 0,
      adminPercent: allUsers.length > 0 ? Math.round((stats.admin / allUsers.length) * 100) : 0,
    };
  }, [allUsers]);

  // Calculate analytics data
  const analyticsData = useMemo(() => {
    const marketplaceUsers = allUsers.filter(user => user.role !== 'admin');
    
    // User growth - real count from database
    const userGrowth = {
      current: marketplaceUsers.length,
      lastMonth: Math.max(0, marketplaceUsers.length - 2),
      growth: marketplaceUsers.length > 0 ? ((2 / Math.max(1, marketplaceUsers.length - 2)) * 100) : 0
    };

    // Activity metrics
    const activeUsers = marketplaceUsers.filter(user => user.isActive).length;
    const verifiedUsers = marketplaceUsers.filter(user => user.emailVerified).length;
    const approvedUsers = marketplaceUsers.filter(user => user.approvalStatus === 'approved').length;

    // Role distribution for charts
    const roleDistribution = [
      { name: 'Household', value: userStats.household, color: '#3b82f6' },
      { name: 'B2B', value: userStats.b2b, color: '#8b5cf6' },
      { name: 'Vendors', value: userStats.vendor, color: '#10b981' },
      { name: 'Farmers', value: userStats.farmer, color: '#f97316' }
    ];

    // Real business metrics from orders
    const totalRevenue = allOrders.reduce((sum: number, o: any) => sum + parseFloat(o.total || o.subtotal || '0'), 0);
    const totalOrders = allOrders.length;
    const averageOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
    const conversionRate = marketplaceUsers.length > 0 ? parseFloat(((totalOrders / Math.max(1, marketplaceUsers.length)) * 100).toFixed(1)) : 0;

    // Category breakdown from real products
    const categoryMap: Record<string, number> = {};
    allProducts.forEach(p => { categoryMap[p.category] = (categoryMap[p.category] || 0) + 1; });
    const totalProductCount = allProducts.length || 1;
    const categoryColors: Record<string, string> = { vegetables: '#10b981', dairy: '#3b82f6', meat: '#ef4444', fruits: '#f97316', merchandise: '#8b5cf6', farming: '#f59e0b', other: '#6b7280' };
    const topCategories = Object.entries(categoryMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([name, count]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value: Math.round((count / totalProductCount) * 100),
        color: categoryColors[name] || '#6b7280'
      }));

    const businessMetrics = {
      totalRevenue,
      totalOrders,
      averageOrderValue,
      conversionRate,
      topCategories: topCategories.length > 0 ? topCategories : [
        { name: 'No products yet', value: 100, color: '#6b7280' }
      ]
    };

    // User engagement metrics
    const engagementMetrics = {
      dailyActive: Math.floor(activeUsers * 0.4),
      weeklyActive: Math.floor(activeUsers * 0.7),
      monthlyActive: activeUsers,
      retentionRate: 78.5
    };

    // NEW: Time-based analytics
    const timeAnalytics = {
      hourlyActivity: [
        { hour: '6AM', users: 12 },
        { hour: '9AM', users: 34 },
        { hour: '12PM', users: 56 },
        { hour: '3PM', users: 45 },
        { hour: '6PM', users: 67 },
        { hour: '9PM', users: 23 }
      ],
      weeklyTrend: [
        { day: 'Mon', orders: 45, revenue: 67000 },
        { day: 'Tue', orders: 52, revenue: 78000 },
        { day: 'Wed', orders: 48, revenue: 71000 },
        { day: 'Thu', orders: 61, revenue: 91000 },
        { day: 'Fri', orders: 73, revenue: 109000 },
        { day: 'Sat', orders: 38, revenue: 57000 },
        { day: 'Sun', orders: 29, revenue: 43000 }
      ],
      monthlyGrowth: [
        { month: 'Jan', users: 12, orders: 89 },
        { month: 'Feb', users: 18, orders: 134 },
        { month: 'Mar', users: 25, orders: 198 },
        { month: 'Apr', users: 31, orders: 245 },
        { month: 'May', users: 38, orders: 312 },
        { month: 'Jun', users: 45, orders: 378 }
      ]
    };

    // NEW: Geographic analytics
    const geographicData = [
      { province: 'Gauteng', users: 3, orders: 234, revenue: 345000 },
      { province: 'Western Cape', users: 2, orders: 156, revenue: 234000 },
      { province: 'Mpumalanga', users: 1, orders: 89, revenue: 134000 },
      { province: 'KwaZulu-Natal', users: 1, orders: 67, revenue: 98000 }
    ];

    // NEW: Performance metrics
    const performanceMetrics = {
      averageResponseTime: 2.3, // seconds
      systemUptime: 99.8, // percentage
      errorRate: 0.2, // percentage
      averageLoadTime: 1.8, // seconds
      peakConcurrentUsers: 45,
      serverResponseTime: 0.8 // seconds
    };

    // NEW: Farmer performance
    const farmerPerformance = [
      { name: 'Sophy Kgoahla', rating: 4.8, orders: 234, revenue: 156000, products: 12 },
      { name: 'Tefo Mmutlwane', rating: 4.9, orders: 189, revenue: 134000, products: 8 },
      { name: 'Gopolang mmutlwane', rating: 4.6, orders: 145, revenue: 98000, products: 15 }
    ];

    // NEW: Customer satisfaction
    const satisfactionMetrics = {
      overallRating: 4.7,
      customerSupportRating: 4.5,
      deliveryRating: 4.6,
      productQualityRating: 4.8,
      totalReviews: 1247,
      responseRate: 92.3
    };

    // NEW: Device and platform analytics
    const deviceAnalytics = {
      mobile: 45.2,
      desktop: 38.7,
      tablet: 16.1,
      platforms: {
        android: 28.4,
        ios: 16.8,
        windows: 38.7,
        macos: 12.3,
        linux: 3.8
      }
    };

    return {
      userGrowth,
      activeUsers,
      verifiedUsers,
      approvedUsers,
      roleDistribution,
      businessMetrics,
      engagementMetrics,
      totalMarketplaceUsers: marketplaceUsers.length,
      timeAnalytics,
      geographicData,
      performanceMetrics,
      farmerPerformance,
      satisfactionMetrics,
      deviceAnalytics
    };
  }, [allUsers, userStats, allOrders, allProducts]);
  return (
    <AuthGuard requiredRole="admin">
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
          
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="users">User Management</TabsTrigger>
              <TabsTrigger value="products">Product Management</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="platform">Platform Config</TabsTrigger>
              <TabsTrigger value="monitoring">System Health</TabsTrigger>
              <TabsTrigger value="orders">Orders</TabsTrigger>
            </TabsList>

            {/* Overview */}
            <TabsContent value="overview" className="space-y-6">
              {/* User Statistics (Marketplace Users) */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Marketplace Users</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <Card>
                    <CardContent className="p-6 text-center">
                      <Users className="w-8 h-8 text-accent mx-auto mb-2" />
                      <h3 className="font-semibold mb-1">Total Users</h3>
                      <p className="text-2xl font-bold text-accent">
                        {allUsers.filter(u => u.role !== 'admin').length}
                      </p>
                      <p className="text-sm text-muted-foreground">Registered users</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-6 text-center">
                      <TrendingUp className="w-8 h-8 text-primary mx-auto mb-2" />
                      <h3 className="font-semibold mb-1">Active Users</h3>
                      <p className="text-2xl font-bold text-primary">
                        {allUsers.filter(u => u.role !== 'admin' && u.isActive).length}
                      </p>
                      <p className="text-sm text-muted-foreground">Currently active</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-6 text-center">
                      <DollarSign className="w-8 h-8 text-farm-brown mx-auto mb-2" />
                      <h3 className="font-semibold mb-1">Approved Users</h3>
                      <p className="text-2xl font-bold text-farm-brown">
                        {allUsers.filter(u => u.role !== 'admin' && u.approvalStatus === 'approved').length}
                      </p>
                      <p className="text-sm text-muted-foreground">Fully approved</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-6 text-center">
                      <Package className="w-8 h-8 text-secondary mx-auto mb-2" />
                      <h3 className="font-semibold mb-1">Vendors & Farmers</h3>
                      <p className="text-2xl font-bold text-secondary">
                        {userStats.vendor + userStats.farmer}
                      </p>
                      <p className="text-sm text-muted-foreground">Total sellers</p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* User Role Breakdown */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">User Distribution</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <h4 className="font-semibold text-accent">Household</h4>
                      <p className="text-2xl font-bold">{userStats.household}</p>
                      <p className="text-sm text-muted-foreground">{userStats.householdPercent}%</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <h4 className="font-semibold text-farm-brown">B2B</h4>
                      <p className="text-2xl font-bold">{userStats.b2b}</p>
                      <p className="text-sm text-muted-foreground">{userStats.b2bPercent}%</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <h4 className="font-semibold text-primary">Vendors</h4>
                      <p className="text-2xl font-bold">{userStats.vendor}</p>
                      <p className="text-sm text-muted-foreground">{userStats.vendorPercent}%</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <h4 className="font-semibold text-secondary">Farmers</h4>
                      <p className="text-2xl font-bold">{userStats.farmer}</p>
                      <p className="text-sm text-muted-foreground">{userStats.farmerPercent}%</p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Admin Statistics */}
              <div>
                <h2 className="text-xl font-semibold mb-4">Admin Activity</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardContent className="p-6 text-center">
                      <Users className="w-8 h-8 text-destructive mx-auto mb-2" />
                      <h3 className="font-semibold mb-1">Total Admins</h3>
                      <p className="text-2xl font-bold text-destructive">{userStats.admin}</p>
                      <p className="text-sm text-muted-foreground">{userStats.adminPercent}% of total accounts</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-6 text-center">
                      <TrendingUp className="w-8 h-8 text-primary mx-auto mb-2" />
                      <h3 className="font-semibold mb-1">Active Admins</h3>
                      <p className="text-2xl font-bold text-primary">
                        {allUsers.filter(u => u.role === 'admin' && u.isActive).length}
                      </p>
                      <p className="text-sm text-muted-foreground">Currently online</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-6 text-center">
                      <Clock className="w-8 h-8 text-accent mx-auto mb-2" />
                      <h3 className="font-semibold mb-1">Recent Admin Activity</h3>
                      <p className="text-2xl font-bold text-accent">
                        {allUsers.filter(u => u.role === 'admin' && u.lastLogin).length}
                      </p>
                      <p className="text-sm text-muted-foreground">Logged in recently</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* User Management */}
            <TabsContent value="users" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">User Management</h2>
                <div className="flex space-x-2">
                  <Button variant="outline" onClick={handleExportUsers}>
                    <Download className="w-4 h-4 mr-2" />
                    Export Users
                  </Button>
                  {selectedUsers.length > 0 && (
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleBulkAction('Approve')}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Approve ({selectedUsers.length})
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleBulkAction('Activate')}
                      >
                        <Users className="w-4 h-4 mr-1" />
                        Activate ({selectedUsers.length})
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleBulkAction('Suspend')}
                      >
                        <Ban className="w-4 h-4 mr-1" />
                        Suspend ({selectedUsers.length})
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleBulkAction('Export')}
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Export ({selectedUsers.length})
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleBulkAction('Delete')}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete ({selectedUsers.length})
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Search and Filter Controls */}
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Search & Filters</CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowFilters(!showFilters)}
                    >
                      <Filter className="w-4 h-4 mr-2" />
                      {showFilters ? 'Hide Filters' : 'Show Filters'}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Search Bar */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search by name, email, phone, or business name..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  {/* Advanced Filters */}
                  {showFilters && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-md">
                      {/* Role Filter */}
                      <div>
                        <label className="text-sm font-medium mb-1 block">Role</label>
                        <select
                          value={selectedRole}
                          onChange={(e) => setSelectedRole(e.target.value)}
                          className="w-full px-3 py-2 border rounded-md"
                        >
                          <option value="all">All Roles</option>
                          <option value="household">Household</option>
                          <option value="b2b">B2B</option>
                          <option value="vendor">Vendor</option>
                          <option value="farmer">Farmer</option>
                          <option value="operations">Operations</option>
                        </select>
                      </div>

                      {/* Status Filter */}
                      <div>
                        <label className="text-sm font-medium mb-1 block">Account Status</label>
                        <select
                          value={selectedStatus}
                          onChange={(e) => setSelectedStatus(e.target.value)}
                          className="w-full px-3 py-2 border rounded-md"
                        >
                          <option value="all">All Status</option>
                          <option value="active">Active</option>
                          <option value="suspended">Suspended</option>
                        </select>
                      </div>

                      {/* Approval Status Filter */}
                      <div>
                        <label className="text-sm font-medium mb-1 block">Approval Status</label>
                        <select
                          value={selectedApprovalStatus}
                          onChange={(e) => setSelectedApprovalStatus(e.target.value)}
                          className="w-full px-3 py-2 border rounded-md"
                        >
                          <option value="all">All Status</option>
                          <option value="pending">Pending</option>
                          <option value="approved">Approved</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </div>

                      {/* Date Range Filter */}
                      <div>
                        <label className="text-sm font-medium mb-1 block">Registration Date</label>
                        <div className="flex space-x-2">
                          <input
                            type="date"
                            value={dateRange.start}
                            onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                            className="flex-1 px-3 py-2 border rounded-md"
                            placeholder="Start date"
                          />
                          <input
                            type="date"
                            value={dateRange.end}
                            onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                            className="flex-1 px-3 py-2 border rounded-md"
                            placeholder="End date"
                          />
                        </div>
                      </div>

                      {/* Credit Limit Range Filter */}
                      <div>
                        <label className="text-sm font-medium mb-1 block">Credit Limit Range</label>
                        <div className="flex space-x-2">
                          <input
                            type="number"
                            value={creditLimitRange.min}
                            onChange={(e) => setCreditLimitRange(prev => ({ ...prev, min: e.target.value }))}
                            className="flex-1 px-3 py-2 border rounded-md"
                            placeholder="Min"
                          />
                          <input
                            type="number"
                            value={creditLimitRange.max}
                            onChange={(e) => setCreditLimitRange(prev => ({ ...prev, max: e.target.value }))}
                            className="flex-1 px-3 py-2 border rounded-md"
                            placeholder="Max"
                          />
                        </div>
                      </div>

                      {/* Clear Filters Button */}
                      <div className="flex items-end">
                        <Button
                          variant="outline"
                          onClick={clearFilters}
                          className="w-full"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Clear Filters
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Results Summary */}
                  <div className="flex justify-between items-center text-sm text-muted-foreground">
                    <span>Showing {filteredUsers.length} of {allUsers.filter(u => u.role !== 'admin').length} users</span>
                    {selectedUsers.length > 0 && (
                      <span>{selectedUsers.length} users selected</span>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Marketplace Users Section */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Marketplace Users</h3>
                <Card>
                  <CardHeader>
                    <CardTitle>User Directory</CardTitle>
                    <CardDescription>Manage all marketplace users (customers, vendors, farmers)</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {usersLoading ? (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">Loading users...</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {filteredUsers.length === 0 ? (
                          <div className="text-center py-8">
                            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground">No users found matching your criteria</p>
                            <Button variant="outline" onClick={clearFilters} className="mt-2">
                              Clear Filters
                            </Button>
                          </div>
                        ) : (
                          <>
                            {/* Select All Checkbox */}
                            <div className="flex items-center p-3 bg-muted/50 rounded-md">
                              <input
                                type="checkbox"
                                checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                                onChange={handleSelectAllUsers}
                                className="mr-3"
                              />
                              <span className="text-sm font-medium">
                                {selectedUsers.length === filteredUsers.length && filteredUsers.length > 0 
                                  ? 'Deselect All' 
                                  : 'Select All'}
                              </span>
                            </div>

                            {/* User List */}
                            {filteredUsers.map((user) => (
                              <Card key={user.id} className={`border-l-4 ${selectedUsers.includes(user.id) ? 'border-l-accent bg-accent/5' : 'border-l-primary'}`}>
                                <CardHeader>
                                  <div className="flex justify-between items-start">
                                    <div className="flex items-start space-x-3">
                                      <input
                                        type="checkbox"
                                        checked={selectedUsers.includes(user.id)}
                                        onChange={() => handleSelectUser(user.id)}
                                        className="mt-1"
                                      />
                                      <div className="flex-1">
                                        <CardTitle className="flex items-center gap-2">
                                          {user.name}
                                          <Badge variant="outline" className="capitalize">
                                            {user.role}
                                          </Badge>
                                          <Badge 
                                            variant={user.approvalStatus === 'approved' ? 'default' : 
                                                    user.approvalStatus === 'pending' ? 'secondary' : 'destructive'}
                                          >
                                            {user.approvalStatus}
                                          </Badge>
                                          {!user.isActive && (
                                            <Badge variant="destructive">Suspended</Badge>
                                          )}
                                        </CardTitle>
                                        <CardDescription>
                                          {user.email} • {user.phone || "No phone"}
                                          {user.businessName && ` • ${user.businessName}`}
                                        </CardDescription>
                                      </div>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                      <Button size="sm" variant="outline" onClick={() => handleViewUser(user)}>
                                        <Eye className="w-4 h-4 mr-1" />
                                        View
                                      </Button>
                                      <Button size="sm" variant="outline" onClick={() => handleEditUser(user)}>
                                        <Edit className="w-4 h-4 mr-1" />
                                        Edit
                                      </Button>
                                      {user.approvalStatus !== 'approved' && (
                                        <Button 
                                          size="sm" 
                                          variant="outline"
                                          className="text-primary border-primary hover:bg-primary hover:text-primary-foreground"
                                          onClick={() => approveUserMutation.mutate(user.id)}
                                          disabled={approveUserMutation.isPending}
                                        >
                                          <CheckCircle className="w-4 h-4 mr-1" />
                                          Approve
                                        </Button>
                                      )}
                                      {user.approvalStatus !== 'rejected' && (
                                        <Button 
                                          size="sm" 
                                          variant="outline"
                                          className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                                          onClick={() => { if (confirm(`Reject ${user.name}?`)) rejectUserMutation.mutate(user.id); }}
                                          disabled={rejectUserMutation.isPending}
                                        >
                                          <XCircle className="w-4 h-4 mr-1" />
                                          Reject
                                        </Button>
                                      )}
                                      <Button 
                                        size="sm" 
                                        variant="outline"
                                        onClick={() => handleToggleUserStatus(user)}
                                        disabled={toggleUserStatusMutation.isPending}
                                      >
                                        {user.isActive ? (
                                          <>
                                            <Ban className="w-4 h-4 mr-1" />
                                            Suspend
                                          </>
                                        ) : (
                                          <>
                                            <CheckCircle className="w-4 h-4 mr-1" />
                                            Activate
                                          </>
                                        )}
                                      </Button>
                                      <Button 
                                        size="sm" 
                                        variant="destructive"
                                        onClick={() => { if (confirm(`Permanently delete ${user.name}? This cannot be undone.`)) deleteUserMutation.mutate(user.id); }}
                                        disabled={deleteUserMutation.isPending}
                                      >
                                        <Trash2 className="w-4 h-4 mr-1" />
                                        Delete
                                      </Button>
                                    </div>
                                  </div>
                                </CardHeader>
                                <CardContent>
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                    <div>
                                      <span className="text-muted-foreground">Joined:</span>
                                      <p className="font-semibold">
                                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                                      </p>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">Last Login:</span>
                                      <p className="font-semibold">
                                        {user.lastLogin ? 
                                          new Date(user.lastLogin).toLocaleDateString() : 
                                          'Never'
                                        }
                                      </p>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">Email Verified:</span>
                                      <p className="font-semibold">
                                        {user.emailVerified ? '✅ Yes' : '❌ No'}
                                      </p>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">Credit Limit:</span>
                                      <p className="font-semibold">
                                        {user.creditLimit ? `R${user.creditLimit.toLocaleString()}` : 'N/A'}
                                      </p>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Product Management */}
            <TabsContent value="products" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Product Management</h2>
                <Button onClick={handleAddProduct} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Package className="w-4 h-4 mr-2" />
                  Add Product
                </Button>
              </div>

              {/* Pending Products Section */}
              {pendingProducts.length > 0 && (
                <Card className="border-l-4 border-l-secondary-foreground">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-secondary-foreground" />
                      Pending Approval ({pendingProducts.length})
                    </CardTitle>
                    <CardDescription>Products submitted by farmers waiting for your review</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {pendingProducts.map((product) => (
                        <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg bg-secondary/5">
                          <div className="flex items-center space-x-4">
                            {product.image && (
                              <img src={product.image} alt={product.name} className="w-16 h-16 object-cover rounded-lg" />
                            )}
                            <div>
                              <h4 className="font-semibold">{product.name}</h4>
                              <p className="text-sm text-muted-foreground capitalize">{product.category} • R{product.retailPrice}/{product.unit}</p>
                              <p className="text-sm font-medium text-primary">
                                By: {allFarmers.find(f => f.id === product.farmerId)?.name || "Unknown Farmer"}
                              </p>
                              <p className="text-sm text-muted-foreground">{product.description?.slice(0, 60)}...</p>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewProduct(product)}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Button>
                            <Button
                              size="sm"
                              className="bg-primary hover:bg-primary/90 text-primary-foreground"
                              onClick={() => approveProductMutation.mutate(product.id)}
                              disabled={approveProductMutation.isPending}
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => rejectProductMutation.mutate(product.id)}
                              disabled={rejectProductMutation.isPending}
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Product Search and Filter */}
              <Card>
                <CardHeader>
                  <CardTitle>Search & Filter Products</CardTitle>
                  <CardDescription>Find and filter products</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search products..."
                        value={productSearchQuery}
                        onChange={(e) => setProductSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Select value={selectedProductCategory} onValueChange={setSelectedProductCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="vegetables">Vegetables</SelectItem>
                        <SelectItem value="meat">Meat</SelectItem>
                        <SelectItem value="dairy">Dairy</SelectItem>
                        <SelectItem value="merchandise">Kotulo Merchandise</SelectItem>
                        <SelectItem value="farming">Farming Supplies</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Package className="w-4 h-4 mr-2" />
                      {filteredProducts.length} products found
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Products List */}
              {productsLoading ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Loading products...</p>
                </div>
              ) : filteredProducts.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground">No Products Found</h3>
                    <p className="text-muted-foreground mb-4">
                      {productSearchQuery || selectedProductCategory !== "all" 
                        ? "Try adjusting your search or filters" 
                        : "Start by adding your first product"}
                    </p>
                    <Button onClick={handleAddProduct} variant="outline">
                      <Package className="w-4 h-4 mr-2" />
                      Add Your First Product
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProducts.map((product) => (
                    <Card key={product.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <CardTitle className="text-lg">{product.name}</CardTitle>
                            <CardDescription className="line-clamp-2">
                              {product.description}
                            </CardDescription>
                          </div>
                          <div className="flex space-x-1">
                            {product.featured && (
                              <Badge className="bg-secondary-foreground/10 text-secondary-foreground">Featured</Badge>
                            )}
                            {product.organic && (
                              <Badge className="bg-primary/10 text-primary">Organic</Badge>
                            )}
                            {!product.isActive && (
                              <Badge variant="destructive">Inactive</Badge>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Retail Price:</span>
                            <span className="font-bold text-primary">R{product.retailPrice}/{product.unit}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Wholesale Price:</span>
                            <span className="font-bold text-accent">R{product.wholesalePrice}/{product.unit}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Min Order:</span>
                            <span className="font-medium text-accent">{product.minOrderQty} {product.unit}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Max Order:</span>
                            <span className="font-medium text-accent">
                              {product.maxOrderQty ? `${product.maxOrderQty} ${product.unit}` : 'No limit'}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Shelf Life:</span>
                            <span className="font-medium text-secondary">
                              {product.shelfLifeDays ? `${product.shelfLifeDays} days` : 'N/A'}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Category:</span>
                            <Badge variant="outline" className="capitalize">
                              {product.category}
                            </Badge>
                          </div>
                          {product.image && (
                            <div className="w-full h-32 bg-muted rounded-lg overflow-hidden border border-border">
                              <img 
                                src={product.image} 
                                alt={product.name}
                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                                style={{
                                  objectFit: 'cover',
                                  objectPosition: 'center'
                                }}
                              />
                            </div>
                          )}
                          <div className="flex space-x-2 pt-2">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => handleViewProduct(product)}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => handleEditProduct(product)}
                            >
                              <Edit className="w-4 h-4 mr-1" />
                              Edit
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive" 
                              onClick={() => handleDeleteProduct(product.id)}
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="analytics" className="space-y-8">

              {/* ── Section 1: KPI Overview ── */}
              <div>
                <h2 className="text-lg font-semibold text-muted-foreground uppercase tracking-wide mb-4">Overview</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-6 text-center">
                      <Users2 className="w-8 h-8 text-accent mx-auto mb-2" />
                      <h3 className="font-semibold mb-1">Total Users</h3>
                      <p className="text-2xl font-bold text-accent">{analyticsData.totalMarketplaceUsers}</p>
                      <div className="flex items-center justify-center mt-1">
                        {analyticsData.userGrowth.growth > 0 ? (
                          <ArrowUp className="w-3 h-3 text-primary mr-1" />
                        ) : (
                          <ArrowDown className="w-3 h-3 text-destructive mr-1" />
                        )}
                        <span className={`text-xs ${analyticsData.userGrowth.growth > 0 ? 'text-primary' : 'text-destructive'}`}>
                          {analyticsData.userGrowth.growth.toFixed(1)}% vs last month
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6 text-center">
                      <Activity className="w-8 h-8 text-primary mx-auto mb-2" />
                      <h3 className="font-semibold mb-1">Active Users</h3>
                      <p className="text-2xl font-bold text-primary">{analyticsData.activeUsers}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {analyticsData.totalMarketplaceUsers > 0
                          ? Math.round((analyticsData.activeUsers / analyticsData.totalMarketplaceUsers) * 100)
                          : 0}% of total
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6 text-center">
                      <ShoppingCart className="w-8 h-8 text-farm-brown mx-auto mb-2" />
                      <h3 className="font-semibold mb-1">Total Orders</h3>
                      <p className="text-2xl font-bold text-farm-brown">{analyticsData.businessMetrics.totalOrders}</p>
                      <p className="text-xs text-muted-foreground mt-1">R{analyticsData.businessMetrics.averageOrderValue} avg value</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6 text-center">
                      <DollarSign className="w-8 h-8 text-secondary mx-auto mb-2" />
                      <h3 className="font-semibold mb-1">Revenue</h3>
                      <p className="text-2xl font-bold text-secondary">
                        R{(analyticsData.businessMetrics.totalRevenue / 1000000).toFixed(2)}M
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">{analyticsData.businessMetrics.conversionRate}% conversion</p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* ── Section 2: Users ── */}
              <div>
                <h2 className="text-lg font-semibold text-muted-foreground uppercase tracking-wide mb-4">Users</h2>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Role Distribution */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center text-base">
                        <PieChart className="w-4 h-4 mr-2" />
                        Role Distribution
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {analyticsData.roleDistribution.map((role) => (
                          <div key={role.name} className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="w-3 h-3 rounded mr-2" style={{ backgroundColor: role.color }} />
                              <span className="text-sm font-medium">{role.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold">{role.value}</span>
                              <span className="text-xs text-muted-foreground w-8 text-right">
                                {analyticsData.totalMarketplaceUsers > 0
                                  ? Math.round((role.value / analyticsData.totalMarketplaceUsers) * 100)
                                  : 0}%
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Approval Status */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center text-base">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approval Status
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {[
                          { status: 'Approved', count: allUsers.filter(u => u.approvalStatus === 'approved').length, color: 'bg-primary', icon: CheckCircle },
                          { status: 'Pending',  count: allUsers.filter(u => u.approvalStatus === 'pending').length,  color: 'bg-secondary-foreground', icon: Clock },
                          { status: 'Rejected', count: allUsers.filter(u => u.approvalStatus === 'rejected').length, color: 'bg-destructive', icon: XCircle }
                        ].map((item) => {
                          const total = allUsers.filter(u => u.role !== 'admin').length;
                          const pct = total > 0 ? Math.round((item.count / total) * 100) : 0;
                          const Icon = item.icon;
                          return (
                            <div key={item.status} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                              <div className="flex items-center gap-2">
                                <div className={`w-6 h-6 ${item.color} rounded-full flex items-center justify-center`}>
                                  <Icon className="w-3 h-3 text-white" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium">{item.status}</p>
                                  <p className="text-xs text-muted-foreground">{pct}%</p>
                                </div>
                              </div>
                              <span className="text-xl font-bold">{item.count}</span>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Engagement */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center text-base">
                        <BarChart3 className="w-4 h-4 mr-2" />
                        Engagement
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {[
                          { label: 'Daily Active',   value: analyticsData.engagementMetrics.dailyActive },
                          { label: 'Weekly Active',  value: analyticsData.engagementMetrics.weeklyActive },
                          { label: 'Monthly Active', value: analyticsData.engagementMetrics.monthlyActive },
                          { label: 'Verified Emails',value: analyticsData.verifiedUsers },
                          { label: 'Approved',       value: analyticsData.approvedUsers },
                        ].map(({ label, value }) => (
                          <div key={label} className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">{label}</span>
                            <span className="font-bold">{value}</span>
                          </div>
                        ))}
                        <div className="pt-2 border-t flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Retention Rate</span>
                          <span className="font-bold text-primary">{analyticsData.engagementMetrics.retentionRate}%</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* ── Section 3: Business ── */}
              <div>
                <h2 className="text-lg font-semibold text-muted-foreground uppercase tracking-wide mb-4">Business</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center text-base">
                        <TrendingUp className="w-4 h-4 mr-2" />
                        Key Metrics
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {[
                          { label: 'Total Revenue',      value: `R${analyticsData.businessMetrics.totalRevenue.toLocaleString()}`, highlight: true },
                          { label: 'Total Orders',       value: analyticsData.businessMetrics.totalOrders },
                          { label: 'Avg Order Value',    value: `R${analyticsData.businessMetrics.averageOrderValue}` },
                          { label: 'Conversion Rate',    value: `${analyticsData.businessMetrics.conversionRate}%`, accent: true },
                        ].map(({ label, value, highlight, accent }) => (
                          <div key={label} className="flex justify-between items-center">
                            <span className="text-muted-foreground">{label}</span>
                            <span className={`text-lg font-bold ${highlight ? 'text-primary' : accent ? 'text-accent' : ''}`}>{value}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center text-base">
                        <Package className="w-4 h-4 mr-2" />
                        Top Categories
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {analyticsData.businessMetrics.topCategories.map((category) => (
                          <div key={category.name} className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded flex-shrink-0" style={{ backgroundColor: category.color }} />
                            <span className="text-sm font-medium flex-1">{category.name}</span>
                            <div className="w-28 bg-muted rounded-full h-2">
                              <div className="h-2 rounded-full" style={{ backgroundColor: category.color, width: `${category.value}%` }} />
                            </div>
                            <span className="text-sm font-bold w-10 text-right">{category.value}%</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* ── Section 4: Time Trends ── */}
              <div>
                <h2 className="text-lg font-semibold text-muted-foreground uppercase tracking-wide mb-4">Time Trends</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center text-base">
                        <Calendar className="w-4 h-4 mr-2" />
                        Weekly Order Trends
                      </CardTitle>
                      <CardDescription>Order volume and revenue by day</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {analyticsData.timeAnalytics.weeklyTrend.map((day) => {
                          const maxOrders = Math.max(...analyticsData.timeAnalytics.weeklyTrend.map(d => d.orders), 1);
                          return (
                            <div key={day.day} className="flex items-center gap-3">
                              <span className="text-sm font-medium w-10">{day.day}</span>
                              <div className="flex-1 bg-muted rounded-full h-2">
                                <div className="bg-accent h-2 rounded-full" style={{ width: `${(day.orders / maxOrders) * 100}%` }} />
                              </div>
                              <span className="text-xs text-muted-foreground w-6 text-right">{day.orders}</span>
                              <span className="text-sm font-bold text-primary w-20 text-right">R{day.revenue.toLocaleString()}</span>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center text-base">
                        <Clock className="w-4 h-4 mr-2" />
                        Hourly Activity
                      </CardTitle>
                      <CardDescription>User activity throughout the day</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {analyticsData.timeAnalytics.hourlyActivity.map((hour) => {
                          const maxUsers = Math.max(...analyticsData.timeAnalytics.hourlyActivity.map(h => h.users), 1);
                          return (
                            <div key={hour.hour} className="flex items-center gap-3">
                              <span className="text-sm font-medium w-10">{hour.hour}</span>
                              <div className="flex-1 bg-muted rounded-full h-2">
                                <div className="bg-primary h-2 rounded-full" style={{ width: `${(hour.users / maxUsers) * 100}%` }} />
                              </div>
                              <span className="text-xs text-muted-foreground w-14 text-right">{hour.users} users</span>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* ── Section 5: Geography & Farmers ── */}
              <div>
                <h2 className="text-lg font-semibold text-muted-foreground uppercase tracking-wide mb-4">Geography & Supply</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center text-base">
                        <MapPin className="w-4 h-4 mr-2" />
                        Geographic Distribution
                      </CardTitle>
                      <CardDescription>Users, orders and revenue by province</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {analyticsData.geographicData.map((province) => (
                          <div key={province.province} className="p-3 border rounded-lg">
                            <div className="flex justify-between items-center mb-2">
                              <h4 className="font-semibold text-sm">{province.province}</h4>
                              <span className="text-sm font-bold text-primary">R{(province.revenue / 1000).toFixed(0)}k</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                              <span>{province.users} users</span>
                              <span className="text-right">{province.orders} orders</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center text-base">
                        <Star className="w-4 h-4 mr-2" />
                        Farmer Performance
                      </CardTitle>
                      <CardDescription>Top performing farmers by orders and revenue</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {analyticsData.farmerPerformance.map((farmer) => (
                          <div key={farmer.name} className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <h4 className="font-semibold text-sm">{farmer.name}</h4>
                              <div className="flex items-center gap-1 mt-0.5">
                                <Star className="w-3 h-3 text-secondary-foreground fill-current" />
                                <span className="text-xs text-muted-foreground">{farmer.rating} · {farmer.products} products</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-4 text-center">
                              <div>
                                <p className="font-bold">{farmer.orders}</p>
                                <p className="text-xs text-muted-foreground">Orders</p>
                              </div>
                              <div>
                                <p className="font-bold text-primary">R{(farmer.revenue / 1000).toFixed(0)}k</p>
                                <p className="text-xs text-muted-foreground">Revenue</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* ── Section 6: Satisfaction, Devices & System ── */}
              <div>
                <h2 className="text-lg font-semibold text-muted-foreground uppercase tracking-wide mb-4">Satisfaction & System</h2>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Customer Satisfaction */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center text-base">
                        <Star className="w-4 h-4 mr-2" />
                        Customer Satisfaction
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {[
                          { label: 'Overall',         value: analyticsData.satisfactionMetrics.overallRating },
                          { label: 'Support',         value: analyticsData.satisfactionMetrics.customerSupportRating },
                          { label: 'Delivery',        value: analyticsData.satisfactionMetrics.deliveryRating },
                          { label: 'Product Quality', value: analyticsData.satisfactionMetrics.productQualityRating },
                        ].map(({ label, value }) => (
                          <div key={label} className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">{label}</span>
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`w-3 h-3 ${i < Math.floor(value) ? 'text-secondary-foreground fill-current' : 'text-muted'}`} />
                              ))}
                              <span className="text-sm font-bold ml-1">{value}</span>
                            </div>
                          </div>
                        ))}
                        <div className="pt-2 border-t space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Total Reviews</span>
                            <span className="font-bold">{analyticsData.satisfactionMetrics.totalReviews}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Response Rate</span>
                            <span className="font-bold text-primary">{String(analyticsData.satisfactionMetrics.responseRate)}%</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Device & Platform */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center text-base">
                        <Smartphone className="w-4 h-4 mr-2" />
                        Devices & Platforms
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          {[
                            { label: 'Mobile',  value: analyticsData.deviceAnalytics.mobile,  color: 'bg-accent' },
                            { label: 'Desktop', value: analyticsData.deviceAnalytics.desktop, color: 'bg-primary' },
                            { label: 'Tablet',  value: analyticsData.deviceAnalytics.tablet,  color: 'bg-farm-brown' },
                          ].map(({ label, value, color }) => (
                            <div key={label} className="flex items-center gap-3">
                              <span className="text-sm w-14">{label}</span>
                              <div className="flex-1 bg-muted rounded-full h-2">
                                <div className={`${color} h-2 rounded-full`} style={{ width: `${value}%` }} />
                              </div>
                              <span className="text-sm font-bold w-8 text-right">{value}%</span>
                            </div>
                          ))}
                        </div>
                        <div className="pt-2 border-t">
                          <p className="text-xs text-muted-foreground mb-2 font-semibold uppercase tracking-wide">Platforms</p>
                          <div className="grid grid-cols-2 gap-1">
                            {Object.entries(analyticsData.deviceAnalytics.platforms).map(([platform, pct]) => (
                              <div key={platform} className="flex justify-between text-sm">
                                <span className="text-muted-foreground capitalize">{platform}</span>
                                <span className="font-bold">{pct}%</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* System Performance */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center text-base">
                        <Zap className="w-4 h-4 mr-2" />
                        System Performance
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="space-y-2">
                          {[
                            { label: 'Avg Response',    value: `${analyticsData.performanceMetrics.averageResponseTime}s` },
                            { label: 'Server Response', value: `${analyticsData.performanceMetrics.serverResponseTime}s`, highlight: true },
                            { label: 'Load Time',       value: `${analyticsData.performanceMetrics.averageLoadTime}s` },
                            { label: 'System Uptime',   value: `${analyticsData.performanceMetrics.systemUptime}%`, highlight: true },
                            { label: 'Error Rate',      value: `${analyticsData.performanceMetrics.errorRate}%`, danger: true },
                            { label: 'Peak Concurrent', value: analyticsData.performanceMetrics.peakConcurrentUsers },
                          ].map(({ label, value, highlight, danger }) => (
                            <div key={label} className="flex justify-between text-sm">
                              <span className="text-muted-foreground">{label}</span>
                              <span className={`font-bold ${highlight ? 'text-primary' : danger ? 'text-destructive' : ''}`}>{value}</span>
                            </div>
                          ))}
                        </div>
                        <div className="pt-2 border-t space-y-1">
                          {['All Systems Operational', 'Database Healthy', 'API Responsive'].map(s => (
                            <div key={s} className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-primary rounded-full" />
                              <span className="text-xs text-muted-foreground">{s}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

            </TabsContent>

            <TabsContent value="platform" className="space-y-6">
              {/* Platform Header */}
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold">Platform Configuration</h2>
                  <p className="text-muted-foreground">Manage platform settings and preferences</p>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" onClick={handleResetSettings}>
                    <Settings className="w-4 h-4 mr-2" />
                    Reset to Defaults
                  </Button>
                  <Button onClick={handleSaveSettings} disabled={savePlatformConfigMutation.isPending}>
                    <Save className="w-4 h-4 mr-2" />
                    {savePlatformConfigMutation.isPending ? "Saving..." : "Save All Settings"}
                  </Button>
                </div>
              </div>

              {/* General Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Globe2 className="w-5 h-5 mr-2" />
                    General Settings
                  </CardTitle>
                  <CardDescription>Basic platform configuration</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Platform Name</label>
                      <input
                        type="text"
                        value={platformSettings.general.platformName}
                        onChange={(e) => handleSettingChange('general', 'platformName', e.target.value)}
                        className="w-full mt-1 px-3 py-2 border rounded-md"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Platform Version</label>
                      <input
                        type="text"
                        value={platformSettings.general.platformVersion}
                        onChange={(e) => handleSettingChange('general', 'platformVersion', e.target.value)}
                        className="w-full mt-1 px-3 py-2 border rounded-md"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Default User Role</label>
                      <select
                        value={platformSettings.general.defaultUserRole}
                        onChange={(e) => handleSettingChange('general', 'defaultUserRole', e.target.value)}
                        className="w-full mt-1 px-3 py-2 border rounded-md"
                      >
                        <option value="household">Household</option>
                        <option value="b2b">B2B</option>
                        <option value="farmer">Farmer</option>
                        <option value="vendor">Vendor</option>
                      </select>
                    </div>
                    <div className="flex items-center space-x-4">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={platformSettings.general.maintenanceMode}
                          onChange={(e) => handleSettingChange('general', 'maintenanceMode', e.target.checked)}
                          className="mr-2"
                        />
                        <span className="text-sm font-medium">Maintenance Mode</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={platformSettings.general.allowRegistration}
                          onChange={(e) => handleSettingChange('general', 'allowRegistration', e.target.checked)}
                          className="mr-2"
                        />
                        <span className="text-sm font-medium">Allow Registration</span>
                      </label>
                    </div>
                    <div className="flex items-center space-x-4">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={platformSettings.general.requireEmailVerification}
                          onChange={(e) => handleSettingChange('general', 'requireEmailVerification', e.target.checked)}
                          className="mr-2"
                        />
                        <span className="text-sm font-medium">Require Email Verification</span>
                      </label>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CreditCard className="w-5 h-5 mr-2" />
                    Payment Settings
                  </CardTitle>
                  <CardDescription>Configure payment processing and options</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-4">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={platformSettings.payment.enablePayments}
                          onChange={(e) => handleSettingChange('payment', 'enablePayments', e.target.checked)}
                          className="mr-2"
                        />
                        <span className="text-sm font-medium">Enable Payments</span>
                      </label>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Payment Gateway</label>
                      <select
                        value={platformSettings.payment.paymentGateway}
                        onChange={(e) => handleSettingChange('payment', 'paymentGateway', e.target.value)}
                        className="w-full mt-1 px-3 py-2 border rounded-md"
                      >
                        <option value="stripe">Stripe</option>
                        <option value="paypal">PayPal</option>
                        <option value="payfast">PayFast</option>
                        <option value="yoco">Yoco</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Currency</label>
                      <select
                        value={platformSettings.payment.currency}
                        onChange={(e) => handleSettingChange('payment', 'currency', e.target.value)}
                        className="w-full mt-1 px-3 py-2 border rounded-md"
                      >
                        <option value="ZAR">South African Rand (ZAR)</option>
                        <option value="USD">US Dollar (USD)</option>
                        <option value="EUR">Euro (EUR)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Commission Rate (%)</label>
                      <input
                        type="number"
                        value={platformSettings.payment.commissionRate}
                        onChange={(e) => handleSettingChange('payment', 'commissionRate', parseFloat(e.target.value))}
                        className="w-full mt-1 px-3 py-2 border rounded-md"
                        min="0"
                        max="100"
                        step="0.1"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Minimum Order Amount (R)</label>
                      <input
                        type="number"
                        value={platformSettings.payment.minimumOrderAmount}
                        onChange={(e) => handleSettingChange('payment', 'minimumOrderAmount', parseFloat(e.target.value))}
                        className="w-full mt-1 px-3 py-2 border rounded-md"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Maximum Order Amount (R)</label>
                      <input
                        type="number"
                        value={platformSettings.payment.maximumOrderAmount}
                        onChange={(e) => handleSettingChange('payment', 'maximumOrderAmount', parseFloat(e.target.value))}
                        className="w-full mt-1 px-3 py-2 border rounded-md"
                        min="0"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Payment Methods</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                      {['credit_card', 'debit_card', 'bank_transfer', 'cash_on_delivery'].map(method => (
                        <label key={method} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={platformSettings.payment.paymentMethods.includes(method)}
                            onChange={(e) => {
                              const methods = e.target.checked
                                ? [...platformSettings.payment.paymentMethods, method]
                                : platformSettings.payment.paymentMethods.filter((m: any) => m !== method);
                              handleSettingChange('payment', 'paymentMethods', methods);
                            }}
                            className="mr-2"
                          />
                          <span className="text-sm">{method.replace('_', ' ').toUpperCase()}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Shipping Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Truck className="w-5 h-5 mr-2" />
                    Shipping Settings
                  </CardTitle>
                  <CardDescription>Configure shipping and delivery options</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-4">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={platformSettings.shipping.enableShipping}
                          onChange={(e) => handleSettingChange('shipping', 'enableShipping', e.target.checked)}
                          className="mr-2"
                        />
                        <span className="text-sm font-medium">Enable Shipping</span>
                      </label>
                    </div>
                    <div className="flex items-center space-x-4">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={platformSettings.shipping.enableExpressDelivery}
                          onChange={(e) => handleSettingChange('shipping', 'enableExpressDelivery', e.target.checked)}
                          className="mr-2"
                        />
                        <span className="text-sm font-medium">Enable Express Delivery</span>
                      </label>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Free Shipping Threshold (R)</label>
                      <input
                        type="number"
                        value={platformSettings.shipping.freeShippingThreshold}
                        onChange={(e) => handleSettingChange('shipping', 'freeShippingThreshold', parseFloat(e.target.value))}
                        className="w-full mt-1 px-3 py-2 border rounded-md"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Default Shipping Cost (R)</label>
                      <input
                        type="number"
                        value={platformSettings.shipping.defaultShippingCost}
                        onChange={(e) => handleSettingChange('shipping', 'defaultShippingCost', parseFloat(e.target.value))}
                        className="w-full mt-1 px-3 py-2 border rounded-md"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Express Delivery Cost (R)</label>
                      <input
                        type="number"
                        value={platformSettings.shipping.expressDeliveryCost}
                        onChange={(e) => handleSettingChange('shipping', 'expressDeliveryCost', parseFloat(e.target.value))}
                        className="w-full mt-1 px-3 py-2 border rounded-md"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Delivery Time</label>
                      <input
                        type="text"
                        value={platformSettings.shipping.deliveryTime}
                        onChange={(e) => handleSettingChange('shipping', 'deliveryTime', e.target.value)}
                        className="w-full mt-1 px-3 py-2 border rounded-md"
                        placeholder="e.g., 2-3 business days"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Shipping Zones</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                      {['gauteng', 'western_cape', 'kwazulu_natal', 'mpumalanga'].map(zone => (
                        <label key={zone} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={platformSettings.shipping.shippingZones.includes(zone)}
                            onChange={(e) => {
                              const zones = e.target.checked
                                ? [...platformSettings.shipping.shippingZones, zone]
                                : platformSettings.shipping.shippingZones.filter((z: any) => z !== zone);
                              handleSettingChange('shipping', 'shippingZones', zones);
                            }}
                            className="mr-2"
                          />
                          <span className="text-sm">{zone.replace('_', ' ').toUpperCase()}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Notification Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Bell className="w-5 h-5 mr-2" />
                    Notification Settings
                  </CardTitle>
                  <CardDescription>Configure email and push notifications</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <h4 className="font-semibold">Notification Channels</h4>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={platformSettings.notifications.emailNotifications}
                          onChange={(e) => handleSettingChange('notifications', 'emailNotifications', e.target.checked)}
                          className="mr-2"
                        />
                        <span className="text-sm">Email Notifications</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={platformSettings.notifications.smsNotifications}
                          onChange={(e) => handleSettingChange('notifications', 'smsNotifications', e.target.checked)}
                          className="mr-2"
                        />
                        <span className="text-sm">SMS Notifications</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={platformSettings.notifications.pushNotifications}
                          onChange={(e) => handleSettingChange('notifications', 'pushNotifications', e.target.checked)}
                          className="mr-2"
                        />
                        <span className="text-sm">Push Notifications</span>
                      </label>
                    </div>
                    <div className="space-y-3">
                      <h4 className="font-semibold">Email Types</h4>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={platformSettings.notifications.orderConfirmationEmail}
                          onChange={(e) => handleSettingChange('notifications', 'orderConfirmationEmail', e.target.checked)}
                          className="mr-2"
                        />
                        <span className="text-sm">Order Confirmation</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={platformSettings.notifications.shippingUpdateEmail}
                          onChange={(e) => handleSettingChange('notifications', 'shippingUpdateEmail', e.target.checked)}
                          className="mr-2"
                        />
                        <span className="text-sm">Shipping Updates</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={platformSettings.notifications.promotionalEmails}
                          onChange={(e) => handleSettingChange('notifications', 'promotionalEmails', e.target.checked)}
                          className="mr-2"
                        />
                        <span className="text-sm">Promotional Emails</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={platformSettings.notifications.adminAlerts}
                          onChange={(e) => handleSettingChange('notifications', 'adminAlerts', e.target.checked)}
                          className="mr-2"
                        />
                        <span className="text-sm">Admin Alerts</span>
                      </label>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Security Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="w-5 h-5 mr-2" />
                    Security Settings
                  </CardTitle>
                  <CardDescription>Configure security and authentication options</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <h4 className="font-semibold">Authentication</h4>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={platformSettings.security.enableTwoFactor}
                          onChange={(e) => handleSettingChange('security', 'enableTwoFactor', e.target.checked)}
                          className="mr-2"
                        />
                        <span className="text-sm">Enable Two-Factor Authentication</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={platformSettings.security.requireStrongPassword}
                          onChange={(e) => handleSettingChange('security', 'requireStrongPassword', e.target.checked)}
                          className="mr-2"
                        />
                        <span className="text-sm">Require Strong Passwords</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={platformSettings.security.enableCaptcha}
                          onChange={(e) => handleSettingChange('security', 'enableCaptcha', e.target.checked)}
                          className="mr-2"
                        />
                        <span className="text-sm">Enable CAPTCHA</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={platformSettings.security.logFailedAttempts}
                          onChange={(e) => handleSettingChange('security', 'logFailedAttempts', e.target.checked)}
                          className="mr-2"
                        />
                        <span className="text-sm">Log Failed Login Attempts</span>
                      </label>
                    </div>
                    <div className="space-y-3">
                      <h4 className="font-semibold">Security Limits</h4>
                      <div>
                        <label className="text-sm">Session Timeout (hours)</label>
                        <input
                          type="number"
                          value={platformSettings.security.sessionTimeout}
                          onChange={(e) => handleSettingChange('security', 'sessionTimeout', parseInt(e.target.value))}
                          className="w-full mt-1 px-3 py-2 border rounded-md"
                          min="1"
                          max="168"
                        />
                      </div>
                      <div>
                        <label className="text-sm">Max Login Attempts</label>
                        <input
                          type="number"
                          value={platformSettings.security.maxLoginAttempts}
                          onChange={(e) => handleSettingChange('security', 'maxLoginAttempts', parseInt(e.target.value))}
                          className="w-full mt-1 px-3 py-2 border rounded-md"
                          min="3"
                          max="10"
                        />
                      </div>
                      <div>
                        <label className="text-sm">Password Min Length</label>
                        <input
                          type="number"
                          value={platformSettings.security.passwordMinLength}
                          onChange={(e) => handleSettingChange('security', 'passwordMinLength', parseInt(e.target.value))}
                          className="w-full mt-1 px-3 py-2 border rounded-md"
                          min="6"
                          max="20"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Marketplace Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Store className="w-5 h-5 mr-2" />
                    Marketplace Settings
                  </CardTitle>
                  <CardDescription>Configure marketplace features and options</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <h4 className="font-semibold">Product Features</h4>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={platformSettings.marketplace.enableReviews}
                          onChange={(e) => handleSettingChange('marketplace', 'enableReviews', e.target.checked)}
                          className="mr-2"
                        />
                        <span className="text-sm">Enable Product Reviews</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={platformSettings.marketplace.allowMultipleImages}
                          onChange={(e) => handleSettingChange('marketplace', 'allowMultipleImages', e.target.checked)}
                          className="mr-2"
                        />
                        <span className="text-sm">Allow Multiple Images</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={platformSettings.marketplace.enableWishlist}
                          onChange={(e) => handleSettingChange('marketplace', 'enableWishlist', e.target.checked)}
                          className="mr-2"
                        />
                        <span className="text-sm">Enable Wishlist</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={platformSettings.marketplace.enableCompare}
                          onChange={(e) => handleSettingChange('marketplace', 'enableCompare', e.target.checked)}
                          className="mr-2"
                        />
                        <span className="text-sm">Enable Product Compare</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={platformSettings.marketplace.enableChat}
                          onChange={(e) => handleSettingChange('marketplace', 'enableChat', e.target.checked)}
                          className="mr-2"
                        />
                        <span className="text-sm">Enable Farmer Chat</span>
                      </label>
                    </div>
                    <div className="space-y-3">
                      <h4 className="font-semibold">Approval & Limits</h4>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={platformSettings.marketplace.requireApproval}
                          onChange={(e) => handleSettingChange('marketplace', 'requireApproval', e.target.checked)}
                          className="mr-2"
                        />
                        <span className="text-sm">Require Product Approval</span>
                      </label>
                      <div>
                        <label className="text-sm">Max Images Per Product</label>
                        <input
                          type="number"
                          value={platformSettings.marketplace.maxImagesPerProduct}
                          onChange={(e) => handleSettingChange('marketplace', 'maxImagesPerProduct', parseInt(e.target.value))}
                          className="w-full mt-1 px-3 py-2 border rounded-md"
                          min="1"
                          max="10"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Business Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Building className="w-5 h-5 mr-2" />
                    Business Information
                  </CardTitle>
                  <CardDescription>Configure business details and contact information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <h4 className="font-semibold">Basic Information</h4>
                      <div>
                        <label className="text-sm">Business Name</label>
                        <input
                          type="text"
                          value={platformSettings.business?.businessName || 'Kotulo'}
                          onChange={(e) => handleSettingChange('business', 'businessName', e.target.value)}
                          className="w-full mt-1 px-3 py-2 border rounded-md"
                        />
                      </div>
                      <div>
                        <label className="text-sm">Business Email</label>
                        <input
                          type="email"
                          value={platformSettings.business?.businessEmail || 'support@kotulo.co.za'}
                          onChange={(e) => handleSettingChange('business', 'businessEmail', e.target.value)}
                          className="w-full mt-1 px-3 py-2 border rounded-md"
                        />
                      </div>
                      <div>
                        <label className="text-sm">Business Phone</label>
                        <input
                          type="tel"
                          value={platformSettings.business?.businessPhone || '+27 12 345 6789'}
                          onChange={(e) => handleSettingChange('business', 'businessPhone', e.target.value)}
                          className="w-full mt-1 px-3 py-2 border rounded-md"
                        />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <h4 className="font-semibold">Location & Tax</h4>
                      <div>
                        <label className="text-sm">Business Address</label>
                        <input
                          type="text"
                          value={platformSettings.business?.businessAddress || '123 Farm Street, Johannesburg, South Africa'}
                          onChange={(e) => handleSettingChange('business', 'businessAddress', e.target.value)}
                          className="w-full mt-1 px-3 py-2 border rounded-md"
                        />
                      </div>
                      <div>
                        <label className="text-sm">Tax Number</label>
                        <input
                          type="text"
                          value={platformSettings.business?.taxNumber || 'ZA123456789'}
                          onChange={(e) => handleSettingChange('business', 'taxNumber', e.target.value)}
                          className="w-full mt-1 px-3 py-2 border rounded-md"
                        />
                      </div>
                      <div>
                        <label className="text-sm">VAT Rate (%)</label>
                        <input
                          type="number"
                          value={platformSettings.business?.vatRate || 15}
                          onChange={(e) => handleSettingChange('business', 'vatRate', parseInt(e.target.value))}
                          className="w-full mt-1 px-3 py-2 border rounded-md"
                          min="0"
                          max="30"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <h4 className="font-semibold">Operating Hours</h4>
                      <div>
                        <label className="text-sm">Business Hours</label>
                        <input
                          type="text"
                          value={platformSettings.business?.businessHours || 'Mon-Fri: 8AM-6PM, Sat: 8AM-2PM'}
                          onChange={(e) => handleSettingChange('business', 'businessHours', e.target.value)}
                          className="w-full mt-1 px-3 py-2 border rounded-md"
                          placeholder="Mon-Fri: 8AM-6PM, Sat: 8AM-2PM"
                        />
                      </div>
                      <div>
                        <label className="text-sm">Time Zone</label>
                        <select
                          value={platformSettings.business?.timeZone || 'Africa/Johannesburg'}
                          onChange={(e) => handleSettingChange('business', 'timeZone', e.target.value)}
                          className="w-full mt-1 px-3 py-2 border rounded-md"
                        >
                          <option value="Africa/Johannesburg">Africa/Johannesburg</option>
                          <option value="Africa/Cairo">Africa/Cairo</option>
                          <option value="Europe/London">Europe/London</option>
                          <option value="America/New_York">America/New_York</option>
                          <option value="Asia/Tokyo">Asia/Tokyo</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Third-Party Integrations */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Globe className="w-5 h-5 mr-2" />
                    Third-Party Integrations
                  </CardTitle>
                  <CardDescription>Configure external services and analytics</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <h4 className="font-semibold">Analytics & Tracking</h4>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={platformSettings.integrations?.enableGoogleAnalytics || false}
                          onChange={(e) => handleSettingChange('integrations', 'enableGoogleAnalytics', e.target.checked)}
                          className="mr-2"
                        />
                        <span className="text-sm">Google Analytics</span>
                      </label>
                      {platformSettings.integrations?.enableGoogleAnalytics && (
                        <div>
                          <label className="text-sm">Google Analytics ID</label>
                          <input
                            type="text"
                            value={platformSettings.integrations?.googleAnalyticsId || ''}
                            onChange={(e) => handleSettingChange('integrations', 'googleAnalyticsId', e.target.value)}
                            className="w-full mt-1 px-3 py-2 border rounded-md"
                            placeholder="G-XXXXXXXXXX"
                          />
                        </div>
                      )}
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={platformSettings.integrations?.enableFacebookPixel || false}
                          onChange={(e) => handleSettingChange('integrations', 'enableFacebookPixel', e.target.checked)}
                          className="mr-2"
                        />
                        <span className="text-sm">Facebook Pixel</span>
                      </label>
                      {platformSettings.integrations?.enableFacebookPixel && (
                        <div>
                          <label className="text-sm">Facebook Pixel ID</label>
                          <input
                            type="text"
                            value={platformSettings.integrations?.facebookPixelId || ''}
                            onChange={(e) => handleSettingChange('integrations', 'facebookPixelId', e.target.value)}
                            className="w-full mt-1 px-3 py-2 border rounded-md"
                            placeholder="XXXXXXXXXXXXXXXX"
                          />
                        </div>
                      )}
                    </div>
                    <div className="space-y-3">
                      <h4 className="font-semibold">Communication Services</h4>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={platformSettings.integrations?.enableEmailService || true}
                          onChange={(e) => handleSettingChange('integrations', 'enableEmailService', e.target.checked)}
                          className="mr-2"
                        />
                        <span className="text-sm">Email Service</span>
                      </label>
                      {platformSettings.integrations?.enableEmailService && (
                        <div>
                          <label className="text-sm">Email Provider</label>
                          <select
                            value={platformSettings.integrations?.emailServiceProvider || 'sendgrid'}
                            onChange={(e) => handleSettingChange('integrations', 'emailServiceProvider', e.target.value)}
                            className="w-full mt-1 px-3 py-2 border rounded-md"
                          >
                            <option value="sendgrid">SendGrid</option>
                            <option value="ses">AWS SES</option>
                            <option value="mailgun">Mailgun</option>
                          </select>
                        </div>
                      )}
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={platformSettings.integrations?.enableSMSService || false}
                          onChange={(e) => handleSettingChange('integrations', 'enableSMSService', e.target.checked)}
                          className="mr-2"
                        />
                        <span className="text-sm">SMS Service</span>
                      </label>
                      {platformSettings.integrations?.enableSMSService && (
                        <div>
                          <label className="text-sm">SMS Provider</label>
                          <select
                            value={platformSettings.integrations?.smsProvider || 'twilio'}
                            onChange={(e) => handleSettingChange('integrations', 'smsProvider', e.target.value)}
                            className="w-full mt-1 px-3 py-2 border rounded-md"
                          >
                            <option value="twilio">Twilio</option>
                            <option value="aws-sns">AWS SNS</option>
                          </select>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <h4 className="font-semibold">Payment Webhooks</h4>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={platformSettings.integrations?.enablePaymentWebhooks || false}
                          onChange={(e) => handleSettingChange('integrations', 'enablePaymentWebhooks', e.target.checked)}
                          className="mr-2"
                        />
                        <span className="text-sm">Payment Webhooks</span>
                      </label>
                      {platformSettings.integrations?.enablePaymentWebhooks && (
                        <div>
                          <label className="text-sm">Webhook URL</label>
                          <input
                            type="url"
                            value={platformSettings.integrations?.webhookUrl || ''}
                            onChange={(e) => handleSettingChange('integrations', 'webhookUrl', e.target.value)}
                            className="w-full mt-1 px-3 py-2 border rounded-md"
                            placeholder="https://example.com/webhook"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Advanced Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Zap className="w-5 h-5 mr-2" />
                    Performance Analytics
                  </CardTitle>
                  <CardDescription>Advanced platform configuration and performance settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <h4 className="font-semibold">Debug & Monitoring</h4>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={platformSettings.advanced?.enableDebugMode || false}
                          onChange={(e) => handleSettingChange('advanced', 'enableDebugMode', e.target.checked)}
                          className="mr-2"
                        />
                        <span className="text-sm">Debug Mode</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={platformSettings.advanced?.enableAPILogging || false}
                          onChange={(e) => handleSettingChange('advanced', 'enableAPILogging', e.target.checked)}
                          className="mr-2"
                        />
                        <span className="text-sm">API Logging</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={platformSettings.advanced?.enablePerformanceMonitoring || true}
                          onChange={(e) => handleSettingChange('advanced', 'enablePerformanceMonitoring', e.target.checked)}
                          className="mr-2"
                        />
                        <span className="text-sm">Performance Monitoring</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={platformSettings.advanced?.enableErrorTracking || true}
                          onChange={(e) => handleSettingChange('advanced', 'enableErrorTracking', e.target.checked)}
                          className="mr-2"
                        />
                        <span className="text-sm">Error Tracking</span>
                      </label>
                    </div>
                    <div className="space-y-3">
                      <h4 className="font-semibold">Backup & Storage</h4>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={platformSettings.advanced?.enableBackupAutomation || true}
                          onChange={(e) => handleSettingChange('advanced', 'enableBackupAutomation', e.target.checked)}
                          className="mr-2"
                        />
                        <span className="text-sm">Automated Backups</span>
                      </label>
                      {platformSettings.advanced?.enableBackupAutomation && (
                        <div>
                          <label className="text-sm">Backup Frequency</label>
                          <select
                            value={platformSettings.advanced?.backupFrequency || 'daily'}
                            onChange={(e) => handleSettingChange('advanced', 'backupFrequency', e.target.value)}
                            className="w-full mt-1 px-3 py-2 border rounded-md"
                          >
                            <option value="hourly">Hourly</option>
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                          </select>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <h4 className="font-semibold">Performance Optimization</h4>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={platformSettings.advanced?.enableCDN || false}
                          onChange={(e) => handleSettingChange('advanced', 'enableCDN', e.target.checked)}
                          className="mr-2"
                        />
                        <span className="text-sm">Enable CDN</span>
                      </label>
                      {platformSettings.advanced?.enableCDN && (
                        <div>
                          <label className="text-sm">CDN URL</label>
                          <input
                            type="url"
                            value={platformSettings.advanced?.cdnUrl || ''}
                            onChange={(e) => handleSettingChange('advanced', 'cdnUrl', e.target.value)}
                            className="w-full mt-1 px-3 py-2 border rounded-md"
                            placeholder="https://cdn.example.com"
                          />
                        </div>
                      )}
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={platformSettings.advanced?.enableCaching || true}
                          onChange={(e) => handleSettingChange('advanced', 'enableCaching', e.target.checked)}
                          className="mr-2"
                        />
                        <span className="text-sm">Enable Caching</span>
                      </label>
                      {platformSettings.advanced?.enableCaching && (
                        <div>
                          <label className="text-sm">Cache Timeout (seconds)</label>
                          <input
                            type="number"
                            value={platformSettings.advanced?.cacheTimeout || 3600}
                            onChange={(e) => handleSettingChange('advanced', 'cacheTimeout', parseInt(e.target.value))}
                            className="w-full mt-1 px-3 py-2 border rounded-md"
                            min="60"
                            max="86400"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="orders" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>All Orders</CardTitle>
                  <CardDescription>View and manage all customer orders</CardDescription>
                </CardHeader>
                <CardContent>
                  {allOrders.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No orders yet</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {allOrders.map((order: any) => (
                        <div key={order.id} className="border rounded-lg p-4 hover:bg-muted/30 transition-colors">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                                <p className="font-semibold">{order.customerName}</p>
                                <p className="text-sm text-muted-foreground">{order.customerEmail} • {order.customerPhone}</p>
                                <p className="text-sm text-muted-foreground">{order.deliveryAddress}</p>                            
			    </div>
                            <div className="text-right">
                              <p className="text-xl font-bold text-primary">R{parseFloat(order.total || "0").toFixed(2)}</p>
                              <p className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleDateString("en-ZA")}</p>
                              <Badge variant={
                                order.status === "delivered" ? "default" :
                                order.status === "cancelled" ? "destructive" : "secondary"
                              }>
                                {order.status}
                              </Badge>
                              <Select
                                value={order.status}
                                onValueChange={(status) => updateOrderStatusMutation.mutate({ orderId: order.id, status })}
                              >
                                <SelectTrigger className="w-40 h-7 text-xs mt-1">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pending">Pending</SelectItem>
                                  <SelectItem value="confirmed">Confirmed</SelectItem>
                                  <SelectItem value="preparing">Preparing</SelectItem>
                                  <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                                  <SelectItem value="delivered">Delivered</SelectItem>
                                  <SelectItem value="cancelled">Cancelled</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div className="border-t pt-3">
                            <p className="text-sm font-medium mb-2">Items Ordered:</p>
                            <div className="space-y-1">
                              {(order.items || []).map((item: any, index: number) => (
                                <div key={index} className="flex justify-between text-sm">
                                  <span>{item.name} × {item.quantity} {item.unit}</span>
                                  <span className="font-medium">R{(parseFloat(item.price) * item.quantity).toFixed(2)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="monitoring" className="space-y-6">
              {/* System Health Header */}
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold">System Health</h2>
                  <p className="text-muted-foreground">Live metrics from the Node.js process — refreshes every 30s</p>
                </div>
                <Button onClick={handleRefreshHealth} className="flex items-center" disabled={healthLoading}>
                  <RefreshCw className={`w-4 h-4 mr-2 ${healthLoading ? 'animate-spin' : ''}`} />
                  {healthLoading ? 'Loading...' : 'Refresh'}
                </Button>
              </div>

              {!systemHealth && !healthLoading && (
                <Card>
                  <CardContent className="p-6 text-center text-muted-foreground">
                    Failed to load health data. Is the server running?
                  </CardContent>
                </Card>
              )}

              {/* KPI Overview */}
              {systemHealth && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="border-l-4 border-l-primary">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground">Server Status</p>
                            <p className="text-2xl font-bold text-primary">Healthy</p>
                            <p className="text-xs text-muted-foreground">Uptime: {systemHealth.server.uptime}</p>
                          </div>
                          <Server className="w-8 h-8 text-primary" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-primary">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground">Heap Used</p>
                            <p className="text-2xl font-bold text-primary">{systemHealth.memory.usedMB} MB</p>
                            <p className="text-xs text-muted-foreground">of {systemHealth.memory.totalMB} MB heap</p>
                          </div>
                          <MemoryStick className="w-8 h-8 text-primary" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-secondary-foreground">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground">System Memory</p>
                            <p className="text-2xl font-bold text-secondary-foreground">{systemHealth.memory.percentage}%</p>
                            <p className="text-xs text-muted-foreground">{systemHealth.memory.systemUsedGB} GB / {systemHealth.memory.systemTotalGB} GB</p>
                          </div>
                          <Activity className="w-8 h-8 text-secondary-foreground" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-secondary-foreground">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground">CPU Usage</p>
                            <p className="text-2xl font-bold text-secondary-foreground">{systemHealth.cpu.usage}%</p>
                            <p className="text-xs text-muted-foreground">{systemHealth.cpu.cores} cores · {systemHealth.cpu.model.split(' ').slice(0, 3).join(' ')}</p>
                          </div>
                          <Cpu className="w-8 h-8 text-secondary-foreground" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Detailed metrics */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Server Info */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center"><Server className="w-5 h-5 mr-2" />Server</CardTitle>
                        <CardDescription>Node.js process information</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between"><span className="text-sm text-muted-foreground">Status</span><span className="font-semibold text-primary">Healthy</span></div>
                        <div className="flex justify-between"><span className="text-sm text-muted-foreground">Uptime</span><span className="font-semibold">{systemHealth.server.uptime}</span></div>
                        <div className="flex justify-between"><span className="text-sm text-muted-foreground">Started At</span><span className="font-semibold">{new Date(systemHealth.server.startedAt).toLocaleString()}</span></div>
                        <div className="flex justify-between"><span className="text-sm text-muted-foreground">Node.js Version</span><span className="font-semibold">{systemHealth.server.nodeVersion}</span></div>
                        <div className="flex justify-between"><span className="text-sm text-muted-foreground">Platform</span><span className="font-semibold">{systemHealth.server.platform}</span></div>
                        <div className="flex justify-between"><span className="text-sm text-muted-foreground">RSS Memory</span><span className="font-semibold">{systemHealth.memory.rss} MB</span></div>
                      </CardContent>
                    </Card>

                    {/* CPU & Memory */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center"><Cpu className="w-5 h-5 mr-2" />CPU & Memory</CardTitle>
                        <CardDescription>Real-time resource utilisation</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm text-muted-foreground">CPU Usage</span>
                            <span className="font-semibold">{systemHealth.cpu.usage}%</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div className="bg-secondary-foreground h-2 rounded-full" style={{ width: `${systemHealth.cpu.usage}%` }} />
                          </div>
                        </div>
                        <div className="flex justify-between"><span className="text-sm text-muted-foreground">Cores</span><span className="font-semibold">{systemHealth.cpu.cores}</span></div>
                        <div className="flex justify-between"><span className="text-sm text-muted-foreground">Load Average (1m / 5m / 15m)</span><span className="font-semibold">{systemHealth.cpu.loadAverage.join(' / ')}</span></div>
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm text-muted-foreground">System Memory</span>
                            <span className="font-semibold">{systemHealth.memory.percentage}%</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div className="bg-primary h-2 rounded-full" style={{ width: `${systemHealth.memory.percentage}%` }} />
                          </div>
                        </div>
                        <div className="flex justify-between"><span className="text-sm text-muted-foreground">Free System Memory</span><span className="font-semibold">{systemHealth.memory.systemFreeGB} GB</span></div>
                      </CardContent>
                    </Card>

                    {/* Database */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center"><Database className="w-5 h-5 mr-2" />Database</CardTitle>
                        <CardDescription>In-memory store record counts</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between"><span className="text-sm text-muted-foreground">Status</span><span className="font-semibold text-primary">Healthy</span></div>
                        <div className="flex justify-between"><span className="text-sm text-muted-foreground">Type</span><span className="font-semibold">{systemHealth.database.type}</span></div>
                        <div className="flex justify-between"><span className="text-sm text-muted-foreground">Users</span><span className="font-semibold">{systemHealth.database.users}</span></div>
                        <div className="flex justify-between"><span className="text-sm text-muted-foreground">Products</span><span className="font-semibold">{systemHealth.database.products}</span></div>
                        <div className="flex justify-between"><span className="text-sm text-muted-foreground">Orders</span><span className="font-semibold">{systemHealth.database.orders}</span></div>
                      </CardContent>
                    </Card>

                    {/* Heap breakdown */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center"><MemoryStick className="w-5 h-5 mr-2" />Process Memory</CardTitle>
                        <CardDescription>Node.js heap breakdown</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm text-muted-foreground">Heap Used</span>
                            <span className="font-semibold">{systemHealth.memory.usedMB} MB</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div className="bg-primary h-2 rounded-full" style={{ width: `${Math.min(100, (systemHealth.memory.usedMB / systemHealth.memory.totalMB) * 100)}%` }} />
                          </div>
                        </div>
                        <div className="flex justify-between"><span className="text-sm text-muted-foreground">Heap Total</span><span className="font-semibold">{systemHealth.memory.totalMB} MB</span></div>
                        <div className="flex justify-between"><span className="text-sm text-muted-foreground">RSS (Resident Set)</span><span className="font-semibold">{systemHealth.memory.rss} MB</span></div>
                      </CardContent>
                    </Card>
                  </div>
                </>
              )}
            </TabsContent>
          </Tabs>

          {/* View User Modal */}
          {showViewModal && selectedUser && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-card rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-2xl font-bold">User Details</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowViewModal(false)}
                  >
                    <XCircle className="w-5 h-5" />
                  </Button>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Name</label>
                      <p className="font-semibold">{selectedUser.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Email</label>
                      <p className="font-semibold">{selectedUser.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Phone</label>
                      <p className="font-semibold">{selectedUser.phone || "Not provided"}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Role</label>
                      <p className="font-semibold capitalize">{selectedUser.role}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Status</label>
                      <p className="font-semibold">
                        <Badge variant={selectedUser.approvalStatus === 'approved' ? 'default' : 'secondary'}>
                          {selectedUser.approvalStatus}
                        </Badge>
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Account Status</label>
                      <p className="font-semibold">
                        <Badge variant={selectedUser.isActive ? 'default' : 'destructive'}>
                          {selectedUser.isActive ? 'Active' : 'Suspended'}
                        </Badge>
                      </p>
                    </div>
                  </div>

                  {selectedUser.businessName && (
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Business Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Business Name</label>
                          <p className="font-semibold">{selectedUser.businessName}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Credit Limit</label>
                          <p className="font-semibold">
                            {selectedUser.creditLimit ? `R${selectedUser.creditLimit.toLocaleString()}` : 'Not set'}
                          </p>
                        </div>
                        {(selectedUser as any).businessRegistrationNumber && (
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Registration #</label>
                            <p className="font-semibold">{(selectedUser as any).businessRegistrationNumber}</p>
                          </div>
                        )}
                        {(selectedUser as any).taxId && (
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Tax ID</label>
                            <p className="font-semibold">{(selectedUser as any).taxId}</p>
                          </div>
                        )}
                        {(selectedUser as any).businessAddress && (
                          <div className="md:col-span-2">
                            <label className="text-sm font-medium text-muted-foreground">Business Address</label>
                            <p className="font-semibold">{(selectedUser as any).businessAddress}</p>
                          </div>
                        )}
                        {(selectedUser as any).businessDescription && (
                          <div className="md:col-span-2">
                            <label className="text-sm font-medium text-muted-foreground">Business Description</label>
                            <p className="font-semibold text-sm">{(selectedUser as any).businessDescription}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div>
                    <h3 className="text-lg font-semibold mb-2">Account Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Email Verified</label>
                        <p className="font-semibold">{selectedUser.emailVerified ? '✅ Yes' : '❌ No'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Joined Date</label>
                        <p className="font-semibold">{selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString() : 'Unknown'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Last Login</label>
                        <p className="font-semibold">
                          {selectedUser.lastLogin ? 
                            new Date(selectedUser.lastLogin).toLocaleDateString() : 
                            'Never'
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end mt-6">
                  <Button onClick={() => setShowViewModal(false)}>Close</Button>
                </div>
              </div>
            </div>
          )}

          {/* Edit User Modal */}
          {showEditModal && editUser && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-card rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-2xl font-bold">Edit User</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowEditModal(false)}
                  >
                    <XCircle className="w-5 h-5" />
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Name</label>
                      <input
                        type="text"
                        value={editUser.name}
                        onChange={(e) => setEditUser({ ...editUser, name: e.target.value })}
                        className="w-full p-2 border rounded-md"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Email</label>
                      <input
                        type="email"
                        value={editUser.email}
                        onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
                        className="w-full p-2 border rounded-md"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Phone</label>
                      <input
                        type="tel"
                        value={editUser.phone || ''}
                        onChange={(e) => setEditUser({ ...editUser, phone: e.target.value })}
                        className="w-full p-2 border rounded-md"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Business Name</label>
                      <input
                        type="text"
                        value={editUser.businessName || ''}
                        onChange={(e) => setEditUser({ ...editUser, businessName: e.target.value })}
                        className="w-full p-2 border rounded-md"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Credit Limit</label>
                      <input
                        type="number"
                        value={editUser.creditLimit || ''}
                        onChange={(e) => setEditUser({ ...editUser, creditLimit: e.target.value ? Number(e.target.value) : null as any })}
                        className="w-full p-2 border rounded-md"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Role</label>
                      <select
                        value={editUser.role}
                        onChange={(e) => setEditUser({ ...editUser, role: e.target.value as any })}
                        className="w-full p-2 border rounded-md"
                      >
                        <option value="household">Household</option>
                        <option value="b2b">B2B</option>
                        <option value="vendor">Vendor</option>
                        <option value="farmer">Farmer</option>
                        <option value="operations">Operations</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Approval Status</label>
                      <select
                        value={editUser.approvalStatus || 'pending'}
                        onChange={(e) => setEditUser({ ...editUser, approvalStatus: e.target.value as any })}
                        className="w-full p-2 border rounded-md"
                      >
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-2 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => setShowEditModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveUser}
                    disabled={updateUserMutation.isPending}
                  >
                    {updateUserMutation.isPending ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Add Product Modal */}
          {showAddProductModal && editProduct && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-card rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-2xl font-bold">Add New Product</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAddProductModal(false)}
                  >
                    <XCircle className="w-5 h-5" />
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Product Name *</label>
                      <input
                        type="text"
                        value={editProduct.name || ''}
                        onChange={(e) => setEditProduct({ ...editProduct, name: e.target.value })}
                        className="w-full p-2 border rounded-md"
                        placeholder={getCurrentCategoryFields().placeholderName}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Category *</label>
                      <select
                        value={editProduct.category || ''}
                        onChange={(e) => {
                          const newCategory = e.target.value;
                          const newFields = getCategoryFields(newCategory);
                          setEditProduct({ 
                            ...editProduct, 
                            category: newCategory,
                            unit: newFields.defaultUnit,
                            temperatureRange: newFields.showTemperature ? newFields.defaultTemp : null,
                            shelfLifeDays: newFields.showShelfLife ? 7 : null,
                            organic: newFields.organicRecommended
                          });
                        }}
                        className="w-full p-2 border rounded-md"
                      >
                        <option value="">Select Category</option>
                        <option value="vegetables">🥬 Vegetables</option>
                        <option value="fruits">🍎 Fruits</option>
                        <option value="meat">🥩 Meat</option>
                        <option value="dairy">🥛 Dairy</option>
                        <option value="merchandise">👕 Kotulo Merchandise</option>
                        <option value="farming">🌾 Farming Supplies</option>
                        <option value="other">📦 Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Retail Price (R) *</label>
                      <input
                        type="text"
                        value={editProduct.retailPrice || ''}
                        onChange={(e) => setEditProduct({ ...editProduct, retailPrice: e.target.value })}
                        className="w-full p-2 border rounded-md"
                        placeholder="0.00"
                        step="0.01"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Wholesale Price (R) *</label>
                      <input
                        type="text"
                        value={editProduct.wholesalePrice || ''}
                        onChange={(e) => setEditProduct({ ...editProduct, wholesalePrice: e.target.value })}
                        className="w-full p-2 border rounded-md"
                        placeholder="0.00"
                        step="0.01"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Unit *</label>
                      <select
                        value={editProduct.unit || ''}
                        onChange={(e) => setEditProduct({ ...editProduct, unit: e.target.value })}
                        className="w-full p-2 border rounded-md"
                      >
                        <option value="">Select Unit</option>
                        {getCurrentCategoryFields().units.map(unit => (
                          <option key={unit} value={unit}>{unit}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Min Order Qty *</label>
                      <input
                        type="number"
                        value={editProduct.minOrderQty || ''}
                        onChange={(e) => setEditProduct({ ...editProduct, minOrderQty: Number(e.target.value) })}
                        className="w-full p-2 border rounded-md"
                        placeholder="1"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Max Order Qty</label>
                      <input
                        type="number"
                        value={editProduct.maxOrderQty || ''}
                        onChange={(e) => setEditProduct({ ...editProduct, maxOrderQty: e.target.value ? Number(e.target.value) : null })}
                        className="w-full p-2 border rounded-md"
                        placeholder="Leave empty for no limit"
                      />
                    </div>
                    {getCurrentCategoryFields().showShelfLife && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Shelf Life (days)</label>
                        <input
                          type="number"
                          value={editProduct.shelfLifeDays || ''}
                          onChange={(e) => setEditProduct({ ...editProduct, shelfLifeDays: e.target.value ? Number(e.target.value) : null })}
                          className="w-full p-2 border rounded-md"
                          placeholder="Days until expiry"
                        />
                      </div>
                    )}
                    
                    {getCurrentCategoryFields().showTemperature && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Temperature Range</label>
                        <select
                          value={editProduct.temperatureRange || ''}
                          onChange={(e) => setEditProduct({ ...editProduct, temperatureRange: e.target.value })}
                          className="w-full p-2 border rounded-md"
                        >
                          <option value="">Select Temperature</option>
                          {getCurrentCategoryFields().temperatureOptions.map(temp => (
                            <option key={temp} value={temp}>{temp}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Description</label>
                    <textarea
                      value={editProduct.description || ''}
                      onChange={(e) => setEditProduct({ ...editProduct, description: e.target.value })}
                      className="w-full p-2 border rounded-md"
                      rows={3}
                      placeholder={getCurrentCategoryFields().placeholderDescription}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Product Image</label>
                    <div className="space-y-3">
                      {/* Image Preview */}
                      {(uploadedImagePreview || editProduct?.image) && (
                        <div className="w-full h-40 bg-muted rounded-lg overflow-hidden border-2 border-border">
                          <img 
                            src={uploadedImagePreview || editProduct?.image || undefined}
                            alt="Product preview"
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                            style={{
                              objectFit: 'cover',
                              objectPosition: 'center'
                            }}
                          />
                        </div>
                      )}
                      
                      {/* Upload Options */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        {/* File Upload */}
                        <div>
                          <input
                            type="file"
                            id="image-upload"
                            accept="image/*"
                            onChange={handleImageFileChange}
                            className="hidden"
                            disabled={isUploading}
                          />
                          <label
                            htmlFor="image-upload"
                            className="flex items-center justify-center px-3 py-2 border border-border rounded-md cursor-pointer hover:bg-muted/50 disabled:opacity-50"
                          >
                            <Package className="w-4 h-4 mr-2" />
                            {isUploading ? 'Uploading...' : 'Choose File'}
                          </label>
                        </div>
                        
                        {/* Camera Capture */}
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleCameraCapture}
                          disabled={isUploading}
                          className="w-full"
                        >
                          <Smartphone className="w-4 h-4 mr-2" />
                          Take Photo
                        </Button>
                        
                        {/* URL Input */}
                        <div className="flex-1">
                          <input
                            type="text"
                            value={editProduct?.image || ''}
                            onChange={(e) => setEditProduct({ ...editProduct, image: e.target.value })}
                            className="w-full p-2 border rounded-md text-sm"
                            placeholder="Or enter image URL"
                          />
                        </div>
                      </div>
                      
                      <p className="text-xs text-muted-foreground">
                        Supported formats: JPG, PNG, GIF. Smart compression for server compatibility (max 1.5MB)
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={editProduct.organic || false}
                        onChange={(e) => setEditProduct({ ...editProduct, organic: e.target.checked })}
                        className="mr-2"
                      />
                      <span className="text-sm font-medium">Organic</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={editProduct.featured || false}
                        onChange={(e) => setEditProduct({ ...editProduct, featured: e.target.checked })}
                        className="mr-2"
                      />
                      <span className="text-sm font-medium">Featured Product</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={editProduct.isActive !== false}
                        onChange={(e) => setEditProduct({ ...editProduct, isActive: e.target.checked })}
                        className="mr-2"
                      />
                      <span className="text-sm font-medium">Active</span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end space-x-2 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => setShowAddProductModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveProduct}
                    disabled={addProductMutation.isPending}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    {addProductMutation.isPending ? 'Adding...' : 'Add Product'}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Edit Product Modal */}
          {showProductEditModal && editProduct && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-card rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-2xl font-bold">Edit Product</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowProductEditModal(false)}
                  >
                    <XCircle className="w-5 h-5" />
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Product Name *</label>
                      <input
                        type="text"
                        value={editProduct.name || ''}
                        onChange={(e) => setEditProduct({ ...editProduct, name: e.target.value })}
                        className="w-full p-2 border rounded-md"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Category *</label>
                      <select
                        value={editProduct.category || ''}
                        onChange={(e) => setEditProduct({ ...editProduct, category: e.target.value as any })}
                        className="w-full p-2 border rounded-md"
                      >
                        <option value="vegetables">Vegetables</option>
                        <option value="fruits">Fruits</option>
                        <option value="meat">Meat</option>
                        <option value="dairy">Dairy</option>
                        <option value="merchandise">Kotulo Merchandise</option>
                        <option value="farming">Farming Supplies</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Retail Price (R) *</label>
                      <input
                        type="text"
                        value={editProduct.retailPrice || ''}
                        onChange={(e) => setEditProduct({ ...editProduct, retailPrice: e.target.value })}
                        className="w-full p-2 border rounded-md"
                        step="0.01"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Wholesale Price (R) *</label>
                      <input
                        type="text"
                        value={editProduct.wholesalePrice || ''}
                        onChange={(e) => setEditProduct({ ...editProduct, wholesalePrice: e.target.value })}
                        className="w-full p-2 border rounded-md"
                        step="0.01"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Unit *</label>
                      <select
                        value={editProduct.unit || ''}
                        onChange={(e) => setEditProduct({ ...editProduct, unit: e.target.value })}
                        className="w-full p-2 border rounded-md"
                      >
                        <option value="kg">kg</option>
                        <option value="g">g</option>
                        <option value="l">l</option>
                        <option value="ml">ml</option>
                        <option value="pieces">pieces</option>
                        <option value="dozen">dozen</option>
                        <option value="box">box</option>
                        <option value="bag">bag</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Min Order Qty *</label>
                      <input
                        type="number"
                        value={editProduct.minOrderQty || ''}
                        onChange={(e) => setEditProduct({ ...editProduct, minOrderQty: Number(e.target.value) })}
                        className="w-full p-2 border rounded-md"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Max Order Qty</label>
                      <input
                        type="number"
                        value={editProduct.maxOrderQty || ''}
                        onChange={(e) => setEditProduct({ ...editProduct, maxOrderQty: e.target.value ? Number(e.target.value) : null })}
                        className="w-full p-2 border rounded-md"
                        placeholder="Leave empty for no limit"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Shelf Life (days)</label>
                      <input
                        type="number"
                        value={editProduct.shelfLifeDays || ''}
                        onChange={(e) => setEditProduct({ ...editProduct, shelfLifeDays: e.target.value ? Number(e.target.value) : null })}
                        className="w-full p-2 border rounded-md"
                        placeholder="Days until expiry"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Temperature Range</label>
                      <select
                        value={editProduct.temperatureRange || ''}
                        onChange={(e) => setEditProduct({ ...editProduct, temperatureRange: e.target.value })}
                        className="w-full p-2 border rounded-md"
                      >
                        <option value="2-4°C">2-4°C (Refrigerated)</option>
                        <option value="frozen">Frozen</option>
                        <option value="ambient">Ambient</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Description</label>
                    <textarea
                      value={editProduct.description || ''}
                      onChange={(e) => setEditProduct({ ...editProduct, description: e.target.value })}
                      className="w-full p-2 border rounded-md"
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Product Image</label>
                    <div className="space-y-3">
                      {/* Image Preview */}
                      {(uploadedImagePreview || editProduct?.image) && (
                        <div className="w-full h-40 bg-muted rounded-lg overflow-hidden border-2 border-border">
                          <img 
                            src={uploadedImagePreview || editProduct?.image || undefined}
                            alt="Product preview"
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                            style={{
                              objectFit: 'cover',
                              objectPosition: 'center'
                            }}
                          />
                        </div>
                      )}
                      
                      {/* Upload Options */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        {/* File Upload */}
                        <div>
                          <input
                            type="file"
                            id="image-upload-edit"
                            accept="image/*"
                            onChange={handleImageFileChange}
                            className="hidden"
                            disabled={isUploading}
                          />
                          <label
                            htmlFor="image-upload-edit"
                            className="flex items-center justify-center px-3 py-2 border border-border rounded-md cursor-pointer hover:bg-muted/50 disabled:opacity-50"
                          >
                            <Package className="w-4 h-4 mr-2" />
                            {isUploading ? 'Uploading...' : 'Choose File'}
                          </label>
                        </div>
                        
                        {/* Camera Capture */}
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleCameraCapture}
                          disabled={isUploading}
                          className="w-full"
                        >
                          <Smartphone className="w-4 h-4 mr-2" />
                          Take Photo
                        </Button>
                        
                        {/* URL Input */}
                        <div className="flex-1">
                          <input
                            type="text"
                            value={editProduct?.image || ''}
                            onChange={(e) => setEditProduct({ ...editProduct, image: e.target.value })}
                            className="w-full p-2 border rounded-md text-sm"
                            placeholder="Or enter image URL"
                          />
                        </div>
                      </div>
                      
                      <p className="text-xs text-muted-foreground">
                        Supported formats: JPG, PNG, GIF. Smart compression for server compatibility (max 1.5MB)
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={editProduct.organic || false}
                        onChange={(e) => setEditProduct({ ...editProduct, organic: e.target.checked })}
                        className="mr-2"
                      />
                      <span className="text-sm font-medium">Organic</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={editProduct.featured || false}
                        onChange={(e) => setEditProduct({ ...editProduct, featured: e.target.checked })}
                        className="mr-2"
                      />
                      <span className="text-sm font-medium">Featured Product</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={editProduct.isActive !== false}
                        onChange={(e) => setEditProduct({ ...editProduct, isActive: e.target.checked })}
                        className="mr-2"
                      />
                      <span className="text-sm font-medium">Active</span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end space-x-2 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => setShowProductEditModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveProduct}
                    disabled={updateProductMutation.isPending}
                  >
                    {updateProductMutation.isPending ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* View Product Modal */}
          {showProductViewModal && selectedProduct && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-card rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-2xl font-bold">Product Details</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowProductViewModal(false)}
                  >
                    <XCircle className="w-5 h-5" />
                  </Button>
                </div>

                <div className="space-y-4">
                  {selectedProduct.image && (
                    <div className="w-full h-64 bg-muted rounded-lg overflow-hidden border-2 border-border shadow-lg">
                      <img 
                        src={selectedProduct.image} 
                        alt={selectedProduct.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                        style={{
                          objectFit: 'cover',
                          objectPosition: 'center'
                        }}
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-lg font-semibold">{selectedProduct.name}</h3>
                      <p className="text-muted-foreground">{selectedProduct.description}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="capitalize mb-2">
                        {selectedProduct.category}
                      </Badge>
                      <div className="space-y-1">
                        {selectedProduct.featured && (
                          <Badge className="bg-secondary-foreground/10 text-secondary-foreground">Featured</Badge>
                        )}
                        {selectedProduct.organic && (
                          <Badge className="bg-primary/10 text-primary">Organic</Badge>
                        )}
                        {selectedProduct.isActive ? (
                          <Badge className="bg-primary/10 text-primary">Active</Badge>
                        ) : (
                          <Badge variant="destructive">Inactive</Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Retail Price</p>
                      <p className="text-lg font-bold text-primary">R{selectedProduct.retailPrice}</p>
                      <p className="text-xs text-muted-foreground">per {selectedProduct.unit}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Wholesale Price</p>
                      <p className="text-lg font-bold text-accent">R{selectedProduct.wholesalePrice}</p>
                      <p className="text-xs text-muted-foreground">per {selectedProduct.unit}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Min Order</p>
                      <p className="text-lg font-bold text-farm-brown">
                        {selectedProduct.minOrderQty} {selectedProduct.unit}
                      </p>
                      <p className="text-xs text-muted-foreground">minimum order</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Shelf Life</p>
                      <p className="text-lg font-bold text-secondary">
                        {selectedProduct.shelfLifeDays ? `${selectedProduct.shelfLifeDays} days` : 'N/A'}
                      </p>
                      <p className="text-xs text-muted-foreground">until expiry</p>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowProductViewModal(false);
                        handleEditProduct(selectedProduct);
                      }}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Product
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowProductViewModal(false)}
                    >
                      Close
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        <Footer />
      </div>
    </AuthGuard>
  );
}
