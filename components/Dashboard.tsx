// components/Dashboard.tsx
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
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTachometerAlt } from '@fortawesome/free-solid-svg-icons';
import { fetchTargetWallet, CryptoPayment}  from "@/components/CryptoPayment";
import CryptoWithdrawal from "@/components/CryptoWithdrawal";

// Define the shape of the bet data
interface Bet {
  id: number;
  user_id: number;
  event_id: number;
  amount: number;
  outcome: string;
  status: string;
}

// Define the shape of the event data
interface Event {
  id: number;
  title: string;
  title_ru: string;
  title_ukr: string;
  description: string;
  description_ru: string;
  description_ukr: string;
  educational_video_url: string;
  expired: boolean;
  expiration_date: string | null;
}

export default function Dashboard() {
  const [bets, setBets] = useState<Bet[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [betAmount, setBetAmount] = useState<string>('');
  const { user, setUser, t, store } = useAppContext();

  useEffect(() => {
    if (!user) return;

    const fetchBets = async () => {
      const { data, error } = await supabase
        .from('bets')
        .select('*')
        .eq('user_id', user.telegram_id);

      if (error) {
        console.error("Error fetching bets:", error);
      } else {
        setBets(data || []);
      }
    };

 
    const fetchEvents = async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .not('id', 'in', `(${bets.map(bet => bet.event_id).join(',')})`);
  
      if (error) {
        console.error("Error fetching events:", error);
      } else {
        setEvents(data || []);
      }
    };
    const fetchAllEvents = async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*');

      if (error) {
        console.error("Error fetching all events:", error);
      } else {
        setAllEvents(data || []);
      }
    };

    fetchBets();  
    fetchAllEvents();  
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const fetchEvents = async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .not('id', 'in', `(${bets.map(bet => bet.event_id).join(',')})`);

      if (error) {
        console.error("Error fetching events:", error);
      } else {
        setEvents(data || []);
      }
    };

    fetchEvents();
  }, [bets]);// Only refetch events when bets change

  const getEventDetailsById = useCallback((eventId: number) => {
    const event = allEvents.find(e => e.id === eventId);
    if (!event) return { title: t("unknownEvent"), description: t("unknownDescription") };

    const title = store.lang === 'ru' ? event.title_ru : store.lang === 'ukr' ? event.title_ukr : event.title;
    const description = store.lang === 'ru' ? event.description_ru : store.lang === 'ukr' ? event.description_ukr : event.description;

    return { title, description };
  }, [allEvents, store.lang, t]);

  const handlePlaceBet = async (eventId: number) => {
    const event = events.find(e => e.id === eventId);
    if (event) {
      setSelectedEvent(event);
    }
  };
  
  const confirmBet = async () => {
    if (selectedEvent && betAmount && user) {
      try {
        const { error: betError } = await supabase
          .from('bets')
          .insert([
            {
              user_id: user.telegram_id,
              event_id: selectedEvent.id,
              amount: betAmount,
              outcome: 'pending',
              status: 'active',
            },
          ]);
  
        if (betError) {
          console.error("Error placing bet:", betError);
          return;
        }
  
        setSelectedEvent(null);
        setBetAmount('');
  
         // Manually update bets after placing a bet                                           
        const { data: betsData, error: fetchError } = await supabase
          .from('bets')
          .select('*')
          .eq('user_id', user.telegram_id);
  
        if (fetchError) {
          console.error("Error fetching bets:", fetchError);
        } else {
          setBets(betsData || []);
        }
  
        // Update the user's rank                         
        const updatedRank = (parseInt(user.rank, 10) || 0) + 1;
        const { error: rankError } = await supabase
          .from('users')
          .update({ rank: updatedRank.toString() })
          .eq('telegram_id', user.telegram_id);
  
        if (rankError) {
          console.error("Error updating user rank:", rankError);
        } else {
          setUser((prevUser) => prevUser ? { ...prevUser, rank: updatedRank.toString() } : null);
        }
  
      } catch (error) {
        console.error("An unexpected error occurred:", error);
      }
    }
  };

  return (
    <div className="w-full min-h-screen bg-muted/40 flex flex-col p-4 overflow-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">
          <FontAwesomeIcon icon={faTachometerAlt} className="gradient-icon mr-2" />
          {t("calcTitle")}
        </h1>
      </div>

      {/* Crypto Section */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>{t("cryptoManagement")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Crypto Deposit */}
            <div>
              <CryptoPayment creatorTelegramId={user?.ton_wallet? user.ton_wallet : ""}/>
            </div>
            {/* Crypto Withdrawal */}
            <div>
              <CryptoWithdrawal />
            </div>
          </div>
        </CardContent>
      </Card>
      

      <Card>
        <CardHeader>
          <CardTitle>{t("activeBets")}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("title")}</TableHead>
                <TableHead>{t("amount")}</TableHead>
                <TableHead>{t("outcome")}</TableHead>
                <TableHead>{t("pay")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bets.map(bet => {
                const { title } = getEventDetailsById(bet.event_id);
                return (
                  <TableRow key={bet.id}>
                    <TableCell>{title}</TableCell>
                    <TableCell>{bet.amount}</TableCell>
                    <TableCell>{t(bet.outcome)}</TableCell>
                    <TableCell>
                      {bet.status === 'active' ? (
                        <CryptoPayment creatorTelegramId={bet?.user_id.toString()}/>
                        /*{<Button variant="ghost" size="sm">
                          {t("active")}
                        </Button>}*/
                      ) : (
                        <Button variant="destructive" size="sm" 
                        disabled={true}>
                          {bet.status}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>{t("upcomingEvents")}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("title")}</TableHead>
                <TableHead>{t("description")}</TableHead>
                <TableHead>{t("actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.map(event => {
                const { title, description } = getEventDetailsById(event.id);
                return (
                  <TableRow key={event.id}>
                    <TableCell>{title}</TableCell>
                    <TableCell>{description}</TableCell>
                    <TableCell>
                      <Button
                        onClick={() => handlePlaceBet(event.id)}
                        variant="default"
                        size="sm"
                        disabled={event.expired}
                      >
                        {event.expired ? t("expired") : t("bet")}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <DebugInfo />
      
      {selectedEvent && (
        <Dialog open={true} onOpenChange={() => setSelectedEvent(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("placeBet")}</DialogTitle>
              <DialogDescription>{store.lang === 'ru' ? selectedEvent.title_ru : store.lang === 'ukr' ? selectedEvent.title_ukr : selectedEvent.title}</DialogDescription>
            </DialogHeader>
            {selectedEvent.educational_video_url && (
              <div className="my-4">
                <iframe
                  width="100%"
                  height="315"
                  src={selectedEvent.educational_video_url}
                  title="Educational Video"
                  frameBorder="0"
                  allowFullScreen
                ></iframe>
              </div>
            )}
            <Input
              type="number"
              placeholder={t("enterBetAmount")}
              value={betAmount}
              onChange={(e) => setBetAmount(e.target.value)}
              className="mb-4"
            />
            <Button onClick={confirmBet} className="w-full">
              {t("confirm")}
            </Button>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
