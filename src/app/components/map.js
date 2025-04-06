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
import FilterPanel from "./FilterPanel";
import { FaFilter, FaTimes } from "react-icons/fa";
import ZoomControls from "./Zoom";

const OpenLayersMap = () => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const vectorSourceRef = useRef(new VectorSource());

  const [locationsData, setLocationsData] = useState(null);
  const [selectedSpace, setSelectedSpace] = useState(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [activeFeatureId, setActiveFeatureId] = useState(null);
  const [filters, setFilters] = useState({ 
    minRating: 0, 
    amenities: [],
    noiseLevels: [],
    seating: []
  });

  useEffect(() => {
    fetch("/locations.json")
      .then((response) => response.json())
      .then((data) => setLocationsData(data))
      .catch((error) => console.error("Error loading locations data:", error));
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
        new VectorLayer({ source: vectorSourceRef.current }),
      ],
      view: new View({
        center: [-7922441.18, 5211368.96],
        zoom: 16,
      }),
      controls: [],
    });

    mapInstance.current.on("click", (event) => {
      const feature = mapInstance.current.forEachFeatureAtPixel(
        event.pixel,
        (feat) => feat
      );

      if (feature) {
        vectorSourceRef.current.getFeatures().forEach((f) => {
          if (f !== feature) {
            f.set("active", false);
            f.setStyle(styles.inactive);
          }
        });

        const isActive = feature.get("active");
        feature.set("active", !isActive);
        feature.setStyle(isActive ? styles.inactive : styles.active);

        if (!isActive) {
          setActiveFeatureId(feature.getId());
          setSelectedSpace({
            name: feature.get("name"),
            description: feature.get("description"),
            image: feature.get("image"),
            generalRating: feature.get("generalRating"),
            amenities: feature.get("amenities"),
            noiseLevel: feature.get("noiseLevel"),
            seating: feature.get("seating"),
            featuredReview: feature.get("featuredReview"),
          });
          setShowSidebar(true);
        } else {
          setActiveFeatureId(null);
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
      image: new Icon({ anchor: [0.5, 1], src: "/marker_red.svg", scale: 0.06 }),
    }),
    inactive: new Style({
      image: new Icon({ anchor: [0.5, 1], src: "/marker.svg", scale: 0.05 }),
    }),
  };

  useEffect(() => {
    if (!locationsData) return;

    vectorSourceRef.current.clear();

    const newFeatures = locationsData.locations
      .filter((location) => {
        if (location.generalRating < filters.minRating) return false;
        
        if (filters.amenities.length > 0) {
          const locationAmenities = location.amenities.map((a) => a.name);
          return filters.amenities.every((amenity) =>
            locationAmenities.includes(amenity)
          );
        }
        
        if (filters.noiseLevels.length > 0 && !filters.noiseLevels.includes(location.noiseLevel)) {
          return false;
        }
        
        if (filters.seating.length > 0 && !filters.seating.includes(location.seating)) {
          return false;
        }
        
        return true;
      })
      .map((location) => {
        const feature = new Feature({
          geometry: new Point(location.coordinates),
          active: false,
          name: location.name,
          description: location.description,
          image: location.image,
          generalRating: location.generalRating,
          amenities: location.amenities,
          noiseLevel: location.noiseLevel,
          seating: location.seating,
          featuredReview: location.featuredReview,
        });

        feature.setId(location.id);
        feature.setStyle(
          activeFeatureId === location.id ? styles.active : styles.inactive
        );

        return feature;
      });

    vectorSourceRef.current.addFeatures(newFeatures);

    if (activeFeatureId) {
      const activeFeature = vectorSourceRef.current.getFeatureById(activeFeatureId);
      if (activeFeature) {
        activeFeature.set("active", true);
        activeFeature.setStyle(styles.active);
      } else {
        setActiveFeatureId(null);
      }
    }
  }, [locationsData, filters]);

  const handleCloseSidebar = () => {
    setShowSidebar(false);
    setActiveFeatureId(null);
    vectorSourceRef.current.getFeatures().forEach((f) => {
      f.set("active", false);
      f.setStyle(styles.inactive);
    });
  };

  return (
    <>
      <div ref={mapRef} className="absolute top-0 left-0 w-full h-full" />
      <ZoomControls mapInstance={mapInstance} />
      <button
        onClick={() => setShowFilters(!showFilters)}
        className="absolute top-4 left-4 bg-white p-3 rounded-lg shadow-lg z-10 hover:bg-gray-100 transition-colors"
        aria-label="Toggle filters"
      >
        {showFilters ? <FaTimes size={20} className="text-black" /> : <FaFilter size={20} className="text-black" />}
      </button>
      {showFilters && <FilterPanel filters={filters} setFilters={setFilters} />}
      {showSidebar && <Sidebar studySpace={selectedSpace} onClose={handleCloseSidebar} />}
    </>
  );
};

export default OpenLayersMap;
