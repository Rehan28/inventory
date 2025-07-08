"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Save, RotateCcw } from "lucide-react"
import Link from "next/link"

export default function CreateSupplier() {
  const [formData, setFormData] = useState({
    name: "",
    contactPerson: "",
    phone: "",
    email: "",
    address: "",
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) newErrors.name = "Supplier name is required"
    if (!formData.contactPerson.trim()) newErrors.contactPerson = "Contact person is required"
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required"
    if (!formData.email.trim()) newErrors.email = "Email is required"
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email is invalid"
    if (!formData.address.trim()) newErrors.address = "Address is required"

    // Phone validation (Bangladesh format)
    if (formData.phone && !/^(\+88)?01[3-9]\d{8}$/.test(formData.phone.replace(/\s/g, ""))) {
      newErrors.phone = "Please enter a valid Bangladesh phone number"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  // Validate the form before submitting
  if (!validateForm()) return;

  setLoading(true);

  try {
    // Sending the form data to the API using fetch
    const response = await fetch("http://localhost:5000/api/suppliers/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),  // Sending formData as JSON
    });

    if (!response.ok) {
      throw new Error("Failed to create supplier");
    }

    const supplier = await response.json();
    
    setSuccess(true);  // Set success state to true after successfully saving
    setLoading(false);
    setFormData({ name: "", contactPerson: "", phone: "", email: "", address: "" });
    setErrors({});
  } catch (err) {
    setLoading(false);
    setErrors({ general: "Error while creating supplier. Please try again." });
    console.error(err);  // Log the error for debugging
  }
};


  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const resetForm = () => {
    setFormData({ name: "", contactPerson: "", phone: "", email: "", address: "" })
    setErrors({})
    setSuccess(false)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center space-x-4 mb-4">
          <Link href="/admin/suppliers">
            <Button
              variant="outline"
              size="sm"
              className="bg-transparent"
              style={{ borderColor: "#e7e7e7", color: "#51247a" }}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Suppliers
            </Button>
          </Link>
        </div>
        <h2 className="text-2xl font-bold mb-2" style={{ color: "#51247a" }}>
          Create New Supplier
        </h2>
        <p style={{ color: "#666" }}>Add new supplier information to the system</p>
      </div>

      <Card style={{ borderColor: "#e7e7e7", backgroundColor: "#ffffff" }}>
        <CardHeader>
          <CardTitle style={{ color: "#51247a" }}>Supplier Information</CardTitle>
          <CardDescription style={{ color: "#666" }}>Fill in all required fields to add a new supplier</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" style={{ color: "#51247a" }}>
                  Supplier Name *
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="Enter supplier company name"
                  className={`focus:border-purple-500 ${errors.name ? "border-red-300" : ""}`}
                  style={{ borderColor: errors.name ? "#ef4444" : "#e7e7e7" }}
                />
                {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactPerson" style={{ color: "#51247a" }}>
                  Contact Person *
                </Label>
                <Input
                  id="contactPerson"
                  value={formData.contactPerson}
                  onChange={(e) => handleChange("contactPerson", e.target.value)}
                  placeholder="Enter contact person name"
                  className={`focus:border-purple-500 ${errors.contactPerson ? "border-red-300" : ""}`}
                  style={{ borderColor: errors.contactPerson ? "#ef4444" : "#e7e7e7" }}
                />
                {errors.contactPerson && <p className="text-sm text-red-600">{errors.contactPerson}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone" style={{ color: "#51247a" }}>
                  Phone Number *
                </Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  placeholder="01XXXXXXXXX"
                  className={`focus:border-purple-500 ${errors.phone ? "border-red-300" : ""}`}
                  style={{ borderColor: errors.phone ? "#ef4444" : "#e7e7e7" }}
                />
                {errors.phone && <p className="text-sm text-red-600">{errors.phone}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" style={{ color: "#51247a" }}>
                  Email Address *
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  placeholder="supplier@example.com"
                  className={`focus:border-purple-500 ${errors.email ? "border-red-300" : ""}`}
                  style={{ borderColor: errors.email ? "#ef4444" : "#e7e7e7" }}
                />
                {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address" style={{ color: "#51247a" }}>
                Address *
              </Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => handleChange("address", e.target.value)}
                placeholder="Enter complete address with district and postal code"
                rows={3}
                className={`focus:border-purple-500 ${errors.address ? "border-red-300" : ""}`}
                style={{ borderColor: errors.address ? "#ef4444" : "#e7e7e7" }}
              />
              {errors.address && <p className="text-sm text-red-600">{errors.address}</p>}
            </div>

            {success && (
              <Alert className="border-green-200 bg-green-50">
                <AlertDescription className="text-green-700">
                  Supplier created successfully! You can now add another supplier or view all suppliers.
                </AlertDescription>
              </Alert>
            )}

            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                className="text-white hover:bg-purple-700 flex items-center"
                style={{ backgroundColor: "#51247a" }}
                disabled={loading}
              >
                <Save className="w-4 h-4 mr-2" />
                {loading ? "Saving..." : "Save Supplier"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="bg-transparent hover:bg-purple-50 flex items-center"
                style={{ borderColor: "#e7e7e7", color: "#51247a" }}
                onClick={resetForm}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset Form
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
