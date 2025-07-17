import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Instagram, Twitter, Facebook, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-charcoal text-charcoal-foreground">
      <div className="container mx-auto px-4 lg:px-6">
        {/* Newsletter Section */}
        <div className="py-12 border-b border-charcoal-foreground/10">
          <div className="text-center max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold mb-4">Stay in Touch</h3>
            <p className="text-charcoal-foreground/80 mb-6">
              Subscribe to our newsletter for exclusive updates, styling tips, and early access to new collections.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Enter your email"
                className="bg-charcoal-foreground/10 border-charcoal-foreground/20 text-charcoal-foreground placeholder:text-charcoal-foreground/60"
              />
              <Button variant="sage" size="default">
                Subscribe
              </Button>
            </div>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="md:col-span-1">
            <h4 className="text-2xl font-bold mb-4">Sachi</h4>
            <p className="text-charcoal-foreground/80 mb-6">
              Contemporary fashion for the modern minimalist. Timeless pieces designed with intention and crafted with care.
            </p>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="text-charcoal-foreground hover:text-sage">
                <Instagram className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-charcoal-foreground hover:text-sage">
                <Twitter className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-charcoal-foreground hover:text-sage">
                <Facebook className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-charcoal-foreground hover:text-sage">
                <Mail className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h5 className="font-semibold mb-4">Shop</h5>
            <ul className="space-y-2 text-charcoal-foreground/80">
              <li><a href="#" className="hover:text-sage transition-colors">New Arrivals</a></li>
              <li><a href="#" className="hover:text-sage transition-colors">Best Sellers</a></li>
              <li><a href="#" className="hover:text-sage transition-colors">Collections</a></li>
              <li><a href="#" className="hover:text-sage transition-colors">Sale</a></li>
              <li><a href="#" className="hover:text-sage transition-colors">Gift Cards</a></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h5 className="font-semibold mb-4">Customer Service</h5>
            <ul className="space-y-2 text-charcoal-foreground/80">
              <li><a href="#" className="hover:text-sage transition-colors">Contact Us</a></li>
              <li><a href="#" className="hover:text-sage transition-colors">Size Guide</a></li>
              <li><a href="#" className="hover:text-sage transition-colors">Shipping & Returns</a></li>
              <li><a href="#" className="hover:text-sage transition-colors">Care Instructions</a></li>
              <li><a href="#" className="hover:text-sage transition-colors">FAQ</a></li>
            </ul>
          </div>

          {/* About */}
          <div>
            <h5 className="font-semibold mb-4">About</h5>
            <ul className="space-y-2 text-charcoal-foreground/80">
              <li><a href="#" className="hover:text-sage transition-colors">Our Story</a></li>
              <li><a href="#" className="hover:text-sage transition-colors">Sustainability</a></li>
              <li><a href="#" className="hover:text-sage transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-sage transition-colors">Press</a></li>
              <li><a href="#" className="hover:text-sage transition-colors">Wholesale</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-6 border-t border-charcoal-foreground/10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-charcoal-foreground/60">
            <p>&copy; 2024 Sachi. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <a href="#" className="hover:text-sage transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-sage transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-sage transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}