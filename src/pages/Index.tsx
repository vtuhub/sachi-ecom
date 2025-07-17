import { Header } from "@/components/Header";
import Hero from "@/components/Hero";
import ProductGrid from "@/components/ProductGrid";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen">
      <Header />
      {user && (
        <div className="bg-primary/10 text-center py-2">
          <p className="text-sm text-primary">Welcome back, {user.user_metadata?.first_name || user.email}!</p>
        </div>
      )}
      <Hero />
      <ProductGrid />
      <Footer />
    </div>
  );
};

export default Index;
