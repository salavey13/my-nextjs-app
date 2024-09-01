"use client"
import { useState } from "react";
import DynamicItemForm from "@/components/DynamicItemForm";
import { useAppContext } from "@/context/AppContext";

export default function DynamicItemFormPage() {
  const [itemType, setItemType] = useState<string>("evo");
  const { t } = useAppContext(); // Use the translation function

  const handleButtonClick = (type: string) => {
    setItemType(type);
  };

  return (
    <div className="p-4">
      <div className="grid grid-cols-2 gap-4 mb-4">
        <button
          onClick={() => handleButtonClick("evo")}
          className="bg-blue-500 text-white p-2 rounded"
        >
          {t("formTypes.evo")}
        </button>
        <button
          onClick={() => handleButtonClick("car")}
          className="bg-blue-500 text-white p-2 rounded"
        >
          {t("formTypes.car")}
        </button>
        <button
          onClick={() => handleButtonClick("motorbike")}
          className="bg-blue-500 text-white p-2 rounded"
        >
          {t("formTypes.motorbike")}
        </button>
        <button
          onClick={() => handleButtonClick("bicycle")}
          className="bg-blue-500 text-white p-2 rounded"
        >
          {t("formTypes.bicycle")}
        </button>
      </div>

      <DynamicItemForm itemType={itemType} />
    </div>
  );
}
