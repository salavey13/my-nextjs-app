// components/Dashboard.tsx
"use client";

import React, { useEffect, useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import QRCode from "react-qr-code";
import PaymentNotification from './PaymentNotification';
import { supabase } from "../lib/supabaseClient";
//import { fetchTargetWallet } from "@/lib/fetchTargetWallet"; // Import the fetch function

export const CryptoPayment: React.FC<{ creatorTelegramId: string }> = ({ creatorTelegramId }) => {
    const { t, user } = useAppContext();
    const [amount, setAmount] = useState<number | string>('');
    const [paymentLink, setPaymentLink] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
    const [targetWallet, setTargetWallet] = useState<string | null>(null);

    // Fetch the target wallet when the component mounts or when creatorTelegramId changes
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
            alert(t('invalidAmount'));
            return;
        }
        setLoading(true);
        try {
            if (!targetWallet) throw new Error('Target wallet not available');

            // Create the payment link from the user's wallet to the target wallet
            const link = `ton://transfer/${user?.ton_wallet}?amount=${amount}&to=${targetWallet}`;
            setPaymentLink(link);
        } catch (error) {
            console.error('Error generating payment link:', error);
            alert(t('errorGeneratingLink'));
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


//export CryptoPayment;
export const fetchTargetWallet = async (creatorTelegramId: string): Promise<string> => {
    try {
        /* Fetch the rent record by creatorTelegramId (which corresponds to user_id)
        const { data: rentData, error: rentError } = await supabase
            .from('rents')
            .select('user_id')
            .eq('user_id', creatorTelegramId)
            .single();

        if (rentError || !rentData) {
            console.error('Error fetching rent data:', rentError);
            return null;
        }*/

        // Use the user_id from the rent record to fetch the ton_wallet from the users table
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('ton_wallet')
            .eq('telegram_id', creatorTelegramId)//rentData.user_id)
            .single();

        if (userError || !userData) {
            console.error('Error fetching user data:', userError);
            return '';
        }

        // Return the target wallet
        return userData.ton_wallet;
    } catch (error) {
        console.error('Unexpected error:', error);
        return '';
    }
};