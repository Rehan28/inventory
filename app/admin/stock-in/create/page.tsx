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
import { ArrowLeft, Save, RotateCcw, Plus, Minus, Package, Calendar, User, Loader2 } from "lucide-react"
import Link from "next/link"

// Types for API data
interface Supplier {
  _id: string
  name: string
  contactPerson: string
  email?: string
  phone?: string
}

interface Item {
  _id: string
  name: string
  unit: string
  category: string
  description?: string
}

interface StockItem {
  itemId: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

interface UserInfo {
  _id: string
  name: string
  email: string
  role?: string
  roll?: string // Backend seems to use 'roll' instead of 'role'
  department?: string
  department_id?: string
  office?: string
  office_id?: string
  phone?: string
  employee_id?: string
}

export default function CreateStockIn() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [items, setItems] = useState<Item[]>([])
  const [loadingSuppliers, setLoadingSuppliers] = useState(true)
  const [loadingItems, setLoadingItems] = useState(true)
  const [apiError, setApiError] = useState<string>("")

  const [formData, setFormData] = useState({
    supplierId: "",
    invoiceNumber: "",
    invoiceDate: "",
    userId: "",
    remarks: "",
  })
  const [stockItems, setStockItems] = useState<StockItem[]>([{ itemId: "", quantity: 0, unitPrice: 0, totalPrice: 0 }])
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [loadingUser, setLoadingUser] = useState(false)
  const [userNotFound, setUserNotFound] = useState(false)

  // Fetch suppliers from API
  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        setLoadingSuppliers(true)
        const response = await fetch("http://localhost:5000/api/suppliers/get")
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        setSuppliers(data)
        setApiError("")
      } catch (error) {
        console.error("Error fetching suppliers:", error)
        setApiError("Failed to load suppliers. Please check your connection.")
      } finally {
        setLoadingSuppliers(false)
      }
    }

    fetchSuppliers()
  }, [])

  // Fetch items from API
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

      // Validate user has required department_id or office_id
      const userRole = data.role || data.roll
      if (userRole === "teacher" && !data.department_id) {
        setErrors((prev) => ({ ...prev, userId: "This teacher does not have a department_id assigned" }))
      } else if (userRole === "staff" && !data.office_id) {
        setErrors((prev) => ({ ...prev, userId: "This staff member does not have an office_id assigned" }))
      } else {
        // Clear any previous userId errors
        setErrors((prev) => ({ ...prev, userId: "" }))
      }
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

    if (!formData.supplierId) newErrors.supplierId = "Supplier is required"
    if (!formData.invoiceNumber.trim()) newErrors.invoiceNumber = "Invoice number is required"
    if (!formData.invoiceDate) newErrors.invoiceDate = "Invoice date is required"
    if (!formData.userId.trim()) newErrors.userId = "User ID is required"

    // Validate that user exists and has required department_id or office_id
    if (userInfo) {
      const userRole = userInfo.role || userInfo.roll
      if (userRole === "teacher") {
        if (!userInfo.department_id) {
          newErrors.userId = "This teacher does not have a department_id assigned in their profile"
        }
      } else if (userRole === "staff") {
        if (!userInfo.office_id) {
          newErrors.userId = "This staff member does not have an office_id assigned in their profile"
        }
      } else {
        newErrors.userId = `Invalid user role: ${userRole}. User must be either 'teacher' or 'staff'`
      }
    } else if (formData.userId.trim()) {
      newErrors.userId = "Please lookup user information first"
    }

    // Validate stock items
    stockItems.forEach((item, index) => {
      if (!item.itemId) newErrors[`item_${index}`] = "Item is required"
      if (item.quantity <= 0) newErrors[`quantity_${index}`] = "Quantity must be greater than 0"
      if (item.unitPrice <= 0) newErrors[`unitPrice_${index}`] = "Unit price must be greater than 0"
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const checkServerConnection = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/suppliers/get", {
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
      // Create stock-in entries for each item
      const stockInPromises = stockItems.map(async (item) => {
        const userRole = userInfo?.role || userInfo?.roll

        // Debug logging
        console.log("User Info:", userInfo)
        console.log("User Role:", userRole)
        console.log("Department ID:", userInfo?.department_id)
        console.log("Office ID:", userInfo?.office_id)

        const stockInData: any = {
          user_id: formData.userId,
          item_id: item.itemId,
          supplier_id: formData.supplierId,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          total_price: item.totalPrice,
          purchase_date: formData.invoiceDate,
          invoice_no: formData.invoiceNumber,
          remarks: formData.remarks,
          // Send appropriate IDs based on user role, use placeholder for required field
          department_id: userRole === "teacher" ? userInfo?.department_id || "" : "N/A",
          office_id: userRole === "staff" ? userInfo?.office_id || "" : "N/A",
        }

        console.log("Sending data:", stockInData)

        const response = await fetch("http://localhost:5000/api/stockins/create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(stockInData),
        })

        console.log("Response status:", response.status)
        console.log("Response headers:", response.headers)

        let errorData
        try {
          errorData = await response.json()
          console.log("Response data:", errorData)
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
            data: errorData,
          })

          const errorMessage =
            errorData?.message ||
            errorData?.error ||
            `HTTP ${response.status}: ${response.statusText}` ||
            "Unknown server error"

          throw new Error(errorMessage)
        }

        return errorData
      })

      // Wait for all stock-in entries to be created
      await Promise.all(stockInPromises)

      setSuccess(true)
      setFormData({
        supplierId: "",
        invoiceNumber: "",
        invoiceDate: "",
        userId: "",
        remarks: "",
      })
      setStockItems([{ itemId: "", quantity: 0, unitPrice: 0, totalPrice: 0 }])
      setUserInfo(null)
      setErrors({})
    } catch (error) {
      console.error("Error creating stock-in entries:", error)
      setErrors({
        submit: error instanceof Error ? error.message : "Failed to create stock-in entries. Please try again.",
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

  const handleStockItemChange = (index: number, field: keyof StockItem, value: string | number) => {
    const updatedItems = [...stockItems]
    updatedItems[index] = { ...updatedItems[index], [field]: value }

    // Calculate total price when quantity or unit price changes
    if (field === "quantity" || field === "unitPrice") {
      updatedItems[index].totalPrice = updatedItems[index].quantity * updatedItems[index].unitPrice
    }

    setStockItems(updatedItems)

    // Clear related errors
    if (errors[`${field}_${index}`]) {
      setErrors((prev) => ({ ...prev, [`${field}_${index}`]: "" }))
    }
  }

  const addStockItem = () => {
    setStockItems([...stockItems, { itemId: "", quantity: 0, unitPrice: 0, totalPrice: 0 }])
  }

  const removeStockItem = (index: number) => {
    if (stockItems.length > 1) {
      const updatedItems = stockItems.filter((_, i) => i !== index)
      setStockItems(updatedItems)
    }
  }

  const resetForm = () => {
    setFormData({
      supplierId: "",
      invoiceNumber: "",
      invoiceDate: "",
      userId: "",
      remarks: "",
    })
    setStockItems([{ itemId: "", quantity: 0, unitPrice: 0, totalPrice: 0 }])
    setUserInfo(null)
    setUserNotFound(false)
    setErrors({})
    setSuccess(false)
  }

  const getTotalAmount = () => {
    return stockItems.reduce((total, item) => total + item.totalPrice, 0)
  }

  const getSelectedItem = (itemId: string) => {
    return items.find((item) => item._id === itemId)
  }

  const getSelectedSupplier = (supplierId: string) => {
    return suppliers.find((supplier) => supplier._id === supplierId)
  }

  const getUserRole = () => {
    return userInfo?.role || userInfo?.roll || ""
  }

  // Show loading state while data is being fetched
  if (loadingSuppliers || loadingItems) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" style={{ color: "#51247a" }} />
            <p className="text-gray-600">Loading suppliers and items...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center space-x-4 mb-4">
          <Link href="/admin/stock-in">
            <Button
              variant="outline"
              size="sm"
              className="bg-transparent"
              style={{ borderColor: "#e7e7e7", color: "#51247a" }}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Stock In History
            </Button>
          </Link>
        </div>
        <div className="flex items-center space-x-3 mb-4">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ backgroundColor: "#edf5ff" }}
          >
            <Package className="w-6 h-6" style={{ color: "#51247a" }} />
          </div>
          <div>
            <h2 className="text-3xl font-bold" style={{ color: "#51247a" }}>
              Stock In Entry
            </h2>
            <p className="text-gray-600">Record new inventory items received from suppliers</p>
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
          {/* Supplier & Invoice Information */}
          <Card style={{ borderColor: "#e7e7e7", backgroundColor: "#ffffff" }}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2" style={{ color: "#51247a" }}>
                <User className="w-5 h-5" />
                <span>Supplier & Invoice Information</span>
              </CardTitle>
              <CardDescription>Enter supplier details and invoice information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="supplier" style={{ color: "#51247a" }}>
                    Supplier *
                  </Label>
                  <Select value={formData.supplierId} onValueChange={(value) => handleChange("supplierId", value)}>
                    <SelectTrigger
                      className={`focus:border-purple-500 ${errors.supplierId ? "border-red-300" : ""}`}
                      style={{ borderColor: errors.supplierId ? "#ef4444" : "#e7e7e7" }}
                    >
                      <SelectValue placeholder="Select Supplier" />
                    </SelectTrigger>
                    <SelectContent>
                      {suppliers.map((supplier) => (
                        <SelectItem key={supplier._id} value={supplier._id}>
                          <div>
                            <p className="font-medium">{supplier.name}</p>
                            <p className="text-sm text-gray-500">{supplier.contactPerson}</p>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.supplierId && <p className="text-sm text-red-600">{errors.supplierId}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="invoiceNumber" style={{ color: "#51247a" }}>
                    Invoice Number *
                  </Label>
                  <Input
                    id="invoiceNumber"
                    value={formData.invoiceNumber}
                    onChange={(e) => handleChange("invoiceNumber", e.target.value)}
                    placeholder="Enter invoice number"
                    className={`focus:border-purple-500 ${errors.invoiceNumber ? "border-red-300" : ""}`}
                    style={{ borderColor: errors.invoiceNumber ? "#ef4444" : "#e7e7e7" }}
                  />
                  {errors.invoiceNumber && <p className="text-sm text-red-600">{errors.invoiceNumber}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="invoiceDate" style={{ color: "#51247a" }}>
                    Invoice Date *
                  </Label>
                  <Input
                    id="invoiceDate"
                    type="date"
                    value={formData.invoiceDate}
                    onChange={(e) => handleChange("invoiceDate", e.target.value)}
                    className={`focus:border-purple-500 ${errors.invoiceDate ? "border-red-300" : ""}`}
                    style={{ borderColor: errors.invoiceDate ? "#ef4444" : "#e7e7e7" }}
                  />
                  {errors.invoiceDate && <p className="text-sm text-red-600">{errors.invoiceDate}</p>}
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
                  placeholder="Enter any additional remarks or notes"
                  rows={3}
                  className="focus:border-purple-500"
                  style={{ borderColor: "#e7e7e7" }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Receiver Information */}
          <Card style={{ borderColor: "#e7e7e7", backgroundColor: "#ffffff" }}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2" style={{ color: "#51247a" }}>
                <User className="w-5 h-5" />
                <span>Receiver Information</span>
              </CardTitle>
              <CardDescription>Enter receiver user ID and additional details</CardDescription>
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
              </div>

              {/* Conditional Department/Office ID fields */}

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
                    {userInfo.employee_id && (
                      <div>
                        <span className="font-medium text-green-700">Employee ID:</span>
                        <p className="text-green-600">{userInfo.employee_id}</p>
                      </div>
                    )}
                    {getUserRole() === "teacher" && userInfo.department_id && (
                      <div>
                        <span className="font-medium text-green-700">Department ID:</span>
                        <p className="text-green-600">{userInfo.department_id}</p>
                      </div>
                    )}
                    {getUserRole() === "teacher" && userInfo.department && (
                      <div>
                        <span className="font-medium text-green-700">Department:</span>
                        <p className="text-green-600">{userInfo.department}</p>
                      </div>
                    )}
                    {getUserRole() === "staff" && userInfo.office_id && (
                      <div>
                        <span className="font-medium text-green-700">Office ID:</span>
                        <p className="text-green-600">{userInfo.office_id}</p>
                      </div>
                    )}
                    {getUserRole() === "staff" && userInfo.office && (
                      <div>
                        <span className="font-medium text-green-700">Office:</span>
                        <p className="text-green-600">{userInfo.office}</p>
                      </div>
                    )}
                    {userInfo.phone && (
                      <div>
                        <span className="font-medium text-green-700">Phone:</span>
                        <p className="text-green-600">{userInfo.phone}</p>
                      </div>
                    )}
                  </div>

                  {/* Show validation message if department_id or office_id is missing */}
                  {getUserRole() === "teacher" && !userInfo.department_id && (
                    <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded">
                      <p className="text-red-700 text-sm">
                        ⚠️ This teacher does not have a department_id assigned. Please contact admin.
                      </p>
                    </div>
                  )}
                  {getUserRole() === "staff" && !userInfo.office_id && (
                    <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded">
                      <p className="text-red-700 text-sm">
                        ⚠️ This staff member does not have an office_id assigned. Please contact admin.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Stock Items Section */}
          <Card style={{ borderColor: "#e7e7e7", backgroundColor: "#ffffff" }}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2" style={{ color: "#51247a" }}>
                    <Package className="w-5 h-5" />
                    <span>Stock Items</span>
                  </CardTitle>
                  <CardDescription>Add items to be received into inventory</CardDescription>
                </div>
                <Button
                  type="button"
                  onClick={addStockItem}
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
              {stockItems.map((stockItem, index) => (
                <div
                  key={index}
                  className="p-4 border rounded-lg space-y-4"
                  style={{ borderColor: "#e7e7e7", backgroundColor: "#f8fafc" }}
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium" style={{ color: "#51247a" }}>
                      Item #{index + 1}
                    </h4>
                    {stockItems.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeStockItem(index)}
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label style={{ color: "#51247a" }}>Item *</Label>
                      <Select
                        value={stockItem.itemId || "defaultItemId"}
                        onValueChange={(value) => handleStockItemChange(index, "itemId", value)}
                      >
                        <SelectTrigger
                          className={`focus:border-purple-500 ${errors[`item_${index}`] ? "border-red-300" : ""}`}
                          style={{ borderColor: errors[`item_${index}`] ? "#ef4444" : "#e7e7e7" }}
                        >
                          <SelectValue placeholder="Select Item" />
                        </SelectTrigger>
                        <SelectContent>
                          {items.map((item) => (
                            <SelectItem key={item._id} value={item._id}>
                              <div>
                                <p className="font-medium">{item.name}</p>
                                <p className="text-sm text-gray-500">
                                  {item.category} - {item.unit}
                                </p>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors[`item_${index}`] && <p className="text-sm text-red-600">{errors[`item_${index}`]}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label style={{ color: "#51247a" }}>Quantity *</Label>
                      <Input
                        type="number"
                        min="1"
                        value={stockItem.quantity || ""}
                        onChange={(e) => handleStockItemChange(index, "quantity", Number.parseInt(e.target.value) || 0)}
                        placeholder="0"
                        className={`focus:border-purple-500 ${errors[`quantity_${index}`] ? "border-red-300" : ""}`}
                        style={{ borderColor: errors[`quantity_${index}`] ? "#ef4444" : "#e7e7e7" }}
                      />
                      {errors[`quantity_${index}`] && (
                        <p className="text-sm text-red-600">{errors[`quantity_${index}`]}</p>
                      )}
                      {stockItem.itemId && (
                        <p className="text-xs text-gray-500">Unit: {getSelectedItem(stockItem.itemId)?.unit}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label style={{ color: "#51247a" }}>Unit Price (৳) *</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={stockItem.unitPrice || ""}
                        onChange={(e) =>
                          handleStockItemChange(index, "unitPrice", Number.parseFloat(e.target.value) || 0)
                        }
                        placeholder="0.00"
                        className={`focus:border-purple-500 ${errors[`unitPrice_${index}`] ? "border-red-300" : ""}`}
                        style={{ borderColor: errors[`unitPrice_${index}`] ? "#ef4444" : "#e7e7e7" }}
                      />
                      {errors[`unitPrice_${index}`] && (
                        <p className="text-sm text-red-600">{errors[`unitPrice_${index}`]}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label style={{ color: "#51247a" }}>Total Price (৳)</Label>
                      <div
                        className="h-10 px-3 py-2 border rounded-md bg-gray-50 flex items-center font-medium"
                        style={{ borderColor: "#e7e7e7", color: "#51247a" }}
                      >
                        ৳{stockItem.totalPrice.toFixed(2)}
                      </div>
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
                <Calendar className="w-5 h-5" />
                <span>Summary</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Items:</span>
                  <Badge variant="outline">{stockItems.length}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Quantity:</span>
                  <Badge variant="outline">{stockItems.reduce((total, item) => total + item.quantity, 0)}</Badge>
                </div>
                <div className="border-t pt-3" style={{ borderColor: "#e7e7e7" }}>
                  <div className="flex justify-between items-center">
                    <span className="font-medium" style={{ color: "#51247a" }}>
                      Total Amount:
                    </span>
                    <span className="text-lg font-bold" style={{ color: "#51247a" }}>
                      ৳{getTotalAmount().toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {success && (
                <Alert className="border-green-200 bg-green-50">
                  <AlertDescription className="text-green-700">
                    Stock entry recorded successfully! Items have been added to inventory.
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
                  {loading ? "Processing..." : "Record Stock In"}
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

          {/* Quick Info */}
          <Card style={{ borderColor: "#e7e7e7", backgroundColor: "#edf5ff" }}>
            <CardContent className="p-4">
              <h4 className="font-medium mb-3" style={{ color: "#51247a" }}>
                Quick Tips:
              </h4>
              <ul className="text-sm space-y-2" style={{ color: "#666" }}>
                <li>• Ensure all invoice details are accurate</li>
                <li>• Double-check quantities and prices</li>
                <li>• Add remarks for special conditions</li>
                <li>• Items will be automatically added to inventory</li>
                <li>• Department/Office ID will be auto-filled from user profile</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
