"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Save, RotateCcw, UserPlus, Eye, EyeOff } from "lucide-react"
import Link from "next/link"

interface Department {
  _id: string;  // Assuming _id is a string, change the type if needed
  name: string;
  code: string;
}

interface Office {
  _id: string;  // Assuming _id is a string, change the type if needed
  name: string;
  code: string;
}


export default function CreateUser() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
    departmentId: "",
    officeId: "",
    phone: "",
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [departments, setDepartments] = useState<Department[]>([]);
 // To store fetched departments
  const [offices, setOffices] = useState<Office[]>([]);
 // To store fetched offices
  const [apiError, setApiError] = useState("") // To store any API fetch errors

  // Fetch departments and offices from the API on component mount
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/departments/get")
        if (!response.ok) {
          throw new Error("Failed to fetch departments")
        }
        const data = await response.json()
        console.log("Fetched Departments: ", data); // Log departments
        setDepartments(data)
      } catch (err) {
        if (err instanceof Error) {
  setApiError("Error fetching departments: " + err.message)
} else {
  setApiError("An unknown error occurred.")
}

        console.error(err)
      }
    }

    const fetchOffices = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/offices/get")
        if (!response.ok) {
          throw new Error("Failed to fetch offices")
        }
        const data = await response.json()
        console.log("Fetched Offices: ", data); // Log offices
        setOffices(data)
      } catch (err) {
        if (err instanceof Error) {
  setApiError("Error fetching departments: " + err.message)
} else {
  setApiError("An unknown error occurred.")
}

        console.error(err)
      }
    }

    fetchDepartments()
    fetchOffices()
  }, [])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) newErrors.name = "Full name is required"
    if (!formData.email.trim()) newErrors.email = "Email is required"
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email is invalid"
    if (!formData.password) newErrors.password = "Password is required"
    else if (formData.password.length < 6) newErrors.password = "Password must be at least 6 characters"
    if (!formData.confirmPassword) newErrors.confirmPassword = "Confirm password is required"
    else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match"
    if (!formData.role) newErrors.role = "Role is required"
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required"
    else if (!/^(\+88)?01[3-9]\d{8}$/.test(formData.phone.replace(/\s/g, ""))) {
      newErrors.phone = "Please enter a valid Bangladesh phone number"
    }

    // Role-specific validations
    if (formData.role === "teacher") {
      if (!formData.departmentId) newErrors.departmentId = "Department is required for teachers"
    }
    if (formData.role === "staff") {
      if (!formData.officeId) newErrors.officeId = "Office is required for staff"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setLoading(true)

    try {
      const response = await fetch("http://localhost:5000/api/users/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          phone_number: formData.phone,
          department_id: formData.role === "teacher" ? formData.departmentId : null,
          office_id: formData.role === "staff" ? formData.officeId : null,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setSuccess(true)
        setFormData({
          name: "",
          email: "",
          password: "",
          confirmPassword: "",
          role: "",
          departmentId: "",
          officeId: "",
          phone: "",
        })
        setErrors({})
      } else {
        const errorData = await response.json()
        setErrors({ api: errorData.message })
      }
    } catch (err) {
      setErrors({ api: "An error occurred while creating the user" })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "",
      departmentId: "",
      officeId: "",
      phone: "",
    })
    setErrors({})
    setSuccess(false)
  }

  const generatePassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%"
    let password = ""
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setFormData((prev) => ({ ...prev, password, confirmPassword: password }))
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center space-x-4 mb-4">
          <Link href="/admin/users">
            <Button
              variant="outline"
              size="sm"
              className="bg-transparent"
              style={{ borderColor: "#e7e7e7", color: "#51247a" }}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Users
            </Button>
          </Link>
        </div>
        <div className="flex items-center space-x-3 mb-4">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ backgroundColor: "#edf5ff" }}
          >
            <UserPlus className="w-6 h-6" style={{ color: "#51247a" }} />
          </div>
          <div>
            <h2 className="text-3xl font-bold" style={{ color: "#51247a" }}>
              Create New User
            </h2>
            <p className="text-gray-600">Add new user account to the system</p>
          </div>
        </div>
      </div>

      {apiError && (
        <Alert className="border-red-200 bg-red-50">
          <AlertDescription className="text-red-700">{apiError}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <Card style={{ borderColor: "#e7e7e7", backgroundColor: "#ffffff" }}>
            <CardHeader>
              <CardTitle style={{ color: "#51247a" }}>User Information</CardTitle>
              <CardDescription>Fill in all required fields to create a new user account</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium" style={{ color: "#51247a" }}>
                    Basic Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" style={{ color: "#51247a" }}>
                        Full Name *
                      </Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleChange("name", e.target.value)}
                        placeholder="Enter full name"
                        className={`focus:border-purple-500 ${errors.name ? "border-red-300" : ""}`}
                        style={{ borderColor: errors.name ? "#ef4444" : "#e7e7e7" }}
                      />
                      {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
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
                        placeholder="user@pstu.ac.bd"
                        className={`focus:border-purple-500 ${errors.email ? "border-red-300" : ""}`}
                        style={{ borderColor: errors.email ? "#ef4444" : "#e7e7e7" }}
                      />
                      {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
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
                      <Label htmlFor="role" style={{ color: "#51247a" }}>
                        Role *
                      </Label>
                      <Select value={formData.role} onValueChange={(value) => handleChange("role", value)}>
                        <SelectTrigger
                          className={`focus:border-purple-500 ${errors.role ? "border-red-300" : ""}`}
                          style={{ borderColor: errors.role ? "#ef4444" : "#e7e7e7" }}
                        >
                          <SelectValue placeholder="Select Role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="teacher">Teacher</SelectItem>
                          <SelectItem value="staff">Staff</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.role && <p className="text-sm text-red-600">{errors.role}</p>}
                    </div>
                  </div>
                </div>

                {/* Role-specific Information */}
                {formData.role && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium" style={{ color: "#51247a" }}>
                      {formData.role === "teacher" ? "Academic Information" : "Office Information"}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {formData.role === "teacher" && (
                        <div className="space-y-2">
                          <Label htmlFor="department" style={{ color: "#51247a" }}>
                            Department *
                          </Label>
                          <Select
                            value={formData.departmentId}
                            onValueChange={(value) => handleChange("departmentId", value)}
                          >
                            <SelectTrigger
                              className={`focus:border-purple-500 ${errors.departmentId ? "border-red-300" : ""}`}
                              style={{ borderColor: errors.departmentId ? "#ef4444" : "#e7e7e7" }}
                            >
                              <SelectValue placeholder="Select Department" />
                            </SelectTrigger>
                            <SelectContent>
                              {departments.map((dept) => (
                                dept._id ? ( // Ensure the department has an _id
                                  <SelectItem key={dept._id} value={dept._id.toString()}>
                                    <div>
                                      <p className="font-medium">{dept.name}</p>
                                      <p className="text-sm text-gray-500">{dept.code}</p>
                                    </div>
                                  </SelectItem>
                                ) : null // If no _id, don't render it
                              ))}
                            </SelectContent>
                          </Select>
                          {errors.departmentId && <p className="text-sm text-red-600">{errors.departmentId}</p>}
                        </div>
                      )}

                      {formData.role === "staff" && (
                        <div className="space-y-2">
                          <Label htmlFor="office" style={{ color: "#51247a" }}>
                            Office *
                          </Label>
                          <Select
                            value={formData.officeId}
                            onValueChange={(value) => handleChange("officeId", value)}
                          >
                            <SelectTrigger
                              className={`focus:border-purple-500 ${errors.officeId ? "border-red-300" : ""}`}
                              style={{ borderColor: errors.officeId ? "#ef4444" : "#e7e7e7" }}
                            >
                              <SelectValue placeholder="Select Office" />
                            </SelectTrigger>
                            <SelectContent>
                              {offices.map((office) => (
                                office._id ? ( // Ensure the office has an _id
                                  <SelectItem key={office._id} value={office._id.toString()}>
                                    <div>
                                      <p className="font-medium">{office.name}</p>
                                      <p className="text-sm text-gray-500">{office.code}</p>
                                    </div>
                                  </SelectItem>
                                ) : null // If no _id, don't render it
                              ))}
                            </SelectContent>
                          </Select>
                          {errors.officeId && <p className="text-sm text-red-600">{errors.officeId}</p>}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Password Information */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium" style={{ color: "#51247a" }}>
                      Password Information
                    </h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={generatePassword}
                      className="bg-transparent"
                      style={{ borderColor: "#e7e7e7", color: "#51247a" }}
                    >
                      Generate Password
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="password" style={{ color: "#51247a" }}>
                        Password *
                      </Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          value={formData.password}
                          onChange={(e) => handleChange("password", e.target.value)}
                          placeholder="Enter password"
                          className={`focus:border-purple-500 pr-10 ${errors.password ? "border-red-300" : ""}`}
                          style={{ borderColor: errors.password ? "#ef4444" : "#e7e7e7" }}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-400" />
                          )}
                        </Button>
                      </div>
                      {errors.password && <p className="text-sm text-red-600">{errors.password}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" style={{ color: "#51247a" }}>
                        Confirm Password *
                      </Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          value={formData.confirmPassword}
                          onChange={(e) => handleChange("confirmPassword", e.target.value)}
                          placeholder="Confirm password"
                          className={`focus:border-purple-500 pr-10 ${errors.confirmPassword ? "border-red-300" : ""}`}
                          style={{ borderColor: errors.confirmPassword ? "#ef4444" : "#e7e7e7" }}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-400" />
                          )}
                        </Button>
                      </div>
                      {errors.confirmPassword && <p className="text-sm text-red-600">{errors.confirmPassword}</p>}
                    </div>
                  </div>
                </div>

                {success && (
                  <Alert className="border-green-200 bg-green-50">
                    <AlertDescription className="text-green-700">
                      User account created successfully! Login credentials have been sent to the user's email.
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
                    {loading ? "Creating..." : "Create User"}
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
      </div>
    </div>
  )
}
