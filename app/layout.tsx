import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppProvider } from "../context/AppContext";
import { ReactNode } from "react";
import React, { Suspense } from "react";
import TopShelf from "@/components/ui/topShelf";
import PageWrapper from "@/components/PageWrapper";
import LoadingSpinner from "../components/ui/LoadingSpinner"; 
import { GlitchyToastProvider } from "@/hooks/use-toast"; // Import the provider

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
      <body
        className={`${inter.className} flex flex-col min-h-screen`}
      >
        <Suspense fallback={<LoadingSpinner />}>
          <AppProvider>
            <TopShelf />
            <main className="flex-grow pt-[64px] pb-[64px] min-h-[calc(100vh-128px)] overflow-y-auto backdrop-blur-lg bg-gradient-to-b from-black via-gray-900 to-black">
              <PageWrapper>
                {children}
              </PageWrapper>
            </main>
            <GlitchyToastProvider />
          </AppProvider>
        </Suspense>
      </body>
    </html>
  );
}
