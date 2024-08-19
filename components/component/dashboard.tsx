"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

// Define the shape of the bet data
interface Bet {
  id: number;
  user: string;
  amount: number;
  outcome: string;
  status: string;
}

export default function Dashboard() {
  const [bets, setBets] = useState<Bet[]>([]);

  useEffect(() => {
    // Fetch bets from Supabase
    const fetchBets = async () => {
      const { data, error } = await supabase
        .from('bets')
        .select('*');

      if (error) {
        console.error("Error fetching bets:", error);
      } else {
        setBets(data || []);
      }
    };

    fetchBets();
  }, []);

  return (
    <div className="w-full min-h-screen bg-muted/40 flex flex-col p-4">
      <Card>
        <CardHeader>
          <CardTitle>Active Bets</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Outcome</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bets.map(bet => (
                <TableRow key={bet.id}>
                  <TableCell>{bet.user}</TableCell>
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
    </div>
  );
}
