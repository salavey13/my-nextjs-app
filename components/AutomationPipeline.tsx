"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { toast } from '@/hooks/use-toast';
import { useAppContext } from '@/context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from '@/hooks/useInView';
import { AlertCircle, CheckCircle, GitBranch, GitCommit, Loader2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './ui/card';
import Link from 'next/link';
import Image from 'next/image'

// Types
type PipelineStep = 'collect' | 'generate' | 'enhance' | 'review' | 'push' | "complete";
type LogType = 'info' | 'success' | 'warning' | 'error';
type Log = {
  type: LogType;
  message: string;
};

const componentList = [
  "versimcel", "rents", "quiz", "paymentNotification", "dynamicItemForm", 
  "qrCodeForm", "cryptoPayment", "rent", "referral", "questsForCoins", 
  "bets", "createEvent", "conflictAwareness", "dev"
];

interface AutomationPipelineProps {
  componentName?: string;
}

export default function AutomationPipeline({ componentName = "chess" }: AutomationPipelineProps) {
  const { state, t } = useAppContext();
  const [currentStep, setCurrentStep] = useState<PipelineStep>('collect');
  const [logs, setLogs] = useState<Log[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [showImageGrid, setShowImageGrid] = useState(false);
  const simulationStartedRef = useRef(false);

  const addLog = useCallback((message: string, type: LogType = 'info') => {
    setLogs(prevLogs => [...prevLogs, { type, message }]);
  }, []);

  const handleError = useCallback((message: string) => {
    setError(message);
    addLog(message, 'error');
    toast({
      variant: "destructive",
      title: t("error"),
      description: message,
    });
  }, [t, addLog]);

  const handleSuccess = useCallback((message: string) => {
    addLog(message, 'success');
    toast({
      title: t("success"),
      description: message,
    });
  }, [t, addLog]);

  const simulateComponentCreation = useCallback(async () => {
    if (simulationStartedRef.current) return;
    simulationStartedRef.current = true;

    try {
      addLog(`Начинаем создание компонента ${componentName}...`, 'info');
      setProgress(10);

      // Simulate data collection
      await new Promise(resolve => setTimeout(resolve, 2000));
      addLog(`Собраны данные для компонента ${componentName}`, 'success');
      setProgress(30);
      setCurrentStep('generate');

      // Simulate code generation
      await new Promise(resolve => setTimeout(resolve, 3000));
      addLog(`Сгенерирован код для ${componentName}.tsx`, 'success');
      setProgress(50);
      setCurrentStep('enhance');

      // Simulate code enhancement
      await new Promise(resolve => setTimeout(resolve, 2000));
      addLog(`Улучшен код компонента ${componentName}`, 'success');
      setProgress(70);
      setCurrentStep('review');

      // Simulate review process
      await new Promise(resolve => setTimeout(resolve, 1500));
      addLog(`Проверен и одобрен компонент ${componentName}`, 'success');
      setProgress(90);
      setCurrentStep('push');

      // Simulate pushing to GitHub
      await new Promise(resolve => setTimeout(resolve, 2000));
      addLog(`Компонент ${componentName} успешно добавлен в репозиторий`, 'success');
      setProgress(100);
      setCurrentStep('complete');

      handleSuccess(`Компонент ${componentName} успешно создан и интегрирован`);
      setShowImageGrid(true);
    } catch (err) {
      handleError(`Ошибка при создании компонента ${componentName}: ${(err as Error).message}`);
    }
  }, [componentName, addLog, handleSuccess, handleError]);

  useEffect(() => {
    simulateComponentCreation();
  }, [simulateComponentCreation]);

  const getProgressColor = (progress: number): string => {
    if (progress < 33) return 'bg-red-500';
    if (progress < 66) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const ImageGrid = () => {
    const items = [
      {
        href: 'https://v0.dev',
        imageSrc: '/v0-screenshot.png',
        alt: 'v0.dev screenshot',
        label: t('visitV0'),
      },
      {
        href: 'https://github.com/salavey13/my-nextjs-app/',
        imageSrc: '/github-screenshot.png',
        alt: 'GitHub repository screenshot',
        label: t('viewGitHubRepo'),
      },
      {
        href: 'https://vercel.com/salavey13s-projects/my-nextjs-app/deployments',
        imageSrc: '/vercel-screenshot.png',
        alt: 'Vercel deployments screenshot',
        label: t('checkVercelDeployments'),
      },
    ];
  
    return (
      <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-3">
        {items.map((item, index) => (
          <ItemCard key={index} item={item} />
        ))}
      </div>
    );
  };
  
  const ItemCard = ({ item }: { item: { href: string; imageSrc: string; alt: string; label: string } }) => {
    const { ref, isInView } = useInView({ threshold: 0.2 });
  
    return (
      <Link
        ref={ref}
        href={item.href}
        className={`relative group overflow-hidden rounded-lg drop-shadow-custom transition-all duration-500 transform 
        ${isInView ? 'scale-100 opacity-100' : 'opacity-0 scale-95'}`}
      >
        <div className="relative w-full h-0 pb-[57%]">
          <Image
            src={item.imageSrc}
            alt={item.alt}
            fill
            className="rounded-lg object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
        <div
          className={`absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center transition-opacity duration-500 ${
            isInView ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <span className="text-white text-lg font-bold drop-shadow-custom">
            {item.label}
          </span>
        </div>
      </Link>
    );
  };
  
  return(
    <div className="flex flex-col bg-gray-900">
      <div className="overflow-y-auto p-4">
        <Card className="bg-gray-800 text-white">
          <CardHeader>
            <CardTitle className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl w-full break-words leading-tight text-center">
              🪄 VerSimcel
            </CardTitle>
            <CardDescription className="text-gray-400">{t("automation.watch")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="w-full h-2 bg-gray-700 rounded-full">
              <motion.div
                className={`h-full rounded-full ${getProgressColor(progress)}`}
                style={{ width: `${progress}%` }}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>

            <div className="space-y-4">
              <AnimatePresence>
                {['collect', 'generate', 'enhance', 'review', 'push'].map((step, index) => (
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -50 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className={`flex items-center space-x-2 automa-step-${step}`}
                  >
                    <CheckCircle
                      className={`h-5 w-5 ${currentStep === step ? 'text-green-500' : 'text-gray-500'}`}
                    />
                    <span>{t(`steps.${step}`, { defaultValue: step.charAt(0).toUpperCase() + step.slice(1) })}</span>
                    {currentStep === step && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
        
            <div className="bg-gray-700 p-4 rounded-md h-60 overflow-y-auto font-mono text-sm">
              {logs.map((log, index) => (
                <div key={index} className={`mb-1 ${log.type === 'error' ? 'text-red-400' : log.type === 'success' ? 'text-green-400' : 'text-gray-300'}`}>
                  {log.message}
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col md:flex-row justify-between space-y-4 md:space-y-0 md:items-center">
            <div className="flex items-center space-x-2">
              {error ? (
                <AlertCircle className="h-5 w-5 text-red-500" />
              ) : progress === 100 ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-yellow-500" />
              )}
              <span className="text-sm md:text-base text-gray-300">
                {error || (progress === 100 ? 'Автоматизация завершена' : 'Автоматизация в процессе')}
              </span>
            </div>
          </CardFooter>
        </Card>
        {showImageGrid && <ImageGrid />}
      </div>
    </div>
  );
}