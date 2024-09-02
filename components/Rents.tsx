//components/Rents.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useAppContext } from "../context/AppContext";
import DebugInfo from "../components/DebugInfo";
import DynamicItemForm from "@/components/DynamicItemForm";
import DynamicItemDetails from "@/components/DynamicItemDetails";
import PaymentComponent from "@/components/PaymentComponent";

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
  item_type: string;
  details: any;
}

interface User {
  id: number;
  ref_code: string;
  site: string;
}

export default function Rents() {
  const [rents, setRents] = useState<Rent[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [newItemModalOpen, setNewItemModalOpen] = useState(false);
  const [itemType, setItemType] = useState<string>("evo"); // Default to "evo" type
  const [topEmbedUrl, setTopEmbedUrl] = useState("https://excellent-lots-147907.framer.app"); // Default URL
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [itemDetailsModalOpen, setItemDetailsModalOpen] = useState(false);
  const { user, t } = useAppContext();
  const [itemDetails, setItemDetails] = useState<any>(null); // Adjust type if needed
  
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

    const fetchUsers = async () => {
      const { data, error } = await supabase
        .from("users")
        .select("id, ref_code, site");

      if (error) {
        console.error("Error fetching users:", error);
      } else {
        setUsers(data || []);
      }
    };

    fetchRents();
    fetchItems();
    fetchUsers();
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

  const handleRowClick = async (item: Item) => {
    const matchingUser = users.find(user => user.ref_code === item.creator_ref_code);
    if (matchingUser && matchingUser.site) {
      setTopEmbedUrl(matchingUser.site);
    } else {
      setTopEmbedUrl("https://excellent-lots-147907.framer.app"); // Fallback to default if no matching user
    }

    try {
        // Fetch item type schema from Supabase
        const { data: itemTypeSchema, error } = await supabase
          .from('item_types')
          .select('fields')
          .eq('type', item.item_type)
          .single();
    
        if (error) {
          throw error;
        }
    
        // Check if itemTypeSchema is not null and has fields
        if (itemTypeSchema) {
            setItemDetails(itemTypeSchema);
          }
      } catch (error) {
        console.error('Error fetching item type schema:', error);
      }
    
    // Set selected item and open details modal
    setSelectedItem(item);
    setItemDetailsModalOpen(true);
  };

  const handleCloseItemDetailsModal = () => {
    setItemDetailsModalOpen(false);
    setSelectedItem(null);
  };

  return (
    <div className="relative w-full min-h-screen h-[150vh] bg-muted/40">
      {/* The iframe fills the whole 200vh */}
      <div className="absolute top-0 left-0 w-full h-[150vh] z-0">
        <iframe
          width="100%"
          height="100%"
          src={topEmbedUrl}
          title="Top Embed"
          frameBorder="0"
          allowFullScreen
          style={{ height: '100%' }} // 100% of the container's height (200vh)
        ></iframe>
      </div>

      {/* Content positioned 64px from the bottom, occupying the bottom 100vh */}
      <div className="absolute bottom-1 left-0 w-full z-10 overflow-auto bg-white max-h-screen backdrop-blur-lg rounded-t-2xl">
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
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
                  {rents.map((rent) => (
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
                  {items.map((item) => (
                    <TableRow key={item.id} onClick={() => handleRowClick(item)} className="cursor-pointer">
                      <TableCell>{item.title}</TableCell>
                      <TableCell>{item.creator_ref_code}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialog remains unchanged */}
      <Dialog open={newItemModalOpen} onOpenChange={handleCloseNewItemModal}>
        <DialogContent
          className="max-h-[calc(100vh-113px)] overflow-y-auto flex-grow min-h-[calc(100vh-128px)] overflow-y-auto backdrop-blur-lg"
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

      {/* Modal for showing item details and payment */}
      <Dialog open={itemDetailsModalOpen} onOpenChange={handleCloseItemDetailsModal}>
        <DialogContent className="max-h-[calc(100vh-113px)] overflow-y-auto flex-grow min-h-[calc(100vh-128px)] overflow-y-auto backdrop-blur-lg">
          <DialogHeader>
            <DialogTitle>{t("itemDetailsTitle")}</DialogTitle>
            <DialogDescription>{t("itemDetailsDescription")}</DialogDescription>
          </DialogHeader>

          {selectedItem && (
            <div>
              {/* Dynamic item details */}
                {itemDetails && (
                    <DynamicItemDetails item={selectedItem} />
                )}

              {/* Payment component */}
              <PaymentComponent item={selectedItem} />
            </div>
          )}
          

          <div className="mt-4">
            <Button onClick={handleCloseItemDetailsModal}>
              {t("close")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
  
      <DebugInfo />
    </div>
  );
  
}
