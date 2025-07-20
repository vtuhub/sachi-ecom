import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Navigate, Link } from "react-router-dom";
import { Header } from "@/components/Header";
import Footer from "@/components/Footer";
import { Heart, ShoppingBag, Trash2 } from "lucide-react";
import productSweater from "@/assets/product-sweater.jpg";
import productTee from "@/assets/product-tee.jpg";
import productBlazer from "@/assets/product-blazer.jpg";
import { useWishlist } from "@/hooks/useWishlist";

// Mock product data - in a real app this would come from your products database
const mockProducts: Record<string, { name: string; price: number; image: string; category: string }> = {
  "1": { name: "Minimalist Wool Sweater", price: 189.00, image: productSweater, category: "Knitwear" },
  "2": { name: "Organic Cotton Tee", price: 45.00, image: productTee, category: "Basics" },
  "3": { name: "Tailored Linen Blazer", price: 295.00, image: productBlazer, category: "Outerwear" },
  "4": { name: "Wide-Leg Trousers", price: 135.00, image: productSweater, category: "Bottoms" },
  "5": { name: "Cashmere Scarf", price: 89.00, image: productTee, category: "Accessories" },
  "6": { name: "Silk Midi Dress", price: 245.00, image: productBlazer, category: "Dresses" },
};

const Wishlist = () => {
  const { user, loading } = useAuth();
  const { wishlist, removeFromWishlist, loading: wishlistLoading } = useWishlist();
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);

  const addToCart = async (productId: string) => {
    if (!user) return;

    const product = mockProducts[productId];
    if (!product) return;

    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from("cart_items")
        .upsert({
          user_id: user.id,
          product_name: product.name,
          product_description: `${product.category} - ${product.name}`,
          quantity: 1,
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
        description: "Failed to add item to cart.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading || wishlistLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl mx-auto p-8">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse h-80 bg-muted/50" />
          ))}
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (wishlist.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
        <Heart className="w-16 h-16 mb-6 text-muted-foreground" />
        <h2 className="text-2xl font-bold mb-2 text-foreground">Your wishlist is empty</h2>
        <p className="text-muted-foreground mb-6">Save items you love to view them later.</p>
        <Button asChild variant="sage" size="lg">
          <Link to="/">Start Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-8 text-foreground">My Wishlist</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlist.map((productId) => {
            const product = mockProducts[productId];
            if (!product) return null;

            return (
              <Card key={productId} className="group overflow-hidden">
                <div className="relative aspect-[3/4] overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-3 right-3 bg-background/80 hover:bg-background"
                    onClick={() => removeFromWishlist(productId)}
                    disabled={isUpdating}
                    aria-label="Remove from wishlist"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <CardContent className="p-4">
                  <div className="text-sm text-muted-foreground mb-1">{product.category}</div>
                  <h3 className="font-medium text-foreground mb-2">{product.name}</h3>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-lg font-semibold text-foreground">${product.price.toFixed(2)}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="sage"
                      className="flex-1"
                      onClick={() => addToCart(productId)}
                      disabled={isUpdating}
                    >
                      <ShoppingBag className="h-4 w-4 mr-2" />
                      Add to Cart
                    </Button>
                    <Button asChild variant="outline">
                      <Link to={`/product/${productId}`}>View</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Wishlist;