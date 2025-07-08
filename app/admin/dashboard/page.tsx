"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, ArrowUp, ArrowDown, Trash2, Users, Building2, Loader2, AlertTriangle } from "lucide-react"

// Types for API data
interface DashboardStats {
  totalItems: number
  stockInCount: number
  stockOutCount: number
  deadStockCount: number
  usersCount: number
  departmentsCount: number
}

interface RecentStockIn {
  _id: string
  item_name: string
  quantity: number
  received_at: string
  supplier?: string
}

interface RecentStockOut {
  _id: string
  item_name: string
  quantity: number
  issued_at: string
  user_name: string
  user_role: string
}

interface Item {
  _id: string
  name: string
  category?: string
  brand?: string
  description?: string
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalItems: 0,
    stockInCount: 0,
    stockOutCount: 0,
    deadStockCount: 0,
    usersCount: 0,
    departmentsCount: 0,
  })
  const [recentStockIn, setRecentStockIn] = useState<RecentStockIn[]>([])
  const [recentStockOut, setRecentStockOut] = useState<RecentStockOut[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>("")

  // Fetch all dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        setError("")

        // Helper function to safely fetch data
        const safeFetch = async (url: string) => {
          try {
            console.log(`Fetching from: ${url}`)
            const response = await fetch(url)
            if (response.ok) {
              const data = await response.json()
              console.log(`Data from ${url}:`, data)
              return data
            } else {
              console.warn(`Failed to fetch from ${url}: ${response.status}`)
              return []
            }
          } catch (error) {
            console.warn(`Error fetching from ${url}:`, error)
            return []
          }
        }

        // Try multiple possible API endpoints for stock data
        const stockInEndpoints = [
          "http://localhost:5000/api/stockins/get",
          "http://localhost:5000/api/stock-ins/get",
          "http://localhost:5000/api/stockin/get",
          "http://localhost:5000/api/stock-in/get",
        ]

        const stockOutEndpoints = [
          "http://localhost:5000/api/stockouts/get",
          "http://localhost:5000/api/stock-outs/get",
          "http://localhost:5000/api/stockout/get",
          "http://localhost:5000/api/stock-out/get",
        ]

        // Fetch basic data
        const [itemsData, deadstockData, usersData, departmentsData] = await Promise.all([
          safeFetch("http://localhost:5000/api/items/get"),
          safeFetch("http://localhost:5000/api/deadstocks/get"),
          safeFetch("http://localhost:5000/api/users/get"),
          safeFetch("http://localhost:5000/api/departments/get"),
        ])

        // Create items lookup map for getting item names by ID
        const itemsMap = new Map<string, Item>()
        itemsData.forEach((item: Item) => {
          itemsMap.set(item._id, item)
        })

        console.log("Items map created:", itemsMap.size, "items")

        // Try to fetch stock in data from multiple endpoints
        let stockInData = []
        for (const endpoint of stockInEndpoints) {
          stockInData = await safeFetch(endpoint)
          if (stockInData.length > 0) {
            console.log(`Successfully fetched stock in data from: ${endpoint}`)
            break
          }
        }

        // Try to fetch stock out data from multiple endpoints
        let stockOutData = []
        for (const endpoint of stockOutEndpoints) {
          stockOutData = await safeFetch(endpoint)
          if (stockOutData.length > 0) {
            console.log(`Successfully fetched stock out data from: ${endpoint}`)
            break
          }
        }

        console.log("Final data:", {
          items: itemsData.length,
          stockIn: stockInData.length,
          stockOut: stockOutData.length,
          deadstock: deadstockData.length,
          users: usersData.length,
          departments: departmentsData.length,
        })

        // Calculate current month's stock in/out
        const currentMonth = new Date().getMonth()
        const currentYear = new Date().getFullYear()

        const thisMonthStockIn = stockInData.filter((item: any) => {
          const dateField = item.received_at || item.date || item.created_at || item.createdAt
          if (!dateField) return false
          const itemDate = new Date(dateField)
          return itemDate.getMonth() === currentMonth && itemDate.getFullYear() === currentYear
        })

        const thisMonthStockOut = stockOutData.filter((item: any) => {
          const dateField = item.issued_at || item.date || item.created_at || item.createdAt
          if (!dateField) return false
          const itemDate = new Date(dateField)
          return itemDate.getMonth() === currentMonth && itemDate.getFullYear() === currentYear
        })

        // Set stats
        setStats({
          totalItems: itemsData.length,
          stockInCount: thisMonthStockIn.length,
          stockOutCount: thisMonthStockOut.length,
          deadStockCount: deadstockData.length,
          usersCount: usersData.length,
          departmentsCount: departmentsData.length,
        })

        // Process recent stock in activities with item name lookup
        console.log("Processing Stock In Data:", stockInData.slice(0, 3)) // Debug first 3 items
        const recentStockInEntries = stockInData
          .sort((a: any, b: any) => {
            const dateA = new Date(a.received_at || a.date || a.created_at || a.createdAt || 0)
            const dateB = new Date(b.received_at || b.date || b.created_at || b.createdAt || 0)
            return dateB.getTime() - dateA.getTime()
          })
          .slice(0, 3)
          .map((item: any) => {
            // Try different field names for product/item ID
            const productId = item.product_id || item.item_id || item.itemId || item.productId || item.item
            const foundItem = productId ? itemsMap.get(productId) : null

            console.log(`Stock In - Product ID: ${productId}, Found Item:`, foundItem) // Debug lookup

            return {
              _id: item._id || Math.random().toString(),
              item_name: foundItem ? foundItem.name : productId || "Unknown Item",
              quantity: item.quantity || item.qty || 0,
              received_at: item.received_at || item.date || item.created_at || item.createdAt,
              supplier: item.supplier || item.vendor || item.from,
            }
          })

        setRecentStockIn(recentStockInEntries)

        // Process recent stock out activities with item name lookup
        console.log("Processing Stock Out Data:", stockOutData.slice(0, 3)) // Debug first 3 items
        const recentStockOutEntries = stockOutData
          .sort((a: any, b: any) => {
            const dateA = new Date(a.issued_at || a.date || a.created_at || a.createdAt || 0)
            const dateB = new Date(b.issued_at || b.date || b.created_at || b.createdAt || 0)
            return dateB.getTime() - dateA.getTime()
          })
          .slice(0, 3)
          .map((item: any) => {
            // Try different field names for product/item ID
            const productId = item.product_id || item.item_id || item.itemId || item.productId || item.item
            const foundItem = productId ? itemsMap.get(productId) : null

            console.log(`Stock Out - Product ID: ${productId}, Found Item:`, foundItem) // Debug lookup

            return {
              _id: item._id || Math.random().toString(),
              item_name: foundItem ? foundItem.name : productId || "Unknown Item",
              quantity: item.quantity || item.qty || 0,
              issued_at: item.issued_at || item.date || item.created_at || item.createdAt,
              user_name: item.user_name || item.userName || item.requestedBy || item.issuedTo || "Unknown User",
              user_role: item.user_role || item.userRole || item.role || "Unknown",
            }
          })

        setRecentStockOut(recentStockOutEntries)

        console.log("Final processed data:", {
          recentStockIn: recentStockInEntries,
          recentStockOut: recentStockOutEntries,
        })
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
        setError("Some data could not be loaded. Please check your API connections.")
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2" style={{ color: "#51247a" }}>
            Dashboard
          </h2>
          <p style={{ color: "#666" }}>Overall inventory system status</p>
        </div>

        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" style={{ color: "#51247a" }} />
            <p className="text-gray-600">Loading dashboard data...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2" style={{ color: "#51247a" }}>
            Dashboard
          </h2>
          <p style={{ color: "#666" }}>Overall inventory system status</p>
        </div>

        <Card style={{ borderColor: "#e7e7e7", backgroundColor: "#ffffff" }}>
          <CardContent className="p-6">
            <div className="text-center text-red-600">
              <AlertTriangle className="w-8 h-8 mx-auto mb-4" />
              <p className="font-medium">Error loading dashboard</p>
              <p className="text-sm mt-1">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
              >
                Retry
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2" style={{ color: "#51247a" }}>
          Dashboard
        </h2>
        <p style={{ color: "#666" }}>Overall inventory system status</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card style={{ borderColor: "#e7e7e7", backgroundColor: "#ffffff" }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium" style={{ color: "#666" }}>
              Total Items
            </CardTitle>
            <Package className="h-4 w-4" style={{ color: "#51247a" }} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: "#51247a" }}>
              {stats.totalItems.toLocaleString()}
            </div>
            <p className="text-xs" style={{ color: "#666" }}>
              Various categories
            </p>
          </CardContent>
        </Card>

        <Card style={{ borderColor: "#e7e7e7", backgroundColor: "#ffffff" }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium" style={{ color: "#666" }}>
              Stock In
            </CardTitle>
            <ArrowUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: "#51247a" }}>
              {stats.stockInCount.toLocaleString()}
            </div>
            <p className="text-xs" style={{ color: "#666" }}>
              This month
            </p>
          </CardContent>
        </Card>

        <Card style={{ borderColor: "#e7e7e7", backgroundColor: "#ffffff" }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium" style={{ color: "#666" }}>
              Stock Out
            </CardTitle>
            <ArrowDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: "#51247a" }}>
              {stats.stockOutCount.toLocaleString()}
            </div>
            <p className="text-xs" style={{ color: "#666" }}>
              This month
            </p>
          </CardContent>
        </Card>

        <Card style={{ borderColor: "#e7e7e7", backgroundColor: "#ffffff" }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium" style={{ color: "#666" }}>
              Dead Stock
            </CardTitle>
            <Trash2 className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: "#51247a" }}>
              {stats.deadStockCount.toLocaleString()}
            </div>
            <p className="text-xs" style={{ color: "#666" }}>
              Total
            </p>
          </CardContent>
        </Card>

        <Card style={{ borderColor: "#e7e7e7", backgroundColor: "#ffffff" }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium" style={{ color: "#666" }}>
              Users
            </CardTitle>
            <Users className="h-4 w-4" style={{ color: "#002147" }} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: "#51247a" }}>
              {stats.usersCount.toLocaleString()}
            </div>
            <p className="text-xs" style={{ color: "#666" }}>
              Active
            </p>
          </CardContent>
        </Card>

        <Card style={{ borderColor: "#e7e7e7", backgroundColor: "#ffffff" }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium" style={{ color: "#666" }}>
              Departments
            </CardTitle>
            <Building2 className="h-4 w-4" style={{ color: "#51247a" }} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: "#51247a" }}>
              {stats.departmentsCount.toLocaleString()}
            </div>
            <p className="text-xs" style={{ color: "#666" }}>
              Total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card style={{ borderColor: "#e7e7e7", backgroundColor: "#ffffff" }}>
          <CardHeader>
            <CardTitle style={{ color: "#51247a" }}>Recent Stock In</CardTitle>
            <CardDescription style={{ color: "#666" }}>Latest stock entries</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentStockIn.length > 0 ? (
                recentStockIn.map((entry) => (
                  <div key={entry._id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium" style={{ color: "#51247a" }}>
                        {entry.item_name}
                      </p>
                      <p className="text-sm" style={{ color: "#666" }}>
                        {formatDate(entry.received_at)}
                        {entry.supplier && ` - ${entry.supplier}`}
                      </p>
                    </div>
                    <div className="text-green-600 font-semibold">+{entry.quantity}</div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No recent stock entries</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card style={{ borderColor: "#e7e7e7", backgroundColor: "#ffffff" }}>
          <CardHeader>
            <CardTitle style={{ color: "#51247a" }}>Recent Stock Out</CardTitle>
            <CardDescription style={{ color: "#666" }}>Latest stock issues</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentStockOut.length > 0 ? (
                recentStockOut.map((entry) => (
                  <div key={entry._id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium" style={{ color: "#51247a" }}>
                        {entry.item_name}
                      </p>
                      <p className="text-sm" style={{ color: "#666" }}>
                        {formatDate(entry.issued_at)} - {entry.user_name} ({entry.user_role})
                      </p>
                    </div>
                    <div className="text-red-600 font-semibold">-{entry.quantity}</div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No recent stock issues</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
