"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useAppContext } from "../context/AppContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input"; // Assuming you have an Input component

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
  description: string;
  educational_video_url: string;
  expired: boolean;
  expiration_date: string | null;
}

export default function Dashboard() {
  const [bets, setBets] = useState<Bet[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [betAmount, setBetAmount] = useState<string>("");
  const { user, t } = useAppContext();

  useEffect(() => {
    const fetchBets = async () => {
      const { data, error } = await supabase
        .from("bets")
        .select("*")
        .eq("user_id", user?.telegram_id);

      if (error) {
        console.error("Error fetching bets:", error);
      } else {
        setBets(data || []);
      }
    };

    const fetchEvents = async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .not("id", "in", `(${bets.map((bet) => bet.event_id).join(",")})`);

      if (error) {
        console.error("Error fetching events:", error);
      } else {
        setEvents(data || []);
      }
    };

    fetchBets();
    fetchEvents();
  }, [user?.telegram_id, bets]);

  const handlePlaceBet = (event: Event) => {
    setSelectedEvent(event);
  };

  const confirmBet = async () => {
    if (!selectedEvent || !betAmount) return;

    const { data, error } = await supabase
      .from("bets")
      .insert({
        user_id: user?.telegram_id,
        event_id: selectedEvent.id,
        amount: parseFloat(betAmount),
        outcome: "pending",
        status: "active",
      });

    if (error) {
      console.error("Error placing bet:", error);
    } else if (data) {
      setBets([...bets, data[0]]);
      setSelectedEvent(null);
      setBetAmount("");
    }
  };

  return (
    <div className="w-full min-h-screen bg-muted/40 flex flex-col p-4 overflow-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">{t("activeBets")}</h1>
        <span className="text-lg font-thin">{user?.telegram_username}</span>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{t("activeBets")}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("amount")}</TableHead>
                <TableHead>{t("outcome")}</TableHead>
                <TableHead>{t("status")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bets.map((bet) => (
                <TableRow key={bet.id}>
                  <TableCell>{bet.amount} ETH</TableCell>
                  <TableCell>{bet.outcome}</TableCell>
                  <TableCell>
                    {bet.status === "active" ? (
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
              {events.map((event) => (
                <TableRow key={event.id}>
                  <TableCell>{event.title}</TableCell>
                  <TableCell>{event.description}</TableCell>
                  <TableCell>
                    <Button
                      onClick={() => handlePlaceBet(event)}
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

      {/* Modal for placing a bet */}
      {selectedEvent && (
        <Dialog open={true} onOpenChange={() => setSelectedEvent(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("placeBet")}</DialogTitle>
              <DialogDescription>{selectedEvent.title}</DialogDescription>
            </DialogHeader>
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
