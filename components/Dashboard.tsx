//components\Dashboard.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useAppContext } from "../context/AppContext";
import DebugInfo from "../components/DebugInfo";

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
  description: string;
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
  const { user, t  } = useAppContext();

  //, addDebugLog useEffect(() => {
  //   addDebugLog("Page loaded");
  //   // Add other logs as necessary
  // }, []); // Empty array means this runs only once on component mount

  useEffect(() => {
    // Fetch bets from Supabase
    const fetchBets = async () => {
      const { data, error } = await supabase
        .from('bets')
        .select('*')
        .eq('user_id', user?.telegram_id); // Ensure only bets for the current user

      if (error) {
        console.error("Error fetching bets:", error);
      } else {
        setBets(data || []);
      }
    };

    // Fetch events from Supabase
    const fetchEvents = async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .not('id', 'in', `(${bets.map(bet => bet.event_id).join(',')})`); // Exclude events already bet on

      if (error) {
        console.error("Error fetching events:", error);
      } else {
        setEvents(data || []);
      }
    };

    // Fetch events from Supabase
    const fetchAllEvents = async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        
      if (error) {
        console.error("Error fetching all events:", error);
      } else {
        setAllEvents(data || []);
      }
    };

    fetchBets();
    fetchEvents();
    fetchAllEvents();
  }, [user?.telegram_id, bets]);

  // Handler for placing a bet
  const handlePlaceBet = async (eventId: number) => {
    const event = events.find(e => e.id === eventId);
    if (event) {
      setSelectedEvent(event);
    }
  };

  // Confirm Bet Handler
  const confirmBet = async () => {
    if (selectedEvent && betAmount) {
      const { error } = await supabase
        .from('bets')
        .insert([
          {
            user_id: user?.telegram_id,
            event_id: selectedEvent.id,
            amount: betAmount,
            outcome: 'Pending',
            status: 'active',
          },
        ]);

      if (error) {
        console.error("Error placing bet:", error);
      } else {
        setSelectedEvent(null);
        setBetAmount('');
        // Refresh bets after placing a bet
        const { data } = await supabase
          .from('bets')
          .select('*')
          .eq('user_id', user?.telegram_id);

        setBets(data || []);
      }
    }
  };

  // Function to get the event title by event ID
  const getEventTitleById = (eventId: number) => {
    const event = allEvents.find(e => e.id === eventId);
    return event ? event.title : 'Unknown Event';
  };
//<span className="text-lg font-thin">{user?.telegram_username}</span>
  return (
    <div className="w-full min-h-screen bg-muted/40 flex flex-col p-4 overflow-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">{t("calcTitle")}</h1>
        
      </div>
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
                <TableHead>{t("status")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bets.map(bet => (
                <TableRow key={bet.id}>
                  <TableCell>{getEventTitleById(bet.event_id)}</TableCell>
                  <TableCell>{bet.amount}</TableCell>
                  <TableCell>{bet.outcome}</TableCell>
                  <TableCell>
                    {bet.status === 'active' ? (
                      <Button variant="outline" size="sm">
                        {t("active")}
                      </Button>
                    ) : (
                      <span>{bet.status}</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
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
              {events.map(event => (
                <TableRow key={event.id}>
                  <TableCell>{event.title}</TableCell>
                  <TableCell>{event.description}</TableCell>
                  <TableCell>
                    <Button
                      onClick={() => handlePlaceBet(event.id)}
                      variant="outline"
                      size="sm"
                      disabled={event.expired}
                    >
                      {event.expired ? t("expired") : t("bet")}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <DebugInfo />
      {/* Modal for placing a bet */}
      {selectedEvent && (
        <Dialog open={true} onOpenChange={() => setSelectedEvent(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("placeBet")}</DialogTitle>
              <DialogDescription>{selectedEvent.title}</DialogDescription>
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
