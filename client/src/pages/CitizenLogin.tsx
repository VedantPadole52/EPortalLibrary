
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { User, BookOpen, ArrowRight, CheckCircle2 } from "lucide-react";

// Reuse assets
const EMBLEM_URL = "https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg";

export default function CitizenLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocation] = useLocation();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate network request
    setTimeout(() => {
      setIsLoading(false);
      setLocation("/citizen/dashboard");
    }, 1500);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 font-sans">
      <Header variant="public" />
      
      <main className="flex-grow flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-5xl flex flex-col md:flex-row bg-white rounded-lg shadow-2xl overflow-hidden min-h-[600px]">
          
          {/* Left Side: Welcome / Info */}
          <div className="w-full md:w-1/2 bg-gradient-to-br from-[#1e3a8a] to-[#172554] p-12 flex flex-col text-white relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg width=\\'60\\' height=\\'60\\' viewBox=\\'0 0 60 60\\' xmlns=\\'http://www.w3.org/2000/svg\\'%3E%3Cg fill=\\'none\\' fill-rule=\\'evenodd\\'%3E%3Cg fill=\\'%23ffffff\\' fill-opacity=\\'1\\'%3E%3Cpath d=\\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')" }}></div>
            
            <div className="relative z-10 flex-1 flex flex-col justify-center items-center text-center">
              <div className="bg-white/10 p-4 rounded-full backdrop-blur-sm mb-6 border border-white/20">
                 <img src={EMBLEM_URL} alt="Emblem" className="h-20 invert brightness-0 opacity-90" />
              </div>
              
              <h2 className="text-3xl font-serif font-bold mb-2">Citizen Access</h2>
              <p className="text-blue-200 mb-8 text-lg">Welcome to Amravati's Digital Knowledge Hub</p>
              
              <div className="space-y-4 text-left w-full max-w-xs">
                <div className="flex items-center gap-3 bg-white/5 p-3 rounded border border-white/10">
                  <BookOpen className="h-5 w-5 text-[#f97316]" />
                  <span className="text-sm font-medium">Access 10,000+ Digital Books</span>
                </div>
                <div className="flex items-center gap-3 bg-white/5 p-3 rounded border border-white/10">
                  <User className="h-5 w-5 text-[#f97316]" />
                  <span className="text-sm font-medium">Personalized Reading Dashboard</span>
                </div>
                <div className="flex items-center gap-3 bg-white/5 p-3 rounded border border-white/10">
                  <CheckCircle2 className="h-5 w-5 text-[#f97316]" />
                  <span className="text-sm font-medium">Download Free NCERTs</span>
                </div>
              </div>
            </div>

            <div className="relative z-10 mt-auto text-center pt-8 border-t border-white/10 text-xs text-blue-300">
              <p>Not a registered citizen yet?</p>
              <a href="#" className="text-[#f97316] font-bold hover:text-white transition-colors text-sm mt-1 inline-block uppercase tracking-wider">Create New Account →</a>
            </div>
          </div>

          {/* Right Side: Login Form */}
          <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-white">
            <div className="max-w-sm mx-auto w-full">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-800">Sign In</h3>
                <p className="text-gray-500 text-sm mt-1">Access your digital library account</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="mobile" className="text-xs font-bold text-gray-500 uppercase">Mobile Number / Email</Label>
                  <Input 
                    id="mobile" 
                    placeholder="Enter registered mobile" 
                    className="h-12 bg-gray-50 border-gray-300 focus-visible:ring-[#1e3a8a]" 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="password" className="text-xs font-bold text-gray-500 uppercase">Password</Label>
                    <a href="#" className="text-xs text-[#1e3a8a] font-medium hover:underline">Forgot?</a>
                  </div>
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="••••••••" 
                    className="h-12 bg-gray-50 border-gray-300 focus-visible:ring-[#1e3a8a]" 
                    required 
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full h-12 bg-[#f97316] hover:bg-[#ea580c] text-white font-bold text-base shadow-lg transition-transform active:scale-95" 
                  disabled={isLoading}
                >
                  {isLoading ? "Verifying..." : "Login"}
                </Button>
              </form>

              <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                 <p className="text-xs text-gray-400 mb-4">Or login with</p>
                 <div className="flex gap-3 justify-center">
                   <Button variant="outline" className="flex-1 border-gray-200 hover:bg-gray-50 text-gray-600">
                     OTP Login
                   </Button>
                   <Button variant="outline" className="flex-1 border-gray-200 hover:bg-gray-50 text-gray-600">
                     Parichay
                   </Button>
                 </div>
              </div>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
