import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppContext } from '@/context/AppContext';

interface VersimcelCreatorProps {
  onComplete: () => void;
}

export default function VersimcelCreator({ onComplete }: VersimcelCreatorProps) {
  const { t } = useAppContext();
  const [componentName, setComponentName] = useState('');
  const [componentDescription, setComponentDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = () => {
    if (componentName && componentDescription) {
      setIsCreating(true);
      setTimeout(() => {
        setIsCreating(false);
        onComplete();
      }, 3000);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{t('versimcelCreator')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Input
            type="text"
            placeholder={t('enterComponentName')}
            value={componentName}
            onChange={(e) => setComponentName(e.target.value)}
          />
          <Input
            type="text"
            placeholder={t('enterComponentDescription')}
            value={componentDescription}
            onChange={(e) => setComponentDescription(e.target.value)}
          />
          <Button onClick={handleCreate} disabled={isCreating || !componentName || !componentDescription}>
            {isCreating ? t('creatingComponent') : t('createComponent')}
          </Button>
          {isCreating && (
            <div className="text-center">
              <p>{t('simulatingCICD')}</p>
              <p>{t('generatingCode')}</p>
              <p>{t('deployingComponent')}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}