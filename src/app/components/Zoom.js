import React from "react";

const ZoomControls = ({ mapInstance }) => {
  const handleZoom = (delta) => {
    if (mapInstance.current) {
      const view = mapInstance.current.getView();
      view.animate({ zoom: view.getZoom() + delta, duration: 300 });
    }
  };

  return (
    <div className="absolute top-20 left-4 z-50 flex flex-col space-y-2">
      <button
        onClick={() => handleZoom(+1)}
        className="w-10 h-10 flex items-center justify-center text-lg font-bold
                   bg-white dark:bg-black text-black dark:text-white
                   hover:bg-gray-100 dark:hover:bg-[#111]
                   rounded-full shadow transition
                   focus:outline-none dark:border-[#333333] dark:border-2"
        aria-label="Zoom In"
      >
        +
      </button>
      <button
        onClick={() => handleZoom(-1)}
        className="w-10 h-10 flex items-center justify-center text-lg font-bold
                   bg-white dark:bg-black text-black dark:text-white
                   hover:bg-gray-100 dark:hover:bg-[#111]
                   rounded-full shadow transition
                   focus:outline-none dark:border-[#333333] dark:border-2"
        aria-label="Zoom Out"
      >
        −
      </button>
    </div>
  );
};

export default ZoomControls;
