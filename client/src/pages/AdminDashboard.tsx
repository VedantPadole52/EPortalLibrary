
import { useState, useEffect } from "react";
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  BookOpen, 
  Activity, 
  TrendingUp, 
  Settings, 
  FileText, 
  UserCheck,
  AlertCircle
} from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

// MOCK DATA GENERATORS FOR "REAL-TIME" FEEL

const CHART_DATA = [
  { name: "Mon", visits: 400 },
  { name: "Tue", visits: 300 },
  { name: "Wed", visits: 550 },
  { name: "Thu", visits: 450 },
  { name: "Fri", visits: 700 },
  { name: "Sat", visits: 850 },
  { name: "Sun", visits: 600 },
];

const PIE_DATA = [
  { name: "History", value: 400, color: "#0A346F" },
  { name: "Science", value: 300, color: "#008C45" },
  { name: "Math", value: 300, color: "#FF9933" },
  { name: "Others", value: 200, color: "#9ca3af" },
];

const INITIAL_LOGS = [
  { id: 1, user: "Amit_K", action: "Logged In", time: "10:45 AM", type: "login" },
  { id: 2, user: "Priya_S", action: "Started 'Modern Physics'", time: "10:46 AM", type: "read" },
  { id: 3, user: "Rahul_V", action: "Downloaded 'MPSC Guide'", time: "10:48 AM", type: "download" },
  { id: 4, user: "Admin_Sys", action: "Updated Catalog", time: "10:50 AM", type: "admin" },
];

export default function AdminDashboard() {
  // State for real-time simulation
  const [activeUsers, setActiveUsers] = useState(124);
  const [totalVisits, setTotalVisits] = useState(1452);
  const [logs, setLogs] = useState(INITIAL_LOGS);
  const [isConnected, setIsConnected] = useState(true);

  // Simulate Real-Time Socket Updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Randomly fluctuate active users
      setActiveUsers(prev => {
        const change = Math.floor(Math.random() * 5) - 2; // -2 to +2
        return Math.max(50, prev + change);
      });

      // Increment visits occasionally
      if (Math.random() > 0.7) {
        setTotalVisits(prev => prev + 1);
      }

      // Add random log occasionally
      if (Math.random() > 0.6) {
        const users = ["Vikram_R", "Sneha_P", "Anjali_M", "Rohit_D", "Guest_User"];
        const actions = [
          { action: "Logged In", type: "login" },
          { action: "Started Reading 'Indian Polity'", type: "read" },
          { action: "Logged Out", type: "logout" },
          { action: "Failed Login Attempt", type: "alert" }
        ];
        
        const randomUser = users[Math.floor(Math.random() * users.length)];
        const randomAction = actions[Math.floor(Math.random() * actions.length)];
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        setLogs(prev => [{
          id: Date.now(),
          user: randomUser,
          action: randomAction.action,
          time: time,
          type: randomAction.type
        }, ...prev.slice(0, 9)]); // Keep last 10
      }

    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header variant="admin" />

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-64 bg-primary text-white hidden md:block p-4">
          <div className="mb-8 px-2">
             <h2 className="text-xs uppercase tracking-wider text-white/50 font-bold mb-2">Main Menu</h2>
             <nav className="space-y-1">
               <Button variant="secondary" className="w-full justify-start bg-white/10 text-white hover:bg-white/20 border-none">
                 <Activity className="mr-2 h-4 w-4" /> Dashboard
               </Button>
               <Button variant="ghost" className="w-full justify-start text-white/70 hover:text-white hover:bg-white/10">
                 <BookOpen className="mr-2 h-4 w-4" /> Book Manager
               </Button>
               <Button variant="ghost" className="w-full justify-start text-white/70 hover:text-white hover:bg-white/10">
                 <Users className="mr-2 h-4 w-4" /> User Manager
               </Button>
               <Button variant="ghost" className="w-full justify-start text-white/70 hover:text-white hover:bg-white/10">
                 <FileText className="mr-2 h-4 w-4" /> Reports
               </Button>
             </nav>
          </div>
          <div className="px-2">
             <h2 className="text-xs uppercase tracking-wider text-white/50 font-bold mb-2">System</h2>
             <nav className="space-y-1">
               <Button variant="ghost" className="w-full justify-start text-white/70 hover:text-white hover:bg-white/10">
                 <Settings className="mr-2 h-4 w-4" /> Settings
               </Button>
             </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          
          <div className="flex items-center justify-between mb-6">
             <div>
               <h1 className="text-2xl font-bold text-gray-800">System Overview</h1>
               <p className="text-sm text-muted-foreground flex items-center gap-2">
                 <span className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
                 {isConnected ? "Real-time WebSocket Connected" : "Disconnected"}
               </p>
             </div>
             <div className="flex gap-2">
               <Button variant="outline" size="sm">Export Data</Button>
               <Button size="sm" className="bg-primary">Generate Report</Button>
             </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Users</p>
                  <h3 className="text-3xl font-bold text-primary mt-1">{activeUsers}</h3>
                </div>
                <div className="h-12 w-12 bg-blue-50 text-primary rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Today's Visits</p>
                  <h3 className="text-3xl font-bold text-gray-800 mt-1">{totalVisits}</h3>
                </div>
                <div className="h-12 w-12 bg-green-50 text-accent rounded-full flex items-center justify-center">
                  <TrendingUp className="h-6 w-6" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Books</p>
                  <h3 className="text-3xl font-bold text-gray-800 mt-1">12,405</h3>
                </div>
                <div className="h-12 w-12 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center">
                  <BookOpen className="h-6 w-6" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Reg. Citizens</p>
                  <h3 className="text-3xl font-bold text-gray-800 mt-1">8,932</h3>
                </div>
                <div className="h-12 w-12 bg-purple-50 text-purple-500 rounded-full flex items-center justify-center">
                  <UserCheck className="h-6 w-6" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Traffic Trend */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>User Traffic Trends (Last 7 Days)</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={CHART_DATA}>
                    <defs>
                      <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0A346F" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#0A346F" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="visits" stroke="#0A346F" fillOpacity={1} fill="url(#colorVisits)" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Category Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Popular Categories</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={PIE_DATA}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {PIE_DATA.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap justify-center gap-4 mt-4">
                  {PIE_DATA.map((entry, index) => (
                    <div key={index} className="flex items-center text-xs text-gray-600">
                      <div className="w-2 h-2 rounded-full mr-1" style={{ backgroundColor: entry.color }}></div>
                      {entry.name}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Live Logs */}
          <Card className="bg-black text-green-400 font-mono border-gray-800 shadow-xl overflow-hidden">
            <CardHeader className="border-b border-gray-800 bg-gray-900/50 py-3">
              <CardTitle className="text-sm font-mono flex items-center gap-2">
                 <Activity className="h-4 w-4 animate-pulse" /> Live System Logs
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 h-[200px] overflow-y-auto bg-black relative">
              <div className="absolute top-0 left-0 w-full h-full p-4 space-y-2">
                {logs.map((log) => (
                  <div key={log.id} className="flex items-start gap-3 text-xs animate-in fade-in slide-in-from-left-2 duration-300">
                    <span className="opacity-50 text-gray-500">[{log.time}]</span>
                    <span className={`font-bold ${log.type === 'alert' ? 'text-red-500' : 'text-blue-400'}`}>
                      {log.user}
                    </span>
                    <span className="text-gray-300">{log.action}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

        </main>
      </div>
    </div>
  );
}
