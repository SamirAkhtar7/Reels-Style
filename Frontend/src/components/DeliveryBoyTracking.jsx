import React from "react";
import scooter from "../assets/scooter.png";
import home from "../assets/home.png";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup,Polyline } from "react-leaflet";



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
  const deliveryBoyLat = data?.deliveryBoyLocation?.lat;
  const deliveryBoyLng = data?.deliveryBoyLocation?.lon;

  const customerLat = data?.deliveryAddress?.latitude;
  const customerLng = data?.deliveryAddress?.longitude;

  const path = [
    [deliveryBoyLat, deliveryBoyLng],
    [customerLat, customerLng]
  ]

  const center = [
    (deliveryBoyLat + customerLat) / 2,
    (deliveryBoyLng + customerLng) / 2
  ];

  return (
    <div className=" w-full h-[400px] mt-3 rounded-xl overflow-hidden shadow-md ">
      <MapContainer className={"w-full h-full"} center={center} zoom={13}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <Marker
          position={[deliveryBoyLat, deliveryBoyLng]}
          icon={deliveryBoyIcon}
        >
          <Popup>Delivery Boy
            <br />
            {data?.deliveryBoyName}
          </Popup>
        </Marker>
        <Marker
          position={[customerLat, customerLng]}
          icon={homeIcon}
        >
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
