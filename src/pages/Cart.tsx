import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Navigate, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import Footer from "@/components/Footer";
import { ShoppingCart, Plus, Minus, Trash2 } from "lucide-react";
import productSweater from "@/assets/product-sweater.jpg";
import productTee from "@/assets/product-tee.jpg";
import productBlazer from "@/assets/product-blazer.jpg";

const productImages: Record<string, string> = {
  "Minimalist Wool Sweater": productSweater,
  "Organic Cotton Tee": productTee,
  "Tailored Linen Blazer": productBlazer,
  "Wide-Leg Trousers": productSweater,
  "Cashmere Scarf": productTee,
  "Silk Midi Dress": productBlazer,
};

interface CartItem {
  id: string;
  product_name: string;
  product_description: string;
  quantity: number;
  unit_price: number;
}

const Cart = () => {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (user) {
      fetchCartItems();
    }
  }, [user]);

  const fetchCartItems = async () => {
    try {
      const { data, error } = await supabase
        .from("cart_items")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setCartItems(data || []);
    } catch (error) {
      console.error("Error fetching cart items:", error);
      toast({
        title: "Error",
        description: "Failed to load cart items.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from("cart_items")
        .update({ quantity: newQuantity })
        .eq("id", itemId);

      if (error) throw error;

      setCartItems(prev => 
        prev.map(item => 
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        )
      );
    } catch (error) {
      console.error("Error updating quantity:", error);
      toast({
        title: "Error",
        description: "Failed to update quantity.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const removeItem = async (itemId: string) => {
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from("cart_items")
        .delete()
        .eq("id", itemId);

      if (error) throw error;

      setCartItems(prev => prev.filter(item => item.id !== itemId));
      toast({
        title: "Success",
        description: "Item removed from cart.",
      });
    } catch (error) {
      console.error("Error removing item:", error);
      toast({
        title: "Error",
        description: "Failed to remove item.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.unit_price * item.quantity), 0);
  };

  const formatPrice = (priceInCents: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(priceInCents / 100);
  };

  const proceedToCheckout = () => {
    if (cartItems.length === 0) {
      toast({
        title: "Error",
        description: "Your cart is empty.",
        variant: "destructive",
      });
      return;
    }
    navigate("/checkout");
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl mx-auto p-8">
          {[...Array(2)].map((_, i) => (
            <Card key={i} className="animate-pulse h-40 bg-muted/50" />
          ))}
          <div className="md:col-span-1 animate-pulse h-40 bg-muted/50 rounded-lg" />
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
        <img src={productSweater} alt="Empty cart" className="w-32 h-32 mb-6 opacity-60" />
        <h2 className="text-2xl font-bold mb-2 text-foreground">Your cart is empty</h2>
        <p className="text-muted-foreground mb-6">Looks like you haven't added anything yet.</p>
        <Button asChild variant="sage" size="lg">
          <Link to="/">Continue Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Cart Items */}
        <section className="md:col-span-2 flex flex-col gap-6">
          <h1 className="text-2xl font-bold mb-2 text-foreground">Shopping Cart</h1>
          {cartItems.map((item) => (
            <Card key={item.id} className="flex flex-col md:flex-row items-center gap-4 p-4">
              <img
                src={productImages[item.product_name] || productSweater}
                alt={item.product_name}
                className="w-24 h-32 object-cover rounded-md border"
              />
              <CardContent className="flex-1 flex flex-col gap-2 p-0">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                  <div>
                    <h2 className="font-semibold text-lg text-foreground">{item.product_name}</h2>
                    <p className="text-sm text-muted-foreground">{item.product_description}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeItem(item.id)}
                    aria-label="Remove from cart"
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-sm text-muted-foreground">Qty:</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    disabled={item.quantity <= 1 || isUpdating}
                    aria-label="Decrease quantity"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input
                    type="number"
                    min={1}
                    max={10}
                    value={item.quantity}
                    onChange={e => updateQuantity(item.id, Math.max(1, Math.min(10, Number(e.target.value))))}
                    className="w-14 text-center"
                    aria-label="Quantity"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    disabled={isUpdating}
                    aria-label="Increase quantity"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="mt-2 text-lg font-semibold text-foreground">{formatPrice(item.unit_price * item.quantity)}</div>
              </CardContent>
            </Card>
          ))}
        </section>
        {/* Order Summary */}
        <aside className="md:col-span-1 sticky top-24 self-start bg-card rounded-lg shadow-md p-6 flex flex-col gap-4 h-fit">
          <h2 className="text-xl font-bold mb-2 text-foreground">Order Summary</h2>
          <Separator />
          <div className="flex items-center justify-between text-base">
            <span>Subtotal</span>
            <span className="font-semibold">{formatPrice(getTotalPrice())}</span>
          </div>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Shipping</span>
            <span>Calculated at checkout</span>
          </div>
          <Separator />
          <Button variant="sage" size="lg" className="w-full" onClick={proceedToCheckout} aria-label="Proceed to checkout">Checkout</Button>
          <Button asChild variant="ghost" size="sm" className="w-full mt-2" aria-label="Continue shopping">
            <Link to="/">Continue Shopping</Link>
          </Button>
        </aside>
      </main>
      <Footer />
    </div>
  );
};

export default Cart;