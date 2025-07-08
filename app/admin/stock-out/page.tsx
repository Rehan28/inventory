"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Plus, Eye, FileText, Loader2, ArrowDown, TrendingDown, Users } from "lucide-react"
import Link from "next/link"

// Types for API data
interface StockOutRecord {
  _id: string
  user_id: string
  department_id?: string
  office_id?: string
  item_id: string
  issue_type: string
  issue_by: string
  issue_date: string
  quantity: number
  remarks?: string
  createdAt: string
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

interface Item {
  _id: string
  name: string
  unit: string
  category: string
  description?: string
}

interface Department {
  _id: string
  name: string
  description?: string
}

interface Office {
  _id: string
  name: string
  description?: string
}

interface EnrichedStockOutRecord extends StockOutRecord {
  userName: string
  itemName: string
  departmentName: string
  officeName: string
  userRole: string
}

export default function StockOutPage() {
  const [stockOutRecords, setStockOutRecords] = useState<EnrichedStockOutRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedIssueType, setSelectedIssueType] = useState("All Types")
  const [selectedRole, setSelectedRole] = useState("All Roles")
  const [filteredRecords, setFilteredRecords] = useState<EnrichedStockOutRecord[]>([])
  const [issueTypes, setIssueTypes] = useState<string[]>(["All Types"])
  const [userRoles, setUserRoles] = useState<string[]>(["All Roles"])
  const [error, setError] = useState<string>("")

  // Fetch all required data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError("")

        // Fetch stock out records
        const stockOutResponse = await fetch("http://localhost:5000/api/stockouts/get")
        if (!stockOutResponse.ok) {
          throw new Error("Failed to fetch stock out records")
        }
        const stockOutData: StockOutRecord[] = await stockOutResponse.json()

        // Fetch users
        const usersResponse = await fetch("http://localhost:5000/api/users/get")
        if (!usersResponse.ok) {
          throw new Error("Failed to fetch users")
        }
        const usersData: User[] = await usersResponse.json()

        // Fetch items
        const itemsResponse = await fetch("http://localhost:5000/api/items/get")
        if (!itemsResponse.ok) {
          throw new Error("Failed to fetch items")
        }
        const itemsData: Item[] = await itemsResponse.json()

        // Fetch departments
        const departmentsResponse = await fetch("http://localhost:5000/api/departments/get")
        if (!departmentsResponse.ok) {
          throw new Error("Failed to fetch departments")
        }
        const departmentsData: Department[] = await departmentsResponse.json()

        // Fetch offices
        const officesResponse = await fetch("http://localhost:5000/api/offices/get")
        if (!officesResponse.ok) {
          throw new Error("Failed to fetch offices")
        }
        const officesData: Office[] = await officesResponse.json()

        // Create lookup maps for efficient data enrichment
        const userMap = new Map(usersData.map((u) => [u._id, u]))
        const itemMap = new Map(itemsData.map((i) => [i._id, i]))
        const departmentMap = new Map(departmentsData.map((d) => [d._id, d]))
        const officeMap = new Map(officesData.map((o) => [o._id, o]))

        // Enrich stock out records with related data
        const enrichedRecords: EnrichedStockOutRecord[] = stockOutData.map((record) => {
          const user = userMap.get(record.user_id)
          const item = itemMap.get(record.item_id)
          const department = record.department_id ? departmentMap.get(record.department_id) : null
          const office = record.office_id ? officeMap.get(record.office_id) : null

          return {
            ...record,
            userName: user?.name || "Unknown User",
            itemName: item?.name || "Unknown Item",
            departmentName: department?.name || "N/A",
            officeName: office?.name || "N/A",
            userRole: user?.role || user?.roll || "Unknown",
          }
        })

        // Set up filter options
        const uniqueIssueTypes = ["All Types", ...Array.from(new Set(enrichedRecords.map((r) => r.issue_type)))]
        const uniqueRoles = ["All Roles", ...Array.from(new Set(enrichedRecords.map((r) => r.userRole)))]

        setStockOutRecords(enrichedRecords)
        setFilteredRecords(enrichedRecords)
        setIssueTypes(uniqueIssueTypes)
        setUserRoles(uniqueRoles)
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
    filterRecords(value, selectedIssueType, selectedRole)
  }

  const handleIssueTypeFilter = (issueType: string) => {
    setSelectedIssueType(issueType)
    filterRecords(searchTerm, issueType, selectedRole)
  }

  const handleRoleFilter = (role: string) => {
    setSelectedRole(role)
    filterRecords(searchTerm, selectedIssueType, role)
  }

  const filterRecords = (search: string, issueType: string, role: string) => {
    let filtered = stockOutRecords

    if (search) {
      filtered = filtered.filter(
        (record) =>
          record.userName.toLowerCase().includes(search.toLowerCase()) ||
          record.itemName.toLowerCase().includes(search.toLowerCase()) ||
          record.issue_by.toLowerCase().includes(search.toLowerCase()) ||
          record.departmentName.toLowerCase().includes(search.toLowerCase()) ||
          record.officeName.toLowerCase().includes(search.toLowerCase()),
      )
    }

    if (issueType !== "All Types") {
      filtered = filtered.filter((record) => record.issue_type === issueType)
    }

    if (role !== "All Roles") {
      filtered = filtered.filter((record) => record.userRole === role)
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

  const getIssueTypeBadgeColor = (issueType: string) => {
    switch (issueType.toLowerCase()) {
      case "manual":
        return "bg-blue-100 text-blue-800"
      case "automatic":
        return "bg-green-100 text-green-800"
      case "emergency":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role.toLowerCase()) {
      case "teacher":
        return "bg-purple-100 text-purple-800"
      case "staff":
        return "bg-orange-100 text-orange-800"
      case "admin":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold" style={{ color: "#51247a" }}>
              Stock Out Management
            </h2>
            <p className="text-gray-600">Track and manage all inventory issues and stock distributions</p>
          </div>
          <Link href="/admin/stock-out/create">
            <Button className="text-white hover:bg-purple-700 flex items-center" style={{ backgroundColor: "#51247a" }}>
              <Plus className="w-4 h-4 mr-2" />
              New Stock Issue
            </Button>
          </Link>
        </div>

        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" style={{ color: "#51247a" }} />
            <p className="text-gray-600">Loading stock out records...</p>
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
              Stock Out Management
            </h2>
            <p className="text-gray-600">Track and manage all inventory issues and stock distributions</p>
          </div>
          <Link href="/admin/stock-out/create">
            <Button className="text-white hover:bg-purple-700 flex items-center" style={{ backgroundColor: "#51247a" }}>
              <Plus className="w-4 h-4 mr-2" />
              New Stock Issue
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
            Stock Out Management
          </h2>
          <p className="text-gray-600">Track and manage all inventory issues and stock distributions</p>
        </div>
        <Link href="/admin/stock-out/create">
          <Button className="text-white hover:bg-purple-700 flex items-center" style={{ backgroundColor: "#51247a" }}>
            <Plus className="w-4 h-4 mr-2" />
            New Stock Issue
          </Button>
        </Link>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card style={{ borderColor: "#e7e7e7", backgroundColor: "#ffffff" }}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Issues</p>
                <p className="text-2xl font-bold" style={{ color: "#51247a" }}>
                  {stockOutRecords.length}
                </p>
              </div>
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ backgroundColor: "#fef2f2" }}
              >
                <ArrowDown className="w-4 h-4 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card style={{ borderColor: "#e7e7e7", backgroundColor: "#ffffff" }}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Quantity Issued</p>
                <p className="text-2xl font-bold text-red-600">
                  {stockOutRecords.reduce((sum, record) => sum + record.quantity, 0)}
                </p>
              </div>
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <TrendingDown className="w-4 h-4 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card style={{ borderColor: "#e7e7e7", backgroundColor: "#ffffff" }}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Unique Recipients</p>
                <p className="text-2xl font-bold text-blue-600">
                  {new Set(stockOutRecords.map((r) => r.user_id)).size}
                </p>
              </div>
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="w-4 h-4 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card style={{ borderColor: "#e7e7e7", backgroundColor: "#ffffff" }}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Manual Issues</p>
                <p className="text-2xl font-bold text-orange-600">
                  {stockOutRecords.filter((r) => r.issue_type === "manual").length}
                </p>
              </div>
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <FileText className="w-4 h-4 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card style={{ borderColor: "#e7e7e7", backgroundColor: "#ffffff" }}>
        <CardHeader>
          <CardTitle style={{ color: "#51247a" }}>Stock Out Records</CardTitle>
          <CardDescription>View and manage all stock issue records</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by user, item, issuer, or location..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 focus:border-purple-500"
                style={{ borderColor: "#e7e7e7" }}
              />
            </div>
            <Select value={selectedIssueType} onValueChange={handleIssueTypeFilter}>
              <SelectTrigger className="w-48 focus:border-purple-500" style={{ borderColor: "#e7e7e7" }}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {issueTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedRole} onValueChange={handleRoleFilter}>
              <SelectTrigger className="w-48 focus:border-purple-500" style={{ borderColor: "#e7e7e7" }}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {userRoles.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role}
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
                  <TableHead style={{ color: "#51247a" }}>Recipient</TableHead>
                  <TableHead style={{ color: "#51247a" }}>Item</TableHead>
                  <TableHead style={{ color: "#51247a" }}>Quantity</TableHead>
                  <TableHead style={{ color: "#51247a" }}>Issue Type</TableHead>
                  <TableHead style={{ color: "#51247a" }}>Issue By</TableHead>
                  <TableHead style={{ color: "#51247a" }}>Role</TableHead>
                  <TableHead style={{ color: "#51247a" }}>Department/Office</TableHead>
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
                      <div>
                        <p className="font-medium text-gray-900">{record.userName}</p>
                        <p className="text-sm text-gray-500">ID: {record.user_id}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium text-gray-900">{record.itemName}</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {record.quantity}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={`text-xs ${getIssueTypeBadgeColor(record.issue_type)}`}>
                        {record.issue_type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium text-gray-900">{record.issue_by}</p>
                    </TableCell>
                    <TableCell>
                      <Badge className={`text-xs ${getRoleBadgeColor(record.userRole)}`}>{record.userRole}</Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        {record.userRole === "teacher" && (
                          <p className="text-sm text-gray-900">{record.departmentName}</p>
                        )}
                        {record.userRole === "staff" && <p className="text-sm text-gray-900">{record.officeName}</p>}
                        {record.userRole !== "teacher" && record.userRole !== "staff" && (
                          <p className="text-sm text-gray-500">N/A</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-gray-600">{formatDate(record.issue_date)}</p>
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
              <p className="text-gray-500">No stock out records found matching your search criteria.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
