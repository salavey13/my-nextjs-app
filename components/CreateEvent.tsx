"use client";

import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useAppContext } from "../context/AppContext";
import { useGameProgression } from "@/hooks/useGameProgression";
import UnlockChoice from "@/components/UnlockChoice"; // Import the UnlockChoice component
import { toast } from '@/hooks/use-toast'

export default function CreateEvent() {
  const { state, dispatch, t } = useAppContext();
  const { progressStage } = useGameProgression();
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [titleRu, setTitleRu] = useState<string>('');
  const [descriptionRu, setDescriptionRu] = useState<string>('');
  const [educationalVideoUrl, setEducationalVideoUrl] = useState<string>('');
  const [expirationDate, setExpirationDate] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);
  const [showUnlockChoice, setShowUnlockChoice] = useState(false); // Added state for UnlockChoice
  const [sideHustles, setSideHustles] = useState<any[]>([]);
  const [showSideHustleModal, setShowSideHustleModal] = useState(false);

  const handleCreateEvent = async () => {
    if (title && description && titleRu && descriptionRu) {
      try {
        const { error } = await supabase
          .from('events')
          .insert([
            {
              title,
              description,
              title_ru: titleRu,
              description_ru: descriptionRu,
              educational_video_url: educationalVideoUrl,
              expired: false,
              expiration_date: expirationDate,
            },
          ]);

        if (error) throw error;

        setShowConfirmation(true);
        resetForm();

        const currentStage = state.user?.game_state?.stage || 0;
        if (currentStage === 4) {
          await progressStage(5, ['bets']);
          dispatch({
            type: 'UPDATE_GAME_STATE',
            payload: { stage: 5, unlockedComponents: [...(state?.user?.game_state.unlockedComponents || []), 'bets'] }
          });
          setShowUnlockChoice(true);
        }
      } catch (error) {
        console.error("Error creating event:", error);
      }
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setTitleRu('');
    setDescriptionRu('');
    setEducationalVideoUrl('');
    setExpirationDate(null);
  };


  const triggerSideHustleChoice = async () => {
    const currentStage = state.user?.game_state?.stage || 0;
    const { data, error } = await supabase
      .from('story_stages')
      .select('*')
      .eq('stage', currentStage)
      .neq('parentid', null);

    if (error) {
      console.error('Error fetching side hustles:', error);
    } else {
      setSideHustles(data || []);
      setShowSideHustleModal(true);
    }
  };

  const handleSideHustleChoice = async (sideHustle: any) => {
    setShowSideHustleModal(false);
    
    const updatedGameState = {
      ...state.user?.game_state,
      currentSideHustle: sideHustle.id,
    };

    dispatch({
      type: 'UPDATE_GAME_STATE',
      payload: updatedGameState,
    });

    const { error } = await supabase
      .from('users')
      .update({ game_state: updatedGameState })
      .eq('id', state.user?.id);

    if (error) {
      console.error('Error updating user game state:', error);
    } else {
      toast({
        title: t('sideHustleUnlocked'),
        description: sideHustle.storycontent,
      });
    }
  };

  return (
    <div className="w-full min-h-screen bg-muted/40 flex flex-col p-4 overflow-auto">
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>{t("createEvent")}</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            type="text"
            placeholder={t("eventTitle")}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mb-4"
          />
          <Input
            type="text"
            placeholder={t("eventDescription")}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mb-4"
          />
          <Input
            type="text"
            placeholder={t("eventTitleRu")}
            value={titleRu}
            onChange={(e) => setTitleRu(e.target.value)}
            className="mb-4"
          />
          <Input
            type="text"
            placeholder={t("eventDescriptionRu")}
            value={descriptionRu}
            onChange={(e) => setDescriptionRu(e.target.value)}
            className="mb-4"
          />
          <Input
            type="text"
            placeholder={t("educationalVideoUrl")}
            value={educationalVideoUrl}
            onChange={(e) => setEducationalVideoUrl(e.target.value)}
            className="mb-4"
          />
          <Input
            type="datetime-local"
            placeholder={t("expirationDate")}
            value={expirationDate || ''}
            onChange={(e) => setExpirationDate(e.target.value)}
            className="mb-4"
          />
          <Button onClick={handleCreateEvent} className="w-full">
            {t("createEvent")}
          </Button>
        </CardContent>
      </Card>

      {/* Modal for confirmation */}
      {showConfirmation && (
        <Dialog open={true} onOpenChange={() => setShowConfirmation(false)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("eventCreated")}</DialogTitle>
              <DialogDescription>{t("eventCreationSuccessMessage")}</DialogDescription>
            </DialogHeader>
            <Button onClick={() => setShowConfirmation(false)} className="w-full">
              {t("close")}
            </Button>
          </DialogContent>
        </Dialog>
      )}
      {showUnlockChoice && <UnlockChoice />} {/* Added UnlockChoice component */}
      <Dialog open={showSideHustleModal} onOpenChange={setShowSideHustleModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('chooseSideHustle')}</DialogTitle>
            <DialogDescription>{t('sideHustleDescription')}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            {sideHustles.map((sideHustle) => (
              <Card key={sideHustle.id}>
                <CardHeader>
                  <CardTitle>{sideHustle.activecomponent}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{sideHustle.storycontent}</p>
                  <p className="font-bold mt-2">{t('achievement')}: {sideHustle.achievement}</p>
                  <Button onClick={() => handleSideHustleChoice(sideHustle)}>
                    {t('choose')}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}