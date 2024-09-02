import { FC } from "react";

interface DynamicItemDetailsProps {
  item: Item; // Adjust type if needed
}

const DynamicItemDetails: FC<DynamicItemDetailsProps> = ({ item}) => {
    // Extract item details
    const { ad_info, general_info, photo_upload } = item.details;

    return (
        <div className="grid grid-cols-1 gap-4">
          {/* ad_info Section */}
          <div className="border-b border-gray-200 pb-2">
            <label className="font-bold">Title:</label>
            <p>{ad_info.title || 'N/A'}</p>
          </div>
          <div className="border-b border-gray-200 pb-2">
            <label className="font-bold">Description:</label>
            <p>{ad_info.description || 'N/A'}</p>
          </div>
    
          {/* general_info Section */}
          <div className="border-b border-gray-200 pb-2">
            <label className="font-bold">Make:</label>
            <p>{general_info.make || 'N/A'}</p>
          </div>
          <div className="border-b border-gray-200 pb-2">
            <label className="font-bold">Year:</label>
            <p>{general_info.year || 'N/A'}</p>
          </div>
          <div className="border-b border-gray-200 pb-2">
            <label className="font-bold">Color:</label>
            <p>{general_info.color || 'N/A'}</p>
          </div>
          <div className="border-b border-gray-200 pb-2">
            <label className="font-bold">Model:</label>
            <p>{general_info.model || 'N/A'}</p>
          </div>
          <div className="border-b border-gray-200 pb-2">
            <label className="font-bold">Price:</label>
            <p>{general_info.price !== undefined ? general_info.price : 'N/A'}</p>
          </div>
    
          {/* photo_upload Section */}
          {photo_upload.photo ? (
            <div className="border-b border-gray-200 pb-2 rounded-2xl">
              {/*<label className="font-bold">Photo:</label>*/}
              <img src={photo_upload.photo} alt="Item Photo" className="w-full h-auto" />
            </div>
          ) : (
            <div className="border-b border-gray-200 pb-2">
              <label className="font-bold">Photo:</label>
              <p>N/A</p>
            </div>
          )}
        </div>
      );
  };

export default DynamicItemDetails;