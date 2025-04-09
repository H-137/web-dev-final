import React from "react";
import { FaTimes } from "react-icons/fa"; // Importing the close icon
import Image from "next/image";

const Sidebar = ({ studySpace, onClose }) => {
  // Ensure studySpace exists before rendering
  if (!studySpace) return null;

  return (
    <div className="fixed top-0 right-0 w-1/3 bg-white p-6 rounded-l-lg shadow-lg overflow-y-auto z-10 m-5 text-black">
      <div className="flex justify-between items-center mb-0">
        {/* Study Space Name */}
        <h2 className="text-4xl font-bold mb-0">{studySpace.name}</h2>
        <button
          onClick={onClose}
          className="text-gray-600 float-right hover:bg-gray-100 transition duration-200 ease-in-out mb-1 p-1 rounded-md"
        >
          <FaTimes size={20} className="text-black" />
        </button>
      </div>

      {/* Study Space Image */}
      {studySpace.image && (
        <div className="relative w-full h-40 mb-4">
          <Image
            src={studySpace.image}
            alt={studySpace.name}
            fill
            className="object-cover rounded-lg"
          />
        </div>
      )}

      <div className="flex flex-row justify-between items-center mb-4">
        <div className="flex flex-col">
          {/* Amenities */}
          <h3 className="text-lg font-semibold mb-2">Amenities</h3>
          <ul className="list-none space-y-2">
            {studySpace.amenities?.map((amenity, index) => (
              <li key={index} className="flex justify-between items-center">
                <span>{amenity.name}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* General Rating */}
        <ThreeQuarterCircleRating rating={studySpace.generalRating} />
      </div>

      {/* Featured Review */}
      {studySpace.featuredReview && (
        <>
          <h3 className="text-lg font-semibold mt-4 mb-2">Featured Review</h3>
          <blockquote className="italic text-gray-600 border-l-4 border-blue-500 pl-4">
            {studySpace.featuredReview}
          </blockquote>

          {/* Stars next to the featured review */}
          <div className="mt-2 flex items-center">
            <span className="text-yellow-500">
              {"⭐".repeat(5)} {/* Display 5 stars for now */}
            </span>
          </div>
        </>
      )}
    </div>
  );
};

const ThreeQuarterCircleRating = ({ rating }) => {
  const percentage = rating / 100; // Convert rating to percentage
  const radius = 60; // Adjust size
  const circumference = 2 * Math.PI * radius; // Full-circle circumference
  const maxArc = (3 / 4) * circumference; // Only 3/4th of the circle is used
  const strokeDashoffset = maxArc * (1 - percentage); // Adjust stroke offset

  return (
    <div className="relative w-40 h-40 flex items-center justify-center">
      <svg width="160" height="160" viewBox="0 0 160 160" className="absolute">
        {/* Gray Background (Full 3/4th of the Circle) */}
        <circle
          cx="80"
          cy="80"
          r={radius}
          fill="transparent"
          stroke="#E5E7EB" // Light gray
          strokeWidth="12"
          strokeDasharray={`${maxArc} ${circumference}`} // Only 3/4th of circle visible
          strokeDashoffset="0"
          strokeLinecap="round"
          transform="rotate(135,80,80)" // Rotates so it starts from bottom left
        />
        {/* Maroon Progress Bar */}
        <circle
          cx="80"
          cy="80"
          r={radius}
          fill="transparent"
          stroke="#98002E" // Maroon color
          strokeWidth="12"
          strokeDasharray={`${maxArc} ${circumference}`} // Only 3/4th of circle visible
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform="rotate(135,80,80)" // Rotates progress start to bottom left
        />
      </svg>
      {/* Centered Rating Text */}
      <span className="absolute text-4xl font-bold text-black">{rating}</span>
    </div>
  );
};

export default Sidebar;
