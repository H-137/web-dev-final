'use client'

import OpenLayersMap from "./components/map";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4">
      <OpenLayersMap />
    </main>
  );
}
