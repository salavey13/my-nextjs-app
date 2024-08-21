import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { I18nextProvider } from 'react-i18next';
import i18n from '../i18n';
import { AppProvider } from "../context/AppContext";
import { ReactNode } from "react";
import React, { Suspense } from "react";
import TopShelf from "../components/ui/topShelf";
import BottomShelf from "../components/ui/bottomShelf";

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
        className={`${inter.className} bg-black text-white flex flex-col min-h-screen`}
      >
        <Suspense fallback={<div>Loading...</div>}>
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
