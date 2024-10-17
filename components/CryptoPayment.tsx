"use client";

import React, { useEffect, useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import QRCode from "react-qr-code";
import PaymentNotification from './PaymentNotification';
import { supabase } from "@/lib/supabaseClient";
import { useGameProgression } from '@/hooks/useGameProgression';
import UnlockChoice from './UnlockChoice'; // Import the UnlockChoice component
import { toast } from '@/hooks/use-toast'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export const CryptoPayment: React.FC<{ creatorTelegramId: string }> = ({ creatorTelegramId }) => {
    const { t, state, dispatch } = useAppContext();
    const [amount, setAmount] = useState<number | string>('');
    const [paymentLink, setPaymentLink] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
    const [targetWallet, setTargetWallet] = useState<string | null>(null);
    const [showUnlockChoice, setShowUnlockChoice] = useState(false); // Added state
    const { progressStage } = useGameProgression();
    const [sideHustles, setSideHustles] = useState<any[]>([]);
    const [showSideHustleModal, setShowSideHustleModal] = useState(false);
  
    const triggerSideHustleChoice = async () => {
      const currentStage = state.user?.game_state?.stage || 0;
      const { data, error } = await supabase
        .from('story_stages')
        .select('*')
        .eq('stage', currentStage)
        .neq('parentid', null);
  
      if (error) {
        console.error('Error fetching side hustles:', error);
      } else {
        setSideHustles(data || []);
        setShowSideHustleModal(true);
      }
    };
  
    const handleSideHustleChoice = async (sideHustle: any) => {
      setShowSideHustleModal(false);
      
      const updatedGameState = {
        ...state.user?.game_state,
        currentSideHustle: sideHustle.id,
      };
  
      dispatch({
        type: 'UPDATE_GAME_STATE',
        payload: updatedGameState,
      });
  
      const { error } = await supabase
        .from('users')
        .update({ game_state: updatedGameState })
        .eq('id', state.user?.id);
  
      if (error) {
        console.error('Error updating user game state:', error);
      } else {
        toast({
          title: t('sideHustleUnlocked'),
          description: sideHustle.storycontent,
        });
      }
    };

    useEffect(() => {
        const fetchWallet = async () => {
            const wallet = await fetchTargetWallet(creatorTelegramId);
            setTargetWallet(wallet);
        };

        fetchWallet();
    }, [creatorTelegramId]);

    useEffect(() => {
        if (paymentLink) {
            generateQrCode(paymentLink);
        }
    }, [paymentLink]);

    const generateQrCode = (link: string) => {
        setQrCodeUrl(link);
    };

    const handleGeneratePaymentLink = async () => {
        if (!amount || isNaN(Number(amount))) {
            toast({
                title: t('error'),
                description: t('invalidAmount'),
                variant: "destructive",
            });
            return;
        }
        setLoading(true);
        try {
            if (!targetWallet) throw new Error('Target wallet not available');
            if (!state.user?.ton_wallet) throw new Error('User wallet not available');

            const link = `ton://transfer/${state.user.ton_wallet}?amount=${amount}&to=${targetWallet}`;
            setPaymentLink(link);

            const currentStage = state.user.game_state?.stage ?? 0;
            if (currentStage === 3) {
                await progressStage(4, ["createEvent"]);
                dispatch({
                    type: 'UPDATE_GAME_STATE',
                    payload: { stage: 4, unlockedComponents: [...(state.user?.game_state?.unlockedComponents || []), 'createEvent'] }
                });
                setShowUnlockChoice(true);
            }
        } catch (error) {
            console.error('Error generating payment link:', error);
            toast({
                title: t('error'),
                description: t('errorGeneratingLink'),
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="p-6 bg-gray-800 rounded-lg shadow-lg">
            <h1 className="text-2xl font-bold text-white mb-4">
                {t('cryptoPayment')}
            </h1>
            <div className="mb-4">
                <label className="block text-gray-400 text-sm mb-1">
                    {t('amount')}
                </label>
                <Input
                    type="text"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="input input-bordered w-full bg-gray-700 text-white"
                    aria-label={t('amount')}
                />
            </div>
            <Button
                onClick={handleGeneratePaymentLink}
                className="btn btn-primary w-full"
                disabled={loading}
            >
                {loading ? <LoadingSpinner /> : t('generatePaymentLink')}
            </Button>
            {paymentLink && (
                <div className="mt-4">
                    <p className="text-gray-400">{t('paymentLinkGenerated')}</p>
                    <a
                        href={paymentLink}
                        className="text-blue-500 underline"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {paymentLink}
                    </a>
                    {qrCodeUrl && (
                        <div id="qrCodeElement" className="flex justify-center mt-4">
                            <QRCode value={qrCodeUrl} size={150} />
                        </div>
                    )}
                    <PaymentNotification link={paymentLink} />
                </div>
            )}
            {showUnlockChoice && <UnlockChoice />} {/* Added UnlockChoice component */}
            <Dialog open={showSideHustleModal} onOpenChange={setShowSideHustleModal}>
                <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t('chooseSideHustle')}</DialogTitle>
                    <DialogDescription>{t('sideHustleDescription')}</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4">
                    {sideHustles.map((sideHustle) => (
                    <Card key={sideHustle.id}>
                        <CardHeader>
                        <CardTitle>{sideHustle.activecomponent}</CardTitle>
                        </CardHeader>
                        <CardContent>
                        <p>{sideHustle.storycontent}</p>
                        <p className="font-bold mt-2">{t('achievement')}: {sideHustle.achievement}</p>
                        <Button onClick={() => handleSideHustleChoice(sideHustle)}>
                            {t('choose')}
                        </Button>
                    </CardContent>
                    </Card>
                    ))}
                </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export const fetchTargetWallet = async (creatorTelegramId: string): Promise<string> => {
    try {
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('ton_wallet')
            .eq('telegram_id', creatorTelegramId)
            .single();

        if (userError || !userData) {
            console.error('Error fetching user data:', userError);
            return '';
        }

        return userData.ton_wallet;
    } catch (error) {
        console.error('Unexpected error:', error);
        return '';
    }
};

export default CryptoPayment;