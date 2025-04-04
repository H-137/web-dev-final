import React, { useEffect, useRef, useState } from "react";
import "ol/ol.css";
import { Map, View } from "ol";
import TileLayer from "ol/layer/Tile";
import XYZ from "ol/source/XYZ";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import Style from "ol/style/Style";
import Icon from "ol/style/Icon";

// Import MapOverlay component
import MapOverlay from "./overlay";

const OpenLayersMap = () => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const vectorLayerRef = useRef(null);
  const [locationsData, setLocationsData] = useState(null); // State to store the data
  const [selectedFeature, setSelectedFeature] = useState(null); // State for selected feature

  useEffect(() => {
    // Fetch the JSON data from the public folder
    fetch("/locations.json")
      .then((response) => response.json())
      .then((data) => {
        setLocationsData(data); // Store data in the state
      })
      .catch((error) => {
        console.error("Error loading locations data:", error);
      });
  }, []);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current || !locationsData) return;

    // Define the map
    mapInstance.current = new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({
          source: new XYZ({
            url: "https://{a-d}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
          }),
        }),
      ],
      view: new View({
        center: [-7922441.18, 5211368.96], // Boston College (EPSG:3857)
        zoom: 16,
      }),
    });

    // Define styles
    const styles = {
      active: new Style({
        image: new Icon({
          anchor: [0.5, 1],
          src: "/marker_red.svg", // Active marker
          scale: 0.06,
        }),
      }),
      inactive: new Style({
        image: new Icon({
          anchor: [0.5, 1],
          src: "/marker.svg", // Inactive marker
          scale: 0.05,
        }),
      }),
    };

    // Create vector source
    const vectorSource = new VectorSource();

    // Loop through the locations and create features
    locationsData.locations.forEach((location) => {
      const feature = new Feature({
        geometry: new Point(location.coordinates),
        active: false, // Default state
        name: location.name,
        description: location.description,
        otherData: location.otherData,
      });

      feature.setId(location.id); // Assign an ID for reference
      feature.setStyle(styles.inactive); // Start as inactive
      vectorSource.addFeature(feature);
    });

    // Create vector layer
    const vectorLayer = new VectorLayer({
      source: vectorSource,
    });
    vectorLayerRef.current = vectorLayer;

    // Add layer to the map
    mapInstance.current.addLayer(vectorLayer);

    // Add click listener on the map
    mapInstance.current.on("click", (event) => {
      // Check if a feature was clicked
      const feature = mapInstance.current.forEachFeatureAtPixel(event.pixel, (feat) => {
        return feat;
      });

      // If a feature was clicked
      if (feature) {
        // Deactivate all features except the clicked one
        vectorSource.getFeatures().forEach((f) => {
          if (f !== feature) {
            f.set("active", false);
            f.setStyle(styles.inactive);
          }
        });

        // Toggle the clicked feature's active state
        const isActive = feature.get("active");
        feature.set("active", !isActive);
        feature.setStyle(isActive ? styles.inactive : styles.active);

        // Update the overlay with the clicked feature's information
        setSelectedFeature({
          name: feature.get("name"),
          description: feature.get("description"),
          otherData: feature.get("otherData"),
        });
      } 
    });

    return () => {
      mapInstance.current.setTarget(null);
    };
  }, [locationsData]);

  const handleCloseOverlay = () => {
    setSelectedFeature(null); // Close the overlay by clearing selected feature
  };

  return (
    <>
      <div ref={mapRef} className="absolute top-0 left-0 w-full h-full" />
      {/* Render the overlay if a feature is selected */}
      <MapOverlay featureData={selectedFeature} onClose={handleCloseOverlay} />
    </>
  );
};

export default OpenLayersMap;
