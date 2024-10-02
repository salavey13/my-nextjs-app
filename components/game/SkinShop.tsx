// components\game\SkinShop.tsx
'use client'

import React, { useEffect, useState } from 'react';
import { UserData, useAppContext } from '@/context/AppContext';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { motion } from 'framer-motion';

interface Skin {
  id: string;
  cardsImgUrl: string;
  shirtImgUrl: string;
  creatorUsername: string;
  priceCoins: number;
}

const SkinShop = () => {
  const { state, canShowOtherSkins, isCustomizationUnlocked } = useAppContext();
  const [otherPlayerSkins, setOtherPlayerSkins] = useState<Skin[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOtherPlayerSkins = async () => {
      const { data, error } = await supabase
        .from('users')
        .select('telegram_username, loot->fool->cards->cards_img_url, loot->fool->cards->shirt_img_url');

      if (error) {
        console.error('Error fetching player skins:', error);
        return;
      }

      const skins = data.map((user: any) => ({
        id: user.telegram_username,
        cardsImgUrl: user.loot?.fool?.cards?.cards_img_url || '',
        shirtImgUrl: user.loot?.fool?.cards?.shirt_img_url || '',
        creatorUsername: user.telegram_username,
        priceCoins: Math.floor(Math.random() * 1000) + 100, // Random price between 100 and 1100 coins
      }));

      setOtherPlayerSkins(skins);
      setLoading(false);
    };

    fetchOtherPlayerSkins();
  }, []);

  if (!state.user) return null;

  const playerStage = state.user.game_state.stage;
  const skins = state.user.loot?.fool?.cards;
  const showOtherSkins = canShowOtherSkins(playerStage);
  const customizationUnlocked = isCustomizationUnlocked(playerStage);

  const SkinCard = ({ skin }: { skin: Skin }) => (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="flex-shrink-0 w-48 bg-card text-card-foreground rounded-lg overflow-hidden shadow-lg"
    >
      <div className="relative h-32">
        <img src={skin.cardsImgUrl} alt="Card skin" className="w-full h-full object-cover" />
        <img src={skin.shirtImgUrl} alt="Shirt skin" className="absolute bottom-0 right-0 w-12 h-12 object-cover" />
      </div>
      <div className="p-2">
        <h3 className="font-bold text-sm mb-1 truncate">{skin.creatorUsername}&apos;s Skin</h3>
        <div className="flex justify-between items-center">
          <span className="text-xs">{skin.priceCoins} Coins</span>
        </div>
        <Button className="w-full mt-2 text-xs" size="sm">Buy Skin</Button>
      </div>
    </motion.div>
  );

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Skin Shop</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p>Loading skins...</p>
        ) : (
          <>
            {showOtherSkins && otherPlayerSkins.length > 0 && (
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2">Featured Skins</h3>
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
                <h3 className="text-lg font-semibold mb-2">Your Skins</h3>
                <div className="flex space-x-4">
                  <SkinCard
                    skin={{
                      id: 'SALAVEY13\'s-skin',
                      cardsImgUrl: skins.cards_img_url || '',
                      shirtImgUrl: skins.shirt_img_url || '',
                      creatorUsername: 'SALAVEY13',
                      priceCoins: 1000,
                    }}
                  />
                </div>
              </div>
            )}

            {!customizationUnlocked && (
              <p className="text-center mt-4">Keep playing to unlock more features!</p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default SkinShop;