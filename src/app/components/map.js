"use client";

import React, { useEffect, useRef } from "react";
import "ol/ol.css";
import { Map, View } from "ol";
import TileLayer from "ol/layer/Tile";
import XYZ from "ol/source/XYZ";
import { fromLonLat } from "ol/proj";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import Style from "ol/style/Style";
import Icon from "ol/style/Icon";
import Select from "ol/interaction/Select";
import { click } from "ol/events/condition";

const OpenLayersMap = () => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const vectorLayerRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

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

    // List of points (lon, lat in EPSG:3857)
    const points = [
      [-7922674.95, 5211429.20], // O'Neill Library
      [-7922600.00, 5211350.00], // Gasson Hall
      [-7922750.00, 5211500.00], // Stokes Hall
    ];

    // Define styles
    const styles = {
      active: new Style({
        image: new Icon({
          anchor: [0.5, 1],
          src: "/marker_red.svg", // Active marker
          scale: 0.1,
        }),
      }),
      inactive: new Style({
        image: new Icon({
          anchor: [0.5, 1],
          src: "/marker.svg", // Inactive marker
          scale: 0.1,
        }),
      }),
    };

    // Create vector source and features
    const vectorSource = new VectorSource();
    
    points.forEach((coords, index) => {
      const feature = new Feature({
        geometry: new Point(coords),
        active: false, // Default state
      });

      feature.setId(index); // Assign an ID for reference
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

    // Click handler to toggle active/inactive state
    const toggleFeatureState = (feature) => {
      if (!feature) return;

      // Toggle active state
      const isActive = feature.get("active");
      feature.set("active", !isActive);

      // Update style based on state
      feature.setStyle(isActive ? styles.inactive : styles.active);
    };

    // Add select interaction
    const select = new Select({
      condition: click,
      layers: [vectorLayer],
    });

    select.on("select", (e) => {
      if (e.selected.length > 0) {
        toggleFeatureState(e.selected[0]);
      }
    });

    mapInstance.current.addInteraction(select);

    return () => {
      mapInstance.current.setTarget(null);
    };
  }, []);

  return <div ref={mapRef} className="absolute top-0 left-0 w-full h-full" />;
};

export default OpenLayersMap;