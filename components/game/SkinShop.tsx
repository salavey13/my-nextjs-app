'use client'

import React, { useEffect, useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { motion } from 'framer-motion';
import { toast } from '@/hooks/use-toast';
import Image from 'next/image';
import { useGameProgression } from '@/hooks/useGameProgression';
import { ImageProps } from 'next/image';

interface Skin {
  id: string;
  cardsImgUrl: string;
  shirtImgUrl: string;
  creatorUsername: string;
  priceCoins: number;
  priceCrypto?: number;
}

const SkinShop = () => {
  const { state, dispatch, t } = useAppContext();
  const [otherPlayerSkins, setOtherPlayerSkins] = useState<Skin[]>([]);
  const [loading, setLoading] = useState(true);
  const { progressStage } = useGameProgression();

  useEffect(() => {
    const fetchOtherPlayerSkins = async () => {
      const { data, error } = await supabase
        .from('users')
        .select('telegram_username, game_state->settings->cardsImgUrl, game_state->settings->shirtImgUrl')
        .not('game_state->settings->cardsImgUrl', 'is', null)
        .not('game_state->settings->shirtImgUrl', 'is', null);

      if (error) {
        console.error('Error fetching player skins:', error);
        return;
      }

      const skins = data.map((user: any) => ({
        id: user.telegram_username,
        cardsImgUrl: user.game_state?.settings?.cardsImgUrl || '',
        shirtImgUrl: user.game_state?.settings?.shirtImgUrl || '',
        creatorUsername: user.telegram_username,
        priceCoins: Math.floor(Math.random() * 1000) + 100,
        priceCrypto: Math.random() * 0.1,
      }));

      setOtherPlayerSkins(skins);
      setLoading(false);
    };

    fetchOtherPlayerSkins();
  }, []);

  const handleBuySkin = async (skin: Skin) => {
    if (!state.user) return;

    try {
      const { data: userData, error: fetchError } = await supabase
        .from('users')
        .select('coins, game_state, loot')
        .eq('id', state.user.id)
        .single();

      if (fetchError) throw fetchError;

      if (userData.coins < skin.priceCoins) {
        toast({
          title: t('error'),
          description: t('notEnoughCoins'),
          variant: "destructive",
        });
        return;
      }

      const newCoinsValue = userData.coins - skin.priceCoins;
      const currentStage = userData.game_state.stage;
      const newStage = currentStage < 3 ? 3 : currentStage;

      const newLoot = {
        ...userData.loot,
        fool: {
          ...userData.loot?.fool,
          cards: {
            ...userData.loot?.fool?.cards,
            [skin.id]: {
              cards_img_url: skin.cardsImgUrl,
              shirt_img_url: skin.shirtImgUrl,
            },
          },
        },
      };

      const { error } = await supabase
        .from('users')
        .update({
          coins: newCoinsValue,
          game_state: { ...userData.game_state, stage: newStage },
          loot: newLoot,
        })
        .eq('id', state.user.id);

      if (error) throw error;

      dispatch({
        type: 'UPDATE_USER',
        payload: {
          coins: newCoinsValue,
          game_state: { ...userData.game_state, stage: newStage },
          loot: newLoot,
        },
      });

      toast({
        title: t('success'),
        description: t('skinPurchased'),
      });

      if (newStage > currentStage) {
        progressStage(newStage);
      }
    } catch (error) {
      console.error('Error buying skin:', error);
      toast({
        title: t('error'),
        description: t('generalError'),
        variant: 'destructive',
      });
    }
  };

  if (!state.user) return null;

  const playerStage = state.user.game_state.stage;
  const skins = state.user.game_state?.settings;
  const showOtherSkins = playerStage >= 0;
  const customizationUnlocked = playerStage >= 2;
  const showCryptoPrices = playerStage >= 3;

  const SkinCard = ({ skin }: { skin: Skin }) => (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="flex-shrink-0 w-48 bg-card text-card-foreground rounded-lg overflow-hidden shadow-lg"
    >
      <div className="relative h-32">
        <Image 
          src={skin.cardsImgUrl} 
          alt="Card skin" 
          width={192}
          height={128}
          className="w-full h-32 object-cover"
        />
        <Image 
          src={skin.shirtImgUrl} 
          alt="Shirt skin" 
          width={48}
          height={48}
          className="absolute bottom-0 right-0 w-12 h-12 object-cover"
        />
      </div>
      <div className="p-2">
        <h3 className="font-bold text-sm mb-1 truncate">{skin.creatorUsername}&apos;s Skin</h3>
        <div className="flex justify-between items-center">
          <span className="text-xs">{skin.priceCoins} {t('coins')}</span>
          {showCryptoPrices && <span className="text-xs">{skin.priceCrypto?.toFixed(3)} ETH</span>}
        </div>
        <Button className="w-full mt-2 text-xs" size="sm" onClick={() => handleBuySkin(skin)}>{t('buySkin')}</Button>
      </div>
    </motion.div>
  );

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{t('skinShop')}</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p>{t('loadingSkins')}</p>
        ) : (
          <>
            {showOtherSkins && otherPlayerSkins.length > 0 && (
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2">{t('featuredSkins')}</h3>
                <ScrollArea className="w-full whitespace-nowrap rounded-md border">
                  <div className="flex w-max space-x-4 p-4">
                    {otherPlayerSkins.map((skin) => (
                      <SkinCard key={skin.id} skin={skin} />
                    ))}
                  </div>
                  <ScrollBar orientation="horizontal" />
                </ScrollArea>
              </div>
            )}

            {customizationUnlocked && skins && (
              <div className="mt-4">
                <h3 className="text-lg font-semibold mb-2">{t('yourSkins')}</h3>
                <div className="flex space-x-4">
                  <SkinCard
                    skin={{
                      id: 'your-skin',
                      cardsImgUrl: skins.cardsImgUrl || '',
                      shirtImgUrl: skins.shirtImgUrl || '',
                      creatorUsername: state.user.telegram_username || 'You',
                      priceCoins: 0,
                    }}
                  />
                </div>
              </div>
            )}

            {!customizationUnlocked && (
              <p className="text-center mt-4">{t('keepPlayingToUnlock')}</p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default SkinShop;