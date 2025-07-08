"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Edit, Trash2, Filter, Search, Package } from "lucide-react"
import Link from "next/link"

const categories = [
  "All Categories",
  "Electronics",
  "Office Supplies",
  "Furniture",
  "Computer Hardware",
  "Laboratory Equipment",
]

export default function ItemsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All Categories")
  const [filteredItems, setFilteredItems] = useState<any[]>([])
  const [items, setItems] = useState<any[]>([])

  // Fetch items from the API using native fetch
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/items/get")
        if (response.ok) {
          const data = await response.json()
          setItems(data)
          setFilteredItems(data)
        } else {
          console.error("Failed to fetch items:", response.status)
        }
      } catch (error) {
        console.error("Error fetching items:", error)
      }
    }
    fetchItems()
  }, [])

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    filterItems(value, selectedCategory)
  }

  const handleCategoryFilter = (category: string) => {
    setSelectedCategory(category)
    filterItems(searchTerm, category)
  }

  const filterItems = (search: string, category: string) => {
    let filtered = items

    if (search) {
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(search.toLowerCase()) ||
          item.description.toLowerCase().includes(search.toLowerCase()) ||
          item.category_id.toLowerCase().includes(search.toLowerCase()), // Make sure category_id is checked
      )
    }

    if (category !== "All Categories") {
      filtered = filtered.filter((item) => item.category_id === category) // Filter by category_id
    }

    setFilteredItems(filtered)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: "#51247a" }}>
            Item Management
          </h2>
          <p className="text-gray-600">Manage all inventory items and their information</p>
        </div>
        <Link href="/admin/items/create">
          <Button className="text-white hover:bg-purple-700 flex items-center" style={{ backgroundColor: "#51247a" }}>
            <Plus className="w-4 h-4 mr-2" />
            Add New Item
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-blue-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Items</p>
                <p className="text-2xl font-bold text-navy-800" style={{ color: "#1e3a8a" }}>
                  {items.length}
                </p>
              </div>
              <div className="w-8 h-8 bg-navy-100 rounded-full flex items-center justify-center">
                <Package className="w-4 h-4 text-navy-600" style={{ color: "#1e3a8a" }} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card className="border-blue-100">
        <CardHeader>
          <CardTitle className="text-navy-700" style={{ color: "#51247a" }}>
            All Items
          </CardTitle>
          <CardDescription>Search and manage inventory items</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 border-blue-200 focus:border-navy-500"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <Select value={selectedCategory} onValueChange={handleCategoryFilter}>
                <SelectTrigger className="w-48 border-blue-200 focus:border-navy-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-md border border-blue-100">
            <Table>
              <TableHeader>
                <TableRow className="bg-navy-50" style={{ backgroundColor: "#f8fafc" }}>
                  <TableHead className="text-navy-800" style={{ color: "#51247a" }}>
                    No
                  </TableHead>
                  <TableHead className="text-navy-800" style={{ color: "#51247a" }}>
                    Item Name
                  </TableHead>
                  <TableHead className="text-navy-800" style={{ color: "#51247a" }}>
                    Description
                  </TableHead>
                  <TableHead className="text-navy-800" style={{ color: "#51247a" }}>
                    Category
                  </TableHead>
                  <TableHead className="text-navy-800" style={{ color: "#51247a" }}>
                    Unit
                  </TableHead>
                  <TableHead className="text-navy-800" style={{ color: "#51247a" }}>
                    Created
                  </TableHead>
                  <TableHead className="text-navy-800" style={{ color: "#51247a" }}>
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item, index) => (
                  <TableRow key={item.id} className="hover:bg-gray-50">
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.description}</TableCell>
                    <TableCell>{item.category_id}</TableCell> {/* Using category_id directly */}
                    <TableCell>{item.unit}</TableCell>
                    <TableCell>{item.createdAt}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-navy-200 text-navy-600 hover:bg-navy-50 bg-transparent"
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-200 text-red-600 hover:bg-red-50 bg-transparent"
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

          {filteredItems.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No items found matching your search criteria.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
