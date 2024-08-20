import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppProvider, useAppContext } from "../context/AppContext";
import { ReactNode } from "react";
import React, { useEffect } from "react";
import { useTranslation, TranslationProvider } from '../utils/TranslationUtils'; // Adjust the import path as needed
import Footer from "../components/ui/footer";
import AdminDashboard from "../components/AdminDashboard";
import Referral from "../components/Referral";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "IQ/Social Score Calculator",
  description: "Manage your IQ and social credit scenarios.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  //const { t } = useTranslation();
  //`{t("calcTitle")}`
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
                <h2 className="text-3xl font-bold">Калькулятор IQ/социальных показателей</h2>
              </div>
              {children}
              <AdminDashboard />
              <Referral />
              <Footer />
            </div>
          </TranslationProvider>
        </AppProvider>
      </body>
      
    </html>
  );
}
