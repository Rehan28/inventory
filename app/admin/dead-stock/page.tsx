"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Plus, Eye, FileText, Loader2, AlertTriangle, TrendingDown, Users, Trash2 } from "lucide-react"
import Link from "next/link"

// Types for API data
interface DeadstockRecord {
  _id: string
  user_id: string
  item_id: string
  quantity: number
  reason: string
  reported_at: string
  created_at: string
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
  unit?: string
  category?: string
  description?: string
  brand?: string
}

interface EnrichedDeadstockRecord extends DeadstockRecord {
  userName: string
  itemName: string
  itemCategory: string
  userRole: string
}

export default function DeadstockPage() {
  const [deadstockRecords, setDeadstockRecords] = useState<EnrichedDeadstockRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedReason, setSelectedReason] = useState("All Reasons")
  const [selectedRole, setSelectedRole] = useState("All Roles")
  const [filteredRecords, setFilteredRecords] = useState<EnrichedDeadstockRecord[]>([])
  const [reasons, setReasons] = useState<string[]>(["All Reasons"])
  const [userRoles, setUserRoles] = useState<string[]>(["All Roles"])
  const [error, setError] = useState<string>("")

  // Fetch all required data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError("")

        // Fetch deadstock records
        const deadstockResponse = await fetch("http://localhost:5000/api/deadstocks/get")
        if (!deadstockResponse.ok) {
          throw new Error("Failed to fetch deadstock records")
        }
        const deadstockData: DeadstockRecord[] = await deadstockResponse.json()

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

        // Create lookup maps for efficient data enrichment
        const userMap = new Map(usersData.map((u) => [u._id, u]))
        const itemMap = new Map(itemsData.map((i) => [i._id, i]))

        // Enrich deadstock records with related data
        const enrichedRecords: EnrichedDeadstockRecord[] = deadstockData.map((record) => {
          const user = userMap.get(record.user_id)
          const item = itemMap.get(record.item_id)

          return {
            ...record,
            userName: user?.name || "Unknown User",
            itemName: item?.name || "Unknown Item",
            itemCategory: item?.category || "N/A",
            userRole: user?.role || user?.roll || "Unknown",
          }
        })

        // Set up filter options
        const uniqueReasons = ["All Reasons", ...Array.from(new Set(enrichedRecords.map((r) => r.reason)))]
        const uniqueRoles = ["All Roles", ...Array.from(new Set(enrichedRecords.map((r) => r.userRole)))]

        setDeadstockRecords(enrichedRecords)
        setFilteredRecords(enrichedRecords)
        setReasons(uniqueReasons)
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
    filterRecords(value, selectedReason, selectedRole)
  }

  const handleReasonFilter = (reason: string) => {
    setSelectedReason(reason)
    filterRecords(searchTerm, reason, selectedRole)
  }

  const handleRoleFilter = (role: string) => {
    setSelectedRole(role)
    filterRecords(searchTerm, selectedReason, role)
  }

  const filterRecords = (search: string, reason: string, role: string) => {
    let filtered = deadstockRecords

    if (search) {
      filtered = filtered.filter(
        (record) =>
          record.userName.toLowerCase().includes(search.toLowerCase()) ||
          record.itemName.toLowerCase().includes(search.toLowerCase()) ||
          record.reason.toLowerCase().includes(search.toLowerCase()) ||
          record.itemCategory.toLowerCase().includes(search.toLowerCase()),
      )
    }

    if (reason !== "All Reasons") {
      filtered = filtered.filter((record) => record.reason === reason)
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

  const getReasonBadgeColor = (reason: string) => {
    switch (reason.toLowerCase()) {
      case "damaged":
        return "bg-red-100 text-red-800"
      case "expired":
        return "bg-orange-100 text-orange-800"
      case "obsolete":
        return "bg-gray-100 text-gray-800"
      case "lost":
        return "bg-yellow-100 text-yellow-800"
      case "stolen":
        return "bg-purple-100 text-purple-800"
      case "defective":
        return "bg-pink-100 text-pink-800"
      default:
        return "bg-blue-100 text-blue-800"
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

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/deadstocks/delete/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setDeadstockRecords((prev) => prev.filter((record) => record._id !== id))
        setFilteredRecords((prev) => prev.filter((record) => record._id !== id))
      } else {
        console.error("Failed to delete deadstock record")
      }
    } catch (error) {
      console.error("Error deleting deadstock record:", error)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold" style={{ color: "#51247a" }}>
              Deadstock Management
            </h2>
            <p className="text-gray-600">Track and manage damaged, expired, or unusable inventory items</p>
          </div>
          <Link href="/admin/deadstock/create">
            <Button className="text-white hover:bg-purple-700 flex items-center" style={{ backgroundColor: "#51247a" }}>
              <Plus className="w-4 h-4 mr-2" />
              Report Deadstock
            </Button>
          </Link>
        </div>

        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" style={{ color: "#51247a" }} />
            <p className="text-gray-600">Loading deadstock records...</p>
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
              Deadstock Management
            </h2>
            <p className="text-gray-600">Track and manage damaged, expired, or unusable inventory items</p>
          </div>
          <Link href="/admin/deadstock/create">
            <Button className="text-white hover:bg-purple-700 flex items-center" style={{ backgroundColor: "#51247a" }}>
              <Plus className="w-4 h-4 mr-2" />
              Report Deadstock
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
            Deadstock Management
          </h2>
          <p className="text-gray-600">Track and manage damaged, expired, or unusable inventory items</p>
        </div>
        <Link href="/admin/deadstock/create">
          <Button className="text-white hover:bg-purple-700 flex items-center" style={{ backgroundColor: "#51247a" }}>
            <Plus className="w-4 h-4 mr-2" />
            Report Deadstock
          </Button>
        </Link>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card style={{ borderColor: "#e7e7e7", backgroundColor: "#ffffff" }}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Deadstock</p>
                <p className="text-2xl font-bold" style={{ color: "#51247a" }}>
                  {deadstockRecords.length}
                </p>
              </div>
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ backgroundColor: "#fef2f2" }}
              >
                <AlertTriangle className="w-4 h-4 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card style={{ borderColor: "#e7e7e7", backgroundColor: "#ffffff" }}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Quantity Lost</p>
                <p className="text-2xl font-bold text-red-600">
                  {deadstockRecords.reduce((sum, record) => sum + record.quantity, 0)}
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
                <p className="text-sm text-gray-600">Reporters</p>
                <p className="text-2xl font-bold text-blue-600">
                  {new Set(deadstockRecords.map((r) => r.user_id)).size}
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
                <p className="text-sm text-gray-600">Damaged Items</p>
                <p className="text-2xl font-bold text-orange-600">
                  {deadstockRecords.filter((r) => r.reason === "Damaged").length}
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
          <CardTitle style={{ color: "#51247a" }}>Deadstock Records</CardTitle>
          <CardDescription>View and manage all deadstock reports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by user, item, reason, or category..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 focus:border-purple-500"
                style={{ borderColor: "#e7e7e7" }}
              />
            </div>
            <Select value={selectedReason} onValueChange={handleReasonFilter}>
              <SelectTrigger className="w-48 focus:border-purple-500" style={{ borderColor: "#e7e7e7" }}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {reasons.map((reason) => (
                  <SelectItem key={reason} value={reason}>
                    {reason}
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
                  <TableHead style={{ color: "#51247a" }}>Reporter</TableHead>
                  <TableHead style={{ color: "#51247a" }}>Item</TableHead>
                  <TableHead style={{ color: "#51247a" }}>Category</TableHead>
                  <TableHead style={{ color: "#51247a" }}>Quantity</TableHead>
                  <TableHead style={{ color: "#51247a" }}>Reason</TableHead>
                  <TableHead style={{ color: "#51247a" }}>Role</TableHead>
                  <TableHead style={{ color: "#51247a" }}>Reported Date</TableHead>
                  <TableHead style={{ color: "#51247a" }}>Created Date</TableHead>
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
                      <p className="text-sm text-gray-600">{record.itemCategory}</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {record.quantity}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={`text-xs ${getReasonBadgeColor(record.reason)}`}>{record.reason}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={`text-xs ${getRoleBadgeColor(record.userRole)}`}>{record.userRole}</Badge>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-gray-600">{formatDate(record.reported_at)}</p>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-gray-600">{formatDate(record.created_at)}</p>
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
                          className="border-red-200 text-red-600 hover:bg-red-50 bg-transparent"
                          onClick={() => handleDelete(record._id)}
                        >
                          <Trash2 className="w-3 h-3" />
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
              <p className="text-gray-500">No deadstock records found matching your search criteria.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
