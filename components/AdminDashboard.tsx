"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from "../lib/supabaseClient";
import { useAppContext } from '../context/AppContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserShield } from '@fortawesome/free-solid-svg-icons';
const AdminDashboard: React.FC = () => {
  const { user, t } = useAppContext();
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
      <h1 className="text-2xl font-bold mb-4 neon-glow"><FontAwesomeIcon icon={faUserShield} className="gradient-icon mr-2" />{t('adminDashboard')}</h1>
      <table className="table-auto w-full border">
        <thead>
          <tr>
            <th className="border p-2">{t('referrer')}</th>
            <th className="border p-2">{t('referee')}</th>
            <th className="border p-2">{t('level')}</th>
            <th className="border p-2">{t('date')}</th>
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
