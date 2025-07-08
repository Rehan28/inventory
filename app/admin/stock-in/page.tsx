"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Plus, Eye, FileText, Loader2, Package, TrendingUp } from "lucide-react"
import Link from "next/link"

// Types for API data
interface StockInRecord {
  _id: string
  user_id: string
  department_id?: string
  office_id?: string
  item_id: string
  supplier_id: string
  quantity: number
  unit_price: number
  total_price: number
  purchase_date: string
  invoice_no: string
  remarks?: string
  createdAt: string
}

interface Supplier {
  _id: string
  name: string
  contactPerson: string
  email?: string
  phone?: string
}

interface User {
  _id: string
  name: string
  email: string
  role?: string
  roll?: string
  department?: string
  office?: string
}

interface Department {
  _id: string
  name: string
  description?: string
}

interface EnrichedStockInRecord extends StockInRecord {
  supplierName: string
  receiverName: string
  departmentName: string
}

export default function StockInPage() {
  const [stockInRecords, setStockInRecords] = useState<EnrichedStockInRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSupplier, setSelectedSupplier] = useState("All Suppliers")
  const [filteredRecords, setFilteredRecords] = useState<EnrichedStockInRecord[]>([])
  const [suppliers, setSuppliers] = useState<string[]>(["All Suppliers"])
  const [error, setError] = useState<string>("")

  // Fetch all required data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError("")

        // Fetch stock in records
        const stockInResponse = await fetch("http://localhost:5000/api/stockins/get")
        if (!stockInResponse.ok) {
          throw new Error("Failed to fetch stock in records")
        }
        const stockInData: StockInRecord[] = await stockInResponse.json()

        // Fetch suppliers
        const suppliersResponse = await fetch("http://localhost:5000/api/suppliers/get")
        if (!suppliersResponse.ok) {
          throw new Error("Failed to fetch suppliers")
        }
        const suppliersData: Supplier[] = await suppliersResponse.json()

        // Fetch users
        const usersResponse = await fetch("http://localhost:5000/api/users/get")
        if (!usersResponse.ok) {
          throw new Error("Failed to fetch users")
        }
        const usersData: User[] = await usersResponse.json()

        // Fetch departments
        const departmentsResponse = await fetch("http://localhost:5000/api/departments/get")
        if (!departmentsResponse.ok) {
          throw new Error("Failed to fetch departments")
        }
        const departmentsData: Department[] = await departmentsResponse.json()

        // Create lookup maps for efficient data enrichment
        const supplierMap = new Map(suppliersData.map((s) => [s._id, s]))
        const userMap = new Map(usersData.map((u) => [u._id, u]))
        const departmentMap = new Map(departmentsData.map((d) => [d._id, d]))

        // Enrich stock in records with related data
        const enrichedRecords: EnrichedStockInRecord[] = stockInData.map((record) => {
          const supplier = supplierMap.get(record.supplier_id)
          const user = userMap.get(record.user_id)
          const department = record.department_id ? departmentMap.get(record.department_id) : null

          return {
            ...record,
            supplierName: supplier?.name || "Unknown Supplier",
            receiverName: user?.name || "Unknown User",
            departmentName: department?.name || user?.office || "N/A",
          }
        })

        // Set up supplier filter options
        const uniqueSuppliers = ["All Suppliers", ...Array.from(new Set(enrichedRecords.map((r) => r.supplierName)))]

        setStockInRecords(enrichedRecords)
        setFilteredRecords(enrichedRecords)
        setSuppliers(uniqueSuppliers)
      } catch (error) {
        console.error("Error fetching data:", error)
        setError(error instanceof Error ? error.message : "Failed to load data")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    filterRecords(value, selectedSupplier)
  }

  const handleSupplierFilter = (supplier: string) => {
    setSelectedSupplier(supplier)
    filterRecords(searchTerm, supplier)
  }

  const filterRecords = (search: string, supplier: string) => {
    let filtered = stockInRecords

    if (search) {
      filtered = filtered.filter(
        (record) =>
          record.invoice_no.toLowerCase().includes(search.toLowerCase()) ||
          record.supplierName.toLowerCase().includes(search.toLowerCase()) ||
          record.receiverName.toLowerCase().includes(search.toLowerCase()) ||
          record.departmentName.toLowerCase().includes(search.toLowerCase()),
      )
    }

    if (supplier !== "All Suppliers") {
      filtered = filtered.filter((record) => record.supplierName === supplier)
    }

    setFilteredRecords(filtered)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const formatCurrency = (amount: number) => {
    return `৳${amount.toLocaleString()}`
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold" style={{ color: "#51247a" }}>
              Stock In Management
            </h2>
            <p className="text-gray-600">Track and manage all inventory receipts and stock entries</p>
          </div>
          <Link href="/admin/stock-in/create">
            <Button className="text-white hover:bg-purple-700 flex items-center" style={{ backgroundColor: "#51247a" }}>
              <Plus className="w-4 h-4 mr-2" />
              New Stock Entry
            </Button>
          </Link>
        </div>

        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" style={{ color: "#51247a" }} />
            <p className="text-gray-600">Loading stock in records...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold" style={{ color: "#51247a" }}>
              Stock In Management
            </h2>
            <p className="text-gray-600">Track and manage all inventory receipts and stock entries</p>
          </div>
          <Link href="/admin/stock-in/create">
            <Button className="text-white hover:bg-purple-700 flex items-center" style={{ backgroundColor: "#51247a" }}>
              <Plus className="w-4 h-4 mr-2" />
              New Stock Entry
            </Button>
          </Link>
        </div>

        <Card style={{ borderColor: "#e7e7e7", backgroundColor: "#ffffff" }}>
          <CardContent className="p-6">
            <div className="text-center text-red-600">
              <p className="font-medium">Error loading data</p>
              <p className="text-sm mt-1">{error}</p>
              <Button onClick={() => window.location.reload()} className="mt-4" variant="outline">
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: "#51247a" }}>
            Stock In Management
          </h2>
          <p className="text-gray-600">Track and manage all inventory receipts and stock entries</p>
        </div>
        <Link href="/admin/stock-in/create">
          <Button className="text-white hover:bg-purple-700 flex items-center" style={{ backgroundColor: "#51247a" }}>
            <Plus className="w-4 h-4 mr-2" />
            New Stock Entry
          </Button>
        </Link>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card style={{ borderColor: "#e7e7e7", backgroundColor: "#ffffff" }}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Stock Entries</p>
                <p className="text-2xl font-bold" style={{ color: "#51247a" }}>
                  {stockInRecords.length}
                </p>
              </div>
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ backgroundColor: "#edf5ff" }}
              >
                <FileText className="w-4 h-4" style={{ color: "#51247a" }} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card style={{ borderColor: "#e7e7e7", backgroundColor: "#ffffff" }}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Items</p>
                <p className="text-2xl font-bold text-green-600">
                  {stockInRecords.reduce((sum, record) => sum + record.quantity, 0)}
                </p>
              </div>
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <Package className="w-4 h-4 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card style={{ borderColor: "#e7e7e7", backgroundColor: "#ffffff" }}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Value</p>
                <p className="text-2xl font-bold text-blue-600">
                  ৳{stockInRecords.reduce((sum, record) => sum + record.total_price, 0).toLocaleString()}
                </p>
              </div>
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card style={{ borderColor: "#e7e7e7", backgroundColor: "#ffffff" }}>
        <CardHeader>
          <CardTitle style={{ color: "#51247a" }}>Stock In Records</CardTitle>
          <CardDescription>View and manage all stock receipt records</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by invoice, supplier, receiver, or department..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 focus:border-purple-500"
                style={{ borderColor: "#e7e7e7" }}
              />
            </div>
            <Select value={selectedSupplier} onValueChange={handleSupplierFilter}>
              <SelectTrigger className="w-48 focus:border-purple-500" style={{ borderColor: "#e7e7e7" }}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {suppliers.map((supplier) => (
                  <SelectItem key={supplier} value={supplier}>
                    {supplier}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border" style={{ borderColor: "#e7e7e7" }}>
            <Table>
              <TableHeader>
                <TableRow style={{ backgroundColor: "#f8fafc" }}>
                  <TableHead style={{ color: "#51247a" }}>No</TableHead>
                  <TableHead style={{ color: "#51247a" }}>Supplier</TableHead>
                  <TableHead style={{ color: "#51247a" }}>Invoice</TableHead>
                  <TableHead style={{ color: "#51247a" }}>Receiver Name</TableHead>
                  <TableHead style={{ color: "#51247a" }}>Department</TableHead>
                  <TableHead style={{ color: "#51247a" }}>Quantity</TableHead>
                  <TableHead style={{ color: "#51247a" }}>Unit Price</TableHead>
                  <TableHead style={{ color: "#51247a" }}>Total Amount</TableHead>
                  <TableHead style={{ color: "#51247a" }}>Date</TableHead>
                  <TableHead style={{ color: "#51247a" }}>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.map((record, index) => (
                  <TableRow key={record._id} className="hover:bg-gray-50">
                    <TableCell>
                      <span className="font-medium text-gray-900">{index + 1}</span>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium text-gray-900">{record.supplierName}</p>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium text-gray-900">{record.invoice_no}</p>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium text-gray-900">{record.receiverName}</p>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium text-gray-900">{record.departmentName}</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {record.quantity}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium text-gray-900">{formatCurrency(record.unit_price)}</p>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium text-gray-900">{formatCurrency(record.total_price)}</p>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-gray-600">{formatDate(record.purchase_date)}</p>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-blue-200 text-blue-600 hover:bg-blue-50 bg-transparent"
                        >
                          <Eye className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-purple-200 text-purple-600 hover:bg-purple-50 bg-transparent"
                        >
                          <FileText className="w-3 h-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredRecords.length === 0 && !loading && (
            <div className="text-center py-8">
              <p className="text-gray-500">No stock in records found matching your search criteria.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
