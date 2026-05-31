import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  FileText, 
  Building2, 
  MapPin, 
  Upload, 
  CheckCircle2, 
  AlertCircle,
  Loader2
} from "lucide-react";

const applicationSchema = z.object({
  businessRegistrationNumber: z.string().min(1, "Business registration number is required"),
  taxId: z.string().optional(),
  businessAddress: z.string().min(10, "Business address must be at least 10 characters"),
  businessDescription: z.string().min(50, "Business description must be at least 50 characters"),
});

type ApplicationFormData = z.infer<typeof applicationSchema>;

export default function Application() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState<string | null>(null);

  // Check if user is farmer or vendor
  if (!user || (user.role !== "farmer" && user.role !== "vendor")) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">This page is only available for farmers and vendors.</p>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  const isPending = user.approvalStatus === "pending";
  const isApproved = user.approvalStatus === "approved";
  const isRejected = user.approvalStatus === "rejected";

  const form = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      businessRegistrationNumber: (user as any).businessRegistrationNumber || "",
      taxId: (user as any).taxId || "",
      businessAddress: (user as any).businessAddress || user.address || "",
      businessDescription: (user as any).businessDescription || "",
    },
  });

  const updateApplicationMutation = useMutation({
    mutationFn: async (data: ApplicationFormData & { documents?: any }) => {
      const res = await apiRequest("PUT", "/api/user/application", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({
        title: "Success",
        description: "Application information updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update application",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: ApplicationFormData) => {
    updateApplicationMutation.mutate(data);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, documentType: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // In a real app, you'd upload to S3/cloud storage
    // For now, we'll just store the filename
    setUploading(documentType);
    
    // Simulate upload
    setTimeout(() => {
      const documents = (user as any).applicationDocuments || {};
      documents[documentType] = file.name; // In production, this would be a URL
      
      updateApplicationMutation.mutate({
        ...form.getValues(),
        documents,
      });
      
      setUploading(null);
      toast({
        title: "File uploaded",
        description: `${documentType} uploaded successfully`,
      });
    }, 1000);
  };

  if (isApproved) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <CheckCircle2 className="w-8 h-8 text-primary" />
                <CardTitle>Account Approved</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Your account has been approved! You can now access all features.
              </p>
              <Button 
                onClick={() => setLocation(user.role === "farmer" ? "/farmer-dashboard" : "/vendor-dashboard")}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Go to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  if (isRejected) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <AlertCircle className="w-8 h-8 text-destructive" />
                <CardTitle>Application Rejected</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Your application has been rejected. Please contact support for more information.
              </p>
              <Button variant="outline" onClick={() => setLocation("/")}>
                Return Home
              </Button>
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
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Complete Your Application</h1>
            <p className="text-muted-foreground">
              Please provide the following information to complete your {user.role} account application.
              Your application will be reviewed by our admin team.
            </p>
          </div>

          {isPending && (
            <Card className="mb-6 border-secondary/40 bg-secondary/20">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5 text-secondary-foreground" />
                  <p className="text-sm text-secondary-foreground">
                    Your application is pending review. Complete the form below to submit your application.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Application Information</CardTitle>
              <CardDescription>
                All fields marked with * are required
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Business Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center">
                      <Building2 className="w-5 h-5 mr-2" />
                      Business Information
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="businessRegistrationNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Business Registration Number *</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="CIPC Registration Number"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Your CIPC (Companies and Intellectual Property Commission) registration number
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="taxId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tax/VAT Number</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="VAT/Tax Number (optional)"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Your VAT or Tax registration number (if applicable)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="businessAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center">
                            <MapPin className="w-4 h-4 mr-2" />
                            Business Address *
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Full business address including street, city, province, postal code"
                              rows={3}
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Complete physical address of your business
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="businessDescription"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Business Description *</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Describe your business, products, experience, certifications, etc."
                              rows={5}
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Provide details about your {user.role === "farmer" ? "farm" : "business"}, 
                            products you {user.role === "farmer" ? "grow/produce" : "sell"}, 
                            certifications, and experience (minimum 50 characters)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Documents */}
                  <div className="space-y-4 pt-6 border-t">
                    <h3 className="text-lg font-semibold flex items-center">
                      <FileText className="w-5 h-5 mr-2" />
                      Required Documents
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Upload the following documents to complete your application:
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Business License / Registration Certificate *</Label>
                        <div className="flex items-center space-x-2">
                          <Input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => handleFileUpload(e, "businessLicense")}
                            className="flex-1"
                            disabled={uploading === "businessLicense"}
                          />
                          {uploading === "businessLicense" && (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          )}
                        </div>
                        {(user as any).applicationDocuments?.businessLicense && (
                          <p className="text-xs text-primary">
                            ✓ {(user as any).applicationDocuments.businessLicense}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label>Tax Certificate (if applicable)</Label>
                        <div className="flex items-center space-x-2">
                          <Input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => handleFileUpload(e, "taxCertificate")}
                            className="flex-1"
                            disabled={uploading === "taxCertificate"}
                          />
                          {uploading === "taxCertificate" && (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          )}
                        </div>
                        {(user as any).applicationDocuments?.taxCertificate && (
                          <p className="text-xs text-primary">
                            ✓ {(user as any).applicationDocuments.taxCertificate}
                          </p>
                        )}
                      </div>

                      {user.role === "farmer" && (
                        <>
                          <div className="space-y-2">
                            <Label>Farm Certification (if organic/certified)</Label>
                            <div className="flex items-center space-x-2">
                              <Input
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={(e) => handleFileUpload(e, "farmCertification")}
                                className="flex-1"
                                disabled={uploading === "farmCertification"}
                              />
                              {uploading === "farmCertification" && (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              )}
                            </div>
                            {(user as any).applicationDocuments?.farmCertification && (
                              <p className="text-xs text-primary">
                                ✓ {(user as any).applicationDocuments.farmCertification}
                              </p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label>Health & Safety Certificate</Label>
                            <div className="flex items-center space-x-2">
                              <Input
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={(e) => handleFileUpload(e, "healthSafety")}
                                className="flex-1"
                                disabled={uploading === "healthSafety"}
                              />
                              {uploading === "healthSafety" && (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              )}
                            </div>
                            {(user as any).applicationDocuments?.healthSafety && (
                              <p className="text-xs text-primary">
                                ✓ {(user as any).applicationDocuments.healthSafety}
                              </p>
                            )}
                          </div>
                        </>
                      )}

                      {user.role === "vendor" && (
                        <div className="space-y-2">
                          <Label>Vendor License / Permit</Label>
                          <div className="flex items-center space-x-2">
                            <Input
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={(e) => handleFileUpload(e, "vendorLicense")}
                              className="flex-1"
                              disabled={uploading === "vendorLicense"}
                            />
                            {uploading === "vendorLicense" && (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            )}
                          </div>
                          {(user as any).applicationDocuments?.vendorLicense && (
                            <p className="text-xs text-primary">
                              ✓ {(user as any).applicationDocuments.vendorLicense}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex space-x-4 pt-6 border-t">
                    <Button
                      type="submit"
                      className="bg-primary hover:bg-primary/90 text-primary-foreground"
                      disabled={updateApplicationMutation.isPending}
                    >
                      {updateApplicationMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          {isPending ? "Update Application" : "Submit Application"}
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setLocation("/")}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
}

