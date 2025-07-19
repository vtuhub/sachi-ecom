import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Navigate, Link } from "react-router-dom";
import { Header } from "@/components/Header";
import Footer from "@/components/Footer";
import { Package, Clock, Truck, CheckCircle, XCircle } from "lucide-react";
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

interface OrderItem {
  id: string;
  product_name: string;
  product_description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface Order {
  id: string;
  order_number: string;
  status: string;
  total_amount: number;
  currency: string;
  shipping_address_line1: string;
  shipping_city: string;
  shipping_state: string;
  created_at: string;
  order_items: OrderItem[];
}

const Orders = () => {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      const { data: ordersData, error } = await supabase
        .from("orders")
        .select(`
          *,
          order_items (*)
        `)
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setOrders(ordersData || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast({
        title: "Error",
        description: "Failed to load orders.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "processing":
        return <Package className="h-4 w-4" />;
      case "shipped":
        return <Truck className="h-4 w-4" />;
      case "delivered":
        return <CheckCircle className="h-4 w-4" />;
      case "cancelled":
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "shipped":
        return "bg-purple-100 text-purple-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatPrice = (priceInCents: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(priceInCents / 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl mx-auto p-8">
          {[...Array(2)].map((_, i) => (
            <Card key={i} className="animate-pulse h-40 bg-muted/50" />
          ))}
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
        <img src={productSweater} alt="No orders" className="w-32 h-32 mb-6 opacity-60" />
        <h2 className="text-2xl font-bold mb-2 text-foreground">No orders yet</h2>
        <p className="text-muted-foreground mb-6">You haven't placed any orders yet.</p>
        <Button asChild variant="sage" size="lg">
          <Link to="/">Shop Now</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-8 text-foreground">My Orders</h1>
        <div className="flex flex-col gap-8">
          {orders.map((order) => (
            <Card key={order.id} className="p-0 overflow-hidden">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-4">
                  <div className="flex flex-col md:flex-row md:items-center gap-2">
                    <span className="font-semibold text-lg text-foreground">Order #{order.order_number}</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>{order.status}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{formatDate(order.created_at)}</span>
                </div>
                <Separator className="mb-4" />
                <div className="flex flex-col gap-4">
                  {order.order_items.map((item) => (
                    <div key={item.id} className="flex items-center gap-4">
                      <img src={productImages[item.product_name] || productSweater} alt={item.product_name} className="w-16 h-20 object-cover rounded border" />
                      <div className="flex-1">
                        <div className="font-medium text-foreground line-clamp-1">{item.product_name}</div>
                        <div className="text-xs text-muted-foreground">Qty: {item.quantity}</div>
                      </div>
                      <div className="font-semibold text-foreground">{formatPrice(item.total_price)}</div>
                    </div>
                  ))}
                </div>
                <Separator className="my-4" />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total</span>
                  <span className="font-bold text-lg text-foreground">{formatPrice(order.total_amount)}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Orders;