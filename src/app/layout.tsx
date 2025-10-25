import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import ClientLayout from "@/components/ClientLayout";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Stiger — Power Bank Rental",
  description: "Fast, simple power bank rental.",
};

export const headers = {
  'Content-Security-Policy': `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval' https://widget.cloudpayments.ru https://intent-api.cloudpayments.ru;
    style-src 'self' 'unsafe-inline' https://widget.cloudpayments.ru;
    img-src 'self' data: https://ads.cloudpayments.ru https://intent-api.cloudpayments.ru;
    connect-src 'self' https://widget.cloudpayments.ru https://intent-api.cloudpayments.ru https://api.cloudpayments.ru;
    frame-src 'self' https://widget.cloudpayments.ru;
    font-src 'self' data:;
  `.replace(/\s+/g, ' ').trim()
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
