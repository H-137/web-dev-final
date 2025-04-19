import React from "react";
import Select from 'react-select';

const FilterPanel = ({ filters, setFilters }) => {
  // Options for each filter category
  const noiseLevelOptions = [
    { value: "Silent", label: "Silent" },
    { value: "Quiet", label: "Quiet" },
    { value: "Moderate", label: "Moderate" },
    { value: "Loud", label: "Loud" }
  ];

  const seatingOptions = [
    { value: "Desk Chairs", label: "Desk Chairs" },
    { value: "Cushioned Chairs", label: "Cushioned Chairs" },
    { value: "Couches", label: "Couches" }
  ];

  const amenitiesOptions = [
    { value: "Water Fountain", label: "Water Fountain" },
    { value: "Quiet Zone", label: "Quiet Zone" },
    { value: "Study Rooms", label: "Study Rooms" },
    { value: "Projector", label: "Projector" },
    { value: "Classrooms", label: "Classrooms" },
    { value: "Historical Site", label: "Historical Site" },
    { value: "Conference Rooms", label: "Conference Rooms" },
    { value: "Cafeteria Nearby", label: "Cafeteria Nearby" },
    { value: "Whiteboards", label: "Whiteboards" }
  ];

  const handleAmenityChange = (amenityValue) => {
    setFilters(prevFilters => {
      const newAmenities = prevFilters.amenities.includes(amenityValue)
        ? prevFilters.amenities.filter(a => a !== amenityValue)
        : [...prevFilters.amenities, amenityValue];
      
      return {
        ...prevFilters,
        amenities: newAmenities
      };
    });
  };

  const handleMultiSelectChange = (field, selectedOptions) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      [field]: selectedOptions.map(item => item.value)
    }));
  };

  const handleClearAllFilters = () => {
    setFilters({
      minRating: 0,
      noiseLevels: [],
      seating: [],
      amenities: []
    });
  };

  return (
    <div className="absolute top-4 left-32 bg-white p-4 rounded-lg shadow-lg z-10 w-64 text-black">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">Filter Study Spaces</h2>
        <button 
          onClick={handleClearAllFilters}
          className="text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-1 px-2 rounded transition-colors duration-200"
        >
          Clear All
        </button>
      </div>

      {/* Rating Slider */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">
          Minimum Rating: {filters.minRating}%
        </label>
        <input
          type="range"
          min="0"
          max="100"
          value={filters.minRating}
          onChange={(e) => setFilters(prev => ({
            ...prev,
            minRating: parseInt(e.target.value)
          }))}
          className="w-full h-2 rounded-lg appearance-none bg-gray-300 cursor-pointer accent-[#98002E]"
        />
      </div>

      {/* Noise Level Multiselect */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Noise Level</label>
        <Select
          isMulti
          options={noiseLevelOptions}
          value={filters.noiseLevels.map(level => ({ value: level, label: level }))}
          onChange={(selected) => handleMultiSelectChange('noiseLevels', selected)}
          className="text-sm"
          classNamePrefix="react-select"
          placeholder="Select noise levels..."
        />
      </div>

      {/* Seating Multiselect */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Seating Type</label>
        <Select
          isMulti
          options={seatingOptions}
          value={filters.seating.map(seat => ({ value: seat, label: seat }))}
          onChange={(selected) => handleMultiSelectChange('seating', selected)}
          className="text-sm"
          classNamePrefix="react-select"
          placeholder="Select seating types..."
        />
      </div>

      {/* Amenities Checkboxes */}
      <div className="mb-2">
        <label className="block text-sm font-medium mb-1">Amenities</label>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {amenitiesOptions.map((amenity) => (
            <div key={amenity.value} className="flex items-center">
              <input
                type="checkbox"
                id={`amenity-${amenity.value}`}
                checked={filters.amenities.includes(amenity.value)}
                onChange={() => handleAmenityChange(amenity.value)}
                className="h-4 w-4 rounded border-gray-300 text-[#98002E] focus:ring-[#98002E]"
              />
              <label htmlFor={`amenity-${amenity.value}`} className="ml-2 text-sm">
                {amenity.label}
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;
