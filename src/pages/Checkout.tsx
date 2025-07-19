import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Navigate, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import Footer from "@/components/Footer";
import { CreditCard, ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
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

interface ShippingAddress {
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

const Checkout = () => {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    address_line1: "",
    address_line2: "",
    city: "",
    state: "",
    postal_code: "",
    country: "US",
  });
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (user) {
      fetchCartItems();
      fetchUserProfile();
    }
  }, [user]);

  const fetchCartItems = async () => {
    try {
      const { data, error } = await supabase
        .from("cart_items")
        .select("*")
        .eq("user_id", user?.id);

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

  const fetchUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user?.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setShippingAddress({
          address_line1: data.shipping_address_line1 || "",
          address_line2: data.shipping_address_line2 || "",
          city: data.shipping_city || "",
          state: data.shipping_state || "",
          postal_code: data.shipping_postal_code || "",
          country: data.shipping_country || "US",
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
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

  const handleAddressChange = (field: keyof ShippingAddress, value: string) => {
    setShippingAddress(prev => ({ ...prev, [field]: value }));
  };

  const createOrder = async () => {
    if (!user) return;

    setIsProcessing(true);
    try {
      // Create order
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          total_amount: getTotalPrice(),
          shipping_address_line1: shippingAddress.address_line1,
          shipping_address_line2: shippingAddress.address_line2,
          shipping_city: shippingAddress.city,
          shipping_state: shippingAddress.state,
          shipping_postal_code: shippingAddress.postal_code,
          shipping_country: shippingAddress.country,
          notes: notes,
          status: "pending",
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = cartItems.map(item => ({
        order_id: orderData.id,
        product_name: item.product_name,
        product_description: item.product_description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.unit_price * item.quantity,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Clear cart
      const { error: clearCartError } = await supabase
        .from("cart_items")
        .delete()
        .eq("user_id", user.id);

      if (clearCartError) throw clearCartError;

      toast({
        title: "Success",
        description: "Order placed successfully!",
      });

      navigate("/orders");
    } catch (error) {
      console.error("Error creating order:", error);
      toast({
        title: "Error",
        description: "Failed to create order.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!shippingAddress.address_line1 || !shippingAddress.city || !shippingAddress.state || !shippingAddress.postal_code) {
      toast({
        title: "Error",
        description: "Please fill in all required shipping address fields.",
        variant: "destructive",
      });
      return;
    }

    if (cartItems.length === 0) {
      toast({
        title: "Error",
        description: "Your cart is empty.",
        variant: "destructive",
      });
      return;
    }

    // For demo purposes, we'll just create the order without payment processing
    createOrder();
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
      {/* Progress Indicator */}
      <div className="container mx-auto px-4 pt-8 pb-4 flex items-center justify-center gap-8">
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">1</div>
            <span className="text-xs mt-1 text-primary font-semibold">Shipping</span>
          </div>
          <div className="h-1 w-8 bg-muted rounded" />
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center font-bold">2</div>
            <span className="text-xs mt-1 text-muted-foreground">Payment</span>
          </div>
          <div className="h-1 w-8 bg-muted rounded" />
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center font-bold">3</div>
            <span className="text-xs mt-1 text-muted-foreground">Review</span>
          </div>
        </div>
      </div>
      <main className="container mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Checkout Steps */}
        <section className="md:col-span-2 flex flex-col gap-6">
          <Card>
            <CardContent className="p-6 flex flex-col gap-6">
              <h1 className="text-2xl font-bold mb-2 text-foreground">Shipping Address</h1>
              <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="address1">Address Line 1</Label>
                  <Input id="address1" value={shippingAddress.address_line1} onChange={e => handleAddressChange('address_line1', e.target.value)} required className="mb-2" />
                </div>
                <div>
                  <Label htmlFor="address2">Address Line 2</Label>
                  <Input id="address2" value={shippingAddress.address_line2} onChange={e => handleAddressChange('address_line2', e.target.value)} className="mb-2" />
                </div>
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input id="city" value={shippingAddress.city} onChange={e => handleAddressChange('city', e.target.value)} required className="mb-2" />
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <Input id="state" value={shippingAddress.state} onChange={e => handleAddressChange('state', e.target.value)} required className="mb-2" />
                </div>
                <div>
                  <Label htmlFor="postal">Postal Code</Label>
                  <Input id="postal" value={shippingAddress.postal_code} onChange={e => handleAddressChange('postal_code', e.target.value)} required className="mb-2" />
                </div>
                <div>
                  <Label htmlFor="country">Country</Label>
                  <Input id="country" value={shippingAddress.country} onChange={e => handleAddressChange('country', e.target.value)} required className="mb-2" />
                </div>
              </form>
              <Button variant="sage" size="lg" className="w-full mt-4" disabled>Continue to Payment (Demo)</Button>
              <div className="flex items-center gap-2 mt-4">
                <img src="https://upload.wikimedia.org/wikipedia/commons/4/41/Visa_Logo.png" alt="Visa" className="h-6" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/0/04/Mastercard-logo.png" alt="Mastercard" className="h-6" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/PayPal_2014_logo.png" alt="PayPal" className="h-6" />
                <span className="ml-auto text-xs text-muted-foreground flex items-center"><CreditCard className="h-4 w-4 mr-1" /> Secure checkout</span>
              </div>
            </CardContent>
          </Card>
        </section>
        {/* Order Summary */}
        <aside className="md:col-span-1 sticky top-24 self-start bg-card rounded-lg shadow-md p-6 flex flex-col gap-4 h-fit">
          <h2 className="text-xl font-bold mb-2 text-foreground">Order Summary</h2>
          <Separator />
          <div className="flex flex-col gap-2">
            {cartItems.map((item) => (
              <div key={item.id} className="flex items-center gap-3">
                <img src={productImages[item.product_name] || productSweater} alt={item.product_name} className="w-12 h-16 object-cover rounded border" />
                <div className="flex-1">
                  <div className="font-medium text-sm text-foreground line-clamp-1">{item.product_name}</div>
                  <div className="text-xs text-muted-foreground">Qty: {item.quantity}</div>
                </div>
                <div className="font-semibold text-sm text-foreground">{formatPrice(item.unit_price * item.quantity)}</div>
              </div>
            ))}
          </div>
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
          <Button variant="sage" size="lg" className="w-full" disabled>Checkout (Demo)</Button>
          <Button asChild variant="ghost" size="sm" className="w-full mt-2" aria-label="Continue shopping">
            <Link to="/">Continue Shopping</Link>
          </Button>
        </aside>
      </main>
      <Footer />
    </div>
  );
};

export default Checkout;