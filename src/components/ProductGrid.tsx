import ProductCard from "@/components/ProductCard";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, SlidersHorizontal, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import productSweater from "@/assets/product-sweater.jpg";
import productTee from "@/assets/product-tee.jpg";
import productBlazer from "@/assets/product-blazer.jpg";

// Demo products with India pricing (in INR) - Fallback when offline
const demoProducts = [
  {
    id: "1",
    name: "Minimalist Wool Sweater",
    price: 7199,
    originalPrice: 10399,
    image_url: productSweater,
    category: "Knitwear",
    description: "Premium wool sweater with minimalist design",
    is_new: true,
    is_on_sale: true,
    colors: ["#f5f5f5", "#2c2c2c", "#8b7355"],
    sizes: ["XS", "S", "M", "L", "XL"],
    stock_quantity: 25,
    is_active: true
  },
  {
    id: "2",
    name: "Organic Cotton Tee",
    price: 3199,
    image_url: productTee,
    category: "Basics",
    description: "Soft organic cotton t-shirt",
    is_new: false,
    is_on_sale: false,
    colors: ["#ffffff", "#000000", "#7c8471"],
    sizes: ["S", "M", "L", "XL"],
    stock_quantity: 50,
    is_active: true
  },
  {
    id: "3",
    name: "Tailored Linen Blazer",
    price: 11999,
    image_url: productBlazer,
    category: "Outerwear",
    description: "Professional linen blazer",
    is_new: true,
    is_on_sale: false,
    colors: ["#f4f1e8", "#2c2c2c"],
    sizes: ["XS", "S", "M", "L"],
    stock_quantity: 15,
    is_active: true
  },
  {
    id: "4",
    name: "Wide-Leg Trousers",
    price: 6399,
    originalPrice: 7999,
    image_url: productSweater,
    category: "Bottoms",
    description: "Comfortable wide-leg trousers",
    is_new: false,
    is_on_sale: true,
    colors: ["#2c2c2c", "#8b7355", "#4a4a4a"],
    sizes: ["XS", "S", "M", "L", "XL"],
    stock_quantity: 30,
    is_active: true
  },
  {
    id: "5",
    name: "Cashmere Scarf",
    price: 4799,
    image_url: productTee,
    category: "Accessories",
    description: "Luxurious cashmere scarf",
    is_new: false,
    is_on_sale: false,
    colors: ["#f5f5f5", "#7c8471", "#d4c4a0"],
    sizes: ["One Size"],
    stock_quantity: 20,
    is_active: true
  },
  {
    id: "6",
    name: "Silk Midi Dress",
    price: 13599,
    image_url: productBlazer,
    category: "Dresses",
    description: "Elegant silk midi dress",
    is_new: true,
    is_on_sale: false,
    colors: ["#2c2c2c", "#7c8471"],
    sizes: ["XS", "S", "M", "L"],
    stock_quantity: 12,
    is_active: true
  },
];

interface Product {
  id: string;
  name: string;
  price: number;
  original_price?: number;
  image_url?: string;
  category: string;
  description?: string;
  is_new?: boolean;
  is_on_sale?: boolean;
  colors?: string[];
  sizes?: string[];
  stock_quantity?: number;
  is_active?: boolean;
}

export default function ProductGrid() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("All");
  const [priceRange, setPriceRange] = useState([0, 20000]);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [onlyOnSale, setOnlyOnSale] = useState(false);

  // Fetch products from Supabase
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching products:', error);
          // Use demo products as fallback
          setProducts(demoProducts);
        } else {
          // Transform database products to match our interface
          const transformedProducts = data.map(product => ({
            ...product,
            image_url: product.image_url || productSweater,
            originalPrice: product.original_price,
            isNew: product.is_new,
            isOnSale: product.is_on_sale
          }));
          setProducts(transformedProducts);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        setProducts(demoProducts);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Get unique categories, colors, and sizes from products
  const allCategories = ["All", ...Array.from(new Set(products.map(p => p.category)))];
  const allColors = Array.from(new Set(products.flatMap(p => p.colors || [])));
  const allSizes = Array.from(new Set(products.flatMap(p => p.sizes || [])));

  // Filter and sort products
  const filteredProducts = products.filter(product => {
    // Search filter
    if (searchTerm && !product.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !product.description?.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    // Category filter
    if (category !== "All" && product.category !== category) return false;
    
    // Price range filter
    if (product.price < priceRange[0] || product.price > priceRange[1]) return false;
    
    // Color filter
    if (selectedColor && !(product.colors || []).includes(selectedColor)) return false;
    
    // Size filter
    if (selectedSize && !(product.sizes || []).includes(selectedSize)) return false;
    
    // Stock filter
    if (onlyInStock && (product.stock_quantity || 0) <= 0) return false;
    
    // Sale filter
    if (onlyOnSale && !product.is_on_sale) return false;
    
    return true;
  });

  // Sort filtered products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "price-asc":
        return a.price - b.price;
      case "price-desc":
        return b.price - a.price;
      case "name":
        return a.name.localeCompare(b.name);
      case "newest":
      default:
        return Number(b.id) - Number(a.id);
    }
  });

  if (loading) {
    return (
      <div className="py-16 bg-background">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="text-center mb-12">
            <div className="animate-pulse">
              <div className="h-6 bg-muted rounded w-32 mx-auto mb-4"></div>
              <div className="h-8 bg-muted rounded w-64 mx-auto mb-4"></div>
              <div className="h-4 bg-muted rounded w-96 mx-auto"></div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-muted rounded-lg h-64 mb-4"></div>
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4 lg:px-6">
        {/* Section Header */}
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4">
            Featured Products
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Our Collection
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Discover our carefully curated selection of contemporary pieces designed for effortless elegance.
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                onClick={() => setSearchTerm("")}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Filter Toggle */}
        <div className="mb-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Collapsible open={showFilters} onOpenChange={setShowFilters}>
              <CollapsibleTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4" />
                  Filters
                  {(category !== "All" || selectedColor || selectedSize || onlyInStock || onlyOnSale) && (
                    <Badge variant="secondary" className="ml-2">
                      {[
                        category !== "All" ? 1 : 0,
                        selectedColor ? 1 : 0,
                        selectedSize ? 1 : 0,
                        onlyInStock ? 1 : 0,
                        onlyOnSale ? 1 : 0
                      ].reduce((a, b) => a + b, 0)}
                    </Badge>
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <Card className="mt-4">
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {/* Category Filter */}
                      <div>
                        <label className="text-sm font-medium mb-3 block">Category</label>
                        <div className="flex flex-wrap gap-2">
                          {allCategories.map((cat) => (
                            <Button
                              key={cat}
                              variant={category === cat ? "default" : "outline"}
                              size="sm"
                              onClick={() => setCategory(cat)}
                            >
                              {cat}
                            </Button>
                          ))}
                        </div>
                      </div>

                      {/* Price Range */}
                      <div>
                        <label className="text-sm font-medium mb-3 block">
                          Price Range: ₹{priceRange[0].toLocaleString()} - ₹{priceRange[1].toLocaleString()}
                        </label>
                        <Slider
                          value={priceRange}
                          onValueChange={setPriceRange}
                          max={50000}
                          min={0}
                          step={100}
                          className="w-full"
                        />
                      </div>

                      {/* Color Filter */}
                      <div>
                        <label className="text-sm font-medium mb-3 block">Color</label>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            variant={!selectedColor ? "default" : "outline"}
                            size="sm"
                            onClick={() => setSelectedColor("")}
                          >
                            All
                          </Button>
                          {allColors.map((color) => (
                            <Button
                              key={color}
                              variant={selectedColor === color ? "default" : "outline"}
                              size="icon"
                              className="w-8 h-8 p-0 border-2"
                              onClick={() => setSelectedColor(color)}
                              title={color}
                            >
                              <div
                                className="w-4 h-4 rounded-full border border-gray-300"
                                style={{ backgroundColor: color }}
                              />
                            </Button>
                          ))}
                        </div>
                      </div>

                      {/* Size Filter */}
                      <div>
                        <label className="text-sm font-medium mb-3 block">Size</label>
                        <Select value={selectedSize} onValueChange={setSelectedSize}>
                          <SelectTrigger>
                            <SelectValue placeholder="All sizes" />
                          </SelectTrigger>
                          <SelectContent className="bg-background border border-border z-50">
                            <SelectItem value="">All sizes</SelectItem>
                            {allSizes.map((size) => (
                              <SelectItem key={size} value={size}>
                                {size}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Additional Filters */}
                      <div className="md:col-span-2 lg:col-span-4">
                        <label className="text-sm font-medium mb-3 block">Additional Filters</label>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            variant={onlyInStock ? "default" : "outline"}
                            size="sm"
                            onClick={() => setOnlyInStock(!onlyInStock)}
                          >
                            In Stock Only
                          </Button>
                          <Button
                            variant={onlyOnSale ? "default" : "outline"}
                            size="sm"
                            onClick={() => setOnlyOnSale(!onlyOnSale)}
                          >
                            On Sale Only
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </CollapsibleContent>
            </Collapsible>
          </div>

          {/* Sort Options */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Sort by:</span>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-background border border-border z-50">
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="price-asc">Price: Low to High</SelectItem>
                <SelectItem value="price-desc">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results Summary */}
        <div className="mb-6 flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            Showing {sortedProducts.length} of {products.length} products
          </p>
          {(category !== "All" || selectedColor || selectedSize || onlyInStock || onlyOnSale || searchTerm) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setCategory("All");
                setSelectedColor("");
                setSelectedSize("");
                setOnlyInStock(false);
                setOnlyOnSale(false);
                setSearchTerm("");
                setPriceRange([0, 20000]);
              }}
            >
              Clear all filters
            </Button>
          )}
        </div>

        {/* Product Grid */}
        {sortedProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
            {sortedProducts.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                price={product.price}
                originalPrice={product.original_price}
                image={product.image_url || productSweater}
                category={product.category}
                isNew={product.is_new}
                isOnSale={product.is_on_sale}
                colors={product.colors}
                sizes={product.sizes}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-muted-foreground mb-4">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No products found</p>
              <p className="text-sm">Try adjusting your filters or search terms</p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}