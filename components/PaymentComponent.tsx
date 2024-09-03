import { FC, useState } from "react";
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

  const calculatePrice = () => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = (end.getTime() - start.getTime()) / (1000 * 3600 * 24);

    // Assuming `item.details.general_info.price` is in TON per day
    const pricePerDay = item.details?.general_info.price || 0;
    setTotalPrice(days * pricePerDay);
  };

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
  };

  return (
    <div className="mt-4">
      <label className="mt-4">{t('rentStartDate')}</label>
      <Input
        type="date"
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
      />

      <label className="mt-4">{t('rentEndDate')}</label>
      <Input 
        type="date"
        value={endDate}
        onChange={(e) => setEndDate(e.target.value)}
      />

      <Button onClick={calculatePrice} variant="default" className="mt-4 bg-blue-500 text-white p-2 rounded">
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
