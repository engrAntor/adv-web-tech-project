'use client';

import { Sidebar, MobileMenuButton, SidebarProvider, useSidebar } from "@/components/shared/Sidebar";
import { useAuth } from "@/hooks/useAuth";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { UserNav } from "@/components/shared/UserNav";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

// Public routes that don't require authentication
const publicRoutes = ['/courses'];

function MainContent({ children }: { children: React.ReactNode }) {
  const { isCollapsed } = useSidebar();

  return (
    <div
      className={cn(
        "flex flex-col min-h-screen w-full transition-all duration-300",
        isCollapsed ? "lg:ml-16 lg:w-[calc(100%-4rem)]" : "lg:ml-64 lg:w-[calc(100%-16rem)]"
      )}
    >
      {/* Header */}
      <header className="sticky top-0 z-20 flex h-14 items-center gap-4 border-b bg-background px-4 sm:px-6">
        {/* Menu button (hamburger on mobile, collapse toggle on desktop) */}
        <MobileMenuButton />

        {/* Flexible spacer */}
        <div className="flex-1" />

        {/* User navigation */}
        <UserNav />
      </header>

      {/* Main content */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
        <div className="w-full">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-4 px-4 sm:px-6 lg:px-8 mt-auto">
        <div className="text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} LMS Platform. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    // Check if current path is a public route
    const isPublicRoute = publicRoutes.some(route => pathname?.startsWith(route));

    // Also check localStorage directly as a fallback (handles race condition after login)
    const hasTokenInStorage = typeof window !== 'undefined' && !!localStorage.getItem('accessToken');

    useEffect(() => {
        // Redirect to login if not authenticated and not on a public route
        // Also check localStorage to avoid race condition after fresh login
        if (!isLoading && !isAuthenticated && !hasTokenInStorage && !isPublicRoute) {
            router.push('/login');
        }
    }, [isLoading, isAuthenticated, hasTokenInStorage, isPublicRoute, router]);

    // Show a full-page loader while checking auth state
    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    // If not authenticated and not on public route, show loader (redirect will happen)
    // Check localStorage as fallback to handle race condition
    if (!isAuthenticated && !hasTokenInStorage && !isPublicRoute) {
        return (
            <div className="flex h-screen items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-muted-foreground">Redirecting to login...</p>
                </div>
            </div>
        );
    }

    return (
      <SidebarProvider>
        <div className="min-h-screen bg-muted/40">
          {/* Sidebar handles both mobile and desktop */}
          <Sidebar />

          {/* Main content area */}
          <MainContent>{children}</MainContent>
        </div>
      </SidebarProvider>
    );
}
