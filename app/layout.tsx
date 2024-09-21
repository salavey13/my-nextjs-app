// app\layout.tsx

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppProvider } from "../context/AppContext";
import { ReactNode, useEffect } from "react";
import React, { Suspense } from "react";
import TopShelf from "@/components/ui/topShelf";
import BottomShelf from "../components/ui/bottomShelf";
import LoadingSpinner from "../components/ui/LoadingSpinner"; 

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
        <Suspense fallback={<LoadingSpinner />}>  {/* Use the custom loading component */}
          <AppProvider>
            <TopShelf />
            <main className="flex-grow pt-[64px] pb-[64px] min-h-[calc(100vh-128px)] overflow-y-auto backdrop-blur-lg bg-gradient-to-b from-black via-gray-900 to-black">
              {children}
            </main>
            <BottomShelf />
          </AppProvider>
        </Suspense>
      </body>
    </html>
  );
}
