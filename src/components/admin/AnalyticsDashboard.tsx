import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  TrendingUp, 
  Users, 
  ShoppingBag, 
  Package, 
  IndianRupee,
  ArrowUpRight,
  ArrowDownRight,
  Calendar
} from "lucide-react";

interface AnalyticsData {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  revenueGrowth: number;
  orderGrowth: number;
  customerGrowth: number;
  topCategories: Array<{
    category: string;
    count: number;
    revenue: number;
  }>;
  recentOrders: Array<{
    id: string;
    order_number: string;
    total_amount: number;
    status: string;
    created_at: string;
    customer_name?: string;
  }>;
  ordersByStatus: Array<{
    status: string;
    count: number;
  }>;
  monthlyRevenue: Array<{
    month: string;
    revenue: number;
    orders: number;
  }>;
}

const AnalyticsDashboard = () => {
  const { toast } = useToast();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      // Fetch all necessary data
      const [
        ordersResponse,
        customersResponse,
        productsResponse,
        orderItemsResponse
      ] = await Promise.all([
        supabase.from("orders").select("*"),
        supabase.from("profiles").select("*"),
        supabase.from("products").select("*"),
        supabase.from("order_items").select("*")
      ]);

      if (ordersResponse.error) throw ordersResponse.error;
      if (customersResponse.error) throw customersResponse.error;
      if (productsResponse.error) throw productsResponse.error;
      if (orderItemsResponse.error) throw orderItemsResponse.error;

      const orders = ordersResponse.data || [];
      const customers = customersResponse.data || [];
      const products = productsResponse.data || [];
      const orderItems = orderItemsResponse.data || [];

      // Calculate basic metrics
      const totalRevenue = orders.reduce((sum, order) => sum + order.total_amount, 0);
      const totalOrders = orders.length;
      const totalCustomers = customers.length;
      const totalProducts = products.length;

      // Calculate growth (dummy data for now - you'd compare with previous period)
      const revenueGrowth = 12.5;
      const orderGrowth = 8.3;
      const customerGrowth = 15.7;

      // Top categories analysis
      const categoryStats = orderItems.reduce((acc: any, item) => {
        // Extract category from product name (simplified approach)
        let category = "Other";
        if (item.product_name.toLowerCase().includes("sweater") || item.product_name.toLowerCase().includes("knit")) {
          category = "Knitwear";
        } else if (item.product_name.toLowerCase().includes("tee") || item.product_name.toLowerCase().includes("basic")) {
          category = "Basics";
        } else if (item.product_name.toLowerCase().includes("blazer") || item.product_name.toLowerCase().includes("jacket")) {
          category = "Outerwear";
        } else if (item.product_name.toLowerCase().includes("trouser") || item.product_name.toLowerCase().includes("pant")) {
          category = "Bottoms";
        } else if (item.product_name.toLowerCase().includes("dress")) {
          category = "Dresses";
        } else if (item.product_name.toLowerCase().includes("scarf") || item.product_name.toLowerCase().includes("accessory")) {
          category = "Accessories";
        }

        if (!acc[category]) {
          acc[category] = { category, count: 0, revenue: 0 };
        }
        acc[category].count += item.quantity;
        acc[category].revenue += item.total_price;
        return acc;
      }, {});

      const topCategories = Object.values(categoryStats)
        .sort((a: any, b: any) => b.revenue - a.revenue)
        .slice(0, 5);

      // Recent orders
      const recentOrders = orders
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 10)
        .map(order => ({
          id: order.id,
          order_number: order.order_number,
          total_amount: order.total_amount,
          status: order.status,
          created_at: order.created_at,
          customer_name: undefined
        }));

      // Orders by status
      const statusStats = orders.reduce((acc: any, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1;
        return acc;
      }, {});

      const ordersByStatus = Object.entries(statusStats).map(([status, count]) => ({
        status,
        count: count as number
      }));

      // Monthly revenue (simplified - just current month for now)
      const monthlyRevenue = [{
        month: new Date().toLocaleString('default', { month: 'long', year: 'numeric' }),
        revenue: totalRevenue,
        orders: totalOrders
      }];

      setAnalytics({
        totalRevenue,
        totalOrders,
        totalCustomers,
        totalProducts,
        revenueGrowth,
        orderGrowth,
        customerGrowth,
        topCategories: topCategories as any,
        recentOrders,
        ordersByStatus,
        monthlyRevenue
      });

    } catch (error) {
      console.error("Error fetching analytics:", error);
      toast({
        title: "Error",
        description: "Failed to load analytics data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (priceInCents: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(priceInCents / 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
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

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Loading skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 w-1/2 bg-muted rounded mb-2"></div>
                <div className="h-8 w-3/4 bg-muted rounded mb-2"></div>
                <div className="h-3 w-1/3 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Failed to load analytics data</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-foreground">Analytics Dashboard</h2>
        <p className="text-muted-foreground">Overview of your store's performance</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(analytics.totalRevenue)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <ArrowUpRight className="h-3 w-3 mr-1 text-green-500" />
              {analytics.revenueGrowth}% from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalOrders}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <ArrowUpRight className="h-3 w-3 mr-1 text-green-500" />
              {analytics.orderGrowth}% from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalCustomers}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <ArrowUpRight className="h-3 w-3 mr-1 text-green-500" />
              {analytics.customerGrowth}% from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalProducts}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <span>Active products in catalog</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Categories */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.topCategories.map((category, index) => (
                <div key={category.category} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{category.category}</p>
                      <p className="text-sm text-muted-foreground">{category.count} items sold</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatPrice(category.revenue)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Order Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Orders by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.ordersByStatus
                .sort((a, b) => b.count - a.count)
                .map((status) => (
                <div key={status.status} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge className={`${getStatusColor(status.status)} text-white`}>
                      {status.status.charAt(0).toUpperCase() + status.status.slice(1)}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{status.count} orders</p>
                    <p className="text-sm text-muted-foreground">
                      {((status.count / analytics.totalOrders) * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="font-medium text-foreground">{order.order_number}</p>
                    <p className="text-sm text-muted-foreground">
                      {order.customer_name || "Customer"} • {formatDate(order.created_at)}
                    </p>
                  </div>
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
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsDashboard;