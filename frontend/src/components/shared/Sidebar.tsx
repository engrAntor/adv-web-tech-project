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
  FileQuestion} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// 2. ADD "QUIZZES" TO THE NAVIGATION ARRAY
const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/courses", icon: Library, label: "My Courses" },
  { href: "/certificates", icon: Award, label: "My Certificates" },
  { href: "/quizzes", icon: FileQuestion, label: "Quizzes" }, // <-- New item
  { href: "/forums", icon: MessageSquare, label: "Forums" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    // 3. APPLY THE NEW COLOR SCHEME TO THE MAIN SIDEBAR ELEMENT
    <aside className="hidden lg:flex flex-col w-64 border-r p-4 space-y-4 shrink-0 bg-gray-900 text-gray-300">
      
      {/* Logo/Brand Section - with updated colors */}
      <div className="flex items-center gap-2 px-2 h-14">
        <GraduationCap className="h-8 w-8 text-brand" />
        <h1 className="text-xl font-bold text-white">LMS Platform</h1>
      </div>

      {/* Main Navigation - with updated link styling */}
      <nav className="flex-1 space-y-1">
        <p className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">Main Menu</p>
        {navItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:bg-gray-800 hover:text-white",
              pathname === item.href && "bg-brand text-brand-foreground" // Active link style
            )}
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Account/Logout Section - with updated styling */}
      <div className="flex flex-col space-y-2">
         <Link
            href="/profile"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:bg-gray-800 hover:text-white",
              pathname.startsWith("/profile") && "bg-gray-700 text-white"
            )}
          >
            <Settings className="h-5 w-5" />
            Settings
          </Link>
        <button 
          onClick={logout} 
          className="flex items-center w-full gap-3 rounded-lg px-3 py-2 text-left transition-all text-red-400 hover:bg-red-900/50 hover:text-red-300"
        >
          <LogOut className="h-5 w-5" /> 
          Logout
        </button>
      </div>
    </aside>
  );
}