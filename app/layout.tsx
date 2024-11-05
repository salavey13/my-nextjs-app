import type { Metadata } from "next";
import { Inter, Roboto } from "next/font/google";
import "./globals.css";
import { AppProvider } from "../context/AppContext";
import { ReactNode } from "react";
import React, { Suspense } from "react";
import LoadingSpinner from "../components/ui/LoadingSpinner"; 
import { GlitchyToastProvider } from "@/hooks/use-toast";
import { ThemeProvider } from '@/context/ThemeContext'
import PageWrapper from "@/components/PageWrapper";

const inter = Inter({ subsets: ["latin"] });
const roboto = Roboto({ weight: ['400', '700'], subsets: ['latin'] });

export const metadata: Metadata = {
  title: "IQ/Social Score Calculator",
  description: "Manage your IQ and social credit.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${roboto.className} flex flex-col min-h-screen`}>
        <Suspense fallback={<LoadingSpinner />}>
          <ThemeProvider>
            <AppProvider>
              <PageWrapper>
                {children}
              </PageWrapper>
            </AppProvider>
          </ThemeProvider>
        </Suspense>
        <GlitchyToastProvider />
      </body>
    </html>
  );
}