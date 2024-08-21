import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { I18nextProvider } from 'react-i18next';
import i18n from '../i18n';
import { AppProvider, useAppContext } from "../context/AppContext";
import { ReactNode } from "react";
import React, { useEffect, Suspense  } from "react";
import Footer from "../components/ui/footer";
import AdminDashboard from "../components/AdminDashboard";
import Referral from "../components/Referral";
import BottomShelf from "../components/ui/bottomShelf";
import TopShelf from "../components/ui/topShelf";

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
        className={`${inter.className} rounded bg-black-900 text-white`}
        style={{ display: 'flex', flexDirection: 'column' }}
      >
        <Suspense fallback={<div>Loading...</div>}>
        <AppProvider>
          
            <TopShelf />
            <div className="flex flex-col flex-grow container mx-auto p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-3xl font-bold">Калькулятор IQ/социальных показателей</h2>
              </div>
              {children}
              <AdminDashboard />
              <Referral />
              <Footer />
            </div>
            <BottomShelf />
          
        </AppProvider>
        </Suspense>
      </body>
    </html>
  );
}
