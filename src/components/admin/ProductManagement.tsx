import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Package, 
  Search,
  Eye,
  EyeOff
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  original_price: number | null;
  category: string;
  image_url: string | null;
  is_new: boolean;
  is_on_sale: boolean;
  colors: string[] | null;
  sizes: string[] | null;
  stock_quantity: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const ProductManagement = () => {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    price: "",
    original_price: "",
    category: "",
    image_url: "",
    is_new: false,
    is_on_sale: false,
    colors: [] as string[],
    sizes: [] as string[],
    stock_quantity: "",
  });

  const categories = [
    "Knitwear", "Basics", "Outerwear", "Bottoms", "Accessories", "Dresses"
  ];

  const predefinedColors = [
    "#ffffff", "#000000", "#f5f5f5", "#2c2c2c", "#8b7355", 
    "#7c8471", "#d4c4a0", "#f4f1e8", "#4a4a4a"
  ];

  const predefinedSizes = [
    "XS", "S", "M", "L", "XL", "XXL", "One Size"
  ];

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast({
        title: "Error",
        description: "Failed to load products.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (priceInCents: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(priceInCents / 100);
  };

  const resetForm = () => {
    setProductForm({
      name: "",
      description: "",
      price: "",
      original_price: "",
      category: "",
      image_url: "",
      is_new: false,
      is_on_sale: false,
      colors: [],
      sizes: [],
      stock_quantity: "",
    });
  };

  const handleAddProduct = async () => {
    try {
      const { error } = await supabase
        .from("products")
        .insert({
          name: productForm.name,
          description: productForm.description || null,
          price: parseFloat(productForm.price) * 100, // Convert to paise
          original_price: productForm.original_price ? parseFloat(productForm.original_price) * 100 : null,
          category: productForm.category,
          image_url: productForm.image_url || null,
          is_new: productForm.is_new,
          is_on_sale: productForm.is_on_sale,
          colors: productForm.colors.length > 0 ? productForm.colors : null,
          sizes: productForm.sizes.length > 0 ? productForm.sizes : null,
          stock_quantity: parseInt(productForm.stock_quantity) || 0,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Product added successfully.",
      });

      setIsAddDialogOpen(false);
      resetForm();
      fetchProducts();
    } catch (error) {
      console.error("Error adding product:", error);
      toast({
        title: "Error",
        description: "Failed to add product.",
        variant: "destructive",
      });
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      description: product.description || "",
      price: (product.price / 100).toString(),
      original_price: product.original_price ? (product.original_price / 100).toString() : "",
      category: product.category,
      image_url: product.image_url || "",
      is_new: product.is_new,
      is_on_sale: product.is_on_sale,
      colors: product.colors || [],
      sizes: product.sizes || [],
      stock_quantity: product.stock_quantity.toString(),
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateProduct = async () => {
    if (!editingProduct) return;

    try {
      const { error } = await supabase
        .from("products")
        .update({
          name: productForm.name,
          description: productForm.description || null,
          price: parseFloat(productForm.price) * 100,
          original_price: productForm.original_price ? parseFloat(productForm.original_price) * 100 : null,
          category: productForm.category,
          image_url: productForm.image_url || null,
          is_new: productForm.is_new,
          is_on_sale: productForm.is_on_sale,
          colors: productForm.colors.length > 0 ? productForm.colors : null,
          sizes: productForm.sizes.length > 0 ? productForm.sizes : null,
          stock_quantity: parseInt(productForm.stock_quantity) || 0,
        })
        .eq("id", editingProduct.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Product updated successfully.",
      });

      setIsEditDialogOpen(false);
      setEditingProduct(null);
      resetForm();
      fetchProducts();
    } catch (error) {
      console.error("Error updating product:", error);
      toast({
        title: "Error",
        description: "Failed to update product.",
        variant: "destructive",
      });
    }
  };

  const handleToggleActive = async (productId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("products")
        .update({ is_active: !currentStatus })
        .eq("id", productId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Product ${!currentStatus ? 'activated' : 'deactivated'} successfully.`,
      });

      fetchProducts();
    } catch (error) {
      console.error("Error toggling product status:", error);
      toast({
        title: "Error",
        description: "Failed to update product status.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", productId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Product deleted successfully.",
      });

      fetchProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
      toast({
        title: "Error",
        description: "Failed to delete product.",
        variant: "destructive",
      });
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const ProductDialog = ({ isOpen, onOpenChange, onSubmit, title }: {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: () => void;
    title: string;
  }) => (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Fill in the product details below.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Product Name</Label>
            <Input
              id="name"
              value={productForm.name}
              onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
              placeholder="Enter product name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select 
              value={productForm.category} 
              onValueChange={(value) => setProductForm({ ...productForm, category: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Price (₹)</Label>
            <Input
              id="price"
              type="number"
              value={productForm.price}
              onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
              placeholder="0.00"
              step="0.01"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="original_price">Original Price (₹)</Label>
            <Input
              id="original_price"
              type="number"
              value={productForm.original_price}
              onChange={(e) => setProductForm({ ...productForm, original_price: e.target.value })}
              placeholder="0.00"
              step="0.01"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="stock_quantity">Stock Quantity</Label>
            <Input
              id="stock_quantity"
              type="number"
              value={productForm.stock_quantity}
              onChange={(e) => setProductForm({ ...productForm, stock_quantity: e.target.value })}
              placeholder="0"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image_url">Image URL</Label>
            <Input
              id="image_url"
              value={productForm.image_url}
              onChange={(e) => setProductForm({ ...productForm, image_url: e.target.value })}
              placeholder="https://example.com/image.jpg"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={productForm.description}
            onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
            placeholder="Enter product description"
            rows={3}
          />
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_new"
              checked={productForm.is_new}
              onCheckedChange={(checked) => setProductForm({ ...productForm, is_new: checked as boolean })}
            />
            <Label htmlFor="is_new">New Product</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_on_sale"
              checked={productForm.is_on_sale}
              onCheckedChange={(checked) => setProductForm({ ...productForm, is_on_sale: checked as boolean })}
            />
            <Label htmlFor="is_on_sale">On Sale</Label>
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSubmit}>
            {title.includes("Add") ? "Add Product" : "Update Product"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Product Management</h2>
          <p className="text-muted-foreground">Manage your product catalog</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Product
            </Button>
          </DialogTrigger>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-4 w-3/4 bg-muted rounded mb-2"></div>
                <div className="h-3 w-1/2 bg-muted rounded mb-4"></div>
                <div className="h-6 w-1/4 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <Card key={product.id} className={!product.is_active ? "opacity-60" : ""}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground line-clamp-1">{product.name}</h3>
                    <p className="text-sm text-muted-foreground">{product.category}</p>
                  </div>
                  <div className="flex items-center gap-1 ml-2">
                    {product.is_new && <Badge variant="default" className="text-xs">New</Badge>}
                    {product.is_on_sale && <Badge variant="destructive" className="text-xs">Sale</Badge>}
                    {!product.is_active && <Badge variant="secondary" className="text-xs">Inactive</Badge>}
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <span className="font-bold text-foreground">{formatPrice(product.price)}</span>
                  {product.original_price && (
                    <span className="text-sm text-muted-foreground line-through">
                      {formatPrice(product.original_price)}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Stock: {product.stock_quantity}</span>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleToggleActive(product.id, product.is_active)}
                      className="h-8 w-8"
                    >
                      {product.is_active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleEditProduct(product)}
                      className="h-8 w-8"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleDeleteProduct(product.id)}
                    className="h-8 w-8 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Product Dialog */}
      <ProductDialog
        isOpen={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSubmit={handleAddProduct}
        title="Add New Product"
      />

      {/* Edit Product Dialog */}
      <ProductDialog
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSubmit={handleUpdateProduct}
        title="Edit Product"
      />
    </div>
  );
};

export default ProductManagement;