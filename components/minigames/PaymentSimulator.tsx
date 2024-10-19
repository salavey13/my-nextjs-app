import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppContext } from '@/context/AppContext';

interface PaymentSimulatorProps {
  onComplete: () => void;
}

export default function PaymentSimulator({ onComplete }: PaymentSimulatorProps) {
  const { t } = useAppContext();
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = () => {
    if (amount && recipient) {
      setIsProcessing(true);
      setTimeout(() => {
        setIsProcessing(false);
        onComplete();
      }, 3000);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{t('paymentSimulator')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Input
            type="number"
            placeholder={t('enterAmount')}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <Input
            type="text"
            placeholder={t('enterRecipient')}
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
          />
          <Button onClick={handlePayment} disabled={isProcessing || !amount || !recipient}>
            {isProcessing ? t('processing') : t('sendPayment')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}