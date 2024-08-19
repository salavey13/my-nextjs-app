// src/pages/SignUp.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from '../utils/TranslationUtils.tsx';
import { supabase } from '../supabaseClient';

const SignUp: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const [telegramUsername, setTelegramUsername] = useState('');
  const [telegramId, setTelegramId] = useState('');

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const ref = searchParams.get('ref');

    if (ref) {
      localStorage.setItem('referral', ref);
    }
  }, [location]);

  const handleSignUp = async () => {
    const { error } = await supabase.from('users').insert([{ telegram_username: telegramUsername, telegram_id: telegramId }]);

    if (error) console.error('Error signing up:', error);
    else {
      const ref = localStorage.getItem('referral');
      if (ref) {
        const { data: referrerData, error: referrerError } = await supabase
          .from('referrals')
          .select('id')
          .eq('referral_link', `${window.location.origin}/signup?ref=${ref}`)
          .single();

        if (referrerError) console.error('Error finding referrer:', referrerError);
        if (referrerData) {
          await supabase.from('referrals').update({ referee_id: telegramId }).eq('id', referrerData.id);
        }

        localStorage.removeItem('referral');
      }
      navigate('/');
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">{t('welcome')}</h2>
      <input
        type="text"
        placeholder={t('telegramUsername')}
        value={telegramUsername}
        onChange={(e) => setTelegramUsername(e.target.value)}
        className="input input-bordered w-full mb-2"
      />
      <input
        type="text"
        placeholder={t('telegramId')}
        value={telegramId}
        onChange={(e) => setTelegramId(e.target.value)}
        className="input input-bordered w-full mb-4"
      />
      <button onClick={handleSignUp} className="btn btn-primary w-full">
        {t('signUp')}
      </button>
    </div>
  );
};

export default SignUp;
