// components/GuestList.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';

const GuestList: React.FC = () => {
  const [guests, setGuests] = useState<string[]>([]);

  useEffect(() => {
    const fetchGuests = async () => {
      // Fetch guests from Supabase
      const { data, error } = await supabase
        .from('guests')
        .select('*');

      if (error) {
        console.error('Error fetching guests:', error);
      } else {
        setGuests(data.map(guest => guest.name));
      }
    };

    fetchGuests();
  }, []);

  return (
    <div className="guest-list">
      <h3>Guest List</h3>
      <ul>
        {guests.map((guest, index) => (
          <li key={index}>{guest}</li>
        ))}
      </ul>
    </div>
  );
};

export default GuestList;
