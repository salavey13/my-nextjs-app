'use client'

import { ReactNode } from "react";
import TopShelf from "@/components/ui/topShelf";
import { TenantSelector } from '@/components/TenantSelector'

interface ClientLayoutProps {
  children: ReactNode;
  currentTenant: string;
  onTenantChange: (tenantId: string) => void;
  onTenantReset: () => void;
}

export default function ClientLayout({ children, currentTenant, onTenantChange, onTenantReset }: ClientLayoutProps) {
  return (
    <div className={`flex flex-col min-h-screen ${currentTenant === 'tarot' ? 'tenant-tarot' : ''}`}>
      <TopShelf />
      
      <main className="flex-grow overflow-y-auto pt-16 pb-16 backdrop-blur-lg bg-gradient-to-b from-black via-gray-900 to-black">
        <TenantSelector
          tenants={[
            { id: 'salavey13', name: 'SALAVEY13' },
            { id: 'tarot', name: 'Tarot' },
          ]}
          currentTenant={currentTenant}
          onTenantChange={onTenantChange}
          onReset={onTenantReset}
        />
        {children}
      </main>
    </div>
  );
}