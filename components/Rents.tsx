"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useAppContext } from "../context/AppContext";
import DebugInfo from "../components/DebugInfo";
import DynamicItemForm from "@/components/DynamicItemForm";
import QRCode from "react-qr-code";

interface Rent {
  id: number;
  user_id: number;
  item_id: number;
  rent_start: string;
  rent_end: string;
  status: string;
}

interface Item {
  id: number;
  title: string;
  creator_ref_code: string;
}

export default function Rents() {
  const [rents, setRents] = useState<Rent[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [newItemModalOpen, setNewItemModalOpen] = useState(false);
  const [itemType, setItemType] = useState<string>("evo"); // Default to "evo" type
  const [topEmbedUrl, setTopEmbedUrl] = useState("");
  const [bottomEmbedUrl, setBottomEmbedUrl] = useState(""); 
  const { user, t } = useAppContext();

  useEffect(() => {
    if (!user) return;

    const fetchRents = async () => {
      const { data, error } = await supabase
        .from("rents")
        .select("*")
        .eq("user_id", user.telegram_id);

      if (error) {
        console.error("Error fetching rents:", error);
      } else {
        setRents(data || []);
      }
    };

    const fetchItems = async () => {
      const { data, error } = await supabase
        .from("items")
        .select("*");

      if (error) {
        console.error("Error fetching items:", error);
      } else {
        setItems(data || []);
      }
    };

    fetchRents();
    fetchItems();
  }, [user]);

  const getItemDetailsById = useCallback((itemId: number) => {
    const item = items.find(i => i.id === itemId);
    return item ? `${item.title} (Shop: ${item.creator_ref_code})` : t("unknownItem");
  }, [items, t]);

  const handleOpenNewItemModal = () => {
    setNewItemModalOpen(true);
  };

  const handleCloseNewItemModal = () => {
    setNewItemModalOpen(false);
    setItemType("evo"); // Reset item type when closing modal
  };

  const handleButtonClick = (type: string) => {
    setItemType(type);
  };

  return (
    <div className="w-full min-h-screen bg-muted/40 flex flex-col p-4 overflow-auto">
      <div className="flex flex-col">
        <iframe
          width="100%"
          height="690"
          src="https://excellent-lots-147907.framer.app"//{topEmbedUrl}
          title="Top Embed"
          frameBorder="0"
          allowFullScreen
        ></iframe>
      </div>

      <div className="flex justify-between items-center mb-4 mt-4">
        <h1 className="text-3xl font-bold">{t("rentsTitle")}</h1>
        <Button onClick={handleOpenNewItemModal} variant="default">
          {t("addNewItem")}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("activeRentals")}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("itemTitle")}</TableHead>
                <TableHead>{t("rentStart")}</TableHead>
                <TableHead>{t("rentEnd")}</TableHead>
                <TableHead>{t("status")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rents.map(rent => (
                <TableRow key={rent.id}>
                  <TableCell>{getItemDetailsById(rent.item_id)}</TableCell>
                  <TableCell>{new Date(rent.rent_start).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(rent.rent_end).toLocaleDateString()}</TableCell>
                  <TableCell>{t(rent.status)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>{t("newItems")}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("itemTitle")}</TableHead>
                <TableHead>{t("creatorShop")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map(item => (
                <TableRow key={item.id}>
                  <TableCell>{item.title}</TableCell>
                  <TableCell>{item.creator_ref_code}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="flex flex-col mt-4">
        <iframe
          width="100%"
          height="315"
          src={bottomEmbedUrl}
          title="Bottom Embed"
          frameBorder="0"
          allowFullScreen
        ></iframe>
      </div>

      <Dialog open={newItemModalOpen} onOpenChange={handleCloseNewItemModal}>
        <DialogContent
            className="max-h-[calc(100vh-113px)] overflow-y-auto flex-grow min-h-[calc(100vh-128px)]  overflow-y-auto backdrop-blur-lg"
        >
            <DialogHeader>
            <DialogTitle>{t("addNewItemTitle")}</DialogTitle>
            <DialogDescription>{t("addNewItemDescription")}</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 mb-4">
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
        </DialogContent>
        </Dialog>




      <DebugInfo />
    </div>
  );
}
