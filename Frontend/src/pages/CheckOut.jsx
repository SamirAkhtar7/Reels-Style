import React from "react";
import { IoIosArrowBack } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import { IoLocationSharp } from "react-icons/io5";
import { IoSearchOutline } from "react-icons/io5";
import { TbCurrentLocation } from "react-icons/tb";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useState, useEffect } from "react";
import { useMap } from "react-leaflet/hooks";
import { setLocation, setDeliveryAddress } from "../redux/mapSlice";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import axios from "axios";


const RecenterMap = ({ latitude, longitude }) => {
  if (!latitude || !longitude) return;
  const map = useMap();
  map.setView({ lat: latitude, lng: longitude }, map.getZoom(), {
    animate: true,
  });

  return null;
};

const CheckOut = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { location, deliveryAddress } = useSelector((state) => state.map);
  const [addressInput, setAddressInput] = useState("");

  useEffect(() => {
    setAddressInput(deliveryAddress || "");
  }, [ deliveryAddress]);

  const onDragEnd = (event) => {
    console.log("marker drag end", event.target._latlng);
    const { lat, lng } = event.target._latlng;

    dispatch(setLocation({ latitude: lat, longitude: lng }));
    getAddressBylatlng(lat, lng);
  };

  const getAddressBylatlng = async (lat, lng) => {
    try {
      const result = await axios.get(
        `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lng}&apiKey=${
          import.meta.env.VITE_GEOAPIKEY
        }`
      );
      const addressData = `${result?.data?.features[0].properties.address_line1}, ${result?.data?.features[0].properties.address_line2}`;
      dispatch(setDeliveryAddress(addressData));
    } catch (error) {
      console.error("Error fetching address:", error);
    }
  };

  const getCurrentLocation = ()=>{
   navigator.geolocation.getCurrentPosition(async(position) => {
        const {latitude,longitude} = position.coords;
       dispatch(setLocation({ latitude, longitude }))
        getAddressBylatlng(latitude,longitude);
    })
  }

    const getLatlngByAdddress = async ()=> {
    try {
        const result =await axios.get(`https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(addressInput)}&apiKey=${import.meta.env.VITE_GEOAPIKEY}`)
        console.log("Latlng Data:", result?.data);
        const lat = result?.data?.features[0]?.properties.lat;
        const lng = result?.data?.features[0]?.properties.lon;
        dispatch(setLocation({ latitude: lat, longitude: lng }));
        dispatch(setDeliveryAddress(addressInput));
       
      
    }
    catch (error) { 
        console.error("Error fetching latlng by address:", error);
    }
  }
    

    
  // use numeric latitude/longitude from your map slice (latitude / longitude)
  const hasCoords =
    location &&
    typeof location.latitude === "number" &&
    typeof location.longitude === "number";
  const center = hasCoords
    ? [location.latitude, location.longitude]
    : [20.5937, 78.9629]; // fallback center (India) or choose your default

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-800 flex items-center justify-center p-6 ">
      <div
        onClick={() => {
          navigate("/cart");
        }}
        className="absolute top-0 left-[10px] z-[10] mt-1 "
      >
        <IoIosArrowBack size={25} className="text-[#ff4d2d]" />
      </div>

      <div className="w-full max-w-[900px] bg-white flex flex-col gap-4 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl shadow-lg p-8 mt-6 mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          Checkout
        </h1>

        <section>
          <h2 className="text-lg font-semibold mb-2 flex items-center gap-2 text-gray-800">
            <IoLocationSharp size={20} className="text-[#ff4d2d]" />
            Delivery Details
          </h2>
          <div className="flex gap-2 mb-3">
            <input
              value={addressInput}
              onChange={(e) => setAddressInput(e.target.value)}
              placeholder="Enter your address..."
              className="flex-1 border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff4d2d]"
              type="text"
            />
            <button onClick={getLatlngByAdddress} className="bg-[#ff4d2d] hover:bg-[#e64525]  px-3 py-2 rounded-lg text-white flex items-center justify-center">
              <IoSearchOutline size={20} />
            </button>
            <button
              onClick={getCurrentLocation}
              className="bg-blue-500 hover:bg-blue-600 px-3 py-2 rounded-lg text-white flex items-center justify-center"
            >
              <TbCurrentLocation size={20} />
            </button>
          </div>
          <div className="rounded-2xl border overflow-hidden">
            <div className="h-64 w-full flex items-center justify-center">
              {hasCoords ? (
                <MapContainer
                  center={center}
                  className="w-full h-full"
                  zoom={13}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="&copy; OpenStreetMap contributors"
                  />
                  <RecenterMap
                    latitude={location.latitude}
                    longitude={location.longitude}
                  />
                  <Marker
                    position={center}
                    draggable
                    eventHandlers={{ dragend: onDragEnd }}
                  >
                    <Popup>{deliveryAddress ?? "Selected location"}</Popup>
                  </Marker>
                </MapContainer>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-sm text-gray-500">
                  No location selected
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default CheckOut;
