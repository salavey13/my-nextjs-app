import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

interface InfinityMirrorProps {
  layers: number
  baseColor: string
  accentColor: string
}

export default function InfinityMirror({ layers = 10, baseColor = '#000000', accentColor = '#ffffff' }: InfinityMirrorProps) {
  const [gyro, setGyro] = useState({ x: 0, y: 0 })
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const requestRef = useRef<number>()
  const previousTimeRef = useRef<number>()

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if ('DeviceOrientationEvent' in window) {
        window.addEventListener('deviceorientation', handleOrientation)
      }
      window.addEventListener('mousemove', handleMouseMove)
    }
    return () => {
      if (typeof window !== 'undefined') {
        if ('DeviceOrientationEvent' in window) {
          window.removeEventListener('deviceorientation', handleOrientation)
        }
        window.removeEventListener('mousemove', handleMouseMove)
      }
    }
  }, [])

  const handleOrientation = (event: DeviceOrientationEvent) => {
    const x = event.gamma || 0 // Range: -90 to 90
    const y = event.beta || 0 // Range: -180 to 180
    setGyro({ x: x / 90, y: y / 180 })
  }

  const handleMouseMove = (event: MouseEvent) => {
    setMousePos({
      x: (event.clientX / window.innerWidth) * 2 - 1,
      y: (event.clientY / window.innerHeight) * 2 - 1,
    })
  }

  const animate = (time: number) => {
    if (previousTimeRef.current !== undefined) {
      setGyro((prevGyro) => ({
        x: prevGyro.x * 0.95 + mousePos.x * 0.05,
        y: prevGyro.y * 0.95 + mousePos.y * 0.05,
      }))
    }
    previousTimeRef.current = time
    requestRef.current = requestAnimationFrame(animate)
  }

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(requestRef.current!)
  }, [])

  return (
    <div className="w-full h-full overflow-hidden" style={{ backgroundColor: baseColor }}>
      {[...Array(layers)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-full h-full border-4 rounded-full"
          style={{
            borderColor: accentColor,
            scale: 1 - i * 0.1,
            opacity: 1 - i * 0.09,
          }}
          animate={{
            x: gyro.x * 50 * (i + 1),
            y: gyro.y * 50 * (i + 1),
            rotate: gyro.x * 5 * (i + 1),
          }}
          transition={{ type: 'spring', stiffness: 100, damping: 10 }}
        />
      ))}
    </div>
  )
}
