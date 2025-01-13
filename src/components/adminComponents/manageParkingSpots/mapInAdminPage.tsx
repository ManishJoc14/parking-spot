"use client";

import React from "react";
import Map, { Marker, Popup } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";

interface MapProps {
  latitude: number;
  longitude: number;
  setLocation: (latitude: number, longitude: number) => void;
}

export default function MapInAdminPage({
  latitude,
  longitude,
  setLocation,
}: MapProps) {
  if (!latitude || !longitude) {
    return (
      <div className="relative w-full h-[70vh] bg-gray-300 animate-pulse"></div>
    );
  }

  return (
    <div className="relative w-full h-[70vh]">
      <Map
        initialViewState={{
          latitude: latitude,
          longitude: longitude,
          zoom: 15,
        }}
        style={{ width: "100%", height: "100%" }}
        mapStyle={`https://api.maptiler.com/maps/streets/style.json?key=${process.env.NEXT_PUBLIC_MAPTILER_API_KEY}`}
        onClick={(e) => {
          const [newLongitude, newLatitude] = e.lngLat.toArray();
          setLocation(newLatitude, newLongitude);
        }}
      >
        {/* Parking Marker */}
        <Marker
          latitude={latitude}
          longitude={longitude}
          draggable={true}
          onDragEnd={(e) => {
            const newLat = e.lngLat.lat;
            const newLng = e.lngLat.lng;
            setLocation(newLat, newLng);
          }}
        >
          <img
            src="https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png"
            alt="Parking Location"
            className="w-6 h-10"
          />
        </Marker>

        <Popup latitude={latitude} longitude={longitude} anchor="top">
          Your parking spot
        </Popup>
      </Map>
    </div>
  );
}
