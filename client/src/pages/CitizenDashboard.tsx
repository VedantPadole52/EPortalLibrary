
import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Book, 
  Clock, 
  Search, 
  Bookmark, 
  History, 
  Award,
  Download,
  MoreHorizontal
} from "lucide-react";

import book1 from "@assets/generated_images/history_book_cover.png";
import book2 from "@assets/generated_images/mathematics_book_cover.png";
import book3 from "@assets/generated_images/science_book_cover.png";

const BOOKS = [
  { id: 1, title: "Indian History Vol. 1", author: "R.S. Sharma", cover: book1, category: "History", progress: 75 },
  { id: 2, title: "Advanced Calculus", author: "H.K. Dass", cover: book2, category: "Mathematics", progress: 30 },
  { id: 3, title: "Environmental Science", author: "Erach Bharucha", cover: book3, category: "Science", progress: 0 },
  { id: 4, title: "Modern Polity", author: "M. Laxmikanth", cover: book1, category: "Polity", progress: 0 }, 
  { id: 5, title: "General Knowledge 2024", author: "Manohar Pandey", cover: book2, category: "GK", progress: 10 },
  { id: 6, title: "Physics for Engineers", author: "Gaur & Gupta", cover: book3, category: "Engineering", progress: 0 },
];

export default function CitizenDashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const filteredBooks = BOOKS.filter(book => 
    book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 font-sans">
      <Header variant="citizen" />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        
        {/* User Welcome & Stats */}
        <section className="mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 bg-[#1e3a8a] rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-md border-4 border-white">
                RV
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Welcome back, Rahul!</h1>
                <p className="text-gray-500 text-sm">Student Member • ID: AMC-LIB-2024-8821</p>
              </div>
            </div>
            
            <div className="flex gap-6 text-center">
              <div className="px-4 py-2 bg-blue-50 rounded border border-blue-100">
                <p className="text-2xl font-bold text-[#1e3a8a]">12</p>
                <p className="text-xs font-bold text-gray-500 uppercase">Books Read</p>
              </div>
              <div className="px-4 py-2 bg-orange-50 rounded border border-orange-100">
                <p className="text-2xl font-bold text-[#ea580c]">5</p>
                <p className="text-xs font-bold text-gray-500 uppercase">Borrowed</p>
              </div>
              <div className="px-4 py-2 bg-green-50 rounded border border-green-100">
                <p className="text-2xl font-bold text-green-700">850</p>
                <p className="text-xs font-bold text-gray-500 uppercase">Points</p>
              </div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Main Content: Book Browser */}
          <div className="lg:col-span-3 space-y-8">
            
            {/* Search & Filter Bar */}
            <div className="bg-white p-4 rounded shadow-sm border border-gray-200 flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <Input 
                  placeholder="Search by Title, Author, or Category..." 
                  className="pl-10 border-gray-300 focus-visible:ring-[#1e3a8a]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button className="bg-[#1e3a8a] hover:bg-[#172554]">Search Library</Button>
            </div>

            {/* Tabs for Categories */}
            <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Book className="h-5 w-5 text-[#f97316]" /> Library Catalog
                </h2>
                <TabsList className="hidden md:flex bg-gray-100">
                  <TabsTrigger value="all" className="data-[state=active]:bg-[#1e3a8a] data-[state=active]:text-white">All Books</TabsTrigger>
                  <TabsTrigger value="ncert" className="data-[state=active]:bg-[#1e3a8a] data-[state=active]:text-white">NCERT</TabsTrigger>
                  <TabsTrigger value="competitive" className="data-[state=active]:bg-[#1e3a8a] data-[state=active]:text-white">Competitive</TabsTrigger>
                  <TabsTrigger value="history" className="data-[state=active]:bg-[#1e3a8a] data-[state=active]:text-white">History</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="all" className="mt-0">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {filteredBooks.map((book) => (
                    <div key={book.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-all group flex flex-col">
                      <div className="relative aspect-[2/3] overflow-hidden bg-gray-100">
                        <img src={book.cover} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute top-2 right-2">
                           <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full bg-white/90 hover:bg-white shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                             <Bookmark className="h-4 w-4 text-gray-600" />
                           </Button>
                        </div>
                      </div>
                      <div className="p-4 flex flex-col flex-1">
                        <div className="mb-2">
                          <span className="text-[10px] font-bold uppercase text-[#f97316] tracking-wider">{book.category}</span>
                          <h3 className="font-bold text-gray-900 leading-tight line-clamp-2 mt-1" title={book.title}>{book.title}</h3>
                          <p className="text-xs text-gray-500 mt-1">{book.author}</p>
                        </div>
                        
                        {book.progress > 0 ? (
                          <div className="mt-auto">
                            <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                              <span>Progress</span>
                              <span>{book.progress}%</span>
                            </div>
                            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div className="h-full bg-green-500" style={{ width: `${book.progress}%` }}></div>
                            </div>
                            <Button size="sm" className="w-full mt-3 bg-[#1e3a8a] hover:bg-[#172554] text-xs h-8">Resume Reading</Button>
                          </div>
                        ) : (
                           <div className="mt-auto flex gap-2">
                             <Button size="sm" variant="outline" className="flex-1 text-xs h-8 border-gray-300">Preview</Button>
                             <Button size="sm" className="flex-1 bg-gray-900 text-white hover:bg-black text-xs h-8">Read</Button>
                           </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
              
              {/* Placeholder for other tabs */}
              <TabsContent value="ncert" className="text-center py-12 text-gray-500">Filtering by NCERT...</TabsContent>
              <TabsContent value="competitive" className="text-center py-12 text-gray-500">Filtering by Competitive Exams...</TabsContent>
              <TabsContent value="history" className="text-center py-12 text-gray-500">Filtering by History...</TabsContent>
            </Tabs>
          </div>

          {/* Right Sidebar: Quick Actions & History */}
          <div className="space-y-6">
            
            {/* Reading History */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
               <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                 <History className="h-4 w-4 text-gray-500" /> Recent Activity
               </h3>
               <div className="space-y-4">
                 {[1, 2].map((i) => (
                   <div key={i} className="flex gap-3 pb-3 border-b border-gray-100 last:border-0">
                     <div className="h-12 w-8 bg-gray-200 rounded flex-shrink-0">
                       <img src={BOOKS[i-1].cover} className="h-full w-full object-cover rounded" />
                     </div>
                     <div>
                       <p className="text-xs font-bold text-gray-800 line-clamp-1">{BOOKS[i-1].title}</p>
                       <p className="text-[10px] text-gray-500">Accessed 2 hours ago</p>
                       <span className="text-[10px] text-green-600 font-medium">Continued Reading</span>
                     </div>
                   </div>
                 ))}
               </div>
               <Button variant="ghost" className="w-full text-xs text-[#1e3a8a] mt-2 h-8">View Full History</Button>
            </div>

            {/* Quick Links */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
               <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                 <Award className="h-4 w-4 text-gray-500" /> Quick Links
               </h3>
               <div className="space-y-2">
                 <Button variant="outline" className="w-full justify-start text-xs h-9 border-gray-200">
                   <Download className="h-3 w-3 mr-2 text-gray-400" /> Downloads
                 </Button>
                 <Button variant="outline" className="w-full justify-start text-xs h-9 border-gray-200">
                   <Bookmark className="h-3 w-3 mr-2 text-gray-400" /> My Bookmarks
                 </Button>
                 <Button variant="outline" className="w-full justify-start text-xs h-9 border-gray-200">
                   <User className="h-3 w-3 mr-2 text-gray-400" /> Edit Profile
                 </Button>
               </div>
            </div>

            {/* Banner */}
            <div className="bg-gradient-to-br from-[#f97316] to-[#ea580c] rounded-lg p-6 text-white text-center">
              <h4 className="font-bold mb-2">Exam Prep 2025</h4>
              <p className="text-xs opacity-90 mb-4">New question banks for MPSC available now.</p>
              <Button size="sm" className="bg-white text-[#ea580c] hover:bg-gray-100 w-full text-xs font-bold">Explore Now</Button>
            </div>

          </div>

        </div>
      </main>
    </div>
  );
}
