'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Zap, Rocket, ExternalLink, Github, Youtube } from 'lucide-react'
import { useAppContext } from '../context/AppContext'
import useTelegram from '@/hooks/useTelegram'
import { useTheme } from '@/hooks/useTheme'

export default function CoolOffersCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)
  const { t } = useAppContext()
  const { openLink } = useTelegram()
  const { theme } = useTheme()
  const containerRef = useRef<HTMLDivElement>(null)

  // Dynamically generate offers from translation dictionary
  const offers = Object.entries(t('coolOffers') as Record<string, any>)
    .filter(([key]) => key !== 'viewOnKwork' && key !== 'learnMore')
    .map(([key, value]) => ({
      type: key.includes('Package') ? 'plan' : 'gig',
      title: value.title,
      subtitle: value.subtitle,
      description: value.description,
      features: Object.entries(value)
        .filter(([k]) => k.startsWith('feature'))
        .map(([_, v]) => v as string),
      coolnessFactor: key.includes('vip') ? 10 : 
                     key.includes('ai') ? 9 : 
                     key.includes('standard') ? 8 : 
                     key.includes('basic') ? 7 : 6
    }))
    .sort((a, b) => b.coolnessFactor - a.coolnessFactor)

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    
    const distance = touchStart - touchEnd
    const minSwipeDistance = 50

    if (Math.abs(distance) < minSwipeDistance) return

    if (distance > 0) {
      nextSlide()
    } else {
      prevSlide()
    }

    setTouchStart(0)
    setTouchEnd(0)
  }

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % offers.length)
  }

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + offers.length) % offers.length)
  }

  useEffect(() => {
    const interval = setInterval(nextSlide, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="w-full bg-background p-4 sm:p-6 md:p-8" style={{ backgroundColor: theme.colors.background.hex }}>
      <div 
        ref={containerRef}
        className="relative overflow-hidden touch-pan-y"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="flex transition-transform duration-300 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {offers.map((offer, index) => (
            <div key={index} className="w-full flex-shrink-0 px-2">
              <Card className={`h-full ${
                offer.type === 'plan' 
                  ? 'border-2'
                  : 'border'
              }`}
              style={{
                backgroundColor: theme.colors.muted.hex,
                borderColor: offer.type === 'plan' ? theme.colors.primary.hex : theme.colors.accent.hex
              }}>
                <CardHeader>
                  <CardTitle className="text-2xl sm:text-3xl font-bold" style={{ color: theme.colors.foreground.hex }}>
                    {offer.type === 'plan' ? <Rocket className="inline-block mr-2" /> : <Zap className="inline-block mr-2" />}
                    {offer.title}
                  </CardTitle>
                  {offer.subtitle && (
                    <CardDescription className="text-muted-foreground">{offer.subtitle}</CardDescription>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-foreground/80">{offer.description}</p>
                  <ul className="space-y-2">
                    {offer.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start text-foreground/60">
                        <span className="mr-2 text-xl" style={{ color: offer.type === 'plan' ? theme.colors.primary.hex : theme.colors.accent.hex }}>•</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation and social proof */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm p-4" style={{ backgroundColor: `${theme.colors.background.hex}CC` }}>
        <div className="flex justify-between items-center max-w-screen-xl mx-auto">
          <Button
            variant="outline"
            size="icon"
            className="bg-muted hover:bg-muted/80"
            onClick={prevSlide}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="flex flex-col items-center gap-4">
            <div className="flex space-x-2">
              {offers.map((_, index) => (
                <button
                  key={index}
                  className={`h-2 w-2 rounded-full transition-colors`}
                  style={{ 
                    backgroundColor: index === currentIndex ? theme.colors.primary.hex : theme.colors.muted.hex 
                  }}
                  onClick={() => setCurrentIndex(index)}
                />
              ))}
            </div>
            
            <div className="flex gap-2 text-sm text-muted-foreground">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs"
                onClick={() => openLink("https://github.com/salavey13")}
              >
                <Github className="w-3 h-3 mr-1" />
                {t('coolOffers.learnMore')}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs"
                onClick={() => openLink("https://youtube.com/salavey13")}
              >
                <Youtube className="w-3 h-3 mr-1" />
                {t('coolOffers.watchTutorials')}
              </Button>
            </div>
          </div>

          <Button
            variant="outline"
            size="icon"
            className="bg-muted hover:bg-muted/80"
            onClick={nextSlide}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <Button
          onClick={() => openLink("https://kwork.ru/website-development/36601783/telegram-mini-prilozhenie-s-bazoy-dannykh-na-supabase")}
          className="w-full mt-4"
          style={{ 
            backgroundColor: theme.colors.primary.hex,
            color: theme.colors.background.hex
          }}
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          {t('coolOffers.viewOnKwork')}
        </Button>
      </div>

      {/* Add bottom padding to account for fixed navigation */}
      <div className="h-32" />
    </div>
  )
}
