import React from "react";
import { useSelector } from "react-redux";
import scooter from "../assets/scooter.png";
import home from "../assets/home.png";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
} from "react-leaflet";

const deliveryBoyIcon = new L.Icon({
  iconUrl: scooter,
  iconSize: [35, 35],
  iconAnchor: [17, 35],
});

const homeIcon = new L.Icon({
  iconUrl: home,
  iconSize: [35, 35],
  iconAnchor: [17, 35],
});

const DeliveryBoyTracking = ({ data }) => {
  console.log("DeliveryBoyTracking data:", data);
  const userData = useSelector((state) => state?.user?.userData);
  const deliveryLat = Number.parseFloat(data?.deliveryAddress?.lat);
  const deliveryLng = Number.parseFloat(data?.deliveryAddress?.lng);
  const dbLat = data?.deliveryBoyLocation?.lat;
  const dbLng = data?.deliveryBoyLocation?.lng;

  const valid =
    Number.isFinite(deliveryLat) &&
    Number.isFinite(deliveryLng) &&
    Number.isFinite(dbLat) &&
    Number.isFinite(dbLng);

  if (!valid) {
    return (
      <div className="p-4 text-sm text-gray-500">
        Tracking unavailable — missing or invalid location data
      </div>
    );
  }

  const path = [
    [deliveryLat, deliveryLng],
    [dbLat, dbLng],
  ];

  const center = [deliveryLat, deliveryLng];

  return (
    <div className=" w-full h-[400px] mt-3 rounded-xl overflow-hidden shadow-md ">
      <MapContainer className={"w-full h-full"} center={center} zoom={13}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <Marker position={[dbLat, dbLng]} icon={deliveryBoyIcon}>
          <Popup>
            Delivery Boy
            <br />
            {data?.deliveryBoyName}
          </Popup>
        </Marker>
        <Marker position={[deliveryLat, deliveryLng]} icon={homeIcon}>
          <Popup>
            Customer Location
            <br />
            {data?.deliveryAddress?.text}
          </Popup>
        </Marker>

        <Polyline positions={path} color="blue" size={4} />
      </MapContainer>
    </div>
  );
};

export default DeliveryBoyTracking;
