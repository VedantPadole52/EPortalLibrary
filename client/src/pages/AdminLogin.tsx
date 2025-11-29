
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Lock, ShieldAlert } from "lucide-react";
import logo from "@assets/generated_images/official_municipal_corporation_seal_logo.png";

export default function AdminLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocation] = useLocation();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate network request
    setTimeout(() => {
      setIsLoading(false);
      setLocation("/admin/dashboard");
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      {/* Official/Strict Layout - No fancy backgrounds */}
      
      <Card className="w-full max-w-sm shadow-none border border-gray-300 rounded-none bg-white">
        <div className="bg-primary p-6 text-center text-white">
          <div className="mx-auto mb-4 bg-white p-1 rounded-full inline-block h-16 w-16 flex items-center justify-center">
            <img src={logo} alt="Logo" className="h-14 w-14" />
          </div>
          <h2 className="text-xl font-bold uppercase tracking-wide">Official Access</h2>
          <p className="text-xs opacity-70 mt-1">Amravati Municipal Corporation</p>
        </div>

        <CardContent className="pt-8 px-8 pb-8">
          <div className="mb-6 flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
            <ShieldAlert className="h-4 w-4" />
            <span>Authorized Personnel Only. All IP addresses are logged.</span>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="admin-id" className="text-xs uppercase font-bold text-gray-500">Admin ID</Label>
              <Input id="admin-id" className="rounded-none border-gray-300 focus-visible:ring-primary" placeholder="AMC-ADMIN-001" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs uppercase font-bold text-gray-500">Secure Key</Label>
              <Input id="password" type="password" className="rounded-none border-gray-300 focus-visible:ring-primary" placeholder="••••••••" required />
            </div>
            
            <Button type="submit" className="w-full rounded-none bg-primary hover:bg-primary/90 text-white font-bold uppercase tracking-widest" disabled={isLoading}>
              {isLoading ? <span className="animate-pulse">Authenticating...</span> : <span className="flex items-center justify-center gap-2"><Lock className="h-4 w-4" /> Access Portal</span>}
            </Button>
          </form>
        </CardContent>
        <div className="bg-gray-50 p-4 text-center border-t border-gray-200">
           <Link href="/">
            <span className="text-xs text-gray-500 hover:text-primary cursor-pointer">← Return to Public Portal</span>
          </Link>
        </div>
      </Card>
    </div>
  );
}
