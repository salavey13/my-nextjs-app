"use client";

import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useAppContext } from "../context/AppContext";

export default function CreateEvent() {
  const { t, addDebugLog } = useAppContext();
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [titleRu, setTitleRu] = useState<string>('');
  const [descriptionRu, setDescriptionRu] = useState<string>('');
  const [educationalVideoUrl, setEducationalVideoUrl] = useState<string>('');
  const [expirationDate, setExpirationDate] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);

  const handleCreateEvent = async () => {
    if (title && description && titleRu && descriptionRu) {
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

      if (error) {
        console.error("Error creating event:", error);
        addDebugLog("Error creating event: " + error.message);
      } else {
        setShowConfirmation(true);
        addDebugLog("Event created successfully");
        resetForm();
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
    </div>
  );
}
