import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "wouter";
import { 
  Users, 
  BarChart3, 
  Settings, 
  Shield, 
  Database,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  DollarSign,
  Package
} from "lucide-react";

export default function AdminPanel() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white dark:from-red-950 dark:to-gray-900">
      {/* Navigation */}
      <nav className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="outline" size="sm">← Dashboard</Button>
              </Link>
              <div className="flex items-center space-x-2">
                <Shield className="w-6 h-6 text-red-600" />
                <span className="font-bold text-xl">Admin Panel</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline">System Administrator</Badge>
              <Badge className="bg-red-600">Full Access</Badge>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {/* Platform Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <h3 className="font-semibold mb-1">Total Users</h3>
              <p className="text-2xl font-bold text-blue-600">12,456</p>
              <p className="text-sm text-gray-600">+234 this month</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <DollarSign className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <h3 className="font-semibold mb-1">Platform Revenue</h3>
              <p className="text-2xl font-bold text-green-600">R2.4M</p>
              <p className="text-sm text-gray-600">This month</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <Package className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <h3 className="font-semibold mb-1">Total Orders</h3>
              <p className="text-2xl font-bold text-purple-600">45,230</p>
              <p className="text-sm text-gray-600">This month</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <TrendingUp className="w-8 h-8 text-orange-600 mx-auto mb-2" />
              <h3 className="font-semibold mb-1">Growth Rate</h3>
              <p className="text-2xl font-bold text-orange-600">+18%</p>
              <p className="text-sm text-gray-600">Month over month</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="users" className="space-y-8">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="users" data-testid="tab-users">User Management</TabsTrigger>
            <TabsTrigger value="analytics" data-testid="tab-analytics">Analytics</TabsTrigger>
            <TabsTrigger value="platform" data-testid="tab-platform">Platform Config</TabsTrigger>
            <TabsTrigger value="monitoring" data-testid="tab-monitoring">System Health</TabsTrigger>
            <TabsTrigger value="reports" data-testid="tab-reports">Reports</TabsTrigger>
          </TabsList>

          {/* User Management */}
          <TabsContent value="users" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">User Management</h2>
              <Button data-testid="button-export-users">Export User Data</Button>
            </div>

            {/* User Role Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
              <Card>
                <CardContent className="p-4 text-center">
                  <h4 className="font-semibold text-blue-600">Household</h4>
                  <p className="text-2xl font-bold">9,234</p>
                  <p className="text-sm text-gray-600">74% of users</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <h4 className="font-semibold text-purple-600">B2B Buyers</h4>
                  <p className="text-2xl font-bold">1,456</p>
                  <p className="text-sm text-gray-600">12% of users</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <h4 className="font-semibold text-green-600">Vendors</h4>
                  <p className="text-2xl font-bold">1,234</p>
                  <p className="text-sm text-gray-600">10% of users</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <h4 className="font-semibold text-orange-600">Operations</h4>
                  <p className="text-2xl font-bold">456</p>
                  <p className="text-sm text-gray-600">4% of users</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <h4 className="font-semibold text-red-600">Admins</h4>
                  <p className="text-2xl font-bold">76</p>
                  <p className="text-sm text-gray-600">1% of users</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent User Activity */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Recent User Activity</h3>
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>Sunnydale Supermarket</CardTitle>
                      <CardDescription>B2B Customer • sunnydale@supermarket.co.za</CardDescription>
                    </div>
                    <Badge className="bg-green-100 text-green-700">Active</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Last Login:</span>
                      <p className="font-semibold">2 hours ago</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Total Orders:</span>
                      <p className="font-semibold">156</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Total Spend:</span>
                      <p className="font-semibold">R234,567</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Credit Limit:</span>
                      <p className="font-semibold">R50,000</p>
                    </div>
                  </div>
                  <div className="flex space-x-2 mt-4">
                    <Button size="sm" variant="outline" data-testid="button-view-user">View Profile</Button>
                    <Button size="sm" variant="outline" data-testid="button-edit-credit">Edit Credit Limit</Button>
                    <Button size="sm" variant="outline" data-testid="button-suspend-user">Suspend Account</Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>Thabo's Organic Farm</CardTitle>
                      <CardDescription>Vendor • thabo@organicfarm.co.za</CardDescription>
                    </div>
                    <Badge className="bg-blue-100 text-blue-700">Verified</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Last Login:</span>
                      <p className="font-semibold">30 minutes ago</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Products:</span>
                      <p className="font-semibold">23 active</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Revenue:</span>
                      <p className="font-semibold">R45,230</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Commission:</span>
                      <p className="font-semibold">10%</p>
                    </div>
                  </div>
                  <div className="flex space-x-2 mt-4">
                    <Button size="sm" variant="outline" data-testid="button-view-vendor">View Profile</Button>
                    <Button size="sm" variant="outline" data-testid="button-adjust-commission">Adjust Commission</Button>
                    <Button size="sm" variant="outline" data-testid="button-verify-vendor">Update Verification</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Analytics Dashboard */}
          <TabsContent value="analytics" className="space-y-6">
            <h2 className="text-2xl font-bold">Platform Analytics</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="w-5 h-5" />
                    <span>Revenue Analytics</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-green-600">R2.4M</p>
                      <p className="text-gray-600">Monthly Revenue</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Commission Revenue</span>
                        <span className="text-green-600">R456,000</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Delivery Fees</span>
                        <span className="text-blue-600">R89,000</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Subscription Fees</span>
                        <span className="text-purple-600">R34,000</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>User Growth</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-blue-600">+18%</p>
                      <p className="text-gray-600">Monthly Growth</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>New Users</span>
                        <span className="text-green-600">+234</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Churn Rate</span>
                        <span className="text-red-600">2.3%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Active Users</span>
                        <span className="text-blue-600">8,456</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Platform Configuration */}
          <TabsContent value="platform" className="space-y-6">
            <h2 className="text-2xl font-bold">Platform Configuration</h2>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="w-5 h-5" />
                  <span>System Settings</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2">Delivery Settings</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Default SLA:</span>
                        <span className="font-semibold">60 minutes</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Default Delivery Fee:</span>
                        <span className="font-semibold">R25.00</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Min Order Value:</span>
                        <span className="font-semibold">R100.00</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Commission Rates</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Default Commission:</span>
                        <span className="font-semibold">10%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Premium Vendors:</span>
                        <span className="font-semibold">8%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>New Vendors:</span>
                        <span className="font-semibold">12%</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button data-testid="button-update-settings">Update Settings</Button>
                  <Button variant="outline" data-testid="button-backup-config">Backup Config</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Monitoring */}
          <TabsContent value="monitoring" className="space-y-6">
            <h2 className="text-2xl font-bold">System Health Monitoring</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6 text-center">
                  <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <h3 className="font-semibold mb-1">System Status</h3>
                  <p className="text-lg font-bold text-green-600">Healthy</p>
                  <p className="text-sm text-gray-600">All services operational</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6 text-center">
                  <Database className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <h3 className="font-semibold mb-1">Database</h3>
                  <p className="text-lg font-bold text-blue-600">99.9%</p>
                  <p className="text-sm text-gray-600">Uptime this month</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <AlertCircle className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                  <h3 className="font-semibold mb-1">Active Alerts</h3>
                  <p className="text-lg font-bold text-yellow-600">2</p>
                  <p className="text-sm text-gray-600">Low priority</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Reports */}
          <TabsContent value="reports" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">System Reports</h2>
              <Button data-testid="button-generate-report">Generate Custom Report</Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Performance Report</CardTitle>
                  <CardDescription>Comprehensive platform metrics for March 2024</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Total Revenue:</span>
                      <span className="font-semibold">R2,456,789</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Orders Processed:</span>
                      <span className="font-semibold">45,230</span>
                    </div>
                    <div className="flex justify-between">
                      <span>SLA Compliance:</span>
                      <span className="font-semibold text-green-600">94.2%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>User Growth:</span>
                      <span className="font-semibold text-blue-600">+18%</span>
                    </div>
                  </div>
                  <Button size="sm" className="w-full mt-4" data-testid="button-download-report">Download PDF</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Vendor Performance Report</CardTitle>
                  <CardDescription>Top performing vendors and commission summary</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Active Vendors:</span>
                      <span className="font-semibold">1,234</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Commission:</span>
                      <span className="font-semibold">R456,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Avg Commission Rate:</span>
                      <span className="font-semibold">9.8%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Top Vendor Revenue:</span>
                      <span className="font-semibold text-green-600">R89,450</span>
                    </div>
                  </div>
                  <Button size="sm" className="w-full mt-4" data-testid="button-download-vendor-report">Download PDF</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}