// src/app/ClientLayout.tsx - This is a CLIENT component.
'use client'; // <-- The directive is now correctly at the top of its own file.

import { Navbar } from '@/components/shared/Navbar';
import { useAuth } from '@/hooks/useAuth';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

// This component wraps all the pages and handles auth logic
export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  const publicRoutes = ['/'];
  const authRoutes = ['/login', '/register'];

  useEffect(() => {
    if (!isLoading && !isAuthenticated && !publicRoutes.includes(pathname) && !authRoutes.includes(pathname)) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, pathname, router]);
  
  // While loading or before redirecting, show a simple loader
  if (isLoading || (!isAuthenticated && !publicRoutes.includes(pathname) && !authRoutes.includes(pathname))) {
      return (
          <div className="flex h-screen w-full items-center justify-center">
              <p>Loading...</p>
          </div>
      );
  }

  const isAuthPage = authRoutes.includes(pathname);

  return (
    <>
      <Navbar />
      <main className={isAuthPage ? 'flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900' : 'container py-8'}>
        {children}
      </main>
    </>
  );
}