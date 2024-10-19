import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppContext } from '@/context/AppContext';

interface ConflictSimulatorProps {
  onComplete: () => void;
}

export default function ConflictSimulator({ onComplete }: ConflictSimulatorProps) {
  const { t } = useAppContext();
  const [scenario, setScenario] = useState('');
  const [options, setOptions] = useState<string[]>([]);
  const [selectedOption, setSelectedOption] = useState('');

  const scenarios = [
    {
      description: t('conflictScenario1'),
      options: [t('conflictOption1A'), t('conflictOption1B'), t('conflictOption1C')],
    },
    {
      description: t('conflictScenario2'),
      options: [t('conflictOption2A'), t('conflictOption2B'), t('conflictOption2C')],
    },
  ];

  const startSimulation = () => {
    const randomScenario = scenarios[Math.floor(Math.random() * scenarios.length)];
    setScenario(randomScenario.description);
    setOptions(randomScenario.options);
    setSelectedOption('');
  };

  const handleOptionSelect = (option: string) => {
    setSelectedOption(option);
    setTimeout(onComplete, 2000);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{t('conflictSimulator')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {!scenario && (
            <Button onClick={startSimulation}>{t('startSimulation')}</Button>
          )}
          {scenario && (
            <>
              <p className="text-lg font-semibold">{scenario}</p>
              <div className="space-y-2">
                {options.map((option, index) => (
                  <Button
                    key={index}
                    onClick={() => handleOptionSelect(option)}
                    disabled={!!selectedOption}
                    className="w-full"
                  >
                    {option}
                  </Button>
                ))}
              </div>
              {selectedOption && (
                <p className="text-green-600 font-semibold">{t('decisionRecorded')}</p>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}