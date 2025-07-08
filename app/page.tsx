"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Building2, Package, Users, BarChart3, ChevronLeft, ChevronRight, Play, Pause } from "lucide-react"
import Link from "next/link"

// Slideshow images data
const slideImages = [
  {
    id: 1,
    url: "/placeholder.svg?height=600&width=1200",
    title: "PSTU Main Campus",
    description: "Modern infrastructure supporting quality education and research",
  },
  {
    id: 2,
    url: "/placeholder.svg?height=600&width=1200",
    title: "Advanced Laboratories",
    description: "State-of-the-art research facilities for scientific innovation",
  },
  {
    id: 3,
    url: "/placeholder.svg?height=600&width=1200",
    title: "Academic Excellence",
    description: "Fostering knowledge and innovation in science and technology",
  },
  {
    id: 4,
    url: "/placeholder.svg?height=600&width=1200",
    title: "Student Life",
    description: "Vibrant campus community with diverse academic programs",
  },
]

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)

  // Auto-play slideshow
  useEffect(() => {
    if (!isPlaying) return

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slideImages.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [isPlaying])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slideImages.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slideImages.length) % slideImages.length)
  }

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f7f7f7" }}>
      <Header />

      {/* Hero Section with Slideshow */}
      <section className="relative h-[600px] overflow-hidden">
        <div className="absolute inset-0">
          {slideImages.map((slide, index) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentSlide ? "opacity-100" : "opacity-0"
              }`}
            >
              <img
                src={slide.url || "/placeholder.svg"}
                alt={slide.title}
                className="w-full h-full object-cover"
                crossOrigin="anonymous"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
            </div>
          ))}
        </div>

        {/* Slide Content */}
        <div className="relative z-10 h-full flex items-center">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl text-white">
              <h1 className="text-5xl md:text-6xl font-bold mb-4 leading-tight">Inventory Management System</h1>
              <p className="text-xl md:text-2xl mb-4 opacity-90">ইনভেন্টরি ম্যানেজমেন্ট সিস্টেম</p>
              <h2 className="text-2xl md:text-3xl font-semibold mb-6">{slideImages[currentSlide].title}</h2>
              <p className="text-lg mb-8 opacity-90 max-w-2xl">{slideImages[currentSlide].description}</p>
              <Link href="/login">
                <Button
                  size="lg"
                  className="text-white hover:bg-purple-700 px-8 py-3 text-lg font-semibold"
                  style={{ backgroundColor: "#51247a" }}
                >
                  Access System
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Slideshow Controls */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20">
          <div className="flex items-center space-x-4 bg-black/30 backdrop-blur-sm rounded-full px-6 py-3">
            <button
              onClick={prevSlide}
              className="text-white hover:text-blue-200 transition-colors p-2"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="flex space-x-2">
              {slideImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    index === currentSlide ? "bg-white" : "bg-white/50"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>

            <button
              onClick={togglePlayPause}
              className="text-white hover:text-blue-200 transition-colors p-2"
              aria-label={isPlaying ? "Pause slideshow" : "Play slideshow"}
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </button>

            <button
              onClick={nextSlide}
              className="text-white hover:text-blue-200 transition-colors p-2"
              aria-label="Next slide"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* University Overview */}
      <section className="py-20" style={{ backgroundColor: "#ffffff" }}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6" style={{ color: "#51247a" }}>
              Patuakhali Science and Technology University
            </h2>
            <div className="w-24 h-1 mx-auto mb-6" style={{ backgroundColor: "#002147" }}></div>
            <p className="text-lg max-w-4xl mx-auto leading-relaxed" style={{ color: "#666" }}>
              Patuakhali Science and Technology University (PSTU) is a leading science and technology university in
              Bangladesh. Established in 1999, the university is renowned for high-quality education, cutting-edge
              research, and innovation in science and technology fields.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card
              className="text-center hover:shadow-lg transition-shadow duration-300"
              style={{ borderColor: "#e7e7e7" }}
            >
              <CardHeader className="pb-4">
                <div
                  className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "#edf5ff" }}
                >
                  <Building2 className="w-8 h-8" style={{ color: "#51247a" }} />
                </div>
                <CardTitle className="text-xl" style={{ color: "#51247a" }}>
                  8 Faculties
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p style={{ color: "#666" }}>Specialized faculties covering diverse academic disciplines</p>
              </CardContent>
            </Card>

            <Card
              className="text-center hover:shadow-lg transition-shadow duration-300"
              style={{ borderColor: "#e7e7e7" }}
            >
              <CardHeader className="pb-4">
                <div
                  className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "#edf5ff" }}
                >
                  <Users className="w-8 h-8" style={{ color: "#51247a" }} />
                </div>
                <CardTitle className="text-xl" style={{ color: "#51247a" }}>
                  15,000+ Students
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p style={{ color: "#666" }}>Undergraduate and postgraduate programs</p>
              </CardContent>
            </Card>

            <Card
              className="text-center hover:shadow-lg transition-shadow duration-300"
              style={{ borderColor: "#e7e7e7" }}
            >
              <CardHeader className="pb-4">
                <div
                  className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "#edf5ff" }}
                >
                  <Package className="w-8 h-8" style={{ color: "#51247a" }} />
                </div>
                <CardTitle className="text-xl" style={{ color: "#51247a" }}>
                  Modern Facilities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p style={{ color: "#666" }}>State-of-the-art laboratories and research centers</p>
              </CardContent>
            </Card>

            <Card
              className="text-center hover:shadow-lg transition-shadow duration-300"
              style={{ borderColor: "#e7e7e7" }}
            >
              <CardHeader className="pb-4">
                <div
                  className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "#edf5ff" }}
                >
                  <BarChart3 className="w-8 h-8" style={{ color: "#51247a" }} />
                </div>
                <CardTitle className="text-xl" style={{ color: "#51247a" }}>
                  Research Excellence
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p style={{ color: "#666" }}>International standard research and innovation</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Inventory System Features */}
      <section className="py-20" style={{ backgroundColor: "#edf5ff" }}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6" style={{ color: "#51247a" }}>
              Advanced Inventory Management
            </h2>
            <div className="w-24 h-1 mx-auto mb-6" style={{ backgroundColor: "#002147" }}></div>
            <p className="text-lg max-w-4xl mx-auto leading-relaxed" style={{ color: "#666" }}>
              Our comprehensive inventory management system streamlines resource allocation, tracking, and reporting
              across all university departments and administrative offices.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="hover:shadow-lg transition-shadow duration-300" style={{ borderColor: "#e7e7e7" }}>
              <CardHeader>
                <CardTitle className="text-xl mb-3" style={{ color: "#51247a" }}>
                  Real-time Stock Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p style={{ color: "#666" }} className="leading-relaxed">
                  Monitor inventory levels, track stock movements, and receive automated alerts for low stock items
                  across all departments.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-300" style={{ borderColor: "#e7e7e7" }}>
              <CardHeader>
                <CardTitle className="text-xl mb-3" style={{ color: "#51247a" }}>
                  Comprehensive Reporting
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p style={{ color: "#666" }} className="leading-relaxed">
                  Generate detailed analytics and reports by department, date range, item category, and user activity
                  for informed decision-making.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-300" style={{ borderColor: "#e7e7e7" }}>
              <CardHeader>
                <CardTitle className="text-xl mb-3" style={{ color: "#51247a" }}>
                  Role-based Access Control
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p style={{ color: "#666" }} className="leading-relaxed">
                  Secure multi-level access system with customized permissions for administrators, faculty, and staff
                  members.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* IT Cell Information */}
      <section className="py-20" style={{ backgroundColor: "#ffffff" }}>
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-6" style={{ color: "#51247a" }}>
              IT Cell Services
            </h2>
            <div className="w-24 h-1 mx-auto mb-8" style={{ backgroundColor: "#002147" }}></div>
            <p className="text-lg mb-12 leading-relaxed" style={{ color: "#666" }}>
              The IT Cell of Patuakhali Science and Technology University provides comprehensive technology solutions
              and maintains all information systems across the university campus.
            </p>

            <div className="bg-white p-8 rounded-xl shadow-lg border" style={{ borderColor: "#e7e7e7" }}>
              <h3 className="text-2xl font-semibold mb-6" style={{ color: "#51247a" }}>
                Our Core Services
              </h3>
              <div className="grid md:grid-cols-2 gap-6 text-left">
                <ul className="space-y-3" style={{ color: "#666" }}>
                  <li className="flex items-center">
                    <div className="w-2 h-2 rounded-full mr-3" style={{ backgroundColor: "#51247a" }}></div>
                    Network Infrastructure & Internet Services
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 rounded-full mr-3" style={{ backgroundColor: "#51247a" }}></div>
                    Custom Software Development
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 rounded-full mr-3" style={{ backgroundColor: "#51247a" }}></div>
                    Database Management & Security
                  </li>
                </ul>
                <ul className="space-y-3" style={{ color: "#666" }}>
                  <li className="flex items-center">
                    <div className="w-2 h-2 rounded-full mr-3" style={{ backgroundColor: "#51247a" }}></div>
                    System Maintenance & Support
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 rounded-full mr-3" style={{ backgroundColor: "#51247a" }}></div>
                    Digital Solutions & Automation
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 rounded-full mr-3" style={{ backgroundColor: "#51247a" }}></div>
                    24/7 Technical Support
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-white py-12" style={{ background: "linear-gradient(135deg, #002147 0%, #063f82 100%)" }}>
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="flex justify-center items-center">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-solid border-[#51247a]">
                  <img 
                    src="https://pstu.ac.bd/storage/images/images/1704261659_WhatsApp%20Image%202024-01-02%20at%205.46.49%20PM.jpeg" 
                    alt="PSTU Logo" 
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
              </div>
            <h3 className="text-xl font-semibold mb-2">পটুয়াখালী বিজ্ঞান ও প্রযুক্তি বিশ্ববিদ্যালয়</h3>
            <p className="text-lg mb-4">Patuakhali Science and Technology University</p>
            <p className="text-sm opacity-80 mb-6">
              Dumki, Patuakhali-8602, Bangladesh | Phone: +880-4427-56022 | Email: info@pstu.ac.bd
            </p>
            <div className="border-t border-white/20 pt-6">
              <p className="text-sm opacity-70">
                © 2025 Patuakhali Science and Technology University. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
