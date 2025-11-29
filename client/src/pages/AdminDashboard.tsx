
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
  AlertCircle,
  Home as HomeIcon,
  BarChart3
} from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { adminApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

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

export default function AdminDashboard() {
  const [activeUsers, setActiveUsers] = useState(0);
  const [totalVisits, setTotalVisits] = useState(0);
  const [totalBooks, setTotalBooks] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [logs, setLogs] = useState<Array<{id: number; userId: string; userName: string; action: string; timestamp: string; type: string}>>([]);
  const [chartData, setChartData] = useState<Array<{date: string; visits: number}>>([]);
  const [categoryStats, setCategoryStats] = useState<Array<{name: string; count: number}>>([]);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  useEffect(() => {
    loadAnalytics();
    connectWebSocket();
  }, []);

  const loadAnalytics = async () => {
    try {
      const [analyticsData, logsData, chartDataResponse] = await Promise.all([
        adminApi.getAnalytics(),
        adminApi.getActivityLogs(15),
        adminApi.getAnalyticsData(),
      ]);
      setActiveUsers(analyticsData.activeUsers);
      setTotalVisits(analyticsData.todayVisits);
      setTotalBooks(analyticsData.totalBooks);
      setTotalUsers(analyticsData.totalUsers);
      setLogs(logsData.logs);
      setChartData(chartDataResponse.dailyVisits);
      setCategoryStats(chartDataResponse.categoryStats);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to load analytics. Please check your permissions.",
      });
      setLocation("/portal/admin-access");
    }
  };

  const connectWebSocket = () => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${protocol}//${window.location.host}/ws`);

    ws.onopen = () => {
      console.log("WebSocket connected");
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === "active_users") {
          setActiveUsers(data.count);
        }
      } catch (error) {
        console.error("WebSocket message error:", error);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      setIsConnected(false);
    };

    ws.onclose = () => {
      console.log("WebSocket disconnected");
      setIsConnected(false);
      
      // Reconnect after 5 seconds
      setTimeout(() => {
        connectWebSocket();
      }, 5000);
    };

    return () => {
      ws.close();
    };
  };

  // Refresh activity logs every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      adminApi.getActivityLogs(15).then(data => {
        setLogs(data.logs);
      }).catch(err => console.error("Failed to refresh logs:", err));
    }, 5000);

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
               <Button 
                 variant="ghost" 
                 className="w-full justify-start text-white/70 hover:text-white hover:bg-white/10"
                 onClick={() => setLocation("/admin/books")}
                 data-testid="button-book-manager"
               >
                 <BookOpen className="mr-2 h-4 w-4" /> Book Manager
               </Button>
               <Button 
                 variant="ghost" 
                 className="w-full justify-start text-white/70 hover:text-white hover:bg-white/10"
                 onClick={() => setLocation("/admin/users")}
                 data-testid="button-user-manager"
               >
                 <Users className="mr-2 h-4 w-4" /> User Manager
               </Button>
               <Button 
                 variant="ghost" 
                 className="w-full justify-start text-white/70 hover:text-white hover:bg-white/10"
                 onClick={() => setLocation("/admin/categories")}
                 data-testid="button-category-manager"
               >
                 <BarChart3 className="mr-2 h-4 w-4" /> Categories
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
                 {isConnected ? "Real-time WebSocket Connected" : "Connecting..."}
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
                  <h3 className="text-3xl font-bold text-primary mt-1" data-testid="text-active-users">{activeUsers}</h3>
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
                  <h3 className="text-3xl font-bold text-gray-800 mt-1" data-testid="text-today-visits">{totalVisits}</h3>
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
                  <h3 className="text-3xl font-bold text-gray-800 mt-1" data-testid="text-total-books">{totalBooks}</h3>
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
                  <h3 className="text-3xl font-bold text-gray-800 mt-1" data-testid="text-total-users">{totalUsers}</h3>
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
                  <AreaChart data={chartData.length > 0 ? chartData : CHART_DATA}>
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
                    <Area type="monotone" dataKey="visits" stroke="#0A346F" fillOpacity={1} fill="url(#colorVisits)" name="Visits" />
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
                      data={categoryStats.length > 0 ? categoryStats.map((c, i) => ({
                        name: c.name,
                        value: c.count,
                        color: ["#0A346F", "#008C45", "#FF9933", "#9ca3af"][i % 4]
                      })) : PIE_DATA}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {(categoryStats.length > 0 ? categoryStats.map((c, i) => ({
                        name: c.name,
                        value: c.count,
                        color: ["#0A346F", "#008C45", "#FF9933", "#9ca3af"][i % 4]
                      })) : PIE_DATA).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap justify-center gap-4 mt-4">
                  {(categoryStats.length > 0 ? categoryStats.map((c, i) => ({
                    name: c.name,
                    value: c.count,
                    color: ["#0A346F", "#008C45", "#FF9933", "#9ca3af"][i % 4]
                  })) : PIE_DATA).map((entry, index) => (
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
                {logs.length === 0 ? (
                  <div className="text-gray-500 text-xs">Waiting for activity...</div>
                ) : (
                  logs.map((log) => (
                    <div key={log.id} className="flex items-start gap-3 text-xs animate-in fade-in slide-in-from-left-2 duration-300">
                      <span className="opacity-50 text-gray-500">[{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}]</span>
                      <span className={`font-bold ${log.type === 'complete' ? 'text-green-400' : log.type === 'reading' ? 'text-blue-400' : 'text-yellow-400'}`}>
                        {log.userName || log.userId}
                      </span>
                      <span className="text-gray-300">{log.action}</span>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

        </main>
      </div>
    </div>
  );
}
