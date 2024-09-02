// components/CryptoWithdrawal.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { useAppContext } from '@/context/AppContext';
import PaymentNotification from './PaymentNotification';

const CryptoWithdrawal: React.FC = () => {
    const { t, user } = useAppContext();
    const [withdrawalAmount, setWithdrawalAmount] = useState<number | string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [withdrawalLink, setWithdrawalLink] = useState<string | null>(null);

    const handleWithdrawal = async () => {
        if (!withdrawalAmount || isNaN(Number(withdrawalAmount))) {
            alert(t('invalidAmount'));
            return;
        }
        setLoading(true);
        try {
            // Assuming a backend endpoint for withdrawal
            const response = await fetch('/api/withdraw', {
                method: 'POST',
                body: JSON.stringify({
                    amount: withdrawalAmount,
                    userId: user?.id
                }),
            });

            if (!response.ok) {
                throw new Error('Error processing withdrawal');
            }

            const data = await response.json();
            setWithdrawalLink(data.link); // Assuming the backend returns a confirmation link or ID

        } catch (error) {
            console.error('Error processing withdrawal:', error);
            alert(t('errorProcessingWithdrawal'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 bg-gray-800 rounded-lg shadow-lg">
            <h1 className="text-2xl font-bold text-white mb-4">
                {t('cryptoWithdrawal')}
            </h1>
            <div className="mb-4">
                <label className="block text-gray-400 text-sm mb-1">
                    {t('amount')}
                </label>
                <Input
                    type="text"
                    value={withdrawalAmount}
                    onChange={(e) => setWithdrawalAmount(e.target.value)}
                    className="input input-bordered w-full bg-gray-700 text-white"
                    aria-label={t('amount')}
                />
            </div>
            <Button
                onClick={handleWithdrawal}
                className="btn btn-primary w-full"
                disabled={loading}
            >
                {loading ? <LoadingSpinner /> : t('processWithdrawal')}
            </Button>
            {withdrawalLink && (
                <div className="mt-4">
                    <p className="text-gray-400">{t('withdrawalProcessed')}</p>
                    <PaymentNotification link={withdrawalLink} />
                </div>
            )}
        </div>
    );
};

export default CryptoWithdrawal;
