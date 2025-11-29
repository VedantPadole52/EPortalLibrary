
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import logo from "@assets/generated_images/official_municipal_corporation_seal_logo.png";
import heroBg from "@assets/generated_images/modern_digital_library_interior_with_students.png";

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
    <div className="min-h-screen flex items-center justify-center relative bg-secondary">
      {/* Subtle Background */}
      <div className="absolute inset-0 z-0 opacity-10" style={{ backgroundImage: `url(${heroBg})`, backgroundSize: 'cover' }}></div>
      
      <Card className="w-full max-w-md z-10 shadow-2xl border-t-4 border-accent animate-in fade-in zoom-in duration-500">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-4 bg-white p-2 rounded-full shadow-md inline-block">
            <img src={logo} alt="Logo" className="h-16 w-16" />
          </div>
          <CardTitle className="text-2xl font-bold text-primary">Citizen Login</CardTitle>
          <CardDescription>Enter your credentials to access the E-Library</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="mobile">Mobile Number / Email</Label>
              <Input id="mobile" placeholder="Enter your registered mobile" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="••••••••" required />
            </div>
            <div className="flex items-center justify-between text-sm">
              <a href="#" className="text-primary hover:underline">Forgot Password?</a>
            </div>
            <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-white" disabled={isLoading}>
              {isLoading ? "Verifying Credentials..." : "Login Securely"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-2 text-center text-sm text-muted-foreground">
          <p>Don't have an account?</p>
          <Link href="/register">
            <span className="text-primary font-bold hover:underline cursor-pointer">Register for a Citizen Account</span>
          </Link>
          <Link href="/">
            <span className="text-xs mt-4 block hover:text-primary">← Back to Home</span>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
