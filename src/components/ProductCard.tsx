import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate, Link } from "react-router-dom";
import productSweater from "@/assets/product-sweater.jpg";
import productTee from "@/assets/product-tee.jpg";
import productBlazer from "@/assets/product-blazer.jpg";
import { useWishlist } from "@/hooks/useWishlist";

const productHoverImages: Record<string, string> = {
  "1": productTee,
  "2": productBlazer,
  "3": productSweater,
  "4": productTee,
  "5": productBlazer,
  "6": productSweater,
};

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  isNew?: boolean;
  isOnSale?: boolean;
  colors?: string[];
  sizes?: string[];
}

export default function ProductCard({
  id,
  name,
  price,
  originalPrice,
  image,
  category,
  isNew,
  isOnSale,
  colors = [],
  sizes = [],
}: ProductCardProps) {
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const hoverImage = productHoverImages[id] || image;
  const [isHovered, setIsHovered] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

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
        .upsert({
          user_id: user.id,
          product_name: name,
          product_description: `${category} - ${name}`,
          quantity: 1,
          unit_price: Math.round(price * 100), // Price already in paise (INR cents)
        }, {
          onConflict: 'user_id,product_name',
          ignoreDuplicates: false,
        });

      if (error) throw error;

      toast({
        title: "Added to cart",
        description: `${name} has been added to your cart.`,
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

  const inWishlist = isInWishlist(id);

  return (
    <Link
      to={`/product/${id}`}
      className={`group relative bg-card rounded-lg overflow-hidden hover:shadow-lg hover:scale-[1.025] transition-all duration-300 block focus:outline-none`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      tabIndex={0}
      aria-label={`View details for ${name}`}
    >
      {/* Image Container */}
      <div className="relative aspect-[3/4] overflow-hidden">
        <img
          src={isHovered ? hoverImage : image}
          alt={name}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
          {isNew && (
            <Badge variant="default" className="bg-primary text-primary-foreground">New</Badge>
          )}
          {isOnSale && (
            <Badge variant="destructive">Sale</Badge>
          )}
        </div>
        {/* Wishlist Button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-3 right-3 z-10"
          aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
          onClick={e => {
            e.preventDefault();
            if (inWishlist) {
              removeFromWishlist(id);
            } else {
              addToWishlist(id);
            }
          }}
          tabIndex={0}
        >
          <Heart className={`h-4 w-4 transition-colors ${inWishlist ? 'fill-red-500 text-red-500' : 'text-foreground'}`} />
        </Button>
        {/* Quick Add to Cart Button */}
        <div
          className={`absolute bottom-4 left-4 right-4 transition-all duration-200 z-10 ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'} md:opacity-0 md:group-hover:opacity-100 md:group-hover:translate-y-0`}
        >
          <Button
            className="w-full"
            variant="sage"
            onClick={e => { e.preventDefault(); addToCart(); }}
            disabled={isAddingToCart}
            aria-label="Quick add to cart"
            tabIndex={0}
          >
            <ShoppingBag className="h-4 w-4 mr-2" />
            {isAddingToCart ? "Adding..." : "Add to Cart"}
          </Button>
        </div>
      </div>
      {/* Product Details */}
      <div className="p-4">
        <div className="text-sm text-muted-foreground mb-1">{category}</div>
        <h3 className="font-medium text-foreground mb-2 line-clamp-2 hover:underline">{name}</h3>
        {/* Colors */}
        {colors.length > 0 && (
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm text-muted-foreground">Colors:</span>
            <div className="flex gap-1">
              {colors.map((color, index) => (
                <div
                  key={index}
                  className="w-4 h-4 rounded-full border border-border"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        )}
        {/* Sizes */}
        {sizes.length > 0 && (
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm text-muted-foreground">Sizes:</span>
            <div className="flex gap-1">
              {sizes.map((size, index) => (
                <span
                  key={index}
                  className="px-2 py-1 text-xs border border-border rounded text-foreground"
                >
                  {size}
                </span>
              ))}
            </div>
          </div>
        )}
        {/* Price */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold text-foreground">₹{price.toLocaleString('en-IN')}</span>
            {originalPrice && (
              <span className="text-sm text-muted-foreground line-through">₹{originalPrice.toLocaleString('en-IN')}</span>
            )}
          </div>
          {isOnSale && originalPrice && (
            <span className="text-sm font-medium text-destructive">{Math.round(((originalPrice - price) / originalPrice) * 100)}% off</span>
          )}
        </div>
      </div>
    </Link>
  );
}