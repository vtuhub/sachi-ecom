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
import { Avatar } from "@/components/ui/avatar";
import { LogOut } from "lucide-react";

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
  const { user, loading, signOut } = useAuth();
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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md animate-pulse h-96 bg-muted/50" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 flex flex-col items-center">
        <Card className="w-full max-w-2xl p-0 overflow-hidden">
          <CardContent className="p-8 flex flex-col gap-6">
            <div className="flex flex-col items-center gap-2 mb-4">
              <Avatar className="w-20 h-20 text-2xl font-bold bg-muted text-primary-foreground">
                {user.user_metadata?.first_name?.[0] || user.email?.[0] || "U"}
              </Avatar>
              <h1 className="text-2xl font-bold text-foreground">My Profile</h1>
              <span className="text-muted-foreground text-sm">{user.email}</span>
            </div>
            <Separator />
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="first_name">First Name</Label>
                <Input id="first_name" value={profile.first_name} onChange={e => handleInputChange('first_name', e.target.value)} required className="mb-2" />
              </div>
              <div>
                <Label htmlFor="last_name">Last Name</Label>
                <Input id="last_name" value={profile.last_name} onChange={e => handleInputChange('last_name', e.target.value)} required className="mb-2" />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" value={profile.phone} onChange={e => handleInputChange('phone', e.target.value)} className="mb-2" />
              </div>
              <div className="md:col-span-2 flex justify-end">
                <Button type="submit" variant="sage" size="lg" className="w-full md:w-auto" disabled={isLoading} aria-label="Save profile">
                  {isLoading ? "Saving..." : "Save Profile"}
                </Button>
              </div>
            </form>
            <Separator />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-muted/50">
                <CardContent className="p-4">
                  <h2 className="font-semibold mb-2 text-foreground">Shipping Address</h2>
                  <div className="text-sm text-muted-foreground">
                    {profile.shipping_address_line1 && <div>{profile.shipping_address_line1}</div>}
                    {profile.shipping_address_line2 && <div>{profile.shipping_address_line2}</div>}
                    {profile.shipping_city && <div>{profile.shipping_city}, {profile.shipping_state} {profile.shipping_postal_code}</div>}
                    {profile.shipping_country && <div>{profile.shipping_country}</div>}
                    {!profile.shipping_address_line1 && <div className="italic">No shipping address saved.</div>}
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-muted/50">
                <CardContent className="p-4">
                  <h2 className="font-semibold mb-2 text-foreground">Billing Address</h2>
                  <div className="text-sm text-muted-foreground">
                    {profile.billing_address_line1 && <div>{profile.billing_address_line1}</div>}
                    {profile.billing_address_line2 && <div>{profile.billing_address_line2}</div>}
                    {profile.billing_city && <div>{profile.billing_city}, {profile.billing_state} {profile.billing_postal_code}</div>}
                    {profile.billing_country && <div>{profile.billing_country}</div>}
                    {!profile.billing_address_line1 && <div className="italic">No billing address saved.</div>}
                  </div>
                </CardContent>
              </Card>
            </div>
            <Separator />
            <div className="flex justify-end">
              <Button type="button" variant="destructive" size="lg" onClick={signOut} aria-label="Sign out">
                <LogOut className="h-5 w-5 mr-2" />Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default Profile;