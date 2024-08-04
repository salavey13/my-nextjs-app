"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { 
  Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage 
} from "@/components/ui/breadcrumb";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "../../lib/supabaseClient"


export default function MemberDashboard() {
  const [members, setMembers] = useState([]);

  useEffect(() => {
    // Fetch members from Supabase
    const fetchMembers = async () => {
      const { data, error } = await supabase
        .from('user_requests')
        .select('*');

      if (error) {
        console.error("Error fetching members:", error);
      } else {
        setMembers(data);
      }
    };

    fetchMembers();
  }, []);

  const makeVip = async (discordId) => {
    const { data, error } = await supabase
      .from('user_requests')
      .update({ is_vip: true })
      .eq('discord_id', discordId);

    if (error) {
      console.error("Error making user VIP:", error);
    } else {
      setMembers(prevMembers =>
        prevMembers.map(member =>
          member.discord_id === discordId ? { ...member, is_vip: true } : member
        )
      );
    }
  };

  return (
    <div className="w-full min-h-screen bg-muted/40 flex flex-col">
      <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
        <Breadcrumb className="hidden md:flex">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="#" prefetch={false}>
                  Dashboard
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Members</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="relative ml-auto flex-1 md:grow-0">
          <div className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search members..."
            className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px]"
          />
        </div>
      </header>
      <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Members</CardTitle>
            <CardDescription>Manage your team members.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="w-auto">Requests</TableHead>
                  <TableHead>VIP</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map(member => (
                  <TableRow key={member.discord_id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src="/placeholder-user.jpg" alt="Avatar" />
                          <AvatarFallback>{member.discord_id.slice(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="grid gap-0.5">
                          <div className="font-medium">{member.discord_id}</div>
                          <div className="text-sm text-muted-foreground">@{member.discord_id}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-right">{member.request_count}</div>
                    </TableCell>
                    <TableCell>
                      {member.is_vip ? (
                        <Badge variant="secondary">VIP</Badge>
                      ) : (
                        <Button variant="outline" size="sm" onClick={() => makeVip(member.discord_id)}>
                          Make VIP
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter>
            <div className="text-xs text-muted-foreground">
              Showing <strong>{members.length}</strong> members
            </div>
          </CardFooter>
        </Card>
      </main>
      <footer className="p-4">
        <div className="flex justify-center space-x-4">
          <Link href="/terms-of-service">Terms of Service</Link>
          <Link href="/privacy-policy">Privacy Policy</Link>
        </div>
      </footer>
    </div>
  );
}