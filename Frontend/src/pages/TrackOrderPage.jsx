import axios from "axios";
import React, { useEffect, useState } from "react";
import { IoIosArrowRoundBack } from "react-icons/io";
import { useParams } from "react-router-dom";
import DeliveryBoyTracking from "../components/DeliveryBoyTracking";

const TrackOrderPage = () => {
  const { orderId } = useParams();

  const [currentOrder, setCurrentOrder] = useState(null);
  const [deliveryBoyLocation, setDeliveryBoyLocation] = useState(null);

  const handleGetOrder = async () => {
    try {
      const response = await axios.get(
        `/api/order/get-order-by-id/${orderId}`,
        { withCredentials: true }
      );
      console.log("Order details:", response.data);
      setCurrentOrder(response.data);
    } catch (err) {
      return console.error(err);
    }
  };
  useEffect(() => {
    handleGetOrder();
  }, [orderId]);

  return (
    <div className=" max-w-4xl mx-auto p-4 flex flex-col">
      <div className=" flex  top-6 left-6 z-[10] mt-1 items-center gap-4 mb-6">
        <IoIosArrowRoundBack
          size={45}
          className="text-[#ff4d2d] cursor-pointer"
          onClick={() => window.history.back()}
        />
        <h1 className="text-2xl font-bold mb:text-center">Track Order</h1>
      </div>

      {currentOrder?.order?.shopOrder?.map((shopOrderData, index) => {
        const shopId = shopOrderData?._id ?? shopOrderData?.Shop?._id ?? index;
        const shopName = shopOrderData?.Shop?.name ?? "Shop";

        // safe references to assigned delivery boy and coords
        const assignedDB = shopOrderData?.assignedDeliveryBoy ?? null;

        const dbCoords = assignedDB?.location?.coordinates;
        const dbLng = Number.parseFloat(dbCoords?.[0]);
        const dbLat = Number.parseFloat(dbCoords?.[1]);

        const deliveryAddrLat = Number.parseFloat(
          currentOrder?.order?.deliveryAddress?.latitude
        );
        const deliveryAddrLng = Number.parseFloat(
          currentOrder?.order?.deliveryAddress?.longitude
        );

        return (
          <div
            key={shopId}
            className="bg-white p-4 rounded-2xl shadow-md border border-black space-y-4 mt-6"
          >
            <h3 className="font-bold text-lg mb-2 text-[#ff4d2d]">
              {shopName}
            </h3>
            <p className="text-md font-semibold mb-2 ">
              <span>Item:</span>
              {(shopOrderData?.shopOrderItems || [])
                .map((it) => it?.name ?? it?.product?.name ?? "")
                .filter(Boolean)
                .join(", ") || "No items"}
            </p>
            <p className="text-sm text-gray-600">
              Items: {(shopOrderData?.shopOrderItems || []).length}
            </p>

            <p>
              <span>Delivery address:</span>{" "}
              {currentOrder?.order?.deliveryAddress.text ?? "N/A"}
            </p>

            <p className="text-sm text-gray-600">
              Subtotal: ₹{shopOrderData?.subtotal ?? 0}
            </p>

            {shopOrderData?.status !== "Delivered" ? (
              <>
                {assignedDB ? (
                  <div className="text-sm text-gray-700">
                    <p className="font-semibold">
                      Delivery Boy Name: {assignedDB?.fullName}
                    </p>
                    <p className="font-semibold">
                      Delivery Boy Contact: {assignedDB?.mobile}
                    </p>
                  </div>
                ) : (
                  <p className="font-semibold">No delivery boy assigned yet</p>
                )}
              </>
            ) : (
              <p className="text-green-600 font-semibold">Order Delivered</p>
            )}

            {/* Render tracking only when assignedDeliveryBoy exists and order not delivered */}
            {assignedDB && currentOrder?.order?.status !== "Delivered" && (
              <div>
                <DeliveryBoyTracking
                  data={{
                    deliveryAddress: {
                      lat: deliveryAddrLat,
                      lng: deliveryAddrLng,
                    },
                    deliveryBoyLocation: { lat: dbLat, lng: dbLng },
                  }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default TrackOrderPage;
