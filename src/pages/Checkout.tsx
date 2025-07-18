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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <Card className="text-center py-12">
              <CardContent>
                <ShoppingCart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">Your cart is empty</h3>
                <p className="text-muted-foreground mb-4">
                  Add some items to your cart before checking out.
                </p>
                <Button onClick={() => navigate("/")}>
                  Continue Shopping
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Checkout</h1>
            <p className="text-muted-foreground mt-2">
              Review your order and complete your purchase
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                {/* Shipping Address */}
                <Card>
                  <CardHeader>
                    <CardTitle>Shipping Address</CardTitle>
                    <CardDescription>
                      Enter your shipping information
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="address_line1">Address Line 1 *</Label>
                      <Input
                        id="address_line1"
                        value={shippingAddress.address_line1}
                        onChange={(e) => handleAddressChange("address_line1", e.target.value)}
                        placeholder="Street address"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="address_line2">Address Line 2</Label>
                      <Input
                        id="address_line2"
                        value={shippingAddress.address_line2}
                        onChange={(e) => handleAddressChange("address_line2", e.target.value)}
                        placeholder="Apartment, suite, etc."
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="city">City *</Label>
                        <Input
                          id="city"
                          value={shippingAddress.city}
                          onChange={(e) => handleAddressChange("city", e.target.value)}
                          placeholder="City"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="state">State *</Label>
                        <Input
                          id="state"
                          value={shippingAddress.state}
                          onChange={(e) => handleAddressChange("state", e.target.value)}
                          placeholder="State"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="postal_code">ZIP Code *</Label>
                      <Input
                        id="postal_code"
                        value={shippingAddress.postal_code}
                        onChange={(e) => handleAddressChange("postal_code", e.target.value)}
                        placeholder="ZIP code"
                        required
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Order Notes */}
                <Card>
                  <CardHeader>
                    <CardTitle>Order Notes</CardTitle>
                    <CardDescription>
                      Any special instructions for your order
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Special delivery instructions, gift message, etc."
                      rows={3}
                    />
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                {/* Order Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium">{item.product_name}</h4>
                          <p className="text-sm text-muted-foreground">
                            Qty: {item.quantity} × {formatPrice(item.unit_price)}
                          </p>
                        </div>
                        <p className="font-medium">
                          {formatPrice(item.unit_price * item.quantity)}
                        </p>
                      </div>
                    ))}
                    
                    <Separator />
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>{formatPrice(getTotalPrice())}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Shipping</span>
                        <span>FREE</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tax</span>
                        <span>$0.00</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-bold text-lg">
                        <span>Total</span>
                        <span>{formatPrice(getTotalPrice())}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Payment */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      Payment Method
                    </CardTitle>
                    <CardDescription>
                      Demo mode - Order will be created without payment
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-muted p-4 rounded-lg text-center">
                      <p className="text-sm text-muted-foreground">
                        This is a demo checkout. Your order will be created but no payment will be processed.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isProcessing}
                >
                  {isProcessing ? "Processing..." : "Place Order"}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Checkout;