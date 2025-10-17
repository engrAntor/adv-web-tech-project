// src/app/layout.tsx - This is a SERVER component.

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from '@/components/ui/sonner';
import ClientLayout from '@/app/ClientLayout'; // <-- THIS IS THE CORRECTED IMPORT PATH

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Student LMS Platform',
  description: 'A modern learning management system.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <AuthProvider>
          {/* We pass the children to the ClientLayout which handles all client logic */}
          <ClientLayout>{children}</ClientLayout>
          <Toaster richColors position="top-right" />
        </AuthProvider>
      </body>
    </html>
  );
}