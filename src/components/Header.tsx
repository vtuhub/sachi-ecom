import { Button } from "@/components/ui/button";
import { ShoppingBag, Search, User, Menu, LogOut, Heart } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Command, CommandInput, CommandList, CommandItem, CommandDialog } from "@/components/ui/command";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "next-themes";

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useTheme();

  // Demo search results
  const searchResults = [
    { id: 1, label: "Minimalist Wool Sweater" },
    { id: 2, label: "Organic Cotton Tee" },
    { id: 3, label: "Tailored Linen Blazer" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border shadow-sm transition-shadow">
      <div className="container mx-auto px-4 lg:px-6 flex h-16 items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Sachi</h1>
        </div>
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <a href="#" className="text-foreground hover:text-foreground/80 transition-colors">Shop</a>
          <a href="#" className="text-foreground hover:text-foreground/80 transition-colors">Collections</a>
          <a href="#" className="text-foreground hover:text-foreground/80 transition-colors">About</a>
          <a href="#" className="text-foreground hover:text-foreground/80 transition-colors">Contact</a>
        </nav>
        {/* Centered Search Bar (Desktop) */}
        <div className="hidden md:flex flex-1 justify-center">
          <Button variant="outline" size="sm" className="w-80 justify-start" aria-label="Open search" onClick={() => setIsSearchOpen(true)}>
            <Search className="h-4 w-4 mr-2" />
            <span className="text-muted-foreground">Search for products...</span>
          </Button>
        </div>
        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Dark mode toggle */}
          <div className="hidden md:block">
            <Switch
              checked={theme === "dark"}
              onCheckedChange={v => setTheme(v ? "dark" : "light")}
              aria-label="Toggle dark mode"
            />
          </div>
          <Button variant="ghost" size="icon" className="hidden sm:inline-flex" aria-label="Open search" onClick={() => setIsSearchOpen(true)}>
            <Search className="h-4 w-4" />
          </Button>
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="hidden sm:inline-flex" aria-label="User menu">
                  <User className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link to="/profile">My Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/orders">My Orders</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/wishlist">My Wishlist</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={signOut} aria-label="Sign out">
                  <LogOut className="mr-2 h-4 w-4" />Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="ghost" size="icon" className="hidden sm:inline-flex" asChild aria-label="Sign in">
              <Link to="/auth">
                <User className="h-4 w-4" />
              </Link>
            </Button>
          )}
          <Button variant="ghost" size="icon" asChild aria-label="Wishlist">
            <Link to="/wishlist">
              <Heart className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" className="relative" asChild aria-label="Cart">
            <Link to="/cart">
              <ShoppingBag className="h-4 w-4" />
              <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full text-xs w-5 h-5 flex items-center justify-center">0</span>
            </Link>
          </Button>
          {/* Hamburger for mobile */}
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMenuOpen(true)} aria-label="Open menu">
            <Menu className="h-4 w-4" />
          </Button>
        </div>
      </div>
      {/* Search Modal (Command/Dialog) */}
      <CommandDialog open={isSearchOpen} onOpenChange={setIsSearchOpen} aria-label="Product search">
        <CommandInput placeholder="Search for products..." />
        <CommandList>
          {searchResults.map((item) => (
            <CommandItem key={item.id}>{item.label}</CommandItem>
          ))}
        </CommandList>
      </CommandDialog>
      {/* Mobile Menu Sheet */}
      <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <SheetContent side="left" className="p-0 w-80 max-w-full">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between px-4 py-4 border-b border-border">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">Sachi</h1>
              <Switch
                checked={theme === "dark"}
                onCheckedChange={v => setTheme(v ? "dark" : "light")}
                aria-label="Toggle dark mode"
              />
            </div>
            <nav className="flex flex-col gap-2 px-4 py-4">
              <a href="#" className="text-foreground py-2 px-2 rounded hover:bg-accent transition-colors">Shop</a>
              <a href="#" className="text-foreground py-2 px-2 rounded hover:bg-accent transition-colors">Collections</a>
              <a href="#" className="text-foreground py-2 px-2 rounded hover:bg-accent transition-colors">About</a>
              <a href="#" className="text-foreground py-2 px-2 rounded hover:bg-accent transition-colors">Contact</a>
            </nav>
            <div className="flex-1" />
            <div className="flex flex-col gap-2 px-4 pb-4">
              <Button variant="outline" size="sm" className="w-full justify-start" aria-label="Open search" onClick={() => { setIsSearchOpen(true); setIsMenuOpen(false); }}>
                <Search className="h-4 w-4 mr-2" />Search for products...
              </Button>
              {user ? (
                <Button variant="outline" size="sm" className="w-full justify-start" asChild aria-label="User menu">
                  <Link to="/profile">
                    <User className="h-4 w-4 mr-2" />My Profile
                  </Link>
                </Button>
              ) : (
                <Button variant="outline" size="sm" className="w-full justify-start" asChild aria-label="Sign in">
                  <Link to="/auth">
                    <User className="h-4 w-4 mr-2" />Sign In
                  </Link>
                </Button>
              )}
              <Button variant="outline" size="sm" className="w-full justify-start" asChild aria-label="Wishlist">
                <Link to="/wishlist">
                  <Heart className="h-4 w-4 mr-2" />Wishlist
                </Link>
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start" asChild aria-label="Cart">
                <Link to="/cart">
                  <ShoppingBag className="h-4 w-4 mr-2" />Cart
                </Link>
              </Button>
              <Button variant="ghost" size="sm" className="w-full justify-start mt-2" onClick={() => setIsMenuOpen(false)} aria-label="Close menu">Close</Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
};