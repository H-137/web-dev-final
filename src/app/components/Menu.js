'use client';

import React, { useState, useEffect } from 'react';
import Select from 'react-select';

function Menu({ onClose, onAddLocation, initialCoordinates, onRequestMapClick }) {
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

  const [formData, setFormData] = useState({
    name: '',
    coordinates: '',
    description: '',
    noiseLevel: '',
    seating: [],
    generalRating: 50,
    amenities: []
  });

  useEffect(() => {
    if (initialCoordinates) {
      setFormData(prev => ({
        ...prev,
        coordinates: `${initialCoordinates[0].toFixed(2)}, ${initialCoordinates[1].toFixed(2)}`
      }));
    }
  }, [initialCoordinates]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleMultiSelectChange = (field, selectedOptions) => {
    setFormData(prev => ({
      ...prev,
      [field]: selectedOptions ? selectedOptions.map(item => item.value) : []
    }));
  };

  const handlePickOnMap = () => {
    onClose();
    setTimeout(() => {
      onRequestMapClick();
    }, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const coordsArray = formData.coordinates
      .split(',')
      .map(str => parseFloat(str.trim()))
      .filter(num => !isNaN(num));

    if (coordsArray.length !== 2) {
      alert("Please enter valid coordinates in the format: -7922600,5211350");
      return;
    }

    const newLocation = {
      id: Date.now(),
      name: formData.name,
      coordinates: coordsArray,
      status: "inactive",
      description: formData.description,
      otherData: `Additional info about ${formData.name}.`,
      location: "Boston College",
      image: "",
      amenities: formData.amenities.map(name => ({ name })),
      noiseLevel: formData.noiseLevel,
      seating: formData.seating.join(', '),
      generalRating: Number(formData.generalRating)
    };

    try {
      onAddLocation(newLocation);
      const response = await fetch('/api/locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLocation)
      });
      const result = await response.json();
      console.log("Location saved to DB:", result);
      onClose();
    } catch (error) {
      console.error("Failed to save location:", error);
      alert("Error saving location to server.");
    }
  };

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-gray-500/30 flex items-center justify-center z-50">
      <div className="w-1/3 bg-white p-6 rounded-lg shadow-lg overflow-y-auto z-10 m-5 text-black">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold mb-0">Add Location</h2>
          <button onClick={onClose} className="text-gray-600 hover:bg-gray-100 transition duration-200 ease-in-out mb-1 p-1 rounded-md">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input name="name" placeholder="Name" value={formData.name} onChange={handleChange} required className="border p-2 rounded" />

          <div className="flex gap-2">
            <input name="coordinates" placeholder="Coordinates (e.g. -7922600,5211350)" value={formData.coordinates} onChange={handleChange} className="border p-2 rounded w-full" readOnly />
            <button
              type="button"
              onClick={handlePickOnMap}
              className="bg-[#98002E] text-white px-3 py-1 rounded hover:bg-[#7a0025]"
            >
              Pick from Map
            </button>
          </div>

          <input name="description" placeholder="Description" value={formData.description} onChange={handleChange} className="border p-2 rounded" />

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Rating: {formData.generalRating}%</label>
            <input type="range" name="generalRating" min="0" max="100" value={formData.generalRating || 0} onChange={handleChange} className="w-full h-2 rounded-lg appearance-none bg-gray-300 cursor-pointer accent-[#98002E]" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Amenities</label>
            <Select isMulti options={amenitiesOptions} value={amenitiesOptions.filter(option => formData.amenities.includes(option.value))} onChange={(selected) => handleMultiSelectChange('amenities', selected)} className="text-sm" classNamePrefix="react-select" placeholder="Select amenities..." />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Noise Level</label>
            <Select options={noiseLevelOptions} value={noiseLevelOptions.find(option => option.value === formData.noiseLevel)} onChange={(selected) => setFormData(prev => ({ ...prev, noiseLevel: selected ? selected.value : '' }))} className="text-sm" classNamePrefix="react-select" placeholder="Select noise level..." isClearable />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Seating Type</label>
            <Select isMulti options={seatingOptions} value={seatingOptions.filter(option => formData.seating.includes(option.value))} onChange={(selected) => handleMultiSelectChange('seating', selected)} className="text-sm" classNamePrefix="react-select" placeholder="Select seating types..." />
          </div>

          <button type="submit" className="bg-[#98002E] text-white px-4 py-2 rounded hover:bg-[#7a0025]">Add</button>
        </form>
      </div>
    </div>
  );
}

export default Menu;
