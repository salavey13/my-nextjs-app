// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { UserProvider } from "../context/UserContext";
import { AppProvider } from "../context/AppContext";
import Referral from "@/components/Referral";
import { ReactNode } from "react";
import { TranslationProvider } from '../utils/TranslationUtils'; // Adjust the import path as needed
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "IQ/Social Score Calculator",
  description: "Manage your IQ and social credit scenarios.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <UserProvider>
          <AppProvider>
            <TranslationProvider>
              <div className="container mx-auto p-4">
                <h1 className="text-3xl font-bold mb-8">IQ/Social Score Calculator</h1>
                {children}
              </div>
            </TranslationProvider>
          </AppProvider>
        </UserProvider>
      </body>
      
      <footer className="p-4">
        <div className="flex justify-center space-x-4">
          <Link href="/terms-of-service">Terms of Service</Link>
          <Link href="/privacy-policy">Privacy Policy</Link>
        </div>
      </footer>
    </html>
  );
}
