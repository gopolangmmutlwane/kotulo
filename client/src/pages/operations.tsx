import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "wouter";
import { 
  Truck, 
  MapPin, 
  Package, 
  Clock, 
  Users, 
  AlertTriangle,
  CheckCircle,
  Navigation,
  Thermometer
} from "lucide-react";

export default function Operations() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white dark:from-orange-950 dark:to-gray-900">
      {/* Navigation */}
      <nav className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="outline" size="sm">← Dashboard</Button>
              </Link>
              <div className="flex items-center space-x-2">
                <Truck className="w-6 h-6 text-orange-600" />
                <span className="font-bold text-xl">Operations Center</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline">Operations Manager</Badge>
              <Badge className="bg-orange-600">Live Monitoring</Badge>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {/* Live Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <Truck className="w-8 h-8 text-orange-600 mx-auto mb-2" />
              <h3 className="font-semibold mb-1">Active Deliveries</h3>
              <p className="text-2xl font-bold text-orange-600">23</p>
              <p className="text-sm text-gray-600">2 delayed</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <Clock className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <h3 className="font-semibold mb-1">SLA Performance</h3>
              <p className="text-2xl font-bold text-green-600">94%</p>
              <p className="text-sm text-gray-600">60-min deliveries</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <Package className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <h3 className="font-semibold mb-1">Hub Capacity</h3>
              <p className="text-2xl font-bold text-blue-600">68%</p>
              <p className="text-sm text-gray-600">Average utilization</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <Users className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <h3 className="font-semibold mb-1">Drivers Online</h3>
              <p className="text-2xl font-bold text-purple-600">15</p>
              <p className="text-sm text-gray-600">Peak hours</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="deliveries" className="space-y-8">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="deliveries" data-testid="tab-deliveries">Live Deliveries</TabsTrigger>
            <TabsTrigger value="hubs" data-testid="tab-hubs">Micro Hubs</TabsTrigger>
            <TabsTrigger value="service-areas" data-testid="tab-service-areas">Service Areas</TabsTrigger>
            <TabsTrigger value="analytics" data-testid="tab-analytics">Performance</TabsTrigger>
          </TabsList>

          {/* Live Deliveries */}
          <TabsContent value="deliveries" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Live Delivery Tracking</h2>
              <Button data-testid="button-dispatch-driver">Dispatch Driver</Button>
            </div>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center space-x-2">
                        <Navigation className="w-5 h-5" />
                        <span>Delivery #DEL-2024-089</span>
                      </CardTitle>
                      <CardDescription>Driver: Sipho Mthembu • Vehicle: VAN-003</CardDescription>
                    </div>
                    <Badge className="bg-green-100 text-green-700">In Transit</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                    <div>
                      <span className="text-gray-600">Order:</span>
                      <p className="font-semibold">ORD-2024-156</p>
                    </div>
                    <div>
                      <span className="text-gray-600">ETA:</span>
                      <p className="font-semibold text-green-600">8 minutes</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Distance:</span>
                      <p className="font-semibold">2.3 km</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Temperature:</span>
                      <p className="font-semibold">3.2°C</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm">Delivery Progress</span>
                    <span className="text-sm text-green-600">85%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" data-testid="button-track-live">
                      <MapPin className="w-4 h-4 mr-1" />
                      Live Location
                    </Button>
                    <Button size="sm" variant="outline" data-testid="button-call-driver">Call Driver</Button>
                    <Button size="sm" variant="outline" data-testid="button-notify-customer">Notify Customer</Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center space-x-2">
                        <AlertTriangle className="w-5 h-5 text-red-500" />
                        <span>Delivery #DEL-2024-087</span>
                      </CardTitle>
                      <CardDescription>Driver: Maria Santos • Vehicle: VAN-001</CardDescription>
                    </div>
                    <Badge variant="outline" className="bg-red-50 text-red-700">Delayed</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                    <div>
                      <span className="text-gray-600">Order:</span>
                      <p className="font-semibold">ORD-2024-154</p>
                    </div>
                    <div>
                      <span className="text-gray-600">ETA:</span>
                      <p className="font-semibold text-red-600">15 minutes late</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Distance:</span>
                      <p className="font-semibold">0.8 km</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Issue:</span>
                      <p className="font-semibold text-red-600">Traffic delay</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" data-testid="button-escalate">Escalate Issue</Button>
                    <Button size="sm" variant="outline" data-testid="button-reassign">Reassign Driver</Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center space-x-2">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span>Delivery #DEL-2024-088</span>
                      </CardTitle>
                      <CardDescription>Driver: John Mitchell • Vehicle: VAN-002</CardDescription>
                    </div>
                    <Badge className="bg-green-100 text-green-700">Delivered</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                    <div>
                      <span className="text-gray-600">Order:</span>
                      <p className="font-semibold">ORD-2024-155</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Delivered:</span>
                      <p className="font-semibold text-green-600">2 min early</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Customer:</span>
                      <p className="font-semibold">J. Smith</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Signature:</span>
                      <p className="font-semibold text-green-600">Confirmed</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" data-testid="button-proof-delivery">View Proof</Button>
                    <Button size="sm" variant="outline" data-testid="button-customer-feedback">Feedback</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Micro Hubs */}
          <TabsContent value="hubs" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Micro-Fulfillment Hubs</h2>
              <Button data-testid="button-add-hub">Add New Hub</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>Johannesburg Micro-Hub</CardTitle>
                      <CardDescription>123 Fresh Market St, Johannesburg</CardDescription>
                    </div>
                    <Badge className="bg-green-100 text-green-700">Active</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Capacity:</span>
                        <p className="font-semibold">1000 units</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Current Load:</span>
                        <p className="font-semibold">680 units</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Temperature:</span>
                        <p className="font-semibold text-blue-600">
                          <Thermometer className="w-4 h-4 inline mr-1" />
                          2.8°C
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600">Staff Online:</span>
                        <p className="font-semibold">8/10</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Capacity Utilization</span>
                        <span>68%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: '68%' }}></div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" data-testid="button-hub-details">View Details</Button>
                      <Button size="sm" variant="outline" data-testid="button-hub-inventory">Inventory</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>Cape Town Micro-Hub</CardTitle>
                      <CardDescription>456 Coastal Ave, Cape Town</CardDescription>
                    </div>
                    <Badge className="bg-green-100 text-green-700">Active</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Capacity:</span>
                        <p className="font-semibold">800 units</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Current Load:</span>
                        <p className="font-semibold">520 units</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Temperature:</span>
                        <p className="font-semibold text-blue-600">
                          <Thermometer className="w-4 h-4 inline mr-1" />
                          3.1°C
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600">Staff Online:</span>
                        <p className="font-semibold">6/8</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Capacity Utilization</span>
                        <span>65%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: '65%' }}></div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" data-testid="button-ct-hub-details">View Details</Button>
                      <Button size="sm" variant="outline" data-testid="button-ct-hub-inventory">Inventory</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Service Areas */}
          <TabsContent value="service-areas" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Service Areas & Geo-Fencing</h2>
              <Button data-testid="button-add-service-area">Add Service Area</Button>
            </div>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center space-x-2">
                        <MapPin className="w-5 h-5" />
                        <span>Johannesburg Central</span>
                      </CardTitle>
                      <CardDescription>Primary delivery zone for Johannesburg hub</CardDescription>
                    </div>
                    <Badge className="bg-green-100 text-green-700">Active</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Delivery Fee:</span>
                      <p className="font-semibold">R25.00</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Min Order:</span>
                      <p className="font-semibold">R100.00</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Max Delivery:</span>
                      <p className="font-semibold">60 minutes</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Active Orders:</span>
                      <p className="font-semibold">12</p>
                    </div>
                  </div>
                  <div className="flex space-x-2 mt-4">
                    <Button size="sm" variant="outline" data-testid="button-view-area">View Boundaries</Button>
                    <Button size="sm" variant="outline" data-testid="button-edit-area">Edit Settings</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Performance Analytics */}
          <TabsContent value="analytics" className="space-y-6">
            <h2 className="text-2xl font-bold">Performance Analytics</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>SLA Performance</CardTitle>
                  <CardDescription>60-minute delivery compliance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <p className="text-4xl font-bold text-green-600">94.2%</p>
                    <p className="text-gray-600">This month</p>
                    <div className="mt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>On-time deliveries</span>
                        <span className="text-green-600">456</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Late deliveries</span>
                        <span className="text-yellow-600">24</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Failed deliveries</span>
                        <span className="text-red-600">4</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Route Efficiency</CardTitle>
                  <CardDescription>Delivery route optimization</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <p className="text-4xl font-bold text-blue-600">89%</p>
                    <p className="text-gray-600">Route optimization</p>
                    <div className="mt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Avg delivery time</span>
                        <span>42 minutes</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Distance saved</span>
                        <span className="text-green-600">23%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Fuel efficiency</span>
                        <span className="text-green-600">+18%</span>
                      </div>
                    </div>
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