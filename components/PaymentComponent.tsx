// components/PaymentComponent.tsx

import { FC, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; // Assuming you have this Input component
import { useAppContext } from "@/context/AppContext"; // Adjust import according to your file structure
import { t } from "i18next"; // Assuming you're using i18next for translation
import { supabase } from "../lib/supabaseClient"; // Import the Supabase client

interface PaymentComponentProps {
  item: Item;
}

const PaymentComponent: FC<PaymentComponentProps> = ({ item }) => {
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState<string>(new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0]);
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [tonPrice, setTonPrice] = useState<number>(1); // TON price in RUB
  const [rubPrice, setRubPrice] = useState<number>(0.01); // RUB price in USD
  const { user, t } = useAppContext(); // Assuming useAppContext provides user

  // Example fetch function to get exchange rates (replace with real API calls)
  const fetchCurrentPrices = async () => {
    // Use a real API for exchange rates
    setTonPrice(1); // Assuming 1 TON = 1 RUB
    setRubPrice(0.01); // Example RUB to USD rate
  };

  useEffect(() => {
    fetchCurrentPrices();
  }, []);

  const calculatePrice = () => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = (end.getTime() - start.getTime()) / (1000 * 3600 * 24);

    // Assuming `item.details` contains price per day in RUB
    const pricePerDayRUB = item.details?.general_info.price || 0;
    
    // Convert price to TON
    const pricePerDayUSD = pricePerDayRUB * rubPrice; // Convert RUB to USD
    const pricePerDayTON = pricePerDayUSD / tonPrice; // Convert USD to TON
    
    setTotalPrice(days * pricePerDayTON);
  };

  const handlePayment = async () => {
    // Create the payment link from the user's wallet to the target wallet
    const targetWallet = item.creator_ref_code; // Replace with the actual target wallet address
    const paymentLink = `ton://transfer/${user?.ton_wallet}?amount=${totalPrice}&to=${targetWallet}`;
    
    // Save rent to the database
    await saveRentToDatabase();
    
    // Open payment link
    window.open(paymentLink, '_blank');
  };

  const saveRentToDatabase = async () => {
    const { data, error } = await supabase
      .from('rents')
      .insert({
        user_id: user?.telegram_id, // Adjust field names as per your database schema
        rent_start: startDate,
        rent_end: endDate,
        item_id: item.id,
        status: 'unpaid',
      });

    if (error) {
      console.error('Failed to save rent to database:', error.message);
    } else {
      console.log('Rent saved successfully:', data);
    }
  };

  return (
    <div className="mt-4">
      <label>{t('rentStartDate')}</label>
      <Input
        type="date"
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
        className="border p-2 w-full"
      />

      <label>{t('rentEndDate')}</label>
      <Input
        type="date"
        value={endDate}
        onChange={(e) => setEndDate(e.target.value)}
        className="border p-2 w-full"
      />

      <Button onClick={calculatePrice} className="mt-2 bg-blue-500 text-white">
        {t('calculatePrice')}
      </Button>

      {totalPrice > 0 && (
        <div className="mt-4">
          <p>{t('totalPrice')}: {totalPrice.toFixed(2)} TON</p>
          <Button onClick={handlePayment} className="mt-2 bg-green-500 text-white">
            {t('proceedToPayment')}
          </Button>
        </div>
      )}
    </div>
  );
};

export default PaymentComponent;
