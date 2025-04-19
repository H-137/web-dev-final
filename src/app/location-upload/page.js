'use client';

import { useEffect } from 'react';

export default function UploadLocations() {
  useEffect(() => {
    async function uploadLocations() {
      const res = await fetch('/locations.json');
      const json = await res.json();
      const locations = json.locations;

      for (const location of locations) {
        const response = await fetch('/api/locations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(location)
        });

        const result = await response.json();
        console.log(`Inserted: ${location.name}`, result);
      }
    }

    uploadLocations();
  }, []);

  return (
    <main className="p-8">
      <h1 className="text-xl font-semibold">Uploading locations…</h1>
      <p>Check the console for upload results.</p>
    </main>
  );
}
