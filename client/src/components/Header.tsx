
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Search, User, Bell, LogOut, Menu, Home as HomeIcon, BookOpen, GraduationCap } from "lucide-react";
import { useState } from "react";

// Assets from reference
const EMBLEM_URL = "https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg";
const DIGITAL_INDIA_URL = "https://upload.wikimedia.org/wikipedia/en/9/95/Digital_India_logo.svg";

interface HeaderProps {
  variant?: "public" | "citizen" | "admin";
}

export default function Header({ variant = "public" }: HeaderProps) {
  const [location, setLocation] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const currentDate = new Date().toLocaleDateString('en-IN', { 
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
  });

  return (
    <div className="flex flex-col w-full font-sans">
      {/* Top Bar - Utility Level */}
      <div className="bg-gray-50 border-b border-gray-200 py-1 px-4 md:px-8 flex justify-between items-center text-xs text-gray-600 font-medium">
        <div className="flex gap-4 items-center">
          <span>{currentDate}</span>
          <span className="hidden md:inline border-l pl-3 border-gray-300">Government of Maharashtra</span>
        </div>
        
        <div className="flex items-center gap-4">
          {variant === "citizen" && (
            <div className="flex items-center gap-2 text-blue-900">
              <span className="font-bold">Welcome, Rahul</span>
              <div className="h-3 border-l border-gray-300 mx-1"></div>
            </div>
          )}
          
          <div className="flex gap-2 items-center cursor-pointer hover:text-black">
            <span>English</span>
            <span className="text-[10px] opacity-50">▼</span>
          </div>

          {variant !== "public" && (
            <button 
              onClick={() => setLocation("/")}
              className="text-red-600 hover:text-red-800 font-bold ml-2 flex items-center gap-1"
            >
              <LogOut className="h-3 w-3" /> <span className="hidden sm:inline">Logout</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Header - Identity Level */}
      <header className="bg-white py-4 border-b-4 border-[#f97316]">
        <div className="container mx-auto px-4 md:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Left: Emblem & Title */}
          <div className="flex items-center gap-4 w-full md:w-auto justify-center md:justify-start">
            <div className="flex flex-col items-center">
              <img src={EMBLEM_URL} alt="National Emblem" className="h-16 w-auto" />
              <span className="text-[10px] font-bold uppercase mt-1 tracking-wide text-gray-800">Satyameva Jayate</span>
            </div>
            
            <div className="border-l-2 border-gray-300 h-12 mx-2 hidden md:block"></div>
            
            <div className="text-center md:text-left">
              <h1 className="text-xl md:text-2xl font-serif font-bold text-gray-800 uppercase tracking-tight leading-none mb-1">
                E-Library Portal
              </h1>
              <p className="text-sm md:text-base text-gray-600 font-medium uppercase tracking-wide">
                Amravati Municipal Corporation
              </p>
            </div>
          </div>

          {/* Right: Digital India & Admin Label */}
          <div className="hidden md:flex items-center gap-6">
             {variant === "admin" && (
               <div className="text-right bg-blue-50 px-3 py-1 rounded border border-blue-100">
                 <p className="text-xs font-bold text-blue-900 uppercase">Official Admin Console</p>
                 <p className="text-[10px] text-gray-500">Dept of Education</p>
               </div>
             )}
             <img src={DIGITAL_INDIA_URL} alt="Digital India" className="h-12 opacity-90" />
          </div>
        </div>
      </header>

      {/* Navigation Bar */}
      <nav className="bg-[#1e3a8a] text-white shadow-md sticky top-0 z-40">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between h-12">
            {/* Mobile Menu Toggle */}
            <button 
              className="md:hidden py-2 text-white"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <Menu className="h-6 w-6" />
            </button>

            {/* Desktop Links */}
            <div className="hidden md:flex h-full">
              <Link href={variant === "admin" ? "/admin/dashboard" : (variant === "citizen" ? "/citizen/dashboard" : "/")}>
                <a className={`flex items-center px-6 h-full text-sm font-medium uppercase tracking-wide hover:bg-white/10 transition-colors ${location === "/" ? "bg-white/15" : ""}`}>
                  <HomeIcon className="h-4 w-4 mr-2" /> Home
                </a>
              </Link>
              
              <a href="#" className="flex items-center px-6 h-full text-sm font-medium uppercase tracking-wide hover:bg-white/10 transition-colors opacity-90 hover:opacity-100">
                <BookOpen className="h-4 w-4 mr-2" /> NCERT Books
              </a>
              
              <a href="#" className="flex items-center px-6 h-full text-sm font-medium uppercase tracking-wide hover:bg-white/10 transition-colors opacity-90 hover:opacity-100">
                <GraduationCap className="h-4 w-4 mr-2" /> Competitive Exams
              </a>

              {variant === "public" && (
                <Link href="/login">
                  <a className="flex items-center px-6 h-full text-sm font-medium uppercase tracking-wide hover:bg-[#f97316] transition-colors ml-auto bg-[#f97316] text-white">
                    <User className="h-4 w-4 mr-2" /> Login / Register
                  </a>
                </Link>
              )}
            </div>
          </div>
        </div>
        
        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-[#172554] border-t border-blue-800">
            <Link href="/">
              <a className="block px-4 py-3 text-sm text-white border-b border-blue-800">Home</a>
            </Link>
            <a className="block px-4 py-3 text-sm text-white border-b border-blue-800">NCERT Books</a>
            <a className="block px-4 py-3 text-sm text-white border-b border-blue-800">Competitive Exams</a>
            {variant === "public" && (
              <Link href="/login">
                <a className="block px-4 py-3 text-sm font-bold text-[#f97316]">Login / Register</a>
              </Link>
            )}
          </div>
        )}
      </nav>

      {/* Ticker (Global) */}
      <div className="bg-[#fff7ed] border-b border-[#fdba74] h-10 flex items-center overflow-hidden">
        <div className="container mx-auto flex items-center px-4">
          <div className="bg-[#ea580c] text-white px-3 py-1 text-[10px] font-bold uppercase mr-4 rounded-sm shadow whitespace-nowrap shrink-0">
            Latest Notices
          </div>
          <div className="overflow-hidden w-full">
             <div className="animate-[ticker_20s_linear_infinite] whitespace-nowrap inline-block w-full text-sm font-medium text-[#c2410c]">
                <span className="mr-8">📢 New MPSC Study Materials Uploaded!</span>
                <span className="mr-8">📅 Library closed on 15th August for Independence Day.</span>
                <span className="mr-8">🏆 "Best Reader" Award Ceremony on Sunday.</span>
                <span className="mr-8">📘 Class 10th & 12th Question Banks now available.</span>
             </div>
          </div>
        </div>
      </div>
      
      <style jsx global>{`
        @keyframes ticker {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
      `}</style>
    </div>
  );
}
