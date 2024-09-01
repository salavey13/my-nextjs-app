// components/CryptoPayment.tsx
"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input }  from "@/components/ui/input";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { useAppContext } from '@/context/AppContext';

const CryptoPayment: React.FC = () => {
    const { t, user } = useAppContext();
    const [amount, setAmount] = useState<number | string>('');
    const [paymentLink, setPaymentLink] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    const handleGeneratePaymentLink = async () => {
        if (!amount || isNaN(Number(amount))) {
            alert(t('invalidAmount'));
            return;
        }
        setLoading(true);
        try {
            // Replace with actual link generation logic
            const link = `https://ton.org/send?amount=${amount}&to=${user?.ton_wallet}`;
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
                </div>
            )}
        </div>
    );
};

export default CryptoPayment;