import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Heart, ShoppingBag, Minus, Plus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Header } from "@/components/Header";
import Footer from "@/components/Footer";
import { useWishlist } from "@/hooks/useWishlist";
import productSweater from "@/assets/product-sweater.jpg";
import productTee from "@/assets/product-tee.jpg";
import productBlazer from "@/assets/product-blazer.jpg";

// Mock product data - in a real app this would come from your products API
const mockProducts: Record<string, {
  name: string;
  price: number;
  originalPrice?: number;
  images: string[];
  category: string;
  description: string;
  materials: string[];
  sizes: string[];
  colors: { name: string; hex: string }[];
  inStock: boolean;
  isNew?: boolean;
  isOnSale?: boolean;
}> = {
  "1": {
    name: "Minimalist Wool Sweater",
    price: 189.00,
    originalPrice: 225.00,
    images: [productSweater, productTee],
    category: "Knitwear",
    description: "A luxuriously soft wool sweater crafted from the finest merino wool. Perfect for layering or wearing on its own, this piece combines comfort with timeless style.",
    materials: ["100% Merino Wool", "Machine washable", "Imported"],
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: [
      { name: "Cream", hex: "#F5F5DC" },
      { name: "Charcoal", hex: "#36454F" },
      { name: "Navy", hex: "#1B263B" }
    ],
    inStock: true,
    isNew: true,
    isOnSale: true,
  },
  "2": {
    name: "Organic Cotton Tee",
    price: 45.00,
    images: [productTee, productBlazer],
    category: "Basics",
    description: "An everyday essential made from 100% organic cotton. This versatile tee offers comfort and style that works for any occasion.",
    materials: ["100% Organic Cotton", "Pre-shrunk", "Machine washable"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    colors: [
      { name: "White", hex: "#FFFFFF" },
      { name: "Black", hex: "#000000" },
      { name: "Sage", hex: "#9CAF88" }
    ],
    inStock: true,
  },
  "3": {
    name: "Tailored Linen Blazer",
    price: 295.00,
    images: [productBlazer, productSweater],
    category: "Outerwear",
    description: "A sophisticated blazer crafted from premium linen. Features a tailored fit with classic lapels and functional pockets for a refined professional look.",
    materials: ["100% European Linen", "Fully lined", "Dry clean only"],
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: [
      { name: "Natural", hex: "#F7F3E9" },
      { name: "Navy", hex: "#1B263B" }
    ],
    inStock: true,
    isNew: true,
  },
  "4": {
    name: "Wide-Leg Trousers",
    price: 135.00,
    images: [productSweater, productTee],
    category: "Bottoms",
    description: "Comfortable wide-leg trousers with a high waist and flowing silhouette. Perfect for both casual and dressed-up occasions.",
    materials: ["95% Cotton, 5% Elastane", "Machine washable", "Wrinkle resistant"],
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: [
      { name: "Black", hex: "#000000" },
      { name: "Olive", hex: "#556B2F" }
    ],
    inStock: true,
  },
  "5": {
    name: "Cashmere Scarf",
    price: 89.00,
    images: [productTee, productBlazer],
    category: "Accessories",
    description: "A luxurious cashmere scarf that adds warmth and elegance to any outfit. Incredibly soft and lightweight.",
    materials: ["100% Cashmere", "Hand wash only", "Made in Scotland"],
    sizes: ["One Size"],
    colors: [
      { name: "Cream", hex: "#F5F5DC" },
      { name: "Grey", hex: "#808080" },
      { name: "Burgundy", hex: "#800020" }
    ],
    inStock: true,
  },
  "6": {
    name: "Silk Midi Dress",
    price: 245.00,
    images: [productBlazer, productSweater],
    category: "Dresses",
    description: "An elegant midi dress made from pure silk. Features a flattering silhouette with a subtle sheen that catches the light beautifully.",
    materials: ["100% Silk", "Dry clean only", "Lined"],
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: [
      { name: "Midnight Blue", hex: "#191970" },
      { name: "Emerald", hex: "#50C878" }
    ],
    inStock: false,
  },
};

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const product = id ? mockProducts[id] : null;
  const inWishlist = id ? isInWishlist(id) : false;

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
        <h2 className="text-2xl font-bold mb-2 text-foreground">Product not found</h2>
        <p className="text-muted-foreground mb-6">The product you're looking for doesn't exist.</p>
        <Button asChild variant="sage" size="lg">
          <span onClick={() => navigate("/")}>Back to Shop</span>
        </Button>
      </div>
    );
  }

  const addToCart = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to add items to your cart.",
      });
      navigate("/auth");
      return;
    }

    if (!selectedSize && product.sizes.length > 1) {
      toast({
        title: "Please select a size",
        description: "Size selection is required for this item.",
        variant: "destructive",
      });
      return;
    }

    setIsAddingToCart(true);
    try {
      const { error } = await supabase
        .from("cart_items")
        .upsert({
          user_id: user.id,
          product_name: product.name,
          product_description: `${product.category} - ${product.name}${selectedSize ? ` (Size: ${selectedSize})` : ''}${selectedColor ? ` (Color: ${selectedColor})` : ''}`,
          quantity: quantity,
          unit_price: Math.round(product.price * 100), // Convert to cents
        }, {
          onConflict: 'user_id,product_name',
          ignoreDuplicates: false,
        });

      if (error) throw error;

      toast({
        title: "Added to cart",
        description: `${product.name} has been added to your cart.`,
      });
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast({
        title: "Error",
        description: "Failed to add item to cart. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAddingToCart(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-[3/4] overflow-hidden rounded-lg">
              <img
                src={product.images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`w-20 h-24 overflow-hidden rounded border-2 transition-colors ${
                      selectedImage === index ? 'border-primary' : 'border-transparent'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} view ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-sm text-muted-foreground">{product.category}</span>
                {product.isNew && <Badge variant="default">New</Badge>}
                {product.isOnSale && <Badge variant="destructive">Sale</Badge>}
              </div>
              <h1 className="text-3xl font-bold text-foreground mb-4">{product.name}</h1>
              <div className="flex items-center gap-3 mb-6">
                <span className="text-2xl font-bold text-foreground">${product.price.toFixed(2)}</span>
                {product.originalPrice && (
                  <>
                    <span className="text-lg text-muted-foreground line-through">${product.originalPrice.toFixed(2)}</span>
                    <span className="text-sm font-medium text-destructive">
                      {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% off
                    </span>
                  </>
                )}
              </div>
            </div>

            <p className="text-muted-foreground leading-relaxed">{product.description}</p>

            {/* Colors */}
            {product.colors.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-foreground mb-3">Color: {selectedColor}</h3>
                <div className="flex gap-3">
                  {product.colors.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => setSelectedColor(color.name)}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        selectedColor === color.name 
                          ? 'border-primary scale-110' 
                          : 'border-border hover:scale-105'
                      }`}
                      style={{ backgroundColor: color.hex }}
                      aria-label={`Select ${color.name} color`}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Sizes */}
            {product.sizes.length > 1 && (
              <div>
                <h3 className="text-sm font-medium text-foreground mb-3">Size</h3>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 border rounded transition-colors ${
                        selectedSize === size
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border hover:border-primary'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <h3 className="text-sm font-medium text-foreground mb-3">Quantity</h3>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="text-lg font-medium w-8 text-center">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.min(10, quantity + 1))}
                  disabled={quantity >= 10}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                variant="sage"
                size="lg"
                className="flex-1"
                onClick={addToCart}
                disabled={!product.inStock || isAddingToCart}
              >
                <ShoppingBag className="h-5 w-5 mr-2" />
                {!product.inStock ? 'Out of Stock' : isAddingToCart ? 'Adding...' : 'Add to Cart'}
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => {
                  if (inWishlist) {
                    removeFromWishlist(id!);
                  } else {
                    addToWishlist(id!);
                  }
                }}
              >
                <Heart className={`h-5 w-5 ${inWishlist ? 'fill-red-500 text-red-500' : ''}`} />
              </Button>
            </div>

            <Separator />

            {/* Materials */}
            <div>
              <h3 className="text-sm font-medium text-foreground mb-3">Materials & Care</h3>
              <ul className="space-y-1">
                {product.materials.map((material, index) => (
                  <li key={index} className="text-sm text-muted-foreground">• {material}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProductDetail;