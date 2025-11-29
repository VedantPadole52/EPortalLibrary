import { useState, useEffect } from "react";
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Settings as SettingsIcon, 
  Sun, 
  Moon, 
  Home as HomeIcon 
} from "lucide-react";
import { useLocation } from "wouter";

export default function AdminSettings() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [, setLocation] = useLocation();

  useEffect(() => {
    const darkMode = localStorage.getItem('darkMode') === 'true';
    setIsDarkMode(darkMode);
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    localStorage.setItem('darkMode', String(newDarkMode));
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900">
      <Header variant="admin" />

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-64 bg-primary dark:bg-gray-800 text-white hidden md:block p-4">
          <div className="mb-8 px-2">
             <h2 className="text-xs uppercase tracking-wider text-white/50 font-bold mb-2">Settings</h2>
             <nav className="space-y-1">
               <Button 
                 variant="secondary" 
                 className="w-full justify-start bg-white/10 text-white hover:bg-white/20 border-none"
               >
                 <SettingsIcon className="mr-2 h-4 w-4" /> Settings
               </Button>
               <Button 
                 variant="ghost" 
                 className="w-full justify-start text-white/70 hover:text-white hover:bg-white/10"
                 onClick={() => setLocation("/admin/dashboard")}
                 data-testid="button-back-to-dashboard"
               >
                 <HomeIcon className="mr-2 h-4 w-4" /> Back to Dashboard
               </Button>
             </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="mb-6">
             <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Settings</h1>
             <p className="text-sm text-muted-foreground">Manage your preferences and system settings</p>
          </div>

          <div className="max-w-2xl space-y-6">
            {/* Display Settings */}
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:text-white">
                  <Sun className="h-5 w-5" />
                  Display Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">Dark Mode</p>
                    <p className="text-sm text-muted-foreground dark:text-gray-400">Toggle between light and dark theme</p>
                  </div>
                  <button
                    onClick={toggleDarkMode}
                    className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors ${
                      isDarkMode ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                    data-testid="button-dark-mode-toggle"
                  >
                    <span
                      className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                        isDarkMode ? 'translate-x-9' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-900 rounded border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-blue-900 dark:text-blue-100">
                    {isDarkMode 
                      ? '🌙 Dark mode is enabled. The interface will use darker colors to reduce eye strain.' 
                      : '☀️ Light mode is enabled. The interface uses standard light colors.'}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* System Information */}
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="dark:text-white">System Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
                  <span className="font-medium text-gray-700 dark:text-gray-300">Version</span>
                  <span className="text-gray-600 dark:text-gray-400">1.0.0</span>
                </div>
                <div className="flex justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
                  <span className="font-medium text-gray-700 dark:text-gray-300">Application</span>
                  <span className="text-gray-600 dark:text-gray-400">E-Library Portal</span>
                </div>
                <div className="flex justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
                  <span className="font-medium text-gray-700 dark:text-gray-300">Organization</span>
                  <span className="text-gray-600 dark:text-gray-400">Amravati Municipal Corporation</span>
                </div>
              </CardContent>
            </Card>

            {/* Admin Controls */}
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="dark:text-white">Administrator Controls</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Quick access to system functions</p>
                <Button 
                  onClick={() => setLocation("/admin/dashboard")}
                  className="w-full bg-primary hover:bg-primary/90"
                  data-testid="button-dashboard-access"
                >
                  Go to Dashboard
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
