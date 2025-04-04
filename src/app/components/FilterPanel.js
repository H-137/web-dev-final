import React from "react";

const FilterPanel = ({ filters, setFilters }) => {
  const amenitiesList = [
    "WiFi",
    "Quiet Zone",
    "Study Rooms",
    "Projector",
    "Classrooms",
    "Historical Site",
    "Conference Rooms",
    "Cafeteria Nearby",
    "Whiteboards",
  ];

  const handleAmenityToggle = (amenity) => {
    const updatedAmenities = filters.amenities.includes(amenity)
      ? filters.amenities.filter((a) => a !== amenity)
      : [...filters.amenities, amenity];

    setFilters({ ...filters, amenities: updatedAmenities });
  };

  return (
    <div className="absolute top-4 left-16 bg-white p-4 rounded-lg shadow-lg z-10 w-64 text-black">
      <h2 className="text-lg font-bold mb-4">Filter Study Spaces</h2>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">
          Minimum Rating: {filters.minRating}%
        </label>
        <input
          type="range"
          min="0"
          max="100"
          value={filters.minRating}
          onChange={(e) =>
            setFilters({ ...filters, minRating: parseInt(e.target.value) })
          }
          className="
            w-full h-2 rounded-lg 
            appearance-none bg-gray-300 
            cursor-pointer transition-all 
            accent-blue-500
            [&::-webkit-slider-thumb]:appearance-none 
            [&::-webkit-slider-thumb]:w-4 
            [&::-webkit-slider-thumb]:h-4 
            [&::-webkit-slider-thumb]:bg-[#98002E] 
            [&::-webkit-slider-thumb]:rounded-full 
            [&::-webkit-slider-thumb]:cursor-pointer
            [&::-moz-range-thumb]:w-4 
            [&::-moz-range-thumb]:h-4 
            [&::-moz-range-thumb]:bg-blue-500 
            [&::-moz-range-thumb]:rounded-full 
            [&::-moz-range-thumb]:cursor-pointer
          "
        />
      </div>

      <div>
        <h3 className="text-sm font-medium mb-2">Amenities</h3>
        <div className="space-y-2">
          {amenitiesList.map((amenity) => (
            <label key={amenity} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={filters.amenities.includes(amenity)}
                onChange={() => handleAmenityToggle(amenity)}
                className="rounded text-blue-500"
              />
              <span className="text-sm">{amenity}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;
