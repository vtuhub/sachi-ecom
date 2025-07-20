import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Package, Truck, CheckCircle, Clock, MapPin, ExternalLink, RotateCcw, AlertCircle } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

interface OrderTrackingProps {
  order: Tables<"orders"> & {
    order_items: Tables<"order_items">[];
  };
}

interface TrackingUpdate {
  id: string;
  status: string;
  location: string | null;
  description: string | null;
  timestamp: string;
}

const OrderTracking = ({ order }: OrderTrackingProps) => {
  const { toast } = useToast();
  const [trackingUpdates, setTrackingUpdates] = useState<TrackingUpdate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isReturnDialogOpen, setIsReturnDialogOpen] = useState(false);
  const [returnReason, setReturnReason] = useState("");
  const [returnNotes, setReturnNotes] = useState("");

  useEffect(() => {
    if (order.id) {
      fetchTrackingUpdates();
    }
  }, [order.id]);

  const fetchTrackingUpdates = async () => {
    try {
      const { data, error } = await supabase
        .from("order_tracking_updates")
        .select("*")
        .eq("order_id", order.id)
        .order("timestamp", { ascending: false });

      if (error) throw error;
      setTrackingUpdates(data || []);
    } catch (error) {
      console.error("Error fetching tracking updates:", error);
    }
  };

  const handleReturnRequest = async () => {
    if (!returnReason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a reason for the return.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("orders")
        .update({
          return_status: "requested",
          return_reason: returnReason,
          return_notes: returnNotes,
          return_requested_at: new Date().toISOString(),
        })
        .eq("id", order.id);

      if (error) throw error;

      toast({
        title: "Return Requested",
        description: "Your return request has been submitted successfully.",
      });

      setIsReturnDialogOpen(false);
      setReturnReason("");
      setReturnNotes("");
      
      // Refresh the page to show updated status
      window.location.reload();
    } catch (error) {
      console.error("Error requesting return:", error);
      toast({
        title: "Error",
        description: "Failed to submit return request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getReturnStatusColor = (status: string | null) => {
    switch (status) {
      case "requested":
        return "bg-yellow-100 text-yellow-800";
      case "approved":
        return "bg-blue-100 text-blue-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "returned":
        return "bg-purple-100 text-purple-800";
      case "refunded":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getReturnStatusText = (status: string | null) => {
    switch (status) {
      case "requested":
        return "Return Requested";
      case "approved":
        return "Return Approved";
      case "rejected":
        return "Return Rejected";
      case "returned":
        return "Item Returned";
      case "refunded":
        return "Refunded";
      default:
        return "No Return";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatPrice = (priceInCents: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(priceInCents / 100);
  };

  return (
    <div className="space-y-6">
      {/* Tracking Information */}
      {(order.tracking_number || order.shipping_carrier || order.tracking_url) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Tracking Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {order.tracking_number && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Tracking Number:</span>
                <span className="text-sm text-muted-foreground">{order.tracking_number}</span>
              </div>
            )}
            {order.shipping_carrier && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Carrier:</span>
                <span className="text-sm text-muted-foreground">{order.shipping_carrier}</span>
              </div>
            )}
            {order.tracking_url && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Track Package:</span>
                <Button variant="outline" size="sm" asChild>
                  <a href={order.tracking_url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Track
                  </a>
                </Button>
              </div>
            )}
            {order.estimated_delivery && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Estimated Delivery:</span>
                <span className="text-sm text-muted-foreground">
                  {new Date(order.estimated_delivery).toLocaleDateString()}
                </span>
              </div>
            )}
            {order.actual_delivery && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Delivered:</span>
                <span className="text-sm text-muted-foreground">
                  {new Date(order.actual_delivery).toLocaleDateString()}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tracking Updates */}
      {trackingUpdates.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Tracking History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {trackingUpdates.map((update, index) => (
                <div key={update.id} className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{update.status}</span>
                      {update.location && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          {update.location}
                        </div>
                      )}
                    </div>
                    {update.description && (
                      <p className="text-sm text-muted-foreground mb-1">{update.description}</p>
                    )}
                    <span className="text-xs text-muted-foreground">{formatDate(update.timestamp)}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Return Information */}
      {order.return_status && order.return_status !== "none" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RotateCcw className="h-5 w-5" />
              Return Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Status:</span>
              <Badge className={getReturnStatusColor(order.return_status)}>
                {getReturnStatusText(order.return_status)}
              </Badge>
            </div>
            {order.return_reason && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Reason:</span>
                <span className="text-sm text-muted-foreground">{order.return_reason}</span>
              </div>
            )}
            {order.return_requested_at && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Requested:</span>
                <span className="text-sm text-muted-foreground">
                  {formatDate(order.return_requested_at)}
                </span>
              </div>
            )}
            {order.return_processed_at && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Processed:</span>
                <span className="text-sm text-muted-foreground">
                  {formatDate(order.return_processed_at)}
                </span>
              </div>
            )}
            {order.refund_amount && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Refund Amount:</span>
                <span className="text-sm font-semibold text-green-600">
                  {formatPrice(order.refund_amount)}
                </span>
              </div>
            )}
            {order.return_notes && (
              <div>
                <span className="text-sm font-medium">Notes:</span>
                <p className="text-sm text-muted-foreground mt-1">{order.return_notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Return Request Button */}
      {order.status === "delivered" && (!order.return_status || order.return_status === "none") && (
        <Card>
          <CardContent className="pt-6">
            <Dialog open={isReturnDialogOpen} onOpenChange={setIsReturnDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Request Return
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Request Return</DialogTitle>
                  <DialogDescription>
                    Please provide details about your return request.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Reason for Return</label>
                    <Select value={returnReason} onValueChange={setReturnReason}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a reason" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="wrong_size">Wrong Size</SelectItem>
                        <SelectItem value="defective">Defective Item</SelectItem>
                        <SelectItem value="not_as_described">Not as Described</SelectItem>
                        <SelectItem value="changed_mind">Changed Mind</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Additional Notes (Optional)</label>
                    <Textarea
                      placeholder="Please provide any additional details..."
                      value={returnNotes}
                      onChange={(e) => setReturnNotes(e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsReturnDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleReturnRequest} disabled={isLoading}>
                    {isLoading ? "Submitting..." : "Submit Request"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default OrderTracking; 