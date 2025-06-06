import { useEffect, useState } from "react";
import Select from "react-select";
import Slider from "@mui/material/Slider";

const FilterPanel = ({ filters, setFilters }) => {
  // Options for each filter category
  const noiseLevelOptions = [
    { value: "Silent", label: "Silent" },
    { value: "Quiet", label: "Quiet" },
    { value: "Moderate", label: "Moderate" },
    { value: "Loud", label: "Loud" },
  ];

  const seatingOptions = [
    { value: "Desk Chairs", label: "Desk Chairs" },
    { value: "Cushioned Chairs", label: "Cushioned Chairs" },
    { value: "Couches", label: "Couches" },
    { value: "Booths", label: "Booths" },
  ];

  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    setIsDark(document.documentElement.classList.contains("dark"));
    return () => observer.disconnect();
  }, []);

  const amenitiesOptions = [
    { value: "Water Fountain", label: "Water Fountain" },
    { value: "Quiet Zone", label: "Quiet Zone" },
    { value: "Study Rooms", label: "Study Rooms" },
    { value: "Projector", label: "Projector" },
    { value: "Classrooms", label: "Classrooms" },
    { value: "Historical Site", label: "Historical Site" },
    { value: "Conference Rooms", label: "Conference Rooms" },
    { value: "Cafeteria Nearby", label: "Cafeteria Nearby" },
    { value: "Whiteboards", label: "Whiteboards" },
    { value: "Desks", label: "Desks" },
    { value: "Tables", label: "Tables" },
  ];

  const handleAmenityChange = (amenityValue) => {
    setFilters((prevFilters) => {
      const newAmenities = prevFilters.amenities.includes(amenityValue)
        ? prevFilters.amenities.filter((a) => a !== amenityValue)
        : [...prevFilters.amenities, amenityValue];

      return {
        ...prevFilters,
        amenities: newAmenities,
      };
    });
  };

  const handleMultiSelectChange = (field, selectedOptions) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [field]: selectedOptions.map((item) => item.value),
    }));
  };

  const handleClearAllFilters = () => {
    setFilters({
      minRating: 0,
      noiseLevels: [],
      seating: [],
      amenities: [],
      occupancyRange: [1, 100], // Reset occupancy range
    });
  };

  // Handle occupancy slider change
  const handleOccupancyChange = (e, slider) => {
    const value = parseInt(e.target.value);
    setFilters((prevFilters) => {
      const newRange = [...prevFilters.occupancyRange];
      const index = slider === "min" ? 0 : 1;
      newRange[index] = value;

      // Ensure min doesn't exceed max and max doesn't go below min
      if (slider === "min" && value > newRange[1]) {
        newRange[1] = value;
      } else if (slider === "max" && value < newRange[0]) {
        newRange[0] = value;
      }

      return {
        ...prevFilters,
        occupancyRange: newRange,
      };
    });
  };

  return (
    <div className="fixed top-4 left-32 md:left-32 lg:left-32 bg-white dark:bg-black text-black dark:text-white p-4 rounded-lg shadow-lg z-10 w-60 md:w-64 max-h-[calc(100vh-2rem)] overflow-y-auto dark:border-[#333333] dark:border-2">
      <div className="flex justify-between items-center mb-4 sticky top-0 bg-white dark:bg-black pt-1 pb-2 z-10">
        <h2 className="text-lg font-bold">Filter Study Spaces</h2>
        <button
          onClick={handleClearAllFilters}
          className="text-sm bg-gray-200 dark:bg-[#1a1a1a] hover:bg-gray-300 dark:hover:bg-[#333333] text-gray-700 dark:text-white font-medium py-1 px-2 rounded transition-colors duration-200"
        >
          Clear All
        </button>
      </div>

      {/* Rating Slider */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">
          Minimum Rating: {filters.minRating}%
        </label>
        <Slider
          value={filters.minRating}
          onChange={(e, newValue) =>
            setFilters((prev) => ({
              ...prev,
              minRating: newValue,
            }))
          }
          valueLabelDisplay="auto"
          min={0}
          max={100}
          sx={{
            color: "#98002E",
            "& .MuiSlider-track": {
              backgroundColor: "#98002E",
            },
            "& .MuiSlider-thumb": {
              backgroundColor: "#98002E",
            },
          }}
        />
      </div>

      {/* Occupancy Range Sliders */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">
          Occupancy Range: {filters.occupancyRange[0]} -{" "}
          {filters.occupancyRange[1]} people
        </label>
        <Slider
          value={filters.occupancyRange}
          onChange={(e, newValue) =>
            setFilters((prev) => ({
              ...prev,
              occupancyRange: newValue,
            }))
          }
          valueLabelDisplay="auto"
          min={1}
          max={100}
          sx={{
            color: "#98002E",
            "& .MuiSlider-track": {
              backgroundColor: "#98002E",
            },
            "& .MuiSlider-thumb": {
              backgroundColor: "#98002E",
            },
          }}
        />
      </div>

      {/* Noise Level Multiselect */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Noise Level</label>
        <Select
          isMulti
          options={noiseLevelOptions}
          value={filters.noiseLevels.map((level) => ({
            value: level,
            label: level,
          }))}
          onChange={(selected) =>
            handleMultiSelectChange("noiseLevels", selected)
          }
          className="text-sm"
          classNamePrefix="react-select"
          placeholder="Select noise levels..."
          theme={(theme) => ({
            ...theme,
            colors: {
              ...theme.colors,
              primary: "#98002E",
              neutral0: isDark ? "#000000" : "#ffffff",
              neutral80: isDark ? "#ffffff" : "#000000",
              primary25: isDark ? "#111111" : "#f3f4f6",
              neutral20: isDark ? "#333333" : "#d1d5db",
            },
          })}
        />
      </div>

      {/* Seating Multiselect */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Seating Type</label>
        <Select
          isMulti
          options={seatingOptions}
          value={filters.seating.map((seat) => ({
            value: seat,
            label: seat,
          }))}
          onChange={(selected) => handleMultiSelectChange("seating", selected)}
          className="text-sm"
          classNamePrefix="react-select"
          placeholder="Select seating types..."
          theme={(theme) => ({
            ...theme,
            colors: {
              ...theme.colors,
              primary: "#98002E",
              neutral0: isDark ? "#000000" : "#ffffff",
              neutral80: isDark ? "#ffffff" : "#000000",
              primary25: isDark ? "#111111" : "#f3f4f6",
              neutral20: isDark ? "#333333" : "#d1d5db",
            },
          })}
        />
      </div>

      {/* Amenities Checkboxes */}
      <div className="mb-2">
        <label className="block text-sm font-medium mb-1">Amenities</label>
        <div className="space-y-2 max-h-44 overflow-y-auto rounded border border-gray-200 dark:border-[#333333] p-2">
          {amenitiesOptions.map((amenity) => (
            <div key={amenity.value} className="flex items-center">
              <input
                type="checkbox"
                id={`amenity-${amenity.value}`}
                checked={filters.amenities.includes(amenity.value)}
                onChange={() => handleAmenityChange(amenity.value)}
                className="h-4 w-4 rounded border-gray-300 dark:border-[#333333] dark:bg-[#1a1a1a] text-[#98002E] focus:ring-[#98002E] accent-[#98002E] dark:focus:ring-[#98002E] dark:checked:bg-[#98002E] dark:checked:border-[#98002E] hover:cursor-pointer"
              />
              <label
                htmlFor={`amenity-${amenity.value}`}
                className="ml-2 text-sm"
              >
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
