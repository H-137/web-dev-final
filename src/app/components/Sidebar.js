import React, { useState, useRef, useEffect } from "react";
import { FaTimes } from "react-icons/fa";
import { FaStar, FaStarHalfAlt, FaRegStar, FaMap } from "react-icons/fa";
import {
  FaWater,
  FaVolumeDown,
  FaDoorOpen,
  FaProjectDiagram,
  FaChalkboardTeacher,
  FaLandmark,
  FaUsers,
  FaUtensils,
  FaLaptop,
  FaChair,
  FaPrint,
  FaMarker,
  FaUserFriends, // Added icon for occupancy
} from "react-icons/fa";
import { BsTable } from "react-icons/bs";
import Image from "next/image";

// Map amenities to icons
const amenityIcons = {
  "Water Fountain": <FaWater className="text-blue-500 text-lg" />,
  "Quiet Zone": <FaVolumeDown className="text-purple-500 text-lg" />,
  "Study Rooms": <FaDoorOpen className="text-green-500 text-lg" />,
  Projector: <FaProjectDiagram className="text-red-500 text-lg" />,
  Classrooms: <FaChalkboardTeacher className="text-yellow-500 text-lg" />,
  "Historical Site": <FaLandmark className="text-gray-500 text-lg" />,
  "Conference Rooms": <FaUsers className="text-indigo-500 text-lg" />,
  "Cafeteria Nearby": <FaUtensils className="text-orange-500 text-lg" />,
  Desks: <FaLaptop className="text-teal-500 text-lg" />,
  Tables: <FaChair className="text-pink-500 text-lg font-bold" />,
  Printer: <FaPrint className="text-yellow-800 text-lg" />,
  Whiteboard: <FaMarker className="text-rose-500 text-lg" />,
};

const Sidebar = ({ studySpace, onClose, onAddReview }) => {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reviewText || rating === 0) return;

    const newReview = {
      id: `rev-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      reviewText,
      rating,
      locationName: studySpace.name,
      date: new Date().toISOString(),
      isFeatured: false,
    };

    onAddReview(studySpace.name, newReview);

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify([newReview]),
      });

      const result = await response.json();
      console.log("Review saved to DB:", result);
    } catch (error) {
      console.error("Failed to save review:", error);
    }

    setShowReviewForm(false);
    setReviewText("");
    setRating(0);
  };

  // Renders rating stars for display (non-interactive)
  const displayRatingStars = (value) => {
    const stars = [];
    const maxStars = 5;

    for (let i = 1; i <= maxStars; i++) {
      if (value >= i) {
        stars.push(<FaStar key={i} className="text-yellow-500" />);
      } else if (value >= i - 0.5) {
        stars.push(<FaStarHalfAlt key={i} className="text-yellow-500" />);
      } else {
        stars.push(<FaRegStar key={i} className="text-gray-300" />);
      }
    }

    return <div className="flex space-x-1">{stars}</div>;
  };

  // Interactive star rating component
  const StarRating = () => {
    const starRefs = useRef([]);

    // Add global document event listener to reset hover rating
    useEffect(() => {
      // A simple function to reset the hover rating
      const resetHoverRating = () => {
        setHoverRating(0);
      };

      // Add mouseout event on document, which will trigger when mouse leaves any element
      document.addEventListener("mouseout", resetHoverRating);

      // Cleanup
      return () => {
        document.removeEventListener("mouseout", resetHoverRating);
      };
    }, []);

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
        setRating(index + 0.5);
      } else {
        setRating(index + 1);
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
          onClick={(e) => handleStarClick(i, e)}
        >
          <FaRegStar className="text-gray-300 text-2xl" />

          {/* Overlay full or half star based on hover/selected state */}
          {(hoverRating || rating) > i && (
            <div
              className="absolute top-0 left-0 overflow-hidden"
              style={{
                width: (hoverRating || rating) >= i + 1 ? "100%" : "50%",
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

  if (!studySpace) return null;

  // Format occupancy for display
  const formatOccupancy = (occupancy) => {
    if (!occupancy) return "Not specified";
    return `${occupancy} people`;
  };

  return (
    <div className="fixed top-0 right-0 w-1/2 md:w-2/5 lg:w-1/3 transition-all duration-300 ease-in-out bg-white dark:bg-black text-black dark:text-white p-6 box-border rounded-l-lg shadow-lg overflow-y-auto z-10 m-5 mb-0 max-h-[95vh] dark:border-[#333333] dark:border-2">
      <div className="flex justify-between items-center mb-0">
        <h2 className="text-4xl font-bold mb-0">{studySpace.name}</h2>
        <div className="w-29 flex flex-row justify-end">
          {studySpace.coordinates && (
            <a
              href={`https://www.google.com/maps?q=${studySpace.coordinates[1]},${studySpace.coordinates[0]}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 dark:text-gray-300 float-left hover:bg-gray-100 dark:hover:bg-[#111] transition duration-200 ease-in-out mb-1 p-1 mr-2 rounded-md"
            >
              <FaMap size={20} className="text-black dark:text-white" />
            </a>
          )}
          <button
            onClick={onClose}
            className="text-gray-600 dark:text-gray-300 float-right hover:bg-gray-100 dark:hover:bg-[#111] transition duration-200 ease-in-out mb-1 p-1 rounded-md"
          >
            <FaTimes size={20} className="text-black dark:text-white" />
          </button>
        </div>
      </div>
      {studySpace.description && studySpace.description != "N/A" && (
        <div className="text-gray-700 dark:text-gray-300 mb-4 mt-2">
          <p>{studySpace.description}</p>
        </div>
      )}

      {/* Key Information Section */}
      <div className="mb-6 mt-4 grid grid-cols-2 gap-4">
        {/* Noise Level */}
        {studySpace.noiseLevel && (
          <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg flex flex-col items-center justify-center">
            <span className="text-sm text-gray-500 dark:text-gray-400">Noise Level</span>
            <span className="font-medium">{studySpace.noiseLevel}</span>
          </div>
        )}
        
        {/* Maximum Occupancy - with consistent coloring */}
        <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg flex flex-col items-center justify-center">
          <span className="text-sm text-gray-500 dark:text-gray-400">Max Occupancy</span>
          <div className="flex items-center">
            <FaUserFriends className="mr-2 text-gray-600 dark:text-gray-400" />
            <span className="font-medium">{formatOccupancy(studySpace.maxOccupancy)}</span>
          </div>
        </div>
        
        {/* Seating Types if available */}
        {studySpace.seating && (
          <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg flex flex-col items-center justify-center col-span-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">Seating</span>
            <span className="font-medium text-center">{studySpace.seating}</span>
          </div>
        )}
      </div>

      <div className="flex flex-row justify-between mb-4 mt-4">
        <div className="flex flex-col">
          <h3 className="text-lg font-semibold mb-2">Amenities</h3>
          <ul className="list-none space-y-2">
            {studySpace.amenities?.map((amenity, index) => (
              <li key={index} className="flex items-center space-x-2">
                <span className="w-6 h-6 flex items-center justify-center">
                  {amenityIcons[amenity.name]}
                </span>
                <span>{amenity.name}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative w-40 h-30 flex items-center justify-center">
          <svg
            width="160"
            height="160"
            viewBox="0 0 160 160"
            className="absolute"
          >
            <circle
              cx="80"
              cy="80"
              r="60"
              fill="transparent"
              stroke={isDark ? "#333333" : "#E5E7EB"}
              strokeWidth="12"
              strokeDasharray="282.743 376.991"
              strokeDashoffset="0"
              strokeLinecap="round"
              transform="rotate(135,80,80)"
            />
            <circle
              cx="80"
              cy="80"
              r="60"
              fill="transparent"
              stroke="#98002E"
              strokeWidth="12"
              strokeDasharray="282.743 376.991"
              strokeDashoffset={282.743 * (1 - studySpace.generalRating / 100)}
              strokeLinecap="round"
              transform="rotate(135,80,80)"
            />
          </svg>
          <span className="absolute text-4xl font-bold text-black dark:text-white">
            {studySpace.generalRating}
          </span>
        </div>
      </div>

      <div className="mt-4">
        <h3 className="text-lg font-semibold mb-2">User Reviews</h3>
        <div className="space-y-4">
          {studySpace.reviews?.length > 0 ? (
            studySpace.reviews.map((review) => (
              <div
                key={review.id}
                className="border-b border-gray-300 dark:border-gray-600 pb-4"
              >
                <div className="flex items-center mb-2">
                  {displayRatingStars(review.rating)}
                </div>
                <p className="text-gray-700 dark:text-gray-300">
                  {review.reviewText}
                </p>
              </div>
            ))
          ) : (
            <p className="text-gray-500 dark:text-gray-400 italic">
              Be the first to add a review.
            </p>
          )}
        </div>
      </div>

      {!showReviewForm ? (
        <button
          onClick={() => setShowReviewForm(true)}
          className="bg-[#98002E] text-white px-4 py-2 rounded-md hover:bg-[#7a0025] transition mt-4"
        >
          Write a Review
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <textarea
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            placeholder="Write your review..."
            className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-[#1a1a1a] dark:text-white rounded-md resize-none"
            rows={3}
            required
          />

          <div className="flex flex-col space-y-2">
            <span className="font-medium">
              Your Rating: {rating > 0 ? rating.toFixed(1) : ""}
            </span>
            <StarRating />
          </div>

          <div className="flex space-x-2">
            <button
              type="submit"
              className="bg-[#98002E] text-white px-4 py-2 rounded-md hover:bg-[#7a0025] transition"
              disabled={!reviewText || rating === 0}
            >
              Submit
            </button>
            <button
              type="button"
              onClick={() => {
                setShowReviewForm(false);
                setReviewText("");
                setRating(0);
              }}
              className="bg-gray-300 dark:bg-gray-700 text-black dark:text-white px-4 py-2 rounded-md hover:bg-gray-400 dark:hover:bg-gray-600 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default Sidebar;
