'use client';

import { Sidebar } from "@/components/shared/Sidebar";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { UserNav } from "@/components/shared/UserNav"; // UserNav for mobile header

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
    const { user, isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        // Redirect to login if not authenticated
        if (!isLoading && !isAuthenticated) {
            router.push('/login');
        }
    }, [isLoading, isAuthenticated, router]);

    // Show a full-page loader while checking auth state
    if (isLoading || !isAuthenticated) {
        return (
            <div className="flex h-screen items-center justify-center bg-background">
                <p>Loading Your Learning Environment...</p>
            </div>
        );
    }
    
    // Once authenticated, render the main application layout
    return (
      <div className="flex min-h-screen w-full bg-muted/40">
        {/* The permanent sidebar on the left */}
        <Sidebar />

        {/* The main content area on the right */}
        <div className="flex flex-col flex-1">
          <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-6">
            {/* You can add a mobile menu button here later */}
            <div className="flex-1">
              {/* Optional: Add a search bar here if needed */}
            </div>
            {/* User avatar and dropdown */}
            <UserNav />
          </header>
          <main className="flex-1 p-6 sm:p-8">
            {children}
          </main>
        </div>
      </div>
    );
}