// types.ts
import { LucideIcon } from 'lucide-react';

export interface NavItem {
  name: string;
  path: string;
  icon: LucideIcon;
}

export interface NavCategory {
  category: string;
  items: NavItem[];
}

// AdminNavbar.tsx
import React, { useState, useEffect } from 'react';
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { 
  Menu, 
  X, 
  //ChevronRight, 
  Search, 
  Bell, 
  Settings,
  Home as HomeIcon,
  LayoutDashboard,
  Newspaper as NewspaperIcon,
  Info as InfoIcon,
  Heart as HeartIcon,
  Cake as CakeIcon,
  List as ListIcon,
  ShoppingCart as ShoppingCartIcon,
  FileText as FileTextIcon,
  Ruler  as FooterIcon,
  Users as UsersIcon,
  Tag as TagIcon,
  ChartArea  as ChartAreaIcon,
  MapPinPlus   as MapPinPlusIcon,
} from 'lucide-react';
//import { NavItem, NavCategory } from './types';

const navItems: NavCategory[] = [
  {
    category: "Main",
    items: [
      { name: "Dashboard", path: "/admin", icon: LayoutDashboard },
      { name: "Home", path: "/admin/home", icon: HomeIcon },
      { name: "News", path: "/admin/news", icon: NewspaperIcon },
      { name: "About", path: "/admin/about", icon: InfoIcon },
    ]
  },
  {
    category: "Management",
    items: [
      { name: "Favorites (not in used)", path: "/admin/favorites", icon: HeartIcon },
      { name: "Cakes", path: "/admin/cakes", icon: CakeIcon },
      { name: "Categories", path: "/admin/categories", icon: ListIcon },
      { name: "Orders", path: "/admin/orders", icon: ShoppingCartIcon },
      { name: "Order Stats", path: "/admin/order-stats", icon: ChartAreaIcon },
    ]
  },
  {
    category: "Settings & Content",
    items: [
      { name: "Policies", path: "/admin/policies", icon: FileTextIcon },
      { name: "Footer", path: "/admin/footer", icon: FooterIcon },
      { name: "Settings", path: "/admin/settings", icon: Settings },
      { name: "Users", path: "/admin/users", icon: UsersIcon },
      { name: "Coupons", path: "/admin/coupons", icon: TagIcon },
      { name: "Delivery areas", path: "/admin/delivery-areas", icon: MapPinPlusIcon },
    ]
  }
];

interface NavLinkProps {
  item: NavItem;
  onClick?: () => void;
}

const NavLink: React.FC<NavLinkProps> = ({ item, onClick = () => {} }) => {
  const pathname = usePathname();
  const Icon = item.icon;

  return (
    <Link
      href={item.path}
      onClick={onClick}
      className={cn(
        "flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 group relative",
        pathname === item.path
          ? "bg-[#FF9494] text-white shadow-md"
          : "text-gray-600 hover:bg-[#FFD1D1]/20"
      )}
    >
      {Icon && <Icon className="w-4 h-4" />}
      <span>{item.name}</span>
      {pathname === item.path && (
        <span className="absolute inset-0 bg-gradient-to-r from-[#FF9494] to-[#FF9494]/80 rounded-lg -z-10" />
      )}
    </Link>
  );
};

const AdminNavbar: React.FC = () => {
 // const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [scrolled, setScrolled] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [notifications, setNotifications] = useState<number>(3);
  const [searchResults, setSearchResults] = useState<NavItem[]>([]);

  useEffect(() => {
    let ticking = false;
    const handleScroll = (): void => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrolled(window.scrollY > 20);
          ticking = false;
        });
        ticking = true;
      }
    };
    setNotifications(3)
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const results = navItems.flatMap(category => 
        category.items.filter(item  => 
          item.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchQuery(e.target.value);
  };

  const handleMobileMenuToggle = (): void => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleSignOut = async (): Promise<void> => {
    await signOut({ callbackUrl: "/" });
  };

  return (
    <header 
      className={cn(
        "fixed top-0 w-full z-50 transition-all duration-300",
        scrolled 
          ? "bg-white/95 backdrop-blur-md shadow-lg" 
          : "bg-white"
      )}
    >
      <nav className="container mx-auto px-4 lg:px-8">
        {/* Rest of the JSX remains the same, just update event handlers */}
        <div className="flex items-center justify-between h-20">
          {/* Logo and Title */}
          <div className="flex items-center space-x-2">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="relative w-12 h-12 overflow-hidden rounded-full transition-transform duration-300 group-hover:scale-105">
                <Image
                  src="https://res.cloudinary.com/dzabikj6s/image/upload/v1735310817/The-cake-shop/Logo_p9gapg.png"
                  alt="The-Cake-Shop"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-[#FF9494] tracking-tight">
                  The Cake Shop
                </span>
                <span className="text-sm text-gray-500 font-medium">
                  Admin Panel
                </span>
              </div>
            </Link>
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={handleSearch}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#FF9494]/50"
              />
              <Search className="absolute right-3 top-2.5 text-gray-400 w-5 h-5" />
              
              {searchResults.length > 0 && (
                <div className="absolute top-full mt-2 w-full bg-white rounded-lg shadow-lg border border-gray-100 py-2">
                  {searchResults.map((item) => (
                    <NavLink
                      key={item.path}
                      item={item}
                      onClick={() => setSearchQuery("")}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Desktop Navigation   remove for now  hidden 2xl:flex items-center space-x-4*/}
          <div className="hidden">
            {/* Quick Actions */}
            <button 
              className="p-2 rounded-lg hover:bg-gray-100 relative"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5 text-gray-600" />
              {notifications > 0 && (
                <span className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {notifications}
                </span>
              )}
            </button>
            
            {/* Desktop Menu */}
            <div className="flex items-center space-x-1">
              {navItems.map(category => 
                category.items.map(item => (
                  <NavLink key={item.path} item={item} />
                ))
              )}
            </div>

            <Button
              onClick={handleSignOut}
              variant="outline"
              className="ml-4 border-[#FF9494] text-[#FF9494] hover:bg-[#FF9494] hover:text-white transition-colors duration-300"
            >
              Sign Out
            </Button>
          </div>

          {/* Mobile Menu Button 2xl:hidden */}
          <div className="flex items-center space-x-4">
            <button 
              className="p-2 rounded-lg hover:bg-gray-100 relative"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5 text-gray-600" />
              {notifications > 0 && (
                <span className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {notifications}
                </span>
              )}
            </button>
            <button
              onClick={handleMobileMenuToggle}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6 text-gray-600" />
              ) : (
                <Menu className="w-6 h-6 text-gray-600" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu 2xl:hidden*/}
        <div
          className={cn(
            "fixed inset-0 z-50  transition-all duration-300 ease-in-out",
            isMobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          )}
        >
          <div
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            onClick={handleMobileMenuToggle}
          />
          <div
            className={cn(
              "absolute top-0 right-0 w-80 h-full bg-white shadow-2xl transition-transform duration-300 ease-in-out transform",
              isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
            )}
          >
            <div className="p-6 overflow-y-auto h-full">
              <div className="flex items-center justify-between mb-6">
                <span className="text-lg font-semibold text-gray-900">Menu</span>
                <button
                  onClick={handleMobileMenuToggle}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {/* Mobile Search */}
              <div className="mb-6">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={handleSearch}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#FF9494]/50"
                />
              </div>

              {/* Mobile Navigation */}
              <div className="space-y-6">
                {navItems.map((category) => (
                  <div key={category.category} className="space-y-2">
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-4">
                      {category.category}
                    </h3>
                    <div onClick={handleMobileMenuToggle} className="space-y-1">
                      {category.items.map((item) => (
                        <NavLink
                          key={item.path}
                          item={item}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <Button
                onClick={handleSignOut}
                variant="outline"
                className="w-full mt-6 border-[#FF9494] text-[#FF9494] hover:bg-[#FF9494] hover:text-white transition-colors duration-300"
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default AdminNavbar;