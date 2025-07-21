import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { 
  Package, 
  Search,
  Eye,
  Edit,
  Truck,
  MapPin,
  Calendar,
  User,
  CreditCard
} from "lucide-react";
import { format } from "date-fns";

interface Order {
  id: string;
  order_number: string;
  user_id: string;
  total_amount: number;
  currency: string;
  status: string;
  shipping_address_line1: string;
  shipping_address_line2: string | null;
  shipping_city: string;
  shipping_state: string;
  shipping_postal_code: string;
  shipping_country: string;
  tracking_number: string | null;
  shipping_carrier: string | null;
  tracking_url: string | null;
  estimated_delivery: string | null;
  actual_delivery: string | null;
  return_status: string | null;
  return_reason: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface OrderItem {
  id: string;
  product_name: string;
  product_description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

const OrderManagement = () => {
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);

  const [updateForm, setUpdateForm] = useState({
    status: "",
    tracking_number: "",
    shipping_carrier: "",
    tracking_url: "",
    estimated_delivery: "",
    notes: "",
  });

  const orderStatuses = [
    "pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "returned"
  ];

  const shippingCarriers = [
    "BlueDart", "DTDC", "India Post", "Delhivery", "Ekart", "FedEx"
  ];

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast({
        title: "Error",
        description: "Failed to load orders.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderItems = async (orderId: string) => {
    try {
      const { data, error } = await supabase
        .from("order_items")
        .select("*")
        .eq("order_id", orderId);

      if (error) throw error;
      setOrderItems(data || []);
    } catch (error) {
      console.error("Error fetching order items:", error);
      toast({
        title: "Error",
        description: "Failed to load order items.",
        variant: "destructive",
      });
    }
  };

  const formatPrice = (priceInCents: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(priceInCents / 100);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMM dd, yyyy 'at' hh:mm a");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-500";
      case "confirmed": return "bg-blue-500";
      case "processing": return "bg-orange-500";
      case "shipped": return "bg-purple-500";
      case "delivered": return "bg-green-500";
      case "cancelled": return "bg-red-500";
      case "returned": return "bg-gray-500";
      default: return "bg-gray-500";
    }
  };

  const handleViewOrder = async (order: Order) => {
    setSelectedOrder(order);
    await fetchOrderItems(order.id);
    setIsDetailsOpen(true);
  };

  const handleUpdateOrder = (order: Order) => {
    setSelectedOrder(order);
    setUpdateForm({
      status: order.status,
      tracking_number: order.tracking_number || "",
      shipping_carrier: order.shipping_carrier || "",
      tracking_url: order.tracking_url || "",
      estimated_delivery: order.estimated_delivery || "",
      notes: order.notes || "",
    });
    setIsUpdateOpen(true);
  };

  const handleSubmitUpdate = async () => {
    if (!selectedOrder) return;

    try {
      const { error } = await supabase
        .from("orders")
        .update({
          status: updateForm.status,
          tracking_number: updateForm.tracking_number || null,
          shipping_carrier: updateForm.shipping_carrier || null,
          tracking_url: updateForm.tracking_url || null,
          estimated_delivery: updateForm.estimated_delivery || null,
          notes: updateForm.notes || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", selectedOrder.id);

      if (error) throw error;

      // Add tracking update if tracking number is provided
      if (updateForm.tracking_number && updateForm.status === "shipped") {
        await supabase
          .from("order_tracking_updates")
          .insert({
            order_id: selectedOrder.id,
            status: "shipped",
            description: `Order shipped via ${updateForm.shipping_carrier}`,
            location: `${selectedOrder.shipping_city}, ${selectedOrder.shipping_state}`,
            timestamp: new Date().toISOString(),
          });
      }

      toast({
        title: "Success",
        description: "Order updated successfully.",
      });

      setIsUpdateOpen(false);
      setSelectedOrder(null);
      fetchOrders();
    } catch (error) {
      console.error("Error updating order:", error);
      toast({
        title: "Error",
        description: "Failed to update order.",
        variant: "destructive",
      });
    }
  };

  const filteredOrders = orders.filter(order => {
    const customerName = "";
    
    const matchesSearch = 
      order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.shipping_city.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesStatus = selectedStatus === "all" || order.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Order Management</h2>
          <p className="text-muted-foreground">Manage and track customer orders</p>
        </div>
        <div className="text-sm text-muted-foreground">
          Total Orders: {orders.length}
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by order number, customer, or city..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {orderStatuses.map(status => (
                  <SelectItem key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-4 w-1/4 bg-muted rounded mb-2"></div>
                <div className="h-3 w-1/2 bg-muted rounded mb-4"></div>
                <div className="h-6 w-1/6 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <Card key={order.id}>
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">{order.order_number}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <User className="h-4 w-4" />
                        <span>Customer</span>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                        <span className="font-semibold text-foreground">
                          {formatPrice(order.total_amount)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(order.created_at)}</span>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-foreground">
                          {order.shipping_city}, {order.shipping_state}
                        </span>
                      </div>
                      {order.tracking_number && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Truck className="h-4 w-4" />
                          <span>{order.tracking_number}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Badge 
                      className={`${getStatusColor(order.status)} text-white`}
                    >
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </Badge>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewOrder(order)}
                        className="flex items-center gap-1"
                      >
                        <Eye className="h-4 w-4" />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUpdateOrder(order)}
                        className="flex items-center gap-1"
                      >
                        <Edit className="h-4 w-4" />
                        Update
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Order Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Details - {selectedOrder?.order_number}</DialogTitle>
            <DialogDescription>
              Complete order information and items
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6">
              {/* Customer & Shipping Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Customer Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p>
                        <span className="font-medium">Name:</span>{" "}
                        Customer
                      </p>
                      <p><span className="font-medium">Order Date:</span> {formatDate(selectedOrder.created_at)}</p>
                      <p><span className="font-medium">Total:</span> {formatPrice(selectedOrder.total_amount)}</p>
                      <div className="pt-2">
                        <Badge className={`${getStatusColor(selectedOrder.status)} text-white`}>
                          {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Shipping Address</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1">
                      <p>{selectedOrder.shipping_address_line1}</p>
                      {selectedOrder.shipping_address_line2 && (
                        <p>{selectedOrder.shipping_address_line2}</p>
                      )}
                      <p>{selectedOrder.shipping_city}, {selectedOrder.shipping_state} {selectedOrder.shipping_postal_code}</p>
                      <p>{selectedOrder.shipping_country}</p>
                    </div>
                    
                    {selectedOrder.tracking_number && (
                      <div className="mt-4 pt-4 border-t">
                        <p><span className="font-medium">Tracking:</span> {selectedOrder.tracking_number}</p>
                        <p><span className="font-medium">Carrier:</span> {selectedOrder.shipping_carrier}</p>
                        {selectedOrder.tracking_url && (
                          <a 
                            href={selectedOrder.tracking_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary hover:underline text-sm"
                          >
                            Track Package
                          </a>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Order Items */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Order Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {orderItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between py-3 border-b last:border-b-0">
                        <div className="flex-1">
                          <h4 className="font-medium text-foreground">{item.product_name}</h4>
                          <p className="text-sm text-muted-foreground">{item.product_description}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">Qty: {item.quantity}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatPrice(item.unit_price)} each
                          </p>
                          <p className="font-semibold">{formatPrice(item.total_price)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Notes */}
              {selectedOrder.notes && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{selectedOrder.notes}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Update Order Dialog */}
      <Dialog open={isUpdateOpen} onOpenChange={setIsUpdateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Order - {selectedOrder?.order_number}</DialogTitle>
            <DialogDescription>
              Update order status and tracking information
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="status">Order Status</Label>
              <Select value={updateForm.status} onValueChange={(value) => setUpdateForm({ ...updateForm, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {orderStatuses.map(status => (
                    <SelectItem key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tracking_number">Tracking Number</Label>
                <Input
                  id="tracking_number"
                  value={updateForm.tracking_number}
                  onChange={(e) => setUpdateForm({ ...updateForm, tracking_number: e.target.value })}
                  placeholder="Enter tracking number"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="shipping_carrier">Shipping Carrier</Label>
                <Select value={updateForm.shipping_carrier} onValueChange={(value) => setUpdateForm({ ...updateForm, shipping_carrier: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select carrier" />
                  </SelectTrigger>
                  <SelectContent>
                    {shippingCarriers.map(carrier => (
                      <SelectItem key={carrier} value={carrier}>
                        {carrier}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tracking_url">Tracking URL</Label>
              <Input
                id="tracking_url"
                value={updateForm.tracking_url}
                onChange={(e) => setUpdateForm({ ...updateForm, tracking_url: e.target.value })}
                placeholder="https://tracking.example.com/..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="estimated_delivery">Estimated Delivery</Label>
              <Input
                id="estimated_delivery"
                type="date"
                value={updateForm.estimated_delivery}
                onChange={(e) => setUpdateForm({ ...updateForm, estimated_delivery: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={updateForm.notes}
                onChange={(e) => setUpdateForm({ ...updateForm, notes: e.target.value })}
                placeholder="Add notes about this order..."
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setIsUpdateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitUpdate}>
              Update Order
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrderManagement;