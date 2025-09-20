import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useLocation } from "react-router";
import { Menu, X, Brain, MessageCircle, FileText, Users, Calendar, Phone, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { isAuthenticated, user, signOut } = useAuth();
  const navigate = useNavigate();

  // Add: theme state & initialize from localStorage
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    const saved = localStorage.getItem("theme");
    if (saved === "dark") return true;
    if (saved === "light") return false;
    return document.documentElement.classList.contains("dark");
  });

  // Apply theme on mount and when toggled
  if (typeof window !== "undefined") {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    const root = document.documentElement;
    if (next) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const navigation = [
    { name: "Home", href: "/", icon: Brain },
    { name: "Assessment", href: "/assessment", icon: FileText },
    { name: "AI Chat", href: "/chatbot", icon: MessageCircle },
    { name: "Resources", href: "/resources", icon: FileText },
    { name: "Forum", href: "/forum", icon: Users },
    { name: "Appointments", href: "/appointments", icon: Calendar },
    { name: "Emergency", href: "/emergency", icon: Phone },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-card/80 backdrop-blur-md border-b border-border">
      <div className="w-full px-3 sm:px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo - Left side */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
              <Brain className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg gradient-text -ml-1">Silent Sanctuary</span>
          </Link>

          {/* Desktop Navigation - Close to logo */}
          <div className="hidden md:flex items-center gap-1 ml-8">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center gap-2 px-2 py-2 rounded-lg transition-all duration-200 ${
                    isActive
                      ? "bg-primary/20 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-sm font-medium">{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Auth + Theme Section - Far right */}
          <div className="hidden md:flex items-center gap-4 ml-auto">
            {/* Theme toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>

            {/* Replace Sign In/Out with Settings menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  Settings
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {isAuthenticated ? (
                  <DropdownMenuItem
                    onClick={async () => {
                      await signOut();
                      navigate("/");
                    }}
                    className="cursor-pointer"
                  >
                    Sign Out
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem
                    onClick={() => navigate("/auth")}
                    className="cursor-pointer"
                  >
                    Sign In
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                {isAuthenticated && user?.role === "admin" ? (
                  <DropdownMenuItem
                    onClick={async () => {
                      await signOut();
                      navigate("/");
                    }}
                    className="cursor-pointer text-destructive focus:text-destructive"
                  >
                    Admin Sign Out
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem
                    onClick={() => navigate("/auth-admin")}
                    className="cursor-pointer"
                  >
                    Admin Sign In
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile menu button - Right side */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden ml-auto"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation - Keep existing mobile menu structure */}
      <motion.div
        initial={false}
        animate={{ height: isOpen ? "auto" : 0 }}
        className="md:hidden overflow-hidden bg-card border-t border-border"
      >
        <div className="px-4 py-4 space-y-2">
          {/* Add: Theme toggle (Mobile) */}
          <div className="flex justify-end pb-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                toggleTheme();
                setIsOpen(false);
              }}
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </div>
          
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                  isActive
                    ? "bg-primary/20 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
          
          <div className="pt-4 border-t border-border space-y-2">
            {/* Mobile Settings options */}
            {!isAuthenticated ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    navigate("/auth");
                    setIsOpen(false);
                  }}
                >
                  Sign In
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    navigate("/auth-admin");
                    setIsOpen(false);
                  }}
                >
                  Admin Sign In
                </Button>
              </>
            ) : (
              <>
                <div className="px-3 py-2 text-sm text-muted-foreground">
                  {user?.name || user?.email || "User"}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={async () => {
                    await signOut();
                    setIsOpen(false);
                    navigate("/");
                  }}
                >
                  Sign Out
                </Button>
                {user?.role === "admin" ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-destructive"
                    onClick={async () => {
                      await signOut();
                      setIsOpen(false);
                      navigate("/");
                    }}
                  >
                    Admin Sign Out
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      navigate("/auth-admin");
                      setIsOpen(false);
                    }}
                  >
                    Admin Sign In
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </motion.div>
    </nav>
  );
}