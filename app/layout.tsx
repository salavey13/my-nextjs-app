import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppProvider } from "../context/AppContext";
import { ReactNode } from "react";
import React, { Suspense } from "react";
import TopShelf from "@/components/ui/topShelf";
import PageWrapper from "@/components/PageWrapper";
import LoadingSpinner from "../components/ui/LoadingSpinner"; 
import { GlitchyToastProvider } from "@/hooks/use-toast";
import { ThemeProvider } from '@/context/ThemeContext'
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "IQ/Social Score Calculator",
  description: "Manage your IQ and social credit.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${inter.className} flex flex-col min-h-screen`}>
        <Suspense fallback={<LoadingSpinner />}>
        <ThemeProvider>
          <AppProvider>
          
            <div className="flex flex-col min-h-screen">
              <TopShelf />
              <main className="flex-grow overflow-y-auto pt-16 pb-16 backdrop-blur-lg bg-gradient-to-b from-black via-gray-900 to-black">
                <PageWrapper>
                  {children}
                </PageWrapper>
              </main>
              <GlitchyToastProvider />
            </div>
            
          </AppProvider></ThemeProvider>
        </Suspense>
      </body>
    </html>
  );
}