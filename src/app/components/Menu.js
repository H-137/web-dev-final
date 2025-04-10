'use client';

import React, { useState } from 'react';

function Menu({ onClose, onAddLocation }) {
  const [formData, setFormData] = useState({
    name: '',
    coordinates: '',
    description: '',
    noiseLevel: '',
    seating: '',
    generalRating: '',
    featuredReview: '',
    amenities: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Parse coordinate string to number array (e.g., "-7922600,5211350" => [-7922600.0, 5211350.0])
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
      amenities: formData.amenities
        .split(',')
        .map(name => name.trim())
        .filter(Boolean)
        .map(name => ({ name })),
      noiseLevel: formData.noiseLevel,
      seating: formData.seating,
      featuredReview: formData.featuredReview,
      generalRating: Number(formData.generalRating)
    };

    console.log("Adding new location:", newLocation);
    onAddLocation(newLocation);
    onClose();
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
          <input name="coordinates" placeholder="Coordinates (e.g. -7922600,5211350)" value={formData.coordinates} onChange={handleChange} required className="border p-2 rounded" />
          <input name="description" placeholder="Description" value={formData.description} onChange={handleChange} className="border p-2 rounded" />
          <input name="noiseLevel" placeholder="Noise Level" value={formData.noiseLevel} onChange={handleChange} className="border p-2 rounded" />
          <input name="seating" placeholder="Seating" value={formData.seating} onChange={handleChange} className="border p-2 rounded" />
          <input name="generalRating" placeholder="Rating (0–100)" value={formData.generalRating} onChange={handleChange} type="number" className="border p-2 rounded" />
          <input name="featuredReview" placeholder="Featured Review" value={formData.featuredReview} onChange={handleChange} className="border p-2 rounded" />
          <input name="amenities" placeholder="Amenities (comma-separated)" value={formData.amenities} onChange={handleChange} className="border p-2 rounded" />
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Add</button>
        </form>
      </div>
    </div>
  );
}

export default Menu;
