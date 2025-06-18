import type { Metadata } from 'next';
import { Inter as FontSans } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseProvider } from '@/contexts/FirebaseDataContext';
import { SensorProvider } from '@/contexts/SensorContext'; // Add this import
import AppLayout from '@/components/layout/AppLayout';

const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Horizon - Smart Home Hub',
  description: 'Smart Home Hub by Horizon.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Google Fonts links are managed by next/font */}
      </head>
      <body className={`font-body antialiased ${fontSans.variable}`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <FirebaseProvider>
            <SensorProvider> {/* Wrap with SensorProvider */}
              <AppLayout>{children}</AppLayout>
              <Toaster />
            </SensorProvider>
          </FirebaseProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}