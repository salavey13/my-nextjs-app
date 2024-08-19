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
      <body className={inter.className} style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <UserProvider>
          <AppProvider>
            <TranslationProvider>
              <div className="flex flex-col flex-grow container mx-auto p-4">
                <div className="flex justify-between items-center mb-4">
                  <h1 className="text-3xl font-bold">IQ/Social Score Calculator</h1>
                  <span className="text-lg">User: {/* Add logic to display the username here if available */}</span>
                </div>
                {children}
              </div>
            </TranslationProvider>
          </AppProvider>
        </UserProvider>
        <footer className="p-4">
          <div className="flex justify-center space-x-4">
            <Link href="/terms-of-service">Terms of Service</Link>
            <Link href="/privacy-policy">Privacy Policy</Link>
          </div>
        </footer>
      </body>
    </html>
  );
}
