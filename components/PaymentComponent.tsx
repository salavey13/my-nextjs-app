"use client"
import { FC, useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppContext } from "../context/AppContext";
import { supabase } from "../lib/supabaseClient";

interface PaymentComponentProps {
  item: Item;
}

const PaymentComponent: FC<PaymentComponentProps> = ({ item }) => {
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState<string>(new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0]);
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const { user, t } = useAppContext();
  
  const [users, setUsers] = useState<User[]>([]);
  useEffect(() => {
    if (!user) return;

    const fetchUsers = async () => {
      const { data, error } = await supabase
        .from("users")
        .select("id, ref_code, site, telegram_id");

      if (error) {
        console.error("Error fetching users:", error);
      } else {
        setUsers(data || []);
      }
    };

    fetchUsers();
  }, [user]);

  const calculatePrice = () => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = (end.getTime() - start.getTime()) / (1000 * 3600 * 24);

    // Assuming `item.details.general_info.price` is in TON per day
    const pricePerDay = item.details?.general_info.price || 0;
    setTotalPrice(days * pricePerDay);
  };

  const sendNotificationToCreator = useCallback(async (userId: string, itemId: number, rentId: number) => {
    if (!process.env.NEXT_PUBLIC_BOT_TOKEN || !user) {
      console.error('Bot token is missing');
      return;
    }

    const botToken = process.env.NEXT_PUBLIC_BOT_TOKEN;
    const inviteLink = `https://t.me/oneSitePlsBot/vip?ref=${itemId}-${rentId}`;
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

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('ton_wallet')
      .eq('telegram_id', user.telegram_id)
      .single();

    if (userError) {
      console.error("Error fetching user data:", userError);
      return;
    }

    const targetWallet = item.creator_ref_code; // Adjust according to your setup

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
    const paymentLink = `ton://transfer/${userData.ton_wallet}?amount=${totalPrice}&to=${targetWallet}`;
    window.open(paymentLink, '_blank');
    // Send notification to the item creator
    const matchingUser = users.find(user => user.ref_code === item.creator_ref_code);
    if (matchingUser) {
      await sendNotificationToCreator(matchingUser.telegram_id,  item.id, item.id);
    }
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

      <Button onClick={calculatePrice} variant="destructive" className="mt-4 bg-blue-500 text-white p-2 rounded">
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
  );
};

export default PaymentComponent;
