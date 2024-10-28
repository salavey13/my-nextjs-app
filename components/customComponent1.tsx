'use client'

import React, { useCallback } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Book, Globe, Search, ThumbsUp, Users } from "lucide-react"
import Head from 'next/head'

interface Section {
  title: string
  content: string
  icon: React.ReactNode
  color: string
}

interface SectionCardProps {
  section: Section
  index: number
}

// Optimized for performance with React.memo
const SectionCard: React.FC<SectionCardProps> = React.memo(({ section, index }) => (
  <motion.div
    id={`section-${index + 1}`}
    initial={{ opacity: 0, y: 50 }}
    animate={{ opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }}
    className="w-full max-w-md"
  >
    <Card className={`overflow-hidden ${section.color} hover:shadow-lg hover:shadow-blue-500/50 transition-shadow`}>
      <CardHeader className="flex flex-row items-center gap-2">
        <span className="sr-only">{`${section.title} 아이콘`}</span>
        {section.icon}
        <CardTitle className="text-xl font-bold ">{section.title}</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <Badge variant="outline" className="mb-2">섹션 {index + 1}</Badge>
        <p className="text-sm leading-relaxed text-secondary">
          {section.content.split(' ').map((word, i) => 
            i % 5 === 0 ? <strong key={i}>{word} </strong> : `${word} `
          )}
        </p>
      </CardContent>
    </Card>
  </motion.div>
))

SectionCard.displayName = 'SectionCard'

export default function CustomComponent1() {
  const sections: Section[] = [
    { title: "정보 평가하기", content: "정보를 평가하는 능력은 현대 사회에서 매우 중요합니다. 우리는 매일 수많은 정보에 노출되며, 이를 올바르게 평가하고 분석할 수 있어야 합니다.", icon: <Book className="w-6 h-6" aria-hidden="true" />, color: "bg-gray-800 text-gray-200" },
    { title: "다양한 관점의 가치", content: "하나의 시각에만 의존하는 것은 위험할 수 있습니다. 다양한 관점을 고려하고 비교함으로써 더 균형 잡힌 이해를 얻을 수 있습니다.", icon: <Globe className="w-6 h-6" aria-hidden="true" />, color: "bg-gray-700 text-gray-200" },
    { title: "사실 확인의 기술", content: "정보가 어디서 왔는지, 누가 작성했는지, 어떤 목적으로 만들어졌는지를 확인하는 것이 중요합니다. 이는 허위 정보를 식별하는 데 도움이 됩니다.", icon: <Search className="w-6 h-6" aria-hidden="true" />, color: "bg-gray-600 text-gray-200" },
    { title: "미디어 이해력 증진", content: "모든 미디어 플랫폼이 동일한 기준으로 운영되지 않습니다. 각 플랫폼의 특성과 한계를 이해하는 것이 중요합니다.", icon: <ThumbsUp className="w-6 h-6" aria-hidden="true" />, color: "bg-gray-500 text-gray-200" },
    { title: "대화와 논의의 힘", content: "서로 다른 시각을 가진 사람들과 대화하고 토론하는 것은 우리의 이해를 넓히고 비판적 사고 능력을 향상시킵니다.", icon: <Users className="w-6 h-6" aria-hidden="true" />, color: "bg-gray-400 text-gray-800" }
  ]

  const handleCardFocus = useCallback((index: number) => {
    document.getElementById(`section-${index + 1}`)?.focus()
  }, [])

  return (
    <>
      <Head>
        <title>정보 리터러시의 중요성 | 미디어 편향성과 사실 확인</title>
        <meta name="description" content="정보 평가, 미디어 이해력, 사실 확인의 중요성에 대해 알아보세요." />
        <meta name="keywords" content="정보 리터러시, 미디어 편향성, 사실 확인, 비판적 사고" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": "정보 리터러시의 중요성",
            "description": "정보 평가, 미디어 이해력, 사실 확인의 중요성에 대해 알아보세요.",
            "author": { "@type": "Organization", "name": "Information Literacy Center" }
          })}
        </script>
      </Head>
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 p-4 space-y-8">
        <h1 className="text-3xl font-bold text-white mb-8">정보 리터러시의 중요성</h1>
        <nav className="mb-8">
          <ul className="flex space-x-4">
            {sections.map((section, index) => (
              <li key={index}>
                <a
                  href={`#section-${index + 1}`}
                  className="text-blue-400 hover:text-blue-300 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onClick={() => handleCardFocus(index)}
                >
                  섹션 {index + 1}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        {sections.map((section, index) => (
          <SectionCard key={index} section={section} index={index} />
        ))}
        <div className="flex flex-col md:flex-row items-center gap-4 mt-8">
          <a href="https://www.snopes.com/" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all active:scale-95">
            사실 확인 도구
          </a>
          <a href="https://mediabiasfactcheck.com/" className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all active:scale-95">
            미디어 편향성 차트
          </a>
          <a href="https://translate.google.com/translate?sl=en&tl=ko&u=https://unhuilome.framer.ai" className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all active:scale-95">
            더 많은 정보 보기
          </a>
        </div>
      </div>
    </>
  )
}