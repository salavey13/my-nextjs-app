// components/PaymentNotification.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useAppContext } from "@/context/AppContext";
import { supabase } from "@/lib/supabaseClient";
import {Button} from "@/components/ui/button";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

const PaymentNotification: React.FC = () => {
  const { user, t } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [notificationSent, setNotificationSent] = useState(false);

  useEffect(() => {
    if (user && !notificationSent) {
      sendPaymentNotification();
    }
  }, [user]);

  const sendPaymentNotification = async () => {
    setLoading(true);

    try {
      const botToken = process.env.NEXT_PUBLIC_BOT_TOKEN;
      if (!botToken) {
        console.error("Bot token is missing");
        return;
      }

      const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
      const message = `t("paymentSuccessMessage") ${user?.telegram_username}`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: user?.telegram_id,
          text: message,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send Telegram message");
      }

      setNotificationSent(true);
    } catch (error) {
      console.error("Error sending Telegram message:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-800 rounded-lg shadow-lg">
      {loading ? (
        <LoadingSpinner />
      ) : notificationSent ? (
        <p className="text-green-500">{t("notificationSent")}</p>
      ) : (
        <Button onClick={sendPaymentNotification} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
          {t("resendNotification")}
        </Button>
      )}
    </div>
  );
};

export default PaymentNotification;