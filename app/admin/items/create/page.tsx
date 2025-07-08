"use client";

import type React from "react";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Save, RotateCcw, Plus } from "lucide-react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Mock categories data (using category names instead of ids)
const categories = [
  { name: "Office Supplies", description: "General office supplies and stationery" },
  { name: "Electronics", description: "Electronic devices and accessories" },
  { name: "Furniture", description: "Office and classroom furniture" },
  { name: "Laboratory Equipment", description: "Scientific and laboratory instruments" },
  { name: "Computer Hardware", description: "Computer parts and peripherals" },
];

const units = ["Piece", "Set", "Box", "Pack", "Dozen", "Kilogram", "Liter", "Meter", "Square Meter", "Cubic Meter"];

export default function CreateItem() {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category_id: "", // Now storing the category name
    unit: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: "", description: "" });

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = "Item name is required";
    if (!formData.description.trim()) newErrors.description = "Description is required";
    if (!formData.category_id) newErrors.category_id = "Category is required";
    if (!formData.unit) newErrors.unit = "Unit is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/items/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          category_id: formData.category_id,  // Send category name instead of ID
          unit: formData.unit,
          price: 0,
        }),
      });

      console.log(response); // Log the response to inspect

      if (response.ok) {
        const newItem = await response.json();
        setSuccess(true);
        setFormData({ name: "", description: "", category_id: "", unit: "" });
        setErrors({});
      } else {
        const errorData = await response.json();
        setErrors({ api: errorData.message });
      }
    } catch (error) {
      console.error("Error creating item:", error);
      setErrors({ api: "Something went wrong, please try again." });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const resetForm = () => {
    setFormData({ name: "", description: "", category_id: "", unit: "" });
    setErrors({});
    setSuccess(false);
  };

  const handleCreateCategory = () => {
    console.log("Creating category:", newCategory);
    setNewCategory({ name: "", description: "" });
    setShowCategoryDialog(false);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center space-x-4 mb-4">
          <Link href="/admin/items">
            <Button variant="outline" size="sm" className="border-navy-200 text-navy-700 bg-transparent">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Items
            </Button>
          </Link>
        </div>
        <h2 className="text-2xl font-bold text-purple-800 mb-2" style={{ color: "#51247a" }}>
          Create New Item
        </h2>
        <p className="text-gray-600">Add new inventory item to the system</p>
      </div>

      <Card className="border-blue-100">
        <CardHeader>
          <CardTitle className="text-navy-700" style={{ color: "#1e3a8a" }}>
            Item Information
          </CardTitle>
          <CardDescription>Fill in all required fields to add a new inventory item</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" style={{ color: "#51247a" }}>
                Item Name *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Enter item name (e.g., HP LaserJet Printer)"
                className={`border-gray-200 focus:border-purple-500 ${errors.name ? "border-red-300" : ""}`}
                style={{ borderColor: "#e7e7e7" }}
              />
              {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" style={{ color: "#51247a" }}>
                Description *
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="Enter detailed description of the item including specifications, model, etc."
                rows={4}
                className={`border-gray-200 focus:border-purple-500 ${errors.description ? "border-red-300" : ""}`}
                style={{ borderColor: "#e7e7e7" }}
              />
              {errors.description && <p className="text-sm text-red-600">{errors.description}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category" style={{ color: "#51247a" }}>
                  Category *
                </Label>
                <div className="flex space-x-2">
                  <Select value={formData.category_id} onValueChange={(value) => handleChange("category_id", value)}>
                    <SelectTrigger
                      className={`border-gray-200 focus:border-purple-500 ${errors.category_id ? "border-red-300" : ""}`}
                      style={{ borderColor: "#e7e7e7" }}
                    >
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.name} value={category.name}>
                          {category.name} {/* Now passing category name */}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {errors.category_id && <p className="text-sm text-red-600">{errors.category_id}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="unit" style={{ color: "#51247a" }}>
                  Unit of Measurement *
                </Label>
                <Select value={formData.unit} onValueChange={(value) => handleChange("unit", value)}>
                  <SelectTrigger
                    className={`border-gray-200 focus:border-purple-500 ${errors.unit ? "border-red-300" : ""}`}
                    style={{ borderColor: "#e7e7e7" }}
                  >
                    <SelectValue placeholder="Select Unit" />
                  </SelectTrigger>
                  <SelectContent>
                    {units.map((unit) => (
                      <SelectItem key={unit} value={unit}>
                        {unit}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.unit && <p className="text-sm text-red-600">{errors.unit}</p>}
              </div>
            </div>

            {success && (
              <Alert className="border-green-200 bg-green-50">
                <AlertDescription className="text-green-700">
                  Item created successfully! You can now add another item or view all items.
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
                {loading ? "Saving..." : "Save Item"}
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
  );
}
