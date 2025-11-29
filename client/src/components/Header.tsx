
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Search, User, Bell, LogOut } from "lucide-react";
import logo from "@assets/generated_images/official_municipal_corporation_seal_logo.png";

interface HeaderProps {
  variant?: "public" | "citizen" | "admin";
}

export default function Header({ variant = "public" }: HeaderProps) {
  const [location, setLocation] = useLocation();

  return (
    <header className="w-full border-b border-border bg-white shadow-sm sticky top-0 z-50">
      {/* Top Bar - Government Branding */}
      <div className="bg-primary text-white px-4 py-2 flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Left: Corp Logo */}
        <div className="flex items-center gap-3">
          <img 
            src={logo} 
            alt="Amravati Municipal Corporation" 
            className="h-12 w-12 rounded-full bg-white p-0.5 shadow-md"
          />
          <div className="text-left">
            <h1 className="text-sm md:text-base font-bold uppercase tracking-wide leading-tight">
              Amravati Municipal Corporation
            </h1>
            <p className="text-[10px] md:text-xs opacity-90">Government of Maharashtra</p>
          </div>
        </div>

        {/* Center: Emblem & Portal Title */}
        <div className="flex flex-col items-center text-center hidden md:flex">
          <div className="flex items-center gap-2">
            {/* Placeholder for Emblem */}
            <div className="h-8 w-8 flex items-center justify-center text-[8px] border border-white/30 rounded-full">
              Emblem
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-serif italic text-yellow-400">Satyamev Jayate</span>
              <span className="text-lg font-bold tracking-wider">E-Library Portal</span>
            </div>
          </div>
        </div>

        {/* Right: Navigation / Actions */}
        <div className="flex items-center gap-3">
          {variant === "public" && (
            <Link href="/login">
              <Button variant="default" className="bg-accent hover:bg-accent/90 text-white shadow-md">
                <User className="mr-2 h-4 w-4" />
                Citizen Login
              </Button>
            </Link>
          )}

          {variant === "citizen" && (
            <div className="flex items-center gap-4">
              <span className="text-xs md:text-sm hidden sm:inline-block">Welcome, <strong>Rahul</strong></span>
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                <Bell className="h-5 w-5" />
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="bg-transparent border-white/20 text-white hover:bg-white/10"
                onClick={() => setLocation("/")}
              >
                <LogOut className="h-4 w-4 mr-2" /> Logout
              </Button>
            </div>
          )}

          {variant === "admin" && (
             <div className="flex items-center gap-4">
             <span className="text-xs md:text-sm hidden sm:inline-block font-mono text-yellow-400">ADMIN CONSOLE</span>
             <Button 
               variant="outline" 
               size="sm" 
               className="bg-red-900/50 border-red-500/30 text-white hover:bg-red-900"
               onClick={() => setLocation("/")}
             >
               <LogOut className="h-4 w-4 mr-2" /> Logout
             </Button>
           </div>
          )}
        </div>
      </div>
      
      {/* Secondary Nav (Optional, mainly for decoration in mockup) */}
      <div className="h-1 bg-gradient-to-r from-primary via-white to-accent w-full"></div>
    </header>
  );
}
