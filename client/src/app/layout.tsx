import './globals.css';
import { ClerkProvider } from '@clerk/nextjs';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Beaver AI - The Future of AI-Native Development',
  description: 'Transform ideas into fully functional web applications through natural conversation alone.',
  keywords: 'AI development, no-code, web applications, artificial intelligence, development platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" className="dark">
        <body className={inter.className}>
          <div id="root">
            {children}
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}