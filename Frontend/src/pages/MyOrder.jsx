import React from "react";
import { useSelector } from "react-redux";
import { IoIosArrowBack } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import UserOrderCard from "../components/UserOrderCard";
import OwnerOrderCard from "../components/OwnerOrderCard";
import { useDispatch } from "react-redux";
import { useEffect } from "react";
import { setMyOrders } from "../redux/user.slice";
import { getSocket } from "../socket";
import { updateRealTimeOrderStatus } from "../redux/user.slice";

const MyOrder = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { userData, myOrders } = useSelector((state) => state.user);

  console.log("MyOrder userData:", userData);

  useEffect(() => {
    if (!userData) return;
    const socket = getSocket(userData._id);

    const handleNewOrder = (data) => {
      if (
        userData.role === "owner" &&
        Array.isArray(data?.shopOrder) &&
        data.shopOrder.some(
          (so) => String(so.owner?._id ?? so.owner) === String(userData._id)
        )
      ) {
        // Prevent duplicates using myOrders from state
        if (myOrders.some((o) => o._id === data._id)) return;
        dispatch(setMyOrders([data, ...myOrders]));
      }
    };

    socket.on("new-order", handleNewOrder);

socket.on("update-status", ({ orderId, shopId, status, userId }) => {
  console.log("Received update-status event:", {
    orderId,
    shopId,
    status,
    userId,
  });
  if (userData.role === "user" && String(userData._id) === String(userId._id)) {
    dispatch(updateRealTimeOrderStatus({ orderId, shopId, status }));
  }
});

    // socket.on("update-status", ({ orderId, shopId, status, userId }) => {
    //   if (userData.role === "user" && String(userData._id) === String(userId)) {
    //     dispatch(updateRealTimeOrderStatus({ orderId, shopId, status }));

    //   }
    // });

    return () => {
      socket.off("new-order", handleNewOrder);
      socket.off("update-status");
    };
  }, [userData, dispatch]);
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
              ) : null
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
