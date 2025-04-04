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
import Sidebar from "./Sidebar"; // Import the Sidebar component

const OpenLayersMap = () => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const vectorLayerRef = useRef(null);
  const [locationsData, setLocationsData] = useState(null);
  const [selectedSpace, setSelectedSpace] = useState(null); // Track selected study space
  const [showSidebar, setShowSidebar] = useState(false); // Control sidebar visibility

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
      ],
      view: new View({
        center: [-7922441.18, 5211368.96],
        zoom: 16,
      }),
    });

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

    const vectorSource = new VectorSource();

    locationsData.locations.forEach((location) => {
      const feature = new Feature({
        geometry: new Point(location.coordinates),
        active: false,
        name: location.name,
        description: location.description,
        otherData: location.otherData,
        // Add all properties needed for the sidebar
        image: location.image,
        generalRating: location.generalRating,
        amenities: location.amenities,
        featuredReview: location.featuredReview,
      });

      feature.setId(location.id);
      feature.setStyle(styles.inactive);
      vectorSource.addFeature(feature);
    });

    const vectorLayer = new VectorLayer({
      source: vectorSource,
    });
    vectorLayerRef.current = vectorLayer;

    mapInstance.current.addLayer(vectorLayer);

    mapInstance.current.on("click", (event) => {
      const feature = mapInstance.current.forEachFeatureAtPixel(event.pixel, (feat) => {
        return feat;
      });

      if (feature) {
        vectorSource.getFeatures().forEach((f) => {
          if (f !== feature) {
            f.set("active", false);
            f.setStyle(styles.inactive);
          }
        });

        const isActive = feature.get("active");
        feature.set("active", !isActive);
        feature.setStyle(isActive ? styles.inactive : styles.active);

        if (!isActive) {
          // Show sidebar with the clicked feature's data
          setSelectedSpace({
            name: feature.get("name"),
            description: feature.get("description"),
            image: feature.get("image"),
            generalRating: feature.get("generalRating"),
            amenities: feature.get("amenities"),
            featuredReview: feature.get("featuredReview"),
            // Add any other properties you need
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

  const handleCloseSidebar = () => {
    setShowSidebar(false);
    // Reset all features to inactive
    if (vectorLayerRef.current) {
      const source = vectorLayerRef.current.getSource();
      source.getFeatures().forEach((f) => {
        f.set("active", false);
        f.setStyle(new Style({
          image: new Icon({
            anchor: [0.5, 1],
            src: "/marker.svg",
            scale: 0.05,
          }),
        }));
      });
    }
  };

  return (
    <>
      <div ref={mapRef} className="absolute top-0 left-0 w-full h-full" />
      {showSidebar && (
        <Sidebar 
          studySpace={selectedSpace} 
          onClose={handleCloseSidebar} 
        />
      )}
    </>
  );
};

export default OpenLayersMap;
