import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppContext } from '@/context/AppContext';

interface FormBuilderProps {
  onComplete: () => void;
}

interface FormField {
  label: string;
  type: string;
}

export default function FormBuilder({ onComplete }: FormBuilderProps) {
  const { t } = useAppContext();
  const [fields, setFields] = useState<FormField[]>([]);
  const [newFieldLabel, setNewFieldLabel] = useState('');
  const [newFieldType, setNewFieldType] = useState('text');

  const addField = () => {
    if (newFieldLabel) {
      setFields([...fields, { label: newFieldLabel, type: newFieldType }]);
      setNewFieldLabel('');
      setNewFieldType('text');
    }
  };

  const handleComplete = () => {
    if (fields.length >= 3) {
      onComplete();
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{t('formBuilder')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex space-x-2">
            <Input
              type="text"
              placeholder={t('fieldLabel')}
              value={newFieldLabel}
              onChange={(e) => setNewFieldLabel(e.target.value)}
            />
            <select
              value={newFieldType}
              onChange={(e) => setNewFieldType(e.target.value)}
              className="border rounded p-2"
            >
              <option value="text">{t('text')}</option>
              <option value="number">{t('number')}</option>
              <option value="email">{t('email')}</option>
            </select>
            <Button onClick={addField}>{t('addField')}</Button>
          </div>
          <div className="space-y-2">
            {fields.map((field, index) => (
              <div key={index} className="flex justify-between items-center">
                <span>{field.label}</span>
                <span>{field.type}</span>
              </div>
            ))}
          </div>
          <Button onClick={handleComplete} disabled={fields.length < 3}>
            {t('completeForm')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}