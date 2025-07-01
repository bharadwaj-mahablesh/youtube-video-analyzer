import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from '@clerk/nextjs';

const inter = Inter({
  subsets: ["latin"],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "YouTube Video Insights",
  description: "AI-powered YouTube video analysis",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className} style={{ background: '#f6f7fb', minHeight: '100vh' }}>
          {children}
        <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
        </body>
      </html>
    </ClerkProvider>
  );
}
