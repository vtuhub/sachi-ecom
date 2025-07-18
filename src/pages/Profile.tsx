import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Navigate } from "react-router-dom";
import { Header } from "@/components/Header";
import Footer from "@/components/Footer";

interface ProfileData {
  first_name: string;
  last_name: string;
  phone: string;
  shipping_address_line1: string;
  shipping_address_line2: string;
  shipping_city: string;
  shipping_state: string;
  shipping_postal_code: string;
  shipping_country: string;
  billing_address_line1: string;
  billing_address_line2: string;
  billing_city: string;
  billing_state: string;
  billing_postal_code: string;
  billing_country: string;
}

const Profile = () => {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [profile, setProfile] = useState<ProfileData>({
    first_name: "",
    last_name: "",
    phone: "",
    shipping_address_line1: "",
    shipping_address_line2: "",
    shipping_city: "",
    shipping_state: "",
    shipping_postal_code: "",
    shipping_country: "US",
    billing_address_line1: "",
    billing_address_line2: "",
    billing_city: "",
    billing_state: "",
    billing_postal_code: "",
    billing_country: "US",
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user?.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setProfile({
          first_name: data.first_name || "",
          last_name: data.last_name || "",
          phone: data.phone || "",
          shipping_address_line1: data.shipping_address_line1 || "",
          shipping_address_line2: data.shipping_address_line2 || "",
          shipping_city: data.shipping_city || "",
          shipping_state: data.shipping_state || "",
          shipping_postal_code: data.shipping_postal_code || "",
          shipping_country: data.shipping_country || "US",
          billing_address_line1: data.billing_address_line1 || "",
          billing_address_line2: data.billing_address_line2 || "",
          billing_city: data.billing_city || "",
          billing_state: data.billing_state || "",
          billing_postal_code: data.billing_postal_code || "",
          billing_country: data.billing_country || "US",
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast({
        title: "Error",
        description: "Failed to load profile information.",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .upsert({
          user_id: user?.id,
          ...profile,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Profile updated successfully!",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
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
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
            <p className="text-muted-foreground mt-2">
              Manage your personal information and addresses
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                  Update your personal details and contact information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="first_name">First Name</Label>
                    <Input
                      id="first_name"
                      value={profile.first_name}
                      onChange={(e) => handleInputChange("first_name", e.target.value)}
                      placeholder="Enter your first name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="last_name">Last Name</Label>
                    <Input
                      id="last_name"
                      value={profile.last_name}
                      onChange={(e) => handleInputChange("last_name", e.target.value)}
                      placeholder="Enter your last name"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="Enter your phone number"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Shipping Address */}
            <Card>
              <CardHeader>
                <CardTitle>Shipping Address</CardTitle>
                <CardDescription>
                  Your default shipping address for orders
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="shipping_address_line1">Address Line 1</Label>
                  <Input
                    id="shipping_address_line1"
                    value={profile.shipping_address_line1}
                    onChange={(e) => handleInputChange("shipping_address_line1", e.target.value)}
                    placeholder="Street address"
                  />
                </div>
                <div>
                  <Label htmlFor="shipping_address_line2">Address Line 2 (Optional)</Label>
                  <Input
                    id="shipping_address_line2"
                    value={profile.shipping_address_line2}
                    onChange={(e) => handleInputChange("shipping_address_line2", e.target.value)}
                    placeholder="Apartment, suite, etc."
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="shipping_city">City</Label>
                    <Input
                      id="shipping_city"
                      value={profile.shipping_city}
                      onChange={(e) => handleInputChange("shipping_city", e.target.value)}
                      placeholder="City"
                    />
                  </div>
                  <div>
                    <Label htmlFor="shipping_state">State</Label>
                    <Input
                      id="shipping_state"
                      value={profile.shipping_state}
                      onChange={(e) => handleInputChange("shipping_state", e.target.value)}
                      placeholder="State"
                    />
                  </div>
                  <div>
                    <Label htmlFor="shipping_postal_code">ZIP Code</Label>
                    <Input
                      id="shipping_postal_code"
                      value={profile.shipping_postal_code}
                      onChange={(e) => handleInputChange("shipping_postal_code", e.target.value)}
                      placeholder="ZIP code"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Billing Address */}
            <Card>
              <CardHeader>
                <CardTitle>Billing Address</CardTitle>
                <CardDescription>
                  Your billing address for payment processing
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="billing_address_line1">Address Line 1</Label>
                  <Input
                    id="billing_address_line1"
                    value={profile.billing_address_line1}
                    onChange={(e) => handleInputChange("billing_address_line1", e.target.value)}
                    placeholder="Street address"
                  />
                </div>
                <div>
                  <Label htmlFor="billing_address_line2">Address Line 2 (Optional)</Label>
                  <Input
                    id="billing_address_line2"
                    value={profile.billing_address_line2}
                    onChange={(e) => handleInputChange("billing_address_line2", e.target.value)}
                    placeholder="Apartment, suite, etc."
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="billing_city">City</Label>
                    <Input
                      id="billing_city"
                      value={profile.billing_city}
                      onChange={(e) => handleInputChange("billing_city", e.target.value)}
                      placeholder="City"
                    />
                  </div>
                  <div>
                    <Label htmlFor="billing_state">State</Label>
                    <Input
                      id="billing_state"
                      value={profile.billing_state}
                      onChange={(e) => handleInputChange("billing_state", e.target.value)}
                      placeholder="State"
                    />
                  </div>
                  <div>
                    <Label htmlFor="billing_postal_code">ZIP Code</Label>
                    <Input
                      id="billing_postal_code"
                      value={profile.billing_postal_code}
                      onChange={(e) => handleInputChange("billing_postal_code", e.target.value)}
                      placeholder="ZIP code"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Profile;