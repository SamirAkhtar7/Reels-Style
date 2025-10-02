import React from "react";

const UserOrderCard = ({ order }) => {
  if (!order) return null;

  return (
    <div className="bg-white rounded-lg shadow p-4 space-y-4">
      <div className="flex justify-between border-b pb-2">
        <div>
          <p className="font-semibold text-start">
            Order #{String(order?._id ?? "").slice(-6)}
          </p>
          <p className="text-sm text-gray-500">
            Date:{" "}
            {order?.createdAt
              ? new Date(order.createdAt).toLocaleString()
              : "N/A"}
          </p>
        </div>

        <div className="text-end">
          <p className="font-semibold">
            {(order?.paymentMethod ?? "").toUpperCase()}
          </p>
          <p className="text-sm text-gray-500">
            Status:{" "}
            <span className="text-rose-600 font-semibold">
              {order?.status ?? "N/A"}
            </span>
          </p>
        </div>
      </div>

      <div>
        {Array.isArray(order?.shopOrder) && order.shopOrder.length > 0 ? (
          order.shopOrder.map((shopEntry, idx) => {
            const shopName = shopEntry?.Shop?.name ?? "Shop Name";
            return (
              <div
                className="border rounded-lg p-3 bg-[#fffaf7] space-y-2"
                key={shopEntry._id ?? idx}
              >
                <p className="font-medium">{shopName}</p>

                {Array.isArray(shopEntry?.shopOrderItems) &&
                shopEntry.shopOrderItems.length > 0 ? (
                  shopEntry.shopOrderItems.map((it, i) => {
                    const itemName = it?.name ?? it?.product?.name ?? "Item";
                    return (
                      <div
                        className="flex justify-between text-sm"
                        key={it._id ?? it.product?._id ?? i}
                      >
                        <div className="truncate">{itemName}</div>
                        <div className="text-right text-gray-700">
                          <div>Qty: {it.quantity}</div>
                          <div>₹{it.price}</div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-sm text-gray-500">No items</div>
                )}

                <div className="text-right font-semibold">
                  Subtotal: ₹{shopEntry?.subtotal ?? 0}
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-sm text-gray-500">No shops in this order</div>
        )}
      </div>
    </div>
  );
};

export default UserOrderCard;
