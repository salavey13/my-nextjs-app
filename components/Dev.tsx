"use client";

import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { supabase } from "../lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Trophy, AlertCircle, Github, Vercel, Send } from 'lucide-react';
import ClipboardManager from './ClipboardManager';
import { zeroStageRequest, zeroStageRequest4Type } from "./requestTemplate";

interface Achievement {
  id: string;
  title: string;
  description: string;
  progress: number;
  max_progress: number;
}

const Dev: React.FC = () => {
  const { user, t } = useAppContext();
  const [ideaText, setIdeaText] = useState<string>("");
  const [requestGenerated, setRequestGenerated] = useState<boolean>(false);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [requestGenerationCount, setRequestGenerationCount] = useState<number>(0);
  const [v0DevLink, setV0DevLink] = useState<string>("");
  const [githubTaskLink, setGithubTaskLink] = useState<string>("");

  useEffect(() => {
    fetchAchievements();
  }, [user]);

  const fetchAchievements = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('achievements')
      .select('*')
      .eq('user_id', user.id);
    if (error) console.error('Error fetching achievements:', error);
    else setAchievements(data || []);
  };

  const handleZeroStageRequest = (type: 'normal' | 'type') => {
    const request = type === 'normal' ? zeroStageRequest : zeroStageRequest4Type;
    navigator.clipboard.writeText(ideaText + "\n" + request);
    setRequestGenerated(true);
    setRequestGenerationCount(prev => prev + 1);
    updateAchievement('request_generation');
  };

  const updateAchievement = async (achievementType: string) => {
    if (!user) return;
    const { data: existingAchievement } = await supabase
      .from('achievements')
      .select('*')
      .eq('user_id', user.id)
      .eq('achievement_type', achievementType)
      .single();

    if (existingAchievement) {
      const { error } = await supabase
        .from('achievements')
        .update({ progress: Math.min(existingAchievement.progress + 1, existingAchievement.max_progress) })
        .eq('id', existingAchievement.id);
      if (error) console.error('Error updating achievement:', error);
    } else {
      const { error } = await supabase
        .from('achievements')
        .insert({
          user_id: user.id,
          title: t(`achievement_${achievementType}_title`),
          description: t(`achievement_${achievementType}_description`),
          progress: 1,
          max_progress: achievementType === 'request_generation' ? 100 : 10,
          achievement_type: achievementType
        });
      if (error) console.error('Error creating achievement:', error);
    }
    fetchAchievements();
  };

  const notifySalavey13 = async () => {
    if (!v0DevLink || !githubTaskLink) {
      alert(t('pleaseProvideLinks'));
      return;
    }
    
    // This is a placeholder. You should implement the actual notification logic.
    const response = await fetch('/api/notify-salavey13', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ v0DevLink, githubTaskLink }),
    });

    if (response.ok) {
      alert(t('notificationSent'));
    } else {
      alert(t('notificationFailed'));
    }
  };

  return (
    <div className="dev-container p-4 bg-gray-800 text-white rounded-md">
      <h1 className="text-3xl font-bold mb-6">{t('developerDashboard')}</h1>

      <Card className="mb-6 bg-gray-700">
        <CardHeader>
          <CardTitle>{t('welcomeToDevTab')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{t('devTabInstructions')}</p>
          <ol className="list-decimal list-inside mt-4">
            <li>{t('step1Description')}</li>
            <li>{t('step2Description')}</li>
            <li>{t('step3Description')}</li>
            <li>{t('step4Description')}</li>
          </ol>
          <Button
            onClick={() => window.open('https://v0.dev', '_blank')}
            variant="outline"
            className="mt-4 w-full"
          >
            {t('openV0Dev')}
          </Button>
        </CardContent>
      </Card>

      <Card className="mb-6 bg-gray-700">
        <CardHeader>
          <CardTitle>{t('enterYourIdeaTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={ideaText}
            onChange={(e) => setIdeaText(e.target.value)}
            placeholder={t("describeYourIdeaPlaceholder")}
            className="bg-gray-600 text-white mb-4"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Button onClick={() => handleZeroStageRequest('normal')} variant="outline">
              {t('generateRequestButton')}
            </Button>
            <Button onClick={() => handleZeroStageRequest('type')} variant="outline">
              {t('generateRequestButton4type')}
            </Button>
          </div>
          {requestGenerated && (
            <div className="mt-4 text-green-400">
              <AlertCircle className="inline mr-2" />
              {t('requestGeneratedSuccess')}
            </div>
          )}
          <ClipboardManager requestText={ideaText + "\n" + zeroStageRequest} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card className="bg-gray-700">
          <CardHeader>
            <CardTitle>{t('githubProjectIntegration')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{t('githubProjectDescription')}</p>
            <Button
              onClick={() => window.open('https://github.com/users/salavey13/projects/2', '_blank')}
              variant="outline"
              className="mt-4 w-full"
            >
              <Github className="mr-2" />
              {t('openGitHubProject')}
            </Button>
            <iframe
              src="https://github.com/users/salavey13/projects/2"
              className="w-full h-64 mt-4 border border-gray-600 rounded"
              title="GitHub Project"
            />
            <Button
              onClick={() => window.open('https://github.com/salavey13/my-nextjs-app/tree/main/components', '_blank')}
              variant="outline"
              className="mt-4 w-full"
            >
              {t('viewProjectComponents')}
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-gray-700">
          <CardHeader>
            <CardTitle>{t('vercelDeployment')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{t('vercelDeploymentDescription')}</p>
            <Button
              onClick={() => window.open('https://vercel.com/salavey13s-projects/my-nextjs-app/deployments', '_blank')}
              variant="outline"
              className="mt-4 w-full"
            >
              <Vercel className="mr-2" />
              {t('openVercelDashboard')}
            </Button>
            <iframe
              src="https://vercel.com/salavey13s-projects/my-nextjs-app/deployments"
              className="w-full h-64 mt-4 border border-gray-600 rounded"
              title="Vercel Dashboard"
            />
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6 bg-gray-700">
        <CardHeader>
          <CardTitle>{t('achievements')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {achievements.map((achievement) => (
              <div key={achievement.id} className="p-4 bg-gray-600 rounded-lg">
                <div className="flex items-center">
                  <Trophy className="mr-2 text-yellow-400" />
                  <h3 className="text-xl font-semibold">{achievement.title}</h3>
                </div>
                <p className="text-gray-300">{achievement.description}</p>
                <div className="mt-2">
                  <div className="bg-gray-700 h-2 rounded-full">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${(achievement.progress / achievement.max_progress) * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-400 mt-1">
                    {achievement.progress} / {achievement.max_progress}
                  </p>
                </div>
              </div>
            ))}
            <div className="p-4 bg-gray-600 rounded-lg">
              <div className="flex items-center">
                <Trophy className="mr-2 text-yellow-400" />
                <h3 className="text-xl font-semibold">{t('requestGenerationAchievement')}</h3>
              </div>
              <p className="text-gray-300">{t('requestGenerationDescription')}</p>
              <p className="text-2xl font-bold mt-2">{requestGenerationCount}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6 bg-gray-700">
        <CardHeader>
          <CardTitle>{t('getStartedWithGitHub')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{t('githubAccountInstructions')}</p>
          <Button
            onClick={() => window.open('https://github.com/join', '_blank')}
            variant="outline"
            className="mt-4 w-full"
          >
            {t('createGitHubAccount')}
          </Button>
        </CardContent>
      </Card>

      <Card className="mb-6 bg-gray-700">
        <CardHeader>
          <CardTitle>{t('notifySalavey13')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            value={v0DevLink}
            onChange={(e) => setV0DevLink(e.target.value)}
            placeholder={t('v0DevLinkPlaceholder')}
            className="mb-2"
          />
          <Input
            value={githubTaskLink}
            onChange={(e) => setGithubTaskLink(e.target.value)}
            placeholder={t('githubTaskLinkPlaceholder')}
            className="mb-2"
          />
          <Button onClick={notifySalavey13} variant="outline" className="w-full">
            <Send className="mr-2" />
            {t('sendNotification')}
          </Button>
        </CardContent>
      </Card>

      <div className="fixed bottom-4 right-4">
        <Button
          onClick={() => window.open('https://your-vpn-url.com', '_blank')}
          variant="outline"
          size="sm"
        >
          {t('vpnAccess')}
        </Button>
      </div>
    </div>
  );
};

export default Dev;
