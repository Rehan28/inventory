"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Trash2 } from "lucide-react"
import Link from "next/link"

export default function DepartmentsPage() {
  const [selectedFaculty, setSelectedFaculty] = useState("All Faculties")
  const [departments, setDepartments] = useState([]) // State to hold departments
  const [filteredDepartments, setFilteredDepartments] = useState([]) // Filtered list to be displayed

  useEffect(() => {
    // Fetch departments from the API
    fetch("http://localhost:5000/api/departments/get")
      .then((response) => response.json())
      .then((data) => {
        setDepartments(data)
        setFilteredDepartments(data) // Set the initial filtered list to all departments
      })
      .catch((error) => console.error("Error fetching departments:", error))
  }, [])

  // Handle faculty filter change
  const handleFacultyFilter = (faculty) => {
    setSelectedFaculty(faculty)
    filterDepartments(faculty)
  }

  // Filter departments based on faculty
  const filterDepartments = (faculty) => {
    let filtered = departments

    if (faculty !== "All Faculties") {
      filtered = filtered.filter((dept) => dept.faculty === faculty)
    }

    setFilteredDepartments(filtered)
  }

  // Handle department deletion
  const handleDelete = (id) => {
    fetch(`http://localhost:5000/api/departments/delete/${id}`, {
      method: 'DELETE',
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.message === "Department deleted successfully") {
          // Remove the department from both the table and the original list
          setDepartments((prevDepartments) =>
            prevDepartments.filter((dept) => dept._id !== id)
          )
          setFilteredDepartments((prevDepartments) =>
            prevDepartments.filter((dept) => dept._id !== id)
          )
        } else {
          console.error("Failed to delete department")
        }
      })
      .catch((error) => console.error("Error deleting department:", error))
  }

  // Manually defined faculties
  const faculties = [
    "All Faculties",
    "Faculty of Engineering",
    "Faculty of Science",
    "Faculty of Business Administration",
    "Faculty of Social Sciences",
    "Faculty of Arts and Humanities",
    "Faculty of Agriculture",
    "Faculty of Computer Science & Engineering"
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: "#51247a" }}>
            Department Management
          </h2>
          <p className="text-gray-600">Manage university departments and their information</p>
        </div>
        <Link href="/admin/departments/create">
          <Button className="text-white hover:bg-purple-700 flex items-center" style={{ backgroundColor: "#51247a" }}>
            <Plus className="w-4 h-4 mr-2" />
            Create Department
          </Button>
        </Link>
      </div>

      {/* Filter */}
      <Card style={{ borderColor: "#e7e7e7", backgroundColor: "#ffffff" }}>
        <CardHeader>
          <CardTitle style={{ color: "#51247a" }}>All Departments</CardTitle>
          <CardDescription>View and manage all university departments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-6">
            <Select value={selectedFaculty} onValueChange={handleFacultyFilter}>
              <SelectTrigger className="w-48 focus:border-purple-500" style={{ borderColor: "#e7e7e7" }}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {faculties.map((faculty) => (
                  <SelectItem key={faculty} value={faculty}>
                    {faculty}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border" style={{ borderColor: "#e7e7e7" }}>
            <Table>
              <TableHeader>
                <TableRow style={{ backgroundColor: "#f8fafc" }}>
                  <TableHead style={{ color: "#51247a" }}>Department</TableHead>
                  <TableHead style={{ color: "#51247a" }}>Code</TableHead>
                  <TableHead style={{ color: "#51247a" }}>Faculty</TableHead>
                  <TableHead style={{ color: "#51247a" }}>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDepartments.map((department) => (
                  <TableRow key={department._id} className="hover:bg-gray-50">
                    <TableCell>
                      <div>
                        <p className="font-medium text-gray-900">{department.name}</p>
                        <p className="text-sm text-gray-500">{department.shortName}</p>
                        <p className="text-xs text-gray-400">Est. {department.establishedYear}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-gray-900">{department.code}</p>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-gray-900">{department.faculty}</p>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-200 text-red-600 hover:bg-red-50 bg-transparent"
                          onClick={() => handleDelete(department._id)}
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

          {filteredDepartments.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No departments found matching your criteria.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
