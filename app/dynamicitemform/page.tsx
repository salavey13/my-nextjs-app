"use client"
import { useState } from "react";
import DynamicItemForm from "@/components/DynamicItemForm";
import { useAppContext } from "@/context/AppContext";
import { Button } from "@/components/ui/button";

export default function DynamicItemFormPage() {
  const [itemType, setItemType] = useState<string>("evo");
  const { t } = useAppContext(); // Use the translation function

  const handleButtonClick = (type: string) => {
    setItemType(type);
  };

  return (
    <div className="p-4">
      <div className="flex justify-around items-center mb-4">
          <Button
              onClick={() => handleButtonClick("evo")}
              className="bg-blue-500 text-white p-2 rounded"
          >
              {t("formTypes.evo")}
          </Button>
          <Button
              onClick={() => handleButtonClick("car")}
              className="bg-blue-500 text-white p-2 rounded"
          >
              {t("formTypes.car")}
          </Button>
          <Button
              onClick={() => handleButtonClick("motorbike")}
              className="bg-blue-500 text-white p-2 rounded"
          >
              {t("formTypes.motorbike")}
          </Button>
          <Button
              onClick={() => handleButtonClick("bicycle")}
              className="bg-blue-500 text-white p-2 rounded"
          >
              {t("formTypes.bicycle")}
          </Button>
          <Button
              onClick={() => handleButtonClick("dota2")}
              className="bg-blue-500 text-white p-2 rounded hover:text-white"
              variant="destructive"
          >
              {t("formTypes.dota2")}
          </Button>
      </div>

      <DynamicItemForm itemType={itemType} />
    </div>
  );
}
