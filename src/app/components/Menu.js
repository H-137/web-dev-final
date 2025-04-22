"use client";

import React, { useState, useEffect, useRef } from "react";
import Select from "react-select";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";

function Menu({
  onClose,
  onAddLocation,
  initialCoordinates,
  onRequestMapClick,
}) {
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

  const amenitiesOptions = [
    { value: "Water Fountain", label: "Water Fountain" },
    { value: "Quiet Zone", label: "Quiet Zone" },
    { value: "Study Rooms", label: "Study Rooms" },
    { value: "Projector", label: "Projector" },
    { value: "Classrooms", label: "Classrooms" },
    { value: "Historical Site", label: "Historical Site" },
    { value: "Conference Rooms", label: "Conference Rooms" },
    { value: "Cafeteria Nearby", label: "Cafeteria Nearby" },
    { value: "Desks", label: "Desks" },
    { value: "Tables", label: "Tables" },
  ];

  const [formData, setFormData] = useState({
    name: "",
    coordinates: "",
    description: "",
    noiseLevel: "",
    seating: [],
    rating: 0,
    reviewText: "",
    amenities: [],
  });

  const [hoverRating, setHoverRating] = useState(0);

  useEffect(() => {
    if (initialCoordinates) {
      setFormData((prev) => ({
        ...prev,
        coordinates: `${initialCoordinates[0].toFixed(2)}, ${initialCoordinates[1].toFixed(2)}`,
      }));
    }
  }, [initialCoordinates]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleMultiSelectChange = (field, selectedOptions) => {
    setFormData((prev) => ({
      ...prev,
      [field]: selectedOptions ? selectedOptions.map((item) => item.value) : [],
    }));
  };

  const handlePickOnMap = () => {
    onClose();
    setTimeout(() => {
      onRequestMapClick();
    }, 0);
  };

  // Star Rating Component for Menu
  const StarRating = () => {
    const starRefs = useRef([]);

    // Handle hover on star
    const handleStarHover = (index, event) => {
      const starWidth = event.currentTarget.offsetWidth;
      const starLeft = event.currentTarget.getBoundingClientRect().left;
      const mouseX = event.clientX;
      const position = mouseX - starLeft;

      // If mouse is on the left half of the star
      if (position < starWidth / 2) {
        setHoverRating(index + 0.5);
      } else {
        setHoverRating(index + 1);
      }
    };

    // Handle click on star
    const handleStarClick = (index, event) => {
      const starWidth = event.currentTarget.offsetWidth;
      const starLeft = event.currentTarget.getBoundingClientRect().left;
      const mouseX = event.clientX;
      const position = mouseX - starLeft;

      // If click is on the left half of the star
      if (position < starWidth / 2) {
        setFormData((prev) => ({ ...prev, rating: index + 0.5 }));
      } else {
        setFormData((prev) => ({ ...prev, rating: index + 1 }));
      }
    };

    // Create stars array with refs
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <div
          key={i}
          ref={(el) => (starRefs.current[i] = el)}
          className="cursor-pointer relative"
          onMouseMove={(e) => handleStarHover(i, e)}
          onMouseLeave={() => setHoverRating(0)}
          onClick={(e) => handleStarClick(i, e)}
        >
          <FaRegStar className="text-gray-300 text-2xl" />

          {/* Overlay full or half star based on hover/selected state */}
          {(hoverRating || formData.rating) > i && (
            <div
              className="absolute top-0 left-0 overflow-hidden"
              style={{
                width:
                  (hoverRating || formData.rating) >= i + 1 ? "100%" : "50%",
              }}
            >
              <FaStar className="text-yellow-500 text-2xl" />
            </div>
          )}
        </div>
      );
    }

    return <div className="flex space-x-2">{stars}</div>;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (formData.rating === 0) {
      alert("Please provide a rating for this location.");
      return;
    }

    if (!formData.reviewText.trim()) {
      alert("Please provide a review for this location.");
      return;
    }

    const coordsArray = formData.coordinates
      .split(",")
      .map((str) => parseFloat(str.trim()))
      .filter((num) => !isNaN(num));

    if (coordsArray.length !== 2) {
      alert("Please enter valid coordinates in the format: -7922600,5211350");
      return;
    }

    // Create initial review from the creator's rating and review text
    const initialReview = {
      id: `rev-initial-${Date.now()}`,
      reviewText: formData.reviewText,
      rating: formData.rating,
      locationName: formData.name,
      date: new Date().toISOString(),
      isFeatured: false,
    };

    const newLocation = {
      id: Date.now(),
      name: formData.name,
      coordinates: coordsArray,
      status: "inactive",
      description: formData.description,
      otherData: `Additional info about ${formData.name}.`,
      location: "Boston College",
      image: "",
      amenities: formData.amenities.map((name) => ({ name })),
      noiseLevel: formData.noiseLevel,
      seating: formData.seating.join(", "),
      // Store creator's rating as initialRating to preserve it
      initialRating: formData.rating,
      // Set generalRating to be the same initially (will be recalculated later when reviews are added)
      generalRating: Math.round(formData.rating * 20), // Convert 5-star to 100-scale
      reviews: [initialReview],
    };

    try {
      onAddLocation(newLocation);

      // Save both the location and the initial review
      const locationResponse = await fetch("/api/locations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newLocation),
      });

      const reviewResponse = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify([initialReview]),
      });

      const locationResult = await locationResponse.json();
      const reviewResult = await reviewResponse.json();

      console.log("Location saved to DB:", locationResult);
      console.log("Initial review saved to DB:", reviewResult);

      onClose();
    } catch (error) {
      console.error("Failed to save location:", error);
      alert("Error saving location to server.");
    }
  };

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

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-gray-500/30 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-lg bg-white dark:bg-black text-black dark:text-white p-4 md:p-6 rounded-lg shadow-lg overflow-y-auto max-h-[90vh] z-10">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl md:text-2xl font-bold mb-0">Add Location</h2>
          <button
            onClick={onClose}
            className="text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#111111] transition duration-200 ease-in-out mb-1 p-1 rounded-md"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-black dark:text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
  
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input name="name" placeholder="Name" value={formData.name} onChange={handleChange} required className="border p-2 rounded dark:bg-[#1a1a1a] dark:border-[#333] dark:text-white" />
  
          <div className="flex flex-col sm:flex-row gap-2">
            <input name="coordinates" placeholder="Coordinates" value={formData.coordinates} onChange={handleChange} className="border p-2 rounded w-full dark:bg-[#1a1a1a] dark:border-[#333] dark:text-white" readOnly />
            <button
              type="button"
              onClick={handlePickOnMap}
              className="bg-[#98002E] text-white px-3 py-1 rounded hover:bg-[#7a0025] whitespace-nowrap"
            >
              Pick from Map
            </button>
          </div>
  
          <input name="description" placeholder="Description" value={formData.description} onChange={handleChange} className="border p-2 rounded dark:bg-[#1a1a1a] dark:border-[#333] dark:text-white" />
  
          <div className="mb-2">
            <label className="block text-sm font-medium mb-1">Your Rating: {formData.rating > 0 ? formData.rating.toFixed(1) : ""}</label>
            <StarRating />
          </div>
  
          <div className="mb-2">
            <label className="block text-sm font-medium mb-1">Your Review</label>
            <textarea
              name="reviewText"
              value={formData.reviewText}
              onChange={handleChange}
              placeholder="Write your initial review for this location..."
              className="w-full p-2 border border-gray-300 dark:border-[#333] dark:bg-[#1a1a1a] dark:text-white rounded-md resize-none"
              rows={3}
              required
            />
          </div>
  
          {/* Amenities Select */}
          <div className="mb-2">
            <label className="block text-sm font-medium mb-1">Amenities</label>
            <Select
              isMulti
              options={amenitiesOptions}
              value={amenitiesOptions.filter(option => formData.amenities.includes(option.value))}
              onChange={(selected) => handleMultiSelectChange('amenities', selected)}
              className="text-sm"
              classNamePrefix="react-select"
              placeholder="Select amenities..."
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
  
          {/* Noise Level Select */}
          <div className="mb-2">
            <label className="block text-sm font-medium mb-1">Noise Level</label>
            <Select
              options={noiseLevelOptions}
              value={noiseLevelOptions.find(option => option.value === formData.noiseLevel)}
              onChange={(selected) => setFormData(prev => ({ ...prev, noiseLevel: selected ? selected.value : '' }))}
              className="text-sm"
              classNamePrefix="react-select"
              placeholder="Select noise level..."
              isClearable
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
  
          {/* Seating Type Select */}
          <div className="mb-2">
            <label className="block text-sm font-medium mb-1">Seating Type</label>
            <Select
              isMulti
              options={seatingOptions}
              value={seatingOptions.filter(option => formData.seating.includes(option.value))}
              onChange={(selected) => handleMultiSelectChange('seating', selected)}
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
  
          <button 
            type="submit" 
            className="bg-[#98002E] text-white px-4 py-2 rounded hover:bg-[#7a0025] mt-2"
            disabled={formData.rating === 0 || !formData.reviewText.trim()}
          >
            Add
          </button>
        </form>
      </div>
    </div>
  );  
}

export default Menu;
