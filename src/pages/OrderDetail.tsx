import { useState, useEffect } from "react";
import { useParams, Navigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Header } from "@/components/Header";
import Footer from "@/components/Footer";
import OrderTracking from "@/components/OrderTracking";
import { ArrowLeft, Package, MapPin, Calendar, DollarSign } from "lucide-react";
import productSweater from "@/assets/product-sweater.jpg";
import productTee from "@/assets/product-tee.jpg";
import productBlazer from "@/assets/product-blazer.jpg";
import type { Tables } from "@/integrations/supabase/types";

const productImages: Record<string, string> = {
  "Minimalist Wool Sweater": productSweater,
  "Organic Cotton Tee": productTee,
  "Tailored Linen Blazer": productBlazer,
  "Wide-Leg Trousers": productSweater,
  "Cashmere Scarf": productTee,
  "Silk Midi Dress": productBlazer,
};

type Order = Tables<"orders"> & {
  order_items: Tables<"order_items">[];
};

const OrderDetail = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user && orderId) {
      fetchOrder();
    }
  }, [user, orderId]);

  const fetchOrder = async () => {
    try {
      const { data: orderData, error } = await supabase
        .from("orders")
        .select(`
          *,
          order_items (*)
        `)
        .eq("id", orderId)
        .eq("user_id", user?.id)
        .single();

      if (error) throw error;

      setOrder(orderData);
    } catch (error) {
      console.error("Error fetching order:", error);
      toast({
        title: "Error",
        description: "Failed to load order details.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Package className="h-4 w-4" />;
      case "processing":
        return <Package className="h-4 w-4" />;
      case "shipped":
        return <Package className="h-4 w-4" />;
      case "delivered":
        return <Package className="h-4 w-4" />;
      case "cancelled":
        return <Package className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
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
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4 text-foreground">Order Not Found</h1>
            <p className="text-muted-foreground mb-6">The order you're looking for doesn't exist or you don't have permission to view it.</p>
            <Button asChild variant="sage">
              <Link to="/orders">Back to Orders</Link>
            </Button>
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
        <div className="mb-6">
          <Button variant="ghost" asChild className="mb-4">
            <Link to="/orders" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Orders
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Summary */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">Order #{order.order_number}</CardTitle>
                    <CardDescription>Placed on {formatDate(order.created_at)}</CardDescription>
                  </div>
                  <Badge className={`px-3 py-1 text-sm font-semibold ${getStatusColor(order.status)}`}>
                    {order.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Order Items */}
                <div>
                  <h3 className="font-semibold mb-4">Items</h3>
                  <div className="space-y-4">
                    {order.order_items.map((item) => (
                      <div key={item.id} className="flex items-center gap-4 p-4 border rounded-lg">
                        <img 
                          src={productImages[item.product_name] || productSweater} 
                          alt={item.product_name} 
                          className="w-16 h-20 object-cover rounded border" 
                        />
                        <div className="flex-1">
                          <div className="font-medium text-foreground">{item.product_name}</div>
                          <div className="text-sm text-muted-foreground">Qty: {item.quantity}</div>
                          <div className="text-sm text-muted-foreground">
                            {formatPrice(item.unit_price)} each
                          </div>
                        </div>
                        <div className="font-semibold text-foreground">
                          {formatPrice(item.total_price)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Order Total */}
                <div className="flex items-center justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span>{formatPrice(order.total_amount)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Tracking and Return Information */}
            <OrderTracking order={order} />
          </div>

          {/* Order Details Sidebar */}
          <div className="space-y-6">
            {/* Shipping Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm">
                  {order.shipping_address_line1}
                  {order.shipping_address_line2 && <br />}
                  {order.shipping_address_line2}
                </p>
                <p className="text-sm">
                  {order.shipping_city}, {order.shipping_state} {order.shipping_postal_code}
                </p>
                <p className="text-sm">{order.shipping_country}</p>
              </CardContent>
            </Card>

            {/* Order Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Order Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Order Date:</span>
                  <span className="text-sm font-medium">{formatDate(order.created_at)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Status:</span>
                  <Badge variant="outline" className="text-xs">
                    {order.status}
                  </Badge>
                </div>
                {order.estimated_delivery && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Estimated Delivery:</span>
                    <span className="text-sm font-medium">
                      {new Date(order.estimated_delivery).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {order.actual_delivery && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Delivered:</span>
                    <span className="text-sm font-medium">
                      {new Date(order.actual_delivery).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payment Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Payment Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Subtotal:</span>
                  <span className="text-sm font-medium">{formatPrice(order.total_amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Shipping:</span>
                  <span className="text-sm font-medium">Free</span>
                </div>
                <Separator />
                <div className="flex justify-between text-base font-semibold">
                  <span>Total:</span>
                  <span>{formatPrice(order.total_amount)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default OrderDetail; 