import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "wouter";
import { 
  Building2, 
  FileText, 
  Calendar, 
  CreditCard, 
  Truck, 
  Package,
  TrendingUp,
  Clock,
  DollarSign
} from "lucide-react";

export default function B2BOrdering() {
  const [orderType, setOrderType] = useState("one_time");

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-blue-950 dark:to-gray-900">
      {/* Navigation */}
      <nav className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="outline" size="sm">← Dashboard</Button>
              </Link>
              <div className="flex items-center space-x-2">
                <Building2 className="w-6 h-6 text-blue-600" />
                <span className="font-bold text-xl">B2B Ordering Portal</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline">Sunnydale Supermarket</Badge>
              <Badge className="bg-blue-600">B2B Account</Badge>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="catalog" className="space-y-8">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="catalog" data-testid="tab-catalog">Product Catalog</TabsTrigger>
            <TabsTrigger value="orders" data-testid="tab-orders">Purchase Orders</TabsTrigger>
            <TabsTrigger value="recurring" data-testid="tab-recurring">Recurring Orders</TabsTrigger>
            <TabsTrigger value="invoices" data-testid="tab-invoices">Invoices</TabsTrigger>
          </TabsList>

          {/* Product Catalog */}
          <TabsContent value="catalog" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Bulk Product Catalog</h2>
              <Button data-testid="button-create-order">Create Purchase Order</Button>
            </div>

            {/* Bulk Pricing Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>Organic Tomatoes (Bulk)</CardTitle>
                      <CardDescription>Grade A, 1kg units</CardDescription>
                    </div>
                    <Badge variant="secondary">Wholesale</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Retail Price:</span>
                        <p className="font-semibold line-through">R25.00/kg</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Wholesale Price:</span>
                        <p className="font-semibold text-green-600">R20.00/kg</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Min Order:</span>
                        <p className="font-semibold">50kg</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Available:</span>
                        <p className="font-semibold">500kg</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Input type="number" placeholder="Quantity (kg)" min="50" data-testid="input-quantity-tomatoes" />
                      <Button size="sm" data-testid="button-add-tomatoes">Add to Order</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>Grass-Fed Beef (Bulk)</CardTitle>
                      <CardDescription>Premium grade, 500g cuts</CardDescription>
                    </div>
                    <Badge variant="secondary">Wholesale</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Retail Price:</span>
                        <p className="font-semibold line-through">R180.00/kg</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Wholesale Price:</span>
                        <p className="font-semibold text-green-600">R150.00/kg</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Min Order:</span>
                        <p className="font-semibold">10kg</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Available:</span>
                        <p className="font-semibold">100kg</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Input type="number" placeholder="Quantity (kg)" min="10" data-testid="input-quantity-beef" />
                      <Button size="sm" data-testid="button-add-beef">Add to Order</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>Fresh Milk (Bulk)</CardTitle>
                      <CardDescription>Grade A, 1L bottles</CardDescription>
                    </div>
                    <Badge variant="secondary">Wholesale</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Retail Price:</span>
                        <p className="font-semibold line-through">R18.00/L</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Wholesale Price:</span>
                        <p className="font-semibold text-green-600">R15.00/L</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Min Order:</span>
                        <p className="font-semibold">100L</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Available:</span>
                        <p className="font-semibold">1000L</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Input type="number" placeholder="Quantity (L)" min="100" data-testid="input-quantity-milk" />
                      <Button size="sm" data-testid="button-add-milk">Add to Order</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Purchase Orders */}
          <TabsContent value="orders" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Purchase Orders</h2>
              <Button data-testid="button-new-po">New Purchase Order</Button>
            </div>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center space-x-2">
                        <FileText className="w-5 h-5" />
                        <span>PO-2024-001</span>
                      </CardTitle>
                      <CardDescription>Weekly produce order</CardDescription>
                    </div>
                    <Badge variant="outline" className="bg-green-50 text-green-700">Confirmed</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Total Amount:</span>
                      <p className="font-semibold">R15,750.00</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Delivery Date:</span>
                      <p className="font-semibold">March 25, 2024</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Payment Terms:</span>
                      <p className="font-semibold">Net 30</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Items:</span>
                      <p className="font-semibold">12 products</p>
                    </div>
                  </div>
                  <div className="flex space-x-2 mt-4">
                    <Button size="sm" variant="outline" data-testid="button-view-po">View Details</Button>
                    <Button size="sm" variant="outline" data-testid="button-track-delivery">Track Delivery</Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center space-x-2">
                        <FileText className="w-5 h-5" />
                        <span>PO-2024-002</span>
                      </CardTitle>
                      <CardDescription>Emergency stock order</CardDescription>
                    </div>
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700">Pending</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Total Amount:</span>
                      <p className="font-semibold">R8,200.00</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Delivery Date:</span>
                      <p className="font-semibold">March 22, 2024</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Payment Terms:</span>
                      <p className="font-semibold">COD</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Items:</span>
                      <p className="font-semibold">5 products</p>
                    </div>
                  </div>
                  <div className="flex space-x-2 mt-4">
                    <Button size="sm" variant="outline" data-testid="button-approve-po">Approve Order</Button>
                    <Button size="sm" variant="outline" data-testid="button-edit-po">Edit Order</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Recurring Orders */}
          <TabsContent value="recurring" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Recurring Orders</h2>
              <Button data-testid="button-setup-recurring">Setup Recurring Order</Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5" />
                  <span>Weekly Produce Order</span>
                </CardTitle>
                <CardDescription>Automated weekly delivery every Monday</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                  <div>
                    <span className="text-gray-600">Frequency:</span>
                    <p className="font-semibold">Weekly (Mondays)</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Average Amount:</span>
                    <p className="font-semibold">R12,500.00</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Next Delivery:</span>
                    <p className="font-semibold">March 25, 2024</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Items:</span>
                    <p className="font-semibold">15 products</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline" data-testid="button-modify-recurring">Modify Order</Button>
                  <Button size="sm" variant="outline" data-testid="button-pause-recurring">Pause Schedule</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Invoices */}
          <TabsContent value="invoices" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Invoices & Billing</h2>
              <div className="flex space-x-2">
                <Button variant="outline" data-testid="button-payment-history">Payment History</Button>
                <Button data-testid="button-make-payment">Make Payment</Button>
              </div>
            </div>

            {/* Account Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Card>
                <CardContent className="p-6 text-center">
                  <CreditCard className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <h3 className="font-semibold mb-1">Credit Limit</h3>
                  <p className="text-2xl font-bold text-blue-600">R50,000</p>
                  <p className="text-sm text-gray-600">Available: R35,750</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6 text-center">
                  <DollarSign className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <h3 className="font-semibold mb-1">Outstanding Balance</h3>
                  <p className="text-2xl font-bold text-green-600">R14,250</p>
                  <p className="text-sm text-gray-600">Due: March 30</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <TrendingUp className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <h3 className="font-semibold mb-1">Monthly Spend</h3>
                  <p className="text-2xl font-bold text-purple-600">R89,450</p>
                  <p className="text-sm text-gray-600">This month</p>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>Invoice #INV-2024-045</CardTitle>
                      <CardDescription>PO-2024-001 - Weekly produce order</CardDescription>
                    </div>
                    <Badge variant="outline" className="bg-red-50 text-red-700">Overdue</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Amount:</span>
                      <p className="font-semibold">R15,750.00</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Due Date:</span>
                      <p className="font-semibold text-red-600">March 20, 2024</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Payment Terms:</span>
                      <p className="font-semibold">Net 30</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Days Overdue:</span>
                      <p className="font-semibold text-red-600">2 days</p>
                    </div>
                  </div>
                  <div className="flex space-x-2 mt-4">
                    <Button size="sm" data-testid="button-pay-invoice">Pay Now</Button>
                    <Button size="sm" variant="outline" data-testid="button-download-invoice">Download PDF</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}