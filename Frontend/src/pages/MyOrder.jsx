import React from "react";
import { useSelector } from "react-redux";
import { IoIosArrowBack } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import UserOrderCard from "../components/UserOrderCard";
import OwnerOrderCard from "../components/OwnerOrderCard";

const MyOrder = () => {
  const navigate = useNavigate();
  const { userData, myOrders } = useSelector((state) => state.user);

  console.log("MyOrder userData:", userData);


  return (
    <div className="w-full min-h-screen bg-white flex justify-center p-6">
      <div className="relative w-full max-w-[800px] bg-gray-50 p-6 rounded-lg">
        <div className="flex items-center gap-4 mb-6">
          <div
            onClick={() => {
              navigate("/");
            }}
            className="absolute top-6 left-6 z-[10] mt-1 cursor-pointer"
          >
            <IoIosArrowBack size={25} className="text-[#ff4d2d]" />
          </div>
          <h1 className="text-2xl font-bold ml-10">My Order</h1>
        </div>

        <div className="space-y-6">
          {Array.isArray(myOrders) && myOrders.length > 0 ? (
            myOrders.map((order, index) =>
              userData?.role === "owner" ? (
                <OwnerOrderCard key={order._id ?? index} order={order} />
              ) : userData?.role === "user" ? (
                <UserOrderCard key={order._id ?? index} order={order} />
              ) :null
            )
          ) : (
            <div className="text-center text-gray-600 py-8">
              No orders found
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyOrder;
