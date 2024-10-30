'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Zap, Rocket, ExternalLink, Github, Youtube } from 'lucide-react'
import { useAppContext } from '../context/AppContext'
import useTelegram from '@/hooks/useTelegram'
import { useTheme } from '@/hooks/useTheme'

// Types for raw offer data from translations
interface RawOffer {
  title: string;
  subtitle?: string;
  description: string;
  [key: `feature${number}`]: string;
  [key: string]: string | undefined;
}

interface CoolOffers {
  heading: string;
  learnMore: string;
  watchTutorials: string;
  viewOnKwork: string;
  [key: string]: string | RawOffer;
}

// Type for processed offer data
interface ProcessedOffer {
  type: 'plan' | 'gig';
  title: string;
  subtitle?: string;
  description: string;
  features: string[];
  coolnessFactor: number;
}

type OfferEntry = [string, RawOffer];

export default function CoolOffersCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)
  const { t } = useAppContext()
  const { openLink } = useTelegram()
  const { theme } = useTheme()
  const containerRef = useRef<HTMLDivElement>(null)

  // Check if key in CoolOffers is an offer type
  const isOfferKey = (key: string): boolean => key.endsWith('Package') || key.startsWith('ai')

  // Verify if value matches RawOffer structure
  const isRawOffer = (value: unknown): value is RawOffer => {
    return typeof value === 'object' && 
           value !== null && 
           'title' in value && 
           'description' in value
  }

  // Type guard for offer entries
  const isOfferEntry = (entry: [string, unknown]): entry is OfferEntry => {
    const [key, value] = entry
    return isOfferKey(key) && isRawOffer(value)
  }

  // Helper to extract features from an offer
  const extractFeatures = (offer: RawOffer): string[] => {
    return Object.keys(offer)
      .filter(key => key.startsWith('feature'))
      .map(key => offer[key])
      .filter((value): value is string => typeof value === 'string')
  }

  // Add debug logging
  console.log('Raw coolOffers:', t('coolOffers'))
  const processedOffers = Object.entries(t('coolOffers') as unknown as CoolOffers)
    .filter(isOfferEntry)
    .map(([key, offer]): ProcessedOffer => ({
      type: key.includes('Package') ? 'plan' : 'gig',
      title: offer.title,
      subtitle: offer.subtitle,
      description: offer.description,
      features: extractFeatures(offer),
      coolnessFactor: key.includes('vip') ? 10 : 
                     key.includes('ai') ? 9 : 
                     key.includes('standard') ? 8 : 
                     key.includes('basic') ? 7 : 6
    }))
    .sort((a, b) => b.coolnessFactor - a.coolnessFactor)

  console.log('Processed offers:', processedOffers)

  const offers = processedOffers
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

  if (offers.length === 0) {
    console.log('No offers found')
    return <div className="p-4 text-center">No offers available</div>
  }

  const coolOffers = t('coolOffers') as unknown as CoolOffers

  return (
    <div className="w-full min-h-screen bg-background" style={{ backgroundColor: theme.colors.background.hex }}>
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6 text-center" style={{ color: theme.colors.foreground.hex }}>
          {coolOffers.heading}
        </h2>
        
        <div 
          ref={containerRef}
          className="relative overflow-hidden h-[600px] mb-16" // Fixed height
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div 
            className="flex transition-transform duration-300 ease-in-out absolute top-0 left-0 h-full" 
            style={{ 
              transform: `translateX(-${currentIndex * 100}%)`,
              width: `${offers.length * 100}%`
            }}
          >
            {offers.map((offer, index) => (
              <div key={index} className="w-full h-full flex-shrink-0 px-2">
                <Card 
                  className={`h-full overflow-auto ${
                    offer.type === 'plan' ? 'border-2' : 'border'
                  }`}
                  style={{
                    backgroundColor: theme.colors.muted.hex,
                    borderColor: offer.type === 'plan' ? theme.colors.primary.hex : theme.colors.accent.hex
                  }}
                >
                  <CardHeader className="sticky top-0 bg-inherit z-10">
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

        {/* Navigation and social links */}
        <div className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm p-4 border-t" style={{ backgroundColor: `${theme.colors.background.hex}CC` }}>
          <div className="container mx-auto">
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
                    {coolOffers.learnMore}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs"
                    onClick={() => openLink("https://youtube.com/salavey13")}
                  >
                    <Youtube className="w-3 h-3 mr-1" />
                    {coolOffers.watchTutorials}
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
              {coolOffers.viewOnKwork}
            </Button>
          </div>
        </div>

        {/*<div className="h-32" /> Padding for fixed navigation */}
        
      </div>
    </div>
  )
}
