"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import { supabase } from "../lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Trophy, AlertCircle, Send } from 'lucide-react';
import ClipboardManager from './ClipboardManager';
import { zeroStageRequest, zeroStageRequest4Type } from "./requestTemplate";
import EnhancedChatButton from './ui/enhancedChatButton';
import NavBar from "@/components/ui/navBar";

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
  const [currentSection, setCurrentSection] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchAchievements();
  }, [user]);

  useEffect(() => {
    const handleScroll = () => {
      if (containerRef.current) {
        const scrollPosition = containerRef.current.scrollTop;
        const windowHeight = window.innerHeight - 128; // Adjust for topShelf and bottomShelf
        const sectionIndex = Math.round(scrollPosition / windowHeight);
        setCurrentSection(sectionIndex);
      }
    };

    containerRef.current?.addEventListener('scroll', handleScroll);
    return () => containerRef.current?.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (index: number) => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: index * (window.innerHeight - 128),
        behavior: 'smooth'
      });
    }
  };

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

  const sections = [
    { title: t('welcomeSection') },
    { title: t('ideaSection') },
    { title: t('projectSection') },
    { title: t('achievementsSection') },
    { title: t('notifySection') },
  ];

  return (
    <div className="dev-container bg-gray-900 text-white h-[calc(100vh-128px)] overflow-hidden">
      {/*<nav className="fixed top-16 right-0 p-4 z-50">
        {sections.map((section, index) => (
          <Button
            key={index}
            onClick={() => scrollToSection(index)}
            variant={currentSection === index ? "default" : "outline"}
            className="mr-2"
          >
            {section.title}
          </Button>
        ))}
      </nav>*/}

      <NavBar 
        sections={sections} 
        currentSection={currentSection} 
        scrollToSection={scrollToSection} 
      />
      
      <div ref={containerRef} className="h-full overflow-y-auto snap-y snap-mandatory">
        {sections.map((section, index) => (
          <div
            key={index}
            className="h-[calc(100vh-128px)] snap-start flex items-center justify-center p-8"
          >
            <Card className="w-full max-w-4xl bg-gray-800 text-white">
              <CardHeader>
                <CardTitle>{section.title}</CardTitle>
              </CardHeader>
              <CardContent>
                {index === 0 && (
                  <>
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
                  </>
                )}
                {index === 1 && (
                  <>
                    <Textarea
                      value={ideaText}
                      onChange={(e) => setIdeaText(e.target.value)}
                      placeholder={t("describeYourIdeaPlaceholder")}
                      className="bg-gray-700 text-white mb-4"
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
                  </>
                )}
                {index === 2 && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-xl font-semibold mb-2">{t('githubProjectIntegration')}</h3>
                        <p>{t('githubProjectDescription')}</p>
                        <Button
                          onClick={() => window.open('https://github.com/users/salavey13/projects/2', '_blank')}
                          variant="outline"
                          className="mt-4 w-full"
                        >
                          {t('openGitHubProject')}
                        </Button>
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold mb-2">{t('vercelDeployment')}</h3>
                        <p>{t('vercelDeploymentDescription')}</p>
                        <Button
                          onClick={() => window.open('https://vercel.com/salavey13s-projects/my-nextjs-app/deployments', '_blank')}
                          variant="outline"
                          className="mt-4 w-full"
                        >
                          {t('openVercelDashboard')}
                        </Button>
                      </div>
                    </div>
                    <Button
                      onClick={() => window.open('https://github.com/salavey13/my-nextjs-app/tree/main/components', '_blank')}
                      variant="outline"
                      className="mt-4 w-full"
                    >
                      {t('viewProjectComponents')}
                    </Button>
                  </>
                )}
                {index === 3 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {achievements.map((achievement) => (
                      <div key={achievement.id} className="p-4 bg-gray-700 rounded-lg">
                        <div className="flex items-center">
                          <Trophy className="mr-2 text-yellow-400" />
                          <h3 className="text-xl font-semibold">{achievement.title}</h3>
                        </div>
                        <p className="text-gray-300">{achievement.description}</p>
                        <div className="mt-2">
                          <div className="bg-gray-600 h-2 rounded-full">
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
                    <div className="p-4 bg-gray-700 rounded-lg">
                      <div className="flex items-center">
                        <Trophy className="mr-2 text-yellow-400" />
                        <h3 className="text-xl font-semibold">{t('requestGenerationAchievement')}</h3>
                      </div>
                      <p className="text-gray-300">{t('requestGenerationDescription')}</p>
                      <p className="text-2xl font-bold mt-2">{requestGenerationCount}</p>
                    </div>
                  </div>
                )}
                {index === 4 && (
                  <>
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
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

      {/*<div className="fixed bottom-20 right-4 z-50">
        <EnhancedChatButton />
      </div>*/}
    </div>
  );
};

export default Dev;
