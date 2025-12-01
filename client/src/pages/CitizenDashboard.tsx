
import { useState, useEffect, useRef } from "react";
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
  MoreHorizontal,
  User,
  ArrowRight,
  BookOpen as BookOpenIcon
} from "lucide-react";
import PDFViewer from "@/components/PDFViewer";
import { authApi, booksApi, categoriesApi, type Book as BookType, type User as UserType, type UserStats, type Category } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

// No fallback covers - only real uploaded data from admin

export default function CitizenDashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [books, setBooks] = useState<BookType[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [user, setUser] = useState<UserType | null>(null);
  const [stats, setStats] = useState<UserStats>({ booksRead: 0, borrowed: 0, points: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [bookmarks, setBookmarks] = useState<Set<number>>(new Set());
  const [selectedBook, setSelectedBook] = useState<BookType | null>(null);
  const [showPDFViewer, setShowPDFViewer] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalBooks, setTotalBooks] = useState(0);
  const [pageSize] = useState(20);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Track session on dashboard load
    fetch("/api/auth/track-session", { method: "POST" }).catch(() => {});
    
    loadData();
    loadBookmarks();
    
    // Load notifications
    fetch("/api/notifications").then(r => r.json()).then(d => setNotifications(d.notifications || [])).catch(() => {});
    
    // Refresh books every 2 seconds to show new admin-added books and real-time cover updates
    const interval = setInterval(() => {
      // If there's an active search, refresh with search filter
      if (searchQuery.trim()) {
        handleSearch(currentPage, searchQuery);
      } else {
        loadData(currentPage);
      }
      loadBookmarks();
    }, 2000);
    
    return () => clearInterval(interval);
  }, [searchQuery, currentPage]);

  const loadBookmarks = async () => {
    try {
      const response = await fetch("/api/user/wishlist");
      if (response.ok) {
        const data = await response.json();
        setBookmarks(new Set(data.bookIds || []));
      }
    } catch (error) {
      console.log("Failed to load bookmarks");
    }
  };

  const toggleBookmark = async (bookId: number) => {
    try {
      const response = await fetch(`/api/reading-history/bookmark/${bookId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });

      if (response.ok) {
        const newBookmarks = new Set(bookmarks);
        if (newBookmarks.has(bookId)) {
          newBookmarks.delete(bookId);
          toast({
            title: "Removed from wishlist",
            description: "Book removed from your reading list"
          });
        } else {
          newBookmarks.add(bookId);
          toast({
            title: "Added to wishlist",
            description: "Book added to your reading list"
          });
        }
        setBookmarks(newBookmarks);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update bookmark"
      });
    }
  };

  const openPDFViewer = (book: BookType) => {
    if (!book.pdfUrl) {
      toast({
        variant: "destructive",
        title: "PDF Not Available",
        description: "This book doesn't have a PDF file attached yet."
      });
      return;
    }
    setSelectedBook(book);
    setShowPDFViewer(true);
  };

  const downloadBook = async (book: BookType) => {
    if (!book.pdfUrl) {
      toast({
        variant: "destructive",
        title: "Download Failed",
        description: "This book doesn't have a PDF file available."
      });
      return;
    }

    try {
      // Create a link element and trigger download
      const link = document.createElement("a");
      link.href = book.pdfUrl;
      link.download = `${book.title.replace(/\s+/g, "_")}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Download Started",
        description: `"${book.title}" is being downloaded for offline reading.`
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Download Error",
        description: "Failed to download the book. Please try again."
      });
    }
  };

  const loadData = async (page: number = 1) => {
    try {
      const [userData, booksData, categoriesData] = await Promise.all([
        authApi.getCurrentUser(),
        booksApi.getAll(undefined, page, pageSize),
        categoriesApi.getAll(),
      ]);
      
      setUser(userData.user);
      setStats(userData.stats);
      setBooks(booksData.books);
      setTotalBooks(booksData.total);
      setCurrentPage(page);
      setCategories(categoriesData.categories);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to load data. Please login again.",
      });
      setLocation("/login");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (page: number = 1, query?: string) => {
    const searchTerm = query ?? searchQuery;
    if (!searchTerm.trim()) {
      loadData(page);
      return;
    }
    
    try {
      const data = await booksApi.getAll(searchTerm, page, pageSize);
      setBooks(data.books);
      setTotalBooks(data.total);
      setCurrentPage(page);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Search Failed",
        description: error.message,
      });
    }
  };

  const handleSearchInput = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
    
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Debounce search - trigger after 500ms of user inactivity
    searchTimeoutRef.current = setTimeout(() => {
      if (value.trim().length > 0) {
        handleSearch(1, value);
      } else {
        loadData(1);
      }
    }, 500);
  };

  const getBookCoverImage = (book: any) => {
    if (book.coverUrl) {
      // Decode HTML entities in URL
      let url = book.coverUrl
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");
      
      // For uploaded PDFs showing as covers
      if (url.includes('.pdf')) {
        return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='300'%3E%3Crect fill='%23dc2626' width='200' height='300'/%3E%3Ctext x='50%25' y='45%25' font-size='16' fill='white' text-anchor='middle'%3EPDF%3C/text%3E%3Ctext x='50%25' y='55%25' font-size='12' fill='white' text-anchor='middle'%3E" + encodeURIComponent(book.title.substring(0, 20)) + "%3C/text%3E%3C/svg%3E";
      }
      
      // Generate cache buster from updatedAt timestamp (changes when book is updated)
      const cacheBuster = book.updatedAt ? new Date(book.updatedAt).getTime() : book.id;
      
      // For HTTP/HTTPS external URLs (Google Books, Bing, etc)
      if (url.startsWith("http")) {
        return url + (url.includes('?') ? '&' : '?') + `v=${cacheBuster}`;
      }
      // For local uploads
      if (url.startsWith("/uploads")) {
        return url + `?v=${cacheBuster}`;
      }
      // Any other URL format
      return url + `?v=${cacheBuster}`;
    }
    // Placeholder SVG if no cover URL
    return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='300'%3E%3Crect fill='%231e3a8a' width='200' height='300'/%3E%3Ctext x='50%25' y='50%25' font-size='18' fill='white' text-anchor='middle' dominant-baseline='middle'%3E" + encodeURIComponent(book.title.substring(0, 15)) + "%3C/text%3E%3C/svg%3E";
  };

  const filteredBooks = books.filter(book => {
    if (activeTab === "all") return true;
    if (activeTab.startsWith("cat-")) {
      const categoryId = parseInt(activeTab.split("-")[1]);
      return book.categoryId === categoryId;
    }
    return true;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50 font-sans">
        <Header variant="citizen" />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1e3a8a] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your library...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 font-sans">
      <Header variant="citizen" />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        
        {/* User Welcome & Stats */}
        <section className="mb-6 sm:mb-8">
          <div className="bg-white rounded-lg p-3 sm:p-6 shadow-sm border border-gray-200 flex flex-col gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="h-12 sm:h-16 w-12 sm:w-16 bg-[#1e3a8a] rounded-full flex items-center justify-center text-white text-lg sm:text-2xl font-bold shadow-md border-2 sm:border-4 border-white flex-shrink-0">
                {user?.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-2xl font-bold text-gray-800 truncate">Welcome, {user?.name.split(' ')[0]}!</h1>
                <p className="text-gray-500 text-xs sm:text-sm truncate">Citizen Member • {user?.email.split('@')[0]}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-2 sm:gap-4">
              <div className="px-2 sm:px-4 py-2 bg-blue-50 rounded border border-blue-100 text-center">
                <p className="text-lg sm:text-2xl font-bold text-[#1e3a8a]" data-testid="text-books-read">{stats.booksRead}</p>
                <p className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase">Books Read</p>
              </div>
              <div className="px-2 sm:px-4 py-2 bg-orange-50 rounded border border-orange-100 text-center">
                <p className="text-lg sm:text-2xl font-bold text-[#ea580c]" data-testid="text-borrowed">{stats.borrowed}</p>
                <p className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase">Borrowed</p>
              </div>
              <div className="px-2 sm:px-4 py-2 bg-green-50 rounded border border-green-100 text-center">
                <p className="text-lg sm:text-2xl font-bold text-green-700" data-testid="text-points">{stats.points}</p>
                <p className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase">Points</p>
              </div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Main Content: Book Browser */}
          <div className="lg:col-span-3 space-y-8">
            
            {/* Notifications Bar */}
            {notifications.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-blue-900 mb-2">📢 New Notifications ({notifications.length})</h3>
                    <div className="space-y-2">
                      {notifications.slice(0, 3).map((notif: any) => (
                        <div key={notif.id} className="text-sm text-blue-800">
                          <strong>{notif.title}:</strong> {notif.message}
                        </div>
                      ))}
                    </div>
                  </div>
                  <button onClick={() => setShowNotifications(false)} className="text-blue-600 hover:text-blue-900">✕</button>
                </div>
              </div>
            )}

            {/* Search & Filter Bar */}
            <div className="bg-white p-3 sm:p-4 rounded shadow-sm border border-gray-200 flex flex-col sm:flex-row gap-2 sm:gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <Input 
                  placeholder="Search books..." 
                  className="pl-10 text-sm border-gray-300 focus-visible:ring-[#1e3a8a] h-10 sm:h-auto"
                  value={searchQuery}
                  onChange={(e) => handleSearchInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch(1, searchQuery)}
                  data-testid="input-search"
                />
              </div>
              <Button 
                className="bg-[#1e3a8a] hover:bg-[#172554] text-sm h-10 sm:h-auto whitespace-nowrap"
                onClick={() => handleSearch(1)}
                data-testid="button-search"
              >
                <span className="hidden sm:inline">Search Library</span>
                <span className="sm:hidden">Search</span>
              </Button>
            </div>

            {/* Category Filter Bar */}
            {categories.length > 0 && (
              <div className="bg-white p-3 rounded shadow-sm border border-gray-200 flex gap-2 overflow-x-auto">
                <Button 
                  variant={activeTab === "all" ? "default" : "outline"}
                  onClick={() => setActiveTab("all")}
                  className={activeTab === "all" ? "bg-[#1e3a8a]" : ""}
                  size="sm"
                  data-testid="button-category-all"
                >
                  All Books
                </Button>
                {categories.map(cat => (
                  <Button 
                    key={cat.id}
                    variant={activeTab === `cat-${cat.id}` ? "default" : "outline"}
                    onClick={() => setActiveTab(`cat-${cat.id}`)}
                    className={activeTab === `cat-${cat.id}` ? "bg-[#1e3a8a]" : ""}
                    size="sm"
                    data-testid={`button-category-${cat.id}`}
                  >
                    {cat.name}
                  </Button>
                ))}
              </div>
            )}

            {/* Tabs for Categories */}
            <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Book className="h-5 w-5 text-[#f97316]" /> Library Catalog
                </h2>
              </div>

              <TabsContent value="all" className="mt-0">
                {filteredBooks.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Book className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No books found. Try a different search.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                    {filteredBooks.map((book) => (
                      <div key={book.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-all group flex flex-col" data-testid={`card-book-${book.id}`}>
                        <div className="relative aspect-[2/3] overflow-hidden bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center">
                          <img 
                            src={getBookCoverImage(book)} 
                            alt={book.title} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                            loading="lazy"
                            crossOrigin="anonymous"
                            onError={(e) => {
                              const img = e.target as HTMLImageElement;
                              // Fallback to styled placeholder showing book title
                              img.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='300'%3E%3Crect fill='%234f46e5' width='200' height='300'/%3E%3Crect fill='%23818cf8' width='200' height='200' y='50'/%3E%3Ctext x='100' y='150' font-size='14' fill='white' text-anchor='middle' dominant-baseline='middle' font-weight='bold'%3E" + encodeURIComponent(book.title.substring(0, 18)) + "%3C/text%3E%3C/svg%3E";
                            }}
                            data-testid={`img-book-cover-${book.id}`}
                          />
                          <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                             <Button 
                               size="icon" 
                               variant="secondary" 
                               className="h-8 w-8 rounded-full bg-white/90 hover:bg-white shadow-sm"
                               onClick={() => toggleBookmark(book.id)}
                               data-testid={`button-bookmark-${book.id}`}
                             >
                               <Bookmark className={`h-4 w-4 ${bookmarks.has(book.id) ? "fill-blue-500 text-blue-500" : "text-gray-600"}`} />
                             </Button>
                             <Button 
                               size="icon" 
                               variant="secondary" 
                               className="h-8 w-8 rounded-full bg-white/90 hover:bg-white shadow-sm"
                               onClick={() => openPDFViewer(book)}
                               data-testid={`button-read-book-${book.id}`}
                             >
                               <BookOpenIcon className="h-4 w-4 text-gray-600" />
                             </Button>
                          </div>
                        </div>
                        <div className="p-4 flex flex-col flex-1">
                          <div className="mb-2">
                            <h3 className="font-bold text-gray-900 leading-tight line-clamp-2" title={book.title}>{book.title}</h3>
                            <p className="text-xs text-gray-500 mt-1">{book.author}</p>
                          </div>
                          
                          <div className="mt-auto space-y-2">
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="flex-1 text-xs h-8 border-gray-300"
                                onClick={() => toggleBookmark(book.id)}
                                data-testid={`button-wishlist-${book.id}`}
                              >
                                {bookmarks.has(book.id) ? "✓ Saved" : "Save"}
                              </Button>
                              <Button 
                                size="sm" 
                                className="flex-1 bg-gray-900 text-white hover:bg-black text-xs h-8"
                                onClick={() => openPDFViewer(book)}
                                data-testid={`button-read-${book.id}`}
                              >
                                Read
                              </Button>
                            </div>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="w-full text-xs h-7 border-green-200 text-green-600 hover:bg-green-50"
                              onClick={() => downloadBook(book)}
                              data-testid={`button-download-${book.id}`}
                            >
                              ⬇️ Download for Offline
                            </Button>
                            {book.description && book.description.startsWith("Google Books:") && (
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="w-full text-xs h-7 text-blue-600 border-blue-200 hover:bg-blue-50"
                                onClick={() => {
                                  const link = book.description?.replace("Google Books: ", "") || "";
                                  if (link && link !== "N/A") window.open(link, "_blank");
                                }}
                                data-testid={`button-google-books-${book.id}`}
                              >
                                📖 Google Books
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
            
            {/* Pagination */}
            {totalBooks > pageSize && (
              <div className="flex items-center justify-center gap-1 sm:gap-2 mt-6 flex-wrap">
                <Button 
                  variant="outline" 
                  disabled={currentPage === 1}
                  onClick={() => {
                    const newPage = currentPage - 1;
                    if (searchQuery.trim()) {
                      handleSearch(newPage, searchQuery);
                    } else {
                      loadData(newPage);
                    }
                  }}
                  className="text-xs sm:text-sm h-9 sm:h-auto px-2 sm:px-4"
                  data-testid="button-prev-page"
                >
                  <span className="hidden sm:inline">Previous</span>
                  <span className="sm:hidden">Prev</span>
                </Button>
                <span className="text-xs sm:text-sm text-gray-600 px-1">
                  {currentPage}/{Math.ceil(totalBooks / pageSize)}
                </span>
                <Button 
                  variant="outline"
                  disabled={currentPage * pageSize >= totalBooks}
                  onClick={() => {
                    const newPage = currentPage + 1;
                    if (searchQuery.trim()) {
                      handleSearch(newPage, searchQuery);
                    } else {
                      loadData(newPage);
                    }
                  }}
                  className="text-xs sm:text-sm h-9 sm:h-auto px-2 sm:px-4"
                  data-testid="button-next-page"
                >
                  <span className="hidden sm:inline">Next</span>
                  <span className="sm:hidden">Next</span>
                </Button>
              </div>
            )}
          </div>

          {/* Right Sidebar - Hidden on mobile, shown on lg screens */}
          <div className="hidden lg:block space-y-6">
            
            {/* Reading History */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
               <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                 <History className="h-4 w-4 text-gray-500" /> Recent Activity
               </h3>
               <div className="text-center py-8 text-gray-400 text-sm">
                 <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                 <p>No recent activity</p>
               </div>
               <Button 
                 variant="outline" 
                 className="w-full mt-2 text-xs justify-center"
                 onClick={() => setLocation("/citizen/reading-history")}
                 data-testid="button-view-history"
               >
                 View Full History <ArrowRight className="h-3 w-3 ml-1" />
               </Button>
            </div>

            {/* Quick Links */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
               <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                 <Award className="h-4 w-4 text-gray-500" /> Quick Links
               </h3>
               <div className="space-y-2">
                 <Button 
                   variant="outline" 
                   className="w-full justify-start text-xs h-9 border-gray-200"
                   onClick={() => setLocation("/citizen/reading-history")}
                   data-testid="button-reading-history"
                 >
                   <History className="h-3 w-3 mr-2 text-gray-400" /> Reading History
                 </Button>
                 <Button 
                   variant="outline" 
                   className="w-full justify-start text-xs h-9 border-gray-200"
                   data-testid="button-my-bookmarks"
                 >
                   <Bookmark className="h-3 w-3 mr-2 text-gray-400" /> My Bookmarks ({bookmarks.size})
                 </Button>
                 <Button 
                   variant="outline" 
                   className="w-full justify-start text-xs h-9 border-gray-200"
                   onClick={() => setLocation("/profile")}
                   data-testid="button-edit-profile-link"
                 >
                   <User className="h-3 w-3 mr-2 text-gray-400" /> Edit Profile
                 </Button>
               </div>
            </div>

            {/* Banner */}
            <div className="bg-gradient-to-br from-[#f97316] to-[#ea580c] rounded-lg p-6 text-white text-center">
              <h4 className="font-bold mb-2">Exam Prep 2025</h4>
              <p className="text-xs opacity-90 mb-4">New question banks for MPSC & UPSC available now.</p>
              <Button 
                size="sm" 
                className="bg-white text-[#ea580c] hover:bg-gray-100 w-full text-xs font-bold"
                onClick={() => setLocation("/citizen/question-banks")}
                data-testid="button-explore-questions"
              >
                Explore Now
              </Button>
            </div>

          </div>

        </div>
      </main>

      {/* PDF Viewer Modal */}
      {showPDFViewer && selectedBook && (
        <PDFViewer
          title={selectedBook.title}
          author={selectedBook.author}
          bookId={selectedBook.id}
          pdfUrl={selectedBook.pdfUrl || undefined}
          onClose={() => setShowPDFViewer(false)}
        />
      )}

      <Footer />
    </div>
  );
}
