import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { Button } from "@/components/ui/button";
import LoadingSpinner from "./ui/LoadingSpinner";
import Link from "next/link"
import { useAppContext } from "@/context/AppContext";

interface Item {
  id: number;
  title: string;
  creator_ref_code: string;
  item_type: string;
  details: {
    ad_info: {
      title: string;
      description: string;
    };
    general_info: {
      make: string;
      year: string;
      model: string;
      price: number;
      mileage?: string;
      color?: string;
    };
    photo_upload: {
      photo: string;
    };
  };
}

const MainSection: React.FC = () => {
  const {t} = useAppContext()
  const [items, setItems] = useState<Item[]>([]);
  const [selectedCreator, setSelectedCreator] = useState<string>("vip_bike");
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch items from Supabase
  const fetchItems = async (creatorRefCode: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from("items")
      .select("*")
      .eq("creator_ref_code", creatorRefCode);

    if (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    } else {
      setItems(data);
      setLoading(false);
    }
  };

  // Load items on creator selection
  useEffect(() => {
    fetchItems(selectedCreator);
  }, [selectedCreator]);
// overflow-y-scroll snap-y snap-mandatory flex flex-col flex flex-col
  return (
    <div className="w-full  items-center">
      {/* Menu for selecting creator_ref_code */}
      <div className="fixed top-20 left-0 w-full flex justify-center z-20">
        <div className="bg-white/80 backdrop-blur-sm p-2 rounded-lg flex space-x-4">
          <Button
            onClick={() => setSelectedCreator("salavey13")}
            className="px-6 py-3 text-white rounded-lg bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 transition-all"
          >
            Salavey13
          </Button>
          <Button
            onClick={() => setSelectedCreator("vip_bike")}
            className="px-6 py-3 text-white rounded-lg bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 transition-all"
          >
            VIP Bike
          </Button>
          <Button
            onClick={() => setSelectedCreator("Поставить аву ")}
            className="px-6 py-3 text-white rounded-lg bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 transition-all"
          >
            Dota
          </Button>
        </div>
      </div>
  
      {/* Main section */}
      <main className="w-full h-screen  items-center snap-y snap-mandatory overflow-y-scroll">
        {loading ? (
          <LoadingSpinner />
        ) : (
          items.map((item) => (
            <section
              key={item.id}
              className="w-full h-[100vh] relative snap-start flex flex-col items-center justify-center "
            >
              {/* Background Image */}
              <div
                className="absolute inset-0 bg-cover bg-center z-0"
                style={{ backgroundImage: `url(${item.details.photo_upload?.photo})` }}
              ></div>
  
              {/* Dark overlay for contrast */}
              <div className="absolute inset-0 bg-black/50 z-1"></div>
  
              {/* Content */}
              <div className="relative h-[69vh]] items-center flex flex-col gap-[200px]  justify-between">
                <div className="relative z-10 text-white text-center px-8">
                    <h1 className="text-4xl font-bold mb-4 drop-shadow-lg">
                    {item.details.ad_info?.title}
                    </h1>
                    <p className="text-lg drop-shadow-lg mb-8">{item.details.ad_info?.description}</p>
                </div>
    
                {/* Button */}
                <Button
                    className="relative z-10 px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg hover:from-blue-700 hover:to-blue-900 transition-all shadow-lg"
                    variant="outline"
                >
                    <Link href={`https://t.me/oneSitePlsBot/vip?ref_item=${item.id}`}>
                    {t("rentNow")}
                    </Link>
                </Button>
              </div>
            </section>
          ))
        )}
      </main>
    </div>
  );
  ;
};

export default MainSection;
