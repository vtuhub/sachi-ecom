import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
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

export default function ProductGrid() {
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

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
          <Button variant="sage" size="sm">
            All
          </Button>
          <Button variant="ghost" size="sm">
            Knitwear
          </Button>
          <Button variant="ghost" size="sm">
            Basics
          </Button>
          <Button variant="ghost" size="sm">
            Outerwear
          </Button>
          <Button variant="ghost" size="sm">
            Bottoms
          </Button>
          <Button variant="ghost" size="sm">
            Accessories
          </Button>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
          {demoProducts.map((product) => (
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