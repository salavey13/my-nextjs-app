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
        <CardTitle className="text-3xl font-bold mb-4">{t('onboarding.welcome')}</CardTitle>
        <CardDescription className="text-xl mb-6">{t('onboarding.description')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-lg">
          {t('onboarding.intro')}
        </p>
        <h2 className="text-2xl font-semibold">{t('onboarding.keyFeatures')}</h2>
        <ul className="list-disc list-inside space-y-2">
          <li><strong>{t('onboarding.features.deceptiveSimplicityTitle')}:</strong> {t('onboarding.features.deceptiveSimplicityDesc')}</li>
          <li><strong>{t('onboarding.features.crashTitle')}:</strong> {t('onboarding.features.crashDesc')}</li>
          <li><strong>{t('onboarding.features.visualProgrammingTitle')}:</strong> {t('onboarding.features.visualProgrammingDesc')}</li>
          <li><strong>{t('onboarding.features.bitMatrixTitle')}:</strong> {t('onboarding.features.bitMatrixDesc')}</li>
          <li><strong>{t('onboarding.features.ethicalDilemmasTitle')}:</strong> {t('onboarding.features.ethicalDilemmasDesc')}</li>
          <li><strong>{t('onboarding.features.blurredRealityTitle')}:</strong> {t('onboarding.features.blurredRealityDesc')}</li>
        </ul>
        <p className="text-lg font-semibold mt-6">
          {t('onboarding.conclusion')}
        </p>
        <Button 
          onClick={() => setShowOnboarding(false)} 
          className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200"
        >
          {t('onboarding.enterButton')}
        </Button>
      </CardContent>
    </Card>
   </div>
)


  return (
    <>
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
     <div className="w-full min-h-[calc(100vh-64px)]"/>
    </> 
  )
}
