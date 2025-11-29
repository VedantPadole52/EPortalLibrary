
import Header from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Book, Clock, Star, ArrowRight, Download, Eye } from "lucide-react";
import book1 from "@assets/generated_images/history_book_cover.png";
import book2 from "@assets/generated_images/mathematics_book_cover.png";
import book3 from "@assets/generated_images/science_book_cover.png";

// Mock Data for Dashboard
const RECENTLY_READ = [
  { id: 1, title: "Indian History Vol. 1", cover: book1, progress: 75 },
  { id: 2, title: "Advanced Calculus", cover: book2, progress: 30 },
];

const RECOMMENDED = [
  { id: 3, title: "Environmental Science", cover: book3, category: "Science" },
  { id: 4, title: "Modern Polity", cover: book1, category: "Polity" }, // Reusing image for mock
  { id: 5, title: "General Knowledge 2024", cover: book2, category: "GK" }, // Reusing image for mock
  { id: 6, title: "Physics for Engineers", cover: book3, category: "Engineering" }, // Reusing image for mock
];

export default function CitizenDashboard() {
  return (
    <div className="min-h-screen bg-secondary/30 pb-20">
      <Header variant="citizen" />
      
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
          <h1 className="text-3xl font-bold text-primary">Hello, Rahul 👋</h1>
          <p className="text-muted-foreground">Here is your reading activity for today.</p>
        </div>

        {/* Continue Reading Carousel */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Clock className="h-5 w-5 text-accent" /> Continue Reading
            </h2>
            <Button variant="link" className="text-primary">View History</Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {RECENTLY_READ.map((book) => (
              <Card key={book.id} className="overflow-hidden border-none shadow-md hover:shadow-lg transition-shadow group">
                <div className="flex h-32">
                  <img src={book.cover} alt={book.title} className="w-24 object-cover" />
                  <div className="flex-1 p-4 flex flex-col justify-between bg-white">
                    <div>
                      <h3 className="font-bold text-primary line-clamp-1">{book.title}</h3>
                      <p className="text-xs text-muted-foreground mb-2">Last read: 2 hours ago</p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Progress</span>
                        <span>{book.progress}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-accent transition-all duration-1000 ease-out" 
                          style={{ width: `${book.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-center w-12 bg-primary/5 group-hover:bg-primary/10 transition-colors cursor-pointer border-l border-gray-100">
                     <ArrowRight className="h-5 w-5 text-primary" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Browse Books */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Book className="h-5 w-5 text-blue-500" /> Recommended For You
            </h2>
            <div className="flex gap-2">
               <Badge variant="outline" className="cursor-pointer bg-white hover:bg-gray-50">All</Badge>
               <Badge variant="outline" className="cursor-pointer bg-white hover:bg-gray-50">Science</Badge>
               <Badge variant="outline" className="cursor-pointer bg-white hover:bg-gray-50">History</Badge>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {RECOMMENDED.map((book) => (
              <div key={book.id} className="group flex flex-col gap-3 animate-in fade-in zoom-in duration-500">
                <div className="relative aspect-[2/3] rounded-lg overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.12)] group-hover:shadow-[0_20px_40px_rgb(0,0,0,0.2)] transition-all duration-300 group-hover:-translate-y-1">
                  <img src={book.cover} alt={book.title} className="object-cover w-full h-full" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3 p-4">
                    <Button size="sm" className="w-full bg-white text-primary hover:bg-gray-100">
                      <Eye className="h-4 w-4 mr-2" /> Read Now
                    </Button>
                    <Button size="sm" variant="outline" className="w-full border-white text-white hover:bg-white/20">
                      <Download className="h-4 w-4 mr-2" /> Download
                    </Button>
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 line-clamp-1 leading-tight">{book.title}</h3>
                  <p className="text-xs text-gray-500 mt-1">{book.category}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>
    </div>
  );
}
