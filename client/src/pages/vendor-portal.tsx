import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "wouter";
import { 
  Store, 
  Package, 
  TrendingUp, 
  DollarSign, 
  Truck, 
  Star,
  Plus,
  Eye,
  Edit,
  BarChart3
} from "lucide-react";

export default function VendorPortal() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white dark:from-green-950 dark:to-gray-900">
      {/* Navigation */}
      <nav className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="outline" size="sm">← Dashboard</Button>
              </Link>
              <div className="flex items-center space-x-2">
                <Store className="w-6 h-6 text-green-600" />
                <span className="font-bold text-xl">Vendor Portal</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline">Thabo's Organic Farm</Badge>
              <Badge className="bg-green-600">Verified Vendor</Badge>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {/* Dashboard Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <DollarSign className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <h3 className="font-semibold mb-1">Monthly Revenue</h3>
              <p className="text-2xl font-bold text-green-600">R45,230</p>
              <p className="text-sm text-gray-600">+12% from last month</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <Package className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <h3 className="font-semibold mb-1">Active Products</h3>
              <p className="text-2xl font-bold text-blue-600">23</p>
              <p className="text-sm text-gray-600">5 need restocking</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <TrendingUp className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <h3 className="font-semibold mb-1">Total Orders</h3>
              <p className="text-2xl font-bold text-purple-600">156</p>
              <p className="text-sm text-gray-600">This month</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <Star className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
              <h3 className="font-semibold mb-1">Average Rating</h3>
              <p className="text-2xl font-bold text-yellow-600">4.8</p>
              <p className="text-sm text-gray-600">124 reviews</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="products" className="space-y-8">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="products" data-testid="tab-products">Products</TabsTrigger>
            <TabsTrigger value="inventory" data-testid="tab-inventory">Inventory</TabsTrigger>
            <TabsTrigger value="orders" data-testid="tab-orders">Orders</TabsTrigger>
            <TabsTrigger value="analytics" data-testid="tab-analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings" data-testid="tab-settings">Settings</TabsTrigger>
          </TabsList>

          {/* Product Management */}
          <TabsContent value="products" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Product Catalog</h2>
              <Button data-testid="button-add-product">
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>Organic Tomatoes</CardTitle>
                      <CardDescription>Grade A, 1kg units</CardDescription>
                    </div>
                    <Badge className="bg-green-100 text-green-700">Active</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Retail Price:</span>
                        <p className="font-semibold">R25.00/kg</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Wholesale:</span>
                        <p className="font-semibold">R20.00/kg</p>
                      </div>
                      <div>
                        <span className="text-gray-600">In Stock:</span>
                        <p className="font-semibold text-green-600">450kg</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Commission:</span>
                        <p className="font-semibold">10%</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" data-testid="button-view-product">
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      <Button size="sm" variant="outline" data-testid="button-edit-product">
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>Organic Spinach</CardTitle>
                      <CardDescription>Fresh leafy greens, 500g</CardDescription>
                    </div>
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700">Low Stock</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Retail Price:</span>
                        <p className="font-semibold">R15.00/kg</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Wholesale:</span>
                        <p className="font-semibold">R12.00/kg</p>
                      </div>
                      <div>
                        <span className="text-gray-600">In Stock:</span>
                        <p className="font-semibold text-yellow-600">8kg</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Commission:</span>
                        <p className="font-semibold">10%</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" data-testid="button-restock">Restock</Button>
                      <Button size="sm" variant="outline" data-testid="button-edit-spinach">Edit</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Inventory Management */}
          <TabsContent value="inventory" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Inventory Management</h2>
              <Button data-testid="button-add-lot">Add Product Lot</Button>
            </div>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Package className="w-5 h-5" />
                    <span>Product Lot: TOM-2024-001</span>
                  </CardTitle>
                  <CardDescription>Organic Tomatoes - Batch tracking</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Harvest Date:</span>
                      <p className="font-semibold">March 15, 2024</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Expiry Date:</span>
                      <p className="font-semibold">March 22, 2024</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Quantity:</span>
                      <p className="font-semibold">500kg</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Available:</span>
                      <p className="font-semibold text-green-600">450kg</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Stock Level</span>
                      <span>90%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '90%' }}></div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Package className="w-5 h-5" />
                    <span>Product Lot: SPI-2024-003</span>
                  </CardTitle>
                  <CardDescription>Organic Spinach - Batch tracking</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Harvest Date:</span>
                      <p className="font-semibold">March 18, 2024</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Expiry Date:</span>
                      <p className="font-semibold text-yellow-600">March 21, 2024</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Quantity:</span>
                      <p className="font-semibold">30kg</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Available:</span>
                      <p className="font-semibold text-red-600">8kg</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Stock Level</span>
                      <span>27%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-red-500 h-2 rounded-full" style={{ width: '27%' }}></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Order Management */}
          <TabsContent value="orders" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Recent Orders</h2>
              <Button variant="outline" data-testid="button-export-orders">Export Orders</Button>
            </div>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>Order #ORD-2024-156</CardTitle>
                      <CardDescription>Sunnydale Supermarket - B2B Order</CardDescription>
                    </div>
                    <Badge className="bg-blue-100 text-blue-700">Processing</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Total Amount:</span>
                      <p className="font-semibold">R2,450.00</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Commission:</span>
                      <p className="font-semibold text-green-600">R245.00</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Delivery Date:</span>
                      <p className="font-semibold">March 22, 2024</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Items:</span>
                      <p className="font-semibold">3 products</p>
                    </div>
                  </div>
                  <div className="flex space-x-2 mt-4">
                    <Button size="sm" variant="outline" data-testid="button-fulfill-order">Mark as Ready</Button>
                    <Button size="sm" variant="outline" data-testid="button-view-order">View Details</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Analytics */}
          <TabsContent value="analytics" className="space-y-6">
            <h2 className="text-2xl font-bold">Sales Analytics</h2>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5" />
                  <span>Performance Overview</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-green-600">R145,230</p>
                    <p className="text-gray-600">Total Revenue (YTD)</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-blue-600">456</p>
                    <p className="text-gray-600">Total Orders (YTD)</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-purple-600">R318</p>
                    <p className="text-gray-600">Average Order Value</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings */}
          <TabsContent value="settings" className="space-y-6">
            <h2 className="text-2xl font-bold">Vendor Settings</h2>
            
            <Card>
              <CardHeader>
                <CardTitle>Commission & Fulfillment</CardTitle>
                <CardDescription>Manage your commission rates and fulfillment preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="commission">Commission Rate (%)</Label>
                    <Input id="commission" type="number" defaultValue="10" data-testid="input-commission" />
                  </div>
                  <div>
                    <Label htmlFor="ad-budget">Monthly Ad Budget</Label>
                    <Input id="ad-budget" type="number" defaultValue="500" data-testid="input-ad-budget" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Fulfillment Options</Label>
                  <div className="flex space-x-4">
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" defaultChecked data-testid="checkbox-self-fulfill" />
                      <span>Self-fulfill orders</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" data-testid="checkbox-consign-hub" />
                      <span>Consign to micro-hub</span>
                    </label>
                  </div>
                </div>
                <Button data-testid="button-save-settings">Save Settings</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}