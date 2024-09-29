"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation"; // Adjust import if not using Next.js
import { supabase } from "../lib/supabaseClient";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useAppContext } from "../context/AppContext";
import DebugInfo from "../components/DebugInfo";
import DynamicItemForm from "@/components/DynamicItemForm";
import DynamicItemDetails from "@/components/DynamicItemDetails";
import PaymentComponent from "@/components/PaymentComponent";
import { faPlus, faMinus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import useTelegram from '../hooks/useTelegram';
import { Textarea } from "./ui/textarea";
import  MainSection  from "@/components/MainSection"

interface Item {
  id: number
  title: string
  creator_ref_code: string
  item_type: string
  details: {
    ad_info: {
      title: string
      description: string
    }
    general_info: {
      make: string
       year: string
       model: string
       price: string // Changed from number to string
       mileage?: string
       color?: string
     }
     photo_upload: {
       photo: string
     }
   }
 }
export default function Rents() {
  const [rents, setRents] = useState<Rent[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [newItemModalOpen, setNewItemModalOpen] = useState(false);
  const [itemType, setItemType] = useState<string>("evo"); // Default to "evo" type
  const [topEmbedUrl, setTopEmbedUrl] = useState(""); // Default URL
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [itemDetailsModalOpen, setItemDetailsModalOpen] = useState(false);
  const { state, dispatch, t } = useAppContext()
  const user = state.user
  const [itemDetails, setItemDetails] = useState<any>(null); // Adjust type if needed
  const [itemTypes, setItemTypes] = useState<ItemType[]>([]);
  const router = useRouter(); // Initialize the router here
  const [showForm, setShowForm] = useState(false);
    const [typeName, setTypeName] = useState('');
    const [jsonInput, setJsonInput] = useState('');
    const [jsonError, setJsonError] = useState('');
    const [typeNameError, setTypeNameError] = useState('');
    const [hasTriedToSave, setHasTriedToSave] = useState(false); // Track save attempts

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

    

    const fetchUsers = async () => {
      const { data, error } = await supabase
        .from("users")
        .select("*");

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
              greyedOut: true // Flag to indicate greyed-out dates
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
    setItemType("evo"); // Reset item type when closing modal
    fetchItems();
  };

  const handleButtonClick = (type: string) => {
    setItemType(type);
  };

  const handleRowClick = async (item: Item) => {
    // Send notification to the item creator
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

    // Validate JSON on input change
    useEffect(() => {
        try {
            if (jsonInput.trim()) {
                const parsedJson = JSON.parse(jsonInput);
                if (typeof parsedJson === 'object') {
                    setJsonError(''); // JSON is valid
                } else {
                    setJsonError(t('gpt')); // JSON structure is invalid
                }
            } else {
                setJsonError(t('gpt')); // JSON is empty or invalid
            }
        } catch (error) {
            setJsonError(t('gpt')); // JSON parsing failed
        }
    }, [jsonInput, t]);

    // Validate typeName on input change
    useEffect(() => {
        // Derive existing item names from itemTypes array
        const existingItemNames = itemTypes.map((item) => item.type);
        if (typeName.trim()) {
            if (existingItemNames.includes(typeName.trim())) {
                setTypeNameError(t('gptTypeName')); // Handle name collision
            } else {
                setTypeNameError(''); // Name is valid
            }
        } else {
            setTypeNameError(t('emptyTypeName')); // Name is empty
        }
    }, [typeName, t]);

    const handleAddNewItemType = async () => {
        setHasTriedToSave(true); // Mark that the user tried to save
        if (jsonError || typeNameError) {
            // Prevent saving if there's an error
            return;
        }

        try {
            // Parse the JSON input
            const jsonObject = JSON.parse(jsonInput);

            // Insert the new item type into Supabase
            const { data, error } = await supabase
                .from('item_types')
                .insert([{ type: typeName, fields: jsonObject }]);

            if (error) {
                console.error('Error inserting new item type:', error);
                return;
            }

            // Reload item types after successful insertion
            const { data: newTypes, error: fetchError } = await supabase
                .from('item_types')
                .select('*');

            if (fetchError) {
                console.error('Error fetching item types:', fetchError);
            } else {
                setItemTypes(newTypes || []);
            }

            // Clear the form inputs after successful submission
            setTypeName('');
            setJsonInput('');
            setShowForm(false);
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
        greyedOut: true // Flag to indicate greyed-out dates
      });
      setItemDetailsModalOpen(true);
    }
  };

  return (
    <div className="relative w-full h-[calc(200vh-128px)] bg-muted/40">
      {/* The iframe fills the whole 200vh */}
      {topEmbedUrl != "" && (
        <div className="absolute top-0 left-0 w-full h-[calc(200vh-128px)] z-0">
          <iframe
            width="100%"
            height="100%"
            src={topEmbedUrl}
            title="Top Embed"
            frameBorder="0"
            allowFullScreen
            style={{ height: '100%' }} // 100% of the container's height (200vh)h-[200vh]
          ></iframe>
        </div>
      )}

      {topEmbedUrl == "" && (
        <MainSection
          setItemDetailsModalOpen={setItemDetailsModalOpen}
          setSelectedItem={setSelectedItem}
          items={items}
        />
      )}

      {/* Content positioned 64px from the bottom, occupying the bottom 100vh overflow-auto*/}
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
        <DialogContent
            className="max-h-[calc(100vh-113px)] overflow-y-auto flex-grow min-h-[calc(100vh-128px)] overflow-y-auto backdrop-blur-lg bg-white bg-opacity-80"
        >
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
            {/* Add new type button */}
            <Button
                onClick={() => setShowForm(!showForm)}
                className="bg-green-500 text-white p-2 rounded"
            >
                <FontAwesomeIcon icon={showForm ? faMinus : faPlus} size="lg" />
            </Button>
            </div>
                {/* Conditionally render the form */}
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

      {/* Modal for showing item details and payment */}
      <Dialog open={itemDetailsModalOpen} onOpenChange={handleCloseItemDetailsModal}>
        <DialogContent className="max-h-[calc(100vh-113px)] overflow-y-auto flex-grow min-h-[calc(100vh-128px)] overflow-y-auto backdrop-blur-lg bg-white bg-opacity-80">
          <DialogHeader>
            <DialogTitle>{t("itemDetailsTitle")}</DialogTitle>
            <DialogDescription>{t("itemDetailsDescription")}</DialogDescription>
          </DialogHeader>

          {selectedItem && (
            <div>
              {/* Dynamic item details */}
                {itemDetails && (
                    <DynamicItemDetails itemType={selectedItem.item_type} itemDetails={selectedItem.details} />
                )}

              {/* Payment component */}
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
  
      {/*<DebugInfo />*/}
    </div>
  );
}
