import React, { useEffect } from "react";
import Navbar from "./Navbar";
import { useSelector } from "react-redux";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const DeliveryBoy = () => {
  const navigate = useNavigate();
  const userData = useSelector((state) => state?.user?.userData);

  const getAssignments = async () => {
    if (!userData) return; // wait until auth is ready
    try {
      const response = await axios.get("/api/order/get-assigned-orders", {
        withCredentials: true,
      });
      console.log("DeliveryBoy assignments:", response.data);
    } catch (err) {
      console.error(
        "Error in fetching assignments:",
        err?.response?.data ?? err.message
      );
      if (err?.response?.status === 401) navigate("/login");
    }
  };

  useEffect(() => {
    getAssignments();
  }, [userData]);

  return (
    <div>
      <Navbar />
      <div className="w-screen h-[80vw] flex items-center justify-center bg-gray-50 gap-2 overflow-y-auto">
        <div className="bg-white rounded-2xl text-center shadow-md p-5 flex flex-col justify-start items-center w-[90%] border border-orange-100">
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
      </div>
    </div>
  );
};

export default DeliveryBoy;
