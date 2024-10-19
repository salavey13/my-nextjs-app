import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import QRCode from 'react-qr-code';
import { useAppContext } from '@/context/AppContext';

interface QRCodeGeneratorProps {
  onComplete: () => void;
}

export default function QRCodeGenerator({ onComplete }: QRCodeGeneratorProps) {
  const { t } = useAppContext();
  const [inputValue, setInputValue] = useState('');
  const [qrCodeValue, setQrCodeValue] = useState('');

  const handleGenerate = () => {
    setQrCodeValue(inputValue);
    if (inputValue.length > 0) {
      setTimeout(onComplete, 2000);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{t('qrCodeGenerator')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Input
            type="text"
            placeholder={t('enterQRContent')}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <Button onClick={handleGenerate}>{t('generateQRCode')}</Button>
          {qrCodeValue && (
            <div className="mt-4 flex justify-center">
              <QRCode value={qrCodeValue} size={200} />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}