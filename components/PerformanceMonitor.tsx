'use client'

import React, { useState, useEffect } from 'react'
import { Line } from 'react-chartjs-2'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

// Extend the Performance interface to include the non-standard memory property
interface ExtendedPerformance extends Performance {
  memory?: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  };
}

export const PerformanceMonitor: React.FC = () => {
  const [fps, setFps] = useState<number[]>([])
  const [memoryUsage, setMemoryUsage] = useState<number[]>([])

  useEffect(() => {
    let lastTime = performance.now()
    let frame = 0
    let fpsArray: number[] = []
    let memoryArray: number[] = []

    const loop = (time: number) => {
      const currentFps = Math.round(1000 / (time - lastTime))
      lastTime = time
      frame++

      if (frame % 60 === 0) {
        fpsArray.push(currentFps)
        setFps(fpsArray.slice(-60))

        const extendedPerformance = performance as ExtendedPerformance
        if (extendedPerformance.memory) {
          const memory = extendedPerformance.memory.usedJSHeapSize / 1048576
          memoryArray.push(memory)
          setMemoryUsage(memoryArray.slice(-60))
        }
      }

      requestAnimationFrame(loop)
    }

    requestAnimationFrame(loop)

    return () => {
      // Clean up if needed
    }
  }, [])

  const fpsData = {
    labels: fps.map((_, i) => i.toString()),
    datasets: [
      {
        label: 'FPS',
        data: fps,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  }

  const memoryData = {
    labels: memoryUsage.map((_, i) => i.toString()),
    datasets: [
      {
        label: 'Memory Usage (MB)',
        data: memoryUsage,
        borderColor: 'rgb(255, 99, 132)',
        tension: 0.1,
      },
    ],
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>FPS</CardTitle>
        </CardHeader>
        <CardContent>
          <Line data={fpsData} options={{ responsive: true, scales: { y: { beginAtZero: true } } }} />
        </CardContent>
      </Card>
      {memoryUsage.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Memory Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <Line data={memoryData} options={{ responsive: true, scales: { y: { beginAtZero: true } } }} />
          </CardContent>
        </Card>
      )}
    </div>
  )
}