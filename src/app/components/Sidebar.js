import React, { useState } from "react";
import { FaTimes } from "react-icons/fa"; // Importing the close icon
import Image from "next/image";

const Sidebar = ({ studySpace, onClose }) => {
  // Ensure studySpace exists before rendering


  const [showReviewForm, setShowReviewForm] = useState(false);
const [reviewText, setReviewText] = useState("");
const [rating, setRating] = useState(0);

if (!studySpace) return null;

const handleSubmit = (e) => {
  e.preventDefault();
  console.log("Submitted review:", { reviewText, rating });
  setShowReviewForm(false);
  setReviewText("");
  setRating(0);
};

const handleCancel = () => {
  setShowReviewForm(false);
  setReviewText("");
  setRating(0);
};


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

      {/* Write a Review Section */}
<div className="mt-6">
  {!showReviewForm ? (
    <button
      onClick={() => setShowReviewForm(true)}
      className="bg-[#98002E] text-white px-4 py-2 rounded-md hover:bg-[#7a0025] transition"
    >
      Write a Review
    </button>
  ) : (
    <form onSubmit={handleSubmit} className="space-y-4 mt-2">
      <textarea
        value={reviewText}
        onChange={(e) => setReviewText(e.target.value)}
        placeholder="Write your review..."
        className="w-full p-2 border border-gray-300 rounded-md resize-none"
        rows={3}
        required
      />

      <div className="flex items-center space-x-1">
        <span className="font-medium">Your Rating:</span>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            className={`text-2xl ${
              star <= rating ? "text-yellow-500" : "text-gray-300"
            }`}
          >
            ★
          </button>
        ))}
      </div>

      <div className="flex space-x-2">
        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition"
        >
          Submit
        </button>
        <button
          type="button"
          onClick={handleCancel}
          className="bg-gray-300 text-black px-4 py-2 rounded-md hover:bg-gray-400 transition"
        >
          Cancel
        </button>
      </div>
    </form>
  )}
</div>

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
