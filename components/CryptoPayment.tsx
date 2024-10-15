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

import { toast } from '@/hooks/use-toast';
export const CryptoPayment: React.FC<{ creatorTelegramId: string }> = ({ creatorTelegramId }) => {
    const { t, state, dispatch } = useAppContext();
    const [amount, setAmount] = useState<number | string>('');
    const [paymentLink, setPaymentLink] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
    const [targetWallet, setTargetWallet] = useState<string | null>(null);
    const { progressStage } = useGameProgression();

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
            if (currentStage < 4) {
                await progressStage(4);
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