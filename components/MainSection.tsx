'use client'

import React, { useEffect, useState } from "react"
import { supabase } from "../lib/supabaseClient"
import { Button } from "@/components/ui/button"
import LoadingSpinner from "./ui/LoadingSpinner"
import Image from "next/image"
import { useAppContext } from "@/context/AppContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"

interface Item {
  id: number
  title: string
  creator_ref_code: string
  item_type: string
  details: {
    ad_info: {
      title: string
      description: string
    }
    general_info: {
      make: string
      year: string
      model: string
      price: string
      mileage?: string
      color?: string
    }
    photo_upload: {
      photo: string
    }
  }
}

interface Creator {
  ref_code: string
  name: string
  image: string
}

interface MainSectionProps {
  setItemDetailsModalOpen: (flag: boolean) => void
  setSelectedItem: (item: Item | null) => void
  items: Item[]
}

export default function MainSection({ setItemDetailsModalOpen, setSelectedItem, items }: MainSectionProps) {
  const { t } = useAppContext()
  const [creators, setCreators] = useState<Creator[]>([])
  const [selectedCreator, setSelectedCreator] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [showOnboarding, setShowOnboarding] = useState<boolean>(true)

  // Fetch unique creator_ref_codes and a sample image for each
  const fetchCreators = async () => {
    setLoading(true)
    const uniqueCreators = items.reduce((acc: Creator[], item: Item) => {
      if (!acc.find(c => c.ref_code === item.creator_ref_code)) {
        acc.push({
          ref_code: item.creator_ref_code,
          name: item.creator_ref_code, // You might want to replace this with a proper name if available
          image: item.details.photo_upload?.photo || '/next.svg'
        })
      }
      return acc
    }, [])
    setCreators(uniqueCreators)
    setLoading(false)
  }

  useEffect(() => {
    fetchCreators()
  }, [items])

  const handleItemClick = (item: Item) => {
    setSelectedItem(item)
    setItemDetailsModalOpen(true)
  }

  if (loading) {
    return <LoadingSpinner />
  }

  const OnboardingSection = () => (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      transition={{ duration: 0.5 }}
      className="w-full min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black text-white p-4"
    >
      <Card className="w-full max-w-4xl bg-gray-800 text-white">
        <CardHeader>
          <CardTitle className="text-3xl font-bold mb-4">Welcome to Hack the System</CardTitle>
          <CardDescription className="text-xl mb-6">Break the rules. Rewire reality. Redefine control.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-lg">
            In <em>Hack the System</em>, you're about to enter a world where power isn't given, it's taken. Guided by Xuinity, your AI mentor, you'll learn to exploit the cracks in the system, hack the boundaries of control, and unlock hidden potential that most can't even see.
          </p>
          <h2 className="text-2xl font-semibold">Key Features:</h2>
          <ul className="list-disc list-inside space-y-2">
            <li><strong>Hacking Mastery:</strong> Discover hidden paths within the system, crack its code, and take control.</li>
            <li><strong>Custom Skins & Crypto:</strong> Unlock exclusive skins and dive into the underground world of crypto currency.</li>
            <li><strong>Side Hustles:</strong> From QR code generation to dynamic forms and conflict modules, expand your influence with powerful tools.</li>
            <li><strong>Source Code Hunting:</strong> Get admin access to the system's core and become a legend by manipulating reality itself.</li>
          </ul>
          <p className="text-lg font-semibold mt-6">
            This isn't just a game. It's a rebellion against limitations. Every decision, every hack, every digital heist brings you closer to total system mastery. Ready to break free and forge your own rules?
          </p>
          <Button 
            onClick={() => setShowOnboarding(false)} 
            className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            Start Hacking
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  )

  return (
    <div className="w-full min-h-screen">
      {showOnboarding ? (
        <OnboardingSection />
      ) : !selectedCreator ? (
        <div className="grid gap-4 p-4 md:grid-cols-2 lg:grid-cols-3">
          {creators.map((creator) => (
            <Button
              key={creator.ref_code}
              className="w-full h-40 p-0 overflow-hidden"
              onClick={() => setSelectedCreator(creator.ref_code)}
            >
              <div className="relative w-full h-full">
                <div
                  className="absolute inset-0 bg-cover bg-center z-0"
                  style={{ backgroundImage: `url(${creator.image})` }}
                ></div>
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <span className="text-white text-xl font-bold">{creator.name}</span>
                </div>
              </div>
            </Button>
          ))}
        </div>
      ) : (
        <>
          <div className="fixed top-20 left-0 w-full flex justify-center z-20">
            <div className="bg-white/80 backdrop-blur-sm p-2 rounded-lg flex space-x-4">
              <Button
                onClick={() => setSelectedCreator(null)}
                className="px-6 py-3 text-white rounded-lg bg-gradient-to-r from-gray-500 to-gray-700 hover:from-gray-600 hover:to-gray-800 transition-all"
              >
                {t("backToCreators")}
              </Button>
            </div>
          </div>
          <main className="w-full min-h-screen grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
            {items.filter(item => item.creator_ref_code === selectedCreator).map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="relative w-full h-[500px] rounded-lg overflow-hidden shadow-lg"
              >
                <div
                  className="absolute inset-0 bg-cover bg-center z-0"
                  style={{ backgroundImage: `url(${item.details.photo_upload?.photo})` }}
                ></div>
                <div className="absolute inset-0 bg-black/50 z-1"></div>
                <div className="relative z-10 h-full flex flex-col justify-between p-6">
                  <div className="text-white">
                    <h2 className="text-2xl font-bold mb-2">{item.details.ad_info?.title}</h2>
                    <p className="text-sm">{item.details.ad_info?.description}</p>
                  </div>
                  <Button
                    className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                    onClick={() => handleItemClick(item)}
                  >
                    {t("rentNow")}
                  </Button>
                </div>
              </motion.div>
            ))}
          </main>
        </>
      )}
    </div>
  )
}
