import { useState, useEffect, useCallback, createContext, useContext, ReactNode, FC } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const LOCAL_KEY = "wishlist";

export const WishlistContext = createContext<any>(null);

export const WishlistProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Load wishlist from Supabase or localStorage
  useEffect(() => {
    async function loadWishlist() {
      setLoading(true);
      if (user) {
        const { data, error } = await supabase
          .from("wishlist_items")
          .select("product_id")
          .eq("user_id", user.id);
        if (!error && data) {
          setWishlist(data.map((item) => item.product_id));
          localStorage.setItem(LOCAL_KEY, JSON.stringify(data.map((item) => item.product_id)));
        }
      } else {
        const local = localStorage.getItem(LOCAL_KEY);
        setWishlist(local ? JSON.parse(local) : []);
      }
      setLoading(false);
    }
    loadWishlist();
  }, [user]);

  // Add to wishlist
  const addToWishlist = useCallback(async (productId: string) => {
    if (wishlist.includes(productId)) return;
    setWishlist((prev) => {
      const next = [...prev, productId];
      localStorage.setItem(LOCAL_KEY, JSON.stringify(next));
      return next;
    });
    if (user) {
      const { error } = await supabase.from("wishlist_items").upsert(
        { user_id: user.id, product_id: productId },
        { onConflict: ["user_id", "product_id"] }
      );
      if (error) {
        toast({ title: "Error", description: "Failed to add to wishlist.", variant: "destructive" });
      }
    }
    toast({ title: "Added to wishlist" });
  }, [user, wishlist, toast]);

  // Remove from wishlist
  const removeFromWishlist = useCallback(async (productId: string) => {
    setWishlist((prev) => {
      const next = prev.filter((id) => id !== productId);
      localStorage.setItem(LOCAL_KEY, JSON.stringify(next));
      return next;
    });
    if (user) {
      const { error } = await supabase.from("wishlist_items").delete().eq("user_id", user.id).eq("product_id", productId);
      if (error) {
        toast({ title: "Error", description: "Failed to remove from wishlist.", variant: "destructive" });
      }
    }
    toast({ title: "Removed from wishlist" });
  }, [user, toast]);

  // Sync localStorage to Supabase on login
  useEffect(() => {
    async function syncOnLogin() {
      if (user) {
        const local = localStorage.getItem(LOCAL_KEY);
        if (local) {
          const ids: string[] = JSON.parse(local);
          for (const productId of ids) {
            await supabase.from("wishlist_items").upsert(
              { user_id: user.id, product_id: productId },
              { onConflict: ["user_id", "product_id"] }
            );
          }
        }
      }
    }
    syncOnLogin();
  }, [user]);

  const isInWishlist = useCallback((productId: string) => wishlist.includes(productId), [wishlist]);

  return (
    <WishlistContext.Provider value={{ wishlist, isInWishlist, addToWishlist, removeFromWishlist, loading }}>
      {children}
    </WishlistContext.Provider>
  );
};

export function useWishlist() {
  return useContext(WishlistContext);
} 