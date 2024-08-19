"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useGame } from "../context/AppContext";

// Define the shape of the bet data
interface Bet {
  id: number;
  user: string;
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
  const { store } = useGame();

  useEffect(() => {
    // Fetch bets from Supabase
    const fetchBets = async () => {
      const { data, error } = await supabase
        .from('bets')
        .select('*')
        .eq('user_id', store.tg_id); // Ensure only bets for the current user

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
        .not('id', 'in', `(${bets.map(bet => bet.id).join(',')})`); // Exclude events already bet on

      if (error) {
        console.error("Error fetching events:", error);
      } else {
        setEvents(data || []);
      }
    };

    fetchBets();
    fetchEvents();
  }, [store.tg_id, bets]);

  // Handler for placing a bet
  const handlePlaceBet = async (eventId: number) => {
    // Add logic to place a bet here
    console.log(`Placing bet on event ${eventId}`);
  };

  return (
    <div className="w-full min-h-screen bg-muted/40 flex flex-col p-4 overflow-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">Active Bets and Events</h1>
        <span className="text-lg">User: {store.username}</span>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Active Bets</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Amount</TableHead>
                <TableHead>Outcome</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bets.map(bet => (
                <TableRow key={bet.id}>
                  <TableCell>{bet.amount} ETH</TableCell>
                  <TableCell>{bet.outcome}</TableCell>
                  <TableCell>
                    {bet.status === 'active' ? (
                      <Button variant="outline" size="sm">
                        Active
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
          <CardTitle>Upcoming Events</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Actions</TableHead>
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
                      {event.expired ? 'Expired' : 'Bet'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
