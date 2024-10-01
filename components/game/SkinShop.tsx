import React, { useEffect, useState } from 'react';
import { UserData, useAppContext } from '@/context/AppContext';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const SkinShop = () => {
  const { state, canShowOtherSkins, isCustomizationUnlocked } = useAppContext();
  const [otherPlayerSkins, setOtherPlayerSkins] = useState<{ cardsImgUrl: string; shirtImgUrl: string }[]>([]);
  const [loading, setLoading] = useState(true);

  if (!state.user) return null;

  const playerStage = state.user.game_state.stage;
  const skins = state.user.loot?.fool?.cards;
  const showOtherSkins = canShowOtherSkins(playerStage);
  const customizationUnlocked = isCustomizationUnlocked(playerStage);

  const fetchOtherPlayerSkins = async () => {
    const { data, error } = await supabase
      .from('users')
      .select('loot->fool->cards->cards_img_url, loot->fool->cards->shirt_img_url');
  
    if (error) {
      console.error('Error fetching player skins:', error);
      return [];
    }

    return data.map((user) => ({
      cardsImgUrl: (user as unknown as UserData)?.loot?.fool?.cards?.cards_img_url || '',
      shirtImgUrl: (user as unknown as UserData)?.loot?.fool?.cards?.shirt_img_url || '',
    }));
  };

  useEffect(() => {
    const loadSkins = async () => {
      const skins = await fetchOtherPlayerSkins();
      setOtherPlayerSkins(skins);
      setLoading(false);
    };
    loadSkins();
  }, []);

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Skin Shop</CardTitle>
      </CardHeader>
      <CardContent>
        {loading && <p>Loading skins...</p>}

        {showOtherSkins && otherPlayerSkins.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-2">Skins of Other Players</h3>
            <div className="grid grid-cols-2 gap-4">
              {otherPlayerSkins.map((skin, index) => (
                <div key={index} className="border p-2 rounded">
                  <img src={skin.cardsImgUrl} alt="Other player card skin" className="w-full h-auto mb-2" />
                  <img src={skin.shirtImgUrl} alt="Other player shirt skin" className="w-full h-auto" />
                </div>
              ))}
            </div>
          </div>
        )}

        {customizationUnlocked && skins && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Your Skins</h3>
            <div className="border p-2 rounded">
              <img src={skins.cards_img_url} alt="Your card skin" className="w-full h-auto mb-2" />
              <img src={skins.shirt_img_url} alt="Your shirt skin" className="w-full h-auto" />
            </div>
          </div>
        )}

        {!customizationUnlocked && (
          <p className="text-center mt-4">Customization is not yet unlocked. Keep playing to unlock this feature!</p>
        )}
      </CardContent>
    </Card>
  );
};

export default SkinShop;