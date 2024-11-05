"use client"

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppContext } from '@/context/AppContext';
import { useRouter } from 'next/navigation';
import TarotReadingComponent from './TarotReadingComponent';

export default function TarotContent() {
  const { t } = useAppContext();
  const router = useRouter();
  const [showReading, setShowReading] = useState(false);

  if (showReading) {
    return <TarotReadingComponent onBack={() => setShowReading(false)} />;
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <Card className="bg-primary/10 border-primary/20">
        <CardHeader>
          <CardTitle className="text-primary">{t("tarotWelcome")}</CardTitle>
          <CardDescription className="text-primary/60">
            {t("tarotDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={() => setShowReading(true)}
            variant="tarot"
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {t("startReading")}
          </Button>
          <Button 
            onClick={() => router.push('/tarot/history')}
            variant="outline"
            className="w-full border-primary text-primary hover:bg-primary/10"
          >
            {t("viewHistory")}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}