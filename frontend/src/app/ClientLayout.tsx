// src/app/ClientLayout.tsx - This is a CLIENT component.
'use client';

import { Navbar } from '@/components/shared/Navbar';
import { ChatWidget } from '@/components/chatbot';
import { usePathname } from 'next/navigation';

// Routes that use the (main) layout with sidebar - these don't need the Navbar
const mainLayoutRoutes = [
  '/dashboard',
  '/courses',
  '/certificates',
  '/quizzes',
  '/forums',
  '/notifications',
  '/admin',
  '/profile',
  '/faq',
  '/contact',
  '/payments',
  '/checkout',
  '/instructor',
  '/chatbot',
];

// This component wraps all the pages
export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Check if current path uses the main layout (has sidebar)
  const usesMainLayout = mainLayoutRoutes.some(route => pathname?.startsWith(route));

  // Auth pages styling
  const authRoutes = ['/login', '/register', '/forgot-password', '/reset-password', '/verify-email-otp', '/verify-reset-otp'];
  const isAuthPage = authRoutes.some(route => pathname?.startsWith(route));

  // Landing page (home)
  const isLandingPage = pathname === '/';

  // If using main layout, just render children (main layout handles everything)
  if (usesMainLayout) {
    return (
      <>
        {children}
        <ChatWidget />
      </>
    );
  }

  // For other pages (home, auth pages), use Navbar
  return (
    <>
      <Navbar />
      <main className={
        isAuthPage
          ? 'flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900'
          : isLandingPage
            ? ''
            : 'container py-8'
      }>
        {children}
      </main>
      <ChatWidget />
    </>
  );
}