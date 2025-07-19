import ProductCard from "@/components/ProductCard";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import productSweater from "@/assets/product-sweater.jpg";
import productTee from "@/assets/product-tee.jpg";
import productBlazer from "@/assets/product-blazer.jpg";

// Demo products with generated images
const demoProducts = [
  {
    id: "1",
    name: "Minimalist Wool Sweater",
    price: 89.99,
    originalPrice: 129.99,
    image: productSweater,
    category: "Knitwear",
    isNew: true,
    isOnSale: true,
    colors: ["#f5f5f5", "#2c2c2c", "#8b7355"],
    sizes: ["XS", "S", "M", "L", "XL"],
  },
  {
    id: "2",
    name: "Organic Cotton Tee",
    price: 39.99,
    image: productTee,
    category: "Basics",
    isNew: false,
    colors: ["#ffffff", "#000000", "#7c8471"],
    sizes: ["S", "M", "L", "XL"],
  },
  {
    id: "3",
    name: "Tailored Linen Blazer",
    price: 149.99,
    image: productBlazer,
    category: "Outerwear",
    isNew: true,
    colors: ["#f4f1e8", "#2c2c2c"],
    sizes: ["XS", "S", "M", "L"],
  },
  {
    id: "4",
    name: "Wide-Leg Trousers",
    price: 79.99,
    originalPrice: 99.99,
    image: productSweater, // Reusing for demo
    category: "Bottoms",
    isOnSale: true,
    colors: ["#2c2c2c", "#8b7355", "#4a4a4a"],
    sizes: ["XS", "S", "M", "L", "XL"],
  },
  {
    id: "5",
    name: "Cashmere Scarf",
    price: 59.99,
    image: productTee, // Reusing for demo
    category: "Accessories",
    colors: ["#f5f5f5", "#7c8471", "#d4c4a0"],
    sizes: ["One Size"],
  },
  {
    id: "6",
    name: "Silk Midi Dress",
    price: 169.99,
    image: productBlazer, // Reusing for demo
    category: "Dresses",
    isNew: true,
    colors: ["#2c2c2c", "#7c8471"],
    sizes: ["XS", "S", "M", "L"],
  },
];

const allCategories = [
  "All",
  ...Array.from(new Set(demoProducts.map((p) => p.category)))
];
const allColors = Array.from(new Set(demoProducts.flatMap((p) => p.colors || [])));
const allSizes = Array.from(new Set(demoProducts.flatMap((p) => p.sizes || [])));

export default function ProductGrid() {
  const [category, setCategory] = useState("All");
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(200);
  const [color, setColor] = useState("");
  const [size, setSize] = useState("");
  const [sort, setSort] = useState("newest");

  let filtered = demoProducts.filter((p) => {
    if (category !== "All" && p.category !== category) return false;
    if (color && !(p.colors || []).includes(color)) return false;
    if (size && !(p.sizes || []).includes(size)) return false;
    if (p.price < minPrice || p.price > maxPrice) return false;
    return true;
  });
  if (sort === "price-asc") filtered = filtered.slice().sort((a, b) => a.price - b.price);
  if (sort === "price-desc") filtered = filtered.slice().sort((a, b) => b.price - a.price);
  if (sort === "newest") filtered = filtered.slice().sort((a, b) => Number(b.id) - Number(a.id));

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4 lg:px-6">
        {/* Section Header */}
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4">
            New Arrivals
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Featured Collection
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Discover our carefully curated selection of contemporary pieces designed for effortless elegance.
          </p>
        </div>
        {/* Filter & Sort Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 bg-muted/50 rounded-lg p-4">
          {/* Category */}
          <div className="flex flex-wrap gap-2">
            {allCategories.map((cat) => (
              <Button
                key={cat}
                variant={category === cat ? "sage" : "ghost"}
                size="sm"
                onClick={() => setCategory(cat)}
                aria-label={`Filter by ${cat}`}
              >
                {cat}
              </Button>
            ))}
          </div>
          {/* Price */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Price:</span>
            <Input
              type="number"
              min={0}
              max={maxPrice}
              value={minPrice}
              onChange={e => setMinPrice(Number(e.target.value))}
              className="w-20"
              aria-label="Min price"
            />
            <span>-</span>
            <Input
              type="number"
              min={minPrice}
              max={200}
              value={maxPrice}
              onChange={e => setMaxPrice(Number(e.target.value))}
              className="w-20"
              aria-label="Max price"
            />
          </div>
          {/* Color */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Color:</span>
            <div className="flex gap-1">
              <Button
                variant={!color ? "sage" : "ghost"}
                size="icon"
                onClick={() => setColor("")}
                aria-label="All colors"
              >
                <span className="w-4 h-4 rounded-full border border-border bg-muted block" />
              </Button>
              {allColors.map((c) => (
                <Button
                  key={c}
                  variant={color === c ? "sage" : "ghost"}
                  size="icon"
                  onClick={() => setColor(c)}
                  aria-label={`Filter by color ${c}`}
                >
                  <span className="w-4 h-4 rounded-full border border-border block" style={{ backgroundColor: c }} />
                </Button>
              ))}
            </div>
          </div>
          {/* Size */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Size:</span>
            <select
              value={size}
              onChange={e => setSize(e.target.value)}
              className="border rounded px-2 py-1 text-sm bg-background"
              aria-label="Filter by size"
            >
              <option value="">All</option>
              {allSizes.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          {/* Sort */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Sort:</span>
            <select
              value={sort}
              onChange={e => setSort(e.target.value)}
              className="border rounded px-2 py-1 text-sm bg-background"
              aria-label="Sort products"
            >
              <option value="newest">Newest</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>
        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
          {filtered.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
        {/* Load More Button */}
        <div className="text-center">
          <Button variant="minimal" size="lg">
            Load More Products
          </Button>
        </div>
      </div>
    </section>
  );
}