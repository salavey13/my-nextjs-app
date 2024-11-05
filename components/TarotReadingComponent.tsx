"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/hooks/use-toast"
import { Loader2, CreditCard, ArrowLeft } from "lucide-react"
import { useTelegram } from '@/hooks/useTelegram'
import { useAppContext } from '@/context/AppContext'

const READING_COST = 5 // Cost in coins

interface TarotReadingComponentProps {
  onBack: () => void;
}

export default function TarotReadingComponent({ onBack }: TarotReadingComponentProps) {
  const [question, setQuestion] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { state, dispatch, t } = useAppContext()
  const router = useRouter()
  const { showPopup, showAlert, openLink } = useTelegram()
  

  const handleBuyCoins = async () => {
    try {
      const productId = "YOUR_DIGISELLER_PRODUCT_ID"
      const paymentUrl = `https://digiseller.market/${productId}`
      
      showPopup({
        title: t("buyCoins"),
        message: t("buyCoinsMessage"),
        buttons: [
          { text: t("buyNow"), type: "default" },
          { text: t("cancel"), type: "cancel" }
        ]
      }, (buttonText) => {
        if (buttonText === t("buyNow")) {
          openLink(paymentUrl)
        }
      })
    } catch (error) {
      console.error('Payment error:', error)
      showAlert(t("paymentError"))
    }
  }

  const handleSubmit = async () => {
    if (!question.trim()) {
      toast({
        title: t("error"),
        description: t("enterQuestion"),
        variant: "destructive"
      })
      return
    }

    if (!state.user || (state.user.balance ?? 0) < READING_COST) {
      showPopup({
        title: t("insufficientBalance"),
        message: t("insufficientBalanceMessage", { cost: READING_COST.toString() }),
        buttons: [
          { text: t("buyCoins"), type: "default" },
          { text: t("cancel"), type: "cancel" }
        ]
      }, (buttonText) => {
        if (buttonText === t("buyCoins")) {
          handleBuyCoins()
        }
      })
      return
    }

    setIsLoading(true)

    try {
      // Fetch latest news for context
      const newsResponse = await fetch('/api/news')
      const newsContext = await newsResponse.json()

      // Get tarot reading
      const response = await fetch('/api/tarot-reading', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: state.user.id,
          question,
          spreadType: 'general',
          newsContext,
          cost: READING_COST
        })
      })

      if (!response.ok) throw new Error('Failed to get reading')

      const reading = await response.json()

      // Update user balance
      dispatch({
        type: 'UPDATE_BALANCE',
        payload: (state.user.balance ?? 0) - READING_COST
      })

      // Navigate to results
      router.push(`/tarot/result/${reading.id}`)
    } catch (error) {
      toast({
        title: t("error"),
        description: t("readingError"),
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#020728] text-white p-4 pb-20">
      <Button variant="ghost" onClick={onBack} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        {t("back")}
      </Button>
      <Card className="w-full max-w-md mx-auto mt-8 bg-[#020728] border-primary/20">
        <CardHeader>
          <CardTitle className="text-primary">{t("tarotReading")}</CardTitle>
          <CardDescription className="text-primary/60">
            {t("tarotReadingDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder={t("enterQuestionPlaceholder")}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="min-h-[100px] bg-[#020728] border-primary/20 text-white placeholder:text-primary/40"
          />
          <div className="flex justify-between items-center text-primary/60">
            <span className="text-sm">{t("cost", { cost: READING_COST.toString() })}</span>
            <span className="text-sm">{t("balance", { balance: (state.user?.balance ?? 0).toString() })}</span>
          </div>
          <div className="space-y-2">
            <Button 
              variant="tarot"
              className="w-full bg-primary text-[#020728] hover:bg-primary/90"
              onClick={handleSubmit}
              disabled={isLoading || !question.trim() || !state.user || (state.user.balance ?? 0) < READING_COST}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("generatingReading")}
                </>
              ) : (
                t("getReading")
              )}
            </Button>
            <Button
              variant="outline"
              className="w-full border-primary text-primary hover:bg-primary/10"
              onClick={handleBuyCoins}
            >
              <CreditCard className="mr-2 h-4 w-4" />
              {t("buyCoins")}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}