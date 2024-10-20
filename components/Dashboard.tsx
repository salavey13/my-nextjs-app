"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useAppContext } from "../context/AppContext";
import { useGameProgression } from "@/hooks/useGameProgression";
import DebugInfo from "../components/DebugInfo";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTachometerAlt } from '@fortawesome/free-solid-svg-icons';
import { CryptoPayment } from "@/components/CryptoPayment";
import CryptoWithdrawal from "@/components/CryptoWithdrawal";
import { toast } from '@/hooks/use-toast'
import UnlockChoice from './UnlockChoice';
interface Bet {
  id: number;
  user_id: number;
  event_id: number;
  amount: number;
  outcome: string;
  status: string;
}

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
  const { state, dispatch, t } = useAppContext();
  const { progressStage } = useGameProgression();
  const user = state.user;
  const [showUnlockChoice, setShowUnlockChoice] = useState(false); // Added state
  const [sideHustles, setSideHustles] = useState<any[]>([]);
  const [showSideHustleModal, setShowSideHustleModal] = useState(false);
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
  }, [user, bets]);

  const getEventDetailsById = useCallback((eventId: number) => {
    const event = allEvents.find(e => e.id === eventId);
    if (!event) return { title: t("unknownEvent"), description: t("unknownDescription") };

    const title = user?.lang === 'ru' ? event.title_ru : user?.lang === 'ukr' ? event.title_ukr : event.title;
    const description = user?.lang === 'ru' ? event.description_ru : user?.lang === 'ukr' ? event.description_ukr : event.description;

    return { title, description };
  }, [allEvents, user?.lang, t]);

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
  
        const { data: betsData, error: fetchError } = await supabase
          .from('bets')
          .select('*')
          .eq('user_id', user.telegram_id);
  
        if (fetchError) {
          console.error("Error fetching bets:", fetchError);
        } else {
          setBets(betsData || []);
        }
  
        const updatedRank = (parseInt(user.rank, 10) || 0) + 1;
        const { error: rankError } = await supabase
          .from('users')
          .update({ rank: updatedRank.toString() })
          .eq('telegram_id', user.telegram_id);
  
        if (rankError) {
          console.error("Error updating user rank:", rankError);
        }

        // Check if this is the user's first bet and progress the stage if necessary
        if (betsData && betsData.length === 1 && user.game_state.stage === 5) {
          await progressStage(6, ['rents', 'versimcel', 'dev']);
          dispatch({
            type: 'UPDATE_GAME_STATE',
            payload: { stage: 6, unlockedComponents: [...(user.game_state.unlockedComponents || []), 'rents', 'versimcel'] }
          });
          triggerSideHustleChoice();
        }
  
      } catch (error) {
        console.error("An unexpected error occurred:", error);
      }
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

  return (
    <div className="w-full min-h-screen bg-muted/40 flex flex-col p-4 overflow-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">
          <FontAwesomeIcon icon={faTachometerAlt} className="gradient-icon mr-2" />
          {t("calcTitle")}
        </h1>
      </div>

{/* Crypto Section }
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>{t("cryptoManagement")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            { Crypto Deposit }
            <div>
              <CryptoPayment creatorTelegramId={user?.ton_wallet? user.ton_wallet : ""}/>
            </div>
            { Crypto Withdrawal }
            <div>
              <CryptoWithdrawal />
            </div>
          </div>
        </CardContent>
      </Card>*/}
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
                      ) : (
                        <Button variant="destructive" size="sm" disabled={true}>
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
              <DialogDescription>{user?.lang === 'ru' ? selectedEvent.title_ru : user?.lang === 'ukr' ? selectedEvent.title_ukr : selectedEvent.title}</DialogDescription>
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
      {showUnlockChoice && <UnlockChoice />} {/* Added UnlockChoice component */}
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