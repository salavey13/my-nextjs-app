"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabaseClient";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useAppContext } from "../context/AppContext";
import { useGameProgression } from "@/hooks/useGameProgression";
import DebugInfo from "../components/DebugInfo";
import DynamicItemForm from "@/components/DynamicItemForm";
import DynamicItemDetails from "@/components/DynamicItemDetails";
import PaymentComponent from "@/components/PaymentComponent";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faMinus } from '@fortawesome/free-solid-svg-icons';
import { Textarea } from "./ui/textarea";
import MainSection from "@/components/MainSection";
import UnlockChoice from '@/components/UnlockChoice';
import { toast } from '@/hooks/use-toast'

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
      price: string;
      mileage?: string;
      color?: string;
    };
    photo_upload: {
      photo: string;
    };
  };
}

interface Rent {
  id: number;
  user_id: number;
  item_id: number;
  rent_start: string;
  rent_end: string;
  status: string;
}

interface User {
  id: number;
  ref_code: string;
  site?: string;
}

export default function Rents() {
  const [rents, setRents] = useState<Rent[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [newItemModalOpen, setNewItemModalOpen] = useState(false);
  const [itemType, setItemType] = useState<string>("evo");
  const [topEmbedUrl, setTopEmbedUrl] = useState("");
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [itemDetailsModalOpen, setItemDetailsModalOpen] = useState(false);
  const { state, dispatch, t } = useAppContext();
  const { progressStage } = useGameProgression();
  const user = state.user;
  const [itemDetails, setItemDetails] = useState<any>(null);
  const [itemTypes, setItemTypes] = useState<any[]>([]);
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [typeName, setTypeName] = useState('');
  const [jsonInput, setJsonInput] = useState('');
  const [jsonError, setJsonError] = useState('');
  const [typeNameError, setTypeNameError] = useState('');
  const [hasTriedToSave, setHasTriedToSave] = useState(false);
  const [showUnlockChoice, setShowUnlockChoice] = useState(false);
  const [sideHustles, setSideHustles] = useState<any[]>([]);
  const [showSideHustleModal, setShowSideHustleModal] = useState(false);

  const triggerSideHustleChoice = async () => {
    const currentStage = state.user?.game_state?.stage || 0;
    const { data, error } = await supabase
      .from('story_stages')
      .select('*')
      .eq('stage', currentStage)
      .neq('parentid', null);

    if (error) {
      console.error('Error fetching side hustles:', error);
    } else {
      setSideHustles(data || []);
      setShowSideHustleModal(true);
    }
  };

  const handleSideHustleChoice = async (sideHustle: any) => {
    setShowSideHustleModal(false);
    
    const updatedGameState = {
      ...state.user?.game_state,
      currentSideHustle: sideHustle.id,
    };

    dispatch({
      type: 'UPDATE_GAME_STATE',
      payload: updatedGameState,
    });

    const { error } = await supabase
      .from('users')
      .update({ game_state: updatedGameState })
      .eq('id', state.user?.id);

    if (error) {
      console.error('Error updating user game state:', error);
    } else {
      toast({
        title: t('sideHustleUnlocked'),
        description: sideHustle.storycontent,
      });
    }
  };

  const fetchItems = useCallback(async () => {
    const { data, error } = await supabase.from("items").select("*");
    if (error) {
      console.error("Error fetching items:", error);
    } else {
      setItems(data || []);
    }
  }, []);

  const fetchItemTypes = useCallback(async () => {
    const { data, error } = await supabase.from("item_types").select("*");
    if (error) {
      console.error("Error fetching item types:", error);
    } else {
      setItemTypes(data || []);
    }
  }, []);

  const fetchRents = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("rents")
      .select("*")
      .eq("user_id", user.telegram_id);
    if (error) {
      console.error("Error fetching rents:", error);
    } else {
      setRents(data || []);
    }
  }, [user]);

  const fetchUsers = useCallback(async () => {
    const { data, error } = await supabase.from("users").select("*");
    if (error) {
      console.error("Error fetching users:", error);
    } else {
      setUsers(data || []);
    }
  }, []);

  useEffect(() => {
    fetchItemTypes();
  }, [fetchItemTypes]);

  useEffect(() => {
    if (!user) return;
    fetchRents();
    fetchItems();
    fetchUsers();
  }, [user, fetchRents, fetchItems, fetchUsers]);

  useEffect(() => {
    if (!router) return;
    const queryParams = new URLSearchParams(window.location.search);
    const refRentId = queryParams.get('ref_rent');
    if (refRentId) {
      const rentId = parseInt(refRentId, 10);
      const openItemDetailsForRent = async () => {
        const { data: rent, error: rentError } = await supabase
          .from('rents')
          .select('*')
          .eq('id', rentId)
          .single();
        
        if (rentError) {
          console.error('Error fetching rent:', rentError);
          return;
        }

        if (rent) {
          const { data: item, error: itemError } = await supabase
            .from('items')
            .select('*')
            .eq('id', rent.item_id)
            .single();
          
          if (itemError) {
            console.error('Error fetching item:', itemError);
            return;
          }

          if (item) {
            router.push(`/rents`);
            setSelectedItem(item);
            setItemDetails({
              startDate: rent.rent_start,
              endDate: rent.rent_end,
              greyedOut: true
            });
            setItemDetailsModalOpen(true);
          }
        }
      };

      openItemDetailsForRent();
    }
  }, [router]);

  const getItemDetailsById = useCallback((itemId: number) => {
    const item = items.find(i => i.id === itemId);
    return item ? `${item.title} (Shop: ${item.creator_ref_code})` : t("unknownItem");
  }, [items, t]);

  const handleOpenNewItemModal = () => {
    setNewItemModalOpen(true);
  };

  const handleCloseNewItemModal = () => {
    setNewItemModalOpen(false);
    setItemType("evo");
    fetchItems();
  };

  const handleButtonClick = (type: string) => {
    setItemType(type);
  };

  const handleRowClick = async (item: Item) => {
    const matchingUser = users.find(user => user.ref_code === item.creator_ref_code);
    if (matchingUser && matchingUser.site) {
      setTopEmbedUrl(matchingUser.site);
    } else {
      setTopEmbedUrl("https://soft-goals-411926.framer.app");
    }

    try {
      const { data: itemTypeSchema, error } = await supabase
        .from('item_types')
        .select('fields')
        .eq('type', item.item_type)
        .single();

      if (error) {
        throw error;
      }

      if (itemTypeSchema) {
        setItemDetails(itemTypeSchema);
      }
    } catch (error) {
      console.error('Error fetching item type schema:', error);
    }

    setSelectedItem(item);
    setItemDetailsModalOpen(true);

    // Check if this is the user's first interaction with an item
    if (user && user.game_state.stage === 6) {
      await progressStage(7, ['admin']);
      dispatch({
        type: 'UPDATE_GAME_STATE',
        payload: { stage: 7, unlockedComponents: [...(user.game_state.unlockedComponents || []), 'admin'] }
      });
      setShowUnlockChoice(true);
    }
  };

  const handleCloseItemDetailsModal = () => {
    setItemDetailsModalOpen(false);
    setSelectedItem(null);
  };

  const handleAddNewItemType = async () => {
    setHasTriedToSave(true);
    if (jsonError || typeNameError) {
      return;
    }

    try {
      const jsonObject = JSON.parse(jsonInput);

      const { data, error } = await supabase
        .from('item_types')
        .insert([{ type: typeName, fields: jsonObject }]);

      if (error) {
        console.error('Error inserting new item type:', error);
        return;
      }

      const { data: newTypes, error: fetchError } = await supabase
        .from('item_types')
        .select('*');

      if (fetchError) {
        console.error('Error fetching item types:', fetchError);
      } else {
        setItemTypes(newTypes || []);
      }

      setTypeName('');
      setJsonInput('');
      setShowForm(false);

      // Check if this is the user's first time adding a new item type
      if (user && user.game_state.stage === 6) {
        await progressStage(7, [ 'admin']);
        dispatch({
          type: 'UPDATE_GAME_STATE',
          payload: { stage: 7, unlockedComponents: [...(user.game_state.unlockedComponents || []), 'admin'] }
        });
        triggerSideHustleChoice();
      }
    } catch (error) {
      console.error('Error processing new item type:', error);
    }
  };

  const handleActiveRentClick = async (rent: Rent) => {
    const item = items.find(i => i.id === rent.item_id);
  
    if (item) {
      setSelectedItem(item);
      setItemDetails({
        ...itemDetails, 
        startDate: rent.rent_start,
        endDate: rent.rent_end,
        greyedOut: true
      });
      setItemDetailsModalOpen(true);
    }
  };

  return (
    <div className="relative w-full h-[calc(200vh-128px)] bg-muted/40">
      {topEmbedUrl !== "" && (
        <div className="absolute top-0 left-0 w-full h-[calc(200vh-128px)] z-0">
          <iframe
            width="100%"
            height="100%"
            src={topEmbedUrl}
            title="Top Embed"
            frameBorder="0"
            allowFullScreen
            style={{ height: '100%' }}
          ></iframe>
        </div>
      )}

      {topEmbedUrl === "" && (
        <div className="absolute top-0 left-0 w-full h-[calc(200vh-128px)] z-0">
          <MainSection
            setItemDetailsModalOpen={setItemDetailsModalOpen}
            setSelectedItem={setSelectedItem}
            items={items}
          />
        </div>
      )}

      <div className="absolute bottom-0 left-0 scrollbars-hide w-full z-10 max-h-[calc(100vh-128px)] backdrop-blur-lg rounded-t-2xl">
        <div className="p-4">
          <div className="relative flex justify-between items-center mb-4 h-[100px]">
            <h1 className="text-3xl font-bold">{t("rentsTitle")}</h1>
            <Button onClick={handleOpenNewItemModal} variant="default">
              {t("addNewItem")}
            </Button>
          </div>
          <div className="relative w-full z-10 overflow-scroll  max-h-[calc(100vh-228px)]">
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
                      <TableRow key={rent.id} onClick={() => handleActiveRentClick(rent)} className="cursor-pointer">
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
            <div className="h-[calc(64px)]"></div>
          </div>
        </div>
      </div>

      <Dialog open={newItemModalOpen} onOpenChange={handleCloseNewItemModal}>
        <DialogContent className="max-h-[calc(100vh-113px)] overflow-y-auto flex-grow min-h-[calc(100vh-128px)] ">
          <DialogHeader>
            <DialogTitle>{t("addNewItemTitle")}</DialogTitle>
            <DialogDescription>{t("addNewItemDescription")}</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 mb-4">
            {itemTypes.map((type) => (
              <Button
                key={type.id}
                onClick={() => handleButtonClick(type.type)}
                className="bg-blue-500 text-white p-2 rounded"
              >
                {t(`formTypes.${type.type}`)}
              </Button>
            ))}
            <Button
              onClick={() => setShowForm(!showForm)}
              className="bg-green-500 text-white p-2 rounded"
            >
              <FontAwesomeIcon icon={showForm ? faMinus : faPlus} size="lg" />
            </Button>
          </div>
          {showForm && (
            <div className="mt-4">
              <Input
                type="text"
                value={typeName}
                onChange={(e) => setTypeName(e.target.value)}
                placeholder={t('enterTitleKey')}
                className="p-2 border rounded mb-2 w-full"
              />
              {hasTriedToSave && typeNameError && (
                <p className="text-red-500 text-sm mb-2">{typeNameError}</p>
              )}
              <Textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder={t('enterJsonData')}
                rows={4}
              />
              {hasTriedToSave && jsonError && (
                <p className="text-red-500 text-sm mb-2">{jsonError}</p>
              )}
              <Button
                onClick={handleAddNewItemType}
                className="bg-blue-500 text-white p-2 rounded"
                disabled={!!jsonError || !!typeNameError || !jsonInput || !typeName}
              >
                {t('save')}
              </Button>
            </div>
          )}
          <DynamicItemForm itemType={itemType} />
        </DialogContent>
      </Dialog>

      <Dialog open={itemDetailsModalOpen} onOpenChange={handleCloseItemDetailsModal}>
        <DialogContent className="max-h-[calc(100vh-113px)] overflow-y-auto flex-grow min-h-[calc(100vh-128px)]">
          <DialogHeader>
            <DialogTitle>{t("itemDetailsTitle")}</DialogTitle>
            <DialogDescription>{t("itemDetailsDescription")}</DialogDescription>
          </DialogHeader>

          {selectedItem && (
            <div>
              {itemDetails && (
                <DynamicItemDetails itemType={selectedItem.item_type} itemDetails={selectedItem.details} />
              )}
              <PaymentComponent item={selectedItem} />
            </div>
          )}

          <div className="mt-4">
            <Button onClick={handleCloseItemDetailsModal} variant="default">
              {t("close")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      {showUnlockChoice && <UnlockChoice />}
      <Dialog open={showSideHustleModal} onOpenChange={setShowSideHustleModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('chooseSideHustle')}</DialogTitle>
            <DialogDescription>{t('sideHustleDescription')}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            {sideHustles.map((sideHustle) => (
              <Card key={sideHustle.id}>
                <CardHeader>
                  <CardTitle>{sideHustle.activecomponent}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{sideHustle.storycontent}</p>
                  <p className="font-bold mt-2">{t('achievement')}: {sideHustle.achievement}</p>
                  <Button onClick={() => handleSideHustleChoice(sideHustle)}>
                    {t('choose')}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}