import React from "react";

const MapOverlay = ({ featureData, onClose }) => {
  if (!featureData) return null; // If no feature data is selected, don't render the overlay
// make text black
  return (
    <div className="fixed top-0 right-0 w-1/3 bg-white p-6 rounded-l-lg shadow-lg overflow-y-auto z-10 m-5 text-black">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold">{featureData.name}</h3>
        <button 
          onClick={onClose} 
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
        >
          X
        </button>
      </div>
      <div className="space-y-4 text-sm">
        <p><strong>Description:</strong> {featureData.description}</p>
        <p><strong>Other Info:</strong> {featureData.otherData}</p>
      </div>
    </div>
  );
};

export default MapOverlay;
