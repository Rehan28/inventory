"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Save, RotateCcw, AlertTriangle, Loader2 } from "lucide-react"
import Link from "next/link"

// Types for API data
interface UserInfo {
  _id: string
  name: string
  email: string
  role?: string
  roll?: string
  department?: string
  office?: string
}

interface ItemInfo {
  _id: string
  name: string
  category?: string
  unit?: string
  description?: string
  brand?: string
}

const deadstockReasons = [
  "Damaged",
  "Expired",
  "Obsolete",
  "Lost",
  "Stolen",
  "Defective",
  "Worn Out",
  "Broken",
  "Contaminated",
  "Other",
]

export default function CreateDeadstock() {
  const [apiError, setApiError] = useState<string>("")

  const [formData, setFormData] = useState({
    userId: "",
    itemId: "",
    quantity: 0,
    reason: "",
    reportedAt: "",
  })

  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [loadingUser, setLoadingUser] = useState(false)
  const [userNotFound, setUserNotFound] = useState(false)

  const [items, setItems] = useState<ItemInfo[]>([])
  const [loadingItems, setLoadingItems] = useState(true)

  // Fetch user information by ID
  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoadingItems(true)
        const response = await fetch("http://localhost:5000/api/items/get")
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        setItems(data)
        setApiError("")
      } catch (error) {
        console.error("Error fetching items:", error)
        setApiError("Failed to load items. Please check your connection.")
      } finally {
        setLoadingItems(false)
      }
    }

    fetchItems()
  }, [])

  const fetchUserInfo = async (userId: string) => {
    if (!userId.trim()) {
      setUserInfo(null)
      setUserNotFound(false)
      return
    }

    try {
      setLoadingUser(true)
      setUserNotFound(false)
      const response = await fetch(`http://localhost:5000/api/users/get/${userId}`)

      if (!response.ok) {
        if (response.status === 404) {
          setUserNotFound(true)
          setUserInfo(null)
        } else {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        return
      }

      const data = await response.json()
      setUserInfo(data)
      setUserNotFound(false)
      setErrors((prev) => ({ ...prev, userId: "" }))
    } catch (error) {
      console.error("Error fetching user info:", error)
      setUserNotFound(true)
      setUserInfo(null)
    } finally {
      setLoadingUser(false)
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.userId.trim()) newErrors.userId = "User ID is required"
    if (!formData.itemId.trim()) newErrors.itemId = "Item ID is required"
    if (formData.quantity <= 0) newErrors.quantity = "Quantity must be greater than 0"
    if (!formData.reason.trim()) newErrors.reason = "Reason is required"
    if (!formData.reportedAt) newErrors.reportedAt = "Reported date is required"

    // Validate that user exists
    if (formData.userId.trim() && !userInfo) {
      newErrors.userId = "Please lookup user information first"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setLoading(true)

    try {
      const deadstockData = {
        user_id: formData.userId,
        item_id: formData.itemId,
        quantity: formData.quantity,
        reason: formData.reason,
        reported_at: formData.reportedAt,
      }

      console.log("Sending deadstock data:", deadstockData)

      const response = await fetch("http://localhost:5000/api/deadstocks/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(deadstockData),
      })

      let responseData
      try {
        responseData = await response.json()
        console.log("Response data:", responseData)
      } catch (jsonError) {
        console.error("Failed to parse JSON response:", jsonError)
        const textResponse = await response.text()
        console.log("Raw response text:", textResponse)
        throw new Error(`Server returned invalid JSON. Status: ${response.status}`)
      }

      if (!response.ok) {
        console.error("API Error Details:", {
          status: response.status,
          statusText: response.statusText,
          data: responseData,
        })

        const errorMessage =
          responseData?.message ||
          responseData?.error ||
          `HTTP ${response.status}: ${response.statusText}` ||
          "Unknown server error"
        throw new Error(errorMessage)
      }

      setSuccess(true)
      setFormData({
        userId: "",
        itemId: "",
        quantity: 0,
        reason: "",
        reportedAt: "",
      })
      setUserInfo(null)
      setErrors({})
    } catch (error) {
      console.error("Error creating deadstock record:", error)
      setErrors({
        submit: error instanceof Error ? error.message : "Failed to create deadstock record. Please try again.",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }

    // Fetch user info when userId changes
    if (field === "userId" && typeof value === "string") {
      fetchUserInfo(value)
    }
  }

  const resetForm = () => {
    setFormData({
      userId: "",
      itemId: "",
      quantity: 0,
      reason: "",
      reportedAt: "",
    })
    setUserInfo(null)
    setUserNotFound(false)
    setErrors({})
    setSuccess(false)
  }

  // Show loading state while data is being fetched
  if (loadingItems) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" style={{ color: "#51247a" }} />
            <p className="text-gray-600">Loading items...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center space-x-4 mb-4">
          <Link href="/admin/deadstock">
            <Button
              variant="outline"
              size="sm"
              className="bg-transparent"
              style={{ borderColor: "#e7e7e7", color: "#51247a" }}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Deadstock Records
            </Button>
          </Link>
        </div>
        <div className="flex items-center space-x-3 mb-4">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ backgroundColor: "#fef2f2" }}
          >
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h2 className="text-3xl font-bold" style={{ color: "#51247a" }}>
              Report Deadstock
            </h2>
            <p className="text-gray-600">Report damaged, expired, or unusable inventory items</p>
          </div>
        </div>
      </div>

      {/* API Error Alert */}
      {apiError && (
        <Alert className="mb-6 border-red-200 bg-red-50">
          <AlertDescription className="text-red-700">{apiError}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Deadstock Information */}
          <Card style={{ borderColor: "#e7e7e7", backgroundColor: "#ffffff" }}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2" style={{ color: "#51247a" }}>
                <AlertTriangle className="w-5 h-5" />
                <span>Deadstock Information</span>
              </CardTitle>
              <CardDescription>Enter details about the deadstock item</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="userId" style={{ color: "#51247a" }}>
                    User ID *
                  </Label>
                  <div className="flex space-x-2">
                    <Input
                      id="userId"
                      value={formData.userId}
                      onChange={(e) => handleChange("userId", e.target.value)}
                      onBlur={() => fetchUserInfo(formData.userId)}
                      placeholder="Enter user ID"
                      className={`focus:border-purple-500 ${errors.userId ? "border-red-300" : ""}`}
                      style={{ borderColor: errors.userId ? "#ef4444" : "#e7e7e7" }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fetchUserInfo(formData.userId)}
                      disabled={!formData.userId || loadingUser}
                      className="px-3"
                      style={{ borderColor: "#e7e7e7", color: "#51247a" }}
                    >
                      {loadingUser ? <Loader2 className="w-4 h-4 animate-spin" /> : "Lookup"}
                    </Button>
                  </div>
                  {errors.userId && <p className="text-sm text-red-600">{errors.userId}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="itemId" style={{ color: "#51247a" }}>
                    Item *
                  </Label>
                  <Select value={formData.itemId} onValueChange={(value) => handleChange("itemId", value)}>
                    <SelectTrigger
                      className={`focus:border-purple-500 ${errors.itemId ? "border-red-300" : ""}`}
                      style={{ borderColor: errors.itemId ? "#ef4444" : "#e7e7e7" }}
                    >
                      <SelectValue placeholder="Select Item" />
                    </SelectTrigger>
                    <SelectContent>
                      {items.map((item) => (
                        <SelectItem key={item._id} value={item._id}>
                          <div>
                            <p className="font-medium">{item.name}</p>
                            {item.category && <p className="text-sm text-gray-500">Category: {item.category}</p>}
                            {item.brand && <p className="text-xs text-gray-400">Brand: {item.brand}</p>}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.itemId && <p className="text-sm text-red-600">{errors.itemId}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity" style={{ color: "#51247a" }}>
                    Quantity *
                  </Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={formData.quantity || ""}
                    onChange={(e) => handleChange("quantity", Number.parseInt(e.target.value) || 0)}
                    placeholder="0"
                    className={`focus:border-purple-500 ${errors.quantity ? "border-red-300" : ""}`}
                    style={{ borderColor: errors.quantity ? "#ef4444" : "#e7e7e7" }}
                  />
                  {errors.quantity && <p className="text-sm text-red-600">{errors.quantity}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="reason" style={{ color: "#51247a" }}>
                    Reason *
                  </Label>
                  <Select value={formData.reason} onValueChange={(value) => handleChange("reason", value)}>
                    <SelectTrigger
                      className={`focus:border-purple-500 ${errors.reason ? "border-red-300" : ""}`}
                      style={{ borderColor: errors.reason ? "#ef4444" : "#e7e7e7" }}
                    >
                      <SelectValue placeholder="Select Reason" />
                    </SelectTrigger>
                    <SelectContent>
                      {deadstockReasons.map((reason) => (
                        <SelectItem key={reason} value={reason}>
                          {reason}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.reason && <p className="text-sm text-red-600">{errors.reason}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reportedAt" style={{ color: "#51247a" }}>
                    Reported Date *
                  </Label>
                  <Input
                    id="reportedAt"
                    type="date"
                    value={formData.reportedAt}
                    onChange={(e) => handleChange("reportedAt", e.target.value)}
                    className={`focus:border-purple-500 ${errors.reportedAt ? "border-red-300" : ""}`}
                    style={{ borderColor: errors.reportedAt ? "#ef4444" : "#e7e7e7" }}
                  />
                  {errors.reportedAt && <p className="text-sm text-red-600">{errors.reportedAt}</p>}
                </div>
              </div>

              {/* User Information Display */}
              {loadingUser && (
                <div className="flex items-center justify-center p-4 bg-gray-50 rounded-lg">
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  <span>Looking up user...</span>
                </div>
              )}

              {userNotFound && formData.userId && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-700">
                    User with ID "{formData.userId}" not found. Please check the ID and try again.
                  </AlertDescription>
                </Alert>
              )}

              {userInfo && (
                <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                  <h4 className="font-medium mb-3 text-green-800">User Information:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="font-medium text-green-700">Name:</span>
                      <p className="text-green-600">{userInfo.name}</p>
                    </div>
                    <div>
                      <span className="font-medium text-green-700">Email:</span>
                      <p className="text-green-600">{userInfo.email}</p>
                    </div>
                    <div>
                      <span className="font-medium text-green-700">Role:</span>
                      <p className="text-green-600 capitalize">{userInfo.role || userInfo.roll}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Summary Sidebar */}
        <div className="space-y-6">
          <Card style={{ borderColor: "#e7e7e7", backgroundColor: "#ffffff" }}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2" style={{ color: "#51247a" }}>
                <AlertTriangle className="w-5 h-5" />
                <span>Deadstock Summary</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Item:</span>
                  <Badge variant="outline">
                    {items.find((item) => item._id === formData.itemId)?.name || "Not Selected"}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Quantity:</span>
                  <Badge variant="outline">{formData.quantity}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Reason:</span>
                  <Badge variant="destructive">{formData.reason || "Not Selected"}</Badge>
                </div>
                <div className="border-t pt-3" style={{ borderColor: "#e7e7e7" }}>
                  <div className="flex justify-between items-center">
                    <span className="font-medium" style={{ color: "#51247a" }}>
                      Reported By:
                    </span>
                    <Badge variant="secondary">{userInfo ? userInfo.name : "Not Selected"}</Badge>
                  </div>
                </div>
              </div>

              {success && (
                <Alert className="border-green-200 bg-green-50">
                  <AlertDescription className="text-green-700">Deadstock record created successfully!</AlertDescription>
                </Alert>
              )}

              {errors.submit && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-700">{errors.submit}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-3 pt-4">
                <Button
                  onClick={handleSubmit}
                  className="w-full text-white hover:bg-purple-700 flex items-center justify-center"
                  style={{ backgroundColor: "#51247a" }}
                  disabled={loading}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? "Processing..." : "Report Deadstock"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full bg-transparent hover:bg-purple-50 flex items-center justify-center"
                  style={{ borderColor: "#e7e7e7", color: "#51247a" }}
                  onClick={resetForm}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset Form
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
