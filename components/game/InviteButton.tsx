// components/InviteButton.tsx
"use client";

import React from 'react';
import { Button } from '@/components/ui/button'; // Adjust the path as needed
import { supabase } from '../../lib/supabaseClient';

const InviteButton: React.FC = () => {
  const handleInvite = async () => {
    // Logic to invite players via Supabase or other means
    // For simplicity, we'll just log to console here
    console.log('Invite button clicked!');
  };

  return (
    <Button
      onClick={handleInvite}
      className="invite-button"
    >
      Invite Player
    </Button>
  );
};

export default InviteButton;
