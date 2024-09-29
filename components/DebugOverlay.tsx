'use client'

import React from 'react'
import { useDebugStore } from '@/lib/debugUtils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useAppContext } from '@/context/AppContext'

export const DebugOverlay: React.FC = () => {
  const { isDebugMode, logs } = useDebugStore()
  const { user } = useAppContext()

  if (!isDebugMode) return null

  return (
    <Card className="fixed top-4 right-4 w-96 h-96 z-50 opacity-90 hover:opacity-100 transition-opacity">
      <CardHeader>
        <CardTitle>Debug Overlay</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-2">
          <strong>Game State:</strong> {JSON.stringify(user?.game_state, null, 2)}
        </div>
        <ScrollArea className="h-64">
          {logs.map((log, index) => (
            <div key={index} className="text-sm">{log}</div>
          ))}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}