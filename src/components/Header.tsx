import { Button } from "@/components/ui/button";
import { ShoppingBag, Search, User, Menu } from "lucide-react";
import { useState } from "react";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Sachi
            </h1>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#" className="text-foreground hover:text-foreground/80 transition-colors">
              Shop
            </a>
            <a href="#" className="text-foreground hover:text-foreground/80 transition-colors">
              Collections
            </a>
            <a href="#" className="text-foreground hover:text-foreground/80 transition-colors">
              About
            </a>
            <a href="#" className="text-foreground hover:text-foreground/80 transition-colors">
              Contact
            </a>
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="hidden sm:inline-flex">
              <Search className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="hidden sm:inline-flex">
              <User className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingBag className="h-4 w-4" />
              <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full text-xs w-5 h-5 flex items-center justify-center">
                0
              </span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <nav className="flex flex-col space-y-4">
              <a href="#" className="text-foreground hover:text-foreground/80 transition-colors">
                Shop
              </a>
              <a href="#" className="text-foreground hover:text-foreground/80 transition-colors">
                Collections
              </a>
              <a href="#" className="text-foreground hover:text-foreground/80 transition-colors">
                About
              </a>
              <a href="#" className="text-foreground hover:text-foreground/80 transition-colors">
                Contact
              </a>
              <div className="flex items-center space-x-4 pt-4">
                <Button variant="ghost" size="icon">
                  <Search className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <User className="h-4 w-4" />
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}