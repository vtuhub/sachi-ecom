import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Users, 
  Search,
  Eye,
  Mail,
  Calendar,
  ShoppingBag,
  MapPin,
  TrendingUp
} from "lucide-react";
import { format } from "date-fns";

interface Customer {
  id: string;
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  shipping_city: string | null;
  shipping_state: string | null;
  shipping_country: string | null;
  created_at: string;
  updated_at: string;
}

interface CustomerStats {
  total_orders: number;
  total_spent: number;
  last_order_date: string | null;
  average_order_value: number;
}

const CustomerManagement = () => {
  const { toast } = useToast();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerStats, setCustomerStats] = useState<CustomerStats | null>(null);
  const [customerOrders, setCustomerOrders] = useState<any[]>([]);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCustomers(data || []);
    } catch (error) {
      console.error("Error fetching customers:", error);
      toast({
        title: "Error",
        description: "Failed to load customers.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerStats = async (userId: string) => {
    try {
      // Fetch customer orders
      const { data: orders, error: ordersError } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (ordersError) throw ordersError;

      setCustomerOrders(orders || []);

      // Calculate stats
      if (orders && orders.length > 0) {
        const totalOrders = orders.length;
        const totalSpent = orders.reduce((sum, order) => sum + order.total_amount, 0);
        const lastOrderDate = orders[0].created_at;
        const averageOrderValue = totalSpent / totalOrders;

        setCustomerStats({
          total_orders: totalOrders,
          total_spent: totalSpent,
          last_order_date: lastOrderDate,
          average_order_value: averageOrderValue,
        });
      } else {
        setCustomerStats({
          total_orders: 0,
          total_spent: 0,
          last_order_date: null,
          average_order_value: 0,
        });
      }
    } catch (error) {
      console.error("Error fetching customer stats:", error);
      toast({
        title: "Error",
        description: "Failed to load customer statistics.",
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
    return format(new Date(dateString), "MMM dd, yyyy");
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

  const handleViewCustomer = async (customer: Customer) => {
    setSelectedCustomer(customer);
    await fetchCustomerStats(customer.user_id);
    setIsDetailsOpen(true);
  };

  const filteredCustomers = customers.filter(customer => {
    const fullName = `${customer.first_name || ""} ${customer.last_name || ""}`.toLowerCase();
    const location = `${customer.shipping_city || ""} ${customer.shipping_state || ""}`.toLowerCase();
    
    return fullName.includes(searchTerm.toLowerCase()) ||
           location.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Customer Management</h2>
          <p className="text-muted-foreground">View and manage customer information</p>
        </div>
        <div className="text-sm text-muted-foreground">
          Total Customers: {customers.length}
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search customers by name or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Customers Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-4 w-3/4 bg-muted rounded mb-2"></div>
                <div className="h-3 w-1/2 bg-muted rounded mb-4"></div>
                <div className="h-6 w-1/4 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCustomers.map((customer) => (
            <Card key={customer.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-1">
                      {customer.first_name && customer.last_name 
                        ? `${customer.first_name} ${customer.last_name}`
                        : "Customer"}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <Calendar className="h-4 w-4" />
                      <span>Joined {formatDate(customer.created_at)}</span>
                    </div>
                    {customer.phone && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <span>📞 {customer.phone}</span>
                      </div>
                    )}
                    {customer.shipping_city && customer.shipping_state && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{customer.shipping_city}, {customer.shipping_state}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <Badge variant="outline" className="text-xs">
                    {customer.shipping_country || "IN"}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewCustomer(customer)}
                    className="flex items-center gap-1"
                  >
                    <Eye className="h-4 w-4" />
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Customer Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Customer Details - {selectedCustomer?.first_name && selectedCustomer?.last_name 
                ? `${selectedCustomer.first_name} ${selectedCustomer.last_name}`
                : "Customer"}
            </DialogTitle>
            <DialogDescription>
              Complete customer information and order history
            </DialogDescription>
          </DialogHeader>

          {selectedCustomer && customerStats && (
            <div className="space-y-6">
              {/* Customer Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                    <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{customerStats.total_orders}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatPrice(customerStats.total_spent)}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatPrice(customerStats.average_order_value)}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Last Order</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm font-medium">
                      {customerStats.last_order_date ? formatDate(customerStats.last_order_date) : "Never"}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Customer Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Customer Information</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p><span className="font-medium">Name:</span> {selectedCustomer.first_name} {selectedCustomer.last_name}</p>
                    <p><span className="font-medium">Phone:</span> {selectedCustomer.phone || "Not provided"}</p>
                    <p><span className="font-medium">Joined:</span> {formatDate(selectedCustomer.created_at)}</p>
                  </div>
                  <div>
                    <p><span className="font-medium">City:</span> {selectedCustomer.shipping_city || "Not provided"}</p>
                    <p><span className="font-medium">State:</span> {selectedCustomer.shipping_state || "Not provided"}</p>
                    <p><span className="font-medium">Country:</span> {selectedCustomer.shipping_country || "IN"}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Order History */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Order History</CardTitle>
                </CardHeader>
                <CardContent>
                  {customerOrders.length > 0 ? (
                    <div className="space-y-4">
                      {customerOrders.map((order) => (
                        <div key={order.id} className="flex items-center justify-between py-3 border-b last:border-b-0">
                          <div>
                            <p className="font-medium">{order.order_number}</p>
                            <p className="text-sm text-muted-foreground">{formatDate(order.created_at)}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-semibold">{formatPrice(order.total_amount)}</span>
                            <Badge className={`${getStatusColor(order.status)} text-white text-xs`}>
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <ShoppingBag className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No orders yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CustomerManagement;