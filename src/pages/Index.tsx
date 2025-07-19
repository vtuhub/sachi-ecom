import { Header } from "@/components/Header";
import Hero from "@/components/Hero";
import ProductGrid from "@/components/ProductGrid";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import productSweater from "@/assets/product-sweater.jpg";
import productTee from "@/assets/product-tee.jpg";
import productBlazer from "@/assets/product-blazer.jpg";

const demoCategories = [
  {
    name: "Knitwear",
    image: productSweater,
    description: "Cozy sweaters and cardigans for every season.",
  },
  {
    name: "Basics",
    image: productTee,
    description: "Timeless tees and everyday essentials.",
  },
  {
    name: "Outerwear",
    image: productBlazer,
    description: "Blazers, jackets, and more for layering.",
  },
];

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
      {/* Featured Categories */}
      <section className="py-12 bg-muted/50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8 text-center">Shop by Category</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {demoCategories.map((cat, i) => (
              <Card key={i} className="overflow-hidden group hover:shadow-lg transition-all duration-200">
                <div className="relative h-48 overflow-hidden">
                  <img src={cat.image} alt={cat.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
                <CardContent className="p-4 flex flex-col gap-2">
                  <h3 className="text-lg font-semibold text-foreground">{cat.name}</h3>
                  <p className="text-muted-foreground text-sm mb-2">{cat.description}</p>
                  <Button variant="sage" size="sm" className="w-fit mt-auto">Shop {cat.name}</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      {/* Product Grid Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 lg:px-6 rounded-2xl shadow-md bg-card">
          <ProductGrid />
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Index;
