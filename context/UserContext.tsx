// src/context/UserContext.tsx
interface User {
    id: number;
    telegram_id: number;
    telegram_username: string;
    iq: number | null;
    social_credit: number;
    role: number; // 0: Regular User, 1: Admin, -1: Unpaid Bets
    total_referrals: number;
    referral_bonus: number;
  }
  