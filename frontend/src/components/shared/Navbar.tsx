'use client';

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { UserNav } from "./UserNav";
import { GraduationCap } from "lucide-react";

export function Navbar() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="w-full px-6 sm:px-8 lg:px-12 max-w-7xl mx-auto flex h-14 items-center">
        <div className="mr-4 flex items-center">
          <Link href="/" className="mr-4 sm:mr-6 flex items-center space-x-2">
            <GraduationCap className="h-5 w-5 sm:h-6 sm:w-6" />
            <span className="font-bold text-sm sm:text-base">LMS Platform</span>
          </Link>
          <nav className="hidden sm:flex items-center space-x-6 text-sm font-medium">
            <Link
              href="/courses"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Courses
            </Link>
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2 sm:space-x-4">
          <nav className="flex items-center space-x-1 sm:space-x-2">
            {isLoading ? (
              // Show a placeholder while checking for login status
              <div className="h-8 w-16 sm:w-20 animate-pulse rounded-md bg-muted"></div>
            ) : isAuthenticated ? (
              // If logged in, show the UserNav dropdown
              <UserNav />
            ) : (
              // If not logged in, show Login and Sign Up buttons
              <>
                <Button asChild variant="ghost" size="sm" className="text-xs sm:text-sm">
                  <Link href="/login">Login</Link>
                </Button>
                <Button asChild size="sm" className="text-xs sm:text-sm">
                  <Link href="/register">Sign Up</Link>
                </Button>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}