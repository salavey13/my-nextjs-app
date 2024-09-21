"use client"
import { useEffect, useState } from "react";
import DynamicItemForm from "@/components/DynamicItemForm";
import { useAppContext } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { supabase } from "../../lib/supabaseClient";

export default function DynamicItemFormPage() {
  const [itemType, setItemType] = useState<string>("evo");
  const [itemTypes, setItemTypes] = useState<ItemType[]>([]);
  const { t } = useAppContext(); // Use the translation function

  useEffect(() => {
    const fetchItemTypes = async () => {
      const { data, error } = await supabase.from("item_types").select("*");

      if (error) {
        console.error("Error fetching item types:", error);
      } else {
        setItemTypes(data || []);
      }
    };

    fetchItemTypes();
  }, []);

  const handleButtonClick = (type: string) => {
    setItemType(type);
  };

  return (
    <div className="p-4">
      <div className="flex justify-around items-center mb-4 overflow-x-auto">
      {itemTypes.map((type) => (
                <Button
                key={type.id}
                onClick={() => handleButtonClick(type.type)}
                className="bg-blue-500 text-white p-2 rounded"
                >
                {t(`formTypes.${type.type}`)}
                </Button>
            ))}
      </div>

      <DynamicItemForm itemType={itemType} />
    </div>
  );
}
