// components\DynamicItemForm.tsx                           
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAppContext } from "../context/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import FormFooter from "../components/ui/FormFooter";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../components/ui/card";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import QRCode from "react-qr-code";
import { Dropdown } from "./ui/dropdown";

interface FormField {
  name: string;
  label: string;
  type: string;
  value: any;
  disabled_option?: string;
  disable_checkbox?: boolean;
  placeholder: string;
  options?: string[];
}

interface FormSection {
  title: string;
  fields: FormField[];
}

export interface DynamicItemFormProps {
  itemType: string;
}

const DynamicItemForm: React.FC<DynamicItemFormProps> = ({ itemType }) => {
  const { t, state } = useAppContext();
  const [formSections, setFormSections] = useState<FormSection[]>([]);
  const [loading, setLoading] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [isAgreementChecked, setIsAgreementChecked] = useState(false);
  const [agreementText, setAgreementText] = useState<string>("");
  const [gameType, setGameType] = useState<string | null>(null); // Add game type state

  const fetchFormFields = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("item_types")
        .select("fields")
        .eq("type", itemType)
        .single();

      if (error) throw error;

      if (!data || !data.fields || typeof data.fields !== "object") {
        throw new Error("Invalid fields data structure");
      }

      const sections: FormSection[] = Object.keys(data.fields).map(
        (sectionKey) => {
          const section = data.fields[sectionKey];
          const sectionTitle = sectionKey;

          const fields = Array.isArray(section.fields)
            ? section.fields.map((field: any) => ({
                name: field.name,
                label: t(field.label || "defaultLabel"),
                type: field.type === "file" ? "text" : field.type,
                value: field.value || "",
                disabled_option: field.disabled_option,
                disable_checkbox: field.disable_checkbox,
                placeholder: field.placeholder || "",
                options: field.options || [],
              }))
            : [];

          return { title: sectionTitle, fields };
        }
      );

      setFormSections(sections);

      setAgreementText(
        data.fields.agreement?.fields[0].label || t("agreeToTerms")
      );
    } catch (error) {
      console.error("Error fetching form fields:", error);
    } finally {
      setLoading(false);
    }
  }, [itemType, t]);

  useEffect(() => {
    fetchFormFields();
  }, [fetchFormFields]);

  const handleInputChange = (
    sectionIndex: number,
    fieldIndex: number,
    value: any
  ) => {
    const updatedSections = [...formSections];
    updatedSections[sectionIndex].fields[fieldIndex].value = value;
    setFormSections(updatedSections);
  };

  const handleCheckboxChange = (
    sectionIndex: number,
    fieldIndex: number,
    checked: boolean
  ) => {
    const updatedSections = [...formSections];
    updatedSections[sectionIndex].fields[fieldIndex].value = checked
      ? updatedSections[sectionIndex].fields[fieldIndex].disabled_option || ""
      : "";
    setFormSections(updatedSections);
  };

  const handleAgreementCheckboxChange = (checked: boolean) => {
    setIsAgreementChecked(checked);
  };

  const handleGameTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setGameType(e.target.value); // Set the selected game type
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const itemData = formSections.reduce<{ [key: string]: any }>(
        (acc, section) => {
          const sectionKey = section.title
            .replace(/\s+/g, "_")
            .toLowerCase();
          acc[sectionKey] = section.fields.reduce<{ [key: string]: any }>(
            (fieldAcc, field) => {
              fieldAcc[field.name] = field.value;
              return fieldAcc;
            },
            {}
          );
          return acc;
        },
        {}
      );

      const { error } = await supabase.from("items").insert({
        item_type: itemType,
        details: itemData,
        creator_ref_code: state?.user?.ref_code,
        title:
          itemData.ad_info?.title ||
          itemData.lesson_info?.title ||
          itemData.game_info?.title ||
          "Untitled",
        game_type: gameType, // Include the selected game type in submission
      });

      if (error) throw error;

      alert(t("itemAddedSuccessfully"));
    } catch (error) {
      console.error("Error adding item:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateQrCode = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("items")
        .insert({
          item_type: itemType,
          details: {},
          creator_ref_code: "anon",
          title: "Temp",
        }) // Save draft
        .select("id")
        .single();

      if (error) throw error;

      const itemId = data?.id;
      if (itemId) {
        const qrUrl = `https://t.me/oneSitePlsBot/vip?ref_item=${itemId}`;
        setQrCodeUrl(qrUrl);
      }
    } catch (error) {
      console.error("Error generating QR code:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  // Utility function to convert underscored keys to camelCase
  const toCamelCase = (str: string) => {
    return str.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("dynamicForm")}</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-4">
          {formSections.map((section, sectionIndex) => (
            <div key={sectionIndex}>
              <h3 className="text-lg font-bold text-gray-800 mb-2">
                {t(`${toCamelCase(section.title)}.title`)}
              </h3>
              {section.fields.map((field, fieldIndex) => (
                <div key={field.name} className="mb-4">
                  <label className="block text-gray-700">
                    {t(toCamelCase(field.label))}
                  </label>
                  {field.type === "dropdown" ? (
                    <Dropdown
                      value={field.value}
                      onChange={(e) =>
                        handleInputChange(
                          sectionIndex,
                          fieldIndex,
                          e.target.value
                        )
                      }
                      className="border rounded p-2"
                    >
                      <option value="" disabled>
                        {field.placeholder}
                      </option>
                      {field.options?.map((option, idx) => (
                        <option key={idx} value={option}>
                          {option}
                        </option>
                      ))}
                    </Dropdown>
                  ) : field.disable_checkbox ? (
                    <div className="flex items-center space-x-4">
                      <Input
                        type={field.type}
                        value={field.value}
                        placeholder={field.placeholder}
                        onChange={(e) =>
                          handleInputChange(
                            sectionIndex,
                            fieldIndex,
                            e.target.value
                          )
                        }
                        disabled={field.value === field.disabled_option}
                      />
                      <Checkbox
                        checked={field.value === field.disabled_option}
                        onCheckedChange={(checked) =>
                          handleCheckboxChange(
                            sectionIndex,
                            fieldIndex,
                            !!checked
                          )
                        }
                      />
                      <p>{t("disableOptionLabel")}</p>
                    </div>
                  ) : field.type != "checkbox" ? (   
                    <Input
                      type={field.type}
                      value={field.value}
                      onChange={(e) =>
                        handleInputChange(
                          sectionIndex,
                          fieldIndex,
                          e.target.value
                        )
                      }
                      placeholder={field.placeholder}
                    />
                  ):(
                    <div/>
                  )}
                </div>
              ))}
            </div>
          ))}

          {/* Agreement Section <p className="text-gray-700 mb-4">{agreementText}</p>*/}
                                        
                                                                             
           
          {agreementText && (
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">
                {t("agreementSectionTitle")}
              </h3>
              
              <div className="mb-4 flex items-center">
                <Checkbox
                  checked={isAgreementChecked}
                  onCheckedChange={handleAgreementCheckboxChange}
                /><FormFooter />
              </div>
            </div>
          )}

          <Button onClick={handleSubmit}>{t("submitForm")}</Button>

          <Button
            variant="secondary"
            onClick={handleGenerateQrCode}
            disabled={!isAgreementChecked}
          >
            {t("generateQrCode")}
          </Button>

          {qrCodeUrl && <QRCode value={qrCodeUrl} />}
        </form>
      </CardContent>
    </Card>
  );
};

export default DynamicItemForm;
