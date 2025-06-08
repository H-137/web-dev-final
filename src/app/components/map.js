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
import { FaFilter, FaTimes, FaEdit, FaMoon } from "react-icons/fa";
import ZoomControls from "./Zoom";
import Menu from "./Menu";
import { toLonLat } from "ol/proj";

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
  const vectorLayerRef = useRef(
    new VectorLayer({ source: vectorSourceRef.current })
  );

  const [locationsData, setLocationsData] = useState(null);
  const [reviewsData, setReviewsData] = useState({});
  const reviewsRef = useRef(reviewsData);
  const [awaitingMapClick, setAwaitingMapClick] = useState(false);
  const awaitingMapClickRef = useRef(false);
  const [clickCoordinates, setClickCoordinates] = useState(null);

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
    occupancyRange: [1, 100],
  });
  const [loading, setLoading] = useState(true);
  const [showLoadingScreen, setShowLoadingScreen] = useState(true); // NEW
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("darkMode");
    const enabled = saved === "true";
    setDarkMode(enabled);
    document.documentElement.classList.toggle("dark", enabled);
  }, []);

  useEffect(() => {
    if (!loading) {
      const timeout = setTimeout(() => {
        setShowLoadingScreen(false);
      }, 1000); // match transition duration
      return () => clearTimeout(timeout);
    }
  }, [loading]);

  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle("dark", next);
      localStorage.setItem("darkMode", next);
      return next;
    });
  };

  const lightBaseLayerRef = useRef(
    new TileLayer({
      visible: true,
      source: new XYZ({
        url: "https://{a-d}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
      }),
    })
  );

  const darkBaseLayerRef = useRef(
    new TileLayer({
      visible: false,
      source: new XYZ({
        url: "https://{a-d}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
      }),
    })
  );

  useEffect(() => {
    if (!mapInstance.current) return;
    lightBaseLayerRef.current.setVisible(!darkMode);
    darkBaseLayerRef.current.setVisible(darkMode);
  }, [darkMode]);

  useEffect(() => {
    reviewsRef.current = reviewsData;
  }, [reviewsData]);

  useEffect(() => {
    awaitingMapClickRef.current = awaitingMapClick;
  }, [awaitingMapClick]);

  const checkOccupancyRange = (locationOccupancy, minFilter, maxFilter) => {
    if (!locationOccupancy) return true;
    if (locationOccupancy.includes("-")) {
      const [minLoc, maxLoc] = locationOccupancy.split("-").map(num => {
        if (num.includes("+")) return parseInt(num.replace("+", ""));
        return parseInt(num);
      });
      return !(maxFilter < minLoc || minFilter > maxLoc);
    }
    const occupancy = parseInt(locationOccupancy);
    return !isNaN(occupancy) && occupancy >= minFilter && occupancy <= maxFilter;
  };

  const calculateAverageRating = (locationName) => {
    const reviews = reviewsRef.current[locationName] || [];
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((total, review) => total + review.rating, 0);
    return Math.round((sum / reviews.length) * 20);
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const [locationsResponse, reviewsResponse] = await Promise.all([
          fetch("/api/locations"),
          fetch("/api/reviews"),
        ]);
        const locations = await locationsResponse.json();
        const reviewsRaw = await reviewsResponse.json();
        const groupedReviews = reviewsRaw.reduce((acc, review) => {
          const loc = review.locationName;
          if (!acc[loc]) acc[loc] = [];
          acc[loc].push(review);
          return acc;
        }, {});
        const updatedLocations = locations.map((location) => {
          const locationReviews = groupedReviews[location.name] || [];
          if (locationReviews.length > 0) {
            const sum = locationReviews.reduce(
              (total, review) => total + review.rating,
              0
            );
            const average = sum / locationReviews.length;
            return { ...location, generalRating: Math.round(average * 20) };
          }
          return location;
        });

        setLocationsData({ locations: updatedLocations });
        setReviewsData(groupedReviews);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setTimeout(() => setLoading(false), 500);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (mapRef.current && !mapInstance.current) {
      mapInstance.current = new Map({
        target: mapRef.current,
        layers: [
          lightBaseLayerRef.current,
          darkBaseLayerRef.current,
          vectorLayerRef.current,
        ],
        view: new View({
          center: [-7922441.18, 5211368.96],
          zoom: 16,
        }),
        controls: [],
      });

      mapInstance.current.on("click", (event) => {
        if (awaitingMapClickRef.current) {
          setClickCoordinates(event.coordinate);
          setAwaitingMapClick(false);
          setShowMenu(true);
          return;
        }
        const feature = mapInstance.current.forEachFeatureAtPixel(
          event.pixel,
          (feat) => feat
        );
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
          const locationReviews = reviewsRef.current[locationName] || [];
          const calculatedRating = calculateAverageRating(locationName);
          const rawCoordinates = feature.getGeometry().getCoordinates();
          const lonLat = toLonLat(rawCoordinates);

          setSelectedSpace({
            name: locationName,
            description: feature.get("description"),
            image: feature.get("image"),
            generalRating: calculatedRating,
            amenities: feature.get("amenities"),
            noiseLevel: feature.get("noiseLevel"),
            seating: feature.get("seating"),
            featuredReview: feature.get("featuredReview"),
            reviews: locationReviews,
            coordinates: lonLat,
            maxOccupancy: feature.get("maxOccupancy"),
          });
          setShowSidebar(true);
          setActiveFeatureId(feature.getId());
        } else {
          setShowSidebar(false);
          setActiveFeatureId(null);
        }
      });
    }
  }, []);

  useEffect(() => {
    if (!locationsData) return;
    vectorSourceRef.current.clear();
    const newFeatures = locationsData.locations
      .filter((location) => {
        const locationRating = calculateAverageRating(location.name);
        if (locationRating < filters.minRating) return false;

        if (
          filters.noiseLevels.length > 0 &&
          !filters.noiseLevels.includes(location.noiseLevel)
        )
          return false;

        const locationSeating = Array.isArray(location.seating)
          ? location.seating
          : location.seating
          ? location.seating.split(", ")
          : [];
        if (
          filters.seating.length > 0 &&
          !filters.seating.some((seat) => locationSeating.includes(seat))
        )
          return false;

        const locationAmenities = location.amenities.map((a) => a.name);
        if (
          filters.amenities.length > 0 &&
          !filters.amenities.every((amenity) =>
            locationAmenities.includes(amenity)
          )
        )
          return false;

        if (
          !checkOccupancyRange(
            location.maxOccupancy,
            filters.occupancyRange[0],
            filters.occupancyRange[1]
          )
        )
          return false;

        return true;
      })
      .map((location) => {
        const calculatedRating = calculateAverageRating(location.name);

        const feature = new Feature({
          geometry: new Point(location.coordinates),
          name: location.name,
          description: location.description,
          image: location.image,
          generalRating: calculatedRating,
          amenities: location.amenities,
          noiseLevel: location.noiseLevel,
          seating: location.seating,
          maxOccupancy: location.maxOccupancy,
          featuredReview: location.featuredReview,
          active: false,
        });
        feature.setId(location.id);
        feature.setStyle(
          activeFeatureId === location.id ? styles.active : styles.inactive
        );
        return feature;
      });
    vectorSourceRef.current.addFeatures(newFeatures);
  }, [locationsData, filters, activeFeatureId, reviewsData]);

  const handleAddReview = (locationName, newReview) => {
    const reviewWithId = {
      ...newReview,
      id: `rev-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      date: new Date().toISOString(),
    };

    const updatedReviews = {
      ...reviewsRef.current,
      [locationName]: [
        ...(reviewsRef.current[locationName] || []),
        reviewWithId,
      ],
    };
    setReviewsData(updatedReviews);

    const newRating = calculateAverageRating(locationName);

    if (selectedSpace && selectedSpace.name === locationName) {
      setSelectedSpace((prev) => ({
        ...prev,
        reviews: updatedReviews[locationName],
        generalRating: newRating,
      }));
    }

    setLocationsData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        locations: prev.locations.map((loc) => {
          if (loc.name === locationName) {
            return {
              ...loc,
              generalRating: newRating,
            };
          }
          return loc;
        }),
      };
    });
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
    setClickCoordinates(null);
    vectorSourceRef.current.getFeatures().forEach((f) => {
      f.set("active", false);
      f.setStyle(styles.inactive);
    });
  };

  const handleAddLocation = (newLocation) => {
    setLocationsData((prev) => ({
      ...prev,
      locations: [...prev.locations, newLocation],
    }));

    if (newLocation.reviews && newLocation.reviews.length > 0) {
      const initialReview = newLocation.reviews[0];
      setReviewsData((prev) => ({
        ...prev,
        [newLocation.name]: [initialReview],
      }));
    }
  };

  const handleMapPickMode = () => {
    setAwaitingMapClick(true);
  };

  return (
    <>
      {showLoadingScreen && (
        <div className={`fixed inset-0 bg-white dark:bg-black z-1000 flex items-center justify-center text-black dark:text-white transition-opacity duration-1000 ${loading ? "opacity-100" : "opacity-0"}`}>
          <span className="text-2xl">Loading... </span>
        </div>
      )}

      <div ref={mapRef} className="absolute top-0 left-0 w-full h-full" />
      <ZoomControls mapInstance={mapInstance} />

      <button
        onClick={() => setShowMenu(true)}
        className="absolute top-4 left-4 bg-white dark:bg-black dark:text-white p-3 rounded-lg shadow-lg z-10 hover:bg-gray-100 dark:hover:bg-[#111111] transition-colors dark:border-[#333333] dark:border-2"
        aria-label="Add location"
      >
        <FaEdit size={20} className="text-black dark:text-white pl-1" />
      </button>

      <button
        onClick={toggleDarkMode}
        className="absolute bottom-4 left-4 bg-white dark:bg-black dark:text-white p-3 rounded-lg shadow-lg z-10 hover:bg-gray-100 dark:hover:bg-[#111111] transition-colors dark:border-[#333333] dark:border-2"
        aria-label="Toggle dark mode"
      >
        <FaMoon size={20} className="text-black dark:text-white pl-1" />
      </button>

      <button
        onClick={() => setShowFilters(!showFilters)}
        className="absolute top-4 left-18 bg-white dark:bg-black dark:text-white p-3 rounded-lg shadow-lg z-10 hover:bg-gray-100 dark:hover:bg-[#111111] transition-colors dark:border-[#333333] dark:border-2"
        aria-label="Toggle filters"
      >
        {showFilters ? (
          <FaTimes size={20} className="text-black dark:text-white" />
        ) : (
          <FaFilter size={20} className="text-black dark:text-white" />
        )}
      </button>

      {showFilters && <FilterPanel filters={filters} setFilters={setFilters} />}
      {showSidebar && (
        <Sidebar
          studySpace={selectedSpace}
          onClose={handleCloseSidebar}
          onAddReview={handleAddReview}
        />
      )}
      {showMenu && (
        <Menu
          onClose={handleCloseMenu}
          onAddLocation={handleAddLocation}
          initialCoordinates={clickCoordinates}
          onRequestMapClick={handleMapPickMode}
        />
      )}
    </>
  );
};

export default OpenLayersMap;
