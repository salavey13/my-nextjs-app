// src/components/AdminDashboard.tsx
"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from "../lib/supabaseClient";
import { useAppContext } from '../context/AppContext';

const AdminDashboard: React.FC = () => {
  const { user } = useAppContext();
  const [referrals, setReferrals] = useState<any[]>([]);
  
  useEffect(() => {
    const fetchReferrals = async () => {
      if (user?.role === 1) {
        const { data } = await supabase.from('referrals').select('*');
        setReferrals(data || []);
      }
    };
    fetchReferrals();
  }, [user]);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Admin Dashboard</h1>
      <table className="table-auto w-full border">
        <thead>
          <tr>
            <th className="border p-2">Referrer</th>
            <th className="border p-2">Referee</th>
            <th className="border p-2">Level</th>
            <th className="border p-2">Date</th>
          </tr>
        </thead>
        <tbody>
          {referrals.map(referral => (
            <tr key={referral.id}>
              <td className="border p-2">{referral.referrer_id}</td>
              <td className="border p-2">{referral.referee_id}</td>
              <td className="border p-2">{referral.level}</td>
              <td className="border p-2">{new Date(referral.created_at).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminDashboard;
