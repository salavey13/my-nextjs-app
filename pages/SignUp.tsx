// src/pages/SignUp.tsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';

const SignUp: React.FC = () => {
  const router = useRouter();
  const [telegramUsername, setTelegramUsername] = useState('');
  const [telegramId, setTelegramId] = useState('');

  useEffect(() => {
    const { query } = router;
    const ref = query.ref as string;

    if (ref) {
      localStorage.setItem('referral', ref);
    }
  }, [router]);

  useEffect(() => {
    const initTelegramWebApp = () => {
      const script = document.createElement('script');
      script.src = 'https://telegram.org/js/telegram-web-app.js';
      script.async = true;
      document.head.appendChild(script);

      script.onload = () => {
        if (window.Telegram?.WebApp) {
          window.Telegram.WebApp.expand();
          const initData = window.Telegram.WebApp.initData;

          if (initData) {
            const urlParams = new URLSearchParams(initData);
            const userParam = urlParams.get('user');

            if (userParam) {
              const user = JSON.parse(decodeURIComponent(userParam));
              if (user.id) {
                setTelegramId(user.id);
                setTelegramUsername(user.username || '');
              }
            }
          }
        }
      };

      return () => {
        document.head.removeChild(script);
      };
    };

    initTelegramWebApp();
  }, []);

  const handleSignUp = async () => {
    const { error } = await supabase.from('users').insert([{ telegram_username: telegramUsername, telegram_id: telegramId }]);

    if (error) {
      console.error('Error signing up:', error);
      return;
    }

    const ref = localStorage.getItem('referral');
    if (ref) {
      const { data: referrerData, error: referrerError } = await supabase
        .from('referrals')
        .select('id')
        .eq('referral_link', `${window.location.origin}/signup?ref=${ref}`)
        .single();

      if (referrerError) {
        console.error('Error finding referrer:', referrerError);
      } else if (referrerData) {
        await supabase.from('referrals').update({ referee_id: telegramId }).eq('id', referrerData.id);
      }

      localStorage.removeItem('referral');
    }

    router.push('/');  // Navigate to home page
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Welcome</h2>
      <input
        type="text"
        placeholder="Telegram Username"
        value={telegramUsername}
        onChange={(e) => setTelegramUsername(e.target.value)}
        className="input input-bordered w-full mb-2"
        disabled // Disabled since we're fetching it from Telegram
      />
      <input
        type="text"
        placeholder="Telegram ID"
        value={telegramId}
        onChange={(e) => setTelegramId(e.target.value)}
        className="input input-bordered w-full mb-4"
        disabled // Disabled since we're fetching it from Telegram
      />
      <button onClick={handleSignUp} className="btn btn-primary w-full">
        Sign Up
      </button>
    </div>
  );
};

export default SignUp;

