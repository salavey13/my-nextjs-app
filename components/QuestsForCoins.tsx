// components/QuestsForCoins.tsx
"use client";

import React from 'react';
import { useAppContext } from '../context/AppContext';
import {Button} from './ui/button';
import Link from "next/link";

const QuestsForCoins: React.FC = () => {
    const { t } = useAppContext();

    const quests = [
        {
            id: 1,
            title: t('inviteFriends'),
            description: t('inviteFriendsDescription'),
            actionText: t('inviteFriendsAction'),
            action: () => {
                // Function to handle inviting friends
            },
            href: "/referral"
        },
        {
            id: 2,
            title: t('createFeature'),
            description: t('createFeatureDescription'),
            actionText: t('createFeatureAction'),
            action: () => {
                // Function to handle creating the first feature in dev mode
            
            },
            href: "/dev"
        }
        // Add more quests here as needed
    ];

    return (
        <div className="p-4 bg-white shadow-md rounded-md">
            <h1 className="text-xl font-bold mb-4">{t('questsTitle')}</h1>
            <ul>
                {quests.map((quest) => (
                    <li key={quest.id} className="mb-4">
                        <div className="text-lg font-semibold">{quest.title}</div>
                        <div className="text-sm text-gray-500">{quest.description}</div>
                        <Link
        
                            href={quest.href}>
        
        
                        <Button  className="mt-2">
                            {quest.actionText}
                        </Button>
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default QuestsForCoins;