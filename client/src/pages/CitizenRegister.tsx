import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { User, BookOpen, ArrowRight, CheckCircle2 } from "lucide-react";
import { authApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const EMBLEM_URL = "https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg";

export default function CitizenRegister() {
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Passwords do not match",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await authApi.register(name, email, password, phone);
      toast({
        title: "Registration Successful",
        description: `Welcome, ${response.user.name}! You have been registered.`,
      });
      setLocation("/citizen/dashboard");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: error.message || "Failed to register. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 font-sans">
      <Header variant="public" />
      
      <main className="flex-grow flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-5xl flex flex-col md:flex-row bg-white rounded-lg shadow-2xl overflow-hidden min-h-[700px]">
          
          {/* Left Side: Info */}
          <div className="w-full md:w-1/2 bg-gradient-to-br from-[#1e3a8a] to-[#172554] p-12 flex flex-col text-white relative overflow-hidden">
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg width=\\'60\\' height=\\'60\\' viewBox=\\'0 0 60 60\\' xmlns=\\'http://www.w3.org/2000/svg\\'%3E%3Cg fill=\\'none\\' fill-rule=\\'evenodd\\'%3E%3Cg fill=\\'%23ffffff\\' fill-opacity=\\'1\\'%3E%3Cpath d=\\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')" }}></div>
            
            <div className="relative z-10 flex-1 flex flex-col justify-center items-center text-center">
              <div className="bg-white/10 p-4 rounded-full backdrop-blur-sm mb-6 border border-white/20">
                <img src={EMBLEM_URL} alt="Emblem" className="h-20 invert brightness-0 opacity-90" />
              </div>
              
              <h2 className="text-3xl font-serif font-bold mb-2">Join Our Community</h2>
              <p className="text-blue-200 mb-8 text-lg">Access Amravati's Digital Knowledge Hub</p>
              
              <div className="space-y-4 text-left w-full max-w-xs">
                <div className="flex items-center gap-3 bg-white/5 p-3 rounded border border-white/10">
                  <BookOpen className="h-5 w-5 text-[#f97316]" />
                  <span className="text-sm font-medium">10,000+ Digital Books</span>
                </div>
                <div className="flex items-center gap-3 bg-white/5 p-3 rounded border border-white/10">
                  <User className="h-5 w-5 text-[#f97316]" />
                  <span className="text-sm font-medium">Personalized Dashboard</span>
                </div>
                <div className="flex items-center gap-3 bg-white/5 p-3 rounded border border-white/10">
                  <CheckCircle2 className="h-5 w-5 text-[#f97316]" />
                  <span className="text-sm font-medium">Free NCERTs & Archives</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Registration Form */}
          <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-white overflow-y-auto">
            <div className="max-w-sm mx-auto w-full">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-800">Create Account</h3>
                <p className="text-gray-500 text-sm mt-1">Join the digital library today</p>
              </div>

              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-xs font-bold text-gray-500 uppercase">Full Name</Label>
                  <Input 
                    id="name" 
                    type="text"
                    placeholder="Your full name" 
                    className="h-10 bg-gray-50 border-gray-300 focus-visible:ring-[#1e3a8a]" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required 
                    data-testid="input-name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-xs font-bold text-gray-500 uppercase">Email Address</Label>
                  <Input 
                    id="email" 
                    type="email"
                    placeholder="Enter email" 
                    className="h-10 bg-gray-50 border-gray-300 focus-visible:ring-[#1e3a8a]" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required 
                    data-testid="input-email"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-xs font-bold text-gray-500 uppercase">Phone Number</Label>
                  <Input 
                    id="phone" 
                    type="tel"
                    placeholder="10-digit phone number" 
                    className="h-10 bg-gray-50 border-gray-300 focus-visible:ring-[#1e3a8a]" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    data-testid="input-phone"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-xs font-bold text-gray-500 uppercase">Password</Label>
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="Minimum 6 characters" 
                    className="h-10 bg-gray-50 border-gray-300 focus-visible:ring-[#1e3a8a]" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required 
                    data-testid="input-password"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password" className="text-xs font-bold text-gray-500 uppercase">Confirm Password</Label>
                  <Input 
                    id="confirm-password" 
                    type="password" 
                    placeholder="Confirm password" 
                    className="h-10 bg-gray-50 border-gray-300 focus-visible:ring-[#1e3a8a]" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required 
                    data-testid="input-confirm-password"
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full h-10 bg-[#008C45] hover:bg-[#007035] text-white font-bold text-base shadow-lg transition-transform active:scale-95 mt-2" 
                  disabled={isLoading}
                  data-testid="button-register"
                >
                  {isLoading ? "Creating Account..." : "Create Account"}
                </Button>
              </form>

              <div className="mt-6 pt-4 border-t border-gray-100 text-center">
                <p className="text-sm text-gray-600">
                  Already have an account? <button onClick={() => setLocation("/login")} className="text-[#1e3a8a] font-bold hover:underline">Sign In</button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
