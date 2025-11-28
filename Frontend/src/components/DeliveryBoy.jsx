import React, { useEffect, useState } from "react";
import Navbar from "./Navbar";
import { useSelector } from "react-redux";
import axios from "../config/axios";
import { useNavigate } from "react-router-dom";
import DeliveryBoyTracking from "./DeliveryBoyTracking";
import { getSocket } from "../socket";
import {
  Bar,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { BarChart } from "recharts";

const DeliveryBoy = () => {
  const navigate = useNavigate();
  const userData = useSelector((state) => state?.user?.userData);
  const storedSocket = useSelector((state) => state?.user?.socket);
  const [availableAssignments, setAvailableAssignments] = useState(null);
  const [currentOrders, setCurrentOrders] = useState(null);
  const [liveLocation, setLiveLocation] = useState([]);
  const [todayDeliveries, setTodayDeliveries] = useState([]);
  const [showOtpBox, setShowOtpBox] = useState(false);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  console.log("DeliveryBoy userData:", userData);
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
    setmessage("");
    setLoading(true);
    try {
      console.log("Sending OTP for order:", currentOrders);
      const response = await axios.post(
        `/api/order/send-delivery-otp`,
        {
          orderId: currentOrders._id,
          shopOrderId: currentOrders.shopOrder._id,
        },
        { withCredentials: true }
      );

      setShowOtpBox(true);
      setLoading(false);
      //console.log("Order accepted:", response.data);
      console.log(response.data.message);
      setMessage(response.data.message || "OTP sent successfully");
    } catch (err) {
      console.error("Error in accepting order:", err);
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    setMessage("");
    setLoading(true);
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
      setLoading(false);
      setMessage(response.data.message || "OTP verified successfully");
      // refresh data
      await getCurrentOrder();
      await getAssignments();
      location.reload();
      // alert(response.data.message || "OTP verified successfully");
    } catch (err) {
      const payload = err?.response?.data ?? err;
      console.error("Verify OTP error:", payload);
      alert(payload?.message || "Failed to verify OTP. Please try again.");
      setLoading(false);
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

  const handleTodayDeliveries = async () => {
    try {
      const response = await axios.post(
        `/api/order/get-today-deliveries`,
        {},
        { withCredentials: true }
      );
      console.log("Today's Deliveries:", response.data);
      // backend returns { deliveredCount: [...] }
      setTodayDeliveries(response.data?.deliveredCount || []);
    } catch (err) {
      console.error("Error in fetching today's deliveries:", err);
    }
  };

  useEffect(() => {
    if (!userData) return;

    // Prefer an existing stored socket instance if available, otherwise create one
    const s = storedSocket || getSocket(userData._id);

    // tell server who we are (so server can persist socketId)
    try {
      s.emit("identify", { userId: userData._id });
    } catch (e) {
      console.warn("identify emit failed:", e);
    }

    const assignmentHandler = (data) => {
      console.log("Received new-delivery-assignment event:", data);
      if (String(data.sentTo) === String(userData._id)) {
        setAvailableAssignments((prev) => [...(prev || []), data]);
      }
    };

    s.on("new-delivery-assignment", assignmentHandler);

    // geolocation watch for delivery users — emit update-location to server
    let watchId = null;
    if (userData.role === "foodDelivery" && navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLiveLocation(
            //   (prev) => ({
            //   ...prev,
            //   [String(userData._id)]:
            //   {
            { lat: latitude, lng: longitude }
            //   },
            // })
          );
          try {
            s.emit("update-location", {
              userId: userData._id,
              latitude,
              longitude,
            });
            console.log("Emitted location:", { latitude, longitude });
          } catch (emitErr) {
            console.warn("Failed to emit update-location:", emitErr);
          }
        },
        (error) => {
          console.error("Error getting location:", error);
        },
        { enableHighAccuracy: true }
      );
    }

    return () => {
      try {
        s.off("new-delivery-assignment", assignmentHandler);
      } catch (e) {
        // ignore
      }
      if (watchId && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [userData, storedSocket]);

  const ratePerDelivery = import.meta.env.VITE_DELIVERY_CHARGE || 23; // Example rate per delivery
  const totalEarning = todayDeliveries.reduce(
    (sum, entry) => sum + (entry.count || 0) * ratePerDelivery,
    0
  );

  useEffect(() => {
    getAssignments();
    getCurrentOrder();
    handleTodayDeliveries();
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
            {liveLocation.lat},
            <span className="font-semibold"> longitude: </span>
            {liveLocation.lng}
          </p>
        </div>

        <div className="bg-white rounded 2xl shadow-md p-5 w-[80%] mb-6 border border-orange-100">
          <h1 className="text-lg font-bold mb-3 text-[#ff4d2d]">
            Today Deliveries
          </h1>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart
              data={Array.isArray(todayDeliveries) ? todayDeliveries : []}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" tickFormatter={(h) => `${h}:00`} />
              <YAxis allowDecimals={false} />
              <Tooltip
                formatter={(value) => value}
                labelFormatter={(label) => `${label}:00`}
              />
              <Bar dataKey="count" fill="#ff4d2d" />
            </BarChart>
          </ResponsiveContainer>

          <div className="max-w-sm mx-auto mt-6 p-6 bg-white rounded-2xl shadow-lg text-center">
            <h1 className=" text-xl font-semibold text-gray-800 mb-2">
              Today's Earning
            </h1>
            <p className="text-2xl font-bold text-green-600">
              ₹ {totalEarning}
            </p>
          </div>
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
                    deliveryBoyLocation: {
                      lat: liveLocation[String(userData._id)]?.lat || dbLat,
                      lng: liveLocation[String(userData._id)]?.lng || dbLng,
                    },
                  }}
                />
              );
            })()}

            {!showOtpBox ? (
              <button
                onClick={sendOtp}
                disabled={loading}
                className="mt-3 w-full bg-green-500 font-semibold py-2 px-4 rounded-xl shadow-md hover:bg-green-600 text-white active:scale-95 transition-transform duration-200"
              >
                {loading ? "loading..." : "Mark as Delivered"}
              </button>
            ) : (
              <div className="mt-4 p-4 border rounded-xl bg-gray-50">
                {message && (
                  <p className="mb-2 text-green-600 font-semibold">{message}</p>
                )}
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
                  disabled={loading}
                  className="mt-3 w-full bg-green-500 font-semibold py-2 px-4 rounded-xl shadow-md hover:bg-green-600 text-white active:scale-95 transition-transform duration-200"
                >
                  {loading ? "loading..." : "confirm Delivery"}
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
