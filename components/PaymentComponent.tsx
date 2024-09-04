"use client";

import { FC, useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppContext } from "../context/AppContext";
import { supabase } from "../lib/supabaseClient";

interface Item {
  id: number;
  details: {
    general_info?: {
        [key: string]: string;
        price: string;
    };
    pricing?: {
      [key: string]: string; // Changed to handle the object structure
    };
    [key: string]: any;
  };
  creator_ref_code: string;
}

interface User {
  id: string;
  ref_code: string;
  site: string;
  telegram_id: string;
  ton_wallet: string;
}

interface PaymentComponentProps {
  item: Item;
}

const PaymentComponent: FC<PaymentComponentProps> = ({ item }) => {
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState<string>(new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0]);
  const [selectedPricingOption, setSelectedPricingOption] = useState<string | null>(null);
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const { user, t } = useAppContext();
  
  const [users, setUsers] = useState<User[]>([]);
  useEffect(() => {
    if (!user) return;

    const fetchUsers = async () => {
      const { data, error } = await supabase
        .from("users")
        .select("id, ref_code, site, telegram_id, ton_wallet");

      if (error) {
        console.error("Error fetching users:", error);
      } else {
        setUsers(data || []);
      }
    };

    fetchUsers();
  }, [user]);

  const calculatePrice = (price: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = (end.getTime() - start.getTime()) / (1000 * 3600 * 24);

    if (price !== "Услугу не оказываю") {
      setTotalPrice(days * Number(price));
    } else {
      console.error("Selected option is disabled or not found");
      setTotalPrice(0);
    }
  };

  const sendNotificationToCreator = useCallback(async (userId: string, itemId: number, rentId: number) => {
    if (!process.env.NEXT_PUBLIC_BOT_TOKEN || !user) {
      console.error('Bot token is missing');
      return;
    }

    const botToken = process.env.NEXT_PUBLIC_BOT_TOKEN;
    const inviteLink = `https://t.me/oneSitePlsBot/vip?ref_rent=${rentId}`;
    const url = new URL(`https://api.telegram.org/bot${botToken}/sendMessage`);
    const message = `${t('newRentNotification')} ${user.telegram_username} ! 🎮✨`;

    url.searchParams.append("chat_id", userId.toString());
    url.searchParams.append("text", message);
    url.searchParams.append("reply_markup", JSON.stringify({
      inline_keyboard: [
        [{ text: t("viewItem"), url: inviteLink }],
        [{ text: t("visitSite"), url: "https://oneSitePls.framer.ai" }],
        [{ text: t("joinCommunity"), url: "https://t.me/aibotsites" }],
        [{ text: t("youtubeChannel"), url: "https://youtube.com/@salavey13" }],
      ],
    }));

    try {
      const response = await fetch(url.toString());
      if (!response.ok) throw new Error('Failed to send Telegram message');
    } catch (error) {
      console.error('Error sending Telegram message:', error);
    }
  }, [user, t]);

 
  const handlePayment = async () => {
    if (!user) {
      console.error("User is not logged in");
      return;
    }

    // Fetch user data (wallet info)
    const { data: wallet, error: userError } = await supabase
      .from('users')
      .select('ton_wallet')
      .eq('ref_code', item.creator_ref_code)
      .single();

    if (userError) {
      console.error("Error fetching user data:", userError);
      return;
    }

    const targetWallet = wallet

    // Save to the rents table
    const { error: insertError } = await supabase
      .from('rents')
      .insert({
        user_id: user.telegram_id,
        rent_start: new Date(startDate).toISOString(),
        rent_end: new Date(endDate).toISOString(),
        status: 'unpaid',
        item_id: item.id
      });

    if (insertError) {
      console.error("Error inserting rent:", insertError);
      return;
    }

    // Create the payment link
    const paymentLink = `ton://transfer/${targetWallet.ton_wallet}?amount=${totalPrice}&message=Payment%20for%20item%20${item.id}`;
    window.open(paymentLink, '_blank');
    
    // Send notification to the item creator
    const matchingUser = users.find(user => user.ref_code === item.creator_ref_code);
    if (matchingUser) {
      await sendNotificationToCreator(matchingUser.telegram_id, item.id, item.id);
    }
  };

  // Utility function to convert underscored keys to camelCase
    const toCamelCase = (str:string) => {
    return str.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());
  };

  return (
    <div className="mt-4 mb-4">
      <label>{t('rentStartDate')}</label>
      <Input
        type="date"
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
      />

      <label>{t('rentEndDate')}</label>
      <Input 
        type="date"
        value={endDate}
        onChange={(e) => setEndDate(e.target.value)}
      />

      {item.details.pricing ? (
        <div className="mt-4">
          <label>{t('pricing.options')}</label>
          {Object.keys(item.details.pricing).map((key) => (
            <div key={key} className="mt-2">
              <Button 
                onClick={() => {
                  setSelectedPricingOption(key);
                  calculatePrice(item.details.pricing![key]); // Calculate price immediately
                }}
                variant={selectedPricingOption === key ? 'outline' : 'secondary'} // Set variant conditionally
                className={`p-2 rounded ${selectedPricingOption === key ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                disabled={item.details.pricing![key] === "Услугу не оказываю"}
              >
                {t(toCamelCase(key))}: {item.details.pricing![key]} TON
              </Button>
            </div>
          ))}
          {totalPrice > 0 && (
            <div className="mt-4">
              <p>{t('totalPrice')}: {totalPrice.toFixed(2)} TON</p>
              <Button onClick={handlePayment} variant="outline" className="mt-4 bg-green-500 text-white p-2 rounded">
                {t('proceedToPayment')}
              </Button>
            </div>
          )}
        </div>
      ) : (
        item.details.general_info && (
          <div className="mt-4">
            <Button onClick={() => calculatePrice(item.details.general_info!.price || '0')}
              variant="destructive" 
              className="mt-4 bg-blue-500 text-white p-2 rounded"
            >
              {t('calculatePrice')}
            </Button>
            {totalPrice > 0 && (
              <div className="mt-4">
                <p>{t('totalPrice')}: {totalPrice.toFixed(2)} TON</p>
                <Button onClick={handlePayment} variant="outline" className="mt-4 bg-green-500 text-white p-2 rounded">
                    {t('proceedToPayment')}
                </Button>
               </div>  
            )}
            </div>
        ))}
    </div>
  );
};

export default PaymentComponent;

