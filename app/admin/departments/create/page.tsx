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

const faculties = [
  "Faculty of Agriculture",
  "Faculty of Engineering & Technology",
  "Faculty of Computer Science & Engineering",
  "Faculty of Business Administration",
  "Faculty of Fisheries",
  "Faculty of Veterinary & Animal Science",
  "Faculty of Disaster Management",
  "Faculty of Land Management & Law",
]

export default function CreateDepartment() {
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    faculty: "",
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
      const response = await fetch("http://localhost:5000/api/departments/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
        setFormData({ name: "", code: "", description: "", faculty: "" }) // Clear form on success
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
          Create New Department
        </h2>
        <p style={{ color: "#666" }}>Add new department information to the university system</p>
      </div>

      <Card style={{ borderColor: "#e7e7e7", backgroundColor: "#ffffff" }}>
        <CardHeader>
          <CardTitle style={{ color: "#51247a" }}>Department Information</CardTitle>
          <CardDescription style={{ color: "#666" }}>Fill in all required fields</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" style={{ color: "#51247a" }}>
                Department Name *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="e.g., Computer Science & Engineering"
                required
                style={{ borderColor: "#e7e7e7" }}
                className="focus:border-purple-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="code" style={{ color: "#51247a" }}>
                Department Code *
              </Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => handleChange("code", e.target.value)}
                placeholder="e.g., CSE"
                required
                style={{ borderColor: "#e7e7e7" }}
                className="focus:border-purple-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="faculty" style={{ color: "#51247a" }}>
                Faculty *
              </Label>
              <Select value={formData.faculty} onValueChange={(value) => handleChange("faculty", value)}>
                <SelectTrigger style={{ borderColor: "#e7e7e7" }} className="focus:border-purple-500">
                  <SelectValue placeholder="Select Faculty" />
                </SelectTrigger>
                <SelectContent>
                  {faculties.map((faculty, index) => (
                    <SelectItem key={index} value={faculty}>
                      {faculty}
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
                placeholder="Enter detailed information about the department"
                rows={4}
                required
                style={{ borderColor: "#e7e7e7" }}
                className="focus:border-purple-500"
              />
            </div>

            {success && (
              <Alert className="border-green-200 bg-green-50">
                <AlertDescription className="text-green-700">Department created successfully!</AlertDescription>
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
                {loading ? "Saving..." : "Save Department"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="bg-transparent hover:bg-purple-50"
                style={{ borderColor: "#e7e7e7", color: "#51247a" }}
                onClick={() => setFormData({ name: "", code: "", description: "", faculty: "" })}
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
