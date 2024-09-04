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
      fields: {
        name: string;
        type: string;
        label: string;
        placeholder: string;
      }[];
    };
    pricing?: {
      [key: string]: string; // Changed to handle the object structure
    };
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
  const [totalPrice, set
