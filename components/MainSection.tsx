'use client'

import React, { useEffect, useState } from "react"
import { supabase } from "../lib/supabaseClient"
import { Button } from "@/components/ui/button"
import LoadingSpinner from "./ui/LoadingSpinner"
import Link from "next/link"
import { useAppContext } from "@/context/AppContext"
import Image from "next/image"

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
      price: number
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

export default function MainSection() {
  const { t } = useAppContext()
  const [items, setItems] = useState<Item[]>([])
  const [creators, setCreators] = useState<Creator[]>([])
  const [selectedCreator, setSelectedCreator] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  // Fetch unique creator_ref_codes and a sample image for each
  const fetchCreators = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from("items")
      .select("creator_ref_code, details")
      .order("creator_ref_code")

    if (error) {
      console.error("Error fetching creators:", error)
    } else {
      const uniqueCreators = data.reduce((acc: Creator[], item: Item) => {
        if (!acc.find(c => c.ref_code === item.creator_ref_code)) {
          acc.push({
            ref_code: item.creator_ref_code,
            name: item.creator_ref_code, // You might want to replace this with a proper name if available
            image: item.details.photo_upload?.photo || '/placeholder.svg'
          })
        }
        return acc
      }, [])
      setCreators(uniqueCreators)
    }
    setLoading(false)
  }

  // Fetch items for a specific creator
  const fetchItems = async (creatorRefCode: string) => {
    setLoading(true)
    const { data, error } = await supabase
      .from("items")
      .select("*")
      .eq("creator_ref_code", creatorRefCode)

    if (error) {
      console.error("Error fetching data:", error)
    } else {
      setItems(data)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchCreators()
  }, [])

  useEffect(() => {
    if (selectedCreator) {
      fetchItems(selectedCreator)
    }
  }, [selectedCreator])

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="w-full min-h-screen">
      {!selectedCreator ? (
        <div className="grid gap-4 p-4">
          {creators.map((creator) => (
            <Button
              key={creator.ref_code}
              className="w-full h-40 p-0 overflow-hidden"
              onClick={() => setSelectedCreator(creator.ref_code)}
            >
              <div className="relative w-full h-full">
                <Image
                  src={creator.image}
                  alt={creator.name}
                  layout="fill"
                  objectFit="cover"
                />
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
          <main className="w-full h-screen items-center snap-y snap-mandatory overflow-y-scroll">
            {items.map((item) => (
              <section
                key={item.id}
                className="w-full h-[100vh] relative snap-start flex flex-col items-center justify-center"
              >
                <div
                  className="absolute inset-0 bg-cover bg-center z-0"
                  style={{ backgroundImage: `url(${item.details.photo_upload?.photo})` }}
                ></div>
                <div className="absolute inset-0 bg-black/50 z-1"></div>
                <div className="relative h-[69vh] items-center flex flex-col gap-[142px] justify-between">
                  <div className="relative z-10 text-white text-center px-8">
                    <h1 className="text-4xl font-bold mb-4 drop-shadow-lg">
                      {item.details.ad_info?.title}
                    </h1>
                    <p className="text-lg drop-shadow-lg mb-8">{item.details.ad_info?.description}</p>
                  </div>
                  <Button
                    className="relative z-10 px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg hover:from-blue-700 hover:to-blue-900 transition-all shadow-lg"
                    variant="outline"
                  >
                    <Link href={`https://t.me/oneSitePlsBot/vip?ref_item=${item.id}`}>
                      {t("rentNow")}
                    </Link>
                  </Button>
                </div>
              </section>
            ))}
          </main>
        </>
      )}
    </div>
  )
}
