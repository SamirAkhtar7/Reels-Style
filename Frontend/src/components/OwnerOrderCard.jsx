import React from "react";
import { MdPhone } from "react-icons/md";
import { useState } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { updateOrderStatus } from "../redux/user.slice";
import { FaPhoneAlt } from "react-icons/fa";
/**
 * OwnerOrderCard
 * - Renders order details for owners
 * - Iterates order.shopOrder[] and renders each shop block once
 * - Handles both populated product (item.product) and denormalized item fields
 */

const SafeImg = ({ src, alt }) => {
  const fallback =
    "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='200'><rect width='100%' height='100%' fill='%23f3f4f6'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%23999' font-size='12'>No image</text></svg>";
  return (
    // eslint-disable-next-line jsx-a11y/img-redundant-alt
    <img
      src={src || fallback}
      alt={alt || "image"}
      className="w-full h-full object-cover"
      onError={(e) => {
        e.currentTarget.src = fallback;
      }}
    />
  );
};

const OwnerOrderCard = ({ order }) => {
  const dispatch = useDispatch();

  const [availableDeliveryBoys, setAvailableDeliveryBoys] = useState([]);
  console.log(" OrderCard order:", order);
  if (!order) return null;

  //console.log("Order in OwnerOrderCard:", availableDeliveryBoys);
  const handleUpdateStatus = async (orderId, shopId, status) => {
    try {
      const response = await axios.post(
        `/api/order/update-order-status/${orderId}/${shopId}`,
        { status },
        { withCredentials: true }
      );

      dispatch(updateOrderStatus({ orderId, shopId, status }));

      setAvailableDeliveryBoys(response?.data?.availableDeliveryboys);
      //console.log("Status updated:", response.data);
      //console.log("Available Delivery", availableDeliveryBoys.length);
    } catch (err) {
      console.error("Update status error:", err);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 space-y-4">
      {/* header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">
            {order?.user?.fullName ?? "Customer"}
          </h3>
          <p className="text-sm text-gray-500">{order?.user?.email}</p>
          <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
            <MdPhone /> <span>{order?.user?.mobile ?? "N/A"}</span>
          </p>
        </div>

        <div className="text-sm text-gray-600">
          <div className="mb-1">
            {order?.deliveryAddress?.text ?? "No address"}
          </div>
          <div className="text-xs text-gray-400">
            Lat: {order?.deliveryAddress?.latitude ?? "N/A"} • Lon:{" "}
            {order?.deliveryAddress?.longitude ?? "N/A"}
          </div>
        </div>
      </div>

      {/* shops + items */}
      <div className="space-y-4">
        {Array.isArray(order?.shopOrder) && order.shopOrder.length > 0 ? (
          order.shopOrder.map((shopEntry, si) => {
            const items =
              Array.isArray(shopEntry?.shopOrderItems) &&
              shopEntry.shopOrderItems.length > 0
                ? shopEntry.shopOrderItems
                : [];
            return (
              <div
                key={shopEntry._id ?? si}
                className="border rounded-lg p-4 bg-[#fffaf7]"
              >
                <div className="flex gap-3 flex-wrap">
                  {items.length > 0 ? (
                    items.map((it, idx) => {
                      const product = it?.product ?? {};
                      const img = product?.image ?? it?.image ?? "";
                      const title = it?.name ?? product?.name ?? "Item";
                      const qty = it?.quantity ?? 0;
                      const price = it?.price ?? product?.price ?? 0;

                      return (
                        <div
                          key={it._id ?? product?._id ?? idx}
                          className="w-36 bg-white border rounded-lg overflow-hidden shadow-sm"
                        >
                          <div className="w-full h-28 bg-gray-50">
                            <SafeImg src={img} alt={title} />
                          </div>
                          <div className="p-2">
                            <div className="text-sm font-medium truncate">
                              {title}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              Qty: {qty} × ₹{price}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-sm text-gray-500">No items</div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-sm text-gray-500">No shops in this order</div>
        )}
      </div>

      <div className="flex justify-between items-centermt-auto pt-3 border-t border-gray-100 ">
        <div className=" flex w-full justify-between items-center text-mb font-semibold ">
          <div>
            <span className="text-md ">
              status:
              <span className=" ml-1 font-semibold capitalize text-[#ff4d2d]">
                {order?.status}
              </span>
            </span>
          </div>

          <div>
            <select
              onChange={(e) =>
                handleUpdateStatus(
                  order._id,
                  order.shopOrder[0].Shop._id,
                  e.target.value
                )
              }
              // value={order?.status}
              className="rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
            >
              <option value="">Change</option>
              <option value="Pending">Pending</option>
              {/* <option value="Accepted">Accepted</option> */}
              <option value="Prepared">Prepared</option>
              <option value="Out of delivery">Out of delivery</option>
            </select>
          </div>
        </div>
      </div>

      {order.status === "Out of delivery" && (
        <div className="mt-3 p-2 border rounded-lg text-sm bg-orange-50">
          {order.shopOrder[0].assignedDeliveryBoy ? (
            <p>Assigned Delivery Boys:</p>
          ) : (
            <p>Available Delivary Boys:</p>
          )}{" "}
          {availableDeliveryBoys?.length > 0 ? (
            availableDeliveryBoys.map((delivaryboy, index) => (
              <div
                className="text-gray-500"
                key={delivaryboy?.id ?? delivaryboy?._id ?? index}
              >
                <p>
                  {delivaryboy?.name} - {delivaryboy?.mobile}
                </p>
              </div>
            ))
          ) : order?.shopOrder?.[0]?.assignedDeliveryBoy ? (
            <div className="text-gray-500">
              <p>
                Assigned: {order.shopOrder[0].assignedDeliveryBoy.fullName} -{" "}
                {order.shopOrder[0].assignedDeliveryBoy.mobile}
              </p>
            </div>
          ) : (
            <p className="text-gray-500">No delivery boys available</p>
          )}
        </div>
      )}

      <div className="text-right font-bold text-lg">
        Total: ₹{order?.totalAmount ?? 0}
      </div>
    </div>
  );
};

export default OwnerOrderCard;
