"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Plus, Loader2, GraduationCap, Building, Phone, Trash2 } from "lucide-react"
import Link from "next/link"

// Types for API data
interface Teacher {
  _id: string
  name: string
  email: string
  phone?: string
  employee_id?: string
  department?: string
  department_id?: string
  designation?: string
  qualification?: string
  experience?: string
  joining_date?: string
  status?: string
  role?: string
  roll?: string
  created_at?: string
}

interface Department {
  _id: string
  name: string
  code?: string
  faculty?: string
}

interface EnrichedTeacher extends Teacher {
  departmentName: string
  facultyName: string
  phone?: string
}

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<EnrichedTeacher[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDepartment, setSelectedDepartment] = useState("All Departments")
  const [filteredTeachers, setFilteredTeachers] = useState<EnrichedTeacher[]>([])
  const [departments, setDepartments] = useState<string[]>(["All Departments"])
  const [error, setError] = useState<string>("")

  // Fetch all required data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError("")

        // Fetch teachers
        const teachersResponse = await fetch("http://localhost:5000/api/users/get-teachers")
        if (!teachersResponse.ok) {
          throw new Error("Failed to fetch teachers")
        }
        const teachersData: Teacher[] = await teachersResponse.json()

        // Fetch departments from API
        const departmentsResponse = await fetch("http://localhost:5000/api/departments/get")
        if (!departmentsResponse.ok) {
          throw new Error("Failed to fetch departments")
        }
        const departmentsData: Department[] = await departmentsResponse.json()

        // Create lookup map for departments
        const departmentMap = new Map(departmentsData.map((d) => [d._id, d]))

        // Enrich teacher records with department information
        const enrichedTeachers: EnrichedTeacher[] = teachersData.map((teacher) => {
          const department = teacher.department_id ? departmentMap.get(teacher.department_id) : null

          return {
            ...teacher,
            // Phone number comes directly from database
            phone: teacher.phone || "",
            // Department name from API
            departmentName: department?.name || "N/A",
            // Faculty from API department data
            facultyName: department?.faculty || "N/A",
          }
        })

        // Set up department filter options from API data
        const uniqueDepartments = ["All Departments", ...departmentsData.map((dept) => dept.name)]

        setTeachers(enrichedTeachers)
        setFilteredTeachers(enrichedTeachers)
        setDepartments(uniqueDepartments)
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
    filterTeachers(value, selectedDepartment)
  }

  const handleDepartmentFilter = (department: string) => {
    setSelectedDepartment(department)
    filterTeachers(searchTerm, department)
  }

  const filterTeachers = (search: string, department: string) => {
    let filtered = teachers

    if (search) {
      filtered = filtered.filter(
        (teacher) =>
          teacher.name.toLowerCase().includes(search.toLowerCase()) ||
          teacher.email.toLowerCase().includes(search.toLowerCase()) ||
          teacher._id?.toLowerCase().includes(search.toLowerCase()) ||
          teacher.departmentName.toLowerCase().includes(search.toLowerCase()),
      )
    }

    if (department !== "All Departments") {
      filtered = filtered.filter((teacher) => teacher.departmentName === department)
    }

    setFilteredTeachers(filtered)
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/users/delete/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setTeachers((prev) => prev.filter((teacher) => teacher._id !== id))
        setFilteredTeachers((prev) => prev.filter((teacher) => teacher._id !== id))
      } else {
        console.error("Failed to delete teacher")
      }
    } catch (error) {
      console.error("Error deleting teacher:", error)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold" style={{ color: "#51247a" }}>
              Teachers Management
            </h2>
            <p className="text-gray-600">Manage and view all teaching faculty members</p>
          </div>
          <Link href="/admin/teachers/create">
            <Button className="text-white hover:bg-purple-700 flex items-center" style={{ backgroundColor: "#51247a" }}>
              <Plus className="w-4 h-4 mr-2" />
              Add Teacher
            </Button>
          </Link>
        </div>

        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" style={{ color: "#51247a" }} />
            <p className="text-gray-600">Loading teachers...</p>
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
              Teachers Management
            </h2>
            <p className="text-gray-600">Manage and view all teaching faculty members</p>
          </div>
          <Link href="/admin/teachers/create">
            <Button className="text-white hover:bg-purple-700 flex items-center" style={{ backgroundColor: "#51247a" }}>
              <Plus className="w-4 h-4 mr-2" />
              Add Teacher
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
            Teachers Management
          </h2>
          <p className="text-gray-600">Manage and view all teaching faculty members</p>
        </div>
        <Link href="/admin/teachers/create">
          <Button className="text-white hover:bg-purple-700 flex items-center" style={{ backgroundColor: "#51247a" }}>
            <Plus className="w-4 h-4 mr-2" />
            Add Teacher
          </Button>
        </Link>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card style={{ borderColor: "#e7e7e7", backgroundColor: "#ffffff" }}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Teachers</p>
                <p className="text-2xl font-bold" style={{ color: "#51247a" }}>
                  {teachers.length}
                </p>
              </div>
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ backgroundColor: "#f3e8ff" }}
              >
                <GraduationCap className="w-4 h-4 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card style={{ borderColor: "#e7e7e7", backgroundColor: "#ffffff" }}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">With Phone Numbers</p>
                <p className="text-2xl font-bold text-green-600">
                  {teachers.filter((t) => t.phone && t.phone.trim() !== "").length}
                </p>
              </div>
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <Phone className="w-4 h-4 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card style={{ borderColor: "#e7e7e7", backgroundColor: "#ffffff" }}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Departments</p>
                <p className="text-2xl font-bold text-blue-600">
                  {new Set(teachers.map((t) => t.departmentName).filter((d) => d !== "N/A")).size}
                </p>
              </div>
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Building className="w-4 h-4 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card style={{ borderColor: "#e7e7e7", backgroundColor: "#ffffff" }}>
        <CardHeader>
          <CardTitle style={{ color: "#51247a" }}>All Teachers</CardTitle>
          <CardDescription>View and manage all teaching faculty members</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by name, email, user ID, or department..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 focus:border-purple-500"
                style={{ borderColor: "#e7e7e7" }}
              />
            </div>
            <Select value={selectedDepartment} onValueChange={handleDepartmentFilter}>
              <SelectTrigger className="w-48 focus:border-purple-500" style={{ borderColor: "#e7e7e7" }}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {departments.map((department) => (
                  <SelectItem key={department} value={department}>
                    {department}
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
                  <TableHead style={{ color: "#51247a" }}>Teacher</TableHead>
                  <TableHead style={{ color: "#51247a" }}>User ID</TableHead>
                  <TableHead style={{ color: "#51247a" }}>Department</TableHead>
                  <TableHead style={{ color: "#51247a" }}>Phone Number</TableHead>
                  <TableHead style={{ color: "#51247a" }}>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTeachers.map((teacher, index) => (
                  <TableRow key={teacher._id} className="hover:bg-gray-50">
                    <TableCell>
                      <span className="font-medium text-gray-900">{index + 1}</span>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-gray-900">{teacher.name}</p>
                        <p className="text-sm text-gray-500">{teacher.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-gray-900">{teacher._id}</p>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-gray-900">{teacher.departmentName}</p>
                        {teacher.facultyName !== "N/A" && (
                          <p className="text-sm text-gray-500">Faculty: {teacher.facultyName}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        {teacher.phone && teacher.phone.trim() !== "" ? (
                          <p className="text-sm text-gray-900 flex items-center">
                            <Phone className="w-3 h-3 mr-1" />
                            {teacher.phone}
                          </p>
                        ) : (
                          <p className="text-sm text-gray-500">N/A</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-200 text-red-600 hover:bg-red-50 bg-transparent"
                          onClick={() => handleDelete(teacher._id)}
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

          {filteredTeachers.length === 0 && !loading && (
            <div className="text-center py-8">
              <p className="text-gray-500">No teachers found matching your search criteria.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
