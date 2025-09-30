import React from "react";
import { IoIosArrowBack } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import { IoLocationSharp } from "react-icons/io5";
import { IoSearchOutline } from "react-icons/io5";
import { TbCurrentLocation } from "react-icons/tb";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useState, useEffect } from "react";
import { useMap } from "react-leaflet";
import { setLocation, setDeliveryAddress } from "../redux/mapSlice";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { MdDeliveryDining } from "react-icons/md";
import axios from "axios";
import { FaMobileScreenButton, FaCreditCard } from "react-icons/fa6";

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
  const {cartItems,totalAmount} = useSelector((state) => state.user)
  const [addressInput, setAddressInput] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("COD");
   
    const deliveryCharge = totalAmount >= 500 ? 0 : 40; ; // Fixed delivery charge
    const AmountPayable = totalAmount + deliveryCharge;

  useEffect(() => {
    setAddressInput(deliveryAddress || "");
  }, [deliveryAddress]);

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

  const getCurrentLocation = () => {
    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      dispatch(setLocation({ latitude, longitude }));
      getAddressBylatlng(latitude, longitude);
    });
  };

  const getLatlngByAdddress = async () => {
    try {
      const result = await axios.get(
        `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(
          addressInput
        )}&apiKey=${import.meta.env.VITE_GEOAPIKEY}`
      );
      console.log("Latlng Data:", result?.data);
      const lat = result?.data?.features[0]?.properties.lat;
      const lng = result?.data?.features[0]?.properties.lon;
      dispatch(setLocation({ latitude: lat, longitude: lng }));
      dispatch(setDeliveryAddress(addressInput));
    } catch (error) {
      console.error("Error fetching latlng by address:", error);
    }
  };

  // use numeric latitude/longitude from your map slice (latitude / longitude)
  const hasCoords =
    location &&
    typeof location.latitude === "number" &&
    typeof location.longitude === "number";
  const center = hasCoords
    ? [location.latitude, location.longitude]
    : [20.5937, 78.9629]; // fallback center (India) or choose your default

  return (
    <div className=" min-h-screen bg-slate-100 dark:bg-slate-800 flex items-center justify-center p-6 ">
      <div className=" relative w-full max-w-[900px] bg-white flex flex-col gap-4 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl shadow-lg p-8 mt-6 mx-auto space-y-6">
        <div
          onClick={() => {
            navigate("/cart");
          }}
          className="absolute top-8 left-[10px] z-[10] mt-1 "
        >
          <IoIosArrowBack size={25} className="text-[#ff4d2d]" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 ml-2 dark:text-white">
          Checkout
        </h1>

        {/* Delivery Details */}

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
            <button
              onClick={getLatlngByAdddress}
              className="bg-[#ff4d2d] hover:bg-[#e64525]  px-3 py-2 rounded-lg text-white flex items-center justify-center"
            >
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

        {/* // Payment Method */}
        <section>
          <h2 className="text-lg font-semibold mb-2  text-gray-800">
            Payment Method
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
              className={`flex items-center gap-3 rounded-xl border p-4 text-left transition ${
                paymentMethod === "COD"
                  ? "border-[#ff4d2d] bg-[#ff4d2d]/10"
                  : "border-gray-300 hover:border-gray-400 dark:border-slate-700 dark:hover:border-slate-600 cursor-pointer"
              }`}
              onClick={() => setPaymentMethod("COD")}
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 ">
                <MdDeliveryDining className="text-green-600 text-xl" />
              </span>
              <div>
                <p className="font-medium text-gray-800">
                  Cash on Delivery (COD)
                </p>
                <p className="text-xs text-gray-500">
                  Pay when your food arrives
                </p>
              </div>
            </div>
            <div
              className={`flex items-center gap-3 rounded-xl border p-4 text-left transition ${
                paymentMethod === "Online Payment"
                  ? "border-[#ff4d2d] bg-[#ff4d2d]/10"
                  : "border-gray-300 hover:border-gray-400 dark:border-slate-700 dark:hover:border-slate-600 cursor-pointer"
              }`}
              onClick={() => setPaymentMethod("Online Payment")}
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                <FaMobileScreenButton className="text-purple-700 text-xl" />
              </span>
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                <FaCreditCard className="text-blue-700 text-xl" />
              </span>

              <div className="ml-3">
                <p className="font-medium text-gray-800">Online Payment</p>
                <p className="text-xs text-gray-500">Pay with card or UPI</p>
              </div>
            </div>
          </div>
        </section>

        {/* // Order Summary */}
        <section>
          <h2 className="text-lg font-semibold mb-2  text-gray-800">
            Order Summary
          </h2>

          <div className="space-y-4 rounded-xl border bg-gray-50 p-4">
            {cartItems.map((item, index) => (
              <div key={index} className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-gray-800">
                    {item.name} x {item.quantity}
                  </p>
                  <p className="text-sm text-gray-500">
                    ₹{item.price * item.quantity}
                  </p>
                </div>
                <p className="font-medium text-gray-800">
                  ₹{item.price * item.quantity}
                </p>
              </div>
            ))}
            <div className="border-t pt-4 flex justify-between items-center">
              <p className="font-semibold text-gray-800">Subtotal</p>
              <p className="font-semibold text-gray-800">₹{totalAmount}</p>
            </div>
            <div className="flex justify-between items-center">
              <p className="font-semibold text-gray-800">Delivery Charge</p>
              <p className="font-semibold text-gray-800">
                ₹{deliveryCharge == 0 ? "Free" : deliveryCharge}
              </p>
            </div>
            <div className="border-t pt-4 flex justify-between items-center">
              <p className="font-bold text-lg text-gray-800">Total Amount</p>
              <p className="font-bold text-lg text-gray-800">
                ₹{AmountPayable}
              </p>
            </div>
            <div>
              <button
                
                className="w-full bg-[#ff4d2d] text-white p-3 rounded-xl font-semibold"
              >
               { paymentMethod === "COD" ? "Place Order" : "Pay Now"}
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default CheckOut;
