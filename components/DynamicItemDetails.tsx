import { FC } from "react";

import { useAppContext } from '../context/AppContext';

interface DynamicItemDetailsProps {
  item: Item; // Adjust type if needed
}

const DynamicItemDetails: FC<DynamicItemDetailsProps> = ({ item}) => {
    // Extract item details
    const { ad_info, general_info, photo_upload } = item.details;
    const { t } = useAppContext();

    return (
        <div className="grid grid-cols-1 gap-4">
          {/* ad_info Section */}
          <div className="border-b border-gray-200 pb-2">
            <label className="font-bold">{t('ad_info.title_label')}:</label>
            <p>{ad_info.title || t('common.n_a')}</p>
          </div>
          <div className="border-b border-gray-200 pb-2">
            <label className="font-bold">{t('ad_info.description_label')}:</label>
            <p>{ad_info.description || t('common.n_a')}</p>
          </div>
    
          {/* general_info Section */}
          <div className="border-b border-gray-200 pb-2">
            <label className="font-bold">{t('general_info.make_label')}:</label>
            <p>{general_info.make || t('common.n_a')}</p>
          </div>
          <div className="border-b border-gray-200 pb-2">
            <label className="font-bold">{t('general_info.year_label')}:</label>
            <p>{general_info.year || t('common.n_a')}</p>
          </div>
          <div className="border-b border-gray-200 pb-2">
            <label className="font-bold">{t('general_info.color_label')}:</label>
            <p>{general_info.color || t('common.n_a')}</p>
          </div>
          <div className="border-b border-gray-200 pb-2">
            <label className="font-bold">{t('general_info.model_label')}:</label>
            <p>{general_info.model || t('common.n_a')}</p>
          </div>
          <div className="border-b border-gray-200 pb-2">
            <label className="font-bold">{t('general_info.price_label')}:</label>
            <p>{general_info.price !== undefined ? general_info.price : t('common.n_a')}</p>
          </div>
    
          {/* photo_upload Section */}
          {photo_upload.photo ? (
            <div className="border-b border-gray-200 pb-2 rounded-2xl">
              <img src={photo_upload.photo} alt={t('photo_upload.photo_alt')} className="w-full h-auto" />
            </div>
          ) : (
            <div className="border-b border-gray-200 pb-2">
              <label className="font-bold">{t('photo_upload.photo_label')}:</label>
              <p>{t('common.n_a')}</p>
            </div>
          )}
        </div>
      );
  };

export default DynamicItemDetails;