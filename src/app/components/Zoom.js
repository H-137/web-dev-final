import { useEffect } from "react";

const ZoomControls = ({ mapInstance }) => {
  useEffect(() => {
    if (typeof document === "undefined") return;

    const zoomInButton = document.createElement("button");
    zoomInButton.innerHTML = "+";
    zoomInButton.className = "custom-zoom-in absolute top-18 left-4 bg-white p-2 rounded shadow";

    const zoomOutButton = document.createElement("button");
    zoomOutButton.innerHTML = "−";
    zoomOutButton.className = "custom-zoom-out absolute top-30 left-4 bg-white p-2 rounded shadow";

    const zoomIn = () => {
      if (mapInstance.current) {
        const view = mapInstance.current.getView();
        view.animate({ zoom: view.getZoom() + 1, duration: 300 });
      }
    };

    const zoomOut = () => {
      if (mapInstance.current) {
        const view = mapInstance.current.getView();
        view.animate({ zoom: view.getZoom() - 1, duration: 300 });
      }
    };

    zoomInButton.addEventListener("click", zoomIn);
    zoomOutButton.addEventListener("click", zoomOut);

    const zoomControlsContainer = document.createElement("div");
    zoomControlsContainer.className = "custom-zoom-controls";
    zoomControlsContainer.appendChild(zoomInButton);
    zoomControlsContainer.appendChild(zoomOutButton);

    document.body.appendChild(zoomControlsContainer);

    return () => {
      zoomInButton.removeEventListener("click", zoomIn);
      zoomOutButton.removeEventListener("click", zoomOut);
      zoomControlsContainer.remove();
    };
  }, [mapInstance]);

  return null;
};

export default ZoomControls;
