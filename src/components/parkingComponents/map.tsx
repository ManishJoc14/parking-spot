"use client";

import React, { useState } from "react";
import Map, { Marker, Popup, ScaleControl } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import ParkingCard from "./parking-card";
import { ParkingLocation, ParkingDetailed } from "@/types/definitions";
import { v4 as uuidv4 } from "uuid";

interface MapProps {
  uuid: string | undefined;
  parking: ParkingLocation[] | ParkingDetailed[];
  userPosition: [number, number] | undefined;
}

export default function MapComponent({
  uuid,
  parking,
  userPosition,
}: MapProps) {
  if (!userPosition) return null;

  const [selectedParking, setSelectedParking] = useState<
    ParkingLocation | ParkingDetailed | null
  >(null);

  return (
    <div className="relative w-full h-full">
      <Map
        initialViewState={{
          latitude: userPosition[0],
          longitude: userPosition[1],
          zoom: 15,
        }}
        style={{ width: "100%", height: "100%" }}
        mapStyle={`https://api.maptiler.com/maps/streets/style.json?key=${process.env.NEXT_PUBLIC_MAPTILER_API_KEY}`}
      >
        {/* User Marker */}
        <Marker latitude={userPosition[0]} longitude={userPosition[1]}>
          <img
            src="https://cdn-icons-png.flaticon.com/512/1077/1077012.png"
            alt="User Location"
            className="w-8 h-8"
          />
        </Marker>

        {/* Parking Markers */}
        {parking.map((location, index) => (
          <Marker
            key={uuidv4()}
            latitude={location.latitude}
            longitude={location.longitude}
            onClick={(e) => {
              e.originalEvent.stopPropagation(); // Prevent popup close when marker is clicked
              setSelectedParking(location);
            }}
          >
            <img
              src="https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png"
              alt="Parking Location"
              className="w-6 h-10"
            />
          </Marker>
        ))}

        {/* Parking Popup */}
        {selectedParking && (
          <Popup
            latitude={selectedParking.latitude}
            longitude={selectedParking.longitude}
            onClose={() => setSelectedParking(null)}
            closeOnClick={false}
            anchor="top"
          >
            <ParkingCard id={uuid} parking={selectedParking} />
          </Popup>
        )}
        <ScaleControl />
      </Map>
    </div>
  );
}
