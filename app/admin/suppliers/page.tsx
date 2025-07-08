"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Edit, Trash2, Phone, Mail, Truck } from "lucide-react"
import Link from "next/link"

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<any[]>([]) // State to store supplier data
  const [filteredSuppliers, setFilteredSuppliers] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")

  // Fetch suppliers from the API when the component mounts
  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/suppliers/get")
        if (!response.ok) {
          throw new Error("Failed to fetch suppliers")
        }
        const data = await response.json()
        setSuppliers(data) // Set the fetched suppliers data
        setFilteredSuppliers(data) // Set the filtered suppliers to all initially
      } catch (error) {
        console.error("Error fetching suppliers:", error)
      }
    }

    fetchSuppliers() // Fetch the suppliers when the component is mounted
  }, []) // Empty dependency array means this runs once on mount

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    const filtered = suppliers.filter(
      (supplier) =>
        supplier.name.toLowerCase().includes(value.toLowerCase()) ||
        supplier.contactPerson.toLowerCase().includes(value.toLowerCase()) ||
        supplier.email.toLowerCase().includes(value.toLowerCase()),
    )
    setFilteredSuppliers(filtered)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString() // Format date to show only the date
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: "#000000" }}>
            Supplier Management
          </h2>
          <p className="text-gray-600">Manage all suppliers and their information</p>
        </div>
        <Link href="/admin/suppliers/create">
          <Button className="text-white hover:bg-purple-700 flex items-center" style={{ backgroundColor: "#51247a" }}>
            <Plus className="w-4 h-4 mr-2" />
            Add New Supplier
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-green-100" style={{ borderColor: "#A8D08D" }}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Suppliers</p>
                <p className="text-2xl font-bold" style={{ color: "#000000" }}>
                  {suppliers.length}
                </p>
              </div>
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ backgroundColor: "#A8D08D" }}
              >
                <Truck className="w-4 h-4" style={{ color: "#007A3D" }} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card className="border-green-100" style={{ borderColor: "#A8D08D" }}>
        <CardHeader>
          <CardTitle style={{ color: "#007A3D" }}>All Suppliers</CardTitle>
          <CardDescription>Search and manage supplier information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Input
                placeholder="Search suppliers..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 border-green-200 focus:border-green-500"
                style={{ borderColor: "#A8D08D" }}
              />
            </div>
          </div>

          <div className="rounded-md border border-green-100" style={{ borderColor: "#A8D08D" }}>
            <Table>
              <TableHeader>
                <TableRow style={{ backgroundColor: "#F2F2F2" }}>
                  <TableHead style={{ color: "#000000" }}>No</TableHead>
                  <TableHead style={{ color: "#000000" }}>Supplier Name</TableHead>
                  <TableHead style={{ color: "#000000" }}>Contact Person</TableHead>
                  <TableHead style={{ color: "#000000" }}>Phone</TableHead>
                  <TableHead style={{ color: "#000000" }}>Email</TableHead>
                  <TableHead style={{ color: "#000000" }}>Address</TableHead>
                  <TableHead style={{ color: "#000000" }}>Created Date</TableHead> {/* New column */}
                  <TableHead style={{ color: "#000000" }}>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSuppliers.map((supplier, index) => (
                  <TableRow key={supplier.id || index} className="hover:bg-gray-50">  {/* Fallback to index if id is undefined */}
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{supplier.name}</TableCell>
                    <TableCell>{supplier.contactPerson}</TableCell>
                    <TableCell>{supplier.phone}</TableCell>
                    <TableCell>{supplier.email}</TableCell>
                    <TableCell>{supplier.address}</TableCell>
                    <TableCell>{formatDate(supplier.createdAt)}</TableCell> {/* Display formatted creation date */}
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

          {filteredSuppliers.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No suppliers found matching your search.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
