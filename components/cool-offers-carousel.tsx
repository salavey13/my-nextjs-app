'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Zap, Rocket, ExternalLink, Github, Youtube } from 'lucide-react'
import { useAppContext } from '../context/AppContext'
import useTelegram from '@/hooks/useTelegram'
import { useTheme } from '@/hooks/useTheme'

// Hardcoded offers structure for reliability, content will be translated
const DEFAULT_OFFERS = [
  {
    type: 'plan',
    titleKey: 'coolOffers.vipPackage.title',
    subtitleKey: 'coolOffers.vipPackage.subtitle',
    descriptionKey: 'coolOffers.vipPackage.description',
    features: [
      'coolOffers.vipPackage.feature1',
      'coolOffers.vipPackage.feature2',
      'coolOffers.vipPackage.feature3',
      'coolOffers.vipPackage.feature4',
      'coolOffers.vipPackage.feature5'
    ],
    coolnessFactor: 10
  },
  {
    type: 'gig',
    titleKey: 'coolOffers.aiAutomation.title',
    descriptionKey: 'coolOffers.aiAutomation.description',
    features: [
      'coolOffers.aiAutomation.feature1',
      'coolOffers.aiAutomation.feature2',
      'coolOffers.aiAutomation.feature3',
      'coolOffers.aiAutomation.feature4'
    ],
    coolnessFactor: 9
  },
  {
    type: 'plan',
    titleKey: 'coolOffers.standardPackage.title',
    subtitleKey: 'coolOffers.standardPackage.subtitle',
    descriptionKey: 'coolOffers.standardPackage.description',
    features: [
      'coolOffers.standardPackage.feature1',
      'coolOffers.standardPackage.feature2',
      'coolOffers.standardPackage.feature3',
      'coolOffers.standardPackage.feature4'
    ],
    coolnessFactor: 8
  },
  {
    type: 'gig',
    titleKey: 'coolOffers.aiComponents.title',
    descriptionKey: 'coolOffers.aiComponents.description',
    features: [
      'coolOffers.aiComponents.feature1',
      'coolOffers.aiComponents.feature2',
      'coolOffers.aiComponents.feature3',
      'coolOffers.aiComponents.feature4'
    ],
    coolnessFactor: 7
  },
  {
    type: 'plan',
    titleKey: 'coolOffers.basicPackage.title',
    subtitleKey: 'coolOffers.basicPackage.subtitle',
    descriptionKey: 'coolOffers.basicPackage.description',
    features: [
      'coolOffers.basicPackage.feature1',
      'coolOffers.basicPackage.feature2',
      'coolOffers.basicPackage.feature3',
      'coolOffers.basicPackage.feature4'
    ],
    coolnessFactor: 6
  },
  {
    type: 'gig',
    titleKey: 'coolOffers.aiWebsite.title',
    descriptionKey: 'coolOffers.aiWebsite.description',
    features: [
      'coolOffers.aiWebsite.feature1',
      'coolOffers.aiWebsite.feature2',
      'coolOffers.aiWebsite.feature3',
      'coolOffers.aiWebsite.feature4'
    ],
    coolnessFactor: 5
  }
]

export default function CoolOffersCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)
  const { t } = useAppContext()
  const { openLink } = useTelegram()
  const { theme } = useTheme()
  const containerRef = useRef<HTMLDivElement>(null)

  // Transform offers with translations
  const offers = DEFAULT_OFFERS.map(offer => ({
    ...offer,
    title: t(offer.titleKey),
    subtitle: offer.subtitleKey ? t(offer.subtitleKey) : undefined,
    description: t(offer.descriptionKey),
    features: offer.features.map(fKey => t(fKey))
  }))

  const handleTouchStart = (e: React.TouchEvent) => setTouchStart(e.targetTouches[0].clientX)
  const handleTouchMove = (e: React.TouchEvent) => setTouchEnd(e.targetTouches[0].clientX)
  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    const distance = touchStart - touchEnd
    const minSwipeDistance = 50
    if (Math.abs(distance) >= minSwipeDistance) {
      distance > 0 ? nextSlide() : prevSlide()
    }
    setTouchStart(0)
    setTouchEnd(0)
  }

  const nextSlide = () => setCurrentIndex((prevIndex) => (prevIndex + 1) % offers.length)
  const prevSlide = () => setCurrentIndex((prevIndex) => (prevIndex - 1 + offers.length) % offers.length)

  useEffect(() => {
    const interval = setInterval(nextSlide, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="w-full bg-background/95">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6 text-center" style={{ color: theme.colors.foreground.hex }}>
          {t('coolOffers.heading')}
        </h1>
        
        {/* Main carousel section */}
        <div className="relative mb-8">
          {/* Carousel container */}
          <div 
            ref={containerRef}
            className="relative overflow-hidden rounded-lg"
            style={{ height: 'calc(100vh - 200px)', minHeight: '500px', maxHeight: '800px' }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div 
              className="flex transition-transform duration-300 ease-in-out absolute top-0 left-0 h-full"
              style={{ 
                transform: `translateX(-${currentIndex * 100}%)`,
                width: `${offers.length * 100}%`,
              }}
            >
              {offers.map((offer, index) => (
                <div key={index} className="w-full h-full rounded-lg p-2 md:p-4 flex-shrink-0">
                  <Card 
                    className={`h-full w-full overflow-auto rounded-lg ${
                      offer.type === 'plan' ? 'border-2' : 'border'
                    }`}
                    style={{
                      backgroundColor: theme.colors.background.hex,
                      borderColor: offer.type === 'plan' ? theme.colors.primary.hex : theme.colors.accent.hex,
                      minHeight: '300px',
                      maxWidth: '300px'
                    }}
                  >
                    <CardHeader className="sticky top-0 bg-background/95 border-b backdrop-blur-md">
                      <CardTitle className="text-xl sm:text-2xl md:text-3xl font-bold text-primary">
                        {offer.type === 'plan' ? <Rocket className="inline-block mr-2" /> : <Zap className="inline-block mr-2" />}
                        {offer.title}
                      </CardTitle>
                      {offer.subtitle && (
                        <CardDescription className="text-foreground/90">{offer.subtitle}</CardDescription>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-6 p-4 md:p-6">
                      <p className="text-background/90 text-base md:text-lg">{offer.description}</p>
                      <ul className="space-y-3">
                        {offer.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start text-foreground/80">
                            <span className="mr-2 text-xl" style={{ color: offer.type === 'plan' ? theme.colors.primary.hex : theme.colors.accent.hex }}>•</span>
                            <span className="text-secondary-foreground/80 text-sm md:text-base">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
          
          {/* Controls section - now part of the carousel */}
          <div className="mt-4 bg-background/95 rounded-lg p-4">
            <div className="flex flex-col gap-4">
              {/* Navigation controls */}
              <div className="flex justify-between items-center">
                <Button
                  variant="outline"
                  size="icon"
                  className="bg-background hover:bg-accent hover:text-accent-foreground"
                  onClick={prevSlide}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <div className="flex flex-col items-center gap-4">
                  <div className="flex space-x-2">
                    {offers.map((_, index) => (
                      <button
                        key={index}
                        className={`h-2 w-2 rounded-lg transition-colors ${
                          index === currentIndex ? 'bg-primary' : 'bg-muted'
                        }`}
                        onClick={() => setCurrentIndex(index)}
                      />
                    ))}
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="icon"
                  className="bg-background hover:bg-accent hover:text-accent-foreground"
                  onClick={nextSlide}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs bg-background hover:bg-accent hover:text-accent-foreground"
                  onClick={() => openLink("https://github.com/salavey13")}
                >
                  <Github className="w-3 h-3 mr-1" />
                  {t('coolOffers.learnMore')}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs bg-background hover:bg-accent hover:text-accent-foreground"
                  onClick={() => openLink("https://youtube.com/salavey13")}
                >
                  <Youtube className="w-3 h-3 mr-1" />
                  {t('coolOffers.watchTutorials')}
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  className="text-xs"
                  onClick={() => openLink("https://kwork.ru/website-development/36601783/telegram-mini-prilozhenie-s-bazoy-dannykh-na-supabase")}
                >
                  <ExternalLink className="w-3 h-3 mr-1" />
                  {t('coolOffers.viewOnKwork')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
