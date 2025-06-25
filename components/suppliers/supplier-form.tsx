"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Save, X, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface SupplierFormProps {
  supplierId?: string;
  initialData?: any;
}

export default function SupplierForm({ supplierId, initialData }: SupplierFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    contactName: "",
    address: "",
    email: "",
    phoneNumber: "",
    website: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        contactName: initialData.contactName || "",
        address: initialData.address || "",
        email: initialData.email || "",
        phoneNumber: initialData.phoneNumber || "",
        website: initialData.website || "",
      });
    }
  }, [initialData]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Company name is required";
    }
    if (!formData.contactName.trim()) {
      newErrors.contactName = "Contact name is required";
    }
    if (!formData.address.trim()) {
      newErrors.address = "Address is required";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const url = supplierId ? `/api/suppliers/${supplierId}` : "/api/suppliers";
      const method = supplierId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        router.push("/suppliers");
      } else {
        if (response.status === 409) {
          setErrors({ email: data.error || "Supplier with this email already exists" });
        } else {
          alert(data.error || "Failed to save supplier");
        }
      }
    } catch (error) {
      console.error("Error saving supplier:", error);
      alert("An error occurred while saving the supplier");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Button 
              variant="outline" 
              size="icon" 
              asChild
              className="shadow-sm border-gray-200 hover:bg-gray-50"
            >
              <Link href="/suppliers">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Building2 className="h-8 w-8 text-primary" />
                {supplierId ? "Edit Supplier" : "Add New Supplier"}
              </h1>
              <p className="mt-2 text-gray-600">
                {supplierId 
                  ? "Update supplier information and contact details" 
                  : "Add a new supplier to your business network"
                }
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="shadow-sm border-gray-200">
            <CardHeader className="bg-primary/5 border-b border-gray-100">
              <CardTitle className="text-primary flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Company Information
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                    Company Name *
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    className={`mt-1 ${errors.name ? "border-red-500 focus:border-red-500" : "border-gray-300 focus:border-primary"}`}
                    placeholder="Enter company name"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="contactName" className="text-sm font-medium text-gray-700">
                    Contact Person *
                  </Label>
                  <Input
                    id="contactName"
                    type="text"
                    value={formData.contactName}
                    onChange={(e) => handleChange("contactName", e.target.value)}
                    className={`mt-1 ${errors.contactName ? "border-red-500 focus:border-red-500" : "border-gray-300 focus:border-primary"}`}
                    placeholder="Enter contact person name"
                  />
                  {errors.contactName && (
                    <p className="mt-1 text-sm text-red-600">{errors.contactName}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="address" className="text-sm font-medium text-gray-700">
                  Address *
                </Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                  className={`mt-1 ${errors.address ? "border-red-500 focus:border-red-500" : "border-gray-300 focus:border-primary"}`}
                  placeholder="Enter complete address"
                  rows={3}
                />
                {errors.address && (
                  <p className="mt-1 text-sm text-red-600">{errors.address}</p>
                )}
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email Address *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    className={`mt-1 ${errors.email ? "border-red-500 focus:border-red-500" : "border-gray-300 focus:border-primary"}`}
                    placeholder="Enter email address"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="phoneNumber" className="text-sm font-medium text-gray-700">
                    Phone Number *
                  </Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => handleChange("phoneNumber", e.target.value)}
                    className={`mt-1 ${errors.phoneNumber ? "border-red-500 focus:border-red-500" : "border-gray-300 focus:border-primary"}`}
                    placeholder="Enter phone number"
                  />
                  {errors.phoneNumber && (
                    <p className="mt-1 text-sm text-red-600">{errors.phoneNumber}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="website" className="text-sm font-medium text-gray-700">
                  Website
                </Label>
                <Input
                  id="website"
                  type="url"
                  value={formData.website}
                  onChange={(e) => handleChange("website", e.target.value)}
                  className="mt-1 border-gray-300 focus:border-primary"
                  placeholder="Enter website URL (optional)"
                />
              </div>
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex gap-4 pt-6">
            <Button 
              type="submit" 
              disabled={loading}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  {supplierId ? "Updating..." : "Creating..."}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  {supplierId ? "Update Supplier" : "Create Supplier"}
                </div>
              )}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              asChild
              className="border-gray-300 hover:bg-gray-50 px-8"
            >
              <Link href="/suppliers">
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Link>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}