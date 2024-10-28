import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { useAppContext } from "../context/AppContext";
import Image from 'next/image';
export interface DynamicItemDetailsProps {
  itemType: string;
  itemDetails: any;
}

const DynamicItemDetails: React.FC<DynamicItemDetailsProps> = ({
  itemType,
  itemDetails,
}) => {
  const { t } = useAppContext();
  const unparsedFields: Record<string, any> = {};

  // Extract item details while excluding the agreement section
  const { ad_info, lesson_info, general_info, pricing, photo_upload, agreement, ...otherDetails } = itemDetails;

  if (!itemDetails) {
    return <div>{t("noItemDetails")}</div>;
  }

  const renderNestedDetails = (data: Record<string, any>, level: number = 0) => {
    return Object.entries(data).map(([key, value]) => {
        // Determine if the value is empty or not
        const isEmpty = value === undefined || value === null || value === '';

        if (isEmpty) {
            // If value is empty, skip rendering
            return null;
        }

        return (
            <div key={key} className={`mb-2 ml-${level * 4}`}>
                <h4 className="text-md font-bold text-gray-800">{t(toCamelCase(key))}</h4>
                {typeof value === "object" && value !== null ? (
                    renderNestedDetails(value, level + 1)
                ) : (
                    <p className={`text-gray-700 ml-${level * 2}`}>
                        {value}
                    </p>
                )}
            </div>
        );
    });
};

  const renderDetails = () => {
    return Object.entries(otherDetails).map(([key, value]) => {
      if (typeof value === "string" || typeof value === "number") {
        return (
          <div key={key} className="mb-4">
            <h3 className="text-lg font-bold text-gray-800">{t(toCamelCase(key))}</h3>
            <p className="text-gray-700">{value}</p>
          </div>
        );
      } else {
        unparsedFields[key] = value;
        return null;
      }
    });
  };
    
  // Utility function to convert underscored keys to camelCase
const toCamelCase = (str:string) => {
    return str.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t(itemType)}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4">
          {ad_info && (
            <div className="mt-4">
              <div className="border-b border-gray-200 pb-2">
                <label className="font-bold">{t(toCamelCase('ad_info.title_label'))}:</label>
                <p>{ad_info.title || t('common.n_a')}</p>
              </div>
              <div className="border-b border-gray-200 pb-2">
                <label className="font-bold">{t(toCamelCase('ad_info.description_label'))}:</label>
                <p>{ad_info.description || t('common.n_a')}</p>
              </div>
            </div>
          )}

          {lesson_info && (
            <div className="mt-4">
              <div className="border-b border-gray-200 pb-2">
                <label className="font-bold">{t(toCamelCase('lesson_info.title_label'))}:</label>
                <p>{lesson_info.title || t('common.n_a')}</p>
              </div>
              <div className="border-b border-gray-200 pb-2">
                <label className="font-bold">{t(toCamelCase('lesson_info.description_label'))}:</label>
                <p>{lesson_info.description || t('common.n_a')}</p>
              </div>
            </div>
          )}

          {general_info && (
            <div className="mt-4">
              <h3 className="text-lg font-bold text-gray-800">{t(toCamelCase('general_info.title'))}</h3>
              {renderNestedDetails(general_info)}
            </div>
          )}

          {pricing && (
            <div className="mt-4">
              <h3 className="text-lg font-bold text-gray-800">{t(toCamelCase('pricing.title'))}</h3>
              {renderNestedDetails(pricing)}
            </div>
          )}

          {renderDetails()}

          {photo_upload && photo_upload.photo ? (
            <div className="border-b border-gray-200 pb-2 rounded-2xl">
              <Image 
                src={photo_upload.photo} 
                alt={t(toCamelCase('photo_upload.photo_alt'))} 
                width={500} 
                height={300} 
                className=" object-cover"
              />
            </div>
          ) : (
            <div className="border-b border-gray-200 pb-2">
              <label className="font-bold">{t(toCamelCase('photo_upload.photo_label'))}:</label>
              <p>{t('common.n_a')}</p>
            </div>
          )}
        </div>

        {Object.keys(unparsedFields).length > 0 && (
          <div className="mt-4">
            <h3 className="text-lg font-bold text-gray-800">{t("additionalInformation")}</h3>
            {Object.entries(unparsedFields).map(([key, value]) => (
              <div key={key} className="mb-4">
                <h3 className="text-lg font-bold text-gray-800">{t(toCamelCase(key))}</h3>
                <p className="text-gray-700">{JSON.stringify(value)}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DynamicItemDetails;
