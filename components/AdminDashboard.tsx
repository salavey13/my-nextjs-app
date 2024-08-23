"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from "../lib/supabaseClient";
import { useAppContext } from '../context/AppContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserShield } from '@fortawesome/free-solid-svg-icons';
import LoadingSpinner from "../components/ui/LoadingSpinner"
// Define types for summary data
interface SummaryData {
  total: number;
  lastMonth: number;
  lastYear: number;
  byRefCode: { ref_code: string; count: number }[];
}

const AdminDashboard: React.FC = () => {
  const { user, t } = useAppContext();
  const [referrals, setReferrals] = useState<any[]>([]);
  const [summary, setSummary] = useState<SummaryData>({
    total: 0,
    lastMonth: 0,
    lastYear: 0,
    byRefCode: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReferrals = async () => {
      try {
        if (user?.role === 1) {
          // Fetch referrals along with related user data
          const { data: referralsData, error: fetchError } = await supabase
            .from('referrals')
            .select(`
              *,
              referrer:users!referrals_user_id_fkey(telegram_id, telegram_username),
              referee:users!referrals_referred_user_id_fkey(telegram_id, telegram_username)
            `)
            .order('referral_date', { ascending: false });

          if (fetchError) throw fetchError;

          setReferrals(referralsData || []);

          // Calculate summary data manually
          const total = referralsData.length;
          const lastMonth = referralsData.filter((referral: any) => {
            const referralDate = new Date(referral.referral_date);
            const now = new Date();
            const oneMonthAgo = new Date(now.setMonth(now.getMonth() - 1));
            return referralDate > oneMonthAgo;
          }).length;

          const lastYear = referralsData.filter((referral: any) => {
            const referralDate = new Date(referral.referral_date);
            const now = new Date();
            const oneYearAgo = new Date(now.setFullYear(now.getFullYear() - 1));
            return referralDate > oneYearAgo;
          }).length;

          const byRefCode = referralsData.reduce((acc: any, referral: any) => {
            if (!referral.ref_code) return acc;
            acc[referral.ref_code] = (acc[referral.ref_code] || 0) + 1;
            return acc;
          }, {});

          const byRefCodeArray = Object.keys(byRefCode).map(ref_code => ({
            ref_code,
            count: byRefCode[ref_code]
          }));

          setSummary({ total, lastMonth, lastYear, byRefCode: byRefCodeArray });
          setLoading(false);
        }
      } catch (error: any) {
        setError(error.message);
        setLoading(false);
      }
    };
    fetchReferrals();
  }, [user]);

  if (loading) return <LoadingSpinner />;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">
        <FontAwesomeIcon icon={faUserShield} className="gradient-icon mr-2" />
        {t('adminDashboard')}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 border rounded shadow">
          <h2 className="text-lg font-semibold">{t('totalReferrals')}</h2>
          <p className="text-2xl">{summary.total}</p>
        </div>
        <div className="p-4 border rounded shadow">
          <h2 className="text-lg font-semibold">{t('referralsLastMonth')}</h2>
          <p className="text-2xl">{summary.lastMonth}</p>
        </div>
        <div className="p-4 border rounded shadow">
          <h2 className="text-lg font-semibold">{t('referralsLastYear')}</h2>
          <p className="text-2xl">{summary.lastYear}</p>
        </div>
      </div>

      <table className="table-auto w-full border">
        <thead>
          <tr>
            <th className="border p-2">{t('referrer')}</th>
            <th className="border p-2">{t('referee')}</th>
            <th className="border p-2">{t('refCode')}</th>
            <th className="border p-2">{t('date')}</th>
          </tr>
        </thead>
        <tbody>
          {referrals.map((referral: any) => (
            <tr key={referral.id}>
              <td className="border p-2">{referral.referrer.telegram_username}</td>
              <td className="border p-2">{referral.referee.telegram_username}</td>
              <td className="border p-2">{referral.ref_code}</td>
              <td className="border p-2">{new Date(referral.referral_date).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">{t('referralsByCode')}</h2>
        <table className="table-auto w-full border">
          <thead>
            <tr>
              <th className="border p-2">{t('refCode')}</th>
              <th className="border p-2">{t('referrals')}</th>
            </tr>
          </thead>
          <tbody>
            {summary.byRefCode.map((refCode: any) => (
              <tr key={refCode.ref_code}>
                <td className="border p-2">{refCode.ref_code}</td>
                <td className="border p-2">{refCode.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;
