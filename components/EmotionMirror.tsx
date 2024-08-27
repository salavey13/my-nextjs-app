// components/EmotionMirror.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '../components/ui/card';
import LoadingSpinner  from '@/components/ui/LoadingSpinner';
import { getEmotionGif, getEmotionEmoji } from '@/lib/emotionAnalyzer';

const EmotionMirror: React.FC = () => {
  const { t } = useAppContext();
  const [message, setMessage] = useState<string>('');
  const [emotionGif, setEmotionGif] = useState<string | null>(null);
  const [emotionEmoji, setEmotionEmoji] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (message.trim()) {
      setLoading(true);
      analyzeEmotion(message);
    }
  }, [message]);

  const analyzeEmotion = async (text: string) => {
    try {
      const gif = await getEmotionGif(text);
      const emoji = await getEmotionEmoji(text);
      setEmotionGif(gif);
      setEmotionEmoji(emoji);
    } catch (error) {
      console.error('Error analyzing emotion:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-4">
      <h2 className="text-xl font-bold mb-4">{t('emotionMirror')}</h2>
      <Input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder={t('typeMessage')}
        className="mb-4"
      />
      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="flex items-center">
          {emotionGif && <img src={emotionGif} alt="Emotion GIF" className="w-16 h-16 mr-2" />}
          {emotionEmoji && <span className="text-3xl">{emotionEmoji}</span>}
        </div>
      )}
      <Button className="mt-4" onClick={() => setMessage('')}>
        {t('clear')}
      </Button>
    </Card>
  );
};

export default EmotionMirror;