import React, { useState } from "react";
import { FaTimes } from "react-icons/fa";
import Image from "next/image";

const Sidebar = ({ studySpace, onClose, onAddReview }) => {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState(0);

  if (!studySpace) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reviewText || rating === 0) return;

    const newReview = {
      id: `rev-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      reviewText,
      rating,
      locationName: studySpace.name,
      date: new Date().toISOString(),
      isFeatured: false
    };

    onAddReview(studySpace.name, newReview);

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify([newReview])
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

  return (
    <div className="fixed top-0 right-0 w-1/3 bg-white p-6 box-border rounded-l-lg shadow-lg overflow-y-auto z-10 m-5 mb-0 text-black max-h-[95vh]">
      <div className="flex justify-between items-center mb-0">
        <h2 className="text-4xl font-bold mb-0">{studySpace.name}</h2>
        <button
          onClick={onClose}
          className="text-gray-600 float-right hover:bg-gray-100 transition duration-200 ease-in-out mb-1 p-1 rounded-md"
        >
          <FaTimes size={20} className="text-black" />
        </button>
      </div>

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
          <h3 className="text-lg font-semibold mb-2">Amenities</h3>
          <ul className="list-none space-y-2">
            {studySpace.amenities?.map((amenity, index) => (
              <li key={index} className="flex justify-between items-center">
                <span>{amenity.name}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative w-40 h-40 flex items-center justify-center">
          <svg width="160" height="160" viewBox="0 0 160 160" className="absolute">
            <circle
              cx="80"
              cy="80"
              r="60"
              fill="transparent"
              stroke="#E5E7EB"
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
          <span className="absolute text-4xl font-bold text-black">
            {studySpace.generalRating}
          </span>
        </div>
      </div>

      {studySpace.featuredReview && (
        <>
          <h3 className="text-lg font-semibold mt-4 mb-2">Featured Review</h3>
          <blockquote className="italic text-gray-600 border-l-4 border-blue-500 pl-4">
            {studySpace.featuredReview}
          </blockquote>
          <div className="mt-2 flex items-center">
            <span className="text-yellow-500">
              {"⭐".repeat(Math.round(studySpace.generalRating / 20))}
            </span>
          </div>
        </>
      )}

      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-2">User Reviews</h3>
        <div className="space-y-4 max-h-60 overflow-y-auto">
          {studySpace.reviews?.length > 0 ? (
            studySpace.reviews.map((review) => (
              <div key={review.id} className="border-b pb-4">
                <div className="flex items-center mb-2">
                  <span className="text-yellow-500">
                    {"⭐".repeat(review.rating)}
                  </span>
                </div>
                <p className="text-gray-700">{review.reviewText}</p>
              </div>
            ))
          ) : (
            <p className="text-gray-500 italic">Be the first to add a review.</p>
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
              onClick={() => {
                setShowReviewForm(false);
                setReviewText("");
                setRating(0);
              }}
              className="bg-gray-300 text-black px-4 py-2 rounded-md hover:bg-gray-400 transition"
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
