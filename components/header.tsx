import Link from "next/link"
import { Button } from "@/components/ui/button"

export function Header() {
  return (
    <header
      className="text-white shadow-lg"
      style={{ background: "linear-gradient(135deg, #002147 0%, #063f82 100%)" }}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-solid border-[#51247a]">
              <img 
                src="https://pstu.ac.bd/storage/images/images/1704261659_WhatsApp%20Image%202024-01-02%20at%205.46.49%20PM.jpeg" 
                alt="PSTU Logo" 
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <div>
              <h1 className="text-xl font-bold">পটুয়াখালী বিজ্ঞান ও প্রযুক্তি বিশ্ববিদ্যালয়</h1>
              <p className="text-sm opacity-90">Patuakhali Science and Technology University</p>
            </div>
          </div>
          <nav className="flex items-center space-x-4">
            <Link href="/" className="hover:text-blue-200 transition-colors">
              Home
            </Link>
            <Link href="/login">
              <Button
                variant="outline"
                className="bg-white hover:bg-gray-50 border-white"
                style={{ color: "#51247a", backgroundColor: "#ffffff" }}
              >
                Login
              </Button>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}
