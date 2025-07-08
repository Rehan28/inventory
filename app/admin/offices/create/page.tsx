"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"

const sections = [
  "Administration",
  "Academic Affairs",
  "Student Services",
  "Finance",
  "Human Resources",
  "IT Department",
  "Library",
  "Research",
  "International Relations",
  "Maintenance",
]

export default function CreateOffice() {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    section: "",
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("") // To handle errors

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("") // Reset any previous error

    try {
      // Send data to backend API
      const response = await fetch("http://localhost:5000/api/offices/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
        setFormData({ name: "", description: "", section: "" }) // Clear form on success
      } else {
        setError(data.message || "Something went wrong")
      }
    } catch (err) {
      setError("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2" style={{ color: "#51247a" }}>
          Create New Office
        </h2>
        <p style={{ color: "#666" }}>Add new office information to the university system</p>
      </div>

      <Card style={{ borderColor: "#e7e7e7", backgroundColor: "#ffffff" }}>
        <CardHeader>
          <CardTitle style={{ color: "#51247a" }}>Office Information</CardTitle>
          <CardDescription style={{ color: "#666" }}>Fill in all required fields</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" style={{ color: "#51247a" }}>
                Office Name *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="e.g., Student Affairs Office"
                required
                style={{ borderColor: "#e7e7e7" }}
                className="focus:border-purple-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="section" style={{ color: "#51247a" }}>
                Section *
              </Label>
              <Select value={formData.section} onValueChange={(value) => handleChange("section", value)}>
                <SelectTrigger style={{ borderColor: "#e7e7e7" }} className="focus:border-purple-500">
                  <SelectValue placeholder="Select Section" />
                </SelectTrigger>
                <SelectContent>
                  {sections.map((section, index) => (
                    <SelectItem key={index} value={section}>
                      {section}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" style={{ color: "#51247a" }}>
                Description *
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="Enter detailed information about the office"
                rows={4}
                required
                style={{ borderColor: "#e7e7e7" }}
                className="focus:border-purple-500"
              />
            </div>

            {success && (
              <Alert className="border-green-200 bg-green-50">
                <AlertDescription className="text-green-700">Office created successfully!</AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-700">{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-4">
              <Button
                type="submit"
                className="text-white hover:bg-purple-700"
                style={{ backgroundColor: "#51247a" }}
                disabled={loading}
              >
                {loading ? "Saving..." : "Save Office"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="bg-transparent hover:bg-purple-50"
                style={{ borderColor: "#e7e7e7", color: "#51247a" }}
                onClick={() => setFormData({ name: "", description: "", section: "" })}
              >
                Reset Form
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
