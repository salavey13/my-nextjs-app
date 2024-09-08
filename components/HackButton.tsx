// components/HackButton.tsx
"use client";

import React, { useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { toast } from 'react-toastify';
import { supabase } from "../lib/supabaseClient";
import MergedGameBoard from './game/MergedGameBoard';

const HackButton: React.FC = () => {
  const { t, store } = useAppContext();

  const handleClick = async () => {
    try {
      // Update the user balance
      // Step 1: Fetch the current value of the 'coins' field
      const { data: user, error: fetchError } = await supabase
        .from('users')
        .select('coins')
        .eq('telegram_id', store.tg_id)
        .single();

      if (fetchError) {
        console.error('Error fetching user data:', fetchError);
        return;
      }

      // Step 2: Increment the 'coins' field by 13000
      const newCoinsValue = user.coins + 13000;

      const { data, error } = await supabase
        .from('users')
        .update({ coins: newCoinsValue })
        .eq('telegram_id', store.tg_id);

      if (error) {
        console.error('Error updating coins:', error);
      } else {
        console.log('Coins updated successfully:', data);
      }

      // Show success message
      alert(t('congratulationsMessage'));
    } catch (error) {
      console.error('Error updating balance:', error);
    } finally {
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-128px)]">
      {/* <Button
        onClick={handleClick}
        className="bg-blue-500 text-white text-xl px-6 py-3 rounded-lg shadow-lg hover:bg-blue-600 transition-all"
      >
        {t('hackButton')}
      </Button> */}
      <MergedGameBoard/>
    </div>
  );
};

export default HackButton;