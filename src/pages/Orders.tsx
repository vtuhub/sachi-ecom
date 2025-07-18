import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Navigate } from "react-router-dom";
import { Header } from "@/components/Header";
import Footer from "@/components/Footer";
import { Package, Clock, Truck, CheckCircle, XCircle } from "lucide-react";

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">My Orders</h1>
            <p className="text-muted-foreground mt-2">
              Track your orders and view your purchase history
            </p>
          </div>

          {orders.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">No orders yet</h3>
                <p className="text-muted-foreground mb-4">
                  When you place your first order, it will appear here.
                </p>
                <Button onClick={() => window.location.href = "/"}>
                  Continue Shopping
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <Card key={order.id} className="overflow-hidden">
                  <CardHeader className="bg-muted/50">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">
                          Order #{order.order_number}
                        </CardTitle>
                        <CardDescription>
                          Placed on {formatDate(order.created_at)}
                        </CardDescription>
                      </div>
                      <Badge className={getStatusColor(order.status)}>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(order.status)}
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </div>
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      {order.order_items.map((item) => (
                        <div key={item.id} className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium">{item.product_name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {item.product_description}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Quantity: {item.quantity}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">
                              {formatPrice(item.total_price)}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {formatPrice(item.unit_price)} each
                            </p>
                          </div>
                        </div>
                      ))}
                      
                      <Separator />
                      
                      <div className="flex items-center justify-between pt-2">
                        <div className="text-sm text-muted-foreground">
                          {order.shipping_address_line1 && (
                            <p>
                              Shipping to: {order.shipping_address_line1}, {order.shipping_city}, {order.shipping_state}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold">
                            Total: {formatPrice(order.total_amount)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Orders;