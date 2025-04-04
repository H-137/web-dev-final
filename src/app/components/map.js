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
import Sidebar from "./Sidebar";
import FilterPanel from "./FilterPanel"; //  Added new component for filters
import { FaFilter, FaTimes } from "react-icons/fa"; //  New icons for toggling filter UI

const OpenLayersMap = () => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const vectorLayerRef = useRef(null);
  const vectorSourceRef = useRef(new VectorSource()); //  Centralized vector source via ref

  const [locationsData, setLocationsData] = useState(null);
  const [selectedSpace, setSelectedSpace] = useState(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showFilters, setShowFilters] = useState(false); //  Controls filter panel visibility
  const [filters, setFilters] = useState({
    //  Stores filter state
    minRating: 0,
    amenities: [],
  });

  useEffect(() => {
    fetch("/locations.json")
      .then((response) => response.json())
      .then((data) => {
        setLocationsData(data);
      })
      .catch((error) => {
        console.error("Error loading locations data:", error);
      });
  }, []);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current || !locationsData) return;

    mapInstance.current = new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({
          source: new XYZ({
            url: "https://{a-d}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
          }),
        }),
        new VectorLayer({
          source: vectorSourceRef.current, // Uses centralized source
        }),
      ],
      view: new View({
        center: [-7922441.18, 5211368.96],
        zoom: 16,
      }),
      controls: [], // Disables all default controls, including zoom
    });

    const zoomInButton = document.createElement("button");
    zoomInButton.innerHTML = "+";
    zoomInButton.className = "custom-zoom-in absolute top-18 left-4";

    const zoomOutButton = document.createElement("button");
    zoomOutButton.innerHTML = "−";
    zoomOutButton.className = "custom-zoom-out absolute top-30 left-4";

    zoomInButton.addEventListener("click", () => {
      const view = mapInstance.current.getView();
      view.setZoom(view.getZoom() + 1);
    });

    zoomOutButton.addEventListener("click", () => {
      const view = mapInstance.current.getView();
      view.setZoom(view.getZoom() - 1);
    });

    // Add buttons to a container
    const zoomControlsContainer = document.createElement("div");
    zoomControlsContainer.className = "custom-zoom-controls";
    zoomControlsContainer.appendChild(zoomInButton);
    zoomControlsContainer.appendChild(zoomOutButton);

    // Append to map container
    mapRef.current.appendChild(zoomControlsContainer);

    vectorLayerRef.current = mapInstance.current.getLayers().getArray()[1]; //  Stores vector layer reference

    mapInstance.current.on("click", (event) => {
      const feature = mapInstance.current.forEachFeatureAtPixel(
        event.pixel,
        (feat) => feat
      );

      if (feature) {
        vectorSourceRef.current.getFeatures().forEach((f) => {
          if (f !== feature) {
            f.set("active", false);
            f.setStyle(styles.inactive); //  Reused shared styles
          }
        });

        const isActive = feature.get("active");
        feature.set("active", !isActive);
        feature.setStyle(isActive ? styles.inactive : styles.active);

        if (!isActive) {
          setSelectedSpace({
            name: feature.get("name"),
            description: feature.get("description"),
            image: feature.get("image"),
            generalRating: feature.get("generalRating"),
            amenities: feature.get("amenities"),
            featuredReview: feature.get("featuredReview"),
          });
          setShowSidebar(true);
        } else {
          setShowSidebar(false);
        }
      }
    });

    return () => {
      mapInstance.current.setTarget(null);
    };
  }, [locationsData]);

  const styles = {
    active: new Style({
      image: new Icon({
        anchor: [0.5, 1],
        src: "/marker_red.svg",
        scale: 0.06,
      }),
    }),
    inactive: new Style({
      image: new Icon({
        anchor: [0.5, 1],
        src: "/marker.svg",
        scale: 0.05,
      }),
    }),
  };

  //  This effect filters and adds markers dynamically
  useEffect(() => {
    if (!locationsData) return;

    vectorSourceRef.current.clear(); //  Clears previous features before applying new ones

    locationsData.locations
      .filter((location) => {
        //  Filter by minimum rating
        if (location.generalRating < filters.minRating) return false;

        //  Filter by required amenities
        if (filters.amenities.length > 0) {
          const locationAmenities = location.amenities.map((a) => a.name);
          return filters.amenities.every((amenity) =>
            locationAmenities.includes(amenity)
          );
        }

        return true;
      })
      .forEach((location) => {
        const feature = new Feature({
          geometry: new Point(location.coordinates),
          active: false,
          name: location.name,
          description: location.description,
          otherData: location.otherData,
          image: location.image,
          generalRating: location.generalRating,
          amenities: location.amenities,
          featuredReview: location.featuredReview,
        });

        feature.setId(location.id);
        feature.setStyle(styles.inactive);
        vectorSourceRef.current.addFeature(feature); //  Uses central vector source
      });
  }, [locationsData, filters]); //  Re-renders on filter change

  const handleCloseSidebar = () => {
    setShowSidebar(false);
    vectorSourceRef.current.getFeatures().forEach((f) => {
      f.set("active", false);
      f.setStyle(styles.inactive); // 🧹 Unified inactive style logic
    });
  };

  return (
    <>
      <div ref={mapRef} className="absolute top-0 left-0 w-full h-full" />

      {/*  Filter Toggle Button */}
      <button
        onClick={() => setShowFilters(!showFilters)}
        className="absolute top-4 left-4 bg-white p-3 rounded-lg shadow-lg z-10 hover:bg-gray-100 transition-colors"
        aria-label="Toggle filters"
      >
        {showFilters ? (
          <FaTimes size={20} className="text-black" />
        ) : (
          <FaFilter size={20} className="text-black" />
        )}
      </button>

      {/*  Conditional Filter Panel Display */}
      {showFilters && <FilterPanel filters={filters} setFilters={setFilters} />}

      {showSidebar && (
        <Sidebar studySpace={selectedSpace} onClose={handleCloseSidebar} />
      )}
    </>
  );
};

export default OpenLayersMap;
