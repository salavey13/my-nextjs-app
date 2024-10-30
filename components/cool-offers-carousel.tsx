'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Zap, Rocket, ExternalLink, Github, Youtube } from 'lucide-react'
import { useAppContext } from '../context/AppContext'
import useTelegram from '@/hooks/useTelegram'
import { useTheme } from '@/hooks/useTheme'

// Hardcoded offers for reliability
const DEFAULT_OFFERS = [
  {
    type: 'plan',
    title: "VIP Package",
    subtitle: "High-Level Telegram App with Smart Access, Custom User Progression & AI Guidance",
    description: "Get the ultimate Telegram app, loaded with smart access controls, progressive unlocking, and an AI-powered tab to help users build out new features as they go.",
    features: [
      "Full Custom Interface & UX",
      "Supabase with Full RLS & Custom Role Setup",
      "AI-Powered Dev Tab for Content Creation",
      "Step-by-Step User Learning & Engagement",
      "Multi-Stage Role Access"
    ],
    coolnessFactor: 10
  },
  {
    type: 'gig',
    title: "AI Automation Pipeline Setup",
    description: "Set up an AI-driven automation pipeline tailored to your needs. Perfect for agencies, product sites, or any project that requires a scalable, high-efficiency web automation setup.",
    features: [
      "Custom AI automation pipeline configuration",
      "Component integration & automated deployment",
      "Advanced control panel for managing updates",
      "Instructions and ongoing support"
    ],
    coolnessFactor: 9
  },
  {
    type: 'plan',
    title: "Standard Package",
    subtitle: "Advanced Telegram App with Stepwise Access & Learning System",
    description: "Get an advanced Telegram mini app with custom role access, data security, and phased feature unlocking.",
    features: [
      "Advanced Interface",
      "Enhanced User Data Security with Row Level Security",
      "Custom Role & Access Setup",
      "Stepwise Feature Unlocking"
    ],
    coolnessFactor: 8
  },
  {
    type: 'gig',
    title: "AI-Powered Web Components",
    description: "Get custom AI-powered web components tailored to your project's needs, ensuring a seamless user experience and compatibility across devices.",
    features: [
      "Custom AI-driven component development",
      "Responsive design and cross-platform functionality",
      "Full testing and integration support",
      "Post-deployment support"
    ],
    coolnessFactor: 7
  },
  {
    type: 'plan',
    title: "Basic Package",
    subtitle: "Essential Telegram Mini App with User Data & Role Access",
    description: "Get a basic Telegram mini app that handles user data, simple role-based access, and a clean, straightforward interface.",
    features: [
      "Basic Interface",
      "Simple User Data Setup",
      "Role-Based Access Control",
      "Core Tabs Only"
    ],
    coolnessFactor: 6
  },
  {
    type: 'gig',
    title: "AI-Powered Website Creation",
    description: "Get a professional, responsive website built using advanced AI tools, ensuring it's visually striking and optimized for conversions.",
    features: [
      "AI-based custom design",
      "Responsive layouts for mobile and desktop",
      "Basic SEO optimization",
      "100% stress-free process"
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

  // Always use hardcoded offers for now
  const offers = DEFAULT_OFFERS

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
    <div className="w-full min-h-screen bg-background" style={{ backgroundColor: theme.colors.background.hex }}>
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6 text-center" style={{ color: theme.colors.foreground.hex }}>
          Kwork Gigs
        </h2>
        
        <div 
          ref={containerRef}
          className="relative overflow-hidden h-[600px] mb-16"
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
                    Learn More
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs"
                    onClick={() => openLink("https://youtube.com/salavey13")}
                  >
                    <Youtube className="w-3 h-3 mr-1" />
                    Watch Tutorials
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
              View Service on Kwork
            </Button>
          </div>
        </div>

        {/* Padding for fixed navigation */}
        <div className="h-32" />
      </div>
    </div>
  )
}
