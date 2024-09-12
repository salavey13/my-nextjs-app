// app\layout.tsx

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import { I18nextProvider } from 'react-i18next';
import { AppProvider } from "../../context/AppContext";
import { ReactNode, useEffect } from "react";
import React, { Suspense } from "react";
import TopShelf from "@/components/ui/topShelf";
import BottomShelf from "../../components/ui/bottomShelf";
import LoadingSpinner from "../../components/ui/LoadingSpinner"; 
//import ThemeHandler from "../components/ThemeHandler";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "IQ/Social Score Calculator",
  description: "Manage your IQ and social credit scenarios.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  
  // useEffect(() => {
  //   const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)").matches;

  //   if (prefersDarkScheme) {
  //     document.documentElement.classList.add("dark");
  //   } else {
  //     document.documentElement.classList.remove("dark");
  //   }

  //   const themeChangeListener = (e: MediaQueryListEvent) => {
  //     if (e.matches) {
  //       document.documentElement.classList.add("dark");
  //     } else {
  //       document.documentElement.classList.remove("dark");
  //     }
  //   };

  //   window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", themeChangeListener);

  //   return () => {
  //     window.matchMedia("(prefers-color-scheme: dark)").removeEventListener("change", themeChangeListener);
  //   };
  // }, []);//bg-black text-white 


  return (
    <html lang="en">
      <body
        className={`${inter.className} flex flex-col min-h-[calc(100vh-128px)]`}
      >
        {/* <ThemeHandler /> */}
        <Suspense fallback={<LoadingSpinner />}>  {/* Use the custom loading component */}
          <AppProvider>
            <TopShelf />
            <main className="flex-grow pt-[64px] pb-[64px] min-h-[calc(100vh-128px)] overflow-y-auto backdrop-blur-lg bg-gradient-to-b from-black via-gray-900 to-black">
              {children}
            </main>
            {/* <BottomShelf /> */}
          </AppProvider>
        </Suspense>
      </body>
    </html>
  );
}