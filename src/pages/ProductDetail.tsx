import { useParams, useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, ShoppingBag, Star } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import Footer from "@/components/Footer";
import { useWishlist } from "@/hooks/useWishlist";

// Copy of demoProducts from ProductGrid
import productSweater from "@/assets/product-sweater.jpg";
import productTee from "@/assets/product-tee.jpg";
import productBlazer from "@/assets/product-blazer.jpg";

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

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const product = demoProducts.find((p) => p.id === id);
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'reviews' | 'shipping'>('description');

  // Simulate multiple images per product for demo
  const productImages: Record<string, string[]> = {
    "1": [productSweater, productSweater, productSweater],
    "2": [productTee, productTee, productTee],
    "3": [productBlazer, productBlazer, productBlazer],
    "4": [productSweater, productSweater, productSweater],
    "5": [productTee, productTee, productTee],
    "6": [productBlazer, productBlazer, productBlazer],
  };

  // Simulate stock for color/size combinations
  const stock: Record<string, Record<string, boolean>> = {
    // productId: { color_size: inStock }
    "1": { "#f5f5f5_XS": true, "#f5f5f5_S": true, "#f5f5f5_M": false, "#f5f5f5_L": true, "#f5f5f5_XL": true,
            "#2c2c2c_XS": true, "#2c2c2c_S": false, "#2c2c2c_M": true, "#2c2c2c_L": true, "#2c2c2c_XL": true,
            "#8b7355_XS": true, "#8b7355_S": true, "#8b7355_M": true, "#8b7355_L": false, "#8b7355_XL": true },
    "2": { "#ffffff_S": true, "#ffffff_M": true, "#ffffff_L": true, "#ffffff_XL": false,
            "#000000_S": true, "#000000_M": true, "#000000_L": true, "#000000_XL": true,
            "#7c8471_S": false, "#7c8471_M": true, "#7c8471_L": true, "#7c8471_XL": true },
    // ... add for other products as needed
  };

  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  const isOptionInStock = (color: string, size: string) => {
    const key = `${color}_${size}`;
    return stock[product.id]?.[key] ?? true; // default to true if not specified
  };

  const canAddToCart = selectedColor && selectedSize && isOptionInStock(selectedColor, selectedSize) && quantity >= 1 && quantity <= 10;

  // Demo product description/details
  const productDescription = `
    Experience the perfect blend of comfort and style with our ${product.name}. Crafted from premium materials, this piece is designed for all-day wear and effortless elegance. Care instructions: Machine wash cold, gentle cycle. Fabric: 100% organic cotton.`;

  // Demo reviews
  const reviews = [
    { name: "Ava", rating: 5, comment: "Absolutely love it! The fit is perfect and the fabric is so soft." },
    { name: "Liam", rating: 4, comment: "Great quality, but wish there were more color options." },
    { name: "Sophia", rating: 5, comment: "My new favorite! Arrived quickly and looks just like the photos." },
  ];

  // Related products (exclude current)
  const relatedProducts = demoProducts.filter(p => p.id !== product.id).slice(0, 4);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
          <Button variant="sage" onClick={() => navigate(-1)}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const images = productImages[product.id] || [product.image];
  const [selectedImage, setSelectedImage] = useState(images[0]);

  const addToCart = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to add items to your cart.",
      });
      navigate("/auth");
      return;
    }
    setIsAddingToCart(true);
    try {
      const { error } = await supabase
        .from("cart_items")
        .upsert(
          {
            user_id: user.id,
            product_name: product.name,
            product_description: `${product.category} - ${product.name}`,
            quantity: quantity,
            unit_price: Math.round(product.price * 100),
          },
          {
            onConflict: "user_id,product_name",
            ignoreDuplicates: false,
          }
        );
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

  const inWishlist = isInWishlist(product.id);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      {/* Breadcrumbs */}
      <nav className="container mx-auto px-4 pt-6 pb-2 text-sm text-muted-foreground flex items-center gap-2">
        <Link to="/" className="hover:underline">Home</Link>
        <span>/</span>
        <span className="capitalize">{product.category}</span>
        <span>/</span>
        <span className="text-foreground font-medium">{product.name}</span>
      </nav>
      <main className="container mx-auto px-4 py-6 flex flex-col md:flex-row gap-12">
        {/* Image Gallery */}
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="relative w-full max-w-md aspect-[3/4] mb-4 overflow-hidden group">
            <img
              src={selectedImage}
              alt={product.name}
              className="rounded-lg shadow-lg w-full h-full object-contain transition-transform duration-300 group-hover:scale-110"
              style={{ maxHeight: 500 }}
            />
          </div>
          <div className="flex gap-2 justify-center">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImage(img)}
                className={`border rounded-md p-1 bg-white transition-all ${selectedImage === img ? 'border-primary ring-2 ring-primary' : 'border-border'}`}
                style={{ width: 64, height: 64 }}
                aria-label={`View image ${idx + 1}`}
              >
                <img
                  src={img}
                  alt={`Thumbnail ${idx + 1}`}
                  className="w-full h-full object-contain rounded"
                />
              </button>
            ))}
          </div>
        </div>
        {/* Product Details */}
        <div className="flex-1 max-w-xl mx-auto">
          <div className="mb-4 flex gap-2">
            {product.isNew && (
              <Badge variant="default" className="bg-primary text-primary-foreground">
                New
              </Badge>
            )}
            {product.isOnSale && (
              <Badge variant="destructive">Sale</Badge>
            )}
          </div>
          <h1 className="text-3xl font-bold mb-2 text-foreground">{product.name}</h1>
          <div className="text-muted-foreground mb-4 text-lg">{product.category}</div>
          {/* Colors */}
          {product.colors && product.colors.length > 0 && (
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm text-muted-foreground">Colors:</span>
              <div className="flex gap-1">
                {product.colors.map((color, index) => (
                  <button
                    key={index}
                    type="button"
                    className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all focus:outline-none ${selectedColor === color ? 'border-primary ring-2 ring-primary' : 'border-border'} ${selectedColor === color ? 'scale-110' : ''}`}
                    style={{ backgroundColor: color }}
                    onClick={() => setSelectedColor(color)}
                    aria-label={`Select color ${color}`}
                  />
                ))}
              </div>
            </div>
          )}
          {/* Sizes */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm text-muted-foreground">Sizes:</span>
              <div className="flex gap-1">
                {product.sizes.map((size, index) => {
                  const outOfStock = selectedColor && !isOptionInStock(selectedColor, size);
                  return (
                    <button
                      key={index}
                      type="button"
                      className={`px-2 py-1 text-xs border rounded transition-all focus:outline-none ${selectedSize === size ? 'border-primary ring-2 ring-primary' : 'border-border'} ${outOfStock ? 'opacity-50 cursor-not-allowed' : 'text-foreground'}`}
                      onClick={() => !outOfStock && setSelectedSize(size)}
                      disabled={outOfStock}
                      aria-label={`Select size ${size}${outOfStock ? ' (out of stock)' : ''}`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          {/* Out of stock message */}
          {selectedColor && selectedSize && !isOptionInStock(selectedColor, selectedSize) && (
            <div className="text-destructive text-sm mb-2">Selected color/size is out of stock.</div>
          )}
          {/* Price */}
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl font-bold text-foreground">
              ${product.price.toFixed(2)}
            </span>
            {product.originalPrice && (
              <span className="text-lg text-muted-foreground line-through">
                ${product.originalPrice.toFixed(2)}
              </span>
            )}
            {product.isOnSale && product.originalPrice && (
              <span className="text-lg font-medium text-destructive">
                {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% off
              </span>
            )}
          </div>
          {/* Quantity Selector */}
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm text-muted-foreground">Quantity:</span>
            <button
              type="button"
              className="px-2 py-1 border rounded text-lg disabled:opacity-50"
              onClick={() => setQuantity(q => Math.max(1, q - 1))}
              disabled={quantity <= 1}
              aria-label="Decrease quantity"
            >
              -
            </button>
            <input
              type="number"
              min={1}
              max={10}
              value={quantity}
              onChange={e => setQuantity(Math.max(1, Math.min(10, Number(e.target.value))))}
              className="w-12 text-center border rounded"
              aria-label="Quantity"
            />
            <button
              type="button"
              className="px-2 py-1 border rounded text-lg disabled:opacity-50"
              onClick={() => setQuantity(q => Math.min(10, q + 1))}
              disabled={quantity >= 10}
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
          {/* Wishlist & Add to Cart */}
          <div className="flex gap-4 mb-8">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                if (inWishlist) {
                  removeFromWishlist(product.id);
                } else {
                  addToWishlist(product.id);
                }
              }}
              aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
            >
              <Heart
                className={`h-6 w-6 transition-colors ${
                  inWishlist ? "fill-red-500 text-red-500" : "text-foreground"
                }`}
              />
            </Button>
            <Button
              className="flex-1"
              variant="sage"
              onClick={addToCart}
              disabled={isAddingToCart || !canAddToCart}
            >
              <ShoppingBag className="h-5 w-5 mr-2" />
              {isAddingToCart ? "Adding..." : "Add to Cart"}
            </Button>
          </div>
        </div>
      </main>
      {/* Tabs for Description, Reviews, Shipping */}
      <section className="container mx-auto px-4 pb-12">
        <div className="border-b border-border mb-6 flex gap-8">
          <button
            className={`py-2 px-4 font-medium border-b-2 transition-colors ${activeTab === 'description' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
            onClick={() => setActiveTab('description')}
          >
            Description
          </button>
          <button
            className={`py-2 px-4 font-medium border-b-2 transition-colors ${activeTab === 'reviews' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
            onClick={() => setActiveTab('reviews')}
          >
            Reviews
          </button>
          <button
            className={`py-2 px-4 font-medium border-b-2 transition-colors ${activeTab === 'shipping' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
            onClick={() => setActiveTab('shipping')}
          >
            Shipping & Returns
          </button>
        </div>
        <div>
          {activeTab === 'description' && (
            <div className="max-w-2xl mx-auto">
              <h2 className="text-lg font-semibold mb-2">Product Details</h2>
              <p className="text-muted-foreground whitespace-pre-line">{productDescription}</p>
            </div>
          )}
          {activeTab === 'reviews' && (
            <div className="max-w-2xl mx-auto">
              <h2 className="text-lg font-semibold mb-2">Customer Reviews</h2>
              <div className="flex items-center gap-2 mb-2">
                <span className="font-bold text-foreground text-xl">4.7</span>
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < 4 ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} />
                  ))}
                </div>
                <span className="text-muted-foreground">({reviews.length} reviews)</span>
              </div>
              <ul className="space-y-3">
                {reviews.map((r, i) => (
                  <li key={i} className="bg-card rounded p-3 border border-border">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-foreground">{r.name}</span>
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, j) => (
                          <Star key={j} className={`w-3 h-3 ${j < r.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} />
                        ))}
                      </div>
                    </div>
                    <p className="text-muted-foreground text-sm">{r.comment}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {activeTab === 'shipping' && (
            <div className="max-w-2xl mx-auto">
              <h2 className="text-lg font-semibold mb-2">Shipping & Returns</h2>
              <ul className="text-muted-foreground text-sm space-y-2">
                <li>Free shipping on orders over $75</li>
                <li>Easy 30-day returns</li>
                <li>Standard delivery: 3-5 business days</li>
                <li>Express delivery available at checkout</li>
                <li>Contact support for international shipping</li>
              </ul>
            </div>
          )}
        </div>
      </section>
      {/* Related Products */}
      <section className="container mx-auto px-4 pb-16">
        <h2 className="text-2xl font-bold mb-6 text-foreground">You may also like</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {relatedProducts.map((p) => (
            <div key={p.id} className="h-full">
              <Link to={`/product/${p.id}`} className="block h-full">
                <div className="bg-card rounded-lg overflow-hidden shadow hover:shadow-lg transition-all duration-200 h-full flex flex-col">
                  <img src={p.image} alt={p.name} className="w-full h-48 object-cover" />
                  <div className="p-3 flex-1 flex flex-col">
                    <div className="text-sm text-muted-foreground mb-1">{p.category}</div>
                    <div className="font-medium text-foreground mb-1 line-clamp-2">{p.name}</div>
                    <div className="flex items-center gap-2 mt-auto">
                      <span className="text-lg font-semibold text-foreground">${p.price.toFixed(2)}</span>
                      {p.originalPrice && (
                        <span className="text-sm text-muted-foreground line-through">${p.originalPrice.toFixed(2)}</span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </section>
      <Footer />
      {/* Sticky Add to Cart Bar */}
      {canAddToCart && (
        <div className="fixed bottom-0 left-0 w-full z-40 bg-background/95 border-t border-border shadow-lg px-4 py-3 flex items-center justify-between gap-4 md:gap-8 md:px-12 md:py-4 transition-all duration-300">
          <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4 flex-1 min-w-0">
            <span className="font-medium truncate text-foreground">{product.name}</span>
            <span className="text-muted-foreground text-sm hidden md:inline">|
              <span className="ml-1">{selectedColor && <span className="inline-block w-4 h-4 rounded-full border align-middle mr-1" style={{ backgroundColor: selectedColor }} />}{selectedColor}</span>
              {selectedSize && <span className="ml-2">Size: {selectedSize}</span>}
              <span className="ml-2">Qty: {quantity}</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-bold text-lg text-foreground">${product.price.toFixed(2)}</span>
            <Button
              className="px-6 py-2 text-base font-semibold"
              variant="sage"
              onClick={addToCart}
              disabled={isAddingToCart}
            >
              <ShoppingBag className="h-5 w-5 mr-2" />
              {isAddingToCart ? "Adding..." : "Add to Cart"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;
