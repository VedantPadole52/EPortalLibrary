import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tag, Trash2, Plus, ArrowLeft } from "lucide-react";
import { categoriesApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function AdminCategories() {
  const [categories, setCategories] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await categoriesApi.getAll();
      setCategories(data.categories || []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to load categories",
      });
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Category name is required",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description: description || null }),
      });

      if (!response.ok) {
        throw new Error("Failed to create category");
      }

      const data = await response.json();
      setCategories([...categories, data.category]);
      setName("");
      setDescription("");
      toast({
        title: "Success",
        description: "Category created successfully",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to create category",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCategory = async (id: number) => {
    try {
      const response = await fetch(`/api/categories/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete");
      setCategories(categories.filter(c => c.id !== id));
      toast({
        title: "Success",
        description: "Category deleted successfully",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header variant="admin" />

      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLocation("/admin/dashboard")}
            data-testid="button-back"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <Tag className="h-8 w-8 text-[#0A346F]" /> Category Management
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Create Category Form */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" /> New Category
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddCategory} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Category Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Science"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    data-testid="input-category-name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Category description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    data-testid="input-category-description"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-[#008C45] hover:bg-[#007035]"
                  disabled={isLoading}
                  data-testid="button-add-category"
                >
                  {isLoading ? "Creating..." : "Create Category"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Categories List */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>All Categories ({categories.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {categories.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No categories yet</div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {categories.map((category) => (
                    <div
                      key={category.id}
                      className="flex items-start justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300"
                      data-testid={`card-category-${category.id}`}
                    >
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800">{category.name}</h3>
                        {category.description && (
                          <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteCategory(category.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        data-testid={`button-delete-category-${category.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
