import React, { useEffect, useState } from "react";
import Navbar from "./Navbar";
import { useSelector } from "react-redux";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import DeliveryBoyTracking from "./DeliveryBoyTracking";
import { getSocket } from "../socket";

const DeliveryBoy = () => {
  const navigate = useNavigate();
  const userData = useSelector((state) => state?.user?.userData);
  const socket = useSelector((state) => state?.user?.userData.socketId); // Assuming the socket instance is stored in state.socket
  const [availableAssignments, setAvailableAssignments] = useState(null);
  const [currentOrders, setCurrentOrders] = useState(null);
  const [showOtpBox, setShowOtpBox] = useState(false);
  const [otp, setOtp] = useState("");

  // console.log("DeliveryBoy userData:", socket);
  const getAssignments = async () => {
    if (!userData) return; // wait until auth is ready
    try {
      const response = await axios.get("/api/order/get-assigned-orders", {
        withCredentials: true,
      });
      setAvailableAssignments(response.data);
      console.log("DeliveryBoy assignments:", response.data);
    } catch (err) {
      console.error(
        "Error in fetching Get assignments :",
        err?.response?.data ?? err.message
      );
      if (err?.response?.status === 401) navigate("/login");
    }
  };

  const acceptOrder = async (assignmentId) => {
    try {
      const response = await axios.get(
        `/api/order/accept-order/${assignmentId}`,
        {
          withCredentials: true,
        }
      );
      //console.log("Order accepted:", response.data);
      await getCurrentOrder();
    } catch (err) {
      console.error("Error in accepting order:", err);
    }
  };

  const sendOtp = async () => {
    try {
      const response = await axios.post(
        `/api/order/send-delivery-otp`,
        {
          orderId: currentOrders._id,
          shopOrderId: currentOrders.shopOrder._id,
        },
        { withCredentials: true }
      );
      setShowOtpBox(true);
      //console.log("Order accepted:", response.data);
      console.log(response.data.message);
    } catch (err) {
      console.error("Error in accepting order:", err);
    }
  };

  const verifyOtp = async () => {
    // basic validation
    const entered = (otp || "").toString().trim();
    if (!entered || entered.length < 4 || !/^\d{4,6}$/.test(entered)) {
      return alert("Please enter a valid OTP (4-6 digits).");
    }

    try {
      const response = await axios.post(
        `/api/order/verify-delivery-otp`,
        {
          orderId: currentOrders._id,
          shopOrderId: currentOrders.shopOrder._id,
          otp: entered,
        },
        { withCredentials: true }
      );

      console.log("Verify OTP:", response.data.message);
      // success UI updates
      setShowOtpBox(false);
      setOtp("");
      // refresh data
      await getCurrentOrder();
      await getAssignments();
      alert(response.data.message || "Delivery confirmed");
    } catch (err) {
      const payload = err?.response?.data ?? err;
      console.error("Verify OTP error:", payload);
      alert(payload?.message || "Failed to verify OTP. Please try again.");
    }
  };

  const getCurrentOrder = async () => {
    try {
      const response = await axios.get(`/api/order/get-current-orders`, {
        withCredentials: true,
      });
      console.log("Current Orders:", response.data);
      setCurrentOrders(response.data);
    } catch (err) {
      console.error("Error in fetching current orders:", err);
    }
  };

  useEffect(() => {
     if (!userData) return;
    const socket = getSocket(userData._id);
    console.log("Socket in DeliveryBoy:", socket);
    if (socket) {
      socket.on("new-delivery-assignment", (data) => {
        console.log("Received new-delivery-assignment event:", data);
        if (data.sentTo === userData._id) {
          console.log("New assignment received:", data);
          setAvailableAssignments((prev) => [...(prev || []), data]);
        }
      });

      return () => {
        socket.off("new-assignment");
      };
    }
  }, [socket]);

  useEffect(() => {
    getAssignments();
   getCurrentOrder();
  }, [userData]);

  return (
    <div>
      <Navbar />
      <div className="w-full flex items-center justify-center flex-col bg-gray-50 gap-2 overflow-y-auto mt-5">
        <div className="bg-white rounded-2xl text-center shadow-md p-5 flex flex-col justify-start items-center w-[80%] border border-orange-100">
          <h1 className="text-xl font-bold text-[#ff4d2d] ">
            Welcome, {userData?.fullName}
          </h1>
          <p className="text-[#ff4d2d] ">
            <span className="font-semibold"> latitude: </span>
            {userData?.location?.coordinates?.[1] ?? "N/A"},
            <span className="font-semibold"> longitude: </span>
            {userData?.location?.coordinates?.[0] ?? "N/A"}
          </p>
        </div>

        {/*  AvailableAssignments */}

        {!currentOrders && (
          <div className="bg-white rounded-2xl p-5 shadow-md w-[80%] border border-orange-100 ">
            <h1 className="text-xl font-bold mb-4 flex items-center gap-2">
              {" "}
              Availble Orders{" "}
            </h1>

            <div className="space-y-4">
              {availableAssignments && availableAssignments.length > 0 ? (
                availableAssignments.map((assignment, index) => (
                  <div
                    className="border rounded-lg p-4 flex justify-between items-center "
                    key={index}
                  >
                    <div>
                      <p className="text-sm font-semibold">
                        {assignment?.shopName}
                      </p>
                      <p className="text-sm text-gray-500">
                        <span className="font-semibold">
                          Delivery Address :
                        </span>
                        {assignment?.deliveryAddress.text}
                      </p>
                      <p className="text-xs text-gray-400">
                        {assignment.items.length}
                        items | ₹{assignment?.subtotal}
                      </p>
                    </div>

                    <button
                      onClick={() => acceptOrder(assignment.assignmentId)}
                      className="bg-orange-500 text-white px-4 py-1 rounded-lg text-sm hover:bg-orange-600 "
                    >
                      Accept
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 ">
                  No available orders at the moment.
                </p>
              )}
            </div>
          </div>
        )}

        {currentOrders && (
          <div className="bg-white rounded-2xl p-5 shadow-md w-[80%] border border-orange-100 ">
            <h2 className="text-lg font-bold mb-3 ">📦 Current Order</h2>

            <div className="border rounded-lg p-4 mb-3 ">
              <p className=" font-semibold text-sm ">
                {currentOrders.shopOrder?.Shop?.name}
              </p>
              <p className="text-sm text-gray-500">
                {currentOrders?.deliveryAddress?.text}
              </p>
              <p className="text-xs text-gray-400">
                {currentOrders?.shopOrder?.shopOrderItems.length} items | ₹
                {currentOrders?.shopOrder?.subtotal}
              </p>
            </div>

            {(() => {
              // build the exact shape DeliveryBoyTracking expects
              const deliveryAddrLat = Number.parseFloat(
                currentOrders?.deliveryAddress?.latitude
              );
              const deliveryAddrLng = Number.parseFloat(
                currentOrders?.deliveryAddress?.longitude
              );

              // primary source: backend-provided deliveryBoyLocation (lat/lon)
              let dbLat = Number.parseFloat(
                currentOrders?.deliveryBoyLocation?.lat
              );
              let dbLng = Number.parseFloat(
                currentOrders?.deliveryBoyLocation?.lon
              );

              // fallback: populated assignedDeliveryBoy on shopOrder subdoc
              if (!Number.isFinite(dbLat) || !Number.isFinite(dbLng)) {
                const assigned =
                  currentOrders?.shopOrder?.assignedDeliveryBoy ??
                  currentOrders?.shopOrder?.[0]?.assignedDeliveryBoy;
                const coords = assigned?.location?.coordinates;
                dbLng = Number.parseFloat(coords?.[0]);
                dbLat = Number.parseFloat(coords?.[1]);
              }

              const hasCoords =
                Number.isFinite(deliveryAddrLat) &&
                Number.isFinite(deliveryAddrLng) &&
                Number.isFinite(dbLat) &&
                Number.isFinite(dbLng);

              if (!hasCoords) {
                return (
                  <p className="text-sm text-gray-500">
                    Tracking unavailable — missing or invalid location data
                  </p>
                );
              }

              return (
                <DeliveryBoyTracking
                  data={{
                    deliveryAddress: {
                      lat: deliveryAddrLat,
                      lng: deliveryAddrLng,
                    },
                    deliveryBoyLocation: { lat: dbLat, lng: dbLng },
                  }}
                />
              );
            })()}

            {!showOtpBox ? (
              <button
                onClick={sendOtp}
                className="mt-3 w-full bg-green-500 font-semibold py-2 px-4 rounded-xl shadow-md hover:bg-green-600 text-white active:scale-95 transition-transform duration-200"
              >
                Mark as Delivered
              </button>
            ) : (
              <div className="mt-4 p-4 border rounded-xl bg-gray-50">
                <p>Enter OTP to confirm delivery:</p>
                <input
                  onChange={(e) => {
                    setOtp(e.target.value);
                  }}
                  type="text"
                  placeholder="Enter OTP"
                  className="mt-2 w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
                <button
                  onClick={verifyOtp}
                  className="mt-3 w-full bg-green-500 font-semibold py-2 px-4 rounded-xl shadow-md hover:bg-green-600 text-white active:scale-95 transition-transform duration-200"
                >
                  Confirm Delivery
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DeliveryBoy;
