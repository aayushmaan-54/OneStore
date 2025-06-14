import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import Header from "@/common/components/header";
import { Space_Grotesk, Space_Mono } from 'next/font/google'
import { ThemeProvider } from "@/common/provider/theme-provider";
import Footer from "@/common/components/footer";


const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
});

const spaceMono = Space_Mono({
  subsets: ['latin'],
  variable: '--font-serif',
  weight: ['400', '700'],
  display: 'swap',
});


export const metadata: Metadata = {
  metadataBase: new URL("https://onestore-ecom.vercel.app"),
  title: {
    default: "OneStore - Your Personal Online Shop",
    template: "OneStore | %s",
  },
  description:
    "OneStore 🛍️ is a modern, single-vendor e-commerce platform with admin controls, product management, and a seamless shopping experience.",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🛍️</text></svg>",
  },
  openGraph: {
    title: "OneStore - Your Personal Online Shop",
    description:
      "Browse and manage products with OneStore, a modern single-vendor e-commerce app built with Next.js and Drizzle ORM.",
    url: "https://onestore-ecom.vercel.app",
    siteName: "OneStore",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "OneStore - Your Personal Online Shop",
    description:
      "OneStore offers a clean, admin-friendly shopping experience for single vendors. Manage products, view orders, and sell online with ease.",
  },
  keywords: [
    "OneStore",
    "OneStore App",
    "Single Vendor E-commerce",
    "Admin Dashboard E-commerce",
    "Product Management Platform",
    "E-commerce with Admin Panel",
    "Modern E-commerce App",
    "Next.js E-commerce",
    "Drizzle ORM Store",
    "Online Shopping Platform",
    "Simple Online Store",
    "Custom E-commerce Website",
    "Buy and Sell Online",
    "One Vendor Shop",
    "Shop Admin Tools",
    "Secure E-commerce",
    "Fast E-commerce UI",
    "Clean Online Store Design",
    "Tailwind E-commerce UI",
    "BetterAuth Integration",
    "UploadThing Product Images",
    "Fullstack Commerce App",
    "Minimalist Shop App",
    "React E-commerce Template",
    "Product CRUD Admin",
  ]
};



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`bg-background text-foreground antialiased min-h-screen flex flex-col overflow-x-hidden
        ${spaceGrotesk.variable} ${spaceMono.variable}`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Toaster position="bottom-center" />
          <Header />
          <main className="flex-1 w-full">
            {children}
          </main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
