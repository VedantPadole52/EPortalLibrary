
import { useState, useEffect } from "react";
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  BookOpen, 
  Trash2, 
  Edit2, 
  Plus, 
  Search,
  X,
  FileUp,
  File,
  Settings
} from "lucide-react";
import { booksApi, type Book } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

export default function AdminBookManager() {
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddingBook, setIsAddingBook] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    isbn: "",
    pages: "",
    language: "English",
    subcategory: "",
    coverUrl: "",
    googleBooksLink: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    try {
      const data = await booksApi.getAll();
      setBooks(data.books);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to load books",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredBooks = books.filter(book =>
    book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book.isbn?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    
    try {
      let pdfUrl = "";

      // Upload PDF if provided
      if (pdfFile) {
        const formDataUpload = new FormData();
        formDataUpload.append("file", pdfFile);
        
        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: formDataUpload,
        });

        if (!uploadResponse.ok) {
          throw new Error("Failed to upload PDF");
        }

        const uploadData = await uploadResponse.json();
        pdfUrl = uploadData.fileUrl || "";
      }

      const newBook = await booksApi.create({
        ...formData,
        pages: formData.pages ? parseInt(formData.pages) : null,
        categoryId: 1,
        description: `Google Books: ${formData.googleBooksLink || 'N/A'}`,
        coverUrl: formData.coverUrl,
        pdfUrl: pdfUrl,
        publishYear: new Date().getFullYear(),
      });

      toast({
        title: "Success",
        description: "Book added successfully",
      });

      setBooks([...books, newBook.book]);
      setFormData({
        title: "",
        author: "",
        isbn: "",
        pages: "",
        language: "English",
        subcategory: "",
        coverUrl: "",
        googleBooksLink: "",
      });
      setPdfFile(null);
      setIsAddingBook(false);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to add book",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteBook = async (id: number) => {
    if (!confirm("Are you sure you want to delete this book?")) return;

    try {
      await booksApi.delete(id);
      setBooks(books.filter(b => b.id !== id));
      toast({
        title: "Success",
        description: "Book deleted successfully",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to delete book",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header variant="admin" />

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-64 bg-primary text-white hidden md:block p-4">
          <div className="mb-8 px-2">
             <h2 className="text-xs uppercase tracking-wider text-white/50 font-bold mb-2">Main Menu</h2>
             <nav className="space-y-1">
               <Button 
                 variant="secondary" 
                 className="w-full justify-start bg-white/10 text-white hover:bg-white/20 border-none"
               >
                 <BookOpen className="mr-2 h-4 w-4" /> Book Manager
               </Button>
               <Button 
                 variant="ghost" 
                 className="w-full justify-start text-white/70 hover:text-white hover:bg-white/10"
                 onClick={() => setLocation("/admin/dashboard")}
               >
                 <BookOpen className="mr-2 h-4 w-4" /> Back to Dashboard
               </Button>
             </nav>
          </div>
          <div className="px-2">
             <h2 className="text-xs uppercase tracking-wider text-white/50 font-bold mb-2">System</h2>
             <nav className="space-y-1">
               <Button 
                 variant="ghost" 
                 className="w-full justify-start text-white/70 hover:text-white hover:bg-white/10"
                 onClick={() => setLocation("/admin/settings")}
                 data-testid="button-settings-sidebar"
               >
                 <Settings className="mr-2 h-4 w-4" /> Settings
               </Button>
             </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          
          <div className="flex items-center justify-between mb-6">
             <div>
               <h1 className="text-2xl font-bold text-gray-800">Book Manager</h1>
               <p className="text-sm text-muted-foreground">Manage digital library catalog</p>
             </div>
             <Button 
               onClick={() => setIsAddingBook(!isAddingBook)}
               className="bg-primary"
               data-testid="button-add-book"
             >
               <Plus className="mr-2 h-4 w-4" /> Add Book
             </Button>
          </div>

          {/* Add Book Form */}
          {isAddingBook && (
            <Card className="mb-6 border-blue-200 bg-blue-50">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">Add New Book</CardTitle>
                  <button onClick={() => setIsAddingBook(false)}>
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddBook} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="title">Book Title</Label>
                      <Input
                        id="title"
                        placeholder="Enter book title"
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        required
                        data-testid="input-book-title"
                      />
                    </div>
                    <div>
                      <Label htmlFor="author">Author</Label>
                      <Input
                        id="author"
                        placeholder="Enter author name"
                        value={formData.author}
                        onChange={(e) => setFormData({...formData, author: e.target.value})}
                        required
                        data-testid="input-book-author"
                      />
                    </div>
                    <div>
                      <Label htmlFor="isbn">ISBN</Label>
                      <Input
                        id="isbn"
                        placeholder="Enter ISBN"
                        value={formData.isbn}
                        onChange={(e) => setFormData({...formData, isbn: e.target.value})}
                        data-testid="input-book-isbn"
                      />
                    </div>
                    <div>
                      <Label htmlFor="pages">Pages</Label>
                      <Input
                        id="pages"
                        type="number"
                        placeholder="Enter number of pages"
                        value={formData.pages}
                        onChange={(e) => setFormData({...formData, pages: e.target.value})}
                        data-testid="input-book-pages"
                      />
                    </div>
                    <div>
                      <Label htmlFor="subcategory">Subcategory</Label>
                      <Input
                        id="subcategory"
                        placeholder="E.g., History, Science"
                        value={formData.subcategory}
                        onChange={(e) => setFormData({...formData, subcategory: e.target.value})}
                        data-testid="input-book-subcategory"
                      />
                    </div>
                    <div>
                      <Label htmlFor="language">Language</Label>
                      <Input
                        id="language"
                        placeholder="Enter language"
                        value={formData.language}
                        onChange={(e) => setFormData({...formData, language: e.target.value})}
                        data-testid="input-book-language"
                      />
                    </div>
                    <div>
                      <Label htmlFor="coverUrl">Book Cover URL</Label>
                      <Input
                        id="coverUrl"
                        placeholder="https://example.com/cover.jpg"
                        value={formData.coverUrl}
                        onChange={(e) => setFormData({...formData, coverUrl: e.target.value})}
                        data-testid="input-book-cover-url"
                      />
                    </div>
                    <div>
                      <Label htmlFor="googleBooksLink">Google Books Link</Label>
                      <Input
                        id="googleBooksLink"
                        placeholder="https://books.google.com/..."
                        value={formData.googleBooksLink}
                        onChange={(e) => setFormData({...formData, googleBooksLink: e.target.value})}
                        data-testid="input-google-books-link"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="pdf-file" className="flex items-center gap-2 cursor-pointer">
                        <FileUp className="h-4 w-4" />
                        Upload PDF File
                      </Label>
                      <Input
                        id="pdf-file"
                        type="file"
                        accept=".pdf"
                        onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                        data-testid="input-pdf-file"
                        className="mt-2"
                      />
                      {pdfFile && (
                        <div className="flex items-center gap-2 mt-2 p-2 bg-green-50 rounded border border-green-200">
                          <File className="h-4 w-4 text-green-600" />
                          <span className="text-sm text-green-700">{pdfFile.name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsAddingBook(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" className="bg-primary" disabled={uploading} data-testid="button-save-book">
                      {uploading ? "Uploading..." : "Save Book"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Search Bar */}
          <div className="mb-6 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by title, author, or ISBN..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-search-books"
              />
            </div>
          </div>

          {/* Books Table */}
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-600">Loading books...</p>
            </div>
          ) : filteredBooks.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No books found</p>
              </CardContent>
            </Card>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Author</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">ISBN</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredBooks.map((book) => (
                    <tr key={book.id} className="hover:bg-gray-50" data-testid={`row-book-${book.id}`}>
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">{book.title}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{book.author}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{book.isbn || "-"}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{book.subcategory || "-"}</td>
                      <td className="px-6 py-4 text-sm flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-blue-600 border-blue-200 hover:bg-blue-50"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 border-red-200 hover:bg-red-50"
                          onClick={() => handleDeleteBook(book.id)}
                          data-testid={`button-delete-book-${book.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Footer Stats */}
          <div className="mt-6 flex gap-4">
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Total Books</p>
                <p className="text-2xl font-bold text-primary">{books.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Showing</p>
                <p className="text-2xl font-bold text-gray-800">{filteredBooks.length}</p>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
