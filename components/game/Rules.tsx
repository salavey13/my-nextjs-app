import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { useAppContext } from '@/context/AppContext'
import { motion } from 'framer-motion'

interface RulesProps {
  onClose: () => void
}

const Rules: React.FC<RulesProps> = ({ onClose }) => {
  const { t } = useAppContext()
  const [language, setLanguage] = useState<'en' | 'ru'>('en')

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'ru' : 'en')
  }

  const rules = {
    en: [
      "Each player rolls two dice.",
      "The sum of the dice values is added to the player's score.",
      "In two-player mode, the player with the highest score after a set number of rounds wins.",
      "In single-player mode, try to achieve the highest score possible."
    ],
    ru: [
      "Каждый игрок бросает два кубика.",
      "Сумма значений на кубиках добавляется к счету игрока.",
      "В режиме для двух игроков побеждает игрок с наибольшим счетом после определенного количества раундов.",
      "В одиночном режиме попытайтесь достичь максимально возможного счета."
    ]
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50"
    >
      <div className="bg-gray-800 p-8 rounded-lg max-w-md w-full">
        <h2 className="text-3xl font-bold mb-6 text-center text-yellow-400">{t('rules')}</h2>
        <ul className="space-y-4 mb-6">
          {rules[language].map((rule, index) => (
            <motion.li
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-start"
            >
              <span className="text-yellow-400 mr-2">{index + 1}.</span>
              <span>{rule}</span>
            </motion.li>
          ))}
        </ul>
        <div className="flex justify-between">
          <Button onClick={toggleLanguage} variant="outline">
            {language === 'en' ? 'Switch to Russian' : 'Переключить на английский'}
          </Button>
          <Button onClick={onClose}>{t('close')}</Button>
        </div>
      </div>
    </motion.div>
  )
}

export default Rules