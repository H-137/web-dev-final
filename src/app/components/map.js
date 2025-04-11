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
import { FaFilter, FaTimes, FaEdit } from "react-icons/fa";
import ZoomControls from "./Zoom";
import Menu from "./Menu";

const styles = {
  active: new Style({
    image: new Icon({ anchor: [0.5, 1], src: "/marker_red.svg", scale: 0.06 }),
  }),
  inactive: new Style({
    image: new Icon({ anchor: [0.5, 1], src: "/marker.svg", scale: 0.05 }),
  }),
};

const OpenLayersMap = () => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const vectorSourceRef = useRef(new VectorSource());
  const vectorLayerRef = useRef(new VectorLayer({ source: vectorSourceRef.current }));

  const [locationsData, setLocationsData] = useState(null);
  const [reviewsData, setReviewsData] = useState({});
  const reviewsRef = useRef(reviewsData); //  Ref to keep reviews in sync

  const [selectedSpace, setSelectedSpace] = useState(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [activeFeatureId, setActiveFeatureId] = useState(null);
  const [filters, setFilters] = useState({
    minRating: 0,
    amenities: [],
    noiseLevels: [],
    seating: [],
  });

  //  Keep reviewsRef in sync with reviewsData
  useEffect(() => {
    reviewsRef.current = reviewsData;
  }, [reviewsData]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [locationsResponse, reviewsResponse] = await Promise.all([
          fetch("/locations.json"),
          fetch("/reviews.json")
        ]);

        const locations = await locationsResponse.json();
        const reviews = await reviewsResponse.json();

        setLocationsData(locations);
        setReviewsData(reviews || {});
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    if (mapRef.current && !mapInstance.current) {
      mapInstance.current = new Map({
        target: mapRef.current,
        layers: [
          new TileLayer({
            source: new XYZ({
              url: "https://{a-d}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
            }),
          }),
          vectorLayerRef.current,
        ],
        view: new View({
          center: [-7922441.18, 5211368.96],
          zoom: 16,
        }),
        controls: [],
      });

      //  Click handler using latest reviews
      mapInstance.current.on("click", (event) => {
        const feature = mapInstance.current.forEachFeatureAtPixel(event.pixel, (feat) => feat);
        if (!feature) return;

        const isActive = !feature.get("active");

        vectorSourceRef.current.getFeatures().forEach((f) => {
          f.set("active", false);
          f.setStyle(styles.inactive);
        });

        feature.set("active", isActive);
        feature.setStyle(isActive ? styles.active : styles.inactive);

        if (isActive) {
          const locationName = feature.get("name");
          setSelectedSpace({
            name: locationName,
            description: feature.get("description"),
            image: feature.get("image"),
            generalRating: feature.get("generalRating"),
            amenities: feature.get("amenities"),
            noiseLevel: feature.get("noiseLevel"),
            seating: feature.get("seating"),
            featuredReview: feature.get("featuredReview"),
            reviews: reviewsRef.current[locationName] || [] // Always current
          });
          setShowSidebar(true);
          setActiveFeatureId(feature.getId());
        } else {
          setShowSidebar(false);
          setActiveFeatureId(null);
        }
      });
    }
  }, []); // Initial setup only

  useEffect(() => {
    if (!locationsData) return;

    vectorSourceRef.current.clear();
    const newFeatures = locationsData.locations
      .filter((location) => {
        if (location.generalRating < filters.minRating) return false;
        if (filters.noiseLevels.length > 0 && !filters.noiseLevels.includes(location.noiseLevel)) {
          return false;
        }
        const locationSeating = Array.isArray(location.seating) ? location.seating : [location.seating];
        if (filters.seating.length > 0 && !filters.seating.some(seat => locationSeating.includes(seat))) {
          return false;
        }
        const locationAmenities = location.amenities.map(a => a.name);
        if (filters.amenities.length > 0 && !filters.amenities.every(amenity => locationAmenities.includes(amenity))) {
          return false;
        }
        return true;
      })
      .map((location) => {
        const feature = new Feature({
          geometry: new Point(location.coordinates),
          name: location.name,
          description: location.description,
          image: location.image,
          generalRating: location.generalRating,
          amenities: location.amenities,
          noiseLevel: location.noiseLevel,
          seating: location.seating,
          featuredReview: location.featuredReview,
          active: false
        });

        feature.setId(location.id);
        feature.setStyle(activeFeatureId === location.id ? styles.active : styles.inactive);
        return feature;
      });

    vectorSourceRef.current.addFeatures(newFeatures);
  }, [locationsData, filters, activeFeatureId]);

  const handleAddReview = (locationName, newReview) => {
    const reviewWithId = {
      ...newReview,
      id: `rev-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      date: new Date().toISOString()
    };

    const updatedReviews = {
      ...reviewsRef.current,
      [locationName]: [...(reviewsRef.current[locationName] || []), reviewWithId]
    };

    setReviewsData(updatedReviews);

    if (selectedSpace && selectedSpace.name === locationName) {
      setSelectedSpace(prev => ({
        ...prev,
        reviews: updatedReviews[locationName]
      }));
    }
  };

  const handleCloseSidebar = () => {
    setShowSidebar(false);
    setActiveFeatureId(null);
    vectorSourceRef.current.getFeatures().forEach((f) => {
      f.set("active", false);
      f.setStyle(styles.inactive);
    });
  };

  const handleCloseMenu = () => {
    setShowMenu(false);
    setActiveFeatureId(null);
    vectorSourceRef.current.getFeatures().forEach((f) => {
      f.set("active", false);
      f.setStyle(styles.inactive);
    });
  };

  const handleAddLocation = (newLocation) => {
    setLocationsData(prev => ({
      ...prev,
      locations: [...prev.locations, newLocation]
    }));
  };

  return (
    <>
      <div ref={mapRef} className="absolute top-0 left-0 w-full h-full" />
      <ZoomControls mapInstance={mapInstance} />

      <button
        onClick={() => setShowMenu(!showMenu)}
        className="absolute top-4 left-4 bg-white p-3 rounded-lg shadow-lg z-10 hover:bg-gray-100 transition-colors"
        aria-label="Add location"
      >
        <FaEdit size={20} className="text-black pl-1" />
      </button>

      <button
        onClick={() => setShowFilters(!showFilters)}
        className="absolute top-4 left-18 bg-white p-3 rounded-lg shadow-lg z-10 hover:bg-gray-100 transition-colors"
        aria-label="Toggle filters"
      >
        {showFilters ? <FaTimes size={20} className="text-black" /> : <FaFilter size={20} className="text-black" />}
      </button>

      {showFilters && <FilterPanel filters={filters} setFilters={setFilters} />}

      {showSidebar && (
        <Sidebar
          studySpace={selectedSpace}
          onClose={handleCloseSidebar}
          onAddReview={handleAddReview}
        />
      )}

      {showMenu && <Menu onClose={handleCloseMenu} onAddLocation={handleAddLocation} />}
    </>
  );
};

export default OpenLayersMap;
