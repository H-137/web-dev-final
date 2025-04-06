import React from "react";

const FilterPanel = ({ filters, setFilters }) => {
  const amenitiesList = [
    "Water Fountain",
    "Quiet Zone",
    "Study Rooms",
    "Projector",
    "Classrooms",
    "Historical Site",
    "Conference Rooms",
    "Cafeteria Nearby",
    "Whiteboards",
  ];

  const noiseLevels = ["Silent", "Quiet", "Moderate", "Loud"];
  const seatingOptions = ["Desk Chairs", "Cushioned Chairs", "Couches"];

  const handleAmenityToggle = (amenity) => {
    const updatedAmenities = filters.amenities.includes(amenity)
      ? filters.amenities.filter((a) => a !== amenity)
      : [...filters.amenities, amenity];
    setFilters({ ...filters, amenities: updatedAmenities });
  };

  const handleNoiseLevelToggle = (level) => {
    const updatedNoiseLevels = filters.noiseLevels.includes(level)
      ? filters.noiseLevels.filter((l) => l !== level)
      : [...filters.noiseLevels, level];
    setFilters({ ...filters, noiseLevels: updatedNoiseLevels });
  };

  const handleSeatingToggle = (option) => {
    const updatedSeating = filters.seating.includes(option)
      ? filters.seating.filter((s) => s !== option)
      : [...filters.seating, option];
    setFilters({ ...filters, seating: updatedSeating });
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

      <div className="mb-4">
        <h3 className="text-sm font-medium mb-2">Noise Level</h3>
        <div className="space-y-2">
          {noiseLevels.map((level) => (
            <label key={level} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={filters.noiseLevels.includes(level)}
                onChange={() => handleNoiseLevelToggle(level)}
                className="rounded text-blue-500"
              />
              <span className="text-sm">{level}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <h3 className="text-sm font-medium mb-2">Seating Availability</h3>
        <div className="space-y-2">
          {seatingOptions.map((option) => (
            <label key={option} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={filters.seating.includes(option)}
                onChange={() => handleSeatingToggle(option)}
                className="rounded text-blue-500"
              />
              <span className="text-sm capitalize">{option}</span>
            </label>
          ))}
        </div>
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