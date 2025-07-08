"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Save, RotateCcw, Plus, Minus, ArrowDown, User, Loader2 } from "lucide-react"
import Link from "next/link"

// Types for API data
interface StockInRecord {
  _id: string
  user_id: string
  item_id: string
  supplier_id: string
  quantity: number
  unit_price: number
  total_price: number
  purchase_date: string
  invoice_no: string
  item_name?: string
  supplier_name?: string
  unit?: string
  category?: string
  available_quantity?: number
}

interface UserInfo {
  _id: string
  name: string
  email: string
  role?: string
  roll?: string
  department?: string
  department_id?: string
  office?: string
  office_id?: string
  phone?: string
  employee_id?: string
}

interface IssueItem {
  stockInId: string
  quantity: number
  usedLocation: string
  maxQuantity?: number
}

export default function CreateStockOut() {
  const [stockInRecords, setStockInRecords] = useState<StockInRecord[]>([])
  const [loadingStockIn, setLoadingStockIn] = useState(true)
  const [apiError, setApiError] = useState<string>("")

  const [formData, setFormData] = useState({
    userId: "",
    issueDate: "",
    issueBy: "",
    remarks: "",
  })
  const [issueItems, setIssueItems] = useState<IssueItem[]>([{ stockInId: "", quantity: 0, usedLocation: "" }])
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [loadingUser, setLoadingUser] = useState(false)
  const [userNotFound, setUserNotFound] = useState(false)

  // Fetch stock in records with available quantities
  useEffect(() => {
    const fetchStockInRecords = async () => {
      try {
        setLoadingStockIn(true)

        // Fetch stock in records from the stockins API
        const stockInResponse = await fetch("http://localhost:5000/api/stockins/get")
        if (!stockInResponse.ok) {
          throw new Error(`HTTP error! status: ${stockInResponse.status}`)
        }
        const stockInData = await stockInResponse.json()

        // Filter records that have available quantity > 0
        const availableRecords = stockInData.filter((record: any) => record.quantity > 0)

        setStockInRecords(availableRecords)
        setApiError("")
      } catch (error) {
        console.error("Error fetching stock in records:", error)
        setApiError("Failed to load stock records. Please check your connection.")
      } finally {
        setLoadingStockIn(false)
      }
    }

    fetchStockInRecords()
  }, [])

  // Fetch user information by ID
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

      // Clear any previous userId errors
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
    if (!formData.issueDate) newErrors.issueDate = "Issue date is required"
    if (!formData.issueBy.trim()) newErrors.issueBy = "Issue by is required"

    // Validate that user exists
    if (formData.userId.trim() && !userInfo) {
      newErrors.userId = "Please lookup user information first"
    }

    // Validate issue items
    issueItems.forEach((item, index) => {
      if (!item.stockInId) newErrors[`stockIn_${index}`] = "Stock item is required"
      if (item.quantity <= 0) newErrors[`quantity_${index}`] = "Quantity must be greater than 0"

      // Check available quantity from stock-in record
      const selectedStock = stockInRecords.find((s) => s._id === item.stockInId)
      if (selectedStock && item.quantity > selectedStock.quantity) {
        newErrors[`quantity_${index}`] = `Only ${selectedStock.quantity} items available in stock`
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const checkServerConnection = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/stockins/get", {
        method: "HEAD",
      })
      return response.ok
    } catch (error) {
      console.error("Server connection check failed:", error)
      return false
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    // Check server connection first
    const serverOnline = await checkServerConnection()
    if (!serverOnline) {
      setErrors({
        submit: "Cannot connect to server. Please check if the backend server is running on http://localhost:5000",
      })
      return
    }

    setLoading(true)

    try {
      // Create stock-out entries for each item
      const stockOutPromises = issueItems.map(async (item) => {
        const selectedStock = stockInRecords.find((s) => s._id === item.stockInId)
        const userRole = userInfo?.role || userInfo?.roll

        const stockOutData: any = {
          user_id: formData.userId,
          item_id: selectedStock?.item_id,
          issue_type: "manual",
          issue_by: formData.issueBy,
          issue_date: formData.issueDate,
          quantity: item.quantity,
          remarks: formData.remarks,
        }

        // Only add the relevant ID based on user role
        if ((userInfo?.role || userInfo?.roll) === "teacher" && userInfo?.department_id) {
          stockOutData.department_id = userInfo.department_id
          // Create a default/placeholder office document ID if needed
          stockOutData.office_id = "674b8c4b4f4b8c4b4f4b8c4b" // Replace with actual default office ID
        } else if ((userInfo?.role || userInfo?.roll) === "staff" && userInfo?.office_id) {
          stockOutData.office_id = userInfo.office_id
          // Create a default/placeholder department document ID if needed
          stockOutData.department_id = "674b8c4b4f4b8c4b4f4b8c4c" // Replace with actual default department ID
        } else {
          // For other roles, use default IDs for both
          stockOutData.department_id = "674b8c4b4f4b8c4b4f4b8c4c" // Replace with actual default department ID
          stockOutData.office_id = "674b8c4b4f4b8c4b4f4b8c4b" // Replace with actual default office ID
        }

        console.log("Sending stock out data:", stockOutData)

        const response = await fetch("http://localhost:5000/api/stockouts/create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(stockOutData),
        })

        let responseData
        try {
          responseData = await response.json()
          console.log("Response data:", responseData)
        } catch (jsonError) {
          console.error("Failed to parse JSON response:", jsonError)
          const textResponse = await response.text()
          console.log("Raw response text:", textResponse)
          throw new Error(`Server returned invalid JSON. Status: ${response.status}, Response: ${textResponse}`)
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

        return responseData
      })

      // Wait for all stock-out entries to be created
      await Promise.all(stockOutPromises)

      setSuccess(true)
      setFormData({
        userId: "",
        issueDate: "",
        issueBy: "",
        remarks: "",
      })
      setIssueItems([{ stockInId: "", quantity: 0, usedLocation: "" }])
      setUserInfo(null)
      setErrors({})
    } catch (error) {
      console.error("Error creating stock-out entries:", error)
      setErrors({
        submit: error instanceof Error ? error.message : "Failed to create stock-out entries. Please try again.",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }

    // Fetch user info when userId changes
    if (field === "userId") {
      fetchUserInfo(value)
    }
  }

  const handleIssueItemChange = (index: number, field: keyof IssueItem, value: string | number) => {
    const updatedItems = [...issueItems]
    updatedItems[index] = { ...updatedItems[index], [field]: value }
    setIssueItems(updatedItems)

    // Clear related errors
    if (errors[`${field}_${index}`]) {
      setErrors((prev) => ({ ...prev, [`${field}_${index}`]: "" }))
    }
  }

  const addIssueItem = () => {
    setIssueItems([...issueItems, { stockInId: "", quantity: 0, usedLocation: "" }])
  }

  const removeIssueItem = (index: number) => {
    if (issueItems.length > 1) {
      const updatedItems = issueItems.filter((_, i) => i !== index)
      setIssueItems(updatedItems)
    }
  }

  const resetForm = () => {
    setFormData({
      userId: "",
      issueDate: "",
      issueBy: "",
      remarks: "",
    })
    setIssueItems([{ stockInId: "", quantity: 0, usedLocation: "" }])
    setUserInfo(null)
    setUserNotFound(false)
    setErrors({})
    setSuccess(false)
  }

  const getTotalQuantity = () => {
    return issueItems.reduce((total, item) => total + item.quantity, 0)
  }

  const getSelectedStock = (stockInId: string) => {
    return stockInRecords.find((stock) => stock._id === stockInId)
  }

  const getUserRole = () => {
    return userInfo?.role || userInfo?.roll || ""
  }

  // When selecting an item, fetch its details and set max quantity
  const handleStockItemSelect = (index: number, stockInId: string) => {
    const selectedStock = stockInRecords.find((s) => s._id === stockInId)
    if (selectedStock) {
      // Update the item selection
      const updatedItems = [...issueItems]
      updatedItems[index] = {
        ...updatedItems[index],
        stockInId: stockInId,
        maxQuantity: selectedStock.quantity,
      }
      setIssueItems(updatedItems)

      // Clear any related errors
      if (errors[`stockIn_${index}`]) {
        setErrors((prev) => ({ ...prev, [`stockIn_${index}`]: "" }))
      }
    }
  }

  // Show loading state while data is being fetched
  if (loadingStockIn) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" style={{ color: "#51247a" }} />
            <p className="text-gray-600">Loading stock records...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center space-x-4 mb-4">
          <Link href="/admin/stock-out">
            <Button
              variant="outline"
              size="sm"
              className="bg-transparent"
              style={{ borderColor: "#e7e7e7", color: "#51247a" }}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Stock Out History
            </Button>
          </Link>
        </div>
        <div className="flex items-center space-x-3 mb-4">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ backgroundColor: "#fef2f2" }}
          >
            <ArrowDown className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h2 className="text-3xl font-bold" style={{ color: "#51247a" }}>
              Stock Out / Issue
            </h2>
            <p className="text-gray-600">Issue inventory items to users</p>
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
          {/* Issue Information */}
          <Card style={{ borderColor: "#e7e7e7", backgroundColor: "#ffffff" }}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2" style={{ color: "#51247a" }}>
                <User className="w-5 h-5" />
                <span>Issue Information</span>
              </CardTitle>
              <CardDescription>Enter details about the stock issue request</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="userId" style={{ color: "#51247a" }}>
                    Issue To (User ID) *
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
                  <Label htmlFor="issueBy" style={{ color: "#51247a" }}>
                    Issue By *
                  </Label>
                  <Input
                    id="issueBy"
                    value={formData.issueBy}
                    onChange={(e) => handleChange("issueBy", e.target.value)}
                    placeholder="Enter issuer name"
                    className={`focus:border-purple-500 ${errors.issueBy ? "border-red-300" : ""}`}
                    style={{ borderColor: errors.issueBy ? "#ef4444" : "#e7e7e7" }}
                  />
                  {errors.issueBy && <p className="text-sm text-red-600">{errors.issueBy}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="issueDate" style={{ color: "#51247a" }}>
                    Issue Date *
                  </Label>
                  <Input
                    id="issueDate"
                    type="date"
                    value={formData.issueDate}
                    onChange={(e) => handleChange("issueDate", e.target.value)}
                    className={`focus:border-purple-500 ${errors.issueDate ? "border-red-300" : ""}`}
                    style={{ borderColor: errors.issueDate ? "#ef4444" : "#e7e7e7" }}
                  />
                  {errors.issueDate && <p className="text-sm text-red-600">{errors.issueDate}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="remarks" style={{ color: "#51247a" }}>
                  Remarks
                </Label>
                <Textarea
                  id="remarks"
                  value={formData.remarks}
                  onChange={(e) => handleChange("remarks", e.target.value)}
                  placeholder="Enter any additional remarks or conditions"
                  rows={3}
                  className="focus:border-purple-500"
                  style={{ borderColor: "#e7e7e7" }}
                />
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
                      <p className="text-green-600 capitalize">{getUserRole()}</p>
                    </div>
                    {getUserRole() === "teacher" && userInfo.department && (
                      <div>
                        <span className="font-medium text-green-700">Department:</span>
                        <p className="text-green-600">{userInfo.department}</p>
                      </div>
                    )}
                    {getUserRole() === "staff" && userInfo.office && (
                      <div>
                        <span className="font-medium text-green-700">Office:</span>
                        <p className="text-green-600">{userInfo.office}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Issue Items */}
          <Card style={{ borderColor: "#e7e7e7", backgroundColor: "#ffffff" }}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2" style={{ color: "#51247a" }}>
                    <ArrowDown className="w-5 h-5" />
                    <span>Items to Issue</span>
                  </CardTitle>
                  <CardDescription>Select items from stock and quantities to be issued</CardDescription>
                </div>
                <Button
                  type="button"
                  onClick={addIssueItem}
                  className="text-white hover:bg-purple-700"
                  style={{ backgroundColor: "#51247a" }}
                  size="sm"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Item
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {issueItems.map((issueItem, index) => (
                <div
                  key={index}
                  className="p-4 border rounded-lg space-y-4"
                  style={{ borderColor: "#e7e7e7", backgroundColor: "#fef2f2" }}
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium" style={{ color: "#51247a" }}>
                      Item #{index + 1}
                    </h4>
                    {issueItems.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeIssueItem(index)}
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label style={{ color: "#51247a" }}>Stock Item *</Label>
                      <Select
                        value={issueItem.stockInId || ""}
                        onValueChange={(value) => handleStockItemSelect(index, value)}
                      >
                        <SelectTrigger
                          className={`focus:border-purple-500 ${errors[`stockIn_${index}`] ? "border-red-300" : ""}`}
                          style={{ borderColor: errors[`stockIn_${index}`] ? "#ef4444" : "#e7e7e7" }}
                        >
                          <SelectValue placeholder="Select Stock Item" />
                        </SelectTrigger>
                        <SelectContent>
                          {stockInRecords.map((stock) => (
                            <SelectItem key={stock._id} value={stock._id}>
                              <div>
                                <p className="font-medium">Stock ID: {stock._id}</p>
                                <p className="text-sm text-gray-500">
                                  Quantity: {stock.quantity} | Price: ৳{stock.unit_price}
                                </p>
                                <p className="text-xs text-gray-400">
                                  Invoice: {stock.invoice_no} | Date:{" "}
                                  {new Date(stock.purchase_date).toLocaleDateString()}
                                </p>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors[`stockIn_${index}`] && (
                        <p className="text-sm text-red-600">{errors[`stockIn_${index}`]}</p>
                      )}
                      {issueItem.stockInId && (
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-xs">
                            Available: {getSelectedStock(issueItem.stockInId)?.quantity}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            Price: ৳{getSelectedStock(issueItem.stockInId)?.unit_price}
                          </Badge>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label style={{ color: "#51247a" }}>Used Location (Optional)</Label>
                      <Input
                        value={issueItem.usedLocation}
                        onChange={(e) => handleIssueItemChange(index, "usedLocation", e.target.value)}
                        placeholder="Enter location where item will be used"
                        className="focus:border-purple-500"
                        style={{ borderColor: "#e7e7e7" }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label style={{ color: "#51247a" }}>Quantity *</Label>
                      <Input
                        type="number"
                        min="1"
                        max={getSelectedStock(issueItem.stockInId)?.quantity || undefined}
                        value={issueItem.quantity || ""}
                        onChange={(e) => handleIssueItemChange(index, "quantity", Number.parseInt(e.target.value) || 0)}
                        placeholder="0"
                        className={`focus:border-purple-500 ${errors[`quantity_${index}`] ? "border-red-300" : ""}`}
                        style={{ borderColor: errors[`quantity_${index}`] ? "#ef4444" : "#e7e7e7" }}
                      />
                      {errors[`quantity_${index}`] && (
                        <p className="text-sm text-red-600">{errors[`quantity_${index}`]}</p>
                      )}
                      {issueItem.stockInId && (
                        <p className="text-xs text-gray-500">
                          Max available: {getSelectedStock(issueItem.stockInId)?.quantity}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Summary Sidebar */}
        <div className="space-y-6">
          <Card style={{ borderColor: "#e7e7e7", backgroundColor: "#ffffff" }}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2" style={{ color: "#51247a" }}>
                <User className="w-5 h-5" />
                <span>Issue Summary</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Items:</span>
                  <Badge variant="outline">{issueItems.length}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Quantity:</span>
                  <Badge variant="outline">{getTotalQuantity()}</Badge>
                </div>
                <div className="border-t pt-3" style={{ borderColor: "#e7e7e7" }}>
                  <div className="flex justify-between items-center">
                    <span className="font-medium" style={{ color: "#51247a" }}>
                      Issue To:
                    </span>
                    <Badge variant="secondary">{userInfo ? userInfo.name : "Not Selected"}</Badge>
                  </div>
                </div>
              </div>

              {success && (
                <Alert className="border-green-200 bg-green-50">
                  <AlertDescription className="text-green-700">
                    Stock issue recorded successfully! Items have been deducted from inventory.
                  </AlertDescription>
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
                  {loading ? "Processing..." : "Issue Stock"}
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
