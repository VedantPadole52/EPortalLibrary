import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Printer, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

interface ReportData {
  totalUsers: number;
  totalBooks: number;
  todayVisits: number;
  activeUsers: number;
  dailyVisits: Array<{ date: string; visits: number }>;
  categoryStats: Array<{ name: string; count: number }>;
  topBooks: Array<{ title: string; reads: number }>;
}

export default function PrintableReports() {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [reportType, setReportType] = useState<string>("system");
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    loadReportData();
  }, [reportType]);

  const loadReportData = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/analytics-data");
      if (response.ok) {
        const data = await response.json();
        
        const analyticsResponse = await fetch("/api/admin/analytics");
        const analyticsData = analyticsResponse.ok ? await analyticsResponse.json() : {};
        
        setReportData({
          totalUsers: analyticsData.totalUsers || 0,
          totalBooks: analyticsData.totalBooks || 0,
          todayVisits: analyticsData.todayVisits || 0,
          activeUsers: analyticsData.activeUsers || 0,
          dailyVisits: data.dailyVisits || [],
          categoryStats: data.categoryStats || [],
          topBooks: data.topBooks || [],
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load report data"
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const renderSystemReport = () => (
    <div className="space-y-6 print:space-y-4">
      <h2 className="text-2xl font-bold print:text-xl">System Overview Report</h2>
      <p className="text-gray-600 print:text-gray-700">Generated: {new Date().toLocaleString()}</p>
      
      <div className="grid grid-cols-2 gap-4 print:grid-cols-2 print:gap-2">
        <div className="bg-blue-50 p-4 print:bg-white print:border print:border-gray-300 print:p-2">
          <p className="text-gray-600 print:text-sm">Total Users</p>
          <p className="text-2xl font-bold print:text-lg">{reportData?.totalUsers || 0}</p>
        </div>
        <div className="bg-green-50 p-4 print:bg-white print:border print:border-gray-300 print:p-2">
          <p className="text-gray-600 print:text-sm">Total Books</p>
          <p className="text-2xl font-bold print:text-lg">{reportData?.totalBooks || 0}</p>
        </div>
        <div className="bg-purple-50 p-4 print:bg-white print:border print:border-gray-300 print:p-2">
          <p className="text-gray-600 print:text-sm">Today's Visits</p>
          <p className="text-2xl font-bold print:text-lg">{reportData?.todayVisits || 0}</p>
        </div>
        <div className="bg-orange-50 p-4 print:bg-white print:border print:border-gray-300 print:p-2">
          <p className="text-gray-600 print:text-sm">Active Users</p>
          <p className="text-2xl font-bold print:text-lg">{reportData?.activeUsers || 0}</p>
        </div>
      </div>

      <div className="print:page-break-before">
        <h3 className="text-xl font-bold mt-6 mb-4 print:text-lg">Daily User Activity (Last 7 Days)</h3>
        <table className="w-full border-collapse print:text-sm">
          <thead>
            <tr className="bg-gray-100 print:bg-gray-50">
              <th className="border border-gray-300 p-2 text-left print:p-1">Date</th>
              <th className="border border-gray-300 p-2 text-right print:p-1">Visits</th>
            </tr>
          </thead>
          <tbody>
            {reportData?.dailyVisits.map((day, idx) => (
              <tr key={idx} className="hover:bg-gray-50 print:hover:bg-white">
                <td className="border border-gray-300 p-2 print:p-1">{day.date}</td>
                <td className="border border-gray-300 p-2 text-right print:p-1">{day.visits}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="print:page-break-before">
        <h3 className="text-xl font-bold mt-6 mb-4 print:text-lg">Category Distribution</h3>
        <table className="w-full border-collapse print:text-sm">
          <thead>
            <tr className="bg-gray-100 print:bg-gray-50">
              <th className="border border-gray-300 p-2 text-left print:p-1">Category</th>
              <th className="border border-gray-300 p-2 text-right print:p-1">Books</th>
              <th className="border border-gray-300 p-2 text-right print:p-1">%</th>
            </tr>
          </thead>
          <tbody>
            {reportData?.categoryStats.map((cat, idx) => {
              const total = reportData.categoryStats.reduce((sum, c) => sum + c.count, 0);
              const percentage = total > 0 ? ((cat.count / total) * 100).toFixed(1) : 0;
              return (
                <tr key={idx} className="hover:bg-gray-50 print:hover:bg-white">
                  <td className="border border-gray-300 p-2 print:p-1">{cat.name}</td>
                  <td className="border border-gray-300 p-2 text-right print:p-1">{cat.count}</td>
                  <td className="border border-gray-300 p-2 text-right print:p-1">{percentage}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="print:page-break-before">
        <h3 className="text-xl font-bold mt-6 mb-4 print:text-lg">Top Books by Reads</h3>
        <table className="w-full border-collapse print:text-sm">
          <thead>
            <tr className="bg-gray-100 print:bg-gray-50">
              <th className="border border-gray-300 p-2 text-left print:p-1">Book Title</th>
              <th className="border border-gray-300 p-2 text-right print:p-1">Reads</th>
            </tr>
          </thead>
          <tbody>
            {reportData?.topBooks.slice(0, 10).map((book, idx) => (
              <tr key={idx} className="hover:bg-gray-50 print:hover:bg-white">
                <td className="border border-gray-300 p-2 print:p-1">{book.title}</td>
                <td className="border border-gray-300 p-2 text-right print:p-1">{book.reads}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white print:bg-white">
      {/* Non-printable header */}
      <div className="print:hidden sticky top-0 z-50 bg-white border-b p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setLocation("/admin/reports")}
            data-testid="button-back-reports"
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
          <h1 className="text-2xl font-bold">Printable Report</h1>
        </div>
        <Button 
          onClick={handlePrint}
          className="bg-blue-600 hover:bg-blue-700"
          data-testid="button-print-report"
        >
          <Printer className="h-4 w-4 mr-2" /> Print
        </Button>
      </div>

      {/* Report content */}
      <div className="p-8 print:p-0 max-w-4xl mx-auto">
        {loading ? (
          <div className="text-center py-12">Loading report...</div>
        ) : (
          <>
            <div className="mb-8 print:mb-4">
              <h1 className="text-4xl font-bold text-blue-600 print:text-2xl">Amravati E-Library</h1>
              <p className="text-gray-600 print:text-sm">Library Statistics Report</p>
            </div>
            {renderSystemReport()}
            <div className="mt-12 pt-6 border-t text-center text-gray-500 text-sm print:mt-8 print:pt-4">
              © Amravati Municipal Corporation - E-Library Portal
            </div>
          </>
        )}
      </div>

      <style>{`
        @media print {
          * {
            margin: 0;
            padding: 0;
          }
          body {
            font-size: 12px;
            line-height: 1.4;
            color: #000;
          }
          .print\\:page-break-before {
            page-break-before: always;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 1cm 0;
          }
          th, td {
            border: 1px solid #000;
            padding: 6px;
            text-align: left;
          }
          th {
            background-color: #f0f0f0;
            font-weight: bold;
          }
          h2 {
            margin-top: 1cm;
            margin-bottom: 0.5cm;
            font-size: 18px;
          }
          h3 {
            margin-top: 0.8cm;
            margin-bottom: 0.4cm;
            font-size: 14px;
          }
        }
      `}</style>
    </div>
  );
}
