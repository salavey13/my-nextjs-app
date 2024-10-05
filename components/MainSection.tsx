'use client'

import React, { useEffect, useState, useCallback } from "react"
import { supabase } from "../lib/supabaseClient"
import { Button } from "@/components/ui/button"
import LoadingSpinner from "./ui/LoadingSpinner"
import { useAppContext } from "@/context/AppContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

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

  const fetchCreators = useCallback(() => {
    const uniqueCreators = items.reduce((acc: { [key: string]: Creator }, item: Item) => {
      if (!acc[item.creator_ref_code]) {
        acc[item.creator_ref_code] = {
          ref_code: item.creator_ref_code,
          name: item.creator_ref_code,
          image: item.details.photo_upload?.photo || '/next.svg'
        };
      }
      return acc;
    }, {});

    return Object.values(uniqueCreators);
  }, [items]);

  useEffect(() => {
    setLoading(true);
    const newCreators = fetchCreators();
    setCreators(newCreators);
    setLoading(false);
  }, [fetchCreators]);

  const handleItemClick = (item: Item) => {
    setSelectedItem(item)
    setItemDetailsModalOpen(true)
  }

  if (loading) {
    return <LoadingSpinner />
  }

  const OnboardingSection = () => (
    <div className="w-full min-h-screen flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-black text-white p-4">
      <Card className="w-full max-w-4xl bg-gray-800 text-white">
        <CardHeader>
          <CardTitle className="text-3xl font-bold mb-4">Welcome to Hack the System</CardTitle>
          <CardDescription className="text-xl mb-6">Break the rules. Rewire reality. Redefine control.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-lg">
            In <em>Hack the System</em>, you&apos;re about to enter a world where power isn&apos;t given, it&apos;s taken. Guided by Xuinity, your AI mentor, you&apos;ll learn to exploit the cracks in the system, hack the boundaries of control, and unlock hidden potential that most can&apos;t even see.
          </p>
          <h2 className="text-2xl font-semibold">Key Features:</h2>
          <ul className="list-disc list-inside space-y-2">
            <li><strong>Deceptive Simplicity:</strong> Start with seemingly basic games that hide a deeper reality.</li>
            <li><strong>The Crash:</strong> Discover the hidden &quot;Hack the System&quot; button and witness a simulated system crash that reveals the true nature of the game.</li>
            <li><strong>Visual Programming:</strong> Learn coding concepts through an intuitive, visual interface.</li>
            <li><strong>The Bit Matrix:</strong> Manipulate the very fabric of the game world, and by extension, reality itself.</li>
            <li><strong>Ethical Dilemmas:</strong> Face moral choices that impact the game world and challenge your perception of right and wrong.</li>
            <li><strong>Blurred Reality:</strong> Experience a game that constantly questions the boundaries between the virtual and the real.</li>
          </ul>
          <p className="text-lg font-semibold mt-6">
            This isn&apos;t just a game. It&apos;s a rebellion against limitations, a journey into the heart of technology&apos;s potential, and a stark warning about the power we wield in the digital age. Are you ready to hack the system, or will the system hack you?
          </p>
          <Button 
            onClick={() => setShowOnboarding(false)} 
            className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            Enter the System
          </Button>
        </CardContent>
      </Card>
      <div className="w-full min-h-[calc(100vh-64px)]"/>
    </div>
  )

  return (
    <div className="w-full min-h-[calc(100vh-128px)] h-full overflow-y-scroll">
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
              <div
                key={item.id}
                className="relative w-full h-[500px] rounded-lg overflow-hidden shadow-lg"
              >
                <div
                  className="absolute inset-0 bg-cover bg-center z-0"
                  style={{ backgroundImage: `url(${item.details.photo_upload?.photo || '/placeholder.jpg'})` }}
                ></div>
                <div className="absolute inset-0 bg-black/50 z-1"></div>
                <div className="relative z-10 h-full flex flex-col justify-between p-6">
                  <div className="text-white">
                    <h2 className="text-2xl font-bold mb-2">{item.details.ad_info?.title || 'Untitled'}</h2>
                    <p className="text-sm">{item.details.ad_info?.description || 'No description available'}</p>
                  </div>
                  <Button
                    className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                    onClick={() => handleItemClick(item)}
                  >
                    {t("rentNow")}
                  </Button>
                </div>
              </div>
            ))}
          </main>
        </>
      )}
    </div>
  )
}
