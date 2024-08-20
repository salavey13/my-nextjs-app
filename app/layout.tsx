import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppProvider, useAppContext } from "../context/AppContext";
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
      <body
        className={`${inter.className} bg-gray-900 text-white`}
        style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}
      >
        <AppProvider>
          <TranslationProvider>
            <div className="flex flex-col flex-grow container mx-auto p-4">
              <div className="flex justify-between items-center mb-4">
                <h1 className="text-3xl font-bold">IQ/Social Score Calculator</h1>
              </div>
              {children}
            </div>
            <footer className="bg-gray-800 text-gray-400 p-4">
              <div className="flex justify-between">
                <div className="flex space-x-4">
                  <Link href="/terms-of-service" className="text-sm">Terms of Service</Link>
                  <Link href="/privacy-policy" className="text-sm">Privacy Policy</Link>
                </div>
                <div className="flex space-x-4">
                  <Link href="/page1" className="text-sm">Page 1</Link>
                  <Link href="/page2" className="text-sm">Page 2</Link>
                  {/* Add more links as needed */}
                </div>
              </div>
            </footer>
          </TranslationProvider>
        </AppProvider>
      </body>
    </html>
  );
}
