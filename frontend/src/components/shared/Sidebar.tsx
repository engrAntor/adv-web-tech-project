'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import {
  GraduationCap,
  LayoutDashboard,
  Library,
  Award,
  MessageSquare,
  Settings,
  LogOut,
  FileQuestion,
  Bell,
  Shield,
  HelpCircle,
  Mail,
  Menu,
  PanelLeftClose,
  PanelLeft,
  Receipt,
  Bot,
} from "lucide-react";
import { UserRole } from "@/types";
import { useState, createContext, useContext, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/courses", icon: Library, label: "My Courses" },
  { href: "/certificates", icon: Award, label: "My Certificates" },
  { href: "/payments/invoices", icon: Receipt, label: "Invoices" },
  { href: "/quizzes", icon: FileQuestion, label: "Quizzes" },
  { href: "/forums", icon: MessageSquare, label: "Forums" },
  { href: "/notifications", icon: Bell, label: "Notifications" },
  { href: "/chatbot", icon: Bot, label: "AI Assistant" },
];

const instructorNavItems = [
  { href: "/instructor/courses", icon: Library, label: "Manage Courses" },
  { href: "/instructor/quizzes", icon: FileQuestion, label: "Manage Quizzes" },
];

const adminNavItems = [
  { href: "/admin", icon: Shield, label: "Admin Panel" },
];

// Context for sidebar state
const SidebarContext = createContext<{
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}>({
  isCollapsed: false,
  setIsCollapsed: () => {},
});

interface SidebarContentProps {
  pathname: string;
  isAdmin: boolean;
  isInstructor: boolean;
  logout: () => void;
  onLinkClick?: () => void;
  collapsed?: boolean;
}

function SidebarContent({ pathname, isAdmin, isInstructor, logout, onLinkClick, collapsed = false }: SidebarContentProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Logo/Brand Section */}
      <div className={cn("flex items-center gap-2 h-14 shrink-0", collapsed ? "justify-center px-2" : "px-4")}>
        <GraduationCap className="h-8 w-8 text-primary shrink-0" />
        {!collapsed && <h1 className="text-xl font-bold text-white">LMS Platform</h1>}
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto py-4">
        {!collapsed && <p className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">Main Menu</p>}
        {navItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            onClick={onLinkClick}
            title={collapsed ? item.label : undefined}
            className={cn(
              "flex items-center gap-3 rounded-lg py-2 transition-all hover:bg-gray-800 hover:text-white",
              collapsed ? "justify-center mx-2 px-2" : "mx-2 px-3",
              pathname === item.href && "bg-primary text-primary-foreground"
            )}
          >
            <item.icon className="h-5 w-5 shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </Link>
        ))}

        {/* Instructor Section */}
        {isInstructor && (
          <>
            {!collapsed && <p className="px-4 py-2 mt-4 text-xs font-semibold text-gray-500 uppercase">Instructor</p>}
            {instructorNavItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={onLinkClick}
                title={collapsed ? item.label : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-lg py-2 transition-all hover:bg-gray-800 hover:text-white",
                  collapsed ? "justify-center mx-2 px-2 mt-4" : "mx-2 px-3",
                  pathname.startsWith(item.href) && "bg-primary text-primary-foreground"
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            ))}
          </>
        )}

        {/* Admin Section */}
        {isAdmin && (
          <>
            {!collapsed && <p className="px-4 py-2 mt-4 text-xs font-semibold text-gray-500 uppercase">Admin</p>}
            {adminNavItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={onLinkClick}
                title={collapsed ? item.label : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-lg py-2 transition-all hover:bg-gray-800 hover:text-white",
                  collapsed ? "justify-center mx-2 px-2 mt-4" : "mx-2 px-3",
                  pathname.startsWith(item.href) && "bg-primary text-primary-foreground"
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            ))}
          </>
        )}
      </nav>

      {/* Support Links */}
      <div className="flex flex-col space-y-1 shrink-0 py-2">
        {!collapsed && <p className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">Support</p>}
        <Link
          href="/faq"
          onClick={onLinkClick}
          title={collapsed ? "FAQ" : undefined}
          className={cn(
            "flex items-center gap-3 rounded-lg py-2 transition-all hover:bg-gray-800 hover:text-white",
            collapsed ? "justify-center mx-2 px-2" : "mx-2 px-3",
            pathname === "/faq" && "bg-gray-700 text-white"
          )}
        >
          <HelpCircle className="h-5 w-5 shrink-0" />
          {!collapsed && <span>FAQ</span>}
        </Link>
        <Link
          href="/contact"
          onClick={onLinkClick}
          title={collapsed ? "Contact Us" : undefined}
          className={cn(
            "flex items-center gap-3 rounded-lg py-2 transition-all hover:bg-gray-800 hover:text-white",
            collapsed ? "justify-center mx-2 px-2" : "mx-2 px-3",
            pathname === "/contact" && "bg-gray-700 text-white"
          )}
        >
          <Mail className="h-5 w-5 shrink-0" />
          {!collapsed && <span>Contact Us</span>}
        </Link>
      </div>

      {/* Account/Logout Section */}
      <div className="flex flex-col space-y-2 border-t border-gray-700 pt-4 pb-2 shrink-0">
        <Link
          href="/profile"
          onClick={onLinkClick}
          title={collapsed ? "Settings" : undefined}
          className={cn(
            "flex items-center gap-3 rounded-lg py-2 transition-all hover:bg-gray-800 hover:text-white",
            collapsed ? "justify-center mx-2 px-2" : "mx-2 px-3",
            pathname.startsWith("/profile") && "bg-gray-700 text-white"
          )}
        >
          <Settings className="h-5 w-5 shrink-0" />
          {!collapsed && <span>Settings</span>}
        </Link>
        <button
          onClick={() => {
            onLinkClick?.();
            logout();
          }}
          title={collapsed ? "Logout" : undefined}
          className={cn(
            "flex items-center gap-3 rounded-lg py-2 text-left transition-all text-red-400 hover:bg-red-900/50 hover:text-red-300",
            collapsed ? "justify-center mx-2 px-2" : "w-full mx-2 px-3"
          )}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );
}

// Export the menu button for use in layout (works on all screen sizes)
export function MobileMenuButton() {
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const [open, setOpen] = useState(false);
  const { isCollapsed, setIsCollapsed } = useContext(SidebarContext);

  const isAdmin = user?.role === UserRole.ADMIN || user?.role === UserRole.ADVISOR;
  const isInstructor = user?.role === UserRole.INSTRUCTOR || user?.role === UserRole.ADMIN || user?.role === UserRole.ADVISOR;

  return (
    <>
      {/* Mobile: Sheet trigger */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
          >
            <Menu className="h-6 w-6" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0 bg-gray-900 text-gray-300 border-gray-700">
          <SidebarContent
            pathname={pathname}
            isAdmin={isAdmin}
            isInstructor={isInstructor}
            logout={logout}
            onLinkClick={() => setOpen(false)}
          />
        </SheetContent>
      </Sheet>

      {/* Desktop: Collapse toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="hidden lg:flex"
        onClick={() => setIsCollapsed(!isCollapsed)}
        title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {isCollapsed ? <PanelLeft className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
        <span className="sr-only">{isCollapsed ? "Expand sidebar" : "Collapse sidebar"}</span>
      </Button>
    </>
  );
}

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Load collapsed state from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    if (saved !== null) {
      setIsCollapsed(saved === 'true');
    }
  }, []);

  // Save collapsed state to localStorage when it changes
  const handleSetCollapsed = (value: boolean) => {
    setIsCollapsed(value);
    localStorage.setItem('sidebar-collapsed', String(value));
  };

  return (
    <SidebarContext.Provider value={{ isCollapsed, setIsCollapsed: handleSetCollapsed }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  return useContext(SidebarContext);
}

export function Sidebar() {
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const { isCollapsed } = useContext(SidebarContext);

  const isAdmin = user?.role === UserRole.ADMIN || user?.role === UserRole.ADVISOR;
  const isInstructor = user?.role === UserRole.INSTRUCTOR || user?.role === UserRole.ADMIN || user?.role === UserRole.ADVISOR;

  return (
    <>
      {/* Desktop Sidebar - Fixed */}
      <aside
        className={cn(
          "hidden lg:flex fixed inset-y-0 left-0 z-30 flex-col bg-gray-900 text-gray-300 overflow-hidden transition-all duration-300",
          isCollapsed ? "w-16 p-2" : "w-64 p-4"
        )}
      >
        <SidebarContent
          pathname={pathname}
          isAdmin={isAdmin}
          isInstructor={isInstructor}
          logout={logout}
          collapsed={isCollapsed}
        />
      </aside>
    </>
  );
}
