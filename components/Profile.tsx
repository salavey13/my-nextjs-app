"use client";

import { useState, useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';
import { supabase } from '@/lib/supabaseClient';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import QRCode from 'react-qr-code';
import { Crown, Loader2, Zap, Coins, Star, Users, Shield, Sparkles } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface UserData {
  id: number;
  telegram_id: number;
  telegram_username: string;
  lang: 'ru' | 'en' | 'ukr';
  avatar_url: string;
  coins: number;
  rp: number;
  X: number;
  ref_code: string;
  rank: string;
  social_credit: number;
  role: number;
  cheers_count: number;
  site?: string;
  ton_wallet?: string;
  [key: string]: any; // Add index signature
}

const Profile: React.FC = () => {
  const { state, dispatch, t } = useAppContext();
  const user = state.user as UserData | null;
  const [site, setSite] = useState<string>('');
  const [telegramUsername, setTelegramUsername] = useState<string>('');
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    if (user) {
      setSite(user.site || '');
      setTelegramUsername(user.telegram_username || '');
      setWalletAddress(user.ton_wallet || '');
      setAvatarUrl(user.avatar_url || '');
    }
  }, [user]);

  const handleProfileUpdate = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const currentStage = user.game_state?.stage || 0;
      const newStage = walletAddress && currentStage === 2 ? 3 : currentStage;

      const { error } = await supabase
        .from('users')
        .update({
          telegram_username: telegramUsername,
          ton_wallet: walletAddress,
          site: site,
          avatar_url: avatarUrl,
          'game_state.stage': newStage,
        })
        .eq('id', user.id);

      if (error) throw error;

      dispatch({
        type: 'UPDATE_USER',
        payload: {
          telegram_username: telegramUsername,
          ton_wallet: walletAddress,
          site: site,
          avatar_url: avatarUrl,
          game_state: { ...user.game_state, stage: newStage },
        },
      });

      toast({
        title: t('success'),
        description: t('profileUpdated'),
      });

      if (newStage === 3 && currentStage === 2) {
        toast({
          title: t('stageProgression'),
          description: t('unlockedCryptoPrices'),
        });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: t('error'),
        description: t('failedToUpdateProfile'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };


  const StatCard: React.FC<{ title: string; value: number; icon: React.ReactNode; color: string }> = ({ title, value, icon, color }) => (
    <Card>
      <CardContent className="flex items-center p-4">
        <div className={`mr-4 rounded-full p-2 ${color}`}>
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="max-w-4xl mx-auto mt-10">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center">{t('profile')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-8">
              <Avatar className="h-32 w-32 border-4 border-primary">
                <AvatarImage src={avatarUrl || "/placeholder-user.jpg"} alt={t('profilePicture')} />
                <AvatarFallback>{user?.telegram_username?.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="text-center md:text-left">
                <h2 className="text-2xl font-bold">{telegramUsername}</h2>
                <p className="text-muted-foreground">{t('userId')}: {user?.telegram_id}</p>
                <p className="text-lg font-semibold mt-2">{t('rank')}: {user?.rank}</p>
                <div className="mt-2">
                  <Progress value={user?.social_credit || 0} max={100} className="w-full" />
                  <p className="text-sm text-muted-foreground mt-1">{t('socialCredit')}: {user?.social_credit}/100</p>
                </div>
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="profile">{t('profile')}</TabsTrigger>
                <TabsTrigger value="stats">{t('stats')}</TabsTrigger>
                <TabsTrigger value="wallet">{t('wallet')}</TabsTrigger>
              </TabsList>
              <TabsContent value="profile" className="space-y-4">
                <Input
                  value={site}
                  onChange={(e) => setSite(e.target.value)}
                  placeholder={t('site')}
                />
                <Input
                  value={telegramUsername}
                  onChange={(e) => setTelegramUsername(e.target.value)}
                  placeholder={t('telegramUsername')}
                />
                <Input
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder={t('avatarUrl')}
                />
                <Button
                  onClick={handleProfileUpdate}
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Crown className="mr-2 h-4 w-4" />}
                  {t('saveProfile')}
                </Button>
              </TabsContent>
              <TabsContent value="stats" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <StatCard title={t('coins')} value={user?.coins || 0} icon={<Coins className="h-6 w-6" />} color="bg-yellow-100 text-yellow-600" />
                  <StatCard title={t('rp')} value={user?.rp || 0} icon={<Star className="h-6 w-6" />} color="bg-purple-100 text-purple-600" />
                  <StatCard title={t('X')} value={user?.X || 0} icon={<Zap className="h-6 w-6" />} color="bg-blue-100 text-blue-600" />
                  <StatCard title={t('cheers_count')} value={user?.cheers_count || 0} icon={<Users className="h-6 w-6" />} color="bg-green-100 text-green-600" />
                </div>
                <Card>
                  <CardContent className="p-4">
                    <h3 className="text-lg font-semibold mb-2">{t('achievements')}</h3>
                    <div className="flex flex-wrap gap-2">
                      {/* Add achievement badges here */}
                      <Shield className="h-8 w-8 text-primary" />
                      <Sparkles className="h-8 w-8 text-primary" />
                      {/* Add more achievement icons as needed */}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="wallet" className="space-y-4">
                <Input
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  placeholder={t('walletAddress')}
                />
                <Button
                  onClick={handleProfileUpdate}
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Crown className="mr-2 h-4 w-4" />}
                  {t('saveWallet')}
                </Button>
                {walletAddress && (
                  <div className="mt-4 flex justify-center">
                    <QRCode value={walletAddress} size={200} />
                  </div>
                )}
              </TabsContent>
            </Tabs>

            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground text-center">
                  {t('ref_code')}: <span className="font-semibold">{user?.ref_code || t('none')}</span>
                </p>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};

export default Profile;
