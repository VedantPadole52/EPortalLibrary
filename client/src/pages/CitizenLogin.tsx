
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

// Reuse assets
const EMBLEM_URL = "https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg";

export default function CitizenLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await authApi.login(email, password);
      
      toast({
        title: "Login Successful",
        description: `Welcome back, ${response.user.name}!`,
      });
      
      // Redirect based on role
      if (response.user.role === "admin") {
        setLocation("/admin/dashboard");
      } else {
        setLocation("/citizen/dashboard");
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: error.message || "Invalid credentials. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
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
              <p>Demo Credentials: demo@user.com / user123</p>
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
                  <Label htmlFor="email" className="text-xs font-bold text-gray-500 uppercase">Email Address</Label>
                  <Input 
                    id="email" 
                    type="email"
                    placeholder="Enter registered email" 
                    className="h-12 bg-gray-50 border-gray-300 focus-visible:ring-[#1e3a8a]" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required 
                    data-testid="input-email"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="password" className="text-xs font-bold text-gray-500 uppercase">Password</Label>
                    <button type="button" className="text-xs text-[#1e3a8a] font-medium hover:underline">Forgot?</button>
                  </div>
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="••••••••" 
                    className="h-12 bg-gray-50 border-gray-300 focus-visible:ring-[#1e3a8a]" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required 
                    data-testid="input-password"
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full h-12 bg-[#f97316] hover:bg-[#ea580c] text-white font-bold text-base shadow-lg transition-transform active:scale-95" 
                  disabled={isLoading}
                  data-testid="button-login"
                >
                  {isLoading ? "Verifying..." : "Login"}
                </Button>
              </form>

              <div className="mt-8 pt-6 border-t border-gray-100 text-center space-y-3">
                <p className="text-sm text-gray-600">
                  Don't have an account? <button onClick={() => setLocation("/register")} className="text-[#008C45] font-bold hover:underline" data-testid="link-register">Register Now</button>
                </p>
                <p className="text-sm text-gray-600">
                  Admin? <button onClick={() => setLocation("/portal/admin-access")} className="text-[#1e3a8a] font-bold hover:underline" data-testid="link-admin">Login Here</button>
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
