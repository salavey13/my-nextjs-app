import React from 'react'
import { Dropdown } from '@/components/ui/dropdown'
import { Button } from '@/components/ui/button'
import { useAppContext } from '@/context/AppContext'

interface Tenant {
  id: string
  name: string
}

interface TenantSelectorProps {
  tenants: Tenant[]
  currentTenant: string
  onTenantChange: (tenantId: string) => void
  onReset: () => void
}

export function TenantSelector({ tenants, currentTenant, onTenantChange, onReset }: TenantSelectorProps) {
  const { t } = useAppContext()

  return (
    <div className="flex items-center space-x-2 mt-24 ml-8 gap-8">
      <Dropdown
        value={currentTenant}
        onChange={(e) => onTenantChange(e.target.value)}
        className="w-40"
      >
        {tenants.map((tenant) => (
          <option key={tenant.id} value={tenant.id}>
            {tenant.name}
          </option>
        ))}
      </Dropdown>
      {/* <Button onClick={onReset} variant="outline" size="sm">
        {t('reset')}
      </Button> */}
    </div>
  )
}