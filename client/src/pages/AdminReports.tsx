import { useState } from "react";
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  Download, 
  Printer, 
  Home as HomeIcon,
  BarChart3,
  Users,
  BookOpen,
  TrendingUp
} from "lucide-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

export default function AdminReports() {
  const [generating, setGenerating] = useState<string | null>(null);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const reportTypes = [
    {
      id: "system",
      name: "System Overview Report",
      description: "Complete system summary with users, books, daily visits, categories, and top books",
      icon: <BarChart3 className="h-6 w-6" />,
      color: "bg-blue-50 dark:bg-blue-900/20"
    },
    {
      id: "category-details",
      name: "Category Statistics Report",
      description: "Detailed breakdown of all categories with book counts and distribution analysis",
      icon: <BookOpen className="h-6 w-6" />,
      color: "bg-green-50 dark:bg-green-900/20"
    },
    {
      id: "user-activity",
      name: "User Activity Report",
      description: "Active users, registration trends, and user engagement analytics",
      icon: <Users className="h-6 w-6" />,
      color: "bg-purple-50 dark:bg-purple-900/20"
    },
    {
      id: "circulation",
      name: "Book Circulation Report",
      description: "Top books, reading trends, and book circulation statistics",
      icon: <TrendingUp className="h-6 w-6" />,
      color: "bg-orange-50 dark:bg-orange-900/20"
    }
  ];

  const printReport = (reportType: string) => {
    setLocation(`/admin/reports/printable?type=${reportType}`);
  };

  const generateReport = async (reportType: string) => {
    setGenerating(reportType);
    try {
      const response = await fetch(`/api/admin/reports/${reportType}`, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error("Failed to generate report");
      }

      const contentDisposition = response.headers.get("content-disposition");
      const filename = contentDisposition
        ? contentDisposition.split("filename=")[1].replace(/"/g, "")
        : `report-${reportType}-${new Date().toISOString().split('T')[0]}.pdf`;

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: `PDF report downloaded successfully`,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to generate report",
      });
    } finally {
      setGenerating(null);
    }
  };

  const exportToExcel = async (exportType: string) => {
    setGenerating(exportType);
    try {
      const response = await fetch(`/api/admin/export/${exportType}`, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error("Failed to export data");
      }

      const contentDisposition = response.headers.get("content-disposition");
      const filename = contentDisposition
        ? contentDisposition.split("filename=")[1].replace(/"/g, "")
        : `export-${exportType}-${new Date().toISOString().split('T')[0]}.xlsx`;

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: `Excel file exported successfully`,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to export data",
      });
    } finally {
      setGenerating(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900">
      <Header variant="admin" />

      <div className="flex flex-1">
        <aside className="w-64 bg-primary dark:bg-gray-800 text-white hidden md:block p-4">
          <div className="mb-8 px-2">
             <h2 className="text-xs uppercase tracking-wider text-white/50 font-bold mb-2">Reports</h2>
             <nav className="space-y-1">
               <Button 
                 variant="secondary" 
                 className="w-full justify-start bg-white/10 text-white hover:bg-white/20 border-none"
               >
                 <FileText className="mr-2 h-4 w-4" /> Generate Reports
               </Button>
               <Button 
                 variant="ghost" 
                 className="w-full justify-start text-white/70 hover:text-white hover:bg-white/10"
                 onClick={() => setLocation("/admin/dashboard")}
               >
                 <HomeIcon className="mr-2 h-4 w-4" /> Back to Dashboard
               </Button>
             </nav>
          </div>
        </aside>

        <main className="flex-1 p-6 overflow-y-auto">
          <div className="mb-8">
             <h1 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
               <FileText className="h-8 w-8 text-blue-600" />
               Library Reports & Analytics
             </h1>
             <p className="text-gray-600 dark:text-gray-400 mt-2">Generate comprehensive printable reports for library statistics and analytics</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reportTypes.map((report) => (
              <Card key={report.id} className={`${report.color} dark:border-gray-700 hover:shadow-lg transition-shadow`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-blue-600">{report.icon}</div>
                      <CardTitle className="dark:text-white">{report.name}</CardTitle>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{report.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => printReport(report.id)}
                      className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                      data-testid={`button-print-report-${report.id}`}
                    >
                      <Printer className="h-4 w-4 mr-2" />
                      Print
                    </Button>
                    <Button
                      onClick={() => generateReport(report.id)}
                      disabled={generating === report.id}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                      data-testid={`button-download-report-${report.id}`}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      {generating === report.id ? "Generating..." : "PDF"}
                    </Button>
                    <Button
                      onClick={() => exportToExcel(report.id)}
                      disabled={generating === report.id}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                      data-testid={`button-export-excel-${report.id}`}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      {generating === report.id ? "Exporting..." : "Excel"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Info Section */}
          <Card className="mt-8 dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="dark:text-white">📋 About Library Reports</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 dark:text-gray-300">
              <div>
                <h4 className="font-semibold text-gray-800 dark:text-white">System Overview Report</h4>
                <p className="text-sm">Comprehensive summary of all library operations including total users, books, daily traffic trends, category distribution, and most popular books.</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 dark:text-white">Category Statistics</h4>
                <p className="text-sm">Detailed analysis of each book category showing collection size, distribution percentages, and category-wise performance metrics.</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 dark:text-white">User Activity Report</h4>
                <p className="text-sm">User engagement metrics including registration trends, active users, user retention, and overall platform adoption rates.</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 dark:text-white">Book Circulation Report</h4>
                <p className="text-sm">Book usage analytics including most read books, reading trends over time, collection usage rates, and circulation patterns.</p>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
