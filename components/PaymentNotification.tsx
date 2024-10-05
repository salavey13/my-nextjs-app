// components/PaymentNotification.tsx
"use client"

import React, { useCallback, useEffect, useState } from "react";
import { useAppContext } from "@/context/AppContext";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { generateQrCodeBase64 } from "../utils/qrcodeUtils"
const PaymentNotification: React.FC<{ link?: string }> = ({ link }) => {
  const { state, t } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [notificationSent, setNotificationSent] = useState(false);

  const sendPaymentNotification = useCallback(async (link: string) => {
    setLoading(true);

    try {
      const botToken = process.env.NEXT_PUBLIC_BOT_TOKEN;
      if (!botToken) {
        console.error("Bot token is missing");
        return;
      }

      const qrCodeImage = await generateQrCodeBase64(link);
      if (!qrCodeImage) {
        throw new Error("Failed to generate QR code image");
      }

      const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
      const qrUrl = `https://api.telegram.org/bot${botToken}/sendPhoto`;

      const responseMessage = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: state?.user?.telegram_id,
          text: `${t("paymentSuccessMessage")}`,
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: t("payNow"),
                  url: link,
                },
              ],
            ],
          },
          parse_mode: "Markdown",
        }),
      });

      const responseQR = await fetch(qrUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: state?.user?.telegram_id,
          photo: qrCodeImage,
          caption: `${t("scanQR")}`,
        }),
      });

      if (!responseMessage.ok || !responseQR.ok) {
        throw new Error("Failed to send Telegram message or QR code");
      }

      setNotificationSent(true);
    } catch (error) {
      console.error("Error sending Telegram message:", error);
    } finally {
      setLoading(false);
    }
  }, [state?.user?.telegram_id, t]);

  useEffect(() => {
    if (state?.user && link && !notificationSent) {
      sendPaymentNotification(link);
    }
  }, [notificationSent, state?.user, link, sendPaymentNotification]);
  return (
    <div className="p-6 bg-gray-800 rounded-lg shadow-lg">
      {loading ? (
        <LoadingSpinner />
      ) : notificationSent ? (
        <p className="text-green-500">{t("notificationSent")}</p>
      ) : (
        <button
          onClick={() => sendPaymentNotification(link || "")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
        >
          {t("resendNotification")}
        </button>
      )}
    </div>
  );
};

export default PaymentNotification;
