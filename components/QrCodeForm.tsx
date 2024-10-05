// components/QrCodeForm.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAppContext } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import QRCode from "react-qr-code";  // Updated QR Code library import 
import { useRouter } from "next/navigation";
import { usePathname } from 'next/navigation';
import { supabase } from "@/lib/supabaseClient";  // Make sure you have your Supabase client setup

const QrCodeForm: React.FC = () => {
  const { state, saveFormState, t } = useAppContext();
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);

  const handleSaveState = useCallback(async () => {
    // Save form state to Supabase and get the form ID
    const { data, error } = await supabase
      .from('forms')
      .insert([{ state: state.formState }])
      .select("id")
      .single();

    if (error) {
      console.error("Error saving form state:", error);
      return;
    }

    const formId = data?.id;
    if (formId) {
      const qrUrl = `https://t.me/oneSitePlsBot/vip?ref_form=${formId}`;
      setQrCodeUrl(qrUrl);
    }
  }, [state.formState]);

  useEffect(() => {
    handleSaveState();  // Automatically save and generate the QR code on component load
  }, [handleSaveState]);

  return (
    <div className="p-4 bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-lg font-semibold text-white mb-2">
        {t('qrCodeTitle')}
      </h2>
      <div className="mb-4 text-white">
        {t('qrCodeDescription')}
      </div>
      {qrCodeUrl && (
        <div className="mb-4 flex justify-center">
          <QRCode value={qrCodeUrl} size={150} />
        </div>
      )}
      <Button onClick={handleSaveState} className="btn btn-primary">
        {t('generateQrCode')}
      </Button>
    </div>
  );
};

export default QrCodeForm;
