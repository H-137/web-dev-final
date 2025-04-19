'use client';

import { useEffect } from 'react';

export default function ReviewsUploader() {
  useEffect(() => {
    async function uploadReviews() {
      const res = await fetch('/reviews.json');
      const raw = await res.json();

      // Flatten the object to an array of review docs
      const reviewsArray = Object.entries(raw).flatMap(([locationName, reviews]) =>
        reviews.map(review => ({
          ...review,
          locationName, // associate review with its location
        }))
      );

      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reviewsArray)
      });

      const result = await response.json();
      console.log('Inserted reviews:', result);
    }

    uploadReviews();
  }, []);

  return (
    <main className="p-8">
      <h1 className="text-xl font-semibold">Uploading reviews...</h1>
      <p>Check the console for upload results.</p>
    </main>
  );
}
